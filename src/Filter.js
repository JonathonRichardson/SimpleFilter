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
        return moment(text);
    }
};

// Set of filters to choose from.  Note that filter and cellValue are assumed to be strings.
var filters = {
    substring: function(filter, cellValue, caseInsensitive) {
        if (caseInsensitive) {
            return (cellValue.toLowerCase().indexOf(filter.toLowerCase()) !== -1);
        }
        return (cellValue.indexOf(filter) !== -1);
    },
    regex: function(filter, cellValue) {
        var innerRegex = filter.match(regularExpressionToMatchRegexFilters)[1];

        // Convert to regex object
        var flags = '';
        if (filter.match(/i$/)) {
            flags = 'i';
        }
        innerRegex = new RegExp(innerRegex, flags);

        return cellValue.match(innerRegex);
    },
    numerical: function(filter, cellValue) {
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
    },
    date: function(filter, cellValue) {
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
};
_.each(filters, function(value, key) {
    value.filterName = key;
});
Filter.filters = filters;

var regularExpressionToMatchRegexFilters = /^\/(.*)\/i?$/;

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
        if (!filter.match(regularExpressionToMatchRegexFilters)) {
            return true;
        }

        var innerRegex = filter.match(regularExpressionToMatchRegexFilters)[1];
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

var determineFilter = function(filter) {
    // Regex
    if (filter.match(regularExpressionToMatchRegexFilters)) {
        return filters.regex;
    }
    else if (filter.match(/^[<>]/)) {
        return filters.numerical;
    }
    else if (filter.match(/^[dwmy][=<>]/)) {
        return filters.date;
    }
    // DEFAULT: Substring Match
    else {
        return filters.substring;
    }
};
Filter.determineFilter = determineFilter;

var valueMatchesFilterInner = function(filter, cellValue, caseInsensitive) {
    var negateAnswer  = false;

    // Ensure we have something to filter on, and that it's a string.
    if (filterIsUnnecessary(filter)) {
        return true;
    }
    filter = filter.toString();

    // Ensure that cellValue is a string.
    cellValue = (_.isUndefined(cellValue) || (cellValue === null) ) ? "" : cellValue.toString();

    // Apply negation rule.
    if (filter.match(/^!/)) {
        negateAnswer = true;
        filter = filter.substring(1);
    }

    var filterFunction = determineFilter(filter);
    var matchesFilter = filterFunction.call(undefined, filter, cellValue, caseInsensitive);

    return negateAnswer ? !matchesFilter : matchesFilter;
};