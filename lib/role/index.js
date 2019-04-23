'use strict';

exports.__esModule = true;

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

exports.createRole = createRole;
exports.createAnonymousRole = createAnonymousRole;

var _events = require('events');

var _nanoid = require('nanoid');

var _nanoid2 = _interopRequireDefault(_nanoid);

var _phase = require('./phase');

var _phase2 = _interopRequireDefault(_phase);

var _typeAssertions = require('../errors/runtime/type-assertions');

var _wrapTestFunction = require('../api/wrap-test-function');

var _wrapTestFunction2 = _interopRequireDefault(_wrapTestFunction);

var _testPageUrl = require('../api/test-page-url');

var _actions = require('../test-run/commands/actions');

var _markerSymbol = require('./marker-symbol');

var _markerSymbol2 = _interopRequireDefault(_markerSymbol);

var _delay = require('../utils/delay');

var _delay2 = _interopRequireDefault(_delay);

var _testcafeHammerhead = require('testcafe-hammerhead');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const COOKIE_SYNC_DELAY = 100;

class Role extends _events.EventEmitter {
    constructor(loginPage, initFn, options = {}) {
        super();

        this[_markerSymbol2.default] = true;

        this.id = (0, _nanoid2.default)(7);
        this.phase = loginPage ? _phase2.default.uninitialized : _phase2.default.initialized;

        this.loginPage = loginPage;
        this.initFn = initFn;
        this.opts = options;

        this.url = null;
        this.stateSnapshot = _testcafeHammerhead.StateSnapshot.empty();
        this.initErr = null;
    }

    _navigateToLoginPage(testRun) {
        var _this = this;

        return (0, _asyncToGenerator3.default)(function* () {
            const navigateCommand = new _actions.NavigateToCommand({ url: _this.loginPage });

            yield testRun.executeCommand(navigateCommand);
        })();
    }

    _storeStateSnapshot(testRun) {
        var _this2 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            if (!_this2.initErr) {
                // NOTE: give Hammerhead time to sync cookies from client
                yield (0, _delay2.default)(COOKIE_SYNC_DELAY);
                _this2.stateSnapshot = yield testRun.getStateSnapshot();
            }
        })();
    }

    _executeInitFn(testRun) {
        var _this3 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            try {
                testRun.disableDebugBreakpoints = false;
                yield _this3.initFn(testRun);
            } catch (err) {
                _this3.initErr = err;
            } finally {
                testRun.disableDebugBreakpoints = true;
            }
        })();
    }

    initialize(testRun) {
        var _this4 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            _this4.phase = _phase2.default.pendingInitialization;

            yield testRun.switchToCleanRun();
            yield _this4._navigateToLoginPage(testRun);
            yield _this4._executeInitFn(testRun);
            yield _this4._storeStateSnapshot(testRun);

            if (_this4.opts.preserveUrl) _this4.url = yield testRun.getCurrentUrl();

            _this4.phase = _phase2.default.initialized;
            _this4.emit('initialized');
        })();
    }
}

function createRole(loginPage, initFn, options = {}) {
    (0, _typeAssertions.assertType)(_typeAssertions.is.string, 'Role', '"loginPage" argument', loginPage);
    (0, _typeAssertions.assertType)(_typeAssertions.is.function, 'Role', '"initFn" argument', initFn);
    (0, _typeAssertions.assertType)(_typeAssertions.is.nonNullObject, 'Role', '"options" argument', options);

    if (options.preserveUrl !== void 0) (0, _typeAssertions.assertType)(_typeAssertions.is.boolean, 'Role', '"preserveUrl" option', options.preserveUrl);

    loginPage = (0, _testPageUrl.resolvePageUrl)(loginPage);
    initFn = (0, _wrapTestFunction2.default)(initFn);

    return new Role(loginPage, initFn, options);
}

