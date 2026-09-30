import {
  AudioInput,
  TranscriptionResult,
  InferenceEngine,
} from './InferenceEngine';
import { ModelSpec } from '../types';

/**
 * QualcommNPUEngine (Adapter Slot)
 * 
 * INTEGRATION TARGET ARCHITECTURE:
 * Designed for deployment on Snapdragon® X Elite / Snapdragon® X Plus AI PCs (e.g. HP OmniBook X).
 * 
 * Target Execution Pipeline:
 * [Audio Stream]
 *    ↓
 * [Native C++ / Electron / Edge Native Host (QNN Bridge)]
 *    ↓
 * [ONNX Runtime with QNN Execution Provider (ort-qnn)]
 *    ↓
 * [Qualcomm® AI Engine Direct SDK (libQnnHtp.so / QnnHtp.dll)]
 *    ↓
 * [Qualcomm® Hexagon™ NPU (45 TOPS)]
 * 
 * Current Browser Reality:
 * Web browsers (Edge/Chrome on Windows on Arm) execute WebGPU / WASM shaders.
 * Direct access to Qualcomm NPU (QNN driver) requires either:
 * 1. WebNN (W3C Web Neural Network API with NPU backend support) currently in development.
 * 2. Local background QNN daemon (IPC bridge / localhost websocket).
 * 
 * Non-negotiable rule: This engine is explicitly labeled as "Snapdragon NPU Integration Target".
 * It never fakes execution or displays simulated NPU metrics.
 */

export interface QNNOptions {
  backendType: 'HTP' | 'DSP' | 'GPU';
  quantizationPrecision: 'INT8' | 'INT4' | 'FP16';
  socTarget: 'Snapdragon_X_Elite' | 'Snapdragon_X_Plus';
  qnnSdkVersion: string;
}

export class QualcommNPUEngine implements Partial<InferenceEngine> {
  readonly id = 'qualcomm-qnn-npu-target';
  readonly name = 'Snapdragon® Hexagon™ NPU (QNN Adapter)';
  readonly type = 'snapdragon-npu-target' as const;

  readonly isConnected = false;
  readonly status = 'integration-target' as const;

  readonly targetHardware = {
    processor: 'Snapdragon® X Elite / Snapdragon® X Plus',
    npu: 'Qualcomm® Hexagon™ NPU',
    peakTops: '45 TOPS',
    architecture: 'ARM64 (Windows on Arm)',
    qnnExecutionProvider: 'QNN 2.20+ (HTP Backend)',
  };

  /**
   * Verified Qualcomm AI Hub Models targeted for this adapter
   */
  readonly verifiedTargetModels: ModelSpec[] = [
    {
      id: 'whisper-tiny-en-qnn',
      name: 'Whisper Tiny (Qualcomm AI Hub)',
      sizeMb: 39,
      params: '39M',
      quantization: 'INT8 (W8A8 / W8A16)',
      description: 'Optimized on Snapdragon Hexagon NPU for ultra-low latency on-device ASR.',
      hfRepo: 'qualcomm/whisper-tiny-en',
      targetNpuRepo: 'https://aihub.qualcomm.com/models/whisper_tiny_en',
    },
    {
      id: 'whisper-base-multilingual-qnn',
      name: 'Whisper Base Multilingual (Qualcomm AI Hub)',
      sizeMb: 74,
      params: '74M',
      quantization: 'INT8 (W8A8)',
      description: 'Multilingual speech recognition with English and Hindi support on Hexagon HTP.',
      hfRepo: 'qualcomm/whisper-base',
      targetNpuRepo: 'https://aihub.qualcomm.com/models/whisper_base_en',
    },
    {
      id: 'llama-3.2-3b-qnn',
      name: 'Llama 3.2 3B Instruct (Qualcomm AI Hub)',
      sizeMb: 1800,
      params: '3.21B',
      quantization: 'INT4 (W4A16 / G128)',
      description: 'Target for future offline local summarization and grounded Q&A on NPU.',
      hfRepo: 'qualcomm/Llama-3.2-3B-Instruct',
      targetNpuRepo: 'https://aihub.qualcomm.com/models/llama_v3_2_3b_instruct',
    },
    {
      id: 'phi-3.5-mini-qnn',
      name: 'Phi-3.5-mini Instruct (Qualcomm AI Hub)',
      sizeMb: 2100,
      params: '3.82B',
      quantization: 'INT4 (W4A16)',
      description: 'Target for high-reasoning STEM formula analysis on Snapdragon NPU.',
      hfRepo: 'qualcomm/Phi-3.5-mini-instruct',
      targetNpuRepo: 'https://aihub.qualcomm.com/models/phi_3_5_mini_instruct',
    },
  ];

  async checkNativeQNNRuntime(): Promise<{
    available: boolean;
    reason: string;
    deploymentGuideUrl: string;
  }> {
    // Check if a native local bridge or WebNN with NPU execution provider is available
    if (typeof (navigator as any).ml !== 'undefined') {
      try {
        const ml = (navigator as any).ml;
        // Check if NPU device type exists
        return {
          available: false,
          reason: 'WebNN API detected in browser, but Snapdragon NPU device provider requires Chrome Canary flag or native QNN runtime.',
          deploymentGuideUrl: '#architecture',
        };
      } catch {
        // Fall through
      }
    }

    return {
      available: false,
      reason: 'Standard browser runtime cannot directly invoke Qualcomm Hexagon QNN driver without native host bridge or WebNN NPU flag.',
      deploymentGuideUrl: '#architecture',
    };
  }

  async transcribe(audio: AudioInput): Promise<TranscriptionResult> {
    throw new Error(
      'Snapdragon NPU adapter is currently an integration target. Please use Browser Local (WebGPU/WASM) for current in-browser execution.'
    );
  }
}

export const qualcommNPUEngine = new QualcommNPUEngine();
