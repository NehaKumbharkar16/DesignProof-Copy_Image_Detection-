import os
import requests
from dotenv import load_dotenv

load_dotenv()
serp_key = os.getenv("SERP_API_KEY")

def test_serpapi():
    print(f"Testing SerpAPI with key: {serp_key[:5]}...")
    
    # Test with a known public image URL
    image_url = "https://hips.hearstapps.com/hmg-prod/images/dog-puppy-on-garden-royalty-free-image-1586966191.jpg"
    
    # 1. Reverse Image Search
    params = {
        "engine": "google_reverse_image",
        "image_url": image_url,
        "api_key": serp_key
    }
    
    try:
        response = requests.get("https://serpapi.com/search", params=params)
        data = response.json()
        
        if "error" in data:
            print(f"ERROR (Reverse Image): {data['error']}")
        else:
            matches = data.get("pages_with_matching_images", [])
            print(f"SUCCESS (Reverse Image): Found {len(matches)} matches")
            if matches:
                print(f"First match: {matches[0].get('link')}")
                
    except Exception as e:
        print(f"FAILURE (Reverse Image): {e}")

    # 2. Google Lens
    params = {
        "engine": "google_lens",
        "url": image_url,
        "api_key": serp_key
    }
    
    try:
        response = requests.get("https://serpapi.com/search", params=params)
        data = response.json()
        
        if "error" in data:
            print(f"ERROR (Google Lens): {data['error']}")
        else:
            matches = data.get("visual_matches", [])
            print(f"SUCCESS (Google Lens): Found {len(matches)} visual matches")
            if matches:
                print(f"First match: {matches[0].get('link')}")
                
    except Exception as e:
        print(f"FAILURE (Google Lens): {e}")

if __name__ == "__main__":
    test_serpapi()
