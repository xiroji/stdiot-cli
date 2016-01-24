"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _plugin = require("./plugin");

var _plugin2 = _interopRequireDefault(_plugin);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var StdiotPlugins = function (_PluginDirectory) {
    _inherits(StdiotPlugins, _PluginDirectory);

    function StdiotPlugins() {
        _classCallCheck(this, StdiotPlugins);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(StdiotPlugins).apply(this, arguments));
    }

    _createClass(StdiotPlugins, [{
        key: "findPlugins",
        value: function findPlugins() {
            this.plugins = _get(Object.getPrototypeOf(StdiotPlugins.prototype), "findPlugins", this).call(this, /^stdiot-cli-plugin-(.*)$/, this.pluginDirs(), {
                match: /stdiot-cli-plugin-/,
                replace: ""
            });
        }
    }, {
        key: "registerPlugins",
        value: function registerPlugins() {
            this.plugins.forEach(function (p) {
                if (p.props.stat.isFile()) {
                    var module = require(_path2.default.join(p.basename, p.filename));
                    p._module = module.default || module;
                    p.description = p._module.description || "";
                    p.invoke = function (program, done) {
                        p._module.invoke(program, done);
                    };
                }
            });
        }
    }]);

    return StdiotPlugins;
}(_plugin2.default);

exports.default = StdiotPlugins;
//# sourceMappingURL=stdiot-plugin.js.map
