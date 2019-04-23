'use strict';

exports.__esModule = true;

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _pinkie = require('pinkie');

var _pinkie2 = _interopRequireDefault(_pinkie);

var _lodash = require('lodash');

var _testRunController = require('./test-run-controller');

var _testRunController2 = _interopRequireDefault(_testRunController);

var _controller = require('./controller');

var _controller2 = _interopRequireDefault(_controller);

var _runner = require('../runner');

var _runner2 = _interopRequireDefault(_runner);

var _bootstrapper = require('./bootstrapper');

var _bootstrapper2 = _interopRequireDefault(_bootstrapper);

var _parseFileList = require('../utils/parse-file-list');

var _parseFileList2 = _interopRequireDefault(_parseFileList);

var _runtime = require('../errors/runtime');

var _types = require('../errors/types');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class LiveModeRunner extends _runner2.default {
    constructor(proxy, browserConnectionGateway, options) {
        super(proxy, browserConnectionGateway, options);

        /* EVENTS */
        this.TEST_RUN_DONE_EVENT = 'test-run-done';
        this.REQUIRED_MODULE_FOUND_EVENT = 'require-module-found';

        this.stopping = false;
        this.tcRunnerTaskPromise = null;
        this.stopInfiniteWaiting = _lodash.noop;
        this.rejectInfiniteWaiting = _lodash.noop;
        this.preventRunCall = false;
        this.assets = null;

        this.testRunController = new _testRunController2.default();

        this.embeddingOptions({
            TestRunCtor: this.testRunController.TestRunCtor,
            assets: []
        });

        this.controller = this._createController();
    }

    runTests(isFirstRun = false) {
        let runError = null;

        return this._finishPreviousTestRuns().then(() => {
            return this._validateRunnableConfiguration(isFirstRun);
        }).then(() => {
            this.testRunController.setExpectedTestCount(this.liveConfigurationCache.tests.filter(t => !t.skip).length);
        }).then(() => {
            this.tcRunnerTaskPromise = super.run(this.opts);

            return this.tcRunnerTaskPromise;
        }).catch(err => {
            this.setBootstrappingError(null);

            runError = err;
        }).then(() => {
            this.tcRunnerTaskPromise = null;

            this.emit(this.TEST_RUN_DONE_EVENT, { err: runError });
        });
    }

    _validateRunOptions() {
        return super._validateRunOptions().catch(err => {
            this.rejectInfiniteWaiting(err);
        });
    }

    _createRunnableConfiguration() {
        if (this.liveConfigurationCache) return _pinkie2.default.resolve(this.liveConfigurationCache);

        return super._createRunnableConfiguration().then(configuration => {
            this.liveConfigurationCache = configuration;

            return configuration;
        }).catch(err => {
            this.rejectInfiniteWaiting(err);
        });
    }

    setBootstrappingError(err) {
        this.bootstrappingError = err;
    }

    run(options) {
        if (this.preventRunCall) throw new _runtime.GeneralError(_types.RUNTIME_ERRORS.cannotRunLiveModeRunnerMultipleTimes);

        this.preventRunCall = true;

        this.opts = (0, _assign2.default)({}, this.opts, options);

        this._setBootstrapperOptions();

        const fileListPromise = (0, _parseFileList2.default)(this.bootstrapper.sources, process.cwd());

        fileListPromise.then(files => this.controller.init(files)).then(() => this._createRunnableConfiguration()).then(() => this.runTests(true));

        return this._waitUntilExit().then(() => {
            return this._dispose();
        }).then(() => {
            this.preventRunCall = false;
        });
    }

    suspend() {
        if (!this.tcRunnerTaskPromise) return _pinkie2.default.resolve();

        this.stopping = true;
        this.testRunController.stop();
        this.tcRunnerTaskPromise.cancel();

        return this.testRunController.allTestsCompletePromise.then(() => {
            this.stopping = false;

            this.emit(this.TEST_RUN_DONE_EVENT, {});
        });
    }

    exit() {
        if (this.tcRunnerTaskPromise) this.tcRunnerTaskPromise.cancel();

        return _pinkie2.default.resolve().then(() => this.stopInfiniteWaiting());
    }

    _finishPreviousTestRuns() {
        var _this = this;

        return (0, _asyncToGenerator3.default)(function* () {
            if (!_this.liveConfigurationCache.tests) return;

            _this.testRunController.run();
        })();
    }

    _validateRunnableConfiguration(isFirstRun) {
        if (isFirstRun) {
            if (this.bootstrappingError) return _pinkie2.default.reject(this.bootstrappingError);

            return _pinkie2.default.resolve();
        }

        return this.bootstrapper._getTests().then(tests => {
            this.liveConfigurationCache.tests = tests;

            return this.bootstrappingError ? _pinkie2.default.reject(this.bootstrappingError) : _pinkie2.default.resolve();
        });
    }

    _createTask(tests, browserConnectionGroups, proxy, opts) {
        opts.live = true;

        return super._createTask(tests, browserConnectionGroups, proxy, opts);
    }

    _createBootstrapper(browserConnectionGateway) {
        return new _bootstrapper2.default(this, browserConnectionGateway);
    }

    _createController() {
        return new _controller2.default(this);
    }

    _waitUntilExit() {
        return new _pinkie2.default((resolve, reject) => {
            this.stopInfiniteWaiting = resolve;
            this.rejectInfiniteWaiting = reject;
        });
    }

    _disposeAssets(browserSet, reporters, testedApp) {
        this.assets = { browserSet, reporters, testedApp };

        return _pinkie2.default.resolve();
    }

    _dispose() {
        this.controller.dispose();

        if (!this.assets) return _pinkie2.default.resolve();

        var _assets = this.assets;
        const browserSet = _assets.browserSet,
              reporters = _assets.reporters,
              testedApp = _assets.testedApp;


        return super._disposeAssets(browserSet, reporters, testedApp);
    }
}

