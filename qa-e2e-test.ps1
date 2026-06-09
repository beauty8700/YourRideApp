$ErrorActionPreference = 'Stop'
$base = 'http://localhost:4001/api'
$stamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$userEmail = "qa_user_$stamp@test.com"
$driverEmail = "qa_driver_$stamp@test.com"

function Write-Step([string]$name) {
  Write-Host "`n=== $name ==="
}

Write-Step 'Health'
$health = Invoke-RestMethod -Method GET -Uri "$base/health"
Write-Host "PASS health: $($health.status)"

Write-Step 'Register User'
$userBody = @{
  fullname = @{ firstname = 'QATest'; lastname = 'User' }
  email = $userEmail
  password = 'Pass@1234'
} | ConvertTo-Json -Depth 5
$userResp = Invoke-RestMethod -Method POST -Uri "$base/users/register" -ContentType 'application/json' -Body $userBody
$userToken = $userResp.token
Write-Host "PASS user register: email=$userEmail"

Write-Step 'Register Driver'
$driverBody = @{
  fullname = @{ firstname = 'QATest'; lastname = 'Driver' }
  email = $driverEmail
  password = 'Pass@1234'
  vehicle = @{ color = 'Black'; plate = ("TS" + (Get-Random -Minimum 1000 -Maximum 9999)); capacity = 4; vehicleType = 'car' }
} | ConvertTo-Json -Depth 7
$driverResp = Invoke-RestMethod -Method POST -Uri "$base/drivers/register" -ContentType 'application/json' -Body $driverBody
$driverToken = $driverResp.token
Write-Host "PASS driver register: email=$driverEmail"

Write-Step 'Create Ride'
$rideBody = @{
  pickup = 'Ameerpet Metro'
  destination = 'Hitech City'
  fare = 120
  vehicleType = 'mini'
  distance = 7.5
  duration = 22
} | ConvertTo-Json
$userHeaders = @{ Authorization = "Bearer $userToken" }
$rideResp = Invoke-RestMethod -Method POST -Uri "$base/rides/create" -Headers $userHeaders -ContentType 'application/json' -Body $rideBody
$rideId = $rideResp._id
$otp = $rideResp.otp
Write-Host "PASS ride create: rideId=$rideId status=$($rideResp.status) otp=$otp"

Write-Step 'Accept Ride'
$driverHeaders = @{ Authorization = "Bearer $driverToken" }
$acceptResp = Invoke-RestMethod -Method POST -Uri "$base/rides/accept" -Headers $driverHeaders -ContentType 'application/json' -Body (@{ rideId = $rideId } | ConvertTo-Json)
Write-Host "PASS ride accept: status=$($acceptResp.status)"

Write-Step 'Start Ride with wrong OTP (expect 400)'
try {
  Invoke-RestMethod -Method POST -Uri "$base/rides/start-ride" -Headers $driverHeaders -ContentType 'application/json' -Body (@{ rideId = $rideId; otp = '000000' } | ConvertTo-Json) | Out-Null
  Write-Host 'FAIL wrong OTP unexpectedly succeeded'
} catch {
  if ($_.Exception.Response) {
    Write-Host "PASS wrong OTP rejected: status=$([int]$_.Exception.Response.StatusCode)"
  } else {
    Write-Host 'FAIL wrong OTP no HTTP response'
  }
}

Write-Step 'Start Ride with correct OTP'
$startResp = Invoke-RestMethod -Method POST -Uri "$base/rides/start-ride" -Headers $driverHeaders -ContentType 'application/json' -Body (@{ rideId = $rideId; otp = $otp } | ConvertTo-Json)
Write-Host "PASS ride start: status=$($startResp.status)"

Write-Step 'Complete Ride'
$completeResp = Invoke-RestMethod -Method POST -Uri "$base/rides/complete" -Headers $driverHeaders -ContentType 'application/json' -Body (@{ rideId = $rideId } | ConvertTo-Json)
Write-Host "PASS ride complete: status=$($completeResp.status)"

Write-Step 'User active ride after completion (expect 404)'
try {
  Invoke-RestMethod -Method GET -Uri "$base/rides/active/user" -Headers $userHeaders | Out-Null
  Write-Host 'FAIL active ride still exists unexpectedly'
} catch {
  if ($_.Exception.Response) {
    Write-Host "PASS no active ride after completion: status=$([int]$_.Exception.Response.StatusCode)"
  } else {
    Write-Host 'FAIL active ride check no HTTP response'
  }
}

Write-Host "`nE2E QA run complete."
