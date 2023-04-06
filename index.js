const express = require("express");
const { v4: uuidv4 } = require("uuid");

const { getTableRow } = require("./src/utils/usersUtils");
const { getAuthSheets } = require("./src/services/authServices");

const app = express();
app.use(express.json());

async function getAuth() {
  const { auth, client, googleSheets, spreadsheetId } = await getAuthSheets();

  return {
    auth,
    client,
    googleSheets,
    spreadsheetId,
  };
}

app.get("/auth", async (req, res) => {
  const { googleSheets, auth, spreadsheetId } = await getAuth();

  const { data } = await googleSheets.spreadsheets.get({
    auth,
    spreadsheetId,
  });

  res.send(data);
});

app.get("/users", async (req, res) => {
  const { googleSheets, auth, spreadsheetId } = await getAuth();

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
  const { googleSheets, auth, spreadsheetId } = await getAuth();

  const { values } = req.body;

  const newUserData = [[uuidv4(), values.name, values.phone, values.email]];

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
  const { googleSheets, auth, spreadsheetId } = await getAuth();

  const userRegisters = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: "Página1",
    valueRenderOption: "UNFORMATTED_VALUE",
    dateTimeRenderOption: "FORMATTED_STRING",
  });

  const { values } = req.body;

  const bodyID = values.id;
  const rows = userRegisters.data.values;
  let rowIndex = getTableRow(rows, bodyID);

  // For delete a Row it's necessary inform the row index of row will be excluded in the startIndex field.
  // The endIndex field will be the next row index after the startIndex.

  const batchUpdateRequest = [
    {
      deleteDimension: {
        range: {
          sheetId: 0,
          dimension: "ROWS",
          startIndex: rowIndex,
          endIndex: rowIndex + 1,
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
  const { auth, googleSheets, spreadsheetId } = await getAuth();

  const { data } = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: "Página1",
    valueRenderOption: "UNFORMATTED_VALUE",
    dateTimeRenderOption: "FORMATTED_STRING",
  });

  const { values } = req.body;

  const bodyID = values.id;
  const rows = data.values;
  const rowIndex = getTableRow(rows, bodyID);

  const userData = [[bodyID, values.name, values.phone, values.email]];

  const updateValue = await googleSheets.spreadsheets.values.update({
    auth,
    spreadsheetId,
    valueInputOption: "USER_ENTERED",
    range: `Página1!A${rowIndex + 1}:D${rowIndex + 1}`,
    resource: {
      values: userData,
    },
  });

  res.send(updateValue.data);
});

app.listen(3001, () => console.log("Application running on in 3001 port"));
