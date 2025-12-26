
import React from 'react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#fcfaf7]">
      <header className="sticky top-0 z-50 glass border-b border-stone-200">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 h-24 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-100 transform rotate-3">
              <i className="fas fa-yin-yang text-xl"></i>
            </div>
            <span className="text-2xl font-bold text-stone-800 tracking-tighter">ZenSpace<span className="text-emerald-600">.ai</span></span>
          </div>
          <nav className="hidden lg:flex gap-10 text-xs font-bold text-stone-500 uppercase tracking-widest">
            <a href="#" className="hover:text-emerald-600 transition-colors border-b-2 border-transparent hover:border-emerald-600 pb-1">Framework</a>
            <a href="#" className="hover:text-emerald-600 transition-colors border-b-2 border-transparent hover:border-emerald-600 pb-1">3D Engine</a>
            <a href="#" className="hover:text-emerald-600 transition-colors border-b-2 border-transparent hover:border-emerald-600 pb-1">Case Studies</a>
          </nav>
          <div className="flex items-center gap-4">
             <button className="hidden sm:block text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-6 py-3 rounded-full hover:bg-emerald-100 transition-colors">
               Pro Login
             </button>
          </div>
        </div>
      </header>
      <main className="flex-grow container max-w-[1440px] mx-auto px-6 md:px-12 py-12">
        {children}
      </main>
      <footer className="bg-stone-50 border-t border-stone-200 py-16 mt-20">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="text-stone-400 text-sm font-medium">
            <p>© 2024 ZenSpace AI Global. Powered by Nano Banana Pro 3D Mapping Engine.</p>
          </div>
          <div className="flex md:justify-end gap-6 text-stone-300">
            <a href="#" className="hover:text-emerald-500 transition-colors"><i className="fab fa-instagram text-xl"></i></a>
            <a href="#" className="hover:text-emerald-500 transition-colors"><i className="fab fa-linkedin-in text-xl"></i></a>
            <a href="#" className="hover:text-emerald-500 transition-colors"><i className="fab fa-twitter text-xl"></i></a>
          </div>
        </div>
      </footer>
    </div>
  );
};
