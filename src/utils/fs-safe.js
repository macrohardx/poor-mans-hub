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
 * Verify if a user has access to a file
 * @param {fs} fsModule 
 * @param {String} pathToFile 
 * @returns {Promise<Boolean>}
 */
const verifyIfFileExists = (fsModule, pathToFile) =>
    new Promise((success) =>
        fsModule.access(pathToFile, (err) =>
            success(!err)))

module.exports = {
    safeRemoveFolder,
    safeCreateDirectory,
    verifyIfFileExists
}