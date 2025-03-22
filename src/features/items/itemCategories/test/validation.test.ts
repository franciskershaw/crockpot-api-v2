import { createItemCategorySchema } from "../itemCategory.validate";

describe("Item Category Validation", () => {
  describe("createItemCategorySchema", () => {
    it("should validate valid data", () => {
      const validData = {
        name: "Test Category",
        faIcon: "fa-test",
      };

      const result = createItemCategorySchema.validate(validData);
      expect(result.error).toBeUndefined();
      expect(result.value).toEqual(validData);
    });

    it("should reject data without name", () => {
      const invalidData = {
        faIcon: "fa-test",
      };

      const result = createItemCategorySchema.validate(invalidData);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('"name" is required');
    });

    it("should reject data without faIcon", () => {
      const invalidData = {
        name: "Test Category",
      };

      const result = createItemCategorySchema.validate(invalidData);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('"faIcon" is required');
    });

    it("should reject data with invalid types", () => {
      const invalidData = {
        name: 123,
        faIcon: true,
      };

      const result = createItemCategorySchema.validate(invalidData);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('"name" must be a string');
    });
  });
});
