// PAY54 v6.6 — SESSION GUARD

(function () {
  const user = JSON.parse(localStorage.getItem("pay54_user"));
  const session = JSON.parse(localStorage.getItem("pay54_session"));

  const path = window.location.pathname;

  const isDashboard = path.endsWith("dashboard.html");
  const isLogin = path.endsWith("login.html");
  const isSignup = path.endsWith("signup.html");

  // BLOCK DASHBOARD IF NOT LOGGED IN
  if (isDashboard) {
    if (!session || !session.active || !user) {
      window.location.href = "login.html";
    }
  }
})();
