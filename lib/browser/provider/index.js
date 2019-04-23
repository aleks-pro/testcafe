'use strict';

exports.__esModule = true;

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _pinkie = require('pinkie');

var _pinkie2 = _interopRequireDefault(_pinkie);

var _testcafeBrowserTools = require('testcafe-browser-tools');

var _testcafeBrowserTools2 = _interopRequireDefault(_testcafeBrowserTools);

var _osFamily = require('os-family');

var _osFamily2 = _interopRequireDefault(_osFamily);

var _connection = require('../connection');

var _connection2 = _interopRequireDefault(_connection);

var _delay = require('../../utils/delay');

var _delay2 = _interopRequireDefault(_delay);

var _clientFunctions = require('./utils/client-functions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const BROWSER_OPENING_DELAY = 2000;

const RESIZE_DIFF_SIZE = {
    width: 100,
    height: 100
};

function sumSizes(sizeA, sizeB) {
    return {
        width: sizeA.width + sizeB.width,
        height: sizeA.height + sizeB.height
    };
}

function subtractSizes(sizeA, sizeB) {
    return {
        width: sizeA.width - sizeB.width,
        height: sizeA.height - sizeB.height
    };
}

class BrowserProvider {
    constructor(plugin) {
        this.plugin = plugin;
        this.initPromise = _pinkie2.default.resolve(false);

        this.isMultiBrowser = this.plugin.isMultiBrowser;
        // HACK: The browser window has different border sizes in normal and maximized modes. So, we need to be sure that the window is
        // not maximized before resizing it in order to keep the mechanism of correcting the client area size working. When browser is started,
        // we are resizing it for the first time to switch the window to normal mode, and for the second time - to restore the client area size.
        this.localBrowsersInfo = {};
    }

    _createLocalBrowserInfo(browserId) {
        if (this.localBrowsersInfo[browserId]) return;

        this.localBrowsersInfo[browserId] = {
            windowDescriptor: null,
            maxScreenSize: null,
            resizeCorrections: null
        };
    }

    _getWindowDescriptor(browserId) {
        return this.localBrowsersInfo[browserId] && this.localBrowsersInfo[browserId].windowDescriptor;
    }

    _getMaxScreenSize(browserId) {
        return this.localBrowsersInfo[browserId] && this.localBrowsersInfo[browserId].maxScreenSize;
    }

    _getResizeCorrections(browserId) {
        return this.localBrowsersInfo[browserId] && this.localBrowsersInfo[browserId].resizeCorrections;
    }

    _isBrowserIdle(browserId) {
        const connection = _connection2.default.getById(browserId);

        return connection.idle;
    }

    _calculateResizeCorrections(browserId) {
        var _this = this;

        return (0, _asyncToGenerator3.default)(function* () {
            if (!_this._isBrowserIdle(browserId)) return;

            const title = yield _this.plugin.runInitScript(browserId, _clientFunctions.GET_TITLE_SCRIPT);

            if (!(yield _testcafeBrowserTools2.default.isMaximized(title))) return;

            const currentSize = yield _this.plugin.runInitScript(browserId, _clientFunctions.GET_WINDOW_DIMENSIONS_INFO_SCRIPT);
            const etalonSize = subtractSizes(currentSize, RESIZE_DIFF_SIZE);

            yield _testcafeBrowserTools2.default.resize(title, currentSize.width, currentSize.height, etalonSize.width, etalonSize.height);

            let resizedSize = yield _this.plugin.runInitScript(browserId, _clientFunctions.GET_WINDOW_DIMENSIONS_INFO_SCRIPT);
            let correctionSize = subtractSizes(resizedSize, etalonSize);

            yield _testcafeBrowserTools2.default.resize(title, resizedSize.width, resizedSize.height, etalonSize.width, etalonSize.height);

            resizedSize = yield _this.plugin.runInitScript(browserId, _clientFunctions.GET_WINDOW_DIMENSIONS_INFO_SCRIPT);

            correctionSize = sumSizes(correctionSize, subtractSizes(resizedSize, etalonSize));

            if (_this.localBrowsersInfo[browserId]) _this.localBrowsersInfo[browserId].resizeCorrections = correctionSize;

            yield _testcafeBrowserTools2.default.maximize(title);
        })();
    }

    _calculateMacSizeLimits(browserId) {
        var _this2 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            if (!_this2._isBrowserIdle(browserId)) return;

            const sizeInfo = yield _this2.plugin.runInitScript(browserId, _clientFunctions.GET_WINDOW_DIMENSIONS_INFO_SCRIPT);

            if (_this2.localBrowsersInfo[browserId]) {
                _this2.localBrowsersInfo[browserId].maxScreenSize = {
                    width: sizeInfo.availableWidth - (sizeInfo.outerWidth - sizeInfo.width),
                    height: sizeInfo.availableHeight - (sizeInfo.outerHeight - sizeInfo.height)
                };
            }
        })();
    }

    _ensureBrowserWindowDescriptor(browserId) {
        var _this3 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            if (_this3._getWindowDescriptor(browserId)) return;

            yield _this3._createLocalBrowserInfo(browserId);

            // NOTE: delay to ensure the window finished the opening
            yield _this3.plugin.waitForConnectionReady(browserId);
            yield (0, _delay2.default)(BROWSER_OPENING_DELAY);

            if (_this3.localBrowsersInfo[browserId]) _this3.localBrowsersInfo[browserId].windowDescriptor = yield _testcafeBrowserTools2.default.findWindow(browserId);
        })();
    }

    _ensureBrowserWindowParameters(browserId) {
        var _this4 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            yield _this4._ensureBrowserWindowDescriptor(browserId);

            if (_osFamily2.default.win && !_this4._getResizeCorrections(browserId)) yield _this4._calculateResizeCorrections(browserId);else if (_osFamily2.default.mac && !_this4._getMaxScreenSize(browserId)) yield _this4._calculateMacSizeLimits(browserId);
        })();
    }

    _closeLocalBrowser(browserId) {
        var _this5 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            yield _testcafeBrowserTools2.default.close(_this5._getWindowDescriptor(browserId));
        })();
    }

    _resizeLocalBrowserWindow(browserId, width, height, currentWidth, currentHeight) {
        var _this6 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            const resizeCorrections = _this6._getResizeCorrections(browserId);

            if (resizeCorrections && (yield _testcafeBrowserTools2.default.isMaximized(_this6._getWindowDescriptor(browserId)))) {
                width -= resizeCorrections.width;
                height -= resizeCorrections.height;
            }

            yield _testcafeBrowserTools2.default.resize(_this6._getWindowDescriptor(browserId), currentWidth, currentHeight, width, height);
        })();
    }

    _takeLocalBrowserScreenshot(browserId, screenshotPath) {
        var _this7 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            yield _testcafeBrowserTools2.default.screenshot(_this7._getWindowDescriptor(browserId), screenshotPath);
        })();
    }

    _canResizeLocalBrowserWindowToDimensions(browserId, width, height) {
        var _this8 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            if (!_osFamily2.default.mac) return true;

            const maxScreenSize = _this8._getMaxScreenSize(browserId);

            return width <= maxScreenSize.width && height <= maxScreenSize.height;
        })();
    }

    _maximizeLocalBrowserWindow(browserId) {
        var _this9 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            yield _testcafeBrowserTools2.default.maximize(_this9._getWindowDescriptor(browserId));
        })();
    }

    _canUseDefaultWindowActions(browserId) {
        var _this10 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            const isLocalBrowser = yield _this10.plugin.isLocalBrowser(browserId);
            const isHeadlessBrowser = yield _this10.plugin.isHeadlessBrowser(browserId);

            return isLocalBrowser && !isHeadlessBrowser;
        })();
    }

    init() {
        var _this11 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            const initialized = yield _this11.initPromise;

            if (initialized) return;

            _this11.initPromise = _this11.plugin.init().then(function () {
                return true;
            });

            try {
                yield _this11.initPromise;
            } catch (error) {
                _this11.initPromise = _pinkie2.default.resolve(false);

                throw error;
            }
        })();
    }

    dispose() {
        var _this12 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            const initialized = yield _this12.initPromise;

            if (!initialized) return;

            _this12.initPromise = _this12.plugin.dispose().then(function () {
                return false;
            });

            try {
                yield _this12.initPromise;
            } catch (error) {
                _this12.initPromise = _pinkie2.default.resolve(false);

                throw error;
            }
        })();
    }

    isLocalBrowser(browserId, browserName) {
        var _this13 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            return yield _this13.plugin.isLocalBrowser(browserId, browserName);
        })();
    }

    isHeadlessBrowser(browserId) {
        return this.plugin.isHeadlessBrowser(browserId);
    }

    openBrowser(browserId, pageUrl, browserName) {
        var _this14 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            yield _this14.plugin.openBrowser(browserId, pageUrl, browserName);

            if (yield _this14._canUseDefaultWindowActions(browserId)) yield _this14._ensureBrowserWindowParameters(browserId);
        })();
    }

    closeBrowser(browserId) {
        var _this15 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            const canUseDefaultWindowActions = yield _this15._canUseDefaultWindowActions(browserId);
            const customActionsInfo = yield _this15.hasCustomActionForBrowser(browserId);
            const hasCustomCloseBrowser = customActionsInfo.hasCloseBrowser;
            const usePluginsCloseBrowser = hasCustomCloseBrowser || !canUseDefaultWindowActions;

            if (usePluginsCloseBrowser) yield _this15.plugin.closeBrowser(browserId);else yield _this15._closeLocalBrowser(browserId);

            if (canUseDefaultWindowActions) delete _this15.localBrowsersInfo[browserId];
        })();
    }

    getBrowserList() {
        var _this16 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            return yield _this16.plugin.getBrowserList();
        })();
    }

    isValidBrowserName(browserName) {
        var _this17 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            return yield _this17.plugin.isValidBrowserName(browserName);
        })();
    }

    resizeWindow(browserId, width, height, currentWidth, currentHeight) {
        var _this18 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            const canUseDefaultWindowActions = yield _this18._canUseDefaultWindowActions(browserId);
            const customActionsInfo = yield _this18.hasCustomActionForBrowser(browserId);
            const hasCustomResizeWindow = customActionsInfo.hasResizeWindow;

            if (canUseDefaultWindowActions && !hasCustomResizeWindow) {
                yield _this18._resizeLocalBrowserWindow(browserId, width, height, currentWidth, currentHeight);
                return;
            }

            yield _this18.plugin.resizeWindow(browserId, width, height, currentWidth, currentHeight);
        })();
    }

    canResizeWindowToDimensions(browserId, width, height) {
        var _this19 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            const canUseDefaultWindowActions = yield _this19._canUseDefaultWindowActions(browserId);
            const customActionsInfo = yield _this19.hasCustomActionForBrowser(browserId);
            const hasCustomCanResizeToDimensions = customActionsInfo.hasCanResizeWindowToDimensions;

            if (canUseDefaultWindowActions && !hasCustomCanResizeToDimensions) return yield _this19._canResizeLocalBrowserWindowToDimensions(browserId, width, height);

            return yield _this19.plugin.canResizeWindowToDimensions(browserId, width, height);
        })();
    }

    maximizeWindow(browserId) {
        var _this20 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            const canUseDefaultWindowActions = yield _this20._canUseDefaultWindowActions(browserId);
            const customActionsInfo = yield _this20.hasCustomActionForBrowser(browserId);
            const hasCustomMaximizeWindow = customActionsInfo.hasMaximizeWindow;

            if (canUseDefaultWindowActions && !hasCustomMaximizeWindow) return yield _this20._maximizeLocalBrowserWindow(browserId);

            return yield _this20.plugin.maximizeWindow(browserId);
        })();
    }

    takeScreenshot(browserId, screenshotPath, pageWidth, pageHeight) {
        var _this21 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            const canUseDefaultWindowActions = yield _this21._canUseDefaultWindowActions(browserId);
            const customActionsInfo = yield _this21.hasCustomActionForBrowser(browserId);
            const hasCustomTakeScreenshot = customActionsInfo.hasTakeScreenshot;

            if (canUseDefaultWindowActions && !hasCustomTakeScreenshot) {
                yield _this21._takeLocalBrowserScreenshot(browserId, screenshotPath, pageWidth, pageHeight);
                return;
            }

            yield _this21.plugin.takeScreenshot(browserId, screenshotPath, pageWidth, pageHeight);
        })();
    }

    getVideoFrameData(browserId) {
        var _this22 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            return _this22.plugin.getVideoFrameData(browserId);
        })();
    }

    hasCustomActionForBrowser(browserId) {
        var _this23 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            return _this23.plugin.hasCustomActionForBrowser(browserId);
        })();
    }

    reportJobResult(browserId, status, data) {
        var _this24 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            yield _this24.plugin.reportJobResult(browserId, status, data);
        })();
    }
}
exports.default = BrowserProvider;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9icm93c2VyL3Byb3ZpZGVyL2luZGV4LmpzIl0sIm5hbWVzIjpbIkJST1dTRVJfT1BFTklOR19ERUxBWSIsIlJFU0laRV9ESUZGX1NJWkUiLCJ3aWR0aCIsImhlaWdodCIsInN1bVNpemVzIiwic2l6ZUEiLCJzaXplQiIsInN1YnRyYWN0U2l6ZXMiLCJCcm93c2VyUHJvdmlkZXIiLCJjb25zdHJ1Y3RvciIsInBsdWdpbiIsImluaXRQcm9taXNlIiwicmVzb2x2ZSIsImlzTXVsdGlCcm93c2VyIiwibG9jYWxCcm93c2Vyc0luZm8iLCJfY3JlYXRlTG9jYWxCcm93c2VySW5mbyIsImJyb3dzZXJJZCIsIndpbmRvd0Rlc2NyaXB0b3IiLCJtYXhTY3JlZW5TaXplIiwicmVzaXplQ29ycmVjdGlvbnMiLCJfZ2V0V2luZG93RGVzY3JpcHRvciIsIl9nZXRNYXhTY3JlZW5TaXplIiwiX2dldFJlc2l6ZUNvcnJlY3Rpb25zIiwiX2lzQnJvd3NlcklkbGUiLCJjb25uZWN0aW9uIiwiZ2V0QnlJZCIsImlkbGUiLCJfY2FsY3VsYXRlUmVzaXplQ29ycmVjdGlvbnMiLCJ0aXRsZSIsInJ1bkluaXRTY3JpcHQiLCJpc01heGltaXplZCIsImN1cnJlbnRTaXplIiwiZXRhbG9uU2l6ZSIsInJlc2l6ZSIsInJlc2l6ZWRTaXplIiwiY29ycmVjdGlvblNpemUiLCJtYXhpbWl6ZSIsIl9jYWxjdWxhdGVNYWNTaXplTGltaXRzIiwic2l6ZUluZm8iLCJhdmFpbGFibGVXaWR0aCIsIm91dGVyV2lkdGgiLCJhdmFpbGFibGVIZWlnaHQiLCJvdXRlckhlaWdodCIsIl9lbnN1cmVCcm93c2VyV2luZG93RGVzY3JpcHRvciIsIndhaXRGb3JDb25uZWN0aW9uUmVhZHkiLCJmaW5kV2luZG93IiwiX2Vuc3VyZUJyb3dzZXJXaW5kb3dQYXJhbWV0ZXJzIiwid2luIiwibWFjIiwiX2Nsb3NlTG9jYWxCcm93c2VyIiwiY2xvc2UiLCJfcmVzaXplTG9jYWxCcm93c2VyV2luZG93IiwiY3VycmVudFdpZHRoIiwiY3VycmVudEhlaWdodCIsIl90YWtlTG9jYWxCcm93c2VyU2NyZWVuc2hvdCIsInNjcmVlbnNob3RQYXRoIiwic2NyZWVuc2hvdCIsIl9jYW5SZXNpemVMb2NhbEJyb3dzZXJXaW5kb3dUb0RpbWVuc2lvbnMiLCJfbWF4aW1pemVMb2NhbEJyb3dzZXJXaW5kb3ciLCJfY2FuVXNlRGVmYXVsdFdpbmRvd0FjdGlvbnMiLCJpc0xvY2FsQnJvd3NlciIsImlzSGVhZGxlc3NCcm93c2VyIiwiaW5pdCIsImluaXRpYWxpemVkIiwidGhlbiIsImVycm9yIiwiZGlzcG9zZSIsImJyb3dzZXJOYW1lIiwib3BlbkJyb3dzZXIiLCJwYWdlVXJsIiwiY2xvc2VCcm93c2VyIiwiY2FuVXNlRGVmYXVsdFdpbmRvd0FjdGlvbnMiLCJjdXN0b21BY3Rpb25zSW5mbyIsImhhc0N1c3RvbUFjdGlvbkZvckJyb3dzZXIiLCJoYXNDdXN0b21DbG9zZUJyb3dzZXIiLCJoYXNDbG9zZUJyb3dzZXIiLCJ1c2VQbHVnaW5zQ2xvc2VCcm93c2VyIiwiZ2V0QnJvd3Nlckxpc3QiLCJpc1ZhbGlkQnJvd3Nlck5hbWUiLCJyZXNpemVXaW5kb3ciLCJoYXNDdXN0b21SZXNpemVXaW5kb3ciLCJoYXNSZXNpemVXaW5kb3ciLCJjYW5SZXNpemVXaW5kb3dUb0RpbWVuc2lvbnMiLCJoYXNDdXN0b21DYW5SZXNpemVUb0RpbWVuc2lvbnMiLCJoYXNDYW5SZXNpemVXaW5kb3dUb0RpbWVuc2lvbnMiLCJtYXhpbWl6ZVdpbmRvdyIsImhhc0N1c3RvbU1heGltaXplV2luZG93IiwiaGFzTWF4aW1pemVXaW5kb3ciLCJ0YWtlU2NyZWVuc2hvdCIsInBhZ2VXaWR0aCIsInBhZ2VIZWlnaHQiLCJoYXNDdXN0b21UYWtlU2NyZWVuc2hvdCIsImhhc1Rha2VTY3JlZW5zaG90IiwiZ2V0VmlkZW9GcmFtZURhdGEiLCJyZXBvcnRKb2JSZXN1bHQiLCJzdGF0dXMiLCJkYXRhIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFB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QkFBTCxDQUFpQ3RDLFNBQWpDLEVBQTRDdUMsY0FBNUMsRUFBNERrQyxTQUE1RCxFQUF1RUMsVUFBdkUsQ0FBTjtBQUNBO0FBQ0g7O0FBRUQsa0JBQU0sUUFBS2hGLE1BQUwsQ0FBWThFLGNBQVosQ0FBMkJ4RSxTQUEzQixFQUFzQ3VDLGNBQXRDLEVBQXNEa0MsU0FBdEQsRUFBaUVDLFVBQWpFLENBQU47QUFWb0U7QUFXdkU7O0FBRUtHLHFCQUFOLENBQXlCN0UsU0FBekIsRUFBb0M7QUFBQTs7QUFBQTtBQUNoQyxtQkFBTyxRQUFLTixNQUFMLENBQVltRixpQkFBWixDQUE4QjdFLFNBQTlCLENBQVA7QUFEZ0M7QUFFbkM7O0FBRUt5RCw2QkFBTixDQUFpQ3pELFNBQWpDLEVBQTRDO0FBQUE7O0FBQUE7QUFDeEMsbUJBQU8sUUFBS04sTUFBTCxDQUFZK0QseUJBQVosQ0FBc0N6RCxTQUF0QyxDQUFQO0FBRHdDO0FBRTNDOztBQUVLOEUsbUJBQU4sQ0FBdUI5RSxTQUF2QixFQUFrQytFLE1BQWxDLEVBQTBDQyxJQUExQyxFQUFnRDtBQUFBOztBQUFBO0FBQzVDLGtCQUFNLFFBQUt0RixNQUFMLENBQVlvRixlQUFaLENBQTRCOUUsU0FBNUIsRUFBdUMrRSxNQUF2QyxFQUErQ0MsSUFBL0MsQ0FBTjtBQUQ0QztBQUUvQztBQTdSZ0M7a0JBQWhCeEYsZSIsImZpbGUiOiJicm93c2VyL3Byb3ZpZGVyL2luZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFByb21pc2UgZnJvbSAncGlua2llJztcbmltcG9ydCBicm93c2VyVG9vbHMgZnJvbSAndGVzdGNhZmUtYnJvd3Nlci10b29scyc7XG5pbXBvcnQgT1MgZnJvbSAnb3MtZmFtaWx5JztcbmltcG9ydCBCcm93c2VyQ29ubmVjdGlvbiBmcm9tICcuLi9jb25uZWN0aW9uJztcbmltcG9ydCBkZWxheSBmcm9tICcuLi8uLi91dGlscy9kZWxheSc7XG5pbXBvcnQgeyBHRVRfVElUTEVfU0NSSVBULCBHRVRfV0lORE9XX0RJTUVOU0lPTlNfSU5GT19TQ1JJUFQgfSBmcm9tICcuL3V0aWxzL2NsaWVudC1mdW5jdGlvbnMnO1xuXG5cbmNvbnN0IEJST1dTRVJfT1BFTklOR19ERUxBWSA9IDIwMDA7XG5cbmNvbnN0IFJFU0laRV9ESUZGX1NJWkUgPSB7XG4gICAgd2lkdGg6ICAxMDAsXG4gICAgaGVpZ2h0OiAxMDBcbn07XG5cblxuZnVuY3Rpb24gc3VtU2l6ZXMgKHNpemVBLCBzaXplQikge1xuICAgIHJldHVybiB7XG4gICAgICAgIHdpZHRoOiAgc2l6ZUEud2lkdGggKyBzaXplQi53aWR0aCxcbiAgICAgICAgaGVpZ2h0OiBzaXplQS5oZWlnaHQgKyBzaXplQi5oZWlnaHRcbiAgICB9O1xufVxuXG5mdW5jdGlvbiBzdWJ0cmFjdFNpemVzIChzaXplQSwgc2l6ZUIpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB3aWR0aDogIHNpemVBLndpZHRoIC0gc2l6ZUIud2lkdGgsXG4gICAgICAgIGhlaWdodDogc2l6ZUEuaGVpZ2h0IC0gc2l6ZUIuaGVpZ2h0XG4gICAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQnJvd3NlclByb3ZpZGVyIHtcbiAgICBjb25zdHJ1Y3RvciAocGx1Z2luKSB7XG4gICAgICAgIHRoaXMucGx1Z2luICAgICAgPSBwbHVnaW47XG4gICAgICAgIHRoaXMuaW5pdFByb21pc2UgPSBQcm9taXNlLnJlc29sdmUoZmFsc2UpO1xuXG4gICAgICAgIHRoaXMuaXNNdWx0aUJyb3dzZXIgPSB0aGlzLnBsdWdpbi5pc011bHRpQnJvd3NlcjtcbiAgICAgICAgLy8gSEFDSzogVGhlIGJyb3dzZXIgd2luZG93IGhhcyBkaWZmZXJlbnQgYm9yZGVyIHNpemVzIGluIG5vcm1hbCBhbmQgbWF4aW1pemVkIG1vZGVzLiBTbywgd2UgbmVlZCB0byBiZSBzdXJlIHRoYXQgdGhlIHdpbmRvdyBpc1xuICAgICAgICAvLyBub3QgbWF4aW1pemVkIGJlZm9yZSByZXNpemluZyBpdCBpbiBvcmRlciB0byBrZWVwIHRoZSBtZWNoYW5pc20gb2YgY29ycmVjdGluZyB0aGUgY2xpZW50IGFyZWEgc2l6ZSB3b3JraW5nLiBXaGVuIGJyb3dzZXIgaXMgc3RhcnRlZCxcbiAgICAgICAgLy8gd2UgYXJlIHJlc2l6aW5nIGl0IGZvciB0aGUgZmlyc3QgdGltZSB0byBzd2l0Y2ggdGhlIHdpbmRvdyB0byBub3JtYWwgbW9kZSwgYW5kIGZvciB0aGUgc2Vjb25kIHRpbWUgLSB0byByZXN0b3JlIHRoZSBjbGllbnQgYXJlYSBzaXplLlxuICAgICAgICB0aGlzLmxvY2FsQnJvd3NlcnNJbmZvID0ge307XG4gICAgfVxuXG4gICAgX2NyZWF0ZUxvY2FsQnJvd3NlckluZm8gKGJyb3dzZXJJZCkge1xuICAgICAgICBpZiAodGhpcy5sb2NhbEJyb3dzZXJzSW5mb1ticm93c2VySWRdKVxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMubG9jYWxCcm93c2Vyc0luZm9bYnJvd3NlcklkXSA9IHtcbiAgICAgICAgICAgIHdpbmRvd0Rlc2NyaXB0b3I6ICBudWxsLFxuICAgICAgICAgICAgbWF4U2NyZWVuU2l6ZTogICAgIG51bGwsXG4gICAgICAgICAgICByZXNpemVDb3JyZWN0aW9uczogbnVsbFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIF9nZXRXaW5kb3dEZXNjcmlwdG9yIChicm93c2VySWQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubG9jYWxCcm93c2Vyc0luZm9bYnJvd3NlcklkXSAmJiB0aGlzLmxvY2FsQnJvd3NlcnNJbmZvW2Jyb3dzZXJJZF0ud2luZG93RGVzY3JpcHRvcjtcbiAgICB9XG5cbiAgICBfZ2V0TWF4U2NyZWVuU2l6ZSAoYnJvd3NlcklkKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmxvY2FsQnJvd3NlcnNJbmZvW2Jyb3dzZXJJZF0gJiYgdGhpcy5sb2NhbEJyb3dzZXJzSW5mb1ticm93c2VySWRdLm1heFNjcmVlblNpemU7XG4gICAgfVxuXG4gICAgX2dldFJlc2l6ZUNvcnJlY3Rpb25zIChicm93c2VySWQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubG9jYWxCcm93c2Vyc0luZm9bYnJvd3NlcklkXSAmJiB0aGlzLmxvY2FsQnJvd3NlcnNJbmZvW2Jyb3dzZXJJZF0ucmVzaXplQ29ycmVjdGlvbnM7XG4gICAgfVxuXG4gICAgX2lzQnJvd3NlcklkbGUgKGJyb3dzZXJJZCkge1xuICAgICAgICBjb25zdCBjb25uZWN0aW9uID0gQnJvd3NlckNvbm5lY3Rpb24uZ2V0QnlJZChicm93c2VySWQpO1xuXG4gICAgICAgIHJldHVybiBjb25uZWN0aW9uLmlkbGU7XG4gICAgfVxuXG4gICAgYXN5bmMgX2NhbGN1bGF0ZVJlc2l6ZUNvcnJlY3Rpb25zIChicm93c2VySWQpIHtcbiAgICAgICAgaWYgKCF0aGlzLl9pc0Jyb3dzZXJJZGxlKGJyb3dzZXJJZCkpXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgY29uc3QgdGl0bGUgPSBhd2FpdCB0aGlzLnBsdWdpbi5ydW5Jbml0U2NyaXB0KGJyb3dzZXJJZCwgR0VUX1RJVExFX1NDUklQVCk7XG5cbiAgICAgICAgaWYgKCFhd2FpdCBicm93c2VyVG9vbHMuaXNNYXhpbWl6ZWQodGl0bGUpKVxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IGN1cnJlbnRTaXplID0gYXdhaXQgdGhpcy5wbHVnaW4ucnVuSW5pdFNjcmlwdChicm93c2VySWQsIEdFVF9XSU5ET1dfRElNRU5TSU9OU19JTkZPX1NDUklQVCk7XG4gICAgICAgIGNvbnN0IGV0YWxvblNpemUgID0gc3VidHJhY3RTaXplcyhjdXJyZW50U2l6ZSwgUkVTSVpFX0RJRkZfU0laRSk7XG5cbiAgICAgICAgYXdhaXQgYnJvd3NlclRvb2xzLnJlc2l6ZSh0aXRsZSwgY3VycmVudFNpemUud2lkdGgsIGN1cnJlbnRTaXplLmhlaWdodCwgZXRhbG9uU2l6ZS53aWR0aCwgZXRhbG9uU2l6ZS5oZWlnaHQpO1xuXG4gICAgICAgIGxldCByZXNpemVkU2l6ZSAgICA9IGF3YWl0IHRoaXMucGx1Z2luLnJ1bkluaXRTY3JpcHQoYnJvd3NlcklkLCBHRVRfV0lORE9XX0RJTUVOU0lPTlNfSU5GT19TQ1JJUFQpO1xuICAgICAgICBsZXQgY29ycmVjdGlvblNpemUgPSBzdWJ0cmFjdFNpemVzKHJlc2l6ZWRTaXplLCBldGFsb25TaXplKTtcblxuICAgICAgICBhd2FpdCBicm93c2VyVG9vbHMucmVzaXplKHRpdGxlLCByZXNpemVkU2l6ZS53aWR0aCwgcmVzaXplZFNpemUuaGVpZ2h0LCBldGFsb25TaXplLndpZHRoLCBldGFsb25TaXplLmhlaWdodCk7XG5cbiAgICAgICAgcmVzaXplZFNpemUgPSBhd2FpdCB0aGlzLnBsdWdpbi5ydW5Jbml0U2NyaXB0KGJyb3dzZXJJZCwgR0VUX1dJTkRPV19ESU1FTlNJT05TX0lORk9fU0NSSVBUKTtcblxuICAgICAgICBjb3JyZWN0aW9uU2l6ZSA9IHN1bVNpemVzKGNvcnJlY3Rpb25TaXplLCBzdWJ0cmFjdFNpemVzKHJlc2l6ZWRTaXplLCBldGFsb25TaXplKSk7XG5cbiAgICAgICAgaWYgKHRoaXMubG9jYWxCcm93c2Vyc0luZm9bYnJvd3NlcklkXSlcbiAgICAgICAgICAgIHRoaXMubG9jYWxCcm93c2Vyc0luZm9bYnJvd3NlcklkXS5yZXNpemVDb3JyZWN0aW9ucyA9IGNvcnJlY3Rpb25TaXplO1xuXG4gICAgICAgIGF3YWl0IGJyb3dzZXJUb29scy5tYXhpbWl6ZSh0aXRsZSk7XG4gICAgfVxuXG5cbiAgICBhc3luYyBfY2FsY3VsYXRlTWFjU2l6ZUxpbWl0cyAoYnJvd3NlcklkKSB7XG4gICAgICAgIGlmICghdGhpcy5faXNCcm93c2VySWRsZShicm93c2VySWQpKVxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IHNpemVJbmZvID0gYXdhaXQgdGhpcy5wbHVnaW4ucnVuSW5pdFNjcmlwdChicm93c2VySWQsIEdFVF9XSU5ET1dfRElNRU5TSU9OU19JTkZPX1NDUklQVCk7XG5cbiAgICAgICAgaWYgKHRoaXMubG9jYWxCcm93c2Vyc0luZm9bYnJvd3NlcklkXSkge1xuICAgICAgICAgICAgdGhpcy5sb2NhbEJyb3dzZXJzSW5mb1ticm93c2VySWRdLm1heFNjcmVlblNpemUgPSB7XG4gICAgICAgICAgICAgICAgd2lkdGg6ICBzaXplSW5mby5hdmFpbGFibGVXaWR0aCAtIChzaXplSW5mby5vdXRlcldpZHRoIC0gc2l6ZUluZm8ud2lkdGgpLFxuICAgICAgICAgICAgICAgIGhlaWdodDogc2l6ZUluZm8uYXZhaWxhYmxlSGVpZ2h0IC0gKHNpemVJbmZvLm91dGVySGVpZ2h0IC0gc2l6ZUluZm8uaGVpZ2h0KVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFzeW5jIF9lbnN1cmVCcm93c2VyV2luZG93RGVzY3JpcHRvciAoYnJvd3NlcklkKSB7XG4gICAgICAgIGlmICh0aGlzLl9nZXRXaW5kb3dEZXNjcmlwdG9yKGJyb3dzZXJJZCkpXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgYXdhaXQgdGhpcy5fY3JlYXRlTG9jYWxCcm93c2VySW5mbyhicm93c2VySWQpO1xuXG4gICAgICAgIC8vIE5PVEU6IGRlbGF5IHRvIGVuc3VyZSB0aGUgd2luZG93IGZpbmlzaGVkIHRoZSBvcGVuaW5nXG4gICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLndhaXRGb3JDb25uZWN0aW9uUmVhZHkoYnJvd3NlcklkKTtcbiAgICAgICAgYXdhaXQgZGVsYXkoQlJPV1NFUl9PUEVOSU5HX0RFTEFZKTtcblxuICAgICAgICBpZiAodGhpcy5sb2NhbEJyb3dzZXJzSW5mb1ticm93c2VySWRdKVxuICAgICAgICAgICAgdGhpcy5sb2NhbEJyb3dzZXJzSW5mb1ticm93c2VySWRdLndpbmRvd0Rlc2NyaXB0b3IgPSBhd2FpdCBicm93c2VyVG9vbHMuZmluZFdpbmRvdyhicm93c2VySWQpO1xuICAgIH1cblxuICAgIGFzeW5jIF9lbnN1cmVCcm93c2VyV2luZG93UGFyYW1ldGVycyAoYnJvd3NlcklkKSB7XG4gICAgICAgIGF3YWl0IHRoaXMuX2Vuc3VyZUJyb3dzZXJXaW5kb3dEZXNjcmlwdG9yKGJyb3dzZXJJZCk7XG5cbiAgICAgICAgaWYgKE9TLndpbiAmJiAhdGhpcy5fZ2V0UmVzaXplQ29ycmVjdGlvbnMoYnJvd3NlcklkKSlcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuX2NhbGN1bGF0ZVJlc2l6ZUNvcnJlY3Rpb25zKGJyb3dzZXJJZCk7XG4gICAgICAgIGVsc2UgaWYgKE9TLm1hYyAmJiAhdGhpcy5fZ2V0TWF4U2NyZWVuU2l6ZShicm93c2VySWQpKVxuICAgICAgICAgICAgYXdhaXQgdGhpcy5fY2FsY3VsYXRlTWFjU2l6ZUxpbWl0cyhicm93c2VySWQpO1xuICAgIH1cblxuICAgIGFzeW5jIF9jbG9zZUxvY2FsQnJvd3NlciAoYnJvd3NlcklkKSB7XG4gICAgICAgIGF3YWl0IGJyb3dzZXJUb29scy5jbG9zZSh0aGlzLl9nZXRXaW5kb3dEZXNjcmlwdG9yKGJyb3dzZXJJZCkpO1xuICAgIH1cblxuICAgIGFzeW5jIF9yZXNpemVMb2NhbEJyb3dzZXJXaW5kb3cgKGJyb3dzZXJJZCwgd2lkdGgsIGhlaWdodCwgY3VycmVudFdpZHRoLCBjdXJyZW50SGVpZ2h0KSB7XG4gICAgICAgIGNvbnN0IHJlc2l6ZUNvcnJlY3Rpb25zID0gdGhpcy5fZ2V0UmVzaXplQ29ycmVjdGlvbnMoYnJvd3NlcklkKTtcblxuICAgICAgICBpZiAocmVzaXplQ29ycmVjdGlvbnMgJiYgYXdhaXQgYnJvd3NlclRvb2xzLmlzTWF4aW1pemVkKHRoaXMuX2dldFdpbmRvd0Rlc2NyaXB0b3IoYnJvd3NlcklkKSkpIHtcbiAgICAgICAgICAgIHdpZHRoIC09IHJlc2l6ZUNvcnJlY3Rpb25zLndpZHRoO1xuICAgICAgICAgICAgaGVpZ2h0IC09IHJlc2l6ZUNvcnJlY3Rpb25zLmhlaWdodDtcbiAgICAgICAgfVxuXG4gICAgICAgIGF3YWl0IGJyb3dzZXJUb29scy5yZXNpemUodGhpcy5fZ2V0V2luZG93RGVzY3JpcHRvcihicm93c2VySWQpLCBjdXJyZW50V2lkdGgsIGN1cnJlbnRIZWlnaHQsIHdpZHRoLCBoZWlnaHQpO1xuICAgIH1cblxuICAgIGFzeW5jIF90YWtlTG9jYWxCcm93c2VyU2NyZWVuc2hvdCAoYnJvd3NlcklkLCBzY3JlZW5zaG90UGF0aCkge1xuICAgICAgICBhd2FpdCBicm93c2VyVG9vbHMuc2NyZWVuc2hvdCh0aGlzLl9nZXRXaW5kb3dEZXNjcmlwdG9yKGJyb3dzZXJJZCksIHNjcmVlbnNob3RQYXRoKTtcbiAgICB9XG5cbiAgICBhc3luYyBfY2FuUmVzaXplTG9jYWxCcm93c2VyV2luZG93VG9EaW1lbnNpb25zIChicm93c2VySWQsIHdpZHRoLCBoZWlnaHQpIHtcbiAgICAgICAgaWYgKCFPUy5tYWMpXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcblxuICAgICAgICBjb25zdCBtYXhTY3JlZW5TaXplID0gdGhpcy5fZ2V0TWF4U2NyZWVuU2l6ZShicm93c2VySWQpO1xuXG4gICAgICAgIHJldHVybiB3aWR0aCA8PSBtYXhTY3JlZW5TaXplLndpZHRoICYmIGhlaWdodCA8PSBtYXhTY3JlZW5TaXplLmhlaWdodDtcbiAgICB9XG5cbiAgICBhc3luYyBfbWF4aW1pemVMb2NhbEJyb3dzZXJXaW5kb3cgKGJyb3dzZXJJZCkge1xuICAgICAgICBhd2FpdCBicm93c2VyVG9vbHMubWF4aW1pemUodGhpcy5fZ2V0V2luZG93RGVzY3JpcHRvcihicm93c2VySWQpKTtcbiAgICB9XG5cbiAgICBhc3luYyBfY2FuVXNlRGVmYXVsdFdpbmRvd0FjdGlvbnMgKGJyb3dzZXJJZCkge1xuICAgICAgICBjb25zdCBpc0xvY2FsQnJvd3NlciAgICA9IGF3YWl0IHRoaXMucGx1Z2luLmlzTG9jYWxCcm93c2VyKGJyb3dzZXJJZCk7XG4gICAgICAgIGNvbnN0IGlzSGVhZGxlc3NCcm93c2VyID0gYXdhaXQgdGhpcy5wbHVnaW4uaXNIZWFkbGVzc0Jyb3dzZXIoYnJvd3NlcklkKTtcblxuICAgICAgICByZXR1cm4gaXNMb2NhbEJyb3dzZXIgJiYgIWlzSGVhZGxlc3NCcm93c2VyO1xuICAgIH1cblxuICAgIGFzeW5jIGluaXQgKCkge1xuICAgICAgICBjb25zdCBpbml0aWFsaXplZCA9IGF3YWl0IHRoaXMuaW5pdFByb21pc2U7XG5cbiAgICAgICAgaWYgKGluaXRpYWxpemVkKVxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMuaW5pdFByb21pc2UgPSB0aGlzLnBsdWdpblxuICAgICAgICAgICAgLmluaXQoKVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4gdHJ1ZSk7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuaW5pdFByb21pc2U7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICB0aGlzLmluaXRQcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKGZhbHNlKTtcblxuICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhc3luYyBkaXNwb3NlICgpIHtcbiAgICAgICAgY29uc3QgaW5pdGlhbGl6ZWQgPSBhd2FpdCB0aGlzLmluaXRQcm9taXNlO1xuXG4gICAgICAgIGlmICghaW5pdGlhbGl6ZWQpXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgdGhpcy5pbml0UHJvbWlzZSA9IHRoaXMucGx1Z2luXG4gICAgICAgICAgICAuZGlzcG9zZSgpXG4gICAgICAgICAgICAudGhlbigoKSA9PiBmYWxzZSk7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuaW5pdFByb21pc2U7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICB0aGlzLmluaXRQcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKGZhbHNlKTtcblxuICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhc3luYyBpc0xvY2FsQnJvd3NlciAoYnJvd3NlcklkLCBicm93c2VyTmFtZSkge1xuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5wbHVnaW4uaXNMb2NhbEJyb3dzZXIoYnJvd3NlcklkLCBicm93c2VyTmFtZSk7XG4gICAgfVxuXG4gICAgaXNIZWFkbGVzc0Jyb3dzZXIgKGJyb3dzZXJJZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wbHVnaW4uaXNIZWFkbGVzc0Jyb3dzZXIoYnJvd3NlcklkKTtcbiAgICB9XG5cbiAgICBhc3luYyBvcGVuQnJvd3NlciAoYnJvd3NlcklkLCBwYWdlVXJsLCBicm93c2VyTmFtZSkge1xuICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5vcGVuQnJvd3Nlcihicm93c2VySWQsIHBhZ2VVcmwsIGJyb3dzZXJOYW1lKTtcblxuICAgICAgICBpZiAoYXdhaXQgdGhpcy5fY2FuVXNlRGVmYXVsdFdpbmRvd0FjdGlvbnMoYnJvd3NlcklkKSlcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuX2Vuc3VyZUJyb3dzZXJXaW5kb3dQYXJhbWV0ZXJzKGJyb3dzZXJJZCk7XG4gICAgfVxuXG4gICAgYXN5bmMgY2xvc2VCcm93c2VyIChicm93c2VySWQpIHtcbiAgICAgICAgY29uc3QgY2FuVXNlRGVmYXVsdFdpbmRvd0FjdGlvbnMgPSBhd2FpdCB0aGlzLl9jYW5Vc2VEZWZhdWx0V2luZG93QWN0aW9ucyhicm93c2VySWQpO1xuICAgICAgICBjb25zdCBjdXN0b21BY3Rpb25zSW5mbyAgICAgICAgICA9IGF3YWl0IHRoaXMuaGFzQ3VzdG9tQWN0aW9uRm9yQnJvd3Nlcihicm93c2VySWQpO1xuICAgICAgICBjb25zdCBoYXNDdXN0b21DbG9zZUJyb3dzZXIgICAgICA9IGN1c3RvbUFjdGlvbnNJbmZvLmhhc0Nsb3NlQnJvd3NlcjtcbiAgICAgICAgY29uc3QgdXNlUGx1Z2luc0Nsb3NlQnJvd3NlciAgICAgPSBoYXNDdXN0b21DbG9zZUJyb3dzZXIgfHwgIWNhblVzZURlZmF1bHRXaW5kb3dBY3Rpb25zO1xuXG4gICAgICAgIGlmICh1c2VQbHVnaW5zQ2xvc2VCcm93c2VyKVxuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uY2xvc2VCcm93c2VyKGJyb3dzZXJJZCk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuX2Nsb3NlTG9jYWxCcm93c2VyKGJyb3dzZXJJZCk7XG5cbiAgICAgICAgaWYgKGNhblVzZURlZmF1bHRXaW5kb3dBY3Rpb25zKVxuICAgICAgICAgICAgZGVsZXRlIHRoaXMubG9jYWxCcm93c2Vyc0luZm9bYnJvd3NlcklkXTtcbiAgICB9XG5cbiAgICBhc3luYyBnZXRCcm93c2VyTGlzdCAoKSB7XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnBsdWdpbi5nZXRCcm93c2VyTGlzdCgpO1xuICAgIH1cblxuICAgIGFzeW5jIGlzVmFsaWRCcm93c2VyTmFtZSAoYnJvd3Nlck5hbWUpIHtcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMucGx1Z2luLmlzVmFsaWRCcm93c2VyTmFtZShicm93c2VyTmFtZSk7XG4gICAgfVxuXG4gICAgYXN5bmMgcmVzaXplV2luZG93IChicm93c2VySWQsIHdpZHRoLCBoZWlnaHQsIGN1cnJlbnRXaWR0aCwgY3VycmVudEhlaWdodCkge1xuICAgICAgICBjb25zdCBjYW5Vc2VEZWZhdWx0V2luZG93QWN0aW9ucyA9IGF3YWl0IHRoaXMuX2NhblVzZURlZmF1bHRXaW5kb3dBY3Rpb25zKGJyb3dzZXJJZCk7XG4gICAgICAgIGNvbnN0IGN1c3RvbUFjdGlvbnNJbmZvICAgICAgICAgID0gYXdhaXQgdGhpcy5oYXNDdXN0b21BY3Rpb25Gb3JCcm93c2VyKGJyb3dzZXJJZCk7XG4gICAgICAgIGNvbnN0IGhhc0N1c3RvbVJlc2l6ZVdpbmRvdyAgICAgID0gY3VzdG9tQWN0aW9uc0luZm8uaGFzUmVzaXplV2luZG93O1xuXG5cbiAgICAgICAgaWYgKGNhblVzZURlZmF1bHRXaW5kb3dBY3Rpb25zICYmICFoYXNDdXN0b21SZXNpemVXaW5kb3cpIHtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuX3Jlc2l6ZUxvY2FsQnJvd3NlcldpbmRvdyhicm93c2VySWQsIHdpZHRoLCBoZWlnaHQsIGN1cnJlbnRXaWR0aCwgY3VycmVudEhlaWdodCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5yZXNpemVXaW5kb3coYnJvd3NlcklkLCB3aWR0aCwgaGVpZ2h0LCBjdXJyZW50V2lkdGgsIGN1cnJlbnRIZWlnaHQpO1xuICAgIH1cblxuICAgIGFzeW5jIGNhblJlc2l6ZVdpbmRvd1RvRGltZW5zaW9ucyAoYnJvd3NlcklkLCB3aWR0aCwgaGVpZ2h0KSB7XG4gICAgICAgIGNvbnN0IGNhblVzZURlZmF1bHRXaW5kb3dBY3Rpb25zICAgICA9IGF3YWl0IHRoaXMuX2NhblVzZURlZmF1bHRXaW5kb3dBY3Rpb25zKGJyb3dzZXJJZCk7XG4gICAgICAgIGNvbnN0IGN1c3RvbUFjdGlvbnNJbmZvICAgICAgICAgICAgICA9IGF3YWl0IHRoaXMuaGFzQ3VzdG9tQWN0aW9uRm9yQnJvd3Nlcihicm93c2VySWQpO1xuICAgICAgICBjb25zdCBoYXNDdXN0b21DYW5SZXNpemVUb0RpbWVuc2lvbnMgPSBjdXN0b21BY3Rpb25zSW5mby5oYXNDYW5SZXNpemVXaW5kb3dUb0RpbWVuc2lvbnM7XG5cblxuICAgICAgICBpZiAoY2FuVXNlRGVmYXVsdFdpbmRvd0FjdGlvbnMgJiYgIWhhc0N1c3RvbUNhblJlc2l6ZVRvRGltZW5zaW9ucylcbiAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLl9jYW5SZXNpemVMb2NhbEJyb3dzZXJXaW5kb3dUb0RpbWVuc2lvbnMoYnJvd3NlcklkLCB3aWR0aCwgaGVpZ2h0KTtcblxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5wbHVnaW4uY2FuUmVzaXplV2luZG93VG9EaW1lbnNpb25zKGJyb3dzZXJJZCwgd2lkdGgsIGhlaWdodCk7XG4gICAgfVxuXG4gICAgYXN5bmMgbWF4aW1pemVXaW5kb3cgKGJyb3dzZXJJZCkge1xuICAgICAgICBjb25zdCBjYW5Vc2VEZWZhdWx0V2luZG93QWN0aW9ucyA9IGF3YWl0IHRoaXMuX2NhblVzZURlZmF1bHRXaW5kb3dBY3Rpb25zKGJyb3dzZXJJZCk7XG4gICAgICAgIGNvbnN0IGN1c3RvbUFjdGlvbnNJbmZvICAgICAgICAgID0gYXdhaXQgdGhpcy5oYXNDdXN0b21BY3Rpb25Gb3JCcm93c2VyKGJyb3dzZXJJZCk7XG4gICAgICAgIGNvbnN0IGhhc0N1c3RvbU1heGltaXplV2luZG93ICAgID0gY3VzdG9tQWN0aW9uc0luZm8uaGFzTWF4aW1pemVXaW5kb3c7XG5cbiAgICAgICAgaWYgKGNhblVzZURlZmF1bHRXaW5kb3dBY3Rpb25zICYmICFoYXNDdXN0b21NYXhpbWl6ZVdpbmRvdylcbiAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLl9tYXhpbWl6ZUxvY2FsQnJvd3NlcldpbmRvdyhicm93c2VySWQpO1xuXG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnBsdWdpbi5tYXhpbWl6ZVdpbmRvdyhicm93c2VySWQpO1xuICAgIH1cblxuICAgIGFzeW5jIHRha2VTY3JlZW5zaG90IChicm93c2VySWQsIHNjcmVlbnNob3RQYXRoLCBwYWdlV2lkdGgsIHBhZ2VIZWlnaHQpIHtcbiAgICAgICAgY29uc3QgY2FuVXNlRGVmYXVsdFdpbmRvd0FjdGlvbnMgPSBhd2FpdCB0aGlzLl9jYW5Vc2VEZWZhdWx0V2luZG93QWN0aW9ucyhicm93c2VySWQpO1xuICAgICAgICBjb25zdCBjdXN0b21BY3Rpb25zSW5mbyAgICAgICAgICA9IGF3YWl0IHRoaXMuaGFzQ3VzdG9tQWN0aW9uRm9yQnJvd3Nlcihicm93c2VySWQpO1xuICAgICAgICBjb25zdCBoYXNDdXN0b21UYWtlU2NyZWVuc2hvdCAgICA9IGN1c3RvbUFjdGlvbnNJbmZvLmhhc1Rha2VTY3JlZW5zaG90O1xuXG4gICAgICAgIGlmIChjYW5Vc2VEZWZhdWx0V2luZG93QWN0aW9ucyAmJiAhaGFzQ3VzdG9tVGFrZVNjcmVlbnNob3QpIHtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuX3Rha2VMb2NhbEJyb3dzZXJTY3JlZW5zaG90KGJyb3dzZXJJZCwgc2NyZWVuc2hvdFBhdGgsIHBhZ2VXaWR0aCwgcGFnZUhlaWdodCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi50YWtlU2NyZWVuc2hvdChicm93c2VySWQsIHNjcmVlbnNob3RQYXRoLCBwYWdlV2lkdGgsIHBhZ2VIZWlnaHQpO1xuICAgIH1cblxuICAgIGFzeW5jIGdldFZpZGVvRnJhbWVEYXRhIChicm93c2VySWQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGx1Z2luLmdldFZpZGVvRnJhbWVEYXRhKGJyb3dzZXJJZCk7XG4gICAgfVxuXG4gICAgYXN5bmMgaGFzQ3VzdG9tQWN0aW9uRm9yQnJvd3NlciAoYnJvd3NlcklkKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBsdWdpbi5oYXNDdXN0b21BY3Rpb25Gb3JCcm93c2VyKGJyb3dzZXJJZCk7XG4gICAgfVxuXG4gICAgYXN5bmMgcmVwb3J0Sm9iUmVzdWx0IChicm93c2VySWQsIHN0YXR1cywgZGF0YSkge1xuICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5yZXBvcnRKb2JSZXN1bHQoYnJvd3NlcklkLCBzdGF0dXMsIGRhdGEpO1xuICAgIH1cbn1cbiJdfQ==
