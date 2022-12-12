import ProductService from "./productService";

describe("Test Pruduct", () => {
  test("should be defined", () => {
    const instance = new ProductService();
    expect(instance).toBeDefined();
  });
});
