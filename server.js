// server.js

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
const fs = require('fs');

const app = express();
const PORT = 3000;

// טוענים את קובץ ה-Credentials שהורדת מגוגל (service account)
const CREDENTIALS = require('./durable-destiny-445417-k3-940b56802e02.json');
const { client_email, private_key } = CREDENTIALS;

// הגדרת ההרשאות ל-Sheets API
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const auth = new google.auth.JWT(client_email, null, private_key, SCOPES);

// יוצרים אובייקט sheets
const sheets = google.sheets({ version: 'v4', auth });

// מזהה הגיליון (שים כאן את ה-SPREADSHEET_ID שלך)
const SPREADSHEET_ID = '1uVsuLmDuS4YXG-LJPm-4DB1iNtrPBwYLj1DblrtZI_Q';

// מאפשר לשרת לפרש נתוני טופס
app.use(bodyParser.urlencoded({ extended: true }));

// מגישים את קבצי ה-HTML, CSS, וכו' מהתיקייה client_side
app.use(express.static(path.join(__dirname, 'client_side')));

// נקודת קצה לקבלת הטופס
app.post('/submit-form', async (req, res) => {
  try {
    // שליפת השדות מהטופס
    const { email, fullName, age, attendance } = req.body;

    // הגדרת השורה החדשה שנרצה להכניס
    const newRow = [[email, fullName, age, attendance]];
    
    // קריאה ל-Sheets API כדי להוסיף את המידע
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A:D',  // טווח לדוגמה: אם השדות שלך A,B,C,D
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: newRow,
      },
    });

    // לאחר ההצלחה, נחזיר הודעה ללקוח
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

// הרצת השרת
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
