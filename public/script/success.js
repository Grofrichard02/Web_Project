async function loadFont(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Font letöltési hiba");
        const blob = await response.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.readAsDataURL(blob);
        });
    } catch (err) {
        console.error("Nem sikerült betölteni a betűtípust:", err);
        return null;
    }
}

window.downloadInvoice = async function() {
    const { jsPDF } = window.jspdf;
    const purchase = JSON.parse(sessionStorage.getItem('lastPurchase'));
    
    if(!purchase) return alert("Nincs adat a számlához!");

    const btn = document.querySelector('.pdf-btn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i> Generálás...';
    btn.disabled = true;

    try {
        const doc = new jsPDF();
        
        const fontUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf';
        const fontBase64 = await loadFont(fontUrl);
        
        if (fontBase64) {
            doc.addFileToVFS('Roboto.ttf', fontBase64);
            doc.addFont('Roboto.ttf', 'Roboto', 'normal');
            doc.setFont('Roboto');
        } else {
            console.warn("Visszaváltás alapértelmezett betűtípusra az ékezetek elvesztésével.");
            doc.setFont("helvetica");
        }

        const primaryBlue = [43, 87, 255];
        
        doc.setFontSize(22);
        doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
        doc.text("NOTROX GROUP KFT.", 105, 20, { align: "center" });
        
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text("Vásárlási Igazolás / Számla", 105, 28, { align: "center" });

        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text("Eladó:", 20, 45);
        doc.setFontSize(10);
        doc.text("NOTROX Webshop\n1149 Budapest, Egressy út 71.\ninfo@notrox.hu", 20, 52);

        doc.setFontSize(12);
        doc.text("Vevő:", 120, 45);
        doc.setFontSize(10);
        doc.text(`${purchase.buyer.name}\n${purchase.buyer.email}\n${purchase.buyer.address}`, 120, 52);

        doc.text(`Dátum: ${purchase.date}`, 20, 80);

        const tableRows = purchase.items.map(item => [
            item.Name,
            `${item.Price.toLocaleString()} Ft`,
            item.quantity,
            `${(item.Price * item.quantity).toLocaleString()} Ft`
        ]);

        doc.autoTable({
            startY: 85,
            head: [['Termék', 'Egységár', 'Menny.', 'Összesen']],
            body: tableRows,
            headStyles: { fillColor: primaryBlue },
            styles: { font: fontBase64 ? 'Roboto' : 'helvetica' }
        });

        const finalY = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(11);
        doc.text(`Nettó: ${purchase.totals.net}`, 140, finalY);
        doc.text(`ÁFA (27%): ${purchase.totals.tax}`, 140, finalY + 7);
        doc.setFontSize(14);
        doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
        doc.text(`Bruttó összesen: ${purchase.totals.gross}`, 140, finalY + 16);

        doc.save(`NOTROX_Szamla.pdf`);

    } catch (error) {
        console.error("PDF hiba részletek:", error);
        alert("Hiba történt a generáláskor. Próbáld meg újra!");
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const purchase = JSON.parse(sessionStorage.getItem('lastPurchase'));
    if (!purchase) return;

    document.getElementById('summary-name').innerText = purchase.buyer.name;
    document.getElementById('summary-email').innerText = purchase.buyer.email;
    document.getElementById('summary-address').innerText = purchase.buyer.address;
    document.getElementById('summary-date').innerText = purchase.date;
    document.getElementById('summary-net').innerText = purchase.totals.net;
    document.getElementById('summary-tax').innerText = purchase.totals.tax;
    document.getElementById('summary-gross').innerText = purchase.totals.gross;

    const listContainer = document.getElementById('purchased-items-list');
    listContainer.innerHTML = purchase.items.map(item => `
        <div class="order-item-row d-flex justify-content-between p-2" style="border-bottom: 1px solid #222;">
            <div>
                <span class="text-primary fw-bold">[${item.Brand}]</span> 
                <span class="text-white">${item.Name}</span>
                <small class="text-secondary ms-2">x${item.quantity}</small>
            </div>
            <div class="fw-bold text-white">${(item.Price * item.quantity).toLocaleString()} Ft</div>
        </div>
    `).join('');
});