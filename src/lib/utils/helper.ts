import { ShopperType } from '@/types';

export const shopperLookup = (shoppers: ShopperType[]) => {
  console.log(shoppers);
  return new Map<number, string>(
    shoppers.map((shopper: { id: number; name: string }) => [
      shopper.id,
      shopper.name,
    ])
  );
};
