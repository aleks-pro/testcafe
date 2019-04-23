'use strict';

exports.__esModule = true;

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _phase = require('../test-run/phase');

var _phase2 = _interopRequireDefault(_phase);

var _types = require('../errors/types');

var _actions = require('./commands/actions');

var _testRun = require('../errors/test-run');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class TestRunBookmark {
    constructor(testRun, role) {
        this.testRun = testRun;
        this.role = role;

        this.url = 'about:blank';
        this.dialogHandler = testRun.activeDialogHandler;
        this.iframeSelector = testRun.activeIframeSelector;
        this.speed = testRun.speed;
        this.pageLoadTimeout = testRun.pageLoadTimeout;
        this.ctx = testRun.ctx;
        this.fixtureCtx = testRun.fixtureCtx;
        this.consoleMessages = testRun.consoleMessages;
    }

    init() {
        var _this = this;

        return (0, _asyncToGenerator3.default)(function* () {
            if (_this.testRun.activeIframeSelector) yield _this.testRun.executeCommand(new _actions.SwitchToMainWindowCommand());

            if (!_this.role.opts.preserveUrl) _this.url = yield _this.testRun.getCurrentUrl();
        })();
    }

    _restoreDialogHandler() {
        var _this2 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            if (_this2.testRun.activeDialogHandler !== _this2.dialogHandler) {
                const restoreDialogCommand = new _actions.SetNativeDialogHandlerCommand({ dialogHandler: { fn: _this2.dialogHandler } });

                yield _this2.testRun.executeCommand(restoreDialogCommand);
            }
        })();
    }

    _restoreSpeed() {
        var _this3 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            if (_this3.testRun.speed !== _this3.speed) {
                const restoreSpeedCommand = new _actions.SetTestSpeedCommand({ speed: _this3.speed });

                yield _this3.testRun.executeCommand(restoreSpeedCommand);
            }
        })();
    }

    _restorePageLoadTimeout() {
        var _this4 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            if (_this4.testRun.pageLoadTimeout !== _this4.pageLoadTimeout) {
                const restorePageLoadTimeoutCommand = new _actions.SetPageLoadTimeoutCommand({ duration: _this4.pageLoadTimeout });

                yield _this4.testRun.executeCommand(restorePageLoadTimeoutCommand);
            }
        })();
    }

    _restoreWorkingFrame() {
        var _this5 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            if (_this5.testRun.activeIframeSelector !== _this5.iframeSelector) {
                const switchWorkingFrameCommand = _this5.iframeSelector ? new _actions.SwitchToIframeCommand({ selector: _this5.iframeSelector }) : new _actions.SwitchToMainWindowCommand();

                try {
                    yield _this5.testRun.executeCommand(switchWorkingFrameCommand);
                } catch (err) {
                    if (err.code === _types.TEST_RUN_ERRORS.actionElementNotFoundError) throw new _testRun.CurrentIframeNotFoundError();

                    if (err.code === _types.TEST_RUN_ERRORS.actionIframeIsNotLoadedError) throw new _testRun.CurrentIframeIsNotLoadedError();

                    throw err;
                }
            }
        })();
    }

    _restorePage(url, stateSnapshot) {
        var _this6 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            const navigateCommand = new _actions.NavigateToCommand({ url, stateSnapshot });

            yield _this6.testRun.executeCommand(navigateCommand);
        })();
    }

    restore(callsite, stateSnapshot) {
        var _this7 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            const prevPhase = _this7.testRun.phase;

            _this7.testRun.phase = _phase2.default.inBookmarkRestore;

            _this7.testRun.ctx = _this7.ctx;
            _this7.testRun.fixtureCtx = _this7.fixtureCtx;
            _this7.testRun.consoleMessages = _this7.consoleMessages;

            try {
                yield _this7._restoreSpeed();
                yield _this7._restorePageLoadTimeout();
                yield _this7._restoreDialogHandler();

                const preserveUrl = _this7.role.opts.preserveUrl;
                const url = preserveUrl ? _this7.role.url : _this7.url;

                yield _this7._restorePage(url, (0, _stringify2.default)(stateSnapshot));

                if (!preserveUrl) yield _this7._restoreWorkingFrame();
            } catch (err) {
                err.callsite = callsite;

                throw err;
            }

            _this7.testRun.phase = prevPhase;
        })();
    }
}
exports.default = TestRunBookmark;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90ZXN0LXJ1bi9ib29rbWFyay5qcyJdLCJuYW1lcyI6WyJUZXN0UnVuQm9va21hcmsiLCJjb25zdHJ1Y3RvciIsInRlc3RSdW4iLCJyb2xlIiwidXJsIiwiZGlhbG9nSGFuZGxlciIsImFjdGl2ZURpYWxvZ0hhbmRsZXIiLCJpZnJhbWVTZWxlY3RvciIsImFjdGl2ZUlmcmFtZVNlbGVjdG9yIiwic3BlZWQiLCJwYWdlTG9hZFRpbWVvdXQiLCJjdHgiLCJmaXh0dXJlQ3R4IiwiY29uc29sZU1lc3NhZ2VzIiwiaW5pdCIsImV4ZWN1dGVDb21tYW5kIiwib3B0cyIsInByZXNlcnZlVXJsIiwiZ2V0Q3VycmVudFVybCIsIl9yZXN0b3JlRGlhbG9nSGFuZGxlciIsInJlc3RvcmVEaWFsb2dDb21tYW5kIiwiZm4iLCJfcmVzdG9yZVNwZWVkIiwicmVzdG9yZVNwZWVkQ29tbWFuZCIsIl9yZXN0b3JlUGFnZUxvYWRUaW1lb3V0IiwicmVzdG9yZVBhZ2VMb2FkVGltZW91dENvbW1hbmQiLCJkdXJhdGlvbiIsIl9yZXN0b3JlV29ya2luZ0ZyYW1lIiwic3dpdGNoV29ya2luZ0ZyYW1lQ29tbWFuZCIsInNlbGVjdG9yIiwiZXJyIiwiY29kZSIsImFjdGlvbkVsZW1lbnROb3RGb3VuZEVycm9yIiwiYWN0aW9uSWZyYW1lSXNOb3RMb2FkZWRFcnJvciIsIl9yZXN0b3JlUGFnZSIsInN0YXRlU25hcHNob3QiLCJuYXZpZ2F0ZUNvbW1hbmQiLCJyZXN0b3JlIiwiY2FsbHNpdGUiLCJwcmV2UGhhc2UiLCJwaGFzZSIsImluQm9va21hcmtSZXN0b3JlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQTs7OztBQUNBOztBQUVBOztBQVNBOzs7O0FBTWUsTUFBTUEsZUFBTixDQUFzQjtBQUNqQ0MsZ0JBQWFDLE9BQWIsRUFBc0JDLElBQXRCLEVBQTRCO0FBQ3hCLGFBQUtELE9BQUwsR0FBZUEsT0FBZjtBQUNBLGFBQUtDLElBQUwsR0FBZUEsSUFBZjs7QUFF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Q0FBTjtBQUhvQztBQUl2Qzs7QUFFS0MsV0FBTixDQUFlQyxRQUFmLEVBQXlCSCxhQUF6QixFQUF3QztBQUFBOztBQUFBO0FBQ3BDLGtCQUFNSSxZQUFZLE9BQUtyQyxPQUFMLENBQWFzQyxLQUEvQjs7QUFFQSxtQkFBS3RDLE9BQUwsQ0FBYXNDLEtBQWIsR0FBcUIsZ0JBQWVDLGlCQUFwQzs7QUFFQSxtQkFBS3ZDLE9BQUwsQ0FBYVMsR0FBYixHQUErQixPQUFLQSxHQUFwQztBQUNBLG1CQUFLVCxPQUFMLENBQWFVLFVBQWIsR0FBK0IsT0FBS0EsVUFBcEM7QUFDQSxtQkFBS1YsT0FBTCxDQUFhVyxlQUFiLEdBQStCLE9BQUtBLGVBQXBDOztBQUVBLGdCQUFJO0FBQ0Esc0JBQU0sT0FBS1MsYUFBTCxFQUFOO0FBQ0Esc0JBQU0sT0FBS0UsdUJBQUwsRUFBTjtBQUNBLHNCQUFNLE9BQUtMLHFCQUFMLEVBQU47O0FBRUEsc0JBQU1GLGNBQWMsT0FBS2QsSUFBTCxDQUFVYSxJQUFWLENBQWVDLFdBQW5DO0FBQ0Esc0JBQU1iLE1BQU1hLGNBQWMsT0FBS2QsSUFBTCxDQUFVQyxHQUF4QixHQUE4QixPQUFLQSxHQUEvQzs7QUFFQSxzQkFBTSxPQUFLOEIsWUFBTCxDQUFrQjlCLEdBQWxCLEVBQXVCLHlCQUFlK0IsYUFBZixDQUF2QixDQUFOOztBQUVBLG9CQUFJLENBQUNsQixXQUFMLEVBQ0ksTUFBTSxPQUFLVSxvQkFBTCxFQUFOO0FBQ1AsYUFaRCxDQWFBLE9BQU9HLEdBQVAsRUFBWTtBQUNSQSxvQkFBSVEsUUFBSixHQUFlQSxRQUFmOztBQUVBLHNCQUFNUixHQUFOO0FBQ0g7O0FBRUQsbUJBQUs1QixPQUFMLENBQWFzQyxLQUFiLEdBQXFCRCxTQUFyQjtBQTVCb0M7QUE2QnZDO0FBdkdnQztrQkFBaEJ2QyxlIiwiZmlsZSI6InRlc3QtcnVuL2Jvb2ttYXJrLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFRFU1RfUlVOX1BIQVNFIGZyb20gJy4uL3Rlc3QtcnVuL3BoYXNlJztcbmltcG9ydCB7IFRFU1RfUlVOX0VSUk9SUyB9IGZyb20gJy4uL2Vycm9ycy90eXBlcyc7XG5cbmltcG9ydCB7XG4gICAgU3dpdGNoVG9NYWluV2luZG93Q29tbWFuZCxcbiAgICBTd2l0Y2hUb0lmcmFtZUNvbW1hbmQsXG4gICAgU2V0TmF0aXZlRGlhbG9nSGFuZGxlckNvbW1hbmQsXG4gICAgU2V0VGVzdFNwZWVkQ29tbWFuZCxcbiAgICBTZXRQYWdlTG9hZFRpbWVvdXRDb21tYW5kLFxuICAgIE5hdmlnYXRlVG9Db21tYW5kXG59IGZyb20gJy4vY29tbWFuZHMvYWN0aW9ucyc7XG5cbmltcG9ydCB7XG4gICAgQ3VycmVudElmcmFtZU5vdEZvdW5kRXJyb3IsXG4gICAgQ3VycmVudElmcmFtZUlzTm90TG9hZGVkRXJyb3Jcbn0gZnJvbSAnLi4vZXJyb3JzL3Rlc3QtcnVuJztcblxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUZXN0UnVuQm9va21hcmsge1xuICAgIGNvbnN0cnVjdG9yICh0ZXN0UnVuLCByb2xlKSB7XG4gICAgICAgIHRoaXMudGVzdFJ1biA9IHRlc3RSdW47XG4gICAgICAgIHRoaXMucm9sZSAgICA9IHJvbGU7XG5cbiAgICAgICAgdGhpcy51cmwgICAgICAgICAgICAgPSAnYWJvdXQ6YmxhbmsnO1xuICAgICAgICB0aGlzLmRpYWxvZ0hhbmRsZXIgICA9IHRlc3RSdW4uYWN0aXZlRGlhbG9nSGFuZGxlcjtcbiAgICAgICAgdGhpcy5pZnJhbWVTZWxlY3RvciAgPSB0ZXN0UnVuLmFjdGl2ZUlmcmFtZVNlbGVjdG9yO1xuICAgICAgICB0aGlzLnNwZWVkICAgICAgICAgICA9IHRlc3RSdW4uc3BlZWQ7XG4gICAgICAgIHRoaXMucGFnZUxvYWRUaW1lb3V0ID0gdGVzdFJ1bi5wYWdlTG9hZFRpbWVvdXQ7XG4gICAgICAgIHRoaXMuY3R4ICAgICAgICAgICAgID0gdGVzdFJ1bi5jdHg7XG4gICAgICAgIHRoaXMuZml4dHVyZUN0eCAgICAgID0gdGVzdFJ1bi5maXh0dXJlQ3R4O1xuICAgICAgICB0aGlzLmNvbnNvbGVNZXNzYWdlcyA9IHRlc3RSdW4uY29uc29sZU1lc3NhZ2VzO1xuICAgIH1cblxuICAgIGFzeW5jIGluaXQgKCkge1xuICAgICAgICBpZiAodGhpcy50ZXN0UnVuLmFjdGl2ZUlmcmFtZVNlbGVjdG9yKVxuICAgICAgICAgICAgYXdhaXQgdGhpcy50ZXN0UnVuLmV4ZWN1dGVDb21tYW5kKG5ldyBTd2l0Y2hUb01haW5XaW5kb3dDb21tYW5kKCkpO1xuXG4gICAgICAgIGlmICghdGhpcy5yb2xlLm9wdHMucHJlc2VydmVVcmwpXG4gICAgICAgICAgICB0aGlzLnVybCA9IGF3YWl0IHRoaXMudGVzdFJ1bi5nZXRDdXJyZW50VXJsKCk7XG4gICAgfVxuXG4gICAgYXN5bmMgX3Jlc3RvcmVEaWFsb2dIYW5kbGVyICgpIHtcbiAgICAgICAgaWYgKHRoaXMudGVzdFJ1bi5hY3RpdmVEaWFsb2dIYW5kbGVyICE9PSB0aGlzLmRpYWxvZ0hhbmRsZXIpIHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3RvcmVEaWFsb2dDb21tYW5kID0gbmV3IFNldE5hdGl2ZURpYWxvZ0hhbmRsZXJDb21tYW5kKHsgZGlhbG9nSGFuZGxlcjogeyBmbjogdGhpcy5kaWFsb2dIYW5kbGVyIH0gfSk7XG5cbiAgICAgICAgICAgIGF3YWl0IHRoaXMudGVzdFJ1bi5leGVjdXRlQ29tbWFuZChyZXN0b3JlRGlhbG9nQ29tbWFuZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhc3luYyBfcmVzdG9yZVNwZWVkICgpIHtcbiAgICAgICAgaWYgKHRoaXMudGVzdFJ1bi5zcGVlZCAhPT0gdGhpcy5zcGVlZCkge1xuICAgICAgICAgICAgY29uc3QgcmVzdG9yZVNwZWVkQ29tbWFuZCA9IG5ldyBTZXRUZXN0U3BlZWRDb21tYW5kKHsgc3BlZWQ6IHRoaXMuc3BlZWQgfSk7XG5cbiAgICAgICAgICAgIGF3YWl0IHRoaXMudGVzdFJ1bi5leGVjdXRlQ29tbWFuZChyZXN0b3JlU3BlZWRDb21tYW5kKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFzeW5jIF9yZXN0b3JlUGFnZUxvYWRUaW1lb3V0ICgpIHtcbiAgICAgICAgaWYgKHRoaXMudGVzdFJ1bi5wYWdlTG9hZFRpbWVvdXQgIT09IHRoaXMucGFnZUxvYWRUaW1lb3V0KSB7XG4gICAgICAgICAgICBjb25zdCByZXN0b3JlUGFnZUxvYWRUaW1lb3V0Q29tbWFuZCA9IG5ldyBTZXRQYWdlTG9hZFRpbWVvdXRDb21tYW5kKHsgZHVyYXRpb246IHRoaXMucGFnZUxvYWRUaW1lb3V0IH0pO1xuXG4gICAgICAgICAgICBhd2FpdCB0aGlzLnRlc3RSdW4uZXhlY3V0ZUNvbW1hbmQocmVzdG9yZVBhZ2VMb2FkVGltZW91dENvbW1hbmQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYXN5bmMgX3Jlc3RvcmVXb3JraW5nRnJhbWUgKCkge1xuICAgICAgICBpZiAodGhpcy50ZXN0UnVuLmFjdGl2ZUlmcmFtZVNlbGVjdG9yICE9PSB0aGlzLmlmcmFtZVNlbGVjdG9yKSB7XG4gICAgICAgICAgICBjb25zdCBzd2l0Y2hXb3JraW5nRnJhbWVDb21tYW5kID0gdGhpcy5pZnJhbWVTZWxlY3RvciA/XG4gICAgICAgICAgICAgICAgbmV3IFN3aXRjaFRvSWZyYW1lQ29tbWFuZCh7IHNlbGVjdG9yOiB0aGlzLmlmcmFtZVNlbGVjdG9yIH0pIDpcbiAgICAgICAgICAgICAgICBuZXcgU3dpdGNoVG9NYWluV2luZG93Q29tbWFuZCgpO1xuXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMudGVzdFJ1bi5leGVjdXRlQ29tbWFuZChzd2l0Y2hXb3JraW5nRnJhbWVDb21tYW5kKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyLmNvZGUgPT09IFRFU1RfUlVOX0VSUk9SUy5hY3Rpb25FbGVtZW50Tm90Rm91bmRFcnJvcilcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEN1cnJlbnRJZnJhbWVOb3RGb3VuZEVycm9yKCk7XG5cbiAgICAgICAgICAgICAgICBpZiAoZXJyLmNvZGUgPT09IFRFU1RfUlVOX0VSUk9SUy5hY3Rpb25JZnJhbWVJc05vdExvYWRlZEVycm9yKVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgQ3VycmVudElmcmFtZUlzTm90TG9hZGVkRXJyb3IoKTtcblxuICAgICAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFzeW5jIF9yZXN0b3JlUGFnZSAodXJsLCBzdGF0ZVNuYXBzaG90KSB7XG4gICAgICAgIGNvbnN0IG5hdmlnYXRlQ29tbWFuZCA9IG5ldyBOYXZpZ2F0ZVRvQ29tbWFuZCh7IHVybCwgc3RhdGVTbmFwc2hvdCB9KTtcblxuICAgICAgICBhd2FpdCB0aGlzLnRlc3RSdW4uZXhlY3V0ZUNvbW1hbmQobmF2aWdhdGVDb21tYW5kKTtcbiAgICB9XG5cbiAgICBhc3luYyByZXN0b3JlIChjYWxsc2l0ZSwgc3RhdGVTbmFwc2hvdCkge1xuICAgICAgICBjb25zdCBwcmV2UGhhc2UgPSB0aGlzLnRlc3RSdW4ucGhhc2U7XG5cbiAgICAgICAgdGhpcy50ZXN0UnVuLnBoYXNlID0gVEVTVF9SVU5fUEhBU0UuaW5Cb29rbWFya1Jlc3RvcmU7XG5cbiAgICAgICAgdGhpcy50ZXN0UnVuLmN0eCAgICAgICAgICAgICA9IHRoaXMuY3R4O1xuICAgICAgICB0aGlzLnRlc3RSdW4uZml4dHVyZUN0eCAgICAgID0gdGhpcy5maXh0dXJlQ3R4O1xuICAgICAgICB0aGlzLnRlc3RSdW4uY29uc29sZU1lc3NhZ2VzID0gdGhpcy5jb25zb2xlTWVzc2FnZXM7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuX3Jlc3RvcmVTcGVlZCgpO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5fcmVzdG9yZVBhZ2VMb2FkVGltZW91dCgpO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5fcmVzdG9yZURpYWxvZ0hhbmRsZXIoKTtcblxuICAgICAgICAgICAgY29uc3QgcHJlc2VydmVVcmwgPSB0aGlzLnJvbGUub3B0cy5wcmVzZXJ2ZVVybDtcbiAgICAgICAgICAgIGNvbnN0IHVybCA9IHByZXNlcnZlVXJsID8gdGhpcy5yb2xlLnVybCA6IHRoaXMudXJsO1xuXG4gICAgICAgICAgICBhd2FpdCB0aGlzLl9yZXN0b3JlUGFnZSh1cmwsIEpTT04uc3RyaW5naWZ5KHN0YXRlU25hcHNob3QpKTtcblxuICAgICAgICAgICAgaWYgKCFwcmVzZXJ2ZVVybClcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLl9yZXN0b3JlV29ya2luZ0ZyYW1lKCk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgZXJyLmNhbGxzaXRlID0gY2FsbHNpdGU7XG5cbiAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMudGVzdFJ1bi5waGFzZSA9IHByZXZQaGFzZTtcbiAgICB9XG59XG4iXX0=
