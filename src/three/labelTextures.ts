import * as THREE from 'three';

export interface StackFrameCardData {
  label: string;
  depth: number;
  statusText: string;
  expression: string;
  accentHex: string;
  headerBgHex: string;
  bgTopHex: string;
  bgBottomHex: string;
  valueHighlightHex?: string;
}

export interface VariableCardData {
  name: string;
  valueText: string;
  accentHex: string;
  valueHex: string;
  highlighted: boolean;
}

export interface SequenceBlockData {
  indexLabel: string;
  valueText: string;
  accentHex: string;
  valueHex: string;
  isNewest: boolean;
}

export interface OperationBannerData {
  title: string;
  equation: string;
  accentHex: string;
  equationHex: string;
}

function configureTexture(
  canvas: HTMLCanvasElement,
  maxAnisotropy: number
): THREE.CanvasTexture {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(16, Math.max(1, maxAnisotropy));
  texture.needsUpdate = true;
  return texture;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export function createGridFloorTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#060B18';
  ctx.fillRect(0, 0, size, size);

  const grad = ctx.createRadialGradient(
    size / 2,
    size / 2,
    40,
    size / 2,
    size / 2,
    size * 0.54
  );
  grad.addColorStop(0, 'rgba(6, 182, 212, 0.22)');
  grad.addColorStop(0.45, 'rgba(99, 102, 241, 0.12)');
  grad.addColorStop(0.85, 'rgba(6, 11, 24, 0.02)');
  grad.addColorStop(1, 'rgba(6, 11, 24, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const step = 64;
  ctx.lineWidth = 1.5;
  for (let i = 0; i <= size; i += step) {
    const isMajor = i % (step * 4) === 0;
    ctx.strokeStyle = isMajor
      ? 'rgba(56, 189, 248, 0.24)'
      : 'rgba(99, 102, 241, 0.11)';
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, size);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(size, i);
    ctx.stroke();
  }

  return configureTexture(canvas, maxAnisotropy);
}

export function createContactShadowTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createRadialGradient(
    size / 2,
    size / 2,
    10,
    size / 2,
    size / 2,
    size * 0.48
  );
  grad.addColorStop(0, 'rgba(2, 10, 7, 0.78)');
  grad.addColorStop(0.55, 'rgba(2, 10, 7, 0.34)');
  grad.addColorStop(1, 'rgba(2, 10, 7, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createParticleGlowTexture(): THREE.CanvasTexture {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(186, 230, 253, 1)');
  grad.addColorStop(0.35, 'rgba(56, 189, 248, 0.55)');
  grad.addColorStop(1, 'rgba(99, 102, 241, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createVariableFaceTexture(
  data: VariableCardData,
  maxAnisotropy: number
): THREE.CanvasTexture {
  const w = 640;
  const h = 400;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
  bgGrad.addColorStop(0, data.highlighted ? '#0E2854' : '#0A1A38');
  bgGrad.addColorStop(1, '#050D1E');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  drawRoundedRect(ctx, 16, 16, w - 32, h - 32, 26);
  ctx.strokeStyle = data.highlighted ? data.accentHex : 'rgba(125, 211, 252, 0.42)';
  ctx.lineWidth = data.highlighted ? 7 : 3.5;
  ctx.stroke();

  // Header strip
  ctx.fillStyle = data.highlighted
    ? 'rgba(34, 211, 238, 0.18)'
    : 'rgba(99, 102, 241, 0.16)';
  drawRoundedRect(ctx, 32, 32, w - 64, 86, 16);
  ctx.fill();

  ctx.fillStyle = data.accentHex;
  ctx.font = '700 36px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(data.name, w / 2, 75, w - 72);

  // Main Value
  ctx.fillStyle = data.valueHex;
  const len = data.valueText.length;
  const fontSize = len > 11 ? 58 : len > 7 ? 78 : 108;
  ctx.font = `700 ${fontSize}px "JetBrains Mono", monospace`;
  ctx.fillText(data.valueText, w / 2, 250, w - 56);

  return configureTexture(canvas, maxAnisotropy);
}

