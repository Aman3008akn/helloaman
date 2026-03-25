# 🔥 Firebase + Webhook Setup Guide

## Complete instructions for deploying Telegram Escrow Bot on Firebase

---

## ⚠️ IMPORTANT LIMITATIONS

Before proceeding, understand Firebase limitations:

| Feature | Firebase Free Tier | Your Bot Needs |
|---------|-------------------|----------------|
| **Function Timeout** | 9 minutes max | ✅ OK (bot responses are instant) |
| **Cold Starts** | 1-3 seconds delay | ⚠️ First message slow |
| **Scheduled Jobs** | Limited (10/day) | ❌ Auto-cancel & reminders won't work |
| **Concurrent Executions** | 1000 concurrent | ✅ More than enough |
| **HTTPS** | ✅ Included | ✅ Required for webhook |

### 🚨 Critical Issue:
Your bot has **scheduled jobs** (auto-cancel, payment reminders) that run every 5-30 minutes. These **won't work** on Firebase because:
- Firebase Functions only run when triggered by webhook
- No background processes on free tier

---

## 📋 SETUP STEPS

### Step 1: Install Firebase CLI

```bash
npm install -g firebase-tools
```

### Step 2: Initialize Firebase Project

```bash
firebase login
firebase init functions
```

Select these options:
- Use existing project (or create new)
- JavaScript language
- ESLint: Yes
- Unit tests: No

### Step 3: Update `functions/package.json`

Add dependencies:

```json
{
  "name": "functions",
  "description": "Telegram Escrow Bot Cloud Functions",
  "scripts": {
    "serve": "firebase emulators:start --only functions",
    "shell": "firebase functions:shell",
    "start": "npm run shell",
    "deploy": "firebase deploy --only functions",
    "logs": "firebase functions:log"
  },
  "engines": {
    "node": "18"
  },
  "main": "index.js",
  "dependencies": {
    "firebase-admin": "^11.8.0",
    "firebase-functions": "^4.3.1",
    "node-telegram-bot-api": "^0.61.0",
    "mongoose": "^7.0.0",
    "dotenv": "^16.0.0",
    "express": "^4.18.0",
    "node-cron": "^3.0.0"
  },
  "private": true
}
```

### Step 4: Copy Bot Code to Functions Folder

Copy these folders/files to `functions/`:
- `config/`
- `handlers/`
- `models/`
- `services/`
- `utils/`
- `keyboards/`
- `middleware/`
- `.env` (rename to `.runtimeconfig.json` - see below)

### Step 5: Set Environment Variables

Firebase doesn't use `.env` files. Instead:

```bash
firebase functions:secrets:set BOT_TOKEN
# Paste your bot token when prompted

firebase functions:secrets:set MONGODB_URI
# Paste your MongoDB connection string

firebase functions:secrets:set SUPER_ADMINS
# Paste: 8571732858,developerkabirthday,Rockseald,7843080067,8751001916,donothingbe,CW_Masculine

firebase functions:secrets:set MODERATORS
# Paste: CW_Masculine

firebase functions:secrets:set ESCROWERS
# Paste: 8571732858,developerkabirthday,Rockseald,7843080067,8751001916,donothingbe,CW_Masculine

firebase functions:secrets:set DEFAULT_FEE_PERCENT
# Paste: 3

firebase functions:secrets:set AUTO_CANCEL_TIMEOUT_MINUTES
# Paste: 120
```

### Step 6: Deploy Functions

```bash
firebase deploy --only functions
```

After deployment, you'll see:
```
Function URL (telegramWebhook): 
https://us-central1-YOUR_PROJECT.cloudfunctions.net/telegramWebhook
```

**Copy this URL!**

### Step 7: Set Webhook in Telegram

Update your `.env` file:

```env
WEBHOOK_URL=https://us-central1-YOUR_PROJECT.cloudfunctions.net/telegramWebhook
```

Then run:

```bash
node webhook-setup.js set
```

