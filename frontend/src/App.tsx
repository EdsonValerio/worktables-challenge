import { useEffect, useState, useMemo } from 'react';
import mondaySdk from 'monday-sdk-js';

import '@vibe/core/tokens';
import { Flex, Heading, Loader, Text } from '@vibe/core';

import SearchBar from './components/SearchBar';
import CountryList from './components/CountryList';
import WorldMap from './components/WorldMap';
import WeatherModal from './components/WeatherModal';


import './App.css';

const monday = mondaySdk();



function App() {
  const [context, setContext] = useState<any>(null);
  const [countries, setCountries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileListOpen, setMobileListOpen] = useState(false);

  // Estado para guardar o continente escolhido no Dropdown
  const [selectedRegion, setSelectedRegion] = useState('');



  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState('');

  // ID do país em hover na lista — sincroniza com o tooltip do mapa
  const [hoveredCountryId, setHoveredCountryId] = useState<string | null>(null);

  // Extrai as regiões únicas (Europa, Ásia, etc.) do array da monday dinamicamente
  const availableRegions = useMemo(() => {
    const regions = new Set<string>();
    countries.forEach((country) => {
      const regionCol = country.column_values.find((c: any) => c.column.title === 'Region');
      if (regionCol?.text) {
        regions.add(regionCol.text);
      }
    });
    // Converte o Set para o formato { label, value } que o Dropdown exige
    return Array.from(regions).sort().map((r) => ({ label: r, value: r }));
  }, [countries]);

  useEffect(() => {
    monday.listen('context', (res) => setContext(res.data));
  }, []);

  useEffect(() => {
    if (context?.boardId) {
      // Usando o limite seguro de 100. (Num projeto real faríamos a paginação com 'cursor')
      const query = `query { boards (ids: ${context.boardId}) { items_page (limit: 250) { items { id name column_values { text column { title } } } } } }`;
      
      monday.api(query)
        .then((res: any) => {
          // Proteção caso a API retorne um erro GraphQL em vez de dados
          if (res.errors) {
            console.error("Erro da API da monday:", res.errors);
            setLoading(false);
            return;
          }
          
          // Extrai e salva os itens com segurança
          const fetchedItems = res.data?.boards?.[0]?.items_page?.items || [];
          setCountries(fetchedItems);
        })
        .catch((err) => {
          console.error("Falha na conexão com a monday:", err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [context]);

  // Lógica de Filtro Combinada: Nome + Continente
  const filteredCountries = countries.filter((country) => {
    // 1. Checa a busca por texto
    const matchesSearch = country.name.toLowerCase().includes(searchTerm.toLowerCase());

    // 2. Checa o filtro por continente
    const regionCol = country.column_values.find((c: any) => c.column.title === 'Region');
    const matchesRegion = selectedRegion ? regionCol?.text === selectedRegion : true;

    return matchesSearch && matchesRegion;
  });

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

  const closeModal = () => setSelectedCountry(null);

  if (!context?.boardId) {
    return (
      <div className="no-context">
        <Heading type="h3">⚠️ Ambiente Incorreto</Heading>
        <Text>Abra este app por dentro da aba "DEVELOP HERE" na monday.com!</Text>
      </div>
    );
  }

  return (
    <div className="app-wrapper">

    {/* HEADER */}
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
          {/* CONTEÚDO PRINCIPAL */}
          <div className="app-content">

            {/* MAPA — sempre visível, ocupa toda a área */}
            <div className="map-panel">
              <WorldMap
                countries={filteredCountries}
                onCountryClick={handleCountryClick}
                hoveredCountryId={hoveredCountryId}
              />

              {/* PAINEL FLUTUANTE MOBILE — fica sobre o mapa */}
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

            {/* PAINEL LATERAL — apenas desktop */}
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

      {/* MODAL DE CLIMA */}
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