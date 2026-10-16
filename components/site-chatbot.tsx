'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { useSiteTheme } from '@/components/site-theme-provider';

type SiteContent = {
  packages?: Array<{ name: string; items?: string[] }>;
  services?: Array<{ title: string; description: string; deliverables: string }>;
  branches?: Array<{ name: string; address: string; description?: string; locationUrl: string }>;
  gallery?: Array<{ title: string; category: string; description?: string }>;
  offers?: Array<{ title: string; description: string; packages: string[]; startsAt: string; endsAt: string | null }>;
};

type ReplyLink = { label: string; href: string };
type ChatLanguage = 'en' | 'hi' | 'mr';
type ChatIntent = 'packages' | 'owner' | 'services' | 'contact' | 'offers';
type ChatMessage = {
  id: number;
  role: 'assistant' | 'visitor';
  text: string;
  links?: ReplyLink[];
};

const WHATSAPP_NUMBER = '919511835507';
const whatsappLink = (message: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

const normalizeText = (value: string) =>
  value.toLowerCase().normalize('NFKC').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

const chatCopy = {
  en: {
    languageLabel: 'Language',
    suggestions: 'Suggested questions',
    welcome: 'Hi! Ask about Satish, packages, services, bookings, or studio locations.',
    greeting: 'Hello! I’m the SM Photography & Films assistant. What can I help you with today?',
    owner: 'Satish Molekar is the photographer and creative lead behind SM Photography & Films. He brings extensive hands-on experience across weddings, maternity portraits, events, modeling portfolios, and candid photography, with an approach built around personal stories, thoughtful direction, and making clients feel comfortable. The studio serves clients from its Malgaon and Miraj branches.',
    packageOne: (name: string, items: string[]) => `${name}${items.length ? ` includes:\n${items.map((item) => `• ${item}`).join('\n')}` : ' is available'}. The website asks clients to enquire for current pricing and availability.`,
    packageList: (list: string) => `SM Photography offers these packages:\n${list}\nThe website asks clients to enquire for current pricing and availability.`,
    packageMissing: 'Tell me which package you are considering and I can share its details. For a quote, contact Satish on WhatsApp or call +91 95118 35507.',
    serviceOne: (name: string, description: string, deliverables: string) => `${name}: ${description} What you receive: ${deliverables}`,
    serviceList: (list: string) => `SM Photography offers ${list}. Tell me which one you have in mind and I’ll explain what it includes. You can also contact Satish on WhatsApp for a tailored quote.`,
    baby: 'The site does not list dedicated baby or newborn session details yet. The studio can confirm options, styling, and availability directly.',
    maternity: 'Maternity photography is available, with gentle direction and styling guidance. Dress inventory is not listed, so please ask the studio about wardrobe options.',
    booking: 'I can’t view the live calendar, so I can’t confirm an open date. Send a booking request and the team can check availability.',
    gallery: 'The public portfolio is on the Gallery page. Private client galleries are separate and need the access details shared by the studio.',
    locations: (list: string) => `The studio locations listed on the site are:\n${list}`,
    contact: 'You can call SM Photography & Films at +91 95118 35507 or email smphotography5207@gmail.com.',
    fallback: (question: string) => `Thanks for asking about “${question}”. I can help with photography services, packages, bookings, and locations. For a personal answer, message Satish directly.`,
    ask: 'Ask a question...',
    inputLabel: 'Ask a question',
    typingLabel: 'SM Photography is typing',
    send: 'Send message',
    close: 'Close chat',
    packagesPrompt: 'Packages & pricing',
    offersPrompt: 'Current offers',
    servicesPrompt: 'Our services',
    locationsPrompt: 'Studio locations',
    experiencePrompt: 'About Satish',
    contactPrompt: 'Contact',
    assistant: 'SM Studio Assistant',
    subtitle: 'Ask us about the studio',
    about: 'About Satish',
    packages: 'View packages',
    services: 'Explore services',
    bookingLink: 'Booking form',
    book: 'Book a session',
    galleryLink: 'View the gallery',
    privateGallery: 'Client gallery login',
    contactLink: 'Contact the studio',
    whatsapp: 'Ask on WhatsApp',
    call: 'Call the studio',
    enquiry: 'Send an enquiry',
    wardrobe: 'Maternity details',
    which: 'Which service interests you?',
    themeLabel: 'Appearance',
    lightMode: 'Light',
    darkMode: 'Dark',
    themeToggle: 'Switch appearance',
  },
  hi: {
    languageLabel: 'भाषा',
    suggestions: 'सुझाव वाले सवाल',
    welcome: 'नमस्ते! सतीश जी, पैकेज, सेवाओं, बुकिंग या स्टूडियो के पते के बारे में पूछें।',
    greeting: 'नमस्ते! मैं SM Photography & Films का सहायक हूँ। आज मैं आपकी किस तरह मदद कर सकता हूँ?',
    owner: 'SM Photography & Films के मालिक और फ़ोटोग्राफ़र सतीश मोलेकर हैं। उनका स्टूडियो मालगांव, सांगली में है। वे शादी, मैटरनिटी, मॉडलिंग और कैंडिड फ़ोटोग्राफ़ी करते हैं। उनका प्रोफ़ाइल रचनात्मकता, बारीकी और सहज ग्राहक अनुभव पर ज़ोर देता है।',
    packageOne: (name: string, _items: string[] = []) => `${name} उपलब्ध है। पैकेज की जानकारी, कीमत और उपलब्धता के लिए सतीश जी को WhatsApp करें या +91 95118 35507 पर कॉल करें।`,
    packageList: (list: string) => `SM Photography के पैकेज:\n${list}\nकीमत और उपलब्धता के लिए सतीश जी को WhatsApp करें या +91 95118 35507 पर कॉल करें।`,
    packageMissing: 'आप किस पैकेज के बारे में जानना चाहते हैं? जानकारी और कोटेशन के लिए सतीश जी को WhatsApp करें या +91 95118 35507 पर कॉल करें।',
    serviceOne: (name: string, description: string, deliverables: string) => `${name}: ${description} आपको मिलेगा: ${deliverables}`,
    serviceList: (list: string) => `SM Photography की सेवाएँ हैं: ${list}। बताइए आपको किस सेवा की जानकारी चाहिए। खास कोटेशन के लिए सतीश जी से WhatsApp पर बात करें।`,
    baby: 'वेबसाइट पर बेबी या न्यूबॉर्न फ़ोटोग्राफ़ी की अलग जानकारी अभी उपलब्ध नहीं है। विकल्प, स्टाइलिंग और तारीख़ के लिए स्टूडियो से पूछें।',
    maternity: 'मातृत्व फ़ोटोग्राफ़ी उपलब्ध है; इसमें सहज मार्गदर्शन और स्टाइलिंग सलाह शामिल है। ड्रेस उपलब्धता की जानकारी प्रकाशित नहीं है, इसलिए स्टूडियो से पूछें।',
    booking: 'मैं लाइव कैलेंडर नहीं देख सकता, इसलिए तारीख़ की उपलब्धता पक्की नहीं कर सकता। बुकिंग अनुरोध भेजें, टीम तारीख़ जाँच लेगी।',
    gallery: 'सार्वजनिक फ़ोटो गैलरी, Gallery पेज पर है। निजी क्लाइंट गैलरी अलग होती है और उसे खोलने के लिए स्टूडियो से मिले एक्सेस विवरण चाहिए।',
    locations: (list: string) => `वेबसाइट पर स्टूडियो के ये पते दिए गए हैं:\n${list}`,
    contact: 'SM Photography & Films को +91 95118 35507 पर कॉल करें या smphotography5207@gmail.com पर ईमेल करें।',
    fallback: (question: string) => `“${question}” के लिए धन्यवाद। मैं सेवाओं, पैकेज, बुकिंग और लोकेशन की जानकारी दे सकता हूँ। व्यक्तिगत जवाब के लिए सतीश जी को संदेश भेजें।`,
    ask: 'अपना सवाल लिखें...',
    inputLabel: 'अपना सवाल पूछें',
    typingLabel: 'SM Photography जवाब लिख रहा है',
    send: 'संदेश भेजें',
    close: 'चैट बंद करें',
    packagesPrompt: 'पैकेज और कीमत',
    offersPrompt: 'मौजूदा ऑफ़र',
    servicesPrompt: 'हमारी सेवाएँ',
    locationsPrompt: 'स्टूडियो का पता',
    experiencePrompt: 'सतीश के बारे में',
    contactPrompt: 'संपर्क करें',
    assistant: 'SM स्टूडियो सहायक',
    subtitle: 'स्टूडियो से पूछें',
    about: 'सतीश के बारे में',
    packages: 'पैकेज देखें',
    services: 'सेवाएँ देखें',
    bookingLink: 'बुकिंग फ़ॉर्म',
    book: 'सेशन बुक करें',
    galleryLink: 'गैलरी देखें',
    privateGallery: 'क्लाइंट गैलरी लॉगिन',
    contactLink: 'स्टूडियो से संपर्क',
    whatsapp: 'WhatsApp पर पूछें',
    call: 'स्टूडियो को कॉल करें',
    enquiry: 'पूछताछ भेजें',
    wardrobe: 'मातृत्व की जानकारी',
    which: 'कौन-सी सेवा चाहिए?',
    themeLabel: 'दिखावट',
    lightMode: 'लाइट',
    darkMode: 'डार्क',
    themeToggle: 'थीम बदलें',
  },
  mr: {
    languageLabel: 'भाषा',
    suggestions: 'सुचवलेले प्रश्न',
    welcome: 'नमस्कार! सतीश, पॅकेज, सेवा, बुकिंग किंवा स्टुडिओच्या पत्त्याबद्दल विचारा.',
    greeting: 'नमस्कार! मी SM Photography & Films चा सहाय्यक आहे. आज मी तुम्हाला कशी मदत करू?',
    owner: 'SM Photography & Films चे मालक आणि छायाचित्रकार सतीश मोळेकर आहेत. त्यांचा स्टुडिओ मालगाव, सांगली येथे आहे. ते लग्न, मॅटर्निटी, मॉडेलिंग आणि कॅन्डिड छायाचित्रण करतात. त्यांच्या प्रोफाइलमध्ये सर्जनशीलता, बारकावे आणि ग्राहकांचा सहज अनुभव यावर भर आहे.',
    packageOne: (name: string, _items: string[] = []) => `${name} उपलब्ध आहे. पॅकेजचे तपशील, किंमत आणि उपलब्धतेसाठी सतीश यांना WhatsApp करा किंवा +91 95118 35507 वर कॉल करा.`,
    packageList: (list: string) => `SM Photography ची पॅकेजेस:\n${list}\nकिंमत आणि उपलब्धतेसाठी सतीश यांना WhatsApp करा किंवा +91 95118 35507 वर कॉल करा.`,
    packageMissing: 'कोणत्या पॅकेजबद्दल जाणून घ्यायचे आहे? माहितीसाठी सतीश यांना WhatsApp करा किंवा +91 95118 35507 वर कॉल करा.',
    serviceOne: (name: string, description: string, deliverables: string) => `${name}: ${description} तुम्हाला मिळेल: ${deliverables}`,
    serviceList: (list: string) => `SM Photography च्या सेवा: ${list}. कोणत्या सेवेची माहिती हवी आहे ते सांगा. खास कोटेशनसाठी सतीश यांच्याशी WhatsApp वर बोला.`,
    baby: 'वेबसाइटवर बेबी किंवा नवजात बाळांच्या छायाचित्रणाचे स्वतंत्र तपशील सध्या नाहीत. पर्याय, सजावट आणि उपलब्ध तारखांसाठी स्टुडिओशी संपर्क साधा.',
    maternity: 'मॅटर्निटी छायाचित्रण उपलब्ध आहे; यामध्ये सहज मार्गदर्शन आणि स्टाइलिंगविषयी मदत मिळते. ड्रेस उपलब्धतेची माहिती दिलेली नाही, त्यामुळे स्टुडिओला विचारा.',
    booking: 'मला थेट बुकिंग कॅलेंडर पाहता येत नाही, त्यामुळे तारीख निश्चित सांगता येणार नाही. बुकिंग विनंती पाठवा; टीम उपलब्धता तपासेल.',
    gallery: 'सार्वजनिक फोटो गॅलरी Gallery पेजवर आहे. खाजगी क्लायंट गॅलरी वेगळी असून प्रवेशासाठी स्टुडिओने दिलेली माहिती आवश्यक आहे.',
    locations: (list: string) => `वेबसाइटवर स्टुडिओची ही ठिकाणे दिली आहेत:\n${list}`,
    contact: 'SM Photography & Films ला +91 95118 35507 वर कॉल करा किंवा smphotography5207@gmail.com वर ईमेल करा.',
    fallback: (question: string) => `“${question}” बद्दल धन्यवाद. सेवा, पॅकेज, बुकिंग आणि ठिकाणांची माहिती मी देऊ शकतो. वैयक्तिक उत्तरासाठी सतीश यांना संदेश पाठवा.`,
    ask: 'तुमचा प्रश्न लिहा...',
    inputLabel: 'तुमचा प्रश्न विचारा',
    typingLabel: 'SM Photography उत्तर लिहित आहे',
    send: 'संदेश पाठवा',
    close: 'चॅट बंद करा',
    packagesPrompt: 'पॅकेज आणि किंमत',
    offersPrompt: 'सध्याच्या ऑफर्स',
    servicesPrompt: 'आमच्या सेवा',
    locationsPrompt: 'स्टुडिओचे ठिकाण',
    experiencePrompt: 'सतीश यांच्याबद्दल',
    contactPrompt: 'संपर्क करा',
    assistant: 'SM स्टुडिओ सहाय्यक',
    subtitle: 'स्टुडिओला विचारा',
    about: 'सतीश यांच्याबद्दल',
    packages: 'पॅकेज पहा',
    services: 'सेवा पहा',
    bookingLink: 'बुकिंग फॉर्म',
    book: 'सेशन बुक करा',
    galleryLink: 'गॅलरी पहा',
    privateGallery: 'क्लायंट गॅलरी लॉगिन',
    contactLink: 'स्टुडिओशी संपर्क',
    whatsapp: 'WhatsApp वर विचारा',
    call: 'स्टुडिओला कॉल करा',
    enquiry: 'चौकशी पाठवा',
    wardrobe: 'मॅटर्निटी तपशील',
    which: 'कोणती सेवा हवी आहे?',
    themeLabel: 'दिसणे',
    lightMode: 'लाइट',
    darkMode: 'डार्क',
    themeToggle: 'थीम बदला',
  },
} as const;

const packageNames: Record<string, Record<ChatLanguage, string>> = {
  'silver package': { en: 'Silver Package', hi: 'सिल्वर पैकेज', mr: 'सिल्वर पॅकेज' },
  'gold package': { en: 'Gold Package', hi: 'गोल्ड पैकेज', mr: 'गोल्ड पॅकेज' },
  'diamond package': { en: 'Diamond Package', hi: 'डायमंड पैकेज', mr: 'डायमंड पॅकेज' },
  'pre wedding package': { en: 'Pre-Wedding Package', hi: 'प्री-वेडिंग पैकेज', mr: 'प्री-वेडिंग पॅकेज' },
  'maternity package': { en: 'Maternity Package', hi: 'मैटरनिटी पैकेज', mr: 'मॅटर्निटी पॅकेज' },
};

const servicesByName: Record<string, { aliases: string[]; names: Record<ChatLanguage, string>; details: Record<ChatLanguage, string> }> = {
  'wedding shoot': {
    aliases: ['wedding', 'शादी', 'विवाह', 'लग्न'],
    names: { en: 'Wedding Photography', hi: 'शादी की फ़ोटोग्राफ़ी', mr: 'लग्न छायाचित्रण' },
    details: { en: 'Wedding coverage captures rituals, family portraits, candid moments, and the celebration.', hi: 'शादी की फ़ोटोग्राफ़ी में रस्में, परिवार के पोर्ट्रेट, कैंडिड पल और समारोह शामिल हैं।', mr: 'लग्न छायाचित्रणात विधी, कुटुंबाचे फोटो, सहज क्षण आणि समारंभाचा समावेश होतो.' },
  },
  'pre wedding shoot': {
    aliases: ['pre wedding', 'प्री वेडिंग', 'प्री-वेडिंग'],
    names: { en: 'Pre-Wedding Photography', hi: 'प्री-वेडिंग फ़ोटोग्राफ़ी', mr: 'प्री-वेडिंग छायाचित्रण' },
    details: { en: 'Pre-wedding sessions include location and concept guidance, relaxed portraits, and cinematic options.', hi: 'प्री-वेडिंग सेशन में लोकेशन और कॉन्सेप्ट सलाह, सहज पोर्ट्रेट और सिनेमैटिक विकल्प शामिल हैं।', mr: 'प्री-वेडिंग सेशनमध्ये लोकेशन व संकल्पना मार्गदर्शन, सहज पोर्ट्रेट आणि सिनेमॅटिक पर्याय असतात.' },
  },
  'cinematic videography': {
    aliases: ['video', 'film', 'वीडियो', 'व्हिडिओ'],
    names: { en: 'Cinematic Videography', hi: 'सिनेमैटिक वीडियोग्राफ़ी', mr: 'सिनेमॅटिक व्हिडिओग्राफी' },
    details: { en: 'Story-led films are edited into teasers, highlights, and reels.', hi: 'कहानी पर आधारित फ़िल्मों में टीज़र, हाइलाइट और रील्स शामिल हो सकते हैं।', mr: 'कथानकावर आधारित फिल्ममध्ये टीझर, हायलाइट आणि रील्सचा समावेश असू शकतो.' },
  },
  'maternity photography': {
    aliases: ['maternity', 'pregnancy', 'मातृत्व', 'गर्भावस्था', 'डोहाळे'],
    names: { en: 'Maternity Photography', hi: 'मैटरनिटी फ़ोटोग्राफ़ी', mr: 'मॅटर्निटी छायाचित्रण' },
    details: { en: 'Gentle portraits with comfortable direction and styling guidance; ask the studio about wardrobe options.', hi: 'आरामदायक मार्गदर्शन और स्टाइलिंग सलाह के साथ पोर्ट्रेट; कपड़ों के विकल्प स्टूडियो से पूछें।', mr: 'सहज मार्गदर्शन आणि स्टाइलिंग सल्ल्यासह पोर्ट्रेट; कपड्यांच्या पर्यायांसाठी स्टुडिओला विचारा.' },
  },
  'outdoor sessions': {
    aliases: ['outdoor', 'बाहरी', 'आउटडोर', 'मैदानी'],
    names: { en: 'Outdoor Sessions', hi: 'आउटडोर सेशन', mr: 'आउटडोअर सेशन' },
    details: { en: 'Outdoor sessions use natural light, location planning, and relaxed posing.', hi: 'आउटडोर सेशन में प्राकृतिक रोशनी, लोकेशन योजना और सहज पोज़िंग शामिल है।', mr: 'आउटडोअर सेशनमध्ये नैसर्गिक प्रकाश, लोकेशन नियोजन आणि सहज पोझिंग असते.' },
  },
  'event coverage': {
    aliases: ['event', 'birthday', 'engagement', 'कार्यक्रम', 'समारोह', 'कार्यक्रमाचे'],
    names: { en: 'Event Photography', hi: 'इवेंट फ़ोटोग्राफ़ी', mr: 'कार्यक्रम छायाचित्रण' },
    details: { en: 'Event coverage includes guests, details, group portraits, and candid reactions.', hi: 'इवेंट कवरेज में मेहमान, सजावट, ग्रुप पोर्ट्रेट और कैंडिड प्रतिक्रियाएँ शामिल हैं।', mr: 'कार्यक्रम कव्हरेजमध्ये पाहुणे, सजावट, ग्रुप फोटो आणि सहज प्रतिक्रिया असतात.' },
  },
  'candid photography': {
    aliases: ['candid', 'कैंडिड', 'कॅन्डिड'],
    names: { en: 'Candid Photography', hi: 'कैंडिड फ़ोटोग्राफ़ी', mr: 'कॅन्डिड छायाचित्रण' },
    details: { en: 'Candid photography focuses on genuine expressions and spontaneous moments.', hi: 'कैंडिड फ़ोटोग्राफ़ी सच्चे भावों और सहज पलों पर केंद्रित है।', mr: 'कॅन्डिड छायाचित्रण नैसर्गिक भावना आणि सहज क्षण टिपते.' },
  },
  'modeling portfolios': {
    aliases: ['model', 'portfolio', 'मॉडल', 'पोर्टफोलियो'],
    names: { en: 'Modeling Portfolios', hi: 'मॉडलिंग पोर्टफ़ोलियो', mr: 'मॉडेलिंग पोर्टफोलिओ' },
    details: { en: 'Portfolio sessions offer pose direction, outfit guidance, and polished portraits.', hi: 'पोर्टफ़ोलियो सेशन में पोज़, कपड़ों और तैयार पोर्ट्रेट के लिए मार्गदर्शन मिलता है।', mr: 'पोर्टफोलिओ सेशनमध्ये पोझ, पोशाख आणि तयार पोर्ट्रेटसाठी मार्गदर्शन मिळते.' },
  },
  'drone shoot': {
    aliases: ['drone', 'ड्रोन'],
    names: { en: 'Drone Photography and Video', hi: 'ड्रोन फ़ोटोग्राफ़ी और वीडियो', mr: 'ड्रोन छायाचित्रण आणि व्हिडिओ' },
    details: { en: 'Aerial photos and video can add venue and landscape perspectives to an event.', hi: 'ड्रोन से स्थल और परिदृश्य के हवाई फ़ोटो व वीडियो लिए जा सकते हैं।', mr: 'ड्रोनमुळे स्थळ आणि परिसराचे हवाई फोटो व व्हिडिओ घेता येतात.' },
  },
};

function localizePackageName(name: string, language: ChatLanguage) {
  return packageNames[normalizeText(name)]?.[language] || name;
}

function playReplyTone(audioContext: AudioContext | null) {
  if (!audioContext || audioContext.state !== 'running') return;

  const startAt = audioContext.currentTime;
  [
    { frequency: 587.33, start: 0, duration: 0.16, volume: 0.055 },
    { frequency: 880, start: 0.095, duration: 0.2, volume: 0.04 },
  ].forEach(({ frequency, start, duration, volume }) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const noteStart = startAt + start;
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, noteStart);
    gain.gain.setValueAtTime(0.0001, noteStart);
    gain.gain.exponentialRampToValueAtTime(volume, noteStart + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + duration);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(noteStart);
    oscillator.stop(noteStart + duration + 0.01);
  });
}

