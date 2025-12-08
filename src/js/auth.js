// auth.js
// Handles: signup, login, recover, verify, and PIN eye toggle

(function () {
  const session = window.PAY54Session;

  document.addEventListener("DOMContentLoaded", () => {
    wirePinToggles();
    wireSignupForm();
    wireLoginForm();
    wireRecoverForm();
    wireVerifyForm();
  });

  function wirePinToggles() {
    const toggles = document.querySelectorAll(".toggle-pin");
    toggles.forEach((btn) => {
      btn.addEventListener("click", () => {
        const wrapper = btn.closest(".input-wrapper");
        if (!wrapper) return;
        const input = wrapper.querySelector("input");
        if (!input) return;

        const isPassword = input.type === "password";
        input.type = isPassword ? "text" : "password";
      });
    });
  }

  function wireSignupForm() {
    const form = document.getElementById("signupForm");
    if (!form) return;

    const nameInput = document.getElementById("signup-name");
    const emailInput = document.getElementById("signup-email");
    const phoneInput = document.getElementById("signup-phone");
    const pinInput = document.getElementById("signup-pin");
    const errorBox = document.getElementById("signupError");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!nameInput || !emailInput || !phoneInput || !pinInput) return;

      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      const phone = phoneInput.value.trim();
      const pin = pinInput.value.trim();

      if (pin.length < 4 || pin.length > 6) {
        showError(errorBox, "PIN must be between 4 and 6 digits.");
        return;
      }

      const user = {
        fullName: name,
        email,
        phone,
        pin,
        createdAt: new Date().toISOString(),
      };

      session.setCurrentUser(user);
      session.setLoggedIn(true);

      window.location.href = "dashboard.html";
    });
  }

  function wireLoginForm() {
    const form = document.getElementById("loginForm");
    if (!form) return;

    const identifierInput = document.getElementById("login-identifier");
    const pinInput = document.getElementById("login-pin");
    const errorBox = document.getElementById("loginError");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const user = session.getCurrentUser();

      if (!user) {
        showError(
          errorBox,
          "No PAY54 wallet found. Please create a wallet first."
        );
        return;
      }

      const identifier = (identifierInput.value || "").trim().toLowerCase();
      const pin = (pinInput.value || "").trim();

      const matchesIdentifier =
        identifier === user.email?.toLowerCase() ||
        identifier === user.phone?.toLowerCase() ||
        identifier === user.fullName?.toLowerCase();

      if (!matchesIdentifier || pin !== user.pin) {
        showError(errorBox, "Invalid details. Please check your ID and PIN.");
        return;
      }

      session.setLoggedIn(true);
      window.location.href = "dashboard.html";
    });
  }

  function wireRecoverForm() {
    const form = document.getElementById("recoverForm");
    if (!form) return;

    const identifierInput = document.getElementById("recover-identifier");
    const infoBox = document.getElementById("recoverInfo");
    const errorBox = document.getElementById("recoverError");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const identifier = (identifierInput.value || "").trim();

      if (!identifier) {
        showError(errorBox, "Please enter your email or mobile number.");
        return;
      }

      // Save the context of who is recovering
      const user = session.getCurrentUser();
      if (!user) {
        showError(
          errorBox,
          "We could not find a PAY54 wallet on this device. Please sign up again."
        );
        return;
      }

      // For demo: we use a static code 123456
      const RECOVERY_CODE = "123456";
      sessionStorage.setItem("pay54RecoveryIdentifier", identifier);
      sessionStorage.setItem("pay54RecoveryCode", RECOVERY_CODE);

      showInfo(
        infoBox,
        "A 6-digit code has been 'sent'. For demo, use 123456 on the next screen."
      );

      setTimeout(() => {
        window.location.href = "verify.html";
      }, 800);
    });
  }

  function wireVerifyForm() {
    const form = document.getElementById("verifyForm");
    if (!form) return;

    const codeInput = document.getElementById("verify-code");
    const newPinInput = document.getElementById("new-pin");
    const confirmPinInput = document.getElementById("confirm-pin");
    const errorBox = document.getElementById("verifyError");
    const infoBox = document.getElementById("verifyInfo");
    const subtitle = document.getElementById("verifySubtitle");

    // Show who we are resetting for (if stored)
    const identifier = sessionStorage.getItem("pay54RecoveryIdentifier");
    if (identifier && subtitle) {
      subtitle.textContent =
        "We’ve sent a 6-digit code to " +
        identifier +
        ". Use it below to reset your PIN.";
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const storedCode = sessionStorage.getItem("pay54RecoveryCode") || "123456";
      const code = (codeInput.value || "").trim();
      const newPin = (newPinInput.value || "").trim();
      const confirmPin = (confirmPinInput.value || "").trim();

      if (code !== storedCode) {
        showError(errorBox, "Incorrect code. Please check and try again.");
        return;
      }

      if (newPin.length < 4 || newPin.length > 6) {
        showError(errorBox, "PIN must be between 4 and 6 digits.");
        return;
      }

      if (newPin !== confirmPin) {
        showError(errorBox, "PINs do not match.");
        return;
      }

      const user = session.getCurrentUser();
      if (!user) {
        showError(
          errorBox,
          "We could not find a PAY54 wallet on this device. Please sign up again."
        );
        return;
      }

      user.pin = newPin;
      session.setCurrentUser(user);
      session.setLoggedIn(true);

      showInfo(infoBox, "PIN updated successfully. Redirecting to dashboard…");

      // Clean up recovery context
      sessionStorage.removeItem("pay54RecoveryIdentifier");
      sessionStorage.removeItem("pay54RecoveryCode");

      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 900);
    });
  }

  function showError(el, msg) {
    if (!el) return;
    el.textContent = msg;
    el.style.display = "block";
  }

  function showInfo(el, msg) {
    if (!el) return;
    el.textContent = msg;
    el.style.display = "block";
  }
})();
