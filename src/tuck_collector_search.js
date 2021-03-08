import _ from "lodash";
import SsSearchWrapper from "./ss_search_wrapper";

function TuckCollectorSearch(attrs) {
  let { documents, searchKeys, searchWrapper, perPage } = attrs;

  if (_.isEmpty(searchWrapper)) {
    searchWrapper = SsSearchWrapper({
      documents,
      searchKeys,
      perPage: perPage,
    });
  }

  const search = (query, page) => {
    const { remainingQuery, options } = extractOptionsFromQuery(query);

    if (!_.isEmpty(options)) {
      return searchWrapper.advancedSearch(remainingQuery, page, options);
    }

    return searchWrapper.search(remainingQuery, page);
  };

  const extractOptionsFromQuery = (query) => {
    let remainingQuery,
      options = {};

    remainingQuery = query;

    if (!_.isString(remainingQuery)) {
      return { remainingQuery, options };
    }

    const optionRegex = /(prefix|number):\s*([^\s]*)/g;
    const matches = query.match(optionRegex);

    _.forEach(matches, (match) => {
      const fieldAndValue = _.chain(match)
        .replace(/\s/g, "")
        .split(":")
        .value();

      options[fieldAndValue[0]] = fieldAndValue[1];

      remainingQuery = _.chain(remainingQuery)
        .replace(match, "  ")
        .replace(/\s{2,}/g, " ")
        .trim()
        .value();
    });

    return { remainingQuery, options };
  };

  return Object.freeze({
    search,
    extractOptionsFromQuery,
  });
}

export default TuckCollectorSearch;
