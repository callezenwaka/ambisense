const functions = require('firebase-functions');
const admin = require('firebase-admin');
const firebaseHelper = require('firebase-functions-helper/dist');
const bodyParser = require('body-parser');
const cors = require('cors')
const express = require('express');
const app = express();
const port = 3000;

//  Initialize firebase app
admin.initializeApp(functions.config().firebase);
const db = admin.firestore();

app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// app.use('/api/v1', app);

app.listen(port, function () {
    console.log('Listening to port ' + port);
})

// app.get('/ping', async (req, res) => {
//     // console.log(infos)
//     // res.send(infos);
//     // res.send('Info sent!');
//     const posts = [];
//     try {
//         const postRef = await db.collection('intellisensor').get()
//         console.log(`Received query snapshot of size ${postRef.size}`);
//         postRef.forEach((doc) => {
//         const post = doc.data();
//         post.id = doc.id;
//         posts.push(post)
//         })
//         res.json(posts);
//         return;
//     } catch (err) {
//         next(err)
//     }
// })

/* GET ALL POST */
app.get('/dataset/:datasetId', async (req, res, next) => {
    const posts = [];
    try {
    //   const id = req.params.datasetId;
      const postRef = await db.collection('intellisensor').doc(req.params.datasetId).collection('dataset').get();
      console.log(`Received query snapshot of size ${postRef.size}`);
      if (!postRef.exists) {
        console.log('No such document!');
        return;
      }
      postRef.forEach((doc) => {
        const post = doc.data();
        post.id = doc.id;
        posts.push(post)
      })
      res.json(posts);
    } catch(err) {
      next(err)
    }                     
  });

/* SAVE A POST */
app.post('/sensor/:sensorId', async (req, res, next) => {
    let FieldValue = require('firebase-admin').firestore.FieldValue;
    try {
        await db.collection('intellisensor').doc(req.params.sensorId).collection('dataset').add({
            air: req.body.air,
            temperature: req.body.temperature,
            humidity: req.body.humidity,
            created_at: FieldValue.serverTimestamp()
        });
        console.log('Added document to DB')
        res.send({
            message: 'Added document to DB'
        })
    } catch(err) {
        next(err)
    }
  })

exports.app = functions.https.onRequest(app);