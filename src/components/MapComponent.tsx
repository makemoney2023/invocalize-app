import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Lead } from '@/hooks/useLeadsData';
import { parseWKB } from '@/utils/geoUtils';

const MapComponent: React.FC<{ leads: Lead[] }> = ({ leads }) => {
  const [markers, setMarkers] = useState<{ position: [number, number]; lead: Lead }[]>([]);

  useEffect(() => {
    const newMarkers = leads
      .filter(lead => lead.location)
      .map(lead => {
        console.log('Lead location data:', lead.location);
        const coordinates = parseWKB(lead.location);
        return coordinates ? {
          position: coordinates,
          lead
        } : null;
      })
      .filter((marker): marker is { position: [number, number]; lead: Lead } => marker !== null);
    setMarkers(newMarkers);
  }, [leads]);

  const ontarioBounds: L.LatLngBoundsExpression = [
    [41.6, -95.0], // Southwest corner
    [56.9, -74.3]  // Northeast corner
  ];

  return (
    <MapContainer 
      center={[50.0, -85.0]}
      zoom={5}
      bounds={ontarioBounds}
      style={{ height: '400px', width: '100%' }}
      className="markercluster-group"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {markers.map((marker, index) => (
        <Marker 
          key={index} 
          position={marker.position}
          icon={L.divIcon({
            className: 'custom-icon',
            html: `<div style="background-color: #007bff; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; justify-content: center; align-items: center;">${
              (marker.lead.variables && typeof marker.lead.variables === 'object' && 'city' in marker.lead.variables && typeof marker.lead.variables.city === 'string' && marker.lead.variables.city[0]) ||
              (marker.lead.country && typeof marker.lead.country === 'string' && marker.lead.country[0]) ||
              '?'
            }</div>`
          })}
        >
          <Popup>
            {marker.lead && (
              <div>
                <h3>{marker.lead.name}</h3>
                <p>Country: {marker.lead.country || 'Unknown'}</p>
                <p>City: {marker.lead.variables && typeof marker.lead.variables === 'object' && 'city' in marker.lead.variables ? String(marker.lead.variables.city) : 'Unknown'}</p>
                <p>Call Duration: {marker.lead.call_length ? `${marker.lead.call_length} minutes` : 'Unknown'}</p>
                <p>Use Case: {marker.lead.use_case || 'Unknown'}</p>
              </div>
            )}
          </Popup>
        </Marker>
      ))}
      <MapBounds markers={markers} />
    </MapContainer>
  );
};

const MapBounds: React.FC<{ markers: { position: [number, number] }[] }> = ({ markers }) => {
  const map = useMap();

  useEffect(() => {
    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers.map(marker => marker.position));
      map.fitBounds(bounds);
    }
  }, [markers, map]);

  return null;
};

export default MapComponent;
