// <<<<<<< EXAMPLE
import * as SITE from "globals-site";
import * as CONFIG from "globals-config";
import { is, isString } from "ts-type-guards";
import { h, render } from 'preact';
import { log, logInfo, logWarning, logError } from "userscripter/logging";
import { Preferences } from "userscripter/preference-handling";
import {
    AllowedTypes,
    FromString,
    PreferencesObject,
    PreferenceGroup,
    Preference,
    BooleanPreference,
    IntegerPreference,
    DoublePreference,
    StringPreference,
    RangePreference,
    IntegerRangePreference,
    DoubleRangePreference,
    MultichoicePreference,
} from "ts-preferences";

interface Generators {
    Boolean: (p: BooleanPreference) => JSX.Element
    String: (p: StringPreference) => JSX.Element
    Integer: (p: IntegerPreference) => JSX.Element
    Double: (p: DoublePreference) => JSX.Element
    IntegerRange: (p: IntegerRangePreference) => JSX.Element
    DoubleRange: (p: DoubleRangePreference) => JSX.Element
    Multichoice: <T extends AllowedTypes>(p: MultichoicePreference<T>) => JSX.Element
}

const PREFIX_ID = CONFIG.PREFIX_ID + "option-";
const RANGE_MAX_STEP = 0.1;
const RANGE_MIN_NUMBER_OF_STEPS = 100;

export const GENERATORS: Generators = {
    Boolean: Generator_Boolean,
    String: Generator_String,
    Integer: Generator_Integer,
    Double: Generator_Double,
    IntegerRange: Generator_IntegerRange,
    DoubleRange: Generator_DoubleRange,
    Multichoice: Generator_Multichoice,
};

export const menuGenerator = menuGeneratorWith(GENERATORS);

export function menuGeneratorWith(generators: Generators): (ps: PreferencesObject) => HTMLElement {
    return (ps: PreferencesObject) => {
        const form = document.createElement("form");
        Entries(generators, ps).forEach(entry => {
            render(entry, form);
        });
        form.addEventListener("submit", e => {
            e.preventDefault();
        })
        return form;
    };
}

function changeHandler<
    E extends HTMLElement & { value: string },
    T extends AllowedTypes,
    P extends Preference<T> & FromString<T>,
>(p: P): (e: Event) => void {
    return (e: Event) => {
        const parsed = p.fromString((e.target as E).value);
        if (isString(parsed)) {
            logWarning(parsed);
        } else {
            Preferences.set(p, parsed.value);
        }
    };
}

function prefixedId(id: string): string {
    return PREFIX_ID + id;
}

function Entries(generators: Generators, ps: PreferencesObject): JSX.Element[] {
    return Object.keys(ps).map(k => Entry(generators, ps[k]));
}

function Entry<T extends AllowedTypes>(generators: Generators, p: Preference<T> | PreferenceGroup): JSX.Element {
    return p instanceof Preference
        ? (
            <div id={prefixedId(p.key)} {...{ class: p.extras.class || null }}>
                {InputElement(generators, p)}
                <aside class={CONFIG.CLASS_PREFERENCE_DESCRIPTION}>{p.description}</aside>
            </div>
        ) : (
            <fieldset>
                <legend>{p.label}</legend>
                {Entries(generators, p._)}
            </fieldset>
        );
}

function InputElement<T extends AllowedTypes>(generators: Generators, p: Preference<T>): JSX.Element {
    // Order can be super-important here due to the semantics of instanceof with respect to subclasses.
    if (is(BooleanPreference)(p)) {
        return generators.Boolean(p);
    }
    if (is(StringPreference)(p)) {
        return generators.String(p);
    }
    if (is(IntegerPreference)(p)) {
        return generators.Integer(p);
    }
    if (is(DoublePreference)(p)) {
        return generators.Double(p);
    }
    if (is(IntegerRangePreference)(p)) {
        return generators.IntegerRange(p);
    }
    if (is(DoubleRangePreference)(p)) {
        return generators.DoubleRange(p);
    }
    if (is(MultichoicePreference)(p)) {
        return generators.Multichoice(p);
    }
    throw `Unsupported preference: ${p.getType()} (with key '${p.key}')`;
}

