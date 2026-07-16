"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export type AvatarState = "idle" | "speaking" | "listening";

const SIGNAL = new THREE.Color(0x8b7cff);
const GOOD = new THREE.Color(0x3ddc97);

/**
 * A live 3D rendering of the onemock logomark — loaded from
 * /public/models/interviewer.json (a Three.js Object/Geometry JSON model,
 * not a static image) — that stands in for the interviewer. It brightens
 * and quickens while a question is being read aloud ("speaking"), and
 * opens a ring of listening particles while the candidate answers
 * ("listening"). Idle otherwise.
 */
export default function InterviewerAvatar({
  state = "idle",
  size = 168,
  className = "",
}: {
  state?: AvatarState;
  size?: number;
  className?: string;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<AvatarState>(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let disposed = false;
    let frameId = 0;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 20);
    camera.position.set(0, 0, 5.4);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const key = new THREE.PointLight(0x8b7cff, 14, 20, 2);
    key.position.set(2.5, 2.5, 3.5);
    scene.add(key);
    const rimLight = new THREE.PointLight(0xf4f2ec, 6, 20, 2);
    rimLight.position.set(-3, -2, 2);
    scene.add(rimLight);

    let rig: THREE.Object3D | null = null;
    let ring: THREE.Mesh | null = null;
    let gyro: THREE.Mesh | null = null;
    let core: THREE.Mesh | null = null;
    let lead: THREE.Mesh | null = null;
    let particles: THREE.Group | null = null;

    new THREE.ObjectLoader().load(
      "/models/interviewer.json",
      (obj) => {
        if (disposed) {
          return;
        }
        rig = obj;
        ring = rig.getObjectByName("ring") as THREE.Mesh;
        gyro = rig.getObjectByName("gyro") as THREE.Mesh;
        core = rig.getObjectByName("core") as THREE.Mesh;
        lead = rig.getObjectByName("lead") as THREE.Mesh;
        particles = rig.getObjectByName("particles") as THREE.Group;
        scene.add(rig);
      },
      undefined,
      (err) => console.error("onemock: couldn't load the interviewer model", err)
    );

    const resize = () => {
      const w = mount.clientWidth || size;
      const h = mount.clientHeight || size;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);

    const clock = new THREE.Clock();
    // Smoothed values, damped toward per-state targets every frame so
    // transitions between speaking / listening / idle never snap.
    let leadIntensity = 0.5;
    let coreScale = 1;
    let particleOpacity = 0;
    let particleSpread = 1;
    let ringSpeed = 0.12;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;
      const current = stateRef.current;
      const speaking = current === "speaking";
      const listening = current === "listening";

      const targetLead = speaking ? 1.5 + Math.sin(t * 9) * 0.5 : listening ? 0.7 : 0.45;
      const targetCoreScale = speaking
        ? 1 + Math.sin(t * 7) * 0.045
        : listening
        ? 1 + Math.sin(t * 2.2) * 0.02
        : 1;
      const targetParticleOpacity = listening ? 0.85 : 0;
      const targetSpread = listening ? 1 + Math.sin(t * 1.6) * 0.06 : 1;
      const targetRingSpeed = speaking ? 0.55 : listening ? 0.22 : 0.12;

      leadIntensity += (targetLead - leadIntensity) * Math.min(1, dt * 8);
      coreScale += (targetCoreScale - coreScale) * Math.min(1, dt * 8);
      particleOpacity += (targetParticleOpacity - particleOpacity) * Math.min(1, dt * 4);
      particleSpread += (targetSpread - particleSpread) * Math.min(1, dt * 4);
      ringSpeed += (targetRingSpeed - ringSpeed) * Math.min(1, dt * 3);

      if (rig) rig.rotation.y += dt * 0.12;
      if (ring) ring.rotation.z += dt * ringSpeed;
      if (gyro) gyro.rotation.y += dt * ringSpeed * 1.6;

      if (core) {
        core.scale.setScalar(coreScale);
        core.rotation.x += dt * 0.2;
        core.rotation.y += dt * 0.15;
        const mat = core.material as THREE.MeshStandardMaterial;
        mat.emissive = listening ? GOOD.clone().lerp(SIGNAL, 0.4) : SIGNAL;
        mat.emissiveIntensity = 0.18 + (speaking ? 0.18 : 0);
      }

      if (lead) {
        const mat = lead.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = leadIntensity;
      }

      if (particles) {
        const count = particles.children.length;
        particles.children.forEach((child, i) => {
          const mesh = child as THREE.Mesh;
          const mat = mesh.material as THREE.MeshBasicMaterial;
          mat.opacity = particleOpacity * (0.6 + 0.4 * Math.sin(t * 3 + i));
          const angle = (i / count) * Math.PI * 2 + t * 0.4;
          const radius = 1.75 * particleSpread;
          mesh.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
        });
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if ("geometry" in mesh) mesh.geometry?.dispose();
        const material = (mesh as THREE.Mesh).material as
          | THREE.Material
          | THREE.Material[]
          | undefined;
        if (Array.isArray(material)) material.forEach((m) => m.dispose());
        else material?.dispose();
      });
      renderer.dispose();
      if (renderer.domElement.parentElement === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={mountRef}
      aria-hidden
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
