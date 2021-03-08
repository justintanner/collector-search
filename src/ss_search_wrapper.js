import _ from "lodash";
import { search as SsSearch } from "ss-search";

function SsSearchWrapper(attrs) {
  let { documents, searchKeys, perPage } = attrs;

  if (!_.isInteger(perPage) || perPage < 1) {
    perPage = 200;
  }

  let search = (query, page) => {
    const results = SsSearch(documents, searchKeys, query);

    return sortAndPaginate(results, page, perPage);
  };

  let advancedSearch = (query, page, options) => {
    let matchingDocuments = documents;

    _.forEach(advancedFilterFunctions(query, options), (filterFunction) => {
      matchingDocuments = _.filter(matchingDocuments, filterFunction);
    });

    const results = SsSearch(matchingDocuments, searchKeys, query);

    return sortAndPaginate(results, page, perPage);
  };

  let sortAndPaginate = (results, page, perPage) => {
    const totalPerPage = normalizePerPage(perPage, results.length);
    const pageNumber = normalizePageNumber(page, totalPerPage, results.length);

    return _.chain(results)
      .sortBy("order")
      .drop((pageNumber - 1) * totalPerPage)
      .take(totalPerPage)
      .value();
  };

  let normalizePerPage = (perPage, totalResults) => {
    if (!_.isInteger(perPage) || perPage < 200) {
      return 200;
    }

    if (perPage > totalResults) {
      return totalResults;
    }

    return perPage;
  };

  let normalizePageNumber = (page, perPage, totalResults) => {
    if (!_.isInteger(page) || page < 1) {
      return 1;
    }

    if (page > totalResults / perPage) {
      return totalResults / perPage - 1;
    }

    return page;
  };

  // TODO: Refactor this function for readability.
  let advancedFilterFunctions = (query, options) => {
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
    __sortAndPaginate: sortAndPaginate,
  });
}

export default SsSearchWrapper;
