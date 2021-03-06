import test from "ava";
import _ from "lodash";
import TuckCollectorSearch from "../src/tuck_collector_search.js";

test("extracts a number range from a search query", (t) => {
  const tcs = TuckCollectorSearch({ documents: {}, searchKeys: {} });

  const { extractedQuery, startRange, endRange } = tcs.extractRangeFromQuery(
    "abc number: 1-101"
  );

  t.is(extractedQuery, "abc");
  t.is(startRange, 1);
  t.is(endRange, 101);
});
