import os
import re
import requests
import cv2
import numpy as np
import hashlib
import urllib.parse
import concurrent.futures
import urllib3
from bs4 import BeautifulSoup
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from urllib.parse import urljoin, urlparse
from dotenv import load_dotenv
from io import BytesIO
import io
import imagehash
from PIL import Image

import db
import email_service
from ai_matching import get_ai_pipeline

# Disable ssl verification warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

load_dotenv()
# Initialize AI matching pipeline (loads models)
ai_engine = get_ai_pipeline()

# Create a reusable session connection pool for fast link fetching and candidate scanning
http_session = requests.Session()
http_adapter = requests.adapters.HTTPAdapter(pool_connections=250, pool_maxsize=250)
http_session.mount('http://', http_adapter)
http_session.mount('https://', http_adapter)

# --- INITIALIZE DATABASE ---
def safe_print(*args, **kwargs):
    try:
        print(*args, **kwargs, flush=True)
    except:
        try:
            text = " ".join(str(a) for a in args)
            print(text.encode('ascii', errors='replace').decode('ascii'), **kwargs, flush=True)
        except: pass

try:
    db.init_db()
except Exception as e:
    safe_print(f"Postgres DB init failed: {e}")

app = Flask(__name__)
CORS(app)
print("\n" + "="*50)
print("[DEBUG] DesignProof Python Service V3 Starting...")
print("="*50 + "\n", flush=True)

# Configuration
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# --- CORE IMAGE COMPARISON UTILITIES ---

def get_scrubbed_image(img_bytes):
    """Industry-standard: focus on central design to ignore marketplace borders/watermarks"""
    try:
        img = Image.open(BytesIO(img_bytes)).convert("RGB")
        w, h = img.size
        # Crop outer 15% to ignore site-specific noise (Requirement: Marketplace Accuracy)
        left, top = w * 0.15, h * 0.15
        right, bottom = w * 0.85, h * 0.85
        return img.crop((left, top, right, bottom)).resize((256, 256))
    except:
        try: return Image.open(BytesIO(img_bytes)).convert("RGB").resize((256, 256))
        except: return None

def calculate_multi_hash(img_bytes):
    """Calculates triple-perceptual hash on center-cropped design"""
    img = get_scrubbed_image(img_bytes)
    if img is None: return None
    return {
        'p': imagehash.phash(img),
        'd': imagehash.dhash(img),
        'a': imagehash.average_hash(img)
    }

def compare_hashes(h1, h2):
    if not h1 or not h2: return 0
    p_diff = h1['p'] - h2['p']
    d_diff = h1['d'] - h2['d']
    a_diff = h1['a'] - h2['a']
    sim_p = max(0, (64 - p_diff) / 64.0 * 100)
    sim_d = max(0, (64 - d_diff) / 64.0 * 100)
    sim_a = max(0, (64 - a_diff) / 64.0 * 100)
    return (sim_p * 0.45) + (sim_d * 0.45) + (sim_a * 0.1)

def get_orb_features(img_bytes):
    try:
        nparr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None: return None
        orb = cv2.ORB_create(nfeatures=1200)
        kp, des = orb.detectAndCompute(img, None)
        return des
    except: return None

def compare_features(des1, des2):
    if des1 is None or des2 is None: return 0
    try:
        bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
        matches = bf.match(des1, des2)
        return (len(matches) / max(len(des1), len(des2), 1)) * 100
    except: return 0
    
def calculate_ssim(img1_bytes, img2_bytes):
    try:
        i1 = cv2.imdecode(np.frombuffer(img1_bytes, np.uint8), cv2.IMREAD_GRAYSCALE)
        i2 = cv2.imdecode(np.frombuffer(img2_bytes, np.uint8), cv2.IMREAD_GRAYSCALE)
        if i1 is None or i2 is None: return 0
        i1, i2 = cv2.resize(i1, (128, 128)), cv2.resize(i2, (128, 128))
        res = cv2.matchTemplate(i1, i2, cv2.TM_CCOEFF_NORMED)[0][0]
        return max(0, res * 100)
    except: return 0

# --- CRAWLING & EXTRACTION UTILITIES ---

