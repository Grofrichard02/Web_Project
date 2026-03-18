let cartKey = "";
let cart = [];

document.addEventListener("DOMContentLoaded", () => {
    const uid = sessionStorage.getItem('uid');

    if (!uid) {
        window.location.href = "login";
        return;
    }
    cartKey = `cart_${uid}`;
    cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    renderCart();
    loadSavedAddresses();
});

function saveCart() {
    if (cartKey) {
        localStorage.setItem(cartKey, JSON.stringify(cart));
    }
}

function renderCart() {
    const list = document.getElementById('cartItemsList');
    const emptyMsg = document.getElementById('emptyCartMsg');
    
    if (cart.length === 0) {
        list.innerHTML = "";
        emptyMsg.classList.remove('d-none');
        document.getElementById('grossTotal').innerText = "0 Ft";
        document.getElementById('netTotal').innerText = "0 Ft";
        document.getElementById('taxTotal').innerText = "0 Ft";
        return;
    }

    emptyMsg.classList.add('d-none');
    list.innerHTML = cart.map((item, index) => `
        <div class="cart-item">
            <div class="cart-img-box">
                <img src="${item.IMGURL}" alt="${item.Name}">
            </div>
            <div class="flex-grow-1">
                <span class="text-primary small fw-bold text-uppercase">${item.Brand}</span>
                <h5 class="text-white m-0">${item.Name}</h5>
                <p class="text-dim text-light m-0" style="opacity: 0.7;">${item.Price.toLocaleString()} Ft / db</p>
            </div>
            <div class="qty-control">
                <button class="qty-btn" onclick="changeQty(${index}, -1)"><i class="fa-solid fa-minus"></i></button>
                <span class="fw-bold text-white">${item.quantity}</span>
                <button class="qty-btn" onclick="changeQty(${index}, 1)"><i class="fa-solid fa-plus"></i></button>
            </div>
            <div class="fw-bold text-white" style="min-width: 100px; text-align: right;">
                ${(item.Price * item.quantity).toLocaleString()} Ft
            </div>
            <div class="remove-item" onclick="deleteItem(${index})">
                <i class="fa-solid fa-xmark"></i>
            </div>
        </div>
    `).join('');

    calculateSummary();
}

function changeQty(index, delta) {
    const item = cart[index];
    if (delta > 0) {
        if (item.quantity >= item.maxStock) {
            alert(`Sajnos ebből a termékből nincs több készleten! (${item.maxStock} db)`);
            return;
        }
        item.quantity += 1;
    } 
    else {
        item.quantity -= 1;
        if (item.quantity < 1) {
            deleteItem(index);
            return;
        }
    }

    saveCart();
    renderCart();
}

function deleteItem(index) {
    cart.splice(index, 1);
    saveCart();
    renderCart();
}

function calculateSummary() {
    const grossTotal = cart.reduce((sum, item) => sum + (item.Price * item.quantity), 0);
    const netTotal = Math.round(grossTotal / 1.27);
    const taxTotal = grossTotal - netTotal;

    document.getElementById('grossTotal').innerText = grossTotal.toLocaleString() + " Ft";
    document.getElementById('netTotal').innerText = netTotal.toLocaleString() + " Ft";
    document.getElementById('taxTotal').innerText = taxTotal.toLocaleString() + " Ft";
}

async function loadSavedAddresses() {
    const token = sessionStorage.getItem('token');
    const alertBox = document.getElementById('noAddressAlert');
    const fieldsWrapper = document.getElementById('addressFieldsWrapper');
    const checkoutBtn = document.querySelector('button[onclick="checkout()"]');

    try {
        const response = await fetch('/getMyAddresses', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();
        if (!data.shipping) {
            alertBox.classList.remove('d-none');
            fieldsWrapper.classList.add('d-none');
            currentAddressId = null;
            if (checkoutBtn) checkoutBtn.style.opacity = "0.5";
        } else {
            alertBox.classList.add('d-none');
            fieldsWrapper.classList.remove('d-none');
            if (checkoutBtn) checkoutBtn.style.opacity = "1";

            currentAddressId = data.shipping.Id;
            document.getElementById('shipCity').value = data.shipping.City || "";
            document.getElementById('shipZip').value = data.shipping.Zip || "";
            document.getElementById('shipAddr').value = data.shipping.Address1 || "";
            if (data.billing) {
                document.getElementById('billCity').value = data.billing.City || "";
                document.getElementById('billZip').value = data.billing.Zip || "";
                document.getElementById('billAddr').value = data.billing.Address1 || "";

                if (data.shipping.Address1 !== data.billing.Address1) {
                    document.getElementById('sameAsBilling').checked = false;
                    toggleBilling();
                }
            }
        }
    } catch (err) {
        console.error("Hiba a címek betöltésekor:", err);
    }
}

function toggleBilling() {
    const fields = document.getElementById('billingFields');
    const checked = document.getElementById('sameAsBilling').checked;
    if (checked) fields.classList.add('d-none');
    else fields.classList.remove('d-none');
}

document.getElementById('cardNumber')?.addEventListener('input', function (e) {
    let val = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    let matches = val.match(/\d{4,16}/g);
    let match = matches && matches[0] || '';
    let parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
        parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
        e.target.value = parts.join(' ');
    } else {
        e.target.value = val;
    }
});

