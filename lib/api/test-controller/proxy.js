'use strict';

exports.__esModule = true;

var _create = require('babel-runtime/core-js/object/create');

var _create2 = _interopRequireDefault(_create);

var _ = require('./');

var _2 = _interopRequireDefault(_);

var _delegatedApi = require('../../utils/delegated-api');

var _testRunTracker = require('../test-run-tracker');

var _testRunTracker2 = _interopRequireDefault(_testRunTracker);

var _runtime = require('../../errors/runtime');

var _types = require('../../errors/types');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const testControllerProxy = (0, _create2.default)(null);

(0, _delegatedApi.delegateAPI)(testControllerProxy, _2.default.API_LIST, {
    getHandler(propName, accessor) {
        const testRun = _testRunTracker2.default.resolveContextTestRun();

        if (!testRun) {
            let callsiteName = null;

            if (accessor === 'getter') callsiteName = 'get';else if (accessor === 'setter') callsiteName = 'set';else callsiteName = propName;

            throw new _runtime.APIError(callsiteName, _types.RUNTIME_ERRORS.testControllerProxyCannotResolveTestRun);
        }

        return testRun.controller;
    }
});

exports.default = testControllerProxy;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcGkvdGVzdC1jb250cm9sbGVyL3Byb3h5LmpzIl0sIm5hbWVzIjpbInRlc3RDb250cm9sbGVyUHJveHkiLCJBUElfTElTVCIsImdldEhhbmRsZXIiLCJwcm9wTmFtZSIsImFjY2Vzc29yIiwidGVzdFJ1biIsInJlc29sdmVDb250ZXh0VGVzdFJ1biIsImNhbGxzaXRlTmFtZSIsInRlc3RDb250cm9sbGVyUHJveHlDYW5ub3RSZXNvbHZlVGVzdFJ1biIsImNvbnRyb2xsZXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUE7Ozs7QUFDQTs7QUFDQTs7OztBQUNBOztBQUNBOzs7O0FBRUEsTUFBTUEsc0JBQXNCLHNCQUFjLElBQWQsQ0FBNUI7O0FBRUEsK0JBQVlBLG1CQUFaLEVBQWlDLFdBQWVDLFFBQWhELEVBQTBEO0FBQ3REQyxlQUFZQyxRQUFaLEVBQXNCQyxRQUF0QixFQUFnQztBQUM1QixjQUFNQyxVQUFVLHlCQUFlQyxxQkFBZixFQUFoQjs7QUFFQSxZQUFJLENBQUNELE9BQUwsRUFBYztBQUNWLGdCQUFJRSxlQUFlLElBQW5COztBQUVBLGdCQUFJSCxhQUFhLFFBQWpCLEVBQ0lHLGVBQWUsS0FBZixDQURKLEtBRUssSUFBSUgsYUFBYSxRQUFqQixFQUNERyxlQUFlLEtBQWYsQ0FEQyxLQUdEQSxlQUFlSixRQUFmOztBQUVKLGtCQUFNLHNCQUFhSSxZQUFiLEVBQTJCLHNCQUFlQyx1Q0FBMUMsQ0FBTjtBQUNIOztBQUVELGVBQU9ILFFBQVFJLFVBQWY7QUFDSDtBQWxCcUQsQ0FBMUQ7O2tCQXFCZVQsbUIiLCJmaWxlIjoiYXBpL3Rlc3QtY29udHJvbGxlci9wcm94eS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBUZXN0Q29udHJvbGxlciBmcm9tICcuLyc7XG5pbXBvcnQgeyBkZWxlZ2F0ZUFQSSB9IGZyb20gJy4uLy4uL3V0aWxzL2RlbGVnYXRlZC1hcGknO1xuaW1wb3J0IHRlc3RSdW5UcmFja2VyIGZyb20gJy4uL3Rlc3QtcnVuLXRyYWNrZXInO1xuaW1wb3J0IHsgQVBJRXJyb3IgfSBmcm9tICcuLi8uLi9lcnJvcnMvcnVudGltZSc7XG5pbXBvcnQgeyBSVU5USU1FX0VSUk9SUyB9IGZyb20gJy4uLy4uL2Vycm9ycy90eXBlcyc7XG5cbmNvbnN0IHRlc3RDb250cm9sbGVyUHJveHkgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXG5kZWxlZ2F0ZUFQSSh0ZXN0Q29udHJvbGxlclByb3h5LCBUZXN0Q29udHJvbGxlci5BUElfTElTVCwge1xuICAgIGdldEhhbmRsZXIgKHByb3BOYW1lLCBhY2Nlc3Nvcikge1xuICAgICAgICBjb25zdCB0ZXN0UnVuID0gdGVzdFJ1blRyYWNrZXIucmVzb2x2ZUNvbnRleHRUZXN0UnVuKCk7XG5cbiAgICAgICAgaWYgKCF0ZXN0UnVuKSB7XG4gICAgICAgICAgICBsZXQgY2FsbHNpdGVOYW1lID0gbnVsbDtcblxuICAgICAgICAgICAgaWYgKGFjY2Vzc29yID09PSAnZ2V0dGVyJylcbiAgICAgICAgICAgICAgICBjYWxsc2l0ZU5hbWUgPSAnZ2V0JztcbiAgICAgICAgICAgIGVsc2UgaWYgKGFjY2Vzc29yID09PSAnc2V0dGVyJylcbiAgICAgICAgICAgICAgICBjYWxsc2l0ZU5hbWUgPSAnc2V0JztcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBjYWxsc2l0ZU5hbWUgPSBwcm9wTmFtZTtcblxuICAgICAgICAgICAgdGhyb3cgbmV3IEFQSUVycm9yKGNhbGxzaXRlTmFtZSwgUlVOVElNRV9FUlJPUlMudGVzdENvbnRyb2xsZXJQcm94eUNhbm5vdFJlc29sdmVUZXN0UnVuKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0ZXN0UnVuLmNvbnRyb2xsZXI7XG4gICAgfVxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IHRlc3RDb250cm9sbGVyUHJveHk7XG4iXX0=
