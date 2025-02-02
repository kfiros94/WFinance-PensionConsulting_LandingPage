// server.js

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const XLSX = require('xlsx');
const fs = require('fs');

const app = express();
const PORT = 3000;

//(Content-Type: application/x-www-form-urlencoded)
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'client_side')));


app.post('/submit-form', (req, res) => {
  // get fields from the form
  const { email, fullName, age, attendance } = req.body;

  // Save the file
  const filePath = 'submissions.xlsx';

  // check if file exists
  let workbook;
  let worksheet;

  if (fs.existsSync(filePath)) {
    // if exists we read it
    workbook = XLSX.readFile(filePath);
    worksheet = workbook.Sheets[workbook.SheetNames[0]];
  } else {
    //if file does not exist- create a new one
    workbook = XLSX.utils.book_new();
    //headlines
    worksheet = XLSX.utils.aoa_to_sheet([
      ['Email', 'Full Name', 'Age', 'Attendance']
    ]);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Submissions');
  }

  //make a new tuple
  const newRow = [email, fullName, age, attendance];

  // detecet the current range
  const range = XLSX.utils.decode_range(worksheet['!ref']);
  const newRowNumber = range.e.r + 1;

  // write each cell in the new row
  for (let col = 0; col < newRow.length; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: newRowNumber, c: col });
    worksheet[cellAddress] = { t: 's', v: newRow[col] };
  }

  range.e.r = newRowNumber;
  worksheet['!ref'] = XLSX.utils.encode_range(range);

  //Save the fie
  XLSX.writeFile(workbook, filePath);

  //message to the user
  res.send(`
    <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>תודה על ההרשמה</title>
      </head>
      <body style="text-align:center; margin-top:50px;">
        <h1>תודה על ההרשמה!</h1>
        <p>הנתונים נשמרו בהצלחה. מצפים לראותכם</p>
        <a href="/">לחזרה לעמוד הראשי</a>
      </body>
    </html>
  `);
});

//Run the Server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
