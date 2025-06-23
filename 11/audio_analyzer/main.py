import argparse
import json
import os
from openai import OpenAI
from dotenv import load_dotenv
from datetime import datetime
import math

def setup_client():
    """Load API key and initialize OpenAI client."""
    load_dotenv()
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY not found in .env file or environment variables.")
    return OpenAI(api_key=api_key)

def transcribe_audio(client, file_path):
    """Transcribe the audio file using Whisper API."""
    print(f"Transcribing audio from {file_path}...")
    # A prompt to guide the model for better accuracy at the beginning of the audio
    transcription_prompt = "The following is a transcription of a conversation. Common starting words might include: What, When, Who, The, I, So, Well, Okay."
    try:
        with open(file_path, "rb") as audio_file:
            transcription = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                prompt=transcription_prompt,
                temperature=0.0
            )
        return transcription.text
    except FileNotFoundError:
        print(f"Error: The file {file_path} was not found.")
        return None
    except Exception as e:
        print(f"An error occurred during transcription: {e}")
        return None

def summarize_text(client, transcript):
    """Summarize the transcript using GPT."""
    print("Generating summary...")
    prompt = "Summarize the following transcript in a clear and concise paragraph, focusing on the main themes and key points."
    try:
        response = client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": transcript}
            ]
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"An error occurred during summarization: {e}")
        return None

def analyze_text(client, transcript, audio_duration_minutes):
    """Extract analytics from the transcript using GPT."""
    print("Extracting analytics...")
    word_count = len(transcript.split())
    
    # Ensure duration is not zero to avoid division by zero error
    if audio_duration_minutes > 0:
        wpm = math.ceil(word_count / audio_duration_minutes)
    else:
        wpm = word_count

    prompt = f"""Based on the following transcript, identify the top 3-5 frequently mentioned topics with the number of times each topic appears.

Transcript:
"{transcript}"

Return a JSON object containing only the "frequently_mentioned_topics" key, where the value is an array of objects, each with "topic" and "mentions".
Example:
{{
  "frequently_mentioned_topics": [
    {{ "topic": "Customer Onboarding", "mentions": 6 }},
    {{ "topic": "Q4 Roadmap", "mentions": 4 }}
  ]
}}
"""
    try:
        response = client.chat.completions.create(
            model="gpt-4.1-mini",
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": "You are a helpful assistant designed to output JSON."},
                {"role": "user", "content": prompt}
            ]
        )
        analytics_data = json.loads(response.choices[0].message.content)
        
        # Combine manually calculated stats with AI-generated topics
        full_analysis = {
            "word_count": word_count,
            "speaking_speed_wpm": wpm,
            "frequently_mentioned_topics": analytics_data.get("frequently_mentioned_topics", [])
        }
        return full_analysis
    except Exception as e:
        print(f"An error occurred during analysis: {e}")
        return None

def get_audio_duration(file_path):
    """A placeholder function to estimate audio duration."""
    # This is a simplification. A real implementation would use a library
    # like mutagen, pydub, or ffprobe to get the actual duration.
    # For this example, we'll estimate based on file size, assuming a
    # certain bitrate (e.g., 128 kbps for MP3).
    # 128 kbps = 16 KB/s.
    try:
        file_size_bytes = os.path.getsize(file_path)
        file_size_kb = file_size_bytes / 1024
        duration_seconds = file_size_kb / 16 
        return duration_seconds / 60
    except FileNotFoundError:
        return 0

def save_output(data, filename):
    """Saves the given data to a file."""
    try:
        with open(filename, "w", encoding="utf-8") as f:
            f.write(data)
        print(f"Successfully saved: {filename}")
    except Exception as e:
        print(f"Error saving {filename}: {e}")

def main():
    """Main function to run the CLI application."""
    parser = argparse.ArgumentParser(description="Transcribe, summarize, and analyze an audio file.")
    parser.add_argument("--file", required=True, help="Path to the audio file.")
    args = parser.parse_args()
    
    file_path = args.file

    try:
        client = setup_client()
    except ValueError as e:
        print(f"Error: {e}")
        return

    transcript = transcribe_audio(client, file_path)
    if not transcript:
        return

    summary = summarize_text(client, transcript)
    if not summary:
        return

    audio_duration_minutes = get_audio_duration(file_path)
    analysis = analyze_text(client, transcript, audio_duration_minutes)
    if not analysis:
        return

    # Create unique output directory
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_dir = f"output_{timestamp}"
    os.makedirs(output_dir, exist_ok=True)
    
    # Save outputs
    save_output(transcript, os.path.join(output_dir, "transcription.md"))
    save_output(summary, os.path.join(output_dir, "summary.md"))
    
    analysis_json = json.dumps(analysis, indent=2)
    save_output(analysis_json, os.path.join(output_dir, "analysis.json"))

    # Print to console
    print("\n--- Summary ---")
    print(summary)
    print("\n--- Analysis ---")
    print(analysis_json)

if __name__ == "__main__":
    main() 