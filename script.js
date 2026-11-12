/* =========================================================
   SUELA — Lógica de la tienda
   - Catálogo con búsqueda, filtros, talla y orden
   - Modal de producto con selección de talla
   - Carrito (por producto + talla) y favoritos en localStorage
   - Pedido por WhatsApp, validaciones, menú responsive y toasts
   ========================================================= */

/* ---------- Configuración ---------- */
const CONFIG = {
  // Cambia por el WhatsApp real del negocio (código de país + número, sin + ni espacios)
  whatsappNumber: "573000000000",
  shippingFee: 12000,
  freeShippingFrom: 250000,
  cartKey: "suelaCart",
  favKey: "suelaFavs"
};

/* ---------- Catálogo ---------- */
const ALL_SIZES = [36, 37, 38, 39, 40, 41, 42, 43, 44];

const PRODUCTS = [
  { id: 1,  name: "Street Runner Blanco",  brand: "Nova",    category: "urbanos",   price: 289000, oldPrice: 359000, colors: ["#ffffff", "#e9e6dc"], sizes: [37, 38, 39, 40, 41, 42, 43], tag: "Oferta", desc: "Tenis urbano de cuero sintético con suela vulcanizada. Combina con todo." },
  { id: 2,  name: "Midnight Court",        brand: "Kappa",   category: "urbanos",   price: 319000, colors: ["#1b1b22", "#c6f432"], sizes: [38, 39, 40, 41, 42, 43, 44], tag: "Nuevo", desc: "Silueta de cancha en negro con detalles lima. Plantilla acolchada todo el día." },
  { id: 3,  name: "Retro 90 Sunset",       brand: "Nova",    category: "urbanos",   price: 349000, colors: ["#ff6b35", "#f4f2ec"], sizes: [36, 37, 38, 39, 40, 41], desc: "Inspirados en los clásicos de los 90 con paneles en naranja y crema." },
  { id: 4,  name: "Cloud Walk",            brand: "Aero",    category: "urbanos",   price: 269000, oldPrice: 310000, colors: ["#b8c4d6", "#ffffff"], sizes: [36, 37, 38, 39, 40, 41, 42], tag: "Oferta", desc: "Livianos, flexibles y con una espuma que se siente como caminar en una nube." },

  { id: 5,  name: "Velocity Pro",          brand: "Aero",    category: "running",   price: 429000, colors: ["#c6f432", "#1b1b22"], sizes: [38, 39, 40, 41, 42, 43, 44], tag: "Nuevo", desc: "Amortiguación reactiva y malla transpirable para tus rodajes largos." },
  { id: 6,  name: "Trail Blaze",           brand: "Kappa",   category: "running",   price: 389000, colors: ["#2f6f4f", "#e9e6dc"], sizes: [39, 40, 41, 42, 43, 44], desc: "Suela con tacos profundos para montaña y senderos húmedos." },
  { id: 7,  name: "Tempo Flash",           brand: "Nova",    category: "running",   price: 359000, oldPrice: 420000, colors: ["#ff4d6d", "#ffffff"], sizes: [36, 37, 38, 39, 40, 41, 42], tag: "Oferta", desc: "Ligeros y veloces, pensados para entrenamientos de ritmo." },
  { id: 8,  name: "Marathon Max",          brand: "Aero",    category: "running",   price: 469000, colors: ["#3a6ff2", "#f4f2ec"], sizes: [40, 41, 42, 43, 44], desc: "Máxima amortiguación y retorno de energía para largas distancias." },

  { id: 9,  name: "Oxford Clásico",        brand: "Bruno",   category: "formales",  price: 399000, colors: ["#3b2417", "#5a3825"], sizes: [39, 40, 41, 42, 43, 44], tag: "Clásico", desc: "Cuero genuino con costuras reforzadas y suela de goma antideslizante." },
  { id: 10, name: "Derby Negro",           brand: "Bruno",   category: "formales",  price: 379000, oldPrice: 440000, colors: ["#16161a", "#2a2a32"], sizes: [38, 39, 40, 41, 42, 43], tag: "Oferta", desc: "Elegantes y cómodos para la oficina y los eventos especiales." },
  { id: 11, name: "Loafer Café",           brand: "Verano",  category: "formales",  price: 329000, colors: ["#8a5a35", "#6b4226"], sizes: [38, 39, 40, 41, 42, 43, 44], desc: "Mocasín en cuero suave, fácil de poner y con mucho estilo." },

  { id: 12, name: "Playa Strap",           brand: "Verano",  category: "sandalias", price: 129000, colors: ["#ff6b35", "#f4f2ec"], sizes: [36, 37, 38, 39, 40, 41], tag: "Nuevo", desc: "Sandalia con correas ajustables y plantilla anatómica." },
  { id: 13, name: "Slide Cloud",           brand: "Aero",    category: "sandalias", price: 99000,  oldPrice: 125000, colors: ["#1b1b22", "#c6f432"], sizes: [37, 38, 39, 40, 41, 42, 43, 44], tag: "Oferta", desc: "Chancla acolchada de secado rápido, ideal para después de entrenar." },
  { id: 14, name: "Trek Sandal",           brand: "Kappa",   category: "sandalias", price: 179000, colors: ["#4b5d3a", "#d8cfa8"], sizes: [38, 39, 40, 41, 42, 43], desc: "Sandalia de senderismo con doble velcro y suela agarrada." }
];

