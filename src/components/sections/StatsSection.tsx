'use client'

import { motion } from 'framer-motion'
import { stats } from '@/lib/static-data'

/* ─── Stats Section ─── */
export function StatsSection() {
  return (
    <section className="py-12 md:py-16 bg-upisha-navy dark:bg-gray-950 relative overflow-hidden border-t-2 border-t-upisha-gold/20">
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
      />
      <div className="max-w-7xl mx-auto px-4 relative">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, i) => (
            <div key={stat.label} className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                viewport={{ once: true }}
              >
                <div className="w-14 h-14 md:w-16 md:h-16 mx-auto mb-3 bg-upisha-teal/20 rounded-2xl flex items-center justify-center">
                  <stat.icon className="h-7 w-7 md:h-8 md:w-8 text-upisha-teal" />
                </div>
                <div className="text-3xl md:text-5xl font-bold text-white mb-1">
                  {stat.value}{stat.suffix}
                </div>
                <div className="text-sm md:text-base text-gray-400">{stat.label}</div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
