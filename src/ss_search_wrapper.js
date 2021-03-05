import _ from "lodash";
import { search as SsSearch } from "ss-search";

function SsSearchWrapper(attrs) {
  let { documents, searchKeys } = attrs;

  let search = (query) => {
    const results = SsSearch(documents, searchKeys, query);

    return _.sortBy(results, "order");
  };

  return Object.freeze({
    search,
  });
}

export default SsSearchWrapper;
