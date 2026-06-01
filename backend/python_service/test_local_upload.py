import requests
import os

def test_local_upload():
    # Use a real image from the workspace or download one
    image_url = "https://hips.hearstapps.com/hmg-prod/images/dog-puppy-on-garden-royalty-free-image-1586966191.jpg"
    img_data = requests.get(image_url).content
    
    files = {'image': ('puppy.jpg', img_data, 'image/jpeg')}
    
    print("Calling local Python service /upload...")
    try:
        response = requests.post("http://127.0.0.1:5001/upload", files=files, timeout=60)
        print(f"Status Code: {response.status_code}")
        data = response.json()
        print(f"Uploaded Image: {data.get('uploaded_image')}")
        print(f"Counts: {data.get('counts')}")
        print(f"Matching Websites: {len(data.get('matching_websites', []))}")
        for match in data.get('matching_websites', []):
            print(f"- {match['website_url']} ({match['similarity_score']}%)")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_local_upload()
