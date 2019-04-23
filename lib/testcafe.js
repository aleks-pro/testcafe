'use strict';

exports.__esModule = true;

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _pinkie = require('pinkie');

var _pinkie2 = _interopRequireDefault(_pinkie);

var _runtime = require('./errors/runtime');

var _types = require('./errors/types');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const lazyRequire = require('import-lazy')(require);
const sourceMapSupport = lazyRequire('source-map-support');
const hammerhead = lazyRequire('testcafe-hammerhead');
const loadAssets = lazyRequire('./load-assets');
const errorHandlers = lazyRequire('./utils/handle-errors');
const BrowserConnectionGateway = lazyRequire('./browser/connection/gateway');
const BrowserConnection = lazyRequire('./browser/connection');
const browserProviderPool = lazyRequire('./browser/provider/pool');
const Runner = lazyRequire('./runner');
const LiveModeRunner = lazyRequire('./live/test-runner');

// NOTE: CoffeeScript can't be loaded lazily, because it will break stack traces
require('coffeescript');

class TestCafe {
    constructor(configuration) {
        this._setupSourceMapsSupport();
        errorHandlers.registerErrorHandlers();

        var _configuration$startO = configuration.startOptions;
        const hostname = _configuration$startO.hostname,
              port1 = _configuration$startO.port1,
              port2 = _configuration$startO.port2,
              options = _configuration$startO.options;


        this.closed = false;
        this.proxy = new hammerhead.Proxy(hostname, port1, port2, options);
        this.browserConnectionGateway = new BrowserConnectionGateway(this.proxy, { retryTestPages: configuration.getOption('retryTestPages') });
        this.runners = [];
        this.configuration = configuration;

        this._registerAssets(options.developmentMode);
    }

    _registerAssets(developmentMode) {
        var _loadAssets = loadAssets(developmentMode);

        const favIcon = _loadAssets.favIcon,
              coreScript = _loadAssets.coreScript,
              driverScript = _loadAssets.driverScript,
              uiScript = _loadAssets.uiScript,
              uiStyle = _loadAssets.uiStyle,
              uiSprite = _loadAssets.uiSprite,
              automationScript = _loadAssets.automationScript,
              legacyRunnerScript = _loadAssets.legacyRunnerScript;


        this.proxy.GET('/testcafe-core.js', { content: coreScript, contentType: 'application/x-javascript' });
        this.proxy.GET('/testcafe-driver.js', { content: driverScript, contentType: 'application/x-javascript' });

        this.proxy.GET('/testcafe-legacy-runner.js', {
            content: legacyRunnerScript,
            contentType: 'application/x-javascript'
        });

        this.proxy.GET('/testcafe-automation.js', { content: automationScript, contentType: 'application/x-javascript' });
        this.proxy.GET('/testcafe-ui.js', { content: uiScript, contentType: 'application/x-javascript' });
        this.proxy.GET('/testcafe-ui-sprite.png', { content: uiSprite, contentType: 'image/png' });
        this.proxy.GET('/favicon.ico', { content: favIcon, contentType: 'image/x-icon' });

        this.proxy.GET('/testcafe-ui-styles.css', {
            content: uiStyle,
            contentType: 'text/css',
            isShadowUIStylesheet: true
        });
    }

    _setupSourceMapsSupport() {
        sourceMapSupport.install({
            hookRequire: true,
            handleUncaughtExceptions: false,
            environment: 'node'
        });
    }

    _createRunner(isLiveMode) {
        const Ctor = isLiveMode ? LiveModeRunner : Runner;
        const newRunner = new Ctor(this.proxy, this.browserConnectionGateway, this.configuration.clone());

        this.runners.push(newRunner);

        return newRunner;
    }

    // API
    createBrowserConnection() {
        var _this = this;

        return (0, _asyncToGenerator3.default)(function* () {
            const browserInfo = yield browserProviderPool.getBrowserInfo('remote');

            return new BrowserConnection(_this.browserConnectionGateway, browserInfo, true);
        })();
    }

    createRunner() {
        return this._createRunner(false);
    }

