# ⚡ Quick Start Guide

Get your Telegram Escrow Bot running in 5 minutes!

---

## 🎯 Prerequisites

- Node.js 18+ installed
- A Telegram account
- 5 minutes of time

---

## Step 1: Get Your Bot Token (2 min)

1. Open Telegram and search for [@BotFather](https://t.me/BotFather)
2. Send `/newbot` command
3. Choose a name (e.g., "My Escrow Bot")
4. Choose a username (must end with `bot`, e.g., `my_escrow_bot`)
5. **Copy the token** - looks like: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`

---

## Step 2: Setup Project (1 min)

```bash
# Clone or download this project
cd telegram-escrow-bot

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

---

## Step 3: Configure .env (1 min)

Open `.env` file and add your bot token:

```env
BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
BOT_USERNAME=my_escrow_bot

# For testing, you can use local MongoDB without authentication
MONGODB_URI=mongodb://localhost:27017/telegram-escrow

# Redis is optional - comment out if not available
# REDIS_URL=redis://localhost:6379

# Set yourself as super admin (your Telegram username without @)
SUPER_ADMINS=your_telegram_username
```

---

## Step 4: Run the Bot (30 sec)

```bash
npm start
```

You should see:
```
✅ MongoDB Connected
✅ Bot initialized successfully!
📡 Polling started...
```

---

## Step 5: Test on Telegram (30 sec)

1. Open Telegram
2. Search for your bot by username (e.g., `@my_escrow_bot`)
3. Send `/start`
4. You should see the welcome menu!

---

## 🎉 Success!

Your bot is now running! Try these commands:

### As a User:
- `/start` - See main menu
- `/mystats` - View your stats
- `/leaderboard` - See top traders

### As an Admin:
- `/add @buyer @seller 100` - Create a test deal
- `/stats` - View analytics
- `/pending` - See pending deals

---

## 📝 Next Steps

### For Production Deployment:

1. **Setup MongoDB Atlas** (free cloud database)
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Create free cluster
   - Update `MONGODB_URI` in `.env`

2. **Deploy to Render** (free hosting)
   - Push code to GitHub
   - Deploy on [render.com](https://render.com)
   - Add environment variables
   - See [DEPLOYMENT.md](DEPLOYMENT.md) for full guide

3. **Configure Admin Team**
   - Add trusted usernames to `SUPER_ADMINS` in `.env`
   - Restart bot

4. **Setup Log Channel** (optional)
   - Create private Telegram channel
   - Add bot as admin
   - Add channel ID to `LOG_CHANNEL_ID`

---

## 🆘 Troubleshooting

### Bot doesn't respond
- Check if bot token is correct
- Ensure bot is not blocked
- Check console for errors

### MongoDB connection error
- Start MongoDB: `mongod`
- Or use MongoDB Atlas connection string

### Commands not working
- Make sure you're using correct format
- Check if username has @ prefix (remove it)
- Restart bot after .env changes

---

## 💡 Tips

1. **Test thoroughly** before adding real users
2. **Backup your .env file** securely
3. **Start with small amounts** when testing
4. **Add yourself as both buyer and seller** for testing
5. **Monitor logs** regularly

---

## 📚 Documentation

- Full README: [README.md](README.md)
- Deployment guide: [DEPLOYMENT.md](DEPLOYMENT.md)
- Command list: See README Commands section

---

## 🆘 Need Help?

1. Check error logs first
2. Review README.md
3. Check DEPLOYMENT.md
4. Open GitHub issue

---

**Happy Trading! 🚀**
