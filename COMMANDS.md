# CredSphere - Local Development Commands

Quick reference for running CredSphere locally.

---

## ⚡ Quick Start (3 commands)

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open in browser
# Navigate to: http://localhost:5173
```

**Done!** The app will auto-reload when you save changes.

---

## 📋 All Available Commands

### Development

```bash
# Start dev server with hot reload
npm run dev
```

After running, open your browser to `http://localhost:5173`

The dev server will:
- Auto-reload on file changes
- Show errors in the terminal
- Enable source maps for debugging
- Connect to live Supabase database

---

### Building

```bash
# Build for production
npm run build
```

Creates an optimized `dist/` folder ready for deployment.

**Output:** ~1.2 MB total (365 KB gzipped)

---

### Code Quality

```bash
# Check TypeScript types
npm run typecheck

# Run ESLint
npm run lint
```

---

### Preview

```bash
# Build and preview production build locally
npm run preview
```

Then open `http://localhost:4173` to see your production build.

---

## 🔧 Environment Setup

All environment variables are already configured in `.env`:

```
VITE_SUPABASE_URL=https://xusxocwdxemozzwmkyap.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_PINATA_GATEWAY=https://gateway.pinata.cloud
```

**No additional setup needed!** The app uses:
- Supabase PostgreSQL database (remote)
- Pinata IPFS gateway (remote)
- Ethereum Sepolia testnet (remote)

---

## 🔐 Demo Credentials

Use these accounts to test different roles:

### Student
```
Email: student@university.edu
Password: student123
```
Can receive and view credentials, create share links, generate QR codes.

### Institution
```
Email: institution@university.edu
Password: inst123
```
Can issue credentials after admin authorization.

### Admin
```
Email: admin@acadchain.com
Password: admin123
```
Can approve/reject institution authorization requests.

### Employer/Verifier
```
Email: verifier@employer.com
Password: verify123
```
Can verify credentials via share links or public token ID.

**Promo Code (for free access):** `TRINETRA`

---

## 🌐 Browser Requirements

### Wallet Setup
1. Install **MetaMask** extension
   - Chrome: https://chrome.google.com/webstore/
   - Firefox: https://addons.mozilla.org/

2. Connect to **Ethereum Sepolia Testnet**
   - MetaMask will auto-prompt when needed
   - Or manually add: Sepolia Testnet (chainId: 11155111)

3. Get **Sepolia ETH** (free testnet funds)
   - Go to: https://sepoliafaucet.com
   - Paste your wallet address
   - Receive 0.5 ETH per request

---

## 🚀 Smart Contract Info

**Deployed on Sepolia Testnet:**

```
Contract Address: 0x4fc085056423592277734de8D10328C0875C9dA3
Network: Ethereum Sepolia (chainId: 11155111)
View on Etherscan: https://sepolia.etherscan.io/address/0x4fc085056423592277734de8D10328C0875C9dA3
```

The contract is already deployed—no additional contract deployment needed.

---

## 📁 Project Structure

```
CredSphere/
├── src/
│   ├── components/          # React UI components
│   │   ├── AdminPanel.tsx
│   │   ├── StudentWallet.tsx
│   │   ├── InstitutionDashboard.tsx
│   │   ├── VerificationPortal.tsx
│   │   ├── dashboard/       # Operations dashboard
│   │   └── ...
│   ├── utils/               # Business logic
│   │   ├── blockchain.ts    # Smart contract interaction
│   │   ├── ipfs.ts         # IPFS upload/retrieval
│   │   ├── supabase.ts     # Database operations
│   │   └── subscriptions.ts # Payment logic
│   ├── types/               # TypeScript interfaces
│   ├── contracts/           # Smart contract ABI
│   ├── App.tsx             # Main routing
│   ├── main.tsx            # Entry point
│   └── index.css            # Global styles
├── contracts/               # Solidity source
│   └── AcademicCredentials.sol
├── supabase/                # Database migrations
│   └── migrations/
├── vite.config.ts          # Build configuration
├── tailwind.config.js      # TailwindCSS config
└── package.json            # Dependencies

dist/                       # Production build (after npm run build)
node_modules/              # Dependencies (after npm install)
.env                       # Environment variables (already configured)
```

---

## 🐛 Troubleshooting

