import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.post('/api/fetch-recipe', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Validate URL
    new URL(url);

    // Fetch the recipe page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `HTTP ${response.status}` });
    }

    const html = await response.text();

    // Try to extract JSON-LD recipe data
    const jsonLdMatch = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/s);
    
    if (jsonLdMatch) {
      try {
        const jsonData = JSON.parse(jsonLdMatch[1]);
        
        // Handle both single recipe and array of items
        let recipeData = jsonData;
        if (Array.isArray(jsonData)) {
          recipeData = jsonData.find((item: any) => item['@type'] === 'Recipe' || (Array.isArray(item['@type']) && item['@type'].includes('Recipe')));
        }

        if (recipeData && (recipeData['@type'] === 'Recipe' || (Array.isArray(recipeData['@type']) && recipeData['@type'].includes('Recipe')))) {
          const ingredients = Array.isArray(recipeData.recipeIngredient) 
            ? recipeData.recipeIngredient.map((ing: string) => ing.replace(/<[^>]*>/g, '').trim()).filter((ing: string) => ing)
            : [];

          const instructions = recipeData.recipeInstructions;
          let instructionText = '';
          
          if (Array.isArray(instructions)) {
            instructionText = instructions
              .map((inst: any) => {
                if (typeof inst === 'string') return inst;
                if (inst.text) return inst.text;
                if (inst['@type'] === 'HowToStep') return inst.text;
                return '';
              })
              .filter((text: string) => text)
              .join('\n');
          } else if (typeof instructions === 'string') {
            instructionText = instructions;
          }

          return res.json({
            success: true,
            name: recipeData.name || 'Recipe',
            ingredients: ingredients,
            instructions: instructionText || 'No instructions provided',
            servings: recipeData.recipeYield?.[0] || recipeData.recipeYield || 2,
            prepTime: recipeData.prepTime ? parseInt(recipeData.prepTime.replace(/PT(\d+)M/, '$1')) : 30,
          });
        }
      } catch (e) {
        console.error('Failed to parse JSON-LD:', e);
      }
    }

    // Fallback: Try basic HTML parsing for AllRecipes
    const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/);
    const name = titleMatch ? titleMatch[1].trim() : 'Recipe';

    return res.json({
      success: false,
      name: name,
      ingredients: [],
      instructions: 'Could not automatically extract recipe data. Please add ingredients and instructions manually.',
      servings: 2,
      prepTime: 30,
    });
  } catch (error) {
    console.error('Error fetching URL:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Recipe fetch server running on http://localhost:${PORT}`);
});

