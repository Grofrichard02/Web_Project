let allProducts = [];
let allCompanies = [];
let filters = { search: '', brands: [], maxPrice: 0 };

async function init() {
    try {
        const [pRes, cRes] = await Promise.all([
            fetch('/getproduct'),
            fetch('/getcompany')
        ]);
        allProducts = await pRes.json();
        allCompanies = await cRes.json();

        const maxPriceInDB = Math.max(...allProducts.map(p => p.Price), 0);
        const range = document.getElementById('priceRange');
        range.max = maxPriceInDB;
        range.value = maxPriceInDB;
        filters.maxPrice = maxPriceInDB;
        
        document.getElementById('maxPriceLabel').innerText = maxPriceInDB.toLocaleString() + " Ft";
        document.getElementById('priceDisplay').innerText = maxPriceInDB.toLocaleString() + " Ft";

        renderBrandList();
        handleInitialUrl();
        applyFilters();
        const pathParts = window.location.pathname.split('/');
        const lastPart = pathParts[pathParts.length - 1];
        
        if (lastPart && !isNaN(lastPart) && lastPart !== "products") {
            showDetails(lastPart);
        }
    } catch (err) {
        console.error("Hiba az indításkor:", err);
    }
}

function getCartKey() {
    const uid = sessionStorage.getItem('uid');
    return uid ? `cart_${uid}` : 'cart_guest'; 
}

function addToCart(productId) {
    const uid = sessionStorage.getItem('uid');
    if (!uid) {
        alert("Kérlek jelentkezz be a vásárláshoz!");
        return;
    }

    const product = allProducts.find(p => p.Id === productId);
    if (!product || product.Ammount <= 0) return;

    const cartKey = getCartKey();
    let cart = JSON.parse(localStorage.getItem(cartKey)) || [];

    const existingProductIndex = cart.findIndex(item => item.Id === productId);

    if (existingProductIndex > -1) {
        if (cart[existingProductIndex].quantity < product.Ammount) {
            cart[existingProductIndex].quantity += 1;
        } else {
            alert("Nincs több készleten!");
            return;
        }
    } else {
        cart.push({
            Id: product.Id,
            Name: product.Name,
            Price: product.Price,
            IMGURL: product.IMGURL,
            Brand: product.Company ? product.Company.Name : 'ALAPVETŐ',
            quantity: 1,
            maxStock: product.Ammount
        });
    }

    localStorage.setItem(cartKey, JSON.stringify(cart));
    applyFilters();
    const detailsView = document.getElementById('product-details-view');
    if (detailsView && detailsView.style.display === 'block') {
        showDetails(productId);
    }
    console.log(`${product.Name} hozzáadva a kosárhoz!`);
}

function renderBrandList() {
    const container = document.getElementById('brandFilters');
    container.innerHTML = allCompanies.map(c => `
        <div class="brand-item ${filters.brands.includes(c.Id) ? 'active' : ''}" onclick="toggleBrand(${c.Id})">
            <i class="fa-regular ${filters.brands.includes(c.Id) ? 'fa-square-check' : 'fa-square'}"></i>
            <span>${c.Name}</span>
        </div>
    `).join('');
}

function toggleBrand(id) {
    const idx = filters.brands.indexOf(id);
    if (idx === -1) filters.brands.push(id);
    else filters.brands.splice(idx, 1);
    
    updateUrl();
    renderBrandList();
    applyFilters();
}

function renderProducts(products) {
    const grid = document.getElementById('productGrid');
    const token = sessionStorage.getItem('token');
    const cartKey = getCartKey();
    const cart = cartKey ? (JSON.parse(localStorage.getItem(cartKey)) || []) : [];

    grid.innerHTML = products.map(p => {
        const isOutOfStock = p.Ammount <= 0;
        const cartItem = cart.find(item => item.Id === p.Id);

        let actionHtml = "";

        if (cartItem && token) {
            actionHtml = `
                <div class="card-qty-control flex-grow-1 justify-content-between">
                    <button class="card-qty-btn" onclick="changeProductQty(${p.Id}, -1)"><i class="fa-solid fa-minus"></i></button>
                    <span class="card-qty-num">${cartItem.quantity}</span>
                    <button class="card-qty-btn" onclick="changeProductQty(${p.Id}, 1)"><i class="fa-solid fa-plus"></i></button>
                </div>
            `;
        } else {
        actionHtml = `
            <button class="btn-cart flex-grow-1" 
                    ${isOutOfStock ? 'disabled' : ''} 
                    onclick="addToCart(${p.Id})">
                <i class="fa-solid ${isOutOfStock ? 'fa-ban' : 'fa-cart-shopping'} me-2"></i> 
                ${isOutOfStock ? 'ELFOGYOTT' : 'KOSÁRBA'}
            </button>
        `;
        }

        return `
        <div class="col animate-fade-in">
            <div class="product-card">
                <div class="card-img-box">
                    <img src="${p.IMGURL}" alt="${p.Name}">
                </div>
                <div class="p-brand">${p.Company ? p.Company.Name : 'ALAPVETŐ'}</div>
                <div class="p-name text-truncate">${p.Name}</div>
                <div class="p-price">${p.Price.toLocaleString()} Ft</div>
                <div class="btn-row">
                    <button class="btn-details" onclick="showDetails(${p.Id})">RÉSZLETEK</button>
                    ${actionHtml}
                </div>
            </div>
        </div>
    `}).join('');
}


