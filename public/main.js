'use strict';

firebase.messaging().usePublicVapidKey('BB9qgOcndGnwd4oqiao6npUCpqMPlwp6jRU64HjWjwrhfhTgugGn0QcKSBew05qrqlv_NWCNcgpULO7AAg76Rz0');

// [START refresh_token]
// Callback fired if Instance ID token is updated.
firebase.messaging().onTokenRefresh(() => {
    firebase.messaging().getToken()
    .then((refreshedToken) => {
        if (refreshedToken) {
            console.log('Token refreshed: ', refreshedToken);
            sendTokenToServer(refreshedToken);
        } 
        else {
            // Show permission request.
            console.log('No Instance ID token available. Request permission to generate one.');
            // Indicate that the new Instance ID token has not yet been sent to the
            // app server.
            setTokenSentToServer(false);
            // Need to request permissions to show notifications.
            requestNotificationsPermissions();
        }
    })
    .catch((err) => {
        console.log('Unable to retrieve refreshed token ', err);
        // showToken('Unable to retrieve refreshed token ', err);
        setTokenSentToServer(false);
    });
});
// [END refresh_token]

// [START receive_message]
// Handle incoming messages. Called when:
// - a message is received while the app has focus
// - the user clicks on an app notification created by a service worker
//   `messaging.setBackgroundMessageHandler` handler.
firebase.messaging().onMessage((payload) => {
    console.log('Message received. ', payload);
    // [START_EXCLUDE]
    // Update the UI to include the received message.
    // appendMessage(payload);
    // [END_EXCLUDE]
});
// [END receive_message]

/**
 * [START init_function]
 * Initiate firebase auth. 
 */ 
function init() {
    // Request for permission to show token.
    requestNotificationsPermissions();
}
// [END init_function]

// [START send_token_to_server]
// Send the Instance ID token your application server, so that it can:
// - send messages back to this app
// - subscribe/unsubscribe the token from topics
function sendTokenToServer(currentToken) {
    if (window.localStorage.getItem('sentToServer') !== '1') {
        console.log('Sending token to server...');
        // TODO(developer): Send the current token to your server.
        firebase.firestore().collection("fcmTokens").add({
            token: currentToken,
            active: true
        })
        .then(doc => {
            // Update successful.
            console.log('Token added successfully to the database: ', doc.id)
            return;
        })
        .catch((error) => {
            // An error happened.
            console.error("Error writing document: ", error);
        })
        setTokenSentToServer(true);
    } else {
        console.log('Token already sent to server so won\'t send it again unless it changes');
    }

}
// [END send_token_to_server]

// [START is_send_token_to_server]
function isTokenSentToServer() {
    return window.localStorage.getItem('sentToServer') === '1';
}
// [END is_send_token_to_server]

/**
 * [START set_token_sent_to_server]
 * @param {boolean} sent 
 */
function setTokenSentToServer(sent) {
    window.localStorage.setItem('sentToServer', sent ? '1' : '0');
}
// [END set_token_sent_to_server]
// Requests permissions to show notifications.
function requestNotificationsPermissions() {
    console.log('Requesting notifications permission...');
    firebase.messaging().requestPermission()
    .then(function() {
      // Notification permission granted.
      saveMessagingDeviceToken();
    }).catch(function(error) {
      console.error('Unable to get permission to notify.', error);
    });
  }
/**
 * [START request_notification_permission]
 * @param {*} no parameter
 * @returns {string} token
 */
function requestNotificationsPermissions() {
    console.log('Requesting notifications permission...');
    firebase.messaging().requestPermission()
    // Notification.requestPermission()
    .then(() => {
        console.log('Notification permission granted!')
        firebase.messaging().getToken()
        .then(token => {
            console.log('user token: ', token);
            // TODO(developer): Send an Instance ID token to the database for use with FCM.
            sendTokenToServer(token);
            // return;
        })
        .catch(err => {
            return console.log('Error occured: ', err);
        })
    })
    .catch((err) => {
        return console.log(err);
    })
    // [END request_permission]
}
// [END request_notification_permission]

/**
 * [START delete_token]
 */
async function deleteToken() {
    // Delete Instance ID token.
    // [START delete_token]
    firebase.messaging().getToken()
    .then((currentToken) => {
        firebase.messaging().deleteToken(currentToken)
        .then(() => {
            // TODO(developer): Send the current token to your server.
            firestoreRef.firestore().collection("fcmTokens").update({
                token: currentToken,
                active: false
            })
            .then(doc => {
                // Update successful.
                console.log('Token disabled successfully in the database: ', doc)
                return;
            })
            .catch((error) => {
                // An error happened.
                console.error("Error writing document: ", error);
            })
            console.log('Token deleted.');
            setTokenSentToServer(false);
        })
        .catch((err) => {
            console.log('Unable to delete token. ', err);
        });
        // [END delete_token]
    })
    .catch((err) => {
        console.log('Error retrieving Instance ID token. ', err);
    });
}
// [END delete_token]

// Initialize functions
init()