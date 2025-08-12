import pytest
from fastapi.testclient import TestClient

def test_create_static_qr_png_svg(client: TestClient):
    """Test creating static QR and fetching PNG & SVG -> 200"""
    response = client.post("/qr", json={
        "type": "static",
        "content": "https://example.com",
        "formats": ["png", "svg"]
    })
    
    assert response.status_code == 201
    data = response.json()
    
    assert data["type"] == "static"
    assert data["content"] == "https://example.com"
    assert "png" in data["download_urls"]
    assert "svg" in data["download_urls"]
    
    # Test fetching the generated images
    png_url = data["download_urls"]["png"]
    svg_url = data["download_urls"]["svg"]
    
    # Extract filename from URL
    png_filename = png_url.split("/")[-1]
    svg_filename = svg_url.split("/")[-1]
    
    # Test PNG download
    png_response = client.get(f"/uploads/{png_filename}")
    assert png_response.status_code == 200
    
    # Test SVG download
    svg_response = client.get(f"/uploads/{svg_filename}")
    assert svg_response.status_code == 200

def test_create_dynamic_qr(client: TestClient):
    """Test creating dynamic QR"""
    response = client.post("/qr", json={
        "type": "dynamic",
        "target": "https://example.com",
        "name": "Test Dynamic QR"
    })
    
    assert response.status_code == 201
    data = response.json()
    
    assert data["type"] == "dynamic"
    assert data["target"] == "https://example.com"
    assert data["name"] == "Test Dynamic QR"
    assert "png" in data["download_urls"]

def test_list_qr_codes(client: TestClient):
    """Test listing QR codes"""
    # Create a QR first
    client.post("/qr", json={
        "type": "static",
        "content": "https://test.com"
    })
    
    response = client.get("/qr")
    assert response.status_code == 200
    data = response.json()
    
    assert len(data) >= 1
    assert data[0]["type"] == "static"
    assert data[0]["content"] == "https://test.com"

def test_get_qr_by_id(client: TestClient):
    """Test getting QR by ID"""
    # Create a QR first
    create_response = client.post("/qr", json={
        "type": "static",
        "content": "https://gettest.com"
    })
    
    qr_id = create_response.json()["id"]
    
    response = client.get(f"/qr/{qr_id}")
    assert response.status_code == 200
    data = response.json()
    
    assert data["id"] == qr_id
    assert data["content"] == "https://gettest.com"

def test_update_qr_code(client: TestClient):
    """Test updating QR code metadata"""
    # Create a QR first
    create_response = client.post("/qr", json={
        "type": "static",
        "content": "https://update-test.com"
    })
    
    qr_id = create_response.json()["id"]
    
    # Update the QR
    response = client.patch(f"/qr/{qr_id}", json={
        "name": "Updated Name",
        "folder": "test-folder"
    })
    
    assert response.status_code == 200
    data = response.json()
    
    assert data["name"] == "Updated Name"
    assert data["folder"] == "test-folder"

def test_delete_qr_code(client: TestClient):
    """Test deleting QR code"""
    # Create a QR first
    create_response = client.post("/qr", json={
        "type": "static",
        "content": "https://delete-test.com"
    })
    
    qr_id = create_response.json()["id"]
    
    # Delete the QR
    response = client.delete(f"/qr/{qr_id}")
    assert response.status_code == 204
    
    # Verify it's gone
    get_response = client.get(f"/qr/{qr_id}")
    assert get_response.status_code == 404