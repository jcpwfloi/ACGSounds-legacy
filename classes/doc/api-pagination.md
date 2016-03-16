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

POST-DATA:

```javascript
{
	"page": 12 
}
```

RESPONSE-DATA:

```javascript
{
	"total": 20,
	"data": [
		{
			"author": 'arcGravitus',
			"email": 'jcpwfloi@gmail.com'
		},
		{
			"author": 'Pisces',
			"email": 'lvshiqing@hsefz.cn'
		}
	]
}
```