### Issue: "Module not found"
```bash
# Solution: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Issue: MetaMask not connecting
```
1. Make sure MetaMask is installed
2. Switch to Sepolia Testnet network
3. Refresh the page
4. Try connecting wallet again
```

### Issue: IPFS upload fails
```
- Check your internet connection
- Pinata gateway is up: https://gateway.pinata.cloud
- Try again in 10 seconds
```

### Issue: Smart contract call fails
```
1. Make sure you're on Sepolia testnet
2. You have Sepolia ETH: https://sepoliafaucet.com
3. Check Etherscan for recent transactions
```

### Issue: Supabase connection error
```
- Check internet connection
- Verify .env file has correct credentials
- Supabase status: https://status.supabase.com
```

### Issue: Port 5173 already in use
```bash
# Kill process on port 5173
# macOS/Linux:
lsof -ti:5173 | xargs kill -9

# Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Then restart:
npm run dev
```

---

## 🚢 Deployment

### Deploy to Vercel (1 click)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy production build
vercel --prod
```

Vercel will:
1. Run `npm run build`
2. Deploy `dist/` folder
3. Generate production URL
4. Enable auto-deployments from git

---

### Deploy to Netlify

```bash
# Build first
npm run build

# Then drag-drop dist/ folder to Netlify.com
# Or use Netlify CLI:
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

---

## 📊 Database Migrations

View all applied migrations:

```bash
# All migrations are auto-applied to Supabase
# View in Supabase Dashboard:
https://app.supabase.com/project/xusxocwdxemozzwmkyap
```

Migrations include:
- `credentials` table
- `credential_shares` table
- `audit_logs` table
- `institution_authorization_requests` table
- `student_profiles` table
- `pricing_plans` table
- `user_subscriptions` table
- `payment_transactions` table
- `promo_codes` table

All tables have Row-Level Security (RLS) enabled.

---

## 🔍 Testing the App Locally

### 1. Issue a Credential (Institution)
```
1. Go to http://localhost:5173
2. Login as institution@university.edu / inst123
3. Click "Issue Credential"
4. Upload PDF/PNG document
5. Fill in credential details
6. Click "Mint NFT"
7. Confirm transaction in MetaMask
8. Wait for blockchain confirmation
```

### 2. View Credential (Student)
```
1. Login as student@university.edu / student123
2. Go to "Student Wallet"
3. View all received credentials
4. Click to see 3D showcase
5. Rotate, flip, zoom the card
```

### 3. Share Credential (Student)
```
1. In Student Wallet, click credential
2. Click "Generate Share Link"
3. Set expiration time
4. Copy link
5. Send to someone else
```

### 4. Verify Credential (Employer)
```
1. Open shared link from browser
2. See credential details
3. Verify blockchain proof
4. View IPFS document
```

### 5. Admin Authorization (Admin)
```
1. Login as admin@acadchain.com / admin123
2. Go to "Authorization Requests"
3. See pending institution requests
4. Click "Approve" or "Reject"
5. Enter reason/notes
6. Confirm action
```

---

## 📈 Performance Tips

### Speed Up Dev Server
```bash
# Clear cache and reinstall
rm -rf node_modules .vite
npm install
npm run dev
```

### Reduce Build Time
```bash
# Only rebuild changed modules
npm run build -- --watch
```

### Check Bundle Size
```bash
# Build and analyze
npm run build
# Check dist/assets/ file sizes
```

---

## 🔗 Useful Links

- **Localhost**: http://localhost:5173
- **Supabase Dashboard**: https://app.supabase.com/project/xusxocwdxemozzwmkyap
- **Smart Contract**: https://sepolia.etherscan.io/address/0x4fc085056423592277734de8D10328C0875C9dA3
- **Sepolia Faucet**: https://sepoliafaucet.com
- **MetaMask**: https://metamask.io
- **Pinata Gateway**: https://gateway.pinata.cloud
- **Documentation**: See `final.md` for full project analysis

---

## ✅ Pre-Judging Checklist

Before submitting or demoing:

```bash
# 1. Install dependencies
npm install

# 2. Check types
npm run typecheck

# 3. Run linter
npm run lint

# 4. Build production
npm run build

# 5. Preview production build
npm run preview
# (open http://localhost:4173)

# 6. Start dev server for demo
npm run dev
# (open http://localhost:5173)

# 7. Test all flows with demo credentials
- Issue credential (institution)
- View credential (student)
- Create share link (student)
- Verify credential (employer)
- Admin authorization (admin)
```

All commands should complete without errors.

---

## 💬 Need Help?

If something doesn't work:

1. **Check the terminal** for error messages
2. **Clear cache**: `rm -rf node_modules .vite && npm install`
3. **Check connections**: Internet, MetaMask, Supabase
4. **Verify environment**: `.env` file has all keys
5. **Review logs**: Browser console (F12 → Console tab)

---

**Ready to run?** Start with:

```bash
npm install && npm run dev
```

Then open http://localhost:5173 in your browser!
