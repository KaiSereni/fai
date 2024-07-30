import json
import speech_recognition as sr
from pydub import AudioSegment
from pydub.silence import split_on_silence
from pyAudioAnalysis import audioSegmentation as aS
import numpy as np
from pyannote.audio import Pipeline
import torch

def mp3_to_json(mp3_path):
    # Load the MP3 file
    audio = AudioSegment.from_mp3(mp3_path)

    # Convert to WAV for compatibility with pyannote
    wav_path = "temp_full_audio.wav"
    audio.export(wav_path, format="wav")

    # Initialize speaker diarization pipeline
    pipeline = Pipeline.from_pretrained("pyannote/speaker-diarization@2.1", use_auth_token="YOUR_HF_AUTH_TOKEN")

    # Perform speaker diarization
    diarization = pipeline(wav_path)

    # Initialize recognizer
    recognizer = sr.Recognizer()

    results = []
    speaker_ids = {}
    current_speaker_id = 1

    for turn, _, speaker in diarization.itertracks(yield_label=True):
        # Extract the audio segment for this turn
        start_time = turn.start
        end_time = turn.end
        segment = audio[int(start_time * 1000):int(end_time * 1000)]

        # Export segment to WAV
        segment_path = f"temp_segment_{start_time}_{end_time}.wav"
        segment.export(segment_path, format="wav")

        # Recognize speech in segment
        with sr.AudioFile(segment_path) as source:
            audio_data = recognizer.record(source)
            try:
                text = recognizer.recognize_google(audio_data)

                # Detect gender
                [_, _, _, gender] = aS.speech_gender_segmentation(segment_path, 1.0, 1.0)
                gender_label = "masculine" if np.mean(gender) > 0.5 else "feminine"

                # Assign speaker label
                if speaker not in speaker_ids:
                    speaker_ids[speaker] = f"speaker_{current_speaker_id}"
                    current_speaker_id += 1
                speaker_label = speaker_ids[speaker]

                # Add result to list
                results.append({
                    "text": text,
                    "start_time": round(start_time, 1),
                    "end_time": round(end_time, 1),
                    "gender": gender_label,
                    "speaker": speaker_label
                })

            except sr.UnknownValueError:
                print(f"Speech not recognized in segment {start_time}-{end_time}")
            except sr.RequestError as e:
                print(f"Could not request results from Google Speech Recognition service; {e}")

    return results

# Example usage
print(mp3_to_json("input_audio.mp3"))