// PAY54 v6.6 • signup.js
// Hybrid signup: email OR phone (phone required), 4-digit PIN

(function () {
  const form = document.getElementById("signupForm");
  const authToast = document.getElementById("authToast");

  function showAuthToast(type, message) {
    if (!authToast) return;
    authToast.textContent = message;
    authToast.className = `toast toast-${type}`;
    authToast.style.display = "block";
    setTimeout(() => {
      authToast.style.display = "none";
    }, 2800);
  }

  if (!form) return;

  // PIN eye toggles
  document.querySelectorAll(".pin-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");
      const input = document.getElementById(targetId);
      if (!input) return;
      const type = input.getAttribute("type") === "password" ? "text" : "password";
      input.setAttribute("type", type);
    });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const fullName = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const phone = document.getElementById("signupPhone").value.trim();
    const pin = document.getElementById("signupPin").value.trim();
    const pinConfirm = document.getElementById("signupPinConfirm").value.trim();
    const termsChecked = document.getElementById("signupTerms").checked;

    if (!fullName) {
      showAuthToast("error", "Please enter your full name.");
      return;
    }

    if (!phone) {
      showAuthToast("error", "Phone is required for PAY54 NG wallet.");
      return;
    }

    if (pin.length !== 4 || !/^[0-9]{4}$/.test(pin)) {
      showAuthToast("error", "PIN must be exactly 4 digits.");
      return;
    }

    if (pin !== pinConfirm) {
      showAuthToast("error", "PIN and Confirm PIN do not match.");
      return;
    }

    if (!termsChecked) {
      showAuthToast("warning", "You must agree to the terms to create your wallet.");
      return;
    }

    const user = {
      fullName,
      email: email || null,
      phone,
      pin,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem("pay54_user", JSON.stringify(user));

    const session = {
      loggedIn: true,
      id: email || phone,
      name: fullName,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem("pay54_session", JSON.stringify(session));

    showAuthToast("success", "Wallet created successfully 🎉 Redirecting...");
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 800);
  });
})();
