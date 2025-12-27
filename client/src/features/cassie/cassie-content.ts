// Content configuration for the Cassie page
// Edit this file to update the page content without touching the component code
export function getAllImagesFromFolder(): string[] {
  const imageFiles: string[] = [
    "20250918_202136.jpg",
    "20250918_202447.jpg",
    "20250918_205855.jpg",
    "20250919_175813.jpg",
    "20250919_175817.jpg",
    "20250919_175831.jpg",
    "20250919_175953.jpg",
    "20250919_180014.jpg",
    "20250919_183346.jpg",
    "20250919_184336.jpg",
    "20250919_184606.jpg",
    "20250919_185001.jpg",
    "20250919_185154.jpg",
    "20250919_185157.jpg",
    "20250919_185201.jpg",
    "20250919_185228.jpg",
    "20250919_185230.jpg",
    "20250919_185353.jpg",
    "20250919_185359.jpg",
    "20250919_185414.jpg",
    "20250919_185420.jpg",
    "20250919_200147.jpg",
    "20250919_200156.jpg",
    "20250919_200213.jpg",
    "20250919_200255.jpg",
    "20250919_200433.jpg",
    "20250919_200440.jpg",
    "20250919_200442.jpg",
    "20250919_200755.jpg",
    "20250919_200807.jpg",
    "20250919_200812.jpg",
    "20250919_200830.jpg",
    "20250919_201032.jpg",
    "20250919_202100.jpg",
    "20250919_202116.jpg",
    "20250919_202150.jpg",
    "20250919_202210.jpg",
    "20250919_203125.jpg",
    "20250919_203128.jpg",
    "20250919_204109.jpg",
    "20250919_204118.jpg",
    "20250919_204911.jpg",
    "20250919_205824.jpg",
    "20250919_205826.jpg",
    "20250919_210208.jpg",
    "20250920_131300.jpg",
    "20250920_132742.jpg",
    "20250920_132744.jpg",
    "20250920_153313.jpg"
  ];
  
  return imageFiles.map(file => `/Converter-MP4-GIF/images-optimized/${file}`);
}

export interface MemoryCard {
  icon: string;
  title: string;
  description: string;
}

export interface ReasonItem {
  number: string;
  text: string;
}

export interface LetterParagraph {
  text: string;
}

export interface PhotoItem {
  images?: string[];
  imageUrl?: string;
  placeholder: string;
  alt?: string;
  autoRotate?: boolean;
  rotateInterval?: number;
}

export interface CassiePageContent {
  hero: {
    title: string;
    subtitle: string;
  };
  promise: {
    text: string;
    subtext: string;
  };
  memories: {
    sectionTitle: string;
    cards: MemoryCard[];
  };
  photoGallery: {
    sectionTitle: string;
    photos: PhotoItem[];
    helpText: string;
  };
  reasons: {
    sectionTitle: string;
    items: ReasonItem[];
  };
  loveLetter: {
    greeting: string;
    paragraphs: LetterParagraph[];
    signature: string;
  };
  countdown: {
    sectionTitle: string;
    birthday: {
      year: number;
      month: number;
      day: number;
    };
    subtitle: string;
  };
  footer: {
    message: string;
    credit: string;
  };
}

// ============================================
// EDIT BELOW THIS LINE TO UPDATE PAGE CONTENT
// ============================================

