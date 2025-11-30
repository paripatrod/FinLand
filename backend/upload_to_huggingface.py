# สคริปต์ Upload Model ไป Hugging Face อัตโนมัติ
# หมายเหตุ: ต้องรัน huggingface-cli login ก่อนใช้งาน

from huggingface_hub import HfApi
import os

# ตั้งค่า (แก้ตรงนี้)
USERNAME = "Pottersk"  # ใช้ username ที่ login จริง
REPO_NAME = "finland-ai-model"
MODEL_PATH = "financial_advisor_model.pkl"  # Model v3.0 ใหม่!

# Upload
api = HfApi()
repo_id = f"{USERNAME}/{REPO_NAME}"

# สร้าง repository ก่อน (ถ้ายังไม่มี)
try:
    print(f"🔍 Checking if repo {repo_id} exists...")
    api.repo_info(repo_id=repo_id, repo_type="model")
    print(f"✅ Repository already exists!")
except:
    print(f"📦 Creating new repository: {repo_id}...")
    api.create_repo(repo_id=REPO_NAME, repo_type="model", private=False)
    print(f"✅ Repository created!")

print(f"📤 Uploading {MODEL_PATH} to {repo_id}...")
print("⏳ This may take a few minutes...")

api.upload_file(
    path_or_fileobj=MODEL_PATH,
    path_in_repo="financial_advisor_model.pkl",
    repo_id=repo_id,
    repo_type="model",
)

print(f"✅ Upload successful!")
print(f"🔗 Model URL: https://huggingface.co/{repo_id}/resolve/main/financial_advisor_model.pkl")
print(f"\n📋 Copy this URL to Render Environment Variable 'MODEL_URL'")
