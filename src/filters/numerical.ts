import {SimpleFilter} from "./simple-filter";

import * as _ from "underscore";

export class NumericalFilter implements SimpleFilter {
    name = 'numerical';
    regex = /^[<>]/;

    matchesFilter(filterString: string, value: string): boolean {
        let comparator   = filterString.substr(0, 1);
        let filterNumber = parseFloat(filterString.substr(1));

        let floatValue: number = parseFloat(value);

        if (_.isNaN(filterNumber) || _.isNaN(floatValue)) {
            return false;
        }

        if (comparator === ">") {
            return floatValue > filterNumber;
        }
        else if (comparator === "<") {
            return floatValue < filterNumber;
        }
        else {
            throw new Error("Failed to match...");
        }
    }
}