# 🚀 Deployment Guide - Telegram Escrow Bot

Complete step-by-step instructions for deploying to production environments.

---

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Render Deployment (Recommended)](#render-deployment)
3. [VPS Deployment](#vps-deployment)
4. [Docker Deployment](#docker-deployment)
5. [Heroku Deployment](#heroku-deployment)
6. [Post-Deployment Setup](#post-deployment-setup)
7. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

Before deploying, ensure you have:

- ✅ Telegram Bot Token from [@BotFather](https://t.me/BotFather)
- ✅ MongoDB connection string (MongoDB Atlas or local)
- ✅ Redis URL (optional but recommended)
- ✅ Log channel ID (if using Telegram logging)
- ✅ Admin usernames configured

### Get Your Bot Token

1. Message [@BotFather](https://t.me/BotFather) on Telegram
2. Send `/newbot` command
3. Follow prompts to name your bot
4. **Save the token** - it looks like: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`

### MongoDB Setup (Atlas)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Create database user
4. Whitelist IP: `0.0.0.0/0` (all IPs for cloud)
5. Get connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/telegram-escrow?retryWrites=true&w=majority
   ```

### Redis Setup

**Option 1: Redis Cloud (Free)**
- [Redis Labs](https://redislabs.com/try-free/)
- Get connection URL

**Option 2: Render Redis**
- Create Redis instance in Render dashboard
- Copy internal URL

**Option 3: Skip Redis**
- Bot will work without it (rate limiting disabled)

---

## Render Deployment

### Step 1: Prepare Repository

1. Push code to GitHub/GitLab
2. Ensure `.env.example` is in repo (NOT `.env`)

### Step 2: Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Navigate to Dashboard

### Step 3: Create Web Service

1. Click **New** → **Web Service**
2. Connect your repository
3. Configure:
   - **Name**: `telegram-escrow-bot`
   - **Region**: Choose closest to users
   - **Branch**: `main`
   - **Root Directory**: Leave blank
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free or Standard

### Step 4: Add Environment Variables

In Render dashboard, add these variables:

```
BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
BOT_USERNAME=YourEscrowBot

MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/telegram-escrow
REDIS_URL=redis://default:password@redis-host:port

DEFAULT_FEE_PERCENT=3
AUTO_CANCEL_TIMEOUT_MINUTES=120
LOG_CHANNEL_ID=-1001234567890

SUPER_ADMINS=your_username
MODERATORS=mod_username
ESCROWERS=escrower_username
```

### Step 5: Deploy

1. Click **Create Web Service**
2. Wait for build (2-5 minutes)
3. Check logs for "✅ Bot initialized successfully!"
4. Test bot on Telegram

**Cost**: Free tier available (web service sleeps after 15 min inactivity)

---

## VPS Deployment

### Prerequisites

- Ubuntu/Debian VPS (DigitalOcean, Linode, Vultr, etc.)
- SSH access
- Root or sudo privileges

### Step 1: Connect to VPS

```bash
ssh root@your-vps-ip
```

### Step 2: Install Dependencies

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install Git
apt install -y git

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
apt update
apt install -y mongodb-org
systemctl start mongod
systemctl enable mongod

# Install Redis
apt install -y redis-server
systemctl start redis-server
systemctl enable redis-server
```

### Step 3: Clone Repository

```bash
cd /var/www
git clone https://github.com/yourusername/telegram-escrow-bot.git
cd telegram-escrow-bot
```

### Step 4: Install Dependencies

```bash
npm install --production
```

### Step 5: Configure Environment

```bash
cp .env.example .env
nano .env
```

Edit with your values, then save (Ctrl+X, Y, Enter).

### Step 6: Setup PM2 (Process Manager)

```bash
# Install PM2 globally
npm install -g pm2

# Start bot
pm2 start bot.js --name escrow-bot

# Auto-start on boot
pm2 startup
# Run the command it outputs (with sudo)
pm2 save
```

### Step 7: Setup Firewall

```bash
# Allow only necessary ports
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP (if needed)
ufw allow 443/tcp   # HTTPS (if needed)
ufw enable
```

### Step 8: Monitor

```bash
# View logs
pm2 logs escrow-bot

# Status
pm2 status

# Restart if needed
pm2 restart escrow-bot
```

**Cost**: $5-10/month (VPS) + your time

---

## Docker Deployment

### Step 1: Create Dockerfile

Already included in repo:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
CMD ["node", "bot.js"]
```

### Step 2: Build Image

```bash
docker build -t telegram-escrow-bot .
```

### Step 3: Run Container

```bash
docker run -d \
  --name escrow-bot \
  --restart unless-stopped \
  --env-file .env \
  telegram-escrow-bot
```

### Step 4: Docker Compose (Optional)

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  bot:
    build: .
    container_name: escrow-bot
    restart: unless-stopped
    env_file: .env
    depends_on:
      - mongo
      - redis
  
  mongo:
    image: mongo:6
    container_name: escrow-mongo
    volumes:
      - mongo-data:/data/db
    ports:
      - "27017:27017"
  
  redis:
    image: redis:alpine
    container_name: escrow-redis
    ports:
      - "6379:6379"

volumes:
  mongo-data:
```

Run:
```bash
docker-compose up -d
```

**Cost**: Free (local) or VPS cost

---

## Heroku Deployment

### Step 1: Install Heroku CLI

```bash
# macOS
brew tap heroku/brew && brew install heroku

# Ubuntu/Debian
curl https://cli-assets.heroku.com/install.sh | sh
```

### Step 2: Login & Create App

```bash
heroku login
heroku create your-escrow-bot
```

### Step 3: Set Environment Variables

```bash
heroku config:set BOT_TOKEN=1234567890:ABCdef...
heroku config:set BOT_USERNAME=YourEscrowBot
heroku config:set MONGODB_URI=mongodb+srv://...
heroku config:set REDIS_URL=redis://...
heroku config:set DEFAULT_FEE_PERCENT=3
heroku config:set SUPER_ADMINS=your_username
```

### Step 4: Deploy

```bash
git push heroku main
```

### Step 5: Check Logs

```bash
heroku logs --tail
```

**Note**: Heroku no longer has free tier ($7/month minimum)

---

## Post-Deployment Setup

### 1. Verify Bot is Running

Check logs for:
```
✅ Bot initialized successfully!
🤖 Bot Username: @YourEscrowBot
📡 Polling started...
```

### 2. Test Basic Commands

In Telegram:
```
/start
/mystats
```

### 3. Configure Bot Privacy Mode

1. Message [@BotFather](https://t.me/BotFather)
2. `/mybots` → Select your bot
3. **Bot Settings** → **Group Privacy** → Disable

This allows bot to see all group messages.

### 4. Add Bot to Groups

1. Create Telegram group or use existing
2. Add bot as **Admin** (required for full functionality)
3. Test `/add` command

### 5. Setup Log Channel (Optional)

1. Create private Telegram channel
2. Add bot as admin
3. Get channel ID (use [@RawDataBot](https://t.me/RawDataBot))
4. Add to `.env`:
   ```
   LOG_CHANNEL_ID=-1001234567890
   ```

### 6. Configure Admin Roles

Update `.env` with trusted usernames:
```
SUPER_ADMINS=your_username
MODERATORS=mod1,mod2
ESCROWERS=escrower1,escrower2
```

Restart bot after changes.

---

## Troubleshooting

### Bot Won't Start

**Check logs:**
```bash
# Render
View logs in dashboard

# VPS with PM2
pm2 logs escrow-bot

# Docker
docker logs escrow-bot
```

**Common issues:**
- Missing `BOT_TOKEN` - Check .env
- MongoDB connection failed - Verify connection string
- Port already in use - Change PORT variable

### Database Connection Errors

**MongoDB Atlas:**
1. Check IP whitelist (allow 0.0.0.0/0)
2. Verify username/password
3. Ensure cluster is not paused

**Local MongoDB:**
```bash
systemctl status mongod
mongosh --eval "db.adminCommand('ping')"
```

### Rate Limit Issues

If users report rate limiting:
- Increase limit in `middleware/rateLimiter.js`
- Or disable Redis temporarily

### Commands Not Working

1. Check bot is admin in group
2. Verify privacy mode is disabled
3. Ensure username format is correct (@username)

### Memory Issues

Monitor memory usage:
```bash
# VPS
free -h
pm2 monit

# Reduce memory
export NODE_OPTIONS="--max-old-space-size=256"
```

---

## Performance Optimization

### Enable Compression

Add to `bot.js`:
```javascript
process.env.NODE_ENV = 'production';
```

### Database Indexing

Already configured in models. Verify:
```javascript
// In MongoDB shell
db.trades.getIndexes()
db.users.getIndexes()
```

### Redis Caching

Ensure Redis is connected:
```bash
redis-cli ping
# Should return: PONG
```

---

## Backup Strategy

### Database Backups

**MongoDB Atlas:**
- Automatic backups enabled by default
- Configure retention in Atlas dashboard

**Local MongoDB:**
```bash
mongodump --out /backup/mongodb
```

### Environment Variables Backup

Securely backup `.env` file:
```bash
# Encrypt and store
gpg -c .env
scp .env.gpg secure-backup-location
```

---

## Security Hardening

1. **Use environment-specific tokens**
2. **Enable MongoDB authentication**
3. **Configure Redis AUTH**
4. **Regular dependency updates**
   ```bash
   npm audit
   npm update
   ```
5. **Monitor logs daily**
6. **Use fail2ban for SSH**
7. **Enable firewall (UFW)**
8. **Regular security audits**

---

## Scaling Considerations

When you outgrow free tier:

1. **Upgrade MongoDB** - Atlas dedicated cluster
2. **Add Redis Cluster** - For high traffic
3. **Load Balancer** - Multiple bot instances
4. **CDN** - For static assets (if web dashboard)
5. **Monitoring** - Sentry, Datadog, New Relic

---

## Support

For deployment issues:
- Check logs first
- Review this guide completely
- Search GitHub issues
- Contact support

---

**Happy Deploying! 🚀**
