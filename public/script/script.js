//2811 sor css

let hasShippingAddress = false;
let hasBillingAddress = false;

(function injectBaseStyles() {
    const style = document.createElement('style');
    style.textContent = `
        
        #navButtons, #LoggedInNavButtons {
            display: none; 
            list-style: none;
            padding: 0;
            gap: 12px;
            flex-shrink: 0;
        }
        header nav {
            display: flex;
            align-items: center; 
            justify-content: space-between;
            padding: 0 40px;
            width: 98%;
            max-width: 95.8%;
            height: 100px; 
        }
        
        .header-profile-link, .header-cart-link, #LoggedInNavButtons button {
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgb(245, 245, 245) !important;
            padding: 8px 16px;
            border-radius: 8px;
            text-decoration: none;
            color: #334155;
            font-weight: 600;
            font-family: 'Jost', sans-serif;
            transition: all 0.2s ease;
            border: none !important;
            box-shadow: none !important;
            cursor: pointer;
            height: 42px;
            outline: none;
        }

        #navRegisterBtn {
            font-family: "Jost", sans-serif;
            font-weight: 700;
            background-color: #d3d3d3;
            color: rgb(141, 141, 141);
            font-size: 25px;
            border: #d3d3d3 solid 1px;
            border-radius: 10px;
            width: 110px;
            height: 50px;
            transition: 300ms ease-in-out;
        }
        #navRegisterBtn a{

            color: rgb(141, 141, 141);

        }
        #navRegisterBtn:hover {
            background-color: #e7e7e7;
            border: #e7e7e7 solid 1px;
        }

        .header-profile-link {
            padding: 5px 16px 5px 6px;
        }

        .header-cart-link {
            padding: 0 14px;
            font-size: 18px;
        }

        // .header-profile-link:hover, .header-cart-link:hover,  {
            background: #ededed !important;
            transform: translateY(-1px);
        }

        .header-pfp {
            width: 32px;
            height: 32px;
            border-radius: 50% !important;
            object-fit: cover;
            margin-right: 10px;
            background: #cbd5e1;
            display: block;
        }

        .header-username {
            font-size: 14px;
            max-width: 100px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .cart-icon {
            color: #334155;
            line-height: 1;
        }

        #navButtons button a, #LoggedInNavButtons button a {
            text-decoration: none;
            color: inherit;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
        }
        #navRegisterBtn {
    font-family: "Jost", sans-serif;
    font-weight: 700;
    background-color: #d3d3d3;
    color: rgb(141, 141, 141);
    font-size: 25px;
    border: #d3d3d3 solid 1px;
    border-radius: 10px;
    width: 110px;
    height: 50px;
    transition: 300ms ease-in-out;
}
#navRegisterBtn a{

    color: rgb(141, 141, 141);

}
#navRegisterBtn:hover {
    background-color: #e7e7e7;
    border: #e7e7e7 solid 1px;
}

#navLoginBtn  {
    font-family: "Jost", sans-serif;
    font-weight: 700;
    background-color: #2646ff;
    color: white;
    border: #2646ff solid 1px;
    font-size: 25px;
    border-radius: 10px;
    width: 85px;
    height: 50px;
    transition: 300ms ease-in-out;
}

#navLoginBtn  a{

    color: white;

}

#navLoginBtn:hover {
    background-color: #566fff;
    border: #566fff solid 1px;
}
    `;
    document.head.appendChild(style);
})();

document.addEventListener('DOMContentLoaded', () => {
    const elements = {
        registerBtn: document.getElementById('register2'),
        loginBtn: document.getElementById('loginBtn'),
        profUsername: document.getElementById('profUsername'),
        editUsernameBtn: document.getElementById('editUsernameBtn'),
        editEmailBtn: document.getElementById('editEmailBtn'),
        fileInput: document.getElementById('fileInput'),
        changePassBtn: document.getElementById('changePassBtn'),
        savePassBtn: document.getElementById('savePassBtn'),
        passFields: document.getElementById('passFields'),
        saveAddressBtn: document.getElementById('saveAllAddressesBtn'),
        sameAsBillingCheck: document.getElementById('sameAsBilling'),
        billingSection: document.getElementById('billingAddressSection'),
        billingToggleContainer: document.querySelector('.billing-toggle-container')
    };
    const token = sessionStorage.getItem("token");
    const navButtons = document.getElementById('navButtons');
    if(!token){
        if (navButtons) {
            navButtons.innerHTML = `
            <li><button id="navLoginBtn"><a href="login">Login</a></button></li>
            <li><button id="navRegisterBtn"><a href="register">Register</a></button></li>`;
            navButtons.style.display = 'flex';
        }
    }

    updateHeader();

    if (elements.registerBtn) elements.registerBtn.onclick = userRegister;
    if (elements.loginBtn) elements.loginBtn.onclick = userLogin;

    if (elements.profUsername) {
        loadUserProfile();
        if (elements.editUsernameBtn) elements.editUsernameBtn.onclick = () => toggleEdit('profUsername', 'editUsernameBtn');
        if (elements.editEmailBtn) elements.editEmailBtn.onclick = () => toggleEdit('profEmail', 'editEmailBtn');
        if (elements.fileInput) elements.fileInput.onchange = uploadProfilePic;
        if (elements.changePassBtn) {
            elements.changePassBtn.onclick = () => {
                const isHidden = elements.passFields.style.display === 'none' || elements.passFields.style.display === '';
                elements.passFields.style.display = isHidden ? 'flex' : 'none';
            };
        }
        if (elements.savePassBtn) elements.savePassBtn.onclick = updatePassword;
    }

    if (elements.saveAddressBtn) {
        if (!sessionStorage.getItem("token")) {
            window.location.href = "login";
            return;
        }
        loadUserAddresses();
        elements.saveAddressBtn.onclick = saveAddresses;
        if (elements.sameAsBillingCheck) {
            elements.sameAsBillingCheck.onchange = (e) => {
                if (elements.billingSection) {
                    elements.billingSection.style.display = e.target.checked ? 'none' : 'block';
                }
            };
        }
    }
});

