import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const PASSWORD = 'NasibTest2024!'
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// ─── Brother data ─────────────────────────────────────────────────────────────

const BROTHERS = [
  {
    email: 'brother1@nasib.test',
    core: {
      full_name: 'Omar Hassan',
      age: 28,
      location: 'London, UK',
      ethnicity: 'Arab',
      languages: ['English', 'Arabic'],
      religiosity_level: 'practicing',
      madhab: 'Hanafi',
      prayer_frequency: '5 times daily',
      islamic_knowledge_level: 'Intermediate',
      has_beard: true,
      occupation: 'Software Engineer',
      education_level: "Bachelor's degree",
      living_situation: 'With family',
      willing_to_relocate: true,
      financial_readiness: 'Ready',
      polygamy_openness: false,
      previously_married: false,
      has_children: false,
      wants_children: true,
      timeline_to_marry: 'Within 6 months',
      spouse_religiosity_preference: 'practicing',
      spouse_age_min: 22,
      spouse_age_max: 30,
      dealbreakers: ['Smoking', 'Not practising'],
      character_description: 'Calm, honest, and family-oriented. I value deep conversations and consistency in deen.',
      goals: 'Build a home grounded in Islam, raise righteous children, and contribute to the community.',
    },
    additional: {
      do_you_listen_to_music: 'No',
      celebrate_non_islamic_holidays: 'No',
      wife_hijab_importance: 'Required',
      jumuah_attendance: 'Every week',
      differing_islamic_opinions: 'I believe we should discuss openly and respect each other\'s madhab, prioritising mutual understanding.',
      annual_income_range: '$60k–$100k',
      own_or_rent: 'Living with family',
      has_significant_debt: 'No',
      supporting_family_financially: 'Yes — some',
      mahr_approach: 'Mahr should be meaningful but not a burden. I\'ll discuss it honestly with the wali.',
      number_of_children_wanted: '3–4',
      wife_working_openness: 'Yes fully',
      household_management: 'Shared responsibilities',
      inlaws_living_together: 'Open to it',
      islamic_schooling_importance: 'Very important',
      weekend_lifestyle: 'Family time, Islamic circles, outdoor walks, and occasional travel.',
      mixed_gender_social_circle: 'No',
      travel_frequency: 'Once or twice a year',
      strict_halal_diet: 'Yes',
      smoking: 'No',
      conflict_style: 'Calm discussion',
      introvert_extrovert: 'Introvert',
      love_language: ['Quality time', 'Words of affirmation'],
      alone_time_importance: 'Somewhat important',
      health_background_disclosure: null,
    },
    reference: {
      referee_name: 'Imam Abdullah Naseem',
      referee_relationship: 'Imam at local masjid',
      referee_email: 'imam@eastlondon.test',
      referee_phone: null,
      status: 'pending',
    },
  },
  {
    email: 'brother2@nasib.test',
    core: {
      full_name: 'Yusuf Ahmed',
      age: 31,
      location: 'Manchester, UK',
      ethnicity: 'Pakistani',
      languages: ['English', 'Urdu', 'Punjabi'],
      religiosity_level: 'practicing',
      madhab: "Hanafi",
      prayer_frequency: '5 times daily',
      islamic_knowledge_level: 'Advanced',
      has_beard: true,
      occupation: 'Doctor (GP)',
      education_level: 'Medical degree',
      living_situation: 'Alone',
      willing_to_relocate: false,
      financial_readiness: 'Ready',
      polygamy_openness: false,
      previously_married: false,
      has_children: false,
      wants_children: true,
      timeline_to_marry: 'Within 3 months',
      spouse_religiosity_preference: 'practicing',
      spouse_age_min: 24,
      spouse_age_max: 32,
      dealbreakers: ['Smoking', 'No hijab', 'Not serious about deen'],
      character_description: 'Driven and grounded. I work hard but make time for family and community.',
      goals: 'A peaceful home built on mutual respect, strong iman, and shared goals.',
    },
    additional: {
      do_you_listen_to_music: 'No',
      celebrate_non_islamic_holidays: 'No',
      wife_hijab_importance: 'Required',
      jumuah_attendance: 'Every week',
      differing_islamic_opinions: 'We follow the Hanafi madhab but I appreciate scholarly differences and would discuss respectfully.',
      annual_income_range: '$100k–$150k',
      own_or_rent: 'Rent',
      has_significant_debt: 'No',
      supporting_family_financially: 'Yes — some',
      mahr_approach: 'Agreed upon thoughtfully — a symbol of commitment, not a transaction.',
      number_of_children_wanted: '3–4',
      wife_working_openness: "Yes with conditions",
      household_management: 'Shared — she manages the home, I support fully',
      inlaws_living_together: 'Prefer not',
      islamic_schooling_importance: 'Very important',
      weekend_lifestyle: 'Islamic studies, family visits, nature walks, and reading.',
      mixed_gender_social_circle: 'No',
      travel_frequency: 'Once a year',
      strict_halal_diet: 'Yes',
      smoking: 'No',
      conflict_style: 'Cool down then talk',
      introvert_extrovert: 'Ambivert',
      love_language: ['Acts of service', 'Quality time'],
      alone_time_importance: 'Very important',
      health_background_disclosure: null,
    },
    reference: {
      referee_name: 'Dr Tariq Mulla',
      referee_relationship: 'Senior colleague and friend',
      referee_email: 'tariq.mulla@nhs.test',
      referee_phone: null,
      status: 'pending',
    },
  },
  {
    email: 'brother3@nasib.test',
    core: {
      full_name: 'Ibrahim Ali',
      age: 26,
      location: 'Birmingham, UK',
      ethnicity: 'Somali',
      languages: ['English', 'Somali', 'Arabic'],
      religiosity_level: 'practicing',
      madhab: "Shafi'i",
      prayer_frequency: '5 times daily',
      islamic_knowledge_level: 'Intermediate',
      has_beard: true,
      occupation: 'Secondary School Teacher',
      education_level: "Bachelor's degree",
      living_situation: 'With family',
      willing_to_relocate: true,
      financial_readiness: 'Almost ready',
      polygamy_openness: false,
      previously_married: false,
      has_children: false,
      wants_children: true,
      timeline_to_marry: 'Within 6 months',
      spouse_religiosity_preference: 'practicing',
      spouse_age_min: 20,
      spouse_age_max: 28,
      dealbreakers: ['Drugs', 'Alcohol', 'Not religious'],
      character_description: 'Patient, gentle, and deeply community-minded. Teaching is a calling for me.',
      goals: 'A simple, barakah-filled life with a righteous spouse and a home filled with Quran.',
    },
    additional: {
      do_you_listen_to_music: 'Nasheeds only',
      celebrate_non_islamic_holidays: 'No',
      wife_hijab_importance: 'Strongly preferred',
      jumuah_attendance: 'Every week',
      differing_islamic_opinions: 'Respect is key. Differences in fiqh are normal and we would research together.',
      annual_income_range: '$30k–$60k',
      own_or_rent: 'Living with family',
      has_significant_debt: 'No',
      supporting_family_financially: 'Yes — significant',
      mahr_approach: 'Simple and sincere — following the Sunnah of keeping it manageable.',
      number_of_children_wanted: '3–4',
      wife_working_openness: 'Yes fully',
      household_management: 'Shared responsibilities',
      inlaws_living_together: 'Open to it',
      islamic_schooling_importance: 'Very important',
      weekend_lifestyle: 'Community events, masjid activities, family visits, outdoor activities.',
      mixed_gender_social_circle: 'No',
      travel_frequency: 'Rarely',
      strict_halal_diet: 'Yes',
      smoking: 'No',
      conflict_style: 'Calm discussion',
      introvert_extrovert: 'Introvert',
      love_language: ['Words of affirmation', 'Quality time'],
      alone_time_importance: 'Important',
      health_background_disclosure: null,
    },
    reference: {
      referee_name: 'Ustaadh Khalil Dirie',
      referee_relationship: 'Islamic studies teacher',
      referee_email: 'khalil@bicc.test',
      referee_phone: null,
      status: 'pending',
    },
  },
  {
    email: 'brother4@nasib.test',
    core: {
      full_name: 'Khalid Rahman',
      age: 33,
      location: 'Leeds, UK',
      ethnicity: 'Bangladeshi',
      languages: ['English', 'Bengali', 'Arabic'],
      religiosity_level: 'moderately_practicing',
      madhab: 'Hanafi',
      prayer_frequency: 'mostly',
      islamic_knowledge_level: 'Intermediate',
      has_beard: true,
      occupation: 'Chartered Accountant',
      education_level: "Bachelor's degree",
      living_situation: 'Own property',
      willing_to_relocate: false,
      financial_readiness: 'Ready',
      polygamy_openness: false,
      previously_married: false,
      has_children: false,
      wants_children: true,
      timeline_to_marry: 'Within a year',
      spouse_religiosity_preference: 'moderately_practicing',
      spouse_age_min: 25,
      spouse_age_max: 33,
      dealbreakers: ['Smoking', 'Not open to children'],
      character_description: 'Reliable, analytical, and caring. I believe in honest communication and mutual growth.',
      goals: 'A stable home where both of us can grow professionally and spiritually.',
    },
    additional: {
      do_you_listen_to_music: 'Occasionally',
      celebrate_non_islamic_holidays: 'Birthdays only',
      wife_hijab_importance: 'Preferred',
      jumuah_attendance: 'Most weeks',
      differing_islamic_opinions: 'I believe mutual respect and research together leads to the best outcomes.',
      annual_income_range: '$60k–$100k',
      own_or_rent: 'Own',
      has_significant_debt: 'No',
      supporting_family_financially: 'Yes — some',
      mahr_approach: 'Fair and agreed together — I want her to feel valued.',
      number_of_children_wanted: '1–2',
      wife_working_openness: 'Yes fully',
      household_management: 'Shared responsibilities',
      inlaws_living_together: 'Prefer not',
      islamic_schooling_importance: 'Important',
      weekend_lifestyle: 'Relaxed weekends — cooking together, visiting family, occasional outings.',
      mixed_gender_social_circle: 'No',
      travel_frequency: 'Once a year',
      strict_halal_diet: 'Yes',
      smoking: 'No',
      conflict_style: 'Calm discussion',
      introvert_extrovert: 'Introvert',
      love_language: ['Acts of service', 'Words of affirmation'],
      alone_time_importance: 'Important',
      health_background_disclosure: null,
    },
    reference: {
      referee_name: 'Mufti Salman Hussain',
      referee_relationship: 'Family imam',
      referee_email: 'mufti@leedsjamia.test',
      referee_phone: null,
      status: 'pending',
    },
  },
  {
    email: 'brother5@nasib.test',
    core: {
      full_name: 'Tariq Malik',
      age: 29,
      location: 'Glasgow, UK',
      ethnicity: 'Pakistani',
      languages: ['English', 'Urdu'],
      religiosity_level: 'practicing',
      madhab: 'Hanafi',
      prayer_frequency: '5 times daily',
      islamic_knowledge_level: 'Intermediate',
      has_beard: true,
      occupation: 'Business Owner',
      education_level: "Bachelor's degree",
      living_situation: 'Own property',
      willing_to_relocate: true,
      financial_readiness: 'Ready',
      polygamy_openness: false,
      previously_married: false,
      has_children: false,
      wants_children: true,
      timeline_to_marry: 'Within 3 months',
      spouse_religiosity_preference: 'practicing',
      spouse_age_min: 22,
      spouse_age_max: 30,
      dealbreakers: ['Smoking', 'Not serious about deen', 'No interest in family'],
      character_description: 'Entrepreneurial, warm, and values-driven. My faith is my compass in business and life.',
      goals: 'A partnership where we support each other\'s growth in deen, family, and purpose.',
    },
    additional: {
      do_you_listen_to_music: 'No',
      celebrate_non_islamic_holidays: 'No',
      wife_hijab_importance: 'Required',
      jumuah_attendance: 'Every week',
      differing_islamic_opinions: 'Open dialogue with mutual respect — we would consult scholars together.',
      annual_income_range: '$100k–$150k',
      own_or_rent: 'Own',
      has_significant_debt: 'No',
      supporting_family_financially: 'No',
      mahr_approach: 'A meaningful amount agreed upon respectfully with her wali.',
      number_of_children_wanted: '3–4',
      wife_working_openness: 'Her choice',
      household_management: 'Shared — based on what suits us',
      inlaws_living_together: 'Open to it',
      islamic_schooling_importance: 'Very important',
      weekend_lifestyle: 'Family, community, fitness, and occasional travel for Umrah.',
      mixed_gender_social_circle: 'No',
      travel_frequency: 'A few times a year',
      strict_halal_diet: 'Yes',
      smoking: 'No',
      conflict_style: 'Talk it through immediately',
      introvert_extrovert: 'Extrovert',
      love_language: ['Quality time', 'Gifts'],
      alone_time_importance: 'Somewhat important',
      health_background_disclosure: null,
    },
    reference: {
      referee_name: 'Shaykh Bilal Patel',
      referee_relationship: 'Local Islamic scholar',
      referee_email: 'shaykh@glasgowmasjid.test',
      referee_phone: null,
      status: 'pending',
    },
  },
  {
    email: 'brother6@nasib.test',
    core: {
      full_name: 'Zayn Abdullah',
      age: 27,
      location: 'Leicester, UK',
      ethnicity: 'Arab',
      languages: ['English', 'Arabic'],
      religiosity_level: 'practicing',
      madhab: "Shafi'i",
      prayer_frequency: '5 times daily',
      islamic_knowledge_level: 'Advanced',
      has_beard: true,
      occupation: 'Pharmacist',
      education_level: 'Masters degree',
      living_situation: 'With family',
      willing_to_relocate: false,
      financial_readiness: 'Ready',
      polygamy_openness: false,
      previously_married: false,
      has_children: false,
      wants_children: true,
      timeline_to_marry: 'Within 6 months',
      spouse_religiosity_preference: 'practicing',
      spouse_age_min: 21,
      spouse_age_max: 28,
      dealbreakers: ['Smoking', 'Not religious', 'No hijab'],
      character_description: 'Thoughtful, principled, and deeply rooted in Islamic tradition.',
      goals: 'A home of knowledge, worship, and love — where our children grow with strong iman.',
    },
    additional: {
      do_you_listen_to_music: 'No',
      celebrate_non_islamic_holidays: 'No',
      wife_hijab_importance: 'Required',
      jumuah_attendance: 'Every week',
      differing_islamic_opinions: 'I follow the Shafi\'i madhab and would respect my wife\'s. Scholars can be consulted.',
      annual_income_range: '$60k–$100k',
      own_or_rent: 'Living with family',
      has_significant_debt: 'No',
      supporting_family_financially: 'Yes — some',
      mahr_approach: 'Following the Sunnah — agreed with the wali and kept sincere.',
      number_of_children_wanted: '5+',
      wife_working_openness: "Prefer she doesn't",
      household_management: 'She manages the home, I provide — with mutual support',
      inlaws_living_together: 'Open to it',
      islamic_schooling_importance: 'Very important',
      weekend_lifestyle: 'Islamic circles, family time, and Quran study.',
      mixed_gender_social_circle: 'No',
      travel_frequency: 'Rarely',
      strict_halal_diet: 'Yes',
      smoking: 'No',
      conflict_style: 'Calm discussion',
      introvert_extrovert: 'Introvert',
      love_language: ['Words of affirmation', 'Quality time'],
      alone_time_importance: 'Very important',
      health_background_disclosure: null,
    },
    reference: {
      referee_name: 'Dr Yusuf al-Qadi',
      referee_relationship: 'Imam and mentor',
      referee_email: 'yusuf@leicestermasjid.test',
      referee_phone: null,
      status: 'pending',
    },
  },
  {
    email: 'brother7@nasib.test',
    core: {
      full_name: 'Hamza Qureshi',
      age: 35,
      location: 'London, UK',
      ethnicity: 'Pakistani',
      languages: ['English', 'Urdu', 'Punjabi'],
      religiosity_level: 'moderately_practicing',
      madhab: 'Hanafi',
      prayer_frequency: 'mostly',
      islamic_knowledge_level: 'Intermediate',
      has_beard: false,
      occupation: 'Solicitor',
      education_level: 'Masters degree',
      living_situation: 'Alone',
      willing_to_relocate: false,
      financial_readiness: 'Ready',
      polygamy_openness: false,
      previously_married: true,
      has_children: false,
      wants_children: true,
      timeline_to_marry: 'Within 6 months',
      spouse_religiosity_preference: 'moderately_practicing',
      spouse_age_min: 26,
      spouse_age_max: 36,
      dealbreakers: ['Smoking', 'No interest in children'],
      character_description: 'Measured, professional, and emotionally mature. I\'ve grown a lot and I\'m ready for the right person.',
      goals: 'A calm, loving home — a partnership of equals who bring out the best in each other.',
    },
    additional: {
      do_you_listen_to_music: 'Occasionally',
      celebrate_non_islamic_holidays: 'Birthdays only',
      wife_hijab_importance: 'Preferred',
      jumuah_attendance: 'Most weeks',
      differing_islamic_opinions: 'I respect different schools — open discussion and scholarship is important.',
      annual_income_range: '$100k–$150k',
      own_or_rent: 'Own',
      has_significant_debt: 'No',
      supporting_family_financially: 'Yes — some',
      mahr_approach: 'Generous and agreed upon mutually — I want her to feel honoured.',
      number_of_children_wanted: '1–2',
      wife_working_openness: 'Yes fully',
      household_management: 'Shared responsibilities',
      inlaws_living_together: 'Prefer not',
      islamic_schooling_importance: 'Important',
      weekend_lifestyle: 'Quiet weekends — good food, walks, films at home, friends occasionally.',
      mixed_gender_social_circle: 'No',
      travel_frequency: 'Once a year',
      strict_halal_diet: 'Yes',
      smoking: 'No',
      conflict_style: 'Cool down then talk',
      introvert_extrovert: 'Ambivert',
      love_language: ['Quality time', 'Acts of service'],
      alone_time_importance: 'Important',
      health_background_disclosure: null,
    },
    reference: {
      referee_name: 'Mufti Zaid Hamdan',
      referee_relationship: 'Family scholar',
      referee_email: 'mufti.zaid@londonmasjid.test',
      referee_phone: null,
      status: 'pending',
    },
  },
  {
    email: 'brother8@nasib.test',
    core: {
      full_name: 'Bilal Hussain',
      age: 30,
      location: 'Bradford, UK',
      ethnicity: 'Pakistani',
      languages: ['English', 'Urdu', 'Mirpuri'],
      religiosity_level: 'practicing',
      madhab: 'Hanafi',
      prayer_frequency: '5 times daily',
      islamic_knowledge_level: 'Intermediate',
      has_beard: true,
      occupation: 'Civil Engineer',
      education_level: "Bachelor's degree",
      living_situation: 'With family',
      willing_to_relocate: true,
      financial_readiness: 'Almost ready',
      polygamy_openness: false,
      previously_married: false,
      has_children: false,
      wants_children: true,
      timeline_to_marry: 'Within a year',
      spouse_religiosity_preference: 'practicing',
      spouse_age_min: 22,
      spouse_age_max: 30,
      dealbreakers: ['Smoking', 'No hijab', 'Not practising'],
      character_description: 'Hardworking, grounded, and deeply attached to my family and faith.',
      goals: 'A home where the adhaan is heard daily and our children are raised with taqwa.',
    },
    additional: {
      do_you_listen_to_music: 'No',
      celebrate_non_islamic_holidays: 'No',
      wife_hijab_importance: 'Required',
      jumuah_attendance: 'Every week',
      differing_islamic_opinions: 'We follow the Hanafi school together but respect scholarly difference.',
      annual_income_range: '$30k–$60k',
      own_or_rent: 'Living with family',
      has_significant_debt: 'No',
      supporting_family_financially: 'Yes — significant',
      mahr_approach: 'Following the Sunnah — meaningful and agreed with her wali.',
      number_of_children_wanted: '3–4',
      wife_working_openness: "Prefer she doesn't",
      household_management: 'Traditional — I provide, she manages the home',
      inlaws_living_together: 'Yes',
      islamic_schooling_importance: 'Very important',
      weekend_lifestyle: 'Masjid, family gatherings, outdoor time in nature.',
      mixed_gender_social_circle: 'No',
      travel_frequency: 'Rarely',
      strict_halal_diet: 'Yes',
      smoking: 'No',
      conflict_style: 'Calm discussion',
      introvert_extrovert: 'Introvert',
      love_language: ['Acts of service', 'Quality time'],
      alone_time_importance: 'Somewhat important',
      health_background_disclosure: null,
    },
    reference: {
      referee_name: 'Maulana Farid Akhtar',
      referee_relationship: 'Masjid imam and family friend',
      referee_email: 'maulana@bradfordmasjid.test',
      referee_phone: null,
      status: 'pending',
    },
  },
  {
    email: 'brother9@nasib.test',
    core: {
      full_name: 'Amir Khan',
      age: 32,
      location: 'London, UK',
      ethnicity: 'Indian',
      languages: ['English', 'Hindi', 'Urdu'],
      religiosity_level: 'moderately_practicing',
      madhab: 'Hanafi',
      prayer_frequency: 'mostly',
      islamic_knowledge_level: 'Beginner',
      has_beard: false,
      occupation: 'Finance Analyst',
      education_level: "Bachelor's degree",
      living_situation: 'Alone',
      willing_to_relocate: false,
      financial_readiness: 'Ready',
      polygamy_openness: false,
      previously_married: false,
      has_children: false,
      wants_children: true,
      timeline_to_marry: 'Within a year',
      spouse_religiosity_preference: 'moderately_practicing',
      spouse_age_min: 25,
      spouse_age_max: 33,
      dealbreakers: ['Smoking', 'Alcohol'],
      character_description: 'Ambitious but grounded. I\'m working on my deen and want a partner who supports that journey.',
      goals: 'Stability, love, and raising children with strong values in a nurturing home.',
    },
    additional: {
      do_you_listen_to_music: 'Yes',
      celebrate_non_islamic_holidays: 'Birthdays only',
      wife_hijab_importance: 'Preferred',
      jumuah_attendance: 'Most weeks',
      differing_islamic_opinions: 'I\'m still learning — I would consult a trusted scholar together with my wife.',
      annual_income_range: '$60k–$100k',
      own_or_rent: 'Rent',
      has_significant_debt: 'No',
      supporting_family_financially: 'No',
      mahr_approach: 'Generous but realistic — agreed together.',
      number_of_children_wanted: '1–2',
      wife_working_openness: 'Yes fully',
      household_management: 'Shared responsibilities',
      inlaws_living_together: 'Prefer not',
      islamic_schooling_importance: 'Important',
      weekend_lifestyle: 'Socialising, cooking, hiking, and catching up with family.',
      mixed_gender_social_circle: 'No',
      travel_frequency: 'A few times a year',
      strict_halal_diet: 'Yes',
      smoking: 'No',
      conflict_style: 'Talk it through immediately',
      introvert_extrovert: 'Ambivert',
      love_language: ['Quality time', 'Physical touch'],
      alone_time_importance: 'Somewhat important',
      health_background_disclosure: null,
    },
    reference: {
      referee_name: 'Mufti Naeem Siddiqui',
      referee_relationship: 'Family scholar',
      referee_email: 'mufti.naeem@eastlondon.test',
      referee_phone: null,
      status: 'pending',
    },
  },
  {
    email: 'brother10@nasib.test',
    core: {
      full_name: 'Nour Eldin',
      age: 28,
      location: 'London, UK',
      ethnicity: 'Egyptian',
      languages: ['English', 'Arabic', 'French'],
      religiosity_level: 'practicing',
      madhab: "Shafi'i",
      prayer_frequency: '5 times daily',
      islamic_knowledge_level: 'Advanced',
      has_beard: true,
      occupation: 'Architect',
      education_level: 'Masters degree',
      living_situation: 'Alone',
      willing_to_relocate: true,
      financial_readiness: 'Ready',
      polygamy_openness: false,
      previously_married: false,
      has_children: false,
      wants_children: true,
      timeline_to_marry: 'Within 6 months',
      spouse_religiosity_preference: 'practicing',
      spouse_age_min: 22,
      spouse_age_max: 30,
      dealbreakers: ['Not religious', 'Smoking'],
      character_description: 'Creative, principled, and deeply spiritually motivated. I design spaces and aspire to design a beautiful family life.',
      goals: 'A home that reflects our values — aesthetic, spiritual, and rooted in love and taqwa.',
    },
    additional: {
      do_you_listen_to_music: 'No',
      celebrate_non_islamic_holidays: 'No',
      wife_hijab_importance: 'Required',
      jumuah_attendance: 'Every week',
      differing_islamic_opinions: 'I follow the Shafi\'i madhab and respect others. We would learn together.',
      annual_income_range: '$60k–$100k',
      own_or_rent: 'Rent',
      has_significant_debt: 'No',
      supporting_family_financially: 'Yes — some',
      mahr_approach: 'Sincere and agreed together — not transactional.',
      number_of_children_wanted: '3–4',
      wife_working_openness: 'Her choice',
      household_management: 'Shared responsibilities',
      inlaws_living_together: 'Prefer not',
      islamic_schooling_importance: 'Very important',
      weekend_lifestyle: 'Walks, art galleries, Islamic lectures, cooking, and quality family time.',
      mixed_gender_social_circle: 'No',
      travel_frequency: 'A few times a year',
      strict_halal_diet: 'Yes',
      smoking: 'No',
      conflict_style: 'Calm discussion',
      introvert_extrovert: 'Introvert',
      love_language: ['Words of affirmation', 'Quality time'],
      alone_time_importance: 'Important',
      health_background_disclosure: null,
    },
    reference: {
      referee_name: 'Shaykh Mahmoud Rifai',
      referee_relationship: 'Mentor and Islamic teacher',
      referee_email: 'mahmoud@egyptianmasjid.test',
      referee_phone: null,
      status: 'pending',
    },
  },
]

