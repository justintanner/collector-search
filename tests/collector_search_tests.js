import test from "ava";
import _ from "lodash";
import CollectorSearch from "../src/collector_search.js";

test("extracts advanced options from a search query", (t) => {
  const cs = CollectorSearch({ documents: [] });

  const { remainingQuery, options } = cs.__extractOptionsFromQuery(
    "abc number: 1-101 prefix:A"
  );

  t.is(remainingQuery, "abc");
  t.is(options.number, "1-101");
  t.is(options.prefix, "A");
});

test("perPage limits the amount of results returned", (t) => {
  let documents = new Array(21).fill({});

  const cs = CollectorSearch({ documents: documents, perPage: 9 });
  const results = cs.search("");

  t.is(results.length, 9);
});

test("work around a half applied collector_search_index", (t) => {
  const books = [
    {
      id: 1,
      title: "War and Peace",
      content: "A story about the Russian Revolution",
      order: 2,
      collector_search_index:
        "war and peace a story about the russian revolution",
    },
    {
      id: 2,
      title: "A Tale of Two Cities",
      content: "A story about the French Revolution",
      order: 1,
    },
  ];

  const cs = CollectorSearch({ documents: books });
  const results = cs.search("two cities");

  t.is(results[0], books[1]);
});

test("does not search by the orderBy column", (t) => {
  const books = [
    {
      id: 1,
      title: "War and Peace",
      content: "A story about the Russian Revolution",
      order: 100,
    },
    {
      id: 2,
      title: "A Tale of Two Cities",
      content: "A story about the French Revolution",
      order: 101,
    },
  ];

  const cs = CollectorSearch({ documents: books });
  const results = cs.search("101");

  t.is(results.length, 0);
});

test("can pre-generate an index", (t) => {
  const books = [
    {
      id: 1,
      title: "War and Peace",
      content: "A story about the Russian Revolution",
      order: 1,
    },
    {
      id: 2,
      title: "A Tale of Two Cities",
      content: "A story about the French Revolution",
      order: 2,
    },
  ];

  const cs = CollectorSearch({ documents: books });
  const documents = cs.injectIndex();

  t.true(_.has(documents[0], "collector_search_index"));
});
