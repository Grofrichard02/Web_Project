(function () {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    const path = window.location.pathname.toLowerCase();
    const isProfile    = /\/profil($|\/)/.test(path)     || path.includes("profile.html");
    const isAddress    = /\/address($|\/)/.test(path)    || /\/adress($|\/)/.test(path) || path.includes("address.html");
    const isAdminPanel = /\/adminpanel($|\/)/.test(path) || path.includes("adminpanel.html");
    const isProductAdd = /\/product-add($|\/)/.test(path) || path.includes("product-add.html");
    const isProductList = /\/product-list($|\/)/.test(path) || path.includes("product-list.html");
    const isCart = /\/cart($|\/)/.test(path) || path.includes("cart.html");
    const isSuccess = /\/success($|\/)/.test(path) || path.includes("success.html");
    const isrecentOrders = /\/recentorders($|\/)/.test(path) || path.includes("recentorders.html");
    const isLogin = path.endsWith("/login") || path.includes("login.html"); 
    
    const isRegister = path.includes("register");
    const is404      = path.includes("404");

    const isPrivate = isProfile || isAddress || isAdminPanel || isProductAdd || isProductList || isCart || isSuccess || isrecentOrders;
    const isAuth    = isLogin || isRegister;

    console.log("AUTH CHECK LOG:", { 
        path, 
        isPrivate, 
        isAdminPanel, 
        isProductAdd,
        isProductList,
        isCart,
        isSuccess,
        isrecentOrders,
        hasToken: !!token 
    });
    if (isPrivate && !token) {
        console.error("ACCESS DENIED: No token for private page.");
        window.location.replace("404");
        return;
    }
    if (isAuth && token) {
        window.location.replace("profil");
        return;
    }
    const show = () => {
        document.documentElement.style.display = "block";
        document.documentElement.style.visibility = "visible";
    };

    if (is404) {
        show();
    } else {
        show();
        window.onload = show;
        setTimeout(show, 150);
    }
})();