// test-auth.js
// Purpose: Just verify that your service account credentials work
// and you can successfully call a Google API endpoint.

const { GoogleAuth } = require('google-auth-library');
const path = require('path');

const KEY_FILE = path.join(__dirname, 'service-account.json');
const PROJECT_ID = 'pref-test-30121'; // 🔁 Replace this

async function testAuth() {
  console.log('🔐 Step 1: Loading service account credentials...');

  let auth;
  try {
    auth = new GoogleAuth({
      keyFile: KEY_FILE,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    console.log('✅ Credentials loaded successfully\n');
  } catch (err) {
    console.error('❌ Failed to load credentials:', err.message);
    console.error('👉 Make sure service-account.json exists in the same folder');
    process.exit(1);
  }

  console.log('🌐 Step 2: Requesting access token from Google...');
  let token;
  try {
    const client = await auth.getClient();
    const tokenResponse = await client.getAccessToken();
    token = tokenResponse.token;
    console.log('✅ Access token received successfully');
    console.log('🔑 Token preview:', token.substring(0, 30) + '...\n');
  } catch (err) {
    console.error('❌ Failed to get access token:', err.message);
    console.error('👉 Check if your service account has correct permissions');
    process.exit(1);
  }

  console.log('📡 Step 3: Making a test API call to Firebase...');
  try {
    const { default: fetch } = await import('node-fetch');

    // Using Google Cloud Resource Manager API — works for ANY Google/Firebase project
    const url = `https://cloudresourcemanager.googleapis.com/v1/projects/${PROJECT_ID}`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const text = await res.text();

    // Check if response is HTML (error page) instead of JSON
    if (text.trim().startsWith('<')) {
      console.error('❌ Got an HTML response — likely an invalid project ID or endpoint');
      console.error('👉 Double check your PROJECT_ID in this file');
      process.exit(1);
    }

    const data = JSON.parse(text);

    if (res.status === 403) {
      console.error('❌ 403 Forbidden — Service account lacks permissions');
      console.error('👉 Go to Firebase Console → Project Settings → Service Accounts');
      process.exit(1);
    }

    if (res.status === 404) {
      console.error('❌ 404 — Project not found. Check your PROJECT_ID');
      process.exit(1);
    }

    if (res.status === 200) {
      console.log('✅ API call succeeded!');
      console.log(`📦 Project Name : ${data.name}`);
      console.log(`📦 Project ID   : ${data.projectId}`);
      console.log(`📦 Project No.  : ${data.projectNumber}`);
      console.log('\n🎉 AUTH IS WORKING CORRECTLY — Ready to fetch Performance data! 🎉');
    }
  } catch (err) {
    console.error('❌ API call failed:', err.message);
  }
}

testAuth();