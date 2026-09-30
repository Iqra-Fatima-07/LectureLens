import React, { useEffect, useState } from 'react';
import { detectEngineCapabilities } from '../../engine/EngineCapabilities';
import { EngineCapabilities } from '../../types';
import {
  Cpu,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Zap,
  Server,
  Laptop,
} from 'lucide-react';

export const ArchitecturePage: React.FC = () => {
  const [capabilities, setCapabilities] = useState<EngineCapabilities | null>(null);

  useEffect(() => {
    detectEngineCapabilities().then(setCapabilities);
  }, []);

  const verifiedModels = [
    {
      task: 'Speech Recognition',
      model: 'Whisper Tiny (English)',
      source: 'Qualcomm AI Hub / HuggingFace',
      runtime: 'ONNX Runtime (QNN EP)',
      quantization: 'INT8 (W8A8)',
      browserSupport: 'Yes (WebGPU / WASM)',
      snapdragonTarget: 'Hexagon NPU (HTP)',
      status: 'Verified on AI Hub',
    },
    {
      task: 'Multilingual ASR',
      model: 'Whisper Base (Multilingual)',
      source: 'Qualcomm AI Hub / HuggingFace',
      runtime: 'ONNX Runtime (QNN EP)',
      quantization: 'INT8 (W8A8)',
      browserSupport: 'Yes (WebGPU / WASM)',
      snapdragonTarget: 'Hexagon NPU (HTP)',
      status: 'Verified on AI Hub',
    },
    {
      task: 'Local Summarization',
      model: 'Llama 3.2 3B Instruct',
      source: 'Qualcomm AI Hub',
      runtime: 'Qualcomm AI Runtime (QNN)',
      quantization: 'INT4 (W4A16)',
      browserSupport: 'Verification required (WebGPU / WebLLM)',
      snapdragonTarget: 'Hexagon NPU (HTP)',
      status: 'Verified on AI Hub',
    },
    {
      task: 'Academic Q&A / Reasoning',
      model: 'Phi-3.5-mini Instruct',
      source: 'Qualcomm AI Hub / Microsoft',
      runtime: 'ONNX Runtime (QNN EP)',
      quantization: 'INT4 (W4A16)',
      browserSupport: 'Verification required',
      snapdragonTarget: 'Hexagon NPU (HTP)',
      status: 'Verified on AI Hub',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Title */}
      <div className="pb-4 border-b border-[#E5E0D8] dark:border-[#2A2825]">
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono-code font-semibold bg-[#C8102E]/10 text-[#C8102E] border border-[#C8102E]/20 mb-1.5">
          <Cpu className="w-3 h-3" />
          <span>Qualcomm® Snapdragon® Architecture</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#121212] dark:text-[#F2EFE9]">
          Hardware Execution Pipelines & Snapdragon NPU Roadmap
        </h1>
        <p className="text-xs text-[#666666] dark:text-[#99958F] mt-0.5">
          Comparing the current verified in-browser pipeline with the native Snapdragon NPU deployment target.
        </p>
      </div>

      {/* Side-by-Side Pipeline Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline 1: Current In-Browser Execution */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#1A1918] border border-emerald-300 dark:border-emerald-900/60 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Laptop className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-sm font-bold text-[#121212] dark:text-[#F2EFE9]">
                Current In-Browser Execution Path
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono-code font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Active / Shipped
            </span>
          </div>

          <p className="text-xs text-[#666666] dark:text-[#99958F] leading-relaxed">
            Runs client-side inside Microsoft Edge or Google Chrome on Windows on Arm without native C++ compilation or drivers.
          </p>

          {/* Diagram */}
          <div className="space-y-2 font-mono-code text-xs">
            <div className="p-2.5 rounded-lg bg-black/5 dark:bg-black/30 border border-[#E5E0D8]/60 dark:border-[#2A2825] flex items-center justify-between">
              <span className="font-semibold text-[#121212] dark:text-[#F2EFE9]">Audio Stream</span>
              <span className="text-[10px] text-[#666666] dark:text-[#99958F]">MediaRecorder API</span>
            </div>
            <div className="flex justify-center text-[#666666] dark:text-[#99958F]">↓ 16kHz mono (30s chunks)</div>
            <div className="p-2.5 rounded-lg bg-black/5 dark:bg-black/30 border border-[#E5E0D8]/60 dark:border-[#2A2825] flex items-center justify-between">
              <span className="font-semibold text-[#121212] dark:text-[#F2EFE9]">Whisper ONNX</span>
              <span className="text-[10px] text-[#666666] dark:text-[#99958F]">Transformers.js</span>
            </div>
            <div className="flex justify-center text-[#666666] dark:text-[#99958F]">↓ hardware acceleration</div>
            <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-emerald-800 dark:text-emerald-300">
              <span className="font-semibold">WebGPU (fallback: WASM SIMD)</span>
              <span className="text-[10px]">Browser Shader Compute</span>
            </div>
            <div className="flex justify-center text-[#666666] dark:text-[#99958F]">↓ timestamped segments</div>
            <div className="p-2.5 rounded-lg bg-black/5 dark:bg-black/30 border border-[#E5E0D8]/60 dark:border-[#2A2825] flex items-center justify-between">
              <span className="font-semibold text-[#121212] dark:text-[#F2EFE9]">Local IndexedDB & Search</span>
              <span className="text-[10px] text-[#666666] dark:text-[#99958F]">idb + Local Lexical Index</span>
            </div>
          </div>
        </div>

        {/* Pipeline 2: Snapdragon NPU Target */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#1A1918] border border-[#C8102E]/30 dark:border-[#C8102E]/40 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#C8102E]" />
              <h3 className="text-sm font-bold text-[#121212] dark:text-[#F2EFE9]">
                Snapdragon® NPU Deployment Target
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono-code font-semibold bg-[#C8102E]/10 text-[#C8102E] border border-[#C8102E]/25">
              Integration Target
            </span>
          </div>

          <p className="text-xs text-[#666666] dark:text-[#99958F] leading-relaxed">
            Deployment target for Snapdragon® X Elite / Plus laptops (e.g. HP OmniBook X) using native ONNX Runtime QNN Execution Provider.
          </p>

          {/* Diagram */}
          <div className="space-y-2 font-mono-code text-xs">
            <div className="p-2.5 rounded-lg bg-black/5 dark:bg-black/30 border border-[#E5E0D8]/60 dark:border-[#2A2825] flex items-center justify-between">
              <span className="font-semibold text-[#121212] dark:text-[#F2EFE9]">Audio Stream</span>
              <span className="text-[10px] text-[#666666] dark:text-[#99958F]">Native Buffer / IPC</span>
            </div>
            <div className="flex justify-center text-[#666666] dark:text-[#99958F]">↓ Qualcomm AI Hub model</div>
            <div className="p-2.5 rounded-lg bg-black/5 dark:bg-black/30 border border-[#E5E0D8]/60 dark:border-[#2A2825] flex items-center justify-between">
              <span className="font-semibold text-[#121212] dark:text-[#F2EFE9]">ONNX Runtime (ort-qnn)</span>
              <span className="text-[10px] text-[#666666] dark:text-[#99958F]">QNN Execution Provider</span>
            </div>
            <div className="flex justify-center text-[#666666] dark:text-[#99958F]">↓ direct driver call</div>
            <div className="p-2.5 rounded-lg bg-[#C8102E]/10 dark:bg-[#C8102E]/20 border border-[#C8102E]/30 text-[#C8102E] dark:text-red-400 flex items-center justify-between">
              <span className="font-semibold">Qualcomm® Hexagon™ NPU</span>
              <span className="text-[10px] font-bold">45 TOPS (HTP Backend)</span>
            </div>
            <div className="flex justify-center text-[#666666] dark:text-[#99958F]">↓ INT8 / INT4 inference</div>
            <div className="p-2.5 rounded-lg bg-black/5 dark:bg-black/30 border border-[#E5E0D8]/60 dark:border-[#2A2825] flex items-center justify-between">
              <span className="font-semibold text-[#121212] dark:text-[#F2EFE9]">Ultra-Low Power Copilot</span>
              <span className="text-[10px] text-[#666666] dark:text-[#99958F]">Sub-watt ASR & Offline LLM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Qualcomm Model Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#C8102E]" />
            <h3 className="text-sm font-semibold text-[#121212] dark:text-[#F2EFE9]">
              Qualcomm® AI Hub Verified Model Matrix
            </h3>
          </div>
          <span className="text-xs text-[#666666] dark:text-[#99958F] font-mono-code">
            Source: Qualcomm AI Hub Repository
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#E5E0D8] dark:border-[#2A2825] bg-white dark:bg-[#1A1918] shadow-sm">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E5E0D8] dark:border-[#2A2825] bg-[#FAF8F5] dark:bg-[#201F1E] font-mono-code text-[#666666] dark:text-[#99958F]">
                <th className="p-3">Task</th>
                <th className="p-3">Model</th>
                <th className="p-3">Runtime</th>
                <th className="p-3">Quantization</th>
                <th className="p-3">In-Browser Support</th>
                <th className="p-3">Snapdragon Target</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E0D8]/60 dark:divide-[#2A2825]/60 text-[#121212] dark:text-[#EAE6DF]">
              {verifiedModels.map((row, idx) => (
                <tr key={idx} className="hover:bg-black/[0.01] dark:hover:bg-white/[0.01]">
                  <td className="p-3 font-semibold">{row.task}</td>
                  <td className="p-3 font-mono-code text-[#C8102E] dark:text-red-400 font-medium">
                    {row.model}
                  </td>
                  <td className="p-3 font-mono-code">{row.runtime}</td>
                  <td className="p-3 font-mono-code">{row.quantization}</td>
                  <td className="p-3 font-mono-code">{row.browserSupport}</td>
                  <td className="p-3 font-mono-code font-medium">{row.snapdragonTarget}</td>
                  <td className="p-3 font-mono-code">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Snapdragon Roadmap */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#1A1918] border border-[#E5E0D8] dark:border-[#2A2825] shadow-sm space-y-4">
        <h3 className="text-sm font-semibold text-[#121212] dark:text-[#F2EFE9] flex items-center gap-2">
          <span>Snapdragon® AI Lab Strategic Roadmap</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[#FAF8F5] dark:bg-[#201F1E] border border-[#E5E0D8] dark:border-[#2A2825] space-y-2">
            <div className="font-mono-code font-bold text-[#C8102E]">Phase 1: Present (Shipped)</div>
            <p className="text-[#666666] dark:text-[#A8A49D]">
              Real client-side Whisper ONNX transcription with WebGPU hardware acceleration on Edge/Chrome, IndexedDB storage, and Gemini 2.5 Flash hybrid summarization.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[#FAF8F5] dark:bg-[#201F1E] border border-[#E5E0D8] dark:border-[#2A2825] space-y-2">
            <div className="font-mono-code font-bold text-[#C8102E]">Phase 2: WebNN + QNN Direct</div>
            <p className="text-[#666666] dark:text-[#A8A49D]">
              Connecting the documented <code className="font-mono-code">QualcommNPUEngine</code> adapter directly to W3C WebNN API with Qualcomm NPU Execution Provider to utilize the 45 TOPS Hexagon processor in browser.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[#FAF8F5] dark:bg-[#201F1E] border border-[#E5E0D8] dark:border-[#2A2825] space-y-2">
            <div className="font-mono-code font-bold text-[#C8102E]">Phase 3: Fully Offline SLM</div>
            <p className="text-[#666666] dark:text-[#A8A49D]">
              Deploying INT4 quantized Llama 3.2 3B or Phi-3.5-mini directly on Hexagon NPU for 100% offline grounded lecture Q&A without any cloud dependencies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
