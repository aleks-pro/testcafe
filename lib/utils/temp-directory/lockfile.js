'use strict';

exports.__esModule = true;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const LOCKFILE_NAME = '.testcafe-lockfile';
const STALE_LOCKFILE_AGE = 2 * 24 * 60 * 60 * 1000;
const DEBUG_LOGGER = (0, _debug2.default)('testcafe:utils:temp-directory:lockfile');

class LockFile {
    constructor(dirPath) {
        this.path = _path2.default.join(dirPath, LOCKFILE_NAME);
    }

    _open({ force = false } = {}) {
        try {
            _fs2.default.writeFileSync(this.path, '', { flag: force ? 'w' : 'wx' });

            return true;
        } catch (e) {
            DEBUG_LOGGER('Failed to init lockfile ' + this.path);
            DEBUG_LOGGER(e);

            return false;
        }
    }

    _isStale() {
        const currentMs = Date.now();

        try {
            var _fs$statSync = _fs2.default.statSync(this.path);

            const mtimeMs = _fs$statSync.mtimeMs;


            return currentMs - mtimeMs > STALE_LOCKFILE_AGE;
        } catch (e) {
            DEBUG_LOGGER('Failed to check status of lockfile ' + this.path);
            DEBUG_LOGGER(e);

            return false;
        }
    }

    init() {
        if (this._open()) return true;

        if (this._isStale()) return this._open({ force: true });

        return false;
    }