/* ---------- Utilidades ---------- */
const $ = (sel, scope = document) => scope.querySelector(sel);
const $$ = (sel, scope = document) => [...scope.querySelectorAll(sel)];

const formatCOP = (n) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);

const getProduct = (id) => PRODUCTS.find((p) => p.id === id);

function readStorage(key, fallback) {
  try {
    const v = JSON.parse(localStorage.getItem(key));
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* sin almacenamiento */ }
}

/* =========================================================
   ILUSTRACIONES SVG DE ZAPATOS (se generan por categoría/color)
   ========================================================= */
function shoeSVG(category, c1 = "#ffffff", c2 = "#c6f432") {
  const sole = "#f1efe8";
  const dark = "rgba(0,0,0,.18)";

  const shapes = {
    urbanos: `
      <path d="M18 138 Q18 120 42 118 L255 118 Q288 121 288 140 Q288 152 270 152 L36 152 Q18 152 18 138Z" fill="${sole}" stroke="${dark}" stroke-width="2"/>
      <path d="M42 118 L52 58 Q56 44 76 48 L112 62 Q150 82 188 92 Q254 102 272 118Z" fill="${c1}" stroke="${dark}" stroke-width="2"/>
      <path d="M188 92 Q254 102 272 118 L196 118Z" fill="${c2}"/>
      <path d="M52 100 L112 92 L112 118 L44 118Z" fill="${c2}" opacity=".9"/>
      <g stroke="${dark}" stroke-width="3" stroke-linecap="round"><path d="M104 66 L124 82"/><path d="M122 62 L142 82"/><path d="M140 66 L160 84"/></g>
      <path d="M52 58 Q50 70 56 76" fill="none" stroke="${dark}" stroke-width="2"/>`,
    running: `
      <path d="M14 140 Q14 118 46 116 L252 116 Q292 118 292 144 Q292 158 270 158 L30 158 Q14 158 14 140Z" fill="${sole}" stroke="${dark}" stroke-width="2"/>
      <path d="M14 140 Q14 150 30 150 L270 150 Q292 150 292 144" fill="none" stroke="${c2}" stroke-width="6"/>
      <path d="M44 116 L46 64 Q48 48 70 52 L104 64 Q146 76 190 88 Q258 102 276 116Z" fill="${c1}" stroke="${dark}" stroke-width="2"/>
      <path d="M70 52 L104 64 L110 116 L44 116 L46 64Z" fill="${c2}" opacity=".85"/>
      <path d="M120 78 L240 112" stroke="${c2}" stroke-width="7" stroke-linecap="round"/>
      <g stroke="${dark}" stroke-width="3" stroke-linecap="round"><path d="M114 68 L134 84"/><path d="M132 66 L152 86"/></g>`,
    formales: `
      <path d="M26 142 Q26 128 46 126 L250 126 Q282 128 282 142 Q282 152 266 152 L44 152 Q26 152 26 142Z" fill="#2b1a10" stroke="${dark}" stroke-width="2"/>
      <rect x="40" y="126" width="44" height="26" rx="4" fill="#1d120b"/>
      <path d="M42 126 L50 74 Q54 62 74 64 L130 74 Q190 88 250 108 Q282 118 280 130 L48 130Z" fill="${c1}" stroke="${dark}" stroke-width="2"/>
      <path d="M226 106 Q262 114 276 126" fill="none" stroke="${c2}" stroke-width="3"/>
      <g stroke="rgba(255,255,255,.35)" stroke-width="3" stroke-linecap="round"><path d="M110 82 L128 90"/><path d="M126 78 L144 88"/></g>`,
    sandalias: `
      <path d="M22 140 Q22 126 46 124 L252 124 Q286 126 286 142 Q286 154 268 154 L40 154 Q22 154 22 140Z" fill="${sole}" stroke="${dark}" stroke-width="2"/>
      <path d="M22 140 Q22 148 40 148 L268 148 Q286 148 286 142" fill="none" stroke="${c2}" stroke-width="5"/>
      <path d="M120 124 Q130 80 168 80 Q206 80 214 124Z" fill="${c1}" stroke="${dark}" stroke-width="2"/>
      <path d="M70 124 Q74 100 96 98 L112 124Z" fill="${c1}" stroke="${dark}" stroke-width="2"/>
      <rect x="150" y="84" width="22" height="16" rx="3" fill="${c2}"/>`
  };

  return `<svg viewBox="0 0 306 170" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">${shapes[category] || shapes.urbanos}</svg>`;
}

