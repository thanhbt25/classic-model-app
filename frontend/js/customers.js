const API_BASE = "http://127.0.0.1:8000/api";
let allCustomers = [];
let countryChartInst = null;

function renderTable(customers) {
    const tbody = document.getElementById("customerTableBody");
    if (!customers || customers.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">Không tìm thấy khách hàng.</td></tr>`;
        return;
    }
    tbody.innerHTML = customers.map(c => `
        <tr>
            <td><span class="badge bg-secondary">${c.customerNumber}</span></td>
            <td><strong>${c.customerName}</strong></td>
            <td>${c.contactName || "—"}</td>
            <td>${c.phone || "—"}</td>
            <td>${c.city || "—"}</td>
            <td>${c.country}</td>
        </tr>
    `).join("");
}

function updateCharts(customerData) {
    const container = document.getElementById("chartContainer");
    if (container.style.display === "none") return;

    const countryCount = {};
    customerData.forEach(c => {
        const country = c.country || "Khác";
        countryCount[country] = (countryCount[country] || 0) + 1;
    });

    const sorted = Object.entries(countryCount).sort((a, b) => b[1] - a[1]).slice(0, 10); // Lấy top 10

    if (countryChartInst) countryChartInst.destroy();

    countryChartInst = new Chart(document.getElementById('countryChart'), {
        type: 'pie',
        data: {
            labels: sorted.map(i => i[0]),
            datasets: [{
                data: sorted.map(i => i[1]),
                backgroundColor: sorted.map((_, i) => `hsl(${i * 36}, 70%, 60%)`)
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

function handleSearch() {
    const keyword = document.getElementById("searchInput").value.toLowerCase().trim();
    const filtered = allCustomers.filter(c => 
        c.customerName.toLowerCase().includes(keyword) || 
        c.country.toLowerCase().includes(keyword) || 
        (c.city && c.city.toLowerCase().includes(keyword))
    );
    renderTable(filtered);
    updateCharts(filtered);
}

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const res = await fetch(`${API_BASE}/customers/`);
        allCustomers = await res.json();
        renderTable(allCustomers);
    } catch (err) {
        console.error(err);
    }

    document.getElementById("searchInput").addEventListener("input", handleSearch);

    document.getElementById("toggleChartBtn").addEventListener("click", () => {
        const container = document.getElementById("chartContainer");
        container.style.display = container.style.display === "none" ? "flex" : "none";
        handleSearch();
    });
});