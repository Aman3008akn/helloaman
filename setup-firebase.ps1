# Automated Firebase Setup Script for Telegram Escrow Bot
# Run this in PowerShell

Write-Host "🚀 Starting Firebase Setup..." -ForegroundColor Cyan
Write-Host ""

# Check if Firebase CLI is installed
Write-Host "📦 Checking Firebase CLI installation..." -ForegroundColor Yellow
try {
    $firebaseVersion = firebase --version 2>&1
    if ($firebaseVersion) {
        Write-Host "✅ Firebase CLI found: $firebaseVersion" -ForegroundColor Green
    } else {
        throw "Firebase not found"
    }
} catch {
    Write-Host "❌ Firebase CLI not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Installing Firebase CLI..." -ForegroundColor Yellow
    npm install -g firebase-tools
    Write-Host "✅ Firebase CLI installed!" -ForegroundColor Green
}

Write-Host ""
Write-Host "🔑 Logging into Firebase..." -ForegroundColor Yellow
firebase login

Write-Host ""
Write-Host "⚙️ Initializing Firebase Functions..." -ForegroundColor Yellow
firebase init functions

Write-Host ""
Write-Host "📁 Creating directory structure..." -ForegroundColor Yellow

# Create directories
$dirs = @(
    "functions\config",
    "functions\handlers",
    "functions\models",
    "functions\services",
    "functions\utils",
    "functions\keyboards",
    "functions\middleware"
)

foreach ($dir in $dirs) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "  Created: $dir" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "📋 Copying files to functions folder..." -ForegroundColor Yellow

# Copy directories
$folders = @("config", "handlers", "models", "services", "utils", "keyboards", "middleware")

foreach ($folder in $folders) {
    Copy-Item -Path ".\$folder\*" -Destination "functions\$folder\" -Recurse -Force
    Write-Host "  ✓ Copied: $folder" -ForegroundColor Green
}

# Copy other necessary files
Copy-Item -Path ".env" -Destination "functions\.env" -Force
Write-Host "  ✓ Copied: .env" -ForegroundColor Green

Copy-Item -Path "bot.js" -Destination "functions\bot.js" -Force
Write-Host "  ✓ Copied: bot.js" -ForegroundColor Green

Write-Host ""
Write-Host "📦 Installing dependencies in functions folder..." -ForegroundColor Yellow
Set-Location functions
npm install
Set-Location ..

Write-Host ""
Write-Host "🔐 Setting up Firebase Secrets..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Please set the following secrets when prompted:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  1. BOT_TOKEN - Your Telegram bot token" -ForegroundColor White
Write-Host "  2. MONGODB_URI - MongoDB connection string" -ForegroundColor White
Write-Host "  3. SUPER_ADMINS - Admin usernames" -ForegroundColor White
Write-Host "  4. MODERATORS - Moderator usernames" -ForegroundColor White
Write-Host "  5. ESCROWERS - Escrower usernames" -ForegroundColor White
Write-Host "  6. DEFAULT_FEE_PERCENT - Fee percentage (default: 3)" -ForegroundColor White
Write-Host "  7. AUTO_CANCEL_TIMEOUT_MINUTES - Timeout (default: 120)" -ForegroundColor White
Write-Host "  8. REMINDER_INTERVAL_MINUTES - Reminder interval (default: 30)" -ForegroundColor White
Write-Host ""

$continue = Read-Host "Ready to set secrets? Press Enter to continue or Ctrl+C to cancel"

Write-Host ""
Write-Host "Setting BOT_TOKEN..." -ForegroundColor Yellow
firebase functions:secrets:set BOT_TOKEN

Write-Host "Setting MONGODB_URI..." -ForegroundColor Yellow
firebase functions:secrets:set MONGODB_URI

Write-Host "Setting SUPER_ADMINS..." -ForegroundColor Yellow
firebase functions:secrets:set SUPER_ADMINS

Write-Host "Setting MODERATORS..." -ForegroundColor Yellow
firebase functions:secrets:set MODERATORS

Write-Host "Setting ESCROWERS..." -ForegroundColor Yellow
firebase functions:secrets:set ESCROWERS

Write-Host "Setting DEFAULT_FEE_PERCENT..." -ForegroundColor Yellow
firebase functions:secrets:set DEFAULT_FEE_PERCENT

Write-Host "Setting AUTO_CANCEL_TIMEOUT_MINUTES..." -ForegroundColor Yellow
firebase functions:secrets:set AUTO_CANCEL_TIMEOUT_MINUTES

Write-Host "Setting REMINDER_INTERVAL_MINUTES..." -ForegroundColor Yellow
firebase functions:secrets:set REMINDER_INTERVAL_MINUTES

Write-Host ""
Write-Host "🚀 Deploying Firebase Functions..." -ForegroundColor Cyan
Write-Host ""
Write-Host "This may take 3-5 minutes..." -ForegroundColor Yellow
Write-Host ""

firebase deploy --only functions

Write-Host ""
Write-Host "✅ Deployment Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Copy the webhook URL from the output above" -ForegroundColor White
Write-Host "2. Update WEBHOOK_URL in your .env file:" -ForegroundColor White
Write-Host "   WEBHOOK_URL=https://us-central1-YOUR_PROJECT.cloudfunctions.net/telegramWebhook" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Set the webhook in Telegram:" -ForegroundColor White
Write-Host "   node webhook-setup.js set" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Test your bot on Telegram: @CRAZYWORLDINRBOT" -ForegroundColor White
Write-Host ""

Write-Host "🎉 Happy Coding!" -ForegroundColor Green