// ─── Sister data ──────────────────────────────────────────────────────────────

const SISTERS = [
  {
    email: 'sister1@nasib.test',
    waliEmail: 'wali1@nasib.test',
    core: {
      full_name: 'Fatima Hassan',
      age: 25,
      location: 'London, UK',
      ethnicity: 'Arab',
      languages: ['English', 'Arabic'],
      religiosity_level: 'practicing',
      madhab: 'Hanafi',
      prayer_frequency: '5 times daily',
      islamic_knowledge_level: 'Intermediate',
      wears_hijab: 'Full hijab',
      occupation: 'Primary School Teacher',
      education_level: "Bachelor's degree",
      living_situation: 'With family',
      willing_to_relocate: true,
      previously_married: false,
      has_children: false,
      wants_children: true,
      timeline_to_marry: 'Within 6 months',
      spouse_religiosity_preference: 'practicing',
      spouse_age_min: 26,
      spouse_age_max: 34,
      dealbreakers: ['Not practising', 'Smoking', 'Disrespect to parents'],
      character_description: 'Kind, patient, and deeply committed to my faith. I love children and meaningful conversations.',
      goals: 'A peaceful, loving home grounded in Islam where we support each other\'s growth.',
    },
    additional: {
      do_you_listen_to_music: 'No',
      celebrate_non_islamic_holidays: 'No',
      hijab_outside_home: 'Full hijab',
      islamic_classes_attendance: 'Weekly',
      differing_islamic_opinions: 'I believe we should approach differences with respect and consult a scholar.',
      plan_to_work_after_marriage: 'Part-time',
      financial_independence_importance: 'Somewhat important',
      has_significant_debt: 'No',
      supporting_family_financially: 'No',
      career_ambitions: 'I love teaching and would like to continue part-time after having children, insha\'Allah.',
      number_of_children_wanted: '3–4',
      primary_caregiver_comfort: 'Very comfortable',
      household_responsibilities_vision: 'I\'m happy to manage the home while he supports and provides — but I appreciate his involvement.',
      inlaws_living_together: 'Open to it',
      islamic_schooling_importance: 'Very important',
      weekend_lifestyle: 'Family visits, Islamic circles, cooking, and walking outdoors.',
      mixed_gender_social_circle: 'No',
      travel_importance: 'Occasionally — for Umrah and visiting family',
      strict_halal_diet: 'Yes',
      smoking: 'No',
      conflict_style: 'Calm discussion',
      introvert_extrovert: 'Introvert',
      love_language: ['Words of affirmation', 'Quality time'],
      alone_time_importance: 'Somewhat important',
      health_background_disclosure: null,
    },
    reference: {
      referee_name: 'Ustadha Khadijah Noor',
      referee_relationship: 'Islamic studies teacher',
      referee_email: 'ustadha@eastlondon.test',
      referee_phone: null,
      status: 'pending',
    },
  },
  {
    email: 'sister2@nasib.test',
    waliEmail: 'wali2@nasib.test',
    core: {
      full_name: 'Aisha Ahmed',
      age: 28,
      location: 'Manchester, UK',
      ethnicity: 'Pakistani',
      languages: ['English', 'Urdu', 'Punjabi'],
      religiosity_level: 'practicing',
      madhab: 'Hanafi',
      prayer_frequency: '5 times daily',
      islamic_knowledge_level: 'Advanced',
      wears_hijab: 'Full hijab',
      occupation: 'Junior Doctor',
      education_level: 'Medical degree',
      living_situation: 'Alone',
      willing_to_relocate: false,
      previously_married: false,
      has_children: false,
      wants_children: true,
      timeline_to_marry: 'Within 6 months',
      spouse_religiosity_preference: 'practicing',
      spouse_age_min: 27,
      spouse_age_max: 36,
      dealbreakers: ['Not religious', 'Smoking', 'Controlling behaviour'],
      character_description: 'Driven, compassionate, and devoted to my faith. Medicine is a calling — so is building a righteous family.',
      goals: 'A marriage of equals — intellectually stimulating, spiritually grounded, and deeply loving.',
    },
    additional: {
      do_you_listen_to_music: 'No',
      celebrate_non_islamic_holidays: 'No',
      hijab_outside_home: 'Full hijab',
      islamic_classes_attendance: 'Weekly',
      differing_islamic_opinions: 'Respectful dialogue and consulting scholars. We\'d grow in knowledge together.',
      plan_to_work_after_marriage: 'Full-time',
      financial_independence_importance: 'Very important',
      has_significant_debt: 'No',
      supporting_family_financially: 'Yes — some',
      career_ambitions: 'I plan to complete my specialty training and contribute to Muslim communities through medicine.',
      number_of_children_wanted: '3–4',
      primary_caregiver_comfort: 'Comfortable with support',
      household_responsibilities_vision: 'Shared — we both have demanding careers and need to support each other equally.',
      inlaws_living_together: 'Prefer not',
      islamic_schooling_importance: 'Very important',
      weekend_lifestyle: 'Islamic study circles, hospital volunteer work, cooking, and outdoor walks.',
      mixed_gender_social_circle: 'No',
      travel_importance: 'Occasionally — Umrah and professional conferences',
      strict_halal_diet: 'Yes',
      smoking: 'No',
      conflict_style: 'Cool down then talk',
      introvert_extrovert: 'Ambivert',
      love_language: ['Acts of service', 'Words of affirmation'],
      alone_time_importance: 'Very important',
      health_background_disclosure: null,
    },
    reference: {
      referee_name: 'Dr Hafsa Malik',
      referee_relationship: 'Senior doctor and mentor',
      referee_email: 'hafsa@nhs.test',
      referee_phone: null,
      status: 'pending',
    },
  },
  {
    email: 'sister3@nasib.test',
    waliEmail: 'wali3@nasib.test',
    core: {
      full_name: 'Maryam Ali',
      age: 24,
      location: 'Birmingham, UK',
      ethnicity: 'Somali',
      languages: ['English', 'Somali', 'Arabic'],
      religiosity_level: 'practicing',
      madhab: "Shafi'i",
      prayer_frequency: '5 times daily',
      islamic_knowledge_level: 'Intermediate',
      wears_hijab: 'Full hijab with niqab',
      occupation: 'University Student (Nursing)',
      education_level: "Bachelor's degree (in progress)",
      living_situation: 'With family',
      willing_to_relocate: false,
      previously_married: false,
      has_children: false,
      wants_children: true,
      timeline_to_marry: 'Within a year',
      spouse_religiosity_preference: 'practicing',
      spouse_age_min: 24,
      spouse_age_max: 32,
      dealbreakers: ['Not religious', 'Smoking', 'No respect for wali'],
      character_description: 'Gentle, studious, and deeply rooted in Islamic values. I aspire to be like Maryam — quiet strength.',
      goals: 'A home filled with Quran, barakah, and many children, insha\'Allah.',
    },
    additional: {
      do_you_listen_to_music: 'No',
      celebrate_non_islamic_holidays: 'No',
      hijab_outside_home: 'Full niqab',
      islamic_classes_attendance: 'Multiple times a week',
      differing_islamic_opinions: 'I follow the Shafi\'i school and respect others. We\'d consult scholars together.',
      plan_to_work_after_marriage: 'Pause for children then return',
      financial_independence_importance: 'Somewhat important',
      has_significant_debt: 'No',
      supporting_family_financially: 'No',
      career_ambitions: 'Complete my nursing degree and work in community health, possibly part-time after children.',
      number_of_children_wanted: '5+',
      primary_caregiver_comfort: 'Very comfortable',
      household_responsibilities_vision: 'I\'m happy to be the primary homemaker while studying and with small children.',
      inlaws_living_together: 'Open to it',
      islamic_schooling_importance: 'Very important',
      weekend_lifestyle: 'Islamic circles, community service, Quran revision, and family time.',
      mixed_gender_social_circle: 'No',
      travel_importance: 'For Hajj and family visits only',
      strict_halal_diet: 'Yes',
      smoking: 'No',
      conflict_style: 'Calm discussion',
      introvert_extrovert: 'Introvert',
      love_language: ['Words of affirmation', 'Quality time'],
      alone_time_importance: 'Important',
      health_background_disclosure: null,
    },
    reference: {
      referee_name: 'Ustadha Safiya Abdi',
      referee_relationship: 'Quran teacher',
      referee_email: 'safiya@bicc.test',
      referee_phone: null,
      status: 'pending',
    },
  },
  {
    email: 'sister4@nasib.test',
    waliEmail: 'wali4@nasib.test',
    core: {
      full_name: 'Zainab Rahman',
      age: 30,
      location: 'Leeds, UK',
      ethnicity: 'Bangladeshi',
      languages: ['English', 'Bengali', 'Arabic'],
      religiosity_level: 'moderately_practicing',
      madhab: 'Hanafi',
      prayer_frequency: 'mostly',
      islamic_knowledge_level: 'Intermediate',
      wears_hijab: 'Full hijab',
      occupation: 'Pharmacist',
      education_level: 'Masters degree',
      living_situation: 'Alone',
      willing_to_relocate: false,
      previously_married: false,
      has_children: false,
      wants_children: true,
      timeline_to_marry: 'Within a year',
      spouse_religiosity_preference: 'moderately_practicing',
      spouse_age_min: 28,
      spouse_age_max: 38,
      dealbreakers: ['Smoking', 'Alcohol', 'Not open to children'],
      character_description: 'Independent, warm, and intellectually curious. I\'m serious about my career and my deen.',
      goals: 'A balanced, modern Muslim home where both partners thrive.',
    },
    additional: {
      do_you_listen_to_music: 'Occasionally',
      celebrate_non_islamic_holidays: 'Birthdays only',
      hijab_outside_home: 'Full hijab',
      islamic_classes_attendance: 'Monthly',
      differing_islamic_opinions: 'I respect different scholarly opinions and believe open discussion builds understanding.',
      plan_to_work_after_marriage: 'Full-time',
      financial_independence_importance: 'Very important',
      has_significant_debt: 'No',
      supporting_family_financially: 'No',
      career_ambitions: 'Progress to pharmacy management and pursue further postgraduate study.',
      number_of_children_wanted: '1–2',
      primary_caregiver_comfort: 'Comfortable with support',
      household_responsibilities_vision: 'Shared equally — both of us contribute financially and domestically.',
      inlaws_living_together: 'Prefer not',
      islamic_schooling_importance: 'Important',
      weekend_lifestyle: 'Cooking, walks in nature, catching up with friends, the occasional museum visit.',
      mixed_gender_social_circle: 'No',
      travel_importance: 'A few times a year',
      strict_halal_diet: 'Yes',
      smoking: 'No',
      conflict_style: 'Talk it through immediately',
      introvert_extrovert: 'Ambivert',
      love_language: ['Acts of service', 'Quality time'],
      alone_time_importance: 'Important',
      health_background_disclosure: null,
    },
    reference: {
      referee_name: 'Mufti Khalid Islam',
      referee_relationship: 'Family imam',
      referee_email: 'khalid@leedsjamia.test',
      referee_phone: null,
      status: 'pending',
    },
  },
  {
    email: 'sister5@nasib.test',
    waliEmail: 'wali5@nasib.test',
    core: {
      full_name: 'Khadijah Malik',
      age: 27,
      location: 'Glasgow, UK',
      ethnicity: 'Pakistani',
      languages: ['English', 'Urdu'],
      religiosity_level: 'practicing',
      madhab: 'Hanafi',
      prayer_frequency: '5 times daily',
      islamic_knowledge_level: 'Intermediate',
      wears_hijab: 'Full hijab',
      occupation: 'Dentist',
      education_level: 'Dental degree',
      living_situation: 'With family',
      willing_to_relocate: true,
      previously_married: false,
      has_children: false,
      wants_children: true,
      timeline_to_marry: 'Within 3 months',
      spouse_religiosity_preference: 'practicing',
      spouse_age_min: 27,
      spouse_age_max: 35,
      dealbreakers: ['Not practising', 'Smoking', 'No ambition'],
      character_description: 'Confident, caring, and community-focused. I balance a demanding profession with a committed faith.',
      goals: 'A marriage that strengthens our deen, supports our careers, and produces a beautiful family.',
    },
    additional: {
      do_you_listen_to_music: 'Nasheeds only',
      celebrate_non_islamic_holidays: 'No',
      hijab_outside_home: 'Full hijab',
      islamic_classes_attendance: 'Weekly',
      differing_islamic_opinions: 'Consult scholars together and approach with mutual respect.',
      plan_to_work_after_marriage: 'Full-time',
      financial_independence_importance: 'Very important',
      has_significant_debt: 'No',
      supporting_family_financially: 'No',
      career_ambitions: 'Build my own dental practice and contribute to Muslim healthcare in Scotland.',
      number_of_children_wanted: '3–4',
      primary_caregiver_comfort: 'Comfortable with support',
      household_responsibilities_vision: 'Shared — both contribute. I\'m happy to lead domestically if he supports equally.',
      inlaws_living_together: 'Open to it',
      islamic_schooling_importance: 'Very important',
      weekend_lifestyle: 'Islamic classes, hiking, family dinners, and Quran revision.',
      mixed_gender_social_circle: 'No',
      travel_importance: 'A few times a year — Umrah and exploring the world together',
      strict_halal_diet: 'Yes',
      smoking: 'No',
      conflict_style: 'Calm discussion',
      introvert_extrovert: 'Ambivert',
      love_language: ['Words of affirmation', 'Acts of service'],
      alone_time_importance: 'Somewhat important',
      health_background_disclosure: null,
    },
    reference: {
      referee_name: 'Dr Amina Yousaf',
      referee_relationship: 'Senior colleague and mentor',
      referee_email: 'amina@glasgow.test',
      referee_phone: null,
      status: 'pending',
    },
  },
  {
    email: 'sister6@nasib.test',
    waliEmail: null,
    core: {
      full_name: 'Noor Abdullah',
      age: 26,
      location: 'Leicester, UK',
      ethnicity: 'Arab',
      languages: ['English', 'Arabic'],
      religiosity_level: 'practicing',
      madhab: "Shafi'i",
      prayer_frequency: '5 times daily',
      islamic_knowledge_level: 'Advanced',
      wears_hijab: 'Full hijab',
      occupation: 'Nurse',
      education_level: "Bachelor's degree",
      living_situation: 'With family',
      willing_to_relocate: false,
      previously_married: false,
      has_children: false,
      wants_children: true,
      timeline_to_marry: 'Within 6 months',
      spouse_religiosity_preference: 'practicing',
      spouse_age_min: 26,
      spouse_age_max: 34,
      dealbreakers: ['Not religious', 'Smoking', 'No hijab requirement'],
      character_description: 'Gentle, devoted, and deeply spiritual. I find purpose in caring for others and in worship.',
      goals: 'A serene home built on taqwa, where children grow knowing Allah.',
    },
    additional: {
      do_you_listen_to_music: 'No',
      celebrate_non_islamic_holidays: 'No',
      hijab_outside_home: 'Full hijab',
      islamic_classes_attendance: 'Multiple times a week',
      differing_islamic_opinions: 'Following one madhab sincerely while respecting others — scholarship is rich.',
      plan_to_work_after_marriage: 'Part-time',
      financial_independence_importance: 'Somewhat important',
      has_significant_debt: 'No',
      supporting_family_financially: 'No',
      career_ambitions: 'Continue nursing part-time while raising my children.',
      number_of_children_wanted: '3–4',
      primary_caregiver_comfort: 'Very comfortable',
      household_responsibilities_vision: 'I\'m happy to primarily manage the home and children, with his support.',
      inlaws_living_together: 'Open to it',
      islamic_schooling_importance: 'Very important',
      weekend_lifestyle: 'Islamic circles, Quran revision, family visits, and peaceful time at home.',
      mixed_gender_social_circle: 'No',
      travel_importance: 'For Hajj and Umrah',
      strict_halal_diet: 'Yes',
      smoking: 'No',
      conflict_style: 'Calm discussion',
      introvert_extrovert: 'Introvert',
      love_language: ['Words of affirmation', 'Quality time'],
      alone_time_importance: 'Very important',
      health_background_disclosure: null,
    },
    reference: {
      referee_name: 'Shaykh Ahmad Suhail',
      referee_relationship: 'Islamic mentor',
      referee_email: 'ahmad@leicestermasjid.test',
      referee_phone: null,
      status: 'pending',
    },
  },
  {
    email: 'sister7@nasib.test',
    waliEmail: null,
    core: {
      full_name: 'Safiya Qureshi',
      age: 32,
      location: 'London, UK',
      ethnicity: 'Pakistani',
      languages: ['English', 'Urdu'],
      religiosity_level: 'moderately_practicing',
      madhab: 'Hanafi',
      prayer_frequency: 'mostly',
      islamic_knowledge_level: 'Intermediate',
      wears_hijab: 'Full hijab',
      occupation: 'Barrister',
      education_level: 'Masters degree',
      living_situation: 'Alone',
      willing_to_relocate: false,
      previously_married: false,
      has_children: false,
      wants_children: true,
      timeline_to_marry: 'Within a year',
      spouse_religiosity_preference: 'moderately_practicing',
      spouse_age_min: 30,
      spouse_age_max: 40,
      dealbreakers: ['Smoking', 'Not open to my career', 'Controlling behaviour'],
      character_description: 'Articulate, principled, and emotionally intelligent. I want a partner who respects my intellect and my deen.',
      goals: 'A marriage of deep friendship, intellectual chemistry, and shared Islamic values.',
    },
    additional: {
      do_you_listen_to_music: 'Occasionally',
      celebrate_non_islamic_holidays: 'Birthdays only',
      hijab_outside_home: 'Full hijab',
      islamic_classes_attendance: 'Monthly',
      differing_islamic_opinions: 'I engage critically with scholarship and appreciate nuanced discussion.',
      plan_to_work_after_marriage: 'Full-time',
      financial_independence_importance: 'Very important',
      has_significant_debt: 'No',
      supporting_family_financially: 'Yes — some',
      career_ambitions: 'Become a QC and advocate for Muslim communities in British courts.',
      number_of_children_wanted: '1–2',
      primary_caregiver_comfort: 'With support',
      household_responsibilities_vision: 'Both contribute — we\'d figure out a fair division based on our schedules.',
      inlaws_living_together: 'Prefer not',
      islamic_schooling_importance: 'Important',
      weekend_lifestyle: 'Intellectual conversations, halal dining out, walks in London, and reading.',
      mixed_gender_social_circle: 'No',
      travel_importance: 'A few times a year',
      strict_halal_diet: 'Yes',
      smoking: 'No',
      conflict_style: 'Cool down then talk',
      introvert_extrovert: 'Ambivert',
      love_language: ['Words of affirmation', 'Quality time'],
      alone_time_importance: 'Important',
      health_background_disclosure: null,
    },
    reference: {
      referee_name: 'Mufti Ibrahim al-Rashid',
      referee_relationship: 'Family scholar',
      referee_email: 'ibrahim@londonmasjid.test',
      referee_phone: null,
      status: 'pending',
    },
  },
  {
    email: 'sister8@nasib.test',
    waliEmail: null,
    core: {
      full_name: 'Ruqayyah Hussain',
      age: 29,
      location: 'Bradford, UK',
      ethnicity: 'Pakistani',
      languages: ['English', 'Urdu', 'Mirpuri'],
      religiosity_level: 'practicing',
      madhab: 'Hanafi',
      prayer_frequency: '5 times daily',
      islamic_knowledge_level: 'Intermediate',
      wears_hijab: 'Full hijab',
      occupation: 'Accountant',
      education_level: "Bachelor's degree",
      living_situation: 'With family',
      willing_to_relocate: true,
      previously_married: false,
      has_children: false,
      wants_children: true,
      timeline_to_marry: 'Within 6 months',
      spouse_religiosity_preference: 'practicing',
      spouse_age_min: 27,
      spouse_age_max: 36,
      dealbreakers: ['Not practising', 'Smoking', 'Not financially stable'],
      character_description: 'Organised, caring, and deeply family-oriented. I love a quiet home filled with warmth and dhikr.',
      goals: 'A stable, loving Islamic home where our children are our biggest achievement.',
    },
    additional: {
      do_you_listen_to_music: 'No',
      celebrate_non_islamic_holidays: 'No',
      hijab_outside_home: 'Full hijab',
      islamic_classes_attendance: 'Weekly',
      differing_islamic_opinions: 'We\'d approach it together with humility and consult our local scholar.',
      plan_to_work_after_marriage: 'Part-time',
      financial_independence_importance: 'Somewhat important',
      has_significant_debt: 'No',
      supporting_family_financially: 'Yes — some',
      career_ambitions: 'Continue accounting part-time and possibly run a bookkeeping service from home.',
      number_of_children_wanted: '3–4',
      primary_caregiver_comfort: 'Very comfortable',
      household_responsibilities_vision: 'I\'d manage the home and children. He provides and we share quality time.',
      inlaws_living_together: 'Open to it',
      islamic_schooling_importance: 'Very important',
      weekend_lifestyle: 'Family gatherings, baking, Islamic classes, walks in the countryside.',
      mixed_gender_social_circle: 'No',
      travel_importance: 'Occasionally — for Umrah and family',
      strict_halal_diet: 'Yes',
      smoking: 'No',
      conflict_style: 'Calm discussion',
      introvert_extrovert: 'Introvert',
      love_language: ['Acts of service', 'Quality time'],
      alone_time_importance: 'Somewhat important',
      health_background_disclosure: null,
    },
    reference: {
      referee_name: 'Maulana Sulaiman Bashir',
      referee_relationship: 'Family imam',
      referee_email: 'sulaiman@bradfordmasjid.test',
      referee_phone: null,
      status: 'pending',
    },
  },
  {
    email: 'sister9@nasib.test',
    waliEmail: null,
    core: {
      full_name: 'Halima Khan',
      age: 31,
      location: 'London, UK',
      ethnicity: 'Indian',
      languages: ['English', 'Urdu', 'Hindi'],
      religiosity_level: 'moderately_practicing',
      madhab: 'Hanafi',
      prayer_frequency: 'mostly',
      islamic_knowledge_level: 'Beginner',
      wears_hijab: 'Full hijab',
      occupation: 'Social Worker',
      education_level: "Bachelor's degree",
      living_situation: 'Alone',
      willing_to_relocate: false,
      previously_married: false,
      has_children: false,
      wants_children: true,
      timeline_to_marry: 'Within a year',
      spouse_religiosity_preference: 'moderately_practicing',
      spouse_age_min: 29,
      spouse_age_max: 38,
      dealbreakers: ['Smoking', 'Alcohol', 'Disrespect to women'],
      character_description: 'Empathetic, resilient, and community-driven. My work is my purpose alongside my growing faith.',
      goals: 'A compassionate home built on mutual respect, growth in deen, and giving back to the community.',
    },
    additional: {
      do_you_listen_to_music: 'Occasionally',
      celebrate_non_islamic_holidays: 'Birthdays only',
      hijab_outside_home: 'Full hijab',
      islamic_classes_attendance: 'Monthly',
      differing_islamic_opinions: 'I\'m still learning — I\'d seek guidance from a scholar together with my spouse.',
      plan_to_work_after_marriage: 'Full-time',
      financial_independence_importance: 'Very important',
      has_significant_debt: 'No',
      supporting_family_financially: 'No',
      career_ambitions: 'Progress to senior social work management and advocate for Muslim families.',
      number_of_children_wanted: '1–2',
      primary_caregiver_comfort: 'With support',
      household_responsibilities_vision: 'Shared equally — both of us have demanding roles.',
      inlaws_living_together: 'Prefer not',
      islamic_schooling_importance: 'Important',
      weekend_lifestyle: 'Reading, community volunteering, nature walks, and visiting friends.',
      mixed_gender_social_circle: 'No',
      travel_importance: 'A few times a year',
      strict_halal_diet: 'Yes',
      smoking: 'No',
      conflict_style: 'Talk it through immediately',
      introvert_extrovert: 'Ambivert',
      love_language: ['Words of affirmation', 'Acts of service'],
      alone_time_importance: 'Important',
      health_background_disclosure: null,
    },
    reference: {
      referee_name: 'Imam Rashid Hussain',
      referee_relationship: 'Local masjid imam',
      referee_email: 'rashid@eastlondon.test',
      referee_phone: null,
      status: 'pending',
    },
  },
  {
    email: 'sister10@nasib.test',
    waliEmail: null,
    core: {
      full_name: 'Layla Omar',
      age: 25,
      location: 'London, UK',
      ethnicity: 'Egyptian',
      languages: ['English', 'Arabic', 'French'],
      religiosity_level: 'practicing',
      madhab: "Shafi'i",
      prayer_frequency: '5 times daily',
      islamic_knowledge_level: 'Intermediate',
      wears_hijab: 'Full hijab',
      occupation: 'Graphic Designer',
      education_level: "Bachelor's degree",
      living_situation: 'With family',
      willing_to_relocate: true,
      previously_married: false,
      has_children: false,
      wants_children: true,
      timeline_to_marry: 'Within 6 months',
      spouse_religiosity_preference: 'practicing',
      spouse_age_min: 26,
      spouse_age_max: 33,
      dealbreakers: ['Not practising', 'Smoking', 'No aesthetic sense'],
      character_description: 'Creative, spiritually motivated, and full of warmth. I believe beauty and faith go hand in hand.',
      goals: 'A home that is aesthetically beautiful and spiritually rich — art on the walls, Quran in the air.',
    },
    additional: {
      do_you_listen_to_music: 'No',
      celebrate_non_islamic_holidays: 'No',
      hijab_outside_home: 'Full hijab',
      islamic_classes_attendance: 'Weekly',
      differing_islamic_opinions: 'Respectful discussion and research together. We\'d approach differences with openness.',
      plan_to_work_after_marriage: 'Freelance from home',
      financial_independence_importance: 'Important',
      has_significant_debt: 'No',
      supporting_family_financially: 'No',
      career_ambitions: 'Build a freelance Islamic design studio and create meaningful visual content for the ummah.',
      number_of_children_wanted: '3–4',
      primary_caregiver_comfort: 'Very comfortable',
      household_responsibilities_vision: 'I\'d manage the home and freelance from it while raising children.',
      inlaws_living_together: 'Open to it',
      islamic_schooling_importance: 'Very important',
      weekend_lifestyle: 'Art, calligraphy, Islamic lectures, walks, and cooking traditional recipes.',
      mixed_gender_social_circle: 'No',
      travel_importance: 'A few times a year — Umrah, Egypt, and exploring Islamic heritage',
      strict_halal_diet: 'Yes',
      smoking: 'No',
      conflict_style: 'Calm discussion',
      introvert_extrovert: 'Introvert',
      love_language: ['Words of affirmation', 'Quality time'],
      alone_time_importance: 'Very important',
      health_background_disclosure: null,
    },
    reference: {
      referee_name: 'Shaykh Walid Nassir',
      referee_relationship: 'Mentor and Islamic teacher',
      referee_email: 'walid@egyptianmasjid.test',
      referee_phone: null,
      status: 'pending',
    },
  },
]

