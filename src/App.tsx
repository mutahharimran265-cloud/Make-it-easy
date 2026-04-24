import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChefHat, Loader2, RefreshCw, ChefHat as ChefIcon, ChevronRight, Flame, Bookmark, X } from 'lucide-react';
import IngredientInput from './components/IngredientInput';
import RecipeCard from './components/RecipeCard';
import { Recipe, generateRecipes } from './services/geminiService';

export default function App() {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [preferences, setPreferences] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>(() => {
    try {
      const item = window.localStorage.getItem('savedRecipes');
      return item ? JSON.parse(item) : [];
    } catch (error) {
      return [];
    }
  });

  const toggleSaveRecipe = (recipe: Recipe) => {
    let updated;
    if (savedRecipes.some(r => r.name === recipe.name)) {
      updated = savedRecipes.filter(r => r.name !== recipe.name);
    } else {
      updated = [...savedRecipes, recipe];
    }
    setSavedRecipes(updated);
    window.localStorage.setItem('savedRecipes', JSON.stringify(updated));
  };

  const addIngredient = (item: string) => {
    if (!ingredients.includes(item)) {
      setIngredients([...ingredients, item]);
    }
  };

  const bulkAddIngredients = (items: string[]) => {
    const newItems = items.filter(item => !ingredients.includes(item));
    setIngredients([...ingredients, ...newItems]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const togglePreference = (pref: string) => {
    setPreferences(prev => prev.includes(pref) ? prev.filter(p => p !== pref) : [...prev, pref]);
  };

  const handleGenerate = async () => {
    if (ingredients.length === 0) return;
    setLoading(true);
    const result = await generateRecipes(ingredients, preferences);
    setRecipes(result);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-vanilla text-ink flex flex-col font-sans">
      <nav className="flex justify-between items-center px-6 md:px-12 py-8 bg-vanilla/90 backdrop-blur-xl sticky top-0 z-40 border-b border-border/50">
        <div className="flex items-center gap-4">
          <div className="bg-ink p-2.5 rounded-xl shadow-md">
            <ChefIcon className="w-5 h-5 text-vanilla" />
          </div>
          <div className="text-xl font-serif font-medium tracking-wide text-ink uppercase">Digital Chef</div>
        </div>
        <div className="hidden lg:flex gap-10 text-xs uppercase tracking-[0.2em] font-bold opacity-80">
          <span className="hover:text-honey cursor-pointer transition-colors text-ink">Main Menu</span>
          <span 
            className="hover:text-honey cursor-pointer transition-colors flex items-center gap-2"
            onClick={() => {
              if (savedRecipes.length > 0) setRecipes(savedRecipes);
            }}
          >
            <Bookmark className="w-3.5 h-3.5" /> Saved ({savedRecipes.length})
          </span>
        </div>
        <div className="flex items-center gap-5">
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white rounded-lg text-[10px] font-bold uppercase tracking-[0.15em] text-gray-600 shadow-sm border border-border">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
            Easy English
          </div>
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-honey bg-honey/10 px-5 py-2.5 rounded-xl border border-honey/20">
            Free Access
          </div>
        </div>
      </nav>

      <div className="flex flex-col lg:flex-row flex-1 px-4 md:px-6 lg:px-0">
        {/* Sidebar */}
        <aside className="lg:w-[450px] xl:w-[500px] p-6 md:p-12 lg:bg-white flex flex-col lg:shadow-[20px_0_40px_rgba(0,0,0,0.02)] z-10 lg:pl-16">
          <div className="mb-10 mt-4">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-8 h-px bg-honey" />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-honey">Your Pantry</span>
            </div>
            <h2 className="font-serif text-4xl md:text-5xl font-light mb-5 leading-[1.1] text-ink">Create your <br/><span className="italic text-tomato font-serif font-normal">perfect meal.</span></h2>
            <p className="text-gray-500 text-[15px] leading-relaxed max-w-sm font-medium">Enter the ingredients you have. Our expert chef will create an amazing menu for you in simple English.</p>
          </div>

          <div className="space-y-10">
            <IngredientInput 
              ingredients={ingredients} 
              preferences={preferences}
              onAdd={addIngredient} 
              onRemove={removeIngredient} 
              onBulkAdd={bulkAddIngredients}
              onTogglePreference={togglePreference}
            />
            
            <button
              onClick={handleGenerate}
              disabled={loading || ingredients.length === 0}
              className={`btn-chef-primary w-full flex items-center justify-center gap-3 group ${ingredients.length > 0 ? '' : 'opacity-50'}`}
              id="generate-recipes-btn"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="tracking-wide">Creating Menu...</span>
                </>
              ) : (
                <>
                  <ChefIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="tracking-wide uppercase text-sm">Get Recipes</span>
                </>
              )}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-12 lg:p-20 relative overflow-y-auto bg-vanilla">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-8 animate-in fade-in duration-700">
              <div className="relative">
                <div className="absolute inset-0 bg-honey/20 blur-[50px] rounded-full animate-pulse" />
                <div className="w-32 h-32 border-[3px] border-border border-t-tomato rounded-full animate-spin relative z-10" />
                <ChefIcon className="w-8 h-8 text-ink absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20" />
              </div>
              <div className="text-center space-y-4">
                <p className="font-serif italic text-4xl font-light text-ink">Making your recipes</p>
                <p className="text-gray-400 font-medium tracking-wide uppercase text-xs">Finding the best matches</p>
              </div>
            </div>
          ) : recipes.length > 0 ? (
            <div className="space-y-24 max-w-[1400px] mx-auto">
              <div className="relative">
                <div className="flex items-center gap-3 mb-10">
                  <span className="bg-ink text-vanilla px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.25em] shadow-sm">Top Choice</span>
                </div>
                <div className="max-w-5xl">
                  <h1 className="font-serif text-5xl md:text-6xl lg:text-[80px] leading-[0.95] font-light tracking-tight mb-12 pr-12 text-ink">
                    {recipes[0].name.split(' ').map((word, i) => (
                      <React.Fragment key={i}>
                        <span className={i === 1 || i === 3 ? "text-tomato italic font-serif font-light" : "text-ink"}>{word}</span>
                        {' '}
                      </React.Fragment>
                    ))}
                  </h1>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-10 border-b border-border/60">
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Prep Time</p>
                      <p className="font-semibold text-xl text-ink">{recipes[0].cookingTime}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Skill Level</p>
                      <p className="font-semibold text-xl text-ink">{recipes[0].difficulty}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Nutrition</p>
                      <p className="font-semibold text-xl text-ink flex items-center gap-2"><Flame className="w-4 h-4 text-orange-500" /> {recipes[0].calories} kcal</p>
                    </div>
                    <div className="flex items-end">
                      <button 
                        onClick={() => setActiveRecipe(recipes[0])}
                        className="text-tomato font-bold uppercase tracking-[0.15em] text-xs flex items-center gap-2 hover:gap-3 transition-all pb-1 border-b-2 border-transparent hover:border-tomato"
                      >
                        View Details <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-12">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400">More Recipes</h3>
                  <div className="h-px bg-border flex-grow mx-8" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 md:gap-10">
                  {recipes.slice(1).map((recipe, index) => (
                    <div key={recipe.name} onClick={() => setActiveRecipe(recipe)} className="h-full group">
                      <RecipeCard recipe={recipe} index={index + 1} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-12 opacity-80 select-none">
              <div className="w-48 h-48 rounded-full border border-dashed border-ink/20 flex items-center justify-center relative shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] bg-white/50 backdrop-blur-sm group hover:border-ink/40 transition-colors">
                <ChefIcon className="w-16 h-16 text-ink/40 group-hover:text-ink/70 transition-colors" />
                <div className="absolute inset-0 rounded-full border border-ink/5 animate-[spin_10s_linear_infinite]" />
              </div>
              <p className="font-serif italic text-4xl md:text-5xl font-light tracking-tight max-w-lg text-ink/70">Waiting for your ingredients...</p>
            </div>
          )}
        </main>
      </div>

      <footer className="bg-vanilla border-t border-border/50 text-gray-500 py-8 px-6 md:px-16 flex flex-col md:flex-row items-center justify-between text-xs font-semibold">
        <div className="flex items-center gap-5 mb-4 md:mb-0">
          <span className="text-ink font-bold uppercase tracking-widest text-[10px]">Great Food</span>
          <span className="w-6 h-px bg-gray-300" />
          <span className="uppercase tracking-widest text-[10px]">Top Quality</span>
        </div>
        <div className="flex items-center gap-8 uppercase tracking-widest text-[10px]">
          <span className="hover:text-ink cursor-pointer transition-colors">Terms</span>
          <span className="hover:text-ink cursor-pointer transition-colors">Privacy</span>
          <span className="text-gray-400 font-bold">© 2026</span>
        </div>
      </footer>
      <AnimatePresence>
        {activeRecipe && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-ink/70 backdrop-blur-md flex items-center justify-center p-4 md:p-8 lg:p-12 overflow-y-auto"
            onClick={() => setActiveRecipe(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-vanilla w-full max-w-6xl min-h-[90vh] lg:h-[85vh] rounded-[32px] overflow-hidden flex flex-col xl:flex-row shadow-[0_50px_100px_rgba(0,0,0,0.4)] relative my-auto border border-white/10"
            >
              <button 
                onClick={() => setActiveRecipe(null)}
                className="absolute top-6 right-6 z-20 bg-white/90 backdrop-blur border border-border text-ink p-3 rounded-full hover:bg-white hover:scale-110 active:scale-95 transition-all shadow-md flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>

              <button 
                onClick={() => toggleSaveRecipe(activeRecipe)}
                className={`absolute top-6 right-20 z-20 p-3 rounded-full backdrop-blur-md transition-all shadow-md flex items-center justify-center border hover:scale-110 active:scale-95 ${savedRecipes.some(r => r.name === activeRecipe.name) ? 'bg-tomato text-white border-tomato/20 shadow-tomato/30' : 'bg-white/90 border-border text-ink hover:bg-white'}`}
              >
                <Bookmark className="w-5 h-5" fill={savedRecipes.some(r => r.name === activeRecipe.name) ? 'currentColor' : 'none'} />
              </button>

              <div className="xl:w-2/5 h-80 xl:h-auto overflow-hidden relative">
                <img 
                  src={activeRecipe.imageUrl || `https://image.pollinations.ai/prompt/${encodeURIComponent(activeRecipe.name + ' delicious food plating photography')}?width=800&height=800&nologo=true`} 
                  alt={activeRecipe.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="xl:w-3/5 p-8 md:p-12 xl:p-16 overflow-y-auto bg-vanilla space-y-12">
                <div className="space-y-5">
                  <div className="flex items-center gap-4">
                    <span className="w-10 h-px bg-tomato" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-tomato">Recipe Details</span>
                  </div>
                  <div className="flex flex-col gap-4 mt-2">
                    <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl tracking-tight leading-[1.05] font-light text-ink">
                      {activeRecipe.name}
                    </h2>
                  </div>
                  
                  {activeRecipe.macros && (
                    <div className="flex flex-wrap gap-6 pt-6">
                      <div className="flex flex-col gap-1"><span className="text-gray-400 text-[10px] uppercase tracking-[0.2em] font-bold">Calories</span><span className="text-base font-semibold">{activeRecipe.calories}</span></div>
                      <div className="w-px bg-border my-1" />
                      <div className="flex flex-col gap-1"><span className="text-gray-400 text-[10px] uppercase tracking-[0.2em] font-bold">Protein</span><span className="text-base font-semibold">{activeRecipe.macros.protein}g</span></div>
                      <div className="w-px bg-border my-1" />
                      <div className="flex flex-col gap-1"><span className="text-gray-400 text-[10px] uppercase tracking-[0.2em] font-bold">Carbs</span><span className="text-base font-semibold">{activeRecipe.macros.carbs}g</span></div>
                      <div className="w-px bg-border my-1" />
                      <div className="flex flex-col gap-1"><span className="text-gray-400 text-[10px] uppercase tracking-[0.2em] font-bold">Fat</span><span className="text-base font-semibold">{activeRecipe.macros.fat}g</span></div>
                    </div>
                  )}

                  {activeRecipe.missingIngredients && activeRecipe.missingIngredients.length > 0 && (
                    <div className="bg-orange-50 border border-orange-100 p-5 rounded-2xl mt-6">
                      <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-orange-800 mb-2">You need to buy</p>
                      <p className="text-sm text-orange-900 font-medium leading-relaxed">{activeRecipe.missingIngredients.join(", ")}</p>
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-12 pt-10 border-t border-border/50">
                  <div className="space-y-8">
                    <div className="space-y-1">
                      <h4 className="font-bold uppercase tracking-[0.2em] text-[11px] text-gray-500">Ingredients</h4>
                    </div>
                    <ul className="space-y-4">
                      {activeRecipe.ingredients.map((ing, i) => (
                        <li key={i} className="flex items-center justify-between pb-3 border-b border-border/40 text-[15px]">
                          <span className="text-ink font-semibold">{ing.item}</span>
                          <span className="text-gray-500 italic text-sm">{ing.amount}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-8">
                    <div className="space-y-1">
                      <h4 className="font-bold uppercase tracking-[0.2em] text-[11px] text-gray-500">Instructions</h4>
                    </div>
                    <div className="space-y-8">
                      {activeRecipe.instructions.map((step, i) => (
                        <div key={i} className="flex gap-5">
                          <span className="font-serif italic text-gray-400 text-2xl shrink-0 font-light">{i + 1}.</span>
                          <p className="text-ink text-[15px] leading-relaxed border-l-2 border-border/50 pl-5 py-0.5">
                            {step}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-10">
                  <button 
                    onClick={() => setActiveRecipe(null)}
                    className="btn-chef-secondary w-full py-5 text-sm uppercase tracking-[0.2em] font-bold"
                  >
                    Close Recipe
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

