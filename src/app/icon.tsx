import { readFile } from 'node:fs/promises'
import path from 'node:path'

export const size = { width: 32, height: 32 }
export const contentType = 'image/jpeg'

export default async function Icon() {
  const file = await readFile(path.join(process.cwd(), 'public/images/mainlogo.jpeg'))
  return new Response(file, {
    headers: {
      'Content-Type': 'image/jpeg',
    },
  })
}