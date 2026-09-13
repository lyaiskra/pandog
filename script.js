const WHATSAPP_NUMBER = "50769275725";

const products = [
  {id:"classic", name:"Hotdog Clásico", category:"hotdogs", price:1.25, desc:"Salchicha, pan suave y nuestras salsas clásicas.", emoji:"🌭", featured:true, badge:"CLÁSICO"},
  {id:"special", name:"Hotdog Doble Salchicha", category:"hotdogs", price:1.50, desc:"Salchicha, toppings y salsas de la casa.", emoji:"🌭", featured:true, badge:"MÁS VENDIDO"},
  {id:"combo-1", name:"Combo #1", category:"combos", price:2.00, desc:"Hotdog Clásico + soda.", emoji:"🍟"},
  {id:"combo-2", name:"Combo #2", category:"combos", price:2.25, desc:"Hotdog Doble Salchicha + soda.", emoji:"🍽️", featured:true, badge:"COMBO"},
  {id:"combo-3", name:"Combo #3", category:"combos", price:2.50, desc:"Hotdog + papas + soda.", emoji:"🍟"},
  {id:"combo-4", name:"Combo #4", category:"combos", price:3.00, desc:"Hotdog Clásico + papas con queso + soda.", emoji:"🍟"},
  {id:"fries", name:"Papas Fritas", category:"papas", price:1.50, desc:"Papas crujientes, perfectas para acompañar.", emoji:"🍟"},
  {id:"cheese-fries", name:"Papas con Queso", category:"papas", price:2.25, desc:"Papas crujientes con queso cremoso.", emoji:"🧀"},
  {id:"soda", name:"Soda", category:"bebidas", price:1.00, desc:"Elige tu sabor disponible en el punto de venta.", emoji:"🥤"},
  {id:"juice", name:"Jugo Natural", category:"bebidas", price:1.50, desc:"Bebida refrescante para acompañar tu PANDOG.", emoji:"🧃"},
  {id:"water", name:"Agua", category:"bebidas", price:0.75, desc:"Agua fría.", emoji:"💧"}
];

let cart = JSON.parse(localStorage.getItem("pandogCart") || "[]");
let selectedCategory = "todos";

const $ = id => document.getElementById(id);
const money = n => `$${n.toFixed(2)}`;

function saveCart(){ localStorage.setItem("pandogCart", JSON.stringify(cart)); }

function addToCart(productId, qty=1){
  const p = products.find(x=>x.id===productId);
  if(!p) return;
  const existing = cart.find(x=>x.id===productId);
  if(existing) existing.qty += qty;
  else cart.push({id:p.id, qty});
  saveCart(); renderCart();
  openCart();
}

function removeOne(id){
  const item = cart.find(x=>x.id===id);
  if(!item) return;
  item.qty--;
  if(item.qty <= 0) cart = cart.filter(x=>x.id!==id);
  saveCart(); renderCart();
}

function addOne(id){ addToCart(id); }

function cartTotal(){
  return cart.reduce((sum,item)=>{
    const p=products.find(x=>x.id===item.id);
    return sum + (p ? p.price*item.qty : 0);
  },0);
}

function cartCount(){ return cart.reduce((sum,item)=>sum+item.qty,0); }

function productCard(p){
  return `<article class="product-card">
    ${p.badge ? `<span class="badge">${p.badge}</span>` : ""}
    <div class="product-visual">${p.emoji}</div>
    <div class="product-info">
      <h3>${p.name}</h3>
      <p>${p.desc}</p>
      <div class="product-bottom">
        <span class="price">${money(p.price)}</span>
        <button class="add-btn" onclick="addToCart('${p.id}')">+ AGREGAR</button>
      </div>
    </div>
  </article>`;
}

function renderProducts(){
  $("featuredProducts").innerHTML = products.filter(p=>p.featured).slice(0,3).map(productCard).join("");
  const list = selectedCategory==="todos" ? products : products.filter(p=>p.category===selectedCategory);
  $("menuProducts").innerHTML = list.map(productCard).join("");
}

