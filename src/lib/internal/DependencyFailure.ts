export type DependencyFailure = (
    | { tag: "DoesNotExist", key: string, selector: string }
    | { tag: "IsNotA", elementType: new () => Element, actualTagName: string }
);
