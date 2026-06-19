export type Member = {
  id: string;
  userId?: number;
  isSaved?: boolean;
  interestSent?: boolean;
  name: string;
  age: number;
  height: string;
  religion: string;
  community: string;
  motherTongue: string;
  city: string;
  state: string;
  country: string;
  profession: string;
  education: string;
  income: string;
  maritalStatus: string;
  photo: string;
  gallery: string[];
  bio: string;
  premium: boolean;
  verified: boolean;
  online: boolean;
  lastActive: string;
  joinedDays: number;
  family: {
    father: string;
    mother: string;
    siblings: string;
    familyType: string;
    familyValues: string;
    familyStatus: string;
  };
  partnerPrefs: {
    ageRange: string;
    heightRange: string;
    religion: string;
    community: string;
    education: string;
    profession: string;
    location: string;
  };
};

const PHOTOS = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=800&auto=format&fit=crop",
];

const NAMES_F = ["Aanya Sharma","Priya Iyer","Riya Mehta","Saanvi Kapoor","Ishita Reddy","Aisha Khan","Neha Patel","Diya Singh","Kavya Nair","Anika Gupta"];
const NAMES_M = ["Aarav Verma","Vivaan Joshi","Arjun Rao","Rohan Malhotra","Kabir Bose","Aditya Pillai","Karthik Menon","Dhruv Saxena","Ishan Bhatt","Rahul Chowdhury"];
const CITIES = [["Mumbai","Maharashtra"],["Bengaluru","Karnataka"],["Delhi","Delhi"],["Hyderabad","Telangana"],["Chennai","Tamil Nadu"],["Pune","Maharashtra"],["Kolkata","West Bengal"],["Ahmedabad","Gujarat"]];
const PROFESSIONS = ["Software Engineer","Doctor","Chartered Accountant","Product Manager","Architect","Civil Engineer","Designer","Entrepreneur","Banker","Marketing Lead"];
const EDUS = ["B.Tech","M.Tech","MBA","MBBS","B.Com","M.Sc","CA","B.Arch"];
const RELIGIONS = ["Hindu","Muslim","Christian","Sikh","Jain"];
const COMMUNITIES = ["Brahmin","Khatri","Reddy","Iyer","Sunni","Catholic","Jat","Marwari"];
const LANGS = ["Hindi","English","Tamil","Telugu","Marathi","Bengali","Gujarati","Punjabi"];

function pick<T>(arr: T[], i: number): T { return arr[i % arr.length]; }

export const MEMBERS: Member[] = Array.from({ length: 24 }).map((_, i) => {
  const female = i % 2 === 0;
  const name = female ? pick(NAMES_F, i / 2) : pick(NAMES_M, (i - 1) / 2);
  const [city, state] = pick(CITIES, i);
  const photo = pick(PHOTOS, i);
  return {
    id: `UK00${10008 + i}`,
    name,
    age: 24 + (i % 10),
    height: `${5 + ((i % 3))}'${(i * 3) % 12}"`,
    religion: pick(RELIGIONS, i),
    community: pick(COMMUNITIES, i),
    motherTongue: pick(LANGS, i),
    city, state, country: "India",
    profession: pick(PROFESSIONS, i),
    education: pick(EDUS, i),
    income: `₹${8 + (i % 30)} LPA`,
    maritalStatus: i % 7 === 0 ? "Divorced" : "Never Married",
    photo,
    gallery: [photo, pick(PHOTOS, i + 1), pick(PHOTOS, i + 2), pick(PHOTOS, i + 3)],
    bio: "Family-oriented, ambitious and warm-hearted. Looking for a life partner who shares similar values, loves travel, and believes in mutual respect and growth.",
    premium: i % 3 === 0,
    verified: i % 2 === 0,
    online: i % 4 === 0,
    lastActive: i % 4 === 0 ? "Online now" : `${(i % 8) + 1}h ago`,
    joinedDays: (i * 3) % 60,
    family: {
      father: "Business",
      mother: "Homemaker",
      siblings: i % 2 === 0 ? "1 Sister (Married)" : "1 Brother",
      familyType: "Nuclear",
      familyValues: "Moderate",
      familyStatus: "Upper Middle Class",
    },
    partnerPrefs: {
      ageRange: `${24 + (i % 5)}-${30 + (i % 5)}`,
      heightRange: `5'4\" - 6'0\"`,
      religion: pick(RELIGIONS, i),
      community: "Open to all",
      education: "Graduate or higher",
      profession: "Any professional",
      location: "India",
    },
  };
});