    dispose() {
        try {
            _fs2.default.unlinkSync(this.path);
        } catch (e) {
            DEBUG_LOGGER('Failed to dispose lockfile ' + this.path);
            DEBUG_LOGGER(e);
        }
    }
}
exports.default = LockFile;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy91dGlscy90ZW1wLWRpcmVjdG9yeS9sb2NrZmlsZS5qcyJdLCJuYW1lcyI6WyJMT0NLRklMRV9OQU1FIiwiU1RBTEVfTE9DS0ZJTEVfQUdFIiwiREVCVUdfTE9HR0VSIiwiTG9ja0ZpbGUiLCJjb25zdHJ1Y3RvciIsImRpclBhdGgiLCJwYXRoIiwiam9pbiIsIl9vcGVuIiwiZm9yY2UiLCJ3cml0ZUZpbGVTeW5jIiwiZmxhZyIsImUiLCJfaXNTdGFsZSIsImN1cnJlbnRNcyIsIkRhdGUiLCJub3ciLCJzdGF0U3luYyIsIm10aW1lTXMiLCJpbml0IiwiZGlzcG9zZSIsInVubGlua1N5bmMiXSwibWFwcGluZ3MiOiI7Ozs7QUFBQTs7OztBQUNBOzs7O0FBQ0E7Ozs7OztBQUdBLE1BQU1BLGdCQUFxQixvQkFBM0I7QUFDQSxNQUFNQyxxQkFBcUIsSUFBSSxFQUFKLEdBQVMsRUFBVCxHQUFjLEVBQWQsR0FBbUIsSUFBOUM7QUFDQSxNQUFNQyxlQUFxQixxQkFBTSx3Q0FBTixDQUEzQjs7QUFFZSxNQUFNQyxRQUFOLENBQWU7QUFDMUJDLGdCQUFhQyxPQUFiLEVBQXNCO0FBQ2xCLGFBQUtDLElBQUwsR0FBWSxlQUFLQyxJQUFMLENBQVVGLE9BQVYsRUFBbUJMLGFBQW5CLENBQVo7QUFDSDs7QUFFRFEsVUFBTyxFQUFFQyxRQUFRLEtBQVYsS0FBb0IsRUFBM0IsRUFBK0I7QUFDM0IsWUFBSTtBQUNBLHlCQUFHQyxhQUFILENBQWlCLEtBQUtKLElBQXRCLEVBQTRCLEVBQTVCLEVBQWdDLEVBQUVLLE1BQU1GLFFBQVEsR0FBUixHQUFjLElBQXRCLEVBQWhDOztBQUVBLG1CQUFPLElBQVA7QUFDSCxTQUpELENBS0EsT0FBT0csQ0FBUCxFQUFVO0FBQ05WLHlCQUFhLDZCQUE2QixLQUFLSSxJQUEvQztBQUNBSix5QkFBYVUsQ0FBYjs7QUFFQSxtQkFBTyxLQUFQO0FBQ0g7QUFDSjs7QUFFREMsZUFBWTtBQUNSLGNBQU1DLFlBQVlDLEtBQUtDLEdBQUwsRUFBbEI7O0FBRUEsWUFBSTtBQUFBLCtCQUNvQixhQUFHQyxRQUFILENBQVksS0FBS1gsSUFBakIsQ0FEcEI7O0FBQUEsa0JBQ1FZLE9BRFIsZ0JBQ1FBLE9BRFI7OztBQUdBLG1CQUFPSixZQUFZSSxPQUFaLEdBQXNCakIsa0JBQTdCO0FBQ0gsU0FKRCxDQUtBLE9BQU9XLENBQVAsRUFBVTtBQUNOVix5QkFBYSx3Q0FBd0MsS0FBS0ksSUFBMUQ7QUFDQUoseUJBQWFVLENBQWI7O0FBRUEsbUJBQU8sS0FBUDtBQUNIO0FBQ0o7O0FBRURPLFdBQVE7QUFDSixZQUFJLEtBQUtYLEtBQUwsRUFBSixFQUNJLE9BQU8sSUFBUDs7QUFFSixZQUFJLEtBQUtLLFFBQUwsRUFBSixFQUNJLE9BQU8sS0FBS0wsS0FBTCxDQUFXLEVBQUVDLE9BQU8sSUFBVCxFQUFYLENBQVA7O0FBRUosZUFBTyxLQUFQO0FBQ0g7O0FBRURXLGNBQVc7QUFDUCxZQUFJO0FBQ0EseUJBQUdDLFVBQUgsQ0FBYyxLQUFLZixJQUFuQjtBQUNILFNBRkQsQ0FHQSxPQUFPTSxDQUFQLEVBQVU7QUFDTlYseUJBQWEsZ0NBQWdDLEtBQUtJLElBQWxEO0FBQ0FKLHlCQUFhVSxDQUFiO0FBQ0g7QUFDSjtBQXJEeUI7a0JBQVRULFEiLCJmaWxlIjoidXRpbHMvdGVtcC1kaXJlY3RvcnkvbG9ja2ZpbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBkZWJ1ZyBmcm9tICdkZWJ1Zyc7XG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuXG5cbmNvbnN0IExPQ0tGSUxFX05BTUUgICAgICA9ICcudGVzdGNhZmUtbG9ja2ZpbGUnO1xuY29uc3QgU1RBTEVfTE9DS0ZJTEVfQUdFID0gMiAqIDI0ICogNjAgKiA2MCAqIDEwMDA7XG5jb25zdCBERUJVR19MT0dHRVIgICAgICAgPSBkZWJ1ZygndGVzdGNhZmU6dXRpbHM6dGVtcC1kaXJlY3Rvcnk6bG9ja2ZpbGUnKTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTG9ja0ZpbGUge1xuICAgIGNvbnN0cnVjdG9yIChkaXJQYXRoKSB7XG4gICAgICAgIHRoaXMucGF0aCA9IHBhdGguam9pbihkaXJQYXRoLCBMT0NLRklMRV9OQU1FKTtcbiAgICB9XG5cbiAgICBfb3BlbiAoeyBmb3JjZSA9IGZhbHNlIH0gPSB7fSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgZnMud3JpdGVGaWxlU3luYyh0aGlzLnBhdGgsICcnLCB7IGZsYWc6IGZvcmNlID8gJ3cnIDogJ3d4JyB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIERFQlVHX0xPR0dFUignRmFpbGVkIHRvIGluaXQgbG9ja2ZpbGUgJyArIHRoaXMucGF0aCk7XG4gICAgICAgICAgICBERUJVR19MT0dHRVIoZSk7XG5cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9pc1N0YWxlICgpIHtcbiAgICAgICAgY29uc3QgY3VycmVudE1zID0gRGF0ZS5ub3coKTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgeyBtdGltZU1zIH0gPSBmcy5zdGF0U3luYyh0aGlzLnBhdGgpO1xuXG4gICAgICAgICAgICByZXR1cm4gY3VycmVudE1zIC0gbXRpbWVNcyA+IFNUQUxFX0xPQ0tGSUxFX0FHRTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgREVCVUdfTE9HR0VSKCdGYWlsZWQgdG8gY2hlY2sgc3RhdHVzIG9mIGxvY2tmaWxlICcgKyB0aGlzLnBhdGgpO1xuICAgICAgICAgICAgREVCVUdfTE9HR0VSKGUpO1xuXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpbml0ICgpIHtcbiAgICAgICAgaWYgKHRoaXMuX29wZW4oKSlcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuXG4gICAgICAgIGlmICh0aGlzLl9pc1N0YWxlKCkpXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fb3Blbih7IGZvcmNlOiB0cnVlIH0pO1xuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBkaXNwb3NlICgpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGZzLnVubGlua1N5bmModGhpcy5wYXRoKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgREVCVUdfTE9HR0VSKCdGYWlsZWQgdG8gZGlzcG9zZSBsb2NrZmlsZSAnICsgdGhpcy5wYXRoKTtcbiAgICAgICAgICAgIERFQlVHX0xPR0dFUihlKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==
