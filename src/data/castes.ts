export const RELIGIONS = [
  "Hindu",
  "Christian",
  "Muslim",
  "Sikh",
  "Jain",
  "Buddhist",
  "No Religion",
  "Other"
];

export const CASTES = [
  "Pillai",
  "Mudaliar",
  "Nadar",
  "Vanniyar",
  "Gounder",
  "Thevar / Mukkulathor",
  "Chettiar",
  "Iyer",
  "Iyengar",
  "Naidu",
  "Reddiar",
  "Yadav",
  "Adi Dravida",
  "Scheduled Caste (SC)",
  "Scheduled Tribe (ST)",
  "Vishwakarma",
  "Devangar",
  "Sengunthar",
  "Vellalar",
  "Nair",
  "Ezhava",
  "Christian - Roman Catholic",
  "Christian - Protestant",
  "Christian - Syrian Catholic",
  "Christian - Pentecostal",
  "Muslim - Sunni",
  "Muslim - Shia",
  "Muslim - Lebbai",
  "Caste No Bar",
  "Inter-Caste",
  "Other"
];

export const MOTHER_TONGUES = [
  "Tamil"
];

export const RELIGION_CASTE_MAP: Record<string, string[]> = {
  Hindu: [
    "Pillai", "Mudaliar", "Nadar", "Vanniyar", "Gounder", "Thevar / Mukkulathor",
    "Chettiar", "Iyer", "Iyengar", "Naidu", "Reddiar", "Yadav", "Adi Dravida",
    "Scheduled Caste (SC)", "Scheduled Tribe (ST)", "Vishwakarma", "Devangar",
    "Sengunthar", "Vellalar", "Nair", "Ezhava", "Other"
  ],
  Christian: [
    "Christian - Roman Catholic", "Christian - Protestant", 
    "Christian - Syrian Catholic", "Christian - Pentecostal", "Nadar", "Other"
  ],
  Muslim: [
    "Muslim - Sunni", "Muslim - Shia", "Muslim - Lebbai", "Other"
  ],
  Sikh: ["Caste No Bar", "Other"],
  Jain: ["Caste No Bar", "Other"],
  Buddhist: ["Caste No Bar", "Other"],
  "No Religion": ["Caste No Bar", "Inter-Caste", "Other"],
  Other: ["Other"]
};

export const OPTION_TRANSLATIONS: Record<string, string> = {
  // Religions
  "Hindu": "இந்து",
  "Christian": "கிறிஸ்தவர்",
  "Muslim": "முஸ்லீம்",
  "Sikh": "சீக்கியர்",
  "Jain": "சமணர்",
  "Buddhist": "புத்தமதத்தினர்",
  "No Religion": "மதம் இல்லை",
  
  // Castes
  "Pillai": "பிள்ளை",
  "Mudaliar": "முதலியார்",
  "Nadar": "நாடார்",
  "Vanniyar": "வன்னியர்",
  "Gounder": "கவுண்டர்",
  "Thevar / Mukkulathor": "தேவர் / முக்குலத்தோர்",
  "Chettiar": "செட்டியார்",
  "Iyer": "ஐயர்",
  "Iyengar": "ஐயங்கார்",
  "Naidu": "நாயுடு",
  "Reddiar": "ரெட்டியார்",
  "Yadav": "யாதவ்",
  "Adi Dravida": "ஆதி திராவிடர்",
  "Scheduled Caste (SC)": "பட்டியல் சாதி (SC)",
  "Scheduled Tribe (ST)": "பழங்குடியினர் (ST)",
  "Vishwakarma": "விஸ்வகர்மா",
  "Devangar": "தேவாங்கர்",
  "Sengunthar": "செங்குந்தர்",
  "Vellalar": "வேளாளர்",
  "Nair": "நாயர்",
  "Ezhava": "ஈழவர்",
  "Christian - Roman Catholic": "கிறிஸ்தவர் - ரோமன் கத்தோலிக்க",
  "Christian - Protestant": "கிறிஸ்தவர் - சீர்திருத்த",
  "Christian - Syrian Catholic": "கிறிஸ்தவர் - சிரியன் கத்தோலிக்க",
  "Christian - Pentecostal": "கிறிஸ்தவர் - பெந்தேகோஸ்தே",
  "Muslim - Sunni": "முஸ்லீம் - சன்னி",
  "Muslim - Shia": "முஸ்லீம் - ஷியா",
  "Muslim - Lebbai": "முஸ்லீம் - லெப்பை",
  "Caste No Bar": "சாதி தடையில்லை",
  "Inter-Caste": "கலப்புத் திருமணம்",
  "Other": "மற்றவை",
  
  // Mother Tongues
  "Tamil": "தமிழ்"
};
