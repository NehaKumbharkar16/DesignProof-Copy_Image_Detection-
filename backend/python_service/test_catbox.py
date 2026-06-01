import requests

def test_catbox():
    with open('test_file.txt', 'w') as f:
        f.write('hello world')
    
    with open('test_file.txt', 'rb') as f:
        try:
            r = requests.post(
                'https://catbox.moe/user/api.php', 
                data={'reqtype': 'fileupload'}, 
                files={'fileToUpload': f}
            )
            print("Catbox:", r.text)
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    test_catbox()
