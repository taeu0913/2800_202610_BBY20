const tooltipTriggerList = [].slice.call(
  document.querySelectorAll('[data-bs-toggle="tooltip"]')
);

tooltipTriggerList.map(function (tooltipTriggerEl) {
  return new bootstrap.Tooltip(tooltipTriggerEl);
});

//  // FIRST-TIME USER HINT SYSTEM
//   const welcomeCallout = document.getElementById("welcomeCallout");
//   const dismissHints = document.getElementById("dismissHints");

//   // CHECK IF USER HAS SEEN HINTS BEFORE
//   if (localStorage.getItem("seenHints")) {
//     welcomeCallout.style.display = "none";
//   }

//   // SAVE DISMISSAL
//   dismissHints.addEventListener("click", () => {
//     localStorage.setItem("seenHints", "true");
//     welcomeCallout.style.display = "none";
//   });