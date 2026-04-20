from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import models

router = APIRouter()

@router.get("/")
def get_orders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    orders = db.query(models.Order).order_by(
        models.Order.orderDate.desc()
    ).offset(skip).limit(limit).all()
    return [
        {
            "orderNumber": o.orderNumber,
            "orderDate": str(o.orderDate) if o.orderDate else None,
            "requiredDate": str(o.requiredDate) if o.requiredDate else None,
            "shippedDate": str(o.shippedDate) if o.shippedDate else None,
            "status": o.status,
            "customerNumber": o.customerNumber,
        }
        for o in orders
    ]

@router.get("/{order_number}")
def get_order(order_number: int, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(
        models.Order.orderNumber == order_number
    ).first()
    if not order:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Không tìm thấy đơn hàng")
    return order
