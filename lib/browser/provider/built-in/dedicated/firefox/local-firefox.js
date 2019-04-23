'use strict';

exports.__esModule = true;
exports.stop = exports.start = undefined;

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

let start = exports.start = (() => {
    var _ref = (0, _asyncToGenerator3.default)(function* (pageUrl, runtimeInfo) {
        const browserName = runtimeInfo.browserName,
              config = runtimeInfo.config;


        const firefoxInfo = yield _testcafeBrowserTools2.default.getBrowserInfo(config.path || browserName);
        const firefoxOpenParameters = (0, _assign2.default)({}, firefoxInfo);

        if (_osFamily2.default.mac && !config.userProfile) correctOpenParametersForMac(firefoxOpenParameters);

        firefoxOpenParameters.cmd = buildFirefoxArgs(config, firefoxOpenParameters.cmd, runtimeInfo, runtimeInfo.newInstance);

        yield browserStarter.startBrowser(firefoxOpenParameters, pageUrl);
    });

    return function start(_x, _x2) {
        return _ref.apply(this, arguments);
    };
})();

let stop = exports.stop = (() => {
    var _ref2 = (0, _asyncToGenerator3.default)(function* ({ browserId }) {
        yield (0, _process.killBrowserProcess)(browserId);
    });

    return function stop(_x3) {
        return _ref2.apply(this, arguments);
    };
})();

var _osFamily = require('os-family');

var _osFamily2 = _interopRequireDefault(_osFamily);

var _testcafeBrowserTools = require('testcafe-browser-tools');

var _testcafeBrowserTools2 = _interopRequireDefault(_testcafeBrowserTools);

var _process = require('../../../../../utils/process');

var _browserStarter = require('../../../utils/browser-starter');

