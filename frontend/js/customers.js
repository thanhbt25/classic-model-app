const API_BASE = "http://127.0.0.1:8000/api";

// Biến toàn cục để lưu trữ toàn bộ dữ liệu gốc
let allCustomers = [];

// ==================== HIỂN THỊ BẢNG KHÁCH HÀNG ====================
function renderTable(customers) {
    const tbody = document.getElementById("customerTableBody");

    if (!customers || customers.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">Không tìm thấy khách hàng nào.</td></tr>`;
        return;
    }

    tbody.innerHTML = customers.map(c => `
        <tr>
            <td><span class="badge bg-secondary">${c.customerNumber}</span></td>
            <td><strong>${c.customerName}</strong></td>
            <td>${c.contactName || "—"}</td>
            <td>${c.phone || "—"}</td>
            <td>${c.city || "—"}</td>
            <td>${c.country || "—"}</td>
        </tr>
    `).join("");
}

// ==================== TẢI DỮ LIỆU ====================
async function fetchCustomers() {
    const tbody = document.getElementById("customerTableBody");
    tbody.innerHTML = `<tr><td colspan="6" class="text-center">Đang tải dữ liệu...</td></tr>`;

    try {
        // Chỉ gọi API 1 lần duy nhất để lấy tất cả dữ liệu
        const res = await fetch(`${API_BASE}/customers/`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        // Lưu dữ liệu vào biến toàn cục
        allCustomers = await res.json();
        
        // Hiển thị lần đầu
        renderTable(allCustomers);
    } catch (err) {
        console.error("fetchCustomers error:", err);
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-danger">
                    Không thể kết nối tới server. Hãy đảm bảo backend đang chạy tại
                    <code>http://127.0.0.1:8000</code>.
                </td>
            </tr>`;
    }
}

// ==================== TÌM KIẾM TỨC THỜI ====================
function handleSearch() {
    // Lấy từ khóa, chuyển về chữ thường và xóa khoảng trắng thừa
    const keyword = document.getElementById("searchInput").value.toLowerCase().trim();

    // Nếu ô tìm kiếm trống, hiển thị lại toàn bộ dữ liệu gốc
    if (!keyword) {
        renderTable(allCustomers);
        return;
    }

    // Lọc mảng allCustomers trên nhiều trường dữ liệu
    const filteredCustomers = allCustomers.filter(c => {
        const name = String(c.customerName || "").toLowerCase();
        const contact = String(c.contactName || "").toLowerCase();
        const phone = String(c.phone || "").toLowerCase();
        const city = String(c.city || "").toLowerCase();
        const country = String(c.country || "").toLowerCase();

        // Kiểm tra xem từ khóa có nằm trong bất kỳ cột nào không
        return name.includes(keyword) || 
               contact.includes(keyword) || 
               phone.includes(keyword) || 
               city.includes(keyword) || 
               country.includes(keyword);
    });

    // Vẽ lại bảng với dữ liệu đã lọc
    renderTable(filteredCustomers);
}

// ==================== KHỞI CHẠY ====================
document.addEventListener("DOMContentLoaded", () => {
    fetchCustomers();

    // Lắng nghe sự kiện "input" (gõ phím tới đâu lọc tới đó)
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener("input", handleSearch);
    }
});