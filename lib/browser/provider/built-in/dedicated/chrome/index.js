'use strict';

exports.__esModule = true;

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _osFamily = require('os-family');

var _osFamily2 = _interopRequireDefault(_osFamily);

var _url = require('url');

var _base = require('../base');

var _base2 = _interopRequireDefault(_base);

var _runtimeInfo = require('./runtime-info');

var _runtimeInfo2 = _interopRequireDefault(_runtimeInfo);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _localChrome = require('./local-chrome');

var _cdp = require('./cdp');

var cdp = _interopRequireWildcard(_cdp);

var _clientFunctions = require('../../../utils/client-functions');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const MIN_AVAILABLE_DIMENSION = 50;

exports.default = (0, _extends3.default)({}, _base2.default, {

    _getConfig(name) {
        return (0, _config2.default)(name);
    },

    _getBrowserProtocolClient() {
        return cdp;
    },

    openBrowser(browserId, pageUrl, configString) {
        var _this = this;

        return (0, _asyncToGenerator3.default)(function* () {
            const runtimeInfo = yield (0, _runtimeInfo2.default)((0, _url.parse)(pageUrl).hostname, configString);

            runtimeInfo.browserName = _this._getBrowserName();
            runtimeInfo.browserId = browserId;

            runtimeInfo.providerMethods = {
                resizeLocalBrowserWindow: function resizeLocalBrowserWindow(...args) {
                    return _this.resizeLocalBrowserWindow(...args);
                }
            };

            yield (0, _localChrome.start)(pageUrl, runtimeInfo);

            yield _this.waitForConnectionReady(browserId);

            runtimeInfo.viewportSize = yield _this.runInitScript(browserId, _clientFunctions.GET_WINDOW_DIMENSIONS_INFO_SCRIPT);

            yield cdp.createClient(runtimeInfo);

            _this.openedBrowsers[browserId] = runtimeInfo;

            yield _this._ensureWindowIsExpanded(browserId, runtimeInfo.viewportSize);
        })();
    },

    closeBrowser(browserId) {
        var _this2 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            const runtimeInfo = _this2.openedBrowsers[browserId];

            if (cdp.isHeadlessTab(runtimeInfo)) yield cdp.closeTab(runtimeInfo);else yield _this2.closeLocalBrowser(browserId);

            if (_osFamily2.default.mac || runtimeInfo.config.headless) yield (0, _localChrome.stop)(runtimeInfo);

            if (runtimeInfo.tempProfileDir) yield runtimeInfo.tempProfileDir.dispose();

            delete _this2.openedBrowsers[browserId];
        })();
    },

    resizeWindow(browserId, width, height, currentWidth, currentHeight) {
        var _this3 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            const runtimeInfo = _this3.openedBrowsers[browserId];

            if (runtimeInfo.config.mobile) yield cdp.updateMobileViewportSize(runtimeInfo);else {
                runtimeInfo.viewportSize.width = currentWidth;
                runtimeInfo.viewportSize.height = currentHeight;
            }

            yield cdp.resizeWindow({ width, height }, runtimeInfo);
        })();
    },

    getVideoFrameData(browserId) {
        var _this4 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            return yield cdp.getScreenshotData(_this4.openedBrowsers[browserId]);
        })();
    },

    hasCustomActionForBrowser(browserId) {
        var _this5 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            var _openedBrowsers$brows = _this5.openedBrowsers[browserId];
            const config = _openedBrowsers$brows.config,
                  client = _openedBrowsers$brows.client;


            return {
                hasCloseBrowser: true,
                hasResizeWindow: !!client && (config.emulation || config.headless),
                hasMaximizeWindow: !!client && config.headless,
                hasTakeScreenshot: !!client,
                hasChromelessScreenshots: !!client,
                hasGetVideoFrameData: !!client,
                hasCanResizeWindowToDimensions: false
            };
        })();
    },

    _ensureWindowIsExpanded(browserId, { height, width, availableHeight, availableWidth, outerWidth, outerHeight }) {
        var _this6 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            if (height < MIN_AVAILABLE_DIMENSION || width < MIN_AVAILABLE_DIMENSION) {
                const newHeight = Math.max(availableHeight, MIN_AVAILABLE_DIMENSION);
                const newWidth = Math.max(Math.floor(availableWidth / 2), MIN_AVAILABLE_DIMENSION);

                yield _this6.resizeWindow(browserId, newWidth, newHeight, outerWidth, outerHeight);
            }
        })();
    }
});
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9icm93c2VyL3Byb3ZpZGVyL2J1aWx0LWluL2RlZGljYXRlZC9jaHJvbWUvaW5kZXguanMiXSwibmFtZXMiOlsiY2RwIiwiTUlOX0FWQUlMQUJMRV9ESU1FTlNJT04iLCJfZ2V0Q29uZmlnIiwibmFtZSIsIl9nZXRCcm93c2VyUHJvdG9jb2xDbGllbnQiLCJvcGVuQnJvd3NlciIsImJyb3dzZXJJZCIsInBhZ2VVcmwiLCJjb25maWdTdHJpbmciLCJydW50aW1lSW5mbyIsImhvc3RuYW1lIiwiYnJvd3Nlck5hbWUiLCJfZ2V0QnJvd3Nlck5hbWUiLCJwcm92aWRlck1ldGhvZHMiLCJyZXNpemVMb2NhbEJyb3dzZXJXaW5kb3ciLCJhcmdzIiwid2FpdEZvckNvbm5lY3Rpb25SZWFkeSIsInZpZXdwb3J0U2l6ZSIsInJ1bkluaXRTY3JpcHQiLCJjcmVhdGVDbGllbnQiLCJvcGVuZWRCcm93c2VycyIsIl9lbnN1cmVXaW5kb3dJc0V4cGFuZGVkIiwiY2xvc2VCcm93c2VyIiwiaXNIZWFkbGVzc1RhYiIsImNsb3NlVGFiIiwiY2xvc2VMb2NhbEJyb3dzZXIiLCJtYWMiLCJjb25maWciLCJoZWFkbGVzcyIsInRlbXBQcm9maWxlRGlyIiwiZGlzcG9zZSIsInJlc2l6ZVdpbmRvdyIsIndpZHRoIiwiaGVpZ2h0IiwiY3VycmVudFdpZHRoIiwiY3VycmVudEhlaWdodCIsIm1vYmlsZSIsInVwZGF0ZU1vYmlsZVZpZXdwb3J0U2l6ZSIsImdldFZpZGVvRnJhbWVEYXRhIiwiZ2V0U2NyZWVuc2hvdERhdGEiLCJoYXNDdXN0b21BY3Rpb25Gb3JCcm93c2VyIiwiY2xpZW50IiwiaGFzQ2xvc2VCcm93c2VyIiwiaGFzUmVzaXplV2luZG93IiwiZW11bGF0aW9uIiwiaGFzTWF4aW1pemVXaW5kb3ciLCJoYXNUYWtlU2NyZWVuc2hvdCIsImhhc0Nocm9tZWxlc3NTY3JlZW5zaG90cyIsImhhc0dldFZpZGVvRnJhbWVEYXRhIiwiaGFzQ2FuUmVzaXplV2luZG93VG9EaW1lbnNpb25zIiwiYXZhaWxhYmxlSGVpZ2h0IiwiYXZhaWxhYmxlV2lkdGgiLCJvdXRlcldpZHRoIiwib3V0ZXJIZWlnaHQiLCJuZXdIZWlnaHQiLCJNYXRoIiwibWF4IiwibmV3V2lkdGgiLCJmbG9vciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUE7Ozs7QUFDQTs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7SUFBWUEsRzs7QUFDWjs7Ozs7O0FBR0EsTUFBTUMsMEJBQTBCLEVBQWhDOzs7O0FBS0lDLGVBQVlDLElBQVosRUFBa0I7QUFDZCxlQUFPLHNCQUFVQSxJQUFWLENBQVA7QUFDSCxLOztBQUVEQyxnQ0FBNkI7QUFDekIsZUFBT0osR0FBUDtBQUNILEs7O0FBRUtLLGVBQU4sQ0FBbUJDLFNBQW5CLEVBQThCQyxPQUE5QixFQUF1Q0MsWUFBdkMsRUFBcUQ7QUFBQTs7QUFBQTtBQUNqRCxrQkFBTUMsY0FBYyxNQUFNLDJCQUFlLGdCQUFTRixPQUFULEVBQWtCRyxRQUFqQyxFQUEyQ0YsWUFBM0MsQ0FBMUI7O0FBRUFDLHdCQUFZRSxXQUFaLEdBQTBCLE1BQUtDLGVBQUwsRUFBMUI7QUFDQUgsd0JBQVlILFNBQVosR0FBMEJBLFNBQTFCOztBQUVBRyx3QkFBWUksZUFBWixHQUE4QjtBQUMxQkMsMENBQTBCLGtDQUFDLEdBQUdDLElBQUo7QUFBQSwyQkFBYSxNQUFLRCx3QkFBTCxDQUE4QixHQUFHQyxJQUFqQyxDQUFiO0FBQUE7QUFEQSxhQUE5Qjs7QUFJQSxrQkFBTSx3QkFBaUJSLE9BQWpCLEVBQTBCRSxXQUExQixDQUFOOztBQUVBLGtCQUFNLE1BQUtPLHNCQUFMLENBQTRCVixTQUE1QixDQUFOOztBQUVBRyx3QkFBWVEsWUFBWixHQUEyQixNQUFNLE1BQUtDLGFBQUwsQ0FBbUJaLFNBQW5CLHFEQUFqQzs7QUFFQSxrQkFBTU4sSUFBSW1CLFlBQUosQ0FBaUJWLFdBQWpCLENBQU47O0FBRUEsa0JBQUtXLGNBQUwsQ0FBb0JkLFNBQXBC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RCxLQUFLRyxLQUFMLENBQVdQLGlCQUFpQixDQUE1QixDQUFULEVBQXlDbEQsdUJBQXpDLENBQWxCOztBQUVBLHNCQUFNLE9BQUs4QixZQUFMLENBQWtCekIsU0FBbEIsRUFBNkJtRCxRQUE3QixFQUF1Q0gsU0FBdkMsRUFBa0RGLFVBQWxELEVBQThEQyxXQUE5RCxDQUFOO0FBQ0g7QUFOa0g7QUFPdEgiLCJmaWxlIjoiYnJvd3Nlci9wcm92aWRlci9idWlsdC1pbi9kZWRpY2F0ZWQvY2hyb21lL2luZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IE9TIGZyb20gJ29zLWZhbWlseSc7XG5pbXBvcnQgeyBwYXJzZSBhcyBwYXJzZVVybCB9IGZyb20gJ3VybCc7XG5pbXBvcnQgZGVkaWNhdGVkUHJvdmlkZXJCYXNlIGZyb20gJy4uL2Jhc2UnO1xuaW1wb3J0IGdldFJ1bnRpbWVJbmZvIGZyb20gJy4vcnVudGltZS1pbmZvJztcbmltcG9ydCBnZXRDb25maWcgZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IHsgc3RhcnQgYXMgc3RhcnRMb2NhbENocm9tZSwgc3RvcCBhcyBzdG9wTG9jYWxDaHJvbWUgfSBmcm9tICcuL2xvY2FsLWNocm9tZSc7XG5pbXBvcnQgKiBhcyBjZHAgZnJvbSAnLi9jZHAnO1xuaW1wb3J0IHsgR0VUX1dJTkRPV19ESU1FTlNJT05TX0lORk9fU0NSSVBUIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvY2xpZW50LWZ1bmN0aW9ucyc7XG5cblxuY29uc3QgTUlOX0FWQUlMQUJMRV9ESU1FTlNJT04gPSA1MDtcblxuZXhwb3J0IGRlZmF1bHQge1xuICAgIC4uLmRlZGljYXRlZFByb3ZpZGVyQmFzZSxcblxuICAgIF9nZXRDb25maWcgKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIGdldENvbmZpZyhuYW1lKTtcbiAgICB9LFxuXG4gICAgX2dldEJyb3dzZXJQcm90b2NvbENsaWVudCAoKSB7XG4gICAgICAgIHJldHVybiBjZHA7XG4gICAgfSxcblxuICAgIGFzeW5jIG9wZW5Ccm93c2VyIChicm93c2VySWQsIHBhZ2VVcmwsIGNvbmZpZ1N0cmluZykge1xuICAgICAgICBjb25zdCBydW50aW1lSW5mbyA9IGF3YWl0IGdldFJ1bnRpbWVJbmZvKHBhcnNlVXJsKHBhZ2VVcmwpLmhvc3RuYW1lLCBjb25maWdTdHJpbmcpO1xuXG4gICAgICAgIHJ1bnRpbWVJbmZvLmJyb3dzZXJOYW1lID0gdGhpcy5fZ2V0QnJvd3Nlck5hbWUoKTtcbiAgICAgICAgcnVudGltZUluZm8uYnJvd3NlcklkICAgPSBicm93c2VySWQ7XG5cbiAgICAgICAgcnVudGltZUluZm8ucHJvdmlkZXJNZXRob2RzID0ge1xuICAgICAgICAgICAgcmVzaXplTG9jYWxCcm93c2VyV2luZG93OiAoLi4uYXJncykgPT4gdGhpcy5yZXNpemVMb2NhbEJyb3dzZXJXaW5kb3coLi4uYXJncylcbiAgICAgICAgfTtcblxuICAgICAgICBhd2FpdCBzdGFydExvY2FsQ2hyb21lKHBhZ2VVcmwsIHJ1bnRpbWVJbmZvKTtcblxuICAgICAgICBhd2FpdCB0aGlzLndhaXRGb3JDb25uZWN0aW9uUmVhZHkoYnJvd3NlcklkKTtcblxuICAgICAgICBydW50aW1lSW5mby52aWV3cG9ydFNpemUgPSBhd2FpdCB0aGlzLnJ1bkluaXRTY3JpcHQoYnJvd3NlcklkLCBHRVRfV0lORE9XX0RJTUVOU0lPTlNfSU5GT19TQ1JJUFQpO1xuXG4gICAgICAgIGF3YWl0IGNkcC5jcmVhdGVDbGllbnQocnVudGltZUluZm8pO1xuXG4gICAgICAgIHRoaXMub3BlbmVkQnJvd3NlcnNbYnJvd3NlcklkXSA9IHJ1bnRpbWVJbmZvO1xuXG4gICAgICAgIGF3YWl0IHRoaXMuX2Vuc3VyZVdpbmRvd0lzRXhwYW5kZWQoYnJvd3NlcklkLCBydW50aW1lSW5mby52aWV3cG9ydFNpemUpO1xuICAgIH0sXG5cbiAgICBhc3luYyBjbG9zZUJyb3dzZXIgKGJyb3dzZXJJZCkge1xuICAgICAgICBjb25zdCBydW50aW1lSW5mbyA9IHRoaXMub3BlbmVkQnJvd3NlcnNbYnJvd3NlcklkXTtcblxuICAgICAgICBpZiAoY2RwLmlzSGVhZGxlc3NUYWIocnVudGltZUluZm8pKVxuICAgICAgICAgICAgYXdhaXQgY2RwLmNsb3NlVGFiKHJ1bnRpbWVJbmZvKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgYXdhaXQgdGhpcy5jbG9zZUxvY2FsQnJvd3Nlcihicm93c2VySWQpO1xuXG4gICAgICAgIGlmIChPUy5tYWMgfHwgcnVudGltZUluZm8uY29uZmlnLmhlYWRsZXNzKVxuICAgICAgICAgICAgYXdhaXQgc3RvcExvY2FsQ2hyb21lKHJ1bnRpbWVJbmZvKTtcblxuICAgICAgICBpZiAocnVudGltZUluZm8udGVtcFByb2ZpbGVEaXIpXG4gICAgICAgICAgICBhd2FpdCBydW50aW1lSW5mby50ZW1wUHJvZmlsZURpci5kaXNwb3NlKCk7XG5cbiAgICAgICAgZGVsZXRlIHRoaXMub3BlbmVkQnJvd3NlcnNbYnJvd3NlcklkXTtcbiAgICB9LFxuXG4gICAgYXN5bmMgcmVzaXplV2luZG93IChicm93c2VySWQsIHdpZHRoLCBoZWlnaHQsIGN1cnJlbnRXaWR0aCwgY3VycmVudEhlaWdodCkge1xuICAgICAgICBjb25zdCBydW50aW1lSW5mbyA9IHRoaXMub3BlbmVkQnJvd3NlcnNbYnJvd3NlcklkXTtcblxuICAgICAgICBpZiAocnVudGltZUluZm8uY29uZmlnLm1vYmlsZSlcbiAgICAgICAgICAgIGF3YWl0IGNkcC51cGRhdGVNb2JpbGVWaWV3cG9ydFNpemUocnVudGltZUluZm8pO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJ1bnRpbWVJbmZvLnZpZXdwb3J0U2l6ZS53aWR0aCAgPSBjdXJyZW50V2lkdGg7XG4gICAgICAgICAgICBydW50aW1lSW5mby52aWV3cG9ydFNpemUuaGVpZ2h0ID0gY3VycmVudEhlaWdodDtcbiAgICAgICAgfVxuXG4gICAgICAgIGF3YWl0IGNkcC5yZXNpemVXaW5kb3coeyB3aWR0aCwgaGVpZ2h0IH0sIHJ1bnRpbWVJbmZvKTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZ2V0VmlkZW9GcmFtZURhdGEgKGJyb3dzZXJJZCkge1xuICAgICAgICByZXR1cm4gYXdhaXQgY2RwLmdldFNjcmVlbnNob3REYXRhKHRoaXMub3BlbmVkQnJvd3NlcnNbYnJvd3NlcklkXSk7XG4gICAgfSxcblxuICAgIGFzeW5jIGhhc0N1c3RvbUFjdGlvbkZvckJyb3dzZXIgKGJyb3dzZXJJZCkge1xuICAgICAgICBjb25zdCB7IGNvbmZpZywgY2xpZW50IH0gPSB0aGlzLm9wZW5lZEJyb3dzZXJzW2Jyb3dzZXJJZF07XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGhhc0Nsb3NlQnJvd3NlcjogICAgICAgICAgICAgICAgdHJ1ZSxcbiAgICAgICAgICAgIGhhc1Jlc2l6ZVdpbmRvdzogICAgICAgICAgICAgICAgISFjbGllbnQgJiYgKGNvbmZpZy5lbXVsYXRpb24gfHwgY29uZmlnLmhlYWRsZXNzKSxcbiAgICAgICAgICAgIGhhc01heGltaXplV2luZG93OiAgICAgICAgICAgICAgISFjbGllbnQgJiYgY29uZmlnLmhlYWRsZXNzLFxuICAgICAgICAgICAgaGFzVGFrZVNjcmVlbnNob3Q6ICAgICAgICAgICAgICAhIWNsaWVudCxcbiAgICAgICAgICAgIGhhc0Nocm9tZWxlc3NTY3JlZW5zaG90czogICAgICAgISFjbGllbnQsXG4gICAgICAgICAgICBoYXNHZXRWaWRlb0ZyYW1lRGF0YTogICAgICAgICAgICEhY2xpZW50LFxuICAgICAgICAgICAgaGFzQ2FuUmVzaXplV2luZG93VG9EaW1lbnNpb25zOiBmYWxzZVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBhc3luYyBfZW5zdXJlV2luZG93SXNFeHBhbmRlZCAoYnJvd3NlcklkLCB7IGhlaWdodCwgd2lkdGgsIGF2YWlsYWJsZUhlaWdodCwgYXZhaWxhYmxlV2lkdGgsIG91dGVyV2lkdGgsIG91dGVySGVpZ2h0IH0pIHtcbiAgICAgICAgaWYgKGhlaWdodCA8IE1JTl9BVkFJTEFCTEVfRElNRU5TSU9OIHx8IHdpZHRoIDwgTUlOX0FWQUlMQUJMRV9ESU1FTlNJT04pIHtcbiAgICAgICAgICAgIGNvbnN0IG5ld0hlaWdodCA9IE1hdGgubWF4KGF2YWlsYWJsZUhlaWdodCwgTUlOX0FWQUlMQUJMRV9ESU1FTlNJT04pO1xuICAgICAgICAgICAgY29uc3QgbmV3V2lkdGggID0gTWF0aC5tYXgoTWF0aC5mbG9vcihhdmFpbGFibGVXaWR0aCAvIDIpLCBNSU5fQVZBSUxBQkxFX0RJTUVOU0lPTik7XG5cbiAgICAgICAgICAgIGF3YWl0IHRoaXMucmVzaXplV2luZG93KGJyb3dzZXJJZCwgbmV3V2lkdGgsIG5ld0hlaWdodCwgb3V0ZXJXaWR0aCwgb3V0ZXJIZWlnaHQpO1xuICAgICAgICB9XG4gICAgfVxufTtcbiJdfQ==
