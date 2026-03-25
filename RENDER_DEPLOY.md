# 🎯 Render.com Deployment Guide

## FREE • NO CREDIT CARD • 10 MINUTE SETUP

---

## ✅ Why Render is Perfect for You

| Feature | Your Need | Render Provides |
|---------|-----------|-----------------|
| **Cost** | Free | ✅ 750 hours/month FREE |
| **Credit Card** | Not needed | ✅ No CC required |
| **Setup Time** | Quick | ✅ 10 minutes |
| **Code Changes** | None | ✅ Zero changes |
| **Scheduled Jobs** | Required | ✅ Fully supported |
| **Uptime** | 24/7 | ✅ Free tier = 24/7 |

---

## 🚀 Step-by-Step Setup (10 Minutes)

### Step 1: Push Code to GitHub (3 min)

If you haven't already:

```bash
# Initialize git (if not done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Ready for Render"

# Create main branch
git branch -M main

# Create repo on GitHub then push:
git remote add origin https://github.com/YOUR_USERNAME/telegram-escrow-bot.git
git push -u origin main
```

**OR** if already have repo:
```bash
git add .
git commit -m "Update for Render deployment"
git push origin main
```

---

### Step 2: Create Render Account (2 min)

1. Go to [https://render.com](https://render.com)
2. Click **"Get Started for Free"**
3. Choose **"Sign up with GitHub"** (easiest)
4. Authorize Render to access GitHub
5. ✅ Done! No credit card needed!

---

### Step 3: Create New Web Service (3 min)

1. **Dashboard** → Click **"New +"** → **"Web Service"**
2. **Connect Repository**:
   - Select your `telegram-escrow-bot` repo
   - Click **"Connect"**

3. **Configure Settings**:
   ```
   Name: telegram-escrow-bot
   Region: Mumbai (India) - or nearest to you
   Branch: main
   Root Directory: (leave blank)
   Runtime: Node
   Build Command: npm install
   Start Command: node bot.js
   ```

4. **Choose Plan**:
   - Select **"Free"** tier
   - ✅ No credit card needed!

5. Click **"Create Web Service"**

---

### Step 4: Add Environment Variables (2 min)

In Render dashboard, go to **"Environment"** tab:

Add these variables one by one:

```
BOT_TOKEN=8655171443:AAE0_0p_TX1Frdq_CkG_VoPLD3ad4cxZFQ0
BOT_USERNAME=CRAZYWORLDINRBOT
MONGODB_URI=mongodb+srv://telegrambotescrow:Aman%40321@telegrambot.vv7nmp0.mongodb.net/telegram-escrow?retryWrites=true&w=majority
SUPER_ADMINS=8571732858,developerkabirthday,Rockseald,7843080067,8751001916,donothingbe,CW_Masculine
MODERATORS=CW_Masculine
ESCROWERS=8571732858,developerkabirthday,Rockseald,7843080067,8751001916,donothingbe,CW_Masculine
DEFAULT_FEE_PERCENT=3
AUTO_CANCEL_TIMEOUT_MINUTES=120
REMINDER_INTERVAL_MINUTES=30
```

⚠️ **IMPORTANT:** Do NOT add `REDIS_URL` (we disabled it)

Click **"Save Changes"**

---

### Step 5: Deploy! (Automatic)

Render will automatically:
1. Pull code from GitHub ✅
2. Install dependencies (`npm install`) ✅
3. Start your bot (`node bot.js`) ✅

**Wait 3-5 minutes** for deployment to complete.

You'll see:
- 🟢 **"Live"** status
- Build logs showing success
- Your bot's URL

---

### Step 6: Test Your Bot! (1 min)

1. Open Telegram
2. Search: `@CRAZYWORLDINRBOT`
3. Send: `/start`

✅ **Bot should respond!**

---

## 📊 What Happens After Deployment

### Automatic Features:
- ✅ **Auto-deploy on push** - Push to GitHub = auto deploy
- ✅ **Auto-restart on crash** - Never goes offline
- ✅ **SSL certificate** - HTTPS automatically
- ✅ **Health checks** - Monitors your bot
- ✅ **Logs** - View in Render dashboard

### Your Bot Will Have:
- ✅ MongoDB connected
- ✅ All commands working
- ✅ Scheduled jobs running (auto-cancel, reminders)
- ✅ 24/7 uptime (750 hours/month = entire month!)

---

## 🔍 Understanding Render Free Tier

### What is "750 hours/month"?

- 750 hours = 24 hours × 31 days = **entire month**
- Your bot runs **24/7 continuously**
- If it uses less (due to crashes), hours roll over

### Does it sleep?

- **Free tier CAN sleep** after 15 min inactivity
- **BUT** your bot uses polling, which sends requests every 300ms
- This **keeps it awake** automatically!
- ✅ **Result:** Bot stays active 24/7

### What if it exceeds 750 hours?

- Won't happen with one bot
- If it does, service pauses until next month
- No unexpected charges (it's free!)

---

## 📝 render.yaml (Optional - For Advanced Setup)

You already have `render.yaml` in your project! This enables **one-click deploy**:

```yaml
services:
  - type: web
    name: telegram-escrow-bot
    env: node
    plan: free
    buildCommand: npm install
    startCommand: node bot.js
    envVars:
      - key: BOT_TOKEN
        sync: false
      - key: MONGODB_URI
        sync: false
      - key: SUPER_ADMINS
        sync: false
      # ... etc
```

With this file, you can use **"Deploy to Render"** button!

---

## 🆘 Troubleshooting

### Build Failed

**Check logs in Render dashboard:**
- Go to your service → **"Logs"** tab
- Look for errors
- Common issues:
  - Missing dependencies → Check `package.json`
  - Node version → Should be 18+
  - Syntax errors → Check recent commits

### Bot Not Responding

**Check:**
1. Logs show "Bot initialized successfully!"
2. MongoDB connected (check logs)
3. Bot token is correct
4. Test with `/start` command

### MongoDB Connection Error

**Fix:**
1. Go to MongoDB Atlas
2. Network Access → Add IP Address
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Wait 2 minutes
5. Restart service in Render

### Environment Variables Not Working

**Check:**
- Saved changes in Environment tab
- No spaces around `=` sign
- Special characters encoded (like `%40` for `@`)
- Restarted service after adding

---

## 🔄 Making Updates

After initial deployment, updates are automatic:

```bash
# Make your changes
git add .
git commit -m "Your update"
git push origin main
```

Render will:
1. Detect push to GitHub
2. Automatically rebuild
3. Deploy new version
4. Zero downtime!

---

## 💰 Cost Breakdown (FREE!)

| Resource | Usage | Cost |
|----------|-------|------|
| Web Service | 750 hours/month | ₹0 |
| Bandwidth | Up to 100GB/month | ₹0 |
| Database | Not included (use MongoDB Atlas) | ₹0 |
| **TOTAL** | | **₹0** |

---

## 🎉 Success Checklist

After deployment, verify:

- [ ] Service status shows "Live" (green)
- [ ] Logs show "MongoDB Connected"
- [ ] Logs show "Bot initialized successfully!"
- [ ] Bot responds to `/start` on Telegram
- [ ] Admin commands work
- [ ] Scheduled jobs running (check logs every 5 min)

---

## 🚀 Next Steps After Deployment

### Immediate:
1. ✅ Test all commands
2. ✅ Create a test deal
3. ✅ Verify scheduled jobs in logs

### Optional Enhancements:
1. **Custom Domain** (free subdomain: `your-bot.onrender.com`)
2. **Log Channel** (forward logs to Telegram channel)
3. **Monitoring** (set up uptime monitoring)

### Scaling (When You Grow):
- Upgrade to paid plan ($7/month) if needed
- Adds more features
- Prevents any sleep
- Priority support

---

## 🆘 Need Help?

### Render Resources:
- **Docs:** https://render.com/docs
- **Community:** https://community.render.com
- **Status:** https://status.render.com

### Common Issues:
- **Build fails:** Check logs, fix package.json
- **Runtime errors:** Check environment variables
- **Database errors:** Whitelist IP in MongoDB Atlas
- **Bot offline:** Check logs, restart service

---

## ✅ Final Checklist Before Deploying

- [ ] Code pushed to GitHub
- [ ] Render account created (with GitHub)
- [ ] `.env` values ready to copy
- [ ] MongoDB Atlas IP whitelist set to `0.0.0.0/0`
- [ ] Bot token is valid
- [ ] No sensitive data in code (all in env vars)

---

## 🎯 Ready to Deploy?

**Follow the steps above and your bot will be live in 10 minutes!**

**Estimated Time:**
- GitHub setup: 3 min
- Render signup: 2 min
- Service creation: 3 min
- Environment variables: 2 min
- Deployment: 5 min
- **Total: ~15 minutes**

**Cost: ₹0**

**Credit Card: Not needed**

---

## 🙏 Pro Tips

1. **Bookmark your Render dashboard** for easy log checking
2. **Enable email notifications** for deployments
3. **Keep GitHub repo private** (free) to protect your code
4. **Monitor usage** in Render dashboard (Settings → Usage)
5. **Join Render community** for help and tips

---

**Your bot is perfect for Render! Let's deploy it! 🚀**

Questions? Check the logs or ask for help!
