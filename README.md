# 🛡️ Telegram Escrow Bot

A production-grade, enterprise-level Telegram escrow bot for managing secure transactions in group chats with premium UI/UX, automation, analytics, and admin control.

![Telegram](https://img.shields.io/badge/Telegram-Bot-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-brightgreen)
![Redis](https://img.shields.io/badge/Redis-Cache-red)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## ✨ Features

### 🔐 Core Functionality
- **Unique Trade IDs** - Collision-safe format (#TIDXXXXXX)
- **Full Deal Lifecycle** - Created → Paid → Delivered → Completed
- **Smart Fee System** - Configurable percentage with auto-calculation
- **Premium UI Messages** - Professional escrow-style formatting
- **Interactive Buttons** - Inline keyboards for quick actions

### 👥 User Features
- Personal trading statistics & analytics
- View pending deals instantly
- Complete deal history tracking
- Global leaderboard by volume
- Success rate calculations

### 🛡️ Admin Features
- Role-based access control (Super Admin, Moderator, Escrower)
- Create deals with `/add @buyer @seller amount`
- Full deal management commands
- Blacklist/unblacklist users
- Real-time analytics dashboard
- Broadcast announcements

### ⚙️ Automation
- Auto-cancel stale deals (configurable timeout)
- Payment reminders every 30 minutes
- Delivery reminders every hour
- Scheduled cron jobs

### 🔒 Security
- Redis-based rate limiting
- User blacklist system
- Input validation
- Duplicate prevention
- Comprehensive audit logging

---

## 📁 Project Structure

```
telegram-escrow-bot/
├── config/              # Database & Redis configuration
├── models/              # MongoDB schemas (Trade, User, Admin, etc.)
├── services/            # Business logic (Trade, User, Notification, etc.)
├── handlers/            # Command & callback handlers
│   ├── commands/
│   │   ├── admin/      # Admin-only commands
│   │   └── user/       # Public user commands
│   ├── callbacks/       # Inline button handlers
│   └── index.js         # Handler registration
├── middleware/          # Auth, rate limiting, error handling
├── jobs/                # Scheduled cron jobs
├── keyboards/           # Reply & inline keyboards
├── utils/               # Helpers, validators, templates
├── bot.js               # Main entry point
├── package.json
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- MongoDB database (local or Atlas)
- Redis server (optional but recommended)
- Telegram Bot Token from [@BotFather](https://t.me/BotFather)

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd telegram-escrow-bot
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` file with your credentials:
```env
BOT_TOKEN=your_telegram_bot_token_here
BOT_USERNAME=YourEscrowBot

MONGODB_URI=mongodb://localhost:27017/telegram-escrow
REDIS_URL=redis://localhost:6379

DEFAULT_FEE_PERCENT=3
AUTO_CANCEL_TIMEOUT_MINUTES=120
LOG_CHANNEL_ID=-1001234567890

SUPER_ADMINS=your_username
MODERATORS=mod_username
ESCROWERS=escrower_username
```

4. **Start the bot**
```bash
# Development
npm run dev

# Production
npm start
```

---

## 📋 Commands

### User Commands
| Command | Description |
|---------|-------------|
| `/start` | Start bot & see main menu |
| `/mystats` | View your trading statistics |
| `/mypending` | See your pending deals |
| `/history` | View completed/cancelled deals |
| `/trade [ID]` | Get details of a specific trade |
| `/leaderboard` | Top traders by volume |

### Admin Commands
| Command | Description |
|---------|-------------|
| `/add @buyer @seller amount` | Create new escrow deal |
| `/paid [ID]` | Mark deal as paid |
| `/deliver [ID]` | Mark as delivered |
| `/release [ID]` | Release funds to seller |
| `/cancel [ID]` | Cancel a deal |
| `/dispute [ID] reason` | Open dispute |
| `/setfee percent` | Update global fee % |
| `/blacklist @user reason` | Ban a user |
| `/unblacklist @user` | Unban user |
| `/stats` | Admin analytics dashboard |
| `/pending` | View all pending deals |
| `/alltrades` | List all trades |

---

## 💼 How It Works

### Creating a Deal

Admin sends:
```
/add @john @jane 500
```

Bot creates:
- Unique Trade ID: #TID847293
- Amount: ₹500
- Fee (3%): ₹15
- Release Amount: ₹485
- Status: Waiting Payment

### Deal Flow

1. **Created** → Buyer & Seller notified
2. **Paid** (`/paid`) → Funds secured in escrow
3. **Delivered** (`/deliver`) → Buyer confirms receipt
4. **Completed** (`/release`) → Funds released to seller

Alternative paths:
- Any state → **Cancelled** (`/cancel`)
- Paid/Delivered → **Disputed** (`/dispute`)

---

## 🗄️ Database Schema

### Trade Model
```javascript
{
  tradeId: "#TID847293",
  buyer: { userId, username },
  seller: { userId, username },
  escrower: { userId, username },
  amount: 500,
  feePercent: 3,
  feeAmount: 15,
  releaseAmount: 485,
  status: "PAID",
  timestamps: { createdAt, paymentAt, ... }
}
```

### User Model
```javascript
{
  userId: "123456789",
  username: "john",
  totalDeals: 47,
  completedDeals: 42,
  totalVolume: 23450,
  successRate: 89.4,
  rank: 23
}
```

---

## 🎨 Premium UI Features

All messages use professional formatting:

```
━━━━━━━━━━━━━━━━━━━━
🛡️ ESCROW DEAL CREATED
━━━━━━━━━━━━━━━━━━━━

📋 DEAL DETAILS
├─ Trade ID: #TID847293
├─ Buyer: @username
├─ Seller: @username
└─ Escrowed By: @admin

💰 AMOUNT BREAKDOWN
├─ Total Amount: ₹1,000.00
├─ Fee (3%): ₹30.00
└─ Release Amount: ₹970.00

📊 STATUS: ⏳ Waiting Payment
━━━━━━━━━━━━━━━━━━━━
```

---

## 🌐 Deployment

### Option 1: Render

1. Push code to GitHub
2. Create new Web Service on Render
3. Connect GitHub repository
4. Add environment variables
5. Create MongoDB Atlas cluster
6. Create Redis instance (Render Redis)
7. Deploy!

**render.yaml:**
```yaml
services:
  - type: web
    name: telegram-escrow-bot
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: BOT_TOKEN
        sync: false
      - key: MONGODB_URI
        sync: false
      - key: REDIS_URL
        sync: false
```

### Option 2: VPS (Ubuntu/Debian)

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Install Redis
sudo apt-get install -y redis-server

# Clone and setup
git clone <repo>
cd telegram-escrow-bot
npm install --production
cp .env.example .env
nano .env  # Configure variables

# Run with PM2
sudo npm install -g pm2
pm2 start bot.js --name escrow-bot
pm2 startup
pm2 save
```

### Option 3: Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
CMD ["node", "bot.js"]
```

```bash
docker build -t escrow-bot .
docker run -d --env-file .env escrow-bot
```

---

## 🔧 Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `BOT_TOKEN` | ✅ | - | Telegram Bot API token |
| `BOT_USERNAME` | ✅ | - | Bot's Telegram username |
| `MONGODB_URI` | ✅ | - | MongoDB connection string |
| `REDIS_URL` | ❌ | - | Redis connection URL |
| `DEFAULT_FEE_PERCENT` | ❌ | 3 | Default fee percentage |
| `AUTO_CANCEL_TIMEOUT_MINUTES` | ❌ | 120 | Auto-cancel after X minutes |
| `LOG_CHANNEL_ID` | ❌ | - | Channel ID for audit logs |
| `SUPER_ADMINS` | ❌ | - | Comma-separated usernames |
| `MODERATORS` | ❌ | - | Comma-separated usernames |
| `ESCROWERS` | ❌ | - | Comma-separated usernames |

---

## 📊 Monitoring & Logging

The bot includes comprehensive logging:

- **Console logs** - Real-time output
- **File logs** - `logs/error.log` and `logs/combined.log`
- **Database logs** - All actions stored in `logs` collection
- **Channel logs** - Forwarded to Telegram log channel (if configured)

---

## 🛡️ Security Best Practices

1. **Never commit `.env` file**
2. **Use strong MongoDB passwords**
3. **Enable Redis authentication**
4. **Restrict admin commands to trusted users**
5. **Regular database backups**
6. **Monitor rate limiting alerts**

---

## 🧪 Testing

Test the bot locally:

```bash
# Start MongoDB
mongod

# Start Redis
redis-server

# Run bot in development mode
npm run dev
```

Use [@BotFather](https://t.me/BotFather) to create a test bot.

---

## 📈 Performance Optimization

- **Redis caching** - Rate limiting & session storage
- **MongoDB indexes** - Optimized queries
- **Pagination** - Load large datasets efficiently
- **Scheduled jobs** - Background processing

---

## 🤝 Support & Contributing

For issues, questions, or contributions:

1. Open an issue on GitHub
2. Check existing documentation
3. Review code comments

---

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

---

## 🙏 Credits

- Built with [node-telegram-bot-api](https://github.com/yagop/node-telegram-bot-api)
- Database: [MongoDB](https://www.mongodb.com/)
- Caching: [Redis](https://redis.io/)
- Scheduling: [node-cron](https://github.com/node-cron/node-cron)

---

## 📞 Contact

For business inquiries or support:
- Telegram: [@YourUsername](https://t.me/YourUsername)
- Email: your@email.com

---

**Made with ❤️ for secure Telegram trading**
