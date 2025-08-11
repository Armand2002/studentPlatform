#requires -Version 5.1
param(
  [string]$BaseUrl = "http://localhost:8000"
)

$ErrorActionPreference = "Stop"

function Run([string]$script){
  try {
    $raw = & powershell -NoProfile -ExecutionPolicy Bypass -File $script -BaseUrl $BaseUrl 2>&1 | Out-String
    $rawTrim = $raw.Trim()
    $firstBrace = $rawTrim.IndexOf('{')
    if($firstBrace -lt 0){ throw "No JSON found in output: $rawTrim" }
    $jsonText = $rawTrim.Substring($firstBrace)
    $json = $jsonText | ConvertFrom-Json
    return @{ ok=$true; data=$json }
  } catch {
    return @{ ok=$false; error=$_.Exception.Message }
  }
}

$admin = Run (Join-Path $PSScriptRoot 'smoke-admin.ps1')
$tutor = Run (Join-Path $PSScriptRoot 'smoke-tutor.ps1')
$student = Run (Join-Path $PSScriptRoot 'smoke-student.ps1')

function Is2xx($obj){ if($null -eq $obj){ return $false }; $s = [int]$obj.status; return ($s -ge 200 -and $s -lt 300) }

$ok = $true
if(-not $admin.ok){ $ok = $false }
else {
  $ok = $ok -and (Is2xx $admin.data.me)
  $ok = $ok -and (Is2xx $admin.data.payments_before)
  $ok = $ok -and (Is2xx $admin.data.payments_after)
  $ok = $ok -and (Is2xx $admin.data.analytics_metrics)
  $ok = $ok -and (Is2xx $admin.data.analytics_trends)
  $ok = $ok -and (Is2xx $admin.data.refresh_me)
}

if(-not $tutor.ok){ $ok = $false }
else {
  $ok = $ok -and (Is2xx $tutor.data.slot_create)
  $ok = $ok -and (Is2xx $tutor.data.slots_today)
  # analytics può essere 403 per tutor → non bloccare
  $ok = $ok -and ([int]$tutor.data.file_upload_status -ge 200 -and [int]$tutor.data.file_upload_status -lt 300)
  $ok = $ok -and ([int]$tutor.data.file_download_status -ge 200 -and [int]$tutor.data.file_download_status -lt 300)
  $ok = $ok -and ([bool]$tutor.data.file_delete_ok)
}

if(-not $student.ok){ $ok = $false }
else {
  $ok = $ok -and (Is2xx $student.data.me)
  $ok = $ok -and (Is2xx $student.data.profile)
  $ok = $ok -and (Is2xx $student.data.upcoming)
}

$summary = [ordered]@{ admin=$admin; tutor=$tutor; student=$student; overall_ok=$ok }
$summary | ConvertTo-Json -Depth 6 | Write-Output
if(-not $ok){ exit 1 } else { exit 0 }

