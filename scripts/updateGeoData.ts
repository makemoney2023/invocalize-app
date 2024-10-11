import { createRequire } from 'module';
const require = createRequire(import.meta.url);

import fs from 'fs/promises';
import path from 'path';

import { supabase } from '@/lib/supabase';
import { getGeoData } from '@/utils/geoUtils';

async function updateGeoData() {
  const { data: leads, error } = await supabase
    .from('leads')
    .select('id, city, state, country')
    .is('location', null);

  if (error) {
    console.error('Error fetching leads:', error);
    return;
  }

  for (const lead of leads) {
    const coordinates = await getGeoData(lead.city, lead.state, lead.country);
    if (coordinates) {
      const { error: updateError } = await supabase
        .from('leads')
        .update({
          location: {
            type: 'Point',
            coordinates: coordinates
          }
        })
        .eq('id', lead.id);

      if (updateError) {
        console.error(`Error updating lead ${lead.id}:`, updateError);
      } else {
        console.log(`Updated lead ${lead.id} with coordinates:`, coordinates);
      }
    } else {
      console.log(`Could not find coordinates for lead ${lead.id}`);
    }

    // Add a delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

updateGeoData().catch(console.error);