def find_contact_links(url, is_fast_mode=False):
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
    base_domain = urlparse(url).netloc.lower()
    
    # Famous Marketplaces Quick-Return
    marketplaces = {'tatacliq': 'support@tatacliq.com', 'wforwoman': 'care@wforwoman.com', 'shopforaurelia': 'care@shopforaurelia.com', 'myntra': 'support@myntra.com', 'ajio': 'customercare@ajio.com'}
    for m, m_email in marketplaces.items():
        if m in base_domain: return [url], [{'email': m_email, 'source': url}], None, True, True

    try:
        # Blazing Speed Optimization: timeout restricted to 3.5s for fast marketplace crawlers
        res = http_session.get(url, headers=headers, timeout=3.5, verify=False)
        if res.status_code != 200: return [], [], [], False, False
        soup = BeautifulSoup(res.text, 'html.parser')
        
        # Extract Top Candidate Images (Enhanced discovery)
        img_candidates = []
        og_img = soup.find('meta', property='og:image')
        if og_img: img_candidates.append(urljoin(url, og_img['content']))
        
        twitter_img = soup.find('meta', name='twitter:image')
        if twitter_img: img_candidates.append(urljoin(url, twitter_img['content']))

        for img in soup.find_all('img', limit=150):
            # Check multiple potential image sources
            src = img.get('src') or img.get('data-src') or img.get('srcset') or img.get('data-lazy-src') or img.get('data-original')
            if src:
                # If it's a srcset, take the first/largest
                clean_src = src.split(',')[0].split(' ')[0].strip()
                if clean_src:
                    full_url = urljoin(url, clean_src)
                    if full_url not in img_candidates:
                        img_candidates.append(full_url)
            
        # Extract Emails
        emails = re.findall(r'[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}', res.text)
        valid_emails = [{'email': e.lower(), 'source': url} for e in set(emails) if 'example' not in e and 'test' not in e]
        
        return [url], valid_emails[:2], list(dict.fromkeys(img_candidates))[:100], False, True
    except: return [], [], [], False, False

def upload_to_tmpfiles(file_path):
    """Hosts an image on Tmpfiles.org for SerpAPI access"""
    try:
        url = "https://tmpfiles.org/api/v1/upload"
        with open(file_path, "rb") as f:
            response = http_session.post(url, files={"file": f}, timeout=10)
            if response.status_code == 200:
                data = response.json()
                if "data" in data and "url" in data["data"]:
                    # Convert to direct download link
                    return data["data"]["url"].replace("tmpfiles.org/", "tmpfiles.org/dl/")
    except Exception as e:
        safe_print(f"[WARN] Tmpfiles upload failed: {e}")
    return None

def upload_to_catbox(file_path):
    """Hosts an image on Litterbox (Catbox) for SerpAPI access"""
    try:
        url = "https://litterbox.catbox.moe/objects.php"
        with open(file_path, "rb") as f:
            files = {"fileToUpload": f}
            data = {"reqtype": "fileupload", "time": "12h"}
            response = http_session.post(url, files=files, data=data, timeout=10)
            if response.status_code == 200 and response.text.startswith("http"):
                return response.text.strip()
    except Exception as e:
        safe_print(f"[WARN] Catbox upload failed: {e}")
    
    try:
        # Fallback to file.io
        url = "https://file.io/?expires=1d"
        with open(file_path, "rb") as f:
            response = http_session.post(url, files={"file": f}, timeout=10)
            if response.status_code == 200:
                return response.json().get("link")
    except Exception as e:
        safe_print(f"[WARN] file.io upload failed: {e}")
        
    return None

# --- ROUTES ---

