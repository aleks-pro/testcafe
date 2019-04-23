'use strict';

exports.__esModule = true;
exports.resizeWindow = exports.updateMobileViewportSize = exports.closeTab = exports.createClient = exports.getScreenshotData = undefined;

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

let getActiveTab = (() => {
    var _ref = (0, _asyncToGenerator3.default)(function* (cdpPort, browserId) {
        const tabs = yield _chromeRemoteInterface2.default.listTabs({ port: cdpPort });
        const tab = tabs.filter(function (t) {
            return t.type === 'page' && t.url.indexOf(browserId) > -1;
        })[0];

        return tab;
    });

    return function getActiveTab(_x, _x2) {
        return _ref.apply(this, arguments);
    };
})();

let setEmulationBounds = (() => {
    var _ref2 = (0, _asyncToGenerator3.default)(function* ({ client, config, viewportSize, emulatedDevicePixelRatio }) {
        yield client.Emulation.setDeviceMetricsOverride({
            width: viewportSize.width,
            height: viewportSize.height,
            deviceScaleFactor: emulatedDevicePixelRatio,
            mobile: config.mobile,
            fitWindow: false
        });

        yield client.Emulation.setVisibleSize({ width: viewportSize.width, height: viewportSize.height });
    });

    return function setEmulationBounds(_x3) {
        return _ref2.apply(this, arguments);
    };
})();

let setEmulation = (() => {
    var _ref3 = (0, _asyncToGenerator3.default)(function* (runtimeInfo) {
        const client = runtimeInfo.client,
              config = runtimeInfo.config;


        if (config.userAgent !== void 0) yield client.Network.setUserAgentOverride({ userAgent: config.userAgent });

        if (config.touch !== void 0) {
            const touchConfig = {
                enabled: config.touch,
                configuration: config.mobile ? 'mobile' : 'desktop',
                maxTouchPoints: 1
            };

            if (client.Emulation.setEmitTouchEventsForMouse) yield client.Emulation.setEmitTouchEventsForMouse(touchConfig);

            if (client.Emulation.setTouchEmulationEnabled) yield client.Emulation.setTouchEmulationEnabled(touchConfig);
        }

        yield resizeWindow({ width: config.width, height: config.height }, runtimeInfo);
    });

    return function setEmulation(_x4) {
        return _ref3.apply(this, arguments);
    };
})();

let getScreenshotData = exports.getScreenshotData = (() => {
    var _ref4 = (0, _asyncToGenerator3.default)(function* ({ client }) {
        const screenshotData = yield client.Page.captureScreenshot();

        return Buffer.from(screenshotData.data, 'base64');
    });

    return function getScreenshotData(_x5) {
        return _ref4.apply(this, arguments);
    };
})();

let createClient = exports.createClient = (() => {
    var _ref5 = (0, _asyncToGenerator3.default)(function* (runtimeInfo) {
        const browserId = runtimeInfo.browserId,
              config = runtimeInfo.config,
              cdpPort = runtimeInfo.cdpPort;


        let tab = null;
        let client = null;

        try {
            tab = yield getActiveTab(cdpPort, browserId);

            if (!tab) return;

            client = yield (0, _chromeRemoteInterface2.default)({ target: tab, port: cdpPort });
        } catch (e) {
            return;
        }

        runtimeInfo.tab = tab;
        runtimeInfo.client = client;

        yield client.Page.enable();
        yield client.Network.enable();
        yield client.Runtime.enable();

        const devicePixelRatioQueryResult = yield client.Runtime.evaluate({ expression: 'window.devicePixelRatio' });

        runtimeInfo.originalDevicePixelRatio = devicePixelRatioQueryResult.result.value;
        runtimeInfo.emulatedDevicePixelRatio = config.scaleFactor || runtimeInfo.originalDevicePixelRatio;

        if (config.emulation) yield setEmulation(runtimeInfo);
    });

    return function createClient(_x6) {
        return _ref5.apply(this, arguments);
    };
})();

let closeTab = exports.closeTab = (() => {
    var _ref6 = (0, _asyncToGenerator3.default)(function* ({ tab, cdpPort }) {
        yield _chromeRemoteInterface2.default.closeTab({ id: tab.id, port: cdpPort });
    });

    return function closeTab(_x7) {
        return _ref6.apply(this, arguments);
    };
})();