export const cassiePageContent: CassiePageContent = {
  hero: {
    title: "Cassandra",
    subtitle: "My kitten, my home, my everything",
  },

  promise: {
    text: "We'll figure it out together",
    subtext: "Our quiet promise during the hard moments—the foundation of everything we are, and everything we're becoming.",
  },

  memories: {
    sectionTitle: "Our Story in Moments",
    cards: [
      {
        icon: "🌙",
        title: "Sleeping on Call",
        description: "Watching over you as you sleep, hearing your gentle breathing, waking up to find you still there. Those nights when you fall asleep listening to my voice, and I get to be your comfort even from miles away.",
      },
      {
        icon: "🎮",
        title: "Your Gaming Victories",
        description: "Watching you clear P7 Alt Prog, cheering you on through TOP at 10am. I'm so proud of the player you've become, and I love being there to celebrate every achievement with you.",
      },
      {
        icon: "🎃",
        title: "You Planning Our Adventures",
        description: "Those late nights when you stay up mapping out the pumpkin festival, booking hotels, planning every detail because you want it to be perfect for us. Your excitement when you got those tickets will always make me smile.",
      },
      {
        icon: "🦈",
        title: "Sharkie As My Stand-In",
        description: "Every night you tell me you're holding Sharkie tight, wishing it was me instead. The two sharks together, waiting for the real thing. I miss being the one you fall asleep holding.",
      },
      {
        icon: "💜",
        title: "My Voice Messages To You",
        description: "Knowing that you listen to my voice memos on repeat when you miss me, when you're scared, when you need comfort. That they heal your heart the way your messages heal mine.",
      },
      {
        icon: "🏡",
        title: "Being Your Home",
        description: "You tell me I'm your home—not a place, but a person. Where you feel safe enough to cry, to be vulnerable, to just be yourself. You make me want to be that safe place for you, always.",
      },
    ],
  },

  photoGallery: {
    sectionTitle: "Our Story in Frames",
    photos: [
      {
        images: [
          "/Converter-MP4-GIF/images/keep_3.jpg",
        ],
        placeholder: "More memories",
        alt: "Happy times with kitten",
        autoRotate: false,
      },
      {
        images: ["/Converter-MP4-GIF/images/keep_1.jpg"],
        placeholder: "More memories",
        alt: "Happy times with kitten",
        autoRotate: false,
      },
      
      {
        images: ["/Converter-MP4-GIF/images/keep_2.jpg",],
        placeholder: "More memories",
        alt: "Happy times with kitten",
        autoRotate: false,
      },
      
      {
        images: 
        [
          "/Converter-MP4-GIF/images/20250919_205824.jpg",
        ],
        placeholder: "More memories",
        alt: "Happy times with kitten",
        autoRotate: false,
      },
            {
        images: 
        [
          "/Converter-MP4-GIF/images/IMG_4317.jpg",
          "/Converter-MP4-GIF/images/IMG_4366.jpg",
          "/Converter-MP4-GIF/images/IMG_4478.jpg",
        ],
        placeholder: "More memories",
        alt: "Happy times with kitten",
        autoRotate: true,
        rotateInterval: 5000,
      },

      {
        images: 
        [
          "/Converter-MP4-GIF/images/videos/20250919_175833.mp4",
        ],
        placeholder: "More memories",
        alt: "Happy times with kitten",
        autoRotate: false,
      },

            {
        images: 
        [
          "/Converter-MP4-GIF/images/videos/20250919_204356.mp4", 
        ],
        placeholder: "More memories",
        alt: "Happy times with kitten",
        autoRotate: false,
      },
                  {
        images: 
        [
          "/Converter-MP4-GIF/images/videos/20250920_153315.mp4",
        ],
        placeholder: "More memories",
        alt: "Happy times with kitten",
        autoRotate: false,
      },
      {
        images: getAllImagesFromFolder(),
        placeholder: "Our memories",
        alt: "Our special moments",
        autoRotate: true,
        rotateInterval: 3000,
      },
      
    ],helpText: "Click any photo to view it larger",
  },
  
  reasons: {
    sectionTitle: "Why I Love You (Beyond Words)",
    items: [
      {
        number: "01",
        text: "How you somehow always know when I need you. Even when I don’t say a word, you sense when something’s wrong. You stay by my side, offer comfort when I’m scared, and make me feel truly seen and protected.",
      },
      {
        number: "02",
        text: "The way you watch over me while I sleep. Every morning you've been awake, listening to me breathe, making sure I'm okay. You look over me and then send me messages wishing me a gentle morning before you go to bed yourself.",
      },
      {
        number: "03",
        text: "Your unwavering belief in me. Through job applications, through stress, through uncertainty—you never waver. You tell me you're proud of me, you support every decision, you make me want to be the best version of myself.",
      },
      {
        number: "04",
        text: "How you notice the little things that make life brighter. The way you remember my favorite songs, cheer for the small victories, and ask about the tiniest moments in my day. You make every ordinary moment feel special just by being present.",
      },
      {
        number: "05",
        text: "Your emotional courage. You're not afraid to say when you're scared, when you're hurting, when you miss me. You sit with uncomfortable feelings and talk them through. You've shown me what real vulnerability looks like.",
      },
      {
        number: "06",
        text: "The way you communicate your love. Your goodnight messages, your 'meow meow' kitten speech, your voice telling me you adore me. You never let me wonder how you feel—you show me every single day.",
      },
      {
        number: "07",
        text: "How you choose me. You tell me you won't abandon me, that as long as we're honest and kind to each other, you're staying. You promise we'll figure it out together. Your commitment means everything to me.",
      },
      {
        number: "08",
        text: "How our September trip changed everything for you. The way you talk about missing my arms around you, about finally knowing what home feels like. Since then, your feelings have been deeper, and I feel it in every word you say.",
      },
      {
        number: "09",
        text: "Your little habits—replaying my messages, your excited yaps make every moment with you feel special and make me love you even more.",
      },
      {
        number: "10",
        text: "How you call me your home. Not just a person you love, but where you feel safest in the world. You are my treasure, my best friend, the love of my life, and knowing I'm yours too is the greatest gift I've ever received.",
      },
    ],
  },

  loveLetter: {
    greeting: "Dear Cassie,",
    paragraphs: [
      {
        text: "Every morning I wake up and see your messages from the night before. You, tucked into bed with Sharkie, telling me you love me, that you miss me, that you wish it was my arms around you instead. And every morning my heart breaks a little because I miss you just as much.",
      },
      {
        text: "I love opening my phone and seeing your face. I love that it makes you smile when you see mine. I love that we've created our own little world, where distance fades and time disappears whenever we're together.",
      },
      {
        text: "Since our trip in September, I've watched your love for me deepen in the most beautiful way. You tell me how much harder it is now, knowing what it feels like to fall asleep in my arms, to wake up next to me. You cry at night because you miss me so much. And while I hate that you hurt, I love that what we have is so real, so deep, so worth missing.",
      },
      {
        text: "You've taught me what 'we'll figure it out together' really means. When you're struggling with your health and wake up crying, I'm there. When challenges or fears weigh on me, you're there. We face every hard moment side by side, always.",
      },
      {
        text: "I love how you make every adventure feel special, from pumpkin patches to aquarium visits. Your excitement is contagious, and even the simplest moments with you feel unforgettable.",
      },
      {
        text: "I love your kitten speech, your 'meow meow mrow' messages that translate to 'I love you sweetheart smile my love.' I love that you watch over me while I sleep and tell me you're proud of the player I've become. I love that my voice messages heal your heart when you're scared. I love that you listen to my playlist because it makes you feel close to me.",
      },
      {
        text: "You are my best decision in life, Cassie. You complete me. You're not just my partner, you're my home, my safe place, the person I choose every single day. And I'm so grateful that you choose me too, that you promise to stay, that you believe in us the way I do.",
      },
      {
        text: "This website, these photos, these words, these messages, they're my way of saying: I see you. I love you. I'm staying. Not just for today, not just for your birthday, but for every day after. We'll figure it out together, always.",
      },
      {
        text: "Happy birthday, my love. Thank you for being my everything. Thank you for making me feel like the luckiest person alive. Thank you for existing.",
      },
    ],
    signature: "Forever yours,<br />Luna 💜",
  },

  countdown: {
    sectionTitle: "Celebrating You",
    birthday: {
      year: 2026,
      month: 0,
      day: 2,
    },
    subtitle: "Until your next birthday",
  },

  footer: {
    message: "You are my home, my treasure, my everything. Time disappears when I'm with you, and somehow, that's exactly where I want to be.",
    credit: "Dec. 2025 • For my kitten 🦈💜",
  },
};