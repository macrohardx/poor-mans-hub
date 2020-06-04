const { 
    pm2_describe, 
    pm2_kill_process, 
    pm2_stop_process, 
    pm2_start_process, 
    pm2_restart_process,
    pm2_list
} = require('./utils/pm2-wrapper')

const Manager = class {

    constructor() {

    }

    /** 
     * Runs a script managed by pm2 detached from main process
     * 
     * @param script {String} path to script
     * @param name {String} alias for process reference
     * @parma watch {Boolean} Start script on watch mode. (restarts upon file changes)
     * @returns {Promise<any>}
     */
    run(script, name) {
        return pm2_start_process({ script, name, watch: false })
    }

    watch(script, name) {
        return pm2_start_process({ script, name, watch: true })
    }

    restart(pid) {
        return pm2_restart_process(pid);
    }

    stop(pid) {
        return pm2_stop_process(pid)
    }

    /**
     * Kills a process by it's alias or process ID (pid)
     * 
     * @param {Number|String} arg Process Id or alias
     */
    kill(pid) {
        return pm2_kill_process(pid)
    }

    /**
     * 
     * @param {*} pid 
     */
    describe(pid) {
        return pm2_describe(pid)
    }

    list() {
        return pm2_list();
    }
}

module.exports = () => {
    return new Manager()
}