import {SimpleFilter} from "./simple-filter";

import * as moment from "moment";
import * as _ from "underscore";

let parseMomentLookups = {
    d: "days",
    t: "days",
    m: "months",
    w: "weeks",
    y: "years"
};

function parseMoment(text: string): moment.Moment {
    if (text.match(/^\d\d\d\d$/)) {
        return moment(text, "YYYY");
    }
    else if (text.match(/^[tmwy]([+-]\d+)?$/i)) {
        let key = text.substr(0,1);
        let number = parseInt(text.substr(1));

        let time = moment().startOf('day');

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
}

export class DateFilter implements SimpleFilter {
    name = "date";
    regex = /^[dwmy][=<>]/;

    matchesFilter(filterString: string, value: string): boolean {
        let comparator  = filterString.substr(1,1); // <, >, or =
        let date        = parseMoment(filterString.substr(2));
        let cellDate    = parseMoment(value);
        let granularity = parseMomentLookups[filterString.substr(0,1).toLowerCase()];

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