@echo off
REM ============================================
REM Telegram Escrow Bot Startup Script
REM ============================================

echo Starting Telegram Escrow Bot with PM2...

REM Change to bot directory
cd /d "C:\Users\ankit\Documents\telegram-escrow-bot"

REM Start bot with PM2
pm2 start bot.js --name "telegram-escrow-bot" --watch

echo.
echo ============================================
echo Bot started successfully!
echo.
echo Useful PM2 Commands:
echo pm2 status              - Check bot status
echo pm2 logs telegram-escrow-bot - View bot logs
echo pm2 restart telegram-escrow-bot - Restart bot
echo pm2 stop telegram-escrow-bot - Stop bot
echo pm2 delete telegram-escrow-bot - Remove bot from PM2
echo ============================================
pause
