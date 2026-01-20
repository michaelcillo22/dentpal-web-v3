import React from 'react';
import { Order } from '@/types/order';
import OrderRow from '../parts/OrderRow';

interface ViewProps { 
  orders: Order[]; 
  onSelectOrder?: (o: Order) => void; 
}

/**
 * CompletedOrdersView - Display completed orders
 * 
 * Completed orders are those that have been:
 * - Delivered to the customer
 * - Manually confirmed as received by the customer
 * - Stock has been deducted
 * - Transaction is finalized
 */
const CompletedOrdersView: React.FC<ViewProps> = ({ orders, onSelectOrder }) => {
  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-lg font-medium text-gray-900 mb-2">No completed orders</p>
        <p className="text-gray-500">Completed orders will appear here after customers confirm receipt</p>
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

export default CompletedOrdersView;
