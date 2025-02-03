// Load environment variables
require('dotenv').config();

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { google } = require('googleapis');

const app = express();
const PORT = 3000;

// Use environment variables to set up the credentials
const credentials = {
  client_email: process.env.GOOGLE_CLIENT_EMAIL,
  private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
};

// Destructure from the credentials object
const { client_email, private_key } = credentials;

// Set up Google Sheets API authentication
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const auth = new google.auth.JWT(client_email, null, private_key, SCOPES);

// Create a Sheets API client
const sheets = google.sheets({ version: 'v4', auth });

// Your Spreadsheet ID (ensure this is correct – just the ID string, without additional parameters)
const SPREADSHEET_ID = '1uVsuLmDuS4YXG-LJPm-4DB1iNtrPBwYLj1DblrtZI_Q';

// Middleware to parse urlencoded form data
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the "client_side" directory
app.use(express.static(path.join(__dirname, 'client_side')));

// Endpoint to handle form submission
app.post('/submit-form', async (req, res) => {
  try {
    // Extract data from the form (now including the phone field)
    const { email, fullName, age, attendance, phone } = req.body;
    
    // Create a new row with the received data
    // שימו לב: אנו מוסיפים את השדה phone, ולכן נעדכן גם את הטווח לגיליון בהתאם (A:E)
    const newRow = [[email, fullName, age, attendance, phone]];

    // Append the new row to the spreadsheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A:E',
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: newRow },
    });

    // שליחת תגובה למשתמש עם הודעת הצלחה
    res.send(`
      <html dir="rtl">
        <head>
          <meta charset="UTF-8">
          <title>תודה על ההרשמה</title>
        </head>
        <body style="text-align:center; margin-top:50px;">
          <h1>תודה על ההרשמה!</h1>
          <p>הנתונים נשמרו בהצלחה בגיליון Google Sheets.</p>
          <a href="/">לחזרה לעמוד הראשי</a>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Error saving to Google Sheets:', error);
    res.status(500).send('ארעה שגיאה בשמירת הנתונים, אנא נסה שוב מאוחר יותר.');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
