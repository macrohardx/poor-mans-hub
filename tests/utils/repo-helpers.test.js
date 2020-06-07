const { 
    cloneToDestination,
    installProjectDependencies,
    npmInstall,
    safeCreateDirectory,
    safeCleanFolder,
    publishProject
}  = require('../../src/utils/repo-helpers')

const { describe, it } = require('mocha')
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
const { expect } = chai

describe('repo-helper.js', () => {

    class fsModuleBadStub {
        rmdir(_path, cb) { cb(new Error('👿')) }
        mkdir(_path, cb) { cb(new Error('😈') )}
    }

    class fsModuleGoodStub {
        rmdir(_path, cb) { cb(undefined) }
        mkdir(_path, cb) { cb(undefined) }
    }

    describe('safeCleanFolder when called', () => {       

        it('should work with good fs module', () => {
            return expect(safeCleanFolder(new fsModuleGoodStub(), 'my_path'))
                .to.eventually.be.fulfilled.and
                .to.be.true
        })

        it('should fail with instance of error with fs module', () => {
            return expect(safeCleanFolder(new fsModuleBadStub(), 'my_path'))
                .to.be.eventually.rejected.and
                .to.be.an.instanceOf(Error)
        })

        it('should fail with no fs module', () => {
            return expect(safeCleanFolder(undefined, 'my_path'))
                .to.be.rejected
        })
    })

    describe('safeCreatePath when called', () => {

        it('should resolve to true with good fs module', () => {
            return expect(safeCreatePath(new fsModuleGoodStub(), 'my_path'))
                .to.eventually.be.fulfilled.and
                .to.be.true
        })

        it('should fail with bad fs module', () => {
            return expect(safeCreatePath(new fsModuleBadStub(), 'my_path'))
                .to.eventually.be.rejected.and
                .to.be.an.instanceOf(Error)
        })

        it('should fail with no fs module', () => {
            return expect(safeCreatePath(undefined, 'my_path'))
                .to.eventually.be.rejected
        })
    })
})