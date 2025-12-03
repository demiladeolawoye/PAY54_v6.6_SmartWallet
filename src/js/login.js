// src/js/login.js

(function () {
  const LOGIN_FORM_ID = "loginForm";
  const TOAST_ID = "authToast";
  const USER_KEY = "pay54_user";
  const SESSION_KEY = "pay54_session";

  // Year in footer
  const yearEl = document.getElementById("authYear");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  function showToast(message, type = "info") {
    const toast = document.getElementById(TOAST_ID);
    if (!toast) {
      alert(message);
      return;
    }
    toast.textContent = message;
    toast.className = `toast toast-${type}`;
    toast.style.display = "block";
    setTimeout(() => (toast.style.display = "none"), 2600);
  }

  function togglePasswordVisibility(button) {
    const targetId = button.getAttribute("data-target");
    const input = document.getElementById(targetId);
    if (!input) return;
    const isPassword = input.type === "password";
    input.type = isPassword ? "text" : "password";
  }

  // Attach eye toggles
  document.querySelectorAll(".eye-toggle").forEach((btn) => {
    btn.addEventListener("click", () => togglePasswordVisibility(btn));
  });

  const form = document.getElementById(LOGIN_FORM_ID);
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const id = document.getElementById("loginIdentifier").value.trim();
    const pin = document.getElementById("loginPin").value.trim();

    if (!id || !pin) {
      showToast("Please fill all fields.", "warning");
      return;
    }

    const stored = localStorage.getItem(USER_KEY);
    if (!stored) {
      showToast("No PAY54 account found. Please create one.", "error");
      setTimeout(() => {
        window.location.href = "signup.html";
      }, 800);
      return;
    }

    let user;
    try {
      user = JSON.parse(stored);
    } catch {
      showToast("Corrupt user data. Please sign up again.", "error");
      localStorage.removeItem(USER_KEY);
      return;
    }

    const normalizedId = id.toLowerCase();
    const matchesIdentifier =
      user.email?.toLowerCase() === normalizedId ||
      user.phone?.replace(/\s+/g, "") === normalizedId.replace(/\s+/g, "") ||
      ("@" + (user.paytag || "").replace(/^@/, "").toLowerCase()) ===
        (normalizedId.startsWith("@") ? normalizedId : "@" + normalizedId);

    if (!matchesIdentifier || user.pin !== pin) {
      showToast("Incorrect login details. Check ID & PIN.", "error");
      return;
    }

    // Save session
    const session = {
      email: user.email,
      loggedInAt: Date.now(),
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));

    showToast("✅ Login successful. Loading dashboard…", "success");
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 800);
  });
})();
