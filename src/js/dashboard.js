// PAY54 v6.5 – SmartWallet Dashboard logic

(function () {
  const STORAGE_KEY = "pay54_user";

  function getUser() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (_) {
      return null;
    }
  }

  function saveUser(user) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } catch (_) {
      // ignore demo errors
    }
  }

  function formatNaira(amount) {
    return "₦" + amount.toLocaleString("en-NG", { maximumFractionDigits: 2 });
  }

  function formatDollar(amount) {
    return (
      "$" + amount.toLocaleString("en-US", { maximumFractionDigits: 2 })
    );
  }

  function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2500);
  }

  function buildMockTransactions(user) {
    const name = user?.name?.split(" ")[0] || "Demi";
    const tx = [
      {
        type: "out",
        title: "Send to @" + (user?.id || "paytag"),
        meta: "PAY54 P2P • Completed",
        amount: 12000
      },
      {
        type: "in",
        title: "From Uncle – Allowance",
        meta: "NGN wallet • Completed",
        amount: 45000
      },
      {
        type: "out",
        title: "Shop on the Fly – Jumia",
        meta: "Card • Successful",
        amount: 8700
      },
      {
        type: "out",
        title: "PHCN Ikeja Electric",
        meta: "Bills & Top-up • Token",
        amount: 25000
      },
      {
        type: "in",
        title: `${name}'s FX top-up`,
        meta: "USD rail • Completed",
        amount: 130000
      }
    ];
    return tx;
  }

  function renderTransactions(listEl, tx) {
    if (!listEl) return;

    listEl.innerHTML = "";

    tx.forEach((item) => {
      const row = document.createElement("div");
      row.className = "tx-row";

      const left = document.createElement("div");
      left.className = "tx-left";

      const circle = document.createElement("div");
      circle.className =
        "tx-circle " + (item.type === "out" ? "out" : "in");
      circle.textContent = item.type === "out" ? "−" : "+";

      const main = document.createElement("div");
      main.className = "tx-main";

      const title = document.createElement("div");
      title.className = "tx-title";
      title.textContent = item.title;

      const meta = document.createElement("div");
      meta.className = "tx-meta";
      meta.textContent = item.meta;

      main.appendChild(title);
      main.appendChild(meta);
      left.appendChild(circle);
      left.appendChild(main);

      const right = document.createElement("div");
      right.className = "tx-right";

      const amount = document.createElement("div");
      amount.className =
        "tx-amount " + (item.type === "out" ? "out" : "in");
      amount.textContent =
        (item.type === "out" ? "−" : "+") + formatNaira(item.amount);

      const status = document.createElement("div");
      status.className = "tx-status";
      status.textContent = "Completed";

      right.appendChild(amount);
      right.appendChild(status);

      row.appendChild(left);
      row.appendChild(right);

      listEl.appendChild(row);
    });
  }

  function init() {
    const user = getUser();

    // If no signup yet, push to signup
    if (!user || !user.id || !user.pin) {
      showToast("Redirecting – please create a PAY54 account.");
      setTimeout(() => {
        window.location.href = "signup.html";
      }, 900);
      return;
    }

    // Ensure some defaults
    if (typeof user.balance !== "number") {
      user.balance = 245500;
    }
    if (!user.walletId) {
      user.walletId = "P54-1029-3456-78";
    }
    if (!user.accountNumber) {
      user.accountNumber = "1029345678";
    }
    if (!user.kycLevel) {
      user.kycLevel = "Tier 2 (BVN verified)";
    }

    saveUser(user);

    const firstName = user.name?.split(" ")[0] || "Demi";

    // DOM refs
    const welcomeTitle = document.getElementById("welcomeTitle");
    const userNameEl = document.getElementById("userName");
    const userIdEl = document.getElementById("userId");
    const avatarEl = document.getElementById("userAvatar");
    const balanceEl = document.getElementById("balanceAmount");
    const fxHintEl = document.getElementById("fxBalanceHint");
    const walletIdEl = document.getElementById("walletId");
    const accountEl = document.getElementById("accountNumber");
    const kycEl = document.getElementById("kycLevel");
    const lastScanEl = document.getElementById("lastScanText");
    const refreshBtn = document.getElementById("refreshBalanceBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const txListEl = document.getElementById("txList");

    // Populate header / hero
    if (welcomeTitle)
      welcomeTitle.textContent = `Welcome back, ${firstName} 👋`;
    if (userNameEl) userNameEl.textContent = firstName;
    if (userIdEl) userIdEl.textContent = user.id;
    if (avatarEl) {
      avatarEl.textContent = firstName.charAt(0).toUpperCase();
    }

    const fxRate = 1350; // demo only
    const balanceN = user.balance;
    const usdApprox = balanceN / fxRate;

    if (balanceEl) balanceEl.textContent = formatNaira(balanceN);
    if (fxHintEl)
      fxHintEl.textContent =
        "≈ " + formatDollar(usdApprox) + " at ₦" + fxRate.toLocaleString() + "/$";
    if (walletIdEl) walletIdEl.textContent = "Wallet: " + user.walletId;
    if (accountEl) accountEl.textContent = "Account: " + user.accountNumber;
    if (kycEl) kycEl.textContent = "KYC: " + user.kycLevel;
    if (lastScanEl) lastScanEl.textContent = "Just now • 0 risky patterns";

    // Render transactions
    const mockTx = buildMockTransactions(user);
    renderTransactions(txListEl, mockTx);

    // Button wiring
    if (refreshBtn) {
      refreshBtn.addEventListener("click", () => {
        // Simulate a small FX refresh bump
        const delta = Math.round(Math.random() * 5000 - 2500);
        user.balance = Math.max(0, user.balance + delta);
        saveUser(user);

        if (balanceEl) balanceEl.textContent = formatNaira(user.balance);
        const usdNew = user.balance / fxRate;
        if (fxHintEl)
          fxHintEl.textContent =
            "≈ " +
            formatDollar(usdNew) +
            " at ₦" +
            fxRate.toLocaleString() +
            "/$";

        showToast("Balance refreshed (demo only).");
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        showToast("Logging out of PAY54 demo…");
        setTimeout(() => {
          window.location.href = "login.html";
        }, 800);
      });
    }

    // Simple demo handlers for cards
    const clickMap = [
      ["sendMoneyCard", "Send money flow will open in real app."],
      ["receiveMoneyCard", "Receive via QR / paylink in live build."],
      ["topUpCard", "Add / withdraw from cards, banks & agents."],
      ["billsCard", "Bills, power, airtime & TV payments (demo)."],
      ["crossBorderCard", "Cross-border FX rail 🇳🇬 → 🇬🇧 🇺🇸 🇪🇺 (demo)."],
      ["savingsCard", "Savings pots & goals dashboard (demo)."],
      ["cardsCard", "Manage virtual & linked cards (demo)."],
      ["shopCard", "Shop on the Fly opens affiliate links (demo)."],
      ["investCard", "Investments & portfolio screen (demo)."],
      ["agentCard", "Agent onboarding & KYC flow (demo)."],
      ["quickSendBtn", "Quick send shortcut (demo)."],
      ["myProfileBtn", "Profile & settings screen (demo)."],
      ["viewAllTxBtn", "In live app this opens full transaction history."]
    ];

    clickMap.forEach(([id, msg]) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener("click", () => showToast(msg));
      }
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
