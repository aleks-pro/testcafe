'use strict';

exports.__esModule = true;

var _values = require('babel-runtime/core-js/object/values');

var _values2 = _interopRequireDefault(_values);

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _pinkie = require('pinkie');

var _pinkie2 = _interopRequireDefault(_pinkie);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _testRun = require('./test-run');

var _testRunState = require('./test-run-state');

var _testRunState2 = _interopRequireDefault(_testRunState);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class LiveModeTestRunController extends _events2.default {
    constructor() {
        super();

        this.testWrappers = [];
        this.expectedTestCount = 0;
        this._testRunCtor = null;

        this.testRuns = {};
        this.allTestsCompletePromise = _pinkie2.default.resolve();
        this.completeAllRunningTests = _lodash2.default;

        this.on('all-tests-complete', () => this.completeAllRunningTests());
    }

    get TestRunCtor() {
        if (!this._testRunCtor) {
            this._testRunCtor = (0, _testRun.TestRunCtorFactory)({
                created: testRun => this._onTestRunCreated(testRun),
                done: (testRun, forced) => this._onTestRunDone(testRun, forced),
                readyToNext: testRun => this._onTestRunReadyToNext(testRun)
            });
        }

        return this._testRunCtor;
    }

    setExpectedTestCount(testCount) {
        this.expectedTestCount = testCount;
    }

    _getTestRuns() {
        return [].concat(...(0, _values2.default)(this.testRuns));
    }

    run() {
        const readyToNextPromises = [];

        const testRuns = [].concat(...(0, _values2.default)(this.testRuns));

        testRuns.forEach(testRun => {
            if (testRun.finish) {
                readyToNextPromises.push(testRun.readyToNextPromise);
                testRun.finish();
            }
        });

        this.testRuns = {};

        return _pinkie2.default.all(readyToNextPromises);
    }

    stop() {
        this._getTestRuns().forEach(testRun => {
            testRun.stop();
        });
    }

    _getTestWrapper(test) {
        return this.testWrappers.find(w => w.test === test);
    }

    _onTestRunCreated(testRun) {

        this.allTestsCompletePromise = new _pinkie2.default(resolve => {
            this.completeAllRunningTests = resolve;
        });

        const connectionId = testRun.browserConnection.id;

        this.testRuns[connectionId] = this.testRuns[connectionId] || [];

        this.testRuns[connectionId].push(testRun);
    }

    _onTestRunDone(testRun) {
        testRun.state = _testRunState2.default.done;

        const hasRunningTests = this._getTestRuns().some(t => t.state !== _testRunState2.default.done);

        if (!hasRunningTests) this.emit('all-tests-complete');

        const browserTestRuns = this.testRuns[testRun.browserConnection.id];

        testRun.readyToNextPromise = new _pinkie2.default(resolve => {
            testRun.setReadyToNext = resolve;
        });

        if (browserTestRuns.length < this.expectedTestCount || browserTestRuns.some(t => t.state !== _testRunState2.default.done)) return _pinkie2.default.resolve();

        return new _pinkie2.default(resolve => {
            testRun.finish = () => {
                testRun.finish = null;
                testRun.state = _testRunState2.default.done;
                resolve();
            };
        });
    }

    _onTestRunReadyToNext(testRun) {
        testRun.setReadyToNext();
    }
}

