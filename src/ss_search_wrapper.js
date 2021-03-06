import _ from "lodash";
import { search as SsSearch } from "ss-search";

function SsSearchWrapper(attrs) {
  let { documents, searchKeys } = attrs;

  let search = (query) => {
    const results = SsSearch(documents, searchKeys, query);

    return _.sortBy(results, "order");
  };

  let rangeSearch = (query, startRange, endRange) => {
    const documentsMatchingRange = _.filter(documents, (document) => {
      return document.number >= startRange && document.number <= endRange;
    });

    const results = SsSearch(documentsMatchingRange, searchKeys, query);

    return _.sortBy(results, "order");
  };

  return Object.freeze({
    search,
    rangeSearch,
  });
}

export default SsSearchWrapper;
