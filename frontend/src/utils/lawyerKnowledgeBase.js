/**
 * lawyerKnowledgeBase.js
 * Builds an in-memory knowledge graph from the fetched lawyer list.
 * Used by FindLawyerAI to:
 *  - Answer name-based queries ("who is Sarthak?" / "find lawyer named Singh")
 *  - Answer platform-awareness queries ("how many lawyers?", "which cities?")
 *  - Generate real-time suggestive chips as the user types
 */

// ── Build KB from merged lawyer array ─────────────────────────────────────────
export function buildKnowledgeBase(lawyers) {
  const nameIndex    = {};   // lowercase last/first/full → lawyer obj(s)
  const specStats    = {};   // spec → { count, cities: Set, minFee, maxFee, langs: Set }
  const cityStats    = {};   // city → { count, specs: Set }
  const langStats    = {};   // language → count
  const feeRange     = { min: Infinity, max: 0 };
  let   totalCount   = 0;

  lawyers.forEach(l => {
    totalCount++;

    // ── Name index ────────────────────────────────────────────────────────────
    const fullName = (l.name || l.full_name || '').trim();
    if (fullName) {
      const parts = fullName.toLowerCase().split(/\s+/);
      // Index by each name part AND by full name
      const keys  = [...new Set([...parts, fullName.toLowerCase()])];
      keys.forEach(key => {
        if (!nameIndex[key]) nameIndex[key] = [];
        nameIndex[key].push(l);
      });
    }

    // ── Specialization stats ──────────────────────────────────────────────────
    const spec = (l.specialization || '').trim();
    if (spec) {
      if (!specStats[spec]) specStats[spec] = { count: 0, cities: new Set(), minFee: Infinity, maxFee: 0, langs: new Set() };
      specStats[spec].count++;
      if (l.city)  specStats[spec].cities.add(l.city);
      if (l.state) specStats[spec].cities.add(l.state);
      const fee = l.feeMin || l.consultation_fee || 0;
      if (fee > 0) {
        specStats[spec].minFee = Math.min(specStats[spec].minFee, fee);
        specStats[spec].maxFee = Math.max(specStats[spec].maxFee, fee);
        feeRange.min = Math.min(feeRange.min, fee);
        feeRange.max = Math.max(feeRange.max, fee);
      }
      (l.languages || ['English']).forEach(lang => specStats[spec].langs.add(lang));
    }

    // ── City stats ────────────────────────────────────────────────────────────
    const city = (l.city || l.state || '').trim();
    if (city) {
      if (!cityStats[city]) cityStats[city] = { count: 0, specs: new Set() };
      cityStats[city].count++;
      if (spec) cityStats[city].specs.add(spec);
    }

    // ── Language stats ────────────────────────────────────────────────────────
    (l.languages || ['English']).forEach(lang => {
      langStats[lang] = (langStats[lang] || 0) + 1;
    });
  });

  return { nameIndex, specStats, cityStats, langStats, feeRange, totalCount };
}

// ── Name-based lookup ─────────────────────────────────────────────────────────
/**
 * Given raw user message, try to extract a person name and find them in the KB.
 * Returns: { found: bool, results: [], extractedName: '' }
 */
