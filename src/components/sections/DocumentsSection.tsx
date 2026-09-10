'use client'

import { motion } from 'framer-motion'
import { ArrowRight, FileText } from 'lucide-react'
import Link from 'next/link'
import { AnimatedSection } from '@/components/sections'
import { documents } from '@/lib/static-data'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

/* ─── Documents Section ─── */
export function DocumentsSection() {
  return (
    <AnimatedSection id="documents" className="py-16 md:py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="bg-upisha-teal/10 text-upisha-teal mb-3">Documents</Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-upisha-navy dark:text-white">
            Resource Library
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc, i) => (
            <motion.div
              key={doc.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="h-full p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-upisha-teal/10 rounded-lg">
                    <FileText className="h-5 w-5 text-upisha-teal" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-upisha-navy dark:text-white mb-1">{doc.title}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{doc.description}</p>
                    <Button asChild variant="ghost" size="sm" className="text-upisha-teal hover:text-upisha-teal-dark p-0">
                      <Link href={`/request-document?doc=${encodeURIComponent(doc.title)}`}>
                        Request Now <ArrowRight className="h-3 w-3 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  )
}
