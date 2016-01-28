import Command from "./command";
import Option from "./option";

export default class CommandSet {

    constructor(name) {
        this.props = {
            commands: [],
            options: [],
            name: name,
            version: null,
            parsed: {},
            description: ""
        }
        return this;
    }

    getName() {
        return this.props.name;
    }

    setName(name) {
        this.props.name = name;
        return this;
    }

    getVersion(version) {
        return this.props.version;
    }

    setVersion() {
        this.props.version = version;
        return this;
    }

    addOption(option, description) {
        this.props.options.push(new Option(option, description));
        return this;
    }

    getOptions() {
        return this.props.options;
    }

    invoke() {

    }

    description(description) {
        if (!description) {
            return this.props.description;
        }
        this.props.description = description;
    }

    addCommand(command, description) {
        let cmd = new Command(command, description);
        this.props.commands.push(cmd);
        return cmd;
    }

    getCommands() {
        return this.props.commands;
    }

    getParsed() {
        return this.props.parsed;
    }

    start(args) {
        if (args.length < 1) {
            this.help();
        } else {
            try {
                this.parseArgs(args);
            } catch(e) {
                this.handleError(e);
            }
        }
    }

    parseArgs(args) {
        let command = this;

        while(args.length > 0) {
            let arg = (args.shift()).trim();

            if (arg === "-h" || arg === "--help") {
                command.help();
                break;
            }

            if (Option.ShortOptionMatcher.test(arg) ||
                Option.LongOptionMatcher.test(arg)) {

                let option = command.getOptions().find((o) => {
                    return (o.getShortFlag() === arg) || o.getLongFlag() === arg;
                });

                if (option) {
                    this.processOption(option, args);
                } else {
                    throw SyntaxError(`${arg} not recognized`);
                }
            } else if (this.isCommand(arg)){
                command = this.searchCommands(arg);
            } else if (arg === "--") {
                let nextArg = (args.shift()).trim();
                if (nextArg && this.isCommand(nextArg)) {
                    command = this.searchCommands(nextArg);
                } else {
                    this.props.parsed['--'] = args.unshift(nextArg);
                    break;
                }
            } else {
                throw Error(`Don't know how to process ${arg}`);
            }
        }
    }

    processOption(option, args, index) {
        if (option.getIsBool()) {
            option.toggle();
        }

        option.getArguments().every(optArg => {
            let arg = args.shift();
            let isCommand = this.isCommand(arg);
            let validOption = this.isValidOptionValue(arg);

            if (optArg.required && validOption) {
                option.setValue(optArg.name, arg);
            } else if (optArg.optional && !isCommand && validOption){
                option.setValue(optArg.name, arg);
            } else if (optArg.optional && isCommand) {
                let message = [
                    `--${option.name} allows for an optional paramater called`,
                    `[${optArg.name}]. However, the value "${arg}" provided`,
                    `is also a command. Use a -- to make your intention`,
                    `clear. See help for usage.`
                ].join(' ');
                throw SyntaxError(message);
            } else {
                args.unshift(arg);
                return false;
            }

            return true;
        });

        this.props.parsed[option.getName()] = option;
    }

    isValidOptionValue(arg) {
        if (Option.ShortOptionMatcher.test(arg) ||
            Option.LongOptionMatcher.test(arg) ||
            /^--$/.test(arg)) {

            return false;
        } else {
            return true;
        }
    }

    isCommand(name) {
        if (this.searchCommands(name)) {
            return true;
        } else {
            return false;
        }
    }

    searchCommands(name) {
        return this.getCommands().find(function(command) {
            return (command.getName() === name);
        });
    }

    handleError(e) {
        console.log();
        if (e instanceof SyntaxError) {
            console.log(e.message);
        } else {
            console.log(e);
        }
        console.log();
    }

    pad(str, width) {
        var len = Math.max(0, width - str.length);
        return str + Array(len + 1).join(' ');
    }

    help() {
        console.log();
        console.log(`  Usage: ${this.name} [options] [command]`);
        console.log();
        console.log();
        console.log("  Commands:");
        console.log();
        let maxWidth = this.commands.reduce(function(max, command) {
            return Math.max(max, command.name.length);
        }, 0);
        this.commands.forEach((c) => {
            console.log(`    ${this.pad(c.name, maxWidth)}\t${c.description}`);
        });
        console.log();
        console.log("  help:");
        console.log();
        console.log(
            `    Use: ${this.name} [command] --help for info on a `,
            `specific command`
        );
        console.log();
    }
}
