import requests

SERP_API_KEY = "79318b0fc67a652301494b53415920d232aed281edd4b3defd15886c2d89c973"
IMAGE_URL = "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/1200px-React-icon.svg.png"

params = {
    "engine": "google_lens",
    "url": IMAGE_URL,
    "api_key": SERP_API_KEY
}

res = requests.get("https://serpapi.com/search", params=params, timeout=25)
results = res.json()

matching_links = results.get("visual_matches", [])
exact_matches = results.get("exact_matches", [])
total_count = len(matching_links) + len(exact_matches)

print(f"Total Matches from API: {total_count}")
print(f"Exact Matches: {len(exact_matches)}")
print(f"Visual Matches: {len(matching_links)}")

from urllib.parse import urlparse
domains = [urlparse(m.get('link', '')).netloc for m in (exact_matches + matching_links)]
unique_domains = set(domains)
print(f"Unique Domains: {len(unique_domains)}")

ignored_domains = [
    'play.google.com', 'google.com', 'pinterest.com', 'instagram.com',
    'facebook.com', 'twitter.com', 'x.com', 'linkedin.com', 'reddit.com',
    'youtube.com', 'tiktok.com', 'apple.com', 'apps.apple.com'
]
filtered_domains = [d for d in unique_domains if not any(ign in d.lower() for ign in ignored_domains)]
print(f"Filtered (after domain limit and social filter): {len(filtered_domains)}")
