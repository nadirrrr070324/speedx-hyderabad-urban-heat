// Age-specific heat precautions — general public-health guidance (WHO / NDMA style).
// NOT medical advice or prescriptions. Always label as preventive guidance;
// encourage consulting a doctor for personal medical decisions.

import type { AgeGuidance } from './types';

export const AGE_GUIDANCE: AgeGuidance[] = [
  {
    ageRange: 'Under 18',
    label: 'Children & Teens (Under 18)',
    why: 'Children sweat less efficiently, overheat faster, and often cannot recognise or communicate early heat illness. They also depend on adults for water and shade.',
    hydration: 'Offer water every 20–30 min during outdoor play/sport. Add ORS or coconut water during prolonged heat exposure. Pale-yellow urine = hydrated; dark urine = needs fluids now.',
    outdoorLimit: 'Avoid outdoor exertion 11:00–16:00. Limit continuous outdoor play to 30–45 min, then 15 min shade + water.',
    precautions: [
      'Light, loose cotton clothes + wide-brim hat; sunscreen SPF 30+ on exposed skin',
      'Never leave a child in a parked vehicle — even for minutes',
      'Schedule sports / PE before 10:30 AM or after 17:00',
      'Watch for: unusual tiredness, headache, nausea, cramps, flushed or pale skin',
      'Teach children to tell an adult immediately if they feel dizzy or unwell',
    ],
    neverDo: 'Do not force outdoor activity during peak heat; do not wait for thirst — children dehydrate before feeling thirsty.',
    warningSigns: ['Flushed, hot, dry skin', 'Headache / dizziness', 'Nausea or vomiting', 'High body temp with confusion'],
    emergency: 'Hot dry skin + confusion = possible heat stroke. Move to shade, cool with wet cloths, call 108 immediately.',
  },
  {
    ageRange: '18-30',
    label: 'Young Adults (18–30)',
    why: 'Generally resilient, but high metabolic heat production during sport/delivery work plus risk-taking (skipping rest, alcohol) raises heat-illness risk.',
    hydration: 'About 2.5–3 L water/day; 500 ml during prolonged outdoor work. Avoid alcohol and excess caffeine in heat (both dehydrate).',
    outdoorLimit: 'No hard limit for healthy adults, but take 10 min shaded rest every hour above 40°C heat index.',
    precautions: [
      'Acclimatise over 7–10 days before starting heavy outdoor work in summer',
      'Light, breathable clothing; avoid dark synthetic fabrics',
      'Eat light meals; salty snacks help replace sweat electrolytes',
      'Know your body: cramps and headache are early warnings, not things to push through',
    ],
    neverDo: 'Do not "tough it out" through dizziness — stop, shade, water. Heat exhaustion can become heat stroke in under an hour.',
    warningSigns: ['Muscle cramps', 'Heavy sweating then sweating stops', 'Weakness, nausea', 'Fast pulse'],
    emergency: 'If vomiting, confusion, or very hot skin: shade + cool + call 108.',
  },
  {
    ageRange: '30-45',
    label: 'Adults (30–45)',
    why: 'Lower resting metabolic rate than youth, but many have hypertension or diabetes risk factors and high outdoor occupational exposure (delivery, construction, security).',
    hydration: '2.5–3.5 L/day; 500 ml–1 L during outdoor work. People on water-restricting medication should follow their doctor, not generic advice.',
    outdoorLimit: 'Above 42°C heat index: mandatory shaded rest 15–20 min every hour for outdoor workers.',
    precautions: [
      'Check BP / blood-sugar control before summer — uncontrolled conditions worsen heat tolerance',
      'Review medication with your doctor in summer (diuretics, beta-blockers, some antidepressants reduce heat tolerance)',
      'Use shade, canopy, or cool shelter during peak hours',
      'Buddy system for outdoor work — look out for each other',
    ],
    neverDo: 'Do not skip rest breaks to finish a shift — heat strain accumulates silently across the day.',
    warningSigns: ['Persistent headache', 'Confusion or irritability', 'Rapid heartbeat, chest discomfort', 'Hot, dry skin'],
    emergency: 'Chest pain, severe confusion, or collapse = call 108 first, cool second.',
  },
  {
    ageRange: '45-60',
    label: 'Middle-aged (45–60)',
    why: 'Sweat response and thirst sensation decline with age. Heart disease, hypertension, diabetes and kidney conditions become more common — all reduce heat tolerance.',
    hydration: '2–2.5 L/day unless a doctor has advised fluid restriction (kidney/heart). Sip regularly — do not wait for thirst.',
    outdoorLimit: 'Avoid non-essential outdoor activity 11:00–16:00. Outdoor work: rest 20 min per hour in shade above 40°C heat index.',
    precautions: [
      'Keep a water bottle within reach at home and work; set hourly reminders',
      'Cool showers / damp cloths; loosen clothing at home',
      'Track daily weight + urine colour — sudden changes signal dehydration',
      'Ask your doctor each summer whether your medicines need review in heat',
    ],
    neverDo: 'Do not exercise outdoors in peak heat "to stay fit" — indoor or early-morning activity is safer.',
    warningSigns: ['Dizziness on standing', 'Unusual fatigue', 'Swollen ankles, reduced urine', 'Palpitations'],
    emergency: 'Fainting, chest pain, or confusion in heat: call 108 and cool the person immediately.',
  },
  {
    ageRange: '60+',
    label: 'Older Adults (60+)',
    why: 'Highest-risk group: weaker sweating/thirst response, common heart, kidney, diabetes and medication effects. Heat illness can develop quickly and present atypically.',
    hydration: 'Small, frequent sips — 1.5–2 L/day unless doctor-advised otherwise. Keep water at bedside and by the chair.',
    outdoorLimit: 'Stay indoors 10:00–18:00 during heatwaves. Essential trips only early morning / evening, with shade access.',
    precautions: [
      'Check on elderly neighbours/family daily during heatwaves',
      'Light indoor clothing; ventilate home; use fans + damp cloths',
      'Keep a list of medicines — show it to any doctor in summer',
      'Maintain a cool room plan: nearest cool shelter / hospital known in advance',
    ],
    neverDo: 'Do not rely on feeling thirsty — older adults often do not feel thirst until already dehydrated.',
    warningSigns: ['Confusion, agitation, or unusual sleepiness', 'Very low or no urine output', 'Hot, dry, red skin', 'Fever above 39°C'],
    emergency: 'Any confusion or collapse in heat is an emergency — call 108, move to the coolest place, wet the skin, fan continuously.',
  },
];

export function guidanceForAge(ageRange: string): AgeGuidance {
  return AGE_GUIDANCE.find(g => g.ageRange === ageRange) ?? AGE_GUIDANCE[1];
}
