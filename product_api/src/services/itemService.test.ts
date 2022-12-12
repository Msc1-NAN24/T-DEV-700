import ItemService from "./itemService";

describe("Test Item", () => {
  test("should be defined", () => {
    const instance = new ItemService();
    expect(instance).toBeDefined();
  });
});
