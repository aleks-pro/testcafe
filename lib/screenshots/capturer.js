'use strict';

exports.__esModule = true;

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _path = require('path');

var _testcafeBrowserTools = require('testcafe-browser-tools');

var _crop = require('./crop');

var _makeDir = require('make-dir');

var _makeDir2 = _interopRequireDefault(_makeDir);

var _asyncQueue = require('../utils/async-queue');

var _warningMessage = require('../notifications/warning-message');

var _warningMessage2 = _interopRequireDefault(_warningMessage);

var _escapeUserAgent = require('../utils/escape-user-agent');

var _escapeUserAgent2 = _interopRequireDefault(_escapeUserAgent);

var _correctFilePath = require('../utils/correct-file-path');

var _correctFilePath2 = _interopRequireDefault(_correctFilePath);

var _promisifiedFunctions = require('../utils/promisified-functions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Capturer {
    constructor(baseScreenshotsPath, testEntry, connection, pathPattern, warningLog) {
        this.enabled = !!baseScreenshotsPath;
        this.baseScreenshotsPath = baseScreenshotsPath;
        this.testEntry = testEntry;
        this.provider = connection.provider;
        this.browserId = connection.id;
        this.warningLog = warningLog;
        this.pathPattern = pathPattern;
    }

    static _getDimensionWithoutScrollbar(fullDimension, documentDimension, bodyDimension) {
        if (bodyDimension > fullDimension) return documentDimension;

        if (documentDimension > fullDimension) return bodyDimension;

        return Math.max(documentDimension, bodyDimension);
    }

    static _getCropDimensions(cropDimensions, pageDimensions) {
        if (!cropDimensions || !pageDimensions) return null;

        const dpr = pageDimensions.dpr;
        const top = cropDimensions.top,
              left = cropDimensions.left,
              bottom = cropDimensions.bottom,
              right = cropDimensions.right;


        return {
            top: Math.round(top * dpr),
            left: Math.round(left * dpr),
            bottom: Math.round(bottom * dpr),
            right: Math.round(right * dpr)
        };
    }

    static _getClientAreaDimensions(pageDimensions) {
        if (!pageDimensions) return null;

        const innerWidth = pageDimensions.innerWidth,
              documentWidth = pageDimensions.documentWidth,
              bodyWidth = pageDimensions.bodyWidth,
              innerHeight = pageDimensions.innerHeight,
              documentHeight = pageDimensions.documentHeight,
              bodyHeight = pageDimensions.bodyHeight,
              dpr = pageDimensions.dpr;


        return {
            width: Math.floor(Capturer._getDimensionWithoutScrollbar(innerWidth, documentWidth, bodyWidth) * dpr),
            height: Math.floor(Capturer._getDimensionWithoutScrollbar(innerHeight, documentHeight, bodyHeight) * dpr)
        };
    }

    static _isScreenshotCaptured(screenshotPath) {
        return (0, _asyncToGenerator3.default)(function* () {
            try {
                const stats = yield (0, _promisifiedFunctions.stat)(screenshotPath);

                return stats.isFile();
            } catch (e) {
                return false;
            }
        })();
    }

    _joinWithBaseScreenshotPath(path) {
        return (0, _path.join)(this.baseScreenshotsPath, path);
    }

    _incrementFileIndexes(forError) {
        if (forError) this.pathPattern.data.errorFileIndex++;else this.pathPattern.data.fileIndex++;
    }

    _getCustomScreenshotPath(customPath) {
        const correctedCustomPath = (0, _correctFilePath2.default)(customPath);

        return this._joinWithBaseScreenshotPath(correctedCustomPath);
    }

    _getScreenshotPath(forError) {
        const path = this.pathPattern.getPath(forError);

        this._incrementFileIndexes(forError);

        return this._joinWithBaseScreenshotPath(path);
    }

    _getThumbnailPath(screenshotPath) {
        const imageName = (0, _path.basename)(screenshotPath);
        const imageDir = (0, _path.dirname)(screenshotPath);

        return (0, _path.join)(imageDir, 'thumbnails', imageName);
    }

    _takeScreenshot(filePath, pageWidth, pageHeight) {
        var _this = this;

        return (0, _asyncToGenerator3.default)(function* () {
            yield (0, _makeDir2.default)((0, _path.dirname)(filePath));
            yield _this.provider.takeScreenshot(_this.browserId, filePath, pageWidth, pageHeight);
        })();
    }

    _capture(forError, { pageDimensions, cropDimensions, markSeed, customPath } = {}) {
        var _this2 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            if (!_this2.enabled) return null;

            const screenshotPath = customPath ? _this2._getCustomScreenshotPath(customPath) : _this2._getScreenshotPath(forError);
            const thumbnailPath = _this2._getThumbnailPath(screenshotPath);

            if ((0, _asyncQueue.isInQueue)(screenshotPath)) _this2.warningLog.addWarning(_warningMessage2.default.screenshotRewritingError, screenshotPath);

            yield (0, _asyncQueue.addToQueue)(screenshotPath, (0, _asyncToGenerator3.default)(function* () {
                const clientAreaDimensions = Capturer._getClientAreaDimensions(pageDimensions);

                yield _this2._takeScreenshot(screenshotPath, ...(clientAreaDimensions ? [clientAreaDimensions.width, clientAreaDimensions.height] : []));

                if (!(yield Capturer._isScreenshotCaptured(screenshotPath))) return;

                try {
                    const image = yield (0, _promisifiedFunctions.readPngFile)(screenshotPath);

                    const croppedImage = yield (0, _crop.cropScreenshot)(image, {
                        markSeed,
                        clientAreaDimensions,

                        path: screenshotPath,
                        cropDimensions: Capturer._getCropDimensions(cropDimensions, pageDimensions)
                    });

                    if (croppedImage) yield (0, _promisifiedFunctions.writePng)(screenshotPath, croppedImage);
                } catch (err) {
                    yield (0, _promisifiedFunctions.deleteFile)(screenshotPath);

                    throw err;
                }

                yield (0, _testcafeBrowserTools.generateThumbnail)(screenshotPath, thumbnailPath);
            }));

            const screenshot = {
                screenshotPath,
                thumbnailPath,
                userAgent: (0, _escapeUserAgent2.default)(_this2.pathPattern.data.parsedUserAgent),
                quarantineAttempt: _this2.pathPattern.data.quarantineAttempt,
                takenOnFail: forError
            };

            _this2.testEntry.screenshots.push(screenshot);

            return screenshotPath;
        })();
    }

    captureAction(options) {
        var _this3 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            return yield _this3._capture(false, options);
        })();
    }

    captureError(options) {
        var _this4 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            return yield _this4._capture(true, options);
        })();
    }
}
exports.default = Capturer;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zY3JlZW5zaG90cy9jYXB0dXJlci5qcyJdLCJuYW1lcyI6WyJDYXB0dXJlciIsImNvbnN0cnVjdG9yIiwiYmFzZVNjcmVlbnNob3RzUGF0aCIsInRlc3RFbnRyeSIsImNvbm5lY3Rpb24iLCJwYXRoUGF0dGVybiIsIndhcm5pbmdMb2ciLCJlbmFibGVkIiwicHJvdmlkZXIiLCJicm93c2VySWQiLCJpZCIsIl9nZXREaW1lbnNpb25XaXRob3V0U2Nyb2xsYmFyIiwiZnVsbERpbWVuc2lvbiIsImRvY3VtZW50RGltZW5zaW9uIiwiYm9keURpbWVuc2lvbiIsIk1hdGgiLCJtYXgiLCJfZ2V0Q3JvcERpbWVuc2lvbnMiLCJjcm9wRGltZW5zaW9ucyIsInBhZ2VEaW1lbnNpb25zIiwiZHByIiwidG9wIiwibGVmdCIsImJvdHRvbSIsInJpZ2h0Iiwicm91bmQiLCJfZ2V0Q2xpZW50QXJlYURpbWVuc2lvbnMiLCJpbm5lcldpZHRoIiwiZG9jdW1lbnRXaWR0aCIsImJvZHlXaWR0aCIsImlubmVySGVpZ2h0IiwiZG9jdW1lbnRIZWlnaHQiLCJib2R5SGVpZ2h0Iiwid2lkdGgiLCJmbG9vciIsImhlaWdodCIsIl9pc1NjcmVlbnNob3RDYXB0dXJlZCIsInNjcmVlbnNob3RQYXRoIiwic3RhdHMiLCJpc0ZpbGUiLCJlIiwiX2pvaW5XaXRoQmFzZVNjcmVlbnNob3RQYXRoIiwicGF0aCIsIl9pbmNyZW1lbnRGaWxlSW5kZXhlcyIsImZvckVycm9yIiwiZGF0YSIsImVycm9yRmlsZUluZGV4IiwiZmlsZUluZGV4IiwiX2dldEN1c3RvbVNjcmVlbnNob3RQYXRoIiwiY3VzdG9tUGF0aCIsImNvcnJlY3RlZEN1c3RvbVBhdGgiLCJfZ2V0U2NyZWVuc2hvdFBhdGgiLCJnZXRQYXRoIiwiX2dldFRodW1ibmFpbFBhdGgiLCJpbWFnZU5hbWUiLCJpbWFnZURpciIsIl90YWtlU2NyZWVuc2hvdCIsImZpbGVQYXRoIiwicGFnZVdpZHRoIiwicGFnZUhlaWdodCIsInRha2VTY3JlZW5zaG90IiwiX2NhcHR1cmUiLCJtYXJrU2VlZCIsInRodW1ibmFpbFBhdGgiLCJhZGRXYXJuaW5nIiwic2NyZWVuc2hvdFJld3JpdGluZ0Vycm9yIiwiY2xpZW50QXJlYURpbWVuc2lvbnMiLCJpbWFnZSIsImNyb3BwZWRJbWFnZSIsImVyciIsInNjcmVlbnNob3QiLCJ1c2VyQWdlbnQiLCJwYXJzZWRVc2VyQWdlbnQiLCJxdWFyYW50aW5lQXR0ZW1wdCIsInRha2VuT25GYWlsIiwic2NyZWVuc2hvdHMiLCJwdXNoIiwiY2FwdHVyZUFjdGlvbiIsIm9wdGlvbnMiLCJjYXB0dXJlRXJyb3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUdlLE1BQU1BLFFBQU4sQ0FBZTtBQUMxQkMsZ0JBQWFDLG1CQUFiLEVBQWtDQyxTQUFsQyxFQUE2Q0MsVUFBN0MsRUFBeURDLFdBQXpELEVBQXNFQyxVQUF0RSxFQUFrRjtBQUM5RSxhQUFLQyxPQUFMLEdBQTJCLENBQUMsQ0FBQ0wsbUJBQTdCO0FBQ0EsYUFBS0EsbUJBQUwsR0FBMkJBLG1CQUEzQjtBQUNBLGFBQUtDLFNBQUwsR0FBMkJBLFNBQTNCO0FBQ0EsYUFBS0ssUUFBTCxHQUEyQkosV0FBV0ksUUFBdEM7QUFDQSxhQUFLQyxTQUFMLEdBQTJCTCxXQUFXTSxFQUF0QztBQUNBLGFBQUtKLFVBQUwsR0FBMkJBLFVBQTNCO0FBQ0EsYUFBS0QsV0FBTCxHQUEyQkEsV0FBM0I7QUFDSDs7QUFFRCxXQUFPTSw2QkFBUCxDQUFzQ0MsYUFBdEMsRUFBcURDLGlCQUFyRCxFQUF3RUMsYUFBeEUsRUFBdUY7QUFDbkYsWUFBSUEsZ0JBQWdCRixhQUFwQixFQUNJLE9BQU9DLGlCQUFQOztBQUVKLFlBQUlBLG9CQUFvQkQsYUFBeEIsRUFDSSxPQUFPRSxhQUFQOztBQUVKLGVBQU9DLEtBQUtDLEdBQUwsQ0FBU0gsaUJBQVQsRUFBNEJDLGFBQTVC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QUFuRHFGO0FBb0R4Rjs7QUFFS3dDLGlCQUFOLENBQXFCQyxPQUFyQixFQUE4QjtBQUFBOztBQUFBO0FBQzFCLG1CQUFPLE1BQU0sT0FBS2pCLFFBQUwsQ0FBYyxLQUFkLEVBQXFCaUIsT0FBckIsQ0FBYjtBQUQwQjtBQUU3Qjs7QUFFS0MsZ0JBQU4sQ0FBb0JELE9BQXBCLEVBQTZCO0FBQUE7O0FBQUE7QUFDekIsbUJBQU8sTUFBTSxPQUFLakIsUUFBTCxDQUFjLElBQWQsRUFBb0JpQixPQUFwQixDQUFiO0FBRHlCO0FBRTVCO0FBN0p5QjtrQkFBVDlFLFEiLCJmaWxlIjoic2NyZWVuc2hvdHMvY2FwdHVyZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBqb2luIGFzIGpvaW5QYXRoLCBkaXJuYW1lLCBiYXNlbmFtZSB9IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgZ2VuZXJhdGVUaHVtYm5haWwgfSBmcm9tICd0ZXN0Y2FmZS1icm93c2VyLXRvb2xzJztcbmltcG9ydCB7IGNyb3BTY3JlZW5zaG90IH0gZnJvbSAnLi9jcm9wJztcbmltcG9ydCBtYWtlRGlyIGZyb20gJ21ha2UtZGlyJztcbmltcG9ydCB7IGlzSW5RdWV1ZSwgYWRkVG9RdWV1ZSB9IGZyb20gJy4uL3V0aWxzL2FzeW5jLXF1ZXVlJztcbmltcG9ydCBXQVJOSU5HX01FU1NBR0UgZnJvbSAnLi4vbm90aWZpY2F0aW9ucy93YXJuaW5nLW1lc3NhZ2UnO1xuaW1wb3J0IGVzY2FwZVVzZXJBZ2VudCBmcm9tICcuLi91dGlscy9lc2NhcGUtdXNlci1hZ2VudCc7XG5pbXBvcnQgY29ycmVjdEZpbGVQYXRoIGZyb20gJy4uL3V0aWxzL2NvcnJlY3QtZmlsZS1wYXRoJztcbmltcG9ydCB7IHJlYWRQbmdGaWxlLCBkZWxldGVGaWxlLCBzdGF0LCB3cml0ZVBuZyB9IGZyb20gJy4uL3V0aWxzL3Byb21pc2lmaWVkLWZ1bmN0aW9ucyc7XG5cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2FwdHVyZXIge1xuICAgIGNvbnN0cnVjdG9yIChiYXNlU2NyZWVuc2hvdHNQYXRoLCB0ZXN0RW50cnksIGNvbm5lY3Rpb24sIHBhdGhQYXR0ZXJuLCB3YXJuaW5nTG9nKSB7XG4gICAgICAgIHRoaXMuZW5hYmxlZCAgICAgICAgICAgICA9ICEhYmFzZVNjcmVlbnNob3RzUGF0aDtcbiAgICAgICAgdGhpcy5iYXNlU2NyZWVuc2hvdHNQYXRoID0gYmFzZVNjcmVlbnNob3RzUGF0aDtcbiAgICAgICAgdGhpcy50ZXN0RW50cnkgICAgICAgICAgID0gdGVzdEVudHJ5O1xuICAgICAgICB0aGlzLnByb3ZpZGVyICAgICAgICAgICAgPSBjb25uZWN0aW9uLnByb3ZpZGVyO1xuICAgICAgICB0aGlzLmJyb3dzZXJJZCAgICAgICAgICAgPSBjb25uZWN0aW9uLmlkO1xuICAgICAgICB0aGlzLndhcm5pbmdMb2cgICAgICAgICAgPSB3YXJuaW5nTG9nO1xuICAgICAgICB0aGlzLnBhdGhQYXR0ZXJuICAgICAgICAgPSBwYXRoUGF0dGVybjtcbiAgICB9XG5cbiAgICBzdGF0aWMgX2dldERpbWVuc2lvbldpdGhvdXRTY3JvbGxiYXIgKGZ1bGxEaW1lbnNpb24sIGRvY3VtZW50RGltZW5zaW9uLCBib2R5RGltZW5zaW9uKSB7XG4gICAgICAgIGlmIChib2R5RGltZW5zaW9uID4gZnVsbERpbWVuc2lvbilcbiAgICAgICAgICAgIHJldHVybiBkb2N1bWVudERpbWVuc2lvbjtcblxuICAgICAgICBpZiAoZG9jdW1lbnREaW1lbnNpb24gPiBmdWxsRGltZW5zaW9uKVxuICAgICAgICAgICAgcmV0dXJuIGJvZHlEaW1lbnNpb247XG5cbiAgICAgICAgcmV0dXJuIE1hdGgubWF4KGRvY3VtZW50RGltZW5zaW9uLCBib2R5RGltZW5zaW9uKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgX2dldENyb3BEaW1lbnNpb25zIChjcm9wRGltZW5zaW9ucywgcGFnZURpbWVuc2lvbnMpIHtcbiAgICAgICAgaWYgKCFjcm9wRGltZW5zaW9ucyB8fCAhcGFnZURpbWVuc2lvbnMpXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcblxuICAgICAgICBjb25zdCB7IGRwciB9ICAgICAgICAgICAgICAgICAgICAgID0gcGFnZURpbWVuc2lvbnM7XG4gICAgICAgIGNvbnN0IHsgdG9wLCBsZWZ0LCBib3R0b20sIHJpZ2h0IH0gPSBjcm9wRGltZW5zaW9ucztcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdG9wOiAgICBNYXRoLnJvdW5kKHRvcCAqIGRwciksXG4gICAgICAgICAgICBsZWZ0OiAgIE1hdGgucm91bmQobGVmdCAqIGRwciksXG4gICAgICAgICAgICBib3R0b206IE1hdGgucm91bmQoYm90dG9tICogZHByKSxcbiAgICAgICAgICAgIHJpZ2h0OiAgTWF0aC5yb3VuZChyaWdodCAqIGRwcilcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBzdGF0aWMgX2dldENsaWVudEFyZWFEaW1lbnNpb25zIChwYWdlRGltZW5zaW9ucykge1xuICAgICAgICBpZiAoIXBhZ2VEaW1lbnNpb25zKVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgY29uc3QgeyBpbm5lcldpZHRoLCBkb2N1bWVudFdpZHRoLCBib2R5V2lkdGgsIGlubmVySGVpZ2h0LCBkb2N1bWVudEhlaWdodCwgYm9keUhlaWdodCwgZHByIH0gPSBwYWdlRGltZW5zaW9ucztcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgd2lkdGg6ICBNYXRoLmZsb29yKENhcHR1cmVyLl9nZXREaW1lbnNpb25XaXRob3V0U2Nyb2xsYmFyKGlubmVyV2lkdGgsIGRvY3VtZW50V2lkdGgsIGJvZHlXaWR0aCkgKiBkcHIpLFxuICAgICAgICAgICAgaGVpZ2h0OiBNYXRoLmZsb29yKENhcHR1cmVyLl9nZXREaW1lbnNpb25XaXRob3V0U2Nyb2xsYmFyKGlubmVySGVpZ2h0LCBkb2N1bWVudEhlaWdodCwgYm9keUhlaWdodCkgKiBkcHIpXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgc3RhdGljIGFzeW5jIF9pc1NjcmVlbnNob3RDYXB0dXJlZCAoc2NyZWVuc2hvdFBhdGgpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHN0YXRzID0gYXdhaXQgc3RhdChzY3JlZW5zaG90UGF0aCk7XG5cbiAgICAgICAgICAgIHJldHVybiBzdGF0cy5pc0ZpbGUoKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgX2pvaW5XaXRoQmFzZVNjcmVlbnNob3RQYXRoIChwYXRoKSB7XG4gICAgICAgIHJldHVybiBqb2luUGF0aCh0aGlzLmJhc2VTY3JlZW5zaG90c1BhdGgsIHBhdGgpO1xuICAgIH1cblxuICAgIF9pbmNyZW1lbnRGaWxlSW5kZXhlcyAoZm9yRXJyb3IpIHtcbiAgICAgICAgaWYgKGZvckVycm9yKVxuICAgICAgICAgICAgdGhpcy5wYXRoUGF0dGVybi5kYXRhLmVycm9yRmlsZUluZGV4Kys7XG5cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhpcy5wYXRoUGF0dGVybi5kYXRhLmZpbGVJbmRleCsrO1xuICAgIH1cblxuICAgIF9nZXRDdXN0b21TY3JlZW5zaG90UGF0aCAoY3VzdG9tUGF0aCkge1xuICAgICAgICBjb25zdCBjb3JyZWN0ZWRDdXN0b21QYXRoID0gY29ycmVjdEZpbGVQYXRoKGN1c3RvbVBhdGgpO1xuXG4gICAgICAgIHJldHVybiB0aGlzLl9qb2luV2l0aEJhc2VTY3JlZW5zaG90UGF0aChjb3JyZWN0ZWRDdXN0b21QYXRoKTtcbiAgICB9XG5cbiAgICBfZ2V0U2NyZWVuc2hvdFBhdGggKGZvckVycm9yKSB7XG4gICAgICAgIGNvbnN0IHBhdGggPSB0aGlzLnBhdGhQYXR0ZXJuLmdldFBhdGgoZm9yRXJyb3IpO1xuXG4gICAgICAgIHRoaXMuX2luY3JlbWVudEZpbGVJbmRleGVzKGZvckVycm9yKTtcblxuICAgICAgICByZXR1cm4gdGhpcy5fam9pbldpdGhCYXNlU2NyZWVuc2hvdFBhdGgocGF0aCk7XG4gICAgfVxuXG4gICAgX2dldFRodW1ibmFpbFBhdGggKHNjcmVlbnNob3RQYXRoKSB7XG4gICAgICAgIGNvbnN0IGltYWdlTmFtZSA9IGJhc2VuYW1lKHNjcmVlbnNob3RQYXRoKTtcbiAgICAgICAgY29uc3QgaW1hZ2VEaXIgID0gZGlybmFtZShzY3JlZW5zaG90UGF0aCk7XG5cbiAgICAgICAgcmV0dXJuIGpvaW5QYXRoKGltYWdlRGlyLCAndGh1bWJuYWlscycsIGltYWdlTmFtZSk7XG4gICAgfVxuXG4gICAgYXN5bmMgX3Rha2VTY3JlZW5zaG90IChmaWxlUGF0aCwgcGFnZVdpZHRoLCBwYWdlSGVpZ2h0KSB7XG4gICAgICAgIGF3YWl0IG1ha2VEaXIoZGlybmFtZShmaWxlUGF0aCkpO1xuICAgICAgICBhd2FpdCB0aGlzLnByb3ZpZGVyLnRha2VTY3JlZW5zaG90KHRoaXMuYnJvd3NlcklkLCBmaWxlUGF0aCwgcGFnZVdpZHRoLCBwYWdlSGVpZ2h0KTtcbiAgICB9XG5cbiAgICBhc3luYyBfY2FwdHVyZSAoZm9yRXJyb3IsIHsgcGFnZURpbWVuc2lvbnMsIGNyb3BEaW1lbnNpb25zLCBtYXJrU2VlZCwgY3VzdG9tUGF0aCB9ID0ge30pIHtcbiAgICAgICAgaWYgKCF0aGlzLmVuYWJsZWQpXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcblxuICAgICAgICBjb25zdCBzY3JlZW5zaG90UGF0aCA9IGN1c3RvbVBhdGggPyB0aGlzLl9nZXRDdXN0b21TY3JlZW5zaG90UGF0aChjdXN0b21QYXRoKSA6IHRoaXMuX2dldFNjcmVlbnNob3RQYXRoKGZvckVycm9yKTtcbiAgICAgICAgY29uc3QgdGh1bWJuYWlsUGF0aCAgPSB0aGlzLl9nZXRUaHVtYm5haWxQYXRoKHNjcmVlbnNob3RQYXRoKTtcblxuICAgICAgICBpZiAoaXNJblF1ZXVlKHNjcmVlbnNob3RQYXRoKSlcbiAgICAgICAgICAgIHRoaXMud2FybmluZ0xvZy5hZGRXYXJuaW5nKFdBUk5JTkdfTUVTU0FHRS5zY3JlZW5zaG90UmV3cml0aW5nRXJyb3IsIHNjcmVlbnNob3RQYXRoKTtcblxuICAgICAgICBhd2FpdCBhZGRUb1F1ZXVlKHNjcmVlbnNob3RQYXRoLCBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBjbGllbnRBcmVhRGltZW5zaW9ucyA9IENhcHR1cmVyLl9nZXRDbGllbnRBcmVhRGltZW5zaW9ucyhwYWdlRGltZW5zaW9ucyk7XG5cbiAgICAgICAgICAgIGF3YWl0IHRoaXMuX3Rha2VTY3JlZW5zaG90KHNjcmVlbnNob3RQYXRoLCAuLi5jbGllbnRBcmVhRGltZW5zaW9ucyA/IFtjbGllbnRBcmVhRGltZW5zaW9ucy53aWR0aCwgY2xpZW50QXJlYURpbWVuc2lvbnMuaGVpZ2h0XSA6IFtdKTtcblxuICAgICAgICAgICAgaWYgKCFhd2FpdCBDYXB0dXJlci5faXNTY3JlZW5zaG90Q2FwdHVyZWQoc2NyZWVuc2hvdFBhdGgpKVxuICAgICAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCBpbWFnZSA9IGF3YWl0IHJlYWRQbmdGaWxlKHNjcmVlbnNob3RQYXRoKTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IGNyb3BwZWRJbWFnZSA9IGF3YWl0IGNyb3BTY3JlZW5zaG90KGltYWdlLCB7XG4gICAgICAgICAgICAgICAgICAgIG1hcmtTZWVkLFxuICAgICAgICAgICAgICAgICAgICBjbGllbnRBcmVhRGltZW5zaW9ucyxcblxuICAgICAgICAgICAgICAgICAgICBwYXRoOiAgICAgICAgICAgc2NyZWVuc2hvdFBhdGgsXG4gICAgICAgICAgICAgICAgICAgIGNyb3BEaW1lbnNpb25zOiBDYXB0dXJlci5fZ2V0Q3JvcERpbWVuc2lvbnMoY3JvcERpbWVuc2lvbnMsIHBhZ2VEaW1lbnNpb25zKVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgaWYgKGNyb3BwZWRJbWFnZSlcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgd3JpdGVQbmcoc2NyZWVuc2hvdFBhdGgsIGNyb3BwZWRJbWFnZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgZGVsZXRlRmlsZShzY3JlZW5zaG90UGF0aCk7XG5cbiAgICAgICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGF3YWl0IGdlbmVyYXRlVGh1bWJuYWlsKHNjcmVlbnNob3RQYXRoLCB0aHVtYm5haWxQYXRoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3Qgc2NyZWVuc2hvdCA9IHtcbiAgICAgICAgICAgIHNjcmVlbnNob3RQYXRoLFxuICAgICAgICAgICAgdGh1bWJuYWlsUGF0aCxcbiAgICAgICAgICAgIHVzZXJBZ2VudDogICAgICAgICBlc2NhcGVVc2VyQWdlbnQodGhpcy5wYXRoUGF0dGVybi5kYXRhLnBhcnNlZFVzZXJBZ2VudCksXG4gICAgICAgICAgICBxdWFyYW50aW5lQXR0ZW1wdDogdGhpcy5wYXRoUGF0dGVybi5kYXRhLnF1YXJhbnRpbmVBdHRlbXB0LFxuICAgICAgICAgICAgdGFrZW5PbkZhaWw6ICAgICAgIGZvckVycm9yLFxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMudGVzdEVudHJ5LnNjcmVlbnNob3RzLnB1c2goc2NyZWVuc2hvdCk7XG5cbiAgICAgICAgcmV0dXJuIHNjcmVlbnNob3RQYXRoO1xuICAgIH1cblxuICAgIGFzeW5jIGNhcHR1cmVBY3Rpb24gKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuX2NhcHR1cmUoZmFsc2UsIG9wdGlvbnMpO1xuICAgIH1cblxuICAgIGFzeW5jIGNhcHR1cmVFcnJvciAob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5fY2FwdHVyZSh0cnVlLCBvcHRpb25zKTtcbiAgICB9XG59XG5cbiJdfQ==
