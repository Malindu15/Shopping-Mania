/* ==========================================
   LUXE SHOP — Premium JavaScript Engine
   ========================================== */

// ==========================================
// Product Data Store
// ==========================================

let PRODUCTS = [];

// Fetch products from the backend database
async function fetchProductsFromDB() {
  try {
    const response = await fetch('/api/products');
    PRODUCTS = await response.json();
    return true;
  } catch (error) {
    console.error("Error fetching products from database:", error);
    return false;
  }
}


const DISCOUNT_CODES = { "SAVE10": 10, "LUXE20": 20, "FLASH15": 15 };

// ==========================================
// Cart State
// ==========================================

let cart = JSON.parse(localStorage.getItem("luxe_cart")) || [];
let appliedDiscount = 0;

function saveCart() {
  localStorage.setItem("luxe_cart", JSON.stringify(cart));
}

function getCartSubtotal() {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

// ==========================================
// Cart Count
// ==========================================

function updateCartCount() {
  const total = cart.reduce((sum, item) => sum + item.qty, 0);
  document.querySelectorAll("#cartCount").forEach(el => el.textContent = total);
}

// ==========================================
// Add to Cart
// ==========================================

function addToCart(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.qty += 1;
    showToast("Cart Updated", `${product.name} qty increased.`, "info");
  } else {
    cart.push({ ...product, qty: 1 });
    showToast("Added to Cart! 🛒", product.name, "success");
  }

  saveCart();
  updateCartCount();
  animateCartBadge();
}

function animateCartBadge() {
  document.querySelectorAll(".cart-badge").forEach(b => {
    b.classList.remove("pulse");
    void b.offsetWidth;
    b.classList.add("pulse");
    setTimeout(() => b.classList.remove("pulse"), 500);
  });
}

// ==========================================
// Cart Page Display
// ==========================================

