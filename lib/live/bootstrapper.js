'use strict';

exports.__esModule = true;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _module = require('module');

var _module2 = _interopRequireDefault(_module);

var _bootstrapper = require('../runner/bootstrapper');

var _bootstrapper2 = _interopRequireDefault(_bootstrapper);

var _compiler = require('../compiler');

var _compiler2 = _interopRequireDefault(_compiler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const originalRequire = _module2.default.prototype.require;

class LiveModeBootstrapper extends _bootstrapper2.default {
    constructor(runner, browserConnectionGateway) {
        super(browserConnectionGateway);

        this.runner = runner;
    }

    _getTests() {
        this._mockRequire();

        return super._getTests().then(result => {
            this._restoreRequire();

            return result;
        }).catch(err => {
            this._restoreRequire();

            _compiler2.default.cleanUp();

            this.runner.setBootstrappingError(err);
        });
    }

    _mockRequire() {
        const runner = this.runner;

        // NODE: we replace the `require` method to add required files to watcher
        _module2.default.prototype.require = function (filePath) {
            const filename = _module2.default._resolveFilename(filePath, this, false);

            if (_path2.default.isAbsolute(filename) || /^\.\.?[/\\]/.test(filename)) runner.emit(runner.REQUIRED_MODULE_FOUND_EVENT, { filename });

            return originalRequire.apply(this, arguments);
        };
    }

    _restoreRequire() {
        _module2.default.prototype.require = originalRequire;
    }
}

exports.default = LiveModeBootstrapper;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saXZlL2Jvb3RzdHJhcHBlci5qcyJdLCJuYW1lcyI6WyJvcmlnaW5hbFJlcXVpcmUiLCJwcm90b3R5cGUiLCJyZXF1aXJlIiwiTGl2ZU1vZGVCb290c3RyYXBwZXIiLCJjb25zdHJ1Y3RvciIsInJ1bm5lciIsImJyb3dzZXJDb25uZWN0aW9uR2F0ZXdheSIsIl9nZXRUZXN0cyIsIl9tb2NrUmVxdWlyZSIsInRoZW4iLCJyZXN1bHQiLCJfcmVzdG9yZVJlcXVpcmUiLCJjYXRjaCIsImVyciIsImNsZWFuVXAiLCJzZXRCb290c3RyYXBwaW5nRXJyb3IiLCJmaWxlUGF0aCIsImZpbGVuYW1lIiwiX3Jlc29sdmVGaWxlbmFtZSIsImlzQWJzb2x1dGUiLCJ0ZXN0IiwiZW1pdCIsIlJFUVVJUkVEX01PRFVMRV9GT1VORF9FVkVOVCIsImFwcGx5IiwiYXJndW1lbnRzIl0sIm1hcHBpbmdzIjoiOzs7O0FBQUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7OztBQUVBLE1BQU1BLGtCQUFrQixpQkFBT0MsU0FBUCxDQUFpQkMsT0FBekM7O0FBRUEsTUFBTUMsb0JBQU4sZ0NBQWdEO0FBQzVDQyxnQkFBYUMsTUFBYixFQUFxQkMsd0JBQXJCLEVBQStDO0FBQzNDLGNBQU1BLHdCQUFOOztBQUVBLGFBQUtELE1BQUwsR0FBY0EsTUFBZDtBQUNIOztBQUVERSxnQkFBYTtBQUNULGFBQUtDLFlBQUw7O0FBRUEsZUFBTyxNQUFNRCxTQUFOLEdBQ0ZFLElBREUsQ0FDR0MsVUFBVTtBQUNaLGlCQUFLQyxlQUFMOztBQUVBLG1CQUFPRCxNQUFQO0FBQ0gsU0FMRSxFQU1GRSxLQU5FLENBTUlDLE9BQU87QUFDVixpQkFBS0YsZUFBTDs7QUFFQSwrQkFBU0csT0FBVDs7QUFFQSxpQkFBS1QsTUFBTCxDQUFZVSxxQkFBWixDQUFrQ0YsR0FBbEM7QUFDSCxTQVpFLENBQVA7QUFhSDs7QUFFREwsbUJBQWdCO0FBQ1osY0FBTUgsU0FBUyxLQUFLQSxNQUFwQjs7QUFFQTtBQUNBLHlCQUFPSixTQUFQLENBQWlCQyxPQUFqQixHQUEyQixVQUFVYyxRQUFWLEVBQW9CO0FBQzNDLGtCQUFNQyxXQUFXLGlCQUFPQyxnQkFBUCxDQUF3QkYsUUFBeEIsRUFBa0MsSUFBbEMsRUFBd0MsS0FBeEMsQ0FBakI7O0FBRUEsZ0JBQUksZUFBS0csVUFBTCxDQUFnQkYsUUFBaEIsS0FBNkIsY0FBY0csSUFBZCxDQUFtQkgsUUFBbkIsQ0FBakMsRUFDSVosT0FBT2dCLElBQVAsQ0FBWWhCLE9BQU9pQiwyQkFBbkIsRUFBZ0QsRUFBRUwsUUFBRixFQUFoRDs7QUFHSixtQkFBT2pCLGdCQUFnQnVCLEtBQWhCLENBQXNCLElBQXRCLEVBQTRCQyxTQUE1QixDQUFQO0FBQ0gsU0FSRDtBQVNIOztBQUVEYixzQkFBbUI7QUFDZix5QkFBT1YsU0FBUCxDQUFpQkMsT0FBakIsR0FBMkJGLGVBQTNCO0FBQ0g7QUExQzJDOztrQkE2Q2pDRyxvQiIsImZpbGUiOiJsaXZlL2Jvb3RzdHJhcHBlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IE1vZHVsZSBmcm9tICdtb2R1bGUnO1xuaW1wb3J0IEJvb3RzdHJhcHBlciBmcm9tICcuLi9ydW5uZXIvYm9vdHN0cmFwcGVyJztcbmltcG9ydCBDb21waWxlciBmcm9tICcuLi9jb21waWxlcic7XG5cbmNvbnN0IG9yaWdpbmFsUmVxdWlyZSA9IE1vZHVsZS5wcm90b3R5cGUucmVxdWlyZTtcblxuY2xhc3MgTGl2ZU1vZGVCb290c3RyYXBwZXIgZXh0ZW5kcyBCb290c3RyYXBwZXIge1xuICAgIGNvbnN0cnVjdG9yIChydW5uZXIsIGJyb3dzZXJDb25uZWN0aW9uR2F0ZXdheSkge1xuICAgICAgICBzdXBlcihicm93c2VyQ29ubmVjdGlvbkdhdGV3YXkpO1xuXG4gICAgICAgIHRoaXMucnVubmVyID0gcnVubmVyO1xuICAgIH1cblxuICAgIF9nZXRUZXN0cyAoKSB7XG4gICAgICAgIHRoaXMuX21vY2tSZXF1aXJlKCk7XG5cbiAgICAgICAgcmV0dXJuIHN1cGVyLl9nZXRUZXN0cygpXG4gICAgICAgICAgICAudGhlbihyZXN1bHQgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuX3Jlc3RvcmVSZXF1aXJlKCk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5jYXRjaChlcnIgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuX3Jlc3RvcmVSZXF1aXJlKCk7XG5cbiAgICAgICAgICAgICAgICBDb21waWxlci5jbGVhblVwKCk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLnJ1bm5lci5zZXRCb290c3RyYXBwaW5nRXJyb3IoZXJyKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIF9tb2NrUmVxdWlyZSAoKSB7XG4gICAgICAgIGNvbnN0IHJ1bm5lciA9IHRoaXMucnVubmVyO1xuXG4gICAgICAgIC8vIE5PREU6IHdlIHJlcGxhY2UgdGhlIGByZXF1aXJlYCBtZXRob2QgdG8gYWRkIHJlcXVpcmVkIGZpbGVzIHRvIHdhdGNoZXJcbiAgICAgICAgTW9kdWxlLnByb3RvdHlwZS5yZXF1aXJlID0gZnVuY3Rpb24gKGZpbGVQYXRoKSB7XG4gICAgICAgICAgICBjb25zdCBmaWxlbmFtZSA9IE1vZHVsZS5fcmVzb2x2ZUZpbGVuYW1lKGZpbGVQYXRoLCB0aGlzLCBmYWxzZSk7XG5cbiAgICAgICAgICAgIGlmIChwYXRoLmlzQWJzb2x1dGUoZmlsZW5hbWUpIHx8IC9eXFwuXFwuP1svXFxcXF0vLnRlc3QoZmlsZW5hbWUpKVxuICAgICAgICAgICAgICAgIHJ1bm5lci5lbWl0KHJ1bm5lci5SRVFVSVJFRF9NT0RVTEVfRk9VTkRfRVZFTlQsIHsgZmlsZW5hbWUgfSk7XG5cblxuICAgICAgICAgICAgcmV0dXJuIG9yaWdpbmFsUmVxdWlyZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIF9yZXN0b3JlUmVxdWlyZSAoKSB7XG4gICAgICAgIE1vZHVsZS5wcm90b3R5cGUucmVxdWlyZSA9IG9yaWdpbmFsUmVxdWlyZTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IExpdmVNb2RlQm9vdHN0cmFwcGVyO1xuIl19
