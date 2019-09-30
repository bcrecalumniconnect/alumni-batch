var express = require("express"),
    fs = require('fs'),
    readline = require('readline'),
    request = require('request'),
    app = express();
var bodyParser = require('body-parser');
var logger = require('morgan');
var admin = require("firebase-admin");
var firebaseapp = require("firebase");
const { google } = require('googleapis');
const keys = require('./client_secret.json');
const { Url } = require('url');
const client = new google.auth.JWT(
    keys.client_email,
    null,
    keys.private_key,
    ['https://www.googleapis.com/auth/spreadsheets']
);
var http = require('http');
var port = process.env.PORT || '8080';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(logger('dev'));
app.set('view-engine', 'ejs');
app.use(express.static('views'));
app.set('views', __dirname + '/views');

var alumnilist = [];

client.authorize(function (err, tokens) {
    if (err) {
        console.log(err);
        return;
    }
    console.log('connected');
    readSheet(client);
    //startServer();

    //startApp();
});

async function readSheet(cl) {
    const gsapi = google.sheets(
        { version: 'v4', auth: cl });

    const opt = {
        spreadsheetId: '1y-FdwD2xOVciNPpat9Dvs9nJcue9JKHu_cAQfUgKAS4',
        range: 'Form Responses 1!B2:S'
    };

    const opt2 = {
        spreadsheetId: '1VGztjZcG6LtNEPJ-4mfk728O6UcEnD4Rc5d34GUJyQU',
        range: 'Sheet1!A2:B'
    };



    try {
        let data = await gsapi.spreadsheets.values.get(opt);
        //console.log(data);
        //console.log(data.headers);
        alumnilist = data.data.values;
        //console.log(alumnilist);
        console.log('Total Records :' + data.data.values.length);

        getAlumnifromDb(alumnilist);
    } catch (e) {
        console.log(e);
    }

}


async function getAlumnifromDb(alumnilist) {

    var serviceAccount = require("./firebase-key.json");

    var project = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://alumni-bcrec.firebaseio.com"
    });

    firebaseapp.initializeApp({
        serviceAccount: './firebase-key.json',
        databaseURL: "https://alumni-bcrec.firebaseio.com"
    });


    const db = admin.firestore();
    let y = 0;
    let email = '';
    for (let i = 0; i < alumnilist.length; i++) {
        var data = getDataFromExcel(alumnilist[i]);
        email = alumnilist[i][4];
        email = email.toLowerCase();
        //const obj = JSON.parse(data);
        //console.log('#' + i);
        AddData(db, data, email);
    }


    //console.log('done');

}

function AddPermissionData(db, id, email) {

    db.collection('CollegeData').doc(id)
        .set({ 'IsRegistered': true, 'Email' : email }, { merge: true }).then(() => {

            console.log('Added permission for: ' + email);
        })
        .catch(c => {
            console.log('Error# adding permission ' + email + ' ' + c);
        });


}

function AddData(db, data, email) {
    db.collection('Members').doc(email)
        .set(data, { merge: true }).then(() => {

            console.log('Processed: ' + email);
            let studentId = '';
            if (data.RollNumber != '') {
                studentId = data.GraduationYear + '_' + data.RollNumber;
                //console.log(studentId);
                //console.log('Permission for ' + studentId);
                AddPermissionData(db, studentId, email)
            }

        })
        .catch(c => {
            console.log('Error# ' + email + ' ' + c);
        });

}


function getDataFromExcel(alumni) {
    //if (alumni[0] == 'Souvik') {
    //    console.log(alumni);
    //}
    return {
        'FirstName': alumni[0],
        'MiddleName': alumni[1] == undefined ? '' : alumni[1],
        'LastName': alumni[2] == undefined ? '' : alumni[2],
        'Sex': alumni[3] == undefined ? '' : alumni[3],
        'Phone': alumni[5] == undefined ? '' : alumni[5],
        'GraduationYear': alumni[6] == undefined ? '' : alumni[6],
        'DateOfBirth': alumni[7] == undefined ? null : alumni[7],
        'Department': alumni[8] == undefined ? '' : alumni[8],
        'Profession': alumni[9] == undefined ? '' : alumni[9],
        'JobDescription': alumni[10] == undefined ? '' : alumni[10],
        'BloodGroup': alumni[11] == undefined ? '' : alumni[11],
        'Organization': alumni[12] == undefined ? '' : alumni[12],
        'City': alumni[13] == undefined ? '' : alumni[13],
        'Region': alumni[14] == undefined ? '' : alumni[14],
        'Address': alumni[15] == undefined ? '' : alumni[15],
        'RollNumber': alumni[17] == undefined ? '' : alumni[17]
    };
}



async function startServer() {
    http.createServer(function (req, res) {

        if (req.url === '/') {
            fs.createReadStream(__dirname + '/index.htm').pipe(res);
        } else if (req.url === '/alumni') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            var obj = {
                firstname: 'John',
                lastname: 'Doe'
            };
            res.end(JSON.stringify(alumnilist[0]));
            //res.end(alumnilist[0]);
        } else {
            res.writeHead(404);
            res.end();
        }


    }).listen(8080, '127.0.0.1');
}

async function startApp() {

    app.get('/', function (request, response) {
        response.render('home.ejs');
    }
    );

    app.post('/new', function (request, response) {
        console.log(request.body.fname);
        var member = {
            'FirstName': request.body.fname,
            'LastName': request.body.lname
        };



        response.render('addnew.ejs', { data: member });
    }

    );

    app.listen(port,
        function () {
            console.log('App running on port ' + port);
        });
}