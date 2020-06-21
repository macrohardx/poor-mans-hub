const { contains } = require('lodash/fp')
const EventEmitter = require('events')

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

module.exports = {
    safeReportProgress,
    isValidProgressType,
    reportProgress,
    progressReporterIsEventEmitter
}