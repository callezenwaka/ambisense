// Import and configure the Firebase SDK
// These scripts are made available when the app is served or deployed on Firebase Hosting
// If you do not want to serve/host your project using Firebase Hosting see https://firebase.google.com/docs/web/setup
importScripts('/__/firebase/7.14.2/firebase-app.js');
importScripts('/__/firebase/7.14.2/firebase-messaging.js');
importScripts('/__/firebase/7.14.2/firebase-firestore.js');
importScripts('/__/firebase/init.js');


/**
 * If you would like to customize notifications that are received in the
 * background (Web app is closed or not in browser focus) then you should
 * implement this optional method.
 * [START background_handler]
 */
firebase.messaging().setBackgroundMessageHandler(function(payload) {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    // Customize notification here
    const notificationTitle = 'Background Message Title';
    const notificationOptions = {
        body: 'Background Message body.',
        icon: '/firebase-logo.png'
    };

    return self.registration.showNotification(notificationTitle,
        notificationOptions);
});
// [END background_handler]