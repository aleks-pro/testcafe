'use strict';

exports.__esModule = true;
exports.SelectorNodeTransform = exports.FunctionTransform = undefined;
exports.createReplicator = createReplicator;

var _lodash = require('lodash');

var _replicator = require('replicator');

var _replicator2 = _interopRequireDefault(_replicator);

var _builderSymbol = require('./builder-symbol');

var _builderSymbol2 = _interopRequireDefault(_builderSymbol);

var _compileClientFunction = require('../compiler/compile-client-function');

var _compileClientFunction2 = _interopRequireDefault(_compileClientFunction);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createReplicator(transforms) {
    // NOTE: we will serialize replicator results
    // to JSON with a command or command result.
    // Therefore there is no need to do additional job here,
    // so we use identity functions for serialization.
    const replicator = new _replicator2.default({
        serialize: _lodash.identity,
        deserialize: _lodash.identity
    });

    return replicator.addTransforms(transforms);
}

// Replicator transforms
class FunctionTransform {
    constructor(callsiteNames) {
        this.type = 'Function';
        this.callsiteNames = callsiteNames;
    }

    shouldTransform(type) {
        return type === 'function';
    }

    toSerializable(fn) {
        const clientFnBuilder = fn[_builderSymbol2.default];

        if (clientFnBuilder) {
            return {
                fnCode: clientFnBuilder.compiledFnCode,
                dependencies: clientFnBuilder.getFunctionDependencies()
            };
        }

        return {
            fnCode: (0, _compileClientFunction2.default)(fn.toString(), null, this.callsiteNames.instantiation, this.callsiteNames.execution),
            dependencies: {}
        };
    }

    fromSerializable() {
        return void 0;
    }
}

exports.FunctionTransform = FunctionTransform;
class SelectorNodeTransform {
    constructor() {
        this.type = 'Node';
    }

    shouldTransform() {
        return false;
    }

