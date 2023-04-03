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
    [uuidv4(), "Aline Ribeiro", "51940028922", "alineribeiro98@gmail"],
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
