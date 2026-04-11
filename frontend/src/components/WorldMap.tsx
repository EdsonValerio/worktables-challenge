// frontend/src/components/WorldMap.tsx
// Componente do mapa interativo — renderiza marcadores por país e sincroniza hover com a lista

import { useState, useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';

// --- Tipos ---
interface Country {
  id: string;
  name: string;
  column_values: { text: string; column: { title: string } }[];
}

interface WorldMapProps {
  countries: Country[];
  onCountryClick: (country: Country) => void;
  hoveredCountryId: string | null;
}

// --- Utilitário: extrai coordenadas das colunas da monday ---
function getCoordinates(country: Country): [number, number] | null {
  const latCol = country.column_values.find((c) => c.column.title === 'Latitude');
  const lngCol = country.column_values.find((c) => c.column.title === 'Longitude');

  if (latCol?.text && lngCol?.text) {
    return [parseFloat(latCol.text), parseFloat(lngCol.text)];
  }
  return null;
}

// --- Subcomponente: conteúdo do tooltip com bandeira carregada via lazy fetch ---
function CountryTooltip({ name }: { name: string }) {
  const [flagUrl, setFlagUrl] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false);

  if (!fetched) {
    setFetched(true);
    fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(name)}?fields=flags`)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        const url = data?.[0]?.flags?.svg || data?.[0]?.flags?.png || null;
        setFlagUrl(url);
      })
      .catch(() => {});
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '2px 0' }}>
      {/* Bandeira ou placeholder enquanto carrega */}
      {flagUrl ? (
        <img
          src={flagUrl}
          alt={`Bandeira de ${name}`}
          style={{
            width: '24px',
            height: '16px',
            objectFit: 'cover',
            borderRadius: '2px',
            border: '1px solid rgba(0,0,0,0.12)',
            flexShrink: 0,
          }}
        />
      ) : (
        <div style={{
          width: '24px',
          height: '16px',
          borderRadius: '2px',
          backgroundColor: '#e1e2e9',
          flexShrink: 0,
        }} />
      )}
      <span style={{ fontWeight: 500, fontFamily: 'sans-serif', whiteSpace: 'nowrap' }}>
        {name}
      </span>
    </div>
  );
}

// --- Componente principal ---
function WorldMap({ countries, onCountryClick, hoveredCountryId }: WorldMapProps) {
  // Mapa de id → instância Leaflet do CircleMarker para controle programático do tooltip
  const markerRefs = useRef<Map<string, L.CircleMarker>>(new Map());

  // Abre/fecha tooltip no mapa quando o item na lista entra/sai de hover
  useEffect(() => {
    markerRefs.current.forEach((marker, id) => {
      if (id === hoveredCountryId) {
        marker.openTooltip();
      } else {
        marker.closeTooltip();
      }
    });
  }, [hoveredCountryId]);

  return (
    <MapContainer
      center={[20, 0]}
      zoom={2.5}
      style={{ height: '100%', width: '100%' }}
      attributionControl={false}
    >
      {/* Camada base do mapa */}
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* Marcadores dos países */}
      {countries.map((country) => {
        const coords = getCoordinates(country);
        if (!coords) return null;

        return (
          <CircleMarker
            key={country.id}
            center={coords}
            radius={7}
            pathOptions={{
              color: '#fff',
              weight: 2,
              fillColor: hoveredCountryId === country.id ? '#f65f7c' : '#0073ea',
              fillOpacity: 0.9,
            }}
            ref={(layer) => {
              if (layer) {
                markerRefs.current.set(country.id, layer);
              } else {
                markerRefs.current.delete(country.id);
              }
            }}
            eventHandlers={{
              click: () => onCountryClick(country),
            }}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={1}>
              <CountryTooltip name={country.name} />
            </Tooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}

export default WorldMap;
