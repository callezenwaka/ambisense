const functions = require('firebase-functions');
const admin = require('firebase-admin');
const firebaseHelper = require('firebase-functions-helper/dist');
const bodyParser = require('body-parser');
const cors = require('cors')
const express = require('express');
const app = express();
const port = 3000;

//  Initialize firebase
admin.initializeApp(functions.config().firebase);
const db = admin.firestore();

app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
// app.use('/api/v1', app);

app.listen(port, function () {
    console.log('Listening to port ' + port);
})

app.get('/ping', (req, res) => {
    const infos = []
    firebaseHelper.firestore
    .backup(db, 'intellisensor')
    .then(data => {    
        infos = data;
        let docs = data['intellisensor'];
        for (const key in docs) {
            if (docs.hasOwnProperty(key)) {            
                console.log('Doc id: ', key);
                console.log('Document data: ', docs[key])                    
            }
        }
    })
    console.log(infos)
    res.send('Info sent!');
})

app.patch('/sensor/:sensorId', async(req, res) => {
    try{
        await firebaseHelper.firestore.updateDocument(db, sensorsCollection, req.params.sensorId, req.body);
        console.log('Here')
        res.status(200).send('Update Success');
    }catch(error){
        res.status(204).send('Patch Error');
    }
})

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
exports.app = functions.https.onRequest(app);