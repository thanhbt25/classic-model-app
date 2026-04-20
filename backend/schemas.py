from pydantic import BaseModel
from typing import List, Optional
from datetime import date
from decimal import Decimal

# --- SCHEMAS CHO ORDER DETAILS ---
class OrderDetailBase(BaseModel):
    productCode: str
    quantityOrdered: int
    priceEach: Decimal
    orderLineNumber: int

    class Config:
        from_attributes = True

# --- SCHEMAS CHO ORDERS ---
class OrderBase(BaseModel):
    orderNumber: int
    orderDate: date
    requiredDate: date
    shippedDate: Optional[date] = None
    status: str
    comments: Optional[str] = None
    customerNumber: int

class OrderResponse(OrderBase):
    # Trả về kèm danh sách chi tiết đơn hàng nếu cần
    order_details: List[OrderDetailBase] = []

    class Config:
        from_attributes = True

# --- SCHEMAS CHO CUSTOMERS ---
class CustomerBase(BaseModel):
    customerNumber: int
    customerName: str
    contactLastName: str
    contactFirstName: str
    phone: str
    city: str
    country: str

class CustomerResponse(CustomerBase):
    # Có thể bao gồm danh sách đơn hàng của khách hàng đó
    orders: List[OrderBase] = []

    class Config:
        from_attributes = True

# --- SCHEMAS DÀNH RIÊNG CHO THỐNG KÊ (Dùng cho Chart/Pivot) ---
class SalesByMonth(BaseModel):
    month: str
    total_sales: Decimal

class SalesByCategory(BaseModel):
    category: str
    total_sales: Decimal

class CustomerRevenue(BaseModel):
    customerName: str
    total_spent: Decimal

class PivotDataResponse(BaseModel):
    # Cấu trúc dữ liệu phẳng để Frontend dễ dàng đưa vào PivotTable.js
    country: str
    city: str
    order_month: str
    product_line: str
    revenue: Decimal