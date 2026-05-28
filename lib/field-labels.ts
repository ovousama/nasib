export const BROTHER_FIELD_LABELS: Record<string, string> = {
  // Basic Info
  full_name: 'Full name',
  age: 'Age',
  location: 'Location',
  ethnicity: 'Ethnicity',
  languages: 'Languages spoken',
  willing_to_relocate: 'Would you be willing to relocate for marriage?',

  // Deen & Practice
  religiosity_level: 'Level of Islamic practice',
  prayer_frequency: 'Prayer frequency',
  madhab: 'Madhab',
  islamic_knowledge_level: 'Islamic knowledge level',
  has_beard: 'Has a beard',
  traditional_vs_reformist: 'Islamic approach (Traditional ↔ Reformist)',
  do_you_listen_to_music: 'Listens to music',

  // Lifestyle
  occupation: 'Occupation',
  education_level: 'Education level',
  living_situation: 'Current living situation',
  smoking: 'Do you smoke or use tobacco/vape products?',
  strict_halal_diet: 'How strictly do you follow a halal diet?',
  financial_readiness: 'Financial readiness for marriage',

  // Marriage
  previously_married: 'Previously married',
  has_children: 'Has children',
  wants_children: 'Do you want children?',
  number_of_children_wanted: 'Number of children wanted',
  timeline_to_marry: 'Timeline to marry',
  polygamy_openness: 'What is your view on polygamy?',

  // Spouse Preferences
  spouse_age_min: 'Preferred minimum age',
  spouse_age_max: 'Preferred maximum age',
  spouse_religiosity_preference: 'What level of practice do you prefer in a spouse?',
  dealbreakers: 'Dealbreakers',

  // Financial
  has_significant_debt: 'Has significant debt',
  mahr_approach: 'Approach to mahr',

  // Character & Goals
  character_description: 'How would those closest to you describe you?',
  goals: 'What do you hope to build together in a marriage?',
  conflict_style: 'Conflict style',
  love_language: 'Love language',
  introvert_extrovert: 'Introvert or extrovert',
  emotional_availability: 'Emotional availability',
  stress_management: 'How they manage stress',

  // Family
  parent_relationship: 'Relationship with parents',
  inlaws_living_together: 'Open to in-laws living together',
  family_spouse_disagreement: 'How he handles family vs spouse disagreements',
  wife_working_openness: 'Open to wife working after marriage',

  // Marriage Vision
  marriage_vision_10_years: 'Marriage vision in 10 years',
  romance_view: 'Role of romance in long-term marriage',
  marriage_fear: 'Biggest fear about marriage',
  unique_contribution: 'What they uniquely bring to a marriage',
  health_background_disclosure: 'Health background disclosure',
}

export const SISTER_FIELD_LABELS: Record<string, string> = {
  // Basic Info
  full_name: 'Full name',
  age: 'Age',
  location: 'Location',
  ethnicity: 'Ethnicity',
  languages: 'Languages spoken',
  willing_to_relocate: 'Would you be willing to relocate for marriage?',

  // Deen & Practice
  religiosity_level: 'Level of Islamic practice',
  prayer_frequency: 'Prayer frequency',
  madhab: 'Madhab',
  islamic_knowledge_level: 'Islamic knowledge level',
  wears_hijab: 'Wears hijab',
  traditional_vs_reformist: 'Islamic approach (Traditional ↔ Reformist)',
  do_you_listen_to_music: 'Listens to music',

  // Lifestyle
  occupation: 'Occupation',
  education_level: 'Education level',
  living_situation: 'Current living situation',
  smoking: 'Do you smoke or use tobacco/vape products?',
  strict_halal_diet: 'How strictly do you follow a halal diet?',

  // Marriage
  previously_married: 'Previously married',
  has_children: 'Has children',
  wants_children: 'Do you want children?',
  number_of_children_wanted: 'Number of children wanted',
  timeline_to_marry: 'Timeline to marry',
  polygamy_openness: 'What is your view on polygamy?',

  // Spouse Preferences
  spouse_age_min: 'Preferred minimum age',
  spouse_age_max: 'Preferred maximum age',
  spouse_religiosity_preference: 'What level of practice do you prefer in a spouse?',
  dealbreakers: 'Dealbreakers',

  // Financial
  has_significant_debt: 'Has significant debt',
  plan_to_work_after_marriage: 'Plans to work after marriage',
  financial_independence_importance: 'Importance of financial independence',

  // Character & Goals
  character_description: 'How would your family or close friends describe you?',
  goals: 'What do you hope to build together in a marriage?',
  conflict_style: 'Conflict style',
  love_language: 'Love language',
  introvert_extrovert: 'Introvert or extrovert',
  emotional_availability: 'Emotional availability',
  stress_management: 'How they manage stress',

  // Family
  parent_relationship: 'Relationship with parents',
  inlaws_living_together: 'Open to in-laws living together',
  family_spouse_disagreement: 'How she handles family vs spouse disagreements',

  // Marriage Vision
  marriage_vision_10_years: 'Marriage vision in 10 years',
  romance_view: 'Role of romance in long-term marriage',
  marriage_fear: 'Biggest fear about marriage',
  unique_contribution: 'What they uniquely bring to a marriage',
  health_background_disclosure: 'Health background disclosure',
}

export function getFieldLabel(field: string, gender: 'brother' | 'sister'): string {
  const labels = gender === 'brother' ? BROTHER_FIELD_LABELS : SISTER_FIELD_LABELS
  return labels[field] ?? field
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
}