document.getElementById('cardExpiry')?.addEventListener('input', function (e) {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length >= 2) {
        let month = parseInt(val.substring(0, 2));
        if (month > 12) month = 12;
        if (month === 0) month = 1;
        val = month.toString().padStart(2, '0') + val.substring(2);
    }
    if (val.length >= 4) {
        let year = parseInt(val.substring(2, 4));
        if (year < 26) year = 26;
        val = val.substring(0, 2) + year.toString();
    }
    if (val.length > 2) {
        e.target.value = val.substring(0, 2) + ' / ' + val.substring(2, 4);
    } else {
        e.target.value = val;
    }
});

async function checkout() {
    if (cart.length === 0) return alert("Üres a kosarad!");

    const token = sessionStorage.getItem('token');
    if (!token) return alert("A rendeléshez bejelentkezés szükséges!");
    const shipCity = document.getElementById('shipCity').value.trim();
    const shipZip = document.getElementById('shipZip').value.trim();
    const shipAddr = document.getElementById('shipAddr').value.trim();
    if (!currentAddressId) {
        return alert("Rendelés előtt kérjük rögzítse szállítási címét a Beállítások menüben!");
    }

    if (!shipCity || !shipZip || !shipAddr) {
        return alert("Kérlek töltsd ki a szállítási adatokat!");
    }
    if (!document.getElementById('sameAsBilling').checked) {
        const billCity = document.getElementById('billCity').value.trim();
        const billZip = document.getElementById('billZip').value.trim();
        const billAddr = document.getElementById('billAddr').value.trim();
        if (!billCity || !billZip || !billAddr) {
            return alert("Kérlek töltsd ki a számlázási adatokat is!");
        }
    }
    const cardName = document.getElementById('cardName').value.trim();
    const cardNumber = document.getElementById('cardNumber').value.trim();
    const cardExpiry = document.getElementById('cardExpiry').value.trim();
    const cardCvv = document.getElementById('cardCvv').value.trim();

    if (!cardName || !cardNumber || !cardExpiry || !cardCvv) {
        return alert("Kérlek add meg a bankkártya adatokat a fizetéshez!");
    }
    try {
        const response = await fetch('/createOrder', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                cart: cart,
                AddressId: currentAddressId
            })
        });

        const result = await response.json();

        if (response.ok) {
            const currentUserEmail = sessionStorage.getItem('userEmail') || "nincs megadva";
            
            const purchaseData = {
                orderId: result.orderId,
                items: [...cart], 
                totals: {
                    gross: document.getElementById('grossTotal').innerText,
                    net: document.getElementById('netTotal').innerText,
                    tax: document.getElementById('taxTotal').innerText
                },
                buyer: {
                    name: cardName,
                    email: currentUserEmail,
                    address: `${shipZip} ${shipCity}, ${shipAddr}`
                },
                date: new Date().toLocaleString('hu-HU')
            };
            sessionStorage.setItem('lastPurchase', JSON.stringify(purchaseData));

            alert("Sikeres vásárlás! A rendelését rögzítettük.");
            if (cartKey) {
                localStorage.removeItem(cartKey);
            }
            cart = [];
            window.location.href = "success"; 
        } else {
            alert("Hiba történt a rendelés leadásakor: " + result.message);
        }

    } catch (error) {
        console.error("Rendelési hiba:", error);
        alert("Hálózati hiba történt! Kérjük, próbálja meg később.");
    }
}