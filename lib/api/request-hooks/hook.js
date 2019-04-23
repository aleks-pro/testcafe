'use strict';

exports.__esModule = true;

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _testcafeHammerhead = require('testcafe-hammerhead');

var _lodash = require('lodash');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class RequestHook {
    constructor(requestFilterRules, responseEventConfigureOpts) {
        this.requestFilterRules = this._prepareRequestFilterRules(requestFilterRules);
        this._instantiatedRequestFilterRules = [];
        this.responseEventConfigureOpts = responseEventConfigureOpts;

        this.warningLog = null;
    }

    _prepareRequestFilterRules(rules) {
        if (rules) return (0, _lodash.castArray)(rules);

        return [_testcafeHammerhead.RequestFilterRule.ANY];
    }

    _instantiateRequestFilterRules() {
        this._instantiatedRequestFilterRules = [];

        this.requestFilterRules.forEach(rule => {
            const instantiatedRule = rule instanceof _testcafeHammerhead.RequestFilterRule ? rule : new _testcafeHammerhead.RequestFilterRule(rule);

            this._instantiatedRequestFilterRules.push(instantiatedRule);
        });
    }

    onRequest() /*RequestEvent event*/{
        return (0, _asyncToGenerator3.default)(function* () {
            throw new Error('Not implemented');
        })();
    }

    _onConfigureResponse(event) {
        if (!this.responseEventConfigureOpts) return;

        event.opts.includeHeaders = this.responseEventConfigureOpts.includeHeaders;
        event.opts.includeBody = this.responseEventConfigureOpts.includeBody;
    }

    onResponse() /*ResponseEvent event*/{
        return (0, _asyncToGenerator3.default)(function* () {
            throw new Error('Not implemented');
        })();
    }
}
exports.default = RequestHook;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcGkvcmVxdWVzdC1ob29rcy9ob29rLmpzIl0sIm5hbWVzIjpbIlJlcXVlc3RIb29rIiwiY29uc3RydWN0b3IiLCJyZXF1ZXN0RmlsdGVyUnVsZXMiLCJyZXNwb25zZUV2ZW50Q29uZmlndXJlT3B0cyIsIl9wcmVwYXJlUmVxdWVzdEZpbHRlclJ1bGVzIiwiX2luc3RhbnRpYXRlZFJlcXVlc3RGaWx0ZXJSdWxlcyIsIndhcm5pbmdMb2ciLCJydWxlcyIsIkFOWSIsIl9pbnN0YW50aWF0ZVJlcXVlc3RGaWx0ZXJSdWxlcyIsImZvckVhY2giLCJydWxlIiwiaW5zdGFudGlhdGVkUnVsZSIsInB1c2giLCJvblJlcXVlc3QiLCJFcnJvciIsIl9vbkNvbmZpZ3VyZVJlc3BvbnNlIiwiZXZlbnQiLCJvcHRzIiwiaW5jbHVkZUhlYWRlcnMiLCJpbmNsdWRlQm9keSIsIm9uUmVzcG9uc2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUE7O0FBQ0E7Ozs7QUFFZSxNQUFNQSxXQUFOLENBQWtCO0FBQzdCQyxnQkFBYUMsa0JBQWIsRUFBaUNDLDBCQUFqQyxFQUE2RDtBQUN6RCxhQUFLRCxrQkFBTCxHQUF1QyxLQUFLRSwwQkFBTCxDQUFnQ0Ysa0JBQWhDLENBQXZDO0FBQ0EsYUFBS0csK0JBQUwsR0FBdUMsRUFBdkM7QUFDQSxhQUFLRiwwQkFBTCxHQUF1Q0EsMEJBQXZDOztBQUVBLGFBQUtHLFVBQUwsR0FBa0IsSUFBbEI7QUFDSDs7QUFFREYsK0JBQTRCRyxLQUE1QixFQUFtQztBQUMvQixZQUFJQSxLQUFKLEVBQ0ksT0FBTyx1QkFBVUEsS0FBVixDQUFQOztBQUVKLGVBQU8sQ0FBQyxzQ0FBa0JDLEdBQW5CLENBQVA7QUFDSDs7QUFFREMscUNBQWtDO0FBQzlCLGFBQUtKLCtCQUFMLEdBQXVDLEVBQXZDOztBQUVBLGFBQUtILGtCQUFMLENBQXdCUSxPQUF4QixDQUFnQ0MsUUFBUTtBQUNwQyxrQkFBTUMsbUJBQW1CRCx3REFBb0NBLElBQXBDLEdBQTJDLDBDQUFzQkEsSUFBdEIsQ0FBcEU7O0FBRUEsaUJBQUtOLCtCQUFMLENBQXFDUSxJQUFyQyxDQUEwQ0QsZ0JBQTFDO0FBQ0gsU0FKRDtBQUtIOztBQUVLRSxhQUFOLEdBQWlCLHNCQUF3QjtBQUFBO0FBQ3JDLGtCQUFNLElBQUlDLEtBQUosQ0FBVSxpQkFBVixDQUFOO0FBRHFDO0FBRXhDOztBQUVEQyx5QkFBc0JDLEtBQXRCLEVBQTZCO0FBQ3pCLFlBQUksQ0FBQyxLQUFLZCwwQkFBVixFQUNJOztBQUVKYyxjQUFNQyxJQUFOLENBQVdDLGNBQVgsR0FBNEIsS0FBS2hCLDBCQUFMLENBQWdDZ0IsY0FBNUQ7QUFDQUYsY0FBTUMsSUFBTixDQUFXRSxXQUFYLEdBQTRCLEtBQUtqQiwwQkFBTCxDQUFnQ2lCLFdBQTVEO0FBQ0g7O0FBRUtDLGNBQU4sR0FBa0IsdUJBQXlCO0FBQUE7QUFDdkMsa0JBQU0sSUFBSU4sS0FBSixDQUFVLGlCQUFWLENBQU47QUFEdUM7QUFFMUM7QUF4QzRCO2tCQUFaZixXIiwiZmlsZSI6ImFwaS9yZXF1ZXN0LWhvb2tzL2hvb2suanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBSZXF1ZXN0RmlsdGVyUnVsZSB9IGZyb20gJ3Rlc3RjYWZlLWhhbW1lcmhlYWQnO1xuaW1wb3J0IHsgY2FzdEFycmF5IH0gZnJvbSAnbG9kYXNoJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVxdWVzdEhvb2sge1xuICAgIGNvbnN0cnVjdG9yIChyZXF1ZXN0RmlsdGVyUnVsZXMsIHJlc3BvbnNlRXZlbnRDb25maWd1cmVPcHRzKSB7XG4gICAgICAgIHRoaXMucmVxdWVzdEZpbHRlclJ1bGVzICAgICAgICAgICAgICA9IHRoaXMuX3ByZXBhcmVSZXF1ZXN0RmlsdGVyUnVsZXMocmVxdWVzdEZpbHRlclJ1bGVzKTtcbiAgICAgICAgdGhpcy5faW5zdGFudGlhdGVkUmVxdWVzdEZpbHRlclJ1bGVzID0gW107XG4gICAgICAgIHRoaXMucmVzcG9uc2VFdmVudENvbmZpZ3VyZU9wdHMgICAgICA9IHJlc3BvbnNlRXZlbnRDb25maWd1cmVPcHRzO1xuXG4gICAgICAgIHRoaXMud2FybmluZ0xvZyA9IG51bGw7XG4gICAgfVxuXG4gICAgX3ByZXBhcmVSZXF1ZXN0RmlsdGVyUnVsZXMgKHJ1bGVzKSB7XG4gICAgICAgIGlmIChydWxlcylcbiAgICAgICAgICAgIHJldHVybiBjYXN0QXJyYXkocnVsZXMpO1xuXG4gICAgICAgIHJldHVybiBbUmVxdWVzdEZpbHRlclJ1bGUuQU5ZXTtcbiAgICB9XG5cbiAgICBfaW5zdGFudGlhdGVSZXF1ZXN0RmlsdGVyUnVsZXMgKCkge1xuICAgICAgICB0aGlzLl9pbnN0YW50aWF0ZWRSZXF1ZXN0RmlsdGVyUnVsZXMgPSBbXTtcblxuICAgICAgICB0aGlzLnJlcXVlc3RGaWx0ZXJSdWxlcy5mb3JFYWNoKHJ1bGUgPT4ge1xuICAgICAgICAgICAgY29uc3QgaW5zdGFudGlhdGVkUnVsZSA9IHJ1bGUgaW5zdGFuY2VvZiBSZXF1ZXN0RmlsdGVyUnVsZSA/IHJ1bGUgOiBuZXcgUmVxdWVzdEZpbHRlclJ1bGUocnVsZSk7XG5cbiAgICAgICAgICAgIHRoaXMuX2luc3RhbnRpYXRlZFJlcXVlc3RGaWx0ZXJSdWxlcy5wdXNoKGluc3RhbnRpYXRlZFJ1bGUpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhc3luYyBvblJlcXVlc3QgKC8qUmVxdWVzdEV2ZW50IGV2ZW50Ki8pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQnKTtcbiAgICB9XG5cbiAgICBfb25Db25maWd1cmVSZXNwb25zZSAoZXZlbnQpIHtcbiAgICAgICAgaWYgKCF0aGlzLnJlc3BvbnNlRXZlbnRDb25maWd1cmVPcHRzKVxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIGV2ZW50Lm9wdHMuaW5jbHVkZUhlYWRlcnMgPSB0aGlzLnJlc3BvbnNlRXZlbnRDb25maWd1cmVPcHRzLmluY2x1ZGVIZWFkZXJzO1xuICAgICAgICBldmVudC5vcHRzLmluY2x1ZGVCb2R5ICAgID0gdGhpcy5yZXNwb25zZUV2ZW50Q29uZmlndXJlT3B0cy5pbmNsdWRlQm9keTtcbiAgICB9XG5cbiAgICBhc3luYyBvblJlc3BvbnNlICgvKlJlc3BvbnNlRXZlbnQgZXZlbnQqLykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCcpO1xuICAgIH1cbn1cbiJdfQ==
