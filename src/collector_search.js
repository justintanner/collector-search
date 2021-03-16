import _ from "lodash";

function CollectorSearch(attrs) {
  let { documents, searchKeys, perPage } = attrs;

  if (!_.isArray(documents)) {
    console.log("documents", documents);
    throw "ERROR: documents is not an array.";
  }

  const search = (query, page) => {
    const { remainingQuery, options } = extractOptionsFromQuery(query);

    if (indexBlank()) {
      injectIndexIntoDocuments(documents, searchKeys);
    }

    if (!_.isEmpty(options)) {
      return advancedSearch(remainingQuery, page, options);
    }

    if (_.isEmpty(query)) {
      return documents;
    }

    const results = filterDocuments(documents, remainingQuery);

    return sortAndPaginate(results, page, perPage);
  };

  const advancedSearch = (query, page, options) => {
    let matchingDocuments = documents;

    _.forEach(advancedFilterFunctions(query, options), (filterFunction) => {
      matchingDocuments = _.filter(matchingDocuments, filterFunction);
    });

    const results = filterDocuments(matchingDocuments, query);

    return sortAndPaginate(results, page, perPage);
  };

  const filterDocuments = (searchDocuments, query) => {
    const queryTokens = tokenize(query);

    if (_.isEmpty(query)) {
      return searchDocuments;
    }

    return _.filter(searchDocuments, (document) => {
      return _.some(queryTokens, (token) => {
        return document.cs_index.indexOf(token) > -1;
      });
    });
  };

  const indexBlank = () => {
    return !_.isString(documents[0].cs_index);
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
      const fieldAndValue = match.replace(/\s/g, "").split(":");

      options[fieldAndValue[0]] = fieldAndValue[1];

      remainingQuery = remainingQuery
        .replace(match, "  ")
        .replace(/\s{2,}/g, " ")
        .trim();
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

  const normalizeText = (text) => {
    return _.deburr(text)
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase()
      .trim();
  };

  const injectIndexIntoDocuments = () => {
    return documents.forEach((document) => {
      document.cs_index = createDocumentIndex(document);
    });
  };

  const createDocumentIndex = (document) => {
    return _.map(document, (value, key) => {
      if (searchKeys.includes(key)) {
        return normalizeText(value);
      }

      return "";
    }).join("");
  };

  const tokenize = (query) => {
    return normalizeText(query).match(/\w+/gim) || [];
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
