$email = "aditya07thakur03@gmail.com"
$password = "Aditya@12217154"
$domain = "deliverx-ai-route.surge.sh"

Set-Location "d:\AI-Route\client\build"

Write-Host "🚀 Deploying DeliverX to Surge.sh..." -ForegroundColor Green
Write-Host "📧 Email: $email" -ForegroundColor Yellow
Write-Host "🌐 Domain: $domain" -ForegroundColor Yellow

# Create input for surge
$input = @"
$email
$password
$domain
"@

$input | surge

Write-Host "✅ Deployment completed!" -ForegroundColor Green
Write-Host "🔗 Your app is live at: https://$domain" -ForegroundColor Cyan