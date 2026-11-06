// Full UI string dictionary — EN / Hindi / Telugu / Urdu.
// Every visible label goes through t() so language switching is global, not just the recommendations card.

export type Lang = 'en' | 'hi' | 'te' | 'ur';

export const LANGS: { id: Lang; label: string; short: string }[] = [
  { id: 'en', label: 'English', short: 'EN' },
  { id: 'hi', label: 'हिन्दी', short: 'HI' },
  { id: 'te', label: 'తెలుగు', short: 'TE' },
  { id: 'ur', label: 'اردو', short: 'UR' },
];

type Dict = Record<string, string>;

const en: Dict = {
  // header / nav
  'nav.overview': 'Overview', 'nav.gis': 'Thermal GIS', 'nav.vuln': 'Vulnerability Model',
  'nav.shelters': 'Cool Shelters', 'nav.outlook': '7-Day Outlook',
  'header.solar': 'SOLAR ACTIVE', 'header.critical': 'CRITICAL', 'header.advisory': 'LIVE HEAT ADVISORY',
  'header.profile': 'Demo User', 'header.profileSub': 'Citizen profile (demo mode)',
  'header.editProfile': 'Edit vulnerability profile', 'header.muni': 'Municipality dashboard', 'header.employer': 'Employer dashboard',
  // hero
  'hero.kicker': 'SIMULATED TELEMETRY · NOT LIVE OBSERVATIONS',
  'hero.title1': 'HEAT', 'hero.title2': 'INTELLIGENCE ///',
  'hero.desc': 'Calculate real-time personal heat-risk index by combining high-resolution satellite thermal radiometry, outdoor physiological vulnerability, and Hyderabad micro-climate wet-bulb saturation.',
  'hero.core': 'Hyderabad Core', 'hero.feels': 'Feels Like', 'hero.uhi': 'UHI Anomaly', 'hero.wind': 'Wind',
  'hero.cta1': 'CHECK PERSONAL RISK', 'hero.cta2': 'EXPLORE 3D SATELLITE TWIN',
  'hero.live': 'LIVE · OPEN-METEO', 'hero.demo': 'DEMO DATA · OPEN-METEO UNAVAILABLE OR OFFLINE', 'hero.connecting': 'CONNECTING TO OPEN-METEO…',
  // metric cards
  'm.heatIndex': 'Heat Index Saturation', 'm.risk': 'Personal Risk Score', 'm.solar': 'Solar Load', 'm.wetbulb': 'Wet-Bulb Barrier',
  'm.feels': 'Feels-like', 'm.history': 'Above seasonal avg (demo)', 'm.hazard': 'Hazard', 'm.exposure': 'Exposure', 'm.vuln': 'Vulnerability',
  'm.radiation': 'Radiation', 'm.attenuation': 'Cloud attenuation', 'm.humidity': 'Humidity',
  'm.sweat': 'Sweating', 'm.sweatBad': 'Severely impaired', 'm.sweatOk': 'Reduced',
  'm.breakdown': 'Explainable breakdown →',
  // cloud matrix
  'c.title': 'CLOUD MATRIX — LIVE SKY', 'c.kicker': 'ATMOSPHERE', 'c.auto': '● AUTO (LIVE)', 'c.manual': '○ MANUAL',
  'c.cover': 'Cloud Cover', 'c.atten': 'Solar Attenuation', 'c.windDrift': 'Wind Drift', 'c.turb': 'Turbulence',
  'c.sim': 'SIMULATION', 'c.live': 'LIVE',
  // location
  'loc.title': 'SWITCH LOCATION', 'loc.kicker': 'LOCATION', 'loc.use': 'USE MY LOCATION', 'loc.locating': 'LOCATING…',
  'loc.track': 'LIVE TRACKING', 'loc.tracking': 'TRACKING ● LIVE', 'loc.denied': 'Permission denied',
  'loc.privacy': 'Location is opt-in. Coordinates stay in your browser and are only sent to Open-Meteo (HTTPS) to fetch weather at that point. Nothing is stored on a server.',
  'loc.clear': 'Clear', 'loc.nearest': 'Nearest zone',
  // zones / profile
  'z.title': 'Select a monitoring zone', 'z.kicker': 'MONITORING ZONES',
  'p.title': 'Active vulnerability profile', 'p.kicker': 'YOUR PROFILE', 'p.edit': 'Edit profile →',
  // radar
  'r.title': 'THERMAL RADAR', 'r.live': 'LIVE SKY ACTIVE', 'r.demo': 'TELEMETRY ACTIVE',
  // live readings
  'live.title': 'OPEN-METEO LIVE READINGS', 'live.kicker': 'LIVE CONDITIONS',
  'live.condition': 'Condition', 'live.cloud': 'Cloud cover', 'live.pressure': 'Pressure', 'live.winddir': 'Wind dir',
  'live.precip': 'Precip (1h)', 'live.uv': 'UV now', 'live.updated': 'Updated', 'live.source': 'Source', 'live.liveTag': 'LIVE',
  // footer
  'foot.brand': 'SPEEDX — Hyderabad Urban Heat Observatory', 'foot.tag': 'Next Generation Climate Intelligence · Hackathon demo build',
  'foot.note': 'All environmental values labelled DEMO are synthetic illustrations, not real-time observations. Heat-risk scores are a transparent demo model, not clinical advice. In emergency call 108.',
  // recommendations (safety-critical)
  'rec.hydrate': 'Hydrate 500ml/hour; ORS in extreme heat', 'rec.reschedule': 'Reschedule outdoor work to 05:00–10:00 & after 17:00',
  'rec.rest': 'Enforce 20-min shaded rest every hour', 'rec.emergency': 'Heat stroke signs → call 108 immediately', 'rec.saferWindow': 'Safer window: before 10:30 AM',
  'rec.title': 'AI SAFETY RECOMMENDATIONS', 'rec.kicker': 'SAFETY GUIDANCE',
  // risk tiers
  'tier.LOW': 'LOW', 'tier.MODERATE': 'MODERATE', 'tier.HIGH': 'HIGH', 'tier.SEVERE': 'SEVERE', 'tier.EXTREME': 'EXTREME',
  // a11y
  'a11y.title': 'Accessibility', 'a11y.language': 'Language', 'a11y.voice': 'Voice output',
  'a11y.highContrast': 'High contrast', 'a11y.largeText': 'Large text', 'a11y.reduceMotion': 'Reduce motion',
  'a11y.focus': 'Focus rings', 'a11y.motionOff': 'Animations off', 'a11y.motionOn': 'Animations on',
  'a11y.speak': 'Read aloud', 'a11y.close': 'Close settings',
};

