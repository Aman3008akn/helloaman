# 🚀 Quick Firebase Setup Script

## Automated setup for Firebase deployment

---

## Prerequisites Check

Run these commands to check if you have the required tools:

```bash
# Check Node.js version (should be 18+)
node --version

# Check if Firebase CLI is installed
firebase --version

# If not installed, run:
npm install -g firebase-tools
```

---

## Step-by-Step Manual Setup

### 1. Initialize Firebase

```bash
firebase login
firebase init functions
```

When prompted:
- **Existing project**: Select your project or create new
- **Language**: JavaScript
- **ESLint**: Yes
- **Unit tests**: No
- **Overwrite package.json**: No (we already created it)

### 2. Copy Required Files to `functions/` folder

```bash
# Create functions directory structure
mkdir functions\config
mkdir functions\handlers
mkdir functions\models
mkdir functions\services
mkdir functions\utils
mkdir functions\keyboards
mkdir functions\middleware

# Copy all necessary files
xcopy /E /I config functions\config
xcopy /E /I handlers functions\handlers
xcopy /E /I models functions\models
xcopy /E /I services functions\services
xcopy /E /I utils functions\utils
xcopy /E /I keyboards functions\keyboards
xcopy /E /I middleware functions\middleware

# Copy bot.js and other files
copy bot.js functions\
copy .env functions\
```

### 3. Set Firebase Secrets

```bash
# Bot Token
firebase functions:secrets:set BOT_TOKEN

# MongoDB URI
firebase functions:secrets:set MONGODB_URI

# Admin usernames
firebase functions:secrets:set SUPER_ADMINS
# Paste: 8571732858,developerkabirthday,Rockseald,7843080067,8751001916,donothingbe,CW_Masculine

firebase functions:secrets:set MODERATORS
# Paste: CW_Masculine

firebase functions:secrets:set ESCROWERS
# Paste: 8571732858,developerkabirthday,Rockseald,7843080067,8751001916,donothingbe,CW_Masculine

# Other configs
firebase functions:secrets:set DEFAULT_FEE_PERCENT
# Paste: 3

firebase functions:secrets:set AUTO_CANCEL_TIMEOUT_MINUTES
# Paste: 120

firebase functions:secrets:set REMINDER_INTERVAL_MINUTES
# Paste: 30
```

### 4. Deploy Functions

```bash
cd functions
npm install
cd ..

firebase deploy --only functions
```

After deployment, copy the webhook URL:
```
https://us-central1-YOUR_PROJECT.cloudfunctions.net/telegramWebhook
```

### 5. Set Webhook in Telegram

Update `.env` file with your webhook URL:

```env
WEBHOOK_URL=https://us-central1-YOUR_PROJECT.cloudfunctions.net/telegramWebhook
```

Then run:

```bash
node webhook-setup.js set
```

### 6. Test Your Bot

1. Open Telegram
2. Search: `@CRAZYWORLDINRBOT`
3. Send: `/start`

---

## 🎯 Alternative: Render.com (RECOMMENDED)

If Firebase seems complex, Render is simpler:

1. Push code to GitHub
2. Deploy on Render.com
3. Add environment variables
4. Done! (No webhook needed)

**Benefits:**
- ✅ Polling mode works (no webhook setup)
- ✅ Scheduled jobs work
- ✅ No cold starts
- ✅ Free tier available

---

## 📊 What I Created for You

Files created:
1. ✅ `webhook-setup.js` - Set/unset webhook easily
2. ✅ `functions/index.js` - Firebase function entry point
3. ✅ `functions/package.json` - Dependencies for Firebase
4. ✅ `FIREBASE_SETUP.md` - Complete detailed guide
5. ✅ `SETUP_QUICK.md` - This file

---

## ⚠️ Important Notes

### Firebase Limitations:
- ❌ Scheduled jobs won't work (auto-cancel, reminders)
- ⚠️ Cold starts (2-5 second delay on first message)
- ✅ All user/admin commands work perfectly
- ✅ Database operations work

### To Switch Back to Polling Later:

```bash
node webhook-setup.js delete
```

Then deploy again or run locally with `npm start`

---

## Need Help?

Check `FIREBASE_SETUP.md` for detailed instructions and troubleshooting!
