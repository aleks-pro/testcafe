'use strict';

exports.__esModule = true;

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _entries = require('babel-runtime/core-js/object/entries');

var _entries2 = _interopRequireDefault(_entries);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _path = require('path');

var _process = require('./process');

var _process2 = _interopRequireDefault(_process);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const VIDEO_EXTENSION = 'mp4';

const TEMP_VIDEO_FILE_PREFIX = 'tmp-video';
const TEMP_MERGE_FILE_PREFIX = TEMP_VIDEO_FILE_PREFIX + '-merge';

const TEMP_MERGE_CONFIG_FILE_PREFIX = 'config';
const TEMP_MERGE_CONFIG_FILE_EXTENSION = 'txt';

class TestRunVideoRecorder {
    constructor({ testRun, test, index }, { path, ffmpegPath, encodingOptions }) {
        this.testRun = testRun;
        this.test = test;
        this.index = index;

        this.tempFiles = null;
        this.videoRecorder = null;

        this.path = path;
        this.ffmpegPath = ffmpegPath;
        this.encodingOptions = encodingOptions;
    }

    get testRunInfo() {
        return {
            testIndex: this.index,
            fixture: this.test.fixture.name,
            test: this.test.name,
            alias: this._connection.browserInfo.alias,
            parsedUserAgent: this._connection.browserInfo.parsedUserAgent
        };
    }

    get hasErrors() {
        return !!this.testRun.errs.length;
    }

    get _connection() {
        return this.testRun.browserConnection;
    }

    startCapturing() {
        var _this = this;

        return (0, _asyncToGenerator3.default)(function* () {
            yield _this.videoRecorder.startCapturing();
        })();
    }