exports.default = LiveModeRunner;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saXZlL3Rlc3QtcnVubmVyLmpzIl0sIm5hbWVzIjpbIkxpdmVNb2RlUnVubmVyIiwiY29uc3RydWN0b3IiLCJwcm94eSIsImJyb3dzZXJDb25uZWN0aW9uR2F0ZXdheSIsIm9wdGlvbnMiLCJURVNUX1JVTl9ET05FX0VWRU5UIiwiUkVRVUlSRURfTU9EVUxFX0ZPVU5EX0VWRU5UIiwic3RvcHBpbmciLCJ0Y1J1bm5lclRhc2tQcm9taXNlIiwic3RvcEluZmluaXRlV2FpdGluZyIsInJlamVjdEluZmluaXRlV2FpdGluZyIsInByZXZlbnRSdW5DYWxsIiwiYXNzZXRzIiwidGVzdFJ1bkNvbnRyb2xsZXIiLCJlbWJlZGRpbmdPcHRpb25zIiwiVGVzdFJ1bkN0b3IiLCJjb250cm9sbGVyIiwiX2NyZWF0ZUNvbnRyb2xsZXIiLCJydW5UZXN0cyIsImlzRmlyc3RSdW4iLCJydW5FcnJvciIsIl9maW5pc2hQcmV2aW91c1Rlc3RSdW5zIiwidGhlbiIsIl92YWxpZGF0ZVJ1bm5hYmxlQ29uZmlndXJhdGlvbiIsInNldEV4cGVjdGVkVGVzdENvdW50IiwibGl2ZUNvbmZpZ3VyYXRpb25DYWNoZSIsInRlc3RzIiwiZmlsdGVyIiwidCIsInNraXAiLCJsZW5ndGgiLCJydW4iLCJvcHRzIiwiY2F0Y2giLCJlcnIiLCJzZXRCb290c3RyYXBwaW5nRXJyb3IiLCJlbWl0IiwiX3ZhbGlkYXRlUnVuT3B0aW9ucyIsIl9jcmVhdGVSdW5uYWJsZUNvbmZpZ3VyYXRpb24iLCJyZXNvbHZlIiwiY29uZmlndXJhdGlvbiIsImJvb3RzdHJhcHBpbmdFcnJvciIsImNhbm5vdFJ1bkxpdmVNb2RlUnVubmVyTXVsdGlwbGVUaW1lcyIsIl9zZXRCb290c3RyYXBwZXJPcHRpb25zIiwiZmlsZUxpc3RQcm9taXNlIiwiYm9vdHN0cmFwcGVyIiwic291cmNlcyIsInByb2Nlc3MiLCJjd2QiLCJmaWxlcyIsImluaXQiLCJfd2FpdFVudGlsRXhpdCIsIl9kaXNwb3NlIiwic3VzcGVuZCIsInN0b3AiLCJjYW5jZWwiLCJhbGxUZXN0c0NvbXBsZXRlUHJvbWlzZSIsImV4aXQiLCJyZWplY3QiLCJfZ2V0VGVzdHMiLCJfY3JlYXRlVGFzayIsImJyb3dzZXJDb25uZWN0aW9uR3JvdXBzIiwibGl2ZSIsIl9jcmVhdGVCb290c3RyYXBwZXIiLCJfZGlzcG9zZUFzc2V0cyIsImJyb3dzZXJTZXQiLCJyZXBvcnRlcnMiLCJ0ZXN0ZWRBcHAiLCJkaXNwb3NlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQTs7OztBQUNBOztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7OztBQUVBLE1BQU1BLGNBQU4sMEJBQW9DO0FBQ2hDQyxnQkFBYUMsS0FBYixFQUFvQkMsd0JBQXBCLEVBQThDQyxPQUE5QyxFQUF1RDtBQUNuRCxjQUFNRixLQUFOLEVBQWFDLHdCQUFiLEVBQXVDQyxPQUF2Qzs7QUFFQTtBQUNBLGFBQUtDLG1CQUFMLEdBQW1DLGVBQW5DO0FBQ0EsYUFBS0MsMkJBQUwsR0FBbUMsc0JBQW5DOztBQUVBLGFBQUtDLFFBQUwsR0FBNkIsS0FBN0I7QUFDQSxhQUFLQyxtQkFBTCxHQUE2QixJQUE3QjtBQUNBLGFBQUtDLG1CQUFMO0FBQ0EsYUFBS0MscUJBQUw7QUFDQSxhQUFLQyxjQUFMLEdBQTZCLEtBQTdCO0FBQ0EsYUFBS0MsTUFBTCxHQUE2QixJQUE3Qjs7QUFFQSxhQUFLQyxpQkFBTCxHQUF5QixpQ0FBekI7O0FBRUEsYUFBS0MsZ0JBQUwsQ0FBc0I7QUFDbEJDLHlCQUFhLEtBQUtGLGlCQUFMLENBQXVCRSxXQURsQjtBQUVsQkgsb0JBQWE7QUFGSyxTQUF0Qjs7QUFLQSxhQUFLSSxVQUFMLEdBQWtCLEtBQUtDLGlCQUFMLEVBQWxCO0FBQ0g7O0FBRURDLGFBQVVDLGFBQWEsS0FBdkIsRUFBOEI7QUFDMUIsWUFBSUMsV0FBVyxJQUFmOztBQUVBLGVBQU8sS0FBS0MsdUJBQUwsR0FDRkMsSUFERSxDQUNHLE1BQU07QUFDUixtQkFB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OEIsSUFBekQsQ0FBUDtBQUNIOztBQUVEK0Isd0JBQXFCNUQsd0JBQXJCLEVBQStDO0FBQzNDLGVBQU8sMkJBQXlCLElBQXpCLEVBQStCQSx3QkFBL0IsQ0FBUDtBQUNIOztBQUVEYyx3QkFBcUI7QUFDakIsZUFBTyx5QkFBdUIsSUFBdkIsQ0FBUDtBQUNIOztBQUVEa0MscUJBQWtCO0FBQ2QsZUFBTyxxQkFBWSxDQUFDWixPQUFELEVBQVVtQixNQUFWLEtBQXFCO0FBQ3BDLGlCQUFLakQsbUJBQUwsR0FBNkI4QixPQUE3QjtBQUNBLGlCQUFLN0IscUJBQUwsR0FBNkJnRCxNQUE3QjtBQUNILFNBSE0sQ0FBUDtBQUlIOztBQUVETSxtQkFBZ0JDLFVBQWhCLEVBQTRCQyxTQUE1QixFQUF1Q0MsU0FBdkMsRUFBa0Q7QUFDOUMsYUFBS3ZELE1BQUwsR0FBYyxFQUFFcUQsVUFBRixFQUFjQyxTQUFkLEVBQXlCQyxTQUF6QixFQUFkOztBQUVBLGVBQU8saUJBQVE1QixPQUFSLEVBQVA7QUFDSDs7QUFFRGEsZUFBWTtBQUNSLGFBQUtwQyxVQUFMLENBQWdCb0QsT0FBaEI7O0FBRUEsWUFBSSxDQUFDLEtBQUt4RCxNQUFWLEVBQ0ksT0FBTyxpQkFBUTJCLE9BQVIsRUFBUDs7QUFKSSxzQkFNcUMsS0FBSzNCLE1BTjFDO0FBQUEsY0FNQXFELFVBTkEsV0FNQUEsVUFOQTtBQUFBLGNBTVlDLFNBTlosV0FNWUEsU0FOWjtBQUFBLGNBTXVCQyxTQU52QixXQU11QkEsU0FOdkI7OztBQVFSLGVBQU8sTUFBTUgsY0FBTixDQUFxQkMsVUFBckIsRUFBaUNDLFNBQWpDLEVBQTRDQyxTQUE1QyxDQUFQO0FBQ0g7QUE1TCtCOztrQkErTHJCbkUsYyIsImZpbGUiOiJsaXZlL3Rlc3QtcnVubmVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFByb21pc2UgZnJvbSAncGlua2llJztcbmltcG9ydCB7IG5vb3AgfSBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IExpdmVNb2RlVGVzdFJ1bkNvbnRyb2xsZXIgZnJvbSAnLi90ZXN0LXJ1bi1jb250cm9sbGVyJztcbmltcG9ydCBMaXZlTW9kZUNvbnRyb2xsZXIgZnJvbSAnLi9jb250cm9sbGVyJztcbmltcG9ydCBSdW5uZXIgZnJvbSAnLi4vcnVubmVyJztcbmltcG9ydCBMaXZlTW9kZUJvb3RzdHJhcHBlciBmcm9tICcuL2Jvb3RzdHJhcHBlcic7XG5pbXBvcnQgcGFyc2VGaWxlTGlzdCBmcm9tICcuLi91dGlscy9wYXJzZS1maWxlLWxpc3QnO1xuaW1wb3J0IHsgR2VuZXJhbEVycm9yIH0gZnJvbSAnLi4vZXJyb3JzL3J1bnRpbWUnO1xuaW1wb3J0IHsgUlVOVElNRV9FUlJPUlMgfSBmcm9tICcuLi9lcnJvcnMvdHlwZXMnO1xuXG5jbGFzcyBMaXZlTW9kZVJ1bm5lciBleHRlbmRzIFJ1bm5lciB7XG4gICAgY29uc3RydWN0b3IgKHByb3h5LCBicm93c2VyQ29ubmVjdGlvbkdhdGV3YXksIG9wdGlvbnMpIHtcbiAgICAgICAgc3VwZXIocHJveHksIGJyb3dzZXJDb25uZWN0aW9uR2F0ZXdheSwgb3B0aW9ucyk7XG5cbiAgICAgICAgLyogRVZFTlRTICovXG4gICAgICAgIHRoaXMuVEVTVF9SVU5fRE9ORV9FVkVOVCAgICAgICAgID0gJ3Rlc3QtcnVuLWRvbmUnO1xuICAgICAgICB0aGlzLlJFUVVJUkVEX01PRFVMRV9GT1VORF9FVkVOVCA9ICdyZXF1aXJlLW1vZHVsZS1mb3VuZCc7XG5cbiAgICAgICAgdGhpcy5zdG9wcGluZyAgICAgICAgICAgICAgPSBmYWxzZTtcbiAgICAgICAgdGhpcy50Y1J1bm5lclRhc2tQcm9taXNlICAgPSBudWxsO1xuICAgICAgICB0aGlzLnN0b3BJbmZpbml0ZVdhaXRpbmcgICA9IG5vb3A7XG4gICAgICAgIHRoaXMucmVqZWN0SW5maW5pdGVXYWl0aW5nID0gbm9vcDtcbiAgICAgICAgdGhpcy5wcmV2ZW50UnVuQ2FsbCAgICAgICAgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5hc3NldHMgICAgICAgICAgICAgICAgPSBudWxsO1xuXG4gICAgICAgIHRoaXMudGVzdFJ1bkNvbnRyb2xsZXIgPSBuZXcgTGl2ZU1vZGVUZXN0UnVuQ29udHJvbGxlcigpO1xuXG4gICAgICAgIHRoaXMuZW1iZWRkaW5nT3B0aW9ucyh7XG4gICAgICAgICAgICBUZXN0UnVuQ3RvcjogdGhpcy50ZXN0UnVuQ29udHJvbGxlci5UZXN0UnVuQ3RvcixcbiAgICAgICAgICAgIGFzc2V0czogICAgICBbXVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmNvbnRyb2xsZXIgPSB0aGlzLl9jcmVhdGVDb250cm9sbGVyKCk7XG4gICAgfVxuXG4gICAgcnVuVGVzdHMgKGlzRmlyc3RSdW4gPSBmYWxzZSkge1xuICAgICAgICBsZXQgcnVuRXJyb3IgPSBudWxsO1xuXG4gICAgICAgIHJldHVybiB0aGlzLl9maW5pc2hQcmV2aW91c1Rlc3RSdW5zKClcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fdmFsaWRhdGVSdW5uYWJsZUNvbmZpZ3VyYXRpb24oaXNGaXJzdFJ1bik7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMudGVzdFJ1bkNvbnRyb2xsZXIuc2V0RXhwZWN0ZWRUZXN0Q291bnQodGhpcy5saXZlQ29uZmlndXJhdGlvbkNhY2hlLnRlc3RzLmZpbHRlcih0ID0+ICF0LnNraXApLmxlbmd0aCk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMudGNSdW5uZXJUYXNrUHJvbWlzZSA9IHN1cGVyLnJ1bih0aGlzLm9wdHMpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMudGNSdW5uZXJUYXNrUHJvbWlzZTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldEJvb3RzdHJhcHBpbmdFcnJvcihudWxsKTtcblxuICAgICAgICAgICAgICAgIHJ1bkVycm9yID0gZXJyO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnRjUnVubmVyVGFza1Byb21pc2UgPSBudWxsO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5lbWl0KHRoaXMuVEVTVF9SVU5fRE9ORV9FVkVOVCwgeyBlcnI6IHJ1bkVycm9yIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgX3ZhbGlkYXRlUnVuT3B0aW9ucyAoKSB7XG4gICAgICAgIHJldHVybiBzdXBlci5fdmFsaWRhdGVSdW5PcHRpb25zKClcbiAgICAgICAgICAgIC5jYXRjaChlcnIgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMucmVqZWN0SW5maW5pdGVXYWl0aW5nKGVycik7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBfY3JlYXRlUnVubmFibGVDb25maWd1cmF0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMubGl2ZUNvbmZpZ3VyYXRpb25DYWNoZSlcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5saXZlQ29uZmlndXJhdGlvbkNhY2hlKTtcblxuICAgICAgICByZXR1cm4gc3VwZXIuX2NyZWF0ZVJ1bm5hYmxlQ29uZmlndXJhdGlvbigpXG4gICAgICAgICAgICAudGhlbihjb25maWd1cmF0aW9uID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmxpdmVDb25maWd1cmF0aW9uQ2FjaGUgPSBjb25maWd1cmF0aW9uO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbmZpZ3VyYXRpb247XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmNhdGNoKGVyciA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZWplY3RJbmZpbml0ZVdhaXRpbmcoZXJyKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIHNldEJvb3RzdHJhcHBpbmdFcnJvciAoZXJyKSB7XG4gICAgICAgIHRoaXMuYm9vdHN0cmFwcGluZ0Vycm9yID0gZXJyO1xuICAgIH1cblxuICAgIHJ1biAob3B0aW9ucykge1xuICAgICAgICBpZiAodGhpcy5wcmV2ZW50UnVuQ2FsbClcbiAgICAgICAgICAgIHRocm93IG5ldyBHZW5lcmFsRXJyb3IoUlVOVElNRV9FUlJPUlMuY2Fubm90UnVuTGl2ZU1vZGVSdW5uZXJNdWx0aXBsZVRpbWVzKTtcblxuICAgICAgICB0aGlzLnByZXZlbnRSdW5DYWxsID0gdHJ1ZTtcblxuICAgICAgICB0aGlzLm9wdHMgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLm9wdHMsIG9wdGlvbnMpO1xuXG4gICAgICAgIHRoaXMuX3NldEJvb3RzdHJhcHBlck9wdGlvbnMoKTtcblxuICAgICAgICBjb25zdCBmaWxlTGlzdFByb21pc2UgPSBwYXJzZUZpbGVMaXN0KHRoaXMuYm9vdHN0cmFwcGVyLnNvdXJjZXMsIHByb2Nlc3MuY3dkKCkpO1xuXG4gICAgICAgIGZpbGVMaXN0UHJvbWlzZVxuICAgICAgICAgICAgLnRoZW4oZmlsZXMgPT4gdGhpcy5jb250cm9sbGVyLmluaXQoZmlsZXMpKVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4gdGhpcy5fY3JlYXRlUnVubmFibGVDb25maWd1cmF0aW9uKCkpXG4gICAgICAgICAgICAudGhlbigoKSA9PiB0aGlzLnJ1blRlc3RzKHRydWUpKTtcblxuXG4gICAgICAgIHJldHVybiB0aGlzLl93YWl0VW50aWxFeGl0KClcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fZGlzcG9zZSgpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnByZXZlbnRSdW5DYWxsID0gZmFsc2U7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBzdXNwZW5kICgpIHtcbiAgICAgICAgaWYgKCF0aGlzLnRjUnVubmVyVGFza1Byb21pc2UpXG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG5cbiAgICAgICAgdGhpcy5zdG9wcGluZyA9IHRydWU7XG4gICAgICAgIHRoaXMudGVzdFJ1bkNvbnRyb2xsZXIuc3RvcCgpO1xuICAgICAgICB0aGlzLnRjUnVubmVyVGFza1Byb21pc2UuY2FuY2VsKCk7XG5cblxuICAgICAgICByZXR1cm4gdGhpcy50ZXN0UnVuQ29udHJvbGxlci5hbGxUZXN0c0NvbXBsZXRlUHJvbWlzZVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuc3RvcHBpbmcgPSBmYWxzZTtcblxuICAgICAgICAgICAgICAgIHRoaXMuZW1pdCh0aGlzLlRFU1RfUlVOX0RPTkVfRVZFTlQsIHt9KTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIGV4aXQgKCkge1xuICAgICAgICBpZiAodGhpcy50Y1J1bm5lclRhc2tQcm9taXNlKVxuICAgICAgICAgICAgdGhpcy50Y1J1bm5lclRhc2tQcm9taXNlLmNhbmNlbCgpO1xuXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4gdGhpcy5zdG9wSW5maW5pdGVXYWl0aW5nKCkpO1xuICAgIH1cblxuICAgIGFzeW5jIF9maW5pc2hQcmV2aW91c1Rlc3RSdW5zICgpIHtcbiAgICAgICAgaWYgKCF0aGlzLmxpdmVDb25maWd1cmF0aW9uQ2FjaGUudGVzdHMpIHJldHVybjtcblxuICAgICAgICB0aGlzLnRlc3RSdW5Db250cm9sbGVyLnJ1bigpO1xuICAgIH1cblxuICAgIF92YWxpZGF0ZVJ1bm5hYmxlQ29uZmlndXJhdGlvbiAoaXNGaXJzdFJ1bikge1xuICAgICAgICBpZiAoaXNGaXJzdFJ1bikge1xuICAgICAgICAgICAgaWYgKHRoaXMuYm9vdHN0cmFwcGluZ0Vycm9yKVxuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdCh0aGlzLmJvb3RzdHJhcHBpbmdFcnJvcik7XG5cbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLmJvb3RzdHJhcHBlci5fZ2V0VGVzdHMoKVxuICAgICAgICAgICAgLnRoZW4odGVzdHMgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMubGl2ZUNvbmZpZ3VyYXRpb25DYWNoZS50ZXN0cyA9IHRlc3RzO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuYm9vdHN0cmFwcGluZ0Vycm9yID8gUHJvbWlzZS5yZWplY3QodGhpcy5ib290c3RyYXBwaW5nRXJyb3IpIDogUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBfY3JlYXRlVGFzayAodGVzdHMsIGJyb3dzZXJDb25uZWN0aW9uR3JvdXBzLCBwcm94eSwgb3B0cykge1xuICAgICAgICBvcHRzLmxpdmUgPSB0cnVlO1xuXG4gICAgICAgIHJldHVybiBzdXBlci5fY3JlYXRlVGFzayh0ZXN0cywgYnJvd3NlckNvbm5lY3Rpb25Hcm91cHMsIHByb3h5LCBvcHRzKTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQm9vdHN0cmFwcGVyIChicm93c2VyQ29ubmVjdGlvbkdhdGV3YXkpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBMaXZlTW9kZUJvb3RzdHJhcHBlcih0aGlzLCBicm93c2VyQ29ubmVjdGlvbkdhdGV3YXkpO1xuICAgIH1cblxuICAgIF9jcmVhdGVDb250cm9sbGVyICgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBMaXZlTW9kZUNvbnRyb2xsZXIodGhpcyk7XG4gICAgfVxuXG4gICAgX3dhaXRVbnRpbEV4aXQgKCkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zdG9wSW5maW5pdGVXYWl0aW5nICAgPSByZXNvbHZlO1xuICAgICAgICAgICAgdGhpcy5yZWplY3RJbmZpbml0ZVdhaXRpbmcgPSByZWplY3Q7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIF9kaXNwb3NlQXNzZXRzIChicm93c2VyU2V0LCByZXBvcnRlcnMsIHRlc3RlZEFwcCkge1xuICAgICAgICB0aGlzLmFzc2V0cyA9IHsgYnJvd3NlclNldCwgcmVwb3J0ZXJzLCB0ZXN0ZWRBcHAgfTtcblxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgfVxuXG4gICAgX2Rpc3Bvc2UgKCkge1xuICAgICAgICB0aGlzLmNvbnRyb2xsZXIuZGlzcG9zZSgpO1xuXG4gICAgICAgIGlmICghdGhpcy5hc3NldHMpXG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG5cbiAgICAgICAgY29uc3QgeyBicm93c2VyU2V0LCByZXBvcnRlcnMsIHRlc3RlZEFwcCB9ID0gdGhpcy5hc3NldHM7XG5cbiAgICAgICAgcmV0dXJuIHN1cGVyLl9kaXNwb3NlQXNzZXRzKGJyb3dzZXJTZXQsIHJlcG9ydGVycywgdGVzdGVkQXBwKTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IExpdmVNb2RlUnVubmVyO1xuIl19
