import json
from serpapi import GoogleSearch

SERP_API_KEY = "79318b0fc67a652301494b53415920d232aed281edd4b3defd15886c2d89c973"
params = {
    "engine": "google_lens",
    "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/1200px-React-icon.svg.png", 
    "api_key": SERP_API_KEY
}
search = GoogleSearch(params)
results = search.get_dict()

# Print keys we get back
print("API Response Keys:", list(results.keys()))

for k, v in results.items():
    if k in ["search_metadata", "search_parameters", "search_information"]:
        continue
    if isinstance(v, list):
        print(f"\nArray found in: {k} (Length: {len(v)})")
        if len(v) > 0:
            print(f"Sample item from {k}:\n", json.dumps(v[0], indent=2)[:500])
    
print("\nDone")
