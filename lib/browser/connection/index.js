'use strict';

exports.__esModule = true;

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _events = require('events');

var _pinkie = require('pinkie');

var _pinkie2 = _interopRequireDefault(_pinkie);

var _mustache = require('mustache');

var _mustache2 = _interopRequireDefault(_mustache);

var _lodash = require('lodash');

var _useragent = require('useragent');

var _readFileRelative = require('read-file-relative');

var _promisifyEvent = require('promisify-event');

var _promisifyEvent2 = _interopRequireDefault(_promisifyEvent);

var _nanoid = require('nanoid');

var _nanoid2 = _interopRequireDefault(_nanoid);

var _command = require('./command');

var _command2 = _interopRequireDefault(_command);

var _status = require('./status');

var _status2 = _interopRequireDefault(_status);

var _runtime = require('../../errors/runtime');

var _types = require('../../errors/types');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const IDLE_PAGE_TEMPLATE = (0, _readFileRelative.readSync)('../../client/browser/idle-page/index.html.mustache');
const connections = {};

class BrowserConnection extends _events.EventEmitter {
    constructor(gateway, browserInfo, permanent) {
        super();

        this.HEARTBEAT_TIMEOUT = 2 * 60 * 1000;
        this.BROWSER_RESTART_TIMEOUT = 60 * 1000;

        this.id = BrowserConnection._generateId();
        this.jobQueue = [];
        this.initScriptsQueue = [];
        this.browserConnectionGateway = gateway;
        this.errorSuppressed = false;
        this.testRunAborted = false;

        this.browserInfo = browserInfo;
        this.browserInfo.userAgent = '';
        this.browserInfo.userAgentProviderMetaInfo = '';

        this.provider = browserInfo.provider;

        this.permanent = permanent;
        this.closing = false;
        this.closed = false;
        this.ready = false;
        this.opened = false;
        this.idle = true;
        this.heartbeatTimeout = null;
        this.pendingTestRunUrl = null;

        this.url = `${gateway.domain}/browser/connect/${this.id}`;
        this.idleUrl = `${gateway.domain}/browser/idle/${this.id}`;
        this.forcedIdleUrl = `${gateway.domain}/browser/idle-forced/${this.id}`;
        this.initScriptUrl = `${gateway.domain}/browser/init-script/${this.id}`;

        this.heartbeatRelativeUrl = `/browser/heartbeat/${this.id}`;
        this.statusRelativeUrl = `/browser/status/${this.id}`;
        this.statusDoneRelativeUrl = `/browser/status-done/${this.id}`;

        this.heartbeatUrl = `${gateway.domain}${this.heartbeatRelativeUrl}`;
        this.statusUrl = `${gateway.domain}${this.statusRelativeUrl}`;
        this.statusDoneUrl = `${gateway.domain}${this.statusDoneRelativeUrl}`;

        this.on('error', () => {
            this._forceIdle();
            this.close();
        });

        connections[this.id] = this;

        this.browserConnectionGateway.startServingConnection(this);

        process.nextTick(() => this._runBrowser());
    }

    static _generateId() {
        return (0, _nanoid2.default)(7);
    }

    _runBrowser() {
        var _this = this;

        return (0, _asyncToGenerator3.default)(function* () {
            try {
                yield _this.provider.openBrowser(_this.id, _this.url, _this.browserInfo.browserName);

                if (!_this.ready) yield (0, _promisifyEvent2.default)(_this, 'ready');

                _this.opened = true;
                _this.emit('opened');
            } catch (err) {
                _this.emit('error', new _runtime.GeneralError(_types.RUNTIME_ERRORS.unableToOpenBrowser, _this.browserInfo.providerName + ':' + _this.browserInfo.browserName, err.stack));
            }
        })();
    }

