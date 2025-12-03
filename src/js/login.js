document.getElementById("loginForm").addEventListener("submit", function(e){
    e.preventDefault();

    const id = loginIdentifier.value.trim();
    const pin = loginPin.value.trim();

    const user = JSON.parse(localStorage.getItem("pay54_user"));

    if (!user) {
        alert("No PAY54 account found. Please sign up.");
        window.location.href = "signup.html";
        return;
    }

    if (user.identifier === id && user.pin === pin) {
        window.location.href = "dashboard.html";
    } else {
        alert("Incorrect login details");
    }
});