export const SUCCESS_STORIES = [
  { id: "1", couple: "Anjali & Rohan", date: "March 2025", city: "Mumbai", photo: "https://images.unsplash.com/photo-1519741497674-611481863552?w=900&auto=format&fit=crop", quote: "We matched on day one and knew it was meant to be. Forever grateful to this platform." },
  { id: "2", couple: "Sneha & Aditya", date: "January 2025", city: "Bengaluru", photo: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=900&auto=format&fit=crop", quote: "Verified profiles and genuine connections — that's what made the difference for us." },
  { id: "3", couple: "Priya & Karthik", date: "November 2024", city: "Chennai", photo: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=900&auto=format&fit=crop", quote: "From first message to wedding bells in 8 months. Thank you for bringing us together." },
];

export const PLANS = [
  { id: "silver", name: "Silver", price: 999, period: "3 months", color: "from-slate-400 to-slate-600", popular: false,
    features: ["View 50 profiles/day","Send 25 interests","Basic search filters","Chat with mutual matches","Email support"] },
  { id: "gold", name: "Gold", price: 2499, period: "6 months", color: "from-amber-400 to-amber-600", popular: true,
    features: ["Unlimited profile views","Send 100 interests","Advanced filters","Unlock contact info (50)","See who viewed you","Priority support"] },
  { id: "platinum", name: "Platinum", price: 4999, period: "12 months", color: "from-rose-400 to-rose-600", popular: false,
    features: ["Everything in Gold","Unlimited contact unlocks","Profile highlighted","Personal relationship manager","Verified badge","Premium photo gallery","24/7 priority support"] },
];

export const FAQS = [
  { q: "How do I register on the platform?", a: "Click Register, fill in basic details, verify via OTP, and complete your profile in 3 simple steps." },
  { q: "Is my information kept private?", a: "Absolutely. We use bank-grade encryption and you control who can view your contact information." },
  { q: "What is the difference between membership plans?", a: "Silver gives essentials, Gold unlocks contacts and advanced filters, Platinum adds a relationship manager and verified badge." },
  { q: "Can I cancel my subscription anytime?", a: "Yes. You can manage and cancel your subscription from your dashboard at any time." },
  { q: "How are profiles verified?", a: "We verify via mobile OTP, ID proof and optional video verification for premium members." },
  { q: "Do you offer refunds?", a: "Refunds are available within 7 days of purchase if no premium features have been used." },
];

export const BLOG_POSTS = [
  { id: "1", title: "10 Conversation Starters for Your First Match", category: "Dating Tips", read: "5 min read", date: "Jun 1, 2026", img: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=900&auto=format&fit=crop", excerpt: "Break the ice with thoughtful, genuine questions that lead to real connection." },
  { id: "2", title: "How to Spot a Compatible Partner", category: "Relationships", read: "7 min read", date: "May 24, 2026", img: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=900&auto=format&fit=crop", excerpt: "Beyond the checklist — values, communication and emotional maturity matter most." },
  { id: "3", title: "Planning Your First Meet — A Safe Guide", category: "Safety", read: "4 min read", date: "May 12, 2026", img: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=900&auto=format&fit=crop", excerpt: "Public places, shared plans, trusted friends — make the first meeting comfortable." },
  { id: "4", title: "Wedding Trends 2026", category: "Inspiration", read: "6 min read", date: "Apr 30, 2026", img: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=900&auto=format&fit=crop", excerpt: "From intimate destination weddings to sustainable celebrations — what's new." },
];

export const NOTIFICATIONS = [
  { id: "1", title: "New interest received", desc: "Priya I. is interested in your profile", time: "2 min ago", unread: true, type: "interest" },
  { id: "2", title: "Profile match", desc: "5 new matches based on your preferences", time: "1 hour ago", unread: true, type: "match" },
  { id: "3", title: "Message", desc: "Aarav V. sent you a message", time: "3 hours ago", unread: false, type: "message" },
  { id: "4", title: "Profile viewed", desc: "Your profile was viewed 12 times today", time: "Yesterday", unread: false, type: "view" },
];

export const CHATS = [
  { id: "c1", memberId: "UK0010008", lastMessage: "That sounds wonderful! Looking forward to it.", time: "2m", unread: 2 },
  { id: "c2", memberId: "UK0010010", lastMessage: "Thank you for sharing. We have so much in common!", time: "1h", unread: 0 },
  { id: "c3", memberId: "UK0010012", lastMessage: "Would love to know more about your family.", time: "3h", unread: 1 },
  { id: "c4", memberId: "UK0010014", lastMessage: "Sure, let's plan a call this weekend.", time: "Yesterday", unread: 0 },
];

export const MESSAGES = [
  { id: 1, from: "them", text: "Hi! I came across your profile and really liked your bio.", time: "10:30 AM" },
  { id: 2, from: "me", text: "Thank you so much! That's very kind. I enjoyed reading yours too.", time: "10:32 AM" },
  { id: 3, from: "them", text: "Would you like to chat more? Maybe about your hobbies?", time: "10:33 AM" },
  { id: 4, from: "me", text: "Absolutely. I love reading, travel, and trying new cuisines!", time: "10:35 AM" },
  { id: 5, from: "them", text: "That sounds wonderful! Looking forward to it.", time: "10:36 AM" },
];

export const PAYMENT_HISTORY = [
  { id: "INV-2026-001", date: "May 12, 2026", plan: "Gold (6 months)", amount: 2499, status: "Paid" },
  { id: "INV-2025-018", date: "Nov 12, 2025", plan: "Silver (3 months)", amount: 999, status: "Paid" },
  { id: "INV-2025-009", date: "Aug 02, 2025", plan: "Credits Top-up", amount: 499, status: "Paid" },
];

export const ADMIN_STATS = {
  totalUsers: 48230,
  activeUsers: 12480,
  premiumUsers: 6210,
  revenue: 12450000,
  newSignups: 312,
  matches: 1820,
};

export const LEADS = Array.from({ length: 12 }).map((_, i) => ({
  id: `L${2000 + i}`,
  name: pick([...NAMES_F, ...NAMES_M], i),
  phone: `+91 9${(800000000 + i * 13771).toString().slice(0, 9)}`,
  email: `lead${i}@example.com`,
  source: pick(["Facebook Ad","Google","Referral","Organic","Instagram"], i),
  status: pick(["New","Contacted","Qualified","Converted","Lost"], i),
  assignedTo: pick(["Ravi K.","Meera S.","Anil P.","Sunita R."], i),
  createdAt: `${(i % 28) + 1} Jun 2026`,
}));

export const STAFF = Array.from({ length: 6 }).map((_, i) => ({
  id: `S${100 + i}`,
  name: pick(["Ravi Kumar","Meera Sharma","Anil Patel","Sunita Rao","Vikram Singh","Pooja Joshi"], i),
  role: pick(["Lead Manager","Senior Counsellor","Sales Rep","Support"], i),
  email: `staff${i}@matrimony.in`,
  leads: 20 + i * 7,
  conversions: 4 + i,
  status: i % 4 === 0 ? "Inactive" : "Active",
}));

export const REVENUE_CHART = [
  { month: "Jan", revenue: 820000, signups: 240 },
  { month: "Feb", revenue: 940000, signups: 280 },
  { month: "Mar", revenue: 1120000, signups: 320 },
  { month: "Apr", revenue: 1080000, signups: 305 },
  { month: "May", revenue: 1245000, signups: 360 },
  { month: "Jun", revenue: 1390000, signups: 412 },
];
