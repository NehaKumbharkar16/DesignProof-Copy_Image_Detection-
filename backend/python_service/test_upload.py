import requests
import warnings
warnings.filterwarnings('ignore', message='Unverified HTTPS request')

with open('test_image.txt', 'wb') as f:
    f.write(b"fake image data here")

with open('test_image.txt', 'rb') as f:
    try:
        req = requests.post(
            'https://litterbox.catbox.moe/resources/internals/api.php',
            data={'reqtype': 'fileupload', 'time': '1h'},
            files={'fileToUpload': f},
            verify=False
        )
        print("Litterbox:", req.text)
    except Exception as e:
        print("Error:", e)
