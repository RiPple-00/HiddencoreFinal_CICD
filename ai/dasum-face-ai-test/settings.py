"""Central project settings (paths, thresholds, feature flags)."""

from pathlib import Path

ROOT = Path(__file__).resolve().parent

# --- Data paths (never overwrite raw) ---
DATA_DIR = ROOT / "data"
PATIENTS_RAW_DIR = DATA_DIR / "patients"
GALLERY_RAW_DIR = DATA_DIR / "gallery"
LABELS_DIR = DATA_DIR / "labels"
GROUND_TRUTH_DIR = LABELS_DIR / "ground_truth"

PATIENTS_PREPROCESSED_DIR = DATA_DIR / "patients_preprocessed"
GALLERY_PREPROCESSED_DIR = DATA_DIR / "gallery_preprocessed"
GALLERY_INDEX_PATH = DATA_DIR / "gallery_index.json"

ACTIVITY_FACES_DIR = DATA_DIR / "activity_faces"
ACTIVITY_CROPS_DIR = ACTIVITY_FACES_DIR / "crops"
ACTIVITY_ALIGNED_DIR = ACTIVITY_FACES_DIR / "aligned"

FACE_DB_DIR = DATA_DIR / "face_db"
FACE_DB_ALIGNED_PATIENTS = FACE_DB_DIR / "aligned_patients"
FACE_DB_EMBEDDINGS = FACE_DB_DIR / "embeddings"
FACE_DB_REPRESENTATIVES = FACE_DB_DIR / "representatives"
FACE_DB_REVIEW_CANDIDATES = FACE_DB_DIR / "review_approved_candidates"

AUGMENTED_DIR = DATA_DIR / "augmented" / "patients"

# --- Output (regenerable) ---
OUTPUT_DIR = ROOT / "output"
OUTPUT_VISUALIZED_DIR = OUTPUT_DIR / "visualized"
OUTPUT_VIS_GALLERY_DIR = OUTPUT_VISUALIZED_DIR / "gallery"
OUTPUT_VIS_PREPROCESSED_DIR = OUTPUT_VISUALIZED_DIR / "gallery_preprocessed"
OUTPUT_REPORTS_DIR = OUTPUT_DIR / "reports"
OUTPUT_LOGS_DIR = OUTPUT_DIR / "logs"

ANALYSIS_RESULT_PATH = OUTPUT_DIR / "analysis_result.json"
FACE_SIMILARITY_JSON_PATH = OUTPUT_DIR / "face_similarity_results.json"

# --- Program mapping ---
PROGRAM_ID_TO_LABEL: dict[str, str] = {
    "1": "origami",
    "2": "drawing",
    "3": "dance",
}

# --- InsightFace ---
INSIGHTFACE_MODEL = "buffalo_l"
INSIGHTFACE_CTX_ID = -1
INSIGHTFACE_DET_SIZE = (640, 640)
FACE_ALIGN_SIZE = 112

# --- Similarity ---
SIMILARITY_THRESHOLD = 0.5
SIMILARITY_MARGIN = 0.03
LOW_CONFIDENCE_THRESHOLD = 0.4
REVIEW_NEAR_THRESHOLD_GAP = 0.05

# --- Patient DB ---
MIN_VALID_EMBEDDINGS_WARN = 3
PATIENT_IDS = [f"patient_{i}" for i in range(1, 7)]

# --- Augmentation (default off) ---
USE_FACE_AUGMENTATION = False
AUGMENT_PER_FACE = 1
USE_FLIP_AUGMENTATION = False

# --- Preprocessing ---
LETTERBOX_SIZE = 640
LETTERBOX_PAD_COLOR = (114, 114, 114)  # BGR
CLAHE_CLIP_LIMIT = 2.0
CLAHE_TILE_GRID = (8, 8)
DENOISE_D = 5
DENOISE_SIGMA_COLOR = 50
DENOISE_SIGMA_SPACE = 50

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".jfif", ".bmp"}

# --- Legacy YOLO (optional old pipeline path) ---
YOLO_MODEL = "yolov8n.pt"
YOLO_PERSON_CLASS = 0
PERSON_CONF_THRESHOLD = 0.35
