import test from "ava";
import _ from "lodash";
import { jsonFixture, jsonFixtureFromCSV } from "./helpers/fixture_helper.js";
import CollectorSearch from "../src/collector_search.js";

let cs;

test.before((t) => {
  let documents = jsonFixture("db.json");

  documents = _.sortBy(documents, "order");

  cs = CollectorSearch({
    documents,
    keysToExclude: ["id", "url", "set_url", "order"],
    perPage: 300,
  });
});

test("returns the same results in the same order as postgres for the query BROADSTAIRS", (t) => {
  const queryAndIds = jsonFixtureFromCSV("BROADSTAIRS.csv")[0];

  const results = cs.search(queryAndIds.query);

  const actualIds = _.map(results, (result) => _.parseInt(result.id));
  const expectedIds = _.map(queryAndIds.ids.split(","), _.parseInt);

  t.deepEqual(actualIds, expectedIds);
});

test("returns the same results in the same order as postgres for the query Dachshund", (t) => {
  const queryAndIds = jsonFixtureFromCSV("Dachshund.csv")[0];

  const results = cs.search(queryAndIds.query);

  const actualIds = _.map(results, (result) => _.parseInt(result.id));
  const expectedIds = _.map(queryAndIds.ids.split(","), _.parseInt);

  t.deepEqual(actualIds, expectedIds);
});

test("returns the same results in the same order as postgres for the query Minehead", (t) => {
  const queryAndIds = jsonFixtureFromCSV("Minehead.csv")[0];

  const results = cs.search(queryAndIds.query);

  const actualIds = _.map(results, (result) => _.parseInt(result.id));
  const expectedIds = _.map(queryAndIds.ids.split(","), _.parseInt);

  t.deepEqual(actualIds, expectedIds);
});

test("matches records that have a prefix and number without a space", (t) => {
  const results = cs.search("C4056");

  const prefixes = _.map(results, "prefix");
  const numbers = _.map(results, "number");

  t.deepEqual(prefixes, ["C", "C"]);
  t.deepEqual(numbers, [4056, 4056]);
});

test("matches records that have a number and in_set without a space", (t) => {
  const results = cs.search("69203");

  t.is(results.length, 1);

  const number = results[0].number;
  const in_set = results[0].in_set;

  t.is(number, 692);
  t.is(in_set, "03");
});

test("searches for number ranges", (t) => {
  const results = cs.search("number: 9000-9001");

  const numbersInOrder = _.chain(results).map("number").sort().value();

  t.is(numbersInOrder[0], 9000);
  t.is(numbersInOrder[numbersInOrder.length - 1], 9001);
});

test("matches more than one token", (t) => {
  const results = cs.search("wishes C4056 best");

  t.is(results.length, 1);
  t.is(results[0].id, 1570);
});
