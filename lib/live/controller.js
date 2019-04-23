'use strict';

exports.__esModule = true;

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _fileWatcher = require('./file-watcher');

var _fileWatcher2 = _interopRequireDefault(_fileWatcher);

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

var _process = require('process');

var _process2 = _interopRequireDefault(_process);

var _readline = require('readline');

var _readline2 = _interopRequireDefault(_readline);

var _pinkie = require('pinkie');

var _pinkie2 = _interopRequireDefault(_pinkie);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const REQUIRED_MODULE_FOUND_EVENT = 'require-module-found';
const LOCK_KEY_PRESS_TIMEOUT = 1000;

class LiveModeController extends _events2.default {
    constructor(runner) {
        super();

        this.src = null;
        this.running = false;
        this.restarting = false;
        this.watchingPaused = false;
        this.stopping = false;
        this.logger = new _logger2.default();
        this.runner = runner;
        this.lockKeyPress = false;
        this.fileWatcher = null;
        this.rl = null;
    }

    init(files) {
        this._listenKeyPress();
        this._initFileWatching(files);
        this._listenTestRunnerEvents();
        this._setRunning();

        return _pinkie2.default.resolve().then(() => this.logger.writeIntroMessage(files));
    }

    dispose() {
        this.fileWatcher.stop();
        _process2.default.stdin.setRawMode(false);
        this.rl.close();
    }

    _toggleWatching() {
        this.watchingPaused = !this.watchingPaused;

        this.logger.writeToggleWatchingMessage(!this.watchingPaused);
    }

    _stop() {
        if (!this.runner || !this.running) {
            this.logger.writeNothingToStopMessage();

            return _pinkie2.default.resolve();
        }

        this.logger.writeStopRunningMessage();

        return this.runner.suspend().then(() => {
            this.restarting = false;
            this.running = false;
        });
    }

    _restart() {
        if (this.restarting || this.watchingPaused) return _pinkie2.default.resolve();

        this.restarting = true;

        if (this.running) {
            return this._stop().then(() => this.logger.writeTestsFinishedMessage()).then(() => this._runTests());
        }

        return this._runTests();
    }

    _exit() {
        if (this.stopping) return _pinkie2.default.resolve();

        this.logger.writeExitMessage();

        this.stopping = true;

        return this.runner ? this.runner.exit() : _pinkie2.default.resolve();
    }

    _createFileWatcher(src) {
        return new _fileWatcher2.default(src);
    }

    _listenKeyPress() {
        _readline2.default.emitKeypressEvents(_process2.default.stdin);
        if (_process2.default.stdin.isTTY) _process2.default.stdin.setRawMode(true);

        this.rl = _readline2.default.createInterface({
            input: _process2.default.stdin,
            output: _process2.default.stdout
        });

        _process2.default.stdin.on('keypress', (ch, key) => {
            if (this.lockKeyPress) return null;

            this.lockKeyPress = true;

            setTimeout(() => {
                this.lockKeyPress = false;
            }, LOCK_KEY_PRESS_TIMEOUT);

            if (key && key.ctrl) {
                switch (key.name) {
                    case 's':
                        return this._stop();
                    case 'r':
                        return this._restart();
                    case 'c':
                        return this._exit();
                    case 'w':
                        return this._toggleWatching();
                }
            }

            return null;
        });
    }

    _listenTestRunnerEvents() {
        this.runner.on(this.runner.TEST_RUN_DONE_EVENT, e => {
            this.running = false;

            if (!this.restarting) this.logger.writeTestsFinishedMessage();

            if (e.err) this.logger.err(e.err);
        });

        this.runner.on(this.runner.REQUIRED_MODULE_FOUND_EVENT, e => {
            this.emit(REQUIRED_MODULE_FOUND_EVENT, e);
        });
    }

    _initFileWatching(src) {
        this.fileWatcher = this._createFileWatcher(src);

        this.on(REQUIRED_MODULE_FOUND_EVENT, e => this.fileWatcher.addFile(e.filename));

        this.fileWatcher.on(this.fileWatcher.FILE_CHANGED_EVENT, () => this._runTests(true));
    }

    _setRunning() {
        this.running = true;
        this.restarting = false;
    }

