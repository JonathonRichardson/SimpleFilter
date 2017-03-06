# SimpleFilter [![Build Status](https://travis-ci.org/JonathonRichardson/SimpleFilter.svg?branch=master)](https://travis-ci.org/JonathonRichardson/SimpleFilter)
A rather simple but powerful filtering mechanism.  For instance, you can use this to implement a filter for tables in the browser.

# Getting Started
Simply use it from npm:

```bash
npm install --save simplefilter
```

And reference it in your `.js` files...
```javascript
const simplefilter = require("simplefilter");
```

... or your `.ts` files:
```typescript
import * as filter from "simplefilter";
```

It should "just work" if you're using webpack (you just need to require it).  

## Bower
If you want to use bower, you'll need to install the [Bower npm resolver](https://www.npmjs.com/package/bower-npm-resolver), but then it should be as simple as:
```
bower install --save npm:simplefilter#1.0.0
```

## Global
If you load `filter.js` into the browser without a module loader such as **requirejs** available, it will expose a global variable called **SimpleFilter**

## Dependencies
This depends on **momentjs** and **underscore**.  If you install using **npm** or **bower**, it should handle these dependencies for you.  If you use something else, you'll need to make sure they are loaded.

# Custom Filters
You can create custom filters.  Each filter must implement the `SimpleFilter` interface.  This includes a **regex** that will define whether or not to apply that rule and a **matchesFilter** method that takes the text supplied as the filter string and checks if the value passed matches that filter string.

Then, you need only register your new filter:
```typescript
import {SimpleFilter, registerFilter} as filter from "simplefilter";

class CustomFilter implements SimpleFilter {
  name:  'custom';
  regex: /custom:(.*)/;
  
  matchesFilter(filterString: string, value: string): boolean {
    /*
    ... do something here
    */
    return true;
  }
}

registerFilter(new CustomFilter());
```
