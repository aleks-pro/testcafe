'use strict';

exports.__esModule = true;

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _pinkie = require('pinkie');

var _pinkie2 = _interopRequireDefault(_pinkie);

var _events = require('events');

var _promisifyEvent = require('promisify-event');

var _promisifyEvent2 = _interopRequireDefault(_promisifyEvent);

var _timeLimitPromise = require('time-limit-promise');

var _timeLimitPromise2 = _interopRequireDefault(_timeLimitPromise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const REMOTE_REDIRECT_TIMEOUT = 10000;
const ADDING_CONNECTION_WAITING_TIMEOUT = 10000;

class RemotesQueue {
    constructor() {
        this.events = new _events.EventEmitter();
        this.shiftingTimeout = _pinkie2.default.resolve();
        this.pendingConnections = {};
    }

    add(remoteConnection) {
        const connectionReadyPromise = (0, _promisifyEvent2.default)(remoteConnection, 'ready').then(() => this.remove(remoteConnection));

        this.pendingConnections[remoteConnection.id] = {
            connection: remoteConnection,
            readyPromise: connectionReadyPromise
        };

        this.events.emit('connection-added', remoteConnection.id);
    }

    remove(remoteConnection) {
        delete this.pendingConnections[remoteConnection.id];
    }

    shift() {
        var _this = this;

        const shiftingPromise = this.shiftingTimeout.then((0, _asyncToGenerator3.default)(function* () {
            let headId = (0, _keys2.default)(_this.pendingConnections)[0];

            if (!headId) headId = yield (0, _timeLimitPromise2.default)((0, _promisifyEvent2.default)(_this.events, 'connection-added'), ADDING_CONNECTION_WAITING_TIMEOUT);

            return headId ? _this.pendingConnections[headId].connection : null;
        }));

        this.shiftingTimeout = shiftingPromise.then(connection => {
            if (!connection) return _pinkie2.default.resolve();

            return (0, _timeLimitPromise2.default)(this.pendingConnections[connection.id].readyPromise, REMOTE_REDIRECT_TIMEOUT);
        });

        return shiftingPromise;
    }
}
exports.default = RemotesQueue;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9icm93c2VyL2Nvbm5lY3Rpb24vcmVtb3Rlcy1xdWV1ZS5qcyJdLCJuYW1lcyI6WyJSRU1PVEVfUkVESVJFQ1RfVElNRU9VVCIsIkFERElOR19DT05ORUNUSU9OX1dBSVRJTkdfVElNRU9VVCIsIlJlbW90ZXNRdWV1ZSIsImNvbnN0cnVjdG9yIiwiZXZlbnRzIiwic2hpZnRpbmdUaW1lb3V0IiwicmVzb2x2ZSIsInBlbmRpbmdDb25uZWN0aW9ucyIsImFkZCIsInJlbW90ZUNvbm5lY3Rpb24iLCJjb25uZWN0aW9uUmVhZHlQcm9taXNlIiwidGhlbiIsInJlbW92ZSIsImlkIiwiY29ubmVjdGlvbiIsInJlYWR5UHJvbWlzZSIsImVtaXQiLCJzaGlmdCIsInNoaWZ0aW5nUHJvbWlzZSIsImhlYWRJZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUE7Ozs7QUFDQTs7QUFDQTs7OztBQUNBOzs7Ozs7QUFHQSxNQUFNQSwwQkFBb0MsS0FBMUM7QUFDQSxNQUFNQyxvQ0FBb0MsS0FBMUM7O0FBRWUsTUFBTUMsWUFBTixDQUFtQjtBQUM5QkMsa0JBQWU7QUFDWCxhQUFLQyxNQUFMLEdBQTBCLDBCQUExQjtBQUNBLGFBQUtDLGVBQUwsR0FBMEIsaUJBQVFDLE9BQVIsRUFBMUI7QUFDQSxhQUFLQyxrQkFBTCxHQUEwQixFQUExQjtBQUNIOztBQUVEQyxRQUFLQyxnQkFBTCxFQUF1QjtBQUNuQixjQUFNQyx5QkFBeUIsOEJBQWVELGdCQUFmLEVBQWlDLE9BQWpDLEVBQzFCRSxJQUQwQixDQUNyQixNQUFNLEtBQUtDLE1BQUwsQ0FBWUgsZ0JBQVosQ0FEZSxDQUEvQjs7QUFHQSxhQUFLRixrQkFBTCxDQUF3QkUsaUJBQWlCSSxFQUF6QyxJQUErQztBQUMzQ0Msd0JBQWNMLGdCQUQ2QjtBQUUzQ00sMEJBQWNMO0FBRjZCLFNBQS9DOztBQUtBLGFBQUtOLE1BQUwsQ0FBWVksSUFBWixDQUFpQixrQkFBakIsRUFBcUNQLGlCQUFpQkksRUFBdEQ7QUFDSDs7QUFFREQsV0FBUUgsZ0JBQVIsRUFBMEI7QUFDdEIsZUFBTyxLQUFLRixrQkFBTCxDQUF3QkUsaUJBQWlCSSxFQUF6QyxDQUFQO0FBQ0g7O0FBRURJLFlBQVM7QUFBQTs7QUFDTCxjQUFNQyxrQkFBa0IsS0FBS2IsZUFBTCxDQUNuQk0sSUFEbUIsaUNBQ2QsYUFBWTtBQUNkLGdCQUFJUSxTQUFTLG9CQUFZLE1BQUtaLGtCQUFqQixFQUFxQyxDQUFyQyxDQUFiOztBQUVBLGdCQUFJLENBQUNZLE1BQUwsRUFDSUEsU0FBUyxNQUFNLGdDQUFzQiw4QkFBZSxNQUFLZixNQUFwQixFQUE0QixrQkFBNUIsQ0FBdEIsRUFBdUVILGlDQUF2RSxDQUFmOztBQUVKLG1CQUFPa0IsU0FBUyxNQUFLWixrQkFBTCxDQUF3QlksTUFBeEIsRUFBZ0NMLFVBQXpDLEdBQXNELElBQTdEO0FBQ0gsU0FSbUIsRUFBeEI7O0FBVUEsYUFBS1QsZUFBTCxHQUF1QmEsZ0JBQ2xCUCxJQURrQixDQUNiRyxjQUFjO0FBQ2hCLGdCQUFJLENBQUNBLFVBQUwsRUFDSSxPQUFPLGlCQUFRUixPQUFSLEVBQVA7O0FBRUosbUJBQU8sZ0NBQXNCLEtBQUtDLGtCQUFMLENBQXdCTyxXQUFXRCxFQUFuQyxFQUF1Q0UsWUFBN0QsRUFBMkVmLHVCQUEzRSxDQUFQO0FBQ0gsU0FOa0IsQ0FBdkI7O0FBUUEsZUFBT2tCLGVBQVA7QUFDSDtBQTNDNkI7a0JBQWJoQixZIiwiZmlsZSI6ImJyb3dzZXIvY29ubmVjdGlvbi9yZW1vdGVzLXF1ZXVlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFByb21pc2UgZnJvbSAncGlua2llJztcbmltcG9ydCB7IEV2ZW50RW1pdHRlciB9IGZyb20gJ2V2ZW50cyc7XG5pbXBvcnQgcHJvbWlzaWZ5RXZlbnQgZnJvbSAncHJvbWlzaWZ5LWV2ZW50JztcbmltcG9ydCBnZXRUaW1lTGltaXRlZFByb21pc2UgZnJvbSAndGltZS1saW1pdC1wcm9taXNlJztcblxuXG5jb25zdCBSRU1PVEVfUkVESVJFQ1RfVElNRU9VVCAgICAgICAgICAgPSAxMDAwMDtcbmNvbnN0IEFERElOR19DT05ORUNUSU9OX1dBSVRJTkdfVElNRU9VVCA9IDEwMDAwO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZW1vdGVzUXVldWUge1xuICAgIGNvbnN0cnVjdG9yICgpIHtcbiAgICAgICAgdGhpcy5ldmVudHMgICAgICAgICAgICAgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gICAgICAgIHRoaXMuc2hpZnRpbmdUaW1lb3V0ICAgID0gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICAgIHRoaXMucGVuZGluZ0Nvbm5lY3Rpb25zID0ge307XG4gICAgfVxuXG4gICAgYWRkIChyZW1vdGVDb25uZWN0aW9uKSB7XG4gICAgICAgIGNvbnN0IGNvbm5lY3Rpb25SZWFkeVByb21pc2UgPSBwcm9taXNpZnlFdmVudChyZW1vdGVDb25uZWN0aW9uLCAncmVhZHknKVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4gdGhpcy5yZW1vdmUocmVtb3RlQ29ubmVjdGlvbikpO1xuXG4gICAgICAgIHRoaXMucGVuZGluZ0Nvbm5lY3Rpb25zW3JlbW90ZUNvbm5lY3Rpb24uaWRdID0ge1xuICAgICAgICAgICAgY29ubmVjdGlvbjogICByZW1vdGVDb25uZWN0aW9uLFxuICAgICAgICAgICAgcmVhZHlQcm9taXNlOiBjb25uZWN0aW9uUmVhZHlQcm9taXNlXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5ldmVudHMuZW1pdCgnY29ubmVjdGlvbi1hZGRlZCcsIHJlbW90ZUNvbm5lY3Rpb24uaWQpO1xuICAgIH1cblxuICAgIHJlbW92ZSAocmVtb3RlQ29ubmVjdGlvbikge1xuICAgICAgICBkZWxldGUgdGhpcy5wZW5kaW5nQ29ubmVjdGlvbnNbcmVtb3RlQ29ubmVjdGlvbi5pZF07XG4gICAgfVxuXG4gICAgc2hpZnQgKCkge1xuICAgICAgICBjb25zdCBzaGlmdGluZ1Byb21pc2UgPSB0aGlzLnNoaWZ0aW5nVGltZW91dFxuICAgICAgICAgICAgLnRoZW4oYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBoZWFkSWQgPSBPYmplY3Qua2V5cyh0aGlzLnBlbmRpbmdDb25uZWN0aW9ucylbMF07XG5cbiAgICAgICAgICAgICAgICBpZiAoIWhlYWRJZClcbiAgICAgICAgICAgICAgICAgICAgaGVhZElkID0gYXdhaXQgZ2V0VGltZUxpbWl0ZWRQcm9taXNlKHByb21pc2lmeUV2ZW50KHRoaXMuZXZlbnRzLCAnY29ubmVjdGlvbi1hZGRlZCcpLCBBRERJTkdfQ09OTkVDVElPTl9XQUlUSU5HX1RJTUVPVVQpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGhlYWRJZCA/IHRoaXMucGVuZGluZ0Nvbm5lY3Rpb25zW2hlYWRJZF0uY29ubmVjdGlvbiA6IG51bGw7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnNoaWZ0aW5nVGltZW91dCA9IHNoaWZ0aW5nUHJvbWlzZVxuICAgICAgICAgICAgLnRoZW4oY29ubmVjdGlvbiA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFjb25uZWN0aW9uKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gZ2V0VGltZUxpbWl0ZWRQcm9taXNlKHRoaXMucGVuZGluZ0Nvbm5lY3Rpb25zW2Nvbm5lY3Rpb24uaWRdLnJlYWR5UHJvbWlzZSwgUkVNT1RFX1JFRElSRUNUX1RJTUVPVVQpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHNoaWZ0aW5nUHJvbWlzZTtcbiAgICB9XG59XG4iXX0=
