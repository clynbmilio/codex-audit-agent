param(
  [Parameter(Mandatory = $true)]
  [string]$BaseUrl
)

$ErrorActionPreference = "Stop"

$base = $BaseUrl.TrimEnd("/")
$body = '{"project_name":"Demo","readme":"# Demo"}'

$health = Invoke-RestMethod -Method Get -Uri "$base/health"
$card = Invoke-RestMethod -Method Get -Uri "$base/.well-known/agent-card.json"

$status = $null
$decoded = $null
try {
  Invoke-WebRequest -Method Post -Uri "$base/audit" -ContentType "application/json" -Body $body -ErrorAction Stop | Out-Null
} catch {
  $status = [int]$_.Exception.Response.StatusCode
  $header = $_.Exception.Response.Headers["PAYMENT-REQUIRED"]
  if ($header) {
    $decoded = [System.Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($header)) | ConvertFrom-Json
  }
}

[pscustomobject]@{
  health_ok = $health.ok
  health_pay_to = $health.pay_to
  card_pay_to = $card.payment.pay_to
  unpaid_status = $status
  payment_required_pay_to = $decoded.accepts[0].payTo
  payment_required_resource = $decoded.accepts[0].resource
} | ConvertTo-Json -Depth 6