const hi: Dict = {
  'nav.overview': 'अवलोकन', 'nav.gis': 'थर्मल GIS', 'nav.vuln': 'भेद्यता मॉडल', 'nav.shelters': 'शीत आश्रय', 'nav.outlook': '7-दिन पूर्वानुमान',
  'header.solar': 'सौर सक्रिय', 'header.critical': 'गंभीर', 'header.advisory': 'लाइव हीट एडवाइजरी', 'header.profile': 'डेमो उपयोगकर्ता', 'header.profileSub': 'नागरिक प्रोफाइल (डेमो मोड)',
  'header.editProfile': 'भेद्यता प्रोफाइल संपादित करें', 'header.muni': 'नगरपालिका डैशबोर्ड', 'header.employer': 'नियोक्ता डैशबोर्ड',
  'hero.kicker': 'सिमुलेटेड डेटा · वास्तविक अवलोकन नहीं', 'hero.title1': 'हीट', 'hero.title2': 'इंटेलिजेंस ///',
  'hero.desc': 'उपग्रह थर्मल रेडियोमेट्री, बाहरी शारीरिक भेद्यता और हैदराबाद सूक्ष्म-जलवायु गीले बल्ब संतृप्ति को मिलाकर वास्तविक समय व्यक्तिगत हीट-जोखिम सूचकांक निकालें।',
  'hero.core': 'हैदराबाद केंद्र', 'hero.feels': 'महसूस होता है', 'hero.uhi': 'UHI विसंगति', 'hero.wind': 'हवा',
  'hero.cta1': 'व्यक्तिगत जोखिम जांचें', 'hero.cta2': '3D उपग्रह जुड़वां देखें',
  'hero.live': 'लाइव · ओपन-मेटियो', 'hero.demo': 'डेमो डेटा · ओपन-मेटियो अनुपलब्ध', 'hero.connecting': 'ओपन-मेटियो से जुड़ रहे हैं…',
  'm.heatIndex': 'हीट सूचकांक संतृप्ति', 'm.risk': 'व्यक्तिगत जोखिम स्कोर', 'm.solar': 'सौर भार', 'm.wetbulb': 'गीला बल्ब अवरोध',
  'm.feels': 'महसूस होता है', 'm.history': 'मौसमी औसत से ऊपर (डेमो)', 'm.hazard': 'खतरा', 'm.exposure': 'एक्सपोज़र', 'm.vuln': 'भेद्यता',
  'm.radiation': 'विकिरण', 'm.attenuation': 'बादल क्षीणन', 'm.humidity': 'नमी', 'm.sweat': 'पसीना', 'm.sweatBad': 'गंभीर रूप से बाधित', 'm.sweatOk': 'कम हुआ',
  'm.breakdown': 'व्याख्या योग्य विवरण →',
  'c.title': 'बादल मैट्रिक्स — लाइव स्काई', 'c.kicker': 'वायुमंडल', 'c.auto': '● ऑटो (लाइव)', 'c.manual': '○ मैनुअल',
  'c.cover': 'बादल आवरण', 'c.atten': 'सौर क्षीणन', 'c.windDrift': 'हवा बहाव', 'c.turb': 'अशांति',
  'c.sim': 'सिमुलेशन', 'c.live': 'लाइव',
  'loc.title': 'स्थान बदलें', 'loc.kicker': 'स्थान', 'loc.use': 'मेरा स्थान उपयोग करें', 'loc.locating': 'खोज रहे हैं…',
  'loc.track': 'लाइव ट्रैकिंग', 'loc.tracking': 'ट्रैकिंग ● लाइव', 'loc.denied': 'अनुमति अस्वीकार', 'loc.privacy': 'स्थान वैकल्पिक है। निर्देशांक आपके ब्राउज़र में ही रहते हैं और केवल मौसम के लिए Open-Meteo को भेजे जाते हैं। सर्वर पर कुछ संग्रहित नहीं होता।',
  'loc.clear': 'साफ़ करें', 'loc.nearest': 'निकटतम क्षेत्र',
  'z.title': 'निगरानी क्षेत्र चुनें', 'z.kicker': 'निगरानी क्षेत्र',
  'p.title': 'सक्रिय भेद्यता प्रोफाइल', 'p.kicker': 'आपकी प्रोफाइल', 'p.edit': 'प्रोफाइल संपादित करें →',
  'r.title': 'थर्मल रडार', 'r.live': 'लाइव स्काई सक्रिय', 'r.demo': 'टेलीमेट्री सक्रिय',
  'live.title': 'ओपन-मेटियो लाइव रीडिंग', 'live.kicker': 'लाइव स्थितियां',
  'live.condition': 'स्थिति', 'live.cloud': 'बादल आवरण', 'live.pressure': 'दाब', 'live.winddir': 'हवा दिशा', 'live.precip': 'वर्षा (1घं)', 'live.uv': 'UV अभी', 'live.updated': 'अपडेट', 'live.source': 'स्रोत', 'live.liveTag': 'लाइव',
  'foot.brand': 'SPEEDX — हैदराबाद अर्बन हीट ऑब्जर्वेटरी', 'foot.tag': 'अगली पीढ़ी जलवायु इंटेलिजेंस · हैकाथॉन डेमो',
  'foot.note': 'DEMO लेबल वाले सभी पर्यावरण मान सिंथेटिक उदाहरण हैं, वास्तविक अवलोकन नहीं। हीट-जोखिम स्कोर पारदर्शी डेमो मॉडल है, चिकित्सा सलाह नहीं। आपातकाल में 108 पर कॉल करें।',
  'rec.hydrate': 'हर घंटे 500 मि.ली. पानी पिएं; अत्यधिक गर्मी में ORS लें', 'rec.reschedule': 'बाहरी कार्य सुबह 5–10 बजे और शाम 5 बजे के बाद करें',
  'rec.rest': 'हर घंटे 20 मिनट छांव में आराम करें', 'rec.emergency': 'लू लगने के लक्षण → तुरंत 108 पर कॉल करें', 'rec.saferWindow': 'सुरक्षित समय: सुबह 10:30 बजे से पहले',
  'rec.title': 'AI सुरक्षा सिफारिशें', 'rec.kicker': 'सुरक्षा मार्गदर्शन',
  'tier.LOW': 'कम', 'tier.MODERATE': 'मध्यम', 'tier.HIGH': 'उच्च', 'tier.SEVERE': 'गंभीर', 'tier.EXTREME': 'चरम',
  'a11y.title': 'एक्सेसिबिलिटी', 'a11y.language': 'भाषा', 'a11y.voice': 'वॉयस आउटपुट',
  'a11y.highContrast': 'उच्च कंट्रास्ट', 'a11y.largeText': 'बड़ा अक्षर', 'a11y.reduceMotion': 'मोशन कम करें',
  'a11y.focus': 'फ़ोकस रिंग', 'a11y.motionOff': 'एनिमेशन बंद', 'a11y.motionOn': 'एनिमेशन चालू',
  'a11y.speak': 'सुनें', 'a11y.close': 'सेटिंग बंद करें',
};