function renderCart(){
  $("cartCount").textContent = cartCount();
  $("cartTotal").textContent = money(cartTotal());
  $("cartItems").innerHTML = cart.map(item=>{
    const p=products.find(x=>x.id===item.id);
    return `<div class="cart-item">
      <div class="cart-item-icon">${p.emoji}</div>
      <div>
        <h4>${p.name}</h4>
        <p>${money(p.price*item.qty)}</p>
        <div class="qty">
          <button onclick="removeOne('${p.id}')">−</button>
          <b>${item.qty}</b>
          <button onclick="addOne('${p.id}')">+</button>
        </div>
      </div>
      <button aria-label="Eliminar" onclick="cart=cart.filter(x=>x.id!=='${p.id}');saveCart();renderCart()">✕</button>
    </div>`;
  }).join("");
  const empty = cart.length===0;
  $("cartEmpty").style.display = empty ? "block" : "none";
  $("cartItems").style.display = empty ? "none" : "block";
  $("sendWhatsApp").disabled = empty;
  $("sendWhatsApp").style.opacity = empty ? ".5" : "1";
}

function openCart(){ $("cart").classList.add("open"); $("cartOverlay").classList.add("open"); }
function closeCart(){ $("cart").classList.remove("open"); $("cartOverlay").classList.remove("open"); }

function sendWhatsApp(){
  if(!cart.length) return;
  const lines = cart.map(item=>{
    const p=products.find(x=>x.id===item.id);
    return `• ${item.qty}x ${p.name} — ${money(p.price*item.qty)}`;
  });
  const message = `Hola, quiero realizar un pedido en PANDOG.%0A%0A*Pedido:*%0A${lines.join("%0A")}%0A%0A*Total: ${money(cartTotal())}*%0A%0A¿Me confirman el pedido?`;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
}

// Filtros
document.querySelectorAll(".filter").forEach(btn=>{
  btn.addEventListener("click",()=>{
    document.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));
    btn.classList.add("active");
    selectedCategory=btn.dataset.category;
    renderProducts();
  });
});

// Carrito
$("openCart").addEventListener("click",openCart);
$("closeCart").addEventListener("click",closeCart);
$("cartOverlay").addEventListener("click",closeCart);
$("goMenu").addEventListener("click",()=>{closeCart();$("menu").scrollIntoView();});
$("sendWhatsApp").addEventListener("click",sendWhatsApp);
$("heroOrder").addEventListener("click",()=>{$("menu").scrollIntoView({behavior:"smooth"});});

// Menú móvil
$("menuToggle").addEventListener("click",()=>$("nav").classList.toggle("open"));
document.querySelectorAll(".nav a").forEach(a=>a.addEventListener("click",()=> $("nav").classList.remove("open")));

// Constructor de combo
const builder = {
  dog: {name:"PANDOG Clásico", price:2.50},
  side: {name:"Papas Fritas", price:1.50},
  drink: {name:"Soda", price:1.00}
};
function choice(container, options, key){
  $(container).innerHTML = options.map((o,i)=>
    `<button class="choice ${i===0?'selected':''}" data-key="${key}" data-index="${i}">${o.name}</button>`
  ).join("");
  $(container).querySelectorAll(".choice").forEach(btn=>{
    btn.addEventListener("click",()=>{
      $(container).querySelectorAll(".choice").forEach(x=>x.classList.remove("selected"));
      btn.classList.add("selected");
      builder[key]=options[Number(btn.dataset.index)];
      updateBuilderTotal();
    });
  });
}
function updateBuilderTotal(){
  $("builderTotal").textContent=money(builder.dog.price+builder.side.price+builder.drink.price);
}
$("addCombo").addEventListener("click",()=>{
  const total=builder.dog.price+builder.side.price+builder.drink.price;
  const comboName=`Combo armado: ${builder.dog.name} + ${builder.side.name} + ${builder.drink.name}`;
  const id="custom-"+Date.now();
  cart.push({id,qty:1});
  // Store custom combo separately as a temporary product.
  products.push({id,name:comboName,category:"combos",price:total,desc:"Combo personalizado.",emoji:"🍽️"});
  saveCart();renderCart();openCart();
});

choice("dogChoices",[
  {name:"Clásico",price:2.50},{name:"Especial",price:3.50},{name:"BBQ",price:3.75}
],"dog");
choice("sideChoices",[
  {name:"Papas",price:1.50},{name:"Papas + queso",price:2.25}
],"side");
choice("drinkChoices",[
  {name:"Soda",price:1.00},{name:"Jugo",price:1.50},{name:"Agua",price:.75}
],"drink");
updateBuilderTotal();

renderProducts();
renderCart();
