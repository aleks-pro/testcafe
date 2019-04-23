'use strict';

exports.__esModule = true;

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _entries = require('babel-runtime/core-js/object/entries');

var _entries2 = _interopRequireDefault(_entries);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _child_process = require('child_process');

var _lodash = require('lodash');

var _pinkie = require('pinkie');

var _pinkie2 = _interopRequireDefault(_pinkie);

var _asyncEventEmitter = require('../utils/async-event-emitter');

var _asyncEventEmitter2 = _interopRequireDefault(_asyncEventEmitter);

var _delay = require('../utils/delay');

var _delay2 = _interopRequireDefault(_delay);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const DEBUG_LOGGER_PREFIX = 'testcafe:video-recorder:process:';

const DEFAULT_OPTIONS = {
    // NOTE: don't ask confirmation for rewriting the output file
    'y': true,

    // NOTE: use the time when a frame is read from the source as its timestamp
    // IMPORTANT: must be specified before configuring the source
    'use_wallclock_as_timestamps': 1,

    // NOTE: use stdin as a source
    'i': 'pipe:0',

    // NOTE: use the H.264 video codec
    'c:v': 'libx264',

    // NOTE: use the 'ultrafast' compression preset
    'preset': 'ultrafast',

    // NOTE: use the yuv420p pixel format (the most widely supported)
    'pix_fmt': 'yuv420p',

    // NOTE: scale input frames to make the frame height divisible by 2 (yuv420p's requirement)
    'vf': 'scale=trunc(iw/2)*2:trunc(ih/2)*2',

    // NOTE: set the frame rate to 30 in the output video (the most widely supported)
    'r': 30
};

const FFMPEG_START_DELAY = 500;

class VideoRecorder extends _asyncEventEmitter2.default {
    constructor(basePath, ffmpegPath, connection, customOptions) {
        super();

        this.debugLogger = (0, _debug2.default)(DEBUG_LOGGER_PREFIX + connection.id);

        this.customOptions = customOptions;
        this.videoPath = basePath;
        this.connection = connection;
        this.ffmpegPath = ffmpegPath;
        this.ffmpegProcess = null;

        this.ffmpegStdoutBuf = '';
        this.ffmpegStderrBuf = '';

        this.ffmpegClosingPromise = null;

        this.closed = false;

        this.optionsList = this._getOptionsList();

        this.capturingPromise = null;
    }

    static _filterOption([key, value]) {
        if (value === true) return ['-' + key];

        return ['-' + key, value];
    }

    _setupFFMPEGBuffers() {
        this.ffmpegProcess.stdout.on('data', data => {
            this.ffmpegStdoutBuf += String(data);
        });

        this.ffmpegProcess.stderr.on('data', data => {
            this.ffmpegStderrBuf += String(data);
        });
    }

    _getChildProcessPromise() {
        return new _pinkie2.default((resolve, reject) => {
            this.ffmpegProcess.on('exit', resolve);
            this.ffmpegProcess.on('error', reject);
        });
    }

    _getOptionsList() {
        const optionsObject = (0, _assign2.default)({}, DEFAULT_OPTIONS, this.customOptions);

        const optionsList = (0, _lodash.flatten)((0, _entries2.default)(optionsObject).map(VideoRecorder._filterOption));

        optionsList.push(this.videoPath);

        return optionsList;
    }

    _addFrame(frameData) {
        var _this = this;

        return (0, _asyncToGenerator3.default)(function* () {
            const writingFinished = _this.ffmpegProcess.stdin.write(frameData);

            if (!writingFinished) yield new _pinkie2.default(function (r) {
                return _this.ffmpegProcess.stdin.once('drain', r);
            });
        })();
    }

