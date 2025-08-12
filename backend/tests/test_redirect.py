import pytest
from fastapi.testclient import TestClient
from datetime import datetime, timedelta

def test_dynamic_qr_redirect(client: TestClient):
    """Test dynamic QR redirect -> /r/{code} -> 302"""
    # Create dynamic QR
    response = client.post("/qr", json={
        "type": "dynamic",
        "target": "https://example.com"
    })
    
    assert response.status_code == 201
    data = response.json()
    code = data["code"]
    
    # Test redirect
    redirect_response = client.get(f"/r/{code}", allow_redirects=False)
    assert redirect_response.status_code == 302
    assert redirect_response.headers["location"] == "https://example.com"

def test_update_dynamic_target(client: TestClient):
    """Test updating dynamic target -> 302 to new URL"""
    # Create dynamic QR
    response = client.post("/qr", json={
        "type": "dynamic",
        "target": "https://old-url.com"
    })
    
    qr_id = response.json()["id"]
    code = response.json()["code"]
    
    # Update target
    update_response = client.put(f"/qr/{qr_id}/target", json={
        "target": "https://new-url.com"
    })
    
    assert update_response.status_code == 200
    
    # Test redirect to new URL
    redirect_response = client.get(f"/r/{code}", allow_redirects=False)
    assert redirect_response.status_code == 302
    assert redirect_response.headers["location"] == "https://new-url.com"

def test_password_protected_qr(client: TestClient):
    """Test password protection -> 401 then 302 with password"""
    # Create dynamic QR
    response = client.post("/qr", json={
        "type": "dynamic",
        "target": "https://protected.com"
    })
    
    qr_id = response.json()["id"]
    code = response.json()["code"]
    
    # Set password
    client.put(f"/qr/{qr_id}/target", json={
        "password": "secret123"
    })
    
    # Test redirect without password -> 401
    redirect_response = client.get(f"/r/{code}", allow_redirects=False)
    assert redirect_response.status_code == 401
    
    # Test redirect with wrong password -> 401
    wrong_password_response = client.get(f"/r/{code}?password=wrong", allow_redirects=False)
    assert wrong_password_response.status_code == 401
    
    # Test redirect with correct password -> 302
    correct_password_response = client.get(f"/r/{code}?password=secret123", allow_redirects=False)
    assert correct_password_response.status_code == 302
    assert correct_password_response.headers["location"] == "https://protected.com"

def test_rate_limiting_wrong_passwords(client: TestClient):
    """Test rate limiting for wrong passwords -> 429"""
    # Create password-protected QR
    response = client.post("/qr", json={
        "type": "dynamic",
        "target": "https://rate-limit-test.com"
    })
    
    qr_id = response.json()["id"]
    code = response.json()["code"]
    
    # Set password
    client.put(f"/qr/{qr_id}/target", json={
        "password": "correct"
    })
    
    # Make multiple wrong password attempts
    for i in range(5):
        response = client.get(f"/r/{code}?password=wrong{i}", allow_redirects=False)
        assert response.status_code == 401
    
    # Next attempt should be rate limited
    response = client.get(f"/r/{code}?password=wrong6", allow_redirects=False)
    assert response.status_code == 429

def test_expired_qr(client: TestClient):
    """Test expired QR -> 410"""
    # Create dynamic QR
    response = client.post("/qr", json={
        "type": "dynamic",
        "target": "https://expired.com"
    })
    
    qr_id = response.json()["id"]
    code = response.json()["code"]
    
    # Set expiry to past time
    past_time = datetime.utcnow() - timedelta(minutes=1)
    client.put(f"/qr/{qr_id}/target", json={
        "expiry_at": past_time.isoformat()
    })
    
    # Test redirect -> 410
    redirect_response = client.get(f"/r/{code}", allow_redirects=False)
    assert redirect_response.status_code == 410

def test_nonexistent_qr_redirect(client: TestClient):
    """Test redirect for non-existent QR -> 404"""
    response = client.get("/r/nonexistent", allow_redirects=False)
    assert response.status_code == 404