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
  order: 2
},
{
  id: 2,
  title: 'A Tale of Two Cities',
  content: 'A story about the French Revolution',
  order: 1
}
];

const cs = CollectorSearch({
  documents: books,
  fields: ['title', 'content'],
  keysToExclude: ['id'],
  sort: 'order'
});

// returns A Tale of Two Cities, then War and Peace
const results = cs.search('story');
```

## Version History

* 1.0.0
    * Initial Release

## License

This project is licensed under the MIT License - see the MIT_LICENSE file for details

## Acknowledgments

Inspiration

* [ss-search](https://github.com/yann510/ss-search)


