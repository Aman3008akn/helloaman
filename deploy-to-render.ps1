# 🚀 Automated Render Deployment Script
# This script helps you deploy to Render.com

Write-Host "🎯 Render.com Automated Deployment" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if Git is installed
Write-Host "📦 Checking Git installation..." -ForegroundColor Yellow
try {
    $gitVersion = git --version 2>&1
    Write-Host "✅ Git found: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git not found!" -ForegroundColor Red
    Write-Host "Please install Git from https://git-scm.com/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "🔑 Step 1: GitHub Setup" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if already a git repo
if (!(Test-Path ".git")) {
    Write-Host "Initializing Git repository..." -ForegroundColor Yellow
    git init
    Write-Host "✅ Git initialized!" -ForegroundColor Green
} else {
    Write-Host "✅ Git repository already exists" -ForegroundColor Green
}

# Check for remote
$remoteUrl = git remote get-url origin 2>$null
if (!$remoteUrl) {
    Write-Host ""
    Write-Host "📝 Create a new repository on GitHub first:" -ForegroundColor Cyan
    Write-Host "   1. Go to https://github.com/new" -ForegroundColor White
    Write-Host "   2. Create a new repository (name: telegram-escrow-bot)" -ForegroundColor White
    Write-Host "   3. Copy the repository URL" -ForegroundColor White
    Write-Host ""
    $repoUrl = Read-Host "Paste your GitHub repository URL here"
    
    if ($repoUrl) {
        git remote add origin $repoUrl
        Write-Host "✅ Remote added!" -ForegroundColor Green
    }
} else {
    Write-Host "✅ Remote repository configured: $remoteUrl" -ForegroundColor Green
}

Write-Host ""
Write-Host "📤 Step 2: Pushing to GitHub..." -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Stage all files
Write-Host "Staging all files..." -ForegroundColor Yellow
git add .

# Commit
$commitMessage = Read-Host "Enter commit message (or press Enter for default)"
if (!$commitMessage) {
    $commitMessage = "Deploy to Render"
}

git commit -m $commitMessage

# Ensure we're on main branch
$currentBranch = git branch --show-current
if ($currentBranch -ne "main") {
    Write-Host "Switching to main branch..." -ForegroundColor Yellow
    git branch -M main
}

# Push to GitHub
Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
try {
    git push -u origin main -Force
    Write-Host "✅ Code pushed to GitHub!" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Push failed. You may need to set up SSH keys or use HTTPS." -ForegroundColor Yellow
    Write-Host "Trying alternative method..." -ForegroundColor Yellow
    git push -u origin main
}

Write-Host ""
Write-Host "☁️ Step 3: Render Deployment Instructions" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "🎉 GitHub setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Now follow these simple steps to deploy on Render:" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 MANUAL STEPS (Required - Render needs your authorization):" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Open your browser and go to: https://render.com" -ForegroundColor White
Write-Host "2. Click 'Get Started for Free' or 'Sign Up'" -ForegroundColor White
Write-Host "3. Choose 'Sign up with GitHub' (easiest option)" -ForegroundColor White
Write-Host "4. Authorize Render to access your GitHub account" -ForegroundColor White
Write-Host ""
Write-Host "5. In Render Dashboard:" -ForegroundColor White
Write-Host "   • Click 'New +' → 'Web Service'" -ForegroundColor White
Write-Host "   • Find and select your 'telegram-escrow-bot' repository" -ForegroundColor White
Write-Host "   • Click 'Connect'" -ForegroundColor White
Write-Host ""
Write-Host "6. Configure the service:" -ForegroundColor White
Write-Host "   • Name: telegram-escrow-bot" -ForegroundColor Gray
Write-Host "   • Region: Mumbai (India) or nearest to you" -ForegroundColor Gray
Write-Host "   • Branch: main" -ForegroundColor Gray
Write-Host "   • Build Command: npm install" -ForegroundColor Gray
Write-Host "   • Start Command: node bot.js" -ForegroundColor Gray
Write-Host "   • Plan: Free" -ForegroundColor Gray
Write-Host ""
Write-Host "7. Click 'Advanced' and add these Environment Variables:" -ForegroundColor White
Write-Host ""
Write-Host "   BOT_TOKEN=8655171443:AAE0_0p_TX1Frdq_CkG_VoPLD3ad4cxZFQ0" -ForegroundColor Gray
Write-Host "   BOT_USERNAME=CRAZYWORLDINRBOT" -ForegroundColor Gray
Write-Host "   MONGODB_URI=mongodb+srv://telegrambotescrow:Aman%40321@telegrambot.vv7nmp0.mongodb.net/telegram-escrow?retryWrites=true&w=majority" -ForegroundColor Gray
Write-Host "   SUPER_ADMINS=8571732858,developerkabirthday,Rockseald,7843080067,8751001916,donothingbe,CW_Masculine" -ForegroundColor Gray
Write-Host "   MODERATORS=CW_Masculine" -ForegroundColor Gray
Write-Host "   ESCROWERS=8571732858,developerkabirthday,Rockseald,7843080067,8751001916,donothingbe,CW_Masculine" -ForegroundColor Gray
Write-Host "   DEFAULT_FEE_PERCENT=3" -ForegroundColor Gray
Write-Host "   AUTO_CANCEL_TIMEOUT_MINUTES=120" -ForegroundColor Gray
Write-Host "   REMINDER_INTERVAL_MINUTES=30" -ForegroundColor Gray
Write-Host ""
Write-Host "8. Click 'Create Web Service'" -ForegroundColor White
Write-Host ""
Write-Host "⏳ Wait 3-5 minutes for deployment to complete!" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎉 After deployment:" -ForegroundColor Green
Write-Host "   • Service status will show 'Live' (green)" -ForegroundColor White
Write-Host "   • Open Telegram and test: @CRAZYWORLDINRBOT" -ForegroundColor White
Write-Host "   • Send /start to verify bot is working" -ForegroundColor White
Write-Host ""
Write-Host "📊 View logs in Render dashboard to monitor your bot!" -ForegroundColor Cyan
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Pro Tips:" -ForegroundColor Yellow
Write-Host "   • Bookmark your Render dashboard for easy access" -ForegroundColor White
Write-Host "   • Future updates: Just git push and Render auto-deploys!" -ForegroundColor White
Write-Host "   • Check logs regularly to see bot activity" -ForegroundColor White
Write-Host ""
Write-Host ""
Write-Host "Need help? Check RENDER_DEPLOY.md for detailed guide!" -ForegroundColor Cyan
Write-Host ""
Write-Host "GitHub repo URL: $remoteUrl" -ForegroundColor Green
Write-Host ""
Write-Host "Now go to https://render.com and follow the steps above!" -ForegroundColor Yellow
Write-Host ""
