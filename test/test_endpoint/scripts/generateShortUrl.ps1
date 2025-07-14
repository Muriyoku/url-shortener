$headers = @{"Content-Type" = "application/json"};
$body = @{
  url = "https://anidb.net/anime/17902"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/url" -Method Post -Headers $headers -Body $body