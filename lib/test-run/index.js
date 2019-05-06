'use strict';

exports.__esModule = true;

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _from = require('babel-runtime/core-js/array/from');

var _from2 = _interopRequireDefault(_from);

var _create = require('babel-runtime/core-js/object/create');

var _create2 = _interopRequireDefault(_create);

var _lodash = require('lodash');

var _readFileRelative = require('read-file-relative');

var _promisifyEvent = require('promisify-event');

var _promisifyEvent2 = _interopRequireDefault(_promisifyEvent);

var _pinkie = require('pinkie');

var _pinkie2 = _interopRequireDefault(_pinkie);

var _mustache = require('mustache');

var _mustache2 = _interopRequireDefault(_mustache);

var _asyncEventEmitter = require('../utils/async-event-emitter');

var _asyncEventEmitter2 = _interopRequireDefault(_asyncEventEmitter);

var _debugLogger = require('../notifications/debug-logger');

var _debugLogger2 = _interopRequireDefault(_debugLogger);

var _debugLog = require('./debug-log');

var _debugLog2 = _interopRequireDefault(_debugLog);

var _formattableAdapter = require('../errors/test-run/formattable-adapter');

var _formattableAdapter2 = _interopRequireDefault(_formattableAdapter);

var _errorList = require('../errors/error-list');

var _errorList2 = _interopRequireDefault(_errorList);

var _testRun = require('../errors/test-run/');

var _phase = require('./phase');

var _phase2 = _interopRequireDefault(_phase);

var _clientMessages = require('./client-messages');

var _clientMessages2 = _interopRequireDefault(_clientMessages);

var _type = require('./commands/type');

var _type2 = _interopRequireDefault(_type);

var _delay = require('../utils/delay');

var _delay2 = _interopRequireDefault(_delay);

var _markerSymbol = require('./marker-symbol');

var _markerSymbol2 = _interopRequireDefault(_markerSymbol);

var _testRunTracker = require('../api/test-run-tracker');

var _testRunTracker2 = _interopRequireDefault(_testRunTracker);

var _phase3 = require('../role/phase');

var _phase4 = _interopRequireDefault(_phase3);

var _pluginHost = require('../reporter/plugin-host');

var _pluginHost2 = _interopRequireDefault(_pluginHost);

var _browserConsoleMessages = require('./browser-console-messages');

var _browserConsoleMessages2 = _interopRequireDefault(_browserConsoleMessages);

var _unstableNetworkMode = require('../browser/connection/unstable-network-mode');

var _warningLog = require('../notifications/warning-log');

var _warningLog2 = _interopRequireDefault(_warningLog);

var _warningMessage = require('../notifications/warning-message');

var _warningMessage2 = _interopRequireDefault(_warningMessage);

var _testcafeHammerhead = require('testcafe-hammerhead');

var _utils = require('./commands/utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const lazyRequire = require('import-lazy')(require);
const SessionController = lazyRequire('./session-controller');
const ClientFunctionBuilder = lazyRequire('../client-functions/client-function-builder');
const executeJsExpression = lazyRequire('./execute-js-expression');
const BrowserManipulationQueue = lazyRequire('./browser-manipulation-queue');
const TestRunBookmark = lazyRequire('./bookmark');
const AssertionExecutor = lazyRequire('../assertions/executor');
const actionCommands = lazyRequire('./commands/actions');
const browserManipulationCommands = lazyRequire('./commands/browser-manipulation');
const serviceCommands = lazyRequire('./commands/service');

const TEST_RUN_TEMPLATE = (0, _readFileRelative.readSync)('../client/test-run/index.js.mustache');
const IFRAME_TEST_RUN_TEMPLATE = (0, _readFileRelative.readSync)('../client/test-run/iframe.js.mustache');
const TEST_DONE_CONFIRMATION_RESPONSE = 'test-done-confirmation';
const MAX_RESPONSE_DELAY = 3000;

const ALL_DRIVER_TASKS_ADDED_TO_QUEUE_EVENT = 'all-driver-tasks-added-to-queue';

class TestRun extends _asyncEventEmitter2.default {
    constructor(test, browserConnection, screenshotCapturer, globalWarningLog, opts) {
        super();

        this[_markerSymbol2.default] = true;

        this.warningLog = new _warningLog2.default(globalWarningLog);

        this.opts = opts;
        this.test = test;
        this.browserConnection = browserConnection;

        this.phase = _phase2.default.initial;

        this.driverTaskQueue = [];
        this.testDoneCommandQueued = false;

        this.activeDialogHandler = null;
        this.activeIframeSelector = null;
        this.speed = this.opts.speed;
        this.pageLoadTimeout = this.opts.pageLoadTimeout;

        this.disablePageReloads = test.disablePageReloads || opts.disablePageReloads && test.disablePageReloads !== false;

        this.session = SessionController.getSession(this);

        this.consoleMessages = new _browserConsoleMessages2.default();

        this.pendingRequest = null;
        this.pendingPageError = null;

        this.controller = null;
        this.ctx = (0, _create2.default)(null);
        this.fixtureCtx = null;

        this.currentRoleId = null;
        this.usedRoleStates = (0, _create2.default)(null);

        this.errs = [];

        this.lastDriverStatusId = null;
        this.lastDriverStatusResponse = null;

        this.fileDownloadingHandled = false;
        this.resolveWaitForFileDownloadingPromise = null;

        this.addingDriverTasksCount = 0;

        this.debugging = this.opts.debugMode;
        this.debugOnFail = this.opts.debugOnFail;
        this.disableDebugBreakpoints = false;
        this.debugReporterPluginHost = new _pluginHost2.default({ noColors: false });

        this.browserManipulationQueue = new BrowserManipulationQueue(browserConnection, screenshotCapturer, this.warningLog);

        this.debugLog = new _debugLog2.default(this.browserConnection.userAgent);

        this.quarantine = null;

        this.injectable.scripts.push('/testcafe-core.js');
        this.injectable.scripts.push('/testcafe-ui.js');
        this.injectable.scripts.push('/testcafe-automation.js');
        this.injectable.scripts.push('/testcafe-driver.js');
        this.injectable.styles.push('/testcafe-ui-styles.css');

        this.requestHooks = (0, _from2.default)(this.test.requestHooks);

        this._initRequestHooks();
    }

    get id() {
        return this.session.id;
    }

    get injectable() {
        return this.session.injectable;
    }

    addQuarantineInfo(quarantine) {
        this.quarantine = quarantine;
    }

    addRequestHook(hook) {
        if (this.requestHooks.indexOf(hook) !== -1) return;

        this.requestHooks.push(hook);
        this._initRequestHook(hook);
    }

    removeRequestHook(hook) {
        if (this.requestHooks.indexOf(hook) === -1) return;

        (0, _lodash.pull)(this.requestHooks, hook);
        this._disposeRequestHook(hook);
    }

    _initRequestHook(hook) {
        hook.warningLog = this.warningLog;

        hook._instantiateRequestFilterRules();
        hook._instantiatedRequestFilterRules.forEach(rule => {
            this.session.addRequestEventListeners(rule, {
                onRequest: hook.onRequest.bind(hook),
                onConfigureResponse: hook._onConfigureResponse.bind(hook),
                onResponse: hook.onResponse.bind(hook)
            });
        });
    }

    _disposeRequestHook(hook) {
        hook.warningLog = null;

        hook._instantiatedRequestFilterRules.forEach(rule => {
            this.session.removeRequestEventListeners(rule);
        });
    }

    _initRequestHooks() {
        this.requestHooks.forEach(hook => this._initRequestHook(hook));
    }

    // Hammerhead payload
    _getPayloadScript() {
        this.fileDownloadingHandled = false;
        this.resolveWaitForFileDownloadingPromise = null;

        return _mustache2.default.render(TEST_RUN_TEMPLATE, {
            testRunId: (0, _stringify2.default)(this.session.id),
            browserId: (0, _stringify2.default)(this.browserConnection.id),
            browserHeartbeatRelativeUrl: (0, _stringify2.default)(this.browserConnection.heartbeatRelativeUrl),
            browserStatusRelativeUrl: (0, _stringify2.default)(this.browserConnection.statusRelativeUrl),
            browserStatusDoneRelativeUrl: (0, _stringify2.default)(this.browserConnection.statusDoneRelativeUrl),
            userAgent: (0, _stringify2.default)(this.browserConnection.userAgent),
            testName: (0, _stringify2.default)(this.test.name),
            fixtureName: (0, _stringify2.default)(this.test.fixture.name),
            selectorTimeout: this.opts.selectorTimeout,
            pageLoadTimeout: this.pageLoadTimeout,
            skipJsErrors: this.opts.skipJsErrors,
            retryTestPages: !!this.opts.retryTestPages,
            speed: this.speed,
            dialogHandler: (0, _stringify2.default)(this.activeDialogHandler)
        });
    }

    _getIframePayloadScript() {
        return _mustache2.default.render(IFRAME_TEST_RUN_TEMPLATE, {
            testRunId: (0, _stringify2.default)(this.session.id),
            selectorTimeout: this.opts.selectorTimeout,
            pageLoadTimeout: this.pageLoadTimeout,
            retryTestPages: !!this.opts.retryTestPages,
            speed: this.speed,
            dialogHandler: (0, _stringify2.default)(this.activeDialogHandler)
        });
    }

    // Hammerhead handlers
    getAuthCredentials() {
        return this.test.authCredentials;
    }

    handleFileDownload() {
        if (this.resolveWaitForFileDownloadingPromise) {
            this.resolveWaitForFileDownloadingPromise(true);
            this.resolveWaitForFileDownloadingPromise = null;
        } else this.fileDownloadingHandled = true;
    }

    handlePageError(ctx, err) {
        if (ctx.req.headers[_unstableNetworkMode.UNSTABLE_NETWORK_MODE_HEADER]) {
            ctx.closeWithError(500, err.toString());
            return;
        }

        this.pendingPageError = new _testRun.PageLoadError(err, ctx.reqOpts.url);

        ctx.redirect(ctx.toProxyUrl('about:error'));
    }

    // Test function execution
    _executeTestFn(phase, fn) {
        var _this = this;

        return (0, _asyncToGenerator3.default)(function* () {
            _this.phase = phase;

            try {
                yield fn(_this);
            } catch (err) {
                let screenshotPath = null;

                if (_this.opts.takeScreenshotsOnFails) screenshotPath = yield _this.executeCommand(new browserManipulationCommands.TakeScreenshotOnFailCommand());

                _this.addError(err, screenshotPath);
                return false;
            }

            return !_this._addPendingPageErrorIfAny();
        })();
    }

    _runBeforeHook() {
        var _this2 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            if (_this2.test.beforeFn) return yield _this2._executeTestFn(_phase2.default.inTestBeforeHook, _this2.test.beforeFn);

            if (_this2.test.fixture.beforeEachFn) return yield _this2._executeTestFn(_phase2.default.inFixtureBeforeEachHook, _this2.test.fixture.beforeEachFn);

            return true;
        })();
    }

    _runAfterHook() {
        var _this3 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            if (_this3.test.afterFn) return yield _this3._executeTestFn(_phase2.default.inTestAfterHook, _this3.test.afterFn);

            if (_this3.test.fixture.afterEachFn) return yield _this3._executeTestFn(_phase2.default.inFixtureAfterEachHook, _this3.test.fixture.afterEachFn);

            return true;
        })();
    }

    start() {
        var _this4 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            _testRunTracker2.default.activeTestRuns[_this4.session.id] = _this4;

            yield _this4.emit('start');

            const onDisconnected = function onDisconnected(err) {
                return _this4._disconnect(err);
            };

            _this4.browserConnection.once('disconnected', onDisconnected);

            yield _this4.once('connected');

            yield _this4.emit('ready');

            if (yield _this4._runBeforeHook()) {
                yield _this4._executeTestFn(_phase2.default.inTest, _this4.test.fn);
                yield _this4._runAfterHook();
            }

            if (_this4.disconnected) return;

            _this4.browserConnection.removeListener('disconnected', onDisconnected);

            if (_this4.errs.length && _this4.debugOnFail) yield _this4._enqueueSetBreakpointCommand(null, _this4.debugReporterPluginHost.formatError(_this4.errs[0]));

            yield _this4.emit('before-done');

            yield _this4.executeCommand(new serviceCommands.TestDoneCommand());

            _this4._addPendingPageErrorIfAny();

            delete _testRunTracker2.default.activeTestRuns[_this4.session.id];

            yield _this4.emit('done');
        })();
    }

    // Errors
    _addPendingPageErrorIfAny() {
        if (this.pendingPageError) {
            this.addError(this.pendingPageError);
            this.pendingPageError = null;
            return true;
        }

        return false;
    }

    _createErrorAdapter(err, screenshotPath) {
        return new _formattableAdapter2.default(err, {
            userAgent: this.browserConnection.userAgent,
            screenshotPath: screenshotPath || '',
            testRunPhase: this.phase
        });
    }

    addError(err, screenshotPath) {
        const errList = err instanceof _errorList2.default ? err.items : [err];

        errList.forEach(item => {
            const adapter = this._createErrorAdapter(item, screenshotPath);

            this.errs.push(adapter);
        });
    }

    // Task queue
    _enqueueCommand(command, callsite) {
        var _this5 = this;

        if (this.pendingRequest) this._resolvePendingRequest(command);

        return new _pinkie2.default((() => {
            var _ref = (0, _asyncToGenerator3.default)(function* (resolve, reject) {
                _this5.addingDriverTasksCount--;
                _this5.driverTaskQueue.push({ command, resolve, reject, callsite });

                if (!_this5.addingDriverTasksCount) yield _this5.emit(ALL_DRIVER_TASKS_ADDED_TO_QUEUE_EVENT, _this5.driverTaskQueue.length);
            });

            return function (_x, _x2) {
                return _ref.apply(this, arguments);
            };
        })());
    }

    get driverTaskQueueLength() {
        return this.addingDriverTasksCount ? (0, _promisifyEvent2.default)(this, ALL_DRIVER_TASKS_ADDED_TO_QUEUE_EVENT) : _pinkie2.default.resolve(this.driverTaskQueue.length);
    }

    _enqueueBrowserConsoleMessagesCommand(command, callsite) {
        var _this6 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            yield _this6._enqueueCommand(command, callsite);

            return _this6.consoleMessages.getCopy();
        })();
    }

    _enqueueSetBreakpointCommand(callsite, error) {
        var _this7 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            if (_this7.browserConnection.isHeadlessBrowser()) {
                _this7.warningLog.addWarning(_warningMessage2.default.debugInHeadlessError);
                return;
            }

            _debugLogger2.default.showBreakpoint(_this7.session.id, _this7.browserConnection.userAgent, callsite, error);

            _this7.debugging = yield _this7.executeCommand(new serviceCommands.SetBreakpointCommand(!!error), callsite);
        })();
    }

    _removeAllNonServiceTasks() {
        this.driverTaskQueue = this.driverTaskQueue.filter(driverTask => (0, _utils.isServiceCommand)(driverTask.command));

        this.browserManipulationQueue.removeAllNonServiceManipulations();
    }

    // Current driver task
    get currentDriverTask() {
        return this.driverTaskQueue[0];
    }

    _resolveCurrentDriverTask(result) {
        this.currentDriverTask.resolve(result);
        this.driverTaskQueue.shift();

        if (this.testDoneCommandQueued) this._removeAllNonServiceTasks();
    }

    _rejectCurrentDriverTask(err) {
        err.callsite = err.callsite || this.currentDriverTask.callsite;
        err.__stack = new Error().stack;

        this.currentDriverTask.reject(err);
        this._removeAllNonServiceTasks();
    }

    // Pending request
    _clearPendingRequest() {
        if (this.pendingRequest) {
            clearTimeout(this.pendingRequest.responseTimeout);
            this.pendingRequest = null;
        }
    }

    _resolvePendingRequest(command) {
        this.lastDriverStatusResponse = command;
        this.pendingRequest.resolve(command);
        this._clearPendingRequest();
    }

    // Handle driver request
    _fulfillCurrentDriverTask(driverStatus) {
        if (driverStatus.executionError) this._rejectCurrentDriverTask(driverStatus.executionError);else this._resolveCurrentDriverTask(driverStatus.result);
    }

    _handlePageErrorStatus(pageError) {
        if (this.currentDriverTask && (0, _utils.isCommandRejectableByPageError)(this.currentDriverTask.command)) {
            this._rejectCurrentDriverTask(pageError);
            this.pendingPageError = null;

            return true;
        }

        this.pendingPageError = this.pendingPageError || pageError;

        return false;
    }

    _handleDriverRequest(driverStatus) {
        const isTestDone = this.currentDriverTask && this.currentDriverTask.command.type === _type2.default.testDone;
        const pageError = this.pendingPageError || driverStatus.pageError;
        const currentTaskRejectedByError = pageError && this._handlePageErrorStatus(pageError);

        if (this.disconnected) return new _pinkie2.default((_, reject) => reject());

        this.consoleMessages.concat(driverStatus.consoleMessages);

        if (!currentTaskRejectedByError && driverStatus.isCommandResult) {
            if (isTestDone) {
                this._resolveCurrentDriverTask();

                return TEST_DONE_CONFIRMATION_RESPONSE;
            }

            this._fulfillCurrentDriverTask(driverStatus);
        }

        return this._getCurrentDriverTaskCommand();
    }

    _getCurrentDriverTaskCommand() {
        if (!this.currentDriverTask) return null;

        const command = this.currentDriverTask.command;

        if (command.type === _type2.default.navigateTo && command.stateSnapshot) this.session.useStateSnapshot(JSON.parse(command.stateSnapshot));

        return command;
    }

    // Execute command
    _executeExpression(command) {
        var _this8 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            const resultVariableName = command.resultVariableName,
                  isAsyncExpression = command.isAsyncExpression;


            let expression = command.expression;

            if (isAsyncExpression) expression = `await ${expression}`;

            if (resultVariableName) expression = `${resultVariableName} = ${expression}, ${resultVariableName}`;

            if (isAsyncExpression) expression = `(async () => { return ${expression}; }).apply(this);`;

            const result = executeJsExpression(expression, _this8, { skipVisibilityCheck: false });

            return isAsyncExpression ? yield result : result;
        })();
    }

    _executeAssertion(command, callsite) {
        var _this9 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            const assertionTimeout = command.options.timeout === void 0 ? _this9.opts.assertionTimeout : command.options.timeout;
            const executor = new AssertionExecutor(command, assertionTimeout, callsite);

            executor.once('start-assertion-retries', function (timeout) {
                return _this9.executeCommand(new serviceCommands.ShowAssertionRetriesStatusCommand(timeout));
            });
            executor.once('end-assertion-retries', function (success) {
                return _this9.executeCommand(new serviceCommands.HideAssertionRetriesStatusCommand(success));
            });

            return executor.run();
        })();
    }

    _adjustConfigurationWithCommand(command) {
        if (command.type === _type2.default.testDone) {
            this.testDoneCommandQueued = true;
            _debugLogger2.default.hideBreakpoint(this.session.id);
        } else if (command.type === _type2.default.setNativeDialogHandler) this.activeDialogHandler = command.dialogHandler;else if (command.type === _type2.default.switchToIframe) this.activeIframeSelector = command.selector;else if (command.type === _type2.default.switchToMainWindow) this.activeIframeSelector = null;else if (command.type === _type2.default.setTestSpeed) this.speed = command.speed;else if (command.type === _type2.default.setPageLoadTimeout) this.pageLoadTimeout = command.duration;else if (command.type === _type2.default.debug) this.debugging = true;
    }

    _adjustScreenshotCommand(command) {
        var _this10 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            const browserId = _this10.browserConnection.id;

            var _ref2 = yield _this10.browserConnection.provider.hasCustomActionForBrowser(browserId);

            const hasChromelessScreenshots = _ref2.hasChromelessScreenshots;


            if (!hasChromelessScreenshots) command.generateScreenshotMark();
        })();
    }

    _setBreakpointIfNecessary(command, callsite) {
        var _this11 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            if (!_this11.disableDebugBreakpoints && _this11.debugging && (0, _utils.canSetDebuggerBreakpointBeforeCommand)(command)) yield _this11._enqueueSetBreakpointCommand(callsite);
        })();
    }

    executeCommand(command, callsite) {
        var _this12 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            _this12.debugLog.command(command);

            if (_this12.pendingPageError && (0, _utils.isCommandRejectableByPageError)(command)) return _this12._rejectCommandWithPageError(callsite);

            if ((0, _utils.isExecutableOnClientCommand)(command)) _this12.addingDriverTasksCount++;

            _this12._adjustConfigurationWithCommand(command);

            yield _this12._setBreakpointIfNecessary(command, callsite);

            if ((0, _utils.isScreenshotCommand)(command)) yield _this12._adjustScreenshotCommand(command);

            if ((0, _utils.isBrowserManipulationCommand)(command)) {
                _this12.browserManipulationQueue.push(command);

                if ((0, _utils.isResizeWindowCommand)(command) && _this12.opts.videoPath) _this12.warningLog.addWarning(_warningMessage2.default.videoBrowserResizing, _this12.test.name);
            }

            if (command.type === _type2.default.wait) return (0, _delay2.default)(command.timeout);

            if (command.type === _type2.default.setPageLoadTimeout) return null;

            if (command.type === _type2.default.debug) return yield _this12._enqueueSetBreakpointCommand(callsite);

            if (command.type === _type2.default.useRole) return yield _this12._useRole(command.role, callsite);

            if (command.type === _type2.default.assertion) return _this12._executeAssertion(command, callsite);

            if (command.type === _type2.default.executeExpression) return yield _this12._executeExpression(command, callsite);

            if (command.type === _type2.default.getBrowserConsoleMessages) return yield _this12._enqueueBrowserConsoleMessagesCommand(command, callsite);

            return _this12._enqueueCommand(command, callsite);
        })();
    }

    _rejectCommandWithPageError(callsite) {
        const err = this.pendingPageError;

        err.callsite = callsite;
        this.pendingPageError = null;
        err.__stack = new Error().stack;

        return _pinkie2.default.reject(err);
    }

    // Role management
    getStateSnapshot() {
        var _this13 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            const state = _this13.session.getStateSnapshot();

            state.storages = yield _this13.executeCommand(new serviceCommands.BackupStoragesCommand());

            return state;
        })();
    }

    switchToCleanRun() {
        var _this14 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            _this14.ctx = (0, _create2.default)(null);
            _this14.fixtureCtx = (0, _create2.default)(null);
            _this14.consoleMessages = new _browserConsoleMessages2.default();

            _this14.session.useStateSnapshot(_testcafeHammerhead.StateSnapshot.empty());

            if (_this14.activeDialogHandler) {
                const removeDialogHandlerCommand = new actionCommands.SetNativeDialogHandlerCommand({ dialogHandler: { fn: null } });

                yield _this14.executeCommand(removeDialogHandlerCommand);
            }

            if (_this14.speed !== _this14.opts.speed) {
                const setSpeedCommand = new actionCommands.SetTestSpeedCommand({ speed: _this14.opts.speed });

                yield _this14.executeCommand(setSpeedCommand);
            }

            if (_this14.pageLoadTimeout !== _this14.opts.pageLoadTimeout) {
                const setPageLoadTimeoutCommand = new actionCommands.SetPageLoadTimeoutCommand({ duration: _this14.opts.pageLoadTimeout });

                yield _this14.executeCommand(setPageLoadTimeoutCommand);
            }
        })();
    }

    _getStateSnapshotFromRole(role) {
        var _this15 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            const prevPhase = _this15.phase;

            _this15.phase = _phase2.default.inRoleInitializer;

            if (role.phase === _phase4.default.uninitialized) yield role.initialize(_this15);else if (role.phase === _phase4.default.pendingInitialization) yield (0, _promisifyEvent2.default)(role, 'initialized');

            if (role.initErr) throw role.initErr;

            _this15.phase = prevPhase;

            return role.stateSnapshot;
        })();
    }

    _useRole(role, callsite) {
        var _this16 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            if (_this16.phase === _phase2.default.inRoleInitializer) throw new _testRun.RoleSwitchInRoleInitializerError(callsite);

            _this16.disableDebugBreakpoints = true;

            const bookmark = new TestRunBookmark(_this16, role);

            yield bookmark.init();

            if (_this16.currentRoleId) _this16.usedRoleStates[_this16.currentRoleId] = yield _this16.getStateSnapshot();

            const stateSnapshot = _this16.usedRoleStates[role.id] || (yield _this16._getStateSnapshotFromRole(role));

            _this16.session.useStateSnapshot(stateSnapshot);

            _this16.currentRoleId = role.id;

            yield bookmark.restore(callsite, stateSnapshot);

            _this16.disableDebugBreakpoints = false;
        })();
    }

    // Get current URL
    getCurrentUrl() {
        var _this17 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            const builder = new ClientFunctionBuilder(function () {
                /* eslint-disable no-undef */
                return window.location.href;
                /* eslint-enable no-undef */
            }, { boundTestRun: _this17 });

            const getLocation = builder.getFunction();

            return yield getLocation();
        })();
    }

    _disconnect(err) {
        this.disconnected = true;

        if (this.currentDriverTask) this._rejectCurrentDriverTask(err);

        this.emit('disconnected', err);

        delete _testRunTracker2.default.activeTestRuns[this.session.id];
    }
}

