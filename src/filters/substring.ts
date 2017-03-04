import {SimpleFilter} from "../filter";

export class SubstringFilter extends SimpleFilter {
    constructor() {
        super("substring", /.*/);
    }

    matchesFilter(filterString: string, value: string, caseSensitive: boolean = false): boolean {
        if (caseSensitive) {
            value = value.toLowerCase();
            filterString = filterString.toLowerCase();
        }

        return (value.indexOf(filterString) !== -1);
    }

}