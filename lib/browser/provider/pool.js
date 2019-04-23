'use strict';

exports.__esModule = true;

var _values = require('babel-runtime/core-js/object/values');

var _values2 = _interopRequireDefault(_values);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _pinkie = require('pinkie');

var _pinkie2 = _interopRequireDefault(_pinkie);

var _builtIn = require('./built-in');

var _builtIn2 = _interopRequireDefault(_builtIn);

var _pluginHost = require('./plugin-host');

var _pluginHost2 = _interopRequireDefault(_pluginHost);

var _parseProviderName = require('./parse-provider-name');

var _parseProviderName2 = _interopRequireDefault(_parseProviderName);

var _ = require('./');

var _2 = _interopRequireDefault(_);

var _connection = require('../connection');

var _connection2 = _interopRequireDefault(_connection);

var _runtime = require('../../errors/runtime');

var _types = require('../../errors/types');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const BROWSER_PROVIDER_RE = /^([^:\s]+):?(.*)?$/;

exports.default = {
    providersCache: {},

    _handlePathAndCmd(alias) {
        var _this = this;

        return (0, _asyncToGenerator3.default)(function* () {
            const browserName = (0, _stringify2.default)(alias);
            const providerName = 'path';
            const provider = yield _this.getProvider(providerName);

            return { provider, providerName, browserName };
        })();
    },

    _parseAliasString(alias) {
        var _this2 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            const providerRegExpMatch = BROWSER_PROVIDER_RE.exec(alias);

            if (!providerRegExpMatch) throw new _runtime.GeneralError(_types.RUNTIME_ERRORS.cannotFindBrowser, alias);

            let providerName = providerRegExpMatch[1];
            let browserName = providerRegExpMatch[2] || '';

            let provider = yield _this2.getProvider(providerName);

            if (!provider && providerRegExpMatch[2]) provider = yield _this2.getProvider(providerName + ':');

            if (!provider) {
                providerName = 'locally-installed';
                provider = yield _this2.getProvider(providerName);
                browserName = providerRegExpMatch[1] || '';
            }

            return { provider, providerName, browserName };
        })();
    },

    _parseAlias(alias) {
        var _this3 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            if (alias.browserName && alias.providerName && alias.provider) return alias;

            if (alias && alias.path) return _this3._handlePathAndCmd(alias);

            if (typeof alias === 'string') return _this3._parseAliasString(alias);

            throw new _runtime.GeneralError(_types.RUNTIME_ERRORS.cannotFindBrowser, alias);
        })();
    },

    _getInfoForAllBrowserNames(provider, providerName) {
        return (0, _asyncToGenerator3.default)(function* () {
            const allBrowserNames = provider.isMultiBrowser ? yield provider.getBrowserList() : [];

            if (!allBrowserNames.length) return { provider, providerName, browserName: '' };

            return allBrowserNames.map(function (browserName) {
                return { provider, providerName, browserName };
            });
        })();
    },

    _getProviderModule(providerName, moduleName) {
        try {
            const providerObject = require(moduleName);

            this.addProvider(providerName, providerObject);
            return this._getProviderFromCache(providerName);
        } catch (e) {
            return null;
        }
    },

    _getProviderFromCache(providerName) {
        return this.providersCache[providerName] || null;
    },

    _getBuiltinProvider(providerName) {
        const providerObject = _builtIn2.default[providerName];

        if (!providerObject) return null;

        this.addProvider(providerName, providerObject);

        return this._getProviderFromCache(providerName);
    },

    getBrowserInfo(alias) {
        var _this4 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            if (alias instanceof _connection2.default) return alias;

            const browserInfo = yield _this4._parseAlias(alias);

            const provider = browserInfo.provider,
                  providerName = browserInfo.providerName,
                  browserName = browserInfo.browserName;


            if (browserName === 'all') return yield _this4._getInfoForAllBrowserNames(provider, providerName);

            if (!(yield provider.isValidBrowserName(browserName))) throw new _runtime.GeneralError(_types.RUNTIME_ERRORS.cannotFindBrowser, alias);

            return (0, _extends3.default)({ alias }, browserInfo);
        })();
    },

    addProvider(providerName, providerObject) {
        providerName = (0, _parseProviderName2.default)(providerName).providerName;

        this.providersCache[providerName] = new _2.default(new _pluginHost2.default(providerObject, providerName));
    },

    removeProvider(providerName) {
        providerName = (0, _parseProviderName2.default)(providerName).providerName;

        delete this.providersCache[providerName];
    },

    getProvider(providerName) {
        var _this5 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            const parsedProviderName = (0, _parseProviderName2.default)(providerName);
            const moduleName = parsedProviderName.moduleName;

            providerName = parsedProviderName.providerName;

            const provider = _this5._getProviderFromCache(providerName) || _this5._getProviderModule(providerName, moduleName) || _this5._getBuiltinProvider(providerName);

            if (provider) yield _this5.providersCache[providerName].init();

            return provider;
        })();
    },

    dispose() {
        return _pinkie2.default.all((0, _values2.default)(this.providersCache).map(item => item.dispose()));
    }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9icm93c2VyL3Byb3ZpZGVyL3Bvb2wuanMiXSwibmFtZXMiOlsiQlJPV1NFUl9QUk9WSURFUl9SRSIsInByb3ZpZGVyc0NhY2hlIiwiX2hhbmRsZVBhdGhBbmRDbWQiLCJhbGlhcyIsImJyb3dzZXJOYW1lIiwicHJvdmlkZXJOYW1lIiwicHJvdmlkZXIiLCJnZXRQcm92aWRlciIsIl9wYXJzZUFsaWFzU3RyaW5nIiwicHJvdmlkZXJSZWdFeHBNYXRjaCIsImV4ZWMiLCJjYW5ub3RGaW5kQnJvd3NlciIsIl9wYXJzZUFsaWFzIiwicGF0aCIsIl9nZXRJbmZvRm9yQWxsQnJvd3Nlck5hbWVzIiwiYWxsQnJvd3Nlck5hbWVzIiwiaXNNdWx0aUJyb3dzZXIiLCJnZXRCcm93c2VyTGlzdCIsImxlbmd0aCIsIm1hcCIsIl9nZXRQcm92aWRlck1vZHVsZSIsIm1vZHVsZU5hbWUiLCJwcm92aWRlck9iamVjdCIsInJlcXVpcmUiLCJhZGRQcm92aWRlciIsIl9nZXRQcm92aWRlckZyb21DYWNoZSIsImUiLCJfZ2V0QnVpbHRpblByb3ZpZGVyIiwiZ2V0QnJvd3NlckluZm8iLCJicm93c2VySW5mbyIsImlzVmFsaWRCcm93c2VyTmFtZSIsInJlbW92ZVByb3ZpZGVyIiwicGFyc2VkUHJvdmlkZXJOYW1lIiwiaW5pdCIsImRpc3Bvc2UiLCJhbGwiLCJpdGVtIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOztBQUNBOzs7O0FBRUEsTUFBTUEsc0JBQXNCLG9CQUE1Qjs7a0JBRWU7QUFDWEMsb0JBQWdCLEVBREw7O0FBR0xDLHFCQUFOLENBQXlCQyxLQUF6QixFQUFnQztBQUFBOztBQUFBO0FBQzVCLGtCQUFNQyxjQUFlLHlCQUFlRCxLQUFmLENBQXJCO0FBQ0Esa0JBQU1FLGVBQWUsTUFBckI7QUFDQSxrQkFBTUMsV0FBZSxNQUFNLE1BQUtD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Q0FBUDtBQUNILEtBbkhVOztBQXFITEUsZUFBTixDQUFtQkYsWUFBbkIsRUFBaUM7QUFBQTs7QUFBQTtBQUM3QixrQkFBTTJCLHFCQUFxQixpQ0FBa0IzQixZQUFsQixDQUEzQjtBQUNBLGtCQUFNZ0IsYUFBcUJXLG1CQUFtQlgsVUFBOUM7O0FBRUFoQiwyQkFBZTJCLG1CQUFtQjNCLFlBQWxDOztBQUVBLGtCQUFNQyxXQUFXLE9BQUttQixxQkFBTCxDQUEyQnBCLFlBQTNCLEtBQ0YsT0FBS2Usa0JBQUwsQ0FBd0JmLFlBQXhCLEVBQXNDZ0IsVUFBdEMsQ0FERSxJQUVGLE9BQUtNLG1CQUFMLENBQXlCdEIsWUFBekIsQ0FGZjs7QUFJQSxnQkFBSUMsUUFBSixFQUNJLE1BQU0sT0FBS0wsY0FBTCxDQUFvQkksWUFBcEIsRUFBa0M0QixJQUFsQyxFQUFOOztBQUVKLG1CQUFPM0IsUUFBUDtBQWI2QjtBQWNoQyxLQW5JVTs7QUFxSVg0QixjQUFXO0FBQ1AsZUFBTyxpQkFBUUMsR0FBUixDQUFZLHNCQUFjLEtBQUtsQyxjQUFuQixFQUFtQ2tCLEdBQW5DLENBQXVDaUIsUUFBUUEsS0FBS0YsT0FBTCxFQUEvQyxDQUFaLENBQVA7QUFDSDtBQXZJVSxDIiwiZmlsZSI6ImJyb3dzZXIvcHJvdmlkZXIvcG9vbC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBQcm9taXNlIGZyb20gJ3BpbmtpZSc7XG5pbXBvcnQgQlVJTFRfSU5fUFJPVklERVJTIGZyb20gJy4vYnVpbHQtaW4nO1xuaW1wb3J0IEJyb3dzZXJQcm92aWRlclBsdWdpbkhvc3QgZnJvbSAnLi9wbHVnaW4taG9zdCc7XG5pbXBvcnQgcGFyc2VQcm92aWRlck5hbWUgZnJvbSAnLi9wYXJzZS1wcm92aWRlci1uYW1lJztcbmltcG9ydCBCcm93c2VyUHJvdmlkZXIgZnJvbSAnLi8nO1xuaW1wb3J0IEJyb3dzZXJDb25uZWN0aW9uIGZyb20gJy4uL2Nvbm5lY3Rpb24nO1xuaW1wb3J0IHsgR2VuZXJhbEVycm9yIH0gZnJvbSAnLi4vLi4vZXJyb3JzL3J1bnRpbWUnO1xuaW1wb3J0IHsgUlVOVElNRV9FUlJPUlMgfSBmcm9tICcuLi8uLi9lcnJvcnMvdHlwZXMnO1xuXG5jb25zdCBCUk9XU0VSX1BST1ZJREVSX1JFID0gL14oW146XFxzXSspOj8oLiopPyQvO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gICAgcHJvdmlkZXJzQ2FjaGU6IHt9LFxuXG4gICAgYXN5bmMgX2hhbmRsZVBhdGhBbmRDbWQgKGFsaWFzKSB7XG4gICAgICAgIGNvbnN0IGJyb3dzZXJOYW1lICA9IEpTT04uc3RyaW5naWZ5KGFsaWFzKTtcbiAgICAgICAgY29uc3QgcHJvdmlkZXJOYW1lID0gJ3BhdGgnO1xuICAgICAgICBjb25zdCBwcm92aWRlciAgICAgPSBhd2FpdCB0aGlzLmdldFByb3ZpZGVyKHByb3ZpZGVyTmFtZSk7XG5cbiAgICAgICAgcmV0dXJuIHsgcHJvdmlkZXIsIHByb3ZpZGVyTmFtZSwgYnJvd3Nlck5hbWUgfTtcbiAgICB9LFxuXG4gICAgYXN5bmMgX3BhcnNlQWxpYXNTdHJpbmcgKGFsaWFzKSB7XG4gICAgICAgIGNvbnN0IHByb3ZpZGVyUmVnRXhwTWF0Y2ggPSBCUk9XU0VSX1BST1ZJREVSX1JFLmV4ZWMoYWxpYXMpO1xuXG4gICAgICAgIGlmICghcHJvdmlkZXJSZWdFeHBNYXRjaClcbiAgICAgICAgICAgIHRocm93IG5ldyBHZW5lcmFsRXJyb3IoUlVOVElNRV9FUlJPUlMuY2Fubm90RmluZEJyb3dzZXIsIGFsaWFzKTtcblxuICAgICAgICBsZXQgcHJvdmlkZXJOYW1lID0gcHJvdmlkZXJSZWdFeHBNYXRjaFsxXTtcbiAgICAgICAgbGV0IGJyb3dzZXJOYW1lICA9IHByb3ZpZGVyUmVnRXhwTWF0Y2hbMl0gfHwgJyc7XG5cbiAgICAgICAgbGV0IHByb3ZpZGVyID0gYXdhaXQgdGhpcy5nZXRQcm92aWRlcihwcm92aWRlck5hbWUpO1xuXG4gICAgICAgIGlmICghcHJvdmlkZXIgJiYgcHJvdmlkZXJSZWdFeHBNYXRjaFsyXSlcbiAgICAgICAgICAgIHByb3ZpZGVyID0gYXdhaXQgdGhpcy5nZXRQcm92aWRlcihwcm92aWRlck5hbWUgKyAnOicpO1xuXG4gICAgICAgIGlmICghcHJvdmlkZXIpIHtcbiAgICAgICAgICAgIHByb3ZpZGVyTmFtZSA9ICdsb2NhbGx5LWluc3RhbGxlZCc7XG4gICAgICAgICAgICBwcm92aWRlciAgICAgPSBhd2FpdCB0aGlzLmdldFByb3ZpZGVyKHByb3ZpZGVyTmFtZSk7XG4gICAgICAgICAgICBicm93c2VyTmFtZSAgPSBwcm92aWRlclJlZ0V4cE1hdGNoWzFdIHx8ICcnO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHsgcHJvdmlkZXIsIHByb3ZpZGVyTmFtZSwgYnJvd3Nlck5hbWUgfTtcbiAgICB9LFxuXG4gICAgYXN5bmMgX3BhcnNlQWxpYXMgKGFsaWFzKSB7XG4gICAgICAgIGlmIChhbGlhcy5icm93c2VyTmFtZSAmJiBhbGlhcy5wcm92aWRlck5hbWUgJiYgYWxpYXMucHJvdmlkZXIpXG4gICAgICAgICAgICByZXR1cm4gYWxpYXM7XG5cbiAgICAgICAgaWYgKGFsaWFzICYmIGFsaWFzLnBhdGgpXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5faGFuZGxlUGF0aEFuZENtZChhbGlhcyk7XG5cbiAgICAgICAgaWYgKHR5cGVvZiBhbGlhcyA9PT0gJ3N0cmluZycpXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fcGFyc2VBbGlhc1N0cmluZyhhbGlhcyk7XG5cbiAgICAgICAgdGhyb3cgbmV3IEdlbmVyYWxFcnJvcihSVU5USU1FX0VSUk9SUy5jYW5ub3RGaW5kQnJvd3NlciwgYWxpYXMpO1xuICAgIH0sXG5cbiAgICBhc3luYyBfZ2V0SW5mb0ZvckFsbEJyb3dzZXJOYW1lcyAocHJvdmlkZXIsIHByb3ZpZGVyTmFtZSkge1xuICAgICAgICBjb25zdCBhbGxCcm93c2VyTmFtZXMgPSBwcm92aWRlci5pc011bHRpQnJvd3NlciA/XG4gICAgICAgICAgICBhd2FpdCBwcm92aWRlci5nZXRCcm93c2VyTGlzdCgpIDpcbiAgICAgICAgICAgIFtdO1xuXG4gICAgICAgIGlmICghYWxsQnJvd3Nlck5hbWVzLmxlbmd0aClcbiAgICAgICAgICAgIHJldHVybiB7IHByb3ZpZGVyLCBwcm92aWRlck5hbWUsIGJyb3dzZXJOYW1lOiAnJyB9O1xuXG4gICAgICAgIHJldHVybiBhbGxCcm93c2VyTmFtZXNcbiAgICAgICAgICAgIC5tYXAoYnJvd3Nlck5hbWUgPT4gKHsgcHJvdmlkZXIsIHByb3ZpZGVyTmFtZSwgYnJvd3Nlck5hbWUgfSkpO1xuICAgIH0sXG5cbiAgICBfZ2V0UHJvdmlkZXJNb2R1bGUgKHByb3ZpZGVyTmFtZSwgbW9kdWxlTmFtZSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcHJvdmlkZXJPYmplY3QgPSByZXF1aXJlKG1vZHVsZU5hbWUpO1xuXG4gICAgICAgICAgICB0aGlzLmFkZFByb3ZpZGVyKHByb3ZpZGVyTmFtZSwgcHJvdmlkZXJPYmplY3QpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2dldFByb3ZpZGVyRnJvbUNhY2hlKHByb3ZpZGVyTmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIF9nZXRQcm92aWRlckZyb21DYWNoZSAocHJvdmlkZXJOYW1lKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByb3ZpZGVyc0NhY2hlW3Byb3ZpZGVyTmFtZV0gfHwgbnVsbDtcbiAgICB9LFxuXG4gICAgX2dldEJ1aWx0aW5Qcm92aWRlciAocHJvdmlkZXJOYW1lKSB7XG4gICAgICAgIGNvbnN0IHByb3ZpZGVyT2JqZWN0ID0gQlVJTFRfSU5fUFJPVklERVJTW3Byb3ZpZGVyTmFtZV07XG5cbiAgICAgICAgaWYgKCFwcm92aWRlck9iamVjdClcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuXG4gICAgICAgIHRoaXMuYWRkUHJvdmlkZXIocHJvdmlkZXJOYW1lLCBwcm92aWRlck9iamVjdCk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX2dldFByb3ZpZGVyRnJvbUNhY2hlKHByb3ZpZGVyTmFtZSk7XG4gICAgfSxcblxuICAgIGFzeW5jIGdldEJyb3dzZXJJbmZvIChhbGlhcykge1xuICAgICAgICBpZiAoYWxpYXMgaW5zdGFuY2VvZiBCcm93c2VyQ29ubmVjdGlvbilcbiAgICAgICAgICAgIHJldHVybiBhbGlhcztcblxuICAgICAgICBjb25zdCBicm93c2VySW5mbyA9IGF3YWl0IHRoaXMuX3BhcnNlQWxpYXMoYWxpYXMpO1xuXG4gICAgICAgIGNvbnN0IHsgcHJvdmlkZXIsIHByb3ZpZGVyTmFtZSwgYnJvd3Nlck5hbWUgfSA9IGJyb3dzZXJJbmZvO1xuXG4gICAgICAgIGlmIChicm93c2VyTmFtZSA9PT0gJ2FsbCcpXG4gICAgICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5fZ2V0SW5mb0ZvckFsbEJyb3dzZXJOYW1lcyhwcm92aWRlciwgcHJvdmlkZXJOYW1lKTtcblxuICAgICAgICBpZiAoIWF3YWl0IHByb3ZpZGVyLmlzVmFsaWRCcm93c2VyTmFtZShicm93c2VyTmFtZSkpXG4gICAgICAgICAgICB0aHJvdyBuZXcgR2VuZXJhbEVycm9yKFJVTlRJTUVfRVJST1JTLmNhbm5vdEZpbmRCcm93c2VyLCBhbGlhcyk7XG5cbiAgICAgICAgcmV0dXJuIHsgYWxpYXMsIC4uLmJyb3dzZXJJbmZvIH07XG4gICAgfSxcblxuICAgIGFkZFByb3ZpZGVyIChwcm92aWRlck5hbWUsIHByb3ZpZGVyT2JqZWN0KSB7XG4gICAgICAgIHByb3ZpZGVyTmFtZSA9IHBhcnNlUHJvdmlkZXJOYW1lKHByb3ZpZGVyTmFtZSkucHJvdmlkZXJOYW1lO1xuXG4gICAgICAgIHRoaXMucHJvdmlkZXJzQ2FjaGVbcHJvdmlkZXJOYW1lXSA9IG5ldyBCcm93c2VyUHJvdmlkZXIoXG4gICAgICAgICAgICBuZXcgQnJvd3NlclByb3ZpZGVyUGx1Z2luSG9zdChwcm92aWRlck9iamVjdCwgcHJvdmlkZXJOYW1lKVxuICAgICAgICApO1xuICAgIH0sXG5cbiAgICByZW1vdmVQcm92aWRlciAocHJvdmlkZXJOYW1lKSB7XG4gICAgICAgIHByb3ZpZGVyTmFtZSA9IHBhcnNlUHJvdmlkZXJOYW1lKHByb3ZpZGVyTmFtZSkucHJvdmlkZXJOYW1lO1xuXG4gICAgICAgIGRlbGV0ZSB0aGlzLnByb3ZpZGVyc0NhY2hlW3Byb3ZpZGVyTmFtZV07XG4gICAgfSxcblxuICAgIGFzeW5jIGdldFByb3ZpZGVyIChwcm92aWRlck5hbWUpIHtcbiAgICAgICAgY29uc3QgcGFyc2VkUHJvdmlkZXJOYW1lID0gcGFyc2VQcm92aWRlck5hbWUocHJvdmlkZXJOYW1lKTtcbiAgICAgICAgY29uc3QgbW9kdWxlTmFtZSAgICAgICAgID0gcGFyc2VkUHJvdmlkZXJOYW1lLm1vZHVsZU5hbWU7XG5cbiAgICAgICAgcHJvdmlkZXJOYW1lID0gcGFyc2VkUHJvdmlkZXJOYW1lLnByb3ZpZGVyTmFtZTtcblxuICAgICAgICBjb25zdCBwcm92aWRlciA9IHRoaXMuX2dldFByb3ZpZGVyRnJvbUNhY2hlKHByb3ZpZGVyTmFtZSkgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZ2V0UHJvdmlkZXJNb2R1bGUocHJvdmlkZXJOYW1lLCBtb2R1bGVOYW1lKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9nZXRCdWlsdGluUHJvdmlkZXIocHJvdmlkZXJOYW1lKTtcblxuICAgICAgICBpZiAocHJvdmlkZXIpXG4gICAgICAgICAgICBhd2FpdCB0aGlzLnByb3ZpZGVyc0NhY2hlW3Byb3ZpZGVyTmFtZV0uaW5pdCgpO1xuXG4gICAgICAgIHJldHVybiBwcm92aWRlcjtcbiAgICB9LFxuXG4gICAgZGlzcG9zZSAoKSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLmFsbChPYmplY3QudmFsdWVzKHRoaXMucHJvdmlkZXJzQ2FjaGUpLm1hcChpdGVtID0+IGl0ZW0uZGlzcG9zZSgpKSk7XG4gICAgfVxufTtcbiJdfQ==
