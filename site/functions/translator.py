import json
import librosa
from pydub import AudioSegment
import speech_recognition as speech_rec
from pyannote.audio import Pipeline
from transformers import Wav2Vec2ForSequenceClassification, Wav2Vec2FeatureExtractor
import torch
import soundfile as sf

with open('api_keys.json') as f:
    HF_TOKEN = json.load(f)['huggingface']

def classify_gender(wav_path):
    # Load the pre-trained model and feature extractor
    model = Wav2Vec2ForSequenceClassification.from_pretrained("alefiury/wav2vec2-large-xlsr-53-gender-recognition-librispeech")
    feature_extractor = Wav2Vec2FeatureExtractor.from_pretrained("alefiury/wav2vec2-large-xlsr-53-gender-recognition-librispeech")

    # Load the audio file and resample to 16,000 Hz
    speech, original_sample_rate = sf.read(wav_path)
    if original_sample_rate != 16000:
        speech = librosa.resample(speech, orig_sr=original_sample_rate, target_sr=16000)

    # Preprocess the audio file
    inputs = feature_extractor(speech, sampling_rate=16000, return_tensors="pt", padding=True)

    # Perform inference
    with torch.no_grad():
        logits = model(**inputs).logits

    # Get the predicted class
    predicted_class_id = logits.argmax().item()

    # Map the predicted class ID to gender
    gender = "male" if predicted_class_id == 0 else "female"

    return gender

def extract_speech_to_text(wav_file):
    recognizer = speech_rec.Recognizer()
    audio = AudioSegment.from_wav(wav_file)

    pipeline_speaker = Pipeline.from_pretrained("pyannote/speaker-diarization", use_auth_token=HF_TOKEN)
    diarization = pipeline_speaker(wav_file)

    speaker_genders = {}
    results = []
    for turn, _, speaker in diarization.itertracks(yield_label=True):
        # Extract speaker ID
        speaker_id = int(speaker.split("_")[1])

        # Extract the audio segment for this turn
        start_time = turn.start
        end_time = turn.end
        if end_time - start_time < 1:
            continue
        segment = audio[start_time*1000:end_time*1000]

        # Export segment to a temporary file
        segment.export("temp/temp.wav", format="wav")

        # Perform speech recognition on the segment
        with speech_rec.AudioFile("temp/temp.wav") as source:
            # Recognizer
            audio_data = recognizer.record(source)
            try:
                text = recognizer.recognize_google(audio_data)
                if text == "":
                    continue
            except speech_rec.UnknownValueError:
                continue

        # Determine gender
        if speaker_id in speaker_genders:
            gender = speaker_genders[speaker_id]
        else:
            gender = classify_gender("temp/temp.wav")

        # Add result to list
        result = {
            "text": text,
            "start_time": start_time,
            "end_time": end_time,
            "speaker_id": speaker_id,
            "gender": gender
        }
        results.append(result)

    return results

# Usage
stt = extract_speech_to_text("input_audio.wav")
print(stt)