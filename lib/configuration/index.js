'use strict';

exports.__esModule = true;

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _entries = require('babel-runtime/core-js/object/entries');

var _entries2 = _interopRequireDefault(_entries);

var _create = require('babel-runtime/core-js/object/create');

var _create2 = _interopRequireDefault(_create);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _promisifiedFunctions = require('../utils/promisified-functions');

var _option = require('./option');

var _option2 = _interopRequireDefault(_option);

var _optionSource = require('./option-source');

var _optionSource2 = _interopRequireDefault(_optionSource);

var _lodash = require('lodash');

var _getOptions = require('../utils/get-options');

var _optionNames = require('./option-names');

var _optionNames2 = _interopRequireDefault(_optionNames);

var _getFilterFn = require('../utils/get-filter-fn');

var _getFilterFn2 = _interopRequireDefault(_getFilterFn);

var _resolvePathRelativelyCwd = require('../utils/resolve-path-relatively-cwd');

var _resolvePathRelativelyCwd2 = _interopRequireDefault(_resolvePathRelativelyCwd);

var _json = require('json5');

var _json2 = _interopRequireDefault(_json);

var _renderTemplate = require('../utils/render-template');

var _renderTemplate2 = _interopRequireDefault(_renderTemplate);

var _prepareReporters = require('../utils/prepare-reporters');

var _prepareReporters2 = _interopRequireDefault(_prepareReporters);

var _warningMessage = require('../notifications/warning-message');

var _warningMessage2 = _interopRequireDefault(_warningMessage);

var _log = require('../cli/log');

var _log2 = _interopRequireDefault(_log);

var _string = require('../utils/string');

var _defaultValues = require('./default-values');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const DEBUG_LOGGER = (0, _debug2.default)('testcafe:configuration');

const CONFIGURATION_FILENAME = '.testcaferc.json';

const OPTION_FLAG_NAMES = [_optionNames2.default.skipJsErrors, _optionNames2.default.disablePageReloads, _optionNames2.default.quarantineMode, _optionNames2.default.debugMode, _optionNames2.default.debugOnFail, _optionNames2.default.skipUncaughtErrors, _optionNames2.default.stopOnFirstFail, _optionNames2.default.takeScreenshotsOnFails];

class Configuration {
    constructor() {
        this._options = {};
        this._filePath = (0, _resolvePathRelativelyCwd2.default)(CONFIGURATION_FILENAME);
        this._overridenOptions = [];
    }

    static _fromObj(obj) {
        const result = (0, _create2.default)(null);

        (0, _entries2.default)(obj).forEach(([key, value]) => {
            const option = new _option2.default(key, value);

            result[key] = option;
        });

        return result;
    }

    static _isConfigurationFileExists(path) {
        return (0, _asyncToGenerator3.default)(function* () {
            try {
                yield (0, _promisifiedFunctions.stat)(path);

                return true;
            } catch (error) {
                DEBUG_LOGGER((0, _renderTemplate2.default)(_warningMessage2.default.cannotFindConfigurationFile, path, error.stack));

                return false;
            }
        })();
    }

    static _showConsoleWarning(message) {
        _log2.default.write(message);
    }

    static _showWarningForError(error, warningTemplate, ...args) {
        const message = (0, _renderTemplate2.default)(warningTemplate, ...args);

        Configuration._showConsoleWarning(message);

        DEBUG_LOGGER(message);
        DEBUG_LOGGER(error);
    }

    _load() {
        var _this = this;

        return (0, _asyncToGenerator3.default)(function* () {
            if (!(yield Configuration._isConfigurationFileExists(_this.filePath))) return;

            let configurationFileContent = null;

            try {
                configurationFileContent = yield (0, _promisifiedFunctions.readFile)(_this.filePath);
            } catch (error) {
                Configuration._showWarningForError(error, _warningMessage2.default.cannotReadConfigFile);

                return;
            }

            try {
                const optionsObj = _json2.default.parse(configurationFileContent);

                _this._options = Configuration._fromObj(optionsObj);
            } catch (error) {
                Configuration._showWarningForError(error, _warningMessage2.default.cannotParseConfigFile);

                return;
            }

            yield _this._normalizeOptionsAfterLoad();
        })();
    }