function displayCart() {
  const el = document.getElementById("cartItems");
  if (!el) return;

  if (cart.length === 0) {
    el.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">🛒</div>
        <h3>Your cart is empty</h3>
        <p>Discover our premium collection and find something you love.</p>
        <a href="index.html" class="btn-primary" style="display:inline-flex;">Browse Products →</a>
      </div>`;
    updateSummaryDisplay();
    return;
  }

  el.innerHTML = cart.map((item, i) => `
    <div class="cart-item">
      <img class="cart-item-img" src="${item.image}" alt="${item.name}"
           onerror="this.src='https://placehold.co/96x96/1C1C26/6C63FF?text=📦'">
      <div class="cart-item-info">
        <div class="cart-item-category">${item.category}</div>
        <h3>${item.name}</h3>
        <div class="qty-stepper" style="margin-top:12px;">
          <button class="qty-btn" onclick="changeQty(${i}, -1)">−</button>
          <span class="qty-value">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty(${i}, 1)">+</button>
        </div>
      </div>
      <div class="cart-item-actions">
        <div class="cart-item-price">Rs. ${(item.price * item.qty).toLocaleString()}</div>
        <button class="remove-btn" onclick="removeItem(${i})">Remove</button>
      </div>
    </div>`).join('');

  updateSummaryDisplay();
}

function changeQty(index, delta) {
  if (!cart[index]) return;
  cart[index].qty += delta;
  if (cart[index].qty <= 0) cart.splice(index, 1);
  saveCart();
  updateCartCount();
  displayCart();
}

function removeItem(index) {
  const name = cart[index]?.name || "Item";
  cart.splice(index, 1);
  saveCart();
  updateCartCount();
  displayCart();
  showToast("Removed", `${name} removed from cart.`, "error");
}

function updateSummaryDisplay() {
  const sub = getCartSubtotal();
  const shipping = sub > 5000 ? 0 : (sub > 0 ? 200 : 0);
  const discount = Math.floor(sub * appliedDiscount / 100);
  const total = sub + shipping - discount;

  const set = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
  set("summarySubtotal", `Rs. ${sub.toLocaleString()}`);
  set("summaryShipping", shipping === 0 && sub > 0 ? "FREE 🎉" : sub === 0 ? "—" : `Rs. ${shipping}`);
  set("summaryDiscount", discount > 0 ? `−Rs. ${discount.toLocaleString()}` : "—");
  set("summaryTotal", `Rs. ${total.toLocaleString()}`);
  set("cartTotal", total.toLocaleString());
  set("checkoutTotal", total.toLocaleString());
}

function applyDiscount() {
  const input = document.getElementById("couponInput");
  const code = input?.value?.trim().toUpperCase();
  if (!code) { showToast("Enter Code", "Please enter a coupon code.", "error"); return; }
  const pct = DISCOUNT_CODES[code];
  if (pct) {
    appliedDiscount = pct;
    updateSummaryDisplay();
    showToast("🎉 Coupon Applied!", `You saved ${pct}% on your order.`, "success");
    if (input) { input.value = ''; input.disabled = true; }
  } else {
    showToast("Invalid Code", "That coupon code is not valid.", "error");
  }
}

function checkout() {
  if (cart.length === 0) { showToast("Cart Empty", "Add items to your cart first.", "error"); return; }
  window.location.href = "checkout.html";
}

// ==========================================
// Checkout Page
// ==========================================

function displayCheckoutItems() {
  const el = document.getElementById("checkoutItems");
  if (!el) return;
  if (cart.length === 0) {
    el.innerHTML = `<p style="color:var(--text-muted);font-size:13px;text-align:center;">No items in cart.</p>`;
    updateSummaryDisplay();
    return;
  }
  el.innerHTML = cart.map(item => `
    <div class="checkout-item">
      <img src="${item.image}" alt="${item.name}"
           onerror="this.src='https://placehold.co/50x50/1C1C26/6C63FF?text=📦'">
      <span class="checkout-item-name">${item.name} × ${item.qty}</span>
      <span class="checkout-item-price">Rs. ${(item.price * item.qty).toLocaleString()}</span>
    </div>`).join('');
  updateSummaryDisplay();
}

let selectedPayment = null;

function selectPayment(method) {
  selectedPayment = method;
  document.querySelectorAll(".payment-method").forEach(m => m.classList.remove("selected"));
  const el = document.getElementById(`pay-${method}`);
  if (el) el.classList.add("selected");
}

function placeOrder(event) {
  event.preventDefault();
  if (!event.target.checkValidity()) { event.target.reportValidity(); return; }
  if (!selectedPayment) { showToast("Select Payment", "Please select a payment method.", "error"); return; }

  const btn = document.getElementById("placeOrderBtn");
  if (btn) { btn.textContent = "⏳ Processing..."; btn.disabled = true; }

  setTimeout(() => {
    cart = [];
    saveCart();
    updateCartCount();
    const form = document.getElementById("checkoutForm");
    if (form) form.style.display = "none";
    const success = document.getElementById("orderSuccess");
    if (success) success.classList.add("show");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, 1500);
}

// ==========================================
// Auth
// ==========================================

function registerUser(event) {
  event.preventDefault();
  const name = document.getElementById("registerName")?.value;
  const email = document.getElementById("registerEmail")?.value;
  const password = document.getElementById("registerPassword")?.value;
  const terms = document.getElementById("termsCheck")?.checked;

  if (!terms) { showToast("Terms Required", "Please accept the terms and conditions.", "error"); return; }

  localStorage.setItem("luxe_userName", name);
  localStorage.setItem("luxe_userEmail", email);
  localStorage.setItem("luxe_userPassword", password);

  showToast("Welcome aboard! 🎉", "Account created successfully.", "success");
  setTimeout(() => window.location.href = "login.html", 1300);
}

function loginUser(event) {
  event.preventDefault();
  const email = document.getElementById("loginEmail")?.value;
  const password = document.getElementById("loginPassword")?.value;
  const savedEmail = localStorage.getItem("luxe_userEmail");
  const savedPassword = localStorage.getItem("luxe_userPassword");
  const savedName = localStorage.getItem("luxe_userName") || "Shopper";

  if (email === savedEmail && password === savedPassword) {
    localStorage.setItem("luxe_loggedIn", "true");
    showToast(`Welcome back, ${savedName}! 👋`, "Login successful.", "success");
    setTimeout(() => window.location.href = "index.html", 1300);
  } else {
    showToast("Login Failed", "Incorrect email or password.", "error");
    const btn = event.target.querySelector("button[type=submit]");
    if (btn) { btn.style.animation = "none"; void btn.offsetWidth; btn.style.animation = ""; }
  }
}

function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const isHidden = input.type === "password";
  input.type = isHidden ? "text" : "password";
  btn.textContent = isHidden ? "🙈" : "👁️";
}

function checkPasswordStrength(password) {
  const wrap = document.getElementById("passwordStrength");
  const text = document.getElementById("strengthText");
  if (!wrap) return;

  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = ["", "weak", "fair", "good", "strong"];
  const labels = ["", "Weak", "Fair", "Good", "Strong! 🔐"];
  wrap.className = "password-strength " + (score > 0 ? `strength-${levels[score]}` : "");
  if (text) text.textContent = labels[score] || "";
}

// ==========================================
// Real-time Search
// ==========================================

function initSearch() {
  const input = document.getElementById("searchInput");
  if (!input) return;

  let timer;
  input.addEventListener("input", function () {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const q = this.value.toLowerCase().trim();
      document.querySelectorAll(".product-card[data-name]").forEach(card => {
        const match = !q
          || (card.dataset.name || "").toLowerCase().includes(q)
          || (card.dataset.category || "").toLowerCase().includes(q);
        card.style.display = match ? "" : "none";
      });
    }, 200);
  });

  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && this.value.trim()) {
      window.location.href = `products.html?q=${encodeURIComponent(this.value.trim())}`;
    }
  });
}

// ==========================================
// Flash Sale Countdown
// ==========================================

function initCountdown() {
  const hoursEl = document.getElementById("cdHours");
  if (!hoursEl) return;
  const minsEl = document.getElementById("cdMins");
  const secsEl = document.getElementById("cdSecs");

  const end = new Date();
  end.setHours(23, 59, 59, 0);

  const tick = () => {
    const diff = Math.max(0, end - Date.now());
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    hoursEl.textContent = String(h).padStart(2, "0");
    minsEl.textContent = String(m).padStart(2, "0");
    secsEl.textContent = String(s).padStart(2, "0");
  };

  tick();
  setInterval(tick, 1000);
}

// ==========================================
// Product Tabs (product.html)
// ==========================================

function switchTab(tabId) {
  document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
  document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
  document.querySelector(`[data-tab="${tabId}"]`)?.classList.add("active");
  document.getElementById(tabId)?.classList.add("active");
}

// ==========================================
// Gallery (product.html)
// ==========================================

function switchImage(thumb, src) {
  document.querySelectorAll(".gallery-thumb").forEach(t => t.classList.remove("active"));
  thumb.classList.add("active");
  const main = document.getElementById("mainImage");
  if (main) { main.style.opacity = "0"; setTimeout(() => { main.src = src; main.style.opacity = "1"; }, 150); }
}

// ==========================================
// Product Detail Qty
// ==========================================

function changeDetailQty(delta) {
  const el = document.getElementById("detailQty");
  if (!el) return;
  el.textContent = Math.max(1, parseInt(el.textContent || "1") + delta);
}

function addDetailToCart(productId) {
  const qty = parseInt(document.getElementById("detailQty")?.textContent || "1");
  for (let i = 0; i < qty; i++) addToCart(productId);
}

// ==========================================
// Toast System
// ==========================================

function showToast(title, message, type = "info") {
  let container = document.getElementById("toastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const icons = { success: "✅", error: "❌", info: "💜" };
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || "ℹ️"}</span>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      ${message ? `<div class="toast-msg">${message}</div>` : ""}
    </div>`;

  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add("toast-exit");
    setTimeout(() => toast.remove(), 320);
  }, 3200);
}

