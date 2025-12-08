// assets/js/session.js – simple redirect control for PAY54 demo

function sessionActive() {
  return localStorage.getItem("pay54_session_active") === "1";
}

// Protect dashboard: if no session, go to login
if (window.location.pathname.endsWith("dashboard.html")) {
  if (!sessionActive()) {
    window.location.href = "index.html";
  }
}

// Optional: prevent logged-in users from seeing login page
if (window.location.pathname.endsWith("index.html")) {
  if (sessionActive()) {
    // already logged in – go straight to dashboard
    // window.location.href = "dashboard.html";
  }
}
