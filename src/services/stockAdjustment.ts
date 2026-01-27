import { doc, updateDoc, writeBatch, getFirestore } from 'firebase/firestore';
import firebaseApp from '../lib/firebase';

const db = getFirestore(firebaseApp);


export async function adjustVariationStock(productId: string, variationId: string, newStock: number) {
  const variationRef = doc(db, 'Product', productId, 'Variation', variationId);
  await updateDoc(variationRef, { stock: newStock });
}


export async function batchAdjustVariationStock(productId: string, adjustments: { variationId: string; newStock: number }[]) {
  const batch = writeBatch(db);
  adjustments.forEach(({ variationId, newStock }) => {
    const variationRef = doc(db, 'Product', productId, 'Variation', variationId);
    batch.update(variationRef, { stock: newStock });
  });
  await batch.commit();
}
