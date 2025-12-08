// session.js - non-module safe version for GitHub Pages

const PAY54_USER_KEY = "pay54User";
const PAY54_LOGGED_IN_KEY = "pay54LoggedIn";

function getCurrentUser() {
  try {
    const raw = localStorage.getItem(PAY54_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error("Error parsing PAY54 user:", e);
    return null;
  }
}

function setCurrentUser(userObj) {
  localStorage.setItem(PAY54_USER_KEY, JSON.stringify(userObj));
}

function setLoggedIn(flag) {
  if (flag) {
    localStorage.setItem(PAY54_LOGGED_IN_KEY, "true");
  } else {
    localStorage.removeItem(PAY54_LOGGED_IN_KEY);
  }
}

function isLoggedIn() {
  return localStorage.getItem(PAY54_LOGGED_IN_KEY) === "true";
}

function ensureAuthenticated() {
  if (!isLoggedIn()) {
    window.location.href = "login.html";
  }
}

function logout() {
  setLoggedIn(false);
  window.location.href = "login.html";
}

window.PAY54Session = {
  getCurrentUser,
  setCurrentUser,
  setLoggedIn,
  isLoggedIn,
  ensureAuthenticated,
  logout,
};
