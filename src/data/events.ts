/* All app data lives here. No backend: events, demo tickets, host requests. */

export type Cat = 'music' | 'food' | 'workshop' | 'social' | 'fitness';
export type TimeKey = 'now' | 'tonight' | 'weekend';
export type DateKey = 'Today' | 'Saturday' | 'Sunday';
export type PhotoKey =
  | 'rooftop' | 'street' | 'mic' | 'pottery' | 'games' | 'pizza'
  | 'vinyl' | 'yoga' | 'photo' | 'lettering' | 'wood';

export interface Tier { n: string; p: number; s: string; left?: number }

export interface EventItem {
  id: string;
  t: string;
  cat: Cat;
  time: TimeKey;
  /** minutes from "now" (6:50 pm) until start; negative = already started */
  mins: number;
  when: string;
  date: DateKey;
  start: string;
  price: number;
  /** distance in km */
  d: number;
  host: string;
  hostI: string;
  hostC: string;
  rating: number;
  reviews: number;
  cap: number;
  taken: number;
  friends: number;
  area: string;
  place: string;
  access: 'open' | 'request' | 'invite';
  /** position on the 560×560 map art */
  x: number;
  y: number;
  about: string[];
  incl: string[];
  tiers: Tier[];
  /** photo-mood tint */
  tint: string;
  solo: boolean;
  level: string | null;
  vibe: string;
  /** duration in minutes */
  dur: number;
  photo: PhotoKey;
}

/** photo focal points (object-position / background-position) */
export const PHOTO_POS: Record<PhotoKey, string> = {
  rooftop: 'center 40%', street: 'center 35%', mic: '60% center', pottery: 'center',
  games: 'center 30%', pizza: 'center', vinyl: 'center 30%', yoga: '70% center',
  photo: 'center 30%', lettering: 'center 70%', wood: 'center 35%',
};
export const photoSrc = (k: PhotoKey) => `/img/${k}.jpg`;
/** CSS background shorthand used for small thumbnails (--g) */
export const G = (k: PhotoKey) => `var(--img-${k}) ${PHOTO_POS[k]}/cover no-repeat`;

export const FR: [string, string][] = [
  ['Aditi', '#B59CFF'], ['Kabir', '#FFC247'], ['Neha', '#3DF0C8'], ['Ishaan', '#FF9C85'], ['Tara', '#9AD0FF'],
];

type Base = Omit<EventItem, 'tint' | 'solo' | 'level' | 'vibe' | 'dur' | 'photo'>;

