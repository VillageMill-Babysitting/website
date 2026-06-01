/**
 * BABYSITTERS DATA
 * ─────────────────────────────────────────────────────────────────────────────
 * HOW TO ADD A BABYSITTER:
 *   1. Copy one of the blocks below and paste it after the last closing "},"
 *   2. Fill in the details: name, age, experience, photo URL, bio, etc.
 *   3. Increment the "id" field to the next number.
 *   4. Set "featured: true" to show them on the Home page.
 *
 * PHOTO TIPS:
 *   - Use a square photo at least 300×300 pixels.
 *   - Upload photos to your GitHub repo (e.g., assets/photos/name.jpg).
 *   - Replace the photo URL with your relative path: "assets/photos/sarah.jpg"
 * ─────────────────────────────────────────────────────────────────────────────
 */
window.BABYSITTERS_DATA = [
  {
    id: 1,
    name: "Sarah Johnson",
    age: 25,
    experience: 5,
    photo: "https://randomuser.me/api/portraits/women/26.jpg",
    photoAlt: "Sarah Johnson, babysitter",
    shortBio: "Warm, patient, and endlessly creative — kids absolutely love Sarah.",
    bio: "Sarah is a certified early childhood educator with 5 years of professional babysitting experience. She specializes in working with children aged 1–10 and has a wonderful talent for making even the shyest kids feel right at home. When she's not babysitting, Sarah loves arts and crafts — something she always brings to her sessions to keep little ones engaged and smiling.",
    certifications: ["CPR Certified", "First Aid", "Early Childhood Education"],
    specialties: ["Arts & Crafts", "Newborns", "Special Needs Support"],
    rating: 4.9,
    reviewCount: 47,
    availability: "Weekdays & Weekends",
    featured: true
  },
  {
    id: 2,
    name: "Emily Chen",
    age: 22,
    experience: 3,
    photo: "https://randomuser.me/api/portraits/women/44.jpg",
    photoAlt: "Emily Chen, babysitter",
    shortBio: "Energetic, nurturing, and always full of ideas for outdoor adventures.",
    bio: "Emily is studying Child Development at university and brings both academic knowledge and genuine warmth to every session. With 3 years of babysitting experience across 6 families, she's great at homework help, STEM activities, and outdoor play. Parents love how engaged their kids stay under Emily's care.",
    certifications: ["CPR Certified", "First Aid", "Child Development Student"],
    specialties: ["Outdoor Play", "Homework Help", "STEM Activities"],
    rating: 4.8,
    reviewCount: 29,
    availability: "Evenings & Weekends",
    featured: true
  },
  {
    id: 3,
    name: "Michael Torres",
    age: 28,
    experience: 7,
    photo: "https://randomuser.me/api/portraits/men/32.jpg",
    photoAlt: "Michael Torres, babysitter",
    shortBio: "Calm, confident, and brilliant with high-energy kids of all ages.",
    bio: "Michael is our most experienced sitter with 7 years in childcare — from summer camps to daycare centres to private families. He has a background in physical education, loves sports and games, and excels at keeping multiple children occupied. He's also trained in behaviour management, making him an exceptional fit for more energetic households.",
    certifications: ["CPR Certified", "First Aid", "Behaviour Management", "Camp Counsellor Certified"],
    specialties: ["High-Energy Kids", "Sports & Games", "Multiple Children", "Teenagers"],
    rating: 4.9,
    reviewCount: 61,
    availability: "Flexible Schedule",
    featured: true
  },
  {
    id: 4,
    name: "Olivia Smith",
    age: 24,
    experience: 4,
    photo: "https://randomuser.me/api/portraits/women/65.jpg",
    photoAlt: "Olivia Smith, babysitter",
    shortBio: "Gentle, dependable, and especially wonderful with infants and toddlers.",
    bio: "Olivia has a natural gift with very young children. Her 4 years of babysitting experience is complemented by part-time work at a paediatric clinic, giving her unique insight into developmental milestones. Parents consistently say their babies calm down the moment Olivia arrives. She is also fully bilingual in Spanish and English.",
    certifications: ["CPR Certified", "First Aid", "Infant Care Specialist", "Bilingual (Spanish)"],
    specialties: ["Infants", "Toddlers", "Bilingual Care", "Sleep Routines"],
    rating: 4.9,
    reviewCount: 38,
    availability: "Daytime & Weekends",
    featured: false
  }
];
