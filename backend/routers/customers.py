from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from database import get_db
import models

router = APIRouter()

@router.get("/")
def get_customers(
    search: Optional[str] = Query(None, description="Tìm kiếm theo tên khách hàng"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    query = db.query(models.Customer)
    if search:
        query = query.filter(
            or_(
                models.Customer.customerName.ilike(f"%{search}%"),
                models.Customer.contactFirstName.ilike(f"%{search}%"),
                models.Customer.contactLastName.ilike(f"%{search}%"),
            )
        )
    customers = query.offset(skip).limit(limit).all()
    return [
        {
            "customerNumber": c.customerNumber,
            "customerName": c.customerName,
            "contactName": f"{c.contactFirstName} {c.contactLastName}",
            "phone": c.phone,
            "city": c.city,
            "country": c.country,
        }
        for c in customers
    ]

@router.get("/{customer_number}")
def get_customer(customer_number: int, db: Session = Depends(get_db)):
    customer = db.query(models.Customer).filter(
        models.Customer.customerNumber == customer_number
    ).first()
    if not customer:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Không tìm thấy khách hàng")
    return customer
