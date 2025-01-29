'use client';

import React, { useState, useEffect } from 'react';

const categoryColors = {
  'Health': 'bg-green-50 border-green-200',
  'Home': 'bg-blue-50 border-blue-200',
  'Finances': 'bg-purple-50 border-purple-200',
  'Manage Possessions': 'bg-yellow-50 border-yellow-200',
  'Personal Growth': 'bg-pink-50 border-pink-200',
  'Relationships': 'bg-red-50 border-red-200',
  'Faith': 'bg-indigo-50 border-indigo-200'
};

const categories = [
  'Health',
  'Home',
  'Finances',
  'Manage Possessions',
  'Personal Growth',
  'Relationships',
  'Faith'
];

function getWeekDates() {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(monday.getDate() - monday.getDay() + 1);
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  return { start: monday, end: sunday };
}

function getWeekKey(date: Date) {
  const year = date.getFullYear();
  const week = Math.floor((date.getTime() - new Date(year, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
  return `${year}-week${week}`;
}

export default function Home() {
  const [currentWeek, setCurrentWeek] = useState(getWeekDates());
  const [goals, setGoals] = useState(() => {
    if (typeof window !== 'undefined') {
      const weekKey = getWeekKey(currentWeek.start);
      const saved = localStorage.getItem(weekKey);
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

  // Save current week's goals to localStorage
  useEffect(() => {
    const weekKey = getWeekKey(currentWeek.start);
    localStorage.setItem(weekKey, JSON.stringify(goals));
  }, [goals, currentWeek]);

  const handleWeekChange = (direction: 'prev' | 'next') => {
    setCurrentWeek(prev => {
      const newStart = new Date(prev.start);
      const newEnd = new Date(prev.end);
      const days = direction === 'next' ? 7 : -7;
      newStart.setDate(newStart.getDate() + days);
      newEnd.setDate(newEnd.getDate() + days);
      
      // When changing weeks, load that week's goals or create new ones
      const newWeekKey = getWeekKey(newStart);
      const savedGoals = localStorage.getItem(newWeekKey);
      
      if (savedGoals) {
        setGoals(JSON.parse(savedGoals));
      } else {
        // If there are goals from previous week, carry over incomplete ones
        const prevWeekKey = getWeekKey(prev.start);
        const prevGoals = localStorage.getItem(prevWeekKey);
        
        if (direction === 'next' && prevGoals) {
          const previousGoals = JSON.parse(prevGoals);
          const newGoals = Object.fromEntries(
            categories.map(category => [
              category,
              previousGoals[category]
                .filter((goal: any) => !goal.completed)
                .concat(Array(5).fill({ text: '', completed: false }))
                .slice(0, 5)
            ])
          );
          setGoals(newGoals);
        } else {
          // For previous weeks or if no previous goals, start fresh
          setGoals(Object.fromEntries(
            categories.map(category => [
              category,
              Array(5).fill({ text: '', completed: false })
            ])
          ));
        }
      }
      
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
      [category]: prevGoals[category].map((goal: any, i: number) => 
        i === index ? { ...goal, text: value } : goal
      )
    }));
  };

  const toggleComplete = (category: string, index: number) => {
    setGoals(prevGoals => ({
      ...prevGoals,
      [category]: prevGoals[category].map((goal: any, i: number) => 
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
              {goals[category].map((goal: any, index: number) => (
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