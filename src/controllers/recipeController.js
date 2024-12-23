import { logError, logInfo } from '../middlewares/logger.js';
import prisma from '../config/prisma.js';
import openai from '../config/openai.js';
import { FatSecretService } from '../config/fatsecret.js';

// 1. 전체 레시피 생성 (영양 정보 제외)
async function generateInitialRecipe(requirements) {
    const prompt = `Create a complete recipe with these requirements:
        - Meal Type: ${requirements.meal_type}
        - Cuisine: ${requirements.cuisine_type}
        - Dietary Restrictions: ${requirements.dietary_restrictions.join(', ')}
        - Allergies to avoid: ${requirements.allergies.join(', ')}
        - Servings: ${requirements.servings}
        - Must use these ingredients: ${requirements.ingredients.join(', ')}

        IMPORTANT: Keep your response brief and focused. Make sure to keep the token length of responses under 8000.
        Respond ONLY with a valid JSON object in this exact format:
        {
            "title": "string",
            "description": "string",
            "ingredients": ["ingredient: quantity unit"],  // Example: ["shrimp: 200 grams", "pasta: 200 grams"]
            "instructions": ["step1", "step2"],
            "cookingTime": "string",
            "skillLevel": "string"
        }
        
        Keep instructions under 5 steps.
        Do not include nutritional information yet.
        Focus on using the key ingredients effectively.`;

    const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
            {
                "role": "system",
                "content": "You are a professional chef. Create recipes that strictly include all required ingredients."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature: 0.7,
        max_tokens: 2000
    });

    try {
        const content = completion.choices[0].message.content.trim();
        logInfo(`Initial Recipe GPT Response: ${content}`);
        return JSON.parse(content);
    } catch (error) {
        logError(`JSON parsing error: ${error.message}`);
        throw new Error('Failed to parse initial recipe from GPT response');
    }
}

// 2. 영양 정보만 계산
async function calculateNutritionFacts(recipe, nutritionInfo) {
    // 필요한 영양 정보만 추출
    const simplifiedNutrition = nutritionInfo.map(item => ({
        ingredient: item.ingredient,
        nutrition: {
            calories: item.nutrition.calories,
            protein: item.nutrition.protein,
            carbohydrate: item.nutrition.carbohydrate,
            fat: item.nutrition.fat,
            fiber: item.nutrition.fiber,
            sugar: item.nutrition.sugar,
            sodium: item.nutrition.sodium
        }
    }));

    const prompt = `Calculate nutrition facts per serving for this recipe:
        Recipe Ingredients: ${JSON.stringify(recipe.ingredients)}
        FatSecret Nutrition Data: ${JSON.stringify(simplifiedNutrition)}
        Servings: ${recipe.servings}
        
        Return ONLY a valid JSON object in this EXACT format:
        {
            "nutritionFacts": {
                "calories": number,
                "protein": number,
                "carbs": number,
                "fat": number,
                "fiber": number,
                "sugar": number,
                "sodium": number
            }
        }`;

    const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
            {
                "role": "system",
                "content": "You are a nutrition calculator. Return ONLY the exact JSON format requested."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature: 0.1
    });

    try {
        const content = completion.choices[0].message.content.trim();
        const parsed = JSON.parse(content);
        
        if (!parsed.nutritionFacts) {
            throw new Error('Invalid nutrition facts format');
        }
        
        return parsed;
    } catch (error) {
        throw new Error('Failed to parse nutrition facts from GPT response');
    }
}

