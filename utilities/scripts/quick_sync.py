"""
Quick Setup: Sync Google Sheets to PostgreSQL
Run this first to populate your database with Google Sheets data
"""

import os
import sys

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

# Set environment variables from parent .env
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))

import pandas as pd
import psycopg2
from psycopg2.extras import execute_values
import requests

# Configuration
SHEET_ID = os.getenv('VITE_GOOGLE_SHEET_ID')
API_KEY = os.getenv('VITE_GOOGLE_SHEETS_API_KEY')

DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'nocodb',
    'user': 'postgres',
    'password': 'postgres'
}

# Sheets to sync
SHEETS = {
    'Balance Sheet Historical': 'balance_sheet',
    'Income Statement Historical': 'income_statement',
    'Cashflow Statement Historical': 'cashflow',
    'Economic Phases Historical': 'economic_phases',
    'Financial Ratios Historical': 'financial_ratios',
    'CCM Overview Historical': 'ccm_overview',
    'Warehouse Current': 'warehouse',
}


def fetch_sheet(sheet_name):
    """Fetch sheet data using Google Sheets API"""
    url = f'https://sheets.googleapis.com/v4/spreadsheets/{SHEET_ID}/values/{sheet_name}?key={API_KEY}'
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        
        values = data.get('values', [])
        if not values:
            print(f"⚠️  No data in {sheet_name}")
            return None
        
        # Convert to DataFrame
        headers = values[0]
        rows = values[1:]
        df = pd.DataFrame(rows, columns=headers)
        
        print(f"✓ Fetched {len(df)} rows from {sheet_name}")
        return df
        
    except Exception as e:
        print(f"✗ Error fetching {sheet_name}: {e}")
        return None


def clean_column_name(name):
    """Convert column name to valid PostgreSQL identifier"""
    return (name.lower()
            .replace(' ', '_')
            .replace('-', '_')
            .replace('(', '')
            .replace(')', '')
            .replace('%', 'pct')
            .replace(':', '')
            .replace('.', '_'))


def create_table(conn, table_name, df):
    """Create table from DataFrame"""
    cursor = conn.cursor()
    
    # Create columns
    columns = []
    for col in df.columns:
        col_name = clean_column_name(col)
        columns.append(f'"{col_name}" TEXT')
    
    # Drop existing table
    cursor.execute(f'DROP TABLE IF EXISTS {table_name} CASCADE')
    
    # Create new table
    create_sql = f'''
        CREATE TABLE {table_name} (
            id SERIAL PRIMARY KEY,
            {', '.join(columns)},
            imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    '''
    cursor.execute(create_sql)
    conn.commit()
    cursor.close()


def insert_data(conn, table_name, df):
    """Insert DataFrame into table"""
    cursor = conn.cursor()
    
    # Prepare column names
    columns = [clean_column_name(col) for col in df.columns]
    col_list = ', '.join([f'"{col}"' for col in columns])
    
    # Prepare data
    values = [tuple(row) for row in df.values]
    
    # Insert
    insert_sql = f'INSERT INTO {table_name} ({col_list}) VALUES %s'
    execute_values(cursor, insert_sql, values)
    
    conn.commit()
    cursor.close()
    print(f"✓ Inserted {len(df)} rows into {table_name}")


def main():
    print("=" * 60)
    print("CCM Data Sync: Google Sheets → PostgreSQL")
    print("=" * 60)
    print()
    
    if not SHEET_ID or not API_KEY:
        print("❌ ERROR: Missing environment variables!")
        print("Make sure .env file exists in parent directory with:")
        print("  VITE_GOOGLE_SHEET_ID")
        print("  VITE_GOOGLE_SHEETS_API_KEY")
        return
    
    # Connect to PostgreSQL
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        print("✓ Connected to PostgreSQL\n")
    except Exception as e:
        print(f"❌ Cannot connect to PostgreSQL: {e}")
        print("Make sure Docker containers are running: docker-compose up -d")
        return
    
    # Sync each sheet
    success_count = 0
    for sheet_name, table_name in SHEETS.items():
        print(f"\n📊 Processing: {sheet_name}")
        print("-" * 60)
        
        # Fetch data
        df = fetch_sheet(sheet_name)
        if df is None:
            continue
        
        try:
            # Create table
            create_table(conn, table_name, df)
            
            # Insert data
            insert_data(conn, table_name, df)
            
            success_count += 1
        except Exception as e:
            print(f"✗ Error loading {table_name}: {e}")
    
    conn.close()
    
    print("\n" + "=" * 60)
    print(f"✓ Sync Complete: {success_count}/{len(SHEETS)} sheets synced")
    print("=" * 60)
    print("\nNext steps:")
    print("1. Open NocoDB: http://localhost:8080")
    print("2. Create account and new project")
    print("3. Connect to database:")
    print("   - Type: PostgreSQL")
    print("   - Host: postgres")
    print("   - Port: 5432")
    print("   - Database: nocodb")
    print("   - Username: postgres")
    print("   - Password: postgres")
    print("\nYou'll see all your synced tables!")


if __name__ == '__main__':
    main()
