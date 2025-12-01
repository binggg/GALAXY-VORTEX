import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Text, Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

interface Participant {
  id: string;
  name: string;
}

interface GalaxySceneProps {
  participants: Participant[];
  isSpinning: boolean;
  winners: Participant[];  // 改为数组支持多个中奖者
  onSpinComplete: () => void;
}

// 创建圆形粒子纹理
function createCircleTexture(): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  
  // 绘制带有柔和边缘的圆形
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
  gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.3)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// 高级螺旋星系粒子系统
function LuxuryGalaxy({ 
  isSpinning, 
  winners,
  spinProgress 
}: { 
  isSpinning: boolean;
  winners: Participant[];
  spinProgress: number;
}) {
  const galaxyRef = useRef<THREE.Points>(null);
  const innerGalaxyRef = useRef<THREE.Points>(null);
  const particleCount = 15000;
  const innerParticleCount = 5000;
  
  // 圆形纹理
  const circleTexture = useMemo(() => createCircleTexture(), []);
  
  // 外层星系粒子
  const galaxyGeometry = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);
    
    const colorGold = new THREE.Color('#C9A227');
    const colorChampagne = new THREE.Color('#E8D5B7');
    const colorOcean = new THREE.Color('#1E3A5F');
    const colorWhite = new THREE.Color('#FFFFFF');
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // 多臂螺旋结构
      const arms = 5;
      const armIndex = i % arms;
      const radius = Math.pow(Math.random(), 0.5) * 20 + 0.5;
      const spinAngle = radius * 1.2;
      const branchAngle = (armIndex / arms) * Math.PI * 2;
      
      // 添加随机扰动
      const randomRadius = Math.pow(Math.random(), 3) * 2;
      const randomAngle = Math.random() * Math.PI * 2;
      const randomX = Math.cos(randomAngle) * randomRadius * (1 - radius / 20);
      const randomY = (Math.random() - 0.5) * 2 * Math.pow(1 - radius / 20, 2);
      const randomZ = Math.sin(randomAngle) * randomRadius * (1 - radius / 20);
      
      positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
      positions[i3 + 1] = randomY;
      positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;
      
      // 颜色渐变：中心金色 → 外围蓝色
      const t = radius / 20;
      const mixedColor = new THREE.Color();
      
      if (t < 0.3) {
        mixedColor.lerpColors(colorGold, colorChampagne, t / 0.3);
      } else if (t < 0.6) {
        mixedColor.lerpColors(colorChampagne, colorWhite, (t - 0.3) / 0.3);
      } else {
        mixedColor.lerpColors(colorWhite, colorOcean, (t - 0.6) / 0.4);
      }
      
      // 随机亮度变化
      const brightness = 0.5 + Math.random() * 0.5;
      colors[i3] = mixedColor.r * brightness;
      colors[i3 + 1] = mixedColor.g * brightness;
      colors[i3 + 2] = mixedColor.b * brightness;
      
      scales[i] = Math.random() * 2 + 0.5;
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
    
    return geometry;
  }, []);
  
  // 内层高亮粒子
  const innerGeometry = useMemo(() => {
    const positions = new Float32Array(innerParticleCount * 3);
    const colors = new Float32Array(innerParticleCount * 3);
    
    const colorGold = new THREE.Color('#FFD700');
    const colorLava = new THREE.Color('#FF4D00');
    
    for (let i = 0; i < innerParticleCount; i++) {
      const i3 = i * 3;
      const radius = Math.pow(Math.random(), 2) * 5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.3;
      positions[i3 + 2] = radius * Math.cos(phi);
      
      const mixedColor = new THREE.Color();
      mixedColor.lerpColors(colorLava, colorGold, Math.random());
      
      colors[i3] = mixedColor.r;
      colors[i3 + 1] = mixedColor.g;
      colors[i3 + 2] = mixedColor.b;
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    return geometry;
  }, []);
  
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (galaxyRef.current) {
      // 降低旋转速度：基础速度和抽奖速度都降低
      let speed = 0.0003;
      if (isSpinning) {
        // 使用更平滑的缓动曲线，降低最大速度
        const easeInOut = spinProgress < 0.5 
          ? 2 * spinProgress * spinProgress 
          : 1 - Math.pow(-2 * spinProgress + 2, 2) / 2;
        speed = 0.008 * (easeInOut * 3 + 0.5);
      }
      galaxyRef.current.rotation.y += speed;
      galaxyRef.current.position.y = Math.sin(time * 0.3) * 0.15;
    }
    
    if (innerGalaxyRef.current) {
      let speed = 0.001;
      if (isSpinning) {
        const easeInOut = spinProgress < 0.5 
          ? 2 * spinProgress * spinProgress 
          : 1 - Math.pow(-2 * spinProgress + 2, 2) / 2;
        speed = 0.02 * (easeInOut * 4 + 0.5);
      }
      innerGalaxyRef.current.rotation.y -= speed;
      innerGalaxyRef.current.rotation.x = Math.sin(time * 0.5) * 0.1;
    }
  });
  
  return (
    <group>
      {/* 外层星系 - 使用圆形纹理 */}
      <points ref={galaxyRef} geometry={galaxyGeometry}>
        <pointsMaterial
          size={0.15}
          sizeAttenuation
          vertexColors
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          map={circleTexture}
        />
      </points>
      
      {/* 内层高亮核心 - 使用圆形纹理 */}
      <points ref={innerGalaxyRef} geometry={innerGeometry}>
        <pointsMaterial
          size={0.25}
          sizeAttenuation
          vertexColors
          transparent
          opacity={0.95}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          map={circleTexture}
        />
      </points>
    </group>
  );
}

