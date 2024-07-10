from firebase_functions import https_fn, options
from firebase_admin import initialize_app, credentials
from flask import jsonify
from werkzeug.datastructures import FileStorage
import os

from reviewer import get_corrections
from actions import speech_to_text, assistant_response
from db_analytics import analyze_data


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

@https_fn.on_request(timeout_sec=30, enforce_app_check=True, cors=options.CorsOptions(cors_origins=["https://forgotai.com"], cors_methods=["POST"]))
def voiceCommand(request: https_fn.Request) -> https_fn.Response:
    MAX_FILE_SIZE = 2646000
    try:
        # Retrieve the FileStorage object from the request
        file_storage = request.files['audio']
        possible_commands = request.form.get("commands")
        possible_commands = eval(possible_commands)
        print(possible_commands)
        length = request.content_length
        if length > MAX_FILE_SIZE:
            return https_fn.Response("Please send a recording no longer than 15 seconds.", status=413)
        request_ip = request.remote_addr
        request_ip = request_ip.replace(".", "-")
        save_path = f"/tmp/{request_ip}.wav"
        file_storage.save(save_path)
        if os.path.getsize(save_path) > MAX_FILE_SIZE:
            os.remove(save_path)
            return https_fn.Response("Please send a recording no longer than 15 seconds.", status=413)

        file = open(save_path, "rb")
        text = speech_to_text(file)
        response = assistant_response(text, possible_actions=possible_commands)
        response = jsonify({"data": response})
        os.remove(save_path)
        return response
    except KeyError:
        try:
            os.remove(save_path)
        except:
            pass
        return https_fn.Response("Audio file not found in request", status=400)
    except Exception as e:
        try:
            os.remove(save_path)
        except:
            pass
        # Log the exception
        print(f"An error occurred: {e}")
        return https_fn.Response("Internal server error", status=500)

@https_fn.on_request(timeout_sec=30, enforce_app_check=True, cors=options.CorsOptions(cors_origins=["https://forgotai.com"], cors_methods=["POST"]))
def analytics(request: https_fn.Request) -> https_fn.Response:
    j = request.get_json()
    api_name = j["api_name"]
    prompt = j["prompt"]
    options = j["options"]
    analyze_data(api_choice=api_name, user_prompt=prompt, options=options)