import { Prisma, Product } from "@prisma/client";
import prisma from "../client";

export default class ProductService {
  create = async (newProduct: Prisma.ProductCreateInput) => {
    const product = await prisma.product.create({
      data: newProduct,
    });
    return product;
  };

  getAll = async (): Promise<Product[]> => {
    const allProducts = await prisma.product.findMany();

    return allProducts;
  };

  getById = async (id: string) => {
    const product = await prisma.product.findFirst({ where: { id } });
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

  deleteProduct = async (id: string) => {
    const product = await prisma.product.delete({
      where: {
        id,
      },
    });
    return product;
  };
}
