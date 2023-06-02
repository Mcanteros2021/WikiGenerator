import { google } from 'googleapis';
import fs from 'fs';
import main from "./index.js"

async function getCredentials(credentialsPath) {
    try {
        return JSON.parse(fs.readFileSync(credentialsPath));
    } catch (error) {
        console.error('Error retrieving credentials:', error);
        throw error;
    }
}

async function authorizeClient(credentials, scope) {
    try {
        const client = new google.auth.JWT(
            credentials.client_email,
            null,
            credentials.private_key,
            scope
        );
        await client.authorize();
        return client;
    } catch (error) {
        console.error('Error authorizing client:', error);
        throw error;
    }
}

async function processKeywords() {
    const sheet =  process.env.SHEET;
    const fileId = process.env.EXCEL_ID;

    // Retrieve credentials and authorize the client
    const credentialsPath = './credentials.json';
    const scope = ['https://www.googleapis.com/auth/spreadsheets'];

    const credentials = await getCredentials(credentialsPath);
    const client = await authorizeClient(credentials, scope);

    // Create the Sheets API instance
    const sheetsAPI = google.sheets({ version: 'v4', auth: client });

    try {
        const keywords = await readFirstColumn(fileId, sheet);

        for (let i = 0; i < keywords.length; i++) {
            const keyword = keywords[i];

            // Check if the cell next to the keyword (headline cell) already has content
            const headlineRange = `${sheet}!B${i + 2}`;
            const headlineResponse = await sheetsAPI.spreadsheets.values.get({
                spreadsheetId: fileId,
                range: headlineRange,
            });

            // If the headline cell already has content, skip this keyword
            if (headlineResponse.data.values && headlineResponse.data.values.length > 0) {
                continue;
            }

            const data = await main(keyword);
            const headline = data.title;
            const subheadlines = data.subheadlines;
            const contents = data.contents;

            await updateGoogleSheetsFile(
                fileId,
                sheet,
                i + 2, // Row corresponding to the keyword
                headline,
                subheadlines,
                contents
            );
        }
    } catch (error) {
        console.error('Error processing keywords:', error);
    }
}

async function updateGoogleSheetsFile(fileId, sheet, row, headline, subheadlines, contents) {
    try {
        const credentialsPath = './credentials.json';
        const scope = ['https://www.googleapis.com/auth/spreadsheets'];

        const credentials = await getCredentials(credentialsPath);
        const client = await authorizeClient(credentials, scope);
        const sheetsAPI = google.sheets({ version: 'v4', auth: client });

        if (subheadlines && contents) {
            // Define the range of cells to update with content
            const range = `${sheet}!B${row}:M${row}`;

            const contentValues = [[headline, ...subheadlines, ...contents]];

            await sheetsAPI.spreadsheets.values.update({
                spreadsheetId: fileId,
                range: range,
                valueInputOption: 'USER_ENTERED',
                requestBody: { values: contentValues },
            });

            console.log('File updated successfully.');
        } else {
            console.error('Subheadlines or contents are undefined.');
        }
    } catch (error) {
        console.error('Error updating the file:', error);
    }
}

async function readFirstColumn(fileId, sheet) {
    const range = `${sheet}!A2:A`;

    try {
        const credentialsPath = './credentials.json';
        const scope = ['https://www.googleapis.com/auth/spreadsheets'];

        const credentials = await getCredentials(credentialsPath);
        const client = await authorizeClient(credentials, scope);
        const sheetsAPI = google.sheets({ version: 'v4', auth: client });

        const response = await sheetsAPI.spreadsheets.values.get({
            spreadsheetId: fileId,
            range: range,
        });

        const columnValues = response.data.values;

        if (columnValues && columnValues.length) {
            const column = columnValues.map((row) => row[0]);
            console.log('Values in the first column:', column);
            return column;
        } else {
            console.log('No values found in the first column.');
            return [];
        }
    } catch (error) {
        console.error('Error reading the first column:', error);
        return [];
    }
}

processKeywords();