const te: Dict = {
  'nav.overview': 'అవలోకనం', 'nav.gis': 'థర్మల్ GIS', 'nav.vuln': 'బలహీనత మోడల్', 'nav.shelters': 'చల్లని ఆశ్రయాలు', 'nav.outlook': '7-రోజుల అంచనా',
  'header.solar': 'సౌర చురుకుగా', 'header.critical': 'క్లిష్టం', 'header.advisory': 'లైవ్ హీట్ అడ్వైజరీ', 'header.profile': 'డెమో వినియోగదారు', 'header.profileSub': 'పౌర ప్రొఫైల్ (డెమో మోడ్)',
  'header.editProfile': 'బలహీనత ప్రొఫైల్ సవరించండి', 'header.muni': 'మున్సిపల్ డాష్‌బోర్డు', 'header.employer': 'యజమాని డాష్‌బోర్డు',
  'hero.kicker': 'అనుకరణ డేటా · వాస్తవ పరిశీలనలు కాదు', 'hero.title1': 'హీట్', 'hero.title2': 'ఇంటెలిజెన్స్ ///',
  'hero.desc': 'ఉపగ్రహ థర్మల్ రేడియోమెట్రీ, బాహ్య శారీరక బలహీనత మరియు హైదరాబాద్ మైక్రో-క్లైమేట్ వెట్-బల్బ్ సంతృప్తిని కలిపి వాస్తవ-సమయ వ్యక్తిగత హీట్-రిస్క్ సూచికను లెక్కించండి.',
  'hero.core': 'హైదరాబాద్ కేంద్రం', 'hero.feels': 'అనిపించే', 'hero.uhi': 'UHI వైరుధ్యం', 'hero.wind': 'గాలి',
  'hero.cta1': 'వ్యక్తిగత రిస్క్ తనిఖీ', 'hero.cta2': '3D ఉపగ్రహ జంట చూడండి',
  'hero.live': 'లైవ్ · ఓపెన్-మెటియో', 'hero.demo': 'డెమో డేటా · ఓపెన్-మెటియో లేదు', 'hero.connecting': 'ఓపెన్-మెటియోకు కనెక్ట్ అవుతోంది…',
  'm.heatIndex': 'హీట్ ఇండెక్స్ సంతృప్తి', 'm.risk': 'వ్యక్తిగత రిస్క్ స్కోర్', 'm.solar': 'సౌర భారం', 'm.wetbulb': 'వెట్-బల్బ్ అవరోధం',
  'm.feels': 'అనిపించే', 'm.history': 'సీజనల్ సగటు కంటే ఎక్కువ (డెమో)', 'm.hazard': 'ప్రమాదం', 'm.exposure': 'ఎక్స్పోజర్', 'm.vuln': 'బలహీనత',
  'm.radiation': 'రేడియేషన్', 'm.attenuation': 'మేఘ క్షీణత', 'm.humidity': 'తేమ', 'm.sweat': 'చెమట', 'm.sweatBad': 'తీవ్రంగా డెబ్బతిన్నది', 'm.sweatOk': 'తగ్గింది',
  'm.breakdown': 'వివరణాత్మక వివరణ →',
  'c.title': 'క్లౌడ్ మ్యాట్రిక్స్ — లైవ్ స్కై', 'c.kicker': 'వాతావరణం', 'c.auto': '● ఆటో (లైవ్)', 'c.manual': '○ మాన్యువల్',
  'c.cover': 'మేఘ కవర్', 'c.atten': 'సౌర క్షీణత', 'c.windDrift': 'గాలి కొట్టుకుపోత', 'c.turb': 'అల్లకల్లోలం',
  'c.sim': 'అనుకరణ', 'c.live': 'లైవ్',
  'loc.title': 'స్థలం మార్చండి', 'loc.kicker': 'స్థలం', 'loc.use': 'నా స్థలాన్ని వాడండి', 'loc.locating': 'వెతుకుతోంది…',
  'loc.track': 'లైవ్ ట్రాకింగ్', 'loc.tracking': 'ట్రాకింగ్ ● లైవ్', 'loc.denied': 'అనుమతి నిరాకరించబడింది', 'loc.privacy': 'స్థలం ఐచ్ఛికం. కోఆర్డినేట్లు మీ బ్రౌజర్‌లోనే ఉంటాయి, వాతావరణం కోసం మాత్రమే Open-Meteoకు పంపబడతాయి. సర్వర్‌లో ఏమీ భద్రపరచబడదు.',
  'loc.clear': 'తొలగించి', 'loc.nearest': 'సమీప మండలం',
  'z.title': 'పర్యవేక్షణ మండలం ఎంచుకోండి', 'z.kicker': 'పర్యవేక్షణ మండలాలు',
  'p.title': 'చురుగ్గా ఉన్న బలహీనత ప్రొఫైల్', 'p.kicker': 'మీ ప్రొఫైల్', 'p.edit': 'ప్రొఫైల్ సవరించండి →',
  'r.title': 'థర్మల్ రాడార్', 'r.live': 'లైవ్ స్కై చురుకుగా', 'r.demo': 'టెలిమెట్రీ చురుకుగా',
  'live.title': 'ఓపెన్-మెటియో లైవ్ రీడింగ్స్', 'live.kicker': 'లైవ్ పరిస్థితులు',
  'live.condition': 'పరిస్థితి', 'live.cloud': 'మేఘ కవర్', 'live.pressure': 'పీడనం', 'live.winddir': 'గాలి దిశ', 'live.precip': 'వర్షం (1గం)', 'live.uv': 'UV ఇప్పుడు', 'live.updated': 'అప్‌డేట్', 'live.source': 'మూలం', 'live.liveTag': 'లైవ్',
  'foot.brand': 'SPEEDX — హైదరాబాద్ అర్బన్ హీట్ అబ్జర్వేటరీ', 'foot.tag': 'తదుపరి తరం వాతావరణ మేధస్సు · హాకథాన్ డెమో',
  'foot.note': 'DEMO లేబుల్ చేసిన అన్ని పర్యావరణ విలువలు సింథటిక్ ఉదాహరణలు, వాస్తవ పరిశీలనలు కాదు. హీట్-రిస్క్ స్కోర్లు పారదర్శక డెమో మోడల్, వైద్య సలహా కాదు. అత్యవసరంలో 108 కు కాల్ చేయండి.',
  'rec.hydrate': 'ప్రతి గంటకు 500ml నీరు తాగండి; తీవ్ర వేడిలో ORS వాడండి', 'rec.reschedule': 'బయటి పనిని ఉదయం 5–10 గంటల మధ్య మరియు సాయంత్రం 5 గంటల తర్వాత చేయండి',
  'rec.rest': 'ప్రతి గంటకు 20 నిమిషాలు నీడలో విశ్రమించండి', 'rec.emergency': 'వడగాల్పు లక్షణాలు → వెంటనే 108 కు కాల్ చేయండి', 'rec.saferWindow': 'సురక్షిత సమయం: ఉదయం 10:30 గంటలకు ముందు',
  'rec.title': 'AI భద్రతా సిఫార్సులు', 'rec.kicker': 'భద్రతా మార్గదర్శకం',
  'tier.LOW': 'తక్కువ', 'tier.MODERATE': 'మధ్యస్థం', 'tier.HIGH': 'ఎక్కువ', 'tier.SEVERE': 'తీవ్రం', 'tier.EXTREME': 'అత్యంత',
  'a11y.title': 'ప్రాప్తి', 'a11y.language': 'భాష', 'a11y.voice': 'వాయిస్ అవుట్‌పుట్',
  'a11y.highContrast': 'అధిక కాంట్రాస్ట్', 'a11y.largeText': 'పెద్ద అక్షరం', 'a11y.reduceMotion': 'మోషన్ తగ్గించండి',
  'a11y.focus': 'ఫోకస్ రింగ్', 'a11y.motionOff': 'యానిమేషన్ ఆఫ్', 'a11y.motionOn': 'యానిమేషన్ ఆన్',
  'a11y.speak': 'వినండి', 'a11y.close': 'సెట్టింగ్స్ మూసివేయి',
};

