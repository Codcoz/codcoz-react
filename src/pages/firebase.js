import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  // ...outros campos (¡, messagingSenderId, appId)
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;




// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyDIH0KXXdO_fj0lIZJDnXciGx2h9g9CQhw",
//   authDomain: "codcoz.firebaseapp.com",
//   projectId: "codcoz",
//   storageBucket: "codcoz.firebasestorage.app",
//   messagingSenderId: "373303387952",
//   appId: "1:373303387952:web:4ee2a555583e008b144af5",
//   measurementId: "G-LG9S3E5D5T"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);