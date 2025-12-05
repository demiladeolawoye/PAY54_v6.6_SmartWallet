<!DOCTYPE html>
<html lang="en">
<head>
  <!-- PAY54 v6.6 AUTH PAGE -->
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <!-- Safe Browsing Metadata -->
  <meta name="safe-browsing" content="demo-financial-app">
  <meta name="google-safe" content="simulation-demo">
  <meta name="application-type" content="wallet-demo">
  <meta name="robots" content="noindex,nofollow">

  <!-- Google Verification -->
  <meta name="google-site-verification" content="WwBFwlXwiHoiWkOd_PV3F0V2S32NCbf3vBuq9SOzM9A" />

  <title>Create PAY54 Account</title>

  <link rel="stylesheet" href="src/css/global.css" />
  <link rel="stylesheet" href="src/css/auth.css" />
</head>

<body class="auth-shell">

  <!-- Header -->
  <header class="auth-header">
    <img src="assets/logo-pay54-full.png" alt="PAY54 Logo" class="auth-logo" />
  </header>

  <main class="auth-main">
    <!-- SIGNUP CARD -->
    <div class="auth-card">
      <h1 class="auth-heading">Create your PAY54 account</h1>
      <p class="auth-subheading">Sign up to send, save, shop & invest globally.</p>

      <form id="signupForm" class="auth-form">

        <div class="form-row">
          <label>Full Name</label>
          <input type="text" id="fullName" placeholder="Your full name" required />
        </div>

        <div class="form-row">
          <label>Email or phone</label>
          <input type="text" id="identifier" placeholder="you@pay54.com or +234.." required />
        </div>

        <div class="form-row pin-wrapper">
          <label>Create 4-digit PIN</label>
          <input type="password" id="pin" maxlength="4" required />
          <span class="pin-eye" data-target="pin">👁</span>
        </div>

        <div class="form-row pin-wrapper">
          <label>Confirm PIN</label>
          <input type="password" id="pinConfirm" maxlength="4" required />
          <span class="pin-eye" data-target="pinConfirm">👁</span>
        </div>

        <button type="submit" class="auth-btn">Create PAY54 Account</button>

        <p class="auth-footnote">Already on PAY54? <a href="login.html">Login</a></p>
      </form>
    </div>
  </main>

  <script src="src/js/pinToggle.js"></script>
  <script src="src/js/signup.js"></script>
</body>
</html>
