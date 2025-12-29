// Content configuration for the Cassie page
// Edit this file to update the page content without touching the component code
export function getAllImagesFromFolder(): string[] {
  const imageFiles: string[] = [
    '20250918_202136.jpg',
    '20250918_202447.jpg',
    '20250918_205855.jpg',
    '20250919_175813.jpg',
    '20250919_175817.jpg',
    '20250919_175831.jpg',
    '20250919_175953.jpg',
    '20250919_180014.jpg',
    '20250919_183346.jpg',
    '20250919_184336.jpg',
    '20250919_184606.jpg',
    '20250919_185001.jpg',
    '20250919_185154.jpg',
    '20250919_185157.jpg',
    '20250919_185201.jpg',
    '20250919_185228.jpg',
    '20250919_185230.jpg',
    '20250919_185353.jpg',
    '20250919_185359.jpg',
    '20250919_185414.jpg',
    '20250919_185420.jpg',
    '20250919_200147.jpg',
    '20250919_200156.jpg',
    '20250919_200213.jpg',
    '20250919_200255.jpg',
    '20250919_200433.jpg',
    '20250919_200440.jpg',
    '20250919_200442.jpg',
    '20250919_200755.jpg',
    '20250919_200807.jpg',
    '20250919_200812.jpg',
    '20250919_200830.jpg',
    '20250919_201032.jpg',
    '20250919_202100.jpg',
    '20250919_202116.jpg',
    '20250919_202150.jpg',
    '20250919_202210.jpg',
    '20250919_203125.jpg',
    '20250919_203128.jpg',
    '20250919_204109.jpg',
    '20250919_204118.jpg',
    '20250919_204911.jpg',
    '20250919_205824.jpg',
    '20250919_205826.jpg',
    '20250919_210208.jpg',
    '20250920_131300.jpg',
    '20250920_132742.jpg',
    '20250920_132744.jpg',
    '20250920_153313.jpg',
  ]

  return imageFiles.map((file) => `/Converter-MP4-GIF/images-optimized/${file}`)
}

export interface MemoryCard {
  icon: string
  title: string
  description: string
}

export interface ReasonItem {
  number: string
  text: string
}

export interface LetterParagraph {
  text: string
}

export interface PhotoItem {
  images?: string[]
  imageUrl?: string
  placeholder: string
  alt?: string
  autoRotate?: boolean
  rotateInterval?: number
}

export interface VoiceMemo {
  title: string
  audioSrc: string
  duration: string
}

export interface CassiePageContent {
  hero: {
    title: string
    subtitle: string
  }
  promise: {
    text: string
    subtext: string
  }
  memories: {
    sectionTitle: string
    cards: MemoryCard[]
  }
  photoGallery: {
    sectionTitle: string
    photos: PhotoItem[]
    helpText: string
  }
  reasons: {
    sectionTitle: string
    items: ReasonItem[]
  }
  loveLetter: {
    greeting: string
    paragraphs: LetterParagraph[]
    signature: string
  }
  countdown: {
    sectionTitle: string
    birthday: {
      year: number
      month: number
      day: number
    }
    subtitle: string
  }
  footer: {
    message: string
    credit: string
  }
  voiceMemos: {
    sectionTitle: string
    items: VoiceMemo[]
  }
}

// ============================================
// EDIT BELOW THIS LINE TO UPDATE PAGE CONTENT
// ============================================

