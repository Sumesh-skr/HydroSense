import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { QrCode, Smartphone, ArrowLeft, Cpu, AlertCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { checkDeviceExists } from '../services/firebase';

export default function DashboardAccess() {
  const [deviceCode, setDeviceCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = deviceCode.trim();
    if (!cleanCode) return;

    setError(null);
    setIsLoading(true);

    try {
      // Always allow demo ID
      if (cleanCode === 'HS-DEMO-01') {
        navigate(`/dashboard/${cleanCode}`);
        return;
      }

      const exists = await checkDeviceExists(cleanCode);
      if (exists) {
        navigate(`/dashboard/${cleanCode}`);
      } else {
        setError(`Device ID "${cleanCode}" not found in system.`);
      }
    } catch (err) {
      setError("Failed to verify device. Check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center p-6 text-brand-text">
      <Link to="/" className="fixed top-6 left-6 p-2 bg-brand-surface rounded-xl border border-brand-border text-brand-text-dim hover:text-brand-text transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-brand-surface rounded-3xl p-8 shadow-2xl border border-brand-border"
      >
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-16 h-16 bg-brand-bg border border-brand-border rounded-2xl flex items-center justify-center text-brand-accent mb-6">
            <Smartphone className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-2 tracking-tight">Connect Your Device</h2>
          <p className="text-brand-text-dim text-xs tracking-wide">Scan the controller QR or enter the unique Device ID.</p>
        </div>

        <button 
          className="w-full py-4 bg-brand-accent text-brand-bg rounded-xl flex items-center justify-center gap-3 font-bold mb-6 hover:opacity-90 transition-all active:scale-[0.98]"
          onClick={() => alert("QR Scanning placeholder: Please enter the device code manually for this demo.")}
        >
          <QrCode className="w-5 h-5" />
          Scan QR Code
        </button>

        <div className="relative mb-6">
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-brand-border/50"></div>
          <span className="relative z-10 mx-auto px-4 bg-brand-surface text-[10px] font-bold text-brand-text-dim uppercase tracking-[0.3em]">Manual Entry</span>
        </div>

        <form onSubmit={handleAccess} className="space-y-4">
          <div className="relative">
            <Cpu className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-text-dim" />
            <input 
              type="text" 
              placeholder="DEVICE ID (e.g. Device1111)"
              className={`w-full pl-12 pr-4 py-4 bg-brand-bg border rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-accent transition-all font-mono font-bold text-brand-accent placeholder:text-brand-text-dim/50 ${error ? 'border-red-500/50 ring-1 ring-red-500/20' : 'border-brand-border'}`}
              value={deviceCode}
              onChange={(e) => {
                setDeviceCode(e.target.value);
                if (error) setError(null);
              }}
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-3 text-red-400 text-[10px] font-bold uppercase tracking-wider"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            type="submit"
            disabled={!deviceCode.trim() || isLoading}
            className="w-full py-4 bg-brand-surface border border-brand-border text-brand-text rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-brand-border/30 transition-all disabled:opacity-30 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Authenticate Session'}
          </button>
        </form>

        <p className="mt-8 text-center text-[10px] text-brand-text-dim uppercase tracking-widest font-mono">
          SYNC LATENCY: <span className="text-brand-accent">LOW</span>
        </p>
      </motion.div>

      {/* Demo helper */}
      <div className="mt-8 px-5 py-2.5 bg-brand-surface/50 text-brand-accent rounded-full text-[10px] font-bold border border-brand-border flex items-center gap-2 uppercase tracking-widest">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-accent"></span>
        </span>
        DEMO ID: <code className="font-mono text-brand-text ml-1 px-1 bg-brand-bg rounded">HS-DEMO-01</code>
      </div>
    </div>
  );
}

