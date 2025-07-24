from flask import Flask, request, jsonify, render_template
import requests
import os
from dotenv import load_dotenv
import logging

app = Flask(__name__)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# loads API key from .env file
load_dotenv()
API_KEY = os.getenv("API_KEY")
if not API_KEY:
    raise ValueError("API_KEY environment variable is required")

# Load HTML for web pages
@app.route("/")
def home():
    return render_template("index.html")

# Get search results
@app.route("/recipes", methods=["GET"])
def get_recipes():
    api_url = "https://api.spoonacular.com/recipes/complexSearch"
    offset = request.args.get("offset", default=0, type=int)
    if offset < 0:
        return jsonify({"Error": "Offset must be non-negative"}), 400
    
    params = {
        "apiKey": API_KEY,
        "number": 9,
        "offset": offset,
        "addRecipeInformation": True,
        "query": request.args.get("query"),
        "diet": request.args.get("diet"),
        "excludeIngredients": request.args.get("excludeIngredients"),
        "includeIngredients": request.args.get("includeIngredients")
    }

    # Only add the filters that are selected
    selected_params = {}
    for key, value in params.items():
        if value:
            selected_params[key] = value
    params = selected_params 

    try:
        # Calls API with parameters
        response = requests.get(api_url, params=params, timeout=10)
        response.raise_for_status()
        api_data = response.json()
        return jsonify({
            "results": api_data.get("results", []),
            "totalResults": api_data.get("totalResults", 0)
            })  
    except requests.exceptions.RequestException as e:
        logger.error(f"API request failed: {str(e)}")
        return jsonify("Error, service unavailable"), 500
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return jsonify({"error": "internal server error"}), 500


# Get a recipe's details through its ID
@app.route("/recipe/<int:recipe_id>", methods=["GET"])
def get_recipe_details(recipe_id):
    if recipe_id <= 0:
        return jsonify({"Error": "Invalid recipe ID"}), 400
    
    api_url = f"https://api.spoonacular.com/recipes/{recipe_id}/information"
    params = {
        "apiKey": API_KEY,
        "includeNutrition": True
    }

    try:
        response = requests.get(api_url, params=params, timeout=10)
        response.raise_for_status()
        recipe_data = response.json()
        return jsonify(recipe_data)
    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        return jsonify({"error": "internal server error"}), 500


if __name__ == "__main__":
    app.run()