    _capture() {
        var _this2 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            while (!_this2.closed) {
                try {
                    const frame = yield _this2.connection.provider.getVideoFrameData(_this2.connection.id);

                    if (frame) {
                        yield _this2.emit('frame');
                        yield _this2._addFrame(frame);
                    }
                } catch (error) {
                    _this2.debugLogger(error);
                }
            }
        })();
    }

    init() {
        var _this3 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            _this3.ffmpegProcess = (0, _child_process.spawn)(_this3.ffmpegPath, _this3.optionsList, { stdio: 'pipe' });

            _this3._setupFFMPEGBuffers();

            _this3.ffmpegClosingPromise = _this3._getChildProcessPromise().then(function (code) {
                _this3.closed = true;

                if (code) {
                    _this3.debugLogger(code);
                    _this3.debugLogger(_this3.ffmpegStdoutBuf);
                    _this3.debugLogger(_this3.ffmpegStderrBuf);
                }
            }).catch(function (error) {
                _this3.closed = true;

                _this3.debugLogger(error);
                _this3.debugLogger(_this3.ffmpegStdoutBuf);
                _this3.debugLogger(_this3.ffmpegStderrBuf);
            });

            yield (0, _delay2.default)(FFMPEG_START_DELAY);
        })();
    }

    startCapturing() {
        var _this4 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            _this4.capturingPromise = _this4._capture();

            yield _this4.once('frame');
        })();
    }

    finishCapturing() {
        var _this5 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            if (_this5.closed) return;

            _this5.closed = true;

            yield _this5.capturingPromise;

            _this5.ffmpegProcess.stdin.end();

            yield _this5.ffmpegClosingPromise;
        })();
    }
}
exports.default = VideoRecorder;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy92aWRlby1yZWNvcmRlci9wcm9jZXNzLmpzIl0sIm5hbWVzIjpbIkRFQlVHX0xPR0dFUl9QUkVGSVgiLCJERUZBVUxUX09QVElPTlMiLCJGRk1QRUdfU1RBUlRfREVMQVkiLCJWaWRlb1JlY29yZGVyIiwiY29uc3RydWN0b3IiLCJiYXNlUGF0aCIsImZmbXBlZ1BhdGgiLCJjb25uZWN0aW9uIiwiY3VzdG9tT3B0aW9ucyIsImRlYnVnTG9nZ2VyIiwiaWQiLCJ2aWRlb1BhdGgiLCJmZm1wZWdQcm9jZXNzIiwiZmZtcGVnU3Rkb3V0QnVmIiwiZmZtcGVnU3RkZXJyQnVmIiwiZmZtcGVnQ2xvc2luZ1Byb21pc2UiLCJjbG9zZWQiLCJvcHRpb25zTGlzdCIsIl9nZXRPcHRpb25zTGlzdCIsImNhcHR1cmluZ1Byb21pc2UiLCJfZmlsdGVyT3B0aW9uIiwia2V5IiwidmFsdWUiLCJfc2V0dXBGRk1QRUdCdWZmZXJzIiwic3Rkb3V0Iiwib24iLCJkYXRhIiwiU3RyaW5nIiwic3RkZXJyIiwiX2dldENoaWxkUHJvY2Vzc1Byb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0Iiwib3B0aW9uc09iamVjdCIsIm1hcCIsInB1c2giLCJfYWRkRnJhbWUiLCJmcmFtZURhdGEiLCJ3cml0aW5nRmluaXNoZWQiLCJzdGRpbiIsIndyaXRlIiwib25jZSIsInIiLCJfY2FwdHVyZSIsImZyYW1lIiwicHJvdmlkZXIiLCJnZXRWaWRlb0ZyYW1lRGF0YSIsImVtaXQiLCJlcnJvciIsImluaXQiLCJzdGRpbyIsInRoZW4iLCJjb2RlIiwiY2F0Y2giLCJzdGFydENhcHR1cmluZyIsImZpbmlzaENhcHR1cmluZyIsImVuZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOzs7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7QUFHQSxNQUFNQSxzQkFBc0Isa0NBQTVCOztBQUVBLE1BQU1DLGtCQUFrQjtBQUNwQjtBQUNBLFNBQUssSUFGZTs7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bUJBLGtCQUFNLHFCQUFNWixrQkFBTixDQUFOO0FBeEJVO0FBeUJiOztBQUVLbUQsa0JBQU4sR0FBd0I7QUFBQTs7QUFBQTtBQUNwQixtQkFBS2xDLGdCQUFMLEdBQXdCLE9BQUt1QixRQUFMLEVBQXhCOztBQUVBLGtCQUFNLE9BQUtGLElBQUwsQ0FBVSxPQUFWLENBQU47QUFIb0I7QUFJdkI7O0FBRUtjLG1CQUFOLEdBQXlCO0FBQUE7O0FBQUE7QUFDckIsZ0JBQUksT0FBS3RDLE1BQVQsRUFDSTs7QUFFSixtQkFBS0EsTUFBTCxHQUFjLElBQWQ7O0FBRUEsa0JBQU0sT0FBS0csZ0JBQVg7O0FBRUEsbUJBQUtQLGFBQUwsQ0FBbUIwQixLQUFuQixDQUF5QmlCLEdBQXpCOztBQUVBLGtCQUFNLE9BQUt4QyxvQkFBWDtBQVZxQjtBQVd4QjtBQTdIbUQ7a0JBQW5DWixhIiwiZmlsZSI6InZpZGVvLXJlY29yZGVyL3Byb2Nlc3MuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZGVidWcgZnJvbSAnZGVidWcnO1xuaW1wb3J0IHsgc3Bhd24gfSBmcm9tICdjaGlsZF9wcm9jZXNzJztcbmltcG9ydCB7IGZsYXR0ZW4gfSBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IFByb21pc2UgZnJvbSAncGlua2llJztcbmltcG9ydCBBc3luY0VtaXR0ZXIgZnJvbSAnLi4vdXRpbHMvYXN5bmMtZXZlbnQtZW1pdHRlcic7XG5pbXBvcnQgZGVsYXkgZnJvbSAnLi4vdXRpbHMvZGVsYXknO1xuXG5cbmNvbnN0IERFQlVHX0xPR0dFUl9QUkVGSVggPSAndGVzdGNhZmU6dmlkZW8tcmVjb3JkZXI6cHJvY2VzczonO1xuXG5jb25zdCBERUZBVUxUX09QVElPTlMgPSB7XG4gICAgLy8gTk9URTogZG9uJ3QgYXNrIGNvbmZpcm1hdGlvbiBmb3IgcmV3cml0aW5nIHRoZSBvdXRwdXQgZmlsZVxuICAgICd5JzogdHJ1ZSxcblxuICAgIC8vIE5PVEU6IHVzZSB0aGUgdGltZSB3aGVuIGEgZnJhbWUgaXMgcmVhZCBmcm9tIHRoZSBzb3VyY2UgYXMgaXRzIHRpbWVzdGFtcFxuICAgIC8vIElNUE9SVEFOVDogbXVzdCBiZSBzcGVjaWZpZWQgYmVmb3JlIGNvbmZpZ3VyaW5nIHRoZSBzb3VyY2VcbiAgICAndXNlX3dhbGxjbG9ja19hc190aW1lc3RhbXBzJzogMSxcblxuICAgIC8vIE5PVEU6IHVzZSBzdGRpbiBhcyBhIHNvdXJjZVxuICAgICdpJzogJ3BpcGU6MCcsXG5cbiAgICAvLyBOT1RFOiB1c2UgdGhlIEguMjY0IHZpZGVvIGNvZGVjXG4gICAgJ2M6dic6ICdsaWJ4MjY0JyxcblxuICAgIC8vIE5PVEU6IHVzZSB0aGUgJ3VsdHJhZmFzdCcgY29tcHJlc3Npb24gcHJlc2V0XG4gICAgJ3ByZXNldCc6ICd1bHRyYWZhc3QnLFxuXG4gICAgLy8gTk9URTogdXNlIHRoZSB5dXY0MjBwIHBpeGVsIGZvcm1hdCAodGhlIG1vc3Qgd2lkZWx5IHN1cHBvcnRlZClcbiAgICAncGl4X2ZtdCc6ICd5dXY0MjBwJyxcblxuICAgIC8vIE5PVEU6IHNjYWxlIGlucHV0IGZyYW1lcyB0byBtYWtlIHRoZSBmcmFtZSBoZWlnaHQgZGl2aXNpYmxlIGJ5IDIgKHl1djQyMHAncyByZXF1aXJlbWVudClcbiAgICAndmYnOiAnc2NhbGU9dHJ1bmMoaXcvMikqMjp0cnVuYyhpaC8yKSoyJyxcblxuICAgIC8vIE5PVEU6IHNldCB0aGUgZnJhbWUgcmF0ZSB0byAzMCBpbiB0aGUgb3V0cHV0IHZpZGVvICh0aGUgbW9zdCB3aWRlbHkgc3VwcG9ydGVkKVxuICAgICdyJzogMzBcbn07XG5cbmNvbnN0IEZGTVBFR19TVEFSVF9ERUxBWSA9IDUwMDtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVmlkZW9SZWNvcmRlciBleHRlbmRzIEFzeW5jRW1pdHRlciB7XG4gICAgY29uc3RydWN0b3IgKGJhc2VQYXRoLCBmZm1wZWdQYXRoLCBjb25uZWN0aW9uLCBjdXN0b21PcHRpb25zKSB7XG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgdGhpcy5kZWJ1Z0xvZ2dlciA9IGRlYnVnKERFQlVHX0xPR0dFUl9QUkVGSVggKyBjb25uZWN0aW9uLmlkKTtcblxuICAgICAgICB0aGlzLmN1c3RvbU9wdGlvbnMgPSBjdXN0b21PcHRpb25zO1xuICAgICAgICB0aGlzLnZpZGVvUGF0aCAgICAgPSBiYXNlUGF0aDtcbiAgICAgICAgdGhpcy5jb25uZWN0aW9uICAgID0gY29ubmVjdGlvbjtcbiAgICAgICAgdGhpcy5mZm1wZWdQYXRoICAgID0gZmZtcGVnUGF0aDtcbiAgICAgICAgdGhpcy5mZm1wZWdQcm9jZXNzID0gbnVsbDtcblxuICAgICAgICB0aGlzLmZmbXBlZ1N0ZG91dEJ1ZiA9ICcnO1xuICAgICAgICB0aGlzLmZmbXBlZ1N0ZGVyckJ1ZiA9ICcnO1xuXG4gICAgICAgIHRoaXMuZmZtcGVnQ2xvc2luZ1Byb21pc2UgPSBudWxsO1xuXG4gICAgICAgIHRoaXMuY2xvc2VkID0gZmFsc2U7XG5cbiAgICAgICAgdGhpcy5vcHRpb25zTGlzdCA9IHRoaXMuX2dldE9wdGlvbnNMaXN0KCk7XG5cbiAgICAgICAgdGhpcy5jYXB0dXJpbmdQcm9taXNlID0gbnVsbDtcbiAgICB9XG5cbiAgICBzdGF0aWMgX2ZpbHRlck9wdGlvbiAoW2tleSwgdmFsdWVdKSB7XG4gICAgICAgIGlmICh2YWx1ZSA9PT0gdHJ1ZSlcbiAgICAgICAgICAgIHJldHVybiBbJy0nICsga2V5XTtcblxuICAgICAgICByZXR1cm4gWyctJyArIGtleSwgdmFsdWVdO1xuICAgIH1cblxuICAgIF9zZXR1cEZGTVBFR0J1ZmZlcnMgKCkge1xuICAgICAgICB0aGlzLmZmbXBlZ1Byb2Nlc3Muc3Rkb3V0Lm9uKCdkYXRhJywgZGF0YSA9PiB7XG4gICAgICAgICAgICB0aGlzLmZmbXBlZ1N0ZG91dEJ1ZiArPSBTdHJpbmcoZGF0YSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuZmZtcGVnUHJvY2Vzcy5zdGRlcnIub24oJ2RhdGEnLCBkYXRhID0+IHtcbiAgICAgICAgICAgIHRoaXMuZmZtcGVnU3RkZXJyQnVmICs9IFN0cmluZyhkYXRhKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgX2dldENoaWxkUHJvY2Vzc1Byb21pc2UgKCkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5mZm1wZWdQcm9jZXNzLm9uKCdleGl0JywgcmVzb2x2ZSk7XG4gICAgICAgICAgICB0aGlzLmZmbXBlZ1Byb2Nlc3Mub24oJ2Vycm9yJywgcmVqZWN0KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgX2dldE9wdGlvbnNMaXN0ICgpIHtcbiAgICAgICAgY29uc3Qgb3B0aW9uc09iamVjdCA9IE9iamVjdC5hc3NpZ24oe30sIERFRkFVTFRfT1BUSU9OUywgdGhpcy5jdXN0b21PcHRpb25zKTtcblxuICAgICAgICBjb25zdCBvcHRpb25zTGlzdCA9IGZsYXR0ZW4oT2JqZWN0LmVudHJpZXMob3B0aW9uc09iamVjdCkubWFwKFZpZGVvUmVjb3JkZXIuX2ZpbHRlck9wdGlvbikpO1xuXG4gICAgICAgIG9wdGlvbnNMaXN0LnB1c2godGhpcy52aWRlb1BhdGgpO1xuXG4gICAgICAgIHJldHVybiBvcHRpb25zTGlzdDtcbiAgICB9XG5cbiAgICBhc3luYyBfYWRkRnJhbWUgKGZyYW1lRGF0YSkge1xuICAgICAgICBjb25zdCB3cml0aW5nRmluaXNoZWQgPSB0aGlzLmZmbXBlZ1Byb2Nlc3Muc3RkaW4ud3JpdGUoZnJhbWVEYXRhKTtcblxuICAgICAgICBpZiAoIXdyaXRpbmdGaW5pc2hlZClcbiAgICAgICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHIgPT4gdGhpcy5mZm1wZWdQcm9jZXNzLnN0ZGluLm9uY2UoJ2RyYWluJywgcikpO1xuICAgIH1cblxuICAgIGFzeW5jIF9jYXB0dXJlICgpIHtcbiAgICAgICAgd2hpbGUgKCF0aGlzLmNsb3NlZCkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCBmcmFtZSA9IGF3YWl0IHRoaXMuY29ubmVjdGlvbi5wcm92aWRlci5nZXRWaWRlb0ZyYW1lRGF0YSh0aGlzLmNvbm5lY3Rpb24uaWQpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGZyYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuZW1pdCgnZnJhbWUnKTtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5fYWRkRnJhbWUoZnJhbWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIHRoaXMuZGVidWdMb2dnZXIoZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgYXN5bmMgaW5pdCAoKSB7XG4gICAgICAgIHRoaXMuZmZtcGVnUHJvY2VzcyA9IHNwYXduKHRoaXMuZmZtcGVnUGF0aCwgdGhpcy5vcHRpb25zTGlzdCwgeyBzdGRpbzogJ3BpcGUnIH0pO1xuXG4gICAgICAgIHRoaXMuX3NldHVwRkZNUEVHQnVmZmVycygpO1xuXG4gICAgICAgIHRoaXMuZmZtcGVnQ2xvc2luZ1Byb21pc2UgPSB0aGlzXG4gICAgICAgICAgICAuX2dldENoaWxkUHJvY2Vzc1Byb21pc2UoKVxuICAgICAgICAgICAgLnRoZW4oY29kZSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5jbG9zZWQgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgaWYgKGNvZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWJ1Z0xvZ2dlcihjb2RlKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWJ1Z0xvZ2dlcih0aGlzLmZmbXBlZ1N0ZG91dEJ1Zik7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGVidWdMb2dnZXIodGhpcy5mZm1wZWdTdGRlcnJCdWYpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuY2xvc2VkID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgIHRoaXMuZGVidWdMb2dnZXIoZXJyb3IpO1xuICAgICAgICAgICAgICAgIHRoaXMuZGVidWdMb2dnZXIodGhpcy5mZm1wZWdTdGRvdXRCdWYpO1xuICAgICAgICAgICAgICAgIHRoaXMuZGVidWdMb2dnZXIodGhpcy5mZm1wZWdTdGRlcnJCdWYpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgYXdhaXQgZGVsYXkoRkZNUEVHX1NUQVJUX0RFTEFZKTtcbiAgICB9XG5cbiAgICBhc3luYyBzdGFydENhcHR1cmluZyAoKSB7XG4gICAgICAgIHRoaXMuY2FwdHVyaW5nUHJvbWlzZSA9IHRoaXMuX2NhcHR1cmUoKTtcblxuICAgICAgICBhd2FpdCB0aGlzLm9uY2UoJ2ZyYW1lJyk7XG4gICAgfVxuXG4gICAgYXN5bmMgZmluaXNoQ2FwdHVyaW5nICgpIHtcbiAgICAgICAgaWYgKHRoaXMuY2xvc2VkKVxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMuY2xvc2VkID0gdHJ1ZTtcblxuICAgICAgICBhd2FpdCB0aGlzLmNhcHR1cmluZ1Byb21pc2U7XG5cbiAgICAgICAgdGhpcy5mZm1wZWdQcm9jZXNzLnN0ZGluLmVuZCgpO1xuXG4gICAgICAgIGF3YWl0IHRoaXMuZmZtcGVnQ2xvc2luZ1Byb21pc2U7XG4gICAgfVxufVxuIl19
