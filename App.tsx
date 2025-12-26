
import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { AppStep, WallImage, FengShuiReport } from './types';
import { analyzeFengShui, generateAerialMap } from './services/geminiService';
import { ImageEditor } from './components/ImageEditor';

const WALL_LABELS = ['North Wall', 'South Wall'];

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.UPLOAD);
  const [images, setImages] = useState<WallImage[]>([]);
  const [report, setReport] = useState<FengShuiReport | null>(null);
  const [aerialMapUrl, setAerialMapUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setImages(prev => {
        const newImages = [...prev];
        newImages[index] = { id: index, data: result, name: file.name };
        return newImages;
      });
    };
    reader.readAsDataURL(file);
  };

  const handleKeySelection = async () => {
    await (window as any).aistudio.openSelectKey();
    runAnalysis();
  };

  const startAnalysis = async () => {
    if (images.length < 2 || images.some(img => !img)) {
      alert("Please upload photos of both North and South walls to proceed.");
      return;
    }

    const hasKey = await (window as any).aistudio.hasSelectedApiKey();
    if (!hasKey) {
      setStep(AppStep.KEY_REQUIRED);
      return;
    }

    runAnalysis();
  };

  const runAnalysis = async () => {
    setStep(AppStep.ANALYZING);
    setIsAnalyzing(true);
    setLoadingStatus('Initializing Nano Banana Pro Engine...');
    
    try {
      setLoadingStatus('Synthesizing energy axis between walls...');
      const filteredImages = images.filter(img => img).map(img => img.data);
      const data = await analyzeFengShui(filteredImages);
      setReport(data);
      
      setLoadingStatus('Generating high-precision architectural 3D render...');
      const mapUrl = await generateAerialMap(filteredImages, data.visualMapPrompt);
      setAerialMapUrl(mapUrl);
      
      setStep(AppStep.REPORT);
    } catch (error: any) {
      console.error("Analysis failed:", error);
      if (error?.message?.includes("Requested entity was not found")) {
        setStep(AppStep.KEY_REQUIRED);
      } else {
        alert("Analysis failed. Please check your API key and try again.");
        setStep(AppStep.UPLOAD);
      }
    } finally {
      setIsAnalyzing(false);
      setLoadingStatus('');
    }
  };

  const reset = () => {
    setImages([]);
    setReport(null);
    setAerialMapUrl(null);
    setStep(AppStep.UPLOAD);
  };

  const updateImageData = (index: number, newData: string) => {
    setImages(prev => {
      const next = [...prev];
      next[index] = { ...next[index], data: newData };
      return next;
    });
  };

  return (
    <Layout>
      {step === AppStep.UPLOAD && (
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <div className="inline-block bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full mb-2">
              Architectural Engine v3.0
            </div>
            <h1 className="serif text-4xl md:text-5xl text-stone-800">ZenSpace <span className="text-emerald-600">Nano Pro</span></h1>
            <p className="text-stone-500 text-lg max-w-xl mx-auto">
              Professional-grade Feng Shui analysis using North and South views for precise orientation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {WALL_LABELS.map((label, idx) => (
              <div key={idx} className="relative group overflow-hidden bg-white border-2 border-dashed border-stone-200 rounded-3xl aspect-[4/3] flex flex-col items-center justify-center p-8 hover:border-emerald-300 transition-all hover:shadow-xl">
                {images[idx] ? (
                  <>
                    <img src={images[idx].data} alt={label} className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <label className="cursor-pointer bg-white px-6 py-2 rounded-full text-sm font-semibold text-stone-700 shadow-xl transform transition-transform group-hover:scale-105">
                        Replace Photo
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, idx)} />
                      </label>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-4 transition-transform group-hover:scale-110">
                      <i className="fas fa-camera text-3xl"></i>
                    </div>
                    <span className="font-bold text-stone-700 text-xl">{label}</span>
                    <p className="text-sm text-stone-400 mt-2 text-center">Capture wall from center of the room</p>
                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileUpload(e, idx)} />
                  </>
                )}
                {images[idx] && (
                   <div className="absolute top-4 left-4 bg-emerald-600 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-md">
                     {label}
                   </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-center pt-4">
            <button
              onClick={startAnalysis}
              disabled={images.filter(Boolean).length < 2}
              className="px-14 py-5 bg-stone-900 hover:bg-black text-white rounded-full font-bold text-xl shadow-2xl transition-all disabled:opacity-30 transform hover:-translate-y-1 active:scale-95"
            >
              Analyze North & South
            </button>
          </div>
        </div>
      )}

      {step === AppStep.KEY_REQUIRED && (
        <div className="max-w-md mx-auto text-center space-y-8 py-20 bg-white p-12 rounded-[3rem] shadow-sm border border-stone-100">
          <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto text-4xl">
            <i className="fas fa-microchip"></i>
          </div>
          <div className="space-y-4">
            <h2 className="serif text-3xl text-stone-800">Pro Credentials Needed</h2>
            <p className="text-stone-500 text-base leading-relaxed">
              Nano Banana Pro (Gemini 3 Pro Image) requires architectural-level processing power only available via Pro API Keys.
            </p>
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="inline-block text-emerald-600 text-sm font-bold underline">
              Billing Docs
            </a>
          </div>
          <button
            onClick={handleKeySelection}
            className="w-full py-5 bg-stone-900 text-white rounded-2xl font-bold text-lg hover:bg-black transition-all shadow-xl"
          >
            Authenticate & Render
          </button>
        </div>
      )}

      {step === AppStep.ANALYZING && (
        <div className="flex flex-col items-center justify-center py-24 space-y-10">
          <div className="relative">
            <div className="w-48 h-48 border-[12px] border-stone-100 rounded-full"></div>
            <div className="absolute inset-0 w-48 h-48 border-t-[12px] border-emerald-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center text-emerald-600 text-5xl">
               <i className="fas fa-yin-yang animate-pulse"></i>
            </div>
          </div>
          <div className="text-center space-y-4">
            <h2 className="serif text-4xl text-stone-800">Analyzing Energy Flow</h2>
            <p className="text-stone-500 animate-pulse font-medium text-xl">{loadingStatus}</p>
            <p className="text-xs text-stone-400 uppercase tracking-widest font-black">Executing Nano Banana Pro Reconstruction</p>
          </div>
        </div>
      )}

      {step === AppStep.REPORT && report && (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          {/* Header & Scores */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 bg-white p-12 rounded-[3rem] shadow-sm border border-stone-100">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Spatial Report</span>
              </div>
              <h2 className="serif text-5xl text-stone-800">The Zen Axis</h2>
              <p className="text-stone-500 text-xl font-light">Millimeter-precise analysis from North-South synthesis.</p>
            </div>
            
            <div className="flex gap-12 items-center">
              <div className="text-center">
                <div className="text-[10px] font-black text-stone-300 uppercase tracking-[0.3em] mb-3">Harmony Score</div>
                <div className="text-5xl font-bold text-stone-800">{report.overallScore}<span className="text-lg text-stone-200">/100</span></div>
              </div>
              
              <div className="h-20 w-px bg-stone-100"></div>

              <div className="text-center">
                <div className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] mb-3">Max Potential</div>
                <div className="text-6xl font-black text-emerald-600 flex items-center justify-center gap-3">
                  {report.potentialScore}
                  <i className="fas fa-sparkles text-sm text-yellow-400"></i>
                </div>
              </div>

              <button 
                 onClick={reset}
                 className="w-14 h-14 flex items-center justify-center bg-stone-50 text-stone-400 rounded-full hover:bg-stone-900 hover:text-white transition-all shadow-sm"
               >
                 <i className="fas fa-rotate-right"></i>
               </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-12">
              {/* Aerial Map */}
              <section className="bg-white p-4 rounded-[3rem] shadow-2xl border-4 border-emerald-50 overflow-hidden group">
                <div className="p-10 pb-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <h3 className="font-bold text-3xl text-stone-800 flex items-center gap-4">
                        <i className="fas fa-building-columns text-stone-900"></i>
                        Architectural View
                      </h3>
                      <p className="text-lg text-stone-500">Realistic, top view, aerial reconstruction by Nano Banana Pro.</p>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <span className="px-5 py-2 bg-stone-900 text-white text-[11px] font-black rounded-full uppercase tracking-[0.2em] shadow-xl">Nano Banana Pro</span>
                      <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest flex items-center gap-2">
                         <i className="fas fa-circle text-[6px] text-emerald-500 animate-pulse"></i>
                         Furniture Precision Mode
                      </span>
                    </div>
                  </div>
                </div>
                {aerialMapUrl ? (
                  <div className="relative overflow-hidden rounded-[2.5rem]">
                    <img src={aerialMapUrl} alt="Architectural 3D Render" className="w-full h-auto object-cover transform transition-transform duration-[2000ms] group-hover:scale-[1.03]" />
                  </div>
                ) : (
                  <div className="aspect-square bg-stone-50 flex flex-col items-center justify-center text-stone-400 p-20 text-center">
                    <i className="fas fa-layer-group fa-spin text-5xl mb-8"></i>
                    <p className="text-xl font-medium">Synthesizing North/South data into 3D...</p>
                  </div>
                )}
              </section>

              {/* Detected Issues */}
              <section className="space-y-8">
                <div className="flex items-center justify-between border-b-2 border-stone-100 pb-6">
                  <h3 className="font-bold text-3xl text-stone-800">Structural Imbalances</h3>
                  <span className="px-5 py-2 bg-stone-100 text-stone-600 text-xs font-black rounded-full uppercase tracking-widest">Sha Chi Detected</span>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  {report.issues.map((issue, idx) => (
                    <div key={idx} className="bg-white p-8 rounded-[2.5rem] border-l-[8px] border-l-red-500 shadow-sm flex gap-8 items-start hover:shadow-xl transition-all">
                      <div className={`w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center text-2xl ${
                        issue.severity === 'high' ? 'bg-red-50 text-red-600' : 'bg-stone-50 text-stone-400'
                      }`}>
                        <i className="fas fa-triangle-exclamation"></i>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-4">
                          <h4 className="font-bold text-2xl text-stone-800">{issue.title}</h4>
                          <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-red-100 text-red-600 rounded-full">
                            {issue.severity} priority
                          </span>
                        </div>
                        <p className="text-stone-500 text-lg leading-relaxed">{issue.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <aside className="space-y-10">
              {/* PAID UPSELL */}
              <div className="bg-stone-900 text-white p-12 rounded-[3rem] shadow-2xl relative overflow-hidden group border-b-8 border-emerald-500">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl group-hover:bg-emerald-500/30 transition-all duration-700"></div>
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center text-2xl shadow-2xl shadow-emerald-500/40">
                    <i className="fas fa-bolt"></i>
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-400">Pro Upgrade</span>
                </div>
                <h3 className="font-bold text-4xl mb-6 leading-tight">Spatial Remedy</h3>
                <p className="text-lg text-stone-400 mb-10 leading-relaxed">
                  Unlock the <b>Healing Plan</b> to get exact rotation angles and placement coordinates to achieve {report.potentialScore}% harmony.
                </p>
                <button className="w-full py-6 bg-emerald-500 text-stone-900 rounded-2xl font-black text-xl hover:bg-emerald-400 transition-all shadow-2xl shadow-emerald-500/20 transform hover:-translate-y-1">
                  Get Full Plan (€9)
                </button>
              </div>

              {/* Elemental Distribution */}
              <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-stone-100">
                <h3 className="font-bold text-2xl text-stone-800 mb-8 flex items-center gap-4">
                  <i className="fas fa-atom text-emerald-600"></i>
                  Elemental Profile
                </h3>
                <div className="grid grid-cols-5 gap-4">
                  {Object.entries(report.elementalBalance).map(([element, value]) => (
                    <div key={element} className="flex flex-col items-center">
                      <div className="w-full h-32 bg-stone-50 rounded-2xl relative overflow-hidden group">
                        <div 
                          className={`absolute bottom-0 w-full transition-all duration-1000 ease-out ${
                            element === 'wood' ? 'bg-green-500' :
                            element === 'fire' ? 'bg-red-500' :
                            element === 'earth' ? 'bg-amber-600' :
                            element === 'metal' ? 'bg-slate-400' : 'bg-cyan-500'
                          }`}
                          style={{ height: `${value}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] font-black uppercase mt-4 text-stone-400 tracking-[0.1em]">{element}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strengths */}
              <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-stone-100">
                <h3 className="font-bold text-2xl text-stone-800 mb-8 flex items-center gap-4">
                  <i className="fas fa-shield-heart text-emerald-500"></i>
                  Existing Harmony
                </h3>
                <ul className="space-y-5">
                  {report.positives.map((pos, idx) => (
                    <li key={idx} className="flex gap-5 text-base text-stone-600 leading-relaxed bg-stone-50 p-6 rounded-3xl">
                      <i className="fas fa-circle-check text-emerald-500 mt-1 flex-shrink-0"></i>
                      <span>{pos}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>

          {/* Simulation Section */}
          <div className="pt-24 border-t-2 border-stone-100">
            <div className="text-center space-y-4 mb-16">
              <h3 className="serif text-5xl text-stone-800">Simulation Lab</h3>
              <p className="text-stone-500 text-xl max-w-3xl mx-auto font-light">
                Iterate on your North/South wall alignments virtually.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {images.map((img, idx) => (
                <ImageEditor 
                  key={idx} 
                  imageData={img.data} 
                  label={WALL_LABELS[idx]} 
                  onImageUpdated={(newData) => updateImageData(idx, newData)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
