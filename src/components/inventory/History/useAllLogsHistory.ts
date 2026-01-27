import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, collectionGroup } from 'firebase/firestore';
import SellersService, { SellerProfile } from '@/services/sellers';
import { getFirestore } from 'firebase/firestore';
import firebaseApp from '@/lib/firebase';

const db = getFirestore(firebaseApp);

export interface LogHistoryRow {
  timestamp: string; // locale string for display
  timestampRaw: string | number; // ISO string or epoch ms for stable filtering
  action: string;
  adjustment: number;
  afterStock: number;
  beforeStock: number;
  variationId: string;
  variationName: string;
  productId: string;
  productName: string;
  reason: string;
  userId: string;
  userName: string;
  detail: string;
  modifiedByName?: string;
}

export function useAllLogsHistory() {
  const [logs, setLogs] = useState<LogHistoryRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        console.log('Fetching logs from Firebase...');
        
        // Use collectionGroup to fetch all Logs subcollections across all Products
        const logsRef = collectionGroup(db, 'Logs');
        const q = query(logsRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        
        console.log('Snapshot size:', snapshot.size);
        console.log('Documents found:', snapshot.docs.length);
        
        if (snapshot.empty) {
          console.warn('No logs found in Firebase');
        }
        
        // Fetch all unique userIds
        const docsData = snapshot.docs.map(doc => doc.data());
        const userIds = Array.from(new Set(docsData.map(d => d.userId).filter(Boolean)));
        // Fetch all user profiles in parallel, tolerate failures
        const userProfiles: Record<string, SellerProfile | null> = {};
        const profileResults = await Promise.allSettled(userIds.map(uid => SellersService.get(uid)));
        userIds.forEach((uid, idx) => {
          const result = profileResults[idx];
          if (result.status === 'fulfilled') {
            userProfiles[uid] = result.value;
          } else {
            userProfiles[uid] = null;
          }
        });

        const rows: LogHistoryRow[] = docsData.map(d => {
          const modifiedByName = d.userId && userProfiles[d.userId]?.name ? userProfiles[d.userId]?.name : d.userId || '';
          let timestampRaw: string | number = '';
          let dateObj: Date | null = null;
          if (d.createdAt?.toDate) {
            dateObj = d.createdAt.toDate();
            timestampRaw = dateObj.toISOString(); // ISO string for stable parsing
          } else if (d.createdAt?._seconds) {
            dateObj = new Date(d.createdAt._seconds * 1000);
            timestampRaw = d.createdAt._seconds * 1000; // epoch ms fallback
          }
          return {
            timestamp: dateObj ? dateObj.toLocaleString() : '',
            timestampRaw,
            action: d.action || '',
            adjustment: d.adjustment ?? 0,
            afterStock: d.after?.stock ?? 0,
            beforeStock: d.before?.stock ?? 0,
            variationId: d.variationId || '',
            variationName: d.variationName || '',
            productId: d.productId || '',
            productName: d.productName || '',
            reason: d.reason || '',
            userId: d.userId || '',
            userName: d.userName || '',
            detail: d.detail || '',
            modifiedByName,
          };
        });
        setLogs(rows);
      } catch (error) {
        console.error('Error fetching logs:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLogs();
  }, []);

  return { logs, loading };
}
