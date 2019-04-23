'use strict';

exports.__esModule = true;

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _osFamily = require('os-family');

var _osFamily2 = _interopRequireDefault(_osFamily);

var _base = require('../base');

var _base2 = _interopRequireDefault(_base);

var _runtimeInfo = require('./runtime-info');

var _runtimeInfo2 = _interopRequireDefault(_runtimeInfo);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _localFirefox = require('./local-firefox');

var _marionetteClient = require('./marionette-client');

var _marionetteClient2 = _interopRequireDefault(_marionetteClient);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (0, _extends3.default)({}, _base2.default, {

    _getConfig(name) {
        return (0, _config2.default)(name);
    },

    _getBrowserProtocolClient(runtimeInfo) {
        return runtimeInfo.marionetteClient;
    },

    _createMarionetteClient(runtimeInfo) {
        return (0, _asyncToGenerator3.default)(function* () {
            try {
                const marionetteClient = new _marionetteClient2.default(runtimeInfo.marionettePort);

                yield marionetteClient.connect();

                return marionetteClient;
            } catch (e) {
                return null;
            }
        })();
    },

    openBrowser(browserId, pageUrl, configString) {
        var _this = this;

        return (0, _asyncToGenerator3.default)(function* () {
            const runtimeInfo = yield (0, _runtimeInfo2.default)(configString);

            runtimeInfo.browserName = _this._getBrowserName();
            runtimeInfo.browserId = browserId;

            yield (0, _localFirefox.start)(pageUrl, runtimeInfo);

            yield _this.waitForConnectionReady(runtimeInfo.browserId);

            if (runtimeInfo.marionettePort) runtimeInfo.marionetteClient = yield _this._createMarionetteClient(runtimeInfo);

            _this.openedBrowsers[browserId] = runtimeInfo;
        })();
    },

    closeBrowser(browserId) {
        var _this2 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            const runtimeInfo = _this2.openedBrowsers[browserId];
            const config = runtimeInfo.config,
                  marionetteClient = runtimeInfo.marionetteClient;


            if (config.headless) yield marionetteClient.quit();else yield _this2.closeLocalBrowser(browserId);

            if (_osFamily2.default.mac && !config.headless) yield (0, _localFirefox.stop)(runtimeInfo);

            if (runtimeInfo.tempProfileDir) yield runtimeInfo.tempProfileDir.dispose();

            delete _this2.openedBrowsers[browserId];
        })();
    },

    resizeWindow(browserId, width, height) {
        var _this3 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            const marionetteClient = _this3.openedBrowsers[browserId].marionetteClient;


            yield marionetteClient.setWindowSize(width, height);
        })();
    },

    getVideoFrameData(browserId) {
        var _this4 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            const marionetteClient = _this4.openedBrowsers[browserId].marionetteClient;


            return yield marionetteClient.getScreenshotData();
        })();
    },

    hasCustomActionForBrowser(browserId) {
        var _this5 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            var _openedBrowsers$brows = _this5.openedBrowsers[browserId];
            const config = _openedBrowsers$brows.config,
                  marionetteClient = _openedBrowsers$brows.marionetteClient;


            return {
                hasCloseBrowser: true,
                hasTakeScreenshot: !!marionetteClient,
                hasChromelessScreenshots: !!marionetteClient,
                hasGetVideoFrameData: !!marionetteClient,
                hasResizeWindow: !!marionetteClient && config.headless,
                hasMaximizeWindow: !!marionetteClient && config.headless,
                hasCanResizeWindowToDimensions: false
            };
        })();
    }
});
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9icm93c2VyL3Byb3ZpZGVyL2J1aWx0LWluL2RlZGljYXRlZC9maXJlZm94L2luZGV4LmpzIl0sIm5hbWVzIjpbIl9nZXRDb25maWciLCJuYW1lIiwiX2dldEJyb3dzZXJQcm90b2NvbENsaWVudCIsInJ1bnRpbWVJbmZvIiwibWFyaW9uZXR0ZUNsaWVudCIsIl9jcmVhdGVNYXJpb25ldHRlQ2xpZW50IiwibWFyaW9uZXR0ZVBvcnQiLCJjb25uZWN0IiwiZSIsIm9wZW5Ccm93c2VyIiwiYnJvd3NlcklkIiwicGFnZVVybCIsImNvbmZpZ1N0cmluZyIsImJyb3dzZXJOYW1lIiwiX2dldEJyb3dzZXJOYW1lIiwid2FpdEZvckNvbm5lY3Rpb25SZWFkeSIsIm9wZW5lZEJyb3dzZXJzIiwiY2xvc2VCcm93c2VyIiwiY29uZmlnIiwiaGVhZGxlc3MiLCJxdWl0IiwiY2xvc2VMb2NhbEJyb3dzZXIiLCJtYWMiLCJ0ZW1wUHJvZmlsZURpciIsImRpc3Bvc2UiLCJyZXNpemVXaW5kb3ciLCJ3aWR0aCIsImhlaWdodCIsInNldFdpbmRvd1NpemUiLCJnZXRWaWRlb0ZyYW1lRGF0YSIsImdldFNjcmVlbnNob3REYXRhIiwiaGFzQ3VzdG9tQWN0aW9uRm9yQnJvd3NlciIsImhhc0Nsb3NlQnJvd3NlciIsImhhc1Rha2VTY3JlZW5zaG90IiwiaGFzQ2hyb21lbGVzc1NjcmVlbnNob3RzIiwiaGFzR2V0VmlkZW9GcmFtZURhdGEiLCJoYXNSZXNpemVXaW5kb3ciLCJoYXNNYXhpbWl6ZVdpbmRvdyIsImhhc0NhblJlc2l6ZVdpbmRvd1RvRGltZW5zaW9ucyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7Ozs7Ozs7QUFNSUEsZUFBWUMsSUFBWixFQUFrQjtBQUNkLGVBQU8sc0JBQVVBLElBQVYsQ0FBUDtBQUNILEs7O0FBRURDLDhCQUEyQkMsV0FBM0IsRUFB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Z0JBSi9CO0FBS0hnQyxpQ0FBZ0MsQ0FBQyxDQUFDaEMsZ0JBQUYsSUFBc0JjLE9BQU9DLFFBTDFEO0FBTUhrQixtQ0FBZ0MsQ0FBQyxDQUFDakMsZ0JBQUYsSUFBc0JjLE9BQU9DLFFBTjFEO0FBT0htQixnREFBZ0M7QUFQN0IsYUFBUDtBQUh3QztBQVkzQyIsImZpbGUiOiJicm93c2VyL3Byb3ZpZGVyL2J1aWx0LWluL2RlZGljYXRlZC9maXJlZm94L2luZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IE9TIGZyb20gJ29zLWZhbWlseSc7XG5pbXBvcnQgZGVkaWNhdGVkUHJvdmlkZXJCYXNlIGZyb20gJy4uL2Jhc2UnO1xuaW1wb3J0IGdldFJ1bnRpbWVJbmZvIGZyb20gJy4vcnVudGltZS1pbmZvJztcbmltcG9ydCBnZXRDb25maWcgZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IHsgc3RhcnQgYXMgc3RhcnRMb2NhbEZpcmVmb3gsIHN0b3AgYXMgc3RvcExvY2FsRmlyZWZveCB9IGZyb20gJy4vbG9jYWwtZmlyZWZveCc7XG5pbXBvcnQgTWFyaW9uZXR0ZUNsaWVudCBmcm9tICcuL21hcmlvbmV0dGUtY2xpZW50JztcblxuXG5leHBvcnQgZGVmYXVsdCB7XG4gICAgLi4uZGVkaWNhdGVkUHJvdmlkZXJCYXNlLFxuXG4gICAgX2dldENvbmZpZyAobmFtZSkge1xuICAgICAgICByZXR1cm4gZ2V0Q29uZmlnKG5hbWUpO1xuICAgIH0sXG5cbiAgICBfZ2V0QnJvd3NlclByb3RvY29sQ2xpZW50IChydW50aW1lSW5mbykge1xuICAgICAgICByZXR1cm4gcnVudGltZUluZm8ubWFyaW9uZXR0ZUNsaWVudDtcbiAgICB9LFxuXG4gICAgYXN5bmMgX2NyZWF0ZU1hcmlvbmV0dGVDbGllbnQgKHJ1bnRpbWVJbmZvKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBtYXJpb25ldHRlQ2xpZW50ID0gbmV3IE1hcmlvbmV0dGVDbGllbnQocnVudGltZUluZm8ubWFyaW9uZXR0ZVBvcnQpO1xuXG4gICAgICAgICAgICBhd2FpdCBtYXJpb25ldHRlQ2xpZW50LmNvbm5lY3QoKTtcblxuICAgICAgICAgICAgcmV0dXJuIG1hcmlvbmV0dGVDbGllbnQ7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIGFzeW5jIG9wZW5Ccm93c2VyIChicm93c2VySWQsIHBhZ2VVcmwsIGNvbmZpZ1N0cmluZykge1xuICAgICAgICBjb25zdCBydW50aW1lSW5mbyA9IGF3YWl0IGdldFJ1bnRpbWVJbmZvKGNvbmZpZ1N0cmluZyk7XG5cbiAgICAgICAgcnVudGltZUluZm8uYnJvd3Nlck5hbWUgPSB0aGlzLl9nZXRCcm93c2VyTmFtZSgpO1xuICAgICAgICBydW50aW1lSW5mby5icm93c2VySWQgICA9IGJyb3dzZXJJZDtcblxuICAgICAgICBhd2FpdCBzdGFydExvY2FsRmlyZWZveChwYWdlVXJsLCBydW50aW1lSW5mbyk7XG5cbiAgICAgICAgYXdhaXQgdGhpcy53YWl0Rm9yQ29ubmVjdGlvblJlYWR5KHJ1bnRpbWVJbmZvLmJyb3dzZXJJZCk7XG5cbiAgICAgICAgaWYgKHJ1bnRpbWVJbmZvLm1hcmlvbmV0dGVQb3J0KVxuICAgICAgICAgICAgcnVudGltZUluZm8ubWFyaW9uZXR0ZUNsaWVudCA9IGF3YWl0IHRoaXMuX2NyZWF0ZU1hcmlvbmV0dGVDbGllbnQocnVudGltZUluZm8pO1xuXG4gICAgICAgIHRoaXMub3BlbmVkQnJvd3NlcnNbYnJvd3NlcklkXSA9IHJ1bnRpbWVJbmZvO1xuICAgIH0sXG5cbiAgICBhc3luYyBjbG9zZUJyb3dzZXIgKGJyb3dzZXJJZCkge1xuICAgICAgICBjb25zdCBydW50aW1lSW5mbyA9IHRoaXMub3BlbmVkQnJvd3NlcnNbYnJvd3NlcklkXTtcbiAgICAgICAgY29uc3QgeyBjb25maWcsIG1hcmlvbmV0dGVDbGllbnQgfSA9IHJ1bnRpbWVJbmZvO1xuXG4gICAgICAgIGlmIChjb25maWcuaGVhZGxlc3MpXG4gICAgICAgICAgICBhd2FpdCBtYXJpb25ldHRlQ2xpZW50LnF1aXQoKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgYXdhaXQgdGhpcy5jbG9zZUxvY2FsQnJvd3Nlcihicm93c2VySWQpO1xuXG4gICAgICAgIGlmIChPUy5tYWMgJiYgIWNvbmZpZy5oZWFkbGVzcylcbiAgICAgICAgICAgIGF3YWl0IHN0b3BMb2NhbEZpcmVmb3gocnVudGltZUluZm8pO1xuXG4gICAgICAgIGlmIChydW50aW1lSW5mby50ZW1wUHJvZmlsZURpcilcbiAgICAgICAgICAgIGF3YWl0IHJ1bnRpbWVJbmZvLnRlbXBQcm9maWxlRGlyLmRpc3Bvc2UoKTtcblxuICAgICAgICBkZWxldGUgdGhpcy5vcGVuZWRCcm93c2Vyc1ticm93c2VySWRdO1xuICAgIH0sXG5cbiAgICBhc3luYyByZXNpemVXaW5kb3cgKGJyb3dzZXJJZCwgd2lkdGgsIGhlaWdodCkge1xuICAgICAgICBjb25zdCB7IG1hcmlvbmV0dGVDbGllbnQgfSA9IHRoaXMub3BlbmVkQnJvd3NlcnNbYnJvd3NlcklkXTtcblxuICAgICAgICBhd2FpdCBtYXJpb25ldHRlQ2xpZW50LnNldFdpbmRvd1NpemUod2lkdGgsIGhlaWdodCk7XG4gICAgfSxcblxuICAgIGFzeW5jIGdldFZpZGVvRnJhbWVEYXRhIChicm93c2VySWQpIHtcbiAgICAgICAgY29uc3QgeyBtYXJpb25ldHRlQ2xpZW50IH0gPSB0aGlzLm9wZW5lZEJyb3dzZXJzW2Jyb3dzZXJJZF07XG5cbiAgICAgICAgcmV0dXJuIGF3YWl0IG1hcmlvbmV0dGVDbGllbnQuZ2V0U2NyZWVuc2hvdERhdGEoKTtcbiAgICB9LFxuXG4gICAgYXN5bmMgaGFzQ3VzdG9tQWN0aW9uRm9yQnJvd3NlciAoYnJvd3NlcklkKSB7XG4gICAgICAgIGNvbnN0IHsgY29uZmlnLCBtYXJpb25ldHRlQ2xpZW50IH0gPSB0aGlzLm9wZW5lZEJyb3dzZXJzW2Jyb3dzZXJJZF07XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGhhc0Nsb3NlQnJvd3NlcjogICAgICAgICAgICAgICAgdHJ1ZSxcbiAgICAgICAgICAgIGhhc1Rha2VTY3JlZW5zaG90OiAgICAgICAgICAgICAgISFtYXJpb25ldHRlQ2xpZW50LFxuICAgICAgICAgICAgaGFzQ2hyb21lbGVzc1NjcmVlbnNob3RzOiAgICAgICAhIW1hcmlvbmV0dGVDbGllbnQsXG4gICAgICAgICAgICBoYXNHZXRWaWRlb0ZyYW1lRGF0YTogICAgICAgICAgICEhbWFyaW9uZXR0ZUNsaWVudCxcbiAgICAgICAgICAgIGhhc1Jlc2l6ZVdpbmRvdzogICAgICAgICAgICAgICAgISFtYXJpb25ldHRlQ2xpZW50ICYmIGNvbmZpZy5oZWFkbGVzcyxcbiAgICAgICAgICAgIGhhc01heGltaXplV2luZG93OiAgICAgICAgICAgICAgISFtYXJpb25ldHRlQ2xpZW50ICYmIGNvbmZpZy5oZWFkbGVzcyxcbiAgICAgICAgICAgIGhhc0NhblJlc2l6ZVdpbmRvd1RvRGltZW5zaW9uczogZmFsc2VcbiAgICAgICAgfTtcbiAgICB9XG59O1xuIl19
