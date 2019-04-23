'use strict';

exports.__esModule = true;
exports.TestRunCtorFactory = undefined;

var _pinkie = require('pinkie');

var _pinkie2 = _interopRequireDefault(_pinkie);

var _testRun = require('../test-run');

var _testRun2 = _interopRequireDefault(_testRun);

var _testRunState = require('./test-run-state');

var _testRunState2 = _interopRequireDefault(_testRunState);

var _type = require('../test-run/commands/type');

var _type2 = _interopRequireDefault(_type);

var _service = require('../test-run/commands/service');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const TEST_RUN_ABORTED_MESSAGE = 'The test run has been aborted.';

const TestRunCtorFactory = exports.TestRunCtorFactory = function TestRunCtorFactory(callbacks) {
    const created = callbacks.created,
          done = callbacks.done,
          readyToNext = callbacks.readyToNext;


    return class LiveModeTestRun extends _testRun2.default {
        constructor(test, browserConnection, screenshotCapturer, warningLog, opts) {
            super(test, browserConnection, screenshotCapturer, warningLog, opts);

            created(this, test);

            this.state = _testRunState2.default.created;
            this.finish = null;
            this.stopping = false;
            this.isInRoleInitializing = false;
            this.stopped = false;
        }

        stop() {
            this.stopped = true;
        }

        _useRole(...args) {
            this.isInRoleInitializing = true;

            return super._useRole.apply(this, args).then(res => {
                this.isInRoleInitializing = false;

                return res;
            }).catch(err => {
                this.isInRoleInitializing = false;

                throw err;
            });
        }

        executeCommand(commandToExec, callsite, forced) {
            // NOTE: don't close the page and the session when the last test in the queue is done
            if (commandToExec.type === _type2.default.testDone && !forced) {
                done(this, this.stopped).then(() => this.executeCommand(commandToExec, callsite, true)).then(() => readyToNext(this));

                this.executeCommand(new _service.UnlockPageCommand(), null);

                return _pinkie2.default.resolve();
            }

            if (this.stopped && !this.stopping && !this.isInRoleInitializing) {
                this.stopping = true;

                return _pinkie2.default.reject(new Error(TEST_RUN_ABORTED_MESSAGE));
            }

            return super.executeCommand(commandToExec, callsite);
        }
    };
};
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saXZlL3Rlc3QtcnVuLmpzIl0sIm5hbWVzIjpbIlRFU1RfUlVOX0FCT1JURURfTUVTU0FHRSIsIlRlc3RSdW5DdG9yRmFjdG9yeSIsImNhbGxiYWNrcyIsImNyZWF0ZWQiLCJkb25lIiwicmVhZHlUb05leHQiLCJMaXZlTW9kZVRlc3RSdW4iLCJjb25zdHJ1Y3RvciIsInRlc3QiLCJicm93c2VyQ29ubmVjdGlvbiIsInNjcmVlbnNob3RDYXB0dXJlciIsIndhcm5pbmdMb2ciLCJvcHRzIiwic3RhdGUiLCJmaW5pc2giLCJzdG9wcGluZyIsImlzSW5Sb2xlSW5pdGlhbGl6aW5nIiwic3RvcHBlZCIsInN0b3AiLCJfdXNlUm9sZSIsImFyZ3MiLCJhcHBseSIsInRoZW4iLCJyZXMiLCJjYXRjaCIsImVyciIsImV4ZWN1dGVDb21tYW5kIiwiY29tbWFuZFRvRXhlYyIsImNhbGxzaXRlIiwiZm9yY2VkIiwidHlwZSIsInRlc3REb25lIiwicmVzb2x2ZSIsInJlamVjdCIsIkVycm9yIl0sIm1hcHBpbmdzIjoiOzs7OztBQUFBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFFQSxNQUFNQSwyQkFBMkIsZ0NBQWpDOztBQUVPLE1BQU1DLGtEQUFxQixTQUFyQkEsa0JBQXFCLENBQVVDLFNBQVYsRUFBcUI7QUFBQSxVQUMzQ0MsT0FEMkMsR0FDWkQsU0FEWSxDQUMzQ0MsT0FEMkM7QUFBQSxVQUNsQ0MsSUFEa0MsR0FDWkYsU0FEWSxDQUNsQ0UsSUFEa0M7QUFBQSxVQUM1QkMsV0FENEIsR0FDWkgsU0FEWSxDQUM1QkcsV0FENEI7OztBQUduRCxXQUFPLE1BQU1DLGVBQU4sMkJBQXNDO0FBQ3pDQyxvQkFBYUMsSUFBYixFQUFtQkMsaUJBQW5CLEVBQXNDQyxrQkFBdEMsRUFBMERDLFVBQTFELEVBQXNFQyxJQUF0RSxFQUE0RTtBQUN4RSxrQkFBTUosSUFBTixFQUFZQyxpQkFBWixFQUErQkMsa0JBQS9CLEVBQW1EQyxVQUFuRCxFQUErREMsSUFBL0Q7O0FBRUFULG9CQUFRLElBQVIsRUFBY0ssSUFBZDs7QUFFQSxpQkFBS0ssS0FBTCxHQUE0Qix1QkFBZVYsT0FBM0M7QUFDQSxpQkFBS1csTUFBTCxHQUE0QixJQUE1QjtBQUNBLGlCQUFLQyxRQUFMLEdBQTRCLEtBQTVCO0FBQ0EsaUJBQUtDLG9CQUFMLEdBQTRCLEtBQTVCO0FBQ0EsaUJBQUtDLE9BQUwsR0FBNEIsS0FBNUI7QUFDSDs7QUFFREMsZUFBUTtBQUNKLGlCQUFLRCxPQUFMLEdBQWUsSUFBZjtBQUNIOztBQUVERSxpQkFBVSxHQUFHQyxJQUFiLEVBQW1CO0FBQ2YsaUJBQUtKLG9CQUFMLEdBQTRCLElBQTVCOztBQUVBLG1CQUFPLE1BQU1HLFFBQU4sQ0FBZUUsS0FBZixDQUFxQixJQUFyQixFQUEyQkQsSUFBM0IsRUFDRkUsSUFERSxDQUNHQyxPQUFPO0FBQ1QscUJBQUtQLG9CQUFMLEdBQTRCLEtBQTVCOztBQUVBLHVCQUFPTyxHQUFQO0FBQ0gsYUFMRSxFQU1GQyxLQU5FLENBTUlDLE9BQU87QUFDVixxQkFBS1Qsb0JBQUwsR0FBNEIsS0FBNUI7O0FBRUEsc0JBQU1TLEdBQU47QUFDSCxhQVZFLENBQVA7QUFXSDs7QUFFREMsdUJBQWdCQyxhQUFoQixFQUErQkMsUUFBL0IsRUFBeUNDLE1BQXpDLEVBQWlEO0FBQzdDO0FBQ0EsZ0JBQUlGLGNBQWNHLElBQWQsS0FBdUIsZUFBYUMsUUFBcEMsSUFBZ0QsQ0FBQ0YsTUFBckQsRUFBNkQ7QUFDekR6QixxQkFBSyxJQUFMLEVBQVcsS0FBS2EsT0FBaEIsRUFDS0ssSUFETCxDQUNVLE1BQU0sS0FBS0ksY0FBTCxDQUFvQkMsYUFBcEIsRUFBbUNDLFFBQW5DLEVBQTZDLElBQTdDLENBRGhCLEVBRUtOLElBRkwsQ0FFVSxNQUFNakIsWUFBWSxJQUFaLENBRmhCOztBQUlBLHFCQUFLcUIsY0FBTCxDQUFvQixnQ0FBcEIsRUFBNkMsSUFBN0M7O0FBRUEsdUJBQU8saUJBQVFNLE9BQVIsRUFBUDtBQUNIOztBQUVELGdCQUFJLEtBQUtmLE9BQUwsSUFBZ0IsQ0FBQyxLQUFLRixRQUF0QixJQUNBLENBQUMsS0FBS0Msb0JBRFYsRUFDZ0M7QUFDNUIscUJBQUtELFFBQUwsR0FBZ0IsSUFBaEI7O0FBRUEsdUJBQU8saUJBQVFrQixNQUFSLENBQWUsSUFBSUMsS0FBSixDQUFVbEMsd0JBQVYsQ0FBZixDQUFQO0FBQ0g7O0FBRUQsbUJBQU8sTUFBTTBCLGNBQU4sQ0FBcUJDLGFBQXJCLEVBQW9DQyxRQUFwQyxDQUFQO0FBQ0g7QUFyRHdDLEtBQTdDO0FBdURILENBMURNIiwiZmlsZSI6ImxpdmUvdGVzdC1ydW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUHJvbWlzZSBmcm9tICdwaW5raWUnO1xuaW1wb3J0IFRlc3RSdW4gZnJvbSAnLi4vdGVzdC1ydW4nO1xuaW1wb3J0IFRFU1RfUlVOX1NUQVRFIGZyb20gJy4vdGVzdC1ydW4tc3RhdGUnO1xuaW1wb3J0IENPTU1BTkRfVFlQRSBmcm9tICcuLi90ZXN0LXJ1bi9jb21tYW5kcy90eXBlJztcbmltcG9ydCB7IFVubG9ja1BhZ2VDb21tYW5kIH0gZnJvbSAnLi4vdGVzdC1ydW4vY29tbWFuZHMvc2VydmljZSc7XG5cbmNvbnN0IFRFU1RfUlVOX0FCT1JURURfTUVTU0FHRSA9ICdUaGUgdGVzdCBydW4gaGFzIGJlZW4gYWJvcnRlZC4nO1xuXG5leHBvcnQgY29uc3QgVGVzdFJ1bkN0b3JGYWN0b3J5ID0gZnVuY3Rpb24gKGNhbGxiYWNrcykge1xuICAgIGNvbnN0IHsgY3JlYXRlZCwgZG9uZSwgcmVhZHlUb05leHQgfSA9IGNhbGxiYWNrcztcblxuICAgIHJldHVybiBjbGFzcyBMaXZlTW9kZVRlc3RSdW4gZXh0ZW5kcyBUZXN0UnVuIHtcbiAgICAgICAgY29uc3RydWN0b3IgKHRlc3QsIGJyb3dzZXJDb25uZWN0aW9uLCBzY3JlZW5zaG90Q2FwdHVyZXIsIHdhcm5pbmdMb2csIG9wdHMpIHtcbiAgICAgICAgICAgIHN1cGVyKHRlc3QsIGJyb3dzZXJDb25uZWN0aW9uLCBzY3JlZW5zaG90Q2FwdHVyZXIsIHdhcm5pbmdMb2csIG9wdHMpO1xuXG4gICAgICAgICAgICBjcmVhdGVkKHRoaXMsIHRlc3QpO1xuXG4gICAgICAgICAgICB0aGlzLnN0YXRlICAgICAgICAgICAgICAgID0gVEVTVF9SVU5fU1RBVEUuY3JlYXRlZDtcbiAgICAgICAgICAgIHRoaXMuZmluaXNoICAgICAgICAgICAgICAgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5zdG9wcGluZyAgICAgICAgICAgICA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5pc0luUm9sZUluaXRpYWxpemluZyA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5zdG9wcGVkICAgICAgICAgICAgICA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgc3RvcCAoKSB7XG4gICAgICAgICAgICB0aGlzLnN0b3BwZWQgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgX3VzZVJvbGUgKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIHRoaXMuaXNJblJvbGVJbml0aWFsaXppbmcgPSB0cnVlO1xuXG4gICAgICAgICAgICByZXR1cm4gc3VwZXIuX3VzZVJvbGUuYXBwbHkodGhpcywgYXJncylcbiAgICAgICAgICAgICAgICAudGhlbihyZXMgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmlzSW5Sb2xlSW5pdGlhbGl6aW5nID0gZmFsc2U7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5jYXRjaChlcnIgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmlzSW5Sb2xlSW5pdGlhbGl6aW5nID0gZmFsc2U7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgZXhlY3V0ZUNvbW1hbmQgKGNvbW1hbmRUb0V4ZWMsIGNhbGxzaXRlLCBmb3JjZWQpIHtcbiAgICAgICAgICAgIC8vIE5PVEU6IGRvbid0IGNsb3NlIHRoZSBwYWdlIGFuZCB0aGUgc2Vzc2lvbiB3aGVuIHRoZSBsYXN0IHRlc3QgaW4gdGhlIHF1ZXVlIGlzIGRvbmVcbiAgICAgICAgICAgIGlmIChjb21tYW5kVG9FeGVjLnR5cGUgPT09IENPTU1BTkRfVFlQRS50ZXN0RG9uZSAmJiAhZm9yY2VkKSB7XG4gICAgICAgICAgICAgICAgZG9uZSh0aGlzLCB0aGlzLnN0b3BwZWQpXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHRoaXMuZXhlY3V0ZUNvbW1hbmQoY29tbWFuZFRvRXhlYywgY2FsbHNpdGUsIHRydWUpKVxuICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiByZWFkeVRvTmV4dCh0aGlzKSk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmV4ZWN1dGVDb21tYW5kKG5ldyBVbmxvY2tQYWdlQ29tbWFuZCgpLCBudWxsKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoaXMuc3RvcHBlZCAmJiAhdGhpcy5zdG9wcGluZyAmJlxuICAgICAgICAgICAgICAgICF0aGlzLmlzSW5Sb2xlSW5pdGlhbGl6aW5nKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdG9wcGluZyA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKFRFU1RfUlVOX0FCT1JURURfTUVTU0FHRSkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gc3VwZXIuZXhlY3V0ZUNvbW1hbmQoY29tbWFuZFRvRXhlYywgY2FsbHNpdGUpO1xuICAgICAgICB9XG4gICAgfTtcbn07XG4iXX0=
