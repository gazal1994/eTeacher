export interface Project {
  id: string;
  titleAr: string;
  titleHe: string;
  titleEn: string;
  descriptionAr: string;
  descriptionHe: string;
  descriptionEn: string;
  category: 'residential' | 'commercial' | 'infrastructure';
  location: string;
  completionDate: string | null;
  images: string[];
  clientName: string | null;
  status: 'completed' | 'in-progress' | 'planned';
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  projectType: string;
  status: 'new' | 'contacted' | 'closed';
  createdAt: string;
  contactedAt: string | null;
  notes: string | null;
}

export interface AuthResponse {
  token: string;
  user: {
    username: string;
    role: string;
  };
}
