// REFERENCE ONLY — verbatim copy of the approved prototype (apps.jsx from
// the test repo, received 2026-10-12). Never imported by the app; visual
// baseline for the 3D garden in M3 (spec section 6).
//
// Prototype/spec mapping notes (spec wins on conflicts):
// - Prototype stages seed/sprout/sapling/tree map to spec seed/growing/mature:
//   sprout -> growing (pino.glb), sapling -> growing (ciliegio.glb),
//   tree -> mature (quercia.glb).
// - Target heights differ: prototype 1.8/3.4/5.5, spec 2.2/3.2/5.5 -> use spec.
// - Prototype NOTES/positions/excerpts are mock data, replaced by DB in M3.

import { Suspense, useMemo, useRef, useState } from 'react'

import { Canvas, useFrame } from '@react-three/fiber'
import {
  OrbitControls,
  Html,
  Environment,
  useGLTF,
  Sparkles
} from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'

const stageLabel = {
  seed: 'Seme',
  sprout: 'Germoglio',
  sapling: 'Arboscello',
  tree: 'Albero'
}

// Altezza in "metri" che vogliamo per ogni stadio
const TARGET_HEIGHT = {
  sprout: 1.8,
  sapling: 3.4,
  tree: 5.5
}

const NOTES = [
  {
    id: '1',
    slug: 'nostalgia-shinkai',
    title: 'La nostalgia nei film di Shinkai',
    excerpt:
      'Distanza, tempo e memoria. Perché certi anime lasciano una sensazione agrodolce anche dopo giorni.',
    stage: 'tree',
    model: '/models/quercia.glb',
    rotationY: 0.6,
    position: [-3.2, 0, -2.4]
  },
  {
    id: '2',
    slug: 'viaggi-e-anime',
    title: 'Viaggi e anime',
    excerpt:
      'Come i racconti di viaggio nei manga influenzano il mio modo di pensare agli spostamenti.',
    stage: 'sprout',
    model: '/models/pino.glb',
    rotationY: 2.1,
    position: [0.8, 0, -3.6]
  },
  {
    id: '3',
    slug: 'kyoto-come-stato-mentale',
    title: 'Kyoto come stato mentale',
    excerpt:
      'Non solo una città, ma un immaginario fatto di templi, pioggia, caffè silenziosi e lanterne.',
    stage: 'sapling',
    model: '/models/ciliegio.glb',
    rotationY: 4.0,
    position: [3.4, 0, -1.2]
  },
  {
    id: '4',
    slug: 'finali-aperti',
    title: 'Perché mi piacciono i finali aperti',
    excerpt:
      'Appunti sparsi su cinema, serie TV e storie che non chiudono tutto.',
    stage: 'seed',
    model: null,
    color: '#FF9DE2',
    position: [-1.2, 0, 0.8]
  },
  {
    id: '5',
    slug: 'sito-personale-come-hobby',
    title: 'Costruire siti personali come hobby',
    excerpt:
      'Riflessione sul perché mi piace creare piccoli strumenti digitali solo per me.',
    stage: 'tree',
    model: '/models/quercia.glb',
    rotationY: 3.2,
    position: [2.2, 0, 1.8]
  },
  {
    id: '6',
    slug: 'idea-tracker-libri',
    title: 'Idea per un tracker di libri',
    excerpt:
      'Vorrei un sistema per tracciare letture, citazioni e stati emotivi durante la lettura.',
    stage: 'seed',
    model: null,
    color: '#C9A6FF',
    position: [-3.8, 0, 1.6]
  }
]

/* ============ SEME (nota appena nata) ============ */
function Seed({ note, isSelected, onSelect }) {
  const ref = useRef(null)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    ref.current.position.y = 0.4 + Math.sin(t * 1.4 + note.position[0]) * 0.07
    const pulse = 1 + Math.sin(t * 2.2 + note.position[2]) * 0.06
    ref.current.scale.setScalar(pulse)
  })

  return (
    <group
      position={[note.position[0], 0, note.position[2]]}
      onClick={(e) => {
        e.stopPropagation()
        onSelect(note)
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        setHovered(false)
        document.body.style.cursor = 'default'
      }}
    >
      {/* anello-semenzaio a terra */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.42, 0.58, 40]} />
        <meshBasicMaterial
          color={note.color}
          transparent
          opacity={hovered || isSelected ? 0.75 : 0.35}
        />
      </mesh>

      {/* il seme */}
      <mesh ref={ref} castShadow position={[0, 0.4, 0]}>
        <icosahedronGeometry args={[0.28, 2]} />
        <meshStandardMaterial
          color={note.color}
          emissive={note.color}
          emissiveIntensity={hovered || isSelected ? 2 : 1.1}
          roughness={0.3}
        />
      </mesh>

      {hovered && (
        <Html
          center
          distanceFactor={10}
          position={[0, 1.1, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <div
            style={{
              background: 'rgba(20, 35, 25, 0.85)',
              border: '1px solid rgba(180, 255, 200, 0.3)',
              color: '#EAF9EF',
              padding: '6px 10px',
              borderRadius: 12,
              whiteSpace: 'nowrap',
              fontFamily: 'sans-serif',
              fontSize: 12
            }}
          >
            🌱 {note.title}
          </div>
        </Html>
      )}
    </group>
  )
}

