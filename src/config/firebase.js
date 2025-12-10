// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDOF66yEkrbBV4e6WRUf8NNjDHr5HCxCb8",
  authDomain: "nhathuoc-f9fce.firebaseapp.com",
  projectId: "nhathuoc-f9fce",
  storageBucket: "nhathuoc-f9fce.firebasestorage.app",
  messagingSenderId: "272239333832",
  appId: "1:272239333832:web:de82eb717047d310ca30fd",
  measurementId: "G-C1DLYXM5R3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Cấu hình Google Provider
googleProvider.setCustomParameters({
  prompt: 'select_account' // Luôn hiển thị popup chọn tài khoản
});

export default app;
