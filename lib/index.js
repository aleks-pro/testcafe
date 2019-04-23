'use strict';

exports.__esModule = true;

var _defineProperty = require('babel-runtime/core-js/object/define-property');

var _defineProperty2 = _interopRequireDefault(_defineProperty);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

// Validations
let getValidHostname = (() => {
    var _ref = (0, _asyncToGenerator3.default)(function* (hostname) {
        if (hostname) {
            const valid = yield endpointUtils.isMyHostname(hostname);

            if (!valid) throw new _runtime.GeneralError(_types.RUNTIME_ERRORS.invalidHostname, hostname);
        } else hostname = endpointUtils.getIPAddress();

        return hostname;
    });

    return function getValidHostname(_x) {
        return _ref.apply(this, arguments);
    };
})();

let getValidPort = (() => {
    var _ref2 = (0, _asyncToGenerator3.default)(function* (port) {
        if (port) {
            const isFree = yield endpointUtils.isFreePort(port);

            if (!isFree) throw new _runtime.GeneralError(_types.RUNTIME_ERRORS.portIsNotFree, port);
        } else port = yield endpointUtils.getFreePort();

        return port;
    });

    return function getValidPort(_x2) {
        return _ref2.apply(this, arguments);
    };
})();

// API


let createTestCafe = (() => {
    var _ref3 = (0, _asyncToGenerator3.default)(function* (hostname, port1, port2, sslOptions, developmentMode, retryTestPages) {
        const configuration = new _configuration2.default();

        yield configuration.init({
            hostname,
            port1,
            port2,
            ssl: sslOptions,
            developmentMode,
            retryTestPages
        });

        var _ref4 = yield _pinkie2.default.all([getValidHostname(configuration.getOption('hostname')), getValidPort(configuration.getOption('port1')), getValidPort(configuration.getOption('port2'))]);

        hostname = _ref4[0];
        port1 = _ref4[1];
        port2 = _ref4[2];


        configuration.mergeOptions({ hostname, port1, port2 });

        const testcafe = new TestCafe(configuration);

        setupExitHook(function (cb) {
            return testcafe.close().then(cb);
        });

        return testcafe;
    });

    return function createTestCafe(_x3, _x4, _x5, _x6, _x7, _x8) {
        return _ref3.apply(this, arguments);
    };
})();

// Embedding utils


var _pinkie = require('pinkie');

var _pinkie2 = _interopRequireDefault(_pinkie);

var _runtime = require('./errors/runtime');

var _types = require('./errors/types');

var _embeddingUtils = require('./embedding-utils');

var _embeddingUtils2 = _interopRequireDefault(_embeddingUtils);

var _exportableLib = require('./api/exportable-lib');

var _exportableLib2 = _interopRequireDefault(_exportableLib);

var _configuration = require('./configuration');

var _configuration2 = _interopRequireDefault(_configuration);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const lazyRequire = require('import-lazy')(require);
const TestCafe = lazyRequire('./testcafe');
const endpointUtils = lazyRequire('endpoint-utils');
const setupExitHook = lazyRequire('async-exit-hook');createTestCafe.embeddingUtils = _embeddingUtils2.default;

// Common API
(0, _keys2.default)(_exportableLib2.default).forEach(key => {
    (0, _defineProperty2.default)(createTestCafe, key, { get: () => _exportableLib2.default[key] });
});

