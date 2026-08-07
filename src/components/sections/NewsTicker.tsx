'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Megaphone } from 'lucide-react'

/* ─── News Ticker ─── */
export function NewsTicker() {
  const [items, setItems] = useState<string[]>([])

  useEffect(() => {
    let cancelled = false
    fetch('/api/announcements')
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((data) => {
        if (!cancelled && data.announcements?.length) {
          // Use the first 5 announcements as ticker items
          setItems(data.announcements.slice(0, 5).map((a: { title: string }) => a.title))
        }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  if (items.length === 0) return null

  return (
    <div className="bg-upisha-navy dark:bg-gray-950 text-white py-2.5 overflow-hidden border-b border-upisha-teal/30">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-4">
        <div className="flex items-center gap-2 shrink-0 bg-upisha-gold text-upisha-navy px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
          <Megaphone className="h-3.5 w-3.5" />
          Latest
        </div>
        <div className="flex-1 overflow-hidden relative">
          <motion.div
            className="flex gap-12 whitespace-nowrap"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          >
            {[...items, ...items].map((item, i) => (
              <span key={i} className="text-sm text-gray-200 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-upisha-gold" />
                {item}
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  )
}