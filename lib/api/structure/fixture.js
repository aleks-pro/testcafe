'use strict';

exports.__esModule = true;

var _typeAssertions = require('../../errors/runtime/type-assertions');

var _handleTagArgs = require('../../utils/handle-tag-args');

var _handleTagArgs2 = _interopRequireDefault(_handleTagArgs);

var _testingUnit = require('./testing-unit');

var _testingUnit2 = _interopRequireDefault(_testingUnit);

var _wrapTestFunction = require('../wrap-test-function');

var _wrapTestFunction2 = _interopRequireDefault(_wrapTestFunction);

var _assertType = require('../request-hooks/assert-type');

var _assertType2 = _interopRequireDefault(_assertType);

var _lodash = require('lodash');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Fixture extends _testingUnit2.default {
    constructor(testFile) {
        super(testFile, 'fixture');

        this.path = testFile.filename;

        this.pageUrl = 'about:blank';

        this.beforeEachFn = null;
        this.afterEachFn = null;

        this.beforeFn = null;
        this.afterFn = null;

        this.requestHooks = [];

        return this.apiOrigin;
    }

    _add(name, ...rest) {
        name = (0, _handleTagArgs2.default)(name, rest);

        (0, _typeAssertions.assertType)(_typeAssertions.is.string, 'apiOrigin', 'The fixture name', name);

        this.name = name;
        this.testFile.currentFixture = this;

        return this.apiOrigin;
    }

    _before$(fn) {
        (0, _typeAssertions.assertType)(_typeAssertions.is.function, 'before', 'fixture.before hook', fn);

        this.beforeFn = fn;

        return this.apiOrigin;
    }

    _after$(fn) {
        (0, _typeAssertions.assertType)(_typeAssertions.is.function, 'after', 'fixture.after hook', fn);

        this.afterFn = fn;

        return this.apiOrigin;
    }

    _beforeEach$(fn) {
        (0, _typeAssertions.assertType)(_typeAssertions.is.function, 'beforeEach', 'fixture.beforeEach hook', fn);

        this.beforeEachFn = (0, _wrapTestFunction2.default)(fn);

        return this.apiOrigin;
    }

    _afterEach$(fn) {
        (0, _typeAssertions.assertType)(_typeAssertions.is.function, 'afterEach', 'fixture.afterEach hook', fn);

        this.afterEachFn = (0, _wrapTestFunction2.default)(fn);

        return this.apiOrigin;
    }

    _requestHooks$(...hooks) {
        hooks = (0, _lodash.flattenDeep)(hooks);

        (0, _assertType2.default)(hooks);

        this.requestHooks = hooks;

        return this.apiOrigin;
    }
}

