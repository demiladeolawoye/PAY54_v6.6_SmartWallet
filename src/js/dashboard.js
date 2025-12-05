/* -------------------------------------------------------
   PAY54 v6.6 — Dashboard Logic
   Smart Wallet Demo (no real money processed)
-------------------------------------------------------- */

// LocalStorage Keys
const KEY_BALANCE = "pay54_balance";
const KEY_TX = "pay54_transactions";
const KEY_USER = "pay54_user";
const KEY_SESSION = "pay54_session";
const KEY_REQUESTS = "pay54_requests";

// Helpers
const $ = (id) => document.getElementById(id);
const modal = $("modalOverlay");
const modalTitle = $("modalTitle");
const modalBody = $("modalBody");
const modalFooter = $("modalFooter");
const toast = $("toast");

// -----------------------------------------------
// INITIAL SETUP
// -----------------------------------------------

// Load user
let user = JSON.parse(localStorage.getItem(KEY_USER)) || { fullName: "User", id: "user@example.com" };

// Load balance
let balance = Number(localStorage.getItem(KEY_BALANCE)) || 12500;

// Load Transactions
let transactions = JSON.parse(localStorage.getItem(KEY_TX)) || [];

// Load money requests
let requests = JSON.parse(localStorage.getItem(KEY_REQUESTS)) || [];

// Update UI header
$("welcomeTitle").textContent = `Welcome back, ${user.fullName.split(" ")[0]} 👋`;
$("userNameChip").textContent = user.fullName.split(" ")[0][0].toUpperCase() + user.fullName.split(" ")[0].slice(1);
$("userAvatarCircle").textContent = user.fullName[0].toUpperCase();

// Write balance
function updateBalanceUI() {
    $("walletBalance").textContent = `₦${balance.toLocaleString()}.00`;
    localStorage.setItem(KEY_BALANCE, balance);
}
updateBalanceUI();

// Write transactions list
function renderTransactions() {
    const txList = $("txList");
    txList.innerHTML = "";

    if (transactions.length === 0) {
        txList.innerHTML = `<p class="muted">No transactions yet.</p>`;
        return;
    }

    transactions.slice(-10).reverse().forEach(tx => {
        const row = document.createElement("div");
        row.className = "tx-row";
        row.innerHTML = `
            <div>
                <p class="tx-title">${tx.title}</p>
                <p class="tx-date">${tx.time}</p>
            </div>
            <div class="tx-amount ${tx.type}">
                ${tx.type === "debit" ? "-" : "+"}₦${tx.amount.toLocaleString()}
            </div>
        `;
        txList.appendChild(row);
    });
}
renderTransactions();

// Save transaction
function addTransaction(title, amount, type = "debit") {
    const tx = {
        title,
        amount,
        type,
        time: new Date().toLocaleString()
    };
    transactions.push(tx);
    localStorage.setItem(KEY_TX, JSON.stringify(transactions));
    renderTransactions();
}

// Toast
function showToast(msg) {
    toast.textContent = msg;
    toast.classList.remove("hidden");
    setTimeout(() => toast.classList.add("hidden"), 2500);
}

// Modal
function openModal(title, bodyHTML, footerHTML = "") {
    modalTitle.textContent = title;
    modalBody.innerHTML = bodyHTML;
    modalFooter.innerHTML = footerHTML;
    modal.classList.remove("hidden");
}
function closeModal() {
    modal.classList.add("hidden");
}
$("modalCloseBtn").onclick = closeModal;


// -----------------------------------------------
// MONEY MOVES
// -----------------------------------------------

// SEND MONEY
$("mmSend").onclick = () => {
    openModal(
        "Send Money 💸",
        `
        <label>Recipient (Paytag, Email, Phone)</label>
        <input id="send_rec" type="text" />

        <label>Amount (₦)</label>
        <input id="send_amt" type="number" />
        
        <label>Note (optional)</label>
        <input id="send_note" type="text" />
        `,
        `
        <button class="btn-primary" id="confirmSend">Send</button>
        <button class="btn-ghost" onclick="closeModal()">Cancel</button>
        `
    );

    $("confirmSend").onclick = () => {
        const r = $("send_rec").value.trim();
        const a = Number($("send_amt").value);
        if (!r || !a) return showToast("Enter valid details");

        if (a > balance) return showToast("Insufficient balance");

        balance -= a;
        addTransaction(`Transfer to ${r}`, a, "debit");
        updateBalanceUI();

        closeModal();
        showToast(`💸 Sent ₦${a.toLocaleString()} to ${r}`);
    };
};


// RECEIVE MONEY
$("mmReceive").onclick = () => {
    openModal(
        "Receive Money 📥",
        `
        <p>Your Wallet ID:</p>
        <div class="copy-box">
            <input id="rcv_wallet" value="${user.id}" readonly />
            <button onclick="navigator.clipboard.writeText('${user.id}')">Copy</button>
        </div>
        <img src="assets/qr-placeholder.png" class="qr-img" />
        `,
        `<button class="btn-ghost" onclick="closeModal()">Close</button>`
    );
};


