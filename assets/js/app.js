
const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDOM = document.querySelector('.products-center');

// carrinho
let cart = [];

//buttons
let buttonsDOM = [];

// classe q pega o produdo
class Products {
    async getProducts() {
        try {            
            // puxa o json 
            let result = await fetch('./assets/js/products.json');
            // transforma o json
            let data = await result.json();
            // destrincha o json 
            let products = data.items;
            // metodo map organiza dados do json
            products = products.map(item => {
                const { title, price } = item.fields;
                const { id } = item.sys;
                const { image } = item.fields.image.fields.file.url;
                return { title, price, id, image };
            })
            return products;
        } catch (error) {
            console.log(error);
        }
    }
}

// ui class - mostra produtos - pega os produtos retornados e os mostra
class UI {
    displayProducts(products) {
        // console.log(products)
        let result = '';
        products.forEach(product => {
            result += `
            <article class="product">
            <div class="img-container">
                <img src=${product.image} alt="" class="product-img">
                <button class="bag-btn" data-id=${product.id}>
                    <i class="fas fa-shopping-cart"></i>
                    Incluir no carrinho
                </button>
            </div>
            <h3>${product.title}</h3>
            <h4>${product.price}</h4>
        </article>
            `;
        });
        productsDOM.innerHTML = result;
    }
    getBagButtons() {
        const buttons = [...document.querySelectorAll(".bag-btn")];
        buttonsDOM = buttons;
        buttons.forEach(button => {
            let id = button.dataset.id;
            let inCart = cart.find(item => item.id === id);
            if(inCart) {
                button.innerText = "Já Adicionado";
                button.disabled = true;
            } 
            button.addEventListener('click', (event)=> {
                event.target.innerText = "Já no Carrinho";
                event.target.disabled = true;
                // pega produto de produtos e adiciona ao carrinho
                let cartItem = {...Storage.getProduct(id), amount:1};
                cart = [...cart, cartItem];
                //salve o carrinho no localStorage
                Storage.saveCart(cart);
                // define values do carrinho
                this.setCartValues(cart);
                // mostra item 
                this.addCartItem(cartItem);
                // mostra no carrinho o item
                this.showCart();
            })            
        });
    }
    setCartValues(cart) {
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item => {
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        })
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = itemsTotal;
    }
    addCartItem(item) {
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = `
        <img src=${item.image} alt="" class="img-item">
        <div class="name-item">
            <h4>${item.title}</h4>
            <h5>${item.price}</h5>
            <span class="remove-item" data-id=${item.id}>Excluir</span>
        </div>
        <div class="">
            <fas class="fa-chevron-up" data-id=${item.id}></fas>
            <p class="item-amount">${item.amount}</p>
            <fas class="fa-chevron-down" data-id=${item.id}></fas>
        </div>
        `;
        cartContent.appendChild(div);
        
    }
    showCart() {
        cartOverlay.classList.add('transparentBcg');
        cartDOM.classList.add('showCart');
    }
    setupAPP() {
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
        cartBtn.addEventListener('click', this.showCart);
        closeCartBtn.addEventListener('click', this.hideCart)
    }
    populateCart(cart) {
        cart.forEach(item => this.addCartItem(item));
         
    }
    hideCart() {
        cartOverlay.classList.remove('transparentBcg');
        cartDOM.classList.remove('showCart');
    }
    cartLogic() {
        
    }
}

// local storage
class Storage {
    static saveProducts(products) {
        localStorage.setItem("products", JSON.stringify(products));
    }
    static getProduct(id) {
        let products = JSON.parse(localStorage.getItem('products'));
        return products.find(product => product.id === id)
    }
    static saveCart(cart) {
        localStorage.setItem("cart", JSON.stringify(cart));
    }  
    static getCart() {
        return localStorage.getItem('cart')?JSON.parse(localStorage.getItem('cart')):[];
    }  
}

// cliques
document.addEventListener("DOMContentLoaded", ()=> {
    const ui = new UI();
    const products = new Products();
    //setup app
    ui.setupAPP();
    // get all products 
    products.getProducts().then(products => {
        ui.displayProducts(products)
        Storage.saveProducts(products);
    }).then(() => {
        ui.getBagButtons();
        ui.cartLogic();
    });    
});