    createLiveModeRunner() {
        if (this.runners.some(runner => runner instanceof LiveModeRunner)) throw new _runtime.GeneralError(_types.RUNTIME_ERRORS.cannotCreateMultipleLiveModeRunners);

        return this._createRunner(true);
    }

    close() {
        var _this2 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            if (_this2.closed) return;

            _this2.closed = true;

            yield _pinkie2.default.all(_this2.runners.map(function (runner) {
                return runner.stop();
            }));

            yield browserProviderPool.dispose();

            _this2.browserConnectionGateway.close();
            _this2.proxy.close();
        })();
    }
}
exports.default = TestCafe;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy90ZXN0Y2FmZS5qcyJdLCJuYW1lcyI6WyJsYXp5UmVxdWlyZSIsInJlcXVpcmUiLCJzb3VyY2VNYXBTdXBwb3J0IiwiaGFtbWVyaGVhZCIsImxvYWRBc3NldHMiLCJlcnJvckhhbmRsZXJzIiwiQnJvd3NlckNvbm5lY3Rpb25HYXRld2F5IiwiQnJvd3NlckNvbm5lY3Rpb24iLCJicm93c2VyUHJvdmlkZXJQb29sIiwiUnVubmVyIiwiTGl2ZU1vZGVSdW5uZXIiLCJUZXN0Q2FmZSIsImNvbnN0cnVjdG9yIiwiY29uZmlndXJhdGlvbiIsIl9zZXR1cFNvdXJjZU1hcHNTdXBwb3J0IiwicmVnaXN0ZXJFcnJvckhhbmRsZXJzIiwic3RhcnRPcHRpb25zIiwiaG9zdG5hbWUiLCJwb3J0MSIsInBvcnQyIiwib3B0aW9ucyIsImNsb3NlZCIsInByb3h5IiwiUHJveHkiLCJicm93c2VyQ29ubmVjdGlvbkdhdGV3YXkiLCJyZXRyeVRlc3RQYWdlcyIsImdldE9wdGlvbiIsInJ1bm5lcnMiLCJfcmVnaXN0ZXJBc3NldHMiLCJkZXZlbG9wbWVudE1vZGUiLCJmYXZJY29uIiwiY29yZVNjcmlwdCIsImRyaXZlclNjcmlwdCIsInVpU2NyaXB0IiwidWlTdHlsZSIsInVpU3ByaXRlIiwiYXV0b21hdGlvblNjcmlwdCIsImxlZ2FjeVJ1bm5lclNjcmlwdCIsIkdFVCIsImNvbnRlbnQiLCJjb250ZW50VHlwZSIsImlzU2hhZG93VUlTdHlsZXNoZWV0IiwiaW5zdGFsbCIsImhvb2tSZXF1aXJlIiwiaGFuZGxlVW5jYXVnaHRFeGNlcHRpb25zIiwiZW52aXJvbm1lbnQiLCJfY3JlYXRlUnVubmVyIiwiaXNMaXZlTW9kZSIsIkN0b3IiLCJuZXdSdW5uZXIiLCJjbG9uZSIsInB1c2giLCJjcmVhdGVCcm93c2VyQ29ubmVjdGlvbiIsImJyb3dzZXJJbmZvIiwiZ2V0QnJvd3NlckluZm8iLCJjcmVhdGVSdW5uZXIiLCJjcmVhdGVMaXZlTW9kZVJ1bm5lciIsInNvbWUiLCJydW5uZXIiLCJjYW5ub3RDcmVhdGVNdWx0aXBsZUxpdmVNb2RlUnVubmVycyIsImNsb3NlIiwiYWxsIiwibWFwIiwic3RvcCIsImRpc3Bvc2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUE7Ozs7QUFDQTs7QUFDQTs7OztBQUVBLE1BQU1BLGNBQTJCQyxRQUFRLGFBQVIsRUFBdUJBLE9BQXZCLENBQWpDO0FBQ0EsTUFBTUMsbUJBQTJCRixZQUFZLG9CQUFaLENBQWpDO0FBQ0EsTUFBTUcsYUFBMkJILFlBQVkscUJBQVosQ0FBakM7QUFDQSxNQUFNSSxhQUEyQkosWUFBWSxlQUFaLENBQWpDO0FBQ0EsTUFBTUssZ0JBQTJCTCxZQUFZLHVCQUFaLENBQWpDO0FBQ0EsTUFBTU0sMkJBQTJCTixZQUFZLDhCQUFaLENBQWpDO0FBQ0EsTUFBTU8sb0JBQTJCUCxZQUFZLHNCQUFaLENBQWpDO0FBQ0EsTUFBTVEsc0JBQTJCUixZQUFZLHlCQUFaLENBQWpDO0FBQ0EsTUFBTVMsU0FBMkJULFlBQVksVUFBWixDQUFqQztBQUNBLE1BQU1VLGlCQUEyQlYsWUFBWSxvQkFBWixDQUFqQzs7QUFFQTtBQUNBQyxRQUFRLGNBQVI7O0FBRWUsTUFBTVUsUUFBTixDQUFlO0FBQzFCQyxnQkFBYUMsYUFBYixFQUE0QjtBQUN4QixhQUFLQyx1QkFBTDtBQUNBVCxzQkFBY1UscUJBQWQ7O0FBRndCLG9DQUlvQkYsY0FBY0csWUFKbEM7QUFBQSxjQUloQkMsUUFKZ0IseUJBSWhCQSxRQUpnQjtBQUFBLGNBSU5DLEtBSk0seUJBSU5BLEtBSk07QUFBQSxjQUlDQyxLQUpELHlCQUlDQSxLQUpEO0FBQUEsY0FJUUMsT0FKUix5QkFJUUEsT0FKUjs7O0FBTXhCLGFBQUtDLE1BQUwsR0FBZ0MsS0FBaEM7QUFDQSxhQUFLQyxLQUFMLEdBQWdDLElBQUluQixXQUFXb0IsS0FBZixDQUFxQk4sUUFBckIsRUFBK0JDLEtBQS9CLEVBQXNDQyxLQUF0QyxFQUE2Q0MsT0FBN0MsQ0FBaEM7QUFDQSxhQUFLSSx3QkFBTCxHQUFnQyxJQUFJbEIs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UDtBQUNIOztBQUVEVSwyQkFBd0I7QUFDcEIsWUFBSSxLQUFLN0IsT0FBTCxDQUFhOEIsSUFBYixDQUFrQkMsVUFBVUEsa0JBQWtCaEQsY0FBOUMsQ0FBSixFQUNJLE1BQU0sMEJBQWlCLHNCQUFlaUQsbUNBQWhDLENBQU47O0FBRUosZUFBTyxLQUFLYixhQUFMLENBQW1CLElBQW5CLENBQVA7QUFDSDs7QUFFS2MsU0FBTixHQUFlO0FBQUE7O0FBQUE7QUFDWCxnQkFBSSxPQUFLdkMsTUFBVCxFQUNJOztBQUVKLG1CQUFLQSxNQUFMLEdBQWMsSUFBZDs7QUFFQSxrQkFBTSxpQkFBUXdDLEdBQVIsQ0FBWSxPQUFLbEMsT0FBTCxDQUFhbUMsR0FBYixDQUFpQjtBQUFBLHVCQUFVSixPQUFPSyxJQUFQLEVBQVY7QUFBQSxhQUFqQixDQUFaLENBQU47O0FBRUEsa0JBQU12RCxvQkFBb0J3RCxPQUFwQixFQUFOOztBQUVBLG1CQUFLeEMsd0JBQUwsQ0FBOEJvQyxLQUE5QjtBQUNBLG1CQUFLdEMsS0FBTCxDQUFXc0MsS0FBWDtBQVhXO0FBWWQ7QUF2RnlCO2tCQUFUakQsUSIsImZpbGUiOiJ0ZXN0Y2FmZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBQcm9taXNlIGZyb20gJ3BpbmtpZSc7XG5pbXBvcnQgeyBHZW5lcmFsRXJyb3IgfSBmcm9tICcuL2Vycm9ycy9ydW50aW1lJztcbmltcG9ydCB7IFJVTlRJTUVfRVJST1JTIH0gZnJvbSAnLi9lcnJvcnMvdHlwZXMnO1xuXG5jb25zdCBsYXp5UmVxdWlyZSAgICAgICAgICAgICAgPSByZXF1aXJlKCdpbXBvcnQtbGF6eScpKHJlcXVpcmUpO1xuY29uc3Qgc291cmNlTWFwU3VwcG9ydCAgICAgICAgID0gbGF6eVJlcXVpcmUoJ3NvdXJjZS1tYXAtc3VwcG9ydCcpO1xuY29uc3QgaGFtbWVyaGVhZCAgICAgICAgICAgICAgID0gbGF6eVJlcXVpcmUoJ3Rlc3RjYWZlLWhhbW1lcmhlYWQnKTtcbmNvbnN0IGxvYWRBc3NldHMgICAgICAgICAgICAgICA9IGxhenlSZXF1aXJlKCcuL2xvYWQtYXNzZXRzJyk7XG5jb25zdCBlcnJvckhhbmRsZXJzICAgICAgICAgICAgPSBsYXp5UmVxdWlyZSgnLi91dGlscy9oYW5kbGUtZXJyb3JzJyk7XG5jb25zdCBCcm93c2VyQ29ubmVjdGlvbkdhdGV3YXkgPSBsYXp5UmVxdWlyZSgnLi9icm93c2VyL2Nvbm5lY3Rpb24vZ2F0ZXdheScpO1xuY29uc3QgQnJvd3NlckNvbm5lY3Rpb24gICAgICAgID0gbGF6eVJlcXVpcmUoJy4vYnJvd3Nlci9jb25uZWN0aW9uJyk7XG5jb25zdCBicm93c2VyUHJvdmlkZXJQb29sICAgICAgPSBsYXp5UmVxdWlyZSgnLi9icm93c2VyL3Byb3ZpZGVyL3Bvb2wnKTtcbmNvbnN0IFJ1bm5lciAgICAgICAgICAgICAgICAgICA9IGxhenlSZXF1aXJlKCcuL3J1bm5lcicpO1xuY29uc3QgTGl2ZU1vZGVSdW5uZXIgICAgICAgICAgID0gbGF6eVJlcXVpcmUoJy4vbGl2ZS90ZXN0LXJ1bm5lcicpO1xuXG4vLyBOT1RFOiBDb2ZmZWVTY3JpcHQgY2FuJ3QgYmUgbG9hZGVkIGxhemlseSwgYmVjYXVzZSBpdCB3aWxsIGJyZWFrIHN0YWNrIHRyYWNlc1xucmVxdWlyZSgnY29mZmVlc2NyaXB0Jyk7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRlc3RDYWZlIHtcbiAgICBjb25zdHJ1Y3RvciAoY29uZmlndXJhdGlvbikge1xuICAgICAgICB0aGlzLl9zZXR1cFNvdXJjZU1hcHNTdXBwb3J0KCk7XG4gICAgICAgIGVycm9ySGFuZGxlcnMucmVnaXN0ZXJFcnJvckhhbmRsZXJzKCk7XG5cbiAgICAgICAgY29uc3QgeyBob3N0bmFtZSwgcG9ydDEsIHBvcnQyLCBvcHRpb25zIH0gPSBjb25maWd1cmF0aW9uLnN0YXJ0T3B0aW9ucztcblxuICAgICAgICB0aGlzLmNsb3NlZCAgICAgICAgICAgICAgICAgICA9IGZhbHNlO1xuICAgICAgICB0aGlzLnByb3h5ICAgICAgICAgICAgICAgICAgICA9IG5ldyBoYW1tZXJoZWFkLlByb3h5KGhvc3RuYW1lLCBwb3J0MSwgcG9ydDIsIG9wdGlvbnMpO1xuICAgICAgICB0aGlzLmJyb3dzZXJDb25uZWN0aW9uR2F0ZXdheSA9IG5ldyBCcm93c2VyQ29ubmVjdGlvbkdhdGV3YXkodGhpcy5wcm94eSwgeyByZXRyeVRlc3RQYWdlczogY29uZmlndXJhdGlvbi5nZXRPcHRpb24oJ3JldHJ5VGVzdFBhZ2VzJykgfSk7XG4gICAgICAgIHRoaXMucnVubmVycyAgICAgICAgICAgICAgICAgID0gW107XG4gICAgICAgIHRoaXMuY29uZmlndXJhdGlvbiAgICAgICAgICAgID0gY29uZmlndXJhdGlvbjtcblxuICAgICAgICB0aGlzLl9yZWdpc3RlckFzc2V0cyhvcHRpb25zLmRldmVsb3BtZW50TW9kZSk7XG4gICAgfVxuXG4gICAgX3JlZ2lzdGVyQXNzZXRzIChkZXZlbG9wbWVudE1vZGUpIHtcbiAgICAgICAgY29uc3QgeyBmYXZJY29uLCBjb3JlU2NyaXB0LCBkcml2ZXJTY3JpcHQsIHVpU2NyaXB0LFxuICAgICAgICAgICAgdWlTdHlsZSwgdWlTcHJpdGUsIGF1dG9tYXRpb25TY3JpcHQsIGxlZ2FjeVJ1bm5lclNjcmlwdCB9ID0gbG9hZEFzc2V0cyhkZXZlbG9wbWVudE1vZGUpO1xuXG4gICAgICAgIHRoaXMucHJveHkuR0VUKCcvdGVzdGNhZmUtY29yZS5qcycsIHsgY29udGVudDogY29yZVNjcmlwdCwgY29udGVudFR5cGU6ICdhcHBsaWNhdGlvbi94LWphdmFzY3JpcHQnIH0pO1xuICAgICAgICB0aGlzLnByb3h5LkdFVCgnL3Rlc3RjYWZlLWRyaXZlci5qcycsIHsgY29udGVudDogZHJpdmVyU2NyaXB0LCBjb250ZW50VHlwZTogJ2FwcGxpY2F0aW9uL3gtamF2YXNjcmlwdCcgfSk7XG5cbiAgICAgICAgdGhpcy5wcm94eS5HRVQoJy90ZXN0Y2FmZS1sZWdhY3ktcnVubmVyLmpzJywge1xuICAgICAgICAgICAgY29udGVudDogICAgIGxlZ2FjeVJ1bm5lclNjcmlwdCxcbiAgICAgICAgICAgIGNvbnRlbnRUeXBlOiAnYXBwbGljYXRpb24veC1qYXZhc2NyaXB0J1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnByb3h5LkdFVCgnL3Rlc3RjYWZlLWF1dG9tYXRpb24uanMnLCB7IGNvbnRlbnQ6IGF1dG9tYXRpb25TY3JpcHQsIGNvbnRlbnRUeXBlOiAnYXBwbGljYXRpb24veC1qYXZhc2NyaXB0JyB9KTtcbiAgICAgICAgdGhpcy5wcm94eS5HRVQoJy90ZXN0Y2FmZS11aS5qcycsIHsgY29udGVudDogdWlTY3JpcHQsIGNvbnRlbnRUeXBlOiAnYXBwbGljYXRpb24veC1qYXZhc2NyaXB0JyB9KTtcbiAgICAgICAgdGhpcy5wcm94eS5HRVQoJy90ZXN0Y2FmZS11aS1zcHJpdGUucG5nJywgeyBjb250ZW50OiB1aVNwcml0ZSwgY29udGVudFR5cGU6ICdpbWFnZS9wbmcnIH0pO1xuICAgICAgICB0aGlzLnByb3h5LkdFVCgnL2Zhdmljb24uaWNvJywgeyBjb250ZW50OiBmYXZJY29uLCBjb250ZW50VHlwZTogJ2ltYWdlL3gtaWNvbicgfSk7XG5cbiAgICAgICAgdGhpcy5wcm94eS5HRVQoJy90ZXN0Y2FmZS11aS1zdHlsZXMuY3NzJywge1xuICAgICAgICAgICAgY29udGVudDogICAgICAgICAgICAgIHVpU3R5bGUsXG4gICAgICAgICAgICBjb250ZW50VHlwZTogICAgICAgICAgJ3RleHQvY3NzJyxcbiAgICAgICAgICAgIGlzU2hhZG93VUlTdHlsZXNoZWV0OiB0cnVlXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIF9zZXR1cFNvdXJjZU1hcHNTdXBwb3J0ICgpIHtcbiAgICAgICAgc291cmNlTWFwU3VwcG9ydC5pbnN0YWxsKHtcbiAgICAgICAgICAgIGhvb2tSZXF1aXJlOiAgICAgICAgICAgICAgdHJ1ZSxcbiAgICAgICAgICAgIGhhbmRsZVVuY2F1Z2h0RXhjZXB0aW9uczogZmFsc2UsXG4gICAgICAgICAgICBlbnZpcm9ubWVudDogICAgICAgICAgICAgICdub2RlJ1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBfY3JlYXRlUnVubmVyIChpc0xpdmVNb2RlKSB7XG4gICAgICAgIGNvbnN0IEN0b3IgICAgICA9IGlzTGl2ZU1vZGUgPyBMaXZlTW9kZVJ1bm5lciA6IFJ1bm5lcjtcbiAgICAgICAgY29uc3QgbmV3UnVubmVyID0gbmV3IEN0b3IodGhpcy5wcm94eSwgdGhpcy5icm93c2VyQ29ubmVjdGlvbkdhdGV3YXksIHRoaXMuY29uZmlndXJhdGlvbi5jbG9uZSgpKTtcblxuICAgICAgICB0aGlzLnJ1bm5lcnMucHVzaChuZXdSdW5uZXIpO1xuXG4gICAgICAgIHJldHVybiBuZXdSdW5uZXI7XG4gICAgfVxuXG4gICAgLy8gQVBJXG4gICAgYXN5bmMgY3JlYXRlQnJvd3NlckNvbm5lY3Rpb24gKCkge1xuICAgICAgICBjb25zdCBicm93c2VySW5mbyA9IGF3YWl0IGJyb3dzZXJQcm92aWRlclBvb2wuZ2V0QnJvd3NlckluZm8oJ3JlbW90ZScpO1xuXG4gICAgICAgIHJldHVybiBuZXcgQnJvd3NlckNvbm5lY3Rpb24odGhpcy5icm93c2VyQ29ubmVjdGlvbkdhdGV3YXksIGJyb3dzZXJJbmZvLCB0cnVlKTtcbiAgICB9XG5cbiAgICBjcmVhdGVSdW5uZXIgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fY3JlYXRlUnVubmVyKGZhbHNlKTtcbiAgICB9XG5cbiAgICBjcmVhdGVMaXZlTW9kZVJ1bm5lciAoKSB7XG4gICAgICAgIGlmICh0aGlzLnJ1bm5lcnMuc29tZShydW5uZXIgPT4gcnVubmVyIGluc3RhbmNlb2YgTGl2ZU1vZGVSdW5uZXIpKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEdlbmVyYWxFcnJvcihSVU5USU1FX0VSUk9SUy5jYW5ub3RDcmVhdGVNdWx0aXBsZUxpdmVNb2RlUnVubmVycyk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX2NyZWF0ZVJ1bm5lcih0cnVlKTtcbiAgICB9XG5cbiAgICBhc3luYyBjbG9zZSAoKSB7XG4gICAgICAgIGlmICh0aGlzLmNsb3NlZClcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICB0aGlzLmNsb3NlZCA9IHRydWU7XG5cbiAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwodGhpcy5ydW5uZXJzLm1hcChydW5uZXIgPT4gcnVubmVyLnN0b3AoKSkpO1xuXG4gICAgICAgIGF3YWl0IGJyb3dzZXJQcm92aWRlclBvb2wuZGlzcG9zZSgpO1xuXG4gICAgICAgIHRoaXMuYnJvd3NlckNvbm5lY3Rpb25HYXRld2F5LmNsb3NlKCk7XG4gICAgICAgIHRoaXMucHJveHkuY2xvc2UoKTtcbiAgICB9XG59XG4iXX0=
