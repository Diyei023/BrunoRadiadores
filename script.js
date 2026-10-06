const products = [
  {id:"BR-001", name:"Radiador de vehículo", category:"Radiadores"},
  {id:"BR-002", name:"Radiador de aluminio", category:"Radiadores"},
  {id:"BR-003", name:"Radiador reforzado", category:"Radiadores"},
  {id:"BR-004", name:"Electroventilador", category:"Refrigeración"},
  {id:"BR-005", name:"Depósito de expansión", category:"Refrigeración"},
  {id:"BR-006", name:"Accesorios de refrigeración", category:"Accesorios"}
];

let cart = JSON.parse(localStorage.getItem("brunoCart") || "{}");
let activeCategory = "Todos";
let query = "";

const grid = document.getElementById("productGrid");
const empty = document.getElementById("emptyState");
const cartCount = document.getElementById("cartCount");
const cartOverlay = document.getElementById("cartOverlay");
const cartItems = document.getElementById("cartItems");
const cartEmpty = document.getElementById("cartEmpty");
const cartTotalItems = document.getElementById("cartTotalItems");
const toast = document.getElementById("toast");

function save(){ localStorage.setItem("brunoCart", JSON.stringify(cart)); }
function countItems(){ return Object.values(cart).reduce((a,b)=>a+b,0); }
function showToast(msg){
  toast.textContent = msg; toast.classList.add("show");
  clearTimeout(window.__toast); window.__toast = setTimeout(()=>toast.classList.remove("show"),1800);
}
function renderProducts(){
  const filtered = products.filter(p =>
    (activeCategory==="Todos" || p.category===activeCategory) &&
    (`${p.name} ${p.id} ${p.category}`).toLowerCase().includes(query.toLowerCase())
  );
  grid.innerHTML = filtered.map(p=>`
    <article class="product-card">
      <div class="product-image"><div class="fake-product" aria-hidden="true"></div></div>
      <div class="product-body">
        <div class="product-category">${p.category}</div>
        <div class="product-title">${p.name}</div>
        <div class="product-code">Código: ${p.id}</div>
        <div class="product-footer">
          <span style="font-size:12px;color:#7b8780">Consultar precio</span>
          <button class="add-button" onclick="addToCart('${p.id}')">Agregar</button>
        </div>
      </div>
    </article>
  `).join("");
  empty.hidden = filtered.length !== 0;
}
function addToCart(id){
  cart[id] = (cart[id] || 0) + 1;
  save(); renderCart(); updateCount(); showToast("Producto agregado al carrito");
}
function changeQty(id, delta){
  cart[id] = (cart[id] || 0) + delta;
  if(cart[id] <= 0) delete cart[id];
  save(); renderCart(); updateCount();
}
function renderCart(){
  const entries = Object.entries(cart);
  cartItems.innerHTML = entries.map(([id,qty])=>{
    const p=products.find(x=>x.id===id); if(!p) return "";
    return `<div class="cart-row">
      <div><strong>${p.name}</strong><small>${p.category} · ${p.id}</small></div>
      <div class="qty"><button onclick="changeQty('${id}',-1)">−</button><b>${qty}</b><button onclick="changeQty('${id}',1)">+</button></div>
    </div>`;
  }).join("");
  cartEmpty.style.display = entries.length ? "none" : "grid";
  cartItems.style.display = entries.length ? "grid" : "none";
  cartTotalItems.textContent = countItems();
}
function updateCount(){ cartCount.textContent = countItems(); }
function openCart(){ cartOverlay.hidden=false; document.body.style.overflow="hidden"; renderCart(); }
function closeCart(){ cartOverlay.hidden=true; document.body.style.overflow=""; }

document.getElementById("searchInput").addEventListener("input",e=>{query=e.target.value;renderProducts();});
document.querySelectorAll(".filter").forEach(btn=>btn.addEventListener("click",()=>{
  document.querySelectorAll(".filter").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active"); activeCategory=btn.dataset.category; renderProducts();
}));
document.getElementById("openCart").addEventListener("click",openCart);
document.getElementById("closeCart").addEventListener("click",closeCart);
cartOverlay.addEventListener("click",e=>{if(e.target===cartOverlay)closeCart();});
document.getElementById("menuButton").addEventListener("click",()=>document.getElementById("mainNav").classList.toggle("open"));
document.querySelectorAll(".nav a").forEach(a=>a.addEventListener("click",()=>document.getElementById("mainNav").classList.remove("open")));
document.getElementById("clearCart").addEventListener("click",()=>{cart={};save();renderCart();updateCount();showToast("Carrito vacío");});
document.getElementById("sendCart").addEventListener("click",()=>{
  const entries=Object.entries(cart);
  if(!entries.length){showToast("Agregá al menos un producto");return;}
  const lines=entries.map(([id,qty])=>{const p=products.find(x=>x.id===id);return `• ${p.name} (${p.id}) x${qty}`;});
  const msg=`Hola Bruno Radiadores, quiero consultar por estos productos:%0A%0A${lines.join("%0A")}%0A%0A¿Me pueden pasar disponibilidad y precio?`;
  window.open(`https://wa.me/59894814519?text=${msg}`,"_blank","noopener");
});
document.getElementById("year").textContent = new Date().getFullYear();
renderProducts(); renderCart(); updateCount();