// ─── Wali data ────────────────────────────────────────────────────────────────

const WALIS = [
  { email: 'wali1@nasib.test', full_name: 'Hassan Ibrahim', relationship: 'Father',  phone: '+447700900001', sisterEmail: 'sister1@nasib.test' },
  { email: 'wali2@nasib.test', full_name: 'Ahmed Tariq',    relationship: 'Father',  phone: '+447700900002', sisterEmail: 'sister2@nasib.test' },
  { email: 'wali3@nasib.test', full_name: 'Ali Noor',       relationship: 'Father',  phone: '+447700900003', sisterEmail: 'sister3@nasib.test' },
  { email: 'wali4@nasib.test', full_name: 'Rahman Kabir',   relationship: 'Brother', phone: '+447700900004', sisterEmail: 'sister4@nasib.test' },
  { email: 'wali5@nasib.test', full_name: 'Malik Yusuf',    relationship: 'Father',  phone: '+447700900005', sisterEmail: 'sister5@nasib.test' },
]

// ─── Seed logic ───────────────────────────────────────────────────────────────

interface SeedResult {
  email: string
  success: boolean
  error?: string
}

async function createOrGetUser(email: string): Promise<string | null> {
  const { data: existing } = await supabase.auth.admin.listUsers()
  const found = existing?.users?.find(u => u.email === email)
  if (found) {
    console.log(`  ↩  User already exists: ${email}`)
    return found.id
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
  })

  if (error) {
    console.error(`  ✗  Failed to create user ${email}: ${error.message}`)
    return null
  }

  return data.user.id
}

