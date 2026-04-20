from sqlalchemy import Column, Integer, String, DECIMAL, Date, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base

class Customer(Base):
    __tablename__ = "customers"

    customerNumber = Column(Integer, primary_key=True, index=True)
    customerName = Column(String(50), nullable=False)
    contactLastName = Column(String(50), nullable=False)
    contactFirstName = Column(String(50), nullable=False)
    phone = Column(String(50), nullable=False)
    addressLine1 = Column(String(50), nullable=False)
    city = Column(String(50), nullable=False)
    country = Column(String(50), nullable=False)
    salesRepEmployeeNumber = Column(Integer, ForeignKey("employees.employeeNumber"))
    creditLimit = Column(DECIMAL(10, 2))

    # Quan hệ với bảng Orders
    orders = relationship("Order", back_populates="customer")

class Order(Base):
    __tablename__ = "orders"

    orderNumber = Column(Integer, primary_key=True, index=True)
    orderDate = Column(Date, nullable=False)
    requiredDate = Column(Date, nullable=False)
    shippedDate = Column(Date)
    status = Column(String(15), nullable=False)
    comments = Column(Text)
    customerNumber = Column(Integer, ForeignKey("customers.customerNumber"), nullable=False)

    # Quan hệ
    customer = relationship("Customer", back_populates="orders")
    order_details = relationship("OrderDetail", back_populates="order")

class OrderDetail(Base):
    __tablename__ = "orderdetails"

    orderNumber = Column(Integer, ForeignKey("orders.orderNumber"), primary_key=True)
    productCode = Column(String(15), ForeignKey("products.productCode"), primary_key=True)
    quantityOrdered = Column(Integer, nullable=False)
    priceEach = Column(DECIMAL(10, 2), nullable=False)
    orderLineNumber = Column(Integer, nullable=False)

    # Quan hệ
    order = relationship("Order", back_populates="order_details")
    product = relationship("Product")

class Product(Base):
    __tablename__ = "products"

    productCode = Column(String(15), primary_key=True)
    productName = Column(String(70), nullable=False)
    productLine = Column(String(50), ForeignKey("productlines.productLine"))
    buyPrice = Column(DECIMAL(10, 2), nullable=False)
    MSRP = Column(DECIMAL(10, 2), nullable=False)

class Employee(Base):
    __tablename__ = "employees"
    employeeNumber = Column(Integer, primary_key=True)
    lastName = Column(String(50), nullable=False)
    firstName = Column(String(50), nullable=False)
    extension = Column(String(10), nullable=False)
    email = Column(String(100), nullable=False)
    officeCode = Column(String(10), nullable=False)
    reportsTo = Column(Integer, ForeignKey("employees.employeeNumber"))
    jobTitle = Column(String(50), nullable=False)