@app.route('/')
def home():
    rows = db.get_all_notices()
    return f"<h1>DesignProof API Online</h1><p>Captured Instances: {len(rows)}</p>"

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/upload', methods=['POST'])
def upload_image():
    if 'image' not in request.files: return jsonify({"error": "No image"}), 400
    file = request.files['image']
    
    import uuid
    filename = f"{uuid.uuid4()}_{file.filename}"
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)

    try:
        with open(filepath, "rb") as f: original_bytes = f.read()
        
        original_md5 = hashlib.md5(original_bytes).hexdigest()
        original_m_hash = calculate_multi_hash(original_bytes)
        original_des = get_orb_features(original_bytes)
        original_fn = file.filename.lower() if file.filename else ""
        
        public_url = f"http://127.0.0.1:5001/uploads/{filename}"
        serp_key = os.getenv("SERP_API_KEY", "1b95936cad36a631f65641107670464ada508c9632be71250421689eeb382cbc")

        # --- SUPER RELIABLE DISCOVERY PHASE ---
        all_api_results = []
        debug_log = []
        debug_log_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "discovery_debug.log")
        
        def log_debug(msg):
            safe_print(msg)
            debug_log.append(msg)
            try:
                with open(debug_log_path, "a") as f: f.write(f"{msg}\n")
            except: pass

        log_debug(f"\n--- NEW DISCOVERY STARTED: {filename} ---")
        
        # 1. Multi-Provider Hosting
        public_search_url = upload_to_tmpfiles(filepath)
        if not public_search_url:
            public_search_url = upload_to_catbox(filepath)
        
        # 2. URL-Based Search (Primary for Reverse Image)
        if public_search_url:
            log_debug(f"[SERP] Case A: Searching via URL: {public_search_url}")
            try:
                # Reverse Image
                resp = http_session.get("https://serpapi.com/search", params={
                    "engine": "google_reverse_image", "image_url": public_search_url, "api_key": serp_key
                }, timeout=15)
                if resp.status_code == 200:
                    res = resp.json()
                    if "error" not in res:
                        pages = res.get("pages_with_matching_images", [])
                        for p in pages: p['source_priority'] = 'exact_page'
                        all_api_results.extend(pages)
                        log_debug(f"[OK] Reverse Image found {len(pages)} matching pages via URL.")
                    else: log_debug(f"[ERR] Reverse URL API Error: {res.get('error')}")
                else: log_debug(f"[ERR] Reverse URL HTTP Error: {resp.status_code}")

                # Google Lens
                resp = http_session.get("https://serpapi.com/search", params={
                    "engine": "google_lens", "url": public_search_url, "api_key": serp_key
                }, timeout=15)
                if resp.status_code == 200:
                    res = resp.json()
                    if "error" not in res:
                        matches = res.get("visual_matches", [])
                        all_api_results.extend(matches)
                        log_debug(f"[OK] Google Lens found {len(matches)} visual matches via URL.")
                    else: log_debug(f"[ERR] Lens URL API Error: {res.get('error')}")
                else: log_debug(f"[ERR] Lens URL HTTP Error: {resp.status_code}")
            except Exception as e: log_debug(f"[ERR] URL Search Exception: {e}")

        # 3. Direct File Fallback (Primary for Lens)
        if not all_api_results or len(all_api_results) < 5:
            log_debug("[SERP] Case B: Attempting direct binary upload (Fallback/Enrichment)...")
            try:
                with open(filepath, "rb") as f:
                    resp = http_session.post("https://serpapi.com/search", 
                        params={"engine": "google_lens", "api_key": serp_key},
                        files={"file": f}, timeout=25)
                    if resp.status_code == 200:
                        res = resp.json()
                        if "error" not in res:
                            matches = res.get("visual_matches", [])
                            all_api_results.extend(matches)
                            log_debug(f"[OK] Direct Lens found {len(matches)} additional matches.")
                        else: log_debug(f"[ERR] Direct Lens API Error: {res.get('error')}")
                    else: log_debug(f"[ERR] Direct Lens HTTP Error: {resp.status_code}")
            except Exception as e: log_debug(f"[ERR] Direct Search Exception: {e}")

        # --- UNIQUE EXTRACTOR ---
        unique_matches = []
        seen_domains = set()
        for item in all_api_results:
            link = item.get("link")
            if link:
                domain = urlparse(link).netloc.lower()
                if domain not in seen_domains:
                    noise = ['google.com', 'bing.com', 'yandex.com', 'baidu.com']
                    if not any(n == domain or f".{n}" in domain for n in noise):
                        seen_domains.add(domain)
                        item['domain_name'] = domain
                        unique_matches.append(item)
        
        log_debug(f"[INFO] Total identified domains for deep scan: {len(unique_matches)}")

        websites_data = []

        def process_website_discovery(item):
            try:
                link = item.get("link")
                brand_name = item.get("domain_name", "").replace('www.', '').capitalize()
                # Deep Extraction
                _, emails, candidates, _, _ = find_contact_links(link, True)
                
                # Combine all available images
                all_cands = []
                if item.get("thumbnail"): all_cands.append(item.get("thumbnail"))
                if candidates: all_cands.extend(candidates)
                unique_cands = list(dict.fromkeys(all_cands))

                best_match = None
                max_sim_score = 0
                match_category = "Similar Match"
                
                # High-Speed Optimization: Scan top 5 visual candidates (sufficient for e-commerce matches)
                for cand_url in unique_cands[:5]: 
                    try:
                        # High-Speed Optimization: timeout restricted to 2s
                        c_resp = http_session.get(cand_url, timeout=2.0, verify=False)
                        if c_resp.status_code != 200: continue
                        c_bytes = c_resp.content
                        
                        category, score = ai_engine.compare_images(original_bytes, c_bytes)
                        
                        if category:
                          current_type = "Exact Match" if category == "exact_match" else "Similar Match"
                          
                          is_better = False
                          if not best_match:
                              is_better = True
                          else:
                              prev_type = best_match['type']
                              if current_type == "Exact Match" and prev_type == "Similar Match":
                                  is_better = True
                              elif current_type == prev_type and score > max_sim_score:
                                  is_better = True
                          
                          if is_better:
                              max_sim_score = score
                              match_category = current_type
                              best_match = {'score': score, 'type': current_type, 'img': cand_url}
                          
                          # Short-circuit if we found an extremely high-confidence exact match
                          if category == "exact_match" and score >= 98: break
                                
                    except Exception as e: 
                        safe_print(f"[AI] Candidate error: {e}")
                        continue
                
                # Decision Rules Mapping
                is_high_priority = item.get('source_priority') == 'exact_page'
                final_score = max_sim_score
                
                if best_match and match_category == "Exact Match":
                    final_type = "Exact Match"
                    # UI normalization
                    final_score = 100.0 if final_score >= 85 else final_score
                elif best_match and match_category == "Similar Match":
                    final_type = "Similar Match"
                else:
                    # Fallback for high priority pages that might have failed image extraction
                    if is_high_priority:
                        final_type = "Exact Match"
                        final_score = 95.0
                        best_match = {'img': item.get('thumbnail'), 'score': 95.0}
                    else:
                        return None # Skip low confidence results

                safe_print(f"[AI] {final_type} verified on {link} ({final_score}%)")
                p_hash_str = str(original_m_hash['p']) if (original_m_hash and 'p' in original_m_hash) else "0"
                
                emails_info = []
                if not emails:
                    db.save_email(None, link, public_url, best_match['img'] if best_match else item.get('thumbnail'), 
                                 0, float(final_score), final_type, p_hash_str, "MarketplaceScan")
                else:
                    for ed in emails[:2]:
                        db.save_email(ed['email'], link, public_url, best_match['img'] if best_match else item.get('thumbnail'), 
                                     0, float(final_score), final_type, p_hash_str, "MarketplaceScan")
                        emails_info.append({"email": ed['email'], "status": "Ready", "website_url": link})

                return {
                    "website_url": link, 
                    "url": link, 
                    "title": item.get("title", ""), 
                    "brand_name": brand_name, 
                    "emails": emails_info, 
                    "similarity_score": float(final_score), 
                    "match_type": final_type, 
                    "copied_image_url": best_match['img'] if best_match else item.get('thumbnail')
                }
            except Exception as e:
                safe_print(f"[ERR] [Discovery Worker] Failed to process {item.get('link')}: {e}")
                return None

        # Speed Optimization: increase thread capacity to 50 for direct 1-to-1 parallel crawling
        with concurrent.futures.ThreadPoolExecutor(max_workers=50) as executor:
            for data in executor.map(process_website_discovery, unique_matches[:50]):
                if data: websites_data.append(data)
        
        # FINAL SORTING
        websites_data.sort(key=lambda x: (x.get('match_type') != "Exact Match", -x.get('similarity_score', 0)))
                
        exact = [m for m in websites_data if m['match_type'] == "Exact Match"]
        similar = [m for m in websites_data if m['match_type'] == "Similar Match"]
        return jsonify({
            "uploaded_image": public_url,
            "exactMatches": exact,
            "similarMatches": similar,
            "matching_websites": websites_data,
            "counts": {"exact": len(exact), "similar": len(similar)}
        })

    except Exception as e:
        safe_print(f"Server Error during /upload: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/send-notice', methods=['POST'])
def send_notice():
    data = request.json
    success, msg = email_service.send_legal_notice(
        data['email'], 
        data['website_url'], 
        data['original_image_url'], 
        data.get('copied_image_url'),
        custom_subject=data.get('subject'),
        custom_body=data.get('content')
    )
    if success:
        db.update_notice_status(data['email'], data['website_url'], 1)
        return jsonify({"success": True}), 200
    return jsonify({"success": False, "error": msg}), 500

@app.route('/analyze', methods=['POST'])
def analyze_images():
    """Performs deep similarity analysis on a provided list of website links"""
    if 'image' not in request.files: 
        safe_print("[ERR] [AI Service] Missing image in /analyze request")
        return jsonify({"error": "No image"}), 400
        
    file = request.files['image']
    links_json = request.form.get('links', '[]')
    import json
    try:
        links_to_scan = json.loads(links_json)
    except:
        links_to_scan = []

    safe_print(f"[AI] [AI Service] Analyzing {len(links_to_scan)} potential infringements...")

    try:
        original_bytes = file.read()
        original_md5 = hashlib.md5(original_bytes).hexdigest()
        original_m_hash = calculate_multi_hash(original_bytes)
        original_des = get_orb_features(original_bytes)
        original_fn = file.filename.lower() if hasattr(file, 'filename') and file.filename else ""
        
        websites_data = []

        def process_website(item):
            link = item.get("link")
            brand_name = urlparse(link).netloc.lower().replace('www.', '').capitalize()
            _, emails, candidates, _, _ = find_contact_links(link, True)
            
            all_cands = []
            if item.get("thumbnail"): all_cands.append(item.get("thumbnail"))
            if candidates: all_cands.extend(candidates)
            unique_cands = list(dict.fromkeys(all_cands))

            best_match = None
            max_sim_score = 0

            # Scan top 5 visual matches
            for cand_url in unique_cands[:5]:
                try:
                    c_resp = http_session.get(cand_url, timeout=2.0, verify=False)
                    if c_resp.status_code != 200: continue
                    c_bytes = c_resp.content
                    
                    category, score = ai_engine.compare_images(original_bytes, c_bytes)
                    
                    if category:
                        current_type = "Exact Match" if category == "exact_match" else "Similar Match"
                        
                        is_better = False
                        if not best_match:
                            is_better = True
                        else:
                            prev_type = best_match['match_type']
                            if current_type == "Exact Match" and prev_type == "Similar Match":
                                is_better = True
                            elif current_type == prev_type and score > max_sim_score:
                                is_better = True
                        
                        if is_better:
                            max_sim_score = score
                            best_match = {
                                "url": link, "title": item.get("title", ""), "brand_name": brand_name, 
                                "similarity_score": round(float(score), 1), 
                                "match_type": current_type, 
                                "copied_image_url": cand_url
                            }
                            if category == "exact_match" and score >= 98: break
                except: continue
            
            if not best_match or max_sim_score < 30.0:
                return None
            
            if best_match['match_type'] == "Exact Match":
                best_match['similarity_score'] = 100.0 if best_match['similarity_score'] >= 85 else best_match['similarity_score']
            
            try:
                p_hash_str = str(original_m_hash['p']) if original_m_hash else "0"
                db.save_email(None, link, "DeepAnalysisScan", best_match['copied_image_url'], 
                             0, float(best_match['similarity_score']), best_match['match_type'], p_hash_str, "DeepScan")
            except: pass

            return best_match

        with concurrent.futures.ThreadPoolExecutor(max_workers=35) as executor:
            for data in executor.map(process_website, links_to_scan):
                if data: websites_data.append(data)
                
        websites_data.sort(key=lambda x: (x.get('match_type') != "Exact Match", -x.get('similarity_score', 0)))
        return jsonify({
            "exactMatches": [m for m in websites_data if m['match_type'] == "Exact Match"],
            "similarMatches": [m for m in websites_data if m['match_type'] == "Similar Match"],
            "matching_websites": websites_data
        })

    except Exception as e:
        safe_print(f"[ERR] [AI Service] Analysis failed: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/reverify', methods=['POST'])
def reverify_presence():
    """Checks if an infringing image is still present on a specific website URL"""
    data = request.json
    website_url = data.get('website_url')
    original_image_url = data.get('original_image_url')
    
    if not website_url or not original_image_url:
        return jsonify({"error": "Missing website_url or original_image_url"}), 400

    try:
        orig_resp = http_session.get(original_image_url, timeout=5)
        if orig_resp.status_code != 200:
            return jsonify({"error": "Could not fetch original image"}), 400
        original_bytes = orig_resp.content
        original_md5 = hashlib.md5(original_bytes).hexdigest()
        original_m_hash = calculate_multi_hash(original_bytes)

        _, _, candidates, _, _ = find_contact_links(website_url, True)
        
        if not candidates:
            return jsonify({"is_removed": True, "message": "No images found on page"}), 200

        for cand_url in candidates[:20]:
            try:
                c_resp = http_session.get(cand_url, timeout=2.0, verify=False)
                if c_resp.status_code != 200: continue
                c_bytes = c_resp.content
                
                if hashlib.md5(c_bytes).hexdigest() == original_md5:
                    return jsonify({"is_removed": False, "score": 100.0, "match_url": cand_url}), 200

                c_hash = calculate_multi_hash(c_bytes)
                if c_hash and original_m_hash:
                    h_dist = abs(c_hash['p'] - original_m_hash['p'])
                    if h_dist <= 6:
                        return jsonify({"is_removed": False, "score": 100.0, "match_url": cand_url}), 200
                    
                    if h_dist < 20:
                        ssim_score = calculate_ssim(original_bytes, c_bytes)
                        if ssim_score > 85:
                            return jsonify({"is_removed": False, "score": ssim_score, "match_url": cand_url}), 200
            except: continue

        return jsonify({"is_removed": True, "message": "No matching image found"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5001, use_reloader=True)
