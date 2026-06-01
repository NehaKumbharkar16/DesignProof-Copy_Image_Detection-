import os
import requests
from dotenv import load_dotenv

load_dotenv()
serp_key = os.getenv("SERP_API_KEY")

def test_serpapi_file():
    print(f"Testing SerpAPI FILE UPLOAD with key: {serp_key[:5]}...")
    
    # 1. Download image to a temp file
    image_url = "https://hips.hearstapps.com/hmg-prod/images/dog-puppy-on-garden-royalty-free-image-1586966191.jpg"
    img_data = requests.get(image_url).content
    with open("temp_puppy.jpg", "wb") as f: f.write(img_data)
    
    # 2. Reverse Image Search via POST
    params = {
        "engine": "google_reverse_image",
        "api_key": serp_key
    }
    files = {"file": open("temp_puppy.jpg", "rb")}
    
    try:
        print("Sending POST request to SerpAPI (Reverse Image)...")
        response = requests.post("https://serpapi.com/search.json", data=params, files=files)
        print(f"Raw Status: {response.status_code}")
        if response.status_code != 200:
            print(f"Raw Text: {response.text[:500]}")
        data = response.json()
        
        if "error" in data:
            print(f"ERROR: {data['error']}")
        else:
            matching_pages = data.get("pages_with_matching_images", [])
            print(f"SUCCESS: Found {len(matching_pages)} matching pages")
                
    except Exception as e:
        print(f"FAILURE: {e}")

    # 3. Google Lens via POST
    params = {
        "engine": "google_lens",
        "api_key": serp_key
    }
    files = {"file": open("temp_puppy.jpg", "rb")}
    
    try:
        print("Sending POST request to SerpAPI (Google Lens)...")
        response = requests.post("https://serpapi.com/search.json", data=params, files=files)
        data = response.json()
        
        if "error" in data:
            print(f"ERROR: {data['error']}")
        else:
            matches = data.get("visual_matches", [])
            print(f"SUCCESS: Found {len(matches)} visual matches")
                
    except Exception as e:
        print(f"FAILURE: {e}")

if __name__ == "__main__":
    test_serpapi_file()
