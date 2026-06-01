
import requests
import os
from dotenv import load_dotenv

load_dotenv()
serp_key = os.getenv("SERP_API_KEY")

try:
    response = requests.get(f"https://serpapi.com/account?api_key={serp_key}")
    print(f"Status Code: {response.status_code}")
    print(response.json())
except Exception as e:
    print(f"Exception: {e}")
