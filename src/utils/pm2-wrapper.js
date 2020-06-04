const { map, get, isFunction } = require('lodash')
const pm2 = require('pm2')

/**
 * Starts a pm2 process (promisified version of pm2.start)
 * @param {Object} options 
 * @returns {Promise<any>}
 */
const pm2_start_process = (options) => {
    return pm2_connect_cb_disconnect((resolve, reject) => {
        pm2.start(options, (err, proc) => {
            return err ? reject(err) : resolve(simplifyPm2Describe(proc))
        })
    })
}

/**
 * Get information about a pm2 process (promisified version of pm2.describe)
 * @param {String} pid Pm_Id or name
 * @param {Boolean} short Simplified version of the description
 * @returns {Promise<any>}
 */
const pm2_describe = (pid, short = true) => {
    return pm2_connect_cb_disconnect((resolve, reject) => {
        pm2.describe(pid, (err, description) => {
            if (err) {
                return reject(err)
            }
            return resolve(short ? simplifyPm2Describe(description) : description)
        })
    })
}

/**
 * List all running processes on pm2 (promisified version of pm2.list)
 * @returns {Promise<any>}
 */
const pm2_list = () => {
    return pm2_connect_cb_disconnect((resolve, reject) => {
        pm2.list((err, description) => {
            if (err) {
                return reject(err)
            }
            return resolve(simplifyPm2Describe(description))
        })
    })
}

/**
 * Simplifies the output from pm2.list and pm2.describe
 * @param {any[]} description
 * @returns {any[]}
 */
const simplifyPm2Describe = (description) => {
    return map(description, (d) => {
        return {
            status: get(d, 'pm2_env.status'),
            pid: get(d, 'pid'),
            name: get(d, 'name'),
            version: get(d, 'pm2_env.version'),
            pm_id: get(d, 'pm_id'),
            created_at: new Date(get(d, 'pm2_env.created_at')),
            pm_uptime: (new Date()).getTime() - (get(d, 'pm2_env.created_at') || 0),
            namespace: get(d, 'pm2_env.namespace'),
            autorestart: get(d, 'pm2_env.autorestart'),
            watch: get(d, 'pm2_env.watch'),
            memory: (get(d, 'monit.memory') || 0) / 1000000.0,
            cpu: get(d, 'monit.cpu')
        }
    })
}

/**
 * Kills a process being ran by pm2 (promisified version of pm2.delete)
 * @param {String} pid pm_id or name
 * @returns {Promise<Boolean>} 
 */
const pm2_kill_process = (pid) => {
    return pm2_connect_cb_disconnect((resolve, reject) => {
        pm2.delete(pid, (err) => {
            return err ? reject(err) : resolve(true)
        })
    })
}

/**
 * Stops a running process on pm2, but doesn't remove it from pm2 management (promisified version of pm2.stop)
 * @param {String} pid pm_id or name
 * @returns {Promise<any>}
 */
const pm2_stop_process = (pid) => {
    return pm2_connect_cb_disconnect((resolve, reject) => {
        pm2.stop(pid, (err) => {
            return err ? reject(err) : resolve(true)
        })
    })
}

/**
 * Restarts a running process on pm2 (promisified version of pm2.restart)
 * @param {String} pid pm_id or name
 * @returns {Promise<any>}
 */
const pm2_restart_process = (pid) => {
    return pm2_connect_cb_disconnect((resolve, reject) => {
        pm2.restart(pid, (err) => {
            return err ? reject(err) : resolve(true)
        })
    })
}

/**
 * Wrapper to stablish connection with pm2 daemon, execute command and close connection
 * @param {*} cb 
 */
const pm2_connect_cb_disconnect = (cb) => {

    // If cb is not a function, break out of the function
    if (!isFunction(cb)) {
        return Promise.reject('cb is not a function')
    }    

    return new Promise((resolve, reject) => {

        // Function wrapper on original resolve to always disconnect before resolve
        const innerResolve = (any) => { 
            pm2.disconnect()
            resolve(any)
        }

        // Function wrapper on original reject to always disconnect before reject
        const innerReject = (any) => {
            pm2.disconnect()
            reject(any)
        }

        pm2.connect(false, (err) => {
            if (err) {
                return innerReject(err)
            }
            return cb(innerResolve, innerReject)
        })
    })
}

module.exports = {
    pm2_start_process,
    pm2_describe,
    pm2_list,
    pm2_stop_process,
    pm2_kill_process,
    pm2_restart_process
}