function productSVG(p) {
  return shoeSVG(p.category, p.colors[0], p.colors[1]);
}

/* =========================================================
   1. CATÁLOGO
   ========================================================= */
const state = { category: "todos", search: "", size: "", sort: "destacados", onlyFav: false };

const gridEl     = $("#products");
const emptyEl    = $("#empty");
const resultsEl  = $("#results");
const searchEl   = $("#searchInput");
const sizeEl     = $("#sizeFilter");
const sortEl     = $("#sortSelect");
const chips      = $$(".chip");
const favBtn     = $("#favToggle");

let favs = readStorage(CONFIG.favKey, []);
if (!Array.isArray(favs)) favs = [];

// Llena el selector de tallas
ALL_SIZES.forEach((s) => {
  const opt = document.createElement("option");
  opt.value = s;
  opt.textContent = s;
  sizeEl.appendChild(opt);
});

function getFiltered() {
  const q = state.search.trim().toLowerCase();

  let list = PRODUCTS.filter((p) => {
    if (state.category !== "todos" && p.category !== state.category) return false;
    if (state.onlyFav && !favs.includes(p.id)) return false;
    if (state.size && !p.sizes.includes(Number(state.size))) return false;
    if (q && !`${p.name} ${p.brand} ${p.category}`.toLowerCase().includes(q)) return false;
    return true;
  });

  const sorters = {
    menor: (a, b) => a.price - b.price,
    mayor: (a, b) => b.price - a.price,
    nombre: (a, b) => a.name.localeCompare(b.name, "es")
  };

  if (sorters[state.sort]) list = [...list].sort(sorters[state.sort]);
  return list;
}

