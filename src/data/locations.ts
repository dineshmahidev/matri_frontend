export const STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli",
  "Daman and Diu",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry"
];

export const STATE_CITY_MAP: Record<string, string[]> = {
  "Tamil Nadu": [
    "Chennai", "Coimbatore", "Madurai", "Trichy (Tiruchirappalli)", "Salem",
    "Tirunelveli", "Vellore", "Erode", "Thanjavur", "Thoothukudi (Tuticorin)",
    "Dindigul", "Tiruppur", "Nagercoil", "Kanchipuram", "Karur",
    "Kumbakonam", "Rajapalayam", "Sivakasi", "Pollachi", "Hosur",
    "Cuddalore", "Nagapattinam", "Villupuram", "Ambur", "Vaniyambadi",
    "Namakkal", "Dharmapuri", "Krishnagiri", "Perambalur", "Pudukkottai",
    "Ariyalur", "Sivaganga", "Virudhunagar", "Theni", "Rameshwaram",
    "Ooty (Udhagamandalam)", "Kodaikanal", "Tiruvannamalai", "Arakkonam"
  ],
  "Karnataka": [
    "Bengaluru", "Mysore (Mysuru)", "Hubli-Dharwad", "Mangalore (Mangaluru)",
    "Belgaum (Belagavi)", "Gulbarga (Kalaburagi)", "Davangere", "Bellary (Ballari)",
    "Shimoga (Shivamogga)", "Tumkur (Tumakuru)", "Udupi", "Hassan",
    "Raichur", "Bidar", "Mandya", "Chitradurga", "Bagalkot"
  ],
  "Kerala": [
    "Thiruvananthapuram", "Kochi (Ernakulam)", "Kozhikode (Calicut)",
    "Thrissur", "Kollam", "Alappuzha", "Palakkad", "Kannur",
    "Malappuram", "Kottayam", "Idukki", "Wayanad", "Pathanamthitta",
    "Kasaragod"
  ],
  "Andhra Pradesh": [
    "Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Tirupati",
    "Kurnool", "Kakinada", "Rajahmundry", "Anantapur", "Kadapa",
    "Eluru", "Ongole", "Srikakulam", "Proddatur", "Chittoor",
    "Machilipatnam", "Tenali", "Chirala", "Hindupur"
  ],
  "Telangana": [
    "Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam",
    "Ramagundam", "Mahbubnagar", "Nalgonda", "Adilabad", "Suryapet",
    "Siddipet", "Miryalaguda", "Jagtial", "Mancherial"
  ],
  "Maharashtra": [
    "Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad (Chhatrapati Sambhajinagar)",
    "Solapur", "Kolhapur", "Amravati", "Nanded", "Sangli",
    "Jalgaon", "Akola", "Latur", "Dhule", "Ahmednagar", "Ratnagiri",
    "Satara", "Parbhani", "Chandrapur"
  ],
  "Delhi": [
    "New Delhi", "Central Delhi", "North Delhi", "South Delhi",
    "East Delhi", "West Delhi", "Dwarka", "Rohini", "Saket",
    "Noida", "Gurugram", "Faridabad", "Ghaziabad", "Greater Noida"
  ],
  "Gujarat": [
    "Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar",
    "Jamnagar", "Junagadh", "Gandhinagar", "Anand", "Navsari",
    "Morbi", "Mehsana", "Bharuch", "Vapi", "Gandhidham"
  ],
  "West Bengal": [
    "Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri",
    "Bardhaman", "Kharagpur", "Haldia", "Kalyani", "Baharampur",
    "Malda", "Raiganj", "Jalpaiguri", "Darjeeling"
  ],
  "Uttar Pradesh": [
    "Lucknow", "Kanpur", "Agra", "Varanasi", "Prayagraj (Allahabad)",
    "Meerut", "Ghaziabad", "Noida", "Aligarh", "Bareilly",
    "Moradabad", "Gorakhpur", "Jhansi", "Mathura", "Firozabad",
    "Saharanpur", "Muzaffarnagar", "Ayodhya"
  ],
  "Rajasthan": [
    "Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer",
    "Bikaner", "Bhilwara", "Alwar", "Sikar", "Bharatpur",
    "Pali", "Sri Ganganagar"
  ],
  "Punjab": [
    "Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda",
    "Mohali", "Pathankot", "Hoshiarpur", "Moga", "Phagwara",
    "Kapurthala", "Firozpur"
  ],
  "Madhya Pradesh": [
    "Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain",
    "Sagar", "Dewas", "Satna", "Rewa", "Ratlam",
    "Katni", "Singrauli", "Burhanpur"
  ],
  "Bihar": [
    "Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Darbhanga",
    "Purnia", "Arrah", "Begusarai", "Katihar", "Munger",
    "Chhapra", "Saharsa", "Samastipur", "Bihar Sharif"
  ],
  "Haryana": [
    "Gurugram (Gurgaon)", "Faridabad", "Panipat", "Ambala", "Karnal",
    "Hisar", "Rohtak", "Sonipat", "Yamunanagar", "Panchkula",
    "Bhiwani", "Rewari"
  ],
  "Jharkhand": [
    "Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar",
    "Hazaribagh", "Giridih", "Dumka"
  ],
  "Assam": [
    "Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon",
    "Tinsukia", "Tezpur", "Bongaigaon", "Karimganj"
  ],
  "Odisha": [
    "Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur",
    "Puri", "Balasore", "Jharsuguda", "Bhadrak"
  ],
  "Chhattisgarh": [
    "Raipur", "Bhilai", "Bilaspur", "Durg", "Korba",
    "Rajnandgaon", "Jagdalpur", "Ambikapur", "Raigarh"
  ],
  "Goa": [
    "Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda"
  ],
  "Himachal Pradesh": [
    "Shimla", "Dharamshala", "Manali", "Solan", "Mandi",
    "Kullu", "Bilaspur", "Hamirpur"
  ],
  "Manipur": [
    "Imphal", "Thoubal", "Bishnupur", "Churachandpur"
  ],
  "Meghalaya": [
    "Shillong", "Tura", "Jowai", "Nongstoin"
  ],
  "Mizoram": [
    "Aizawl", "Lunglei", "Champhai", "Serchhip"
  ],
  "Nagaland": [
    "Kohima", "Dimapur", "Mokokchung", "Tuensang"
  ],
  "Sikkim": [
    "Gangtok", "Namchi", "Mangan", "Gyalshing"
  ],
  "Tripura": [
    "Agartala", "Udaipur", "Dharmanagar", "Kailashahar"
  ],
  "Uttarakhand": [
    "Dehradun", "Haridwar", "Rishikesh", "Nainital",
    "Haldwani", "Roorkee", "Kashipur", "Rudrapur"
  ],
  "Arunachal Pradesh": [
    "Itanagar", "Naharlagun", "Pasighat", "Tawang", "Ziro"
  ],
  "Andaman and Nicobar Islands": [
    "Port Blair"
  ],
  "Chandigarh": [
    "Chandigarh"
  ],
  "Dadra and Nagar Haveli": [
    "Silvassa"
  ],
  "Daman and Diu": [
    "Daman", "Diu"
  ],
  "Jammu and Kashmir": [
    "Srinagar", "Jammu", "Anantnag", "Baramulla", "Sopore"
  ],
  "Ladakh": [
    "Leh", "Kargil"
  ],
  "Lakshadweep": [
    "Kavaratti"
  ],
  "Puducherry": [
    "Puducherry", "Karaikal", "Yanam", "Mahe"
  ]
};
