import test from "ava";
import _ from "lodash";
import { jsonFixture, jsonFixtureFromCSV } from "./helpers/fixture_helper.js";
import TuckCollectorSearch from "../src/tuck_collector_search.js";
import SsSearchWrapper from "../src/ss_search_wrapper.js";

let tcs;

test.before((t) => {
  let documents = jsonFixture("db.json");

  documents = _.sortBy(documents, "order");

  const searchKeys = _.chain(documents)
    .first()
    .keysIn()
    .without("id", "set_url", "order")
    .value();

  tcs = TuckCollectorSearch(SsSearchWrapper({ documents, searchKeys }));
});

test("returns the same results in the same order as postgres for the query BROADSTAIRS", (t) => {
  const queryAndIds = jsonFixtureFromCSV("BROADSTAIRS.csv")[0];

  const results = tcs.search(queryAndIds.query);

  const actualIds = _.map(results, (result) => _.parseInt(result.id));
  const expectedIds = _.map(queryAndIds.ids.split(","), _.parseInt);

  t.deepEqual(actualIds, expectedIds);
});

test("returns the same results in the same order as postgres for the query Dachshund", (t) => {
  const queryAndIds = jsonFixtureFromCSV("Dachshund.csv")[0];

  const results = tcs.search(queryAndIds.query);

  const actualIds = _.map(results, (result) => _.parseInt(result.id));
  const expectedIds = _.map(queryAndIds.ids.split(","), _.parseInt);

  t.deepEqual(actualIds, expectedIds);
});

test("returns the same results in the same order as postgres for the query Minehead", (t) => {
  const queryAndIds = jsonFixtureFromCSV("Minehead.csv")[0];

  const results = tcs.search(queryAndIds.query);

  const actualIds = _.map(results, (result) => _.parseInt(result.id));
  const expectedIds = _.map(queryAndIds.ids.split(","), _.parseInt);

  t.deepEqual(actualIds, expectedIds);
});

test("matches records that have a prefix and number without a space", (t) => {
  const results = tcs.search("C4056");

  const prefixes = _.map(results, "prefix");
  const numbers = _.map(results, "number");

  t.deepEqual(prefixes, ["C", "C"]);
  t.deepEqual(numbers, [4056, 4056]);
});

test("matches records that have a number and in_set without a space", (t) => {
  const results = tcs.search("69203");

  t.is(results.length, 1);

  const number = results[0].number;
  const in_set = results[0].in_set;

  t.is(number, 692);
  t.is(in_set, "03");
});

// test("matches a prefix with dots", (t) => {
//   const results = tcs.search("B.K.W.I.");
//
//   t.is(results.length, 1);
//   t.is(results.prefix, "B.K.W.I");
// });
