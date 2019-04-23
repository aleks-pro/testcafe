'use strict';

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _pinkie = require('pinkie');

var _pinkie2 = _interopRequireDefault(_pinkie);

var _net = require('net');

var _promisifyEvent = require('promisify-event');

var _promisifyEvent2 = _interopRequireDefault(_promisifyEvent);

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _delay = require('../../../../../../utils/delay');

var _delay2 = _interopRequireDefault(_delay);

var _clientFunctions = require('../../../../utils/client-functions');

var _commands = require('./commands');

var _commands2 = _interopRequireDefault(_commands);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const CONNECTION_TIMEOUT = 30000;
const CONNECTION_RETRY_DELAY = 300;
const MAX_RESIZE_RETRY_COUNT = 2;
const HEADER_SEPARATOR = ':';

module.exports = class MarionetteClient {
    constructor(port = 2828, host = '127.0.0.1') {
        this.currentPacketNumber = 1;
        this.events = new _events2.default();
        this.port = port;
        this.host = host;
        this.socket = new _net.Socket();
        this.buffer = Buffer.alloc(0);
        this.getPacketPromise = _pinkie2.default.resolve();
        this.sendPacketPromise = _pinkie2.default.resolve();

        this.protocolInfo = {
            applicationType: '',
            marionetteProtocol: ''
        };

        this.sessionInfo = null;
    }

    _attemptToConnect(port, host) {
        var _this = this;

        return (0, _asyncToGenerator3.default)(function* () {
            _this.socket.connect(port, host);

            const connectionPromise = _pinkie2.default.race([(0, _promisifyEvent2.default)(_this.socket, 'connect'), (0, _promisifyEvent2.default)(_this.socket, 'error')]);

            return yield connectionPromise.then(function () {
                return true;
            }).catch(function () {
                _this.socket.removeAllListeners('connect');
                return (0, _delay2.default)(CONNECTION_RETRY_DELAY);
            });
        })();
    }

    _connectSocket(port, host) {
        var _this2 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            const connectionStartTime = Date.now();

            let connected = yield _this2._attemptToConnect(port, host);

            while (!connected && Date.now() - connectionStartTime < CONNECTION_TIMEOUT) connected = yield _this2._attemptToConnect(port, host);

            if (!connected) throw new Error('Unable to connect');

            _this2.socket.on('data', function (data) {
                return _this2._handleNewData(data);
            });
        })();
    }

    _writeSocket(message) {
        var _this3 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            if (!_this3.socket.write(message)) yield (0, _promisifyEvent2.default)(_this3.socket, 'drain');
        })();
    }

    _handleNewData(data) {
        if (!data) return;

        this.buffer = Buffer.concat([this.buffer, data]);

        this.events.emit('new-data');
    }

    _getPacket() {
        var _this4 = this;

        this.getPacketPromise = this.getPacketPromise.then((0, _asyncToGenerator3.default)(function* () {
            let headerEndIndex = _this4.buffer.indexOf(HEADER_SEPARATOR);

            while (headerEndIndex < 0) {
                yield (0, _promisifyEvent2.default)(_this4.events, 'new-data');

                headerEndIndex = _this4.buffer.indexOf(HEADER_SEPARATOR);
            }

            const packet = {
                length: NaN,
                body: null
            };

            packet.length = parseInt(_this4.buffer.toString('utf8', 0, headerEndIndex), 10) || 0;

            const bodyStartIndex = headerEndIndex + HEADER_SEPARATOR.length;
            const bodyEndIndex = bodyStartIndex + packet.length;

            if (packet.length) {
                while (_this4.buffer.length < bodyEndIndex) yield (0, _promisifyEvent2.default)(_this4.events, 'new-data');

                packet.body = JSON.parse(_this4.buffer.toString('utf8', bodyStartIndex, bodyEndIndex));
            }

            _this4.buffer = _this4.buffer.slice(bodyEndIndex);

            return packet;
        }));

        return this.getPacketPromise;
    }

    _sendPacket(payload) {
        var _this5 = this;

        this.sendPacketPromise = this.sendPacketPromise.then((0, _asyncToGenerator3.default)(function* () {
            const body = [0, _this5.currentPacketNumber++, payload.command, payload.parameters];
            const serialized = (0, _stringify2.default)(body);
            const message = Buffer.byteLength(serialized, 'utf8') + HEADER_SEPARATOR + serialized;

            _this5._writeSocket(message);
        }));

        return this.sendPacketPromise;
    }

    _throwMarionetteError(error) {
        throw new Error(`${error.error}${error.message ? ': ' + error.message : ''}`);
    }

    _getResponse(packet) {
        var _this6 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            const packetNumber = _this6.currentPacketNumber;

            yield _this6._sendPacket(packet);

            let responsePacket = yield _this6._getPacket();

            while (!responsePacket.body || responsePacket.body[1] !== packetNumber) responsePacket = yield _this6._getPacket();

            if (responsePacket.body[2]) _this6._throwMarionetteError(responsePacket.body[2]);

            return responsePacket.body[3];
        })();
    }

    _getScreenshotRawData() {
        var _this7 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            return yield _this7._getResponse({ command: _commands2.default.takeScreenshot });
        })();
    }

    connect() {
        var _this8 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            yield _this8._connectSocket(_this8.port, _this8.host);

            const infoPacket = yield _this8._getPacket();

            _this8.protocolInfo = {
                applicationType: infoPacket.body.applicationType,
                marionetteProtocol: infoPacket.body.marionetteProtocol
            };

            _this8.sessionInfo = yield _this8._getResponse({ command: _commands2.default.newSession });
        })();
    }

    dispose() {
        this.socket.end();
        this.buffer = null;
    }

    executeScript(code) {
        var _this9 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            return yield _this9._getResponse({
                command: _commands2.default.executeScript,
                parameters: { script: `return (${code})()` }
            });
        })();
    }

    getScreenshotData() {
        var _this10 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            const frameData = yield _this10._getScreenshotRawData();

            return Buffer.from(frameData.value, 'base64');
        })();
    }

    setWindowSize(width, height) {
        var _this11 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            var _ref3 = yield _this11.executeScript(_clientFunctions.GET_WINDOW_DIMENSIONS_INFO_SCRIPT);

            let pageRect = _ref3.value;

            let attemptCounter = 0;

            while (attemptCounter++ < MAX_RESIZE_RETRY_COUNT && (pageRect.width !== width || pageRect.height !== height)) {
                const currentRect = yield _this11._getResponse({ command: _commands2.default.getWindowRect });

                yield _this11._getResponse({
                    command: _commands2.default.setWindowRect,

                    parameters: {
                        x: currentRect.x,
                        y: currentRect.y,
                        width: width + (currentRect.width - pageRect.width),
                        height: height + (currentRect.height - pageRect.height)
                    }
                });

                var _ref4 = yield _this11.executeScript(_clientFunctions.GET_WINDOW_DIMENSIONS_INFO_SCRIPT);

                pageRect = _ref4.value;
            }
        })();
    }

    quit() {
        var _this12 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            yield _this12._getResponse({ command: _commands2.default.quit });
        })();
    }
};
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9icm93c2VyL3Byb3ZpZGVyL2J1aWx0LWluL2RlZGljYXRlZC9maXJlZm94L21hcmlvbmV0dGUtY2xpZW50L2luZGV4LmpzIl0sIm5hbWVzIjpbIkNPTk5FQ1RJT05fVElNRU9VVCIsIkNPTk5FQ1RJT05fUkVUUllfREVMQVkiLCJNQVhfUkVTSVpFX1JFVFJZX0NPVU5UIiwiSEVBREVSX1NFUEFSQVRPUiIsIm1vZHVsZSIsImV4cG9ydHMiLCJNYXJpb25ldHRlQ2xpZW50IiwiY29uc3RydWN0b3IiLCJwb3J0IiwiaG9zdCIsImN1cnJlbnRQYWNrZXROdW1iZXIiLCJldmVudHMiLCJzb2NrZXQiLCJidWZmZXIiLCJCdWZmZXIiLCJhbGxvYyIsImdldFBhY2tldFByb21pc2UiLCJyZXNvbHZlIiwic2VuZFBhY2tldFByb21pc2UiLCJwcm90b2NvbEluZm8iLCJhcHBsaWNhdGlvblR5cGUiLCJtYXJpb25ldHRlUHJvdG9jb2wiLCJzZXNzaW9uSW5mbyIsIl9hdHRlbXB0VG9Db25uZWN0IiwiY29ubmVjdCIsImNvbm5lY3Rpb25Qcm9taXNlIiwicmFjZSIsInRoZW4iLCJjYXRjaCIsInJlbW92ZUFsbExpc3RlbmVycyIsIl9jb25uZWN0U29ja2V0IiwiY29ubmVjdGlvblN0YXJ0VGltZSIsIkRhdGUiLCJub3ciLCJjb25uZWN0ZWQiLCJFcnJvciIsIm9uIiwiX2hhbmRsZU5ld0RhdGEiLCJkYXRhIiwiX3dyaXRlU29ja2V0IiwibWVzc2FnZSIsIndyaXRlIiwiY29uY2F0IiwiZW1pdCIsIl9nZXRQYWNrZXQiLCJoZWFkZXJFbmRJbmRleCIsImluZGV4T2YiLCJwYWNrZXQiLCJsZW5ndGgiLCJOYU4iLCJib2R5IiwicGFyc2VJbnQiLCJ0b1N0cmluZyIsImJvZHlTdGFydEluZGV4IiwiYm9keUVuZEluZGV4IiwiSlNPTiIsInBhcnNlIiwic2xpY2UiLCJfc2VuZFBhY2tldCIsInBheWxvYWQiLCJjb21tYW5kIiwicGFyYW1ldGVycyIsInNlcmlhbGl6ZWQiLCJieXRlTGVuZ3RoIiwiX3Rocm93TWFyaW9uZXR0ZUVycm9yIiwiZXJyb3IiLCJfZ2V0UmVzcG9uc2UiLCJwYWNrZXROdW1iZXIiLCJyZXNwb25zZVBhY2tldCIsIl9nZXRTY3JlZW5zaG90UmF3RGF0YSIsInRha2VTY3JlZW5zaG90IiwiaW5mb1BhY2tldCIsIm5ld1Nlc3Npb24iLCJkaXNwb3NlIiwiZW5kIiwiZXhlY3V0ZVNjcmlwdCIsImNvZGUiLCJzY3JpcHQiLCJnZXRTY3JlZW5zaG90RGF0YSIsImZyYW1lRGF0YSIsImZyb20iLCJ2YWx1ZSIsInNldFdpbmRvd1NpemUiLCJ3aWR0aCIsImhlaWdodCIsInBhZ2VSZWN0IiwiYXR0ZW1wdENvdW50ZXIiLCJjdXJyZW50UmVjdCIsImdldFdpbmRvd1JlY3QiLCJzZXRXaW5kb3dSZWN0IiwieCIsInkiLCJxdWl0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7Ozs7QUFDQTs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7Ozs7O0FBR0EsTUFBTUEscUJBQXlCLEtBQS9CO0FBQ0EsTUFBTUMseUJBQXlCLEdBQS9CO0FBQ0EsTUFBTUMseUJBQXlCLENBQS9CO0FBQ0EsTUFBTUMsbUJBQXlCLEdBQS9COztBQUVBQyxPQUFPQyxPQUFQLEdBQWlCLE1BQU1DLGdCQUFOLENBQXVCO0FBQ3BDQyxnQkFBYUMsT0FBTyxJQUFwQixFQUEwQkMsT0FBTyxXQUFqQyxFQUE4QztBQUMxQyxhQUFLQyxtQkFBTCxHQUEyQixDQUEzQjtBQUNBLGFBQUtDLE1BQUwsR0FBMkIsc0JBQTNCO0FBQ0EsYUFBS0gsSUFBTCxHQUEyQkEsSUFBM0I7QUFDQSxhQUFLQyxJQUFMLEdBQTJCQSxJQUEzQjtBQUNBLGFBQUtHLE1BQUwsR0FBMkIsaUJBQTNCO0FBQ0EsYUFBS0MsTUFBTCxHQUEyQkMsT0FBT0MsS0FBUCxDQUFhLENBQWIsQ0FBM0I7QUFDQSxhQUFLQyxnQkFBTCxHQUEyQixpQkFBUUMsT0FBUixFQUEzQjtBQUNBLGFBQUtDLGlCQUFMLEdBQTJCLGlCQUFRRCxPQUFSLEVBQTNCOztBQUVBLGFBQUtFLFlBQUwsR0FBb0I7QUFDaEJDLDZCQUFvQixFQURKO0FBRWhCQyxnQ0FBb0I7QUFGSixTQUFwQjs7QUFLQSxhQUFLQyxXQUFMLEdBQW1CLElBQW5CO0FBQ0g7O0FBRUtDLHFCQUFOLENBQXlCZixJQUF6QixFQUErQkMsSUFBL0IsRUFBcUM7QUFBQTs7QUFBQTtBQUNqQyxrQkFBS0csTUFBTCxDQUFZWSxPQUFaLENBQW9CaEIsSUFBcEIsRUFBMEJDLElBQTFCOztBQUVBLGtCQUFNZ0Isb0JBQW9CLGlCQUFRQyxJQUFSLENBQWEsQ0FDbkMsOEJBQWUsTUFBS2QsTUFBcEIsRUFBNEIsU0FBNUIsQ0FEbUMsRUFFbkMsOEJBQWUsTUFBS0EsTUFBcEIsRUFBNEIsT0FBNUIsQ0FGbUMsQ0FBYixDQUExQjs7QUFLQSxtQkFBTyxNQUFNYSxrQkFDUkUsSUFEUSxDQUNIO0FBQUEsdUJBQU0sSUFBTjtBQUFBLGFBREcsRUFFUkMsS0FGUSxDQUVGLFlBQU07QUFDVCxzQkFBS2hCLE1BQUwsQ0FBWWlCLGtCQUFaLENBQStCLFNBQS9CO0FBQ0EsdUJBQU8scUJBQU01QixzQkFBTixDQUFQO0FBQ0gsYUFMUSxDQUFiO0FBUmlDO0FBY3BDOztBQUVLNkIsa0JBQU4sQ0FBc0J0QixJQUF0QixFQUE0QkMsSUFBNUIsRUFBa0M7QUFBQTs7QUFBQTtBQUM5QixrQkFBTXNCLHNCQUFzQkMsS0FBS0MsR0FBTCxFQUE1Qjs7QUFFQSxnQkFBSUMsWUFBWSxNQUFNLE9BQUtYLGlCQUFMLENBQXVCZixJQUF2QixFQUE2QkMsSUFBN0IsQ0FBdEI7O0FBRUEsbUJBQU8sQ0FBQ3lCLFNBQUQsSUFBY0YsS0FBS0MsR0FBTCxLQUFhRixtQkFBYixHQUFtQy9CLGtCQUF4RCxFQUNJa0MsWUFBWSxNQUFNLE9BQUtYLGlCQUFMLENBQXVCZixJQUF2QixFQUE2QkMsSUFBN0IsQ0FBbEI7O0FBRUosZ0JBQUksQ0FBQ3lCLFNBQUwsRUFDSSxNQUFNLElBQUlDLEtBQUosQ0FBVSxtQkFBVixDQUFOOztBQUVKLG1CQUFLdkIsTUFBTCxDQUFZd0IsRUFBWixDQUFlLE1BQWYsRUFBdUI7QUFBQSx1QkFBUSxPQUFLQyxjQUFMLENBQW9CQyxJQUFwQixDQUFSO0FBQUEsYUFBdkI7QUFYOEI7QUFZakM7O0FBRUtDLGdCQUFOLENBQW9CQyxPQUFwQixFQUE2QjtBQUFBOztBQUFBO0FBQ3pCLGdCQUFJLENBQUMsT0FBSzVCLE1BQUwsQ0FBWTZCLEtBQVosQ0FBa0JELE9BQWxCLENBQUwsRUFDSSxNQUFNLDhCQUFlLE9BQUs1QixNQUFwQixFQUE0QixPQUE1QixDQUFOO0FBRnFCO0FBRzVCOztBQUVEeUIsbUJBQWdCQyxJQUFoQixFQUFzQjtBQUNsQixZQUFJLENBQUNBLElBQUwsRUFDSTs7QUFFSixhQUFLekIsTUFBTCxHQUFjQyxPQUFPNEIsTUFBUCxDQUFjLENBQUMsS0FBSzdCLE1BQU4sRUFBY3lCLElBQWQsQ0FBZCxDQUFkOztBQUVBLGFBQUszQixNQUFMLENBQVlnQyxJQUFaLENBQWlCLFVBQWpCO0FBQ0g7O0FBRURDLGlCQUFjO0FBQUE7O0FBQ1YsYUFBSzVCLGdCQUFMLEdBQXdCLEtBQUtBLGdCQUFMLENBQXNCVyxJQUF0QixpQ0FBMkIsYUFBWTtBQUMzRCxnQkFBSWtCLGlCQUFpQixPQUFLaEMsTUFBTCxDQUFZaUMsT0FBWixDQUFvQjNDLGdCQUFwQixDQUFyQjs7QUFFQSxtQkFBTzBDLGlCQUFpQixDQUF4QixFQUEyQjtBQUN2QixzQkFBTSw4QkFBZSxPQUFLbEMsTUFBcEIsRUFBNEIsVUFBNUIsQ0FBTjs7QUFFQWtDLGlDQUFpQixPQUFLaEMsTUFBTCxDQUFZaUMsT0FBWixDQUFvQjNDLGdCQUFwQixDQUFqQjtBQUNIOztBQUVELGtCQUFNNEMsU0FBUztBQUNYQyx3QkFBUUMsR0FERztBQUVYQyxzQkFBUTtBQUZHLGFBQWY7O0FBS0FILG1CQUFPQyxNQUFQLEdBQWdCRyxTQUFTLE9BQUt0QyxNQUFMLENBQVl1QyxRQUFaLENBQXFCLE1BQXJCLEVBQTZCLENBQTdCLEVBQWdDUCxjQUFoQyxDQUFULEVBQTBELEVBQTFELEtBQWlFLENBQWpGOztBQUVBLGtCQUFNUSxpQkFBaUJSLGlCQUFpQjFDLGlCQUFpQjZDLE1BQXpEO0FBQ0Esa0JBQU1NLGVBQWlCRCxpQkFBaUJOLE9BQU9DLE1BQS9DOztBQUVBLGdCQUFJRCxPQUFPQyxNQUFYLEVBQW1CO0FBQ2YsdUJBQU8sT0FBS25DLE1BQUwsQ0FBWW1DLE1BQVosR0FBcUJNLFlBQTVCLEVBQ0ksTUFBTSw4QkFBZSxPQUFLM0MsTUFBcEIsRUFBNEIsVUFBNUIsQ0FBTjs7QUFFSm9DLHVCQUFPRyxJQUFQLEdBQWNLLEtBQUtDLEtBQUwsQ0FBVyxPQUFLM0MsTUFBTCxDQUFZdUMsUUFBWixDQUFxQixNQUFyQixFQUE2QkMsY0FBN0IsRUFBNkNDLFlBQTdDLENBQVgsQ0FBZDtBQUNIOztBQUVELG1CQUFLekMsTUFBTCxHQUFjLE9BQUtBLE1BQUwsQ0FBWTRDLEtBQVosQ0FBa0JILFlBQWxCLENBQWQ7O0FBRUEsbUJBQU9QLE1BQVA7QUFDSCxTQTdCdUIsRUFBeEI7O0FBK0JBLGVBQU8sS0FBSy9CLGdCQUFaO0FBQ0g7O0FBRUQwQyxnQkFBYUMsT0FBYixFQUFzQjtBQUFBOztBQUNsQixhQUFLekMsaUJBQUwsR0FBeUIsS0FBS0EsaUJBQUwsQ0FBdUJTLElBQXZCLGlDQUE0QixhQUFZO0FBQzdELGtCQUFNdUIsT0FBYSxDQUFDLENBQUQsRUFBSSxPQUFLeEMsbUJBQUwsRUFBSixFQUFnQ2lELFFBQVFDLE9BQXhDLEVBQWlERCxRQUFRRSxVQUF6RCxDQUFuQjtBQUNBLGtCQUFNQyxhQUFhLHlCQUFlWixJQUFmLENBQW5CO0FBQ0Esa0JBQU1WLFVBQWExQixPQUFPaUQsVUFBUCxDQUFrQkQsVUFBbEIsRUFBOEIsTUFBOUIsSUFBd0MzRCxnQkFBeEMsR0FBMkQyRCxVQUE5RTs7QUFFQSxtQkFBS3ZCLFlBQUwsQ0FBa0JDLE9BQWxCO0FBQ0gsU0FOd0IsRUFBekI7O0FBUUEsZUFBTyxLQUFLdEIsaUJBQVo7QUFDSDs7QUFFRDhDLDBCQUF1QkMsS0FBdkIsRUFBOEI7QUFDMUIsY0FBTSxJQUFJOUIsS0FBSixDQUFXLEdBQUU4QixNQUFNQSxLQUFNLEdBQUVBLE1BQU16QixPQUFOLEdBQWdCLE9BQU95QixNQUFNekIsT0FBN0IsR0FBdUMsRUFBRyxFQUFyRSxDQUFOO0FBQ0g7O0FBRUswQixnQkFBTixDQUFvQm5CLE1BQXBCLEVBQTRCO0FBQUE7O0FBQUE7QUFDeEIsa0JBQU1vQixlQUFlLE9BQUt6RCxtQkFBMUI7O0FBRUEsa0JBQU0sT0FBS2dELFdBQUwsQ0FBaUJYLE1BQWpCLENBQU47O0FBRUEsZ0JBQUlxQixpQkFBaUIsTUFBTSxPQUFLeEIsVUFBTCxFQUEzQjs7QUFFQSxtQkFBTyxDQUFDd0IsZUFBZWxCLElBQWhCLElBQXdCa0IsZUFBZWxCLElBQWYsQ0FBb0IsQ0FBcEIsTUFBMkJpQixZQUExRCxFQUNJQyxpQkFBaUIsTUFBTSxPQUFLeEIsVUFBTCxFQUF2Qjs7QUFFSixnQkFBSXdCLGVBQWVsQixJQUFmLENBQW9CLENBQXBCLENBQUosRUFDSSxPQUFLYyxxQkFBTCxDQUEyQkksZUFBZWxCLElBQWYsQ0FBb0IsQ0FBcEIsQ0FBM0I7O0FBRUosbUJBQU9rQixlQUFlbEIsSUFBZixDQUFvQixDQUFwQixDQUFQO0FBYndCO0FBYzNCOztBQUVLbUIseUJBQU4sR0FBK0I7QUFBQTs7QUFBQTtBQUMzQixtQkFBTyxNQUFNLE9BQUtILFlBQUwsQ0FBa0IsRUFBRU4sU0FBUyxtQkFBU1UsY0FBcEIsRUFBbEIsQ0FBYjtBQUQyQjtBQUU5Qjs7QUFFSzlDLFdBQU4sR0FBaUI7QUFBQTs7QUFBQTtBQUNiLGtCQUFNLE9BQUtNLGNBQUwsQ0FBb0IsT0FBS3RCLElBQXpCLEVBQStCLE9BQUtDLElBQXBDLENBQU47O0FBRUEsa0JBQU04RCxhQUFhLE1BQU0sT0FBSzNCLFVBQUwsRUFBekI7O0FBRUEsbUJBQUt6QixZQUFMLEdBQW9CO0FBQ2hCQyxpQ0FBb0JtRCxXQUFXckIsSUFBWCxDQUFnQjlCLGVBRHBCO0FBRWhCQyxvQ0FBb0JrRCxXQUFXckIsSUFBWCxDQUFnQjdCO0FBRnBCLGFBQXBCOztBQUtBLG1CQUFLQyxXQUFMLEdBQW1CLE1BQU0sT0FBSzRDLFlBQUwsQ0FBa0IsRUFBRU4sU0FBUyxtQkFBU1ksVUFBcEIsRUFBbEIsQ0FBekI7QUFWYTtBQVdoQjs7QUFFREMsY0FBVztBQUNQLGFBQUs3RCxNQUFMLENBQVk4RCxHQUFaO0FBQ0EsYUFBSzdELE1BQUwsR0FBYyxJQUFkO0FBQ0g7O0FBRUs4RCxpQkFBTixDQUFxQkMsSUFBckIsRUFBMkI7QUFBQTs7QUFBQTtBQUN2QixtQkFBTyxNQUFNLE9BQUtWLFlBQUwsQ0FBa0I7QUFDM0JOLHlCQUFZLG1CQUFTZSxhQURNO0FBRTNCZCw0QkFBWSxFQUFFZ0IsUUFBUyxXQUFVRCxJQUFLLEtBQTFCO0FBRmUsYUFBbEIsQ0FBYjtBQUR1QjtBQUsxQjs7QUFFS0UscUJBQU4sR0FBMkI7QUFBQTs7QUFBQTtBQUN2QixrQkFBTUMsWUFBWSxNQUFNLFFBQUtWLHFCQUFMLEVBQXhCOztBQUVBLG1CQUFPdkQsT0FBT2tFLElBQVAsQ0FBWUQsVUFBVUUsS0FBdEIsRUFBNkIsUUFBN0IsQ0FBUDtBQUh1QjtBQUkxQjs7QUFFS0MsaUJBQU4sQ0FBcUJDLEtBQXJCLEVBQTRCQyxNQUE1QixFQUFvQztBQUFBOztBQUFBO0FBQUEsd0JBQ04sTUFBTSxRQUFLVCxhQUFMLG9EQURBOztBQUFBLGdCQUNuQlUsUUFEbUIsU0FDMUJKLEtBRDBCOztBQUVoQyxnQkFBSUssaUJBQXNCLENBQTFCOztBQUVBLG1CQUFPQSxtQkFBbUJwRixzQkFBbkIsS0FBOENtRixTQUFTRixLQUFULEtBQW1CQSxLQUFuQixJQUE0QkUsU0FBU0QsTUFBVCxLQUFvQkEsTUFBOUYsQ0FBUCxFQUE4RztBQUMxRyxzQkFBTUcsY0FBYyxNQUFNLFFBQUtyQixZQUFMLENBQWtCLEVBQUVOLFNBQVMsbUJBQVM0QixhQUFwQixFQUFsQixDQUExQjs7QUFFQSxzQkFBTSxRQUFLdEIsWUFBTCxDQUFrQjtBQUNwQk4sNkJBQVMsbUJBQVM2QixhQURFOztBQUdwQjVCLGdDQUFZO0FBQ1I2QiwyQkFBUUgsWUFBWUcsQ0FEWjtBQUVSQywyQkFBUUosWUFBWUksQ0FGWjtBQUdSUiwrQkFBUUEsU0FBU0ksWUFBWUosS0FBWixHQUFvQkUsU0FBU0YsS0FBdEMsQ0FIQTtBQUlSQyxnQ0FBUUEsVUFBVUcsWUFBWUgsTUFBWixHQUFxQkMsU0FBU0QsTUFBeEM7QUFKQTtBQUhRLGlCQUFsQixDQUFOOztBQUgwRyw0QkFjbkYsTUFBTSxRQUFLVCxhQUFMLG9EQWQ2RTs7QUFjaEdVLHdCQWRnRyxTQWN2R0osS0FkdUc7QUFlN0c7QUFuQitCO0FBb0JuQzs7QUFFS1csUUFBTixHQUFjO0FBQUE7O0FBQUE7QUFDVixrQkFBTSxRQUFLMUIsWUFBTCxDQUFrQixFQUFFTixTQUFTLG1CQUFTZ0MsSUFBcEIsRUFBbEIsQ0FBTjtBQURVO0FBRWI7QUE3TG1DLENBQXhDIiwiZmlsZSI6ImJyb3dzZXIvcHJvdmlkZXIvYnVpbHQtaW4vZGVkaWNhdGVkL2ZpcmVmb3gvbWFyaW9uZXR0ZS1jbGllbnQvaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUHJvbWlzZSBmcm9tICdwaW5raWUnO1xuaW1wb3J0IHsgU29ja2V0IH0gZnJvbSAnbmV0JztcbmltcG9ydCBwcm9taXNpZnlFdmVudCBmcm9tICdwcm9taXNpZnktZXZlbnQnO1xuaW1wb3J0IEV2ZW50RW1pdHRlciBmcm9tICdldmVudHMnO1xuaW1wb3J0IGRlbGF5IGZyb20gJy4uLy4uLy4uLy4uLy4uLy4uL3V0aWxzL2RlbGF5JztcbmltcG9ydCB7IEdFVF9XSU5ET1dfRElNRU5TSU9OU19JTkZPX1NDUklQVCB9IGZyb20gJy4uLy4uLy4uLy4uL3V0aWxzL2NsaWVudC1mdW5jdGlvbnMnO1xuaW1wb3J0IENPTU1BTkRTIGZyb20gJy4vY29tbWFuZHMnO1xuXG5cbmNvbnN0IENPTk5FQ1RJT05fVElNRU9VVCAgICAgPSAzMDAwMDtcbmNvbnN0IENPTk5FQ1RJT05fUkVUUllfREVMQVkgPSAzMDA7XG5jb25zdCBNQVhfUkVTSVpFX1JFVFJZX0NPVU5UID0gMjtcbmNvbnN0IEhFQURFUl9TRVBBUkFUT1IgICAgICAgPSAnOic7XG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgTWFyaW9uZXR0ZUNsaWVudCB7XG4gICAgY29uc3RydWN0b3IgKHBvcnQgPSAyODI4LCBob3N0ID0gJzEyNy4wLjAuMScpIHtcbiAgICAgICAgdGhpcy5jdXJyZW50UGFja2V0TnVtYmVyID0gMTtcbiAgICAgICAgdGhpcy5ldmVudHMgICAgICAgICAgICAgID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICAgICAgICB0aGlzLnBvcnQgICAgICAgICAgICAgICAgPSBwb3J0O1xuICAgICAgICB0aGlzLmhvc3QgICAgICAgICAgICAgICAgPSBob3N0O1xuICAgICAgICB0aGlzLnNvY2tldCAgICAgICAgICAgICAgPSBuZXcgU29ja2V0KCk7XG4gICAgICAgIHRoaXMuYnVmZmVyICAgICAgICAgICAgICA9IEJ1ZmZlci5hbGxvYygwKTtcbiAgICAgICAgdGhpcy5nZXRQYWNrZXRQcm9taXNlICAgID0gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICAgIHRoaXMuc2VuZFBhY2tldFByb21pc2UgICA9IFByb21pc2UucmVzb2x2ZSgpO1xuXG4gICAgICAgIHRoaXMucHJvdG9jb2xJbmZvID0ge1xuICAgICAgICAgICAgYXBwbGljYXRpb25UeXBlOiAgICAnJyxcbiAgICAgICAgICAgIG1hcmlvbmV0dGVQcm90b2NvbDogJycsXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5zZXNzaW9uSW5mbyA9IG51bGw7XG4gICAgfVxuXG4gICAgYXN5bmMgX2F0dGVtcHRUb0Nvbm5lY3QgKHBvcnQsIGhvc3QpIHtcbiAgICAgICAgdGhpcy5zb2NrZXQuY29ubmVjdChwb3J0LCBob3N0KTtcblxuICAgICAgICBjb25zdCBjb25uZWN0aW9uUHJvbWlzZSA9IFByb21pc2UucmFjZShbXG4gICAgICAgICAgICBwcm9taXNpZnlFdmVudCh0aGlzLnNvY2tldCwgJ2Nvbm5lY3QnKSxcbiAgICAgICAgICAgIHByb21pc2lmeUV2ZW50KHRoaXMuc29ja2V0LCAnZXJyb3InKVxuICAgICAgICBdKTtcblxuICAgICAgICByZXR1cm4gYXdhaXQgY29ubmVjdGlvblByb21pc2VcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHRydWUpXG4gICAgICAgICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuc29ja2V0LnJlbW92ZUFsbExpc3RlbmVycygnY29ubmVjdCcpO1xuICAgICAgICAgICAgICAgIHJldHVybiBkZWxheShDT05ORUNUSU9OX1JFVFJZX0RFTEFZKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFzeW5jIF9jb25uZWN0U29ja2V0IChwb3J0LCBob3N0KSB7XG4gICAgICAgIGNvbnN0IGNvbm5lY3Rpb25TdGFydFRpbWUgPSBEYXRlLm5vdygpO1xuXG4gICAgICAgIGxldCBjb25uZWN0ZWQgPSBhd2FpdCB0aGlzLl9hdHRlbXB0VG9Db25uZWN0KHBvcnQsIGhvc3QpO1xuXG4gICAgICAgIHdoaWxlICghY29ubmVjdGVkICYmIERhdGUubm93KCkgLSBjb25uZWN0aW9uU3RhcnRUaW1lIDwgQ09OTkVDVElPTl9USU1FT1VUKVxuICAgICAgICAgICAgY29ubmVjdGVkID0gYXdhaXQgdGhpcy5fYXR0ZW1wdFRvQ29ubmVjdChwb3J0LCBob3N0KTtcblxuICAgICAgICBpZiAoIWNvbm5lY3RlZClcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVW5hYmxlIHRvIGNvbm5lY3QnKTtcblxuICAgICAgICB0aGlzLnNvY2tldC5vbignZGF0YScsIGRhdGEgPT4gdGhpcy5faGFuZGxlTmV3RGF0YShkYXRhKSk7XG4gICAgfVxuXG4gICAgYXN5bmMgX3dyaXRlU29ja2V0IChtZXNzYWdlKSB7XG4gICAgICAgIGlmICghdGhpcy5zb2NrZXQud3JpdGUobWVzc2FnZSkpXG4gICAgICAgICAgICBhd2FpdCBwcm9taXNpZnlFdmVudCh0aGlzLnNvY2tldCwgJ2RyYWluJyk7XG4gICAgfVxuXG4gICAgX2hhbmRsZU5ld0RhdGEgKGRhdGEpIHtcbiAgICAgICAgaWYgKCFkYXRhKVxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMuYnVmZmVyID0gQnVmZmVyLmNvbmNhdChbdGhpcy5idWZmZXIsIGRhdGFdKTtcblxuICAgICAgICB0aGlzLmV2ZW50cy5lbWl0KCduZXctZGF0YScpO1xuICAgIH1cblxuICAgIF9nZXRQYWNrZXQgKCkge1xuICAgICAgICB0aGlzLmdldFBhY2tldFByb21pc2UgPSB0aGlzLmdldFBhY2tldFByb21pc2UudGhlbihhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICBsZXQgaGVhZGVyRW5kSW5kZXggPSB0aGlzLmJ1ZmZlci5pbmRleE9mKEhFQURFUl9TRVBBUkFUT1IpO1xuXG4gICAgICAgICAgICB3aGlsZSAoaGVhZGVyRW5kSW5kZXggPCAwKSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgcHJvbWlzaWZ5RXZlbnQodGhpcy5ldmVudHMsICduZXctZGF0YScpO1xuXG4gICAgICAgICAgICAgICAgaGVhZGVyRW5kSW5kZXggPSB0aGlzLmJ1ZmZlci5pbmRleE9mKEhFQURFUl9TRVBBUkFUT1IpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBwYWNrZXQgPSB7XG4gICAgICAgICAgICAgICAgbGVuZ3RoOiBOYU4sXG4gICAgICAgICAgICAgICAgYm9keTogICBudWxsXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBwYWNrZXQubGVuZ3RoID0gcGFyc2VJbnQodGhpcy5idWZmZXIudG9TdHJpbmcoJ3V0ZjgnLCAwLCBoZWFkZXJFbmRJbmRleCksIDEwKSB8fCAwO1xuXG4gICAgICAgICAgICBjb25zdCBib2R5U3RhcnRJbmRleCA9IGhlYWRlckVuZEluZGV4ICsgSEVBREVSX1NFUEFSQVRPUi5sZW5ndGg7XG4gICAgICAgICAgICBjb25zdCBib2R5RW5kSW5kZXggICA9IGJvZHlTdGFydEluZGV4ICsgcGFja2V0Lmxlbmd0aDtcblxuICAgICAgICAgICAgaWYgKHBhY2tldC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICB3aGlsZSAodGhpcy5idWZmZXIubGVuZ3RoIDwgYm9keUVuZEluZGV4KVxuICAgICAgICAgICAgICAgICAgICBhd2FpdCBwcm9taXNpZnlFdmVudCh0aGlzLmV2ZW50cywgJ25ldy1kYXRhJyk7XG5cbiAgICAgICAgICAgICAgICBwYWNrZXQuYm9keSA9IEpTT04ucGFyc2UodGhpcy5idWZmZXIudG9TdHJpbmcoJ3V0ZjgnLCBib2R5U3RhcnRJbmRleCwgYm9keUVuZEluZGV4KSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuYnVmZmVyID0gdGhpcy5idWZmZXIuc2xpY2UoYm9keUVuZEluZGV4KTtcblxuICAgICAgICAgICAgcmV0dXJuIHBhY2tldDtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0UGFja2V0UHJvbWlzZTtcbiAgICB9XG5cbiAgICBfc2VuZFBhY2tldCAocGF5bG9hZCkge1xuICAgICAgICB0aGlzLnNlbmRQYWNrZXRQcm9taXNlID0gdGhpcy5zZW5kUGFja2V0UHJvbWlzZS50aGVuKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGJvZHkgICAgICAgPSBbMCwgdGhpcy5jdXJyZW50UGFja2V0TnVtYmVyKyssIHBheWxvYWQuY29tbWFuZCwgcGF5bG9hZC5wYXJhbWV0ZXJzXTtcbiAgICAgICAgICAgIGNvbnN0IHNlcmlhbGl6ZWQgPSBKU09OLnN0cmluZ2lmeShib2R5KTtcbiAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgICAgPSBCdWZmZXIuYnl0ZUxlbmd0aChzZXJpYWxpemVkLCAndXRmOCcpICsgSEVBREVSX1NFUEFSQVRPUiArIHNlcmlhbGl6ZWQ7XG5cbiAgICAgICAgICAgIHRoaXMuX3dyaXRlU29ja2V0KG1lc3NhZ2UpO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gdGhpcy5zZW5kUGFja2V0UHJvbWlzZTtcbiAgICB9XG5cbiAgICBfdGhyb3dNYXJpb25ldHRlRXJyb3IgKGVycm9yKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgJHtlcnJvci5lcnJvcn0ke2Vycm9yLm1lc3NhZ2UgPyAnOiAnICsgZXJyb3IubWVzc2FnZSA6ICcnfWApO1xuICAgIH1cblxuICAgIGFzeW5jIF9nZXRSZXNwb25zZSAocGFja2V0KSB7XG4gICAgICAgIGNvbnN0IHBhY2tldE51bWJlciA9IHRoaXMuY3VycmVudFBhY2tldE51bWJlcjtcblxuICAgICAgICBhd2FpdCB0aGlzLl9zZW5kUGFja2V0KHBhY2tldCk7XG5cbiAgICAgICAgbGV0IHJlc3BvbnNlUGFja2V0ID0gYXdhaXQgdGhpcy5fZ2V0UGFja2V0KCk7XG5cbiAgICAgICAgd2hpbGUgKCFyZXNwb25zZVBhY2tldC5ib2R5IHx8IHJlc3BvbnNlUGFja2V0LmJvZHlbMV0gIT09IHBhY2tldE51bWJlcilcbiAgICAgICAgICAgIHJlc3BvbnNlUGFja2V0ID0gYXdhaXQgdGhpcy5fZ2V0UGFja2V0KCk7XG5cbiAgICAgICAgaWYgKHJlc3BvbnNlUGFja2V0LmJvZHlbMl0pXG4gICAgICAgICAgICB0aGlzLl90aHJvd01hcmlvbmV0dGVFcnJvcihyZXNwb25zZVBhY2tldC5ib2R5WzJdKTtcblxuICAgICAgICByZXR1cm4gcmVzcG9uc2VQYWNrZXQuYm9keVszXTtcbiAgICB9XG5cbiAgICBhc3luYyBfZ2V0U2NyZWVuc2hvdFJhd0RhdGEgKCkge1xuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5fZ2V0UmVzcG9uc2UoeyBjb21tYW5kOiBDT01NQU5EUy50YWtlU2NyZWVuc2hvdCB9KTtcbiAgICB9XG5cbiAgICBhc3luYyBjb25uZWN0ICgpIHtcbiAgICAgICAgYXdhaXQgdGhpcy5fY29ubmVjdFNvY2tldCh0aGlzLnBvcnQsIHRoaXMuaG9zdCk7XG5cbiAgICAgICAgY29uc3QgaW5mb1BhY2tldCA9IGF3YWl0IHRoaXMuX2dldFBhY2tldCgpO1xuXG4gICAgICAgIHRoaXMucHJvdG9jb2xJbmZvID0ge1xuICAgICAgICAgICAgYXBwbGljYXRpb25UeXBlOiAgICBpbmZvUGFja2V0LmJvZHkuYXBwbGljYXRpb25UeXBlLFxuICAgICAgICAgICAgbWFyaW9uZXR0ZVByb3RvY29sOiBpbmZvUGFja2V0LmJvZHkubWFyaW9uZXR0ZVByb3RvY29sXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5zZXNzaW9uSW5mbyA9IGF3YWl0IHRoaXMuX2dldFJlc3BvbnNlKHsgY29tbWFuZDogQ09NTUFORFMubmV3U2Vzc2lvbiB9KTtcbiAgICB9XG5cbiAgICBkaXNwb3NlICgpIHtcbiAgICAgICAgdGhpcy5zb2NrZXQuZW5kKCk7XG4gICAgICAgIHRoaXMuYnVmZmVyID0gbnVsbDtcbiAgICB9XG5cbiAgICBhc3luYyBleGVjdXRlU2NyaXB0IChjb2RlKSB7XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLl9nZXRSZXNwb25zZSh7XG4gICAgICAgICAgICBjb21tYW5kOiAgICBDT01NQU5EUy5leGVjdXRlU2NyaXB0LFxuICAgICAgICAgICAgcGFyYW1ldGVyczogeyBzY3JpcHQ6IGByZXR1cm4gKCR7Y29kZX0pKClgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYXN5bmMgZ2V0U2NyZWVuc2hvdERhdGEgKCkge1xuICAgICAgICBjb25zdCBmcmFtZURhdGEgPSBhd2FpdCB0aGlzLl9nZXRTY3JlZW5zaG90UmF3RGF0YSgpO1xuXG4gICAgICAgIHJldHVybiBCdWZmZXIuZnJvbShmcmFtZURhdGEudmFsdWUsICdiYXNlNjQnKTtcbiAgICB9XG5cbiAgICBhc3luYyBzZXRXaW5kb3dTaXplICh3aWR0aCwgaGVpZ2h0KSB7XG4gICAgICAgIGxldCB7IHZhbHVlOiBwYWdlUmVjdCB9ID0gYXdhaXQgdGhpcy5leGVjdXRlU2NyaXB0KEdFVF9XSU5ET1dfRElNRU5TSU9OU19JTkZPX1NDUklQVCk7XG4gICAgICAgIGxldCBhdHRlbXB0Q291bnRlciAgICAgID0gMDtcblxuICAgICAgICB3aGlsZSAoYXR0ZW1wdENvdW50ZXIrKyA8IE1BWF9SRVNJWkVfUkVUUllfQ09VTlQgJiYgKHBhZ2VSZWN0LndpZHRoICE9PSB3aWR0aCB8fCBwYWdlUmVjdC5oZWlnaHQgIT09IGhlaWdodCkpIHtcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRSZWN0ID0gYXdhaXQgdGhpcy5fZ2V0UmVzcG9uc2UoeyBjb21tYW5kOiBDT01NQU5EUy5nZXRXaW5kb3dSZWN0IH0pO1xuXG4gICAgICAgICAgICBhd2FpdCB0aGlzLl9nZXRSZXNwb25zZSh7XG4gICAgICAgICAgICAgICAgY29tbWFuZDogQ09NTUFORFMuc2V0V2luZG93UmVjdCxcblxuICAgICAgICAgICAgICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgeDogICAgICBjdXJyZW50UmVjdC54LFxuICAgICAgICAgICAgICAgICAgICB5OiAgICAgIGN1cnJlbnRSZWN0LnksXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiAgd2lkdGggKyAoY3VycmVudFJlY3Qud2lkdGggLSBwYWdlUmVjdC53aWR0aCksXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogaGVpZ2h0ICsgKGN1cnJlbnRSZWN0LmhlaWdodCAtIHBhZ2VSZWN0LmhlaWdodClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgKHsgdmFsdWU6IHBhZ2VSZWN0IH0gPSBhd2FpdCB0aGlzLmV4ZWN1dGVTY3JpcHQoR0VUX1dJTkRPV19ESU1FTlNJT05TX0lORk9fU0NSSVBUKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhc3luYyBxdWl0ICgpIHtcbiAgICAgICAgYXdhaXQgdGhpcy5fZ2V0UmVzcG9uc2UoeyBjb21tYW5kOiBDT01NQU5EUy5xdWl0IH0pO1xuICAgIH1cbn07XG5cbiJdfQ==
