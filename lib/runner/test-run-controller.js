'use strict';

exports.__esModule = true;

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _asyncEventEmitter = require('../utils/async-event-emitter');

var _asyncEventEmitter2 = _interopRequireDefault(_asyncEventEmitter);

var _testcafeLegacyApi = require('testcafe-legacy-api');

var _testRun = require('../test-run');

var _testRun2 = _interopRequireDefault(_testRun);

var _sessionController = require('../test-run/session-controller');

var _sessionController2 = _interopRequireDefault(_sessionController);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const QUARANTINE_THRESHOLD = 3;
const DISCONNECT_THRESHOLD = 3;

class Quarantine {
    constructor() {
        this.attempts = [];
    }

    getFailedAttempts() {
        return this.attempts.filter(errors => !!errors.length);
    }

    getPassedAttempts() {
        return this.attempts.filter(errors => errors.length === 0);
    }

    getNextAttemptNumber() {
        return this.attempts.length + 1;
    }

    isThresholdReached(extraErrors) {
        var _getAttemptsResult = this._getAttemptsResult(extraErrors);

        const failedTimes = _getAttemptsResult.failedTimes,
              passedTimes = _getAttemptsResult.passedTimes;


        const failedThresholdReached = failedTimes >= QUARANTINE_THRESHOLD;
        const passedThresholdReached = passedTimes >= QUARANTINE_THRESHOLD;

        return failedThresholdReached || passedThresholdReached;
    }

    _getAttemptsResult(extraErrors) {
        let failedTimes = this.getFailedAttempts().length;
        let passedTimes = this.getPassedAttempts().length;

        if (extraErrors) {
            if (extraErrors.length) failedTimes += extraErrors.length;else passedTimes += 1;
        }

        return { failedTimes, passedTimes };
    }
}

class TestRunController extends _asyncEventEmitter2.default {
    constructor(test, index, proxy, screenshots, warningLog, fixtureHookController, opts) {
        super();

        this.test = test;
        this.index = index;
        this.opts = opts;

        this.proxy = proxy;
        this.screenshots = screenshots;
        this.warningLog = warningLog;
        this.fixtureHookController = fixtureHookController;

        this.TestRunCtor = TestRunController._getTestRunCtor(test, opts);

        this.testRun = null;
        this.done = false;
        this.quarantine = null;
        this.disconnectionCount = 0;

        if (this.opts.quarantineMode) this.quarantine = new Quarantine();
    }

    static _getTestRunCtor(test, opts) {
        if (opts.TestRunCtor) return opts.TestRunCtor;

        return test.isLegacy ? _testcafeLegacyApi.TestRun : _testRun2.default;
    }

    _createTestRun(connection) {
        var _this = this;

        return (0, _asyncToGenerator3.default)(function* () {
            const screenshotCapturer = _this.screenshots.createCapturerFor(_this.test, _this.index, _this.quarantine, connection, _this.warningLog);
            const TestRunCtor = _this.TestRunCtor;

            _this.testRun = new TestRunCtor(_this.test, connection, screenshotCapturer, _this.warningLog, _this.opts);

            if (_this.testRun.addQuarantineInfo) _this.testRun.addQuarantineInfo(_this.quarantine);

            if (!_this.quarantine || _this._isFirstQuarantineAttempt()) {
                yield _this.emit('test-run-create', {
                    testRun: _this.testRun,
                    legacy: TestRunCtor === _testcafeLegacyApi.TestRun,
                    test: _this.test,
                    index: _this.index,
                    quarantine: _this.quarantine
                });
            }

            return _this.testRun;
        })();
    }

