import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

# Chuỗi kết nối Database. Hãy đảm bảo thay đổi user, password và port cho phù hợp với máy của bạn.
# Mặc định ở đây dùng pymysql làm driver cho MySQL.
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "mysql+pymysql://root:31012005@localhost:3306/classicmodels"
)

# Tạo Engine kết nối
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Tạo SessionLocal để tương tác với cơ sở dữ liệu
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class để các ORM model khác kế thừa
Base = declarative_base()

# Dependency để FastAPI tự động cấp phát và thu hồi database session cho mỗi request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()