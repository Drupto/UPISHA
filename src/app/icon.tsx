import { readFile } from 'node:fs/promises'
import path from 'node:path'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default async function Icon() {
  const file = await readFile(path.join(process.cwd(), 'public/images/upishalogo.png'))
  return new Response(file, {
    headers: {
      'Content-Type': 'image/png',
    },
  })
}