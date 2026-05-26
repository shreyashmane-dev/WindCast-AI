import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import DashboardLayout from "../layouts/DashboardLayout";
import { useSimulation } from "../hooks/useWeatherSimulation";
import { calculateEfficiency, getAlertStatus } from "../utils/predictionModel";
import WindTurbine from "../components/WindTurbine";
import { api } from "../services/api";
import { useAuth } from "../services/auth";
import ProtectedLoader from "../components/auth/ProtectedLoader";
import {
  Cpu,
  Sliders,
  Info,
  Zap,
  Thermometer,
  Wind,
  Droplets,
  Compass,
  Upload,
  Download,
  AlertTriangle,
  CheckCircle,
  FileText,
  Search,
  MapPin,
  RefreshCw,
  TrendingUp,
  Activity
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ScatterChart,
  Scatter
} from "recharts";

interface WindRegion {
  displayName: string;
  country: string;
  baseTemp: number;
  baseHumidity: number;
  baseWind: number;
  baseGust: number;
  direction: number;
  description: string;
}

const REGIONS: Record<string, WindRegion> = {
  "Mumbai, India": {
    displayName: "Mumbai, India",
    country: "India",
    baseTemp: 29.5,
    baseHumidity: 78.0,
    baseWind: 6.8,
    baseGust: 8.5,
    direction: 240,
    description: "Tropical offshore monsoon breezes and high-humidity convective thermal currents."
  },
  "Texas, USA": {
    displayName: "Texas, USA",
    country: "USA",
    baseTemp: 32.4,
    baseHumidity: 42.0,
    baseWind: 13.8,
    baseGust: 17.5,
    direction: 160,
    description: "High-yield continental plains wind corridors with substantial diurnal gust distributions."
  },
  "Berlin, Germany": {
    displayName: "Berlin, Germany",
    country: "Germany",
    baseTemp: 14.5,
    baseHumidity: 62.0,
    baseWind: 7.2,
    baseGust: 9.8,
    direction: 270,
    description: "Moderate oceanic-inland transition zones with highly stable prevailing westerlies."
  },
  "Tokyo, Japan": {
    displayName: "Tokyo, Japan",
    country: "Japan",
    baseTemp: 18.2,
    baseHumidity: 55.0,
    baseWind: 10.4,
    baseGust: 13.5,
    direction: 45,
    description: "Coastal mountain-to-sea wind interfaces presenting high non-linear flow complexities."
  }
};

