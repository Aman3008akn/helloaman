# 🚀 RENDER.COM DEPLOYMENT GUIDE

## ✅ DEPLOYMENT STEPS:

### Step 1: GitHub पर Push करो
```bash
# Terminal में:
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/telegram-escrow-bot.git
git push -u origin main
```

### Step 2: Render Account बनाओ
1. https://render.com पर जाओ
2. GitHub से signup करो
3. "Connect account" पर क्लिक करो

### Step 3: New Web Service बनाओ
1. Dashboard से "New +" → "Web Service"
2. अपना repository चुनो
3. Settings fill करो:
   - **Name:** telegram-escrow-bot
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node bot.js`
   - **Region:** India (Mumbai) - या nearest
   - **Plan:** Free

### Step 4: Environment Variables Add करो
Render dashboard में "Environment" section:

```
BOT_TOKEN=your_telegram_bot_token
BOT_USERNAME=your_bot_username
MONGODB_URI=your_mongodb_connection_string
REDIS_URL=your_redis_url
SUPER_ADMINS=yourname,adminname
DEFAULT_FEE_PERCENT=3
AUTO_CANCEL_TIMEOUT_MINUTES=120
REMINDER_INTERVAL_MINUTES=30
```

### Step 5: Deploy करो
1. "Deploy" button click करो
2. Wait करो 5-10 minutes
3. Status "Live" हो जाए तो success ✅

---

## 📊 RENDER VS अन्य OPTIONS:

| Feature | Render (Free) | Railway | DigitalOcean |
|---------|--------------|---------|-------------|
| Cost | Free | $5/month | $5/month |
| Uptime | 24/7 | 24/7 | 99.99% |
| Auto Deploy | GitHub | GitHub | Manual |
| Cold Start | Yes (30s) | No | None |
| Best For | Dev/Testing | Small Bots | Production |

---

## 🔄 DATABASE SETUP:

### MongoDB Atlas (Free):
1. https://www.mongodb.com/cloud/atlas पर जाओ
2. Free cluster बनाओ
3. Connection string copy करो
4. `.env` में paste करो: `MONGODB_URI=...`

### Redis Cloud (Free):
1. https://redis.com/cloud पर जाओ
2. Free database बनाओ
3. Connection string copy करो
4. `.env` में paste करो: `REDIS_URL=...`

---

## ✨ PRO TIPS:

1. **Error देखने के लिए:**
   - Render dashboard → Logs
   
2. **Auto Redeploy:**
   - GitHub को push करो → automatically deploy हो जाए
   
3. **Polling vs Webhook:**
   - Render free के साथ polling बेहतर है
   - Webhook के लिए custom domain चाहिए

4. **Cold Start Issue:**
   - Render 15 mins inactive के बाद sleep करता है
   - `/start` command से reactivate होगा

---

## 🆘 अगर कोई Issue आए:

```
❌ BOT_TOKEN missing → Environment variables check करो
❌ Database error → MongoDB Connection String verify करो
❌ Polling error → Logs में error देखो
❌ Timeout → Railway या DigitalOcean try करो
```

---

## 📱 अब तुम्हारा Setup:

✅ Localhost (Local Development) - Laptop on
✅ PM2 Process Manager - Laptop on  
✅ Render Cloud (NEW) - 24/7 Active! 🎉

---

**Ready to deploy? Just push to GitHub !**
