/**
 * CampusFind - Client-Side Store & AWS Matching Engine Simulator
 * Powers full functionality on GitHub Pages, offline environments, and static hosts.
 */

const SEED_ITEMS = [
  {
    id: "item-seed-1",
    title: "MacBook Air 13-inch (Space Gray)",
    type: "lost",
    category: "Electronics",
    location: "Science Library 3rd Floor Stacks",
    dateTime: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    description: "Left my laptop in a study carrel. Has a GitHub and NASA sticker on the lid. Very important for my senior thesis!",
    photoUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80",
    ai_tags: ["Laptop", "Computer", "Electronics", "Keyboard", "Space Gray", "Screen"],
    detected_labels: [
      { name: "Laptop", confidence: 98.6 },
      { name: "Computer", confidence: 97.2 },
      { name: "Electronics", confidence: 95.8 },
      { name: "Keyboard", confidence: 91.4 }
    ],
    status: "open",
    contactInfo: "alex.student@campus.edu",
    userId: "usr-alex-001",
    userEmail: "alex.student@campus.edu",
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString()
  },
  {
    id: "item-seed-2",
    title: "Apple Laptop with Tech Stickers",
    type: "found",
    category: "Electronics",
    location: "Main Campus Library Circulation Desk",
    dateTime: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    description: "Found a dark gray laptop on a desk in the upper study level. Handed over to library staff at desk 2.",
    photoUrl: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600&auto=format&fit=crop&q=80",
    ai_tags: ["Laptop", "Computer", "Electronics", "Space Gray", "Personal Computer"],
    detected_labels: [
      { name: "Laptop", confidence: 99.1 },
      { name: "Computer", confidence: 98.0 },
      { name: "Electronics", confidence: 96.5 }
    ],
    status: "open",
    contactInfo: "library-lostfound@campus.edu",
    userId: "usr-staff-002",
    userEmail: "library-staff@campus.edu",
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
  },
  {
    id: "item-seed-3",
    title: "Navy Blue Fjällräven Kånken Backpack",
    type: "lost",
    category: "Bags & Backpacks",
    location: "Student Union Dining Commons",
    dateTime: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    description: "Left on a chair near the pizza counter during lunchtime. Has my calculus textbook and student ID card inside.",
    photoUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80",
    ai_tags: ["Backpack", "Bag", "Blue", "Luggage", "Canvas", "Strap"],
    detected_labels: [
      { name: "Backpack", confidence: 99.4 },
      { name: "Bag", confidence: 98.7 },
      { name: "Blue", confidence: 92.1 }
    ],
    status: "open",
    contactInfo: "sarah.chen@campus.edu",
    userId: "usr-sarah-003",
    userEmail: "sarah.chen@campus.edu",
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
  },
  {
    id: "item-seed-4",
    title: "Blue Canvas Daypack Found in Dining Hall",
    type: "found",
    category: "Bags & Backpacks",
    location: "Student Center Information Desk",
    dateTime: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
    description: "Dark blue backpack found near food court tables. Safe at Campus Security lost & found bin #4.",
    photoUrl: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=600&auto=format&fit=crop&q=80",
    ai_tags: ["Backpack", "Bag", "Blue", "Canvas", "Pocket"],
    detected_labels: [
      { name: "Backpack", confidence: 97.9 },
      { name: "Bag", confidence: 96.4 },
      { name: "Blue", confidence: 90.5 }
    ],
    status: "open",
    contactInfo: "student-center@campus.edu",
    userId: "usr-staff-004",
    userEmail: "sc-info@campus.edu",
    createdAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString()
  },
  {
    id: "item-seed-5",
    title: "Subaru Car Key with Red Lanyard & Gym Tag",
    type: "found",
    category: "Keys",
    location: "Athletic Center / Rec Gym Locker Room",
    dateTime: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    description: "Set of keys with black key fob and crimson woven lanyard found on bench in men's locker room.",
    photoUrl: "https://images.unsplash.com/photo-1582139329536-e7284fece509?w=600&auto=format&fit=crop&q=80",
    ai_tags: ["Keys", "Keyring", "Metal", "Car Key", "Accessory", "Lanyard"],
    detected_labels: [
      { name: "Keys", confidence: 99.2 },
      { name: "Keyring", confidence: 96.0 },
      { name: "Car Key", confidence: 94.3 }
    ],
    status: "open",
    contactInfo: "rec-desk@campus.edu",
    userId: "usr-staff-005",
    userEmail: "rec-desk@campus.edu",
    createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
  },
  {
    id: "item-seed-6",
    title: "Campus Student ID Card & Metro Pass",
    type: "found",
    category: "IDs & Cards",
    location: "Engineering Hall East Entrance",
    dateTime: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    description: "Student ID in transparent plastic sleeve found on sidewalk near bicycle racks.",
    photoUrl: "https://images.unsplash.com/photo-1589758438368-0ad531db3366?w=600&auto=format&fit=crop&q=80",
    ai_tags: ["Card", "Identity Card", "Plastic", "Document", "Access Badge"],
    detected_labels: [
      { name: "Card", confidence: 98.4 },
      { name: "Identity Card", confidence: 96.1 }
    ],
    status: "claimed",
    contactInfo: "eng-office@campus.edu",
    userId: "usr-staff-006",
    userEmail: "eng-office@campus.edu",
    createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString()
  }
];

