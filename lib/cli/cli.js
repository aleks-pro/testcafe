'use strict';

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

let runTests = (() => {
    var _ref = (0, _asyncToGenerator3.default)(function* (argParser) {
        const opts = argParser.opts;
        const port1 = opts.ports && opts.ports[0];
        const port2 = opts.ports && opts.ports[1];
        const proxy = opts.proxy;
        const proxyBypass = opts.proxyBypass;

        _log2.default.showSpinner();

        const testCafe = yield (0, _2.default)(opts.hostname, port1, port2, opts.ssl, opts.dev);

        const correctedBrowsersAndSources = yield (0, _correctBrowsersAndSources2.default)(argParser, testCafe.configuration);
        const automatedBrowsers = correctedBrowsersAndSources.browsers;
        const remoteBrowsers = yield (0, _remotesWizard2.default)(testCafe, argParser.remoteCount, opts.qrCode);
        const browsers = automatedBrowsers.concat(remoteBrowsers);
        const sources = correctedBrowsersAndSources.sources;

        const runner = opts.live ? testCafe.createLiveModeRunner() : testCafe.createRunner();

        let failed = 0;

        runner.isCli = true;

        runner.useProxy(proxy, proxyBypass).src(sources).browsers(browsers).reporter(argParser.opts.reporter).concurrency(argParser.opts.concurrency).filter(argParser.filter).video(opts.video, opts.videoOptions, opts.videoEncodingOptions).screenshots(opts.screenshots, opts.screenshotsOnFails, opts.screenshotPathPattern).startApp(opts.app, opts.appInitDelay);

        runner.once('done-bootstrapping', function () {
            return _log2.default.hideSpinner();
        });

        try {
            failed = yield runner.run(opts);
        } finally {
            showMessageOnExit = false;
            yield testCafe.close();
        }

        exit(failed);
    });

    return function runTests(_x) {
        return _ref.apply(this, arguments);
    };
})();

let listBrowsers = (() => {
    var _ref2 = (0, _asyncToGenerator3.default)(function* (providerName = 'locally-installed') {
        const provider = yield browserProviderPool.getProvider(providerName);

        if (!provider) throw new _runtime.GeneralError(_types.RUNTIME_ERRORS.browserProviderNotFound, providerName);

        if (provider.isMultiBrowser) {
            const browserNames = yield provider.getBrowserList();

            yield browserProviderPool.dispose();

            if (providerName === 'locally-installed') console.log(browserNames.join('\n'));else console.log(browserNames.map(function (browserName) {
                return `"${providerName}:${browserName}"`;
            }).join('\n'));
        } else console.log(`"${providerName}"`);

        exit(0);
    });

    return function listBrowsers() {
        return _ref2.apply(this, arguments);
    };
})();

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _runtime = require('../errors/runtime');

var _types = require('../errors/types');

var _argumentParser = require('./argument-parser');

var _argumentParser2 = _interopRequireDefault(_argumentParser);

var _terminationHandler = require('./termination-handler');

var _terminationHandler2 = _interopRequireDefault(_terminationHandler);

var _log = require('./log');

var _log2 = _interopRequireDefault(_log);

var _remotesWizard = require('./remotes-wizard');

var _remotesWizard2 = _interopRequireDefault(_remotesWizard);

var _correctBrowsersAndSources = require('./correct-browsers-and-sources');

var _correctBrowsersAndSources2 = _interopRequireDefault(_correctBrowsersAndSources);

var _ = require('../');

var _2 = _interopRequireDefault(_);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// NOTE: Load the provider pool lazily to reduce startup time
const lazyRequire = require('import-lazy')(require);
const browserProviderPool = lazyRequire('../browser/provider/pool');

let showMessageOnExit = true;
let exitMessageShown = false;
let exiting = false;

function exitHandler(terminationLevel) {
    if (showMessageOnExit && !exitMessageShown) {
        exitMessageShown = true;

        _log2.default.write('Stopping TestCafe...');

        process.on('exit', () => _log2.default.hideSpinner(true));
    }

    if (exiting || terminationLevel < 2) return;

    exiting = true;

    exit(0);
}

function exit(code) {
    _log2.default.hideSpinner(true);

    // NOTE: give a process time to flush the output.
    // It's necessary in some environments.
    setTimeout(() => process.exit(code), 0);
}

