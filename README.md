# Recipe Search Web App
A simple web application that helps users discover recipes based on diet preferences and ingredients. It connects to an external API to fetch results and provide a summary, instructions, and nutrition information for each recipe.

Link for live version: https://recipe-search-gkgz.onrender.com

## Features
- Search recipes by ingredients and diet
- View recipe instructions and ingredients
- Nutrition information for each recipe
- Responsive web design
- API integration with Spoonacular

## Tech Used
- Front End: JavaScript, HTML, and CSS
- Back End: Python - Flask
- API: Spoonacular API
- Hosting: Render

## Setup Guide
1. Clone the Repository
     ```bash
     git clone https://github.com/HannahL06/recipe-search.git
     cd recipe-search
     ```
2. Get your Spoonacular API key

     Sign up for a free account at https://spoonacular.com/.
     Recieve your API key (free account includes 150 calls a day).
4. Set up Environment Variable
     Create a '.env' file in the root directory:
     ```bash
     touch .env
     ```
     Add your API key to the file:
     ```env
     API_KEY=your_API_key
     ```
5. Install dependencies using a virtual environment
     ```bash
     python -m venv venv
     source venv/bin/activate
     pip install -r requirements.txt
     ```
6. Run the app
   ```bash
   flask --app recipe-search run
   ```
