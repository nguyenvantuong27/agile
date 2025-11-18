// IEmployeeResponse.ts
export interface IEmployeeResponse {
  data: IEmployee[];
  total: number;
  limit: number;
  page: number;
}

// IEmployeeDetailResponse.ts
export interface IEmployeeDetailResponse {
  data: IEmployee;
}

export interface IEmployee {
  _id: string;
  full_name: string;
  email: string;
  phone: string;
  sex: number;
  status: number; // active/inactive
  role: string; // employee role
  createdAt: string;
  updatedAt: string;
}
