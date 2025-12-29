# Sim Companies Market Data Collection Script
# Fetches comprehensive market data for ROI analysis

param(
    [string]$OutputPath = ".\market-data-$(Get-Date -Format 'yyyy-MM-dd-HHmm').csv",
    [string]$ApiBase = "https://api.simcotools.com/v1",
    [string]$Realm = "1"  # Default realm (Earth/R1)
)

Write-Host "=== Sim Companies Market Data Collector ===" -ForegroundColor Cyan
Write-Host "API Base: $ApiBase" -ForegroundColor Gray
Write-Host "Realm: $Realm" -ForegroundColor Gray
Write-Host ""

# Test API connectivity
Write-Host "Testing API connectivity..." -ForegroundColor Yellow

$endpoints = @(
    "/healthcheck",
    "/realms",
    "/realms/$Realm/resources",
    "/realms/$Realm/buildings",
    "/realms/$Realm/market/prices"
)

$workingEndpoints = @()

foreach ($endpoint in $endpoints) {
    try {
        $testUrl = "$ApiBase$endpoint"
        Write-Host "  Testing: $testUrl" -ForegroundColor Gray
        $response = Invoke-RestMethod -Uri $testUrl -Method Get -ErrorAction Stop -TimeoutSec 5
        Write-Host "    ✓ Success" -ForegroundColor Green
        $workingEndpoints += @{
            Endpoint = $endpoint
            Url = $testUrl
            Response = $response
        }
    }
    catch {
        Write-Host "    ✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Working endpoints: $($workingEndpoints.Count)" -ForegroundColor Cyan

if ($workingEndpoints.Count -eq 0) {
    Write-Host ""
    Write-Host "=== No working API endpoints found ===" -ForegroundColor Red
    Write-Host "Options:" -ForegroundColor Yellow
    Write-Host "  1. Manual data entry to Google Sheets"
    Write-Host "  2. Check if you need authentication/API key"
    Write-Host "  3. Use browser DevTools to capture network requests"
    Write-Host "  4. Scrape data from SimCompanies website"
    Write-Host ""
    exit 1
}

# Display sample data from working endpoints
Write-Host ""
Write-Host "=== Sample Data from Working Endpoints ===" -ForegroundColor Cyan

foreach ($endpoint in $workingEndpoints) {
    Write-Host ""
    Write-Host "Endpoint: $($endpoint.Endpoint)" -ForegroundColor Yellow
    
    if ($endpoint.Response -is [System.Collections.IEnumerable]) {
        $sampleCount = [Math]::Min(3, $endpoint.Response.Count)
        Write-Host "  Total items: $($endpoint.Response.Count)" -ForegroundColor Gray
        Write-Host "  Sample (first $sampleCount):" -ForegroundColor Gray
        $endpoint.Response | Select-Object -First $sampleCount | ConvertTo-Json -Depth 2 | Write-Host
    } else {
        $endpoint.Response | ConvertTo-Json -Depth 2 | Write-Host
    }
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Review the sample data above"
Write-Host "  2. Identify which fields map to your needs"
Write-Host "  3. Create parser to extract exchange price, retail price, worker cost, etc."
Write-Host ""