let updateMobileViewportSize = exports.updateMobileViewportSize = (() => {
    var _ref7 = (0, _asyncToGenerator3.default)(function* (runtimeInfo) {
        const windowDimensionsQueryResult = yield runtimeInfo.client.Runtime.evaluate({
            expression: `(${_clientFunctions.GET_WINDOW_DIMENSIONS_INFO_SCRIPT})()`,
            returnByValue: true
        });

        const windowDimensions = windowDimensionsQueryResult.result.value;

        runtimeInfo.viewportSize.width = windowDimensions.outerWidth;
        runtimeInfo.viewportSize.height = windowDimensions.outerHeight;
    });

    return function updateMobileViewportSize(_x8) {
        return _ref7.apply(this, arguments);
    };
})();

let resizeWindow = exports.resizeWindow = (() => {
    var _ref8 = (0, _asyncToGenerator3.default)(function* (newDimensions, runtimeInfo) {
        const browserId = runtimeInfo.browserId,
              config = runtimeInfo.config,
              viewportSize = runtimeInfo.viewportSize,
              providerMethods = runtimeInfo.providerMethods;


        const currentWidth = viewportSize.width;
        const currentHeight = viewportSize.height;
        const newWidth = newDimensions.width || currentWidth;
        const newHeight = newDimensions.height || currentHeight;

        if (!config.headless) yield providerMethods.resizeLocalBrowserWindow(browserId, newWidth, newHeight, currentWidth, currentHeight);

        viewportSize.width = newWidth;
        viewportSize.height = newHeight;

        if (config.emulation) yield setEmulationBounds(runtimeInfo);
    });

    return function resizeWindow(_x9, _x10) {
        return _ref8.apply(this, arguments);
    };
})();

exports.isHeadlessTab = isHeadlessTab;

var _chromeRemoteInterface = require('chrome-remote-interface');

var _chromeRemoteInterface2 = _interopRequireDefault(_chromeRemoteInterface);

