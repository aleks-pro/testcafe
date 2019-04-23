'use strict';

exports.__esModule = true;

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _commander = require('commander');

var _dedent = require('dedent');

var _dedent2 = _interopRequireDefault(_dedent);

var _readFileRelative = require('read-file-relative');

var _runtime = require('../errors/runtime');

var _types = require('../errors/types');

var _typeAssertions = require('../errors/runtime/type-assertions');

var _getViewportWidth = require('../utils/get-viewport-width');

var _getViewportWidth2 = _interopRequireDefault(_getViewportWidth);

var _string = require('../utils/string');

var _getOptions = require('../utils/get-options');

var _getFilterFn = require('../utils/get-filter-fn');

var _getFilterFn2 = _interopRequireDefault(_getFilterFn);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const REMOTE_ALIAS_RE = /^remote(?::(\d*))?$/;

const DESCRIPTION = (0, _dedent2.default)(`
    In the browser list, you can use browser names (e.g. "ie", "chrome", etc.) as well as paths to executables.

    To run tests against all installed browsers, use the "all" alias.

    To use a remote browser connection (e.g., to connect a mobile device), specify "remote" as the browser alias.
    If you need to connect multiple devices, add a colon and the number of browsers you want to connect (e.g., "remote:3").

    To run tests in a browser accessed through a browser provider plugin, specify a browser alias that consists of two parts - the browser provider name prefix and the name of the browser itself; for example, "saucelabs:chrome@51".

    You can use one or more file paths or glob patterns to specify which tests to run.

    More info: https://devexpress.github.io/testcafe/documentation
`);

class CLIArgumentParser {
    constructor(cwd) {
        this.program = new _commander.Command('testcafe');

        this.cwd = cwd || process.cwd();

        this.src = null;
        this.browsers = null;
        this.filter = null;
        this.remoteCount = 0;
        this.opts = null;

        this._describeProgram();
    }

    static _parsePortNumber(value) {
        (0, _typeAssertions.assertType)(_typeAssertions.is.nonNegativeNumberString, null, 'Port number', value);

        return parseInt(value, 10);
    }

    static _getDescription() {
        // NOTE: add empty line to workaround commander-forced indentation on the first line.
        return '\n' + (0, _string.wordWrap)(DESCRIPTION, 2, (0, _getViewportWidth2.default)(process.stdout));
    }

    _describeProgram() {
        const version = JSON.parse((0, _readFileRelative.readSync)('../../package.json')).version;

        this.program.version(version, '-v, --version').usage('[options] <comma-separated-browser-list> <file-or-glob ...>').description(CLIArgumentParser._getDescription()).option('-b, --list-browsers [provider]', 'output the aliases for local browsers or browsers available through the specified browser provider').option('-r, --reporter <name[:outputFile][,...]>', 'specify the reporters and optionally files where reports are saved').option('-s, --screenshots <path>', 'enable screenshot capturing and specify the path to save the screenshots to').option('-S, --screenshots-on-fails', 'take a screenshot whenever a test fails').option('-p, --screenshot-path-pattern <pattern>', 'use patterns to compose screenshot file names and paths: ${BROWSER}, ${BROWSER_VERSION}, ${OS}, etc.').option('-q, --quarantine-mode', 'enable the quarantine mode').option('-d, --debug-mode', 'execute test steps one by one pausing the test after each step').option('-e, --skip-js-errors', 'make tests not fail when a JS error happens on a page').option('-u, --skip-uncaught-errors', 'ignore uncaught errors and unhandled promise rejections, which occur during test execution').option('-t, --test <name>', 'run only tests with the specified name').option('-T, --test-grep <pattern>', 'run only tests matching the specified pattern').option('-f, --fixture <name>', 'run only fixtures with the specified name').option('-F, --fixture-grep <pattern>', 'run only fixtures matching the specified pattern').option('-a, --app <command>', 'launch the tested app using the specified command before running tests').option('-c, --concurrency <number>', 'run tests concurrently').option('-L, --live', 'enable live mode. In this mode, TestCafe watches for changes you make in the test files. These changes immediately restart the tests so that you can see the effect.').option('--test-meta <key=value[,key2=value2,...]>', 'run only tests with matching metadata').option('--fixture-meta <key=value[,key2=value2,...]>', 'run only fixtures with matching metadata').option('--debug-on-fail', 'pause the test if it fails').option('--app-init-delay <ms>', 'specify how much time it takes for the tested app to initialize').option('--selector-timeout <ms>', 'set the amount of time within which selectors make attempts to obtain a node to be returned').option('--assertion-timeout <ms>', 'set the amount of time within which assertion should pass').option('--page-load-timeout <ms>', 'set the amount of time within which TestCafe waits for the `window.load` event to fire on page load before proceeding to the next test action').option('--speed <factor>', 'set the speed of test execution (0.01 ... 1)').option('--ports <port1,port2>', 'specify custom port numbers').option('--hostname <name>', 'specify the hostname').option('--proxy <host>', 'specify the host of the proxy server').option('--proxy-bypass <rules>', 'specify a comma-separated list of rules that define URLs accessed bypassing the proxy server').option('--ssl <options>', 'specify SSL options to run TestCafe proxy server over the HTTPS protocol').option('--video <path>', ' record videos of test runs').option('--video-options <option=value[,...]>', 'specify video recording options').option('--video-encoding-options <option=value[,...]>', 'specify encoding options').option('--disable-page-reloads', 'disable page reloads between tests').option('--dev', 'enables mechanisms to log and diagnose errors').option('--qr-code', 'outputs QR-code that repeats URLs used to connect the remote browsers').option('--sf, --stop-on-first-fail', 'stop an entire test run if any test fails')

        // NOTE: these options will be handled by chalk internally
        .option('--color', 'force colors in command line').option('--no-color', 'disable colors in command line');
    }

    _filterAndCountRemotes(browser) {
        const remoteMatch = browser.match(REMOTE_ALIAS_RE);

        if (remoteMatch) {
            this.remoteCount += parseInt(remoteMatch[1], 10) || 1;
            return false;
        }

        return true;
    }

    _parseFilteringOptions() {
        var _this = this;

        return (0, _asyncToGenerator3.default)(function* () {
            if (_this.opts.testGrep) _this.opts.testGrep = (0, _getOptions.getGrepOptions)('--test-grep', _this.opts.testGrep);

            if (_this.opts.fixtureGrep) _this.opts.fixtureGrep = (0, _getOptions.getGrepOptions)('--fixture-grep', _this.opts.fixtureGrep);

            if (_this.opts.testMeta) _this.opts.testMeta = yield (0, _getOptions.getMetaOptions)('--test-meta', _this.opts.testMeta);

            if (_this.opts.fixtureMeta) _this.opts.fixtureMeta = yield (0, _getOptions.getMetaOptions)('--fixture-meta', _this.opts.fixtureMeta);

            _this.filter = (0, _getFilterFn2.default)(_this.opts);
        })();
    }

