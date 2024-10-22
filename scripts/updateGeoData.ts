import { createRequire } from 'module';
const require = createRequire(import.meta.url);

import fs from 'fs/promises';
import path from 'path';

import { supabase } from '@/lib/supabase';
import { getGeoData, updateLeadWithGeoData } from '@/utils/geoUtils';

async function updateGeoData() {
  const { data: leads, error } = await supabase
    .from('leads')
    .select('id, city, state, country')
    .is('location', null);

  if (error) {
    console.error('Error fetching leads:', error);
    return;
  }

  const concurrencyLimit = 5;
  let activePromises: Promise<void>[] = [];

  for (const lead of leads) {
    const promise = updateLeadWithGeoData(lead.id, lead.city, lead.state, lead.country);
    activePromises.push(promise);

    if (activePromises.length >= concurrencyLimit) {
      await Promise.race(activePromises).catch(console.error);
      activePromises = activePromises.filter(p => p !== promise);
    }
  }

  await Promise.all(activePromises).catch(console.error);
  console.log('Geo data update completed.');
}

updateGeoData().catch(console.error);
