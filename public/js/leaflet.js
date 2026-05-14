var map = L.map("map").setView([49.2827, -123.1207], 13);

let userLatLng;

let pendingLatLng = null;

const shadeModal = new bootstrap.Modal(document.getElementById("shadeModal"));

const suggestionModal = new bootstrap.Modal(document.getElementById("suggestionModal"));

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "© OpenStreetMap",
}).addTo(map);

// Search bar
L.Control.geocoder().addTo(map);

// FILTER LAYERS
const parkMarkers = L.layerGroup().addTo(map);
const treeMarkers = L.layerGroup().addTo(map);
const shelterMarkers = L.layerGroup().addTo(map);

window.treeMarkers = treeMarkers;
window.parkMarkers = parkMarkers;
window.shelterMarkers = shelterMarkers;

// const overlays = {
//   Parks: parkMarkers,
//   Trees: treeMarkers,
//   Shelters: shelterMarkers,
// };

// L.control.layers(null, overlays).addTo(map);

const recenterControl = L.control({ position: "topright" });

recenterControl.onAdd = function () {
  const button = L.DomUtil.create("button");

  button.innerHTML = "📍";
  button.title = "My location";

  button.style.width = "40px";
  button.style.height = "40px";
  button.style.backgroundColor = "white";
  button.style.border = "2px solid #ccc";
  button.style.borderRadius = "8px";
  button.style.cursor = "pointer";
  button.style.fontSize = "20px";

  button.onclick = function (e) {
    L.DomEvent.stopPropagation(e);
    L.DomEvent.preventDefault(e);

    if (userLatLng) {
      map.setView(userLatLng, 16);
    }
  };

  return button;
};

recenterControl.addTo(map);

// ICONS
const userIcon = L.icon({
  iconUrl: "/images/location.png",
  iconSize: [45, 45],
  iconAnchor: [22, 22],
  popupAnchor: [0, -22],
});

const treeIcon = L.icon({
  iconUrl: "/images/tree.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

const parkIcon = L.icon({
  iconUrl: "/images/park.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

const shelterIcon = L.icon({
  iconUrl: "/images/shelter.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

function getCurrentShadeTime() {
  const hour = new Date().getHours();

  if (hour >= 6 && hour < 12) {
    return "morning";
  } else if (hour >= 12 && hour < 17) {
    return "afternoon";
  } else {
    return "evening";
  }
}

// USER LOCATION
map.locate({ setView: true, maxZoom: 16 });

function onLocationFound(e) {
  userLatLng = e.latlng;

  var radius = e.accuracy;

  L.marker(e.latlng, {
    icon: userIcon,
  })
    .addTo(map)
    .bindPopup("You are here")
    .openPopup();

  L.circle(e.latlng, radius).addTo(map);
}

map.on("locationfound", onLocationFound);

function onLocationError(e) {
  alert(e.message);
}

map.on("locationerror", onLocationError);

// FUNCTION TO CREATE SHADE MARKERS
function createShadeMarker(spot) {
  let selectedIcon;
  let targetLayer;

  const type = spot.type.toLowerCase();

  if (type === "tree") {
    selectedIcon = treeIcon;
    targetLayer = treeMarkers;
  } else if (type === "park") {
    selectedIcon = parkIcon;
    targetLayer = parkMarkers;
  } else if (type === "shelter") {
    selectedIcon = shelterIcon;
    targetLayer = shelterMarkers;
  } else {
    selectedIcon = treeIcon;
    targetLayer = treeMarkers;
  }

  const currentTime = getCurrentShadeTime();

  if (
    spot.bestShadedAt?.toLowerCase() !== currentTime &&
    spot.bestShadedAt?.toLowerCase() !== "allday"
  ) {
    return;
  }

  L.marker([spot.lat, spot.lng], {
    icon: selectedIcon,
  }).addTo(targetLayer).bindPopup(`
        <b>${spot.name}</b><br>
        Type: ${spot.type}<br>
        Best Shaded: ${spot.bestShadedAt}<br>
        ${spot.description}

        <a class="btn btn-sm btn-secondary"
        href="https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}"
        target="_blank">
        Get Directions
        </a>
        `);
}

// LOAD SHADE SPOTS
fetch("/api/shadespots")
  .then((res) => res.json())
  .then((spots) => {
    spots.forEach((spot) => {
      createShadeMarker(spot);
    });
  })
  .catch((err) => {
    console.log("Error loading spots:", err);
  });

// // ADD NEW SHADE SPOTS
// map.on("click", function (e) {
//   pendingLatLng = e.latlng;
//   shadeModal.show();
// });

// MAP CLICK POPUP OPTIONS
map.on("click", function (e) {

  pendingLatLng = e.latlng;

  L.popup()
    .setLatLng(e.latlng)

    .setContent(`
      <div class="d-flex flex-column gap-2">

        <button
          id="popupAddShade"
          class="btn btn-success btn-sm">

          Add Shade Spot

        </button>

        <button
          id="popupSuggestShade"
          class="btn btn-warning btn-sm">

          Suggest Shade Improvement

        </button>

      </div>
    `)

    .openOn(map);
});

// popup button listeners
map.on("popupopen", function () {

  const addBtn = document.getElementById("popupAddShade");

  const suggestBtn = document.getElementById("popupSuggestShade");

  if (addBtn) {
    addBtn.addEventListener("click", function () {

      map.closePopup();

      shadeModal.show();
    });
  }

  if (suggestBtn) {
    suggestBtn.addEventListener("click", function () {

      map.closePopup();

      suggestionModal.show();
    });
  }
});

document
  .getElementById("saveShadeBtn")
  .addEventListener("click", async function () {
    const newSpot = {
      name: document.getElementById("shadeName").value,
      type: document.getElementById("shadeType").value.toLowerCase(),
      bestShadedAt: document.getElementById("shadeTime").value.toLowerCase(),
      description: document.getElementById("shadeDesc").value,
      lat: pendingLatLng.lat,
      lng: pendingLatLng.lng,
    };

    try {
      const response = await fetch("/api/shadespots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSpot),
      });

      const result = await response.json();

      if (result.success) {
        createShadeMarker(newSpot);
      }

      shadeModal.hide();

      // optional: clear form
      document.getElementById("shadeName").value = "";
      document.getElementById("shadeType").value = "";
      document.getElementById("shadeTime").value = "";
      document.getElementById("shadeDesc").value = "";
    } catch (err) {
      console.log(err);
    }
  });

// SAVE SHADE SUGGESTIONS
document
  .getElementById("saveSuggestionBtn")
  .addEventListener("click", async function () {

    const suggestion = {

      category: document.getElementById("suggestCategory").value,

      description: document.getElementById("suggestDesc").value,

      lat: pendingLatLng.lat,

      lng: pendingLatLng.lng,
    };

    try {

      const response = await fetch("/api/suggestions", {

        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(suggestion),
      });

      const result = await response.json();

      if (result.success) {

        alert("Suggestion submitted!");
      }

      suggestionModal.hide();

      // clear form
      document.getElementById("suggestCategory").value = "";

      document.getElementById("suggestDesc").value = "";

    } catch (err) {

      console.log(err);
    }
  });
