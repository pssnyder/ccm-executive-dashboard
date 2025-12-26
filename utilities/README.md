# CCM Executive Dashboard - Data Utilities

Professional data exploration and analytics stack for Sim Companies strategic analysis.

## 🎯 Purpose

This utilities suite provides investment-grade data analysis tools:
- **Data Management**: Easy editing and input via NocoDB
- **Visualization**: Professional BI dashboards with Metabase  
- **Custom Calculations**: Python/Jupyter for advanced analytics
- **AI Exploration**: Integrated data analysis assistant

## 🏗️ Architecture

```
Google Sheets (Source of Truth)
        ↓
    NocoDB (Data Management & Input)
        ↓
    PostgreSQL (Data Warehouse)
        ↓
    Metabase (BI & Visualization)
        ↓
    Jupyter (Custom Analytics)
```

## 🚀 Quick Start

### Prerequisites
- Docker Desktop installed and running
- Python 3.11+ (for standalone scripts)
- Google Sheets API credentials (already configured)

### 1. Start the Stack

```powershell
cd utilities
docker-compose up -d
```

### 2. Access Tools

| Tool | URL | Purpose |
|------|-----|---------|
| **NocoDB** | http://localhost:8080 | Data management UI |
| **Metabase** | http://localhost:3000 | BI dashboards |
| **Jupyter Lab** | http://localhost:8888 | Python notebooks |
| **PostgreSQL** | localhost:5432 | Data warehouse |

### 3. Initial Setup

#### NocoDB Setup
1. Open http://localhost:8080
2. Create admin account
3. Connect to Google Sheets:
   - New Project → "CCM Analytics"
   - Add Data Source → Google Sheets
   - Use OAuth or Service Account credentials
4. Import your existing sheets

#### Metabase Setup
1. Open http://localhost:3000
2. Create admin account
3. Add database connection:
   - Type: PostgreSQL
   - Host: postgres
   - Port: 5432
   - Database: nocodb (or create new)
   - Username: postgres
   - Password: postgres

#### Jupyter Setup
1. Open http://localhost:8888
2. Notebooks auto-saved in `./notebooks/`
3. Pre-installed libraries: pandas, numpy, matplotlib, seaborn, scikit-learn

## 📊 Workflow

### Data Input Flow
```
1. Update Google Sheets (manual or automated)
2. NocoDB syncs data automatically
3. Metabase refreshes dashboards
4. Jupyter notebooks can query latest data
```

### Custom Calculations Flow
```
1. Create Jupyter notebook in ./notebooks/
2. Load data from Google Sheets API
3. Perform calculations
4. Save results to PostgreSQL
5. Visualize in Metabase
```

## 📁 Directory Structure

```
utilities/
├── docker-compose.yml       # Service orchestration
├── init-db.sql             # Database initialization
├── notebooks/              # Jupyter notebooks
│   ├── 01_data_exploration.ipynb
│   ├── 02_economic_modeling.ipynb
│   └── 03_profit_optimization.ipynb
├── scripts/                # Python automation scripts
│   ├── sync_sheets.py      # Google Sheets → PostgreSQL
│   ├── calculate_metrics.py
│   └── export_reports.py
├── data/                   # Local data cache
└── config/                 # Tool configurations
```

## 🔧 Configuration

### Google Sheets Integration

The stack uses your existing `.env` credentials:
```bash
VITE_GOOGLE_SHEET_ID=1JD5VBH3S4ZRg1bzyoBIqANPvl1yKcNQqPN_aKPlm1lU
VITE_GOOGLE_SHEETS_API_KEY=AIzaSyCgfUs2PY9ELEzVsFd1shxs8-D5jDIzyN8
```

### Database Credentials

**PostgreSQL**:
- Host: localhost:5432
- User: postgres
- Password: postgres

**NocoDB Database**:
- Database: nocodb
- User: nocodb
- Password: nocodb

**Metabase Database**:
- Database: metabase
- User: metabase
- Password: metabase

## 💡 Use Cases

### 1. Advanced Economic Modeling
Create predictive models for economic cycle impacts using Jupyter:
```python
import pandas as pd
from sklearn.linear_model import LinearRegression

# Load economic phases
phases = pd.read_sql("SELECT * FROM economic_phases", conn)

# Build model to predict revenue impact
# ... your analysis
```

### 2. Custom Financial Ratios
Calculate proprietary metrics not available in-game:
```python
# Calculate Compound Annual Growth Rate (CAGR)
# Calculate Risk-Adjusted Returns
# Model optimal production schedules
```

### 3. Interactive Dashboards
Build executive dashboards in Metabase:
- Real-time KPI monitoring
- Drill-down analysis
- Automated reporting
- Alert triggers

### 4. What-If Scenarios
Use Jupyter to model scenarios:
- "What if I expand to 5 more buildings?"
- "Impact of hiring 200 more workers?"
- "Optimal pricing strategy analysis"

## 🤖 AI Integration

### Option 1: Local LLM (Recommended for privacy)
```powershell
# Install Ollama
winget install Ollama.Ollama

# Pull a model
ollama pull llama2

# Use in Jupyter
import ollama
response = ollama.chat(model='llama2', messages=[...])
```

### Option 2: Cloud AI
- OpenAI API for GPT-4 analysis
- Claude API for complex reasoning
- Integrate via Python in Jupyter

## 🛠️ Management Commands

```powershell
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f [service-name]

# Restart a service
docker-compose restart [service-name]

# Backup database
docker-compose exec postgres pg_dump -U postgres nocodb > backup.sql

# Restore database
docker-compose exec -T postgres psql -U postgres nocodb < backup.sql
```

## 🔐 Security Notes

⚠️ **This setup is for LOCAL DEVELOPMENT ONLY**

For production deployment:
- Change all default passwords
- Enable SSL/TLS
- Set up proper authentication
- Use environment variables for secrets
- Configure firewall rules

## 📚 Next Steps

1. **Set up NocoDB** - Create tables mirroring your Google Sheets
2. **Build Metabase dashboards** - Start with key financial metrics
3. **Create first Jupyter notebook** - Explore economic cycle patterns
4. **Automate data sync** - Schedule Python scripts to refresh data
5. **Develop custom metrics** - Calculate proprietary business intelligence

## 🎓 Learning Resources

- [NocoDB Documentation](https://docs.nocodb.com/)
- [Metabase Documentation](https://www.metabase.com/docs/latest/)
- [Jupyter Documentation](https://jupyter.org/documentation)
- [Pandas User Guide](https://pandas.pydata.org/docs/user_guide/index.html)

## 🐛 Troubleshooting

**Services won't start?**
- Ensure Docker Desktop is running
- Check port conflicts (3000, 5432, 8080, 8888)
- Run `docker-compose logs` to see errors

**Can't connect to PostgreSQL?**
- Wait 30s after first start for initialization
- Verify credentials in pgAdmin or DBeaver

**NocoDB won't sync Google Sheets?**
- Check Google API quotas
- Verify service account permissions
- Enable Google Sheets API in Cloud Console

---

*Built for professional-grade business intelligence and strategic analysis*
