export const PASS_COLORS = {
  primary: '#1B3A8C',
  secondary: '#0E1F4D',
  accent: '#2E6FE8',
  red: '#E63946',
  gold: '#F5A623',
  lightBg: '#F4F7FD',
};

export const CREDIT_PACKAGES = [
  { id: 'single', name: 'Single Credit', credits: 1, price: 3000, popular: false, description: 'Unlock one course' },
  { id: 'starter', name: 'Starter Pack', credits: 3, price: 8000, popular: false, description: 'Best for focused upskilling' },
  { id: 'professional', name: 'Professional Pack', credits: 5, price: 12000, popular: true, description: 'Most chosen by professionals' },
  { id: 'leadership', name: 'Leadership Pack', credits: 10, price: 22000, popular: false, description: 'Full mastery suite' },
];

export const CORPORATE_BUNDLES = [
  { id: 'team20', name: 'Team Bundle', users: 20, creditsPerUser: 5, price: 240000 },
  { id: 'enterprise50', name: 'Enterprise Bundle', users: 50, creditsPerUser: 10, price: 1000000 },
];

export const formatKES = (amount) => {
  return 'KES ' + amount.toLocaleString('en-KE');
};

export const generateCertificateId = () => {
  const num = Math.floor(10000 + Math.random() * 90000);
  return `PASS-2026-${num}`;
};

export const COURSE_THUMBNAILS = {
  'Negotiation Skills': 'https://images.unsplash.com/photo-1573497620053-ea5300f94f5e?w=800&q=80',
  'Leadership Essentials': 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
  'Communication Mastery': 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&q=80',
  'Conflict Resolution': 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80',
  'Emotional Intelligence': 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&q=80',
  'Time & Productivity': 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&q=80',
  'Team Management': 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80',
  'Presentation Skills': 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=800&q=80',
};