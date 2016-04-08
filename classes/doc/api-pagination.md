# Introduction

Pagination is a class in ACGSounds Runtime Library. It uses AJAX requests to pull data from remote when opts.remote is set to `true`. It slices local data and return rendered pagination asynchronously.

# Usage

## Front-end Implementation

```javascript
var pagination = new Pagination({
	remote: false,
    perPage: 5,     // number of items to display on one page
    dispRange: 3    // number of adjacent pages (L / R) to show in the buttons
                    // e.g. shows as [1] ... [4] [5] *6* [7] [8] ... [10] with dispRange = 2
});
pagination.load([ { foo: 1, bar: 2 }, { foo: 3, bar: 4, baz: 5 }, 'any type is okay', 2333 ]);

////// OR //////

var pagination = new Pagination({
	remote: true
});
pagination.options.postParams = {
    sheet_id: window.sheet_id,
    _csrf: $('meta[name=csrf-token]').attr('content')
};
pagination.load('/api/comment/list', function (err) { console.log(err); });


pagination.on('refresh', function (e) {
    console.log(e.pages);
    console.log(e.list);
});
```

`e.pages` (_Array_) contains data for navigation.
Each element describes a pagination button. Here are some examples.
```javascript
[
    { type: 'prev', disabled: true },
    { type: 'page', page: 0, active: true },    // page indices are 0-based
    { type: 'page', page: 1, active: false },
    { type: 'ellipsis' },
    { type: 'page', page: 30, active: false },
    { type: 'next', disabled: false }
]
```

`e.list` (_Array_) contains the retrieved & sliced data.
```javascript
// On page #3 with perPage = 4
[
    // 0-based index
    { index: 8, content: { foo: 'requested data' } },
    { index: 9, content: 'baz' },
    { index: 10, content: [ 233, 2333, 23333 ] },
    { index: 11, content: { foo: 1, bar: 2, baz: 3 } }
]
```

## Back-end API Implementation

### Request params

The request should include the following parameters:

* **start** (_Number_): The index of the first item to retrieve
* **count** (_Number_): The number of the items to retrieve,
  i.e. the request is asking for items indexed inside range `[start .. start + count - 1]`

```javascript
{
	"start": 25,
    "count": 5
}
```

### Response

The response should contain at least the following fields:

* **count** (_Number_): The number of items in the whole database, regardless of how much is requested
* **list** (_Array_): The items requested. May contain any type of data.

Often an optional **msg** (_String_) field is included.

```javascript
{
	"count": 20,
	"list": [
		{
			"author": 'arcGravitus',
			"email": 'jcpwfloi@gmail.com'
		}, {
			"author": 'Pisces',
			"email": '1786762946@qq.com'
		}
	]
}
```
