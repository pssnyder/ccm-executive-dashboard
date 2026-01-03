# Operational Market Data Collection
# Automatically discovers products based on Active Operations buildings
# Fetches exchange price, VWAP, retail data for budget-constrained decision making

param(
    [string]$Realm = "0",
    [string]$ActiveOpsFile = "../raw_data/Sim Companies SoT - Active Operations Current.csv",
    [string]$RetailResearchFile = "../raw_data/Sim Companies SoT - Retail Research.csv",
    [string]$OutputFile = "../raw_data/misc/operational-market-data.csv"
)

Write-Host "`n=== Operational Market Data Collection ===" -ForegroundColor Cyan
Write-Host "Discovering products from your active buildings..." -ForegroundColor Gray

# Step 1: Read Active Operations to get current buildings
if (-not (Test-Path $ActiveOpsFile)) {
    Write-Host "ERROR: Active Operations file not found: $ActiveOpsFile" -ForegroundColor Red
    exit 1
}

$activeOps = Import-Csv $ActiveOpsFile
$uniqueBuildings = $activeOps | Select-Object -ExpandProperty Building -Unique | Where-Object { $_ }

Write-Host "`nYour Active Buildings:" -ForegroundColor Yellow
$uniqueBuildings | ForEach-Object { Write-Host "  - $_" -ForegroundColor Gray }

# Step 2: Read Retail Research to map buildings ? products
if (-not (Test-Path $RetailResearchFile)) {
    Write-Host "ERROR: Retail Research file not found: $RetailResearchFile" -ForegroundColor Red
    exit 1
}

$retailResearch = Import-Csv $RetailResearchFile

# Filter to products that match our buildings (quality 0 only)
$relevantProducts = @()
foreach ($building in $uniqueBuildings) {
    $products = $retailResearch | Where-Object { 
        $_.'Dependent Retail Building' -like "*$building*" -and
        $_.ResourceId -match '^\d+$'
    }
    $relevantProducts += $products
}

# Remove duplicates
$relevantProducts = $relevantProducts | Sort-Object -Property ResourceId -Unique

Write-Host "`nDiscovered $($relevantProducts.Count) products to track:" -ForegroundColor Yellow
$relevantProducts | ForEach-Object { 
    Write-Host "  - $($_.Name) (ID: $($_.ResourceId))" -ForegroundColor Gray 
}

# Step 3: Fetch market data for each product
Write-Host "`nFetching market data from API..." -ForegroundColor Cyan
$timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
$marketData = @()

