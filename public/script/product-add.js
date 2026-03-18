function goToGetUsers() {
    window.location.href = "adminpanel";
}
function logout() {
    sessionStorage.removeItem('token');
    localStorage.removeItem('token');
    sessionStorage.clear();
    localStorage.clear();

    alert("Sikeres kijelentkezés!");
    window.location.replace("admin");
}

function goToListProd() {
    window.location.href = "product-list";
}
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('productForm');
    const submitBtn = document.getElementById('submitProductBtn');
    const companySelect = document.getElementById('pCompany');
    const inputIds = ['pName', 'pDesc', 'pPrice', 'pAmount', 'pCompany', 'pImg'];
    async function loadCompanies() {
        const companySelect = document.getElementById('pCompany');
        console.log("JS: Cégek betöltése folyamatban...");

        try {
            const response = await fetch('/getcompany');

            if (!response.ok) {
                console.error("JS: Szerver hiba:", response.status);
                return;
            }

            const data = await response.json();
            console.log("JS: Megérkezett adatok:", data);
            companySelect.innerHTML = '<option value="">-- Válassz gyártót --</option>';

            if (data.length === 0) {
                console.warn("JS: Üres a céglista az adatbázisban!");
                return;
            }

            data.forEach(company => {
                const option = document.createElement('option');
                option.value = company.Id;
                option.textContent = company.Name;
                companySelect.appendChild(option);
            });

            console.log("JS: Dropdown sikeresen feltöltve.");

        } catch (error) {
            console.error("JS: Hálózati hiba a cégek lekérésekor:", error);
            companySelect.innerHTML = '<option value="">Hiba a betöltéskor!</option>';
        }
    }
    function validateForm() {
        const isAllFilled = inputIds.every(id => {
            const el = document.getElementById(id);
            return el.value.trim() !== "";
        });

        submitBtn.disabled = !isAllFilled;
    }

    inputIds.forEach(id => {
        document.getElementById(id).addEventListener('input', validateForm);
    });

    submitBtn.addEventListener('click', async () => {
        const token = sessionStorage.getItem('token');

        const productData = {
            Name: document.getElementById('pName').value,
            Description: document.getElementById('pDesc').value,
            Price: parseInt(document.getElementById('pPrice').value),
            Ammount: parseInt(document.getElementById('pAmount').value),
            CompanyId: parseInt(document.getElementById('pCompany').value),
            IMGURL: document.getElementById('pImg').value
        };

        try {
            const response = await fetch('/postproduct', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(productData)
            });

            const result = await response.json();

            if (response.ok) {
                alert("✅ " + result.message);
                form.reset();
                validateForm();
            } else {
                alert("❌ Hiba: " + (result.message || "Sikertelen mentés"));
            }
        } catch (error) {
            console.error("Hiba a küldés során:", error);
            alert("Szerver hiba történt a mentéskor!");
        }
    });
    loadCompanies();
});