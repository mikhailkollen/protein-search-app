import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyCHNpQAmC85x9WBni9EAl36inXkAA7P-cU",
  authDomain: "protein-search-app.firebaseapp.com",
  projectId: "protein-search-app",
  storageBucket: "protein-search-app.appspot.com",
  messagingSenderId: "965902040170",
  appId: "1:965902040170:web:b76718e24538960e969e13",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