exports.default = LiveModeTestRunController;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saXZlL3Rlc3QtcnVuLWNvbnRyb2xsZXIuanMiXSwibmFtZXMiOlsiTGl2ZU1vZGVUZXN0UnVuQ29udHJvbGxlciIsImNvbnN0cnVjdG9yIiwidGVzdFdyYXBwZXJzIiwiZXhwZWN0ZWRUZXN0Q291bnQiLCJfdGVzdFJ1bkN0b3IiLCJ0ZXN0UnVucyIsImFsbFRlc3RzQ29tcGxldGVQcm9taXNlIiwicmVzb2x2ZSIsImNvbXBsZXRlQWxsUnVubmluZ1Rlc3RzIiwib24iLCJUZXN0UnVuQ3RvciIsImNyZWF0ZWQiLCJ0ZXN0UnVuIiwiX29uVGVzdFJ1bkNyZWF0ZWQiLCJkb25lIiwiZm9yY2VkIiwiX29uVGVzdFJ1bkRvbmUiLCJyZWFkeVRvTmV4dCIsIl9vblRlc3RSdW5SZWFkeVRvTmV4dCIsInNldEV4cGVjdGVkVGVzdENvdW50IiwidGVzdENvdW50IiwiX2dldFRlc3RSdW5zIiwiY29uY2F0IiwicnVuIiwicmVhZHlUb05leHRQcm9taXNlcyIsImZvckVhY2giLCJmaW5pc2giLCJwdXNoIiwicmVhZHlUb05leHRQcm9taXNlIiwiYWxsIiwic3RvcCIsIl9nZXRUZXN0V3JhcHBlciIsInRlc3QiLCJmaW5kIiwidyIsImNvbm5lY3Rpb25JZCIsImJyb3dzZXJDb25uZWN0aW9uIiwiaWQiLCJzdGF0ZSIsImhhc1J1bm5pbmdUZXN0cyIsInNvbWUiLCJ0IiwiZW1pdCIsImJyb3dzZXJUZXN0UnVucyIsInNldFJlYWR5VG9OZXh0IiwibGVuZ3RoIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOztBQUNBOzs7Ozs7QUFFQSxNQUFNQSx5QkFBTiwwQkFBcUQ7QUFDakRDLGtCQUFlO0FBQ1g7O0FBRUEsYUFBS0MsWUFBTCxHQUF5QixFQUF6QjtBQUNBLGFBQUtDLGlCQUFMLEdBQXlCLENBQXpCO0FBQ0EsYUFBS0MsWUFBTCxHQUF5QixJQUF6Qjs7QUFFQSxhQUFLQyxRQUFMLEdBQStCLEVBQS9CO0FB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QUE5QixJQUFtRHdDLGdCQUFnQkgsSUFBaEIsQ0FBcUJDLEtBQUtBLEVBQUVILEtBQUYsS0FBWSx1QkFBZXhCLElBQXJELENBQXZELEVBQ0ksT0FBTyxpQkFBUVAsT0FBUixFQUFQOztBQUVKLGVBQU8scUJBQVlBLFdBQVc7QUFDMUJLLG9CQUFRYyxNQUFSLEdBQWlCLE1BQU07QUFDbkJkLHdCQUFRYyxNQUFSLEdBQWlCLElBQWpCO0FBQ0FkLHdCQUFRMEIsS0FBUixHQUFpQix1QkFBZXhCLElBQWhDO0FBQ0FQO0FBQ0gsYUFKRDtBQUtILFNBTk0sQ0FBUDtBQU9IOztBQUVEVywwQkFBdUJOLE9BQXZCLEVBQWdDO0FBQzVCQSxnQkFBUWdDLGNBQVI7QUFDSDtBQXhHZ0Q7O2tCQTJHdEM1Qyx5QiIsImZpbGUiOiJsaXZlL3Rlc3QtcnVuLWNvbnRyb2xsZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgRXZlbnRFbWl0dGVyIGZyb20gJ2V2ZW50cyc7XG5pbXBvcnQgUHJvbWlzZSBmcm9tICdwaW5raWUnO1xuaW1wb3J0IG5vb3AgZnJvbSAnbG9kYXNoJztcbmltcG9ydCB7IFRlc3RSdW5DdG9yRmFjdG9yeSB9IGZyb20gJy4vdGVzdC1ydW4nO1xuaW1wb3J0IFRFU1RfUlVOX1NUQVRFIGZyb20gJy4vdGVzdC1ydW4tc3RhdGUnO1xuXG5jbGFzcyBMaXZlTW9kZVRlc3RSdW5Db250cm9sbGVyIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcbiAgICBjb25zdHJ1Y3RvciAoKSB7XG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgdGhpcy50ZXN0V3JhcHBlcnMgICAgICA9IFtdO1xuICAgICAgICB0aGlzLmV4cGVjdGVkVGVzdENvdW50ID0gMDtcbiAgICAgICAgdGhpcy5fdGVzdFJ1bkN0b3IgICAgICA9IG51bGw7XG5cbiAgICAgICAgdGhpcy50ZXN0UnVucyAgICAgICAgICAgICAgICA9IHt9O1xuICAgICAgICB0aGlzLmFsbFRlc3RzQ29tcGxldGVQcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICAgIHRoaXMuY29tcGxldGVBbGxSdW5uaW5nVGVzdHMgPSBub29wO1xuXG4gICAgICAgIHRoaXMub24oJ2FsbC10ZXN0cy1jb21wbGV0ZScsICgpID0+IHRoaXMuY29tcGxldGVBbGxSdW5uaW5nVGVzdHMoKSk7XG4gICAgfVxuXG4gICAgZ2V0IFRlc3RSdW5DdG9yICgpIHtcbiAgICAgICAgaWYgKCF0aGlzLl90ZXN0UnVuQ3Rvcikge1xuICAgICAgICAgICAgdGhpcy5fdGVzdFJ1bkN0b3IgPSBUZXN0UnVuQ3RvckZhY3Rvcnkoe1xuICAgICAgICAgICAgICAgIGNyZWF0ZWQ6ICAgICB0ZXN0UnVuID0+IHRoaXMuX29uVGVzdFJ1bkNyZWF0ZWQodGVzdFJ1biksXG4gICAgICAgICAgICAgICAgZG9uZTogICAgICAgICh0ZXN0UnVuLCBmb3JjZWQpID0+IHRoaXMuX29uVGVzdFJ1bkRvbmUodGVzdFJ1biwgZm9yY2VkKSxcbiAgICAgICAgICAgICAgICByZWFkeVRvTmV4dDogdGVzdFJ1biA9PiB0aGlzLl9vblRlc3RSdW5SZWFkeVRvTmV4dCh0ZXN0UnVuKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5fdGVzdFJ1bkN0b3I7XG4gICAgfVxuXG4gICAgc2V0RXhwZWN0ZWRUZXN0Q291bnQgKHRlc3RDb3VudCkge1xuICAgICAgICB0aGlzLmV4cGVjdGVkVGVzdENvdW50ID0gdGVzdENvdW50O1xuICAgIH1cblxuICAgIF9nZXRUZXN0UnVucyAoKSB7XG4gICAgICAgIHJldHVybiBbXS5jb25jYXQoLi4uT2JqZWN0LnZhbHVlcyh0aGlzLnRlc3RSdW5zKSk7XG4gICAgfVxuXG4gICAgcnVuICgpIHtcbiAgICAgICAgY29uc3QgcmVhZHlUb05leHRQcm9taXNlcyA9IFtdO1xuXG4gICAgICAgIGNvbnN0IHRlc3RSdW5zID0gW10uY29uY2F0KC4uLk9iamVjdC52YWx1ZXModGhpcy50ZXN0UnVucykpO1xuXG4gICAgICAgIHRlc3RSdW5zLmZvckVhY2godGVzdFJ1biA9PiB7XG4gICAgICAgICAgICBpZiAodGVzdFJ1bi5maW5pc2gpIHtcbiAgICAgICAgICAgICAgICByZWFkeVRvTmV4dFByb21pc2VzLnB1c2godGVzdFJ1bi5yZWFkeVRvTmV4dFByb21pc2UpO1xuICAgICAgICAgICAgICAgIHRlc3RSdW4uZmluaXNoKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMudGVzdFJ1bnMgPSB7fTtcblxuICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwocmVhZHlUb05leHRQcm9taXNlcyk7XG4gICAgfVxuXG4gICAgc3RvcCAoKSB7XG4gICAgICAgIHRoaXMuX2dldFRlc3RSdW5zKCkuZm9yRWFjaCh0ZXN0UnVuID0+IHtcbiAgICAgICAgICAgIHRlc3RSdW4uc3RvcCgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBfZ2V0VGVzdFdyYXBwZXIgKHRlc3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGVzdFdyYXBwZXJzLmZpbmQodyA9PiB3LnRlc3QgPT09IHRlc3QpO1xuICAgIH1cblxuICAgIF9vblRlc3RSdW5DcmVhdGVkICh0ZXN0UnVuKSB7XG5cbiAgICAgICAgdGhpcy5hbGxUZXN0c0NvbXBsZXRlUHJvbWlzZSA9IG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgICAgICAgdGhpcy5jb21wbGV0ZUFsbFJ1bm5pbmdUZXN0cyA9IHJlc29sdmU7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IGNvbm5lY3Rpb25JZCA9IHRlc3RSdW4uYnJvd3NlckNvbm5lY3Rpb24uaWQ7XG5cbiAgICAgICAgdGhpcy50ZXN0UnVuc1tjb25uZWN0aW9uSWRdID0gdGhpcy50ZXN0UnVuc1tjb25uZWN0aW9uSWRdIHx8IFtdO1xuXG4gICAgICAgIHRoaXMudGVzdFJ1bnNbY29ubmVjdGlvbklkXS5wdXNoKHRlc3RSdW4pO1xuICAgIH1cblxuICAgIF9vblRlc3RSdW5Eb25lICh0ZXN0UnVuKSB7XG4gICAgICAgIHRlc3RSdW4uc3RhdGUgPSBURVNUX1JVTl9TVEFURS5kb25lO1xuXG4gICAgICAgIGNvbnN0IGhhc1J1bm5pbmdUZXN0cyA9IHRoaXMuX2dldFRlc3RSdW5zKCkuc29tZSh0ID0+IHQuc3RhdGUgIT09IFRFU1RfUlVOX1NUQVRFLmRvbmUpO1xuXG4gICAgICAgIGlmICghaGFzUnVubmluZ1Rlc3RzKVxuICAgICAgICAgICAgdGhpcy5lbWl0KCdhbGwtdGVzdHMtY29tcGxldGUnKTtcblxuICAgICAgICBjb25zdCBicm93c2VyVGVzdFJ1bnMgPSB0aGlzLnRlc3RSdW5zW3Rlc3RSdW4uYnJvd3NlckNvbm5lY3Rpb24uaWRdO1xuXG4gICAgICAgIHRlc3RSdW4ucmVhZHlUb05leHRQcm9taXNlID0gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICAgICAgICB0ZXN0UnVuLnNldFJlYWR5VG9OZXh0ID0gcmVzb2x2ZTtcbiAgICAgICAgfSk7XG5cblxuICAgICAgICBpZiAoYnJvd3NlclRlc3RSdW5zLmxlbmd0aCA8IHRoaXMuZXhwZWN0ZWRUZXN0Q291bnQgfHwgYnJvd3NlclRlc3RSdW5zLnNvbWUodCA9PiB0LnN0YXRlICE9PSBURVNUX1JVTl9TVEFURS5kb25lKSlcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcblxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICAgICAgICB0ZXN0UnVuLmZpbmlzaCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICB0ZXN0UnVuLmZpbmlzaCA9IG51bGw7XG4gICAgICAgICAgICAgICAgdGVzdFJ1bi5zdGF0ZSAgPSBURVNUX1JVTl9TVEFURS5kb25lO1xuICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIF9vblRlc3RSdW5SZWFkeVRvTmV4dCAodGVzdFJ1bikge1xuICAgICAgICB0ZXN0UnVuLnNldFJlYWR5VG9OZXh0KCk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBMaXZlTW9kZVRlc3RSdW5Db250cm9sbGVyO1xuIl19
