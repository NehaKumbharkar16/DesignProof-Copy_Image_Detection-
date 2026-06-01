
import requests
import os

def test_upload():
    # Create a small test image
    with open("test.txt", "w") as f: f.write("test")
    
    url = "https://tmpfiles.org/api/v1/upload"
    try:
        with open("test.txt", "rb") as f:
            response = requests.post(url, files={"file": f}, timeout=20)
            print(f"Status: {response.status_code}")
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_upload()
