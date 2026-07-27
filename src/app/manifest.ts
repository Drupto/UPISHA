import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'UP ISHA - Uttar Pradesh Speech & Hearing Association',
    short_name: 'UP ISHA',
    description: 'Uttar Pradesh Speech & Hearing Association - Dedicated to advancing audiology and speech-language pathology in Uttar Pradesh, India.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0d7377',
    icons: [{ src: '/favicon.ico', sizes: 'any', type: 'image/x-icon' }],
  }
}