const API_BASE = "http://127.0.0.1:8000/api";
let allOrders = []; // Lưu trữ dữ liệu gốc
let statusChartInst = null;
let timelineChartInst = null;

// Badge trạng thái
const STATUS_BADGE = {
    "Shipped": "bg-success", "Resolved": "bg-info", "Cancelled": "bg-danger",
    "On Hold": "bg-warning text-dark", "In Process": "bg-primary", "Disputed": "bg-secondary",
};

function statusBadge(status) {
    return `<span class="badge ${STATUS_BADGE[status] || "bg-secondary"}">${status}</span>`;
}

function formatDate(dateStr) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("vi-VN");
}

// 1. Vẽ bảng
function renderTable(orders) {
    const tbody = document.getElementById("orderTableBody");
    if (!orders || orders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">Không tìm thấy đơn hàng nào.</td></tr>`;
        return;
    }
    tbody.innerHTML = orders.map(o => `
        <tr>
            <td><strong>#${o.orderNumber}</strong></td>
            <td>${formatDate(o.orderDate)}</td>
            <td>${formatDate(o.requiredDate)}</td>
            <td>${formatDate(o.shippedDate)}</td>
            <td>${statusBadge(o.status)}</td>
            <td>${o.customerNumber}</td>
        </tr>
    `).join("");
}

// 2. Vẽ biểu đồ
function updateCharts(ordersData) {
    const container = document.getElementById("chartContainer");
    if (container.style.display === "none") return; // Không vẽ nếu đang ẩn

    const statusCount = {};
    const dateCount = {};

    ordersData.forEach(o => {
        statusCount[o.status] = (statusCount[o.status] || 0) + 1;
        const date = o.orderDate ? o.orderDate.split('T')[0] : "Unknown";
        dateCount[date] = (dateCount[date] || 0) + 1;
    });

    const sortedDates = Object.keys(dateCount).sort();

    // Hủy biểu đồ cũ nếu tồn tại
    if (statusChartInst) statusChartInst.destroy();
    if (timelineChartInst) timelineChartInst.destroy();

    // Biểu đồ tròn trạng thái
    statusChartInst = new Chart(document.getElementById('statusChart'), {
        type: 'doughnut',
        data: {
            labels: Object.keys(statusCount),
            datasets: [{ data: Object.values(statusCount), backgroundColor: ['#28a745', '#17a2b8', '#dc3545', '#ffc107', '#007bff', '#6c757d'] }]
        }
    });

    // Biểu đồ đường thời gian
    timelineChartInst = new Chart(document.getElementById('timelineChart'), {
        type: 'line',
        data: {
            labels: sortedDates,
            datasets: [{ label: 'Số lượng đơn', data: sortedDates.map(d => dateCount[d]), borderColor: '#007bff', tension: 0.3, fill: true, backgroundColor: 'rgba(0, 123, 255, 0.1)' }]
        }
    });
}

// 3. Hàm tìm kiếm & Lọc
function handleSearch() {
    const keyword = document.getElementById("searchInput").value.toLowerCase().trim();
    const filtered = allOrders.filter(o => 
        String(o.orderNumber).toLowerCase().includes(keyword) || 
        String(o.customerNumber).toLowerCase().includes(keyword) || 
        String(o.status).toLowerCase().includes(keyword)
    );
    renderTable(filtered);
    updateCharts(filtered); // Cập nhật biểu đồ theo kết quả lọc
}

// 4. Khởi chạy
document.addEventListener("DOMContentLoaded", async () => {
    try {
        const res = await fetch(`${API_BASE}/orders/`);
        allOrders = await res.json();
        renderTable(allOrders);
    } catch (err) {
        console.error(err);
    }

    document.getElementById("searchInput").addEventListener("input", handleSearch);

    document.getElementById("toggleChartBtn").addEventListener("click", () => {
        const container = document.getElementById("chartContainer");
        container.style.display = container.style.display === "none" ? "flex" : "none";
        handleSearch(); // Gọi để vẽ biểu đồ ngay khi hiện
    });
});