// 奢华核心球体
function LuxuryCore({ isSpinning, hasWinners }: { isSpinning: boolean; hasWinners: boolean }) {
  const coreRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const ringsRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (coreRef.current) {
      coreRef.current.rotation.y += 0.005;
      coreRef.current.rotation.z = Math.sin(time * 0.5) * 0.1;
      
      const baseScale = hasWinners ? 1.8 : 1.2;
      const pulse = hasWinners 
        ? Math.sin(time * 4) * 0.15 
        : Math.sin(time * 2) * 0.08;
      coreRef.current.scale.setScalar(baseScale + pulse);
    }
    
    if (glowRef.current) {
      const glowScale = hasWinners ? 5 : 3;
      const pulse = Math.sin(time * 1.5) * 0.5;
      glowRef.current.scale.setScalar(glowScale + pulse);
      glowRef.current.rotation.y -= 0.002;
    }
    
    if (ringsRef.current) {
      ringsRef.current.rotation.x += 0.003;
      ringsRef.current.rotation.z += 0.002;
    }
  });
  
  const coreColor = hasWinners ? '#FFD700' : '#C9A227';
  const emissiveColor = hasWinners ? '#FF4D00' : '#8B6914';
  
  return (
    <group>
      {/* 主核心球体 - 金属质感 */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[1, 128, 128]} />
        <meshStandardMaterial
          color={coreColor}
          emissive={emissiveColor}
          emissiveIntensity={hasWinners ? 2 : 0.8}
          metalness={0.95}
          roughness={0.1}
          envMapIntensity={2}
        />
      </mesh>
      
      {/* 外发光层 */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color={hasWinners ? '#FFD700' : '#C9A227'}
          transparent
          opacity={0.08}
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* 装饰环 */}
      <group ref={ringsRef}>
        {[0, 1, 2, 3].map((i) => (
          <mesh 
            key={i} 
            rotation={[
              Math.PI / 2 + i * 0.25, 
              i * 0.4, 
              i * 0.2
            ]}
          >
            <torusGeometry args={[2 + i * 0.4, 0.015, 16, 128]} />
            <meshBasicMaterial
              color={i % 2 === 0 ? '#C9A227' : '#E8D5B7'}
              transparent
              opacity={0.6 - i * 0.1}
            />
          </mesh>
        ))}
      </group>
      
      {/* 能量粒子 */}
      <Sparkles
        count={100}
        scale={4}
        size={3}
        speed={0.5}
        color={hasWinners ? '#FFD700' : '#C9A227'}
      />
    </group>
  );
}

