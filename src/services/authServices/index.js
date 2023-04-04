const express = require("express");
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

exports.getAuthSheets = getAuthSheets;
