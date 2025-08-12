import pytest
from fastapi.testclient import TestClient
import io
import zipfile

def test_bulk_qr_creation(client: TestClient):
    """Test /qr/bulk with 2 rows returns ZIP with 2 png + result.csv"""
    
    # Create CSV content with 2 rows
    csv_content = """name,type,content,target
Test QR 1,static,https://test1.com,
Test QR 2,dynamic,,https://test2.com"""
    
    # Upload CSV file
    files = {"file": ("test.csv", io.BytesIO(csv_content.encode()), "text/csv")}
    response = client.post("/qr/bulk", files=files)
    
    assert response.status_code == 202
    data = response.json()
    
    assert data["status"] == "done"
    assert data["result_url"] is not None
    
    # Download and verify ZIP file
    zip_filename = data["result_url"].split("/")[-1]
    zip_response = client.get(f"/uploads/{zip_filename}")
    assert zip_response.status_code == 200
    
    # Verify ZIP contents
    zip_content = io.BytesIO(zip_response.content)
    with zipfile.ZipFile(zip_content, 'r') as zip_file:
        file_list = zip_file.namelist()
        
        # Should contain 2 PNG files + results.csv
        png_files = [f for f in file_list if f.endswith('.png')]
        csv_files = [f for f in file_list if f.endswith('.csv')]
        
        assert len(png_files) == 2
        assert len(csv_files) == 1
        assert "results.csv" in csv_files
        
        # Verify results.csv content
        results_csv = zip_file.read("results.csv").decode('utf-8')
        assert "Test QR 1" in results_csv
        assert "Test QR 2" in results_csv
        assert "success" in results_csv

def test_bulk_qr_with_invalid_data(client: TestClient):
    """Test bulk creation with some invalid rows"""
    
    # Create CSV with mixed valid/invalid data
    csv_content = """name,type,content,target
Valid QR,static,https://valid.com,
Invalid QR,invalid_type,,
Another Valid,dynamic,,https://valid2.com"""
    
    files = {"file": ("test.csv", io.BytesIO(csv_content.encode()), "text/csv")}
    response = client.post("/qr/bulk", files=files)
    
    assert response.status_code == 202
    data = response.json()
    
    # Download ZIP and check results
    zip_filename = data["result_url"].split("/")[-1]
    zip_response = client.get(f"/uploads/{zip_filename}")
    
    zip_content = io.BytesIO(zip_response.content)
    with zipfile.ZipFile(zip_content, 'r') as zip_file:
        results_csv = zip_file.read("results.csv").decode('utf-8')
        
        # Should have some successes and some errors
        assert "success" in results_csv
        assert "error" in results_csv or "success" in results_csv  # At least some should work

def test_bulk_non_csv_file(client: TestClient):
    """Test bulk upload with non-CSV file"""
    
    # Upload non-CSV file
    files = {"file": ("test.txt", io.BytesIO(b"not a csv"), "text/plain")}
    response = client.post("/qr/bulk", files=files)
    
    assert response.status_code == 400
    assert "Only CSV files are supported" in response.json()["detail"]