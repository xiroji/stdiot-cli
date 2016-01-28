import parseArguments from "./parse_arguments";

let BooleanOptionMatcher = /^--(no-){0,1}/;
let SpecialBooleanOptionMatcher = /^--no-/;
let ShortOptionMatcher = /^-[^-](.)*$/;
let LongOptionMatcher = /^--[^-](.)*$/;

class Option {

    constructor(flags, description = "") {
        this.props = {
            isBool: false,
            flag: {
                short: null,
                long: null
            },
            arguments: [],
            value: null
        };
        this.props.description = description;
        this.parse(flags);
    }

    getIsBool() {
        return this.props.isBool;
    }

    setIsBool(bool) {
        this.props.isBool = bool;
    }

    toggle() {
        if (this.getIsBool()) {
            this.setValue(!this.getValue());
        }
    }

    getValue() {
        return this.props.value;
    }

    setValue(name, value) {
      if (!value) {
        this.props.value = name;
      } else {
        this.props.value[name] = value;
      }
    }

    getShortFlag() {
        return this.props.flag.short;
    }

    setShortFlag(flag) {
        this.props.flag.short = flag;
    }

    getLongFlag() {
        return this.props.flag.long;
    }

    setLongFlag(flag) {
        this.props.flag.long = flag;
    }

    getArguments() {
        return this.props.arguments;
    }

    setArguments(argumentValues) {
        this.props.arguments = argumentValues;
    }

    getName() {
        return this.getLongFlag()
            .replace('--', '')
            .replace('no-', '');
    }

    parse(flags) {
        if (!flags) return; // no input provided exit

        let parts = flags.split(",");
        if (parts.length > 1) {
            let sflag = (parts.shift()).trim();
            if (ShortOptionMatcher.test(sflag)) {
                this.setShortFlag(sflag);
            }

            let remaining = parts.shift();
            remaining = remaining.trim();
            remaining = remaining.split(" ");

            let lflag = (remaining.shift()).trim();
            if (LongOptionMatcher.test(lflag)) {
                this.setLongFlag(lflag);
            }
            if (remaining.length > 0) {
                this.setArguments(parseArguments(remaining, flags));
                this.setValue({});
            } else {
                if (BooleanOptionMatcher.test(lflag)) {
                    this.setIsBool(true);
                    if (SpecialBooleanOptionMatcher.test(lflag)) {
                        this.setValue(true);
                    } else {
                        this.setValue(false);
                    }
                }
            }
        } else {
            throw SyntaxError(
                `${flags} does not conform to option specification`
            );
        }
        return this;
    }
}

Option.ShortOptionMatcher = ShortOptionMatcher;
Option.LongOptionMatcher = LongOptionMatcher;

export default Option;
