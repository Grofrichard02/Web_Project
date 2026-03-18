let myOrders = [];

document.addEventListener("DOMContentLoaded", loadOrders);

async function loadOrders() {
    const token = sessionStorage.getItem('token');
    const container = document.getElementById('ordersContainer');

    try {
        const res = await fetch('/getMyOrders', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        myOrders = await res.json();

        if (myOrders.length === 0) {
            container.innerHTML = "<p class='text-secondary'>Még nincs korábbi rendelése.</p>";
            return;
        }

        container.innerHTML = myOrders.map(order => {
            const total = order.OrderItems.reduce((sum, item) => sum + (item.PriceAtPurchase * item.Quantity), 0);
            
            return `
                <div class="order-card">
                    <div class="order-header-info">
                        <div>
                            <span class="order-id-label">RENDELÉS: #${order.Id}</span>
                            <div class="small text-secondary">${new Date(order.Date).toLocaleString('hu-HU')}</div>
                        </div>
                        <div class="status-pill">${order.Phase}</div>
                        <div class="fw-bold text-white">${total.toLocaleString()} Ft</div>
                        <div class="d-flex gap-2">
                            <button class="btn btn-sm btn-outline-primary" onclick="openOrderDetails(${order.Id})">RÉSZLETEK</button>
                            <button class="btn btn-sm btn-primary" onclick="downloadOrderInvoice(${order.Id})"><i class="fa-solid fa-file-pdf"></i></button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

    } catch (err) {
        container.innerHTML = "<p class='text-danger'>Hiba a rendelések betöltésekor.</p>";
    }
}

function openOrderDetails(orderId) {
    const order = myOrders.find(o => o.Id === orderId);
    if (!order) return;

    const gross = order.OrderItems.reduce((sum, item) => sum + (item.PriceAtPurchase * item.Quantity), 0);
    const net = Math.round(gross / 1.27);
    const tax = gross - net;

    const content = document.getElementById('detailsContent');
    content.innerHTML = `
        <div class="row g-5">
            <div class="col-md-7">
                <h2 class="bebas-font text-white mb-4">TERMÉKEK</h2>
                ${order.OrderItems.map(item => `
                    <div class="item-row">
                        <img src="${item.Product.IMGURL}" class="item-img">
                        <div class="flex-grow-1">
                            <div class="text-light fw-bold">${item.Product.Name}</div>
                            <div class=" small text-secondary">${item.Quantity} db x ${item.PriceAtPurchase.toLocaleString()} Ft</div>
                        </div>
                        <div class="textf fw-bold">${(item.PriceAtPurchase * item.Quantity).toLocaleString()} Ft</div>
                    </div>
                `).join('')}
            </div>
            <div class="col-md-5">
                <div class="glass-card p-4" style="background: #111; border-radius: 20px; border: 1px solid #222;">
                    <h4 class="bebas-font text-primary mb-3">RENDELÉS ADATAI</h4>
                    <p class="small mb-1 text-secondary">Vevő email címe:</p>
                    <p class=" text-light mb-3">${sessionStorage.getItem('userEmail') || 'Nincs megadva'}</p>
                    
                    <p class="small mb-1 text-secondary">Szállítási cím:</p>
                    <p class="mb-3 text-white">${order.Address.Zip} ${order.Address.City}, ${order.Address.Address1}</p>
                    
                    <hr class="border-secondary">
                    <div class="textf d-flex justify-content-between mb-2"><span>Nettó:</span><span>${net.toLocaleString()} Ft</span></div>
                    <div class="textf d-flex justify-content-between mb-2"><span>ÁFA (27%):</span><span>${tax.toLocaleString()} Ft</span></div>
                    <div class="d-flex justify-content-between fs-4 fw-bold text-primary"><span>Bruttó:</span><span>${gross.toLocaleString()} Ft</span></div>
                </div>
            </div>
        </div>
    `;

    document.getElementById('order-details-overlay').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeOrderDetails() {
    document.getElementById('order-details-overlay').style.display = 'none';
    document.body.style.overflow = 'auto';
}

async function downloadOrderInvoice(orderId) {
    const order = myOrders.find(o => o.Id === orderId);
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const fontUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf';
    const response = await fetch(fontUrl);
    const blob = await response.blob();
    const fontBase64 = await new Promise(r => { const reader = new FileReader(); reader.onloadend = () => r(reader.result.split(',')[1]); reader.readAsDataURL(blob); });

    doc.addFileToVFS('Roboto.ttf', fontBase64);
    doc.addFont('Roboto.ttf', 'Roboto', 'normal');
    doc.setFont('Roboto');

    const gross = order.OrderItems.reduce((sum, item) => sum + (item.PriceAtPurchase * item.Quantity), 0);
    const net = Math.round(gross / 1.27);

    doc.setFontSize(20);
    doc.text("NOTROX SZÁMLA", 105, 20, { align: "center" });
    doc.setFontSize(10);
    doc.text(`Rendelésszám: #${order.Id} | Dátum: ${new Date(order.Date).toLocaleDateString('hu-HU')}`, 105, 28, { align: "center" });

    doc.autoTable({
        startY: 40,
        head: [['Termék', 'Ár', 'Menny.', 'Össz.']],
        body: order.OrderItems.map(i => [i.Product.Name, i.PriceAtPurchase, i.Quantity, i.PriceAtPurchase * i.Quantity]),
        styles: { font: 'Roboto' }
    });

    doc.text(`Végösszeg (Bruttó): ${gross.toLocaleString()} Ft`, 140, doc.lastAutoTable.finalY + 15);
    doc.save(`Notrox_Rendeles_${order.Id}.pdf`);
}