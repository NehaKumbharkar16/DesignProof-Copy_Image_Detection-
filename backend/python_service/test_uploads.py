
import requests
import os
import uuid

def upload_to_tmpfiles(file_path):
    try:
        url = "https://tmpfiles.org/api/v1/upload"
        with open(file_path, "rb") as f:
            response = requests.post(url, files={"file": f}, timeout=20)
            if response.status_code == 200:
                data = response.json()
                if "data" in data and "url" in data["data"]:
                    return data["data"]["url"].replace("tmpfiles.org/", "tmpfiles.org/dl/")
    except Exception as e:
        print(f"Tmpfiles failed: {e}")
    return None

def upload_to_catbox(file_path):
    try:
        url = "https://litterbox.catbox.moe/objects.php"
        with open(file_path, "rb") as f:
            files = {"fileToUpload": f}
            data = {"reqtype": "fileupload", "time": "12h"}
            response = requests.post(url, files=files, data=data, timeout=20)
            if response.status_code == 200 and response.text.startswith("http"):
                return response.text.strip()
    except Exception as e:
        print(f"Catbox failed: {e}")
    return None

# Create a dummy image for testing
test_image = "test_upload.jpg"
with open(test_image, "wb") as f:
    f.write(os.urandom(1024)) # 1KB dummy file

print("Testing Tmpfiles...")
url1 = upload_to_tmpfiles(test_image)
print(f"Tmpfiles URL: {url1}")

print("\nTesting Catbox...")
url2 = upload_to_catbox(test_image)
print(f"Catbox URL: {url2}")

if url1 or url2:
    print("\nUpload test PASSED")
else:
    print("\nUpload test FAILED")

os.remove(test_image)
