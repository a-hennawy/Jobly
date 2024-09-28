const { sqlForPartialUpdate } = require("./sql");

// two object were made to simulate real data instead of hardcoding in the test function.
dataToUpdate = {
  firstName: "TEST",
  secondName: "DEV",
  age: 27,
};

jsToSql = {
  firstName: "first_name",
  secondName: "second_name",
};

describe("partially updating a user or a company", () => {
  test("Returns query parameterizing in the correct format", () => {
    const result = sqlForPartialUpdate(dataToUpdate, jsToSql);

    expect(result).toEqual({
      setCols: `"first_name"=$1, "second_name"=$2, "age"=$3`,
      values: ["TEST", "DEV", 27],
    });
  });

  test("Throwing error if dataToUpdate is empty", () => {
    expect(() => {
      sqlForPartialUpdate({}, jsToSql);
    }).toThrow("No data");
  });
});
