# Firebase Performance Tracker

A simple Node.js tool to automate fetching API performance data (p50, p85, p95) from Firebase.

---

## 🚀 Getting Started

### Step 1 — Get your Service Account JSON
1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Select your project
3. Gear icon → **Project Settings** → **Service Accounts**
4. Click **"Generate new private key"** → Download JSON
5. Replace `service-account.json` in this folder with that file

### Step 2 — Update your Project ID
Open `test-auth.js` and replace:
```js
const PROJECT_ID = 'YOUR_PROJECT_ID';
```
With your actual Firebase project ID (found in Project Settings → General)

### Step 3 — Run the auth test
```bash
node test-auth.js
```

You should see:
```
✅ AUTH IS WORKING CORRECTLY ✅
```

---

## 📁 File Structure
```
firebase-perf-tracker/
├── test-auth.js          ← Run this first to verify setup
├── service-account.json  ← Replace with your downloaded credentials
├── package.json
└── README.md
```

---

## ⚠️ Important
- Never commit `service-account.json` to GitHub
- Add it to `.gitignore` if you push this project