const heartIcon = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 21s-7-4.6-9.300-9.100C1.100 8.700 3 5 6.500 5c2 0 3.500 1.100 5.500 3.200C14 6.100 15.500 5 17.500 5 21 5 22.900 8.700 21.300 11.900 19 16.400 12 21 12 21z"/></svg>`;

function renderProducts() {
  const list = getFiltered();

  gridEl.innerHTML = list.map((p, i) => `
    <article class="card" style="animation-delay:${i * 0.04}s">
      <div class="card__media" data-open="${p.id}">
        ${p.tag ? `<span class="card__tag ${p.tag === "Oferta" ? "card__tag--sale" : ""}">${p.tag}</span>` : ""}
        <button class="card__fav ${favs.includes(p.id) ? "is-on" : ""}" data-fav="${p.id}" aria-label="Marcar ${p.name} como favorito" aria-pressed="${favs.includes(p.id)}">${heartIcon}</button>
        ${productSVG(p)}
      </div>
      <div class="card__body">
        <p class="card__brand">${p.brand}</p>
        <h3 class="card__name">${p.name}</h3>
        <div class="card__foot">
          <div class="price">
            <strong>${formatCOP(p.price)}</strong>
            ${p.oldPrice ? `<s>${formatCOP(p.oldPrice)}</s>` : ""}
          </div>
          <button class="card__btn" data-open="${p.id}">Elegir talla</button>
        </div>
      </div>
    </article>
  `).join("");

  emptyEl.hidden = list.length > 0;
  resultsEl.textContent = `${list.length} ${list.length === 1 ? "modelo" : "modelos"}`;
}

function setCategory(cat) {
  state.category = cat;
  chips.forEach((c) => {
    const on = c.dataset.filter === cat;
    c.classList.toggle("is-active", on);
    c.setAttribute("aria-selected", String(on));
  });
  renderProducts();
}

chips.forEach((chip) => chip.addEventListener("click", () => setCategory(chip.dataset.filter)));

searchEl.addEventListener("input", () => { state.search = searchEl.value; renderProducts(); });
sizeEl.addEventListener("change", () => { state.size = sizeEl.value; renderProducts(); });
sortEl.addEventListener("change", () => { state.sort = sortEl.value; renderProducts(); });

// Tarjetas de categoría en la página
$$(".cat").forEach((btn) => {
  btn.addEventListener("click", () => {
    setCategory(btn.dataset.cat);
    $("#tienda").scrollIntoView({ behavior: "smooth" });
  });
});

// Eventos de las tarjetas (delegación)
gridEl.addEventListener("click", (e) => {
  const fav = e.target.closest("[data-fav]");
  if (fav) {
    e.stopPropagation();
    toggleFav(Number(fav.dataset.fav));
    return;
  }
  const open = e.target.closest("[data-open]");
  if (open) openModal(Number(open.dataset.open));
});

/* ---------- Favoritos ---------- */
const favCountEl = $("#favCount");

function toggleFav(id) {
  const i = favs.indexOf(id);
  if (i >= 0) {
    favs.splice(i, 1);
    showToast("Quitado de favoritos");
  } else {
    favs.push(id);
    showToast("♥ Guardado en favoritos");
  }
  writeStorage(CONFIG.favKey, favs);
  updateFavCount();
  renderProducts();
}

function updateFavCount() {
  favCountEl.textContent = favs.length;
}

favBtn.addEventListener("click", () => {
  state.onlyFav = !state.onlyFav;
  favBtn.setAttribute("aria-pressed", String(state.onlyFav));
  renderProducts();
  $("#tienda").scrollIntoView({ behavior: "smooth" });
  if (state.onlyFav && favs.length === 0) showToast("Aún no tienes favoritos");
});

/* =========================================================
   2. MODAL DE PRODUCTO
   ========================================================= */
const modalEl   = $("#modal");
const overlayEl = $("#overlay");
const modalErr  = $("#modalError");
let modalProduct = null;
let selectedSize = null;

