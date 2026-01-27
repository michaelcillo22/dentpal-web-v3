import { collection, addDoc, getFirestore, Timestamp } from 'firebase/firestore';
import firebaseApp from '@/lib/firebase';

const db = getFirestore(firebaseApp);

export async function logStockAdjustment({
  productId,
  productName,
  sellerId,
  userId,
  userName,
  variationId,
  variationName,
  beforeStock,
  afterStock,
  action,
  reason,
  adjustment
}: {
  productId: string;
  productName: string;
  sellerId: string;
  userId: string;
  userName: string;
  variationId: string;
  variationName: string;
  beforeStock: number;
  afterStock: number;
  action: string;
  reason: string;
  adjustment: number;
}) {
  const logsRef = collection(db, 'Product', productId, 'Logs');
  await addDoc(logsRef, {
    action: action || '', // selected reason
    productId: productId || '',
    productName: productName || '',
    sellerId: sellerId || '',
    userId: userId || '',
    userName: userName || '',
    variationId: variationId || '', // selected variation id
    variationName: variationName || '', // selected variation name
    before: {
      stock: beforeStock ?? 0, // in stock
      variationId: variationId || '',
      variationName: variationName || ''
    },
    after: {
      stock: afterStock ?? 0, // add stock
      variationId: variationId || '',
      variationName: variationName || ''
    },
    detail: `Stock adjusted by ${adjustment > 0 ? '+' : ''}${adjustment} for variation "${variationName || ''}"`,
    reason: reason || '', // notes
    adjustment: adjustment ?? 0,
    at: Date.now(),
    createdAt: Timestamp.now()
  });
}