var _browserStarter2 = _interopRequireDefault(_browserStarter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const browserStarter = new _browserStarter2.default();

function correctOpenParametersForMac(parameters) {
    parameters.macOpenCmdTemplate = parameters.macOpenCmdTemplate.replace('open', 'open -n').replace(' {{{pageUrl}}}', '');

    parameters.macOpenCmdTemplate += ' {{{pageUrl}}}';
}

function buildFirefoxArgs(config, platformArgs, { marionettePort, tempProfileDir }) {
    return [].concat(marionettePort ? ['-marionette'] : [], !config.userProfile ? ['-no-remote', '-new-instance', `-profile "${tempProfileDir.path}"`] : [], config.headless ? ['-headless'] : [], config.userArgs ? [config.userArgs] : [], platformArgs ? [platformArgs] : []).join(' ');
}
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9icm93c2VyL3Byb3ZpZGVyL2J1aWx0LWluL2RlZGljYXRlZC9maXJlZm94L2xvY2FsLWZpcmVmb3guanMiXSwibmFtZXMiOlsicGFnZVVybCIsInJ1bnRpbWVJbmZvIiwiYnJvd3Nlck5hbWUiLCJjb25maWciLCJmaXJlZm94SW5mbyIsImdldEJyb3dzZXJJbmZvIiwicGF0aCIsImZpcmVmb3hPcGVuUGFyYW1ldGVycyIsIm1hYyIsInVzZXJQcm9maWxlIiwiY29ycmVjdE9wZW5QYXJhbWV0ZXJzRm9yTWFjIiwiY21kIiwiYnVpbGRGaXJlZm94QXJncyIsIm5ld0luc3RhbmNlIiwiYnJvd3NlclN0YXJ0ZXIiLCJzdGFydEJyb3dzZXIiLCJzdGFydCIsImJyb3dzZXJJZCIsInN0b3AiLCJwYXJhbWV0ZXJzIiwibWFjT3BlbkNtZFRlbXBsYXRlIiwicmVwbGFjZSIsInBsYXRmb3JtQXJncyIsIm1hcmlvbmV0dGVQb3J0IiwidGVtcFByb2ZpbGVEaXIiLCJjb25jYXQiLCJoZWFkbGVzcyIsInVzZXJBcmdzIiwiam9pbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7K0NBNEJPLFdBQXNCQSxPQUF0QixFQUErQkMsV0FBL0IsRUFBNEM7QUFBQSxjQUN2Q0MsV0FEdUMsR0FDZkQsV0FEZSxDQUN2Q0MsV0FEdUM7QUFBQSxjQUMxQkMsTUFEMEIsR0FDZkYsV0FEZSxDQUMxQkUsTUFEMEI7OztBQUcvQyxjQUFNQyxjQUF3QixNQUFNLCtCQUFhQyxjQUFiLENBQTRCRixPQUFPRyxJQUFQLElBQWVKLFdBQTNDLENBQXBDO0FBQ0EsY0FBTUssd0JBQXdCLHNCQUFjLEVBQWQsRUFBa0JILFdBQWxCLENBQTlCOztBQUVBLFlBQUksbUJBQUdJLEdBQUgsSUFBVSxDQUFDTCxPQUFPTSxXQUF0QixFQUNJQyw0QkFBNEJILHFCQUE1Qjs7QUFFSkEsOEJBQXNCSSxHQUF0QixHQUE0QkMsaUJBQWlCVCxNQUFqQixFQUF5Qkksc0JBQXNCSSxHQUEvQyxFQUFvRFYsV0FBcEQsRUFBaUVBLFlBQVlZLFdBQTdFLENBQTVCOztBQUVBLGNBQU1DLGVBQWVDLFlBQWYsQ0FBNEJSLHFCQUE1QixFQUFtRFAsT0FBbkQsQ0FBTjtBQUNILEs7O29CQVpxQmdCLEs7Ozs7OztnREFjZixXQUFxQixFQUFFQyxTQUFGLEVBQXJCLEVBQW9DO0FBQ3ZDLGNBQU0saUNBQW1CQSxTQUFuQixDQUFOO0FBQ0gsSzs7b0JBRnFCQyxJOzs7OztBQTFDdEI7Ozs7QUFDQTs7OztBQUNBOztBQUNBOzs7Ozs7QUFHQSxNQUFNSixpQkFBaUIsOEJBQXZCOztBQUVBLFNBQVNKLDJCQUFULENBQXNDUyxVQUF0QyxFQUFrRDtBQUM5Q0EsZUFBV0Msa0JBQVgsR0FBZ0NELFdBQVdDLGtCQUFYLENBQzNCQyxPQUQyQixDQUNuQixNQURtQixFQUNYLFNBRFcsRUFFM0JBLE9BRjJCLENBRW5CLGdCQUZtQixFQUVELEVBRkMsQ0FBaEM7O0FBSUFGLGVBQVdDLGtCQUFYLElBQWlDLGdCQUFqQztBQUNIOztBQUVELFNBQVNSLGdCQUFULENBQTJCVCxNQUEzQixFQUFtQ21CLFlBQW5DLEVBQWlELEVBQUVDLGNBQUYsRUFBa0JDLGNBQWxCLEVBQWpELEVBQXFGO0FBQ2pGLFdBQU8sR0FDRkMsTUFERSxDQUVDRixpQkFBaUIsQ0FBQyxhQUFELENBQWpCLEdBQW1DLEVBRnBDLEVBR0MsQ0FBQ3BCLE9BQU9NLFdBQVIsR0FBc0IsQ0FBQyxZQUFELEVBQWUsZUFBZixFQUFpQyxhQUFZZSxlQUFlbEIsSUFBSyxHQUFqRSxDQUF0QixHQUE2RixFQUg5RixFQUlDSCxPQUFPdUIsUUFBUCxHQUFrQixDQUFDLFdBQUQsQ0FBbEIsR0FBa0MsRUFKbkMsRUFLQ3ZCLE9BQU93QixRQUFQLEdBQWtCLENBQUN4QixPQUFPd0IsUUFBUixDQUFsQixHQUFzQyxFQUx2QyxFQU1DTCxlQUFlLENBQUNBLFlBQUQsQ0FBZixHQUFnQyxFQU5qQyxFQVFGTSxJQVJFLENBUUcsR0FSSCxDQUFQO0FBU0giLCJmaWxlIjoiYnJvd3Nlci9wcm92aWRlci9idWlsdC1pbi9kZWRpY2F0ZWQvZmlyZWZveC9sb2NhbC1maXJlZm94LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IE9TIGZyb20gJ29zLWZhbWlseSc7XG5pbXBvcnQgYnJvd3NlclRvb2xzIGZyb20gJ3Rlc3RjYWZlLWJyb3dzZXItdG9vbHMnO1xuaW1wb3J0IHsga2lsbEJyb3dzZXJQcm9jZXNzIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdXRpbHMvcHJvY2Vzcyc7XG5pbXBvcnQgQnJvd3NlclN0YXJ0ZXIgZnJvbSAnLi4vLi4vLi4vdXRpbHMvYnJvd3Nlci1zdGFydGVyJztcblxuXG5jb25zdCBicm93c2VyU3RhcnRlciA9IG5ldyBCcm93c2VyU3RhcnRlcigpO1xuXG5mdW5jdGlvbiBjb3JyZWN0T3BlblBhcmFtZXRlcnNGb3JNYWMgKHBhcmFtZXRlcnMpIHtcbiAgICBwYXJhbWV0ZXJzLm1hY09wZW5DbWRUZW1wbGF0ZSA9IHBhcmFtZXRlcnMubWFjT3BlbkNtZFRlbXBsYXRlXG4gICAgICAgIC5yZXBsYWNlKCdvcGVuJywgJ29wZW4gLW4nKVxuICAgICAgICAucmVwbGFjZSgnIHt7e3BhZ2VVcmx9fX0nLCAnJyk7XG5cbiAgICBwYXJhbWV0ZXJzLm1hY09wZW5DbWRUZW1wbGF0ZSArPSAnIHt7e3BhZ2VVcmx9fX0nO1xufVxuXG5mdW5jdGlvbiBidWlsZEZpcmVmb3hBcmdzIChjb25maWcsIHBsYXRmb3JtQXJncywgeyBtYXJpb25ldHRlUG9ydCwgdGVtcFByb2ZpbGVEaXIgfSkge1xuICAgIHJldHVybiBbXVxuICAgICAgICAuY29uY2F0KFxuICAgICAgICAgICAgbWFyaW9uZXR0ZVBvcnQgPyBbJy1tYXJpb25ldHRlJ10gOiBbXSxcbiAgICAgICAgICAgICFjb25maWcudXNlclByb2ZpbGUgPyBbJy1uby1yZW1vdGUnLCAnLW5ldy1pbnN0YW5jZScsIGAtcHJvZmlsZSBcIiR7dGVtcFByb2ZpbGVEaXIucGF0aH1cImBdIDogW10sXG4gICAgICAgICAgICBjb25maWcuaGVhZGxlc3MgPyBbJy1oZWFkbGVzcyddIDogW10sXG4gICAgICAgICAgICBjb25maWcudXNlckFyZ3MgPyBbY29uZmlnLnVzZXJBcmdzXSA6IFtdLFxuICAgICAgICAgICAgcGxhdGZvcm1BcmdzID8gW3BsYXRmb3JtQXJnc10gOiBbXVxuICAgICAgICApXG4gICAgICAgIC5qb2luKCcgJyk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzdGFydCAocGFnZVVybCwgcnVudGltZUluZm8pIHtcbiAgICBjb25zdCB7IGJyb3dzZXJOYW1lLCBjb25maWcgfSA9IHJ1bnRpbWVJbmZvO1xuXG4gICAgY29uc3QgZmlyZWZveEluZm8gICAgICAgICAgID0gYXdhaXQgYnJvd3NlclRvb2xzLmdldEJyb3dzZXJJbmZvKGNvbmZpZy5wYXRoIHx8IGJyb3dzZXJOYW1lKTtcbiAgICBjb25zdCBmaXJlZm94T3BlblBhcmFtZXRlcnMgPSBPYmplY3QuYXNzaWduKHt9LCBmaXJlZm94SW5mbyk7XG5cbiAgICBpZiAoT1MubWFjICYmICFjb25maWcudXNlclByb2ZpbGUpXG4gICAgICAgIGNvcnJlY3RPcGVuUGFyYW1ldGVyc0Zvck1hYyhmaXJlZm94T3BlblBhcmFtZXRlcnMpO1xuXG4gICAgZmlyZWZveE9wZW5QYXJhbWV0ZXJzLmNtZCA9IGJ1aWxkRmlyZWZveEFyZ3MoY29uZmlnLCBmaXJlZm94T3BlblBhcmFtZXRlcnMuY21kLCBydW50aW1lSW5mbywgcnVudGltZUluZm8ubmV3SW5zdGFuY2UpO1xuXG4gICAgYXdhaXQgYnJvd3NlclN0YXJ0ZXIuc3RhcnRCcm93c2VyKGZpcmVmb3hPcGVuUGFyYW1ldGVycywgcGFnZVVybCk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzdG9wICh7IGJyb3dzZXJJZCB9KSB7XG4gICAgYXdhaXQga2lsbEJyb3dzZXJQcm9jZXNzKGJyb3dzZXJJZCk7XG59XG4iXX0=
