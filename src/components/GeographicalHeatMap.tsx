import React from 'react';
import dynamic from 'next/dynamic';
import { Lead } from '@/hooks/useLeadsData';

const MapComponent = dynamic(() => import('./MapComponent'), { 
  ssr: false,
  loading: () => <p>Loading map...</p>
});

interface GeographicalHeatMapProps {
  leads: Lead[];
}

export const GeographicalHeatMap: React.FC<GeographicalHeatMapProps> = ({ leads }) => {
  if (leads.length === 0) {
    return (
      <div style={{ width: '100%', height: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <p>No call data available yet. The map will populate as calls are made.</p>
      </div>
    );
  }

  return <MapComponent leads={leads} />;
};

export default GeographicalHeatMap;
