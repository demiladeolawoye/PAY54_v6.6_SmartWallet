// src/js/session.js
// Simple session guard for PAY54 demo

(function () {
  const STORAGE_USER = "pay54_user";
  const STORAGE_SESSION = "pay54_session";

  function getUser() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_USER)) || null;
    } catch (e) {
      return null;
    }
  }

  function getSession() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_SESSION)) || null;
    } catch (e) {
      return null;
    }
  }

  const path = window.location.pathname || "";
  const isDashboard = path.endsWith("dashboard.html");
  const isLogin = path.endsWith("login.html");
  const isSignup = path.endsWith("signup.html") || path === "/" || path === "";

  const user = getUser();
  const session = getSession();

  // DASHBOARD PROTECTION
  if (isDashboard) {
    if (!user || !session || !session.active) {
      // No valid session → send to login (NOT signup)
      window.location.href = "login.html";
    }
  }

  // You can also auto-redirect authenticated users away from signup/login if you want:
  // if ((isLogin || isSignup) && user && session && session.active) {
  //   window.location.href = "dashboard.html";
  // }
})();