// 参与者星球 - 高级版
function LuxuryParticipantStar({ 
  participant, 
  position, 
  isWinner,
  index,
  total
}: { 
  participant: Participant;
  position: [number, number, number];
  isWinner: boolean;
  index: number;
  total: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const sphereRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (sphereRef.current) {
      sphereRef.current.rotation.y += 0.01;
      
      if (isWinner) {
        const pulse = Math.sin(time * 5) * 0.1;
        sphereRef.current.scale.setScalar(1 + pulse);
      }
    }
    
    if (ringRef.current) {
      ringRef.current.rotation.z += 0.02;
    }
  });
  
  const scale = isWinner ? 0.8 : 0.4;
  const sphereColor = isWinner ? '#FFD700' : '#E8D5B7';
  const emissiveColor = isWinner ? '#FF4D00' : '#1E3A5F';
  
  return (
    <Float
      speed={1.5}
      rotationIntensity={0.3}
      floatIntensity={0.4}
    >
      <group ref={groupRef} position={position} scale={scale}>
        {/* 星球本体 */}
        <mesh ref={sphereRef}>
          <sphereGeometry args={[1, 64, 64]} />
          <meshStandardMaterial
            color={sphereColor}
            emissive={emissiveColor}
            emissiveIntensity={isWinner ? 1.5 : 0.3}
            metalness={0.9}
            roughness={0.15}
            envMapIntensity={1.5}
          />
        </mesh>
        
        {/* 光环 */}
        <mesh ref={ringRef} rotation={[Math.PI / 2.5, 0, 0]}>
          <torusGeometry args={[1.6, 0.03, 16, 64]} />
          <meshBasicMaterial
            color={isWinner ? '#FFD700' : '#C9A227'}
            transparent
            opacity={isWinner ? 0.9 : 0.5}
          />
        </mesh>
        
        {/* 外光晕 */}
        <mesh scale={1.8}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial
            color={isWinner ? '#FFD700' : '#C9A227'}
            transparent
            opacity={0.05}
            side={THREE.BackSide}
          />
        </mesh>
        
        {/* 名字标签 */}
        <Text
          position={[0, 2, 0]}
          fontSize={0.6}
          color={isWinner ? '#FFD700' : '#E8D5B7'}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#0A0A12"
        >
          {participant.name}
        </Text>
        
        {/* 中奖者特效 */}
        {isWinner && (
          <Sparkles
            count={50}
            scale={3}
            size={4}
            speed={1}
            color="#FFD700"
          />
        )}
      </group>
    </Float>
  );
}

