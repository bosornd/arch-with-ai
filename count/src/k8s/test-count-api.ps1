# Count API Test Script
# Usage: .\test-count-api.ps1

$BASE_URL = "http://localhost/api/v1/counts"
$TEST_COUNT_ID = "test-count-$(Get-Date -Format 'yyyyMMdd-HHmmss')"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Count API Test Start" -ForegroundColor Cyan
Write-Host "Test Count ID: $TEST_COUNT_ID" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Create Count (set value)
Write-Host "[1] Create Count (PUT /api/v1/counts/:id)" -ForegroundColor Yellow
$createBody = @{
    value = 100
    description = "Test Count"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/$TEST_COUNT_ID" -Method PUT -Body $createBody -ContentType "application/json"
    Write-Host "✓ Create succeeded:" -ForegroundColor Green
    Write-Host "  ID: $($response.id)" -ForegroundColor Gray
    Write-Host "  Value: $($response.value)" -ForegroundColor Gray
    Write-Host "  UpdatedAt: $($response.updatedAt)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Create failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 2. Get Count
Write-Host "[2] Get Count (GET /api/v1/counts/:id)" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/$TEST_COUNT_ID" -Method GET
    Write-Host "✓ Get succeeded:" -ForegroundColor Green
    Write-Host "  ID: $($response.id)" -ForegroundColor Gray
    Write-Host "  Description: $($response.description)" -ForegroundColor Gray
    Write-Host "  Value: $($response.value)" -ForegroundColor Gray
    Write-Host "  CreatedAt: $($response.createdAt)" -ForegroundColor Gray
    Write-Host "  UpdatedAt: $($response.updatedAt)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Get failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 3. Increment Count
Write-Host "[3] Increment Count (POST /api/v1/counts/:id/increment)" -ForegroundColor Yellow
$incrementBody = @{
    amount = 5
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/$TEST_COUNT_ID/increment" -Method POST -Body $incrementBody -ContentType "application/json"
    Write-Host "✓ Increment succeeded:" -ForegroundColor Green
    Write-Host "  New Value: $($response.value) (100 + 5 = 105)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Increment failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 4. Decrement Count
Write-Host "[4] Decrement Count (POST /api/v1/counts/:id/decrement)" -ForegroundColor Yellow
$decrementBody = @{
    amount = 3
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/$TEST_COUNT_ID/decrement" -Method POST -Body $decrementBody -ContentType "application/json"
    Write-Host "✓ Decrement succeeded:" -ForegroundColor Green
    Write-Host "  New Value: $($response.value) (105 - 3 = 102)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Decrement failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 5. Confirm Final State
Write-Host "[5] Confirm Final State (GET /api/v1/counts/:id)" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/$TEST_COUNT_ID" -Method GET
    Write-Host "✓ Final State:" -ForegroundColor Green
    Write-Host "  Value: $($response.value) (Expected: 102)" -ForegroundColor Gray
    
    if ($response.value -eq 102) {
        Write-Host "  ✓ Value is correct!" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Value is incorrect. Expected: 102, Actual: $($response.value)" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Get failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 6. Direct Value Set Test
Write-Host "[6] Directly Set Count Value (PUT /api/v1/counts/:id)" -ForegroundColor Yellow
$setBody = @{
    value = 999
    description = "Value changed"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/$TEST_COUNT_ID" -Method PUT -Body $setBody -ContentType "application/json"
    Write-Host "✓ Set value succeeded:" -ForegroundColor Green
    Write-Host "  New Value: $($response.value) (Expected: 999)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Set value failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test completed!" -ForegroundColor Cyan
Write-Host "Test Count ID: $TEST_COUNT_ID" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
