from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from pymongo import MongoClient
from bson import ObjectId
import jwt, datetime, os
from functools import wraps
import random

# ----------------- App & Config -----------------
app = Flask(__name__)
CORS(app)

app.config["SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY", "supersecretkey123")
app.config["UPLOAD_FOLDER"] = "uploads"
os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

# ----------------- MongoDB -----------------
client = MongoClient("mongodb://localhost:27017/")
db = client["threatscope"]
users = db["users"]
files = db["files"]

# ----------------- JWT Decorator -----------------
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if "Authorization" in request.headers:
            token = request.headers["Authorization"].split(" ")[1]
        if not token:
            return jsonify({"message": "Token missing!"}), 401
        try:
            data = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
            current_user = users.find_one({"_id": ObjectId(data["user_id"])})
            if not current_user:
                return jsonify({"message": "User not found!"}), 401
        except Exception:
            return jsonify({"message": "Token invalid!"}), 401
        return f(current_user, *args, **kwargs)
    return decorated

# ----------------- Auth Routes -----------------
@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    if not data.get("name") or not data.get("email") or not data.get("password"):
        return jsonify({"error": "Missing fields"}), 400

    if users.find_one({"email": data["email"]}):
        return jsonify({"error": "Email already registered"}), 400

    hashed_pw = generate_password_hash(data["password"], method="pbkdf2:sha256", salt_length=8)

    user = {
        "name": data["name"],
        "email": data["email"],
        "password": hashed_pw,
        "is_admin": False,
        "photo": None
    }
    users.insert_one(user)
    return jsonify({"message": "User registered successfully"}), 201

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    user = users.find_one({"email": data.get("email")})
    if not user:
        return jsonify({"error": "Invalid credentials"}), 401
    if not check_password_hash(user["password"], data.get("password")):
        return jsonify({"error": "Invalid credentials"}), 401

    token = jwt.encode(
        {"user_id": str(user["_id"]), "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=2)},
        app.config["SECRET_KEY"],
        algorithm="HS256"
    )
    return jsonify({
        "token": token,
        "user": {"id": str(user["_id"]), "name": user["name"], "is_admin": user["is_admin"]}
    })

# ----------------- Dashboard -----------------
@app.route("/dashboard", methods=["GET"])
@token_required
def dashboard(current_user):
    data = {
        "total_uploads": files.count_documents({"user_id": str(current_user["_id"])}),
        "high_risk": files.count_documents({"user_id": str(current_user["_id"]), "risk": "High"}),
        "medium_risk": files.count_documents({"user_id": str(current_user["_id"]), "risk": "Medium"}),
        "low_risk": files.count_documents({"user_id": str(current_user["_id"]), "risk": "Low"})
    }
    return jsonify(data)

# ----------------- Threat Analyzer -----------------
@app.route("/analyze", methods=["POST"])
@token_required
def analyze_file(current_user):
    if "file" not in request.files:
        return jsonify({"message": "No file uploaded"}), 400
    file = request.files["file"]
    filename = secure_filename(file.filename)
    path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    file.save(path)

    # Mock analysis
    risk_level = random.choice(["Low", "Medium", "High"])
    record = {
        "user_id": str(current_user["_id"]),
        "filename": filename,
        "risk": risk_level,
        "timestamp": datetime.datetime.utcnow()
    }
    files.insert_one(record)
    return jsonify({"message": "File analyzed", "risk": risk_level})

# ----------------- Profile Management -----------------
@app.route("/profile/update", methods=["PUT"])
@token_required
def update_profile(current_user):
    data = request.get_json()
    update_fields = {}
    if "name" in data:
        update_fields["name"] = data["name"]
    if "password" in data:
        update_fields["password"] = generate_password_hash(data["password"], method="pbkdf2:sha256", salt_length=8)
    if update_fields:
        users.update_one({"_id": current_user["_id"]}, {"$set": update_fields})
    return jsonify({"message": "Profile updated"})

@app.route("/profile/upload-photo", methods=["POST"])
@token_required
def upload_photo(current_user):
    if "photo" not in request.files:
        return jsonify({"message": "No photo uploaded"}), 400
    photo = request.files["photo"]
    filename = secure_filename(photo.filename)
    path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    photo.save(path)
    users.update_one({"_id": current_user["_id"]}, {"$set": {"photo": filename}})
    return jsonify({"message": "Profile photo uploaded", "filename": filename})

@app.route("/profile/delete-photo", methods=["DELETE"])
@token_required
def delete_photo(current_user):
    users.update_one({"_id": current_user["_id"]}, {"$set": {"photo": None}})
    return jsonify({"message": "Profile photo deleted"})

# ----------------- Admin Routes -----------------
@app.route("/admin/users", methods=["GET"])
@token_required
def get_users(current_user):
    if not current_user["is_admin"]:
        return jsonify({"message": "Admin access required"}), 403
    all_users = list(users.find({}, {"password": 0}))
    for u in all_users:
        u["_id"] = str(u["_id"])
    return jsonify(all_users)

@app.route("/admin/delete-user/<user_id>", methods=["DELETE"])
@token_required
def delete_user(current_user, user_id):
    if not current_user["is_admin"]:
        return jsonify({"message": "Admin access required"}), 403
    users.delete_one({"_id": ObjectId(user_id)})
    return jsonify({"message": "User deleted"})

# ----------------- Run App -----------------
if __name__ == "__main__":
    app.run(debug=True, port=5000)