exports.default = TestRun; // Service message handlers

const ServiceMessages = TestRun.prototype;

// NOTE: this function is time-critical and must return ASAP to avoid client disconnection
ServiceMessages[_clientMessages2.default.ready] = function (msg) {
    this.debugLog.driverMessage(msg);

    this.emit('connected');

    this._clearPendingRequest();

    // NOTE: the driver sends the status for the second time if it didn't get a response at the
    // first try. This is possible when the page was unloaded after the driver sent the status.
    if (msg.status.id === this.lastDriverStatusId) return this.lastDriverStatusResponse;

    this.lastDriverStatusId = msg.status.id;
    this.lastDriverStatusResponse = this._handleDriverRequest(msg.status);

    if (this.lastDriverStatusResponse) return this.lastDriverStatusResponse;

    // NOTE: we send an empty response after the MAX_RESPONSE_DELAY timeout is exceeded to keep connection
    // with the client and prevent the response timeout exception on the client side
    const responseTimeout = setTimeout(() => this._resolvePendingRequest(null), MAX_RESPONSE_DELAY);

    return new _pinkie2.default((resolve, reject) => {
        this.pendingRequest = { resolve, reject, responseTimeout };
    });
};

ServiceMessages[_clientMessages2.default.readyForBrowserManipulation] = (() => {
    var _ref3 = (0, _asyncToGenerator3.default)(function* (msg) {
        this.debugLog.driverMessage(msg);

        let result = null;
        let error = null;

        try {
            result = yield this.browserManipulationQueue.executePendingManipulation(msg);
        } catch (err) {
            error = err;
        }

        return { result, error };
    });

    return function (_x3) {
        return _ref3.apply(this, arguments);
    };
})();

