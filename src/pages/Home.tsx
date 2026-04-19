import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Droplets, Sprout, Wind, Zap, ArrowRight, Gauge, BookOpen, Settings, X, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const growthData = [
  { name: 'Lettuce', ph: '5.5-6.0', tds: '500-1000', temp: '18-24', hum: '50-70', pump: '1-2 hrs', season: 'All', time: '30 days' },
  { name: 'Spinach', ph: '5.5-6.0', tds: '500-1000', temp: '18-24', hum: '50-70', pump: '1-2 hrs', season: 'All', time: '30-40 days' },
  { name: 'Coriander', ph: '5.5-6.0', tds: '500-1000', temp: '20-25', hum: '60-80', pump: '1-2 hrs', season: 'All', time: '20-30 days' },
  { name: 'Basil', ph: '5.5-6.0', tds: '800-1200', temp: '20-25', hum: '60-80', pump: '1-2 hrs', season: 'Warm/All', time: '30-60 days' },
  { name: 'Pudina (Mint)', ph: '5.5-6.5', tds: '500-1000', temp: '20-25', hum: '60-80', pump: '1-2 hrs', season: 'All', time: '20-25 days' },
  { name: 'Money Plant', ph: '6.0-7.0', tds: '400-800', temp: '20-28', hum: '50-70', pump: 'Continuous low', season: 'All (Indoor)', time: 'Roots 1-2 wks' },
  { name: 'Kale', ph: '5.5-6.5', tds: '1000-1200', temp: '18-24', hum: '50-70', pump: '1-2 hrs', season: 'All', time: '30-50 days' },
  { name: 'Swiss Chard', ph: '6.0-7.0', tds: '1000-1400', temp: '18-25', hum: '50-70', pump: '1-2 hrs', season: 'All', time: '40-60 days' },
  { name: 'Bok Choy', ph: '5.5-6.5', tds: '500-1000', temp: '18-24', hum: '60-80', pump: '1-2 hrs', season: 'All', time: '30 days' },
];

