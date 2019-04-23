'use strict';

exports.__esModule = true;

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _testcafeBrowserTools = require('testcafe-browser-tools');

var _testcafeBrowserTools2 = _interopRequireDefault(_testcafeBrowserTools);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
    isMultiBrowser: true,

    openBrowser(browserId, pageUrl, browserName) {
        return (0, _asyncToGenerator3.default)(function* () {
            const args = browserName.split(' ');
            const alias = args.shift();

            const browserInfo = yield _testcafeBrowserTools2.default.getBrowserInfo(alias);
            const openParameters = (0, _assign2.default)({}, browserInfo);

            if (args.length) openParameters.cmd = args.join(' ') + (openParameters.cmd ? ' ' + openParameters.cmd : '');

            yield _testcafeBrowserTools2.default.open(openParameters, pageUrl);
        })();
    },

    isLocalBrowser() {
        return (0, _asyncToGenerator3.default)(function* () {
            return true;
        })();
    },

    getBrowserList() {
        return (0, _asyncToGenerator3.default)(function* () {
            const installations = yield _testcafeBrowserTools2.default.getInstallations();

            return (0, _keys2.default)(installations);
        })();
    },

    isValidBrowserName(browserName) {
        var _this = this;

        return (0, _asyncToGenerator3.default)(function* () {
            const browserNames = yield _this.getBrowserList();

            browserName = browserName.toLowerCase().split(' ')[0];

            return browserNames.indexOf(browserName) > -1;
        })();
    }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9icm93c2VyL3Byb3ZpZGVyL2J1aWx0LWluL2xvY2FsbHktaW5zdGFsbGVkLmpzIl0sIm5hbWVzIjpbImlzTXVsdGlCcm93c2VyIiwib3BlbkJyb3dzZXIiLCJicm93c2VySWQiLCJwYWdlVXJsIiwiYnJvd3Nlck5hbWUiLCJhcmdzIiwic3BsaXQiLCJhbGlhcyIsInNoaWZ0IiwiYnJvd3NlckluZm8iLCJnZXRCcm93c2VySW5mbyIsIm9wZW5QYXJhbWV0ZXJzIiwibGVuZ3RoIiwiY21kIiwiam9pbiIsIm9wZW4iLCJpc0xvY2FsQnJvd3NlciIsImdldEJyb3dzZXJMaXN0IiwiaW5zdGFsbGF0aW9ucyIsImdldEluc3RhbGxhdGlvbnMiLCJpc1ZhbGlkQnJvd3Nlck5hbWUiLCJicm93c2VyTmFtZXMiLCJ0b0xvd2VyQ2FzZSIsImluZGV4T2YiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7Ozs7O2tCQUdlO0FBQ1hBLG9CQUFnQixJQURMOztBQUdMQyxlQUFOLENBQW1CQyxTQUFuQixFQUE4QkMsT0FBOUIsRUFBdUNDLFdBQXZDLEVBQW9EO0FBQUE7QUFDaEQsa0JBQU1DLE9BQVFELFlBQVlFLEtBQVosQ0FBa0IsR0FBbEIsQ0FBZDtBQUNBLGtCQUFNQyxRQUFRRixLQUFLRyxLQUFMLEVBQWQ7O0FBRUEsa0JBQU1DLGNBQWlCLE1BQU0sK0JBQWFDLGNBQWIsQ0FBNEJILEtBQTVCLENBQTdCO0FBQ0Esa0JBQU1JLGlCQUFpQixzQkFBYyxFQUFkLEVBQWtCRixXQUFsQixDQUF2Qjs7QUFFQSxnQkFBSUosS0FBS08sTUFBVCxFQUNJRCxlQUFlRSxHQUFmLEdBQXFCUixLQUFLUyxJQUFMLENBQVUsR0FBVixLQUFrQkgsZUFBZUUsR0FBZixHQUFxQixNQUFNRixlQUFlRSxHQUExQyxHQUFnRCxFQUFsRSxDQUFyQjs7QUFFSixrQkFBTSwrQkFBYUUsSUFBYixDQUFrQkosY0FBbEIsRUFBa0NSLE9BQWxDLENBQU47QUFWZ0Q7QUFXbkQsS0FkVTs7QUFnQkxhLGtCQUFOLEdBQXdCO0FBQUE7QUFDcEIsbUJBQU8sSUFBUDtBQURvQjtBQUV2QixLQWxCVTs7QUFvQkxDLGtCQUFOLEdBQXdCO0FBQUE7QUFDcEIsa0JBQU1DLGdCQUFnQixNQUFNLCtCQUFhQyxnQkFBYixFQUE1Qjs7QUFFQSxtQkFBTyxvQkFBWUQsYUFBWixDQUFQO0FBSG9CO0FBSXZCLEtBeEJVOztBQTBCTEUsc0JBQU4sQ0FBMEJoQixXQUExQixFQUF1QztBQUFBOztBQUFBO0FBQ25DLGtCQUFNaUIsZUFBZSxNQUFNLE1BQUtKLGNBQUwsRUFBM0I7O0FBRUFiLDBCQUFjQSxZQUFZa0IsV0FBWixHQUEwQmhCLEtBQTFCLENBQWdDLEdBQWhDLEVBQXFDLENBQXJDLENBQWQ7O0FBRUEsbUJBQU9lLGFBQWFFLE9BQWIsQ0FBcUJuQixXQUFyQixJQUFvQyxDQUFDLENBQTVDO0FBTG1DO0FBTXRDO0FBaENVLEMiLCJmaWxlIjoiYnJvd3Nlci9wcm92aWRlci9idWlsdC1pbi9sb2NhbGx5LWluc3RhbGxlZC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBicm93c2VyVG9vbHMgZnJvbSAndGVzdGNhZmUtYnJvd3Nlci10b29scyc7XG5cblxuZXhwb3J0IGRlZmF1bHQge1xuICAgIGlzTXVsdGlCcm93c2VyOiB0cnVlLFxuXG4gICAgYXN5bmMgb3BlbkJyb3dzZXIgKGJyb3dzZXJJZCwgcGFnZVVybCwgYnJvd3Nlck5hbWUpIHtcbiAgICAgICAgY29uc3QgYXJncyAgPSBicm93c2VyTmFtZS5zcGxpdCgnICcpO1xuICAgICAgICBjb25zdCBhbGlhcyA9IGFyZ3Muc2hpZnQoKTtcblxuICAgICAgICBjb25zdCBicm93c2VySW5mbyAgICA9IGF3YWl0IGJyb3dzZXJUb29scy5nZXRCcm93c2VySW5mbyhhbGlhcyk7XG4gICAgICAgIGNvbnN0IG9wZW5QYXJhbWV0ZXJzID0gT2JqZWN0LmFzc2lnbih7fSwgYnJvd3NlckluZm8pO1xuXG4gICAgICAgIGlmIChhcmdzLmxlbmd0aClcbiAgICAgICAgICAgIG9wZW5QYXJhbWV0ZXJzLmNtZCA9IGFyZ3Muam9pbignICcpICsgKG9wZW5QYXJhbWV0ZXJzLmNtZCA/ICcgJyArIG9wZW5QYXJhbWV0ZXJzLmNtZCA6ICcnKTtcblxuICAgICAgICBhd2FpdCBicm93c2VyVG9vbHMub3BlbihvcGVuUGFyYW1ldGVycywgcGFnZVVybCk7XG4gICAgfSxcblxuICAgIGFzeW5jIGlzTG9jYWxCcm93c2VyICgpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcblxuICAgIGFzeW5jIGdldEJyb3dzZXJMaXN0ICgpIHtcbiAgICAgICAgY29uc3QgaW5zdGFsbGF0aW9ucyA9IGF3YWl0IGJyb3dzZXJUb29scy5nZXRJbnN0YWxsYXRpb25zKCk7XG5cbiAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKGluc3RhbGxhdGlvbnMpO1xuICAgIH0sXG5cbiAgICBhc3luYyBpc1ZhbGlkQnJvd3Nlck5hbWUgKGJyb3dzZXJOYW1lKSB7XG4gICAgICAgIGNvbnN0IGJyb3dzZXJOYW1lcyA9IGF3YWl0IHRoaXMuZ2V0QnJvd3Nlckxpc3QoKTtcblxuICAgICAgICBicm93c2VyTmFtZSA9IGJyb3dzZXJOYW1lLnRvTG93ZXJDYXNlKCkuc3BsaXQoJyAnKVswXTtcblxuICAgICAgICByZXR1cm4gYnJvd3Nlck5hbWVzLmluZGV4T2YoYnJvd3Nlck5hbWUpID4gLTE7XG4gICAgfVxufTtcbiJdfQ==