ServiceMessages[_clientMessages2.default.waitForFileDownload] = function (msg) {
    this.debugLog.driverMessage(msg);

    return new _pinkie2.default(resolve => {
        if (this.fileDownloadingHandled) {
            this.fileDownloadingHandled = false;
            resolve(true);
        } else this.resolveWaitForFileDownloadingPromise = resolve;
    });
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90ZXN0LXJ1bi9pbmRleC5qcyJdLCJuYW1lcyI6WyJsYXp5UmVxdWlyZSIsInJlcXVpcmUiLCJTZXNzaW9uQ29udHJvbGxlciIsIkNsaWVudEZ1bmN0aW9uQnVpbGRlciIsImV4ZWN1dGVKc0V4cHJlc3Npb24iLCJCcm93c2VyTWFuaXB1bGF0aW9uUXVldWUiLCJUZXN0UnVuQm9va21hcmsiLCJBc3NlcnRpb25FeGVjdXRvciIsImFjdGlvbkNvbW1hbmRzIiwiYnJvd3Nlck1hbmlwdWxhdGlvbkNvbW1hbmRzIiwic2VydmljZUNvbW1hbmRzIiwiVEVTVF9SVU5fVEVNUExBVEUiLCJJRlJBTUVfVEVTVF9SVU5fVEVNUExBVEUiLCJURVNUX0RPTkVfQ09ORklSTUFUSU9OX1JFU1BPTlNFIiwiTUFYX1JFU1BPTlNFX0RFTEFZIiwiQUxMX0RSSVZFUl9UQVNLU19BRERFRF9UT19RVUVVRV9FVkVOVCIsIlRlc3RSdW4iLCJjb25zdHJ1Y3RvciIsInRlc3QiLCJicm93c2VyQ29ubmVjdGlvbiIsInNjcmVlbnNob3RDYXB0dXJlciIsImdsb2JhbFdhcm5pbmdMb2ciLCJvcHRzIiwid2FybmluZ0xvZyIsInBoYXNlIiwiaW5pdGlhbCIsImRyaXZlclRhc2tRdWV1ZSIsInRlc3REb25lQ29tbWFuZFF1ZXVlZCIsImFjdGl2ZURpYWxvZ0hhbmRsZXIiLCJhY3RpdmVJZnJhbWVTZWxlY3RvciIsInNwZWVkIiwicGFnZUxvYWRUaW1lb3V0IiwiZGlzYWJsZVBhZ2VSZWxvYWRzIiwic2Vzc2lvbiIsImdldFNlc3Npb24iLCJjb25zb2xlTWVzc2FnZXMiLCJwZW5kaW5nUmVxdWVzdCIsInBlbmRpbmdQYWdlRXJyb3IiLCJjb250cm9sbGVyIiwiY3R4IiwiZml4dHVyZUN0eCIsImN1cnJlbnRSb2xlSWQiLCJ1c2VkUm9sZVN0YXRlcyIsImVycnMiLCJsYXN0RHJpdmVyU3RhdHVzSWQiLCJsYXN0RHJpdmVyU3RhdHVzUmVzcG9uc2UiLCJmaWxlRG93bmxvYWRpbmdIYW5kbGVkIiwicmVzb2x2ZVdhaXRGb3JGaWxlRG93bmxvYWRpbmdQcm9taXNlIiwiYWRkaW5nRHJpdmVyVGFza3NDb3VudCIsImRlYnVnZ2luZyIsImRlYnVnTW9kZSIsImRlYnVnT25GYWlsIiwiZGlzYWJsZURlYnVnQnJlYWtwb2ludHMiLCJkZWJ1Z1JlcG9ydGVyUGx1Z2luSG9zdCIsIm5vQ29sb3JzIiwiYnJvd3Nlck1hbmlwdWxhdGlvblF1ZXVlIiwiZGVidWdMb2ciLCJ1c2VyQWdlbnQiLCJxdWFyYW50aW5lIiwiaW5qZWN0YWJsZSIsInNjcmlwdHMiLCJwdXNoIiwic3R5bGVzIiwicmVxdWVzdEhvb2tzIiwiX2luaXRSZXF1ZXN0SG9va3MiLCJpZCIsImFkZFF1YXJhbnRpbmVJbmZvIiwiYWRkUmVxdWVzdEhvb2siLCJob29rIiwiaW5kZXhPZiIsIl9pbml0UmVxdWVzdEhvb2siLCJyZW1vdmVSZXF1ZXN0SG9vayIsIl9kaXNwb3NlUmVxdWVzdEhvb2siLCJfaW5zdGFudGlhdGVSZXF1ZXN0RmlsdGVyUnVsZXMiLCJfaW5zdGFudGlhdGVkUmVxdWVzdEZpbHRlclJ1bGVzIiwiZm9yRWFjaCIsInJ1bGUiLCJhZGRSZXF1ZXN0RXZlbnRMaXN0ZW5lcnMiLCJvblJlcXVlc3QiLCJiaW5kIiwib25Db25maWd1cmVSZXNwb25zZSIsIl9vbkNvbmZpZ3VyZVJlc3BvbnNlIiwib25SZXNwb25zZSIsInJlbW92ZVJlcXVlc3RFdmVudExpc3RlbmVycyIsIl9nZXRQYXlsb2FkU2NyaXB0IiwicmVuZGVyIiwidGVzdFJ1bklkIiwiYnJvd3NlcklkIiwiYnJvd3NlckhlYXJ0YmVhdFJlbGF0aXZlVXJsIiwiaGVhcnRiZWF0UmVsYXRpdmVVcmwiLCJicm93c2VyU3RhdHVzUmVsYXRpdmVVcmwiLCJzdGF0dXNSZWxhdGl2ZVVybCIsImJyb3dzZXJTdGF0dXNEb25lUmVsYXRpdmVVcmwiLCJzdGF0dXNEb25lUmVsYXRpdmVVcmwiLCJ0ZXN0TmFtZSIsIm5hbWUiLCJmaXh0dXJlTmFtZSIsImZpeHR1cmUiLCJzZWxlY3RvclRpbWVvdXQiLCJza2lwSnNFcnJvcnMiLCJyZXRyeVRlc3RQYWdlcyIsImRpYWxvZ0hhbmRsZXIiLCJfZ2V0SWZyYW1lUGF5bG9hZFNjcmlwdCIsImdldEF1dGhDcmVkZW50aWFscyIsImF1dGhDcmVkZW50aWFscyIsImhhbmRsZUZpbGVEb3dubG9hZCIsImhhbmRsZVBhZ2VFcnJvciIsImVyciIsInJlcSIsImhlYWRlcnMiLCJjbG9zZVdpdGhFcnJvciIsInRvU3RyaW5nIiwicmVxT3B0cyIsInVybCIsInJlZGlyZWN0IiwidG9Qcm94eVVybCIsIl9leGVjdXRlVGVzdEZuIiwiZm4iLCJzY3JlZW5zaG90UGF0aCIsInRha2VTY3JlZW5zaG90c09uRmFpbHMiLCJleGVjdXRlQ29tbWFuZCIsIlRha2VTY3JlZW5zaG90T25GYWlsQ29tbWFuZCIsImFkZEVycm9yIiwiX2FkZFBlbmRpbmdQYWdlRXJyb3JJZkFueSIsIl9ydW5CZWZvcmVIb29rIiwiYmVmb3JlRm4iLCJpblRlc3RCZWZvcmVIb29rIiwiYmVmb3JlRWFjaEZuIiwiaW5GaXh0dXJlQmVmb3JlRWFjaEhvb2siLCJfcnVuQWZ0ZXJIb29rIiwiYWZ0ZXJGbiIsImluVGVzdEFmdGVySG9vayIsImFmdGVyRWFjaEZuIiwiaW5GaXh0dXJlQWZ0ZXJFYWNoSG9vayIsInN0YXJ0IiwiYWN0aXZlVGVzdFJ1bnMiLCJlbWl0Iiwib25EaXNjb25uZWN0ZWQiLCJfZGlzY29ubmVjdCIsIm9uY2UiLCJpblRlc3QiLCJkaXNjb25uZWN0ZWQiLCJyZW1vdmVMaXN0ZW5lciIsImxlbmd0aCIsIl9lbnF1ZXVlU2V0QnJlYWtwb2ludENvbW1hbmQiLCJmb3JtYXRFcnJvciIsIlRlc3REb25lQ29tbWFuZCIsIl9jcmVhdGVFcnJvckFkYXB0ZXIiLCJ0ZXN0UnVuUGhhc2UiLCJlcnJMaXN0IiwiaXRlbXMiLCJpdGVtIiwiYWRhcHRlciIsIl9lbnF1ZXVlQ29tbWFuZCIsImNvbW1hbmQiLCJjYWxsc2l0ZSIsIl9yZXNvbHZlUGVuZGluZ1JlcXVlc3QiLCJyZXNvbHZlIiwicmVqZWN0IiwiZHJpdmVyVGFza1F1ZXVlTGVuZ3RoIiwiX2VucXVldWVCcm93c2VyQ29uc29sZU1lc3NhZ2VzQ29tbWFuZCIsImdldENvcHkiLCJlcnJvciIsImlzSGVhZGxlc3NCcm93c2VyIiwiYWRkV2FybmluZyIsImRlYnVnSW5IZWFkbGVzc0Vycm9yIiwic2hvd0JyZWFrcG9pbnQiLCJTZXRCcmVha3BvaW50Q29tbWFuZCIsIl9yZW1vdmVBbGxOb25TZXJ2aWNlVGFza3MiLCJmaWx0ZXIiLCJkcml2ZXJUYXNrIiwicmVtb3ZlQWxsTm9uU2VydmljZU1hbmlwdWxhdGlvbnMiLCJjdXJyZW50RHJpdmVyVGFzayIsIl9yZXNvbHZlQ3VycmVudERyaXZlclRhc2siLCJyZXN1bHQiLCJzaGlmdCIsIl9yZWplY3RDdXJyZW50RHJpdmVyVGFzayIsIl9fc3RhY2siLCJFcnJvciIsInN0YWNrIiwiX2NsZWFyUGVuZGluZ1JlcXVlc3QiLCJjbGVhclRpbWVvdXQiLCJyZXNwb25zZVRpbWVvdXQiLCJfZnVsZmlsbEN1cnJlbnREcml2ZXJUYXNrIiwiZHJpdmVyU3RhdHVzIiwiZXhlY3V0aW9uRXJyb3IiLCJfaGFuZGxlUGFnZUVycm9yU3RhdHVzIiwicGFnZUVycm9yIiwiX2hhbmRsZURyaXZlclJlcXVlc3QiLCJpc1Rlc3REb25lIiwidHlwZSIsInRlc3REb25lIiwiY3VycmVudFRhc2tSZWplY3RlZEJ5RXJyb3IiLCJfIiwiY29uY2F0IiwiaXNDb21tYW5kUmVzdWx0IiwiX2dldEN1cnJlbnREcml2ZXJUYXNrQ29tbWFuZCIsIm5hdmlnYXRlVG8iLCJzdGF0ZVNuYXBzaG90IiwidXNlU3RhdGVTbmFwc2hvdCIsIkpTT04iLCJwYXJzZSIsIl9leGVjdXRlRXhwcmVzc2lvbiIsInJlc3VsdFZhcmlhYmxlTmFtZSIsImlzQXN5bmNFeHByZXNzaW9uIiwiZXhwcmVzc2lvbiIsInNraXBWaXNpYmlsaXR5Q2hlY2siLCJfZXhlY3V0ZUFzc2VydGlvbiIsImFzc2VydGlvblRpbWVvdXQiLCJvcHRpb25zIiwidGltZW91dCIsImV4ZWN1dG9yIiwiU2hvd0Fzc2VydGlvblJldHJpZXNTdGF0dXNDb21tYW5kIiwiSGlkZUFzc2VydGlvblJldHJpZXNTdGF0dXNDb21tYW5kIiwic3VjY2VzcyIsInJ1biIsIl9hZGp1c3RDb25maWd1cmF0aW9uV2l0aENvbW1hbmQiLCJoaWRlQnJlYWtwb2ludCIsInNldE5hdGl2ZURpYWxvZ0hhbmRsZXIiLCJzd2l0Y2hUb0lmcmFtZSIsInNlbGVjdG9yIiwic3dpdGNoVG9NYWluV2luZG93Iiwic2V0VGVzdFNwZWVkIiwic2V0UGFnZUxvYWRUaW1lb3V0IiwiZHVyYXRpb24iLCJkZWJ1ZyIsIl9hZGp1c3RTY3JlZW5zaG90Q29tbWFuZCIsInByb3ZpZGVyIiwiaGFzQ3VzdG9tQWN0aW9uRm9yQnJvd3NlciIsImhhc0Nocm9tZWxlc3NTY3JlZW5zaG90cyIsImdlbmVyYXRlU2NyZWVuc2hvdE1hcmsiLCJfc2V0QnJlYWtwb2ludElmTmVjZXNzYXJ5IiwiX3JlamVjdENvbW1hbmRXaXRoUGFnZUVycm9yIiwidmlkZW9QYXRoIiwidmlkZW9Ccm93c2VyUmVzaXppbmciLCJ3YWl0IiwidXNlUm9sZSIsIl91c2VSb2xlIiwicm9sZSIsImFzc2VydGlvbiIsImV4ZWN1dGVFeHByZXNzaW9uIiwiZ2V0QnJvd3NlckNvbnNvbGVNZXNzYWdlcyIsImdldFN0YXRlU25hcHNob3QiLCJzdGF0ZSIsInN0b3JhZ2VzIiwiQmFja3VwU3RvcmFnZXNDb21tYW5kIiwic3dpdGNoVG9DbGVhblJ1biIsImVtcHR5IiwicmVtb3ZlRGlhbG9nSGFuZGxlckNvbW1hbmQiLCJTZXROYXRpdmVEaWFsb2dIYW5kbGVyQ29tbWFuZCIsInNldFNwZWVkQ29tbWFuZCIsIlNldFRlc3RTcGVlZENvbW1hbmQiLCJzZXRQYWdlTG9hZFRpbWVvdXRDb21tYW5kIiwiU2V0UGFnZUxvYWRUaW1lb3V0Q29tbWFuZCIsIl9nZXRTdGF0ZVNuYXBzaG90RnJvbVJvbGUiLCJwcmV2UGhhc2UiLCJpblJvbGVJbml0aWFsaXplciIsInVuaW5pdGlhbGl6ZWQiLCJpbml0aWFsaXplIiwicGVuZGluZ0luaXRpYWxpemF0aW9uIiwiaW5pdEVyciIsImJvb2ttYXJrIiwiaW5pdCIsInJlc3RvcmUiLCJnZXRDdXJyZW50VXJsIiwiYnVpbGRlciIsIndpbmRvdyIsImxvY2F0aW9uIiwiaHJlZiIsImJvdW5kVGVzdFJ1biIsImdldExvY2F0aW9uIiwiZ2V0RnVuY3Rpb24iLCJTZXJ2aWNlTWVzc2FnZXMiLCJwcm90b3R5cGUiLCJyZWFkeSIsIm1zZyIsImRyaXZlck1lc3NhZ2UiLCJzdGF0dXMiLCJzZXRUaW1lb3V0IiwicmVhZHlGb3JCcm93c2VyTWFuaXB1bGF0aW9uIiwiZXhlY3V0ZVBlbmRpbmdNYW5pcHVsYXRpb24iLCJ3YWl0Rm9yRmlsZURvd25sb2FkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOztBQUNBOztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7O0FBRUE7Ozs7QUFVQSxNQUFNQSxjQUE4QkMsUUFBUSxhQUFSLEVBQXVCQSxPQUF2QixDQUFwQztBQUNBLE1BQU1DLG9CQUE4QkYsWUFBWSxzQkFBWixDQUFwQztBQUNBLE1BQU1HLHdCQUE4QkgsWUFBWSw2Q0FBWixDQUFwQztBQUNBLE1BQU1JLHNCQUE4QkosWUFBWSx5QkFBWixDQUFwQztBQUNBLE1BQU1LLDJCQUE4QkwsWUFBWSw4QkFBWixDQUFwQztBQUNBLE1BQU1NLGtCQUE4Qk4sWUFBWSxZQUFaLENBQXBDO0FBQ0EsTUFBTU8sb0JBQThCUCxZQUFZLHdCQUFaLENBQXBDO0FBQ0EsTUFBTVEsaUJBQThCUixZQUFZLG9CQUFaLENBQXBDO0FBQ0EsTUFBTVMsOEJBQThCVCxZ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QUhELE1BS0ksS0FBSzlHLG9DQUFMLEdBQTRDOEcsT0FBNUM7QUFDUCxLQVBNLENBQVA7QUFRSCxDQVhEIiwiZmlsZSI6InRlc3QtcnVuL2luZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgcHVsbCBhcyByZW1vdmUgfSBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IHsgcmVhZFN5bmMgYXMgcmVhZCB9IGZyb20gJ3JlYWQtZmlsZS1yZWxhdGl2ZSc7XG5pbXBvcnQgcHJvbWlzaWZ5RXZlbnQgZnJvbSAncHJvbWlzaWZ5LWV2ZW50JztcbmltcG9ydCBQcm9taXNlIGZyb20gJ3BpbmtpZSc7XG5pbXBvcnQgTXVzdGFjaGUgZnJvbSAnbXVzdGFjaGUnO1xuaW1wb3J0IEFzeW5jRXZlbnRFbWl0dGVyIGZyb20gJy4uL3V0aWxzL2FzeW5jLWV2ZW50LWVtaXR0ZXInO1xuaW1wb3J0IGRlYnVnTG9nZ2VyIGZyb20gJy4uL25vdGlmaWNhdGlvbnMvZGVidWctbG9nZ2VyJztcbmltcG9ydCBUZXN0UnVuRGVidWdMb2cgZnJvbSAnLi9kZWJ1Zy1sb2cnO1xuaW1wb3J0IFRlc3RSdW5FcnJvckZvcm1hdHRhYmxlQWRhcHRlciBmcm9tICcuLi9lcnJvcnMvdGVzdC1ydW4vZm9ybWF0dGFibGUtYWRhcHRlcic7XG5pbXBvcnQgVGVzdENhZmVFcnJvckxpc3QgZnJvbSAnLi4vZXJyb3JzL2Vycm9yLWxpc3QnO1xuaW1wb3J0IHsgUGFnZUxvYWRFcnJvciwgUm9sZVN3aXRjaEluUm9sZUluaXRpYWxpemVyRXJyb3IgfSBmcm9tICcuLi9lcnJvcnMvdGVzdC1ydW4vJztcbmltcG9ydCBQSEFTRSBmcm9tICcuL3BoYXNlJztcbmltcG9ydCBDTElFTlRfTUVTU0FHRVMgZnJvbSAnLi9jbGllbnQtbWVzc2FnZXMnO1xuaW1wb3J0IENPTU1BTkRfVFlQRSBmcm9tICcuL2NvbW1hbmRzL3R5cGUnO1xuaW1wb3J0IGRlbGF5IGZyb20gJy4uL3V0aWxzL2RlbGF5JztcbmltcG9ydCB0ZXN0UnVuTWFya2VyIGZyb20gJy4vbWFya2VyLXN5bWJvbCc7XG5pbXBvcnQgdGVzdFJ1blRyYWNrZXIgZnJvbSAnLi4vYXBpL3Rlc3QtcnVuLXRyYWNrZXInO1xuaW1wb3J0IFJPTEVfUEhBU0UgZnJvbSAnLi4vcm9sZS9waGFzZSc7XG5pbXBvcnQgUmVwb3J0ZXJQbHVnaW5Ib3N0IGZyb20gJy4uL3JlcG9ydGVyL3BsdWdpbi1ob3N0JztcbmltcG9ydCBCcm93c2VyQ29uc29sZU1lc3NhZ2VzIGZyb20gJy4vYnJvd3Nlci1jb25zb2xlLW1lc3NhZ2VzJztcbmltcG9ydCB7IFVOU1RBQkxFX05FVFdPUktfTU9ERV9IRUFERVIgfSBmcm9tICcuLi9icm93c2VyL2Nvbm5lY3Rpb24vdW5zdGFibGUtbmV0d29yay1tb2RlJztcbmltcG9ydCBXYXJuaW5nTG9nIGZyb20gJy4uL25vdGlmaWNhdGlvbnMvd2FybmluZy1sb2cnO1xuaW1wb3J0IFdBUk5JTkdfTUVTU0FHRSBmcm9tICcuLi9ub3RpZmljYXRpb25zL3dhcm5pbmctbWVzc2FnZSc7XG5pbXBvcnQgeyBTdGF0ZVNuYXBzaG90IH0gZnJvbSAndGVzdGNhZmUtaGFtbWVyaGVhZCc7XG5cbmltcG9ydCB7XG4gICAgaXNDb21tYW5kUmVqZWN0YWJsZUJ5UGFnZUVycm9yLFxuICAgIGlzQnJvd3Nlck1hbmlwdWxhdGlvbkNvbW1hbmQsXG4gICAgaXNTY3JlZW5zaG90Q29tbWFuZCxcbiAgICBpc1NlcnZpY2VDb21tYW5kLFxuICAgIGNhblNldERlYnVnZ2VyQnJlYWtwb2ludEJlZm9yZUNvbW1hbmQsXG4gICAgaXNFeGVjdXRhYmxlT25DbGllbnRDb21tYW5kLFxuICAgIGlzUmVzaXplV2luZG93Q29tbWFuZFxufSBmcm9tICcuL2NvbW1hbmRzL3V0aWxzJztcblxuY29uc3QgbGF6eVJlcXVpcmUgICAgICAgICAgICAgICAgID0gcmVxdWlyZSgnaW1wb3J0LWxhenknKShyZXF1aXJlKTtcbmNvbnN0IFNlc3Npb25Db250cm9sbGVyICAgICAgICAgICA9IGxhenlSZXF1aXJlKCcuL3Nlc3Npb24tY29udHJvbGxlcicpO1xuY29uc3QgQ2xpZW50RnVuY3Rpb25CdWlsZGVyICAgICAgID0gbGF6eVJlcXVpcmUoJy4uL2NsaWVudC1mdW5jdGlvbnMvY2xpZW50LWZ1bmN0aW9uLWJ1aWxkZXInKTtcbmNvbnN0IGV4ZWN1dGVKc0V4cHJlc3Npb24gICAgICAgICA9IGxhenlSZXF1aXJlKCcuL2V4ZWN1dGUtanMtZXhwcmVzc2lvbicpO1xuY29uc3QgQnJvd3Nlck1hbmlwdWxhdGlvblF1ZXVlICAgID0gbGF6eVJlcXVpcmUoJy4vYnJvd3Nlci1tYW5pcHVsYXRpb24tcXVldWUnKTtcbmNvbnN0IFRlc3RSdW5Cb29rbWFyayAgICAgICAgICAgICA9IGxhenlSZXF1aXJlKCcuL2Jvb2ttYXJrJyk7XG5jb25zdCBBc3NlcnRpb25FeGVjdXRvciAgICAgICAgICAgPSBsYXp5UmVxdWlyZSgnLi4vYXNzZXJ0aW9ucy9leGVjdXRvcicpO1xuY29uc3QgYWN0aW9uQ29tbWFuZHMgICAgICAgICAgICAgID0gbGF6eVJlcXVpcmUoJy4vY29tbWFuZHMvYWN0aW9ucycpO1xuY29uc3QgYnJvd3Nlck1hbmlwdWxhdGlvbkNvbW1hbmRzID0gbGF6eVJlcXVpcmUoJy4vY29tbWFuZHMvYnJvd3Nlci1tYW5pcHVsYXRpb24nKTtcbmNvbnN0IHNlcnZpY2VDb21tYW5kcyAgICAgICAgICAgICA9IGxhenlSZXF1aXJlKCcuL2NvbW1hbmRzL3NlcnZpY2UnKTtcblxuXG5jb25zdCBURVNUX1JVTl9URU1QTEFURSAgICAgICAgICAgICAgID0gcmVhZCgnLi4vY2xpZW50L3Rlc3QtcnVuL2luZGV4LmpzLm11c3RhY2hlJyk7XG5jb25zdCBJRlJBTUVfVEVTVF9SVU5fVEVNUExBVEUgICAgICAgID0gcmVhZCgnLi4vY2xpZW50L3Rlc3QtcnVuL2lmcmFtZS5qcy5tdXN0YWNoZScpO1xuY29uc3QgVEVTVF9ET05FX0NPTkZJUk1BVElPTl9SRVNQT05TRSA9ICd0ZXN0LWRvbmUtY29uZmlybWF0aW9uJztcbmNvbnN0IE1BWF9SRVNQT05TRV9ERUxBWSAgICAgICAgICAgICAgPSAzMDAwO1xuXG5jb25zdCBBTExfRFJJVkVSX1RBU0tTX0FEREVEX1RPX1FVRVVFX0VWRU5UID0gJ2FsbC1kcml2ZXItdGFza3MtYWRkZWQtdG8tcXVldWUnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUZXN0UnVuIGV4dGVuZHMgQXN5bmNFdmVudEVtaXR0ZXIge1xuICAgIGNvbnN0cnVjdG9yICh0ZXN0LCBicm93c2VyQ29ubmVjdGlvbiwgc2NyZWVuc2hvdENhcHR1cmVyLCBnbG9iYWxXYXJuaW5nTG9nLCBvcHRzKSB7XG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgdGhpc1t0ZXN0UnVuTWFya2VyXSA9IHRydWU7XG5cbiAgICAgICAgdGhpcy53YXJuaW5nTG9nID0gbmV3IFdhcm5pbmdMb2coZ2xvYmFsV2FybmluZ0xvZyk7XG5cbiAgICAgICAgdGhpcy5vcHRzICAgICAgICAgICAgICA9IG9wdHM7XG4gICAgICAgIHRoaXMudGVzdCAgICAgICAgICAgICAgPSB0ZXN0O1xuICAgICAgICB0aGlzLmJyb3dzZXJDb25uZWN0aW9uID0gYnJvd3NlckNvbm5lY3Rpb247XG5cbiAgICAgICAgdGhpcy5waGFzZSA9IFBIQVNFLmluaXRpYWw7XG5cbiAgICAgICAgdGhpcy5kcml2ZXJUYXNrUXVldWUgICAgICAgPSBbXTtcbiAgICAgICAgdGhpcy50ZXN0RG9uZUNvbW1hbmRRdWV1ZWQgPSBmYWxzZTtcblxuICAgICAgICB0aGlzLmFjdGl2ZURpYWxvZ0hhbmRsZXIgID0gbnVsbDtcbiAgICAgICAgdGhpcy5hY3RpdmVJZnJhbWVTZWxlY3RvciA9IG51bGw7XG4gICAgICAgIHRoaXMuc3BlZWQgICAgICAgICAgICAgICAgPSB0aGlzLm9wdHMuc3BlZWQ7XG4gICAgICAgIHRoaXMucGFnZUxvYWRUaW1lb3V0ICAgICAgPSB0aGlzLm9wdHMucGFnZUxvYWRUaW1lb3V0O1xuXG4gICAgICAgIHRoaXMuZGlzYWJsZVBhZ2VSZWxvYWRzID0gdGVzdC5kaXNhYmxlUGFnZVJlbG9hZHMgfHwgb3B0cy5kaXNhYmxlUGFnZVJlbG9hZHMgJiYgdGVzdC5kaXNhYmxlUGFnZVJlbG9hZHMgIT09IGZhbHNlO1xuXG4gICAgICAgIHRoaXMuc2Vzc2lvbiA9IFNlc3Npb25Db250cm9sbGVyLmdldFNlc3Npb24odGhpcyk7XG5cbiAgICAgICAgdGhpcy5jb25zb2xlTWVzc2FnZXMgPSBuZXcgQnJvd3NlckNvbnNvbGVNZXNzYWdlcygpO1xuXG4gICAgICAgIHRoaXMucGVuZGluZ1JlcXVlc3QgICA9IG51bGw7XG4gICAgICAgIHRoaXMucGVuZGluZ1BhZ2VFcnJvciA9IG51bGw7XG5cbiAgICAgICAgdGhpcy5jb250cm9sbGVyID0gbnVsbDtcbiAgICAgICAgdGhpcy5jdHggICAgICAgID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICAgICAgdGhpcy5maXh0dXJlQ3R4ID0gbnVsbDtcblxuICAgICAgICB0aGlzLmN1cnJlbnRSb2xlSWQgID0gbnVsbDtcbiAgICAgICAgdGhpcy51c2VkUm9sZVN0YXRlcyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cbiAgICAgICAgdGhpcy5lcnJzID0gW107XG5cbiAgICAgICAgdGhpcy5sYXN0RHJpdmVyU3RhdHVzSWQgICAgICAgPSBudWxsO1xuICAgICAgICB0aGlzLmxhc3REcml2ZXJTdGF0dXNSZXNwb25zZSA9IG51bGw7XG5cbiAgICAgICAgdGhpcy5maWxlRG93bmxvYWRpbmdIYW5kbGVkICAgICAgICAgICAgICAgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5yZXNvbHZlV2FpdEZvckZpbGVEb3dubG9hZGluZ1Byb21pc2UgPSBudWxsO1xuXG4gICAgICAgIHRoaXMuYWRkaW5nRHJpdmVyVGFza3NDb3VudCA9IDA7XG5cbiAgICAgICAgdGhpcy5kZWJ1Z2dpbmcgICAgICAgICAgICAgICA9IHRoaXMub3B0cy5kZWJ1Z01vZGU7XG4gICAgICAgIHRoaXMuZGVidWdPbkZhaWwgICAgICAgICAgICAgPSB0aGlzLm9wdHMuZGVidWdPbkZhaWw7XG4gICAgICAgIHRoaXMuZGlzYWJsZURlYnVnQnJlYWtwb2ludHMgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5kZWJ1Z1JlcG9ydGVyUGx1Z2luSG9zdCA9IG5ldyBSZXBvcnRlclBsdWdpbkhvc3QoeyBub0NvbG9yczogZmFsc2UgfSk7XG5cbiAgICAgICAgdGhpcy5icm93c2VyTWFuaXB1bGF0aW9uUXVldWUgPSBuZXcgQnJvd3Nlck1hbmlwdWxhdGlvblF1ZXVlKGJyb3dzZXJDb25uZWN0aW9uLCBzY3JlZW5zaG90Q2FwdHVyZXIsIHRoaXMud2FybmluZ0xvZyk7XG5cbiAgICAgICAgdGhpcy5kZWJ1Z0xvZyA9IG5ldyBUZXN0UnVuRGVidWdMb2codGhpcy5icm93c2VyQ29ubmVjdGlvbi51c2VyQWdlbnQpO1xuXG4gICAgICAgIHRoaXMucXVhcmFudGluZSA9IG51bGw7XG5cbiAgICAgICAgdGhpcy5pbmplY3RhYmxlLnNjcmlwdHMucHVzaCgnL3Rlc3RjYWZlLWNvcmUuanMnKTtcbiAgICAgICAgdGhpcy5pbmplY3RhYmxlLnNjcmlwdHMucHVzaCgnL3Rlc3RjYWZlLXVpLmpzJyk7XG4gICAgICAgIHRoaXMuaW5qZWN0YWJsZS5zY3JpcHRzLnB1c2goJy90ZXN0Y2FmZS1hdXRvbWF0aW9uLmpzJyk7XG4gICAgICAgIHRoaXMuaW5qZWN0YWJsZS5zY3JpcHRzLnB1c2goJy90ZXN0Y2FmZS1kcml2ZXIuanMnKTtcbiAgICAgICAgdGhpcy5pbmplY3RhYmxlLnN0eWxlcy5wdXNoKCcvdGVzdGNhZmUtdWktc3R5bGVzLmNzcycpO1xuXG4gICAgICAgIHRoaXMucmVxdWVzdEhvb2tzID0gQXJyYXkuZnJvbSh0aGlzLnRlc3QucmVxdWVzdEhvb2tzKTtcblxuICAgICAgICB0aGlzLl9pbml0UmVxdWVzdEhvb2tzKCk7XG4gICAgfVxuXG4gICAgZ2V0IGlkICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2Vzc2lvbi5pZDtcbiAgICB9XG5cbiAgICBnZXQgaW5qZWN0YWJsZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNlc3Npb24uaW5qZWN0YWJsZTtcbiAgICB9XG5cbiAgICBhZGRRdWFyYW50aW5lSW5mbyAocXVhcmFudGluZSkge1xuICAgICAgICB0aGlzLnF1YXJhbnRpbmUgPSBxdWFyYW50aW5lO1xuICAgIH1cblxuICAgIGFkZFJlcXVlc3RIb29rIChob29rKSB7XG4gICAgICAgIGlmICh0aGlzLnJlcXVlc3RIb29rcy5pbmRleE9mKGhvb2spICE9PSAtMSlcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICB0aGlzLnJlcXVlc3RIb29rcy5wdXNoKGhvb2spO1xuICAgICAgICB0aGlzLl9pbml0UmVxdWVzdEhvb2soaG9vayk7XG4gICAgfVxuXG4gICAgcmVtb3ZlUmVxdWVzdEhvb2sgKGhvb2spIHtcbiAgICAgICAgaWYgKHRoaXMucmVxdWVzdEhvb2tzLmluZGV4T2YoaG9vaykgPT09IC0xKVxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIHJlbW92ZSh0aGlzLnJlcXVlc3RIb29rcywgaG9vayk7XG4gICAgICAgIHRoaXMuX2Rpc3Bvc2VSZXF1ZXN0SG9vayhob29rKTtcbiAgICB9XG5cbiAgICBfaW5pdFJlcXVlc3RIb29rIChob29rKSB7XG4gICAgICAgIGhvb2sud2FybmluZ0xvZyA9IHRoaXMud2FybmluZ0xvZztcblxuICAgICAgICBob29rLl9pbnN0YW50aWF0ZVJlcXVlc3RGaWx0ZXJSdWxlcygpO1xuICAgICAgICBob29rLl9pbnN0YW50aWF0ZWRSZXF1ZXN0RmlsdGVyUnVsZXMuZm9yRWFjaChydWxlID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2Vzc2lvbi5hZGRSZXF1ZXN0RXZlbnRMaXN0ZW5lcnMocnVsZSwge1xuICAgICAgICAgICAgICAgIG9uUmVxdWVzdDogICAgICAgICAgIGhvb2sub25SZXF1ZXN0LmJpbmQoaG9vayksXG4gICAgICAgICAgICAgICAgb25Db25maWd1cmVSZXNwb25zZTogaG9vay5fb25Db25maWd1cmVSZXNwb25zZS5iaW5kKGhvb2spLFxuICAgICAgICAgICAgICAgIG9uUmVzcG9uc2U6ICAgICAgICAgIGhvb2sub25SZXNwb25zZS5iaW5kKGhvb2spXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgX2Rpc3Bvc2VSZXF1ZXN0SG9vayAoaG9vaykge1xuICAgICAgICBob29rLndhcm5pbmdMb2cgPSBudWxsO1xuXG4gICAgICAgIGhvb2suX2luc3RhbnRpYXRlZFJlcXVlc3RGaWx0ZXJSdWxlcy5mb3JFYWNoKHJ1bGUgPT4ge1xuICAgICAgICAgICAgdGhpcy5zZXNzaW9uLnJlbW92ZVJlcXVlc3RFdmVudExpc3RlbmVycyhydWxlKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgX2luaXRSZXF1ZXN0SG9va3MgKCkge1xuICAgICAgICB0aGlzLnJlcXVlc3RIb29rcy5mb3JFYWNoKGhvb2sgPT4gdGhpcy5faW5pdFJlcXVlc3RIb29rKGhvb2spKTtcbiAgICB9XG5cbiAgICAvLyBIYW1tZXJoZWFkIHBheWxvYWRcbiAgICBfZ2V0UGF5bG9hZFNjcmlwdCAoKSB7XG4gICAgICAgIHRoaXMuZmlsZURvd25sb2FkaW5nSGFuZGxlZCAgICAgICAgICAgICAgID0gZmFsc2U7XG4gICAgICAgIHRoaXMucmVzb2x2ZVdhaXRGb3JGaWxlRG93bmxvYWRpbmdQcm9taXNlID0gbnVsbDtcblxuICAgICAgICByZXR1cm4gTXVzdGFjaGUucmVuZGVyKFRFU1RfUlVOX1RFTVBMQVRFLCB7XG4gICAgICAgICAgICB0ZXN0UnVuSWQ6ICAgICAgICAgICAgICAgICAgICBKU09OLnN0cmluZ2lmeSh0aGlzLnNlc3Npb24uaWQpLFxuICAgICAgICAgICAgYnJvd3NlcklkOiAgICAgICAgICAgICAgICAgICAgSlNPTi5zdHJpbmdpZnkodGhpcy5icm93c2VyQ29ubmVjdGlvbi5pZCksXG4gICAgICAgICAgICBicm93c2VySGVhcnRiZWF0UmVsYXRpdmVVcmw6ICBKU09OLnN0cmluZ2lmeSh0aGlzLmJyb3dzZXJDb25uZWN0aW9uLmhlYXJ0YmVhdFJlbGF0aXZlVXJsKSxcbiAgICAgICAgICAgIGJyb3dzZXJTdGF0dXNSZWxhdGl2ZVVybDogICAgIEpTT04uc3RyaW5naWZ5KHRoaXMuYnJvd3NlckNvbm5lY3Rpb24uc3RhdHVzUmVsYXRpdmVVcmwpLFxuICAgICAgICAgICAgYnJvd3NlclN0YXR1c0RvbmVSZWxhdGl2ZVVybDogSlNPTi5zdHJpbmdpZnkodGhpcy5icm93c2VyQ29ubmVjdGlvbi5zdGF0dXNEb25lUmVsYXRpdmVVcmwpLFxuICAgICAgICAgICAgdXNlckFnZW50OiAgICAgICAgICAgICAgICAgICAgSlNPTi5zdHJpbmdpZnkodGhpcy5icm93c2VyQ29ubmVjdGlvbi51c2VyQWdlbnQpLFxuICAgICAgICAgICAgdGVzdE5hbWU6ICAgICAgICAgICAgICAgICAgICAgSlNPTi5zdHJpbmdpZnkodGhpcy50ZXN0Lm5hbWUpLFxuICAgICAgICAgICAgZml4dHVyZU5hbWU6ICAgICAgICAgICAgICAgICAgSlNPTi5zdHJpbmdpZnkodGhpcy50ZXN0LmZpeHR1cmUubmFtZSksXG4gICAgICAgICAgICBzZWxlY3RvclRpbWVvdXQ6ICAgICAgICAgICAgICB0aGlzLm9wdHMuc2VsZWN0b3JUaW1lb3V0LFxuICAgICAgICAgICAgcGFnZUxvYWRUaW1lb3V0OiAgICAgICAgICAgICAgdGhpcy5wYWdlTG9hZFRpbWVvdXQsXG4gICAgICAgICAgICBza2lwSnNFcnJvcnM6ICAgICAgICAgICAgICAgICB0aGlzLm9wdHMuc2tpcEpzRXJyb3JzLFxuICAgICAgICAgICAgcmV0cnlUZXN0UGFnZXM6ICAgICAgICAgICAgICAgISF0aGlzLm9wdHMucmV0cnlUZXN0UGFnZXMsXG4gICAgICAgICAgICBzcGVlZDogICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNwZWVkLFxuICAgICAgICAgICAgZGlhbG9nSGFuZGxlcjogICAgICAgICAgICAgICAgSlNPTi5zdHJpbmdpZnkodGhpcy5hY3RpdmVEaWFsb2dIYW5kbGVyKVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBfZ2V0SWZyYW1lUGF5bG9hZFNjcmlwdCAoKSB7XG4gICAgICAgIHJldHVybiBNdXN0YWNoZS5yZW5kZXIoSUZSQU1FX1RFU1RfUlVOX1RFTVBMQVRFLCB7XG4gICAgICAgICAgICB0ZXN0UnVuSWQ6ICAgICAgIEpTT04uc3RyaW5naWZ5KHRoaXMuc2Vzc2lvbi5pZCksXG4gICAgICAgICAgICBzZWxlY3RvclRpbWVvdXQ6IHRoaXMub3B0cy5zZWxlY3RvclRpbWVvdXQsXG4gICAgICAgICAgICBwYWdlTG9hZFRpbWVvdXQ6IHRoaXMucGFnZUxvYWRUaW1lb3V0LFxuICAgICAgICAgICAgcmV0cnlUZXN0UGFnZXM6ICAhIXRoaXMub3B0cy5yZXRyeVRlc3RQYWdlcyxcbiAgICAgICAgICAgIHNwZWVkOiAgICAgICAgICAgdGhpcy5zcGVlZCxcbiAgICAgICAgICAgIGRpYWxvZ0hhbmRsZXI6ICAgSlNPTi5zdHJpbmdpZnkodGhpcy5hY3RpdmVEaWFsb2dIYW5kbGVyKVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBIYW1tZXJoZWFkIGhhbmRsZXJzXG4gICAgZ2V0QXV0aENyZWRlbnRpYWxzICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGVzdC5hdXRoQ3JlZGVudGlhbHM7XG4gICAgfVxuXG4gICAgaGFuZGxlRmlsZURvd25sb2FkICgpIHtcbiAgICAgICAgaWYgKHRoaXMucmVzb2x2ZVdhaXRGb3JGaWxlRG93bmxvYWRpbmdQcm9taXNlKSB7XG4gICAgICAgICAgICB0aGlzLnJlc29sdmVXYWl0Rm9yRmlsZURvd25sb2FkaW5nUHJvbWlzZSh0cnVlKTtcbiAgICAgICAgICAgIHRoaXMucmVzb2x2ZVdhaXRGb3JGaWxlRG93bmxvYWRpbmdQcm9taXNlID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0aGlzLmZpbGVEb3dubG9hZGluZ0hhbmRsZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIGhhbmRsZVBhZ2VFcnJvciAoY3R4LCBlcnIpIHtcbiAgICAgICAgaWYgKGN0eC5yZXEuaGVhZGVyc1tVTlNUQUJMRV9ORVRXT1JLX01PREVfSEVBREVSXSkge1xuICAgICAgICAgICAgY3R4LmNsb3NlV2l0aEVycm9yKDUwMCwgZXJyLnRvU3RyaW5nKCkpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5wZW5kaW5nUGFnZUVycm9yID0gbmV3IFBhZ2VMb2FkRXJyb3IoZXJyLCBjdHgucmVxT3B0cy51cmwpO1xuXG4gICAgICAgIGN0eC5yZWRpcmVjdChjdHgudG9Qcm94eVVybCgnYWJvdXQ6ZXJyb3InKSk7XG4gICAgfVxuXG4gICAgLy8gVGVzdCBmdW5jdGlvbiBleGVjdXRpb25cbiAgICBhc3luYyBfZXhlY3V0ZVRlc3RGbiAocGhhc2UsIGZuKSB7XG4gICAgICAgIHRoaXMucGhhc2UgPSBwaGFzZTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgZm4odGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgbGV0IHNjcmVlbnNob3RQYXRoID0gbnVsbDtcblxuICAgICAgICAgICAgaWYgKHRoaXMub3B0cy50YWtlU2NyZWVuc2hvdHNPbkZhaWxzKVxuICAgICAgICAgICAgICAgIHNjcmVlbnNob3RQYXRoID0gYXdhaXQgdGhpcy5leGVjdXRlQ29tbWFuZChuZXcgYnJvd3Nlck1hbmlwdWxhdGlvbkNvbW1hbmRzLlRha2VTY3JlZW5zaG90T25GYWlsQ29tbWFuZCgpKTtcblxuICAgICAgICAgICAgdGhpcy5hZGRFcnJvcihlcnIsIHNjcmVlbnNob3RQYXRoKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAhdGhpcy5fYWRkUGVuZGluZ1BhZ2VFcnJvcklmQW55KCk7XG4gICAgfVxuXG4gICAgYXN5bmMgX3J1bkJlZm9yZUhvb2sgKCkge1xuICAgICAgICBpZiAodGhpcy50ZXN0LmJlZm9yZUZuKVxuICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuX2V4ZWN1dGVUZXN0Rm4oUEhBU0UuaW5UZXN0QmVmb3JlSG9vaywgdGhpcy50ZXN0LmJlZm9yZUZuKTtcblxuICAgICAgICBpZiAodGhpcy50ZXN0LmZpeHR1cmUuYmVmb3JlRWFjaEZuKVxuICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuX2V4ZWN1dGVUZXN0Rm4oUEhBU0UuaW5GaXh0dXJlQmVmb3JlRWFjaEhvb2ssIHRoaXMudGVzdC5maXh0dXJlLmJlZm9yZUVhY2hGbik7XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgYXN5bmMgX3J1bkFmdGVySG9vayAoKSB7XG4gICAgICAgIGlmICh0aGlzLnRlc3QuYWZ0ZXJGbilcbiAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLl9leGVjdXRlVGVzdEZuKFBIQVNFLmluVGVzdEFmdGVySG9vaywgdGhpcy50ZXN0LmFmdGVyRm4pO1xuXG4gICAgICAgIGlmICh0aGlzLnRlc3QuZml4dHVyZS5hZnRlckVhY2hGbilcbiAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLl9leGVjdXRlVGVzdEZuKFBIQVNFLmluRml4dHVyZUFmdGVyRWFjaEhvb2ssIHRoaXMudGVzdC5maXh0dXJlLmFmdGVyRWFjaEZuKTtcblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBhc3luYyBzdGFydCAoKSB7XG4gICAgICAgIHRlc3RSdW5UcmFja2VyLmFjdGl2ZVRlc3RSdW5zW3RoaXMuc2Vzc2lvbi5pZF0gPSB0aGlzO1xuXG4gICAgICAgIGF3YWl0IHRoaXMuZW1pdCgnc3RhcnQnKTtcblxuICAgICAgICBjb25zdCBvbkRpc2Nvbm5lY3RlZCA9IGVyciA9PiB0aGlzLl9kaXNjb25uZWN0KGVycik7XG5cbiAgICAgICAgdGhpcy5icm93c2VyQ29ubmVjdGlvbi5vbmNlKCdkaXNjb25uZWN0ZWQnLCBvbkRpc2Nvbm5lY3RlZCk7XG5cbiAgICAgICAgYXdhaXQgdGhpcy5vbmNlKCdjb25uZWN0ZWQnKTtcblxuICAgICAgICBhd2FpdCB0aGlzLmVtaXQoJ3JlYWR5Jyk7XG5cbiAgICAgICAgaWYgKGF3YWl0IHRoaXMuX3J1bkJlZm9yZUhvb2soKSkge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5fZXhlY3V0ZVRlc3RGbihQSEFTRS5pblRlc3QsIHRoaXMudGVzdC5mbik7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLl9ydW5BZnRlckhvb2soKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmRpc2Nvbm5lY3RlZClcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICB0aGlzLmJyb3dzZXJDb25uZWN0aW9uLnJlbW92ZUxpc3RlbmVyKCdkaXNjb25uZWN0ZWQnLCBvbkRpc2Nvbm5lY3RlZCk7XG5cbiAgICAgICAgaWYgKHRoaXMuZXJycy5sZW5ndGggJiYgdGhpcy5kZWJ1Z09uRmFpbClcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuX2VucXVldWVTZXRCcmVha3BvaW50Q29tbWFuZChudWxsLCB0aGlzLmRlYnVnUmVwb3J0ZXJQbHVnaW5Ib3N0LmZvcm1hdEVycm9yKHRoaXMuZXJyc1swXSkpO1xuXG4gICAgICAgIGF3YWl0IHRoaXMuZW1pdCgnYmVmb3JlLWRvbmUnKTtcblxuICAgICAgICBhd2FpdCB0aGlzLmV4ZWN1dGVDb21tYW5kKG5ldyBzZXJ2aWNlQ29tbWFuZHMuVGVzdERvbmVDb21tYW5kKCkpO1xuXG4gICAgICAgIHRoaXMuX2FkZFBlbmRpbmdQYWdlRXJyb3JJZkFueSgpO1xuXG4gICAgICAgIGRlbGV0ZSB0ZXN0UnVuVHJhY2tlci5hY3RpdmVUZXN0UnVuc1t0aGlzLnNlc3Npb24uaWRdO1xuXG4gICAgICAgIGF3YWl0IHRoaXMuZW1pdCgnZG9uZScpO1xuICAgIH1cblxuICAgIC8vIEVycm9yc1xuICAgIF9hZGRQZW5kaW5nUGFnZUVycm9ySWZBbnkgKCkge1xuICAgICAgICBpZiAodGhpcy5wZW5kaW5nUGFnZUVycm9yKSB7XG4gICAgICAgICAgICB0aGlzLmFkZEVycm9yKHRoaXMucGVuZGluZ1BhZ2VFcnJvcik7XG4gICAgICAgICAgICB0aGlzLnBlbmRpbmdQYWdlRXJyb3IgPSBudWxsO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUVycm9yQWRhcHRlciAoZXJyLCBzY3JlZW5zaG90UGF0aCkge1xuICAgICAgICByZXR1cm4gbmV3IFRlc3RSdW5FcnJvckZvcm1hdHRhYmxlQWRhcHRlcihlcnIsIHtcbiAgICAgICAgICAgIHVzZXJBZ2VudDogICAgICB0aGlzLmJyb3dzZXJDb25uZWN0aW9uLnVzZXJBZ2VudCxcbiAgICAgICAgICAgIHNjcmVlbnNob3RQYXRoOiBzY3JlZW5zaG90UGF0aCB8fCAnJyxcbiAgICAgICAgICAgIHRlc3RSdW5QaGFzZTogICB0aGlzLnBoYXNlXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFkZEVycm9yIChlcnIsIHNjcmVlbnNob3RQYXRoKSB7XG4gICAgICAgIGNvbnN0IGVyckxpc3QgPSBlcnIgaW5zdGFuY2VvZiBUZXN0Q2FmZUVycm9yTGlzdCA/IGVyci5pdGVtcyA6IFtlcnJdO1xuXG4gICAgICAgIGVyckxpc3QuZm9yRWFjaChpdGVtID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGFkYXB0ZXIgPSB0aGlzLl9jcmVhdGVFcnJvckFkYXB0ZXIoaXRlbSwgc2NyZWVuc2hvdFBhdGgpO1xuXG4gICAgICAgICAgICB0aGlzLmVycnMucHVzaChhZGFwdGVyKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gVGFzayBxdWV1ZVxuICAgIF9lbnF1ZXVlQ29tbWFuZCAoY29tbWFuZCwgY2FsbHNpdGUpIHtcbiAgICAgICAgaWYgKHRoaXMucGVuZGluZ1JlcXVlc3QpXG4gICAgICAgICAgICB0aGlzLl9yZXNvbHZlUGVuZGluZ1JlcXVlc3QoY29tbWFuZCk7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGFzeW5jIChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIHRoaXMuYWRkaW5nRHJpdmVyVGFza3NDb3VudC0tO1xuICAgICAgICAgICAgdGhpcy5kcml2ZXJUYXNrUXVldWUucHVzaCh7IGNvbW1hbmQsIHJlc29sdmUsIHJlamVjdCwgY2FsbHNpdGUgfSk7XG5cbiAgICAgICAgICAgIGlmICghdGhpcy5hZGRpbmdEcml2ZXJUYXNrc0NvdW50KVxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuZW1pdChBTExfRFJJVkVSX1RBU0tTX0FEREVEX1RPX1FVRVVFX0VWRU5ULCB0aGlzLmRyaXZlclRhc2tRdWV1ZS5sZW5ndGgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBnZXQgZHJpdmVyVGFza1F1ZXVlTGVuZ3RoICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWRkaW5nRHJpdmVyVGFza3NDb3VudCA/IHByb21pc2lmeUV2ZW50KHRoaXMsIEFMTF9EUklWRVJfVEFTS1NfQURERURfVE9fUVVFVUVfRVZFTlQpIDogUHJvbWlzZS5yZXNvbHZlKHRoaXMuZHJpdmVyVGFza1F1ZXVlLmxlbmd0aCk7XG4gICAgfVxuXG4gICAgYXN5bmMgX2VucXVldWVCcm93c2VyQ29uc29sZU1lc3NhZ2VzQ29tbWFuZCAoY29tbWFuZCwgY2FsbHNpdGUpIHtcbiAgICAgICAgYXdhaXQgdGhpcy5fZW5xdWV1ZUNvbW1hbmQoY29tbWFuZCwgY2FsbHNpdGUpO1xuXG4gICAgICAgIHJldHVybiB0aGlzLmNvbnNvbGVNZXNzYWdlcy5nZXRDb3B5KCk7XG4gICAgfVxuXG4gICAgYXN5bmMgX2VucXVldWVTZXRCcmVha3BvaW50Q29tbWFuZCAoY2FsbHNpdGUsIGVycm9yKSB7XG4gICAgICAgIGlmICh0aGlzLmJyb3dzZXJDb25uZWN0aW9uLmlzSGVhZGxlc3NCcm93c2VyKCkpIHtcbiAgICAgICAgICAgIHRoaXMud2FybmluZ0xvZy5hZGRXYXJuaW5nKFdBUk5JTkdfTUVTU0FHRS5kZWJ1Z0luSGVhZGxlc3NFcnJvcik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBkZWJ1Z0xvZ2dlci5zaG93QnJlYWtwb2ludCh0aGlzLnNlc3Npb24uaWQsIHRoaXMuYnJvd3NlckNvbm5lY3Rpb24udXNlckFnZW50LCBjYWxsc2l0ZSwgZXJyb3IpO1xuXG4gICAgICAgIHRoaXMuZGVidWdnaW5nID0gYXdhaXQgdGhpcy5leGVjdXRlQ29tbWFuZChuZXcgc2VydmljZUNvbW1hbmRzLlNldEJyZWFrcG9pbnRDb21tYW5kKCEhZXJyb3IpLCBjYWxsc2l0ZSk7XG4gICAgfVxuXG4gICAgX3JlbW92ZUFsbE5vblNlcnZpY2VUYXNrcyAoKSB7XG4gICAgICAgIHRoaXMuZHJpdmVyVGFza1F1ZXVlID0gdGhpcy5kcml2ZXJUYXNrUXVldWUuZmlsdGVyKGRyaXZlclRhc2sgPT4gaXNTZXJ2aWNlQ29tbWFuZChkcml2ZXJUYXNrLmNvbW1hbmQpKTtcblxuICAgICAgICB0aGlzLmJyb3dzZXJNYW5pcHVsYXRpb25RdWV1ZS5yZW1vdmVBbGxOb25TZXJ2aWNlTWFuaXB1bGF0aW9ucygpO1xuICAgIH1cblxuICAgIC8vIEN1cnJlbnQgZHJpdmVyIHRhc2tcbiAgICBnZXQgY3VycmVudERyaXZlclRhc2sgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5kcml2ZXJUYXNrUXVldWVbMF07XG4gICAgfVxuXG4gICAgX3Jlc29sdmVDdXJyZW50RHJpdmVyVGFzayAocmVzdWx0KSB7XG4gICAgICAgIHRoaXMuY3VycmVudERyaXZlclRhc2sucmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICB0aGlzLmRyaXZlclRhc2tRdWV1ZS5zaGlmdCgpO1xuXG4gICAgICAgIGlmICh0aGlzLnRlc3REb25lQ29tbWFuZFF1ZXVlZClcbiAgICAgICAgICAgIHRoaXMuX3JlbW92ZUFsbE5vblNlcnZpY2VUYXNrcygpO1xuICAgIH1cblxuICAgIF9yZWplY3RDdXJyZW50RHJpdmVyVGFzayAoZXJyKSB7XG4gICAgICAgIGVyci5jYWxsc2l0ZSA9IGVyci5jYWxsc2l0ZSB8fCB0aGlzLmN1cnJlbnREcml2ZXJUYXNrLmNhbGxzaXRlO1xuICAgICAgICBlcnIuX19zdGFjayAgPSBuZXcgRXJyb3IoKS5zdGFjaztcblxuICAgICAgICB0aGlzLmN1cnJlbnREcml2ZXJUYXNrLnJlamVjdChlcnIpO1xuICAgICAgICB0aGlzLl9yZW1vdmVBbGxOb25TZXJ2aWNlVGFza3MoKTtcbiAgICB9XG5cbiAgICAvLyBQZW5kaW5nIHJlcXVlc3RcbiAgICBfY2xlYXJQZW5kaW5nUmVxdWVzdCAoKSB7XG4gICAgICAgIGlmICh0aGlzLnBlbmRpbmdSZXF1ZXN0KSB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5wZW5kaW5nUmVxdWVzdC5yZXNwb25zZVRpbWVvdXQpO1xuICAgICAgICAgICAgdGhpcy5wZW5kaW5nUmVxdWVzdCA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfcmVzb2x2ZVBlbmRpbmdSZXF1ZXN0IChjb21tYW5kKSB7XG4gICAgICAgIHRoaXMubGFzdERyaXZlclN0YXR1c1Jlc3BvbnNlID0gY29tbWFuZDtcbiAgICAgICAgdGhpcy5wZW5kaW5nUmVxdWVzdC5yZXNvbHZlKGNvbW1hbmQpO1xuICAgICAgICB0aGlzLl9jbGVhclBlbmRpbmdSZXF1ZXN0KCk7XG4gICAgfVxuXG4gICAgLy8gSGFuZGxlIGRyaXZlciByZXF1ZXN0XG4gICAgX2Z1bGZpbGxDdXJyZW50RHJpdmVyVGFzayAoZHJpdmVyU3RhdHVzKSB7XG4gICAgICAgIGlmIChkcml2ZXJTdGF0dXMuZXhlY3V0aW9uRXJyb3IpXG4gICAgICAgICAgICB0aGlzLl9yZWplY3RDdXJyZW50RHJpdmVyVGFzayhkcml2ZXJTdGF0dXMuZXhlY3V0aW9uRXJyb3IpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0aGlzLl9yZXNvbHZlQ3VycmVudERyaXZlclRhc2soZHJpdmVyU3RhdHVzLnJlc3VsdCk7XG4gICAgfVxuXG4gICAgX2hhbmRsZVBhZ2VFcnJvclN0YXR1cyAocGFnZUVycm9yKSB7XG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnREcml2ZXJUYXNrICYmIGlzQ29tbWFuZFJlamVjdGFibGVCeVBhZ2VFcnJvcih0aGlzLmN1cnJlbnREcml2ZXJUYXNrLmNvbW1hbmQpKSB7XG4gICAgICAgICAgICB0aGlzLl9yZWplY3RDdXJyZW50RHJpdmVyVGFzayhwYWdlRXJyb3IpO1xuICAgICAgICAgICAgdGhpcy5wZW5kaW5nUGFnZUVycm9yID0gbnVsbDtcblxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnBlbmRpbmdQYWdlRXJyb3IgPSB0aGlzLnBlbmRpbmdQYWdlRXJyb3IgfHwgcGFnZUVycm9yO1xuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBfaGFuZGxlRHJpdmVyUmVxdWVzdCAoZHJpdmVyU3RhdHVzKSB7XG4gICAgICAgIGNvbnN0IGlzVGVzdERvbmUgICAgICAgICAgICAgICAgID0gdGhpcy5jdXJyZW50RHJpdmVyVGFzayAmJiB0aGlzLmN1cnJlbnREcml2ZXJUYXNrLmNvbW1hbmQudHlwZSA9PT0gQ09NTUFORF9UWVBFLnRlc3REb25lO1xuICAgICAgICBjb25zdCBwYWdlRXJyb3IgICAgICAgICAgICAgICAgICA9IHRoaXMucGVuZGluZ1BhZ2VFcnJvciB8fCBkcml2ZXJTdGF0dXMucGFnZUVycm9yO1xuICAgICAgICBjb25zdCBjdXJyZW50VGFza1JlamVjdGVkQnlFcnJvciA9IHBhZ2VFcnJvciAmJiB0aGlzLl9oYW5kbGVQYWdlRXJyb3JTdGF0dXMocGFnZUVycm9yKTtcblxuICAgICAgICBpZiAodGhpcy5kaXNjb25uZWN0ZWQpXG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKF8sIHJlamVjdCkgPT4gcmVqZWN0KCkpO1xuXG4gICAgICAgIHRoaXMuY29uc29sZU1lc3NhZ2VzLmNvbmNhdChkcml2ZXJTdGF0dXMuY29uc29sZU1lc3NhZ2VzKTtcblxuICAgICAgICBpZiAoIWN1cnJlbnRUYXNrUmVqZWN0ZWRCeUVycm9yICYmIGRyaXZlclN0YXR1cy5pc0NvbW1hbmRSZXN1bHQpIHtcbiAgICAgICAgICAgIGlmIChpc1Rlc3REb25lKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcmVzb2x2ZUN1cnJlbnREcml2ZXJUYXNrKCk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gVEVTVF9ET05FX0NPTkZJUk1BVElPTl9SRVNQT05TRTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5fZnVsZmlsbEN1cnJlbnREcml2ZXJUYXNrKGRyaXZlclN0YXR1cyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5fZ2V0Q3VycmVudERyaXZlclRhc2tDb21tYW5kKCk7XG4gICAgfVxuXG4gICAgX2dldEN1cnJlbnREcml2ZXJUYXNrQ29tbWFuZCAoKSB7XG4gICAgICAgIGlmICghdGhpcy5jdXJyZW50RHJpdmVyVGFzaylcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuXG4gICAgICAgIGNvbnN0IGNvbW1hbmQgPSB0aGlzLmN1cnJlbnREcml2ZXJUYXNrLmNvbW1hbmQ7XG5cbiAgICAgICAgaWYgKGNvbW1hbmQudHlwZSA9PT0gQ09NTUFORF9UWVBFLm5hdmlnYXRlVG8gJiYgY29tbWFuZC5zdGF0ZVNuYXBzaG90KVxuICAgICAgICAgICAgdGhpcy5zZXNzaW9uLnVzZVN0YXRlU25hcHNob3QoSlNPTi5wYXJzZShjb21tYW5kLnN0YXRlU25hcHNob3QpKTtcblxuICAgICAgICByZXR1cm4gY29tbWFuZDtcbiAgICB9XG5cbiAgICAvLyBFeGVjdXRlIGNvbW1hbmRcbiAgICBhc3luYyBfZXhlY3V0ZUV4cHJlc3Npb24gKGNvbW1hbmQpIHtcbiAgICAgICAgY29uc3QgeyByZXN1bHRWYXJpYWJsZU5hbWUsIGlzQXN5bmNFeHByZXNzaW9uIH0gPSBjb21tYW5kO1xuXG4gICAgICAgIGxldCBleHByZXNzaW9uID0gY29tbWFuZC5leHByZXNzaW9uO1xuXG4gICAgICAgIGlmIChpc0FzeW5jRXhwcmVzc2lvbilcbiAgICAgICAgICAgIGV4cHJlc3Npb24gPSBgYXdhaXQgJHtleHByZXNzaW9ufWA7XG5cbiAgICAgICAgaWYgKHJlc3VsdFZhcmlhYmxlTmFtZSlcbiAgICAgICAgICAgIGV4cHJlc3Npb24gPSBgJHtyZXN1bHRWYXJpYWJsZU5hbWV9ID0gJHtleHByZXNzaW9ufSwgJHtyZXN1bHRWYXJpYWJsZU5hbWV9YDtcblxuICAgICAgICBpZiAoaXNBc3luY0V4cHJlc3Npb24pXG4gICAgICAgICAgICBleHByZXNzaW9uID0gYChhc3luYyAoKSA9PiB7IHJldHVybiAke2V4cHJlc3Npb259OyB9KS5hcHBseSh0aGlzKTtgO1xuXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGV4ZWN1dGVKc0V4cHJlc3Npb24oZXhwcmVzc2lvbiwgdGhpcywgeyBza2lwVmlzaWJpbGl0eUNoZWNrOiBmYWxzZSB9KTtcblxuICAgICAgICByZXR1cm4gaXNBc3luY0V4cHJlc3Npb24gPyBhd2FpdCByZXN1bHQgOiByZXN1bHQ7XG4gICAgfVxuXG4gICAgYXN5bmMgX2V4ZWN1dGVBc3NlcnRpb24gKGNvbW1hbmQsIGNhbGxzaXRlKSB7XG4gICAgICAgIGNvbnN0IGFzc2VydGlvblRpbWVvdXQgPSBjb21tYW5kLm9wdGlvbnMudGltZW91dCA9PT0gdm9pZCAwID8gdGhpcy5vcHRzLmFzc2VydGlvblRpbWVvdXQgOiBjb21tYW5kLm9wdGlvbnMudGltZW91dDtcbiAgICAgICAgY29uc3QgZXhlY3V0b3IgICAgICAgICA9IG5ldyBBc3NlcnRpb25FeGVjdXRvcihjb21tYW5kLCBhc3NlcnRpb25UaW1lb3V0LCBjYWxsc2l0ZSk7XG5cbiAgICAgICAgZXhlY3V0b3Iub25jZSgnc3RhcnQtYXNzZXJ0aW9uLXJldHJpZXMnLCB0aW1lb3V0ID0+IHRoaXMuZXhlY3V0ZUNvbW1hbmQobmV3IHNlcnZpY2VDb21tYW5kcy5TaG93QXNzZXJ0aW9uUmV0cmllc1N0YXR1c0NvbW1hbmQodGltZW91dCkpKTtcbiAgICAgICAgZXhlY3V0b3Iub25jZSgnZW5kLWFzc2VydGlvbi1yZXRyaWVzJywgc3VjY2VzcyA9PiB0aGlzLmV4ZWN1dGVDb21tYW5kKG5ldyBzZXJ2aWNlQ29tbWFuZHMuSGlkZUFzc2VydGlvblJldHJpZXNTdGF0dXNDb21tYW5kKHN1Y2Nlc3MpKSk7XG5cbiAgICAgICAgcmV0dXJuIGV4ZWN1dG9yLnJ1bigpO1xuICAgIH1cblxuICAgIF9hZGp1c3RDb25maWd1cmF0aW9uV2l0aENvbW1hbmQgKGNvbW1hbmQpIHtcbiAgICAgICAgaWYgKGNvbW1hbmQudHlwZSA9PT0gQ09NTUFORF9UWVBFLnRlc3REb25lKSB7XG4gICAgICAgICAgICB0aGlzLnRlc3REb25lQ29tbWFuZFF1ZXVlZCA9IHRydWU7XG4gICAgICAgICAgICBkZWJ1Z0xvZ2dlci5oaWRlQnJlYWtwb2ludCh0aGlzLnNlc3Npb24uaWQpO1xuICAgICAgICB9XG5cbiAgICAgICAgZWxzZSBpZiAoY29tbWFuZC50eXBlID09PSBDT01NQU5EX1RZUEUuc2V0TmF0aXZlRGlhbG9nSGFuZGxlcilcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlRGlhbG9nSGFuZGxlciA9IGNvbW1hbmQuZGlhbG9nSGFuZGxlcjtcblxuICAgICAgICBlbHNlIGlmIChjb21tYW5kLnR5cGUgPT09IENPTU1BTkRfVFlQRS5zd2l0Y2hUb0lmcmFtZSlcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlSWZyYW1lU2VsZWN0b3IgPSBjb21tYW5kLnNlbGVjdG9yO1xuXG4gICAgICAgIGVsc2UgaWYgKGNvbW1hbmQudHlwZSA9PT0gQ09NTUFORF9UWVBFLnN3aXRjaFRvTWFpbldpbmRvdylcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlSWZyYW1lU2VsZWN0b3IgPSBudWxsO1xuXG4gICAgICAgIGVsc2UgaWYgKGNvbW1hbmQudHlwZSA9PT0gQ09NTUFORF9UWVBFLnNldFRlc3RTcGVlZClcbiAgICAgICAgICAgIHRoaXMuc3BlZWQgPSBjb21tYW5kLnNwZWVkO1xuXG4gICAgICAgIGVsc2UgaWYgKGNvbW1hbmQudHlwZSA9PT0gQ09NTUFORF9UWVBFLnNldFBhZ2VMb2FkVGltZW91dClcbiAgICAgICAgICAgIHRoaXMucGFnZUxvYWRUaW1lb3V0ID0gY29tbWFuZC5kdXJhdGlvbjtcblxuICAgICAgICBlbHNlIGlmIChjb21tYW5kLnR5cGUgPT09IENPTU1BTkRfVFlQRS5kZWJ1ZylcbiAgICAgICAgICAgIHRoaXMuZGVidWdnaW5nID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBhc3luYyBfYWRqdXN0U2NyZWVuc2hvdENvbW1hbmQgKGNvbW1hbmQpIHtcbiAgICAgICAgY29uc3QgYnJvd3NlcklkICAgICAgICAgICAgICAgICAgICA9IHRoaXMuYnJvd3NlckNvbm5lY3Rpb24uaWQ7XG4gICAgICAgIGNvbnN0IHsgaGFzQ2hyb21lbGVzc1NjcmVlbnNob3RzIH0gPSBhd2FpdCB0aGlzLmJyb3dzZXJDb25uZWN0aW9uLnByb3ZpZGVyLmhhc0N1c3RvbUFjdGlvbkZvckJyb3dzZXIoYnJvd3NlcklkKTtcblxuICAgICAgICBpZiAoIWhhc0Nocm9tZWxlc3NTY3JlZW5zaG90cylcbiAgICAgICAgICAgIGNvbW1hbmQuZ2VuZXJhdGVTY3JlZW5zaG90TWFyaygpO1xuICAgIH1cblxuICAgIGFzeW5jIF9zZXRCcmVha3BvaW50SWZOZWNlc3NhcnkgKGNvbW1hbmQsIGNhbGxzaXRlKSB7XG4gICAgICAgIGlmICghdGhpcy5kaXNhYmxlRGVidWdCcmVha3BvaW50cyAmJiB0aGlzLmRlYnVnZ2luZyAmJiBjYW5TZXREZWJ1Z2dlckJyZWFrcG9pbnRCZWZvcmVDb21tYW5kKGNvbW1hbmQpKVxuICAgICAgICAgICAgYXdhaXQgdGhpcy5fZW5xdWV1ZVNldEJyZWFrcG9pbnRDb21tYW5kKGNhbGxzaXRlKTtcbiAgICB9XG5cbiAgICBhc3luYyBleGVjdXRlQ29tbWFuZCAoY29tbWFuZCwgY2FsbHNpdGUpIHtcbiAgICAgICAgdGhpcy5kZWJ1Z0xvZy5jb21tYW5kKGNvbW1hbmQpO1xuXG4gICAgICAgIGlmICh0aGlzLnBlbmRpbmdQYWdlRXJyb3IgJiYgaXNDb21tYW5kUmVqZWN0YWJsZUJ5UGFnZUVycm9yKGNvbW1hbmQpKVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3JlamVjdENvbW1hbmRXaXRoUGFnZUVycm9yKGNhbGxzaXRlKTtcblxuICAgICAgICBpZiAoaXNFeGVjdXRhYmxlT25DbGllbnRDb21tYW5kKGNvbW1hbmQpKVxuICAgICAgICAgICAgdGhpcy5hZGRpbmdEcml2ZXJUYXNrc0NvdW50Kys7XG5cbiAgICAgICAgdGhpcy5fYWRqdXN0Q29uZmlndXJhdGlvbldpdGhDb21tYW5kKGNvbW1hbmQpO1xuXG4gICAgICAgIGF3YWl0IHRoaXMuX3NldEJyZWFrcG9pbnRJZk5lY2Vzc2FyeShjb21tYW5kLCBjYWxsc2l0ZSk7XG5cbiAgICAgICAgaWYgKGlzU2NyZWVuc2hvdENvbW1hbmQoY29tbWFuZCkpXG4gICAgICAgICAgICBhd2FpdCB0aGlzLl9hZGp1c3RTY3JlZW5zaG90Q29tbWFuZChjb21tYW5kKTtcblxuICAgICAgICBpZiAoaXNCcm93c2VyTWFuaXB1bGF0aW9uQ29tbWFuZChjb21tYW5kKSkge1xuICAgICAgICAgICAgdGhpcy5icm93c2VyTWFuaXB1bGF0aW9uUXVldWUucHVzaChjb21tYW5kKTtcblxuICAgICAgICAgICAgaWYgKGlzUmVzaXplV2luZG93Q29tbWFuZChjb21tYW5kKSAmJiB0aGlzLm9wdHMudmlkZW9QYXRoKVxuICAgICAgICAgICAgICAgIHRoaXMud2FybmluZ0xvZy5hZGRXYXJuaW5nKFdBUk5JTkdfTUVTU0FHRS52aWRlb0Jyb3dzZXJSZXNpemluZywgdGhpcy50ZXN0Lm5hbWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNvbW1hbmQudHlwZSA9PT0gQ09NTUFORF9UWVBFLndhaXQpXG4gICAgICAgICAgICByZXR1cm4gZGVsYXkoY29tbWFuZC50aW1lb3V0KTtcblxuICAgICAgICBpZiAoY29tbWFuZC50eXBlID09PSBDT01NQU5EX1RZUEUuc2V0UGFnZUxvYWRUaW1lb3V0KVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgaWYgKGNvbW1hbmQudHlwZSA9PT0gQ09NTUFORF9UWVBFLmRlYnVnKVxuICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuX2VucXVldWVTZXRCcmVha3BvaW50Q29tbWFuZChjYWxsc2l0ZSk7XG5cbiAgICAgICAgaWYgKGNvbW1hbmQudHlwZSA9PT0gQ09NTUFORF9UWVBFLnVzZVJvbGUpXG4gICAgICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5fdXNlUm9sZShjb21tYW5kLnJvbGUsIGNhbGxzaXRlKTtcblxuICAgICAgICBpZiAoY29tbWFuZC50eXBlID09PSBDT01NQU5EX1RZUEUuYXNzZXJ0aW9uKVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2V4ZWN1dGVBc3NlcnRpb24oY29tbWFuZCwgY2FsbHNpdGUpO1xuXG4gICAgICAgIGlmIChjb21tYW5kLnR5cGUgPT09IENPTU1BTkRfVFlQRS5leGVjdXRlRXhwcmVzc2lvbilcbiAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLl9leGVjdXRlRXhwcmVzc2lvbihjb21tYW5kLCBjYWxsc2l0ZSk7XG5cbiAgICAgICAgaWYgKGNvbW1hbmQudHlwZSA9PT0gQ09NTUFORF9UWVBFLmdldEJyb3dzZXJDb25zb2xlTWVzc2FnZXMpXG4gICAgICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5fZW5xdWV1ZUJyb3dzZXJDb25zb2xlTWVzc2FnZXNDb21tYW5kKGNvbW1hbmQsIGNhbGxzaXRlKTtcblxuICAgICAgICByZXR1cm4gdGhpcy5fZW5xdWV1ZUNvbW1hbmQoY29tbWFuZCwgY2FsbHNpdGUpO1xuICAgIH1cblxuICAgIF9yZWplY3RDb21tYW5kV2l0aFBhZ2VFcnJvciAoY2FsbHNpdGUpIHtcbiAgICAgICAgY29uc3QgZXJyID0gdGhpcy5wZW5kaW5nUGFnZUVycm9yO1xuXG4gICAgICAgIGVyci5jYWxsc2l0ZSAgICAgICAgICA9IGNhbGxzaXRlO1xuICAgICAgICB0aGlzLnBlbmRpbmdQYWdlRXJyb3IgPSBudWxsO1xuICAgICAgICBlcnIuX19zdGFjayAgICAgICAgICAgPSBuZXcgRXJyb3IoKS5zdGFjaztcblxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoZXJyKTtcbiAgICB9XG5cbiAgICAvLyBSb2xlIG1hbmFnZW1lbnRcbiAgICBhc3luYyBnZXRTdGF0ZVNuYXBzaG90ICgpIHtcbiAgICAgICAgY29uc3Qgc3RhdGUgPSB0aGlzLnNlc3Npb24uZ2V0U3RhdGVTbmFwc2hvdCgpO1xuXG4gICAgICAgIHN0YXRlLnN0b3JhZ2VzID0gYXdhaXQgdGhpcy5leGVjdXRlQ29tbWFuZChuZXcgc2VydmljZUNvbW1hbmRzLkJhY2t1cFN0b3JhZ2VzQ29tbWFuZCgpKTtcblxuICAgICAgICByZXR1cm4gc3RhdGU7XG4gICAgfVxuXG4gICAgYXN5bmMgc3dpdGNoVG9DbGVhblJ1biAoKSB7XG4gICAgICAgIHRoaXMuY3R4ICAgICAgICAgICAgID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICAgICAgdGhpcy5maXh0dXJlQ3R4ICAgICAgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgICAgICB0aGlzLmNvbnNvbGVNZXNzYWdlcyA9IG5ldyBCcm93c2VyQ29uc29sZU1lc3NhZ2VzKCk7XG5cbiAgICAgICAgdGhpcy5zZXNzaW9uLnVzZVN0YXRlU25hcHNob3QoU3RhdGVTbmFwc2hvdC5lbXB0eSgpKTtcblxuICAgICAgICBpZiAodGhpcy5hY3RpdmVEaWFsb2dIYW5kbGVyKSB7XG4gICAgICAgICAgICBjb25zdCByZW1vdmVEaWFsb2dIYW5kbGVyQ29tbWFuZCA9IG5ldyBhY3Rpb25Db21tYW5kcy5TZXROYXRpdmVEaWFsb2dIYW5kbGVyQ29tbWFuZCh7IGRpYWxvZ0hhbmRsZXI6IHsgZm46IG51bGwgfSB9KTtcblxuICAgICAgICAgICAgYXdhaXQgdGhpcy5leGVjdXRlQ29tbWFuZChyZW1vdmVEaWFsb2dIYW5kbGVyQ29tbWFuZCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5zcGVlZCAhPT0gdGhpcy5vcHRzLnNwZWVkKSB7XG4gICAgICAgICAgICBjb25zdCBzZXRTcGVlZENvbW1hbmQgPSBuZXcgYWN0aW9uQ29tbWFuZHMuU2V0VGVzdFNwZWVkQ29tbWFuZCh7IHNwZWVkOiB0aGlzLm9wdHMuc3BlZWQgfSk7XG5cbiAgICAgICAgICAgIGF3YWl0IHRoaXMuZXhlY3V0ZUNvbW1hbmQoc2V0U3BlZWRDb21tYW5kKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnBhZ2VMb2FkVGltZW91dCAhPT0gdGhpcy5vcHRzLnBhZ2VMb2FkVGltZW91dCkge1xuICAgICAgICAgICAgY29uc3Qgc2V0UGFnZUxvYWRUaW1lb3V0Q29tbWFuZCA9IG5ldyBhY3Rpb25Db21tYW5kcy5TZXRQYWdlTG9hZFRpbWVvdXRDb21tYW5kKHsgZHVyYXRpb246IHRoaXMub3B0cy5wYWdlTG9hZFRpbWVvdXQgfSk7XG5cbiAgICAgICAgICAgIGF3YWl0IHRoaXMuZXhlY3V0ZUNvbW1hbmQoc2V0UGFnZUxvYWRUaW1lb3V0Q29tbWFuZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhc3luYyBfZ2V0U3RhdGVTbmFwc2hvdEZyb21Sb2xlIChyb2xlKSB7XG4gICAgICAgIGNvbnN0IHByZXZQaGFzZSA9IHRoaXMucGhhc2U7XG5cbiAgICAgICAgdGhpcy5waGFzZSA9IFBIQVNFLmluUm9sZUluaXRpYWxpemVyO1xuXG4gICAgICAgIGlmIChyb2xlLnBoYXNlID09PSBST0xFX1BIQVNFLnVuaW5pdGlhbGl6ZWQpXG4gICAgICAgICAgICBhd2FpdCByb2xlLmluaXRpYWxpemUodGhpcyk7XG5cbiAgICAgICAgZWxzZSBpZiAocm9sZS5waGFzZSA9PT0gUk9MRV9QSEFTRS5wZW5kaW5nSW5pdGlhbGl6YXRpb24pXG4gICAgICAgICAgICBhd2FpdCBwcm9taXNpZnlFdmVudChyb2xlLCAnaW5pdGlhbGl6ZWQnKTtcblxuICAgICAgICBpZiAocm9sZS5pbml0RXJyKVxuICAgICAgICAgICAgdGhyb3cgcm9sZS5pbml0RXJyO1xuXG4gICAgICAgIHRoaXMucGhhc2UgPSBwcmV2UGhhc2U7XG5cbiAgICAgICAgcmV0dXJuIHJvbGUuc3RhdGVTbmFwc2hvdDtcbiAgICB9XG5cbiAgICBhc3luYyBfdXNlUm9sZSAocm9sZSwgY2FsbHNpdGUpIHtcbiAgICAgICAgaWYgKHRoaXMucGhhc2UgPT09IFBIQVNFLmluUm9sZUluaXRpYWxpemVyKVxuICAgICAgICAgICAgdGhyb3cgbmV3IFJvbGVTd2l0Y2hJblJvbGVJbml0aWFsaXplckVycm9yKGNhbGxzaXRlKTtcblxuICAgICAgICB0aGlzLmRpc2FibGVEZWJ1Z0JyZWFrcG9pbnRzID0gdHJ1ZTtcblxuICAgICAgICBjb25zdCBib29rbWFyayA9IG5ldyBUZXN0UnVuQm9va21hcmsodGhpcywgcm9sZSk7XG5cbiAgICAgICAgYXdhaXQgYm9va21hcmsuaW5pdCgpO1xuXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRSb2xlSWQpXG4gICAgICAgICAgICB0aGlzLnVzZWRSb2xlU3RhdGVzW3RoaXMuY3VycmVudFJvbGVJZF0gPSBhd2FpdCB0aGlzLmdldFN0YXRlU25hcHNob3QoKTtcblxuICAgICAgICBjb25zdCBzdGF0ZVNuYXBzaG90ID0gdGhpcy51c2VkUm9sZVN0YXRlc1tyb2xlLmlkXSB8fCBhd2FpdCB0aGlzLl9nZXRTdGF0ZVNuYXBzaG90RnJvbVJvbGUocm9sZSk7XG5cbiAgICAgICAgdGhpcy5zZXNzaW9uLnVzZVN0YXRlU25hcHNob3Qoc3RhdGVTbmFwc2hvdCk7XG5cbiAgICAgICAgdGhpcy5jdXJyZW50Um9sZUlkID0gcm9sZS5pZDtcblxuICAgICAgICBhd2FpdCBib29rbWFyay5yZXN0b3JlKGNhbGxzaXRlLCBzdGF0ZVNuYXBzaG90KTtcblxuICAgICAgICB0aGlzLmRpc2FibGVEZWJ1Z0JyZWFrcG9pbnRzID0gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gR2V0IGN1cnJlbnQgVVJMXG4gICAgYXN5bmMgZ2V0Q3VycmVudFVybCAoKSB7XG4gICAgICAgIGNvbnN0IGJ1aWxkZXIgPSBuZXcgQ2xpZW50RnVuY3Rpb25CdWlsZGVyKCgpID0+IHtcbiAgICAgICAgICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLXVuZGVmICovXG4gICAgICAgICAgICByZXR1cm4gd2luZG93LmxvY2F0aW9uLmhyZWY7XG4gICAgICAgICAgICAvKiBlc2xpbnQtZW5hYmxlIG5vLXVuZGVmICovXG4gICAgICAgIH0sIHsgYm91bmRUZXN0UnVuOiB0aGlzIH0pO1xuXG4gICAgICAgIGNvbnN0IGdldExvY2F0aW9uID0gYnVpbGRlci5nZXRGdW5jdGlvbigpO1xuXG4gICAgICAgIHJldHVybiBhd2FpdCBnZXRMb2NhdGlvbigpO1xuICAgIH1cblxuICAgIF9kaXNjb25uZWN0IChlcnIpIHtcbiAgICAgICAgdGhpcy5kaXNjb25uZWN0ZWQgPSB0cnVlO1xuXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnREcml2ZXJUYXNrKVxuICAgICAgICAgICAgdGhpcy5fcmVqZWN0Q3VycmVudERyaXZlclRhc2soZXJyKTtcblxuICAgICAgICB0aGlzLmVtaXQoJ2Rpc2Nvbm5lY3RlZCcsIGVycik7XG5cbiAgICAgICAgZGVsZXRlIHRlc3RSdW5UcmFja2VyLmFjdGl2ZVRlc3RSdW5zW3RoaXMuc2Vzc2lvbi5pZF07XG4gICAgfVxufVxuXG4vLyBTZXJ2aWNlIG1lc3NhZ2UgaGFuZGxlcnNcbmNvbnN0IFNlcnZpY2VNZXNzYWdlcyA9IFRlc3RSdW4ucHJvdG90eXBlO1xuXG4vLyBOT1RFOiB0aGlzIGZ1bmN0aW9uIGlzIHRpbWUtY3JpdGljYWwgYW5kIG11c3QgcmV0dXJuIEFTQVAgdG8gYXZvaWQgY2xpZW50IGRpc2Nvbm5lY3Rpb25cblNlcnZpY2VNZXNzYWdlc1tDTElFTlRfTUVTU0FHRVMucmVhZHldID0gZnVuY3Rpb24gKG1zZykge1xuICAgIHRoaXMuZGVidWdMb2cuZHJpdmVyTWVzc2FnZShtc2cpO1xuXG4gICAgdGhpcy5lbWl0KCdjb25uZWN0ZWQnKTtcblxuICAgIHRoaXMuX2NsZWFyUGVuZGluZ1JlcXVlc3QoKTtcblxuICAgIC8vIE5PVEU6IHRoZSBkcml2ZXIgc2VuZHMgdGhlIHN0YXR1cyBmb3IgdGhlIHNlY29uZCB0aW1lIGlmIGl0IGRpZG4ndCBnZXQgYSByZXNwb25zZSBhdCB0aGVcbiAgICAvLyBmaXJzdCB0cnkuIFRoaXMgaXMgcG9zc2libGUgd2hlbiB0aGUgcGFnZSB3YXMgdW5sb2FkZWQgYWZ0ZXIgdGhlIGRyaXZlciBzZW50IHRoZSBzdGF0dXMuXG4gICAgaWYgKG1zZy5zdGF0dXMuaWQgPT09IHRoaXMubGFzdERyaXZlclN0YXR1c0lkKVxuICAgICAgICByZXR1cm4gdGhpcy5sYXN0RHJpdmVyU3RhdHVzUmVzcG9uc2U7XG5cbiAgICB0aGlzLmxhc3REcml2ZXJTdGF0dXNJZCAgICAgICA9IG1zZy5zdGF0dXMuaWQ7XG4gICAgdGhpcy5sYXN0RHJpdmVyU3RhdHVzUmVzcG9uc2UgPSB0aGlzLl9oYW5kbGVEcml2ZXJSZXF1ZXN0KG1zZy5zdGF0dXMpO1xuXG4gICAgaWYgKHRoaXMubGFzdERyaXZlclN0YXR1c1Jlc3BvbnNlKVxuICAgICAgICByZXR1cm4gdGhpcy5sYXN0RHJpdmVyU3RhdHVzUmVzcG9uc2U7XG5cbiAgICAvLyBOT1RFOiB3ZSBzZW5kIGFuIGVtcHR5IHJlc3BvbnNlIGFmdGVyIHRoZSBNQVhfUkVTUE9OU0VfREVMQVkgdGltZW91dCBpcyBleGNlZWRlZCB0byBrZWVwIGNvbm5lY3Rpb25cbiAgICAvLyB3aXRoIHRoZSBjbGllbnQgYW5kIHByZXZlbnQgdGhlIHJlc3BvbnNlIHRpbWVvdXQgZXhjZXB0aW9uIG9uIHRoZSBjbGllbnQgc2lkZVxuICAgIGNvbnN0IHJlc3BvbnNlVGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4gdGhpcy5fcmVzb2x2ZVBlbmRpbmdSZXF1ZXN0KG51bGwpLCBNQVhfUkVTUE9OU0VfREVMQVkpO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgdGhpcy5wZW5kaW5nUmVxdWVzdCA9IHsgcmVzb2x2ZSwgcmVqZWN0LCByZXNwb25zZVRpbWVvdXQgfTtcbiAgICB9KTtcbn07XG5cblNlcnZpY2VNZXNzYWdlc1tDTElFTlRfTUVTU0FHRVMucmVhZHlGb3JCcm93c2VyTWFuaXB1bGF0aW9uXSA9IGFzeW5jIGZ1bmN0aW9uIChtc2cpIHtcbiAgICB0aGlzLmRlYnVnTG9nLmRyaXZlck1lc3NhZ2UobXNnKTtcblxuICAgIGxldCByZXN1bHQgPSBudWxsO1xuICAgIGxldCBlcnJvciAgPSBudWxsO1xuXG4gICAgdHJ5IHtcbiAgICAgICAgcmVzdWx0ID0gYXdhaXQgdGhpcy5icm93c2VyTWFuaXB1bGF0aW9uUXVldWUuZXhlY3V0ZVBlbmRpbmdNYW5pcHVsYXRpb24obXNnKTtcbiAgICB9XG4gICAgY2F0Y2ggKGVycikge1xuICAgICAgICBlcnJvciA9IGVycjtcbiAgICB9XG5cbiAgICByZXR1cm4geyByZXN1bHQsIGVycm9yIH07XG59O1xuXG5TZXJ2aWNlTWVzc2FnZXNbQ0xJRU5UX01FU1NBR0VTLndhaXRGb3JGaWxlRG93bmxvYWRdID0gZnVuY3Rpb24gKG1zZykge1xuICAgIHRoaXMuZGVidWdMb2cuZHJpdmVyTWVzc2FnZShtc2cpO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgICBpZiAodGhpcy5maWxlRG93bmxvYWRpbmdIYW5kbGVkKSB7XG4gICAgICAgICAgICB0aGlzLmZpbGVEb3dubG9hZGluZ0hhbmRsZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhpcy5yZXNvbHZlV2FpdEZvckZpbGVEb3dubG9hZGluZ1Byb21pc2UgPSByZXNvbHZlO1xuICAgIH0pO1xufTtcbiJdfQ==
