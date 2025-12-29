# Resource Metadata Downloader
# Downloads resource info: ID, name, wages, production rate, retail availability

param(
    [string]$Realm = "0",
    [string]$OutputFile = "resources-$(Get-Date -Format 'yyyy-MM-dd-HHmm').csv"
)

Write-Host "Downloading resource metadata from Realm $Realm..." -ForegroundColor Cyan

$page = 1
$allResources = @()

do {
    $url = "https://api.simcotools.com/v1/realms/$Realm/resources?page=$page" + [char]38 + "pageSize=50"
    Write-Host "  Fetching page $page..." -ForegroundColor Gray
    $data = Invoke-RestMethod -Uri $url
    $allResources += $data.resources
    Start-Sleep -Seconds 2
    $page++
} while ($page -le $data.metadata.lastPage)

$output = $allResources | ForEach-Object {
    [PSCustomObject]@{
        ResourceId = $_.id
        Name = $_.name
        Transportation = $_.transportation
        ProductionWagesPerHour = $_.wages
        ProducedUnitsPerHour = [math]::Round($_.producedAnHour, 2)
        HasRetail = if ($_.retailInfo) { 'Yes' } else { 'No' }
        IsResearch = if ($_.isResearch) { 'Yes' } else { 'No' }
    }
}

$output | Export-Csv -Path $OutputFile -NoTypeInformation

Write-Host "Exported $($output.Count) resources to: $OutputFile" -ForegroundColor Green