const BASE: Base[] = [
  { id: 'rooftop', t: 'Rooftop sunset session', cat: 'music', time: 'now', mins: -20, when: 'Live now, until 10 pm', date: 'Today', start: '6:30 pm', price: 499, d: 0.65, host: 'Open Air Collective', hostI: 'OA', hostC: '#1F3B5C', rating: 4.8, reviews: 212, cap: 40, taken: 26, friends: 3, area: 'Indiranagar', place: 'The Terrace, 100 Ft Road', access: 'open', x: 340, y: 250,
    about: ['Acoustic sets on a rooftop as the sun goes down, with pizza, cake and string lights. Two musicians play covers and originals, and anyone can request a song.', 'Stay for one set or the whole evening. Seating is relaxed and first come, first served.'], incl: ['Pizza included', 'Acoustic live music', '18+'], tiers: [{ n: 'General', p: 499, s: 'Entry and a slice of pizza' }, { n: 'Sofa spot', p: 899, s: 'Reserved lounge seat for two', left: 3 }] },
  { id: 'lettering', t: 'Hand-lettering and sign painting', cat: 'workshop', time: 'tonight', mins: 18, when: 'Today, 7:00 pm', date: 'Today', start: '7:00 pm', price: 350, d: 0.8, host: 'Street Type Club', hostI: 'ST', hostC: '#7A6C5D', rating: 4.7, reviews: 58, cap: 20, taken: 16, friends: 0, area: 'Indiranagar', place: 'Mural wall, 12th Main', access: 'open', x: 220, y: 250,
    about: ["Learn bold, readable lettering with markers on cardboard, sitting right in front of one of the neighbourhood's best murals. Take your signs home."], incl: ['Markers and boards provided', 'Beginners welcome', '90 minutes'], tiers: [{ n: 'Participant', p: 350, s: 'All materials included' }] },
  { id: 'pottery', t: 'Wheel pottery for beginners', cat: 'workshop', time: 'tonight', mins: 48, when: 'Today, 7:30 pm', date: 'Today', start: '7:30 pm', price: 1200, d: 1.1, host: 'Mud & Fire Studio', hostI: 'MF', hostC: '#8A5A44', rating: 4.9, reviews: 76, cap: 10, taken: 6, friends: 0, area: 'Domlur', place: 'Mud & Fire Studio, Domlur', access: 'open', x: 180, y: 360,
    about: ['A hands-on evening at the wheel. You will throw two pieces, which the studio glazes and fires for pick-up in two weeks.', "Wear clothes you don't mind getting muddy."], incl: ['All materials', 'Beginners welcome', '2 hours'], tiers: [{ n: 'Per person', p: 1200, s: 'Clay, tools and firing' }] },
  { id: 'street', t: 'Street food walk', cat: 'food', time: 'tonight', mins: 63, when: 'Today, 7:45 pm', date: 'Today', start: '7:45 pm', price: 650, d: 0.4, host: 'Bengaluru Bites', hostI: 'BB', hostC: '#A4553A', rating: 4.9, reviews: 98, cap: 12, taken: 8, friends: 2, area: 'Indiranagar', place: 'Starts at CMH Road metro', access: 'open', x: 300, y: 330,
    about: ['Two hours, six stalls the locals swear by, and tastings at every stop. Your guide shares the stories behind each dish along the way.'], incl: ['All tastings included', '2 hours', 'Vegetarian options'], tiers: [{ n: 'Walker', p: 650, s: 'All tastings included' }] },
  { id: 'pizza', t: 'New in town pizza meetup', cat: 'social', time: 'tonight', mins: 108, when: 'Today, 8:30 pm', date: 'Today', start: '8:30 pm', price: 450, d: 1.3, host: 'Bengaluru Newcomers', hostI: 'BN', hostC: '#3E5C9A', rating: 4.8, reviews: 264, cap: 24, taken: 17, friends: 1, area: 'HAL 2nd Stage', place: 'Forno Café, HAL 2nd Stage', access: 'open', x: 420, y: 400,
    about: ['Moved to the city recently? Share a few pizzas with others who have too. Hosts seat you at tables of six and keep the conversation going.', 'Come alone; most people do.'], incl: ['Pizza and a drink', 'Come solo', 'Tables of six'], tiers: [{ n: 'Seat', p: 450, s: 'Pizza and a drink' }] },
  { id: 'mic', t: 'Acoustic open mic', cat: 'music', time: 'tonight', mins: 138, when: 'Today, 9:00 pm', date: 'Today', start: '9:00 pm', price: 200, d: 0.9, host: 'Courtyard Café', hostI: 'CC', hostC: '#40364F', rating: 4.6, reviews: 154, cap: 60, taken: 31, friends: 1, area: 'Indiranagar', place: 'Courtyard Café, 12th Main', access: 'open', x: 260, y: 190,
    about: ['Bring a song or just come to listen. Performers get ten minutes each and sign-ups open at the door.'], incl: ['Performer slots open', 'All ages'], tiers: [{ n: 'Entry', p: 200, s: 'Includes a coffee' }, { n: 'Performer slot', p: 0, s: 'Ten-minute set', left: 4 }] },
  { id: 'games', t: "Game night at Meera's", cat: 'social', time: 'weekend', mins: 1500, when: 'Sat, 8:00 pm', date: 'Saturday', start: '8:00 pm', price: 300, d: 1.8, host: 'Meera K.', hostI: 'MK', hostC: '#9A5B3E', rating: 5.0, reviews: 41, cap: 10, taken: 7, friends: 0, area: 'Koramangala', place: 'Home in Koramangala', access: 'request', x: 140, y: 150,
    about: ['Jenga, cards and a shelf of party games in my living room, plus plenty of snacks. Usually a mix of regulars and first-timers.', 'This is a private home, so the exact address is shared once I approve your request.'], incl: ['Snacks included', 'Request to join', 'Hosted at home'], tiers: [{ n: 'Seat', p: 300, s: 'Games and snacks' }] },
  { id: 'vinyl', t: 'Vinyl listening party', cat: 'music', time: 'weekend', mins: 1300, when: 'Sat, 6:00 pm', date: 'Saturday', start: '6:00 pm', price: 350, d: 1.2, host: 'Side B Records', hostI: 'SB', hostC: '#24263A', rating: 4.7, reviews: 63, cap: 25, taken: 19, friends: 1, area: 'Indiranagar', place: 'Side B Records, 80 Ft Road', access: 'open', x: 390, y: 150,
    about: ['A full album played start to finish on a proper system, then a conversation about it. Bring a record to swap if you like.'], incl: ['Snacks included', 'Record swap'], tiers: [{ n: 'Listener', p: 350, s: 'Snacks included' }] },
  { id: 'yoga', t: 'Slow-flow yoga by the window', cat: 'fitness', time: 'weekend', mins: 2100, when: 'Sun, 7:30 am', date: 'Sunday', start: '7:30 am', price: 300, d: 1.6, host: 'Breathe Studio', hostI: 'BS', hostC: '#5E8C7E', rating: 4.9, reviews: 120, cap: 20, taken: 17, friends: 0, area: 'Defence Colony', place: 'Breathe Studio, Defence Colony', access: 'open', x: 110, y: 280,
    about: ['A gentle 60-minute class in a sunlit studio. Suitable for complete beginners; mats provided.'], incl: ['Mats provided', 'All levels', '60 minutes'], tiers: [{ n: 'Class', p: 300, s: '60 minutes' }] },
  { id: 'photo', t: 'Intro to studio photography', cat: 'workshop', time: 'weekend', mins: 1600, when: 'Sat, 11:00 am', date: 'Saturday', start: '11:00 am', price: 900, d: 2.4, host: 'Frame Lab', hostI: 'FL', hostC: '#4D4D4D', rating: 4.8, reviews: 55, cap: 12, taken: 7, friends: 0, area: 'Jeevan Bima Nagar', place: 'Frame Lab, JB Nagar', access: 'open', x: 70, y: 470,
    about: ["Learn lighting, framing and camera settings in a real studio, then shoot portraits of each other. Cameras provided if you don't have one."], incl: ['Camera provided', 'Studio lighting', '3 hours'], tiers: [{ n: 'Participant', p: 900, s: 'Camera and studio time' }] },
  { id: 'wood', t: 'Intro to woodcarving', cat: 'workshop', time: 'weekend', mins: 1900, when: 'Sun, 10:00 am', date: 'Sunday', start: '10:00 am', price: 1500, d: 2.8, host: 'Grain & Chisel', hostI: 'GC', hostC: '#6B4A2E', rating: 4.9, reviews: 37, cap: 8, taken: 5, friends: 0, area: 'Ulsoor', place: 'Grain & Chisel workshop, Ulsoor', access: 'open', x: 470, y: 300,
    about: ['Measure, mark and carve a small serving board with hand tools in a working woodshop. You leave with your board and the basics to keep going.'], incl: ['Tools and wood provided', 'Small group', '3 hours'], tiers: [{ n: 'Participant', p: 1500, s: 'Tools, wood and finish' }] },
];

