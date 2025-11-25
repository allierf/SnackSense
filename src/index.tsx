import React, { useState } from "react";
import Pantry from "./components/Pantry";
import Recipes from "./components/Recipes";
import WeeklyPlanner from "./components/WeeklyPlanner";

type Tab = "pantry" | "recipes" | "planner";

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("pantry");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-gray-800 mb-2">SnackSense</h1>
          <p className="text-lg text-gray-600">Track meals, manage your pantry, and plan your week</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab("pantry")}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === "pantry"
                ? "bg-blue-500 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            🗃️ Pantry
          </button>
          <button
            onClick={() => setActiveTab("recipes")}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === "recipes"
                ? "bg-green-500 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            👨‍🍳 Recipes
          </button>
          <button
            onClick={() => setActiveTab("planner")}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === "planner"
                ? "bg-purple-500 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            📅 Weekly Planner
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-xl p-8">
          {activeTab === "pantry" && <Pantry />}
          {activeTab === "recipes" && <Recipes />}
          {activeTab === "planner" && <WeeklyPlanner />}
        </div>
      </div>
    </div>
  );
}