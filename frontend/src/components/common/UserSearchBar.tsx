import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchUsers } from '@/services/userService';
import { UserSummary } from '@/types/connections';
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
  CommandEmpty,
} from '@/components/ui/command';
import { Loader2, Search, UserCircle, X } from 'lucide-react';
import debounce from 'lodash.debounce';

const UserSearchBar: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<UserSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);

  const debouncedSearch = useCallback(
    debounce(async (term: string) => {
      if (term.trim().length > 1) {
        setIsLoading(true);
        try {
          const data = await searchUsers(term);
          setResults(data);
        } catch (error) {
          console.error('Search failed:', error);
          setResults([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 300),
    [],
  );

  useEffect(() => {
    debouncedSearch(searchTerm);
    return () => debouncedSearch.cancel();
  }, [searchTerm, debouncedSearch]);

  const handleSelect = (userId: string) => {
    setIsOpen(false);
    setSearchTerm('');
    setResults([]);
    navigate(`/profile/${userId}`);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClear = () => {
    setSearchTerm('');
    setResults([]);
    setIsOpen(false);
    const input = searchRef.current?.querySelector('input') as HTMLInputElement | null;
    input?.focus();
  };

  return (
    <div className="relative w-full max-w-xl" ref={searchRef}>
      <Command shouldFilter={false} className="overflow-visible">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <CommandInput
            placeholder="Search people..."
            value={searchTerm}
            onValueChange={setSearchTerm}
            onFocus={() => setIsOpen(true)}
            className="w-full rounded-full py-2 pl-10 pr-10 text-sm focus:outline-none bg-white"
          />
          {isLoading ? (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
          ) : (
            searchTerm.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <X className="w-4 h-4" />
              </button>
            )
          )}
        </div>

        {isOpen && searchTerm.length > 0 && (
          <CommandList className="absolute z-50 top-full mt-2 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
            {isLoading && (
              <div className="p-4 flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            )}
            {!isLoading && results.length === 0 && searchTerm.length > 1 && (
              <CommandEmpty className="p-3 text-sm text-gray-500">No users found.</CommandEmpty>
            )}
            {results.map((user) => (
              <CommandItem
                key={user.id}
                onSelect={() => handleSelect(user.id)}
                className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer"
              >
                {user.photo_url ? (
                  <img
                    src={user.photo_url}
                    alt={user.name}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <UserCircle className="h-8 w-8 text-gray-400" />
                )}
                <div className="flex flex-col text-sm">
                  <span className="font-medium">
                    {user.name} {user.surname}
                  </span>
                  <span className="text-gray-500">{user.job_title || 'Professional'}</span>
                </div>
              </CommandItem>
            ))}
          </CommandList>
        )}
      </Command>
    </div>
  );
};

export default UserSearchBar;
