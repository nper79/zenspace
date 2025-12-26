
import React, { useState } from 'react';
import { editImageWithGemini } from '../services/geminiService';

interface ImageEditorProps {
  imageData: string;
  onImageUpdated: (newData: string) => void;
  label: string;
}

export const ImageEditor: React.FC<ImageEditorProps> = ({ imageData, onImageUpdated, label }) => {
  const [prompt, setPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEdit = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const result = await editImageWithGemini(imageData, prompt);
      onImageUpdated(result);
      setPrompt('');
      setIsEditing(false);
    } catch (error) {
      console.error("Editing failed:", error);
      alert("Virtual simulation failed. Please try a different instruction.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-[2rem] border border-stone-100 shadow-sm group">
      <div className="relative overflow-hidden rounded-[1.5rem] mb-4">
        <img 
          src={imageData} 
          alt={label} 
          className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-105" 
        />
        <div className="absolute top-4 left-4 bg-stone-900/40 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10">
          {label}
        </div>
      </div>

      <div className="px-2">
        {!isEditing ? (
          <button 
            onClick={() => setIsEditing(true)}
            className="w-full py-3.5 px-4 text-sm font-bold bg-stone-50 border border-stone-200 rounded-2xl hover:bg-white hover:border-emerald-500 hover:text-emerald-600 transition-all flex items-center justify-center gap-3 text-stone-600"
          >
            <i className="fas fa-wand-magic-sparkles text-emerald-500"></i>
            Simulate Improvement
          </button>
        ) : (
          <div className="space-y-3 animate-in fade-in zoom-in-95 duration-300">
            <textarea
              className="w-full p-4 text-sm border border-stone-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none resize-none bg-stone-50/50"
              placeholder="e.g. 'Add a zen plant in the corner', 'Repaint this wall in soft sage green'..."
              rows={2}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <div className="flex gap-3">
              <button
                onClick={handleEdit}
                disabled={loading}
                className="flex-[2] py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 disabled:opacity-50 shadow-lg shadow-emerald-100"
              >
                {loading ? <i className="fas fa-spinner fa-spin"></i> : 'Run Simulation'}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                disabled={loading}
                className="flex-1 py-3 bg-stone-100 text-stone-600 rounded-xl text-sm font-bold hover:bg-stone-200"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
