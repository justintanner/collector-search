import _ from "lodash";
import { search as SsSearch } from "ss-search";

function CollectorSearch(attrs) {
  let { documents, searchKeys, perPage } = attrs;

  const search = (query, page) => {
    const { remainingQuery, options } = extractOptionsFromQuery(query);

    if (!_.isEmpty(options)) {
      return advancedSearch(remainingQuery, page, options);
    }

    const results = SsSearch(documents, searchKeys, remainingQuery);

    return sortAndPaginate(results, page, perPage);
  };

  const advancedSearch = (query, page, options) => {
    let matchingDocuments = documents;

    _.forEach(advancedFilterFunctions(query, options), (filterFunction) => {
      matchingDocuments = _.filter(matchingDocuments, filterFunction);
    });

    const results = SsSearch(matchingDocuments, searchKeys, query);

    return sortAndPaginate(results, page, perPage);
  };

  const extractOptionsFromQuery = (query) => {
    let remainingQuery,
      options = {};

    remainingQuery = query;

    if (!_.isString(remainingQuery)) {
      return { remainingQuery, options };
    }

    const optionRegex = /(prefix|number):\s*[^\s]*/g;
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

  const sortAndPaginate = (results, page, perPage) => {
    const totalPerPage = normalizePerPage(perPage, results.length);
    const pageNumber = normalizePageNumber(page, totalPerPage, results.length);

    return _.chain(results)
      .sortBy("order")
      .drop((pageNumber - 1) * totalPerPage)
      .take(totalPerPage)
      .value();
  };

  const normalizePerPage = (perPage, totalResults) => {
    if (!_.isInteger(perPage) || perPage < 200) {
      return 200;
    }

    if (perPage > totalResults) {
      return totalResults;
    }

    return perPage;
  };

  const normalizePageNumber = (page, perPage, totalResults) => {
    if (!_.isInteger(page) || page < 1) {
      return 1;
    }

    if (page > totalResults / perPage) {
      return totalResults / perPage - 1;
    }

    return page;
  };

  // TODO: Refactor this function for readability.
  const advancedFilterFunctions = (query, options) => {
    return _.map(options, (value, key) => {
      if (key === "prefix") {
        return (document) => {
          return document.prefix === value;
        };
      } else if (key === "number" && value.includes("-")) {
        return (document) => {
          const startEnd = value.split("-");
          return (
            document.number >= _.parseInt(startEnd[0]) &&
            document.number <= _.parseInt(startEnd[1])
          );
        };
      } else if (key === "number") {
        return (document) => {
          return document.number === value;
        };
      }
    });
  };

  return Object.freeze({
    search,
    advancedSearch,
    __extractOptionsFromQuery: extractOptionsFromQuery,
    __sortAndPaginate: sortAndPaginate,
  });
}

export default CollectorSearch;