exports.default = Fixture;
_testingUnit2.default._makeAPIListForChildClass(Fixture);
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcGkvc3RydWN0dXJlL2ZpeHR1cmUuanMiXSwibmFtZXMiOlsiRml4dHVyZSIsImNvbnN0cnVjdG9yIiwidGVzdEZpbGUiLCJwYXRoIiwiZmlsZW5hbWUiLCJwYWdlVXJsIiwiYmVmb3JlRWFjaEZuIiwiYWZ0ZXJFYWNoRm4iLCJiZWZvcmVGbiIsImFmdGVyRm4iLCJyZXF1ZXN0SG9va3MiLCJhcGlPcmlnaW4iLCJfYWRkIiwibmFtZSIsInJlc3QiLCJzdHJpbmciLCJjdXJyZW50Rml4dHVyZSIsIl9iZWZvcmUkIiwiZm4iLCJmdW5jdGlvbiIsIl9hZnRlciQiLCJfYmVmb3JlRWFjaCQiLCJfYWZ0ZXJFYWNoJCIsIl9yZXF1ZXN0SG9va3MkIiwiaG9va3MiLCJfbWFrZUFQSUxpc3RGb3JDaGlsZENsYXNzIl0sIm1hcHBpbmdzIjoiOzs7O0FBQUE7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUVlLE1BQU1BLE9BQU4sK0JBQWtDO0FBQzdDQyxnQkFBYUMsUUFBYixFQUF1QjtBQUNuQixjQUFNQSxRQUFOLEVBQWdCLFNBQWhCOztBQUVBLGFBQUtDLElBQUwsR0FBWUQsU0FBU0UsUUFBckI7O0FBRUEsYUFBS0MsT0FBTCxHQUFlLGFBQWY7O0FBRUEsYUFBS0MsWUFBTCxHQUFvQixJQUFwQjtBQUNBLGFBQUtDLFdBQUwsR0FBb0IsSUFBcEI7O0FBRUEsYUFBS0MsUUFBTCxHQUFnQixJQUFoQjtBQUNBLGFBQUtDLE9BQUwsR0FBZ0IsSUFBaEI7O0FBRUEsYUFBS0MsWUFBTCxHQUFvQixFQUFwQjs7QUFFQSxlQUFPLEtBQUtDLFNBQVo7QUFDSDs7QUFFREMsU0FBTUMsSUFBTixFQUFZLEdBQUdDLElBQWYsRUFBcUI7QUFDakJELGVBQU8sNkJBQWNBLElBQWQsRUFBb0JDLElBQXBCLENBQVA7O0FBRUEsd0NBQVcsbUJBQUdDLE1BQWQsRUFBc0IsV0FBdEIsRUFBbUMsa0JBQW5DLEVBQXVERixJQUF2RDs7QUFFQSxhQUFLQSxJQUFMLEdBQStCQSxJQUEvQjtBQUNBLGFBQUtYLFFBQUwsQ0FBY2MsY0FBZCxHQUErQixJQUEvQjs7QUFFQSxlQUFPLEtBQUtMLFNBQVo7QUFDSDs7QUFFRE0sYUFBVUMsRUFBVixFQUFjO0FBQ1Ysd0NBQVcsbUJBQUdDLFFBQWQsRUFBd0IsUUFBeEIsRUFBa0MscUJBQWxDLEVBQXlERCxFQUF6RDs7QUFFQSxhQUFLVixRQUFMLEdBQWdCVSxFQUFoQjs7QUFFQSxlQUFPLEtBQUtQLFNBQVo7QUFDSDs7QUFFRFMsWUFBU0YsRUFBVCxFQUFhO0FBQ1Qsd0NBQVcsbUJBQUdDLFFBQWQsRUFBd0IsT0FBeEIsRUFBaUMsb0JBQWpDLEVBQXVERCxFQUF2RDs7QUFFQSxhQUFLVCxPQUFMLEdBQWVTLEVBQWY7O0FBRUEsZUFBTyxLQUFLUCxTQUFaO0FBQ0g7O0FBRURVLGlCQUFjSCxFQUFkLEVBQWtCO0FBQ2Qsd0NBQVcsbUJBQUdDLFFBQWQsRUFBd0IsWUFBeEIsRUFBc0MseUJBQXRDLEVBQWlFRCxFQUFqRTs7QUFFQSxhQUFLWixZQUFMLEdBQW9CLGdDQUFpQlksRUFBakIsQ0FBcEI7O0FBRUEsZUFBTyxLQUFLUCxTQUFaO0FBQ0g7O0FBRURXLGdCQUFhSixFQUFiLEVBQWlCO0FBQ2Isd0NBQVcsbUJBQUdDLFFBQWQsRUFBd0IsV0FBeEIsRUFBcUMsd0JBQXJDLEVBQStERCxFQUEvRDs7QUFFQSxhQUFLWCxXQUFMLEdBQW1CLGdDQUFpQlcsRUFBakIsQ0FBbkI7O0FBRUEsZUFBTyxLQUFLUCxTQUFaO0FBQ0g7O0FBRURZLG1CQUFnQixHQUFHQyxLQUFuQixFQUEwQjtBQUN0QkEsZ0JBQVEseUJBQVFBLEtBQVIsQ0FBUjs7QUFFQSxrQ0FBc0JBLEtBQXRCOztBQUVBLGFBQUtkLFlBQUwsR0FBb0JjLEtBQXBCOztBQUVBLGVBQU8sS0FBS2IsU0FBWjtBQUNIO0FBdEU0Qzs7a0JBQTVCWCxPO0FBeUVyQixzQkFBWXlCLHlCQUFaLENBQXNDekIsT0FBdEMiLCJmaWxlIjoiYXBpL3N0cnVjdHVyZS9maXh0dXJlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgYXNzZXJ0VHlwZSwgaXMgfSBmcm9tICcuLi8uLi9lcnJvcnMvcnVudGltZS90eXBlLWFzc2VydGlvbnMnO1xuaW1wb3J0IGhhbmRsZVRhZ0FyZ3MgZnJvbSAnLi4vLi4vdXRpbHMvaGFuZGxlLXRhZy1hcmdzJztcbmltcG9ydCBUZXN0aW5nVW5pdCBmcm9tICcuL3Rlc3RpbmctdW5pdCc7XG5pbXBvcnQgd3JhcFRlc3RGdW5jdGlvbiBmcm9tICcuLi93cmFwLXRlc3QtZnVuY3Rpb24nO1xuaW1wb3J0IGFzc2VydFJlcXVlc3RIb29rVHlwZSBmcm9tICcuLi9yZXF1ZXN0LWhvb2tzL2Fzc2VydC10eXBlJztcbmltcG9ydCB7IGZsYXR0ZW5EZWVwIGFzIGZsYXR0ZW4gfSBmcm9tICdsb2Rhc2gnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBGaXh0dXJlIGV4dGVuZHMgVGVzdGluZ1VuaXQge1xuICAgIGNvbnN0cnVjdG9yICh0ZXN0RmlsZSkge1xuICAgICAgICBzdXBlcih0ZXN0RmlsZSwgJ2ZpeHR1cmUnKTtcblxuICAgICAgICB0aGlzLnBhdGggPSB0ZXN0RmlsZS5maWxlbmFtZTtcblxuICAgICAgICB0aGlzLnBhZ2VVcmwgPSAnYWJvdXQ6YmxhbmsnO1xuXG4gICAgICAgIHRoaXMuYmVmb3JlRWFjaEZuID0gbnVsbDtcbiAgICAgICAgdGhpcy5hZnRlckVhY2hGbiAgPSBudWxsO1xuXG4gICAgICAgIHRoaXMuYmVmb3JlRm4gPSBudWxsO1xuICAgICAgICB0aGlzLmFmdGVyRm4gID0gbnVsbDtcblxuICAgICAgICB0aGlzLnJlcXVlc3RIb29rcyA9IFtdO1xuXG4gICAgICAgIHJldHVybiB0aGlzLmFwaU9yaWdpbjtcbiAgICB9XG5cbiAgICBfYWRkIChuYW1lLCAuLi5yZXN0KSB7XG4gICAgICAgIG5hbWUgPSBoYW5kbGVUYWdBcmdzKG5hbWUsIHJlc3QpO1xuXG4gICAgICAgIGFzc2VydFR5cGUoaXMuc3RyaW5nLCAnYXBpT3JpZ2luJywgJ1RoZSBmaXh0dXJlIG5hbWUnLCBuYW1lKTtcblxuICAgICAgICB0aGlzLm5hbWUgICAgICAgICAgICAgICAgICAgID0gbmFtZTtcbiAgICAgICAgdGhpcy50ZXN0RmlsZS5jdXJyZW50Rml4dHVyZSA9IHRoaXM7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuYXBpT3JpZ2luO1xuICAgIH1cblxuICAgIF9iZWZvcmUkIChmbikge1xuICAgICAgICBhc3NlcnRUeXBlKGlzLmZ1bmN0aW9uLCAnYmVmb3JlJywgJ2ZpeHR1cmUuYmVmb3JlIGhvb2snLCBmbik7XG5cbiAgICAgICAgdGhpcy5iZWZvcmVGbiA9IGZuO1xuXG4gICAgICAgIHJldHVybiB0aGlzLmFwaU9yaWdpbjtcbiAgICB9XG5cbiAgICBfYWZ0ZXIkIChmbikge1xuICAgICAgICBhc3NlcnRUeXBlKGlzLmZ1bmN0aW9uLCAnYWZ0ZXInLCAnZml4dHVyZS5hZnRlciBob29rJywgZm4pO1xuXG4gICAgICAgIHRoaXMuYWZ0ZXJGbiA9IGZuO1xuXG4gICAgICAgIHJldHVybiB0aGlzLmFwaU9yaWdpbjtcbiAgICB9XG5cbiAgICBfYmVmb3JlRWFjaCQgKGZuKSB7XG4gICAgICAgIGFzc2VydFR5cGUoaXMuZnVuY3Rpb24sICdiZWZvcmVFYWNoJywgJ2ZpeHR1cmUuYmVmb3JlRWFjaCBob29rJywgZm4pO1xuXG4gICAgICAgIHRoaXMuYmVmb3JlRWFjaEZuID0gd3JhcFRlc3RGdW5jdGlvbihmbik7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuYXBpT3JpZ2luO1xuICAgIH1cblxuICAgIF9hZnRlckVhY2gkIChmbikge1xuICAgICAgICBhc3NlcnRUeXBlKGlzLmZ1bmN0aW9uLCAnYWZ0ZXJFYWNoJywgJ2ZpeHR1cmUuYWZ0ZXJFYWNoIGhvb2snLCBmbik7XG5cbiAgICAgICAgdGhpcy5hZnRlckVhY2hGbiA9IHdyYXBUZXN0RnVuY3Rpb24oZm4pO1xuXG4gICAgICAgIHJldHVybiB0aGlzLmFwaU9yaWdpbjtcbiAgICB9XG5cbiAgICBfcmVxdWVzdEhvb2tzJCAoLi4uaG9va3MpIHtcbiAgICAgICAgaG9va3MgPSBmbGF0dGVuKGhvb2tzKTtcblxuICAgICAgICBhc3NlcnRSZXF1ZXN0SG9va1R5cGUoaG9va3MpO1xuXG4gICAgICAgIHRoaXMucmVxdWVzdEhvb2tzID0gaG9va3M7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuYXBpT3JpZ2luO1xuICAgIH1cbn1cblxuVGVzdGluZ1VuaXQuX21ha2VBUElMaXN0Rm9yQ2hpbGRDbGFzcyhGaXh0dXJlKTtcbiJdfQ==
