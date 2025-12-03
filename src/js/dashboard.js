// ==============================
// PAY54 v6.6 - Dashboard Logic
// ==============================

document.addEventListener("DOMContentLoaded", () => {
  // ---- State ----
  let wallet = loadOrInitWallet();

  // ---- Initial render ----
  renderWallet();
  wireCoreButtons();
  wireQuickSend();

  // ==========================
  //  STATE HELPERS
  // ==========================
  function loadOrInitWallet() {
    try {
      const stored = localStorage.getItem("pay54_wallet");
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn("Failed to parse pay54_wallet, resetting.");
    }

    const session = JSON.parse(localStorage.getItem("pay54_session") || "{}");
    const ownerName = session.name || "PAY54 User";
    const walletId = session.id || "P54-0000000001";

    const initialWallet = {
      ownerName,
      walletId,
      currency: "NGN",
      balance: 12500,
      transactions: [
        {
          id: "t1",
          type: "credit",
          title: "Wallet Top-up",
          description: "Card funding",
          amount: 15000,
          ts: Date.now() - 3600 * 1000 * 6
        },
        {
          id: "t2",
          type: "debit",
          title: "Transfer to Chinedu",
          description: "P2P Transfer",
          amount: 5000,
          ts: Date.now() - 3600 * 1000 * 4
        },
        {
          id: "t3",
          type: "debit",
          title: "Airtime • MTN",
          description: "Mobile top-up",
          amount: 1000,
          ts: Date.now() - 3600 * 1000 * 2
        },
        {
          id: "t4",
          type: "debit",
          title: "Electricity • Ikeja Disco",
          description: "Prepaid token",
          amount: 2500,
          ts: Date.now() - 3600 * 1000
        }
      ],
      savingsGoals: [],
      cards: [
        {
          id: "c1",
          label: "PAY54 Virtual Visa",
          type: "virtual",
          network: "VISA",
          last4: "8421",
          isDefault: true,
          isFrozen: false
        },
        {
          id: "c2",
          label: "GTBank Linked Card",
          type: "linked",
          network: "VISA",
          last4: "2299",
          isDefault: false,
          isFrozen: false
        },
        {
          id: "c3",
          label: "Access Bank Linked Card",
          type: "linked",
          network: "Mastercard",
          last4: "7711",
          isDefault: false,
          isFrozen: false
        }
      ],
      portfolio: [],
      requests: [],
      notifications: []
    };

    saveWallet(initialWallet);
    return initialWallet;
  }

  function saveWallet(w) {
    wallet = w;
    localStorage.setItem("pay54_wallet", JSON.stringify(w));
  }

  function formatNaira(amount) {
    const n = Number(amount) || 0;
    return "₦" + n.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function formatTime(ts) {
    const d = new Date(ts);
    return d.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function addTransaction({ type, title, description, amount }) {
    const tx = {
      id: "t" + Date.now(),
      type,
      title,
      description: description || "",
      amount: Number(amount) || 0,
      ts: Date.now()
    };
    wallet.transactions.unshift(tx); // newest first
    if (wallet.transactions.length > 50) {
      wallet.transactions = wallet.transactions.slice(0, 50);
    }
    saveWallet(wallet);
    renderTransactions();
  }

  // ==========================
  //  RENDERING
  // ==========================
  function renderWallet() {
    const balEl = document.getElementById("walletBalance");
    if (balEl) balEl.textContent = formatNaira(wallet.balance);
    renderTransactions();
  }

  function renderTransactions() {
    const list = document.getElementById("recentList");
    if (!list) return;

    list.innerHTML = "";

    if (!wallet.transactions || wallet.transactions.length === 0) {
      list.innerHTML = `<li class="recent-empty">No transactions yet – start by making a move.</li>`;
      return;
    }

    wallet.transactions.slice(0, 12).forEach(tx => {
      const li = document.createElement("li");
      li.className = "recent-item";

      const left = document.createElement("div");
      left.className = "recent-left";
      left.innerHTML = `
        <div class="tx-title">${tx.title}</div>
        <div class="tx-meta">${formatTime(tx.ts)} • ${tx.description || ""}</div>
      `;

      const right = document.createElement("div");
      right.className = "recent-right";
      right.textContent = (tx.type === "debit" ? "-" : "+") + formatNaira(tx.amount);
      right.style.color = tx.type === "debit" ? "#f97373" : "#4ade80";

      li.appendChild(left);
      li.appendChild(right);
      list.appendChild(li);
    });
  }

  // ==========================
  //  TOASTS
  // ==========================
  function showToast(type, message) {
    let toast = document.getElementById("globalToast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "globalToast";
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.style.position = "fixed";
    toast.style.top = "16px";
    toast.style.right = "16px";
    toast.style.padding = "10px 16px";
    toast.style.borderRadius = "12px";
    toast.style.color = "#fff";
    toast.style.fontSize = "13px";
    toast.style.zIndex = 9999;
    toast.style.boxShadow = "0 10px 30px rgba(15,23,42,0.6)";

    let bg;
    switch (type) {
      case "success":
        bg = "linear-gradient(90deg,#16a34a,#22c55e)";
        break;
      case "error":
        bg = "linear-gradient(90deg,#dc2626,#ef4444)";
        break;
      case "warning":
        bg = "linear-gradient(90deg,#f97316,#facc15)";
        break;
      default:
        bg = "linear-gradient(90deg,#2563eb,#1d4ed8)";
    }
    toast.style.background = bg;
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-10px)";
    toast.style.transition = "all 0.2s ease-out";

    requestAnimationFrame(() => {
      toast.style.opacity = "1";
      toast.style.transform = "translateY(0)";
    });

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(-10px)";
    }, 2600);
  }

  // ==========================
  //  MODAL SYSTEM
  // ==========================
  function openModal(innerHtml) {
    const container = document.getElementById("modalContainer");
    if (!container) return;

    container.innerHTML = `
      <div class="modal" id="activeModal">
        <div class="modal-box">
          ${innerHtml}
        </div>
      </div>
    `;

    const modal = document.getElementById("activeModal");
    modal.classList.remove("hidden");

    // close on overlay click
    modal.addEventListener("click", (e) => {
      if (e.target.id === "activeModal") {
        closeModal();
      }
    });

    // close on any [data-close]
    modal.querySelectorAll("[data-close]").forEach(btn => {
      btn.addEventListener("click", closeModal);
    });

    return modal;
  }

  function closeModal() {
    const container = document.getElementById("modalContainer");
    if (container) container.innerHTML = "";
  }

  // ==========================
  //  BUTTON WIRING
  // ==========================
  function wireCoreButtons() {
    const el = id => document.getElementById(id);

    // Money moves
    el("sendMoneyBtn")?.addEventListener("click", openSendMoneyModal);
    el("receiveMoneyBtn")?.addEventListener("click", openReceiveMoneyModal);
    el("addWithdrawBtn")?.addEventListener("click", () => openAddWithdrawModal("add"));
    el("bankTransferBtn")?.addEventListener("click", openBankTransferModal);

    // Balance section buttons
    el("addMoneyBtn")?.addEventListener("click", () => openAddWithdrawModal("add"));
    el("withdrawBtn")?.addEventListener("click", () => openAddWithdrawModal("withdraw"));

    // Services
    el("crossBorderBtn")?.addEventListener("click", openCrossBorderModal);
    el("savingsBtn")?.addEventListener("click", openSavingsModal);
    el("payBillsBtn")?.addEventListener("click", openPayBillsModal);
    el("virtualCardBtn")?.addEventListener("click", openCardsModal);
    el("payOnlineBtn")?.addEventListener("click", openPayOnlineModal);
    el("shopFlyBtn")?.addEventListener("click", openShopFlyModal);
    el("investBtn")?.addEventListener("click", openInvestModal);
    el("becomeAgentBtn")?.addEventListener("click", openAgentModal);

    // Profile click → simple profile modal
    document.getElementById("profileBtn")?.addEventListener("click", openProfileModal);
  }

  function wireQuickSend() {
    const setQuick = (id, amount) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener("click", () => {
        openSendMoneyModal(amount);
      });
    };
    setQuick("quickSend1", 1000);
    setQuick("quickSend2", 5000);
    setQuick("quickSend3", 10000);
    setQuick("quickSend4", null); // custom – just open normal modal
  }

  // ==========================
  //  FEATURE MODALS
  // ==========================

  // --- 1) SEND MONEY ---
  function openSendMoneyModal(presetAmount) {
    const modal = openModal(`
      <h3>Send Money</h3>
      <div class="modal-body">
        <div class="form-row">
          <label>Recipient (Paytag / Phone / Email)</label>
          <input type="text" id="sendRecipient" placeholder="@paytag or +234..." />
        </div>
        <div class="form-row">
          <label>Amount (₦)</label>
          <input type="number" id="sendAmount" min="1" value="${presetAmount || ""}" />
        </div>
        <div class="form-row">
          <label>Note (optional)</label>
          <textarea id="sendNote" rows="2" placeholder="What is this for?"></textarea>
        </div>
        <div class="summary">
          <div class="summary-row">
            <span>Fee (0.5%)</span>
            <span id="sendFeeLabel">₦0.00</span>
          </div>
          <div class="summary-row">
            <span>Total</span>
            <span id="sendTotalLabel">₦0.00</span>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-outline" data-close>Cancel</button>
        <button class="btn-primary" id="sendConfirmBtn">Send</button>
      </div>
    `);

    const amountEl = modal.querySelector("#sendAmount");
    const feeEl = modal.querySelector("#sendFeeLabel");
    const totalEl = modal.querySelector("#sendTotalLabel");

    const recalc = () => {
      const amt = Number(amountEl.value) || 0;
      const fee = amt * 0.005;
      feeEl.textContent = formatNaira(fee);
      totalEl.textContent = formatNaira(amt + fee);
    };
    amountEl.addEventListener("input", recalc);
    recalc();

    modal.querySelector("#sendConfirmBtn").addEventListener("click", () => {
      const recipient = modal.querySelector("#sendRecipient").value.trim();
      const amount = Number(amountEl.value) || 0;
      const note = modal.querySelector("#sendNote").value.trim();

      if (!recipient) {
        showToast("warning", "Please enter a recipient.");
        return;
      }
      if (amount <= 0) {
        showToast("warning", "Enter a valid amount.");
        return;
      }
      const total = amount * 1.005;
      if (total > wallet.balance) {
        showToast("error", "Insufficient balance.");
        return;
      }

      wallet.balance -= total;
      addTransaction({
        type: "debit",
        title: `Transfer to ${recipient}`,
        description: note || "P2P transfer",
        amount: total
      });
      saveWallet(wallet);
      renderWallet();
      closeModal();
      showToast("success", `💸 Transfer sent to ${recipient}`);
    });
  }

  // --- 2) RECEIVE MONEY / REQUEST MONEY ---
  function openReceiveMoneyModal() {
    const modal = openModal(`
      <h3>Receive Money</h3>
      <div class="modal-body">
        <p>Your PAY54 wallet ID:</p>
        <div class="wallet-id-box">
          <span id="walletIdLabel">${wallet.walletId}</span>
          <button class="btn-mini" id="copyWalletIdBtn">Copy</button>
        </div>
        <p style="margin-top:0.8rem;">Create a money request (optional):</p>
        <div class="form-row">
          <label>From (Name)</label>
          <input type="text" id="requestFrom" placeholder="Who are you requesting from?" />
        </div>
        <div class="form-row">
          <label>Amount (₦)</label>
          <input type="number" id="requestAmount" min="1" />
        </div>
        <div class="form-row">
          <label>Message</label>
          <textarea id="requestMsg" rows="2" placeholder="For rent / fuel / fees"></textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-outline" data-close>Close</button>
        <button class="btn-primary" id="createRequestBtn">Create request</button>
      </div>
    `);

    modal.querySelector("#copyWalletIdBtn").addEventListener("click", () => {
      const txt = wallet.walletId;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(txt);
        showToast("success", "Wallet ID copied.");
      } else {
        showToast("info", "Copy not supported on this browser.");
      }
    });

    modal.querySelector("#createRequestBtn").addEventListener("click", () => {
      const from = modal.querySelector("#requestFrom").value.trim();
      const amt = Number(modal.querySelector("#requestAmount").value) || 0;
      const msg = modal.querySelector("#requestMsg").value.trim();

      if (!from || amt <= 0) {
        showToast("warning", "Please enter name and amount.");
        return;
      }

      const req = {
        id: "rq" + Date.now(),
        from,
        amount: amt,
        msg,
        ts: Date.now(),
        status: "pending"
      };
      wallet.requests.unshift(req);
      wallet.notifications.unshift({
        id: "n" + Date.now(),
        type: "request",
        text: `Incoming money request from ${from} for ${formatNaira(amt)}`
      });
      saveWallet(wallet);
      closeModal();
      showToast("success", "Money request saved (mock).");
    });
  }

  // --- 3) ADD / WITHDRAW FUNDS ---
  function openAddWithdrawModal(defaultAction) {
    const modal = openModal(`
      <h3>Add / Withdraw</h3>
      <div class="modal-body">
        <div class="form-row">
          <label>Action</label>
          <select id="fundAction">
            <option value="add"${defaultAction === "add" ? " selected" : ""}>Add Money</option>
            <option value="withdraw"${defaultAction === "withdraw" ? " selected" : ""}>Withdraw</option>
          </select>
        </div>
        <div class="form-row">
          <label>Method</label>
          <select id="fundMethod">
            <option value="card">Linked Card</option>
            <option value="bank">Bank Account</option>
            <option value="agent">PAY54 Agent</option>
          </select>
        </div>
        <div class="form-row">
          <label>Amount (₦)</label>
          <input type="number" id="fundAmount" min="1" />
        </div>
        <div class="form-row">
          <label>Note (optional)</label>
          <textarea id="fundNote" rows="2"></textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-outline" data-close>Cancel</button>
        <button class="btn-primary" id="fundConfirmBtn">Confirm</button>
      </div>
    `);

    modal.querySelector("#fundConfirmBtn").addEventListener("click", () => {
      const action = modal.querySelector("#fundAction").value;
      const method = modal.querySelector("#fundMethod").value;
      const amount = Number(modal.querySelector("#fundAmount").value) || 0;
      const note = modal.querySelector("#fundNote").value.trim();

      if (amount <= 0) {
        showToast("warning", "Enter a valid amount.");
        return;
      }

      if (action === "add") {
        wallet.balance += amount;
        addTransaction({
          type: "credit",
          title: `Wallet Top-up (${method})`,
          description: note || "Funding",
          amount
        });
        saveWallet(wallet);
        renderWallet();
        closeModal();
        showToast("success", "Wallet funded (mock).");
      } else {
        if (amount > wallet.balance) {
          showToast("error", "Insufficient balance.");
          return;
        }
        wallet.balance -= amount;
        addTransaction({
          type: "debit",
          title: `Withdrawal (${method})`,
          description: note || "Withdraw",
          amount
        });
        saveWallet(wallet);
        renderWallet();
        closeModal();
        showToast("success", "Withdrawal processed (mock).");
      }
    });
  }

  // --- 4) BANK TRANSFER ---
  function openBankTransferModal() {
    const modal = openModal(`
      <h3>Bank Transfer</h3>
      <div class="modal-body">
        <div class="form-row">
          <label>Recipient Name</label>
          <input type="text" id="bankRecipient" placeholder="Account holder name" />
        </div>
        <div class="form-row">
          <label>Bank</label>
          <select id="bankName">
            <option value="">Select bank</option>
            <option>GTBank</option>
            <option>Access Bank</option>
            <option>First Bank</option>
            <option>Zenith Bank</option>
            <option>UBA</option>
          </select>
        </div>
        <div class="form-row">
          <label>Account Number</label>
          <input type="text" id="bankAccount" maxlength="10" placeholder="10-digit NUBAN" />
        </div>
        <div class="form-row">
          <label>Amount (₦)</label>
          <input type="number" id="bankAmount" min="1" />
        </div>
        <div class="form-row">
          <label>Reference</label>
          <input type="text" id="bankReference" placeholder="Rent / Bills / Gift" />
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-outline" data-close>Cancel</button>
        <button class="btn-primary" id="bankTransferConfirmBtn">Transfer</button>
      </div>
    `);

    modal.querySelector("#bankTransferConfirmBtn").addEventListener("click", () => {
      const rec = modal.querySelector("#bankRecipient").value.trim();
      const bank = modal.querySelector("#bankName").value.trim();
      const acc = modal.querySelector("#bankAccount").value.trim();
      const amt = Number(modal.querySelector("#bankAmount").value) || 0;
      const ref = modal.querySelector("#bankReference").value.trim();

      if (!rec || !bank || acc.length !== 10 || amt <= 0) {
        showToast("warning", "Fill all fields correctly.");
        return;
      }
      if (amt > wallet.balance) {
        showToast("error", "Insufficient balance.");
        return;
      }

      wallet.balance -= amt;
      addTransaction({
        type: "debit",
        title: `Bank transfer to ${rec}`,
        description: `${bank} • ${ref || "Transfer"}`,
        amount: amt
      });
      saveWallet(wallet);
      renderWallet();
      closeModal();
      showToast("success", `🏦 Transfer to ${rec} (${bank}) sent (mock).`);
    });
  }

  // --- 5) CROSS-BORDER REMITTANCE / FX ---
  function openCrossBorderModal() {
    const modal = openModal(`
      <h3>Cross-Border Remittance</h3>
      <div class="modal-body">
        <div class="form-row">
          <label>Destination Currency</label>
          <select id="fxCurrency">
            <option value="USD">USD ($)</option>
            <option value="GBP">GBP (£)</option>
            <option value="EUR">EUR (€)</option>
          </select>
        </div>
        <div class="form-row">
          <label>Amount to Send (₦)</label>
          <input type="number" id="fxAmount" min="1" />
        </div>
        <div class="form-row">
          <label>Recipient Name</label>
          <input type="text" id="fxRecipient" placeholder="Name abroad" />
        </div>
        <div class="form-row">
          <label>Reason</label>
          <input type="text" id="fxReason" placeholder="Family support, tuition..." />
        </div>
        <div class="summary">
          <div class="summary-row">
            <span>Estimated Receive</span>
            <span id="fxReceiveLabel">--</span>
          </div>
          <div class="summary-row">
            <span>Rate (approx)</span>
            <span id="fxRateLabel">--</span>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-outline" data-close>Cancel</button>
        <button class="btn-primary" id="fxConfirmBtn">Send (mock)</button>
      </div>
    `);

    const rates = {
      USD: 1600,
      GBP: 2000,
      EUR: 1750
    };

    const amtEl = modal.querySelector("#fxAmount");
    const curEl = modal.querySelector("#fxCurrency");
    const recvEl = modal.querySelector("#fxReceiveLabel");
    const rateEl = modal.querySelector("#fxRateLabel");

    const recalc = () => {
      const amt = Number(amtEl.value) || 0;
      const cur = curEl.value;
      const rate = rates[cur] || 1;
      rateEl.textContent = `₦${rate.toLocaleString()} per ${cur}`;
      if (amt > 0) {
        const foreign = amt / rate;
        recvEl.textContent = `${cur} ${foreign.toFixed(2)}`;
      } else {
        recvEl.textContent = "--";
      }
    };
    amtEl.addEventListener("input", recalc);
    curEl.addEventListener("change", recalc);

    modal.querySelector("#fxConfirmBtn").addEventListener("click", () => {
      const amt = Number(amtEl.value) || 0;
      const cur = curEl.value;
      const recName = modal.querySelector("#fxRecipient").value.trim();
      const reason = modal.querySelector("#fxReason").value.trim();

      if (amt <= 0 || !recName) {
        showToast("warning", "Enter amount and recipient name.");
        return;
      }
      if (amt > wallet.balance) {
        showToast("error", "Insufficient balance.");
        return;
      }

      wallet.balance -= amt;
      addTransaction({
        type: "debit",
        title: `FX to ${recName}`,
        description: `${cur} remittance • ${reason || "Cross-border"}`,
        amount: amt
      });
      saveWallet(wallet);
      renderWallet();
      closeModal();
      showToast("success", `🌍 FX remittance to ${recName} (mock).`);
    });
  }

  // --- 6) SAVINGS & GOALS ---
  function openSavingsModal() {
    const goalsHtml = (wallet.savingsGoals || [])
      .map(
        g => `
      <div class="goal-card">
        <div class="goal-title">${g.name}</div>
        <div class="goal-amounts">
          <span>Saved: ${formatNaira(g.saved)}</span>
          <span>Target: ${formatNaira(g.target)}</span>
        </div>
      </div>`
      )
      .join("") || "<p>No goals yet. Create your first goal.</p>";

    const modal = openModal(`
      <h3>Savings & Goals</h3>
      <div class="modal-body">
        <h4>Your goals</h4>
        <div class="goals-list">
          ${goalsHtml}
        </div>

        <hr />

        <h4>Create / Update Goal</h4>
        <div class="form-row">
          <label>Goal Name</label>
          <input type="text" id="goalName" placeholder="Rent, Car, Travel..." />
        </div>
        <div class="form-row">
          <label>Target Amount (₦)</label>
          <input type="number" id="goalTarget" min="1" />
        </div>
        <div class="form-row">
          <label>Standing Order (₦ / month)</label>
          <input type="number" id="goalStanding" min="0" />
        </div>

        <hr />

        <h4>Move Money into Goal (mock)</h4>
        <div class="form-row">
          <label>Select Goal</label>
          <select id="goalSelect">
            <option value="">Select existing goal</option>
            ${(wallet.savingsGoals || [])
              .map(g => `<option value="${g.id}">${g.name}</option>`)
              .join("")}
          </select>
        </div>
        <div class="form-row">
          <label>Amount to add (₦)</label>
          <input type="number" id="goalAddAmount" min="1" />
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-outline" data-close>Close</button>
        <button class="btn-primary" id="goalSaveBtn">Save Goal</button>
        <button class="btn-primary" id="goalAddMoneyBtn">Add to Goal</button>
      </div>
    `);

    modal.querySelector("#goalSaveBtn").addEventListener("click", () => {
      const name = modal.querySelector("#goalName").value.trim();
      const target = Number(modal.querySelector("#goalTarget").value) || 0;
      const so = Number(modal.querySelector("#goalStanding").value) || 0;

      if (!name || target <= 0) {
        showToast("warning", "Enter goal name and target.");
        return;
      }

      let existing = wallet.savingsGoals.find(g => g.name.toLowerCase() === name.toLowerCase());
      if (existing) {
        existing.target = target;
        existing.standingOrder = so;
      } else {
        wallet.savingsGoals.push({
          id: "g" + Date.now(),
          name,
          target,
          standingOrder: so,
          saved: 0
        });
      }
      saveWallet(wallet);
      closeModal();
      showToast("success", "Goal saved (mock).");
    });

    modal.querySelector("#goalAddMoneyBtn").addEventListener("click", () => {
      const goalId = modal.querySelector("#goalSelect").value;
      const amt = Number(modal.querySelector("#goalAddAmount").value) || 0;

      if (!goalId || amt <= 0) {
        showToast("warning", "Select a goal and amount.");
        return;
      }
      if (amt > wallet.balance) {
        showToast("error", "Insufficient balance.");
        return;
      }

      const g = wallet.savingsGoals.find(x => x.id === goalId);
      if (!g) {
        showToast("error", "Goal not found.");
        return;
      }

      wallet.balance -= amt;
      g.saved += amt;
      addTransaction({
        type: "debit",
        title: `Savings to ${g.name}`,
        description: "Savings goal funding",
        amount: amt
      });
      saveWallet(wallet);
      renderWallet();
      closeModal();
      showToast("success", `Added ${formatNaira(amt)} to ${g.name} (mock).`);
    });
  }

  // --- 7) PAY BILLS & TOP-UP ---
  function openPayBillsModal() {
    const modal = openModal(`
      <h3>Pay Bills & Top-Up</h3>
      <div class="modal-body">
        <div class="form-row">
          <label>Bill Type</label>
          <select id="billType">
            <option value="airtime">Airtime</option>
            <option value="data">Data</option>
            <option value="electricity">Electricity</option>
            <option value="tv">TV Subscription</option>
            <option value="bet">Bet Funding</option>
          </select>
        </div>
        <div id="billDynamic"></div>
      </div>
      <div class="modal-footer">
        <button class="btn-outline" data-close>Cancel</button>
        <button class="btn-primary" id="billPayBtn">Pay</button>
      </div>
    `);

    const billTypeEl = modal.querySelector("#billType");
    const dyn = modal.querySelector("#billDynamic");

    const renderFields = () => {
      const type = billTypeEl.value;
      if (type === "airtime") {
        dyn.innerHTML = `
          <div class="form-row">
            <label>Network</label>
            <select id="airtimeNetwork">
              <option>MTN</option>
              <option>Airtel</option>
              <option>Glo</option>
              <option>9mobile</option>
            </select>
          </div>
          <div class="form-row">
            <label>Phone Number</label>
            <input type="text" id="airtimePhone" placeholder="e.g. 08012345678" />
          </div>
          <div class="form-row">
            <label>Amount (₦)</label>
            <select id="airtimeAmount">
              <option value="500">₦500</option>
              <option value="1000">₦1,000</option>
              <option value="2000">₦2,000</option>
              <option value="5000">₦5,000</option>
            </select>
          </div>
        `;
      } else if (type === "data") {
        dyn.innerHTML = `
          <div class="form-row">
            <label>Network</label>
            <select id="dataNetwork">
              <option>MTN</option>
              <option>Airtel</option>
              <option>Glo</option>
              <option>9mobile</option>
            </select>
          </div>
          <div class="form-row">
            <label>Data Plan</label>
            <select id="dataPlan">
              <option value="1000">1.5GB - ₦1,000</option>
              <option value="2000">3.5GB - ₦2,000</option>
              <option value="3500">10GB - ₦3,500</option>
            </select>
          </div>
        `;
      } else if (type === "electricity") {
        dyn.innerHTML = `
          <div class="form-row">
            <label>Disco Provider</label>
            <select id="elecProvider">
              <option>Ikeja Electric</option>
              <option>Eko Disco</option>
              <option>Abuja Disco</option>
              <option>PH Disco</option>
            </select>
          </div>
          <div class="form-row">
            <label>Meter Number</label>
            <input type="text" id="elecMeter" placeholder="Prepaid meter number" />
          </div>
          <div class="form-row">
            <label>Amount (₦)</label>
            <input type="number" id="elecAmount" min="1000" />
          </div>
        `;
      } else if (type === "tv") {
        dyn.innerHTML = `
          <div class="form-row">
            <label>Platform</label>
            <select id="tvPlatform">
              <option>DSTV</option>
              <option>GoTV</option>
              <option>Startimes</option>
            </select>
          </div>
          <div class="form-row">
            <label>IUC / Smartcard Number</label>
            <input type="text" id="tvIuc" />
          </div>
          <div class="form-row">
            <label>Plan</label>
            <select id="tvPlan">
              <option value="3500">Basic - ₦3,500</option>
              <option value="7000">Compact - ₦7,000</option>
              <option value="15000">Premium - ₦15,000</option>
            </select>
          </div>
        `;
      } else if (type === "bet") {
        dyn.innerHTML = `
          <div class="form-row">
            <label>Betting Platform</label>
            <select id="betPlatform">
              <option>Bet9ja</option>
              <option>1xBet</option>
              <option>SportyBet</option>
            </select>
          </div>
          <div class="form-row">
            <label>Customer ID / Username</label>
            <input type="text" id="betCustomer" />
          </div>
          <div class="form-row">
            <label>Amount (₦)</label>
            <input type="number" id="betAmount" min="100" />
          </div>
        `;
      }
    };

    billTypeEl.addEventListener("change", renderFields);
    renderFields();

    modal.querySelector("#billPayBtn").addEventListener("click", () => {
      const type = billTypeEl.value;
      let label = "";
      let amount = 0;

      if (type === "airtime") {
        const net = modal.querySelector("#airtimeNetwork").value;
        const phone = modal.querySelector("#airtimePhone").value.trim();
        amount = Number(modal.querySelector("#airtimeAmount").value) || 0;
        if (!phone || amount <= 0) {
          showToast("warning", "Enter phone and amount.");
          return;
        }
        label = `Airtime • ${net} • ${phone}`;
      } else if (type === "data") {
        const net = modal.querySelector("#dataNetwork").value;
        const planAmt = Number(modal.querySelector("#dataPlan").value) || 0;
        amount = planAmt;
        if (amount <= 0) {
          showToast("warning", "Select a data plan.");
          return;
        }
        label = `Data • ${net}`;
      } else if (type === "electricity") {
        const disco = modal.querySelector("#elecProvider").value;
        const meter = modal.querySelector("#elecMeter").value.trim();
        amount = Number(modal.querySelector("#elecAmount").value) || 0;
        if (!meter || amount <= 0) {
          showToast("warning", "Enter meter and amount.");
          return;
        }
        label = `Electricity • ${disco} (${meter})`;
      } else if (type === "tv") {
        const plat = modal.querySelector("#tvPlatform").value;
        const iuc = modal.querySelector("#tvIuc").value.trim();
        amount = Number(modal.querySelector("#tvPlan").value) || 0;
        if (!iuc || amount <= 0) {
          showToast("warning", "Enter IUC and plan.");
          return;
        }
        label = `TV • ${plat} (${iuc})`;
      } else if (type === "bet") {
        const plat = modal.querySelector("#betPlatform").value;
        const cid = modal.querySelector("#betCustomer").value.trim();
        amount = Number(modal.querySelector("#betAmount").value) || 0;
        if (!cid || amount <= 0) {
          showToast("warning", "Enter betting ID and amount.");
          return;
        }
        label = `Bet Funding • ${plat} (${cid})`;
      }

      if (amount > wallet.balance) {
        showToast("error", "Insufficient balance.");
        return;
      }

      wallet.balance -= amount;
      addTransaction({
        type: "debit",
        title: label,
        description: "Bill payment / top-up",
        amount
      });
      saveWallet(wallet);
      renderWallet();
      closeModal();
      showToast("success", "Bill paid (mock).");
    });
  }

  // --- 8) VIRTUAL & LINKED CARDS ---
  function openCardsModal() {
    const defaultCard = wallet.cards.find(c => c.isDefault) || wallet.cards[0];

    const cardsHtml = wallet.cards
      .map(
        c => `
      <div class="card-row" data-card-id="${c.id}">
        <div>
          <div class="card-title">${c.label}</div>
          <div class="card-meta">${c.network} • • • • ${c.last4}</div>
        </div>
        <div class="card-actions">
          <button class="btn-mini set-default-btn">${c.isDefault ? "Default" : "Make default"}</button>
          <button class="btn-mini freeze-btn">${c.isFrozen ? "Unfreeze" : "Freeze"}</button>
        </div>
      </div>`
      )
      .join("");

    const modal = openModal(`
      <h3>Virtual & Linked Cards</h3>
      <div class="modal-body">
        <div class="primary-card">
          <div class="card-label">Primary card</div>
          <div class="card-main">
            <div>${defaultCard.label}</div>
            <div>${defaultCard.network} •••• ${defaultCard.last4}</div>
            <div>${defaultCard.isFrozen ? "Status: Frozen" : "Status: Active"}</div>
          </div>
        </div>

        <hr />

        <h4>All cards</h4>
        <div class="cards-list">
          ${cardsHtml}
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-outline" data-close>Close</button>
      </div>
    `);

    modal.querySelectorAll(".card-row").forEach(row => {
      const cardId = row.getAttribute("data-card-id");
      const setDefaultBtn = row.querySelector(".set-default-btn");
      const freezeBtn = row.querySelector(".freeze-btn");

      setDefaultBtn.addEventListener("click", () => {
        wallet.cards.forEach(c => (c.isDefault = c.id === cardId));
        saveWallet(wallet);
        closeModal();
        openCardsModal();
        showToast("success", "Default card updated.");
      });

      freezeBtn.addEventListener("click", () => {
        const card = wallet.cards.find(c => c.id === cardId);
        if (!card) return;
        card.isFrozen = !card.isFrozen;
        saveWallet(wallet);
        closeModal();
        openCardsModal();
        showToast("info", `Card ${card.isFrozen ? "frozen" : "unfrozen"} (mock).`);
      });
    });
  }

  // --- 9) PAY ONLINE (SMART CHECKOUT) ---
  function openPayOnlineModal() {
    const cartTotal = 6500; // mock
    const modal = openModal(`
      <h3>PAY54 Smart Checkout</h3>
      <div class="modal-body">
        <p>Mock cart summary:</p>
        <ul class="simple-list">
          <li>1x Sneakers — ₦4,000</li>
          <li>1x Hoodie — ₦2,500</li>
        </ul>
        <div class="summary-row">
          <span>Total</span>
          <span>${formatNaira(cartTotal)}</span>
        </div>
        <p style="font-size:0.8rem;margin-top:0.5rem;">On live PAY54, this screen appears when user chooses "Pay with PAY54" on partner websites.</p>
      </div>
      <div class="modal-footer">
        <button class="btn-outline" data-close>Cancel</button>
        <button class="btn-primary" id="checkoutPayBtn">Pay with PAY54</button>
      </div>
    `);

    modal.querySelector("#checkoutPayBtn").addEventListener("click", () => {
      if (cartTotal > wallet.balance) {
        showToast("error", "Insufficient balance.");
        return;
      }
      wallet.balance -= cartTotal;
      addTransaction({
        type: "debit",
        title: "Online Checkout",
        description: "PAY54 Smart Checkout",
        amount: cartTotal
      });
      saveWallet(wallet);
      renderWallet();
      closeModal();
      showToast("success", "🛒 Online payment completed (mock).");
    });
  }

  // --- 10) SHOP ON THE FLY ---
  function openShopFlyModal() {
    const products = [
      { id: "p1", name: "Uber Ride Credit", price: 2500 },
      { id: "p2", name: "KFC Bucket Voucher", price: 4000 },
      { id: "p3", name: "Cinema Ticket", price: 3500 },
      { id: "p4", name: "ASOS Gift Card", price: 10000 }
    ];

    const itemsHtml = products
      .map(
        p => `
      <div class="shop-item" data-id="${p.id}">
        <div class="shop-name">${p.name}</div>
        <div class="shop-price">${formatNaira(p.price)}</div>
        <button class="btn-mini shop-buy-btn">Buy</button>
      </div>`
      )
      .join("");

    const modal = openModal(`
      <h3>Shop on the Fly</h3>
      <div class="modal-body">
        <p>Mock in-app store. In live PAY54 this deep-links into Taxi, Food, Tickets & Shops with affiliate rails.</p>
        <div class="shop-list">
          ${itemsHtml}
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-outline" data-close>Close</button>
      </div>
    `);

    modal.querySelectorAll(".shop-item").forEach(item => {
      const id = item.getAttribute("data-id");
      const btn = item.querySelector(".shop-buy-btn");
      const p = products.find(x => x.id === id);
      if (!p) return;

      btn.addEventListener("click", () => {
        if (p.price > wallet.balance) {
          showToast("error", "Insufficient balance.");
          return;
        }
        wallet.balance -= p.price;
        addTransaction({
          type: "debit",
          title: `Shop on the Fly • ${p.name}`,
          description: "Affiliate mock purchase",
          amount: p.price
        });
        saveWallet(wallet);
        renderWallet();
        showToast("success", `Purchased ${p.name} (mock).`);
      });
    });
  }

  // --- 11) INVESTMENTS & STOCKS ---
  function openInvestModal() {
    const market = [
      { symbol: "AAPL", name: "Apple", priceUsd: 190.23 },
      { symbol: "TSLA", name: "Tesla", priceUsd: 210.77 },
      { symbol: "MTNN", name: "MTN Nigeria", priceUsd: 12.5 }
    ];

    const positions = wallet.portfolio || [];
    const posHtml =
      positions.length === 0
        ? "<p>No holdings yet.</p>"
        : positions
            .map(
              p => `
      <div class="position-row">
        <div>${p.symbol} • ${p.units} units</div>
        <div>Est. value ~ $${(p.units * p.priceUsd).toFixed(2)}</div>
      </div>`
            )
            .join("");

    const marketHtml = market
      .map(
        m => `
      <div class="market-row" data-symbol="${m.symbol}">
        <div>
          <div class="market-title">${m.symbol} • ${m.name}</div>
          <div class="market-meta">Price: $${m.priceUsd.toFixed(2)}</div>
        </div>
        <button class="btn-mini market-buy-btn">Buy</button>
      </div>`
      )
      .join("");

    const modal = openModal(`
      <h3>Investments & Stocks</h3>
      <div class="modal-body">
        <h4>Your portfolio</h4>
        <div class="portfolio-block">
          ${posHtml}
        </div>

        <hr />

        <h4>Market (mock)</h4>
        <div class="market-list">
          ${marketHtml}
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-outline" data-close>Close</button>
      </div>
    `);

    modal.querySelectorAll(".market-row").forEach(row => {
      const sym = row.getAttribute("data-symbol");
      const asset = market.find(m => m.symbol === sym);
      const btn = row.querySelector(".market-buy-btn");
      btn.addEventListener("click", () => openInvestBuyModal(asset));
    });
  }

  function openInvestBuyModal(asset) {
    if (!asset) return;

    const modal = openModal(`
      <h3>Buy ${asset.symbol}</h3>
      <div class="modal-body">
        <div class="form-row">
          <label>Units</label>
          <input type="number" id="invUnits" min="1" value="1" />
        </div>
        <div class="form-row">
          <label>Pay in</label>
          <select id="invCurrency">
            <option value="USD">USD</option>
            <option value="NGN">NGN</option>
          </select>
        </div>
        <div class="summary">
          <div class="summary-row">
            <span>Unit price (USD)</span>
            <span>$${asset.priceUsd.toFixed(2)}</span>
          </div>
          <div class="summary-row">
            <span>Total (approx)</span>
            <span id="invTotalLabel">$0.00</span>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-outline" data-close>Cancel</button>
        <button class="btn-primary" id="invConfirmBtn">Confirm</button>
      </div>
    `);

    const unitsEl = modal.querySelector("#invUnits");
    const curEl = modal.querySelector("#invCurrency");
    const totalEl = modal.querySelector("#invTotalLabel");
    const fxRate = 1600; // NGN per USD

    const recalc = () => {
      const units = Number(unitsEl.value) || 0;
      const cur = curEl.value;
      const base = units * asset.priceUsd;
      if (cur === "USD") {
        totalEl.textContent = `$${base.toFixed(2)}`;
      } else {
        totalEl.textContent = formatNaira(base * fxRate);
      }
    };
    unitsEl.addEventListener("input", recalc);
    curEl.addEventListener("change", recalc);
    recalc();

    modal.querySelector("#invConfirmBtn").addEventListener("click", () => {
      const units = Number(unitsEl.value) || 0;
      const cur = curEl.value;
      if (units <= 0) {
        showToast("warning", "Enter units.");
        return;
      }

      const costUsd = units * asset.priceUsd;
      const costNgn = costUsd * fxRate;
      const debitAmt = cur === "USD" ? costNgn : costNgn; // Still NGN for wallet debit

      if (debitAmt > wallet.balance) {
        showToast("error", "Insufficient balance.");
        return;
      }

      wallet.balance -= debitAmt;
      const existing = (wallet.portfolio || []).find(p => p.symbol === asset.symbol);
      if (existing) {
        existing.units += units;
      } else {
        wallet.portfolio.push({
          symbol: asset.symbol,
          units,
          priceUsd: asset.priceUsd
        });
      }

      addTransaction({
        type: "debit",
        title: `Buy ${asset.symbol}`,
        description: `Investment purchase (${cur})`,
        amount: debitAmt
      });
      saveWallet(wallet);
      renderWallet();
      closeModal();
      showToast("success", `Bought ${units} x ${asset.symbol} (mock).`);
    });
  }

  // --- 12) BECOME AN AGENT ---
  function openAgentModal() {
    const modal = openModal(`
      <h3>Become a PAY54 Agent</h3>
      <div class="modal-body">
        <div class="form-row">
          <label>Full Name</label>
          <input type="text" id="agentName" />
        </div>
        <div class="form-row">
          <label>Business Name</label>
          <input type="text" id="agentBusiness" />
        </div>
        <div class="form-row">
          <label>NIN (11 digits)</label>
          <input type="text" id="agentNin" maxlength="11" />
        </div>
        <div class="form-row">
          <label>Capture Selfie (KYC)</label>
          <input type="file" id="agentSelfie" accept="image/*" capture="user" />
          <p style="font-size:0.8rem;margin-top:0.3rem;">On mobile, tap to open camera and take a selfie.</p>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-outline" data-close>Cancel</button>
        <button class="btn-primary" id="agentSubmitBtn">Submit</button>
      </div>
    `);

    modal.querySelector("#agentSubmitBtn").addEventListener("click", () => {
      const name = modal.querySelector("#agentName").value.trim();
      const biz = modal.querySelector("#agentBusiness").value.trim();
      const nin = modal.querySelector("#agentNin").value.trim();

      if (!name || !biz || nin.length !== 11) {
        showToast("warning", "Fill all fields correctly.");
        return;
      }

      wallet.notifications.unshift({
        id: "n" + Date.now(),
        type: "agent",
        text: `Agent application submitted by ${name} (${biz})`
      });
      saveWallet(wallet);
      closeModal();
      showToast("success", "Agent application submitted (mock).");
    });
  }

  // --- 13) PROFILE MODAL ---
  function openProfileModal() {
    const modal = openModal(`
      <h3>Profile</h3>
      <div class="modal-body">
        <p><strong>Name:</strong> ${wallet.ownerName}</p>
        <p><strong>Wallet ID:</strong> ${wallet.walletId}</p>
        <p><strong>Currency:</strong> NGN</p>
        <p><strong>Balance:</strong> ${formatNaira(wallet.balance)}</p>
      </div>
      <div class="modal-footer">
        <button class="btn-outline" data-close>Close</button>
      </div>
    `);
  }
});
