import requests
import json

# Replace with the email address where you want to receive the test notice!
TARGET_EMAIL = "your-email@example.com" 

url = "http://127.0.0.1:5000/send-notice"

payload = {
    "email": TARGET_EMAIL,
    "website_url": "https://example-violator-website.com",
    "original_image_url": "https://example.com/my-original-art.png",
    "copied_image_url": "https://example-violator-website.com/stolen-art.png"
}

headers = {
    'Content-Type': 'application/json'
}

print(f"Testing email sending to: {TARGET_EMAIL}")
print("-" * 50)

try:
    response = requests.post(url, headers=headers, data=json.dumps(payload))
    
    if response.status_code == 200:
        print("✅ SUCCESS!")
        print("Message from server:", response.json().get("message"))
        print(f"Please check the inbox of {TARGET_EMAIL} to see the Legal Notice.")
    else:
        print("❌ FAILED!")
        print(f"Status Code: {response.status_code}")
        print("Error from server:", response.json().get("error", response.text))
        
        if "EMAIL_USER" in response.text:
            print("\n💡 TIP: It looks like you haven't set up your EMAIL_USER and EMAIL_PASS in your .env file!")
        
except Exception as e:
    print(f"❌ ERROR: Could not connect to the server. Is app.py running? \nDetails: {str(e)}")