var _clientFunctions = require('../../../utils/client-functions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function isHeadlessTab({ tab, config }) {
    return tab && config.headless;
}
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9icm93c2VyL3Byb3ZpZGVyL2J1aWx0LWluL2RlZGljYXRlZC9jaHJvbWUvY2RwLmpzIl0sIm5hbWVzIjpbImNkcFBvcnQiLCJicm93c2VySWQiLCJ0YWJzIiwibGlzdFRhYnMiLCJwb3J0IiwidGFiIiwiZmlsdGVyIiwidCIsInR5cGUiLCJ1cmwiLCJpbmRleE9mIiwiZ2V0QWN0aXZlVGFiIiwiY2xpZW50IiwiY29uZmlnIiwidmlld3BvcnRTaXplIiwiZW11bGF0ZWREZXZpY2VQaXhlbFJhdGlvIiwiRW11bGF0aW9uIiwic2V0RGV2aWNlTWV0cmljc092ZXJyaWRlIiwid2lkdGgiLCJoZWlnaHQiLCJkZXZpY2VTY2FsZUZhY3RvciIsIm1vYmlsZSIsImZpdFdpbmRvdyIsInNldFZpc2libGVTaXplIiwic2V0RW11bGF0aW9uQm91bmRzIiwicnVudGltZUluZm8iLCJ1c2VyQWdlbnQiLCJOZXR3b3JrIiwic2V0VXNlckFnZW50T3ZlcnJpZGUiLCJ0b3VjaCIsInRvdWNoQ29uZmlnIiwiZW5hYmxlZCIsImNvbmZpZ3VyYXRpb24iLCJtYXhUb3VjaFBvaW50cyIsInNldEVtaXRUb3VjaEV2ZW50c0Zvck1vdXNlIiwic2V0VG91Y2hFbXVsYXRpb25FbmFibGVkIiwicmVzaXplV2luZG93Iiwic2V0RW11bGF0aW9uIiwic2NyZWVuc2hvdERhdGEiLCJQYWdlIiwiY2FwdHVyZVNjcmVlbnNob3QiLCJCdWZmZXIiLCJmcm9tIiwiZGF0YSIsImdldFNjcmVlbnNob3REYXRhIiwidGFyZ2V0IiwiZSIsImVuYWJsZSIsIlJ1bnRpbWUiLCJkZXZpY2VQaXhlbFJhdGlvUXVlcnlSZXN1bHQiLCJldmFsdWF0ZSIsImV4cHJlc3Npb24iLCJvcmlnaW5hbERldmljZVBpeGVsUmF0aW8iLCJyZXN1bHQiLCJ2YWx1ZSIsInNjYWxlRmFjdG9yIiwiZW11bGF0aW9uIiwiY3JlYXRlQ2xpZW50IiwiY2xvc2VUYWIiLCJpZCIsIndpbmRvd0RpbWVuc2lvbnNRdWVyeVJlc3VsdCIsInJldHVybkJ5VmFsdWUiLCJ3aW5kb3dEaW1lbnNpb25zIiwib3V0ZXJXaWR0aCIsIm91dGVySGVpZ2h0IiwidXBkYXRlTW9iaWxlVmlld3BvcnRTaXplIiwibmV3RGltZW5zaW9ucyIsInByb3ZpZGVyTWV0aG9kcyIsImN1cnJlbnRXaWR0aCIsImN1cnJlbnRIZWlnaHQiLCJuZXdXaWR0aCIsIm5ld0hlaWdodCIsImhlYWRsZXNzIiwicmVzaXplTG9jYWxCcm93c2VyV2luZG93IiwiaXNIZWFkbGVzc1RhYiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OzsrQ0FJQSxXQUE2QkEsT0FBN0IsRUFBc0NDLFNBQXRDLEVBQWlEO0FBQzdDLGNBQU1DLE9BQU8sTUFBTSxnQ0FBYUMsUUFBYixDQUFzQixFQUFFQyxNQUFNSixPQUFSLEVBQXRCLENBQW5CO0FBQ0EsY0FBTUssTUFBT0gsS0FBS0ksTUFBTCxDQUFZO0FBQUEsbUJBQUtDLEVBQUVDLElBQUYsS0FBVyxNQUFYLElBQXFCRCxFQUFFRSxHQUFGLENBQU1DLE9BQU4sQ0FBY1QsU0FBZCxJQUEyQixDQUFDLENBQXREO0FBQUEsU0FBWixFQUFxRSxDQUFyRSxDQUFiOztBQUVBLGVBQU9JLEdBQVA7QUFDSCxLOztvQkFMY00sWTs7Ozs7O2dEQU9mLFdBQW1DLEVBQUVDLE1BQUYsRUFBVUMsTUFBVixFQUFrQkMsWUFBbEIsRUFBZ0NDLHdCQUFoQyxFQUFuQyxFQUErRjtBQUMzRixjQUFNSCxPQUFPSSxTQUFQLENBQWlCQyx3QkFBakIsQ0FBMEM7QUFDNUNDLG1CQUFtQkosYUFBYUksS0FEWTtBQUU1Q0Msb0JBQW1CTCxhQUFhSyxNQUZZO0FBRzVDQywrQkFBbUJMLHdCQUh5QjtBQUk1Q00sb0JBQW1CUixPQUFPUSxNQUprQjtBQUs1Q0MsdUJBQW1CO0FBTHlCLFNBQTFDLENBQU47O0FBUUEsY0FBTVYsT0FBT0ksU0FBUCxDQUFpQk8sY0FBakIsQ0FBZ0MsRUFBRUwsT0FBT0osYUFBYUksS0FBdEIsRUFBNkJDLFFBQVFMLGFB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QUFnQk0sd0JBQWhCLENBQXlDeEUsU0FBekMsRUFBb0RxRSxRQUFwRCxFQUE4REMsU0FBOUQsRUFBeUVILFlBQXpFLEVBQXVGQyxhQUF2RixDQUFOOztBQUVKdkQscUJBQWFJLEtBQWIsR0FBc0JvRCxRQUF0QjtBQUNBeEQscUJBQWFLLE1BQWIsR0FBc0JvRCxTQUF0Qjs7QUFFQSxZQUFJMUQsT0FBTzJDLFNBQVgsRUFDSSxNQUFNaEMsbUJBQW1CQyxXQUFuQixDQUFOO0FBQ1AsSzs7b0JBaEJxQlcsWTs7Ozs7UUFwQk5zQyxhLEdBQUFBLGE7O0FBdEZoQjs7OztBQUNBOzs7O0FBcUZPLFNBQVNBLGFBQVQsQ0FBd0IsRUFBRXJFLEdBQUYsRUFBT1EsTUFBUCxFQUF4QixFQUF5QztBQUM1QyxXQUFPUixPQUFPUSxPQUFPMkQsUUFBckI7QUFDSCIsImZpbGUiOiJicm93c2VyL3Byb3ZpZGVyL2J1aWx0LWluL2RlZGljYXRlZC9jaHJvbWUvY2RwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHJlbW90ZUNocm9tZSBmcm9tICdjaHJvbWUtcmVtb3RlLWludGVyZmFjZSc7XG5pbXBvcnQgeyBHRVRfV0lORE9XX0RJTUVOU0lPTlNfSU5GT19TQ1JJUFQgfSBmcm9tICcuLi8uLi8uLi91dGlscy9jbGllbnQtZnVuY3Rpb25zJztcblxuXG5hc3luYyBmdW5jdGlvbiBnZXRBY3RpdmVUYWIgKGNkcFBvcnQsIGJyb3dzZXJJZCkge1xuICAgIGNvbnN0IHRhYnMgPSBhd2FpdCByZW1vdGVDaHJvbWUubGlzdFRhYnMoeyBwb3J0OiBjZHBQb3J0IH0pO1xuICAgIGNvbnN0IHRhYiAgPSB0YWJzLmZpbHRlcih0ID0+IHQudHlwZSA9PT0gJ3BhZ2UnICYmIHQudXJsLmluZGV4T2YoYnJvd3NlcklkKSA+IC0xKVswXTtcblxuICAgIHJldHVybiB0YWI7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHNldEVtdWxhdGlvbkJvdW5kcyAoeyBjbGllbnQsIGNvbmZpZywgdmlld3BvcnRTaXplLCBlbXVsYXRlZERldmljZVBpeGVsUmF0aW8gfSkge1xuICAgIGF3YWl0IGNsaWVudC5FbXVsYXRpb24uc2V0RGV2aWNlTWV0cmljc092ZXJyaWRlKHtcbiAgICAgICAgd2lkdGg6ICAgICAgICAgICAgIHZpZXdwb3J0U2l6ZS53aWR0aCxcbiAgICAgICAgaGVpZ2h0OiAgICAgICAgICAgIHZpZXdwb3J0U2l6ZS5oZWlnaHQsXG4gICAgICAgIGRldmljZVNjYWxlRmFjdG9yOiBlbXVsYXRlZERldmljZVBpeGVsUmF0aW8sXG4gICAgICAgIG1vYmlsZTogICAgICAgICAgICBjb25maWcubW9iaWxlLFxuICAgICAgICBmaXRXaW5kb3c6ICAgICAgICAgZmFsc2VcbiAgICB9KTtcblxuICAgIGF3YWl0IGNsaWVudC5FbXVsYXRpb24uc2V0VmlzaWJsZVNpemUoeyB3aWR0aDogdmlld3BvcnRTaXplLndpZHRoLCBoZWlnaHQ6IHZpZXdwb3J0U2l6ZS5oZWlnaHQgfSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHNldEVtdWxhdGlvbiAocnVudGltZUluZm8pIHtcbiAgICBjb25zdCB7IGNsaWVudCwgY29uZmlnIH0gPSBydW50aW1lSW5mbztcblxuICAgIGlmIChjb25maWcudXNlckFnZW50ICE9PSB2b2lkIDApXG4gICAgICAgIGF3YWl0IGNsaWVudC5OZXR3b3JrLnNldFVzZXJBZ2VudE92ZXJyaWRlKHsgdXNlckFnZW50OiBjb25maWcudXNlckFnZW50IH0pO1xuXG4gICAgaWYgKGNvbmZpZy50b3VjaCAhPT0gdm9pZCAwKSB7XG4gICAgICAgIGNvbnN0IHRvdWNoQ29uZmlnID0ge1xuICAgICAgICAgICAgZW5hYmxlZDogICAgICAgIGNvbmZpZy50b3VjaCxcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb246ICBjb25maWcubW9iaWxlID8gJ21vYmlsZScgOiAnZGVza3RvcCcsXG4gICAgICAgICAgICBtYXhUb3VjaFBvaW50czogMVxuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChjbGllbnQuRW11bGF0aW9uLnNldEVtaXRUb3VjaEV2ZW50c0Zvck1vdXNlKVxuICAgICAgICAgICAgYXdhaXQgY2xpZW50LkVtdWxhdGlvbi5zZXRFbWl0VG91Y2hFdmVudHNGb3JNb3VzZSh0b3VjaENvbmZpZyk7XG5cbiAgICAgICAgaWYgKGNsaWVudC5FbXVsYXRpb24uc2V0VG91Y2hFbXVsYXRpb25FbmFibGVkKVxuICAgICAgICAgICAgYXdhaXQgY2xpZW50LkVtdWxhdGlvbi5zZXRUb3VjaEVtdWxhdGlvbkVuYWJsZWQodG91Y2hDb25maWcpO1xuICAgIH1cblxuICAgIGF3YWl0IHJlc2l6ZVdpbmRvdyh7IHdpZHRoOiBjb25maWcud2lkdGgsIGhlaWdodDogY29uZmlnLmhlaWdodCB9LCBydW50aW1lSW5mbyk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRTY3JlZW5zaG90RGF0YSAoeyBjbGllbnQgfSkge1xuICAgIGNvbnN0IHNjcmVlbnNob3REYXRhID0gYXdhaXQgY2xpZW50LlBhZ2UuY2FwdHVyZVNjcmVlbnNob3QoKTtcblxuICAgIHJldHVybiBCdWZmZXIuZnJvbShzY3JlZW5zaG90RGF0YS5kYXRhLCAnYmFzZTY0Jyk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjcmVhdGVDbGllbnQgKHJ1bnRpbWVJbmZvKSB7XG4gICAgY29uc3QgeyBicm93c2VySWQsIGNvbmZpZywgY2RwUG9ydCB9ID0gcnVudGltZUluZm87XG5cbiAgICBsZXQgdGFiICAgID0gbnVsbDtcbiAgICBsZXQgY2xpZW50ID0gbnVsbDtcblxuICAgIHRyeSB7XG4gICAgICAgIHRhYiA9IGF3YWl0IGdldEFjdGl2ZVRhYihjZHBQb3J0LCBicm93c2VySWQpO1xuXG4gICAgICAgIGlmICghdGFiKVxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIGNsaWVudCA9IGF3YWl0IHJlbW90ZUNocm9tZSh7IHRhcmdldDogdGFiLCBwb3J0OiBjZHBQb3J0IH0pO1xuICAgIH1cbiAgICBjYXRjaCAoZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgcnVudGltZUluZm8udGFiICAgID0gdGFiO1xuICAgIHJ1bnRpbWVJbmZvLmNsaWVudCA9IGNsaWVudDtcblxuICAgIGF3YWl0IGNsaWVudC5QYWdlLmVuYWJsZSgpO1xuICAgIGF3YWl0IGNsaWVudC5OZXR3b3JrLmVuYWJsZSgpO1xuICAgIGF3YWl0IGNsaWVudC5SdW50aW1lLmVuYWJsZSgpO1xuXG4gICAgY29uc3QgZGV2aWNlUGl4ZWxSYXRpb1F1ZXJ5UmVzdWx0ID0gYXdhaXQgY2xpZW50LlJ1bnRpbWUuZXZhbHVhdGUoeyBleHByZXNzaW9uOiAnd2luZG93LmRldmljZVBpeGVsUmF0aW8nIH0pO1xuXG4gICAgcnVudGltZUluZm8ub3JpZ2luYWxEZXZpY2VQaXhlbFJhdGlvID0gZGV2aWNlUGl4ZWxSYXRpb1F1ZXJ5UmVzdWx0LnJlc3VsdC52YWx1ZTtcbiAgICBydW50aW1lSW5mby5lbXVsYXRlZERldmljZVBpeGVsUmF0aW8gPSBjb25maWcuc2NhbGVGYWN0b3IgfHwgcnVudGltZUluZm8ub3JpZ2luYWxEZXZpY2VQaXhlbFJhdGlvO1xuXG4gICAgaWYgKGNvbmZpZy5lbXVsYXRpb24pXG4gICAgICAgIGF3YWl0IHNldEVtdWxhdGlvbihydW50aW1lSW5mbyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0hlYWRsZXNzVGFiICh7IHRhYiwgY29uZmlnIH0pIHtcbiAgICByZXR1cm4gdGFiICYmIGNvbmZpZy5oZWFkbGVzcztcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNsb3NlVGFiICh7IHRhYiwgY2RwUG9ydCB9KSB7XG4gICAgYXdhaXQgcmVtb3RlQ2hyb21lLmNsb3NlVGFiKHsgaWQ6IHRhYi5pZCwgcG9ydDogY2RwUG9ydCB9KTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHVwZGF0ZU1vYmlsZVZpZXdwb3J0U2l6ZSAocnVudGltZUluZm8pIHtcbiAgICBjb25zdCB3aW5kb3dEaW1lbnNpb25zUXVlcnlSZXN1bHQgPSBhd2FpdCBydW50aW1lSW5mby5jbGllbnQuUnVudGltZS5ldmFsdWF0ZSh7XG4gICAgICAgIGV4cHJlc3Npb246ICAgIGAoJHtHRVRfV0lORE9XX0RJTUVOU0lPTlNfSU5GT19TQ1JJUFR9KSgpYCxcbiAgICAgICAgcmV0dXJuQnlWYWx1ZTogdHJ1ZVxuICAgIH0pO1xuXG4gICAgY29uc3Qgd2luZG93RGltZW5zaW9ucyA9IHdpbmRvd0RpbWVuc2lvbnNRdWVyeVJlc3VsdC5yZXN1bHQudmFsdWU7XG5cbiAgICBydW50aW1lSW5mby52aWV3cG9ydFNpemUud2lkdGggID0gd2luZG93RGltZW5zaW9ucy5vdXRlcldpZHRoO1xuICAgIHJ1bnRpbWVJbmZvLnZpZXdwb3J0U2l6ZS5oZWlnaHQgPSB3aW5kb3dEaW1lbnNpb25zLm91dGVySGVpZ2h0O1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVzaXplV2luZG93IChuZXdEaW1lbnNpb25zLCBydW50aW1lSW5mbykge1xuICAgIGNvbnN0IHsgYnJvd3NlcklkLCBjb25maWcsIHZpZXdwb3J0U2l6ZSwgcHJvdmlkZXJNZXRob2RzIH0gPSBydW50aW1lSW5mbztcblxuICAgIGNvbnN0IGN1cnJlbnRXaWR0aCAgPSB2aWV3cG9ydFNpemUud2lkdGg7XG4gICAgY29uc3QgY3VycmVudEhlaWdodCA9IHZpZXdwb3J0U2l6ZS5oZWlnaHQ7XG4gICAgY29uc3QgbmV3V2lkdGggICAgICA9IG5ld0RpbWVuc2lvbnMud2lkdGggfHwgY3VycmVudFdpZHRoO1xuICAgIGNvbnN0IG5ld0hlaWdodCAgICAgPSBuZXdEaW1lbnNpb25zLmhlaWdodCB8fCBjdXJyZW50SGVpZ2h0O1xuXG4gICAgaWYgKCFjb25maWcuaGVhZGxlc3MpXG4gICAgICAgIGF3YWl0IHByb3ZpZGVyTWV0aG9kcy5yZXNpemVMb2NhbEJyb3dzZXJXaW5kb3coYnJvd3NlcklkLCBuZXdXaWR0aCwgbmV3SGVpZ2h0LCBjdXJyZW50V2lkdGgsIGN1cnJlbnRIZWlnaHQpO1xuXG4gICAgdmlld3BvcnRTaXplLndpZHRoICA9IG5ld1dpZHRoO1xuICAgIHZpZXdwb3J0U2l6ZS5oZWlnaHQgPSBuZXdIZWlnaHQ7XG5cbiAgICBpZiAoY29uZmlnLmVtdWxhdGlvbilcbiAgICAgICAgYXdhaXQgc2V0RW11bGF0aW9uQm91bmRzKHJ1bnRpbWVJbmZvKTtcbn1cbiJdfQ==
