'use strict';

exports.__esModule = true;

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _path = require('path');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _child_process = require('child_process');

var _makeDir = require('make-dir');

var _makeDir2 = _interopRequireDefault(_makeDir);

var _tempDirectory = require('../utils/temp-directory');

var _tempDirectory2 = _interopRequireDefault(_tempDirectory);

var _pathPattern = require('../utils/path-pattern');

var _pathPattern2 = _interopRequireDefault(_pathPattern);

var _warningMessage = require('../notifications/warning-message');

var _warningMessage2 = _interopRequireDefault(_warningMessage);

var _string = require('../utils/string');

var _testRunVideoRecorder = require('./test-run-video-recorder');

var _testRunVideoRecorder2 = _interopRequireDefault(_testRunVideoRecorder);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const DEBUG_LOGGER = (0, _debug2.default)('testcafe:video-recorder');

const VIDEO_EXTENSION = 'mp4';
const TEMP_DIR_PREFIX = 'video';

class VideoRecorder {
    constructor(browserJob, basePath, opts, encodingOpts, warningLog) {
        this.browserJob = browserJob;
        this.basePath = basePath;
        this.failedOnly = opts.failedOnly;
        this.singleFile = opts.singleFile;
        this.ffmpegPath = opts.ffmpegPath;
        this.customPathPattern = opts.pathPattern;
        this.timeStamp = opts.timeStamp;
        this.encodingOptions = encodingOpts;

        this.warningLog = warningLog;

        this.tempDirectory = new _tempDirectory2.default(TEMP_DIR_PREFIX);

        this.firstFile = true;

        this.testRunVideoRecorders = {};

        this._assignEventHandlers(browserJob);
    }

    _createSafeListener(listener) {
        var _this = this;

        return (() => {
            var _ref = (0, _asyncToGenerator3.default)(function* (...args) {
                try {
                    return yield listener.apply(_this, args);
                } catch (error) {
                    DEBUG_LOGGER(listener && listener.name, error);

                    return void 0;
                }
            });

            return function () {
                return _ref.apply(this, arguments);
            };
        })();
    }

    _assignEventHandlers(browserJob) {
        browserJob.once('start', this._createSafeListener(() => {
            this.tempDirectoryInitializedPromise = this._onBrowserJobStart();

            return this.tempDirectoryInitializedPromise;
        }));

        browserJob.once('done', this._createSafeListener(this._onBrowserJobDone));
        browserJob.on('test-run-create', this._createSafeListener(this._onTestRunCreate));
        browserJob.on('test-run-ready', this._createSafeListener(this._onTestRunReady));
        browserJob.on('test-run-before-done', this._createSafeListener(this._onTestRunBeforeDone));
    }

    _addProblematicPlaceholdersWarning(placeholders) {
        const problematicPlaceholderListStr = (0, _string.getConcatenatedValuesString)(placeholders);
        const suffix = (0, _string.getPluralSuffix)(placeholders);
        const verb = (0, _string.getToBeInPastTense)(placeholders);

        this.warningLog.addWarning(_warningMessage2.default.problematicPathPatternPlaceholderForVideoRecording, problematicPlaceholderListStr, suffix, suffix, verb);
    }

    _getTargetVideoPath(testRunRecorder) {
        const data = (0, _assign2.default)(testRunRecorder.testRunInfo, { now: this.timeStamp });

        if (this.singleFile) {
            data.testIndex = null;
            data.fixture = null;
            data.test = null;
        }

        const pathPattern = new _pathPattern2.default(this.customPathPattern, VIDEO_EXTENSION, data);

        pathPattern.on('problematic-placeholders-found', ({ placeholders }) => this._addProblematicPlaceholdersWarning(placeholders));

        return (0, _path.join)(this.basePath, pathPattern.getPath());
    }

    _concatVideo(targetVideoPath, { tempVideoPath, tempMergeConfigPath, tmpMergeName }) {
        if (this.firstFile) {
            this.firstFile = false;
            return;
        }

        _fs2.default.writeFileSync(tempMergeConfigPath, `
            file '${targetVideoPath}'
            file '${tempVideoPath}'
        `);

        (0, _child_process.spawnSync)(this.ffmpegPath, ['-y', '-f', 'concat', '-safe', '0', '-i', tempMergeConfigPath, '-c', 'copy', tmpMergeName], { stdio: 'ignore' });
        _fs2.default.copyFileSync(tmpMergeName, tempVideoPath);
    }

