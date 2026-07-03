import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { executeSearch, setQuery } from '../store/slices/searchSlice';

export function useSearch(initialQuery = '') {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const { results, loading, cached, filter } = useSelector((state) => state.search);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim().length > 0) {
        dispatch(setQuery(searchTerm));
        dispatch(executeSearch(searchTerm));
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm, dispatch]);

  return {
    searchTerm,
    setSearchTerm,
    results,
    loading,
    cached,
    filter
  };
}
