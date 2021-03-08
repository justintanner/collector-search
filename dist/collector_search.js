"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _ss_search_wrapper = _interopRequireDefault(require("./ss_search_wrapper"));

function CollectorSearch(attrs) {
  var documents = attrs.documents,
      searchKeys = attrs.searchKeys,
      searchWrapper = attrs.searchWrapper,
      perPage = attrs.perPage;

  if (_lodash["default"].isEmpty(searchWrapper)) {
    searchWrapper = (0, _ss_search_wrapper["default"])({
      documents: documents,
      searchKeys: searchKeys,
      perPage: perPage
    });
  }

  var search = function search(query, page) {
    var _extractOptionsFromQu = extractOptionsFromQuery(query),
        remainingQuery = _extractOptionsFromQu.remainingQuery,
        options = _extractOptionsFromQu.options;

    if (!_lodash["default"].isEmpty(options)) {
      return searchWrapper.advancedSearch(remainingQuery, page, options);
    }

    return searchWrapper.search(remainingQuery, page);
  };

  var extractOptionsFromQuery = function extractOptionsFromQuery(query) {
    var remainingQuery,
        options = {};
    remainingQuery = query;

    if (!_lodash["default"].isString(remainingQuery)) {
      return {
        remainingQuery: remainingQuery,
        options: options
      };
    }

    var optionRegex = /(prefix|number):\s*([^\s]*)/g;
    var matches = query.match(optionRegex);

    _lodash["default"].forEach(matches, function (match) {
      var fieldAndValue = _lodash["default"].chain(match).replace(/\s/g, "").split(":").value();

      options[fieldAndValue[0]] = fieldAndValue[1];
      remainingQuery = _lodash["default"].chain(remainingQuery).replace(match, "  ").replace(/\s{2,}/g, " ").trim().value();
    });

    return {
      remainingQuery: remainingQuery,
      options: options
    };
  };

  return Object.freeze({
    search: search,
    extractOptionsFromQuery: extractOptionsFromQuery
  });
}

var _default = CollectorSearch;
exports["default"] = _default;