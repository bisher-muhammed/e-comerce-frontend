import apiPublic from "@/app/lib/api/apiPublic";

export const getProducts = async () => {
  const response = await apiPublic.get("/customer/products");
  return response.data;
};


export const getProductBySlug = async (slug: string) => {
  const response = await apiPublic.get(
    `/customer/products/${slug}`
  );

  return response.data.data;
};
