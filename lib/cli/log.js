'use strict';

exports.__esModule = true;

var _tty = require('tty');

var _tty2 = _interopRequireDefault(_tty);

var _elegantSpinner = require('elegant-spinner');

var _elegantSpinner2 = _interopRequireDefault(_elegantSpinner);

var _logUpdateAsyncHook = require('log-update-async-hook');

var _logUpdateAsyncHook2 = _interopRequireDefault(_logUpdateAsyncHook);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _isCi = require('is-ci');

var _isCi2 = _interopRequireDefault(_isCi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// NOTE: To support piping, we use stderr as the log output
// stream, while stdout is used for the report output.
exports.default = {
    animation: null,
    isAnimated: _tty2.default.isatty(1) && !_isCi2.default,

    showSpinner() {
        // NOTE: we can use the spinner only if stderr is a TTY and we are not in CI environment (e.g. TravisCI),
        // otherwise we can't repaint animation frames. Thanks https://github.com/sindresorhus/ora for insight.
        if (this.isAnimated) {
            const spinnerFrame = (0, _elegantSpinner2.default)();

            this.animation = setInterval(() => {
                const frame = _chalk2.default.cyan(spinnerFrame());

                _logUpdateAsyncHook2.default.stderr(frame);
            }, 50);
        }
    },

    hideSpinner(isExit) {
        if (this.animation) {
            clearInterval(this.animation);
            _logUpdateAsyncHook2.default.stderr.clear();

            if (isExit) _logUpdateAsyncHook2.default.stderr.done();

            this.animation = null;
        }
    },

    write(text) {
        const isAnimating = !!this.animation;

        if (isAnimating) this.hideSpinner();

        console.error(text);

        if (isAnimating) this.showSpinner();
    }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jbGkvbG9nLmpzIl0sIm5hbWVzIjpbImFuaW1hdGlvbiIsImlzQW5pbWF0ZWQiLCJpc2F0dHkiLCJzaG93U3Bpbm5lciIsInNwaW5uZXJGcmFtZSIsInNldEludGVydmFsIiwiZnJhbWUiLCJjeWFuIiwic3RkZXJyIiwiaGlkZVNwaW5uZXIiLCJpc0V4aXQiLCJjbGVhckludGVydmFsIiwiY2xlYXIiLCJkb25lIiwid3JpdGUiLCJ0ZXh0IiwiaXNBbmltYXRpbmciLCJjb25zb2xlIiwiZXJyb3IiXSwibWFwcGluZ3MiOiI7Ozs7QUFBQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7QUFFQTtBQUNBO2tCQUNlO0FBQ1hBLGVBQVksSUFERDtBQUVYQyxnQkFBWSxjQUFJQyxNQUFKLENBQVcsQ0FBWCxLQUFpQixlQUZsQjs7QUFJWEMsa0JBQWU7QUFDWDtBQUNBO0FBQ0EsWUFBSSxLQUFLRixVQUFULEVBQXFCO0FBQ2pCLGtCQUFNRyxlQUFlLCtCQUFyQjs7QUFFQSxpQkFBS0osU0FBTCxHQUFpQkssWUFBWSxNQUFNO0FBQy9CLHNCQUFNQyxRQUFRLGdCQUFNQyxJQUFOLENBQVdILGNBQVgsQ0FBZDs7QUFFQSw2Q0FBVUksTUFBVixDQUFpQkYsS0FBakI7QUFDSCxhQUpnQixFQUlkLEVBSmMsQ0FBakI7QUFLSDtBQUNKLEtBaEJVOztBQWtCWEcsZ0JBQWFDLE1BQWIsRUFBcUI7QUFDakIsWUFBSSxLQUFLVixTQUFULEVBQW9CO0FBQ2hCVywwQkFBYyxLQUFLWCxTQUFuQjtBQUNBLHlDQUFVUSxNQUFWLENBQWlCSSxLQUFqQjs7QUFFQSxnQkFBSUYsTUFBSixFQUNJLDZCQUFVRixNQUFWLENBQWlCSyxJQUFqQjs7QUFFSixpQkFBS2IsU0FBTCxHQUFpQixJQUFqQjtBQUNIO0FBQ0osS0E1QlU7O0FBOEJYYyxVQUFPQyxJQUFQLEVBQWE7QUFDVCxjQUFNQyxjQUFjLENBQUMsQ0FBQyxLQUFLaEIsU0FBM0I7O0FBRUEsWUFBSWdCLFdBQUosRUFDSSxLQUFLUCxXQUFMOztBQUVKUSxnQkFBUUMsS0FBUixDQUFjSCxJQUFkOztBQUVBLFlBQUlDLFdBQUosRUFDSSxLQUFLYixXQUFMO0FBQ1A7QUF4Q1UsQyIsImZpbGUiOiJjbGkvbG9nLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR0eSBmcm9tICd0dHknO1xuaW1wb3J0IGVsZWdhbnRTcGlubmVyIGZyb20gJ2VsZWdhbnQtc3Bpbm5lcic7XG5pbXBvcnQgbG9nVXBkYXRlIGZyb20gJ2xvZy11cGRhdGUtYXN5bmMtaG9vayc7XG5pbXBvcnQgY2hhbGsgZnJvbSAnY2hhbGsnO1xuaW1wb3J0IGlzQ0kgZnJvbSAnaXMtY2knO1xuXG4vLyBOT1RFOiBUbyBzdXBwb3J0IHBpcGluZywgd2UgdXNlIHN0ZGVyciBhcyB0aGUgbG9nIG91dHB1dFxuLy8gc3RyZWFtLCB3aGlsZSBzdGRvdXQgaXMgdXNlZCBmb3IgdGhlIHJlcG9ydCBvdXRwdXQuXG5leHBvcnQgZGVmYXVsdCB7XG4gICAgYW5pbWF0aW9uOiAgbnVsbCxcbiAgICBpc0FuaW1hdGVkOiB0dHkuaXNhdHR5KDEpICYmICFpc0NJLFxuXG4gICAgc2hvd1NwaW5uZXIgKCkge1xuICAgICAgICAvLyBOT1RFOiB3ZSBjYW4gdXNlIHRoZSBzcGlubmVyIG9ubHkgaWYgc3RkZXJyIGlzIGEgVFRZIGFuZCB3ZSBhcmUgbm90IGluIENJIGVudmlyb25tZW50IChlLmcuIFRyYXZpc0NJKSxcbiAgICAgICAgLy8gb3RoZXJ3aXNlIHdlIGNhbid0IHJlcGFpbnQgYW5pbWF0aW9uIGZyYW1lcy4gVGhhbmtzIGh0dHBzOi8vZ2l0aHViLmNvbS9zaW5kcmVzb3JodXMvb3JhIGZvciBpbnNpZ2h0LlxuICAgICAgICBpZiAodGhpcy5pc0FuaW1hdGVkKSB7XG4gICAgICAgICAgICBjb25zdCBzcGlubmVyRnJhbWUgPSBlbGVnYW50U3Bpbm5lcigpO1xuXG4gICAgICAgICAgICB0aGlzLmFuaW1hdGlvbiA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBmcmFtZSA9IGNoYWxrLmN5YW4oc3Bpbm5lckZyYW1lKCkpO1xuXG4gICAgICAgICAgICAgICAgbG9nVXBkYXRlLnN0ZGVycihmcmFtZSk7XG4gICAgICAgICAgICB9LCA1MCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgaGlkZVNwaW5uZXIgKGlzRXhpdCkge1xuICAgICAgICBpZiAodGhpcy5hbmltYXRpb24pIHtcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy5hbmltYXRpb24pO1xuICAgICAgICAgICAgbG9nVXBkYXRlLnN0ZGVyci5jbGVhcigpO1xuXG4gICAgICAgICAgICBpZiAoaXNFeGl0KVxuICAgICAgICAgICAgICAgIGxvZ1VwZGF0ZS5zdGRlcnIuZG9uZSgpO1xuXG4gICAgICAgICAgICB0aGlzLmFuaW1hdGlvbiA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgd3JpdGUgKHRleHQpIHtcbiAgICAgICAgY29uc3QgaXNBbmltYXRpbmcgPSAhIXRoaXMuYW5pbWF0aW9uO1xuXG4gICAgICAgIGlmIChpc0FuaW1hdGluZylcbiAgICAgICAgICAgIHRoaXMuaGlkZVNwaW5uZXIoKTtcblxuICAgICAgICBjb25zb2xlLmVycm9yKHRleHQpO1xuXG4gICAgICAgIGlmIChpc0FuaW1hdGluZylcbiAgICAgICAgICAgIHRoaXMuc2hvd1NwaW5uZXIoKTtcbiAgICB9XG59O1xuXG4iXX0=
