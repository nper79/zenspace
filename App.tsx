
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
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <div className="inline-block bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-[0.2em] px-5 py-2 rounded-full mb-2">
              Architectural Engine v3.0
            </div>
            <h1 className="serif text-5xl md:text-7xl text-stone-800 tracking-tight">ZenSpace <span className="text-emerald-600">Nano Pro</span></h1>
            <p className="text-stone-500 text-xl max-w-2xl mx-auto font-light">
              Professional-grade Feng Shui analysis using North and South views for high-fidelity spatial reconstruction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
            {WALL_LABELS.map((label, idx) => (
              <div key={idx} className="relative group overflow-hidden bg-white border-2 border-dashed border-stone-200 rounded-[3rem] aspect-[4/3] flex flex-col items-center justify-center p-12 hover:border-emerald-300 transition-all hover:shadow-2xl">
                {images[idx] ? (
                  <>
                    <img src={images[idx].data} alt={label} className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                      <label className="cursor-pointer bg-white px-8 py-3 rounded-full text-sm font-bold text-stone-700 shadow-2xl transform transition-transform group-hover:scale-105 active:scale-95">
                        Replace Photo
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, idx)} />
                      </label>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-6 transition-transform group-hover:scale-110">
                      <i className="fas fa-camera text-4xl"></i>
                    </div>
                    <span className="font-bold text-stone-700 text-2xl tracking-tight">{label}</span>
                    <p className="text-sm text-stone-400 mt-2 text-center max-w-[200px]">Capture wall from the very center of the room</p>
                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileUpload(e, idx)} />
                  </>
                )}
                {images[idx] && (
                   <div className="absolute top-6 left-6 bg-emerald-600 text-white px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest shadow-lg">
                     {label}
                   </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-center pt-8">
            <button
              onClick={startAnalysis}
              disabled={images.filter(Boolean).length < 2}
              className="px-20 py-6 bg-stone-900 hover:bg-black text-white rounded-full font-bold text-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] transition-all disabled:opacity-30 transform hover:-translate-y-1 active:scale-95"
            >
              Analyze North & South
            </button>
          </div>
        </div>
      )}

      {step === AppStep.KEY_REQUIRED && (
        <div className="max-w-xl mx-auto text-center space-y-10 py-24 bg-white p-16 rounded-[4rem] shadow-sm border border-stone-100">
          <div className="w-28 h-28 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto text-5xl">
            <i className="fas fa-microchip"></i>
          </div>
          <div className="space-y-4">
            <h2 className="serif text-4xl text-stone-800">Pro Credentials Needed</h2>
            <p className="text-stone-500 text-lg leading-relaxed font-light">
              Nano Banana Pro (Gemini 3 Pro Image) requires architectural-level processing power only available via Pro API Keys.
            </p>
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="inline-block text-emerald-600 text-sm font-bold underline underline-offset-4">
              View Billing Documentation
            </a>
          </div>
          <button
            onClick={handleKeySelection}
            className="w-full py-6 bg-stone-900 text-white rounded-[2rem] font-bold text-xl hover:bg-black transition-all shadow-2xl"
          >
            Authenticate & Render
          </button>
        </div>
      )}

      {step === AppStep.ANALYZING && (
        <div className="flex flex-col items-center justify-center py-32 space-y-12">
          <div className="relative">
            <div className="w-64 h-64 border-[16px] border-stone-100 rounded-full"></div>
            <div className="absolute inset-0 w-64 h-64 border-t-[16px] border-emerald-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center text-emerald-600 text-7xl">
               <i className="fas fa-yin-yang animate-pulse"></i>
            </div>
          </div>
          <div className="text-center space-y-6">
            <h2 className="serif text-5xl text-stone-800">Analyzing Energy Flow</h2>
            <p className="text-stone-500 animate-pulse font-medium text-2xl">{loadingStatus}</p>
            <p className="text-xs text-stone-400 uppercase tracking-[0.4em] font-black">Executing Nano Banana Pro Reconstruction Engine</p>
          </div>
        </div>
      )}

      {step === AppStep.REPORT && report && (
        <div className="space-y-16 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          {/* Header & Scores */}
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-12 bg-white p-16 rounded-[4rem] shadow-sm border border-stone-100">
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em]">High Precision Spatial Report</span>
              </div>
              <h2 className="serif text-6xl md:text-7xl text-stone-800 leading-tight">The Zen Axis</h2>
              <p className="text-stone-500 text-2xl font-light">Millimeter-precise analysis synthesized from opposing North-South data points.</p>
            </div>
            
            <div className="flex flex-wrap gap-16 items-center">
              <div className="text-center">
                <div className="text-xs font-black text-stone-300 uppercase tracking-[0.4em] mb-4">Harmony Score</div>
                <div className="text-7xl font-bold text-stone-800 tracking-tighter">{report.overallScore}<span className="text-2xl text-stone-200">/100</span></div>
              </div>
              
              <div className="hidden xl:block h-28 w-px bg-stone-100"></div>

              <div className="text-center">
                <div className="text-xs font-black text-emerald-600 uppercase tracking-[0.4em] mb-4">Max Potential</div>
                <div className="text-8xl font-black text-emerald-600 flex items-center justify-center gap-4 tracking-tighter">
                  {report.potentialScore}
                  <i className="fas fa-sparkles text-xl text-yellow-400"></i>
                </div>
              </div>

              <button 
                 onClick={reset}
                 className="w-16 h-16 flex items-center justify-center bg-stone-50 text-stone-400 rounded-full hover:bg-stone-900 hover:text-white transition-all shadow-sm group"
               >
                 <i className="fas fa-rotate-right text-xl group-hover:rotate-180 transition-transform duration-700"></i>
               </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8 space-y-16">
              {/* Aerial Map */}
              <section className="bg-white p-4 rounded-[4rem] shadow-2xl border-4 border-emerald-50 overflow-hidden group">
                <div className="p-12 pb-8">
                  <div className="flex justify-between items-start">
                    <div className="space-y-3">
                      <h3 className="font-bold text-4xl text-stone-800 flex items-center gap-5">
                        <i className="fas fa-building-columns text-stone-900"></i>
                        Architectural Replay
                      </h3>
                      <p className="text-xl text-stone-500 font-light">Realistic, top view, aerial reconstruction powered by Nano Banana Pro.</p>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <span className="px-6 py-2.5 bg-stone-900 text-white text-[11px] font-black rounded-full uppercase tracking-[0.2em] shadow-xl">Nano Banana Pro</span>
                      <span className="text-[10px] text-stone-400 font-bold uppercase tracking-[0.3em] flex items-center gap-2">
                         <i className="fas fa-circle text-[6px] text-emerald-500 animate-pulse"></i>
                         2K Resolution Active
                      </span>
                    </div>
                  </div>
                </div>
                {aerialMapUrl ? (
                  <div className="relative overflow-hidden rounded-[3.5rem]">
                    <img src={aerialMapUrl} alt="Architectural 3D Render" className="w-full h-auto object-cover transform transition-transform duration-[2000ms] group-hover:scale-[1.02]" />
                  </div>
                ) : (
                  <div className="aspect-square bg-stone-50 flex flex-col items-center justify-center text-stone-400 p-24 text-center">
                    <i className="fas fa-layer-group fa-spin text-6xl mb-10"></i>
                    <p className="text-2xl font-medium">Synthesizing North/South data into 3D geometry...</p>
                  </div>
                )}
              </section>

              {/* Detected Issues */}
              <section className="space-y-10">
                <div className="flex items-center justify-between border-b-2 border-stone-100 pb-8">
                  <h3 className="font-bold text-4xl text-stone-800 tracking-tight">Structural Imbalances</h3>
                  <span className="px-6 py-2 bg-stone-100 text-stone-600 text-xs font-black rounded-full uppercase tracking-[0.2em]">Sha Chi Vulnerabilities</span>
                </div>
                <div className="grid grid-cols-1 gap-8">
                  {report.issues.map((issue, idx) => (
                    <div key={idx} className="bg-white p-10 rounded-[3rem] border-l-[12px] border-l-red-500 shadow-sm flex gap-10 items-start hover:shadow-2xl transition-all">
                      <div className={`w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center text-3xl ${
                        issue.severity === 'high' ? 'bg-red-50 text-red-600' : 'bg-stone-50 text-stone-400'
                      }`}>
                        <i className="fas fa-triangle-exclamation"></i>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-5">
                          <h4 className="font-bold text-3xl text-stone-800">{issue.title}</h4>
                          <span className="text-[10px] font-black uppercase tracking-[0.3em] px-4 py-1.5 bg-red-100 text-red-600 rounded-full">
                            {issue.severity} priority
                          </span>
                        </div>
                        <p className="text-stone-500 text-xl leading-relaxed font-light">{issue.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <aside className="lg:col-span-4 space-y-12">
              {/* PAID UPSELL */}
              <div className="bg-stone-900 text-white p-12 rounded-[4rem] shadow-2xl relative overflow-hidden group border-b-[12px] border-emerald-500">
                <div className="absolute -right-16 -top-16 w-56 h-56 bg-emerald-500/20 rounded-full blur-[80px] group-hover:bg-emerald-500/30 transition-all duration-700"></div>
                <div className="flex items-center gap-5 mb-10">
                  <div className="w-14 h-14 bg-emerald-500 text-white rounded-[1.5rem] flex items-center justify-center text-3xl shadow-2xl shadow-emerald-500/40">
                    <i className="fas fa-bolt"></i>
                  </div>
                  <span className="text-[12px] font-black uppercase tracking-[0.4em] text-emerald-400">Pro Upgrade</span>
                </div>
                <h3 className="font-bold text-5xl mb-8 leading-[1.1]">Spatial Remedy</h3>
                <p className="text-xl text-stone-400 mb-12 leading-relaxed font-light">
                  Unlock the <b>Healing Plan</b> to get exact rotation angles and millimeter-perfect placement coordinates to achieve {report.potentialScore}% harmony.
                </p>
                <button className="w-full py-8 bg-emerald-500 text-stone-900 rounded-[2rem] font-black text-2xl hover:bg-emerald-400 transition-all shadow-2xl shadow-emerald-500/20 transform hover:-translate-y-1 active:scale-95">
                  Get Full Plan (€9)
                </button>
                <p className="text-center mt-8 text-stone-500 text-xs font-bold uppercase tracking-[0.3em]">Full Blueprint Export included</p>
              </div>

              {/* Elemental Distribution */}
              <div className="bg-white p-12 rounded-[4rem] shadow-sm border border-stone-100">
                <h3 className="font-bold text-3xl text-stone-800 mb-10 flex items-center gap-5">
                  <i className="fas fa-atom text-emerald-600"></i>
                  Elemental Profile
                </h3>
                <div className="grid grid-cols-5 gap-4">
                  {Object.entries(report.elementalBalance).map(([element, value]) => (
                    <div key={element} className="flex flex-col items-center">
                      <div className="w-full h-48 bg-stone-50 rounded-2xl relative overflow-hidden group">
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
                      <span className="text-[10px] font-black uppercase mt-5 text-stone-400 tracking-[0.2em]">{element}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strengths */}
              <div className="bg-white p-12 rounded-[4rem] shadow-sm border border-stone-100">
                <h3 className="font-bold text-3xl text-stone-800 mb-10 flex items-center gap-5">
                  <i className="fas fa-shield-heart text-emerald-500"></i>
                  Existing Harmony
                </h3>
                <ul className="space-y-6">
                  {report.positives.map((pos, idx) => (
                    <li key={idx} className="flex gap-6 text-lg text-stone-600 leading-relaxed bg-stone-50 p-8 rounded-[2.5rem] border border-stone-100/50">
                      <i className="fas fa-circle-check text-emerald-500 mt-1 flex-shrink-0 text-xl"></i>
                      <span className="font-light">{pos}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>

          {/* Simulation Section */}
          <div className="pt-32 border-t-2 border-stone-100">
            <div className="text-center space-y-6 mb-20">
              <h3 className="serif text-6xl text-stone-800">Simulation Lab</h3>
              <p className="text-stone-500 text-2xl max-w-4xl mx-auto font-light">
                Iterate on your space virtually. Use the Nano engine to test improvements before moving a single piece of furniture.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-7xl mx-auto">
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