// ==========================================
// Back to Top
// ==========================================

function initBackToTop() {
  const btn = document.getElementById("backToTop");
  if (!btn) return;
  window.addEventListener("scroll", () => btn.classList.toggle("visible", window.scrollY > 380));
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

// ==========================================
// Active Nav
// ==========================================

function initNavLinks() {
  const page = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".navbar a").forEach(link => {
    const href = link.getAttribute("href") || "";
    if (href === page || href.split("?")[0] === page) link.classList.add("active");
  });
}

// ==========================================
// Products Page (products.html)
// ==========================================

function renderProductCard(p) {
  const fullStars = Math.round(p.rating);
  const stars = "★".repeat(fullStars) + "☆".repeat(5 - fullStars);
  return `
    <div class="product-card" data-name="${p.name}" data-category="${p.category}">
      <div class="product-image-wrapper">
        <img src="${p.image}" alt="${p.name}"
             onerror="this.src='https://placehold.co/230x210/1C1C26/6C63FF?text=📦'" loading="lazy">
        <div class="product-overlay">
          <button class="quick-add-btn" onclick="addToCart(${p.id});event.stopPropagation();">⚡ Quick Add</button>
        </div>
        <span class="badge ${p.badge === 'discount' ? 'badge-discount' : 'badge-new'}">
          ${p.badge === 'discount' ? `−${p.discount}%` : 'NEW'}
        </span>
        <button class="wishlist-btn" onclick="event.stopPropagation()" title="Wishlist">♡</button>
      </div>
      <div class="product-info">
        <div class="product-category-tag">${p.category}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-rating">
          <span class="stars">${stars}</span>
          <span class="rating-count">(${p.reviews})</span>
        </div>
        <div class="product-pricing">
          <span class="price-current">Rs. ${p.price.toLocaleString()}</span>
          ${p.oldPrice ? `<span class="price-old">Rs. ${p.oldPrice.toLocaleString()}</span>` : ""}
        </div>
        <button class="add-to-cart-btn" onclick="addToCart(${p.id})">🛒 Add to Cart</button>
      </div>
    </div>`;
}

