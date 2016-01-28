import parseArguments from "./parse_arguments";
import Option from "./option";

export default class Command {

    constructor(command, description="") {
        this.props = {
            action:null,
            options: [],
            arguments: [],
            description: description
        }
        this.parse(command);
        return this;
    }

    getName() {
        return this.props.command;
    }

    setName(name) {
        this.props.command = name.trim();
        return this;
    }

    getDescription() {
        return this.props.description;
    }

    setDescription(description) {
        this.props.description = description;
        return this;
    }

    getAction() {
        return this.props.action;
    }

    setAction(fn) {
        this.props.action = fn;
        return this;
    }

    getArguments() {
        return this.props.arguments;
    }

    setArguments(argumentValues) {
        this.props.arguments = argumentValues;
        return this;
    }

    getOptions() {
        return this.props.options;
    }

    addOption(option) {
        this.props.options.push(new Option(option))
        return this;
    }

    parse(command) {
        if (!command) return;
        let parts = command.split(" ");
        this.setName(parts.shift());
        if (parts.length > 0) {
            this.setArguments(parseArguments(parts));
        }
        return this;
    }
}
