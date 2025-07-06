
# 🪙 Token Platform

A full-stack **Next.js** application for displaying, creating, and trading tokens on the **Solana blockchain** — with real-time updates, wallet integration, and bonding curve tracking.

---

## 🚀 Features

* ✅ Real-time token updates via **WebSocket**
* 🔐 Connect Solana wallets (Phantom, Solflare, Backpack)
* 📈 Trade tokens (buy/sell) directly from the interface
* 🧠 View detailed token data, price, liquidity, and market cap
* 🛠️ Create your own token in a few clicks
* ⚙️ Bonding curve support via gRPC integration
* 🗃️ Token metadata storage via **Supabase** database

---

## 🛠️ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/token-platform.git
cd token-platform
```

### 2. Install Dependencies

```bash
npm install

### 3. Environment Setup

Create a `.env.local` file in the root directory and add:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

> 🔐 *Note: Keep your anon key private. Never expose sensitive data in public repos.*

### 4. Start the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

---

## 💡 Usage Guide

### 🔌 Connect Wallet

Click the **“Connect Wallet”** button in the navbar to connect Phantom, Solflare, or Backpack wallets.

### 🧾 View Tokens

Tokens are categorized into:

* 🟢 **New Tokens** – Market Cap < \$10K
* 🟠 **Bonding Tokens** – \$10K to \$50K
* 🔵 **Graduated Tokens** – > \$50K

### 📊 Trade Tokens

1. Click **“Trade”** on a token card.
2. A dialog opens with buy/sell options.
3. Enter the amount.
4. Click **Buy** or **Sell**.

Or go to the `/trade` route and enter any token's **Contract Address** to trade.

### 🛠️ Create Token

Click the **“Create Coin”** button, enter the required details, and confirm with SOL to generate a token on-chain.

---

## ⚙️ Architecture Overview

* **Frontend:** Next.js 15 (App Router), React 19
* **Wallet Connection:** `@solana/wallet-adapter`
* **Real-Time Updates:** WebSocket (`wss://pumpportal.fun/api/data`)
* **Token Metadata Storage:** Supabase
* **Bonding Curve Price Tracking:** gRPC (custom integration)

---

## 📦 Notes

* All gRPC bonding curve updates use a custom integration (repo link coming soon).
* Ensure your system supports **Node.js 18+** for WebSocket and gRPC compatibility.
* Use modern browsers for best performance.
* user can also shiftyrpc and also user websocket with pumpfun

## TradingView chart library 
* we use GMGN ai api for rendering the real time chart in the website for each token
* and updated the price and liquidty with mvex api 
