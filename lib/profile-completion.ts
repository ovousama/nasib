export const BROTHER_REQUIRED_FIELDS: string[] = [
  'full_name', 'age', 'location',
  'religiosity_level', 'prayer_frequency',
  'islamic_knowledge_level',
  'education_level', 'living_situation',
  'smoking', 'strict_halal_diet',
  'financial_readiness',
  'timeline_to_marry',
  'previously_married', 'has_children',
  'wants_children', 'number_of_children_wanted',
  'polygamy_openness',
  'has_significant_debt', 'mahr_approach',
  'character_description', 'goals',
  'conflict_style', 'love_language',
  'introvert_extrovert',
  'emotional_availability',
  'stress_management',
  'do_you_listen_to_music',
  'traditional_vs_reformist',
  'parent_relationship',
  'inlaws_living_together',
  'family_spouse_disagreement',
  'wife_working_openness',
  'marriage_vision_10_years',
  'romance_view', 'marriage_fear',
  'unique_contribution',
  'photo_urls',
]

export const SISTER_REQUIRED_FIELDS: string[] = [
  'full_name', 'age', 'location',
  'religiosity_level', 'prayer_frequency',
  'islamic_knowledge_level',
  'education_level', 'living_situation',
  'smoking', 'strict_halal_diet',
  'timeline_to_marry',
  'previously_married', 'has_children',
  'wants_children', 'number_of_children_wanted',
  'polygamy_openness',
  'has_significant_debt',
  'plan_to_work_after_marriage',
  'financial_independence_importance',
  'character_description', 'goals',
  'conflict_style', 'love_language',
  'introvert_extrovert',
  'emotional_availability',
  'stress_management',
  'do_you_listen_to_music',
  'traditional_vs_reformist',
  'parent_relationship',
  'inlaws_living_together',
  'family_spouse_disagreement',
  'marriage_vision_10_years',
  'romance_view', 'marriage_fear',
  'unique_contribution',
  'photo_urls',
]

function isMissing(value: unknown): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'number') return false  // 0 is a valid slider answer
  if (typeof value === 'string' && value.trim() === '') return true
  if (Array.isArray(value) && value.length === 0) return true
  return false
}

export function calculateCompletion(
  profile: Record<string, unknown>,
  gender: 'brother' | 'sister',
): { percentage: number; missingFields: string[]; isComplete: boolean } {
  const fields = gender === 'brother' ? BROTHER_REQUIRED_FIELDS : SISTER_REQUIRED_FIELDS
  const missingFields = fields.filter(f => {
    if (f === 'photo_urls') {
      const urls = profile[f]
      return !Array.isArray(urls) || urls.length < 3
    }
    return isMissing(profile[f])
  })
  const filled = fields.length - missingFields.length
  const percentage = Math.round((filled / fields.length) * 100)
  return {
    percentage,
    missingFields,
    isComplete: percentage >= 80,
  }
}
