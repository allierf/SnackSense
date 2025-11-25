import React, { useState, useEffect } from 'react';

interface PantryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  expiryDate?: string;
}

const STORAGE_KEY = 'snacksense_pantry';

export default function Pantry() {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('piece');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load items from localStorage on mount
  useEffect(() => {
    console.log('Loading pantry items from localStorage...');
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsedItems = JSON.parse(stored);
        setItems(parsedItems);
        console.log('✅ Loaded pantry items from localStorage:', parsedItems);
      } catch (e) {
        console.error('❌ Failed to load pantry items:', e);
      }
    } else {
      console.log('ℹ️ No pantry items found in localStorage');
    }
    setIsLoaded(true);
  }, []);

  // Save items to localStorage whenever they change (but only after initial load)
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      console.log('✅ Saved pantry items to localStorage:', items);
    }
  }, [items, isLoaded]);

  const addItem = () => {
    if (!itemName.trim()) return;

    const newItem: PantryItem = {
      id: Date.now().toString(),
      name: itemName,
      quantity: Number(quantity),
      unit,
    };

    setItems([...items, newItem]);
    setItemName('');
    setQuantity('1');
    setUnit('piece');
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Pantry</h2>
      
      <div className="space-y-4 mb-6">
        <input
          type="text"
          placeholder="Item name"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        <div className="grid grid-cols-3 gap-3">
          <input
            type="number"
            placeholder="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            min="1"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="piece">piece</option>
            <option value="kg">kg</option>
            <option value="g">g</option>
            <option value="liter">liter</option>
            <option value="ml">ml</option>
            <option value="cup">cup</option>
          </select>
          <button
            onClick={addItem}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            Add
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No items in pantry yet</p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <div>
                <p className="font-semibold text-gray-800">{item.name}</p>
                <p className="text-sm text-gray-600">
                  {item.quantity} {item.unit}
                </p>
              </div>
              <button
                onClick={() => removeItem(item.id)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg transition"
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
