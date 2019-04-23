'use strict';

exports.__esModule = true;

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _pinkie = require('pinkie');

var _pinkie2 = _interopRequireDefault(_pinkie);

var _lodash = require('lodash');

var _asyncEventEmitter = require('../utils/async-event-emitter');

var _asyncEventEmitter2 = _interopRequireDefault(_asyncEventEmitter);

var _testRunController = require('./test-run-controller');

var _testRunController2 = _interopRequireDefault(_testRunController);

var _sessionController = require('../test-run/session-controller');

var _sessionController2 = _interopRequireDefault(_sessionController);

var _browserJobResult = require('./browser-job-result');

var _browserJobResult2 = _interopRequireDefault(_browserJobResult);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Browser job
class BrowserJob extends _asyncEventEmitter2.default {
    constructor(tests, browserConnections, proxy, screenshots, warningLog, fixtureHookController, opts) {
        super();

        this.started = false;

        this.total = 0;
        this.passed = 0;
        this.opts = opts;
        this.proxy = proxy;
        this.browserConnections = browserConnections;
        this.screenshots = screenshots;
        this.warningLog = warningLog;
        this.fixtureHookController = fixtureHookController;
        this.result = null;

        this.testRunControllerQueue = tests.map((test, index) => this._createTestRunController(test, index));

        this.completionQueue = [];

        this.connectionErrorListener = error => this._setResult(_browserJobResult2.default.errored, error);

        this.browserConnections.map(bc => bc.once('error', this.connectionErrorListener));
    }

    _createTestRunController(test, index) {
        const testRunController = new _testRunController2.default(test, index + 1, this.proxy, this.screenshots, this.warningLog, this.fixtureHookController, this.opts);

        testRunController.on('test-run-create', testRunInfo => this.emit('test-run-create', testRunInfo));
        testRunController.on('test-run-start', () => this.emit('test-run-start', testRunController.testRun));
        testRunController.on('test-run-ready', () => this.emit('test-run-ready', testRunController));
        testRunController.on('test-run-restart', () => this._onTestRunRestart(testRunController));
        testRunController.on('test-run-before-done', () => this.emit('test-run-before-done', testRunController));
        testRunController.on('test-run-done', () => this._onTestRunDone(testRunController));

        return testRunController;
    }

    _setResult(status, data) {
        var _this = this;

        return (0, _asyncToGenerator3.default)(function* () {
            if (_this.result) return;

            _this.result = { status, data };

            _this.browserConnections.forEach(function (bc) {
                return bc.removeListener('error', _this.connectionErrorListener);
            });

            yield _pinkie2.default.all(_this.browserConnections.map(function (bc) {
                return bc.reportJobResult(_this.result.status, _this.result.data);
            }));
        })();
    }

    _addToCompletionQueue(testRunInfo) {
        this.completionQueue.push(testRunInfo);
    }

    _removeFromCompletionQueue(testRunInfo) {
        (0, _lodash.remove)(this.completionQueue, testRunInfo);
    }

    _onTestRunRestart(testRunController) {
        this._removeFromCompletionQueue(testRunController);
        this.testRunControllerQueue.unshift(testRunController);
    }

