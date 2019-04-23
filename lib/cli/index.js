'use strict';

var _resolveCwd = require('resolve-cwd');

var _resolveCwd2 = _interopRequireDefault(_resolveCwd);

var _log = require('./log');

var _log2 = _interopRequireDefault(_log);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getLocalInstallation() {
    const local = (0, _resolveCwd2.default)('testcafe/lib/cli');

    if (local && local !== __filename) {
        _log2.default.write('Using locally installed version of TestCafe.');
        return local;
    }

    return '';
}

(function loader() {
    const cliPath = getLocalInstallation() || require.resolve('./cli');

    require(cliPath);
})();
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jbGkvaW5kZXguanMiXSwibmFtZXMiOlsiZ2V0TG9jYWxJbnN0YWxsYXRpb24iLCJsb2NhbCIsIl9fZmlsZW5hbWUiLCJ3cml0ZSIsImxvYWRlciIsImNsaVBhdGgiLCJyZXF1aXJlIiwicmVzb2x2ZSJdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7OztBQUNBOzs7Ozs7QUFHQSxTQUFTQSxvQkFBVCxHQUFpQztBQUM3QixVQUFNQyxRQUFRLDBCQUFXLGtCQUFYLENBQWQ7O0FBRUEsUUFBSUEsU0FBU0EsVUFBVUMsVUFBdkIsRUFBbUM7QUFDL0Isc0JBQUlDLEtBQUosQ0FBVSw4Q0FBVjtBQUNBLGVBQU9GLEtBQVA7QUFDSDs7QUFFRCxXQUFPLEVBQVA7QUFDSDs7QUFFRCxDQUFDLFNBQVNHLE1BQVQsR0FBbUI7QUFDaEIsVUFBTUMsVUFBVUwsMEJBQTBCTSxRQUFRQyxPQUFSLENBQWdCLE9BQWhCLENBQTFDOztBQUVBRCxZQUFRRCxPQUFSO0FBQ0gsQ0FKRCIsImZpbGUiOiJjbGkvaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgcmVzb2x2ZUN3ZCBmcm9tICdyZXNvbHZlLWN3ZCc7XG5pbXBvcnQgbG9nIGZyb20gJy4vbG9nJztcblxuXG5mdW5jdGlvbiBnZXRMb2NhbEluc3RhbGxhdGlvbiAoKSB7XG4gICAgY29uc3QgbG9jYWwgPSByZXNvbHZlQ3dkKCd0ZXN0Y2FmZS9saWIvY2xpJyk7XG5cbiAgICBpZiAobG9jYWwgJiYgbG9jYWwgIT09IF9fZmlsZW5hbWUpIHtcbiAgICAgICAgbG9nLndyaXRlKCdVc2luZyBsb2NhbGx5IGluc3RhbGxlZCB2ZXJzaW9uIG9mIFRlc3RDYWZlLicpO1xuICAgICAgICByZXR1cm4gbG9jYWw7XG4gICAgfVxuXG4gICAgcmV0dXJuICcnO1xufVxuXG4oZnVuY3Rpb24gbG9hZGVyICgpIHtcbiAgICBjb25zdCBjbGlQYXRoID0gZ2V0TG9jYWxJbnN0YWxsYXRpb24oKSB8fCByZXF1aXJlLnJlc29sdmUoJy4vY2xpJyk7XG5cbiAgICByZXF1aXJlKGNsaVBhdGgpO1xufSkoKTtcbiJdfQ==
