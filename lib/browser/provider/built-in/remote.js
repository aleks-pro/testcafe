'use strict';

exports.__esModule = true;

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _testcafeBrowserTools = require('testcafe-browser-tools');

var _warningMessage = require('../../../notifications/warning-message');

var _warningMessage2 = _interopRequireDefault(_warningMessage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
    localBrowsersFlags: {},

    openBrowser(browserId) {
        var _this = this;

        return (0, _asyncToGenerator3.default)(function* () {
            yield _this.waitForConnectionReady(browserId);

            const localBrowserWindow = yield (0, _testcafeBrowserTools.findWindow)(browserId);

            _this.localBrowsersFlags[browserId] = localBrowserWindow !== null;
        })();
    },

    closeBrowser(browserId) {
        var _this2 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            delete _this2.localBrowsersFlags[browserId];
        })();
    },

    isLocalBrowser(browserId) {
        var _this3 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            return _this3.localBrowsersFlags[browserId];
        })();
    },

    // NOTE: we must try to do a local screenshot or resize, if browser is accessible, and emit warning otherwise
    hasCustomActionForBrowser(browserId) {
        var _this4 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            const isLocalBrowser = _this4.localBrowsersFlags[browserId];

            return {
                hasCloseBrowser: true,
                hasResizeWindow: !isLocalBrowser,
                hasMaximizeWindow: !isLocalBrowser,
                hasTakeScreenshot: !isLocalBrowser,
                hasCanResizeWindowToDimensions: !isLocalBrowser
            };
        })();
    },

    takeScreenshot(browserId) {
        var _this5 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            _this5.reportWarning(browserId, _warningMessage2.default.browserManipulationsOnRemoteBrowser);
        })();
    },

    resizeWindow(browserId) {
        var _this6 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            _this6.reportWarning(browserId, _warningMessage2.default.browserManipulationsOnRemoteBrowser);
        })();
    },

    maximizeWindow(browserId) {
        var _this7 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            _this7.reportWarning(browserId, _warningMessage2.default.browserManipulationsOnRemoteBrowser);
        })();
    }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9icm93c2VyL3Byb3ZpZGVyL2J1aWx0LWluL3JlbW90ZS5qcyJdLCJuYW1lcyI6WyJsb2NhbEJyb3dzZXJzRmxhZ3MiLCJvcGVuQnJvd3NlciIsImJyb3dzZXJJZCIsIndhaXRGb3JDb25uZWN0aW9uUmVhZHkiLCJsb2NhbEJyb3dzZXJXaW5kb3ciLCJjbG9zZUJyb3dzZXIiLCJpc0xvY2FsQnJvd3NlciIsImhhc0N1c3RvbUFjdGlvbkZvckJyb3dzZXIiLCJoYXNDbG9zZUJyb3dzZXIiLCJoYXNSZXNpemVXaW5kb3ciLCJoYXNNYXhpbWl6ZVdpbmRvdyIsImhhc1Rha2VTY3JlZW5zaG90IiwiaGFzQ2FuUmVzaXplV2luZG93VG9EaW1lbnNpb25zIiwidGFrZVNjcmVlbnNob3QiLCJyZXBvcnRXYXJuaW5nIiwiYnJvd3Nlck1hbmlwdWxhdGlvbnNPblJlbW90ZUJyb3dzZXIiLCJyZXNpemVXaW5kb3ciLCJtYXhpbWl6ZVdpbmRvdyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQTs7QUFDQTs7Ozs7O2tCQUdlO0FBQ1hBLHdCQUFvQixFQURUOztBQUdMQyxlQUFOLENBQW1CQyxTQUFuQixFQUE4QjtBQUFBOztBQUFBO0FBQzFCLGtCQUFNLE1BQUtDLHNCQUFMLENBQTRCRCxTQUE1QixDQUFOOztBQUVBLGtCQUFNRSxxQkFBcUIsTUFBTSxzQ0FBV0YsU0FBWCxDQUFqQzs7QUFFQSxrQkFBS0Ysa0JBQUwsQ0FBd0JFLFNBQXhCLElBQXFDRSx1QkFBdUIsSUFBNUQ7QUFMMEI7QUFNN0IsS0FUVTs7QUFXTEMsZ0JBQU4sQ0FBb0JILFNBQXBCLEVBQStCO0FBQUE7O0FBQUE7QUFDM0IsbUJBQU8sT0FBS0Ysa0JBQUwsQ0FBd0JFLFNBQXhCLENBQVA7QUFEMkI7QUFFOUIsS0FiVTs7QUFlTEksa0JBQU4sQ0FBc0JKLFNBQXRCLEVBQWlDO0FBQUE7O0FBQUE7QUFDN0IsbUJBQU8sT0FBS0Ysa0JBQUwsQ0FBd0JFLFNBQXhCLENBQVA7QUFENkI7QUFFaEMsS0FqQlU7O0FBbUJYO0FBQ01LLDZCQUFOLENBQWlDTCxTQUFqQyxFQUE0QztBQUFBOztBQUFBO0FBQ3hDLGtCQUFNSSxpQkFBaUIsT0FBS04sa0JBQUwsQ0FBd0JFLFNBQXhCLENBQXZCOztBQUVBLG1CQUFPO0FBQ0hNLGlDQUFnQyxJQUQ3QjtBQUVIQyxpQ0FBZ0MsQ0FBQ0gsY0FGOUI7QUFHSEksbUNBQWdDLENBQUNKLGNBSDlCO0FBSUhLLG1DQUFnQyxDQUFDTCxjQUo5QjtBQUtITSxnREFBZ0MsQ0FBQ047QUFMOUIsYUFBUDtBQUh3QztBQVUzQyxLQTlCVTs7QUFnQ0xPLGtCQUFOLENBQXNCWCxTQUF0QixFQUFpQztBQUFBOztBQUFBO0FBQzdCLG1CQUFLWSxhQUFMLENBQW1CWixTQUFuQixFQUE4Qix5QkFBZ0JhLG1DQUE5QztBQUQ2QjtBQUVoQyxLQWxDVTs7QUFvQ0xDLGdCQUFOLENBQW9CZCxTQUFwQixFQUErQjtBQUFBOztBQUFBO0FBQzNCLG1CQUFLWSxhQUFMLENBQW1CWixTQUFuQixFQUE4Qix5QkFBZ0JhLG1DQUE5QztBQUQyQjtBQUU5QixLQXRDVTs7QUF3Q0xFLGtCQUFOLENBQXNCZixTQUF0QixFQUFpQztBQUFBOztBQUFBO0FBQzdCLG1CQUFLWSxhQUFMLENBQW1CWixTQUFuQixFQUE4Qix5QkFBZ0JhLG1DQUE5QztBQUQ2QjtBQUVoQztBQTFDVSxDIiwiZmlsZSI6ImJyb3dzZXIvcHJvdmlkZXIvYnVpbHQtaW4vcmVtb3RlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZmluZFdpbmRvdyB9IGZyb20gJ3Rlc3RjYWZlLWJyb3dzZXItdG9vbHMnO1xuaW1wb3J0IFdBUk5JTkdfTUVTU0FHRSBmcm9tICcuLi8uLi8uLi9ub3RpZmljYXRpb25zL3dhcm5pbmctbWVzc2FnZSc7XG5cblxuZXhwb3J0IGRlZmF1bHQge1xuICAgIGxvY2FsQnJvd3NlcnNGbGFnczoge30sXG5cbiAgICBhc3luYyBvcGVuQnJvd3NlciAoYnJvd3NlcklkKSB7XG4gICAgICAgIGF3YWl0IHRoaXMud2FpdEZvckNvbm5lY3Rpb25SZWFkeShicm93c2VySWQpO1xuXG4gICAgICAgIGNvbnN0IGxvY2FsQnJvd3NlcldpbmRvdyA9IGF3YWl0IGZpbmRXaW5kb3coYnJvd3NlcklkKTtcblxuICAgICAgICB0aGlzLmxvY2FsQnJvd3NlcnNGbGFnc1ticm93c2VySWRdID0gbG9jYWxCcm93c2VyV2luZG93ICE9PSBudWxsO1xuICAgIH0sXG5cbiAgICBhc3luYyBjbG9zZUJyb3dzZXIgKGJyb3dzZXJJZCkge1xuICAgICAgICBkZWxldGUgdGhpcy5sb2NhbEJyb3dzZXJzRmxhZ3NbYnJvd3NlcklkXTtcbiAgICB9LFxuXG4gICAgYXN5bmMgaXNMb2NhbEJyb3dzZXIgKGJyb3dzZXJJZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5sb2NhbEJyb3dzZXJzRmxhZ3NbYnJvd3NlcklkXTtcbiAgICB9LFxuXG4gICAgLy8gTk9URTogd2UgbXVzdCB0cnkgdG8gZG8gYSBsb2NhbCBzY3JlZW5zaG90IG9yIHJlc2l6ZSwgaWYgYnJvd3NlciBpcyBhY2Nlc3NpYmxlLCBhbmQgZW1pdCB3YXJuaW5nIG90aGVyd2lzZVxuICAgIGFzeW5jIGhhc0N1c3RvbUFjdGlvbkZvckJyb3dzZXIgKGJyb3dzZXJJZCkge1xuICAgICAgICBjb25zdCBpc0xvY2FsQnJvd3NlciA9IHRoaXMubG9jYWxCcm93c2Vyc0ZsYWdzW2Jyb3dzZXJJZF07XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGhhc0Nsb3NlQnJvd3NlcjogICAgICAgICAgICAgICAgdHJ1ZSxcbiAgICAgICAgICAgIGhhc1Jlc2l6ZVdpbmRvdzogICAgICAgICAgICAgICAgIWlzTG9jYWxCcm93c2VyLFxuICAgICAgICAgICAgaGFzTWF4aW1pemVXaW5kb3c6ICAgICAgICAgICAgICAhaXNMb2NhbEJyb3dzZXIsXG4gICAgICAgICAgICBoYXNUYWtlU2NyZWVuc2hvdDogICAgICAgICAgICAgICFpc0xvY2FsQnJvd3NlcixcbiAgICAgICAgICAgIGhhc0NhblJlc2l6ZVdpbmRvd1RvRGltZW5zaW9uczogIWlzTG9jYWxCcm93c2VyXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGFzeW5jIHRha2VTY3JlZW5zaG90IChicm93c2VySWQpIHtcbiAgICAgICAgdGhpcy5yZXBvcnRXYXJuaW5nKGJyb3dzZXJJZCwgV0FSTklOR19NRVNTQUdFLmJyb3dzZXJNYW5pcHVsYXRpb25zT25SZW1vdGVCcm93c2VyKTtcbiAgICB9LFxuXG4gICAgYXN5bmMgcmVzaXplV2luZG93IChicm93c2VySWQpIHtcbiAgICAgICAgdGhpcy5yZXBvcnRXYXJuaW5nKGJyb3dzZXJJZCwgV0FSTklOR19NRVNTQUdFLmJyb3dzZXJNYW5pcHVsYXRpb25zT25SZW1vdGVCcm93c2VyKTtcbiAgICB9LFxuXG4gICAgYXN5bmMgbWF4aW1pemVXaW5kb3cgKGJyb3dzZXJJZCkge1xuICAgICAgICB0aGlzLnJlcG9ydFdhcm5pbmcoYnJvd3NlcklkLCBXQVJOSU5HX01FU1NBR0UuYnJvd3Nlck1hbmlwdWxhdGlvbnNPblJlbW90ZUJyb3dzZXIpO1xuICAgIH1cbn07XG4iXX0=
