import { useState, useEffect } from 'react';
import { autonomyStore, AutonomyDetails, AutonomyLevelKey, AUTONOMY_LEVELS } from '../services/autonomy';

export const useAutonomy = () => {
  const [autonomyDetails, setAutonomyDetails] = useState<AutonomyDetails>(autonomyStore.getDetails());

  useEffect(() => {
    const unsubscribe = autonomyStore.subscribe((details) => {
      setAutonomyDetails(details);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const setAutonomyLevel = async (level: AutonomyLevelKey) => {
    return autonomyStore.setLevel(level);
  };

  return {
    autonomyLevel: autonomyDetails.level,
    autonomyDetails,
    autonomyLevels: AUTONOMY_LEVELS,
    setAutonomyLevel,
  };
};
