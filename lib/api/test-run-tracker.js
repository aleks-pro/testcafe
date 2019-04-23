'use strict';

exports.__esModule = true;

var _callsite = require('callsite');

var _callsite2 = _interopRequireDefault(_callsite);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const TRACKING_MARK_RE = /^\$\$testcafe_test_run\$\$(\S+)\$\$$/;
const STACK_CAPACITY = 5000;

// Tracker
exports.default = {
    enabled: false,

    activeTestRuns: {},

    _createContextSwitchingFunctionHook(ctxSwitchingFn, patchedArgsCount) {
        const tracker = this;

        return function () {
            const testRunId = tracker.getContextTestRunId();

            if (testRunId) {
                for (let i = 0; i < patchedArgsCount; i++) {
                    if (typeof arguments[i] === 'function') arguments[i] = tracker.addTrackingMarkerToFunction(testRunId, arguments[i]);
                }
            }

            return ctxSwitchingFn.apply(this, arguments);
        };
    },

    _getStackFrames() {
        // NOTE: increase stack capacity to seek deep stack entries
        const savedLimit = Error.stackTraceLimit;

        Error.stackTraceLimit = STACK_CAPACITY;

        const frames = (0, _callsite2.default)();

        Error.stackTraceLimit = savedLimit;

        return frames;
    },

    ensureEnabled() {
        if (!this.enabled) {
            global.setTimeout = this._createContextSwitchingFunctionHook(global.setTimeout, 1);
            global.setInterval = this._createContextSwitchingFunctionHook(global.setInterval, 1);
            global.setImmediate = this._createContextSwitchingFunctionHook(global.setImmediate, 1);
            process.nextTick = this._createContextSwitchingFunctionHook(process.nextTick, 1);

            _promise2.default.prototype.then = this._createContextSwitchingFunctionHook(_promise2.default.prototype.then, 2);
            _promise2.default.prototype.catch = this._createContextSwitchingFunctionHook(_promise2.default.prototype.catch, 1);

            if (global.Promise) {
                global.Promise.prototype.then = this._createContextSwitchingFunctionHook(global.Promise.prototype.then, 2);
                global.Promise.prototype.catch = this._createContextSwitchingFunctionHook(global.Promise.prototype.catch, 1);
            }

            this.enabled = true;
        }
    },

    addTrackingMarkerToFunction(testRunId, fn) {
        const markerFactoryBody = `
            return function $$testcafe_test_run$$${testRunId}$$ () {
                switch (arguments.length) {
                    case 0: return fn.call(this);
                    case 1: return fn.call(this, arguments[0]);
                    case 2: return fn.call(this, arguments[0], arguments[1]);
                    case 3: return fn.call(this, arguments[0], arguments[1], arguments[2]);
                    case 4: return fn.call(this, arguments[0], arguments[1], arguments[2], arguments[3]);
                    default: return fn.apply(this, arguments);
                }
            };
        `;

        return new Function('fn', markerFactoryBody)(fn);
    },

    getContextTestRunId() {
        const frames = this._getStackFrames();

        // OPTIMIZATION: we start traversing from the bottom of the stack,
        // because we'll more likely encounter a marker there.
        // Async/await and Promise machinery executes lots of intrinsics
        // on timers (where we have a marker). And, since a timer initiates a new
        // stack, the marker will be at the very bottom of it.
        for (let i = frames.length - 1; i >= 0; i--) {
            const fnName = frames[i].getFunctionName();
            const match = fnName && fnName.match(TRACKING_MARK_RE);

            if (match) return match[1];
        }

        return null;
    },

    resolveContextTestRun() {
        const testRunId = this.getContextTestRunId();

        return this.activeTestRuns[testRunId];
    }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9hcGkvdGVzdC1ydW4tdHJhY2tlci5qcyJdLCJuYW1lcyI6WyJUUkFDS0lOR19NQVJLX1JFIiwiU1RBQ0tfQ0FQQUNJVFkiLCJlbmFibGVkIiwiYWN0aXZlVGVzdFJ1bnMiLCJfY3JlYXRlQ29udGV4dFN3aXRjaGluZ0Z1bmN0aW9uSG9vayIsImN0eFN3aXRjaGluZ0ZuIiwicGF0Y2hlZEFyZ3NDb3VudCIsInRyYWNrZXIiLCJ0ZXN0UnVuSWQiLCJnZXRDb250ZXh0VGVzdFJ1bklkIiwiaSIsImFyZ3VtZW50cyIsImFkZFRyYWNraW5nTWFya2VyVG9GdW5jdGlvbiIsImFwcGx5IiwiX2dldFN0YWNrRnJhbWVzIiwic2F2ZWRMaW1pdCIsIkVycm9yIiwic3RhY2tUcmFjZUxpbWl0IiwiZnJhbWVzIiwiZW5zdXJlRW5hYmxlZCIsImdsb2JhbCIsInNldFRpbWVvdXQiLCJzZXRJbnRlcnZhbCIsInNldEltbWVkaWF0ZSIsInByb2Nlc3MiLCJuZXh0VGljayIsInByb3RvdHlwZSIsInRoZW4iLCJjYXRjaCIsIlByb21pc2UiLCJmbiIsIm1hcmtlckZhY3RvcnlCb2R5IiwiRnVuY3Rpb24iLCJsZW5ndGgiLCJmbk5hbWUiLCJnZXRGdW5jdGlvbk5hbWUiLCJtYXRjaCIsInJlc29sdmVDb250ZXh0VGVzdFJ1biJdLCJtYXBwaW5ncyI6Ijs7OztBQUFBOzs7O0FBQ0E7Ozs7OztBQUVBLE1BQU1BLG1CQUFtQixzQ0FBekI7QUFDQSxNQUFNQyxpQkFBbUIsSUFBekI7O0FBRUE7a0JBQ2U7QUFDWEMsYUFBUyxLQURFOztBQUdYQyxvQkFBZ0IsRUFITDs7QUFLWEMsd0NBQXFDQyxjQUFyQyxFQUFxREMsZ0JBQXJELEVBQXVFO0FBQ25FLGNBQU1DLFVBQVUsSUFBaEI7O0FBRUEsZUFBTyxZQUFZO0FBQ2Ysa0JBQU1DLFlBQVlELFFBQVFFLG1CQUFSLEVBQWxCOztBQUVBLGdCQUFJRCxTQUFKLEVBQWU7QUFDWCxxQkFBSyxJQUFJRSxJQUFJLENBQWIsRUFB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QUFDckIsY0FBTTdCLFlBQVksS0FBS0MsbUJBQUwsRUFBbEI7O0FBRUEsZUFBTyxLQUFLTixjQUFMLENBQW9CSyxTQUFwQixDQUFQO0FBQ0g7QUE5RlUsQyIsImZpbGUiOiJhcGkvdGVzdC1ydW4tdHJhY2tlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBnZXRTdGFja0ZyYW1lcyBmcm9tICdjYWxsc2l0ZSc7XG5pbXBvcnQgQmFiZWxQcm9taXNlIGZyb20gJ2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9wcm9taXNlJztcblxuY29uc3QgVFJBQ0tJTkdfTUFSS19SRSA9IC9eXFwkXFwkdGVzdGNhZmVfdGVzdF9ydW5cXCRcXCQoXFxTKylcXCRcXCQkLztcbmNvbnN0IFNUQUNLX0NBUEFDSVRZICAgPSA1MDAwO1xuXG4vLyBUcmFja2VyXG5leHBvcnQgZGVmYXVsdCB7XG4gICAgZW5hYmxlZDogZmFsc2UsXG5cbiAgICBhY3RpdmVUZXN0UnVuczoge30sXG5cbiAgICBfY3JlYXRlQ29udGV4dFN3aXRjaGluZ0Z1bmN0aW9uSG9vayAoY3R4U3dpdGNoaW5nRm4sIHBhdGNoZWRBcmdzQ291bnQpIHtcbiAgICAgICAgY29uc3QgdHJhY2tlciA9IHRoaXM7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGNvbnN0IHRlc3RSdW5JZCA9IHRyYWNrZXIuZ2V0Q29udGV4dFRlc3RSdW5JZCgpO1xuXG4gICAgICAgICAgICBpZiAodGVzdFJ1bklkKSB7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwYXRjaGVkQXJnc0NvdW50OyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBhcmd1bWVudHNbaV0gPT09ICdmdW5jdGlvbicpXG4gICAgICAgICAgICAgICAgICAgICAgICBhcmd1bWVudHNbaV0gPSB0cmFja2VyLmFkZFRyYWNraW5nTWFya2VyVG9GdW5jdGlvbih0ZXN0UnVuSWQsIGFyZ3VtZW50c1tpXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gY3R4U3dpdGNoaW5nRm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgX2dldFN0YWNrRnJhbWVzICgpIHtcbiAgICAgICAgLy8gTk9URTogaW5jcmVhc2Ugc3RhY2sgY2FwYWNpdHkgdG8gc2VlayBkZWVwIHN0YWNrIGVudHJpZXNcbiAgICAgICAgY29uc3Qgc2F2ZWRMaW1pdCA9IEVycm9yLnN0YWNrVHJhY2VMaW1pdDtcblxuICAgICAgICBFcnJvci5zdGFja1RyYWNlTGltaXQgPSBTVEFDS19DQVBBQ0lUWTtcblxuICAgICAgICBjb25zdCBmcmFtZXMgPSBnZXRTdGFja0ZyYW1lcygpO1xuXG4gICAgICAgIEVycm9yLnN0YWNrVHJhY2VMaW1pdCA9IHNhdmVkTGltaXQ7XG5cbiAgICAgICAgcmV0dXJuIGZyYW1lcztcbiAgICB9LFxuXG4gICAgZW5zdXJlRW5hYmxlZCAoKSB7XG4gICAgICAgIGlmICghdGhpcy5lbmFibGVkKSB7XG4gICAgICAgICAgICBnbG9iYWwuc2V0VGltZW91dCAgID0gdGhpcy5fY3JlYXRlQ29udGV4dFN3aXRjaGluZ0Z1bmN0aW9uSG9vayhnbG9iYWwuc2V0VGltZW91dCwgMSk7XG4gICAgICAgICAgICBnbG9iYWwuc2V0SW50ZXJ2YWwgID0gdGhpcy5fY3JlYXRlQ29udGV4dFN3aXRjaGluZ0Z1bmN0aW9uSG9vayhnbG9iYWwuc2V0SW50ZXJ2YWwsIDEpO1xuICAgICAgICAgICAgZ2xvYmFsLnNldEltbWVkaWF0ZSA9IHRoaXMuX2NyZWF0ZUNvbnRleHRTd2l0Y2hpbmdGdW5jdGlvbkhvb2soZ2xvYmFsLnNldEltbWVkaWF0ZSwgMSk7XG4gICAgICAgICAgICBwcm9jZXNzLm5leHRUaWNrICAgID0gdGhpcy5fY3JlYXRlQ29udGV4dFN3aXRjaGluZ0Z1bmN0aW9uSG9vayhwcm9jZXNzLm5leHRUaWNrLCAxKTtcblxuICAgICAgICAgICAgQmFiZWxQcm9taXNlLnByb3RvdHlwZS50aGVuICA9IHRoaXMuX2NyZWF0ZUNvbnRleHRTd2l0Y2hpbmdGdW5jdGlvbkhvb2soQmFiZWxQcm9taXNlLnByb3RvdHlwZS50aGVuLCAyKTtcbiAgICAgICAgICAgIEJhYmVsUHJvbWlzZS5wcm90b3R5cGUuY2F0Y2ggPSB0aGlzLl9jcmVhdGVDb250ZXh0U3dpdGNoaW5nRnVuY3Rpb25Ib29rKEJhYmVsUHJvbWlzZS5wcm90b3R5cGUuY2F0Y2gsIDEpO1xuXG4gICAgICAgICAgICBpZiAoZ2xvYmFsLlByb21pc2UpIHtcbiAgICAgICAgICAgICAgICBnbG9iYWwuUHJvbWlzZS5wcm90b3R5cGUudGhlbiAgPSB0aGlzLl9jcmVhdGVDb250ZXh0U3dpdGNoaW5nRnVuY3Rpb25Ib29rKGdsb2JhbC5Qcm9taXNlLnByb3RvdHlwZS50aGVuLCAyKTtcbiAgICAgICAgICAgICAgICBnbG9iYWwuUHJvbWlzZS5wcm90b3R5cGUuY2F0Y2ggPSB0aGlzLl9jcmVhdGVDb250ZXh0U3dpdGNoaW5nRnVuY3Rpb25Ib29rKGdsb2JhbC5Qcm9taXNlLnByb3RvdHlwZS5jYXRjaCwgMSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuZW5hYmxlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgYWRkVHJhY2tpbmdNYXJrZXJUb0Z1bmN0aW9uICh0ZXN0UnVuSWQsIGZuKSB7XG4gICAgICAgIGNvbnN0IG1hcmtlckZhY3RvcnlCb2R5ID0gYFxuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICQkdGVzdGNhZmVfdGVzdF9ydW4kJCR7dGVzdFJ1bklkfSQkICgpIHtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAwOiByZXR1cm4gZm4uY2FsbCh0aGlzKTtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAxOiByZXR1cm4gZm4uY2FsbCh0aGlzLCBhcmd1bWVudHNbMF0pO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDI6IHJldHVybiBmbi5jYWxsKHRoaXMsIGFyZ3VtZW50c1swXSwgYXJndW1lbnRzWzFdKTtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAzOiByZXR1cm4gZm4uY2FsbCh0aGlzLCBhcmd1bWVudHNbMF0sIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdKTtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSA0OiByZXR1cm4gZm4uY2FsbCh0aGlzLCBhcmd1bWVudHNbMF0sIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdLCBhcmd1bWVudHNbM10pO1xuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OiByZXR1cm4gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICBgO1xuXG4gICAgICAgIHJldHVybiBuZXcgRnVuY3Rpb24oJ2ZuJywgbWFya2VyRmFjdG9yeUJvZHkpKGZuKTtcbiAgICB9LFxuXG4gICAgZ2V0Q29udGV4dFRlc3RSdW5JZCAoKSB7XG4gICAgICAgIGNvbnN0IGZyYW1lcyA9IHRoaXMuX2dldFN0YWNrRnJhbWVzKCk7XG5cbiAgICAgICAgLy8gT1BUSU1JWkFUSU9OOiB3ZSBzdGFydCB0cmF2ZXJzaW5nIGZyb20gdGhlIGJvdHRvbSBvZiB0aGUgc3RhY2ssXG4gICAgICAgIC8vIGJlY2F1c2Ugd2UnbGwgbW9yZSBsaWtlbHkgZW5jb3VudGVyIGEgbWFya2VyIHRoZXJlLlxuICAgICAgICAvLyBBc3luYy9hd2FpdCBhbmQgUHJvbWlzZSBtYWNoaW5lcnkgZXhlY3V0ZXMgbG90cyBvZiBpbnRyaW5zaWNzXG4gICAgICAgIC8vIG9uIHRpbWVycyAod2hlcmUgd2UgaGF2ZSBhIG1hcmtlcikuIEFuZCwgc2luY2UgYSB0aW1lciBpbml0aWF0ZXMgYSBuZXdcbiAgICAgICAgLy8gc3RhY2ssIHRoZSBtYXJrZXIgd2lsbCBiZSBhdCB0aGUgdmVyeSBib3R0b20gb2YgaXQuXG4gICAgICAgIGZvciAobGV0IGkgPSBmcmFtZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICAgIGNvbnN0IGZuTmFtZSA9IGZyYW1lc1tpXS5nZXRGdW5jdGlvbk5hbWUoKTtcbiAgICAgICAgICAgIGNvbnN0IG1hdGNoICA9IGZuTmFtZSAmJiBmbk5hbWUubWF0Y2goVFJBQ0tJTkdfTUFSS19SRSk7XG5cbiAgICAgICAgICAgIGlmIChtYXRjaClcbiAgICAgICAgICAgICAgICByZXR1cm4gbWF0Y2hbMV07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9LFxuXG4gICAgcmVzb2x2ZUNvbnRleHRUZXN0UnVuICgpIHtcbiAgICAgICAgY29uc3QgdGVzdFJ1bklkID0gdGhpcy5nZXRDb250ZXh0VGVzdFJ1bklkKCk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuYWN0aXZlVGVzdFJ1bnNbdGVzdFJ1bklkXTtcbiAgICB9XG59O1xuIl19
