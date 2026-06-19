import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "en" | "ta";

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

const DICTIONARY: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    home: "Home",
    browse: "Browse",
    premium: "Premium",
    pricing: "Pricing",
    successStories: "Success Stories",
    blog: "Blog",
    login: "Login",
    joinFree: "Join Free",
    dashboard: "Dashboard",
    logout: "Logout",
    myProfile: "My Profile",
    messages: "Messages",
    notifications: "Notifications",
    payments: "Payments",
    search: "Search",

    // Home / Landing Page
    heroTitle: "Find Your Perfect Life Partner",
    heroSubtitle: "Join 5M+ verified members. Smart matches, secure chats, lasting marriages — that's the Ungalkalyanam promise.",
    findMatch: "Find Match",
    exploreProfiles: "Explore Profiles",
    trustedByMillions: "Trusted by Millions",
    successRate: "Success Rate",
    verifiedProfiles: "Verified Profiles",

    // Auth Pages
    email: "Email",
    password: "Password",
    signIn: "Sign In",
    forgotPassword: "Forgot Password?",
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: "Already have an account?",
    registerTitle: "Create your free profile",
    registerSubtitle: "It only takes 2 minutes to get started.",
    fullName: "Full name",
    dob: "Date of birth",
    mobile: "Mobile",
    profileFor: "Profile for",
    gender: "Gender",
    religion: "Religion",
    motherTongue: "Mother tongue",
    caste: "Community / Caste",
    maritalStatus: "Marital status",
    verifyOtp: "Verify OTP",
    enterOtp: "Enter the 6-digit code sent to your phone",
    verify: "Verify",

    // Profile Page / Search Fields
    age: "Age",
    height: "Height",
    city: "City",
    state: "State",
    country: "Country",
    profession: "Profession",
    education: "Education",
    income: "Income",
    bio: "Bio",
    familyDetails: "Family Details",
    partnerPreferences: "Partner Preferences",
    saveChanges: "Save Changes",

    // Dashboard
    recommendedMatches: "Recommended Matches",
    profileCompletion: "Profile Completion",
    membership: "Membership",
    validUntil: "Valid until",
    credits: "Credits",
    profileViews: "Profile Views",
    interestsReceived: "Interests Received",
    interestsSent: "Interests Sent",
    unreadMessages: "unread messages",

    // Filters / Generic
    filters: "Filters",
    resetFilters: "Reset filters",
    lookingFor: "Looking for",
    bride: "Bride",
    groom: "Groom",
    find: "Find",
    viewPlans: "View plans",
    createFreeProfile: "Create free profile",
    howItWorks: "How it works",
    featuredProfiles: "Featured profiles",
    realStories: "Real stories",
    allReligions: "All Religions",
    allTongues: "All Tongues",
    allCities: "All Cities",
    allDegrees: "All Degrees",
    noMembers: "No members found matching your search.",
  },
  ta: {
    // Navigation
    home: "முகப்பு",
    browse: "தேடுக",
    premium: "பிரீமியம்",
    pricing: "கட்டணங்கள்",
    successStories: "வெற்றிக் கதைகள்",
    blog: "வலைப்பதிவு",
    login: "உள்நுழைக",
    joinFree: "இலவசமாக சேருங்கள்",
    dashboard: "டாஷ்போர்டு",
    logout: "வெளியேறுக",
    myProfile: "எனது சுயவிவரம்",
    messages: "செய்திகள்",
    notifications: "அறிவிப்புகள்",
    payments: "பணம் செலுத்துதல்",
    search: "தேடல்",

    // Home / Landing Page
    heroTitle: "உங்களின் சிறந்த வாழ்க்கை துணையை கண்டறியுங்கள்",
    heroSubtitle: "50 லட்சத்திற்கும் அதிகமான சரிபார்க்கப்பட்ட உறுப்பினர்களுடன் இணையுங்கள். புத்திசாலித்தனமான தேர்வுகள், பாதுகாப்பான அரட்டைகள், நிலையான திருமணங்கள் - இதுவே உங்கள்கல்யாணம் வாக்குறுதி.",
    findMatch: "வரன் தேடுக",
    exploreProfiles: "விவரங்களை ஆராய்க",
    trustedByMillions: "லட்சக்கணக்கானோரின் நம்பிக்கை",
    successRate: "வெற்றி விகிதம்",
    verifiedProfiles: "சரிபார்க்கப்பட்ட சுயவிவரங்கள்",

    // Auth Pages
    email: "மின்னஞ்சல்",
    password: "கடவுச்சொல்",
    signIn: "உள்நுழைக",
    forgotPassword: "கடவுச்சொல் மறந்துவிட்டதா?",
    dontHaveAccount: "கணக்கு இல்லையா?",
    alreadyHaveAccount: "ஏற்கனவே கணக்கு உள்ளதா?",
    registerTitle: "இலவச சுயவிவரத்தை உருவாக்குங்கள்",
    registerSubtitle: "தொடங்குவதற்கு 2 நிமிடங்கள் மட்டுமே ஆகும்.",
    fullName: "முழு பெயர்",
    dob: "பிறந்த தேதி",
    mobile: "கைபேசி எண்",
    profileFor: "யாருக்கான சுயவிவரம்",
    gender: "பாலினம்",
    religion: "மதம்",
    motherTongue: "தாய்மொழி",
    caste: "சமூகம் / சாதி",
    maritalStatus: "திருமண நிலை",
    verifyOtp: "OTP சரிபார்ப்பு",
    enterOtp: "உங்கள் கைபேசிக்கு அனுப்பப்பட்ட 6 இலக்க குறியீட்டை உள்ளிடவும்",
    verify: "சரிபார்",

    // Profile Page / Search Fields
    age: "வயது",
    height: "உயரம்",
    city: "நகரம்",
    state: "மாநிலம்",
    country: "நாடு",
    profession: "தொழில்",
    education: "கல்வி",
    income: "வருமானம்",
    bio: "சுயவிவரம்",
    familyDetails: "குடும்ப விவரங்கள்",
    partnerPreferences: "வாழ்க்கைத்துணை முன்னுரிமைகள்",
    saveChanges: "மாற்றங்களைச் சேமி",

    // Dashboard
    recommendedMatches: "பரிந்துரைக்கப்பட்ட வரன்கள்",
    profileCompletion: "சுயவிவரம் பூர்த்தி",
    membership: "உறுப்பினர் வகை",
    validUntil: "காலாவதி தேதி",
    credits: "கிரெடிட்ஸ்",
    profileViews: "சுயவிவரப் பார்வைகள்",
    interestsReceived: "வந்த விருப்பங்கள்",
    interestsSent: "அனுப்பிய விருப்பங்கள்",
    unreadMessages: "படிக்காத செய்திகள்",

    // Filters / Generic
    filters: "வடிகட்டிகள்",
    resetFilters: "வடிகட்டிகளை நீக்கு",
    lookingFor: "வரன் வகை",
    bride: "மணமகள்",
    groom: "மணமகன்",
    find: "தேடுக",
    viewPlans: "கட்டண விவரங்கள்",
    createFreeProfile: "இலவச சுயவிவரத்தை உருவாக்கு",
    howItWorks: "செயல்படும் முறை",
    featuredProfiles: "சிறப்பு சுயவிவரங்கள்",
    realStories: "வாழ்க்கைக் கதைகள்",
    allReligions: "அனைத்து மதங்கள்",
    allTongues: "அனைத்து மொழிகள்",
    allCities: "அனைத்து நகரங்கள்",
    allDegrees: "அனைத்து படிப்புகள்",
    noMembers: "உங்கள் தேடலுக்கு பொருத்தமான வரன்கள் எதுவும் கிடைக்கவில்லை.",
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Default is always English; Tamil is opt-in via the language toggle
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem("ungalkalyanam_language") as Language | null;
    // Only restore Tamil if user explicitly switched to it before
    if (saved === "ta") {
      setLanguageState("ta");
    }
    // If saved is "en" or null/undefined → stay English (default)
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("ungalkalyanam_language", lang);
  };

  const t = (key: string): string => {
    return DICTIONARY[language][key] || DICTIONARY["en"][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
