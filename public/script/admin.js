document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const loginResponse = await fetch('/UserLogin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ Username: username, Password: password })
        });

        const loginData = await loginResponse.json();
        if (!loginResponse.ok) {
            alert(loginData.message || "Hiba a bejelentkezés során");
            return;
        }
        const token = loginData.token;
        sessionStorage.setItem('token', token);
        const userResponse = await fetch('/getUser', {
            method: 'GET',
            headers: { 
                'Authorization': `Bearer ${token}` 
            }
        });

        if (!userResponse.ok) {
            alert("Hiba a felhasználói adatok lekérésekor");
            return;
        }

        const userData = await userResponse.json();
        if (userData.isAdmin === true) {
            alert("Sikeres admin bejelentkezés!");
            window.location.href = "adminpanel";
        } else {
            alert("Nincs jogosultság");
            sessionStorage.removeItem('token'); 
        }

    } catch (error) {
        console.error("Hiba:", error);
        alert("Hálózati hiba történt!");
    }
});