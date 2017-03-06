import {SimpleFilter} from "./simple-filter";

export class SubstringFilter implements SimpleFilter {
    name: string = 'substring';
    regex: RegExp = /.*/;

    matchesFilter(filterString: string, value: string, caseSensitive: boolean = false): boolean {
        if (caseSensitive) {
            value = value.toLowerCase();
            filterString = filterString.toLowerCase();
        }

        return (value.indexOf(filterString) !== -1);
    }
}