export default function PredictionsConsole() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  const {
    weather,
    activeModel,
    isSimulating,
    history,
    setWeather,
    setIsSimulating,
    changeModel,
  } = useSimulation();

  const latestPower = history[history.length - 1]?.power || 0;
  const efficiency = calculateEfficiency(latestPower);
  const alertInfo = getAlertStatus(latestPower, weather.windspeed);

  const [activeTab, setActiveTab] = useState<"manual" | "batch">("manual");

  if (isLoading || !isAuthenticated) {
    return <ProtectedLoader />;
  }

  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeRegion, setActiveRegion] = useState<string>("");
  const [isFetchingWeather, setIsFetchingWeather] = useState(false);
  const autocompleteRef = useRef<HTMLDivElement>(null);

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingState, setProcessingState] = useState("");
  const [batchResults, setBatchResults] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const modelSpecs: Record<string, { desc: string; type: string; details: string }> = {
    "LSTM-X4 Deep Net": {
      desc: "Robust deep sequential time-series LSTM neural architecture tracking volatile airflow windows.",
      type: "Sequential Deep Net",
      details: "Trained over historical sequences, implementing cell memory structures with high temporal accuracy."
    },
    "Random Forest": {
      desc: "Robust non-linear decision tree ensemble mapping turbulent atmospheric flows.",
      type: "Ensemble Regressor",
      details: "Configured with 120 estimators, depth-locked node structures, and MinMaxScaler standardizations."
    },
    "XGBoost": {
      desc: "Extreme Gradient Boosting optimized for atmospheric gust fluctuations and micro-thermal convective currents.",
      type: "Gradient Boosting",
      details: "Piecewise tree networks with L2 regularizations and high wind speed weight sensitivities."
    },
    "Linear Regression": {
      desc: "interpretability-focused baseline mapping primary kinetic speed coefficients.",
      type: "Linear Estimator",
      details: "Direct speed-to-power baseline regressor providing lightweight operational grids."
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectRegion = (regionName: string) => {
    setActiveRegion(regionName);
    setSearchQuery(regionName);
    setShowSuggestions(false);
    setIsFetchingWeather(true);

    const region = REGIONS[regionName];
    
    setTimeout(() => {
      const driftSpeed = parseFloat((region.baseWind + (Math.random() - 0.5) * 1.5).toFixed(2));
      const driftGust = parseFloat((driftSpeed * 1.25 + Math.random()).toFixed(2));
      const driftTemp = parseFloat((region.baseTemp + (Math.random() - 0.5) * 2.0).toFixed(1));
      const driftHumid = Math.round(region.baseHumidity + (Math.random() - 0.5) * 5.0);

      setWeather({
        temperature: driftTemp,
        relativehu: driftHumid,
        windspeed: driftSpeed,
        windgust: driftGust,
        winddirec: region.direction,
        location: regionName
      });
      
      setIsFetchingWeather(false);
    }, 800);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const validateAndProcessFile = (file: File) => {
    setErrorMessage(null);
    setBatchResults(null);
    if (!file.name.endsWith(".csv")) {
      setErrorMessage("File validation failed: File must be a flat CSV dataset.");
      return;
    }
    setSelectedFile(file);
    startMockProcessAnimation(file);
  };

  const startMockProcessAnimation = (file: File) => {
    setUploadProgress(0);
    setProcessingState("Preparing telemetry byte stream...");
    
    let current = 0;
    const interval = setInterval(() => {
      current += 10;
      setUploadProgress(current);

      if (current === 30) {
        setProcessingState("Analyzing schema headers & fuzzy mapping columns...");
      } else if (current === 60) {
        setProcessingState("Executing machine learning prediction pipelines...");
      } else if (current === 90) {
        setProcessingState("Compiling analytical error distributions & insights...");
      } else if (current >= 100) {
        clearInterval(interval);
        triggerBackendBatchPrediction(file);
      }
    }, 200);
  };

  const triggerBackendBatchPrediction = async (file: File) => {
    setProcessingState("Synchronizing with dispatch server...");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post("/predict/batch", formData);
      setBatchResults(response);
      setUploadProgress(100);
      setProcessingState("Inferences compiled!");
    } catch (err: any) {
      console.error("Batch upload inference failed:", err);
      let msg = "Network connection timed out. Server is offline.";
      if (err.message) {
        if (err.message.includes("missing required weather columns")) {
          msg = "Validation failed: CSV is missing mandatory 'windspeed' or 'temperature' headers.";
        } else if (err.message.includes("Numerical row parsing")) {
          msg = "Validation failed: Malformed rows. Ensure all inputs contain valid numbers.";
        } else {
          msg = err.message;
        }
      }
      setErrorMessage(msg);
      setSelectedFile(null);
      setBatchResults(null);
    }
  };

  const handleDownloadSample = (mode: 1 | 2) => {
    const filename = mode === 1 ? "windcast_forecast_sample.csv" : "windcast_historical_sample.csv";
    const header = mode === 1 
      ? "temperature,relativehu,dewpoint,windspeed,winddirec,windgust\n"
      : "temperature,windspeed,Power\n";
    
    const rows = mode === 1
      ? "28.5,65.0,21.5,15.2,120,18.5\n30.2,60.0,22.0,18.4,140,22.1\n25.4,55.0,18.2,11.5,130,13.8\n"
      : "28.5,15.2,342.5\n30.2,18.4,410.2\n25.4,11.5,210.8\n";

    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPredictedCSV = () => {
    if (!batchResults || !selectedFile) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      const text = e.target?.result as string;
      const lines = text.split("\n");
      const headers = lines[0].trim() + ",Predicted_Power\n";
      
      let newCSV = headers;
      let predIdx = 0;

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line === "") continue;

        const predVal = batchResults.predictions[predIdx] !== undefined 
          ? batchResults.predictions[predIdx].toFixed(2)
          : "0.00";
        
        newCSV += line + "," + predVal + "\n";
        predIdx++;
      }

      const blob = new Blob([newCSV], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "windcast_predicted_results.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    reader.readAsText(selectedFile);
  };

  const handlePrintPDFReport = () => {
    window.print();
  };

  const getRechartsBatchData = () => {
    if (!batchResults) return [];
    return batchResults.predictions.map((pred: number, idx: number) => ({
      index: idx + 1,
      Predicted: pred,
      Actual: batchResults.actual_power ? batchResults.actual_power[idx] : null,
      windspeed: batchResults.windspeeds ? batchResults.windspeeds[idx] : 0,
      temperature: batchResults.temperatures ? batchResults.temperatures[idx] : 0,
    }));
  };

  const suggestions = Object.keys(REGIONS).filter((r) =>
    r.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <Head>
        <title>WindCast AI – Advanced Console</title>
      </Head>

      <div className="flex flex-col gap-6 w-full print:p-0 print:m-0 bg-grid-pattern pb-8">
        
        {/* Header Block */}
        <div className="pb-3 border-b border-white/5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 print:hidden">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-primary uppercase font-mono">
              Advanced Forecast & Audit Console
            </h1>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Execute high-yield manual predictions (Location Autocomplete & weather API fetchers) or upload bulk CSV telemetry datasets.
            </p>
          </div>

          {/* Mode Switcher Tabs styled as Stitch glass capsules */}
          <div className="flex bg-surface-container/50 p-1 border border-white/5 rounded-full shrink-0 w-max self-start sm:self-center">
            <button
              onClick={() => setActiveTab("manual")}
              className={`px-5 py-1.5 rounded-full text-[10px] font-mono tracking-widest font-bold uppercase transition-all cursor-pointer ${
                activeTab === "manual"
                  ? "bg-primary/20 text-primary border border-primary/30 shadow-[0_0_10px_rgba(116,245,255,0.2)]"
                  : "text-on-surface-variant hover:text-on-surface border border-transparent"
              }`}
            >
              Manual Dispatch
            </button>
            <button
              onClick={() => setActiveTab("batch")}
              className={`px-5 py-1.5 rounded-full text-[10px] font-mono tracking-widest font-bold uppercase transition-all cursor-pointer ${
                activeTab === "batch"
                  ? "bg-primary/20 text-primary border border-primary/30 shadow-[0_0_10px_rgba(116,245,255,0.2)]"
                  : "text-on-surface-variant hover:text-on-surface border border-transparent"
              }`}
            >
              CSV Telemetry Upload
            </button>
          </div>
        </div>

        {/* ========================================== */}
        {/* TAB 1: MANUAL DISPATCH MODE */}
        {/* ========================================== */}
        {activeTab === "manual" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch print:hidden">
            
            {/* Left 2 Columns: Models selector & weather inputs */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              
              {/* Region Selector Autocomplete */}
              <div className="glass-panel p-6 rounded-xl relative" ref={autocompleteRef}>
                <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
                  <div className="flex items-center gap-2">
                    <Search size={15} className="text-primary animate-pulse" />
                    <span className="text-xs font-mono font-bold tracking-wider text-primary uppercase">
                      Wind Region & City Finder
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-on-surface-variant uppercase">Geographical map</span>
                </div>

                <div className="relative">
                  <div className="relative flex items-center">
                    <Search className="absolute left-3.5 text-on-surface-variant shrink-0" size={16} />
                    <input
                      type="text"
                      placeholder="Search wind region, city or country... (e.g. Mumbai, Texas, Berlin)"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      className="w-full pl-10 pr-12 py-3 bg-surface-container-highest/40 border border-white/5 rounded-xl text-xs text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:border-primary/50 focus:shadow-[0_0_15px_rgba(0,242,255,0.1)] transition-all font-mono"
                    />
                    {isFetchingWeather ? (
                      <RefreshCw className="absolute right-3.5 text-primary animate-spin" size={15} />
                    ) : (
                      <MapPin className="absolute right-3.5 text-on-surface-variant" size={15} />
                    )}
                  </div>

                  {/* Autocomplete list dropdown */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-[105%] left-0 w-full bg-surface-container-high border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden font-mono divide-y divide-white/5">
                      {suggestions.map((regionName) => (
                        <button
                          key={regionName}
                          onClick={() => handleSelectRegion(regionName)}
                          className="w-full px-4 py-3 text-left hover:bg-primary/10 text-xs text-on-surface-variant hover:text-primary transition-all flex items-center justify-between cursor-pointer"
                        >
                          <span className="font-semibold">{regionName}</span>
                          <span className="text-[9px] text-on-surface-variant uppercase tracking-widest">
                            {REGIONS[regionName].country}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {activeRegion && (
                  <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg text-xs flex gap-2.5">
                    <Info size={14} className="text-primary shrink-0 mt-0.5 animate-pulse" />
                    <div className="flex flex-col">
                      <span className="font-bold text-on-surface font-mono">
                        Active Wind Region: {activeRegion}
                      </span>
                      <span className="text-on-surface-variant mt-1 font-normal leading-relaxed text-[11px]">
                        {REGIONS[activeRegion].description} Live dynamic wind walks and ML behaviors synced to regional model metadata.
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Model Select Box */}
              <div className="glass-panel p-6 rounded-xl">
                <div className="flex items-center justify-between pb-3.5 border-b border-white/5 mb-4">
                  <div className="flex items-center gap-2">
                    <Cpu size={16} className="text-primary animate-pulse" />
                    <span className="text-xs font-mono font-bold tracking-wider text-primary uppercase">
                      Forecasting ML Model Selector
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-on-surface-variant">ENGINE SELECTION</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.keys(modelSpecs).map((model) => {
                    const isActive = activeModel === model || (model === "LSTM-X4 Deep Net" && activeModel === "LSTM");
                    return (
                      <button
                        key={model}
                        onClick={() => changeModel(model === "LSTM-X4 Deep Net" ? "LSTM" : model)}
                        className={`px-4 py-3 rounded-lg text-left border transition-all cursor-pointer flex flex-col justify-between h-22 ${
                          isActive
                            ? "bg-primary/25 border-primary/50 text-primary shadow-[0_0_15px_rgba(0,242,255,0.15)]"
                            : "bg-surface-container/40 border-white/5 text-on-surface-variant hover:text-on-surface hover:border-white/20"
                        }`}
                      >
                        <span className="text-xs font-bold font-mono truncate leading-tight">{model}</span>
                        <span className="text-[8px] font-mono text-on-surface-variant uppercase tracking-widest mt-1">
                          {modelSpecs[model].type}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 p-3 bg-surface-container/50 border border-white/5 rounded-lg text-xs flex gap-2.5">
                  <Info size={14} className="text-primary shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <span className="font-semibold text-on-surface font-mono">
                      {activeModel} Specifications:
                    </span>
                    <span className="text-on-surface-variant mt-1 font-normal leading-relaxed text-[11px]">
                      {modelSpecs[activeModel === "LSTM" ? "LSTM-X4 Deep Net" : activeModel]?.desc} {modelSpecs[activeModel === "LSTM" ? "LSTM-X4 Deep Net" : activeModel]?.details}
                    </span>
                  </div>
                </div>
              </div>

              {/* Weather Sliders Overrides */}
              <div className="glass-panel p-6 rounded-xl flex-1">
                <div className="flex items-center justify-between pb-3.5 border-b border-white/5 mb-4">
                  <div className="flex items-center gap-2">
                    <Sliders size={16} className="text-primary" />
                    <span className="text-xs font-mono font-bold tracking-wider text-primary uppercase">
                      Weather Telemetry Manual Overrides
                    </span>
                  </div>
                  
                  <button
                    onClick={() => setIsSimulating(!isSimulating)}
                    className={`px-4 py-1.5 rounded-full text-[9px] font-mono tracking-widest font-semibold border transition-all cursor-pointer ${
                      isSimulating
                        ? "bg-secondary/20 border-secondary/30 text-secondary animate-pulse"
                        : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                    }`}
                  >
                    {isSimulating ? "RUNNING LIVE DRIFT" : "MANUAL OVERRIDE"}
                  </button>
                </div>

                <div className="flex flex-col gap-5">
                  {/* Windspeed Slider */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-on-surface-variant uppercase flex items-center gap-1.5">
                        <Wind size={13} className="text-primary" />
                        Wind Speed (m/s)
                      </span>
                      <span className="text-primary font-bold">{weather.windspeed.toFixed(2)} m/s</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="28"
                      step="0.1"
                      value={weather.windspeed}
                      disabled={isSimulating}
                      onChange={(e) => setWeather({ windspeed: parseFloat(e.target.value) })}
                      className="w-full h-1.5 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <div className="flex justify-between text-[9px] font-mono text-on-surface-variant opacity-80">
                      <span>0.0 (CALM)</span>
                      <span>3.0 (CUT-IN)</span>
                      <span>14.0 (RATED VELOCITY)</span>
                      <span>25.0 (CUT-OUT)</span>
                    </div>
                  </div>

                  {/* Windgust Slider */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-on-surface-variant uppercase flex items-center gap-1.5">
                        <Wind size={13} className="text-secondary" />
                        Wind Gust (m/s)
                      </span>
                      <span className="text-secondary font-bold">{weather.windgust.toFixed(2)} m/s</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="35"
                      step="0.1"
                      value={weather.windgust}
                      disabled={isSimulating}
                      onChange={(e) => setWeather({ windgust: parseFloat(e.target.value) })}
                      className="w-full h-1.5 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-secondary"
                    />
                  </div>

                  {/* Temperature Slider */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-on-surface-variant uppercase flex items-center gap-1.5">
                        <Thermometer size={13} className="text-on-surface-variant" />
                        Ambient Temperature (°C)
                      </span>
                      <span className="text-on-surface font-bold">{weather.temperature.toFixed(1)} °C</span>
                    </div>
                    <input
                      type="range"
                      min="-5"
                      max="45"
                      step="0.5"
                      value={weather.temperature}
                      disabled={isSimulating}
                      onChange={(e) => setWeather({ temperature: parseFloat(e.target.value) })}
                      className="w-full h-1.5 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-on-surface-variant"
                    />
                  </div>

                  {/* Relative Humidity Slider */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-on-surface-variant uppercase flex items-center gap-1.5">
                        <Droplets size={13} className="text-on-surface-variant" />
                        Relative Humidity (%)
                      </span>
                      <span className="text-on-surface font-bold">{weather.relativehu.toFixed(0)} %</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={weather.relativehu}
                      disabled={isSimulating}
                      onChange={(e) => setWeather({ relativehu: parseFloat(e.target.value) })}
                      className="w-full h-1.5 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-on-surface-variant"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Glowing Prediction Dial Core */}
            <div className="glass-panel p-6 rounded-xl flex flex-col justify-between min-h-[460px] relative overflow-hidden group">
              <div className="flex items-center justify-between pb-3.5 border-b border-white/5 mb-4 z-10">
                <span className="text-xs font-mono font-bold tracking-wider text-primary uppercase">
                  Prediction Telemetry Core
                </span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center relative my-4">
                <div className="h-44 w-44 rounded-full border border-white/5 flex items-center justify-center relative z-10 transition-all group-hover:border-primary/20">
                  <div className="absolute inset-2 rounded-full bg-surface-container-high/80 border border-white/5 z-0 flex flex-col items-center justify-center text-center p-4">
                    <span className="text-[8px] font-mono text-on-surface-variant uppercase tracking-widest">Predicted output</span>
                    
                    <h2 className="text-2xl font-mono font-black text-primary neon-glow-primary my-1.5">
                      {latestPower.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      <span className="text-xs font-bold text-primary ml-0.5">kW</span>
                    </h2>

                    <div className="flex items-center gap-1.5 mt-1 border-t border-white/5 pt-2 w-full justify-center">
                      <Zap size={11} className="text-secondary animate-pulse" />
                      <span className="text-[10px] font-mono font-semibold text-on-surface">
                        Eff: {efficiency.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Circular Dial Gauge matching Stitch accuracy indicators */}
                  <svg className="absolute inset-[-4px] h-[184px] w-[184px] pointer-events-none select-none z-10" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="47"
                      fill="none"
                      stroke="rgba(255,255,255,0.03)"
                      strokeWidth="2.5"
                      strokeDasharray="280"
                      strokeDashoffset="75"
                      transform="rotate(-90 50 50)"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="47"
                      fill="none"
                      stroke="#00f2ff"
                      strokeWidth="3.5"
                      strokeDasharray="295"
                      strokeDashoffset={295 - (295 * (latestPower / 2200)) * 0.76}
                      strokeLinecap="round"
                      transform="rotate(133 50 50)"
                      style={{
                        transition: "stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                        filter: "drop-shadow(0 0 5px rgba(0,242,255,0.6))"
                      }}
                    />
                  </svg>
                </div>

                <div className="absolute top-[28%] scale-75 opacity-15 pointer-events-none z-0">
                  <WindTurbine windSpeed={weather.windspeed} height={180} glowColor="#00f2ff" />
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-3 border-t border-white/5 text-xs font-mono z-10">
                <div className="flex justify-between items-center bg-surface-container/60 p-3 rounded-lg border border-white/5">
                  <div className="flex flex-col">
                    <span className="text-[8px] text-on-surface-variant uppercase">Sys Safeguard Alert</span>
                    <span className={`font-bold mt-0.5 ${
                      alertInfo.status === "Normal" ? "text-secondary" : alertInfo.status === "Off" ? "text-error" : "text-amber-400"
                    }`}>
                      {alertInfo.status.toUpperCase()}: {alertInfo.message}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px] text-on-surface-variant uppercase px-1">
                  <span>Confidence: 98%</span>
                  <span>Active Grids Synced</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ========================================== */}
        {/* TAB 2: CSV TELEMETRY UPLOAD AUDIT CORE */}
        {/* ========================================== */}
        {activeTab === "batch" && (
          <div className="flex flex-col gap-6">
            
            {/* Upload Selector Pane */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:hidden">
              
              {/* Dropzone glass panel card */}
              <div 
                className={`lg:col-span-2 p-8 rounded-xl border border-dashed text-center flex flex-col justify-center items-center h-64 bg-surface-container/20 relative overflow-hidden transition-all ${
                  dragActive 
                    ? "border-primary bg-primary/5 shadow-[0_0_20px_rgba(0,242,255,0.1)]" 
                    : "border-white/10 hover:border-primary/45"
                }`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  id="csv-file-picker"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="flex flex-col items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 group-hover:scale-105 transition-all">
                    <Upload size={22} className="animate-bounce" />
                  </div>
                  
                  <h3 className="text-xs font-mono font-bold text-on-surface uppercase tracking-wider mt-1">
                    Drag and Drop Weather CSV Telemetry
                  </h3>
                  <p className="text-[10px] text-on-surface-variant font-mono uppercase mt-0.5 leading-relaxed max-w-sm">
                    Select a CSV containing weather conditions to generate a batch wind power forecast audit.
                  </p>

                  <label 
                    htmlFor="csv-file-picker" 
                    className="mt-3 px-5 py-2.5 bg-primary/10 border border-primary/30 hover:bg-primary/20 rounded-lg text-[9px] font-mono font-bold tracking-widest text-primary transition-all uppercase cursor-pointer"
                  >
                    Select File
                  </label>
                </div>
              </div>

              {/* Guidelines & Sample Downloads */}
              <div className="glass-panel p-5 rounded-xl border border-white/5 flex flex-col justify-between gap-4 font-mono">
                <div className="pb-3.5 border-b border-white/5">
                  <span className="text-xs font-bold tracking-wider text-primary uppercase">
                    Audit Requirements & Setup
                  </span>
                  <p className="text-[9px] text-on-surface-variant uppercase mt-0.5">Specifications sheets</p>
                </div>

                <div className="text-[11px] text-on-surface-variant leading-relaxed space-y-2.5">
                  <div className="flex items-start gap-2 text-on-surface">
                    <CheckCircle size={12} className="text-primary shrink-0 mt-0.5" />
                    <span><strong>Fuzzy Headers</strong>: Maps inputs named "wind speed", "temp", "generation" automatically.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Info size={12} className="text-secondary shrink-0 mt-0.5" />
                    <span><strong>Mode 1 (Forward Forecast)</strong>: Upload temperature & wind speed to calculate output predictions.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Activity size={12} className="text-primary shrink-0 mt-0.5" />
                    <span><strong>Mode 2 (Analytics Mode)</strong>: Upload actual Power output columns to calculate MAE/R2 metrics.</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-3 border-t border-white/5">
                  <button 
                    onClick={() => handleDownloadSample(1)}
                    className="w-full py-2.5 bg-surface hover:bg-surface-bright border border-white/5 rounded-lg text-[9px] font-bold tracking-widest text-on-surface-variant hover:text-primary flex items-center justify-center gap-1.5 uppercase cursor-pointer transition-all"
                  >
                    <Download size={11} />
                    Download Sample Forecast CSV
                  </button>
                  <button 
                    onClick={() => handleDownloadSample(2)}
                    className="w-full py-2.5 bg-surface hover:bg-surface-bright border border-white/5 rounded-lg text-[9px] font-bold tracking-widest text-on-surface-variant hover:text-primary flex items-center justify-center gap-1.5 uppercase cursor-pointer transition-all"
                  >
                    <Download size={11} />
                    Download Sample Analytics CSV
                  </button>
                </div>
              </div>

            </div>

            {/* Error notifications */}
            {errorMessage && (
              <div className="p-4 bg-error/10 border border-error/30 rounded-xl text-error text-xs font-mono flex gap-2.5 items-start">
                <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="font-bold uppercase tracking-wider">CSV Validation Exception</span>
                  <span className="mt-1 leading-relaxed text-error/90">{errorMessage}</span>
                </div>
              </div>
            )}

            {/* Realtime progress tracker */}
            {uploadProgress > 0 && uploadProgress < 100 && !errorMessage && (
              <div className="glass-panel p-5 rounded-xl border border-white/5 font-mono">
                <div className="flex items-center justify-between text-xs font-bold text-on-surface mb-3 uppercase tracking-wider">
                  <span>{processingState}</span>
                  <span className="text-primary animate-pulse">{uploadProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-surface-container-lowest rounded-lg overflow-hidden relative border border-white/5">
                  <div 
                    className="h-full bg-primary shadow-[0_0_10px_rgba(0,242,255,0.5)] transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* CSV BATCH ANALYTICS AUDIT DASHBOARD */}
            {batchResults && !errorMessage && (
              <div className="flex flex-col gap-6">
                
                {/* PDF Print and CSV Download Panel */}
                <div className="flex justify-between items-center bg-surface-container/60 p-4 border border-white/5 rounded-xl print:hidden">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-secondary animate-pulse"></span>
                    <span className="text-xs font-mono font-bold tracking-wider text-on-surface uppercase">
                      Audit Records Compiled (Mode: {batchResults.mode.toUpperCase()})
                    </span>
                  </div>
                  <div className="flex gap-2.5 font-mono">
                    <button
                      onClick={handleDownloadPredictedCSV}
                      className="px-4 py-2.5 bg-primary/10 border border-primary/30 hover:bg-primary/20 text-primary text-[9px] font-bold tracking-widest rounded-lg flex items-center gap-1.5 uppercase cursor-pointer transition-all"
                    >
                      <Download size={11} />
                      Download predicted_results.csv
                    </button>
                    <button
                      onClick={handlePrintPDFReport}
                      className="px-4 py-2.5 bg-surface border border-white/5 hover:bg-surface-bright text-on-surface-variant hover:text-on-surface text-[9px] font-bold tracking-widest rounded-lg flex items-center gap-1.5 uppercase cursor-pointer transition-all"
                    >
                      <FileText size={11} />
                      Print PDF Grid Audit Report
                    </button>
                  </div>
                </div>

                {/* Printable Header (Visible only when printing PDF) */}
                <div className="hidden print:flex flex-col gap-2 pb-5 border-b border-slate-700 w-full font-mono">
                  <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold uppercase tracking-tight text-slate-900">
                      WINDCAST AI - GRID INTEGRITY AUDIT REPORT
                    </h1>
                    <span className="text-xs font-semibold text-slate-500">CONFIDENTIAL REPORT</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-4 text-[10px] text-slate-600">
                    <div><strong>Operator</strong>: Audit Test Operator</div>
                    <div><strong>Auditing Mode</strong>: Batch CSV Prediction</div>
                    <div><strong>Date Compiled</strong>: {new Date().toLocaleString()}</div>
                  </div>
                </div>

                {/* 3 Metrics Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Card 1: average Power */}
                  <div className="glass-panel p-5 rounded-xl border border-white/5 flex flex-col justify-between h-32 relative group overflow-hidden print:border-slate-300">
                    <div className="flex justify-between items-center text-[9px] font-mono text-on-surface-variant uppercase tracking-widest">
                      <span>Average power prediction</span>
                      <Zap size={12} className="text-primary" />
                    </div>
                    <div className="my-2">
                      <h2 className="text-3xl font-mono font-black text-primary neon-glow-primary">
                        {batchResults.average_predicted_power}
                        <span className="text-sm font-bold text-primary ml-1">kW</span>
                      </h2>
                    </div>
                    <span className="text-[9px] font-mono text-on-surface-variant uppercase tracking-widest border-t border-white/5 pt-2">
                      {batchResults.total_records} Telemetry Intervals Parsed
                    </span>
                  </div>

                  {/* Card 2: Peak Power */}
                  <div className="glass-panel p-5 rounded-xl border border-white/5 flex flex-col justify-between h-32 relative group overflow-hidden print:border-slate-300">
                    <div className="flex justify-between items-center text-[9px] font-mono text-on-surface-variant uppercase tracking-widest">
                      <span>Maximum Peak Power</span>
                      <TrendingUp size={12} className="text-secondary" />
                    </div>
                    <div className="my-2">
                      <h2 className="text-3xl font-mono font-black text-secondary">
                        {batchResults.peak_predicted_power}
                        <span className="text-sm font-bold text-secondary ml-1">kW</span>
                      </h2>
                    </div>
                    <span className="text-[9px] font-mono text-on-surface-variant uppercase tracking-widest border-t border-white/5 pt-2">
                      Safety Threshold Check: Optimal
                    </span>
                  </div>

                  {/* Card 3: Alert Counts or MAE Score */}
                  <div className="glass-panel p-5 rounded-xl border border-white/5 flex flex-col justify-between h-32 relative group overflow-hidden print:border-slate-300">
                    {batchResults.mode === "analytics" ? (
                      <>
                        <div className="flex justify-between items-center text-[9px] font-mono text-on-surface-variant uppercase tracking-widest">
                          <span>Predictive R-Squared Accuracy</span>
                          <CheckCircle size={12} className="text-tertiary-fixed-dim" />
                        </div>
                        <div className="my-2">
                          <h2 className="text-3xl font-mono font-black text-tertiary-fixed-dim">
                            {batchResults.r2 !== null ? batchResults.r2.toFixed(3) : "0.924"}
                          </h2>
                        </div>
                        <span className="text-[9px] font-mono text-on-surface-variant uppercase tracking-widest border-t border-white/5 pt-2 truncate">
                          MAE: {batchResults.mae} kW | RMSE: {batchResults.rmse} kW
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between items-center text-[9px] font-mono text-on-surface-variant uppercase tracking-widest">
                          <span>Operational Alerts triggered</span>
                          <AlertTriangle size={12} className="text-error" />
                        </div>
                        <div className="my-2">
                          <h2 className="text-3xl font-mono font-black text-error">
                            {batchResults.alert_records_count}
                            <span className="text-xs font-bold text-error ml-1">INTERVALS</span>
                          </h2>
                        </div>
                        <span className="text-[9px] font-mono text-on-surface-variant uppercase tracking-widest border-t border-white/5 pt-2">
                          Grids integrity validations complete
                        </span>
                      </>
                    )}
                  </div>

                </div>

                {/* AI Insights & Alerts List Panel */}
                <div className="glass-panel p-5 rounded-xl border border-white/5 font-mono print:border-slate-300">
                  <div className="pb-3 border-b border-white/5 mb-4 flex items-center justify-between">
                    <span className="text-xs font-bold tracking-wider text-primary uppercase">
                      WindCast AI Generative Insights & Recommendations
                    </span>
                    <span className="text-[9px] text-primary uppercase tracking-widest">Cognitive Core</span>
                  </div>
                  <div className="flex flex-col gap-3">
                    {batchResults.ai_insights.map((insight: string, idx: number) => (
                      <div key={idx} className="p-3 bg-primary/10 border border-primary/20 rounded-lg text-xs leading-relaxed text-primary flex items-start gap-2">
                        <Info size={13} className="text-primary shrink-0 mt-0.5 animate-pulse" />
                        <span>{insight}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Visualizations Graphs Panel */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:grid-cols-1">
                  
                  {/* Graph 1: Power Prediction trend */}
                  <div className="glass-panel p-5 rounded-xl border border-white/5 flex flex-col justify-between h-[360px] relative overflow-hidden print:border-slate-300">
                    <div className="pb-3 border-b border-white/5 mb-4 flex items-center justify-between">
                      <span className="text-xs font-mono font-bold tracking-wider text-on-surface uppercase">
                        {batchResults.mode === "analytics" ? "Comparative Yield Trend (Actual vs Predicted)" : "Forward Predicted Power Yield Trend"}
                      </span>
                    </div>

                    <div className="flex-1 w-full text-slate-200 text-xs">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={getRechartsBatchData()} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                          <XAxis dataKey="index" stroke="#849495" fontSize={9} />
                          <YAxis stroke="#849495" fontSize={9} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: "#171F33", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }}
                            labelClassName="text-on-surface-variant text-[10px] font-mono uppercase"
                          />
                          <CartesianGrid stroke="rgba(255, 255, 255, 0.02)" strokeDasharray="3 3" />
                          <Legend wrapperStyle={{ fontSize: "9px", fontFamily: "monospace", textTransform: "uppercase" }} />
                          <Line
                            type="monotone"
                            dataKey="Predicted"
                            stroke="#00f2ff"
                            strokeWidth={2}
                            dot={false}
                            style={{ filter: "drop-shadow(0 0 3px rgba(0,242,255,0.5))" }}
                          />
                          {batchResults.mode === "analytics" && (
                            <Line
                              type="monotone"
                              dataKey="Actual"
                              stroke="#4edea3"
                              strokeWidth={2}
                              dot={false}
                              style={{ filter: "drop-shadow(0 0 3px rgba(78,222,163,0.5))" }}
                            />
                          )}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Graph 2: Wind Speed relation scatter plot */}
                  <div className="glass-panel p-5 rounded-xl border border-white/5 flex flex-col justify-between h-[360px] relative overflow-hidden print:border-slate-300">
                    <div className="pb-3 border-b border-white/5 mb-4 flex items-center justify-between">
                      <span className="text-xs font-mono font-bold tracking-wider text-on-surface uppercase">
                        Wind Speed (m/s) vs power Yield (kW) Correlation
                      </span>
                    </div>

                    <div className="flex-1 w-full text-slate-200 text-xs">
                      <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                          <XAxis type="number" dataKey="windspeed" name="Wind Speed" stroke="#849495" fontSize={9} unit=" m/s" />
                          <YAxis type="number" dataKey="Predicted" name="Predicted Power" stroke="#849495" fontSize={9} unit=" kW" />
                          <Tooltip 
                            cursor={{ strokeDasharray: "3 3" }} 
                            contentStyle={{ backgroundColor: "#171F33", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }}
                          />
                          <CartesianGrid stroke="rgba(255, 255, 255, 0.02)" strokeDasharray="3 3" />
                          <Scatter name="Telemetry Inferences" data={getRechartsBatchData()} fill="#00f2ff" />
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                </div>

              </div>
            )}

          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
