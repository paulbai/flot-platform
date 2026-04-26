export type OrderStatus = 'pending' | 'confirmed' | 'fulfilled' | 'cancelled';

export const ORDER_STATUSES: readonly OrderStatus[] = [
  'pending',
  'confirmed',
  'fulfilled',
  'cancelled',
] as const;

export type OrderVertical = 'hotel' | 'restaurant' | 'store' | 'travel';

export interface OrderDetailsHotel {
  checkIn?: string;
  checkOut?: string;
  nights: number;
  guests: number;
  roomId: string;
}

export interface OrderDetailsAddressed {
  deliveryAddress: string;
}

export type OrderDetails =
  | OrderDetailsHotel
  | OrderDetailsAddressed
  | Record<string, unknown>;