    finishCapturing() {
        var _this2 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            yield _this2.videoRecorder.finishCapturing();
        })();
    }

    init() {
        var _this3 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            _this3.tempFiles = _this3._generateTempNames();
            _this3.videoRecorder = _this3._createVideoRecorderProcess();

            yield _this3.videoRecorder.init();
        })();
    }

    isVideoSupported() {
        var _this4 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            const connectionCapabilities = yield _this4._connection.provider.hasCustomActionForBrowser(_this4._connection.id);

            return connectionCapabilities && connectionCapabilities.hasGetVideoFrameData;
        })();
    }

    _createVideoRecorderProcess() {
        return new _process2.default(this.tempFiles.tempVideoPath, this.ffmpegPath, this._connection, this.encodingOptions);
    }

    _generateTempNames() {
        const id = this._connection.id;

        const tempFileNames = {
            tempVideoPath: `${TEMP_VIDEO_FILE_PREFIX}-${id}.${VIDEO_EXTENSION}`,
            tempMergeConfigPath: `${TEMP_MERGE_CONFIG_FILE_PREFIX}-${id}.${TEMP_MERGE_CONFIG_FILE_EXTENSION}`,
            tmpMergeName: `${TEMP_MERGE_FILE_PREFIX}-${id}.${VIDEO_EXTENSION}`
        };

        for (var _iterator = (0, _entries2.default)(tempFileNames), _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : (0, _getIterator3.default)(_iterator);;) {
            var _ref2;

            if (_isArray) {
                if (_i >= _iterator.length) break;
                _ref2 = _iterator[_i++];
            } else {
                _i = _iterator.next();
                if (_i.done) break;
                _ref2 = _i.value;
            }

            const _ref = _ref2;
            const tempFile = _ref[0];
            const tempName = _ref[1];

            tempFileNames[tempFile] = (0, _path.join)(this.path, tempName);
        }return tempFileNames;
    }
}
exports.default = TestRunVideoRecorder;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy92aWRlby1yZWNvcmRlci90ZXN0LXJ1bi12aWRlby1yZWNvcmRlci5qcyJdLCJuYW1lcyI6WyJWSURFT19FWFRFTlNJT04iLCJURU1QX1ZJREVPX0ZJTEVfUFJFRklYIiwiVEVNUF9NRVJHRV9GSUxFX1BSRUZJWCIsIlRFTVBfTUVSR0VfQ09ORklHX0ZJTEVfUFJFRklYIiwiVEVNUF9NRVJHRV9DT05GSUdfRklMRV9FWFRFTlNJT04iLCJUZXN0UnVuVmlkZW9SZWNvcmRlciIsImNvbnN0cnVjdG9yIiwidGVzdFJ1biIsInRlc3QiLCJpbmRleCIsInBhdGgiLCJmZm1wZWdQYXRoIiwiZW5jb2RpbmdPcHRpb25zIiwidGVtcEZpbGVzIiwidmlkZW9SZWNvcmRlciIsInRlc3RSdW5JbmZvIiwidGVzdEluZGV4IiwiZml4dHVyZSIsIm5hbWUiLCJhbGlhcyIsIl9jb25uZWN0aW9uIiwiYnJvd3NlckluZm8iLCJwYXJzZWRVc2VyQWdlbnQiLCJoYXNFcnJvcnMiLCJlcnJzIiwibGVuZ3RoIiwiYnJvd3NlckNvbm5lY3Rpb24iLCJzdGFydENhcHR1cmluZyIsImZpbmlzaENhcHR1cmluZyIsImluaXQiLCJfZ2VuZXJhdGVUZW1wTmFtZXMiLCJfY3JlYXRlVmlkZW9SZWNvcmRlclByb2Nlc3MiLCJpc1ZpZGVvU3VwcG9ydGVkIiwiY29ubmVjdGlvbkNhcGFiaWxpdGllcyIsInByb3ZpZGVyIiwiaGFzQ3VzdG9tQWN0aW9uRm9yQnJvd3NlciIsImlkIiwiaGFzR2V0VmlkZW9GcmFtZURhdGEiLCJ0ZW1wVmlkZW9QYXRoIiwidGVtcEZpbGVOYW1lcyIsInRlbXBNZXJnZUNvbmZpZ1BhdGgiLCJ0bXBNZXJnZU5hbWUiLCJ0ZW1wRmlsZSIsInRlbXBOYW1lIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7O0FBQ0E7Ozs7OztBQUVBLE1BQU1BLGtCQUFrQixLQUF4Qjs7QUFFQSxNQUFNQyx5QkFBeUIsV0FBL0I7QUFDQSxNQUFNQyx5QkFB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QTtBQUFBOztBQUFBO0FBQUEsa0JBQVlHLFFBQVo7QUFBQSxrQkFBc0JDLFFBQXRCOztBQUNJSiwwQkFBY0csUUFBZCxJQUEwQixnQkFBSyxLQUFLaEMsSUFBVixFQUFnQmlDLFFBQWhCLENBQTFCO0FBREosU0FHQSxPQUFPSixhQUFQO0FBQ0g7QUF0RXFDO2tCQUFyQmxDLG9CIiwiZmlsZSI6InZpZGVvLXJlY29yZGVyL3Rlc3QtcnVuLXZpZGVvLXJlY29yZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgam9pbiB9IGZyb20gJ3BhdGgnO1xuaW1wb3J0IFZpZGVvUmVjb3JkZXJQcm9jZXNzIGZyb20gJy4vcHJvY2Vzcyc7XG5cbmNvbnN0IFZJREVPX0VYVEVOU0lPTiA9ICdtcDQnO1xuXG5jb25zdCBURU1QX1ZJREVPX0ZJTEVfUFJFRklYID0gJ3RtcC12aWRlbyc7XG5jb25zdCBURU1QX01FUkdFX0ZJTEVfUFJFRklYID0gVEVNUF9WSURFT19GSUxFX1BSRUZJWCArICctbWVyZ2UnO1xuXG5jb25zdCBURU1QX01FUkdFX0NPTkZJR19GSUxFX1BSRUZJWCAgICA9ICdjb25maWcnO1xuY29uc3QgVEVNUF9NRVJHRV9DT05GSUdfRklMRV9FWFRFTlNJT04gPSAndHh0JztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGVzdFJ1blZpZGVvUmVjb3JkZXIge1xuICAgIGNvbnN0cnVjdG9yICh7IHRlc3RSdW4sIHRlc3QsIGluZGV4IH0sIHsgcGF0aCwgZmZtcGVnUGF0aCwgZW5jb2RpbmdPcHRpb25zIH0pIHtcbiAgICAgICAgdGhpcy50ZXN0UnVuICAgID0gdGVzdFJ1bjtcbiAgICAgICAgdGhpcy50ZXN0ICAgICAgID0gdGVzdDtcbiAgICAgICAgdGhpcy5pbmRleCAgICAgID0gaW5kZXg7XG5cbiAgICAgICAgdGhpcy50ZW1wRmlsZXMgICAgID0gbnVsbDtcbiAgICAgICAgdGhpcy52aWRlb1JlY29yZGVyID0gbnVsbDtcblxuICAgICAgICB0aGlzLnBhdGggICAgICAgICAgICA9IHBhdGg7XG4gICAgICAgIHRoaXMuZmZtcGVnUGF0aCAgICAgID0gZmZtcGVnUGF0aDtcbiAgICAgICAgdGhpcy5lbmNvZGluZ09wdGlvbnMgPSBlbmNvZGluZ09wdGlvbnM7XG4gICAgfVxuXG4gICAgZ2V0IHRlc3RSdW5JbmZvICgpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHRlc3RJbmRleDogICAgICAgdGhpcy5pbmRleCxcbiAgICAgICAgICAgIGZpeHR1cmU6ICAgICAgICAgdGhpcy50ZXN0LmZpeHR1cmUubmFtZSxcbiAgICAgICAgICAgIHRlc3Q6ICAgICAgICAgICAgdGhpcy50ZXN0Lm5hbWUsXG4gICAgICAgICAgICBhbGlhczogICAgICAgICAgIHRoaXMuX2Nvbm5lY3Rpb24uYnJvd3NlckluZm8uYWxpYXMsXG4gICAgICAgICAgICBwYXJzZWRVc2VyQWdlbnQ6IHRoaXMuX2Nvbm5lY3Rpb24uYnJvd3NlckluZm8ucGFyc2VkVXNlckFnZW50XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZ2V0IGhhc0Vycm9ycyAoKSB7XG4gICAgICAgIHJldHVybiAhIXRoaXMudGVzdFJ1bi5lcnJzLmxlbmd0aDtcbiAgICB9XG5cbiAgICBnZXQgX2Nvbm5lY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy50ZXN0UnVuLmJyb3dzZXJDb25uZWN0aW9uO1xuICAgIH1cblxuICAgIGFzeW5jIHN0YXJ0Q2FwdHVyaW5nICgpIHtcbiAgICAgICAgYXdhaXQgdGhpcy52aWRlb1JlY29yZGVyLnN0YXJ0Q2FwdHVyaW5nKCk7XG4gICAgfVxuXG4gICAgYXN5bmMgZmluaXNoQ2FwdHVyaW5nICgpIHtcbiAgICAgICAgYXdhaXQgdGhpcy52aWRlb1JlY29yZGVyLmZpbmlzaENhcHR1cmluZygpO1xuICAgIH1cblxuICAgIGFzeW5jIGluaXQgKCkge1xuICAgICAgICB0aGlzLnRlbXBGaWxlcyAgICAgPSB0aGlzLl9nZW5lcmF0ZVRlbXBOYW1lcygpO1xuICAgICAgICB0aGlzLnZpZGVvUmVjb3JkZXIgPSB0aGlzLl9jcmVhdGVWaWRlb1JlY29yZGVyUHJvY2VzcygpO1xuXG4gICAgICAgIGF3YWl0IHRoaXMudmlkZW9SZWNvcmRlci5pbml0KCk7XG4gICAgfVxuXG4gICAgYXN5bmMgaXNWaWRlb1N1cHBvcnRlZCAoKSB7XG4gICAgICAgIGNvbnN0IGNvbm5lY3Rpb25DYXBhYmlsaXRpZXMgPSBhd2FpdCB0aGlzLl9jb25uZWN0aW9uLnByb3ZpZGVyLmhhc0N1c3RvbUFjdGlvbkZvckJyb3dzZXIodGhpcy5fY29ubmVjdGlvbi5pZCk7XG5cbiAgICAgICAgcmV0dXJuIGNvbm5lY3Rpb25DYXBhYmlsaXRpZXMgJiYgY29ubmVjdGlvbkNhcGFiaWxpdGllcy5oYXNHZXRWaWRlb0ZyYW1lRGF0YTtcbiAgICB9XG5cbiAgICBfY3JlYXRlVmlkZW9SZWNvcmRlclByb2Nlc3MgKCkge1xuICAgICAgICByZXR1cm4gbmV3IFZpZGVvUmVjb3JkZXJQcm9jZXNzKHRoaXMudGVtcEZpbGVzLnRlbXBWaWRlb1BhdGgsIHRoaXMuZmZtcGVnUGF0aCwgdGhpcy5fY29ubmVjdGlvbiwgdGhpcy5lbmNvZGluZ09wdGlvbnMpO1xuICAgIH1cblxuICAgIF9nZW5lcmF0ZVRlbXBOYW1lcyAoKSB7XG4gICAgICAgIGNvbnN0IGlkID0gdGhpcy5fY29ubmVjdGlvbi5pZDtcblxuICAgICAgICBjb25zdCB0ZW1wRmlsZU5hbWVzID0ge1xuICAgICAgICAgICAgdGVtcFZpZGVvUGF0aDogICAgICAgYCR7VEVNUF9WSURFT19GSUxFX1BSRUZJWH0tJHtpZH0uJHtWSURFT19FWFRFTlNJT059YCxcbiAgICAgICAgICAgIHRlbXBNZXJnZUNvbmZpZ1BhdGg6IGAke1RFTVBfTUVSR0VfQ09ORklHX0ZJTEVfUFJFRklYfS0ke2lkfS4ke1RFTVBfTUVSR0VfQ09ORklHX0ZJTEVfRVhURU5TSU9OfWAsXG4gICAgICAgICAgICB0bXBNZXJnZU5hbWU6ICAgICAgICBgJHtURU1QX01FUkdFX0ZJTEVfUFJFRklYfS0ke2lkfS4ke1ZJREVPX0VYVEVOU0lPTn1gXG4gICAgICAgIH07XG5cbiAgICAgICAgZm9yIChjb25zdCBbdGVtcEZpbGUsIHRlbXBOYW1lXSBvZiBPYmplY3QuZW50cmllcyh0ZW1wRmlsZU5hbWVzKSlcbiAgICAgICAgICAgIHRlbXBGaWxlTmFtZXNbdGVtcEZpbGVdID0gam9pbih0aGlzLnBhdGgsIHRlbXBOYW1lKTtcblxuICAgICAgICByZXR1cm4gdGVtcEZpbGVOYW1lcztcbiAgICB9XG59XG5cbiJdfQ==
