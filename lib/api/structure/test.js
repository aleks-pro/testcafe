'use strict';

exports.__esModule = true;

var _from = require('babel-runtime/core-js/array/from');

var _from2 = _interopRequireDefault(_from);

var _testingUnit = require('./testing-unit');

var _testingUnit2 = _interopRequireDefault(_testingUnit);

var _typeAssertions = require('../../errors/runtime/type-assertions');

var _wrapTestFunction = require('../wrap-test-function');

var _wrapTestFunction2 = _interopRequireDefault(_wrapTestFunction);

var _assertType = require('../request-hooks/assert-type');

var _assertType2 = _interopRequireDefault(_assertType);

var _lodash = require('lodash');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Test extends _testingUnit2.default {
    constructor(testFile) {
        super(testFile, 'test');

        this.fixture = testFile.currentFixture;

        this.fn = null;
        this.beforeFn = null;
        this.afterFn = null;
        this.requestHooks = [];

        return this.apiOrigin;
    }

    _add(name, fn) {
        (0, _typeAssertions.assertType)(_typeAssertions.is.string, 'apiOrigin', 'The test name', name);
        (0, _typeAssertions.assertType)(_typeAssertions.is.function, 'apiOrigin', 'The test body', fn);
        (0, _typeAssertions.assertType)(_typeAssertions.is.nonNullObject, 'apiOrigin', `The fixture of '${name}' test`, this.fixture);

        this.name = name;
        this.fn = (0, _wrapTestFunction2.default)(fn);
        this.requestHooks = (0, _lodash.union)(this.requestHooks, (0, _from2.default)(this.fixture.requestHooks));

        if (this.testFile.collectedTests.indexOf(this) < 0) this.testFile.collectedTests.push(this);

        return this.apiOrigin;
    }

    _before$(fn) {
        (0, _typeAssertions.assertType)(_typeAssertions.is.function, 'before', 'test.before hook', fn);

        this.beforeFn = (0, _wrapTestFunction2.default)(fn);

        return this.apiOrigin;
    }

    _after$(fn) {
        (0, _typeAssertions.assertType)(_typeAssertions.is.function, 'after', 'test.after hook', fn);

        this.afterFn = (0, _wrapTestFunction2.default)(fn);

        return this.apiOrigin;
    }

    _requestHooks$(...hooks) {
        hooks = (0, _lodash.flattenDeep)(hooks);

        (0, _assertType2.default)(hooks);

        this.requestHooks = (0, _lodash.union)(this.requestHooks, hooks);

        return this.apiOrigin;
    }
}

