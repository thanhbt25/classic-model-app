from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from database import get_db
import models

router = APIRouter()

@router.get("/revenue-by-month")
def get_revenue_by_month(db: Session = Depends(get_db)):
    """Doanh thu theo từng tháng (từ bảng orderdetails + orders)"""
    results = (
        db.query(
            func.year(models.Order.orderDate).label("year"),
            func.month(models.Order.orderDate).label("month"),
            func.sum(
                models.OrderDetail.quantityOrdered * models.OrderDetail.priceEach
            ).label("revenue"),
        )
        .join(models.OrderDetail, models.Order.orderNumber == models.OrderDetail.orderNumber)
        .filter(models.Order.status != "Cancelled")
        .group_by("year", "month")
        .order_by("year", "month")
        .all()
    )
    return [
        {
            "label": f"{int(r.year)}-{int(r.month):02d}",
            "revenue": float(r.revenue),
        }
        for r in results
    ]

@router.get("/revenue-by-category")
def get_revenue_by_category(db: Session = Depends(get_db)):
    """Doanh thu theo từng danh mục sản phẩm"""
    results = (
        db.query(
            models.Product.productLine.label("category"),
            func.sum(
                models.OrderDetail.quantityOrdered * models.OrderDetail.priceEach
            ).label("revenue"),
        )
        .join(models.OrderDetail, models.Product.productCode == models.OrderDetail.productCode)
        .join(models.Order, models.Order.orderNumber == models.OrderDetail.orderNumber)
        .filter(models.Order.status != "Cancelled")
        .group_by(models.Product.productLine)
        .order_by(func.sum(models.OrderDetail.quantityOrdered * models.OrderDetail.priceEach).desc())
        .all()
    )
    return [{"category": r.category, "revenue": float(r.revenue)} for r in results]

@router.get("/pivot-data")
def get_pivot_data(db: Session = Depends(get_db)):
    """Dữ liệu thô cho Pivot Table: country, productLine, month, revenue"""
    results = (
        db.query(
            models.Customer.country.label("country"),
            models.Product.productLine.label("productLine"),
            func.year(models.Order.orderDate).label("year"),
            func.month(models.Order.orderDate).label("month"),
            func.sum(
                models.OrderDetail.quantityOrdered * models.OrderDetail.priceEach
            ).label("revenue"),
            func.sum(models.OrderDetail.quantityOrdered).label("quantity"),
        )
        .join(models.Order, models.Customer.customerNumber == models.Order.customerNumber)
        .join(models.OrderDetail, models.Order.orderNumber == models.OrderDetail.orderNumber)
        .join(models.Product, models.OrderDetail.productCode == models.Product.productCode)
        .filter(models.Order.status != "Cancelled")
        .group_by("country", "productLine", "year", "month")
        .all()
    )
    return [
        {
            "country": r.country,
            "productLine": r.productLine,
            "year": int(r.year),
            "month": int(r.month),
            "monthLabel": f"{int(r.year)}-{int(r.month):02d}",
            "revenue": float(r.revenue),
            "quantity": int(r.quantity),
        }
        for r in results
    ]