exports.default = createTestCafe;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJob3N0bmFtZSIsInZhbGlkIiwiZW5kcG9pbnRVdGlscyIsImlzTXlIb3N0bmFtZSIsImludmFsaWRIb3N0bmFtZSIsImdldElQQWRkcmVzcyIsImdldFZhbGlkSG9zdG5hbWUiLCJwb3J0IiwiaXNGcmVlIiwiaXNGcmVlUG9ydCIsInBvcnRJc05vdEZyZWUiLCJnZXRGcmVlUG9ydCIsImdldFZhbGlkUG9ydCIsInBvcnQxIiwicG9ydDIiLCJzc2xPcHRpb25zIiwiZGV2ZWxvcG1lbnRNb2RlIiwicmV0cnlUZXN0UGFnZXMiLCJjb25maWd1cmF0aW9uIiwiaW5pdCIsInNzbCIsImFsbCIsImdldE9wdGlvbiIsIm1lcmdlT3B0aW9ucyIsInRlc3RjYWZlIiwiVGVzdENhZmUiLCJzZXR1cEV4aXRIb29rIiwiY2xvc2UiLCJ0aGVuIiwiY2IiLCJjcmVhdGVUZXN0Q2FmZSIsImxhenlSZXF1aXJlIiwicmVxdWlyZSIsImVtYmVkZGluZ1V0aWxzIiwiZm9yRWFjaCIsImtleSIsImdldCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztBQVlBOzsrQ0FDQSxXQUFpQ0EsUUFBakMsRUFBMkM7QUFDdkMsWUFBSUEsUUFBSixFQUFjO0FBQ1Ysa0JBQU1DLFFBQVEsTUFBTUMsY0FBY0MsWUFBZCxDQUEyQkgsUUFBM0IsQ0FBcEI7O0FBRUEsZ0JBQUksQ0FBQ0MsS0FBTCxFQUNJLE1BQU0sMEJBQWlCLHNCQUFlRyxlQUFoQyxFQUFpREosUUFBakQsQ0FBTjtBQUNQLFNBTEQsTUFPSUEsV0FBV0UsY0FBY0csWUFBZCxFQUFYOztBQUVKLGVBQU9MLFFBQVA7QUFDSCxLOztvQkFYY00sZ0I7Ozs7OztnREFhZixXQUE2QkMsSUFBN0IsRUFBbUM7QUFDL0IsWUFBSUEsSUFBSixFQUFVO0FBQ04sa0JBQU1DLFNBQVMsTUFBTU4sY0FBY08sVUFBZCxDQUF5QkYsSUFBekIsQ0FBckI7O0FBRUEsZ0JBQUksQ0FBQ0MsTUFBTCxFQUNJLE1BQU0sMEJBQWlCLHNCQUFlRSxhQUFoQyxFQUErQ0gsSUFBL0MsQ0FBTjtBQUNQLFNBTEQsTUFPSUEsT0FBTyxNQUFNTCxjQUFjUyxXQUFkLEVBQWI7O0FBRUosZUFBT0osSUFBUDtBQUNILEs7O29CQVhjSyxZOzs7OztBQWFmOzs7O2dEQUNBLFdBQStCWixRQUEvQixFQUF5Q2EsS0FBekMsRUFBZ0RDLEtBQWhELEVBQXVEQyxVQUF2RCxFQUFtRUMsZUFBbkUsRUFBb0ZDLGNBQXBGLEVBQW9HO0FBQ2hHLGNBQU1DLGdCQUFnQiw2QkFBdEI7O0FBRUEsY0FBTUEsY0FBY0MsSUFBZCxDQUFtQjtBQUNyQm5CLG9CQURxQjtBQUVyQmEsaUJBRnFCO0FBR3JCQyxpQkFIcUI7QUFJckJNLGlCQUFLTCxVQUpnQjtBQUtyQkMsMkJBTHFCO0FBTXJCQztBQU5xQixTQUFuQixDQUFOOztBQUhnRyxvQkFZckUsTUFBTSxpQkFBUUksR0FBUixDQUFZLENBQ3pDZixpQkFBaUJZLGNBQWNJLFNBQWQsQ0FBd0IsVUFBeEIsQ0FBakIsQ0FEeUMsRUFFekNWLGFBQWFNLGNBQWNJLFNBQWQsQ0FBd0IsT0FBeEIsQ0FBYixDQUZ5QyxFQUd6Q1YsYUFBYU0sY0FBY0ksU0FBZCxDQUF3QixPQUF4QixDQUFiLENBSHlDLENBQVosQ0FaK0Q7O0FBWS9GdEIsZ0JBWitGO0FBWXJGYSxhQVpxRjtBQVk5RUMsYUFaOEU7OztBQWtCaEdJLHNCQUFjSyxZQUFkLENBQTJCLEVBQUV2QixRQUFGLEVBQVlhLEtBQVosRUFBbUJDLEtBQW5CLEVBQTNCOztBQUVBLGNBQU1VLFdBQVcsSUFBSUMsUUFBSixDQUFhUCxhQUFiLENBQWpCOztBQUVBUSxzQkFBYztBQUFBLG1CQUFNRixTQUFTRyxLQUFULEdBQWlCQyxJQUFqQixDQUFzQkMsRUFBdEIsQ0FBTjtBQUFBLFNBQWQ7O0FBRUEsZUFBT0wsUUFBUDtBQUNILEs7O29CQXpCY00sYzs7Ozs7QUEyQmY7OztBQW5FQTs7OztBQUNBOztBQUNBOztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7O0FBRUEsTUFBTUMsY0FBZ0JDLFFBQVEsYUFBUixFQUF1QkEsT0FBdkIsQ0FBdEI7QUFDQSxNQUFNUCxXQUFnQk0sWUFBWSxZQUFaLENBQXRCO0FBQ0EsTUFBTTdCLGdCQUFnQjZCLFlBQVksZ0JBQVosQ0FBdEI7QUFDQSxNQUFNTCxnQkFBZ0JLLFlBQVksaUJBQVosQ0FBdEIsQ0EwREFELGVBQWVHLGNBQWY7O0FBRUE7QUFDQSw2Q0FBMkJDLE9BQTNCLENBQW1DQyxPQUFPO0FBQ3RDLGtDQUFzQkwsY0FBdEIsRUFBc0NLLEdBQXRDLEVBQTJDLEVBQUVDLEtBQUssTUFBTSx3QkFBY0QsR0FBZCxDQUFiLEVBQTNDO0FBQ0gsQ0FGRDs7a0JBSWVMLGMiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUHJvbWlzZSBmcm9tICdwaW5raWUnO1xuaW1wb3J0IHsgR2VuZXJhbEVycm9yIH0gZnJvbSAnLi9lcnJvcnMvcnVudGltZSc7XG5pbXBvcnQgeyBSVU5USU1FX0VSUk9SUyB9IGZyb20gJy4vZXJyb3JzL3R5cGVzJztcbmltcG9ydCBlbWJlZGRpbmdVdGlscyBmcm9tICcuL2VtYmVkZGluZy11dGlscyc7XG5pbXBvcnQgZXhwb3J0YWJsZUxpYiBmcm9tICcuL2FwaS9leHBvcnRhYmxlLWxpYic7XG5pbXBvcnQgQ29uZmlndXJhdGlvbiBmcm9tICcuL2NvbmZpZ3VyYXRpb24nO1xuXG5jb25zdCBsYXp5UmVxdWlyZSAgID0gcmVxdWlyZSgnaW1wb3J0LWxhenknKShyZXF1aXJlKTtcbmNvbnN0IFRlc3RDYWZlICAgICAgPSBsYXp5UmVxdWlyZSgnLi90ZXN0Y2FmZScpO1xuY29uc3QgZW5kcG9pbnRVdGlscyA9IGxhenlSZXF1aXJlKCdlbmRwb2ludC11dGlscycpO1xuY29uc3Qgc2V0dXBFeGl0SG9vayA9IGxhenlSZXF1aXJlKCdhc3luYy1leGl0LWhvb2snKTtcblxuLy8gVmFsaWRhdGlvbnNcbmFzeW5jIGZ1bmN0aW9uIGdldFZhbGlkSG9zdG5hbWUgKGhvc3RuYW1lKSB7XG4gICAgaWYgKGhvc3RuYW1lKSB7XG4gICAgICAgIGNvbnN0IHZhbGlkID0gYXdhaXQgZW5kcG9pbnRVdGlscy5pc015SG9zdG5hbWUoaG9zdG5hbWUpO1xuXG4gICAgICAgIGlmICghdmFsaWQpXG4gICAgICAgICAgICB0aHJvdyBuZXcgR2VuZXJhbEVycm9yKFJVTlRJTUVfRVJST1JTLmludmFsaWRIb3N0bmFtZSwgaG9zdG5hbWUpO1xuICAgIH1cbiAgICBlbHNlXG4gICAgICAgIGhvc3RuYW1lID0gZW5kcG9pbnRVdGlscy5nZXRJUEFkZHJlc3MoKTtcblxuICAgIHJldHVybiBob3N0bmFtZTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZ2V0VmFsaWRQb3J0IChwb3J0KSB7XG4gICAgaWYgKHBvcnQpIHtcbiAgICAgICAgY29uc3QgaXNGcmVlID0gYXdhaXQgZW5kcG9pbnRVdGlscy5pc0ZyZWVQb3J0KHBvcnQpO1xuXG4gICAgICAgIGlmICghaXNGcmVlKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEdlbmVyYWxFcnJvcihSVU5USU1FX0VSUk9SUy5wb3J0SXNOb3RGcmVlLCBwb3J0KTtcbiAgICB9XG4gICAgZWxzZVxuICAgICAgICBwb3J0ID0gYXdhaXQgZW5kcG9pbnRVdGlscy5nZXRGcmVlUG9ydCgpO1xuXG4gICAgcmV0dXJuIHBvcnQ7XG59XG5cbi8vIEFQSVxuYXN5bmMgZnVuY3Rpb24gY3JlYXRlVGVzdENhZmUgKGhvc3RuYW1lLCBwb3J0MSwgcG9ydDIsIHNzbE9wdGlvbnMsIGRldmVsb3BtZW50TW9kZSwgcmV0cnlUZXN0UGFnZXMpIHtcbiAgICBjb25zdCBjb25maWd1cmF0aW9uID0gbmV3IENvbmZpZ3VyYXRpb24oKTtcblxuICAgIGF3YWl0IGNvbmZpZ3VyYXRpb24uaW5pdCh7XG4gICAgICAgIGhvc3RuYW1lLFxuICAgICAgICBwb3J0MSxcbiAgICAgICAgcG9ydDIsXG4gICAgICAgIHNzbDogc3NsT3B0aW9ucyxcbiAgICAgICAgZGV2ZWxvcG1lbnRNb2RlLFxuICAgICAgICByZXRyeVRlc3RQYWdlc1xuICAgIH0pO1xuXG4gICAgW2hvc3RuYW1lLCBwb3J0MSwgcG9ydDJdID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICBnZXRWYWxpZEhvc3RuYW1lKGNvbmZpZ3VyYXRpb24uZ2V0T3B0aW9uKCdob3N0bmFtZScpKSxcbiAgICAgICAgZ2V0VmFsaWRQb3J0KGNvbmZpZ3VyYXRpb24uZ2V0T3B0aW9uKCdwb3J0MScpKSxcbiAgICAgICAgZ2V0VmFsaWRQb3J0KGNvbmZpZ3VyYXRpb24uZ2V0T3B0aW9uKCdwb3J0MicpKVxuICAgIF0pO1xuXG4gICAgY29uZmlndXJhdGlvbi5tZXJnZU9wdGlvbnMoeyBob3N0bmFtZSwgcG9ydDEsIHBvcnQyIH0pO1xuXG4gICAgY29uc3QgdGVzdGNhZmUgPSBuZXcgVGVzdENhZmUoY29uZmlndXJhdGlvbik7XG5cbiAgICBzZXR1cEV4aXRIb29rKGNiID0+IHRlc3RjYWZlLmNsb3NlKCkudGhlbihjYikpO1xuXG4gICAgcmV0dXJuIHRlc3RjYWZlO1xufVxuXG4vLyBFbWJlZGRpbmcgdXRpbHNcbmNyZWF0ZVRlc3RDYWZlLmVtYmVkZGluZ1V0aWxzID0gZW1iZWRkaW5nVXRpbHM7XG5cbi8vIENvbW1vbiBBUElcbk9iamVjdC5rZXlzKGV4cG9ydGFibGVMaWIpLmZvckVhY2goa2V5ID0+IHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoY3JlYXRlVGVzdENhZmUsIGtleSwgeyBnZXQ6ICgpID0+IGV4cG9ydGFibGVMaWJba2V5XSB9KTtcbn0pO1xuXG5leHBvcnQgZGVmYXVsdCBjcmVhdGVUZXN0Q2FmZTtcbiJdfQ==
