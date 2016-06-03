(function() {
    QUnit.test("Table Filters Are Correctly Determined", function(assert) {
        var ensureCorrectFilter = function(filter, text) {
            assert.equal(determineFilter(text), filter, "Text '" + text + "' matches type \"" + filter.filterName + "\"");
        };

        // Check some patterns that should be regexes.
        ensureCorrectFilter(filters.regex, "/hello/i");
        ensureCorrectFilter(filters.regex, "/hello/");

        // Check dates
        ensureCorrectFilter(filters.date, "d<2015-05");
        ensureCorrectFilter(filters.date, "m=2015-05");
        ensureCorrectFilter(filters.date, "y=2015-05");
        ensureCorrectFilter(filters.date, "w=w-1");
        ensureCorrectFilter(filters.date, "d<2015/05");
        ensureCorrectFilter(filters.date, "d<2015/05/20");
        ensureCorrectFilter(filters.date, "d<2015/05/20 00:00:00");

        // Check some numbers
        ensureCorrectFilter(filters.numerical, "<13");
        ensureCorrectFilter(filters.numerical, "<013");
        ensureCorrectFilter(filters.numerical, ">2");
    });

    QUnit.test("Table Filters are applied correctly", function(assert) {
        var checkMatch = function(shouldMatch, filterString, cellValue) {
            var matchString = (shouldMatch) ? "matches" : "does not match";
            var message = "Cell Value '" + cellValue + "' " + matchString + " filter '" + filterString + "'";
            var actuallyMatches = applyFilter(filterString, cellValue);

            assert.equal(actuallyMatches, shouldMatch, message);
        };

        var dateFormat = "YYYY/MM/DD HH:mm:ss";
        var now = moment().format(dateFormat);
        var yesterday = moment().subtract(1, "day").format(dateFormat);
        var threeDaysAgo = moment().subtract(3, "day").format(dateFormat);

        checkMatch(true,  "/hello/i",         "Hello, my good friend.");
        checkMatch(false, "/hello/",          "Hello, my good friend.");
        checkMatch(true,  "y=2016",           "2016/05/05 09:30:00");
        checkMatch(false, "y=2016",           "2015/05/05 09:30:00");
        checkMatch(true,  "d>2016-04-01",     "2016/05/05 09:30:00");
        checkMatch(false, "m=2016-04-01",     "2016/05/05 09:30:00");
        checkMatch(true,  "m=2016-05-01",     "2016/05/05 09:30:00");
        checkMatch(true,  "m=2016-05",        "2016/05/05 09:30:00");
        checkMatch(true,  "d<t+1",            now);
        checkMatch(true,  "d<t",              yesterday);
        checkMatch(true,  "d<t-2",            threeDaysAgo);
        checkMatch(true,  "y=2016;m>2016-04", "2016/05/05 09:30:00");
        checkMatch(false, ">2",               "001");
        checkMatch(false, ">2",               "1");
        checkMatch(true,  ">2",               "3");
        checkMatch(true,  ">2",               "003");
        checkMatch(true,  ">2;<04",           "003");
        checkMatch(true,  ">2;<04",           "03.00");
        checkMatch(true,  ">2.9;<3.1",        "03.00");
    });
})();