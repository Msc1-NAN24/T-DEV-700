import AuthService from "./authService";

describe("Test Auth", () => {
  test("should be defined", () => {
    const instance = new AuthService();
    expect(instance).toBeDefined();
  });
});