function Generator_Boolean(p: BooleanPreference): JSX.Element {
    return (
        <label>
            <input type="checkbox" checked={Preferences.get(p)} onChange={e => {
                Preferences.set(p, (e.target as HTMLInputElement).checked);
            }} />
            {p.label}
        </label>
    );
}

function Generator_String(p: StringPreference): JSX.Element {
    return (
        <label>
            {p.label}
            {p.multiline
                ?
                <textarea
                    value={Preferences.get(p)}
                    onChange={changeHandler<HTMLTextAreaElement, string, StringPreference>(p)}
                ></textarea>
                :
                <input
                    type="text"
                    value={Preferences.get(p)}
                    onChange={changeHandler<HTMLInputElement, string, StringPreference>(p)}
                />
            }
        </label>
    );
}

function Generator_Integer(p: IntegerPreference): JSX.Element {
    return (
        <label>
            {p.label}
            <input
                type="number"
                value={Preferences.get(p).toString()}
                onChange={changeHandler<HTMLInputElement, number, IntegerPreference>(p)}
            />
        </label>
    );
}

function Generator_Double(p: DoublePreference): JSX.Element {
    return (
        <label>
            {p.label}
            <input
                type="number"
                value={Preferences.get(p).toString()}
                step={RANGE_MAX_STEP}
                onChange={changeHandler<HTMLInputElement, number, DoublePreference>(p)}
            />
        </label>
    );
}

function Generator_IntegerRange(p: IntegerRangePreference): JSX.Element {
    return (
        <label>
            {p.label}
            <input
                type="number"
                value={Preferences.get(p).toString()}
                min={p.min}
                max={p.max}
                onChange={changeHandler<HTMLInputElement, number, IntegerRangePreference>(p)}
            />
        </label>
    );
}

function Generator_DoubleRange(p: DoubleRangePreference): JSX.Element {
    return (
        <label>
            {p.label}
            <input
                type="number"
                value={Preferences.get(p).toString()}
                min={p.min}
                max={p.max}
                step={stepSize(p.min, p.max).toString()}
                onChange={changeHandler<HTMLInputElement, number, DoubleRangePreference>(p)}
            />
        </label>
    );
}

function stepSize(min: number, max: number): number {
    return Math.min(
        RANGE_MAX_STEP,
        Math.pow(10, Math.floor(Math.log10(max - min))) / RANGE_MIN_NUMBER_OF_STEPS
    );
}

function Generator_Multichoice<T extends AllowedTypes>(p: MultichoicePreference<T>): JSX.Element {
    const MAX_RADIO_BUTTONS = 4;
    const emptyList: JSX.Element[] = []
    const savedValue = Preferences.get(p);
    const options = p.options;
    return options.length <= MAX_RADIO_BUTTONS
        ? (
            <fieldset>
                <legend>{p.label}</legend>
                {options.map(option =>
                    RadioButton({
                        p: p,
                        label: option.label,
                        value: option.value,
                        checked: option.value === savedValue,
                    })
                )}
            </fieldset>
        ) : (
            <select onChange={e => {
                const index = (e.target as HTMLSelectElement).selectedIndex;
                if (index >= 0 && index < options.length) {
                    Preferences.set(p, options[index].value);
                }
            }}>
                {options.map(option => <option selected={option.value === savedValue}>{option.label}</option>)}
            </select>
        );
}

function RadioButton<T extends AllowedTypes>({ p, label, value, checked }: { p: MultichoicePreference<T>, label: string, value: T, checked: boolean }): JSX.Element {
    return (
        <label>
            <input
                type="radio"
                name={prefixedId(p.key)}
                checked={checked}
                onChange={e => {
                    if ((e.target as HTMLInputElement).checked) {
                        Preferences.set(p, value);
                    }
                }}
            />
            {label}
        </label>
    );
}
// =======
// >>>>>>> CLEAN
