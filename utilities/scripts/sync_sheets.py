"""
Google Sheets to PostgreSQL Sync Script
Pulls data from Google Sheets and loads into PostgreSQL for analysis
"""

import os
import json
from datetime import datetime
import pandas as pd
import psycopg2
from psycopg2.extras import execute_values
from google.oauth2 import service_account
from googleapiclient.discovery import build

# Configuration
SHEET_ID = os.getenv('VITE_GOOGLE_SHEET_ID', '1JD5VBH3S4ZRg1bzyoBIqANPvl1yKcNQqPN_aKPlm1lU')
SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']

# PostgreSQL connection
DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'nocodb',
    'user': 'postgres',
    'password': 'postgres'
}

# Sheet mappings
SHEETS_TO_SYNC = {
    'Balance Sheet Historical': 'balance_sheet',
    'Income Statement Historical': 'income_statement',
    'Cashflow Statement Historical': 'cashflow_statement',
    'Economic Phases Historical': 'economic_phases',
    'Financial Ratios Historical': 'financial_ratios',
    'Government Orders Historical': 'government_orders',
    'Random Events Historical': 'random_events',
    'CCM Overview Historical': 'ccm_overview',
    'Warehouse Current': 'warehouse',
    'Transaction History': 'transactions'
}


def get_sheets_service():
    """Initialize Google Sheets API service"""
    # For local development, use API key
    # For production, use service account JSON
    api_key = os.getenv('VITE_GOOGLE_SHEETS_API_KEY')
    if api_key:
        service = build('sheets', 'v4', developerKey=api_key)
    else:
        creds = service_account.Credentials.from_service_account_file(
            'service-account.json', scopes=SCOPES)
        service = build('sheets', 'v4', credentials=creds)
    return service


def fetch_sheet_data(service, sheet_name):
    """Fetch data from a specific sheet"""
    try:
        result = service.spreadsheets().values().get(
            spreadsheetId=SHEET_ID,
            range=sheet_name
        ).execute()
        
        values = result.get('values', [])
        if not values:
            print(f"No data found in {sheet_name}")
            return None
        
        # Convert to DataFrame
        headers = values[0]
        data = values[1:]
        df = pd.DataFrame(data, columns=headers)
        
        print(f"✓ Fetched {len(df)} rows from {sheet_name}")
        return df
        
    except Exception as e:
        print(f"✗ Error fetching {sheet_name}: {e}")
        return None


def create_table_if_not_exists(conn, table_name, df):
    """Create PostgreSQL table from DataFrame schema"""
    cursor = conn.cursor()
    
    # Generate CREATE TABLE statement
    columns = []
    for col in df.columns:
        # Simple type inference
        col_name = col.lower().replace(' ', '_').replace('-', '_').replace('(', '').replace(')', '').replace('%', 'pct')
        col_type = 'TEXT'  # Default to TEXT, can enhance with type detection
        columns.append(f'"{col_name}" {col_type}')
    
    create_stmt = f'''
        CREATE TABLE IF NOT EXISTS {table_name} (
            id SERIAL PRIMARY KEY,
            {', '.join(columns)},
            synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    '''
    
    cursor.execute(create_stmt)
    conn.commit()
    cursor.close()
    print(f"✓ Table {table_name} ready")


def sync_data_to_postgres(df, table_name):
    """Load DataFrame into PostgreSQL"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        
        # Create table if needed
        create_table_if_not_exists(conn, table_name, df)
        
        # Truncate and reload (simple strategy)
        cursor = conn.cursor()
        cursor.execute(f"TRUNCATE TABLE {table_name} RESTART IDENTITY")
        
        # Prepare data
        columns = [col.lower().replace(' ', '_').replace('-', '_').replace('(', '').replace(')', '').replace('%', 'pct') 
                   for col in df.columns]
        values = [tuple(row) for row in df.values]
        
        # Insert data
        insert_stmt = f'''
            INSERT INTO {table_name} ({', '.join([f'"{col}"' for col in columns])})
            VALUES %s
        '''
        execute_values(cursor, insert_stmt, values)
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print(f"✓ Loaded {len(df)} rows into {table_name}")
        return True
        
    except Exception as e:
        print(f"✗ Error syncing {table_name}: {e}")
        return False


def main():
    """Main sync process"""
    print("=== CCM Data Sync: Google Sheets → PostgreSQL ===")
    print(f"Started at {datetime.now()}\n")
    
    # Initialize Google Sheets service
    service = get_sheets_service()
    
    # Sync each sheet
    success_count = 0
    for sheet_name, table_name in SHEETS_TO_SYNC.items():
        print(f"\nSyncing {sheet_name}...")
        
        # Fetch from Google Sheets
        df = fetch_sheet_data(service, sheet_name)
        if df is None:
            continue
        
        # Load to PostgreSQL
        if sync_data_to_postgres(df, table_name):
            success_count += 1
    
    print(f"\n=== Sync Complete ===")
    print(f"Successfully synced {success_count}/{len(SHEETS_TO_SYNC)} sheets")
    print(f"Finished at {datetime.now()}")


if __name__ == "__main__":
    main()
