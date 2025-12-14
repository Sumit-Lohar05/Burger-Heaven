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

// Calculate total amount based on burger prices
const burgerPrices = {
  'classic': 199,
  'cheese': 249,
  'paneer': 179,
  'chicken': 249,
  'veggie': 149,
  'aloo': 99
};

function calculateTotal() {
  const burgerType = document.querySelector('select[name="burger_type"]').value;
  const quantity = parseInt(document.querySelector('input[name="quantity"]').value, 10) || 0;
  const price = burgerPrices[burgerType] || 0;
  return price * quantity;
}

function updateTotalDisplay() {
  const total = calculateTotal();
  const totalElement = document.getElementById('totalAmount');
  if (totalElement) {
    totalElement.textContent = total;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const burgerSelect = document.querySelector('select[name="burger_type"]');
  const quantityInput = document.querySelector('input[name="quantity"]');
  
  if (burgerSelect) burgerSelect.addEventListener('change', updateTotalDisplay);
  if (quantityInput) quantityInput.addEventListener('input', updateTotalDisplay);
});

// Order submission with Razorpay
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
    message: document.querySelector('textarea[name="message"]').value.trim() || "",
    amount: calculateTotal()
  };

  if (order.amount <= 0) {
    alert("Please select a valid burger and quantity!");
    return;
  }

  try {
    const createOrderRes = await fetch("/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order)
    });

    const orderData = await createOrderRes.json();

    if (!orderData.success) {
      alert("Failed to create order");
      return;
    }

    const options = {
      key: orderData.key_id,
      amount: order.amount * 100,
      currency: "INR",
      name: "Burger Heaven",
      description: `${order.burger_type} Burger x ${order.quantity}`,
      order_id: orderData.order.id,
      handler: async function (response) {
        try {
          const verifyRes = await fetch("/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...order,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })
          });

          const verifyData = await verifyRes.json();

          if (verifyData.success) {
            alert("Payment successful! Your order has been placed.");
            burgerForm.reset();
            closeOrderForm();
          } else {
            alert("Payment verification failed: " + verifyData.error);
          }
        } catch (err) {
          alert("Error verifying payment!");
          console.error(err);
        }
      },
      prefill: {
        name: order.full_name,
        email: order.email,
        contact: order.phone_number
      },
      theme: {
        color: "#ff6b35"
      }
    };

    const rzp = new Razorpay(options);
    rzp.on('payment.failed', function (response) {
      alert("Payment failed: " + response.error.description);
    });
    rzp.open();
  } catch (err) {
    alert("Error placing order!");
    console.error(err);
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