You should see:
```
✅ Webhook set successfully!
🔗 Webhook URL: https://us-central1-YOUR_PROJECT.cloudfunctions.net/telegramWebhook
```

### Step 8: Test the Bot

1. Open Telegram
2. Search: `@CRAZYWORLDINRBOT`
3. Send: `/start`

The bot should respond!

---

## 🔧 FIREBASE PROJECT STRUCTURE

After setup, your structure should be:

```
telegram-escrow-bot/
├── functions/
│   ├── config/          (copied)
│   ├── handlers/        (copied)
│   ├── models/          (copied)
│   ├── services/        (copied)
│   ├── utils/           (copied)
│   ├── keyboards/       (copied)
│   ├── middleware/      (copied)
│   ├── index.js         (webhook function)
│   ├── package.json     (updated)
│   └── .env             (NOT uploaded - use secrets)
├── firebase.json        (created by firebase init)
├── .firebaserc          (created by firebase init)
├── webhook-setup.js     (created above)
└── ... other files
```

---

## 🚨 WHAT WON'T WORK ON FIREBASE

### 1. Scheduled Jobs (Auto-cancel, Reminders)
These run in background every 5-30 minutes:
- ❌ Auto-cancel expired deals
- ❌ Payment reminders (every 30 min)
- ❌ Delivery reminders (every hour)

**Workaround:** Manual admin commands only

### 2. Long-running Operations
Any operation taking >9 minutes will timeout

### 3. Cold Start Delay
First message after inactivity takes 2-5 seconds to respond

---

## 💡 BETTER ALTERNATIVES FOR YOUR BOT

Since your bot needs scheduled jobs and 24/7 uptime, consider:

### Option 1: Render.com (RECOMMENDED)
- ✅ Polling mode works perfectly
- ✅ Scheduled jobs work
- ✅ No cold starts
- ✅ Free tier available
- ✅ Zero code changes

### Option 2: Railway.app
- ✅ Similar to Render
- ✅ $5/month or pay-as-you-go
- ✅ Better performance than Firebase free tier

### Option 3: VPS (DigitalOcean)
- ₹400-500/month
- Full control
- Best performance

---

## 🔄 SWITCHING BACK TO POLLING

If Firebase doesn't work out, easily switch back:

```bash
node webhook-setup.js delete
```

Then run normally:
```bash
npm start
```

---

## 📊 COST COMPARISON

| Platform | Cost | Pros | Cons |
|----------|------|------|------|
| **Firebase** | Free (with limits) | HTTPS included, Google infra | No scheduled jobs, cold starts |
| **Render** | Free | 24/7, no cold starts, polling works | Sleeps after 15min idle |
| **Railway** | $5/month | No sleep, better perf | Paid |
| **DigitalOcean** | $5/month | Full control, best perf | Manual setup |

---

## ✅ FINAL RECOMMENDATION

**For your Telegram Escrow Bot, I recommend Render.com over Firebase because:**

1. ✅ Your current code works without changes
2. ✅ Scheduled jobs (auto-cancel, reminders) work
3. ✅ No cold start delays
4. ✅ Polling mode = no webhook complexity
5. ✅ Free tier sufficient for starting

**Use Firebase only if:**
- You don't need scheduled jobs
- You're okay with cold starts
- You want to learn Firebase

---

## 🆘 TROUBLESHOOTING

### Webhook not working
```bash
node webhook-setup.js info
```

Check webhook URL is correct

### Function timeout errors
- Check MongoDB connection is fast
- Add timeout configuration to function

### Cold starts too slow
- Upgrade to Firebase Blaze plan ($0.06/function invocation)
- Or switch to Render/Railway

### Scheduled jobs needed
- Use Firebase Cloud Scheduler (paid feature)
- Costs $0.10 per 100,000 invocations
- Or switch to Render

---

## 🎯 READY TO DEPLOY?

Choose one:

1. **Deploy to Firebase** → Follow steps above
2. **Switch to Render** → Let me know, I'll guide you
3. **Test locally first** → Keep using `npm start`

**What's your decision?** 🚀
