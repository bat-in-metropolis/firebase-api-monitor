// test-sheets.js
// Purpose: Verify the service account can authenticate against the
// Google Sheets API and round-trip a value (write → read).

const path = require('path');
require('dotenv').config();
const { google } = require('googleapis');

const KEY_FILE = path.join(__dirname, 'service-account.json');
const SHEET_ID = process.env.SHEET_ID;
const RANGE = 'Sheet1!A1:B1';

async function testSheets() {
  console.log('🔐 Step 1: Loading service account credentials...');
  let auth;
  try {
    auth = new google.auth.GoogleAuth({
      keyFile: KEY_FILE,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    console.log('✅ Credentials loaded successfully\n');
  } catch (err) {
    console.error('❌ Failed to load credentials:', err.message);
    console.error('👉 Make sure service-account.json exists in the same folder');
    process.exit(1);
  }

  console.log('🌐 Step 2: Building Sheets API client...');
  let sheets;
  try {
    sheets = google.sheets({ version: 'v4', auth });
    console.log('✅ Sheets client ready\n');
  } catch (err) {
    console.error('❌ Failed to build Sheets client:', err.message);
    process.exit(1);
  }

  if (!SHEET_ID || SHEET_ID === '<paste-sheet-id-here>') {
    console.error('❌ SHEET_ID is not set.');
    console.error('👉 Open test-sheets.js and paste your sheet ID at the top.');
    console.error('   Find it in the sheet URL: https://docs.google.com/spreadsheets/d/<THIS_PART>/edit');
    process.exit(1);
  }

  const timestamp = new Date().toISOString();

  console.log(`✍️  Step 3: Writing to ${RANGE}...`);
  try {
    const writeRes = await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: RANGE,
      valueInputOption: 'RAW',
      requestBody: {
        values: [['Hello from Node.js', timestamp]],
      },
    });
    console.log(`✅ Write succeeded — ${writeRes.data.updatedCells} cells updated\n`);
  } catch (err) {
    handleApiError(err, 'write');
    process.exit(1);
  }

  console.log(`📖 Step 4: Reading ${RANGE} back...`);
  try {
    const readRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: RANGE,
    });
    const row = readRes.data.values && readRes.data.values[0];
    console.log('✅ Read succeeded');
    console.log('📦 Row 1:', JSON.stringify(row));
    console.log('\n🎉 SHEETS CONNECTION WORKING — Ready to write performance data! 🎉');
  } catch (err) {
    handleApiError(err, 'read');
    process.exit(1);
  }
}

function handleApiError(err, op) {
  const status = err.code || (err.response && err.response.status);
  const googleMsg =
    (err.response && err.response.data && err.response.data.error && err.response.data.error.message) ||
    err.message;

  console.error(`❌ ${op} failed (HTTP ${status || '?'}): ${googleMsg}`);

  if (status === 403) {
    if (/SERVICE_DISABLED|has not been used|is disabled/i.test(googleMsg)) {
      console.error('👉 Google Sheets API is NOT enabled for this Cloud project.');
      console.error('   Enable it here: https://console.cloud.google.com/apis/library/sheets.googleapis.com?project=pref-test-30121');
      console.error('   (Wait ~1 minute after enabling, then retry.)');
    } else {
      console.error('👉 Likely the service account is not shared on the sheet as Editor.');
      console.error('   Open the sheet → Share → add the client_email from service-account.json as Editor.');
    }
  } else if (status === 404) {
    console.error('👉 SHEET_ID is wrong, or the sheet was deleted.');
    console.error('   Double-check SHEET_ID in your .env file (paste only the ID, not the full URL).');
  } else if (googleMsg && googleMsg.includes('Unable to parse range')) {
    console.error('👉 The first tab might not be named "Sheet1" — rename it, or update RANGE in this file.');
  }
}

testSheets();
