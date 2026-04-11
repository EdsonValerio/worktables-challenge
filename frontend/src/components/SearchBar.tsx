import { Search, Text, Dropdown, Flex } from '@vibe/core';

// Definimos como as opções do Dropdown devem ser
interface RegionOption {
  label: string;
  value: string;
}

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  resultsCount: number;

  // Novas props para o filtro de Região
  availableRegions: RegionOption[];
  selectedRegion: string;
  onRegionChange: (value: string) => void;
}

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
      {/* Usamos o Flex para empilhar a busca e o filtro bonitinho */}
      <Flex direction="column" gap="small">
        <Search
          placeholder="Pesquise um país..."
          value={searchTerm}
          onChange={(value: string) => onSearchChange(value)}
        />

        <Dropdown
          placeholder="Filtrar por Continente"
          options={availableRegions}
          // O Vibe precisa do objeto { label, value } completo no state
          value={selectedRegion ? { label: selectedRegion, value: selectedRegion } : null}
          // Quando o usuário escolhe algo, ou limpa no "x", atualizamos o estado
          onChange={(option: any) => onRegionChange(option ? option.value : '')}
          clearable // Adiciona o "X" para limpar o filtro
        />
      </Flex>

      <Text type="text2" color="secondary" style={{ marginTop: '10px' }}>
        Mostrando {resultsCount} resultados.
      </Text>
    </div>
  );
}

export default SearchBar;