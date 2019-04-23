'use strict';

exports.__esModule = true;

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _testPageUrl = require('../test-page-url');

var _handleTagArgs = require('../../utils/handle-tag-args');

var _handleTagArgs2 = _interopRequireDefault(_handleTagArgs);

var _delegatedApi = require('../../utils/delegated-api');

var _typeAssertions = require('../../errors/runtime/type-assertions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class TestingUnit {
    constructor(testFile, unitTypeName) {
        this.testFile = testFile;
        this.unitTypeName = unitTypeName;

        this.name = null;
        this.pageUrl = null;
        this.authCredentials = null;
        this.meta = {};
        this.only = false;
        this.skip = false;

        this.disablePageReloads = void 0;

        const unit = this;

        this.apiOrigin = function apiOrigin(...args) {
            return unit._add(...args);
        };

        (0, _delegatedApi.delegateAPI)(this.apiOrigin, this.constructor.API_LIST, { handler: this });
    }

    _add() {
        throw new Error('Not implemented');
    }

    _only$getter() {
        this.only = true;

        return this.apiOrigin;
    }

    _skip$getter() {
        this.skip = true;

        return this.apiOrigin;
    }

    _disablePageReloads$getter() {
        this.disablePageReloads = true;

        return this.apiOrigin;
    }

    _enablePageReloads$getter() {
        this.disablePageReloads = false;

        return this.apiOrigin;
    }

    _page$(url, ...rest) {
        this.pageUrl = (0, _handleTagArgs2.default)(url, rest);

        (0, _typeAssertions.assertType)(_typeAssertions.is.string, 'page', 'The page URL', this.pageUrl);

        (0, _testPageUrl.assertUrl)(this.pageUrl, 'page');

        this.pageUrl = (0, _testPageUrl.resolvePageUrl)(this.pageUrl, this.testFile.filename);

        return this.apiOrigin;
    }

    _httpAuth$(credentials) {
        (0, _typeAssertions.assertType)(_typeAssertions.is.nonNullObject, 'httpAuth', 'credentials', credentials);
        (0, _typeAssertions.assertType)(_typeAssertions.is.string, 'httpAuth', 'credentials.username', credentials.username);
        (0, _typeAssertions.assertType)(_typeAssertions.is.string, 'httpAuth', 'credentials.password', credentials.password);

        if (credentials.domain) (0, _typeAssertions.assertType)(_typeAssertions.is.string, 'httpAuth', 'credentials.domain', credentials.domain);
        if (credentials.workstation) (0, _typeAssertions.assertType)(_typeAssertions.is.string, 'httpAuth', 'credentials.workstation', credentials.workstation);

        this.authCredentials = credentials;

        return this.apiOrigin;
    }

    _meta$(...args) {
        (0, _typeAssertions.assertType)([_typeAssertions.is.string, _typeAssertions.is.nonNullObject], 'meta', `${this.unitTypeName}.meta`, args[0]);

        const data = typeof args[0] === 'string' ? { [args[0]]: args[1] } : args[0];

        (0, _keys2.default)(data).forEach(key => {
            this.meta[key] = data[key];
        });

        return this.apiOrigin;
    }

    static _makeAPIListForChildClass(ChildClass) {
        ChildClass.API_LIST = TestingUnit.API_LIST.concat((0, _delegatedApi.getDelegatedAPIList)(ChildClass.prototype));
    }
}

