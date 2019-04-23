'use strict';

exports.__esModule = true;

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _map = require('babel-runtime/core-js/map');

var _map2 = _interopRequireDefault(_map);

exports.default = createRequestMock;

var _hook = require('./hook');

var _hook2 = _interopRequireDefault(_hook);

var _testcafeHammerhead = require('testcafe-hammerhead');

var _runtime = require('../../errors/runtime');

var _types = require('../../errors/types');

var _warningMessage = require('../../notifications/warning-message');

var _warningMessage2 = _interopRequireDefault(_warningMessage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class RequestMock extends _hook2.default {
    constructor() {
        super([]);

        this.pendingRequestFilterRuleInit = null;
        this.mocks = new _map2.default();
    }

    onRequest(event) {
        var _this = this;

        return (0, _asyncToGenerator3.default)(function* () {
            const mock = _this.mocks.get(event._requestFilterRule);

            event.setMock(mock);
        })();
    }

    onResponse(event) {
        var _this2 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            if (event.statusCode === _testcafeHammerhead.SAME_ORIGIN_CHECK_FAILED_STATUS_CODE) _this2.warningLog.addWarning(_warningMessage2.default.requestMockCORSValidationFailed, RequestMock.name, event._requestFilterRule);
        })();
    }

    // API
    onRequestTo(requestFilterRuleInit) {
        if (this.pendingRequestFilterRuleInit) throw new _runtime.APIError('onRequestTo', _types.RUNTIME_ERRORS.requestHookConfigureAPIError, RequestMock.name, "The 'respond' method was not called after 'onRequestTo'. You must call the 'respond' method to provide the mocked response.");

        this.pendingRequestFilterRuleInit = requestFilterRuleInit;

        return this;
    }

    respond(body, statusCode, headers) {
        if (!this.pendingRequestFilterRuleInit) throw new _runtime.APIError('respond', _types.RUNTIME_ERRORS.requestHookConfigureAPIError, RequestMock.name, "The 'onRequestTo' method was not called before 'respond'. You must call the 'onRequestTo' method to provide the URL requests to which are mocked.");

        const mock = new _testcafeHammerhead.ResponseMock(body, statusCode, headers);
        const rule = new _testcafeHammerhead.RequestFilterRule(this.pendingRequestFilterRuleInit);

        this.requestFilterRules.push(rule);
        this.mocks.set(rule, mock);
        this.pendingRequestFilterRuleInit = null;

        return this;
    }
}