    _parseAppInitDelay() {
        if (this.opts.appInitDelay) {
            (0, _typeAssertions.assertType)(_typeAssertions.is.nonNegativeNumberString, null, 'Tested app initialization delay', this.opts.appInitDelay);

            this.opts.appInitDelay = parseInt(this.opts.appInitDelay, 10);
        }
    }

    _parseSelectorTimeout() {
        if (this.opts.selectorTimeout) {
            (0, _typeAssertions.assertType)(_typeAssertions.is.nonNegativeNumberString, null, 'Selector timeout', this.opts.selectorTimeout);

            this.opts.selectorTimeout = parseInt(this.opts.selectorTimeout, 10);
        }
    }

    _parseAssertionTimeout() {
        if (this.opts.assertionTimeout) {
            (0, _typeAssertions.assertType)(_typeAssertions.is.nonNegativeNumberString, null, 'Assertion timeout', this.opts.assertionTimeout);

            this.opts.assertionTimeout = parseInt(this.opts.assertionTimeout, 10);
        }
    }

    _parsePageLoadTimeout() {
        if (this.opts.pageLoadTimeout) {
            (0, _typeAssertions.assertType)(_typeAssertions.is.nonNegativeNumberString, null, 'Page load timeout', this.opts.pageLoadTimeout);

            this.opts.pageLoadTimeout = parseInt(this.opts.pageLoadTimeout, 10);
        }
    }

    _parseSpeed() {
        if (this.opts.speed) this.opts.speed = parseFloat(this.opts.speed);
    }

    _parseConcurrency() {
        if (this.opts.concurrency) this.opts.concurrency = parseInt(this.opts.concurrency, 10);
    }

    _parsePorts() {
        if (this.opts.ports) {
            this.opts.ports = this.opts.ports.split(',').map(CLIArgumentParser._parsePortNumber);

            if (this.opts.ports.length < 2) throw new _runtime.GeneralError(_types.RUNTIME_ERRORS.portsOptionRequiresTwoNumbers);
        }
    }

    _parseBrowserList() {
        const browsersArg = this.program.args[0] || '';

        this.browsers = (0, _string.splitQuotedText)(browsersArg, ',').filter(browser => browser && this._filterAndCountRemotes(browser));
    }

