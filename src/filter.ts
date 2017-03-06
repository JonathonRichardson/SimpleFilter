import * as _ from "underscore";

/*
 * These all require SimpleFilter to be defined, so we need to import them after we've
 * declared that abstract class
 */
import {DateFilter} from "./filters/date";
import {NumericalFilter} from "./filters/numerical";
import {RegexFilter} from "./filters/regex";
import {SubstringFilter} from "./filters/substring";
import {SimpleFilter} from "./filters/simple-filter";

export class Filterer {
    filters: {[name: string]: SimpleFilter} = {};

    constructor(filterText: string) {
        filterText.split(";").forEach((filterPiece) => {
            let filter = determineFilter(filterPiece);

            if (filter != null) {
                this.filters[filterPiece] = filter;
            }
        })
    }

    matches(value: string): boolean {
        let foundNonMatchingFilter = false;

        _.each(this.filters, (filter, filterText) => {
            if (!filter.matchesFilter(filterText, value)) {
                foundNonMatchingFilter = true;
                return false; // break out of loop
            }
        });

        return !foundNonMatchingFilter;
    }
}

let registeredFilters: SimpleFilter[] = [];
let registeredFiltersMap: {[name: string]: SimpleFilter} = {};

export function registerFilter(filter: SimpleFilter): void {
    registeredFilters.push(filter);
    registeredFilters[filter.name] = filter;
}

export function getFilter(name: string): SimpleFilter | null {
    return registeredFiltersMap[name];
}

function registerDefaultFilters() {
    registerFilter(new RegexFilter());
    registerFilter(new NumericalFilter());
    registerFilter(new DateFilter());
}

// Register the default set of filters
registerDefaultFilters();

export function determineFilter(filterString: string): SimpleFilter | null {
    let filter: SimpleFilter = _.find(registeredFilters, function(curFilter) {
        return !!(filterString.match(curFilter.regex));
    });

    if (_.isUndefined(filter)) {
        filter = new SubstringFilter();
    }

    return filter;
}