import apiPrivate from "@/app/lib/api/apiPrivate";

import type {
  CreateProductFormData,
  UpdateProductFormData,
  NewProductImageFormData,
  ProductImageFormData,
} from "@/app/validations/admin/product.validation";


const isNewProductImage = (
  image: ProductImageFormData
): image is NewProductImageFormData => "file" in image;


export const getProducts = async () => {
  return apiPrivate.get("/admin/products");
};



export const getProductById = async (id: number) => {
  return apiPrivate.get(`/admin/products/${id}`);
};


export const createProduct = async (
  data: CreateProductFormData
) => {
  const formData = new FormData();
  let fileIndex = 0;

  const productData = {
    name: data.name,
    slug: data.slug,
    description: data.description ?? "",
    details: data.details ?? "",
    categoryId: data.categoryId,
    isActive: data.isActive,

    colors: data.colors.map((color) => ({
      colorId: color.colorId,

      images: color.images.map((image) => {
        formData.append("images", image.file);

        return {
          fileIndex: fileIndex++,
          altText: image.altText ?? "",
          sortOrder: image.sortOrder,
          isPrimary: image.isPrimary,
        };
      }),

      variants: color.variants.map((variant) => ({
        sizeId: variant.sizeId,
        price: variant.price,
        stock: variant.stock,
      })),
    })),
  };

  formData.append("data", JSON.stringify(productData));

  return apiPrivate.post("/admin/products", formData);
};


export const updateProduct = async (
  id: number,
  data: UpdateProductFormData,
  removedColorIds?: number[]
) => {
  const formData = new FormData();

  const productData: Record<string, unknown> = {};

  if (data.name !== undefined) {
    productData.name = data.name;
  }

  if (data.slug !== undefined) {
    productData.slug = data.slug;
  }

  if (data.description !== undefined) {
    productData.description = data.description;
  }

  if (data.details !== undefined) {
    productData.details = data.details;
  }

  if (data.categoryId !== undefined) {
    productData.categoryId = data.categoryId;
  }

  if (data.isActive !== undefined) {
    productData.isActive = data.isActive;
  }

  if (data.colors !== undefined) {
    let fileIndex = 0;

    productData.colors = data.colors.map((color) => ({
      colorId: color.colorId,

      images: color.images.map((image) => {
        if (isNewProductImage(image)) {
          formData.append("images", image.file);

          return {
            fileIndex: fileIndex++,
            altText: image.altText ?? "",
            sortOrder: image.sortOrder,
            isPrimary: image.isPrimary,
          };
        }

        return {
          existing: true as const,
          id: image.id,
          altText: image.altText ?? "",
          sortOrder: image.sortOrder,
          isPrimary: image.isPrimary,
        };
      }),

      variants: color.variants.map((variant) => ({
        sizeId: variant.sizeId,
        price: variant.price,
        stock: variant.stock,
      })),
    }));
  }

  if (removedColorIds && removedColorIds.length > 0) {
    productData.removedColorIds = removedColorIds;
  }

  formData.append("data", JSON.stringify(productData));

  return apiPrivate.patch(`/admin/products/${id}`, formData);
};


export const deleteProduct = async (id: number) => {
  return apiPrivate.delete(`/admin/products/${id}`);
};