    _closeBrowser() {
        var _this2 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            if (!_this2.idle) yield (0, _promisifyEvent2.default)(_this2, 'idle');

            try {
                yield _this2.provider.closeBrowser(_this2.id);
            } catch (err) {
                // NOTE: A warning would be really nice here, but it can't be done while log is stored in a task.
            }
        })();
    }

    _forceIdle() {
        if (!this.idle) {
            this.switchingToIdle = false;
            this.idle = true;
            this.emit('idle');
        }
    }

    _createBrowserDisconnectedError() {
        return new _runtime.GeneralError(_types.RUNTIME_ERRORS.browserDisconnected, this.userAgent);
    }

    _waitForHeartbeat() {
        this.heartbeatTimeout = setTimeout(() => {
            const err = this._createBrowserDisconnectedError();

            this.opened = false;
            this.errorSuppressed = false;
            this.testRunAborted = true;

            this.emit('disconnected', err);

            if (!this.errorSuppressed) this.emit('error', err);
        }, this.HEARTBEAT_TIMEOUT);
    }

    _getTestRunUrl(needPopNext) {
        var _this3 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            if (needPopNext || !_this3.pendingTestRunUrl) _this3.pendingTestRunUrl = yield _this3._popNextTestRunUrl();

            return _this3.pendingTestRunUrl;
        })();
    }

    _popNextTestRunUrl() {
        var _this4 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            while (_this4.hasQueuedJobs && !_this4.currentJob.hasQueuedTestRuns) _this4.jobQueue.shift();

            return _this4.hasQueuedJobs ? yield _this4.currentJob.popNextTestRunUrl(_this4) : null;
        })();
    }

    static getById(id) {
        return connections[id] || null;
    }

    restartBrowser() {
        var _this5 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            _this5.ready = false;

            _this5._forceIdle();

            let resolveTimeout = null;
            let isTimeoutExpired = false;
            let timeout = null;

            const restartPromise = _this5._closeBrowser().then(function () {
                return _this5._runBrowser();
            });

            const timeoutPromise = new _pinkie2.default(function (resolve) {
                resolveTimeout = resolve;

                timeout = setTimeout(function () {
                    isTimeoutExpired = true;

                    resolve();
                }, _this5.BROWSER_RESTART_TIMEOUT);
            });

            _pinkie2.default.race([restartPromise, timeoutPromise]).then(function () {
                clearTimeout(timeout);

                if (isTimeoutExpired) _this5.emit('error', _this5._createBrowserDisconnectedError());else resolveTimeout();
            });
        })();
    }

    suppressError() {
        this.errorSuppressed = true;
    }

    addWarning(...args) {
        if (this.currentJob) this.currentJob.warningLog.addWarning(...args);
    }

    setProviderMetaInfo(str) {
        this.browserInfo.userAgentProviderMetaInfo = str;
    }

    get userAgent() {
        let userAgent = this.browserInfo.userAgent;

        if (this.browserInfo.userAgentProviderMetaInfo) userAgent += ` (${this.browserInfo.userAgentProviderMetaInfo})`;

        return userAgent;
    }

    get hasQueuedJobs() {
        return !!this.jobQueue.length;
    }

    get currentJob() {
        return this.jobQueue[0];
    }

    // API
    runInitScript(code) {
        return new _pinkie2.default(resolve => this.initScriptsQueue.push({ code, resolve }));
    }

    addJob(job) {
        this.jobQueue.push(job);
    }

    removeJob(job) {
        (0, _lodash.pull)(this.jobQueue, job);
    }

    close() {
        if (this.closed || this.closing) return;

        this.closing = true;

        this._closeBrowser().then(() => {
            this.browserConnectionGateway.stopServingConnection(this);
            clearTimeout(this.heartbeatTimeout);

            delete connections[this.id];

            this.ready = false;
            this.closed = true;

            this.emit('closed');
        });
    }

    establish(userAgent) {
        this.ready = true;

        const parsedUserAgent = (0, _useragent.parse)(userAgent);

        this.browserInfo.userAgent = parsedUserAgent.toString();
        this.browserInfo.fullUserAgent = userAgent;
        this.browserInfo.parsedUserAgent = parsedUserAgent;

        this._waitForHeartbeat();
        this.emit('ready');
    }

    heartbeat() {
        clearTimeout(this.heartbeatTimeout);
        this._waitForHeartbeat();

        return {
            code: this.closing ? _status2.default.closing : _status2.default.ok,
            url: this.closing ? this.idleUrl : ''
        };
    }

    renderIdlePage() {
        return _mustache2.default.render(IDLE_PAGE_TEMPLATE, {
            userAgent: this.userAgent,
            statusUrl: this.statusUrl,
            heartbeatUrl: this.heartbeatUrl,
            initScriptUrl: this.initScriptUrl,
            retryTestPages: !!this.browserConnectionGateway.retryTestPages
        });
    }

    getInitScript() {
        const initScriptPromise = this.initScriptsQueue[0];

        return { code: initScriptPromise ? initScriptPromise.code : null };
    }

    handleInitScriptResult(data) {
        const initScriptPromise = this.initScriptsQueue.shift();

        if (initScriptPromise) initScriptPromise.resolve(JSON.parse(data));
    }

    isHeadlessBrowser() {
        return this.provider.isHeadlessBrowser(this.id);
    }

    reportJobResult(status, data) {
        var _this6 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            yield _this6.provider.reportJobResult(_this6.id, status, data);
        })();
    }

    getStatus(isTestDone) {
        var _this7 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            if (!_this7.idle && !isTestDone) {
                _this7.idle = true;
                _this7.emit('idle');
            }

            if (_this7.opened) {
                const testRunUrl = yield _this7._getTestRunUrl(isTestDone || _this7.testRunAborted);

                _this7.testRunAborted = false;

                if (testRunUrl) {
                    _this7.idle = false;
                    return { cmd: _command2.default.run, url: testRunUrl };
                }
            }

            return { cmd: _command2.default.idle, url: _this7.idleUrl };
        })();
    }
}
exports.default = BrowserConnection;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9icm93c2VyL2Nvbm5lY3Rpb24vaW5kZXguanMiXSwibmFtZXMiOlsiSURMRV9QQUdFX1RFTVBMQVRFIiwiY29ubmVjdGlvbnMiLCJCcm93c2VyQ29ubmVjdGlvbiIsImNvbnN0cnVjdG9yIiwiZ2F0ZXdheSIsImJyb3dzZXJJbmZvIiwicGVybWFuZW50IiwiSEVBUlRCRUFUX1RJTUVPVVQiLCJCUk9XU0VSX1JFU1RBUlRfVElNRU9VVCIsImlkIiwiX2dlbmVyYXRlSWQiLCJqb2JRdWV1ZSIsImluaXRTY3JpcHRzUXVldWUiLCJicm93c2VyQ29ubmVjdGlvbkdhdGV3YXkiLCJlcnJvclN1cHByZXNzZWQiLCJ0ZXN0UnVuQWJvcnRlZCIsInVzZXJBZ2VudCIsInVzZXJBZ2VudFByb3ZpZGVyTWV0YUluZm8iLCJwcm92aWRlciIsImNsb3NpbmciLCJjbG9zZWQiLCJyZWFkeSIsIm9wZW5lZCIsImlkbGUiLCJoZWFydGJlYXRUaW1lb3V0IiwicGVuZGluZ1Rlc3RSdW5VcmwiLCJ1cmwiLCJkb21haW4iLCJpZGxlVXJsIiwiZm9yY2VkSWRsZVVybCIsImluaXRTY3JpcHRVcmwiLCJoZWFydGJlYXRSZWxhdGl2ZVVybCIsInN0YXR1c1JlbGF0aXZlVXJsIiwic3RhdHVzRG9uZVJlbGF0aXZlVXJsIiwiaGVhcnRiZWF0VXJsIiwic3RhdHVzVXJsIiwic3RhdHVzRG9uZVVybCIsIm9uIiwiX2ZvcmNlSWRsZSIsImNsb3NlIiwic3RhcnRTZXJ2aW5nQ29ubmVjdGlvbiIsInByb2Nlc3MiLCJuZXh0VGljayIsIl9ydW5Ccm93c2VyIiwib3BlbkJyb3dzZXIiLCJicm93c2VyTmFtZSIsImVtaXQiLCJlcnIiLCJ1bmFibGVUb09wZW5Ccm93c2VyIiwicHJvdmlkZXJOYW1lIiwic3RhY2siLCJfY2xvc2VCcm93c2VyIiwiY2xvc2VCcm93c2VyIiwic3dpdGNoaW5nVG9JZGxlIiwiX2NyZWF0ZUJyb3dzZXJEaXNjb25uZWN0ZWRFcnJvciIsImJyb3dzZXJEaXNjb25uZWN0ZWQiLCJfd2FpdEZvckhlYXJ0YmVhdCIsInNldFRpbWVvdXQiLCJfZ2V0VGVzdFJ1blVybCIsIm5lZWRQb3BOZXh0IiwiX3BvcE5leHRUZXN0UnVuVXJsIiwiaGFzUXVldWVkSm9icyIsImN1cnJlbnRKb2IiLCJoYXNRdWV1ZWRUZXN0UnVucyIsInNoaWZ0IiwicG9wTmV4dFRlc3RSdW5VcmwiLCJnZXRCeUlkIiwicmVzdGFydEJyb3dzZXIiLCJyZXNvbHZlVGltZW91dCIsImlzVGltZW91dEV4cGlyZWQiLCJ0aW1lb3V0IiwicmVzdGFydFByb21pc2UiLCJ0aGVuIiwidGltZW91dFByb21pc2UiLCJyZXNvbHZlIiwicmFjZSIsImNsZWFyVGltZW91dCIsInN1cHByZXNzRXJyb3IiLCJhZGRXYXJuaW5nIiwiYXJncyIsIndhcm5pbmdMb2ciLCJzZXRQcm92aWRlck1ldGFJbmZvIiwic3RyIiwibGVuZ3RoIiwicnVuSW5pdFNjcmlwdCIsImNvZGUiLCJwdXNoIiwiYWRkSm9iIiwiam9iIiwicmVtb3ZlSm9iIiwic3RvcFNlcnZpbmdDb25uZWN0aW9uIiwiZXN0YWJsaXNoIiwicGFyc2VkVXNlckFnZW50IiwidG9TdHJpbmciLCJmdWxsVXNlckFnZW50IiwiaGVhcnRiZWF0Iiwib2siLCJyZW5kZXJJZGxlUGFnZSIsInJlbmRlciIsInJldHJ5VGVzdFBhZ2VzIiwiZ2V0SW5pdFNjcmlwdCIsImluaXRTY3JpcHRQcm9taXNlIiwiaGFuZGxlSW5pdFNjcmlwdFJlc3VsdCIsImRhdGEiLCJKU09OIiwicGFyc2UiLCJpc0hlYWRsZXNzQnJvd3NlciIsInJlcG9ydEpvYlJlc3VsdCIsInN0YXR1cyIsImdldFN0YXR1cyIsImlzVGVzdERvbmUiLCJ0ZXN0UnVuVXJsIiwiY21kIiwicnVuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBOztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOztBQUNBOzs7O0FBRUEs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bUcsTUFBdkMsRUFBK0NMLElBQS9DLENBQU47QUFEaUM7QUFFcEM7O0FBRUtNLGFBQU4sQ0FBaUJDLFVBQWpCLEVBQTZCO0FBQUE7O0FBQUE7QUFDekIsZ0JBQUksQ0FBQyxPQUFLdkYsSUFBTixJQUFjLENBQUN1RixVQUFuQixFQUErQjtBQUMzQix1QkFBS3ZGLElBQUwsR0FBWSxJQUFaO0FBQ0EsdUJBQUt1QixJQUFMLENBQVUsTUFBVjtBQUNIOztBQUVELGdCQUFJLE9BQUt4QixNQUFULEVBQWlCO0FBQ2Isc0JBQU15RixhQUFhLE1BQU0sT0FBS3JELGNBQUwsQ0FBb0JvRCxjQUFjLE9BQUsvRixjQUF2QyxDQUF6Qjs7QUFFQSx1QkFBS0EsY0FBTCxHQUFzQixLQUF0Qjs7QUFFQSxvQkFBSWdHLFVBQUosRUFBZ0I7QUFDWiwyQkFBS3hGLElBQUwsR0FBWSxLQUFaO0FBQ0EsMkJBQU8sRUFBRXlGLEtBQUssa0JBQVFDLEdBQWYsRUFBb0J2RixLQUFLcUYsVUFBekIsRUFBUDtBQUNIO0FBQ0o7O0FBRUQsbUJBQU8sRUFBRUMsS0FBSyxrQkFBUXpGLElBQWYsRUFBcUJHLEtBQUssT0FBS0UsT0FBL0IsRUFBUDtBQWpCeUI7QUFrQjVCO0FBL1N1RDtrQkFBdkMxQixpQiIsImZpbGUiOiJicm93c2VyL2Nvbm5lY3Rpb24vaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBFdmVudEVtaXR0ZXIgfSBmcm9tICdldmVudHMnO1xuaW1wb3J0IFByb21pc2UgZnJvbSAncGlua2llJztcbmltcG9ydCBNdXN0YWNoZSBmcm9tICdtdXN0YWNoZSc7XG5pbXBvcnQgeyBwdWxsIGFzIHJlbW92ZSB9IGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgeyBwYXJzZSBhcyBwYXJzZVVzZXJBZ2VudCB9IGZyb20gJ3VzZXJhZ2VudCc7XG5pbXBvcnQgeyByZWFkU3luYyBhcyByZWFkIH0gZnJvbSAncmVhZC1maWxlLXJlbGF0aXZlJztcbmltcG9ydCBwcm9taXNpZnlFdmVudCBmcm9tICdwcm9taXNpZnktZXZlbnQnO1xuaW1wb3J0IG5hbm9pZCBmcm9tICduYW5vaWQnO1xuaW1wb3J0IENPTU1BTkQgZnJvbSAnLi9jb21tYW5kJztcbmltcG9ydCBTVEFUVVMgZnJvbSAnLi9zdGF0dXMnO1xuaW1wb3J0IHsgR2VuZXJhbEVycm9yIH0gZnJvbSAnLi4vLi4vZXJyb3JzL3J1bnRpbWUnO1xuaW1wb3J0IHsgUlVOVElNRV9FUlJPUlMgfSBmcm9tICcuLi8uLi9lcnJvcnMvdHlwZXMnO1xuXG5jb25zdCBJRExFX1BBR0VfVEVNUExBVEUgPSByZWFkKCcuLi8uLi9jbGllbnQvYnJvd3Nlci9pZGxlLXBhZ2UvaW5kZXguaHRtbC5tdXN0YWNoZScpO1xuY29uc3QgY29ubmVjdGlvbnMgICAgICAgID0ge307XG5cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQnJvd3NlckNvbm5lY3Rpb24gZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xuICAgIGNvbnN0cnVjdG9yIChnYXRld2F5LCBicm93c2VySW5mbywgcGVybWFuZW50KSB7XG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgdGhpcy5IRUFSVEJFQVRfVElNRU9VVCAgICAgICA9IDIgKiA2MCAqIDEwMDA7XG4gICAgICAgIHRoaXMuQlJPV1NFUl9SRVNUQVJUX1RJTUVPVVQgPSA2MCAqIDEwMDA7XG5cbiAgICAgICAgdGhpcy5pZCAgICAgICAgICAgICAgICAgICAgICAgPSBCcm93c2VyQ29ubmVjdGlvbi5fZ2VuZXJhdGVJZCgpO1xuICAgICAgICB0aGlzLmpvYlF1ZXVlICAgICAgICAgICAgICAgICA9IFtdO1xuICAgICAgICB0aGlzLmluaXRTY3JpcHRzUXVldWUgICAgICAgICA9IFtdO1xuICAgICAgICB0aGlzLmJyb3dzZXJDb25uZWN0aW9uR2F0ZXdheSA9IGdhdGV3YXk7XG4gICAgICAgIHRoaXMuZXJyb3JTdXBwcmVzc2VkICAgICAgICAgID0gZmFsc2U7XG4gICAgICAgIHRoaXMudGVzdFJ1bkFib3J0ZWQgICAgICAgICAgID0gZmFsc2U7XG5cbiAgICAgICAgdGhpcy5icm93c2VySW5mbyAgICAgICAgICAgICAgICAgICAgICAgICAgID0gYnJvd3NlckluZm87XG4gICAgICAgIHRoaXMuYnJvd3NlckluZm8udXNlckFnZW50ICAgICAgICAgICAgICAgICA9ICcnO1xuICAgICAgICB0aGlzLmJyb3dzZXJJbmZvLnVzZXJBZ2VudFByb3ZpZGVyTWV0YUluZm8gPSAnJztcblxuICAgICAgICB0aGlzLnByb3ZpZGVyID0gYnJvd3NlckluZm8ucHJvdmlkZXI7XG5cbiAgICAgICAgdGhpcy5wZXJtYW5lbnQgICAgICAgICA9IHBlcm1hbmVudDtcbiAgICAgICAgdGhpcy5jbG9zaW5nICAgICAgICAgICA9IGZhbHNlO1xuICAgICAgICB0aGlzLmNsb3NlZCAgICAgICAgICAgID0gZmFsc2U7XG4gICAgICAgIHRoaXMucmVhZHkgICAgICAgICAgICAgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5vcGVuZWQgICAgICAgICAgICA9IGZhbHNlO1xuICAgICAgICB0aGlzLmlkbGUgICAgICAgICAgICAgID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5oZWFydGJlYXRUaW1lb3V0ICA9IG51bGw7XG4gICAgICAgIHRoaXMucGVuZGluZ1Rlc3RSdW5VcmwgPSBudWxsO1xuXG4gICAgICAgIHRoaXMudXJsICAgICAgICAgICA9IGAke2dhdGV3YXkuZG9tYWlufS9icm93c2VyL2Nvbm5lY3QvJHt0aGlzLmlkfWA7XG4gICAgICAgIHRoaXMuaWRsZVVybCAgICAgICA9IGAke2dhdGV3YXkuZG9tYWlufS9icm93c2VyL2lkbGUvJHt0aGlzLmlkfWA7XG4gICAgICAgIHRoaXMuZm9yY2VkSWRsZVVybCA9IGAke2dhdGV3YXkuZG9tYWlufS9icm93c2VyL2lkbGUtZm9yY2VkLyR7dGhpcy5pZH1gO1xuICAgICAgICB0aGlzLmluaXRTY3JpcHRVcmwgPSBgJHtnYXRld2F5LmRvbWFpbn0vYnJvd3Nlci9pbml0LXNjcmlwdC8ke3RoaXMuaWR9YDtcblxuICAgICAgICB0aGlzLmhlYXJ0YmVhdFJlbGF0aXZlVXJsICA9IGAvYnJvd3Nlci9oZWFydGJlYXQvJHt0aGlzLmlkfWA7XG4gICAgICAgIHRoaXMuc3RhdHVzUmVsYXRpdmVVcmwgICAgID0gYC9icm93c2VyL3N0YXR1cy8ke3RoaXMuaWR9YDtcbiAgICAgICAgdGhpcy5zdGF0dXNEb25lUmVsYXRpdmVVcmwgPSBgL2Jyb3dzZXIvc3RhdHVzLWRvbmUvJHt0aGlzLmlkfWA7XG5cbiAgICAgICAgdGhpcy5oZWFydGJlYXRVcmwgID0gYCR7Z2F0ZXdheS5kb21haW59JHt0aGlzLmhlYXJ0YmVhdFJlbGF0aXZlVXJsfWA7XG4gICAgICAgIHRoaXMuc3RhdHVzVXJsICAgICA9IGAke2dhdGV3YXkuZG9tYWlufSR7dGhpcy5zdGF0dXNSZWxhdGl2ZVVybH1gO1xuICAgICAgICB0aGlzLnN0YXR1c0RvbmVVcmwgPSBgJHtnYXRld2F5LmRvbWFpbn0ke3RoaXMuc3RhdHVzRG9uZVJlbGF0aXZlVXJsfWA7XG5cbiAgICAgICAgdGhpcy5vbignZXJyb3InLCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLl9mb3JjZUlkbGUoKTtcbiAgICAgICAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29ubmVjdGlvbnNbdGhpcy5pZF0gPSB0aGlzO1xuXG4gICAgICAgIHRoaXMuYnJvd3NlckNvbm5lY3Rpb25HYXRld2F5LnN0YXJ0U2VydmluZ0Nvbm5lY3Rpb24odGhpcyk7XG5cbiAgICAgICAgcHJvY2Vzcy5uZXh0VGljaygoKSA9PiB0aGlzLl9ydW5Ccm93c2VyKCkpO1xuICAgIH1cblxuICAgIHN0YXRpYyBfZ2VuZXJhdGVJZCAoKSB7XG4gICAgICAgIHJldHVybiBuYW5vaWQoNyk7XG4gICAgfVxuXG4gICAgYXN5bmMgX3J1bkJyb3dzZXIgKCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wcm92aWRlci5vcGVuQnJvd3Nlcih0aGlzLmlkLCB0aGlzLnVybCwgdGhpcy5icm93c2VySW5mby5icm93c2VyTmFtZSk7XG5cbiAgICAgICAgICAgIGlmICghdGhpcy5yZWFkeSlcbiAgICAgICAgICAgICAgICBhd2FpdCBwcm9taXNpZnlFdmVudCh0aGlzLCAncmVhZHknKTtcblxuICAgICAgICAgICAgdGhpcy5vcGVuZWQgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5lbWl0KCdvcGVuZWQnKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICB0aGlzLmVtaXQoJ2Vycm9yJywgbmV3IEdlbmVyYWxFcnJvcihcbiAgICAgICAgICAgICAgICBSVU5USU1FX0VSUk9SUy51bmFibGVUb09wZW5Ccm93c2VyLFxuICAgICAgICAgICAgICAgIHRoaXMuYnJvd3NlckluZm8ucHJvdmlkZXJOYW1lICsgJzonICsgdGhpcy5icm93c2VySW5mby5icm93c2VyTmFtZSxcbiAgICAgICAgICAgICAgICBlcnIuc3RhY2tcbiAgICAgICAgICAgICkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYXN5bmMgX2Nsb3NlQnJvd3NlciAoKSB7XG4gICAgICAgIGlmICghdGhpcy5pZGxlKVxuICAgICAgICAgICAgYXdhaXQgcHJvbWlzaWZ5RXZlbnQodGhpcywgJ2lkbGUnKTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wcm92aWRlci5jbG9zZUJyb3dzZXIodGhpcy5pZCk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgLy8gTk9URTogQSB3YXJuaW5nIHdvdWxkIGJlIHJlYWxseSBuaWNlIGhlcmUsIGJ1dCBpdCBjYW4ndCBiZSBkb25lIHdoaWxlIGxvZyBpcyBzdG9yZWQgaW4gYSB0YXNrLlxuICAgICAgICB9XG4gICAgfVxuXG4gICAgX2ZvcmNlSWRsZSAoKSB7XG4gICAgICAgIGlmICghdGhpcy5pZGxlKSB7XG4gICAgICAgICAgICB0aGlzLnN3aXRjaGluZ1RvSWRsZSA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5pZGxlICAgICAgICAgICAgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5lbWl0KCdpZGxlJyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfY3JlYXRlQnJvd3NlckRpc2Nvbm5lY3RlZEVycm9yICgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBHZW5lcmFsRXJyb3IoUlVOVElNRV9FUlJPUlMuYnJvd3NlckRpc2Nvbm5lY3RlZCwgdGhpcy51c2VyQWdlbnQpO1xuICAgIH1cblxuICAgIF93YWl0Rm9ySGVhcnRiZWF0ICgpIHtcbiAgICAgICAgdGhpcy5oZWFydGJlYXRUaW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBlcnIgPSB0aGlzLl9jcmVhdGVCcm93c2VyRGlzY29ubmVjdGVkRXJyb3IoKTtcblxuICAgICAgICAgICAgdGhpcy5vcGVuZWQgICAgICAgICAgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuZXJyb3JTdXBwcmVzc2VkID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLnRlc3RSdW5BYm9ydGVkICA9IHRydWU7XG5cbiAgICAgICAgICAgIHRoaXMuZW1pdCgnZGlzY29ubmVjdGVkJywgZXJyKTtcblxuICAgICAgICAgICAgaWYgKCF0aGlzLmVycm9yU3VwcHJlc3NlZClcbiAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ2Vycm9yJywgZXJyKTtcblxuICAgICAgICB9LCB0aGlzLkhFQVJUQkVBVF9USU1FT1VUKTtcbiAgICB9XG5cbiAgICBhc3luYyBfZ2V0VGVzdFJ1blVybCAobmVlZFBvcE5leHQpIHtcbiAgICAgICAgaWYgKG5lZWRQb3BOZXh0IHx8ICF0aGlzLnBlbmRpbmdUZXN0UnVuVXJsKVxuICAgICAgICAgICAgdGhpcy5wZW5kaW5nVGVzdFJ1blVybCA9IGF3YWl0IHRoaXMuX3BvcE5leHRUZXN0UnVuVXJsKCk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMucGVuZGluZ1Rlc3RSdW5Vcmw7XG4gICAgfVxuXG4gICAgYXN5bmMgX3BvcE5leHRUZXN0UnVuVXJsICgpIHtcbiAgICAgICAgd2hpbGUgKHRoaXMuaGFzUXVldWVkSm9icyAmJiAhdGhpcy5jdXJyZW50Sm9iLmhhc1F1ZXVlZFRlc3RSdW5zKVxuICAgICAgICAgICAgdGhpcy5qb2JRdWV1ZS5zaGlmdCgpO1xuXG4gICAgICAgIHJldHVybiB0aGlzLmhhc1F1ZXVlZEpvYnMgPyBhd2FpdCB0aGlzLmN1cnJlbnRKb2IucG9wTmV4dFRlc3RSdW5VcmwodGhpcykgOiBudWxsO1xuICAgIH1cblxuICAgIHN0YXRpYyBnZXRCeUlkIChpZCkge1xuICAgICAgICByZXR1cm4gY29ubmVjdGlvbnNbaWRdIHx8IG51bGw7XG4gICAgfVxuXG4gICAgYXN5bmMgcmVzdGFydEJyb3dzZXIgKCkge1xuICAgICAgICB0aGlzLnJlYWR5ID0gZmFsc2U7XG5cbiAgICAgICAgdGhpcy5fZm9yY2VJZGxlKCk7XG5cbiAgICAgICAgbGV0IHJlc29sdmVUaW1lb3V0ICAgPSBudWxsO1xuICAgICAgICBsZXQgaXNUaW1lb3V0RXhwaXJlZCA9IGZhbHNlO1xuICAgICAgICBsZXQgdGltZW91dCAgICAgICAgICA9IG51bGw7XG5cbiAgICAgICAgY29uc3QgcmVzdGFydFByb21pc2UgPSB0aGlzLl9jbG9zZUJyb3dzZXIoKVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4gdGhpcy5fcnVuQnJvd3NlcigpKTtcblxuICAgICAgICBjb25zdCB0aW1lb3V0UHJvbWlzZSA9IG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgICAgICAgcmVzb2x2ZVRpbWVvdXQgPSByZXNvbHZlO1xuXG4gICAgICAgICAgICB0aW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgaXNUaW1lb3V0RXhwaXJlZCA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICB9LCB0aGlzLkJST1dTRVJfUkVTVEFSVF9USU1FT1VUKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgUHJvbWlzZS5yYWNlKFsgcmVzdGFydFByb21pc2UsIHRpbWVvdXRQcm9taXNlIF0pXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGlzVGltZW91dEV4cGlyZWQpXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZW1pdCgnZXJyb3InLCB0aGlzLl9jcmVhdGVCcm93c2VyRGlzY29ubmVjdGVkRXJyb3IoKSk7XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlVGltZW91dCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgc3VwcHJlc3NFcnJvciAoKSB7XG4gICAgICAgIHRoaXMuZXJyb3JTdXBwcmVzc2VkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBhZGRXYXJuaW5nICguLi5hcmdzKSB7XG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRKb2IpXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRKb2Iud2FybmluZ0xvZy5hZGRXYXJuaW5nKC4uLmFyZ3MpO1xuICAgIH1cblxuICAgIHNldFByb3ZpZGVyTWV0YUluZm8gKHN0cikge1xuICAgICAgICB0aGlzLmJyb3dzZXJJbmZvLnVzZXJBZ2VudFByb3ZpZGVyTWV0YUluZm8gPSBzdHI7XG4gICAgfVxuXG4gICAgZ2V0IHVzZXJBZ2VudCAoKSB7XG4gICAgICAgIGxldCB1c2VyQWdlbnQgPSB0aGlzLmJyb3dzZXJJbmZvLnVzZXJBZ2VudDtcblxuICAgICAgICBpZiAodGhpcy5icm93c2VySW5mby51c2VyQWdlbnRQcm92aWRlck1ldGFJbmZvKVxuICAgICAgICAgICAgdXNlckFnZW50ICs9IGAgKCR7dGhpcy5icm93c2VySW5mby51c2VyQWdlbnRQcm92aWRlck1ldGFJbmZvfSlgO1xuXG4gICAgICAgIHJldHVybiB1c2VyQWdlbnQ7XG4gICAgfVxuXG4gICAgZ2V0IGhhc1F1ZXVlZEpvYnMgKCkge1xuICAgICAgICByZXR1cm4gISF0aGlzLmpvYlF1ZXVlLmxlbmd0aDtcbiAgICB9XG5cbiAgICBnZXQgY3VycmVudEpvYiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmpvYlF1ZXVlWzBdO1xuICAgIH1cblxuICAgIC8vIEFQSVxuICAgIHJ1bkluaXRTY3JpcHQgKGNvZGUpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4gdGhpcy5pbml0U2NyaXB0c1F1ZXVlLnB1c2goeyBjb2RlLCByZXNvbHZlIH0pKTtcbiAgICB9XG5cbiAgICBhZGRKb2IgKGpvYikge1xuICAgICAgICB0aGlzLmpvYlF1ZXVlLnB1c2goam9iKTtcbiAgICB9XG5cbiAgICByZW1vdmVKb2IgKGpvYikge1xuICAgICAgICByZW1vdmUodGhpcy5qb2JRdWV1ZSwgam9iKTtcbiAgICB9XG5cbiAgICBjbG9zZSAoKSB7XG4gICAgICAgIGlmICh0aGlzLmNsb3NlZCB8fCB0aGlzLmNsb3NpbmcpXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgdGhpcy5jbG9zaW5nID0gdHJ1ZTtcblxuICAgICAgICB0aGlzLl9jbG9zZUJyb3dzZXIoKVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuYnJvd3NlckNvbm5lY3Rpb25HYXRld2F5LnN0b3BTZXJ2aW5nQ29ubmVjdGlvbih0aGlzKTtcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5oZWFydGJlYXRUaW1lb3V0KTtcblxuICAgICAgICAgICAgICAgIGRlbGV0ZSBjb25uZWN0aW9uc1t0aGlzLmlkXTtcblxuICAgICAgICAgICAgICAgIHRoaXMucmVhZHkgID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdGhpcy5jbG9zZWQgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5lbWl0KCdjbG9zZWQnKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIGVzdGFibGlzaCAodXNlckFnZW50KSB7XG4gICAgICAgIHRoaXMucmVhZHkgPSB0cnVlO1xuXG4gICAgICAgIGNvbnN0IHBhcnNlZFVzZXJBZ2VudCA9IHBhcnNlVXNlckFnZW50KHVzZXJBZ2VudCk7XG5cbiAgICAgICAgdGhpcy5icm93c2VySW5mby51c2VyQWdlbnQgICAgICAgPSBwYXJzZWRVc2VyQWdlbnQudG9TdHJpbmcoKTtcbiAgICAgICAgdGhpcy5icm93c2VySW5mby5mdWxsVXNlckFnZW50ICAgPSB1c2VyQWdlbnQ7XG4gICAgICAgIHRoaXMuYnJvd3NlckluZm8ucGFyc2VkVXNlckFnZW50ID0gcGFyc2VkVXNlckFnZW50O1xuXG4gICAgICAgIHRoaXMuX3dhaXRGb3JIZWFydGJlYXQoKTtcbiAgICAgICAgdGhpcy5lbWl0KCdyZWFkeScpO1xuICAgIH1cblxuICAgIGhlYXJ0YmVhdCAoKSB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLmhlYXJ0YmVhdFRpbWVvdXQpO1xuICAgICAgICB0aGlzLl93YWl0Rm9ySGVhcnRiZWF0KCk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGNvZGU6IHRoaXMuY2xvc2luZyA/IFNUQVRVUy5jbG9zaW5nIDogU1RBVFVTLm9rLFxuICAgICAgICAgICAgdXJsOiAgdGhpcy5jbG9zaW5nID8gdGhpcy5pZGxlVXJsIDogJydcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZW5kZXJJZGxlUGFnZSAoKSB7XG4gICAgICAgIHJldHVybiBNdXN0YWNoZS5yZW5kZXIoSURMRV9QQUdFX1RFTVBMQVRFLCB7XG4gICAgICAgICAgICB1c2VyQWdlbnQ6ICAgICAgdGhpcy51c2VyQWdlbnQsXG4gICAgICAgICAgICBzdGF0dXNVcmw6ICAgICAgdGhpcy5zdGF0dXNVcmwsXG4gICAgICAgICAgICBoZWFydGJlYXRVcmw6ICAgdGhpcy5oZWFydGJlYXRVcmwsXG4gICAgICAgICAgICBpbml0U2NyaXB0VXJsOiAgdGhpcy5pbml0U2NyaXB0VXJsLFxuICAgICAgICAgICAgcmV0cnlUZXN0UGFnZXM6ICEhdGhpcy5icm93c2VyQ29ubmVjdGlvbkdhdGV3YXkucmV0cnlUZXN0UGFnZXNcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZ2V0SW5pdFNjcmlwdCAoKSB7XG4gICAgICAgIGNvbnN0IGluaXRTY3JpcHRQcm9taXNlID0gdGhpcy5pbml0U2NyaXB0c1F1ZXVlWzBdO1xuXG4gICAgICAgIHJldHVybiB7IGNvZGU6IGluaXRTY3JpcHRQcm9taXNlID8gaW5pdFNjcmlwdFByb21pc2UuY29kZSA6IG51bGwgfTtcbiAgICB9XG5cbiAgICBoYW5kbGVJbml0U2NyaXB0UmVzdWx0IChkYXRhKSB7XG4gICAgICAgIGNvbnN0IGluaXRTY3JpcHRQcm9taXNlID0gdGhpcy5pbml0U2NyaXB0c1F1ZXVlLnNoaWZ0KCk7XG5cbiAgICAgICAgaWYgKGluaXRTY3JpcHRQcm9taXNlKVxuICAgICAgICAgICAgaW5pdFNjcmlwdFByb21pc2UucmVzb2x2ZShKU09OLnBhcnNlKGRhdGEpKTtcbiAgICB9XG5cbiAgICBpc0hlYWRsZXNzQnJvd3NlciAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByb3ZpZGVyLmlzSGVhZGxlc3NCcm93c2VyKHRoaXMuaWQpO1xuICAgIH1cblxuICAgIGFzeW5jIHJlcG9ydEpvYlJlc3VsdCAoc3RhdHVzLCBkYXRhKSB7XG4gICAgICAgIGF3YWl0IHRoaXMucHJvdmlkZXIucmVwb3J0Sm9iUmVzdWx0KHRoaXMuaWQsIHN0YXR1cywgZGF0YSk7XG4gICAgfVxuXG4gICAgYXN5bmMgZ2V0U3RhdHVzIChpc1Rlc3REb25lKSB7XG4gICAgICAgIGlmICghdGhpcy5pZGxlICYmICFpc1Rlc3REb25lKSB7XG4gICAgICAgICAgICB0aGlzLmlkbGUgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5lbWl0KCdpZGxlJyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5vcGVuZWQpIHtcbiAgICAgICAgICAgIGNvbnN0IHRlc3RSdW5VcmwgPSBhd2FpdCB0aGlzLl9nZXRUZXN0UnVuVXJsKGlzVGVzdERvbmUgfHwgdGhpcy50ZXN0UnVuQWJvcnRlZCk7XG5cbiAgICAgICAgICAgIHRoaXMudGVzdFJ1bkFib3J0ZWQgPSBmYWxzZTtcblxuICAgICAgICAgICAgaWYgKHRlc3RSdW5VcmwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmlkbGUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICByZXR1cm4geyBjbWQ6IENPTU1BTkQucnVuLCB1cmw6IHRlc3RSdW5VcmwgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7IGNtZDogQ09NTUFORC5pZGxlLCB1cmw6IHRoaXMuaWRsZVVybCB9O1xuICAgIH1cbn1cbiJdfQ==
