import node_sass_utils from "node-sass-utils";
import sass from "sass";
import { isString } from "ts-type-guards";

const SassUtils = node_sass_utils(sass);

export function getGlobalFrom(objectToBeExposedToSass: object): (keyString: sass.types.SassType) => sass.types.SassType {
    const sassVars = toSassDimension_recursively(objectToBeExposedToSass);
    return keyString => {
        if (keyString instanceof sass.types.String) {
            const wholeName = keyString.getValue();
            return SassUtils.castToSass(dig(sassVars, wholeName.split("."), wholeName));
        } else {
            throw new TypeError(`Expected a string as argument, but saw: ${keyString}`);
        }
    };
}

function toSassDimension(s: string): SassDimension {
    const CSS_UNITS = [ "rem", "em", "vh", "vw", "vmin", "vmax", "ex", "%", "px", "cm", "mm", "in", "pt", "pc", "ch" ];
    const parts = s.match(/^([\.0-9]+)([a-zA-Z]+)$/);
    if (parts === null) {
        return s;
    }
    const number = parts[1];
    const unit = parts[2];
    if (CSS_UNITS.includes(unit)) {
        return new SassUtils.SassDimension(parseInt(number, 10), unit);
    }
    return s;
}

function toSassDimension_recursively(x: any): any {
    if (isString(x)) {
        return toSassDimension(x);
    } else if (typeof x === "object") {
        const result: any = {};
        Object.keys(x).forEach(key => {
            result[key] = toSassDimension_recursively(x[key]);
        });
        return result;
    } else {
        return x;
    }
}

function dig(obj: any, keys: string[], wholeName: string): any {
    if (keys.length === 0) {
        return obj;
    } else {
        const deeper = obj[keys[0]];
        if (deeper === undefined) {
            throw new Error(`Unknown global: '${wholeName}' (failed on '${keys[0]}')`);
        }
        return dig(deeper, keys.slice(1), wholeName);
    }
}
