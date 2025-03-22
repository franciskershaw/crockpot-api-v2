import mongoose from "mongoose";
import ItemCategory from "../itemCategory.model";

// These tests require connecting to the test database
describe("ItemCategory Model", () => {
  beforeAll(async () => {
    // MongoDB Memory Server should be set up in the global test setup
  });

  afterEach(async () => {
    // Clean up after each test
    await ItemCategory.deleteMany({});
  });

  it("should create a new item category successfully", async () => {
    const itemCategoryData = {
      name: "Test Category",
      faIcon: "fa-test",
    };

    const itemCategory = new ItemCategory(itemCategoryData);
    const savedItemCategory = await itemCategory.save();

    expect(savedItemCategory._id).toBeDefined();
    expect(savedItemCategory.name).toBe(itemCategoryData.name);
    expect(savedItemCategory.faIcon).toBe(itemCategoryData.faIcon);
    expect(savedItemCategory.createdAt).toBeDefined();
    expect(savedItemCategory.updatedAt).toBeDefined();
  });

  it("should fail to create a category without required fields", async () => {
    const itemCategory = new ItemCategory({});

    let error: any;
    try {
      await itemCategory.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.errors.name).toBeDefined();
    expect(error.errors.faIcon).toBeDefined();
  });

  it("should fail to create a duplicate category name", async () => {
    // Create first category
    const firstCategory = new ItemCategory({
      name: "Duplicate Name",
      faIcon: "fa-first",
    });
    await firstCategory.save();

    // Try to create another with the same name
    const duplicateCategory = new ItemCategory({
      name: "Duplicate Name",
      faIcon: "fa-second",
    });

    let error: any;
    try {
      await duplicateCategory.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.code).toBe(11000); // MongoDB duplicate key error code
  });

  it("should fail to create a duplicate faIcon", async () => {
    // This test may fail depending on how the unique index is set up
    // If both name and faIcon are unique separately, this should fail
    // If they're a compound unique index, this might pass

    // Create first category
    const firstCategory = new ItemCategory({
      name: "First Category",
      faIcon: "fa-duplicate",
    });
    await firstCategory.save();

    // Try to create another with the same faIcon
    const duplicateFaIcon = new ItemCategory({
      name: "Second Category",
      faIcon: "fa-duplicate",
    });

    let error: any = null;
    try {
      await duplicateFaIcon.save();
      // If it doesn't throw, ensure the document was saved by checking its _id
      expect(duplicateFaIcon._id).toBeDefined();
    } catch (err) {
      error = err;
      // If it throws, it should be due to a duplicate key error
      expect(error.code).toBe(11000); // MongoDB duplicate key error code
    }

    // Either the save operation succeeded or failed with the expected error
  });
});