    _onTestRunDone(testRunController) {
        var _this2 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            _this2.total++;

            if (!testRunController.testRun.errs.length) _this2.passed++;

            while (_this2.completionQueue.length && _this2.completionQueue[0].done) {
                testRunController = _this2.completionQueue.shift();

                yield _this2.emit('test-run-done', testRunController.testRun);
            }

            if (!_this2.completionQueue.length && !_this2.hasQueuedTestRuns) {
                if (!_this2.opts.live) _sessionController2.default.closeSession(testRunController.testRun);

                _this2._setResult(_browserJobResult2.default.done, { total: _this2.total, passed: _this2.passed }).then(function () {
                    return _this2.emit('done');
                });
            }
        })();
    }

    // API
    get hasQueuedTestRuns() {
        return !!this.testRunControllerQueue.length;
    }

    popNextTestRunUrl(connection) {
        var _this3 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            while (_this3.testRunControllerQueue.length) {
                // NOTE: before hook for test run fixture is currently
                // executing, so test run is temporary blocked
                const isBlocked = _this3.testRunControllerQueue[0].blocked;
                const isConcurrency = _this3.opts.concurrency > 1;
                const hasIncompleteTestRuns = _this3.completionQueue.some(function (controller) {
                    return !controller.done;
                });

                if (isBlocked || hasIncompleteTestRuns && !isConcurrency) break;

                const testRunController = _this3.testRunControllerQueue.shift();

                _this3._addToCompletionQueue(testRunController);

                if (!_this3.started) {
                    _this3.started = true;
                    yield _this3.emit('start');
                }

                const testRunUrl = yield testRunController.start(connection);

                if (testRunUrl) return testRunUrl;
            }

            return null;
        })();
    }

    abort() {
        this.clearListeners();
        this._setResult(_browserJobResult2.default.aborted);
        this.browserConnections.map(bc => bc.removeJob(this));
    }
}
exports.default = BrowserJob;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydW5uZXIvYnJvd3Nlci1qb2IuanMiXSwibmFtZXMiOlsiQnJvd3NlckpvYiIsImNvbnN0cnVjdG9yIiwidGVzdHMiLCJicm93c2VyQ29ubmVjdGlvbnMiLCJwcm94eSIsInNjcmVlbnNob3RzIiwid2FybmluZ0xvZyIsImZpeHR1cmVIb29rQ29udHJvbGxlciIsIm9wdHMiLCJzdGFydGVkIiwidG90YWwiLCJwYXNzZWQiLCJyZXN1bHQiLCJ0ZXN0UnVuQ29udHJvbGxlclF1ZXVlIiwibWFwIiwidGVzdCIsImluZGV4IiwiX2NyZWF0ZVRlc3RSdW5Db250cm9sbGVyIiwiY29tcGxldGlvblF1ZXVlIiwiY29ubmVjdGlvbkVycm9yTGlzdGVuZXIiLCJlcnJvciIsIl9zZXRSZXN1bHQiLCJlcnJvcmVkIiwiYmMiLCJvbmNlIiwidGVzdFJ1bkNvbnRyb2xsZXIiLCJvbiIsInRlc3RSdW5JbmZvIiwiZW1pdCIsInRlc3RSdW4iLCJfb25UZXN0UnVuUmVzdGFydCIsIl9vblRlc3RSdW5Eb25lIiwic3RhdHVzIiwiZGF0YSIsImZvckVhY2giLCJyZW1vdmVMaXN0ZW5lciIsImFsbCIsInJlcG9ydEpvYlJlc3VsdCIsIl9hZGRUb0NvbXBsZXRpb25RdWV1ZSIsInB1c2giLCJfcmVtb3ZlRnJvbUNvbXBsZXRpb25RdWV1ZSIsInVuc2hpZnQiLCJlcnJzIiwibGVuZ3RoIiwiZG9uZSIsInNoaWZ0IiwiaGFzUXVldWVkVGVzdFJ1bnMiLCJsaXZlIiwiY2xvc2VTZXNzaW9uIiwidGhlbiIsInBvcE5leHRUZXN0UnVuVXJsIiwiY29ubmVjdGlvbiIsImlzQmxvY2tlZCIsImJsb2NrZWQiLCJpc0NvbmN1cnJlbmN5IiwiY29uY3VycmVuY3kiLCJoYXNJbmNvbXBsZXRlVGVzdFJ1bnMiLCJzb21lIiwiY29udHJvbGxlciIsInRlc3RSdW5VcmwiLCJzdGFydCIsImFib3J0IiwiY2xlYXJMaXN0ZW5lcnMiLCJhYm9ydGVkIiwicmVtb3ZlSm9iIl0sIm1hcHBp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QVA7QUFDUDs7QUFFRCxtQkFBTyxJQUFQO0FBMUJpQztBQTJCcEM7O0FBRURFLFlBQVM7QUFDTCxhQUFLQyxjQUFMO0FBQ0EsYUFBS3pDLFVBQUwsQ0FBZ0IsMkJBQU8wQyxPQUF2QjtBQUNBLGFBQUs1RCxrQkFBTCxDQUF3QlcsR0FBeEIsQ0FBNEJTLE1BQU1BLEdBQUd5QyxTQUFILENBQWEsSUFBYixDQUFsQztBQUNIO0FBM0hxRDtrQkFBckNoRSxVIiwiZmlsZSI6InJ1bm5lci9icm93c2VyLWpvYi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBQcm9taXNlIGZyb20gJ3BpbmtpZSc7XG5pbXBvcnQgeyByZW1vdmUgfSBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IEFzeW5jRXZlbnRFbWl0dGVyIGZyb20gJy4uL3V0aWxzL2FzeW5jLWV2ZW50LWVtaXR0ZXInO1xuaW1wb3J0IFRlc3RSdW5Db250cm9sbGVyIGZyb20gJy4vdGVzdC1ydW4tY29udHJvbGxlcic7XG5pbXBvcnQgU2Vzc2lvbkNvbnRyb2xsZXIgZnJvbSAnLi4vdGVzdC1ydW4vc2Vzc2lvbi1jb250cm9sbGVyJztcbmltcG9ydCBSRVNVTFQgZnJvbSAnLi9icm93c2VyLWpvYi1yZXN1bHQnO1xuXG5cbi8vIEJyb3dzZXIgam9iXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCcm93c2VySm9iIGV4dGVuZHMgQXN5bmNFdmVudEVtaXR0ZXIge1xuICAgIGNvbnN0cnVjdG9yICh0ZXN0cywgYnJvd3NlckNvbm5lY3Rpb25zLCBwcm94eSwgc2NyZWVuc2hvdHMsIHdhcm5pbmdMb2csIGZpeHR1cmVIb29rQ29udHJvbGxlciwgb3B0cykge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIHRoaXMuc3RhcnRlZCA9IGZhbHNlO1xuXG4gICAgICAgIHRoaXMudG90YWwgICAgICAgICAgICAgICAgID0gMDtcbiAgICAgICAgdGhpcy5wYXNzZWQgICAgICAgICAgICAgICAgPSAwO1xuICAgICAgICB0aGlzLm9wdHMgICAgICAgICAgICAgICAgICA9IG9wdHM7XG4gICAgICAgIHRoaXMucHJveHkgICAgICAgICAgICAgICAgID0gcHJveHk7XG4gICAgICAgIHRoaXMuYnJvd3NlckNvbm5lY3Rpb25zICAgID0gYnJvd3NlckNvbm5lY3Rpb25zO1xuICAgICAgICB0aGlzLnNjcmVlbnNob3RzICAgICAgICAgICA9IHNjcmVlbnNob3RzO1xuICAgICAgICB0aGlzLndhcm5pbmdMb2cgICAgICAgICAgICA9IHdhcm5pbmdMb2c7XG4gICAgICAgIHRoaXMuZml4dHVyZUhvb2tDb250cm9sbGVyID0gZml4dHVyZUhvb2tDb250cm9sbGVyO1xuICAgICAgICB0aGlzLnJlc3VsdCAgICAgICAgICAgICAgICA9IG51bGw7XG5cbiAgICAgICAgdGhpcy50ZXN0UnVuQ29udHJvbGxlclF1ZXVlID0gdGVzdHMubWFwKCh0ZXN0LCBpbmRleCkgPT4gdGhpcy5fY3JlYXRlVGVzdFJ1bkNvbnRyb2xsZXIodGVzdCwgaW5kZXgpKTtcblxuICAgICAgICB0aGlzLmNvbXBsZXRpb25RdWV1ZSA9IFtdO1xuXG4gICAgICAgIHRoaXMuY29ubmVjdGlvbkVycm9yTGlzdGVuZXIgPSBlcnJvciA9PiB0aGlzLl9zZXRSZXN1bHQoUkVTVUxULmVycm9yZWQsIGVycm9yKTtcblxuICAgICAgICB0aGlzLmJyb3dzZXJDb25uZWN0aW9ucy5tYXAoYmMgPT4gYmMub25jZSgnZXJyb3InLCB0aGlzLmNvbm5lY3Rpb25FcnJvckxpc3RlbmVyKSk7XG4gICAgfVxuXG4gICAgX2NyZWF0ZVRlc3RSdW5Db250cm9sbGVyICh0ZXN0LCBpbmRleCkge1xuICAgICAgICBjb25zdCB0ZXN0UnVuQ29udHJvbGxlciA9IG5ldyBUZXN0UnVuQ29udHJvbGxlcih0ZXN0LCBpbmRleCArIDEsIHRoaXMucHJveHksIHRoaXMuc2NyZWVuc2hvdHMsIHRoaXMud2FybmluZ0xvZyxcbiAgICAgICAgICAgIHRoaXMuZml4dHVyZUhvb2tDb250cm9sbGVyLCB0aGlzLm9wdHMpO1xuXG4gICAgICAgIHRlc3RSdW5Db250cm9sbGVyLm9uKCd0ZXN0LXJ1bi1jcmVhdGUnLCB0ZXN0UnVuSW5mbyA9PiB0aGlzLmVtaXQoJ3Rlc3QtcnVuLWNyZWF0ZScsIHRlc3RSdW5JbmZvKSk7XG4gICAgICAgIHRlc3RSdW5Db250cm9sbGVyLm9uKCd0ZXN0LXJ1bi1zdGFydCcsICgpID0+IHRoaXMuZW1pdCgndGVzdC1ydW4tc3RhcnQnLCB0ZXN0UnVuQ29udHJvbGxlci50ZXN0UnVuKSk7XG4gICAgICAgIHRlc3RSdW5Db250cm9sbGVyLm9uKCd0ZXN0LXJ1bi1yZWFkeScsICgpID0+IHRoaXMuZW1pdCgndGVzdC1ydW4tcmVhZHknLCB0ZXN0UnVuQ29udHJvbGxlcikpO1xuICAgICAgICB0ZXN0UnVuQ29udHJvbGxlci5vbigndGVzdC1ydW4tcmVzdGFydCcsICgpID0+IHRoaXMuX29uVGVzdFJ1blJlc3RhcnQodGVzdFJ1bkNvbnRyb2xsZXIpKTtcbiAgICAgICAgdGVzdFJ1bkNvbnRyb2xsZXIub24oJ3Rlc3QtcnVuLWJlZm9yZS1kb25lJywgKCkgPT4gdGhpcy5lbWl0KCd0ZXN0LXJ1bi1iZWZvcmUtZG9uZScsIHRlc3RSdW5Db250cm9sbGVyKSk7XG4gICAgICAgIHRlc3RSdW5Db250cm9sbGVyLm9uKCd0ZXN0LXJ1bi1kb25lJywgKCkgPT4gdGhpcy5fb25UZXN0UnVuRG9uZSh0ZXN0UnVuQ29udHJvbGxlcikpO1xuXG4gICAgICAgIHJldHVybiB0ZXN0UnVuQ29udHJvbGxlcjtcbiAgICB9XG5cbiAgICBhc3luYyBfc2V0UmVzdWx0IChzdGF0dXMsIGRhdGEpIHtcbiAgICAgICAgaWYgKHRoaXMucmVzdWx0KVxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMucmVzdWx0ID0geyBzdGF0dXMsIGRhdGEgfTtcblxuICAgICAgICB0aGlzLmJyb3dzZXJDb25uZWN0aW9ucy5mb3JFYWNoKGJjID0+IGJjLnJlbW92ZUxpc3RlbmVyKCdlcnJvcicsIHRoaXMuY29ubmVjdGlvbkVycm9yTGlzdGVuZXIpKTtcblxuICAgICAgICBhd2FpdCBQcm9taXNlLmFsbCh0aGlzLmJyb3dzZXJDb25uZWN0aW9ucy5tYXAoYmMgPT4gYmMucmVwb3J0Sm9iUmVzdWx0KHRoaXMucmVzdWx0LnN0YXR1cywgdGhpcy5yZXN1bHQuZGF0YSkpKTtcbiAgICB9XG5cbiAgICBfYWRkVG9Db21wbGV0aW9uUXVldWUgKHRlc3RSdW5JbmZvKSB7XG4gICAgICAgIHRoaXMuY29tcGxldGlvblF1ZXVlLnB1c2godGVzdFJ1bkluZm8pO1xuICAgIH1cblxuICAgIF9yZW1vdmVGcm9tQ29tcGxldGlvblF1ZXVlICh0ZXN0UnVuSW5mbykge1xuICAgICAgICByZW1vdmUodGhpcy5jb21wbGV0aW9uUXVldWUsIHRlc3RSdW5JbmZvKTtcbiAgICB9XG5cbiAgICBfb25UZXN0UnVuUmVzdGFydCAodGVzdFJ1bkNvbnRyb2xsZXIpIHtcbiAgICAgICAgdGhpcy5fcmVtb3ZlRnJvbUNvbXBsZXRpb25RdWV1ZSh0ZXN0UnVuQ29udHJvbGxlcik7XG4gICAgICAgIHRoaXMudGVzdFJ1bkNvbnRyb2xsZXJRdWV1ZS51bnNoaWZ0KHRlc3RSdW5Db250cm9sbGVyKTtcbiAgICB9XG5cbiAgICBhc3luYyBfb25UZXN0UnVuRG9uZSAodGVzdFJ1bkNvbnRyb2xsZXIpIHtcbiAgICAgICAgdGhpcy50b3RhbCsrO1xuXG4gICAgICAgIGlmICghdGVzdFJ1bkNvbnRyb2xsZXIudGVzdFJ1bi5lcnJzLmxlbmd0aClcbiAgICAgICAgICAgIHRoaXMucGFzc2VkKys7XG5cbiAgICAgICAgd2hpbGUgKHRoaXMuY29tcGxldGlvblF1ZXVlLmxlbmd0aCAmJiB0aGlzLmNvbXBsZXRpb25RdWV1ZVswXS5kb25lKSB7XG4gICAgICAgICAgICB0ZXN0UnVuQ29udHJvbGxlciA9IHRoaXMuY29tcGxldGlvblF1ZXVlLnNoaWZ0KCk7XG5cbiAgICAgICAgICAgIGF3YWl0IHRoaXMuZW1pdCgndGVzdC1ydW4tZG9uZScsIHRlc3RSdW5Db250cm9sbGVyLnRlc3RSdW4pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLmNvbXBsZXRpb25RdWV1ZS5sZW5ndGggJiYgIXRoaXMuaGFzUXVldWVkVGVzdFJ1bnMpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5vcHRzLmxpdmUpXG4gICAgICAgICAgICAgICAgU2Vzc2lvbkNvbnRyb2xsZXIuY2xvc2VTZXNzaW9uKHRlc3RSdW5Db250cm9sbGVyLnRlc3RSdW4pO1xuXG4gICAgICAgICAgICB0aGlzXG4gICAgICAgICAgICAgICAgLl9zZXRSZXN1bHQoUkVTVUxULmRvbmUsIHsgdG90YWw6IHRoaXMudG90YWwsIHBhc3NlZDogdGhpcy5wYXNzZWQgfSlcbiAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB0aGlzLmVtaXQoJ2RvbmUnKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBBUElcbiAgICBnZXQgaGFzUXVldWVkVGVzdFJ1bnMgKCkge1xuICAgICAgICByZXR1cm4gISF0aGlzLnRlc3RSdW5Db250cm9sbGVyUXVldWUubGVuZ3RoO1xuICAgIH1cblxuICAgIGFzeW5jIHBvcE5leHRUZXN0UnVuVXJsIChjb25uZWN0aW9uKSB7XG4gICAgICAgIHdoaWxlICh0aGlzLnRlc3RSdW5Db250cm9sbGVyUXVldWUubGVuZ3RoKSB7XG4gICAgICAgICAgICAvLyBOT1RFOiBiZWZvcmUgaG9vayBmb3IgdGVzdCBydW4gZml4dHVyZSBpcyBjdXJyZW50bHlcbiAgICAgICAgICAgIC8vIGV4ZWN1dGluZywgc28gdGVzdCBydW4gaXMgdGVtcG9yYXJ5IGJsb2NrZWRcbiAgICAgICAgICAgIGNvbnN0IGlzQmxvY2tlZCAgICAgICAgICAgICA9IHRoaXMudGVzdFJ1bkNvbnRyb2xsZXJRdWV1ZVswXS5ibG9ja2VkO1xuICAgICAgICAgICAgY29uc3QgaXNDb25jdXJyZW5jeSAgICAgICAgID0gdGhpcy5vcHRzLmNvbmN1cnJlbmN5ID4gMTtcbiAgICAgICAgICAgIGNvbnN0IGhhc0luY29tcGxldGVUZXN0UnVucyA9IHRoaXMuY29tcGxldGlvblF1ZXVlLnNvbWUoY29udHJvbGxlciA9PiAhY29udHJvbGxlci5kb25lKTtcblxuICAgICAgICAgICAgaWYgKGlzQmxvY2tlZCB8fCBoYXNJbmNvbXBsZXRlVGVzdFJ1bnMgJiYgIWlzQ29uY3VycmVuY3kpXG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNvbnN0IHRlc3RSdW5Db250cm9sbGVyID0gdGhpcy50ZXN0UnVuQ29udHJvbGxlclF1ZXVlLnNoaWZ0KCk7XG5cbiAgICAgICAgICAgIHRoaXMuX2FkZFRvQ29tcGxldGlvblF1ZXVlKHRlc3RSdW5Db250cm9sbGVyKTtcblxuICAgICAgICAgICAgaWYgKCF0aGlzLnN0YXJ0ZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXJ0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuZW1pdCgnc3RhcnQnKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgdGVzdFJ1blVybCA9IGF3YWl0IHRlc3RSdW5Db250cm9sbGVyLnN0YXJ0KGNvbm5lY3Rpb24pO1xuXG4gICAgICAgICAgICBpZiAodGVzdFJ1blVybClcbiAgICAgICAgICAgICAgICByZXR1cm4gdGVzdFJ1blVybDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGFib3J0ICgpIHtcbiAgICAgICAgdGhpcy5jbGVhckxpc3RlbmVycygpO1xuICAgICAgICB0aGlzLl9zZXRSZXN1bHQoUkVTVUxULmFib3J0ZWQpO1xuICAgICAgICB0aGlzLmJyb3dzZXJDb25uZWN0aW9ucy5tYXAoYmMgPT4gYmMucmVtb3ZlSm9iKHRoaXMpKTtcbiAgICB9XG59XG4iXX0=
