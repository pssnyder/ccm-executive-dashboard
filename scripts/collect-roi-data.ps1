# SimCompanies Market Data Collection Script
# Collects: Exchange prices, Retail data, Production costs, Worker wages, Building info

param(
    [string]$Realm = "0",  # 0 = Earth/R1, 1 = Titan/R2, 2 = Ares/R3
    [string]$OutputCsv = "market-analysis-$(Get-Date -Format 'yyyy-MM-dd-HHmm').csv",
    [string]$TransportCostsCsv = "transport_costs.csv"  # Your existing transport costs
)

$ApiBase = "https://api.simcotools.com/v1"
Write-Host "`n=== SimCompanies ROI Analysis Data Collection ===" -ForegroundColor Cyan
Write-Host "Realm: $Realm (0=Earth, 1=Titan, 2=Ares)" -ForegroundColor Gray
Write-Host ""

# Step 1: Fetch Market Prices
Write-Host "[1/3] Fetching market prices..." -ForegroundColor Yellow
$priceData = Invoke-RestMethod -Uri "$ApiBase/realms/$Realm/market/prices"
$priceMap = @{}
foreach ($p in $priceData.prices) {
    $key = "$($p.resourceId)_Q$($p.quality)"
    if (-not $priceMap.ContainsKey($key) -or $p.datetime -gt $priceMap[$key].datetime) {
        $priceMap[$key] = $p
    }
}
Write-Host "  ✓ Fetched $($priceData.prices.Count) price records" -ForegroundColor Green

# Step 2: Fetch Resources with Retail Info
Write-Host "[2/3] Fetching resources and retail data..." -ForegroundColor Yellow
$page = 1
$allResources = @()
do {
    $pageParam = "page=$page"
    $sizeParam = "pageSize=50"
    $url = "$ApiBase/realms/$Realm/resources?$pageParam" + [char]38 + $sizeParam
    $resourceData = Invoke-RestMethod -Uri $url
    $allResources += $resourceData.resources
    $page++
} while ($page -le $resourceData.metadata.lastPage)
Write-Host "  ✓ Fetched $($allResources.Count) resources" -ForegroundColor Green

# Step 3: Load your existing transport costs
$transportCosts = @{}
if (Test-Path $TransportCostsCsv) {
    Write-Host "[3/3] Loading transport costs..." -ForegroundColor Yellow
    Import-Csv $TransportCostsCsv | ForEach-Object {
        $transportCosts[$_.commodity] = [decimal]$_.transport_cost_per_unit
    }
    Write-Host "  ✓ Loaded $($transportCosts.Count) transport costs" -ForegroundColor Green
} else {
    Write-Host "[3/3] Transport costs file not found, using defaults" -ForegroundColor Yellow
}

# Build analysis dataset
Write-Host "`nBuilding ROI analysis dataset..." -ForegroundColor Yellow
$analysisData = @()

foreach ($resource in $allResources | Where-Object { $_.retailInfo }) {
    foreach ($retail in $resource.retailInfo) {
        # Parse retail info (it comes as string, need to extract values)
        $qualityMatch = [regex]::Match($retail, 'quality=(\d+)')
        $avgPriceMatch = [regex]::Match($retail, 'averagePrice=([\d.]+)')
        $wagesMatch = [regex]::Match($retail, 'salesWages=([\d.]+)')
        $unitsPerHourMatch = [regex]::Match($retail, 'modeledUnitsSoldAnHour=([\d.]+)')
        
        if ($qualityMatch.Success) {
            $quality = [int]$qualityMatch.Groups[1].Value
            $avgRetailPrice = if ($avgPriceMatch.Success) { [decimal]$avgPriceMatch.Groups[1].Value } else { 0 }
            $salesWages = if ($wagesMatch.Success) { [decimal]$wagesMatch.Groups[1].Value } else { 0 }
            $unitsSoldPerHour = if ($unitsPerHourMatch.Success) { [decimal]$unitsPerHourMatch.Groups[1].Value } else { 0 }
            
            # Get exchange price for this quality
            $priceKey = "$($resource.id)_Q$quality"
            $exchangePrice = if ($priceMap.ContainsKey($priceKey)) { [decimal]$priceMap[$priceKey].price } else { 0 }
            
            # Get transport cost
            $transportCost = if ($transportCosts.ContainsKey($resource.name)) { 
                $transportCosts[$resource.name] 
            } else { 
                [decimal]$resource.transportation 
            }
            
            # Calculate ROI metrics
            $totalCost = $exchangePrice + $transportCost
            $margin = $avgRetailPrice - $totalCost
            $roi = if ($totalCost -gt 0) { ($margin / $totalCost) * 100 } else { 0 }
            
            # Revenue per hour = (avg_retail_price - wages_per_unit) * units_sold_per_hour
            $wagesPerUnit = if ($unitsSoldPerHour -gt 0) { $salesWages / $unitsSoldPerHour } else { 0 }
            $revenuePerHour = ($avgRetailPrice - $wagesPerUnit) * $unitsSoldPerHour
            
            $analysisData += [PSCustomObject]@{
                ResourceId = $resource.id
                Commodity = $resource.name
                Quality = $quality
                Date = (Get-Date -Format 'yyyy-MM-dd')
                Priority = if ($roi -gt 100) { 'High' } elseif ($roi -gt 50) { 'Medium' } else { 'Low' }
                ExchangePrice = [math]::Round($exchangePrice, 2)
                AvgRetailPrice = [math]::Round($avgRetailPrice, 2)
                TransportCost = [math]::Round($transportCost, 2)
                TotalCost = [math]::Round($totalCost, 2)
                Margin = [math]::Round($margin, 2)
                ROI_Percent = [math]::Round($roi, 2)
                ProductionWagesPerHour = [math]::Round($resource.wages, 2)
                SalesWagesPerHour = [math]::Round($salesWages, 2)
                UnitsSoldPerHour = [math]::Round($unitsSoldPerHour, 2)
                RevenuePerHour = [math]::Round($revenuePerHour, 2)
                ProductionUnitsPerHour = [math]::Round($resource.producedAnHour, 2)
                WorkerCostPerUnit = if ($resource.producedAnHour -gt 0) { 
                    [math]::Round($resource.wages / $resource.producedAnHour, 2) 
                } else { 0 }
            }
        }
    }
}

# Export to CSV
$analysisData | Sort-Object ROI_Percent -Descending | Export-Csv -Path $OutputCsv -NoTypeInformation
Write-Host "  ✓ Exported $($analysisData.Count) opportunities to $OutputCsv" -ForegroundColor Green

# Display top opportunities
Write-Host "`n=== TOP 10 ROI OPPORTUNITIES ===" -ForegroundColor Cyan
$analysisData | Sort-Object ROI_Percent -Descending | Select-Object -First 10 | Format-Table `
    Commodity, Quality, ExchangePrice, AvgRetailPrice, Margin, ROI_Percent, RevenuePerHour -AutoSize

Write-Host "`nComplete! Import $OutputCsv into your Commodity Analysis Google Sheet" -ForegroundColor Green
Write-Host ""
