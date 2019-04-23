'use strict';

exports.__esModule = true;

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _lodash = require('lodash');

var _logUpdateAsyncHook = require('log-update-async-hook');

var _logUpdateAsyncHook2 = _interopRequireDefault(_logUpdateAsyncHook);

var _createStackFilter = require('../errors/create-stack-filter');

var _createStackFilter2 = _interopRequireDefault(_createStackFilter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
    messages: [],

    debugLogging: false,

    streamsOverridden: false,

    _overrideStream(stream) {
        const initialWrite = stream.write;

        stream.write = (chunk, encoding, cb) => {
            if (this.debugLogging) initialWrite.call(stream, chunk, encoding, cb);else {
                this.debugLogging = true;

                _logUpdateAsyncHook2.default.clear();
                _logUpdateAsyncHook2.default.done();

                initialWrite.call(stream, chunk, encoding, cb);

                setTimeout(() => this._showAllBreakpoints(), 0);

                this.debugLogging = false;
            }
        };
    },

    _overrideStreams() {
        this._overrideStream(process.stdout);
        this._overrideStream(process.stderr);

        this.streamsOverridden = true;
    },

    _getMessageAsString() {
        let string = '';

        for (var _iterator = this.messages, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : (0, _getIterator3.default)(_iterator);;) {
            var _ref;

            if (_isArray) {
                if (_i >= _iterator.length) break;
                _ref = _iterator[_i++];
            } else {
                _i = _iterator.next();
                if (_i.done) break;
                _ref = _i.value;
            }

            const message = _ref;

            string += message.frame;
        }return string;
    },

    _showAllBreakpoints() {
        if (!this.messages.length) return;

        this.debugLogging = true;
        (0, _logUpdateAsyncHook2.default)(this._getMessageAsString());
        this.debugLogging = false;
    },

    showBreakpoint(testRunId, userAgent, callsite, testError) {
        if (!this.streamsOverridden) this._overrideStreams();

        // NOTE: Raw API does not have callsite.
        const hasCallsite = callsite && callsite.renderSync;

        const callsiteStr = hasCallsite ? callsite.renderSync({
            frameSize: 1,
            stackFilter: (0, _createStackFilter2.default)(Error.stackTraceLimit),
            stack: false
        }) : '';

        const frame = `\n` + `----\n` + `${userAgent}\n` + _chalk2.default.yellow(testError ? 'DEBUGGER PAUSE ON FAILED TEST:' : 'DEBUGGER PAUSE:') + `\n` + `${testError ? testError : callsiteStr}\n` + `----\n`;

        const message = { testRunId, frame };
        const index = (0, _lodash.findIndex)(this.messages, { testRunId });

        if (index === -1) this.messages.push(message);else this.messages[index] = message;

        this._showAllBreakpoints();
    },

    hideBreakpoint(testRunId) {
        const index = (0, _lodash.findIndex)(this.messages, { testRunId });

        if (index !== -1) this.messages.splice(index, 1);

        this._showAllBreakpoints();
    }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ub3RpZmljYXRpb25zL2RlYnVnLWxvZ2dlci5qcyJdLCJuYW1lcyI6WyJtZXNzYWdlcyIsImRlYnVnTG9nZ2luZyIsInN0cmVhbXNPdmVycmlkZGVuIiwiX292ZXJyaWRlU3RyZWFtIiwic3RyZWFtIiwiaW5pdGlhbFdyaXRlIiwid3JpdGUiLCJjaHVuayIsImVuY29kaW5nIiwiY2IiLCJjYWxsIiwiY2xlYXIiLCJkb25lIiwic2V0VGltZW91dCIsIl9zaG93QWxsQnJlYWtwb2ludHMiLCJfb3ZlcnJpZGVTdHJlYW1zIiwicHJvY2VzcyIsInN0ZG91dCIsInN0ZGVyciIsIl9nZXRNZXNzYWdlQXNTdHJpbmciLCJzdHJpbmciLCJtZXNzYWdlIiwiZnJhbWUiLCJsZW5ndGgiLCJzaG93QnJlYWtwb2ludCIsInRlc3RSdW5JZCIsInVzZXJBZ2VudCIsImNhbGxzaXRlIiwidGVzdEVycm9yIiwiaGFzQ2FsbHNpdGUiLCJyZW5kZXJTeW5jIiwiY2FsbHNpdGVTdHIiLCJmcmFtZVNpemUiLCJzdGFja0ZpbHRlciIsIkVycm9yIiwic3RhY2tUcmFjZUxpbWl0Iiwic3RhY2siLCJ5ZWxsb3ciLCJpbmRleCIsInB1c2giLCJoaWRlQnJlYWtwb2ludCIsInNwbGljZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQTs7OztBQUNBOztBQUNBOzs7O0FBQ0E7Ozs7OztrQkFFZTtBQUNYQSxjQUFVLEVBREM7O0FBR1hDLGtCQUFjLEtBSEg7O0FBS1hDLHVCQUFtQixLQUxSOztBQU9YQyxvQkFBaUJDLE1BQWpCLEVBQXlCO0FBQ3JCLGNBQU1DLGVBQWVELE9BQU9FLEtBQTVCOztBQUVBRixlQUFPRSxLQUFQLEdBQWUsQ0FBQ0MsS0FBRCxFQUFRQyxRQUFSLEVBQWtCQyxFQUFsQixLQUF5QjtBQUNwQyxnQkFBSSxLQUFLUixZQUFULEVBQ0lJLGFBQWFLLElBQWIsQ0FBa0JOLE1BQWxCLEVBQTBCRyxLQUExQixFQUFpQ0MsUUFBakMsRUFBMkNDLEVBQTNDLEVBREosS0FFSztBQUNELHFCQUFLUixZQUFMLEdBQW9CLElBQXBCOztBQUVBLDZDQUFVVSxLQUFWO0FBQ0EsNkNBQVVDLElBQVY7O0FBRUFQLDZCQUFhSyxJQUFiLENBQWtCTixNQUFsQixFQUEwQkcsS0FBMUIsRUFBaUNDLFFBQWpDLEVBQTJDQyxFQUEzQzs7QUFFQUksMkJBQVcsTUFBTSxLQUFLQyxtQkFBTCxFQUFqQixFQUE2QyxDQUE3Qzs7QUFFQSxxQkFBS2IsWUFBTCxHQUFvQixLQUFwQjtBQUNIO0FBQ0osU0FmRDtBQWdCSCxLQTFCVTs7QUE0QlhjLHVCQUFvQjtBQUNoQixhQUFLWixlQUFMLENBQXFCYSxRQUFRQyxNQUE3QjtBQUNBLGFBQUtkLGVBQUwsQ0FBcUJhLFFBQVFFLE1BQTdCOztBQUVBLGFBQUtoQixpQkFBTCxHQUF5QixJQUF6QjtBQUNILEtBakNVOztBQW1DWGlCLDBCQUF1QjtBQUNuQixZQUFJQyxTQUFTLEVBQWI7O0FBRUEsNkJBQXNCLEtBQUtwQixRQUEzQjtBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBQUEsa0JBQVdxQixPQUFYOztBQUNJRCxzQkFBVUMsUUFBUUMsS0FBbEI7QUFESixTQUdBLE9BQU9GLE1BQVA7QUFDSCxLQTFDVTs7QUE0Q1hOLDBCQUF1QjtBQUNuQixZQUFJLENBQUMsS0FBS2QsUUFBTCxDQUFjdUIsTUFBbkIsRUFDSTs7QUFFSixhQUFLdEIsWUFBTCxHQUFvQixJQUFwQjtBQUNBLDBDQUFVLEtBQUtrQixtQkFBTCxFQUFWO0FBQ0EsYUFBS2xCLFlBQUwsR0FBb0IsS0FBcEI7QUFDSCxLQW5EVTs7QUFxRFh1QixtQkFBZ0JDLFNBQWhCLEVBQTJCQyxTQUEzQixFQUFzQ0MsUUFBdEMsRUFBZ0RDLFNBQWhELEVBQTJEO0FBQ3ZELFlBQUksQ0FBQyxLQUFLMUIsaUJBQVYsRUFDSSxLQUFLYSxnQkFBTDs7QUFFSjtBQUNBLGNBQU1jLGNBQWNGLFlBQVlBLFNBQVNHLFVBQXpDOztBQUVBLGNBQU1DLGNBQWNGLGNBQWNGLFNBQVNHLFVBQVQsQ0FBb0I7QUFDbERFLHVCQUFhLENBRHFDO0FBRWxEQyx5QkFBYSxpQ0FBa0JDLE1BQU1DLGVBQXhCLENBRnFDO0FBR2xEQyxtQkFBYTtBQUhxQyxTQUFwQixDQUFkLEdBSWYsRUFKTDs7QUFNQSxjQUFNZCxRQUFTLElBQUQsR0FDRCxRQURDLEdBRUQsR0FBRUksU0FBVSxJQUZYLEdBR0YsZ0JBQU1XLE1BQU4sQ0FBYVQsWUFBWSxnQ0FBWixHQUErQyxpQkFBNUQsQ0FIRSxHQUdnRixJQUhoRixHQUlELEdBQUVBLFlBQVlBLFNBQVosR0FBd0JHLFdBQVksSUFKckMsR0FLRCxRQUxiOztBQU9BLGNBQU1WLFVBQVUsRUFBRUksU0FBRixFQUFhSCxLQUFiLEVBQWhCO0FBQ0EsY0FBTWdCLFFBQVUsdUJBQVUsS0FBS3RDLFFBQWYsRUFBeUIsRUFBRXlCLFNBQUYsRUFBekIsQ0FBaEI7O0FBRUEsWUFBSWEsVUFBVSxDQUFDLENBQWYsRUFDSSxLQUFLdEMsUUFBTCxDQUFjdUMsSUFBZCxDQUFtQmxCLE9BQW5CLEVBREosS0FHSSxLQUFLckIsUUFBTCxDQUFjc0MsS0FBZCxJQUF1QmpCLE9BQXZCOztBQUVKLGFBQUtQLG1CQUFMO0FBQ0gsS0FsRlU7O0FBb0ZYMEIsbUJBQWdCZixTQUFoQixFQUEyQjtBQUN2QixjQUFNYSxRQUFRLHVCQUFVLEtBQUt0QyxRQUFmLEVBQXlCLEVBQUV5QixTQUFGLEVBQXpCLENBQWQ7O0FBRUEsWUFBSWEsVUFBVSxDQUFDLENBQWYsRUFDSSxLQUFLdEMsUUFBTCxDQUFjeUMsTUFBZCxDQUFxQkgsS0FBckIsRUFBNEIsQ0FBNUI7O0FBRUosYUFBS3hCLG1CQUFMO0FBQ0g7QUEzRlUsQyIsImZpbGUiOiJub3RpZmljYXRpb25zL2RlYnVnLWxvZ2dlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBjaGFsayBmcm9tICdjaGFsayc7XG5pbXBvcnQgeyBmaW5kSW5kZXggfSBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IGxvZ1VwZGF0ZSBmcm9tICdsb2ctdXBkYXRlLWFzeW5jLWhvb2snO1xuaW1wb3J0IGNyZWF0ZVN0YWNrRmlsdGVyIGZyb20gJy4uL2Vycm9ycy9jcmVhdGUtc3RhY2stZmlsdGVyJztcblxuZXhwb3J0IGRlZmF1bHQge1xuICAgIG1lc3NhZ2VzOiBbXSxcblxuICAgIGRlYnVnTG9nZ2luZzogZmFsc2UsXG5cbiAgICBzdHJlYW1zT3ZlcnJpZGRlbjogZmFsc2UsXG5cbiAgICBfb3ZlcnJpZGVTdHJlYW0gKHN0cmVhbSkge1xuICAgICAgICBjb25zdCBpbml0aWFsV3JpdGUgPSBzdHJlYW0ud3JpdGU7XG5cbiAgICAgICAgc3RyZWFtLndyaXRlID0gKGNodW5rLCBlbmNvZGluZywgY2IpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLmRlYnVnTG9nZ2luZylcbiAgICAgICAgICAgICAgICBpbml0aWFsV3JpdGUuY2FsbChzdHJlYW0sIGNodW5rLCBlbmNvZGluZywgY2IpO1xuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kZWJ1Z0xvZ2dpbmcgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgbG9nVXBkYXRlLmNsZWFyKCk7XG4gICAgICAgICAgICAgICAgbG9nVXBkYXRlLmRvbmUoKTtcblxuICAgICAgICAgICAgICAgIGluaXRpYWxXcml0ZS5jYWxsKHN0cmVhbSwgY2h1bmssIGVuY29kaW5nLCBjYik7XG5cbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMuX3Nob3dBbGxCcmVha3BvaW50cygpLCAwKTtcblxuICAgICAgICAgICAgICAgIHRoaXMuZGVidWdMb2dnaW5nID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIF9vdmVycmlkZVN0cmVhbXMgKCkge1xuICAgICAgICB0aGlzLl9vdmVycmlkZVN0cmVhbShwcm9jZXNzLnN0ZG91dCk7XG4gICAgICAgIHRoaXMuX292ZXJyaWRlU3RyZWFtKHByb2Nlc3Muc3RkZXJyKTtcblxuICAgICAgICB0aGlzLnN0cmVhbXNPdmVycmlkZGVuID0gdHJ1ZTtcbiAgICB9LFxuXG4gICAgX2dldE1lc3NhZ2VBc1N0cmluZyAoKSB7XG4gICAgICAgIGxldCBzdHJpbmcgPSAnJztcblxuICAgICAgICBmb3IgKGNvbnN0IG1lc3NhZ2Ugb2YgdGhpcy5tZXNzYWdlcylcbiAgICAgICAgICAgIHN0cmluZyArPSBtZXNzYWdlLmZyYW1lO1xuXG4gICAgICAgIHJldHVybiBzdHJpbmc7XG4gICAgfSxcblxuICAgIF9zaG93QWxsQnJlYWtwb2ludHMgKCkge1xuICAgICAgICBpZiAoIXRoaXMubWVzc2FnZXMubGVuZ3RoKVxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMuZGVidWdMb2dnaW5nID0gdHJ1ZTtcbiAgICAgICAgbG9nVXBkYXRlKHRoaXMuX2dldE1lc3NhZ2VBc1N0cmluZygpKTtcbiAgICAgICAgdGhpcy5kZWJ1Z0xvZ2dpbmcgPSBmYWxzZTtcbiAgICB9LFxuXG4gICAgc2hvd0JyZWFrcG9pbnQgKHRlc3RSdW5JZCwgdXNlckFnZW50LCBjYWxsc2l0ZSwgdGVzdEVycm9yKSB7XG4gICAgICAgIGlmICghdGhpcy5zdHJlYW1zT3ZlcnJpZGRlbilcbiAgICAgICAgICAgIHRoaXMuX292ZXJyaWRlU3RyZWFtcygpO1xuXG4gICAgICAgIC8vIE5PVEU6IFJhdyBBUEkgZG9lcyBub3QgaGF2ZSBjYWxsc2l0ZS5cbiAgICAgICAgY29uc3QgaGFzQ2FsbHNpdGUgPSBjYWxsc2l0ZSAmJiBjYWxsc2l0ZS5yZW5kZXJTeW5jO1xuXG4gICAgICAgIGNvbnN0IGNhbGxzaXRlU3RyID0gaGFzQ2FsbHNpdGUgPyBjYWxsc2l0ZS5yZW5kZXJTeW5jKHtcbiAgICAgICAgICAgIGZyYW1lU2l6ZTogICAxLFxuICAgICAgICAgICAgc3RhY2tGaWx0ZXI6IGNyZWF0ZVN0YWNrRmlsdGVyKEVycm9yLnN0YWNrVHJhY2VMaW1pdCksXG4gICAgICAgICAgICBzdGFjazogICAgICAgZmFsc2VcbiAgICAgICAgfSkgOiAnJztcblxuICAgICAgICBjb25zdCBmcmFtZSA9IGBcXG5gICtcbiAgICAgICAgICAgICAgICAgICAgYC0tLS1cXG5gICtcbiAgICAgICAgICAgICAgICAgICAgYCR7dXNlckFnZW50fVxcbmAgK1xuICAgICAgICAgICAgICAgICAgICBjaGFsay55ZWxsb3codGVzdEVycm9yID8gJ0RFQlVHR0VSIFBBVVNFIE9OIEZBSUxFRCBURVNUOicgOiAnREVCVUdHRVIgUEFVU0U6JykgKyBgXFxuYCArXG4gICAgICAgICAgICAgICAgICAgIGAke3Rlc3RFcnJvciA/IHRlc3RFcnJvciA6IGNhbGxzaXRlU3RyfVxcbmAgK1xuICAgICAgICAgICAgICAgICAgICBgLS0tLVxcbmA7XG5cbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IHsgdGVzdFJ1bklkLCBmcmFtZSB9O1xuICAgICAgICBjb25zdCBpbmRleCAgID0gZmluZEluZGV4KHRoaXMubWVzc2FnZXMsIHsgdGVzdFJ1bklkIH0pO1xuXG4gICAgICAgIGlmIChpbmRleCA9PT0gLTEpXG4gICAgICAgICAgICB0aGlzLm1lc3NhZ2VzLnB1c2gobWVzc2FnZSk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRoaXMubWVzc2FnZXNbaW5kZXhdID0gbWVzc2FnZTtcblxuICAgICAgICB0aGlzLl9zaG93QWxsQnJlYWtwb2ludHMoKTtcbiAgICB9LFxuXG4gICAgaGlkZUJyZWFrcG9pbnQgKHRlc3RSdW5JZCkge1xuICAgICAgICBjb25zdCBpbmRleCA9IGZpbmRJbmRleCh0aGlzLm1lc3NhZ2VzLCB7IHRlc3RSdW5JZCB9KTtcblxuICAgICAgICBpZiAoaW5kZXggIT09IC0xKVxuICAgICAgICAgICAgdGhpcy5tZXNzYWdlcy5zcGxpY2UoaW5kZXgsIDEpO1xuXG4gICAgICAgIHRoaXMuX3Nob3dBbGxCcmVha3BvaW50cygpO1xuICAgIH1cbn07XG4iXX0=
