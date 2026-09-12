'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Clock, Copy, FileText, Mail, MapPin, Phone, Send } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { AnimatedSection } from '@/components/sections'

const OFFICE_EMAILS = [
  { label: 'Office — all document requests', email: 'office@upisha.org' },
  { label: 'President', email: 'president@upisha.org' },
  { label: 'Secretary', email: 'secretary@upisha.org' },
]

const REQUEST_FORMAT = `Document Request — UP ISHA
---------------------------
1. Full Name:
2. Email:
3. Phone (10-digit mobile):
4. City:
5. Profession: (Audiologist / Speech-Language Pathologist / Student / Parent-Caregiver / Researcher / Other)
6. RCI Registration No.: (mandatory for Audiologists & SLPs)
7. Institution / Organisation: (optional)
8. UP ISHA Member: (Yes/No — if Yes, mention Membership ID)
9. Document Requested:
10. Purpose of Request: (briefly state why you need the document)
11. Intended Use: (Clinical / Academic-Research / Legal-Compliance / Personal Awareness / Other)
12. Urgency: (Normal / Urgent)
13. Additional Notes: (optional)`

function RequestDocumentContent() {
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [docTitle, setDocTitle] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const doc = searchParams.get('doc')
    if (doc) setDocTitle(doc)
  }, [searchParams])

  const subject = `Document Request${docTitle ? `: ${docTitle}` : ''}`
  const mailtoHref = `mailto:office@upisha.org?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(REQUEST_FORMAT)}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(REQUEST_FORMAT)
      setCopied(true)
      toast({ title: 'Format copied!', description: 'Paste it into your email, fill in your details, and send it to office@upisha.org.' })
      setTimeout(() => setCopied(false), 2500)
    } catch {
      toast({ title: 'Could not copy automatically', description: 'Please select and copy the format manually.', variant: 'destructive' })
    }
  }

  return (
    <AnimatedSection className="py-16 md:py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center mx-auto mb-4 bg-white border border-gray-200 shadow-md">
            <img src="/images/mainlogo.jpeg" alt="UP ISHA Logo" className="h-full w-full object-contain" />
          </div>
          <Badge className="bg-upisha-teal/10 text-upisha-teal mb-3">Resource Library</Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-upisha-navy dark:text-white">
            Request a Document
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-3 max-w-2xl mx-auto">
            {docTitle ? (
              <>
                You are requesting <span className="font-semibold text-upisha-navy dark:text-white">{docTitle}</span>.{' '}
              </>
            ) : null}
            Documents are shared officially on request — email our office using the required format below and we will respond to your email.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Contact details */}
          <Card className="border-upisha-teal/20 dark:bg-gray-800 dark:border-gray-700 card-gradient-top h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="text-upisha-navy dark:text-white flex items-center gap-2 text-lg">
                <Mail className="h-5 w-5 text-upisha-teal" />
                Contact the Office
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {OFFICE_EMAILS.map((item) => (
                <div key={item.email}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-0.5">{item.label}</p>
                  <a href={`mailto:${item.email}`} className="text-sm font-medium text-upisha-teal hover:underline break-all">
                    {item.email}
                  </a>
                </div>
              ))}
              <div className="pt-3 border-t border-gray-100 dark:border-gray-700 space-y-3">
                <p className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-upisha-teal" />
                  110 Raghu Raj Nagar Patel Nagar Lucknow-226016
                </p>
                <p className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <Phone className="h-4 w-4 shrink-0 mt-0.5 text-upisha-teal" />
                  +91-9555155940
                </p>
                <p className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <Clock className="h-4 w-4 shrink-0 mt-0.5 text-upisha-teal" />
                  Monday – Friday: 9:00 AM – 5:00 PM, Saturday: 9:00 AM – 1:00 PM
                </p>
              </div>
              <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                <h4 className="font-semibold text-upisha-navy dark:text-white text-sm mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-upisha-gold" />
                  How it works
                </h4>
                <ol className="text-sm text-gray-600 dark:text-gray-300 space-y-1.5 list-decimal list-inside">
                  <li>Copy the request format and fill in your details.</li>
                  <li>Email it to office@upisha.org (subject: &ldquo;Document Request&rdquo;).</li>
                  <li>Our office verifies your details and emails you the document.</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* Required request format */}
          <Card className="border-upisha-gold/30 dark:bg-gray-800 dark:border-gray-700 h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="text-upisha-navy dark:text-white flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-upisha-gold" />
                Required Request Format
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                To be processed officially, your request email must include all of the following details:
              </p>
              <pre className="text-xs leading-relaxed bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 overflow-x-auto text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
{REQUEST_FORMAT}
              </pre>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={handleCopy} variant="outline" className="flex-1">
                  {copied ? <Check className="h-4 w-4 mr-2 text-green-500" /> : <Copy className="h-4 w-4 mr-2" />}
                  {copied ? 'Copied!' : 'Copy Format'}
                </Button>
                <a href={mailtoHref} className="flex-1">
                  <Button className="w-full bg-upisha-teal hover:bg-upisha-teal-dark text-white">
                    <Send className="h-4 w-4 mr-2" />
                    Email Request
                  </Button>
                </a>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                &ldquo;Email Request&rdquo; opens your mail app with the format pre-filled and addressed to the office — just fill in your details and send.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AnimatedSection>
  )
}

export default function RequestDocumentPage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 md:py-20 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-5xl mx-auto px-4 text-center text-gray-500">Loading request details…</div>
        </div>
      }
    >
      <RequestDocumentContent />
    </Suspense>
  )
}