// ADD / WITHDRAW
$("mmAddWithdraw").onclick = () => {
    openModal(
        "Add / Withdraw",
        `
        <label>Action</label>
        <select id="aw_action">
            <option value="add">Add Money</option>
            <option value="withdraw">Withdraw</option>
        </select>

        <label>Amount (₦)</label>
        <input id="aw_amount" type="number" />

        <label>Source</label>
        <select id="aw_src">
            <option>Bank</option>
            <option>Card</option>
            <option>Agent</option>
        </select>
        `,
        `<button class="btn-primary" id="awConfirm">Confirm</button>`
    );

    $("awConfirm").onclick = () => {
        const act = $("aw_action").value;
        const amt = Number($("aw_amount").value);

        if (!amt || amt <= 0) return showToast("Invalid amount");

        if (act === "add") {
            balance += amt;
            addTransaction(`Wallet Top-up (${ $("aw_src").value })`, amt, "credit");
            showToast("Money added successfully");
        } else {
            if (amt > balance) return showToast("Insufficient balance");
            balance -= amt;
            addTransaction(`Withdrawal (${ $("aw_src").value })`, amt, "debit");
            showToast("Withdrawal complete");
        }

        updateBalanceUI();
        closeModal();
    };
};


// BANK TRANSFER
$("mmBankTransfer").onclick = () => {
    openModal(
        "Bank Transfer 🏦",
        `
        <label>Select Bank</label>
        <select id="bank_list">
            <option>GTBank</option>
            <option>First Bank</option>
            <option>Access Bank</option>
        </select>
        `,
        `<button class="btn-primary" onclick="showToast('🏦 Bank linked successfully (mock)'); closeModal()">Link</button>`
    );
};


// REQUEST MONEY
$("mmRequest").onclick = () => {
    openModal(
        "Request Money 📨",
        `
        <label>Amount (₦)</label>
        <input id="req_amt" type="number" />

        <label>Message</label>
        <input id="req_msg" type="text" />
        `,
        `<button class="btn-primary" id="reqConfirm">Send Request</button>`
    );

    $("reqConfirm").onclick = () => {
        const amt = Number($("req_amt").value);
        const msg = $("req_msg").value;

        requests.push({ amt, msg, time: new Date().toLocaleString() });
        localStorage.setItem(KEY_REQUESTS, JSON.stringify(requests));

        closeModal();
        renderRequests();
        showToast("📨 Request sent");
    };
};

// Render notification requests
function renderRequests() {
    const box = $("requestsList");
    box.innerHTML = "";

    if (requests.length === 0) {
        box.innerHTML = `<p class="muted small">No active requests.</p>`;
        return;
    }

    requests.forEach((req, i) => {
        const div = document.createElement("div");
        div.className = "req-row";
        div.innerHTML = `
            <div>
              <p>Request: ₦${req.amt.toLocaleString()}</p>
              <p class="small">${req.msg}</p>
            </div>
            <button class="chip chip-green" onclick="markPaid(${i})">Mark Paid</button>
        `;
        box.appendChild(div);
    });
}
renderRequests();

function markPaid(i) {
    balance -= requests[i].amt;
    addTransaction("Paid Request", requests[i].amt, "debit");
    requests.splice(i, 1);
    localStorage.setItem(KEY_REQUESTS, JSON.stringify(requests));
    updateBalanceUI();
    renderRequests();
    showToast("Request marked paid");
}


// FX EXCHANGE
$("mmFX").onclick = () => {
    openModal(
        "Currency Exchange 💱",
        `
        <label>Amount (₦)</label>
        <input id="fx_amt" type="number" />

        <label>Convert to</label>
        <select id="fx_to">
            <option value="USD">USD</option>
            <option value="GBP">GBP</option>
        </select>
        `,
        `<button class="btn-primary" id="fxDo">Convert</button>`
    );

    $("fxDo").onclick = () => {
        const amt = Number($("fx_amt").value);
        const to = $("fx_to").value;

        if (amt > balance) return showToast("Insufficient balance");

        const rate = to === "USD" ? 0.00068 : 0.00052;
        const result = (amt * rate).toFixed(2);

        balance -= amt;
        updateBalanceUI();
        addTransaction(`FX NGN→${to}`, amt, "debit");

        closeModal();
        showToast(`Converted ₦${amt.toLocaleString()} → ${to} ${result}`);
    };
};


// -----------------------------------------------
// SERVICES
// -----------------------------------------------

// CROSS BORDER
$("svcCrossBorder").onclick = () => {
    openModal(
        "Cross-Border Remittance 🌍",
        `
        <label>You Send (₦)</label>
        <input id="cb_amt" type="number"/>

        <label>Receiving Country</label>
        <select id="cb_country">
            <option value="UK">🇬🇧 United Kingdom</option>
            <option value="US">🇺🇸 United States</option>
            <option value="CA">🇨🇦 Canada</option>
        </select>
        `,
        `<button class="btn-primary" id="cbSend">Send</button>`
    );

    $("cbSend").onclick = () => {
        const amt = Number($("cb_amt").value);
        if (amt > balance) return showToast("Insufficient balance");

        balance -= amt;
        updateBalanceUI();
        addTransaction("Cross-Border Remittance", amt, "debit");

        closeModal();
        showToast("🌍 FX transfer sent (demo)");
    };
};


