// PAY54 v6.6 — SIGNUP HANDLER

document.getElementById("signupForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("fullName").value.trim();
  const id = document.getElementById("identifier").value.trim();
  const pin = document.getElementById("pin").value.trim();
  const pin2 = document.getElementById("pinConfirm").value.trim();

  if (pin !== pin2) {
    alert("PINs do not match");
    return;
  }

  const user = {
    name,
    id,
    pin,
    walletId: "P54-" + Math.floor(Math.random() * 90000 + 10000),
    balance: 12500,
    created: Date.now()
  };

  localStorage.setItem("pay54_user", JSON.stringify(user));
  localStorage.setItem("pay54_session", JSON.stringify({ active: true, ts: Date.now() }));

  alert("Account created successfully!");
  window.location.href = "dashboard.html";
});
