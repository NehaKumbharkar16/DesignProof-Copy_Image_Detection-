import requests

url = "http://localhost:5000/upload" # Node service upload route
img_path = r"d:\Internship_Gristip\DesignProof\backend\python_service\temp_puppy.jpg"

# Note: We need a token because of 'protect' middleware
# I'll try to login first or just use a mock request if I can skip it
# Actually, the user setting showed no auth for /upload? 
# Wait, uploadRoutes.js: router.post('/upload', protect, ...)
# So I need a token.

# Let's try to get a token by registering/logging in
login_url = "http://localhost:5000/api/auth/login"
login_data = {"email": "dev@designproof.ai", "password": "password123"} # Mock

try:
    # First try login
    sess = requests.Session()
    # Mock registration if login fails
    reg_url = "http://localhost:5000/api/auth/register"
    sess.post(reg_url, json={
        "firstName": "Dev", 
        "lastName": "User", 
        "email": "dev@designproof.ai", 
        "password": "password123"
    })
    
    login_res = sess.post(login_url, json=login_data)
    token = login_res.json().get('token')
    
    if token:
        headers = {"Authorization": f"Bearer {token}"}
        with open(img_path, 'rb') as f:
            files = {'image': f}
            response = sess.post(url, files=files, headers=headers)
            print(f"Status: {response.status_code}")
            print(f"Response: {response.text[:500]}")
    else:
        print(f"Login failed: {login_res.text}")
except Exception as e:
    print(f"Request failed: {e}")