function makeReply(question: string, content: SiteContent | null, language: ChatLanguage, intent?: ChatIntent): Omit<ChatMessage, 'id' | 'role'> {
  const normalized = normalizeText(question);
  const copy = chatCopy[language];
  const packages = (content?.packages || []).filter((item) => !item.name.toLowerCase().includes('terms'));
  const offers = content?.offers || [];
  const mentionedPackage = packages.find((item) => {
    const packageName = normalizeText(item.name);
    const shortName = packageName.replace(/\bpackage\b/g, '').trim();
    const localizedName = normalizeText(localizePackageName(item.name, language));
    return normalized.includes(packageName) || (shortName.length > 2 && normalized.includes(shortName)) || normalized.includes(localizedName);
  });
  const asksAboutPackages = intent === 'packages'
    || /package|price|pricing|cost|budget|rate|how much|charge|fee|पैकेज|पॅकेज|कीमत|मूल्य|दर|कितना|कितनी|किंमत|किती|रेट/.test(normalized)
    || ['पैकेज', 'पॅकेज', 'किंमत', 'किती', 'कितना', 'कीमत'].some((term) => question.includes(term));
  const asksAboutOwner = intent === 'owner'
    || /who.*(sm|studio|photographer)|sm.*who|who is|owner|founder|satish|molekar|about (sm|studio|him|satish)|experience|experienced|background|career|how long|years|photographer/.test(normalized)
    || ['सतीश', 'मोलेकर', 'मोळेकर', 'मालक', 'मालकी', 'संस्थापक', 'अनुभव', 'अनुभवी'].some((term) => question.includes(term))
    || ((normalized.includes('sm') || normalized.includes('एसएम')) && (question.includes('कोण') || question.includes('कौन') || question.includes('मालक') || normalized.includes('about')));

  if (/^(hi+|hello|hey|namaste|good morning|good afternoon|good evening)(?:\s|$)/.test(normalized) || /^(नमस्ते|नमस्कार|हाय|हॅलो)(?:\s|$)/.test(normalized)) {
    return {
      text: copy.greeting,
      links: [{ label: copy.services, href: '/ourservices' }, { label: copy.whatsapp, href: whatsappLink('Hello SM Photography & Films, I have a question about your services.') }],
    };
  }

  if (asksAboutOwner) {
    return {
      text: copy.owner,
      links: [{ label: copy.about, href: '/about' }, { label: copy.contactLink, href: '/contact' }],
    };
  }

  if (mentionedPackage) {
    const packageName = localizePackageName(mentionedPackage.name, language);
    return {
      text: copy.packageOne(packageName, mentionedPackage.items || []),
      links: [
        { label: copy.packages, href: '/package' },
        { label: copy.whatsapp, href: whatsappLink(`Hello, please share current details for the ${mentionedPackage.name}.`) },
      ],
    };
  }

  if (asksAboutPackages) {
    const list = packages.map((item) => `${localizePackageName(item.name, language)}${item.items?.length ? `: ${item.items.join(', ')}` : ''}`).join('\n');
    return {
      text: list ? copy.packageList(list) : copy.packageMissing,
      links: [{ label: copy.packages, href: '/package' }, { label: copy.whatsapp, href: whatsappLink('Hello, please share your current photography packages and pricing.') }],
    };
  }

  if (intent === 'offers' || /discount|promotion|special price|current offers|any offers|show offers|show me offers|what offers/.test(normalized)) {
    const currentOffers = offers.filter((offer) => Date.parse(offer.startsAt) <= Date.now() && (!offer.endsAt || Date.parse(offer.endsAt) > Date.now()));
    return {
      text: currentOffers.length
        ? `Current offers listed on the website:\n${currentOffers.map((offer) => `${offer.title}: ${offer.description.replace(/\\n/g, ' ').replace(/\s+/g, ' ').trim()}`).join('\n')}`
        : 'There are no current offers listed on the website. Contact the studio to ask about current promotions.',
      links: [{ label: copy.packages, href: '/package' }, { label: copy.whatsapp, href: whatsappLink('Hello, please share your current photography offers.') }],
    };
  }

  if (/everything|all details|all information|tell me about the studio|what do you offer|what all|overview/.test(normalized)) {
    const details = [
      `Photographer: Satish Molekar, with extensive hands-on experience in wedding, maternity, event, portrait, modeling, and candid photography.`,
      `Services: ${(content?.services || []).map((item) => `${item.title}: ${item.description} Deliverables: ${item.deliverables}`).join('\n') || 'See the services page.'}`,
      `Packages: ${packages.map((item) => `${item.name}${item.items?.length ? `: ${item.items.join(', ')}` : ''}`).join('\n') || 'See the packages page.'}`,
      `Studios: ${(content?.branches || []).map((branch) => `${branch.name} (${branch.address})${branch.description ? `: ${branch.description}` : ''}`).join('\n') || 'Malgaon and Miraj.'}`,
      `Portfolio categories: ${[...new Set((content?.gallery || []).map((item) => item.category))].join(', ') || 'See the gallery page.'}`,
      `Current offers: ${offers.filter((offer) => Date.parse(offer.startsAt) <= Date.now() && (!offer.endsAt || Date.parse(offer.endsAt) > Date.now())).map((offer) => `${offer.title}: ${offer.description.replace(/\s+/g, ' ').trim()}`).join('\n') || 'No current offers listed.'}`,
      'Contact: +91 95118 35507, smphotography5207@gmail.com.',
    ].join('\n');
    return {
      text: `Here is what the SM Photography & Films website currently lists:\n${details}\nAsk me about any service or package for more detail, or contact Satish for a quote and date availability.`,
      links: [{ label: copy.services, href: '/ourservices' }, { label: copy.packages, href: '/package' }, { label: copy.galleryLink, href: '/gallery' }, { label: copy.contactLink, href: '/contact' }],
    };
  }

  const publishedService = (content?.services || []).find((item) => {
    const serviceName = normalizeText(item.title);
    return serviceName.length > 2 && normalized.includes(serviceName);
  });
  if (publishedService) {
    return {
      text: copy.serviceOne(publishedService.title, publishedService.description, publishedService.deliverables),
      links: [{ label: copy.services, href: '/ourservices' }, { label: copy.book, href: '/booknow' }],
    };
  }

  const mentionedService = Object.entries(servicesByName).find(([key, value]) =>
    normalized.includes(normalizeText(key)) || value.aliases.some((alias) => normalized.includes(normalizeText(alias)))
  );
  if (mentionedService) {
    const [key, details] = mentionedService;
    const service = content?.services?.find((item) => normalizeText(item.title) === normalizeText(key));
    return {
      text: language === 'en' && service
        ? copy.serviceOne(details.names.en, service.description, service.deliverables)
        : copy.serviceOne(details.names[language], details.details[language], details.details[language]),
      links: [{ label: copy.services, href: '/ourservices' }, { label: copy.book, href: '/booknow' }],
    };
  }

  if (/baby|newborn|infant|बच्चा|शिशु|बाळ|नवजात/.test(normalized)) {
    return {
      text: copy.baby,
      links: [{ label: copy.whatsapp, href: whatsappLink(`Hello, I’m interested in a baby or newborn photography session. ${question}`) }, { label: copy.enquiry, href: '/portfolio' }],
    };
  }

  if (/maternity|pregnan|dress|wardrobe|outfit|मैटरनिटी|गर्भावस्था|ड्रेस|मातृत्व|मॅटर्निटी|गर्भधारणा|डोहाळे/.test(normalized)) {
    const maternityService = content?.services?.find((item) => /maternity/i.test(item.title));
    return {
      text: language === 'en' && maternityService ? `${maternityService.description} Dress inventory is not listed, so please ask the studio about wardrobe options.` : copy.maternity,
      links: [{ label: copy.wardrobe, href: '/package' }, { label: copy.whatsapp, href: whatsappLink(`Hello, I’d like details about maternity photography and wardrobe options. ${question}`) }],
    };
  }

  if (intent === 'services' || /service|services|shoot|photograph|videograph|event|wedding|engagement|portrait|drone|सेवा|सेवाएँ|सेवाएं|शूट|शादी|विवाह|लग्न|छायाचित्र|फोटोग्राफी|कार्यक्रम/.test(normalized) || question.includes('सेव')) {
    const serviceList = (content?.services || []).map((item) => {
      const serviceName = servicesByName[normalizeText(item.title)];
      return serviceName?.names[language] || item.title;
    }).join(', ');
    return {
      text: serviceList ? copy.serviceList(serviceList) : copy.which,
      links: [{ label: copy.services, href: '/ourservices' }, { label: copy.enquiry, href: '/portfolio' }],
    };
  }

  if (/book|booking|availability|available|date|session|reserve|बुक|बुकिंग|तारीख|दिनांक|नोंदणी|उपलब्धता/.test(normalized)) {
    return {
      text: copy.booking,
      links: [{ label: copy.bookingLink, href: '/booknow' }, { label: copy.whatsapp, href: whatsappLink(`Hello, I’d like to check availability for a photography session. ${question}`) }],
    };
  }

  if (/gallery|portfolio|photos|pictures|work|गैलरी|फोटो|तस्वीर|छायाचित्र|गॅलरी|फोटो/.test(normalized)) {
    const galleryHighlights = (content?.gallery || []).slice(0, 8).map((item) => `${item.title} (${item.category})${item.description ? `: ${item.description}` : ''}`).join('\n');
    return {
      text: galleryHighlights ? `${copy.gallery}\n${galleryHighlights}` : copy.gallery,
      links: [{ label: copy.galleryLink, href: '/gallery' }, { label: copy.privateGallery, href: '/client-gallery' }],
    };
  }

  if (/location|address|branch|directions|where|malgaon|miraj|पता|लोकेशन|कहाँ|मालगांव|मिरज|ठिकाण|पत्ता|कुठे|मिरज/.test(normalized)) {
    const branches = content?.branches || [];
    const branchList = branches.map((branch) => `${branch.name} — ${branch.address}${branch.description ? `: ${branch.description}` : ''}`).join('\n');
    return {
      text: branchList ? copy.locations(branchList) : copy.contact,
      links: [...branches.map((branch) => ({ label: branch.name.replace('SM Photo Studio & Films - ', 'Map: '), href: branch.locationUrl })), { label: copy.call, href: 'tel:+919511835507' }],
    };
  }

  if (intent === 'contact' || /contact|phone|call|whatsapp|email|reach|संपर्क|फोन|कॉल|ईमेल/.test(normalized) || question.includes('संपर्क')) {
    return {
      text: copy.contact,
      links: [{ label: copy.call, href: 'tel:+919511835507' }, { label: 'WhatsApp', href: whatsappLink('Hello SM Photography & Films, I have a question about your photography services.') }, { label: copy.contactLink, href: '/contact' }],
    };
  }

  return {
    text: copy.fallback(question),
    links: [{ label: copy.enquiry, href: '/portfolio' }, { label: copy.whatsapp, href: whatsappLink(`Hello SM Photography & Films, I have a question: ${question}`) }],
  };
}

