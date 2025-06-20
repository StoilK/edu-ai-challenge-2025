import json
import os
from openai import OpenAI
from dotenv import load_dotenv

def post_process_ai_response(function_args, user_query):
    """
    Post-process the AI response to ensure it includes necessary parameters
    that the AI might have missed.
    """
    print("🚀 POST-PROCESSING FUNCTION CALLED!")
    query_lower = user_query.lower()
    print(f"🔍 Post-processing query: '{user_query}'")
    print(f"🔍 Original args: {function_args}")
    
    # Check for cheapest/most affordable queries
    if any(word in query_lower for word in ['cheapest', 'most affordable', 'lowest price']):
        print("💰 Detected cheapest query - adding sorting and limiting")
        if 'sort_by' not in function_args:
            function_args['sort_by'] = 'price'
            print("✅ Added sort_by: price")
        if 'sort_order' not in function_args:
            function_args['sort_order'] = 'asc'
            print("✅ Added sort_order: asc")
        if 'limit' not in function_args and ('the ' in query_lower or 'product' in query_lower):
            function_args['limit'] = 1
            print("✅ Added limit: 1")
    
    # Check for best rated queries
    if any(word in query_lower for word in ['best rated', 'top rated', 'highest rated']):
        print("⭐ Detected best rated query - adding rating sorting")
        if 'sort_by' not in function_args:
            function_args['sort_by'] = 'rating'
        if 'sort_order' not in function_args:
            function_args['sort_order'] = 'desc'
    
    # Only use in_stock_only if explicitly requested
    if 'in_stock_only' in function_args and not any(word in query_lower for word in ['in stock', 'available', 'stock']):
        print("🚫 Removing in_stock_only - not explicitly requested")
        del function_args['in_stock_only']
    
    print(f"🔍 Final args: {function_args}")
    return function_args

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
            "description": "Filters a list of products based on specified criteria. CRITICAL: When user asks for 'the cheapest' or 'cheapest product' (singular), you MUST use 'limit': 1. ONLY use 'in_stock_only': true when user explicitly asks for 'in stock' or 'available' items. Examples: For 'cheapest fitness product' use {'category': ['Fitness'], 'sort_by': 'price', 'sort_order': 'asc', 'limit': 1}. For 'best rated electronics' use {'category': ['Electronics'], 'sort_by': 'rating', 'sort_order': 'desc'}.",
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
                    },
                    "sort_by": {
                        "type": "string",
                        "enum": ["price", "rating", "name"],
                        "description": "Field to sort the products by."
                    },
                    "sort_order": {
                        "type": "string",
                        "enum": ["asc", "desc"],
                        "description": "Order to sort the products in (ascending or descending).",
                        "default": "asc"
                    },
                    "limit": {
                        "type": "integer",
                        "description": "Limit the number of results."
                    }
                },
                "required": []
            }
        }
    ]

    # The user's query and the entire product list are sent to the model.
    # The model uses the product list as context to make a better filtering decision.
    messages = [
        {"role": "system",
         "content": "You are an expert assistant that filters products. Use the `filter_products` function. CRITICAL: When user asks for 'the cheapest' or 'the most affordable' (singular), you MUST include 'limit': 1. When user asks for 'cheapest' or 'most affordable' (plural), you MUST include 'limit': 1. For 'best rated' or 'top rated', use 'sort_by': 'rating', 'sort_order': 'desc'. ONLY use 'in_stock_only': true when user explicitly asks for 'in stock' or 'available' items. Always use the exact parameter names: sort_by, sort_order, limit."},
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
        original_args = json.loads(response_message.function_call.arguments)
        print("\n🔍 AI is filtering with these arguments:", original_args)
        function_args = post_process_ai_response(original_args.copy(), query)
        if function_args != original_args:
            print("🔧 Post-processed arguments:", function_args)
        print(f"✅ Arguments used for filtering: {function_args}")
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
        
    # Sorting
    sort_by = args.get("sort_by")
    if sort_by:
        reverse = args.get("sort_order") == "desc"
        filtered_products.sort(key=lambda p: p[sort_by], reverse=reverse)

    # Limiting
    limit = args.get("limit")
    if limit:
        filtered_products = filtered_products[:limit]

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