function error(err) {
    _log2.default.hideSpinner();

    let message = null;

    if (err instanceof _runtime.GeneralError) message = err.message;else if (err instanceof _runtime.APIError) message = err.coloredStack;else message = err.stack;

    _log2.default.write(_chalk2.default.red('ERROR ') + message + '\n');
    _log2.default.write(_chalk2.default.gray('Type "testcafe -h" for help.'));

    exit(1);
}

(() => {
    var _ref3 = (0, _asyncToGenerator3.default)(function* () {
        const terminationHandler = new _terminationHandler2.default();

        terminationHandler.on(_terminationHandler2.default.TERMINATION_LEVEL_INCREASED_EVENT, exitHandler);

        try {
            const argParser = new _argumentParser2.default();

            yield argParser.parse(process.argv);

            if (argParser.opts.listBrowsers) yield listBrowsers(argParser.opts.providerName);else yield runTests(argParser);
        } catch (err) {
            showMessageOnExit = false;
            error(err);
        }
    });

    function cli() {
        return _ref3.apply(this, arguments);
    }

    return cli;
})()();
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jbGkvY2xpLmpzIl0sIm5hbWVzIjpbImFyZ1BhcnNlciIsIm9wdHMiLCJwb3J0MSIsInBvcnRzIiwicG9ydDIiLCJwcm94eSIsInByb3h5QnlwYXNzIiwic2hvd1NwaW5uZXIiLCJ0ZXN0Q2FmZSIsImhvc3RuYW1lIiwic3NsIiwiZGV2IiwiY29ycmVjdGVkQnJvd3NlcnNBbmRTb3VyY2VzIiwiY29uZmlndXJhdGlvbiIsImF1dG9tYXRlZEJyb3dzZXJzIiwiYnJvd3NlcnMiLCJyZW1vdGVCcm93c2VycyIsInJlbW90ZUNvdW50IiwicXJDb2RlIiwiY29uY2F0Iiwic291cmNlcyIsInJ1bm5lciIsImxpdmUiLCJjcmVhdGVMaXZlTW9kZVJ1bm5lciIsImNyZWF0ZVJ1bm5lciIsImZhaWxlZCIsImlzQ2xpIiwidXNlUHJveHkiLCJzcmMiLCJyZXBvcnRlciIsImNvbmN1cnJlbmN5IiwiZmlsdGVyIiwidmlkZW8iLCJ2aWRlb09wdGlvbnMiLCJ2aWRlb0VuY29kaW5nT3B0aW9ucyIsInNjcmVlbnNob3RzIiwic2NyZWVuc2hvdHNPbkZhaWxzIiwic2NyZWVuc2hvdFBhdGhQYXR0ZXJuIiwic3RhcnRBcHAiLCJhcHAiLCJhcHBJbml0RGVsYXkiLCJvbmNlIiwiaGlkZVNwaW5uZXIiLCJydW4iLCJzaG93TWVzc2FnZU9uRXhpdCIsImNsb3NlIiwiZXhpdCIsInJ1blRlc3RzIiwicHJvdmlkZXJOYW1lIiwicHJvdmlkZXIiLCJicm93c2VyUHJvdmlkZXJQb29sIiwiZ2V0UHJvdmlkZXIiLCJicm93c2VyUHJvdmlkZXJOb3RGb3VuZCIsImlzTXVsdGlCcm93c2VyIiwiYnJvd3Nlck5hbWVzIiwiZ2V0QnJvd3Nlckxpc3QiLCJkaXNwb3NlIiwiY29uc29sZSIsImxvZyIsImpvaW4iLCJtYXAiLCJicm93c2VyTmFtZSIsImxpc3RCcm93c2VycyIsImxhenlSZXF1aXJlIiwicmVxdWlyZSIsImV4aXRNZXNzYWdlU2hvd24iLCJleGl0aW5nIiwiZXhpdEhhbmRsZXIiLCJ0ZXJtaW5hdGlvbkxldmVsIiwid3JpdGUiLCJwcm9jZXNzIiwib24iLCJjb2RlIiwic2V0VGltZW91dCIsImVycm9yIiwiZXJyIiwibWVzc2FnZSIsImNvbG9yZWRTdGFjayIsInN0YWNrIiwicmVkIiwiZ3JheSIsInRlcm1pbmF0aW9uSGFuZGxlciIsIlRFUk1JTkFUSU9OX0xFVkVMX0lOQ1JFQVNFRF9FVkVOVCIsInBhcnNlIiwiYXJndiIsImNsaSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OzsrQ0ErREEsV0FBeUJBLFNBQXpCLEVBQW9DO0FBQ2hDLGNBQU1DLE9BQW9CRCxVQUFVQyxJQUFwQztBQUNBLGNBQU1DLFFBQW9CRCxLQUFLRSxLQUFMLElBQWNGLEtBQUtFLEtBQUwsQ0FBVyxDQUFYLENBQXhDO0FBQ0EsY0FBTUMsUUFBb0JILEtBQUtFLEtBQUwsSUFBY0YsS0FBS0UsS0FBTCxDQUFXLENBQVgsQ0FBeEM7QUFDQSxjQUFNRSxRQUFvQkosS0FBS0ksS0FBL0I7QUFDQSxjQUFNQyxjQUFvQkwsS0FBS0ssV0FBL0I7O0FBRUEsc0JBQUlDLFdBQUo7O0FBRUEsY0FBTUMsV0FBVyxNQUFNLGdCQUFlUCxLQUFLUSxRQUFwQixFQUE4QlAsS0FBOUIsRUFBcUNFLEtBQXJDLEVBQTRDSCxLQUFLUyxHQUFqRCxFQUFzRFQsS0FBS1UsR0FBM0QsQ0FBdkI7O0FBRUEsY0FBTUMsOEJBQThCLE1BQU0seUNBQTBCWixTQUExQixFQUFxQ1EsU0FBU0ssYUFBOUMsQ0FBMUM7QUFDQSxjQUFNQyxvQkFBOEJGLDRCQUE0QkcsUUFBaEU7QUFDQSxjQUFNQyxpQkFBOEIsTUFBTSw2QkFBY1IsUUFBZCxFQUF3QlIsVUFBVWlCLFdBQWxDLEVBQStDaEIsS0FBS2lCLE1BQXBELENBQTFDO0FBQ0EsY0FBTUgsV0FBOEJELGtCQUFrQkssTUFBbEIsQ0FBeUJILGNBQXpCLENBQXBDO0FBQ0EsY0FBTUksVUFBOEJSLDRCQUE0QlEsT0FBaEU7O0FBRUEsY0FBTUMsU0FBU3BCLEtBQUtxQixJQUFMLEdBQVlkLFNB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QUFBQTtBQUFBOztBQUFBLFdBQWdCQSxHQUFoQjtBQUFBIiwiZmlsZSI6ImNsaS9jbGkuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgY2hhbGsgZnJvbSAnY2hhbGsnO1xuaW1wb3J0IHsgR2VuZXJhbEVycm9yLCBBUElFcnJvciB9IGZyb20gJy4uL2Vycm9ycy9ydW50aW1lJztcbmltcG9ydCB7IFJVTlRJTUVfRVJST1JTIH0gZnJvbSAnLi4vZXJyb3JzL3R5cGVzJztcbmltcG9ydCBDbGlBcmd1bWVudFBhcnNlciBmcm9tICcuL2FyZ3VtZW50LXBhcnNlcic7XG5pbXBvcnQgVGVybWluYXRpb25IYW5kbGVyIGZyb20gJy4vdGVybWluYXRpb24taGFuZGxlcic7XG5pbXBvcnQgbG9nIGZyb20gJy4vbG9nJztcbmltcG9ydCByZW1vdGVzV2l6YXJkIGZyb20gJy4vcmVtb3Rlcy13aXphcmQnO1xuaW1wb3J0IGNvcnJlY3RCcm93c2Vyc0FuZFNvdXJjZXMgZnJvbSAnLi9jb3JyZWN0LWJyb3dzZXJzLWFuZC1zb3VyY2VzJztcbmltcG9ydCBjcmVhdGVUZXN0Q2FmZSBmcm9tICcuLi8nO1xuXG4vLyBOT1RFOiBMb2FkIHRoZSBwcm92aWRlciBwb29sIGxhemlseSB0byByZWR1Y2Ugc3RhcnR1cCB0aW1lXG5jb25zdCBsYXp5UmVxdWlyZSAgICAgICAgID0gcmVxdWlyZSgnaW1wb3J0LWxhenknKShyZXF1aXJlKTtcbmNvbnN0IGJyb3dzZXJQcm92aWRlclBvb2wgPSBsYXp5UmVxdWlyZSgnLi4vYnJvd3Nlci9wcm92aWRlci9wb29sJyk7XG5cbmxldCBzaG93TWVzc2FnZU9uRXhpdCA9IHRydWU7XG5sZXQgZXhpdE1lc3NhZ2VTaG93biAgPSBmYWxzZTtcbmxldCBleGl0aW5nICAgICAgICAgICA9IGZhbHNlO1xuXG5mdW5jdGlvbiBleGl0SGFuZGxlciAodGVybWluYXRpb25MZXZlbCkge1xuICAgIGlmIChzaG93TWVzc2FnZU9uRXhpdCAmJiAhZXhpdE1lc3NhZ2VTaG93bikge1xuICAgICAgICBleGl0TWVzc2FnZVNob3duID0gdHJ1ZTtcblxuICAgICAgICBsb2cud3JpdGUoJ1N0b3BwaW5nIFRlc3RDYWZlLi4uJyk7XG5cbiAgICAgICAgcHJvY2Vzcy5vbignZXhpdCcsICgpID0+IGxvZy5oaWRlU3Bpbm5lcih0cnVlKSk7XG4gICAgfVxuXG4gICAgaWYgKGV4aXRpbmcgfHwgdGVybWluYXRpb25MZXZlbCA8IDIpXG4gICAgICAgIHJldHVybjtcblxuICAgIGV4aXRpbmcgPSB0cnVlO1xuXG4gICAgZXhpdCgwKTtcbn1cblxuZnVuY3Rpb24gZXhpdCAoY29kZSkge1xuICAgIGxvZy5oaWRlU3Bpbm5lcih0cnVlKTtcblxuICAgIC8vIE5PVEU6IGdpdmUgYSBwcm9jZXNzIHRpbWUgdG8gZmx1c2ggdGhlIG91dHB1dC5cbiAgICAvLyBJdCdzIG5lY2Vzc2FyeSBpbiBzb21lIGVudmlyb25tZW50cy5cbiAgICBzZXRUaW1lb3V0KCgpID0+IHByb2Nlc3MuZXhpdChjb2RlKSwgMCk7XG59XG5cbmZ1bmN0aW9uIGVycm9yIChlcnIpIHtcbiAgICBsb2cuaGlkZVNwaW5uZXIoKTtcblxuICAgIGxldCBtZXNzYWdlID0gbnVsbDtcblxuICAgIGlmIChlcnIgaW5zdGFuY2VvZiBHZW5lcmFsRXJyb3IpXG4gICAgICAgIG1lc3NhZ2UgPSBlcnIubWVzc2FnZTtcblxuICAgIGVsc2UgaWYgKGVyciBpbnN0YW5jZW9mIEFQSUVycm9yKVxuICAgICAgICBtZXNzYWdlID0gZXJyLmNvbG9yZWRTdGFjaztcblxuICAgIGVsc2VcbiAgICAgICAgbWVzc2FnZSA9IGVyci5zdGFjaztcblxuICAgIGxvZy53cml0ZShjaGFsay5yZWQoJ0VSUk9SICcpICsgbWVzc2FnZSArICdcXG4nKTtcbiAgICBsb2cud3JpdGUoY2hhbGsuZ3JheSgnVHlwZSBcInRlc3RjYWZlIC1oXCIgZm9yIGhlbHAuJykpO1xuXG4gICAgZXhpdCgxKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gcnVuVGVzdHMgKGFyZ1BhcnNlcikge1xuICAgIGNvbnN0IG9wdHMgICAgICAgICAgICAgID0gYXJnUGFyc2VyLm9wdHM7XG4gICAgY29uc3QgcG9ydDEgICAgICAgICAgICAgPSBvcHRzLnBvcnRzICYmIG9wdHMucG9ydHNbMF07XG4gICAgY29uc3QgcG9ydDIgICAgICAgICAgICAgPSBvcHRzLnBvcnRzICYmIG9wdHMucG9ydHNbMV07XG4gICAgY29uc3QgcHJveHkgICAgICAgICAgICAgPSBvcHRzLnByb3h5O1xuICAgIGNvbnN0IHByb3h5QnlwYXNzICAgICAgID0gb3B0cy5wcm94eUJ5cGFzcztcblxuICAgIGxvZy5zaG93U3Bpbm5lcigpO1xuXG4gICAgY29uc3QgdGVzdENhZmUgPSBhd2FpdCBjcmVhdGVUZXN0Q2FmZShvcHRzLmhvc3RuYW1lLCBwb3J0MSwgcG9ydDIsIG9wdHMuc3NsLCBvcHRzLmRldik7XG5cbiAgICBjb25zdCBjb3JyZWN0ZWRCcm93c2Vyc0FuZFNvdXJjZXMgPSBhd2FpdCBjb3JyZWN0QnJvd3NlcnNBbmRTb3VyY2VzKGFyZ1BhcnNlciwgdGVzdENhZmUuY29uZmlndXJhdGlvbik7XG4gICAgY29uc3QgYXV0b21hdGVkQnJvd3NlcnMgICAgICAgICAgID0gY29ycmVjdGVkQnJvd3NlcnNBbmRTb3VyY2VzLmJyb3dzZXJzO1xuICAgIGNvbnN0IHJlbW90ZUJyb3dzZXJzICAgICAgICAgICAgICA9IGF3YWl0IHJlbW90ZXNXaXphcmQodGVzdENhZmUsIGFyZ1BhcnNlci5yZW1vdGVDb3VudCwgb3B0cy5xckNvZGUpO1xuICAgIGNvbnN0IGJyb3dzZXJzICAgICAgICAgICAgICAgICAgICA9IGF1dG9tYXRlZEJyb3dzZXJzLmNvbmNhdChyZW1vdGVCcm93c2Vycyk7XG4gICAgY29uc3Qgc291cmNlcyAgICAgICAgICAgICAgICAgICAgID0gY29ycmVjdGVkQnJvd3NlcnNBbmRTb3VyY2VzLnNvdXJjZXM7XG5cbiAgICBjb25zdCBydW5uZXIgPSBvcHRzLmxpdmUgPyB0ZXN0Q2FmZS5jcmVhdGVMaXZlTW9kZVJ1bm5lcigpIDogdGVzdENhZmUuY3JlYXRlUnVubmVyKCk7XG5cbiAgICBsZXQgZmFpbGVkID0gMDtcblxuXG4gICAgcnVubmVyLmlzQ2xpID0gdHJ1ZTtcblxuICAgIHJ1bm5lclxuICAgICAgICAudXNlUHJveHkocHJveHksIHByb3h5QnlwYXNzKVxuICAgICAgICAuc3JjKHNvdXJjZXMpXG4gICAgICAgIC5icm93c2Vycyhicm93c2VycylcbiAgICAgICAgLnJlcG9ydGVyKGFyZ1BhcnNlci5vcHRzLnJlcG9ydGVyKVxuICAgICAgICAuY29uY3VycmVuY3koYXJnUGFyc2VyLm9wdHMuY29uY3VycmVuY3kpXG4gICAgICAgIC5maWx0ZXIoYXJnUGFyc2VyLmZpbHRlcilcbiAgICAgICAgLnZpZGVvKG9wdHMudmlkZW8sIG9wdHMudmlkZW9PcHRpb25zLCBvcHRzLnZpZGVvRW5jb2RpbmdPcHRpb25zKVxuICAgICAgICAuc2NyZWVuc2hvdHMob3B0cy5zY3JlZW5zaG90cywgb3B0cy5zY3JlZW5zaG90c09uRmFpbHMsIG9wdHMuc2NyZWVuc2hvdFBhdGhQYXR0ZXJuKVxuICAgICAgICAuc3RhcnRBcHAob3B0cy5hcHAsIG9wdHMuYXBwSW5pdERlbGF5KTtcblxuICAgIHJ1bm5lci5vbmNlKCdkb25lLWJvb3RzdHJhcHBpbmcnLCAoKSA9PiBsb2cuaGlkZVNwaW5uZXIoKSk7XG5cbiAgICB0cnkge1xuICAgICAgICBmYWlsZWQgPSBhd2FpdCBydW5uZXIucnVuKG9wdHMpO1xuICAgIH1cblxuICAgIGZpbmFsbHkge1xuICAgICAgICBzaG93TWVzc2FnZU9uRXhpdCA9IGZhbHNlO1xuICAgICAgICBhd2FpdCB0ZXN0Q2FmZS5jbG9zZSgpO1xuICAgIH1cblxuICAgIGV4aXQoZmFpbGVkKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gbGlzdEJyb3dzZXJzIChwcm92aWRlck5hbWUgPSAnbG9jYWxseS1pbnN0YWxsZWQnKSB7XG4gICAgY29uc3QgcHJvdmlkZXIgPSBhd2FpdCBicm93c2VyUHJvdmlkZXJQb29sLmdldFByb3ZpZGVyKHByb3ZpZGVyTmFtZSk7XG5cbiAgICBpZiAoIXByb3ZpZGVyKVxuICAgICAgICB0aHJvdyBuZXcgR2VuZXJhbEVycm9yKFJVTlRJTUVfRVJST1JTLmJyb3dzZXJQcm92aWRlck5vdEZvdW5kLCBwcm92aWRlck5hbWUpO1xuXG4gICAgaWYgKHByb3ZpZGVyLmlzTXVsdGlCcm93c2VyKSB7XG4gICAgICAgIGNvbnN0IGJyb3dzZXJOYW1lcyA9IGF3YWl0IHByb3ZpZGVyLmdldEJyb3dzZXJMaXN0KCk7XG5cbiAgICAgICAgYXdhaXQgYnJvd3NlclByb3ZpZGVyUG9vbC5kaXNwb3NlKCk7XG5cbiAgICAgICAgaWYgKHByb3ZpZGVyTmFtZSA9PT0gJ2xvY2FsbHktaW5zdGFsbGVkJylcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGJyb3dzZXJOYW1lcy5qb2luKCdcXG4nKSk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGJyb3dzZXJOYW1lcy5tYXAoYnJvd3Nlck5hbWUgPT4gYFwiJHtwcm92aWRlck5hbWV9OiR7YnJvd3Nlck5hbWV9XCJgKS5qb2luKCdcXG4nKSk7XG4gICAgfVxuICAgIGVsc2VcbiAgICAgICAgY29uc29sZS5sb2coYFwiJHtwcm92aWRlck5hbWV9XCJgKTtcblxuICAgIGV4aXQoMCk7XG59XG5cbihhc3luYyBmdW5jdGlvbiBjbGkgKCkge1xuICAgIGNvbnN0IHRlcm1pbmF0aW9uSGFuZGxlciA9IG5ldyBUZXJtaW5hdGlvbkhhbmRsZXIoKTtcblxuICAgIHRlcm1pbmF0aW9uSGFuZGxlci5vbihUZXJtaW5hdGlvbkhhbmRsZXIuVEVSTUlOQVRJT05fTEVWRUxfSU5DUkVBU0VEX0VWRU5ULCBleGl0SGFuZGxlcik7XG5cbiAgICB0cnkge1xuICAgICAgICBjb25zdCBhcmdQYXJzZXIgPSBuZXcgQ2xpQXJndW1lbnRQYXJzZXIoKTtcblxuICAgICAgICBhd2FpdCBhcmdQYXJzZXIucGFyc2UocHJvY2Vzcy5hcmd2KTtcblxuICAgICAgICBpZiAoYXJnUGFyc2VyLm9wdHMubGlzdEJyb3dzZXJzKVxuICAgICAgICAgICAgYXdhaXQgbGlzdEJyb3dzZXJzKGFyZ1BhcnNlci5vcHRzLnByb3ZpZGVyTmFtZSk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGF3YWl0IHJ1blRlc3RzKGFyZ1BhcnNlcik7XG4gICAgfVxuICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgc2hvd01lc3NhZ2VPbkV4aXQgPSBmYWxzZTtcbiAgICAgICAgZXJyb3IoZXJyKTtcbiAgICB9XG59KSgpO1xuXG4iXX0=
