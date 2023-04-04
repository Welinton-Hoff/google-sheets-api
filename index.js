const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { google } = require("googleapis");

const app = express();
app.use(express.json());

async function getAuthSheets() {
  const auth = new google.auth.GoogleAuth({
    keyFile: "credentials.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets",
  });

  const client = await auth.getClient();

  const googleSheets = google.sheets({
    version: "v4",
    auth: client,
  });

  const spreadsheetId = "1nzy0equCQGFiboQc1a13M5lnXH9vN0yC6_0r-VOu6kE";

  return {
    auth,
    client,
    googleSheets,
    spreadsheetId,
  };
}

app.get("/auth", async (req, res) => {
  const { googleSheets, auth, spreadsheetId } = await getAuthSheets();

  const { data } = await googleSheets.spreadsheets.get({
    auth,
    spreadsheetId,
  });

  res.send(data);
});

app.get("/users", async (req, res) => {
  const { googleSheets, auth, spreadsheetId } = await getAuthSheets();

  const { data } = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: "Página1",
    valueRenderOption: "UNFORMATTED_VALUE",
    dateTimeRenderOption: "FORMATTED_STRING",
  });

  const rows = data.values;

  if (rows.length > 1) {
    const formattedData = [];

    for (let index = 0; index < rows.length; index++) {
      if (index !== 0) {
        const element = rows[index];

        formattedData.push({
          Id: element[0],
          Name: element[1],
          Phone: element[2],
          Email: element[3],
        });
      }
    }

    res.send({
      Response: formattedData,
    });
    return;
  }

  res.send({
    Response: rows,
  });
});

app.post("/users", async (req, res) => {
  const { googleSheets, auth, spreadsheetId } = await getAuthSheets();

  const { values } = req.body;

  const newUserData = [
    [
      uuidv4(),
      "Matheus da Silva",
      "37940028922",
      "matheuszinhoreidelas@gmail.com",
    ],
  ];

  const row = await googleSheets.spreadsheets.values.append({
    auth,
    spreadsheetId,
    range: "Página1",
    valueInputOption: "USER_ENTERED",
    resource: {
      values: newUserData,
    },
  });

  res.send(row.data);
});

app.post("/deleteUser", async (req, res) => {
  const { googleSheets, auth, spreadsheetId } = await getAuthSheets();

  // For delete a Row it's necessary inform the row index of row will be excluded in the startIndex field.
  // The endIndex field will be the next row index after the startIndex.

  const batchUpdateRequest = [
    {
      deleteDimension: {
        range: {
          sheetId: 0,
          dimension: "ROWS",
          startIndex: 3,
          endIndex: 4,
        },
      },
    },
  ];

  const { data } = await googleSheets.spreadsheets.batchUpdate({
    auth,
    spreadsheetId: spreadsheetId,
    resource: {
      requests: batchUpdateRequest,
    },
  });

  res.send(data);
});

app.post("/updateUser", async (req, res) => {
  const { googleSheets, spreadsheetId } = await getAuthSheets();

  const { values } = req.body;

  const updateValue = await googleSheets.spreadsheets.values.update({
    spreadsheetId,
    range: "Página1!A2:C2",
    valueInputOption: "USER_ENTERED",
    resource: {
      values: values,
    },
  });

  res.send(updateValue.data);
});

app.listen(3001, () => console.log("Application running on in 3001 port"));