function filterProducts() {
  const grid = document.getElementById("productsGrid");
  if (!grid) return;

  const q = (document.getElementById("productsSearch")?.value || "").toLowerCase().trim();
  const catFilters = [...document.querySelectorAll(".cat-filter:checked")].map(c => c.value.toLowerCase());
  const maxPrice = parseInt(document.getElementById("priceRange")?.value || "200000");
  const sort = document.getElementById("sortSelect")?.value || "default";
  const priceLabel = document.getElementById("priceLabel");
  if (priceLabel) priceLabel.textContent = `Rs. ${parseInt(document.getElementById("priceRange")?.value || 200000).toLocaleString()}`;

  let filtered = PRODUCTS.filter(p => {
    const matchQ = !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    const matchCat = catFilters.length === 0 || catFilters.includes(p.category.toLowerCase());
    return matchQ && matchCat && p.price <= maxPrice;
  });

  if (sort === "price-asc") filtered.sort((a, b) => a.price - b.price);
  else if (sort === "price-desc") filtered.sort((a, b) => b.price - a.price);
  else if (sort === "rating") filtered.sort((a, b) => b.rating - a.rating);
  else if (sort === "discount") filtered.sort((a, b) => b.discount - a.discount);

  const count = document.getElementById("productsCount");
  if (count) count.innerHTML = `Showing <strong>${filtered.length}</strong> products`;

  grid.innerHTML = filtered.length
    ? filtered.map(renderProductCard).join("")
    : `<div style="grid-column:1/-1;text-align:center;padding:60px 24px;color:var(--text-muted);">
        <div style="font-size:48px;margin-bottom:14px">🔍</div>
        <h3 style="font-size:20px;margin-bottom:8px;color:var(--text)">No products found</h3>
        <p>Try adjusting your filters or search term.</p>
      </div>`;
}

function initProductsPage() {
  const grid = document.getElementById("productsGrid");
  if (!grid) return;

  // Prefill search from URL ?q=
  const params = new URLSearchParams(window.location.search);
  const q = params.get("q") || "";
  const input = document.getElementById("productsSearch");
  if (q && input) input.value = q;

  filterProducts();
}

// ==========================================
// Init
// ==========================================

document.addEventListener("DOMContentLoaded", async function () {
  await fetchProductsFromDB();
  
  updateCartCount();
  displayCart();
  displayCheckoutItems();
  initSearch();
  initCountdown();
  initBackToTop();
  initNavLinks();
  initProductsPage();
  initProductDetailPage();
});

