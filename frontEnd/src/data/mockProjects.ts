import { Project } from '../types/api';

export const mockProjects: Project[] = [
  {
    id: '1',
    titleEn: 'Luxury Villa Complex',
    titleAr: 'مجمع فلل فاخرة',
    titleHe: 'מתחם וילות יוקרה',
    descriptionEn: 'A modern luxury villa complex featuring 12 premium units with state-of-the-art amenities and stunning architectural design.',
    descriptionAr: 'مجمع فلل فاخر حديث يضم 12 وحدة سكنية متميزة مع وسائل راحة حديثة وتصميم معماري مذهل.',
    descriptionHe: 'מתחם וילות יוקרה מודרני הכולל 12 יחידות פרימיום עם שירותים חדישים ועיצוב אדריכלי מרהיב.',
    category: 'residential',
    status: 'completed',
    location: 'Haifa',
    completionDate: '2023-08-15',
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop'
    ],
    client: 'Private Developer',
    area: '5000 sqm',
    budget: '$2.5M'
  },
  {
    id: '2',
    titleEn: 'Modern Office Building',
    titleAr: 'مبنى مكاتب حديث',
    titleHe: 'בניין משרדים מודרני',
    descriptionEn: 'A 10-story commercial office building with modern facilities, energy-efficient design, and premium finishes.',
    descriptionAr: 'مبنى مكاتب تجاري من 10 طوابق بمرافق حديثة وتصميم موفر للطاقة وتشطيبات راقية.',
    descriptionHe: 'בניין משרדים מסחרי בן 10 קומות עם מתקנים מודרניים, עיצוב חסכוני באנרגיה וגימורים פרימיום.',
    category: 'commercial',
    status: 'completed',
    location: 'Tel Aviv',
    completionDate: '2024-03-20',
    images: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop'
    ],
    client: 'Corporate Holdings Ltd',
    area: '8000 sqm',
    budget: '$4.2M'
  },
  {
    id: '3',
    titleEn: 'Residential Towers',
    titleAr: 'أبراج سكنية',
    titleHe: 'מגדלי מגורים',
    descriptionEn: 'Twin residential towers offering 120 luxury apartments with panoramic views and modern amenities.',
    descriptionAr: 'برجان سكنيان يوفران 120 شقة فاخرة مع إطلالات بانورامية ووسائل راحة حديثة.',
    descriptionHe: 'מגדלי מגורים תאומים המציעים 120 דירות יוקרה עם נוף פנורמי ושירותים מודרניים.',
    category: 'residential',
    status: 'in-progress',
    location: 'Haifa',
    completionDate: null,
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800&h=600&fit=crop'
    ],
    client: 'City Development Corp',
    area: '15000 sqm',
    budget: '$12M'
  },
  {
    id: '4',
    titleEn: 'Highway Infrastructure',
    titleAr: 'بنية تحتية للطرق السريعة',
    titleHe: 'תשתית כבישים',
    descriptionEn: 'Major highway construction project including bridges, tunnels, and modern road infrastructure.',
    descriptionAr: 'مشروع بناء طريق سريع رئيسي يشمل جسور وأنفاق وبنية تحتية حديثة للطرق.',
    descriptionHe: 'פרויקט בניית כביש מהיר מרכזי הכולל גשרים, מנהרות ותשתית כבישים מודרנית.',
    category: 'infrastructure',
    status: 'completed',
    location: 'Northern Region',
    completionDate: '2023-12-10',
    images: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=800&h=600&fit=crop'
    ],
    client: 'Ministry of Transportation',
    area: '25 km',
    budget: '$18M'
  },
  {
    id: '5',
    titleEn: 'Shopping Mall Complex',
    titleAr: 'مجمع مركز تسوق',
    titleHe: 'מתחם קניון',
    descriptionEn: 'Large-scale shopping and entertainment complex with 200+ retail units and modern facilities.',
    descriptionAr: 'مجمع تسوق وترفيه واسع النطاق يضم أكثر من 200 وحدة تجارية ومرافق حديثة.',
    descriptionHe: 'מתחם קניות ובידור בקנה מידה גדול עם 200+ יחידות מסחריות ומתקנים מודרניים.',
    category: 'commercial',
    status: 'completed',
    location: 'Jerusalem',
    completionDate: '2024-06-30',
    images: [
      'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1555636222-cae831e670b3?w=800&h=600&fit=crop'
    ],
    client: 'Retail Ventures Group',
    area: '35000 sqm',
    budget: '$25M'
  },
  {
    id: '6',
    titleEn: 'Bridge Construction',
    titleAr: 'بناء جسر',
    titleHe: 'בניית גשר',
    descriptionEn: 'Modern cable-stayed bridge connecting two major city districts with innovative engineering.',
    descriptionAr: 'جسر حديث معلق بالكابلات يربط بين منطقتين رئيسيتين في المدينة بهندسة مبتكرة.',
    descriptionHe: 'גשר מודרני תלוי בכבלים המחבר בין שתי רובעי עיר מרכזיים עם הנדסה חדשנית.',
    category: 'infrastructure',
    status: 'in-progress',
    location: 'Coastal Area',
    completionDate: null,
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1513828583688-c52646db42da?w=800&h=600&fit=crop'
    ],
    client: 'National Infrastructure Authority',
    area: '1.2 km',
    budget: '$8.5M'
  }
];
