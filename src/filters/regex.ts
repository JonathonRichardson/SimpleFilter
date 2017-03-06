import {SimpleFilter} from "./simple-filter";

let regex = /^\/(.*)\/i?$/;

export class RegexFilter implements SimpleFilter {
    name = 'regex';
    regex = regex;

    matchesFilter(filterString: string, value: string): boolean {
        let filterMatchObject = filterString.match(regex);
        let innerRegexText = (filterMatchObject && filterMatchObject.length > 0) ? filterMatchObject[1] : "";

        // Convert to regex object
        let flags = '';
        if (filterString.match(/i$/)) {
            flags = 'i';
        }
        let innerRegex = new RegExp(innerRegexText, flags);

        let match = value.match(innerRegex);

        return !!(match && match.length > 0);
    }
}