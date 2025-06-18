# AI-Powered Product Filtering Tool

This console application uses OpenAI's function calling capability to perform natural language filtering on a product dataset. The tool interprets user queries like "Show me fitness products under $100 with at least 4 stars" and returns a filtered list of products.

## Features

-   **Natural Language Queries:** Filter products using everyday language.
-   **AI-Powered Filtering:** Leverages OpenAI's function calling to translate queries into structured filter arguments.
-   **Extensible:** The filter function schema can be easily modified to include more parameters.
-   **Secure:** Your OpenAI API key is loaded from a `.env` file and is not hardcoded.

## How to Run

### 1. Prerequisites

-   Python 3.7+
-   An OpenAI API key.

### 2. Installation

1.  **Clone the repository or download the files.**

2.  **Navigate to the project directory:**
    ```bash
    cd product_filter
    ```

3.  **Install the required dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

### 3. Configuration

1.  **Create a `.env` file** in the `product_filter` directory.
2.  **Add your OpenAI API key** to the `.env` file:
    ```
    OPENAI_API_KEY="your_openai_api_key_here"
    ```

### 4. Running the Application

1.  **Run the tool from your terminal:**
    ```bash
    python filter_tool.py
    ```
2.  **Enter your query:** When prompted, type your filtering request in natural language and press Enter.
3.  **Exit:** Type `exit` to close the application. 