exports.default = TestingUnit;
TestingUnit.API_LIST = (0, _delegatedApi.getDelegatedAPIList)(TestingUnit.prototype);
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcGkvc3RydWN0dXJlL3Rlc3RpbmctdW5pdC5qcyJdLCJuYW1lcyI6WyJUZXN0aW5nVW5pdCIsImNvbnN0cnVjdG9yIiwidGVzdEZpbGUiLCJ1bml0VHlwZU5hbWUiLCJuYW1lIiwicGFnZVVybCIsImF1dGhDcmVkZW50aWFscyIsIm1ldGEiLCJvbmx5Iiwic2tpcCIsImRpc2FibGVQYWdlUmVsb2FkcyIsInVuaXQiLCJhcGlPcmlnaW4iLCJhcmdzIiwiX2FkZCIsIkFQSV9MSVNUIiwiaGFuZGxlciIsIkVycm9yIiwiX29ubHkkZ2V0dGVyIiwiX3NraXAkZ2V0dGVyIiwiX2Rpc2FibGVQYWdlUmVsb2FkcyRnZXR0ZXIiLCJfZW5hYmxlUGFnZVJlbG9hZHMkZ2V0dGVyIiwiX3BhZ2UkIiwidXJsIiwicmVzdCIsInN0cmluZyIsImZpbGVuYW1lIiwiX2h0dHBBdXRoJCIsImNyZWRlbnRpYWxzIiwibm9uTnVsbE9iamVjdCIsInVzZXJuYW1lIiwicGFzc3dvcmQiLCJkb21haW4iLCJ3b3Jrc3RhdGlvbiIsIl9tZXRhJCIsImRhdGEiLCJmb3JFYWNoIiwia2V5IiwiX21ha2VBUElMaXN0Rm9yQ2hpbGRDbGFzcyIsIkNoaWxkQ2xhc3MiLCJjb25jYXQiLCJwcm90b3R5cGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUE7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7OztBQUdlLE1BQU1BLFdBQU4sQ0FBa0I7QUFDN0JDLGdCQUFhQyxRQUFiLEVBQXVCQyxZQUF2QixFQUFxQztBQUNqQyxhQUFLRCxRQUFMLEdBQW9CQSxRQUFwQjtBQUNBLGFBQUtDLFlBQUwsR0FBb0JBLFlBQXBCOztBQUVBLGFBQUtDLElBQUwsR0FBdUIsSUFBdkI7QUFDQSxhQUFLQyxPQUFMLEdBQXVCLElBQXZCO0FBQ0EsYUFBS0MsZUFBTCxHQUF1QixJQUF2QjtBQUNBLGFBQUtDLElBQUwsR0FBdUIsRUFBdkI7QUFDQSxhQUFLQyxJQUFMLEdBQXVCLEtBQXZCO0FBQ0EsYUFB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LENBQWtDQyxVQUFsQyxFQUE4QztBQUMxQ0EsbUJBQVd4QixRQUFYLEdBQXNCZixZQUFZZSxRQUFaLENBQXFCeUIsTUFBckIsQ0FBNEIsdUNBQW9CRCxXQUFXRSxTQUEvQixDQUE1QixDQUF0QjtBQUNIO0FBNUY0Qjs7a0JBQVp6QyxXO0FBK0ZyQkEsWUFBWWUsUUFBWixHQUF1Qix1Q0FBb0JmLFlBQVl5QyxTQUFoQyxDQUF2QiIsImZpbGUiOiJhcGkvc3RydWN0dXJlL3Rlc3RpbmctdW5pdC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGFzc2VydFVybCwgcmVzb2x2ZVBhZ2VVcmwgfSBmcm9tICcuLi90ZXN0LXBhZ2UtdXJsJztcbmltcG9ydCBoYW5kbGVUYWdBcmdzIGZyb20gJy4uLy4uL3V0aWxzL2hhbmRsZS10YWctYXJncyc7XG5pbXBvcnQgeyBkZWxlZ2F0ZUFQSSwgZ2V0RGVsZWdhdGVkQVBJTGlzdCB9IGZyb20gJy4uLy4uL3V0aWxzL2RlbGVnYXRlZC1hcGknO1xuaW1wb3J0IHsgYXNzZXJ0VHlwZSwgaXMgfSBmcm9tICcuLi8uLi9lcnJvcnMvcnVudGltZS90eXBlLWFzc2VydGlvbnMnO1xuXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRlc3RpbmdVbml0IHtcbiAgICBjb25zdHJ1Y3RvciAodGVzdEZpbGUsIHVuaXRUeXBlTmFtZSkge1xuICAgICAgICB0aGlzLnRlc3RGaWxlICAgICA9IHRlc3RGaWxlO1xuICAgICAgICB0aGlzLnVuaXRUeXBlTmFtZSA9IHVuaXRUeXBlTmFtZTtcblxuICAgICAgICB0aGlzLm5hbWUgICAgICAgICAgICA9IG51bGw7XG4gICAgICAgIHRoaXMucGFnZVVybCAgICAgICAgID0gbnVsbDtcbiAgICAgICAgdGhpcy5hdXRoQ3JlZGVudGlhbHMgPSBudWxsO1xuICAgICAgICB0aGlzLm1ldGEgICAgICAgICAgICA9IHt9O1xuICAgICAgICB0aGlzLm9ubHkgICAgICAgICAgICA9IGZhbHNlO1xuICAgICAgICB0aGlzLnNraXAgICAgICAgICAgICA9IGZhbHNlO1xuXG4gICAgICAgIHRoaXMuZGlzYWJsZVBhZ2VSZWxvYWRzID0gdm9pZCAwO1xuXG4gICAgICAgIGNvbnN0IHVuaXQgPSB0aGlzO1xuXG4gICAgICAgIHRoaXMuYXBpT3JpZ2luID0gZnVuY3Rpb24gYXBpT3JpZ2luICguLi5hcmdzKSB7XG4gICAgICAgICAgICByZXR1cm4gdW5pdC5fYWRkKC4uLmFyZ3MpO1xuICAgICAgICB9O1xuXG4gICAgICAgIGRlbGVnYXRlQVBJKHRoaXMuYXBpT3JpZ2luLCB0aGlzLmNvbnN0cnVjdG9yLkFQSV9MSVNULCB7IGhhbmRsZXI6IHRoaXMgfSk7XG4gICAgfVxuXG4gICAgX2FkZCAoKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkJyk7XG4gICAgfVxuXG4gICAgX29ubHkkZ2V0dGVyICgpIHtcbiAgICAgICAgdGhpcy5vbmx5ID0gdHJ1ZTtcblxuICAgICAgICByZXR1cm4gdGhpcy5hcGlPcmlnaW47XG4gICAgfVxuXG4gICAgX3NraXAkZ2V0dGVyICgpIHtcbiAgICAgICAgdGhpcy5za2lwID0gdHJ1ZTtcblxuICAgICAgICByZXR1cm4gdGhpcy5hcGlPcmlnaW47XG4gICAgfVxuXG4gICAgX2Rpc2FibGVQYWdlUmVsb2FkcyRnZXR0ZXIgKCkge1xuICAgICAgICB0aGlzLmRpc2FibGVQYWdlUmVsb2FkcyA9IHRydWU7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuYXBpT3JpZ2luO1xuICAgIH1cblxuICAgIF9lbmFibGVQYWdlUmVsb2FkcyRnZXR0ZXIgKCkge1xuICAgICAgICB0aGlzLmRpc2FibGVQYWdlUmVsb2FkcyA9IGZhbHNlO1xuXG4gICAgICAgIHJldHVybiB0aGlzLmFwaU9yaWdpbjtcbiAgICB9XG5cbiAgICBfcGFnZSQgKHVybCwgLi4ucmVzdCkge1xuICAgICAgICB0aGlzLnBhZ2VVcmwgPSBoYW5kbGVUYWdBcmdzKHVybCwgcmVzdCk7XG5cbiAgICAgICAgYXNzZXJ0VHlwZShpcy5zdHJpbmcsICdwYWdlJywgJ1RoZSBwYWdlIFVSTCcsIHRoaXMucGFnZVVybCk7XG5cbiAgICAgICAgYXNzZXJ0VXJsKHRoaXMucGFnZVVybCwgJ3BhZ2UnKTtcblxuICAgICAgICB0aGlzLnBhZ2VVcmwgPSByZXNvbHZlUGFnZVVybCh0aGlzLnBhZ2VVcmwsIHRoaXMudGVzdEZpbGUuZmlsZW5hbWUpO1xuXG4gICAgICAgIHJldHVybiB0aGlzLmFwaU9yaWdpbjtcbiAgICB9XG5cbiAgICBfaHR0cEF1dGgkIChjcmVkZW50aWFscykge1xuICAgICAgICBhc3NlcnRUeXBlKGlzLm5vbk51bGxPYmplY3QsICdodHRwQXV0aCcsICdjcmVkZW50aWFscycsIGNyZWRlbnRpYWxzKTtcbiAgICAgICAgYXNzZXJ0VHlwZShpcy5zdHJpbmcsICdodHRwQXV0aCcsICdjcmVkZW50aWFscy51c2VybmFtZScsIGNyZWRlbnRpYWxzLnVzZXJuYW1lKTtcbiAgICAgICAgYXNzZXJ0VHlwZShpcy5zdHJpbmcsICdodHRwQXV0aCcsICdjcmVkZW50aWFscy5wYXNzd29yZCcsIGNyZWRlbnRpYWxzLnBhc3N3b3JkKTtcblxuICAgICAgICBpZiAoY3JlZGVudGlhbHMuZG9tYWluKVxuICAgICAgICAgICAgYXNzZXJ0VHlwZShpcy5zdHJpbmcsICdodHRwQXV0aCcsICdjcmVkZW50aWFscy5kb21haW4nLCBjcmVkZW50aWFscy5kb21haW4pO1xuICAgICAgICBpZiAoY3JlZGVudGlhbHMud29ya3N0YXRpb24pXG4gICAgICAgICAgICBhc3NlcnRUeXBlKGlzLnN0cmluZywgJ2h0dHBBdXRoJywgJ2NyZWRlbnRpYWxzLndvcmtzdGF0aW9uJywgY3JlZGVudGlhbHMud29ya3N0YXRpb24pO1xuXG4gICAgICAgIHRoaXMuYXV0aENyZWRlbnRpYWxzID0gY3JlZGVudGlhbHM7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuYXBpT3JpZ2luO1xuICAgIH1cblxuICAgIF9tZXRhJCAoLi4uYXJncykge1xuICAgICAgICBhc3NlcnRUeXBlKFtpcy5zdHJpbmcsIGlzLm5vbk51bGxPYmplY3RdLCAnbWV0YScsIGAke3RoaXMudW5pdFR5cGVOYW1lfS5tZXRhYCwgYXJnc1swXSk7XG5cbiAgICAgICAgY29uc3QgZGF0YSA9IHR5cGVvZiBhcmdzWzBdID09PSAnc3RyaW5nJyA/IHsgW2FyZ3NbMF1dOiBhcmdzWzFdIH0gOiBhcmdzWzBdO1xuXG4gICAgICAgIE9iamVjdC5rZXlzKGRhdGEpLmZvckVhY2goa2V5ID0+IHtcbiAgICAgICAgICAgIHRoaXMubWV0YVtrZXldID0gZGF0YVtrZXldO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gdGhpcy5hcGlPcmlnaW47XG4gICAgfVxuXG4gICAgc3RhdGljIF9tYWtlQVBJTGlzdEZvckNoaWxkQ2xhc3MgKENoaWxkQ2xhc3MpIHtcbiAgICAgICAgQ2hpbGRDbGFzcy5BUElfTElTVCA9IFRlc3RpbmdVbml0LkFQSV9MSVNULmNvbmNhdChnZXREZWxlZ2F0ZWRBUElMaXN0KENoaWxkQ2xhc3MucHJvdG90eXBlKSk7XG4gICAgfVxufVxuXG5UZXN0aW5nVW5pdC5BUElfTElTVCA9IGdldERlbGVnYXRlZEFQSUxpc3QoVGVzdGluZ1VuaXQucHJvdG90eXBlKTtcblxuXG4iXX0=
