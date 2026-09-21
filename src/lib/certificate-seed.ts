/**
 * Pure (Firebase-free) planning helpers for seeding the default certificate
 * templates. Kept free of Firestore imports so it can be unit-tested.
 *
 * Bug fixed here: the seeder used to match default templates to existing
 * Firestore documents by NAME only. If an admin renamed or deleted a default
 * template after editing its text, the seeder no longer found a match and
 * silently recreated a factory-default template (with the original text) on
 * the next page load, which made manual text edits appear to not stick.
 *
 * Templates are now identified by a stable seedKey that survives renames.
 * Legacy documents created before seedKey existed are claimed once via their
 * original factory name and get their seedKey backfilled.
 */
import type { CertificateCategory, CertificateTemplateDoc } from '@/lib/types'

export type CertificateTemplateSeed = Omit<
  CertificateTemplateDoc,
  'id' | 'createdAt' | 'updatedAt'
>

/**
 * Original factory template names mapped to their stable seed keys.
 * Used only to claim (and backfill) templates created before seedKey existed.
 */
export const LEGACY_TEMPLATE_SEED_KEYS: Record<string, string> = {
  'Life Member Certificate': 'life-member',
  'Annual Member Certificate': 'annual-member',
  'Student Member Certificate': 'student-member',
  'Webinar Participation Certificate': 'webinar-participation',
}

export interface SeedCategoryRepair {
  id: string
  category: CertificateCategory
}

export interface SeedKeyBackfill {
  id: string
  seedKey: string
}

export interface SeedPlan {
  /** Missing default templates that must be created. */
  toCreate: CertificateTemplateSeed[]
  /** Existing seed templates whose category needs self-healing. */
  toRepairCategory: SeedCategoryRepair[]
  /** Legacy templates that need their stable seedKey written once. */
  toBackfillSeedKey: SeedKeyBackfill[]
}

/**
 * Decide what the seeder must do, without touching the database.
 *
 * Guarantees:
 * - Existing templates are NEVER rewritten (name/title/subtitle/textBlocks
 *   are preserved): admin edits always win over factory defaults.
 * - Renamed templates are not duplicated because matching is by seedKey.
 * - A recreated missing default never steals the isDefault flag from a
 *   template the admin has already chosen as default.
 */
export function planDefaultTemplateSeed(
  existing: CertificateTemplateDoc[],
  defaults: CertificateTemplateSeed[]
): SeedPlan {
  // Index existing templates by stable key. Templates without a seedKey may
  // still be claimed via their original factory name (legacy migration).
  // First match wins so pre-existing duplicates cannot shadow each other.
  const bySeedKey = new Map<string, CertificateTemplateDoc>()
  for (const template of existing) {
    if (!template.id) continue
    if (template.seedKey) {
      if (!bySeedKey.has(template.seedKey)) bySeedKey.set(template.seedKey, template)
      continue
    }
    const legacyKey = LEGACY_TEMPLATE_SEED_KEYS[template.name]
    if (legacyKey && !bySeedKey.has(legacyKey)) {
      bySeedKey.set(legacyKey, template)
    }
  }

  const hasExistingDefault = existing.some((t) => t.isDefault === true)

  const plan: SeedPlan = {
    toCreate: [],
    toRepairCategory: [],
    toBackfillSeedKey: [],
  }

  for (const template of defaults) {
    const key = template.seedKey
    if (!key) continue
    const match = bySeedKey.get(key)
    if (!match) {
      plan.toCreate.push({
        ...template,
        isDefault: template.isDefault === true && !hasExistingDefault,
      })
      continue
    }
    if (!match.id) continue
    if (match.seedKey !== key) {
      plan.toBackfillSeedKey.push({ id: match.id, seedKey: key })
    }
    if ((match.category || 'membership') !== (template.category || 'membership')) {
      plan.toRepairCategory.push({
        id: match.id,
        category: template.category || 'membership',
      })
    }
  }

  return plan
}
