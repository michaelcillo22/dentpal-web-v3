import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import firebaseApp from '@/lib/firebase';

const db = getFirestore(firebaseApp);

export interface LogHistoryRow {
  timestamp: string;
  itemName: string;
  variant: string;
  account: string;
  reason: string;
  adjustment: string;
  stockAfter: number;
}

export function useLogsHistory(productId: string) {
  const [logs, setLogs] = useState<LogHistoryRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    const fetchLogs = async () => {
      const logsRef = collection(db, 'Product', productId, 'Logs');
      const q = query(logsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const rows: LogHistoryRow[] = snapshot.docs.map(doc => {
        const d = doc.data();
        return {
          timestamp: d.createdAt?.toDate ? d.createdAt.toDate().toLocaleString() : '',
          itemName: d.productName || '',
          variant: d.variationName || '',
          account: d.userName || d.userId || '',
          reason: d.reason || '',
          adjustment: (d.adjustment > 0 ? '+' : '') + d.adjustment,
          stockAfter: d.after?.stock ?? d.stockAfter ?? 0,
        };
      });
      setLogs(rows);
      setLoading(false);
    };
    fetchLogs();
  }, [productId]);

  return { logs, loading };
}
