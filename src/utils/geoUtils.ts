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
    const { error } = await supabase
      .from('leads')
      .update({
        location: {
          type: 'Point',
          coordinates: coordinates
        }
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

  // Check if the string starts with the WKB header
  if (!wkbString.startsWith('0101000020E6100000')) {
    console.error('Invalid WKB header:', wkbString);
    return null;
  }

  // Remove the '0101000020E6100000' prefix
  const cleanWKB = wkbString.slice(18);

  // Split the remaining string into two 16-character parts
  const x = cleanWKB.slice(0, 16);
  const y = cleanWKB.slice(16);

  // Convert hex to float
  const lon = Buffer.from(x, 'hex').readDoubleLE(0);
  const lat = Buffer.from(y, 'hex').readDoubleLE(0);

  return [lat, lon];
}
