// Recipe page html references
const searchSection = document.getElementById('search-section');
const resultsSection = document.getElementById('results-section');
const recipeDetailSection = document.getElementById('recipe-detail-section');
const backBtn = document.getElementById('back-to-results');
const recipeLoading = document.getElementById('recipe-loading');
const recipeError = document.getElementById('recipe-error');
const recipeDetails = document.getElementById('recipe-details');
const pageDates = document.getElementById('date');

// Recipe detail content elements
const recipeImage = document.getElementById('recipe-image');
const recipeTitle = document.getElementById('recipe-title');
const recipeTime = document.getElementById('recipe-time');
const recipeServings = document.getElementById('recipe-servings');
const recipeDietTags = document.getElementById('recipe-diet-tags');
const recipeSummary = document.getElementById('recipe-summary');
const ingredientsList = document.getElementById('ingredients-list');
const instructionsList = document.getElementById('instructions-list');
const nutritionInfo = document.getElementById('nutrition-info');
const nutritionDetails = document.getElementById('nutrition-details');


// Function fetches from the API and shows recipes
async function showRecipeDetails(recipeId) {
    searchSection.style.display = 'none';
    resultsSection.style.display = 'none';
    pageControls.style.display = 'none';
    resultsCount.style.display = 'none';
    pageDates.style.display = 'none';

    recipeDetailSection.style.display = 'block';

    hideRecipeError();
    showRecipeLoading();
    recipeDetails.style.display = 'none';

    try {
        const response = await fetch(`/recipe/${recipeId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const recipeData = await response.json();
        hideRecipeLoading();
        
        if (recipeData.error) {
            showRecipeError('Failed to load recipe details. Please try again.');
            return;
        }
        hideRecipeError();
        displayRecipeDetails(recipeData);
    } catch (error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        
        hideRecipeLoading();
        showRecipeError('Failed to load recipe details. Please try again.');
    }
}

// Function displays the recipe's details
function displayRecipeDetails(recipe) {
    
    recipeDetails.style.display = 'block';
    
    // Set recipe header
    recipeImage.src = recipe.image || '';
    recipeImage.alt = recipe.title || '';
    recipeTitle.textContent = recipe.title || '';
    
    // Set recipe meta information
    recipeTime.textContent = `${recipe.readyInMinutes || 'N/A'} minutes`;
    recipeServings.textContent = `${recipe.servings || 'N/A'} servings`;
    
    // Handle diet tags
    const dietTags = recipe.diets || [];
    if (dietTags.length > 0) {
        recipeDietTags.textContent = `${dietTags.join(', ')}`;
    } else {
        recipeDietTags.textContent = '';
    }
    
    // Handle summary (remove HTML tags and links)
    if (recipe.summary) {
        recipeSummary.innerHTML = recipe.summary;

        // Replace all links with the text content
        const links = recipeSummary.querySelectorAll('a');
        links.forEach(link => {
            link.replaceWith(link.textContent);
        });

        recipeSummary.style.display = 'block';
    } else {
        recipeSummary.textContent = '';
    }
    
    // Set ingredients and instructions
    displayIngredients(recipe.extendedIngredients || []);
    displayInstructions(recipe.instructions || recipe.analyzedInstructions || []);
    
    // Set nutrition if available
    if (recipe.nutrition && recipe.nutrition.nutrients) {
        displayNutrition(recipe.nutrition.nutrients);
        nutritionInfo.style.display = 'block';
    } else {
        nutritionInfo.style.display = 'none';
    }
}

// Function creates ingredients list
function displayIngredients(ingredients) {
    let htmlString = '';
    ingredients.forEach(ingredient => {
        let amount = ingredient.amount || '';
        amount = formatFractions(amount);

        const unit = ingredient.unit || '';
        const name = ingredient.name || ingredient.original || '';
        
        htmlString += `<li>${amount} ${unit} ${name}</li>`;
    });
    ingredientsList.innerHTML = htmlString;
}

// Function creates instructions list
function displayInstructions(instructions) {
    let htmlString = '';
    if (typeof instructions === 'string') {
        // Handle string instructions
        instructionsList.innerHTML = `<li>${instructions}</li>`;
        return;
    }
    if (Array.isArray(instructions)) {
        if (instructions.length > 0 && instructions[0].steps) {
            // Handle analyzedInstructions format
            instructions[0].steps.forEach(step => {
                htmlString += `<li>${step.step}</li>`;
            });
        } else {
            // Handle array format
            instructions.forEach(instruction => {
                htmlString += `<li>${instruction}</li>`;
            });
        }
    }
    instructionsList.innerHTML = htmlString || '<li>No instructions available</li>';
}

// Function displays nutrition information
function displayNutrition(nutrients) {
    let htmlString = '';
    const importantNutrients = ['Calories', 'Protein', 'Carbohydrates', 'Fat', 'Fiber', 'Sugar'];
    
    importantNutrients.forEach(nutrientName => {
        const nutrient = nutrients.find(n => n.name === nutrientName);
        if (nutrient) {
            htmlString += `<div class="nutrition-item">
                <strong>${nutrient.name}:</strong> ${Math.round(nutrient.amount)}${nutrient.unit}
            </div>`;
        }
    });
    nutritionInfo.style.display = 'block';
    nutritionDetails.innerHTML = htmlString;
}

// Function converts decimal measurements to fractions
function formatFractions(decimal) {
    if (decimal === 0) return '0';
    if (decimal === 1) return '1';

    // Common fractions
    const fractions = {
        0.125: '1/8',
        0.25: '1/4',
        0.33: '1/3',
        0.5: '1/2',
        0.67: '2/3',
        0.75: '3/4'
    };

    const wholeNumber = Math.floor(decimal);
    const fractionPart = decimal - wholeNumber;
    const rounded = Math.round(fractionPart * 100) / 100;

    // formats proper and improper fractions
    if (fractions[rounded]) {
        if (wholeNumber != 0) {
            return `${wholeNumber} ${fractions[rounded]}`;
        } else {
            return `${fractions[rounded]}`
        }
    } else {
        return decimal;
    }
}

// Back button event listener
backBtn.addEventListener('click', function() {
    recipeDetailSection.style.display = 'none';
    searchSection.style.display = 'flex';
    resultsSection.style.display = 'block';
    resultsCount.style.display = 'block';
    pageControls.style.display = 'flex';
    pageDates.style.display = 'block';
    hideRecipeError();
});

// Functions show/hide loading and errors
function showRecipeLoading() {
    recipeLoading.style.display = 'block';
}

function hideRecipeLoading() {
    recipeLoading.style.display = 'none';
}

function showRecipeError(message) {
    recipeError.textContent = message;
    recipeError.style.display = 'flex';
}

function hideRecipeError() {
    recipeError.style.display = 'none';
    recipeError.textContent = '';
}