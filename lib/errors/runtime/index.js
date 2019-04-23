'use strict';

exports.__esModule = true;
exports.CompositeError = exports.ClientFunctionAPIError = exports.APIError = exports.TestCompilationError = exports.GeneralError = undefined;

var _defineProperties = require('babel-runtime/core-js/object/define-properties');

var _defineProperties2 = _interopRequireDefault(_defineProperties);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _callsiteRecord = require('callsite-record');

var _templates = require('./templates');

var _templates2 = _interopRequireDefault(_templates);

var _createStackFilter = require('../create-stack-filter');

var _createStackFilter2 = _interopRequireDefault(_createStackFilter);

var _getCallsite = require('../get-callsite');

var _renderTemplate = require('../../utils/render-template');

var _renderTemplate2 = _interopRequireDefault(_renderTemplate);

var _types = require('../types');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const ERROR_SEPARATOR = '\n\n';

class ProcessTemplateInstruction {
    constructor(processFn) {
        this.processFn = processFn;
    }
}

// Errors
class GeneralError extends Error {
    constructor(...args) {
        const code = args.shift();
        const template = _templates2.default[code];

        super((0, _renderTemplate2.default)(template, ...args));

        (0, _assign2.default)(this, { code, data: args });
        Error.captureStackTrace(this, GeneralError);
    }
}

exports.GeneralError = GeneralError;
class TestCompilationError extends Error {
    constructor(originalError) {
        const template = _templates2.default[_types.RUNTIME_ERRORS.cannotPrepareTestsDueToError];
        const errorMessage = originalError.toString();

        super((0, _renderTemplate2.default)(template, errorMessage));

        (0, _assign2.default)(this, {
            code: _types.RUNTIME_ERRORS.cannotPrepareTestsDueToError,
            data: [errorMessage]
        });

        // NOTE: stack includes message as well.
        this.stack = (0, _renderTemplate2.default)(template, originalError.stack);
    }
}

exports.TestCompilationError = TestCompilationError;
class APIError extends Error {
    constructor(methodName, code, ...args) {
        let template = _templates2.default[code];

        template = APIError._prepareTemplateAndArgsIfNecessary(template, args);

        const rawMessage = (0, _renderTemplate2.default)(template, ...args);

        super((0, _renderTemplate2.default)(_templates2.default[_types.RUNTIME_ERRORS.cannotPrepareTestsDueToError], rawMessage));

        (0, _assign2.default)(this, { code, data: args });

        // NOTE: `rawMessage` is used in error substitution if it occurs in test run.
        this.rawMessage = rawMessage;
        this.callsite = (0, _getCallsite.getCallsiteForMethod)(methodName);

        // NOTE: We need property getters here because callsite can be replaced by an external code.
        // See https://github.com/DevExpress/testcafe/blob/v1.0.0/src/compiler/test-file/formats/raw.js#L22
        // Also we can't use an ES6 getter for the 'stack' property, because it will create a getter on the class prototype
        // that cannot override the instance property created by the Error parent class.
        (0, _defineProperties2.default)(this, {
            'stack': {
                get: () => this._createStack(_callsiteRecord.renderers.noColor)
            },

            'coloredStack': {
                get: () => this._createStack(_callsiteRecord.renderers.default)
            }
        });
    }

    _renderCallsite(renderer) {
        if (!this.callsite) return '';

        // NOTE: Callsite will throw during rendering if it can't find a target file for the specified function or method:
        // https://github.com/inikulin/callsite-record/issues/2#issuecomment-223263941
        try {
            return this.callsite.renderSync({
                renderer: renderer,
                stackFilter: (0, _createStackFilter2.default)(Error.stackTraceLimit)
            });
        } catch (error) {
            return '';
        }
    }

    _createStack(renderer) {
        const renderedCallsite = this._renderCallsite(renderer);

        if (!renderedCallsite) return this.message;

        return this.message + ERROR_SEPARATOR + renderedCallsite;
    }

    static _prepareTemplateAndArgsIfNecessary(template, args) {
        const lastArg = args.pop();

        if (lastArg instanceof ProcessTemplateInstruction) template = lastArg.processFn(template);else args.push(lastArg);

        return template;
    }
}