export function createStackFrameTexture(
  data: StackFrameCardData,
  maxAnisotropy: number
): THREE.CanvasTexture {
  const w = 1088;
  const h = 256;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, data.bgTopHex);
  grad.addColorStop(1, data.bgBottomHex);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  drawRoundedRect(ctx, 10, 10, w - 20, h - 20, 20);
  ctx.strokeStyle = data.accentHex;
  ctx.lineWidth = 6;
  ctx.stroke();

  // Header tint bar
  ctx.fillStyle = data.headerBgHex;
  drawRoundedRect(ctx, 24, 22, w - 48, 86, 14);
  ctx.fill();

  // Depth pill left
  ctx.fillStyle = 'rgba(6, 11, 24, 0.94)';
  drawRoundedRect(ctx, 36, 36, 98, 58, 12);
  ctx.fill();
  ctx.strokeStyle = data.accentHex;
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = data.accentHex;
  ctx.font = '700 32px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`D${data.depth}`, 85, 66);

  // Function signature
  ctx.fillStyle = '#F8FAFC';
  ctx.font = '700 42px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText(data.label, 156, 66, w - 410);

  // Status right
  ctx.fillStyle = data.accentHex;
  ctx.font = '700 28px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(data.statusText, w - 42, 66, 230);

  // Pending / Return expression
  ctx.fillStyle = data.valueHighlightHex ?? '#E2E8F0';
  const exprSize = data.expression.length > 36 ? 30 : 36;
  ctx.font = `600 ${exprSize}px "JetBrains Mono", monospace`;
  ctx.textAlign = 'left';
  ctx.fillText(data.expression, 38, 176, w - 76);

  return configureTexture(canvas, maxAnisotropy);
}

export function createSequenceBlockTexture(
  data: SequenceBlockData,
  maxAnisotropy: number
): THREE.CanvasTexture {
  const w = 320;
  const h = 320;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, data.isNewest ? '#0D365C' : '#0B1D3F');
  grad.addColorStop(1, '#050D1E');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  drawRoundedRect(ctx, 12, 12, w - 24, h - 24, 24);
  ctx.strokeStyle = data.accentHex;
  ctx.lineWidth = data.isNewest ? 8 : 4;
  ctx.stroke();

  ctx.fillStyle = data.accentHex;
  ctx.font = '700 36px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(data.indexLabel, w / 2, 76, w - 48);

  ctx.fillStyle = data.valueHex;
  const fontSize = data.valueText.length > 4 ? 62 : 92;
  ctx.font = `700 ${fontSize}px "JetBrains Mono", monospace`;
  ctx.fillText(data.valueText, w / 2, 198, w - 44);

  return configureTexture(canvas, maxAnisotropy);
}

export function createOperationBannerTexture(
  data: OperationBannerData,
  maxAnisotropy: number
): THREE.CanvasTexture {
  const w = 1152;
  const h = 216;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, w, 0);
  grad.addColorStop(0, '#07122B');
  grad.addColorStop(0.5, '#0E2047');
  grad.addColorStop(1, '#121942');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  drawRoundedRect(ctx, 8, 8, w - 16, h - 16, 20);
  ctx.strokeStyle = data.accentHex;
  ctx.lineWidth = 4.5;
  ctx.stroke();

  ctx.fillStyle = data.accentHex;
  ctx.font = '700 30px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(data.title, w / 2, 58, w - 72);

  ctx.fillStyle = data.equationHex;
  const eqSize =
    data.equation.length > 46 ? 30 : data.equation.length > 34 ? 38 : data.equation.length > 24 ? 46 : 54;
  ctx.font = `700 ${eqSize}px "JetBrains Mono", monospace`;
  ctx.fillText(data.equation, w / 2, 140, w - 72);

  return configureTexture(canvas, maxAnisotropy);
}
