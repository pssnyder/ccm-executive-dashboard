# Market Timing Dashboard - Setup Guide

## 📋 Google Sheets Setup

### 1. Create New Sheet
1. Open your CCM Dashboard Google Sheet
2. Create a new tab named: **`Market Analysis Historical`**
3. This sheet will store your historical price tracking data

### 2. Import Initial Data
1. Run the PowerShell script to collect your first snapshot:
   ```powershell
   cd "S:\Programming\Gaming Projects\Sim Companies Project\ccm-executive-dashboard\scripts"
   .\collect-market-history.ps1
   ```

2. Import the generated CSV to Google Sheets:
   - File location: `raw_data/misc/market-history.csv`
   - In Google Sheets: File → Import → Upload → Select `market-history.csv`
   - Import to: **Market Analysis Historical** sheet
   - Import location: Replace sheet
   - Separator: Comma
   - ✅ Convert text to numbers/dates: YES

### 3. Expected Sheet Structure
```
Columns:
- Timestamp (datetime)
- Date (date)
- ResourceID (number)
- ResourceName (text)
- Quality (number)
- MarketPrice (number)
- AvgRetailPrice (number)
- Saturation (number - percentage as decimal, e.g., 52.15)
```

### 4. Sample Data
```csv
Timestamp,Date,ResourceID,ResourceName,Quality,MarketPrice,AvgRetailPrice,Saturation
2025-12-29 12:13:28,2025-12-29,53,Economy e-car,0,3480,4160.82,52.15
2025-12-29 12:13:28,2025-12-29,11,Petrol,0,42.5,54.02,73.59
2025-12-29 12:13:28,2025-12-29,12,Diesel,0,42.5,53.07,74.91
```

## 🔄 Daily Update Workflow

### Option A: Manual Updates
1. Run script daily:
   ```powershell
   .\collect-market-history.ps1
   ```
2. Re-import CSV to Google Sheets (appends new data)
3. Refresh dashboard: Click "⟳ Sheet Data" button

### Option B: Automated (Recommended)
Set up Windows Task Scheduler to run daily at 3 PM:
```powershell
schtasks /create /tn "CCM Market History" /tr "powershell.exe -File 'S:\Programming\Gaming Projects\Sim Companies Project\ccm-executive-dashboard\scripts\collect-market-history.ps1'" /sc daily /st 15:00
```

Then manually import to Google Sheets weekly.

## 📊 Dashboard Features

### Market Timing Tab
Navigate to: **Market Timing** (new tab between Trade Analysis and Archives)

**Displays:**
1. **Current Market Snapshot Table**
   - All 10 tracked commodities
   - Market price, retail price, margin, ROI
   - Saturation percentage
   - Buy/Hold/Avoid signals

2. **Price Trend Charts**
   - Line charts for each commodity
   - Market price vs. Retail price trends
   - Saturation indicators

3. **Market Intelligence Summary**
   - Count of undersupplied markets (<50% saturation)
   - Count of balanced markets (50-80%)
   - Count of oversaturated markets (>100%)

### Saturation Signal Guide
- **< 40%** = STRONG BUY (Green) - High demand, low supply
- **40-60%** = BUY (Light Green) - Good opportunity
- **60-80%** = HOLD (Yellow) - Balanced market
- **80-100%** = CAUTION (Orange) - Increasing competition
- **> 100%** = AVOID (Red) - Oversaturated market

## 🎯 Strategic Usage

### Identify Best Opportunities
1. **Low Saturation** = Undersupplied market = Higher margins possible
2. **Price Dips** + Low Saturation = Optimal entry point
3. **Track Trends** = Predict economic cycle impacts

### Example Decision Making
**Scenario:** You want to invest $60k in car dealership stock

**Without Market Timing:**
- Buy 20× Economy e-cars @ $3,480 = $69,600
- Saturation unknown
- Price trend unknown

**With Market Timing:**
- Check saturation: 52% = BUY signal ✅
- Wait for price dip from $3,480 → $3,200
- Buy 21.8× Economy e-cars @ $3,200 = $69,760
- Extra margin: $280/unit × 21.8 = **$6,104 additional profit**

### Combine with Economic Phases
1. Track correlation: Does Recession lower car prices?
2. After 30 days of data, identify patterns
3. Create buy rules: "Buy when saturation <50% AND phase=Recession AND price <avg"

## 🛠️ Troubleshooting

### No Data Showing in Dashboard
- **Check:** Did you create the "Market Analysis Historical" sheet?
- **Check:** Did you import the CSV with correct column names?
- **Check:** Did you refresh the dashboard ("⟳ Sheet Data")?

### Saturation Values Look Wrong
- **Expected:** Decimal values like 52.15, 73.59, 171.23
- **Not:** Percentages like 0.52 or 52.15%
- The script multiplies by 100, so Google Sheets should show 52.15 (not 0.5215)

### Script Fails to Run
- **Check:** PowerShell execution policy: `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`
- **Check:** API is accessible: `Invoke-RestMethod -Uri "https://api.simcotools.com/v1/realms/0/market/prices"`

## 📁 File Locations

```
ccm-executive-dashboard/
├── scripts/
│   └── collect-market-history.ps1  ← Run this daily
├── raw_data/
│   └── misc/
│       └── market-history.csv      ← Import this to Google Sheets
└── src/
    └── components/
        └── MarketTiming.jsx        ← Dashboard component
```

## 🎓 Next Steps

1. ✅ Create "Market Analysis Historical" sheet
2. ✅ Run script and import first data
3. ✅ Refresh dashboard to see new tab
4. 📊 Collect 7 days of data to see trends
5. 📈 Collect 30 days of data for seasonal patterns
6. 🎯 Overlay with Economic Phases data
7. 💰 Start timing your stock purchases based on signals

## 💡 Pro Tips

- **Run script 3x daily** (morning, noon, evening) to catch intraday price swings
- **Compare weekdays vs. weekends** to identify cyclical patterns
- **Bulk buy during Recessions** when prices dip and saturation is low
- **Avoid markets with saturation >100%** - too much competition
- **Focus on <50% saturation commodities** for best ROI potential
