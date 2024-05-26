export type DependencyFailure = (
    | { tag: "DoesNotExist", key: string, selector: string }
    | { tag: "IsOfWrongType", expectedType: new () => Element, actualTagName: string }
);
