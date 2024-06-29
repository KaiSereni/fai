from firebase_functions import https_fn, options
from firebase_admin import initialize_app, credentials
from flask import jsonify
from werkzeug.datastructures import FileStorage
import os

from reviewer import get_corrections
from actions import speech_to_text, assistant_response


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
        response = jsonify({"error": "Invalid request"})
        return response
    
    response = jsonify({"data": corrections})
    return response

@https_fn.on_request(timeout_sec=540, enforce_app_check=False, cors=options.CorsOptions(cors_origins=["*"], cors_methods=["POST"]))
def voiceCommand(request: https_fn.Request) -> https_fn.Response:
    try:
        # Retrieve the FileStorage object from the request
        file_storage = request.files['audio']
        request_ip = request.remote_addr
        request_ip = request_ip.replace(".", "-")
        file_storage.save(f"/tmp/{request_ip}.wav")

        file = open(f"/tmp/{request_ip}.wav", "rb")
        text = speech_to_text(file)
        print("speech to text: ", text)
        response = assistant_response(text, ["Turn off the kitchen light", "Turn on the kitchen light", "What is the weather today?", "What is the time now?"])
        response = jsonify({"data": response})
        os.remove(f"/tmp/{request_ip}.wav")
        return response
    except KeyError:
        try:
            os.remove(f"/tmp/{request_ip}.wav")
        except:
            pass
        return https_fn.Response("Audio file not found in request", status=400)
    except Exception as e:
        try:
            os.remove(f"/tmp/{request_ip}.wav")
        except:
            pass
        # Log the exception
        print(f"An error occurred: {e}")
        return https_fn.Response("Internal server error", status=500)