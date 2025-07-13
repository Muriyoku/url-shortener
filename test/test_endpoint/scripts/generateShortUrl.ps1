$headers = @{"Content-Type" = "application/json"};
$body = @{
  url = "https://anilist.co/manga/30007/Hajime-no-Ippo-Fighting-Spirit/"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/url" -Method Post -Headers $headers -Body $body