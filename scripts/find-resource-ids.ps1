# Resource ID Diagnostic - Find all valid resource IDs and their names

param([string]$Realm = "0")

Write-Host "`n=== Resource ID Diagnostic ===" -ForegroundColor Cyan

$validResources = @()
$missingIds = @()

1..160 | ForEach-Object {
    $id = $_
    try {
        $response = Invoke-RestMethod -Uri "https://api.simcotools.com/v1/realms/$Realm/resources/$id" -ErrorAction Stop
        $validResources += [PSCustomObject]@{
            ID = $id
            Name = $response.resource.name
        }
        Write-Host "  $id : $($response.resource.name)" -ForegroundColor Green
        Start-Sleep -Milliseconds 600
    }
    catch {
        $missingIds += $id
        Write-Host "  $id : NOT FOUND" -ForegroundColor DarkGray
        Start-Sleep -Milliseconds 100
    }
}

Write-Host "`n=== Summary ===" -ForegroundColor Cyan
Write-Host "Valid resources: $($validResources.Count)" -ForegroundColor Green
Write-Host "Missing IDs: $($missingIds -join ', ')" -ForegroundColor Yellow

$validResources | Export-Csv -Path "..\raw_data\misc\resource-id-map.csv" -NoTypeInformation
Write-Host "`nResource map saved to resource-id-map.csv" -ForegroundColor Green
