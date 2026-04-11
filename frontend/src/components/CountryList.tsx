import { Text } from '@vibe/core';

interface Country {
  id: string;
  name: string;
  column_values: { text: string; column: { title: string } }[];
}

interface CountryListProps {
  countries: Country[];
  onCountryClick: (country: Country) => void;
  onCountryHover: (id: string | null) => void;
}

function CountryList({ countries, onCountryClick, onCountryHover }: CountryListProps) {
  return (
    <ul style={{ listStyleType: 'none', padding: '10px', margin: 0, overflowY: 'auto', flexGrow: 1 }}>
      {countries.map((country) => (
        <li
          key={country.id}
          onClick={() => onCountryClick(country)}
          onMouseEnter={() => onCountryHover(country.id)}
          onMouseLeave={() => onCountryHover(null)}
          style={{
            padding: '12px 15px',
            border: '1px solid #c3c6d4',
            cursor: 'pointer',
            backgroundColor: '#fff',
            marginBottom: '8px',
            borderRadius: '8px',
            transition: 'all 0.2s ease',
          }}
          onMouseOver={(e) => (e.currentTarget.style.borderColor = '#0073ea')}
          onMouseOut={(e) => (e.currentTarget.style.borderColor = '#c3c6d4')}
        >
          <Text type="text1" weight="medium">{country.name}</Text>
        </li>
      ))}
    </ul>
  );
}

export default CountryList;