async function seedBrother(brother: (typeof BROTHERS)[0]): Promise<SeedResult> {
  console.log(`\nSeeding brother: ${brother.core.full_name} (${brother.email})`)

  const userId = await createOrGetUser(brother.email)
  if (!userId) return { email: brother.email, success: false, error: 'Failed to create auth user' }

  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({ id: userId, gender: 'brother', status: 'active', verification_badge: false }, { onConflict: 'id' })

  if (profileError) {
    console.error(`  ✗  profiles upsert failed: ${profileError.message}`)
    return { email: brother.email, success: false, error: profileError.message }
  }

  const { error: brotherError } = await supabase
    .from('brother_profiles')
    .upsert({ id: userId, ...brother.core, ...brother.additional }, { onConflict: 'id' })

  if (brotherError) {
    console.error(`  ✗  brother_profiles upsert failed: ${brotherError.message}`)
    return { email: brother.email, success: false, error: brotherError.message }
  }

  const { count: refExists } = await supabase
    .from('references')
    .select('*', { count: 'exact', head: true })
    .eq('profile_id', userId)

  if (!refExists) {
    const { error: refError } = await supabase
      .from('references')
      .insert({ profile_id: userId, ...brother.reference })
    if (refError) {
      console.error(`  ✗  references insert failed: ${refError.message}`)
    }
  }

  console.log(`  ✓  ${brother.core.full_name} seeded successfully`)
  return { email: brother.email, success: true }
}

