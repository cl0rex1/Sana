import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

/**
 * Generic data-fetching hook with loading and error states.
 * @param {string} url - API endpoint to fetch from.
 * @param {object} options - { params, immediate }
 */
export const useFetch = (url, options = {}) => {
  const { params = {}, immediate = true } = options;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(
    async (overrideParams = {}) => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(url, {
          params: { ...params, ...overrideParams },
        });
        setData(response.data);
        return response.data;
      } catch (err) {
        setError(err.message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [url] // eslint-disable-line react-hooks/exhaustive-deps
  );

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [immediate, fetchData]);

  return { data, loading, error, refetch: fetchData };
};
