import pytest
import tempfile
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from app.main import app
from app.models import Base
from app.deps import get_db

# Create test database
TEST_DATABASE_URL = "sqlite:///./test.db"
test_engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

def override_get_db():
    try:
        db = TestSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="session")
def setup_test_db():
    # Create tables
    Base.metadata.create_all(bind=test_engine)
    yield
    # Clean up
    Base.metadata.drop_all(bind=test_engine)
    if os.path.exists("./test.db"):
        os.remove("./test.db")

@pytest.fixture
def client(setup_test_db):
    # Create test upload directory
    test_upload_dir = tempfile.mkdtemp()
    os.environ["UPLOAD_DIR"] = test_upload_dir
    
    with TestClient(app) as test_client:
        # Clear database between tests
        db = TestSessionLocal()
        try:
            from app.models import QRCode, Scan, RateLimit
            db.query(QRCode).delete()
            db.query(Scan).delete()
            db.query(RateLimit).delete()
            db.commit()
        finally:
            db.close()
        
        yield test_client
    
    # Cleanup
    import shutil
    try:
        shutil.rmtree(test_upload_dir)
    except:
        pass

@pytest.fixture
def db_session(setup_test_db):
    session = TestSessionLocal()
    try:
        yield session
    finally:
        session.close()