function openModal(id) {
  modalProduct = getProduct(id);
  selectedSize = null;
  const p = modalProduct;

  $("#modalArt").innerHTML = productSVG(p);
  $("#modalBrand").textContent = p.brand;
  $("#modalName").textContent = p.name;
  $("#modalPrice").innerHTML = `${formatCOP(p.price)}${p.oldPrice ? ` <s style="color:var(--muted);font-size:.9rem;font-weight:500">${formatCOP(p.oldPrice)}</s>` : ""}`;
  $("#modalDesc").textContent = p.desc;
  modalErr.textContent = "";

  $("#modalSizes").innerHTML = ALL_SIZES.map((s) => `
    <button class="size" data-size="${s}" ${p.sizes.includes(s) ? "" : "disabled"} aria-label="Talla ${s}${p.sizes.includes(s) ? "" : " agotada"}">${s}</button>
  `).join("");

  showOverlay();
  modalEl.classList.add("is-open");
  modalEl.setAttribute("aria-hidden", "false");
  $("#modalClose").focus();
}

function closeModal() {
  modalEl.classList.remove("is-open");
  modalEl.setAttribute("aria-hidden", "true");
  if (!cartEl.classList.contains("is-open")) hideOverlay();
}

$("#modalSizes").addEventListener("click", (e) => {
  const btn = e.target.closest(".size");
  if (!btn || btn.disabled) return;
  selectedSize = Number(btn.dataset.size);
  $$(".size").forEach((b) => b.classList.toggle("is-selected", b === btn));
  modalErr.textContent = "";
});

$("#modalAdd").addEventListener("click", () => {
  if (!selectedSize) {
    modalErr.textContent = "Selecciona una talla para continuar.";
    return;
  }
  addToCart(modalProduct.id, selectedSize);
  closeModal();
});

$("#modalClose").addEventListener("click", closeModal);

/* ---------- Overlay compartido ---------- */
function showOverlay() {
  overlayEl.hidden = false;
  requestAnimationFrame(() => overlayEl.classList.add("is-visible"));
  document.body.classList.add("no-scroll");
}

function hideOverlay() {
  overlayEl.classList.remove("is-visible");
  document.body.classList.remove("no-scroll");
  setTimeout(() => {
    if (!overlayEl.classList.contains("is-visible")) overlayEl.hidden = true;
  }, 250);
}

overlayEl.addEventListener("click", () => { closeModal(); closeCart(); });

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  closeModal();
  closeCart();
});

/* =========================================================
   3. CARRITO (producto + talla)
   ========================================================= */
const cartEl        = $("#cart");
const cartItemsEl   = $("#cartItems");
const cartEmptyEl   = $("#cartEmpty");
const cartFootEl    = $("#cartFoot");
const cartCountEl   = $("#cartCount");

let cart = loadCart();

function loadCart() {
  const saved = readStorage(CONFIG.cartKey, []);
  if (!Array.isArray(saved)) return [];
  return saved.filter((i) => {
    const p = getProduct(i.id);
    return p && p.sizes.includes(i.size) && i.qty > 0;
  });
}

function saveCart() { writeStorage(CONFIG.cartKey, cart); }

function addToCart(id, size) {
  const item = cart.find((i) => i.id === id && i.size === size);
  if (item) item.qty += 1;
  else cart.push({ id, size, qty: 1 });
  updateCart();
  cartCountEl.classList.remove("bump");
  void cartCountEl.offsetWidth;
  cartCountEl.classList.add("bump");
  showToast(`${getProduct(id).name} (talla ${size}) en tu bolsa`);
}

function changeQty(id, size, delta) {
  const item = cart.find((i) => i.id === id && i.size === size);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) return removeItem(id, size);
  updateCart();
}

function removeItem(id, size) {
  cart = cart.filter((i) => !(i.id === id && i.size === size));
  updateCart();
}

