'use strict';

exports.__esModule = true;

var _values = require('babel-runtime/core-js/object/values');

var _values2 = _interopRequireDefault(_values);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _asyncExitHook = require('async-exit-hook');

var _asyncExitHook2 = _interopRequireDefault(_asyncExitHook);

var _tmp = require('tmp');

var _tmp2 = _interopRequireDefault(_tmp);

var _makeDir = require('make-dir');

var _makeDir2 = _interopRequireDefault(_makeDir);

var _lockfile = require('./lockfile');

var _lockfile2 = _interopRequireDefault(_lockfile);

var _cleanupProcess = require('./cleanup-process');

var _cleanupProcess2 = _interopRequireDefault(_cleanupProcess);

var _promisifiedFunctions = require('../../utils/promisified-functions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// NOTE: mutable for testing purposes
const TESTCAFE_TMP_DIRS_ROOT = _path2.default.join(_os2.default.tmpdir(), 'testcafe');
const DEFAULT_NAME_PREFIX = 'tmp';
const USED_TEMP_DIRS = {};
const DEBUG_LOGGER = (0, _debug2.default)('testcafe:utils:temp-directory');

class TempDirectory {
    constructor(namePrefix) {
        this.namePrefix = namePrefix || DEFAULT_NAME_PREFIX;

        this.path = '';
        this.lockFile = null;
    }

    _getTmpDirsList() {
        var _this = this;

        return (0, _asyncToGenerator3.default)(function* () {
            const tmpDirNames = yield (0, _promisifiedFunctions.readDir)(TempDirectory.TEMP_DIRECTORIES_ROOT);

            return tmpDirNames.filter(function (tmpDir) {
                return !USED_TEMP_DIRS[tmpDir];
            }).filter(function (tmpDir) {
                return _path2.default.basename(tmpDir).startsWith(_this.namePrefix);
            });
        })();
    }

    _findFreeTmpDir(tmpDirNames) {
        var _this2 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            for (var _iterator = tmpDirNames, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : (0, _getIterator3.default)(_iterator);;) {
                var _ref;

                if (_isArray) {
                    if (_i >= _iterator.length) break;
                    _ref = _iterator[_i++];
                } else {
                    _i = _iterator.next();
                    if (_i.done) break;
                    _ref = _i.value;
                }

                const tmpDirName = _ref;

                const tmpDirPath = _path2.default.join(TempDirectory.TEMP_DIRECTORIES_ROOT, tmpDirName);

                const lockFile = new _lockfile2.default(tmpDirPath);

                if (lockFile.init()) {
                    _this2.path = tmpDirPath;
                    _this2.lockFile = lockFile;

                    return true;
                }
            }

            return false;
        })();
    }

    _createNewTmpDir() {
        var _this3 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            _this3.path = _tmp2.default.tmpNameSync({ dir: TempDirectory.TEMP_DIRECTORIES_ROOT, prefix: _this3.namePrefix + '-' });

            yield (0, _makeDir2.default)(_this3.path);

            _this3.lockFile = new _lockfile2.default(_this3.path);

            _this3.lockFile.init();
        })();
    }

    _disposeSync() {
        if (!USED_TEMP_DIRS[this.path]) return;

        this.lockFile.dispose();

        delete USED_TEMP_DIRS[this.path];
    }

    static createDirectory(prefix) {
        return (0, _asyncToGenerator3.default)(function* () {
            const tmpDir = new TempDirectory(prefix);

            yield tmpDir.init();

            return tmpDir;
        })();
    }

    static disposeDirectoriesSync() {
        (0, _values2.default)(USED_TEMP_DIRS).forEach(tmpDir => tmpDir._disposeSync());
    }

    init() {
        var _this4 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            yield (0, _makeDir2.default)(TempDirectory.TEMP_DIRECTORIES_ROOT);

            const tmpDirNames = yield _this4._getTmpDirsList(_this4.namePrefix);

            DEBUG_LOGGER('Found temp directories:', tmpDirNames);

            const existingTmpDirFound = yield _this4._findFreeTmpDir(tmpDirNames);

            if (!existingTmpDirFound) yield _this4._createNewTmpDir();

            DEBUG_LOGGER('Temp directory path: ', _this4.path);

            yield _cleanupProcess2.default.init();
            yield _cleanupProcess2.default.addDirectory(_this4.path);

            USED_TEMP_DIRS[_this4.path] = _this4;
        })();
    }

    dispose() {
        var _this5 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            if (!USED_TEMP_DIRS[_this5.path]) return;

            _this5.lockFile.dispose();

            yield _cleanupProcess2.default.removeDirectory(_this5.path);

            delete USED_TEMP_DIRS[_this5.path];
        })();
    }
}

