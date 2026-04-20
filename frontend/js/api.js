// Khai báo đường dẫn gốc của Backend. 
// Sau này nếu đưa lên server thật, bạn chỉ cần sửa ở ĐÂY là toàn bộ web tự cập nhật.
const API_BASE_URL = 'http://localhost:8000/api';

/**
 * Hàm gọi API dùng chung cho toàn bộ dự án
 * @param {string} endpoint - Đường dẫn con (VD: /customers, /orders)
 * @returns {Promise<any>} - Dữ liệu JSON trả về từ Backend
 */
async function fetchData(endpoint) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`);
        
        // Kiểm tra xem backend có trả về lỗi (404, 500...) hay không
        if (!response.ok) {
            throw new Error(`HTTP Error! Status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(`[API Error] Lỗi khi lấy dữ liệu từ ${endpoint}:`, error);
        // Có thể thêm logic hiển thị popup thông báo lỗi cho người dùng ở đây
        throw error; 
    }
}