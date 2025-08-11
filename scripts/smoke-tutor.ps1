#requires -Version 5.1
param(
  [string]$BaseUrl = "http://localhost:8000",
  [string]$Email = "tutor.e2e@acme.com",
  [string]$Password = "Password123!",
  [string]$Subject = "E2E"
)

$ErrorActionPreference = "Stop"

function Login($email,$pass){
  $body = "username=$($email)&password=$($pass)"
  return Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" -Method Post -ContentType "application/x-www-form-urlencoded" -Body $body
}
function Headers($token){ @{ Authorization = ("Bearer " + $token) } }
function Call([string]$method,[string]$url,$headers,[string]$contentType,$body){
  try {
    if($body){ $r = Invoke-WebRequest -Uri $url -Method $method -Headers $headers -ContentType $contentType -Body $body -UseBasicParsing }
    else { $r = Invoke-WebRequest -Uri $url -Method $method -Headers $headers -UseBasicParsing }
    return @{ status = [int]$r.StatusCode; ok = $true }
  } catch {
    $code = -1; if($_.Exception.Response){ try { $code = [int]$_.Exception.Response.StatusCode.value__ } catch { $code = -1 } }
    return @{ status = $code; ok = $false }
  }
}

$auth = Login $Email $Password
$h = Headers $auth.access_token

# sanity auth
$auth_me_status = Call GET "$BaseUrl/api/auth/me" $h $null $null

# ensure tutor profile (POST è idempotente: ritorna esistente o lo crea)
$tutorProfile = $null
try {
  $payload = @{ first_name = "Tutor"; last_name = "E2E"; hourly_rate = 20; subjects = $Subject } | ConvertTo-Json
  $tutorProfile = Invoke-RestMethod -Uri "$BaseUrl/api/users/me/tutor" -Headers $h -Method Post -ContentType "application/json" -Body $payload
} catch {
  # se fallisce il POST, tentiamo un GET; se ancora fallisce, lasciamo $tutorProfile = $null
  try { $tutorProfile = Invoke-RestMethod -Uri "$BaseUrl/api/users/me/tutor" -Headers $h } catch { $tutorProfile = $null }
}

$today = (Get-Date).ToString('yyyy-MM-dd')
$me = $tutorProfile
if($me -and $me.id){
  $slotBody = @{ tutor_id = $me.id; date = $today; start_time = "09:00:00"; end_time = "10:00:00" } | ConvertTo-Json
  $slot_create = Call POST "$BaseUrl/api/slots/" $h "application/json" $slotBody
} else {
  $slot_create = @{ status = -1; ok = $false }
}
$slots_today = Call GET "$BaseUrl/api/slots/?slot_date=$today" $h $null $null
$metrics_403 = Call GET "$BaseUrl/api/analytics/metrics" $h $null $null

# file upload
$tmp = Join-Path $env:TEMP "smoke-e2e.pdf"; Set-Content -Path $tmp -Value "hello e2e" -Encoding UTF8
$uploadStatus = & curl.exe -s -o NUL -w "%{http_code}" -H ("Authorization: Bearer " + $auth.access_token) -F ("file=@" + $tmp) -F ("subject=$Subject") -F "description=E2E" -F "is_public=false" ("$BaseUrl/api/files/upload")
$list = @()
try { $list = Invoke-RestMethod -Uri "$BaseUrl/api/files/?subject=$Subject" -Headers $h -ErrorAction Stop } catch { $list = @() }
$file_id = ($list | Select-Object -First 1).id
$downloadStatus = 0; if($file_id){ $downloadStatus = & curl.exe -s -o NUL -w "%{http_code}" -H ("Authorization: Bearer " + $auth.access_token) ("$BaseUrl/api/files/" + $file_id + "/download") }
$delete_ok = $false; if($file_id){ try { Invoke-RestMethod -Uri ("$BaseUrl/api/files/" + $file_id) -Headers $h -Method Delete | Out-Null; $delete_ok = $true } catch { $delete_ok = $false } }

$out = [ordered]@{
  auth_me = $auth_me_status
  profile_ok = [bool]($tutorProfile -ne $null)
  slot_create = $slot_create
  slots_today = $slots_today
  analytics_403 = $metrics_403
  file_upload_status = [int]$uploadStatus
  file_download_status = [int]$downloadStatus
  file_delete_ok = $delete_ok
}

$out | ConvertTo-Json -Depth 6 | Write-Output

