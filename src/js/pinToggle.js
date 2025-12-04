// src/js/pinToggle.js
// Generic handler for all .pin-eye buttons

document.addEventListener("click", function (e) {
  const btn = e.target.closest(".pin-eye");
  if (!btn) return;

  const targetId = btn.getAttribute("data-target");
  if (!targetId) return;

  const input = document.getElementById(targetId);
  if (!input) return;

  if (input.type === "password") {
    input.type = "text";
    btn.textContent = "🙈";
  } else {
    input.type = "password";
    btn.textContent = "👁";
  }
});
