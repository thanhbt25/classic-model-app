from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import cấu hình DB và các module liên quan
from database import engine
import models

# Import các router (chúng ta sẽ tạo các file này ở bước tiếp theo)
from routers import customers, orders, statistics

# Khởi tạo các bảng trong cơ sở dữ liệu (nếu chưa có).
# LƯU Ý: Với classicmodels đã có sẵn bảng và data, lệnh này sẽ bỏ qua và không ghi đè data cũ.
models.Base.metadata.create_all(bind=engine)

# Khởi tạo app FastAPI
app = FastAPI(
    title="Classic Models API",
    description="REST API cho Dashboard Thống kê và Quản lý dữ liệu",
    version="1.0.0"
)

# Cấu hình CORS (Cross-Origin Resource Sharing)
# Cho phép Frontend chạy ở port khác (ví dụ: Live Server ở port 5500) có quyền gọi API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Khuyến cáo: Trong thực tế nên đổi thành domain cụ thể
    allow_credentials=True,
    allow_methods=["*"],  # Cho phép tất cả các method (GET, POST, PUT, DELETE...)
    allow_headers=["*"],
)

# Gắn các router (nhóm API) vào ứng dụng chính
app.include_router(statistics.router, prefix="/api/statistics", tags=["Statistics"])
app.include_router(customers.router, prefix="/api/customers", tags=["Customers"])
app.include_router(orders.router, prefix="/api/orders", tags=["Orders"])

# Endpoint kiểm tra trạng thái server
@app.get("/")
def read_root():
    return {
        "message": "Server đang chạy thành công!",
        "docs_url": "Hãy truy cập http://localhost:8000/docs để xem tài liệu API (Swagger UI)"
    }


# uvicorn main:app --reload