/* tint (photo mood), come solo, level, 2-word vibe, duration (min) */
const EXTRA: Record<string, Pick<EventItem, 'tint' | 'solo' | 'level' | 'vibe' | 'dur'>> = {
  rooftop: { tint: '#C2552D', solo: true, level: null, vibe: 'Chill, outdoors', dur: 210 },
  lettering: { tint: '#4D6A8A', solo: true, level: 'Beginners welcome', vibe: 'Hands-on, quiet', dur: 90 },
  pottery: { tint: '#8A5A44', solo: true, level: 'Beginners welcome', vibe: 'Messy, focused', dur: 120 },
  street: { tint: '#B3461E', solo: true, level: null, vibe: 'Loud, tasty', dur: 120 },
  pizza: { tint: '#A8432A', solo: true, level: null, vibe: 'Chatty, warm', dur: 120 },
  mic: { tint: '#5A3A7A', solo: true, level: 'Beginners welcome', vibe: 'Cosy, live', dur: 150 },
  games: { tint: '#2E5C3F', solo: true, level: 'Beginners welcome', vibe: 'Playful, homey', dur: 180 },
  vinyl: { tint: '#3B2F6B', solo: false, level: null, vibe: 'Deep, mellow', dur: 150 },
  yoga: { tint: '#6B8E7A', solo: true, level: 'Beginners welcome', vibe: 'Slow, calm', dur: 60 },
  photo: { tint: '#4A4A52', solo: false, level: 'Beginners welcome', vibe: 'Creative, bright', dur: 180 },
  wood: { tint: '#6B4A2E', solo: false, level: 'Beginners welcome', vibe: 'Crafty, calm', dur: 180 },
};

