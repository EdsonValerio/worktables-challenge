import { useEffect, useState } from 'react';
import {
  Modal,
  ModalContent,
  Text,
  Loader,
  Heading,
} from '@vibe/core';
import './WeatherModal.css';

interface Country {
  id: string;
  name: string;
  column_values: { text: string; column: { title: string } }[];
}

interface WeatherData {
  icon: string;
  temp_c: number;
  condition: string;
}

interface WeatherModalProps {
  selectedCountry: Country | null;
  weatherData: WeatherData | null;
  weatherLoading: boolean;
  weatherError: string;
  onClose: () => void;
}

// Expandimos as estatísticas para aproveitar o Grid de 2 colunas
const STAT_COLUMNS = ['Region', 'Subregion', 'Capital', 'Population', 'Area'];

function WeatherModal({
  selectedCountry,
  weatherData,
  weatherLoading,
  weatherError,
  onClose,
}: WeatherModalProps) {
  const [flagUrl, setFlagUrl] = useState<string | null>(null);

  useEffect(() => {
    setFlagUrl(null);
    if (!selectedCountry) return;

    fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(selectedCountry.name)}`)
      .then((res) => {
        if (!res.ok) throw new Error('País não encontrado');
        return res.json();
      })
      .then((data) => {
        const url = data[0]?.flags?.svg || data[0]?.flags?.png || null;
        setFlagUrl(url);
      })
      .catch(() => setFlagUrl(null));
  }, [selectedCountry]);

  const capitalCol = selectedCountry?.column_values.find(
    (col) => col.column.title === 'Capital'
  );
  const capital = capitalCol?.text || '';
  
  const modalTitle = selectedCountry
    ? capital
      ? `${selectedCountry.name} - ${capital}`
      : selectedCountry.name
    : 'Detalhes';

  const displayCols = selectedCountry?.column_values.filter((col) =>
    STAT_COLUMNS.includes(col.column.title)
  ) ?? [];

  return (
    <Modal id="country-modal" show={!!selectedCountry} onClose={onClose}>
      {/* <ModalHeader title={modalTitle} /> */}
      <ModalContent>
        {selectedCountry && (
          <div className="wm-body">

            {/* CABEÇALHO */}
            <div className="wm-header">
              <div className="wm-flag">
                {flagUrl
                  ? <img src={flagUrl} alt={`Bandeira de ${selectedCountry.name}`} className="wm-flag-img" />
                  : <span className="wm-flag-placeholder">🏳️</span>
                }
              </div>
              <Heading type="h2" className="wm-country-name">
                {modalTitle}
              </Heading>
            </div>

            {/* CARD DE CLIMA (Destaque Azul) */}
            <section className="wm-weather-card">
              <Text type="text1" weight="bold" color="primary">
                Clima Atual (WeatherAPI)
              </Text>

              {weatherLoading && <div style={{ marginTop: '12px' }}><Loader size="small" /></div>}
              {weatherError && <Text type="text2" color="negative" style={{ marginTop: '12px' }}>{weatherError}</Text>}

              {weatherData && (
                <div className="wm-weather-content">
                  <div className="wm-weather-icon-wrapper">
                    <img
                      src={weatherData.icon}
                      alt="Ícone do clima"
                      className="wm-weather-icon"
                    />
                  </div>
                  <div>
                    <Heading type="h2" className="wm-temperature">
                      {weatherData.temp_c}°C
                    </Heading>
                    <Text type="text1" weight="medium" color="secondary">
                      {weatherData.condition}
                    </Text>
                  </div>
                </div>
              )}
            </section>

            {/* CARD DE ESTATÍSTICAS (Grid) */}
            <section className="wm-stats-card">
              <Text type="text1" weight="bold">
                Estatísticas (monday.com)
              </Text>

              <div className="wm-stats-grid">
                {displayCols.map((col, index) => (
                  <div key={index} className="wm-stat-item">
                    <Text type="text3" color="secondary" style={{ textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}>
                      {col.column.title}
                    </Text>
                    <Text type="text1" weight="medium">
                      {col.text || 'N/A'}
                    </Text>
                  </div>
                ))}
              </div>
            </section>

          </div>
        )}
      </ModalContent>
    </Modal>
  );
}

export default WeatherModal;