async function updateHeader() {
    const token = sessionStorage.getItem("token");
    const navButtons = document.getElementById('navButtons');
    const loggedInNav = document.getElementById('LoggedInNavButtons');

    if (!token) {
        if (navButtons) navButtons.style.display = 'flex';
        if (loggedInNav) loggedInNav.style.display = 'none';
        return;
    }

    try {
        const request = await fetch("/getUser", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (request.ok) {
            const user = await request.json();
            if (loggedInNav) {
                loggedInNav.innerHTML = `
                    <li>
                        <a href="profil" class="header-profile-link">
                            <img src="${user.Pfp || "/uploads/default-avatar.png"}" class="header-pfp" alt="P">
                            <span class="header-username">${user.Username}</span>
                        </a>
                    </li>
                    <li>
                        <a href="cart" class="header-cart-link">
                            <span class="cart-icon">🛒</span>
                        </a>
                    </li>
                `;
                loggedInNav.style.display = 'flex';

            }
        } else {
            sessionStorage.removeItem("token");
            if (navButtons) navButtons.style.display = 'flex';
            if (loggedInNav) loggedInNav.style.display = 'none';
        }
    } catch (e) {
        if (navButtons) navButtons.style.display = 'flex';
        if (loggedInNav) loggedInNav.style.display = 'none';
    }
}

async function loadUserAddresses() {
    const token = sessionStorage.getItem("token");
    if (!token) return;
    const billingSection = document.getElementById('billingAddressSection');
    const billingToggle = document.querySelector('.billing-toggle-container');
    try {
        const [resShip, resBill] = await Promise.all([
            fetch("/AddressGets", { headers: { "Authorization": `Bearer ${token}` } }),
            fetch("/BillingAddressGets", { headers: { "Authorization": `Bearer ${token}` } })
        ]);
        if (resShip.ok) {
            const data = await resShip.json();
            if (document.getElementById('shipCity')) document.getElementById('shipCity').value = data.City || "";
            if (document.getElementById('shipZip')) document.getElementById('shipZip').value = data.Zip || "";
            if (document.getElementById('shipAddress1')) document.getElementById('shipAddress1').value = data.Address1 || "";
            hasShippingAddress = true;
        }
        if (resBill.ok) {
            const data = await resBill.json();
            if (document.getElementById('billCity')) document.getElementById('billCity').value = data.City || "";
            if (document.getElementById('billZip')) document.getElementById('billZip').value = data.Zip || "";
            if (document.getElementById('billAddress1')) document.getElementById('billAddress1').value = data.Address1 || "";
            hasBillingAddress = true;
        }
        if (hasShippingAddress || hasBillingAddress) {
            if (billingToggle) billingToggle.style.display = 'none';
            if (billingSection) billingSection.style.display = 'block';
        }
    } catch (e) { console.error(e); }
}

async function saveAddresses() {
    const token = sessionStorage.getItem("token");
    const sameCheck = document.getElementById('sameAsBilling');
    const saveBtn = document.getElementById('saveAllAddressesBtn');

    const shipData = {
        City: document.getElementById('shipCity').value,
        Zip: document.getElementById('shipZip').value,
        Address1: document.getElementById('shipAddress1').value
    };

    if (!shipData.City || !shipData.Zip || !shipData.Address1) {
        alert("Kérlek töltsd ki a szállítási címet!");
        return;
    }

    saveBtn.disabled = true;
    saveBtn.innerText = "Mentés...";

    try {
        const shipUrl = hasShippingAddress ? "/EditAddress" : "/AddressRegister";
        const shipMethod = hasShippingAddress ? "PUT" : "POST";
        await fetch(shipUrl, {
            method: shipMethod,
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify(shipData)
        });
        hasShippingAddress = true;

        let billData = (sameCheck && sameCheck.checked) ? shipData : {
            City: document.getElementById('billCity').value,
            Zip: document.getElementById('billZip').value,
            Address1: document.getElementById('billAddress1').value
        };

        const billUrl = hasBillingAddress ? "/EditBillingAddress" : "/BillingAddressRegister";
        const billMethod = hasBillingAddress ? "PUT" : "POST";
        await fetch(billUrl, {
            method: billMethod,
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify(billData)
        });
        hasBillingAddress = true;
        
        alert("Címek elmentve!");
    } catch (err) { alert("Hiba a mentés során."); }
    saveBtn.disabled = false;
    saveBtn.innerText = "Címek mentése";
}

async function loadUserProfile() {
    const token = sessionStorage.getItem("token");
    if (!token) return;
    try {
        const request = await fetch("/getUser", { headers: { "Authorization": `Bearer ${token}` } });
        if (request.ok) {
            const data = await request.json();
            if (document.getElementById('profUsername')) document.getElementById('profUsername').value = data.Username || "";
            if (document.getElementById('profEmail')) document.getElementById('profEmail').value = data.Email || "";
            if (data.Pfp && document.getElementById('profilePic')) document.getElementById('profilePic').src = data.Pfp;
        }
    } catch (err) { console.error(err); }
}

function toggleEdit(inputId, btnId) {
    const input = document.getElementById(inputId);
    const btn = document.getElementById(btnId);
    if (input.readOnly) {
        input.readOnly = false;
        input.focus();
        btn.innerText = "OK";
        btn.style.backgroundColor = "#10b981";
    } else {
        saveProfileUpdate(inputId, input.value, btn);
    }
}

async function saveProfileUpdate(fieldId, newValue, btn) {
    const token = sessionStorage.getItem("token");
    const key = fieldId === 'profUsername' ? 'Username' : 'Email';
    btn.disabled = true;
    try {
        const request = await fetch("/EditUser", {
            method: "PUT",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ [key]: newValue })
        });
        if (request.ok) {
            document.getElementById(fieldId).readOnly = true;
            btn.innerText = "Szerkesztés";
            btn.style.backgroundColor = "";
            updateHeader();
        }
    } catch (err) { alert("Hiba."); }
    btn.disabled = false;
}

