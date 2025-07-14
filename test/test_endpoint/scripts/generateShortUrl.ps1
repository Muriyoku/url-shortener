$headers = @{"Content-Type" = "application/json"};
$body = @{
  url = ""
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/url" -Method Post -Headers $headers -Body $body