export const recipeController = {
    generateRecipe: async (req, res) => {
        try {
            const requirements = req.body;
            const fatSecretService = new FatSecretService();

            // 테스트용 사용자 ID
            const tempUserId = "test_user_123";
            
            // 테스트용 사용자가 없다면 생성
            let testUser;
            try {
                testUser = await prisma.user.findUnique({
                    where: { id: tempUserId }
                });
                
                if (!testUser) {
                    testUser = await prisma.user.create({
                        data: {
                            id: tempUserId,
                            email: "test@example.com",
                            username: "Test User",
                            preferences: {}
                        }
                    });
                }
            } catch (error) {
                logError(`Test user creation error: ${error.message}`);
            }

            // 1. 전체 레시피 생성 (영양 정보 제외)
            const initialRecipe = await generateInitialRecipe(requirements);
            
            // 2. FatSecret API로 영양 정보 조회
            const nutritionInfo = [];
            for (const ingredient of initialRecipe.ingredients) {
                const [name] = ingredient.split(':');
                logInfo(`Searching FatSecret for ingredient: ${name}`);
                const searchResult = await fatSecretService.searchFood(name);
                logInfo(`FatSecret search response: ${JSON.stringify(searchResult)}`);
                
                if (searchResult.foods?.food?.length > 0) {
                    const foodId = searchResult.foods.food[0].food_id;
                    logInfo(`Getting nutrition for food_id: ${foodId}`);
                    const nutrition = await fatSecretService.getFoodNutrition(foodId);
                    logInfo(`FatSecret nutrition response: ${JSON.stringify(nutrition)}`);
                    
                    nutritionInfo.push({
                        ingredient,
                        nutrition: nutrition.food.servings.serving
                    });
                } else {
                    logInfo(`No FatSecret results found for: ${name}`);
                }
            }

            // 3. 영양 정보 계산
            const nutritionFacts = await calculateNutritionFacts(initialRecipe, nutritionInfo);

            // 4. 최종 레시피 저장
            const recipe = await prisma.recipe.create({
                data: {
                    ...initialRecipe,
                    nutritionFacts: nutritionFacts.nutritionFacts,
                    mealType: requirements.meal_type,
                    cuisineType: requirements.cuisine_type,
                    dietaryRestrictions: requirements.dietary_restrictions,
                    allergies: requirements.allergies,
                    servings: requirements.servings,
                    calorieLimit: requirements.calorie_limit,
                    userId: tempUserId
                }
            });

            return res.status(201).json({
                success: true,
                data: recipe
            });
        } catch (error) {
            logError(`Recipe generation error: ${error.message}`);
            return res.status(500).json({
                success: false,
                error: {
                    code: 'RECIPE_GENERATION_ERROR',
                    message: error.message
                }
            });
        }
    },

    saveRecipe: async (req, res) => {
        try {
            const { recipe_id } = req.body;
            
            logInfo(`Saving recipe ${recipe_id} for user: ${req.user.uid}`);

            return res.status(200).json({
                success: true,
                data: {
                    recipe_id
                }
            });
        } catch (error) {
            logError(`Recipe save error: ${error.message}`);
            return res.status(500).json({
                success: false,
                error: {
                    code: 'RECIPE_SAVE_ERROR',
                    message: error.message
                }
            });
        }
    },

    getSavedRecipes: async (req, res) => {
        try {
            logInfo(`Fetching saved recipes for user: ${req.user.uid}`);

            return res.status(200).json({
                success: true,
                data: {
                    recipes: []
                }
            });
        } catch (error) {
            logError(`Fetch saved recipes error: ${error.message}`);
            return res.status(500).json({
                success: false,
                error: {
                    code: 'FETCH_RECIPES_ERROR',
                    message: error.message
                }
            });
        }
    },

    submitFeedback: async (req, res) => {
        try {
            const { recipe_id, rating, comments, issues } = req.body;
            
            logInfo(`Feedback submitted for recipe ${recipe_id} by user: ${req.user.uid}`);

            return res.status(200).json({
                success: true,
                data: {
                    feedback_id: 'generated_feedback_id'
                }
            });
        } catch (error) {
            logError(`Feedback submission error: ${error.message}`);
            return res.status(500).json({
                success: false,
                error: {
                    code: 'FEEDBACK_ERROR',
                    message: error.message
                }
            });
        }
    },

    searchRecipes: async (req, res) => {
        try {
            const { query, filters } = req.query;
            
            logInfo(`Searching recipes with query: ${query} for user: ${req.user.uid}`);

            const recipes = await prisma.recipe.findMany({
                where: {
                    OR: [
                        { title: { contains: query, mode: 'insensitive' } },
                        { description: { contains: query, mode: 'insensitive' } },
                        { ingredients: { has: query } }
                    ],
                    ...(filters?.cuisineType && { cuisineType: filters.cuisineType }),
                    ...(filters?.mealType && { mealType: filters.mealType })
                },
                include: {
                    feedbacks: {
                        select: {
                            rating: true
                        }
                    }
                }
            });

            return res.status(200).json({
                success: true,
                data: {
                    recipes: recipes.map(recipe => ({
                        ...recipe,
                        average_rating: recipe.feedbacks.length 
                            ? recipe.feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / recipe.feedbacks.length 
                            : null
                    }))
                }
            });
        } catch (error) {
            logError(`Recipe search error: ${error.message}`);
            return res.status(500).json({
                success: false,
                error: {
                    code: 'RECIPE_SEARCH_ERROR',
                    message: error.message
                }
            });
        }
    },

    getRecipeDetails: async (req, res) => {
        try {
            const { recipeId } = req.params;
            
            logInfo(`Fetching recipe details for recipe: ${recipeId}`);

            const recipe = await prisma.recipe.findUnique({
                where: { id: recipeId },
                include: {
                    feedbacks: {
                        include: {
                            user: {
                                select: {
                                    username: true
                                }
                            }
                        }
                    }
                }
            });

            if (!recipe) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'RECIPE_NOT_FOUND',
                        message: 'Recipe not found'
                    }
                });
            }

            return res.status(200).json({
                success: true,
                data: {
                    ...recipe,
                    average_rating: recipe.feedbacks.length 
                        ? recipe.feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / recipe.feedbacks.length 
                        : null
                }
            });
        } catch (error) {
            logError(`Recipe details fetch error: ${error.message}`);
            return res.status(500).json({
                success: false,
                error: {
                    code: 'RECIPE_DETAILS_ERROR',
                    message: error.message
                }
            });
        }
    }
}; 

// Todo: fatsecret 영양 정보 조회 테스트!