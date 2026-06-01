import json
from serpapi import GoogleSearch

SERP_API_KEY = "79318b0fc67a652301494b53415920d232aed281edd4b3defd15886c2d89c973"
params = {
    "engine": "google_reverse_image",
    "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/1200px-React-icon.svg.png",
    "api_key": SERP_API_KEY
}
search = GoogleSearch(params)
results = search.get_dict()
if "image_results" in results:
    with open("serpapi_output.json", "w", encoding='utf-8') as f:
        json.dump(results["image_results"], f, indent=2)
print("Done writing to serpapi_output.json")
