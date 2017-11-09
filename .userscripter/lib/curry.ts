// Currying by albrow and waldogit
// https://gist.github.com/donnut/fd56232da58d25ceecf1#gistcomment-1617985

interface CurriedFunction2<T1, T2, R> {
    (t1: T1): (t2: T2) => R;
    (t1: T1, t2?: T2): R;
}

interface CurriedFunction3<T1, T2, T3, R> {
    (t1: T1): CurriedFunction2<T2, T3, R>;
    (t1: T1, t2?: T2): (t3: T3) => R;
    (t1: T1, t2?: T2, t3?: T3): R;
}
interface CurriedFunction4<T1, T2, T3, T4, R> {
    (t1: T1): CurriedFunction3<T2, T3, T4, R>;
    (t1: T1, t2?: T2): CurriedFunction2<T3, T4, R>;
    (t1: T1, t2?: T2, t3?: T3): (t4: T4) => R;
    (t1: T1, t2?: T2, t3?: T3, t4?: T4): R;
}
type CurriedFunction<T1, T2, T3, T4, R> = (t1: CurriedFunction<T1, T2, T3, T4, R>| T1, t2?: T2, t3?: T3, t4?: T4) => CurriedFunction<T1, T2, T3, T4, R> |
    CurriedFunction2<T1, T2, R> |
    CurriedFunction3<T1, T2, T3, R> |
    CurriedFunction4<T1, T2, T3, T4, R> | R;

export function curry2<T1, T2, T3, T4, R>(f: (t1: T1, t2?: T2, t3?: T3, t4?: T4) => R): CurriedFunction2<T1, T2, R> {
    function curriedFunction(t1: T1): (t2: T2) => R;
    function curriedFunction(t1: T1, t2?: T2): R;
    function curriedFunction(t1: T1, t2?: T2): any {
        switch (arguments.length) {
            case 1:
                return function(t2: T2): R {
                    return f(t1, t2);
                }
            case 2:
                return f(t1, t2);
        }
    }
    return curriedFunction;
}
export function curry3<T1, T2, T3, T4, R>(f: (t1: T1, t2?: T2, t3?: T3, t4?: T4) => R): CurriedFunction3<T1, T2, T3, R> {
    function curriedFunction(t1: T1): CurriedFunction2<T2, T3, R>;
    function curriedFunction(t1: T1, t2?: T2): (t3: T3) => R;
    function curriedFunction(t1: T1, t2?: T2, t3?: T3): R;
    function curriedFunction(t1: T1, t2?: T2, t3?: T3): any {
        switch (arguments.length) {
            case 1:
                return curry2(function(t2: T2, t3?: T3): R {
                    return f(t1, t2, t3);
                });
            case 2:
                return function(t3: T3): R {
                    return f(t1, t2, t3);
                };
            case 3:
                return f(t1, t2, t3);
        }
    }
    return curriedFunction;
}
export function curry4<T1, T2, T3, T4, R>(f: (t1: T1, t2?: T2, t3?: T3, t4?: T4) => R): CurriedFunction4<T1, T2, T3, T4, R> {
    function curriedFunction(t1: T1): CurriedFunction3<T2, T3, T4, R>;
    function curriedFunction(t1: T1, t2: T2): CurriedFunction2<T3, T4, R>;
    function curriedFunction(t1: T1, t2: T2, t3: T3): (t4: T4) => R;
    function curriedFunction(t1: T1, t2: T2, t3: T3, t4: T4): R;
    function curriedFunction(t1: T1, t2?: T2, t3?: T3, t4?: T4): any {
        switch (arguments.length) {
            case 1:
                return curry3(function(t2: T2, t3?: T3, t4?: T4): R {
                    return f(t1, t2, t3, t4);
                });
            case 2:
                return curry2(function(t3: T3, t4?: T4): R {
                    return f(t1, t2, t3, t4);
                });
            case 3:
                return function(t4: T4): R {
                    return f(t1, t2, t3, t4);
                };
            case 4:
                return f(t1, t2, t3, t4);
        }
    }
    return curriedFunction;
}
export function curry<T1, T2, T3, T4, R>(f: CurriedFunction<T1, T2, T3, T4, R>): CurriedFunction4<T1, T2, T3, T4, R>;
export function curry<T1, T2, T3, T4, R>(f: CurriedFunction<T1, T2, T3, T4, R>): CurriedFunction3<T1, T2, T3, R>;
export function curry<T1, T2, T3, T4, R>(f: CurriedFunction<T1, T2, T3, T4, R>): CurriedFunction2<T1, T2, R>;
export function curry<T1, T2, T3, T4, R>(f: CurriedFunction<T1, T2, T3, T4, R>): (t1: T1, t2?: T2, t3?: T3, t4?:T4) => R;
export function curry<T1, T2, T3, T4, R>(f: CurriedFunction<T1, T2, T3, T4, R>): CurriedFunction<T1, T2, T3, T4, R> {
    function countArgs(func : string): number {
        const args = func.substring(func.indexOf('(') + 1, func.indexOf(')'));
        if (args.trim().length === 0) {
            return 0;
        }
        let pos = 0;
        let cnt = 0;
        while (pos >= 0) {
            cnt++;
            pos = args.indexOf(',', pos + 1);
        }
        return cnt;
    }
    switch (countArgs(f.toString())) {
        case 0:
            return f;
        case 1:
            return f;
        case 2:
            return curry2(f);
        case 3:
            return curry3(f);
        case 4:
            return curry4(f);
        default:
            throw new SyntaxError(`More than 4 args in ${f.toString()}`);
    }
}
