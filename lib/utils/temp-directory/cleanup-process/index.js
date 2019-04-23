'use strict';

exports.__esModule = true;

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _child_process = require('child_process');

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _promisifyEvent = require('promisify-event');

var _promisifyEvent2 = _interopRequireDefault(_promisifyEvent);

var _pinkie = require('pinkie');

var _pinkie2 = _interopRequireDefault(_pinkie);

var _promisifiedFunctions = require('../../promisified-functions');

var _commands = require('./commands');

var _commands2 = _interopRequireDefault(_commands);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const WORKER_PATH = require.resolve('./worker');
const WORKER_STDIO_CONFIG = ['ignore', 'pipe', 'pipe', 'ipc'];

const DEBUG_LOGGER = (0, _debug2.default)('testcafe:utils:temp-directory:cleanup-process');

class CleanupProcess {
    constructor() {
        this.worker = null;
        this.initialized = false;
        this.initPromise = _pinkie2.default.resolve(void 0);
        this.errorPromise = null;

        this.messageCounter = 0;

        this.pendingResponses = {};
    }

    _sendMessage(id, msg) {
        return _pinkie2.default.race([(0, _promisifiedFunctions.sendMessageToChildProcess)(this.worker, (0, _extends3.default)({ id }, msg)), this._waitProcessError()]);
    }

    _onResponse(response) {
        const pendingResponse = this.pendingResponses[response.id];

        if (response.error) {
            if (pendingResponse) pendingResponse.control.reject(response.error);else this.pendingResponses[response.id] = _pinkie2.default.reject(response.error);
        } else if (pendingResponse) pendingResponse.control.resolve();else this.pendingResponses[response.id] = _pinkie2.default.resolve();
    }

    _waitResponse(id) {
        var _this = this;

        return (0, _asyncToGenerator3.default)(function* () {
            if (!_this.pendingResponses[id]) {
                const promiseControl = {};

                _this.pendingResponses[id] = new _pinkie2.default(function (resolve, reject) {
                    (0, _assign2.default)(promiseControl, { resolve, reject });
                });

                _this.pendingResponses[id].control = promiseControl;
            }

            try {
                yield _this.pendingResponses[id];
            } finally {
                delete _this.pendingResponses[id];
            }
        })();
    }

    _waitResponseForMessage(msg) {
        var _this2 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            const currentId = _this2.messageCounter;

            _this2.messageCounter++;

            yield _this2._sendMessage(currentId, msg);
            yield _this2._waitResponse(currentId);
        })();
    }

    _waitProcessExit() {
        return (0, _promisifyEvent2.default)(this.worker, 'exit').then(exitCode => _pinkie2.default.reject(new Error(`Worker process terminated with code ${exitCode}`)));
    }

    _waitProcessError() {
        if (this.errorPromise) return this.errorPromise;

        this.errorPromise = (0, _promisifyEvent2.default)(this.worker, 'error');

        this.errorPromise.then(() => {
            this.errorPromise = null;
        });

        return this.errorPromise;
    }

    _setupWorkerEventHandlers() {
        this.worker.on('message', message => this._onResponse(message));

        this.worker.stdout.on('data', data => DEBUG_LOGGER('Worker process stdout:\n', String(data)));
        this.worker.stderr.on('data', data => DEBUG_LOGGER('Worker process stderr:\n', String(data)));
    }

    _unrefWorkerProcess() {
        this.worker.unref();
        this.worker.stdout.unref();
        this.worker.stderr.unref();

        const channel = this.worker.channel || this.worker._channel;

        channel.unref();
    }

    _handleProcessError(error) {
        this.initialized = false;

        DEBUG_LOGGER(error);
    }

    init() {
        var _this3 = this;

        this.initPromise = this.initPromise.then((() => {
            var _ref = (0, _asyncToGenerator3.default)(function* (initialized) {
                if (initialized !== void 0) return initialized;

                _this3.worker = (0, _child_process.spawn)(process.argv[0], [WORKER_PATH], { detached: true, stdio: WORKER_STDIO_CONFIG });

                _this3._setupWorkerEventHandlers();
                _this3._unrefWorkerProcess();

                const exitPromise = _this3._waitProcessExit();

                try {
                    yield _pinkie2.default.race([_this3._waitResponseForMessage({ command: _commands2.default.init }), _this3._waitProcessError(), exitPromise]);

                    _this3.initialized = true;

                    exitPromise.catch(function (error) {
                        return _this3._handleProcessError(error);
                    });

                    _this3.worker.on('error', function (error) {
                        return _this3._handleProcessError(error);
                    });
                } catch (e) {
                    DEBUG_LOGGER('Failed to start cleanup process');
                    DEBUG_LOGGER(e);

                    _this3.initialized = false;
                }

                return _this3.initialized;
            });

            return function (_x) {
                return _ref.apply(this, arguments);
            };
        })());

        return this.initPromise;
    }

    addDirectory(path) {
        var _this4 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            if (!_this4.initialized) return;

            try {
                yield _this4._waitResponseForMessage({ command: _commands2.default.add, path });
            } catch (e) {
                DEBUG_LOGGER(`Failed to add the ${path} directory to cleanup process`);
                DEBUG_LOGGER(e);
            }
        })();
    }

    removeDirectory(path) {
        var _this5 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            if (!_this5.initialized) return;

            try {
                yield _this5._waitResponseForMessage({ command: _commands2.default.remove, path });
            } catch (e) {
                DEBUG_LOGGER(`Failed to remove the ${path} directory in cleanup process`);
                DEBUG_LOGGER(e);
            }
        })();
    }
}