    _runTests(sourceChanged) {
        if (this.watchingPaused || this.running) return _pinkie2.default.resolve();

        this._setRunning();

        this.logger.writeRunTestsMessage(sourceChanged);

        return this.runner.runTests();
    }
}

exports.default = LiveModeController;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saXZlL2NvbnRyb2xsZXIuanMiXSwibmFtZXMiOlsiUkVRVUlSRURfTU9EVUxFX0ZPVU5EX0VWRU5UIiwiTE9DS19LRVlfUFJFU1NfVElNRU9VVCIsIkxpdmVNb2RlQ29udHJvbGxlciIsImNvbnN0cnVjdG9yIiwicnVubmVyIiwic3JjIiwicnVubmluZyIsInJlc3RhcnRpbmciLCJ3YXRjaGluZ1BhdXNlZCIsInN0b3BwaW5nIiwibG9nZ2VyIiwibG9ja0tleVByZXNzIiwiZmlsZVdhdGNoZXIiLCJybCIsImluaXQiLCJmaWxlcyIsIl9saXN0ZW5LZXlQcmVzcyIsIl9pbml0RmlsZVdhdGNoaW5nIiwiX2xpc3RlblRlc3RSdW5uZXJFdmVudHMiLCJfc2V0UnVubmluZyIsInJlc29sdmUiLCJ0aGVuIiwid3JpdGVJbnRyb01lc3NhZ2UiLCJkaXNwb3NlIiwic3RvcCIsInN0ZGluIiwic2V0UmF3TW9kZSIsImNsb3NlIiwiX3RvZ2dsZVdhdGNoaW5nIiwid3JpdGVUb2dnbGVXYXRjaGluZ01lc3NhZ2UiLCJfc3RvcCIsIndyaXRlTm90aGluZ1RvU3RvcE1lc3NhZ2UiLCJ3cml0ZVN0b3BSdW5uaW5nTWVzc2FnZSIsInN1c3BlbmQiLCJfcmVzdGFydCIsIndyaXRlVGVzdHNGaW5pc2hlZE1lc3NhZ2UiLCJfcnVuVGVzdHMiLCJfZXhpdCIsIndyaXRlRXhpdE1lc3NhZ2UiLCJleGl0IiwiX2NyZWF0ZUZpbGVXYXRjaGVyIiwiZW1pdEtleXByZXNzRXZlbnRzIiwiaXNUVFkiLCJjcmVhdGVJbnRlcmZhY2UiLCJpbnB1dCIsIm91dHB1dCIsInN0ZG91dCIsIm9uIiwiY2giLCJrZXkiLCJzZXRUaW1lb3V0IiwiY3RybCIsIm5hbWUiLCJURVNUX1JVTl9ET05FX0VWRU5UIiwiZSIsImVyciIsImVtaXQiLCJhZGRGaWxlIiwiZmlsZW5hbWUiLCJGSUxFX0NIQU5HRURfRVZFTlQiLCJzb3VyY2VDaGFuZ2VkIiwid3JpdGVSdW5UZXN0c01lc3NhZ2UiLCJydW5UZXN0cyJdLCJtYXBwaW5ncyI6Ijs7OztBQUFBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7O0FBRUEsTUFBTUEsOEJBQThCLHNCQUFwQztBQUNBLE1BQU1DLHlCQUE4QixJQUFwQzs7QUFFQSxNQUFNQyxrQkFBTiwwQkFBOEM7QUFDMUNDLGdCQUFhQyxNQUFiLEVBQXFCO0FBQ2pCOztBQUVBLGFBQUtDLEdBQUwsR0FBc0IsSUFBdEI7QUFDQSxhQUFLQyxPQUFMLEdBQXNCLEtBQXRCO0FBQ0EsYUFBS0MsVUFBTCxHQUFzQixLQUF0QjtBQUNBLGFBQUtDLGNBQUwsR0FBc0IsS0FBdEI7QUFDQSxhQUFLQyxRQUFMLEdBQXNCLEtBQXRCO0FBQ0EsYUFBS0MsTUFBTCxHQUFzQixzQkFBdEI7QUFDQSxhQUFLTixNQUFMLEdBQXNCQSxNQUF0QjtBQUNBLGFBQUtPLFlBQUwsR0FBc0IsS0FBdEI7QUFDQSxhQUFLQyxXQUFMLEdBQXNCLElBQXRCO0FBQ0EsYUFBS0MsRUFBTCxHQUFzQixJQUF0QjtBQUNIOztBQUVEQyxTQUFNQyxLQUFOLEVBQWE7QUFDVCxhQUFLQyxlQUFMO0FBQ0EsYUFBS0MsaUJBQUwsQ0FBdUJGLEtBQXZCO0FBQ0EsYUFBS0csdUJBQUw7QUFDQSxhQUFLQyxXQUFMOztBQUVBLGVBQU8saUJBQVFDLE9BQVIsR0FDRkMsSUFERSxDQUNHLE1BQU0sS0FBS1gsTUFBTCxDQUFZWSxpQkFBWixDQUE4QlAsS0FBOUIsQ0FEVCxDQUFQO0FBRUg7O0FBRURRLGNBQVc7QUFDUCxhQUFLWCxXQUFMLENBQWlCWSxJQUFqQjtBQUNBLDBCQUFRQyxLQUFSLENBQWNDLFVBQWQsQ0FBeUIsS0FBekI7QUFDQSxhQUFLYixFQUFMLENBQVFjLEtBQVI7QUFDSDs7QUFFREMsc0JBQW1CO0FBQ2YsYUFBS3BCLGNBQUwsR0FBc0IsQ0FBQyxLQUFLQSxjQUE1Qjs7QUFFQSxhQUFLRSxNQUFMLENBQVltQiwwQkFBWixDQUF1QyxDQUFDLEtBQUtyQixjQUE3QztBQUNIOztBQUVEc0IsWUFBUztBQUNMLFlBQUksQ0FBQyxLQUFLMUIsTUFBTixJQUFnQixDQUFDLEtBQUtFLE9BQTFCLEVBQW1DO0FBQy9CLGlCQUFLSSxNQUFMLENBQVlxQix5QkFBWjs7QUFFQSxtQkFBTyxpQkFBUVgsT0FBUixFQUFQO0FBQ0g7O0FBRUQsYUFBS1YsTUFBTCxDQUFZc0IsdUJBQVo7O0FBRUEsZUFBTyxLQUFLNUIsTUFBTCxDQUFZNkIsT0FBWixHQUNGWixJQURFLENBQ0csTUFBTTtBQUNSLGlCQUFLZCxVQUFMLEdBQWtCLEtBQWxCO0FBQ0EsaUJBQUtELE9BQUwsR0FBa0IsS0FBbEI7QUFDSCxTQUpFLENBQVA7QUFLSDs7QUFFRDRCLGVBQVk7QUFDUixZQUFJLEtBQUszQixVQUFMLElBQW1CLEtBQUtDLGNBQTVCLEVBQ0ksT0FBTyxpQkFBUVksT0FBUixFQUFQOztBQUVKLGFBQUtiLFVBQUwsR0FBa0IsSUFBbEI7O0FBRUEsWUFBSSxLQUFLRCxPQUFULEVBQWtCO0FBQ2QsbUJBQU8sS0FBS3dCLEtBQUwsR0FDRlQsSUFERSxDQUNHLE1BQU0sS0FBS1gsTUFBTCxDQUFZeUIseUJBQVosRUFEVCxFQUVGZCxJQUZFLENBRUcsTUFBTSxLQUFLZSxTQUFMLEVBRlQsQ0FBUDtBQUdIOztBQUVELGVBQU8sS0FBS0EsU0FBTCxFQUFQO0FBQ0g7O0FBRURDLFlBQVM7QUFDTCxZQUFJLEtBQUs1QixRQUFULEVBQ0ksT0FBTyxpQkFBUVcsT0FBUixFQUFQOztBQUVKLGFBQUtWLE1BQUwsQ0FBWTRCLGdCQUFaOztBQUVBLGFBQUs3QixRQUFMLEdBQWdCLElBQWhCOztBQUVBLGVBQU8sS0FBS0wsTUFBTCxHQUFjLEtBQUtBLE1BQUwsQ0FBWW1DLElBQVosRUFBZCxHQUFtQyxpQkFBUW5CLE9BQVIsRUFBMUM7QUFDSDs7QUFFRG9CLHVCQUFvQm5DLEdBQXBCLEVBQXlCO0FBQ3JCLGVBQU8sMEJBQWdCQSxHQUFoQixDQUFQO0FBQ0g7O0FBRURXLHNCQUFtQjtBQUNmLDJCQUFTeUIsa0JBQVQsQ0FBNEIsa0JBQVFoQixLQUFwQztBQUNBLFlBQUksa0JBQVFBLEtBQVIsQ0FBY2lCLEtBQWxCLEVBQ0ksa0JBQVFqQixLQUFSLENBQWNDLFVBQWQsQ0FBeUIsSUFBekI7O0FBRUosYUFBS2IsRUFBTCxHQUFVLG1CQUFTOEIsZUFBVCxDQUF5QjtBQUMvQkMsbUJBQVEsa0JBQVFuQixLQURlO0FBRS9Cb0Isb0JBQVEsa0JBQVFDO0FBRmUsU0FBekIsQ0FBVjs7QUFLQSwwQkFBUXJCLEtBQVIsQ0FBY3NCLEVBQWQsQ0FBaUIsVUFBakIsRUFBNkIsQ0FBQ0MsRUFBRCxFQUFLQyxHQUFMLEtBQWE7QUFDdEMsZ0JBQUksS0FBS3RDLFlBQVQsRUFDSSxPQUFPLElBQVA7O0FBRUosaUJBQUtBLFlBQUwsR0FBb0IsSUFBcEI7O0FBRUF1Qyx1QkFBVyxNQUFNO0FBQ2IscUJBQUt2QyxZQUFMLEdBQW9CLEtBQXBCO0FBQ0gsYUFGRCxFQUVHVixzQkFGSDs7QUFJQSxnQkFBSWdELE9BQU9BLElBQUlFLElBQWYsRUFBcUI7QUFDakIsd0JBQVFGLElBQUlHLElBQVo7QUFDSSx5QkFBSyxHQUFMO0FBQ0ksK0JBQU8sS0FBS3RCLEtBQUwsRUFBUDtBQUNKLHlCQUFLLEdBQUw7QUFDSSwrQkFBTyxLQUFLSSxRQUFMLEVBQVA7QUFDSix5QkFBSyxHQUFMO0FBQ0ksK0JBQU8sS0FBS0csS0FBTCxFQUFQO0FBQ0oseUJBQUssR0FBTDtBQUNJLCtCQUFPLEtBQUtULGVBQUwsRUFBUDtBQVJSO0FBVUg7O0FBRUQsbUJBQU8sSUFBUDtBQUNILFNBeEJEO0FBeUJIOztBQUVEViw4QkFBMkI7QUFDdkIsYUFBS2QsTUFBTCxDQUFZMkMsRUFBWixDQUFlLEtBQUszQyxNQUFMLENBQVlpRCxtQkFBM0IsRUFBZ0RDLEtBQUs7QUFDakQsaUJBQUtoRCxPQUFMLEdBQWUsS0FBZjs7QUFFQSxnQkFBSSxDQUFDLEtBQUtDLFVBQVYsRUFDSSxLQUFLRyxNQUFMLENBQVl5Qix5QkFBWjs7QUFFSixnQkFBSW1CLEVBQUVDLEdBQU4sRUFDSSxLQUFLN0MsTUFBTCxDQUFZNkMsR0FBWixDQUFnQkQsRUFBRUMsR0FBbEI7QUFDUCxTQVJEOztBQVVBLGFBQUtuRCxNQUFMLENBQVkyQyxFQUFaLENBQWUsS0FBSzNDLE1BQUwsQ0FBWUosMkJBQTNCLEVBQXdEc0QsS0FBSztBQUN6RCxpQkFBS0UsSUFBTCxDQUFVeEQsMkJBQVYsRUFBdUNzRCxDQUF2QztBQUNILFNBRkQ7QUFHSDs7QUFFRHJDLHNCQUFtQlosR0FBbkIsRUFBd0I7QUFDcEIsYUFBS08sV0FBTCxHQUFtQixLQUFLNEIsa0JBQUwsQ0FBd0JuQyxHQUF4QixDQUFuQjs7QUFFQSxhQUFLMEMsRUFBTCxDQUFRL0MsMkJBQVIsRUFBcUNzRCxLQUFLLEtBQUsxQyxXQUFMLENBQWlCNkMsT0FBakIsQ0FBeUJILEVBQUVJLFFBQTNCLENBQTFDOztBQUVBLGFBQUs5QyxXQUFMLENBQWlCbUMsRUFBakIsQ0FBb0IsS0FBS25DLFdBQUwsQ0FBaUIrQyxrQkFBckMsRUFBeUQsTUFBTSxLQUFLdkIsU0FBTCxDQUFlLElBQWYsQ0FBL0Q7QUFDSDs7QUFFRGpCLGtCQUFlO0FBQ1gsYUFBS2IsT0FBTCxHQUFrQixJQUFsQjtBQUNBLGFBQUtDLFVBQUwsR0FBa0IsS0FBbEI7QUFDSDs7QUFFRDZCLGNBQVd3QixhQUFYLEVBQTBCO0FBQ3RCLFlBQUksS0FBS3BELGNBQUwsSUFBdUIsS0FBS0YsT0FBaEMsRUFDSSxPQUFPLGlCQUFRYyxPQUFSLEVBQVA7O0FBRUosYUFBS0QsV0FBTDs7QUFFQSxhQUFLVCxNQUFMLENBQVltRCxvQkFBWixDQUFpQ0QsYUFBakM7O0FBRUEsZUFBTyxLQUFLeEQsTUFBTCxDQUFZMEQsUUFBWixFQUFQO0FBQ0g7QUEvSnlDOztrQkFrSy9CNUQsa0IiLCJmaWxlIjoibGl2ZS9jb250cm9sbGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEV2ZW50RW1pdHRlciBmcm9tICdldmVudHMnO1xuaW1wb3J0IEZpbGVXYXRjaGVyIGZyb20gJy4vZmlsZS13YXRjaGVyJztcbmltcG9ydCBMb2dnZXIgZnJvbSAnLi9sb2dnZXInO1xuaW1wb3J0IHByb2Nlc3MgZnJvbSAncHJvY2Vzcyc7XG5pbXBvcnQgcmVhZGxpbmUgZnJvbSAncmVhZGxpbmUnO1xuaW1wb3J0IFByb21pc2UgZnJvbSAncGlua2llJztcblxuY29uc3QgUkVRVUlSRURfTU9EVUxFX0ZPVU5EX0VWRU5UID0gJ3JlcXVpcmUtbW9kdWxlLWZvdW5kJztcbmNvbnN0IExPQ0tfS0VZX1BSRVNTX1RJTUVPVVQgICAgICA9IDEwMDA7XG5cbmNsYXNzIExpdmVNb2RlQ29udHJvbGxlciBleHRlbmRzIEV2ZW50RW1pdHRlciB7XG4gICAgY29uc3RydWN0b3IgKHJ1bm5lcikge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIHRoaXMuc3JjICAgICAgICAgICAgPSBudWxsO1xuICAgICAgICB0aGlzLnJ1bm5pbmcgICAgICAgID0gZmFsc2U7XG4gICAgICAgIHRoaXMucmVzdGFydGluZyAgICAgPSBmYWxzZTtcbiAgICAgICAgdGhpcy53YXRjaGluZ1BhdXNlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnN0b3BwaW5nICAgICAgID0gZmFsc2U7XG4gICAgICAgIHRoaXMubG9nZ2VyICAgICAgICAgPSBuZXcgTG9nZ2VyKCk7XG4gICAgICAgIHRoaXMucnVubmVyICAgICAgICAgPSBydW5uZXI7XG4gICAgICAgIHRoaXMubG9ja0tleVByZXNzICAgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5maWxlV2F0Y2hlciAgICA9IG51bGw7XG4gICAgICAgIHRoaXMucmwgICAgICAgICAgICAgPSBudWxsO1xuICAgIH1cblxuICAgIGluaXQgKGZpbGVzKSB7XG4gICAgICAgIHRoaXMuX2xpc3RlbktleVByZXNzKCk7XG4gICAgICAgIHRoaXMuX2luaXRGaWxlV2F0Y2hpbmcoZmlsZXMpO1xuICAgICAgICB0aGlzLl9saXN0ZW5UZXN0UnVubmVyRXZlbnRzKCk7XG4gICAgICAgIHRoaXMuX3NldFJ1bm5pbmcoKTtcblxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHRoaXMubG9nZ2VyLndyaXRlSW50cm9NZXNzYWdlKGZpbGVzKSk7XG4gICAgfVxuXG4gICAgZGlzcG9zZSAoKSB7XG4gICAgICAgIHRoaXMuZmlsZVdhdGNoZXIuc3RvcCgpO1xuICAgICAgICBwcm9jZXNzLnN0ZGluLnNldFJhd01vZGUoZmFsc2UpO1xuICAgICAgICB0aGlzLnJsLmNsb3NlKCk7XG4gICAgfVxuXG4gICAgX3RvZ2dsZVdhdGNoaW5nICgpIHtcbiAgICAgICAgdGhpcy53YXRjaGluZ1BhdXNlZCA9ICF0aGlzLndhdGNoaW5nUGF1c2VkO1xuXG4gICAgICAgIHRoaXMubG9nZ2VyLndyaXRlVG9nZ2xlV2F0Y2hpbmdNZXNzYWdlKCF0aGlzLndhdGNoaW5nUGF1c2VkKTtcbiAgICB9XG5cbiAgICBfc3RvcCAoKSB7XG4gICAgICAgIGlmICghdGhpcy5ydW5uZXIgfHwgIXRoaXMucnVubmluZykge1xuICAgICAgICAgICAgdGhpcy5sb2dnZXIud3JpdGVOb3RoaW5nVG9TdG9wTWVzc2FnZSgpO1xuXG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmxvZ2dlci53cml0ZVN0b3BSdW5uaW5nTWVzc2FnZSgpO1xuXG4gICAgICAgIHJldHVybiB0aGlzLnJ1bm5lci5zdXNwZW5kKClcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlc3RhcnRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB0aGlzLnJ1bm5pbmcgICAgPSBmYWxzZTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIF9yZXN0YXJ0ICgpIHtcbiAgICAgICAgaWYgKHRoaXMucmVzdGFydGluZyB8fCB0aGlzLndhdGNoaW5nUGF1c2VkKVxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuXG4gICAgICAgIHRoaXMucmVzdGFydGluZyA9IHRydWU7XG5cbiAgICAgICAgaWYgKHRoaXMucnVubmluZykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3N0b3AoKVxuICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHRoaXMubG9nZ2VyLndyaXRlVGVzdHNGaW5pc2hlZE1lc3NhZ2UoKSlcbiAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB0aGlzLl9ydW5UZXN0cygpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLl9ydW5UZXN0cygpO1xuICAgIH1cblxuICAgIF9leGl0ICgpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RvcHBpbmcpXG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG5cbiAgICAgICAgdGhpcy5sb2dnZXIud3JpdGVFeGl0TWVzc2FnZSgpO1xuXG4gICAgICAgIHRoaXMuc3RvcHBpbmcgPSB0cnVlO1xuXG4gICAgICAgIHJldHVybiB0aGlzLnJ1bm5lciA/IHRoaXMucnVubmVyLmV4aXQoKSA6IFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH1cblxuICAgIF9jcmVhdGVGaWxlV2F0Y2hlciAoc3JjKSB7XG4gICAgICAgIHJldHVybiBuZXcgRmlsZVdhdGNoZXIoc3JjKTtcbiAgICB9XG5cbiAgICBfbGlzdGVuS2V5UHJlc3MgKCkge1xuICAgICAgICByZWFkbGluZS5lbWl0S2V5cHJlc3NFdmVudHMocHJvY2Vzcy5zdGRpbik7XG4gICAgICAgIGlmIChwcm9jZXNzLnN0ZGluLmlzVFRZKVxuICAgICAgICAgICAgcHJvY2Vzcy5zdGRpbi5zZXRSYXdNb2RlKHRydWUpO1xuXG4gICAgICAgIHRoaXMucmwgPSByZWFkbGluZS5jcmVhdGVJbnRlcmZhY2Uoe1xuICAgICAgICAgICAgaW5wdXQ6ICBwcm9jZXNzLnN0ZGluLFxuICAgICAgICAgICAgb3V0cHV0OiBwcm9jZXNzLnN0ZG91dFxuICAgICAgICB9KTtcblxuICAgICAgICBwcm9jZXNzLnN0ZGluLm9uKCdrZXlwcmVzcycsIChjaCwga2V5KSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5sb2NrS2V5UHJlc3MpXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgICAgIHRoaXMubG9ja0tleVByZXNzID0gdHJ1ZTtcblxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2NrS2V5UHJlc3MgPSBmYWxzZTtcbiAgICAgICAgICAgIH0sIExPQ0tfS0VZX1BSRVNTX1RJTUVPVVQpO1xuXG4gICAgICAgICAgICBpZiAoa2V5ICYmIGtleS5jdHJsKSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoIChrZXkubmFtZSkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdzJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9zdG9wKCk7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3InOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3Jlc3RhcnQoKTtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnYyc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fZXhpdCgpO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICd3JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl90b2dnbGVXYXRjaGluZygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIF9saXN0ZW5UZXN0UnVubmVyRXZlbnRzICgpIHtcbiAgICAgICAgdGhpcy5ydW5uZXIub24odGhpcy5ydW5uZXIuVEVTVF9SVU5fRE9ORV9FVkVOVCwgZSA9PiB7XG4gICAgICAgICAgICB0aGlzLnJ1bm5pbmcgPSBmYWxzZTtcblxuICAgICAgICAgICAgaWYgKCF0aGlzLnJlc3RhcnRpbmcpXG4gICAgICAgICAgICAgICAgdGhpcy5sb2dnZXIud3JpdGVUZXN0c0ZpbmlzaGVkTWVzc2FnZSgpO1xuXG4gICAgICAgICAgICBpZiAoZS5lcnIpXG4gICAgICAgICAgICAgICAgdGhpcy5sb2dnZXIuZXJyKGUuZXJyKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5ydW5uZXIub24odGhpcy5ydW5uZXIuUkVRVUlSRURfTU9EVUxFX0ZPVU5EX0VWRU5ULCBlID0+IHtcbiAgICAgICAgICAgIHRoaXMuZW1pdChSRVFVSVJFRF9NT0RVTEVfRk9VTkRfRVZFTlQsIGUpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBfaW5pdEZpbGVXYXRjaGluZyAoc3JjKSB7XG4gICAgICAgIHRoaXMuZmlsZVdhdGNoZXIgPSB0aGlzLl9jcmVhdGVGaWxlV2F0Y2hlcihzcmMpO1xuXG4gICAgICAgIHRoaXMub24oUkVRVUlSRURfTU9EVUxFX0ZPVU5EX0VWRU5ULCBlID0+IHRoaXMuZmlsZVdhdGNoZXIuYWRkRmlsZShlLmZpbGVuYW1lKSk7XG5cbiAgICAgICAgdGhpcy5maWxlV2F0Y2hlci5vbih0aGlzLmZpbGVXYXRjaGVyLkZJTEVfQ0hBTkdFRF9FVkVOVCwgKCkgPT4gdGhpcy5fcnVuVGVzdHModHJ1ZSkpO1xuICAgIH1cblxuICAgIF9zZXRSdW5uaW5nICgpIHtcbiAgICAgICAgdGhpcy5ydW5uaW5nICAgID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5yZXN0YXJ0aW5nID0gZmFsc2U7XG4gICAgfVxuXG4gICAgX3J1blRlc3RzIChzb3VyY2VDaGFuZ2VkKSB7XG4gICAgICAgIGlmICh0aGlzLndhdGNoaW5nUGF1c2VkIHx8IHRoaXMucnVubmluZylcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcblxuICAgICAgICB0aGlzLl9zZXRSdW5uaW5nKCk7XG5cbiAgICAgICAgdGhpcy5sb2dnZXIud3JpdGVSdW5UZXN0c01lc3NhZ2Uoc291cmNlQ2hhbmdlZCk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMucnVubmVyLnJ1blRlc3RzKCk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBMaXZlTW9kZUNvbnRyb2xsZXI7XG4iXX0=
