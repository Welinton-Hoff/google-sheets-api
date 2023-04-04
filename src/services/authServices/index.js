require("dotenv").config();

const express = require("express");
const { google } = require("googleapis");

const baseUrl = process.env["BASE_URL"];
const spreadsheetId = process.env["SPREAD_SHEET_ID"];

const app = express();
app.use(express.json());

async function getAuthSheets() {
  const auth = new google.auth.GoogleAuth({
    keyFile: "credentials.json",
    scopes: baseUrl,
  });

  const client = await auth.getClient();

  const googleSheets = google.sheets({
    version: "v4",
    auth: client,
  });

  return {
    auth,
    client,
    googleSheets,
    spreadsheetId,
  };
}

exports.getAuthSheets = getAuthSheets;
