'use strict';

exports.__esModule = true;

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _pinkie = require('pinkie');

var _pinkie2 = _interopRequireDefault(_pinkie);

var _lodash = require('lodash');

var _isStream = require('is-stream');

var _pluginHost = require('./plugin-host');

var _pluginHost2 = _interopRequireDefault(_pluginHost);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Reporter {
    constructor(plugin, task, outStream) {
        this.plugin = new _pluginHost2.default(plugin, outStream);
        this.task = task;

        this.disposed = false;
        this.passed = 0;
        this.failed = 0;
        this.skipped = 0;
        this.testCount = task.tests.filter(test => !test.skip).length;
        this.reportQueue = Reporter._createReportQueue(task);
        this.stopOnFirstFail = task.opts.stopOnFirstFail;
        this.outStream = outStream;

        this._assignTaskEventHandlers();
    }

    static _isSpecialStream(stream) {
        return stream.isTTY || stream === process.stdout || stream === process.stderr;
    }

    static _createPendingPromise() {
        let resolver = null;

        const promise = new _pinkie2.default(resolve => {
            resolver = resolve;
        });

        promise.resolve = resolver;

        return promise;
    }

    static _createReportItem(test, runsPerTest) {
        return {
            fixture: test.fixture,
            test: test,
            screenshotPath: null,
            screenshots: [],
            quarantine: null,
            errs: [],
            warnings: [],
            unstable: false,
            startTime: null,
            testRunInfo: null,

            pendingRuns: runsPerTest,
            pendingPromise: Reporter._createPendingPromise()
        };
    }

    static _createReportQueue(task) {
        const runsPerTest = task.browserConnectionGroups.length;

        return task.tests.map(test => Reporter._createReportItem(test, runsPerTest));
    }

    static _createTestRunInfo(reportItem) {
        return {
            errs: (0, _lodash.sortBy)(reportItem.errs, ['userAgent', 'code']),
            warnings: reportItem.warnings,
            durationMs: new Date() - reportItem.startTime,
            unstable: reportItem.unstable,
            screenshotPath: reportItem.screenshotPath,
            screenshots: reportItem.screenshots,
            quarantine: reportItem.quarantine,
            skipped: reportItem.test.skip
        };
    }

    _getReportItemForTestRun(testRun) {
        return (0, _lodash.find)(this.reportQueue, i => i.test === testRun.test);
    }

    _shiftReportQueue(reportItem) {
        var _this = this;

        return (0, _asyncToGenerator3.default)(function* () {
            let currentFixture = null;
            let nextReportItem = null;

            while (_this.reportQueue.length && _this.reportQueue[0].testRunInfo) {
                reportItem = _this.reportQueue.shift();
                currentFixture = reportItem.fixture;

                yield _this.plugin.reportTestDone(reportItem.test.name, reportItem.testRunInfo, reportItem.test.meta);

                // NOTE: here we assume that tests are sorted by fixture.
                // Therefore, if the next report item has a different
                // fixture, we can report this fixture start.
                nextReportItem = _this.reportQueue[0];

                if (nextReportItem && nextReportItem.fixture !== currentFixture) yield _this.plugin.reportFixtureStart(nextReportItem.fixture.name, nextReportItem.fixture.path, nextReportItem.fixture.meta);
            }
        })();
    }

    _resolveReportItem(reportItem, testRun) {
        var _this2 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            if (_this2.task.screenshots.hasCapturedFor(testRun.test)) {
                reportItem.screenshotPath = _this2.task.screenshots.getPathFor(testRun.test);
                reportItem.screenshots = _this2.task.screenshots.getScreenshotsInfo(testRun.test);
            }

            if (testRun.quarantine) {
                reportItem.quarantine = testRun.quarantine.attempts.reduce(function (result, errors, index) {
                    const passed = !errors.length;
                    const quarantineAttempt = index + 1;

                    result[quarantineAttempt] = { passed };

                    return result;
                }, {});
            }

            if (!reportItem.testRunInfo) {
                reportItem.testRunInfo = Reporter._createTestRunInfo(reportItem);

                if (reportItem.test.skip) _this2.skipped++;else if (reportItem.errs.length) _this2.failed++;else _this2.passed++;
            }

            yield _this2._shiftReportQueue(reportItem);

            reportItem.pendingPromise.resolve();
        })();
    }

    _assignTaskEventHandlers() {
        var _this3 = this;

        const task = this.task;

        task.once('start', (0, _asyncToGenerator3.default)(function* () {
            const startTime = new Date();
            const userAgents = task.browserConnectionGroups.map(function (group) {
                return group[0].userAgent;
            });
            const first = _this3.reportQueue[0];

            yield _this3.plugin.reportTaskStart(startTime, userAgents, _this3.testCount);
            yield _this3.plugin.reportFixtureStart(first.fixture.name, first.fixture.path, first.fixture.meta);
        }));

        task.on('test-run-start', testRun => {
            const reportItem = this._getReportItemForTestRun(testRun);

            if (!reportItem.startTime) reportItem.startTime = new Date();
        });

        task.on('test-run-done', (() => {
            var _ref2 = (0, _asyncToGenerator3.default)(function* (testRun) {
                const reportItem = _this3._getReportItemForTestRun(testRun);
                const isTestRunStoppedTaskExecution = !!testRun.errs.length && _this3.stopOnFirstFail;

                reportItem.pendingRuns = isTestRunStoppedTaskExecution ? 0 : reportItem.pendingRuns - 1;
                reportItem.unstable = reportItem.unstable || testRun.unstable;
                reportItem.errs = reportItem.errs.concat(testRun.errs);
                reportItem.warnings = testRun.warningLog ? (0, _lodash.union)(reportItem.warnings, testRun.warningLog.messages) : [];

                if (!reportItem.pendingRuns) yield _this3._resolveReportItem(reportItem, testRun);

                yield reportItem.pendingPromise;
            });

            return function (_x) {
                return _ref2.apply(this, arguments);
            };
        })());

        task.once('done', (0, _asyncToGenerator3.default)(function* () {
            const endTime = new Date();

            const result = {
                passedCount: _this3.passed,
                failedCount: _this3.failed,
                skippedCount: _this3.skipped
            };

            yield _this3.plugin.reportTaskDone(endTime, _this3.passed, task.warningLog.messages, result);
        }));
    }

    dispose() {
        var _this4 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            if (_this4.disposed) return _pinkie2.default.resolve();

            _this4.disposed = true;

            if (!_this4.outStream || Reporter._isSpecialStream(_this4.outStream) || !(0, _isStream.writable)(_this4.outStream)) return _pinkie2.default.resolve();

            const streamFinishedPromise = new _pinkie2.default(function (resolve) {
                _this4.outStream.once('finish', resolve);
                _this4.outStream.once('error', resolve);
            });

            _this4.outStream.end();

            return streamFinishedPromise;
        })();
    }
}
exports.default = Reporter;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9yZXBvcnRlci9pbmRleC5qcyJdLCJuYW1lcyI6WyJSZXBvcnRlciIsImNvbnN0cnVjdG9yIiwicGx1Z2luIiwidGFzayIsIm91dFN0cmVhbSIsImRpc3Bvc2VkIiwicGFzc2VkIiwiZmFpbGVkIiwic2tpcHBlZCIsInRlc3RDb3VudCIsInRlc3RzIiwiZmlsdGVyIiwidGVzdCIsInNraXAiLCJsZW5ndGgiLCJyZXBvcnRRdWV1ZSIsIl9jcmVhdGVSZXBvcnRRdWV1ZSIsInN0b3BPbkZpcnN0RmFpbCIsIm9wdHMiLCJfYXNzaWduVGFza0V2ZW50SGFuZGxlcnMiLCJfaXNTcGVjaWFsU3RyZWFtIiwic3RyZWFtIiwiaXNUVFkiLCJwcm9jZXNzIiwic3Rkb3V0Iiwic3RkZXJyIiwiX2NyZWF0ZVBlbmRpbmdQcm9taXNlIiwicmVzb2x2ZXIiLCJwcm9taXNlIiwicmVzb2x2ZSIsIl9jcmVhdGVSZXBvcnRJdGVtIiwicnVuc1BlclRlc3QiLCJmaXh0dXJlIiwic2NyZWVuc2hvdFBhdGgiLCJzY3JlZW5zaG90cyIsInF1YXJhbnRpbmUiLCJlcnJzIiwid2FybmluZ3MiLCJ1bnN0YWJsZSIsInN0YXJ0VGltZSIsInRlc3RSdW5JbmZvIiwicGVuZGluZ1J1bnMiLCJwZW5kaW5nUHJvbWlzZSIsImJyb3dzZXJDb25uZWN0aW9uR3JvdXBzIiwibWFwIiwiX2NyZWF0ZVRlc3RSdW5JbmZvIiwicmVwb3J0SXRlbSIsImR1cmF0aW9uTXMiLCJEYXRlIiwiX2dldFJlcG9ydEl0ZW1Gb3JUZXN0UnVuIiwidGVzdFJ1biIsImkiLCJfc2hpZnRSZXBvcnRRdWV1ZSIsImN1cnJlbnRGaXh0dXJlIiwibmV4dFJlcG9ydEl0ZW0iLCJzaGlmdCIsInJlcG9ydFRlc3REb25lIiwibmFtZSIsIm1ldGEiLCJyZXBvcnRGaXh0dXJlU3RhcnQiLCJwYXRoIiwiX3Jlc29sdmVSZXBvcnRJdGVtIiwiaGFzQ2FwdHVyZWRGb3IiLCJnZXRQYXRoRm9yIiwiZ2V0U2NyZWVuc2hvdHNJbmZvIiwiYXR0ZW1wdHMiLCJyZWR1Y2UiLCJyZXN1bHQiLCJlcnJvcnMiLCJpbmRleCIsInF1YXJhbnRpbmVBdHRlbXB0Iiwib25jZSIsInVzZXJBZ2VudHMiLCJncm91cCIsInVzZXJBZ2VudCIsImZpcnN0IiwicmVwb3J0VGFza1N0YXJ0Iiwib24iLCJpc1Rlc3RSdW5TdG9wcGVkVGFza0V4ZWN1dGlvbiIsImNvbmNhdCIsIndhcm5pbmdMb2ciLCJtZXNzYWdlcyIsImVuZFRpbWUiLCJwYXNzZWRDb3VudCIsImZhaWxlZENvdW50Iiwic2tpcHBlZENvdW50IiwicmVwb3J0VGFza0RvbmUiLCJkaXNwb3NlIiwic3RyZWFtRmluaXNoZWRQcm9taXNlIiwiZW5kIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBOzs7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7OztBQUVlLE1BQU1BLFFBQU4sQ0FBZTtBQUMxQkMsZ0JBQWFDLE1BQWIsRUFBcUJDLElBQXJCLEVBQTJCQyxTQUEzQixFQUFzQztBQUNsQyxhQUFLRixNQUFMLEdBQWMseUJBQXVCQSxNQUF2QixFQUErQkUsU0FBL0IsQ0FBZDtBQUNBLGFBQUtELElBQUwsR0FBY0EsSUFBZDs7QUFFQSxhQUFLRSxRQUFMLEdBQXVCLEtBQXZCO0FBQ0EsYUFBS0MsTUFBTCxHQUF1QixDQUF2QjtBQUNBLGFBQUtDLE1BQUwsR0FBdUIsQ0FBdkI7QUFDQSxhQUFLQyxPQUFMLEdBQXVCLENBQXZCO0FBQ0EsYUFBS0MsU0FBTCxHQUF1Qk4sS0FBS08sS0FBTCxDQUFXQyxNQUFYLENBQWtCQyxRQUFRLENBQUNBLEtBQUtDLElBQWhDLEVBQXNDQyxNQUE3RDtBQUNBLGFBQUtDLFdBQUwsR0FBdUJmLFNBQVNnQixrQkFBVCxDQUE0QmIsSUFBNUIsQ0FBdkI7QUFDQSxhQUFLYyxlQUFMLEdBQXVCZCxLQUFLZSxJQUFMLENBQVVELGVBQWpDO0FBQ0EsYUFBS2IsU0FBTCxHQUF1QkEsU0FBdkI7O0FBRUEsYUFBS2Usd0JBQUw7QUFDSDs7QUFFRCxXQUFPQyxnQkFBUCxDQUF5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RixRQUFULEVBQ0ksT0FBTyxpQkFBUXdCLE9BQVIsRUFBUDs7QUFFSixtQkFBS3hCLFFBQUwsR0FBZ0IsSUFBaEI7O0FBRUEsZ0JBQUksQ0FBQyxPQUFLRCxTQUFOLElBQW1CSixTQUFTb0IsZ0JBQVQsQ0FBMEIsT0FBS2hCLFNBQS9CLENBQW5CLElBQWdFLENBQUMsd0JBQWlCLE9BQUtBLFNBQXRCLENBQXJFLEVBQ0ksT0FBTyxpQkFBUXlCLE9BQVIsRUFBUDs7QUFFSixrQkFBTTJELHdCQUF3QixxQkFBWSxtQkFBVztBQUNqRCx1QkFBS3BGLFNBQUwsQ0FBZW1FLElBQWYsQ0FBb0IsUUFBcEIsRUFBOEIxQyxPQUE5QjtBQUNBLHVCQUFLekIsU0FBTCxDQUFlbUUsSUFBZixDQUFvQixPQUFwQixFQUE2QjFDLE9BQTdCO0FBQ0gsYUFINkIsQ0FBOUI7O0FBS0EsbUJBQUt6QixTQUFMLENBQWVxRixHQUFmOztBQUVBLG1CQUFPRCxxQkFBUDtBQWhCYTtBQWlCaEI7QUEvTHlCO2tCQUFUeEYsUSIsImZpbGUiOiJyZXBvcnRlci9pbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBQcm9taXNlIGZyb20gJ3BpbmtpZSc7XG5pbXBvcnQgeyBmaW5kLCBzb3J0QnksIHVuaW9uIH0gZnJvbSAnbG9kYXNoJztcbmltcG9ydCB7IHdyaXRhYmxlIGFzIGlzV3JpdGFibGVTdHJlYW0gfSBmcm9tICdpcy1zdHJlYW0nO1xuaW1wb3J0IFJlcG9ydGVyUGx1Z2luSG9zdCBmcm9tICcuL3BsdWdpbi1ob3N0JztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVwb3J0ZXIge1xuICAgIGNvbnN0cnVjdG9yIChwbHVnaW4sIHRhc2ssIG91dFN0cmVhbSkge1xuICAgICAgICB0aGlzLnBsdWdpbiA9IG5ldyBSZXBvcnRlclBsdWdpbkhvc3QocGx1Z2luLCBvdXRTdHJlYW0pO1xuICAgICAgICB0aGlzLnRhc2sgICA9IHRhc2s7XG5cbiAgICAgICAgdGhpcy5kaXNwb3NlZCAgICAgICAgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5wYXNzZWQgICAgICAgICAgPSAwO1xuICAgICAgICB0aGlzLmZhaWxlZCAgICAgICAgICA9IDA7XG4gICAgICAgIHRoaXMuc2tpcHBlZCAgICAgICAgID0gMDtcbiAgICAgICAgdGhpcy50ZXN0Q291bnQgICAgICAgPSB0YXNrLnRlc3RzLmZpbHRlcih0ZXN0ID0+ICF0ZXN0LnNraXApLmxlbmd0aDtcbiAgICAgICAgdGhpcy5yZXBvcnRRdWV1ZSAgICAgPSBSZXBvcnRlci5fY3JlYXRlUmVwb3J0UXVldWUodGFzayk7XG4gICAgICAgIHRoaXMuc3RvcE9uRmlyc3RGYWlsID0gdGFzay5vcHRzLnN0b3BPbkZpcnN0RmFpbDtcbiAgICAgICAgdGhpcy5vdXRTdHJlYW0gICAgICAgPSBvdXRTdHJlYW07XG5cbiAgICAgICAgdGhpcy5fYXNzaWduVGFza0V2ZW50SGFuZGxlcnMoKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgX2lzU3BlY2lhbFN0cmVhbSAoc3RyZWFtKSB7XG4gICAgICAgIHJldHVybiBzdHJlYW0uaXNUVFkgfHwgc3RyZWFtID09PSBwcm9jZXNzLnN0ZG91dCB8fCBzdHJlYW0gPT09IHByb2Nlc3Muc3RkZXJyO1xuICAgIH1cblxuICAgIHN0YXRpYyBfY3JlYXRlUGVuZGluZ1Byb21pc2UgKCkge1xuICAgICAgICBsZXQgcmVzb2x2ZXIgPSBudWxsO1xuXG4gICAgICAgIGNvbnN0IHByb21pc2UgPSBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgICAgICAgIHJlc29sdmVyID0gcmVzb2x2ZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcHJvbWlzZS5yZXNvbHZlID0gcmVzb2x2ZXI7XG5cbiAgICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgfVxuXG4gICAgc3RhdGljIF9jcmVhdGVSZXBvcnRJdGVtICh0ZXN0LCBydW5zUGVyVGVzdCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZml4dHVyZTogICAgICAgIHRlc3QuZml4dHVyZSxcbiAgICAgICAgICAgIHRlc3Q6ICAgICAgICAgICB0ZXN0LFxuICAgICAgICAgICAgc2NyZWVuc2hvdFBhdGg6IG51bGwsXG4gICAgICAgICAgICBzY3JlZW5zaG90czogICAgW10sXG4gICAgICAgICAgICBxdWFyYW50aW5lOiAgICAgbnVsbCxcbiAgICAgICAgICAgIGVycnM6ICAgICAgICAgICBbXSxcbiAgICAgICAgICAgIHdhcm5pbmdzOiAgICAgICBbXSxcbiAgICAgICAgICAgIHVuc3RhYmxlOiAgICAgICBmYWxzZSxcbiAgICAgICAgICAgIHN0YXJ0VGltZTogICAgICBudWxsLFxuICAgICAgICAgICAgdGVzdFJ1bkluZm86ICAgIG51bGwsXG5cbiAgICAgICAgICAgIHBlbmRpbmdSdW5zOiAgICBydW5zUGVyVGVzdCxcbiAgICAgICAgICAgIHBlbmRpbmdQcm9taXNlOiBSZXBvcnRlci5fY3JlYXRlUGVuZGluZ1Byb21pc2UoKVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHN0YXRpYyBfY3JlYXRlUmVwb3J0UXVldWUgKHRhc2spIHtcbiAgICAgICAgY29uc3QgcnVuc1BlclRlc3QgPSB0YXNrLmJyb3dzZXJDb25uZWN0aW9uR3JvdXBzLmxlbmd0aDtcblxuICAgICAgICByZXR1cm4gdGFzay50ZXN0cy5tYXAodGVzdCA9PiBSZXBvcnRlci5fY3JlYXRlUmVwb3J0SXRlbSh0ZXN0LCBydW5zUGVyVGVzdCkpO1xuICAgIH1cblxuICAgIHN0YXRpYyBfY3JlYXRlVGVzdFJ1bkluZm8gKHJlcG9ydEl0ZW0pIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGVycnM6ICAgICAgICAgICBzb3J0QnkocmVwb3J0SXRlbS5lcnJzLCBbJ3VzZXJBZ2VudCcsICdjb2RlJ10pLFxuICAgICAgICAgICAgd2FybmluZ3M6ICAgICAgIHJlcG9ydEl0ZW0ud2FybmluZ3MsXG4gICAgICAgICAgICBkdXJhdGlvbk1zOiAgICAgbmV3IERhdGUoKSAtIHJlcG9ydEl0ZW0uc3RhcnRUaW1lLFxuICAgICAgICAgICAgdW5zdGFibGU6ICAgICAgIHJlcG9ydEl0ZW0udW5zdGFibGUsXG4gICAgICAgICAgICBzY3JlZW5zaG90UGF0aDogcmVwb3J0SXRlbS5zY3JlZW5zaG90UGF0aCxcbiAgICAgICAgICAgIHNjcmVlbnNob3RzOiAgICByZXBvcnRJdGVtLnNjcmVlbnNob3RzLFxuICAgICAgICAgICAgcXVhcmFudGluZTogICAgIHJlcG9ydEl0ZW0ucXVhcmFudGluZSxcbiAgICAgICAgICAgIHNraXBwZWQ6ICAgICAgICByZXBvcnRJdGVtLnRlc3Quc2tpcFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIF9nZXRSZXBvcnRJdGVtRm9yVGVzdFJ1biAodGVzdFJ1bikge1xuICAgICAgICByZXR1cm4gZmluZCh0aGlzLnJlcG9ydFF1ZXVlLCBpID0+IGkudGVzdCA9PT0gdGVzdFJ1bi50ZXN0KTtcbiAgICB9XG5cbiAgICBhc3luYyBfc2hpZnRSZXBvcnRRdWV1ZSAocmVwb3J0SXRlbSkge1xuICAgICAgICBsZXQgY3VycmVudEZpeHR1cmUgPSBudWxsO1xuICAgICAgICBsZXQgbmV4dFJlcG9ydEl0ZW0gPSBudWxsO1xuXG4gICAgICAgIHdoaWxlICh0aGlzLnJlcG9ydFF1ZXVlLmxlbmd0aCAmJiB0aGlzLnJlcG9ydFF1ZXVlWzBdLnRlc3RSdW5JbmZvKSB7XG4gICAgICAgICAgICByZXBvcnRJdGVtICAgICA9IHRoaXMucmVwb3J0UXVldWUuc2hpZnQoKTtcbiAgICAgICAgICAgIGN1cnJlbnRGaXh0dXJlID0gcmVwb3J0SXRlbS5maXh0dXJlO1xuXG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5yZXBvcnRUZXN0RG9uZShyZXBvcnRJdGVtLnRlc3QubmFtZSwgcmVwb3J0SXRlbS50ZXN0UnVuSW5mbywgcmVwb3J0SXRlbS50ZXN0Lm1ldGEpO1xuXG4gICAgICAgICAgICAvLyBOT1RFOiBoZXJlIHdlIGFzc3VtZSB0aGF0IHRlc3RzIGFyZSBzb3J0ZWQgYnkgZml4dHVyZS5cbiAgICAgICAgICAgIC8vIFRoZXJlZm9yZSwgaWYgdGhlIG5leHQgcmVwb3J0IGl0ZW0gaGFzIGEgZGlmZmVyZW50XG4gICAgICAgICAgICAvLyBmaXh0dXJlLCB3ZSBjYW4gcmVwb3J0IHRoaXMgZml4dHVyZSBzdGFydC5cbiAgICAgICAgICAgIG5leHRSZXBvcnRJdGVtID0gdGhpcy5yZXBvcnRRdWV1ZVswXTtcblxuICAgICAgICAgICAgaWYgKG5leHRSZXBvcnRJdGVtICYmIG5leHRSZXBvcnRJdGVtLmZpeHR1cmUgIT09IGN1cnJlbnRGaXh0dXJlKVxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnJlcG9ydEZpeHR1cmVTdGFydChuZXh0UmVwb3J0SXRlbS5maXh0dXJlLm5hbWUsIG5leHRSZXBvcnRJdGVtLmZpeHR1cmUucGF0aCwgbmV4dFJlcG9ydEl0ZW0uZml4dHVyZS5tZXRhKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFzeW5jIF9yZXNvbHZlUmVwb3J0SXRlbSAocmVwb3J0SXRlbSwgdGVzdFJ1bikge1xuICAgICAgICBpZiAodGhpcy50YXNrLnNjcmVlbnNob3RzLmhhc0NhcHR1cmVkRm9yKHRlc3RSdW4udGVzdCkpIHtcbiAgICAgICAgICAgIHJlcG9ydEl0ZW0uc2NyZWVuc2hvdFBhdGggPSB0aGlzLnRhc2suc2NyZWVuc2hvdHMuZ2V0UGF0aEZvcih0ZXN0UnVuLnRlc3QpO1xuICAgICAgICAgICAgcmVwb3J0SXRlbS5zY3JlZW5zaG90cyAgICA9IHRoaXMudGFzay5zY3JlZW5zaG90cy5nZXRTY3JlZW5zaG90c0luZm8odGVzdFJ1bi50ZXN0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0ZXN0UnVuLnF1YXJhbnRpbmUpIHtcbiAgICAgICAgICAgIHJlcG9ydEl0ZW0ucXVhcmFudGluZSA9IHRlc3RSdW4ucXVhcmFudGluZS5hdHRlbXB0cy5yZWR1Y2UoKHJlc3VsdCwgZXJyb3JzLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHBhc3NlZCAgICAgICAgICAgID0gIWVycm9ycy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgY29uc3QgcXVhcmFudGluZUF0dGVtcHQgPSBpbmRleCArIDE7XG5cbiAgICAgICAgICAgICAgICByZXN1bHRbcXVhcmFudGluZUF0dGVtcHRdID0geyBwYXNzZWQgfTtcblxuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9LCB7fSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXJlcG9ydEl0ZW0udGVzdFJ1bkluZm8pIHtcbiAgICAgICAgICAgIHJlcG9ydEl0ZW0udGVzdFJ1bkluZm8gPSBSZXBvcnRlci5fY3JlYXRlVGVzdFJ1bkluZm8ocmVwb3J0SXRlbSk7XG5cbiAgICAgICAgICAgIGlmIChyZXBvcnRJdGVtLnRlc3Quc2tpcClcbiAgICAgICAgICAgICAgICB0aGlzLnNraXBwZWQrKztcbiAgICAgICAgICAgIGVsc2UgaWYgKHJlcG9ydEl0ZW0uZXJycy5sZW5ndGgpXG4gICAgICAgICAgICAgICAgdGhpcy5mYWlsZWQrKztcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB0aGlzLnBhc3NlZCsrO1xuICAgICAgICB9XG5cbiAgICAgICAgYXdhaXQgdGhpcy5fc2hpZnRSZXBvcnRRdWV1ZShyZXBvcnRJdGVtKTtcblxuICAgICAgICByZXBvcnRJdGVtLnBlbmRpbmdQcm9taXNlLnJlc29sdmUoKTtcbiAgICB9XG5cbiAgICBfYXNzaWduVGFza0V2ZW50SGFuZGxlcnMgKCkge1xuICAgICAgICBjb25zdCB0YXNrID0gdGhpcy50YXNrO1xuXG4gICAgICAgIHRhc2sub25jZSgnc3RhcnQnLCBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzdGFydFRpbWUgID0gbmV3IERhdGUoKTtcbiAgICAgICAgICAgIGNvbnN0IHVzZXJBZ2VudHMgPSB0YXNrLmJyb3dzZXJDb25uZWN0aW9uR3JvdXBzLm1hcChncm91cCA9PiBncm91cFswXS51c2VyQWdlbnQpO1xuICAgICAgICAgICAgY29uc3QgZmlyc3QgICAgICA9IHRoaXMucmVwb3J0UXVldWVbMF07XG5cbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnJlcG9ydFRhc2tTdGFydChzdGFydFRpbWUsIHVzZXJBZ2VudHMsIHRoaXMudGVzdENvdW50KTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnJlcG9ydEZpeHR1cmVTdGFydChmaXJzdC5maXh0dXJlLm5hbWUsIGZpcnN0LmZpeHR1cmUucGF0aCwgZmlyc3QuZml4dHVyZS5tZXRhKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGFzay5vbigndGVzdC1ydW4tc3RhcnQnLCB0ZXN0UnVuID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHJlcG9ydEl0ZW0gPSB0aGlzLl9nZXRSZXBvcnRJdGVtRm9yVGVzdFJ1bih0ZXN0UnVuKTtcblxuICAgICAgICAgICAgaWYgKCFyZXBvcnRJdGVtLnN0YXJ0VGltZSlcbiAgICAgICAgICAgICAgICByZXBvcnRJdGVtLnN0YXJ0VGltZSA9IG5ldyBEYXRlKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRhc2sub24oJ3Rlc3QtcnVuLWRvbmUnLCBhc3luYyB0ZXN0UnVuID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHJlcG9ydEl0ZW0gICAgICAgICAgICAgICAgICAgID0gdGhpcy5fZ2V0UmVwb3J0SXRlbUZvclRlc3RSdW4odGVzdFJ1bik7XG4gICAgICAgICAgICBjb25zdCBpc1Rlc3RSdW5TdG9wcGVkVGFza0V4ZWN1dGlvbiA9ICEhdGVzdFJ1bi5lcnJzLmxlbmd0aCAmJiB0aGlzLnN0b3BPbkZpcnN0RmFpbDtcblxuICAgICAgICAgICAgcmVwb3J0SXRlbS5wZW5kaW5nUnVucyA9IGlzVGVzdFJ1blN0b3BwZWRUYXNrRXhlY3V0aW9uID8gMCA6IHJlcG9ydEl0ZW0ucGVuZGluZ1J1bnMgLSAxO1xuICAgICAgICAgICAgcmVwb3J0SXRlbS51bnN0YWJsZSAgICA9IHJlcG9ydEl0ZW0udW5zdGFibGUgfHwgdGVzdFJ1bi51bnN0YWJsZTtcbiAgICAgICAgICAgIHJlcG9ydEl0ZW0uZXJycyAgICAgICAgPSByZXBvcnRJdGVtLmVycnMuY29uY2F0KHRlc3RSdW4uZXJycyk7XG4gICAgICAgICAgICByZXBvcnRJdGVtLndhcm5pbmdzICAgID0gdGVzdFJ1bi53YXJuaW5nTG9nID8gdW5pb24ocmVwb3J0SXRlbS53YXJuaW5ncywgdGVzdFJ1bi53YXJuaW5nTG9nLm1lc3NhZ2VzKSA6IFtdO1xuXG4gICAgICAgICAgICBpZiAoIXJlcG9ydEl0ZW0ucGVuZGluZ1J1bnMpXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5fcmVzb2x2ZVJlcG9ydEl0ZW0ocmVwb3J0SXRlbSwgdGVzdFJ1bik7XG5cbiAgICAgICAgICAgIGF3YWl0IHJlcG9ydEl0ZW0ucGVuZGluZ1Byb21pc2U7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRhc2sub25jZSgnZG9uZScsIGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGVuZFRpbWUgPSBuZXcgRGF0ZSgpO1xuXG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSB7XG4gICAgICAgICAgICAgICAgcGFzc2VkQ291bnQ6ICB0aGlzLnBhc3NlZCxcbiAgICAgICAgICAgICAgICBmYWlsZWRDb3VudDogIHRoaXMuZmFpbGVkLFxuICAgICAgICAgICAgICAgIHNraXBwZWRDb3VudDogdGhpcy5za2lwcGVkXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5yZXBvcnRUYXNrRG9uZShlbmRUaW1lLCB0aGlzLnBhc3NlZCwgdGFzay53YXJuaW5nTG9nLm1lc3NhZ2VzLCByZXN1bHQpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhc3luYyBkaXNwb3NlICgpIHtcbiAgICAgICAgaWYgKHRoaXMuZGlzcG9zZWQpXG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG5cbiAgICAgICAgdGhpcy5kaXNwb3NlZCA9IHRydWU7XG5cbiAgICAgICAgaWYgKCF0aGlzLm91dFN0cmVhbSB8fCBSZXBvcnRlci5faXNTcGVjaWFsU3RyZWFtKHRoaXMub3V0U3RyZWFtKSB8fCAhaXNXcml0YWJsZVN0cmVhbSh0aGlzLm91dFN0cmVhbSkpXG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG5cbiAgICAgICAgY29uc3Qgc3RyZWFtRmluaXNoZWRQcm9taXNlID0gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICAgICAgICB0aGlzLm91dFN0cmVhbS5vbmNlKCdmaW5pc2gnLCByZXNvbHZlKTtcbiAgICAgICAgICAgIHRoaXMub3V0U3RyZWFtLm9uY2UoJ2Vycm9yJywgcmVzb2x2ZSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMub3V0U3RyZWFtLmVuZCgpO1xuXG4gICAgICAgIHJldHVybiBzdHJlYW1GaW5pc2hlZFByb21pc2U7XG4gICAgfVxufVxuIl19
