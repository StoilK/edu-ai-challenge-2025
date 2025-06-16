# AI Service Reporter

This is a console application that takes a service or product name (e.g., "Spotify") or a description and generates a comprehensive, markdown-formatted report from multiple viewpoints—including business, technical, and user-focused perspectives.

## How to Run

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd <your-repo-directory>
    ```

2.  **Install dependencies:**
    Make sure you have Node.js installed.
    ```bash
    npm install
    ```

3.  **Set up your environment variables:**
    Create a `.env` file in the root of the project and add your OpenAI API key:
    ```
    OPENAI_API_KEY=your_openai_api_key
    ```

4.  **Run the application:**
    ```bash
    node index.js
    ```

5.  **Enter a service name or description:**
    When prompted, type a service name (like "Notion") or paste a description of a product and press Enter. The application will then output a detailed report in the console. 