function createRequestMock() {
    return new RequestMock();
}
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcGkvcmVxdWVzdC1ob29rcy9yZXF1ZXN0LW1vY2suanMiXSwibmFtZXMiOlsiY3JlYXRlUmVxdWVzdE1vY2siLCJSZXF1ZXN0TW9jayIsImNvbnN0cnVjdG9yIiwicGVuZGluZ1JlcXVlc3RGaWx0ZXJSdWxlSW5pdCIsIm1vY2tzIiwib25SZXF1ZXN0IiwiZXZlbnQiLCJtb2NrIiwiZ2V0IiwiX3JlcXVlc3RGaWx0ZXJSdWxlIiwic2V0TW9jayIsIm9uUmVzcG9uc2UiLCJzdGF0dXNDb2RlIiwid2FybmluZ0xvZyIsImFkZFdhcm5pbmciLCJyZXF1ZXN0TW9ja0NPUlNWYWxpZGF0aW9uRmFpbGVkIiwibmFtZSIsIm9uUmVxdWVzdFRvIiwicmVxdWVzdEZpbHRlclJ1bGVJbml0IiwicmVxdWVzdEhvb2tDb25maWd1cmVBUElFcnJvciIsInJlc3BvbmQiLCJib2R5IiwiaGVhZGVycyIsInJ1bGUiLCJyZXF1ZXN0RmlsdGVyUnVsZXMiLCJwdXNoIiwic2V0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7a0JBa0R3QkEsaUI7O0FBbER4Qjs7OztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7QUFFQSxNQUFNQyxXQUFOLHdCQUFzQztBQUNsQ0Msa0JBQWU7QUFDWCxjQUFNLEVBQU47O0FBRUEsYUFBS0MsNEJBQUwsR0FBb0MsSUFBcEM7QUFDQSxhQUFLQyxLQUFMLEdBQW9DLG1CQUFwQztBQUNIOztBQUVLQyxhQUFOLENBQWlCQyxLQUFqQixFQUF3QjtBQUFBOztBQUFBO0FBQ3BCLGtCQUFNQyxPQUFPLE1BQUtILEtBQUwsQ0FBV0ksR0FBWCxDQUFlRixNQUFNRyxrQkFBckIsQ0FBYjs7QUFFQUgsa0JBQU1JLE9BQU4sQ0FBY0gsSUFBZDtBQUhvQjtBQUl2Qjs7QUFFS0ksY0FBTixDQUFrQkwsS0FBbEIsRUFBeUI7QUFBQTs7QUFBQTtBQUNyQixnQkFBSUEsTUFBTU0sVUFBTiw2REFBSixFQUNJLE9BQUtDLFVBQUwsQ0FBZ0JDLFVBQWhCLENBQTJCLHlCQUFnQkMsK0JBQTNDLEVBQTRFZCxZQUFZZSxJQUF4RixFQUE4RlYsTUFBTUcsa0JBQXBHO0FBRmlCO0FBR3hCOztBQUVEO0FBQ0FRLGdCQUFhQyxxQkFBYixFQUFvQztBQUNoQyxZQUFJLEtBQUtmLDRCQUFULEVBQ0ksTUFBTSxzQkFBYSxhQUFiLEVBQTRCLHNCQUFlZ0IsNEJBQTNDLEVBQXlFbEIsWUFBWWUsSUFBckYsRUFBMkYsNkhBQTNGLENBQU47O0FBRUosYUFBS2IsNEJBQUwsR0FBb0NlLHFCQUFwQzs7QUFFQSxlQUFPLElBQVA7QUFDSDs7QUFFREUsWUFBU0MsSUFBVCxFQUFlVCxVQUFmLEVBQTJCVSxPQUEzQixFQUFvQztBQUNoQyxZQUFJLENBQUMsS0FBS25CLDRCQUFWLEVBQ0ksTUFBTSxzQkFBYSxTQUFiLEVBQXdCLHNCQUFlZ0IsNEJBQXZDLEVBQXFFbEIsWUFBWWUsSUFBakYsRUFBdUYsbUpBQXZGLENBQU47O0FBRUosY0FBTVQsT0FBTyxxQ0FBaUJjLElBQWpCLEVBQXVCVCxVQUF2QixFQUFtQ1UsT0FBbkMsQ0FBYjtBQUNBLGNBQU1DLE9BQU8sMENBQXNCLEtBQUtwQiw0QkFBM0IsQ0FBYjs7QUFFQSxhQUFLcUIsa0JBQUwsQ0FBd0JDLElBQXhCLENBQTZCRixJQUE3QjtBQUNBLGFBQUtuQixLQUFMLENBQVdzQixHQUFYLENBQWVILElBQWYsRUFBcUJoQixJQUFyQjtBQUNBLGFBQUtKLDRCQUFMLEdBQW9DLElBQXBDOztBQUVBLGVBQU8sSUFBUDtBQUNIO0FBekNpQzs7QUE0Q3ZCLFNBQVNILGlCQUFULEdBQThCO0FBQ3pDLFdBQU8sSUFBSUMsV0FBSixFQUFQO0FBQ0giLCJmaWxlIjoiYXBpL3JlcXVlc3QtaG9va3MvcmVxdWVzdC1tb2NrLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlcXVlc3RIb29rIGZyb20gJy4vaG9vayc7XG5pbXBvcnQgeyBSZXNwb25zZU1vY2ssIFJlcXVlc3RGaWx0ZXJSdWxlLCBTQU1FX09SSUdJTl9DSEVDS19GQUlMRURfU1RBVFVTX0NPREUgfSBmcm9tICd0ZXN0Y2FmZS1oYW1tZXJoZWFkJztcbmltcG9ydCB7IEFQSUVycm9yIH0gZnJvbSAnLi4vLi4vZXJyb3JzL3J1bnRpbWUnO1xuaW1wb3J0IHsgUlVOVElNRV9FUlJPUlMgfSBmcm9tICcuLi8uLi9lcnJvcnMvdHlwZXMnO1xuaW1wb3J0IFdBUk5JTkdfTUVTU0FHRSBmcm9tICcuLi8uLi9ub3RpZmljYXRpb25zL3dhcm5pbmctbWVzc2FnZSc7XG5cbmNsYXNzIFJlcXVlc3RNb2NrIGV4dGVuZHMgUmVxdWVzdEhvb2sge1xuICAgIGNvbnN0cnVjdG9yICgpIHtcbiAgICAgICAgc3VwZXIoW10pO1xuXG4gICAgICAgIHRoaXMucGVuZGluZ1JlcXVlc3RGaWx0ZXJSdWxlSW5pdCA9IG51bGw7XG4gICAgICAgIHRoaXMubW9ja3MgICAgICAgICAgICAgICAgICAgICAgICA9IG5ldyBNYXAoKTtcbiAgICB9XG5cbiAgICBhc3luYyBvblJlcXVlc3QgKGV2ZW50KSB7XG4gICAgICAgIGNvbnN0IG1vY2sgPSB0aGlzLm1vY2tzLmdldChldmVudC5fcmVxdWVzdEZpbHRlclJ1bGUpO1xuXG4gICAgICAgIGV2ZW50LnNldE1vY2sobW9jayk7XG4gICAgfVxuXG4gICAgYXN5bmMgb25SZXNwb25zZSAoZXZlbnQpIHtcbiAgICAgICAgaWYgKGV2ZW50LnN0YXR1c0NvZGUgPT09IFNBTUVfT1JJR0lOX0NIRUNLX0ZBSUxFRF9TVEFUVVNfQ09ERSlcbiAgICAgICAgICAgIHRoaXMud2FybmluZ0xvZy5hZGRXYXJuaW5nKFdBUk5JTkdfTUVTU0FHRS5yZXF1ZXN0TW9ja0NPUlNWYWxpZGF0aW9uRmFpbGVkLCBSZXF1ZXN0TW9jay5uYW1lLCBldmVudC5fcmVxdWVzdEZpbHRlclJ1bGUpO1xuICAgIH1cblxuICAgIC8vIEFQSVxuICAgIG9uUmVxdWVzdFRvIChyZXF1ZXN0RmlsdGVyUnVsZUluaXQpIHtcbiAgICAgICAgaWYgKHRoaXMucGVuZGluZ1JlcXVlc3RGaWx0ZXJSdWxlSW5pdClcbiAgICAgICAgICAgIHRocm93IG5ldyBBUElFcnJvcignb25SZXF1ZXN0VG8nLCBSVU5USU1FX0VSUk9SUy5yZXF1ZXN0SG9va0NvbmZpZ3VyZUFQSUVycm9yLCBSZXF1ZXN0TW9jay5uYW1lLCBcIlRoZSAncmVzcG9uZCcgbWV0aG9kIHdhcyBub3QgY2FsbGVkIGFmdGVyICdvblJlcXVlc3RUbycuIFlvdSBtdXN0IGNhbGwgdGhlICdyZXNwb25kJyBtZXRob2QgdG8gcHJvdmlkZSB0aGUgbW9ja2VkIHJlc3BvbnNlLlwiKTtcblxuICAgICAgICB0aGlzLnBlbmRpbmdSZXF1ZXN0RmlsdGVyUnVsZUluaXQgPSByZXF1ZXN0RmlsdGVyUnVsZUluaXQ7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcmVzcG9uZCAoYm9keSwgc3RhdHVzQ29kZSwgaGVhZGVycykge1xuICAgICAgICBpZiAoIXRoaXMucGVuZGluZ1JlcXVlc3RGaWx0ZXJSdWxlSW5pdClcbiAgICAgICAgICAgIHRocm93IG5ldyBBUElFcnJvcigncmVzcG9uZCcsIFJVTlRJTUVfRVJST1JTLnJlcXVlc3RIb29rQ29uZmlndXJlQVBJRXJyb3IsIFJlcXVlc3RNb2NrLm5hbWUsIFwiVGhlICdvblJlcXVlc3RUbycgbWV0aG9kIHdhcyBub3QgY2FsbGVkIGJlZm9yZSAncmVzcG9uZCcuIFlvdSBtdXN0IGNhbGwgdGhlICdvblJlcXVlc3RUbycgbWV0aG9kIHRvIHByb3ZpZGUgdGhlIFVSTCByZXF1ZXN0cyB0byB3aGljaCBhcmUgbW9ja2VkLlwiKTtcblxuICAgICAgICBjb25zdCBtb2NrID0gbmV3IFJlc3BvbnNlTW9jayhib2R5LCBzdGF0dXNDb2RlLCBoZWFkZXJzKTtcbiAgICAgICAgY29uc3QgcnVsZSA9IG5ldyBSZXF1ZXN0RmlsdGVyUnVsZSh0aGlzLnBlbmRpbmdSZXF1ZXN0RmlsdGVyUnVsZUluaXQpO1xuXG4gICAgICAgIHRoaXMucmVxdWVzdEZpbHRlclJ1bGVzLnB1c2gocnVsZSk7XG4gICAgICAgIHRoaXMubW9ja3Muc2V0KHJ1bGUsIG1vY2spO1xuICAgICAgICB0aGlzLnBlbmRpbmdSZXF1ZXN0RmlsdGVyUnVsZUluaXQgPSBudWxsO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY3JlYXRlUmVxdWVzdE1vY2sgKCkge1xuICAgIHJldHVybiBuZXcgUmVxdWVzdE1vY2soKTtcbn1cbiJdfQ==
