export type Bathroom = {
  id: string;
  name: string;
  notes: string | null;
  lat: number;
  lng: number;
  accessible: boolean;
  requiresCode: boolean;
  createdAt: string;
  averageRating: number | null;
  ratingCount: number;
};

export type LatLng = { lat: number; lng: number };
