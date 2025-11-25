import React, { useState, useEffect, ChangeEvent } from 'react';

interface Recipe {
  id: string;
  name: string;
  ingredients: string[];
  instructions: string;
  servings: number;
  prepTime: number;
  source?: string;
  rating?: number; // 1-5 stars
}

const STORAGE_KEY = 'snacksense_recipes';

export default function Recipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [recipeName, setRecipeName] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [instructions, setInstructions] = useState('');
  const [servings, setServings] = useState('2');
  const [prepTime, setPrepTime] = useState('30');
  const [showForm, setShowForm] = useState(false);
  const [showUrlForm, setShowUrlForm] = useState(false);
  const [recipeUrl, setRecipeUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load recipes from localStorage on mount
  useEffect(() => {
    console.log('Loading recipes from localStorage...');
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsedRecipes = JSON.parse(stored);
        setRecipes(parsedRecipes);
        console.log('✅ Loaded recipes from localStorage:', parsedRecipes);
      } catch (e) {
        console.error('❌ Failed to load recipes:', e);
      }
    } else {
      console.log('ℹ️ No recipes found in localStorage');
    }
    setIsLoaded(true);
  }, []);

  // Save recipes to localStorage whenever they change (but only after initial load)
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
      console.log('✅ Saved recipes to localStorage:', recipes);
    }
  }, [recipes, isLoaded]);

  const addRecipe = () => {
    if (!recipeName.trim() || !ingredients.trim()) return;

    const newRecipe: Recipe = {
      id: editingId || Date.now().toString(),
      name: recipeName,
      ingredients: ingredients.split('\n').filter(i => i.trim()),
      instructions,
      servings: Number(servings),
      prepTime: Number(prepTime),
      rating: editingId ? recipes.find(r => r.id === editingId)?.rating : 0,
    };

    if (editingId) {
      setRecipes(recipes.map(r => r.id === editingId ? { ...newRecipe, rating } : r));
      setEditingId(null);
    } else {
      setRecipes([...recipes, newRecipe]);
    }
    
    resetForm();
  };

  const resetForm = () => {
    setRecipeName('');
    setIngredients('');
    setInstructions('');
    setServings('2');
    setPrepTime('30');
    setShowForm(false);
    setEditingId(null);
    setRating(0);
  };

  const fetchRecipeFromUrl = () => {
    if (!recipeUrl.trim()) return;
    
    setLoading(true);
    setError('');

    // Call the backend API to fetch and parse the recipe
    fetch('http://localhost:3001/api/fetch-recipe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: recipeUrl }),
    })
      .then(response => response.json())
      .then((data: any) => {
        if (data.error) {
          setError(data.error);
          setLoading(false);
          return;
        }

        const newRecipe: Recipe = {
          id: Date.now().toString(),
          name: data.name || 'Recipe from URL',
          ingredients: Array.isArray(data.ingredients) && data.ingredients.length > 0 
            ? data.ingredients 
            : ['Ingredients not found - please add manually'],
          instructions: data.instructions || 'Instructions not found - please add manually',
          servings: data.servings || 2,
          prepTime: data.prepTime || 30,
          source: recipeUrl,
        };

        setRecipes([...recipes, newRecipe]);
        setRecipeUrl('');
        setShowUrlForm(false);
        setLoading(false);

        if (!data.success) {
          setError('Recipe details partially extracted. Please edit to add missing information.');
        }
      })
      .catch((err) => {
        setError(`Failed to fetch recipe: ${err.message || 'Connection error. Make sure the server is running.'}`);
        setLoading(false);
      });
  };

  const removeRecipe = (id: string) => {
    setRecipes(recipes.filter(recipe => recipe.id !== id));
  };

  const editRecipe = (recipe: Recipe) => {
    setRecipeName(recipe.name);
    setIngredients(recipe.ingredients.join('\n'));
    setInstructions(recipe.instructions);
    setServings(recipe.servings.toString());
    setPrepTime(recipe.prepTime.toString());
    setRating(recipe.rating || 0);
    setEditingId(recipe.id);
    setShowForm(true);
    setShowUrlForm(false);
  };

  const handleRecipeNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setRecipeName(e.target.value);
  };

  const handleIngredientsChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setIngredients(e.target.value);
  };

  const handleInstructionsChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInstructions(e.target.value);
  };

  const handleServingsChange = (e: ChangeEvent<HTMLInputElement>) => {
    setServings(e.target.value);
  };

  const handlePrepTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPrepTime(e.target.value);
  };

  const handleUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    setRecipeUrl(e.target.value);
  };

  const updateRecipeRating = (id: string, newRating: number) => {
    setRecipes(recipes.map(r => r.id === id ? { ...r, rating: newRating } : r));
  };

  const renderStars = (recipeRating: number, recipeId: string, isEditable: boolean) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            onClick={() => isEditable && updateRecipeRating(recipeId, star)}
            disabled={!isEditable}
            className={`text-lg transition ${
              star <= recipeRating 
                ? 'text-yellow-400' 
                : 'text-gray-300'
            } ${isEditable ? 'cursor-pointer hover:text-yellow-400' : 'cursor-default'}`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Recipes</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowUrlForm(!showUrlForm)}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            {showUrlForm ? 'Cancel' : '🌐 Add from Web'}
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            {showForm ? 'Cancel' : '➕ Add Recipe'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {showUrlForm && (
        <div className="mb-6 p-4 bg-orange-50 rounded-lg space-y-3">
          <input
            type="url"
            placeholder="Recipe URL (e.g., https://www.example.com/recipe)"
            value={recipeUrl}
            onChange={handleUrlChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <p className="text-sm text-gray-600">
            Paste a recipe URL. We'll try to extract the recipe information automatically.
          </p>
          <button
            onClick={fetchRecipeFromUrl}
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition"
          >
            {loading ? 'Loading...' : 'Fetch Recipe'}
          </button>
        </div>
      )}

      {showForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-3">
          <input
            type="text"
            placeholder="Recipe name"
            value={recipeName}
            onChange={handleRecipeNameChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          
          <textarea
            placeholder="Ingredients (one per line)"
            value={ingredients}
            onChange={handleIngredientsChange}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          <textarea
            placeholder="Instructions"
            value={instructions}
            onChange={handleInstructionsChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Servings"
              value={servings}
              onChange={handleServingsChange}
              min="1"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <input
              type="number"
              placeholder="Prep time (min)"
              value={prepTime}
              onChange={handlePrepTimeChange}
              min="1"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Rate this recipe:</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-2xl transition ${
                    star <= rating 
                      ? 'text-yellow-400' 
                      : 'text-gray-300'
                  } hover:text-yellow-400`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={addRecipe}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg transition"
          >
            {editingId ? 'Update Recipe' : 'Save Recipe'}
          </button>
        </div>
      )}

      <div className="space-y-4">
        {recipes.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No recipes yet. Add one to get started!</p>
        ) : (
          recipes.map((recipe: Recipe) => (
            <div
              key={recipe.id}
              className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{recipe.name}</h3>
                  <p className="text-sm text-gray-600">
                    ⏱️ {recipe.prepTime} min | 👥 {recipe.servings} servings
                  </p>
                  {recipe.rating && recipe.rating > 0 && (
                    <div className="mt-1 flex items-center gap-1">
                      {renderStars(recipe.rating, recipe.id, true)}
                      <span className="text-xs text-gray-600">({recipe.rating}/5)</span>
                    </div>
                  )}
                  {recipe.source && (
                    <a
                      href={recipe.source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:text-blue-700 mt-1 block"
                    >
                      View source
                    </a>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => editRecipe(recipe)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg transition text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => removeRecipe(recipe.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg transition text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              <div className="mt-3">
                <p className="text-sm font-semibold text-gray-700 mb-1">Ingredients:</p>
                <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                  {recipe.ingredients.slice(0, 3).map((ing: string, idx: number) => (
                    <li key={idx}>{ing}</li>
                  ))}
                  {recipe.ingredients.length > 3 && (
                    <li className="text-gray-500">+{recipe.ingredients.length - 3} more</li>
                  )}
                </ul>
              </div>

              {recipe.instructions && (
                <div className="mt-3">
                  <p className="text-sm font-semibold text-gray-700 mb-1">Instructions:</p>
                  <p className="text-sm text-gray-600 line-clamp-2">{recipe.instructions.substring(0, 150)}...</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
