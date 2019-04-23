'use strict';

exports.__esModule = true;
exports.stop = exports.start = undefined;

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

let start = exports.start = (() => {
    var _ref = (0, _asyncToGenerator3.default)(function* (pageUrl, { browserName, config, cdpPort, tempProfileDir, inDocker }) {
        const chromeInfo = yield _testcafeBrowserTools2.default.getBrowserInfo(config.path || browserName);
        const chromeOpenParameters = (0, _assign2.default)({}, chromeInfo);

        chromeOpenParameters.cmd = (0, _buildChromeArgs.buildChromeArgs)({ config, cdpPort, platformArgs: chromeOpenParameters.cmd, tempProfileDir, inDocker });

        yield browserStarter.startBrowser(chromeOpenParameters, pageUrl);
    });

    return function start(_x, _x2) {
        return _ref.apply(this, arguments);
    };
})();

let stop = exports.stop = (() => {
    var _ref2 = (0, _asyncToGenerator3.default)(function* ({ browserId }) {
        // NOTE: Chrome on Linux closes only after the second SIGTERM signall
        if (!(yield (0, _process.killBrowserProcess)(browserId))) yield (0, _process.killBrowserProcess)(browserId);
    });

    return function stop(_x3) {
        return _ref2.apply(this, arguments);
    };
})();

var _testcafeBrowserTools = require('testcafe-browser-tools');

var _testcafeBrowserTools2 = _interopRequireDefault(_testcafeBrowserTools);

var _process = require('../../../../../utils/process');

var _browserStarter = require('../../../utils/browser-starter');

var _browserStarter2 = _interopRequireDefault(_browserStarter);

