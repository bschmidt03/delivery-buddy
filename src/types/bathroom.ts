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

export type MapBounds = { south: number; west: number; north: number; east: number };

/** A public restroom sourced from OpenStreetMap, not yet in our database. */
export type OsmRestroom = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  accessible: boolean;
  fee: boolean;
  openingHours: string | null;
};