export const cassiePageContent: CassiePageContent = {
  hero: {
    title: 'Cassandra',
    subtitle: 'My kitten, my home, my everything',
  },

  promise: {
    text: "We'll figure it out together",
    subtext:
      "Our quiet promise during the hard moments, the foundation of everything we are, and everything we're becoming.",
  },

  memories: {
    sectionTitle: 'Our Story in Moments',
    cards: [
      {
        icon: '',
        title: 'Sleeping on Call',
        description:
          'Watching over you as you fall asleep, hearing your breathing soften, waking up and knowing we stayed together through the night. Those calls where my voice helps you rest, even with distance between us, mean more to me than I ever say.',
      },
      {
        icon: '',
        title: 'Your Achievements and Growth',
        description:
          'Whether it is clearing difficult content in games or facing new challenges in life, your focus and persistence make me proud. Seeing you set goals and work toward them, and being there to celebrate your wins, matters deeply to me.',
      },
      {
        icon: '',
        title: 'Looking Ahead Together',
        description:
          'When we talk about future moments, small trips, shared experiences, simple time together, it feels like we’re moving forward as a team. That feeling of togetherness means a lot to me.',
      },
      {
        icon: '',
        title: 'Sharkie As My Stand-In',
        description:
          'Knowing you hold Sharkie at night and think of me makes the distance feel smaller. Two sharks waiting for the same moment. Until then, I carry that closeness with me.',
      },
      {
        icon: '',
        title: 'My Voice Messages To You',
        description:
          'It means a lot knowing my voice helps you feel steadier when you are scared or missing me. That something I share can bring you comfort reminds me how connected we are, even apart.',
      },
      {
        icon: '',
        title: 'Being Your Home',
        description:
          'When you tell me I am your home, a person where you feel safe, seen, and able to be yourself, it shapes how I show up for you. I want to keep earning that trust and being a place where you can rest.',
      },
      {
        icon: '',
        title: 'Your Playful Side',
        description:
          'The moments when you let go and are just silly, playful, and affectionate. Your "kitten" speech and the way you make me laugh bring so much light into my life.',
      },
    ],
  },

  photoGallery: {
    sectionTitle: 'Our Story in Frames',
    photos: [
      {
        images: ['/Converter-MP4-GIF/images/keep_3.jpg'],
        placeholder: 'More memories',
        alt: 'Happy times with kitten',
        autoRotate: false,
      },
      {
        images: ['/Converter-MP4-GIF/images/keep_1.jpg'],
        placeholder: 'More memories',
        alt: 'Happy times with kitten',
        autoRotate: false,
      },

      {
        images: ['/Converter-MP4-GIF/images/keep_2.jpg'],
        placeholder: 'More memories',
        alt: 'Happy times with kitten',
        autoRotate: false,
      },

      {
        images: ['/Converter-MP4-GIF/images/20250919_205824.jpg'],
        placeholder: 'More memories',
        alt: 'Happy times with kitten',
        autoRotate: false,
      },
      {
        images: [
          '/Converter-MP4-GIF/images/IMG_4317.jpg',
          '/Converter-MP4-GIF/images/IMG_4366.jpg',
          '/Converter-MP4-GIF/images/IMG_4478.jpg',
        ],
        placeholder: 'More memories',
        alt: 'Happy times with kitten',
        autoRotate: true,
        rotateInterval: 5000,
      },

      {
        images: ['/Converter-MP4-GIF/images/videos/20250919_175833.mp4'],
        placeholder: 'More memories',
        alt: 'Happy times with kitten',
        autoRotate: false,
      },

      {
        images: ['/Converter-MP4-GIF/images/videos/20250919_204356.mp4'],
        placeholder: 'More memories',
        alt: 'Happy times with kitten',
        autoRotate: false,
      },
      {
        images: ['/Converter-MP4-GIF/images/videos/20250920_153315.mp4'],
        placeholder: 'More memories',
        alt: 'Happy times with kitten',
        autoRotate: false,
      },
      {
        images: getAllImagesFromFolder(),
        placeholder: 'Our memories',
        alt: 'Our special moments',
        autoRotate: true,
        rotateInterval: 3000,
      },
    ],
    helpText: 'Click any photo to view it larger',
  },

  reasons: {
    sectionTitle: 'Why I Love You (Beyond Words)',
    items: [
      {
        number: '01',
        text: 'The way you notice me. Even when I struggle to put things into words, you check in, listen, and make space for how I’m feeling. You help me feel understood and supported.',
      },
      {
        number: '02',
        text: 'Those quiet mornings when we have shared sleep on call. Waking up to messages from you and knowing we stayed connected through the night makes the distance feel smaller.',
      },
      {
        number: '03',
        text: 'Your belief in me during uncertain moments. Through applications, stress, and big decisions, you encourage me and remind me of my strengths. Your support helps me keep moving forward.',
      },
      {
        number: '04',
        text: 'How you pay attention to the small details. You remember my favorite songs, celebrate small wins, and ask about the parts of my day that matter to me. You bring warmth into everyday moments.',
      },
      {
        number: '05',
        text: 'Your emotional honesty. You speak openly about your fears, your feelings, and your needs. That openness has shown me how to sit with emotions and talk through them with care.',
      },
      {
        number: '06',
        text: 'The ways you express affection. Your goodnight messages, playful words, and the warmth in your voice make your feelings clear. I always know where I stand with you.',
      },
      {
        number: '07',
        text: 'The way you choose to stay present and work through things together. Your commitment to honesty, kindness, and shared effort means a great deal to me.',
      },
      {
        number: '08',
        text: 'How our September trip became meaningful to you. The way you talk about feeling closer, more grounded, and more connected afterward. I feel that change in how we talk and how we care for each other.',
      },
      {
        number: '09',
        text: 'Your little habits. The excitement in your voice and the way you revisit shared moments add joy and make time with you feel memorable.',
      },
      {
        number: '10',
        text: 'When you call me your home and when we talk about safety and belonging with each other. Being that kind of presence in your life, and having you in mine, is something I value deeply.',
      },
    ],
  },

  loveLetter: {
    greeting: 'Dear Cassie,',
    paragraphs: [
      {
        text: 'Every morning I wake up and see your messages from the night before. You curled up with Sharkie, telling me you love me and that you miss me. Seeing your words first thing in the day reminds me how connected we are, even across distance, and it makes me feel close to you right away',
      },
      {
        text: 'I love opening my phone and seeing your face. I love knowing it makes you smile when you see mine. We have created a space that feels like ours, where time slows down and the rest of the world fades whenever we are together.',
      },
      {
        text: 'Since our trip in September, I have noticed how much more real everything feels to both of us. You talk about that time with warmth and longing, about feeling closer and more grounded. Hearing you reflect on it shows me how deeply we connected, and I carry that with me every day.',
      },
      {
        text: 'You have shown me what it means to face life as a team. When things feel heavy for you, I want to be present and supportive. When I am struggling or uncertain, you show up with care and patience. We remind each other that we do not have to face hard moments alone.',
      },
      {
        text: 'I love how you bring excitement into the things we do together. From pumpkin patches to aquarium visits, your joy turns shared time into memories that stay with me long after the day ends.',
      },
      {
        text: 'I love your kitten speech and your playful messages that always make me smile. I love the way you encourage me, celebrate my growth, and share your affection so openly. I love that we find comfort in each other through voices, playlists, and small rituals that make distance feel manageable.',
      },
      {
        text: 'You are someone I choose every day, Cassie. Being with you feels grounding and meaningful. You make me feel safe, understood, and valued, and I hope you feel the same with me. I am grateful for the trust we are building and the care we show one another.',
      },
      {
        text: 'This website, these photos, and these words are my way of saying that I see you and that I care deeply about you. I am here, I am committed, and I want to keep growing together with honesty and kindness.',
      },
      {
        text: 'Happy birthday, my love. Thank you for being who you are and for sharing your heart with me. I am thankful for you and for the life we are building together.',
      },
    ],
    signature: 'Forever yours,<br />Luna 💜',
  },

  countdown: {
    sectionTitle: 'Celebrating You',
    birthday: {
      year: 2026,
      month: 0,
      day: 2,
    },
    subtitle: 'Until your birthday',
  },

  footer: {
    message:
      "You are my home, my treasure, my everything. Time disappears when I'm with you, and somehow, that's exactly where I want to be.",
    credit: 'Dec. 2025 • For my kitten 🦈💜',
  },

  voiceMemos: {
    sectionTitle: 'Open When...',
    items: [
      {
        title: "You're Feeling Sad",
        audioSrc: '/Converter-MP4-GIF/voice-memos/openwhenyourefeelingsad.mp3',
        duration: '0:39',
      },
      {
        title: "You Can't Sleep",
        audioSrc: '/Converter-MP4-GIF/voice-memos/openwhenyoucantsleep.mp3',
        duration: '0:31',
      },
      {
        title: 'You Miss Me',
        audioSrc: '/Converter-MP4-GIF/voice-memos/openwhenyoumissme.mp3',
        duration: '0:30',
      },
      {
        title: 'You Need a Confidence Boost',
        audioSrc:
          '/Converter-MP4-GIF/voice-memos/openwhenyouneedaconfidenceboost.mp3',
        duration: '0:34',
      },
      {
        title: "You're Anxious",
        audioSrc: '/Converter-MP4-GIF/voice-memos/openwhenyoureanxious.mp3',
        duration: '0:32',
      },
      {
        title: 'You Feel Alone',
        audioSrc: '/Converter-MP4-GIF/voice-memos/openwhenyoufeelalone.mp3',
        duration: '0:30',
      },
    ],
  },
}
