#requires -Version 5.1
param(
  [string]$BaseUrl = "http://localhost:8000",
  [string]$Email = "admin.e2e@acme.com",
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
$p_before = Call GET "$BaseUrl/api/payments/" $h $null $null
$p_create = Call POST "$BaseUrl/api/payments/?amount_cents=111&currency=EUR&description=Smoke" $h "application/json" ""
$p_after = Call GET "$BaseUrl/api/payments/" $h $null $null
$metrics = Call GET "$BaseUrl/api/analytics/metrics" $h $null $null
$trends = Call GET "$BaseUrl/api/analytics/trends?days=3" $h $null $null

# refresh
$ref = Invoke-RestMethod -Uri ("$BaseUrl/api/auth/refresh?refresh_token=" + [Uri]::EscapeDataString($auth.refresh_token)) -Method Post
$h2 = Headers $ref.access_token
$me2 = Call GET "$BaseUrl/api/auth/me" $h2 $null $null

$out = [ordered]@{
  login_ok = $true
  me = $me
  payments_before = $p_before
  payments_create = $p_create
  payments_after = $p_after
  analytics_metrics = $metrics
  analytics_trends = $trends
  refresh_me = $me2
}

$out | ConvertTo-Json -Depth 6 | Write-Output

