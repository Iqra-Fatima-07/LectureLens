import { EngineCapabilities } from '../types';

let cachedCapabilities: EngineCapabilities | null = null;

export async function detectEngineCapabilities(): Promise<EngineCapabilities> {
  if (cachedCapabilities) return cachedCapabilities;

  let hasWebGPU = false;
  let webGPUDeviceName: string | undefined;

  if (typeof navigator !== 'undefined' && 'gpu' in navigator && (navigator as any).gpu) {
    try {
      const adapter = await (navigator as any).gpu.requestAdapter();
      if (adapter) {
        hasWebGPU = true;
        // Check adapter info if available
        if (adapter.info) {
          webGPUDeviceName = adapter.info.description || adapter.info.architecture || adapter.info.vendor || 'WebGPU Device';
        } else {
          webGPUDeviceName = 'WebGPU Compatible Hardware';
        }
      }
    } catch {
      hasWebGPU = false;
    }
  }

  // Detect WASM SIMD support
  let hasWasmSIMD = false;
  try {
    hasWasmSIMD = typeof WebAssembly === 'object' && typeof WebAssembly.validate === 'function' &&
      WebAssembly.validate(new Uint8Array([
        0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00,
        0x01, 0x05, 0x01, 0x60, 0x00, 0x01, 0x7b, 0x03,
        0x02, 0x01, 0x00, 0x0a, 0x0a, 0x01, 0x08, 0x00,
        0xfd, 0x0c, 0x00, 0x00, 0x00, 0x00, 0x0b
      ]));
  } catch {
    hasWasmSIMD = false;
  }

  const hardwareConcurrency = typeof navigator !== 'undefined' ? (navigator.hardwareConcurrency || 4) : 4;
  const estimatedMemoryGb = (navigator as any).deviceMemory || undefined;

  cachedCapabilities = {
    hasWebGPU,
    webGPUDeviceName,
    hasWasmSIMD,
    hardwareConcurrency,
    estimatedMemoryGb,
    snapdragonNPUTarget: {
      name: 'Qualcomm® Hexagon™ NPU (Snapdragon® X Elite / Plus)',
      runtime: 'ONNX Runtime QNN Execution Provider (QNN EP)',
      status: 'integration-target',
      topsRating: '45 TOPS Peak NPU',
      recommendedQuantization: 'INT8 / INT4 (W8A8 / W4A16)',
    },
  };

  return cachedCapabilities;
}
