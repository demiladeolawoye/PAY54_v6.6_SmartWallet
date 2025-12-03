document.getElementById("signupForm").addEventListener("submit", function(e){
    e.preventDefault();

    const name = signupName.value.trim();
    const id = signupIdentifier.value.trim();
    const pin = signupPin.value.trim();
    const pin2 = signupPinConfirm.value.trim();

    if (pin !== pin2) {
        alert("PINs do not match");
        return;
    }

    const user = {
        name,
        identifier: id,
        pin
    };

    localStorage.setItem("pay54_user", JSON.stringify(user));

    alert("Account created! Redirecting...");
    window.location.href = "login.html";
});
