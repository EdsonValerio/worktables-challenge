// frontend/src/App.tsx
// Componente raiz da aplicação — gerencia estado global, busca de dados e layout principal

import { useEffect, useState, useMemo } from 'react';
import mondaySdk from 'monday-sdk-js';

import '@vibe/core/tokens';
import { Flex, Heading, Loader, Text } from '@vibe/core';

import SearchBar from './components/SearchBar';
import CountryList from './components/CountryList';
import WorldMap from './components/WorldMap';
import WeatherModal from './components/WeatherModal';

import './App.css';

// --- SDK ---
const monday = mondaySdk();

function App() {
  // --- Estado: contexto e dados ---
  const [context, setContext] = useState<any>(null);
  const [countries, setCountries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Estado: filtros ---
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');

  // --- Estado: UI mobile ---
  const [mobileListOpen, setMobileListOpen] = useState(false);

  // --- Estado: modal de clima ---
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState('');

  // --- Estado: hover sincronizado entre lista e mapa ---
  const [hoveredCountryId, setHoveredCountryId] = useState<string | null>(null);

  // --- Deriva as regiões únicas a partir dos dados recebidos da monday ---
  const availableRegions = useMemo(() => {
    const regions = new Set<string>();
    countries.forEach((country) => {
      const regionCol = country.column_values.find((c: any) => c.column.title === 'Region');
      if (regionCol?.text) {
        regions.add(regionCol.text);
      }
    });
    return Array.from(regions).sort().map((r) => ({ label: r, value: r }));
  }, [countries]);

  // --- Efeito: captura o contexto do board da monday ---
  useEffect(() => {
    monday.listen('context', (res) => setContext(res.data));
  }, []);

  // --- Efeito: busca os países assim que o boardId estiver disponível ---
  useEffect(() => {
    if (context?.boardId) {
      const query = `query { boards (ids: ${context.boardId}) { items_page (limit: 250) { items { id name column_values { text column { title } } } } } }`;

      monday.api(query)
        .then((res: any) => {
          if (res.errors) {
            console.error('Erro da API da monday:', res.errors);
            setLoading(false);
            return;
          }
          const fetchedItems = res.data?.boards?.[0]?.items_page?.items || [];
          setCountries(fetchedItems);
        })
        .catch((err) => {
          console.error('Falha na conexão com a monday:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [context]);

  // --- Filtragem combinada: texto + continente ---
  const filteredCountries = countries.filter((country) => {
    const matchesSearch = country.name.toLowerCase().includes(searchTerm.toLowerCase());

    const regionCol = country.column_values.find((c: any) => c.column.title === 'Region');
    const matchesRegion = selectedRegion ? regionCol?.text === selectedRegion : true;

    return matchesSearch && matchesRegion;
  });

  // --- Handler: clique em um país → busca clima no backend ---
  const handleCountryClick = async (country: any) => {
    setSelectedCountry(country);
    setWeatherData(null);
    setWeatherError('');
    setWeatherLoading(true);

    try {
      const response = await fetch(`http://localhost:3001/api/weather/${country.name}`);
      if (!response.ok) throw new Error('Falha ao buscar dados');
      const data = await response.json();
      setWeatherData(data);
    } catch (error: any) {
      setWeatherError('Não foi possível carregar o clima. Back-end está rodando?');
    } finally {
      setWeatherLoading(false);
    }
  };

  // --- Handler: fecha o modal de clima ---
  const closeModal = () => setSelectedCountry(null);

  // --- Guard: exige boardId para renderizar a aplicação ---
  if (!context?.boardId) {
    return (
      <div className="no-context">
        <Heading type="h3">⚠️ Ambiente Incorreto</Heading>
        <Text>Abra este app por dentro da aba "DEVELOP HERE" na monday.com!</Text>
      </div>
    );
  }

  // --- Render ---
  return (
    <div className="app-wrapper">

      {/* Header */}
      <div style={{ padding: '15px 20px', borderBottom: '1px solid #c3c6d4', backgroundColor: '#fff', zIndex: 10 }}>
        <Flex justify="space-between" align="center">
          <Heading type="h2">World Countries Explorer</Heading>
        </Flex>
      </div>

      {loading ? (
        <div className="app-loader">
          <Loader size="large" />
        </div>
      ) : (
        <>
          {/* Conteúdo principal */}
          <div className="app-content">

            {/* Painel do mapa — ocupa a área principal */}
            <div className="map-panel">
              <WorldMap
                countries={filteredCountries}
                onCountryClick={handleCountryClick}
                hoveredCountryId={hoveredCountryId}
              />

              {/* Overlay flutuante — visível apenas no mobile, posicionado sobre o mapa */}
              <div className={`mobile-overlay-panel ${mobileListOpen ? 'open' : ''}`}>
                <button
                  id="mobile-list-toggle"
                  className="mobile-list-toggle"
                  onClick={() => setMobileListOpen((prev) => !prev)}
                  aria-expanded={mobileListOpen}
                >
                  {mobileListOpen ? '▲' : '▼'} Lista ({filteredCountries.length})
                </button>

                <div className="mobile-overlay-content">
                  <SearchBar
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    resultsCount={filteredCountries.length}
                    availableRegions={availableRegions}
                    selectedRegion={selectedRegion}
                    onRegionChange={setSelectedRegion}
                  />
                  <CountryList
                    countries={filteredCountries}
                    onCountryClick={handleCountryClick}
                    onCountryHover={setHoveredCountryId}
                  />
                </div>
              </div>
            </div>

            {/* Painel lateral — visível apenas no desktop */}
            <div className="side-panel">
              <SearchBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                resultsCount={filteredCountries.length}
                availableRegions={availableRegions}
                selectedRegion={selectedRegion}
                onRegionChange={setSelectedRegion}
              />
              <CountryList
                countries={filteredCountries}
                onCountryClick={handleCountryClick}
                onCountryHover={setHoveredCountryId}
              />
            </div>

          </div>
        </>
      )}

      {/* Modal de clima */}
      <WeatherModal
        selectedCountry={selectedCountry}
        weatherData={weatherData}
        weatherLoading={weatherLoading}
        weatherError={weatherError}
        onClose={closeModal}
      />

    </div>
  );
}

export default App;