    fromSerializable(nodeSnapshot) {
        return nodeSnapshot;
    }
}
exports.SelectorNodeTransform = SelectorNodeTransform;
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jbGllbnQtZnVuY3Rpb25zL3JlcGxpY2F0b3IuanMiXSwibmFtZXMiOlsiY3JlYXRlUmVwbGljYXRvciIsInRyYW5zZm9ybXMiLCJyZXBsaWNhdG9yIiwic2VyaWFsaXplIiwiZGVzZXJpYWxpemUiLCJhZGRUcmFuc2Zvcm1zIiwiRnVuY3Rpb25UcmFuc2Zvcm0iLCJjb25zdHJ1Y3RvciIsImNhbGxzaXRlTmFtZXMiLCJ0eXBlIiwic2hvdWxkVHJhbnNmb3JtIiwidG9TZXJpYWxpemFibGUiLCJmbiIsImNsaWVudEZuQnVpbGRlciIsImZuQ29kZSIsImNvbXBpbGVkRm5Db2RlIiwiZGVwZW5kZW5jaWVzIiwiZ2V0RnVuY3Rpb25EZXBlbmRlbmNpZXMiLCJ0b1N0cmluZyIsImluc3RhbnRpYXRpb24iLCJleGVjdXRpb24iLCJmcm9tU2VyaWFsaXphYmxlIiwiU2VsZWN0b3JOb2RlVHJhbnNmb3JtIiwibm9kZVNuYXBzaG90Il0sIm1hcHBpbmdzIjoiOzs7O1FBS2dCQSxnQixHQUFBQSxnQjs7QUFMaEI7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7QUFFTyxTQUFTQSxnQkFBVCxDQUEyQkMsVUFBM0IsRUFBdUM7QUFDMUM7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFNQyxhQUFhLHlCQUFlO0FBQzlCQyxtQ0FEOEI7QUFFOUJDO0FBRjhCLEtBQWYsQ0FBbkI7O0FBS0EsV0FBT0YsV0FBV0csYUFBWCxDQUF5QkosVUFBekIsQ0FBUDtBQUNIOztBQUVEO0FBQ08sTUFBTUssaUJBQU4sQ0FBd0I7QUFDM0JDLGdCQUFhQyxhQUFiLEVBQTRCO0FBQ3hCLGFBQUtDLElBQUwsR0FBcUIsVUFBckI7QUFDQSxhQUFLRCxhQUFMLEdBQXFCQSxhQUFyQjtBQUNIOztBQUVERSxvQkFBaUJELElBQWpCLEVBQXVCO0FBQ25CLGVBQU9BLFNBQVMsVUFBaEI7QUFDSDs7QUFFREUsbUJBQWdCQyxFQUFoQixFQUFvQjtBQUNoQixjQUFNQyxrQkFBa0JELDJCQUF4Qjs7QUFFQSxZQUFJQyxlQUFKLEVBQXFCO0FBQ2pCLG1CQUFPO0FBQ0hDLHdCQUFjRCxnQkFBZ0JFLGNBRDNCO0FBRUhDLDhCQUFjSCxnQkFBZ0JJLHVCQUFoQjtBQUZYLGFBQVA7QUFJSDs7QUFFRCxlQUFPO0FBQ0hILG9CQUFjLHFDQUFzQkYsR0FBR00sUUFBSCxFQUF0QixFQUFxQyxJQUFyQyxFQUEyQyxLQUFLVixhQUFMLENBQW1CVyxhQUE5RCxFQUE2RSxLQUFLWCxhQUFMLENBQW1CWSxTQUFoRyxDQURYO0FBRUhKLDBCQUFjO0FBRlgsU0FBUDtBQUlIOztBQUVESyx1QkFBb0I7QUFDaEIsZUFBTyxLQUFLLENBQVo7QUFDSDtBQTVCMEI7O1FBQWxCZixpQixHQUFBQSxpQjtBQStCTixNQUFNZ0IscUJBQU4sQ0FBNEI7QUFDL0JmLGtCQUFlO0FBQ1gsYUFBS0UsSUFBTCxHQUFZLE1BQVo7QUFDSDs7QUFFREMsc0JBQW1CO0FBQ2YsZUFBTyxLQUFQO0FBQ0g7O0FBRURXLHFCQUFrQkUsWUFBbEIsRUFBZ0M7QUFDNUIsZUFBT0EsWUFBUDtBQUNIO0FBWDhCO1FBQXRCRCxxQixHQUFBQSxxQiIsImZpbGUiOiJjbGllbnQtZnVuY3Rpb25zL3JlcGxpY2F0b3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBpZGVudGl0eSB9IGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgUmVwbGljYXRvciBmcm9tICdyZXBsaWNhdG9yJztcbmltcG9ydCBmdW5jdGlvbkJ1aWxkZXJTeW1ib2wgZnJvbSAnLi9idWlsZGVyLXN5bWJvbCc7XG5pbXBvcnQgY29tcGlsZUNsaWVudEZ1bmN0aW9uIGZyb20gJy4uL2NvbXBpbGVyL2NvbXBpbGUtY2xpZW50LWZ1bmN0aW9uJztcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVJlcGxpY2F0b3IgKHRyYW5zZm9ybXMpIHtcbiAgICAvLyBOT1RFOiB3ZSB3aWxsIHNlcmlhbGl6ZSByZXBsaWNhdG9yIHJlc3VsdHNcbiAgICAvLyB0byBKU09OIHdpdGggYSBjb21tYW5kIG9yIGNvbW1hbmQgcmVzdWx0LlxuICAgIC8vIFRoZXJlZm9yZSB0aGVyZSBpcyBubyBuZWVkIHRvIGRvIGFkZGl0aW9uYWwgam9iIGhlcmUsXG4gICAgLy8gc28gd2UgdXNlIGlkZW50aXR5IGZ1bmN0aW9ucyBmb3Igc2VyaWFsaXphdGlvbi5cbiAgICBjb25zdCByZXBsaWNhdG9yID0gbmV3IFJlcGxpY2F0b3Ioe1xuICAgICAgICBzZXJpYWxpemU6ICAgaWRlbnRpdHksXG4gICAgICAgIGRlc2VyaWFsaXplOiBpZGVudGl0eVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHJlcGxpY2F0b3IuYWRkVHJhbnNmb3Jtcyh0cmFuc2Zvcm1zKTtcbn1cblxuLy8gUmVwbGljYXRvciB0cmFuc2Zvcm1zXG5leHBvcnQgY2xhc3MgRnVuY3Rpb25UcmFuc2Zvcm0ge1xuICAgIGNvbnN0cnVjdG9yIChjYWxsc2l0ZU5hbWVzKSB7XG4gICAgICAgIHRoaXMudHlwZSAgICAgICAgICA9ICdGdW5jdGlvbic7XG4gICAgICAgIHRoaXMuY2FsbHNpdGVOYW1lcyA9IGNhbGxzaXRlTmFtZXM7XG4gICAgfVxuXG4gICAgc2hvdWxkVHJhbnNmb3JtICh0eXBlKSB7XG4gICAgICAgIHJldHVybiB0eXBlID09PSAnZnVuY3Rpb24nO1xuICAgIH1cblxuICAgIHRvU2VyaWFsaXphYmxlIChmbikge1xuICAgICAgICBjb25zdCBjbGllbnRGbkJ1aWxkZXIgPSBmbltmdW5jdGlvbkJ1aWxkZXJTeW1ib2xdO1xuXG4gICAgICAgIGlmIChjbGllbnRGbkJ1aWxkZXIpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZm5Db2RlOiAgICAgICBjbGllbnRGbkJ1aWxkZXIuY29tcGlsZWRGbkNvZGUsXG4gICAgICAgICAgICAgICAgZGVwZW5kZW5jaWVzOiBjbGllbnRGbkJ1aWxkZXIuZ2V0RnVuY3Rpb25EZXBlbmRlbmNpZXMoKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBmbkNvZGU6ICAgICAgIGNvbXBpbGVDbGllbnRGdW5jdGlvbihmbi50b1N0cmluZygpLCBudWxsLCB0aGlzLmNhbGxzaXRlTmFtZXMuaW5zdGFudGlhdGlvbiwgdGhpcy5jYWxsc2l0ZU5hbWVzLmV4ZWN1dGlvbiksXG4gICAgICAgICAgICBkZXBlbmRlbmNpZXM6IHt9XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZnJvbVNlcmlhbGl6YWJsZSAoKSB7XG4gICAgICAgIHJldHVybiB2b2lkIDA7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgU2VsZWN0b3JOb2RlVHJhbnNmb3JtIHtcbiAgICBjb25zdHJ1Y3RvciAoKSB7XG4gICAgICAgIHRoaXMudHlwZSA9ICdOb2RlJztcbiAgICB9XG5cbiAgICBzaG91bGRUcmFuc2Zvcm0gKCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgZnJvbVNlcmlhbGl6YWJsZSAobm9kZVNuYXBzaG90KSB7XG4gICAgICAgIHJldHVybiBub2RlU25hcHNob3Q7XG4gICAgfVxufVxuIl19
