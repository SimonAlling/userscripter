export type DependencyFailure = (
    | { tag: "DoesNotExist", key: string, selector: string }
    | { tag: "IsOfWrongType", elementType: new () => Element, actualTagName: string }
);
