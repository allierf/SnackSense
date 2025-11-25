import React, { useState, useEffect } from 'react';

interface MealPlan {
  id: string;
  day: string;
  meal: string;
  recipe?: string;
  notes?: string;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
const STORAGE_KEY = 'snacksense_mealplan';

export default function WeeklyPlanner() {
  const [meals, setMeals] = useState<MealPlan[]>([]);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [selectedMealType, setSelectedMealType] = useState('Breakfast');
  const [mealName, setMealName] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load meals from localStorage on mount
  useEffect(() => {
    console.log('Loading meals from localStorage...');
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsedMeals = JSON.parse(stored);
        setMeals(parsedMeals);
        console.log('✅ Loaded meals from localStorage:', parsedMeals);
      } catch (e) {
        console.error('❌ Failed to load meals:', e);
      }
    } else {
      console.log('ℹ️ No meals found in localStorage');
    }
    setIsLoaded(true);
  }, []);

  // Save meals to localStorage whenever they change (but only after initial load)
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(meals));
      console.log('✅ Saved meals to localStorage:', meals);
    }
  }, [meals, isLoaded]);

  const addMeal = () => {
    if (!mealName.trim()) return;

    const newMeal: MealPlan = {
      id: Date.now().toString(),
      day: selectedDay,
      meal: `${selectedMealType}: ${mealName}`,
      notes,
    };

    setMeals([...meals, newMeal]);
    setMealName('');
    setNotes('');
  };

  const removeMeal = (id: string) => {
    setMeals(meals.filter(meal => meal.id !== id));
  };

  const getMealsForDay = (day: string) => {
    return meals.filter(meal => meal.day === day);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Weekly Planner</h2>

      <div className="mb-6 p-4 bg-purple-50 rounded-lg space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {DAYS.map(day => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>

          <select
            value={selectedMealType}
            onChange={(e) => setSelectedMealType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {MEAL_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <input
          type="text"
          placeholder="Meal name or recipe"
          value={mealName}
          onChange={(e) => setMealName(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <textarea
          placeholder="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <button
          onClick={addMeal}
          className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 rounded-lg transition"
        >
          Add Meal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DAYS.map(day => (
          <div key={day} className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-bold text-lg text-gray-800 mb-3">{day}</h3>
            
            <div className="space-y-2">
              {getMealsForDay(day).length === 0 ? (
                <p className="text-gray-500 text-sm italic">No meals planned</p>
              ) : (
                getMealsForDay(day).map(mealPlan => (
                  <div
                    key={mealPlan.id}
                    className="bg-white p-3 rounded border-l-4 border-purple-500"
                  >
                    <p className="font-semibold text-gray-800 text-sm">{mealPlan.meal}</p>
                    {mealPlan.notes && (
                      <p className="text-xs text-gray-600 mt-1">{mealPlan.notes}</p>
                    )}
                    <button
                      onClick={() => removeMeal(mealPlan.id)}
                      className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded mt-2 transition"
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
