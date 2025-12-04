// src/js/auth.js
// Handles PAY54 signup + login using localStorage

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

  function saveUser(user) {
    localStorage.setItem(STORAGE_USER, JSON.stringify(user));
  }

  function setSession(active, id) {
    const session = {
      active,
      id: id || null,
      loggedInAt: active ? Date.now() : null,
    };
    localStorage.setItem(STORAGE_SESSION, JSON.stringify(session));
  }

  function getSession() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_SESSION)) || null;
    } catch (e) {
      return null;
    }
  }

  // ---------- SIGNUP HANDLER ----------
  function handleSignupSubmit(e) {
    e.preventDefault();

    const nameEl = document.getElementById("signupName");
    const idEl = document.getElementById("signupId");
    const pinEl = document.getElementById("signupPin");
    const pin2El = document.getElementById("signupPinConfirm");

    if (!nameEl || !idEl || !pinEl || !pin2El) return;

    const fullName = nameEl.value.trim();
    const identifier = idEl.value.trim();
    const pin = pinEl.value.trim();
    const pin2 = pin2El.value.trim();

    if (!fullName || !identifier || !pin || !pin2) {
      alert("Please fill in all fields.");
      return;
    }

    if (!/^\d{4}$/.test(pin)) {
      alert("PIN must be exactly 4 digits.");
      return;
    }

    if (pin !== pin2) {
      alert("PINs do not match. Please try again.");
      return;
    }

    const user = {
      fullName,
      id: identifier,
      pin,
      balance: 12500, // demo starting balance
      createdAt: new Date().toISOString(),
    };

    saveUser(user);
    setSession(true, user.id);

    alert("✅ PAY54 account created successfully (demo).");
    window.location.href = "dashboard.html";
  }

  // ---------- LOGIN HANDLER ----------
  function handleLoginSubmit(e) {
    e.preventDefault();

    const idEl = document.getElementById("loginId");
    const pinEl = document.getElementById("loginPin");

    if (!idEl || !pinEl) return;

    const identifier = idEl.value.trim();
    const pin = pinEl.value.trim();

    if (!identifier || !pin) {
      alert("Enter your email/phone and PIN.");
      return;
    }

    const user = getUser();
    if (!user) {
      alert("No PAY54 account found on this device. Please sign up first.");
      window.location.href = "signup.html";
      return;
    }

    if (user.id === identifier && user.pin === pin) {
      setSession(true, user.id);
      alert("✅ Login successful (demo). Redirecting to dashboard…");
      window.location.href = "dashboard.html";
    } else {
      alert("❌ Incorrect login details. Please check your ID and PIN.");
    }
  }

  // ---------- FORGOT PIN ----------
  function handleForgotPinClick() {
    // simple demo: redirect to verify page (you already have verify.html)
    alert(
      "Demo flow: we would normally ask for your email/phone, send an OTP and request a selfie. Redirecting to verification page mock."
    );
    window.location.href = "verify.html";
  }

  // ---------- INIT ----------
  document.addEventListener("DOMContentLoaded", () => {
    const signupForm = document.getElementById("signupForm");
    const loginForm = document.getElementById("loginForm");
    const forgotPinBtn = document.getElementById("forgotPinBtn");

    if (signupForm) {
      signupForm.addEventListener("submit", handleSignupSubmit);
    }

    if (loginForm) {
      loginForm.addEventListener("submit", handleLoginSubmit);
    }

    if (forgotPinBtn) {
      forgotPinBtn.addEventListener("click", handleForgotPinClick);
    }

    // Optional: if session already active and user opens login/signup manually
    const sess = getSession();
    const user = getUser();
    const path = window.location.pathname;

    const onAuthPage =
      path.endsWith("login.html") || path.endsWith("signup.html") || path.endsWith("/");

    if (onAuthPage && sess && sess.active && user) {
      // Already "logged in" in this demo → send to dashboard
      // Comment this block out if you want to force login every time
      // window.location.href = "dashboard.html";
    }
  });
})();
