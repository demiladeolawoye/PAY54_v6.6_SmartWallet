// ===============================
// PAY54 v6.6 – LOGIN & AUTH ENTRY
// ===============================

(function () {
  const STORAGE_USER = "pay54_user";
  const STORAGE_SESSION = "pay54_session";

  const loginForm = document.getElementById("loginForm");
  const forgotBtn = document.getElementById("forgotPinBtn");
  const authToast = document.getElementById("authToast");

  // Toast helper
  function showToast(message) {
    if (!authToast) return;
    authToast.textContent = message;
    authToast.style.display = "block";
    setTimeout(() => {
      authToast.style.display = "none";
    }, 2500);
  }

  // Eye toggle for PIN fields (login + signup reuse)
  function setupPinToggles() {
    const toggles = document.querySelectorAll(".pin-toggle");
    toggles.forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetId = btn.getAttribute("data-target");
        const input = document.getElementById(targetId);
        if (!input) return;
        const isPassword = input.type === "password";
        input.type = isPassword ? "text" : "password";
      });
    });
  }

  setupPinToggles();

  // ----------------------
  // LOGIN SUBMIT HANDLER
  // ----------------------
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const id = document.getElementById("loginIdentifier").value.trim();
      const pin = document.getElementById("loginPin").value.trim();

      if (!id || !pin) {
        showToast("Please enter your details.");
        return;
      }

      const rawUser = localStorage.getItem(STORAGE_USER);
      if (!rawUser) {
        alert("No PAY54 account found on this device. Please create one.");
        window.location.href = "signup.html";
        return;
      }

      let user;
      try {
        user = JSON.parse(rawUser);
      } catch (err) {
        console.error("Invalid user data:", err);
        alert("Corrupted user data. Please sign up again.");
        localStorage.removeItem(STORAGE_USER);
        return;
      }

      if (user.id === id && user.pin === pin) {
        // Create session
        const session = {
          loggedIn: true,
          userId: user.id,
          name: user.name || "",
          createdAt: Date.now(),
        };
        localStorage.setItem(STORAGE_SESSION, JSON.stringify(session));

        showToast("Welcome back, " + (user.name || "PAY54 user") + "!");
        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 600);
      } else {
        showToast("Incorrect login details. Try again.");
      }
    });
  }

  // ----------------------
  // FORGOT PIN (Mock flow)
  // ----------------------
  if (forgotBtn) {
    forgotBtn.addEventListener("click", () => {
      const rawUser = localStorage.getItem(STORAGE_USER);
      if (!rawUser) {
        alert("No PAY54 account found on this device. Please create one first.");
        window.location.href = "signup.html";
        return;
      }

      const id = prompt(
        "Enter your registered email or phone to reset PIN (mock demo):"
      );
      if (!id) return;

      // Mock OTP
      alert("Mock OTP 123456 sent to " + id);

      const otp = prompt("Enter OTP (demo: 123456):");
      if (otp !== "123456") {
        alert("Incorrect OTP (demo).");
        return;
      }

      const newPin = prompt("Enter new 4-digit PIN:");
      if (!newPin || newPin.length !== 4) {
        alert("PIN must be exactly 4 digits.");
        return;
      }

      try {
        const user = JSON.parse(rawUser);
        user.pin = newPin;
        localStorage.setItem(STORAGE_USER, JSON.stringify(user));
        showToast("PIN reset successfully (mock). Please sign in.");
      } catch (err) {
        console.error(err);
        alert("Could not update PIN (mock error).");
      }
    });
  }
})();
