# 🎮 Kebrchacha Bingo

A modern, real-time multiplayer bingo game built with React and Vite, optimized for Telegram WebApp.

## 🏗️ Architecture

- **Frontend:** Vite + React 19 (deployed on cPanel)
- **Backend:** Node.js + Express + Socket.io (deployed on Render)
- **Database:** MySQL (Aiven)
- **Real-time:** Socket.io WebSockets
- **Bot:** Telegram Bot API

## 🚀 Quick Start

### Frontend Development
```bash
cd kebrchacha-vite
npm install
npm run dev
```

### Backend Development
```bash
cd server
npm install
npm run dev
```

## 📁 Project Structure

```
kebrchacha-vite/          # Frontend (Vite + React 19)
├── src/
│   ├── components/       # React components
│   ├── App.jsx          # Main app
│   └── main.jsx         # Entry point
├── package.json
└── vite.config.js

server/                   # Backend API (Node.js + Express)
├── routes/              # API endpoints
├── middleware/          # Auth & validation
├── socket/              # Socket.io handlers
├── database/            # Database schema
├── config/              # Configuration
├── index.js            # Server entry
└── package.json        # Backend dependencies

cpanel-vite-upload/      # Production build (ready to upload)
├── index.html
├── assets/             # Optimized CSS/JS
└── .htaccess          # Performance config
```

## 🎯 Features

- ✅ Real-time multiplayer bingo
- ✅ Telegram WebApp integration
- ✅ Dual wallet system (Main + Play)
- ✅ Card selection (1-100 cards)
- ✅ Auto-daub functionality
- ✅ Spectator mode
- ✅ Admin panel
- ✅ Mobile-responsive design

## 🔧 Tech Stack

**Frontend:**
- React 19
- Vite 8
- Tailwind CSS
- Socket.io Client
- Axios

**Backend:**
- Node.js
- Express
- Socket.io
- MySQL (Aiven)
- Cloudinary

## 📱 Deployment

### Frontend (cPanel)
Upload files from `cpanel-vite-upload/` to your cPanel public_html directory.

### Backend (Render)
Deploy the `server/` directory to Render:
- **URL:** `https://bingo-mini-app-sily.onrender.com`
- **Build Command:** `npm install`
- **Start Command:** `npm start`

## 🌐 API Endpoints

- **Health:** `/health`
- **Auth:** `/api/auth/*`
- **Wallet:** `/api/wallet/*`
- **Game:** `/api/game/*`
- **Admin:** `/api/admin/*`

## 🎮 Usage

1. Start with @Odabingobot on Telegram
2. Send `/start` to register
3. Access via Telegram WebApp
4. Deposit funds and start playing!

## 📊 Performance

- **Frontend Bundle:** ~378KB (83% smaller than CRA)
- **Load Time:** <2 seconds
- **Build Time:** <2 seconds with Vite
- **Backend:** Optimized API-only deployment

---

Built with ❤️ for maximum performance and user experience.