    _endQuarantine() {
        var _this2 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            if (_this2.quarantine.attempts.length > 1) _this2.testRun.unstable = _this2.quarantine.getPassedAttempts().length > 0;

            yield _this2._emitTestRunDone();
        })();
    }

    _shouldKeepInQuarantine() {
        const errors = this.testRun.errs;
        const hasErrors = !!errors.length;
        const attempts = this.quarantine.attempts;
        const isFirstAttempt = this._isFirstQuarantineAttempt();

        attempts.push(errors);

        return isFirstAttempt ? hasErrors : !this.quarantine.isThresholdReached();
    }

    _isFirstQuarantineAttempt() {
        return this.quarantine && !this.quarantine.attempts.length;
    }

    _keepInQuarantine() {
        var _this3 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            yield _this3._restartTest();
        })();
    }

    _restartTest() {
        var _this4 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            yield _this4.emit('test-run-restart');
        })();
    }

    _testRunDoneInQuarantineMode() {
        var _this5 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            if (_this5._shouldKeepInQuarantine()) yield _this5._keepInQuarantine();else yield _this5._endQuarantine();
        })();
    }

    _testRunDone() {
        var _this6 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            if (_this6.quarantine) yield _this6._testRunDoneInQuarantineMode();else yield _this6._emitTestRunDone();
        })();
    }

    _emitTestRunDone() {
        var _this7 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            // NOTE: we should report test run completion in order they were completed in browser.
            // To keep a sequence after fixture hook execution we use completion queue.
            yield _this7.fixtureHookController.runFixtureAfterHookIfNecessary(_this7.testRun);

            _this7.done = true;

            yield _this7.emit('test-run-done');
        })();
    }

    _testRunBeforeDone() {
        var _this8 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            let raiseEvent = !_this8.quarantine;

            if (!raiseEvent) {
                const isSuccessfulQuarantineFirstAttempt = _this8._isFirstQuarantineAttempt() && !_this8.testRun.errs.length;
                const isAttemptsThresholdReached = _this8.quarantine.isThresholdReached(_this8.testRun.errs);

                raiseEvent = isSuccessfulQuarantineFirstAttempt || isAttemptsThresholdReached;
            }

            if (raiseEvent) yield _this8.emit('test-run-before-done');
        })();
    }

    _testRunDisconnected(connection) {
        var _this9 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            _this9.disconnectionCount++;

            if (_this9.disconnectionCount < DISCONNECT_THRESHOLD) {
                connection.suppressError();

                yield connection.restartBrowser();

                yield _this9._restartTest();
            }
        })();
    }

    get blocked() {
        return this.fixtureHookController.isTestBlocked(this.test);
    }

    start(connection) {
        var _this10 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            const testRun = yield _this10._createTestRun(connection);

            const hookOk = yield _this10.fixtureHookController.runFixtureBeforeHookIfNecessary(testRun);

            if (_this10.test.skip || !hookOk) {
                yield _this10.emit('test-run-start');
                yield _this10._emitTestRunDone();
                return null;
            }

            testRun.once('start', function () {
                return _this10.emit('test-run-start');
            });
            testRun.once('ready', function () {
                if (!_this10.quarantine || _this10._isFirstQuarantineAttempt()) _this10.emit('test-run-ready');
            });
            testRun.once('before-done', function () {
                return _this10._testRunBeforeDone();
            });
            testRun.once('done', function () {
                return _this10._testRunDone();
            });
            testRun.once('disconnected', function () {
                return _this10._testRunDisconnected(connection);
            });

            testRun.start();

            return _sessionController2.default.getSessionUrl(testRun, _this10.proxy);
        })();
    }
}
exports.default = TestRunController;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydW5uZXIvdGVzdC1ydW4tY29udHJvbGxlci5qcyJdLCJuYW1lcyI6WyJRVUFSQU5USU5FX1RIUkVTSE9MRCIsIkRJU0NPTk5FQ1RfVEhSRVNIT0xEIiwiUXVhcmFudGluZSIsImNvbnN0cnVjdG9yIiwiYXR0ZW1wdHMiLCJnZXRGYWlsZWRBdHRlbXB0cyIsImZpbHRlciIsImVycm9ycyIsImxlbmd0aCIsImdldFBhc3NlZEF0dGVtcHRzIiwiZ2V0TmV4dEF0dGVtcHROdW1iZXIiLCJpc1RocmVzaG9sZFJlYWNoZWQiLCJleHRyYUVycm9ycyIsIl9nZXRBdHRlbXB0c1Jlc3VsdCIsImZhaWxlZFRpbWVzIiwicGFzc2VkVGltZXMiLCJmYWlsZWRUaHJlc2hvbGRSZWFjaGVkIiwicGFzc2VkVGhyZXNob2xkUmVhY2hlZCIsIlRlc3RSdW5Db250cm9sbGVyIiwidGVzdCIsImluZGV4IiwicHJveHkiLCJzY3JlZW5zaG90cyIsIndhcm5pbmdMb2ciLCJmaXh0dXJlSG9va0NvbnRyb2xsZXIiLCJvcHRzIiwiVGVzdFJ1bkN0b3IiLCJfZ2V0VGVzdFJ1bkN0b3IiLCJ0ZXN0UnVuIiwiZG9uZSIsInF1YXJhbnRpbmUiLCJkaXNjb25uZWN0aW9uQ291bnQiLCJxdWFyYW50aW5lTW9kZSIsImlzTGVnYWN5IiwiX2NyZWF0ZVRlc3RSdW4iLCJjb25uZWN0aW9uIiwic2NyZWVuc2hvdENhcHR1cmVyIiwiY3JlYXRlQ2FwdHVyZXJGb3IiLCJhZGRRdWFyYW50aW5lSW5mbyIsIl9pc0ZpcnN0UXVhcmFudGluZUF0dGVtcHQiLCJlbWl0IiwibGVnYWN5IiwiX2VuZFF1YXJhbnRpbmUiLCJ1bnN0YWJsZSIsIl9lbWl0VGVzdFJ1bkRvbmUiLCJfc2hvdWxkS2VlcEluUXVhcmFudGluZSIsImVycnMiLCJoYXNFcnJvcnMiLCJpc0ZpcnN0QXR0ZW1wdCIsInB1c2giLCJfa2VlcEluUXVhcmFudGluZSIsIl9yZXN0YXJ0VGVzdCIsIl90ZXN0UnVuRG9uZUluUXVhcmFudGluZU1vZGUiLCJfdGVzdFJ1bkRvbmUiLCJydW5GaXh0dXJlQWZ0ZXJIb29rSWZOZWNlc3NhcnkiLCJfdGVzdFJ1bkJlZm9yZURvbmUiLCJyYWlzZUV2ZW50IiwiaXNTdWNjZXNzZnVsUXVhcmFudGluZUZpcnN0QXR0ZW1wdCIsImlzQXR0ZW1wdHNUaHJlc2hvbGRSZWFjaGVkIiwiX3Rlc3RSdW5EaXNjb25uZWN0ZWQiLCJzdXBwcmVzc0Vycm9yIiwicmVzdGFydEJyb3dzZXIiLCJibG9ja2VkIiwiaXNUZXN0QmxvY2tlZCIsInN0YXJ0IiwiaG9va09rIiwicnVuRml4dHVyZUJlZm9yZUhvb2tJZk5lY2Vzc2FyeSIsInNraXAiLCJvbmNlIiwiZ2V0U2Vzc2lvblVybCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQTs7OztBQUNBOztBQUNBOzs7O0FBQ0E7Ozs7OztBQUVBLE1BQU1BLHVCQUF1QixDQUE3QjtBQUNBLE1BQU1DLHVCQUF1QixDQUE3Qjs7QUFFQSxNQUFNQyxVQUFOLENBQWlCO0FBQ2JDLGtCQUFlO0FBQ1gsYUFBS0MsUUFBTCxHQUFnQixFQUFoQjtBQUNIOztBQUVEQyx3QkFBcUI7QUFDakIsZUFBTyxLQUFLRCxRQUFMLENBQWNFLE1BQWQsQ0FBcUJDLFVBQVUsQ0FBQyxDQUFDQSxPQUFPQyxNQUF4QyxDQUFQO0FBQ0g7O0FBRURDLHdCQUFxQjtBQUNqQixlQUFPLEtBQUtMLFFBQUwsQ0FBY0UsTUFBZCxDQUFxQkMsVUFBVUEsT0FBT0MsTUFBUCxLQUFrQixDQUFqRCxDQUFQO0FBQ0g7O0FBRURFLDJCQUF3QjtBQUNwQixlQUFPLEtBQUtOLFFBQUwsQ0FBY0ksTUFBZCxHQUF1QixDQUE5QjtBQUNIOztBQUVERyx1QkFBb0JDLFdBQXBCLEVBQWlDO0FBQUEsaUNBQ1EsS0FBS0Msa0JBQUwsQ0FBd0JELFdBQXhCLENBRFI7O0FBQUEsY0FDckJFLFdBRHFCLHNCQUNyQkEsV0FEcUI7QUFBQSxjQUNSQyxXQURRLHNCQUNSQSxXQURROzs7QUFHN0IsY0FBTUMseUJBQXlCRixlQUFlZCxv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LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEFzeW5jRXZlbnRFbWl0dGVyIGZyb20gJy4uL3V0aWxzL2FzeW5jLWV2ZW50LWVtaXR0ZXInO1xuaW1wb3J0IHsgVGVzdFJ1biBhcyBMZWdhY3lUZXN0UnVuIH0gZnJvbSAndGVzdGNhZmUtbGVnYWN5LWFwaSc7XG5pbXBvcnQgVGVzdFJ1biBmcm9tICcuLi90ZXN0LXJ1bic7XG5pbXBvcnQgU2Vzc2lvbkNvbnRyb2xsZXIgZnJvbSAnLi4vdGVzdC1ydW4vc2Vzc2lvbi1jb250cm9sbGVyJztcblxuY29uc3QgUVVBUkFOVElORV9USFJFU0hPTEQgPSAzO1xuY29uc3QgRElTQ09OTkVDVF9USFJFU0hPTEQgPSAzO1xuXG5jbGFzcyBRdWFyYW50aW5lIHtcbiAgICBjb25zdHJ1Y3RvciAoKSB7XG4gICAgICAgIHRoaXMuYXR0ZW1wdHMgPSBbXTtcbiAgICB9XG5cbiAgICBnZXRGYWlsZWRBdHRlbXB0cyAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmF0dGVtcHRzLmZpbHRlcihlcnJvcnMgPT4gISFlcnJvcnMubGVuZ3RoKTtcbiAgICB9XG5cbiAgICBnZXRQYXNzZWRBdHRlbXB0cyAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmF0dGVtcHRzLmZpbHRlcihlcnJvcnMgPT4gZXJyb3JzLmxlbmd0aCA9PT0gMCk7XG4gICAgfVxuXG4gICAgZ2V0TmV4dEF0dGVtcHROdW1iZXIgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hdHRlbXB0cy5sZW5ndGggKyAxO1xuICAgIH1cblxuICAgIGlzVGhyZXNob2xkUmVhY2hlZCAoZXh0cmFFcnJvcnMpIHtcbiAgICAgICAgY29uc3QgeyBmYWlsZWRUaW1lcywgcGFzc2VkVGltZXMgfSA9IHRoaXMuX2dldEF0dGVtcHRzUmVzdWx0KGV4dHJhRXJyb3JzKTtcblxuICAgICAgICBjb25zdCBmYWlsZWRUaHJlc2hvbGRSZWFjaGVkID0gZmFpbGVkVGltZXMgPj0gUVVBUkFOVElORV9USFJFU0hPTEQ7XG4gICAgICAgIGNvbnN0IHBhc3NlZFRocmVzaG9sZFJlYWNoZWQgPSBwYXNzZWRUaW1lcyA+PSBRVUFSQU5USU5FX1RIUkVTSE9MRDtcblxuICAgICAgICByZXR1cm4gZmFpbGVkVGhyZXNob2xkUmVhY2hlZCB8fCBwYXNzZWRUaHJlc2hvbGRSZWFjaGVkO1xuICAgIH1cblxuICAgIF9nZXRBdHRlbXB0c1Jlc3VsdCAoZXh0cmFFcnJvcnMpIHtcbiAgICAgICAgbGV0IGZhaWxlZFRpbWVzID0gdGhpcy5nZXRGYWlsZWRBdHRlbXB0cygpLmxlbmd0aDtcbiAgICAgICAgbGV0IHBhc3NlZFRpbWVzID0gdGhpcy5nZXRQYXNzZWRBdHRlbXB0cygpLmxlbmd0aDtcblxuICAgICAgICBpZiAoZXh0cmFFcnJvcnMpIHtcbiAgICAgICAgICAgIGlmIChleHRyYUVycm9ycy5sZW5ndGgpXG4gICAgICAgICAgICAgICAgZmFpbGVkVGltZXMgKz0gZXh0cmFFcnJvcnMubGVuZ3RoO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHBhc3NlZFRpbWVzICs9IDE7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4geyBmYWlsZWRUaW1lcywgcGFzc2VkVGltZXMgfTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRlc3RSdW5Db250cm9sbGVyIGV4dGVuZHMgQXN5bmNFdmVudEVtaXR0ZXIge1xuICAgIGNvbnN0cnVjdG9yICh0ZXN0LCBpbmRleCwgcHJveHksIHNjcmVlbnNob3RzLCB3YXJuaW5nTG9nLCBmaXh0dXJlSG9va0NvbnRyb2xsZXIsIG9wdHMpIHtcbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICB0aGlzLnRlc3QgID0gdGVzdDtcbiAgICAgICAgdGhpcy5pbmRleCA9IGluZGV4O1xuICAgICAgICB0aGlzLm9wdHMgID0gb3B0cztcblxuICAgICAgICB0aGlzLnByb3h5ICAgICAgICAgICAgICAgICA9IHByb3h5O1xuICAgICAgICB0aGlzLnNjcmVlbnNob3RzICAgICAgICAgICA9IHNjcmVlbnNob3RzO1xuICAgICAgICB0aGlzLndhcm5pbmdMb2cgICAgICAgICAgICA9IHdhcm5pbmdMb2c7XG4gICAgICAgIHRoaXMuZml4dHVyZUhvb2tDb250cm9sbGVyID0gZml4dHVyZUhvb2tDb250cm9sbGVyO1xuXG4gICAgICAgIHRoaXMuVGVzdFJ1bkN0b3IgPSBUZXN0UnVuQ29udHJvbGxlci5fZ2V0VGVzdFJ1bkN0b3IodGVzdCwgb3B0cyk7XG5cbiAgICAgICAgdGhpcy50ZXN0UnVuICAgICAgICAgICAgPSBudWxsO1xuICAgICAgICB0aGlzLmRvbmUgICAgICAgICAgICAgICA9IGZhbHNlO1xuICAgICAgICB0aGlzLnF1YXJhbnRpbmUgICAgICAgICA9IG51bGw7XG4gICAgICAgIHRoaXMuZGlzY29ubmVjdGlvbkNvdW50ID0gMDtcblxuICAgICAgICBpZiAodGhpcy5vcHRzLnF1YXJhbnRpbmVNb2RlKVxuICAgICAgICAgICAgdGhpcy5xdWFyYW50aW5lID0gbmV3IFF1YXJhbnRpbmUoKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgX2dldFRlc3RSdW5DdG9yICh0ZXN0LCBvcHRzKSB7XG4gICAgICAgIGlmIChvcHRzLlRlc3RSdW5DdG9yKVxuICAgICAgICAgICAgcmV0dXJuIG9wdHMuVGVzdFJ1bkN0b3I7XG5cbiAgICAgICAgcmV0dXJuIHRlc3QuaXNMZWdhY3kgPyBMZWdhY3lUZXN0UnVuIDogVGVzdFJ1bjtcbiAgICB9XG5cbiAgICBhc3luYyBfY3JlYXRlVGVzdFJ1biAoY29ubmVjdGlvbikge1xuICAgICAgICBjb25zdCBzY3JlZW5zaG90Q2FwdHVyZXIgPSB0aGlzLnNjcmVlbnNob3RzLmNyZWF0ZUNhcHR1cmVyRm9yKHRoaXMudGVzdCwgdGhpcy5pbmRleCwgdGhpcy5xdWFyYW50aW5lLCBjb25uZWN0aW9uLCB0aGlzLndhcm5pbmdMb2cpO1xuICAgICAgICBjb25zdCBUZXN0UnVuQ3RvciAgICAgICAgPSB0aGlzLlRlc3RSdW5DdG9yO1xuXG4gICAgICAgIHRoaXMudGVzdFJ1biA9IG5ldyBUZXN0UnVuQ3Rvcih0aGlzLnRlc3QsIGNvbm5lY3Rpb24sIHNjcmVlbnNob3RDYXB0dXJlciwgdGhpcy53YXJuaW5nTG9nLCB0aGlzLm9wdHMpO1xuXG4gICAgICAgIGlmICh0aGlzLnRlc3RSdW4uYWRkUXVhcmFudGluZUluZm8pXG4gICAgICAgICAgICB0aGlzLnRlc3RSdW4uYWRkUXVhcmFudGluZUluZm8odGhpcy5xdWFyYW50aW5lKTtcblxuICAgICAgICBpZiAoIXRoaXMucXVhcmFudGluZSB8fCB0aGlzLl9pc0ZpcnN0UXVhcmFudGluZUF0dGVtcHQoKSkge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5lbWl0KCd0ZXN0LXJ1bi1jcmVhdGUnLCB7XG4gICAgICAgICAgICAgICAgdGVzdFJ1bjogICAgdGhpcy50ZXN0UnVuLFxuICAgICAgICAgICAgICAgIGxlZ2FjeTogICAgIFRlc3RSdW5DdG9yID09PSBMZWdhY3lUZXN0UnVuLFxuICAgICAgICAgICAgICAgIHRlc3Q6ICAgICAgIHRoaXMudGVzdCxcbiAgICAgICAgICAgICAgICBpbmRleDogICAgICB0aGlzLmluZGV4LFxuICAgICAgICAgICAgICAgIHF1YXJhbnRpbmU6IHRoaXMucXVhcmFudGluZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMudGVzdFJ1bjtcbiAgICB9XG5cbiAgICBhc3luYyBfZW5kUXVhcmFudGluZSAoKSB7XG4gICAgICAgIGlmICh0aGlzLnF1YXJhbnRpbmUuYXR0ZW1wdHMubGVuZ3RoID4gMSlcbiAgICAgICAgICAgIHRoaXMudGVzdFJ1bi51bnN0YWJsZSA9IHRoaXMucXVhcmFudGluZS5nZXRQYXNzZWRBdHRlbXB0cygpLmxlbmd0aCA+IDA7XG5cbiAgICAgICAgYXdhaXQgdGhpcy5fZW1pdFRlc3RSdW5Eb25lKCk7XG4gICAgfVxuXG4gICAgX3Nob3VsZEtlZXBJblF1YXJhbnRpbmUgKCkge1xuICAgICAgICBjb25zdCBlcnJvcnMgICAgICAgICA9IHRoaXMudGVzdFJ1bi5lcnJzO1xuICAgICAgICBjb25zdCBoYXNFcnJvcnMgICAgICA9ICEhZXJyb3JzLmxlbmd0aDtcbiAgICAgICAgY29uc3QgYXR0ZW1wdHMgICAgICAgPSB0aGlzLnF1YXJhbnRpbmUuYXR0ZW1wdHM7XG4gICAgICAgIGNvbnN0IGlzRmlyc3RBdHRlbXB0ID0gdGhpcy5faXNGaXJzdFF1YXJhbnRpbmVBdHRlbXB0KCk7XG5cbiAgICAgICAgYXR0ZW1wdHMucHVzaChlcnJvcnMpO1xuXG4gICAgICAgIHJldHVybiBpc0ZpcnN0QXR0ZW1wdCA/IGhhc0Vycm9ycyA6ICF0aGlzLnF1YXJhbnRpbmUuaXNUaHJlc2hvbGRSZWFjaGVkKCk7XG4gICAgfVxuXG4gICAgX2lzRmlyc3RRdWFyYW50aW5lQXR0ZW1wdCAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnF1YXJhbnRpbmUgJiYgIXRoaXMucXVhcmFudGluZS5hdHRlbXB0cy5sZW5ndGg7XG4gICAgfVxuXG4gICAgYXN5bmMgX2tlZXBJblF1YXJhbnRpbmUgKCkge1xuICAgICAgICBhd2FpdCB0aGlzLl9yZXN0YXJ0VGVzdCgpO1xuICAgIH1cblxuICAgIGFzeW5jIF9yZXN0YXJ0VGVzdCAoKSB7XG4gICAgICAgIGF3YWl0IHRoaXMuZW1pdCgndGVzdC1ydW4tcmVzdGFydCcpO1xuICAgIH1cblxuICAgIGFzeW5jIF90ZXN0UnVuRG9uZUluUXVhcmFudGluZU1vZGUgKCkge1xuICAgICAgICBpZiAodGhpcy5fc2hvdWxkS2VlcEluUXVhcmFudGluZSgpKVxuICAgICAgICAgICAgYXdhaXQgdGhpcy5fa2VlcEluUXVhcmFudGluZSgpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBhd2FpdCB0aGlzLl9lbmRRdWFyYW50aW5lKCk7XG4gICAgfVxuXG4gICAgYXN5bmMgX3Rlc3RSdW5Eb25lICgpIHtcbiAgICAgICAgaWYgKHRoaXMucXVhcmFudGluZSlcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuX3Rlc3RSdW5Eb25lSW5RdWFyYW50aW5lTW9kZSgpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBhd2FpdCB0aGlzLl9lbWl0VGVzdFJ1bkRvbmUoKTtcbiAgICB9XG5cbiAgICBhc3luYyBfZW1pdFRlc3RSdW5Eb25lICgpIHtcbiAgICAgICAgLy8gTk9URTogd2Ugc2hvdWxkIHJlcG9ydCB0ZXN0IHJ1biBjb21wbGV0aW9uIGluIG9yZGVyIHRoZXkgd2VyZSBjb21wbGV0ZWQgaW4gYnJvd3Nlci5cbiAgICAgICAgLy8gVG8ga2VlcCBhIHNlcXVlbmNlIGFmdGVyIGZpeHR1cmUgaG9vayBleGVjdXRpb24gd2UgdXNlIGNvbXBsZXRpb24gcXVldWUuXG4gICAgICAgIGF3YWl0IHRoaXMuZml4dHVyZUhvb2tDb250cm9sbGVyLnJ1bkZpeHR1cmVBZnRlckhvb2tJZk5lY2Vzc2FyeSh0aGlzLnRlc3RSdW4pO1xuXG4gICAgICAgIHRoaXMuZG9uZSA9IHRydWU7XG5cbiAgICAgICAgYXdhaXQgdGhpcy5lbWl0KCd0ZXN0LXJ1bi1kb25lJyk7XG4gICAgfVxuXG4gICAgYXN5bmMgX3Rlc3RSdW5CZWZvcmVEb25lICgpIHtcbiAgICAgICAgbGV0IHJhaXNlRXZlbnQgPSAhdGhpcy5xdWFyYW50aW5lO1xuXG4gICAgICAgIGlmICghcmFpc2VFdmVudCkge1xuICAgICAgICAgICAgY29uc3QgaXNTdWNjZXNzZnVsUXVhcmFudGluZUZpcnN0QXR0ZW1wdCA9IHRoaXMuX2lzRmlyc3RRdWFyYW50aW5lQXR0ZW1wdCgpICYmICF0aGlzLnRlc3RSdW4uZXJycy5sZW5ndGg7XG4gICAgICAgICAgICBjb25zdCBpc0F0dGVtcHRzVGhyZXNob2xkUmVhY2hlZCAgICAgICAgID0gdGhpcy5xdWFyYW50aW5lLmlzVGhyZXNob2xkUmVhY2hlZCh0aGlzLnRlc3RSdW4uZXJycyk7XG5cbiAgICAgICAgICAgIHJhaXNlRXZlbnQgPSBpc1N1Y2Nlc3NmdWxRdWFyYW50aW5lRmlyc3RBdHRlbXB0IHx8IGlzQXR0ZW1wdHNUaHJlc2hvbGRSZWFjaGVkO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHJhaXNlRXZlbnQpXG4gICAgICAgICAgICBhd2FpdCB0aGlzLmVtaXQoJ3Rlc3QtcnVuLWJlZm9yZS1kb25lJyk7XG4gICAgfVxuXG4gICAgYXN5bmMgX3Rlc3RSdW5EaXNjb25uZWN0ZWQgKGNvbm5lY3Rpb24pIHtcbiAgICAgICAgdGhpcy5kaXNjb25uZWN0aW9uQ291bnQrKztcblxuICAgICAgICBpZiAodGhpcy5kaXNjb25uZWN0aW9uQ291bnQgPCBESVNDT05ORUNUX1RIUkVTSE9MRCkge1xuICAgICAgICAgICAgY29ubmVjdGlvbi5zdXBwcmVzc0Vycm9yKCk7XG5cbiAgICAgICAgICAgIGF3YWl0IGNvbm5lY3Rpb24ucmVzdGFydEJyb3dzZXIoKTtcblxuICAgICAgICAgICAgYXdhaXQgdGhpcy5fcmVzdGFydFRlc3QoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldCBibG9ja2VkICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZml4dHVyZUhvb2tDb250cm9sbGVyLmlzVGVzdEJsb2NrZWQodGhpcy50ZXN0KTtcbiAgICB9XG5cbiAgICBhc3luYyBzdGFydCAoY29ubmVjdGlvbikge1xuICAgICAgICBjb25zdCB0ZXN0UnVuID0gYXdhaXQgdGhpcy5fY3JlYXRlVGVzdFJ1bihjb25uZWN0aW9uKTtcblxuICAgICAgICBjb25zdCBob29rT2sgPSBhd2FpdCB0aGlzLmZpeHR1cmVIb29rQ29udHJvbGxlci5ydW5GaXh0dXJlQmVmb3JlSG9va0lmTmVjZXNzYXJ5KHRlc3RSdW4pO1xuXG4gICAgICAgIGlmICh0aGlzLnRlc3Quc2tpcCB8fCAhaG9va09rKSB7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLmVtaXQoJ3Rlc3QtcnVuLXN0YXJ0Jyk7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLl9lbWl0VGVzdFJ1bkRvbmUoKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgdGVzdFJ1bi5vbmNlKCdzdGFydCcsICgpID0+IHRoaXMuZW1pdCgndGVzdC1ydW4tc3RhcnQnKSk7XG4gICAgICAgIHRlc3RSdW4ub25jZSgncmVhZHknLCAoKSA9PiB7XG4gICAgICAgICAgICBpZiAoIXRoaXMucXVhcmFudGluZSB8fCB0aGlzLl9pc0ZpcnN0UXVhcmFudGluZUF0dGVtcHQoKSlcbiAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ3Rlc3QtcnVuLXJlYWR5Jyk7XG4gICAgICAgIH0pO1xuICAgICAgICB0ZXN0UnVuLm9uY2UoJ2JlZm9yZS1kb25lJywgKCkgPT4gdGhpcy5fdGVzdFJ1bkJlZm9yZURvbmUoKSk7XG4gICAgICAgIHRlc3RSdW4ub25jZSgnZG9uZScsICgpID0+IHRoaXMuX3Rlc3RSdW5Eb25lKCkpO1xuICAgICAgICB0ZXN0UnVuLm9uY2UoJ2Rpc2Nvbm5lY3RlZCcsICgpID0+IHRoaXMuX3Rlc3RSdW5EaXNjb25uZWN0ZWQoY29ubmVjdGlvbikpO1xuXG4gICAgICAgIHRlc3RSdW4uc3RhcnQoKTtcblxuICAgICAgICByZXR1cm4gU2Vzc2lvbkNvbnRyb2xsZXIuZ2V0U2Vzc2lvblVybCh0ZXN0UnVuLCB0aGlzLnByb3h5KTtcbiAgICB9XG59XG4iXX0=
