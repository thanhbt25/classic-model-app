from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from typing import Optional
import models

# ==================== CUSTOMERS ====================

def get_customers(db: Session, search: Optional[str] = None, skip: int = 0, limit: int = 100):
    query = db.query(models.Customer)
    if search:
        query = query.filter(
            or_(
                models.Customer.customerName.ilike(f"%{search}%"),
                models.Customer.contactFirstName.ilike(f"%{search}%"),
                models.Customer.contactLastName.ilike(f"%{search}%"),
            )
        )
    return query.offset(skip).limit(limit).all()

def get_customer_by_id(db: Session, customer_number: int):
    return db.query(models.Customer).filter(
        models.Customer.customerNumber == customer_number
    ).first()

# ==================== ORDERS ====================

def get_orders(db: Session, skip: int = 0, limit: int = 100):
    return (
        db.query(models.Order)
        .order_by(models.Order.orderDate.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

def get_order_by_id(db: Session, order_number: int):
    return db.query(models.Order).filter(
        models.Order.orderNumber == order_number
    ).first()

# ==================== STATISTICS ====================

def get_revenue_by_month(db: Session):
    results = (
        db.query(
            func.date_format(models.Order.orderDate, "%Y-%m").label("month"),
            func.sum(
                models.OrderDetail.quantityOrdered * models.OrderDetail.priceEach
            ).label("total_sales"),
        )
        .join(models.OrderDetail, models.Order.orderNumber == models.OrderDetail.orderNumber)
        .filter(models.Order.status != "Cancelled")
        .group_by("month")
        .order_by("month")
        .all()
    )
    return [{"month": r.month, "total_sales": float(r.total_sales)} for r in results]

def get_revenue_by_category(db: Session):
    results = (
        db.query(
            models.Product.productLine.label("category"),
            func.sum(
                models.OrderDetail.quantityOrdered * models.OrderDetail.priceEach
            ).label("total_sales"),
        )
        .join(models.OrderDetail, models.Product.productCode == models.OrderDetail.productCode)
        .join(models.Order, models.Order.orderNumber == models.OrderDetail.orderNumber)
        .filter(models.Order.status != "Cancelled")
        .group_by(models.Product.productLine)
        .order_by(func.sum(models.OrderDetail.quantityOrdered * models.OrderDetail.priceEach).desc())
        .all()
    )
    return [{"category": r.category, "total_sales": float(r.total_sales)} for r in results]

def get_pivot_data(db: Session):
    results = (
        db.query(
            models.Customer.country.label("country"),
            models.Customer.city.label("city"),
            func.date_format(models.Order.orderDate, "%Y-%m").label("order_month"),
            models.Product.productLine.label("product_line"),
            func.sum(
                models.OrderDetail.quantityOrdered * models.OrderDetail.priceEach
            ).label("revenue"),
        )
        .join(models.Order, models.Customer.customerNumber == models.Order.customerNumber)
        .join(models.OrderDetail, models.Order.orderNumber == models.OrderDetail.orderNumber)
        .join(models.Product, models.OrderDetail.productCode == models.Product.productCode)
        .filter(models.Order.status != "Cancelled")
        .group_by("country", "city", "order_month", "product_line")
        .all()
    )
    return [
        {
            "country": r.country,
            "city": r.city,
            "order_month": r.order_month,
            "product_line": r.product_line,
            "revenue": float(r.revenue),
        }
        for r in results
    ]
