'use strict';

exports.__esModule = true;

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _assignable = require('../utils/assignable');

var _assignable2 = _interopRequireDefault(_assignable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class BrowserConsoleMessages extends _assignable2.default {
    constructor(obj) {
        super();

        this.log = [];
        this.info = [];
        this.warn = [];
        this.error = [];

        this._assignFrom(obj);
    }

    _getAssignableProperties() {
        return [{ name: 'log' }, { name: 'info' }, { name: 'warn' }, { name: 'error' }];
    }

    concat(consoleMessages) {
        this.log = this.log.concat(consoleMessages.log);
        this.info = this.info.concat(consoleMessages.info);
        this.warn = this.warn.concat(consoleMessages.warn);
        this.error = this.error.concat(consoleMessages.error);
    }

    addMessage(type, msg) {
        this[type].push(msg);
    }

    getCopy() {
        const copy = {};
        const properties = this._getAssignableProperties();

        for (var _iterator = properties, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : (0, _getIterator3.default)(_iterator);;) {
            var _ref;

            if (_isArray) {
                if (_i >= _iterator.length) break;
                _ref = _iterator[_i++];
            } else {
                _i = _iterator.next();
                if (_i.done) break;
                _ref = _i.value;
            }

            const property = _ref;

            copy[property.name] = this[property.name].slice();
        }return copy;
    }
}
exports.default = BrowserConsoleMessages; // -------------------------------------------------------------
// WARNING: this file is used by both the client and the server.
// Do not use any browser or node-specific API!
// -------------------------------------------------------------

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90ZXN0LXJ1bi9icm93c2VyLWNvbnNvbGUtbWVzc2FnZXMuanMiXSwibmFtZXMiOlsiQnJvd3NlckNvbnNvbGVNZXNzYWdlcyIsImNvbnN0cnVjdG9yIiwib2JqIiwibG9nIiwiaW5mbyIsIndhcm4iLCJlcnJvciIsIl9hc3NpZ25Gcm9tIiwiX2dldEFzc2lnbmFibGVQcm9wZXJ0aWVzIiwibmFtZSIsImNvbmNhdCIsImNvbnNvbGVNZXNzYWdlcyIsImFkZE1lc3NhZ2UiLCJ0eXBlIiwibXNnIiwicHVzaCIsImdldENvcHkiLCJjb3B5IiwicHJvcGVydGllcyIsInByb3BlcnR5Iiwic2xpY2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBSUE7Ozs7OztBQUdlLE1BQU1BLHNCQUFOLDhCQUFnRDtBQUMzREMsZ0JBQWFDLEdBQWIsRUFBa0I7QUFDZDs7QUFFQSxhQUFLQyxHQUFMLEdBQWEsRUFBYjtBQUNBLGFBQUtDLElBQUwsR0FBYSxFQUFiO0FBQ0EsYUFBS0MsSUFBTCxHQUFhLEVBQWI7QUFDQSxhQUFLQyxLQUFMLEdBQWEsRUFBYjs7QUFFQSxhQUFLQyxXQUFMLENBQWlCTCxHQUFqQjtBQUNIOztBQUVETSwrQkFBNEI7QUFDeEIsZUFBTyxDQUNILEVBQUVDLE1BQU0sS0FBUixFQURHLEVBRUgsRUFBRUEsTUFBTSxNQUFSLEVBRkcsRUFHSCxFQUFFQSxNQUFNLE1BQVIsRUFIRyxFQUlILEVBQUVBLE1BQU0sT0FBUixFQUpHLENBQVA7QUFNSDs7QUFFREMsV0FBUUMsZUFBUixFQUF5QjtBQUNyQixhQUFLUixHQUFMLEdBQWEsS0FBS0EsR0FBTCxDQUFTTyxNQUFULENBQWdCQyxnQkFBZ0JSLEdBQWhDLENBQWI7QUFDQSxhQUFLQyxJQUFMLEdBQWEsS0FBS0EsSUFBTCxDQUFVTSxNQUFWLENBQWlCQyxnQkFBZ0JQLElBQWpDLENBQWI7QUFDQSxhQUFLQyxJQUFMLEdBQWEsS0FBS0EsSUFBTCxDQUFVSyxNQUFWLENBQWlCQyxnQkFBZ0JOLElBQWpDLENBQWI7QUFDQSxhQUFLQyxLQUFMLEdBQWEsS0FBS0EsS0FBTCxDQUFXSSxNQUFYLENBQWtCQyxnQkFBZ0JMLEtBQWxDLENBQWI7QUFDSDs7QUFFRE0sZUFBWUMsSUFBWixFQUFrQkMsR0FBbEIsRUFBdUI7QUFDbkIsYUFBS0QsSUFBTCxFQUFXRSxJQUFYLENBQWdCRCxHQUFoQjtBQUNIOztBQUVERSxjQUFXO0FBQ1AsY0FBTUMsT0FBTyxFQUFiO0FBQ0EsY0FBTUMsYUFBYSxLQUFLVix3QkFBTCxFQUFuQjs7QUFFQSw2QkFBdUJVLFVBQXZCO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFBQSxrQkFBV0MsUUFBWDs7QUFDSUYsaUJBQUtFLFNBQVNWLElBQWQsSUFBc0IsS0FBS1UsU0FBU1YsSUFBZCxFQUFvQlcsS0FBcEIsRUFBdEI7QUFESixTQUdBLE9BQU9ILElBQVA7QUFDSDtBQXhDMEQ7a0JBQTFDakIsc0IsRUFQckI7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoidGVzdC1ydW4vYnJvd3Nlci1jb25zb2xlLW1lc3NhZ2VzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gV0FSTklORzogdGhpcyBmaWxlIGlzIHVzZWQgYnkgYm90aCB0aGUgY2xpZW50IGFuZCB0aGUgc2VydmVyLlxuLy8gRG8gbm90IHVzZSBhbnkgYnJvd3NlciBvciBub2RlLXNwZWNpZmljIEFQSSFcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmltcG9ydCBBc3NpZ25hYmxlIGZyb20gJy4uL3V0aWxzL2Fzc2lnbmFibGUnO1xuXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJyb3dzZXJDb25zb2xlTWVzc2FnZXMgZXh0ZW5kcyBBc3NpZ25hYmxlIHtcbiAgICBjb25zdHJ1Y3RvciAob2JqKSB7XG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgdGhpcy5sb2cgICA9IFtdO1xuICAgICAgICB0aGlzLmluZm8gID0gW107XG4gICAgICAgIHRoaXMud2FybiAgPSBbXTtcbiAgICAgICAgdGhpcy5lcnJvciA9IFtdO1xuXG4gICAgICAgIHRoaXMuX2Fzc2lnbkZyb20ob2JqKTtcbiAgICB9XG5cbiAgICBfZ2V0QXNzaWduYWJsZVByb3BlcnRpZXMgKCkge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgeyBuYW1lOiAnbG9nJyB9LFxuICAgICAgICAgICAgeyBuYW1lOiAnaW5mbycgfSxcbiAgICAgICAgICAgIHsgbmFtZTogJ3dhcm4nIH0sXG4gICAgICAgICAgICB7IG5hbWU6ICdlcnJvcicgfVxuICAgICAgICBdO1xuICAgIH1cblxuICAgIGNvbmNhdCAoY29uc29sZU1lc3NhZ2VzKSB7XG4gICAgICAgIHRoaXMubG9nICAgPSB0aGlzLmxvZy5jb25jYXQoY29uc29sZU1lc3NhZ2VzLmxvZyk7XG4gICAgICAgIHRoaXMuaW5mbyAgPSB0aGlzLmluZm8uY29uY2F0KGNvbnNvbGVNZXNzYWdlcy5pbmZvKTtcbiAgICAgICAgdGhpcy53YXJuICA9IHRoaXMud2Fybi5jb25jYXQoY29uc29sZU1lc3NhZ2VzLndhcm4pO1xuICAgICAgICB0aGlzLmVycm9yID0gdGhpcy5lcnJvci5jb25jYXQoY29uc29sZU1lc3NhZ2VzLmVycm9yKTtcbiAgICB9XG5cbiAgICBhZGRNZXNzYWdlICh0eXBlLCBtc2cpIHtcbiAgICAgICAgdGhpc1t0eXBlXS5wdXNoKG1zZyk7XG4gICAgfVxuXG4gICAgZ2V0Q29weSAoKSB7XG4gICAgICAgIGNvbnN0IGNvcHkgPSB7fTtcbiAgICAgICAgY29uc3QgcHJvcGVydGllcyA9IHRoaXMuX2dldEFzc2lnbmFibGVQcm9wZXJ0aWVzKCk7XG5cbiAgICAgICAgZm9yIChjb25zdCBwcm9wZXJ0eSBvZiBwcm9wZXJ0aWVzKVxuICAgICAgICAgICAgY29weVtwcm9wZXJ0eS5uYW1lXSA9IHRoaXNbcHJvcGVydHkubmFtZV0uc2xpY2UoKTtcblxuICAgICAgICByZXR1cm4gY29weTtcbiAgICB9XG59XG4iXX0=
