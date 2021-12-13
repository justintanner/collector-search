import test from "ava";
import _ from "lodash";
import CollectorSearch from "../src/collector_search.js";

test("extracts advanced options from a search query", (t) => {
  const cs = CollectorSearch({ documents: [] });

  const { remainingQuery, options } = cs.__extractOptionsFromQuery(
    "abc number: 1-101 prefix:A"
  );

  t.is(remainingQuery, "abc");
  t.is(options.number, "1-101");
  t.is(options.prefix, "A");
});

test("perPage limits the amount of results returned", (t) => {
  let documents = new Array(21).fill({});

  const cs = CollectorSearch({ documents: documents, perPage: 9 });
  const results = cs.search("");

  t.is(results.length, 9);
});
