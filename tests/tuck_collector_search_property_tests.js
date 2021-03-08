import { testProp, fc } from "ava-fast-check";
import _ from "lodash";
import TuckCollectorSearch from "../src/tuck_collector_search.js";
import SsSearchWrapper from "../src/ss_search_wrapper";

testProp(
  "Extracting advanced options from a query always returns a string",
  [fc.string()],
  (t, query) => {
    const tcs = TuckCollectorSearch({ documents: {}, searchKeys: {} });

    const { remainingQuery, _options } = tcs.extractOptionsFromQuery(query);

    t.true(_.isString(remainingQuery));
  }
);

testProp(
  "Returns an object no matter what's passed in",
  [fc.falsy()],
  (t, query) => {
    const tcs = TuckCollectorSearch({ documents: {}, searchKeys: {} });

    const { remainingQuery, _options } = tcs.extractOptionsFromQuery(query);

    t.is(remainingQuery, query);
  }
);

testProp(
  "Returns between 200 and the max number documents available",
  [fc.integer(), fc.integer()],
  (t, page, perPage) => {
    // Dummy array because we only care about the total results.
    const documents = _.range(123456);

    const ssw = SsSearchWrapper(documents);

    const results = ssw.__sortAndPaginate(documents, page, perPage);

    t.true(results.length >= 200);
    t.true(results.length <= documents.length);
  }
);

testProp(
  "Sorts results by the order field",
  [fc.integer(), fc.integer()],
  (t, page, perPage) => {
    // A fake collection of documents in reverse order, 9000, 8999, etc..
    const documents = _.map(_.rangeRight(1, 9001), (i) => {
      return { order: i };
    });

    const ssw = SsSearchWrapper(documents);

    const results = ssw.__sortAndPaginate(documents, page, perPage);

    t.true(_.first(results).order < _.last(results).order);
  }
);
