const EventEmitter = require('events')
const { contains } = require('lodash/fp')

/**
 * Publishes a project
 * @param {Object} gitModule 
 * @param {Object} fsModule 
 * @param {Object} childProcessModule 
 * @param {Object} pathModule 
 * @param {String} repositoryPath 
 * @param {String} publishPath
 * @param {EventEmitter} progressReporter
 * @returns {Promise<void>}
 */
const publishProject = (gitModule, fsModule, removeFolder, childProcessModule, pathModule, repositoryPath, publishPath, progressReporter) =>
    safeRemoveFolder(removeFolder, publishPath)
        .then(() => safeReportProgress(progressReporter, 'progress', `Directory '${publishPath}' cleaned\nCloning repository...`))
        .then(() => cloneToDestination(gitModule, fsModule, repositoryPath, publishPath, progressReporter))
        .then(() => safeReportProgress(progressReporter, 'progress', `${repositoryPath} cloned to ${publishPath}\nInstalling dependencies...`))
        .then(() => installProjectDependencies(childProcessModule, fsModule, pathModule, publishPath, progressReporter))
        .then(() => safeReportProgress(progressReporter, 'progress', `Dependencies installed`))


/**
 * Safely deletes a folder an all it's contents. 'Promisified' version of rmdir that doesn't throw
 * @param {Object} fsModule 
 * @param {String} pathToRemove 
 * @returns {Promise<void>}
 */
const safeRemoveFolder = (removeFolder, pathToRemove) =>
    new Promise((success, failure) =>
        removeFolder(pathToRemove, (err) =>
            err ? failure(new Error(err))
                : success(true)))

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
 * Safely creates a directory. 'Promisified' version of mkdir that doesn't throw
 * @param {Object} fsModule 
 * @param {String} pathToCreate 
 * @returns {Promise<void>}
 */
const safeCreateDirectory = (fsModule, pathToCreate) =>
    new Promise((success, fail) =>
        fsModule.mkdir(pathToCreate, (err) =>
            err ? fail(new Error(err))
                : success(true)))

/**
 * Install npm dependencies of a project, creating node_module folder if it doesn't exist
 * @param {Object} childProcessModule 
 * @param {Object} fsModule 
 * @param {Object} pathModule 
 * @param {String} pathToProject
 * @returns {Promise<void>} 
 */
const installProjectDependencies = (childProcessModule, fsModule, pathModule, pathToProject) =>
    // node_modules folder needs to be created beforehand or npm might search for a module folder higher up in hierarchy 
    safeCreateDirectory(fsModule, pathModule.join(pathToProject, 'node_modules'))
        .then(() => npmInstall(childProcessModule, pathToProject))

// TODO Verify if project is node and has package.json       
/**
 * Installs npm packages of a project
 * @param {Object | fs} childProcessModule 
 * @param {String} pathToProject 
 * @returns {Promise<void>}
 */
const npmInstall = (childProcessModule, pathToProject) =>
    new Promise((success, fail) =>
        childProcessModule.exec(`npm install`, { shell: true, cwd: pathToProject }, (err) =>
            err ? fail(new Error(err))
                : success(true)))

// Move to it's own file
const safeReportProgress = (progressReporter, type, msg) =>
    Promise.resolve(
        progressReporterIsEventEmitter(progressReporter) &&
        isValidProgressType(type) &&
        reportProgress(progressReporter, type, msg))

const isValidProgressType = (type) =>
    contains(type, ['progress', 'error'])

const reportProgress = (progressReporter, type, msg) =>
    progressReporter.emit(type, msg) || true

const progressReporterIsEventEmitter = (progressReporter) =>
    progressReporter instanceof EventEmitter


// Testing    
// const fs = require('fs')
// const git = require('simple-git/promise')()
// const child = require('child_process')
// const path = require('path')
// const rimraf = require('rimraf')
// const foo = () => {
//     const repoPath = 'https://github.com/lndr27/empty-node.git'
//     const localPath = 'C:\\users\\lndr2\\desktop\\aqui'

//     //npmInstall(child, 'C:\\users\\lndr2\\desktop\\zz')

//     var e = new EventEmitter()
//     publishProject(git, fs, rimraf, child, path, repoPath, localPath, e)
//     .then(a => console.log('done'))
//     .catch(err => console.log('uhoh something went wrong... ', err))
//     e.on('progress', (msg) => {
//         console.log(msg)
//     })


// }
// foo()

module.exports = {
    cloneToDestination,
    installProjectDependencies,
    npmInstall,
    safeCreateDirectory,
    safeRemoveFolder,
    publishProject
}
// 1- clone repo inside publish folder

// 2- install dependencies

// 2.1- run tests ? (CI)

// 3- get main file from package.json

// 4- add main file to reference table

// 5- start process with pm2 (optional)