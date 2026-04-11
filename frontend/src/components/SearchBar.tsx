// frontend/src/components/SearchBar.tsx
// Componente de busca e filtro — campo de texto + dropdown de continentes

import { Search, Text, Dropdown, Flex } from '@vibe/core';

// --- Tipos ---
interface RegionOption {
  label: string;
  value: string;
}

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  resultsCount: number;
  availableRegions: RegionOption[];
  selectedRegion: string;
  onRegionChange: (value: string) => void;
}

// --- Componente ---
function SearchBar({
  searchTerm,
  onSearchChange,
  resultsCount,
  availableRegions,
  selectedRegion,
  onRegionChange,
}: SearchBarProps) {
  return (
    <div style={{ padding: '20px', backgroundColor: '#fff', borderBottom: '1px solid #e1e2e9' }}>
      <Flex direction="column" gap="small">

        {/* Campo de busca por nome */}
        <Search
          placeholder="Pesquise um país..."
          value={searchTerm}
          onChange={(value: string) => onSearchChange(value)}
        />

        {/* Dropdown de filtro por continente */}
        <Dropdown
          placeholder="Filtrar por Continente"
          options={availableRegions}
          value={selectedRegion ? { label: selectedRegion, value: selectedRegion } : null}
          onChange={(option: any) => onRegionChange(option ? option.value : '')}
          clearable
        />

      </Flex>

      {/* Contagem de resultados visíveis */}
      <Text type="text2" color="secondary" style={{ marginTop: '10px' }}>
        Mostrando {resultsCount} resultados.
      </Text>
    </div>
  );
}

export default SearchBar;