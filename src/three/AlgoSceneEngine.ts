import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { ExecutionStep, SimulationRun } from '../types/algorithm';
import {
  createContactShadowTexture,
  createGridFloorTexture,
  createOperationBannerTexture,
  createParticleGlowTexture,
  createSequenceBlockTexture,
  createStackFrameTexture,
  createVariableFaceTexture,
} from './labelTextures';

const _tmpVec3 = new THREE.Vector3();
const _camGoalPos = new THREE.Vector3();
const _camGoalTarget = new THREE.Vector3();
const _boundsMin = new THREE.Vector3();
const _boundsMax = new THREE.Vector3();

function detectSoftwareWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) ?? '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

function createBeveledSlabGeometry(
  width: number,
  height: number,
  depth: number,
  radius = 0.09,
  bevel = 0.032
): THREE.ExtrudeGeometry {
  const w = Math.max(0.08, width / 2 - bevel);
  const h = Math.max(0.08, height / 2 - bevel);
  const r = Math.min(radius, w * 0.4, h * 0.4);
  const shape = new THREE.Shape();
  shape.moveTo(-w + r, -h);
  shape.lineTo(w - r, -h);
  shape.quadraticCurveTo(w, -h, w, -h + r);
  shape.lineTo(w, h - r);
  shape.quadraticCurveTo(w, h, w - r, h);
  shape.lineTo(-w + r, h);
  shape.quadraticCurveTo(-w, h, -w, h - r);
  shape.lineTo(-w, -h + r);
  shape.quadraticCurveTo(-w, -h, -w + r, -h);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: Math.max(0.04, depth - bevel * 2),
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 2,
    curveSegments: 8,
  });
  geo.center();
  return geo;
}

interface AnimatedEntity {
  group: THREE.Group;
  targetPos: THREE.Vector3;
  targetScale: THREE.Vector3;
  halfExtents: THREE.Vector3;
  disposables: Array<{ dispose: () => void }>;
}

export class AlgoSceneEngine {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;
  private envTexture: THREE.Texture;
  private isSoftwareGl: boolean;
  private maxAnisotropy: number;

  private dynamicRoot: THREE.Group;
  private staticDisposables: Array<{ dispose: () => void }> = [];
  private activeEntities: AnimatedEntity[] = [];
  private pulseOrb: THREE.Mesh;
  private pulsePathCurve: THREE.CatmullRomCurve3 | null = null;
  private pulseProgress = 0;
  private ambientMotes: THREE.Points | null = null;

  private contactShadowTex: THREE.CanvasTexture;
  private clock = new THREE.Clock();
  private frameId = 0;
  private disposed = false;
  private userMovedCamera = false;
  private cameraAnimating = false;

  private resizeObserver: ResizeObserver;

  constructor(container: HTMLElement) {
    this.container = container;
    this.isSoftwareGl = detectSoftwareWebGL();

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.setPixelRatio(
      this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2)
    );
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.maxAnisotropy = this.renderer.capabilities.getMaxAnisotropy();

    const width = Math.max(300, container.clientWidth);
    const height = Math.max(360, container.clientHeight);
    this.renderer.setSize(width, height);
    this.renderer.domElement.style.display = 'block';
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.renderer.domElement.style.outline = 'none';
    container.appendChild(this.renderer.domElement);

