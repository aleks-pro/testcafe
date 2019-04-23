'use strict';

exports.__esModule = true;

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _events = require('events');

var _delay = require('../utils/delay');

var _delay2 = _interopRequireDefault(_delay);

var _thennable = require('../utils/thennable');

var _testRun = require('../errors/test-run');

var _reExecutablePromise = require('../utils/re-executable-promise');

var _reExecutablePromise2 = _interopRequireDefault(_reExecutablePromise);

var _getFn = require('./get-fn');

var _getFn2 = _interopRequireDefault(_getFn);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const ASSERTION_DELAY = 200;

class AssertionExecutor extends _events.EventEmitter {
    constructor(command, timeout, callsite) {
        super();

        this.command = command;
        this.timeout = timeout;
        this.callsite = callsite;

        this.startTime = null;
        this.passed = false;
        this.inRetry = false;

        const fn = (0, _getFn2.default)(this.command);
        const actualCommand = this.command.actual;

        if (actualCommand instanceof _reExecutablePromise2.default) this.fn = this._wrapFunction(fn);else if (!this.command.options.allowUnawaitedPromise && (0, _thennable.isThennable)(actualCommand)) throw new _testRun.AssertionUnawaitedPromiseError(this.callsite);else this.fn = fn;
    }

    _getTimeLeft() {
        return this.timeout - (new Date() - this.startTime);
    }

    _onExecutionFinished() {
        if (this.inRetry) this.emit('end-assertion-retries', this.passed);
    }

    _wrapFunction(fn) {
        var _this = this;

        return (0, _asyncToGenerator3.default)(function* () {
            const resultPromise = _this.command.actual;

            while (!_this.passed) {
                _this.command.actual = yield resultPromise._reExecute();

                try {
                    fn();
                    _this.passed = true;
                    _this._onExecutionFinished();
                } catch (err) {
                    if (_this._getTimeLeft() <= 0) {
                        _this._onExecutionFinished();
                        throw err;
                    }

                    yield (0, _delay2.default)(ASSERTION_DELAY);

                    _this.inRetry = true;
                    _this.emit('start-assertion-retries', _this._getTimeLeft());
                }
            }
        });
    }

