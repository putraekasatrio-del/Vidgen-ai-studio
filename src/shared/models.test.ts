import test from 'node:test';
import assert from 'node:assert/strict';
import { AI_MODELS, validateGenerationParams, calculateCreditCost, getModelById, getModelsForMode } from './models.ts';
import type { VideoGenerationParams } from './types.ts';

test('AI_MODELS catalog contains required flagship models', () => {
  const modelIds = AI_MODELS.map((m) => m.id);
  assert.ok(modelIds.includes('veo-2'), 'Should include Google Veo 2');
  assert.ok(modelIds.includes('kling-2-0'), 'Should include Kling AI 2.0');
  assert.ok(modelIds.includes('seedance-v1'), 'Should include ByteDance Seedance v1');
  assert.ok(modelIds.includes('imagen-3-studio'), 'Should include Imagen 3 Studio');
  assert.ok(modelIds.includes('lipsync-syncnet'), 'Should include Lip Sync');
});

test('Veo 2 supports up to 15s duration and 4K resolution', () => {
  const veo = getModelById('veo-2');
  assert.ok(veo);
  assert.equal(veo.maxDuration, 15);
  assert.ok(veo.durationOptions.includes(15));
  assert.ok(veo.supportedResolutions.includes('4k'));
  assert.ok(veo.supportedRatios.includes('16:9'));
  assert.ok(veo.supportedRatios.includes('9:16'));
});

test('Seedance v1 supports vertical 9:16 format for TikTok/Shorts', () => {
  const seedance = getModelById('seedance-v1');
  assert.ok(seedance);
  assert.ok(seedance.supportedRatios.includes('9:16'));
  assert.equal(seedance.supportedResolutions.includes('4k'), false, 'Seedance does not claim 4K');
});

test('validateGenerationParams catches invalid prompt length', () => {
  const veo = getModelById('veo-2')!;
  const invalidParams: VideoGenerationParams = {
    mode: 'text-to-video',
    modelId: 'veo-2',
    prompt: 'hi',
    duration: 5,
    resolution: '1080p',
    aspectRatio: '16:9',
  };
  const errors = validateGenerationParams(invalidParams, veo);
  assert.ok(errors.some((e) => e.includes('minimal harus memiliki 3 karakter')));
});

test('validateGenerationParams catches unsupported duration for model', () => {
  const kling = getModelById('kling-2-0')!;
  const params: VideoGenerationParams = {
    mode: 'text-to-video',
    modelId: 'kling-2-0',
    prompt: 'Cyberpunk flying car zooming through neon metropolis',
    duration: 15, // Kling only supports 5 and 10
    resolution: '1080p',
    aspectRatio: '16:9',
  };
  const errors = validateGenerationParams(params, kling);
  assert.ok(errors.some((e) => e.includes('Durasi 15 detik tidak didukung oleh Kling AI 2.0 Pro')));
});

test('validateGenerationParams enforces image for image-to-video mode', () => {
  const veo = getModelById('veo-2')!;
  const params: VideoGenerationParams = {
    mode: 'image-to-video',
    modelId: 'veo-2',
    prompt: 'Animate this character walking forward gracefully',
    duration: 5,
    resolution: '1080p',
    aspectRatio: '16:9',
    // Missing referenceImageUrl
  };
  const errors = validateGenerationParams(params, veo);
  assert.ok(errors.some((e) => e.includes('Mode Image to Video membutuhkan gambar referensi')));
});

test('calculateCreditCost scales with duration and 4K resolution', () => {
  const veo = getModelById('veo-2')!;
  const base5s720p: VideoGenerationParams = {
    mode: 'text-to-video',
    modelId: 'veo-2',
    prompt: 'A majestic dragon in flight',
    duration: 5,
    resolution: '720p',
    aspectRatio: '16:9',
  };
  const baseCost = calculateCreditCost(base5s720p, veo);
  assert.equal(baseCost, 15);

  const high15s4k: VideoGenerationParams = {
    mode: 'text-to-video',
    modelId: 'veo-2',
    prompt: 'A majestic dragon in flight',
    duration: 15,
    resolution: '4k',
    aspectRatio: '16:9',
  };
  const highCost = calculateCreditCost(high15s4k, veo);
  // Base 15 + duration (10 * 1.5 = 15) + 4K surcharge (12) = 42
  assert.equal(highCost, 42);
  assert.ok(highCost > baseCost);
});

test('getModelsForMode returns correct models for lip sync', () => {
  const lipSyncModels = getModelsForMode('video-lip-sync');
  assert.ok(lipSyncModels.length >= 2);
  const ids = lipSyncModels.map((m) => m.id);
  assert.ok(ids.includes('lipsync-syncnet'));
  assert.ok(ids.includes('kling-2-0'));
});
