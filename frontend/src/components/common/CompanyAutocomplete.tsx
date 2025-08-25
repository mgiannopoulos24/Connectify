import React from 'react';
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
  CommandEmpty,
  CommandGroup,
} from '@/components/ui/command';
import { Building, Loader2 } from 'lucide-react';
import { CompanySummary } from '@/types/company';

interface CompanyAutocompleteProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onSelect: (company: CompanySummary | null, name: string) => void;
  results: CompanySummary[] | null;
  isLoading: boolean;
  placeholder?: string;
}

const CompanyAutocomplete: React.FC<CompanyAutocompleteProps> = ({
  searchTerm,
  onSearchChange,
  onSelect,
  results,
  isLoading,
  placeholder = 'e.g., Connectify Inc.',
}) => {
  return (
    <Command shouldFilter={false} className="overflow-visible">
      <CommandInput placeholder={placeholder} value={searchTerm} onValueChange={onSearchChange} />
      {searchTerm.length > 0 && results !== null && (
        <CommandList className="absolute z-50 top-full mt-2 w-full bg-white border rounded-md shadow-lg">
          {isLoading && (
            <div className="p-4 flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          )}
          {!isLoading && results.length === 0 && searchTerm.length > 1 && (
            <CommandEmpty>
              <div
                className="p-2 cursor-pointer hover:bg-accent"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSelect(null, searchTerm);
                }}
              >
                Create new company: "{searchTerm}"
              </div>
            </CommandEmpty>
          )}
          <CommandGroup>
            {results.map((company) => (
              <CommandItem
                key={company.id}
                value={company.name}
                onSelect={() => onSelect(company, company.name)}
                className="flex items-center gap-3"
              >
                {company.logo_url ? (
                  <img
                    src={company.logo_url}
                    alt={company.name}
                    className="h-6 w-6 rounded-full object-contain bg-white"
                  />
                ) : (
                  <Building className="h-6 w-6 text-gray-400" />
                )}
                {company.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      )}
    </Command>
  );
};

export default CompanyAutocomplete;
