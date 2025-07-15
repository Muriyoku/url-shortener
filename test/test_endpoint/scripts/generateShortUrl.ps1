<#
.SYNOPSIS
  Posts a long URL to your local API and prints the short URL (or HTTP error).
.PARAMETER Url
  The long URL you want to shorten.
#>
param(
    [Parameter(Mandatory = $true, HelpMessage = 'The long URL to shorten')]
    [string]$Url
)

# Build headers and JSON body
$headers = @{ 'Content-Type' = 'application/json' }
$body    = @{ url = $Url } | ConvertTo-Json

try {
    # Invoke-RestMethod will throw on 4xx/5xx
    $response = Invoke-RestMethod `
      -Uri    'http://localhost:3000/api/url' `
      -Method Post `
      -Headers $headers `
      -Body    $body

    # On success, print the returned shortUrl property
    Write-Host "Short URL: $($response.shortUrl)"
}
catch [System.Net.WebException] {
    # Extract the HTTP response for status and description
    $resp   = $_.Exception.Response
    $status = [int]$resp.StatusCode
    $desc   = $resp.StatusDescription

    # Use a plain hyphen, not an en-dash
    Write-Host "HTTP $status - $desc"
}