exports.default = TempDirectory; // NOTE: exposed for testing purposes

TempDirectory.TEMP_DIRECTORIES_ROOT = TESTCAFE_TMP_DIRS_ROOT;

(0, _asyncExitHook2.default)(TempDirectory.disposeDirectoriesSync);
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy91dGlscy90ZW1wLWRpcmVjdG9yeS9pbmRleC5qcyJdLCJuYW1lcyI6WyJURVNUQ0FGRV9UTVBfRElSU19ST09UIiwiam9pbiIsInRtcGRpciIsIkRFRkFVTFRfTkFNRV9QUkVGSVgiLCJVU0VEX1RFTVBfRElSUyIsIkRFQlVHX0xPR0dFUiIsIlRlbXBEaXJlY3RvcnkiLCJjb25zdHJ1Y3RvciIsIm5hbWVQcmVmaXgiLCJwYXRoIiwibG9ja0ZpbGUiLCJfZ2V0VG1wRGlyc0xpc3QiLCJ0bXBEaXJOYW1lcyIsIlRFTVBfRElSRUNUT1JJRVNfUk9PVCIsImZpbHRlciIsInRtcERpciIsImJhc2VuYW1lIiwic3RhcnRzV2l0aCIsIl9maW5kRnJlZVRtcERpciIsInRtcERpck5hbWUiLCJ0bXBEaXJQYXRoIiwiaW5pdCIsIl9jcmVhdGVOZXdUbXBEaXIiLCJ0bXBOYW1lU3luYyIsImRpciIsInByZWZpeCIsIl9kaXNwb3NlU3luYyIsImRpc3Bvc2UiLCJjcmVhdGVEaXJlY3RvcnkiLCJkaXNwb3NlRGlyZWN0b3JpZXNTeW5jIiwiZm9yRWFjaCIsImV4aXN0aW5nVG1wRGlyRm91bmQiLCJhZGREaXJlY3RvcnkiLCJyZW1vdmVEaXJlY3RvcnkiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFHQTtBQUNBLE1BQU1BLHlCQUF5QixlQUFLQyxJQUFMLENBQVUsYUFBR0MsTUFBSCxFQUFWLEVBQXVCLFVBQXZCLENBQS9CO0FBQ0EsTUFBTUMsc0JBQXlCLEtBQS9CO0FBQ0EsTUFBTUMsaUJBQXlCLEVBQS9CO0FBQ0EsTUFBTUMsZUFBeUIscUJBQU0sK0JBQU4sQ0FBL0I7O0FBRWUsTUFBTUMsYUFBTixDQUFvQjtBQUMvQkMsZ0JBQWFDLFVBQWIsRUFBeUI7QUFDckIsYUFBS0EsVUFBTCxHQUFrQkEsY0FBY0ws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QTtBQUNiLGdCQUFJLENBQUN2QixlQUFlLE9BQUtLLElBQXBCLENBQUwsRUFDSTs7QUFFSixtQkFBS0MsUUFBTCxDQUFjaUIsT0FBZDs7QUFFQSxrQkFBTSx5QkFBZU0sZUFBZixDQUErQixPQUFLeEIsSUFBcEMsQ0FBTjs7QUFFQSxtQkFBT0wsZUFBZSxPQUFLSyxJQUFwQixDQUFQO0FBUmE7QUFTaEI7QUE3RjhCOztrQkFBZEgsYSxFQWdHckI7O0FBQ0FBLGNBQWNPLHFCQUFkLEdBQXNDYixzQkFBdEM7O0FBRUEsNkJBQWNNLGNBQWN1QixzQkFBNUIiLCJmaWxlIjoidXRpbHMvdGVtcC1kaXJlY3RvcnkvaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZGVidWcgZnJvbSAnZGVidWcnO1xuaW1wb3J0IG9zIGZyb20gJ29zJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHNldHVwRXhpdEhvb2sgZnJvbSAnYXN5bmMtZXhpdC1ob29rJztcbmltcG9ydCB0bXAgZnJvbSAndG1wJztcbmltcG9ydCBtYWtlRGlyIGZyb20gJ21ha2UtZGlyJztcbmltcG9ydCBMb2NrRmlsZSBmcm9tICcuL2xvY2tmaWxlJztcbmltcG9ydCBjbGVhbnVwUHJvY2VzcyBmcm9tICcuL2NsZWFudXAtcHJvY2Vzcyc7XG5pbXBvcnQgeyByZWFkRGlyIH0gZnJvbSAnLi4vLi4vdXRpbHMvcHJvbWlzaWZpZWQtZnVuY3Rpb25zJztcblxuXG4vLyBOT1RFOiBtdXRhYmxlIGZvciB0ZXN0aW5nIHB1cnBvc2VzXG5jb25zdCBURVNUQ0FGRV9UTVBfRElSU19ST09UID0gcGF0aC5qb2luKG9zLnRtcGRpcigpLCAndGVzdGNhZmUnKTtcbmNvbnN0IERFRkFVTFRfTkFNRV9QUkVGSVggICAgPSAndG1wJztcbmNvbnN0IFVTRURfVEVNUF9ESVJTICAgICAgICAgPSB7fTtcbmNvbnN0IERFQlVHX0xPR0dFUiAgICAgICAgICAgPSBkZWJ1ZygndGVzdGNhZmU6dXRpbHM6dGVtcC1kaXJlY3RvcnknKTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGVtcERpcmVjdG9yeSB7XG4gICAgY29uc3RydWN0b3IgKG5hbWVQcmVmaXgpIHtcbiAgICAgICAgdGhpcy5uYW1lUHJlZml4ID0gbmFtZVByZWZpeCB8fCBERUZBVUxUX05BTUVfUFJFRklYO1xuXG4gICAgICAgIHRoaXMucGF0aCAgICAgPSAnJztcbiAgICAgICAgdGhpcy5sb2NrRmlsZSA9IG51bGw7XG4gICAgfVxuXG4gICAgYXN5bmMgX2dldFRtcERpcnNMaXN0ICgpIHtcbiAgICAgICAgY29uc3QgdG1wRGlyTmFtZXMgPSBhd2FpdCByZWFkRGlyKFRlbXBEaXJlY3RvcnkuVEVNUF9ESVJFQ1RPUklFU19ST09UKTtcblxuICAgICAgICByZXR1cm4gdG1wRGlyTmFtZXNcbiAgICAgICAgICAgIC5maWx0ZXIodG1wRGlyID0+ICFVU0VEX1RFTVBfRElSU1t0bXBEaXJdKVxuICAgICAgICAgICAgLmZpbHRlcih0bXBEaXIgPT4gcGF0aC5iYXNlbmFtZSh0bXBEaXIpLnN0YXJ0c1dpdGgodGhpcy5uYW1lUHJlZml4KSk7XG4gICAgfVxuXG4gICAgYXN5bmMgX2ZpbmRGcmVlVG1wRGlyICh0bXBEaXJOYW1lcykge1xuICAgICAgICBmb3IgKGNvbnN0IHRtcERpck5hbWUgb2YgdG1wRGlyTmFtZXMpIHtcbiAgICAgICAgICAgIGNvbnN0IHRtcERpclBhdGggPSBwYXRoLmpvaW4oVGVtcERpcmVjdG9yeS5URU1QX0RJUkVDVE9SSUVTX1JPT1QsIHRtcERpck5hbWUpO1xuXG4gICAgICAgICAgICBjb25zdCBsb2NrRmlsZSA9IG5ldyBMb2NrRmlsZSh0bXBEaXJQYXRoKTtcblxuICAgICAgICAgICAgaWYgKGxvY2tGaWxlLmluaXQoKSkge1xuICAgICAgICAgICAgICAgIHRoaXMucGF0aCAgICAgPSB0bXBEaXJQYXRoO1xuICAgICAgICAgICAgICAgIHRoaXMubG9ja0ZpbGUgPSBsb2NrRmlsZTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGFzeW5jIF9jcmVhdGVOZXdUbXBEaXIgKCkge1xuICAgICAgICB0aGlzLnBhdGggPSB0bXAudG1wTmFtZVN5bmMoeyBkaXI6IFRlbXBEaXJlY3RvcnkuVEVNUF9ESVJFQ1RPUklFU19ST09ULCBwcmVmaXg6IHRoaXMubmFtZVByZWZpeCArICctJyB9KTtcblxuICAgICAgICBhd2FpdCBtYWtlRGlyKHRoaXMucGF0aCk7XG5cbiAgICAgICAgdGhpcy5sb2NrRmlsZSA9IG5ldyBMb2NrRmlsZSh0aGlzLnBhdGgpO1xuXG4gICAgICAgIHRoaXMubG9ja0ZpbGUuaW5pdCgpO1xuICAgIH1cblxuICAgIF9kaXNwb3NlU3luYyAoKSB7XG4gICAgICAgIGlmICghVVNFRF9URU1QX0RJUlNbdGhpcy5wYXRoXSlcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICB0aGlzLmxvY2tGaWxlLmRpc3Bvc2UoKTtcblxuICAgICAgICBkZWxldGUgVVNFRF9URU1QX0RJUlNbdGhpcy5wYXRoXTtcbiAgICB9XG5cbiAgICBzdGF0aWMgYXN5bmMgY3JlYXRlRGlyZWN0b3J5IChwcmVmaXgpIHtcbiAgICAgICAgY29uc3QgdG1wRGlyID0gbmV3IFRlbXBEaXJlY3RvcnkocHJlZml4KTtcblxuICAgICAgICBhd2FpdCB0bXBEaXIuaW5pdCgpO1xuXG4gICAgICAgIHJldHVybiB0bXBEaXI7XG4gICAgfVxuXG4gICAgc3RhdGljIGRpc3Bvc2VEaXJlY3Rvcmllc1N5bmMgKCkge1xuICAgICAgICBPYmplY3QudmFsdWVzKFVTRURfVEVNUF9ESVJTKS5mb3JFYWNoKHRtcERpciA9PiB0bXBEaXIuX2Rpc3Bvc2VTeW5jKCkpO1xuICAgIH1cblxuICAgIGFzeW5jIGluaXQgKCkge1xuICAgICAgICBhd2FpdCBtYWtlRGlyKFRlbXBEaXJlY3RvcnkuVEVNUF9ESVJFQ1RPUklFU19ST09UKTtcblxuICAgICAgICBjb25zdCB0bXBEaXJOYW1lcyA9IGF3YWl0IHRoaXMuX2dldFRtcERpcnNMaXN0KHRoaXMubmFtZVByZWZpeCk7XG5cbiAgICAgICAgREVCVUdfTE9HR0VSKCdGb3VuZCB0ZW1wIGRpcmVjdG9yaWVzOicsIHRtcERpck5hbWVzKTtcblxuICAgICAgICBjb25zdCBleGlzdGluZ1RtcERpckZvdW5kID0gYXdhaXQgdGhpcy5fZmluZEZyZWVUbXBEaXIodG1wRGlyTmFtZXMpO1xuXG4gICAgICAgIGlmICghZXhpc3RpbmdUbXBEaXJGb3VuZClcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuX2NyZWF0ZU5ld1RtcERpcigpO1xuXG4gICAgICAgIERFQlVHX0xPR0dFUignVGVtcCBkaXJlY3RvcnkgcGF0aDogJywgdGhpcy5wYXRoKTtcblxuICAgICAgICBhd2FpdCBjbGVhbnVwUHJvY2Vzcy5pbml0KCk7XG4gICAgICAgIGF3YWl0IGNsZWFudXBQcm9jZXNzLmFkZERpcmVjdG9yeSh0aGlzLnBhdGgpO1xuXG4gICAgICAgIFVTRURfVEVNUF9ESVJTW3RoaXMucGF0aF0gPSB0aGlzO1xuICAgIH1cblxuICAgIGFzeW5jIGRpc3Bvc2UgKCkge1xuICAgICAgICBpZiAoIVVTRURfVEVNUF9ESVJTW3RoaXMucGF0aF0pXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgdGhpcy5sb2NrRmlsZS5kaXNwb3NlKCk7XG5cbiAgICAgICAgYXdhaXQgY2xlYW51cFByb2Nlc3MucmVtb3ZlRGlyZWN0b3J5KHRoaXMucGF0aCk7XG5cbiAgICAgICAgZGVsZXRlIFVTRURfVEVNUF9ESVJTW3RoaXMucGF0aF07XG4gICAgfVxufVxuXG4vLyBOT1RFOiBleHBvc2VkIGZvciB0ZXN0aW5nIHB1cnBvc2VzXG5UZW1wRGlyZWN0b3J5LlRFTVBfRElSRUNUT1JJRVNfUk9PVCA9IFRFU1RDQUZFX1RNUF9ESVJTX1JPT1Q7XG5cbnNldHVwRXhpdEhvb2soVGVtcERpcmVjdG9yeS5kaXNwb3NlRGlyZWN0b3JpZXNTeW5jKTtcbiJdfQ==