function createAnonymousRole() {
    return new Role(null, null);
}
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9yb2xlL2luZGV4LmpzIl0sIm5hbWVzIjpbImNyZWF0ZVJvbGUiLCJjcmVhdGVBbm9ueW1vdXNSb2xlIiwiQ09PS0lFX1NZTkNfREVMQVkiLCJSb2xlIiwiY29uc3RydWN0b3IiLCJsb2dpblBhZ2UiLCJpbml0Rm4iLCJvcHRpb25zIiwiaWQiLCJwaGFzZSIsInVuaW5pdGlhbGl6ZWQiLCJpbml0aWFsaXplZCIsIm9wdHMiLCJ1cmwiLCJzdGF0ZVNuYXBzaG90IiwiZW1wdHkiLCJpbml0RXJyIiwiX25hdmlnYXRlVG9Mb2dpblBhZ2UiLCJ0ZXN0UnVuIiwibmF2aWdhdGVDb21tYW5kIiwiZXhlY3V0ZUNvbW1hbmQiLCJfc3RvcmVTdGF0ZVNuYXBzaG90IiwiZ2V0U3RhdGVTbmFwc2hvdCIsIl9leGVjdXRlSW5pdEZuIiwiZGlzYWJsZURlYnVnQnJlYWtwb2ludHMiLCJlcnIiLCJpbml0aWFsaXplIiwicGVuZGluZ0luaXRpYWxpemF0aW9uIiwic3dpdGNoVG9DbGVhblJ1biIsInByZXNlcnZlVXJsIiwiZ2V0Q3VycmVudFVybCIsImVtaXQiLCJzdHJpbmciLCJmdW5jdGlvbiIsIm5vbk51bGxPYmplY3QiLCJib29sZWFuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztRQTBFZ0JBLFUsR0FBQUEsVTtRQWNBQyxtQixHQUFBQSxtQjs7QUF4RmhCOztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7OztBQUNBOztBQUNBOztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUVBLE1BQU1DLG9CQUFvQixHQUExQjs7QUFFQSxNQUFNQyxJQUFOLDhCQUFnQztBQUM1QkMsZ0JBQWFDLFNBQWIsRUFBd0JDLE1BQXhCLEVBQWdDQyxVQUFVLEVBQTFDLEVBQThDO0FBQzFDOztBQUVBLHVDQUFtQixJQUFuQjs7QUFFQSxhQUFLQyxFQUFMLEdBQWEsc0JBQU8sQ0FBUCxDQUFiO0FBQ0EsYUFBS0MsS0FBTCxHQUFhSixZQUFZLGdCQUFNSyxhQUFsQixHQUFrQyxn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b3J0IHsgRXZlbnRFbWl0dGVyIH0gZnJvbSAnZXZlbnRzJztcbmltcG9ydCBuYW5vaWQgZnJvbSAnbmFub2lkJztcbmltcG9ydCBQSEFTRSBmcm9tICcuL3BoYXNlJztcbmltcG9ydCB7IGFzc2VydFR5cGUsIGlzIH0gZnJvbSAnLi4vZXJyb3JzL3J1bnRpbWUvdHlwZS1hc3NlcnRpb25zJztcbmltcG9ydCB3cmFwVGVzdEZ1bmN0aW9uIGZyb20gJy4uL2FwaS93cmFwLXRlc3QtZnVuY3Rpb24nO1xuaW1wb3J0IHsgcmVzb2x2ZVBhZ2VVcmwgfSBmcm9tICcuLi9hcGkvdGVzdC1wYWdlLXVybCc7XG5pbXBvcnQgeyBOYXZpZ2F0ZVRvQ29tbWFuZCB9IGZyb20gJy4uL3Rlc3QtcnVuL2NvbW1hbmRzL2FjdGlvbnMnO1xuaW1wb3J0IHJvbGVNYXJrZXIgZnJvbSAnLi9tYXJrZXItc3ltYm9sJztcbmltcG9ydCBkZWxheSBmcm9tICcuLi91dGlscy9kZWxheSc7XG5pbXBvcnQgeyBTdGF0ZVNuYXBzaG90IH0gZnJvbSAndGVzdGNhZmUtaGFtbWVyaGVhZCc7XG5cbmNvbnN0IENPT0tJRV9TWU5DX0RFTEFZID0gMTAwO1xuXG5jbGFzcyBSb2xlIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcbiAgICBjb25zdHJ1Y3RvciAobG9naW5QYWdlLCBpbml0Rm4sIG9wdGlvbnMgPSB7fSkge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIHRoaXNbcm9sZU1hcmtlcl0gPSB0cnVlO1xuXG4gICAgICAgIHRoaXMuaWQgICAgPSBuYW5vaWQoNyk7XG4gICAgICAgIHRoaXMucGhhc2UgPSBsb2dpblBhZ2UgPyBQSEFTRS51bmluaXRpYWxpemVkIDogUEhBU0UuaW5pdGlhbGl6ZWQ7XG5cbiAgICAgICAgdGhpcy5sb2dpblBhZ2UgPSBsb2dpblBhZ2U7XG4gICAgICAgIHRoaXMuaW5pdEZuICAgID0gaW5pdEZuO1xuICAgICAgICB0aGlzLm9wdHMgICAgICA9IG9wdGlvbnM7XG5cbiAgICAgICAgdGhpcy51cmwgICAgICAgICAgID0gbnVsbDtcbiAgICAgICAgdGhpcy5zdGF0ZVNuYXBzaG90ID0gU3RhdGVTbmFwc2hvdC5lbXB0eSgpO1xuICAgICAgICB0aGlzLmluaXRFcnIgICAgICAgPSBudWxsO1xuICAgIH1cblxuICAgIGFzeW5jIF9uYXZpZ2F0ZVRvTG9naW5QYWdlICh0ZXN0UnVuKSB7XG4gICAgICAgIGNvbnN0IG5hdmlnYXRlQ29tbWFuZCA9IG5ldyBOYXZpZ2F0ZVRvQ29tbWFuZCh7IHVybDogdGhpcy5sb2dpblBhZ2UgfSk7XG5cbiAgICAgICAgYXdhaXQgdGVzdFJ1bi5leGVjdXRlQ29tbWFuZChuYXZpZ2F0ZUNvbW1hbmQpO1xuICAgIH1cblxuICAgIGFzeW5jIF9zdG9yZVN0YXRlU25hcHNob3QgKHRlc3RSdW4pIHtcbiAgICAgICAgaWYgKCF0aGlzLmluaXRFcnIpIHtcbiAgICAgICAgICAgIC8vIE5PVEU6IGdpdmUgSGFtbWVyaGVhZCB0aW1lIHRvIHN5bmMgY29va2llcyBmcm9tIGNsaWVudFxuICAgICAgICAgICAgYXdhaXQgZGVsYXkoQ09PS0lFX1NZTkNfREVMQVkpO1xuICAgICAgICAgICAgdGhpcy5zdGF0ZVNuYXBzaG90ID0gYXdhaXQgdGVzdFJ1bi5nZXRTdGF0ZVNuYXBzaG90KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhc3luYyBfZXhlY3V0ZUluaXRGbiAodGVzdFJ1bikge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGVzdFJ1bi5kaXNhYmxlRGVidWdCcmVha3BvaW50cyA9IGZhbHNlO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5pbml0Rm4odGVzdFJ1bik7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgdGhpcy5pbml0RXJyID0gZXJyO1xuICAgICAgICB9XG4gICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgdGVzdFJ1bi5kaXNhYmxlRGVidWdCcmVha3BvaW50cyA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhc3luYyBpbml0aWFsaXplICh0ZXN0UnVuKSB7XG4gICAgICAgIHRoaXMucGhhc2UgPSBQSEFTRS5wZW5kaW5nSW5pdGlhbGl6YXRpb247XG5cbiAgICAgICAgYXdhaXQgdGVzdFJ1bi5zd2l0Y2hUb0NsZWFuUnVuKCk7XG4gICAgICAgIGF3YWl0IHRoaXMuX25hdmlnYXRlVG9Mb2dpblBhZ2UodGVzdFJ1bik7XG4gICAgICAgIGF3YWl0IHRoaXMuX2V4ZWN1dGVJbml0Rm4odGVzdFJ1bik7XG4gICAgICAgIGF3YWl0IHRoaXMuX3N0b3JlU3RhdGVTbmFwc2hvdCh0ZXN0UnVuKTtcblxuICAgICAgICBpZiAodGhpcy5vcHRzLnByZXNlcnZlVXJsKVxuICAgICAgICAgICAgdGhpcy51cmwgPSBhd2FpdCB0ZXN0UnVuLmdldEN1cnJlbnRVcmwoKTtcblxuICAgICAgICB0aGlzLnBoYXNlID0gUEhBU0UuaW5pdGlhbGl6ZWQ7XG4gICAgICAgIHRoaXMuZW1pdCgnaW5pdGlhbGl6ZWQnKTtcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVSb2xlIChsb2dpblBhZ2UsIGluaXRGbiwgb3B0aW9ucyA9IHt9KSB7XG4gICAgYXNzZXJ0VHlwZShpcy5zdHJpbmcsICdSb2xlJywgJ1wibG9naW5QYWdlXCIgYXJndW1lbnQnLCBsb2dpblBhZ2UpO1xuICAgIGFzc2VydFR5cGUoaXMuZnVuY3Rpb24sICdSb2xlJywgJ1wiaW5pdEZuXCIgYXJndW1lbnQnLCBpbml0Rm4pO1xuICAgIGFzc2VydFR5cGUoaXMubm9uTnVsbE9iamVjdCwgJ1JvbGUnLCAnXCJvcHRpb25zXCIgYXJndW1lbnQnLCBvcHRpb25zKTtcblxuICAgIGlmIChvcHRpb25zLnByZXNlcnZlVXJsICE9PSB2b2lkIDApXG4gICAgICAgIGFzc2VydFR5cGUoaXMuYm9vbGVhbiwgJ1JvbGUnLCAnXCJwcmVzZXJ2ZVVybFwiIG9wdGlvbicsIG9wdGlvbnMucHJlc2VydmVVcmwpO1xuXG4gICAgbG9naW5QYWdlID0gcmVzb2x2ZVBhZ2VVcmwobG9naW5QYWdlKTtcbiAgICBpbml0Rm4gICAgPSB3cmFwVGVzdEZ1bmN0aW9uKGluaXRGbik7XG5cbiAgICByZXR1cm4gbmV3IFJvbGUobG9naW5QYWdlLCBpbml0Rm4sIG9wdGlvbnMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQW5vbnltb3VzUm9sZSAoKSB7XG4gICAgcmV0dXJuIG5ldyBSb2xlKG51bGwsIG51bGwpO1xufVxuIl19