/* ============ ALBERO (nota in crescita) ============ */
function Tree({ note, isSelected, onSelect }) {
  const group = useRef(null)
  const [hovered, setHovered] = useState(false)
  const { scene } = useGLTF(note.model)

  const targetHeight = TARGET_HEIGHT[note.stage] ?? 4

  // Misura il modello e normalizzalo: base a terra, centrato, altezza voluta
  const { clone, baseScale, labelY } = useMemo(() => {
    const clone = scene.clone()

    // MICRO-RITOCCO 1: attiva ombre su tutte le mesh del modello
    clone.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true
        obj.receiveShadow = true
      }
    })

    const box = new THREE.Box3().setFromObject(clone)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())

    clone.position.x -= center.x
    clone.position.z -= center.z
    clone.position.y -= box.min.y

    const baseScale = targetHeight / Math.max(size.y, 0.001)
    return { clone, baseScale, labelY: targetHeight + 0.6 }
  }, [scene, targetHeight])

  useFrame((state) => {
    if (!group.current) return
    const t = state.clock.elapsedTime
    group.current.rotation.z = Math.sin(t * 0.5 + note.position[0]) * 0.012
    const target = (hovered || isSelected ? 1.05 : 1) * baseScale
    const s = THREE.MathUtils.lerp(group.current.scale.x, target, 0.1)
    group.current.scale.setScalar(s)
  })

  return (
    <group
      ref={group}
      position={note.position}
      rotation={[0, note.rotationY, 0]}
      scale={baseScale}
      onClick={(e) => {
        e.stopPropagation()
        onSelect(note)
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        setHovered(false)
        document.body.style.cursor = 'default'
      }}
    >
      <primitive object={clone} />

      {hovered && (
        <Html
          center
          distanceFactor={10}
          position={[0, labelY, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <div
            style={{
              background: 'rgba(20, 35, 25, 0.85)',
              border: '1px solid rgba(180, 255, 200, 0.3)',
              color: '#EAF9EF',
              padding: '6px 10px',
              borderRadius: 12,
              whiteSpace: 'nowrap',
              fontFamily: 'sans-serif',
              fontSize: 12
            }}
          >
            {note.title}
          </div>
        </Html>
      )}
    </group>
  )
}

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.02, 0]}>
      <planeGeometry args={[80, 80]} />
      <meshStandardMaterial color="#4a6741" roughness={1} />
    </mesh>
  )
}

export default function App() {
  const [selected, setSelected] = useState(null)

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        background: '#dce8d5'
      }}
    >
      <Canvas
        shadows
        dpr={[1, 1.75]}
        camera={{ position: [0, 4.5, 16], fov: 45 }}
        onPointerMissed={() => setSelected(null)}
      >
        {/* cielo diurno + foschia chiara */}
        <color attach="background" args={['#dce8d5']} />
        <fog attach="fog" args={['#dce8d5', 10, 32]} />

        {/* luce: sole caldo + cielo + ambiente HDRI */}
        <ambientLight intensity={0.55} />
        <hemisphereLight args={['#e8f4e0', '#3a4a33', 0.7]} />

        {/* MICRO-RITOCCO 2: ombre con telecamera larga */}
        <directionalLight
          position={[10, 14, 6]}
          intensity={2.2}
          color="#fff2d9"
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20}
          shadow-camera-far={60}
        />

        {/* MICRO-RITOCCO 3: niente Loader custom, fallback nullo */}
        <Suspense fallback={null}>
          <Environment preset="forest" />

          <Ground />

          {NOTES.map((note) =>
            note.model ? (
              <Tree
                key={note.id}
                note={note}
                isSelected={selected?.id === note.id}
                onSelect={setSelected}
              />
            ) : (
              <Seed
                key={note.id}
                note={note}
                isSelected={selected?.id === note.id}
                onSelect={setSelected}
              />
            )
          )}

          {/* polline / pulviscolo nella luce */}
          <Sparkles
            count={110}
            scale={16}
            size={2.5}
            speed={0.3}
            opacity={0.55}
            color="#ffffff"
          />
        </Suspense>

        <OrbitControls
          target={[0, 2.5, 0]}
          maxPolarAngle={Math.PI / 2.15}
          minDistance={5}
          maxDistance={26}
          enablePan={false}
        />

        <EffectComposer>
          <Bloom intensity={0.4} luminanceThreshold={1} mipmapBlur />
          <Vignette offset={0.22} darkness={0.55} />
        </EffectComposer>
      </Canvas>

      {/* Header */}
      <div
        style={{
          position: 'absolute',
          top: 24,
          left: 24,
          zIndex: 10,
          color: '#1d3325',
          fontFamily: 'sans-serif',
          pointerEvents: 'none'
        }}
      >
        <h1 style={{ margin: 0, fontSize: 28 }}>Il mio giardino digitale</h1>
        <p style={{ margin: '6px 0 0', opacity: 0.75 }}>
          Clicca un albero (o un seme) per aprire la nota
        </p>
      </div>

      {/* Pannello nota */}
      {selected && (
        <aside
          style={{
            position: 'absolute',
            top: 24,
            right: 24,
            width: 340,
            maxWidth: 'calc(100vw - 48px)',
            background: 'rgba(250, 252, 246, 0.9)',
            border: '1px solid rgba(60, 100, 70, 0.25)',
            borderRadius: 20,
            padding: 20,
            color: '#1d3325',
            backdropFilter: 'blur(12px)',
            zIndex: 20,
            fontFamily: 'sans-serif'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 12,
              marginBottom: 10
            }}
          >
            <span style={{ opacity: 0.7, textTransform: 'capitalize' }}>
              {stageLabel[selected.stage]}
            </span>
            <button
              onClick={() => setSelected(null)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#2c5c3d',
                cursor: 'pointer',
                fontSize: 18,
                lineHeight: 1
              }}
            >
              ✕
            </button>
          </div>

          <h2 style={{ margin: '0 0 10px', fontSize: 26, lineHeight: 1.2 }}>
            {selected.title}
          </h2>

          <p style={{ margin: 0, lineHeight: 1.6, opacity: 0.85 }}>
            {selected.excerpt}
          </p>
        </aside>
      )}
    </div>
  )
}
