import json
import speech_recognition as sr
from pydub import AudioSegment
from pydub.utils import make_chunks
import nltk
from nltk.tokenize import sent_tokenize

# Download the punkt tokenizer for sentence splitting
nltk.download('punkt', quiet=True)

def extract_speech_to_text(mp3_file, output_file):
    # Load the MP3 file
    audio = AudioSegment.from_mp3(mp3_file)
    
    # Split audio into chunks (e.g., 10 seconds each)
    chunk_length_ms = 2000  # miliseconds
    chunks = make_chunks(audio, chunk_length_ms)
    
    # Initialize speech recognizer
    recognizer = sr.Recognizer()
    
    results = []
    
    for i, chunk in enumerate(chunks):
        # Export chunk as temporary WAV file
        chunk_name = f"temp/temp_chunk_{i}.wav"
        chunk.export(chunk_name, format="wav")
        
        # Recognize speech in the chunk
        with sr.AudioFile(chunk_name) as source:
            audio_data = recognizer.record(source)
            try:
                text = recognizer.recognize_google(audio_data)
                sentences = sent_tokenize(text)
                
                # Calculate time per character in this chunk
                chunk_duration = len(chunk) / 1000  # in seconds
                time_per_char = chunk_duration / len(text) if text else 0
                
                char_count = 0
                for sentence in sentences:
                    sentence_start = i * (chunk_length_ms / 1000) + char_count * time_per_char
                    char_count += len(sentence)
                    sentence_end = i * (chunk_length_ms / 1000) + char_count * time_per_char
                    
                    results.append({
                        "text": sentence.strip(),
                        "start_time": f"{sentence_start:.1f}",
                        "end_time": f"{sentence_end:.1f}"
                    })
            except sr.UnknownValueError:
                print(f"Speech not recognized in chunk {i}")
            except sr.RequestError as e:
                print(f"Could not request results from Google Speech Recognition service; {e}")
    
    # Save results to JSON file
    with open(output_file, 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"Speech-to-text data saved to {output_file}")

if __name__ == "__main__":
    input_file = "test_files/input.mp3"  # Replace with your input MP3 file
    output_file = "test_files/output.json"
    extract_speech_to_text(input_file, output_file)