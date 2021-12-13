import _ from "lodash";

const CollectorSearch = (attrs) => {
  let {documents, keysToExclude, perPage, orderBy} = attrs;

  if (!_.isArray(documents)) {
    throw "ERROR: Invalid documents (not an array).";
  }

  if (_.isEmpty(keysToExclude)) {
    keysToExclude = ["collector_search_index", "id"];
  } else if (_.isArray(keysToExclude)) {
    keysToExclude.push("collector_search_index");
    keysToExclude.push("id");
  } else {
    throw "ERROR: Invalid keysToExclude";
  }

  if (_.isEmpty(orderBy) || !_.isString(orderBy)) {
    orderBy = "order";
  }

  const search = (query, page) => {
    const {remainingQuery, options} = extractOptionsFromQuery(query);

    if (indexBlank()) {
      injectIndexIntoDocuments();
    }

    const filteredDocuments = filterDocuments(
      documents,
      remainingQuery,
      options
    );

    return sortAndPaginate(filteredDocuments, page, perPage);
  };

  const filterDocuments = (searchDocuments, query, options) => {
    let matchingDocuments = searchDocuments;
    const queryTokens = tokenize(query);

    _.each(advancedFilterFunctions(options), (filterFunction) => {
      matchingDocuments = _.filter(matchingDocuments, filterFunction);
    });

    if (_.isEmpty(query)) {
      return matchingDocuments;
    }

    return _.filter(matchingDocuments, (document) => {
      return _.every(queryTokens, (token) => {
        return documentContainsToken(document, token);
      });
    });
  };

  const documentContainsToken = (document, token) => {
    return document.collector_seach_index.indexOf(token) > -1;
  };

  const indexBlank = () => {
    return !_.isString(documents[0].collector_seach_index);
  };

  const extractOptionsFromQuery = (query) => {
    let remainingQuery,
      options = {};

    remainingQuery = query;

    if (!_.isString(remainingQuery)) {
      return {remainingQuery, options};
    }

    const optionRegex = /(prefix|number):\s*[^\s]*/g;
    const matches = query.match(optionRegex);

    _.each(matches, (match) => {
      const fieldAndValue = match.replace(/\s/g, "").split(":");

      options[fieldAndValue[0]] = fieldAndValue[1];

      remainingQuery = remainingQuery
        .replace(match, "  ")
        .replace(/\s{2,}/g, " ")
        .trim();
    });

    return {remainingQuery, options};
  };

  const sortAndPaginate = (results, page, perPage) => {
    const totalPerPage = normalizePerPage(perPage, results.length);
    const pageNumber = normalizePageNumber(page, totalPerPage, results.length);

    return _.chain(results)
      .sortBy(orderBy)
      .drop((pageNumber - 1) * totalPerPage)
      .take(totalPerPage)
      .value();
  };

  const normalizePerPage = (perPage, totalResults) => {
    if (!_.isInteger(perPage) || perPage <= 0) {
      return 100;
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
    _.each(documents, (document) => {
      document.collector_seach_index = createDocumentIndex(document);
    });
  };

  const createDocumentIndex = (document) => {
    return _.map(document, (value, key) => {
      if (!keysToExclude.includes(key)) {
        return normalizeText(value);
      }

      return "";
    }).join("");
  };

  const tokenize = (query) => {
    return normalizeText(query).match(/\w+/gim) || [];
  };

  const advancedFilterFunctions = (options) => {
    const validKeys = _.reject(Object.keys(documents[0]), keysToExclude);

    return _.chain(options)
      .map((value, key) => {
        if (isNumberRange(value)) {
          return (document) => {
            const startEnd = value.split("-");
            const start = _.parseInt(startEnd[0]);
            const end = _.parseInt(startEnd[1]);
            const number = _.parseInt(document[key]);

            if (start <= 0 || end <= 0 || number <= 0) {
              return false;
            }

            return number >= start && number <= end;
          };
        } else if (validKeys.includes(key)) {
          return (document) => {
            return normalizeText(document[key]) === normalizeText(value);
          };
        }
      })
      .compact()
      .value();
  };

  const isNumberRange = (string) => {
    return /[0-9]+\s*-\s*[0-9]+/.test(string);
  };

  return Object.freeze({
    search,
    __extractOptionsFromQuery: extractOptionsFromQuery,
    __sortAndPaginate: sortAndPaginate,
  });
};

export default CollectorSearch;