const SEED_ALERTS = [
  {
    id: "alert-seed-1",
    title: "Severe Thunderstorm & High Wind Advisory",
    message: "The National Weather Service has issued a severe weather warning for our county until 8:00 PM. High winds and sudden hail possible. Seek indoor shelter immediately and avoid open athletic fields.",
    severity: "warning",
    zone: "Entire Campus",
    channels: ["sms", "email", "in_app"],
    active: true,
    senderName: "Campus Police Emergency Dispatch",
    senderEmail: "emergency@campus.edu",
    snsMessageId: "sns-client-7891234",
    broadcastStatus: "delivered",
    createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString()
  },
  {
    id: "alert-seed-2",
    title: "Scheduled Campus Fire Drill - Science Quad",
    message: "Routine emergency evacuation drill in Chemistry & Biology buildings today between 2:00 PM - 3:00 PM. Please follow floor warden instructions and assemble at designated evacuation zones.",
    severity: "info",
    zone: "Science Quad",
    channels: ["email", "in_app"],
    active: false,
    senderName: "Environmental Health & Safety",
    senderEmail: "ehs@campus.edu",
    snsMessageId: "sns-client-5544332",
    broadcastStatus: "delivered",
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
  }
];

const STORAGE_KEY = 'campusfind_client_db_v2';

function getLocalData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('LocalStorage read error:', e);
  }
  const initial = { items: SEED_ITEMS, alerts: SEED_ALERTS };
  saveLocalData(initial);
  return initial;
}

function saveLocalData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('LocalStorage write error:', e);
  }
}

// Client-side implementation of the AWS Lambda AI Matching Engine
function computeMatchScore(itemA, itemB) {
  let score = 0;
  const reasons = [];

  // Category Match (35%)
  if (itemA.category && itemB.category && itemA.category.toLowerCase() === itemB.category.toLowerCase()) {
    score += 35;
    reasons.push(`Matching category: ${itemA.category} (+35%)`);
  }

  // Location Proximity (25%)
  const locA = (itemA.location || '').toLowerCase();
  const locB = (itemB.location || '').toLowerCase();
  if (locA && locB) {
    if (locA === locB || locA.includes(locB) || locB.includes(locA)) {
      score += 25;
      reasons.push(`Exact or overlapping campus location: ${itemA.location} (+25%)`);
    } else {
      const wordsA = locA.split(/\s+/).filter(w => w.length > 3);
      const wordsB = locB.split(/\s+/).filter(w => w.length > 3);
      if (wordsA.some(w => wordsB.includes(w))) {
        score += 15;
        reasons.push(`Similar campus zone: ${itemA.location} (+15%)`);
      }
    }
  }

  // Time Proximity (15%)
  if (itemA.dateTime && itemB.dateTime) {
    const timeA = new Date(itemA.dateTime).getTime();
    const timeB = new Date(itemB.dateTime).getTime();
    const diffHours = Math.abs(timeA - timeB) / (1000 * 3600);
    if (diffHours <= 12) {
      score += 15;
      reasons.push(`Reported within 12 hours of each other (+15%)`);
    } else if (diffHours <= 48) {
      score += 10;
      reasons.push(`Reported within 48 hours of each other (+10%)`);
    } else if (diffHours <= 168) {
      score += 5;
      reasons.push(`Reported within same week (+5%)`);
    }
  }

  // AI Vision Tags & Text Overlap (25%)
  const tagsA = (itemA.ai_tags || []).map(t => t.toLowerCase());
  const tagsB = (itemB.ai_tags || []).map(t => t.toLowerCase());
  const sharedTags = tagsA.filter(t => tagsB.includes(t));
  if (sharedTags.length > 0) {
    const tagPoints = Math.min(20, sharedTags.length * 7);
    score += tagPoints;
    reasons.push(`Shared AI vision labels: [${sharedTags.join(', ')}] (+${tagPoints}%)`);
  }

  const textA = `${itemA.title || ''} ${itemA.description || ''}`.toLowerCase();
  const textB = `${itemB.title || ''} ${itemB.description || ''}`.toLowerCase();
  const wordsA = textA.split(/\W+/).filter(w => w.length > 3);
  const wordsB = textB.split(/\W+/).filter(w => w.length > 3);
  const sharedWords = wordsA.filter(w => wordsB.includes(w) && !sharedTags.includes(w));
  if (sharedWords.length > 0) {
    const textPoints = Math.min(5, sharedWords.length * 2);
    score += textPoints;
    reasons.push(`Keyword correlation in description (+${textPoints}%)`);
  }

  return {
    score: Math.min(100, Math.round(score)),
    reasons
  };
}

