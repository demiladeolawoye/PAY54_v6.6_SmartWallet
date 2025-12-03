// ===============================
// PAY54 v6.6 – SIGNUP LOGIC
// ===============================

(function () {
  const STORAGE_USER = "pay54_user";
  const STORAGE_SESSION = "pay54_session";

  const form = document.getElementById("signupForm");
  const toast = document.getElementById("authToast");

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.style.display = "block";
    setTimeout(() => {
      toast.style.display = "none";
    }, 2500);
  }

  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("signupName").value.trim();
    const id = document.getElementById("signupIdentifier").value.trim();
    const country = document.getElementById("signupCountry").value;
    const pin = document.getElementById("signupPin").value.trim();
    const pinConfirm = document
      .getElementById("signupPinConfirm")
      .value.trim();
    const terms = document.getElementById("signupTerms").checked;

    if (!name || !id || !pin || !pinConfirm) {
      showToast("Please fill all required fields.");
      return;
    }

    if (pin.length !== 4) {
      showToast("PIN must be exactly 4 digits.");
      return;
    }

    if (pin !== pinConfirm) {
      showToast("PIN and Confirm PIN do not match.");
      return;
    }

    if (!terms) {
      showToast("You must agree to the Terms to continue.");
      return;
    }

    // Derive currency from country (simple mock)
    let currency = "NGN";
    if (country === "GH") currency = "GHS";
    if (country === "KE") currency = "KES";
    if (country === "ZA") currency = "ZAR";

    const user = {
      id,                // email or phone
      name,
      country,
      currency,
      pin,
      createdAt: Date.now(),
      kycTier: "Tier 1 (Mock)",
      balance: 12500,    // starting mock balance
    };

    localStorage.setItem(STORAGE_USER, JSON.stringify(user));

    const session = {
      loggedIn: true,
      userId: id,
      name,
      createdAt: Date.now(),
    };
    localStorage.setItem(STORAGE_SESSION, JSON.stringify(session));

    showToast("Account created! Redirecting to your dashboard…");
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 800);
  });

  // Reuse eye toggle (same pattern as login)
  const toggles = document.querySelectorAll(".pin-toggle");
  toggles.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");
      const input = document.getElementById(targetId);
      if (!input) return;
      input.type = input.type === "password" ? "text" : "password";
    });
  });
})();