// 参与者星球组
function ParticipantStarsGroup({ 
  participants, 
  isSpinning, 
  winners,
  spinProgress 
}: { 
  participants: Participant[];
  isSpinning: boolean;
  winners: Participant[];
  spinProgress: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  
  // 创建中奖者ID集合，用于快速查找
  const winnerIds = useMemo(() => new Set(winners.map(w => w.id)), [winners]);
  
  const starPositions = useMemo(() => {
    return participants.map((_, index) => {
      const angle = (index / participants.length) * Math.PI * 2;
      const radius = 7 + (index % 3) * 1.5;
      const height = Math.sin(index * 0.8) * 2;
      return [
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
      ] as [number, number, number];
    });
  }, [participants.length]);
  
  useFrame(() => {
    if (groupRef.current) {
      // 降低旋转速度
      let speed = 0.001;
      
      if (isSpinning) {
        // 使用更平滑的缓动曲线
        const easeInOut = spinProgress < 0.5 
          ? 2 * spinProgress * spinProgress 
          : 1 - Math.pow(-2 * spinProgress + 2, 2) / 2;
        speed = 0.015 * (easeInOut * 5 + 0.5);
      }
      
      groupRef.current.rotation.y += speed;
    }
  });
  
  return (
    <group ref={groupRef}>
      {participants.map((participant, index) => (
        <LuxuryParticipantStar
          key={participant.id}
          participant={participant}
          position={starPositions[index]}
          isWinner={winnerIds.has(participant.id)}
          index={index}
          total={participants.length}
        />
      ))}
    </group>
  );
}

// 中奖者 3D 展示 - 支持多个中奖者
function WinnerDisplay3D({ winners }: { winners: Participant[] }) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = 6 + Math.sin(state.clock.elapsedTime * 2) * 0.3;
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });
  
  // 根据中奖人数调整布局
  const displayText = winners.length === 1 
    ? winners[0].name 
    : winners.length <= 3
      ? winners.map(w => w.name).join(' · ')
      : `${winners.length} WINNERS`;
  
  return (
    <group ref={groupRef} position={[0, 6, 0]}>
      <Text
        fontSize={0.6}
        color="#E8D5B7"
        anchorX="center"
        anchorY="middle"
        position={[0, 1.5, 0]}
      >
        CONGRATULATIONS
      </Text>
      <Text
        fontSize={winners.length > 3 ? 1.2 : 1.5}
        color="#FFD700"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.03}
        outlineColor="#FF4D00"
        maxWidth={20}
      >
        {displayText}
      </Text>
      <Text
        fontSize={0.5}
        color="#C9A227"
        anchorX="center"
        anchorY="middle"
        position={[0, -1.3, 0]}
      >
        {winners.length > 1 ? `${winners.length} WINNERS` : 'WINNER'}
      </Text>
    </group>
  );
}

// 相机控制器 - 增强版动效
function CameraController({ 
  isSpinning, 
  hasWinners,
  spinProgress 
}: { 
  isSpinning: boolean; 
  hasWinners: boolean;
  spinProgress: number;
}) {
  const { camera } = useThree();
  const targetPosition = useRef(new THREE.Vector3(0, 6, 22));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const cameraAngle = useRef(0);
  const initialCameraSet = useRef(false);
  
  // 初始化相机位置
  useEffect(() => {
    if (!initialCameraSet.current) {
      camera.position.set(0, 6, 22);
      initialCameraSet.current = true;
    }
  }, [camera]);
  
  useFrame((state, delta) => {
    if (isSpinning) {
      // 抽奖时的相机动效
      // 阶段1 (0-0.15): 拉远
      // 阶段2 (0.15-0.85): 环绕旋转
      // 阶段3 (0.85-1): 拉近
      
      if (spinProgress < 0.15) {
        // 拉远阶段
        const t = spinProgress / 0.15;
        const easeOut = 1 - Math.pow(1 - t, 3);
        const distance = 22 + easeOut * 15; // 22 -> 37
        const height = 6 + easeOut * 8; // 6 -> 14
        targetPosition.current.set(
          Math.sin(cameraAngle.current) * distance,
          height,
          Math.cos(cameraAngle.current) * distance
        );
      } else if (spinProgress < 0.85) {
        // 环绕旋转阶段
        const t = (spinProgress - 0.15) / 0.7;
        const easeInOut = t < 0.5 
          ? 2 * t * t 
          : 1 - Math.pow(-2 * t + 2, 2) / 2;
        
        // 旋转角度：完成约 270 度旋转
        cameraAngle.current = easeInOut * Math.PI * 1.5;
        
        const distance = 37 - t * 10; // 37 -> 27
        const height = 14 - t * 4; // 14 -> 10
        targetPosition.current.set(
          Math.sin(cameraAngle.current) * distance,
          height + Math.sin(t * Math.PI * 2) * 2, // 上下波动
          Math.cos(cameraAngle.current) * distance
        );
      } else {
        // 拉近阶段
        const t = (spinProgress - 0.85) / 0.15;
        const easeIn = t * t * t;
        const distance = 27 - easeIn * 7; // 27 -> 20
        const height = 10 - easeIn * 6; // 10 -> 4
        targetPosition.current.set(
          Math.sin(cameraAngle.current) * distance,
          height,
          Math.cos(cameraAngle.current) * distance
        );
      }
    } else if (hasWinners) {
      // 有中奖者时的位置
      targetPosition.current.set(0, 5, 16);
      cameraAngle.current = 0;
    } else {
      // 默认位置
      targetPosition.current.set(0, 6, 22);
      cameraAngle.current = 0;
    }
    
    // 平滑过渡
    const lerpSpeed = isSpinning ? 0.03 : 0.02;
    camera.position.lerp(targetPosition.current, lerpSpeed);
    camera.lookAt(targetLookAt.current);
  });
  
  return null;
}

