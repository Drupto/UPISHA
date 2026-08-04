import { getStorageInstance } from './firebase-admin'
import {
  ref,
  uploadString,
  getDownloadURL,
  deleteObject,
  StringFormat,
} from 'firebase/storage'

/**
 * Upload a base64 data URL to Firebase Storage and return the download URL.
 * Used for member photos and RCI certificates during the join flow.
 */
export async function uploadDataUrl(
  dataUrl: string,
  path: string
): Promise<string> {
  const storage = getStorageInstance()
  const storageRef = ref(storage, path)

  // uploadString with StringFormat.DATA_URL parses the data:...;base64,... prefix
  const snapshot = await uploadString(storageRef, dataUrl, StringFormat.DATA_URL)
  const downloadUrl = await getDownloadURL(snapshot.ref)
  return downloadUrl
}

/**
 * Delete a file from Firebase Storage by its path.
 */
export async function deleteStorageObject(path: string): Promise<void> {
  const storage = getStorageInstance()
  const storageRef = ref(storage, path)
  await deleteObject(storageRef)
}