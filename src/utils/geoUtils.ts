import { supabase } from '../lib/supabase';

export async function getGeoData(city: string, state: string, country: string): Promise<[number, number] | null> {
  const address = `${city}, ${state}, ${country}`;
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data && data[0]) {
      const { lat, lon } = data[0];
      return [parseFloat(lon), parseFloat(lat)];
    }
  } catch (error) {
    console.error('Error fetching geo data:', error);
  }

  return null;
}

export async function updateLeadWithGeoData(id: string, city: string, state: string, country: string) {
  const coordinates = await getGeoData(city, state, country);
  if (coordinates) {
    const [longitude, latitude] = coordinates;

    if (
      typeof latitude !== 'number' ||
      typeof longitude !== 'number' ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      console.error(`Invalid coordinates for lead ${id}:`, coordinates);
      return;
    }

    const { error } = await supabase
      .from('leads')
      .update({
        location: `POINT(${longitude} ${latitude})`,
        latitude: latitude,
        longitude: longitude
      })
      .eq('id', id);

    if (error) {
      console.error(`Error updating lead ${id} with geo data:`, error);
    } else {
      console.log(`Updated lead ${id} with coordinates:`, coordinates);
    }
  } else {
    console.log(`Could not find coordinates for lead ${id}`);
  }
}

export function parseWKB(wkb: string | any): [number, number] | null {
  if (!wkb) return null;

  let wkbString: string;

  if (typeof wkb === 'string') {
    wkbString = wkb;
  } else if (wkb.type === 'Point' && Array.isArray(wkb.coordinates) && wkb.coordinates.length === 2) {
    // If it's already a GeoJSON Point, return the coordinates
    return [wkb.coordinates[1], wkb.coordinates[0]];
  } else {
    console.error('Invalid WKB format:', wkb);
    return null;
  }

  // Example WKB parsing logic (ensure it matches your WKB structure)
  try {
    // Remove byte order and type information if present
    const cleanWKB = wkbString.slice(18);
    const x = cleanWKB.slice(0, 16);
    const y = cleanWKB.slice(16);

    const lon = Buffer.from(x, 'hex').readDoubleLE(0);
    const lat = Buffer.from(y, 'hex').readDoubleLE(0);

    return [lat, lon];
  } catch (error) {
    console.error('Error parsing WKB:', error);
    return null;
  }
}
