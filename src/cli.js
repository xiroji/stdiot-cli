#!/usr/bin/env node 

import pollyfill from "babel-polyfill";

import Liftoff from "liftoff";
import chalk from "chalk";
import tildify from "tildify";
import {version} from "./../package.json";
import {statSync, readFileSync} from 'fs';
import path from "path";
import ini from "ini";
import pkg from "../package.json";

import PluginDirectory from './stdiot-plugin';

const moduleName = 'stdiot-cli';
const name = "stdiot";

const liftoff = new Liftoff({
    name: name,
    moduleName: moduleName,
    configName: 'package.',
    extensions: {
        'json': null
    }
});

class Cli {

    constructor(name) {
        this.commandsList = new Array;
        this.commands = new Map();
        return this;
    }

    name(name) {
        this.name = name;
        return this;
    }

    version(version) {
        this.version = version;
        return this;
    }

    command(name, description, invoke) {
        this.commandsList.push({
            name: name,
            description: description
        });

        this.commands.set(name, {
            invoke: invoke
        });
    }

    start(args) {

        this.args = args;

        args.shift();
        args.shift();

        if (args.length < 1) {
            this.help();
        } else {
            var command = this.commands.get(args[0]);
            command.invoke(this);
        }
    }

    pad(str, width) {
        var len = Math.max(0, width - str.length);
        return str + Array(len + 1).join(' ');
    }

    help() {
        console.log(`Usage: ${this.name} [command]`);
        console.log();
        console.log();
        console.log("Commands:");
        let maxWidth = this.commandsList.reduce(function(max, command) {
            return Math.max(max, command.name.length);
        }, 0);
        this.commandsList.forEach((c) => {
            console.log(`\t${this.pad(c.name, maxWidth)}\t${c.description}`);
        });
        console.log();
        console.log("help:");
    }
}

let program = new Cli();

program
    .name(name)
    .version(pkg.version);


const verifyLocalStdiot = function(env) {
    if (!env.modulePath) {
        console.log(
            chalk.red(`error: ${moduleName} not found in`),
            chalk.red(tildify(env.configBase)),
            chalk.red(`Try running: npm install ${moduleName}`)
        );
        process.exit(1);
    }
}

const verifyGitInit = function(env) {
    try {
        statSync(path.join(env.configBase, '.git'));
        env.gitVerified = true;
    } catch (e) {
        console.log(chalk.yellow(
            "warning: project doesn't appear to be initialized with git.",
            tildify(env.configBase),
            ". Run `git init`."));
    }
}

const parseConfig = function(env) {
    env.configData = JSON.parse(readFileSync(env.configPath, 'utf-8'));
}

const invoke = function(env) {

    verifyLocalStdiot(env);

    if (env.configPath) {
        if (tildify(env.configBase) !== tildify(process.cwd())) {
            console.log(chalk.cyan(
                "loading config from: ", tildify(env.configPath))
            );
        }
        parseConfig(env);
        verifyGitInit(env);
    }

    let pluginDirectory = new PluginDirectory();
    pluginDirectory.findPlugins();
    pluginDirectory.registerPlugins();

    pluginDirectory.plugins.forEach(p => {
        program.command(p.pluginName, p.description, p.invoke);
    });

    program.start(process.argv);
}

liftoff.launch({}, invoke);
