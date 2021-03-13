import test from "ava";
import _ from "lodash";
import CollectorSearch from "../src/collector_search.js";

test("extracts advanced options from a search query", (t) => {
  const cs = CollectorSearch({ documents: {}, searchKeys: {} });

  const { remainingQuery, options } = cs.__extractOptionsFromQuery(
    "abc number: 1-101 prefix:A"
  );

  t.is(remainingQuery, "abc");
  t.is(options.number, "1-101");
  t.is(options.prefix, "A");
});
