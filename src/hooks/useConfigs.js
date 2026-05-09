import { useState, useEffect } from 'react';
import { configService } from '../services/configService';

export const useConfigs = () => {
  const [config, setConfig] = useState(configService.getDefaultConfig());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchConfigs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await configService.getShopConfig();
      setConfig(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  return { config, loading, error, refetch: fetchConfigs };
};
