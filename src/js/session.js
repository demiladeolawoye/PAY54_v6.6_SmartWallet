// session.js
// Simple front-end session handling using localStorage

const PAY54_USER_KEY = "pay54User";
const PAY54_LOGGED_IN_KEY = "pay54LoggedIn";

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(PAY54_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error("Error parsing PAY54 user:", e);
    return null;
  }
}

export function setCurrentUser(userObj) {
  localStorage.setItem(PAY54_USER_KEY, JSON.stringify(userObj));
}

export function setLoggedIn(flag) {
  if (flag) {
    localStorage.setItem(PAY54_LOGGED_IN_KEY, "true");
  } else {
    localStorage.removeItem(PAY54_LOGGED_IN_KEY);
  }
}

export function isLoggedIn() {
  return localStorage.getItem(PAY54_LOGGED_IN_KEY) === "true";
}

// Only call this from protected pages like dashboard.html
export function ensureAuthenticated() {
  if (!isLoggedIn()) {
    window.location.href = "login.html";
  }
}

// Simple logout helper
export function logout() {
  setLoggedIn(false);
  // KEEP the stored user so they can log in again
  window.location.href = "login.html";
}

// Fallback so we can use in normal <script> tags without modules
if (typeof window !== "undefined") {
  window.PAY54Session = {
    getCurrentUser,
    setCurrentUser,
    setLoggedIn,
    isLoggedIn,
    ensureAuthenticated,
    logout,
  };
}
