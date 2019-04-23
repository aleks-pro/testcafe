'use strict';

exports.__esModule = true;

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _lodash = require('lodash');

var _pinkie = require('pinkie');

var _pinkie2 = _interopRequireDefault(_pinkie);

var _compiler = require('../compiler');

var _compiler2 = _interopRequireDefault(_compiler);

var _connection = require('../browser/connection');

var _connection2 = _interopRequireDefault(_connection);

var _runtime = require('../errors/runtime');

var _pool = require('../browser/provider/pool');

var _pool2 = _interopRequireDefault(_pool);

var _types = require('../errors/types');

var _browserSet = require('./browser-set');

var _browserSet2 = _interopRequireDefault(_browserSet);

var _testedApp = require('./tested-app');

var _testedApp2 = _interopRequireDefault(_testedApp);

var _parseFileList = require('../utils/parse-file-list');

var _parseFileList2 = _interopRequireDefault(_parseFileList);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _makeDir = require('make-dir');

var _makeDir2 = _interopRequireDefault(_makeDir);

var _resolvePathRelativelyCwd = require('../utils/resolve-path-relatively-cwd');

var _resolvePathRelativelyCwd2 = _interopRequireDefault(_resolvePathRelativelyCwd);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Bootstrapper {
    constructor(browserConnectionGateway) {
        this.browserConnectionGateway = browserConnectionGateway;

        this.concurrency = null;
        this.sources = [];
        this.browsers = [];
        this.reporters = [];
        this.filter = null;
        this.appCommand = null;
        this.appInitDelay = null;
    }

    static _splitBrowserInfo(browserInfo) {
        const remotes = [];
        const automated = [];

        browserInfo.forEach(browser => {
            if (browser instanceof _connection2.default) remotes.push(browser);else automated.push(browser);
        });

        return { remotes, automated };
    }

    _getBrowserInfo() {
        var _this = this;

        return (0, _asyncToGenerator3.default)(function* () {
            if (!_this.browsers.length) throw new _runtime.GeneralError(_types.RUNTIME_ERRORS.browserNotSet);

            const browserInfo = yield _pinkie2.default.all(_this.browsers.map(function (browser) {
                return _pool2.default.getBrowserInfo(browser);
            }));

            return (0, _lodash.flatten)(browserInfo);
        })();
    }

    _createAutomatedConnections(browserInfo) {
        if (!browserInfo) return [];

        return browserInfo.map(browser => (0, _lodash.times)(this.concurrency, () => new _connection2.default(this.browserConnectionGateway, browser)));
    }

    _getBrowserConnections(browserInfo) {
        var _this2 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            var _Bootstrapper$_splitB = Bootstrapper._splitBrowserInfo(browserInfo);

            const automated = _Bootstrapper$_splitB.automated,
                  remotes = _Bootstrapper$_splitB.remotes;


            if (remotes && remotes.length % _this2.concurrency) throw new _runtime.GeneralError(_types.RUNTIME_ERRORS.cannotDivideRemotesCountByConcurrency);

            let browserConnections = _this2._createAutomatedConnections(automated);

            browserConnections = browserConnections.concat((0, _lodash.chunk)(remotes, _this2.concurrency));

            return yield _browserSet2.default.from(browserConnections);
        })();
    }

    _getTests() {
        var _this3 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            if (!_this3.sources.length) throw new _runtime.GeneralError(_types.RUNTIME_ERRORS.testSourcesNotSet);

            const parsedFileList = yield (0, _parseFileList2.default)(_this3.sources, process.cwd());
            const compiler = new _compiler2.default(parsedFileList);
            let tests = yield compiler.getTests();

            const testsWithOnlyFlag = tests.filter(function (test) {
                return test.only;
            });

            if (testsWithOnlyFlag.length) tests = testsWithOnlyFlag;

            if (_this3.filter) tests = tests.filter(function (test) {
                return _this3.filter(test.name, test.fixture.name, test.fixture.path, test.meta, test.fixture.meta);
            });

            if (!tests.length) throw new _runtime.GeneralError(_types.RUNTIME_ERRORS.noTestsToRun);

            return tests;
        })();
    }

    _ensureOutStream(outStream) {
        return (0, _asyncToGenerator3.default)(function* () {
            if (typeof outStream !== 'string') return outStream;

            const fullReporterOutputPath = (0, _resolvePathRelativelyCwd2.default)(outStream);

            yield (0, _makeDir2.default)(_path2.default.dirname(fullReporterOutputPath));

            return _fs2.default.createWriteStream(fullReporterOutputPath);
        })();
    }

    static _addDefaultReporter(reporters) {
        reporters.push({
            name: 'spec',
            file: process.stdout
        });
    }

    _getReporterPlugins() {
        var _this4 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            const stdoutReporters = (0, _lodash.filter)(_this4.reporters, function (r) {
                return (0, _lodash.isUndefined)(r.output) || r.output === process.stdout;
            });

            if (stdoutReporters.length > 1) throw new _runtime.GeneralError(_types.RUNTIME_ERRORS.multipleStdoutReporters, stdoutReporters.map(function (r) {
                return r.name;
            }).join(', '));

            if (!_this4.reporters.length) Bootstrapper._addDefaultReporter(_this4.reporters);

            return _pinkie2.default.all(_this4.reporters.map((() => {
                var _ref = (0, _asyncToGenerator3.default)(function* ({ name, output }) {
                    let pluginFactory = name;

                    const outStream = yield _this4._ensureOutStream(output);

                    if (typeof pluginFactory !== 'function') {
                        try {
                            pluginFactory = require('testcafe-reporter-' + name);
                        } catch (err) {
                            throw new _runtime.GeneralError(_types.RUNTIME_ERRORS.cannotFindReporterForAlias, name);
                        }
                    }

                    return {
                        plugin: pluginFactory(),
                        outStream
                    };
                });

                return function (_x) {
                    return _ref.apply(this, arguments);
                };
            })()));
        })();
    }

    _startTestedApp() {
        var _this5 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            if (_this5.appCommand) {
                const testedApp = new _testedApp2.default();

                yield testedApp.start(_this5.appCommand, _this5.appInitDelay);

                return testedApp;
            }

            return null;
        })();
    }

    _canUseParallelBootstrapping(browserInfo) {
        return (0, _asyncToGenerator3.default)(function* () {
            const isLocalPromises = browserInfo.map(function (browser) {
                return browser.provider.isLocalBrowser(null, browserInfo.browserName);
            });
            const isLocalBrowsers = yield _pinkie2.default.all(isLocalPromises);

            return isLocalBrowsers.every(function (result) {
                return result;
            });
        })();
    }

    _bootstrapSequence(browserInfo) {
        var _this6 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            const tests = yield _this6._getTests();
            const testedApp = yield _this6._startTestedApp();
            const browserSet = yield _this6._getBrowserConnections(browserInfo);

            return { tests, testedApp, browserSet };
        })();
    }

    _wrapBootstrappingPromise(promise) {
        return promise.then(result => ({ error: null, result })).catch(error => ({ result: null, error }));
    }

    _handleBootstrappingError([browserSetStatus, testsStatus, testedAppStatus]) {
        return (0, _asyncToGenerator3.default)(function* () {
            if (!browserSetStatus.error) yield browserSetStatus.result.dispose();

            if (!testedAppStatus.error && testedAppStatus.result) yield testedAppStatus.result.kill();

            if (testsStatus.error) throw testsStatus.error;else if (testedAppStatus.error) throw testedAppStatus.error;else throw browserSetStatus.error;
        })();
    }

    _bootstrapParallel(browserInfo) {
        var _this7 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            let bootstrappingPromises = [_this7._getBrowserConnections(browserInfo), _this7._getTests(), _this7._startTestedApp()];

            bootstrappingPromises = bootstrappingPromises.map(function (promise) {
                return _this7._wrapBootstrappingPromise(promise);
            });

            const bootstrappingStatuses = yield _pinkie2.default.all(bootstrappingPromises);

            if (bootstrappingStatuses.some(function (status) {
                return status.error;
            })) yield _this7._handleBootstrappingError(bootstrappingStatuses);

            var _bootstrappingStatuse = bootstrappingStatuses.map(function (status) {
                return status.result;
            });

            const browserSet = _bootstrappingStatuse[0],
                  tests = _bootstrappingStatuse[1],
                  testedApp = _bootstrappingStatuse[2];


            return { browserSet, tests, testedApp };
        })();
    }

    // API
    createRunnableConfiguration() {
        var _this8 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            const reporterPlugins = yield _this8._getReporterPlugins();

            // NOTE: If a user forgot to specify a browser, but has specified a path to tests, the specified path will be
            // considered as the browser argument, and the tests path argument will have the predefined default value.
            // It's very ambiguous for the user, who might be confused by compilation errors from an unexpected test.
            // So, we need to retrieve the browser aliases and paths before tests compilation.
            const browserInfo = yield _this8._getBrowserInfo();

            if (yield _this8._canUseParallelBootstrapping(browserInfo)) return (0, _extends3.default)({ reporterPlugins }, (yield _this8._bootstrapParallel(browserInfo)));

            return (0, _extends3.default)({ reporterPlugins }, (yield _this8._bootstrapSequence(browserInfo)));
        })();
    }
}
exports.default = Bootstrapper;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydW5uZXIvYm9vdHN0cmFwcGVyLmpzIl0sIm5hbWVzIjpbIkJvb3RzdHJhcHBlciIsImNvbnN0cnVjdG9yIiwiYnJvd3NlckNvbm5lY3Rpb25HYXRld2F5IiwiY29uY3VycmVuY3kiLCJzb3VyY2VzIiwiYnJvd3NlcnMiLCJyZXBvcnRlcnMiLCJmaWx0ZXIiLCJhcHBDb21tYW5kIiwiYXBwSW5pdERlbGF5IiwiX3NwbGl0QnJvd3NlckluZm8iLCJicm93c2VySW5mbyIsInJlbW90ZXMiLCJhdXRvbWF0ZWQiLCJmb3JFYWNoIiwiYnJvd3NlciIsInB1c2giLCJfZ2V0QnJvd3NlckluZm8iLCJsZW5ndGgiLCJicm93c2VyTm90U2V0IiwiYWxsIiwibWFwIiwiZ2V0QnJvd3NlckluZm8iLCJfY3JlYXRlQXV0b21hdGVkQ29ubmVjdGlvbnMiLCJfZ2V0QnJvd3NlckNvbm5lY3Rpb25zIiwiY2Fubm90RGl2aWRlUmVtb3Rlc0NvdW50QnlDb25jdXJyZW5jeSIsImJyb3dzZXJDb25uZWN0aW9ucyIsImNvbmNhdCIsImZyb20iLCJfZ2V0VGVzdHMiLCJ0ZXN0U291cmNlc05vdFNldCIsInBhcnNlZEZpbGVMaXN0IiwicHJvY2VzcyIsImN3ZCIsImNvbXBpbGVyIiwidGVzdHMiLCJnZXRUZXN0cyIsInRlc3RzV2l0aE9ubHlGbGFnIiwidGVzdCIsIm9ubHkiLCJuYW1lIiwiZml4dHVyZSIsInBhdGgiLCJtZXRhIiwibm9UZXN0c1RvUnVuIiwiX2Vuc3VyZU91dFN0cmVhbSIsIm91dFN0cmVhbSIsImZ1bGxSZXBvcnRlck91dHB1dFBhdGgiLCJkaXJuYW1lIiwiY3JlYXRlV3JpdGVTdHJlYW0iLCJfYWRkRGVmYXVsdFJlcG9ydGVyIiwiZmlsZSIsInN0ZG91dCIsIl9nZXRSZXBvcnRlclBsdWdpbnMiLCJzdGRvdXRSZXBvcnRlcnMiLCJyIiwib3V0cHV0IiwibXVsdGlwbGVTdGRvdXRSZXBvcnRlcnMiLCJqb2luIiwicGx1Z2luRmFjdG9yeSIsInJlcXVpcmUiLCJlcnIiLCJjYW5ub3RGaW5kUmVwb3J0ZXJGb3JBbGlhcyIsInBsdWdpbiIsIl9zdGFydFRlc3RlZEFwcCIsInRlc3RlZEFwcCIsInN0YXJ0IiwiX2NhblVzZVBhcmFsbGVsQm9vdHN0cmFwcGluZyIsImlzTG9jYWxQcm9taXNlcyIsInByb3ZpZGVyIiwiaXNMb2NhbEJyb3dzZXIiLCJicm93c2VyTmFtZSIsImlzTG9jYWxCcm93c2VycyIsImV2ZXJ5IiwicmVzdWx0IiwiX2Jvb3RzdHJhcFNlcXVlbmNlIiwiYnJvd3NlclNldCIsIl93cmFwQm9vdHN0cmFwcGluZ1Byb21pc2UiLCJwcm9taXNlIiwidGhlbiIsImVycm9yIiwiY2F0Y2giLCJfaGFuZGxlQm9vdHN0cmFwcGluZ0Vycm9yIiwiYnJvd3NlclNldFN0YXR1cyIsInRlc3RzU3RhdHVzIiwidGVzdGVkQXBwU3RhdHVzIiwiZGlzcG9zZSIsImtpbGwiLCJfYm9vdHN0cmFwUGFyYWxsZWwiLCJib290c3RyYXBwaW5nUHJvbWlzZXMiLCJib290c3RyYXBwaW5nU3RhdHVzZXMiLCJzb21lIiwic3RhdHVzIiwiY3JlYXRlUnVubmFibGVDb25maWd1cmF0aW9uIiwicmVwb3J0ZXJQbHVnaW5zIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQTs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7OztBQUNBOztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7QUFFZSxNQUFNQSxZQUFOLENBQW1CO0FBQzlCQyxnQkFBYUMsd0JBQWIsRUFBdUM7QUFDbkMsYUFBS0Esd0JBQUwsR0FBZ0NBLHdCQUFoQzs7QUFFQSxhQUFLQyxXQUFMLEdBQW1DLElBQW5DO0FBQ0EsYUFBS0MsT0FBTCxHQUFtQyxFQUFuQztBQUNBLGFBQUtDLFFBQUwsR0FBbUMsRUFBbkM7QUFDQSxhQUFLQyxTQUFMLEdBQW1DLEVBQW5DO0FBQ0EsYUFBS0MsTUFBTCxHQUFtQyxJQUFuQztBQUNBLGFB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TjZCO2tCQUFiWCxZIiwiZmlsZSI6InJ1bm5lci9ib290c3RyYXBwZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBpc1VuZGVmaW5lZCwgZmlsdGVyLCBmbGF0dGVuLCBjaHVuaywgdGltZXMgfSBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IFByb21pc2UgZnJvbSAncGlua2llJztcbmltcG9ydCBDb21waWxlciBmcm9tICcuLi9jb21waWxlcic7XG5pbXBvcnQgQnJvd3NlckNvbm5lY3Rpb24gZnJvbSAnLi4vYnJvd3Nlci9jb25uZWN0aW9uJztcbmltcG9ydCB7IEdlbmVyYWxFcnJvciB9IGZyb20gJy4uL2Vycm9ycy9ydW50aW1lJztcbmltcG9ydCBicm93c2VyUHJvdmlkZXJQb29sIGZyb20gJy4uL2Jyb3dzZXIvcHJvdmlkZXIvcG9vbCc7XG5pbXBvcnQgeyBSVU5USU1FX0VSUk9SUyB9IGZyb20gJy4uL2Vycm9ycy90eXBlcyc7XG5pbXBvcnQgQnJvd3NlclNldCBmcm9tICcuL2Jyb3dzZXItc2V0JztcbmltcG9ydCBUZXN0ZWRBcHAgZnJvbSAnLi90ZXN0ZWQtYXBwJztcbmltcG9ydCBwYXJzZUZpbGVMaXN0IGZyb20gJy4uL3V0aWxzL3BhcnNlLWZpbGUtbGlzdCc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgbWFrZURpciBmcm9tICdtYWtlLWRpcic7XG5pbXBvcnQgcmVzb2x2ZVBhdGhSZWxhdGl2ZWx5Q3dkIGZyb20gJy4uL3V0aWxzL3Jlc29sdmUtcGF0aC1yZWxhdGl2ZWx5LWN3ZCc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJvb3RzdHJhcHBlciB7XG4gICAgY29uc3RydWN0b3IgKGJyb3dzZXJDb25uZWN0aW9uR2F0ZXdheSkge1xuICAgICAgICB0aGlzLmJyb3dzZXJDb25uZWN0aW9uR2F0ZXdheSA9IGJyb3dzZXJDb25uZWN0aW9uR2F0ZXdheTtcblxuICAgICAgICB0aGlzLmNvbmN1cnJlbmN5ICAgICAgICAgICAgICAgICA9IG51bGw7XG4gICAgICAgIHRoaXMuc291cmNlcyAgICAgICAgICAgICAgICAgICAgID0gW107XG4gICAgICAgIHRoaXMuYnJvd3NlcnMgICAgICAgICAgICAgICAgICAgID0gW107XG4gICAgICAgIHRoaXMucmVwb3J0ZXJzICAgICAgICAgICAgICAgICAgID0gW107XG4gICAgICAgIHRoaXMuZmlsdGVyICAgICAgICAgICAgICAgICAgICAgID0gbnVsbDtcbiAgICAgICAgdGhpcy5hcHBDb21tYW5kICAgICAgICAgICAgICAgICAgPSBudWxsO1xuICAgICAgICB0aGlzLmFwcEluaXREZWxheSAgICAgICAgICAgICAgICA9IG51bGw7XG4gICAgfVxuXG4gICAgc3RhdGljIF9zcGxpdEJyb3dzZXJJbmZvIChicm93c2VySW5mbykge1xuICAgICAgICBjb25zdCByZW1vdGVzICAgPSBbXTtcbiAgICAgICAgY29uc3QgYXV0b21hdGVkID0gW107XG5cbiAgICAgICAgYnJvd3NlckluZm8uZm9yRWFjaChicm93c2VyID0+IHtcbiAgICAgICAgICAgIGlmIChicm93c2VyIGluc3RhbmNlb2YgQnJvd3NlckNvbm5lY3Rpb24pXG4gICAgICAgICAgICAgICAgcmVtb3Rlcy5wdXNoKGJyb3dzZXIpO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGF1dG9tYXRlZC5wdXNoKGJyb3dzZXIpO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4geyByZW1vdGVzLCBhdXRvbWF0ZWQgfTtcbiAgICB9XG5cbiAgICBhc3luYyBfZ2V0QnJvd3NlckluZm8gKCkge1xuICAgICAgICBpZiAoIXRoaXMuYnJvd3NlcnMubGVuZ3RoKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEdlbmVyYWxFcnJvcihSVU5USU1FX0VSUk9SUy5icm93c2VyTm90U2V0KTtcblxuICAgICAgICBjb25zdCBicm93c2VySW5mbyA9IGF3YWl0IFByb21pc2UuYWxsKHRoaXMuYnJvd3NlcnMubWFwKGJyb3dzZXIgPT4gYnJvd3NlclByb3ZpZGVyUG9vbC5nZXRCcm93c2VySW5mbyhicm93c2VyKSkpO1xuXG4gICAgICAgIHJldHVybiBmbGF0dGVuKGJyb3dzZXJJbmZvKTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQXV0b21hdGVkQ29ubmVjdGlvbnMgKGJyb3dzZXJJbmZvKSB7XG4gICAgICAgIGlmICghYnJvd3NlckluZm8pXG4gICAgICAgICAgICByZXR1cm4gW107XG5cbiAgICAgICAgcmV0dXJuIGJyb3dzZXJJbmZvXG4gICAgICAgICAgICAubWFwKGJyb3dzZXIgPT4gdGltZXModGhpcy5jb25jdXJyZW5jeSwgKCkgPT4gbmV3IEJyb3dzZXJDb25uZWN0aW9uKHRoaXMuYnJvd3NlckNvbm5lY3Rpb25HYXRld2F5LCBicm93c2VyKSkpO1xuICAgIH1cblxuICAgIGFzeW5jIF9nZXRCcm93c2VyQ29ubmVjdGlvbnMgKGJyb3dzZXJJbmZvKSB7XG4gICAgICAgIGNvbnN0IHsgYXV0b21hdGVkLCByZW1vdGVzIH0gPSBCb290c3RyYXBwZXIuX3NwbGl0QnJvd3NlckluZm8oYnJvd3NlckluZm8pO1xuXG4gICAgICAgIGlmIChyZW1vdGVzICYmIHJlbW90ZXMubGVuZ3RoICUgdGhpcy5jb25jdXJyZW5jeSlcbiAgICAgICAgICAgIHRocm93IG5ldyBHZW5lcmFsRXJyb3IoUlVOVElNRV9FUlJPUlMuY2Fubm90RGl2aWRlUmVtb3Rlc0NvdW50QnlDb25jdXJyZW5jeSk7XG5cbiAgICAgICAgbGV0IGJyb3dzZXJDb25uZWN0aW9ucyA9IHRoaXMuX2NyZWF0ZUF1dG9tYXRlZENvbm5lY3Rpb25zKGF1dG9tYXRlZCk7XG5cbiAgICAgICAgYnJvd3NlckNvbm5lY3Rpb25zID0gYnJvd3NlckNvbm5lY3Rpb25zLmNvbmNhdChjaHVuayhyZW1vdGVzLCB0aGlzLmNvbmN1cnJlbmN5KSk7XG5cbiAgICAgICAgcmV0dXJuIGF3YWl0IEJyb3dzZXJTZXQuZnJvbShicm93c2VyQ29ubmVjdGlvbnMpO1xuICAgIH1cblxuICAgIGFzeW5jIF9nZXRUZXN0cyAoKSB7XG4gICAgICAgIGlmICghdGhpcy5zb3VyY2VzLmxlbmd0aClcbiAgICAgICAgICAgIHRocm93IG5ldyBHZW5lcmFsRXJyb3IoUlVOVElNRV9FUlJPUlMudGVzdFNvdXJjZXNOb3RTZXQpO1xuXG4gICAgICAgIGNvbnN0IHBhcnNlZEZpbGVMaXN0ID0gYXdhaXQgcGFyc2VGaWxlTGlzdCh0aGlzLnNvdXJjZXMsIHByb2Nlc3MuY3dkKCkpO1xuICAgICAgICBjb25zdCBjb21waWxlciAgICAgICA9IG5ldyBDb21waWxlcihwYXJzZWRGaWxlTGlzdCk7XG4gICAgICAgIGxldCB0ZXN0cyAgICAgICAgICAgID0gYXdhaXQgY29tcGlsZXIuZ2V0VGVzdHMoKTtcblxuICAgICAgICBjb25zdCB0ZXN0c1dpdGhPbmx5RmxhZyA9IHRlc3RzLmZpbHRlcih0ZXN0ID0+IHRlc3Qub25seSk7XG5cbiAgICAgICAgaWYgKHRlc3RzV2l0aE9ubHlGbGFnLmxlbmd0aClcbiAgICAgICAgICAgIHRlc3RzID0gdGVzdHNXaXRoT25seUZsYWc7XG5cbiAgICAgICAgaWYgKHRoaXMuZmlsdGVyKVxuICAgICAgICAgICAgdGVzdHMgPSB0ZXN0cy5maWx0ZXIodGVzdCA9PiB0aGlzLmZpbHRlcih0ZXN0Lm5hbWUsIHRlc3QuZml4dHVyZS5uYW1lLCB0ZXN0LmZpeHR1cmUucGF0aCwgdGVzdC5tZXRhLCB0ZXN0LmZpeHR1cmUubWV0YSkpO1xuXG4gICAgICAgIGlmICghdGVzdHMubGVuZ3RoKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEdlbmVyYWxFcnJvcihSVU5USU1FX0VSUk9SUy5ub1Rlc3RzVG9SdW4pO1xuXG4gICAgICAgIHJldHVybiB0ZXN0cztcbiAgICB9XG5cbiAgICBhc3luYyBfZW5zdXJlT3V0U3RyZWFtIChvdXRTdHJlYW0pIHtcbiAgICAgICAgaWYgKHR5cGVvZiBvdXRTdHJlYW0gIT09ICdzdHJpbmcnKVxuICAgICAgICAgICAgcmV0dXJuIG91dFN0cmVhbTtcblxuICAgICAgICBjb25zdCBmdWxsUmVwb3J0ZXJPdXRwdXRQYXRoID0gcmVzb2x2ZVBhdGhSZWxhdGl2ZWx5Q3dkKG91dFN0cmVhbSk7XG5cbiAgICAgICAgYXdhaXQgbWFrZURpcihwYXRoLmRpcm5hbWUoZnVsbFJlcG9ydGVyT3V0cHV0UGF0aCkpO1xuXG4gICAgICAgIHJldHVybiBmcy5jcmVhdGVXcml0ZVN0cmVhbShmdWxsUmVwb3J0ZXJPdXRwdXRQYXRoKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgX2FkZERlZmF1bHRSZXBvcnRlciAocmVwb3J0ZXJzKSB7XG4gICAgICAgIHJlcG9ydGVycy5wdXNoKHtcbiAgICAgICAgICAgIG5hbWU6ICdzcGVjJyxcbiAgICAgICAgICAgIGZpbGU6IHByb2Nlc3Muc3Rkb3V0XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFzeW5jIF9nZXRSZXBvcnRlclBsdWdpbnMgKCkge1xuICAgICAgICBjb25zdCBzdGRvdXRSZXBvcnRlcnMgPSBmaWx0ZXIodGhpcy5yZXBvcnRlcnMsIHIgPT4gaXNVbmRlZmluZWQoci5vdXRwdXQpIHx8IHIub3V0cHV0ID09PSBwcm9jZXNzLnN0ZG91dCk7XG5cbiAgICAgICAgaWYgKHN0ZG91dFJlcG9ydGVycy5sZW5ndGggPiAxKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEdlbmVyYWxFcnJvcihSVU5USU1FX0VSUk9SUy5tdWx0aXBsZVN0ZG91dFJlcG9ydGVycywgc3Rkb3V0UmVwb3J0ZXJzLm1hcChyID0+IHIubmFtZSkuam9pbignLCAnKSk7XG5cbiAgICAgICAgaWYgKCF0aGlzLnJlcG9ydGVycy5sZW5ndGgpXG4gICAgICAgICAgICBCb290c3RyYXBwZXIuX2FkZERlZmF1bHRSZXBvcnRlcih0aGlzLnJlcG9ydGVycyk7XG5cbiAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKHRoaXMucmVwb3J0ZXJzLm1hcChhc3luYyAoeyBuYW1lLCBvdXRwdXQgfSkgPT4ge1xuICAgICAgICAgICAgbGV0IHBsdWdpbkZhY3RvcnkgPSBuYW1lO1xuXG4gICAgICAgICAgICBjb25zdCBvdXRTdHJlYW0gPSBhd2FpdCB0aGlzLl9lbnN1cmVPdXRTdHJlYW0ob3V0cHV0KTtcblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBwbHVnaW5GYWN0b3J5ICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgcGx1Z2luRmFjdG9yeSA9IHJlcXVpcmUoJ3Rlc3RjYWZlLXJlcG9ydGVyLScgKyBuYW1lKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgR2VuZXJhbEVycm9yKFJVTlRJTUVfRVJST1JTLmNhbm5vdEZpbmRSZXBvcnRlckZvckFsaWFzLCBuYW1lKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcGx1Z2luOiBwbHVnaW5GYWN0b3J5KCksXG4gICAgICAgICAgICAgICAgb3V0U3RyZWFtXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KSk7XG4gICAgfVxuXG4gICAgYXN5bmMgX3N0YXJ0VGVzdGVkQXBwICgpIHtcbiAgICAgICAgaWYgKHRoaXMuYXBwQ29tbWFuZCkge1xuICAgICAgICAgICAgY29uc3QgdGVzdGVkQXBwID0gbmV3IFRlc3RlZEFwcCgpO1xuXG4gICAgICAgICAgICBhd2FpdCB0ZXN0ZWRBcHAuc3RhcnQodGhpcy5hcHBDb21tYW5kLCB0aGlzLmFwcEluaXREZWxheSk7XG5cbiAgICAgICAgICAgIHJldHVybiB0ZXN0ZWRBcHA7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBhc3luYyBfY2FuVXNlUGFyYWxsZWxCb290c3RyYXBwaW5nIChicm93c2VySW5mbykge1xuICAgICAgICBjb25zdCBpc0xvY2FsUHJvbWlzZXMgPSBicm93c2VySW5mby5tYXAoYnJvd3NlciA9PiBicm93c2VyLnByb3ZpZGVyLmlzTG9jYWxCcm93c2VyKG51bGwsIGJyb3dzZXJJbmZvLmJyb3dzZXJOYW1lKSk7XG4gICAgICAgIGNvbnN0IGlzTG9jYWxCcm93c2VycyA9IGF3YWl0IFByb21pc2UuYWxsKGlzTG9jYWxQcm9taXNlcyk7XG5cbiAgICAgICAgcmV0dXJuIGlzTG9jYWxCcm93c2Vycy5ldmVyeShyZXN1bHQgPT4gcmVzdWx0KTtcbiAgICB9XG5cbiAgICBhc3luYyBfYm9vdHN0cmFwU2VxdWVuY2UgKGJyb3dzZXJJbmZvKSB7XG4gICAgICAgIGNvbnN0IHRlc3RzICAgICAgID0gYXdhaXQgdGhpcy5fZ2V0VGVzdHMoKTtcbiAgICAgICAgY29uc3QgdGVzdGVkQXBwICAgPSBhd2FpdCB0aGlzLl9zdGFydFRlc3RlZEFwcCgpO1xuICAgICAgICBjb25zdCBicm93c2VyU2V0ICA9IGF3YWl0IHRoaXMuX2dldEJyb3dzZXJDb25uZWN0aW9ucyhicm93c2VySW5mbyk7XG5cbiAgICAgICAgcmV0dXJuIHsgdGVzdHMsIHRlc3RlZEFwcCwgYnJvd3NlclNldCB9O1xuICAgIH1cblxuICAgIF93cmFwQm9vdHN0cmFwcGluZ1Byb21pc2UgKHByb21pc2UpIHtcbiAgICAgICAgcmV0dXJuIHByb21pc2VcbiAgICAgICAgICAgIC50aGVuKHJlc3VsdCA9PiAoeyBlcnJvcjogbnVsbCwgcmVzdWx0IH0pKVxuICAgICAgICAgICAgLmNhdGNoKGVycm9yID0+ICh7IHJlc3VsdDogbnVsbCwgZXJyb3IgfSkpO1xuICAgIH1cblxuICAgIGFzeW5jIF9oYW5kbGVCb290c3RyYXBwaW5nRXJyb3IgKFticm93c2VyU2V0U3RhdHVzLCB0ZXN0c1N0YXR1cywgdGVzdGVkQXBwU3RhdHVzXSkge1xuICAgICAgICBpZiAoIWJyb3dzZXJTZXRTdGF0dXMuZXJyb3IpXG4gICAgICAgICAgICBhd2FpdCBicm93c2VyU2V0U3RhdHVzLnJlc3VsdC5kaXNwb3NlKCk7XG5cbiAgICAgICAgaWYgKCF0ZXN0ZWRBcHBTdGF0dXMuZXJyb3IgJiYgdGVzdGVkQXBwU3RhdHVzLnJlc3VsdClcbiAgICAgICAgICAgIGF3YWl0IHRlc3RlZEFwcFN0YXR1cy5yZXN1bHQua2lsbCgpO1xuXG4gICAgICAgIGlmICh0ZXN0c1N0YXR1cy5lcnJvcilcbiAgICAgICAgICAgIHRocm93IHRlc3RzU3RhdHVzLmVycm9yO1xuICAgICAgICBlbHNlIGlmICh0ZXN0ZWRBcHBTdGF0dXMuZXJyb3IpXG4gICAgICAgICAgICB0aHJvdyB0ZXN0ZWRBcHBTdGF0dXMuZXJyb3I7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRocm93IGJyb3dzZXJTZXRTdGF0dXMuZXJyb3I7XG4gICAgfVxuXG4gICAgYXN5bmMgX2Jvb3RzdHJhcFBhcmFsbGVsIChicm93c2VySW5mbykge1xuICAgICAgICBsZXQgYm9vdHN0cmFwcGluZ1Byb21pc2VzID0gW1xuICAgICAgICAgICAgdGhpcy5fZ2V0QnJvd3NlckNvbm5lY3Rpb25zKGJyb3dzZXJJbmZvKSxcbiAgICAgICAgICAgIHRoaXMuX2dldFRlc3RzKCksXG4gICAgICAgICAgICB0aGlzLl9zdGFydFRlc3RlZEFwcCgpXG4gICAgICAgIF07XG5cbiAgICAgICAgYm9vdHN0cmFwcGluZ1Byb21pc2VzID0gYm9vdHN0cmFwcGluZ1Byb21pc2VzLm1hcChwcm9taXNlID0+IHRoaXMuX3dyYXBCb290c3RyYXBwaW5nUHJvbWlzZShwcm9taXNlKSk7XG5cbiAgICAgICAgY29uc3QgYm9vdHN0cmFwcGluZ1N0YXR1c2VzID0gYXdhaXQgUHJvbWlzZS5hbGwoYm9vdHN0cmFwcGluZ1Byb21pc2VzKTtcblxuICAgICAgICBpZiAoYm9vdHN0cmFwcGluZ1N0YXR1c2VzLnNvbWUoc3RhdHVzID0+IHN0YXR1cy5lcnJvcikpXG4gICAgICAgICAgICBhd2FpdCB0aGlzLl9oYW5kbGVCb290c3RyYXBwaW5nRXJyb3IoYm9vdHN0cmFwcGluZ1N0YXR1c2VzKTtcblxuICAgICAgICBjb25zdCBbYnJvd3NlclNldCwgdGVzdHMsIHRlc3RlZEFwcF0gPSBib290c3RyYXBwaW5nU3RhdHVzZXMubWFwKHN0YXR1cyA9PiBzdGF0dXMucmVzdWx0KTtcblxuICAgICAgICByZXR1cm4geyBicm93c2VyU2V0LCB0ZXN0cywgdGVzdGVkQXBwIH07XG4gICAgfVxuXG4gICAgLy8gQVBJXG4gICAgYXN5bmMgY3JlYXRlUnVubmFibGVDb25maWd1cmF0aW9uICgpIHtcbiAgICAgICAgY29uc3QgcmVwb3J0ZXJQbHVnaW5zID0gYXdhaXQgdGhpcy5fZ2V0UmVwb3J0ZXJQbHVnaW5zKCk7XG5cbiAgICAgICAgLy8gTk9URTogSWYgYSB1c2VyIGZvcmdvdCB0byBzcGVjaWZ5IGEgYnJvd3NlciwgYnV0IGhhcyBzcGVjaWZpZWQgYSBwYXRoIHRvIHRlc3RzLCB0aGUgc3BlY2lmaWVkIHBhdGggd2lsbCBiZVxuICAgICAgICAvLyBjb25zaWRlcmVkIGFzIHRoZSBicm93c2VyIGFyZ3VtZW50LCBhbmQgdGhlIHRlc3RzIHBhdGggYXJndW1lbnQgd2lsbCBoYXZlIHRoZSBwcmVkZWZpbmVkIGRlZmF1bHQgdmFsdWUuXG4gICAgICAgIC8vIEl0J3MgdmVyeSBhbWJpZ3VvdXMgZm9yIHRoZSB1c2VyLCB3aG8gbWlnaHQgYmUgY29uZnVzZWQgYnkgY29tcGlsYXRpb24gZXJyb3JzIGZyb20gYW4gdW5leHBlY3RlZCB0ZXN0LlxuICAgICAgICAvLyBTbywgd2UgbmVlZCB0byByZXRyaWV2ZSB0aGUgYnJvd3NlciBhbGlhc2VzIGFuZCBwYXRocyBiZWZvcmUgdGVzdHMgY29tcGlsYXRpb24uXG4gICAgICAgIGNvbnN0IGJyb3dzZXJJbmZvID0gYXdhaXQgdGhpcy5fZ2V0QnJvd3NlckluZm8oKTtcblxuICAgICAgICBpZiAoYXdhaXQgdGhpcy5fY2FuVXNlUGFyYWxsZWxCb290c3RyYXBwaW5nKGJyb3dzZXJJbmZvKSlcbiAgICAgICAgICAgIHJldHVybiB7IHJlcG9ydGVyUGx1Z2lucywgLi4uYXdhaXQgdGhpcy5fYm9vdHN0cmFwUGFyYWxsZWwoYnJvd3NlckluZm8pIH07XG5cbiAgICAgICAgcmV0dXJuIHsgcmVwb3J0ZXJQbHVnaW5zLCAuLi5hd2FpdCB0aGlzLl9ib290c3RyYXBTZXF1ZW5jZShicm93c2VySW5mbykgfTtcbiAgICB9XG59XG4iXX0=
