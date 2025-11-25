import express from 'express';
import cors from 'cors';
import http from 'http';
import https from 'https';

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
    const fetchUrl = new URL(url);
    const client = fetchUrl.protocol === 'https:' ? https : http;

    const response = await new Promise((resolve, reject) => {
      const request = client.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ status: res.statusCode, data }));
      });
      
      request.on('error', reject);
      request.setTimeout(5000, () => reject(new Error('Request timeout')));
    });

    if (response.status !== 200) {
      return res.status(response.status).json({ error: `HTTP ${response.status}` });
    }

    const html = response.data;

    // Try to extract JSON-LD recipe data
    const jsonLdMatch = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/);
    
    if (jsonLdMatch) {
      try {
        const jsonData = JSON.parse(jsonLdMatch[1]);
        
        // Handle both single recipe and array of items
        let recipeData = jsonData;
        if (Array.isArray(jsonData)) {
          recipeData = jsonData.find((item) => item['@type'] === 'Recipe' || (Array.isArray(item['@type']) && item['@type'].includes('Recipe')));
        }

        if (recipeData && (recipeData['@type'] === 'Recipe' || (Array.isArray(recipeData['@type']) && recipeData['@type'].includes('Recipe')))) {
          const ingredients = Array.isArray(recipeData.recipeIngredient) 
            ? recipeData.recipeIngredient.map((ing) => {
                if (typeof ing === 'string') {
                  return ing.replace(/<[^>]*>/g, '').trim();
                }
                return '';
              }).filter((ing) => ing)
            : [];

          const instructions = recipeData.recipeInstructions;
          let instructionText = '';
          
          if (Array.isArray(instructions)) {
            instructionText = instructions
              .map((inst) => {
                if (typeof inst === 'string') return inst;
                if (inst.text) return inst.text;
                if (inst['@type'] === 'HowToStep') return inst.text;
                return '';
              })
              .filter((text) => text)
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

    // Fallback: Try basic HTML parsing
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
