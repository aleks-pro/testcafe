'use strict';

exports.__esModule = true;

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _values = require('babel-runtime/core-js/object/values');

var _values2 = _interopRequireDefault(_values);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

exports.default = createRequestLogger;

var _testcafeHammerhead = require('testcafe-hammerhead');

var _hook = require('./hook');

var _hook2 = _interopRequireDefault(_hook);

var _useragent = require('useragent');

var _testRunTracker = require('../test-run-tracker');

var _testRunTracker2 = _interopRequireDefault(_testRunTracker);

var _reExecutablePromise = require('../../utils/re-executable-promise');

var _reExecutablePromise2 = _interopRequireDefault(_reExecutablePromise);

var _runtime = require('../../errors/runtime');

var _types = require('../../errors/types');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const DEFAULT_OPTIONS = {
    logRequestHeaders: false,
    logRequestBody: false,
    stringifyRequestBody: false,
    logResponseHeaders: false,
    logResponseBody: false,
    stringifyResponseBody: false
};

class RequestLoggerImplementation extends _hook2.default {
    constructor(requestFilterRuleInit, options) {
        options = (0, _assign2.default)({}, DEFAULT_OPTIONS, options);
        RequestLoggerImplementation._assertLogOptions(options);

        const configureResponseEventOptions = new _testcafeHammerhead.ConfigureResponseEventOptions(options.logResponseHeaders, options.logResponseBody);

        super(requestFilterRuleInit, configureResponseEventOptions);

        this.options = options;

        this._internalRequests = {};
    }

    static _assertLogOptions(logOptions) {
        if (!logOptions.logRequestBody && logOptions.stringifyRequestBody) throw new _runtime.APIError('RequestLogger', _types.RUNTIME_ERRORS.requestHookConfigureAPIError, 'RequestLogger', 'Cannot stringify the request body because it is not logged. Specify { logRequestBody: true } in log options.');

        if (!logOptions.logResponseBody && logOptions.stringifyResponseBody) throw new _runtime.APIError('RequestLogger', _types.RUNTIME_ERRORS.requestHookConfigureAPIError, 'RequestLogger', 'Cannot stringify the response body because it is not logged. Specify { logResponseBody: true } in log options.');
    }

    onRequest(event) {
        var _this = this;

        return (0, _asyncToGenerator3.default)(function* () {
            const userAgent = (0, _useragent.parse)(event._requestInfo.userAgent).toString();

            const loggedReq = {
                id: event._requestInfo.requestId,
                testRunId: event._requestInfo.sessionId,
                userAgent,
                request: {
                    url: event._requestInfo.url,
                    method: event._requestInfo.method
                }
            };

            if (_this.options.logRequestHeaders) loggedReq.request.headers = (0, _assign2.default)({}, event._requestInfo.headers);

            if (_this.options.logRequestBody) loggedReq.request.body = _this.options.stringifyRequestBody ? event._requestInfo.body.toString() : event._requestInfo.body;

            _this._internalRequests[loggedReq.id] = loggedReq;
        })();
    }

    onResponse(event) {
        var _this2 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            const loggerReq = _this2._internalRequests[event.requestId];

            // NOTE: If the 'clear' method is called during a long running request,
            // we should not save a response part - request part has been already removed.
            if (!loggerReq) return;

            loggerReq.response = {};
            loggerReq.response.statusCode = event.statusCode;

            if (_this2.options.logResponseHeaders) loggerReq.response.headers = (0, _assign2.default)({}, event.headers);

            if (_this2.options.logResponseBody) {
                loggerReq.response.body = _this2.options.stringifyResponseBody && event.body ? event.body.toString() : event.body;
            }
        })();
    }

    _prepareInternalRequestInfo() {
        const testRun = _testRunTracker2.default.resolveContextTestRun();
        let preparedRequests = (0, _values2.default)(this._internalRequests);

        if (testRun) preparedRequests = preparedRequests.filter(r => r.testRunId === testRun.id);

        return preparedRequests;
    }

    _getCompletedRequests() {
        return this._prepareInternalRequestInfo().filter(r => r.response);
    }

    // API
    contains(predicate) {
        var _this3 = this;

        return _reExecutablePromise2.default.fromFn((0, _asyncToGenerator3.default)(function* () {
            return !!_this3._getCompletedRequests().find(predicate);
        }));
    }

    count(predicate) {
        var _this4 = this;

        return _reExecutablePromise2.default.fromFn((0, _asyncToGenerator3.default)(function* () {
            return _this4._getCompletedRequests().filter(predicate).length;
        }));
    }

    clear() {
        const testRun = _testRunTracker2.default.resolveContextTestRun();

        if (testRun) {
            (0, _keys2.default)(this._internalRequests).forEach(id => {
                if (this._internalRequests[id].testRunId === testRun.id) delete this._internalRequests[id];
            });
        } else this._internalRequests = {};
    }

    get requests() {
        return this._prepareInternalRequestInfo();
    }
}

