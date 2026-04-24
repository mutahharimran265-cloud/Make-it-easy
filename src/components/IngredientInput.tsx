import React, { useState, useRef } from 'react';
import { Plus, X, Camera, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeIngredientsFromImage } from '../services/geminiService';

interface Props {
  ingredients: string[];
  preferences: string[];
  onAdd: (ingredient: string) => void;
  onRemove: (index: number) => void;
  onBulkAdd: (items: string[]) => void;
  onTogglePreference: (pref: string) => void;
}

const AVAILABLE_PREFERENCES = ["Vegan", "Vegetarian", "High Protein", "Low Carb", "Gluten-Free", "Quick (< 20m)"];

export default function IngredientInput({ ingredients, preferences, onAdd, onRemove, onBulkAdd, onTogglePreference }: Props) {
  const [inputValue, setInputValue] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onAdd(inputValue.trim());
      setInputValue('');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalyzing(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      const discovered = await analyzeIngredientsFromImage(base64);
      onBulkAdd(discovered);
      setAnalyzing(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full space-y-8">
      <div className="flex flex-col gap-4">
        <form onSubmit={handleSubmit} className="relative group">
          <input
            id="ingredient-input"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type ingredient + Enter..."
            className="input-chef shadow-sm group-focus-within:shadow-lg transition-all"
          />
        </form>

        <div className="flex items-center gap-4">
          <div className="flex-grow h-px bg-gray-200" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Smart Scan</span>
          <div className="flex-grow h-px bg-gray-200" />
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={analyzing}
          className="w-full flex items-center justify-center gap-3 py-3 border border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all text-gray-600 shadow-sm bg-white"
          id="upload-ingredients-btn"
        >
          {analyzing ? (
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          ) : (
            <Camera className="w-5 h-5 text-gray-400" />
          )}
          <span className="font-medium text-sm">Scan Ingredients w/ Camera</span>
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleImageUpload} 
          accept="image/*" 
          className="hidden" 
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <AnimatePresence mode="popLayout">
          {ingredients.map((ingredient, index) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              key={`${ingredient}-${index}`}
              className="px-5 py-3 bg-white rounded-2xl border border-border flex items-center gap-3 group hover:border-honey transition-all shadow-sm"
              id={`ingredient-tag-${index}`}
            >
              <span className="font-medium text-sm text-ink">{ingredient}</span>
              <button
                onClick={() => onRemove(index)}
                className="text-gray-300 group-hover:text-tomato transition-colors p-1"
                id={`remove-ingredient-${index}`}
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="space-y-3 pt-4 border-t border-gray-100">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Dietary Choices</span>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_PREFERENCES.map(pref => {
            const isActive = preferences.includes(pref);
            return (
              <button
                key={pref}
                onClick={() => onTogglePreference(pref)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${isActive ? 'bg-ink text-white border-transparent' : 'bg-white border border-border text-gray-600 hover:border-gray-300'}`}
              >
                {pref}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