    // Deep midnight navy laboratory environment
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x060b18);
    this.scene.fog = new THREE.FogExp2(0x060b18, 0.015);

    this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 140);
    this.camera.position.set(1.2, 5.2, 12.8);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = !this.isSoftwareGl;
    this.controls.dampingFactor = 0.06;
    this.controls.minDistance = 5;
    this.controls.maxDistance = 32;
    this.controls.maxPolarAngle = Math.PI * 0.47;
    this.controls.minPolarAngle = 0.18;
    this.controls.target.set(0, 2.0, 0);
    this.controls.addEventListener('start', () => {
      this.userMovedCamera = true;
      this.cameraAnimating = false;
    });

    // Studio reflection map
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    const roomEnv = new RoomEnvironment();
    this.envTexture = pmrem.fromScene(roomEnv, 0.04).texture;
    this.scene.environment = this.envTexture;
    roomEnv.dispose();
    pmrem.dispose();

    // Balanced studio lighting rig with warm key + cool sky-indigo fill + violet rim
    const hemi = new THREE.HemisphereLight(0x7dd3fc, 0x050a18, 0.95);
    this.scene.add(hemi);

    const keyLight = new THREE.DirectionalLight(0xfffbeb, 2.15);
    keyLight.position.set(7, 13, 9);
    if (!this.isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.camera.near = 1;
      keyLight.shadow.camera.far = 36;
      keyLight.shadow.camera.left = -11;
      keyLight.shadow.camera.right = 11;
      keyLight.shadow.camera.top = 11;
      keyLight.shadow.camera.bottom = -11;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    this.scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x818cf8, 1.3);
    rimLight.position.set(-8, 6, -7);
    this.scene.add(rimLight);

    const fillPoint = new THREE.PointLight(0x22d3ee, 1.35, 26, 1.4);
    fillPoint.position.set(0, 5.5, 5.5);
    this.scene.add(fillPoint);

    this.contactShadowTex = createContactShadowTexture();
    this.staticDisposables.push(this.contactShadowTex);
    this.buildLabStage();
    this.buildAmbientMotes();

    this.dynamicRoot = new THREE.Group();
    this.scene.add(this.dynamicRoot);

    // Subtle glowing data pulse orb
    const orbGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const orbMat = new THREE.MeshStandardMaterial({
      color: 0xfde047,
      emissive: 0x22d3ee,
      emissiveIntensity: 2.0,
      roughness: 0.15,
      metalness: 0.1,
    });
    this.pulseOrb = new THREE.Mesh(orbGeo, orbMat);
    this.pulseOrb.visible = false;
    this.scene.add(this.pulseOrb);
    this.staticDisposables.push(orbGeo, orbMat);

    if (!this.isSoftwareGl) {
      this.renderer.compile(this.scene, this.camera);
    }

    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(this.container);

    this.startLoop();
  }

  private buildLabStage(): void {
    const floorTex = createGridFloorTexture(this.maxAnisotropy);
    const floorGeo = new THREE.PlaneGeometry(48, 48);
    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTex,
      roughness: 0.88,
      metalness: 0.12,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = !this.isSoftwareGl;
    this.scene.add(floor);

    // Wide sapphire metallic stage disk
    const plinthGeo = new THREE.CylinderGeometry(7.2, 7.65, 0.16, 64);
    const plinthMat = new THREE.MeshStandardMaterial({
      color: 0x0b1733,
      roughness: 0.45,
      metalness: 0.65,
    });
    const plinth = new THREE.Mesh(plinthGeo, plinthMat);
    plinth.position.y = 0.08;
    plinth.receiveShadow = !this.isSoftwareGl;
    this.scene.add(plinth);

    // Outer calibration ring (electric cyan)
    const outerRingGeo = new THREE.TorusGeometry(7.32, 0.03, 12, 84);
    const outerRingMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x0891b2,
      emissiveIntensity: 0.9,
      roughness: 0.25,
      metalness: 0.8,
    });
    const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
    outerRing.rotation.x = Math.PI / 2;
    outerRing.position.y = 0.17;
    this.scene.add(outerRing);

    // Inner calibration ring (indigo-violet)
    const innerRingGeo = new THREE.TorusGeometry(5.1, 0.018, 10, 72);
    const innerRingMat = new THREE.MeshStandardMaterial({
      color: 0x818cf8,
      emissive: 0x6366f1,
      emissiveIntensity: 0.7,
      roughness: 0.3,
      metalness: 0.75,
    });
    const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    innerRing.rotation.x = Math.PI / 2;
    innerRing.position.y = 0.172;
    this.scene.add(innerRing);

    this.staticDisposables.push(
      floorTex,
      floorGeo,
      floorMat,
      plinthGeo,
      plinthMat,
      outerRingGeo,
      outerRingMat,
      innerRingGeo,
      innerRingMat
    );
  }

  private buildAmbientMotes(): void {
    const count = 48;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 18;
      positions[i * 3 + 1] = 0.6 + Math.random() * 6.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 14;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const glowTex = createParticleGlowTexture();
    const mat = new THREE.PointsMaterial({
      map: glowTex,
      size: 0.16,
      transparent: true,
      opacity: 0.26,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const points = new THREE.Points(geo, mat);
    this.scene.add(points);
    this.ambientMotes = points;
    this.staticDisposables.push(geo, glowTex, mat);
  }

  public resetCamera(): void {
    this.userMovedCamera = false;
    this.cameraAnimating = true;
  }

  public updateExecutionState(run: SimulationRun, stepIndex: number): void {
    this.clearDynamicEntities();
    const step = run.steps[stepIndex];
    if (!step) return;

    if (run.approach === 'recursive') {
      this.buildRecursiveScene(run, step);
    } else {
      this.buildIterativeScene(run, step);
    }

    this.computeAutoCameraGoal();
    if (!this.userMovedCamera) {
      this.cameraAnimating = true;
    }
  }

  private computeAutoCameraGoal(): void {
    if (this.activeEntities.length === 0) {
      _camGoalPos.set(1.0, 5.2, 12.2);
      _camGoalTarget.set(0, 1.8, 0);
      return;
    }

    _boundsMin.set(Infinity, Infinity, Infinity);
    _boundsMax.set(-Infinity, -Infinity, -Infinity);

    for (const ent of this.activeEntities) {
      const p = ent.targetPos;
      const e = ent.halfExtents;
      _boundsMin.x = Math.min(_boundsMin.x, p.x - e.x);
      _boundsMin.y = Math.min(_boundsMin.y, p.y - e.y);
      _boundsMin.z = Math.min(_boundsMin.z, p.z - e.z);
      _boundsMax.x = Math.max(_boundsMax.x, p.x + e.x);
      _boundsMax.y = Math.max(_boundsMax.y, p.y + e.y);
      _boundsMax.z = Math.max(_boundsMax.z, p.z + e.z);
    }

    const centerX = (_boundsMin.x + _boundsMax.x) * 0.5;
    const centerY = (_boundsMin.y + _boundsMax.y) * 0.5;
    const centerZ = (_boundsMin.z + _boundsMax.z) * 0.5;

    const spanX = Math.max(4.5, _boundsMax.x - _boundsMin.x);
    const spanY = Math.max(3.5, _boundsMax.y - _boundsMin.y);
    const spanZ = Math.max(2.5, _boundsMax.z - _boundsMin.z);

    const fovRad = THREE.MathUtils.degToRad(this.camera.fov);
    const aspect = Math.max(0.75, this.camera.aspect);
    const horizFovRad = 2 * Math.atan(Math.tan(fovRad / 2) * aspect);

    const distV = (spanY * 0.58) / Math.tan(fovRad / 2);
    const distH = (spanX * 0.56) / Math.tan(horizFovRad / 2);
    const dist = Math.max(8.8, distV, distH) + spanZ * 0.45;

    _camGoalTarget.set(centerX, centerY, centerZ);
    // Slight subtle 3/4 isometric perspective (azimuth +9 deg, elevation +18 deg)
    _camGoalPos.set(
      centerX + dist * 0.15,
      centerY + dist * 0.31,
      centerZ + dist * 0.94
    );
  }

  private clearDynamicEntities(): void {
    for (const entity of this.activeEntities) {
      this.dynamicRoot.remove(entity.group);
      for (const d of entity.disposables) {
        d.dispose();
      }
    }
    this.activeEntities = [];
    this.pulsePathCurve = null;
    this.pulseOrb.visible = false;
  }

  private addContactShadow(
    parent: THREE.Group,
    width: number,
    depth: number,
    yOffset: number,
    disposables: Array<{ dispose: () => void }>
  ): void {
    const geo = new THREE.PlaneGeometry(width, depth);
    const mat = new THREE.MeshBasicMaterial({
      map: this.contactShadowTex,
      transparent: true,
      opacity: 0.48,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = yOffset;
    parent.add(mesh);
    disposables.push(geo, mat);
  }

  private createVariableBlock(
    name: string,
    valueText: string,
    highlighted: boolean,
    x: number,
    y: number,
    z: number
  ): void {
    const group = new THREE.Group();
    const disposables: Array<{ dispose: () => void }> = [];

    const accentHex = highlighted ? '#22D3EE' : '#7DD3FC';
    const valueHex = highlighted ? '#FDE047' : '#FFFFFF';

    // 1. Elevated Terrace Column Support down to stage (when y > 0.2)
    if (y > 0.25) {
      const colH = y + 0.05;
      const colGeo = new THREE.CylinderGeometry(0.45, 0.58, colH, 16);
      const colMat = new THREE.MeshStandardMaterial({
        color: 0x09132b,
        roughness: 0.5,
        metalness: 0.7,
      });
      const col = new THREE.Mesh(colGeo, colMat);
      col.position.y = -colH / 2;
      group.add(col);
      disposables.push(colGeo, colMat);
    }

    // 2. Brushed Sapphire Plinth
    const baseGeo = createBeveledSlabGeometry(2.12, 0.16, 1.32, 0.08, 0.025);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x0f2147,
      roughness: 0.32,
      metalness: 0.8,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = 0.08;
    group.add(baseMesh);

    // 3. Main Beveled Chassis
    const bodyGeo = createBeveledSlabGeometry(1.94, 1.22, 1.06, 0.1, 0.035);
    const bodyMat = new THREE.MeshPhysicalMaterial({
      color: highlighted ? 0x123266 : 0x0c1e42,
      roughness: 0.35,
      metalness: 0.5,
      clearcoat: 0.35,
      clearcoatRoughness: 0.25,
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.position.y = 0.77;
    bodyMesh.castShadow = !this.isSoftwareGl;
    bodyMesh.receiveShadow = !this.isSoftwareGl;
    group.add(bodyMesh);

    // 4. Glowing Top Trim Rail (Electric Cyan vs Indigo)
    const trimColor = new THREE.Color(highlighted ? 0x22d3ee : 0x6366f1);
    const trimGeo = new THREE.BoxGeometry(1.98, 0.075, 1.1);
    const trimMat = new THREE.MeshStandardMaterial({
      color: trimColor,
      emissive: trimColor,
      emissiveIntensity: highlighted ? 1.45 : 0.45,
      roughness: 0.22,
      metalness: 0.65,
    });
    const trimMesh = new THREE.Mesh(trimGeo, trimMat);
    trimMesh.position.y = 1.41;
    group.add(trimMesh);

    // 5. Crisp Front CanvasTexture Display
    const faceTex = createVariableFaceTexture(
      { name, valueText, accentHex, valueHex, highlighted },
      this.maxAnisotropy
    );
    const faceGeo = new THREE.PlaneGeometry(1.74, 1.08);
    const faceMat = new THREE.MeshBasicMaterial({ map: faceTex, fog: false });
    const faceMesh = new THREE.Mesh(faceGeo, faceMat);
    faceMesh.position.set(0, 0.77, 0.545);
    group.add(faceMesh);

    disposables.push(
      baseGeo,
      baseMat,
      bodyGeo,
      bodyMat,
      trimGeo,
      trimMat,
      faceTex,
      faceGeo,
      faceMat
    );

    group.position.set(x, highlighted ? y + 0.22 : y, z);
    group.scale.setScalar(highlighted ? 0.92 : 0.97);
    this.dynamicRoot.add(group);

    this.activeEntities.push({
      group,
      targetPos: new THREE.Vector3(x, highlighted ? y + 0.14 : y, z),
      targetScale: new THREE.Vector3(
        highlighted ? 1.05 : 1,
        highlighted ? 1.05 : 1,
        highlighted ? 1.05 : 1
      ),
      halfExtents: new THREE.Vector3(1.15, 1.45, 0.7),
      disposables,
    });
  }

  private createOperationBanner(
    title: string,
    equation: string,
    accentHex: string,
    equationHex: string,
    x: number,
    y: number,
    z: number
  ): void {
    const group = new THREE.Group();
    const disposables: Array<{ dispose: () => void }> = [];

    const frameGeo = createBeveledSlabGeometry(5.5, 1.06, 0.24, 0.09, 0.028);
    const frameMat = new THREE.MeshPhysicalMaterial({
      color: 0x0d1d42,
      roughness: 0.32,
      metalness: 0.72,
      clearcoat: 0.3,
    });
    const frameMesh = new THREE.Mesh(frameGeo, frameMat);
    group.add(frameMesh);

    const railColor = new THREE.Color(accentHex);
    const railGeo = new THREE.BoxGeometry(5.54, 0.055, 0.26);
    const railMat = new THREE.MeshStandardMaterial({
      color: railColor,
      emissive: railColor,
      emissiveIntensity: 1.15,
      roughness: 0.2,
    });
    const railTop = new THREE.Mesh(railGeo, railMat);
    railTop.position.y = 0.55;
    group.add(railTop);

    const tex = createOperationBannerTexture(
      { title, equation, accentHex, equationHex },
      this.maxAnisotropy
    );
    const screenGeo = new THREE.PlaneGeometry(5.24, 0.96);
    const screenMat = new THREE.MeshBasicMaterial({ map: tex, fog: false });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.z = 0.135;
    group.add(screen);

    disposables.push(frameGeo, frameMat, railGeo, railMat, tex, screenGeo, screenMat);

    group.position.set(x, y + 0.22, z);
    group.scale.setScalar(0.94);
    this.dynamicRoot.add(group);

    this.activeEntities.push({
      group,
      targetPos: new THREE.Vector3(x, y, z),
      targetScale: new THREE.Vector3(1, 1, 1),
      halfExtents: new THREE.Vector3(2.85, 0.6, 0.25),
      disposables,
    });
  }

  private createFlowArc(
    from: THREE.Vector3,
    to: THREE.Vector3,
    arcHeight: number,
    colorHex: string,
    attachPulse = false
  ): void {
    const group = new THREE.Group();
    const disposables: Array<{ dispose: () => void }> = [];

    const mid = from.clone().lerp(to, 0.5);
    mid.y += arcHeight;

    const curve = new THREE.CatmullRomCurve3([from, mid, to]);
    const tubeGeo = new THREE.TubeGeometry(curve, 28, 0.045, 10, false);
    const col = new THREE.Color(colorHex);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: col,
      emissive: col,
      emissiveIntensity: 1.35,
      roughness: 0.22,
    });
    const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
    group.add(tubeMesh);

    const coneGeo = new THREE.ConeGeometry(0.12, 0.28, 12);
    const cone = new THREE.Mesh(coneGeo, tubeMat);
    cone.position.copy(to);
    const tangent = curve.getTangent(1).normalize();
    cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tangent);
    group.add(cone);

    disposables.push(tubeGeo, tubeMat, coneGeo);
    this.dynamicRoot.add(group);

    this.activeEntities.push({
      group,
      targetPos: new THREE.Vector3(0, 0, 0),
      targetScale: new THREE.Vector3(1, 1, 1),
      halfExtents: new THREE.Vector3(0.2, 0.2, 0.2),
      disposables,
    });

    if (attachPulse) {
      this.pulsePathCurve = curve;
      this.pulseProgress = 0;
      this.pulseOrb.visible = true;
      (this.pulseOrb.material as THREE.MeshStandardMaterial).color.set(colorHex);
      (this.pulseOrb.material as THREE.MeshStandardMaterial).emissive.set(colorHex);
    }
  }

  /**
   * Renders sequence blocks on a staggered stadium terrace (rear row higher, front row lower)
   * so front blocks NEVER hide rear blocks' numerical labels.
   */
  private createSequenceTowers(
    items: Array<{ label: string; value: number; display: string; isNewest: boolean }>,
    originX: number,
    originZ: number,
    maxPerRow: number,
    baseAccentHex: string
  ): void {
    const spacingX = 1.18;
    const spacingZ = 1.35;
    const totalRows = Math.ceil(items.length / maxPerRow);
    const maxVal = Math.max(1, ...items.map((i) => i.value));

    items.forEach((item, idx) => {
      const row = Math.floor(idx / maxPerRow);
      const col = idx % maxPerRow;
      const rowCount = Math.min(maxPerRow, items.length - row * maxPerRow);

      // Rear rows step upward in Y so front blocks never occlude rear faceplates
      const terraceY = (totalRows - 1 - row) * 0.55;
      const x = originX + (col - (rowCount - 1) / 2) * spacingX;
      const z = originZ + row * spacingZ;

      const barH = 0.58 + Math.sqrt(Math.max(0, item.value) / maxVal) * 0.92;
      const group = new THREE.Group();
      const disposables: Array<{ dispose: () => void }> = [];

      const accentHex = item.isNewest ? '#22D3EE' : baseAccentHex;
      const valueHex = item.isNewest ? '#FDE047' : '#FFFFFF';

      if (terraceY > 0.1) {
        const riserGeo = new THREE.BoxGeometry(0.92, terraceY, 0.92);
        const riserMat = new THREE.MeshStandardMaterial({
          color: 0x08132b,
          roughness: 0.6,
          metalness: 0.5,
        });
        const riser = new THREE.Mesh(riserGeo, riserMat);
        riser.position.y = -terraceY / 2;
        group.add(riser);
        disposables.push(riserGeo, riserMat);
      }

      const padGeo = new THREE.BoxGeometry(0.96, 0.1, 0.96);
      const padMat = new THREE.MeshStandardMaterial({
        color: 0x0f2147,
        roughness: 0.38,
        metalness: 0.72,
      });
      const pad = new THREE.Mesh(padGeo, padMat);
      pad.position.y = 0.05;
      group.add(pad);

      const barGeo = createBeveledSlabGeometry(0.84, barH, 0.84, 0.07, 0.022);
      const colColor = new THREE.Color(item.isNewest ? 0x22d3ee : 0x3b82f6);
      const barMat = new THREE.MeshPhysicalMaterial({
        color: item.isNewest ? 0x0e4463 : 0x0f2c59,
        emissive: colColor,
        emissiveIntensity: item.isNewest ? 0.5 : 0.14,
        roughness: 0.3,
        metalness: 0.45,
        clearcoat: 0.3,
      });
      const bar = new THREE.Mesh(barGeo, barMat);
      bar.position.y = 0.1 + barH / 2;
      bar.castShadow = !this.isSoftwareGl;
      group.add(bar);

      const tex = createSequenceBlockTexture(
        {
          indexLabel: item.label,
          valueText: item.display,
          accentHex,
          valueHex,
          isNewest: item.isNewest,
        },
        this.maxAnisotropy
      );
      const faceGeo = new THREE.PlaneGeometry(0.76, 0.76);
      const faceMat = new THREE.MeshBasicMaterial({ map: tex, fog: false });
      const face = new THREE.Mesh(faceGeo, faceMat);
      face.position.set(0, 0.1 + Math.max(0.42, barH * 0.52), 0.44);
      group.add(face);

      disposables.push(padGeo, padMat, barGeo, barMat, tex, faceGeo, faceMat);

      group.position.set(x, 0.16 + terraceY, z);
      group.scale.set(1, item.isNewest ? 0.4 : 0.95, 1);
      this.dynamicRoot.add(group);

      this.activeEntities.push({
        group,
        targetPos: new THREE.Vector3(x, 0.16 + terraceY, z),
        targetScale: new THREE.Vector3(1, 1, 1),
        halfExtents: new THREE.Vector3(0.55, barH * 0.75 + 0.25, 0.55),
        disposables,
      });
    });
  }

  private buildIterativeScene(run: SimulationRun, step: ExecutionStep): void {
    const vars = step.variables;
    const spacing = 2.6;
    const startX = -((vars.length - 1) * spacing) / 2;

    // Rear Elevated Variable Terrace (y = 2.15, z = -2.1) sits cleanly above foreground blocks
    const varY = 2.15;
    const varZ = -2.1;

    vars.forEach((v, idx) => {
      this.createVariableBlock(
        v.name,
        typeof v.value === 'number' ? v.value.toLocaleString() : String(v.value),
        Boolean(v.highlight),
        startX + idx * spacing,
        varY,
        varZ
      );
    });

    // High Centered Operation Banner (y = 4.65, z = -2.1)
    if (step.multiplicationOp) {
      const { left, right, result } = step.multiplicationOp;
      this.createOperationBanner(
        'MULTIPLICATION UPDATE',
        `${left.toLocaleString()} × ${right.toLocaleString()} = ${result.toLocaleString()}`,
        '#22D3EE',
        '#FDE047',
        0,
        4.65,
        varZ
      );
      if (vars.length >= 3) {
        this.createFlowArc(
          new THREE.Vector3(startX + 2 * spacing, varY + 1.55, varZ),
          new THREE.Vector3(startX + 1 * spacing, varY + 1.65, varZ),
          0.95,
          '#22D3EE',
          true
        );
      }
    } else if (step.shiftOp) {
      const { prevA, prevB, nextVal, newA, newB } = step.shiftOp;
      this.createOperationBanner(
        'SLIDING WINDOW SHIFT',
        `next = ${prevA} + ${prevB} = ${nextVal}   |   a←${newA}, b←${newB}`,
        '#A78BFA',
        '#FFFFFF',
        0,
        4.65,
        varZ
      );
      if (vars.length >= 4) {
        this.createFlowArc(
          new THREE.Vector3(startX + 2 * spacing, varY + 1.55, varZ),
          new THREE.Vector3(startX + 1 * spacing, varY + 1.65, varZ),
          0.9,
          '#22D3EE',
          true
        );
        this.createFlowArc(
          new THREE.Vector3(startX + 3 * spacing, varY + 1.55, varZ),
          new THREE.Vector3(startX + 2 * spacing, varY + 1.65, varZ),
          0.9,
          '#A78BFA',
          false
        );
      }
    } else if (step.isFinal && step.stepOutputText) {
      this.createOperationBanner(
        'EXECUTION COMPLETE',
        step.stepOutputText,
        '#22D3EE',
        '#FDE047',
        0,
        4.65,
        varZ
      );
    } else {
      this.createOperationBanner(
        run.definition.title.toUpperCase(),
        step.phaseLabel,
        '#7DD3FC',
        '#FFFFFF',
        0,
        4.65,
        varZ
      );
    }

    // Foreground Terraced Sequence Blocks (z = +0.95 .. +2.3)
    if (run.algorithm === 'factorial' && step.factorsUsed && step.factorsUsed.length > 0) {
      const items = [
        { label: 'init', value: 1, display: '1', isNewest: false },
        ...step.factorsUsed.map((f, i) => ({
          label: `i=${f}`,
          value: f,
          display: `×${f}`,
          isNewest: i === step.factorsUsed!.length - 1 && step.phase === 'compute',
        })),
      ];
      this.createSequenceTowers(items, 0, 0.95, 7, '#7DD3FC');
    }

    if (run.algorithm === 'fibonacci' && step.sequenceOutput && step.sequenceOutput.length > 0) {
      const items = step.sequenceOutput.map((val, idx) => ({
        label: `F${idx}`,
        value: Math.max(1, val),
        display: String(val),
        isNewest: idx === step.sequenceOutput!.length - 1 && step.phase === 'output',
      }));
      this.createSequenceTowers(items, 0, 0.95, 8, '#818CF8');
    }
  }

  private buildRecursiveScene(run: SimulationRun, step: ExecutionStep): void {
    const frames = step.stackFrames ?? [];
    const hasSideFib =
      run.algorithm === 'fibonacci' && step.sequenceOutput !== undefined;
    const hasSideUnwind =
      run.algorithm === 'factorial' && Boolean(step.multiplicationOp);

    const maxPerColumn = 7;
    const twoColumnStack = frames.length > maxPerColumn;

    // Position stack cleanly on the left if paired with side panels/towers
    const stackCenterX = hasSideFib || hasSideUnwind ? -2.75 : 0;
    const col1X = twoColumnStack ? stackCenterX - 2.35 : stackCenterX;
    const col2X = stackCenterX + 2.35;

    // 1. main() Caller Anchor Platform (proportioned to match banner texture aspect ratio)
    const baseGroup = new THREE.Group();
    const baseDisposables: Array<{ dispose: () => void }> = [];
    const anchorGeo = createBeveledSlabGeometry(4.45, 0.74, 1.65, 0.1, 0.03);
    const anchorMat = new THREE.MeshPhysicalMaterial({
      color: 0x0c1e45,
      roughness: 0.35,
      metalness: 0.75,
      clearcoat: 0.3,
    });
    const anchorMesh = new THREE.Mesh(anchorGeo, anchorMat);
    anchorMesh.position.y = 0.53;
    baseGroup.add(anchorMesh);

    const anchorTex = createOperationBannerTexture(
      {
        title: 'CALLER ROOT',
        equation:
          frames.length === 0 && step.isFinal
            ? `main() ← ${step.stepOutputText ?? 'Returned'}`
            : 'main() stack base',
        accentHex: frames.length === 0 && step.isFinal ? '#22D3EE' : '#818CF8',
        equationHex: frames.length === 0 && step.isFinal ? '#FDE047' : '#FFFFFF',
      },
      this.maxAnisotropy
    );
    const anchorFaceGeo = new THREE.PlaneGeometry(4.15, 0.66);
    const anchorFaceMat = new THREE.MeshBasicMaterial({ map: anchorTex, fog: false });
    const anchorFace = new THREE.Mesh(anchorFaceGeo, anchorFaceMat);
    anchorFace.position.set(0, 0.53, 0.84);
    baseGroup.add(anchorFace);

    this.addContactShadow(baseGroup, 5.0, 2.2, 0.165, baseDisposables);
    baseDisposables.push(anchorGeo, anchorMat, anchorTex, anchorFaceGeo, anchorFaceMat);
    baseGroup.position.set(col1X, 0, 0);
    this.dynamicRoot.add(baseGroup);
    this.activeEntities.push({
      group: baseGroup,
      targetPos: new THREE.Vector3(col1X, 0, 0),
      targetScale: new THREE.Vector3(1, 1, 1),
      halfExtents: new THREE.Vector3(2.3, 0.65, 0.9),
      disposables: baseDisposables,
    });

    // 2. Stack Frame Slabs (always generous height & zero overlap)
    const frameSpacing = 1.18;
    const slabH = 0.94;
    const framePositions: THREE.Vector3[] = [];

    frames.forEach((frame, idx) => {
      const col = idx < maxPerColumn ? 0 : 1;
      const rowInCol = idx < maxPerColumn ? idx : idx - maxPerColumn;
      const x = col === 0 ? col1X : col2X;
      const y = 1.48 + rowInCol * frameSpacing;
      // Stagger Column 2 slightly forward/sideways so no arrow crosses a face
      const z = col === 0 ? 0 : 0.15;
      framePositions.push(new THREE.Vector3(x, y, z));

      const isTop = idx === frames.length - 1;

      const palette =
        frame.status === 'base'
          ? {
              accent: '#FDE047',
              headerBg: 'rgba(250, 204, 21, 0.18)',
              top: '#251C4D',
              bottom: '#0E0B26',
              statusText: 'BASE CASE',
              exprHex: '#FDE047',
              bodyColor: 0x2a1f59,
            }
          : frame.status === 'returning'
            ? {
                accent: '#22D3EE',
                headerBg: 'rgba(34, 211, 238, 0.18)',
                top: '#0D3354',
                bottom: '#07172B',
                statusText: 'UNWINDING',
                exprHex: '#FDE047',
                bodyColor: 0x0f3b61,
              }
            : isTop
              ? {
                  accent: '#38BDF8',
                  headerBg: 'rgba(56, 189, 248, 0.2)',
                  top: '#113063',
                  bottom: '#071630',
                  statusText: 'ACTIVE FRAME',
                  exprHex: '#FFFFFF',
                  bodyColor: 0x13356b,
                }
              : {
                  accent: '#A5B4FC',
                  headerBg: 'rgba(129, 140, 248, 0.16)',
                  top: '#0D1B3F',
                  bottom: '#070E24',
                  statusText: 'WAITING',
                  exprHex: '#FFFFFF',
                  bodyColor: 0x0c1a3a,
                };

      const group = new THREE.Group();
      const disposables: Array<{ dispose: () => void }> = [];

      const slabGeo = createBeveledSlabGeometry(4.25, slabH, 1.38, 0.09, 0.032);
      const slabMat = new THREE.MeshPhysicalMaterial({
        color: palette.bodyColor,
        roughness: 0.34,
        metalness: 0.5,
        clearcoat: 0.35,
      });
      const slab = new THREE.Mesh(slabGeo, slabMat);
      slab.castShadow = !this.isSoftwareGl;
      slab.receiveShadow = !this.isSoftwareGl;
      group.add(slab);

      const railCol = new THREE.Color(palette.accent);
      const railGeo = new THREE.BoxGeometry(4.3, 0.065, 1.42);
      const railMat = new THREE.MeshStandardMaterial({
        color: railCol,
        emissive: railCol,
        emissiveIntensity: isTop || frame.status === 'base' ? 1.45 : 0.4,
        roughness: 0.2,
      });
      const topRail = new THREE.Mesh(railGeo, railMat);
      topRail.position.y = slabH / 2 + 0.01;
      group.add(topRail);

      const pylonGeo = new THREE.CylinderGeometry(0.085, 0.085, slabH * 0.86, 12);
      const pylon = new THREE.Mesh(pylonGeo, railMat);
      pylon.position.set(-2.19, 0, 0);
      group.add(pylon);

      const tex = createStackFrameTexture(
        {
          label: frame.label,
          depth: frame.depth,
          statusText: palette.statusText,
          expression: frame.pendingExpression ?? 'Executing...',
          accentHex: palette.accent,
          headerBgHex: palette.headerBg,
          bgTopHex: palette.top,
          bgBottomHex: palette.bottom,
          valueHighlightHex: palette.exprHex,
        },
        this.maxAnisotropy
      );
      const faceGeo = new THREE.PlaneGeometry(4.02, slabH * 0.89);
      const faceMat = new THREE.MeshBasicMaterial({ map: tex, fog: false });
      const face = new THREE.Mesh(faceGeo, faceMat);
      face.position.z = 0.71;
      group.add(face);

      disposables.push(
        slabGeo,
        slabMat,
        railGeo,
        railMat,
        pylonGeo,
        tex,
        faceGeo,
        faceMat
      );

      group.position.set(x, isTop ? y + 0.45 : y, z);
      group.scale.setScalar(isTop ? 0.9 : 0.97);
      this.dynamicRoot.add(group);

      this.activeEntities.push({
        group,
        targetPos: new THREE.Vector3(x, y, z),
        targetScale: new THREE.Vector3(
          isTop ? 1.04 : 1,
          isTop ? 1.04 : 1,
          isTop ? 1.04 : 1
        ),
        halfExtents: new THREE.Vector3(2.25, slabH * 0.6, 0.78),
        disposables,
      });

      // Flow connector arrow along right edge of column (never covering labels)
      if (idx > 0) {
        const prevPos = framePositions[idx - 1];
        const isCrossCol = idx === maxPerColumn;
        const isUnwindStep = step.phase === 'unwind' && idx === frames.length - 1;

        if (isCrossCol) {
          const fromPt = new THREE.Vector3(prevPos.x + 2.25, prevPos.y, prevPos.z);
          const toPt = new THREE.Vector3(x - 2.25, y, z);
          this.createFlowArc(fromPt, toPt, 0.55, '#A78BFA', isTop);
        } else {
          const sideX = x + 2.28;
          const fromPt = new THREE.Vector3(sideX, isUnwindStep ? y : prevPos.y, z);
          const toPt = new THREE.Vector3(sideX, isUnwindStep ? prevPos.y : y, z);
          this.createFlowArc(
            fromPt,
            toPt,
            0,
            isUnwindStep ? '#FDE047' : '#38BDF8',
            isTop
          );
        }
      }
    });

    // 3. Side Unwind Multiplication Banner (Factorial Recursive)
    if (run.algorithm === 'factorial' && step.multiplicationOp) {
      const { left, right, result } = step.multiplicationOp;
      const topFramePos = framePositions[framePositions.length - 1] ?? new THREE.Vector3(0, 2, 0);
      const bannerX = (twoColumnStack ? col2X : col1X) + 5.3;
      const bannerY = Math.max(2.0, topFramePos.y);

      this.createOperationBanner(
        'UNWIND RETURN VALUE',
        `${left.toLocaleString()} × ${right.toLocaleString()} = ${result.toLocaleString()}`,
        '#22D3EE',
        '#FDE047',
        bannerX,
        bannerY,
        0.2
      );
    }

    // 4. Side Tail-Recursive Fibonacci Parameters + Terraced Sequence Towers
    if (hasSideFib) {
      const sideX = (twoColumnStack ? col2X : col1X) + 5.35;

      if (step.tailTransition) {
        const t = step.tailTransition;
        this.createOperationBanner(
          'TAIL CALL PARAMETERS',
          `(${t.fromRem}, ${t.fromA}, ${t.fromB}) → (${t.toRem}, ${t.toA}, ${t.toB})`,
          '#A78BFA',
          '#FFFFFF',
          sideX,
          4.35,
          -0.25
        );
      } else if (step.phase === 'base') {
        this.createOperationBanner(
          'BASE CASE REACHED',
          'remaining == 0 → return',
          '#FDE047',
          '#FFFFFF',
          sideX,
          4.35,
          -0.25
        );
      } else if (step.isFinal && step.stepOutputText) {
        this.createOperationBanner(
          'FINAL FIBONACCI SEQUENCE',
          step.stepOutputText,
          '#22D3EE',
          '#FDE047',
          sideX,
          4.35,
          -0.25
        );
      } else {
        this.createOperationBanner(
          'TAIL-RECURSIVE HELPER',
          step.phaseLabel,
          '#7DD3FC',
          '#FFFFFF',
          sideX,
          4.35,
          -0.25
        );
      }

      if (step.sequenceOutput && step.sequenceOutput.length > 0) {
        const items = step.sequenceOutput.map((val, idx) => ({
          label: `F${idx}`,
          value: Math.max(1, val),
          display: String(val),
          isNewest: idx === step.sequenceOutput!.length - 1 && step.phase === 'output',
        }));
        this.createSequenceTowers(items, sideX, 0.55, 4, '#818CF8');
      }
    }
  }

  private handleResize(): void {
    if (this.disposed) return;
    const width = Math.max(300, this.container.clientWidth);
    const height = Math.max(360, this.container.clientHeight);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.computeAutoCameraGoal();
    if (!this.userMovedCamera) {
      this.cameraAnimating = true;
    }
  }

  private startLoop(): void {
    const tick = () => {
      if (this.disposed) return;
      const delta = Math.min(0.05, this.clock.getDelta());
      const elapsed = this.clock.elapsedTime;

      // Subtle floating forest laboratory dust motes
      if (this.ambientMotes) {
        this.ambientMotes.rotation.y = elapsed * 0.025;
      }

      // Exponentially damp every 3D entity toward its synchronized target transform
      for (const entity of this.activeEntities) {
        entity.group.position.x = THREE.MathUtils.damp(
          entity.group.position.x,
          entity.targetPos.x,
          10,
          delta
        );
        entity.group.position.y = THREE.MathUtils.damp(
          entity.group.position.y,
          entity.targetPos.y,
          10,
          delta
        );
        entity.group.position.z = THREE.MathUtils.damp(
          entity.group.position.z,
          entity.targetPos.z,
          10,
          delta
        );
        entity.group.scale.x = THREE.MathUtils.damp(
          entity.group.scale.x,
          entity.targetScale.x,
          10,
          delta
        );
        entity.group.scale.y = THREE.MathUtils.damp(
          entity.group.scale.y,
          entity.targetScale.y,
          10,
          delta
        );
        entity.group.scale.z = THREE.MathUtils.damp(
          entity.group.scale.z,
          entity.targetScale.z,
          10,
          delta
        );
      }

      // Animate pulse orb along active flow arc
      if (this.pulsePathCurve && this.pulseOrb.visible) {
        this.pulseProgress = (this.pulseProgress + delta * 0.85) % 1;
        this.pulsePathCurve.getPointAt(this.pulseProgress, _tmpVec3);
        this.pulseOrb.position.copy(_tmpVec3);
      }

      // Smooth auto-camera framing unless user manually orbited
      if (this.cameraAnimating && !this.userMovedCamera) {
        this.camera.position.x = THREE.MathUtils.damp(
          this.camera.position.x,
          _camGoalPos.x,
          6,
          delta
        );
        this.camera.position.y = THREE.MathUtils.damp(
          this.camera.position.y,
          _camGoalPos.y,
          6,
          delta
        );
        this.camera.position.z = THREE.MathUtils.damp(
          this.camera.position.z,
          _camGoalPos.z,
          6,
          delta
        );
        this.controls.target.x = THREE.MathUtils.damp(
          this.controls.target.x,
          _camGoalTarget.x,
          6,
          delta
        );
        this.controls.target.y = THREE.MathUtils.damp(
          this.controls.target.y,
          _camGoalTarget.y,
          6,
          delta
        );
        this.controls.target.z = THREE.MathUtils.damp(
          this.controls.target.z,
          _camGoalTarget.z,
          6,
          delta
        );

        if (
          this.camera.position.distanceTo(_camGoalPos) < 0.03 &&
          this.controls.target.distanceTo(_camGoalTarget) < 0.03
        ) {
          this.cameraAnimating = false;
        }
      }

      this.controls.update();
      this.renderer.render(this.scene, this.camera);

      if (this.isSoftwareGl) {
        this.scheduleAfterDraw(tick);
      } else {
        this.frameId = requestAnimationFrame(tick);
      }
    };

    if (this.isSoftwareGl) {
      this.scheduleAfterDraw(tick);
    } else {
      this.frameId = requestAnimationFrame(tick);
    }
  }

  private scheduleAfterDraw(cb: () => void): void {
    try {
      const gl = this.renderer.getContext() as WebGL2RenderingContext;
      if (gl && typeof gl.fenceSync === 'function') {
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        const poll = () => {
          if (this.disposed) return;
          const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (state === gl.UNSIGNALED) {
            this.frameId = window.setTimeout(poll, 5);
          } else {
            if (sync) gl.deleteSync(sync);
            this.frameId = window.setTimeout(cb, 80);
          }
        };
        this.frameId = window.setTimeout(poll, 5);
        return;
      }
    } catch {
      // Fallback below
    }
    this.frameId = window.setTimeout(cb, 80);
  }

  public dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);
    this.resizeObserver.disconnect();
    this.clearDynamicEntities();
    for (const d of this.staticDisposables) {
      d.dispose();
    }
    this.envTexture.dispose();
    this.controls.dispose();
    this.renderer.dispose();
    if (this.renderer.domElement.parentElement === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