function createRequestLogger(requestFilterRuleInit, logOptions) {
    return new RequestLoggerImplementation(requestFilterRuleInit, logOptions);
}
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcGkvcmVxdWVzdC1ob29rcy9yZXF1ZXN0LWxvZ2dlci5qcyJdLCJuYW1lcyI6WyJjcmVhdGVSZXF1ZXN0TG9nZ2VyIiwiREVGQVVMVF9PUFRJT05TIiwibG9nUmVxdWVzdEhlYWRlcnMiLCJsb2dSZXF1ZXN0Qm9keSIsInN0cmluZ2lmeVJlcXVlc3RCb2R5IiwibG9nUmVzcG9uc2VIZWFkZXJzIiwibG9nUmVzcG9uc2VCb2R5Iiwic3RyaW5naWZ5UmVzcG9uc2VCb2R5IiwiUmVxdWVzdExvZ2dlckltcGxlbWVudGF0aW9uIiwiY29uc3RydWN0b3IiLCJyZXF1ZXN0RmlsdGVyUnVsZUluaXQiLCJvcHRpb25zIiwiX2Fzc2VydExvZ09wdGlvbnMiLCJjb25maWd1cmVSZXNwb25zZUV2ZW50T3B0aW9ucyIsIl9pbnRlcm5hbFJlcXVlc3RzIiwibG9nT3B0aW9ucyIsInJlcXVlc3RIb29rQ29uZmlndXJlQVBJRXJyb3IiLCJvblJlcXVlc3QiLCJldmVudCIsInVzZXJBZ2VudCIsIl9yZXF1ZXN0SW5mbyIsInRvU3RyaW5nIiwibG9nZ2VkUmVxIiwiaWQiLCJyZXF1ZXN0SWQiLCJ0ZXN0UnVuSWQiLCJzZXNzaW9uSWQiLCJyZXF1ZXN0IiwidXJsIiwibWV0aG9kIiwiaGVhZGVycyIsImJvZHkiLCJvblJlc3BvbnNlIiwibG9nZ2VyUmVxIiwicmVzcG9uc2UiLCJzdGF0dXNDb2RlIiwiX3ByZXBhcmVJbnRlcm5hbFJlcXVlc3RJbmZvIiwidGVzdFJ1biIsInJlc29sdmVDb250ZXh0VGVzdFJ1biIsInByZXBhcmVkUmVxdWVzdHMiLCJmaWx0ZXIiLCJyIiwiX2dldENvbXBsZXRlZFJlcXVlc3RzIiwiY29udGFpbnMiLCJwcmVkaWNhdGUiLCJmcm9tRm4iLCJmaW5kIiwiY291bnQiLCJsZW5ndGgiLCJjbGVhciIsImZvckVhY2giLCJyZXF1ZXN0cyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7a0JBK0h3QkEsbUI7O0FBL0h4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QixNQUFNO0FBQzlDLG9CQUFJLEtBQUtULGlCQUFMLENBQXVCUyxFQUF2QixFQUEyQkUsU0FBM0IsS0FBeUNZLFFBQVFkLEVBQXJELEVBQ0ksT0FBTyxLQUFLVCxpQkFBTCxDQUF1QlMsRUFBdkIsQ0FBUDtBQUNQLGFBSEQ7QUFJSCxTQUxELE1BT0ksS0FBS1QsaUJBQUwsR0FBeUIsRUFBekI7QUFDUDs7QUFFRCxRQUFJcUMsUUFBSixHQUFnQjtBQUNaLGVBQU8sS0FBS2YsMkJBQUwsRUFBUDtBQUNIO0FBM0dpRDs7QUE4R3ZDLFNBQVNwQyxtQkFBVCxDQUE4QlUscUJBQTlCLEVBQXFESyxVQUFyRCxFQUFpRTtBQUM1RSxXQUFPLElBQUlQLDJCQUFKLENBQWdDRSxxQkFBaEMsRUFBdURLLFVBQXZELENBQVA7QUFDSCIsImZpbGUiOiJhcGkvcmVxdWVzdC1ob29rcy9yZXF1ZXN0LWxvZ2dlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbmZpZ3VyZVJlc3BvbnNlRXZlbnRPcHRpb25zIH0gZnJvbSAndGVzdGNhZmUtaGFtbWVyaGVhZCc7XG5pbXBvcnQgUmVxdWVzdEhvb2sgZnJvbSAnLi9ob29rJztcbmltcG9ydCB7IHBhcnNlIGFzIHBhcnNlVXNlckFnZW50IH0gZnJvbSAndXNlcmFnZW50JztcbmltcG9ydCB0ZXN0UnVuVHJhY2tlciBmcm9tICcuLi90ZXN0LXJ1bi10cmFja2VyJztcbmltcG9ydCBSZUV4ZWN1dGFibGVQcm9taXNlIGZyb20gJy4uLy4uL3V0aWxzL3JlLWV4ZWN1dGFibGUtcHJvbWlzZSc7XG5pbXBvcnQgeyBBUElFcnJvciB9IGZyb20gJy4uLy4uL2Vycm9ycy9ydW50aW1lJztcbmltcG9ydCB7IFJVTlRJTUVfRVJST1JTIH0gZnJvbSAnLi4vLi4vZXJyb3JzL3R5cGVzJztcblxuY29uc3QgREVGQVVMVF9PUFRJT05TID0ge1xuICAgIGxvZ1JlcXVlc3RIZWFkZXJzOiAgICAgZmFsc2UsXG4gICAgbG9nUmVxdWVzdEJvZHk6ICAgICAgICBmYWxzZSxcbiAgICBzdHJpbmdpZnlSZXF1ZXN0Qm9keTogIGZhbHNlLFxuICAgIGxvZ1Jlc3BvbnNlSGVhZGVyczogICAgZmFsc2UsXG4gICAgbG9nUmVzcG9uc2VCb2R5OiAgICAgICBmYWxzZSxcbiAgICBzdHJpbmdpZnlSZXNwb25zZUJvZHk6IGZhbHNlXG59O1xuXG5jbGFzcyBSZXF1ZXN0TG9nZ2VySW1wbGVtZW50YXRpb24gZXh0ZW5kcyBSZXF1ZXN0SG9vayB7XG4gICAgY29uc3RydWN0b3IgKHJlcXVlc3RGaWx0ZXJSdWxlSW5pdCwgb3B0aW9ucykge1xuICAgICAgICBvcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgREVGQVVMVF9PUFRJT05TLCBvcHRpb25zKTtcbiAgICAgICAgUmVxdWVzdExvZ2dlckltcGxlbWVudGF0aW9uLl9hc3NlcnRMb2dPcHRpb25zKG9wdGlvbnMpO1xuXG4gICAgICAgIGNvbnN0IGNvbmZpZ3VyZVJlc3BvbnNlRXZlbnRPcHRpb25zID0gbmV3IENvbmZpZ3VyZVJlc3BvbnNlRXZlbnRPcHRpb25zKG9wdGlvbnMubG9nUmVzcG9uc2VIZWFkZXJzLCBvcHRpb25zLmxvZ1Jlc3BvbnNlQm9keSk7XG5cbiAgICAgICAgc3VwZXIocmVxdWVzdEZpbHRlclJ1bGVJbml0LCBjb25maWd1cmVSZXNwb25zZUV2ZW50T3B0aW9ucyk7XG5cbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcblxuICAgICAgICB0aGlzLl9pbnRlcm5hbFJlcXVlc3RzID0ge307XG4gICAgfVxuXG4gICAgc3RhdGljIF9hc3NlcnRMb2dPcHRpb25zIChsb2dPcHRpb25zKSB7XG4gICAgICAgIGlmICghbG9nT3B0aW9ucy5sb2dSZXF1ZXN0Qm9keSAmJiBsb2dPcHRpb25zLnN0cmluZ2lmeVJlcXVlc3RCb2R5KVxuICAgICAgICAgICAgdGhyb3cgbmV3IEFQSUVycm9yKCdSZXF1ZXN0TG9nZ2VyJywgUlVOVElNRV9FUlJPUlMucmVxdWVzdEhvb2tDb25maWd1cmVBUElFcnJvciwgJ1JlcXVlc3RMb2dnZXInLCAnQ2Fubm90IHN0cmluZ2lmeSB0aGUgcmVxdWVzdCBib2R5IGJlY2F1c2UgaXQgaXMgbm90IGxvZ2dlZC4gU3BlY2lmeSB7IGxvZ1JlcXVlc3RCb2R5OiB0cnVlIH0gaW4gbG9nIG9wdGlvbnMuJyk7XG5cbiAgICAgICAgaWYgKCFsb2dPcHRpb25zLmxvZ1Jlc3BvbnNlQm9keSAmJiBsb2dPcHRpb25zLnN0cmluZ2lmeVJlc3BvbnNlQm9keSlcbiAgICAgICAgICAgIHRocm93IG5ldyBBUElFcnJvcignUmVxdWVzdExvZ2dlcicsIFJVTlRJTUVfRVJST1JTLnJlcXVlc3RIb29rQ29uZmlndXJlQVBJRXJyb3IsICdSZXF1ZXN0TG9nZ2VyJywgJ0Nhbm5vdCBzdHJpbmdpZnkgdGhlIHJlc3BvbnNlIGJvZHkgYmVjYXVzZSBpdCBpcyBub3QgbG9nZ2VkLiBTcGVjaWZ5IHsgbG9nUmVzcG9uc2VCb2R5OiB0cnVlIH0gaW4gbG9nIG9wdGlvbnMuJyk7XG4gICAgfVxuXG4gICAgYXN5bmMgb25SZXF1ZXN0IChldmVudCkge1xuICAgICAgICBjb25zdCB1c2VyQWdlbnQgPSBwYXJzZVVzZXJBZ2VudChldmVudC5fcmVxdWVzdEluZm8udXNlckFnZW50KS50b1N0cmluZygpO1xuXG4gICAgICAgIGNvbnN0IGxvZ2dlZFJlcSA9IHtcbiAgICAgICAgICAgIGlkOiAgICAgICAgZXZlbnQuX3JlcXVlc3RJbmZvLnJlcXVlc3RJZCxcbiAgICAgICAgICAgIHRlc3RSdW5JZDogZXZlbnQuX3JlcXVlc3RJbmZvLnNlc3Npb25JZCxcbiAgICAgICAgICAgIHVzZXJBZ2VudCxcbiAgICAgICAgICAgIHJlcXVlc3Q6ICAge1xuICAgICAgICAgICAgICAgIHVybDogICAgZXZlbnQuX3JlcXVlc3RJbmZvLnVybCxcbiAgICAgICAgICAgICAgICBtZXRob2Q6IGV2ZW50Ll9yZXF1ZXN0SW5mby5tZXRob2QsXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5sb2dSZXF1ZXN0SGVhZGVycylcbiAgICAgICAgICAgIGxvZ2dlZFJlcS5yZXF1ZXN0LmhlYWRlcnMgPSBPYmplY3QuYXNzaWduKHt9LCBldmVudC5fcmVxdWVzdEluZm8uaGVhZGVycyk7XG5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5sb2dSZXF1ZXN0Qm9keSlcbiAgICAgICAgICAgIGxvZ2dlZFJlcS5yZXF1ZXN0LmJvZHkgPSB0aGlzLm9wdGlvbnMuc3RyaW5naWZ5UmVxdWVzdEJvZHkgPyBldmVudC5fcmVxdWVzdEluZm8uYm9keS50b1N0cmluZygpIDogZXZlbnQuX3JlcXVlc3RJbmZvLmJvZHk7XG5cbiAgICAgICAgdGhpcy5faW50ZXJuYWxSZXF1ZXN0c1tsb2dnZWRSZXEuaWRdID0gbG9nZ2VkUmVxO1xuICAgIH1cblxuICAgIGFzeW5jIG9uUmVzcG9uc2UgKGV2ZW50KSB7XG4gICAgICAgIGNvbnN0IGxvZ2dlclJlcSA9IHRoaXMuX2ludGVybmFsUmVxdWVzdHNbZXZlbnQucmVxdWVzdElkXTtcblxuICAgICAgICAvLyBOT1RFOiBJZiB0aGUgJ2NsZWFyJyBtZXRob2QgaXMgY2FsbGVkIGR1cmluZyBhIGxvbmcgcnVubmluZyByZXF1ZXN0LFxuICAgICAgICAvLyB3ZSBzaG91bGQgbm90IHNhdmUgYSByZXNwb25zZSBwYXJ0IC0gcmVxdWVzdCBwYXJ0IGhhcyBiZWVuIGFscmVhZHkgcmVtb3ZlZC5cbiAgICAgICAgaWYgKCFsb2dnZXJSZXEpXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgbG9nZ2VyUmVxLnJlc3BvbnNlICAgICAgICAgICAgPSB7fTtcbiAgICAgICAgbG9nZ2VyUmVxLnJlc3BvbnNlLnN0YXR1c0NvZGUgPSBldmVudC5zdGF0dXNDb2RlO1xuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMubG9nUmVzcG9uc2VIZWFkZXJzKVxuICAgICAgICAgICAgbG9nZ2VyUmVxLnJlc3BvbnNlLmhlYWRlcnMgPSBPYmplY3QuYXNzaWduKHt9LCBldmVudC5oZWFkZXJzKTtcblxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmxvZ1Jlc3BvbnNlQm9keSkge1xuICAgICAgICAgICAgbG9nZ2VyUmVxLnJlc3BvbnNlLmJvZHkgPSB0aGlzLm9wdGlvbnMuc3RyaW5naWZ5UmVzcG9uc2VCb2R5ICYmIGV2ZW50LmJvZHlcbiAgICAgICAgICAgICAgICA/IGV2ZW50LmJvZHkudG9TdHJpbmcoKVxuICAgICAgICAgICAgICAgIDogZXZlbnQuYm9keTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9wcmVwYXJlSW50ZXJuYWxSZXF1ZXN0SW5mbyAoKSB7XG4gICAgICAgIGNvbnN0IHRlc3RSdW4gICAgICAgID0gdGVzdFJ1blRyYWNrZXIucmVzb2x2ZUNvbnRleHRUZXN0UnVuKCk7XG4gICAgICAgIGxldCBwcmVwYXJlZFJlcXVlc3RzID0gT2JqZWN0LnZhbHVlcyh0aGlzLl9pbnRlcm5hbFJlcXVlc3RzKTtcblxuICAgICAgICBpZiAodGVzdFJ1bilcbiAgICAgICAgICAgIHByZXBhcmVkUmVxdWVzdHMgPSBwcmVwYXJlZFJlcXVlc3RzLmZpbHRlcihyID0+IHIudGVzdFJ1bklkID09PSB0ZXN0UnVuLmlkKTtcblxuICAgICAgICByZXR1cm4gcHJlcGFyZWRSZXF1ZXN0cztcbiAgICB9XG5cbiAgICBfZ2V0Q29tcGxldGVkUmVxdWVzdHMgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fcHJlcGFyZUludGVybmFsUmVxdWVzdEluZm8oKS5maWx0ZXIociA9PiByLnJlc3BvbnNlKTtcbiAgICB9XG5cbiAgICAvLyBBUElcbiAgICBjb250YWlucyAocHJlZGljYXRlKSB7XG4gICAgICAgIHJldHVybiBSZUV4ZWN1dGFibGVQcm9taXNlLmZyb21Gbihhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gISF0aGlzLl9nZXRDb21wbGV0ZWRSZXF1ZXN0cygpLmZpbmQocHJlZGljYXRlKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgY291bnQgKHByZWRpY2F0ZSkge1xuICAgICAgICByZXR1cm4gUmVFeGVjdXRhYmxlUHJvbWlzZS5mcm9tRm4oYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2dldENvbXBsZXRlZFJlcXVlc3RzKCkuZmlsdGVyKHByZWRpY2F0ZSkubGVuZ3RoO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBjbGVhciAoKSB7XG4gICAgICAgIGNvbnN0IHRlc3RSdW4gPSB0ZXN0UnVuVHJhY2tlci5yZXNvbHZlQ29udGV4dFRlc3RSdW4oKTtcblxuICAgICAgICBpZiAodGVzdFJ1bikge1xuICAgICAgICAgICAgT2JqZWN0LmtleXModGhpcy5faW50ZXJuYWxSZXF1ZXN0cykuZm9yRWFjaChpZCA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX2ludGVybmFsUmVxdWVzdHNbaWRdLnRlc3RSdW5JZCA9PT0gdGVzdFJ1bi5pZClcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHRoaXMuX2ludGVybmFsUmVxdWVzdHNbaWRdO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhpcy5faW50ZXJuYWxSZXF1ZXN0cyA9IHt9O1xuICAgIH1cblxuICAgIGdldCByZXF1ZXN0cyAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9wcmVwYXJlSW50ZXJuYWxSZXF1ZXN0SW5mbygpO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY3JlYXRlUmVxdWVzdExvZ2dlciAocmVxdWVzdEZpbHRlclJ1bGVJbml0LCBsb2dPcHRpb25zKSB7XG4gICAgcmV0dXJuIG5ldyBSZXF1ZXN0TG9nZ2VySW1wbGVtZW50YXRpb24ocmVxdWVzdEZpbHRlclJ1bGVJbml0LCBsb2dPcHRpb25zKTtcbn1cblxuIl19
