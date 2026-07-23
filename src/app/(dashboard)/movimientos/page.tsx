'use client';

import { useState } from 'react';
import { MovimientosTable } from '@/features/movimientos/components/MovimientosTable';
import { PresupuestosTable } from '@/features/presupuestos/components/PresupuestosTable';
import { CategoriasTable } from '@/features/categorias/components/CategoriasTable';
import { CrearMovimientoDialog } from '@/features/movimientos/components/CrearMovimientoDialog';
import { CrearCategoriaDialog } from '@/features/categorias/components/CrearCategoriaDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRightLeft, Target, Tags } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120 } }
};

export default function MovimientosPage() {
  const [activeTab, setActiveTab] = useState('movimientos');

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* ── Header Premium ── */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-white/5">
          <div className="flex items-center gap-4">
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">Control Financiero</h1>
            <div className="hidden lg:block">
              <p className="text-sm text-zinc-400">Gestiona tu flujo de caja, presupuesto y categorías.</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            {/* Segmented Control Tabs */}
            <TabsList className="grid w-full sm:w-auto grid-cols-3 bg-black/40 backdrop-blur-3xl border border-white/10 rounded-xl h-12 p-1.5 shadow-2xl">
              <TabsTrigger value="movimientos" className="text-[11px] uppercase tracking-widest font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#62aeae] data-[state=active]:to-[#3d7575] data-[state=active]:text-white text-zinc-400 hover:text-white rounded-lg gap-2 h-full transition-all duration-300 data-[state=active]:shadow-[0_0_20px_rgba(98,174,174,0.3)]">
                <ArrowRightLeft className="w-4 h-4" /> <span className="hidden sm:inline">Movimientos</span>
              </TabsTrigger>
              <TabsTrigger value="planificacion" className="text-[11px] uppercase tracking-widest font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#62aeae] data-[state=active]:to-[#3d7575] data-[state=active]:text-white text-zinc-400 hover:text-white rounded-lg gap-2 h-full transition-all duration-300 data-[state=active]:shadow-[0_0_20px_rgba(98,174,174,0.3)]">
                <Target className="w-4 h-4" /> <span className="hidden sm:inline">Planificación</span>
              </TabsTrigger>
              <TabsTrigger value="categorias" className="text-[11px] uppercase tracking-widest font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#62aeae] data-[state=active]:to-[#3d7575] data-[state=active]:text-white text-zinc-400 hover:text-white rounded-lg gap-2 h-full transition-all duration-300 data-[state=active]:shadow-[0_0_20px_rgba(98,174,174,0.3)]">
                <Tags className="w-4 h-4" /> <span className="hidden sm:inline">Categorías</span>
              </TabsTrigger>
            </TabsList>

            {/* Dynamic Action Button */}
            <div className="min-w-[140px] flex justify-end">
              <AnimatePresence mode="wait">
                {activeTab === 'movimientos' && (
                  <motion.div
                    key="crear-movimiento"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.15 }}
                  >
                    <CrearMovimientoDialog />
                  </motion.div>
                )}
                {activeTab === 'categorias' && (
                  <motion.div
                    key="crear-categoria"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.15 }}
                  >
                    <CrearCategoriaDialog />
                  </motion.div>
                )}
                {activeTab === 'planificacion' && (
                  <motion.div key="crear-planificacion" className="h-9" />
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* ── Contenido de las Pestañas ── */}
        <motion.div variants={itemVariants} className="mt-6">
          <TabsContent value="movimientos" className="m-0 focus-visible:ring-0">
            <MovimientosTable />
          </TabsContent>

          <TabsContent value="planificacion" className="m-0 focus-visible:ring-0">
            <PresupuestosTable />
          </TabsContent>

          <TabsContent value="categorias" className="m-0 focus-visible:ring-0">
            <CategoriasTable />
          </TabsContent>
        </motion.div>
      </Tabs>
    </motion.div>
  );
}
