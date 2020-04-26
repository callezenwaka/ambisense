const functions = require('firebase-functions')
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const engines = require('consolidate');
const express = require('express');
var hbs = require('handlebars');
const http = require('http');
const path = require('path');
const cors = require('cors')
const app = express();
// const port = 3000;

//  Initialize firebase app
admin.initializeApp(functions.config().firebase);
// admin.initializeApp({credential: admin.credential.applicationDefault()});
const firebaseRef = admin.firestore();

// View engine setup
app.engine('hbs', engines.handlebars);
app.set('views','./views');
app.set('view engine','hbs');
// app.set('views', path.join(__dirname, 'views'));

// Set middleware and automatically parse request body as JSON
app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
// app.use(bodyParser.urlencoded({ extended: true}));
app.use(express.static(path.join(__dirname, 'public')));

// app.use('/api/v1', app);


/* GET ALL POST */
app.get('/ambisense', (req, res, next) => {
    var heading = 'Welcome to Ambisense';
    // res.send('Welcome to Ambisense');
    res.render('index', {heading});
});

/* GET ALL POST */
app.get('/ambisense/dataset/:datasetId', async (req, res, next) => {
    await firebaseRef.collection('ambisense').doc(req.params.datasetId).collection('dataset').get()
    .then(snapshot => {
        // eslint-disable-next-line promise/always-return
        if (snapshot.empty) {
            console.log(`Received ${snapshot.size} query data from database`);
            res.send(`Received ${snapshot.size} query data from database!`);
            return;
        }
        else {
            const devices = [];
            snapshot.forEach(doc => {
                let user = doc.data();
                user.id = doc.id;
                devices.push(user);
            })
            // res.render('index',{devices});
            res.json(devices);
        }
    })
    .catch(err => { 
        console.log('Error getting document', err);
    });         
});

/* SAVE A POST */
app.post('/ambisense/sensor/:sensorId', async (req, res, next) => {
    console.log(req.body);
    let FieldValue = require('firebase-admin').firestore.FieldValue;
    await firebaseRef.collection('ambisense').doc(req.params.sensorId).collection('dataset').add({
        temperature: req.body.temperature,
        humidity: req.body.humidity,
        created_at: FieldValue.serverTimestamp()
    })
    .then(doc => {
        console.log('Added test with id: ', doc.id);
        return res.send(`Test successfully added to the database!`);
        // console.log('Added document to DB');
        // res.send({message: 'Added document to DB'})
    })
    .catch(err => { 
        console.log('Error getting document', err);
    });  
})

exports.app = functions.https.onRequest(app);