export default function Home() {
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  const GrowthList = () => (
    <div className="space-y-4">
      <span className="text-[10px] uppercase tracking-widest text-brand-text-dim font-bold pl-1">Growth Parameters</span>
      <div className="grid grid-cols-1 gap-3">
        {growthData.map((plant, i) => (
          <div key={i} className="bg-brand-bg border border-brand-border p-4 rounded-xl hover:border-brand-accent/50 transition-colors group">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xs font-bold text-brand-accent uppercase tracking-wider">{plant.name}</h3>
              <span className="text-[9px] font-mono text-brand-text-dim italic">{plant.season}</span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div className="flex flex-col">
                <span className="text-[9px] text-brand-text-dim uppercase font-bold">pH</span>
                <span className="text-sm font-mono text-brand-text">{plant.ph}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-brand-text-dim uppercase font-bold">TDS</span>
                <span className="text-sm font-mono text-brand-text">{plant.tds}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-brand-text-dim uppercase font-bold">TEMP</span>
                <span className="text-sm font-mono text-brand-text">{plant.temp}°C</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-brand-text-dim uppercase font-bold">HUMIDITY</span>
                <span className="text-sm font-mono text-brand-text">{plant.hum}%</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-brand-border flex justify-between items-center">
              <span className="text-[10px] text-brand-text-dim italic font-mono lowercase">{plant.pump} pump cycle</span>
              <span className="text-xs font-bold text-brand-text uppercase">{plant.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-brand-bg text-brand-text font-sans">
      {/* Sidebar - Desktop Layout */}
      <aside className="hidden lg:flex flex-col w-72 bg-brand-surface border-r border-brand-border px-6 py-8 fixed h-full z-50">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 bg-brand-accent rounded flex items-center justify-center">
            <Droplets className="text-brand-bg w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">HydroSense</h1>
        </div>
        
        <div className="flex-1 overflow-y-auto min-h-0 pr-2 space-y-6 custom-scrollbar">
          <GrowthList />
        </div>

        <Link to="/access" className="mt-8 px-4 py-3 bg-brand-accent text-brand-bg rounded-lg text-sm font-bold text-center hover:opacity-90 transition-all shadow-lg shadow-brand-accent/20">
          Open Mobile Dashboard
        </Link>
      </aside>

      {/* Mobile Library Drawer */}
      <AnimatePresence>
        {isLibraryOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLibraryOpen(false)}
              className="fixed inset-0 bg-brand-bg/60 backdrop-blur-sm z-[60] lg:hidden"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-brand-surface border-r border-brand-border z-[70] lg:hidden flex flex-col"
            >
              <div className="p-6 border-b border-brand-border flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-brand-accent" />
                  <span className="font-bold tracking-tight">Plant Library</span>
                </div>
                <button onClick={() => setIsLibraryOpen(false)} className="p-2 hover:bg-brand-border rounded-full transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                <GrowthList />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 bg-brand-bg">
        {/* Navigation - Mobile only */}
        <nav className="lg:hidden flex items-center justify-between px-6 py-4 border-b border-brand-border bg-brand-surface/80 backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsLibraryOpen(true)}
              className="p-2 bg-brand-border/30 rounded-lg text-brand-text-dim hover:text-brand-text transition-colors"
            >
              <BookOpen className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Droplets className="text-brand-accent w-5 h-5" />
              <span className="text-lg font-bold tracking-tight">HydroSense</span>
            </div>
          </div>
          <Link to="/access" className="px-4 py-2 bg-brand-accent text-brand-bg rounded-lg text-xs font-bold shadow-sm shadow-brand-accent/20">
            Access
          </Link>
        </nav>

        {/* Hero Section */}
        <section className="px-6 py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ duration: 0.6 }}>
              <span className="inline-block px-3 py-1 bg-brand-accent/10 text-brand-accent rounded-full text-[10px] font-bold uppercase tracking-widest mb-6">
                Professional Grade Monitoring
              </span>
              <h1 className="text-5xl md:text-7xl font-bold leading-[0.9] mb-8 tracking-tighter">
                Grow Smarter with <span className="text-brand-accent">HydroSense</span>
              </h1>
              <p className="text-lg text-brand-text-dim mb-10 max-w-2xl mx-auto leading-relaxed">
                Precision hydroponics for the modern hobbyist. Real-time monitoring, automated nutrient tracking, and environmental control in one high-density interface.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/access" className="group px-8 py-4 bg-brand-accent text-brand-bg rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-all">
                  Launch Dashboard
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a href="#how-to-build" className="px-8 py-4 bg-brand-surface border border-brand-border text-brand-text rounded-xl font-bold hover:bg-brand-border/20 transition-all">
                  Documentation
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features - High Density Grid */}
        <section className="px-6 py-24 bg-brand-surface/30 border-y border-brand-border">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Droplets, title: "Smart Nutrients", desc: "Real-time TDS and pH monitoring keeps your solution perfectly balanced." },
              { icon: Zap, title: "Full Automation", desc: "Control pumps, lights, and fans remotely or with intelligent schedules." },
              { icon: Gauge, title: "Precision Sensors", desc: "Track every variable from water temperature to ambient light levels." }
            ].map((f, i) => (
              <motion.div 
                key={i} 
                className="bg-brand-surface border border-brand-border p-8 rounded-2xl"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                transition={{ delay: i * 0.1 }}
              >
                <div className="w-10 h-10 bg-brand-bg border border-brand-border rounded flex items-center justify-center text-brand-accent mb-6">
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold mb-3 font-mono">{f.title}</h3>
                <p className="text-sm text-brand-text-dim leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* How to Build Section */}
        <section id="how-to-build" className="px-6 py-24">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col items-center text-center mb-16 underline-offset-8">
              <h2 className="text-4xl font-bold mb-4 tracking-tighter">How to Build Your System</h2>
              <div className="h-1 w-20 bg-brand-accent rounded-full"></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-6">
                {[
                  { step: "01", title: "Choose Your Method", desc: "Select between NFT, DWC, or Aeroponics depending on your space and goals." },
                  { step: "02", title: "Scale Your Reservoir", desc: "Choose a non-transparent container. 5-10 gallons is ideal for hobbyists." },
                  { step: "03", title: "Install the Electronics", desc: "Assemble your ESP32/Arduino sensors for pH, TDS, and temperature." },
                  { step: "04", title: "Start Your First Grow", desc: "Transplant your seedlings into the system and initiate monitoring." }
                ].map((s, i) => (
                  <div key={i} className="flex gap-6 p-4 bg-brand-surface/50 border border-brand-border/50 rounded-xl">
                    <span className="text-xl font-black text-brand-accent/30 font-mono leading-none">{s.step}</span>
                    <div>
                      <h4 className="text-sm font-bold text-brand-text mb-1">{s.title}</h4>
                      <p className="text-xs text-brand-text-dim">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-brand-surface rounded-[2rem] p-10 border border-brand-border relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/5 blur-[80px] rounded-full"></div>
                <div className="relative z-10">
                  <Settings className="w-12 h-12 text-brand-accent mb-8 opacity-50" />
                  <h3 className="text-2xl font-bold mb-6 font-mono">System Components</h3>
                  <ul className="space-y-4 text-sm text-brand-text-dim">
                    <li className="flex items-center gap-3"><Droplets className="w-4 h-4 text-brand-accent" /> Submersible Pump (v2.4)</li>
                    <li className="flex items-center gap-3"><Sprout className="w-4 h-4 text-brand-accent" /> Net Pots & Hydro-ton</li>
                    <li className="flex items-center gap-3"><Wind className="w-4 h-4 text-brand-accent" /> Dual-Stage Air Pump</li>
                    <li className="flex items-center gap-3"><Zap className="w-4 h-4 text-brand-accent" /> Full-Spectrum LED Matrix</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 py-12 border-t border-brand-border text-center bg-brand-surface/10">
          <div className="flex items-center justify-center gap-2 mb-4 opacity-70">
            <Droplets className="text-brand-accent w-4 h-4" />
            <span className="text-sm font-bold tracking-widest uppercase">HydroSense</span>
          </div>
          <p className="text-brand-text-dim text-[10px] tracking-widest font-mono">LATENCY: 42ms | SYNC: 10s | FW: v2.4.1-STABLE</p>
        </footer>
      </main>
    </div>
  );
}