// SAVINGS
$("svcSavings").onclick = () => {
    openModal(
        "Savings & Goals 💰",
        `<p>Mock savings pots will display here.</p>`,
        `<button class="btn-primary">Add Goal</button>`
    );
};


// BILLS
$("svcBills").onclick = () => {
    openModal(
        "Pay Bills & Top-Up 💡",
        `
        <label>Service</label>
        <select id="bill_type">
            <option>Airtime</option>
            <option>Data</option>
            <option>Electricity</option>
            <option>TV Subscription</option>
        </select>

        <label>Amount (₦)</label>
        <input id="bill_amt" type="number"/>
        `,
        `<button class="btn-primary" id="billPay">Pay</button>`
    );

    $("billPay").onclick = () => {
        const amt = Number($("bill_amt").value);
        const type = $("bill_type").value;

        if (amt > balance) return showToast("Insufficient balance");

        balance -= amt;
        updateBalanceUI();
        addTransaction(`${type} Payment`, amt, "debit");

        closeModal();
        showToast("Bill paid (demo)");
    };
};


// CARDS
$("svcCards").onclick = () => {
    openModal(
        "Cards 💳",
        `
        <div class="card-preview">
            <p>VISA •••• 4421</p>
            <p>12/28</p>
        </div>
        `,
        `<button class="btn-primary" onclick="showToast('Card set as default (mock)')">Set Default</button>`
    );
};


// PAY ONLINE
$("svcPayOnline").onclick = () => {
    openModal(
        "PAY54 Smart Checkout 🛒",
        `<p>Cart total: ₦7,200 (demo)</p>`,
        `<button class="btn-primary">Approve Payment</button>`
    );
};


// SHOP ON THE FLY
$("svcShop").onclick = () => {
    showToast("Redirecting… (demo)");
    window.open("https://ebay.com", "_blank");
};


// INVESTMENTS
$("svcInvest").onclick = () => {
    openModal(
        "Investments & Stocks 📈",
        `
        <p>Mock Portfolio</p>
        <ul>
          <li>AAPL +1.2%</li>
          <li>TSLA -0.5%</li>
          <li>AMZN +0.9%</li>
        </ul>
        `,
        `<button class="btn-primary">Buy (demo)</button>`
    );
};


// AGENT
$("svcAgent").onclick = () => {
    openModal(
        "Become an Agent 🧍‍♂️",
        `
        <label>NIN</label>
        <input type="text"/>

        <label>Business Name</label>
        <input type="text"/>

        <label>Upload Selfie (demo)</label>
        <input type="file"/>
        `,
        `<button class="btn-primary" onclick="showToast('Application submitted (demo)')">Submit</button>`
    );
};


// BET FUNDING
$("svcBet").onclick = () => {
    openModal(
        "Bet Funding 🎯",
        `
        <label>Select Platform</label>
        <select id="bet_plat">
            <option>Bet9ja</option>
            <option>1xBET</option>
            <option>SportyBet</option>
        </select>

        <label>Customer ID</label>
        <input id="bet_id" type="text"/>

        <label>Amount (₦)</label>
        <input id="bet_amt" type="number"/>
        `,
        `<button class="btn-primary" id="betPay">Fund</button>`
    );

    $("betPay").onclick = () => {
        const amt = Number($("bet_amt").value);
        if (amt > balance) return showToast("Insufficient balance");

        balance -= amt;
        updateBalanceUI();
        addTransaction("Bet Funding", amt, "debit");

        closeModal();
        showToast("Bet account funded (demo)");
    };
};


// AI RISK WATCH
$("svcAI").onclick = () => {
    openModal(
        "AI Risk Watch 🤖",
        `<p>All activity normal • No risk detected.</p>`,
        `<button class="btn-ghost" onclick="closeModal()">Close</button>`
    );
};


// -----------------------------------------------
// QUICK SHORTCUTS
// -----------------------------------------------
$("qsAirtime").onclick = () => $("svcBills").click();
$("qsData").onclick = () => $("svcBills").click();
$("qsFX").onclick = () => $("mmFX").click();
$("qsCardControls").onclick = () => $("svcCards").click();


// -----------------------------------------------
// PROFILE MENU
// -----------------------------------------------
$("menuLogout").onclick = () => {
    localStorage.removeItem(KEY_SESSION);
    showToast("Logging out…");
    setTimeout(() => window.location.href = "login.html", 800);
};


// -----------------------------------------------
// REFRESH BALANCE
// -----------------------------------------------
$("btnRefreshBalance").onclick = () => {
    showToast("Syncing balance… (demo)");
    setTimeout(() => updateBalanceUI(), 1000);
};