async function seedSister(
  sister: (typeof SISTERS)[0],
  sisterIdMap: Map<string, string>,
): Promise<SeedResult> {
  console.log(`\nSeeding sister: ${sister.core.full_name} (${sister.email})`)

  const userId = await createOrGetUser(sister.email)
  if (!userId) return { email: sister.email, success: false, error: 'Failed to create auth user' }

  sisterIdMap.set(sister.email, userId)

  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({ id: userId, gender: 'sister', status: 'active', verification_badge: false }, { onConflict: 'id' })

  if (profileError) {
    console.error(`  ✗  profiles upsert failed: ${profileError.message}`)
    return { email: sister.email, success: false, error: profileError.message }
  }

  const { error: sisterError } = await supabase
    .from('sister_profiles')
    .upsert({ id: userId, ...sister.core, ...sister.additional }, { onConflict: 'id' })

  if (sisterError) {
    console.error(`  ✗  sister_profiles upsert failed: ${sisterError.message}`)
    return { email: sister.email, success: false, error: sisterError.message }
  }

  const { count: refExists } = await supabase
    .from('references')
    .select('*', { count: 'exact', head: true })
    .eq('profile_id', userId)

  if (!refExists) {
    const { error: refError } = await supabase
      .from('references')
      .insert({ profile_id: userId, ...sister.reference })
    if (refError) {
      console.error(`  ✗  references insert failed: ${refError.message}`)
    }
  }

  console.log(`  ✓  ${sister.core.full_name} seeded successfully`)
  return { email: sister.email, success: true }
}