export function SiteChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState<ChatLanguage>('en');
  const [draft, setDraft] = useState('');
  const [content, setContent] = useState<SiteContent | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 0, role: 'assistant', text: chatCopy.en.welcome },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const nextId = useRef(1);
  const replyTimerRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const { theme } = useSiteTheme();
  const copy = chatCopy[language];

  useEffect(() => {
    let isCurrent = true;
    Promise.all([
      fetch('/api/content', { cache: 'no-store' }),
      fetch('/api/offers', { cache: 'no-store' }),
    ])
      .then(async ([contentResponse, offersResponse]) => {
        const [published, offers] = await Promise.all([
          contentResponse.ok ? contentResponse.json() as Promise<Omit<SiteContent, 'offers'>> : null,
          offersResponse.ok ? offersResponse.json() as Promise<NonNullable<SiteContent['offers']>> : [],
        ]);
        if (isCurrent && published) setContent({ ...published, offers: offers || [] });
      })
      .catch(() => undefined);
    return () => { isCurrent = false; };
  }, []);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    const handleHeaderOpen = () => setIsOpen(true);
    window.addEventListener('sm:open-chat', handleHeaderOpen);
    return () => window.removeEventListener('sm:open-chat', handleHeaderOpen);
  }, []);

  useEffect(() => {
    setMessages((current) => current.length === 1 && current[0].id === 0
      ? [{ ...current[0], text: chatCopy[language].welcome }]
      : current);
  }, [language]);

  useEffect(() => {
    const messagesElement = messagesRef.current;
    if (messagesElement && (messages.length > 1 || isTyping)) {
      messagesElement.scrollTo({ top: messagesElement.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  useEffect(() => () => {
    if (replyTimerRef.current !== null) window.clearTimeout(replyTimerRef.current);
  }, []);

  const sendMessage = (value: string, intent?: ChatIntent) => {
    const question = value.trim();
    if (!question || isTyping) return;

    const visitorMessage: ChatMessage = { id: nextId.current++, role: 'visitor', text: question };
    const reply: ChatMessage = { id: nextId.current++, role: 'assistant', ...makeReply(question, content, language, intent) };
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      audioContextRef.current ??= new window.AudioContext();
      void audioContextRef.current.resume().catch(() => undefined);
    }
    setMessages((current) => [...current, visitorMessage]);
    setDraft('');
    setIsTyping(true);
    replyTimerRef.current = window.setTimeout(() => {
      setMessages((current) => [...current, reply]);
      setIsTyping(false);
      playReplyTone(audioContextRef.current);
      replyTimerRef.current = null;
    }, 650);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendMessage(draft);
  };

  return (
    <div className="site-chatbot">
      {isOpen ? (
        <section id="sm-site-chatbot" className="chatbot-panel" aria-label="SM Photography chat assistant">
          <header className="chatbot-header">
            <span className="chatbot-title-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none"><path d="M5 18.5 3.8 21l4.1-1.3a9 9 0 1 0-2.9-1.2Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><path d="M8 12h.01M12 12h.01M16 12h.01" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"/></svg>
            </span>
            <span className="chatbot-heading"><strong>{copy.assistant}</strong><small>{copy.subtitle}</small></span>
            <button className="chatbot-close" type="button" onClick={() => setIsOpen(false)} aria-label={copy.close} title={copy.close}>
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
            </button>
          </header>

          <div className="chatbot-language-row">
            <label htmlFor="site-chatbot-language" className="chatbot-language-label">{copy.languageLabel}</label>
            <select id="site-chatbot-language" className="chatbot-language-select" value={language} onChange={(event) => setLanguage(event.target.value as ChatLanguage)}>
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
              <option value="mr">मराठी</option>
            </select>
          </div>

          <div ref={messagesRef} className="chatbot-messages" aria-live="polite" aria-relevant="additions text">
            {messages.map((message) => (
              <article key={message.id} className={`chatbot-message chatbot-message-${message.role}`}>
                <p>{message.text}</p>
                {message.links?.length ? (
                  <div className="chatbot-reply-links">
                    {message.links.map((link) => {
                      const isExternal = link.href.startsWith('http') || link.href.startsWith('tel:');
                      return <a key={`${link.label}-${link.href}`} href={link.href} target={isExternal && link.href.startsWith('http') ? '_blank' : undefined} rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}>{link.label}</a>;
                    })}
                  </div>
                ) : null}
              </article>
            ))}
            {isTyping ? (
              <div className="chatbot-message chatbot-message-assistant chatbot-typing" role="status" aria-label={copy.typingLabel}>
                <span /><span /><span />
              </div>
            ) : null}
          </div>

          <div className="chatbot-prompts" aria-label={copy.suggestions}>
            <button type="button" onClick={() => sendMessage(copy.packagesPrompt, 'packages')}>{copy.packagesPrompt}</button>
            <button type="button" onClick={() => sendMessage(copy.offersPrompt, 'offers')}>{copy.offersPrompt}</button>
            <button type="button" onClick={() => sendMessage(copy.locationsPrompt)}>{copy.locationsPrompt}</button>
            <button type="button" onClick={() => sendMessage(copy.experiencePrompt, 'owner')}>{copy.experiencePrompt}</button>
            <button type="button" onClick={() => sendMessage(copy.servicesPrompt, 'services')}>{copy.servicesPrompt}</button>
            <button type="button" onClick={() => sendMessage(copy.contactPrompt, 'contact')}>{copy.contactPrompt}</button>
          </div>

          <form className="chatbot-compose" onSubmit={handleSubmit}>
            <label className="chatbot-sr-only" htmlFor="site-chatbot-message">{copy.inputLabel}</label>
            <input id="site-chatbot-message" ref={inputRef} className="chatbot-input" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={copy.ask} autoComplete="off" />
            <button type="submit" className="chatbot-send" aria-label={copy.send} title={copy.send} disabled={!draft.trim() || isTyping}>
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12 20 4l-5 16-3.2-6.8L4 12Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/><path d="m11.8 13.2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
            </button>
          </form>
        </section>
      ) : null}

      {!isOpen ? (
        <button className="chatbot-launcher" type="button" onClick={() => setIsOpen(true)} aria-label="Open chat assistant" aria-expanded="false" title="Chat with SM Photography">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 18.5 3.8 21l4.1-1.3a9 9 0 1 0-2.9-1.2Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><path d="M8 12h.01M12 12h.01M16 12h.01" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"/></svg>
        </button>
      ) : null}
    </div>
  );
}
