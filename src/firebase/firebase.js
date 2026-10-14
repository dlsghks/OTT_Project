// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD_eLlh2pFPW1wZhXTqPCsuET0kIlQdfFs",
    authDomain: "ott-project-7982a.firebaseapp.com",
    projectId: "ott-project-7982a",
    storageBucket: "ott-project-7982a.firebasestorage.app",
    messagingSenderId: "497010157146",
    appId: "1:497010157146:web:8f454934f0dec5e4131a63"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);