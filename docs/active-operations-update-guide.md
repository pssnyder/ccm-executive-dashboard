# Active Operations Sheet Update Guide

## Overview
The Active Operations sheet is being simplified to focus on strategic reference rather than real-time tracking. This removes the time-pressure of constantly updating quantities, revenues, and finish times.

## Changes Required in Google Sheets

### Step 1: Open Your Sheet
1. Open your "Sim Companies SoT" Google Sheets document
2. Navigate to the **"Active Operations Current"** tab

### Step 2: Delete Time-Tracking Columns
Remove these 3 columns:
- **Quantity** - No longer tracking how many units
- **Projected Revenue** - No longer calculating revenue projections  
- **Finish Time** - No longer tracking when operations complete

### Step 3: Keep Strategic Reference Columns
Your final column structure should be:
1. **Name** - Your building name (e.g., "Grocery Store 1", "Gas Station 2")
2. **Building** - Building type (e.g., "Grocery store", "Gas station")
3. **Type** - Operation type (e.g., "RETAIL", "PRODUCTION")
4. **Level** - Building level (e.g., 1, 2, 3)
5. **Product** - What you're selling/making (e.g., "Petrol", "Oranges")

### Step 4: Export Updated CSV
1. File → Download → Comma Separated Values (.csv)
2. Save to: `s:\Programming\Gaming Projects\Sim Companies Project\ccm-executive-dashboard\raw_data\Sim Companies SoT - Active Operations Current.csv`
3. Replace the existing file

## Dashboard Changes

### What's Updated
- **TradeAnalysis.jsx**: Now shows simplified cards with Building Name, Product, and Level
- **googleSheetsService.js**: Updated to parse only the 5 strategic columns
- **Section Title**: Changed from "Active Retail Operations" to "Active Retail Strategy"

### What You'll See
Before:
```
Grocery store
Cheese
Qty: 235
```

After:
```
Grocery Store 1
Cheese
Level 1
```

## Why This Change?

### Old Focus: Real-Time Tracking
- Required constant updates as operations complete
- Duplicated information already in the game
- Created maintenance overhead
- Made sense when managing short production cycles

### New Focus: Strategic Reference  
- Shows WHAT you're selling WHERE
- Helps remember your market analysis decisions
- No time pressure - update when you change strategies
- Better for longer production/sales cycles as company scales
- Dashboard focuses on market analysis, game handles execution

## Example Data

### Before (8 columns):
```csv
Name,Building,Type,Level,Product,Quantity,Projected Revenue,Finish Time
Grocery Store 1,Grocery store,RETAIL,1,Cheese,235,$31958.00,2025-12-31 3:03 PM
Gas Station 1,Gas station,RETAIL,2,Petrol,100,$4655.00,2025-12-30 7:20 PM
```

### After (5 columns):
```csv
Name,Building,Type,Level,Product
Grocery Store 1,Grocery store,RETAIL,1,Cheese
Gas Station 1,Gas station,RETAIL,2,Petrol
```

## Testing

After updating your sheet:
1. Refresh the dashboard
2. Navigate to Trade Analysis section
3. Verify "Active Retail Strategy" shows your stores with products and levels
4. Confirm no errors in browser console

## Next Steps

Once this is complete, we can focus on:
- Market timing analysis using VWAP discount detection
- Budget allocation recommendations
- Portfolio optimization based on saturation data
- Strategic planning for next building investments

The dashboard will shift to help you make better strategic decisions rather than tracking what the game already tracks for you.
