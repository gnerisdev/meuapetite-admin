import { useState } from 'react';
import * as S from './style';

const Filter = ({ filters, onApplyFilters }) => {
  const [selectedFilters, setSelectedFilters] = useState({});

  const handleFilterChange = (filterName, value) => {
    const newFilters = { ...selectedFilters, [filterName]: value };
    setSelectedFilters(newFilters);
  };

  const applyFilters = () => onApplyFilters(selectedFilters);

  return (
    <S.ContainerMain>
      <S.FilterContainer>
        {filters.map((filter) => (
          <div key={filter.name} style={{ display: 'flex', flexDirection: 'column' }}>
            <label htmlFor={filter.name}>{filter.label}</label>
            {filter.type === 'text' && (
              <input
                type="text"
                id={filter.name}
                value={selectedFilters[filter.name] || ''}
                placeholder={filter.placeholder}
                onChange={(e) => handleFilterChange(filter.name, e.target.value)}
              />
            )}

            {filter.type === 'date' && (
              <input
                type="date"
                id={filter.name}
                value={selectedFilters[filter.name] || ''}
                onChange={(e) => handleFilterChange(filter.name, e.target.value)}
              />
            )}

            {filter.type === 'select' && (
              <select
                id={filter.name}
                value={selectedFilters[filter.name] || ''}
                onChange={(e) => handleFilterChange(filter.name, e.target.value)}
              >
                <option value="">{filter.placeholder}</option>
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        ))}
      </S.FilterContainer>

      <S.ContainerButton>
        <S.ButtonFilter variant="outlined" onClick={applyFilters}>
          Limpar
        </S.ButtonFilter>
        <S.ButtonFilter variant="contained" onClick={applyFilters}>
          Filtrar
        </S.ButtonFilter>
        </S.ContainerButton>
    </S.ContainerMain>
  );
};

export default Filter;
