import json
import os
from openai import OpenAI
from dotenv import load_dotenv

def get_products_from_query(query, products):
    """
    Uses OpenAI function calling to perform a natural language search on a product list
    and return the filtered list of products.
    """
    load_dotenv()
    client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

    # The 'products' parameter in the function definition is a placeholder.
    # The actual product data is sent in the user message. The AI is instructed
    # to use the data from the message and pass the filtered results
    # into the 'products' parameter of the 'filter_products' function.
    functions = [
        {
            "name": "filter_products",
            "description": "Based on the user query and the provided product data, return the filtered list of products.",
            "parameters": {
                "type": "object",
                "properties": {
                    "products": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "id": {"type": "number"},
                                "name": {"type": "string"},
                                "category": {"type": "string"},
                                "price": {"type": "number"},
                                "rating": {"type": "number"},
                                "in_stock": {"type": "boolean"}
                            },
                            "required": ["id", "name", "category", "price", "rating", "in_stock"]
                        },
                        "description": "The filtered list of products that match the user's query."
                    }
                },
                "required": ["products"]
            }
        }
    ]

    messages = [
        {"role": "system",
         "content": """You are an expert product filtering assistant. Analyze the user's query and the provided product data. 
         Your task is to return a JSON array of products that strictly match all the criteria in the user's query. 
         Use the `filter_products` function to return the results.
         
         Filtering Guide:
         - "top N": If the user asks for "top 5", "top 10", etc., you must sort the results by rating in descending order and return only the specified number of products.
         - "cheapest" / "most affordable": Sort the products by price in ascending order.
         - "highest rated" / "best": Sort the products by rating in descending order.
         - Multiple criteria: You must apply all criteria. For example, "top 10 cheapest in-stock electronics" means you must filter for electronics, check for stock, sort by price, and return only the first 10.
         - Implicit criteria: A query like "I want a great phone" implies a high rating.
         
         Example: For a query "top 3 cheapest kitchen items in stock", you would first filter for `category: 'Kitchen'` and `in_stock: true`, then sort by `price` ascending, and finally return the top 3 results.
         """},
        {"role": "user", "content": f"User query: '{query}'\n\nProduct data: {json.dumps(products)}"}
    ]

    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=messages,
        functions=functions,
        function_call={"name": "filter_products"} # Force the model to call this function
    )

    response_message = response.choices[0].message
    
    if response_message.function_call:
        function_args = json.loads(response_message.function_call.arguments)
        filtered_products = function_args.get("products")
        
        if filtered_products is not None:
            print(f"\n✅ AI has filtered the products based on your query.")
            return filtered_products
        else:
            print("\n🤔 AI did not return any products. Returning an empty list.")
            return []
    else:
        print("\n🤔 AI did not call the function as expected. Returning an empty list.")
        return []

def display_products(products):
    """Formats and prints the list of filtered products."""
    if not products:
        print("\nNo products found matching your criteria.")
        return
        
    print("\nFiltered Products:")
    # Adding enumeration to the output
    for i, product in enumerate(products, 1):
        stock_status = "In Stock" if product["in_stock"] else "Out of Stock"
        print(f"{i}. {product['name']} - ${product['price']:.2f}, Rating: {product['rating']}, {stock_status}")

def main():
    """Main function to run the console application."""
    try:
        # Construct the path to products.json relative to the script's location
        script_dir = os.path.dirname(__file__)
        file_path = os.path.join(script_dir, "products.json")
        with open(file_path, "r") as f:
            products = json.load(f)
    except FileNotFoundError:
        print("Error: `products.json` not found. Please make sure the file exists in the same directory.")
        return
    except json.JSONDecodeError:
        print("Error: Could not decode `products.json`. Please ensure it's a valid JSON file.")
        return

    print("Welcome to the AI Product Filter!")
    print("Type your request in natural language (e.g., 'fitness products under $50') or 'exit' to quit.")

    while True:
        user_query = input("\n> ")
        if user_query.lower() == 'exit':
            break

        filtered_list = get_products_from_query(user_query, products)
        display_products(filtered_list)

if __name__ == "__main__":
    main() 