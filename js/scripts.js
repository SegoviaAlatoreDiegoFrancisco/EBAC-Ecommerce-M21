
//--------|Elementos del index.html como variables de JS
const cartStorageKey="adidas-store-cart";
const cart = document.querySelector(".cart");
const cartItems = cart.querySelector(".cart__items");
const cartTotal = cart.querySelector(".cart__total span");
const cartCount = document.querySelector(".header__cart-count");
const cartButton= document.querySelector(".header__icon--cart");
const cartCloseButton = cart.querySelector(".cart__close");

const menu = document.querySelector(".menu");
const menuButton = document.querySelector(".header__icon--menu");
const menuCloseButton = menu.querySelector(".menu__close");

//------------|  Carga del carro desde el localStorage y validación de los datos
function loadCart(){
    try{
        const savedCart = JSON.parse(localStorage.getItem(cartStorageKey)||"[]");
        if(!Array.isArray(savedCart)){
            //...si el carro está vacio
            throw new Error("El contenido no está guardado en una lista.");
        }
        return savedCart.filter(item => item && 
            typeof item.id === "string" &&
            typeof item.name ==="string" && 
            typeof item.image ==="string" &&
            Number.isFinite(item.price) &&
            Number.isInteger(item.quantity)&&
            item.quantity > 0
    );
    }catch(error){
        //...o si hay algun error con los datos, retorna un carro vacio
        console.error("No se cargó el carrito de compras: ", error);
        return [];
    }
}

let productsInCart = loadCart();
//---------|Se guardan los productos en el navegador con setItem
function saveCart(){
    try{
        localStorage.setItem(cartStorageKey, JSON.stringify(productsInCart));
    }catch(error){
        console.error("No se pudo guardar el carrito en el almacenamiento local.",error);

    }
}

//-------formatea un parametro numerico a pesos
function formatPrice(price){
    return new Intl.NumberFormat("es-MX",{
        style:"currency",
        currency:"MXN"
    }).format(price);
}

//-----------| Actualiza el contenido del carrito, cantidad y total de precio de los productos, actualiza el contador, 
// muestra un mensaje de "carrito vacío", genera una fila por producto y agrega los datos de cada producto con su boton 
// para eliminarlo
function  renderCart(){
    cartItems.replaceChildren();
    const quantity = productsInCart.reduce((total, item) => total + item.quantity,0);
    const total = productsInCart.reduce((sum, item) => sum + item.price * item.quantity,0);

    cartCount.textContent = quantity;
    cartButton.setAttribute("aria-label",`Abrir carrito ${quantity} productos`);
    cartTotal.textContent = formatPrice(total);
     
    if(productsInCart.length === 0 ){
        const emptyMessage = document.createElement("p");
        emptyMessage.className = "cart__empty";
        emptyMessage.textContent = "No hay productos en el carrito";
        cartItems.append(emptyMessage);
        return;
    }

    productsInCart.forEach(item => {
        const row = document.createElement("div");
        row.className = "cart__item";

        const image = document.createElement("img");
        image.className ="cart__image";
        image.src = item.image;
        image.alt = item.name;

        const name = document.createElement("p");
        name.className = "cart__name";
        name.textContent = `${item.name} x ${item.quantity}`;

        const price = document.createElement("p");
        price.className = "cart__price";
        price.textContent = formatPrice(item.price * item.quantity);

        const removeButton = document.createElement("button");
        removeButton.className = "cart__remove";
        removeButton.type = "button";
        removeButton.setAttribute("aria-label", `Quitar ${item.name} del carrito`);

        const removeIcon = document.createElement("img");
        removeIcon.className = "cart__remove-icon";
        removeIcon.src ="./img/tashcan.png";
        removeIcon.alt="";

        removeButton.append(removeIcon);
        
        removeButton.addEventListener("click", () => {
            productsInCart = productsInCart.filter(product => product.id !== item.id);
        
            saveCart();
            renderCart();
        });
        row.append(image,name,price,removeButton);
        cartItems.append(row);
    });
}

//----------|Cambia el estado y acceso de los paneles por la clase CSS de apertura
function setPanelOpen(panel, button, openClass, isOpen){
    panel.classList.toggle(openClass,isOpen);
    panel.setAttribute("aria-hidden", String(!isOpen));
    panel.inert = !isOpen;
    button.setAttribute("aria-expanded", String(isOpen));
}

//------------|Abre el menú ó carrito y los alterna
function openPanel(panel, button, openClass){
    const isOpen = !panel.classList.contains(openClass);
    if (panel === cart){
        setPanelOpen(menu,menuButton,"menu__show",false);
    }else{
        setPanelOpen(cart,cartButton,"cart__show",false);
    }

    setPanelOpen(panel,button,openClass,isOpen);
}

//----------|Se recorre cada tarjeta definida con .product-card en el HTML y se obtiene nombre, imagen, precio (casteado) e id del producto
document.querySelectorAll(".product-card").forEach(productCard=> {
    const addButton = productCard.querySelector(".product-card__addProduct");
    //...ignora botones deshabilitados
    if(!addButton || addButton.disabled){
        return;
    }
    addButton.addEventListener("click",() => {
        const name = productCard.querySelector(".product-card__title").textContent.trim();
        const image = productCard.querySelector(".product-card__image").getAttribute("src");
        const priceText = productCard.querySelector(".product-card__price").textContent;
        const price = Number(priceText.replace(/[$,]/g, ""));
        const id = productCard.dataset.productId;
        //...valida id y precio 
        if(!id || !Number.isFinite(price)){
            return;
        }

        const existingProduct = productsInCart.find(item => item.id === id);
        //...incrementa la cantidad si el producto ya se encuentra en el carrito
        if (existingProduct){
            existingProduct.quantity += 1;
        }else{
            //...un nuevo producto se agrega con la cantidad de 1
            productsInCart.push({id,name,image,price,quantity:1});
        }
        //------------|guarda el cartrito y lo renderiza
        saveCart();
        renderCart();
    });
});

cartButton.setAttribute ("aria-expanded", "false");
menuButton.setAttribute("aria-expanded", "false" );

cartButton.addEventListener("click", () => openPanel(cart, cartButton, "cart__show"));
menuButton.addEventListener("click", () => openPanel(menu,menuButton, "menu__show"));

cartCloseButton.addEventListener("click", () => { setPanelOpen(cart, cartButton, "cart__show",false)});
menuCloseButton.addEventListener("click", () => { setPanelOpen(menu, menuButton, "menu__show",false)});

const productsLink = menu.querySelector(".menu__link[href='#products']");

if(productsLink){
    productsLink.addEventListener("click", () => {
        setPanelOpen(
            menu,
            menuButton,
            "menu__show",
            false
        );
    });
}
//--------|Carga el carrito cuando se carga la página
renderCart();