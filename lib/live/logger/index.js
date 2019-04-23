'use strict';

exports.__esModule = true;

var _log = require('../../cli/log');

var _log2 = _interopRequireDefault(_log);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Logger {
    constructor() {
        this.watching = true;

        this.MESSAGES = {
            intro: `Live mode is enabled.
TestCafe now watches source files and reruns
the tests once the changes are saved.
                    
You can use the following keys in the terminal:
'Ctrl+S' - stops the test run;
'Ctrl+R' - restarts the test run;
'Ctrl+W' - enables/disables watching files;
'Ctrl+C' - quits live mode and closes the browsers.
`,

            sourceChanged: 'The sources have changed. A test run is starting...',
            testRunStarting: 'A test run is starting...',
            testRunStopping: 'The test run is stopping...',
            testRunFinishedWatching: 'Make changes to the source files or press Ctrl+R to restart the test run.',
            testRunFinishedNotWatching: 'Press Ctrl+R to restart the test run.',
            fileWatchingEnabled: 'TestCafe is watching the source files. Save the changes to run tests.',
            fileWatchingDisabled: 'TestCafe is not watching the source files.',
            nothingToStop: 'There are no tests running at the moment.',
            testCafeStopping: 'Stopping TestCafe live mode...',
            watchingFiles: 'Watching the following files:'
        };
    }

    _write(msg, prefix = '\n') {
        _log2.default.write(`${prefix}${msg}`);
    }

    writeIntroMessage(files) {
        this._write(this.MESSAGES.intro);

        if (!Array.isArray(files)) return;

        this._write(this.MESSAGES.watchingFiles);

        files.forEach(file => {
            this._write(file, '  ');
        });
    }

    writeRunTestsMessage(sourcesChanged) {
        const statusMessage = sourcesChanged ? this.MESSAGES.sourceChanged : this.MESSAGES.testRunStarting;

        this._write(statusMessage);
    }

    writeTestsFinishedMessage() {
        const statusMessage = this.watching ? this.MESSAGES.testRunFinishedWatching : this.MESSAGES.testRunFinishedNotWatching;

        this._write(statusMessage);
    }

    writeStopRunningMessage() {
        this._write(this.MESSAGES.testRunStopping);
    }

    writeNothingToStopMessage() {
        this._write(this.MESSAGES.nothingToStop);
    }

    writeToggleWatchingMessage(enable) {
        this.watching = enable;

        const statusMessage = enable ? this.MESSAGES.fileWatchingEnabled : this.MESSAGES.fileWatchingDisabled;

        this._write(statusMessage);
    }

    writeExitMessage() {
        this._write(this.MESSAGES.testCafeStopping);
    }

    err(err) {
        /* eslint-disable no-console */
        console.log(err);
        /* eslint-enable no-console */
    }

}
exports.default = Logger;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saXZlL2xvZ2dlci9pbmRleC5qcyJdLCJuYW1lcyI6WyJMb2dnZXIiLCJjb25zdHJ1Y3RvciIsIndhdGNoaW5nIiwiTUVTU0FHRVMiLCJpbnRybyIsInNvdXJjZUNoYW5nZWQiLCJ0ZXN0UnVuU3RhcnRpbmciLCJ0ZXN0UnVuU3RvcHBpbmciLCJ0ZXN0UnVuRmluaXNoZWRXYXRjaGluZyIsInRlc3RSdW5GaW5pc2hlZE5vdFdhdGNoaW5nIiwiZmlsZVdhdGNoaW5nRW5hYmxlZCIsImZpbGVXYXRjaGluZ0Rpc2FibGVkIiwibm90aGluZ1RvU3RvcCIsInRlc3RDYWZlU3RvcHBpbmciLCJ3YXRjaGluZ0ZpbGVzIiwiX3dyaXRlIiwibXNnIiwicHJlZml4Iiwid3JpdGUiLCJ3cml0ZUludHJvTWVzc2FnZSIsImZpbGVzIiwiQXJyYXkiLCJpc0FycmF5IiwiZm9yRWFjaCIsImZpbGUiLCJ3cml0ZVJ1blRlc3RzTWVzc2FnZSIsInNvdXJjZXNDaGFuZ2VkIiwic3RhdHVzTWVzc2FnZSIsIndyaXRlVGVzdHNGaW5pc2hlZE1lc3NhZ2UiLCJ3cml0ZVN0b3BSdW5uaW5nTWVzc2FnZSIsIndyaXRlTm90aGluZ1RvU3RvcE1lc3NhZ2UiLCJ3cml0ZVRvZ2dsZVdhdGNoaW5nTWVzc2FnZSIsImVuYWJsZSIsIndyaXRlRXhpdE1lc3NhZ2UiLCJlcnIiLCJjb25zb2xlIiwibG9nIl0sIm1hcHBpbmdzIjoiOzs7O0FBQUE7Ozs7OztBQUVlLE1BQU1BLE1BQU4sQ0FBYTtBQUN4QkMsa0JBQWU7QUFDWCxhQUFLQyxRQUFMLEdBQWdCLElBQWhCOztBQUVBLGFBQUtDLFFBQUwsR0FBZ0I7QUFDWkMsbUJBQVE7Ozs7Ozs7OztDQURJOztBQVlaQywyQkFBNEIscURBWmhCO0FBYVpDLDZCQUE0QiwyQkFiaEI7QUFjWkMsNkJBQTRCLDZCQWRoQjtBQWVaQyxxQ0FBNEIsMkVBZmhCO0FBZ0JaQyx3Q0FBNEIsdUNBaEJoQjtBQWlCWkMsaUNBQTRCLHVFQWpCaEI7QUFrQlpDLGtDQUE0Qiw0Q0FsQmhCO0FBbUJaQywyQkFBNEIsMkNBbkJoQjtBQW9CWkMsOEJBQTRCLGdDQXBCaEI7QUFxQlpDLDJCQUE0QjtBQXJCaEIsU0FBaEI7QUF1Qkg7O0FBRURDLFdBQVFDLEdBQVIsRUFBYUMsU0FBUyxJQUF0QixFQUE0QjtBQUN4QixzQkFBSUMsS0FBSixDQUFXLEdBQUVELE1BQU8sR0FBRUQsR0FBSSxFQUExQjtBQUNIOztBQUVERyxzQkFBbUJDLEtBQW5CLEVBQTBCO0FBQ3RCLGFBQUtMLE1BQUwsQ0FBWSxLQUFLWixRQUFMLENBQWNDLEtBQTFCOztBQUVBLFlBQUksQ0FBQ2lCLE1BQU1DLE9BQU4sQ0FBY0YsS0FBZCxDQUFMLEVBQ0k7O0FBRUosYUFBS0wsTUFBTCxDQUFZLEtBQUtaLFFBQUwsQ0FBY1csYUFBMUI7O0FBRUFNLGNBQU1HLE9BQU4sQ0FBY0MsUUFBUTtBQUNsQixpQkFBS1QsTUFBTCxDQUFZUyxJQUFaLEVBQWtCLElBQWxCO0FBQ0gsU0FGRDtBQUdIOztBQUVEQyx5QkFBc0JDLGNBQXRCLEVBQXNDO0FBQ2xDLGNBQU1DLGdCQUFnQkQsaUJBQWlCLEtBQUt2QixRQUFMLENBQWNFLGFBQS9CLEdBQStDLEtBQUtGLFFBQUwsQ0FBY0csZUFBbkY7O0FBRUEsYUFBS1MsTUFBTCxDQUFZWSxhQUFaO0FBQ0g7O0FBRURDLGdDQUE2QjtBQUN6QixjQUFNRCxnQkFBZ0IsS0FBS3pCLFFBQUwsR0FBZ0IsS0FBS0MsUUFBTCxDQUFjSyx1QkFBOUIsR0FBd0QsS0FBS0wsUUFBTCxDQUFjTSwwQkFBNUY7O0FBRUEsYUFBS00sTUFBTCxDQUFZWSxhQUFaO0FBQ0g7O0FBRURFLDhCQUEyQjtBQUN2QixhQUFLZCxNQUFMLENBQVksS0FBS1osUUFBTCxDQUFjSSxlQUExQjtBQUNIOztBQUVEdUIsZ0NBQTZCO0FBQ3pCLGFBQUtmLE1BQUwsQ0FBWSxLQUFLWixRQUFMLENBQWNTLGFBQTFCO0FBQ0g7O0FBRURtQiwrQkFBNEJDLE1BQTVCLEVBQW9DO0FBQ2hDLGFBQUs5QixRQUFMLEdBQWdCOEIsTUFBaEI7O0FBRUEsY0FBTUwsZ0JBQWdCSyxTQUFTLEtBQUs3QixRQUFMLENBQWNPLG1CQUF2QixHQUE2QyxLQUFLUCxRQUFMLENBQWNRLG9CQUFqRjs7QUFFQSxhQUFLSSxNQUFMLENBQVlZLGFBQVo7QUFDSDs7QUFFRE0sdUJBQW9CO0FBQ2hCLGFBQUtsQixNQUFMLENBQVksS0FBS1osUUFBTCxDQUFjVSxnQkFBMUI7QUFDSDs7QUFFRHFCLFFBQUtBLEdBQUwsRUFBVTtBQUNOO0FBQ0FDLGdCQUFRQyxHQUFSLENBQVlGLEdBQVo7QUFDQTtBQUNIOztBQWxGdUI7a0JBQVBsQyxNIiwiZmlsZSI6ImxpdmUvbG9nZ2VyL2luZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGxvZyBmcm9tICcuLi8uLi9jbGkvbG9nJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTG9nZ2VyIHtcbiAgICBjb25zdHJ1Y3RvciAoKSB7XG4gICAgICAgIHRoaXMud2F0Y2hpbmcgPSB0cnVlO1xuXG4gICAgICAgIHRoaXMuTUVTU0FHRVMgPSB7XG4gICAgICAgICAgICBpbnRybzogYExpdmUgbW9kZSBpcyBlbmFibGVkLlxuVGVzdENhZmUgbm93IHdhdGNoZXMgc291cmNlIGZpbGVzIGFuZCByZXJ1bnNcbnRoZSB0ZXN0cyBvbmNlIHRoZSBjaGFuZ2VzIGFyZSBzYXZlZC5cbiAgICAgICAgICAgICAgICAgICAgXG5Zb3UgY2FuIHVzZSB0aGUgZm9sbG93aW5nIGtleXMgaW4gdGhlIHRlcm1pbmFsOlxuJ0N0cmwrUycgLSBzdG9wcyB0aGUgdGVzdCBydW47XG4nQ3RybCtSJyAtIHJlc3RhcnRzIHRoZSB0ZXN0IHJ1bjtcbidDdHJsK1cnIC0gZW5hYmxlcy9kaXNhYmxlcyB3YXRjaGluZyBmaWxlcztcbidDdHJsK0MnIC0gcXVpdHMgbGl2ZSBtb2RlIGFuZCBjbG9zZXMgdGhlIGJyb3dzZXJzLlxuYCxcblxuICAgICAgICAgICAgc291cmNlQ2hhbmdlZDogICAgICAgICAgICAgICdUaGUgc291cmNlcyBoYXZlIGNoYW5nZWQuIEEgdGVzdCBydW4gaXMgc3RhcnRpbmcuLi4nLFxuICAgICAgICAgICAgdGVzdFJ1blN0YXJ0aW5nOiAgICAgICAgICAgICdBIHRlc3QgcnVuIGlzIHN0YXJ0aW5nLi4uJyxcbiAgICAgICAgICAgIHRlc3RSdW5TdG9wcGluZzogICAgICAgICAgICAnVGhlIHRlc3QgcnVuIGlzIHN0b3BwaW5nLi4uJyxcbiAgICAgICAgICAgIHRlc3RSdW5GaW5pc2hlZFdhdGNoaW5nOiAgICAnTWFrZSBjaGFuZ2VzIHRvIHRoZSBzb3VyY2UgZmlsZXMgb3IgcHJlc3MgQ3RybCtSIHRvIHJlc3RhcnQgdGhlIHRlc3QgcnVuLicsXG4gICAgICAgICAgICB0ZXN0UnVuRmluaXNoZWROb3RXYXRjaGluZzogJ1ByZXNzIEN0cmwrUiB0byByZXN0YXJ0IHRoZSB0ZXN0IHJ1bi4nLFxuICAgICAgICAgICAgZmlsZVdhdGNoaW5nRW5hYmxlZDogICAgICAgICdUZXN0Q2FmZSBpcyB3YXRjaGluZyB0aGUgc291cmNlIGZpbGVzLiBTYXZlIHRoZSBjaGFuZ2VzIHRvIHJ1biB0ZXN0cy4nLFxuICAgICAgICAgICAgZmlsZVdhdGNoaW5nRGlzYWJsZWQ6ICAgICAgICdUZXN0Q2FmZSBpcyBub3Qgd2F0Y2hpbmcgdGhlIHNvdXJjZSBmaWxlcy4nLFxuICAgICAgICAgICAgbm90aGluZ1RvU3RvcDogICAgICAgICAgICAgICdUaGVyZSBhcmUgbm8gdGVzdHMgcnVubmluZyBhdCB0aGUgbW9tZW50LicsXG4gICAgICAgICAgICB0ZXN0Q2FmZVN0b3BwaW5nOiAgICAgICAgICAgJ1N0b3BwaW5nIFRlc3RDYWZlIGxpdmUgbW9kZS4uLicsXG4gICAgICAgICAgICB3YXRjaGluZ0ZpbGVzOiAgICAgICAgICAgICAgJ1dhdGNoaW5nIHRoZSBmb2xsb3dpbmcgZmlsZXM6JyxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBfd3JpdGUgKG1zZywgcHJlZml4ID0gJ1xcbicpIHtcbiAgICAgICAgbG9nLndyaXRlKGAke3ByZWZpeH0ke21zZ31gKTtcbiAgICB9XG5cbiAgICB3cml0ZUludHJvTWVzc2FnZSAoZmlsZXMpIHtcbiAgICAgICAgdGhpcy5fd3JpdGUodGhpcy5NRVNTQUdFUy5pbnRybyk7XG5cbiAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGZpbGVzKSlcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICB0aGlzLl93cml0ZSh0aGlzLk1FU1NBR0VTLndhdGNoaW5nRmlsZXMpO1xuXG4gICAgICAgIGZpbGVzLmZvckVhY2goZmlsZSA9PiB7XG4gICAgICAgICAgICB0aGlzLl93cml0ZShmaWxlLCAnICAnKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgd3JpdGVSdW5UZXN0c01lc3NhZ2UgKHNvdXJjZXNDaGFuZ2VkKSB7XG4gICAgICAgIGNvbnN0IHN0YXR1c01lc3NhZ2UgPSBzb3VyY2VzQ2hhbmdlZCA/IHRoaXMuTUVTU0FHRVMuc291cmNlQ2hhbmdlZCA6IHRoaXMuTUVTU0FHRVMudGVzdFJ1blN0YXJ0aW5nO1xuXG4gICAgICAgIHRoaXMuX3dyaXRlKHN0YXR1c01lc3NhZ2UpO1xuICAgIH1cblxuICAgIHdyaXRlVGVzdHNGaW5pc2hlZE1lc3NhZ2UgKCkge1xuICAgICAgICBjb25zdCBzdGF0dXNNZXNzYWdlID0gdGhpcy53YXRjaGluZyA/IHRoaXMuTUVTU0FHRVMudGVzdFJ1bkZpbmlzaGVkV2F0Y2hpbmcgOiB0aGlzLk1FU1NBR0VTLnRlc3RSdW5GaW5pc2hlZE5vdFdhdGNoaW5nO1xuXG4gICAgICAgIHRoaXMuX3dyaXRlKHN0YXR1c01lc3NhZ2UpO1xuICAgIH1cblxuICAgIHdyaXRlU3RvcFJ1bm5pbmdNZXNzYWdlICgpIHtcbiAgICAgICAgdGhpcy5fd3JpdGUodGhpcy5NRVNTQUdFUy50ZXN0UnVuU3RvcHBpbmcpO1xuICAgIH1cblxuICAgIHdyaXRlTm90aGluZ1RvU3RvcE1lc3NhZ2UgKCkge1xuICAgICAgICB0aGlzLl93cml0ZSh0aGlzLk1FU1NBR0VTLm5vdGhpbmdUb1N0b3ApO1xuICAgIH1cblxuICAgIHdyaXRlVG9nZ2xlV2F0Y2hpbmdNZXNzYWdlIChlbmFibGUpIHtcbiAgICAgICAgdGhpcy53YXRjaGluZyA9IGVuYWJsZTtcblxuICAgICAgICBjb25zdCBzdGF0dXNNZXNzYWdlID0gZW5hYmxlID8gdGhpcy5NRVNTQUdFUy5maWxlV2F0Y2hpbmdFbmFibGVkIDogdGhpcy5NRVNTQUdFUy5maWxlV2F0Y2hpbmdEaXNhYmxlZDtcblxuICAgICAgICB0aGlzLl93cml0ZShzdGF0dXNNZXNzYWdlKTtcbiAgICB9XG5cbiAgICB3cml0ZUV4aXRNZXNzYWdlICgpIHtcbiAgICAgICAgdGhpcy5fd3JpdGUodGhpcy5NRVNTQUdFUy50ZXN0Q2FmZVN0b3BwaW5nKTtcbiAgICB9XG5cbiAgICBlcnIgKGVycikge1xuICAgICAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby1jb25zb2xlICovXG4gICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgIC8qIGVzbGludC1lbmFibGUgbm8tY29uc29sZSAqL1xuICAgIH1cblxuXG59XG4iXX0=