    _onBrowserJobStart() {
        var _this2 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            yield _this2.tempDirectory.init();
        })();
    }

    _onBrowserJobDone() {
        var _this3 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            yield _this3.tempDirectory.dispose();
        })();
    }

    _onTestRunCreate(testRunInfo) {
        var _this4 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            if (testRunInfo.legacy) return;

            yield _this4.tempDirectoryInitializedPromise;

            const recordingOptions = {
                path: _this4.tempDirectory.path,
                ffmpegPath: _this4.ffmpegPath,
                encodingOptions: _this4.encodingOptions
            };

            const testRunVideoRecorder = _this4._createTestRunVideoRecorder(testRunInfo, recordingOptions);
            const isVideoSupported = yield testRunVideoRecorder.isVideoSupported();

            if (isVideoSupported) {
                yield testRunVideoRecorder.init();

                _this4.testRunVideoRecorders[testRunVideoRecorder.index] = testRunVideoRecorder;
            } else _this4.warningLog.addWarning(_warningMessage2.default.videoNotSupportedByBrowser, testRunVideoRecorder.testRunInfo.alias);
        })();
    }

    _createTestRunVideoRecorder(testRunInfo, recordingOptions) {
        return new _testRunVideoRecorder2.default(testRunInfo, recordingOptions, this.warningLog);
    }

    _onTestRunReady({ index }) {
        var _this5 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            const testRunRecorder = _this5.testRunVideoRecorders[index];

            if (!testRunRecorder) return;

            yield testRunRecorder.startCapturing();
        })();
    }

    _onTestRunBeforeDone({ index }) {
        var _this6 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            const testRunRecorder = _this6.testRunVideoRecorders[index];

            if (!testRunRecorder) return;

            delete _this6.testRunVideoRecorders[index];

            yield testRunRecorder.finishCapturing();

            if (_this6.failedOnly && !testRunRecorder.hasErrors) return;

            yield _this6._saveFiles(testRunRecorder);
        })();
    }

    _saveFiles(testRunRecorder) {
        var _this7 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            const videoPath = _this7._getTargetVideoPath(testRunRecorder);

            yield (0, _makeDir2.default)((0, _path.dirname)(videoPath));

            if (_this7.singleFile) _this7._concatVideo(videoPath, testRunRecorder.tempFiles);

            _fs2.default.copyFileSync(testRunRecorder.tempFiles.tempVideoPath, videoPath);
        })();
    }
}
exports.default = VideoRecorder;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy92aWRlby1yZWNvcmRlci9pbmRleC5qcyJdLCJuYW1lcyI6WyJERUJVR19MT0dHRVIiLCJWSURFT19FWFRFTlNJT04iLCJURU1QX0RJUl9QUkVGSVgiLCJWaWRlb1JlY29yZGVyIiwiY29uc3RydWN0b3IiLCJicm93c2VySm9iIiwiYmFzZVBhdGgiLCJvcHRzIiwiZW5jb2RpbmdPcHRzIiwid2FybmluZ0xvZyIsImZhaWxlZE9ubHkiLCJzaW5nbGVGaWxlIiwiZmZtcGVnUGF0aCIsImN1c3RvbVBhdGhQYXR0ZXJuIiwicGF0aFBhdHRlcm4iLCJ0aW1lU3RhbXAiLCJlbmNvZGluZ09wdGlvbnMiLCJ0ZW1wRGlyZWN0b3J5IiwiZmlyc3RGaWxlIiwidGVzdFJ1blZpZGVvUmVjb3JkZXJzIiwiX2Fzc2lnbkV2ZW50SGFuZGxlcnMiLCJfY3JlYXRlU2FmZUxpc3RlbmVyIiwibGlzdGVuZXIiLCJhcmdzIiwiYXBwbHkiLCJlcnJvciIsIm5hbWUiLCJvbmNlIiwidGVtcERpcmVjdG9yeUluaXRpYWxpemVkUHJvbWlzZSIsIl9vbkJyb3dzZXJKb2JTdGFydCIsIl9vbkJyb3dzZXJKb2JEb25lIiwib24iLCJfb25UZXN0UnVuQ3JlYXRlIiwiX29uVGVzdFJ1blJlYWR5IiwiX29uVGVzdFJ1bkJlZm9yZURvbmUiLCJfYWRkUHJvYmxlbWF0aWNQbGFjZWhvbGRlcnNXYXJuaW5nIiwicGxhY2Vob2xkZXJzIiwicHJvYmxlbWF0aWNQbGFjZWhvbGRlckxpc3RTdHIiLCJzdWZmaXgiLCJ2ZXJiIiwiYWRkV2FybmluZyIsInByb2JsZW1hdGljUGF0aFBhdHRlcm5QbGFjZWhvbGRlckZvclZpZGVvUmVjb3JkaW5nIiwiX2dldFRhcmdldFZpZGVvUGF0aCIsInRlc3RSdW5SZWNvcmRlciIsImRhdGEiLCJ0ZXN0UnVuSW5mbyIsIm5vdyIsInRlc3RJbmRleCIsImZpeHR1cmUiLCJ0ZXN0IiwiZ2V0UGF0aCIsIl9jb25jYXRWaWRlbyIsInRhcmdldFZpZGVvUGF0aCIsInRlbXBWaWRlb1BhdGgiLCJ0ZW1wTWVyZ2VDb25maWdQYXRoIiwidG1wTWVyZ2VOYW1lIiwid3JpdGVGaWxlU3luYyIsInN0ZGlvIiwiY29weUZpbGVTeW5jIiwiaW5pdCIsImRpc3Bvc2UiLCJsZWdhY3kiLCJyZWNvcmRpbmdPcHRpb25zIiwicGF0aCIsInRlc3RSdW5WaWRlb1JlY29yZGVyIiwiX2NyZWF0ZVRlc3RSdW5WaWRlb1JlY29yZGVyIiwiaXNWaWRlb1N1cHBvcnRlZCIsImluZGV4IiwidmlkZW9Ob3RTdXBwb3J0ZWRCeUJyb3dzZXIiLCJhbGlhcyIsInN0YXJ0Q2FwdHVyaW5nIiwiZmluaXNoQ2FwdHVyaW5nIiwiaGFzRXJyb3JzIiwiX3NhdmVGaWxlcyIsInZpZGVvUGF0aCIsInRlbXBGaWxlcyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUE7Ozs7QUFDQTs7QUFDQTs7OztBQUNBOztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7O0FBRUE7Ozs7OztBQUVBLE1BQU1BLGVBQWUscUJBQU0seUJBQU4sQ0FBckI7O0FBRUEsTUFBTUMsa0JBQWtCLEtBQXhCO0FBQ0EsTUFBTUMsa0JBQWtCLE9BQXhCOztBQUVlLE1BQU1DLGFBQU4sQ0FBb0I7QUFDL0JDLGdCQUFhQyxVQUFiLEVBQXlCQyxRQUF6QixFQUFtQ0MsSUFBbkMsRUFBeUNDLFlBQXpDLEVBQXVEQyxVQUF2RCxFQUFtRTtBQUMvRCxhQUFLSixVQUFMLEdBQXlCQSxVQUF6QjtBQUNBLGFBQUtDLFFBQUwsR0FBeUJBLFFBQXpCO0FBQ0EsYUFBS0ksVUFBTCxHQUF5QkgsS0FBS0csVUFBOUI7QUFDQSxhQUFLQyxVQUFMLEdBQXlCSixLQUFLSSxVQUE5QjtBQUNBLGFBQUtDLFVBQUwsR0FBeUJMLEtBQUtLLFVBQTlCO0FBQ0EsYUFBS0MsaUJBQUwsR0FBeUJOLEtBQUtPLFdBQTlCO0FBQ0EsYUFBS0MsU0FBTCxHQUF5QlIsS0FBS1EsU0FBOUI7QUFDQSxhQUFLQyxlQUFMLEdBQXlCUixZQUF6Qjs7QUFF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U0FBbEIsRUFBNkIvQixnQkFBZ0JnQyxTQUE3Qzs7QUFFSix5QkFBR2pCLFlBQUgsQ0FBZ0JmLGdCQUFnQmdDLFNBQWhCLENBQTBCdEIsYUFBMUMsRUFBeURxQixTQUF6RDtBQVIrQjtBQVNsQztBQTdKOEI7a0JBQWR2RSxhIiwiZmlsZSI6InZpZGVvLXJlY29yZGVyL2luZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGRlYnVnIGZyb20gJ2RlYnVnJztcbmltcG9ydCB7IGpvaW4sIGRpcm5hbWUgfSBmcm9tICdwYXRoJztcbmltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgeyBzcGF3blN5bmMgfSBmcm9tICdjaGlsZF9wcm9jZXNzJztcbmltcG9ydCBtYWtlRGlyIGZyb20gJ21ha2UtZGlyJztcbmltcG9ydCBUZW1wRGlyZWN0b3J5IGZyb20gJy4uL3V0aWxzL3RlbXAtZGlyZWN0b3J5JztcbmltcG9ydCBQYXRoUGF0dGVybiBmcm9tICcuLi91dGlscy9wYXRoLXBhdHRlcm4nO1xuaW1wb3J0IFdBUk5JTkdfTUVTU0FHRVMgZnJvbSAnLi4vbm90aWZpY2F0aW9ucy93YXJuaW5nLW1lc3NhZ2UnO1xuaW1wb3J0IHsgZ2V0UGx1cmFsU3VmZml4LCBnZXRDb25jYXRlbmF0ZWRWYWx1ZXNTdHJpbmcsIGdldFRvQmVJblBhc3RUZW5zZSB9IGZyb20gJy4uL3V0aWxzL3N0cmluZyc7XG5cbmltcG9ydCBUZXN0UnVuVmlkZW9SZWNvcmRlciBmcm9tICcuL3Rlc3QtcnVuLXZpZGVvLXJlY29yZGVyJztcblxuY29uc3QgREVCVUdfTE9HR0VSID0gZGVidWcoJ3Rlc3RjYWZlOnZpZGVvLXJlY29yZGVyJyk7XG5cbmNvbnN0IFZJREVPX0VYVEVOU0lPTiA9ICdtcDQnO1xuY29uc3QgVEVNUF9ESVJfUFJFRklYID0gJ3ZpZGVvJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVmlkZW9SZWNvcmRlciB7XG4gICAgY29uc3RydWN0b3IgKGJyb3dzZXJKb2IsIGJhc2VQYXRoLCBvcHRzLCBlbmNvZGluZ09wdHMsIHdhcm5pbmdMb2cpIHtcbiAgICAgICAgdGhpcy5icm93c2VySm9iICAgICAgICA9IGJyb3dzZXJKb2I7XG4gICAgICAgIHRoaXMuYmFzZVBhdGggICAgICAgICAgPSBiYXNlUGF0aDtcbiAgICAgICAgdGhpcy5mYWlsZWRPbmx5ICAgICAgICA9IG9wdHMuZmFpbGVkT25seTtcbiAgICAgICAgdGhpcy5zaW5nbGVGaWxlICAgICAgICA9IG9wdHMuc2luZ2xlRmlsZTtcbiAgICAgICAgdGhpcy5mZm1wZWdQYXRoICAgICAgICA9IG9wdHMuZmZtcGVnUGF0aDtcbiAgICAgICAgdGhpcy5jdXN0b21QYXRoUGF0dGVybiA9IG9wdHMucGF0aFBhdHRlcm47XG4gICAgICAgIHRoaXMudGltZVN0YW1wICAgICAgICAgPSBvcHRzLnRpbWVTdGFtcDtcbiAgICAgICAgdGhpcy5lbmNvZGluZ09wdGlvbnMgICA9IGVuY29kaW5nT3B0cztcblxuICAgICAgICB0aGlzLndhcm5pbmdMb2cgPSB3YXJuaW5nTG9nO1xuXG4gICAgICAgIHRoaXMudGVtcERpcmVjdG9yeSA9IG5ldyBUZW1wRGlyZWN0b3J5KFRFTVBfRElSX1BSRUZJWCk7XG5cbiAgICAgICAgdGhpcy5maXJzdEZpbGUgPSB0cnVlO1xuXG4gICAgICAgIHRoaXMudGVzdFJ1blZpZGVvUmVjb3JkZXJzID0ge307XG5cbiAgICAgICAgdGhpcy5fYXNzaWduRXZlbnRIYW5kbGVycyhicm93c2VySm9iKTtcbiAgICB9XG5cbiAgICBfY3JlYXRlU2FmZUxpc3RlbmVyIChsaXN0ZW5lcikge1xuICAgICAgICByZXR1cm4gYXN5bmMgKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGF3YWl0IGxpc3RlbmVyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgREVCVUdfTE9HR0VSKGxpc3RlbmVyICYmIGxpc3RlbmVyLm5hbWUsIGVycm9yKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB2b2lkIDA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgX2Fzc2lnbkV2ZW50SGFuZGxlcnMgKGJyb3dzZXJKb2IpIHtcbiAgICAgICAgYnJvd3NlckpvYi5vbmNlKCdzdGFydCcsIHRoaXMuX2NyZWF0ZVNhZmVMaXN0ZW5lcigoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnRlbXBEaXJlY3RvcnlJbml0aWFsaXplZFByb21pc2UgPSB0aGlzLl9vbkJyb3dzZXJKb2JTdGFydCgpO1xuXG4gICAgICAgICAgICByZXR1cm4gdGhpcy50ZW1wRGlyZWN0b3J5SW5pdGlhbGl6ZWRQcm9taXNlO1xuICAgICAgICB9KSk7XG5cbiAgICAgICAgYnJvd3NlckpvYi5vbmNlKCdkb25lJywgdGhpcy5fY3JlYXRlU2FmZUxpc3RlbmVyKHRoaXMuX29uQnJvd3NlckpvYkRvbmUpKTtcbiAgICAgICAgYnJvd3NlckpvYi5vbigndGVzdC1ydW4tY3JlYXRlJywgdGhpcy5fY3JlYXRlU2FmZUxpc3RlbmVyKHRoaXMuX29uVGVzdFJ1bkNyZWF0ZSkpO1xuICAgICAgICBicm93c2VySm9iLm9uKCd0ZXN0LXJ1bi1yZWFkeScsIHRoaXMuX2NyZWF0ZVNhZmVMaXN0ZW5lcih0aGlzLl9vblRlc3RSdW5SZWFkeSkpO1xuICAgICAgICBicm93c2VySm9iLm9uKCd0ZXN0LXJ1bi1iZWZvcmUtZG9uZScsIHRoaXMuX2NyZWF0ZVNhZmVMaXN0ZW5lcih0aGlzLl9vblRlc3RSdW5CZWZvcmVEb25lKSk7XG4gICAgfVxuXG4gICAgX2FkZFByb2JsZW1hdGljUGxhY2Vob2xkZXJzV2FybmluZyAocGxhY2Vob2xkZXJzKSB7XG4gICAgICAgIGNvbnN0IHByb2JsZW1hdGljUGxhY2Vob2xkZXJMaXN0U3RyID0gZ2V0Q29uY2F0ZW5hdGVkVmFsdWVzU3RyaW5nKHBsYWNlaG9sZGVycyk7XG4gICAgICAgIGNvbnN0IHN1ZmZpeCAgICAgICAgICAgICAgICAgICAgICAgID0gZ2V0UGx1cmFsU3VmZml4KHBsYWNlaG9sZGVycyk7XG4gICAgICAgIGNvbnN0IHZlcmIgICAgICAgICAgICAgICAgICAgICAgICAgID0gZ2V0VG9CZUluUGFzdFRlbnNlKHBsYWNlaG9sZGVycyk7XG5cbiAgICAgICAgdGhpcy53YXJuaW5nTG9nLmFkZFdhcm5pbmcoV0FSTklOR19NRVNTQUdFUy5wcm9ibGVtYXRpY1BhdGhQYXR0ZXJuUGxhY2Vob2xkZXJGb3JWaWRlb1JlY29yZGluZywgcHJvYmxlbWF0aWNQbGFjZWhvbGRlckxpc3RTdHIsIHN1ZmZpeCwgc3VmZml4LCB2ZXJiKTtcbiAgICB9XG5cbiAgICBfZ2V0VGFyZ2V0VmlkZW9QYXRoICh0ZXN0UnVuUmVjb3JkZXIpIHtcbiAgICAgICAgY29uc3QgZGF0YSA9IE9iamVjdC5hc3NpZ24odGVzdFJ1blJlY29yZGVyLnRlc3RSdW5JbmZvLCB7IG5vdzogdGhpcy50aW1lU3RhbXAgfSk7XG5cbiAgICAgICAgaWYgKHRoaXMuc2luZ2xlRmlsZSkge1xuICAgICAgICAgICAgZGF0YS50ZXN0SW5kZXggPSBudWxsO1xuICAgICAgICAgICAgZGF0YS5maXh0dXJlID0gbnVsbDtcbiAgICAgICAgICAgIGRhdGEudGVzdCA9IG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBwYXRoUGF0dGVybiA9IG5ldyBQYXRoUGF0dGVybih0aGlzLmN1c3RvbVBhdGhQYXR0ZXJuLCBWSURFT19FWFRFTlNJT04sIGRhdGEpO1xuXG4gICAgICAgIHBhdGhQYXR0ZXJuLm9uKCdwcm9ibGVtYXRpYy1wbGFjZWhvbGRlcnMtZm91bmQnLCAoeyBwbGFjZWhvbGRlcnMgfSkgPT4gdGhpcy5fYWRkUHJvYmxlbWF0aWNQbGFjZWhvbGRlcnNXYXJuaW5nKHBsYWNlaG9sZGVycykpO1xuXG4gICAgICAgIHJldHVybiBqb2luKHRoaXMuYmFzZVBhdGgsIHBhdGhQYXR0ZXJuLmdldFBhdGgoKSk7XG4gICAgfVxuXG4gICAgX2NvbmNhdFZpZGVvICh0YXJnZXRWaWRlb1BhdGgsIHsgdGVtcFZpZGVvUGF0aCwgdGVtcE1lcmdlQ29uZmlnUGF0aCwgdG1wTWVyZ2VOYW1lIH0pIHtcbiAgICAgICAgaWYgKHRoaXMuZmlyc3RGaWxlKSB7XG4gICAgICAgICAgICB0aGlzLmZpcnN0RmlsZSA9IGZhbHNlO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgZnMud3JpdGVGaWxlU3luYyh0ZW1wTWVyZ2VDb25maWdQYXRoLCBgXG4gICAgICAgICAgICBmaWxlICcke3RhcmdldFZpZGVvUGF0aH0nXG4gICAgICAgICAgICBmaWxlICcke3RlbXBWaWRlb1BhdGh9J1xuICAgICAgICBgKTtcblxuICAgICAgICBzcGF3blN5bmModGhpcy5mZm1wZWdQYXRoLCBbJy15JywgJy1mJywgJ2NvbmNhdCcsICctc2FmZScsICcwJywgJy1pJywgdGVtcE1lcmdlQ29uZmlnUGF0aCwgJy1jJywgJ2NvcHknLCB0bXBNZXJnZU5hbWVdLCB7IHN0ZGlvOiAnaWdub3JlJyB9KTtcbiAgICAgICAgZnMuY29weUZpbGVTeW5jKHRtcE1lcmdlTmFtZSwgdGVtcFZpZGVvUGF0aCk7XG4gICAgfVxuXG4gICAgYXN5bmMgX29uQnJvd3NlckpvYlN0YXJ0ICgpIHtcbiAgICAgICAgYXdhaXQgdGhpcy50ZW1wRGlyZWN0b3J5LmluaXQoKTtcbiAgICB9XG5cbiAgICBhc3luYyBfb25Ccm93c2VySm9iRG9uZSAoKSB7XG4gICAgICAgIGF3YWl0IHRoaXMudGVtcERpcmVjdG9yeS5kaXNwb3NlKCk7XG4gICAgfVxuXG4gICAgYXN5bmMgX29uVGVzdFJ1bkNyZWF0ZSAodGVzdFJ1bkluZm8pIHtcbiAgICAgICAgaWYgKHRlc3RSdW5JbmZvLmxlZ2FjeSlcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICBhd2FpdCB0aGlzLnRlbXBEaXJlY3RvcnlJbml0aWFsaXplZFByb21pc2U7XG5cbiAgICAgICAgY29uc3QgcmVjb3JkaW5nT3B0aW9ucyA9IHtcbiAgICAgICAgICAgIHBhdGg6ICAgICAgICAgICAgdGhpcy50ZW1wRGlyZWN0b3J5LnBhdGgsXG4gICAgICAgICAgICBmZm1wZWdQYXRoOiAgICAgIHRoaXMuZmZtcGVnUGF0aCxcbiAgICAgICAgICAgIGVuY29kaW5nT3B0aW9uczogdGhpcy5lbmNvZGluZ09wdGlvbnNcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCB0ZXN0UnVuVmlkZW9SZWNvcmRlciA9IHRoaXMuX2NyZWF0ZVRlc3RSdW5WaWRlb1JlY29yZGVyKHRlc3RSdW5JbmZvLCByZWNvcmRpbmdPcHRpb25zKTtcbiAgICAgICAgY29uc3QgaXNWaWRlb1N1cHBvcnRlZCAgICAgPSBhd2FpdCB0ZXN0UnVuVmlkZW9SZWNvcmRlci5pc1ZpZGVvU3VwcG9ydGVkKCk7XG5cbiAgICAgICAgaWYgKGlzVmlkZW9TdXBwb3J0ZWQpIHtcbiAgICAgICAgICAgIGF3YWl0IHRlc3RSdW5WaWRlb1JlY29yZGVyLmluaXQoKTtcblxuICAgICAgICAgICAgdGhpcy50ZXN0UnVuVmlkZW9SZWNvcmRlcnNbdGVzdFJ1blZpZGVvUmVjb3JkZXIuaW5kZXhdID0gdGVzdFJ1blZpZGVvUmVjb3JkZXI7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhpcy53YXJuaW5nTG9nLmFkZFdhcm5pbmcoV0FSTklOR19NRVNTQUdFUy52aWRlb05vdFN1cHBvcnRlZEJ5QnJvd3NlciwgdGVzdFJ1blZpZGVvUmVjb3JkZXIudGVzdFJ1bkluZm8uYWxpYXMpO1xuICAgIH1cblxuICAgIF9jcmVhdGVUZXN0UnVuVmlkZW9SZWNvcmRlciAodGVzdFJ1bkluZm8sIHJlY29yZGluZ09wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUZXN0UnVuVmlkZW9SZWNvcmRlcih0ZXN0UnVuSW5mbywgcmVjb3JkaW5nT3B0aW9ucywgdGhpcy53YXJuaW5nTG9nKTtcbiAgICB9XG5cbiAgICBhc3luYyBfb25UZXN0UnVuUmVhZHkgKHsgaW5kZXggfSkge1xuICAgICAgICBjb25zdCB0ZXN0UnVuUmVjb3JkZXIgPSB0aGlzLnRlc3RSdW5WaWRlb1JlY29yZGVyc1tpbmRleF07XG5cbiAgICAgICAgaWYgKCF0ZXN0UnVuUmVjb3JkZXIpXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgYXdhaXQgdGVzdFJ1blJlY29yZGVyLnN0YXJ0Q2FwdHVyaW5nKCk7XG4gICAgfVxuXG4gICAgYXN5bmMgX29uVGVzdFJ1bkJlZm9yZURvbmUgKHsgaW5kZXggfSkge1xuICAgICAgICBjb25zdCB0ZXN0UnVuUmVjb3JkZXIgPSB0aGlzLnRlc3RSdW5WaWRlb1JlY29yZGVyc1tpbmRleF07XG5cbiAgICAgICAgaWYgKCF0ZXN0UnVuUmVjb3JkZXIpXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgZGVsZXRlIHRoaXMudGVzdFJ1blZpZGVvUmVjb3JkZXJzW2luZGV4XTtcblxuICAgICAgICBhd2FpdCB0ZXN0UnVuUmVjb3JkZXIuZmluaXNoQ2FwdHVyaW5nKCk7XG5cbiAgICAgICAgaWYgKHRoaXMuZmFpbGVkT25seSAmJiAhdGVzdFJ1blJlY29yZGVyLmhhc0Vycm9ycylcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICBhd2FpdCB0aGlzLl9zYXZlRmlsZXModGVzdFJ1blJlY29yZGVyKTtcbiAgICB9XG5cbiAgICBhc3luYyBfc2F2ZUZpbGVzICh0ZXN0UnVuUmVjb3JkZXIpIHtcbiAgICAgICAgY29uc3QgdmlkZW9QYXRoID0gdGhpcy5fZ2V0VGFyZ2V0VmlkZW9QYXRoKHRlc3RSdW5SZWNvcmRlcik7XG5cbiAgICAgICAgYXdhaXQgbWFrZURpcihkaXJuYW1lKHZpZGVvUGF0aCkpO1xuXG4gICAgICAgIGlmICh0aGlzLnNpbmdsZUZpbGUpXG4gICAgICAgICAgICB0aGlzLl9jb25jYXRWaWRlbyh2aWRlb1BhdGgsIHRlc3RSdW5SZWNvcmRlci50ZW1wRmlsZXMpO1xuXG4gICAgICAgIGZzLmNvcHlGaWxlU3luYyh0ZXN0UnVuUmVjb3JkZXIudGVtcEZpbGVzLnRlbXBWaWRlb1BhdGgsIHZpZGVvUGF0aCk7XG4gICAgfVxufVxuIl19
