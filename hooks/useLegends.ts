// hooks/useLegends.ts
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export interface Legend {
  id: string;
  title: string;
  description: string;
  category: string;
  latitude: number;
  longitude: number;
  location: string;
  distance?: number;
}

export function useLegends() {
  const [legends, setLegends] = useState<Legend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLegends = async () => {
      try {
        const legendsCol = collection(db, 'legends');
        const legendSnapshot = await getDocs(legendsCol);
        const legendList = legendSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Legend[];
        setLegends(legendList);
      } catch (error) {
        console.error("Error fetching legends:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLegends();
  }, []);

  return { legends, loading };
}
