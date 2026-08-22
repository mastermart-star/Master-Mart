export type Product = {
  _id: string;
  slug: string;
  nameEn: string;
  nameBn: string;
  category: string;
  price: number;
  discountPrice?: number | null;
  unitEn: string;
  unitBn: string;
  rating: number;
  image: string;
  stock: number;
  isVeg: boolean;
  descriptionEn?: string;
  descriptionBn?: string;
  createdAtUtc: string;
  updatedAtUtc: string;
};

export type Category = {
  id: string;
  nameEn: string;
  nameBn: string;
  icon: string;
  color: string;
};
