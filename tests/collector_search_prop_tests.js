import { testProp, fc } from "ava-fast-check";
import _ from "lodash";
import CollectorSearch from "../src/collector_search.js";

testProp(
  "Extracting advanced options from a query always returns a string",
  [fc.string()],
  (t, query) => {
    const cs = CollectorSearch({ documents: [] });

    const { remainingQuery } = cs.__extractOptionsFromQuery(query);

    t.true(_.isString(remainingQuery));
  }
);

testProp("Always returns some query", [fc.falsy()], (t, query) => {
  const cs = CollectorSearch({ documents: [] });

  const { remainingQuery } = cs.__extractOptionsFromQuery(query);

  t.is(remainingQuery, query);
});

testProp(
  "Results are ordered by the order field",
  [fc.integer(), fc.integer()],
  (t, page, perPage) => {
    // A fake collection of documents in reverse order, 9000, 8999, etc..
    const documents = _.map(_.rangeRight(1, 9001), (i) => {
      return { order: i };
    });

    const cs = CollectorSearch({ documents });
    const results = cs.__sortAndPaginate(documents, page, perPage);

    t.true(_.first(results).order <= _.last(results).order);
  }
);
