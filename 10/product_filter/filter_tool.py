import json
import os
from openai import OpenAI
from dotenv import load_dotenv

def get_products_from_query(query, products):
    """
    Uses OpenAI function calling to determine filtering arguments from a natural language query
    and then applies them to a product list.
    """
    load_dotenv()
    client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

    functions = [
        {
            "name": "filter_products",
            "description": "Filters a list of products based on specified criteria.",
            "parameters": {
                "type": "object",
                "properties": {
                    "category": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "The list of categories to filter by (e.g., ['Fitness', 'Electronics'])."
                    },
                    "max_price": {
                        "type": "number",
                        "description": "The maximum price of the products."
                    },
                    "min_rating": {
                        "type": "number",
                        "description": "The minimum rating of the products (from 1 to 5)."
                    },
                    "in_stock_only": {
                        "type": "boolean",
                        "description": "Whether to only include products that are in stock."
                    }
                },
                "required": []
            }
        }
    ]

    # The user's query and the entire product list are sent to the model.
    # The model uses the product list as context to make a better filtering decision.
    messages = [
        {"role": "system", "content": "You are a helpful assistant that filters a product list based on user queries. Use the provided `filter_products` function. The product list is available for your reference to make an informed decision."},
        {"role": "user", "content": f"User query: '{query}'\n\nProduct data: {json.dumps(products)}"}
    ]

    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=messages,
        functions=functions,
        function_call="auto"
    )

    response_message = response.choices[0].message
    
    # Check if the model wants to call a function
    if response_message.function_call:
        function_args = json.loads(response_message.function_call.arguments)
        print("\n🔍 AI is filtering with these arguments:", function_args)
        return apply_filters(products, function_args)
    else:
        print("\n🤔 AI did not specify any filters. Returning all products.")
        return products


def apply_filters(products, args):
    """
    Applies filtering to the product list based on the arguments
    provided by the OpenAI model.
    """
    filtered_products = products

    if args.get("category"):
        categories = [cat.lower() for cat in args["category"]]
        filtered_products = [
            p for p in filtered_products if p["category"].lower() in categories
        ]

    if args.get("max_price") is not None:
        filtered_products = [
            p for p in filtered_products if p["price"] <= args["max_price"]
        ]

    if args.get("min_rating") is not None:
        filtered_products = [
            p for p in filtered_products if p["rating"] >= args["min_rating"]
        ]

    if args.get("in_stock_only"):
        filtered_products = [
            p for p in filtered_products if p["in_stock"]
        ]
        
    return filtered_products

def display_products(products):
    """Formats and prints the list of filtered products."""
    if not products:
        print("\nNo products found matching your criteria.")
        return
        
    print("\nFiltered Products:")
    for product in products:
        stock_status = "In Stock" if product["in_stock"] else "Out of Stock"
        print(f"{product['name']} - ${product['price']:.2f}, Rating: {product['rating']}, {stock_status}")

def main():
    """Main function to run the console application."""
    try:
        with open("products.json", "r") as f:
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