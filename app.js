const client = contentful.createClient({
    space: "xg0z05bj88gb",
    accessToken: "QG0MG5a6kK0XBmcfeKL7q_P1Ku-FajFNCiFXbZlBDK4"
});

const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDOM = document.querySelector('.products-center');
const navbar = document.querySelector('.navbar');
const icons = document.querySelectorAll('.nav-icon');
const chk = document.getElementById('chk');
const overlay = document.getElementById('overlay');

let cart = [];
let buttonsDOM = [];

class Products{
    async getProducts(){
        try {
            let contentful = await client.getEntries({
                content_type: "comfyHouseProduct"
            });

            // let result = await fetch('products.json');
            // let data = await result.json();
            // let products = data.items;

            let products = contentful.items;
            products = products.map(item =>{
                const {title, price} = item.fields;
                const {id} = item.sys
                const image = item.fields.image.fields.file.url;
                return {title, price, id, image}
            });
            return products;
        } catch (error) {
            console.log(error);
        }
    }
}

class UI{
    displayProducts(products){
        let result ='';
        products.forEach(product =>{
            result += `
            <article class="product">
                <div class="img-container">
                    <img src=${product.image} alt="product" class="product-img">
                    <button class="bag-btn" data-id=${product.id}>
                        <i class="fas fa-shopping-card"></i>
                        Add To Cart
                    </button>
                </div>
                <h3 class="h3">${product.title}</h3>
                <h4>£${product.price}</h4>
            </article>
            `;
        });
        productsDOM.innerHTML = result;
    }

    getBagButtons(){
        const buttons = [...document.querySelectorAll('.bag-btn')];
        buttonsDOM = buttons;
        buttons.forEach(button =>{
            let id = button.dataset.id;
            let inCart = cart.find(item => item.id === id);
            if(inCart){
                button.innerText = 'In Cart';
                button.disabled = true;
            }
            button.addEventListener('click', event =>{
                event.target.innerText = 'In Cart';
                event.target.disabled = true;

                let cartItem = {...Storage.getProduct(id), amount:1};
                cart = [...cart, cartItem];
                Storage.saveCart(cart)
                this.setCartValues(cart);
                this.addCartItem(cartItem);
                this.showCart();
            });
        });
    }

    setCartValues(cart){
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item =>{
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount
        });
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2))
        cartItems.innerText = itemsTotal;
    }

    addCartItem(item){
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = `
            <img src=${item.image} alt="product">
            <div>
                <h4>${item.title}</h4>
                <h5>£${item.price}</h5>
                <span class="remove-item" data-id=${item.id}>Remove</span>
            </div>
            <div>
                <i class="fas fa-chevron-up" data-id=${item.id}></i>
                <p class="item-amount">${item.amount}</p>
                <i class="fas fa-chevron-down" data-id=${item.id}></i>
            </div>
        `;
        cartContent.appendChild(div);
    }

    showCart(){
        cartOverlay.classList.add('transparentBcg');
        cartDOM.classList.add('showCart');
    }

    hideCard(){
        cartOverlay.classList.remove('transparentBcg');
        cartDOM.classList.remove('showCart');
    }

    setupAPP(){
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
        cartBtn.addEventListener('click', this.showCart)
        closeCartBtn.addEventListener('click', this.hideCard);
    }

    populateCart(cart){
        cart.forEach(item =>{this.addCartItem(item)});
    }

    cartLogic(){
        clearCartBtn.addEventListener('click', () =>{
            this.clearCart();
        });

        cartContent.addEventListener('click', event => {
            if(event.target.classList.contains('remove-item')){
                let removeItem = event.target;
                let id = removeItem.dataset.id;
                this.removeItem(id);
                cartContent.removeChild(removeItem.parentElement.parentElement);
            }else if(event.target.classList.contains('fa-chevron-up')){
                let addAmount = event.target;
                let id = addAmount.dataset.id;
                let tempItem  = cart.find (item => item.id === id);
                tempItem.amount = tempItem.amount + 1;
                Storage.saveCart(cart);
                this.setCartValues(cart);
                addAmount.nextElementSibling.innerText = tempItem.amount;
            }else if(event.target.classList.contains('fa-chevron-down')){
                let lowerAmount = event.target;
                let id = lowerAmount.dataset.id;
                let tempItem  = cart.find (item => item.id === id);
                tempItem.amount = tempItem.amount - 1;
                if(tempItem.amount > 0){
                    Storage.saveCart(cart);
                    this.setCartValues(cart);
                    lowerAmount.previousElementSibling.innerText = tempItem.amount;
                }else{
                    cartContent.removeChild(lowerAmount.parentElement.parentElement);
                    this.removeItem(id)
                }
            }
        });
    }

    clearCart(){
        let cartItems = cart.map(item => item.id);
        cartItems.forEach(id => this.removeItem(id));
        while(cartContent.children.length > 0){
            cartContent.removeChild(cartContent.children[0])
        }
        this.hideCard();
    }

    removeItem(id){
        cart = cart.filter(item => item.id !== id);
        this.setCartValues(cart);
        Storage.saveCart(cart);
        let button = this.getSingleButton(id);
        button.disabled = false;
        button.innerHTML = `<i class="fas fa-shopping-cart"></i>Add To Cart`;
    }

    getSingleButton(id){
        return buttonsDOM.find(button => button.dataset.id === id);
    }

}

class Storage{
    static saveProduct(products){
        localStorage.setItem('products', JSON.stringify(products));
    }

    static getProduct(id){
        let products = JSON.parse(localStorage.getItem('products'));
        return products.find(product => product.id === id)
    }

    static saveCart(){
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    static getCart(){
        return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
    }

}

document.addEventListener('DOMContentLoaded', () => {
    const ui = new UI();
    const products = new Products();

    ui.setupAPP();

    products.getProducts().then(products => {
        ui.displayProducts(products);
        Storage.saveProduct(products);
    }).then(() =>{
        ui.getBagButtons();
        ui.cartLogic();
    });
});

window.addEventListener('scroll', function () {
    const windowPosition = window.scrollY > 0;
    navbar.classList.toggle('scrolling-active', windowPosition);
    
    const iconArr = Array.prototype.slice.call(icons);
    iconArr.forEach(icon =>{
        icon.classList.toggle('scrolling-active', windowPosition);
    });
    document.querySelector('.label').classList.toggle('dark', windowPosition);
    document.querySelector('.ball').classList.toggle('dark', windowPosition);
});

chk.addEventListener('change', () => {
    document.body.classList.toggle('dark');
    document.getElementById('Products').classList.toggle('dark');
    $('.overlay').toggleClass('menu-open');
    $('body').toggleClass('stop-scrolling')
    $('.menu').toggleClass('active');

    document.querySelectorAll('.h3').forEach(Heading => {
        Heading.classList.toggle('dark');
    });
});

$('.overlay').on('click', function () {
    $('.overlay').toggleClass('menu-open');
    $('body').toggleClass('stop-scrolling')
    $('.menu').toggleClass('active');
});


$('.menu').on('click', function () {
    $(this).toggleClass('active');
    $('.overlay').toggleClass('menu-open');
    $('body').toggleClass('stop-scrolling')
});

$('.nav a').on('click', function () {
    $('.menu').toggleClass('active');
    $('.overlay').toggleClass('menu-open');
});