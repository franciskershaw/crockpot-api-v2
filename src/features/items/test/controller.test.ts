import { Request, Response } from "express";
import { createItemCategory } from "../item.controller";
import { createMockRequestResponse } from "../../../test/utils/testUtils";
import ItemCategory from "../itemCategories/itemCategory.model";
import * as validate from "../../../core/utils/validate";

jest.mock("../../../core/utils/validate");
jest.mock("../itemCategories/itemCategory.model");

describe("Item Controller", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    const mocks = createMockRequestResponse();
    mockRequest = mocks.mockRequest;
    mockResponse = mocks.mockResponse;
    nextFunction = mocks.nextFunction;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createItemCategory", () => {
    it("should create a new item category successfully", async () => {
      // Setup mock data
      const categoryData = {
        name: "Test Category",
        faIcon: "fa-test",
      };
      mockRequest.body = categoryData;

      // Mock validation to return the input data
      (validate.default as jest.Mock).mockReturnValue(categoryData);

      // Mock ItemCategory save method
      const mockSave = jest.fn().mockResolvedValue(true);

      // Mock ItemCategory constructor to return an object with save method
      (ItemCategory as unknown as jest.Mock).mockImplementation(() => ({
        ...categoryData,
        save: mockSave,
      }));

      // Execute the controller function
      await createItemCategory(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      // Assert validation was called with correct schema
      expect(validate.default).toHaveBeenCalledWith(
        categoryData,
        expect.anything()
      );

      // Assert ItemCategory was constructed with correct data
      expect(ItemCategory).toHaveBeenCalledWith(categoryData);

      // Assert save was called
      expect(mockSave).toHaveBeenCalled();

      // Assert response was set correctly
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining(categoryData)
      );
    });

    it("should pass errors to the next middleware", async () => {
      // Setup mock data
      const categoryData = {
        name: "Test Category",
        faIcon: "fa-test",
      };
      mockRequest.body = categoryData;

      // Mock validation to return the input data
      (validate.default as jest.Mock).mockReturnValue(categoryData);

      // Mock error during save
      const mockError = new Error("Database error");
      const mockSave = jest.fn().mockRejectedValue(mockError);

      // Mock ItemCategory constructor
      (ItemCategory as unknown as jest.Mock).mockImplementation(() => ({
        ...categoryData,
        save: mockSave,
      }));

      // Execute the controller function, which should now catch errors
      await createItemCategory(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      // Assert nextFunction was called with the error
      expect(nextFunction).toHaveBeenCalledWith(mockError);
    });
  });
});
