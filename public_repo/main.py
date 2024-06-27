from firebase_functions import https_fn, options, logger
from firebase_admin import initialize_app, credentials
from flask import jsonify
from reviewer import get_corrections

cred = credentials.Certificate("fb_keys.json")
initialize_app(cred)

@https_fn.on_request(timeout_sec=540, enforce_app_check=True, cors=options.CorsOptions(cors_origins=["https://forgotai.com"], cors_methods=["POST"]))
def correct(request: https_fn.Request) -> https_fn.Response:
    try:
        data = request.get_json()["data"]
        string = data["string"]
        context_title = data["context_title"]
        corrections = get_corrections(string, context_title)
    except Exception as e:
        logger.warn(f"ERROR: {e}")
        response = jsonify({"error": "Invalid request"})
        return response
    
    response = jsonify({"data": corrections})
    return response