exports.APIError = APIError;
class ClientFunctionAPIError extends APIError {
    constructor(methodName, instantiationCallsiteName, code, ...args) {
        args.push(new ProcessTemplateInstruction(template => template.replace(/\{#instantiationCallsiteName\}/g, instantiationCallsiteName)));

        super(methodName, code, ...args);
    }
}

exports.ClientFunctionAPIError = ClientFunctionAPIError;
class CompositeError extends Error {
    constructor(errors) {
        super(errors.map(({ message }) => message).join(ERROR_SEPARATOR));

        this.stack = errors.map(({ stack }) => stack).join(ERROR_SEPARATOR);
        this.code = _types.RUNTIME_ERRORS.compositeArgumentsError;
    }
}
exports.CompositeError = CompositeError;
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9lcnJvcnMvcnVudGltZS9pbmRleC5qcyJdLCJuYW1lcyI6WyJFUlJPUl9TRVBBUkFUT1IiLCJQcm9jZXNzVGVtcGxhdGVJbnN0cnVjdGlvbiIsImNvbnN0cnVjdG9yIiwicHJvY2Vzc0ZuIiwiR2VuZXJhbEVycm9yIiwiRXJyb3IiLCJhcmdzIiwiY29kZSIsInNoaWZ0IiwidGVtcGxhdGUiLCJkYXRhIiwiY2FwdHVyZVN0YWNrVHJhY2UiLCJUZXN0Q29tcGlsYXRpb25FcnJvciIsIm9yaWdpbmFsRXJyb3IiLCJjYW5ub3RQcmVwYXJlVGVzdHNEdWVUb0Vycm9yIiwiZXJyb3JNZXNzYWdlIiwidG9TdHJpbmciLCJzdGFjayIsIkFQSUVycm9yIiwibWV0aG9kTmFtZSIsIl9wcmVwYXJlVGVtcGxhdGVBbmRBcmdzSWZOZWNlc3NhcnkiLCJyYXdNZXNzYWdlIiwiY2FsbHNpdGUiLCJnZXQiLCJfY3JlYXRlU3RhY2siLCJub0NvbG9yIiwiZGVmYXVsdCIsIl9yZW5kZXJDYWxsc2l0ZSIsInJlbmRlcmVyIiwicmVuZGVyU3luYyIsInN0YWNrRmlsdGVyIiwic3RhY2tUcmFjZUxpbWl0IiwiZXJyb3IiLCJyZW5kZXJlZENhbGxzaXRlIiwibWVzc2FnZSIsImxhc3RBcmciLCJwb3AiLCJwdXNoIiwiQ2xpZW50RnVuY3Rpb25BUElFcnJvciIsImluc3RhbnRpYXRpb25DYWxsc2l0ZU5hbWUiLCJyZXBsYWNlIiwiQ29tcG9zaXRlRXJyb3IiLCJlcnJvcnMiLCJtYXAiLCJqb2luIiwiY29tcG9zaXRlQXJndW1lbnRzRXJyb3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFBQTs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7O0FBQ0E7Ozs7QUFDQTs7OztBQUVBLE1BQU1BLGtCQUFrQixNQUF4Qjs7QUFFQSxNQUFNQywwQkFBTixDQUFpQztBQUM3QkMsZ0JBQWFDLFNBQWIsRUFBd0I7QUFDcEIsYUFBS0EsU0FBTCxHQUFpQkEsU0FBakI7QUFDSDtB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QVU3QixLQUFLOEIsR0FBTCxFQUFoQjs7QUFFQSxZQUFJRCxtQkFBbUJsQywwQkFBdkIsRUFDSVEsV0FBVzBCLFFBQVFoQyxTQUFSLENBQWtCTSxRQUFsQixDQUFYLENBREosS0FHSUgsS0FBSytCLElBQUwsQ0FBVUYsT0FBVjs7QUFFSixlQUFPMUIsUUFBUDtBQUNIO0FBbEUrQjs7UUFBdkJTLFEsR0FBQUEsUTtBQXFFTixNQUFNb0Isc0JBQU4sU0FBcUNwQixRQUFyQyxDQUE4QztBQUNqRGhCLGdCQUFhaUIsVUFBYixFQUF5Qm9CLHlCQUF6QixFQUFvRGhDLElBQXBELEVBQTBELEdBQUdELElBQTdELEVBQW1FO0FBQy9EQSxhQUFLK0IsSUFBTCxDQUFVLElBQUlwQywwQkFBSixDQUErQlEsWUFBWUEsU0FBUytCLE9BQVQsQ0FBaUIsaUNBQWpCLEVBQW9ERCx5QkFBcEQsQ0FBM0MsQ0FBVjs7QUFFQSxjQUFNcEIsVUFBTixFQUFrQlosSUFBbEIsRUFBd0IsR0FBR0QsSUFBM0I7QUFDSDtBQUxnRDs7UUFBeENnQyxzQixHQUFBQSxzQjtBQVFOLE1BQU1HLGNBQU4sU0FBNkJwQyxLQUE3QixDQUFtQztBQUN0Q0gsZ0JBQWF3QyxNQUFiLEVBQXFCO0FBQ2pCLGNBQU1BLE9BQU9DLEdBQVAsQ0FBVyxDQUFDLEVBQUVULE9BQUYsRUFBRCxLQUFpQkEsT0FBNUIsRUFBcUNVLElBQXJDLENBQTBDNUMsZUFBMUMsQ0FBTjs7QUFFQSxhQUFLaUIsS0FBTCxHQUFheUIsT0FBT0MsR0FBUCxDQUFXLENBQUMsRUFBRTFCLEtBQUYsRUFBRCxLQUFlQSxLQUExQixFQUFpQzJCLElBQWpDLENBQXNDNUMsZUFBdEMsQ0FBYjtBQUNBLGFBQUtPLElBQUwsR0FBYSxzQkFBZXNDLHVCQUE1QjtBQUNIO0FBTnFDO1FBQTdCSixjLEdBQUFBLGMiLCJmaWxlIjoiZXJyb3JzL3J1bnRpbWUvaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyByZW5kZXJlcnMgfSBmcm9tICdjYWxsc2l0ZS1yZWNvcmQnO1xuaW1wb3J0IFRFTVBMQVRFUyBmcm9tICcuL3RlbXBsYXRlcyc7XG5pbXBvcnQgY3JlYXRlU3RhY2tGaWx0ZXIgZnJvbSAnLi4vY3JlYXRlLXN0YWNrLWZpbHRlcic7XG5pbXBvcnQgeyBnZXRDYWxsc2l0ZUZvck1ldGhvZCB9IGZyb20gJy4uL2dldC1jYWxsc2l0ZSc7XG5pbXBvcnQgcmVuZGVyVGVtcGxhdGUgZnJvbSAnLi4vLi4vdXRpbHMvcmVuZGVyLXRlbXBsYXRlJztcbmltcG9ydCB7IFJVTlRJTUVfRVJST1JTIH0gZnJvbSAnLi4vdHlwZXMnO1xuXG5jb25zdCBFUlJPUl9TRVBBUkFUT1IgPSAnXFxuXFxuJztcblxuY2xhc3MgUHJvY2Vzc1RlbXBsYXRlSW5zdHJ1Y3Rpb24ge1xuICAgIGNvbnN0cnVjdG9yIChwcm9jZXNzRm4pIHtcbiAgICAgICAgdGhpcy5wcm9jZXNzRm4gPSBwcm9jZXNzRm47XG4gICAgfVxufVxuXG4vLyBFcnJvcnNcbmV4cG9ydCBjbGFzcyBHZW5lcmFsRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gICAgY29uc3RydWN0b3IgKC4uLmFyZ3MpIHtcbiAgICAgICAgY29uc3QgY29kZSAgICAgPSBhcmdzLnNoaWZ0KCk7XG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gVEVNUExBVEVTW2NvZGVdO1xuXG4gICAgICAgIHN1cGVyKHJlbmRlclRlbXBsYXRlKHRlbXBsYXRlLCAuLi5hcmdzKSk7XG5cbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLCB7IGNvZGUsIGRhdGE6IGFyZ3MgfSk7XG4gICAgICAgIEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKHRoaXMsIEdlbmVyYWxFcnJvcik7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgVGVzdENvbXBpbGF0aW9uRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gICAgY29uc3RydWN0b3IgKG9yaWdpbmFsRXJyb3IpIHtcbiAgICAgICAgY29uc3QgdGVtcGxhdGUgICAgID0gVEVNUExBVEVTW1JVTlRJTUVfRVJST1JTLmNhbm5vdFByZXBhcmVUZXN0c0R1ZVRvRXJyb3JdO1xuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBvcmlnaW5hbEVycm9yLnRvU3RyaW5nKCk7XG5cbiAgICAgICAgc3VwZXIocmVuZGVyVGVtcGxhdGUodGVtcGxhdGUsIGVycm9yTWVzc2FnZSkpO1xuXG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcywge1xuICAgICAgICAgICAgY29kZTogUlVOVElNRV9FUlJPUlMuY2Fubm90UHJlcGFyZVRlc3RzRHVlVG9FcnJvcixcbiAgICAgICAgICAgIGRhdGE6IFsgZXJyb3JNZXNzYWdlIF1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gTk9URTogc3RhY2sgaW5jbHVkZXMgbWVzc2FnZSBhcyB3ZWxsLlxuICAgICAgICB0aGlzLnN0YWNrID0gcmVuZGVyVGVtcGxhdGUodGVtcGxhdGUsIG9yaWdpbmFsRXJyb3Iuc3RhY2spO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIEFQSUVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICAgIGNvbnN0cnVjdG9yIChtZXRob2ROYW1lLCBjb2RlLCAuLi5hcmdzKSB7XG4gICAgICAgIGxldCB0ZW1wbGF0ZSA9IFRFTVBMQVRFU1tjb2RlXTtcblxuICAgICAgICB0ZW1wbGF0ZSA9IEFQSUVycm9yLl9wcmVwYXJlVGVtcGxhdGVBbmRBcmdzSWZOZWNlc3NhcnkodGVtcGxhdGUsIGFyZ3MpO1xuXG4gICAgICAgIGNvbnN0IHJhd01lc3NhZ2UgPSByZW5kZXJUZW1wbGF0ZSh0ZW1wbGF0ZSwgLi4uYXJncyk7XG5cbiAgICAgICAgc3VwZXIocmVuZGVyVGVtcGxhdGUoVEVNUExBVEVTW1JVTlRJTUVfRVJST1JTLmNhbm5vdFByZXBhcmVUZXN0c0R1ZVRvRXJyb3JdLCByYXdNZXNzYWdlKSk7XG5cbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLCB7IGNvZGUsIGRhdGE6IGFyZ3MgfSk7XG5cbiAgICAgICAgLy8gTk9URTogYHJhd01lc3NhZ2VgIGlzIHVzZWQgaW4gZXJyb3Igc3Vic3RpdHV0aW9uIGlmIGl0IG9jY3VycyBpbiB0ZXN0IHJ1bi5cbiAgICAgICAgdGhpcy5yYXdNZXNzYWdlICA9IHJhd01lc3NhZ2U7XG4gICAgICAgIHRoaXMuY2FsbHNpdGUgICAgPSBnZXRDYWxsc2l0ZUZvck1ldGhvZChtZXRob2ROYW1lKTtcblxuICAgICAgICAvLyBOT1RFOiBXZSBuZWVkIHByb3BlcnR5IGdldHRlcnMgaGVyZSBiZWNhdXNlIGNhbGxzaXRlIGNhbiBiZSByZXBsYWNlZCBieSBhbiBleHRlcm5hbCBjb2RlLlxuICAgICAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL0RldkV4cHJlc3MvdGVzdGNhZmUvYmxvYi92MS4wLjAvc3JjL2NvbXBpbGVyL3Rlc3QtZmlsZS9mb3JtYXRzL3Jhdy5qcyNMMjJcbiAgICAgICAgLy8gQWxzbyB3ZSBjYW4ndCB1c2UgYW4gRVM2IGdldHRlciBmb3IgdGhlICdzdGFjaycgcHJvcGVydHksIGJlY2F1c2UgaXQgd2lsbCBjcmVhdGUgYSBnZXR0ZXIgb24gdGhlIGNsYXNzIHByb3RvdHlwZVxuICAgICAgICAvLyB0aGF0IGNhbm5vdCBvdmVycmlkZSB0aGUgaW5zdGFuY2UgcHJvcGVydHkgY3JlYXRlZCBieSB0aGUgRXJyb3IgcGFyZW50IGNsYXNzLlxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyh0aGlzLCB7XG4gICAgICAgICAgICAnc3RhY2snOiB7XG4gICAgICAgICAgICAgICAgZ2V0OiAoKSA9PiB0aGlzLl9jcmVhdGVTdGFjayhyZW5kZXJlcnMubm9Db2xvcilcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICdjb2xvcmVkU3RhY2snOiB7XG4gICAgICAgICAgICAgICAgZ2V0OiAoKSA9PiB0aGlzLl9jcmVhdGVTdGFjayhyZW5kZXJlcnMuZGVmYXVsdClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgX3JlbmRlckNhbGxzaXRlIChyZW5kZXJlcikge1xuICAgICAgICBpZiAoIXRoaXMuY2FsbHNpdGUpXG4gICAgICAgICAgICByZXR1cm4gJyc7XG5cbiAgICAgICAgLy8gTk9URTogQ2FsbHNpdGUgd2lsbCB0aHJvdyBkdXJpbmcgcmVuZGVyaW5nIGlmIGl0IGNhbid0IGZpbmQgYSB0YXJnZXQgZmlsZSBmb3IgdGhlIHNwZWNpZmllZCBmdW5jdGlvbiBvciBtZXRob2Q6XG4gICAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmlrdWxpbi9jYWxsc2l0ZS1yZWNvcmQvaXNzdWVzLzIjaXNzdWVjb21tZW50LTIyMzI2Mzk0MVxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2FsbHNpdGUucmVuZGVyU3luYyh7XG4gICAgICAgICAgICAgICAgcmVuZGVyZXI6ICAgIHJlbmRlcmVyLFxuICAgICAgICAgICAgICAgIHN0YWNrRmlsdGVyOiBjcmVhdGVTdGFja0ZpbHRlcihFcnJvci5zdGFja1RyYWNlTGltaXQpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHJldHVybiAnJztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9jcmVhdGVTdGFjayAocmVuZGVyZXIpIHtcbiAgICAgICAgY29uc3QgcmVuZGVyZWRDYWxsc2l0ZSA9IHRoaXMuX3JlbmRlckNhbGxzaXRlKHJlbmRlcmVyKTtcblxuICAgICAgICBpZiAoIXJlbmRlcmVkQ2FsbHNpdGUpXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tZXNzYWdlO1xuXG4gICAgICAgIHJldHVybiB0aGlzLm1lc3NhZ2UgKyBFUlJPUl9TRVBBUkFUT1IgKyByZW5kZXJlZENhbGxzaXRlO1xuICAgIH1cblxuICAgIHN0YXRpYyBfcHJlcGFyZVRlbXBsYXRlQW5kQXJnc0lmTmVjZXNzYXJ5ICh0ZW1wbGF0ZSwgYXJncykge1xuICAgICAgICBjb25zdCBsYXN0QXJnID0gYXJncy5wb3AoKTtcblxuICAgICAgICBpZiAobGFzdEFyZyBpbnN0YW5jZW9mIFByb2Nlc3NUZW1wbGF0ZUluc3RydWN0aW9uKVxuICAgICAgICAgICAgdGVtcGxhdGUgPSBsYXN0QXJnLnByb2Nlc3NGbih0ZW1wbGF0ZSk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGFyZ3MucHVzaChsYXN0QXJnKTtcblxuICAgICAgICByZXR1cm4gdGVtcGxhdGU7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgQ2xpZW50RnVuY3Rpb25BUElFcnJvciBleHRlbmRzIEFQSUVycm9yIHtcbiAgICBjb25zdHJ1Y3RvciAobWV0aG9kTmFtZSwgaW5zdGFudGlhdGlvbkNhbGxzaXRlTmFtZSwgY29kZSwgLi4uYXJncykge1xuICAgICAgICBhcmdzLnB1c2gobmV3IFByb2Nlc3NUZW1wbGF0ZUluc3RydWN0aW9uKHRlbXBsYXRlID0+IHRlbXBsYXRlLnJlcGxhY2UoL1xceyNpbnN0YW50aWF0aW9uQ2FsbHNpdGVOYW1lXFx9L2csIGluc3RhbnRpYXRpb25DYWxsc2l0ZU5hbWUpKSk7XG5cbiAgICAgICAgc3VwZXIobWV0aG9kTmFtZSwgY29kZSwgLi4uYXJncyk7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgQ29tcG9zaXRlRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gICAgY29uc3RydWN0b3IgKGVycm9ycykge1xuICAgICAgICBzdXBlcihlcnJvcnMubWFwKCh7IG1lc3NhZ2UgfSkgPT4gbWVzc2FnZSkuam9pbihFUlJPUl9TRVBBUkFUT1IpKTtcblxuICAgICAgICB0aGlzLnN0YWNrID0gZXJyb3JzLm1hcCgoeyBzdGFjayB9KSA9PiBzdGFjaykuam9pbihFUlJPUl9TRVBBUkFUT1IpO1xuICAgICAgICB0aGlzLmNvZGUgID0gUlVOVElNRV9FUlJPUlMuY29tcG9zaXRlQXJndW1lbnRzRXJyb3I7XG4gICAgfVxufVxuIl19
