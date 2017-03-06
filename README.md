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

# Filtering
Just instantiate a **Filterer** with a filter string:
```typescript
import {Filterer} from "simplefilter";

let myFilterer = new Filterer("hell");
myFilterer.matches("hello"); // True
myFilterer.matches("goodbye"); //False
```
## Types
There are several types of matchers, enumerated below.  For more examples, see the spec file.

### Basic Text Matching
If you just type some text (i.e. it doesn't match any of the following rules), such as "abc", the **Filterer** will match anything that contains that substring.  Note that this is case sensitive.  If you need something that isn't, use the **Regex** pattern.

### Numerical Matching
If you prefix your filter rule with "<" or ">", the **Filterer** will treat any value you pass to it as a float (it will use **parseFloat** to convert it) and match values that are less than or greater than that specified value (respectively).

You may notice there is no "=". If you need to find numbers that equal a value, such as "1.5", you can use the filter ">1.49;\<1.51".  The reason for it's omission is the general problem of comparing floats: **(1/3)\*3 != 1**.  Rather than implement custom and hard to follow clever rules, it's easier to just use an upper and lower bound.

### Date Matching
To match dates, prefix a date with either "d", "w", "m", or "y", followed by "<", ">", or "=". This will test whether the date, week, month, or year of the date in that row is less than, greater than, or equal to the date specified in the filter.  **momentjs** is used to perform the date calculations.

Besides dates formatted like "2015-05" or "2015-05-01", there are also some special shortcut dates that you can use:
* "t" indicates today. So, `d<t` indicates any date before today.
* You can also use relative dates. `d<t-1` means any date before yesterday. In the same way, `d>t+1` means any date after tomorrow.
* In addition to "t" which gives relative times in terms of days, you can use "w" to give relative terms in terms of weeks. `d>w+1` indicates any dates more than 7 days out. In the same way, "m" indicates months, and "y" indicates years.
  * Note that these are not in terms of weeks or months. `d=w-1` doesn't indicate any time last week. It means the exact date 7 days ago.
  
Examples:
* `m=m-1` would filter for any dates that occurred last month.
* `y<y` would give you any dates that happened before this year.
* `w=w+1` would give you any dates that occur next week.
* `m=2015-06` would give you anything that occured in June, 2015.

### Regular Expressions
To use a regular expression as a filter rule, just surround the regex in forward slashes, such as you might do in many programming languages:

`/{regularExpressionHere}/{flags}`

As you can see in the example above, it also supports flags. At this point, only the "i" flag is supported (for case insensitivity).

## Inverting Matchers
Prefixing a rule with "!" will invert the rule (match values that don't satisfy that rule).

For example, `!/^\s\*$/` will match any non-blank value.

## Chaining Rules
You can chain rules together using ";". Then, the table will only display rows that match each of the chained rules.

For example, `y=y;m<m` will yield results for any date that occurred this year but before the start of this month.

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