const ur: Dict = {
  'nav.overview': 'جائزہ', 'nav.gis': 'تھرمَل GIS', 'nav.vuln': 'نفسیاتی ماڈل', 'nav.shelters': 'ٹھنڈی پناہ گاہیں', 'nav.outlook': '7 روزہ پیش گوئی',
  'header.solar': 'سولر فعال', 'header.critical': 'اہم', 'header.advisory': 'براہ راست گرمی ایڈوائزری', 'header.profile': 'ڈیمو صارف', 'header.profileSub': 'شہری پروفائل (ڈیمو موڈ)',
  'header.editProfile': 'نفسیاتی پروفائل تبدیل کریں', 'header.muni': 'میونسپل ڈیش بورڈ', 'header.employer': 'آجر ڈیش بورڈ',
  'hero.kicker': 'نقلی ڈیٹا · اصل مشاہدات نہیں', 'hero.title1': 'گرمی', 'hero.title2': 'ذہانت ///',
  'hero.desc': 'سیٹلائٹ تھرمل ریڈیومیٹری، بیرونی جسمانی نفسیات اور حیدرآباد مائیکرو موسمی گیلی بلب سنترپتی کو جوڑ کر اصل وقت ذاتی گرمی خطرے کا اشاریہ نکالیں۔',
  'hero.core': 'حیدرآباد مرکز', 'hero.feels': 'محسوس ہوتا ہے', 'hero.uhi': 'UHI بے قاعدگی', 'hero.wind': 'ہوا',
  'hero.cta1': 'ذاتی خطرہ جانچیں', 'hero.cta2': '3D سیٹلائٹ جڑواں دیکھیں',
  'hero.live': 'براہ راست · اوپن میٹیو', 'hero.demo': 'ڈیمو ڈیٹا · اوپن میٹیو دستیاب نہیں', 'hero.connecting': 'اوپن میٹیو سے جڑ رہے ہیں…',
  'm.heatIndex': 'گرمی اشاریہ سنترپتی', 'm.risk': 'ذاتی خطرہ اسکور', 'm.solar': 'شمسی بوجھ', 'm.wetbulb': 'گیلی بلب رکاوٹ',
  'm.feels': 'محسوس ہوتا ہے', 'm.history': 'موسمی اوسط سے زیادہ (ڈیمو)', 'm.hazard': 'خطرہ', 'm.exposure': 'نمائش', 'm.vuln': 'نفسیات',
  'm.radiation': 'تابکاری', 'm.attenuation': 'بادل کمزوری', 'm.humidity': 'نمی', 'm.sweat': 'پسینہ', 'm.sweatBad': 'شدید متاثر', 'm.sweatOk': 'کم ہوا',
  'm.breakdown': 'وضاحتی تفصیل →',
  'c.title': 'بادل میٹرکس — براہ راست آسمان', 'c.kicker': 'فضا', 'c.auto': '● آٹو (براہ راست)', 'c.manual': '○ دستی',
  'c.cover': 'بادل احاطہ', 'c.atten': 'شمسی کمزوری', 'c.windDrift': 'ہوا بہاؤ', 'c.turb': 'ہلچل',
  'c.sim': 'نقلی', 'c.live': 'براہ راست',
  'loc.title': 'مقام تبدیل کریں', 'loc.kicker': 'مقام', 'loc.use': 'میرا مقام استعمال کریں', 'loc.locating': 'تلاش ہو رہی ہے…',
  'loc.track': 'براہ راست ٹریکنگ', 'loc.tracking': 'ٹریکنگ ● براہ راست', 'loc.denied': 'اجازت مسترد', 'loc.privacy': 'مقام اختیاری ہے۔ نقاط آپ کے براؤزر میں رہتے ہیں اور صرف موسم کے لیے Open-Meteo کو بھیجے جاتے ہیں۔ سرور پر کچھ محفوظ نہیں ہوتا۔',
  'loc.clear': 'صاف کریں', 'loc.nearest': 'قریبی زون',
  'z.title': 'نگرانی زون منتخب کریں', 'z.kicker': 'نگرانی زونز',
  'p.title': 'فعال نفسیاتی پروفائل', 'p.kicker': 'آپ کا پروفائل', 'p.edit': 'پروفائل تبدیل کریں →',
  'r.title': 'تھرمَل ریڈار', 'r.live': 'براہ راست آسمان فعال', 'r.demo': 'ٹیلی میٹری فعال',
  'live.title': 'اوپن میٹیو براہ راست ریڈنگز', 'live.kicker': 'براہ راست حالات',
  'live.condition': 'حالت', 'live.cloud': 'بادل احاطہ', 'live.pressure': 'دباؤ', 'live.winddir': 'ہوا رخ', 'live.precip': 'بارش (1گھنٹہ)', 'live.uv': 'UV ابھی', 'live.updated': 'اپڈیٹ', 'live.source': 'ماخذ', 'live.liveTag': 'براہ راست',
  'foot.brand': 'SPEEDX — حیدرآباد اربن ہیٹ آبزرویٹری', 'foot.tag': 'اگلی نسل موسمی ذہانت · ہیکاتھان ڈیمو',
  'foot.note': 'DEMO لیبل والے تمام ماحولیاتی اقدار نمونہ ہیں، اصل مشاہدات نہیں۔ گرمی خطرہ اسکور شفاف ڈیمو ماڈل ہے، طبی مشورہ نہیں۔ ایمرجنسی میں 108 پر کال کریں۔',
  'rec.hydrate': 'ہر گھنٹے 500 ملی لیٹر پانی پئیں؛ شدید گرمی میں ORS لیں', 'rec.reschedule': 'بیرونی کام صبح 5–10 بجے اور شام 5 بجے کے بعد کریں',
  'rec.rest': 'ہر گھنٹے 20 منٹ سائے میں آرام کریں', 'rec.emergency': 'گرمی لگنے کی علامات → فوری 108 پر کال کریں', 'rec.saferWindow': 'محفوظ وقت: صبح 10:30 بجے سے پہلے',
  'rec.title': 'AI حفاظتی تجاویز', 'rec.kicker': 'حفاظتی رہنمائی',
  'tier.LOW': 'کم', 'tier.MODERATE': 'درمیانہ', 'tier.HIGH': 'زیادہ', 'tier.SEVERE': 'شدید', 'tier.EXTREME': 'انتہائی',
  'a11y.title': 'رسائی', 'a11y.language': 'زبان', 'a11y.voice': 'آواز آؤٹ پٹ',
  'a11y.highContrast': 'زیادہ تضاد', 'a11y.largeText': 'بڑا متن', 'a11y.reduceMotion': 'حرکت کم کریں',
  'a11y.focus': 'فوکس رنگ', 'a11y.motionOff': 'اینیمیشن بند', 'a11y.motionOn': 'اینیمیشن چالو',
  'a11y.speak': 'سنیں', 'a11y.close': 'ترتیبات بند کریں',
};

export const DICTS: Record<Lang, Dict> = { en, hi, te, ur };
export const STRINGS = DICTS; // legacy export

export function t(lang: Lang, key: string): string {
  return DICTS[lang]?.[key] ?? en[key] ?? key;
}
