const partialUpdate = require("../../helpers/partialUpdate");

describe("partialUpdate() test", () => {

  it("should generate a proper partial update query with just 1 field", () => {
    const testQuery = partialUpdate(
      "test", 
      { "test_field": "test_value" }, 
      "test_key", 
      1
    );
    const resultString = "UPDATE test SET test_field=$1 WHERE test_key=$2 RETURNING *"
    const resultParams = ['test_value', 1]
    expect(testQuery.query).toEqual(resultString);
    expect(testQuery.values).toEqual(resultParams);
  });

  it("should generate a proper partial update query with more than 1 field", () => {
    const testQuery = partialUpdate(
      "test", 
      {
        "test_field": "test_value",
        "test_field2": "test_value2",
      }, 
      "test_key", 
      1
    );
    const resultString = "UPDATE test SET test_field=$1, test_field2=$2 WHERE test_key=$3 RETURNING *"
    const resultParams = ['test_value', 'test_value2', 1]
    expect(testQuery.query).toEqual(resultString);
    expect(testQuery.values).toEqual(resultParams);
  })
});
