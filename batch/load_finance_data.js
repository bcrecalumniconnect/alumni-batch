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
var memberList = [];
var year = 2019;

var serviceAccount = require("../firebase-key.json");

var project = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://alumni-bcrec.firebaseio.com"
});

firebaseapp.initializeApp({
    serviceAccount: '../firebase-key.json',
    databaseURL: "https://alumni-bcrec.firebaseio.com"
});

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

    const opt_2019 = {
        spreadsheetId: '1eALtp25C-f_YJzOGQbigngR95WKlav1ZOjPGhPt1i_w',
        range: '2019!A2:F'
    };


    try {
        let data = await gsapi.spreadsheets.values.get(opt_2019);
        //console.log(data);
        //console.log(data.headers);
        alumnilist = data.data.values;
        //console.log(alumnilist);
        console.log('Total Records :' + data.data.values.length);
        LoadMemberData();
        //getFinancefromDb(alumnilist);
    } catch (e) {
        console.log(e);
    }

}


async function getFinancefromDb(alumnilist, memberlist) {

    const db = admin.firestore();
    let y = 0;
    let id = '';
    let email = '';
    for (let i = 0; i < alumnilist.length; i++) {
        email = '';
        if (alumnilist[i][4] != undefined && alumnilist[i][4].trim() != '') {
            var data = getDataFromExcel(alumnilist[i]);
            id = alumnilist[i][2] + '_' + alumnilist[i][4];
            console.log(id)
            var data = getDataFromExcel(alumnilist[i]);
            var found = memberlist.find(function (element) {
                return element.Id == id;
            });
            if (found != undefined && found != null) {
                console.log(found);
                //email = found.Email;
                data.Email = found.Email;
            }
            
            AddData(db, data, id);
        }

    }


    //console.log('done');

}


function AddData(db, data, id) {
    db.collection('FinanceData' + year.toString()).doc(id)
        .set(data, { merge: true }).then(() => {
            console.log('Added from finance: ' + id);
        })
        .catch(c => {
            console.log('Error# ' + id + ' ' + c);
        });

}

function LoadMemberData() {
    memberList = [];
    admin.firestore().collection('Members').where("RollNumber", ">", "").get()
        .then(result => {
            result.docs.forEach(x => {
                const data = x.data();
                //console.log(JSON.stringify(x));
                memberList.push({
                    Id: data.GraduationYear + "_" + data.RollNumber,
                    Department: data.Department,
                    Name: data.FirstName + " " + data.LastName,
                    Email: x.id
                });
            });
            //console.log(JSON.stringify(memberList));
            getFinancefromDb(alumnilist, memberList);
        })
        .catch(c => {
            console.log('members ' + c);
        });
}

function UpdateEmail(id) {

}

function getDataFromExcel(alumni) {
    //if (alumni[0] == 'Souvik') {
    //    console.log(alumni);
    //}

    return {
        'Id': alumni[2] + '_' + alumni[4],
        'Name': alumni[1].trim(),
        'Amount': alumni[5] == undefined ? 0 : parseFloat(alumni[5].trim()),
        'AlumniYear': year
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