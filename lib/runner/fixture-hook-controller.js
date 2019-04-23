'use strict';

exports.__esModule = true;

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _map = require('babel-runtime/core-js/map');

var _map2 = _interopRequireDefault(_map);

var _create = require('babel-runtime/core-js/object/create');

var _create2 = _interopRequireDefault(_create);

var _phase = require('../test-run/phase');

var _phase2 = _interopRequireDefault(_phase);

var _processTestFnError = require('../errors/process-test-fn-error');

var _processTestFnError2 = _interopRequireDefault(_processTestFnError);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class FixtureHookController {
    constructor(tests, browserConnectionCount) {
        this.fixtureMap = FixtureHookController._createFixtureMap(tests, browserConnectionCount);
    }

    static _ensureFixtureMapItem(fixtureMap, fixture) {
        if (!fixtureMap.has(fixture)) {
            const item = {
                started: false,
                runningFixtureBeforeHook: false,
                fixtureBeforeHookErr: null,
                pendingTestRunCount: 0,
                fixtureCtx: (0, _create2.default)(null)
            };

            fixtureMap.set(fixture, item);
        }
    }

    static _createFixtureMap(tests, browserConnectionCount) {
        return tests.reduce((fixtureMap, test) => {
            const fixture = test.fixture;

            if (!test.skip) {
                FixtureHookController._ensureFixtureMapItem(fixtureMap, fixture);

                const item = fixtureMap.get(fixture);

                item.pendingTestRunCount += browserConnectionCount;
            }

            return fixtureMap;
        }, new _map2.default());
    }

    _getFixtureMapItem(test) {
        return test.skip ? null : this.fixtureMap.get(test.fixture);
    }

    isTestBlocked(test) {
        const item = this._getFixtureMapItem(test);

        return item && item.runningFixtureBeforeHook;
    }

    runFixtureBeforeHookIfNecessary(testRun) {
        var _this = this;

        return (0, _asyncToGenerator3.default)(function* () {
            const fixture = testRun.test.fixture;
            const item = _this._getFixtureMapItem(testRun.test);

            if (item) {
                const shouldRunBeforeHook = !item.started && fixture.beforeFn;

                item.started = true;

                if (shouldRunBeforeHook) {
                    item.runningFixtureBeforeHook = true;

                    try {
                        yield fixture.beforeFn(item.fixtureCtx);
                    } catch (err) {
                        item.fixtureBeforeHookErr = (0, _processTestFnError2.default)(err);
                    }

                    item.runningFixtureBeforeHook = false;
                }

                // NOTE: fail all tests in fixture if fixture.before hook has error
                if (item.fixtureBeforeHookErr) {
                    testRun.phase = _phase2.default.inFixtureBeforeHook;

                    testRun.addError(item.fixtureBeforeHookErr);

                    return false;
                }

                testRun.fixtureCtx = item.fixtureCtx;
            }

            return true;
        })();
    }

    runFixtureAfterHookIfNecessary(testRun) {
        var _this2 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            const fixture = testRun.test.fixture;
            const item = _this2._getFixtureMapItem(testRun.test);

            if (item) {
                item.pendingTestRunCount--;

                if (item.pendingTestRunCount === 0 && fixture.afterFn) {
                    testRun.phase = _phase2.default.inFixtureAfterHook;

                    try {
                        yield fixture.afterFn(item.fixtureCtx);
                    } catch (err) {
                        testRun.addError((0, _processTestFnError2.default)(err));
                    }
                }
            }
        })();
    }
}
exports.default = FixtureHookController;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydW5uZXIvZml4dHVyZS1ob29rLWNvbnRyb2xsZXIuanMiXSwibmFtZXMiOlsiRml4dHVyZUhvb2tDb250cm9sbGVyIiwiY29uc3RydWN0b3IiLCJ0ZXN0cyIsImJyb3dzZXJDb25uZWN0aW9uQ291bnQiLCJmaXh0dXJlTWFwIiwiX2NyZWF0ZUZpeHR1cmVNYXAiLCJfZW5zdXJlRml4dHVyZU1hcEl0ZW0iLCJmaXh0dXJlIiwiaGFzIiwiaXRlbSIsInN0YXJ0ZWQiLCJydW5uaW5nRml4dHVyZUJlZm9yZUhvb2siLCJmaXh0dXJlQmVmb3JlSG9va0VyciIsInBlbmRpbmdUZXN0UnVuQ291bnQiLCJmaXh0dXJlQ3R4Iiwic2V0IiwicmVkdWNlIiwidGVzdCIsInNraXAiLCJnZXQiLCJfZ2V0Rml4dHVyZU1hcEl0ZW0iLCJpc1Rlc3RCbG9ja2VkIiwicnVuRml4dHVyZUJlZm9yZUhvb2tJZk5lY2Vzc2FyeSIsInRlc3RSdW4iLCJzaG91bGRSdW5CZWZvcmVIb29rIiwiYmVmb3JlRm4iLCJlcnIiLCJwaGFzZSIsImluRml4dHVyZUJlZm9yZUhvb2siLCJhZGRFcnJvciIsInJ1bkZpeHR1cmVBZnRlckhvb2tJZk5lY2Vzc2FyeSIsImFmdGVyRm4iLCJpbkZpeHR1cmVBZnRlckhvb2siXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7OztBQUNBOzs7Ozs7QUFFZSxNQUFNQSxxQkFBTixDQUE0QjtBQUN2Q0MsZ0JBQWFDLEtBQWIsRUFBb0JDLHNCQUFwQixFQUE0QztBQUN4QyxhQUFLQyxVQUFMLEdBQWtCSixzQkFBc0JLLGlCQUF0QixDQUF3Q0gsS0FBeEMsRUFBK0NDLHNCQUEvQyxDQUFsQjtBQUNIOztBQUVELFdBQU9HLHFCQUFQLENBQThCRixVQUE5QixFQUEwQ0csT0FBMUMsRUFBbUQ7QUFDL0MsWUFBSSxDQUFDSCxXQUFXSSxHQUFYLENBQWVELE9BQWYsQ0FBTCxFQUE4QjtBQUMxQixrQkFBTUUsT0FBTztBQUNUQyx5QkFB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QSxPQUFPWSxHQUFQLEVBQVk7QUFDUkgsZ0NBQVFNLFFBQVIsQ0FBaUIsa0NBQW1CSCxHQUFuQixDQUFqQjtBQUNIO0FBQ0o7QUFDSjtBQWpCMEM7QUFrQjlDO0FBcEdzQztrQkFBdEIxQixxQiIsImZpbGUiOiJydW5uZXIvZml4dHVyZS1ob29rLWNvbnRyb2xsZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgVEVTVF9SVU5fUEhBU0UgZnJvbSAnLi4vdGVzdC1ydW4vcGhhc2UnO1xuaW1wb3J0IHByb2Nlc3NUZXN0Rm5FcnJvciBmcm9tICcuLi9lcnJvcnMvcHJvY2Vzcy10ZXN0LWZuLWVycm9yJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRml4dHVyZUhvb2tDb250cm9sbGVyIHtcbiAgICBjb25zdHJ1Y3RvciAodGVzdHMsIGJyb3dzZXJDb25uZWN0aW9uQ291bnQpIHtcbiAgICAgICAgdGhpcy5maXh0dXJlTWFwID0gRml4dHVyZUhvb2tDb250cm9sbGVyLl9jcmVhdGVGaXh0dXJlTWFwKHRlc3RzLCBicm93c2VyQ29ubmVjdGlvbkNvdW50KTtcbiAgICB9XG5cbiAgICBzdGF0aWMgX2Vuc3VyZUZpeHR1cmVNYXBJdGVtIChmaXh0dXJlTWFwLCBmaXh0dXJlKSB7XG4gICAgICAgIGlmICghZml4dHVyZU1hcC5oYXMoZml4dHVyZSkpIHtcbiAgICAgICAgICAgIGNvbnN0IGl0ZW0gPSB7XG4gICAgICAgICAgICAgICAgc3RhcnRlZDogICAgICAgICAgICAgICAgICBmYWxzZSxcbiAgICAgICAgICAgICAgICBydW5uaW5nRml4dHVyZUJlZm9yZUhvb2s6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGZpeHR1cmVCZWZvcmVIb29rRXJyOiAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICBwZW5kaW5nVGVzdFJ1bkNvdW50OiAgICAgIDAsXG4gICAgICAgICAgICAgICAgZml4dHVyZUN0eDogICAgICAgICAgICAgICBPYmplY3QuY3JlYXRlKG51bGwpXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBmaXh0dXJlTWFwLnNldChmaXh0dXJlLCBpdGVtKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBfY3JlYXRlRml4dHVyZU1hcCAodGVzdHMsIGJyb3dzZXJDb25uZWN0aW9uQ291bnQpIHtcbiAgICAgICAgcmV0dXJuIHRlc3RzLnJlZHVjZSgoZml4dHVyZU1hcCwgdGVzdCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZml4dHVyZSA9IHRlc3QuZml4dHVyZTtcblxuICAgICAgICAgICAgaWYgKCF0ZXN0LnNraXApIHtcbiAgICAgICAgICAgICAgICBGaXh0dXJlSG9va0NvbnRyb2xsZXIuX2Vuc3VyZUZpeHR1cmVNYXBJdGVtKGZpeHR1cmVNYXAsIGZpeHR1cmUpO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgaXRlbSA9IGZpeHR1cmVNYXAuZ2V0KGZpeHR1cmUpO1xuXG4gICAgICAgICAgICAgICAgaXRlbS5wZW5kaW5nVGVzdFJ1bkNvdW50ICs9IGJyb3dzZXJDb25uZWN0aW9uQ291bnQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBmaXh0dXJlTWFwO1xuICAgICAgICB9LCBuZXcgTWFwKCkpO1xuICAgIH1cblxuICAgIF9nZXRGaXh0dXJlTWFwSXRlbSAodGVzdCkge1xuICAgICAgICByZXR1cm4gdGVzdC5za2lwID8gbnVsbCA6IHRoaXMuZml4dHVyZU1hcC5nZXQodGVzdC5maXh0dXJlKTtcbiAgICB9XG5cbiAgICBpc1Rlc3RCbG9ja2VkICh0ZXN0KSB7XG4gICAgICAgIGNvbnN0IGl0ZW0gPSB0aGlzLl9nZXRGaXh0dXJlTWFwSXRlbSh0ZXN0KTtcblxuICAgICAgICByZXR1cm4gaXRlbSAmJiBpdGVtLnJ1bm5pbmdGaXh0dXJlQmVmb3JlSG9vaztcbiAgICB9XG5cbiAgICBhc3luYyBydW5GaXh0dXJlQmVmb3JlSG9va0lmTmVjZXNzYXJ5ICh0ZXN0UnVuKSB7XG4gICAgICAgIGNvbnN0IGZpeHR1cmUgPSB0ZXN0UnVuLnRlc3QuZml4dHVyZTtcbiAgICAgICAgY29uc3QgaXRlbSAgICA9IHRoaXMuX2dldEZpeHR1cmVNYXBJdGVtKHRlc3RSdW4udGVzdCk7XG5cbiAgICAgICAgaWYgKGl0ZW0pIHtcbiAgICAgICAgICAgIGNvbnN0IHNob3VsZFJ1bkJlZm9yZUhvb2sgPSAhaXRlbS5zdGFydGVkICYmIGZpeHR1cmUuYmVmb3JlRm47XG5cbiAgICAgICAgICAgIGl0ZW0uc3RhcnRlZCA9IHRydWU7XG5cbiAgICAgICAgICAgIGlmIChzaG91bGRSdW5CZWZvcmVIb29rKSB7XG4gICAgICAgICAgICAgICAgaXRlbS5ydW5uaW5nRml4dHVyZUJlZm9yZUhvb2sgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgZml4dHVyZS5iZWZvcmVGbihpdGVtLmZpeHR1cmVDdHgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uZml4dHVyZUJlZm9yZUhvb2tFcnIgPSBwcm9jZXNzVGVzdEZuRXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpdGVtLnJ1bm5pbmdGaXh0dXJlQmVmb3JlSG9vayA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBOT1RFOiBmYWlsIGFsbCB0ZXN0cyBpbiBmaXh0dXJlIGlmIGZpeHR1cmUuYmVmb3JlIGhvb2sgaGFzIGVycm9yXG4gICAgICAgICAgICBpZiAoaXRlbS5maXh0dXJlQmVmb3JlSG9va0Vycikge1xuICAgICAgICAgICAgICAgIHRlc3RSdW4ucGhhc2UgPSBURVNUX1JVTl9QSEFTRS5pbkZpeHR1cmVCZWZvcmVIb29rO1xuXG4gICAgICAgICAgICAgICAgdGVzdFJ1bi5hZGRFcnJvcihpdGVtLmZpeHR1cmVCZWZvcmVIb29rRXJyKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGVzdFJ1bi5maXh0dXJlQ3R4ID0gaXRlbS5maXh0dXJlQ3R4O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgYXN5bmMgcnVuRml4dHVyZUFmdGVySG9va0lmTmVjZXNzYXJ5ICh0ZXN0UnVuKSB7XG4gICAgICAgIGNvbnN0IGZpeHR1cmUgPSB0ZXN0UnVuLnRlc3QuZml4dHVyZTtcbiAgICAgICAgY29uc3QgaXRlbSAgICA9IHRoaXMuX2dldEZpeHR1cmVNYXBJdGVtKHRlc3RSdW4udGVzdCk7XG5cbiAgICAgICAgaWYgKGl0ZW0pIHtcbiAgICAgICAgICAgIGl0ZW0ucGVuZGluZ1Rlc3RSdW5Db3VudC0tO1xuXG4gICAgICAgICAgICBpZiAoaXRlbS5wZW5kaW5nVGVzdFJ1bkNvdW50ID09PSAwICYmIGZpeHR1cmUuYWZ0ZXJGbikge1xuICAgICAgICAgICAgICAgIHRlc3RSdW4ucGhhc2UgPSBURVNUX1JVTl9QSEFTRS5pbkZpeHR1cmVBZnRlckhvb2s7XG5cbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCBmaXh0dXJlLmFmdGVyRm4oaXRlbS5maXh0dXJlQ3R4KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgICAgICB0ZXN0UnVuLmFkZEVycm9yKHByb2Nlc3NUZXN0Rm5FcnJvcihlcnIpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=
