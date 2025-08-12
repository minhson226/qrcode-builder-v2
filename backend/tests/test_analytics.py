import pytest
from fastapi.testclient import TestClient

def test_analytics_summarizes_scans(client: TestClient):
    """Test /analytics summarizes >= 2 scans"""
    
    # Create dynamic QR
    response = client.post("/qr", json={
        "type": "dynamic",
        "target": "https://analytics-test.com"
    })
    
    qr_id = response.json()["id"]
    code = response.json()["code"]
    
    # Simulate multiple scans by accessing the redirect endpoint
    for i in range(3):
        client.get(f"/r/{code}", allow_redirects=False)
    
    # Get analytics
    analytics_response = client.get(f"/analytics/qr/{qr_id}/summary")
    assert analytics_response.status_code == 200
    
    data = analytics_response.json()
    assert data["total_scans"] >= 2
    assert data["total_scans"] == 3  # Should be exactly 3 from our test
    assert "by_day" in data
    assert "top_countries" in data

def test_analytics_with_range_parameter(client: TestClient):
    """Test analytics with range parameter"""
    
    # Create dynamic QR
    response = client.post("/qr", json={
        "type": "dynamic",
        "target": "https://range-test.com"
    })
    
    qr_id = response.json()["id"]
    code = response.json()["code"]
    
    # Simulate some scans
    for i in range(2):
        client.get(f"/r/{code}", allow_redirects=False)
    
    # Get analytics with range
    analytics_response = client.get(f"/analytics/qr/{qr_id}/summary?range=last_7d")
    assert analytics_response.status_code == 200
    
    data = analytics_response.json()
    assert data["total_scans"] >= 2

def test_analytics_for_nonexistent_qr(client: TestClient):
    """Test analytics for non-existent QR"""
    
    response = client.get("/analytics/qr/nonexistent/summary")
    # Should return empty analytics rather than error
    assert response.status_code == 200
    
    data = response.json()
    assert data["total_scans"] == 0
    assert data["unique_scans"] == 0

def test_analytics_empty_for_new_qr(client: TestClient):
    """Test analytics for QR with no scans"""
    
    # Create QR but don't scan it
    response = client.post("/qr", json={
        "type": "dynamic",
        "target": "https://no-scans.com"
    })
    
    qr_id = response.json()["id"]
    
    # Get analytics
    analytics_response = client.get(f"/analytics/qr/{qr_id}/summary")
    assert analytics_response.status_code == 200
    
    data = analytics_response.json()
    assert data["total_scans"] == 0
    assert data["unique_scans"] == 0
    assert data["by_day"] == []
    assert data["top_countries"] == []