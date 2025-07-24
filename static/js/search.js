// Search and Results html references
const form = document.getElementById('search-form');
const queryInput = document.getElementById('query');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const results = document.getElementById('results');
const pageControls = document.getElementById('page-controls');
const resultsCount = document.getElementById('results-count');
const pageNumber = document.getElementById('page-number');
const previousBtn = document.getElementById("previous-btn");
const nextBtn = document.getElementById("next-btn");

// Pagination Variables
let offset = 0;
const limit = 10;
let totalResults = 0;
let builtParams = '';


// Function sets parameters for an API call
function buildSearchParams() {
    // Gets search term and filters
    const query = queryInput.value.trim();
    const diet = document.getElementById('diet').value.trim();
    const includeIngredients = document.getElementById('include').value.trim();
    const excludeIngredients = document.getElementById('exclude').value.trim();

    if (!query) {
        return null;
    }

    // Append selected filters to the URL
    const params = new URLSearchParams({query});
    if (diet) {
        params.append('diet', diet);
    }
    if (includeIngredients) {
        params.append('includeIngredients', includeIngredients);
    }
    if (excludeIngredients) {
        params.append('excludeIngredients', excludeIngredients);
    }
    
    return params.toString();
}

// Handles Search submissions
form.addEventListener('submit', function(e) {
    e.preventDefault();
    offset = 0; 
    
    builtParams = buildSearchParams();
    if (!builtParams) {
        showError("Please enter a search term");
        return;
    } else {
        searchRecipes(builtParams);
    }
});

// Function fetches results from API
async function searchRecipes(queryParams) {
    if (!queryInput) {
        return;
    }

    if (offset < 0) {
        offset = 0;
    }

    showLoading();
    hideError();
    clearResults();

    try {
        // Calls flask API endpoint
        const paginatedParams = queryParams + `&offset=${offset}`;
        const response = await fetch(`/recipes?${paginatedParams}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        hideLoading();

        if (data.error) {
            showError(data.error);
            return;
        }

        displayResults(data.results || []);

        // Pagination info is added to HTML
        totalResults = data.totalResults;
        const totalPages = Math.ceil(totalResults / limit);
        const currentPage = Math.floor(offset / limit) + 1;
        resultsCount.innerHTML = `Showing ${offset + 1}-${Math.min(offset + limit, totalResults)} of ${totalResults} results`;
        pageNumber.innerHTML = ` ${currentPage} / ${totalPages} `;
        updatePageButtons();

    } catch (error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);

        hideLoading();
        showError('Search failed. Please try again.');
    }
}

// Function displays search results
function displayResults(recipes) {
    if (recipes.length === 0) {
        results.innerHTML = '<p>No recipes found. Try different keywords.</p>';
        resultsCount.style.display = 'none';
        pageControls.style.display = 'none';
        return;
    }

    pageControls.style.display = 'flex';
    resultsCount.style.display = 'block';
    
    let htmlString = '';
    recipes.forEach(recipe => {
        htmlString += 
           `<div class="recipe" data-recipe-id="${recipe.id}">
                <img src="${recipe.image}" alt="${recipe.title}" loading="lazy">
                <h3>${recipe.title}</h3>
                <p>Prep time: ${recipe.readyInMinutes || 'N/A'} minutes</p>
                <p>Servings: ${recipe.servings || 'N/A'} </p>
            </div>` 
        ;    
    });
    results.innerHTML = htmlString;
}

function updatePageButtons() {
    // Disables previous button if unneeded
    if (offset <= 0) {
        previousBtn.disabled = true;
        previousBtn.style.opacity = '0.5';
        previousBtn.style.cursor = 'not-allowed';
    } else {
        previousBtn.disabled = false;
        previousBtn.style.opacity = '1';
        previousBtn.style.cursor = 'pointer';
    }

    // Disables next button if unneeded
    if (offset + limit >= totalResults) {
        nextBtn.disabled = true;
        nextBtn.style.opacity = '0.5';
        nextBtn.style.cursor = 'not-allowed';
    } else {
        nextBtn.disabled = false;
        nextBtn.style.opacity = '1';
        nextBtn.style.cursor = 'pointer';
    }
}

// Adds click event listener to recipes
results.addEventListener('click', function(e) {
    const card = e.target.closest('.recipe[data-recipe-id]');
    if (card) {
        const recipeId = card.getAttribute('data-recipe-id');
        showRecipeDetails(recipeId);
    }
});

// Set page button functionality
previousBtn.addEventListener('click', function() {
    if (offset - limit >= 0) {
        offset -= limit;
        searchRecipes(builtParams);
    }
});

nextBtn.addEventListener('click', function() {
    if (offset + limit < totalResults) {
        offset += limit;
        searchRecipes(builtParams);
    }
});


// Functions display/hide loading message
function showLoading() {
    loading.style.display = 'block';
}

function hideLoading() {
    loading.style.display = 'none';
}


// Functions display/hide error message
function showError(message) {
    error.textContent = message;
    error.style.display = 'block';
}

function hideError() {
    error.style.display = 'none';
    error.textContent = '';
}


// Function clears search results
function clearResults() {
    results.innerHTML = '';
}

// Date and last modified date
document.addEventListener("DOMContentLoaded", function() {
    const currentDate = new Date();
    const lastModified = new Date(document.lastModified);
    const results = (` ${currentDate.toDateString()}. Last Modified: ${lastModified.toDateString()}.`);
    document.getElementById("date").textContent = results;
});