    _normalizeOptionsAfterLoad() {
        var _this2 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            yield _this2._prepareSslOptions();
            _this2._prepareFilterFn();
            _this2._ensureArrayOption(_optionNames2.default.src);
            _this2._ensureArrayOption(_optionNames2.default.browsers);
            _this2._prepareReporters();
        })();
    }

    _ensureArrayOption(name) {
        const options = this._options[name];

        if (!options) return;

        options.value = (0, _lodash.castArray)(options.value);
    }

    _prepareFilterFn() {
        const filterOption = this._ensureOption(_optionNames2.default.filter, null);

        if (!filterOption.value) return;

        if (filterOption.value.testGrep) filterOption.value.testGrep = (0, _getOptions.getGrepOptions)(_optionNames2.default.filterTestGrep, filterOption.value.testGrep);

        if (filterOption.value.fixtureGrep) filterOption.value.fixtureGrep = (0, _getOptions.getGrepOptions)(_optionNames2.default.filterFixtureGrep, filterOption.value.fixtureGrep);

        filterOption.value = (0, _getFilterFn2.default)(filterOption.value);
    }

    _prepareReporters() {
        const reporterOption = this._options[_optionNames2.default.reporter];

        if (!reporterOption) return;

        const optionValue = (0, _lodash.castArray)(reporterOption.value);

        reporterOption.value = (0, _prepareReporters2.default)(optionValue);
    }

    _prepareSslOptions() {
        var _this3 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            const sslOptions = _this3._options[_optionNames2.default.ssl];

            if (!sslOptions) return;

            sslOptions.value = yield (0, _getOptions.getSSLOptions)(sslOptions.value);
        })();
    }

    _ensureOption(name, value, source) {
        let option = null;

        if (name in this._options) option = this._options[name];else {
            option = new _option2.default(name, value, source);

            this._options[name] = option;
        }

        return option;
    }

    _ensureOptionWithValue(name, defaultValue, source) {
        const option = this._ensureOption(name, defaultValue, source);

        if (option.value !== void 0) return;

        option.value = defaultValue;
        option.source = source;
    }

    init(options = {}) {
        var _this4 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            yield _this4._load();
            _this4.mergeOptions(options);
        })();
    }

    mergeOptions(options) {
        (0, _entries2.default)(options).map(([key, value]) => {
            const option = this._ensureOption(key, value, _optionSource2.default.input);

            if (value === void 0) return;

            if (option.value !== value && option.source === _optionSource2.default.configuration) this._overridenOptions.push(key);

            option.value = value;
            option.source = _optionSource2.default.input;
        });
    }

    _prepareFlags() {
        OPTION_FLAG_NAMES.forEach(name => {
            const option = this._ensureOption(name, void 0, _optionSource2.default.configuration);

            option.value = !!option.value;
        });
    }

    _setDefaultValues() {
        this._ensureOptionWithValue(_optionNames2.default.selectorTimeout, _defaultValues.DEFAULT_TIMEOUT.selector, _optionSource2.default.configuration);
        this._ensureOptionWithValue(_optionNames2.default.assertionTimeout, _defaultValues.DEFAULT_TIMEOUT.assertion, _optionSource2.default.configuration);
        this._ensureOptionWithValue(_optionNames2.default.pageLoadTimeout, _defaultValues.DEFAULT_TIMEOUT.pageLoad, _optionSource2.default.configuration);
        this._ensureOptionWithValue(_optionNames2.default.speed, _defaultValues.DEFAULT_SPEED_VALUE, _optionSource2.default.configuration);
        this._ensureOptionWithValue(_optionNames2.default.appInitDelay, _defaultValues.DEFAULT_APP_INIT_DELAY, _optionSource2.default.configuration);
        this._ensureOptionWithValue(_optionNames2.default.concurrency, _defaultValues.DEFAULT_CONCURRENCY_VALUE, _optionSource2.default.configuration);
    }

    prepare() {
        this._prepareFlags();
        this._setDefaultValues();
    }

    notifyAboutOverridenOptions() {
        if (!this._overridenOptions.length) return;

        const optionsStr = (0, _string.getConcatenatedValuesString)(this._overridenOptions);
        const optionsSuffix = (0, _string.getPluralSuffix)(this._overridenOptions);

        Configuration._showConsoleWarning((0, _renderTemplate2.default)(_warningMessage2.default.configOptionsWereOverriden, optionsStr, optionsSuffix));

        this._overridenOptions = [];
    }

    getOption(key) {
        if (!key) return void 0;

        const option = this._options[key];

        if (!option) return void 0;

        return option.value;
    }

    getOptions() {
        const result = (0, _create2.default)(null);

        (0, _entries2.default)(this._options).forEach(([name, option]) => {
            result[name] = option.value;
        });

        return result;
    }

    clone() {
        return (0, _lodash.cloneDeep)(this);
    }

    get startOptions() {
        const result = {
            hostname: this.getOption('hostname'),
            port1: this.getOption('port1'),
            port2: this.getOption('port2'),
            options: {
                ssl: this.getOption('ssl'),
                developmentMode: this.getOption('developmentMode'),
                retryTestPages: !!this.getOption('retryTestPages')
            }
        };

        if (result.options.retryTestPages) result.options.staticContentCaching = _defaultValues.STATIC_CONTENT_CACHING_SETTINGS;

        return result;
    }

    get filePath() {
        return this._filePath;
    }
}
exports.default = Configuration;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb25maWd1cmF0aW9uL2luZGV4LmpzIl0sIm5hbWVzIjpbIkRFQlVHX0xPR0dFUiIsIkNPTkZJR1VSQVRJT05fRklMRU5BTUUiLCJPUFRJT05fRkxBR19OQU1FUyIsInNraXBKc0Vycm9ycyIsImRpc2FibGVQYWdlUmVsb2FkcyIsInF1YXJhbnRpbmVNb2RlIiwiZGVidWdNb2RlIiwiZGVidWdPbkZhaWwiLCJza2lwVW5jYXVnaHRFcnJvcnMiLCJzdG9wT25GaXJzdEZhaWwiLCJ0YWtlU2NyZWVuc2hvdHNPbkZhaWxzIiwiQ29uZmlndXJhdGlvbiIsImNvbnN0cnVjdG9yIiwiX29wdGlvbnMiLCJfZmlsZVBhdGgiLCJfb3ZlcnJpZGVuT3B0aW9ucyIsIl9mcm9tT2JqIiwib2JqIiwicmVzdWx0IiwiZm9yRWFjaCIsImtleSIsInZhbHVlIiwib3B0aW9uIiwiX2lzQ29uZmlndXJhdGlvbkZpbGVFeGlzdHMiLCJwYXRoIiwiZXJyb3IiLCJjYW5ub3RGaW5kQ29uZmlndXJhdGlvbkZpbGUiLCJzdGFjayIsIl9zaG93Q29uc29sZVdhcm5pbmciLCJtZXNzYWdlIiwid3JpdGUiLCJfc2hvd1dhcm5pbmdGb3JFcnJvciIsIndhcm5pbmdUZW1wbGF0ZSIsImFyZ3MiLCJfbG9hZCIsImZpbGVQYXRoIiwiY29uZmlndXJhdGlvbkZpbGVDb250ZW50IiwiY2Fubm90UmVhZENvbmZpZ0ZpbGUiLCJvcHRpb25zT2JqIiwicGFyc2UiLCJjYW5ub3RQYXJzZUNvbmZpZ0ZpbGUiLCJfbm9ybWFsaXplT3B0aW9uc0FmdGVyTG9hZCIsIl9wcmVwYXJlU3NsT3B0aW9ucyIsIl9wcmVwYXJlRmlsdGVyRm4iLCJfZW5zdXJlQXJyYXlPcHRpb24iLCJzcmMiLCJicm93c2VycyIsIl9wcmVwYXJlUmVwb3J0ZXJzIiwibmFtZSIsIm9wdGlvbnMiLCJmaWx0ZXJPcHRpb24iLCJfZW5zdXJlT3B0aW9uIiwiZmlsdGVyIiwidGVzdEdyZXAiLCJmaWx0ZXJUZXN0R3JlcCIsImZpeHR1cmVHcmVwIiwiZmlsdGVyRml4dHVyZUdyZXAiLCJyZXBvcnRlck9wdGlvbiIsInJlcG9ydGVyIiwib3B0aW9uVmFsdWUiLCJzc2xPcHRpb25zIiwic3NsIiwic291cmNlIiwiX2Vuc3VyZU9wdGlvbldpdGhWYWx1ZSIsImRlZmF1bHRWYWx1ZSIsImluaXQiLCJtZXJnZU9wdGlvbnMiLCJtYXAiLCJpbnB1dCIsImNvbmZpZ3VyYXRpb24iLCJwdXNoIiwiX3ByZXBhcmVGbGFncyIsIl9zZXREZWZhdWx0VmFsdWVzIiwic2VsZWN0b3JUaW1lb3V0Iiwic2VsZWN0b3IiLCJhc3NlcnRpb25UaW1lb3V0IiwiYXNzZXJ0aW9uIiwicGFnZUxvYWRUaW1lb3V0IiwicGFnZUxvYWQiLCJzcGVlZCIsImFwcEluaXREZWxheSIsImNvbmN1cnJlbmN5IiwicHJlcGFyZSIsIm5vdGlmeUFib3V0T3ZlcnJpZGVuT3B0aW9ucyIsImxlbmd0aCIsIm9wdGlvbnNTdHIiLCJvcHRpb25zU3VmZml4IiwiY29uZmlnT3B0aW9uc1dlcmVPdmVycmlkZW4iLCJnZXRPcHRpb24iLCJnZXRPcHRpb25zIiwiY2xvbmUiLCJzdGFydE9wdGlvbnMiLCJob3N0bmFtZSIsInBvcnQxIiwicG9ydDIiLCJkZXZlbG9wbWVudE1vZGUiLCJyZXRyeVRlc3RQYWdlcyIsInN0YXRpY0NvbnRlbnRDYWNoaW5nIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7Ozs7QUFDQTs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOztBQUVBOzs7O0FBUUEsTUFBTUEsZUFBZSxxQkFBTSx3QkFBTixDQUFyQjs7QUFFQSxNQUFNQyx5QkFBeUIsa0JBQS9COztBQUVBLE1BQU1DLG9CQUFvQixDQUN0QixzQkFBYUMsWUFEUyxFQUV0QixzQkFBYUMsa0JBRlMsRUFHdEIsc0JBQWFDLGNBSFMsRUFJdEIsc0JBQWFDLFNBSlMsRUFLdEIsc0JBQWFDLFdBTFMsRUFNdEIsc0JBQWFDLGtCQU5TLEVBT3RCLHNCQUFhQyxlQVBTLEVBUXRCLHNCQUFhQyxzQkFSUyxDQUExQjs7QUFXZSxNQUFNQyxhQUFOLENBQW9CO0FBQy9CQyxrQkFBZTtBQUNYLGFBQUtDLFFBQUwsR0FBaUIsRUFBakI7QUFDQSxhQUFLQyxTQUFMLEdBQWlCLHdDQUF5QmIsc0JBQXpCLENBQWpCO0FBQ0EsYUFBS2MsaUJBQUwsR0FBeUIsRUFBekI7QUFDSDs7QUFFRCxXQUFPQyxRQUFQLENBQWlCQyxHQUFqQixFQUFzQjtBQUNsQixjQUFNQyxTQUFTLHNCQUFjLElBQWQsQ0FBZjs7QUFFQSwrQkFBZUQsR0FBZixFQUFvQkUsT0FBcEIsQ0FBNEIsQ0FBQyxDQUFDQyxHQUFELEVBQU1DLEtBQU4sQ0FBRCxLQUFrQjtBQUMxQyxrQkFBTUMsU0FBUyxxQkFBV0YsR0FBWCxFQUFnQkMsS0FBaEIsQ0FBZjs7QUFFQUgsbUJBQU9FLEdBQVAsSUFBY0UsTUFBZDtBQUNILFNBSkQ7O0FBTUEsZUFBT0osTUFBUDtBQUNIOztBQUVELFdBQWFLLDBCQUFiLENBQXlDQyxJQUF6QyxFQUErQztBQUFBO0FBQzNDLGdCQUFJO0FBQ0Esc0JBQU0sZ0NBQUtBLElBQUwsQ0FBTjs7QUFFQSx1QkFBTyxJQUFQO0FBQ0gsYUFKRCxDQUtBLE9BQU9DLEtBQVAsRUFBYztBQUNWekIsNkJBQWEsOEJBQWUseUJBQWlCMEIsMkJBQWhDLEVBQTZERixJQUE3RCxFQUFtRUMsTUFBTUUsS0FBekUsQ0FBYjs7QUFFQSx1QkFBTyxLQUFQO0FBQ0g7QUFWMEM7QUFXOUM7O0FBRUQsV0FBT0MsbUJBQVAsQ0FBNEJDLE9BQTVCLEVBQXFDO0FBQ2pDLHNCQUFJQyxLQUFKLENBQVVELE9BQVY7QUFDSDs7QUFFRCxXQUFPRSxvQkFBUCxDQUE2Qk4sS0FBN0IsRUFBb0NPLGVBQXBDLEVBQXFELEdBQUdDLElBQXhELEVBQThEO0FBQzFELGNBQU1KLFVBQVUsOEJBQWVHLGVBQWYsRUFBZ0MsR0FBR0MsSUFBbkMsQ0FBaEI7O0FBRUF0QixzQkFBY2lCLG1CQUFkLENBQWtDQyxPQUFsQzs7QUFFQTdCLHFCQUFhNkIsT0FBYjtBQUNBN0IscUJBQWF5QixLQUFiO0FBQ0g7O0FBRUtTLFNBQU4sR0FBZTtBQUFBOztBQUFBO0FBQ1gsZ0JBQUksRUFBQyxNQUFNdkIsY0FBY1ksMEJBQWQsQ0FBeUMsTUFBS1ksUUFBOUMsQ0FBUCxDQUFKLEVBQ0k7O0FBRUosZ0JBQUlDLDJCQUEyQixJQUEvQjs7QUFFQSxnQkFBSTtBQUNBQSwyQ0FBMkIsTUFBTSxvQ0FBUyxNQUFLRCxRQUFkLENBQWpDO0FBQ0gsYUFGRCxDQUdBLE9BQU9WLEtBQVAsRUFBYztBQUNWZCw4QkFBY29CLG9CQUFkLENBQW1DTixLQUFuQyxFQUEwQyx5QkFBaUJZLG9CQUEzRDs7QUFFQTtBQUNIOztBQUVELGdCQUFJO0FBQ0Esc0JBQU1DLGFBQWEsZUFBTUMsS0FBTixDQUFZSCx3QkFBWixDQUFuQjs7QUFFQSxzQkFBS3ZCLFFBQUwsR0FBZ0JGLGNBQWNLLFFBQWQsQ0FBdUJzQixVQUF2QixDQUFoQjtBQUNILGFBSkQsQ0FLQSxPQUFPYixLQUFQLEVBQWM7QUFDVmQsOEJBQWNvQixvQkFBZCxDQUFtQ04sS0FBbkMsRUFBMEMseUJBQWlCZSxxQkFBM0Q7O0FBRUE7QUFDSDs7QUFFRCxrQkFBTSxNQUFLQywwQkFBTCxFQUFOO0FBMUJXO0FBMkJkOztBQUVLQSw4QkFBTixHQUFvQztBQUFBOztBQUFBO0FBQ2hDLGtCQUFNLE9BQUtDLGtCQUFMLEVBQU47QUFDQSxtQkFBS0MsZ0JBQUw7QUFDQSxtQkFBS0Msa0JBQUwsQ0FBd0Isc0JBQWFDLEdBQXJDO0FBQ0EsbUJBQUtELGtCQUFMLENBQXdCLHNCQUFhRSxRQUFyQztBQUNBLG1CQUFLQyxpQkFBTDtBQUxnQztBQU1uQzs7QUFFREgsdUJBQW9CSSxJQUFwQixFQUEwQjtBQUN0QixjQUFNQyxVQUFVLEtBQUtwQyxRQUFMLENBQWNtQyxJQUFkLENBQWhCOztBQUVBLFlBQUksQ0FBQ0MsT0FBTCxFQUNJOztBQUVKQSxnQkFBUTVCLEtBQVIsR0FBZ0IsdUJBQVU0QixRQUFRNUIsS0FBbEIsQ0FBaEI7QUFDSDs7QUFFRHNCLHVCQUFvQjtBQUNoQixjQUFNTyxlQUFlLEtBQUtDLGFBQUwsQ0FBbUIsc0JBQWFDLE1BQWhDLEVBQXdDLElBQXhDLENBQXJCOztBQUVBLFlBQUksQ0FBQ0YsYUFBYTdCLEtBQWxCLEVBQ0k7O0FBRUosWUFBSTZCLGFBQWE3QixLQUFiLENBQW1CZ0MsUUFBdkIsRUFDSUgsYUFBYTdCLEtBQWIsQ0FBbUJnQyxRQUFuQixHQUE4QixnQ0FBZSxzQkFBYUMsY0FBNUIsRUFBNENKLGFBQWE3QixLQUFiLENBQW1CZ0MsUUFBL0QsQ0FBOUI7O0FBRUosWUFBSUgsYUFBYTdCLEtBQWIsQ0FBbUJrQyxXQUF2QixFQUNJTCxhQUFhN0IsS0FBYixDQUFtQmtDLFdBQW5CLEdBQWlDLGdDQUFlLHNCQUFhQyxpQkFBNUIsRUFBK0NOLGFBQWE3QixLQUFiLENBQW1Ca0MsV0FBbEUsQ0FBakM7O0FBRUpMLHFCQUFhN0IsS0FBYixHQUFxQiwyQkFBWTZCLGFBQWE3QixLQUF6QixDQUFyQjtBQUNIOztBQUVEMEIsd0JBQXFCO0FBQ2pCLGNBQU1VLGlCQUFpQixLQUFLNUMsUUFBTCxDQUFjLHNCQUFhNkMsUUFBM0IsQ0FBdkI7O0FBRUEsWUFBSSxDQUFDRCxjQUFMLEVBQ0k7O0FBRUosY0FBTUUsY0FBYyx1QkFBVUYsZUFBZXBDLEtBQXpCLENBQXBCOztBQUVBb0MsdUJBQWVwQyxLQUFmLEdBQXVCLGdDQUFpQnNDLFdBQWpCLENBQXZCO0FBQ0g7O0FBRUtqQixzQkFBTixHQUE0QjtBQUFBOztBQUFBO0FBQ3hCLGtCQUFNa0IsYUFBYSxPQUFLL0MsUUFBTCxDQUFjLHNCQUFhZ0QsR0FBM0IsQ0FBbkI7O0FBRUEsZ0JBQUksQ0FBQ0QsVUFBTCxFQUNJOztBQUVKQSx1QkFBV3ZDLEtBQVgsR0FBbUIsTUFBTSwrQkFBY3VDLFdBQVd2QyxLQUF6QixDQUF6QjtBQU53QjtBQU8zQjs7QUFFRDhCLGtCQUFlSCxJQUFmLEVBQXFCM0IsS0FBckIsRUFBNEJ5QyxNQUE1QixFQUFvQztBQUNoQyxZQUFJeEMsU0FBUyxJQUFiOztBQUVBLFlBQUkwQixRQUFRLEtBQUtuQyxRQUFqQixFQUNJUyxTQUFTLEtBQUtULFFBQUwsQ0FBY21DLElBQWQsQ0FBVCxDQURKLEtBRUs7QUFDRDFCLHFCQUFTLHFCQUFXMEIsSUFBWCxFQUFpQjNCLEtBQWpCLEVBQXdCeUMsTUFBeEIsQ0FBVDs7QUFFQSxpQkFBS2pELFFBQUwsQ0FBY21DLElBQWQsSUFBc0IxQixNQUF0QjtBQUNIOztBQUVELGVBQU9BLE1BQVA7QUFDSDs7QUFFRHlDLDJCQUF3QmYsSUFBeEIsRUFBOEJnQixZQUE5QixFQUE0Q0YsTUFBNUMsRUFBb0Q7QUFDaEQsY0FBTXhDLFNBQVMsS0FBSzZCLGFBQUwsQ0FBbUJILElBQW5CLEVBQXlCZ0IsWUFBekIsRUFBdUNGLE1BQXZDLENBQWY7O0FBRUEsWUFBSXhDLE9BQU9ELEtBQVAsS0FBaUIsS0FBSyxDQUExQixFQUNJOztBQUVKQyxlQUFPRCxLQUFQLEdBQWdCMkMsWUFBaEI7QUFDQTFDLGVBQU93QyxNQUFQLEdBQWdCQSxNQUFoQjtBQUNIOztBQUVLRyxRQUFOLENBQVloQixVQUFVLEVBQXRCLEVBQTBCO0FBQUE7O0FBQUE7QUFDdEIsa0JBQU0sT0FBS2YsS0FBTCxFQUFOO0FBQ0EsbUJBQUtnQyxZQUFMLENBQWtCakIsT0FBbEI7QUFGc0I7QUFHekI7O0FBRURpQixpQkFBY2pCLE9BQWQsRUFBdUI7QUFDbkIsK0JBQWVBLE9BQWYsRUFBd0JrQixHQUF4QixDQUE0QixDQUFDLENBQUMvQyxHQUFELEVBQU1DLEtBQU4sQ0FBRCxLQUFrQjtBQUMxQyxrQkFBTUMsU0FBUyxLQUFLNkIsYUFBTCxDQUFtQi9CLEdBQW5CLEVBQXdCQyxLQUF4QixFQUErQix1QkFBYStDLEtBQTVDLENBQWY7O0FBRUEsZ0JBQUkvQyxVQUFVLEtBQUssQ0FBbkIsRUFDSTs7QUFFSixnQkFBSUMsT0FBT0QsS0FBUCxLQUFpQkEsS0FBakIsSUFDQUMsT0FBT3dDLE1BQVAsS0FBa0IsdUJBQWFPLGFBRG5DLEVBRUksS0FBS3RELGlCQUFMLENBQXVCdUQsSUFBdkIsQ0FBNEJsRCxHQUE1Qjs7QUFFSkUsbUJBQU9ELEtBQVAsR0FBZ0JBLEtBQWhCO0FBQ0FDLG1CQUFPd0MsTUFBUCxHQUFnQix1QkFBYU0sS0FBN0I7QUFDSCxTQVpEO0FBYUg7O0FBRURHLG9CQUFpQjtBQUNickUsMEJBQWtCaUIsT0FBbEIsQ0FBMEI2QixRQUFRO0FBQzlCLGtCQUFNMUIsU0FBUyxLQUFLNkIsYUFBTCxDQUFtQkgsSUFBbkIsRUFBeUIsS0FBSyxDQUE5QixFQUFpQyx1QkFBYXFCLGFBQTlDLENBQWY7O0FBRUEvQyxtQkFBT0QsS0FBUCxHQUFlLENBQUMsQ0FBQ0MsT0FBT0QsS0FBeEI7QUFDSCxTQUpEO0FBS0g7O0FBRURtRCx3QkFBcUI7QUFDakIsYUFBS1Qsc0JBQUwsQ0FBNEIsc0JBQWFVLGVBQXpDLEVBQTBELCtCQUFnQkMsUUFBMUUsRUFBb0YsdUJBQWFMLGFBQWpHO0FBQ0EsYUFBS04sc0JBQUwsQ0FBNEIsc0JBQWFZLGdCQUF6QyxFQUEyRCwrQkFBZ0JDLFNBQTNFLEVBQXNGLHVCQUFhUCxhQUFuRztBQUNBLGFBQUtOLHNCQUFMLENBQTRCLHNCQUFhYyxlQUF6QyxFQUEwRCwrQkFBZ0JDLFFBQTFFLEVBQW9GLHVCQUFhVCxhQUFqRztBQUNBLGFBQUtOLHNCQUFMLENBQTRCLHNCQUFhZ0IsS0FBekMsc0NBQXFFLHVCQUFhVixhQUFsRjtBQUNBLGFBQUtOLHNCQUFMLENBQTRCLHNCQUFhaUIsWUFBekMseUNBQStFLHVCQUFhWCxhQUE1RjtBQUNBLGFBQUtOLHNCQUFMLENBQTRCLHNCQUFha0IsV0FBekMsNENBQWlGLHVCQUFhWixhQUE5RjtBQUNIOztBQUVEYSxjQUFXO0FBQ1AsYUFBS1gsYUFBTDtBQUNBLGFBQUtDLGlCQUFMO0FBQ0g7O0FBRURXLGtDQUErQjtBQUMzQixZQUFJLENBQUMsS0FBS3BFLGlCQUFMLENBQXVCcUUsTUFBNUIsRUFDSTs7QUFFSixjQUFNQyxhQUFnQix5Q0FBNEIsS0FBS3RFLGlCQUFqQyxDQUF0QjtBQUNBLGNBQU11RSxnQkFBZ0IsNkJBQWdCLEtBQUt2RSxpQkFBckIsQ0FBdEI7O0FBRUFKLHNCQUFjaUIsbUJBQWQsQ0FBa0MsOEJBQWUseUJBQWlCMkQsMEJBQWhDLEVBQTRERixVQUE1RCxFQUF3RUMsYUFBeEUsQ0FBbEM7O0FBRUEsYUFBS3ZFLGlCQUFMLEdBQXlCLEVBQXpCO0FBQ0g7O0FBRUR5RSxjQUFXcEUsR0FBWCxFQUFnQjtBQUNaLFlBQUksQ0FBQ0EsR0FBTCxFQUNJLE9BQU8sS0FBSyxDQUFaOztBQUVKLGNBQU1FLFNBQVMsS0FBS1QsUUFBTCxDQUFjTyxHQUFkLENBQWY7O0FBRUEsWUFBSSxDQUFDRSxNQUFMLEVBQ0ksT0FBTyxLQUFLLENBQVo7O0FBRUosZUFBT0EsT0FBT0QsS0FBZDtBQUNIOztBQUVEb0UsaUJBQWM7QUFDVixjQUFNdkUsU0FBUyxzQkFBYyxJQUFkLENBQWY7O0FBRUEsK0JBQWUsS0FBS0wsUUFBcEIsRUFBOEJNLE9BQTlCLENBQXNDLENBQUMsQ0FBQzZCLElBQUQsRUFBTzFCLE1BQVAsQ0FBRCxLQUFvQjtBQUN0REosbUJBQU84QixJQUFQLElBQWUxQixPQUFPRCxLQUF0QjtBQUNILFNBRkQ7O0FBSUEsZUFBT0gsTUFBUDtBQUNIOztBQUVEd0UsWUFBUztBQUNMLGVBQU8sdUJBQVUsSUFBVixDQUFQO0FBQ0g7O0FBRUQsUUFBSUMsWUFBSixHQUFvQjtBQUNoQixjQUFNekUsU0FBUztBQUNYMEUsc0JBQVUsS0FBS0osU0FBTCxDQUFlLFVBQWYsQ0FEQztBQUVYSyxtQkFBVSxLQUFLTCxTQUFMLENBQWUsT0FBZixDQUZDO0FBR1hNLG1CQUFVLEtBQUtOLFNBQUwsQ0FBZSxPQUFmLENBSEM7QUFJWHZDLHFCQUFVO0FBQ05ZLHFCQUFpQixLQUFLMkIsU0FBTCxDQUFlLEtBQWYsQ0FEWDtBQUVOTyxpQ0FBaUIsS0FBS1AsU0FBTCxDQUFlLGlCQUFmLENBRlg7QUFHTlEsZ0NBQWlCLENBQUMsQ0FBQyxLQUFLUixTQUFMLENBQWUsZ0JBQWY7QUFIYjtBQUpDLFNBQWY7O0FBV0EsWUFBSXRFLE9BQU8rQixPQUFQLENBQWUrQyxjQUFuQixFQUNJOUUsT0FBTytCLE9BQVAsQ0FBZWdELG9CQUFmOztBQUVKLGVBQU8vRSxNQUFQO0FBQ0g7O0FBRUQsUUFBSWlCLFFBQUosR0FBZ0I7QUFDWixlQUFPLEtBQUtyQixTQUFaO0FBQ0g7QUEzUDhCO2tCQUFkSCxhIiwiZmlsZSI6ImNvbmZpZ3VyYXRpb24vaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZGVidWcgZnJvbSAnZGVidWcnO1xuaW1wb3J0IHsgc3RhdCwgcmVhZEZpbGUgfSBmcm9tICcuLi91dGlscy9wcm9taXNpZmllZC1mdW5jdGlvbnMnO1xuaW1wb3J0IE9wdGlvbiBmcm9tICcuL29wdGlvbic7XG5pbXBvcnQgb3B0aW9uU291cmNlIGZyb20gJy4vb3B0aW9uLXNvdXJjZSc7XG5pbXBvcnQgeyBjbG9uZURlZXAsIGNhc3RBcnJheSB9IGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgeyBnZXRTU0xPcHRpb25zLCBnZXRHcmVwT3B0aW9ucyB9IGZyb20gJy4uL3V0aWxzL2dldC1vcHRpb25zJztcbmltcG9ydCBPUFRJT05fTkFNRVMgZnJvbSAnLi9vcHRpb24tbmFtZXMnO1xuaW1wb3J0IGdldEZpbHRlckZuIGZyb20gJy4uL3V0aWxzL2dldC1maWx0ZXItZm4nO1xuaW1wb3J0IHJlc29sdmVQYXRoUmVsYXRpdmVseUN3ZCBmcm9tICcuLi91dGlscy9yZXNvbHZlLXBhdGgtcmVsYXRpdmVseS1jd2QnO1xuaW1wb3J0IEpTT041IGZyb20gJ2pzb241JztcbmltcG9ydCByZW5kZXJUZW1wbGF0ZSBmcm9tICcuLi91dGlscy9yZW5kZXItdGVtcGxhdGUnO1xuaW1wb3J0IHByZXBhcmVSZXBvcnRlcnMgZnJvbSAnLi4vdXRpbHMvcHJlcGFyZS1yZXBvcnRlcnMnO1xuaW1wb3J0IFdBUk5JTkdfTUVTU0FHRVMgZnJvbSAnLi4vbm90aWZpY2F0aW9ucy93YXJuaW5nLW1lc3NhZ2UnO1xuaW1wb3J0IGxvZyBmcm9tICcuLi9jbGkvbG9nJztcbmltcG9ydCB7IGdldENvbmNhdGVuYXRlZFZhbHVlc1N0cmluZywgZ2V0UGx1cmFsU3VmZml4IH0gZnJvbSAnLi4vdXRpbHMvc3RyaW5nJztcblxuaW1wb3J0IHtcbiAgICBERUZBVUxUX1RJTUVPVVQsXG4gICAgREVGQVVMVF9TUEVFRF9WQUxVRSxcbiAgICBTVEFUSUNfQ09OVEVOVF9DQUNISU5HX1NFVFRJTkdTLFxuICAgIERFRkFVTFRfQVBQX0lOSVRfREVMQVksXG4gICAgREVGQVVMVF9DT05DVVJSRU5DWV9WQUxVRVxufSBmcm9tICcuL2RlZmF1bHQtdmFsdWVzJztcblxuY29uc3QgREVCVUdfTE9HR0VSID0gZGVidWcoJ3Rlc3RjYWZlOmNvbmZpZ3VyYXRpb24nKTtcblxuY29uc3QgQ09ORklHVVJBVElPTl9GSUxFTkFNRSA9ICcudGVzdGNhZmVyYy5qc29uJztcblxuY29uc3QgT1BUSU9OX0ZMQUdfTkFNRVMgPSBbXG4gICAgT1BUSU9OX05BTUVTLnNraXBKc0Vycm9ycyxcbiAgICBPUFRJT05fTkFNRVMuZGlzYWJsZVBhZ2VSZWxvYWRzLFxuICAgIE9QVElPTl9OQU1FUy5xdWFyYW50aW5lTW9kZSxcbiAgICBPUFRJT05fTkFNRVMuZGVidWdNb2RlLFxuICAgIE9QVElPTl9OQU1FUy5kZWJ1Z09uRmFpbCxcbiAgICBPUFRJT05fTkFNRVMuc2tpcFVuY2F1Z2h0RXJyb3JzLFxuICAgIE9QVElPTl9OQU1FUy5zdG9wT25GaXJzdEZhaWwsXG4gICAgT1BUSU9OX05BTUVTLnRha2VTY3JlZW5zaG90c09uRmFpbHNcbl07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbmZpZ3VyYXRpb24ge1xuICAgIGNvbnN0cnVjdG9yICgpIHtcbiAgICAgICAgdGhpcy5fb3B0aW9ucyAgPSB7fTtcbiAgICAgICAgdGhpcy5fZmlsZVBhdGggPSByZXNvbHZlUGF0aFJlbGF0aXZlbHlDd2QoQ09ORklHVVJBVElPTl9GSUxFTkFNRSk7XG4gICAgICAgIHRoaXMuX292ZXJyaWRlbk9wdGlvbnMgPSBbXTtcbiAgICB9XG5cbiAgICBzdGF0aWMgX2Zyb21PYmogKG9iaikge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXG4gICAgICAgIE9iamVjdC5lbnRyaWVzKG9iaikuZm9yRWFjaCgoW2tleSwgdmFsdWVdKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBvcHRpb24gPSBuZXcgT3B0aW9uKGtleSwgdmFsdWUpO1xuXG4gICAgICAgICAgICByZXN1bHRba2V5XSA9IG9wdGlvbjtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICBzdGF0aWMgYXN5bmMgX2lzQ29uZmlndXJhdGlvbkZpbGVFeGlzdHMgKHBhdGgpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IHN0YXQocGF0aCk7XG5cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgREVCVUdfTE9HR0VSKHJlbmRlclRlbXBsYXRlKFdBUk5JTkdfTUVTU0FHRVMuY2Fubm90RmluZENvbmZpZ3VyYXRpb25GaWxlLCBwYXRoLCBlcnJvci5zdGFjaykpO1xuXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgX3Nob3dDb25zb2xlV2FybmluZyAobWVzc2FnZSkge1xuICAgICAgICBsb2cud3JpdGUobWVzc2FnZSk7XG4gICAgfVxuXG4gICAgc3RhdGljIF9zaG93V2FybmluZ0ZvckVycm9yIChlcnJvciwgd2FybmluZ1RlbXBsYXRlLCAuLi5hcmdzKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSByZW5kZXJUZW1wbGF0ZSh3YXJuaW5nVGVtcGxhdGUsIC4uLmFyZ3MpO1xuXG4gICAgICAgIENvbmZpZ3VyYXRpb24uX3Nob3dDb25zb2xlV2FybmluZyhtZXNzYWdlKTtcblxuICAgICAgICBERUJVR19MT0dHRVIobWVzc2FnZSk7XG4gICAgICAgIERFQlVHX0xPR0dFUihlcnJvcik7XG4gICAgfVxuXG4gICAgYXN5bmMgX2xvYWQgKCkge1xuICAgICAgICBpZiAoIWF3YWl0IENvbmZpZ3VyYXRpb24uX2lzQ29uZmlndXJhdGlvbkZpbGVFeGlzdHModGhpcy5maWxlUGF0aCkpXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgbGV0IGNvbmZpZ3VyYXRpb25GaWxlQ29udGVudCA9IG51bGw7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb25GaWxlQ29udGVudCA9IGF3YWl0IHJlYWRGaWxlKHRoaXMuZmlsZVBhdGgpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgQ29uZmlndXJhdGlvbi5fc2hvd1dhcm5pbmdGb3JFcnJvcihlcnJvciwgV0FSTklOR19NRVNTQUdFUy5jYW5ub3RSZWFkQ29uZmlnRmlsZSk7XG5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBvcHRpb25zT2JqID0gSlNPTjUucGFyc2UoY29uZmlndXJhdGlvbkZpbGVDb250ZW50KTtcblxuICAgICAgICAgICAgdGhpcy5fb3B0aW9ucyA9IENvbmZpZ3VyYXRpb24uX2Zyb21PYmoob3B0aW9uc09iaik7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBDb25maWd1cmF0aW9uLl9zaG93V2FybmluZ0ZvckVycm9yKGVycm9yLCBXQVJOSU5HX01FU1NBR0VTLmNhbm5vdFBhcnNlQ29uZmlnRmlsZSk7XG5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGF3YWl0IHRoaXMuX25vcm1hbGl6ZU9wdGlvbnNBZnRlckxvYWQoKTtcbiAgICB9XG5cbiAgICBhc3luYyBfbm9ybWFsaXplT3B0aW9uc0FmdGVyTG9hZCAoKSB7XG4gICAgICAgIGF3YWl0IHRoaXMuX3ByZXBhcmVTc2xPcHRpb25zKCk7XG4gICAgICAgIHRoaXMuX3ByZXBhcmVGaWx0ZXJGbigpO1xuICAgICAgICB0aGlzLl9lbnN1cmVBcnJheU9wdGlvbihPUFRJT05fTkFNRVMuc3JjKTtcbiAgICAgICAgdGhpcy5fZW5zdXJlQXJyYXlPcHRpb24oT1BUSU9OX05BTUVTLmJyb3dzZXJzKTtcbiAgICAgICAgdGhpcy5fcHJlcGFyZVJlcG9ydGVycygpO1xuICAgIH1cblxuICAgIF9lbnN1cmVBcnJheU9wdGlvbiAobmFtZSkge1xuICAgICAgICBjb25zdCBvcHRpb25zID0gdGhpcy5fb3B0aW9uc1tuYW1lXTtcblxuICAgICAgICBpZiAoIW9wdGlvbnMpXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgb3B0aW9ucy52YWx1ZSA9IGNhc3RBcnJheShvcHRpb25zLnZhbHVlKTtcbiAgICB9XG5cbiAgICBfcHJlcGFyZUZpbHRlckZuICgpIHtcbiAgICAgICAgY29uc3QgZmlsdGVyT3B0aW9uID0gdGhpcy5fZW5zdXJlT3B0aW9uKE9QVElPTl9OQU1FUy5maWx0ZXIsIG51bGwpO1xuXG4gICAgICAgIGlmICghZmlsdGVyT3B0aW9uLnZhbHVlKVxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIGlmIChmaWx0ZXJPcHRpb24udmFsdWUudGVzdEdyZXApXG4gICAgICAgICAgICBmaWx0ZXJPcHRpb24udmFsdWUudGVzdEdyZXAgPSBnZXRHcmVwT3B0aW9ucyhPUFRJT05fTkFNRVMuZmlsdGVyVGVzdEdyZXAsIGZpbHRlck9wdGlvbi52YWx1ZS50ZXN0R3JlcCk7XG5cbiAgICAgICAgaWYgKGZpbHRlck9wdGlvbi52YWx1ZS5maXh0dXJlR3JlcClcbiAgICAgICAgICAgIGZpbHRlck9wdGlvbi52YWx1ZS5maXh0dXJlR3JlcCA9IGdldEdyZXBPcHRpb25zKE9QVElPTl9OQU1FUy5maWx0ZXJGaXh0dXJlR3JlcCwgZmlsdGVyT3B0aW9uLnZhbHVlLmZpeHR1cmVHcmVwKTtcblxuICAgICAgICBmaWx0ZXJPcHRpb24udmFsdWUgPSBnZXRGaWx0ZXJGbihmaWx0ZXJPcHRpb24udmFsdWUpO1xuICAgIH1cblxuICAgIF9wcmVwYXJlUmVwb3J0ZXJzICgpIHtcbiAgICAgICAgY29uc3QgcmVwb3J0ZXJPcHRpb24gPSB0aGlzLl9vcHRpb25zW09QVElPTl9OQU1FUy5yZXBvcnRlcl07XG5cbiAgICAgICAgaWYgKCFyZXBvcnRlck9wdGlvbilcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICBjb25zdCBvcHRpb25WYWx1ZSA9IGNhc3RBcnJheShyZXBvcnRlck9wdGlvbi52YWx1ZSk7XG5cbiAgICAgICAgcmVwb3J0ZXJPcHRpb24udmFsdWUgPSBwcmVwYXJlUmVwb3J0ZXJzKG9wdGlvblZhbHVlKTtcbiAgICB9XG5cbiAgICBhc3luYyBfcHJlcGFyZVNzbE9wdGlvbnMgKCkge1xuICAgICAgICBjb25zdCBzc2xPcHRpb25zID0gdGhpcy5fb3B0aW9uc1tPUFRJT05fTkFNRVMuc3NsXTtcblxuICAgICAgICBpZiAoIXNzbE9wdGlvbnMpXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgc3NsT3B0aW9ucy52YWx1ZSA9IGF3YWl0IGdldFNTTE9wdGlvbnMoc3NsT3B0aW9ucy52YWx1ZSk7XG4gICAgfVxuXG4gICAgX2Vuc3VyZU9wdGlvbiAobmFtZSwgdmFsdWUsIHNvdXJjZSkge1xuICAgICAgICBsZXQgb3B0aW9uID0gbnVsbDtcblxuICAgICAgICBpZiAobmFtZSBpbiB0aGlzLl9vcHRpb25zKVxuICAgICAgICAgICAgb3B0aW9uID0gdGhpcy5fb3B0aW9uc1tuYW1lXTtcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBvcHRpb24gPSBuZXcgT3B0aW9uKG5hbWUsIHZhbHVlLCBzb3VyY2UpO1xuXG4gICAgICAgICAgICB0aGlzLl9vcHRpb25zW25hbWVdID0gb3B0aW9uO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG9wdGlvbjtcbiAgICB9XG5cbiAgICBfZW5zdXJlT3B0aW9uV2l0aFZhbHVlIChuYW1lLCBkZWZhdWx0VmFsdWUsIHNvdXJjZSkge1xuICAgICAgICBjb25zdCBvcHRpb24gPSB0aGlzLl9lbnN1cmVPcHRpb24obmFtZSwgZGVmYXVsdFZhbHVlLCBzb3VyY2UpO1xuXG4gICAgICAgIGlmIChvcHRpb24udmFsdWUgIT09IHZvaWQgMClcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICBvcHRpb24udmFsdWUgID0gZGVmYXVsdFZhbHVlO1xuICAgICAgICBvcHRpb24uc291cmNlID0gc291cmNlO1xuICAgIH1cblxuICAgIGFzeW5jIGluaXQgKG9wdGlvbnMgPSB7fSkge1xuICAgICAgICBhd2FpdCB0aGlzLl9sb2FkKCk7XG4gICAgICAgIHRoaXMubWVyZ2VPcHRpb25zKG9wdGlvbnMpO1xuICAgIH1cblxuICAgIG1lcmdlT3B0aW9ucyAob3B0aW9ucykge1xuICAgICAgICBPYmplY3QuZW50cmllcyhvcHRpb25zKS5tYXAoKFtrZXksIHZhbHVlXSkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgb3B0aW9uID0gdGhpcy5fZW5zdXJlT3B0aW9uKGtleSwgdmFsdWUsIG9wdGlvblNvdXJjZS5pbnB1dCk7XG5cbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gdm9pZCAwKVxuICAgICAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICAgICAgaWYgKG9wdGlvbi52YWx1ZSAhPT0gdmFsdWUgJiZcbiAgICAgICAgICAgICAgICBvcHRpb24uc291cmNlID09PSBvcHRpb25Tb3VyY2UuY29uZmlndXJhdGlvbilcbiAgICAgICAgICAgICAgICB0aGlzLl9vdmVycmlkZW5PcHRpb25zLnB1c2goa2V5KTtcblxuICAgICAgICAgICAgb3B0aW9uLnZhbHVlICA9IHZhbHVlO1xuICAgICAgICAgICAgb3B0aW9uLnNvdXJjZSA9IG9wdGlvblNvdXJjZS5pbnB1dDtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgX3ByZXBhcmVGbGFncyAoKSB7XG4gICAgICAgIE9QVElPTl9GTEFHX05BTUVTLmZvckVhY2gobmFtZSA9PiB7XG4gICAgICAgICAgICBjb25zdCBvcHRpb24gPSB0aGlzLl9lbnN1cmVPcHRpb24obmFtZSwgdm9pZCAwLCBvcHRpb25Tb3VyY2UuY29uZmlndXJhdGlvbik7XG5cbiAgICAgICAgICAgIG9wdGlvbi52YWx1ZSA9ICEhb3B0aW9uLnZhbHVlO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBfc2V0RGVmYXVsdFZhbHVlcyAoKSB7XG4gICAgICAgIHRoaXMuX2Vuc3VyZU9wdGlvbldpdGhWYWx1ZShPUFRJT05fTkFNRVMuc2VsZWN0b3JUaW1lb3V0LCBERUZBVUxUX1RJTUVPVVQuc2VsZWN0b3IsIG9wdGlvblNvdXJjZS5jb25maWd1cmF0aW9uKTtcbiAgICAgICAgdGhpcy5fZW5zdXJlT3B0aW9uV2l0aFZhbHVlKE9QVElPTl9OQU1FUy5hc3NlcnRpb25UaW1lb3V0LCBERUZBVUxUX1RJTUVPVVQuYXNzZXJ0aW9uLCBvcHRpb25Tb3VyY2UuY29uZmlndXJhdGlvbik7XG4gICAgICAgIHRoaXMuX2Vuc3VyZU9wdGlvbldpdGhWYWx1ZShPUFRJT05fTkFNRVMucGFnZUxvYWRUaW1lb3V0LCBERUZBVUxUX1RJTUVPVVQucGFnZUxvYWQsIG9wdGlvblNvdXJjZS5jb25maWd1cmF0aW9uKTtcbiAgICAgICAgdGhpcy5fZW5zdXJlT3B0aW9uV2l0aFZhbHVlKE9QVElPTl9OQU1FUy5zcGVlZCwgREVGQVVMVF9TUEVFRF9WQUxVRSwgb3B0aW9uU291cmNlLmNvbmZpZ3VyYXRpb24pO1xuICAgICAgICB0aGlzLl9lbnN1cmVPcHRpb25XaXRoVmFsdWUoT1BUSU9OX05BTUVTLmFwcEluaXREZWxheSwgREVGQVVMVF9BUFBfSU5JVF9ERUxBWSwgb3B0aW9uU291cmNlLmNvbmZpZ3VyYXRpb24pO1xuICAgICAgICB0aGlzLl9lbnN1cmVPcHRpb25XaXRoVmFsdWUoT1BUSU9OX05BTUVTLmNvbmN1cnJlbmN5LCBERUZBVUxUX0NPTkNVUlJFTkNZX1ZBTFVFLCBvcHRpb25Tb3VyY2UuY29uZmlndXJhdGlvbik7XG4gICAgfVxuXG4gICAgcHJlcGFyZSAoKSB7XG4gICAgICAgIHRoaXMuX3ByZXBhcmVGbGFncygpO1xuICAgICAgICB0aGlzLl9zZXREZWZhdWx0VmFsdWVzKCk7XG4gICAgfVxuXG4gICAgbm90aWZ5QWJvdXRPdmVycmlkZW5PcHRpb25zICgpIHtcbiAgICAgICAgaWYgKCF0aGlzLl9vdmVycmlkZW5PcHRpb25zLmxlbmd0aClcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICBjb25zdCBvcHRpb25zU3RyICAgID0gZ2V0Q29uY2F0ZW5hdGVkVmFsdWVzU3RyaW5nKHRoaXMuX292ZXJyaWRlbk9wdGlvbnMpO1xuICAgICAgICBjb25zdCBvcHRpb25zU3VmZml4ID0gZ2V0UGx1cmFsU3VmZml4KHRoaXMuX292ZXJyaWRlbk9wdGlvbnMpO1xuXG4gICAgICAgIENvbmZpZ3VyYXRpb24uX3Nob3dDb25zb2xlV2FybmluZyhyZW5kZXJUZW1wbGF0ZShXQVJOSU5HX01FU1NBR0VTLmNvbmZpZ09wdGlvbnNXZXJlT3ZlcnJpZGVuLCBvcHRpb25zU3RyLCBvcHRpb25zU3VmZml4KSk7XG5cbiAgICAgICAgdGhpcy5fb3ZlcnJpZGVuT3B0aW9ucyA9IFtdO1xuICAgIH1cblxuICAgIGdldE9wdGlvbiAoa2V5KSB7XG4gICAgICAgIGlmICgha2V5KVxuICAgICAgICAgICAgcmV0dXJuIHZvaWQgMDtcblxuICAgICAgICBjb25zdCBvcHRpb24gPSB0aGlzLl9vcHRpb25zW2tleV07XG5cbiAgICAgICAgaWYgKCFvcHRpb24pXG4gICAgICAgICAgICByZXR1cm4gdm9pZCAwO1xuXG4gICAgICAgIHJldHVybiBvcHRpb24udmFsdWU7XG4gICAgfVxuXG4gICAgZ2V0T3B0aW9ucyAoKSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cbiAgICAgICAgT2JqZWN0LmVudHJpZXModGhpcy5fb3B0aW9ucykuZm9yRWFjaCgoW25hbWUsIG9wdGlvbl0pID0+IHtcbiAgICAgICAgICAgIHJlc3VsdFtuYW1lXSA9IG9wdGlvbi52YWx1ZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICBjbG9uZSAoKSB7XG4gICAgICAgIHJldHVybiBjbG9uZURlZXAodGhpcyk7XG4gICAgfVxuXG4gICAgZ2V0IHN0YXJ0T3B0aW9ucyAoKSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHtcbiAgICAgICAgICAgIGhvc3RuYW1lOiB0aGlzLmdldE9wdGlvbignaG9zdG5hbWUnKSxcbiAgICAgICAgICAgIHBvcnQxOiAgICB0aGlzLmdldE9wdGlvbigncG9ydDEnKSxcbiAgICAgICAgICAgIHBvcnQyOiAgICB0aGlzLmdldE9wdGlvbigncG9ydDInKSxcbiAgICAgICAgICAgIG9wdGlvbnM6ICB7XG4gICAgICAgICAgICAgICAgc3NsOiAgICAgICAgICAgICB0aGlzLmdldE9wdGlvbignc3NsJyksXG4gICAgICAgICAgICAgICAgZGV2ZWxvcG1lbnRNb2RlOiB0aGlzLmdldE9wdGlvbignZGV2ZWxvcG1lbnRNb2RlJyksXG4gICAgICAgICAgICAgICAgcmV0cnlUZXN0UGFnZXM6ICAhIXRoaXMuZ2V0T3B0aW9uKCdyZXRyeVRlc3RQYWdlcycpXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKHJlc3VsdC5vcHRpb25zLnJldHJ5VGVzdFBhZ2VzKVxuICAgICAgICAgICAgcmVzdWx0Lm9wdGlvbnMuc3RhdGljQ29udGVudENhY2hpbmcgPSBTVEFUSUNfQ09OVEVOVF9DQUNISU5HX1NFVFRJTkdTO1xuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgZ2V0IGZpbGVQYXRoICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ZpbGVQYXRoO1xuICAgIH1cbn1cbiJdfQ==
