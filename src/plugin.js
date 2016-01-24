import path from "path";
import fs from "fs";
import defaults from "defaults";

export class Plugin {

    constructor(filename, basename, pluginName, props = {}) {
        this.filename = filename;
        this.basename = basename;
        this.pluginName = pluginName;
        this.props = props;
    }
}

export default class PluginDirectory {

    pluginDirs() {
        let dirs = [];

        if (require.main && Array.isArray(require.main.paths)) {
            dirs.push(path.dirname(require.main.paths[0]));
            dirs = dirs.concat(
                require.main.paths.slice());
        }

        if (process.env.NODE_PATH) {
            dirs.push(process.env.NODE_PATH);
        }

        if (process.env.HOME) {
            dirs.push(path.join(process.env.HOME, '.node_libraries'));
            dirs.push(path.join(process.env.HOME, '.node_modules'));

        }

        if (process.config && process.config.variables) {
            dirs.push(path.join(
                process.config.variables.node_prefix, 'lib/node_modules'));
        }

        return dirs;
    }

    verifyPlugin(plugin, requirements = {}) {
        requirements = defaults(requirements, {
            ext: /^\.js$/ // @todo allow for multiple
        });

        if (plugin.props.stat.isFile()) {
            if (!requirements.ext.test(path.extname(plugin.filename))) {
                return false;
            }
        }

        return true;
    }

    findPlugins(regx = /.*/, pluginPaths = [], opts = {}) {
        opts = defaults(opts, {
            match: new RegExp(""),
            replace: ""
        });

        let plugins = new Map();

        pluginPaths.forEach(pluginPath => {
            let foundPlugins = null;

            try {
                foundPlugins = fs.readdirSync(pluginPath);
            } catch (e) {
                return;
            }

            if (foundPlugins) {
                foundPlugins.forEach(pluginName => {
                    let stat = fs.statSync(path.join(pluginPath, pluginName));

                    if (regx.test(pluginName)) {
                        let pluginShortName = pluginName.replace(
                            opts.match, opts.replace);

                        let plugin = new Plugin(pluginName, pluginPath, 
                            path.basename(pluginShortName, ".js"), {
                            stat: stat
                        });

                        if (!plugins.get(pluginName) && this.verifyPlugin(plugin)) {
                            plugins.set(pluginName, plugin);
                        }
                    }
                });
            }
        });

        return plugins;
    }
}
