'use client'

import { useState } from 'react'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { Button } from '@/components/ui/button'
import { Loader2, Download, Printer } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface CertificateDownloadProps {
  certificateRef: React.RefObject<HTMLDivElement | null>
  fileName?: string
}

export default function CertificateDownload({
  certificateRef,
  fileName = 'certificate',
}: CertificateDownloadProps) {
  const { toast } = useToast()
  const [downloading, setDownloading] = useState(false)
  const [printing, setPrinting] = useState(false)

  const handleDownloadPDF = async () => {
    if (!certificateRef.current) return
    setDownloading(true)
    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
      })

      const imgData = canvas.toDataURL('image/jpeg', 0.95)
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width / 3, canvas.height / 3],
      })

      pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width / 3, canvas.height / 3)
      pdf.save(`${fileName}.pdf`)

      toast({ title: 'Success', description: 'Certificate downloaded as PDF' })
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast({ title: 'Error', description: 'Failed to generate PDF', variant: 'destructive' })
    } finally {
      setDownloading(false)
    }
  }

  const handlePrint = () => {
    if (!certificateRef.current) return
    setPrinting(true)
    try {
      const printContent = certificateRef.current.cloneNode(true) as HTMLElement

      const imgs = printContent.querySelectorAll('img')
      const imgPromises = Array.from(imgs).map((img) => {
        return new Promise<void>((resolve) => {
          if (img.complete) {
            resolve()
          } else {
            img.onload = () => resolve()
            img.onerror = () => resolve()
          }
        })
      })

      Promise.all(imgPromises).then(() => {
        const printWindow = window.open('', '_blank', 'width=900,height=650')
        if (!printWindow) {
          toast({ title: 'Error', description: 'Pop-up blocked. Please allow pop-ups to print.', variant: 'destructive' })
          setPrinting(false)
          return
        }

        const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
          .map((el) => el.outerHTML)
          .join('\n')

        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${fileName}</title>
              ${styles}
              <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { display: flex; align-items: center; justify-content: center; min-height: 100vh; background: white; }
                .print-wrapper { width: 100%; max-width: 1100px; }
                .print-wrapper * { transform: none !important; }
                @media print {
                  body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
                  .print-wrapper { max-width: 100vw; }
                }
              </style>
            </head>
            <body>
              <div class="print-wrapper">
                ${printContent.outerHTML}
              </div>
              <script>
                window.onload = function() {
                  setTimeout(function() {
                    window.print();
                    setTimeout(function() { window.close(); }, 500);
                  }, 200);
                };
              </script>
            </body>
          </html>
        `)

        printWindow.document.close()
        setPrinting(false)
      })
    } catch (error) {
      console.error('Error printing certificate:', error)
      toast({ title: 'Error', description: 'Failed to print certificate', variant: 'destructive' })
      setPrinting(false)
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        onClick={handleDownloadPDF}
        disabled={downloading || printing}
        className="bg-upisha-teal hover:bg-upisha-teal-dark text-white"
        size="sm"
      >
        {downloading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Generating...
          </>
        ) : (
          <>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </>
        )}
      </Button>
      <Button
        onClick={handlePrint}
        disabled={downloading || printing}
        variant="outline"
        size="sm"
      >
        {printing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Preparing...
          </>
        ) : (
          <>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </>
        )}
      </Button>
    </div>
  )
}