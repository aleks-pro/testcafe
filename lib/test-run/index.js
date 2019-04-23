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
        err.isRejectedDriverTask = true;

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

        this._rejectCurrentDriverTask(err);

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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90ZXN0LXJ1bi9pbmRleC5qcyJdLCJuYW1lcyI6WyJsYXp5UmVxdWlyZSIsInJlcXVpcmUiLCJTZXNzaW9uQ29udHJvbGxlciIsIkNsaWVudEZ1bmN0aW9uQnVpbGRlciIsImV4ZWN1dGVKc0V4cHJlc3Npb24iLCJCcm93c2VyTWFuaXB1bGF0aW9uUXVldWUiLCJUZXN0UnVuQm9va21hcmsiLCJBc3NlcnRpb25FeGVjdXRvciIsImFjdGlvbkNvbW1hbmRzIiwiYnJvd3Nlck1hbmlwdWxhdGlvbkNvbW1hbmRzIiwic2VydmljZUNvbW1hbmRzIiwiVEVTVF9SVU5fVEVNUExBVEUiLCJJRlJBTUVfVEVTVF9SVU5fVEVNUExBVEUiLCJURVNUX0RPTkVfQ09ORklSTUFUSU9OX1JFU1BPTlNFIiwiTUFYX1JFU1BPTlNFX0RFTEFZIiwiQUxMX0RSSVZFUl9UQVNLU19BRERFRF9UT19RVUVVRV9FVkVOVCIsIlRlc3RSdW4iLCJjb25zdHJ1Y3RvciIsInRlc3QiLCJicm93c2VyQ29ubmVjdGlvbiIsInNjcmVlbnNob3RDYXB0dXJlciIsImdsb2JhbFdhcm5pbmdMb2ciLCJvcHRzIiwid2FybmluZ0xvZyIsInBoYXNlIiwiaW5pdGlhbCIsImRyaXZlclRhc2tRdWV1ZSIsInRlc3REb25lQ29tbWFuZFF1ZXVlZCIsImFjdGl2ZURpYWxvZ0hhbmRsZXIiLCJhY3RpdmVJZnJhbWVTZWxlY3RvciIsInNwZWVkIiwicGFnZUxvYWRUaW1lb3V0IiwiZGlzYWJsZVBhZ2VSZWxvYWRzIiwic2Vzc2lvbiIsImdldFNlc3Npb24iLCJjb25zb2xlTWVzc2FnZXMiLCJwZW5kaW5nUmVxdWVzdCIsInBlbmRpbmdQYWdlRXJyb3IiLCJjb250cm9sbGVyIiwiY3R4IiwiZml4dHVyZUN0eCIsImN1cnJlbnRSb2xlSWQiLCJ1c2VkUm9sZVN0YXRlcyIsImVycnMiLCJsYXN0RHJpdmVyU3RhdHVzSWQiLCJsYXN0RHJpdmVyU3RhdHVzUmVzcG9uc2UiLCJmaWxlRG93bmxvYWRpbmdIYW5kbGVkIiwicmVzb2x2ZVdhaXRGb3JGaWxlRG93bmxvYWRpbmdQcm9taXNlIiwiYWRkaW5nRHJpdmVyVGFza3NDb3VudCIsImRlYnVnZ2luZyIsImRlYnVnTW9kZSIsImRlYnVnT25GYWlsIiwiZGlzYWJsZURlYnVnQnJlYWtwb2ludHMiLCJkZWJ1Z1JlcG9ydGVyUGx1Z2luSG9zdCIsIm5vQ29sb3JzIiwiYnJvd3Nlck1hbmlwdWxhdGlvblF1ZXVlIiwiZGVidWdMb2ciLCJ1c2VyQWdlbnQiLCJxdWFyYW50aW5lIiwiaW5qZWN0YWJsZSIsInNjcmlwdHMiLCJwdXNoIiwic3R5bGVzIiwicmVxdWVzdEhvb2tzIiwiX2luaXRSZXF1ZXN0SG9va3MiLCJpZCIsImFkZFF1YXJhbnRpbmVJbmZvIiwiYWRkUmVxdWVzdEhvb2siLCJob29rIiwiaW5kZXhPZiIsIl9pbml0UmVxdWVzdEhvb2siLCJyZW1vdmVSZXF1ZXN0SG9vayIsIl9kaXNwb3NlUmVxdWVzdEhvb2siLCJfaW5zdGFudGlhdGVSZXF1ZXN0RmlsdGVyUnVsZXMiLCJfaW5zdGFudGlhdGVkUmVxdWVzdEZpbHRlclJ1bGVzIiwiZm9yRWFjaCIsInJ1bGUiLCJhZGRSZXF1ZXN0RXZlbnRMaXN0ZW5lcnMiLCJvblJlcXVlc3QiLCJiaW5kIiwib25Db25maWd1cmVSZXNwb25zZSIsIl9vbkNvbmZpZ3VyZVJlc3BvbnNlIiwib25SZXNwb25zZSIsInJlbW92ZVJlcXVlc3RFdmVudExpc3RlbmVycyIsIl9nZXRQYXlsb2FkU2NyaXB0IiwicmVuZGVyIiwidGVzdFJ1bklkIiwiYnJvd3NlcklkIiwiYnJvd3NlckhlYXJ0YmVhdFJlbGF0aXZlVXJsIiwiaGVhcnRiZWF0UmVsYXRpdmVVcmwiLCJicm93c2VyU3RhdHVzUmVsYXRpdmVVcmwiLCJzdGF0dXNSZWxhdGl2ZVVybCIsImJyb3dzZXJTdGF0dXNEb25lUmVsYXRpdmVVcmwiLCJzdGF0dXNEb25lUmVsYXRpdmVVcmwiLCJ0ZXN0TmFtZSIsIm5hbWUiLCJmaXh0dXJlTmFtZSIsImZpeHR1cmUiLCJzZWxlY3RvclRpbWVvdXQiLCJza2lwSnNFcnJvcnMiLCJyZXRyeVRlc3RQYWdlcyIsImRpYWxvZ0hhbmRsZXIiLCJfZ2V0SWZyYW1lUGF5bG9hZFNjcmlwdCIsImdldEF1dGhDcmVkZW50aWFscyIsImF1dGhDcmVkZW50aWFscyIsImhhbmRsZUZpbGVEb3dubG9hZCIsImhhbmRsZVBhZ2VFcnJvciIsImVyciIsInJlcSIsImhlYWRlcnMiLCJjbG9zZVdpdGhFcnJvciIsInRvU3RyaW5nIiwicmVxT3B0cyIsInVybCIsInJlZGlyZWN0IiwidG9Qcm94eVVybCIsIl9leGVjdXRlVGVzdEZuIiwiZm4iLCJzY3JlZW5zaG90UGF0aCIsInRha2VTY3JlZW5zaG90c09uRmFpbHMiLCJleGVjdXRlQ29tbWFuZCIsIlRha2VTY3JlZW5zaG90T25GYWlsQ29tbWFuZCIsImFkZEVycm9yIiwiX2FkZFBlbmRpbmdQYWdlRXJyb3JJZkFueSIsIl9ydW5CZWZvcmVIb29rIiwiYmVmb3JlRm4iLCJpblRlc3RCZWZvcmVIb29rIiwiYmVmb3JlRWFjaEZuIiwiaW5GaXh0dXJlQmVmb3JlRWFjaEhvb2siLCJfcnVuQWZ0ZXJIb29rIiwiYWZ0ZXJGbiIsImluVGVzdEFmdGVySG9vayIsImFmdGVyRWFjaEZuIiwiaW5GaXh0dXJlQWZ0ZXJFYWNoSG9vayIsInN0YXJ0IiwiYWN0aXZlVGVzdFJ1bnMiLCJlbWl0Iiwib25EaXNjb25uZWN0ZWQiLCJfZGlzY29ubmVjdCIsIm9uY2UiLCJpblRlc3QiLCJkaXNjb25uZWN0ZWQiLCJyZW1vdmVMaXN0ZW5lciIsImxlbmd0aCIsIl9lbnF1ZXVlU2V0QnJlYWtwb2ludENvbW1hbmQiLCJmb3JtYXRFcnJvciIsIlRlc3REb25lQ29tbWFuZCIsIl9jcmVhdGVFcnJvckFkYXB0ZXIiLCJ0ZXN0UnVuUGhhc2UiLCJlcnJMaXN0IiwiaXRlbXMiLCJpdGVtIiwiYWRhcHRlciIsIl9lbnF1ZXVlQ29tbWFuZCIsImNvbW1hbmQiLCJjYWxsc2l0ZSIsIl9yZXNvbHZlUGVuZGluZ1JlcXVlc3QiLCJyZXNvbHZlIiwicmVqZWN0IiwiZHJpdmVyVGFza1F1ZXVlTGVuZ3RoIiwiX2VucXVldWVCcm93c2VyQ29uc29sZU1lc3NhZ2VzQ29tbWFuZCIsImdldENvcHkiLCJlcnJvciIsImlzSGVhZGxlc3NCcm93c2VyIiwiYWRkV2FybmluZyIsImRlYnVnSW5IZWFkbGVzc0Vycm9yIiwic2hvd0JyZWFrcG9pbnQiLCJTZXRCcmVha3BvaW50Q29tbWFuZCIsIl9yZW1vdmVBbGxOb25TZXJ2aWNlVGFza3MiLCJmaWx0ZXIiLCJkcml2ZXJUYXNrIiwicmVtb3ZlQWxsTm9uU2VydmljZU1hbmlwdWxhdGlvbnMiLCJjdXJyZW50RHJpdmVyVGFzayIsIl9yZXNvbHZlQ3VycmVudERyaXZlclRhc2siLCJyZXN1bHQiLCJzaGlmdCIsIl9yZWplY3RDdXJyZW50RHJpdmVyVGFzayIsImlzUmVqZWN0ZWREcml2ZXJUYXNrIiwiX2NsZWFyUGVuZGluZ1JlcXVlc3QiLCJjbGVhclRpbWVvdXQiLCJyZXNwb25zZVRpbWVvdXQiLCJfZnVsZmlsbEN1cnJlbnREcml2ZXJUYXNrIiwiZHJpdmVyU3RhdHVzIiwiZXhlY3V0aW9uRXJyb3IiLCJfaGFuZGxlUGFnZUVycm9yU3RhdHVzIiwicGFnZUVycm9yIiwiX2hhbmRsZURyaXZlclJlcXVlc3QiLCJpc1Rlc3REb25lIiwidHlwZSIsInRlc3REb25lIiwiY3VycmVudFRhc2tSZWplY3RlZEJ5RXJyb3IiLCJfIiwiY29uY2F0IiwiaXNDb21tYW5kUmVzdWx0IiwiX2dldEN1cnJlbnREcml2ZXJUYXNrQ29tbWFuZCIsIm5hdmlnYXRlVG8iLCJzdGF0ZVNuYXBzaG90IiwidXNlU3RhdGVTbmFwc2hvdCIsIkpTT04iLCJwYXJzZSIsIl9leGVjdXRlRXhwcmVzc2lvbiIsInJlc3VsdFZhcmlhYmxlTmFtZSIsImlzQXN5bmNFeHByZXNzaW9uIiwiZXhwcmVzc2lvbiIsInNraXBWaXNpYmlsaXR5Q2hlY2siLCJfZXhlY3V0ZUFzc2VydGlvbiIsImFzc2VydGlvblRpbWVvdXQiLCJvcHRpb25zIiwidGltZW91dCIsImV4ZWN1dG9yIiwiU2hvd0Fzc2VydGlvblJldHJpZXNTdGF0dXNDb21tYW5kIiwiSGlkZUFzc2VydGlvblJldHJpZXNTdGF0dXNDb21tYW5kIiwic3VjY2VzcyIsInJ1biIsIl9hZGp1c3RDb25maWd1cmF0aW9uV2l0aENvbW1hbmQiLCJoaWRlQnJlYWtwb2ludCIsInNldE5hdGl2ZURpYWxvZ0hhbmRsZXIiLCJzd2l0Y2hUb0lmcmFtZSIsInNlbGVjdG9yIiwic3dpdGNoVG9NYWluV2luZG93Iiwic2V0VGVzdFNwZWVkIiwic2V0UGFnZUxvYWRUaW1lb3V0IiwiZHVyYXRpb24iLCJkZWJ1ZyIsIl9hZGp1c3RTY3JlZW5zaG90Q29tbWFuZCIsInByb3ZpZGVyIiwiaGFzQ3VzdG9tQWN0aW9uRm9yQnJvd3NlciIsImhhc0Nocm9tZWxlc3NTY3JlZW5zaG90cyIsImdlbmVyYXRlU2NyZWVuc2hvdE1hcmsiLCJfc2V0QnJlYWtwb2ludElmTmVjZXNzYXJ5IiwiX3JlamVjdENvbW1hbmRXaXRoUGFnZUVycm9yIiwidmlkZW9QYXRoIiwidmlkZW9Ccm93c2VyUmVzaXppbmciLCJ3YWl0IiwidXNlUm9sZSIsIl91c2VSb2xlIiwicm9sZSIsImFzc2VydGlvbiIsImV4ZWN1dGVFeHByZXNzaW9uIiwiZ2V0QnJvd3NlckNvbnNvbGVNZXNzYWdlcyIsImdldFN0YXRlU25hcHNob3QiLCJzdGF0ZSIsInN0b3JhZ2VzIiwiQmFja3VwU3RvcmFnZXNDb21tYW5kIiwic3dpdGNoVG9DbGVhblJ1biIsImVtcHR5IiwicmVtb3ZlRGlhbG9nSGFuZGxlckNvbW1hbmQiLCJTZXROYXRpdmVEaWFsb2dIYW5kbGVyQ29tbWFuZCIsInNldFNwZWVkQ29tbWFuZCIsIlNldFRlc3RTcGVlZENvbW1hbmQiLCJzZXRQYWdlTG9hZFRpbWVvdXRDb21tYW5kIiwiU2V0UGFnZUxvYWRUaW1lb3V0Q29tbWFuZCIsIl9nZXRTdGF0ZVNuYXBzaG90RnJvbVJvbGUiLCJwcmV2UGhhc2UiLCJpblJvbGVJbml0aWFsaXplciIsInVuaW5pdGlhbGl6ZWQiLCJpbml0aWFsaXplIiwicGVuZGluZ0luaXRpYWxpemF0aW9uIiwiaW5pdEVyciIsImJvb2ttYXJrIiwiaW5pdCIsInJlc3RvcmUiLCJnZXRDdXJyZW50VXJsIiwiYnVpbGRlciIsIndpbmRvdyIsImxvY2F0aW9uIiwiaHJlZiIsImJvdW5kVGVzdFJ1biIsImdldExvY2F0aW9uIiwiZ2V0RnVuY3Rpb24iLCJTZXJ2aWNlTWVzc2FnZXMiLCJwcm90b3R5cGUiLCJyZWFkeSIsIm1zZyIsImRyaXZlck1lc3NhZ2UiLCJzdGF0dXMiLCJzZXRUaW1lb3V0IiwicmVhZHlGb3JCcm93c2VyTWFuaXB1bGF0aW9uIiwiZXhlY3V0ZVBlbmRpbmdNYW5pcHVsYXRpb24iLCJ3YWl0Rm9yRmlsZURvd25sb2FkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOztBQUNBOztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7O0FBRUE7Ozs7QUFVQSxNQUFNQSxjQUE4QkMsUUFBUSxhQUFSLEVBQXVCQSxPQUF2QixDQUFwQztBQUNBLE1BQU1DLG9CQUE4QkYsWUFBWSxzQkFBWixDQUFwQztBQUNBLE1BQU1HLHdCQUE4QkgsWUFBWSw2Q0FBWixDQUFwQztBQUNBLE1BQU1JLHNCQUE4QkosWUFBWSx5QkFBWixDQUFwQztBQUNBLE1BQU1LLDJCQUE4QkwsWUFBWSw4QkFBWixDQUFwQztBQUNBLE1BQU1NLGtCQUE4Qk4sWUFBWSxZQUFaLENBQXBDO0FBQ0EsTUFBTU8sb0JBQThCUCxZQUFZLHdCQUFaLENBQXBDO0FBQ0EsTUFBTVEsaUJBQThCUixZQUFZLG9CQUFaLENBQXBDO0FBQ0EsTUFBTVMsOEJBQThCVCxZQUFZ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InNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHB1bGwgYXMgcmVtb3ZlIH0gZnJvbSAnbG9kYXNoJztcbmltcG9ydCB7IHJlYWRTeW5jIGFzIHJlYWQgfSBmcm9tICdyZWFkLWZpbGUtcmVsYXRpdmUnO1xuaW1wb3J0IHByb21pc2lmeUV2ZW50IGZyb20gJ3Byb21pc2lmeS1ldmVudCc7XG5pbXBvcnQgUHJvbWlzZSBmcm9tICdwaW5raWUnO1xuaW1wb3J0IE11c3RhY2hlIGZyb20gJ211c3RhY2hlJztcbmltcG9ydCBBc3luY0V2ZW50RW1pdHRlciBmcm9tICcuLi91dGlscy9hc3luYy1ldmVudC1lbWl0dGVyJztcbmltcG9ydCBkZWJ1Z0xvZ2dlciBmcm9tICcuLi9ub3RpZmljYXRpb25zL2RlYnVnLWxvZ2dlcic7XG5pbXBvcnQgVGVzdFJ1bkRlYnVnTG9nIGZyb20gJy4vZGVidWctbG9nJztcbmltcG9ydCBUZXN0UnVuRXJyb3JGb3JtYXR0YWJsZUFkYXB0ZXIgZnJvbSAnLi4vZXJyb3JzL3Rlc3QtcnVuL2Zvcm1hdHRhYmxlLWFkYXB0ZXInO1xuaW1wb3J0IFRlc3RDYWZlRXJyb3JMaXN0IGZyb20gJy4uL2Vycm9ycy9lcnJvci1saXN0JztcbmltcG9ydCB7IFBhZ2VMb2FkRXJyb3IsIFJvbGVTd2l0Y2hJblJvbGVJbml0aWFsaXplckVycm9yIH0gZnJvbSAnLi4vZXJyb3JzL3Rlc3QtcnVuLyc7XG5pbXBvcnQgUEhBU0UgZnJvbSAnLi9waGFzZSc7XG5pbXBvcnQgQ0xJRU5UX01FU1NBR0VTIGZyb20gJy4vY2xpZW50LW1lc3NhZ2VzJztcbmltcG9ydCBDT01NQU5EX1RZUEUgZnJvbSAnLi9jb21tYW5kcy90eXBlJztcbmltcG9ydCBkZWxheSBmcm9tICcuLi91dGlscy9kZWxheSc7XG5pbXBvcnQgdGVzdFJ1bk1hcmtlciBmcm9tICcuL21hcmtlci1zeW1ib2wnO1xuaW1wb3J0IHRlc3RSdW5UcmFja2VyIGZyb20gJy4uL2FwaS90ZXN0LXJ1bi10cmFja2VyJztcbmltcG9ydCBST0xFX1BIQVNFIGZyb20gJy4uL3JvbGUvcGhhc2UnO1xuaW1wb3J0IFJlcG9ydGVyUGx1Z2luSG9zdCBmcm9tICcuLi9yZXBvcnRlci9wbHVnaW4taG9zdCc7XG5pbXBvcnQgQnJvd3NlckNvbnNvbGVNZXNzYWdlcyBmcm9tICcuL2Jyb3dzZXItY29uc29sZS1tZXNzYWdlcyc7XG5pbXBvcnQgeyBVTlNUQUJMRV9ORVRXT1JLX01PREVfSEVBREVSIH0gZnJvbSAnLi4vYnJvd3Nlci9jb25uZWN0aW9uL3Vuc3RhYmxlLW5ldHdvcmstbW9kZSc7XG5pbXBvcnQgV2FybmluZ0xvZyBmcm9tICcuLi9ub3RpZmljYXRpb25zL3dhcm5pbmctbG9nJztcbmltcG9ydCBXQVJOSU5HX01FU1NBR0UgZnJvbSAnLi4vbm90aWZpY2F0aW9ucy93YXJuaW5nLW1lc3NhZ2UnO1xuaW1wb3J0IHsgU3RhdGVTbmFwc2hvdCB9IGZyb20gJ3Rlc3RjYWZlLWhhbW1lcmhlYWQnO1xuXG5pbXBvcnQge1xuICAgIGlzQ29tbWFuZFJlamVjdGFibGVCeVBhZ2VFcnJvcixcbiAgICBpc0Jyb3dzZXJNYW5pcHVsYXRpb25Db21tYW5kLFxuICAgIGlzU2NyZWVuc2hvdENvbW1hbmQsXG4gICAgaXNTZXJ2aWNlQ29tbWFuZCxcbiAgICBjYW5TZXREZWJ1Z2dlckJyZWFrcG9pbnRCZWZvcmVDb21tYW5kLFxuICAgIGlzRXhlY3V0YWJsZU9uQ2xpZW50Q29tbWFuZCxcbiAgICBpc1Jlc2l6ZVdpbmRvd0NvbW1hbmRcbn0gZnJvbSAnLi9jb21tYW5kcy91dGlscyc7XG5cbmNvbnN0IGxhenlSZXF1aXJlICAgICAgICAgICAgICAgICA9IHJlcXVpcmUoJ2ltcG9ydC1sYXp5JykocmVxdWlyZSk7XG5jb25zdCBTZXNzaW9uQ29udHJvbGxlciAgICAgICAgICAgPSBsYXp5UmVxdWlyZSgnLi9zZXNzaW9uLWNvbnRyb2xsZXInKTtcbmNvbnN0IENsaWVudEZ1bmN0aW9uQnVpbGRlciAgICAgICA9IGxhenlSZXF1aXJlKCcuLi9jbGllbnQtZnVuY3Rpb25zL2NsaWVudC1mdW5jdGlvbi1idWlsZGVyJyk7XG5jb25zdCBleGVjdXRlSnNFeHByZXNzaW9uICAgICAgICAgPSBsYXp5UmVxdWlyZSgnLi9leGVjdXRlLWpzLWV4cHJlc3Npb24nKTtcbmNvbnN0IEJyb3dzZXJNYW5pcHVsYXRpb25RdWV1ZSAgICA9IGxhenlSZXF1aXJlKCcuL2Jyb3dzZXItbWFuaXB1bGF0aW9uLXF1ZXVlJyk7XG5jb25zdCBUZXN0UnVuQm9va21hcmsgICAgICAgICAgICAgPSBsYXp5UmVxdWlyZSgnLi9ib29rbWFyaycpO1xuY29uc3QgQXNzZXJ0aW9uRXhlY3V0b3IgICAgICAgICAgID0gbGF6eVJlcXVpcmUoJy4uL2Fzc2VydGlvbnMvZXhlY3V0b3InKTtcbmNvbnN0IGFjdGlvbkNvbW1hbmRzICAgICAgICAgICAgICA9IGxhenlSZXF1aXJlKCcuL2NvbW1hbmRzL2FjdGlvbnMnKTtcbmNvbnN0IGJyb3dzZXJNYW5pcHVsYXRpb25Db21tYW5kcyA9IGxhenlSZXF1aXJlKCcuL2NvbW1hbmRzL2Jyb3dzZXItbWFuaXB1bGF0aW9uJyk7XG5jb25zdCBzZXJ2aWNlQ29tbWFuZHMgICAgICAgICAgICAgPSBsYXp5UmVxdWlyZSgnLi9jb21tYW5kcy9zZXJ2aWNlJyk7XG5cblxuY29uc3QgVEVTVF9SVU5fVEVNUExBVEUgICAgICAgICAgICAgICA9IHJlYWQoJy4uL2NsaWVudC90ZXN0LXJ1bi9pbmRleC5qcy5tdXN0YWNoZScpO1xuY29uc3QgSUZSQU1FX1RFU1RfUlVOX1RFTVBMQVRFICAgICAgICA9IHJlYWQoJy4uL2NsaWVudC90ZXN0LXJ1bi9pZnJhbWUuanMubXVzdGFjaGUnKTtcbmNvbnN0IFRFU1RfRE9ORV9DT05GSVJNQVRJT05fUkVTUE9OU0UgPSAndGVzdC1kb25lLWNvbmZpcm1hdGlvbic7XG5jb25zdCBNQVhfUkVTUE9OU0VfREVMQVkgICAgICAgICAgICAgID0gMzAwMDtcblxuY29uc3QgQUxMX0RSSVZFUl9UQVNLU19BRERFRF9UT19RVUVVRV9FVkVOVCA9ICdhbGwtZHJpdmVyLXRhc2tzLWFkZGVkLXRvLXF1ZXVlJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGVzdFJ1biBleHRlbmRzIEFzeW5jRXZlbnRFbWl0dGVyIHtcbiAgICBjb25zdHJ1Y3RvciAodGVzdCwgYnJvd3NlckNvbm5lY3Rpb24sIHNjcmVlbnNob3RDYXB0dXJlciwgZ2xvYmFsV2FybmluZ0xvZywgb3B0cykge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIHRoaXNbdGVzdFJ1bk1hcmtlcl0gPSB0cnVlO1xuXG4gICAgICAgIHRoaXMud2FybmluZ0xvZyA9IG5ldyBXYXJuaW5nTG9nKGdsb2JhbFdhcm5pbmdMb2cpO1xuXG4gICAgICAgIHRoaXMub3B0cyAgICAgICAgICAgICAgPSBvcHRzO1xuICAgICAgICB0aGlzLnRlc3QgICAgICAgICAgICAgID0gdGVzdDtcbiAgICAgICAgdGhpcy5icm93c2VyQ29ubmVjdGlvbiA9IGJyb3dzZXJDb25uZWN0aW9uO1xuXG4gICAgICAgIHRoaXMucGhhc2UgPSBQSEFTRS5pbml0aWFsO1xuXG4gICAgICAgIHRoaXMuZHJpdmVyVGFza1F1ZXVlICAgICAgID0gW107XG4gICAgICAgIHRoaXMudGVzdERvbmVDb21tYW5kUXVldWVkID0gZmFsc2U7XG5cbiAgICAgICAgdGhpcy5hY3RpdmVEaWFsb2dIYW5kbGVyICA9IG51bGw7XG4gICAgICAgIHRoaXMuYWN0aXZlSWZyYW1lU2VsZWN0b3IgPSBudWxsO1xuICAgICAgICB0aGlzLnNwZWVkICAgICAgICAgICAgICAgID0gdGhpcy5vcHRzLnNwZWVkO1xuICAgICAgICB0aGlzLnBhZ2VMb2FkVGltZW91dCAgICAgID0gdGhpcy5vcHRzLnBhZ2VMb2FkVGltZW91dDtcblxuICAgICAgICB0aGlzLmRpc2FibGVQYWdlUmVsb2FkcyA9IHRlc3QuZGlzYWJsZVBhZ2VSZWxvYWRzIHx8IG9wdHMuZGlzYWJsZVBhZ2VSZWxvYWRzICYmIHRlc3QuZGlzYWJsZVBhZ2VSZWxvYWRzICE9PSBmYWxzZTtcblxuICAgICAgICB0aGlzLnNlc3Npb24gPSBTZXNzaW9uQ29udHJvbGxlci5nZXRTZXNzaW9uKHRoaXMpO1xuXG4gICAgICAgIHRoaXMuY29uc29sZU1lc3NhZ2VzID0gbmV3IEJyb3dzZXJDb25zb2xlTWVzc2FnZXMoKTtcblxuICAgICAgICB0aGlzLnBlbmRpbmdSZXF1ZXN0ICAgPSBudWxsO1xuICAgICAgICB0aGlzLnBlbmRpbmdQYWdlRXJyb3IgPSBudWxsO1xuXG4gICAgICAgIHRoaXMuY29udHJvbGxlciA9IG51bGw7XG4gICAgICAgIHRoaXMuY3R4ICAgICAgICA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgICAgIHRoaXMuZml4dHVyZUN0eCA9IG51bGw7XG5cbiAgICAgICAgdGhpcy5jdXJyZW50Um9sZUlkICA9IG51bGw7XG4gICAgICAgIHRoaXMudXNlZFJvbGVTdGF0ZXMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXG4gICAgICAgIHRoaXMuZXJycyA9IFtdO1xuXG4gICAgICAgIHRoaXMubGFzdERyaXZlclN0YXR1c0lkICAgICAgID0gbnVsbDtcbiAgICAgICAgdGhpcy5sYXN0RHJpdmVyU3RhdHVzUmVzcG9uc2UgPSBudWxsO1xuXG4gICAgICAgIHRoaXMuZmlsZURvd25sb2FkaW5nSGFuZGxlZCAgICAgICAgICAgICAgID0gZmFsc2U7XG4gICAgICAgIHRoaXMucmVzb2x2ZVdhaXRGb3JGaWxlRG93bmxvYWRpbmdQcm9taXNlID0gbnVsbDtcblxuICAgICAgICB0aGlzLmFkZGluZ0RyaXZlclRhc2tzQ291bnQgPSAwO1xuXG4gICAgICAgIHRoaXMuZGVidWdnaW5nICAgICAgICAgICAgICAgPSB0aGlzLm9wdHMuZGVidWdNb2RlO1xuICAgICAgICB0aGlzLmRlYnVnT25GYWlsICAgICAgICAgICAgID0gdGhpcy5vcHRzLmRlYnVnT25GYWlsO1xuICAgICAgICB0aGlzLmRpc2FibGVEZWJ1Z0JyZWFrcG9pbnRzID0gZmFsc2U7XG4gICAgICAgIHRoaXMuZGVidWdSZXBvcnRlclBsdWdpbkhvc3QgPSBuZXcgUmVwb3J0ZXJQbHVnaW5Ib3N0KHsgbm9Db2xvcnM6IGZhbHNlIH0pO1xuXG4gICAgICAgIHRoaXMuYnJvd3Nlck1hbmlwdWxhdGlvblF1ZXVlID0gbmV3IEJyb3dzZXJNYW5pcHVsYXRpb25RdWV1ZShicm93c2VyQ29ubmVjdGlvbiwgc2NyZWVuc2hvdENhcHR1cmVyLCB0aGlzLndhcm5pbmdMb2cpO1xuXG4gICAgICAgIHRoaXMuZGVidWdMb2cgPSBuZXcgVGVzdFJ1bkRlYnVnTG9nKHRoaXMuYnJvd3NlckNvbm5lY3Rpb24udXNlckFnZW50KTtcblxuICAgICAgICB0aGlzLnF1YXJhbnRpbmUgPSBudWxsO1xuXG4gICAgICAgIHRoaXMuaW5qZWN0YWJsZS5zY3JpcHRzLnB1c2goJy90ZXN0Y2FmZS1jb3JlLmpzJyk7XG4gICAgICAgIHRoaXMuaW5qZWN0YWJsZS5zY3JpcHRzLnB1c2goJy90ZXN0Y2FmZS11aS5qcycpO1xuICAgICAgICB0aGlzLmluamVjdGFibGUuc2NyaXB0cy5wdXNoKCcvdGVzdGNhZmUtYXV0b21hdGlvbi5qcycpO1xuICAgICAgICB0aGlzLmluamVjdGFibGUuc2NyaXB0cy5wdXNoKCcvdGVzdGNhZmUtZHJpdmVyLmpzJyk7XG4gICAgICAgIHRoaXMuaW5qZWN0YWJsZS5zdHlsZXMucHVzaCgnL3Rlc3RjYWZlLXVpLXN0eWxlcy5jc3MnKTtcblxuICAgICAgICB0aGlzLnJlcXVlc3RIb29rcyA9IEFycmF5LmZyb20odGhpcy50ZXN0LnJlcXVlc3RIb29rcyk7XG5cbiAgICAgICAgdGhpcy5faW5pdFJlcXVlc3RIb29rcygpO1xuICAgIH1cblxuICAgIGdldCBpZCAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNlc3Npb24uaWQ7XG4gICAgfVxuXG4gICAgZ2V0IGluamVjdGFibGUgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXNzaW9uLmluamVjdGFibGU7XG4gICAgfVxuXG4gICAgYWRkUXVhcmFudGluZUluZm8gKHF1YXJhbnRpbmUpIHtcbiAgICAgICAgdGhpcy5xdWFyYW50aW5lID0gcXVhcmFudGluZTtcbiAgICB9XG5cbiAgICBhZGRSZXF1ZXN0SG9vayAoaG9vaykge1xuICAgICAgICBpZiAodGhpcy5yZXF1ZXN0SG9va3MuaW5kZXhPZihob29rKSAhPT0gLTEpXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgdGhpcy5yZXF1ZXN0SG9va3MucHVzaChob29rKTtcbiAgICAgICAgdGhpcy5faW5pdFJlcXVlc3RIb29rKGhvb2spO1xuICAgIH1cblxuICAgIHJlbW92ZVJlcXVlc3RIb29rIChob29rKSB7XG4gICAgICAgIGlmICh0aGlzLnJlcXVlc3RIb29rcy5pbmRleE9mKGhvb2spID09PSAtMSlcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICByZW1vdmUodGhpcy5yZXF1ZXN0SG9va3MsIGhvb2spO1xuICAgICAgICB0aGlzLl9kaXNwb3NlUmVxdWVzdEhvb2soaG9vayk7XG4gICAgfVxuXG4gICAgX2luaXRSZXF1ZXN0SG9vayAoaG9vaykge1xuICAgICAgICBob29rLndhcm5pbmdMb2cgPSB0aGlzLndhcm5pbmdMb2c7XG5cbiAgICAgICAgaG9vay5faW5zdGFudGlhdGVSZXF1ZXN0RmlsdGVyUnVsZXMoKTtcbiAgICAgICAgaG9vay5faW5zdGFudGlhdGVkUmVxdWVzdEZpbHRlclJ1bGVzLmZvckVhY2gocnVsZSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNlc3Npb24uYWRkUmVxdWVzdEV2ZW50TGlzdGVuZXJzKHJ1bGUsIHtcbiAgICAgICAgICAgICAgICBvblJlcXVlc3Q6ICAgICAgICAgICBob29rLm9uUmVxdWVzdC5iaW5kKGhvb2spLFxuICAgICAgICAgICAgICAgIG9uQ29uZmlndXJlUmVzcG9uc2U6IGhvb2suX29uQ29uZmlndXJlUmVzcG9uc2UuYmluZChob29rKSxcbiAgICAgICAgICAgICAgICBvblJlc3BvbnNlOiAgICAgICAgICBob29rLm9uUmVzcG9uc2UuYmluZChob29rKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIF9kaXNwb3NlUmVxdWVzdEhvb2sgKGhvb2spIHtcbiAgICAgICAgaG9vay53YXJuaW5nTG9nID0gbnVsbDtcblxuICAgICAgICBob29rLl9pbnN0YW50aWF0ZWRSZXF1ZXN0RmlsdGVyUnVsZXMuZm9yRWFjaChydWxlID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2Vzc2lvbi5yZW1vdmVSZXF1ZXN0RXZlbnRMaXN0ZW5lcnMocnVsZSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIF9pbml0UmVxdWVzdEhvb2tzICgpIHtcbiAgICAgICAgdGhpcy5yZXF1ZXN0SG9va3MuZm9yRWFjaChob29rID0+IHRoaXMuX2luaXRSZXF1ZXN0SG9vayhob29rKSk7XG4gICAgfVxuXG4gICAgLy8gSGFtbWVyaGVhZCBwYXlsb2FkXG4gICAgX2dldFBheWxvYWRTY3JpcHQgKCkge1xuICAgICAgICB0aGlzLmZpbGVEb3dubG9hZGluZ0hhbmRsZWQgICAgICAgICAgICAgICA9IGZhbHNlO1xuICAgICAgICB0aGlzLnJlc29sdmVXYWl0Rm9yRmlsZURvd25sb2FkaW5nUHJvbWlzZSA9IG51bGw7XG5cbiAgICAgICAgcmV0dXJuIE11c3RhY2hlLnJlbmRlcihURVNUX1JVTl9URU1QTEFURSwge1xuICAgICAgICAgICAgdGVzdFJ1bklkOiAgICAgICAgICAgICAgICAgICAgSlNPTi5zdHJpbmdpZnkodGhpcy5zZXNzaW9uLmlkKSxcbiAgICAgICAgICAgIGJyb3dzZXJJZDogICAgICAgICAgICAgICAgICAgIEpTT04uc3RyaW5naWZ5KHRoaXMuYnJvd3NlckNvbm5lY3Rpb24uaWQpLFxuICAgICAgICAgICAgYnJvd3NlckhlYXJ0YmVhdFJlbGF0aXZlVXJsOiAgSlNPTi5zdHJpbmdpZnkodGhpcy5icm93c2VyQ29ubmVjdGlvbi5oZWFydGJlYXRSZWxhdGl2ZVVybCksXG4gICAgICAgICAgICBicm93c2VyU3RhdHVzUmVsYXRpdmVVcmw6ICAgICBKU09OLnN0cmluZ2lmeSh0aGlzLmJyb3dzZXJDb25uZWN0aW9uLnN0YXR1c1JlbGF0aXZlVXJsKSxcbiAgICAgICAgICAgIGJyb3dzZXJTdGF0dXNEb25lUmVsYXRpdmVVcmw6IEpTT04uc3RyaW5naWZ5KHRoaXMuYnJvd3NlckNvbm5lY3Rpb24uc3RhdHVzRG9uZVJlbGF0aXZlVXJsKSxcbiAgICAgICAgICAgIHVzZXJBZ2VudDogICAgICAgICAgICAgICAgICAgIEpTT04uc3RyaW5naWZ5KHRoaXMuYnJvd3NlckNvbm5lY3Rpb24udXNlckFnZW50KSxcbiAgICAgICAgICAgIHRlc3ROYW1lOiAgICAgICAgICAgICAgICAgICAgIEpTT04uc3RyaW5naWZ5KHRoaXMudGVzdC5uYW1lKSxcbiAgICAgICAgICAgIGZpeHR1cmVOYW1lOiAgICAgICAgICAgICAgICAgIEpTT04uc3RyaW5naWZ5KHRoaXMudGVzdC5maXh0dXJlLm5hbWUpLFxuICAgICAgICAgICAgc2VsZWN0b3JUaW1lb3V0OiAgICAgICAgICAgICAgdGhpcy5vcHRzLnNlbGVjdG9yVGltZW91dCxcbiAgICAgICAgICAgIHBhZ2VMb2FkVGltZW91dDogICAgICAgICAgICAgIHRoaXMucGFnZUxvYWRUaW1lb3V0LFxuICAgICAgICAgICAgc2tpcEpzRXJyb3JzOiAgICAgICAgICAgICAgICAgdGhpcy5vcHRzLnNraXBKc0Vycm9ycyxcbiAgICAgICAgICAgIHJldHJ5VGVzdFBhZ2VzOiAgICAgICAgICAgICAgICEhdGhpcy5vcHRzLnJldHJ5VGVzdFBhZ2VzLFxuICAgICAgICAgICAgc3BlZWQ6ICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zcGVlZCxcbiAgICAgICAgICAgIGRpYWxvZ0hhbmRsZXI6ICAgICAgICAgICAgICAgIEpTT04uc3RyaW5naWZ5KHRoaXMuYWN0aXZlRGlhbG9nSGFuZGxlcilcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgX2dldElmcmFtZVBheWxvYWRTY3JpcHQgKCkge1xuICAgICAgICByZXR1cm4gTXVzdGFjaGUucmVuZGVyKElGUkFNRV9URVNUX1JVTl9URU1QTEFURSwge1xuICAgICAgICAgICAgdGVzdFJ1bklkOiAgICAgICBKU09OLnN0cmluZ2lmeSh0aGlzLnNlc3Npb24uaWQpLFxuICAgICAgICAgICAgc2VsZWN0b3JUaW1lb3V0OiB0aGlzLm9wdHMuc2VsZWN0b3JUaW1lb3V0LFxuICAgICAgICAgICAgcGFnZUxvYWRUaW1lb3V0OiB0aGlzLnBhZ2VMb2FkVGltZW91dCxcbiAgICAgICAgICAgIHJldHJ5VGVzdFBhZ2VzOiAgISF0aGlzLm9wdHMucmV0cnlUZXN0UGFnZXMsXG4gICAgICAgICAgICBzcGVlZDogICAgICAgICAgIHRoaXMuc3BlZWQsXG4gICAgICAgICAgICBkaWFsb2dIYW5kbGVyOiAgIEpTT04uc3RyaW5naWZ5KHRoaXMuYWN0aXZlRGlhbG9nSGFuZGxlcilcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gSGFtbWVyaGVhZCBoYW5kbGVyc1xuICAgIGdldEF1dGhDcmVkZW50aWFscyAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRlc3QuYXV0aENyZWRlbnRpYWxzO1xuICAgIH1cblxuICAgIGhhbmRsZUZpbGVEb3dubG9hZCAoKSB7XG4gICAgICAgIGlmICh0aGlzLnJlc29sdmVXYWl0Rm9yRmlsZURvd25sb2FkaW5nUHJvbWlzZSkge1xuICAgICAgICAgICAgdGhpcy5yZXNvbHZlV2FpdEZvckZpbGVEb3dubG9hZGluZ1Byb21pc2UodHJ1ZSk7XG4gICAgICAgICAgICB0aGlzLnJlc29sdmVXYWl0Rm9yRmlsZURvd25sb2FkaW5nUHJvbWlzZSA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhpcy5maWxlRG93bmxvYWRpbmdIYW5kbGVkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBoYW5kbGVQYWdlRXJyb3IgKGN0eCwgZXJyKSB7XG4gICAgICAgIGlmIChjdHgucmVxLmhlYWRlcnNbVU5TVEFCTEVfTkVUV09SS19NT0RFX0hFQURFUl0pIHtcbiAgICAgICAgICAgIGN0eC5jbG9zZVdpdGhFcnJvcig1MDAsIGVyci50b1N0cmluZygpKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucGVuZGluZ1BhZ2VFcnJvciA9IG5ldyBQYWdlTG9hZEVycm9yKGVyciwgY3R4LnJlcU9wdHMudXJsKTtcblxuICAgICAgICBjdHgucmVkaXJlY3QoY3R4LnRvUHJveHlVcmwoJ2Fib3V0OmVycm9yJykpO1xuICAgIH1cblxuICAgIC8vIFRlc3QgZnVuY3Rpb24gZXhlY3V0aW9uXG4gICAgYXN5bmMgX2V4ZWN1dGVUZXN0Rm4gKHBoYXNlLCBmbikge1xuICAgICAgICB0aGlzLnBoYXNlID0gcGhhc2U7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IGZuKHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGxldCBzY3JlZW5zaG90UGF0aCA9IG51bGw7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLm9wdHMudGFrZVNjcmVlbnNob3RzT25GYWlscylcbiAgICAgICAgICAgICAgICBzY3JlZW5zaG90UGF0aCA9IGF3YWl0IHRoaXMuZXhlY3V0ZUNvbW1hbmQobmV3IGJyb3dzZXJNYW5pcHVsYXRpb25Db21tYW5kcy5UYWtlU2NyZWVuc2hvdE9uRmFpbENvbW1hbmQoKSk7XG5cbiAgICAgICAgICAgIHRoaXMuYWRkRXJyb3IoZXJyLCBzY3JlZW5zaG90UGF0aCk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gIXRoaXMuX2FkZFBlbmRpbmdQYWdlRXJyb3JJZkFueSgpO1xuICAgIH1cblxuICAgIGFzeW5jIF9ydW5CZWZvcmVIb29rICgpIHtcbiAgICAgICAgaWYgKHRoaXMudGVzdC5iZWZvcmVGbilcbiAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLl9leGVjdXRlVGVzdEZuKFBIQVNFLmluVGVzdEJlZm9yZUhvb2ssIHRoaXMudGVzdC5iZWZvcmVGbik7XG5cbiAgICAgICAgaWYgKHRoaXMudGVzdC5maXh0dXJlLmJlZm9yZUVhY2hGbilcbiAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLl9leGVjdXRlVGVzdEZuKFBIQVNFLmluRml4dHVyZUJlZm9yZUVhY2hIb29rLCB0aGlzLnRlc3QuZml4dHVyZS5iZWZvcmVFYWNoRm4pO1xuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGFzeW5jIF9ydW5BZnRlckhvb2sgKCkge1xuICAgICAgICBpZiAodGhpcy50ZXN0LmFmdGVyRm4pXG4gICAgICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5fZXhlY3V0ZVRlc3RGbihQSEFTRS5pblRlc3RBZnRlckhvb2ssIHRoaXMudGVzdC5hZnRlckZuKTtcblxuICAgICAgICBpZiAodGhpcy50ZXN0LmZpeHR1cmUuYWZ0ZXJFYWNoRm4pXG4gICAgICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5fZXhlY3V0ZVRlc3RGbihQSEFTRS5pbkZpeHR1cmVBZnRlckVhY2hIb29rLCB0aGlzLnRlc3QuZml4dHVyZS5hZnRlckVhY2hGbik7XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgYXN5bmMgc3RhcnQgKCkge1xuICAgICAgICB0ZXN0UnVuVHJhY2tlci5hY3RpdmVUZXN0UnVuc1t0aGlzLnNlc3Npb24uaWRdID0gdGhpcztcblxuICAgICAgICBhd2FpdCB0aGlzLmVtaXQoJ3N0YXJ0Jyk7XG5cbiAgICAgICAgY29uc3Qgb25EaXNjb25uZWN0ZWQgPSBlcnIgPT4gdGhpcy5fZGlzY29ubmVjdChlcnIpO1xuXG4gICAgICAgIHRoaXMuYnJvd3NlckNvbm5lY3Rpb24ub25jZSgnZGlzY29ubmVjdGVkJywgb25EaXNjb25uZWN0ZWQpO1xuXG4gICAgICAgIGF3YWl0IHRoaXMub25jZSgnY29ubmVjdGVkJyk7XG5cbiAgICAgICAgYXdhaXQgdGhpcy5lbWl0KCdyZWFkeScpO1xuXG4gICAgICAgIGlmIChhd2FpdCB0aGlzLl9ydW5CZWZvcmVIb29rKCkpIHtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuX2V4ZWN1dGVUZXN0Rm4oUEhBU0UuaW5UZXN0LCB0aGlzLnRlc3QuZm4pO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5fcnVuQWZ0ZXJIb29rKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5kaXNjb25uZWN0ZWQpXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgdGhpcy5icm93c2VyQ29ubmVjdGlvbi5yZW1vdmVMaXN0ZW5lcignZGlzY29ubmVjdGVkJywgb25EaXNjb25uZWN0ZWQpO1xuXG4gICAgICAgIGlmICh0aGlzLmVycnMubGVuZ3RoICYmIHRoaXMuZGVidWdPbkZhaWwpXG4gICAgICAgICAgICBhd2FpdCB0aGlzLl9lbnF1ZXVlU2V0QnJlYWtwb2ludENvbW1hbmQobnVsbCwgdGhpcy5kZWJ1Z1JlcG9ydGVyUGx1Z2luSG9zdC5mb3JtYXRFcnJvcih0aGlzLmVycnNbMF0pKTtcblxuICAgICAgICBhd2FpdCB0aGlzLmVtaXQoJ2JlZm9yZS1kb25lJyk7XG5cbiAgICAgICAgYXdhaXQgdGhpcy5leGVjdXRlQ29tbWFuZChuZXcgc2VydmljZUNvbW1hbmRzLlRlc3REb25lQ29tbWFuZCgpKTtcblxuICAgICAgICB0aGlzLl9hZGRQZW5kaW5nUGFnZUVycm9ySWZBbnkoKTtcblxuICAgICAgICBkZWxldGUgdGVzdFJ1blRyYWNrZXIuYWN0aXZlVGVzdFJ1bnNbdGhpcy5zZXNzaW9uLmlkXTtcblxuICAgICAgICBhd2FpdCB0aGlzLmVtaXQoJ2RvbmUnKTtcbiAgICB9XG5cbiAgICAvLyBFcnJvcnNcbiAgICBfYWRkUGVuZGluZ1BhZ2VFcnJvcklmQW55ICgpIHtcbiAgICAgICAgaWYgKHRoaXMucGVuZGluZ1BhZ2VFcnJvcikge1xuICAgICAgICAgICAgdGhpcy5hZGRFcnJvcih0aGlzLnBlbmRpbmdQYWdlRXJyb3IpO1xuICAgICAgICAgICAgdGhpcy5wZW5kaW5nUGFnZUVycm9yID0gbnVsbDtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIF9jcmVhdGVFcnJvckFkYXB0ZXIgKGVyciwgc2NyZWVuc2hvdFBhdGgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUZXN0UnVuRXJyb3JGb3JtYXR0YWJsZUFkYXB0ZXIoZXJyLCB7XG4gICAgICAgICAgICB1c2VyQWdlbnQ6ICAgICAgdGhpcy5icm93c2VyQ29ubmVjdGlvbi51c2VyQWdlbnQsXG4gICAgICAgICAgICBzY3JlZW5zaG90UGF0aDogc2NyZWVuc2hvdFBhdGggfHwgJycsXG4gICAgICAgICAgICB0ZXN0UnVuUGhhc2U6ICAgdGhpcy5waGFzZVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhZGRFcnJvciAoZXJyLCBzY3JlZW5zaG90UGF0aCkge1xuICAgICAgICBjb25zdCBlcnJMaXN0ID0gZXJyIGluc3RhbmNlb2YgVGVzdENhZmVFcnJvckxpc3QgPyBlcnIuaXRlbXMgOiBbZXJyXTtcblxuICAgICAgICBlcnJMaXN0LmZvckVhY2goaXRlbSA9PiB7XG4gICAgICAgICAgICBjb25zdCBhZGFwdGVyID0gdGhpcy5fY3JlYXRlRXJyb3JBZGFwdGVyKGl0ZW0sIHNjcmVlbnNob3RQYXRoKTtcblxuICAgICAgICAgICAgdGhpcy5lcnJzLnB1c2goYWRhcHRlcik7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIFRhc2sgcXVldWVcbiAgICBfZW5xdWV1ZUNvbW1hbmQgKGNvbW1hbmQsIGNhbGxzaXRlKSB7XG4gICAgICAgIGlmICh0aGlzLnBlbmRpbmdSZXF1ZXN0KVxuICAgICAgICAgICAgdGhpcy5fcmVzb2x2ZVBlbmRpbmdSZXF1ZXN0KGNvbW1hbmQpO1xuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShhc3luYyAocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICB0aGlzLmFkZGluZ0RyaXZlclRhc2tzQ291bnQtLTtcbiAgICAgICAgICAgIHRoaXMuZHJpdmVyVGFza1F1ZXVlLnB1c2goeyBjb21tYW5kLCByZXNvbHZlLCByZWplY3QsIGNhbGxzaXRlIH0pO1xuXG4gICAgICAgICAgICBpZiAoIXRoaXMuYWRkaW5nRHJpdmVyVGFza3NDb3VudClcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLmVtaXQoQUxMX0RSSVZFUl9UQVNLU19BRERFRF9UT19RVUVVRV9FVkVOVCwgdGhpcy5kcml2ZXJUYXNrUXVldWUubGVuZ3RoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZ2V0IGRyaXZlclRhc2tRdWV1ZUxlbmd0aCAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmFkZGluZ0RyaXZlclRhc2tzQ291bnQgPyBwcm9taXNpZnlFdmVudCh0aGlzLCBBTExfRFJJVkVSX1RBU0tTX0FEREVEX1RPX1FVRVVFX0VWRU5UKSA6IFByb21pc2UucmVzb2x2ZSh0aGlzLmRyaXZlclRhc2tRdWV1ZS5sZW5ndGgpO1xuICAgIH1cblxuICAgIGFzeW5jIF9lbnF1ZXVlQnJvd3NlckNvbnNvbGVNZXNzYWdlc0NvbW1hbmQgKGNvbW1hbmQsIGNhbGxzaXRlKSB7XG4gICAgICAgIGF3YWl0IHRoaXMuX2VucXVldWVDb21tYW5kKGNvbW1hbmQsIGNhbGxzaXRlKTtcblxuICAgICAgICByZXR1cm4gdGhpcy5jb25zb2xlTWVzc2FnZXMuZ2V0Q29weSgpO1xuICAgIH1cblxuICAgIGFzeW5jIF9lbnF1ZXVlU2V0QnJlYWtwb2ludENvbW1hbmQgKGNhbGxzaXRlLCBlcnJvcikge1xuICAgICAgICBpZiAodGhpcy5icm93c2VyQ29ubmVjdGlvbi5pc0hlYWRsZXNzQnJvd3NlcigpKSB7XG4gICAgICAgICAgICB0aGlzLndhcm5pbmdMb2cuYWRkV2FybmluZyhXQVJOSU5HX01FU1NBR0UuZGVidWdJbkhlYWRsZXNzRXJyb3IpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgZGVidWdMb2dnZXIuc2hvd0JyZWFrcG9pbnQodGhpcy5zZXNzaW9uLmlkLCB0aGlzLmJyb3dzZXJDb25uZWN0aW9uLnVzZXJBZ2VudCwgY2FsbHNpdGUsIGVycm9yKTtcblxuICAgICAgICB0aGlzLmRlYnVnZ2luZyA9IGF3YWl0IHRoaXMuZXhlY3V0ZUNvbW1hbmQobmV3IHNlcnZpY2VDb21tYW5kcy5TZXRCcmVha3BvaW50Q29tbWFuZCghIWVycm9yKSwgY2FsbHNpdGUpO1xuICAgIH1cblxuICAgIF9yZW1vdmVBbGxOb25TZXJ2aWNlVGFza3MgKCkge1xuICAgICAgICB0aGlzLmRyaXZlclRhc2tRdWV1ZSA9IHRoaXMuZHJpdmVyVGFza1F1ZXVlLmZpbHRlcihkcml2ZXJUYXNrID0+IGlzU2VydmljZUNvbW1hbmQoZHJpdmVyVGFzay5jb21tYW5kKSk7XG5cbiAgICAgICAgdGhpcy5icm93c2VyTWFuaXB1bGF0aW9uUXVldWUucmVtb3ZlQWxsTm9uU2VydmljZU1hbmlwdWxhdGlvbnMoKTtcbiAgICB9XG5cbiAgICAvLyBDdXJyZW50IGRyaXZlciB0YXNrXG4gICAgZ2V0IGN1cnJlbnREcml2ZXJUYXNrICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZHJpdmVyVGFza1F1ZXVlWzBdO1xuICAgIH1cblxuICAgIF9yZXNvbHZlQ3VycmVudERyaXZlclRhc2sgKHJlc3VsdCkge1xuICAgICAgICB0aGlzLmN1cnJlbnREcml2ZXJUYXNrLnJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgdGhpcy5kcml2ZXJUYXNrUXVldWUuc2hpZnQoKTtcblxuICAgICAgICBpZiAodGhpcy50ZXN0RG9uZUNvbW1hbmRRdWV1ZWQpXG4gICAgICAgICAgICB0aGlzLl9yZW1vdmVBbGxOb25TZXJ2aWNlVGFza3MoKTtcbiAgICB9XG5cbiAgICBfcmVqZWN0Q3VycmVudERyaXZlclRhc2sgKGVycikge1xuICAgICAgICBlcnIuY2FsbHNpdGUgICAgICAgICAgICAgPSBlcnIuY2FsbHNpdGUgfHwgdGhpcy5jdXJyZW50RHJpdmVyVGFzay5jYWxsc2l0ZTtcbiAgICAgICAgZXJyLmlzUmVqZWN0ZWREcml2ZXJUYXNrID0gdHJ1ZTtcblxuICAgICAgICB0aGlzLmN1cnJlbnREcml2ZXJUYXNrLnJlamVjdChlcnIpO1xuICAgICAgICB0aGlzLl9yZW1vdmVBbGxOb25TZXJ2aWNlVGFza3MoKTtcbiAgICB9XG5cbiAgICAvLyBQZW5kaW5nIHJlcXVlc3RcbiAgICBfY2xlYXJQZW5kaW5nUmVxdWVzdCAoKSB7XG4gICAgICAgIGlmICh0aGlzLnBlbmRpbmdSZXF1ZXN0KSB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5wZW5kaW5nUmVxdWVzdC5yZXNwb25zZVRpbWVvdXQpO1xuICAgICAgICAgICAgdGhpcy5wZW5kaW5nUmVxdWVzdCA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfcmVzb2x2ZVBlbmRpbmdSZXF1ZXN0IChjb21tYW5kKSB7XG4gICAgICAgIHRoaXMubGFzdERyaXZlclN0YXR1c1Jlc3BvbnNlID0gY29tbWFuZDtcbiAgICAgICAgdGhpcy5wZW5kaW5nUmVxdWVzdC5yZXNvbHZlKGNvbW1hbmQpO1xuICAgICAgICB0aGlzLl9jbGVhclBlbmRpbmdSZXF1ZXN0KCk7XG4gICAgfVxuXG4gICAgLy8gSGFuZGxlIGRyaXZlciByZXF1ZXN0XG4gICAgX2Z1bGZpbGxDdXJyZW50RHJpdmVyVGFzayAoZHJpdmVyU3RhdHVzKSB7XG4gICAgICAgIGlmIChkcml2ZXJTdGF0dXMuZXhlY3V0aW9uRXJyb3IpXG4gICAgICAgICAgICB0aGlzLl9yZWplY3RDdXJyZW50RHJpdmVyVGFzayhkcml2ZXJTdGF0dXMuZXhlY3V0aW9uRXJyb3IpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0aGlzLl9yZXNvbHZlQ3VycmVudERyaXZlclRhc2soZHJpdmVyU3RhdHVzLnJlc3VsdCk7XG4gICAgfVxuXG4gICAgX2hhbmRsZVBhZ2VFcnJvclN0YXR1cyAocGFnZUVycm9yKSB7XG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnREcml2ZXJUYXNrICYmIGlzQ29tbWFuZFJlamVjdGFibGVCeVBhZ2VFcnJvcih0aGlzLmN1cnJlbnREcml2ZXJUYXNrLmNvbW1hbmQpKSB7XG4gICAgICAgICAgICB0aGlzLl9yZWplY3RDdXJyZW50RHJpdmVyVGFzayhwYWdlRXJyb3IpO1xuICAgICAgICAgICAgdGhpcy5wZW5kaW5nUGFnZUVycm9yID0gbnVsbDtcblxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnBlbmRpbmdQYWdlRXJyb3IgPSB0aGlzLnBlbmRpbmdQYWdlRXJyb3IgfHwgcGFnZUVycm9yO1xuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBfaGFuZGxlRHJpdmVyUmVxdWVzdCAoZHJpdmVyU3RhdHVzKSB7XG4gICAgICAgIGNvbnN0IGlzVGVzdERvbmUgICAgICAgICAgICAgICAgID0gdGhpcy5jdXJyZW50RHJpdmVyVGFzayAmJiB0aGlzLmN1cnJlbnREcml2ZXJUYXNrLmNvbW1hbmQudHlwZSA9PT0gQ09NTUFORF9UWVBFLnRlc3REb25lO1xuICAgICAgICBjb25zdCBwYWdlRXJyb3IgICAgICAgICAgICAgICAgICA9IHRoaXMucGVuZGluZ1BhZ2VFcnJvciB8fCBkcml2ZXJTdGF0dXMucGFnZUVycm9yO1xuICAgICAgICBjb25zdCBjdXJyZW50VGFza1JlamVjdGVkQnlFcnJvciA9IHBhZ2VFcnJvciAmJiB0aGlzLl9oYW5kbGVQYWdlRXJyb3JTdGF0dXMocGFnZUVycm9yKTtcblxuICAgICAgICBpZiAodGhpcy5kaXNjb25uZWN0ZWQpXG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKF8sIHJlamVjdCkgPT4gcmVqZWN0KCkpO1xuXG4gICAgICAgIHRoaXMuY29uc29sZU1lc3NhZ2VzLmNvbmNhdChkcml2ZXJTdGF0dXMuY29uc29sZU1lc3NhZ2VzKTtcblxuICAgICAgICBpZiAoIWN1cnJlbnRUYXNrUmVqZWN0ZWRCeUVycm9yICYmIGRyaXZlclN0YXR1cy5pc0NvbW1hbmRSZXN1bHQpIHtcbiAgICAgICAgICAgIGlmIChpc1Rlc3REb25lKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcmVzb2x2ZUN1cnJlbnREcml2ZXJUYXNrKCk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gVEVTVF9ET05FX0NPTkZJUk1BVElPTl9SRVNQT05TRTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5fZnVsZmlsbEN1cnJlbnREcml2ZXJUYXNrKGRyaXZlclN0YXR1cyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5fZ2V0Q3VycmVudERyaXZlclRhc2tDb21tYW5kKCk7XG4gICAgfVxuXG4gICAgX2dldEN1cnJlbnREcml2ZXJUYXNrQ29tbWFuZCAoKSB7XG4gICAgICAgIGlmICghdGhpcy5jdXJyZW50RHJpdmVyVGFzaylcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuXG4gICAgICAgIGNvbnN0IGNvbW1hbmQgPSB0aGlzLmN1cnJlbnREcml2ZXJUYXNrLmNvbW1hbmQ7XG5cbiAgICAgICAgaWYgKGNvbW1hbmQudHlwZSA9PT0gQ09NTUFORF9UWVBFLm5hdmlnYXRlVG8gJiYgY29tbWFuZC5zdGF0ZVNuYXBzaG90KVxuICAgICAgICAgICAgdGhpcy5zZXNzaW9uLnVzZVN0YXRlU25hcHNob3QoSlNPTi5wYXJzZShjb21tYW5kLnN0YXRlU25hcHNob3QpKTtcblxuICAgICAgICByZXR1cm4gY29tbWFuZDtcbiAgICB9XG5cbiAgICAvLyBFeGVjdXRlIGNvbW1hbmRcbiAgICBhc3luYyBfZXhlY3V0ZUV4cHJlc3Npb24gKGNvbW1hbmQpIHtcbiAgICAgICAgY29uc3QgeyByZXN1bHRWYXJpYWJsZU5hbWUsIGlzQXN5bmNFeHByZXNzaW9uIH0gPSBjb21tYW5kO1xuXG4gICAgICAgIGxldCBleHByZXNzaW9uID0gY29tbWFuZC5leHByZXNzaW9uO1xuXG4gICAgICAgIGlmIChpc0FzeW5jRXhwcmVzc2lvbilcbiAgICAgICAgICAgIGV4cHJlc3Npb24gPSBgYXdhaXQgJHtleHByZXNzaW9ufWA7XG5cbiAgICAgICAgaWYgKHJlc3VsdFZhcmlhYmxlTmFtZSlcbiAgICAgICAgICAgIGV4cHJlc3Npb24gPSBgJHtyZXN1bHRWYXJpYWJsZU5hbWV9ID0gJHtleHByZXNzaW9ufSwgJHtyZXN1bHRWYXJpYWJsZU5hbWV9YDtcblxuICAgICAgICBpZiAoaXNBc3luY0V4cHJlc3Npb24pXG4gICAgICAgICAgICBleHByZXNzaW9uID0gYChhc3luYyAoKSA9PiB7IHJldHVybiAke2V4cHJlc3Npb259OyB9KS5hcHBseSh0aGlzKTtgO1xuXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGV4ZWN1dGVKc0V4cHJlc3Npb24oZXhwcmVzc2lvbiwgdGhpcywgeyBza2lwVmlzaWJpbGl0eUNoZWNrOiBmYWxzZSB9KTtcblxuICAgICAgICByZXR1cm4gaXNBc3luY0V4cHJlc3Npb24gPyBhd2FpdCByZXN1bHQgOiByZXN1bHQ7XG4gICAgfVxuXG4gICAgYXN5bmMgX2V4ZWN1dGVBc3NlcnRpb24gKGNvbW1hbmQsIGNhbGxzaXRlKSB7XG4gICAgICAgIGNvbnN0IGFzc2VydGlvblRpbWVvdXQgPSBjb21tYW5kLm9wdGlvbnMudGltZW91dCA9PT0gdm9pZCAwID8gdGhpcy5vcHRzLmFzc2VydGlvblRpbWVvdXQgOiBjb21tYW5kLm9wdGlvbnMudGltZW91dDtcbiAgICAgICAgY29uc3QgZXhlY3V0b3IgICAgICAgICA9IG5ldyBBc3NlcnRpb25FeGVjdXRvcihjb21tYW5kLCBhc3NlcnRpb25UaW1lb3V0LCBjYWxsc2l0ZSk7XG5cbiAgICAgICAgZXhlY3V0b3Iub25jZSgnc3RhcnQtYXNzZXJ0aW9uLXJldHJpZXMnLCB0aW1lb3V0ID0+IHRoaXMuZXhlY3V0ZUNvbW1hbmQobmV3IHNlcnZpY2VDb21tYW5kcy5TaG93QXNzZXJ0aW9uUmV0cmllc1N0YXR1c0NvbW1hbmQodGltZW91dCkpKTtcbiAgICAgICAgZXhlY3V0b3Iub25jZSgnZW5kLWFzc2VydGlvbi1yZXRyaWVzJywgc3VjY2VzcyA9PiB0aGlzLmV4ZWN1dGVDb21tYW5kKG5ldyBzZXJ2aWNlQ29tbWFuZHMuSGlkZUFzc2VydGlvblJldHJpZXNTdGF0dXNDb21tYW5kKHN1Y2Nlc3MpKSk7XG5cbiAgICAgICAgcmV0dXJuIGV4ZWN1dG9yLnJ1bigpO1xuICAgIH1cblxuICAgIF9hZGp1c3RDb25maWd1cmF0aW9uV2l0aENvbW1hbmQgKGNvbW1hbmQpIHtcbiAgICAgICAgaWYgKGNvbW1hbmQudHlwZSA9PT0gQ09NTUFORF9UWVBFLnRlc3REb25lKSB7XG4gICAgICAgICAgICB0aGlzLnRlc3REb25lQ29tbWFuZFF1ZXVlZCA9IHRydWU7XG4gICAgICAgICAgICBkZWJ1Z0xvZ2dlci5oaWRlQnJlYWtwb2ludCh0aGlzLnNlc3Npb24uaWQpO1xuICAgICAgICB9XG5cbiAgICAgICAgZWxzZSBpZiAoY29tbWFuZC50eXBlID09PSBDT01NQU5EX1RZUEUuc2V0TmF0aXZlRGlhbG9nSGFuZGxlcilcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlRGlhbG9nSGFuZGxlciA9IGNvbW1hbmQuZGlhbG9nSGFuZGxlcjtcblxuICAgICAgICBlbHNlIGlmIChjb21tYW5kLnR5cGUgPT09IENPTU1BTkRfVFlQRS5zd2l0Y2hUb0lmcmFtZSlcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlSWZyYW1lU2VsZWN0b3IgPSBjb21tYW5kLnNlbGVjdG9yO1xuXG4gICAgICAgIGVsc2UgaWYgKGNvbW1hbmQudHlwZSA9PT0gQ09NTUFORF9UWVBFLnN3aXRjaFRvTWFpbldpbmRvdylcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlSWZyYW1lU2VsZWN0b3IgPSBudWxsO1xuXG4gICAgICAgIGVsc2UgaWYgKGNvbW1hbmQudHlwZSA9PT0gQ09NTUFORF9UWVBFLnNldFRlc3RTcGVlZClcbiAgICAgICAgICAgIHRoaXMuc3BlZWQgPSBjb21tYW5kLnNwZWVkO1xuXG4gICAgICAgIGVsc2UgaWYgKGNvbW1hbmQudHlwZSA9PT0gQ09NTUFORF9UWVBFLnNldFBhZ2VMb2FkVGltZW91dClcbiAgICAgICAgICAgIHRoaXMucGFnZUxvYWRUaW1lb3V0ID0gY29tbWFuZC5kdXJhdGlvbjtcblxuICAgICAgICBlbHNlIGlmIChjb21tYW5kLnR5cGUgPT09IENPTU1BTkRfVFlQRS5kZWJ1ZylcbiAgICAgICAgICAgIHRoaXMuZGVidWdnaW5nID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBhc3luYyBfYWRqdXN0U2NyZWVuc2hvdENvbW1hbmQgKGNvbW1hbmQpIHtcbiAgICAgICAgY29uc3QgYnJvd3NlcklkICAgICAgICAgICAgICAgICAgICA9IHRoaXMuYnJvd3NlckNvbm5lY3Rpb24uaWQ7XG4gICAgICAgIGNvbnN0IHsgaGFzQ2hyb21lbGVzc1NjcmVlbnNob3RzIH0gPSBhd2FpdCB0aGlzLmJyb3dzZXJDb25uZWN0aW9uLnByb3ZpZGVyLmhhc0N1c3RvbUFjdGlvbkZvckJyb3dzZXIoYnJvd3NlcklkKTtcblxuICAgICAgICBpZiAoIWhhc0Nocm9tZWxlc3NTY3JlZW5zaG90cylcbiAgICAgICAgICAgIGNvbW1hbmQuZ2VuZXJhdGVTY3JlZW5zaG90TWFyaygpO1xuICAgIH1cblxuICAgIGFzeW5jIF9zZXRCcmVha3BvaW50SWZOZWNlc3NhcnkgKGNvbW1hbmQsIGNhbGxzaXRlKSB7XG4gICAgICAgIGlmICghdGhpcy5kaXNhYmxlRGVidWdCcmVha3BvaW50cyAmJiB0aGlzLmRlYnVnZ2luZyAmJiBjYW5TZXREZWJ1Z2dlckJyZWFrcG9pbnRCZWZvcmVDb21tYW5kKGNvbW1hbmQpKVxuICAgICAgICAgICAgYXdhaXQgdGhpcy5fZW5xdWV1ZVNldEJyZWFrcG9pbnRDb21tYW5kKGNhbGxzaXRlKTtcbiAgICB9XG5cbiAgICBhc3luYyBleGVjdXRlQ29tbWFuZCAoY29tbWFuZCwgY2FsbHNpdGUpIHtcbiAgICAgICAgdGhpcy5kZWJ1Z0xvZy5jb21tYW5kKGNvbW1hbmQpO1xuXG4gICAgICAgIGlmICh0aGlzLnBlbmRpbmdQYWdlRXJyb3IgJiYgaXNDb21tYW5kUmVqZWN0YWJsZUJ5UGFnZUVycm9yKGNvbW1hbmQpKVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3JlamVjdENvbW1hbmRXaXRoUGFnZUVycm9yKGNhbGxzaXRlKTtcblxuICAgICAgICBpZiAoaXNFeGVjdXRhYmxlT25DbGllbnRDb21tYW5kKGNvbW1hbmQpKVxuICAgICAgICAgICAgdGhpcy5hZGRpbmdEcml2ZXJUYXNrc0NvdW50Kys7XG5cbiAgICAgICAgdGhpcy5fYWRqdXN0Q29uZmlndXJhdGlvbldpdGhDb21tYW5kKGNvbW1hbmQpO1xuXG4gICAgICAgIGF3YWl0IHRoaXMuX3NldEJyZWFrcG9pbnRJZk5lY2Vzc2FyeShjb21tYW5kLCBjYWxsc2l0ZSk7XG5cbiAgICAgICAgaWYgKGlzU2NyZWVuc2hvdENvbW1hbmQoY29tbWFuZCkpXG4gICAgICAgICAgICBhd2FpdCB0aGlzLl9hZGp1c3RTY3JlZW5zaG90Q29tbWFuZChjb21tYW5kKTtcblxuICAgICAgICBpZiAoaXNCcm93c2VyTWFuaXB1bGF0aW9uQ29tbWFuZChjb21tYW5kKSkge1xuICAgICAgICAgICAgdGhpcy5icm93c2VyTWFuaXB1bGF0aW9uUXVldWUucHVzaChjb21tYW5kKTtcblxuICAgICAgICAgICAgaWYgKGlzUmVzaXplV2luZG93Q29tbWFuZChjb21tYW5kKSAmJiB0aGlzLm9wdHMudmlkZW9QYXRoKVxuICAgICAgICAgICAgICAgIHRoaXMud2FybmluZ0xvZy5hZGRXYXJuaW5nKFdBUk5JTkdfTUVTU0FHRS52aWRlb0Jyb3dzZXJSZXNpemluZywgdGhpcy50ZXN0Lm5hbWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNvbW1hbmQudHlwZSA9PT0gQ09NTUFORF9UWVBFLndhaXQpXG4gICAgICAgICAgICByZXR1cm4gZGVsYXkoY29tbWFuZC50aW1lb3V0KTtcblxuICAgICAgICBpZiAoY29tbWFuZC50eXBlID09PSBDT01NQU5EX1RZUEUuc2V0UGFnZUxvYWRUaW1lb3V0KVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgaWYgKGNvbW1hbmQudHlwZSA9PT0gQ09NTUFORF9UWVBFLmRlYnVnKVxuICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuX2VucXVldWVTZXRCcmVha3BvaW50Q29tbWFuZChjYWxsc2l0ZSk7XG5cbiAgICAgICAgaWYgKGNvbW1hbmQudHlwZSA9PT0gQ09NTUFORF9UWVBFLnVzZVJvbGUpXG4gICAgICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5fdXNlUm9sZShjb21tYW5kLnJvbGUsIGNhbGxzaXRlKTtcblxuICAgICAgICBpZiAoY29tbWFuZC50eXBlID09PSBDT01NQU5EX1RZUEUuYXNzZXJ0aW9uKVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2V4ZWN1dGVBc3NlcnRpb24oY29tbWFuZCwgY2FsbHNpdGUpO1xuXG4gICAgICAgIGlmIChjb21tYW5kLnR5cGUgPT09IENPTU1BTkRfVFlQRS5leGVjdXRlRXhwcmVzc2lvbilcbiAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLl9leGVjdXRlRXhwcmVzc2lvbihjb21tYW5kLCBjYWxsc2l0ZSk7XG5cbiAgICAgICAgaWYgKGNvbW1hbmQudHlwZSA9PT0gQ09NTUFORF9UWVBFLmdldEJyb3dzZXJDb25zb2xlTWVzc2FnZXMpXG4gICAgICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5fZW5xdWV1ZUJyb3dzZXJDb25zb2xlTWVzc2FnZXNDb21tYW5kKGNvbW1hbmQsIGNhbGxzaXRlKTtcblxuICAgICAgICByZXR1cm4gdGhpcy5fZW5xdWV1ZUNvbW1hbmQoY29tbWFuZCwgY2FsbHNpdGUpO1xuICAgIH1cblxuICAgIF9yZWplY3RDb21tYW5kV2l0aFBhZ2VFcnJvciAoY2FsbHNpdGUpIHtcbiAgICAgICAgY29uc3QgZXJyID0gdGhpcy5wZW5kaW5nUGFnZUVycm9yO1xuXG4gICAgICAgIGVyci5jYWxsc2l0ZSAgICAgICAgICA9IGNhbGxzaXRlO1xuICAgICAgICB0aGlzLnBlbmRpbmdQYWdlRXJyb3IgPSBudWxsO1xuXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChlcnIpO1xuICAgIH1cblxuICAgIC8vIFJvbGUgbWFuYWdlbWVudFxuICAgIGFzeW5jIGdldFN0YXRlU25hcHNob3QgKCkge1xuICAgICAgICBjb25zdCBzdGF0ZSA9IHRoaXMuc2Vzc2lvbi5nZXRTdGF0ZVNuYXBzaG90KCk7XG5cbiAgICAgICAgc3RhdGUuc3RvcmFnZXMgPSBhd2FpdCB0aGlzLmV4ZWN1dGVDb21tYW5kKG5ldyBzZXJ2aWNlQ29tbWFuZHMuQmFja3VwU3RvcmFnZXNDb21tYW5kKCkpO1xuXG4gICAgICAgIHJldHVybiBzdGF0ZTtcbiAgICB9XG5cbiAgICBhc3luYyBzd2l0Y2hUb0NsZWFuUnVuICgpIHtcbiAgICAgICAgdGhpcy5jdHggICAgICAgICAgICAgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgICAgICB0aGlzLmZpeHR1cmVDdHggICAgICA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgICAgIHRoaXMuY29uc29sZU1lc3NhZ2VzID0gbmV3IEJyb3dzZXJDb25zb2xlTWVzc2FnZXMoKTtcblxuICAgICAgICB0aGlzLnNlc3Npb24udXNlU3RhdGVTbmFwc2hvdChTdGF0ZVNuYXBzaG90LmVtcHR5KCkpO1xuXG4gICAgICAgIGlmICh0aGlzLmFjdGl2ZURpYWxvZ0hhbmRsZXIpIHtcbiAgICAgICAgICAgIGNvbnN0IHJlbW92ZURpYWxvZ0hhbmRsZXJDb21tYW5kID0gbmV3IGFjdGlvbkNvbW1hbmRzLlNldE5hdGl2ZURpYWxvZ0hhbmRsZXJDb21tYW5kKHsgZGlhbG9nSGFuZGxlcjogeyBmbjogbnVsbCB9IH0pO1xuXG4gICAgICAgICAgICBhd2FpdCB0aGlzLmV4ZWN1dGVDb21tYW5kKHJlbW92ZURpYWxvZ0hhbmRsZXJDb21tYW5kKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnNwZWVkICE9PSB0aGlzLm9wdHMuc3BlZWQpIHtcbiAgICAgICAgICAgIGNvbnN0IHNldFNwZWVkQ29tbWFuZCA9IG5ldyBhY3Rpb25Db21tYW5kcy5TZXRUZXN0U3BlZWRDb21tYW5kKHsgc3BlZWQ6IHRoaXMub3B0cy5zcGVlZCB9KTtcblxuICAgICAgICAgICAgYXdhaXQgdGhpcy5leGVjdXRlQ29tbWFuZChzZXRTcGVlZENvbW1hbmQpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMucGFnZUxvYWRUaW1lb3V0ICE9PSB0aGlzLm9wdHMucGFnZUxvYWRUaW1lb3V0KSB7XG4gICAgICAgICAgICBjb25zdCBzZXRQYWdlTG9hZFRpbWVvdXRDb21tYW5kID0gbmV3IGFjdGlvbkNvbW1hbmRzLlNldFBhZ2VMb2FkVGltZW91dENvbW1hbmQoeyBkdXJhdGlvbjogdGhpcy5vcHRzLnBhZ2VMb2FkVGltZW91dCB9KTtcblxuICAgICAgICAgICAgYXdhaXQgdGhpcy5leGVjdXRlQ29tbWFuZChzZXRQYWdlTG9hZFRpbWVvdXRDb21tYW5kKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFzeW5jIF9nZXRTdGF0ZVNuYXBzaG90RnJvbVJvbGUgKHJvbGUpIHtcbiAgICAgICAgY29uc3QgcHJldlBoYXNlID0gdGhpcy5waGFzZTtcblxuICAgICAgICB0aGlzLnBoYXNlID0gUEhBU0UuaW5Sb2xlSW5pdGlhbGl6ZXI7XG5cbiAgICAgICAgaWYgKHJvbGUucGhhc2UgPT09IFJPTEVfUEhBU0UudW5pbml0aWFsaXplZClcbiAgICAgICAgICAgIGF3YWl0IHJvbGUuaW5pdGlhbGl6ZSh0aGlzKTtcblxuICAgICAgICBlbHNlIGlmIChyb2xlLnBoYXNlID09PSBST0xFX1BIQVNFLnBlbmRpbmdJbml0aWFsaXphdGlvbilcbiAgICAgICAgICAgIGF3YWl0IHByb21pc2lmeUV2ZW50KHJvbGUsICdpbml0aWFsaXplZCcpO1xuXG4gICAgICAgIGlmIChyb2xlLmluaXRFcnIpXG4gICAgICAgICAgICB0aHJvdyByb2xlLmluaXRFcnI7XG5cbiAgICAgICAgdGhpcy5waGFzZSA9IHByZXZQaGFzZTtcblxuICAgICAgICByZXR1cm4gcm9sZS5zdGF0ZVNuYXBzaG90O1xuICAgIH1cblxuICAgIGFzeW5jIF91c2VSb2xlIChyb2xlLCBjYWxsc2l0ZSkge1xuICAgICAgICBpZiAodGhpcy5waGFzZSA9PT0gUEhBU0UuaW5Sb2xlSW5pdGlhbGl6ZXIpXG4gICAgICAgICAgICB0aHJvdyBuZXcgUm9sZVN3aXRjaEluUm9sZUluaXRpYWxpemVyRXJyb3IoY2FsbHNpdGUpO1xuXG4gICAgICAgIHRoaXMuZGlzYWJsZURlYnVnQnJlYWtwb2ludHMgPSB0cnVlO1xuXG4gICAgICAgIGNvbnN0IGJvb2ttYXJrID0gbmV3IFRlc3RSdW5Cb29rbWFyayh0aGlzLCByb2xlKTtcblxuICAgICAgICBhd2FpdCBib29rbWFyay5pbml0KCk7XG5cbiAgICAgICAgaWYgKHRoaXMuY3VycmVudFJvbGVJZClcbiAgICAgICAgICAgIHRoaXMudXNlZFJvbGVTdGF0ZXNbdGhpcy5jdXJyZW50Um9sZUlkXSA9IGF3YWl0IHRoaXMuZ2V0U3RhdGVTbmFwc2hvdCgpO1xuXG4gICAgICAgIGNvbnN0IHN0YXRlU25hcHNob3QgPSB0aGlzLnVzZWRSb2xlU3RhdGVzW3JvbGUuaWRdIHx8IGF3YWl0IHRoaXMuX2dldFN0YXRlU25hcHNob3RGcm9tUm9sZShyb2xlKTtcblxuICAgICAgICB0aGlzLnNlc3Npb24udXNlU3RhdGVTbmFwc2hvdChzdGF0ZVNuYXBzaG90KTtcblxuICAgICAgICB0aGlzLmN1cnJlbnRSb2xlSWQgPSByb2xlLmlkO1xuXG4gICAgICAgIGF3YWl0IGJvb2ttYXJrLnJlc3RvcmUoY2FsbHNpdGUsIHN0YXRlU25hcHNob3QpO1xuXG4gICAgICAgIHRoaXMuZGlzYWJsZURlYnVnQnJlYWtwb2ludHMgPSBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBHZXQgY3VycmVudCBVUkxcbiAgICBhc3luYyBnZXRDdXJyZW50VXJsICgpIHtcbiAgICAgICAgY29uc3QgYnVpbGRlciA9IG5ldyBDbGllbnRGdW5jdGlvbkJ1aWxkZXIoKCkgPT4ge1xuICAgICAgICAgICAgLyogZXNsaW50LWRpc2FibGUgbm8tdW5kZWYgKi9cbiAgICAgICAgICAgIHJldHVybiB3aW5kb3cubG9jYXRpb24uaHJlZjtcbiAgICAgICAgICAgIC8qIGVzbGludC1lbmFibGUgbm8tdW5kZWYgKi9cbiAgICAgICAgfSwgeyBib3VuZFRlc3RSdW46IHRoaXMgfSk7XG5cbiAgICAgICAgY29uc3QgZ2V0TG9jYXRpb24gPSBidWlsZGVyLmdldEZ1bmN0aW9uKCk7XG5cbiAgICAgICAgcmV0dXJuIGF3YWl0IGdldExvY2F0aW9uKCk7XG4gICAgfVxuXG4gICAgX2Rpc2Nvbm5lY3QgKGVycikge1xuICAgICAgICB0aGlzLmRpc2Nvbm5lY3RlZCA9IHRydWU7XG5cbiAgICAgICAgdGhpcy5fcmVqZWN0Q3VycmVudERyaXZlclRhc2soZXJyKTtcblxuICAgICAgICB0aGlzLmVtaXQoJ2Rpc2Nvbm5lY3RlZCcsIGVycik7XG5cbiAgICAgICAgZGVsZXRlIHRlc3RSdW5UcmFja2VyLmFjdGl2ZVRlc3RSdW5zW3RoaXMuc2Vzc2lvbi5pZF07XG4gICAgfVxufVxuXG4vLyBTZXJ2aWNlIG1lc3NhZ2UgaGFuZGxlcnNcbmNvbnN0IFNlcnZpY2VNZXNzYWdlcyA9IFRlc3RSdW4ucHJvdG90eXBlO1xuXG4vLyBOT1RFOiB0aGlzIGZ1bmN0aW9uIGlzIHRpbWUtY3JpdGljYWwgYW5kIG11c3QgcmV0dXJuIEFTQVAgdG8gYXZvaWQgY2xpZW50IGRpc2Nvbm5lY3Rpb25cblNlcnZpY2VNZXNzYWdlc1tDTElFTlRfTUVTU0FHRVMucmVhZHldID0gZnVuY3Rpb24gKG1zZykge1xuICAgIHRoaXMuZGVidWdMb2cuZHJpdmVyTWVzc2FnZShtc2cpO1xuXG4gICAgdGhpcy5lbWl0KCdjb25uZWN0ZWQnKTtcblxuICAgIHRoaXMuX2NsZWFyUGVuZGluZ1JlcXVlc3QoKTtcblxuICAgIC8vIE5PVEU6IHRoZSBkcml2ZXIgc2VuZHMgdGhlIHN0YXR1cyBmb3IgdGhlIHNlY29uZCB0aW1lIGlmIGl0IGRpZG4ndCBnZXQgYSByZXNwb25zZSBhdCB0aGVcbiAgICAvLyBmaXJzdCB0cnkuIFRoaXMgaXMgcG9zc2libGUgd2hlbiB0aGUgcGFnZSB3YXMgdW5sb2FkZWQgYWZ0ZXIgdGhlIGRyaXZlciBzZW50IHRoZSBzdGF0dXMuXG4gICAgaWYgKG1zZy5zdGF0dXMuaWQgPT09IHRoaXMubGFzdERyaXZlclN0YXR1c0lkKVxuICAgICAgICByZXR1cm4gdGhpcy5sYXN0RHJpdmVyU3RhdHVzUmVzcG9uc2U7XG5cbiAgICB0aGlzLmxhc3REcml2ZXJTdGF0dXNJZCAgICAgICA9IG1zZy5zdGF0dXMuaWQ7XG4gICAgdGhpcy5sYXN0RHJpdmVyU3RhdHVzUmVzcG9uc2UgPSB0aGlzLl9oYW5kbGVEcml2ZXJSZXF1ZXN0KG1zZy5zdGF0dXMpO1xuXG4gICAgaWYgKHRoaXMubGFzdERyaXZlclN0YXR1c1Jlc3BvbnNlKVxuICAgICAgICByZXR1cm4gdGhpcy5sYXN0RHJpdmVyU3RhdHVzUmVzcG9uc2U7XG5cbiAgICAvLyBOT1RFOiB3ZSBzZW5kIGFuIGVtcHR5IHJlc3BvbnNlIGFmdGVyIHRoZSBNQVhfUkVTUE9OU0VfREVMQVkgdGltZW91dCBpcyBleGNlZWRlZCB0byBrZWVwIGNvbm5lY3Rpb25cbiAgICAvLyB3aXRoIHRoZSBjbGllbnQgYW5kIHByZXZlbnQgdGhlIHJlc3BvbnNlIHRpbWVvdXQgZXhjZXB0aW9uIG9uIHRoZSBjbGllbnQgc2lkZVxuICAgIGNvbnN0IHJlc3BvbnNlVGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4gdGhpcy5fcmVzb2x2ZVBlbmRpbmdSZXF1ZXN0KG51bGwpLCBNQVhfUkVTUE9OU0VfREVMQVkpO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgdGhpcy5wZW5kaW5nUmVxdWVzdCA9IHsgcmVzb2x2ZSwgcmVqZWN0LCByZXNwb25zZVRpbWVvdXQgfTtcbiAgICB9KTtcbn07XG5cblNlcnZpY2VNZXNzYWdlc1tDTElFTlRfTUVTU0FHRVMucmVhZHlGb3JCcm93c2VyTWFuaXB1bGF0aW9uXSA9IGFzeW5jIGZ1bmN0aW9uIChtc2cpIHtcbiAgICB0aGlzLmRlYnVnTG9nLmRyaXZlck1lc3NhZ2UobXNnKTtcblxuICAgIGxldCByZXN1bHQgPSBudWxsO1xuICAgIGxldCBlcnJvciAgPSBudWxsO1xuXG4gICAgdHJ5IHtcbiAgICAgICAgcmVzdWx0ID0gYXdhaXQgdGhpcy5icm93c2VyTWFuaXB1bGF0aW9uUXVldWUuZXhlY3V0ZVBlbmRpbmdNYW5pcHVsYXRpb24obXNnKTtcbiAgICB9XG4gICAgY2F0Y2ggKGVycikge1xuICAgICAgICBlcnJvciA9IGVycjtcbiAgICB9XG5cbiAgICByZXR1cm4geyByZXN1bHQsIGVycm9yIH07XG59O1xuXG5TZXJ2aWNlTWVzc2FnZXNbQ0xJRU5UX01FU1NBR0VTLndhaXRGb3JGaWxlRG93bmxvYWRdID0gZnVuY3Rpb24gKG1zZykge1xuICAgIHRoaXMuZGVidWdMb2cuZHJpdmVyTWVzc2FnZShtc2cpO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgICBpZiAodGhpcy5maWxlRG93bmxvYWRpbmdIYW5kbGVkKSB7XG4gICAgICAgICAgICB0aGlzLmZpbGVEb3dubG9hZGluZ0hhbmRsZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhpcy5yZXNvbHZlV2FpdEZvckZpbGVEb3dubG9hZGluZ1Byb21pc2UgPSByZXNvbHZlO1xuICAgIH0pO1xufTtcbiJdfQ==
