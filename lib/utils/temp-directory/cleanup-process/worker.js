'use strict';

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

let removeDirectory = (() => {
    var _ref = (0, _asyncToGenerator3.default)(function* (dirPath) {
        if (!DIRECTORIES_TO_CLEANUP[dirPath]) return;

        let delPromise = DIRECTORIES_TO_CLEANUP[dirPath].delPromise;

        if (!delPromise) {
            delPromise = (0, _process.killBrowserProcess)(_path2.default.basename(dirPath)).then(function () {
                return (0, _del2.default)(dirPath, { force: true });
            });

            DIRECTORIES_TO_CLEANUP[dirPath].delPromise = delPromise;
        }

        yield DIRECTORIES_TO_CLEANUP[dirPath].delPromise;

        delete DIRECTORIES_TO_CLEANUP[dirPath].delPromise;
    });

    return function removeDirectory(_x) {
        return _ref.apply(this, arguments);
    };
})();

let dispatchCommand = (() => {
    var _ref2 = (0, _asyncToGenerator3.default)(function* (message) {
        switch (message.command) {
            case _commands2.default.init:
                return;
            case _commands2.default.add:
                addDirectory(message.path);
                return;
            case _commands2.default.remove:
                addDirectory(message.path);
                yield removeDirectory(message.path);
                return;
        }
    });

    return function dispatchCommand(_x2) {
        return _ref2.apply(this, arguments);
    };
})();

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _util = require('util');

var _del = require('del');

var _del2 = _interopRequireDefault(_del);

var _pinkie = require('pinkie');

var _pinkie2 = _interopRequireDefault(_pinkie);

var _lodash = require('lodash');

var _process = require('../../process');

var _commands = require('./commands');

var _commands2 = _interopRequireDefault(_commands);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const DIRECTORIES_TO_CLEANUP = {};

function addDirectory(dirPath) {
    if (!DIRECTORIES_TO_CLEANUP[dirPath]) DIRECTORIES_TO_CLEANUP[dirPath] = {};
}

process.on('message', (() => {
    var _ref3 = (0, _asyncToGenerator3.default)(function* (message) {
        let error = '';

        try {
            yield dispatchCommand(message);
        } catch (e) {
            error = (0, _util.inspect)(e);
        }

        process.send({ id: message.id, error });
    });

    return function (_x3) {
        return _ref3.apply(this, arguments);
    };
})());

