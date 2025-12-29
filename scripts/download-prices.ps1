# Simple Market Price Downloader
# Downloads all current market prices to CSV

param(
    [string]$Realm = "0",
    [string]$OutputFile = "market-prices-$(Get-Date -Format 'yyyy-MM-dd-HHmm').csv"
)

Write-Host "Downloading market prices from Realm $Realm..." -ForegroundColor Cyan

$prices = Invoke-RestMethod -Uri "https://api.simcotools.com/v1/realms/$Realm/market/prices"

$prices.prices | Select-Object resourceId, quality, price, datetime | Export-Csv -Path $OutputFile -NoTypeInformation

Write-Host "Exported $($prices.prices.Count) prices to: $OutputFile" -ForegroundColor Green
