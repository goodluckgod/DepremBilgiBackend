const express = require('express');
const app = express();
const port = 3005;
const got = require('got');

const mysql = require('mysql2');
const bodyParser = require('body-parser')

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

this.earthquakes = []

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

let connection = null;

// create the connection to database
connection = mysql.createConnection({
    host: 'db4free.net',
    user: "deprembilgi",
    database: "deprembilgi",
    password: "deprembilgi2023",
    port: 3306,
})

connection.addListener('error', function (err) {
    connection = mysql.createConnection({
        host: 'db4free.net',
        user: "deprembilgi",
        database: "deprembilgi",
        password: "deprembilgi2023",
        port: 3306,
    })
});


app.get('/alerts', (req, res) => {
    connection.query(
        'SELECT * FROM alerts',
        function (err, results, fields) {
            res.send(results);
        }
    );
});

app.get('/counts', (req, res) => {
    connection.query(
        'SELECT * FROM counts',
        function (err, results, fields) {
            res.send(results?.[0]);
        }
    );
});

app.get('/missing_persons', (req, res) => {
    connection.query(
        'SELECT * FROM missing_persons',
        function (err, results, fields) {
            res.send(results);
        }
    );
});

app.get('/earthquakes', (req, res) => {
    got("https://api.orhanaydogdu.com.tr/deprem/live.php")
        .then((response) => {
            response.body = JSON.parse(response.body);
            if (response.body?.result?.length > 0) {
                this.earthquakes = response.body?.result;
                res.send(response.body?.result);
            } else {
                if (this.earthquakes && this.earthquakes.length > 0) {
                    res.send(this.earthquakes);
                    return;
                }
                res.status(500).send(response.body);
                return
            }
        }).catch((err) => {
            res.status(500).send(err);
        });
});


app.post('/add_missing_person', (req, res) => {
    connection.query(
        'INSERT INTO missing_persons (name, city, address, description) VALUES (?,?,?,?)',
        [req.body.name, req.body.city, req.body.address, req.body.description],
        function (err, results, fields) {
            if (err) {
                res.status(500).send(err);
            } else {
                res.send(true);
            }
        }
    );
});

app.listen(port, () => {
    console.log(`Deprem bilgi listening at http://localhost:${port}`)
});