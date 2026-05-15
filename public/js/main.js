document.addEventListener("DOMContentLoaded", () => {
  const callout = document.getElementById("welcomeCallout");
  const dismissBtn = document.getElementById("dismissHints");

  if (!callout) return;

  // check if user already dismissed it
  const seen = localStorage.getItem("shadefinder_welcome_seen");

  if (seen) {
    callout.style.display = "none";
  }

  dismissBtn?.addEventListener("click", () => {
    localStorage.setItem("shadefinder_welcome_seen", "true");
    callout.style.display = "none";
  });
});

// filters
document.querySelectorAll(".filter-pill").forEach(btn => {
  btn.addEventListener("click", () => {
    const type = btn.dataset.type;

    document.querySelectorAll(".filter-pill").forEach(b =>
      b.classList.remove("active")
    );
    btn.classList.add("active");

    // hide all first
    map.removeLayer(treeMarkers);
    map.removeLayer(parkMarkers);
    map.removeLayer(shelterMarkers);

    if (type === "all") {
      treeMarkers.addTo(map);
      parkMarkers.addTo(map);
      shelterMarkers.addTo(map);
    } else if (type === "tree") {
      treeMarkers.addTo(map);
    } else if (type === "park") {
      parkMarkers.addTo(map);
    } else if (type === "shelter") {
      shelterMarkers.addTo(map);
    }
  });
});