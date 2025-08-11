#requires -Version 5.1
param(
  [string]$BaseUrl = "http://localhost:8000",
  [string]$Email = "student.e2e@acme.com",
  [string]$Password = "Password123!"
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
$me = Call GET "$BaseUrl/api/auth/me" $h $null $null
$studentProfile = Call GET "$BaseUrl/api/users/me/student" $h $null $null
$upcoming = Call GET "$BaseUrl/api/bookings/upcoming" $h $null $null

$out = [ordered]@{ me=$me; profile=$studentProfile; upcoming=$upcoming }
$out | ConvertTo-Json -Depth 6 | Write-Output

