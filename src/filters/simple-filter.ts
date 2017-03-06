
export interface SimpleFilter {
    name: string;
    regex: RegExp;
    matchesFilter(filterString: string, value: string): boolean;
}
