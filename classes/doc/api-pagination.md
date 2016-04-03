# Introduction

Pagination is a class in ACGSounds Runtime Library. It uses AJAX requests to pull data from remote when opts.remote is set to `true`. It slices local data and return rendered pagination asynchronously.

# Usage

## Front-end Implementation

```javascript
var pagination = new Pagination({
	remote: false
});

pagination.load(data, function() {});

pagination.page(1, function(err, doc, pageHTMLStr) {});
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
