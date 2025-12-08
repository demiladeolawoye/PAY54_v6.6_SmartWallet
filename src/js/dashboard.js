// dashboard.js
// Handles dashboard session guard, greeting, mock actions

(function () {
  const session = window.PAY54Session;

  document.addEventListener("DOMContentLoaded", () => {
    // Protect dashboard – if not logged in, send to login
    session.ensureAuthenticated();

    hydrateUserHeader();
    wireLogoutButton();
    wireFeatureCards();
    wireQuickServices();
  });

  function hydrateUserHeader() {
    const user = session.getCurrentUser();
    const greetingEl = document.getElementById("userGreeting");
    const avatarEl = document.getElementById("userAvatar");

    const now = new Date();
    const hour = now.getHours();
    let greeting = "Hello";

    if (hour < 12) greeting = "Good morning";
    else if (hour < 18) greeting = "Good afternoon";
    else greeting = "Good evening";

    if (user && greetingEl) {
      greetingEl.textContent = `${greeting}, ${user.fullName || "PAY54 user"}`;
    }

    if (avatarEl) {
      const initials = (user?.fullName || "P 54")
        .split(" ")
        .map((p) => p.charAt(0).toUpperCase())
        .slice(0, 2)
        .join("");
      avatarEl.textContent = initials || "P54";
    }
  }

  function wireLogoutButton() {
    const btn = document.getElementById("logoutBtn");
    if (!btn) return;
    btn.addEventListener("click", () => {
      session.logout();
    });
  }

  function wireFeatureCards() {
    const cards = document.querySelectorAll(".feature-card");
    cards.forEach((card) => {
      const action = card.getAttribute("data-action");
      card.addEventListener("click", () => {
        handleAction(action);
      });
    });
  }

  function wireQuickServices() {
    const chips = document.querySelectorAll(".quick-chip");
    chips.forEach((chip) => {
      const action = chip.getAttribute("data-action");
      chip.addEventListener("click", () => {
        handleAction(action);
      });
    });
  }

  function handleAction(action) {
    // For now we just show a clean placeholder
    const mapping = {
      "send-money": "Send money",
      "receive-money": "Receive money",
      "add-money": "Add / Withdraw money",
      fx: "FX & Cross-border",
      "shop-on-the-fly": "Shop on the fly",
      "bills-airtime": "Bills & Airtime",
      "invest-stocks": "Invest & stocks",
      "virtual-cards": "Virtual & linked cards",
      savings: "Savings & goals",
      "agent-network": "Become an agent",
      "buy-airtime": "Buy airtime",
      "buy-data": "Buy data",
      "pay-electricity": "Pay electricity",
      "pay-tv": "Pay TV subscription",
      "betting-wallet": "Fund betting wallet",
      "transport-topup": "Top up transport",
    };

    const label = mapping[action] || "This feature";

    alert(`${label} is coming soon in PAY54 v7.0 – this is a live UI mock.`);
  }
})();
