#!/usr/bin/env node 
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _babelPolyfill = require("babel-polyfill");

var _babelPolyfill2 = _interopRequireDefault(_babelPolyfill);

var _liftoff = require("liftoff");

var _liftoff2 = _interopRequireDefault(_liftoff);

var _chalk = require("chalk");

var _chalk2 = _interopRequireDefault(_chalk);

var _tildify = require("tildify");

var _tildify2 = _interopRequireDefault(_tildify);

var _package = require("./../package.json");

var _fs = require("fs");

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _package2 = require("../package.json");

var _package3 = _interopRequireDefault(_package2);

var _stdiotPlugin = require("./stdiot-plugin");

var _stdiotPlugin2 = _interopRequireDefault(_stdiotPlugin);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var moduleName = 'stdiot-cli';
var name = "stdiot";

var liftoff = new _liftoff2.default({
    name: name,
    moduleName: moduleName,
    configName: 'package.',
    extensions: {
        'json': null
    }
});

var Cli = function () {
    function Cli(name) {
        _classCallCheck(this, Cli);

        this.commandsList = new Array();
        this.commands = new Map();
        return this;
    }

    _createClass(Cli, [{
        key: "name",
        value: function name(_name) {
            this.name = _name;
            return this;
        }
    }, {
        key: "version",
        value: function version(_version) {
            this.version = _version;
            return this;
        }
    }, {
        key: "command",
        value: function command(name, description, invoke) {
            this.commandsList.push({
                name: name,
                description: description
            });

            this.commands.set(name, {
                invoke: invoke
            });
        }
    }, {
        key: "start",
        value: function start(args) {

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
    }, {
        key: "pad",
        value: function pad(str, width) {
            var len = Math.max(0, width - str.length);
            return str + Array(len + 1).join(' ');
        }
    }, {
        key: "help",
        value: function help() {
            var _this = this;

            console.log("Usage: " + this.name + " [command]");
            console.log();
            console.log();
            console.log("Commands:");
            var maxWidth = this.commandsList.reduce(function (max, command) {
                return Math.max(max, command.name.length);
            }, 0);
            this.commandsList.forEach(function (c) {
                console.log("\t" + _this.pad(c.name, maxWidth) + "\t" + c.description);
            });
            console.log();
            console.log("help:");
        }
    }]);

    return Cli;
}();

var program = new Cli();

program.name(name).version(_package3.default.version);

var verifyLocalStdiot = function verifyLocalStdiot(env) {
    if (!env.modulePath) {
        console.log(_chalk2.default.red("error: " + moduleName + " not found in"), _chalk2.default.red((0, _tildify2.default)(env.configBase)), _chalk2.default.red("Try running: npm install " + moduleName));
        process.exit(1);
    }
};

var verifyGitInit = function verifyGitInit(env) {
    try {
        (0, _fs.statSync)(_path2.default.join(env.configBase, '.git'));
        env.gitVerified = true;
    } catch (e) {
        console.log(_chalk2.default.yellow("warning: project doesn't appear to be initialized with git.", (0, _tildify2.default)(env.configBase), ". Run `git init`."));
    }
};

var parseConfig = function parseConfig(env) {
    env.configData = JSON.parse((0, _fs.readFileSync)(env.configPath, 'utf-8'));
};

var invoke = function invoke(env) {

    verifyLocalStdiot(env);

    if (env.configPath) {
        if ((0, _tildify2.default)(env.configBase) !== (0, _tildify2.default)(process.cwd())) {
            console.log(_chalk2.default.cyan("loading config from: ", (0, _tildify2.default)(env.configPath)));
        }
        parseConfig(env);
        verifyGitInit(env);
    }

    var pluginDirectory = new _stdiotPlugin2.default();
    pluginDirectory.findPlugins();
    pluginDirectory.registerPlugins();

    pluginDirectory.plugins.forEach(function (p) {
        program.command(p.pluginName, p.description, p.invoke);
    });

    program.start(process.argv);
};

liftoff.launch({}, invoke);
//# sourceMappingURL=cli.js.map
