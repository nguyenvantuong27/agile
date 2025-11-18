export interface ListProduct {
  _id?: string;
  name?: string;
  description?: string;
}

export interface Product {
  _id?: string;
  name: string;
  price: string;
  price_sale: string;
  description: string;
  image: string;
  status: string;
  createdAt?: string;
  list_product_id?: ListProduct;
  category_id?: Category | string;
}

export interface Category {
  _id?: string;
  name?: string;
  create_by?: User | string;
}

export interface User {
  _id: string;
  username: string;
  password: string;
  full_name: string;
  email: string;
  phone: string;
  status: number;
  sex: number;
  image: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
  branch_id?: Branch;
}

export interface Branch {
  _id: string;
  list_product_id: string;
  description: string;
  name: string;
  phone: string;
  status: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}
