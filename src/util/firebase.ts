import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAbx-DqBkDScQL2K2k0eloP5SFe8txaGtM",
  authDomain: "dealer-b7cfb.firebaseapp.com",
  projectId: "dealer-b7cfb",
  storageBucket: "dealer-b7cfb.firebasestorage.app",
  messagingSenderId: "90219296431",
  appId: "1:90219296431:web:5ce5ccf602bf005a68465a"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

let token;
let initialized = false;
let initializing: Promise<void>;
export async function initialize() {
  if (initialized) {
    return;
  }
  if (initializing) {
    return initializing;
  }
  let resolveCb;
  initializing = new Promise((resolve) => { resolveCb = resolve; });

  token = await getToken(messaging, { vapidKey: "BFU6FxbWTIldPgMTRxI34CtE-r6Kmui4FyaEhTHr_qkvQQSlwf3CsHq0G-ivqgXprDoycnZhZo6jPgNFumUyV7s" });;

  if (token) {
    // Send the token to your server and update the UI if necessary
  } else {
    await requestPermission();
    // Show permission request UI
    console.log('No registration token available. Request permission to generate one.');
  }

  initialized = true;
  resolveCb!();
}

async function requestPermission() {
  console.log('Requesting permission...');
  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    console.log('Notification permission granted.');
  }
}
