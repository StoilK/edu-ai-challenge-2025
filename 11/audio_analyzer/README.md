# AI-Powered Audio Analyzer

This command-line application transcribes, summarizes, and analyzes audio files using OpenAI's Whisper and GPT APIs.

## Features

-   **Audio Transcription:** Converts speech from an audio file into text using the Whisper API.
-   **AI-Generated Summary:** Creates a concise summary of the transcribed text using GPT.
-   **In-depth Analysis:** Extracts key analytics from the transcript, including:
    -   Total word count
    -   Speaking speed (words per minute)
    -   Frequently mentioned topics
-   **Secure API Key Handling:** Loads your OpenAI API key from a `.env` file to keep it secure.
-   **Organized Output:** Generates a new directory for each run, containing the full transcript, summary, and analytics files.

## Prerequisites

-   Python 3.9+
-   An OpenAI API key.

## Setup

1.  **Clone the repository or download the files.**

2.  **Navigate to the project directory:**
    ```bash
    cd 11/audio_analyzer
    ```

3.  **Create a virtual environment (recommended):**
    ```bash
    python -m venv venv
    ```

    **Activate the virtual environment:**
    -   On **Windows** (Command Prompt or PowerShell):
        ```bash
        venv\Scripts\activate
        ```
    -   On **macOS and Linux**:
        ```bash
        source venv/bin/activate
        ```

4.  **Install the required dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

5.  **Configure your API Key:**
    -   Create a file named `.env` in the `11/audio_analyzer` directory.
    -   Add your OpenAI API key to the `.env` file as follows:
        ```
        OPENAI_API_KEY="your_openai_api_key_here"
        ```

## Usage

Run the application from your terminal, providing the path to your audio file using the `--file` argument. **Make sure your virtual environment is activated before running the script.**

### Example Command

```bash
python main.py --file ../CAR0004.mp3
```

The script will process the audio and generate three files (`transcription.md`, `summary.md`, `analysis.json`) inside a new uniquely named `output_YYYYMMDD_HHMMSS` directory. The summary and analysis will also be printed to the console. 