async function seedWali(
  wali: (typeof WALIS)[0],
  sisterIdMap: Map<string, string>,
): Promise<SeedResult> {
  console.log(`\nSeeding wali: ${wali.full_name} (${wali.email})`)

  const created = await createOrGetUser(wali.email)
  if (!created) return { email: wali.email, success: false, error: 'Failed to create auth user' }

  // Ensure app_metadata.role = 'wali' — this is critical for middleware routing
  const { error: metaError } = await supabase.auth.admin.updateUserById(created, {
    app_metadata: { role: 'wali' },
    user_metadata: { full_name: wali.full_name },
  })
  if (metaError) {
    console.warn(`  ⚠  Failed to set wali role for ${wali.email}: ${metaError.message}`)
  } else {
    console.log(`  ✓  app_metadata.role = 'wali' set for ${wali.email}`)
  }

  const sisterId = sisterIdMap.get(wali.sisterEmail)
  if (!sisterId) {
    console.warn(`  ⚠  Sister ${wali.sisterEmail} not found in map — skipping wali_profiles insert`)
    return { email: wali.email, success: true }
  }

  const { count: waliExists } = await supabase
    .from('wali_profiles')
    .select('*', { count: 'exact', head: true })
    .eq('sister_id', sisterId)

  if (!waliExists) {
    const { error: waliError } = await supabase
      .from('wali_profiles')
      .insert({
        sister_id: sisterId,
        full_name: wali.full_name,
        relationship: wali.relationship,
        phone: wali.phone,
        email: wali.email,
        preferred_contact_method: 'email',
      })

    if (waliError) {
      console.error(`  ✗  wali_profiles insert failed: ${waliError.message}`)
      return { email: wali.email, success: false, error: waliError.message }
    }
  }

  console.log(`  ✓  ${wali.full_name} seeded successfully`)
  return { email: wali.email, success: true }
}

