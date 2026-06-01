import os
import torch
from PIL import Image
import imagehash
import numpy as np
import cv2
from sentence_transformers import SentenceTransformer, util
import requests
from io import BytesIO

class AIMatchingPipeline:
    def __init__(self):
        print("[AI] Initializing Multi-Stage Matching Pipeline...")
        # Stage 3: Load CLIP model (using sentence-transformers for efficiency)
        # Using a compact CLIP model
        self.model = SentenceTransformer('clip-ViT-B-32')
        print("[AI] CLIP Model loaded successfully.")

    def get_perceptual_hashes(self, img_pil):
        """Stage 1: Perceptual Hashing"""
        return {
            'phash': imagehash.phash(img_pil),
            'dhash': imagehash.dhash(img_pil),
            'ahash': imagehash.average_hash(img_pil)
        }

    def extract_subject(self, img_np):
        """Stage 2: Object-focused Subject Extraction (Improved Center-Biased Bounding Box)"""
        try:
            h_img, w_img = img_np.shape[:2]
            gray = cv2.cvtColor(img_np, cv2.COLOR_BGR2GRAY)
            blurred = cv2.GaussianBlur(gray, (5, 5), 0)
            edged = cv2.Canny(blurred, 30, 100) # Lower thresholds for better recall
            
            contours, _ = cv2.findContours(edged, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            if not contours:
                return img_np
            
            # Find the best contour: Large enough and close to center
            best_bbox = (0, 0, w_img, h_img)
            max_score = 0
            img_center = (w_img // 2, h_img // 2)
            
            for cnt in contours:
                area = cv2.contourArea(cnt)
                if area < (h_img * w_img * 0.05): continue # Ignore tiny noise
                
                x, y, w, h = cv2.boundingRect(cnt)
                cnt_center = (x + w // 2, y + h // 2)
                
                # Distance from center (normalized 0 to 1)
                dist = np.sqrt((cnt_center[0] - img_center[0])**2 + (cnt_center[1] - img_center[1])**2)
                norm_dist = dist / np.sqrt(img_center[0]**2 + img_center[1]**2)
                
                # Score = Area * (1 - Distance)
                score = area * (1.0 - norm_dist)
                
                if score > max_score:
                    max_score = score
                    best_bbox = (x, y, w, h)
            
            x, y, w, h = best_bbox
            # Pad the bounding box (10% padding)
            px, py = int(w * 0.1), int(h * 0.1)
            x = max(0, x - px)
            y = max(0, y - px)
            w = min(w_img - x, w + 2 * px)
            h = min(h_img - y, h + 2 * px)
            
            return img_np[y:y+h, x:x+w]
        except Exception as e:
            print(f"[AI] Subject extraction failed: {e}")
            return img_np

    def get_embeddings(self, img_pil):
        """Stage 3: Embedding Extraction"""
        return self.model.encode(img_pil)

    def get_color_similarity(self, img_np1, img_np2):
        """Computes histogram correlation in HSV space to ensure color consistency."""
        try:
            # Resize for speed
            img1 = cv2.resize(img_np1, (128, 128))
            img2 = cv2.resize(img_np2, (128, 128))
            
            hsv1 = cv2.cvtColor(img1, cv2.COLOR_RGB2HSV)
            hsv2 = cv2.cvtColor(img2, cv2.COLOR_RGB2HSV)
            
            # Calculate histograms for H and S channels (ignore V to be light-invariant)
            hist1 = cv2.calcHist([hsv1], [0, 1], None, [50, 60], [0, 180, 0, 256])
            hist2 = cv2.calcHist([hsv2], [0, 1], None, [50, 60], [0, 180, 0, 256])
            
            cv2.normalize(hist1, hist1, 0, 1, cv2.NORM_MINMAX)
            cv2.normalize(hist2, hist2, 0, 1, cv2.NORM_MINMAX)
            
            return cv2.compareHist(hist1, hist2, cv2.HISTCMP_CORREL)
        except:
            return 0.5 # Neutral fallback

    def get_feature_matches(self, img_np1, img_np2):
        """Uses ORB to find structural keypoint matches (textures, patterns)."""
        try:
            orb = cv2.ORB_create(nfeatures=1000)
            kp1, des1 = orb.detectAndCompute(img_np1, None)
            kp2, des2 = orb.detectAndCompute(img_np2, None)
            
            if des1 is None or des2 is None: return 0
            
            bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
            matches = bf.match(des1, des2)
            
            # Ratio of matches relative to keypoints
            score = len(matches) / max(len(kp1), len(kp2), 1)
            return score
        except:
            return 0

    def compare_images(self, original_bytes, candidate_bytes):
        """
        Multi-Signal Decision Engine:
        1. Perceptual Hashing (Fast Binary Match)
        2. CLIP Cosine Similarity (Semantic/Subject Match)
        3. Color Histogram Correlation (Hue/Saturation Consistency)
        4. ORB Keypoint Matching (Texture/Pattern Verification)
        """
        try:
            # 1. Prepare Images
            orig_pil = Image.open(BytesIO(original_bytes)).convert('RGB')
            cand_pil = Image.open(BytesIO(candidate_bytes)).convert('RGB')
            
            orig_np = np.array(orig_pil)
            cand_np = np.array(cand_pil)

            # 2. Stage 1: Hashing (Fast exit for direct copies)
            orig_hashes = self.get_perceptual_hashes(orig_pil)
            cand_hashes = self.get_perceptual_hashes(cand_pil)
            
            p_dist = orig_hashes['phash'] - cand_hashes['phash']
            d_dist = orig_hashes['dhash'] - cand_hashes['dhash']
            
            if p_dist <= 5 or d_dist <= 5:
                return "exact_match", 100.0

            # 3. Stage 2: Subject Extraction
            orig_subject = self.extract_subject(orig_np)
            cand_subject = self.extract_subject(cand_np)
            
            # 4. Stage 3: Deep Similarity (CLIP)
            orig_subject_pil = Image.fromarray(orig_subject)
            cand_subject_pil = Image.fromarray(cand_subject)
            orig_emb = self.get_embeddings(orig_subject_pil)
            cand_emb = self.get_embeddings(cand_subject_pil)
            cosine_sim = util.cos_sim(orig_emb, cand_emb).item()

            # 5. Stage 4: Verification Signals (Color & Keypoints)
            color_sim = self.get_color_similarity(orig_subject, cand_subject)
            feature_score = self.get_feature_matches(orig_subject, cand_subject)
            
            # --- FINAL DECISION LOGIC ---
            # Thresholds tuned for high-accuracy product matching
            is_exact = False
            
            # Logic: Exact match requires semantic AND structural/color proof
            if cosine_sim >= 0.88:
                is_exact = True # Extremely high semantic match
            elif cosine_sim >= 0.78 and color_sim >= 0.85:
                is_exact = True # High semantic + Same color
            elif cosine_sim >= 0.75 and feature_score >= 0.12:
                is_exact = True # Semantic + Texture patterns match
            
            final_score = round(cosine_sim * 100, 1)

            if is_exact:
                # Boost score for UI visibility of exact matches
                display_score = max(95.0, final_score) 
                return "exact_match", display_score
            elif cosine_sim >= 0.62:
                return "similar_match", final_score
            else:
                return None, final_score

        except Exception as e:
            print(f"[AI] Comparison error: {e}")
            return None, 0.0

# Singleton for reuse
ai_pipeline = None

def get_ai_pipeline():
    global ai_pipeline
    if ai_pipeline is None:
        ai_pipeline = AIMatchingPipeline()
    return ai_pipeline
