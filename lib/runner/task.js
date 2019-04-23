'use strict';

exports.__esModule = true;

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _lodash = require('lodash');

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _asyncEventEmitter = require('../utils/async-event-emitter');

var _asyncEventEmitter2 = _interopRequireDefault(_asyncEventEmitter);

var _browserJob = require('./browser-job');

var _browserJob2 = _interopRequireDefault(_browserJob);

var _screenshots = require('../screenshots');

var _screenshots2 = _interopRequireDefault(_screenshots);

var _videoRecorder = require('../video-recorder');

var _videoRecorder2 = _interopRequireDefault(_videoRecorder);

var _warningLog = require('../notifications/warning-log');

var _warningLog2 = _interopRequireDefault(_warningLog);

var _fixtureHookController = require('./fixture-hook-controller');

var _fixtureHookController2 = _interopRequireDefault(_fixtureHookController);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Task extends _asyncEventEmitter2.default {
    constructor(tests, browserConnectionGroups, proxy, opts) {
        super();

        this.timeStamp = (0, _moment2.default)();
        this.running = false;
        this.browserConnectionGroups = browserConnectionGroups;
        this.tests = tests;
        this.opts = opts;
        this.screenshots = new _screenshots2.default(this.opts.screenshotPath, this.opts.screenshotPathPattern);
        this.warningLog = new _warningLog2.default();

        this.fixtureHookController = new _fixtureHookController2.default(tests, browserConnectionGroups.length);
        this.pendingBrowserJobs = this._createBrowserJobs(proxy, this.opts);

        if (this.opts.videoPath) this.videoRecorders = this._createVideoRecorders(this.pendingBrowserJobs);
    }

    _assignBrowserJobEventHandlers(job) {
        var _this = this;

        job.on('test-run-start', testRun => this.emit('test-run-start', testRun));

        job.on('test-run-done', (() => {
            var _ref = (0, _asyncToGenerator3.default)(function* (testRun) {
                yield _this.emit('test-run-done', testRun);

                if (_this.opts.stopOnFirstFail && testRun.errs.length) {
                    _this.abort();
                    yield _this.emit('done');
                }
            });

            return function (_x) {
                return _ref.apply(this, arguments);
            };
        })());

        job.once('start', (0, _asyncToGenerator3.default)(function* () {
            if (!_this.running) {
                _this.running = true;
                yield _this.emit('start');
            }
        }));

        job.once('done', (0, _asyncToGenerator3.default)(function* () {
            yield _this.emit('browser-job-done', job);

            (0, _lodash.pull)(_this.pendingBrowserJobs, job);

            if (!_this.pendingBrowserJobs.length) yield _this.emit('done');
        }));
    }

    _createBrowserJobs(proxy, opts) {
        return this.browserConnectionGroups.map(browserConnectionGroup => {
            const job = new _browserJob2.default(this.tests, browserConnectionGroup, proxy, this.screenshots, this.warningLog, this.fixtureHookController, opts);

            this._assignBrowserJobEventHandlers(job);
            browserConnectionGroup.map(bc => bc.addJob(job));

            return job;
        });
    }

    _createVideoRecorders(browserJobs) {
        const videoOptions = (0, _extends3.default)({ timeStamp: this.timeStamp }, this.opts.videoOptions);

        return browserJobs.map(browserJob => new _videoRecorder2.default(browserJob, this.opts.videoPath, videoOptions, this.opts.videoEncodingOptions, this.warningLog));
    }

    // API
    abort() {
        this.pendingBrowserJobs.forEach(job => job.abort());
    }
}
exports.default = Task;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydW5uZXIvdGFzay5qcyJdLCJuYW1lcyI6WyJUYXNrIiwiY29uc3RydWN0b3IiLCJ0ZXN0cyIsImJyb3dzZXJDb25uZWN0aW9uR3JvdXBzIiwicHJveHkiLCJvcHRzIiwidGltZVN0YW1wIiwicnVubmluZyIsInNjcmVlbnNob3RzIiwic2NyZWVuc2hvdFBhdGgiLCJzY3JlZW5zaG90UGF0aFBhdHRlcm4iLCJ3YXJuaW5nTG9nIiwiZml4dHVyZUhvb2tDb250cm9sbGVyIiwibGVuZ3RoIiwicGVuZGluZ0Jyb3dzZXJKb2JzIiwiX2NyZWF0ZUJyb3dzZXJKb2JzIiwidmlkZW9QYXRoIiwidmlkZW9SZWNvcmRlcnMiLCJfY3JlYXRlVmlkZW9SZWNvcmRlcnMiLCJfYXNzaWduQnJvd3NlckpvYkV2ZW50SGFuZGxlcnMiLCJqb2IiLCJvbiIsInRlc3RSdW4iLCJlbWl0Iiwic3RvcE9uRmlyc3RGYWlsIiwiZXJycyIsImFib3J0Iiwib25jZSIsIm1hcCIsImJyb3dzZXJDb25uZWN0aW9uR3JvdXAiLCJiYyIsImFkZEpvYiIsImJyb3dzZXJKb2JzIiwidmlkZW9PcHRpb25zIiwiYnJvd3NlckpvYiIsInZpZGVvRW5jb2RpbmdPcHRpb25zIiwiZm9yRWFjaCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUE7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7OztBQUVlLE1BQU1BLElBQU4scUNBQXFDO0FBQ2hEQyxnQkFBYUMsS0FBYixFQUFvQkMsdUJBQXBCLEVBQTZDQyxLQUE3QyxFQUFvREMsSUFBcEQsRUFBMEQ7QUFDdEQ7O0FBRUEsYUFBS0MsU0FBTCxHQUErQix1QkFBL0I7QUFDQSxhQUFLQyxPQUFMLEdBQStCLEtBQS9CO0FBQ0EsYUFBS0osdUJBQUwsR0FBK0JBLHVCQUEvQjtBQUNBLGFBQUtELEtBQUwsR0FBK0JBLEtBQS9CO0FBQ0EsYUFBS0csSUFBTCxHQUErQkEsSUFBL0I7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SU0sS0FBSixFQUF2QztBQUNIO0FBcEUrQztrQkFBL0IxQixJIiwiZmlsZSI6InJ1bm5lci90YXNrLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgcHVsbCBhcyByZW1vdmUgfSBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IG1vbWVudCBmcm9tICdtb21lbnQnO1xuaW1wb3J0IEFzeW5jRXZlbnRFbWl0dGVyIGZyb20gJy4uL3V0aWxzL2FzeW5jLWV2ZW50LWVtaXR0ZXInO1xuaW1wb3J0IEJyb3dzZXJKb2IgZnJvbSAnLi9icm93c2VyLWpvYic7XG5pbXBvcnQgU2NyZWVuc2hvdHMgZnJvbSAnLi4vc2NyZWVuc2hvdHMnO1xuaW1wb3J0IFZpZGVvUmVjb3JkZXIgZnJvbSAnLi4vdmlkZW8tcmVjb3JkZXInO1xuaW1wb3J0IFdhcm5pbmdMb2cgZnJvbSAnLi4vbm90aWZpY2F0aW9ucy93YXJuaW5nLWxvZyc7XG5pbXBvcnQgRml4dHVyZUhvb2tDb250cm9sbGVyIGZyb20gJy4vZml4dHVyZS1ob29rLWNvbnRyb2xsZXInO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUYXNrIGV4dGVuZHMgQXN5bmNFdmVudEVtaXR0ZXIge1xuICAgIGNvbnN0cnVjdG9yICh0ZXN0cywgYnJvd3NlckNvbm5lY3Rpb25Hcm91cHMsIHByb3h5LCBvcHRzKSB7XG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgdGhpcy50aW1lU3RhbXAgICAgICAgICAgICAgICA9IG1vbWVudCgpO1xuICAgICAgICB0aGlzLnJ1bm5pbmcgICAgICAgICAgICAgICAgID0gZmFsc2U7XG4gICAgICAgIHRoaXMuYnJvd3NlckNvbm5lY3Rpb25Hcm91cHMgPSBicm93c2VyQ29ubmVjdGlvbkdyb3VwcztcbiAgICAgICAgdGhpcy50ZXN0cyAgICAgICAgICAgICAgICAgICA9IHRlc3RzO1xuICAgICAgICB0aGlzLm9wdHMgICAgICAgICAgICAgICAgICAgID0gb3B0cztcbiAgICAgICAgdGhpcy5zY3JlZW5zaG90cyAgICAgICAgICAgICA9IG5ldyBTY3JlZW5zaG90cyh0aGlzLm9wdHMuc2NyZWVuc2hvdFBhdGgsIHRoaXMub3B0cy5zY3JlZW5zaG90UGF0aFBhdHRlcm4pO1xuICAgICAgICB0aGlzLndhcm5pbmdMb2cgICAgICAgICAgICAgID0gbmV3IFdhcm5pbmdMb2coKTtcblxuICAgICAgICB0aGlzLmZpeHR1cmVIb29rQ29udHJvbGxlciA9IG5ldyBGaXh0dXJlSG9va0NvbnRyb2xsZXIodGVzdHMsIGJyb3dzZXJDb25uZWN0aW9uR3JvdXBzLmxlbmd0aCk7XG4gICAgICAgIHRoaXMucGVuZGluZ0Jyb3dzZXJKb2JzICAgID0gdGhpcy5fY3JlYXRlQnJvd3NlckpvYnMocHJveHksIHRoaXMub3B0cyk7XG5cbiAgICAgICAgaWYgKHRoaXMub3B0cy52aWRlb1BhdGgpXG4gICAgICAgICAgICB0aGlzLnZpZGVvUmVjb3JkZXJzID0gdGhpcy5fY3JlYXRlVmlkZW9SZWNvcmRlcnModGhpcy5wZW5kaW5nQnJvd3NlckpvYnMpO1xuICAgIH1cblxuICAgIF9hc3NpZ25Ccm93c2VySm9iRXZlbnRIYW5kbGVycyAoam9iKSB7XG4gICAgICAgIGpvYi5vbigndGVzdC1ydW4tc3RhcnQnLCB0ZXN0UnVuID0+IHRoaXMuZW1pdCgndGVzdC1ydW4tc3RhcnQnLCB0ZXN0UnVuKSk7XG5cbiAgICAgICAgam9iLm9uKCd0ZXN0LXJ1bi1kb25lJywgYXN5bmMgdGVzdFJ1biA9PiB7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLmVtaXQoJ3Rlc3QtcnVuLWRvbmUnLCB0ZXN0UnVuKTtcblxuICAgICAgICAgICAgaWYgKHRoaXMub3B0cy5zdG9wT25GaXJzdEZhaWwgJiYgdGVzdFJ1bi5lcnJzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHRoaXMuYWJvcnQoKTtcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLmVtaXQoJ2RvbmUnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgam9iLm9uY2UoJ3N0YXJ0JywgYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgaWYgKCF0aGlzLnJ1bm5pbmcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJ1bm5pbmcgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuZW1pdCgnc3RhcnQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgam9iLm9uY2UoJ2RvbmUnLCBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLmVtaXQoJ2Jyb3dzZXItam9iLWRvbmUnLCBqb2IpO1xuXG4gICAgICAgICAgICByZW1vdmUodGhpcy5wZW5kaW5nQnJvd3NlckpvYnMsIGpvYik7XG5cbiAgICAgICAgICAgIGlmICghdGhpcy5wZW5kaW5nQnJvd3NlckpvYnMubGVuZ3RoKVxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuZW1pdCgnZG9uZScpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQnJvd3NlckpvYnMgKHByb3h5LCBvcHRzKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmJyb3dzZXJDb25uZWN0aW9uR3JvdXBzLm1hcChicm93c2VyQ29ubmVjdGlvbkdyb3VwID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGpvYiA9IG5ldyBCcm93c2VySm9iKHRoaXMudGVzdHMsIGJyb3dzZXJDb25uZWN0aW9uR3JvdXAsIHByb3h5LCB0aGlzLnNjcmVlbnNob3RzLCB0aGlzLndhcm5pbmdMb2csIHRoaXMuZml4dHVyZUhvb2tDb250cm9sbGVyLCBvcHRzKTtcblxuICAgICAgICAgICAgdGhpcy5fYXNzaWduQnJvd3NlckpvYkV2ZW50SGFuZGxlcnMoam9iKTtcbiAgICAgICAgICAgIGJyb3dzZXJDb25uZWN0aW9uR3JvdXAubWFwKGJjID0+IGJjLmFkZEpvYihqb2IpKTtcblxuICAgICAgICAgICAgcmV0dXJuIGpvYjtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgX2NyZWF0ZVZpZGVvUmVjb3JkZXJzIChicm93c2VySm9icykge1xuICAgICAgICBjb25zdCB2aWRlb09wdGlvbnMgPSB7IHRpbWVTdGFtcDogdGhpcy50aW1lU3RhbXAsIC4uLnRoaXMub3B0cy52aWRlb09wdGlvbnMgfTtcblxuICAgICAgICByZXR1cm4gYnJvd3NlckpvYnMubWFwKGJyb3dzZXJKb2IgPT4gbmV3IFZpZGVvUmVjb3JkZXIoYnJvd3NlckpvYiwgdGhpcy5vcHRzLnZpZGVvUGF0aCwgdmlkZW9PcHRpb25zLCB0aGlzLm9wdHMudmlkZW9FbmNvZGluZ09wdGlvbnMsIHRoaXMud2FybmluZ0xvZykpO1xuICAgIH1cblxuICAgIC8vIEFQSVxuICAgIGFib3J0ICgpIHtcbiAgICAgICAgdGhpcy5wZW5kaW5nQnJvd3NlckpvYnMuZm9yRWFjaChqb2IgPT4gam9iLmFib3J0KCkpO1xuICAgIH1cbn1cbiJdfQ==