    run() {
        var _this2 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            _this2.startTime = new Date();

            try {
                yield _this2.fn();
            } catch (err) {
                if (err.name === 'AssertionError' || err.constructor.name === 'AssertionError') throw new _testRun.ExternalAssertionLibraryError(err, _this2.callsite);

                if (err.isTestCafeError) err.callsite = _this2.callsite;

                throw err;
            }
        })();
    }
}
exports.default = AssertionExecutor;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9hc3NlcnRpb25zL2V4ZWN1dG9yLmpzIl0sIm5hbWVzIjpbIkFTU0VSVElPTl9ERUxBWSIsIkFzc2VydGlvbkV4ZWN1dG9yIiwiY29uc3RydWN0b3IiLCJjb21tYW5kIiwidGltZW91dCIsImNhbGxzaXRlIiwic3RhcnRUaW1lIiwicGFzc2VkIiwiaW5SZXRyeSIsImZuIiwiYWN0dWFsQ29tbWFuZCIsImFjdHVhbCIsIl93cmFwRnVuY3Rpb24iLCJvcHRpb25zIiwiYWxsb3dVbmF3YWl0ZWRQcm9taXNlIiwiX2dldFRpbWVMZWZ0IiwiRGF0ZSIsIl9vbkV4ZWN1dGlvbkZpbmlzaGVkIiwiZW1pdCIsInJlc3VsdFByb21pc2UiLCJfcmVFeGVjdXRlIiwiZXJyIiwicnVuIiwibmFtZSIsImlzVGVzdENhZmVFcnJvciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQTs7QUFDQTs7OztBQUNBOztBQUNBOztBQUNBOzs7O0FBQ0E7Ozs7OztBQUVBLE1BQU1BLGtCQUFrQixHQUF4Qjs7QUFFZSxNQUFNQyxpQkFBTiw4QkFBNkM7QUFDeERDLGdCQUFhQyxPQUFiLEVBQXNCQyxPQUF0QixFQUErQkMsUUFBL0IsRUFBeUM7QUFDckM7O0FBRUEsYUFBS0YsT0FBTCxHQUFnQkEsT0FBaEI7QUFDQSxhQUFLQyxPQUFMLEdBQWdCQSxPQUFoQjtBQUNBLGFBQUtDLFFBQUwsR0FBZ0JBLFFBQWhCOztBQUVBLGFBQUtDLFNBQUwsR0FBaUIsSUFBakI7QUFDQSxhQUFLQyxNQUFMLEdBQWlCLEtBQWpCO0FBQ0EsYUFBS0MsT0FBTCxHQUFpQixLQUFqQjs7QUFFQSxjQUFNQyxLQUFnQixxQkFBTSxLQUFLTixPQUFYLENBQXRCO0FBQ0EsY0FBTU8sZ0JBQWdCLEtBQUtQLE9BQUwsQ0FBYVEsTUFBbkM7O0FBRUEsWUFBSUQsc0RBQUosRUFDSSxLQUFLRCxFQUFMLEdBQVUsS0FBS0csYUFBTCxDQUFtQkgsRUFBbkIsQ0FBVixDQURKLEtBRUssSUFBSSxDQUFDLEtBQUtOLE9BQUwsQ0FBYVUsT0FBYixDQUFxQkMscUJBQXRCLElBQStDLDRCQUFZSixhQUFaLENBQW5ELEVBQ0QsTUFBTSw0Q0FBbUMsS0FBS0wsUUFBeEMsQ0FBTixDQURDLEtBR0QsS0FBS0ksRUFBTCxHQUFVQSxFQUFWO0FBQ1A7O0FBRURNLG1CQUFnQjtBQUNaLGVBQU8sS0FBS1gsT0FBTCxJQUFnQixJQUFJWSxJQUFKLEtBQWEsS0FBS1YsU0FBbEMsQ0FBUDtBQUNIOztBQUVEVywyQkFBd0I7QUFDcEIsWUFBSSxLQUFLVCxPQUFULEVBQ0ksS0FBS1UsSUFBTCxDQUFVLHVCQUFWLEVBQW1DLEtBQUtYLE1BQXhDO0FBQ1A7O0FBRURLLGtCQUFlSCxFQUFmLEVBQW1CO0FBQUE7O0FBQ2YsK0NBQU8sYUFBWTtBQUNmLGtCQUFNVSxnQkFBZ0IsTUFBS2hCLE9BQUwsQ0FBYVEsTUFBbkM7O0FBRUEsbUJBQU8sQ0FBQyxNQUFLSixNQUFiLEVBQXFCO0FBQ2pCLHNCQUFLSixPQUFMLENBQWFRLE1BQWIsR0FBc0IsTUFBTVEsY0FBY0MsVUFBZCxFQUE1Qjs7QUFFQSxvQkFBSTtBQUNBWDtBQUNBLDBCQUFLRixNQUFMLEdBQWMsSUFBZDtBQUNBLDBCQUFLVSxvQkFBTDtBQUNILGlCQUpELENBTUEsT0FBT0ksR0FBUCxFQUFZO0FBQ1Isd0JBQUksTUFBS04sWUFBTCxNQUF1QixDQUEzQixFQUE4QjtBQUMxQiw4QkFBS0Usb0JBQUw7QUFDQSw4QkFBTUksR0FBTjtBQUNIOztBQUVELDBCQUFNLHFCQUFNckIsZUFBTixDQUFOOztBQUVBLDBCQUFLUSxPQUFMLEdBQWUsSUFBZjtBQUNBLDBCQUFLVSxJQUFMLENBQVUseUJBQVYsRUFBcUMsTUFBS0gsWUFBTCxFQUFyQztBQUNIO0FBQ0o7QUFDSixTQXhCRDtBQXlCSDs7QUFFS08sT0FBTixHQUFhO0FBQUE7O0FBQUE7QUFDVCxtQkFBS2hCLFNBQUwsR0FBaUIsSUFBSVUsSUFBSixFQUFqQjs7QUFFQSxnQkFBSTtBQUNBLHNCQUFNLE9BQUtQLEVBQUwsRUFBTjtBQUNILGFBRkQsQ0FJQSxPQUFPWSxHQUFQLEVBQVk7QUFDUixvQkFBSUEsSUFBSUUsSUFBSixLQUFhLGdCQUFiLElBQWlDRixJQUFJbkIsV0FBSixDQUFnQnFCLElBQWhCLEtBQXlCLGdCQUE5RCxFQUNJLE1BQU0sMkNBQWtDRixHQUFsQyxFQUF1QyxPQUFLaEIsUUFBNUMsQ0FBTjs7QUFFSixvQkFBSWdCLElBQUlHLGVBQVIsRUFDSUgsSUFBSWhCLFFBQUosR0FBZSxPQUFLQSxRQUFwQjs7QUFFSixzQkFBTWdCLEdBQU47QUFDSDtBQWZRO0FBZ0JaO0FBNUV1RDtrQkFBdkNwQixpQiIsImZpbGUiOiJhc3NlcnRpb25zL2V4ZWN1dG9yLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRXZlbnRFbWl0dGVyIH0gZnJvbSAnZXZlbnRzJztcbmltcG9ydCBkZWxheSBmcm9tICcuLi91dGlscy9kZWxheSc7XG5pbXBvcnQgeyBpc1RoZW5uYWJsZSB9IGZyb20gJy4uL3V0aWxzL3RoZW5uYWJsZSc7XG5pbXBvcnQgeyBFeHRlcm5hbEFzc2VydGlvbkxpYnJhcnlFcnJvciwgQXNzZXJ0aW9uVW5hd2FpdGVkUHJvbWlzZUVycm9yIH0gZnJvbSAnLi4vZXJyb3JzL3Rlc3QtcnVuJztcbmltcG9ydCBSZUV4ZWN1dGFibGVQcm9taXNlIGZyb20gJy4uL3V0aWxzL3JlLWV4ZWN1dGFibGUtcHJvbWlzZSc7XG5pbXBvcnQgZ2V0Rm4gZnJvbSAnLi9nZXQtZm4nO1xuXG5jb25zdCBBU1NFUlRJT05fREVMQVkgPSAyMDA7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFzc2VydGlvbkV4ZWN1dG9yIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcbiAgICBjb25zdHJ1Y3RvciAoY29tbWFuZCwgdGltZW91dCwgY2FsbHNpdGUpIHtcbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICB0aGlzLmNvbW1hbmQgID0gY29tbWFuZDtcbiAgICAgICAgdGhpcy50aW1lb3V0ICA9IHRpbWVvdXQ7XG4gICAgICAgIHRoaXMuY2FsbHNpdGUgPSBjYWxsc2l0ZTtcblxuICAgICAgICB0aGlzLnN0YXJ0VGltZSA9IG51bGw7XG4gICAgICAgIHRoaXMucGFzc2VkICAgID0gZmFsc2U7XG4gICAgICAgIHRoaXMuaW5SZXRyeSAgID0gZmFsc2U7XG5cbiAgICAgICAgY29uc3QgZm4gICAgICAgICAgICA9IGdldEZuKHRoaXMuY29tbWFuZCk7XG4gICAgICAgIGNvbnN0IGFjdHVhbENvbW1hbmQgPSB0aGlzLmNvbW1hbmQuYWN0dWFsO1xuXG4gICAgICAgIGlmIChhY3R1YWxDb21tYW5kIGluc3RhbmNlb2YgUmVFeGVjdXRhYmxlUHJvbWlzZSlcbiAgICAgICAgICAgIHRoaXMuZm4gPSB0aGlzLl93cmFwRnVuY3Rpb24oZm4pO1xuICAgICAgICBlbHNlIGlmICghdGhpcy5jb21tYW5kLm9wdGlvbnMuYWxsb3dVbmF3YWl0ZWRQcm9taXNlICYmIGlzVGhlbm5hYmxlKGFjdHVhbENvbW1hbmQpKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEFzc2VydGlvblVuYXdhaXRlZFByb21pc2VFcnJvcih0aGlzLmNhbGxzaXRlKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhpcy5mbiA9IGZuO1xuICAgIH1cblxuICAgIF9nZXRUaW1lTGVmdCAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRpbWVvdXQgLSAobmV3IERhdGUoKSAtIHRoaXMuc3RhcnRUaW1lKTtcbiAgICB9XG5cbiAgICBfb25FeGVjdXRpb25GaW5pc2hlZCAoKSB7XG4gICAgICAgIGlmICh0aGlzLmluUmV0cnkpXG4gICAgICAgICAgICB0aGlzLmVtaXQoJ2VuZC1hc3NlcnRpb24tcmV0cmllcycsIHRoaXMucGFzc2VkKTtcbiAgICB9XG5cbiAgICBfd3JhcEZ1bmN0aW9uIChmbikge1xuICAgICAgICByZXR1cm4gYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0UHJvbWlzZSA9IHRoaXMuY29tbWFuZC5hY3R1YWw7XG5cbiAgICAgICAgICAgIHdoaWxlICghdGhpcy5wYXNzZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbW1hbmQuYWN0dWFsID0gYXdhaXQgcmVzdWx0UHJvbWlzZS5fcmVFeGVjdXRlKCk7XG5cbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhc3NlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX29uRXhlY3V0aW9uRmluaXNoZWQoKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl9nZXRUaW1lTGVmdCgpIDw9IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX29uRXhlY3V0aW9uRmluaXNoZWQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IGRlbGF5KEFTU0VSVElPTl9ERUxBWSk7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pblJldHJ5ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbWl0KCdzdGFydC1hc3NlcnRpb24tcmV0cmllcycsIHRoaXMuX2dldFRpbWVMZWZ0KCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBhc3luYyBydW4gKCkge1xuICAgICAgICB0aGlzLnN0YXJ0VGltZSA9IG5ldyBEYXRlKCk7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuZm4oKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGlmIChlcnIubmFtZSA9PT0gJ0Fzc2VydGlvbkVycm9yJyB8fCBlcnIuY29uc3RydWN0b3IubmFtZSA9PT0gJ0Fzc2VydGlvbkVycm9yJylcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXh0ZXJuYWxBc3NlcnRpb25MaWJyYXJ5RXJyb3IoZXJyLCB0aGlzLmNhbGxzaXRlKTtcblxuICAgICAgICAgICAgaWYgKGVyci5pc1Rlc3RDYWZlRXJyb3IpXG4gICAgICAgICAgICAgICAgZXJyLmNhbGxzaXRlID0gdGhpcy5jYWxsc2l0ZTtcblxuICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICB9XG4gICAgfVxufVxuIl19
