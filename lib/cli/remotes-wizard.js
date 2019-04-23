'use strict';

exports.__esModule = true;

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _pinkie = require('pinkie');

var _pinkie2 = _interopRequireDefault(_pinkie);

var _qrcodeTerminal = require('qrcode-terminal');

var _qrcodeTerminal2 = _interopRequireDefault(_qrcodeTerminal);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _log = require('./log');

var _log2 = _interopRequireDefault(_log);

var _promisifyEvent = require('promisify-event');

var _promisifyEvent2 = _interopRequireDefault(_promisifyEvent);

var _dedent = require('dedent');

var _dedent2 = _interopRequireDefault(_dedent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (() => {
    var _ref = (0, _asyncToGenerator3.default)(function* (testCafe, remoteCount, showQRCode) {
        const connectionPromises = [];

        if (remoteCount) {
            _log2.default.hideSpinner();

            const description = (0, _dedent2.default)(`
            Connecting ${remoteCount} remote browser(s)...
            Navigate to the following URL from each remote browser.
        `);

            _log2.default.write(description);

            if (showQRCode) _log2.default.write('You can either enter the URL or scan the QR-code.');

            const connectionUrl = testCafe.browserConnectionGateway.connectUrl;

            _log2.default.write(`Connect URL: ${_chalk2.default.underline.blue(connectionUrl)}`);

            if (showQRCode) _qrcodeTerminal2.default.generate(connectionUrl);

            for (let i = 0; i < remoteCount; i++) {
                connectionPromises.push(testCafe.createBrowserConnection().then(function (bc) {
                    return (0, _promisifyEvent2.default)(bc, 'ready').then(function () {
                        return bc;
                    });
                }).then(function (bc) {
                    _log2.default.write(`${_chalk2.default.green('CONNECTED')} ${bc.userAgent}`);
                    return bc;
                }));
            }

            _log2.default.showSpinner();
        }

        return yield _pinkie2.default.all(connectionPromises);
    });

    return function (_x, _x2, _x3) {
        return _ref.apply(this, arguments);
    };
})();

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jbGkvcmVtb3Rlcy13aXphcmQuanMiXSwibmFtZXMiOlsidGVzdENhZmUiLCJyZW1vdGVDb3VudCIsInNob3dRUkNvZGUiLCJjb25uZWN0aW9uUHJvbWlzZXMiLCJoaWRlU3Bpbm5lciIsImRlc2NyaXB0aW9uIiwid3JpdGUiLCJjb25uZWN0aW9uVXJsIiwiYnJvd3NlckNvbm5lY3Rpb25HYXRld2F5IiwiY29ubmVjdFVybCIsInVuZGVybGluZSIsImJsdWUiLCJnZW5lcmF0ZSIsImkiLCJwdXNoIiwiY3JlYXRlQnJvd3NlckNvbm5lY3Rpb24iLCJ0aGVuIiwiYmMiLCJncmVlbiIsInVzZXJBZ2VudCIsInNob3dTcGlubmVyIiwiYWxsIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7OzsrQ0FHZSxXQUFnQkEsUUFBaEIsRUFBMEJDLFdBQTFCLEVBQXVDQyxVQUF2QyxFQUFtRDtBQUM5RCxjQUFNQyxxQkFBcUIsRUFBM0I7O0FBRUEsWUFBSUYsV0FBSixFQUFpQjtBQUNiLDBCQUFJRyxXQUFKOztBQUVBLGtCQUFNQyxjQUFjLHNCQUFRO3lCQUNYSixXQUFZOztTQURULENBQXBCOztBQUtBLDBCQUFJSyxLQUFKLENBQVVELFdBQVY7O0FBRUEsZ0JBQUlILFVBQUosRUFDSSxjQUFJSSxLQUFKLENBQVUsbURBQVY7O0FBRUosa0JBQU1DLGdCQUFnQlAsU0FBU1Esd0JBQVQsQ0FBa0NDLFVBQXhEOztBQUVBLDBCQUFJSCxLQUFKLENBQVcsZ0JBQWUsZ0JBQU1JLFNBQU4sQ0FBZ0JDLElBQWhCLENBQXFCSixhQUFyQixDQUFvQyxFQUE5RDs7QUFFQSxnQkFBSUwsVUFBSixFQUNJLHlCQUFPVSxRQUFQLENBQWdCTCxhQUFoQjs7QUFFSixpQkFBSyxJQUFJTSxJQUFJLENBQWIsRUFBZ0JBLElBQUlaLFdBQXBCLEVBQWlDWSxHQUFqQyxFQUFzQztBQUNsQ1YsbUNBQW1CVyxJQUFuQixDQUF3QmQsU0FDbkJlLHVCQURtQixHQUVuQkMsSUFGbUIsQ0FFZDtBQUFBLDJCQUFNLDhCQUFlQyxFQUFmLEVBQW1CLE9BQW5CLEVBQTRCRCxJQUE1QixDQUFpQztBQUFBLCtCQUFNQyxFQUFOO0FBQUEscUJBQWpDLENBQU47QUFBQSxpQkFGYyxFQUduQkQsSUFIbUIsQ0FHZCxjQUFNO0FBQ1Isa0NBQUlWLEtBQUosQ0FBVyxHQUFFLGdCQUFNWSxLQUFOLENBQVksV0FBWixDQUF5QixJQUFHRCxHQUFHRSxTQUFVLEVBQXREO0FBQ0EsMkJBQU9GLEVBQVA7QUFDSCxpQkFObUIsQ0FBeEI7QUFRSDs7QUFFRCwwQkFBSUcsV0FBSjtBQUNIOztBQUVELGVBQU8sTUFBTSxpQkFBUUMsR0FBUixDQUFZbEIsa0JBQVosQ0FBYjtBQUNILEsiLCJmaWxlIjoiY2xpL3JlbW90ZXMtd2l6YXJkLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFByb21pc2UgZnJvbSAncGlua2llJztcbmltcG9ydCBxcmNvZGUgZnJvbSAncXJjb2RlLXRlcm1pbmFsJztcbmltcG9ydCBjaGFsayBmcm9tICdjaGFsayc7XG5pbXBvcnQgbG9nIGZyb20gJy4vbG9nJztcbmltcG9ydCBwcm9taXNpZnlFdmVudCBmcm9tICdwcm9taXNpZnktZXZlbnQnO1xuaW1wb3J0IGRlZGVudCBmcm9tICdkZWRlbnQnO1xuXG5cbmV4cG9ydCBkZWZhdWx0IGFzeW5jIGZ1bmN0aW9uICh0ZXN0Q2FmZSwgcmVtb3RlQ291bnQsIHNob3dRUkNvZGUpIHtcbiAgICBjb25zdCBjb25uZWN0aW9uUHJvbWlzZXMgPSBbXTtcblxuICAgIGlmIChyZW1vdGVDb3VudCkge1xuICAgICAgICBsb2cuaGlkZVNwaW5uZXIoKTtcblxuICAgICAgICBjb25zdCBkZXNjcmlwdGlvbiA9IGRlZGVudChgXG4gICAgICAgICAgICBDb25uZWN0aW5nICR7cmVtb3RlQ291bnR9IHJlbW90ZSBicm93c2VyKHMpLi4uXG4gICAgICAgICAgICBOYXZpZ2F0ZSB0byB0aGUgZm9sbG93aW5nIFVSTCBmcm9tIGVhY2ggcmVtb3RlIGJyb3dzZXIuXG4gICAgICAgIGApO1xuXG4gICAgICAgIGxvZy53cml0ZShkZXNjcmlwdGlvbik7XG5cbiAgICAgICAgaWYgKHNob3dRUkNvZGUpXG4gICAgICAgICAgICBsb2cud3JpdGUoJ1lvdSBjYW4gZWl0aGVyIGVudGVyIHRoZSBVUkwgb3Igc2NhbiB0aGUgUVItY29kZS4nKTtcblxuICAgICAgICBjb25zdCBjb25uZWN0aW9uVXJsID0gdGVzdENhZmUuYnJvd3NlckNvbm5lY3Rpb25HYXRld2F5LmNvbm5lY3RVcmw7XG5cbiAgICAgICAgbG9nLndyaXRlKGBDb25uZWN0IFVSTDogJHtjaGFsay51bmRlcmxpbmUuYmx1ZShjb25uZWN0aW9uVXJsKX1gKTtcblxuICAgICAgICBpZiAoc2hvd1FSQ29kZSlcbiAgICAgICAgICAgIHFyY29kZS5nZW5lcmF0ZShjb25uZWN0aW9uVXJsKTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJlbW90ZUNvdW50OyBpKyspIHtcbiAgICAgICAgICAgIGNvbm5lY3Rpb25Qcm9taXNlcy5wdXNoKHRlc3RDYWZlXG4gICAgICAgICAgICAgICAgLmNyZWF0ZUJyb3dzZXJDb25uZWN0aW9uKClcbiAgICAgICAgICAgICAgICAudGhlbihiYyA9PiBwcm9taXNpZnlFdmVudChiYywgJ3JlYWR5JykudGhlbigoKSA9PiBiYykpXG4gICAgICAgICAgICAgICAgLnRoZW4oYmMgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsb2cud3JpdGUoYCR7Y2hhbGsuZ3JlZW4oJ0NPTk5FQ1RFRCcpfSAke2JjLnVzZXJBZ2VudH1gKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGJjO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgbG9nLnNob3dTcGlubmVyKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGF3YWl0IFByb21pc2UuYWxsKGNvbm5lY3Rpb25Qcm9taXNlcyk7XG59XG4iXX0=
