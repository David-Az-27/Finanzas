'use client';
import { LoginForm } from '@/features/auth';
import { motion } from 'framer-motion';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full bg-[#070b14] text-white overflow-hidden font-sans">
      {/* LADO IZQUIERDO - BRANDING & ANIMACIONES (Solo Desktop) */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-center items-center overflow-hidden bg-gradient-to-br from-[#0a192f] to-[#070b14] border-r border-white/5">
        
        {/* Orbes Animados de Fondo */}
        <motion.div 
          animate={{ x: [0, 60, 0], y: [0, -60, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-[20%] left-[20%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"
        />
        <motion.div 
          animate={{ x: [0, -60, 0], y: [0, 60, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[20%] right-[20%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"
        />

        {/* Contenido Central del Branding */}
        <div className="relative z-10 flex flex-col items-center">
           <motion.div 
              initial={{ scale: 0, rotate: -20 }} 
              animate={{ scale: 1, rotate: 0 }} 
              transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.1 }}
              className="flex h-32 w-32 items-center justify-center rounded-[2rem] bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-[0_0_60px_rgba(16,185,129,0.3)] relative group"
           >
              <div className="absolute inset-0 bg-white/20 rounded-[2rem] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <span className="text-7xl font-black text-[#070b14] tracking-tighter relative z-10">D</span>
           </motion.div>
           
           <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
              className="mt-12 text-7xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60"
           >
             DIMO
           </motion.h1>
           
           <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="mt-6 text-xl text-emerald-100/50 max-w-md text-center font-medium leading-relaxed"
           >
             El control absoluto de tus finanzas en una experiencia de otro nivel.
           </motion.p>
        </div>
      </div>

      {/* LADO DERECHO - FORMULARIO */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8 sm:p-12 relative bg-[#070b14]">
        {/* Ruido visual para textura (opcional) */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }} />
        
        <LoginForm />
      </div>
    </div>
  );
}
