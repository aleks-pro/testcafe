'use strict';

exports.__esModule = true;

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _testcafeBrowserTools = require('testcafe-browser-tools');

var _utils = require('./commands/utils');

var _type = require('./commands/type');

var _type2 = _interopRequireDefault(_type);

var _warningMessage = require('../notifications/warning-message');

var _warningMessage2 = _interopRequireDefault(_warningMessage);

var _testRun = require('../errors/test-run/');

var _types = require('../errors/types');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class BrowserManipulationQueue {
    constructor(browserConnection, screenshotCapturer, warningLog) {
        this.commands = [];
        this.browserId = browserConnection.id;
        this.browserProvider = browserConnection.provider;
        this.screenshotCapturer = screenshotCapturer;
        this.warningLog = warningLog;
    }

    _resizeWindow(width, height, currentWidth, currentHeight) {
        var _this = this;

        return (0, _asyncToGenerator3.default)(function* () {
            const canResizeWindow = yield _this.browserProvider.canResizeWindowToDimensions(_this.browserId, width, height);

            if (!canResizeWindow) throw new _testRun.WindowDimensionsOverflowError();

            try {
                return yield _this.browserProvider.resizeWindow(_this.browserId, width, height, currentWidth, currentHeight);
            } catch (err) {
                _this.warningLog.addWarning(_warningMessage2.default.resizeError, err.message);
                return null;
            }
        })();
    }

    _resizeWindowToFitDevice(device, portrait, currentWidth, currentHeight) {
        var _this2 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            var _getViewportSize = (0, _testcafeBrowserTools.getViewportSize)(device);

            const landscapeWidth = _getViewportSize.landscapeWidth,
                  portraitWidth = _getViewportSize.portraitWidth;


            const width = portrait ? portraitWidth : landscapeWidth;
            const height = portrait ? landscapeWidth : portraitWidth;

            return yield _this2._resizeWindow(width, height, currentWidth, currentHeight);
        })();
    }

    _maximizeWindow() {
        var _this3 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            try {
                return yield _this3.browserProvider.maximizeWindow(_this3.browserId);
            } catch (err) {
                _this3.warningLog.addWarning(_warningMessage2.default.maximizeError, err.message);
                return null;
            }
        })();
    }

    _takeScreenshot(capture) {
        var _this4 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            if (!_this4.screenshotCapturer.enabled) {
                _this4.warningLog.addWarning(_warningMessage2.default.screenshotsPathNotSpecified);
                return null;
            }

            try {
                return yield capture();
            } catch (err) {
                if (err.code === _types.TEST_RUN_ERRORS.invalidElementScreenshotDimensionsError) throw err;

                _this4.warningLog.addWarning(_warningMessage2.default.screenshotError, err.stack);
                return null;
            }
        })();
    }

    executePendingManipulation(driverMsg) {
        var _this5 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            const command = _this5.commands.shift();

            switch (command.type) {
                case _type2.default.takeElementScreenshot:
                case _type2.default.takeScreenshot:
                    return yield _this5._takeScreenshot(function () {
                        return _this5.screenshotCapturer.captureAction({
                            customPath: command.path,
                            pageDimensions: driverMsg.pageDimensions,
                            cropDimensions: driverMsg.cropDimensions,
                            markSeed: command.markSeed
                        });
                    });

                case _type2.default.takeScreenshotOnFail:
                    return yield _this5._takeScreenshot(function () {
                        return _this5.screenshotCapturer.captureError({
                            pageDimensions: driverMsg.pageDimensions,
                            markSeed: command.markSeed
                        });
                    });

                case _type2.default.resizeWindow:
                    return yield _this5._resizeWindow(command.width, command.height, driverMsg.pageDimensions.innerWidth, driverMsg.pageDimensions.innerHeight);

                case _type2.default.resizeWindowToFitDevice:
                    return yield _this5._resizeWindowToFitDevice(command.device, command.options.portraitOrientation, driverMsg.pageDimensions.innerWidth, driverMsg.pageDimensions.innerHeight);

                case _type2.default.maximizeWindow:
                    return yield _this5._maximizeWindow();
            }

            return null;
        })();
    }

    push(command) {
        this.commands.push(command);
    }

    removeAllNonServiceManipulations() {
        this.commands = this.commands.filter(command => (0, _utils.isServiceCommand)(command));
    }
}
exports.default = BrowserManipulationQueue;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90ZXN0LXJ1bi9icm93c2VyLW1hbmlwdWxhdGlvbi1xdWV1ZS5qcyJdLCJuYW1lcyI6WyJCcm93c2VyTWFuaXB1bGF0aW9uUXVldWUiLCJjb25zdHJ1Y3RvciIsImJyb3dzZXJDb25uZWN0aW9uIiwic2NyZWVuc2hvdENhcHR1cmVyIiwid2FybmluZ0xvZyIsImNvbW1hbmRzIiwiYnJvd3NlcklkIiwiaWQiLCJicm93c2VyUHJvdmlkZXIiLCJwcm92aWRlciIsIl9yZXNpemVXaW5kb3ciLCJ3aWR0aCIsImhlaWdodCIsImN1cnJlbnRXaWR0aCIsImN1cnJlbnRIZWlnaHQiLCJjYW5SZXNpemVXaW5kb3ciLCJjYW5SZXNpemVXaW5kb3dUb0RpbWVuc2lvbnMiLCJyZXNpemVXaW5kb3ciLCJlcnIiLCJhZGRXYXJuaW5nIiwicmVzaXplRXJyb3IiLCJtZXNzYWdlIiwiX3Jlc2l6ZVdpbmRvd1RvRml0RGV2aWNlIiwiZGV2aWNlIiwicG9ydHJhaXQiLCJsYW5kc2NhcGVXaWR0aCIsInBvcnRyYWl0V2lkdGgiLCJfbWF4aW1pemVXaW5kb3ciLCJtYXhpbWl6ZVdpbmRvdyIsIm1heGltaXplRXJyb3IiLCJfdGFrZVNjcmVlbnNob3QiLCJjYXB0dXJlIiwiZW5hYmxlZCIsInNjcmVlbnNob3RzUGF0aE5vdFNwZWNpZmllZCIsImNvZGUiLCJpbnZhbGlkRWxlbWVudFNjcmVlbnNob3REaW1lbnNpb25zRXJyb3IiLCJzY3JlZW5zaG90RXJyb3IiLCJzdGFjayIsImV4ZWN1dGVQZW5kaW5nTWFuaXB1bGF0aW9uIiwiZHJpdmVyTXNnIiwiY29tbWFuZCIsInNoaWZ0IiwidHlwZSIsInRha2VFbGVtZW50U2NyZWVuc2hvdCIsInRha2VTY3JlZW5zaG90IiwiY2FwdHVyZUFjdGlvbiIsImN1c3RvbVBhdGgiLCJwYXRoIiwicGFnZURpbWVuc2lvbnMiLCJjcm9wRGltZW5zaW9ucyIsIm1hcmtTZWVkIiwidGFrZVNjcmVlbnNob3RPbkZhaWwiLCJjYXB0dXJlRXJyb3IiLCJpbm5lcldpZHRoIiwiaW5uZXJIZWlnaHQiLCJyZXNpemVXaW5kb3dUb0ZpdERldmljZSIsIm9wdGlvbnMiLCJwb3J0cmFpdE9yaWVudGF0aW9uIiwicHVzaCIsInJlbW92ZUFsbE5vblNlcnZpY2VNYW5pcHVsYXRpb25zIiwiZmlsdGVyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBOztBQUNBOztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7OztBQUdlLE1BQU1BLHdCQUFOLENBQStCO0FBQzFDQyxnQkFBYUMsaUJBQWIsRUFBZ0NDLGtCQUFoQyxFQUFvREMsVUFBcEQsRUFBZ0U7QUFDNUQsYUFBS0MsUUFBTCxHQUEwQixFQUExQjtBQUNBLGFBQUtDLFNBQUwsR0FBMEJKLGtCQUFrQkssRUFBNUM7QUFDQSxhQUFLQyxlQUFMLEdBQTBCTixrQkFBa0JPLFFBQTVDO0FBQ0EsYUFBS04sa0JBQUwsR0FBMEJBLGtCQUExQjtBQUNBLGFBQUtDLFVBQUwsR0FBMEJBLFVBQTFCO0FBQ0g7O0FBRUtNLGlCQUFOLENBQXFCQyxLQUFyQixFQUE0QkMsTUFBNUIsRUFBb0NDLFlBQXBDLEVBQWtEQyxhQUFsRCxFQUFpRTtBQUFBOztBQUFBO0FBQzdELGtCQUFNQyxrQkFBa0IsTUFBTSxNQUFLUCxlQUFMLENBQXFCUSwyQkFBckIsQ0FBaUQsTUFBS1YsU0FBdEQsRUFBaUVLLEtBQWpFLEVBQXdFQyxNQUF4RSxDQUE5Qjs7QUFFQSxnQkFBSSxDQUFDRyxlQUFMLEVBQ0ksTUFBTSw0Q0FBTjs7QUFFSixnQkFBSTtBQUNBLHVCQUFPLE1BQU0sTUFBS1AsZUFBTCxDQUFxQlMsWUFBckIsQ0FBa0MsTUFBS1gsU0FBdkMsRUFBa0RLLEtBQWxELEVBQXlEQyxNQUF6RCxFQUFpRUMsWUFBakUsRUFBK0VDLGFBQS9FLENBQWI7QUFDSCxhQUZELENBR0EsT0FBT0ksR0FBUCxFQUFZO0FBQ1Isc0JBQUtkLFVBQUwsQ0FBZ0JlLFVBQWhCLENBQTJCLHlCQUFnQkMsV0FBM0MsRUFBd0RGLElBQUlHLE9BQTVEO0FB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QUFNLE9BQUtqQyx3QkFBTCxDQUE4QmtCLFFBQVFqQixNQUF0QyxFQUE4Q2lCLFFBQVFnQixPQUFSLENBQWdCQyxtQkFBOUQsRUFBbUZsQixVQUFVUyxjQUFWLENBQXlCSyxVQUE1RyxFQUF3SGQsVUFBVVMsY0FBVixDQUF5Qk0sV0FBakosQ0FBYjs7QUFFSixxQkFBSyxlQUFhMUIsY0FBbEI7QUFDSSwyQkFBTyxNQUFNLE9BQUtELGVBQUwsRUFBYjtBQXZCUjs7QUEwQkEsbUJBQU8sSUFBUDtBQTdCeUM7QUE4QjVDOztBQUVEK0IsU0FBTWxCLE9BQU4sRUFBZTtBQUNYLGFBQUtuQyxRQUFMLENBQWNxRCxJQUFkLENBQW1CbEIsT0FBbkI7QUFDSDs7QUFFRG1CLHVDQUFvQztBQUNoQyxhQUFLdEQsUUFBTCxHQUFnQixLQUFLQSxRQUFMLENBQWN1RCxNQUFkLENBQXFCcEIsV0FBVyw2QkFBaUJBLE9BQWpCLENBQWhDLENBQWhCO0FBQ0g7QUFuR3lDO2tCQUF6QnhDLHdCIiwiZmlsZSI6InRlc3QtcnVuL2Jyb3dzZXItbWFuaXB1bGF0aW9uLXF1ZXVlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZ2V0Vmlld3BvcnRTaXplIH0gZnJvbSAndGVzdGNhZmUtYnJvd3Nlci10b29scyc7XG5pbXBvcnQgeyBpc1NlcnZpY2VDb21tYW5kIH0gZnJvbSAnLi9jb21tYW5kcy91dGlscyc7XG5pbXBvcnQgQ09NTUFORF9UWVBFIGZyb20gJy4vY29tbWFuZHMvdHlwZSc7XG5pbXBvcnQgV0FSTklOR19NRVNTQUdFIGZyb20gJy4uL25vdGlmaWNhdGlvbnMvd2FybmluZy1tZXNzYWdlJztcbmltcG9ydCB7IFdpbmRvd0RpbWVuc2lvbnNPdmVyZmxvd0Vycm9yIH0gZnJvbSAnLi4vZXJyb3JzL3Rlc3QtcnVuLyc7XG5pbXBvcnQgeyBURVNUX1JVTl9FUlJPUlMgfSBmcm9tICcuLi9lcnJvcnMvdHlwZXMnO1xuXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJyb3dzZXJNYW5pcHVsYXRpb25RdWV1ZSB7XG4gICAgY29uc3RydWN0b3IgKGJyb3dzZXJDb25uZWN0aW9uLCBzY3JlZW5zaG90Q2FwdHVyZXIsIHdhcm5pbmdMb2cpIHtcbiAgICAgICAgdGhpcy5jb21tYW5kcyAgICAgICAgICAgPSBbXTtcbiAgICAgICAgdGhpcy5icm93c2VySWQgICAgICAgICAgPSBicm93c2VyQ29ubmVjdGlvbi5pZDtcbiAgICAgICAgdGhpcy5icm93c2VyUHJvdmlkZXIgICAgPSBicm93c2VyQ29ubmVjdGlvbi5wcm92aWRlcjtcbiAgICAgICAgdGhpcy5zY3JlZW5zaG90Q2FwdHVyZXIgPSBzY3JlZW5zaG90Q2FwdHVyZXI7XG4gICAgICAgIHRoaXMud2FybmluZ0xvZyAgICAgICAgID0gd2FybmluZ0xvZztcbiAgICB9XG5cbiAgICBhc3luYyBfcmVzaXplV2luZG93ICh3aWR0aCwgaGVpZ2h0LCBjdXJyZW50V2lkdGgsIGN1cnJlbnRIZWlnaHQpIHtcbiAgICAgICAgY29uc3QgY2FuUmVzaXplV2luZG93ID0gYXdhaXQgdGhpcy5icm93c2VyUHJvdmlkZXIuY2FuUmVzaXplV2luZG93VG9EaW1lbnNpb25zKHRoaXMuYnJvd3NlcklkLCB3aWR0aCwgaGVpZ2h0KTtcblxuICAgICAgICBpZiAoIWNhblJlc2l6ZVdpbmRvdylcbiAgICAgICAgICAgIHRocm93IG5ldyBXaW5kb3dEaW1lbnNpb25zT3ZlcmZsb3dFcnJvcigpO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5icm93c2VyUHJvdmlkZXIucmVzaXplV2luZG93KHRoaXMuYnJvd3NlcklkLCB3aWR0aCwgaGVpZ2h0LCBjdXJyZW50V2lkdGgsIGN1cnJlbnRIZWlnaHQpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIHRoaXMud2FybmluZ0xvZy5hZGRXYXJuaW5nKFdBUk5JTkdfTUVTU0FHRS5yZXNpemVFcnJvciwgZXJyLm1lc3NhZ2UpO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhc3luYyBfcmVzaXplV2luZG93VG9GaXREZXZpY2UgKGRldmljZSwgcG9ydHJhaXQsIGN1cnJlbnRXaWR0aCwgY3VycmVudEhlaWdodCkge1xuICAgICAgICBjb25zdCB7IGxhbmRzY2FwZVdpZHRoLCBwb3J0cmFpdFdpZHRoIH0gPSBnZXRWaWV3cG9ydFNpemUoZGV2aWNlKTtcblxuICAgICAgICBjb25zdCB3aWR0aCAgPSBwb3J0cmFpdCA/IHBvcnRyYWl0V2lkdGggOiBsYW5kc2NhcGVXaWR0aDtcbiAgICAgICAgY29uc3QgaGVpZ2h0ID0gcG9ydHJhaXQgPyBsYW5kc2NhcGVXaWR0aCA6IHBvcnRyYWl0V2lkdGg7XG5cbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuX3Jlc2l6ZVdpbmRvdyh3aWR0aCwgaGVpZ2h0LCBjdXJyZW50V2lkdGgsIGN1cnJlbnRIZWlnaHQpO1xuICAgIH1cblxuICAgIGFzeW5jIF9tYXhpbWl6ZVdpbmRvdyAoKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5icm93c2VyUHJvdmlkZXIubWF4aW1pemVXaW5kb3codGhpcy5icm93c2VySWQpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIHRoaXMud2FybmluZ0xvZy5hZGRXYXJuaW5nKFdBUk5JTkdfTUVTU0FHRS5tYXhpbWl6ZUVycm9yLCBlcnIubWVzc2FnZSk7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFzeW5jIF90YWtlU2NyZWVuc2hvdCAoY2FwdHVyZSkge1xuICAgICAgICBpZiAoIXRoaXMuc2NyZWVuc2hvdENhcHR1cmVyLmVuYWJsZWQpIHtcbiAgICAgICAgICAgIHRoaXMud2FybmluZ0xvZy5hZGRXYXJuaW5nKFdBUk5JTkdfTUVTU0FHRS5zY3JlZW5zaG90c1BhdGhOb3RTcGVjaWZpZWQpO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcmV0dXJuIGF3YWl0IGNhcHR1cmUoKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBpZiAoZXJyLmNvZGUgPT09IFRFU1RfUlVOX0VSUk9SUy5pbnZhbGlkRWxlbWVudFNjcmVlbnNob3REaW1lbnNpb25zRXJyb3IpXG4gICAgICAgICAgICAgICAgdGhyb3cgZXJyO1xuXG4gICAgICAgICAgICB0aGlzLndhcm5pbmdMb2cuYWRkV2FybmluZyhXQVJOSU5HX01FU1NBR0Uuc2NyZWVuc2hvdEVycm9yLCBlcnIuc3RhY2spO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhc3luYyBleGVjdXRlUGVuZGluZ01hbmlwdWxhdGlvbiAoZHJpdmVyTXNnKSB7XG4gICAgICAgIGNvbnN0IGNvbW1hbmQgPSB0aGlzLmNvbW1hbmRzLnNoaWZ0KCk7XG5cbiAgICAgICAgc3dpdGNoIChjb21tYW5kLnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgQ09NTUFORF9UWVBFLnRha2VFbGVtZW50U2NyZWVuc2hvdDpcbiAgICAgICAgICAgIGNhc2UgQ09NTUFORF9UWVBFLnRha2VTY3JlZW5zaG90OlxuICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLl90YWtlU2NyZWVuc2hvdCgoKSA9PiB0aGlzLnNjcmVlbnNob3RDYXB0dXJlci5jYXB0dXJlQWN0aW9uKHtcbiAgICAgICAgICAgICAgICAgICAgY3VzdG9tUGF0aDogICAgIGNvbW1hbmQucGF0aCxcbiAgICAgICAgICAgICAgICAgICAgcGFnZURpbWVuc2lvbnM6IGRyaXZlck1zZy5wYWdlRGltZW5zaW9ucyxcbiAgICAgICAgICAgICAgICAgICAgY3JvcERpbWVuc2lvbnM6IGRyaXZlck1zZy5jcm9wRGltZW5zaW9ucyxcbiAgICAgICAgICAgICAgICAgICAgbWFya1NlZWQ6ICAgICAgIGNvbW1hbmQubWFya1NlZWRcbiAgICAgICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICAgIGNhc2UgQ09NTUFORF9UWVBFLnRha2VTY3JlZW5zaG90T25GYWlsOlxuICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLl90YWtlU2NyZWVuc2hvdCgoKSA9PiB0aGlzLnNjcmVlbnNob3RDYXB0dXJlci5jYXB0dXJlRXJyb3Ioe1xuICAgICAgICAgICAgICAgICAgICBwYWdlRGltZW5zaW9uczogZHJpdmVyTXNnLnBhZ2VEaW1lbnNpb25zLFxuICAgICAgICAgICAgICAgICAgICBtYXJrU2VlZDogICAgICAgY29tbWFuZC5tYXJrU2VlZFxuICAgICAgICAgICAgICAgIH0pKTtcblxuICAgICAgICAgICAgY2FzZSBDT01NQU5EX1RZUEUucmVzaXplV2luZG93OlxuICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLl9yZXNpemVXaW5kb3coY29tbWFuZC53aWR0aCwgY29tbWFuZC5oZWlnaHQsIGRyaXZlck1zZy5wYWdlRGltZW5zaW9ucy5pbm5lcldpZHRoLCBkcml2ZXJNc2cucGFnZURpbWVuc2lvbnMuaW5uZXJIZWlnaHQpO1xuXG4gICAgICAgICAgICBjYXNlIENPTU1BTkRfVFlQRS5yZXNpemVXaW5kb3dUb0ZpdERldmljZTpcbiAgICAgICAgICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5fcmVzaXplV2luZG93VG9GaXREZXZpY2UoY29tbWFuZC5kZXZpY2UsIGNvbW1hbmQub3B0aW9ucy5wb3J0cmFpdE9yaWVudGF0aW9uLCBkcml2ZXJNc2cucGFnZURpbWVuc2lvbnMuaW5uZXJXaWR0aCwgZHJpdmVyTXNnLnBhZ2VEaW1lbnNpb25zLmlubmVySGVpZ2h0KTtcblxuICAgICAgICAgICAgY2FzZSBDT01NQU5EX1RZUEUubWF4aW1pemVXaW5kb3c6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuX21heGltaXplV2luZG93KCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBwdXNoIChjb21tYW5kKSB7XG4gICAgICAgIHRoaXMuY29tbWFuZHMucHVzaChjb21tYW5kKTtcbiAgICB9XG5cbiAgICByZW1vdmVBbGxOb25TZXJ2aWNlTWFuaXB1bGF0aW9ucyAoKSB7XG4gICAgICAgIHRoaXMuY29tbWFuZHMgPSB0aGlzLmNvbW1hbmRzLmZpbHRlcihjb21tYW5kID0+IGlzU2VydmljZUNvbW1hbmQoY29tbWFuZCkpO1xuICAgIH1cbn1cbiJdfQ==
