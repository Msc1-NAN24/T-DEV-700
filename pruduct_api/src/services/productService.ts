import { Product } from "@prisma/client";
import { prisma } from "..";

export default class ProductService {
  create = async (newProduct: any) => {
    const product = await prisma.product.create({
      data: { ...newProduct },
    });
    console.log("create", { product });
    return product;
  };

  getAll = async (): Promise<Product[]> => {
    const allProducts = await prisma.product.findMany();

    return allProducts;
  };

  getById = async (id: string) => {
    const product = await prisma.product.findMany();
    return product;
  };

  update = async (id: string, productUpdate: Partial<Product>) => {
    const product = await prisma.product.update({
      where: {
        id,
      },
      data: { ...productUpdate },
    });
    return product;
  };

  deleteProduct = async (id: string, productUpdate: Partial<Product>) => {
    const product = await prisma.product.delete({
      where: {
        id,
      },
    });
    return product;
  };
}