exports.default = new CleanupProcess();
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy91dGlscy90ZW1wLWRpcmVjdG9yeS9jbGVhbnVwLXByb2Nlc3MvaW5kZXguanMiXSwibmFtZXMiOlsiV09SS0VSX1BBVEgiLCJyZXF1aXJlIiwicmVzb2x2ZSIsIldPUktFUl9TVERJT19DT05GSUciLCJERUJVR19MT0dHRVIiLCJDbGVhbnVwUHJvY2VzcyIsImNvbnN0cnVjdG9yIiwid29ya2VyIiwiaW5pdGlhbGl6ZWQiLCJpbml0UHJvbWlzZSIsImVycm9yUHJvbWlzZSIsIm1lc3NhZ2VDb3VudGVyIiwicGVuZGluZ1Jlc3BvbnNlcyIsIl9zZW5kTWVzc2FnZSIsImlkIiwibXNnIiwicmFjZSIsIl93YWl0UHJvY2Vzc0Vycm9yIiwiX29uUmVzcG9uc2UiLCJyZXNwb25zZSIsInBlbmRpbmdSZXNwb25zZSIsImVycm9yIiwiY29udHJvbCIsInJlamVjdCIsIl93YWl0UmVzcG9uc2UiLCJwcm9taXNlQ29udHJvbCIsIl93YWl0UmVzcG9uc2VGb3JNZXNzYWdlIiwiY3VycmVudElkIiwiX3dhaXRQcm9jZXNzRXhpdCIsInRoZW4iLCJleGl0Q29kZSIsIkVycm9yIiwiX3NldHVwV29ya2VyRXZlbnRIYW5kbGVycyIsIm9uIiwibWVzc2FnZSIsInN0ZG91dCIsImRhdGEiLCJTdHJpbmciLCJzdGRlcnIiLCJfdW5yZWZXb3JrZXJQcm9jZXNzIiwidW5yZWYiLCJjaGFubmVsIiwiX2NoYW5uZWwiLCJfaGFuZGxlUHJvY2Vzc0Vycm9yIiwiaW5pdCIsInByb2Nlc3MiLCJhcmd2IiwiZGV0YWNoZWQiLCJzdGRpbyIsImV4aXRQcm9taXNlIiwiY29tbWFuZCIsImNhdGNoIiwiZSIsImFkZERpcmVjdG9yeSIsInBhdGgiLCJhZGQiLCJyZW1vdmVEaXJlY3RvcnkiLCJyZW1vdmUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7Ozs7O0FBR0EsTUFBTUEsY0FB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TSxPQUFLa0IsdUJBQUwsQ0FBNkIsRUFBRXdCLFNBQVMsbUJBQVNLLEdBQXBCLEVBQXlCRCxJQUF6QixFQUE3QixDQUFOO0FBQ0gsYUFGRCxDQUdBLE9BQU9GLENBQVAsRUFBVTtBQUNOaEQsNkJBQWMscUJBQW9Ca0QsSUFBSywrQkFBdkM7QUFDQWxELDZCQUFhZ0QsQ0FBYjtBQUNIO0FBVnFCO0FBV3pCOztBQUVLSSxtQkFBTixDQUF1QkYsSUFBdkIsRUFBNkI7QUFBQTs7QUFBQTtBQUN6QixnQkFBSSxDQUFDLE9BQUs5QyxXQUFWLEVBQ0k7O0FBRUosZ0JBQUk7QUFDQSxzQkFBTSxPQUFLa0IsdUJBQUwsQ0FBNkIsRUFBRXdCLFNBQVMsbUJBQVNPLE1BQXBCLEVBQTRCSCxJQUE1QixFQUE3QixDQUFOO0FBQ0gsYUFGRCxDQUdBLE9BQU9GLENBQVAsRUFBVTtBQUNOaEQsNkJBQWMsd0JBQXVCa0QsSUFBSywrQkFBMUM7QUFDQWxELDZCQUFhZ0QsQ0FBYjtBQUNIO0FBVndCO0FBVzVCO0FBdEtnQjs7a0JBeUtOLElBQUkvQyxjQUFKLEUiLCJmaWxlIjoidXRpbHMvdGVtcC1kaXJlY3RvcnkvY2xlYW51cC1wcm9jZXNzL2luZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgc3Bhd24gfSBmcm9tICdjaGlsZF9wcm9jZXNzJztcbmltcG9ydCBkZWJ1ZyBmcm9tICdkZWJ1Zyc7XG5pbXBvcnQgcHJvbWlzaWZ5RXZlbnQgZnJvbSAncHJvbWlzaWZ5LWV2ZW50JztcbmltcG9ydCBQcm9taXNlIGZyb20gJ3BpbmtpZSc7XG5pbXBvcnQgeyBzZW5kTWVzc2FnZVRvQ2hpbGRQcm9jZXNzIH0gZnJvbSAnLi4vLi4vcHJvbWlzaWZpZWQtZnVuY3Rpb25zJztcbmltcG9ydCBDT01NQU5EUyBmcm9tICcuL2NvbW1hbmRzJztcblxuXG5jb25zdCBXT1JLRVJfUEFUSCAgICAgICAgID0gcmVxdWlyZS5yZXNvbHZlKCcuL3dvcmtlcicpO1xuY29uc3QgV09SS0VSX1NURElPX0NPTkZJRyA9IFsnaWdub3JlJywgJ3BpcGUnLCAncGlwZScsICdpcGMnXTtcblxuY29uc3QgREVCVUdfTE9HR0VSID0gZGVidWcoJ3Rlc3RjYWZlOnV0aWxzOnRlbXAtZGlyZWN0b3J5OmNsZWFudXAtcHJvY2VzcycpO1xuXG5jbGFzcyBDbGVhbnVwUHJvY2VzcyB7XG4gICAgY29uc3RydWN0b3IgKCkge1xuICAgICAgICB0aGlzLndvcmtlciAgICAgICA9IG51bGw7XG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZWQgID0gZmFsc2U7XG4gICAgICAgIHRoaXMuaW5pdFByb21pc2UgID0gUHJvbWlzZS5yZXNvbHZlKHZvaWQgMCk7XG4gICAgICAgIHRoaXMuZXJyb3JQcm9taXNlID0gbnVsbDtcblxuICAgICAgICB0aGlzLm1lc3NhZ2VDb3VudGVyID0gMDtcblxuICAgICAgICB0aGlzLnBlbmRpbmdSZXNwb25zZXMgPSB7fTtcbiAgICB9XG5cbiAgICBfc2VuZE1lc3NhZ2UgKGlkLCBtc2cpIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmFjZShbXG4gICAgICAgICAgICBzZW5kTWVzc2FnZVRvQ2hpbGRQcm9jZXNzKHRoaXMud29ya2VyLCB7IGlkLCAuLi5tc2cgfSksXG4gICAgICAgICAgICB0aGlzLl93YWl0UHJvY2Vzc0Vycm9yKClcbiAgICAgICAgXSk7XG4gICAgfVxuXG4gICAgX29uUmVzcG9uc2UgKHJlc3BvbnNlKSB7XG4gICAgICAgIGNvbnN0IHBlbmRpbmdSZXNwb25zZSA9IHRoaXMucGVuZGluZ1Jlc3BvbnNlc1tyZXNwb25zZS5pZF07XG5cbiAgICAgICAgaWYgKHJlc3BvbnNlLmVycm9yKSB7XG4gICAgICAgICAgICBpZiAocGVuZGluZ1Jlc3BvbnNlKVxuICAgICAgICAgICAgICAgIHBlbmRpbmdSZXNwb25zZS5jb250cm9sLnJlamVjdChyZXNwb25zZS5lcnJvcik7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdGhpcy5wZW5kaW5nUmVzcG9uc2VzW3Jlc3BvbnNlLmlkXSA9IFByb21pc2UucmVqZWN0KHJlc3BvbnNlLmVycm9yKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChwZW5kaW5nUmVzcG9uc2UpXG4gICAgICAgICAgICBwZW5kaW5nUmVzcG9uc2UuY29udHJvbC5yZXNvbHZlKCk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRoaXMucGVuZGluZ1Jlc3BvbnNlc1tyZXNwb25zZS5pZF0gPSBQcm9taXNlLnJlc29sdmUoKTtcbiAgICB9XG5cbiAgICBhc3luYyBfd2FpdFJlc3BvbnNlIChpZCkge1xuICAgICAgICBpZiAoIXRoaXMucGVuZGluZ1Jlc3BvbnNlc1tpZF0pIHtcbiAgICAgICAgICAgIGNvbnN0IHByb21pc2VDb250cm9sID0ge307XG5cbiAgICAgICAgICAgIHRoaXMucGVuZGluZ1Jlc3BvbnNlc1tpZF0gPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbihwcm9taXNlQ29udHJvbCwgeyByZXNvbHZlLCByZWplY3QgfSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5wZW5kaW5nUmVzcG9uc2VzW2lkXS5jb250cm9sID0gcHJvbWlzZUNvbnRyb2w7XG4gICAgICAgIH1cblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wZW5kaW5nUmVzcG9uc2VzW2lkXTtcbiAgICAgICAgfVxuICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLnBlbmRpbmdSZXNwb25zZXNbaWRdO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYXN5bmMgX3dhaXRSZXNwb25zZUZvck1lc3NhZ2UgKG1zZykge1xuICAgICAgICBjb25zdCBjdXJyZW50SWQgPSB0aGlzLm1lc3NhZ2VDb3VudGVyO1xuXG4gICAgICAgIHRoaXMubWVzc2FnZUNvdW50ZXIrKztcblxuICAgICAgICBhd2FpdCB0aGlzLl9zZW5kTWVzc2FnZShjdXJyZW50SWQsIG1zZyk7XG4gICAgICAgIGF3YWl0IHRoaXMuX3dhaXRSZXNwb25zZShjdXJyZW50SWQpO1xuICAgIH1cblxuICAgIF93YWl0UHJvY2Vzc0V4aXQgKCkge1xuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5RXZlbnQodGhpcy53b3JrZXIsICdleGl0JylcbiAgICAgICAgICAgIC50aGVuKGV4aXRDb2RlID0+IFByb21pc2UucmVqZWN0KG5ldyBFcnJvcihgV29ya2VyIHByb2Nlc3MgdGVybWluYXRlZCB3aXRoIGNvZGUgJHtleGl0Q29kZX1gKSkpO1xuICAgIH1cblxuICAgIF93YWl0UHJvY2Vzc0Vycm9yICgpIHtcbiAgICAgICAgaWYgKHRoaXMuZXJyb3JQcm9taXNlKVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZXJyb3JQcm9taXNlO1xuXG4gICAgICAgIHRoaXMuZXJyb3JQcm9taXNlID0gcHJvbWlzaWZ5RXZlbnQodGhpcy53b3JrZXIsICdlcnJvcicpO1xuXG4gICAgICAgIHRoaXMuZXJyb3JQcm9taXNlLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5lcnJvclByb21pc2UgPSBudWxsO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gdGhpcy5lcnJvclByb21pc2U7XG4gICAgfVxuXG4gICAgX3NldHVwV29ya2VyRXZlbnRIYW5kbGVycyAoKSB7XG4gICAgICAgIHRoaXMud29ya2VyLm9uKCdtZXNzYWdlJywgbWVzc2FnZSA9PiB0aGlzLl9vblJlc3BvbnNlKG1lc3NhZ2UpKTtcblxuICAgICAgICB0aGlzLndvcmtlci5zdGRvdXQub24oJ2RhdGEnLCBkYXRhID0+IERFQlVHX0xPR0dFUignV29ya2VyIHByb2Nlc3Mgc3Rkb3V0OlxcbicsIFN0cmluZyhkYXRhKSkpO1xuICAgICAgICB0aGlzLndvcmtlci5zdGRlcnIub24oJ2RhdGEnLCBkYXRhID0+IERFQlVHX0xPR0dFUignV29ya2VyIHByb2Nlc3Mgc3RkZXJyOlxcbicsIFN0cmluZyhkYXRhKSkpO1xuICAgIH1cblxuICAgIF91bnJlZldvcmtlclByb2Nlc3MgKCkge1xuICAgICAgICB0aGlzLndvcmtlci51bnJlZigpO1xuICAgICAgICB0aGlzLndvcmtlci5zdGRvdXQudW5yZWYoKTtcbiAgICAgICAgdGhpcy53b3JrZXIuc3RkZXJyLnVucmVmKCk7XG5cbiAgICAgICAgY29uc3QgY2hhbm5lbCA9IHRoaXMud29ya2VyLmNoYW5uZWwgfHwgdGhpcy53b3JrZXIuX2NoYW5uZWw7XG5cbiAgICAgICAgY2hhbm5lbC51bnJlZigpO1xuICAgIH1cblxuICAgIF9oYW5kbGVQcm9jZXNzRXJyb3IgKGVycm9yKSB7XG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSBmYWxzZTtcblxuICAgICAgICBERUJVR19MT0dHRVIoZXJyb3IpO1xuICAgIH1cblxuICAgIGluaXQgKCkge1xuICAgICAgICB0aGlzLmluaXRQcm9taXNlID0gdGhpcy5pbml0UHJvbWlzZVxuICAgICAgICAgICAgLnRoZW4oYXN5bmMgaW5pdGlhbGl6ZWQgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChpbml0aWFsaXplZCAhPT0gdm9pZCAwKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaW5pdGlhbGl6ZWQ7XG5cbiAgICAgICAgICAgICAgICB0aGlzLndvcmtlciA9IHNwYXduKHByb2Nlc3MuYXJndlswXSwgW1dPUktFUl9QQVRIXSwgeyBkZXRhY2hlZDogdHJ1ZSwgc3RkaW86IFdPUktFUl9TVERJT19DT05GSUcgfSk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLl9zZXR1cFdvcmtlckV2ZW50SGFuZGxlcnMoKTtcbiAgICAgICAgICAgICAgICB0aGlzLl91bnJlZldvcmtlclByb2Nlc3MoKTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IGV4aXRQcm9taXNlID0gdGhpcy5fd2FpdFByb2Nlc3NFeGl0KCk7XG5cbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCBQcm9taXNlLnJhY2UoW1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fd2FpdFJlc3BvbnNlRm9yTWVzc2FnZSh7IGNvbW1hbmQ6IENPTU1BTkRTLmluaXQgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl93YWl0UHJvY2Vzc0Vycm9yKCksXG4gICAgICAgICAgICAgICAgICAgICAgICBleGl0UHJvbWlzZVxuICAgICAgICAgICAgICAgICAgICBdKTtcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLmluaXRpYWxpemVkID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgICAgICBleGl0UHJvbWlzZS5jYXRjaChlcnJvciA9PiB0aGlzLl9oYW5kbGVQcm9jZXNzRXJyb3IoZXJyb3IpKTtcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLndvcmtlci5vbignZXJyb3InLCBlcnJvciA9PiB0aGlzLl9oYW5kbGVQcm9jZXNzRXJyb3IoZXJyb3IpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgREVCVUdfTE9HR0VSKCdGYWlsZWQgdG8gc3RhcnQgY2xlYW51cCBwcm9jZXNzJyk7XG4gICAgICAgICAgICAgICAgICAgIERFQlVHX0xPR0dFUihlKTtcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLmluaXRpYWxpemVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuaW5pdGlhbGl6ZWQ7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gdGhpcy5pbml0UHJvbWlzZTtcbiAgICB9XG5cbiAgICBhc3luYyBhZGREaXJlY3RvcnkgKHBhdGgpIHtcbiAgICAgICAgaWYgKCF0aGlzLmluaXRpYWxpemVkKVxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLl93YWl0UmVzcG9uc2VGb3JNZXNzYWdlKHsgY29tbWFuZDogQ09NTUFORFMuYWRkLCBwYXRoIH0pO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICBERUJVR19MT0dHRVIoYEZhaWxlZCB0byBhZGQgdGhlICR7cGF0aH0gZGlyZWN0b3J5IHRvIGNsZWFudXAgcHJvY2Vzc2ApO1xuICAgICAgICAgICAgREVCVUdfTE9HR0VSKGUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYXN5bmMgcmVtb3ZlRGlyZWN0b3J5IChwYXRoKSB7XG4gICAgICAgIGlmICghdGhpcy5pbml0aWFsaXplZClcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5fd2FpdFJlc3BvbnNlRm9yTWVzc2FnZSh7IGNvbW1hbmQ6IENPTU1BTkRTLnJlbW92ZSwgcGF0aCB9KTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgREVCVUdfTE9HR0VSKGBGYWlsZWQgdG8gcmVtb3ZlIHRoZSAke3BhdGh9IGRpcmVjdG9yeSBpbiBjbGVhbnVwIHByb2Nlc3NgKTtcbiAgICAgICAgICAgIERFQlVHX0xPR0dFUihlKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgbmV3IENsZWFudXBQcm9jZXNzKCk7XG4iXX0=
