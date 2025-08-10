// Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

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
