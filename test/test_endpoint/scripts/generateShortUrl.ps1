$headers = @{"Content-Type" = "application/json"};
$body = @{
  url = "https/test.com"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/url" -Method Post -Headers $headers -Body $body