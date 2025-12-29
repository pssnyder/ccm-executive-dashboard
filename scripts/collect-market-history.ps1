# collect-market-history.ps1
param([string]$Realm = "0", [string]$OutputFile = "../raw_data/misc/market-history.csv")
Write-Host "Collecting Market Price History..." -ForegroundColor Cyan
$outputDir = Split-Path -Path $OutputFile -Parent
if (-not (Test-Path $outputDir)) { New-Item -ItemType Directory -Force -Path $outputDir | Out-Null }
$focusCommodities = @{53="Economy e-car";54="Luxury e-car";55="Economy car";56="Luxury car";57="Truck";11="Petrol";12="Diesel";3="Apples";4="Oranges";5="Grapes"}
$apiUrl = "https://api.simcotools.com/v1/realms/$Realm/market/prices"
Write-Host "  Fetching market prices..." -ForegroundColor Gray
$response = Invoke-RestMethod -Uri $apiUrl -Method Get
$prices = $response.prices
$timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
$dateOnly = Get-Date -Format 'yyyy-MM-dd'
$focusPrices = $prices | Where-Object { $focusCommodities.ContainsKey($_.resourceId) -and $_.quality -eq 0 }
Write-Host "  Fetching market saturation data..." -ForegroundColor Gray
$records = @()
foreach ($priceData in $focusPrices) {
    $resourceName = $focusCommodities[$priceData.resourceId]
    $resourceId = $priceData.resourceId
    Start-Sleep -Milliseconds 500
    $resourceInfo = Invoke-RestMethod -Uri "https://api.simcotools.com/v1/realms/$Realm/resources/$resourceId"
    $retailInfo = $resourceInfo.resource.retailInfo | Where-Object { $_.quality -eq 0 }
    $saturation = if ($retailInfo.saturation) { [math]::Round($retailInfo.saturation * 100, 2) } else { 0 }
    $avgRetailPrice = if ($retailInfo.averagePrice) { [math]::Round($retailInfo.averagePrice, 2) } else { 0 }
    $record = [PSCustomObject]@{Timestamp=$timestamp;Date=$dateOnly;ResourceID=$resourceId;ResourceName=$resourceName;Quality=$priceData.quality;MarketPrice=[math]::Round($priceData.price,2);AvgRetailPrice=$avgRetailPrice;Saturation=$saturation}
    $records += $record
}
$fileExists = Test-Path $OutputFile
if ($fileExists) {
    $records | Export-Csv -Path $OutputFile -NoTypeInformation -Append
    Write-Host "  Appended $($records.Count) price snapshots" -ForegroundColor Green
} else {
    $records | Export-Csv -Path $OutputFile -NoTypeInformation
    Write-Host "  Created new history file with $($records.Count) price snapshots" -ForegroundColor Green
}
Write-Host "  Saved to: $OutputFile" -ForegroundColor Gray
Write-Host ""
Write-Host "Price Snapshot Summary:" -ForegroundColor Cyan
$records | Format-Table ResourceName, MarketPrice, AvgRetailPrice, Saturation -AutoSize
Start-Sleep -Seconds 0.5
Write-Host ""
Write-Host "Market history collection complete!" -ForegroundColor Green
Write-Host "  Import this CSV to Google Sheets 'Market Analysis Historical' sheet" -ForegroundColor Yellow
