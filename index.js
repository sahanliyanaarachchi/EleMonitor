// Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getDatabase, ref, push, onValue, get, remove } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

// Firebase Config (your keys)
const firebaseConfig = {
  apiKey: "AIzaSyBPM55I08UVYhUm8XwETLlukc0btlKLE6Q",
  authDomain: "elephant-alert-68626.firebaseapp.com",
  databaseURL: "https://elephant-alert-68626-default-rtdb.firebaseio.com",
  projectId: "elephant-alert-68626",
  storageBucket: "elephant-alert-68626.firebasestorage.app",
  messagingSenderId: "669608211278",
  appId: "1:669608211278:web:11882bbe5bc29910e5641f",
  measurementId: "G-WFZGXHZHHP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Time limit 20 hours in milliseconds
const TWENTY_HOURS_MS = 20 * 60 * 60 * 1000;

// Function to clean old entries
async function cleanupOldEntries() {
  const elephantsRef = ref(db, "elephants");
  const snapshot = await get(elephantsRef);
  if (snapshot.exists()) {
    const data = snapshot.val();
    const now = Date.now();

    for (const key in data) {
      if (now - data[key].timestamp > TWENTY_HOURS_MS) {
        await remove(ref(db, `elephants/${key}`));
        console.log(`Removed old entry: ${key}`);
      }
    }
  }
}

// Call cleanup once on page load
cleanupOldEntries();

// Leaflet Map Setup
const map = L.map("map").setView([7.8731, 80.7718], 7); // Sri Lanka center

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19
}).addTo(map);

// Add Marker on Click & Save to Firebase
map.on("click", function (e) {
  const { lat, lng } = e.latlng;
  push(ref(db, "elephants"), {
    latitude: lat,
    longitude: lng,
    timestamp: Date.now()
  });
  alert("Elephant location tagged!");
});

// Load Markers from Firebase
onValue(ref(db, "elephants"), (snapshot) => {
  map.eachLayer(layer => {
    if (layer instanceof L.Marker) {
      map.removeLayer(layer); // clear old markers
    }
  });

  const data = snapshot.val();
  if (data) {
    Object.values(data).forEach(elephant => {
      L.marker([elephant.latitude, elephant.longitude])
        .addTo(map)
        .bindPopup("🐘 Elephant reported here");
    });
  }
});
