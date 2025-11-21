import { CollectionType } from '../domain/CollectionType.js';

export interface CollectionResponse {
  id: number;
  title: string;
  slug: string;
  type: CollectionType;
  year: number | null;
  description: string | null;
  created_by: string | null;
  logo_image_url: string | null;
  banner_image_url: string | null;
  owner_address: string | null;
  created_on: string;
  updated_on: string;
  collections_items_aggregate: { aggregate: { count: number } };
  urls: Array<{ url: string }>;
  artist: { slug: string } | null;
  organization: { slug: string } | null;
}