export function lookupByName(kb, message) {
  const msg = message.toLowerCase();

  // ── Early bail-out: if the query has clear SEARCH intent, skip name lookup ──
  const searchIntentKeywords = [
    'need', 'want', 'looking', 'help me', 'please', 'can you',
    'criminal', 'property', 'divorce', 'family', 'corporate', 'cyber', 'labour', 'tax',
    'experience', 'years', 'more than', 'lawyer in', 'advocate in',
    'best', 'good', 'recommend', 'suggest', 'urgent', 'asap', 'experienced',
    'case', 'court', 'fir', 'bail', 'fraud', 'dispute', 'legal help',
  ];
  if (searchIntentKeywords.some(kw => msg.includes(kw))) {
    return { found: false, results: [], extractedName: '' };
  }

  // Strict name patterns — explicit "who is X", "qualification of X", etc.
  const patterns = [
    /(?:who is|about|show me|lawyer named|advocate named|find a lawyer called|details of|detail of|qualification of|qualifications of)(?: a| an| lawyer| advocate| vakeel)? ([a-z][a-z\s]{1,30}?)(?:\?|$| in | at | for | from )/i,
    /(?:named|called|known as) ([a-z][a-z\s]{1,25}?)(?:\?|$| in | at )/i,
    /lawyer ([a-z][a-z\s]{2,20}?)\b/i,
    /(?:detail|details|profile|education|experience|fee|fees) (?:of|for) ([a-z][a-z\s]{1,30}?)(?:\?|$)/i,
  ];

  for (const pattern of patterns) {
    const m = msg.match(pattern);
    if (!m) continue;
    const extracted = m[1].trim().replace(/\s+/g, ' ');
    if (extracted.length < 2) continue;

    // Reject if extracted text contains legal/action words
    const legalWords = ['criminal', 'property', 'family', 'divorce', 'lawyer', 'advocate', 'need', 'help', 'case', 'legal', 'court', 'experience', 'years'];
    if (legalWords.some(w => extracted.includes(w))) continue;

    // Try full name first
    if (kb.nameIndex[extracted]) {
      return { found: true, results: kb.nameIndex[extracted], extractedName: extracted };
    }
    // Try each word in extracted
    const words = extracted.split(' ');
    for (const word of words) {
      if (word.length > 2 && kb.nameIndex[word]) {
        return { found: true, results: kb.nameIndex[word], extractedName: word };
      }
    }
    // Not found but we DID extract a name — only surface if looks like a proper noun (initial cap)
    if (/^[A-Z]/.test(m[1])) {
      return { found: false, results: [], extractedName: extracted };
    }
  }

  return { found: false, results: [], extractedName: '' };
}

// ── Platform-awareness query detection ───────────────────────────────────────
/**
 * Returns a response (string) if the user is asking about the platform itself,
 * or null if it's something else.
 */
export function getPlatformAwarenessResponse(kb, message) {
  const msg = message.toLowerCase();
  const { totalCount, specStats, cityStats, langStats, feeRange } = kb;

  // How many lawyers
  if (/how many lawyers|total lawyers|number of lawyers|lawyers do you have|lawyers available/.test(msg)) {
    const specs = Object.keys(specStats).slice(0, 6).join(', ');
    return `🧑‍⚖️ We currently have **${totalCount} verified lawyers** across Delhi, Haryana, and Uttar Pradesh.\n\n📋 **Specializations available:** ${specs || 'Criminal, Property, Family, Corporate, Labour, Cyber'}\n\n🏙️ **Cities covered:** ${Object.keys(cityStats).slice(0, 8).join(', ') || 'Delhi, Noida, Gurgaon, Faridabad'}\n\nTell me your legal issue and city to find the right match!`;
  }

  // Which cities
  if (/which cities|what cities|cities covered|cities available|your locations|where are you available|areas covered/.test(msg)) {
    const cities = Object.entries(cityStats).sort((a, b) => b[1].count - a[1].count).slice(0, 10).map(([c, s]) => `${c} (${s.count})`).join(', ');
    return `📍 **Cities we cover:**\n\n${cities || 'Delhi, Noida, Gurgaon, Faridabad, Lucknow, Agra, Meerut, Chandigarh'}\n\nWe're expanding daily! Which city are you in?`;
  }

  // Which specializations / what types of lawyers
  if (/what specializ|which specializ|what types of lawyer|kind of lawyer|what lawyers do you have|areas of law|practice areas/.test(msg)) {
    const specs = Object.entries(specStats).sort((a, b) => b[1].count - a[1].count).map(([s, d]) => `• ${s} (${d.count} lawyers)`).join('\n');
    return `⚖️ **Specializations on Lxwyer Up:**\n\n${specs || '• Criminal Law\n• Property Law\n• Family Law\n• Corporate Law\n• Labour Law\n• Consumer Law\n• Cyber Law\n• Tax Law'}\n\nWhich specialization do you need?`;
  }

  // Show [spec] lawyers
  const showSpecMatch = msg.match(/show (?:me )?(?:all )?([a-z\s]+?) lawyers?/);
  if (showSpecMatch) {
    const specQuery = showSpecMatch[1].trim();
    const found = Object.keys(specStats).find(s => s.toLowerCase().includes(specQuery));
    if (found) {
      const stat = specStats[found];
      const cities = [...stat.cities].slice(0, 5).join(', ');
      return `Found **${stat.count} ${found} lawyers** in our database.\n\n📍 Available in: ${cities || 'Delhi, UP, Haryana'}\n\nWhich city are you in? I'll find the best match!`;
    }
  }

  // Fees / cost overview
  if (/fee range|cost of lawyer|lawyer cost|how much do lawyers charge|consultation cost|price/.test(msg) && !/specific|particular/.test(msg)) {
    const minFee = feeRange.min === Infinity ? 500 : feeRange.min;
    const maxFee = feeRange.max === 0 ? 10000 : feeRange.max;
    return `💰 **Lawyer Fees on Lxwyer Up:**\n\n• Consultation range: ₹${minFee.toLocaleString()} – ₹${maxFee.toLocaleString()}\n• Average for criminal cases: ₹3,000–₹15,000\n• Average for property/family: ₹2,000–₹10,000\n• Average for corporate/IP: ₹5,000–₹25,000+\n\nTell me your case and city — I'll show exact fees for each lawyer!`;
  }

  // Language availability
  if (/which language|what language|hindi lawyer|english lawyer|language option/.test(msg)) {
    const langs = Object.entries(langStats).sort((a, b) => b[1] - a[1]).map(([l, c]) => `${l} (${c})`).join(', ');
    return `🗣️ **Languages spoken by our lawyers:**\n\n${langs || 'Hindi, English'}\n\nWant a lawyer who speaks a specific language? Just mention it in your query!`;
  }

  return null;
}

