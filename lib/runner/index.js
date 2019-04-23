'use strict';

exports.__esModule = true;

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _path = require('path');

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _pinkie = require('pinkie');

var _pinkie2 = _interopRequireDefault(_pinkie);

var _promisifyEvent = require('promisify-event');

var _promisifyEvent2 = _interopRequireDefault(_promisifyEvent);

var _mapReverse = require('map-reverse');

var _mapReverse2 = _interopRequireDefault(_mapReverse);

var _events = require('events');

var _lodash = require('lodash');

var _bootstrapper = require('./bootstrapper');

var _bootstrapper2 = _interopRequireDefault(_bootstrapper);

var _reporter = require('../reporter');

var _reporter2 = _interopRequireDefault(_reporter);

var _task = require('./task');

var _task2 = _interopRequireDefault(_task);

var _runtime = require('../errors/runtime');

var _types = require('../errors/types');

var _typeAssertions = require('../errors/runtime/type-assertions');

var _utils = require('../errors/test-run/utils');

var _detectFfmpeg = require('../utils/detect-ffmpeg');

var _detectFfmpeg2 = _interopRequireDefault(_detectFfmpeg);

var _checkFilePath = require('../utils/check-file-path');

var _checkFilePath2 = _interopRequireDefault(_checkFilePath);

var _handleErrors = require('../utils/handle-errors');

var _optionNames = require('../configuration/option-names');

var _optionNames2 = _interopRequireDefault(_optionNames);

var _flagList = require('../utils/flag-list');

var _flagList2 = _interopRequireDefault(_flagList);

var _prepareReporters = require('../utils/prepare-reporters');

var _prepareReporters2 = _interopRequireDefault(_prepareReporters);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const DEBUG_LOGGER = (0, _debug2.default)('testcafe:runner');

class Runner extends _events.EventEmitter {
    constructor(proxy, browserConnectionGateway, configuration) {
        super();

        this.proxy = proxy;
        this.bootstrapper = this._createBootstrapper(browserConnectionGateway);
        this.pendingTaskPromises = [];
        this.configuration = configuration;
        this.isCli = false;

        this.apiMethodWasCalled = new _flagList2.default({
            initialFlagValue: false,
            flags: [_optionNames2.default.src, _optionNames2.default.browsers, _optionNames2.default.reporter]
        });
    }

    _createBootstrapper(browserConnectionGateway) {
        return new _bootstrapper2.default(browserConnectionGateway);
    }

    _disposeBrowserSet(browserSet) {
        return browserSet.dispose().catch(e => DEBUG_LOGGER(e));
    }

    _disposeReporters(reporters) {
        return _pinkie2.default.all(reporters.map(reporter => reporter.dispose().catch(e => DEBUG_LOGGER(e))));
    }

    _disposeTestedApp(testedApp) {
        return testedApp ? testedApp.kill().catch(e => DEBUG_LOGGER(e)) : _pinkie2.default.resolve();
    }

    _disposeTaskAndRelatedAssets(task, browserSet, reporters, testedApp) {
        var _this = this;

        return (0, _asyncToGenerator3.default)(function* () {
            task.abort();
            task.clearListeners();

            yield _this._disposeAssets(browserSet, reporters, testedApp);
        })();
    }

    _disposeAssets(browserSet, reporters, testedApp) {
        return _pinkie2.default.all([this._disposeBrowserSet(browserSet), this._disposeReporters(reporters), this._disposeTestedApp(testedApp)]);
    }

    _prepareArrayParameter(array) {
        array = (0, _lodash.flattenDeep)(array);

        if (this.isCli) return array.length === 0 ? void 0 : array;

        return array;
    }

    _createCancelablePromise(taskPromise) {
        const promise = taskPromise.then(({ completionPromise }) => completionPromise);
        const removeFromPending = () => (0, _lodash.pull)(this.pendingTaskPromises, promise);

        promise.then(removeFromPending).catch(removeFromPending);

        promise.cancel = () => taskPromise.then(({ cancelTask }) => cancelTask()).then(removeFromPending);

        this.pendingTaskPromises.push(promise);
        return promise;
    }

    // Run task
    _getFailedTestCount(task, reporter) {
        let failedTestCount = reporter.testCount - reporter.passed;

        if (task.opts.stopOnFirstFail && !!failedTestCount) failedTestCount = 1;

        return failedTestCount;
    }