foreach ($product in $relevantProducts) {
    $resourceId = $product.ResourceId
    $quality = 0
    
    Write-Host "  Processing: $($product.Name) (ID: $resourceId)..." -ForegroundColor Gray
    
    try {
        # Fetch last traded price (exchange price)
        Start-Sleep -Milliseconds 600  # Rate limit: 2 req/sec
        $priceResponse = Invoke-RestMethod -Uri "https://api.simcotools.com/v1/realms/$Realm/market/prices/$resourceId/$quality"
        $lastPrice = if ($priceResponse.prices -and $priceResponse.prices.Count -gt 0) {
            $priceResponse.prices[0].price
        } else { 0 }
        
        # Fetch VWAP
        Start-Sleep -Milliseconds 600
        $vwapResponse = Invoke-RestMethod -Uri "https://api.simcotools.com/v1/realms/$Realm/market/vwaps/$resourceId/$quality"
        $vwap = if ($vwapResponse.vwaps -and $vwapResponse.vwaps.Count -gt 0) {
            $vwapResponse.vwaps[0].vwap
        } else { 0 }
        
        # Fetch resource details for retail info
        Start-Sleep -Milliseconds 600
        $resourceResponse = Invoke-RestMethod -Uri "https://api.simcotools.com/v1/realms/$Realm/resources/$resourceId"
        $resource = $resourceResponse.resource
        
        # Extract retail info for quality 0
        $retailInfo = $resource.retailInfo | Where-Object { $_.quality -eq 0 } | Select-Object -First 1
        
        $avgRetailPrice = if ($retailInfo) { $retailInfo.averagePrice } else { 0 }
        $saturation = if ($retailInfo) { [math]::Round($retailInfo.saturation * 100, 2) } else { 0 }
        $unitsSoldPerHour = if ($retailInfo) { $retailInfo.modeledUnitsSoldAnHour } else { 0 }
        
        # Calculate metrics
        $discountPercent = if ($vwap -gt 0) { 
            [math]::Round((($lastPrice - $vwap) / $vwap) * 100, 2) 
        } else { 0 }
        
        $margin = $avgRetailPrice - $lastPrice
        $roiPercent = if ($lastPrice -gt 0) {
            [math]::Round(($margin / $lastPrice) * 100, 2)
        } else { 0 }
        
        # Count how many of this building type we have
        $buildingType = $product.'Dependent Retail Building'
        $storeCount = ($activeOps | Where-Object { $_.Building -eq $buildingType }).Count
        if ($storeCount -eq 0) { $storeCount = 1 }  # Fallback
        
        # Calculate 24hr requirements
        $unitsFor24hr = [math]::Ceiling($unitsSoldPerHour * 24 * $storeCount)
        $capitalRequired = [math]::Round($lastPrice * $unitsFor24hr, 2)
        $projected24hrProfit = [math]::Round($margin * $unitsSoldPerHour * 24 * $storeCount, 2)
        
        # Determine if "on sale" (exchange price below VWAP)
        $onSale = if ($discountPercent -lt 0) { "Yes" } else { "No" }
        
        $marketData += [PSCustomObject]@{
            Timestamp = $timestamp
            ResourceId = $resourceId
            Name = $product.Name
            BuildingType = $buildingType
            StoreCount = $storeCount
            ExchangePrice = [math]::Round($lastPrice, 2)
            VWAP = [math]::Round($vwap, 4)
            DiscountPercent = $discountPercent
            OnSale = $onSale
            AvgRetailPrice = [math]::Round($avgRetailPrice, 2)
            Margin = [math]::Round($margin, 2)
            ROI_Percent = $roiPercent
            Saturation = $saturation
            UnitsPerHour = [math]::Round($unitsSoldPerHour, 2)
            UnitsFor24hr = $unitsFor24hr
            CapitalRequired = $capitalRequired
            Projected24hrProfit = $projected24hrProfit
        }
        
    } catch {
        Write-Host "    ERROR: Failed to fetch data for $($product.Name): $_" -ForegroundColor Red
    }
}

# Step 4: Export to CSV
$outputDir = Split-Path -Path $OutputFile -Parent
if (-not (Test-Path $outputDir)) { 
    New-Item -ItemType Directory -Force -Path $outputDir | Out-Null 
}

$marketData | Export-Csv -Path $OutputFile -NoTypeInformation
Write-Host "`n? Exported $($marketData.Count) products to: $OutputFile" -ForegroundColor Green

# Display top opportunities
Write-Host "`n=== TOP 5 OPPORTUNITIES (by ROI %) ===" -ForegroundColor Cyan
$marketData | Sort-Object ROI_Percent -Descending | Select-Object -First 5 | Format-Table `
    Name, ExchangePrice, AvgRetailPrice, ROI_Percent, OnSale, CapitalRequired -AutoSize

Write-Host "`n=== ON SALE TODAY (Exchange below VWAP) ===" -ForegroundColor Cyan
$onSaleItems = $marketData | Where-Object { $_.OnSale -eq "Yes" } | Sort-Object DiscountPercent
if ($onSaleItems.Count -gt 0) {
    $onSaleItems | Format-Table Name, ExchangePrice, VWAP, DiscountPercent, ROI_Percent -AutoSize
} else {
    Write-Host "  No items currently on sale" -ForegroundColor Gray
}

Write-Host "`nImport operational-market-data.csv into Google Sheets!" -ForegroundColor Yellow
Write-Host "Create a new sheet and paste the CSV content." -ForegroundColor Gray
Write-Host ""
