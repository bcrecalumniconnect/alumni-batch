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
const keys = require('../client_secret.json');
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

    const opt_2004 = {
        spreadsheetId: '1j01GeDMsHrbm8CQwMy2sBFv4hjkna8uPFw3WGuVahCE',
        range: '2004!A2:D'
    };
    const opt_2005 = {
        spreadsheetId: '1j01GeDMsHrbm8CQwMy2sBFv4hjkna8uPFw3WGuVahCE',
        range: '2005!A2:D'
    };
    const opt_2006 = {
        spreadsheetId: '1j01GeDMsHrbm8CQwMy2sBFv4hjkna8uPFw3WGuVahCE',
        range: '2006!A2:D'
    };
    const opt_2007 = {
        spreadsheetId: '1j01GeDMsHrbm8CQwMy2sBFv4hjkna8uPFw3WGuVahCE',
        range: '2007!A2:D'
    };
    const opt_2008 = {
        spreadsheetId: '1j01GeDMsHrbm8CQwMy2sBFv4hjkna8uPFw3WGuVahCE',
        range: '2008!A2:D'
    };
    const opt_2009 = {
        spreadsheetId: '1j01GeDMsHrbm8CQwMy2sBFv4hjkna8uPFw3WGuVahCE',
        range: '2009!A2:D'
    };
    const opt_2010 = {
        spreadsheetId: '1j01GeDMsHrbm8CQwMy2sBFv4hjkna8uPFw3WGuVahCE',
        range: '2010!A2:D'
    };
    const opt_2011 = {
        spreadsheetId: '1j01GeDMsHrbm8CQwMy2sBFv4hjkna8uPFw3WGuVahCE',
        range: '2011!A2:D'
    };
    const opt_2012 = {
        spreadsheetId: '1j01GeDMsHrbm8CQwMy2sBFv4hjkna8uPFw3WGuVahCE',
        range: '2012!A2:D'
    };
    const opt_2013 = {
        spreadsheetId: '1j01GeDMsHrbm8CQwMy2sBFv4hjkna8uPFw3WGuVahCE',
        range: '2013!A2:D'
    };
    const opt_2014 = {
        spreadsheetId: '1j01GeDMsHrbm8CQwMy2sBFv4hjkna8uPFw3WGuVahCE',
        range: '2014!A2:D'
    };
    const opt_2015 = {
        spreadsheetId: '1j01GeDMsHrbm8CQwMy2sBFv4hjkna8uPFw3WGuVahCE',
        range: '2015!A2:D'
    };
    const opt_2016 = {
        spreadsheetId: '1j01GeDMsHrbm8CQwMy2sBFv4hjkna8uPFw3WGuVahCE',
        range: '2016!A2:D'
    };
    const opt_2017 = {
        spreadsheetId: '1j01GeDMsHrbm8CQwMy2sBFv4hjkna8uPFw3WGuVahCE',
        range: '2017!A2:D'
    };
    const opt_2018 = {
        spreadsheetId: '1j01GeDMsHrbm8CQwMy2sBFv4hjkna8uPFw3WGuVahCE',
        range: '2018!A2:D'
    };
    const opt_2019 = {
        spreadsheetId: '1j01GeDMsHrbm8CQwMy2sBFv4hjkna8uPFw3WGuVahCE',
        range: '2019!A2:D'
    };

    try {
        let data = await gsapi.spreadsheets.values.get(opt_2019);
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

    var serviceAccount = require("../firebase-key.json");

    var project = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://alumni-bcrec.firebaseio.com"
    });

    firebaseapp.initializeApp({
        serviceAccount: '../firebase-key.json',
        databaseURL: "https://alumni-bcrec.firebaseio.com"
    });


    const db = admin.firestore();
    let y = 0;
    let id = '';
    for (let i = 0; i < alumnilist.length; i++) {
        var data = getDataFromExcel(alumnilist[i]);
        id = alumnilist[i][3] + '_' + alumnilist[i][0];
        console.log(id)
        var data = getDataFromExcel(alumnilist[i]);
        AddData(db, data, id);
    }


    //console.log('done');

}


function AddData(db, data, id) {
    db.collection('CollegeData').doc(id)
        .set(data, { merge: true }).then(() => {
            console.log('Added from college: ' + id);            
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
        'Id': alumni[3] + '_' + alumni[0],
        'Name': alumni[1] == undefined ? '' : alumni[1].toString().trim().toUpperCase(),
        'Department': alumni[2] == undefined ? '' : alumni[2].toString().trim(),
        'GraduationYear': alumni[3]
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