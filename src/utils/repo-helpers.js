const { curry } = require('lodash/fp')
const { safeReportProgress } = require('./progress-reporter')
const { safeRemoveFolder, safeCreateDirectory, verifyIfFileExists } = require('./fs-safe')

/**
 * Publishes a project
 * @param {SimpleGit} gitModule 
 * @param {fs} fsModule 
 * @param {childProcess} childProcessModule 
 * @param {path} pathModule 
 * @param {String} repositoryPath 
 * @param {String} publishPath
 * @param {EventEmitter} progressReporter
 * @returns {Promise<void>}
 */
const publishProject = curry((gitModule, fsModule, removeFolder, childProcessModule, pathModule, repositoryPath, publishPath, progressReporter) =>
    safeRemoveFolder(removeFolder, publishPath)
        .then(() => safeReportProgress(progressReporter, 'progress', `Directory '${publishPath}' cleaned\nCloning repository...`))
        .then(() => cloneToDestination(gitModule, fsModule, repositoryPath, publishPath, progressReporter))
        .then(() => safeReportProgress(progressReporter, 'progress', `${repositoryPath} cloned to ${publishPath}\nInstalling dependencies...`))
        .then(() => installProjectDependencies(childProcessModule, fsModule, pathModule, publishPath, progressReporter))
        .then(() => safeReportProgress(progressReporter, 'progress', `Dependencies installed`)))

/**
 * Clones a remote repository into a destination folder
 * @param {Object} gitModule 
 * @param {Object} fsModule 
 * @param {String} repositoryPath 
 * @param {String} publishPath 
 * @returns {Promise<void>}
 */
const cloneToDestination = (gitModule, fsModule, repositoryPath, publishPath) =>
    safeCreateDirectory(fsModule, publishPath)
        .then(() => gitModule.clone(repositoryPath, publishPath))

/**
 * Install npm dependencies of a project, creating node_module folder if it doesn't exist
 * @param {Object} childProcessModule 
 * @param {Object} fsModule 
 * @param {Object} pathModule 
 * @param {String} pathToProject
 * @returns {Promise<void>} 
 */
const installProjectDependencies = (childProcessModule, fsModule, pathModule, pathToProject) =>
    isNodeProject(fsModule, pathModule, pathToProject)
        .then((isNodeProject) =>
            isNodeProject ? installNodeModules(childProcessModule, fsModule, pathModule, pathToProject)
                : Promise.resolve(true))

/**
 * Verifies if a path contains a package.json indicating that it's a npm project
 * @param {fs} fsModule 
 * @param {path} pathModule 
 * @param {String} pathToProject 
 * @returns {Promise<Boolean>}
 */
const isNodeProject = (fsModule, pathModule, pathToProject) =>
    verifyIfFileExists(fsModule, pathModule.join(pathToProject, 'package.json'))

/**
 * Installs node modules
 * @param {*} childProcessModule 
 * @param {*} fsModule 
 * @param {*} pathModule 
 * @param {*} pathToProject 
 * @returns {Promise<void>}
 */
const installNodeModules = (childProcessModule, fsModule, pathModule, pathToProject) =>
    // node_modules folder needs to be created beforehand or npm might search for a module folder higher up in hierarchy
    safeCreateDirectory(fsModule, pathModule.join(pathToProject, 'node_modules'))
        .then(() => execNpmInstall(childProcessModule, pathToProject))

/**
 * Installs npm packages of a project
 * @param {Object | fs} childProcessModule 
 * @param {String} pathToProject 
 * @returns {Promise<void>}
 */
const execNpmInstall = (childProcessModule, pathToProject) =>
    new Promise((success, fail) =>
        childProcessModule.exec(`npm install`, { shell: true, cwd: pathToProject }, (err) =>
            err ? fail(new Error(err))
                : success(true)))

const fs = require('fs')
const git = require('simple-git/promise')()
const child = require('child_process')
const path = require('path')
const rimraf = require('rimraf')


const defaultPublishProject = publishProject(git, fs, rimraf, child, path)

module.exports = {
    defaultPublishProject,
    publishProject,
    cloneToDestination,
    installProjectDependencies,
    isNodeProject,
    installNodeModules,
    execNpmInstall
}


// 1- clone repo inside publish folder

// 2- install dependencies

// 2.1- run tests ? (CI)

// 3- get main file from package.json

// 4- add main file to reference table

// 5- start process with pm2 (optional)