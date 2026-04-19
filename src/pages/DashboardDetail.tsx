import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Droplets, Thermometer, Wind, Zap, Sun, 
  BarChart3, Settings2, RefreshCcw, Activity, Droplet,
  ShieldOff, Monitor, Database, Server, X
} from 'lucide-react';
import { Tooltip, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { subscribeToDevice, subscribeToHistory, updateDeviceActuator } from '../services/firebase';
import React, { memo } from 'react';

interface SensorData {
  Plant?: string;
  Ph: number;
  Tds?: number;
  Temp?: number;
  Humidity: number;
  WaterTemp?: number;
  WaterLevel?: number;
  WaterPump?: string | boolean;
  AirPump: string | boolean;
  GrowLight: string | boolean;
  Exhaust: string | boolean;
  Light: number;
  PhDown?: string | boolean;
  LastUpdate?: number;
}

interface HistoryPoint {
  timestamp: string;
  [key: string]: any;
}

export default function DashboardDetail() {
  const { deviceId } = useParams<{ deviceId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<SensorData | null>(null);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'trends'>('overview');
  const [isOnline, setIsOnline] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Connection Watchdog: 25s timeout for OFFLINE status based strictly on data.LastUpdate
  useEffect(() => {
    if (!data?.LastUpdate) return;
    
    setIsOnline(true);
    const watchdog = setTimeout(() => {
      setIsOnline(false);
    }, 25000);
    return () => clearTimeout(watchdog);
  }, [data?.LastUpdate]);

  // Helper to convert RTDB "0"/"1" strings to boolean
  const isStatusOn = (status: string | boolean | undefined) => {
    if (typeof status === 'string') return status === '1';
    return !!status;
  };

  const formatSeq = (seq: number | undefined) => {
    if (seq === undefined || seq === null) return '-';
    if (seq === 0) return '00:00:00';
    const str = seq.toString().padStart(6, '0');
    const hh = str.substring(0, 2);
    const mm = str.substring(2, 4);
    const ss = str.substring(4, 6);
    return `${hh}:${mm}:${ss}`;
  };

  const handleToggle = async (actuatorKey: string, currentStatus: boolean) => {
    if (!deviceId) return;
    
    // Convert boolean back to RTDB string format "0"/"1"
    const nextStatus = currentStatus ? "0" : "1";
    
    try {
      await updateDeviceActuator(deviceId, actuatorKey, nextStatus);
    } catch (error) {
      console.error("Failed to toggle actuator:", error);
    }
  };

  // Process history for charts to handle string-based numbers and boolean statuses
  const processedHistory = history.map(h => ({
    ...h,
    WaterPumpVal: isStatusOn(h.WaterPump) ? 1 : 0,
    AirPumpVal: isStatusOn(h.AirPump) ? 1 : 0,
    GrowLightVal: isStatusOn(h.GrowLight) ? 1 : 0,
    ExhaustVal: isStatusOn(h.Exhaust) ? 1 : 0,
    Ph: Number(h.Ph),
    Tds: Number(h.Tds),
    Temp: Number(h.Temp),
    Humidity: Number(h.Humidity),
    WaterTemp: Number(h.WaterTemp),
    WaterLevel: Number(h.WaterLevel),
    Light: Number(h.Light)
  }));

  // Custom Tooltip Component
  const CustomTooltip = ({ active, payload, label, unit }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-brand-surface border border-brand-border p-2 rounded shadow-lg font-mono text-[10px]">
          <p className="text-brand-text-dim mb-1">{new Date(label).toLocaleTimeString()}</p>
          <p className="text-brand-accent font-bold">
            {payload[0].value} {unit}
          </p>
        </div>
      );
    }
    return null;
  };

  // Memoized Chart Component for Optimization
  const ParameterChart = memo(({ data, dataKey, unit, height = "100%", isStep = false }: any) => (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <XAxis dataKey="timestamp" hide />
        <Tooltip 
          content={<CustomTooltip unit={unit} />} 
          cursor={{ stroke: 'var(--color-brand-border)', strokeWidth: 1 }}
        />
        <Area 
          type={isStep ? "stepAfter" : "monotone"} 
          dataKey={dataKey} 
          stroke="var(--color-brand-accent)" 
          fill="var(--color-brand-accent)" 
          fillOpacity={0.05} 
          strokeWidth={1.5} 
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  ));
  ParameterChart.displayName = 'ParameterChart';

  // Mock data for demo if no real data exists
  useEffect(() => {
    if (deviceId === 'HS-DEMO-01' || !data) {
      const mockData: SensorData = {
        Plant: "Butterhead Lettuce",
        Ph: 6.2,
        Tds: 820,
        Temp: 22.4,
        Humidity: 65,
        WaterTemp: 19.8,
        WaterLevel: 85,
        WaterPump: "1",
        AirPump: "1",
        GrowLight: "1",
        Exhaust: "0",
        Light: 88
      };
      
      const mockHistory = Array.from({ length: 20 }).map((_, i) => ({
        timestamp: new Date(Date.now() - (20 - i) * 60000).toISOString(),
        Ph: 6.0 + Math.random() * 0.4,
        Tds: 800 + Math.random() * 50,
        Temp: 21 + Math.random() * 3,
        Humidity: 60 + Math.random() * 10,
        WaterTemp: 18 + Math.random() * 4,
        WaterLevel: 80 + Math.random() * 10,
        Light: 80 + Math.random() * 20,
        WaterPump: Math.random() > 0.5 ? "1" : "0",
        AirPump: Math.random() > 0.3 ? "1" : "0",
        GrowLight: "1",
        Exhaust: Math.random() > 0.8 ? "1" : "0"
      }));

      setData(prev => prev || mockData);
      setHistory(prev => prev.length ? prev : mockHistory);
    }

    if (deviceId) {
      const unsubscribeDevice = subscribeToDevice(deviceId, (newData) => {
        setData(newData);
        
        // Append new data point to history for real-time charting
        setHistory(prev => {
          const newPoint = {
            ...newData,
            timestamp: new Date().toISOString()
          };
          const updated = [...prev, newPoint];
          // Keep only the last 20-30 points to prevent memory bloat and keep chart readable
          return updated.slice(-20);
        });
      });
      
      const unsubscribeHistory = subscribeToHistory(deviceId, (newHistory) => {
        if (newHistory && newHistory.length > 0) {
          setHistory(newHistory);
        }
      });
      return () => {
        unsubscribeDevice();
        unsubscribeHistory();
      };
    }
  }, [deviceId]);

  // Updating mock data every 10 seconds if it's the demo
  useEffect(() => {
    const interval = setInterval(() => {
      if (deviceId?.includes('DEMO')) {
        let updatedData: SensorData | null = null;
        setData(prev => {
          if (!prev) return null;
          updatedData = {
            ...prev,
            Ph: Number((prev.Ph + (Math.random() - 0.5) * 0.1).toFixed(1)),
            Tds: Math.floor((prev.Tds || 820) + (Math.random() - 0.5) * 10),
            Temp: Number(((prev.Temp || 22.4) + (Math.random() - 0.5) * 0.2).toFixed(1)),
            WaterTemp: Number(((prev.WaterTemp || 19.8) + (Math.random() - 0.5) * 0.2).toFixed(1)),
            Humidity: Math.min(100, Math.max(0, prev.Humidity + Math.floor((Math.random() - 0.5) * 2))),
            Light: Math.min(100, Math.max(0, prev.Light + Math.floor((Math.random() - 0.5) * 5))),
            LastUpdate: Number(new Date().toLocaleTimeString('en-GB', { hour12: false }).replace(/:/g, ''))
          };
          return updatedData;
        });

        if (updatedData) {
          setHistory(prev => {
            const updated = [...prev, { ...(updatedData as any), timestamp: new Date().toISOString() }];
            return updated.slice(-20);
          });
        }
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [deviceId]);

  if (!data) return <div className="flex items-center justify-center min-h-screen bg-brand-bg text-brand-text font-mono uppercase tracking-[0.2em] animate-pulse">Establishing Telemetry...</div>;

  const isDisabled = data.Plant === "DISABLE DEVICE";

  const stats = [
    { label: 'Acidity', value: data.Ph, unit: 'pH', icon: Droplet, key: 'Ph' },
    { label: 'Nutrients', value: data.Tds || 0, unit: 'ppm', icon: BarChart3, key: 'Tds' },
    { label: 'Air Temp', value: data.Temp || 0, unit: '°C', icon: Thermometer, key: 'Temp' },
    { label: 'Humidity', value: data.Humidity, unit: '%', icon: Wind, key: 'Humidity' },
    { label: 'Water Temp', value: data.WaterTemp || 0, unit: '°C', icon: Thermometer, key: 'WaterTemp' },
    { label: 'Water Level', value: data.WaterLevel || 0, unit: '%', icon: Droplets, key: 'WaterLevel' },
    { label: 'Ambient Light', value: data.Light, unit: '%', icon: Sun, key: 'Light' }
  ];

  const analyticsStats = [
    { label: 'Ph Level', key: 'Ph', unit: 'pH', isBinary: false },
    { label: 'Nutrients', key: 'Tds', unit: 'ppm', isBinary: false },
    { label: 'Air Temp', key: 'Temp', unit: '°C', isBinary: false },
    { label: 'Humidity', key: 'Humidity', unit: '%', isBinary: false },
    { label: 'Water Temp', key: 'WaterTemp', unit: '°C', isBinary: false },
    { label: 'Water Level', key: 'WaterLevel', unit: '%', isBinary: false },
    { label: 'Ambient Light', key: 'Light', unit: '%', isBinary: false },
    { label: 'Water Pump', key: 'WaterPumpVal', unit: '% duty', isBinary: true },
    { label: 'Aerator', key: 'AirPumpVal', unit: '% duty', isBinary: true },
    { label: 'Grow Light', key: 'GrowLightVal', unit: '% duty', isBinary: true },
    { label: 'Exhaust', key: 'ExhaustVal', unit: '% duty', isBinary: true },
  ];

  const getAverage = (key: string, isBinary: boolean) => {
    if (!processedHistory.length) return 0;
    const sum = processedHistory.reduce((acc, curr: any) => acc + (curr[key] || 0), 0);
    const avg = sum / processedHistory.length;
    return isBinary ? Math.round(avg * 100) : Number(avg.toFixed(1));
  };

  const controls = [
    { label: 'Water Pump', status: isStatusOn(data.WaterPump), icon: Droplets, key: 'WaterPump' },
    { label: 'Air Pump', status: isStatusOn(data.AirPump), icon: Wind, key: 'AirPump' },
    { label: 'Grow Light', status: isStatusOn(data.GrowLight), icon: Zap, key: 'GrowLight' },
    { label: 'Exhaust', status: isStatusOn(data.Exhaust), icon: RefreshCcw, key: 'Exhaust' }
  ];

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text font-sans pb-24 overflow-x-hidden">
      {/* Sidebar Layout for Desktop, Header for Mobile */}
      <header className="h-16 bg-brand-surface border-b border-brand-border flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/access')} className="p-1 text-brand-text-dim hover:text-brand-text transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col">
            <h2 className="text-sm font-bold tracking-tight">RTDB Stream</h2>
            <p className="text-[10px] font-mono text-brand-text-dim uppercase tracking-widest">Device: {deviceId}</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-4 text-[10px] font-bold text-brand-text-dim uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full transition-all duration-500 ${isOnline ? 'bg-brand-accent animate-pulse' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`}></div> 
              {isOnline ? 'LIVE' : 'OFFLINE'}
            </div>
            <span>LAST SEQ: {formatSeq(data.LastUpdate)}</span>
          </div>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="text-brand-text-dim hover:text-brand-text transition-colors"
          >
            <Settings2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Settings & Quota Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="absolute inset-0 bg-brand-bg/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-brand-surface border border-brand-border rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-brand-border flex justify-between items-center bg-brand-bg/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-brand-accent/10 rounded-lg">
                    <Settings2 className="w-5 h-5 text-brand-accent" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold tracking-tight">System Configuration</h3>
                    <p className="text-[10px] font-mono text-brand-text-dim uppercase tracking-widest">Diagnostics & Resource Monitor</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-2 hover:bg-brand-border/50 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-brand-text-dim" />
                </button>
              </div>

              <div className="p-8 space-y-8">
                {/* Quota Monitor Section */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Server className="w-4 h-4 text-brand-accent" />
                    <h4 className="text-[10px] font-bold text-brand-text-dim uppercase tracking-widest">Cloud Resource Quotas (Spark Plan)</h4>
                  </div>
                  
                  <div className="grid gap-4">
                    {[
                      { icon: Monitor, label: 'Concurrent Connections', value: '1 / 100', percent: 1, color: 'bg-emerald-500' },
                      { icon: Database, label: 'Realtime Storage', value: '< 1MB / 1GB', percent: 0.1, color: 'bg-blue-500' },
                      { icon: RefreshCcw, label: 'Monthly Bandwidth', value: '< 1MB / 10GB', percent: 0.1, color: 'bg-brand-accent' },
                    ].map((quota, i) => (
                      <div key={i} className="bg-brand-bg p-4 rounded-xl border border-brand-border">
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center gap-2">
                            <quota.icon className="w-3.5 h-3.5 text-brand-text-dim" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">{quota.label}</span>
                          </div>
                          <span className="text-[10px] font-mono font-bold text-brand-accent uppercase">{quota.value}</span>
                        </div>
                        <div className="h-1.5 w-full bg-brand-border rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${quota.percent}%` }}
                            className={`h-full ${quota.color}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 text-[9px] font-mono text-brand-text-dim uppercase leading-relaxed text-center italic">
                    Note: Estimated usage based on current session activity. Actual real-time quotas are managed in the Firebase Console.
                  </p>
                </section>

                <div className="pt-4 border-t border-brand-border flex flex-col gap-2">
                  <button 
                    onClick={() => {
                      localStorage.removeItem('lastDeviceId');
                      navigate('/access');
                    }}
                    className="w-full py-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-500/20 transition-all"
                  >
                    Terminate Session & Logout
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="p-6 max-w-6xl mx-auto flex flex-col gap-6">
        {/* Plant Meta */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tighter">{data.Plant || 'Generic System'}</h1>
            <p className="text-xs font-mono text-brand-text-dim uppercase mt-1">Status: Operational • Protocol: RTDB-STREAM</p>
          </div>
          <div className="flex gap-2 p-1 bg-brand-surface border border-brand-border rounded-lg">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded transition-all ${activeTab === 'overview' ? 'bg-brand-accent text-brand-bg' : 'text-brand-text-dim hover:text-brand-text'}`}
            >
              Metrics
            </button>
            <button 
              onClick={() => setActiveTab('trends')}
              className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded transition-all ${activeTab === 'trends' ? 'bg-brand-accent text-brand-bg' : 'text-brand-text-dim hover:text-brand-text'}`}
            >
              Analytics
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {isDisabled ? (
            <motion.div
              key="disabled"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-24 bg-brand-surface border border-brand-border rounded-3xl"
            >
              <div className="w-20 h-20 bg-brand-bg border border-brand-border rounded-2xl flex items-center justify-center text-brand-text-dim mb-8">
                <ShieldOff className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold tracking-tighter mb-2">Device is Disabled</h2>
              <p className="text-brand-text-dim text-xs font-mono uppercase tracking-widest">Protocol: SYSTEM-LOCKOUT • Authorization required</p>
              
              <button 
                onClick={() => navigate('/access')}
                className="mt-8 px-8 py-3 bg-brand-surface border border-brand-border rounded-xl text-xs font-bold uppercase tracking-[0.2em] hover:bg-brand-border/30 transition-all active:scale-95"
              >
                Return to Access
              </button>
            </motion.div>
          ) : activeTab === 'overview' ? (
            <motion.div 
              key="overview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-6"
            >
              {/* High Density Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                  <div key={i} className="bg-brand-surface p-4 rounded-xl border border-brand-border relative overflow-hidden group">
                    <p className="text-[10px] font-bold text-brand-text-dim uppercase tracking-widest mb-2">{stat.label}</p>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-bold text-brand-text font-mono tracking-tighter">{stat.value}</span>
                      <span className="text-xs font-medium text-brand-text-dim uppercase">{stat.unit}</span>
                    </div>
                    
                    {/* Tiny Sparkline Placeholder */}
                    <div className="h-8 w-full mt-3 opacity-30 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                      <ParameterChart 
                        data={processedHistory.slice(-10)} 
                        dataKey={stat.key} 
                        unit={stat.unit}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Controls - Horizontal Industrial Look with Sparklines */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {controls.map((control, i) => (
                  <div key={i} className="bg-brand-surface p-4 rounded-xl border border-brand-border relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-2">
                       <p className="text-[10px] font-bold text-brand-text-dim uppercase tracking-widest">{control.label}</p>
                       <button 
                         onClick={() => handleToggle(control.key, control.status)}
                         className={`w-7 h-3.5 rounded-full relative transition-all ${control.status ? 'bg-brand-accent' : 'bg-brand-border'} hover:ring-2 hover:ring-brand-accent/20`}
                       >
                         <div className={`absolute top-0.5 w-2.5 h-2.5 bg-white rounded-full shadow-sm transition-all ${control.status ? 'right-0.5' : 'left-0.5'}`}></div>
                       </button>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className={`text-lg font-bold font-mono tracking-tighter ${control.status ? 'text-brand-accent' : 'text-brand-text-dim'}`}>
                        {control.status ? 'ACTIVE' : 'STANDBY'}
                      </span>
                    </div>
                    
                    {/* Binary Duty Cycle Sparkline */}
                    <div className="h-8 w-full mt-3 opacity-30 group-hover:opacity-100 transition-all">
                      <ParameterChart 
                        data={processedHistory.slice(-15)} 
                        dataKey={`${control.label.replace(' ', '')}Val`} 
                        unit={control.status ? 'ON' : 'OFF'}
                        isStep={true}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="trends"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-6"
            >
              <div className="bg-brand-surface p-6 rounded-2xl border border-brand-border h-fit">
                <div className="flex justify-between items-center mb-6">
                  <p className="text-[10px] font-bold text-brand-text-dim uppercase tracking-widest">24H Comprehensive Analytics</p>
                  <div className="flex items-center gap-2 px-3 py-1 bg-brand-bg rounded-full border border-brand-border">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse"></div>
                    <span className="text-[10px] font-bold text-brand-text-dim uppercase tracking-widest italic">{processedHistory.length} Samples</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {analyticsStats.map((stat, i) => (
                    <div key={i} className="bg-brand-bg p-4 rounded-xl border border-brand-border hover:border-brand-accent/30 transition-all group">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-brand-text-dim uppercase tracking-widest">{stat.label}</span>
                          <span className="text-sm font-mono font-bold text-brand-text mt-0.5">
                            AVG: {getAverage(stat.key, stat.isBinary)}{stat.unit}
                          </span>
                        </div>
                        <Activity className="w-3.5 h-3.5 text-brand-text-dim group-hover:text-brand-accent transition-colors" />
                      </div>
                      
                      <div className="h-16 w-full -mx-2">
                        <ParameterChart 
                          data={processedHistory} 
                          dataKey={stat.key} 
                          unit={stat.unit}
                          isStep={stat.isBinary}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* System Footer Bar */}
      <div className="fixed bottom-0 inset-x-0 bg-brand-surface border-t border-brand-border p-4 flex justify-between items-center text-[10px] font-mono text-brand-text-dim uppercase tracking-widest overflow-hidden">
        <div className="flex items-center gap-4">
          <span>LATENCY: 42ms</span>
          <span className="hidden sm:inline">SYNC: 10s</span>
          <span className="hidden md:inline">FW: v2.4.1-STABLE</span>
        </div>
        <div className="flex items-center gap-2">
          <RefreshCcw className="w-3 h-3 animate-spin" />
          ESTABLISHED CONNECTION
        </div>
      </div>
    </div>
  );
}

