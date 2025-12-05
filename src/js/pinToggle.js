// Eye icon toggle for PIN fields

document.querySelectorAll(".pin-eye").forEach(eye => {
  eye.addEventListener("click", () => {
    const target = document.getElementById(eye.dataset.target);
    target.type = target.type === "password" ? "text" : "password";
  });
});
