import { prismaMock } from "../singleton";
import OrderService from "./orderService";

describe("Test Order", () => {
  beforeEach(() => {
    prismaMock.user.deleteMany();
  });
  test("should be defined", () => {
    const instance = new OrderService();
    expect(instance).toBeDefined();
  });
});