// 主场景
export default function GalaxyScene({ 
  participants, 
  isSpinning, 
  winners,
  onSpinComplete 
}: GalaxySceneProps) {
  const [spinProgress, setSpinProgress] = useState(0);
  // 延长抽奖时间到 10 秒，让动画更优雅
  const spinDuration = 10000;
  
  const hasWinners = winners.length > 0;
  
  useEffect(() => {
    if (isSpinning) {
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / spinDuration, 1);
        setSpinProgress(progress);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          onSpinComplete();
        }
      };
      
      requestAnimationFrame(animate);
    } else {
      setSpinProgress(0);
    }
  }, [isSpinning, onSpinComplete]);
  
  return (
    <Canvas
      camera={{ position: [0, 6, 22], fov: 55 }}
      gl={{ 
        antialias: true, 
        alpha: false,
        powerPreference: 'high-performance'
      }}
      style={{ background: 'radial-gradient(ellipse at center, #1E3A5F 0%, #0A0A12 40%, #050508 100%)' }}
    >
      {/* 环境光照 */}
      <ambientLight intensity={0.15} color="#E8D5B7" />
      <pointLight position={[0, 0, 0]} intensity={3} color="#FF4D00" distance={30} />
      <pointLight position={[15, 10, 10]} intensity={0.8} color="#C9A227" />
      <pointLight position={[-15, -10, -10]} intensity={0.5} color="#1E3A5F" />
      <spotLight
        position={[0, 20, 0]}
        angle={0.4}
        penumbra={1}
        intensity={1}
        color="#E8D5B7"
        castShadow
      />
      
      {/* 背景星空 */}
      <Stars
        radius={150}
        depth={80}
        count={8000}
        factor={5}
        saturation={0.1}
        fade
        speed={0.5}
      />
      
      {/* 银河系统 */}
      <LuxuryGalaxy
        isSpinning={isSpinning}
        winners={winners}
        spinProgress={spinProgress}
      />
      
      {/* 核心球体 */}
      <LuxuryCore isSpinning={isSpinning} hasWinners={hasWinners} />
      
      {/* 参与者星球 */}
      {participants.length > 0 && (
        <ParticipantStarsGroup
          participants={participants}
          isSpinning={isSpinning}
          winners={winners}
          spinProgress={spinProgress}
        />
      )}
      
      {/* 中奖者展示 */}
      {hasWinners && <WinnerDisplay3D winners={winners} />}
      
      {/* 相机控制 */}
      <CameraController 
        isSpinning={isSpinning} 
        hasWinners={hasWinners} 
        spinProgress={spinProgress}
      />
      
      {/* 轨道控制 */}
      <OrbitControls
        enableZoom={true}
        enablePan={false}
        minDistance={12}
        maxDistance={50}
        maxPolarAngle={Math.PI / 1.4}
        minPolarAngle={Math.PI / 6}
        enableDamping
        dampingFactor={0.05}
      />
    </Canvas>
  );
}
