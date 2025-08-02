// Open the modal
function openOrderForm() {
    isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    if(!isLoggedIn){
      openAuthModal();
      return;
    }
    document.getElementById("orderModal").style.display = "block";
  }

  // Close the modal
  function closeOrderForm() {
    document.getElementById("orderModal").style.display = "none";
  }

  // Close when clicking outside the modal-content
  window.onclick = function(event) {
    const modal = document.getElementById("orderModal");
    const modalContent = document.querySelector(".modal-dialog");
    
    if (event.target === modal) {
      modal.style.display = "none";
    }
  };
  document.getElementById("burgerForm").addEventListener("submit", function (e) {
    e.preventDefault();
    alert("Thank you! Your burger is on the way");
    closeOrderForm();
  });

  //database
  document.getElementById("burgerForm").addEventListener("submit", async function (e) {
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
    } catch (err) {
        alert("Error placing order!");
    }
    this.reset();
});





// Login form

document.addEventListener("DOMContentLoaded", function () {
  const authModal = document.getElementById('authModal');
  const authTitle = document.getElementById('authTitle');
  const nameField = document.getElementById('nameField');
  const toggleText = document.getElementById('toggleText');
  const toggleLink = document.getElementById('toggleLink');
  let isSignUp = false;

  // Open auth modal
  window.openAuthModal = function () {
    authModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
  };

  // Close auth modal
  window.closeAuthModal = function () {
    authModal.style.display = 'none';
    document.body.style.overflow = '';
  };

  window.onclick = function(event) {
    const modal = document.getElementById("authModal");
    if (event.target === modal) {
        modal.style.display = "none";
    }
  }

  // Toggle Sign In / Sign Up
  window.toggleAuthMode = function () {
    isSignUp = !isSignUp;
    authTitle.textContent = isSignUp ? 'Sign Up' : 'Sign In';
    nameField.style.display = isSignUp ? 'block' : 'none';
    toggleText.textContent = isSignUp ? 'Already have an account?' : "Don't have an account?";
    toggleLink.textContent = isSignUp ? 'Sign In' : 'Sign Up';
  };

  // Handle submit
  const submitBtn = document.getElementById("authForm");
  submitBtn.addEventListener("submit", function (e) {
    e.preventDefault();

    const emailInput = document.querySelector('input[type="email"]');
    const passwordInput = document.querySelector('input[type="password"]');
    const nameInput = document.getElementById('nameField');

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const name = nameInput.value.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !password || (isSignUp && !name)) {
      alert("Please fill in all required fields.");
      return;
    }

    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }
    
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userEmail", email);
    localStorage.setItem("userName", name || email.split("@")[0]);

    alert(isSignUp ? "Sign Up successful!" : "Login successful!");

    // Reset and close
    emailInput.value = '';
    passwordInput.value = '';
    nameInput.value = '';
    closeAuthModal();
    updateNavbar();
  });

  // Check if already logged in
  if (localStorage.getItem("isLoggedIn") === "true") {
    console.log("User is already logged in as", localStorage.getItem("userEmail"));
    updateNavbar();
  }
});

// ───── NAVBAR UPDATES ─────
function updateNavbar() {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userName = localStorage.getItem("userName") || "";
  
  const authSection = document.getElementById("authSection");
  const userSection = document.getElementById("userSection");
  const userNameDisplay = document.getElementById("userNameDisplay");
  const orderBurgerBtn = document.getElementById("orderBurgerBtn");

  if (isLoggedIn) {
    authSection.classList.add("d-none");
    userSection.classList.remove("d-none");
    userNameDisplay.textContent = userName;
     // Show order burger button
   if (orderBurgerBtn) orderBurgerBtn.style.display = "inline-block";
  }else {
    authSection.classList.remove("d-none");
    userSection.classList.add("d-none");
    userNameDisplay.textContent = "";
     // Hide order burger button
    if (orderBurgerBtn) orderBurgerBtn.style.display = "none";
  }
}

// ───── LOGOUT ─────
function logoutUser() {
  localStorage.clear();
  alert("You’ve been logged out.");
  updateNavbar();
}


// ─── Hamburger Toggle ───
document.addEventListener("DOMContentLoaded", function () {
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const navWrapper = document.getElementById("navWrapper");

  hamburgerBtn.addEventListener("click", () => {
    navWrapper.classList.toggle("active");
  });
});


