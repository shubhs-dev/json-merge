const { merge } = require("../src/index");

describe("Index.js", () => {
  describe("parseFile", () => {
    test("should merge the json files present in test/test-data path and return json object", async () => {
      const result = await merge("test/test-data", { recursive: true });
      expect(result["data-1-key-1"]).toBe("data-1-value-1");
      expect(result["data-2-key-1"]).toBe("data-2-value-1");
      expect(Object.keys(result).length).toBe(2);
    });

    test("should only merge json files in the test/test-data path if file name is data-1.json", async () => {
      const result = await merge("test/test-data", {
        recursive: true,
        include: "data-1.json",
      });
      expect(result["data-1-key-1"]).toBe("data-1-value-1");
      expect(Object.keys(result).length).toBe(1);
    });

    test("should only merge json files in the immediate directory test/test-data path", async () => {
      const result = await merge("test/test-data");
      expect(result["data-1-key-1"]).toBe("data-1-value-1");
      expect(Object.keys(result).length).toBe(1);
    });

    test("should merge json files in the test/test-data path but exclude data-1.json", async () => {
      const result = await merge("test/test-data", {
        recursive: true,
        exclude: "data-1.json",
      });
      expect(result["data-2-key-1"]).toBe("data-2-value-1");
      expect(Object.keys(result).length).toBe(1);
    });

    test("should throw error if the file is not a valid json file", async () => {
      try {
        await merge("test/test-data-2", { include: "*.*" });
      } catch (error) {
        expect(error.toString().indexOf("Failed to parse")).not.toBe(-1);
      }
    });
  });
});
