import React from "react";


// Basic Starter App Component
export default function App() {
  return (
	<div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center">
	  <h1 className="text-4xl font-bold mb-6">Pantry & Recipes App</h1>
	  <p className="text-lg text-gray-700 max-w-xl text-center">
		Welcome! This is your starting point. You can begin adding components
		for your pantry, recipes, grocery list, and weekly planner.
	  </p>
	  <div className="mt-8 p-6 bg-white rounded-2xl shadow-md w-full max-w-md">
		<h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
		<ul className="list-disc pl-5 text-gray-700 space-y-2">
		  <li>Create components in the <code>src</code> folder.</li>
		  <li>Use Tailwind classes for styling.</li>
		  <li>Start by building the Pantry component.</li>
		</ul>
	  </div>
	</div>
  );
}