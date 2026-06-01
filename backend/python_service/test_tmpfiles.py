import requests

def test_tmpfiles():
    url = "https://tmpfiles.org/api/v1/upload"
    # Create a dummy image
    img_data = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc\xf8\xff\xff?\x00\x05\xfe\x02\xfe\xdcG\xe1\x00\x00\x00\x00IEND\xaeB`\x82"
    
    files = {"file": ("test.png", img_data, "image/png")}
    print("Uploading to Tmpfiles...")
    try:
        response = requests.post(url, files=files, timeout=20)
        print(f"Status: {response.status_code}")
        data = response.json()
        if "data" in data and "url" in data["data"]:
            dl_url = data["data"]["url"].replace("tmpfiles.org/", "tmpfiles.org/dl/")
            print(f"Success: {dl_url}")
        else:
            print(f"Failed: {data}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_tmpfiles()
