import requests
import json

url = "http://127.0.0.1:5001/upload"
img_path = r"d:\Internship_Gristip\DesignProof\backend\python_service\temp_puppy.jpg"

with open(img_path, 'rb') as f:
    files = {'image': f}
    response = requests.post(url, files=files)
    data = response.json()
    with open('test_resp.json', 'w', encoding='utf-8') as jf:
        json.dump(data, jf, indent=4)
    print(f"Status: {response.status_code}")
    print(f"Saved to test_resp.json")
