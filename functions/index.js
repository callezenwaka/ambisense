'use strict';
// index.js

const functions = require('firebase-functions')
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
// const engines = require('consolidate');
const express = require('express');
// var hbs = require('handlebars');
const http = require('http');
const path = require('path');
const cors = require('cors')
const app = express();

// View engine setup
// app.engine('hbs', engines.handlebars);
// app.set('views','./views');
// app.set('view engine','hbs');
// app.set('views', path.join(__dirname, 'views'));

// Initialize Firebase
admin.initializeApp({credential: admin.credential.applicationDefault()});

const firestoreRef = admin.firestore();
admin.messaging();

// Set middleware and automatically parse request body as JSON
app.use(cors())
app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.urlencoded({ extended: true}));
app.use(express.static(path.join(__dirname, 'public')));

/* GET home page */
// app.get('/ambisense', async (req, res, next) => {
//     var heading = 'Welcome to Ambisense Home Page';
//     res.render('index', {heading});
// });

/* GET ALL POST */
app.get('/ambisense/dataset/latest/:datasetId', async (req, res, next) => {
    await firestoreRef.collection('ambisense').doc(req.params.datasetId).collection('dataset').orderBy('created_at').limit(1).get()
    .then(snapshot => {
        // eslint-disable-next-line promise/always-return
        if (snapshot.empty) {
            console.log(`Received ${snapshot.size} query data from database`);
            res.send(`Received ${snapshot.size} query data from database!`);
            return;
        }
        else {
            const readings = [];
            snapshot.forEach(doc => {
                let reading = doc.data();
                reading.id = doc.id;
                readings.push(reading);
            })
            res.json(readings);
        }
    })
    .catch(err => { 
        console.log('Error getting document', err);
    });         
});

/* GET ALL POST */
app.get('/ambisense/dataset/:datasetId', async (req, res, next) => {
    await firestoreRef.collection('ambisense').doc(req.params.datasetId).collection('dataset').get()
    .then(snapshot => {
        // eslint-disable-next-line promise/always-return
        if (snapshot.empty) {
            console.log(`Received ${snapshot.size} query data from database`);
            res.send(`Received ${snapshot.size} query data from database!`);
            return;
        }
        else {
            const readings = [];
            snapshot.forEach(doc => {
                let reading = doc.data();
                reading.id = doc.id;
                readings.push(reading);
            })
            res.json(readings);
        }
    })
    .catch(err => { 
        console.log('Error getting document', err);
    });         
});

/* SAVE A POST */
app.post('/ambisense/sensor/:sensorId', async (req, res, next) => {
    let FieldValue = require('firebase-admin').firestore.FieldValue;
    await firestoreRef.collection('ambisense').doc(req.params.sensorId).collection('dataset').add({
        temperature: req.body.temperature,
        humidity: req.body.humidity,
        created_at: FieldValue.serverTimestamp()
    })
    .then( async (doc) => {
        console.log('Added test with id: ', doc.id);
        return res.send(`Test successfully added to the database!`);
    })
    .catch(err => { 
        console.log('Error getting document', err);
    });
})

exports.app = functions.https.onRequest(app);

/**
 * [START Send notifications ]
 * Detect when new readings are posted,
 * use the functions.firestore.document().onCreate Cloud Functions 
 * to trigger code when a new object is created at a given path of the Cloud Firestore.
 * Use sendNotifications function to send a notification to all users when a new reading is posted.:
 */
exports.sendNotifications = functions.firestore.document('ambisense/{ambisenseId}/dataset/{datasetId}').onCreate(
    async (snapshot) => {
        // Notification details.
        const payload = {
            notification: {
                title: "Data Update",
                body: "A new ambient data has been send to the data base.",
                click_action: `https://${process.env.GCLOUD_PROJECT}.firebaseapp.com`,
            },
            data: {
                Temperature: `${snapshot.data().temperature} &deg;C`,
                Humidity: `${snapshot.data().humidity} &percnt;`
            },
        };
    
        // Get the list of device tokens.
        const allTokens = await admin.firestore().collection('fcmTokens').get();
        const tokens = [];
        allTokens.forEach((tokenDoc) => {
            tokens.push(tokenDoc.data().token);
        });
    
        if (tokens.length > 0) {
            // Send notifications to all tokens.
            const response = await admin.messaging().sendToDevice(tokens, payload);
            await cleanupTokens(response, tokens);
            console.log('Notifications have been sent and tokens cleaned up.');
        }
    }
);
// [END Send notifications ]

/**
 * [START Cleanup the tokens]
 * Remove the tokens that are not valid anymore.
 * This happens when the token got from the user is not 
 * being used by the browser or device anymore. For instance, 
 * if the user has revoked the notification permission for the browser session.
 * @param {object} response 
 * @param {array} tokens 
 */
// Cleans up the tokens that are no longer valid.
function cleanupTokens(response, tokens) {
    // For each notification we check if there was an error.
    const tokensDelete = [];
    response.results.forEach((result, index) => {
      const error = result.error;
      if (error) {
        console.error('Failure sending notification to', tokens[index], error);
        // Cleanup the tokens who are not registered anymore.
        if (error.code === 'messaging/invalid-registration-token' ||
            error.code === 'messaging/registration-token-not-registered') {
          const deleteTask = admin.firestore().collection('messages').doc(tokens[index]).delete();
          tokensDelete.push(deleteTask);
        }
      }
    });
    return Promise.all(tokensDelete);
}
// [END Cleanup the tokens]