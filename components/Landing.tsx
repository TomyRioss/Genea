"use client";

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import GradientText from '@/components/GradientText';
import VideoModal from '@/components/VideoModal';

const Balatro = dynamic(() => import('@/components/Balatro'), {
  ssr: false
});

export default function Landing() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Fondo */}
      <div className="absolute inset-0 z-0">
        <Balatro
          isRotate={false}
          mouseInteraction
          pixelFilter={470}
          color1="#2563EB"
          color2="#1E3A5F"
          color3="#0f172a"
        />
      </div>

      {/* Contenido */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <GradientText
          colors={["#FFFFFF", "#06B6D4", "#FFFFFF", "#06B6D4", "#FFFFFF"]}
          animationSpeed={3}
          showBorder={false}
          className="mb-4 text-6xl font-bold md:text-7xl lg:text-9xl"
        >
          Genea
        </GradientText>
        <p className="mb-8 max-w-4xl text-3xl font-medium text-white md:text-4xl lg:text-6xl">
          Tú modelo en segundos, el más económico en el mercado.
        </p>
        <p className="mb-4 text-xl font-semibold text-white md:text-2xl">
          Registrate y obten creditos gratis
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/register"
            className="rounded-full bg-black px-12 py-4 text-lg font-semibold text-white transition-colors hover:bg-gray-900 md:px-16 md:py-5 md:text-xl"
          >
            Registrarme
          </Link>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-full bg-white px-12 py-4 text-lg font-semibold text-black transition-colors hover:bg-gray-200 md:px-16 md:py-5 md:text-xl"
          >
            <svg className="h-5 w-5 md:h-6 md:w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            Ver demo
          </button>
        </div>
      </div>

      <VideoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        videoUrl="https://www.youtube.com/embed/dQw4w9WgXcQ"
      />
    </div>
  );
}