async function updatePassword() {
    const oldPass = document.getElementById('oldPassword').value;
    const newPass = document.getElementById('newPassword1').value;
    const newPass2 = document.getElementById('newPassword2').value;
    if (newPass !== newPass2) { alert("Az új jelszavak nem egyeznek!"); return; }
    try {
        const res = await fetch("/EditUser", {
            method: "PUT",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${sessionStorage.getItem("token")}` },
            body: JSON.stringify({ OldPassword: oldPass, Password: newPass })
        });
        if (res.ok) {
            alert("Sikeres módosítás!");
            document.getElementById('passFields').style.display = 'none';
        }
    } catch (e) { alert("Hiba."); }
}

async function uploadProfilePic(event) {
    const file = event.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("profileImage", file);
    try {
        const r = await fetch("/UploadProfilePic", {
            method: "POST",
            headers: { "Authorization": `Bearer ${sessionStorage.getItem("token")}` },
            body: formData
        });
        if (r.ok) {
            updateHeader();
            loadUserProfile();
        }
    } catch (err) { console.error(err); }
}

async function userLogin() {
    const user = document.getElementById('email').value;
    const pass = document.getElementById('password').value;

    try {
        const request = await fetch("/UserLogin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ Username: user, Password: pass })
        });
        
        const response = await request.json();

        if (request.ok) {
            sessionStorage.setItem("token", response.token);
            const userRequest = await fetch("/getUser", {
                method: "GET",
                headers: { "Authorization": `Bearer ${response.token}` }
            });

            const userData = await userRequest.json();
            const finalUid = userData.Id || userData.id;
            const finalEmail = userData.Email || userData.email;
            if (finalUid) {
                sessionStorage.setItem('uid', finalUid);
                sessionStorage.setItem('userEmail', finalEmail);
                console.log("Sikeres UID mentés:", finalUid);
                const oldCart = localStorage.getItem('cart');
                if (oldCart) {
                    localStorage.setItem(`cart_${finalUid}`, oldCart);
                    localStorage.removeItem('cart'); 
                }

                window.location.href = "profil";
            } else {
                console.error("Nem sikerült kinyerni a User ID-t!", userData);
                alert("Hiba történt a profil adatok betöltésekor.");
            }

        } else { 
            alert(response.message); 
        }
    } catch(e) { 
        console.error("Hiba:", e);
        alert("Szerver hiba."); 
    }
}

async function userRegister() {
    const user = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;
    const aszf = document.getElementById('check');

    if (!aszf.checked) {
        alert("A regisztrációhoz el kell fogadnod az ÁSZF-et!");
        return; 
    }
    if (pass.length < 8) {
        alert("A jelszónak legalább 8 karakterből kell állnia!");
        return; 
    }

    try {
        const request = await fetch("/UserRegister", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ Username: user, Email: email, Password: pass })
        });

        if (request.ok) {
            alert("Sikeres regisztráció!");
            window.location.href = "login";
        } else {
            const res = await request.json();
            alert(res.message);
        }
    } catch(e) { 
        alert("Szerver hiba."); 
    }
}

function logout() {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem('uid');
    
    window.location.href = "login";
}
