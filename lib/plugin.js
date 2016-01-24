"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Plugin = undefined;

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _defaults = require("defaults");

var _defaults2 = _interopRequireDefault(_defaults);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Plugin = exports.Plugin = function Plugin(filename, basename, pluginName) {
    var props = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

    _classCallCheck(this, Plugin);

    this.filename = filename;
    this.basename = basename;
    this.pluginName = pluginName;
    this.props = props;
};

var PluginDirectory = function () {
    function PluginDirectory() {
        _classCallCheck(this, PluginDirectory);
    }

    _createClass(PluginDirectory, [{
        key: "pluginDirs",
        value: function pluginDirs() {
            var dirs = [];

            if (require.main && Array.isArray(require.main.paths)) {
                dirs.push(_path2.default.dirname(require.main.paths[0]));
                dirs = dirs.concat(require.main.paths.slice());
            }

            if (process.env.NODE_PATH) {
                dirs.push(process.env.NODE_PATH);
            }

            if (process.env.HOME) {
                dirs.push(_path2.default.join(process.env.HOME, '.node_libraries'));
                dirs.push(_path2.default.join(process.env.HOME, '.node_modules'));
            }

            if (process.config && process.config.variables) {
                dirs.push(_path2.default.join(process.config.variables.node_prefix, 'lib/node_modules'));
            }

            return dirs;
        }
    }, {
        key: "verifyPlugin",
        value: function verifyPlugin(plugin) {
            var requirements = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

            requirements = (0, _defaults2.default)(requirements, {
                ext: /^\.js$/ // @todo allow for multiple
            });

            if (plugin.props.stat.isFile()) {
                if (!requirements.ext.test(_path2.default.extname(plugin.filename))) {
                    return false;
                }
            }

            return true;
        }
    }, {
        key: "findPlugins",
        value: function findPlugins() {
            var regx = arguments.length <= 0 || arguments[0] === undefined ? /.*/ : arguments[0];

            var _this = this;

            var pluginPaths = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];
            var opts = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

            opts = (0, _defaults2.default)(opts, {
                match: new RegExp(""),
                replace: ""
            });

            var plugins = new Map();

            pluginPaths.forEach(function (pluginPath) {
                var foundPlugins = null;

                try {
                    foundPlugins = _fs2.default.readdirSync(pluginPath);
                } catch (e) {
                    return;
                }

                if (foundPlugins) {
                    foundPlugins.forEach(function (pluginName) {
                        var stat = _fs2.default.statSync(_path2.default.join(pluginPath, pluginName));

                        if (regx.test(pluginName)) {
                            var pluginShortName = pluginName.replace(opts.match, opts.replace);

                            var plugin = new Plugin(pluginName, pluginPath, _path2.default.basename(pluginShortName, ".js"), {
                                stat: stat
                            });

                            if (!plugins.get(pluginName) && _this.verifyPlugin(plugin)) {
                                plugins.set(pluginName, plugin);
                            }
                        }
                    });
                }
            });

            return plugins;
        }
    }]);

    return PluginDirectory;
}();

exports.default = PluginDirectory;
//# sourceMappingURL=plugin.js.map
