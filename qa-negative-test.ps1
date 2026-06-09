$ErrorActionPreference = 'Stop'
$base = 'http://localhost:4001/api'
$stamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$userEmail = "qa_neg_user_$stamp@test.com"
$driverEmail = "qa_neg_driver_$stamp@test.com"

function Write-Step([string]$name) {
  Write-Host "`n=== $name ==="
}

Write-Step 'Register user first time'
$userBody = @{
  fullname = @{ firstname = 'Neg'; lastname = 'User' }
  email = $userEmail
  password = 'Pass@1234'
} | ConvertTo-Json -Depth 5
$userResp = Invoke-RestMethod -Method POST -Uri "$base/users/register" -ContentType 'application/json' -Body $userBody
$userToken = $userResp.token
Write-Host 'PASS first registration succeeded'

Write-Step 'Register same user again (expect 409)'
try {
  Invoke-RestMethod -Method POST -Uri "$base/users/register" -ContentType 'application/json' -Body $userBody | Out-Null
  Write-Host 'FAIL duplicate user registration unexpectedly succeeded'
} catch {
  if ($_.Exception.Response) {
    $status = [int]$_.Exception.Response.StatusCode
    if ($status -eq 409) { Write-Host 'PASS duplicate user blocked with 409' } else { Write-Host "FAIL duplicate user unexpected status=$status" }
  } else {
    Write-Host 'FAIL duplicate user no HTTP response'
  }
}

Write-Step 'Register driver'
$driverBody = @{
  fullname = @{ firstname = 'Neg'; lastname = 'Driver' }
  email = $driverEmail
  password = 'Pass@1234'
  vehicle = @{ color = 'White'; plate = ("TG" + (Get-Random -Minimum 1000 -Maximum 9999)); capacity = 3; vehicleType = 'car' }
} | ConvertTo-Json -Depth 7
$driverResp = Invoke-RestMethod -Method POST -Uri "$base/drivers/register" -ContentType 'application/json' -Body $driverBody
$driverToken = $driverResp.token
Write-Host 'PASS driver registration succeeded'

Write-Step 'Create then cancel pending ride by user'
$userHeaders = @{ Authorization = "Bearer $userToken" }
$createBody = @{ pickup='Madhapur'; destination='Jubilee Hills'; fare=90; vehicleType='auto' } | ConvertTo-Json
$ride = Invoke-RestMethod -Method POST -Uri "$base/rides/create" -Headers $userHeaders -ContentType 'application/json' -Body $createBody
$cancelResp = Invoke-RestMethod -Method POST -Uri "$base/rides/cancel" -Headers $userHeaders -ContentType 'application/json' -Body (@{ rideId=$ride._id; reason='Changed plan' } | ConvertTo-Json)
if ($cancelResp.status -eq 'cancelled') { Write-Host 'PASS pending ride cancelled by user' } else { Write-Host "FAIL cancel status=$($cancelResp.status)" }

Write-Step 'Create accepted/ongoing ride then cancel (expect 409)'
$ride2 = Invoke-RestMethod -Method POST -Uri "$base/rides/create" -Headers $userHeaders -ContentType 'application/json' -Body $createBody
$driverHeaders = @{ Authorization = "Bearer $driverToken" }
Invoke-RestMethod -Method POST -Uri "$base/rides/accept" -Headers $driverHeaders -ContentType 'application/json' -Body (@{ rideId=$ride2._id } | ConvertTo-Json) | Out-Null
Invoke-RestMethod -Method POST -Uri "$base/rides/start-ride" -Headers $driverHeaders -ContentType 'application/json' -Body (@{ rideId=$ride2._id; otp=$ride2.otp } | ConvertTo-Json) | Out-Null
try {
  Invoke-RestMethod -Method POST -Uri "$base/rides/cancel" -Headers $userHeaders -ContentType 'application/json' -Body (@{ rideId=$ride2._id; reason='Too late cancel' } | ConvertTo-Json) | Out-Null
  Write-Host 'FAIL ongoing ride cancellation unexpectedly succeeded'
} catch {
  if ($_.Exception.Response) {
    $status = [int]$_.Exception.Response.StatusCode
    if ($status -eq 409) { Write-Host 'PASS ongoing ride cancellation blocked with 409' } else { Write-Host "FAIL ongoing cancel unexpected status=$status" }
  } else {
    Write-Host 'FAIL ongoing cancel no HTTP response'
  }
}

Write-Host "`nNegative QA run complete."