process.on('disconnect', (0, _asyncToGenerator3.default)(function* () {
    const removePromises = (0, _keys2.default)(DIRECTORIES_TO_CLEANUP).map(function (dirPath) {
        return removeDirectory(dirPath).catch(_lodash.noop);
    });

    yield _pinkie2.default.all(removePromises);

    process.exit(0); //eslint-disable-line no-process-exit
}));
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy91dGlscy90ZW1wLWRpcmVjdG9yeS9jbGVhbnVwLXByb2Nlc3Mvd29ya2VyLmpzIl0sIm5hbWVzIjpbImRpclBhdGgiLCJESVJFQ1RPUklFU19UT19DTEVBTlVQIiwiZGVsUHJvbWlzZSIsImJhc2VuYW1lIiwidGhlbiIsImZvcmNlIiwicmVtb3ZlRGlyZWN0b3J5IiwibWVzc2FnZSIsImNvbW1hbmQiLCJpbml0IiwiYWRkIiwiYWRkRGlyZWN0b3J5IiwicGF0aCIsInJlbW92ZSIsImRpc3BhdGNoQ29tbWFuZCIsInByb2Nlc3MiLCJvbiIsImVycm9yIiwiZSIsInNlbmQiLCJpZCIsInJlbW92ZVByb21pc2VzIiwibWFwIiwiY2F0Y2giLCJhbGwiLCJleGl0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OzsrQ0FnQkEsV0FBZ0NBLE9BQWhDLEVBQXlDO0FBQ3JDLFlBQUksQ0FBQ0MsdUJBQXVCRCxPQUF2QixDQUFMLEVBQ0k7O0FBRUosWUFBSUUsYUFBYUQsdUJBQXVCRCxPQUF2QixFQUFnQ0UsVUFBakQ7O0FBRUEsWUFBSSxDQUFDQSxVQUFMLEVBQWlCO0FBQ2JBLHlCQUFhLGlDQUFtQixlQUFLQyxRQUFMLENBQWNILE9BQWQsQ0FBbkIsRUFDUkksSUFEUSxDQUNIO0FBQUEsdUJBQU0sbUJBQUlKLE9BQUosRUFBYSxFQUFFSyxPQUFPLElBQVQsRUFBYixDQUFOO0FBQUEsYUFERyxDQUFiOztBQUdBSixtQ0FBdUJELE9BQXZCLEVBQWdDRSxVQUFoQyxHQUE2Q0EsVUFBN0M7QUFDSDs7QUFFRCxjQUFNRCx1QkFBdUJELE9BQXZCLEVBQWdDRSxVQUF0Qzs7QUFFQSxlQUFPRCx1QkFBdUJELE9BQXZCLEVBQWdDRSxVQUF2QztBQUNILEs7O29CQWhCY0ksZTs7Ozs7O2dEQWtCZixXQUFnQ0MsT0FBaEMsRUFBeUM7QUFDckMsZ0JBQVFBLFFBQVFDLE9BQWhCO0FBQ0ksaUJBQUssbUJBQVNDLElBQWQ7QUFDSTtBQUNKLGlCQUFLLG1CQUFTQyxHQUFkO0FBQ0lDLDZCQUFhSixRQUFRSyxJQUFyQjtBQUNBO0FBQ0osaUJBQUssbUJBQVNDLE1BQWQ7QUFDSUYsNkJBQWFKLFFBQVFLLElBQXJCO0FBQ0Esc0JBQU1OLGdCQUFnQkMsUUFBUUssSUFBeEIsQ0FBTjtBQUNBO0FBVFI7QUFXSCxLOztvQkFaY0UsZTs7Ozs7QUFsQ2Y7Ozs7QUFDQTs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7OztBQUdBLE1BQU1iLHlCQUF5QixFQUEvQjs7QUFFQSxTQUFTVSxZQUFULENBQXVCWCxPQUF2QixFQUFnQztBQUM1QixRQUFJLENBQUNDLHVCQUF1QkQsT0FBdkIsQ0FBTCxFQUNJQyx1QkFBdUJELE9BQXZCLElBQWtDLEVBQWxDO0FBQ1A7O0FBa0NEZSxRQUFRQyxFQUFSLENBQVcsU0FBWDtBQUFBLGdEQUFzQixXQUFNVCxPQUFOLEVBQWlCO0FBQ25DLFlBQUlVLFFBQVEsRUFBWjs7QUFFQSxZQUFJO0FBQ0Esa0JBQU1ILGdCQUFnQlAsT0FBaEIsQ0FBTjtBQUNILFNBRkQsQ0FHQSxPQUFPVyxDQUFQLEVBQVU7QUFDTkQsb0JBQVEsbUJBQVFDLENBQVIsQ0FBUjtBQUNIOztBQUVESCxnQkFBUUksSUFBUixDQUFhLEVBQUVDLElBQUliLFFBQVFhLEVBQWQsRUFBa0JILEtBQWxCLEVBQWI7QUFDSCxLQVhEOztBQUFBO0FBQUE7QUFBQTtBQUFBOztBQWFBRixRQUFRQyxFQUFSLENBQVcsWUFBWCxrQ0FBeUIsYUFBWTtBQUNqQyxVQUFNSyxpQkFBaUIsb0JBQ2JwQixzQkFEYSxFQUVsQnFCLEdBRmtCLENBRWQ7QUFBQSxlQUFXaEIsZ0JBQWdCTixPQUFoQixFQUF5QnVCLEtBQXpCLGNBQVg7QUFBQSxLQUZjLENBQXZCOztBQUlBLFVBQU0saUJBQVFDLEdBQVIsQ0FBWUgsY0FBWixDQUFOOztBQUVBTixZQUFRVSxJQUFSLENBQWEsQ0FBYixFQVBpQyxDQU9oQjtBQUNwQixDQVJEIiwiZmlsZSI6InV0aWxzL3RlbXAtZGlyZWN0b3J5L2NsZWFudXAtcHJvY2Vzcy93b3JrZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IGluc3BlY3QgfSBmcm9tICd1dGlsJztcbmltcG9ydCBkZWwgZnJvbSAnZGVsJztcbmltcG9ydCBQcm9taXNlIGZyb20gJ3BpbmtpZSc7XG5pbXBvcnQgeyBub29wIH0gZnJvbSAnbG9kYXNoJztcbmltcG9ydCB7IGtpbGxCcm93c2VyUHJvY2VzcyB9IGZyb20gJy4uLy4uL3Byb2Nlc3MnO1xuaW1wb3J0IENPTU1BTkRTIGZyb20gJy4vY29tbWFuZHMnO1xuXG5cbmNvbnN0IERJUkVDVE9SSUVTX1RPX0NMRUFOVVAgPSB7fTtcblxuZnVuY3Rpb24gYWRkRGlyZWN0b3J5IChkaXJQYXRoKSB7XG4gICAgaWYgKCFESVJFQ1RPUklFU19UT19DTEVBTlVQW2RpclBhdGhdKVxuICAgICAgICBESVJFQ1RPUklFU19UT19DTEVBTlVQW2RpclBhdGhdID0ge307XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHJlbW92ZURpcmVjdG9yeSAoZGlyUGF0aCkge1xuICAgIGlmICghRElSRUNUT1JJRVNfVE9fQ0xFQU5VUFtkaXJQYXRoXSlcbiAgICAgICAgcmV0dXJuO1xuXG4gICAgbGV0IGRlbFByb21pc2UgPSBESVJFQ1RPUklFU19UT19DTEVBTlVQW2RpclBhdGhdLmRlbFByb21pc2U7XG5cbiAgICBpZiAoIWRlbFByb21pc2UpIHtcbiAgICAgICAgZGVsUHJvbWlzZSA9IGtpbGxCcm93c2VyUHJvY2VzcyhwYXRoLmJhc2VuYW1lKGRpclBhdGgpKVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4gZGVsKGRpclBhdGgsIHsgZm9yY2U6IHRydWUgfSkpO1xuXG4gICAgICAgIERJUkVDVE9SSUVTX1RPX0NMRUFOVVBbZGlyUGF0aF0uZGVsUHJvbWlzZSA9IGRlbFByb21pc2U7XG4gICAgfVxuXG4gICAgYXdhaXQgRElSRUNUT1JJRVNfVE9fQ0xFQU5VUFtkaXJQYXRoXS5kZWxQcm9taXNlO1xuXG4gICAgZGVsZXRlIERJUkVDVE9SSUVTX1RPX0NMRUFOVVBbZGlyUGF0aF0uZGVsUHJvbWlzZTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZGlzcGF0Y2hDb21tYW5kIChtZXNzYWdlKSB7XG4gICAgc3dpdGNoIChtZXNzYWdlLmNvbW1hbmQpIHtcbiAgICAgICAgY2FzZSBDT01NQU5EUy5pbml0OlxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBjYXNlIENPTU1BTkRTLmFkZDpcbiAgICAgICAgICAgIGFkZERpcmVjdG9yeShtZXNzYWdlLnBhdGgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBjYXNlIENPTU1BTkRTLnJlbW92ZTpcbiAgICAgICAgICAgIGFkZERpcmVjdG9yeShtZXNzYWdlLnBhdGgpO1xuICAgICAgICAgICAgYXdhaXQgcmVtb3ZlRGlyZWN0b3J5KG1lc3NhZ2UucGF0aCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgfVxufVxuXG5wcm9jZXNzLm9uKCdtZXNzYWdlJywgYXN5bmMgbWVzc2FnZSA9PiB7XG4gICAgbGV0IGVycm9yID0gJyc7XG5cbiAgICB0cnkge1xuICAgICAgICBhd2FpdCBkaXNwYXRjaENvbW1hbmQobWVzc2FnZSk7XG4gICAgfVxuICAgIGNhdGNoIChlKSB7XG4gICAgICAgIGVycm9yID0gaW5zcGVjdChlKTtcbiAgICB9XG5cbiAgICBwcm9jZXNzLnNlbmQoeyBpZDogbWVzc2FnZS5pZCwgZXJyb3IgfSk7XG59KTtcblxucHJvY2Vzcy5vbignZGlzY29ubmVjdCcsIGFzeW5jICgpID0+IHtcbiAgICBjb25zdCByZW1vdmVQcm9taXNlcyA9IE9iamVjdFxuICAgICAgICAua2V5cyhESVJFQ1RPUklFU19UT19DTEVBTlVQKVxuICAgICAgICAubWFwKGRpclBhdGggPT4gcmVtb3ZlRGlyZWN0b3J5KGRpclBhdGgpLmNhdGNoKG5vb3ApKTtcblxuICAgIGF3YWl0IFByb21pc2UuYWxsKHJlbW92ZVByb21pc2VzKTtcblxuICAgIHByb2Nlc3MuZXhpdCgwKTsgLy9lc2xpbnQtZGlzYWJsZS1saW5lIG5vLXByb2Nlc3MtZXhpdFxufSk7XG4iXX0=
