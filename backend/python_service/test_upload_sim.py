import requests
import os

url = "http://127.0.0.1:5001/upload"
# Path to an actual image in the workspace
# I saw backend/python_service/temp_puppy.jpg in list_dir
img_path = r"d:\Internship_Gristip\DesignProof\backend\python_service\temp_puppy.jpg"

if not os.path.exists(img_path):
    print(f"Image not found at {img_path}")
    # Try another one
    img_path = r"d:\Internship_Gristip\DesignProof\backend\python_service\uploads\test_image.jpg" # dummy

try:
    with open(img_path, 'rb') as f:
        files = {'image': f}
        response = requests.post(url, files=files)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
except Exception as e:
    print(f"Request failed: {e}")
