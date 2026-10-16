const products = [
  { id: "mocha", name: "Caffe Mocha", type: "Deep Foam", price: 4.53, category: "Macchiato", rating: "4.8", image: "https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&w=700&q=85" },
  { id: "flat-white", name: "Flat White", type: "Espresso", price: 3.53, category: "Latte", rating: "4.9", image: "https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=700&q=85" },
  { id: "latte", name: "Caffe Latte", type: "With Oat Milk", price: 4.20, category: "Latte", rating: "4.7", image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=700&q=85" },
  { id: "americano", name: "Americano", type: "Rich Espresso", price: 3.20, category: "Americano", rating: "4.8", image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=700&q=85" }
];

const state = { screen: "welcome", category: "All Coffee", search: "", selected: products[0], size: "M", quantity: 1, delivery: "Deliver", favorites: new Set(), cartCount: 0 };
const money = value => `$ ${value.toFixed(2)}`;
const byId = id => document.getElementById(id);

function showScreen(name) {
  if (name === "order" && state.cartCount === 0) {
    notify("Your order is empty. Add a coffee to get started.");
    return;
  }
  state.screen = name;
  document.querySelectorAll(".screen").forEach(screen => screen.classList.toggle("is-active", screen.id === name));
  if (name === "favorites") renderFavorites();
  if (name === "order") renderOrder();
}

function notify(message) {
  const toast = byId("toast");
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(notify.timer);
  notify.timer = setTimeout(() => toast.classList.remove("visible"), 2200);
}

function productCard(product) {
  const favorite = state.favorites.has(product.id);
  return `<article class="product-card">
    <button class="product-open" data-product="${product.id}" aria-label="View ${product.name}" style="display:block;width:100%;padding:0;border:0;background:none;text-align:left">
      <div class="product-image-wrap"><img class="product-image" src="${product.image}" alt="${product.name}" loading="lazy"><span class="product-rating">${product.rating}</span></div>
      <h3>${product.name}</h3><span class="product-type">${product.type}</span>
    </button>
    <div class="product-card-bottom"><span class="product-price">${money(product.price)}</span>
      <button class="add-button" data-add="${product.id}" aria-label="Add ${product.name} to order">+</button>
    </div>
    <button class="card-favorite${favorite ? " is-favorite" : ""}" data-favorite="${product.id}" aria-label="${favorite ? "Remove from" : "Add to"} favorites">${favorite ? "♥" : "♡"}</button>
  </article>`;
}

function renderProducts() {
  const filtered = products.filter(product =>
    (state.category === "All Coffee" || product.category === state.category) &&
    `${product.name} ${product.type}`.toLowerCase().includes(state.search.toLowerCase())
  );
  byId("product-grid").innerHTML = filtered.length ? filtered.map(productCard).join("") : '<p class="empty-state" style="display:block;grid-column:1/-1">No coffee found. Try another search.</p>';
}

function renderFavorites() {
  const saved = products.filter(product => state.favorites.has(product.id));
  byId("favorites-grid").innerHTML = saved.map(productCard).join("");
  byId("favorites-empty").style.display = saved.length ? "none" : "block";
}

function openProduct(id) {
  const product = products.find(item => item.id === id);
  if (!product) return;
  state.selected = product;
  state.size = "M";
  byId("detail-name").textContent = product.name;
  byId("detail-subtitle").textContent = product.type;
  byId("detail-price").textContent = money(product.price);
  byId("detail-image").src = product.image;
  byId("detail-image").alt = product.name;
  byId("detail-heart").textContent = state.favorites.has(id) ? "♥" : "♡";
  byId("detail-heart").classList.toggle("is-favorite", state.favorites.has(id));
  document.querySelectorAll(".size-options button").forEach(button => button.classList.toggle("selected", button.dataset.size === "M"));
  showScreen("detail");
}

function setFavorite(id) {
  if (state.favorites.has(id)) state.favorites.delete(id);
  else state.favorites.add(id);
  renderProducts();
  if (state.screen === "favorites") renderFavorites();
  const selected = state.selected;
  if (selected.id === id) {
    byId("detail-heart").textContent = state.favorites.has(id) ? "♥" : "♡";
    byId("detail-heart").classList.toggle("is-favorite", state.favorites.has(id));
  }
}

function addToCart(id) {
  const product = products.find(item => item.id === id);
  if (!product) return;
  if (state.selected.id !== id || state.cartCount === 0) {
    state.cartCount = 0;
    state.size = "M";
  }
  state.selected = product;
  state.cartCount += 1;
  byId("cart-count").hidden = false;
  byId("cart-count").textContent = state.cartCount;
  state.quantity = state.cartCount;
  notify(`${product.name} added to your order`);
}

function renderOrder() {
  const product = state.selected;
  byId("order-name").textContent = product.name;
  byId("order-subtitle").textContent = product.type;
  byId("order-image").src = product.image;
  byId("order-image").alt = product.name;
  byId("quantity").textContent = state.quantity;
  const sizeMultiplier = state.size === "S" ? .9 : state.size === "L" ? 1.15 : 1;
  const subtotal = product.price * sizeMultiplier * state.quantity;
  const total = subtotal + 1;
  byId("summary-price").textContent = money(subtotal);
  byId("wallet-total").textContent = money(total);
  byId("total-payment").textContent = money(total);
}

document.addEventListener("click", event => {
  const target = event.target.closest("button");
  if (!target) return;
  if (target.dataset.screen) { showScreen(target.dataset.screen); return; }
  if (target.dataset.category) {
    state.category = target.dataset.category;
    document.querySelectorAll(".category-chip").forEach(button => button.classList.toggle("selected", button === target));
    renderProducts();
  }
  if (target.dataset.product) openProduct(target.dataset.product);
  if (target.dataset.add) addToCart(target.dataset.add);
  if (target.dataset.favorite) setFavorite(target.dataset.favorite);
  if (target.dataset.size) {
    state.size = target.dataset.size;
    document.querySelectorAll(".size-options button").forEach(button => button.classList.toggle("selected", button === target));
    const multiplier = state.size === "S" ? .9 : state.size === "L" ? 1.15 : 1;
    byId("detail-price").textContent = money(state.selected.price * multiplier);
  }
  if (target.dataset.delivery) {
    state.delivery = target.dataset.delivery;
    document.querySelectorAll(".delivery-toggle button").forEach(button => button.classList.toggle("selected", button === target));
    byId("address-heading").textContent = state.delivery === "Deliver" ? "Delivery Address" : "Pick Up Location";
  }
  if (target.id === "detail-heart") setFavorite(state.selected.id);
  if (target.id === "buy-now") {
    state.quantity = 1;
    state.cartCount = 1;
    byId("cart-count").hidden = false;
    byId("cart-count").textContent = state.cartCount;
    showScreen("order");
  }
  if (target.id === "increase") {
    state.quantity += 1;
    state.cartCount = state.quantity;
    byId("cart-count").textContent = state.cartCount;
    renderOrder();
  }
  if (target.id === "decrease") {
    if (state.quantity > 1) {
      state.quantity -= 1;
      state.cartCount = state.quantity;
      byId("cart-count").textContent = state.cartCount;
      renderOrder();
    }
    else notify("Your order must include at least one coffee.");
  }
  if (target.id === "place-order") {
    state.cartCount = 0;
    state.quantity = 1;
    byId("cart-count").hidden = true;
    showScreen("tracking");
  }
  if (target.id === "see-all") {
    state.category = "All Coffee";
    state.search = "";
    byId("search").value = "";
    document.querySelectorAll(".category-chip").forEach(button => button.classList.toggle("selected", button.dataset.category === state.category));
    renderProducts();
  }
  if (target.classList.contains("discount-button")) notify("No discounts available right now.");
  if (target.classList.contains("filter-button")) notify("Coffee filters are coming soon.");
  if (target.closest(".address-actions")) notify(target.textContent.trim() === "Edit Address" ? "Address editing is coming soon." : "Add a delivery note in the next step.");
  if (target.classList.contains("payment-method")) notify("Cash/Wallet selected.");
  if (target.id === "map-settings") notify("Map settings are unavailable in this preview.");
  if (target.id === "call-courier") notify("Calling Brooklyn Simmons…");
});

byId("search").addEventListener("input", event => {
  state.search = event.target.value;
  renderProducts();
});

renderProducts();
