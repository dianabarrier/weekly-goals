'use client';

import React, { useState, useEffect } from 'react';

interface Goal {
  text: string;
  completed: boolean;
}

type GoalsType = {
  [key: string]: Goal[];
}

const categoryColors = {
  'Health': 'bg-green-50 border-green-200',
  'Home': 'bg-blue-50 border-blue-200',
  'Finances': 'bg-purple-50 border-purple-200',
  'Manage Possessions': 'bg-yellow-50 border-yellow-200',
  'Personal Growth': 'bg-pink-50 border-pink-200',
  'Relationships': 'bg-red-50 border-red-200',
  'Faith': 'bg-indigo-50 border-indigo-200'
} as const;

const categories = [
  'Health',
  'Home',
  'Finances',
  'Manage Possessions',
  'Personal Growth',
  'Relationships',
  'Faith'
] as const;

function getWeekDates() {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(monday.getDate() - monday.getDay() + 1);
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  return { start: monday, end: sunday };
}

export default function Home() {
  const [currentWeek, setCurrentWeek] = useState(getWeekDates());
  const [goals, setGoals] = useState<GoalsType>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('weeklyGoals');
      if (saved) {
        return JSON.parse(saved);
      }
    }
    return Object.fromEntries(
      categories.map(category => [
        category,
        Array(5).fill({ text: '', completed: false })
      ])
    );
  });

  useEffect(() => {
    localStorage.setItem('weeklyGoals', JSON.stringify(goals));
  }, [goals]);

  const handleWeekChange = (direction: 'prev' | 'next') => {
    setCurrentWeek(prev => {
      const newStart = new Date(prev.start);
      const newEnd = new Date(prev.end);
      const days = direction === 'next' ? 7 : -7;
      newStart.setDate(newStart.getDate() + days);
      newEnd.setDate(newEnd.getDate() + days);
      return { start: newStart, end: newEnd };
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleGoalChange = (category: string, index: number, value: string) => {
    setGoals(prevGoals => ({
      ...prevGoals,
      [category]: prevGoals[category].map((goal: Goal, i: number) => 
        i === index ? { ...goal, text: value } : goal
      )
    }));
  };

  const toggleComplete = (category: string, index: number) => {
    setGoals(prevGoals => ({
      ...prevGoals,
      [category]: prevGoals[category].map((goal: Goal, i: number) => 
        i === index ? { ...goal, completed: !goal.completed } : goal
      )
    }));
  };

  return (
    <main className="max-w-4xl mx-auto p-6 bg-slate-50 min-h-screen">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-4">Weekly Goals Tracker</h1>
        
        <div className="inline-flex items-center space-x-4 bg-white p-3 rounded-lg shadow">
          <button 
            onClick={() => handleWeekChange('prev')}
            className="text-slate-600 hover:text-slate-800 px-2"
          >
            ←
          </button>
          
          <span className="font-medium">
            {formatDate(currentWeek.start)} - {formatDate(currentWeek.end)}
          </span>
          
          <button 
            onClick={() => handleWeekChange('next')}
            className="text-slate-600 hover:text-slate-800 px-2"
          >
            →
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map(category => (
          <div key={category} className={`p-4 rounded-lg shadow-lg border-2 ${categoryColors[category]}`}>
            <h2 className="text-xl font-semibold mb-4 text-slate-700">{category}</h2>
            <div className="space-y-3">
              {goals[category].map((goal: Goal, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={goal.completed}
                    onChange={() => toggleComplete(category, index)}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={goal.text}
                    onChange={(e) => handleGoalChange(category, index, e.target.value)}
                    placeholder="Enter your goal..."
                    className={`flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      goal.completed ? 'line-through text-gray-500 bg-gray-50' : 'bg-white'
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
