import PluginDirectory from "./plugin";
import path from "path";

export default class StdiotPlugins extends PluginDirectory {

    findPlugins() {
        this.plugins = super.findPlugins(/^stdiot-cli-plugin-(.*)$/,
            this.pluginDirs(), {
                match: /stdiot-cli-plugin-/,
                replace: ""
            });
    }

    registerPlugins() {
        this.plugins.forEach(p => {
            if (p.props.stat.isFile()) {
                let module = require(path.join(p.basename, p.filename));
                p._module = module.default || module;
                p.description = p._module.description || "";
                p.invoke = (program, done) => {
                    p._module.invoke(program, done);
                }
            }
        });
    }
}
