# Collector Search

A library for searching ordered JSON data.

### Features

* Returns results in the same order as the input (by an order field)
* Only dependency is lodash
* No need to index the data

### Installation

`npm install collector-search`

### Example Usage

```js
const books = [
  {
    id: 1,
    title: 'War and Peace',
    content: 'A story about the Russian Revolution',
    position: 2
  },
  {
    id: 2,
    title: 'A Tale of Two Cities',
    content: 'A story about the French Revolution',
    position: 1
  }
];

const cs = CollectorSearch({
  documents: books,
  keysToExclude: ['id', 'order'],
  orderBy: 'position'
});

// returns A Tale of Two Cities, then War and Peace
const results = cs.search('story');
```

### Advanced Search for numeric values

```js
const postcards = [
  {
    id: 1,
    title: 'Two hundred series postcard #1',
    number: 201,
    position: 1
  },
  {
    id: 2,
    title: 'Two hundred series postcard #2',
    number: 202,
    position: 2
  },
  {
    id: 3,
    title: 'Three hundred series postcard #1',
    number: 201,
    position: 3
  }
];

const cs = CollectorSearch({
  documents: postcards,
  keysToExclude: ['id'],
  orderBy: 'position'
});

// returns the first two cards
const results = cs.search('number: 200-201');
```

### Pre-generating indexes

If your json data is not changing you can pre-generate an index by doing the following.

```js
const cs = CollectorSearch({ documents: documents });
const injectedDocuments = cs.injectIndex();
```

Then you save your injected documents into a file with a script like the following.

```js
import fs from 'fs';

fs.writeFileSync('documents.json', JSON.stringify(injectedDocuments));
```

### Version History

* 1.0.0
    * Initial Release
* 1.0.1
    * Removed option `fields` and search all fields other thans `keysToExclude`
    * Fixed bug where half generated indexes caused the search to fail

### License

This project is licensed under the MIT License - see the MIT_LICENSE file for details

### Acknowledgments

Inspiration

* [ss-search](https://github.com/yann510/ss-search)


