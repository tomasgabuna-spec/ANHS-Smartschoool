/* ==================================
   FIREBASE PROJECT CONFIGURATION
   ==================================
   1. Go to https://console.firebase.google.com
   2. Create a project (or open your existing one).
   3. Project settings (gear icon) > General > "Your apps" > Add app > Web (</>).
   4. Copy the firebaseConfig object it gives you and paste the values below.
   These values are NOT secret - they identify your project, not authenticate
   requests - so it's fine for them to sit in this public front-end file.
   Access is controlled separately by Firebase Authentication + your
   Firestore/Storage security rules (see FIREBASE_SETUP.txt).
*/

const firebaseConfig = {
    apiKey: "PASTE_YOUR_API_KEY_HERE",
    authDomain: "PASTE_YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "PASTE_YOUR_PROJECT_ID",
    storageBucket: "PASTE_YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "PASTE_YOUR_SENDER_ID",
    appId: "PASTE_YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();