    _parseSslOptions() {
        var _this2 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            if (_this2.opts.ssl) _this2.opts.ssl = yield (0, _getOptions.getSSLOptions)(_this2.opts.ssl);
        })();
    }

    _parseReporters() {
        var _this3 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            const reporters = _this3.opts.reporter ? _this3.opts.reporter.split(',') : [];

            _this3.opts.reporter = reporters.map(function (reporter) {
                const separatorIndex = reporter.indexOf(':');

                if (separatorIndex < 0) return { name: reporter };

                const name = reporter.substring(0, separatorIndex);
                const output = reporter.substring(separatorIndex + 1);

                return { name, output };
            });
        })();
    }

    _parseFileList() {
        this.src = this.program.args.slice(1);
    }

    _parseVideoOptions() {
        var _this4 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            if (_this4.opts.videoOptions) _this4.opts.videoOptions = yield (0, _getOptions.getVideoOptions)(_this4.opts.videoOptions);

            if (_this4.opts.videoEncodingOptions) _this4.opts.videoEncodingOptions = yield (0, _getOptions.getVideoOptions)(_this4.opts.videoEncodingOptions);
        })();
    }

    _getProviderName() {
        this.opts.providerName = this.opts.listBrowsers === true ? void 0 : this.opts.listBrowsers;
    }

    parse(argv) {
        var _this5 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            _this5.program.parse(argv);

            _this5.args = _this5.program.args;

            _this5.opts = _this5.program.opts();

            // NOTE: the '-list-browsers' option only lists browsers and immediately exits the app.
            // Therefore, we don't need to process other arguments.
            if (_this5.opts.listBrowsers) {
                _this5._getProviderName();
                return;
            }

            _this5._parseSelectorTimeout();
            _this5._parseAssertionTimeout();
            _this5._parsePageLoadTimeout();
            _this5._parseAppInitDelay();
            _this5._parseSpeed();
            _this5._parsePorts();
            _this5._parseBrowserList();
            _this5._parseConcurrency();
            _this5._parseFileList();

            yield _this5._parseFilteringOptions();
            yield _this5._parseVideoOptions();
            yield _this5._parseSslOptions();
            yield _this5._parseReporters();
        })();
    }
}
exports.default = CLIArgumentParser;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jbGkvYXJndW1lbnQtcGFyc2VyLmpzIl0sIm5hbWVzIjpbIlJFTU9URV9BTElBU19SRSIsIkRFU0NSSVBUSU9OIiwiQ0xJQXJndW1lbnRQYXJzZXIiLCJjb25zdHJ1Y3RvciIsImN3ZCIsInByb2dyYW0iLCJwcm9jZXNzIiwic3JjIiwiYnJvd3NlcnMiLCJmaWx0ZXIiLCJyZW1vdGVDb3VudCIsIm9wdHMiLCJfZGVzY3JpYmVQcm9ncmFtIiwiX3BhcnNlUG9ydE51bWJlciIsInZhbHVlIiwibm9uTmVnYXRpdmVOdW1iZXJTdHJpbmciLCJwYXJzZUludCIsIl9nZXREZXNjcmlwdGlvbiIsInN0ZG91dCIsInZlcnNpb24iLCJKU09OIiwicGFyc2UiLCJ1c2FnZSIsImRlc2NyaXB0aW9uIiwib3B0aW9uIiwiX2ZpbHRlckFuZENvdW50UmVtb3RlcyIsImJyb3dzZXIiLCJyZW1vdGVNYXRjaCIsIm1hdGNoIiwiX3BhcnNlRmlsdGVyaW5nT3B0aW9ucyIsInRlc3RHcmVwIiwiZml4dHVyZUdyZXAiLCJ0ZXN0TWV0YSIsImZpeHR1cmVNZXRhIiwiX3BhcnNlQXBwSW5pdERlbGF5IiwiYXBwSW5pdERlbGF5IiwiX3BhcnNlU2VsZWN0b3JUaW1lb3V0Iiwic2VsZWN0b3JUaW1lb3V0IiwiX3BhcnNlQXNzZXJ0aW9uVGltZW91dCIsImFzc2VydGlvblRpbWVvdXQiLCJfcGFyc2VQYWdlTG9hZFRpbWVvdXQiLCJwYWdlTG9hZFRpbWVvdXQiLCJfcGFyc2VTcGVlZCIsInNwZWVkIiwicGFyc2VGbG9hdCIsIl9wYXJzZUNvbmN1cnJlbmN5IiwiY29uY3VycmVuY3kiLCJfcGFyc2VQb3J0cyIsInBvcnRzIiwic3BsaXQiLCJtYXAiLCJsZW5ndGgiLCJwb3J0c09wdGlvblJlcXVpcmVzVHdvTnVtYmVycyIsIl9wYXJzZUJyb3dzZXJMaXN0IiwiYnJvd3NlcnNBcmciLCJhcmdzIiwiX3BhcnNlU3NsT3B0aW9ucyIsInNzbCIsIl9wYXJzZVJlcG9ydGVycyIsInJlcG9ydGVycyIsInJlcG9ydGVyIiwic2VwYXJhdG9ySW5kZXgiLCJpbmRleE9mIiwibmFtZSIsInN1YnN0cmluZyIsIm91dHB1dCIsIl9wYXJzZUZpbGVMaXN0Iiwic2xpY2UiLCJfcGFyc2VWaWRlb09wdGlvbnMiLCJ2aWRlb09wdGlvbnMiLCJ2aWRlb0VuY29kaW5nT3B0aW9ucyIsIl9nZXRQcm92aWRlck5hbWUiLCJwcm92aWRlck5hbWUiLCJsaXN0QnJvd3NlcnMiLCJhcmd2Il0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBOztBQUNBOzs7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7O0FBRUEsTUFBTUEsa0JBQWtCLHFCQUF4Qjs7QUFFQSxNQUFNQyxjQUFjLHNCQUFROzs7Ozs7Ozs7Ozs7O0NBQVIsQ0FBcEI7O0FBZWUsTUFBTUMsaUJBQU4sQ0FBd0I7QUFDbkNDLGdCQUFhQyxHQUFiLEVBQWtCO0FBQ2QsYUFBS0MsT0FBTCxHQUFlLHVCQUFZLFVBQVosQ0FBZjs7QUFFQSxhQUFLRCxHQUFMLEdBQVdBLE9BQU9FLFFBQVFGLEdBQVIsRUFBbEI7O0FBRUEsYUFBS0csR0FBTCxHQUFtQixJQUFuQjtBQUNBLGFBQUtDLFFBQUwsR0FBbUIsSUFBbkI7QUFDQSxhQUFLQyxNQUFMLEdBQW1CLElBQW5CO0FBQ0EsYUFBS0MsV0FBTCxHQUFtQixDQUFuQjtBQUNBLGFBQUtDLElBQUwsR0FBbUIsSUFBbkI7O0FBRUEsYUFBS0MsZ0JBQUw7QUFDSDs7QUFFRCxXQUFPQyxnQkFBUCxDQUF5QkMsS0FBekIsRUFBZ0M7QUFDNUIsd0NBQVcsbUJBQUdDLHVCQUFkLEVBQXVDLElBQXZDLEVBQTZDLGFBQTdDLEVBQTRERCxLQUE1RDs7QUFFQSxlQUFPRSxTQUFTRixLQUFULEVBQWdCLEVBQWhCLENBQVA7QUFDSDs7QUFFRCxXQUFPRyxlQUFQLEdBQTBCO0FBQ3RCO0FBQ0EsZUFBTyxPQUFPLHNCQUFTaEIsV0FBVCxFQUFzQixDQUF0QixFQUF5QixnQ0FBaUJL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T0FBTCxDQUFhZ0IsS0FBYixDQUFtQnFELElBQW5COztBQUVBLG1CQUFLbkIsSUFBTCxHQUFZLE9BQUtsRCxPQUFMLENBQWFrRCxJQUF6Qjs7QUFFQSxtQkFBSzVDLElBQUwsR0FBWSxPQUFLTixPQUFMLENBQWFNLElBQWIsRUFBWjs7QUFFQTtBQUNBO0FBQ0EsZ0JBQUksT0FBS0EsSUFBTCxDQUFVOEQsWUFBZCxFQUE0QjtBQUN4Qix1QkFBS0YsZ0JBQUw7QUFDQTtBQUNIOztBQUVELG1CQUFLbkMscUJBQUw7QUFDQSxtQkFBS0Usc0JBQUw7QUFDQSxtQkFBS0UscUJBQUw7QUFDQSxtQkFBS04sa0JBQUw7QUFDQSxtQkFBS1EsV0FBTDtBQUNBLG1CQUFLSyxXQUFMO0FBQ0EsbUJBQUtNLGlCQUFMO0FBQ0EsbUJBQUtSLGlCQUFMO0FBQ0EsbUJBQUtxQixjQUFMOztBQUVBLGtCQUFNLE9BQUtyQyxzQkFBTCxFQUFOO0FBQ0Esa0JBQU0sT0FBS3VDLGtCQUFMLEVBQU47QUFDQSxrQkFBTSxPQUFLWixnQkFBTCxFQUFOO0FBQ0Esa0JBQU0sT0FBS0UsZUFBTCxFQUFOO0FBM0JlO0FBNEJsQjtBQXBPa0M7a0JBQWxCeEQsaUIiLCJmaWxlIjoiY2xpL2FyZ3VtZW50LXBhcnNlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbW1hbmQgfSBmcm9tICdjb21tYW5kZXInO1xuaW1wb3J0IGRlZGVudCBmcm9tICdkZWRlbnQnO1xuaW1wb3J0IHsgcmVhZFN5bmMgYXMgcmVhZCB9IGZyb20gJ3JlYWQtZmlsZS1yZWxhdGl2ZSc7XG5pbXBvcnQgeyBHZW5lcmFsRXJyb3IgfSBmcm9tICcuLi9lcnJvcnMvcnVudGltZSc7XG5pbXBvcnQgeyBSVU5USU1FX0VSUk9SUyB9IGZyb20gJy4uL2Vycm9ycy90eXBlcyc7XG5pbXBvcnQgeyBhc3NlcnRUeXBlLCBpcyB9IGZyb20gJy4uL2Vycm9ycy9ydW50aW1lL3R5cGUtYXNzZXJ0aW9ucyc7XG5pbXBvcnQgZ2V0Vmlld1BvcnRXaWR0aCBmcm9tICcuLi91dGlscy9nZXQtdmlld3BvcnQtd2lkdGgnO1xuaW1wb3J0IHsgd29yZFdyYXAsIHNwbGl0UXVvdGVkVGV4dCB9IGZyb20gJy4uL3V0aWxzL3N0cmluZyc7XG5pbXBvcnQgeyBnZXRTU0xPcHRpb25zLCBnZXRWaWRlb09wdGlvbnMsIGdldE1ldGFPcHRpb25zLCBnZXRHcmVwT3B0aW9ucyB9IGZyb20gJy4uL3V0aWxzL2dldC1vcHRpb25zJztcbmltcG9ydCBnZXRGaWx0ZXJGbiBmcm9tICcuLi91dGlscy9nZXQtZmlsdGVyLWZuJztcblxuY29uc3QgUkVNT1RFX0FMSUFTX1JFID0gL15yZW1vdGUoPzo6KFxcZCopKT8kLztcblxuY29uc3QgREVTQ1JJUFRJT04gPSBkZWRlbnQoYFxuICAgIEluIHRoZSBicm93c2VyIGxpc3QsIHlvdSBjYW4gdXNlIGJyb3dzZXIgbmFtZXMgKGUuZy4gXCJpZVwiLCBcImNocm9tZVwiLCBldGMuKSBhcyB3ZWxsIGFzIHBhdGhzIHRvIGV4ZWN1dGFibGVzLlxuXG4gICAgVG8gcnVuIHRlc3RzIGFnYWluc3QgYWxsIGluc3RhbGxlZCBicm93c2VycywgdXNlIHRoZSBcImFsbFwiIGFsaWFzLlxuXG4gICAgVG8gdXNlIGEgcmVtb3RlIGJyb3dzZXIgY29ubmVjdGlvbiAoZS5nLiwgdG8gY29ubmVjdCBhIG1vYmlsZSBkZXZpY2UpLCBzcGVjaWZ5IFwicmVtb3RlXCIgYXMgdGhlIGJyb3dzZXIgYWxpYXMuXG4gICAgSWYgeW91IG5lZWQgdG8gY29ubmVjdCBtdWx0aXBsZSBkZXZpY2VzLCBhZGQgYSBjb2xvbiBhbmQgdGhlIG51bWJlciBvZiBicm93c2VycyB5b3Ugd2FudCB0byBjb25uZWN0IChlLmcuLCBcInJlbW90ZTozXCIpLlxuXG4gICAgVG8gcnVuIHRlc3RzIGluIGEgYnJvd3NlciBhY2Nlc3NlZCB0aHJvdWdoIGEgYnJvd3NlciBwcm92aWRlciBwbHVnaW4sIHNwZWNpZnkgYSBicm93c2VyIGFsaWFzIHRoYXQgY29uc2lzdHMgb2YgdHdvIHBhcnRzIC0gdGhlIGJyb3dzZXIgcHJvdmlkZXIgbmFtZSBwcmVmaXggYW5kIHRoZSBuYW1lIG9mIHRoZSBicm93c2VyIGl0c2VsZjsgZm9yIGV4YW1wbGUsIFwic2F1Y2VsYWJzOmNocm9tZUA1MVwiLlxuXG4gICAgWW91IGNhbiB1c2Ugb25lIG9yIG1vcmUgZmlsZSBwYXRocyBvciBnbG9iIHBhdHRlcm5zIHRvIHNwZWNpZnkgd2hpY2ggdGVzdHMgdG8gcnVuLlxuXG4gICAgTW9yZSBpbmZvOiBodHRwczovL2RldmV4cHJlc3MuZ2l0aHViLmlvL3Rlc3RjYWZlL2RvY3VtZW50YXRpb25cbmApO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDTElBcmd1bWVudFBhcnNlciB7XG4gICAgY29uc3RydWN0b3IgKGN3ZCkge1xuICAgICAgICB0aGlzLnByb2dyYW0gPSBuZXcgQ29tbWFuZCgndGVzdGNhZmUnKTtcblxuICAgICAgICB0aGlzLmN3ZCA9IGN3ZCB8fCBwcm9jZXNzLmN3ZCgpO1xuXG4gICAgICAgIHRoaXMuc3JjICAgICAgICAgPSBudWxsO1xuICAgICAgICB0aGlzLmJyb3dzZXJzICAgID0gbnVsbDtcbiAgICAgICAgdGhpcy5maWx0ZXIgICAgICA9IG51bGw7XG4gICAgICAgIHRoaXMucmVtb3RlQ291bnQgPSAwO1xuICAgICAgICB0aGlzLm9wdHMgICAgICAgID0gbnVsbDtcblxuICAgICAgICB0aGlzLl9kZXNjcmliZVByb2dyYW0oKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgX3BhcnNlUG9ydE51bWJlciAodmFsdWUpIHtcbiAgICAgICAgYXNzZXJ0VHlwZShpcy5ub25OZWdhdGl2ZU51bWJlclN0cmluZywgbnVsbCwgJ1BvcnQgbnVtYmVyJywgdmFsdWUpO1xuXG4gICAgICAgIHJldHVybiBwYXJzZUludCh2YWx1ZSwgMTApO1xuICAgIH1cblxuICAgIHN0YXRpYyBfZ2V0RGVzY3JpcHRpb24gKCkge1xuICAgICAgICAvLyBOT1RFOiBhZGQgZW1wdHkgbGluZSB0byB3b3JrYXJvdW5kIGNvbW1hbmRlci1mb3JjZWQgaW5kZW50YXRpb24gb24gdGhlIGZpcnN0IGxpbmUuXG4gICAgICAgIHJldHVybiAnXFxuJyArIHdvcmRXcmFwKERFU0NSSVBUSU9OLCAyLCBnZXRWaWV3UG9ydFdpZHRoKHByb2Nlc3Muc3Rkb3V0KSk7XG4gICAgfVxuXG4gICAgX2Rlc2NyaWJlUHJvZ3JhbSAoKSB7XG4gICAgICAgIGNvbnN0IHZlcnNpb24gPSBKU09OLnBhcnNlKHJlYWQoJy4uLy4uL3BhY2thZ2UuanNvbicpKS52ZXJzaW9uO1xuXG4gICAgICAgIHRoaXMucHJvZ3JhbVxuICAgICAgICAgICAgLnZlcnNpb24odmVyc2lvbiwgJy12LCAtLXZlcnNpb24nKVxuICAgICAgICAgICAgLnVzYWdlKCdbb3B0aW9uc10gPGNvbW1hLXNlcGFyYXRlZC1icm93c2VyLWxpc3Q+IDxmaWxlLW9yLWdsb2IgLi4uPicpXG4gICAgICAgICAgICAuZGVzY3JpcHRpb24oQ0xJQXJndW1lbnRQYXJzZXIuX2dldERlc2NyaXB0aW9uKCkpXG5cbiAgICAgICAgICAgIC5vcHRpb24oJy1iLCAtLWxpc3QtYnJvd3NlcnMgW3Byb3ZpZGVyXScsICdvdXRwdXQgdGhlIGFsaWFzZXMgZm9yIGxvY2FsIGJyb3dzZXJzIG9yIGJyb3dzZXJzIGF2YWlsYWJsZSB0aHJvdWdoIHRoZSBzcGVjaWZpZWQgYnJvd3NlciBwcm92aWRlcicpXG4gICAgICAgICAgICAub3B0aW9uKCctciwgLS1yZXBvcnRlciA8bmFtZVs6b3V0cHV0RmlsZV1bLC4uLl0+JywgJ3NwZWNpZnkgdGhlIHJlcG9ydGVycyBhbmQgb3B0aW9uYWxseSBmaWxlcyB3aGVyZSByZXBvcnRzIGFyZSBzYXZlZCcpXG4gICAgICAgICAgICAub3B0aW9uKCctcywgLS1zY3JlZW5zaG90cyA8cGF0aD4nLCAnZW5hYmxlIHNjcmVlbnNob3QgY2FwdHVyaW5nIGFuZCBzcGVjaWZ5IHRoZSBwYXRoIHRvIHNhdmUgdGhlIHNjcmVlbnNob3RzIHRvJylcbiAgICAgICAgICAgIC5vcHRpb24oJy1TLCAtLXNjcmVlbnNob3RzLW9uLWZhaWxzJywgJ3Rha2UgYSBzY3JlZW5zaG90IHdoZW5ldmVyIGEgdGVzdCBmYWlscycpXG4gICAgICAgICAgICAub3B0aW9uKCctcCwgLS1zY3JlZW5zaG90LXBhdGgtcGF0dGVybiA8cGF0dGVybj4nLCAndXNlIHBhdHRlcm5zIHRvIGNvbXBvc2Ugc2NyZWVuc2hvdCBmaWxlIG5hbWVzIGFuZCBwYXRoczogJHtCUk9XU0VSfSwgJHtCUk9XU0VSX1ZFUlNJT059LCAke09TfSwgZXRjLicpXG4gICAgICAgICAgICAub3B0aW9uKCctcSwgLS1xdWFyYW50aW5lLW1vZGUnLCAnZW5hYmxlIHRoZSBxdWFyYW50aW5lIG1vZGUnKVxuICAgICAgICAgICAgLm9wdGlvbignLWQsIC0tZGVidWctbW9kZScsICdleGVjdXRlIHRlc3Qgc3RlcHMgb25lIGJ5IG9uZSBwYXVzaW5nIHRoZSB0ZXN0IGFmdGVyIGVhY2ggc3RlcCcpXG4gICAgICAgICAgICAub3B0aW9uKCctZSwgLS1za2lwLWpzLWVycm9ycycsICdtYWtlIHRlc3RzIG5vdCBmYWlsIHdoZW4gYSBKUyBlcnJvciBoYXBwZW5zIG9uIGEgcGFnZScpXG4gICAgICAgICAgICAub3B0aW9uKCctdSwgLS1za2lwLXVuY2F1Z2h0LWVycm9ycycsICdpZ25vcmUgdW5jYXVnaHQgZXJyb3JzIGFuZCB1bmhhbmRsZWQgcHJvbWlzZSByZWplY3Rpb25zLCB3aGljaCBvY2N1ciBkdXJpbmcgdGVzdCBleGVjdXRpb24nKVxuICAgICAgICAgICAgLm9wdGlvbignLXQsIC0tdGVzdCA8bmFtZT4nLCAncnVuIG9ubHkgdGVzdHMgd2l0aCB0aGUgc3BlY2lmaWVkIG5hbWUnKVxuICAgICAgICAgICAgLm9wdGlvbignLVQsIC0tdGVzdC1ncmVwIDxwYXR0ZXJuPicsICdydW4gb25seSB0ZXN0cyBtYXRjaGluZyB0aGUgc3BlY2lmaWVkIHBhdHRlcm4nKVxuICAgICAgICAgICAgLm9wdGlvbignLWYsIC0tZml4dHVyZSA8bmFtZT4nLCAncnVuIG9ubHkgZml4dHVyZXMgd2l0aCB0aGUgc3BlY2lmaWVkIG5hbWUnKVxuICAgICAgICAgICAgLm9wdGlvbignLUYsIC0tZml4dHVyZS1ncmVwIDxwYXR0ZXJuPicsICdydW4gb25seSBmaXh0dXJlcyBtYXRjaGluZyB0aGUgc3BlY2lmaWVkIHBhdHRlcm4nKVxuICAgICAgICAgICAgLm9wdGlvbignLWEsIC0tYXBwIDxjb21tYW5kPicsICdsYXVuY2ggdGhlIHRlc3RlZCBhcHAgdXNpbmcgdGhlIHNwZWNpZmllZCBjb21tYW5kIGJlZm9yZSBydW5uaW5nIHRlc3RzJylcbiAgICAgICAgICAgIC5vcHRpb24oJy1jLCAtLWNvbmN1cnJlbmN5IDxudW1iZXI+JywgJ3J1biB0ZXN0cyBjb25jdXJyZW50bHknKVxuICAgICAgICAgICAgLm9wdGlvbignLUwsIC0tbGl2ZScsICdlbmFibGUgbGl2ZSBtb2RlLiBJbiB0aGlzIG1vZGUsIFRlc3RDYWZlIHdhdGNoZXMgZm9yIGNoYW5nZXMgeW91IG1ha2UgaW4gdGhlIHRlc3QgZmlsZXMuIFRoZXNlIGNoYW5nZXMgaW1tZWRpYXRlbHkgcmVzdGFydCB0aGUgdGVzdHMgc28gdGhhdCB5b3UgY2FuIHNlZSB0aGUgZWZmZWN0LicpXG4gICAgICAgICAgICAub3B0aW9uKCctLXRlc3QtbWV0YSA8a2V5PXZhbHVlWyxrZXkyPXZhbHVlMiwuLi5dPicsICdydW4gb25seSB0ZXN0cyB3aXRoIG1hdGNoaW5nIG1ldGFkYXRhJylcbiAgICAgICAgICAgIC5vcHRpb24oJy0tZml4dHVyZS1tZXRhIDxrZXk9dmFsdWVbLGtleTI9dmFsdWUyLC4uLl0+JywgJ3J1biBvbmx5IGZpeHR1cmVzIHdpdGggbWF0Y2hpbmcgbWV0YWRhdGEnKVxuICAgICAgICAgICAgLm9wdGlvbignLS1kZWJ1Zy1vbi1mYWlsJywgJ3BhdXNlIHRoZSB0ZXN0IGlmIGl0IGZhaWxzJylcbiAgICAgICAgICAgIC5vcHRpb24oJy0tYXBwLWluaXQtZGVsYXkgPG1zPicsICdzcGVjaWZ5IGhvdyBtdWNoIHRpbWUgaXQgdGFrZXMgZm9yIHRoZSB0ZXN0ZWQgYXBwIHRvIGluaXRpYWxpemUnKVxuICAgICAgICAgICAgLm9wdGlvbignLS1zZWxlY3Rvci10aW1lb3V0IDxtcz4nLCAnc2V0IHRoZSBhbW91bnQgb2YgdGltZSB3aXRoaW4gd2hpY2ggc2VsZWN0b3JzIG1ha2UgYXR0ZW1wdHMgdG8gb2J0YWluIGEgbm9kZSB0byBiZSByZXR1cm5lZCcpXG4gICAgICAgICAgICAub3B0aW9uKCctLWFzc2VydGlvbi10aW1lb3V0IDxtcz4nLCAnc2V0IHRoZSBhbW91bnQgb2YgdGltZSB3aXRoaW4gd2hpY2ggYXNzZXJ0aW9uIHNob3VsZCBwYXNzJylcbiAgICAgICAgICAgIC5vcHRpb24oJy0tcGFnZS1sb2FkLXRpbWVvdXQgPG1zPicsICdzZXQgdGhlIGFtb3VudCBvZiB0aW1lIHdpdGhpbiB3aGljaCBUZXN0Q2FmZSB3YWl0cyBmb3IgdGhlIGB3aW5kb3cubG9hZGAgZXZlbnQgdG8gZmlyZSBvbiBwYWdlIGxvYWQgYmVmb3JlIHByb2NlZWRpbmcgdG8gdGhlIG5leHQgdGVzdCBhY3Rpb24nKVxuICAgICAgICAgICAgLm9wdGlvbignLS1zcGVlZCA8ZmFjdG9yPicsICdzZXQgdGhlIHNwZWVkIG9mIHRlc3QgZXhlY3V0aW9uICgwLjAxIC4uLiAxKScpXG4gICAgICAgICAgICAub3B0aW9uKCctLXBvcnRzIDxwb3J0MSxwb3J0Mj4nLCAnc3BlY2lmeSBjdXN0b20gcG9ydCBudW1iZXJzJylcbiAgICAgICAgICAgIC5vcHRpb24oJy0taG9zdG5hbWUgPG5hbWU+JywgJ3NwZWNpZnkgdGhlIGhvc3RuYW1lJylcbiAgICAgICAgICAgIC5vcHRpb24oJy0tcHJveHkgPGhvc3Q+JywgJ3NwZWNpZnkgdGhlIGhvc3Qgb2YgdGhlIHByb3h5IHNlcnZlcicpXG4gICAgICAgICAgICAub3B0aW9uKCctLXByb3h5LWJ5cGFzcyA8cnVsZXM+JywgJ3NwZWNpZnkgYSBjb21tYS1zZXBhcmF0ZWQgbGlzdCBvZiBydWxlcyB0aGF0IGRlZmluZSBVUkxzIGFjY2Vzc2VkIGJ5cGFzc2luZyB0aGUgcHJveHkgc2VydmVyJylcbiAgICAgICAgICAgIC5vcHRpb24oJy0tc3NsIDxvcHRpb25zPicsICdzcGVjaWZ5IFNTTCBvcHRpb25zIHRvIHJ1biBUZXN0Q2FmZSBwcm94eSBzZXJ2ZXIgb3ZlciB0aGUgSFRUUFMgcHJvdG9jb2wnKVxuICAgICAgICAgICAgLm9wdGlvbignLS12aWRlbyA8cGF0aD4nLCAnIHJlY29yZCB2aWRlb3Mgb2YgdGVzdCBydW5zJylcbiAgICAgICAgICAgIC5vcHRpb24oJy0tdmlkZW8tb3B0aW9ucyA8b3B0aW9uPXZhbHVlWywuLi5dPicsICdzcGVjaWZ5IHZpZGVvIHJlY29yZGluZyBvcHRpb25zJylcbiAgICAgICAgICAgIC5vcHRpb24oJy0tdmlkZW8tZW5jb2Rpbmctb3B0aW9ucyA8b3B0aW9uPXZhbHVlWywuLi5dPicsICdzcGVjaWZ5IGVuY29kaW5nIG9wdGlvbnMnKVxuICAgICAgICAgICAgLm9wdGlvbignLS1kaXNhYmxlLXBhZ2UtcmVsb2FkcycsICdkaXNhYmxlIHBhZ2UgcmVsb2FkcyBiZXR3ZWVuIHRlc3RzJylcbiAgICAgICAgICAgIC5vcHRpb24oJy0tZGV2JywgJ2VuYWJsZXMgbWVjaGFuaXNtcyB0byBsb2cgYW5kIGRpYWdub3NlIGVycm9ycycpXG4gICAgICAgICAgICAub3B0aW9uKCctLXFyLWNvZGUnLCAnb3V0cHV0cyBRUi1jb2RlIHRoYXQgcmVwZWF0cyBVUkxzIHVzZWQgdG8gY29ubmVjdCB0aGUgcmVtb3RlIGJyb3dzZXJzJylcbiAgICAgICAgICAgIC5vcHRpb24oJy0tc2YsIC0tc3RvcC1vbi1maXJzdC1mYWlsJywgJ3N0b3AgYW4gZW50aXJlIHRlc3QgcnVuIGlmIGFueSB0ZXN0IGZhaWxzJylcblxuICAgICAgICAgICAgLy8gTk9URTogdGhlc2Ugb3B0aW9ucyB3aWxsIGJlIGhhbmRsZWQgYnkgY2hhbGsgaW50ZXJuYWxseVxuICAgICAgICAgICAgLm9wdGlvbignLS1jb2xvcicsICdmb3JjZSBjb2xvcnMgaW4gY29tbWFuZCBsaW5lJylcbiAgICAgICAgICAgIC5vcHRpb24oJy0tbm8tY29sb3InLCAnZGlzYWJsZSBjb2xvcnMgaW4gY29tbWFuZCBsaW5lJyk7XG4gICAgfVxuXG4gICAgX2ZpbHRlckFuZENvdW50UmVtb3RlcyAoYnJvd3Nlcikge1xuICAgICAgICBjb25zdCByZW1vdGVNYXRjaCA9IGJyb3dzZXIubWF0Y2goUkVNT1RFX0FMSUFTX1JFKTtcblxuICAgICAgICBpZiAocmVtb3RlTWF0Y2gpIHtcbiAgICAgICAgICAgIHRoaXMucmVtb3RlQ291bnQgKz0gcGFyc2VJbnQocmVtb3RlTWF0Y2hbMV0sIDEwKSB8fCAxO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgYXN5bmMgX3BhcnNlRmlsdGVyaW5nT3B0aW9ucyAoKSB7XG4gICAgICAgIGlmICh0aGlzLm9wdHMudGVzdEdyZXApXG4gICAgICAgICAgICB0aGlzLm9wdHMudGVzdEdyZXAgPSBnZXRHcmVwT3B0aW9ucygnLS10ZXN0LWdyZXAnLCB0aGlzLm9wdHMudGVzdEdyZXApO1xuXG4gICAgICAgIGlmICh0aGlzLm9wdHMuZml4dHVyZUdyZXApXG4gICAgICAgICAgICB0aGlzLm9wdHMuZml4dHVyZUdyZXAgPSBnZXRHcmVwT3B0aW9ucygnLS1maXh0dXJlLWdyZXAnLCB0aGlzLm9wdHMuZml4dHVyZUdyZXApO1xuXG4gICAgICAgIGlmICh0aGlzLm9wdHMudGVzdE1ldGEpXG4gICAgICAgICAgICB0aGlzLm9wdHMudGVzdE1ldGEgPSBhd2FpdCBnZXRNZXRhT3B0aW9ucygnLS10ZXN0LW1ldGEnLCB0aGlzLm9wdHMudGVzdE1ldGEpO1xuXG4gICAgICAgIGlmICh0aGlzLm9wdHMuZml4dHVyZU1ldGEpXG4gICAgICAgICAgICB0aGlzLm9wdHMuZml4dHVyZU1ldGEgPSBhd2FpdCBnZXRNZXRhT3B0aW9ucygnLS1maXh0dXJlLW1ldGEnLCB0aGlzLm9wdHMuZml4dHVyZU1ldGEpO1xuXG4gICAgICAgIHRoaXMuZmlsdGVyID0gZ2V0RmlsdGVyRm4odGhpcy5vcHRzKTtcbiAgICB9XG5cbiAgICBfcGFyc2VBcHBJbml0RGVsYXkgKCkge1xuICAgICAgICBpZiAodGhpcy5vcHRzLmFwcEluaXREZWxheSkge1xuICAgICAgICAgICAgYXNzZXJ0VHlwZShpcy5ub25OZWdhdGl2ZU51bWJlclN0cmluZywgbnVsbCwgJ1Rlc3RlZCBhcHAgaW5pdGlhbGl6YXRpb24gZGVsYXknLCB0aGlzLm9wdHMuYXBwSW5pdERlbGF5KTtcblxuICAgICAgICAgICAgdGhpcy5vcHRzLmFwcEluaXREZWxheSA9IHBhcnNlSW50KHRoaXMub3B0cy5hcHBJbml0RGVsYXksIDEwKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9wYXJzZVNlbGVjdG9yVGltZW91dCAoKSB7XG4gICAgICAgIGlmICh0aGlzLm9wdHMuc2VsZWN0b3JUaW1lb3V0KSB7XG4gICAgICAgICAgICBhc3NlcnRUeXBlKGlzLm5vbk5lZ2F0aXZlTnVtYmVyU3RyaW5nLCBudWxsLCAnU2VsZWN0b3IgdGltZW91dCcsIHRoaXMub3B0cy5zZWxlY3RvclRpbWVvdXQpO1xuXG4gICAgICAgICAgICB0aGlzLm9wdHMuc2VsZWN0b3JUaW1lb3V0ID0gcGFyc2VJbnQodGhpcy5vcHRzLnNlbGVjdG9yVGltZW91dCwgMTApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgX3BhcnNlQXNzZXJ0aW9uVGltZW91dCAoKSB7XG4gICAgICAgIGlmICh0aGlzLm9wdHMuYXNzZXJ0aW9uVGltZW91dCkge1xuICAgICAgICAgICAgYXNzZXJ0VHlwZShpcy5ub25OZWdhdGl2ZU51bWJlclN0cmluZywgbnVsbCwgJ0Fzc2VydGlvbiB0aW1lb3V0JywgdGhpcy5vcHRzLmFzc2VydGlvblRpbWVvdXQpO1xuXG4gICAgICAgICAgICB0aGlzLm9wdHMuYXNzZXJ0aW9uVGltZW91dCA9IHBhcnNlSW50KHRoaXMub3B0cy5hc3NlcnRpb25UaW1lb3V0LCAxMCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfcGFyc2VQYWdlTG9hZFRpbWVvdXQgKCkge1xuICAgICAgICBpZiAodGhpcy5vcHRzLnBhZ2VMb2FkVGltZW91dCkge1xuICAgICAgICAgICAgYXNzZXJ0VHlwZShpcy5ub25OZWdhdGl2ZU51bWJlclN0cmluZywgbnVsbCwgJ1BhZ2UgbG9hZCB0aW1lb3V0JywgdGhpcy5vcHRzLnBhZ2VMb2FkVGltZW91dCk7XG5cbiAgICAgICAgICAgIHRoaXMub3B0cy5wYWdlTG9hZFRpbWVvdXQgPSBwYXJzZUludCh0aGlzLm9wdHMucGFnZUxvYWRUaW1lb3V0LCAxMCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfcGFyc2VTcGVlZCAoKSB7XG4gICAgICAgIGlmICh0aGlzLm9wdHMuc3BlZWQpXG4gICAgICAgICAgICB0aGlzLm9wdHMuc3BlZWQgPSBwYXJzZUZsb2F0KHRoaXMub3B0cy5zcGVlZCk7XG4gICAgfVxuXG4gICAgX3BhcnNlQ29uY3VycmVuY3kgKCkge1xuICAgICAgICBpZiAodGhpcy5vcHRzLmNvbmN1cnJlbmN5KVxuICAgICAgICAgICAgdGhpcy5vcHRzLmNvbmN1cnJlbmN5ID0gcGFyc2VJbnQodGhpcy5vcHRzLmNvbmN1cnJlbmN5LCAxMCk7XG4gICAgfVxuXG4gICAgX3BhcnNlUG9ydHMgKCkge1xuICAgICAgICBpZiAodGhpcy5vcHRzLnBvcnRzKSB7XG4gICAgICAgICAgICB0aGlzLm9wdHMucG9ydHMgPSB0aGlzLm9wdHMucG9ydHNcbiAgICAgICAgICAgICAgICAuc3BsaXQoJywnKVxuICAgICAgICAgICAgICAgIC5tYXAoQ0xJQXJndW1lbnRQYXJzZXIuX3BhcnNlUG9ydE51bWJlcik7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLm9wdHMucG9ydHMubGVuZ3RoIDwgMilcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgR2VuZXJhbEVycm9yKFJVTlRJTUVfRVJST1JTLnBvcnRzT3B0aW9uUmVxdWlyZXNUd29OdW1iZXJzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9wYXJzZUJyb3dzZXJMaXN0ICgpIHtcbiAgICAgICAgY29uc3QgYnJvd3NlcnNBcmcgPSB0aGlzLnByb2dyYW0uYXJnc1swXSB8fCAnJztcblxuICAgICAgICB0aGlzLmJyb3dzZXJzID0gc3BsaXRRdW90ZWRUZXh0KGJyb3dzZXJzQXJnLCAnLCcpXG4gICAgICAgICAgICAuZmlsdGVyKGJyb3dzZXIgPT4gYnJvd3NlciAmJiB0aGlzLl9maWx0ZXJBbmRDb3VudFJlbW90ZXMoYnJvd3NlcikpO1xuICAgIH1cblxuICAgIGFzeW5jIF9wYXJzZVNzbE9wdGlvbnMgKCkge1xuICAgICAgICBpZiAodGhpcy5vcHRzLnNzbClcbiAgICAgICAgICAgIHRoaXMub3B0cy5zc2wgPSBhd2FpdCBnZXRTU0xPcHRpb25zKHRoaXMub3B0cy5zc2wpO1xuICAgIH1cblxuICAgIGFzeW5jIF9wYXJzZVJlcG9ydGVycyAoKSB7XG4gICAgICAgIGNvbnN0IHJlcG9ydGVycyA9IHRoaXMub3B0cy5yZXBvcnRlciA/IHRoaXMub3B0cy5yZXBvcnRlci5zcGxpdCgnLCcpIDogW107XG5cbiAgICAgICAgdGhpcy5vcHRzLnJlcG9ydGVyID0gcmVwb3J0ZXJzLm1hcChyZXBvcnRlciA9PiB7XG4gICAgICAgICAgICBjb25zdCBzZXBhcmF0b3JJbmRleCA9IHJlcG9ydGVyLmluZGV4T2YoJzonKTtcblxuICAgICAgICAgICAgaWYgKHNlcGFyYXRvckluZGV4IDwgMClcbiAgICAgICAgICAgICAgICByZXR1cm4geyBuYW1lOiByZXBvcnRlciB9O1xuXG4gICAgICAgICAgICBjb25zdCBuYW1lICAgPSByZXBvcnRlci5zdWJzdHJpbmcoMCwgc2VwYXJhdG9ySW5kZXgpO1xuICAgICAgICAgICAgY29uc3Qgb3V0cHV0ID0gcmVwb3J0ZXIuc3Vic3RyaW5nKHNlcGFyYXRvckluZGV4ICsgMSk7XG5cbiAgICAgICAgICAgIHJldHVybiB7IG5hbWUsIG91dHB1dCB9O1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBfcGFyc2VGaWxlTGlzdCAoKSB7XG4gICAgICAgIHRoaXMuc3JjID0gdGhpcy5wcm9ncmFtLmFyZ3Muc2xpY2UoMSk7XG4gICAgfVxuXG4gICAgYXN5bmMgX3BhcnNlVmlkZW9PcHRpb25zICgpIHtcbiAgICAgICAgaWYgKHRoaXMub3B0cy52aWRlb09wdGlvbnMpXG4gICAgICAgICAgICB0aGlzLm9wdHMudmlkZW9PcHRpb25zID0gYXdhaXQgZ2V0VmlkZW9PcHRpb25zKHRoaXMub3B0cy52aWRlb09wdGlvbnMpO1xuXG4gICAgICAgIGlmICh0aGlzLm9wdHMudmlkZW9FbmNvZGluZ09wdGlvbnMpXG4gICAgICAgICAgICB0aGlzLm9wdHMudmlkZW9FbmNvZGluZ09wdGlvbnMgPSBhd2FpdCBnZXRWaWRlb09wdGlvbnModGhpcy5vcHRzLnZpZGVvRW5jb2RpbmdPcHRpb25zKTtcbiAgICB9XG5cbiAgICBfZ2V0UHJvdmlkZXJOYW1lICgpIHtcbiAgICAgICAgdGhpcy5vcHRzLnByb3ZpZGVyTmFtZSA9IHRoaXMub3B0cy5saXN0QnJvd3NlcnMgPT09IHRydWUgPyB2b2lkIDAgOiB0aGlzLm9wdHMubGlzdEJyb3dzZXJzO1xuICAgIH1cblxuICAgIGFzeW5jIHBhcnNlIChhcmd2KSB7XG4gICAgICAgIHRoaXMucHJvZ3JhbS5wYXJzZShhcmd2KTtcblxuICAgICAgICB0aGlzLmFyZ3MgPSB0aGlzLnByb2dyYW0uYXJncztcblxuICAgICAgICB0aGlzLm9wdHMgPSB0aGlzLnByb2dyYW0ub3B0cygpO1xuXG4gICAgICAgIC8vIE5PVEU6IHRoZSAnLWxpc3QtYnJvd3NlcnMnIG9wdGlvbiBvbmx5IGxpc3RzIGJyb3dzZXJzIGFuZCBpbW1lZGlhdGVseSBleGl0cyB0aGUgYXBwLlxuICAgICAgICAvLyBUaGVyZWZvcmUsIHdlIGRvbid0IG5lZWQgdG8gcHJvY2VzcyBvdGhlciBhcmd1bWVudHMuXG4gICAgICAgIGlmICh0aGlzLm9wdHMubGlzdEJyb3dzZXJzKSB7XG4gICAgICAgICAgICB0aGlzLl9nZXRQcm92aWRlck5hbWUoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX3BhcnNlU2VsZWN0b3JUaW1lb3V0KCk7XG4gICAgICAgIHRoaXMuX3BhcnNlQXNzZXJ0aW9uVGltZW91dCgpO1xuICAgICAgICB0aGlzLl9wYXJzZVBhZ2VMb2FkVGltZW91dCgpO1xuICAgICAgICB0aGlzLl9wYXJzZUFwcEluaXREZWxheSgpO1xuICAgICAgICB0aGlzLl9wYXJzZVNwZWVkKCk7XG4gICAgICAgIHRoaXMuX3BhcnNlUG9ydHMoKTtcbiAgICAgICAgdGhpcy5fcGFyc2VCcm93c2VyTGlzdCgpO1xuICAgICAgICB0aGlzLl9wYXJzZUNvbmN1cnJlbmN5KCk7XG4gICAgICAgIHRoaXMuX3BhcnNlRmlsZUxpc3QoKTtcblxuICAgICAgICBhd2FpdCB0aGlzLl9wYXJzZUZpbHRlcmluZ09wdGlvbnMoKTtcbiAgICAgICAgYXdhaXQgdGhpcy5fcGFyc2VWaWRlb09wdGlvbnMoKTtcbiAgICAgICAgYXdhaXQgdGhpcy5fcGFyc2VTc2xPcHRpb25zKCk7XG4gICAgICAgIGF3YWl0IHRoaXMuX3BhcnNlUmVwb3J0ZXJzKCk7XG4gICAgfVxufVxuIl19
