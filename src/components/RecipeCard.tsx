import React, { useEffect, useState } from 'react';
import { Clock, ChefHat, Volume2, ChevronRight, Flame } from 'lucide-react';
import { Recipe, generateRecipeImage } from '../services/geminiService';
import { motion } from 'motion/react';

interface Props {
  recipe: Recipe;
  index: number;
}

export default function RecipeCard({ recipe, index }: Props) {
  const [imageUrl, setImageUrl] = useState<string | undefined>(recipe.imageUrl);
  const [loadingImage, setLoadingImage] = useState(!recipe.imageUrl);

  useEffect(() => {
    if (!recipe.imageUrl) {
      const fetchImage = async () => {
        const url = await generateRecipeImage(recipe.name);
        setImageUrl(url);
        setLoadingImage(false);
      };
      fetchImage();
    }
  }, [recipe.name, recipe.imageUrl]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="recipe-card group cursor-pointer h-full flex flex-col"
      id={`recipe-card-${index}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-border">
        {loadingImage ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-[3px] border-border border-t-ink rounded-full animate-spin" />
          </div>
        ) : (
          <img
            src={imageUrl || `https://image.pollinations.ai/prompt/${encodeURIComponent(recipe.name + ' delicious food plating photography')}?width=800&height=600&nologo=true`}
            alt={recipe.name}
            className="w-full h-full object-cover group-hover:scale-[1.03] opacity-90 group-hover:opacity-100 transition-all duration-700"
            referrerPolicy="no-referrer"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute top-4 left-4 flex gap-2">
          <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-widest uppercase text-ink flex items-center gap-1.5 shadow-sm border border-white/50">
            <Clock className="w-3 h-3 text-ink/50" />
            {recipe.cookingTime}
          </div>
          {recipe.calories && (
            <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-widest uppercase text-ink flex items-center gap-1.5 shadow-sm border border-white/50">
              <Flame className="w-3 h-3 text-orange-500" />
              {recipe.calories} kcal
            </div>
          )}
        </div>
      </div>

      <div className="p-8 flex flex-col flex-grow space-y-5">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <div className="chef-badge w-fit">Authentic</div>
            {recipe.tags?.slice(0, 2).map((tag, i) => (
              <div key={i} className="bg-vanilla text-gray-500 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-[0.1em] border border-border">
                {tag}
              </div>
            ))}
          </div>
          <h3 className="font-serif text-2xl font-light leading-[1.1] group-hover:text-tomato transition-colors text-ink">
            {recipe.name}
          </h3>
        </div>

        <p className="text-[15px] text-gray-500 leading-relaxed line-clamp-3 flex-grow font-medium">
          {recipe.description}
        </p>

        {recipe.missingIngredients?.length > 0 && (
          <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-orange-800 bg-orange-50 p-2.5 rounded-lg border border-orange-100">
            Cart: {recipe.missingIngredients.slice(0, 2).join(', ')}
            {recipe.missingIngredients.length > 2 && '...'}
          </div>
        )}

        <div className="mt-auto pt-6 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {recipe.ingredients.slice(0, 3).map((ing, i) => (
                <div 
                  key={i} 
                  className="w-8 h-8 rounded-full bg-vanilla border-2 border-white flex items-center justify-center text-[10px] font-bold text-ink shadow-[0_4px_10px_rgba(0,0,0,0.05)]"
                  title={ing.item}
                >
                  {ing.item[0].toUpperCase()}
                </div>
              ))}
              {recipe.ingredients.length > 3 && (
                <div className="w-8 h-8 rounded-full bg-white border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-400 shadow-[0_4px_10px_rgba(0,0,0,0.05)]">
                  +{recipe.ingredients.length - 3}
                </div>
              )}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400 ml-2">Ingredients</span>
          </div>
          <div className="flex items-center gap-1.5 text-tomato font-bold text-[10px] uppercase tracking-[0.2em] group-hover:translate-x-1 transition-transform">
            View Details
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
