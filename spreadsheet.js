const GoogleSpreadsheet = require('google-spreadsheet');
const {google} = require('googleapis');
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';

const {promisify} = require('util');
const creds = require('./client_secret.json');
const sheets = google.sheets({
	version, auth
});

function getAlumniData(){
	const doc = new GoogleSpreadsheet('1y-FdwD2xOVciNPpat9Dvs9nJcue9JKHu_cAQfUgKAS4');
	//await promisify(doc.useServiceAccountAuth)(creds);
	//const info = await promisify(doc.getInfo)();
	//const sheet = info.worksheets[0];
	//console.log(`Rows: ${sheet.rowCount}`);
}

getAlumniData();