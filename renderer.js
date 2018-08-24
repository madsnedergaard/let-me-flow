// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
require('dotenv').config();

//import * as firebase from 'firebase';
const firebase = require("firebase/app");
require("firebase/auth");
require("firebase/database");
const doNotDisturb = require('@sindresorhus/do-not-disturb');

// Initiate firebase
var config = {
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    databaseURL: process.env.DATABASE_URL,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.MESSAGING_SENDER_ID
  };
firebase.initializeApp(config);

// Init auth
initAuth();

// Read current value from firebase
const database = firebase.database().ref();
database.on('value', function(snapshot) {
    console.log('data:',snapshot.val().enabled);
    const action = snapshot.val().enabled ? 'enable' : 'disable';
    changeState(action);
});

// Virtual toggle-button
const toggleButton = document.querySelector('button');
toggleButton.addEventListener('click', function(){
    // Todo: Disable button while toggling and enable it again afterwards
    changeState('toggle');
});

async function initAuth() {
    try {
        await firebase.auth().signInWithEmailAndPassword(process.env.AUTH_EMAIL, process.env.AUTH_PASSWORD);
        console.log('Logged In!');
    } catch (error) {
        console.log(error.toString());
        alert(error.toString());
    }
};


function changeState(action) {
    (async () => {
        if (action === 'enable') {
            await doNotDisturb.enable();
            changeDOM(true);
        } else if (action === 'disable') {
            await doNotDisturb.disable();
            changeDOM(false);
        } else if (action === 'toggle') {
            await doNotDisturb.toggle();
            doNotDisturb.isEnabled().then((status) => {
                database.set({
                    enabled: status
                  });
                changeDOM(status);
            });
        }
    })();
}


function changeDOM(enabled) {
    if (enabled) {
        document.querySelector('.subtitle').innerHTML = 'now';
        document.querySelector('h1').innerHTML = 'flowing';
        document.querySelector('button').innerText = 'Disable';
    } else {        
        document.querySelector('.subtitle').innerHTML = 'let me';
        document.querySelector('h1').innerHTML = 'flow';
        document.querySelector('button').innerText = 'Enable';
    }

}