function initProductDetailPage() {
  if (!window.location.pathname.includes("product.html")) return;
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get("id"));
  if (!id) return;
  
  const product = PRODUCTS.find(p => p.id === id);
  if (!product) return;

  // Update text elements
  document.querySelector("h1").innerText = product.name;
  document.querySelector(".product-category-tag").innerText = product.category;
  document.querySelector(".price-main").innerText = "Rs. " + product.price.toLocaleString();
  document.querySelector(".price-original").innerText = "Rs. " + product.oldPrice.toLocaleString();
  document.querySelector(".price-savings").innerText = "Save " + product.discount + "%";
  
  // Update description paragraphs
  const descEls = document.querySelectorAll(".product-description, #tab-desc p");
  descEls.forEach(el => el.innerText = product.description);

  // Update Images (main and thumbs)
  const thumbs = document.querySelectorAll(".gallery-thumb img");
  if(thumbs.length > 0) {
    thumbs[0].src = product.image;
    document.querySelector(".gallery-main img").src = product.image;
  }

  // Update Buttons to use correct ID
  const buyNowBtn = document.querySelector(".buy-now-btn");
  const addCartBtn = document.querySelector(".detail-add-cart");
  if (buyNowBtn) buyNowBtn.setAttribute("onclick", `addDetailToCart(${product.id}); window.location.href='checkout.html'`);
  if (addCartBtn) addCartBtn.setAttribute("onclick", `addDetailToCart(${product.id})`);

  // Update Specifications based on category
  const specsContainer = document.querySelector("#tab-specs table");
  if (specsContainer) {
    if (product.category === "Beauty") {
      specsContainer.innerHTML = `
        <tr style="border-bottom:1px solid var(--border);">
          <td style="padding:12px 0;color:var(--text-muted);width:40%;">Skin Type</td>
          <td style="padding:12px 0;">All Skin Types</td>
        </tr>
        <tr style="border-bottom:1px solid var(--border);">
          <td style="padding:12px 0;color:var(--text-muted);">Formulation</td>
          <td style="padding:12px 0;">Premium Quality</td>
        </tr>
        <tr style="border-bottom:1px solid var(--border);">
          <td style="padding:12px 0;color:var(--text-muted);">Benefits</td>
          <td style="padding:12px 0;">Long-lasting, Cruelty-free</td>
        </tr>
        <tr>
          <td style="padding:12px 0;color:var(--text-muted);">Authenticity</td>
          <td style="padding:12px 0;">100% Genuine</td>
        </tr>
      `;
    } else if (product.category === "Electronics") {
      specsContainer.innerHTML = `
        <tr style="border-bottom:1px solid var(--border);">
          <td style="padding:12px 0;color:var(--text-muted);width:40%;">Warranty</td>
          <td style="padding:12px 0;">1 Year Official</td>
        </tr>
        <tr style="border-bottom:1px solid var(--border);">
          <td style="padding:12px 0;color:var(--text-muted);">Connectivity</td>
          <td style="padding:12px 0;">Bluetooth / Wireless</td>
        </tr>
        <tr>
          <td style="padding:12px 0;color:var(--text-muted);">Condition</td>
          <td style="padding:12px 0;">Brand New, Sealed</td>
        </tr>
      `;
    } else {
      specsContainer.innerHTML = `
        <tr style="border-bottom:1px solid var(--border);">
          <td style="padding:12px 0;color:var(--text-muted);width:40%;">Material</td>
          <td style="padding:12px 0;">Premium Quality</td>
        </tr>
        <tr>
          <td style="padding:12px 0;color:var(--text-muted);">Care Instructions</td>
          <td style="padding:12px 0;">See packaging for details</td>
        </tr>
      `;
    }
  }

  // Update Feedbacks / Reviews based on product name
  const reviewsContainer = document.querySelector("#tab-reviews > div");
  if (reviewsContainer) {
    reviewsContainer.innerHTML = `
      <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:18px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
          <strong>Ahmed K.</strong>
          <span style="color:var(--text-muted);font-size:12px;">2 days ago</span>
        </div>
        <div style="margin-bottom:8px;"><span class="stars" style="font-size:13px;">★★★★★</span></div>
        <p style="font-size:13.5px;color:var(--text-muted);">Absolutely love this ${product.name.toLowerCase()}! The quality is amazing and it arrived exactly as described. Will definitely buy again!</p>
      </div>

      <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:18px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
          <strong>Sana M.</strong>
          <span style="color:var(--text-muted);font-size:12px;">1 week ago</span>
        </div>
        <div style="margin-bottom:8px;"><span class="stars" style="font-size:13px;">★★★★☆</span></div>
        <p style="font-size:13.5px;color:var(--text-muted);">Very good ${product.category.toLowerCase()} product. The packaging was neat. Giving 4 stars because delivery was delayed by a day.</p>
      </div>
    `;
    document.querySelector("[data-tab='tab-reviews']").innerText = `Reviews (2)`;
  }
}