function showDetails(productId) {
    const product = allProducts.find(p => p.Id === parseInt(productId));
    
    if (!product) {
        console.error("Termék nem található ID alapján:", productId);
        return;
    }
    const imgEl = document.getElementById('det-img');
    const brandEl = document.getElementById('det-brand');
    const nameEl = document.getElementById('det-name');
    const descEl = document.getElementById('det-desc');
    const priceEl = document.getElementById('det-price');
    const stockDiv = document.getElementById('det-stock');
    const cartBtnContainer = document.querySelector('.details-footer .d-flex.gap-3');

    if (imgEl) imgEl.src = product.IMGURL;
    if (brandEl) brandEl.innerText = product.Company ? product.Company.Name : 'ALAPVETŐ';
    if (nameEl) nameEl.innerText = product.Name;
    if (descEl) descEl.innerText = product.Description;
    if (priceEl) priceEl.innerText = product.Price.toLocaleString() + " Ft";

    const token = sessionStorage.getItem('token');
    const cartKey = getCartKey();
    const cart = cartKey ? (JSON.parse(localStorage.getItem(cartKey)) || []) : [];
    const cartItem = cart.find(item => item.Id === product.Id);
    if (product.Ammount > 0) {
        if (stockDiv) stockDiv.innerHTML = `<span class="in-stock"><i class="fa-solid fa-check-circle"></i> Készleten: ${product.Ammount} db</span>`;
        
        if (cartItem && token) {
            cartBtnContainer.innerHTML = `
                <div class="details-qty-pill">
                    <button onclick="changeProductQty(${product.Id}, -1)">
                        <i class="fa-solid fa-minus"></i>
                    </button>
                    <span class="details-qty-num">${cartItem.quantity}</span>
                    <button onclick="changeProductQty(${product.Id}, 1)">
                        <i class="fa-solid fa-plus"></i>
                    </button>
                </div>
            `;
        } else {
            cartBtnContainer.innerHTML = `
                <button class="btn-cart-lg flex-grow-1" onclick="addToCart(${product.Id})">
                    <i class="fa-solid fa-cart-shopping me-2"></i> KOSÁRBA TESZEM
                </button>
            `;
        }
    } else {
        if (stockDiv) stockDiv.innerHTML = `<span class="out-of-stock"><i class="fa-solid fa-circle-xmark"></i> Jelenleg nincs készleten</span>`;
        cartBtnContainer.innerHTML = `
            <button class="btn-cart-lgd flex-grow-1" disabled>
                <i class="fa-solid fa-ban me-2"></i> NEM RENDELHETŐ
            </button>
        `;
    }
    document.getElementById('product-details-view').style.display = 'block';
    document.body.style.overflow = 'hidden';
    const currentPath = window.location.pathname;
    if (!currentPath.includes(productId)) {
        history.pushState({view: 'details', id: productId}, '', `/products/${productId}`);
    }
}

function changeProductQty(productId, delta) {
    const cartKey = getCartKey();
    if (!cartKey) return;

    let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    const idx = cart.findIndex(item => item.Id === productId);
    const product = allProducts.find(p => p.Id === productId);

     if (idx > -1) {
        if (delta > 0) {
            if (cart[idx].quantity >= product.Ammount) {
                alert(`Sajnos nincs több raktáron! (Maximum: ${product.Ammount} db)`);
                return;
            }
            cart[idx].quantity += 1;
        }
        else {
            cart[idx].quantity -= 1;
            if (cart[idx].quantity <= 0) {
                cart.splice(idx, 1);
            }
        }
    }

    localStorage.setItem(cartKey, JSON.stringify(cart));
    applyFilters(); 
    const detailsView = document.getElementById('product-details-view');
    if (detailsView && detailsView.style.display === 'block') {
        showDetails(productId);
    }
}

function closeDetails() {
    document.getElementById('product-details-view').style.display = 'none';
    document.body.style.overflow = 'auto';
    history.pushState({view: 'catalog'}, '', `/products`);
}
window.onpopstate = function(event) {
    if (event.state && event.state.view === 'details') {
        showDetails(event.state.id);
    } else {
        closeDetails();
    }
};


function applyFilters() {
    const filtered = allProducts.filter(p => {
        const matchesSearch = p.Name.toLowerCase().includes(filters.search.toLowerCase());
        const matchesBrand = filters.brands.length === 0 || filters.brands.includes(p.CompanyId);
        const matchesPrice = p.Price <= filters.maxPrice;
        return matchesSearch && matchesBrand && matchesPrice;
    });
    renderProducts(filtered);
}

function updateUrl() {
    if (filters.brands.length === 1) {
        const brand = allCompanies.find(c => c.Id === filters.brands[0]);
        history.pushState(null, '', `/products/${brand.Name.toLowerCase()}`);
    } else {
        history.pushState(null, '', `/products`);
    }
}

function handleInitialUrl() {
    const path = window.location.pathname.split('/');
    if (path.length > 2 && path[2] !== "") {
        const brandName = decodeURIComponent(path[2]).toLowerCase();
        const found = allCompanies.find(c => c.Name.toLowerCase() === brandName);
        if (found) filters.brands = [found.Id];
    }
}

function toggleFilters() {
    document.getElementById('filterSidebar').classList.toggle('active');
}

document.getElementById('pSearch').addEventListener('input', (e) => {
    filters.search = e.target.value;
    applyFilters();
});

document.getElementById('priceRange').addEventListener('input', (e) => {
    filters.maxPrice = parseInt(e.target.value);
    document.getElementById('priceDisplay').innerText = filters.maxPrice.toLocaleString() + " Ft";
    applyFilters();
});

document.getElementById('resetFilters').addEventListener('click', () => {
    window.location.href = '/products';
});

init();