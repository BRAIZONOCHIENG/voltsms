export interface BlogPost {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    date: string;
    category: string;
}

export const MOCK_POSTS: BlogPost[] = [
    {
        id: 1,
        title: "Stop Fighting OpenAI: Here is How I Bypassed the Phone Requirement",
        slug: "verify-openai-without-phone",
        excerpt: "I know how frustrating it is to see 'Phone number already used' when trying to use ChatGPT. Here is my secret trick to get a clean number in seconds.",
        date: "Oct 12, 2026",
        category: "Tutorials"
    },
    {
        id: 2,
        title: "I Used Temporary Numbers for a Week: Here is Why You Should Too",
        slug: "top-5-uses-temporary-sms",
        excerpt: "I ditched my real SIM for everything besides family and close friends. The results? Zero spam calls and total peace of mind. Let me show you how.",
        date: "Oct 18, 2026",
        category: "Guides"
    },
    {
        id: 3,
        title: "Digital Privacy in 2026: I'm Changing the Way I Browse",
        slug: "why-privacy-matters-2026",
        excerpt: "Privacy is not about hiding; it's about control. I'm sharing my personal deep-dive into protecting my identity from trackers and automated filters.",
        date: "Oct 28, 2026",
        category: "Privacy"
    },
    {
        id: 4,
        title: "Virtual vs Real SIM: Why My Codes Failed Until I Switched",
        slug: "non-voip-vs-voip-explained",
        excerpt: "I wasted $20 on virtual numbers that WhatsApp instantly rejected. Once I switched to Real SIM (Non-VoIP), everything changed. I'll explain why.",
        date: "Nov 05, 2026",
        category: "Technology"
    },
    {
        id: 5,
        title: "My Secret to Running Two WhatsApp Accounts on One Phone",
        slug: "bypass-whatsapp-verification-guide",
        excerpt: "You don't need a dual-SIM phone to have a work and personal WhatsApp. I use this clever method to verify a second account without the headache.",
        date: "Nov 12, 2026",
        category: "Tutorials"
    },
    {
        id: 6,
        title: "Telegram Privacy: How I Stay Anonymous in Any Group",
        slug: "telegram-security-non-voip-guide",
        excerpt: "Telegram is great, but sharing your number is risky. I found a way to stay completely hidden while still enjoying all the features I love.",
        date: "Nov 20, 2026",
        category: "Security"
    },
    {
        id: 7,
        title: "I Spotted These 5 SMS Scams—Don't Fall for Them",
        slug: "avoiding-sms-verification-scams",
        excerpt: "Scammers are getting smarter, but I've learned their patterns. I'm breaking down the most common red flags to keep your data safe and sound.",
        date: "Nov 25, 2026",
        category: "Safety"
    },
    {
        id: 8,
        title: "Bypass Tinder Ban: How I Got Back on the App Safely",
        slug: "tinder-ban-bypass-guide",
        excerpt: "Getting banned for no reason sucks. I found a way to start fresh with a clean number that actually passes the Tinder VoIP filter every time.",
        date: "Dec 02, 2026",
        category: "Guides"
    },
    {
        id: 9,
        title: "US Phone Numbers for Gmail: My Experience with Google Verification",
        slug: "us-google-verification-trick",
        excerpt: "Google's 'too many attempts' error is the worst. I use this specific set of US numbers that work perfectly for Gmail and YouTube verifications.",
        date: "Dec 08, 2026",
        category: "Tutorials"
    },
    {
        id: 10,
        title: "Why 'Free' SMS Services Are Actually Selling Your Data",
        slug: "the-real-cost-of-free-sms",
        excerpt: "Nothing is free. I dug into the privacy policies of 'free' SMS sites and what I found was shocking. I'm sticking to premium for a reason.",
        date: "Dec 15, 2026",
        category: "Privacy"
    },
    {
        id: 11,
        title: "My Business Security Strategy: Why I Never Use Personal Numbers",
        slug: "business-2fa-security-strategy",
        excerpt: "Managing a team means managing risk. I transitioned all our business accounts to dedicated 2FA lines and our security has never been tighter.",
        date: "Dec 22, 2026",
        category: "Business"
    },
    {
        id: 12,
        title: "Instagram Without a SIM: How I Manage Multiple Growth Accounts",
        slug: "instagram-multi-account-privacy",
        excerpt: "Growing an audience requires multiple accounts, but Instagram hates that. I use a specific number rotation to keep all my profiles safe.",
        date: "Jan 05, 2027",
        category: "Marketing"
    },
    {
        id: 13,
        title: "SIM Swapping is Real: Here is How I Protected My Crypto",
        slug: "protecting-crypto-from-sim-swap",
        excerpt: "Losing your crypto because of a weak phone provider is a nightmare. I implemented these 3 steps to ensure my accounts stay untouchable.",
        date: "Jan 12, 2027",
        category: "Security"
    },
    {
        id: 14,
        title: "WhatsApp for Business: Setting Up Without the SIM Card Hassle",
        slug: "whatsapp-business-account-setup",
        excerpt: "You can have a professional business line without carrying two phones. I show you how to verify WhatsApp Business in under 2 minutes.",
        date: "Jan 20, 2027",
        category: "Business"
    },
    {
        id: 15,
        title: "The Best Countries for Reliable SMS Verification in 2027",
        slug: "best-countries-sms-verification",
        excerpt: "Not all countries have the same success rates. I tested 180+ regions and found the best performers for bypass, speed, and reliability.",
        date: "Jan 28, 2027",
        category: "Technology"
    },
    {
        id: 16,
        title: "Discord Verification Failed? My Quick Fix for Any Server",
        slug: "discord-phone-verification-fix",
        excerpt: "Some servers are strict about phone verification. I used this specific range of numbers to get into any Discord community without being flagged.",
        date: "Feb 05, 2027",
        category: "Gaming"
    },
    {
        id: 17,
        title: "Managing 50+ Social Media Accounts: My Privacy Workflow",
        slug: "managing-multiple-accounts-workflow",
        excerpt: "Automation is easy, but staying undetected is hard. I'm sharing the exact workflow I use to manage dozens of accounts without single ban.",
        date: "Feb 12, 2027",
        category: "Marketing"
    },
    {
        id: 18,
        title: "Bumble Verification vs Tinder: Which is Harder to Bypass?",
        slug: "bumble-vs-tinder-verification",
        excerpt: "I did a head-to-head comparison of dating app security. One is much easier to get around if you know the right type of number to use.",
        date: "Feb 20, 2027",
        category: "Guides"
    },
    {
        id: 19,
        title: "My Review of VoltSMS: Why I Built This Service for You",
        slug: "why-voltsms-story",
        excerpt: "I was tired of services that didn't work. I'm telling the story of why I created VoltSMS and how it solves the biggest problems in SMS verification.",
        date: "Feb 25, 2027",
        category: "News"
    },
    {
        id: 20,
        title: "Airbnb Verification Without Your Real Number: A Traveler's Tip",
        slug: "airbnb-verification-travel-privacy",
        excerpt: "Traveling often means needing local verifications. I use this trick to keep my Airbnb account active and secure while I'm on the move.",
        date: "Mar 02, 2027",
        category: "Travel"
    },
    {
        id: 21,
        title: "Snapchat Locked? How a Clean Number Can Save Your Memories",
        slug: "snapchat-lock-recovery-guide",
        excerpt: "Snapchat locks accounts for the weirdest reasons. I found that verify with a fresh Real SIM number is the best way to get back in.",
        date: "Mar 10, 2027",
        category: "Guides"
    },
    {
        id: 22,
        title: "The Ultimate Guide to Bypassing Bot Detection in 2027",
        slug: "bypassing-bot-detection-2027",
        excerpt: "Security systems are evolving, but so am I. I'm sharing the latest techniques I use to stay ahead of automated bot filters and IP blocks.",
        date: "Mar 15, 2027",
        category: "Security"
    }
];
