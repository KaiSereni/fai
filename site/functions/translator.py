import json
import speech_recognition as sr
from pydub import AudioSegment
from pydub.silence import split_on_silence

def mp3_to_text(mp3_path, output_json_path):
    # Load the MP3 file
    audio = AudioSegment.from_mp3(mp3_path)

    # Split audio into chunks based on silence
    chunks = split_on_silence(audio, min_silence_len=500, silence_thresh=-40)

    # Initialize recognizer
    recognizer = sr.Recognizer()

    results = []
    current_time = 0

    for i, chunk in enumerate(chunks):
        # Export chunk to WAV
        chunk_path = f"temp/temp_chunk_{i}.wav"
        chunk.export(chunk_path, format="wav")

        # Recognize speech in chunk
        with sr.AudioFile(chunk_path) as source:
            audio_data = recognizer.record(source)
            try:
                text = recognizer.recognize_google(audio_data)
                
                # Calculate start and end times
                start_time = current_time
                end_time = start_time + len(chunk) / 1000.0  # Convert milliseconds to seconds
                
                # Add result to list
                results.append({
                    "text": text,
                    "start_time": round(start_time, 1),
                    "end_time": round(end_time, 1)
                })
                
                current_time = end_time
            except sr.UnknownValueError:
                print(f"Speech not recognized in chunk {i}")
            except sr.RequestError as e:
                print(f"Could not request results from Google Speech Recognition service; {e}")

    # Save results to JSON file
    with open(output_json_path, 'w') as f:
        json.dump(results, f, indent=2)

    print(f"Speech to text data saved to {output_json_path}")

# Example usage
mp3_to_text("test_files/input.mp3", "test_files/output.json")