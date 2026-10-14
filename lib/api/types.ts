// Shapes returned by the Django API (apps/*/serializers.py).

export type Paginated<T> = {
  count: number;
  page: number;
  pages: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type Block = { group: string; title: string; body: string };
export type Stat = { value: string; label: string };

export type SiteSettings = {
  org_name: string;
  council_name: string;
  slogan: string;
  phone: string;
  phone_secondary: string;
  email: string;
  address: string;
  working_hours: string;
  map_embed_url: string;
  telegram: string;
  instagram: string;
  facebook: string;
  youtube: string;
  catalog_url: string;
  stat_members: number;
  stat_catalog: number;
  stat_startups: number;
  stat_enterprises: number;
  updated_at: string;
};

export type Page = {
  id: number;
  key: string;
  section: string;
  section_label: string;
  title: string;
  subtitle: string;
  body: string;
  blocks: Block[];
  cover: string | null;
  seo_description: string;
  is_published: boolean;
  published_at: string | null;
  updated_at: string;
};

export type NewsImage = { id: number; image: string; caption: string; order: number };

export type NewsItem = {
  id: number;
  slug: string;
  title: string;
  category: string;
  category_label: string;
  excerpt: string;
  cover: string | null;
  is_featured: boolean;
  is_published: boolean;
  published_at: string | null;
  views: number;
  images_count: number;
  updated_at: string;
};

export type NewsDetail = NewsItem & { body: string; source_url: string; images: NewsImage[]; created_at: string };

export type Film = {
  id: number;
  slug: string;
  title: string;
  company: string;
  owner_name: string;
  description: string;
  video_url: string;
  video_file: string | null;
  cover: string | null;
  duration: string;
  order: number;
  is_published: boolean;
  published_at: string | null;
  updated_at: string;
};

export type Announcement = {
  id: number;
  slug: string;
  title: string;
  kind: "announcement" | "event" | "tender";
  kind_label: string;
  excerpt: string;
  body: string;
  cover: string | null;
  event_date: string | null;
  ends_at: string | null;
  location: string;
  participants: number | null;
  registration_url: string;
  is_featured: boolean;
  gallery: number | null;
  gallery_slug: string | null;
  is_upcoming: boolean;
  is_published: boolean;
  published_at: string | null;
  updated_at: string;
};

export type GalleryImage = { id: number; image: string; caption: string; order: number };

export type Gallery = {
  id: number;
  slug: string;
  title: string;
  description: string;
  event_date: string | null;
  location: string;
  cover: string | null;
  images_count: number;
  preview: string[];
  is_published: boolean;
  published_at: string | null;
  updated_at: string;
};

export type GalleryDetail = Gallery & { images: GalleryImage[] };

export type ProjectCategory = "social" | "science" | "startup" | "club" | "media" | "catalog" | "forum" | "other";
export type ProjectStatus = "active" | "completed" | "planned";

export type Project = {
  id: number;
  slug: string;
  title: string;
  category: ProjectCategory;
  category_label: string;
  status: ProjectStatus;
  status_label: string;
  summary: string;
  metrics: string;
  stats: Stat[];
  cover: string | null;
  is_featured: boolean;
  order: number;
  is_published: boolean;
  published_at: string | null;
  updated_at: string;
};

export type ProjectDocument = { id: number; title: string; file: string; size: number | null; extension: string | null; order: number };
export type ProjectParticipant = { id: number; project: number; company: string; person: string; role: string; contribution: string; order: number };

export type ProjectDetail = Project & {
  body: string;
  objectives: string;
  expected_results: string;
  video_url: string;
  website_url: string;
  telegram_url: string;
  instagram_url: string;
  started_on: string | null;
  finished_on: string | null;
  budget: string;
  images: { id: number; image: string; caption: string; order: number }[];
  documents: ProjectDocument[];
  participants: ProjectParticipant[];
  created_at: string;
};

type PersonBase = {
  id: number;
  slug: string;
  full_name: string;
  photo: string | null;
  bio: string;
  is_active: boolean;
  order: number;
  updated_at: string;
};

export type CouncilMember = PersonBase & {
  company: string;
  position: string;
  industry: string;
  website: string;
  contact_email: string;
  contact_phone: string;
  show_contacts: boolean;
  joined_year: number | null;
};

export type BoardMember = PersonBase & { role: string; role_label: string; workplace: string };

export type Leader = PersonBase & {
  position: string;
  organization: string;
  phone: string;
  email: string;
  reception_hours: string;
};

export type Meeting = {
  id: number;
  slug: string;
  title: string;
  date: string;
  host_company: string;
  location: string;
  agenda: string;
  outcome: string;
  gallery: number | null;
  gallery_slug: string | null;
  is_published: boolean;
  published_at: string | null;
  updated_at: string;
};

export type Recognition = {
  id: number;
  full_name: string;
  company: string;
  award: string;
  year: number;
  photo: string | null;
  description: string;
  is_published: boolean;
  order: number;
  updated_at: string;
};

export type Winner = { id: number; level: string; level_label: string; name: string; note: string; order: number };
export type Nomination = { id: number; title: string; order: number; winners: Winner[] };

export type ForumEdition = {
  id: number;
  year: number;
  results_year: number;
  title: string;
  dates: string;
  location: string;
  cover: string | null;
  nominations_count: number;
  winners_count: number;
  is_published: boolean;
  published_at: string | null;
  updated_at: string;
};

export type ForumEditionDetail = ForumEdition & {
  intro: string;
  gallery: number | null;
  gallery_slug: string | null;
  nominations: Nomination[];
};

export type Partner = {
  id: number;
  name: string;
  kind: "domestic" | "international";
  kind_label: string;
  logo: string | null;
  country: string;
  website: string;
  description: string;
  is_published: boolean;
  order: number;
  updated_at: string;
};

export type SearchResult = { kind: string; title: string; text: string; url: string };