function writeCredentials(results: SeedResult[]) {
  const lines: string[] = [
    '─────────────────────────────────────────────────',
    '  NASIB — Test User Credentials',
    '─────────────────────────────────────────────────',
    `  Password (all users): ${PASSWORD}`,
    '',
    '  BROTHERS',
    '  ────────',
    ...BROTHERS.map((b, i) =>
      `  ${String(i + 1).padStart(2, '0')}. ${b.core.full_name.padEnd(20)} ${b.email}`,
    ),
    '',
    '  SISTERS',
    '  ───────',
    ...SISTERS.map((s, i) =>
      `  ${String(i + 1).padStart(2, '0')}. ${s.core.full_name.padEnd(20)} ${s.email}`,
    ),
    '',
    '  WALIS',
    '  ─────',
    ...WALIS.map((w, i) =>
      `  ${String(i + 1).padStart(2, '0')}. ${w.full_name.padEnd(20)} ${w.email}  (wali for ${w.sisterEmail})`,
    ),
    '',
    '  SEED RESULTS',
    '  ────────────',
    ...results.map(r => `  ${r.success ? '✓' : '✗'} ${r.email}${r.error ? ` — ${r.error}` : ''}`),
    '─────────────────────────────────────────────────',
  ]

  const out = path.resolve(__dirname, 'test-credentials.txt')
  fs.writeFileSync(out, lines.join('\n') + '\n', 'utf8')
  console.log(`\nCredentials written to: ${out}`)
}

async function main() {
  console.log('═══════════════════════════════════════════════')
  console.log('  Nasib seed script')
  console.log('═══════════════════════════════════════════════')
  console.log(`  Supabase URL: ${SUPABASE_URL}`)
  console.log(`  Users to seed: ${BROTHERS.length} brothers, ${SISTERS.length} sisters, ${WALIS.length} walis`)
  console.log('───────────────────────────────────────────────\n')

  const results: SeedResult[] = []
  const sisterIdMap = new Map<string, string>()

  for (const brother of BROTHERS) {
    results.push(await seedBrother(brother))
    await sleep(100)
  }

  for (const sister of SISTERS) {
    results.push(await seedSister(sister, sisterIdMap))
    await sleep(100)
  }

  for (const wali of WALIS) {
    results.push(await seedWali(wali, sisterIdMap))
    await sleep(100)
  }

  const succeeded = results.filter(r => r.success).length
  const failed = results.filter(r => !r.success).length

  console.log('\n═══════════════════════════════════════════════')
  console.log(`  Done — ${succeeded} succeeded, ${failed} failed`)
  console.log('═══════════════════════════════════════════════')

  writeCredentials(results)
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
