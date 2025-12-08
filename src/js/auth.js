// assets/js/auth.js – simple demo auth for PAY54 v6.6

// Eye toggle for PIN fields
document.querySelectorAll(".eye-toggle").forEach((btn) => {
  btn.addEventListener("click", () => {
    const targetId = btn.getAttribute("data-target");
    const input = document.getElementById(targetId);
    if (!input) return;
    const isPwd = input.type === "password";
    input.type = isPwd ? "text" : "password";
  });
});

// Simple demo user storage in localStorage (for front-end testing)
const STORAGE_KEY = "pay54_demo_user";

function saveDemoUser(phoneOrEmail, pin) {
  const payload = {
    phoneOrEmail,
    pin,
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function getDemoUser() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (_) {
    return null;
  }
}

function setSessionActive() {
  localStorage.setItem("pay54_session_active", "1");
}

function clearSession() {
  localStorage.removeItem("pay54_session_active");
}

// LOGIN FORM HANDLER (index.html)
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const phone = document.getElementById("loginPhone").value.trim();
    const pin = document.getElementById("loginPin").value.trim();

    const stored = getDemoUser();
    if (!stored) {
      alert("No wallet found. Please create an account first.");
      window.location.href = "signup.html";
      return;
    }

    if (stored.phoneOrEmail === phone && stored.pin === pin) {
      setSessionActive();
      window.location.href = "dashboard.html";
    } else {
      alert("Incorrect details. Please check your phone/email and PIN.");
    }
  });
}

// SIGNUP FORM (signup.html) – stub wiring
const signupForm = document.getElementById("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const phone = document.getElementById("signupPhone").value.trim();
    const pin = document.getElementById("signupPin").value.trim();
    const confirmPin = document
      .getElementById("signupPinConfirm")
      .value.trim();

    if (pin.length < 4 || pin.length > 6) {
      alert("Wallet PIN should be between 4 and 6 digits.");
      return;
    }

    if (pin !== confirmPin) {
      alert("PIN and confirmation do not match.");
      return;
    }

    saveDemoUser(phone, pin);
    // In a real app, you’d go to OTP verify
    window.location.href = "verify.html";
  });
}
