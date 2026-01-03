# Market Data Snapshot - Exchange Prices
# Pull all quality 0 market prices for pasting into Market Data Historical

param(
    [string]$OutputPath = "..\raw_data\misc\market-snapshot.csv",
    [string]$Realm = "0",
    [int]$Quality = 0
)

Write-Host "`n=== Market Data Snapshot ===" -ForegroundColor Cyan
Write-Host "Collecting exchange prices for retailable products..." -ForegroundColor Gray

# Only retail products (products that can be sold in stores)
$resourceIds = @(3,4,5,7,8,9,11,12,24,25,26,27,28,53,54,55,56,57,60,61,62,63,64,65,67,70,71,98,102,103,108,109,110,119,122,123,124,125,126,127,140,144,146,147,148,150,151,152,153,154)
$results = @()

foreach ($resourceId in $resourceIds) {
    try {
        $response = Invoke-RestMethod -Uri "https://api.simcotools.com/v1/realms/$Realm/market/prices/$resourceId/$Quality" -ErrorAction Stop
        
        $lastPrice = if ($response.prices -and $response.prices.Count -gt 0) {
            $response.prices[0].price
        } else { 0 }
        
        # Get resource name from resource endpoint
        $resourceName = "Unknown"
        try {
            $resourceResponse = Invoke-RestMethod -Uri "https://api.simcotools.com/v1/realms/$Realm/resources/$resourceId" -ErrorAction Stop
            $resourceName = $resourceResponse.resource.name
        } catch { }
        
        $results += [PSCustomObject]@{
            ResourceId = $resourceId
            Name = $resourceName
            Quality = $Quality
            MarketPrice = $lastPrice
            Datetime = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.ffffffZ")
        }
        
        if ($lastPrice -gt 0) {
            Write-Host "  $resourceName (ID $resourceId) : `$$lastPrice" -ForegroundColor Green
        }
        
        Start-Sleep -Milliseconds 600
    }
    catch { }
}

Write-Host ""
Write-Host "=== Snapshot Complete ===" -ForegroundColor Cyan
Write-Host "Collected: $($results.Count) resources" -ForegroundColor Green

$results | Export-Csv -Path $OutputPath -NoTypeInformation -Encoding UTF8
Write-Host "`nSaved to: $OutputPath" -ForegroundColor Green
Write-Host "Paste into 'Market Data Historical' sheet" -ForegroundColor Yellow
Write-Host ""
