'use strict';

exports.__esModule = true;

var _processTestFnError = require('./process-test-fn-error');

var _processTestFnError2 = _interopRequireDefault(_processTestFnError);

var _testRun = require('./test-run');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class TestCafeErrorList {
    constructor() {
        this.items = [];
    }

    get hasErrors() {
        return !!this.items.length;
    }

    get hasUncaughtErrorsInTestCode() {
        return this.items.some(item => item instanceof _testRun.UncaughtErrorInTestCode);
    }

    addError(err) {
        if (err instanceof TestCafeErrorList) this.items = this.items.concat(err.items);else this.items.push((0, _processTestFnError2.default)(err));
    }
}
exports.default = TestCafeErrorList;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9lcnJvcnMvZXJyb3ItbGlzdC5qcyJdLCJuYW1lcyI6WyJUZXN0Q2FmZUVycm9yTGlzdCIsImNvbnN0cnVjdG9yIiwiaXRlbXMiLCJoYXNFcnJvcnMiLCJsZW5ndGgiLCJoYXNVbmNhdWdodEVycm9yc0luVGVzdENvZGUiLCJzb21lIiwiaXRlbSIsImFkZEVycm9yIiwiZXJyIiwiY29uY2F0IiwicHVzaCJdLCJtYXBwaW5ncyI6Ijs7OztBQUFBOzs7O0FBQ0E7Ozs7QUFFZSxNQUFNQSxpQkFBTixDQUF3QjtBQUNuQ0Msa0JBQWU7QUFDWCxhQUFLQyxLQUFMLEdBQWEsRUFBYjtBQUNIOztBQUVELFFBQUlDLFNBQUosR0FBaUI7QUFDYixlQUFPLENBQUMsQ0FBQyxLQUFLRCxLQUFMLENBQVdFLE1BQXBCO0FBQ0g7O0FBRUQsUUFBSUMsMkJBQUosR0FBbUM7QUFDL0IsZUFBTyxLQUFLSCxLQUFMLENBQVdJLElBQVgsQ0FBZ0JDLFFBQVFBLGdEQUF4QixDQUFQO0FBQ0g7O0FBRURDLGFBQVVDLEdBQVYsRUFBZTtBQUNYLFlBQUlBLGVBQWVULGlCQUFuQixFQUNJLEtBQUtFLEtBQUwsR0FBYSxLQUFLQSxLQUFMLENBQVdRLE1BQVgsQ0FBa0JELElBQUlQLEtBQXRCLENBQWIsQ0FESixLQUdJLEtBQUtBLEtBQUwsQ0FBV1MsSUFBWCxDQUFnQixrQ0FBbUJGLEdBQW5CLENBQWhCO0FBQ1A7QUFsQmtDO2tCQUFsQlQsaUIiLCJmaWxlIjoiZXJyb3JzL2Vycm9yLWxpc3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgcHJvY2Vzc1Rlc3RGbkVycm9yIGZyb20gJy4vcHJvY2Vzcy10ZXN0LWZuLWVycm9yJztcbmltcG9ydCB7IFVuY2F1Z2h0RXJyb3JJblRlc3RDb2RlIH0gZnJvbSAnLi90ZXN0LXJ1bic7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRlc3RDYWZlRXJyb3JMaXN0IHtcbiAgICBjb25zdHJ1Y3RvciAoKSB7XG4gICAgICAgIHRoaXMuaXRlbXMgPSBbXTtcbiAgICB9XG5cbiAgICBnZXQgaGFzRXJyb3JzICgpIHtcbiAgICAgICAgcmV0dXJuICEhdGhpcy5pdGVtcy5sZW5ndGg7XG4gICAgfVxuXG4gICAgZ2V0IGhhc1VuY2F1Z2h0RXJyb3JzSW5UZXN0Q29kZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLml0ZW1zLnNvbWUoaXRlbSA9PiBpdGVtIGluc3RhbmNlb2YgVW5jYXVnaHRFcnJvckluVGVzdENvZGUpO1xuICAgIH1cblxuICAgIGFkZEVycm9yIChlcnIpIHtcbiAgICAgICAgaWYgKGVyciBpbnN0YW5jZW9mIFRlc3RDYWZlRXJyb3JMaXN0KVxuICAgICAgICAgICAgdGhpcy5pdGVtcyA9IHRoaXMuaXRlbXMuY29uY2F0KGVyci5pdGVtcyk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRoaXMuaXRlbXMucHVzaChwcm9jZXNzVGVzdEZuRXJyb3IoZXJyKSk7XG4gICAgfVxufVxuIl19
