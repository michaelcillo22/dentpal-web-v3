import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function useProductVariations() {
  const [variations, setVariations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchVariations = async (productId: string) => {
    setLoading(true);
    setError('');
    try {
      const variationsRef = collection(db, `Product/${productId}/Variation`);
      const variationsSnap = await getDocs(variationsRef);
      const vars = variationsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setVariations(vars);
    } catch (err) {
      setError('Failed to fetch variations.');
      setVariations([]);
    }
    setLoading(false);
  };

  return { variations, loading, error, fetchVariations };
}