// ── Real-time suggestive chips from partial input ─────────────────────────────
/**
 * Given partial user input (as they type), returns up to 4 smart suggestion chips
 * sourced from the live KB.
 */
export function getSuggestiveChips(kb, partialInput, memoryState = {}) {
  const input = partialInput.toLowerCase().trim();
  if (input.length < 3) return [];

  const chips = [];
  const { specStats, cityStats } = kb;

  // Find matching specializations from what they've typed
  const matchingSpecs = Object.keys(specStats).filter(spec =>
    spec.toLowerCase().includes(input.replace(/ lawyer.*/, '').trim())
  );

  // Find matching cities
  const matchingCities = Object.keys(cityStats).filter(city =>
    city.toLowerCase().includes(input)
  );

  if (matchingSpecs.length > 0 && memoryState.location) {
    const city = memoryState.location.city || memoryState.location.state;
    matchingSpecs.slice(0, 2).forEach(spec => {
      const stat = specStats[spec];
      chips.push(`${spec} lawyer in ${city}`);
    });
  } else if (matchingSpecs.length > 0) {
    matchingSpecs.slice(0, 2).forEach(spec => {
      const stat = specStats[spec];
      const topCity = [...(stat.cities || [])][0] || 'Delhi';
      chips.push(`${spec} in ${topCity} (${stat.count} available)`);
    });
  }

  if (matchingCities.length > 0 && memoryState.caseType) {
    matchingCities.slice(0, 2).forEach(city => {
      chips.push(`${memoryState.caseType} lawyer in ${city}`);
    });
  }

  // Generic completions based on common patterns
  if (chips.length === 0) {
    if (/bail|arrest|police|criminal|murder|theft/.test(input)) {
      chips.push('Criminal lawyer in Delhi', 'Criminal lawyer in Noida', 'Criminal lawyer in Gurgaon');
    } else if (/property|land|flat|rent|tenant|evict/.test(input)) {
      chips.push('Property lawyer Delhi', 'Tenant rights help', 'Land dispute Noida');
    } else if (/divorce|family|custody|maintenance|alimony/.test(input)) {
      chips.push('Divorce lawyer Delhi', 'Child custody help', 'Family court Gurgaon');
    } else if (/fraud|cyber|upi|online|hack/.test(input)) {
      chips.push('Cyber crime lawyer Delhi', 'UPI fraud complaint', 'Online fraud help');
    } else if (/tax|gst|income/.test(input)) {
      chips.push('Tax lawyer Delhi', 'GST dispute help', 'Income tax notice');
    } else if (/labour|employee|salary|termination|fired/.test(input)) {
      chips.push('Labour lawyer Delhi', 'Wrongful termination', 'Salary dispute');
    }
  }

  return chips.slice(0, 4);
}
