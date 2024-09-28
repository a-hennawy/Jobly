const { BadRequestError } = require("../expressError");

// THIS NEEDS SOME GREAT DOCUMENTATION.

/*
sqlForPartialUpdate will take two arguments: 

dataToUpdate --> is the data to be updated
jsToSql --> is an object containing the Js representation of keys in SQL

It will use Object.keys to store the keys of dataToUpdate in array variable "keys".

If "keys" is empty, it implies that no data was passed and a BadRequestError will be thrown.

If no error is thrown, it maps the "keys" array to an array variable "cols". So that array will look like this: ['"first_name"=$1', '"age"=$2'].

The argument jsToSql is supposed to contain an object that shows the representation of js variables in sql. object keys are js variables, and the values are SQL column name.
jsToSql example: { "firstName" : "first_name", "secondName" : "second_name" }.

Using it in the mapping process to use the correct query parameterizing, if js variable isnt avaiable as a key, it will return the js variable.

finally an object is returned, the keys setCols and values contain arrays of parameterized query clauses and the values that will be passed as an argument to db.query.
*/

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map(
    (colName, idx) => `"${jsToSql[colName] || colName}"=$${idx + 1}`
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