export const events: EventItem[] = BASE.map((b) => ({ ...b, ...EXTRA[b.id], photo: b.id as PhotoKey }));
export const byId: Record<string, EventItem> = Object.fromEntries(events.map((e) => [e.id, e]));

export const CATS: [Cat | 'all', string][] = [
  ['all', 'All'], ['music', 'Music'], ['food', 'Food and drink'], ['workshop', 'Workshops'], ['social', 'Social'], ['fitness', 'Fitness'],
];
export const TIMES: [TimeKey | 'all', string][] = [['all', 'Anytime'], ['now', 'Now'], ['tonight', 'Tonight'], ['weekend', 'Weekend']];
export const DAY: Record<DateKey, { dow: string; d: number; full: string; rel: string }> = {
  Today: { dow: 'Tue', d: 13, full: 'Tue, 13 Oct', rel: 'Today' },
  Saturday: { dow: 'Sat', d: 17, full: 'Sat, 17 Oct', rel: 'In 4 days' },
  Sunday: { dow: 'Sun', d: 18, full: 'Sun, 18 Oct', rel: 'In 5 days' },
};
export const DISTS = [0.5, 1, 1.5, 2, 2.5, 3];

export const INTENTS: [string, string, string, PhotoKey][] = [
  ['tonight', "I'm free tonight", 'Starts in the next few hours', 'rooftop'],
  ['social', 'Meet new people', 'Come solo, leave with friends', 'pizza'],
  ['workshop', 'Learn something', 'Hands-on, small groups', 'pottery'],
  ['food', 'Eat and drink', 'Food walks and suppers', 'street'],
  ['budget', 'Under ₹500', 'Good plans that cost less', 'mic'],
];
export const CURATED: [string, string][] = [
  ['pizza', 'Seated at tables of six. Most people come alone.'],
  ['mic', 'Just listen, or sign up for ten minutes on stage.'],
  ['yoga', 'A gentle Sunday start. No experience needed.'],
];

export interface Ticket { id: string; ev: string; qty: number; tier: string; total: number; status: 'upcoming' | 'past'; date?: string }
export const DEFAULT_TICKETS: Ticket[] = [
  { id: 'T-4821', ev: 'vinyl', qty: 2, tier: 'Listener', total: 798, status: 'upcoming' },
  { id: 'T-3310', ev: 'mic', qty: 1, tier: 'Entry', total: 235, status: 'past', date: 'Tue, 6 Oct' },
];

export interface JoinRequest { n: string; i: string; c: string; meta: string; st: null | 'Approved' | 'Declined' }
export const DEFAULT_REQUESTS: JoinRequest[] = [
  { n: 'Arjun Mehta', i: 'AM', c: '#3E5C9A', meta: '3 events attended · 4.9 rating', st: null },
  { n: 'Sana Qureshi', i: 'SQ', c: '#0E7C6B', meta: 'First event · verified ID', st: null },
  { n: 'Rohan Pillai', i: 'RP', c: '#9A5B3E', meta: '11 events attended · 5.0 rating', st: null },
];

export interface Draft {
  title: string; cat: Cat; date: string; time: string; seats: string | number; price: string | number;
  access: 'open' | 'request' | 'invite'; hide: boolean; upfront: boolean; showCount: boolean; area: string; about: string; addr: string;
}
export const DEFAULT_DRAFT: Draft = {
  title: '', cat: 'social', date: '', time: '20:00', seats: 10, price: 300, access: 'request',
  hide: true, upfront: true, showCount: false, area: 'Koramangala', about: '', addr: '',
};

/** Host's own listings for the dashboard */
export const HOST_EVENTS: { id?: string; t: string; d: string; cap: number; sold: number; photo: PhotoKey }[] = [
  { id: 'games', t: "Game night at Meera's", d: 'Sat, 8:00 pm', cap: 10, sold: 7, photo: 'games' },
  { t: 'Pizza and card games', d: 'Fri, 8:00 pm', cap: 10, sold: 10, photo: 'pizza' },
  { t: 'Vinyl and board games', d: 'Next Sun, 4:00 pm', cap: 12, sold: 5, photo: 'vinyl' },
];
