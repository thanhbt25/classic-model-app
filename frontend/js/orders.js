const API_BASE = "http://127.0.0.1:8000/api";

// Biến toàn cục để lưu trữ toàn bộ dữ liệu gốc, phục vụ cho việc tìm kiếm
let allOrders = []; 

// ==================== BADGE TRẠNG THÁI ====================
const STATUS_BADGE = {
    "Shipped":    "bg-success",
    "Resolved":   "bg-info",
    "Cancelled":  "bg-danger",
    "On Hold":    "bg-warning text-dark",
    "In Process": "bg-primary",
    "Disputed":   "bg-secondary",
};

function statusBadge(status) {
    const cls = STATUS_BADGE[status] || "bg-secondary";
    return `<span class="badge ${cls}">${status}</span>`;
}

function formatDate(dateStr) {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN");
}

// ==================== HIỂN THỊ BẢNG ====================
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

// ==================== TẢI DỮ LIỆU ====================
async function fetchOrders() {
    const tbody = document.getElementById("orderTableBody");
    tbody.innerHTML = `<tr><td colspan="6" class="text-center">Đang tải dữ liệu...</td></tr>`;

    try {
        const res = await fetch(`${API_BASE}/orders/`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        // Lưu dữ liệu tải về vào biến toàn cục thay vì biến cục bộ
        allOrders = await res.json(); 
        
        // Hiển thị lần đầu
        renderTable(allOrders);
    } catch (err) {
        console.error("fetchOrders error:", err);
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-danger">
                    Không thể kết nối tới server. Hãy đảm bảo backend đang chạy.
                </td>
            </tr>`;
    }
}

// ==================== TÌM KIẾM ====================
function handleSearch() {
    // Lấy từ khóa, chuyển về chữ thường và xóa khoảng trắng thừa
    const keyword = document.getElementById("searchInput").value.toLowerCase().trim();

    // Nếu ô tìm kiếm trống, hiển thị lại toàn bộ dữ liệu gốc
    if (!keyword) {
        renderTable(allOrders);
        return;
    }

    // Lọc mảng allOrders dựa trên từ khóa
    const filteredOrders = allOrders.filter(o => {
        const orderNum = String(o.orderNumber).toLowerCase();
        const customerNum = String(o.customerNumber).toLowerCase();
        const status = String(o.status).toLowerCase();

        // Kiểm tra xem từ khóa có nằm trong Mã đơn, Mã KH hoặc Trạng thái không
        return orderNum.includes(keyword) || 
               customerNum.includes(keyword) || 
               status.includes(keyword);
    });

    // Vẽ lại bảng với dữ liệu đã lọc
    renderTable(filteredOrders);
}

// ==================== KHỞI CHẠY ====================
document.addEventListener("DOMContentLoaded", () => {
    fetchOrders();

    // Gắn sự kiện lắng nghe mỗi khi người dùng gõ phím vào ô tìm kiếm
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener("input", handleSearch);
    }
});