function getTotals() {
  const subtotal = cart.reduce((s, i) => s + getProduct(i.id).price * i.qty, 0);
  const shipping = subtotal === 0 || subtotal >= CONFIG.freeShippingFrom ? 0 : CONFIG.shippingFee;
  const units = cart.reduce((s, i) => s + i.qty, 0);
  return { subtotal, shipping, total: subtotal + shipping, units };
}

function renderCart() {
  const { subtotal, shipping, total, units } = getTotals();
  const isEmpty = cart.length === 0;

  cartEmptyEl.hidden = !isEmpty;
  cartFootEl.classList.toggle("is-hidden", isEmpty);
  cartCountEl.textContent = units;

  cartItemsEl.innerHTML = cart.map(({ id, size, qty }) => {
    const p = getProduct(id);
    return `
      <li class="cart-item">
        <div class="cart-item__img">${productSVG(p)}</div>
        <div>
          <p class="cart-item__name">${p.name}</p>
          <p class="cart-item__meta">${p.brand} · Talla ${size}</p>
          <p class="cart-item__price">${formatCOP(p.price * qty)}</p>
        </div>
        <div class="cart-item__side">
          <div class="qty">
            <button data-act="minus" data-id="${id}" data-size="${size}" aria-label="Quitar uno">−</button>
            <span>${qty}</span>
            <button data-act="plus" data-id="${id}" data-size="${size}" aria-label="Agregar uno">+</button>
          </div>
          <button class="cart-item__remove" data-act="remove" data-id="${id}" data-size="${size}">Eliminar</button>
        </div>
      </li>`;
  }).join("");

  $("#cartSubtotal").textContent = formatCOP(subtotal);
  $("#cartShipping").textContent = shipping === 0 && subtotal > 0 ? "Gratis" : formatCOP(shipping);
  $("#cartTotal").textContent = formatCOP(total);

  const hint = $("#cartHint");
  if (subtotal > 0 && subtotal < CONFIG.freeShippingFrom) {
    hint.textContent = `Te faltan ${formatCOP(CONFIG.freeShippingFrom - subtotal)} para envío gratis`;
  } else if (subtotal >= CONFIG.freeShippingFrom) {
    hint.textContent = "¡Tienes envío gratis!";
  } else {
    hint.textContent = "";
  }
}

function updateCart() { saveCart(); renderCart(); }

cartItemsEl.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-act]");
  if (!btn) return;
  const id = Number(btn.dataset.id);
  const size = Number(btn.dataset.size);
  if (btn.dataset.act === "plus") changeQty(id, size, 1);
  if (btn.dataset.act === "minus") changeQty(id, size, -1);
  if (btn.dataset.act === "remove") removeItem(id, size);
});

$("#cartClear").addEventListener("click", () => {
  if (!cart.length) return;
  if (confirm("¿Seguro que quieres vaciar la bolsa?")) {
    cart = [];
    updateCart();
    showToast("Bolsa vacía");
  }
});

function openCart() {
  closeNav();
  closeModal();
  showOverlay();
  cartEl.classList.add("is-open");
  cartEl.setAttribute("aria-hidden", "false");
  $("#cartClose").focus();
}

function closeCart() {
  if (!cartEl.classList.contains("is-open")) return;
  cartEl.classList.remove("is-open");
  cartEl.setAttribute("aria-hidden", "true");
  if (!modalEl.classList.contains("is-open")) hideOverlay();
}

$("#cartOpen").addEventListener("click", openCart);
$("#cartClose").addEventListener("click", closeCart);

/* =========================================================
   4. VALIDACIÓN Y FORMULARIOS
   ========================================================= */
function setError(input, msg) {
  const field = input.closest(".field");
  field.classList.toggle("has-error", Boolean(msg));
  $(".field__error", field).textContent = msg || "";
}

function validateRequired(input, msg) {
  const ok = input.value.trim().length > 0;
  setError(input, ok ? "" : msg);
  return ok;
}

