'use strict';

exports.__esModule = true;

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _symbol = require('babel-runtime/core-js/symbol');

var _symbol2 = _interopRequireDefault(_symbol);

var _pinkie = require('pinkie');

var _pinkie2 = _interopRequireDefault(_pinkie);

var _lodash = require('lodash');

var _promisifyEvent = require('promisify-event');

var _promisifyEvent2 = _interopRequireDefault(_promisifyEvent);

var _browserJobResult = require('../../runner/browser-job-result');

var _browserJobResult2 = _interopRequireDefault(_browserJobResult);

var _connection = require('../connection');

var _connection2 = _interopRequireDefault(_connection);

var _warningMessage = require('../../notifications/warning-message');

var _warningMessage2 = _interopRequireDefault(_warningMessage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* global Symbol */
const name = (0, _symbol2.default)();

class BrowserProviderPluginHost {
    constructor(providerObject, providerName) {
        this.JOB_RESULT = (0, _lodash.assignIn)({}, _browserJobResult2.default);

        (0, _lodash.assignIn)(this, providerObject);

        this[name] = providerName;
    }

    // Helpers
    get providerName() {
        return this[name];
    }

    runInitScript(browserId, code) {
        const connection = _connection2.default.getById(browserId);

        return connection.runInitScript(`(${code})()`);
    }

    waitForConnectionReady(browserId) {
        const connection = _connection2.default.getById(browserId);

        if (connection.ready) return _pinkie2.default.resolve();

        return (0, _promisifyEvent2.default)(connection, 'ready');
    }

    reportWarning(browserId, ...args) {
        const connection = _connection2.default.getById(browserId);

        connection.addWarning(...args);
    }

    setUserAgentMetaInfo(browserId, message) {
        const connection = _connection2.default.getById(browserId);

        connection.setProviderMetaInfo(message);
    }

    closeLocalBrowser(browserId) {
        return (0, _asyncToGenerator3.default)(function* () {
            const connection = _connection2.default.getById(browserId);

            yield connection.provider._ensureBrowserWindowDescriptor(browserId);
            yield connection.provider._closeLocalBrowser(browserId);
        })();
    }

    resizeLocalBrowserWindow(browserId, width, height, currentWidth, currentHeight) {
        return (0, _asyncToGenerator3.default)(function* () {
            const connection = _connection2.default.getById(browserId);

            yield connection.provider._ensureBrowserWindowParameters(browserId);
            yield connection.provider._resizeLocalBrowserWindow(browserId, width, height, currentWidth, currentHeight);
        })();
    }

    // API
    // Browser control
    openBrowser() /* browserId, pageUrl, browserName */{
        return (0, _asyncToGenerator3.default)(function* () {
            throw new Error('Not implemented!');
        })();
    }

    closeBrowser() /* browserId */{
        return (0, _asyncToGenerator3.default)(function* () {
            throw new Error('Not implemented!');
        })();
    }

    // Initialization
    init() {
        return (0, _asyncToGenerator3.default)(function* () {
            return;
        })();
    }

    dispose() {
        return (0, _asyncToGenerator3.default)(function* () {
            return;
        })();
    }

    // Browser names handling
    getBrowserList() {
        return (0, _asyncToGenerator3.default)(function* () {
            throw new Error('Not implemented!');
        })();
    }

    isValidBrowserName() /* browserName */{
        return (0, _asyncToGenerator3.default)(function* () {
            return true;
        })();
    }

    // Extra functions
    // NOTE: The browserName argument is optional, and must be supplied if the browserId argument is not valid (browser is not opened)
    isLocalBrowser() /* browserId[, browserName] */{
        return (0, _asyncToGenerator3.default)(function* () {
            return false;
        })();
    }

    isHeadlessBrowser() /* browserId */{
        return false;
    }

    hasCustomActionForBrowser() /* browserId */{
        var _this = this;

        return (0, _asyncToGenerator3.default)(function* () {
            return {
                hasCloseBrowser: _this.hasOwnProperty('closeBrowser'),
                hasResizeWindow: _this.hasOwnProperty('resizeWindow'),
                hasTakeScreenshot: _this.hasOwnProperty('takeScreenshot'),
                hasGetVideoFrameData: _this.hasOwnProperty('getVideoFrameData'),
                hasCanResizeWindowToDimensions: _this.hasOwnProperty('canResizeWindowToDimensions'),
                hasMaximizeWindow: _this.hasOwnProperty('maximizeWindow'),
                hasChromelessScreenshots: false
            };
        })();
    }

    resizeWindow(browserId /*, width, height, currentWidth, currentHeight */) {
        var _this2 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            _this2.reportWarning(browserId, _warningMessage2.default.resizeNotSupportedByBrowserProvider, _this2[name]);
        })();
    }

    canResizeWindowToDimensions() /* browserId, width, height */{
        return (0, _asyncToGenerator3.default)(function* () {
            return true;
        })();
    }

    takeScreenshot(browserId /*, screenshotPath, pageWidth, pageHeight */) {
        var _this3 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            _this3.reportWarning(browserId, _warningMessage2.default.screenshotNotSupportedByBrowserProvider, _this3[name]);
        })();
    }

    maximizeWindow(browserId) {
        var _this4 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            _this4.reportWarning(browserId, _warningMessage2.default.maximizeNotSupportedByBrowserProvider, _this4[name]);
        })();
    }

    getVideoFrameData(browserId) {
        var _this5 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            const browserAlias = _connection2.default.getById(browserId).browserInfo.alias;

            _this5.reportWarning(browserId, _warningMessage2.default.videoNotSupportedByBrowser, browserAlias);
        })();
    }

    reportJobResult() /*browserId, status, data*/{
        return (0, _asyncToGenerator3.default)(function* () {
            return;
        })();
    }
}
exports.default = BrowserProviderPluginHost;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9icm93c2VyL3Byb3ZpZGVyL3BsdWdpbi1ob3N0LmpzIl0sIm5hbWVzIjpbIm5hbWUiLCJCcm93c2VyUHJvdmlkZXJQbHVnaW5Ib3N0IiwiY29uc3RydWN0b3IiLCJwcm92aWRlck9iamVjdCIsInByb3ZpZGVyTmFtZSIsIkpPQl9SRVNVTFQiLCJydW5Jbml0U2NyaXB0IiwiYnJvd3NlcklkIiwiY29kZSIsImNvbm5lY3Rpb24iLCJnZXRCeUlkIiwid2FpdEZvckNvbm5lY3Rpb25SZWFkeSIsInJlYWR5IiwicmVzb2x2ZSIsInJlcG9ydFdhcm5pbmciLCJhcmdzIiwiYWRkV2FybmluZyIsInNldFVzZXJBZ2VudE1ldGFJbmZvIiwibWVzc2FnZSIsInNldFByb3ZpZGVyTWV0YUluZm8iLCJjbG9zZUxvY2FsQnJvd3NlciIsInByb3ZpZGVyIiwiX2Vuc3VyZUJyb3dzZXJXaW5kb3dEZXNjcmlwdG9yIiwiX2Nsb3NlTG9jYWxCcm93c2VyIiwicmVzaXplTG9jYWxCcm93c2VyV2luZG93Iiwid2lkdGgiLCJoZWlnaHQiLCJjdXJyZW50V2lkdGgiLCJjdXJyZW50SGVpZ2h0IiwiX2Vuc3VyZUJyb3dzZXJXaW5kb3dQYXJhbWV0ZXJzIiwiX3Jlc2l6ZUxvY2FsQnJvd3NlcldpbmRvdyIsIm9wZW5Ccm93c2VyIiwiRXJyb3IiLCJjbG9zZUJyb3dzZXIiLCJpbml0IiwiZGlzcG9zZSIsImdldEJyb3dzZXJMaXN0IiwiaXNWYWxpZEJyb3dzZXJOYW1lIiwiaXNMb2NhbEJyb3dzZXIiLCJpc0hlYWRsZXNzQnJvd3NlciIsImhhc0N1c3RvbUFjdGlvbkZvckJyb3dzZXIiLCJoYXNDbG9zZUJyb3dzZXIiLCJoYXNPd25Qcm9wZXJ0eSIsImhhc1Jlc2l6ZVdpbmRvdyIsImhhc1Rha2VTY3JlZW5zaG90IiwiaGFzR2V0VmlkZW9GcmFtZURhdGEiLCJoYXNDYW5SZXNpemVXaW5kb3dUb0RpbWVuc2lvbnMiLCJoYXNNYXhpbWl6ZVdpbmRvdyIsImhhc0Nocm9tZWxlc3NTY3JlZW5zaG90cyIsInJlc2l6ZVdpbmRvdyIsInJlc2l6ZU5vdFN1cHBvcnRlZEJ5QnJvd3NlclByb3ZpZGVyIiwiY2FuUmVzaXplV2luZG93VG9EaW1lbnNpb25zIiwidGFrZVNjcmVlbnNob3QiLCJzY3JlZW5zaG90Tm90U3VwcG9ydGVkQnlCcm93c2VyUHJvdmlkZXIiLCJtYXhpbWl6ZVdpbmRvdyIsIm1heGltaXplTm90U3VwcG9ydGVkQnlCcm93c2VyUHJvdmlkZXIiLCJnZXRWaWRlb0ZyYW1lRGF0YSIsImJyb3dzZXJBbGlhcyIsImJyb3dzZXJJbmZvIiwiYWxpYXMiLCJ2aWRlb05vdFN1cHBvcnRlZEJ5QnJvd3NlciIsInJlcG9ydEpvYlJlc3VsdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7O0FBTkE7QUFTQSxNQUFNQSxPQUFPLHVCQUFiOztBQUVlLE1BQU1DLHlCQUFOLENBQWdDO0FBQzNDQyxnQkFBYUMsY0FBYixFQUE2QkMsWUFBN0IsRUFBMkM7QUFDdkMsYUFBS0MsVUFBTCxHQUFrQixzQkFBUyxFQUFULDZCQUFsQjs7QUFFQSw4QkFBUyxJQUFULEVBQWVGLGNBQWY7O0FBRUEsYUFBS0gsSUFBTCxJQUFhSSxZQUFiO0FBQ0g7O0FBR0Q7QUFDQSxRQUFJQSxZQUFKLEdBQW9CO0FBQ2hCLGVBQU8sS0FBS0osSUFBTCxDQUFQO0FBQ0g7O0FBRURNLGtCQUFlQyxTQUFmLEVBQTBCQyxJQUExQixFQUFnQztBQUM1QixjQUFNQyxhQUFhLHFCQUFrQkMsT0FBbEIsQ0FBMEJILFNBQTFCLENBQW5COztBQUVBLGVBQU9FLFdBQVdILGFBQVgsQ0FBMEIsSUFBR0UsSUFBSyxLQUFsQyxDQUFQO0FBQ0g7O0FBRURHLDJCQUF3QkosU0FBeEIsRUFBbUM7QUFDL0IsY0FBTUUsYUFBYSxxQkFBa0JDLE9BQWxCLENBQTBCSCxTQUExQixDQUFuQjs7QUFFQSxZQUFJRSxXQUFXRyxLQUFmLEVBQ0ksT0FB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QkFBZ0IyQyxtQ0FBOUMsRUFBbUYsT0FBS2xELElBQUwsQ0FBbkY7QUFENEU7QUFFL0U7O0FBRUttRCwrQkFBTixHQUFtQyw4QkFBZ0M7QUFBQTtBQUMvRCxtQkFBTyxJQUFQO0FBRCtEO0FBRWxFOztBQUVLQyxrQkFBTixDQUFzQjdDLFNBQXRCLENBQStCLDRDQUEvQixFQUE2RTtBQUFBOztBQUFBO0FBQ3pFLG1CQUFLTyxhQUFMLENBQW1CUCxTQUFuQixFQUE4Qix5QkFBZ0I4Qyx1Q0FBOUMsRUFBdUYsT0FBS3JELElBQUwsQ0FBdkY7QUFEeUU7QUFFNUU7O0FBRUtzRCxrQkFBTixDQUFzQi9DLFNBQXRCLEVBQWlDO0FBQUE7O0FBQUE7QUFDN0IsbUJBQUtPLGFBQUwsQ0FBbUJQLFNBQW5CLEVBQThCLHlCQUFnQmdELHFDQUE5QyxFQUFxRixPQUFLdkQsSUFBTCxDQUFyRjtBQUQ2QjtBQUVoQzs7QUFFS3dELHFCQUFOLENBQXlCakQsU0FBekIsRUFBb0M7QUFBQTs7QUFBQTtBQUNoQyxrQkFBTWtELGVBQWUscUJBQWtCL0MsT0FBbEIsQ0FBMEJILFNBQTFCLEVBQXFDbUQsV0FBckMsQ0FBaURDLEtBQXRFOztBQUVBLG1CQUFLN0MsYUFBTCxDQUFtQlAsU0FBbkIsRUFBOEIseUJBQWdCcUQsMEJBQTlDLEVBQTBFSCxZQUExRTtBQUhnQztBQUluQzs7QUFFS0ksbUJBQU4sR0FBdUIsMkJBQTZCO0FBQUE7QUFDaEQ7QUFEZ0Q7QUFFbkQ7QUFuSTBDO2tCQUExQjVELHlCIiwiZmlsZSI6ImJyb3dzZXIvcHJvdmlkZXIvcGx1Z2luLWhvc3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBnbG9iYWwgU3ltYm9sICovXG5pbXBvcnQgUHJvbWlzZSBmcm9tICdwaW5raWUnO1xuaW1wb3J0IHsgYXNzaWduSW4gfSBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IHByb21pc2lmeUV2ZW50IGZyb20gJ3Byb21pc2lmeS1ldmVudCc7XG5pbXBvcnQgQlJPV1NFUl9KT0JfUkVTVUxUIGZyb20gJy4uLy4uL3J1bm5lci9icm93c2VyLWpvYi1yZXN1bHQnO1xuaW1wb3J0IEJyb3dzZXJDb25uZWN0aW9uIGZyb20gJy4uL2Nvbm5lY3Rpb24nO1xuaW1wb3J0IFdBUk5JTkdfTUVTU0FHRSBmcm9tICcuLi8uLi9ub3RpZmljYXRpb25zL3dhcm5pbmctbWVzc2FnZSc7XG5cblxuY29uc3QgbmFtZSA9IFN5bWJvbCgpO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCcm93c2VyUHJvdmlkZXJQbHVnaW5Ib3N0IHtcbiAgICBjb25zdHJ1Y3RvciAocHJvdmlkZXJPYmplY3QsIHByb3ZpZGVyTmFtZSkge1xuICAgICAgICB0aGlzLkpPQl9SRVNVTFQgPSBhc3NpZ25Jbih7fSwgQlJPV1NFUl9KT0JfUkVTVUxUKTtcblxuICAgICAgICBhc3NpZ25Jbih0aGlzLCBwcm92aWRlck9iamVjdCk7XG5cbiAgICAgICAgdGhpc1tuYW1lXSA9IHByb3ZpZGVyTmFtZTtcbiAgICB9XG5cblxuICAgIC8vIEhlbHBlcnNcbiAgICBnZXQgcHJvdmlkZXJOYW1lICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbbmFtZV07XG4gICAgfVxuXG4gICAgcnVuSW5pdFNjcmlwdCAoYnJvd3NlcklkLCBjb2RlKSB7XG4gICAgICAgIGNvbnN0IGNvbm5lY3Rpb24gPSBCcm93c2VyQ29ubmVjdGlvbi5nZXRCeUlkKGJyb3dzZXJJZCk7XG5cbiAgICAgICAgcmV0dXJuIGNvbm5lY3Rpb24ucnVuSW5pdFNjcmlwdChgKCR7Y29kZX0pKClgKTtcbiAgICB9XG5cbiAgICB3YWl0Rm9yQ29ubmVjdGlvblJlYWR5IChicm93c2VySWQpIHtcbiAgICAgICAgY29uc3QgY29ubmVjdGlvbiA9IEJyb3dzZXJDb25uZWN0aW9uLmdldEJ5SWQoYnJvd3NlcklkKTtcblxuICAgICAgICBpZiAoY29ubmVjdGlvbi5yZWFkeSlcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcblxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5RXZlbnQoY29ubmVjdGlvbiwgJ3JlYWR5Jyk7XG4gICAgfVxuXG4gICAgcmVwb3J0V2FybmluZyAoYnJvd3NlcklkLCAuLi5hcmdzKSB7XG4gICAgICAgIGNvbnN0IGNvbm5lY3Rpb24gPSBCcm93c2VyQ29ubmVjdGlvbi5nZXRCeUlkKGJyb3dzZXJJZCk7XG5cbiAgICAgICAgY29ubmVjdGlvbi5hZGRXYXJuaW5nKC4uLmFyZ3MpO1xuICAgIH1cblxuICAgIHNldFVzZXJBZ2VudE1ldGFJbmZvIChicm93c2VySWQsIG1lc3NhZ2UpIHtcbiAgICAgICAgY29uc3QgY29ubmVjdGlvbiA9IEJyb3dzZXJDb25uZWN0aW9uLmdldEJ5SWQoYnJvd3NlcklkKTtcblxuICAgICAgICBjb25uZWN0aW9uLnNldFByb3ZpZGVyTWV0YUluZm8obWVzc2FnZSk7XG4gICAgfVxuXG4gICAgYXN5bmMgY2xvc2VMb2NhbEJyb3dzZXIgKGJyb3dzZXJJZCkge1xuICAgICAgICBjb25zdCBjb25uZWN0aW9uID0gQnJvd3NlckNvbm5lY3Rpb24uZ2V0QnlJZChicm93c2VySWQpO1xuXG4gICAgICAgIGF3YWl0IGNvbm5lY3Rpb24ucHJvdmlkZXIuX2Vuc3VyZUJyb3dzZXJXaW5kb3dEZXNjcmlwdG9yKGJyb3dzZXJJZCk7XG4gICAgICAgIGF3YWl0IGNvbm5lY3Rpb24ucHJvdmlkZXIuX2Nsb3NlTG9jYWxCcm93c2VyKGJyb3dzZXJJZCk7XG4gICAgfVxuXG4gICAgYXN5bmMgcmVzaXplTG9jYWxCcm93c2VyV2luZG93IChicm93c2VySWQsIHdpZHRoLCBoZWlnaHQsIGN1cnJlbnRXaWR0aCwgY3VycmVudEhlaWdodCkge1xuICAgICAgICBjb25zdCBjb25uZWN0aW9uID0gQnJvd3NlckNvbm5lY3Rpb24uZ2V0QnlJZChicm93c2VySWQpO1xuXG4gICAgICAgIGF3YWl0IGNvbm5lY3Rpb24ucHJvdmlkZXIuX2Vuc3VyZUJyb3dzZXJXaW5kb3dQYXJhbWV0ZXJzKGJyb3dzZXJJZCk7XG4gICAgICAgIGF3YWl0IGNvbm5lY3Rpb24ucHJvdmlkZXIuX3Jlc2l6ZUxvY2FsQnJvd3NlcldpbmRvdyhicm93c2VySWQsIHdpZHRoLCBoZWlnaHQsIGN1cnJlbnRXaWR0aCwgY3VycmVudEhlaWdodCk7XG4gICAgfVxuXG4gICAgLy8gQVBJXG4gICAgLy8gQnJvd3NlciBjb250cm9sXG4gICAgYXN5bmMgb3BlbkJyb3dzZXIgKC8qIGJyb3dzZXJJZCwgcGFnZVVybCwgYnJvd3Nlck5hbWUgKi8pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQhJyk7XG4gICAgfVxuXG4gICAgYXN5bmMgY2xvc2VCcm93c2VyICgvKiBicm93c2VySWQgKi8pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQhJyk7XG4gICAgfVxuXG4gICAgLy8gSW5pdGlhbGl6YXRpb25cbiAgICBhc3luYyBpbml0ICgpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGFzeW5jIGRpc3Bvc2UgKCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG5cbiAgICAvLyBCcm93c2VyIG5hbWVzIGhhbmRsaW5nXG4gICAgYXN5bmMgZ2V0QnJvd3Nlckxpc3QgKCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCEnKTtcbiAgICB9XG5cbiAgICBhc3luYyBpc1ZhbGlkQnJvd3Nlck5hbWUgKC8qIGJyb3dzZXJOYW1lICovKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8vIEV4dHJhIGZ1bmN0aW9uc1xuICAgIC8vIE5PVEU6IFRoZSBicm93c2VyTmFtZSBhcmd1bWVudCBpcyBvcHRpb25hbCwgYW5kIG11c3QgYmUgc3VwcGxpZWQgaWYgdGhlIGJyb3dzZXJJZCBhcmd1bWVudCBpcyBub3QgdmFsaWQgKGJyb3dzZXIgaXMgbm90IG9wZW5lZClcbiAgICBhc3luYyBpc0xvY2FsQnJvd3NlciAoLyogYnJvd3NlcklkWywgYnJvd3Nlck5hbWVdICovKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpc0hlYWRsZXNzQnJvd3NlciAoLyogYnJvd3NlcklkICovKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBhc3luYyBoYXNDdXN0b21BY3Rpb25Gb3JCcm93c2VyICgvKiBicm93c2VySWQgKi8pIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGhhc0Nsb3NlQnJvd3NlcjogICAgICAgICAgICAgICAgdGhpcy5oYXNPd25Qcm9wZXJ0eSgnY2xvc2VCcm93c2VyJyksXG4gICAgICAgICAgICBoYXNSZXNpemVXaW5kb3c6ICAgICAgICAgICAgICAgIHRoaXMuaGFzT3duUHJvcGVydHkoJ3Jlc2l6ZVdpbmRvdycpLFxuICAgICAgICAgICAgaGFzVGFrZVNjcmVlbnNob3Q6ICAgICAgICAgICAgICB0aGlzLmhhc093blByb3BlcnR5KCd0YWtlU2NyZWVuc2hvdCcpLFxuICAgICAgICAgICAgaGFzR2V0VmlkZW9GcmFtZURhdGE6ICAgICAgICAgICB0aGlzLmhhc093blByb3BlcnR5KCdnZXRWaWRlb0ZyYW1lRGF0YScpLFxuICAgICAgICAgICAgaGFzQ2FuUmVzaXplV2luZG93VG9EaW1lbnNpb25zOiB0aGlzLmhhc093blByb3BlcnR5KCdjYW5SZXNpemVXaW5kb3dUb0RpbWVuc2lvbnMnKSxcbiAgICAgICAgICAgIGhhc01heGltaXplV2luZG93OiAgICAgICAgICAgICAgdGhpcy5oYXNPd25Qcm9wZXJ0eSgnbWF4aW1pemVXaW5kb3cnKSxcbiAgICAgICAgICAgIGhhc0Nocm9tZWxlc3NTY3JlZW5zaG90czogICAgICAgZmFsc2VcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBhc3luYyByZXNpemVXaW5kb3cgKGJyb3dzZXJJZC8qLCB3aWR0aCwgaGVpZ2h0LCBjdXJyZW50V2lkdGgsIGN1cnJlbnRIZWlnaHQgKi8pIHtcbiAgICAgICAgdGhpcy5yZXBvcnRXYXJuaW5nKGJyb3dzZXJJZCwgV0FSTklOR19NRVNTQUdFLnJlc2l6ZU5vdFN1cHBvcnRlZEJ5QnJvd3NlclByb3ZpZGVyLCB0aGlzW25hbWVdKTtcbiAgICB9XG5cbiAgICBhc3luYyBjYW5SZXNpemVXaW5kb3dUb0RpbWVuc2lvbnMgKC8qIGJyb3dzZXJJZCwgd2lkdGgsIGhlaWdodCAqLykge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBhc3luYyB0YWtlU2NyZWVuc2hvdCAoYnJvd3NlcklkLyosIHNjcmVlbnNob3RQYXRoLCBwYWdlV2lkdGgsIHBhZ2VIZWlnaHQgKi8pIHtcbiAgICAgICAgdGhpcy5yZXBvcnRXYXJuaW5nKGJyb3dzZXJJZCwgV0FSTklOR19NRVNTQUdFLnNjcmVlbnNob3ROb3RTdXBwb3J0ZWRCeUJyb3dzZXJQcm92aWRlciwgdGhpc1tuYW1lXSk7XG4gICAgfVxuXG4gICAgYXN5bmMgbWF4aW1pemVXaW5kb3cgKGJyb3dzZXJJZCkge1xuICAgICAgICB0aGlzLnJlcG9ydFdhcm5pbmcoYnJvd3NlcklkLCBXQVJOSU5HX01FU1NBR0UubWF4aW1pemVOb3RTdXBwb3J0ZWRCeUJyb3dzZXJQcm92aWRlciwgdGhpc1tuYW1lXSk7XG4gICAgfVxuXG4gICAgYXN5bmMgZ2V0VmlkZW9GcmFtZURhdGEgKGJyb3dzZXJJZCkge1xuICAgICAgICBjb25zdCBicm93c2VyQWxpYXMgPSBCcm93c2VyQ29ubmVjdGlvbi5nZXRCeUlkKGJyb3dzZXJJZCkuYnJvd3NlckluZm8uYWxpYXM7XG5cbiAgICAgICAgdGhpcy5yZXBvcnRXYXJuaW5nKGJyb3dzZXJJZCwgV0FSTklOR19NRVNTQUdFLnZpZGVvTm90U3VwcG9ydGVkQnlCcm93c2VyLCBicm93c2VyQWxpYXMpO1xuICAgIH1cblxuICAgIGFzeW5jIHJlcG9ydEpvYlJlc3VsdCAoLypicm93c2VySWQsIHN0YXR1cywgZGF0YSovKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG59XG4iXX0=
