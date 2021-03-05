function TuckCollectorSearch(attrs) {
  let searchWrapper = attrs;

  let search = (query) => {
    return searchWrapper.search(query);
  };

  return Object.freeze({
    search,
  });
}

export default TuckCollectorSearch;
