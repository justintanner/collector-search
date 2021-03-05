import appRoot from "app-root-path";
import csvToJson from "convert-csv-to-json";
import fs from "fs";

function jsonFixture(filename) {
  return JSON.parse(fixture(filename));
}

function jsonFixtureFromCSV(filename) {
  return csvToJson.fieldDelimiter(";").getJsonFromCsv(fixturePath(filename));
}

function fixture(filename) {
  return fs.readFileSync(fixturePath(filename), "utf8");
}

function fixturePath(filename) {
  return appRoot + "/tests/fixtures/" + filename;
}

export { fixture, jsonFixture, jsonFixtureFromCSV };
