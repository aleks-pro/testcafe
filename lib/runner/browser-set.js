'use strict';

exports.__esModule = true;

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _events = require('events');

var _pinkie = require('pinkie');

var _pinkie2 = _interopRequireDefault(_pinkie);

var _timeLimitPromise = require('time-limit-promise');

var _timeLimitPromise2 = _interopRequireDefault(_timeLimitPromise);

var _promisifyEvent = require('promisify-event');

var _promisifyEvent2 = _interopRequireDefault(_promisifyEvent);

var _lodash = require('lodash');

var _mapReverse = require('map-reverse');

var _mapReverse2 = _interopRequireDefault(_mapReverse);

var _runtime = require('../errors/runtime');

var _types = require('../errors/types');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const LOCAL_BROWSERS_READY_TIMEOUT = 2 * 60 * 1000;
const REMOTE_BROWSERS_READY_TIMEOUT = 6 * 60 * 1000;

class BrowserSet extends _events.EventEmitter {
    constructor(browserConnectionGroups) {
        super();

        this.RELEASE_TIMEOUT = 10000;

        this.pendingReleases = [];

        this.browserConnectionGroups = browserConnectionGroups;
        this.browserConnections = (0, _lodash.flatten)(browserConnectionGroups);

        this.connectionsReadyTimeout = null;

        this.browserErrorHandler = error => this.emit('error', error);

        this.browserConnections.forEach(bc => bc.on('error', this.browserErrorHandler));

        // NOTE: We're setting an empty error handler, because Node kills the process on an 'error' event
        // if there is no handler. See: https://nodejs.org/api/events.html#events_class_events_eventemitter
        this.on('error', _lodash.noop);
    }

    static _waitIdle(bc) {
        return (0, _asyncToGenerator3.default)(function* () {
            if (bc.idle || !bc.ready) return;

            yield (0, _promisifyEvent2.default)(bc, 'idle');
        })();
    }

    static _closeConnection(bc) {
        return (0, _asyncToGenerator3.default)(function* () {
            if (bc.closed || !bc.ready) return;

            bc.close();

            yield (0, _promisifyEvent2.default)(bc, 'closed');
        })();
    }

    _getReadyTimeout() {
        var _this = this;

        return (0, _asyncToGenerator3.default)(function* () {
            const isLocalBrowser = function isLocalBrowser(connection) {
                return connection.provider.isLocalBrowser(connection.id, connection.browserInfo.browserName);
            };
            const remoteBrowsersExist = (yield _pinkie2.default.all(_this.browserConnections.map(isLocalBrowser))).indexOf(false) > -1;

            return remoteBrowsersExist ? REMOTE_BROWSERS_READY_TIMEOUT : LOCAL_BROWSERS_READY_TIMEOUT;
        })();
    }

    _createPendingConnectionPromise(readyPromise, timeout, timeoutError) {
        const timeoutPromise = new _pinkie2.default((_, reject) => {
            this.connectionsReadyTimeout = setTimeout(() => reject(timeoutError), timeout);
        });

        return _pinkie2.default.race([readyPromise, timeoutPromise]).then(value => {
            this.connectionsReadyTimeout.unref();
            return value;
        }, error => {
            this.connectionsReadyTimeout.unref();
            throw error;
        });
    }

