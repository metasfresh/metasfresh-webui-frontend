import * as pluginConst from './PluginsConstants';

class PluginsRegistry {
    constructor(hostApplication) {
        this.hostApp = hostApplication;

        this.plugins = [];
    }

    getEntry(pluginName) {
        if (pluginName) {
            return this.plugins.find(
                (plugin) => plugin.name === pluginName
            );
        }
    }

    getPluginFactory(pluginName) {
        let plugin = this.getEntry(pluginName);

        if (plugin) {
            return plugin.factory;
        }
    }

    addEntry(name, factory, priority) {
        let existingEntry = this.getEntry(name);

        if (existingEntry) {
            existingEntry.factory = factory;
            existingEntry.priority = priority;

            return existingEntry;
        }

        let result = {
            name: name,
            factory: factory,
            priority: priority,
            loaded: false,
            mounted: false
        };

        this.plugins.push(result);

        return result;
    }

    register(pluginName, pluginFactory, pluginPriority = 100) {
        if (pluginName && typeof pluginFactory === 'function') {
            return this.addEntry(pluginName, pluginFactory, pluginPriority);
        }
    }

    sendEvent(pluginName, eventName, eventDetails = {}) {
        if (pluginName && eventName) {
            let factory = this.getPluginFactory(pluginName);

            if (factory) {
                return factory(
                    this.hostApp,
                    pluginConst.SEND_EVENT,
                    eventName,
                    eventDetails
                );
            }
        }
    }

    getTitle(pluginName) {
        let factory = this.getPluginFactory(pluginName);
        if (factory) {
            return factory(
                this.hostApp,
                pluginConst.GET_TITLE
            );
        }
    }

    getBreadcrumbs(pluginName) {
        let factory = this.getPluginFactory(pluginName);
        if (factory) {
            return factory(
                this.hostApp,
                pluginConst.GET_BREADCRUMBS
            );
        }
    }

    isEnabled(pluginName) {
        let factory = this.getPluginFactory(pluginName);

        if (factory) {
            return factory(
                this.hostApp,
                pluginConst.GET_ENABLED
            );
        }

        return false;
    }

    load(pluginName) {
        let factory = this.getPluginFactory(pluginName);
        if (factory) {
            let result = factory(
                this.hostApp,
                pluginConst.LOAD
            );

            if (result instanceof Promise) {
                result
                    .then( () => {
                        this.setPluginLoaded(pluginName, true);
                    })
                    .catch( () => {
                        this.setPluginLoaded(pluginName, false);
                    });
            }
            else if (typeof result === 'boolean') {
                this.setPluginLoaded(pluginName, result);
            }

            return result;
        }
    }

    mount(pluginName, container) {
        let factory = this.getPluginFactory(pluginName);
        if (factory) {
            let result = factory(
                this.hostApp,
                pluginConst.MOUNT,
                container
            );

            if (result instanceof Promise) {
                result
                    .then( () => {
                        this.setPluginMounted(pluginName, true);
                    })
                    .catch( () => {
                        this.setPluginMounted(pluginName, false);
                    });
            }
            else if (typeof result === 'boolean') {
                this.setPluginMounted(pluginName, result);
            }

            return result;
        }
    }

    unmount(pluginName, container) {
        let factory = this.getPluginFactory(pluginName);
        if (factory) {
            let result = factory(
                this.hostApp,
                pluginConst.UNMOUNT,
                container
            );

            if (result instanceof Promise) {
                result
                    .then( () => {
                        this.setPluginMounted(pluginName, false);
                    });
            }
            else if (typeof result === 'boolean') {
                this.setPluginMounted(pluginName, result);
            }

            return result;
        }
    }

    setPluginLoaded(pluginName, flag = true) {
        let plugin = this.getEntry(pluginName);

        if (plugin) {
            plugin.loaded = flag;
        }
    }

    setPluginMounted(pluginName, flag = true) {
        let plugin = this.getEntry(pluginName);

        if (plugin) {
            plugin.mounted = flag;
        }
    }

    unload(pluginName) {
        let factory = this.getPluginFactory(pluginName);
        if (factory) {
            let result = factory(
                this.hostApp,
                pluginConst.UNLOAD
            );

            if (result instanceof Promise) {
                result
                    .then( () => {
                        this.setPluginLoaded(pluginName, false);
                    });
            }
            else if (typeof result === 'boolean') {
                this.setPluginLoaded(pluginName, result);
            }

            return result;
        }
    }
}

export default PluginsRegistry;
