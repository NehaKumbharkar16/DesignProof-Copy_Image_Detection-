import requests
import json

url = "http://127.0.0.1:5001/upload"
filepath = "uploads/saree.webp"

with open(filepath, "rb") as f:
    files = {"image": f}
    response = requests.post(url, files=files)
    
if response.status_code == 200:
    data = response.json()
    print("MATCHES (EXACT):", len(data.get("exactMatches", [])))
    print("MATCHES (SIMILAR):", len(data.get("similarMatches", [])))
    for m in data.get("exactMatches", []):
        print(f"EXACT: {m.get('url')} | SCORE: {m.get('similarity_score')}")
    for m in data.get("similarMatches", [])[:5]:
        print(f"SIMILAR: {m.get('url')} | SCORE: {m.get('similarity_score')}")
else:
    print(f"Error {response.status_code}: {response.text}")
