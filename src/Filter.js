var parseMomentLookups = {
    d: "days",
    t: "days",
    m: "months",
    w: "weeks",
    y: "years"
};

var parseMoment = function(text) {
    if (text.match(/^\d\d\d\d$/)) {
        return moment(text, "YYYY");
    }
    else if (text.match(/^[tmwy]([+-]\d+)?$/i)) {
        var key = text.substr(0,1);
        var number = parseInt(text.substr(1));

        var time = moment().startOf('day');

        if (!_.isNaN(number)) {
            time.add(number, parseMomentLookups[key.toLowerCase()]);
        }

        return time;
    }
    else {
        // Since sometimes there's a problem with slashes, replace them with dashes
        text = text.replace(/\//g, '-');

        return moment(text);
    }
};

// Set of filters to choose from.  Note that filter and cellValue are assumed to be strings.
var filters = [];
var filterLookup = {};
Filter.registerFilter = function(filter) {
    filters.push(filter);
    filterLookup[filter.filterName] = filter;
};

Filter.getFilter = function(name) {
    return filterLookup[name];
};

Filter.createFilter = function(name, regex, filterFunction) {
    return {
        filterName: name,
        matcher: regex,
        execute: filterFunction
    };
};

var substringFilter = Filter.createFilter('substring', /.*/, function(filter, cellValue, caseInsensitive) {
    if (caseInsensitive) {
        return (cellValue.toLowerCase().indexOf(filter.toLowerCase()) !== -1);
    }
    return (cellValue.indexOf(filter) !== -1);
});

var baseFilters = [
    {
        name: 'regex',
        regex: /^\/(.*)\/i?$/,
        filterFunction: function(filter, cellValue) {
            var innerRegex = filter.match(Filter.getFilter('regex').matcher)[1];

            // Convert to regex object
            var flags = '';
            if (filter.match(/i$/)) {
                flags = 'i';
            }
            innerRegex = new RegExp(innerRegex, flags);

            return cellValue.match(innerRegex);
        }
    },
    {
        name: 'numerical',
        regex: /^[<>]/,
        filterFunction: function(filter, cellValue) {
            var comparator   = filter.substr(0, 1);
            var filterNumber = filter.substr(1);

            cellValue = parseFloat(cellValue);
            filterNumber = parseFloat(filterNumber);
            if (_.isNaN(filterNumber) || _.isNaN(cellValue)) {
                return false;
            }

            if (comparator === ">") {
                return cellValue > filterNumber;
            }
            else if (comparator === "<") {
                return cellValue < filterNumber;
            }
            else {
                throw new Error("Failed to match...");
            }
        }
    },
    {
        name: 'date',
        regex: /^[dwmy][=<>]/,
        filterFunction: function(filter, cellValue) {
            var comparator  = filter.substr(1,1); // <, >, or =
            var date        = parseMoment(filter.substr(2));
            var cellDate    = parseMoment(cellValue);
            var granularity = parseMomentLookups[filter.substr(0,1).toLowerCase()];

            if (comparator === ">") {
                return cellDate.isAfter(date, granularity);
            }
            else if (comparator === "<") {
                return cellDate.isBefore(date, granularity);
            }
            else if (comparator === "=") {
                return cellDate.isSame(date, granularity);
            }
            else {
                throw new Error("Failed to match...");
            }
        }
    }
].map(function(value) {
    return Filter.createFilter(value.name, value.regex, value.filterFunction);
});

// Register each of the base filters.
_.each(baseFilters, function(filter) {
    Filter.registerFilter(filter);
});


var filterIsUnnecessary = function(filter) {
    if (_.isUndefined(filter) || (filter === null)) {
        return true;
    }

    // Look for and remove any leading negation marker
    if (filter.substr(0, 1) == "!") {
        filter = filter.substr(1);
    }

    // Now, look for a date signifier
    if (_.includes("dwmy", filter.substr(0,1))) {
        filter = filter.substr(1);
    }

    // Now, look for comparators
    if ( filter.match(/^[=<>]/) ) {
        filter = filter.substr(1);
    }

    if (filter === "") {
        return true;
    }
    // We may have a regex
    else if (filter.match(/^\//)) {
        // Until the regex is complete, there is no need to apply the filter.
        if (!filter.match(Filter.getFilter('regex').matcher)) {
            return true;
        }

        var innerRegex = filter.match(Filter.getFilter('regex').matcher)[1];
        var returnVal;
        try {
            innerRegex = new RegExp(innerRegex);
            returnVal = false;
        }
        catch(e) {
            returnVal = true;
        }

        return returnVal;
    }
    return false;
};

Filter.applyFilter = function(filter, cellValue, caseInsensitive) {
    // TODO: applyFilter gets called for every row, so this split is happening (n-1) times more than it really
    // needs to.  Although this hasn't yet caused a problem, it would be prudent to break out the "instantiation"
    // of the filter, which would also allow us to make other more performant and targeted filters.
    var innerFilters = filter.split(";");
    var valueHasFailedFilterTest = false;

    _.each(innerFilters, function(filter) {
        if (!valueMatchesFilterInner(filter, cellValue, caseInsensitive)) {
            valueHasFailedFilterTest = true;
            return false;
        }
    });

    return !valueHasFailedFilterTest;
};

var determineFilter = function(filterString) {
    var filter = _.find(filters, function(curFilter) {
        if (filterString.match(curFilter.matcher)) {
            return true;
        }
        else {
            return false;
        }
    });

    if (_.isUndefined(filter)) {
        filter = substringFilter;
    }

    return filter;
};
Filter.determineFilter = determineFilter;

var valueMatchesFilterInner = function(filterString, cellValue, caseInsensitive) {
    var negateAnswer  = false;

    // Ensure we have something to filter on, and that it's a string.
    if (filterIsUnnecessary(filterString)) {
        return true;
    }
    filterString = filterString.toString();

    // Ensure that cellValue is a string.
    cellValue = (_.isUndefined(cellValue) || (cellValue === null) ) ? "" : cellValue.toString();

    // Apply negation rule.
    if (filterString.match(/^!/)) {
        negateAnswer = true;
        filterString = filterString.substring(1);
    }

    var filter = determineFilter(filterString);
    var matchesFilter = filter.execute(filterString, cellValue, caseInsensitive);

    return negateAnswer ? !matchesFilter : matchesFilter;
};