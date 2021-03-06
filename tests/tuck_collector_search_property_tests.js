import { testProp, fc } from "ava-fast-check";
import _ from "lodash";
import TuckCollectorSearch from "../src/tuck_collector_search.js";

testProp(
  "Extracting number ranges from a query always returns a string",
  [fc.string()],
  (t, query) => {
    const tcs = TuckCollectorSearch({ documents: {}, searchKeys: {} });

    const {
      extractedQuery,
      _startRange,
      _endRange,
    } = tcs.extractRangeFromQuery(query);

    t.true(_.isString(extractedQuery));
  }
);

testProp(
  "Returns an object no matter what is passed in",
  [fc.falsy()],
  (t, query) => {
    const tcs = TuckCollectorSearch({ documents: {}, searchKeys: {} });

    const { extractedQuery, startRange, endRange } = tcs.extractRangeFromQuery(
      query
    );
    t.is(extractedQuery, query);
    t.is(startRange, undefined);
    t.is(endRange, undefined);
  }
);
