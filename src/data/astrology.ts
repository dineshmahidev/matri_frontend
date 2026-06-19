export const RASIS = [
  { en: "Mesham", ta: "மேஷம்" },
  { en: "Rishabam", ta: "ரிஷபம்" },
  { en: "Midhunam", ta: "மிதுனம்" },
  { en: "Kadagam", ta: "கடகம்" },
  { en: "Simmam", ta: "சிம்மம்" },
  { en: "Kanni", ta: "கன்னி" },
  { en: "Thulam", ta: "துலாம்" },
  { en: "Viruchigam", ta: "விருச்சிகம்" },
  { en: "Dhanusu", ta: "தனுசு" },
  { en: "Magaram", ta: "மகரம்" },
  { en: "Kumbam", ta: "கும்பம்" },
  { en: "Meenam", ta: "மீனம்" }
];

export const NAKSHATRAMS = [
  { en: "Aswini", ta: "அஸ்வினி" },
  { en: "Bharani", ta: "பரணி" },
  { en: "Karthigai", ta: "கார்த்திகை" },
  { en: "Rohini", ta: "ரோகிணி" },
  { en: "Mirugasiridam", ta: "மிருகசீரிடம்" },
  { en: "Thiruvadhirai", ta: "திருவாதிரை" },
  { en: "Punarpoosam", ta: "புனர்பூசம்" },
  { en: "Poosam", ta: "பூசம்" },
  { en: "Aayilyam", ta: "ஆயில்யம்" },
  { en: "Magam", ta: "மகம்" },
  { en: "Pooram", ta: "பூரம்" },
  { en: "Uthiram", ta: "உத்திரம்" },
  { en: "Hastham", ta: "அஸ்தம்" },
  { en: "Chithirai", ta: "சித்திரை" },
  { en: "Swathi", ta: "சுவாதி" },
  { en: "Visakam", ta: "விசாகம்" },
  { en: "Anusham", ta: "அனுஷம்" },
  { en: "Kettai", ta: "கேட்டை" },
  { en: "Moolam", ta: "மூலம்" },
  { en: "Pooradam", ta: "பூராடம்" },
  { en: "Uthiradam", ta: "உத்திராடம்" },
  { en: "Thiruvonam", ta: "திருவோணம்" },
  { en: "Avittam", ta: "அவிட்டம்" },
  { en: "Sadhayam", ta: "சதயம்" },
  { en: "Poorattadhi", ta: "பூரட்டாதி" },
  { en: "Uthirattadhi", ta: "உத்திரட்டாதி" },
  { en: "Revathi", ta: "ரேவதி" }
];

export const RASI_NAKSHATRAM_MAP: Record<string, string[]> = {
  "Mesham": ["Aswini", "Bharani", "Karthigai"],
  "Rishabam": ["Karthigai", "Rohini", "Mirugasiridam"],
  "Midhunam": ["Mirugasiridam", "Thiruvadhirai", "Punarpoosam"],
  "Kadagam": ["Punarpoosam", "Poosam", "Aayilyam"],
  "Simmam": ["Magam", "Pooram", "Uthiram"],
  "Kanni": ["Uthiram", "Hastham", "Chithirai"],
  "Thulam": ["Chithirai", "Swathi", "Visakam"],
  "Viruchigam": ["Visakam", "Anusham", "Kettai"],
  "Dhanusu": ["Moolam", "Pooradam", "Uthiradam"],
  "Magaram": ["Uthiradam", "Thiruvonam", "Avittam"],
  "Kumbam": ["Avittam", "Sadhayam", "Poorattadhi"],
  "Meenam": ["Poorattadhi", "Uthirattadhi", "Revathi"]
};
