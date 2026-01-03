# Sim Companies Market Data Collection Script
# Fetches all market prices for quality 0 items

param(
    [string]$OutputPath = "..\raw_data\misc\all-market-prices.csv",
    [string]$Realm = "0",
    [int]$Quality = 0
)

Write-Host "=== Sim Companies All Market Prices Collector ===" -ForegroundColor Cyan
Write-Host "Collecting all quality $Quality market prices..." -ForegroundColor Gray
Write-Host ""

# Resource ID list (all tradeable resources in SimCompanies)
$resourceIds = 1..130

$results = @()
$successCount = 0
$failCount = 0

Write-Host "Fetching prices for $($resourceIds.Count) resources..." -ForegroundColor Yellow

foreach ($resourceId in $resourceIds) {
    try {
        $url = "https://api.simcotools.com/v1/realms/$Realm/market/prices/$resourceId/$Quality"
        $response = Invoke-RestMethod -Uri $url -Method Get -ErrorAction Stop
        
        $lastPrice = if ($response.prices -and $response.prices.Count -gt 0) {
            $response.prices[0].price
        } else { 0 }
        
        if ($lastPrice -gt 0) {
            $results += [PSCustomObject]@{
                Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
                ResourceId = $resourceId
                Quality = $Quality
                Price = $lastPrice
            }
            $successCount++
            Write-Host "  Resource $resourceId : `$$lastPrice" -ForegroundColor Green
        }
        
        Start-Sleep -Milliseconds 600
    }
    catch {
        $failCount++
        Write-Host "  Resource $resourceId : Failed" -ForegroundColor DarkGray
    }
}

Write-Host ""
Write-Host "=== Collection Complete ===" -ForegroundColor Cyan
Write-Host "Success: $successCount" -ForegroundColor Green
Write-Host "Failed: $failCount" -ForegroundColor Red
Write-Host ""

if ($results.Count -gt 0) {
    $results | Export-Csv -Path $OutputPath -NoTypeInformation -Encoding ASCII
    Write-Host "Data exported to: $OutputPath" -ForegroundColor Green
    Write-Host "Total records: $($results.Count)" -ForegroundColor Cyan
} else {
    Write-Host "No data collected!" -ForegroundColor Red
}

Write-Host ""
