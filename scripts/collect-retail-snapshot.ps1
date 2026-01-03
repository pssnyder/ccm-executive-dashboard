# Retail Data Snapshot - Retail Prices and Sales
# Pull all quality 0 retail prices for pasting into Retail Data Historical

param(
    [string]$OutputPath = "..\raw_data\misc\retail-snapshot.csv",
    [string]$Realm = "0",
    [int]$Quality = 0
)

Write-Host "`n=== Retail Data Snapshot ===" -ForegroundColor Cyan
Write-Host "Collecting retail prices and sales data..." -ForegroundColor Gray

# Only retail products (products that can be sold in stores)
$resourceIds = @(3,4,5,7,8,9,11,12,24,25,26,27,28,53,54,55,56,57,60,61,62,63,64,65,67,70,71,98,102,103,108,109,110,119,122,123,124,125,126,127,140,144,146,147,148,150,151,152,153,154)
$results = @()

foreach ($resourceId in $resourceIds) {
    try {
        $response = Invoke-RestMethod -Uri "https://api.simcotools.com/v1/realms/$Realm/resources/$resourceId" -ErrorAction Stop
        
        $resource = $response.resource
        $retailInfo = $resource.retailInfo | Where-Object { $_.quality -eq $Quality } | Select-Object -First 1
        
        if ($retailInfo) {
            $results += [PSCustomObject]@{
                ResourceId = $resourceId
                Name = $resource.name
                Quality = $Quality
                AverageRetailPrice = $retailInfo.averagePrice
                UnitsSoldPerHour = $retailInfo.modeledUnitsSoldAnHour
                Datetime = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.ffffffZ")
            }
            
            Write-Host "  $($resource.name) : Retail `$$($retailInfo.averagePrice) | $($retailInfo.modeledUnitsSoldAnHour) units/hr" -ForegroundColor Green
        }
        
        Start-Sleep -Milliseconds 600
    }
    catch { }
}

Write-Host ""
Write-Host "=== Snapshot Complete ===" -ForegroundColor Cyan
Write-Host "Collected: $($results.Count) retail products" -ForegroundColor Green

$results | Export-Csv -Path $OutputPath -NoTypeInformation -Encoding UTF8
Write-Host "`nSaved to: $OutputPath" -ForegroundColor Green
Write-Host "Paste into 'Retail Data Historical' sheet" -ForegroundColor Yellow
Write-Host ""
