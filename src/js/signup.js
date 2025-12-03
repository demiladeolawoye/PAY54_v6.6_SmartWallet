// src/js/signup.js

(function () {
  const SIGNUP_FORM_ID = "signupForm";
  const TOAST_ID = "authToast";
  const USER_KEY = "pay54_user";

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

  function generateWalletId() {
    const n = Math.floor(10000000 + Math.random() * 90000000);
    return `P54-${n}`;
  }

  const form = document.getElementById(SIGNUP_FORM_ID);
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const phone = document.getElementById("signupPhone").value.trim();
    let paytag = document.getElementById("signupPaytag").value.trim();
    const pin = document.getElementById("signupPin").value.trim();
    const pinConfirm = document
      .getElementById("signupPinConfirm")
      .value.trim();
    const accepted = document.getElementById("acceptTerms").checked;

    if (!fullName || !email || !phone || !paytag || !pin || !pinConfirm) {
      showToast("Please fill in all fields.", "warning");
      return;
    }

    if (!accepted) {
      showToast("Please accept the Terms to continue.", "warning");
      return;
    }

    if (pin.length !== 4 || !/^[0-9]{4}$/.test(pin)) {
      showToast("PIN must be exactly 4 digits.", "warning");
      return;
    }

    if (pin !== pinConfirm) {
      showToast("PIN and confirmation do not match.", "error");
      return;
    }

    // Normalise paytag: always store as "demi", and derive "@demi" in UI
    paytag = paytag.replace(/^@/, "").toLowerCase();

    const user = {
      fullName,
      email: email.toLowerCase(),
      phone: phone.replace(/\s+/g, ""),
      paytag,
      pin,
      walletId: generateWalletId(),
      balance: 12500, // starting mock balance
      tier: "Tier 1 (Mock KYC)",
      createdAt: Date.now(),
    };

    localStorage.setItem(USER_KEY, JSON.stringify(user));
    showToast("✅ Wallet created. You can now sign in.", "success");

    setTimeout(() => {
      window.location.href = "login.html";
    }, 900);
  });
})();