    _waitConnectionsOpened() {
        var _this2 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            const connectionsReadyPromise = _pinkie2.default.all(_this2.browserConnections.filter(function (bc) {
                return !bc.opened;
            }).map(function (bc) {
                return (0, _promisifyEvent2.default)(bc, 'opened');
            }));

            const timeoutError = new _runtime.GeneralError(_types.RUNTIME_ERRORS.cannotEstablishBrowserConnection);
            const readyTimeout = yield _this2._getReadyTimeout();

            yield _this2._createPendingConnectionPromise(connectionsReadyPromise, readyTimeout, timeoutError);
        })();
    }

    _checkForDisconnections() {
        const disconnectedUserAgents = this.browserConnections.filter(bc => bc.closed).map(bc => bc.userAgent);

        if (disconnectedUserAgents.length) throw new _runtime.GeneralError(_types.RUNTIME_ERRORS.cannotRunAgainstDisconnectedBrowsers, disconnectedUserAgents.join(', '));
    }

    //API
    static from(browserConnections) {
        const browserSet = new BrowserSet(browserConnections);

        const prepareConnection = _pinkie2.default.resolve().then(() => {
            browserSet._checkForDisconnections();
            return browserSet._waitConnectionsOpened();
        }).then(() => browserSet);

        return _pinkie2.default.race([prepareConnection, (0, _promisifyEvent2.default)(browserSet, 'error')]).catch((() => {
            var _ref = (0, _asyncToGenerator3.default)(function* (error) {
                yield browserSet.dispose();

                throw error;
            });

            return function (_x) {
                return _ref.apply(this, arguments);
            };
        })());
    }

    releaseConnection(bc) {
        if (this.browserConnections.indexOf(bc) < 0) return _pinkie2.default.resolve();

        (0, _lodash.pull)(this.browserConnections, bc);

        bc.removeListener('error', this.browserErrorHandler);

        const appropriateStateSwitch = !bc.permanent ? BrowserSet._closeConnection(bc) : BrowserSet._waitIdle(bc);

        const release = (0, _timeLimitPromise2.default)(appropriateStateSwitch, this.RELEASE_TIMEOUT).then(() => (0, _lodash.pull)(this.pendingReleases, release));

        this.pendingReleases.push(release);

        return release;
    }

    dispose() {
        var _this3 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            // NOTE: When browserConnection is cancelled, it is removed from
            // the this.connections array, which leads to shifting indexes
            // towards the beginning. So, we must copy the array in order to iterate it,
            // or we can perform iteration from the end to the beginning.
            if (_this3.connectionsReadyTimeout) _this3.connectionsReadyTimeout.unref();

            (0, _mapReverse2.default)(_this3.browserConnections, function (bc) {
                return _this3.releaseConnection(bc);
            });

            yield _pinkie2.default.all(_this3.pendingReleases);
        })();
    }
}
exports.default = BrowserSet;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydW5uZXIvYnJvd3Nlci1zZXQuanMiXSwibmFtZXMiOlsiTE9DQUxfQlJPV1NFUlNfUkVBRFlfVElNRU9VVCIsIlJFTU9URV9CUk9XU0VSU19SRUFEWV9USU1FT1VUIiwiQnJvd3NlclNldCIsImNvbnN0cnVjdG9yIiwiYnJvd3NlckNvbm5lY3Rpb25Hcm91cHMiLCJSRUxFQVNFX1RJTUVPVVQiLCJwZW5kaW5nUmVsZWFzZXMiLCJicm93c2VyQ29ubmVjdGlvbnMiLCJjb25uZWN0aW9uc1JlYWR5VGltZW91dCIsImJyb3dzZXJFcnJvckhhbmRsZXIiLCJlcnJvciIsImVtaXQiLCJmb3JFYWNoIiwiYmMiLCJvbiIsIl93YWl0SWRsZSIsImlkbGUiLCJyZWFkeSIsIl9jbG9zZUNvbm5lY3Rpb24iLCJjbG9zZWQiLCJjbG9zZSIsIl9nZXRSZWFkeVRpbWVvdXQiLCJpc0xvY2FsQnJvd3NlciIsImNvbm5lY3Rpb24iLCJwcm92aWRlciIsImlkIiwiYnJvd3NlckluZm8iLCJicm93c2VyTmFtZSIsInJlbW90ZUJyb3dzZXJzRXhpc3QiLCJhbGwiLCJtYXAiLCJpbmRleE9mIiwiX2NyZWF0ZVBlbmRpbmdDb25uZWN0aW9uUHJvbWlzZSIsInJlYWR5UHJvbWlzZSIsInRpbWVvdXQiLCJ0aW1lb3V0RXJyb3IiLCJ0aW1lb3V0UHJvbWlzZSIsIl8iLCJyZWplY3QiLCJzZXRUaW1lb3V0IiwicmFjZSIsInRoZW4iLCJ2YWx1ZSIsInVucmVmIiwiX3dhaXRDb25uZWN0aW9uc09wZW5lZCIsImNvbm5lY3Rpb25zUmVhZHlQcm9taXNlIiwiZmlsdGVyIiwib3BlbmVkIiwiY2Fubm90RXN0YWJsaXNoQnJvd3NlckNvbm5lY3Rpb24iLCJyZWFkeVRpbWVvdXQiLCJfY2hlY2tGb3JEaXNjb25uZWN0aW9ucyIsImRpc2Nvbm5lY3RlZFVzZXJBZ2VudHMiLCJ1c2VyQWdlbnQiLCJsZW5ndGgiLCJjYW5ub3RSdW5BZ2FpbnN0RGlzY29ubmVjdGVkQnJvd3NlcnMiLCJqb2luIiwiZnJvbSIsImJyb3dzZXJTZXQiLCJwcmVwYXJlQ29ubmVjdGlvbiIsInJlc29sdmUiLCJjYXRjaCIsImRpc3Bvc2UiLCJyZWxlYXNlQ29ubmVjdGlvbiIsInJlbW92ZUxpc3RlbmVyIiwiYXBwcm9wcmlhdGVTdGF0ZVN3aXRjaCIsInBlcm1hbmVudCIsInJlbGVhc2UiLCJwdXNoIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBOztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOztBQUNBOzs7O0FBQ0E7O0FBQ0E7Ozs7QUFFQSxNQUFNQSwrQkFBZ0MsSUFBSSxFQUFKLEdBQVMsSUFBL0M7QUFDQSxNQUFNQyxnQ0FBZ0MsSUFBSSxFQUFKLEdBQVMsSUFBL0M7O0FBRWUsTUFBTUMsVUFBTiw4QkFBc0M7QUFDakRDLGdCQUFhQyx1QkFBYixFQUFzQztBQUNsQzs7QUFFQSxhQUFLQyxlQUFMLEdBQXVCLEtBQXZCOztBQUVBLGFBQUtDLGVBQUwsR0FBdUIsRUFBdkI7O0FBRUEsYUFBS0YsdUJBQUwsR0FBK0JBLHVCQUEvQjtBQUNBLGFBQUtHLGtCQUFMLEdBQStCLHFCQUFRSCx1QkFBUixDQUEvQjs7QUFFQSxhQUFLSSx1QkFBTCxHQUErQixJQUEvQjs7QUFFQSxhQUFLQyxtQkFBTCxHQUEyQkMsU0FBUyxLQUFLQyxJQUFMLENBQVUsT0FBVixFQUFtQkQsS0FBbkIsQ0FBcEM7O0FBRUEsYUFBS0gsa0JBQUwsQ0FBd0JLLE9BQXhCLENBQWdDQyxNQUFNQSxHQUFHQyxFQUFILENBQU0sT0FBTixFQUFlLEtBQUtMLG1CQUFwQixDQUF0Qzs7QUFFQTtBQUNBO0FBQ0EsYUFBS0ssRUFBTCxDQUFRLE9BQVI7QUFDSDs7QUFFRCxXQUFhQyxTQUFiLENBQXdCRixFQUF4QixFQUE0QjtBQUFBO0FBQ3hCLGdCQUFJQSxHQUFHRyxJQUFILElBQVcsQ0FBQ0gsR0FBR0ksS0FBbkIsRUFDSTs7QUFFSixrQkFBTSw4QkFBZUosRUFBZixFQUFtQixNQUFuQixDQUFOO0FBSndCO0FBSzNCOztBQUVELFdBQWFL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QSxhQUFwQzs7QUFFQSxrQkFBTSxpQkFBUWdCLEdBQVIsQ0FBWSxPQUFLdkIsZUFBakIsQ0FBTjtBQVZhO0FBV2hCO0FBNUlnRDtrQkFBaENKLFUiLCJmaWxlIjoicnVubmVyL2Jyb3dzZXItc2V0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRXZlbnRFbWl0dGVyIH0gZnJvbSAnZXZlbnRzJztcbmltcG9ydCBQcm9taXNlIGZyb20gJ3BpbmtpZSc7XG5pbXBvcnQgZ2V0VGltZUxpbWl0ZWRQcm9taXNlIGZyb20gJ3RpbWUtbGltaXQtcHJvbWlzZSc7XG5pbXBvcnQgcHJvbWlzaWZ5RXZlbnQgZnJvbSAncHJvbWlzaWZ5LWV2ZW50JztcbmltcG9ydCB7IG5vb3AsIHB1bGwgYXMgcmVtb3ZlLCBmbGF0dGVuIH0gZnJvbSAnbG9kYXNoJztcbmltcG9ydCBtYXBSZXZlcnNlIGZyb20gJ21hcC1yZXZlcnNlJztcbmltcG9ydCB7IEdlbmVyYWxFcnJvciB9IGZyb20gJy4uL2Vycm9ycy9ydW50aW1lJztcbmltcG9ydCB7IFJVTlRJTUVfRVJST1JTIH0gZnJvbSAnLi4vZXJyb3JzL3R5cGVzJztcblxuY29uc3QgTE9DQUxfQlJPV1NFUlNfUkVBRFlfVElNRU9VVCAgPSAyICogNjAgKiAxMDAwO1xuY29uc3QgUkVNT1RFX0JST1dTRVJTX1JFQURZX1RJTUVPVVQgPSA2ICogNjAgKiAxMDAwO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCcm93c2VyU2V0IGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcbiAgICBjb25zdHJ1Y3RvciAoYnJvd3NlckNvbm5lY3Rpb25Hcm91cHMpIHtcbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICB0aGlzLlJFTEVBU0VfVElNRU9VVCA9IDEwMDAwO1xuXG4gICAgICAgIHRoaXMucGVuZGluZ1JlbGVhc2VzID0gW107XG5cbiAgICAgICAgdGhpcy5icm93c2VyQ29ubmVjdGlvbkdyb3VwcyA9IGJyb3dzZXJDb25uZWN0aW9uR3JvdXBzO1xuICAgICAgICB0aGlzLmJyb3dzZXJDb25uZWN0aW9ucyAgICAgID0gZmxhdHRlbihicm93c2VyQ29ubmVjdGlvbkdyb3Vwcyk7XG5cbiAgICAgICAgdGhpcy5jb25uZWN0aW9uc1JlYWR5VGltZW91dCA9IG51bGw7XG5cbiAgICAgICAgdGhpcy5icm93c2VyRXJyb3JIYW5kbGVyID0gZXJyb3IgPT4gdGhpcy5lbWl0KCdlcnJvcicsIGVycm9yKTtcblxuICAgICAgICB0aGlzLmJyb3dzZXJDb25uZWN0aW9ucy5mb3JFYWNoKGJjID0+IGJjLm9uKCdlcnJvcicsIHRoaXMuYnJvd3NlckVycm9ySGFuZGxlcikpO1xuXG4gICAgICAgIC8vIE5PVEU6IFdlJ3JlIHNldHRpbmcgYW4gZW1wdHkgZXJyb3IgaGFuZGxlciwgYmVjYXVzZSBOb2RlIGtpbGxzIHRoZSBwcm9jZXNzIG9uIGFuICdlcnJvcicgZXZlbnRcbiAgICAgICAgLy8gaWYgdGhlcmUgaXMgbm8gaGFuZGxlci4gU2VlOiBodHRwczovL25vZGVqcy5vcmcvYXBpL2V2ZW50cy5odG1sI2V2ZW50c19jbGFzc19ldmVudHNfZXZlbnRlbWl0dGVyXG4gICAgICAgIHRoaXMub24oJ2Vycm9yJywgbm9vcCk7XG4gICAgfVxuXG4gICAgc3RhdGljIGFzeW5jIF93YWl0SWRsZSAoYmMpIHtcbiAgICAgICAgaWYgKGJjLmlkbGUgfHwgIWJjLnJlYWR5KVxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIGF3YWl0IHByb21pc2lmeUV2ZW50KGJjLCAnaWRsZScpO1xuICAgIH1cblxuICAgIHN0YXRpYyBhc3luYyBfY2xvc2VDb25uZWN0aW9uIChiYykge1xuICAgICAgICBpZiAoYmMuY2xvc2VkIHx8ICFiYy5yZWFkeSlcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICBiYy5jbG9zZSgpO1xuXG4gICAgICAgIGF3YWl0IHByb21pc2lmeUV2ZW50KGJjLCAnY2xvc2VkJyk7XG4gICAgfVxuXG4gICAgYXN5bmMgX2dldFJlYWR5VGltZW91dCAoKSB7XG4gICAgICAgIGNvbnN0IGlzTG9jYWxCcm93c2VyICAgICAgPSBjb25uZWN0aW9uID0+IGNvbm5lY3Rpb24ucHJvdmlkZXIuaXNMb2NhbEJyb3dzZXIoY29ubmVjdGlvbi5pZCwgY29ubmVjdGlvbi5icm93c2VySW5mby5icm93c2VyTmFtZSk7XG4gICAgICAgIGNvbnN0IHJlbW90ZUJyb3dzZXJzRXhpc3QgPSAoYXdhaXQgUHJvbWlzZS5hbGwodGhpcy5icm93c2VyQ29ubmVjdGlvbnMubWFwKGlzTG9jYWxCcm93c2VyKSkpLmluZGV4T2YoZmFsc2UpID4gLTE7XG5cbiAgICAgICAgcmV0dXJuIHJlbW90ZUJyb3dzZXJzRXhpc3QgPyBSRU1PVEVfQlJPV1NFUlNfUkVBRFlfVElNRU9VVCA6IExPQ0FMX0JST1dTRVJTX1JFQURZX1RJTUVPVVQ7XG4gICAgfVxuXG4gICAgX2NyZWF0ZVBlbmRpbmdDb25uZWN0aW9uUHJvbWlzZSAocmVhZHlQcm9taXNlLCB0aW1lb3V0LCB0aW1lb3V0RXJyb3IpIHtcbiAgICAgICAgY29uc3QgdGltZW91dFByb21pc2UgPSBuZXcgUHJvbWlzZSgoXywgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICB0aGlzLmNvbm5lY3Rpb25zUmVhZHlUaW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiByZWplY3QodGltZW91dEVycm9yKSwgdGltZW91dCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBQcm9taXNlXG4gICAgICAgICAgICAucmFjZShbcmVhZHlQcm9taXNlLCB0aW1lb3V0UHJvbWlzZV0pXG4gICAgICAgICAgICAudGhlbihcbiAgICAgICAgICAgICAgICB2YWx1ZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29ubmVjdGlvbnNSZWFkeVRpbWVvdXQudW5yZWYoKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbm5lY3Rpb25zUmVhZHlUaW1lb3V0LnVucmVmKCk7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7XG4gICAgfVxuXG4gICAgYXN5bmMgX3dhaXRDb25uZWN0aW9uc09wZW5lZCAoKSB7XG4gICAgICAgIGNvbnN0IGNvbm5lY3Rpb25zUmVhZHlQcm9taXNlID0gUHJvbWlzZS5hbGwoXG4gICAgICAgICAgICB0aGlzLmJyb3dzZXJDb25uZWN0aW9uc1xuICAgICAgICAgICAgICAgIC5maWx0ZXIoYmMgPT4gIWJjLm9wZW5lZClcbiAgICAgICAgICAgICAgICAubWFwKGJjID0+IHByb21pc2lmeUV2ZW50KGJjLCAnb3BlbmVkJykpXG4gICAgICAgICk7XG5cbiAgICAgICAgY29uc3QgdGltZW91dEVycm9yID0gbmV3IEdlbmVyYWxFcnJvcihSVU5USU1FX0VSUk9SUy5jYW5ub3RFc3RhYmxpc2hCcm93c2VyQ29ubmVjdGlvbik7XG4gICAgICAgIGNvbnN0IHJlYWR5VGltZW91dCA9IGF3YWl0IHRoaXMuX2dldFJlYWR5VGltZW91dCgpO1xuXG4gICAgICAgIGF3YWl0IHRoaXMuX2NyZWF0ZVBlbmRpbmdDb25uZWN0aW9uUHJvbWlzZShjb25uZWN0aW9uc1JlYWR5UHJvbWlzZSwgcmVhZHlUaW1lb3V0LCB0aW1lb3V0RXJyb3IpO1xuICAgIH1cblxuICAgIF9jaGVja0ZvckRpc2Nvbm5lY3Rpb25zICgpIHtcbiAgICAgICAgY29uc3QgZGlzY29ubmVjdGVkVXNlckFnZW50cyA9IHRoaXMuYnJvd3NlckNvbm5lY3Rpb25zXG4gICAgICAgICAgICAuZmlsdGVyKGJjID0+IGJjLmNsb3NlZClcbiAgICAgICAgICAgIC5tYXAoYmMgPT4gYmMudXNlckFnZW50KTtcblxuICAgICAgICBpZiAoZGlzY29ubmVjdGVkVXNlckFnZW50cy5sZW5ndGgpXG4gICAgICAgICAgICB0aHJvdyBuZXcgR2VuZXJhbEVycm9yKFJVTlRJTUVfRVJST1JTLmNhbm5vdFJ1bkFnYWluc3REaXNjb25uZWN0ZWRCcm93c2VycywgZGlzY29ubmVjdGVkVXNlckFnZW50cy5qb2luKCcsICcpKTtcbiAgICB9XG5cblxuICAgIC8vQVBJXG4gICAgc3RhdGljIGZyb20gKGJyb3dzZXJDb25uZWN0aW9ucykge1xuICAgICAgICBjb25zdCBicm93c2VyU2V0ID0gbmV3IEJyb3dzZXJTZXQoYnJvd3NlckNvbm5lY3Rpb25zKTtcblxuICAgICAgICBjb25zdCBwcmVwYXJlQ29ubmVjdGlvbiA9IFByb21pc2UucmVzb2x2ZSgpXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgYnJvd3NlclNldC5fY2hlY2tGb3JEaXNjb25uZWN0aW9ucygpO1xuICAgICAgICAgICAgICAgIHJldHVybiBicm93c2VyU2V0Ll93YWl0Q29ubmVjdGlvbnNPcGVuZWQoKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAudGhlbigoKSA9PiBicm93c2VyU2V0KTtcblxuICAgICAgICByZXR1cm4gUHJvbWlzZVxuICAgICAgICAgICAgLnJhY2UoW1xuICAgICAgICAgICAgICAgIHByZXBhcmVDb25uZWN0aW9uLFxuICAgICAgICAgICAgICAgIHByb21pc2lmeUV2ZW50KGJyb3dzZXJTZXQsICdlcnJvcicpXG4gICAgICAgICAgICBdKVxuICAgICAgICAgICAgLmNhdGNoKGFzeW5jIGVycm9yID0+IHtcbiAgICAgICAgICAgICAgICBhd2FpdCBicm93c2VyU2V0LmRpc3Bvc2UoKTtcblxuICAgICAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmVsZWFzZUNvbm5lY3Rpb24gKGJjKSB7XG4gICAgICAgIGlmICh0aGlzLmJyb3dzZXJDb25uZWN0aW9ucy5pbmRleE9mKGJjKSA8IDApXG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG5cbiAgICAgICAgcmVtb3ZlKHRoaXMuYnJvd3NlckNvbm5lY3Rpb25zLCBiYyk7XG5cbiAgICAgICAgYmMucmVtb3ZlTGlzdGVuZXIoJ2Vycm9yJywgdGhpcy5icm93c2VyRXJyb3JIYW5kbGVyKTtcblxuICAgICAgICBjb25zdCBhcHByb3ByaWF0ZVN0YXRlU3dpdGNoID0gIWJjLnBlcm1hbmVudCA/XG4gICAgICAgICAgICBCcm93c2VyU2V0Ll9jbG9zZUNvbm5lY3Rpb24oYmMpIDpcbiAgICAgICAgICAgIEJyb3dzZXJTZXQuX3dhaXRJZGxlKGJjKTtcblxuICAgICAgICBjb25zdCByZWxlYXNlID0gZ2V0VGltZUxpbWl0ZWRQcm9taXNlKGFwcHJvcHJpYXRlU3RhdGVTd2l0Y2gsIHRoaXMuUkVMRUFTRV9USU1FT1VUKS50aGVuKCgpID0+IHJlbW92ZSh0aGlzLnBlbmRpbmdSZWxlYXNlcywgcmVsZWFzZSkpO1xuXG4gICAgICAgIHRoaXMucGVuZGluZ1JlbGVhc2VzLnB1c2gocmVsZWFzZSk7XG5cbiAgICAgICAgcmV0dXJuIHJlbGVhc2U7XG4gICAgfVxuXG4gICAgYXN5bmMgZGlzcG9zZSAoKSB7XG4gICAgICAgIC8vIE5PVEU6IFdoZW4gYnJvd3NlckNvbm5lY3Rpb24gaXMgY2FuY2VsbGVkLCBpdCBpcyByZW1vdmVkIGZyb21cbiAgICAgICAgLy8gdGhlIHRoaXMuY29ubmVjdGlvbnMgYXJyYXksIHdoaWNoIGxlYWRzIHRvIHNoaWZ0aW5nIGluZGV4ZXNcbiAgICAgICAgLy8gdG93YXJkcyB0aGUgYmVnaW5uaW5nLiBTbywgd2UgbXVzdCBjb3B5IHRoZSBhcnJheSBpbiBvcmRlciB0byBpdGVyYXRlIGl0LFxuICAgICAgICAvLyBvciB3ZSBjYW4gcGVyZm9ybSBpdGVyYXRpb24gZnJvbSB0aGUgZW5kIHRvIHRoZSBiZWdpbm5pbmcuXG4gICAgICAgIGlmICh0aGlzLmNvbm5lY3Rpb25zUmVhZHlUaW1lb3V0KVxuICAgICAgICAgICAgdGhpcy5jb25uZWN0aW9uc1JlYWR5VGltZW91dC51bnJlZigpO1xuXG4gICAgICAgIG1hcFJldmVyc2UodGhpcy5icm93c2VyQ29ubmVjdGlvbnMsIGJjID0+IHRoaXMucmVsZWFzZUNvbm5lY3Rpb24oYmMpKTtcblxuICAgICAgICBhd2FpdCBQcm9taXNlLmFsbCh0aGlzLnBlbmRpbmdSZWxlYXNlcyk7XG4gICAgfVxufVxuIl19
