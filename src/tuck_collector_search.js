import _ from "lodash";
import SsSearchWrapper from "./ss_search_wrapper";

function TuckCollectorSearch(attrs) {
  let { documents, searchKeys, searchWrapper } = attrs;

  if (!_.isFunction(searchWrapper)) {
    searchWrapper = SsSearchWrapper({ documents, searchKeys });
  }

  const extractRangeFromQuery = (query) => {
    let extractedQuery, startRange, endRange;

    if (!_.isString(query)) {
      return { extractedQuery: query };
    }

    extractedQuery = query;

    const rangeRegex = /number:\s*([0-9]+)\s*-\s*([0-9]+)/;
    const matches = query.match(rangeRegex);

    if (matches && matches.length >= 2) {
      startRange = _.parseInt(matches[1]);
      endRange = _.parseInt(matches[2]);

      extractedQuery = _.chain(query).replace(rangeRegex, "").trim().value();
    }

    return { extractedQuery, startRange, endRange };
  };

  const search = (query) => {
    const { extractedQuery, startRange, endRange } = extractRangeFromQuery(
      query
    );

    if (startRange && endRange) {
      return searchWrapper.rangeSearch(extractedQuery, startRange, endRange);
    }

    if (_.isEmpty(extractedQuery)) {
      return documents;
    }

    return searchWrapper.search(extractedQuery);
  };

  return Object.freeze({
    search,
    extractRangeFromQuery,
  });
}

export default TuckCollectorSearch;