// ─── Value formatting ────────────────────────────────────────────────────────

export const SLIDER_FIELDS = [
  'traditional_vs_reformist',
  'emotional_availability',
]

export const SLIDER_LABELS: Record<string, { left: string; right: string }> = {
  traditional_vs_reformist: { left: 'Traditional', right: 'Reformist' },
  emotional_availability: { left: 'Reserved', right: 'Open' },
}

export const VALUE_LABELS: Record<string, Record<string, string>> = {
  religiosity_level: {
    practicing: 'Practicing',
    moderately_practicing: 'Moderately practicing',
    spiritually_inclined: 'Spiritually inclined',
    still_growing: 'Still growing in faith',
    learning: 'Still learning',
  },
  prayer_frequency: {
    five_times_daily: 'Five times daily',
    most_prayers: 'Most prayers',
    some_prayers: 'Some prayers',
    jummah_only: 'Jummah only',
    not_currently: 'Not currently',
  },
  madhab: {
    hanafi: 'Hanafi',
    shafi: "Shafi'i",
    maliki: 'Maliki',
    hanbali: 'Hanbali',
    no_specific_madhab: 'No specific madhab',
    salafi: 'Salafi',
  },
  timeline_to_marry: {
    within_3_months: 'Within 3 months',
    within_6_months: 'Within 6 months',
    within_a_year: 'Within a year',
    flexible: 'Flexible',
  },
  education_level: {
    high_school: 'High school',
    some_college: 'Some college',
    bachelors: "Bachelor's degree",
    masters: "Master's degree",
    doctorate: 'Doctorate',
    professional: 'Professional degree',
    trade: 'Trade qualification',
  },
  living_situation: {
    with_family: 'With family',
    independent: 'Independent',
    with_roommates: 'With roommates',
  },
  islamic_knowledge_level: {
    basic: 'Basic',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
    scholar: 'Scholar-level',
  },
  willing_to_relocate: {
    yes: 'Yes',
    no: 'No',
    depends: 'Depends on circumstances',
  },
  wants_children: {
    yes: 'Yes',
    no: 'No',
    open: 'Open to whatever Allah wills',
  },
  polygamy_openness: {
    open: 'Open to it',
    not_for_me: 'Not for me but I respect it Islamically',
    against: 'Firmly against',
    undecided: 'Have not decided',
  },
  spouse_religiosity_preference: {
    more_practicing: 'More practicing than me',
    similar: 'Similar to me',
    less_is_fine: 'Less practicing is fine',
    open: 'Open',
  },
  conflict_style: {
    avoidant: 'Avoidant',
    direct: 'Direct',
    collaborative: 'Collaborative',
    emotional: 'Emotional',
  },
  introvert_extrovert: {
    introvert: 'Introvert',
    extrovert: 'Extrovert',
    ambivert: 'Ambivert',
  },
  smoking: {
    never: 'No, never',
    occasionally: 'Occasionally',
    trying_to_quit: 'Trying to quit',
    yes: 'Yes',
  },
  strict_halal_diet: {
    strictly: 'Strictly halal',
    mostly: 'Mostly halal',
    not_strict: 'Not strict',
    prefer_not_to_say: 'Prefer not to say',
  },
  plan_to_work_after_marriage: {
    yes_full_time: 'Yes — full time',
    yes_part_time: 'Yes — part time',
    flexible: 'Flexible',
    no: 'No, prefer to focus on family',
    undecided: 'Undecided',
  },
  financial_independence_importance: {
    very_important: 'Very important',
    somewhat_important: 'Somewhat important',
    not_important: 'Not important',
    undecided: 'Undecided',
  },
  wife_working_openness: {
    yes: 'Yes, fully supportive',
    part_time: 'Part-time is fine',
    depends: 'Depends on the situation',
    prefer_home: 'Prefer she focuses on home',
  },
  inlaws_living_together: {
    yes: 'Yes, open to it',
    no: 'No, prefer separate',
    temporarily: 'Temporarily if needed',
    undecided: 'Undecided',
  },
  number_of_children_wanted: {
    '1': '1',
    '2': '2',
    '3': '3',
    '4': '4',
    '5_plus': '5 or more',
    open: 'Open to whatever Allah wills',
  },
  financial_readiness: {
    fully_ready: 'Fully ready',
    almost_ready: 'Almost ready',
    working_towards_it: 'Working towards it',
  },
  ethnicity: {
    arab: 'Arab',
    south_asian: 'South Asian',
    african: 'African',
    east_asian: 'East Asian',
    european: 'European',
    caribbean: 'Caribbean',
    latin_american: 'Latin American',
    mixed: 'Mixed heritage',
    other: 'Other',
  },
  spouse_age_min: {},
  spouse_age_max: {},
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatFieldValue(value: any, fieldKey?: string): string {
  if (value === null || value === undefined || value === '') return ''
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'

  if (Array.isArray(value)) {
    return value.map(v => formatFieldValue(v, fieldKey)).filter(Boolean).join(', ')
  }

  if (fieldKey && typeof value === 'string' && VALUE_LABELS[fieldKey]?.[value]) {
    return VALUE_LABELS[fieldKey][value]
  }

  if (typeof value === 'string') {
    return value
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase())
  }

  if (typeof value === 'number') {
    if (fieldKey && SLIDER_FIELDS.includes(fieldKey)) return `${value}%`
    return value.toString()
  }

  return String(value)
}
