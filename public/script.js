// Modal: Open Order Form
function openOrderForm() {
  fetch("/auth/check")
    .then((res) => res.json())
    .then((data) => {
      if (!data.loggedIn) {
        openAuthModal();
      } else {
        document.getElementById("orderModal").style.display = "block";
      }
    });
}

function closeOrderForm() {
  document.getElementById("orderModal").style.display = "none";
}

// Close modal when clicking outside
window.onclick = function (event) {
  const orderModal = document.getElementById("orderModal");
  const authModal = document.getElementById("authModal");
  if (event.target === orderModal) orderModal.style.display = "none";
  if (event.target === authModal) authModal.style.display = "none";
};

// Order submission
const burgerForm = document.getElementById("burgerForm");
burgerForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const order = {
    full_name: document.querySelector('input[name="full_name"]').value.trim(),
    email: document.querySelector('input[name="email"]').value.trim(),
    burger_type: document.querySelector('select[name="burger_type"]').value,
    quantity: parseInt(document.querySelector('input[name="quantity"]').value, 10) || 0,
    address: document.querySelector('textarea[name="address"]').value.trim(),
    phone_number: document.querySelector('input[name="phone_number"]').value.trim(),
    message: document.querySelector('textarea[name="message"]').value.trim() || ""
  };

  try {
    const res = await fetch("/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order)
    });
    const result = await res.json();
    alert(result.message || "Order placed!");
    burgerForm.reset();
    closeOrderForm();
  } catch (err) {
    alert("Error placing order!");
  }
});

// Auth modal logic
let isSignUp = false;
const authTitle = document.getElementById('authTitle');
const nameField = document.getElementById('nameField');
const toggleText = document.getElementById('toggleText');
const toggleLink = document.getElementById('toggleLink');

window.openAuthModal = function () {
  document.getElementById('authModal').style.display = 'block';
  document.body.style.overflow = 'hidden';
};

window.closeAuthModal = function () {
  document.getElementById('authModal').style.display = 'none';
  document.body.style.overflow = '';
};

window.toggleAuthMode = function () {
  isSignUp = !isSignUp;
  authTitle.textContent = isSignUp ? 'Sign Up' : 'Sign In';
  nameField.style.display = isSignUp ? 'block' : 'none';
  toggleText.textContent = isSignUp ? 'Already have an account?' : "Don't have an account?";
  toggleLink.textContent = isSignUp ? 'Sign In' : 'Sign Up';
};

// Auth form submit
const authForm = document.getElementById("authForm");
authForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const email = document.querySelector('input[type="email"]').value.trim();
  const password = document.querySelector('input[type="password"]').value.trim();
  const name = document.getElementById('nameField').value.trim();

  if (!email || !password || (isSignUp && !name)) {
    alert("Please fill in all required fields.");
    return;
  }

  const endpoint = isSignUp ? "/signup" : "/login";
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
      credentials: "include"
    });
    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "An error occurred.");
      return;
    }

    alert(data.message || (isSignUp ? "Sign Up successful!" : "Login successful!"));
    closeAuthModal();
    checkSession();
  } catch (error) {
    alert("Auth failed. Try again.");
  }
});

// Session-based navbar update
function updateNavbarSession(user, isAdmin = false) {
  const authSection = document.getElementById("authSection");
  const userSection = document.getElementById("userSection");
  const userNameDisplay = document.getElementById("userNameDisplay");
  const orderBurgerBtn = document.getElementById("orderBurgerBtn");
  const adminLink = document.getElementById("admin-link");

  if (user) {
    authSection.classList.add("d-none");
    userSection.classList.remove("d-none");
    userNameDisplay.textContent = user.name;

    if (orderBurgerBtn) orderBurgerBtn.style.display = "inline-block";
    if (adminLink) adminLink.style.display = isAdmin ? "inline-block" : "none";
  } else {
    authSection.classList.remove("d-none");
    userSection.classList.add("d-none");
    userNameDisplay.textContent = "";
    if (orderBurgerBtn) orderBurgerBtn.style.display = "none";
    if (adminLink) adminLink.style.display = "none";
  }
}

function checkSession() {
  fetch("/auth/check", { credentials: "include" })
    .then((res) => res.json())
    .then((data) => {
      updateNavbarSession(
        data.loggedIn ? data.user : null,
        data.isAdmin || false
      );
    });
}

function logoutUser() {
  fetch("/logout", {
    method: "POST",
    credentials: "include"
  }).then(() => {
    alert("You've been logged out.");
    updateNavbarSession(null);
  });
}

// Hamburger toggle
document.addEventListener("DOMContentLoaded", function () {
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const navWrapper = document.getElementById("navWrapper");
  hamburgerBtn.addEventListener("click", () => {
    navWrapper.classList.toggle("active");
  });
  checkSession();
});