var _buildChromeArgs = require('./build-chrome-args');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const browserStarter = new _browserStarter2.default();
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9icm93c2VyL3Byb3ZpZGVyL2J1aWx0LWluL2RlZGljYXRlZC9jaHJvbWUvbG9jYWwtY2hyb21lLmpzIl0sIm5hbWVzIjpbInBhZ2VVcmwiLCJicm93c2VyTmFtZSIsImNvbmZpZyIsImNkcFBvcnQiLCJ0ZW1wUHJvZmlsZURpciIsImluRG9ja2VyIiwiY2hyb21lSW5mbyIsImdldEJyb3dzZXJJbmZvIiwicGF0aCIsImNocm9tZU9wZW5QYXJhbWV0ZXJzIiwiY21kIiwicGxhdGZvcm1BcmdzIiwiYnJvd3NlclN0YXJ0ZXIiLCJzdGFydEJyb3dzZXIiLCJzdGFydCIsImJyb3dzZXJJZCIsInN0b3AiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OytDQU9PLFdBQXNCQSxPQUF0QixFQUErQixFQUFFQyxXQUFGLEVBQWVDLE1BQWYsRUFBdUJDLE9BQXZCLEVBQWdDQyxjQUFoQyxFQUFnREMsUUFBaEQsRUFBL0IsRUFBMkY7QUFDOUYsY0FBTUMsYUFBdUIsTUFBTSwrQkFBYUMsY0FBYixDQUE0QkwsT0FBT00sSUFBUCxJQUFlUCxXQUEzQyxDQUFuQztBQUNBLGNBQU1RLHVCQUF1QixzQkFBYyxFQUFkLEVBQWtCSCxVQUFsQixDQUE3Qjs7QUFFQUcsNkJBQXFCQyxHQUFyQixHQUEyQixzQ0FBZ0IsRUFBRVIsTUFBRixFQUFVQyxPQUFWLEVBQW1CUSxjQUFjRixxQkFBcUJDLEdBQXRELEVBQTJETixjQUEzRCxFQUEyRUMsUUFBM0UsRUFBaEIsQ0FBM0I7O0FBRUEsY0FBTU8sZUFBZUMsWUFBZixDQUE0Qkosb0JBQTVCLEVBQWtEVCxPQUFsRCxDQUFOO0FBQ0gsSzs7b0JBUHFCYyxLOzs7Ozs7Z0RBU2YsV0FBcUIsRUFBRUMsU0FBRixFQUFyQixFQUFvQztBQUN2QztBQUNBLFlBQUksRUFBQyxNQUFNLGlDQUFtQkEsU0FBbkIsQ0FBUCxDQUFKLEVBQ0ksTUFBTSxpQ0FBbUJBLFNBQW5CLENBQU47QUFDUCxLOztvQkFKcUJDLEk7Ozs7O0FBaEJ0Qjs7OztBQUNBOztBQUNBOzs7O0FBQ0E7Ozs7QUFFQSxNQUFNSixpQkFBaUIsOEJBQXZCIiwiZmlsZSI6ImJyb3dzZXIvcHJvdmlkZXIvYnVpbHQtaW4vZGVkaWNhdGVkL2Nocm9tZS9sb2NhbC1jaHJvbWUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgYnJvd3NlclRvb2xzIGZyb20gJ3Rlc3RjYWZlLWJyb3dzZXItdG9vbHMnO1xuaW1wb3J0IHsga2lsbEJyb3dzZXJQcm9jZXNzIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdXRpbHMvcHJvY2Vzcyc7XG5pbXBvcnQgQnJvd3NlclN0YXJ0ZXIgZnJvbSAnLi4vLi4vLi4vdXRpbHMvYnJvd3Nlci1zdGFydGVyJztcbmltcG9ydCB7IGJ1aWxkQ2hyb21lQXJncyB9IGZyb20gJy4vYnVpbGQtY2hyb21lLWFyZ3MnO1xuXG5jb25zdCBicm93c2VyU3RhcnRlciA9IG5ldyBCcm93c2VyU3RhcnRlcigpO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc3RhcnQgKHBhZ2VVcmwsIHsgYnJvd3Nlck5hbWUsIGNvbmZpZywgY2RwUG9ydCwgdGVtcFByb2ZpbGVEaXIsIGluRG9ja2VyIH0pIHtcbiAgICBjb25zdCBjaHJvbWVJbmZvICAgICAgICAgICA9IGF3YWl0IGJyb3dzZXJUb29scy5nZXRCcm93c2VySW5mbyhjb25maWcucGF0aCB8fCBicm93c2VyTmFtZSk7XG4gICAgY29uc3QgY2hyb21lT3BlblBhcmFtZXRlcnMgPSBPYmplY3QuYXNzaWduKHt9LCBjaHJvbWVJbmZvKTtcblxuICAgIGNocm9tZU9wZW5QYXJhbWV0ZXJzLmNtZCA9IGJ1aWxkQ2hyb21lQXJncyh7IGNvbmZpZywgY2RwUG9ydCwgcGxhdGZvcm1BcmdzOiBjaHJvbWVPcGVuUGFyYW1ldGVycy5jbWQsIHRlbXBQcm9maWxlRGlyLCBpbkRvY2tlciB9KTtcblxuICAgIGF3YWl0IGJyb3dzZXJTdGFydGVyLnN0YXJ0QnJvd3NlcihjaHJvbWVPcGVuUGFyYW1ldGVycywgcGFnZVVybCk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzdG9wICh7IGJyb3dzZXJJZCB9KSB7XG4gICAgLy8gTk9URTogQ2hyb21lIG9uIExpbnV4IGNsb3NlcyBvbmx5IGFmdGVyIHRoZSBzZWNvbmQgU0lHVEVSTSBzaWduYWxsXG4gICAgaWYgKCFhd2FpdCBraWxsQnJvd3NlclByb2Nlc3MoYnJvd3NlcklkKSlcbiAgICAgICAgYXdhaXQga2lsbEJyb3dzZXJQcm9jZXNzKGJyb3dzZXJJZCk7XG59XG4iXX0=
