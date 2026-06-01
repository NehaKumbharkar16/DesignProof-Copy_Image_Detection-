
import requests
import os
from dotenv import load_dotenv

load_dotenv()
serp_key = os.getenv("SERP_API_KEY")

print(f"Testing API Key: {serp_key}")

params = {
    "engine": "google",
    "q": "Coffee",
    "api_key": serp_key
}

try:
    response = requests.get("https://serpapi.com/search", params=params, timeout=10)
    print(f"Status Code: {response.status_code}")
    data = response.json()
    if "error" in data:
        print(f"Error: {data['error']}")
    else:
        print(f"Success! Found {len(data.get('organic_results', []))} results.")
except Exception as e:
    print(f"Exception: {e}")