exports.default = Test;
_testingUnit2.default._makeAPIListForChildClass(Test);
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcGkvc3RydWN0dXJlL3Rlc3QuanMiXSwibmFtZXMiOlsiVGVzdCIsImNvbnN0cnVjdG9yIiwidGVzdEZpbGUiLCJmaXh0dXJlIiwiY3VycmVudEZpeHR1cmUiLCJmbiIsImJlZm9yZUZuIiwiYWZ0ZXJGbiIsInJlcXVlc3RIb29rcyIsImFwaU9yaWdpbiIsIl9hZGQiLCJuYW1lIiwic3RyaW5nIiwiZnVuY3Rpb24iLCJub25OdWxsT2JqZWN0IiwiY29sbGVjdGVkVGVzdHMiLCJpbmRleE9mIiwicHVzaCIsIl9iZWZvcmUkIiwiX2FmdGVyJCIsIl9yZXF1ZXN0SG9va3MkIiwiaG9va3MiLCJfbWFrZUFQSUxpc3RGb3JDaGlsZENsYXNzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBOzs7O0FBQ0E7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBRWUsTUFBTUEsSUFBTiwrQkFBK0I7QUFDMUNDLGdCQUFhQyxRQUFiLEVBQXVCO0FBQ25CLGNBQU1BLFFBQU4sRUFBZ0IsTUFBaEI7O0FBRUEsYUFBS0MsT0FBTCxHQUFlRCxTQUFTRSxjQUF4Qjs7QUFFQSxhQUFLQyxFQUFMLEdBQW9CLElBQXBCO0FBQ0EsYUFBS0MsUUFBTCxHQUFvQixJQUFwQjtBQUNBLGFBQUtDLE9BQUwsR0FBb0IsSUFBcEI7QUFDQSxhQUFLQyxZQUFMLEdBQW9CLEVBQXBCOztBQUVBLGVBQU8sS0FBS0MsU0FBWjtBQUNIOztBQUVEQyxTQUFNQyxJQUFOLEVBQVlOLEVBQVosRUFBZ0I7QUFDWix3Q0FBVyxtQkFBR08sTUFBZCxFQUFzQixXQUF0QixFQUFtQyxlQUFuQyxFQUFvREQsSUFBcEQ7QUFDQSx3Q0FBVyxtQkFBR0UsUUFBZCxFQUF3QixXQUF4QixFQUFxQyxlQUFyQyxFQUFzRFIsRUFBdEQ7QUFDQSx3Q0FBVyxtQkFBR1MsYUFBZCxFQUE2QixXQUE3QixFQUEyQyxtQkFBa0JILElBQUssUUFBbEUsRUFBMkUsS0FBS1IsT0FBaEY7O0FBRUEsYUFBS1EsSUFBTCxHQUFvQkEsSUFBcEI7QUFDQSxhQUFLTixFQUFMLEdBQW9CLGdDQUFpQkEsRUFBakIsQ0FBcEI7QUFDQSxhQUFLRyxZQUFMLEdBQW9CLG1CQUFNLEtBQUtBLFlBQVgsRUFBeUIsb0JBQVcsS0FBS0wsT0FBTCxDQUFhSyxZQUF4QixDQUF6QixDQUFwQjs7QUFFQSxZQUFJLEtBQUtOLFFBQUwsQ0FBY2EsY0FBZCxDQUE2QkMsT0FBN0IsQ0FBcUMsSUFBckMsSUFBNkMsQ0FBakQsRUFDSSxLQUFLZCxRQUFMLENBQWNhLGNBQWQsQ0FBNkJFLElBQTdCLENBQWtDLElBQWxDOztBQUVKLGVBQU8sS0FBS1IsU0FBWjtBQUNIOztBQUVEUyxhQUFVYixFQUFWLEVBQWM7QUFDVix3Q0FBVyxtQkFBR1EsUUFBZCxFQUF3QixRQUF4QixFQUFrQyxrQkFBbEMsRUFBc0RSLEVBQXREOztBQUVBLGFBQUtDLFFBQUwsR0FBZ0IsZ0NBQWlCRCxFQUFqQixDQUFoQjs7QUFFQSxlQUFPLEtBQUtJLFNBQVo7QUFDSDs7QUFFRFUsWUFBU2QsRUFBVCxFQUFhO0FBQ1Qsd0NBQVcsbUJBQUdRLFFBQWQsRUFBd0IsT0FBeEIsRUFBaUMsaUJBQWpDLEVBQW9EUixFQUFwRDs7QUFFQSxhQUFLRSxPQUFMLEdBQWUsZ0NBQWlCRixFQUFqQixDQUFmOztBQUVBLGVBQU8sS0FBS0ksU0FBWjtBQUNIOztBQUVEVyxtQkFBZ0IsR0FBR0MsS0FBbkIsRUFBMEI7QUFDdEJBLGdCQUFRLHlCQUFRQSxLQUFSLENBQVI7O0FBRUEsa0NBQXNCQSxLQUF0Qjs7QUFFQSxhQUFLYixZQUFMLEdBQW9CLG1CQUFNLEtBQUtBLFlBQVgsRUFBeUJhLEtBQXpCLENBQXBCOztBQUVBLGVBQU8sS0FBS1osU0FBWjtBQUNIO0FBckR5Qzs7a0JBQXpCVCxJO0FBd0RyQixzQkFBWXNCLHlCQUFaLENBQXNDdEIsSUFBdEMiLCJmaWxlIjoiYXBpL3N0cnVjdHVyZS90ZXN0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFRlc3RpbmdVbml0IGZyb20gJy4vdGVzdGluZy11bml0JztcbmltcG9ydCB7IGFzc2VydFR5cGUsIGlzIH0gZnJvbSAnLi4vLi4vZXJyb3JzL3J1bnRpbWUvdHlwZS1hc3NlcnRpb25zJztcbmltcG9ydCB3cmFwVGVzdEZ1bmN0aW9uIGZyb20gJy4uL3dyYXAtdGVzdC1mdW5jdGlvbic7XG5pbXBvcnQgYXNzZXJ0UmVxdWVzdEhvb2tUeXBlIGZyb20gJy4uL3JlcXVlc3QtaG9va3MvYXNzZXJ0LXR5cGUnO1xuaW1wb3J0IHsgZmxhdHRlbkRlZXAgYXMgZmxhdHRlbiwgdW5pb24gfSBmcm9tICdsb2Rhc2gnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUZXN0IGV4dGVuZHMgVGVzdGluZ1VuaXQge1xuICAgIGNvbnN0cnVjdG9yICh0ZXN0RmlsZSkge1xuICAgICAgICBzdXBlcih0ZXN0RmlsZSwgJ3Rlc3QnKTtcblxuICAgICAgICB0aGlzLmZpeHR1cmUgPSB0ZXN0RmlsZS5jdXJyZW50Rml4dHVyZTtcblxuICAgICAgICB0aGlzLmZuICAgICAgICAgICA9IG51bGw7XG4gICAgICAgIHRoaXMuYmVmb3JlRm4gICAgID0gbnVsbDtcbiAgICAgICAgdGhpcy5hZnRlckZuICAgICAgPSBudWxsO1xuICAgICAgICB0aGlzLnJlcXVlc3RIb29rcyA9IFtdO1xuXG4gICAgICAgIHJldHVybiB0aGlzLmFwaU9yaWdpbjtcbiAgICB9XG5cbiAgICBfYWRkIChuYW1lLCBmbikge1xuICAgICAgICBhc3NlcnRUeXBlKGlzLnN0cmluZywgJ2FwaU9yaWdpbicsICdUaGUgdGVzdCBuYW1lJywgbmFtZSk7XG4gICAgICAgIGFzc2VydFR5cGUoaXMuZnVuY3Rpb24sICdhcGlPcmlnaW4nLCAnVGhlIHRlc3QgYm9keScsIGZuKTtcbiAgICAgICAgYXNzZXJ0VHlwZShpcy5ub25OdWxsT2JqZWN0LCAnYXBpT3JpZ2luJywgYFRoZSBmaXh0dXJlIG9mICcke25hbWV9JyB0ZXN0YCwgdGhpcy5maXh0dXJlKTtcblxuICAgICAgICB0aGlzLm5hbWUgICAgICAgICA9IG5hbWU7XG4gICAgICAgIHRoaXMuZm4gICAgICAgICAgID0gd3JhcFRlc3RGdW5jdGlvbihmbik7XG4gICAgICAgIHRoaXMucmVxdWVzdEhvb2tzID0gdW5pb24odGhpcy5yZXF1ZXN0SG9va3MsIEFycmF5LmZyb20odGhpcy5maXh0dXJlLnJlcXVlc3RIb29rcykpO1xuXG4gICAgICAgIGlmICh0aGlzLnRlc3RGaWxlLmNvbGxlY3RlZFRlc3RzLmluZGV4T2YodGhpcykgPCAwKVxuICAgICAgICAgICAgdGhpcy50ZXN0RmlsZS5jb2xsZWN0ZWRUZXN0cy5wdXNoKHRoaXMpO1xuXG4gICAgICAgIHJldHVybiB0aGlzLmFwaU9yaWdpbjtcbiAgICB9XG5cbiAgICBfYmVmb3JlJCAoZm4pIHtcbiAgICAgICAgYXNzZXJ0VHlwZShpcy5mdW5jdGlvbiwgJ2JlZm9yZScsICd0ZXN0LmJlZm9yZSBob29rJywgZm4pO1xuXG4gICAgICAgIHRoaXMuYmVmb3JlRm4gPSB3cmFwVGVzdEZ1bmN0aW9uKGZuKTtcblxuICAgICAgICByZXR1cm4gdGhpcy5hcGlPcmlnaW47XG4gICAgfVxuXG4gICAgX2FmdGVyJCAoZm4pIHtcbiAgICAgICAgYXNzZXJ0VHlwZShpcy5mdW5jdGlvbiwgJ2FmdGVyJywgJ3Rlc3QuYWZ0ZXIgaG9vaycsIGZuKTtcblxuICAgICAgICB0aGlzLmFmdGVyRm4gPSB3cmFwVGVzdEZ1bmN0aW9uKGZuKTtcblxuICAgICAgICByZXR1cm4gdGhpcy5hcGlPcmlnaW47XG4gICAgfVxuXG4gICAgX3JlcXVlc3RIb29rcyQgKC4uLmhvb2tzKSB7XG4gICAgICAgIGhvb2tzID0gZmxhdHRlbihob29rcyk7XG5cbiAgICAgICAgYXNzZXJ0UmVxdWVzdEhvb2tUeXBlKGhvb2tzKTtcblxuICAgICAgICB0aGlzLnJlcXVlc3RIb29rcyA9IHVuaW9uKHRoaXMucmVxdWVzdEhvb2tzLCBob29rcyk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuYXBpT3JpZ2luO1xuICAgIH1cbn1cblxuVGVzdGluZ1VuaXQuX21ha2VBUElMaXN0Rm9yQ2hpbGRDbGFzcyhUZXN0KTtcbiJdfQ==
