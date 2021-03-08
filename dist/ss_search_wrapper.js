"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _ssSearch = require("ss-search");

function SsSearchWrapper(attrs) {
  var documents = attrs.documents,
      searchKeys = attrs.searchKeys,
      perPage = attrs.perPage;

  if (!_lodash["default"].isInteger(perPage) || perPage < 1) {
    perPage = 200;
  }

  var search = function search(query, page) {
    var results = (0, _ssSearch.search)(documents, searchKeys, query);
    return sortAndPaginate(results, page, perPage);
  };

  var advancedSearch = function advancedSearch(query, page, options) {
    var matchingDocuments = documents;

    _lodash["default"].forEach(advancedFilterFunctions(query, options), function (filterFunction) {
      matchingDocuments = _lodash["default"].filter(matchingDocuments, filterFunction);
    });

    var results = (0, _ssSearch.search)(matchingDocuments, searchKeys, query);
    return sortAndPaginate(results, page, perPage);
  };

  var sortAndPaginate = function sortAndPaginate(results, page, perPage) {
    var totalPerPage = normalizePerPage(perPage, results.length);
    var pageNumber = normalizePageNumber(page, totalPerPage, results.length);
    return _lodash["default"].chain(results).sortBy("order").drop((pageNumber - 1) * totalPerPage).take(totalPerPage).value();
  };

  var normalizePerPage = function normalizePerPage(perPage, totalResults) {
    if (!_lodash["default"].isInteger(perPage) || perPage < 200) {
      return 200;
    }

    if (perPage > totalResults) {
      return totalResults;
    }

    return perPage;
  };

  var normalizePageNumber = function normalizePageNumber(page, perPage, totalResults) {
    if (!_lodash["default"].isInteger(page) || page < 1) {
      return 1;
    }

    if (page > totalResults / perPage) {
      return totalResults / perPage - 1;
    }

    return page;
  }; // TODO: Refactor this function for readability.


  var advancedFilterFunctions = function advancedFilterFunctions(query, options) {
    return _lodash["default"].map(options, function (value, key) {
      if (key === "prefix") {
        return function (document) {
          return document.prefix === value;
        };
      } else if (key === "number" && value.includes("-")) {
        return function (document) {
          var startEnd = value.split("-");
          return document.number >= _lodash["default"].parseInt(startEnd[0]) && document.number <= _lodash["default"].parseInt(startEnd[1]);
        };
      } else if (key === "number") {
        return function (document) {
          return document.number === value;
        };
      }
    });
  };

  return Object.freeze({
    search: search,
    advancedSearch: advancedSearch,
    __sortAndPaginate: sortAndPaginate
  });
}

var _default = SsSearchWrapper;
exports["default"] = _default;