function validateEmail(input) {
  const v = input.value.trim();
  if (!v) { setError(input, "Escribe tu correo."); return false; }
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  setError(input, ok ? "" : "El correo no parece válido.");
  return ok;
}

$$(".field input").forEach((input) => input.addEventListener("input", () => setError(input, "")));

// Pedido por WhatsApp
$("#checkoutForm").addEventListener("submit", (e) => {
  e.preventDefault();
  if (!cart.length) return;

  const name = $("#custName");
  const city = $("#custCity");
  const address = $("#custAddress");
  const pay = $("#custPay").value;

  const ok = [
    validateRequired(name, "Escribe tu nombre."),
    validateRequired(city, "Escribe tu ciudad."),
    validateRequired(address, "Escribe la dirección.")
  ].every(Boolean);
  if (!ok) return;

  const { subtotal, shipping, total } = getTotals();
  const lines = cart.map(({ id, size, qty }) => {
    const p = getProduct(id);
    return `• ${qty} x ${p.name} (${p.brand}) — Talla ${size} — ${formatCOP(p.price * qty)}`;
  });

  const message = [
    "¡Hola, SUELA! Quiero hacer este pedido:",
    "",
    ...lines,
    "",
    `Subtotal: ${formatCOP(subtotal)}`,
    `Envío: ${shipping === 0 ? "Gratis" : formatCOP(shipping)}`,
    `*Total: ${formatCOP(total)}*`,
    "",
    `Nombre: ${name.value.trim()}`,
    `Ciudad: ${city.value.trim()}`,
    `Dirección: ${address.value.trim()}`,
    `Pago: ${pay}`
  ].join("\n");

  window.open(`https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank", "noopener");
  showToast("Abriendo WhatsApp con tu pedido…");
});

// Newsletter (simulado)
$("#newsletterForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const ok = [
    validateRequired($("#nlName"), "Escribe tu nombre."),
    validateEmail($("#nlEmail"))
  ].every(Boolean);
  if (!ok) return;
  e.currentTarget.reset();
  showToast("¡Listo! Revisa tu correo para el 10% off.");
});

/* =========================================================
   5. INTERFAZ GENERAL
   ========================================================= */
const toastEl = $("#toast");
let toastTimer;

function showToast(text) {
  toastEl.textContent = text;
  toastEl.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("is-visible"), 2400);
}

// Menú móvil
const nav = $("#nav");
const menuToggle = $("#menuToggle");

function closeNav() {
  nav.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
}

menuToggle.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(open));
});

$$(".nav__link").forEach((l) => l.addEventListener("click", closeNav));

// Borde del header al hacer scroll
const header = $("#header");
window.addEventListener("scroll", () => {
  header.classList.toggle("is-scrolled", window.scrollY > 10);
}, { passive: true });

// Enlace activo según la sección visible
const navLinks = $$(".nav__link");
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.forEach((l) => l.classList.toggle("is-active", l.getAttribute("href") === `#${entry.target.id}`));
  });
}, { rootMargin: "-45% 0px -50% 0px" });

$$("main section[id]").forEach((s) => observer.observe(s));

// Ilustraciones de la portada y categorías
$("#heroShoe").innerHTML = shoeSVG("urbanos", "#1b1b22", "#f4f2ec");

const catColors = {
  urbanos: ["#ffffff", "#c6f432"],
  running: ["#ff6b35", "#1b1b22"],
  formales: ["#5a3825", "#c6f432"],
  sandalias: ["#c6f432", "#f4f2ec"]
};

$$(".cat__art").forEach((el) => {
  const cat = el.dataset.shoe;
  el.innerHTML = shoeSVG(cat, ...catColors[cat]);
});

$("#year").textContent = new Date().getFullYear();

/* ---------- Inicio ---------- */
updateFavCount();
renderProducts();
renderCart();