export const clientStore = {
  getItems(params = {}) {
    const db = getLocalData();
    let items = [...db.items];

    if (params.type && params.type.toLowerCase() !== 'all') {
      items = items.filter(i => i.type && i.type.toLowerCase() === params.type.toLowerCase());
    }
    if (params.category && params.category.toLowerCase() !== 'all') {
      items = items.filter(i => i.category && i.category.toLowerCase() === params.category.toLowerCase());
    }
    if (params.location && params.location.toLowerCase() !== 'all') {
      items = items.filter(i => i.location && i.location.toLowerCase().includes(params.location.toLowerCase()));
    }
    if (params.status && params.status.toLowerCase() !== 'all') {
      items = items.filter(i => i.status && i.status.toLowerCase() === params.status.toLowerCase());
    }
    if (params.userId) {
      items = items.filter(i => i.userId === params.userId);
    }
    if (params.search) {
      const q = params.search.toLowerCase().trim();
      items = items.filter(i => {
        const title = (i.title || '').toLowerCase();
        const desc = (i.description || '').toLowerCase();
        const loc = (i.location || '').toLowerCase();
        const tags = (i.ai_tags || []).map(t => t.toLowerCase());
        return title.includes(q) || desc.includes(q) || loc.includes(q) || tags.some(t => t.includes(q));
      });
    }

    items.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return { items, count: items.length };
  },

  getItem(id) {
    const db = getLocalData();
    const item = db.items.find(i => i.id === id);
    if (!item) throw new Error('Item not found');
    return { item };
  },

  createItem(itemData) {
    const db = getLocalData();
    const newItem = {
      id: `item-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      title: (itemData.title || '').trim(),
      type: (itemData.type || 'lost').toLowerCase().trim(),
      category: (itemData.category || 'Other').trim(),
      location: (itemData.location || '').trim(),
      dateTime: itemData.dateTime || new Date().toISOString(),
      description: (itemData.description || '').trim(),
      photoUrl: itemData.photoUrl || '',
      ai_tags: itemData.ai_tags || [],
      detected_labels: itemData.detected_labels || [],
      status: 'open',
      contactInfo: itemData.contactInfo || itemData.userEmail || 'Campus Security Lost & Found',
      userId: itemData.userId || 'usr-demo',
      userEmail: itemData.userEmail || 'student@campus.edu',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.items.unshift(newItem);
    saveLocalData(db);
    return { message: 'Report created successfully', item: newItem };
  },

  updateItemStatus(id, status) {
    const db = getLocalData();
    const item = db.items.find(i => i.id === id);
    if (!item) throw new Error('Item not found');
    item.status = status.toLowerCase();
    item.updatedAt = new Date().toISOString();
    saveLocalData(db);
    return { message: 'Status updated', item };
  },

  deleteItem(id) {
    const db = getLocalData();
    db.items = db.items.filter(i => i.id !== id);
    saveLocalData(db);
    return { message: 'Item deleted successfully', id };
  },

  getItemMatches(id) {
    const db = getLocalData();
    const target = db.items.find(i => i.id === id);
    if (!target) throw new Error('Item not found');

    const opposingType = target.type === 'lost' ? 'found' : 'lost';
    const candidates = db.items.filter(i => i.id !== id && i.type === opposingType);

    const matches = candidates
      .map(candidate => {
        const { score, reasons } = computeMatchScore(target, candidate);
        return {
          item: candidate,
          score,
          reasons
        };
      })
      .filter(m => m.score >= 20)
      .sort((a, b) => b.score - a.score);

    return {
      target_item: target,
      matches,
      match_count: matches.length
    };
  },

  getAlerts() {
    const db = getLocalData();
    const alerts = [...db.alerts].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return { alerts, count: alerts.length };
  },

  broadcastAlert(alertData) {
    const db = getLocalData();
    const newAlert = {
      id: `alert-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      title: (alertData.title || '').trim(),
      message: (alertData.message || '').trim(),
      severity: (alertData.severity || 'warning').toLowerCase().trim(),
      zone: (alertData.zone || 'Entire Campus').trim(),
      channels: alertData.channels || ['sms', 'email', 'in_app'],
      active: true,
      senderName: alertData.senderName || 'Campus Safety Dispatch',
      senderEmail: alertData.senderEmail || 'security@campus.edu',
      snsMessageId: `sns-live-${Date.now().toString(36)}`,
      broadcastStatus: 'delivered',
      createdAt: new Date().toISOString()
    };
    db.alerts.unshift(newAlert);
    saveLocalData(db);
    return {
      message: 'Emergency alert successfully broadcasted across campus channels!',
      alert: newAlert
    };
  }
};
