import requests

SERP_API_KEY = "79318b0fc67a652301494b53415920d232aed281edd4b3defd15886c2d89c973"
IMAGE_URL = "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/1200px-React-icon.svg.png"

def test_engine(engine, param_name):
    print(f"\n--- Testing Engine: {engine} ---")
    params = {
        "engine": engine,
        param_name: IMAGE_URL,
        "api_key": SERP_API_KEY
    }

    res = requests.get("https://serpapi.com/search", params=params, timeout=25)
    results = res.json()
    
    if engine == "google_lens":
        matches = results.get("visual_matches", []) + results.get("exact_matches", [])
    else:
        # For google_reverse_image, results are in 'image_results'
        matches = results.get("image_results", [])
    
    print(f"Total Matches: {len(matches)}")
    if matches:
        print(f"Example link: {matches[0].get('link')}")
    
    # Check for pagination
    if "serpapi_pagination" in results:
        print(f"Pagination found: {results['serpapi_pagination']}")

test_engine("google_lens", "url")
test_engine("google_reverse_image", "image_url")