    _getTaskResult(task, browserSet, reporters, testedApp) {
        var _this2 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            task.on('browser-job-done', function (job) {
                return browserSet.releaseConnection(job.browserConnection);
            });

            const browserSetErrorPromise = (0, _promisifyEvent2.default)(browserSet, 'error');

            const taskDonePromise = task.once('done').then(function () {
                return browserSetErrorPromise.cancel();
            });

            const promises = [taskDonePromise, browserSetErrorPromise];

            if (testedApp) promises.push(testedApp.errorPromise);

            try {
                yield _pinkie2.default.race(promises);
            } catch (err) {
                yield _this2._disposeTaskAndRelatedAssets(task, browserSet, reporters, testedApp);

                throw err;
            }

            yield _this2._disposeAssets(browserSet, reporters, testedApp);

            return _this2._getFailedTestCount(task, reporters[0]);
        })();
    }

    _createTask(tests, browserConnectionGroups, proxy, opts) {
        return new _task2.default(tests, browserConnectionGroups, proxy, opts);
    }

    _runTask(reporterPlugins, browserSet, tests, testedApp) {
        var _this3 = this;

        let completed = false;
        const task = this._createTask(tests, browserSet.browserConnectionGroups, this.proxy, this.configuration.getOptions());
        const reporters = reporterPlugins.map(reporter => new _reporter2.default(reporter.plugin, task, reporter.outStream));
        const completionPromise = this._getTaskResult(task, browserSet, reporters, testedApp);

        task.on('start', _handleErrors.startHandlingTestErrors);

        if (!this.configuration.getOption(_optionNames2.default.skipUncaughtErrors)) {
            task.once('test-run-start', _handleErrors.addRunningTest);
            task.once('test-run-done', _handleErrors.removeRunningTest);
        }

        task.on('done', _handleErrors.stopHandlingTestErrors);

        const setCompleted = () => {
            completed = true;
        };

        completionPromise.then(setCompleted).catch(setCompleted);

        const cancelTask = (() => {
            var _ref = (0, _asyncToGenerator3.default)(function* () {
                if (!completed) yield _this3._disposeTaskAndRelatedAssets(task, browserSet, reporters, testedApp);
            });

            return function cancelTask() {
                return _ref.apply(this, arguments);
            };
        })();

        return { completionPromise, cancelTask };
    }

    _registerAssets(assets) {
        assets.forEach(asset => this.proxy.GET(asset.path, asset.info));
    }

    _validateSpeedOption() {
        const speed = this.configuration.getOption(_optionNames2.default.speed);

        if (speed === void 0) return;

        if (typeof speed !== 'number' || isNaN(speed) || speed < 0.01 || speed > 1) throw new _runtime.GeneralError(_types.RUNTIME_ERRORS.invalidSpeedValue);
    }

    _validateConcurrencyOption() {
        const concurrency = this.configuration.getOption(_optionNames2.default.concurrency);

        if (concurrency === void 0) return;

        if (typeof concurrency !== 'number' || isNaN(concurrency) || concurrency < 1) throw new _runtime.GeneralError(_types.RUNTIME_ERRORS.invalidConcurrencyFactor);
    }

    _validateProxyBypassOption() {
        let proxyBypass = this.configuration.getOption(_optionNames2.default.proxyBypass);

        if (proxyBypass === void 0) return;

        (0, _typeAssertions.assertType)([_typeAssertions.is.string, _typeAssertions.is.array], null, '"proxyBypass" argument', proxyBypass);

        if (typeof proxyBypass === 'string') proxyBypass = [proxyBypass];

        proxyBypass = proxyBypass.reduce((arr, rules) => {
            (0, _typeAssertions.assertType)(_typeAssertions.is.string, null, '"proxyBypass" argument', rules);

            return arr.concat(rules.split(','));
        }, []);

        this.configuration.mergeOptions({ proxyBypass });
    }

    _validateScreenshotOptions() {
        const screenshotPath = this.configuration.getOption(_optionNames2.default.screenshotPath);
        const screenshotPathPattern = this.configuration.getOption(_optionNames2.default.screenshotPathPattern);

        if (screenshotPath) {
            this._validateScreenshotPath(screenshotPath, 'screenshots base directory path');

            this.configuration.mergeOptions({ [_optionNames2.default.screenshotPath]: (0, _path.resolve)(screenshotPath) });
        }

        if (screenshotPathPattern) this._validateScreenshotPath(screenshotPathPattern, 'screenshots path pattern');

        if (!screenshotPath && screenshotPathPattern) throw new _runtime.GeneralError(_types.RUNTIME_ERRORS.cannotUseScreenshotPathPatternWithoutBaseScreenshotPathSpecified);
    }

    _validateVideoOptions() {
        var _this4 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            const videoPath = _this4.configuration.getOption(_optionNames2.default.videoPath);
            const videoEncodingOptions = _this4.configuration.getOption(_optionNames2.default.videoEncodingOptions);

            let videoOptions = _this4.configuration.getOption(_optionNames2.default.videoOptions);

            if (!videoPath) {
                if (videoOptions || videoEncodingOptions) throw new _runtime.GeneralError(_types.RUNTIME_ERRORS.cannotSetVideoOptionsWithoutBaseVideoPathSpecified);

                return;
            }

            _this4.configuration.mergeOptions({ [_optionNames2.default.videoPath]: (0, _path.resolve)(videoPath) });

            if (!videoOptions) {
                videoOptions = {};

                _this4.configuration.mergeOptions({ [_optionNames2.default.videoOptions]: videoOptions });
            }

            if (videoOptions.ffmpegPath) videoOptions.ffmpegPath = (0, _path.resolve)(videoOptions.ffmpegPath);else videoOptions.ffmpegPath = yield (0, _detectFfmpeg2.default)();

            if (!videoOptions.ffmpegPath) throw new _runtime.GeneralError(_types.RUNTIME_ERRORS.cannotFindFFMPEG);
        })();
    }

    _validateRunOptions() {
        var _this5 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            _this5._validateScreenshotOptions();
            yield _this5._validateVideoOptions();
            _this5._validateSpeedOption();
            _this5._validateConcurrencyOption();
            _this5._validateProxyBypassOption();
        })();
    }

    _createRunnableConfiguration() {
        return this.bootstrapper.createRunnableConfiguration().then(runnableConfiguration => {
            this.emit('done-bootstrapping');

            return runnableConfiguration;
        });
    }

    _validateScreenshotPath(screenshotPath, pathType) {
        const forbiddenCharsList = (0, _checkFilePath2.default)(screenshotPath);

        if (forbiddenCharsList.length) throw new _runtime.GeneralError(_types.RUNTIME_ERRORS.forbiddenCharatersInScreenshotPath, screenshotPath, pathType, (0, _utils.renderForbiddenCharsList)(forbiddenCharsList));
    }

    _setBootstrapperOptions() {
        this.configuration.prepare();
        this.configuration.notifyAboutOverridenOptions();

        this.bootstrapper.sources = this.configuration.getOption(_optionNames2.default.src) || this.bootstrapper.sources;
        this.bootstrapper.browsers = this.configuration.getOption(_optionNames2.default.browsers) || this.bootstrapper.browsers;
        this.bootstrapper.concurrency = this.configuration.getOption(_optionNames2.default.concurrency);
        this.bootstrapper.appCommand = this.configuration.getOption(_optionNames2.default.appCommand) || this.bootstrapper.appCommand;
        this.bootstrapper.appInitDelay = this.configuration.getOption(_optionNames2.default.appInitDelay);
        this.bootstrapper.filter = this.configuration.getOption(_optionNames2.default.filter) || this.bootstrapper.filter;
        this.bootstrapper.reporters = this.configuration.getOption(_optionNames2.default.reporter) || this.bootstrapper.reporters;
    }

    // API
    embeddingOptions(opts) {
        const assets = opts.assets,
              TestRunCtor = opts.TestRunCtor;


        this._registerAssets(assets);
        this.configuration.mergeOptions({ TestRunCtor });

        return this;
    }

    src(...sources) {
        if (this.apiMethodWasCalled.src) throw new _runtime.GeneralError(_types.RUNTIME_ERRORS.multipleAPIMethodCallForbidden, _optionNames2.default.src);

        sources = this._prepareArrayParameter(sources);
        this.configuration.mergeOptions({ [_optionNames2.default.src]: sources });

        this.apiMethodWasCalled.src = true;

        return this;
    }

    browsers(...browsers) {
        if (this.apiMethodWasCalled.browsers) throw new _runtime.GeneralError(_types.RUNTIME_ERRORS.multipleAPIMethodCallForbidden, _optionNames2.default.browsers);

        browsers = this._prepareArrayParameter(browsers);
        this.configuration.mergeOptions({ browsers });

        this.apiMethodWasCalled.browsers = true;

        return this;
    }

    concurrency(concurrency) {
        this.configuration.mergeOptions({ concurrency });

        return this;
    }

    reporter(name, output) {
        if (this.apiMethodWasCalled.reporter) throw new _runtime.GeneralError(_types.RUNTIME_ERRORS.multipleAPIMethodCallForbidden, _optionNames2.default.reporter);

        let reporters = (0, _prepareReporters2.default)(name, output);

        reporters = this._prepareArrayParameter(reporters);

        this.configuration.mergeOptions({ [_optionNames2.default.reporter]: reporters });

        this.apiMethodWasCalled.reporter = true;

        return this;
    }

    filter(filter) {
        this.configuration.mergeOptions({ filter });

        return this;
    }

    useProxy(proxy, proxyBypass) {
        this.configuration.mergeOptions({ proxy, proxyBypass });

        return this;
    }

    screenshots(path, takeOnFails, pattern) {
        this.configuration.mergeOptions({
            [_optionNames2.default.screenshotPath]: path,
            [_optionNames2.default.takeScreenshotsOnFails]: takeOnFails,
            [_optionNames2.default.screenshotPathPattern]: pattern
        });

        return this;
    }

    video(path, options, encodingOptions) {
        this.configuration.mergeOptions({
            [_optionNames2.default.videoPath]: path,
            [_optionNames2.default.videoOptions]: options,
            [_optionNames2.default.videoEncodingOptions]: encodingOptions
        });

        return this;
    }

    startApp(command, initDelay) {
        this.configuration.mergeOptions({
            [_optionNames2.default.appCommand]: command,
            [_optionNames2.default.appInitDelay]: initDelay
        });

        return this;
    }

    run(options = {}) {
        this.apiMethodWasCalled.reset();

        const skipJsErrors = options.skipJsErrors,
              disablePageReloads = options.disablePageReloads,
              quarantineMode = options.quarantineMode,
              debugMode = options.debugMode,
              selectorTimeout = options.selectorTimeout,
              assertionTimeout = options.assertionTimeout,
              pageLoadTimeout = options.pageLoadTimeout,
              speed = options.speed,
              debugOnFail = options.debugOnFail,
              skipUncaughtErrors = options.skipUncaughtErrors,
              stopOnFirstFail = options.stopOnFirstFail;


        this.configuration.mergeOptions({
            skipJsErrors: skipJsErrors,
            disablePageReloads: disablePageReloads,
            quarantineMode: quarantineMode,
            debugMode: debugMode,
            debugOnFail: debugOnFail,
            selectorTimeout: selectorTimeout,
            assertionTimeout: assertionTimeout,
            pageLoadTimeout: pageLoadTimeout,
            speed: speed,
            skipUncaughtErrors: skipUncaughtErrors,
            stopOnFirstFail: stopOnFirstFail
        });

        this._setBootstrapperOptions();

        const runTaskPromise = _pinkie2.default.resolve().then(() => this._validateRunOptions()).then(() => this._createRunnableConfiguration()).then(({ reporterPlugins, browserSet, tests, testedApp }) => {
            return this._runTask(reporterPlugins, browserSet, tests, testedApp);
        });

        return this._createCancelablePromise(runTaskPromise);
    }

    stop() {
        var _this6 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            // NOTE: When taskPromise is cancelled, it is removed from
            // the pendingTaskPromises array, which leads to shifting indexes
            // towards the beginning. So, we must copy the array in order to iterate it,
            // or we can perform iteration from the end to the beginning.
            const cancellationPromises = (0, _mapReverse2.default)(_this6.pendingTaskPromises, function (taskPromise) {
                return taskPromise.cancel();
            });

            yield _pinkie2.default.all(cancellationPromises);
        })();
    }
}
exports.default = Runner;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydW5uZXIvaW5kZXguanMiXSwibmFtZXMiOlsiREVCVUdfTE9HR0VSIiwiUnVubmVyIiwiY29uc3RydWN0b3IiLCJwcm94eSIsImJyb3dzZXJDb25uZWN0aW9uR2F0ZXdheSIsImNvbmZpZ3VyYXRpb24iLCJib290c3RyYXBwZXIiLCJfY3JlYXRlQm9vdHN0cmFwcGVyIiwicGVuZGluZ1Rhc2tQcm9taXNlcyIsImlzQ2xpIiwiYXBpTWV0aG9kV2FzQ2FsbGVkIiwiaW5pdGlhbEZsYWdWYWx1ZSIsImZsYWdzIiwic3JjIiwiYnJvd3NlcnMiLCJyZXBvcnRlciIsIl9kaXNwb3NlQnJvd3NlclNldCIsImJyb3dzZXJTZXQiLCJkaXNwb3NlIiwiY2F0Y2giLCJlIiwiX2Rpc3Bvc2VSZXBvcnRlcnMiLCJyZXBvcnRlcnMiLCJhbGwiLCJtYXAiLCJfZGlzcG9zZVRlc3RlZEFwcCIsInRlc3RlZEFwcCIsImtpbGwiLCJyZXNvbHZlIiwiX2Rpc3Bvc2VUYXNrQW5kUmVsYXRlZEFzc2V0cyIsInRhc2siLCJhYm9ydCIsImNsZWFyTGlzdGVuZXJzIiwiX2Rpc3Bvc2VBc3NldHMiLCJfcHJlcGFyZUFycmF5UGFyYW1ldGVyIiwiYXJyYXkiLCJsZW5ndGgiLCJfY3JlYXRlQ2FuY2VsYWJsZVByb21pc2UiLCJ0YXNrUHJvbWlzZSIsInByb21pc2UiLCJ0aGVuIiwiY29tcGxldGlvblByb21pc2UiLCJyZW1vdmVGcm9tUGVuZGluZyIsImNhbmNlbCIsImNhbmNlbFRhc2siLCJwdXNoIiwiX2dldEZhaWxlZFRlc3RDb3VudCIsImZhaWxlZFRlc3RDb3VudCIsInRlc3RDb3VudCIsInBhc3NlZCIsIm9wdHMiLCJzdG9wT25GaXJzdEZhaWwiLCJfZ2V0VGFza1Jlc3VsdCIsIm9uIiwicmVsZWFzZUNvbm5lY3Rpb24iLCJqb2IiLCJicm93c2VyQ29ubmVjdGlvbiIsImJyb3dzZXJTZXRFcnJvclByb21pc2UiLCJ0YXNrRG9uZVByb21pc2UiLCJvbmNlIiwicHJvbWlzZXMiLCJlcnJvclByb21pc2UiLCJyYWNlIiwiZXJyIiwiX2NyZWF0ZVRhc2siLCJ0ZXN0cyIsImJyb3dzZXJDb25uZWN0aW9uR3JvdXBzIiwiX3J1blRhc2siLCJyZXBvcnRlclBsdWdpbnMiLCJjb21wbGV0ZWQiLCJnZXRPcHRpb25zIiwicGx1Z2luIiwib3V0U3RyZWFtIiwiZ2V0T3B0aW9uIiwic2tpcFVuY2F1Z2h0RXJyb3JzIiwic2V0Q29tcGxldGVkIiwiX3JlZ2lzdGVyQXNzZXRzIiwiYXNzZXRzIiwiZm9yRWFjaCIsImFzc2V0IiwiR0VUIiwicGF0aCIsImluZm8iLCJfdmFsaWRhdGVTcGVlZE9wdGlvbiIsInNwZWVkIiwiaXNOYU4iLCJpbnZhbGlkU3BlZWRWYWx1ZSIsIl92YWxpZGF0ZUNvbmN1cnJlbmN5T3B0aW9uIiwiY29uY3VycmVuY3kiLCJpbnZhbGlkQ29uY3VycmVuY3lGYWN0b3IiLCJfdmFsaWRhdGVQcm94eUJ5cGFzc09wdGlvbiIsInByb3h5QnlwYXNzIiwic3RyaW5nIiwicmVkdWNlIiwiYXJyIiwicnVsZXMiLCJjb25jYXQiLCJzcGxpdCIsIm1lcmdlT3B0aW9ucyIsIl92YWxpZGF0ZVNjcmVlbnNob3RPcHRpb25zIiwic2NyZWVuc2hvdFBhdGgiLCJzY3JlZW5zaG90UGF0aFBhdHRlcm4iLCJfdmFsaWRhdGVTY3JlZW5zaG90UGF0aCIsImNhbm5vdFVzZVNjcmVlbnNob3RQYXRoUGF0dGVybldpdGhvdXRCYXNlU2NyZWVuc2hvdFBhdGhTcGVjaWZpZWQiLCJfdmFsaWRhdGVWaWRlb09wdGlvbnMiLCJ2aWRlb1BhdGgiLCJ2aWRlb0VuY29kaW5nT3B0aW9ucyIsInZpZGVvT3B0aW9ucyIsImNhbm5vdFNldFZpZGVvT3B0aW9uc1dpdGhvdXRCYXNlVmlkZW9QYXRoU3BlY2lmaWVkIiwiZmZtcGVnUGF0aCIsImNhbm5vdEZpbmRGRk1QRUciLCJfdmFsaWRhdGVSdW5PcHRpb25zIiwiX2NyZWF0ZVJ1bm5hYmxlQ29uZmlndXJhdGlvbiIsImNyZWF0ZVJ1bm5hYmxlQ29uZmlndXJhdGlvbiIsInJ1bm5hYmxlQ29uZmlndXJhdGlvbiIsImVtaXQiLCJwYXRoVHlwZSIsImZvcmJpZGRlbkNoYXJzTGlzdCIsImZvcmJpZGRlbkNoYXJhdGVyc0luU2NyZWVuc2hvdFBhdGgiLCJfc2V0Qm9vdHN0cmFwcGVyT3B0aW9ucyIsInByZXBhcmUiLCJub3RpZnlBYm91dE92ZXJyaWRlbk9wdGlvbnMiLCJzb3VyY2VzIiwiYXBwQ29tbWFuZCIsImFwcEluaXREZWxheSIsImZpbHRlciIsImVtYmVkZGluZ09wdGlvbnMiLCJUZXN0UnVuQ3RvciIsIm11bHRpcGxlQVBJTWV0aG9kQ2FsbEZvcmJpZGRlbiIsIm5hbWUiLCJvdXRwdXQiLCJ1c2VQcm94eSIsInNjcmVlbnNob3RzIiwidGFrZU9uRmFpbHMiLCJwYXR0ZXJuIiwidGFrZVNjcmVlbnNob3RzT25GYWlscyIsInZpZGVvIiwib3B0aW9ucyIsImVuY29kaW5nT3B0aW9ucyIsInN0YXJ0QXBwIiwiY29tbWFuZCIsImluaXREZWxheSIsInJ1biIsInJlc2V0Iiwic2tpcEpzRXJyb3JzIiwiZGlzYWJsZVBhZ2VSZWxvYWRzIiwicXVhcmFudGluZU1vZGUiLCJkZWJ1Z01vZGUiLCJzZWxlY3RvclRpbWVvdXQiLCJhc3NlcnRpb25UaW1lb3V0IiwicGFnZUxvYWRUaW1lb3V0IiwiZGVidWdPbkZhaWwiLCJydW5UYXNrUHJvbWlzZSIsInN0b3AiLCJjYW5jZWxsYXRpb25Qcm9taXNlcyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQTs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOztBQUNBOztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7OztBQUVBLE1BQU1BLGVBQWUscUJBQU0saUJBQU4sQ0FBckI7O0FBRWUsTUFBTUMsTUFBTiw4QkFBa0M7QUFDN0NDLGdCQUFhQyxLQUFiLEVBQW9CQyx3QkFB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QU8sS0FBS1csd0JBQUwsQ0FBOEJtSCxjQUE5QixDQUFQO0FBQ0g7O0FBRUtDLFFBQU4sR0FBYztBQUFBOztBQUFBO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBTUMsdUJBQXVCLDBCQUFXLE9BQUtsSixtQkFBaEIsRUFBcUM7QUFBQSx1QkFBZThCLFlBQVlLLE1BQVosRUFBZjtBQUFBLGFBQXJDLENBQTdCOztBQUVBLGtCQUFNLGlCQUFRcEIsR0FBUixDQUFZbUksb0JBQVosQ0FBTjtBQVBVO0FBUWI7QUF4YTRDO2tCQUE1QnpKLE0iLCJmaWxlIjoicnVubmVyL2luZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgcmVzb2x2ZSBhcyByZXNvbHZlUGF0aCB9IGZyb20gJ3BhdGgnO1xuaW1wb3J0IGRlYnVnIGZyb20gJ2RlYnVnJztcbmltcG9ydCBQcm9taXNlIGZyb20gJ3BpbmtpZSc7XG5pbXBvcnQgcHJvbWlzaWZ5RXZlbnQgZnJvbSAncHJvbWlzaWZ5LWV2ZW50JztcbmltcG9ydCBtYXBSZXZlcnNlIGZyb20gJ21hcC1yZXZlcnNlJztcbmltcG9ydCB7IEV2ZW50RW1pdHRlciB9IGZyb20gJ2V2ZW50cyc7XG5pbXBvcnQgeyBmbGF0dGVuRGVlcCBhcyBmbGF0dGVuLCBwdWxsIGFzIHJlbW92ZSB9IGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgQm9vdHN0cmFwcGVyIGZyb20gJy4vYm9vdHN0cmFwcGVyJztcbmltcG9ydCBSZXBvcnRlciBmcm9tICcuLi9yZXBvcnRlcic7XG5pbXBvcnQgVGFzayBmcm9tICcuL3Rhc2snO1xuaW1wb3J0IHsgR2VuZXJhbEVycm9yIH0gZnJvbSAnLi4vZXJyb3JzL3J1bnRpbWUnO1xuaW1wb3J0IHsgUlVOVElNRV9FUlJPUlMgfSBmcm9tICcuLi9lcnJvcnMvdHlwZXMnO1xuaW1wb3J0IHsgYXNzZXJ0VHlwZSwgaXMgfSBmcm9tICcuLi9lcnJvcnMvcnVudGltZS90eXBlLWFzc2VydGlvbnMnO1xuaW1wb3J0IHsgcmVuZGVyRm9yYmlkZGVuQ2hhcnNMaXN0IH0gZnJvbSAnLi4vZXJyb3JzL3Rlc3QtcnVuL3V0aWxzJztcbmltcG9ydCBkZXRlY3RGRk1QRUcgZnJvbSAnLi4vdXRpbHMvZGV0ZWN0LWZmbXBlZyc7XG5pbXBvcnQgY2hlY2tGaWxlUGF0aCBmcm9tICcuLi91dGlscy9jaGVjay1maWxlLXBhdGgnO1xuaW1wb3J0IHsgYWRkUnVubmluZ1Rlc3QsIHJlbW92ZVJ1bm5pbmdUZXN0LCBzdGFydEhhbmRsaW5nVGVzdEVycm9ycywgc3RvcEhhbmRsaW5nVGVzdEVycm9ycyB9IGZyb20gJy4uL3V0aWxzL2hhbmRsZS1lcnJvcnMnO1xuaW1wb3J0IE9QVElPTl9OQU1FUyBmcm9tICcuLi9jb25maWd1cmF0aW9uL29wdGlvbi1uYW1lcyc7XG5pbXBvcnQgRmxhZ0xpc3QgZnJvbSAnLi4vdXRpbHMvZmxhZy1saXN0JztcbmltcG9ydCBwcmVwYXJlUmVwb3J0ZXJzIGZyb20gJy4uL3V0aWxzL3ByZXBhcmUtcmVwb3J0ZXJzJztcblxuY29uc3QgREVCVUdfTE9HR0VSID0gZGVidWcoJ3Rlc3RjYWZlOnJ1bm5lcicpO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSdW5uZXIgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xuICAgIGNvbnN0cnVjdG9yIChwcm94eSwgYnJvd3NlckNvbm5lY3Rpb25HYXRld2F5LCBjb25maWd1cmF0aW9uKSB7XG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgdGhpcy5wcm94eSAgICAgICAgICAgICAgID0gcHJveHk7XG4gICAgICAgIHRoaXMuYm9vdHN0cmFwcGVyICAgICAgICA9IHRoaXMuX2NyZWF0ZUJvb3RzdHJhcHBlcihicm93c2VyQ29ubmVjdGlvbkdhdGV3YXkpO1xuICAgICAgICB0aGlzLnBlbmRpbmdUYXNrUHJvbWlzZXMgPSBbXTtcbiAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uICAgICAgID0gY29uZmlndXJhdGlvbjtcbiAgICAgICAgdGhpcy5pc0NsaSAgICAgICAgICAgICAgID0gZmFsc2U7XG5cbiAgICAgICAgdGhpcy5hcGlNZXRob2RXYXNDYWxsZWQgPSBuZXcgRmxhZ0xpc3Qoe1xuICAgICAgICAgICAgaW5pdGlhbEZsYWdWYWx1ZTogZmFsc2UsXG4gICAgICAgICAgICBmbGFnczogICAgICAgICAgICBbT1BUSU9OX05BTUVTLnNyYywgT1BUSU9OX05BTUVTLmJyb3dzZXJzLCBPUFRJT05fTkFNRVMucmVwb3J0ZXJdXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIF9jcmVhdGVCb290c3RyYXBwZXIgKGJyb3dzZXJDb25uZWN0aW9uR2F0ZXdheSkge1xuICAgICAgICByZXR1cm4gbmV3IEJvb3RzdHJhcHBlcihicm93c2VyQ29ubmVjdGlvbkdhdGV3YXkpO1xuICAgIH1cblxuICAgIF9kaXNwb3NlQnJvd3NlclNldCAoYnJvd3NlclNldCkge1xuICAgICAgICByZXR1cm4gYnJvd3NlclNldC5kaXNwb3NlKCkuY2F0Y2goZSA9PiBERUJVR19MT0dHRVIoZSkpO1xuICAgIH1cblxuICAgIF9kaXNwb3NlUmVwb3J0ZXJzIChyZXBvcnRlcnMpIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKHJlcG9ydGVycy5tYXAocmVwb3J0ZXIgPT4gcmVwb3J0ZXIuZGlzcG9zZSgpLmNhdGNoKGUgPT4gREVCVUdfTE9HR0VSKGUpKSkpO1xuICAgIH1cblxuICAgIF9kaXNwb3NlVGVzdGVkQXBwICh0ZXN0ZWRBcHApIHtcbiAgICAgICAgcmV0dXJuIHRlc3RlZEFwcCA/IHRlc3RlZEFwcC5raWxsKCkuY2F0Y2goZSA9PiBERUJVR19MT0dHRVIoZSkpIDogUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgfVxuXG4gICAgYXN5bmMgX2Rpc3Bvc2VUYXNrQW5kUmVsYXRlZEFzc2V0cyAodGFzaywgYnJvd3NlclNldCwgcmVwb3J0ZXJzLCB0ZXN0ZWRBcHApIHtcbiAgICAgICAgdGFzay5hYm9ydCgpO1xuICAgICAgICB0YXNrLmNsZWFyTGlzdGVuZXJzKCk7XG5cbiAgICAgICAgYXdhaXQgdGhpcy5fZGlzcG9zZUFzc2V0cyhicm93c2VyU2V0LCByZXBvcnRlcnMsIHRlc3RlZEFwcCk7XG4gICAgfVxuXG4gICAgX2Rpc3Bvc2VBc3NldHMgKGJyb3dzZXJTZXQsIHJlcG9ydGVycywgdGVzdGVkQXBwKSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLmFsbChbXG4gICAgICAgICAgICB0aGlzLl9kaXNwb3NlQnJvd3NlclNldChicm93c2VyU2V0KSxcbiAgICAgICAgICAgIHRoaXMuX2Rpc3Bvc2VSZXBvcnRlcnMocmVwb3J0ZXJzKSxcbiAgICAgICAgICAgIHRoaXMuX2Rpc3Bvc2VUZXN0ZWRBcHAodGVzdGVkQXBwKVxuICAgICAgICBdKTtcbiAgICB9XG5cbiAgICBfcHJlcGFyZUFycmF5UGFyYW1ldGVyIChhcnJheSkge1xuICAgICAgICBhcnJheSA9IGZsYXR0ZW4oYXJyYXkpO1xuXG4gICAgICAgIGlmICh0aGlzLmlzQ2xpKVxuICAgICAgICAgICAgcmV0dXJuIGFycmF5Lmxlbmd0aCA9PT0gMCA/IHZvaWQgMCA6IGFycmF5O1xuXG4gICAgICAgIHJldHVybiBhcnJheTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2FuY2VsYWJsZVByb21pc2UgKHRhc2tQcm9taXNlKSB7XG4gICAgICAgIGNvbnN0IHByb21pc2UgICAgICAgICAgID0gdGFza1Byb21pc2UudGhlbigoeyBjb21wbGV0aW9uUHJvbWlzZSB9KSA9PiBjb21wbGV0aW9uUHJvbWlzZSk7XG4gICAgICAgIGNvbnN0IHJlbW92ZUZyb21QZW5kaW5nID0gKCkgPT4gcmVtb3ZlKHRoaXMucGVuZGluZ1Rhc2tQcm9taXNlcywgcHJvbWlzZSk7XG5cbiAgICAgICAgcHJvbWlzZVxuICAgICAgICAgICAgLnRoZW4ocmVtb3ZlRnJvbVBlbmRpbmcpXG4gICAgICAgICAgICAuY2F0Y2gocmVtb3ZlRnJvbVBlbmRpbmcpO1xuXG4gICAgICAgIHByb21pc2UuY2FuY2VsID0gKCkgPT4gdGFza1Byb21pc2VcbiAgICAgICAgICAgIC50aGVuKCh7IGNhbmNlbFRhc2sgfSkgPT4gY2FuY2VsVGFzaygpKVxuICAgICAgICAgICAgLnRoZW4ocmVtb3ZlRnJvbVBlbmRpbmcpO1xuXG4gICAgICAgIHRoaXMucGVuZGluZ1Rhc2tQcm9taXNlcy5wdXNoKHByb21pc2UpO1xuICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICB9XG5cbiAgICAvLyBSdW4gdGFza1xuICAgIF9nZXRGYWlsZWRUZXN0Q291bnQgKHRhc2ssIHJlcG9ydGVyKSB7XG4gICAgICAgIGxldCBmYWlsZWRUZXN0Q291bnQgPSByZXBvcnRlci50ZXN0Q291bnQgLSByZXBvcnRlci5wYXNzZWQ7XG5cbiAgICAgICAgaWYgKHRhc2sub3B0cy5zdG9wT25GaXJzdEZhaWwgJiYgISFmYWlsZWRUZXN0Q291bnQpXG4gICAgICAgICAgICBmYWlsZWRUZXN0Q291bnQgPSAxO1xuXG4gICAgICAgIHJldHVybiBmYWlsZWRUZXN0Q291bnQ7XG4gICAgfVxuXG4gICAgYXN5bmMgX2dldFRhc2tSZXN1bHQgKHRhc2ssIGJyb3dzZXJTZXQsIHJlcG9ydGVycywgdGVzdGVkQXBwKSB7XG4gICAgICAgIHRhc2sub24oJ2Jyb3dzZXItam9iLWRvbmUnLCBqb2IgPT4gYnJvd3NlclNldC5yZWxlYXNlQ29ubmVjdGlvbihqb2IuYnJvd3NlckNvbm5lY3Rpb24pKTtcblxuICAgICAgICBjb25zdCBicm93c2VyU2V0RXJyb3JQcm9taXNlID0gcHJvbWlzaWZ5RXZlbnQoYnJvd3NlclNldCwgJ2Vycm9yJyk7XG5cbiAgICAgICAgY29uc3QgdGFza0RvbmVQcm9taXNlID0gdGFzay5vbmNlKCdkb25lJylcbiAgICAgICAgICAgIC50aGVuKCgpID0+IGJyb3dzZXJTZXRFcnJvclByb21pc2UuY2FuY2VsKCkpO1xuXG5cbiAgICAgICAgY29uc3QgcHJvbWlzZXMgPSBbXG4gICAgICAgICAgICB0YXNrRG9uZVByb21pc2UsXG4gICAgICAgICAgICBicm93c2VyU2V0RXJyb3JQcm9taXNlXG4gICAgICAgIF07XG5cbiAgICAgICAgaWYgKHRlc3RlZEFwcClcbiAgICAgICAgICAgIHByb21pc2VzLnB1c2godGVzdGVkQXBwLmVycm9yUHJvbWlzZSk7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IFByb21pc2UucmFjZShwcm9taXNlcyk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5fZGlzcG9zZVRhc2tBbmRSZWxhdGVkQXNzZXRzKHRhc2ssIGJyb3dzZXJTZXQsIHJlcG9ydGVycywgdGVzdGVkQXBwKTtcblxuICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICB9XG5cbiAgICAgICAgYXdhaXQgdGhpcy5fZGlzcG9zZUFzc2V0cyhicm93c2VyU2V0LCByZXBvcnRlcnMsIHRlc3RlZEFwcCk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX2dldEZhaWxlZFRlc3RDb3VudCh0YXNrLCByZXBvcnRlcnNbMF0pO1xuICAgIH1cblxuICAgIF9jcmVhdGVUYXNrICh0ZXN0cywgYnJvd3NlckNvbm5lY3Rpb25Hcm91cHMsIHByb3h5LCBvcHRzKSB7XG4gICAgICAgIHJldHVybiBuZXcgVGFzayh0ZXN0cywgYnJvd3NlckNvbm5lY3Rpb25Hcm91cHMsIHByb3h5LCBvcHRzKTtcbiAgICB9XG5cbiAgICBfcnVuVGFzayAocmVwb3J0ZXJQbHVnaW5zLCBicm93c2VyU2V0LCB0ZXN0cywgdGVzdGVkQXBwKSB7XG4gICAgICAgIGxldCBjb21wbGV0ZWQgICAgICAgICAgID0gZmFsc2U7XG4gICAgICAgIGNvbnN0IHRhc2sgICAgICAgICAgICAgID0gdGhpcy5fY3JlYXRlVGFzayh0ZXN0cywgYnJvd3NlclNldC5icm93c2VyQ29ubmVjdGlvbkdyb3VwcywgdGhpcy5wcm94eSwgdGhpcy5jb25maWd1cmF0aW9uLmdldE9wdGlvbnMoKSk7XG4gICAgICAgIGNvbnN0IHJlcG9ydGVycyAgICAgICAgID0gcmVwb3J0ZXJQbHVnaW5zLm1hcChyZXBvcnRlciA9PiBuZXcgUmVwb3J0ZXIocmVwb3J0ZXIucGx1Z2luLCB0YXNrLCByZXBvcnRlci5vdXRTdHJlYW0pKTtcbiAgICAgICAgY29uc3QgY29tcGxldGlvblByb21pc2UgPSB0aGlzLl9nZXRUYXNrUmVzdWx0KHRhc2ssIGJyb3dzZXJTZXQsIHJlcG9ydGVycywgdGVzdGVkQXBwKTtcblxuICAgICAgICB0YXNrLm9uKCdzdGFydCcsIHN0YXJ0SGFuZGxpbmdUZXN0RXJyb3JzKTtcblxuICAgICAgICBpZiAoIXRoaXMuY29uZmlndXJhdGlvbi5nZXRPcHRpb24oT1BUSU9OX05BTUVTLnNraXBVbmNhdWdodEVycm9ycykpIHtcbiAgICAgICAgICAgIHRhc2sub25jZSgndGVzdC1ydW4tc3RhcnQnLCBhZGRSdW5uaW5nVGVzdCk7XG4gICAgICAgICAgICB0YXNrLm9uY2UoJ3Rlc3QtcnVuLWRvbmUnLCByZW1vdmVSdW5uaW5nVGVzdCk7XG4gICAgICAgIH1cblxuICAgICAgICB0YXNrLm9uKCdkb25lJywgc3RvcEhhbmRsaW5nVGVzdEVycm9ycyk7XG5cbiAgICAgICAgY29uc3Qgc2V0Q29tcGxldGVkID0gKCkgPT4ge1xuICAgICAgICAgICAgY29tcGxldGVkID0gdHJ1ZTtcbiAgICAgICAgfTtcblxuICAgICAgICBjb21wbGV0aW9uUHJvbWlzZVxuICAgICAgICAgICAgLnRoZW4oc2V0Q29tcGxldGVkKVxuICAgICAgICAgICAgLmNhdGNoKHNldENvbXBsZXRlZCk7XG5cbiAgICAgICAgY29uc3QgY2FuY2VsVGFzayA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIGlmICghY29tcGxldGVkKVxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuX2Rpc3Bvc2VUYXNrQW5kUmVsYXRlZEFzc2V0cyh0YXNrLCBicm93c2VyU2V0LCByZXBvcnRlcnMsIHRlc3RlZEFwcCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIHsgY29tcGxldGlvblByb21pc2UsIGNhbmNlbFRhc2sgfTtcbiAgICB9XG5cbiAgICBfcmVnaXN0ZXJBc3NldHMgKGFzc2V0cykge1xuICAgICAgICBhc3NldHMuZm9yRWFjaChhc3NldCA9PiB0aGlzLnByb3h5LkdFVChhc3NldC5wYXRoLCBhc3NldC5pbmZvKSk7XG4gICAgfVxuXG4gICAgX3ZhbGlkYXRlU3BlZWRPcHRpb24gKCkge1xuICAgICAgICBjb25zdCBzcGVlZCA9IHRoaXMuY29uZmlndXJhdGlvbi5nZXRPcHRpb24oT1BUSU9OX05BTUVTLnNwZWVkKTtcblxuICAgICAgICBpZiAoc3BlZWQgPT09IHZvaWQgMClcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICBpZiAodHlwZW9mIHNwZWVkICE9PSAnbnVtYmVyJyB8fCBpc05hTihzcGVlZCkgfHwgc3BlZWQgPCAwLjAxIHx8IHNwZWVkID4gMSlcbiAgICAgICAgICAgIHRocm93IG5ldyBHZW5lcmFsRXJyb3IoUlVOVElNRV9FUlJPUlMuaW52YWxpZFNwZWVkVmFsdWUpO1xuICAgIH1cblxuICAgIF92YWxpZGF0ZUNvbmN1cnJlbmN5T3B0aW9uICgpIHtcbiAgICAgICAgY29uc3QgY29uY3VycmVuY3kgPSB0aGlzLmNvbmZpZ3VyYXRpb24uZ2V0T3B0aW9uKE9QVElPTl9OQU1FUy5jb25jdXJyZW5jeSk7XG5cbiAgICAgICAgaWYgKGNvbmN1cnJlbmN5ID09PSB2b2lkIDApXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgaWYgKHR5cGVvZiBjb25jdXJyZW5jeSAhPT0gJ251bWJlcicgfHwgaXNOYU4oY29uY3VycmVuY3kpIHx8IGNvbmN1cnJlbmN5IDwgMSlcbiAgICAgICAgICAgIHRocm93IG5ldyBHZW5lcmFsRXJyb3IoUlVOVElNRV9FUlJPUlMuaW52YWxpZENvbmN1cnJlbmN5RmFjdG9yKTtcbiAgICB9XG5cbiAgICBfdmFsaWRhdGVQcm94eUJ5cGFzc09wdGlvbiAoKSB7XG4gICAgICAgIGxldCBwcm94eUJ5cGFzcyA9IHRoaXMuY29uZmlndXJhdGlvbi5nZXRPcHRpb24oT1BUSU9OX05BTUVTLnByb3h5QnlwYXNzKTtcblxuICAgICAgICBpZiAocHJveHlCeXBhc3MgPT09IHZvaWQgMClcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICBhc3NlcnRUeXBlKFsgaXMuc3RyaW5nLCBpcy5hcnJheSBdLCBudWxsLCAnXCJwcm94eUJ5cGFzc1wiIGFyZ3VtZW50JywgcHJveHlCeXBhc3MpO1xuXG4gICAgICAgIGlmICh0eXBlb2YgcHJveHlCeXBhc3MgPT09ICdzdHJpbmcnKVxuICAgICAgICAgICAgcHJveHlCeXBhc3MgPSBbcHJveHlCeXBhc3NdO1xuXG4gICAgICAgIHByb3h5QnlwYXNzID0gcHJveHlCeXBhc3MucmVkdWNlKChhcnIsIHJ1bGVzKSA9PiB7XG4gICAgICAgICAgICBhc3NlcnRUeXBlKGlzLnN0cmluZywgbnVsbCwgJ1wicHJveHlCeXBhc3NcIiBhcmd1bWVudCcsIHJ1bGVzKTtcblxuICAgICAgICAgICAgcmV0dXJuIGFyci5jb25jYXQocnVsZXMuc3BsaXQoJywnKSk7XG4gICAgICAgIH0sIFtdKTtcblxuICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWVyZ2VPcHRpb25zKHsgcHJveHlCeXBhc3MgfSk7XG4gICAgfVxuXG4gICAgX3ZhbGlkYXRlU2NyZWVuc2hvdE9wdGlvbnMgKCkge1xuICAgICAgICBjb25zdCBzY3JlZW5zaG90UGF0aCAgICAgICAgPSB0aGlzLmNvbmZpZ3VyYXRpb24uZ2V0T3B0aW9uKE9QVElPTl9OQU1FUy5zY3JlZW5zaG90UGF0aCk7XG4gICAgICAgIGNvbnN0IHNjcmVlbnNob3RQYXRoUGF0dGVybiA9IHRoaXMuY29uZmlndXJhdGlvbi5nZXRPcHRpb24oT1BUSU9OX05BTUVTLnNjcmVlbnNob3RQYXRoUGF0dGVybik7XG5cbiAgICAgICAgaWYgKHNjcmVlbnNob3RQYXRoKSB7XG4gICAgICAgICAgICB0aGlzLl92YWxpZGF0ZVNjcmVlbnNob3RQYXRoKHNjcmVlbnNob3RQYXRoLCAnc2NyZWVuc2hvdHMgYmFzZSBkaXJlY3RvcnkgcGF0aCcpO1xuXG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWVyZ2VPcHRpb25zKHsgW09QVElPTl9OQU1FUy5zY3JlZW5zaG90UGF0aF06IHJlc29sdmVQYXRoKHNjcmVlbnNob3RQYXRoKSB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzY3JlZW5zaG90UGF0aFBhdHRlcm4pXG4gICAgICAgICAgICB0aGlzLl92YWxpZGF0ZVNjcmVlbnNob3RQYXRoKHNjcmVlbnNob3RQYXRoUGF0dGVybiwgJ3NjcmVlbnNob3RzIHBhdGggcGF0dGVybicpO1xuXG4gICAgICAgIGlmICghc2NyZWVuc2hvdFBhdGggJiYgc2NyZWVuc2hvdFBhdGhQYXR0ZXJuKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEdlbmVyYWxFcnJvcihSVU5USU1FX0VSUk9SUy5jYW5ub3RVc2VTY3JlZW5zaG90UGF0aFBhdHRlcm5XaXRob3V0QmFzZVNjcmVlbnNob3RQYXRoU3BlY2lmaWVkKTtcbiAgICB9XG5cbiAgICBhc3luYyBfdmFsaWRhdGVWaWRlb09wdGlvbnMgKCkge1xuICAgICAgICBjb25zdCB2aWRlb1BhdGggICAgICAgICAgICA9IHRoaXMuY29uZmlndXJhdGlvbi5nZXRPcHRpb24oT1BUSU9OX05BTUVTLnZpZGVvUGF0aCk7XG4gICAgICAgIGNvbnN0IHZpZGVvRW5jb2RpbmdPcHRpb25zID0gdGhpcy5jb25maWd1cmF0aW9uLmdldE9wdGlvbihPUFRJT05fTkFNRVMudmlkZW9FbmNvZGluZ09wdGlvbnMpO1xuXG4gICAgICAgIGxldCB2aWRlb09wdGlvbnMgPSB0aGlzLmNvbmZpZ3VyYXRpb24uZ2V0T3B0aW9uKE9QVElPTl9OQU1FUy52aWRlb09wdGlvbnMpO1xuXG4gICAgICAgIGlmICghdmlkZW9QYXRoKSB7XG4gICAgICAgICAgICBpZiAodmlkZW9PcHRpb25zIHx8IHZpZGVvRW5jb2RpbmdPcHRpb25zKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBHZW5lcmFsRXJyb3IoUlVOVElNRV9FUlJPUlMuY2Fubm90U2V0VmlkZW9PcHRpb25zV2l0aG91dEJhc2VWaWRlb1BhdGhTcGVjaWZpZWQpO1xuXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWVyZ2VPcHRpb25zKHsgW09QVElPTl9OQU1FUy52aWRlb1BhdGhdOiByZXNvbHZlUGF0aCh2aWRlb1BhdGgpIH0pO1xuXG4gICAgICAgIGlmICghdmlkZW9PcHRpb25zKSB7XG4gICAgICAgICAgICB2aWRlb09wdGlvbnMgPSB7fTtcblxuICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1lcmdlT3B0aW9ucyh7IFtPUFRJT05fTkFNRVMudmlkZW9PcHRpb25zXTogdmlkZW9PcHRpb25zIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHZpZGVvT3B0aW9ucy5mZm1wZWdQYXRoKVxuICAgICAgICAgICAgdmlkZW9PcHRpb25zLmZmbXBlZ1BhdGggPSByZXNvbHZlUGF0aCh2aWRlb09wdGlvbnMuZmZtcGVnUGF0aCk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHZpZGVvT3B0aW9ucy5mZm1wZWdQYXRoID0gYXdhaXQgZGV0ZWN0RkZNUEVHKCk7XG5cbiAgICAgICAgaWYgKCF2aWRlb09wdGlvbnMuZmZtcGVnUGF0aClcbiAgICAgICAgICAgIHRocm93IG5ldyBHZW5lcmFsRXJyb3IoUlVOVElNRV9FUlJPUlMuY2Fubm90RmluZEZGTVBFRyk7XG4gICAgfVxuXG4gICAgYXN5bmMgX3ZhbGlkYXRlUnVuT3B0aW9ucyAoKSB7XG4gICAgICAgIHRoaXMuX3ZhbGlkYXRlU2NyZWVuc2hvdE9wdGlvbnMoKTtcbiAgICAgICAgYXdhaXQgdGhpcy5fdmFsaWRhdGVWaWRlb09wdGlvbnMoKTtcbiAgICAgICAgdGhpcy5fdmFsaWRhdGVTcGVlZE9wdGlvbigpO1xuICAgICAgICB0aGlzLl92YWxpZGF0ZUNvbmN1cnJlbmN5T3B0aW9uKCk7XG4gICAgICAgIHRoaXMuX3ZhbGlkYXRlUHJveHlCeXBhc3NPcHRpb24oKTtcbiAgICB9XG5cbiAgICBfY3JlYXRlUnVubmFibGVDb25maWd1cmF0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYm9vdHN0cmFwcGVyXG4gICAgICAgICAgICAuY3JlYXRlUnVubmFibGVDb25maWd1cmF0aW9uKClcbiAgICAgICAgICAgIC50aGVuKHJ1bm5hYmxlQ29uZmlndXJhdGlvbiA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5lbWl0KCdkb25lLWJvb3RzdHJhcHBpbmcnKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBydW5uYWJsZUNvbmZpZ3VyYXRpb247XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBfdmFsaWRhdGVTY3JlZW5zaG90UGF0aCAoc2NyZWVuc2hvdFBhdGgsIHBhdGhUeXBlKSB7XG4gICAgICAgIGNvbnN0IGZvcmJpZGRlbkNoYXJzTGlzdCA9IGNoZWNrRmlsZVBhdGgoc2NyZWVuc2hvdFBhdGgpO1xuXG4gICAgICAgIGlmIChmb3JiaWRkZW5DaGFyc0xpc3QubGVuZ3RoKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEdlbmVyYWxFcnJvcihSVU5USU1FX0VSUk9SUy5mb3JiaWRkZW5DaGFyYXRlcnNJblNjcmVlbnNob3RQYXRoLCBzY3JlZW5zaG90UGF0aCwgcGF0aFR5cGUsIHJlbmRlckZvcmJpZGRlbkNoYXJzTGlzdChmb3JiaWRkZW5DaGFyc0xpc3QpKTtcbiAgICB9XG5cbiAgICBfc2V0Qm9vdHN0cmFwcGVyT3B0aW9ucyAoKSB7XG4gICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5wcmVwYXJlKCk7XG4gICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5ub3RpZnlBYm91dE92ZXJyaWRlbk9wdGlvbnMoKTtcblxuICAgICAgICB0aGlzLmJvb3RzdHJhcHBlci5zb3VyY2VzICAgICAgPSB0aGlzLmNvbmZpZ3VyYXRpb24uZ2V0T3B0aW9uKE9QVElPTl9OQU1FUy5zcmMpIHx8IHRoaXMuYm9vdHN0cmFwcGVyLnNvdXJjZXM7XG4gICAgICAgIHRoaXMuYm9vdHN0cmFwcGVyLmJyb3dzZXJzICAgICA9IHRoaXMuY29uZmlndXJhdGlvbi5nZXRPcHRpb24oT1BUSU9OX05BTUVTLmJyb3dzZXJzKSB8fCB0aGlzLmJvb3RzdHJhcHBlci5icm93c2VycztcbiAgICAgICAgdGhpcy5ib290c3RyYXBwZXIuY29uY3VycmVuY3kgID0gdGhpcy5jb25maWd1cmF0aW9uLmdldE9wdGlvbihPUFRJT05fTkFNRVMuY29uY3VycmVuY3kpO1xuICAgICAgICB0aGlzLmJvb3RzdHJhcHBlci5hcHBDb21tYW5kICAgPSB0aGlzLmNvbmZpZ3VyYXRpb24uZ2V0T3B0aW9uKE9QVElPTl9OQU1FUy5hcHBDb21tYW5kKSB8fCB0aGlzLmJvb3RzdHJhcHBlci5hcHBDb21tYW5kO1xuICAgICAgICB0aGlzLmJvb3RzdHJhcHBlci5hcHBJbml0RGVsYXkgPSB0aGlzLmNvbmZpZ3VyYXRpb24uZ2V0T3B0aW9uKE9QVElPTl9OQU1FUy5hcHBJbml0RGVsYXkpO1xuICAgICAgICB0aGlzLmJvb3RzdHJhcHBlci5maWx0ZXIgICAgICAgPSB0aGlzLmNvbmZpZ3VyYXRpb24uZ2V0T3B0aW9uKE9QVElPTl9OQU1FUy5maWx0ZXIpIHx8IHRoaXMuYm9vdHN0cmFwcGVyLmZpbHRlcjtcbiAgICAgICAgdGhpcy5ib290c3RyYXBwZXIucmVwb3J0ZXJzICAgID0gdGhpcy5jb25maWd1cmF0aW9uLmdldE9wdGlvbihPUFRJT05fTkFNRVMucmVwb3J0ZXIpIHx8IHRoaXMuYm9vdHN0cmFwcGVyLnJlcG9ydGVycztcbiAgICB9XG5cbiAgICAvLyBBUElcbiAgICBlbWJlZGRpbmdPcHRpb25zIChvcHRzKSB7XG4gICAgICAgIGNvbnN0IHsgYXNzZXRzLCBUZXN0UnVuQ3RvciB9ID0gb3B0cztcblxuICAgICAgICB0aGlzLl9yZWdpc3RlckFzc2V0cyhhc3NldHMpO1xuICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWVyZ2VPcHRpb25zKHsgVGVzdFJ1bkN0b3IgfSk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgc3JjICguLi5zb3VyY2VzKSB7XG4gICAgICAgIGlmICh0aGlzLmFwaU1ldGhvZFdhc0NhbGxlZC5zcmMpXG4gICAgICAgICAgICB0aHJvdyBuZXcgR2VuZXJhbEVycm9yKFJVTlRJTUVfRVJST1JTLm11bHRpcGxlQVBJTWV0aG9kQ2FsbEZvcmJpZGRlbiwgT1BUSU9OX05BTUVTLnNyYyk7XG5cbiAgICAgICAgc291cmNlcyA9IHRoaXMuX3ByZXBhcmVBcnJheVBhcmFtZXRlcihzb3VyY2VzKTtcbiAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1lcmdlT3B0aW9ucyh7IFtPUFRJT05fTkFNRVMuc3JjXTogc291cmNlcyB9KTtcblxuICAgICAgICB0aGlzLmFwaU1ldGhvZFdhc0NhbGxlZC5zcmMgPSB0cnVlO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGJyb3dzZXJzICguLi5icm93c2Vycykge1xuICAgICAgICBpZiAodGhpcy5hcGlNZXRob2RXYXNDYWxsZWQuYnJvd3NlcnMpXG4gICAgICAgICAgICB0aHJvdyBuZXcgR2VuZXJhbEVycm9yKFJVTlRJTUVfRVJST1JTLm11bHRpcGxlQVBJTWV0aG9kQ2FsbEZvcmJpZGRlbiwgT1BUSU9OX05BTUVTLmJyb3dzZXJzKTtcblxuICAgICAgICBicm93c2VycyA9IHRoaXMuX3ByZXBhcmVBcnJheVBhcmFtZXRlcihicm93c2Vycyk7XG4gICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tZXJnZU9wdGlvbnMoeyBicm93c2VycyB9KTtcblxuICAgICAgICB0aGlzLmFwaU1ldGhvZFdhc0NhbGxlZC5icm93c2VycyA9IHRydWU7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgY29uY3VycmVuY3kgKGNvbmN1cnJlbmN5KSB7XG4gICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tZXJnZU9wdGlvbnMoeyBjb25jdXJyZW5jeSB9KTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICByZXBvcnRlciAobmFtZSwgb3V0cHV0KSB7XG4gICAgICAgIGlmICh0aGlzLmFwaU1ldGhvZFdhc0NhbGxlZC5yZXBvcnRlcilcbiAgICAgICAgICAgIHRocm93IG5ldyBHZW5lcmFsRXJyb3IoUlVOVElNRV9FUlJPUlMubXVsdGlwbGVBUElNZXRob2RDYWxsRm9yYmlkZGVuLCBPUFRJT05fTkFNRVMucmVwb3J0ZXIpO1xuXG4gICAgICAgIGxldCByZXBvcnRlcnMgPSBwcmVwYXJlUmVwb3J0ZXJzKG5hbWUsIG91dHB1dCk7XG5cbiAgICAgICAgcmVwb3J0ZXJzID0gdGhpcy5fcHJlcGFyZUFycmF5UGFyYW1ldGVyKHJlcG9ydGVycyk7XG5cbiAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1lcmdlT3B0aW9ucyh7IFtPUFRJT05fTkFNRVMucmVwb3J0ZXJdOiByZXBvcnRlcnMgfSk7XG5cbiAgICAgICAgdGhpcy5hcGlNZXRob2RXYXNDYWxsZWQucmVwb3J0ZXIgPSB0cnVlO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGZpbHRlciAoZmlsdGVyKSB7XG4gICAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5tZXJnZU9wdGlvbnMoeyBmaWx0ZXIgfSk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgdXNlUHJveHkgKHByb3h5LCBwcm94eUJ5cGFzcykge1xuICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWVyZ2VPcHRpb25zKHsgcHJveHksIHByb3h5QnlwYXNzIH0pO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHNjcmVlbnNob3RzIChwYXRoLCB0YWtlT25GYWlscywgcGF0dGVybikge1xuICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWVyZ2VPcHRpb25zKHtcbiAgICAgICAgICAgIFtPUFRJT05fTkFNRVMuc2NyZWVuc2hvdFBhdGhdOiAgICAgICAgIHBhdGgsXG4gICAgICAgICAgICBbT1BUSU9OX05BTUVTLnRha2VTY3JlZW5zaG90c09uRmFpbHNdOiB0YWtlT25GYWlscyxcbiAgICAgICAgICAgIFtPUFRJT05fTkFNRVMuc2NyZWVuc2hvdFBhdGhQYXR0ZXJuXTogIHBhdHRlcm5cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgdmlkZW8gKHBhdGgsIG9wdGlvbnMsIGVuY29kaW5nT3B0aW9ucykge1xuICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24ubWVyZ2VPcHRpb25zKHtcbiAgICAgICAgICAgIFtPUFRJT05fTkFNRVMudmlkZW9QYXRoXTogICAgICAgICAgICBwYXRoLFxuICAgICAgICAgICAgW09QVElPTl9OQU1FUy52aWRlb09wdGlvbnNdOiAgICAgICAgIG9wdGlvbnMsXG4gICAgICAgICAgICBbT1BUSU9OX05BTUVTLnZpZGVvRW5jb2RpbmdPcHRpb25zXTogZW5jb2RpbmdPcHRpb25zXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHN0YXJ0QXBwIChjb21tYW5kLCBpbml0RGVsYXkpIHtcbiAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1lcmdlT3B0aW9ucyh7XG4gICAgICAgICAgICBbT1BUSU9OX05BTUVTLmFwcENvbW1hbmRdOiAgIGNvbW1hbmQsXG4gICAgICAgICAgICBbT1BUSU9OX05BTUVTLmFwcEluaXREZWxheV06IGluaXREZWxheVxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBydW4gKG9wdGlvbnMgPSB7fSkge1xuICAgICAgICB0aGlzLmFwaU1ldGhvZFdhc0NhbGxlZC5yZXNldCgpO1xuXG4gICAgICAgIGNvbnN0IHtcbiAgICAgICAgICAgIHNraXBKc0Vycm9ycyxcbiAgICAgICAgICAgIGRpc2FibGVQYWdlUmVsb2FkcyxcbiAgICAgICAgICAgIHF1YXJhbnRpbmVNb2RlLFxuICAgICAgICAgICAgZGVidWdNb2RlLFxuICAgICAgICAgICAgc2VsZWN0b3JUaW1lb3V0LFxuICAgICAgICAgICAgYXNzZXJ0aW9uVGltZW91dCxcbiAgICAgICAgICAgIHBhZ2VMb2FkVGltZW91dCxcbiAgICAgICAgICAgIHNwZWVkLFxuICAgICAgICAgICAgZGVidWdPbkZhaWwsXG4gICAgICAgICAgICBza2lwVW5jYXVnaHRFcnJvcnMsXG4gICAgICAgICAgICBzdG9wT25GaXJzdEZhaWxcbiAgICAgICAgfSA9IG9wdGlvbnM7XG5cbiAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uLm1lcmdlT3B0aW9ucyh7XG4gICAgICAgICAgICBza2lwSnNFcnJvcnM6ICAgICAgIHNraXBKc0Vycm9ycyxcbiAgICAgICAgICAgIGRpc2FibGVQYWdlUmVsb2FkczogZGlzYWJsZVBhZ2VSZWxvYWRzLFxuICAgICAgICAgICAgcXVhcmFudGluZU1vZGU6ICAgICBxdWFyYW50aW5lTW9kZSxcbiAgICAgICAgICAgIGRlYnVnTW9kZTogICAgICAgICAgZGVidWdNb2RlLFxuICAgICAgICAgICAgZGVidWdPbkZhaWw6ICAgICAgICBkZWJ1Z09uRmFpbCxcbiAgICAgICAgICAgIHNlbGVjdG9yVGltZW91dDogICAgc2VsZWN0b3JUaW1lb3V0LFxuICAgICAgICAgICAgYXNzZXJ0aW9uVGltZW91dDogICBhc3NlcnRpb25UaW1lb3V0LFxuICAgICAgICAgICAgcGFnZUxvYWRUaW1lb3V0OiAgICBwYWdlTG9hZFRpbWVvdXQsXG4gICAgICAgICAgICBzcGVlZDogICAgICAgICAgICAgIHNwZWVkLFxuICAgICAgICAgICAgc2tpcFVuY2F1Z2h0RXJyb3JzOiBza2lwVW5jYXVnaHRFcnJvcnMsXG4gICAgICAgICAgICBzdG9wT25GaXJzdEZhaWw6ICAgIHN0b3BPbkZpcnN0RmFpbFxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLl9zZXRCb290c3RyYXBwZXJPcHRpb25zKCk7XG5cbiAgICAgICAgY29uc3QgcnVuVGFza1Byb21pc2UgPSBQcm9taXNlLnJlc29sdmUoKVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4gdGhpcy5fdmFsaWRhdGVSdW5PcHRpb25zKCkpXG4gICAgICAgICAgICAudGhlbigoKSA9PiB0aGlzLl9jcmVhdGVSdW5uYWJsZUNvbmZpZ3VyYXRpb24oKSlcbiAgICAgICAgICAgIC50aGVuKCh7IHJlcG9ydGVyUGx1Z2lucywgYnJvd3NlclNldCwgdGVzdHMsIHRlc3RlZEFwcCB9KSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3J1blRhc2socmVwb3J0ZXJQbHVnaW5zLCBicm93c2VyU2V0LCB0ZXN0cywgdGVzdGVkQXBwKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiB0aGlzLl9jcmVhdGVDYW5jZWxhYmxlUHJvbWlzZShydW5UYXNrUHJvbWlzZSk7XG4gICAgfVxuXG4gICAgYXN5bmMgc3RvcCAoKSB7XG4gICAgICAgIC8vIE5PVEU6IFdoZW4gdGFza1Byb21pc2UgaXMgY2FuY2VsbGVkLCBpdCBpcyByZW1vdmVkIGZyb21cbiAgICAgICAgLy8gdGhlIHBlbmRpbmdUYXNrUHJvbWlzZXMgYXJyYXksIHdoaWNoIGxlYWRzIHRvIHNoaWZ0aW5nIGluZGV4ZXNcbiAgICAgICAgLy8gdG93YXJkcyB0aGUgYmVnaW5uaW5nLiBTbywgd2UgbXVzdCBjb3B5IHRoZSBhcnJheSBpbiBvcmRlciB0byBpdGVyYXRlIGl0LFxuICAgICAgICAvLyBvciB3ZSBjYW4gcGVyZm9ybSBpdGVyYXRpb24gZnJvbSB0aGUgZW5kIHRvIHRoZSBiZWdpbm5pbmcuXG4gICAgICAgIGNvbnN0IGNhbmNlbGxhdGlvblByb21pc2VzID0gbWFwUmV2ZXJzZSh0aGlzLnBlbmRpbmdUYXNrUHJvbWlzZXMsIHRhc2tQcm9taXNlID0+IHRhc2tQcm9taXNlLmNhbmNlbCgpKTtcblxuICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChjYW5jZWxsYXRpb25Qcm9taXNlcyk7XG4gICAgfVxufVxuIl19
