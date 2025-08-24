import React, { useState, useCallback } from 'react';
import { Skill } from '@/types/skill';
import { searchSkills } from '@/services/skillService';
import debounce from 'lodash.debounce';
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
  CommandEmpty,
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { X as XIcon, Loader2 } from 'lucide-react';

interface SkillMultiSelectProps {
  selectedSkills: Skill[];
  onSelectionChange: (skills: Skill[]) => void;
}

const SkillMultiSelect: React.FC<SkillMultiSelectProps> = ({
  selectedSkills,
  onSelectionChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const debouncedSearch = useCallback(
    debounce(async (term: string) => {
      if (term) {
        setIsLoading(true);
        const fetchedSkills = await searchSkills(term);
        const selectedIds = new Set(selectedSkills.map((s) => s.id));
        setResults(fetchedSkills.filter((skill) => !selectedIds.has(skill.id)));
        setIsLoading(false);
      } else {
        setResults([]);
      }
    }, 300),
    [selectedSkills],
  );

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    debouncedSearch(term);
  };

  const handleSelect = (skill: Skill) => {
    onSelectionChange([...selectedSkills, skill]);
    setSearchTerm('');
    setResults([]);
  };

  const handleRemove = (skillId: string) => {
    onSelectionChange(selectedSkills.filter((s) => s.id !== skillId));
  };

  return (
    <div className="space-y-2">
      <Command shouldFilter={false} className="overflow-visible">
        <CommandInput
          placeholder="Search for skills to add..."
          value={searchTerm}
          onValueChange={handleSearchChange}
        />
        {searchTerm.length > 0 && (
          <CommandList className="absolute z-50 top-full mt-2 w-full bg-white border rounded-md shadow-lg">
            {isLoading && (
              <div className="p-4 flex items-center justify-center z-50">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            )}
            {!isLoading && results.length === 0 && <CommandEmpty>No skills found.</CommandEmpty>}
            {results.map((skill) => (
              <CommandItem key={skill.id} onSelect={() => handleSelect(skill)}>
                {skill.name}
              </CommandItem>
            ))}
          </CommandList>
        )}
      </Command>
      <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[40px]">
        {selectedSkills.map((skill) => (
          <Badge key={skill.id} variant="secondary">
            {skill.name}
            <button
              onClick={() => handleRemove(skill.id)}
              className="ml-2 rounded-full hover:bg-gray-300"
            >
              <XIcon className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default SkillMultiSelect;
