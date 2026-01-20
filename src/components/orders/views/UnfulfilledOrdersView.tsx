import React from 'react';
import { Order } from '@/types/order';
import OrderRow from '../parts/OrderRow';

interface ViewProps { 
  orders: Order[]; 
  onSelectOrder?: (o: Order) => void; 
}

/**
 * UnfulfilledOrdersView - Display unfulfilled orders
 * 
 * Unfulfilled orders include:
 * - Cancelled orders (customer or admin cancelled)
 * - Failed delivery orders (delivery attempt failed)
 * 
 * These orders were not successfully completed.
 */
const UnfulfilledOrdersView: React.FC<ViewProps> = ({ orders, onSelectOrder }) => {
  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <p className="text-lg font-medium text-gray-900 mb-2">No unfulfilled orders</p>
        <p className="text-gray-500">Cancelled and failed delivery orders will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map(order => (
        <OrderRow 
          key={order.id} 
          order={order} 
          onDetails={() => onSelectOrder?.(order)} 
        />
      ))}
    </div>
  );
};

export default UnfulfilledOrdersView;
