
import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GameSearchProps {
  onSearch: (query: string) => void;
}

const GameSearch: React.FC<GameSearchProps> = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  // Reset search when component unmounts
  useEffect(() => {
    return () => {
      onSearch('');
    };
  }, [onSearch]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  const clearSearch = () => {
    setSearchQuery('');
    onSearch('');
    setIsExpanded(false);
  };

  return (
    <div className="relative z-10">
      <AnimatePresence>
        {isExpanded ? (
          <motion.div
            initial={{ width: 40, opacity: 0.5 }}
            animate={{ width: "100%", opacity: 1 }}
            exit={{ width: 40, opacity: 0.5 }}
            className="flex items-center"
          >
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search games..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full rounded-full bg-black/20 backdrop-blur-sm border border-betster-700/30 pl-10 pr-10 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-betster-500 focus:border-betster-500"
                autoFocus
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-betster-400" />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-betster-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.button
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0.5 }}
            onClick={() => setIsExpanded(true)}
            className="flex items-center justify-center rounded-full h-9 w-9 bg-black/20 backdrop-blur-sm border border-betster-700/30 hover:bg-betster-800/30"
          >
            <Search className="h-4 w-4 text-betster-400" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GameSearch;
