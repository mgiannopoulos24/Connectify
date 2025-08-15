import React from 'react';
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
  CommandEmpty,
  CommandGroup,
} from '@/components/ui/command';
import { Sparkles, Loader2 } from 'lucide-react';
import { Skill } from '@/types/skill';

interface SkillAutocompleteProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onSelect: (skillName: string) => void;
  results: Skill[];
  isLoading: boolean;
  placeholder?: string;
}

const SkillAutocomplete: React.FC<SkillAutocompleteProps> = ({
  searchTerm,
  onSearchChange,
  onSelect,
  results,
  isLoading,
  placeholder = 'e.g., React.js',
}) => {
  return (
    <Command shouldFilter={false} className="overflow-visible">
      <CommandInput
        placeholder={placeholder}
        value={searchTerm}
        onValueChange={onSearchChange}
      />
      {searchTerm.length > 0 && (
        <CommandList className="absolute z-10 top-full mt-2 w-full bg-white border rounded-md shadow-lg">
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
                  onSelect(searchTerm);
                }}
              >
                Add new skill: "{searchTerm}"
              </div>
            </CommandEmpty>
          )}
          <CommandGroup>
            {results.map((skill) => (
              <CommandItem
                key={skill.id}
                value={skill.name}
                onSelect={() => onSelect(skill.name)}
                className="flex items-center gap-3"
              >
                <Sparkles className="h-5 w-5 text-gray-400" />
                {skill.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      )}
    </Command>
  );
};

export default SkillAutocomplete;