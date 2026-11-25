export type ApiError = {
  error: string;
  issues?: Array<{ path: string; message: string }>;
};

export type PublicProduct = {
  id: string;
  name: string;
  description: string;
  category: string;
  image: string;
  sampleAvailable: boolean;
  isActive: boolean;
  createdAt: string;
};
