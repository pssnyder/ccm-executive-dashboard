# Retail Data Downloader
# Downloads retail-specific data: average prices, sales wages, units sold per hour

param(
    [string]$Realm = "0",
    [string]$OutputFile = "retail-data-$(Get-Date -Format 'yyyy-MM-dd-HHmm').csv"
)

Write-Host "Downloading retail data from Realm $Realm..." -ForegroundColor Cyan

$page = 1
$allRetailData = @()

do {
    $url = "https://api.simcotools.com/v1/realms/$Realm/resources?page=$page" + [char]38 + "pageSize=50"
    Write-Host "  Fetching page $page..." -ForegroundColor Gray
    $data = Invoke-RestMethod -Uri $url
    
    foreach ($resource in $data.resources | Where-Object { $_.retailInfo }) {
        foreach ($retail in $resource.retailInfo) {
            # Parse the retail info string
            if ($retail -match 'quality=(\d+)') { $quality = $matches[1] } else { $quality = 0 }
            if ($retail -match 'averagePrice=([\d.]+)') { $avgPrice = $matches[1] } else { $avgPrice = 0 }
            if ($retail -match 'salesWages=([\d.]+)') { $salesWages = $matches[1] } else { $salesWages = 0 }
            if ($retail -match 'modeledUnitsSoldAnHour=([\d.]+)') { $unitsSold = $matches[1] } else { $unitsSold = 0 }
            if ($retail -match 'modeledProductionCostPerUnit=([\d.]+)') { $prodCost = $matches[1] } else { $prodCost = 0 }
            if ($retail -match 'buildingLevelsNeededPerUnitPerHour=([\d.]+)') { $buildingLevels = $matches[1] } else { $buildingLevels = 0 }
            
            $allRetailData += [PSCustomObject]@{
                ResourceId = $resource.id
                Name = $resource.name
                Quality = $quality
                AverageRetailPrice = $avgPrice
                SalesWagesPerHour = $salesWages
                UnitsSoldPerHour = $unitsSold
                ProductionCostPerUnit = $prodCost
                BuildingLevelsNeeded = $buildingLevels
                ProductionWagesPerHour = [math]::Round($resource.wages, 2)
                ProductionUnitsPerHour = [math]::Round($resource.producedAnHour, 2)
                Transportation = $resource.transportation
            }
        }
    }
    
    Start-Sleep -Seconds 2
    $page++
} while ($page -le $data.metadata.lastPage)

$allRetailData | Export-Csv -Path $OutputFile -NoTypeInformation

Write-Host "Exported $($allRetailData.Count) retail opportunities to: $OutputFile" -ForegroundColor Green
