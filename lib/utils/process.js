'use strict';

exports.__esModule = true;
exports.killBrowserProcess = undefined;

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

let findProcessUnix = (() => {
    var _ref = (0, _asyncToGenerator3.default)(function* (browserId) {
        const output = yield getProcessOutputUnix();

        return findProcessIdUnix(browserId, output);
    });

    return function findProcessUnix(_x) {
        return _ref.apply(this, arguments);
    };
})();

let checkUnixProcessIsKilled = (() => {
    var _ref2 = (0, _asyncToGenerator3.default)(function* (processId) {
        const output = yield getProcessOutputUnix();

        if (isProcessExistUnix(processId, output)) {
            yield (0, _delay2.default)(CHECK_KILLED_DELAY);

            yield checkUnixProcessIsKilled();
        }
    });

    return function checkUnixProcessIsKilled(_x2) {
        return _ref2.apply(this, arguments);
    };
})();

let killProcessUnix = (() => {
    var _ref3 = (0, _asyncToGenerator3.default)(function* (processId) {
        let timeoutError = false;

        process.kill(processId);

        const killTimeoutTimer = (0, _delay2.default)(CHECK_PROCESS_IS_KILLED_TIMEOUT).then(function () {
            timeoutError = true;
        });

        return _pinkie2.default.race([killTimeoutTimer, checkUnixProcessIsKilled(processId)]).then(function () {
            if (timeoutError) throw new Error(killProcessTimeoutError);
        });
    });

    return function killProcessUnix(_x3) {
        return _ref3.apply(this, arguments);
    };
})();

let runWMIC = (() => {
    var _ref4 = (0, _asyncToGenerator3.default)(function* (args) {
        const wmicProcess = (0, _child_process.spawn)('wmic.exe', args, { detached: true });

        let wmicOutput = '';

        wmicProcess.stdout.on('data', function (data) {
            wmicOutput += data.toString();
        });

        try {
            yield _pinkie2.default.race([(0, _promisifyEvent2.default)(wmicProcess.stdout, 'end'), (0, _promisifyEvent2.default)(wmicProcess, 'error')]);

            return wmicOutput;
        } catch (e) {
            return '';
        }
    });

    return function runWMIC(_x4) {
        return _ref4.apply(this, arguments);
    };
})();

let findProcessWin = (() => {
    var _ref5 = (0, _asyncToGenerator3.default)(function* (browserId) {
        const wmicArgs = ['process', 'where', `commandline like '%${browserId}%' and name <> 'cmd.exe' and name <> 'wmic.exe'`, 'get', 'processid'];
        const wmicOutput = yield runWMIC(wmicArgs);
        let processList = wmicOutput.split(/\s*\n/);

        processList = processList
        // NOTE: remove list's header and empty last element, caused by trailing newline
        .slice(1, -1).map(function (pid) {
            return { pid: Number(pid) };
        });

        return processList[0] ? processList[0].pid : null;
    });

    return function findProcessWin(_x5) {
        return _ref5.apply(this, arguments);
    };
})();

let killBrowserProcess = exports.killBrowserProcess = (() => {
    var _ref6 = (0, _asyncToGenerator3.default)(function* (browserId) {
        const processId = _osFamily2.default.win ? yield findProcessWin(browserId) : yield findProcessUnix(browserId);

        if (!processId) return true;

        try {
            if (_osFamily2.default.win) process.kill(processId);else yield killProcessUnix(processId);

            return true;
        } catch (e) {
            return false;
        }
    });

    return function killBrowserProcess(_x6) {
        return _ref6.apply(this, arguments);
    };
})();

var _child_process = require('child_process');

var _pinkie = require('pinkie');

var _pinkie2 = _interopRequireDefault(_pinkie);

var _osFamily = require('os-family');

var _osFamily2 = _interopRequireDefault(_osFamily);

var _promisifyEvent = require('promisify-event');

var _promisifyEvent2 = _interopRequireDefault(_promisifyEvent);

var _delay = require('../utils/delay');

var _delay2 = _interopRequireDefault(_delay);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const CHECK_PROCESS_IS_KILLED_TIMEOUT = 5000;
const CHECK_KILLED_DELAY = 1000;
const NEW_LINE_SEPERATOR_RE = /(\r\n)|(\n\r)|\n|\r/g;
const cannotGetListOfProcessError = 'Cannot get list of processes';
const killProcessTimeoutError = 'Kill process timeout';

function getProcessOutputUnix() {
    const error = new Error(cannotGetListOfProcessError);

    return new _pinkie2.default((resolve, reject) => {
        const child = (0, _child_process.spawn)('ps', ['-eo', 'pid,command']);
        let stdout = '';
        let stderr = '';

        child.stdout.on('data', data => {
            stdout += data.toString();
        });

        child.stderr.on('data', data => {
            stderr += data.toString();
        });

        child.on('exit', () => {
            if (stderr) reject(error);else resolve(stdout);
        });

        child.on('error', () => {
            reject(error);
        });
    });
}

function findProcessIdUnix(browserId, psOutput) {
    const processIdRegex = new RegExp('^\\s*(\\d+)\\s+.*' + browserId);
    const lines = psOutput.split(NEW_LINE_SEPERATOR_RE);

    for (let i = 0; i < lines.length; i++) {
        const match = processIdRegex.exec(lines[i]);

        if (match) return parseInt(match[1], 10);
    }

    return null;
}

function isProcessExistUnix(processId, psOutput) {
    const processIdRegex = new RegExp('^\\s*' + processId + '\\s+.*');
    const lines = psOutput.split(NEW_LINE_SEPERATOR_RE);

    return lines.some(line => processIdRegex.test(line));
}
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9wcm9jZXNzLmpzIl0sIm5hbWVzIjpbImJyb3dzZXJJZCIsIm91dHB1dCIsImdldFByb2Nlc3NPdXRwdXRVbml4IiwiZmluZFByb2Nlc3NJZFVuaXgiLCJmaW5kUHJvY2Vzc1VuaXgiLCJwcm9jZXNzSWQiLCJpc1Byb2Nlc3NFeGlzdFVuaXgiLCJDSEVDS19LSUxMRURfREVMQVkiLCJjaGVja1VuaXhQcm9jZXNzSXNLaWxsZWQiLCJ0aW1lb3V0RXJyb3IiLCJwcm9jZXNzIiwia2lsbCIsImtpbGxUaW1lb3V0VGltZXIiLCJDSEVDS19QUk9DRVNTX0lTX0tJTExFRF9USU1FT1VUIiwidGhlbiIsInJhY2UiLCJFcnJvciIsImtpbGxQcm9jZXNzVGltZW91dEVycm9yIiwia2lsbFByb2Nlc3NVbml4IiwiYXJncyIsIndtaWNQcm9jZXNzIiwiZGV0YWNoZWQiLCJ3bWljT3V0cHV0Iiwic3Rkb3V0Iiwib24iLCJkYXRhIiwidG9TdHJpbmciLCJlIiwicnVuV01JQyIsIndtaWNBcmdzIiwicHJvY2Vzc0xpc3QiLCJzcGxpdCIsInNsaWNlIiwibWFwIiwicGlkIiwiTnVtYmVyIiwiZmluZFByb2Nlc3NXaW4iLCJ3aW4iLCJraWxsQnJvd3NlclByb2Nlc3MiLCJORVdfTElORV9TRVBFUkFUT1JfUkUiLCJjYW5ub3RHZXRMaXN0T2ZQcm9jZXNzRXJyb3IiLCJlcnJvciIsInJlc29sdmUiLCJyZWplY3QiLCJjaGlsZCIsInN0ZGVyciIsInBzT3V0cHV0IiwicHJvY2Vzc0lkUmVnZXgiLCJSZWdFeHAiLCJsaW5lcyIsImkiLCJsZW5ndGgiLCJtYXRjaCIsImV4ZWMiLCJwYXJzZUludCIsInNvbWUiLCJsaW5lIiwidGVzdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OzsrQ0E4REEsV0FBZ0NBLFNBQWhDLEVBQTJDO0FBQ3ZDLGNBQU1DLFNBQVMsTUFBTUMsc0JBQXJCOztBQUVBLGVBQU9DLGtCQUFrQkgsU0FBbEIsRUFBNkJDLE1BQTdCLENBQVA7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LHFCQUFmLENBQXpCOztBQUVBLFNBQUssSUFBSVcsSUFBSSxDQUFiLEVBQWdCQSxJQUFJRCxNQUFNRSxNQUExQixFQUFrQ0QsR0FBbEMsRUFBdUM7QUFDbkMsY0FBTUUsUUFBUUwsZUFBZU0sSUFBZixDQUFvQkosTUFBTUMsQ0FBTixDQUFwQixDQUFkOztBQUVBLFlBQUlFLEtBQUosRUFDSSxPQUFPRSxTQUFTRixNQUFNLENBQU4sQ0FBVCxFQUFtQixFQUFuQixDQUFQO0FBQ1A7O0FBRUQsV0FBTyxJQUFQO0FBQ0g7O0FBRUQsU0FBUzlDLGtCQUFULENBQTZCRCxTQUE3QixFQUF3Q3lDLFFBQXhDLEVBQWtEO0FBQzlDLFVBQU1DLGlCQUFtQixJQUFJQyxNQUFKLENBQVcsVUFBVTNDLFNBQVYsR0FBc0IsUUFBakMsQ0FBekI7QUFDQSxVQUFNNEMsUUFBbUJILFNBQVNmLEtBQVQsQ0FBZVEscUJBQWYsQ0FBekI7O0FBRUEsV0FBT1UsTUFBTU0sSUFBTixDQUFXQyxRQUFRVCxlQUFlVSxJQUFmLENBQW9CRCxJQUFwQixDQUFuQixDQUFQO0FBQ0giLCJmaWxlIjoidXRpbHMvcHJvY2Vzcy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHNwYXduIH0gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5pbXBvcnQgUHJvbWlzZSBmcm9tICdwaW5raWUnO1xuaW1wb3J0IE9TIGZyb20gJ29zLWZhbWlseSc7XG5pbXBvcnQgcHJvbWlzaWZ5RXZlbnQgZnJvbSAncHJvbWlzaWZ5LWV2ZW50JztcbmltcG9ydCBkZWxheSBmcm9tICcuLi91dGlscy9kZWxheSc7XG5cbmNvbnN0IENIRUNLX1BST0NFU1NfSVNfS0lMTEVEX1RJTUVPVVQgPSA1MDAwO1xuY29uc3QgQ0hFQ0tfS0lMTEVEX0RFTEFZICAgICAgICAgICAgICA9IDEwMDA7XG5jb25zdCBORVdfTElORV9TRVBFUkFUT1JfUkUgICAgICAgICAgID0gLyhcXHJcXG4pfChcXG5cXHIpfFxcbnxcXHIvZztcbmNvbnN0IGNhbm5vdEdldExpc3RPZlByb2Nlc3NFcnJvciAgICAgPSAnQ2Fubm90IGdldCBsaXN0IG9mIHByb2Nlc3Nlcyc7XG5jb25zdCBraWxsUHJvY2Vzc1RpbWVvdXRFcnJvciAgICAgICAgID0gJ0tpbGwgcHJvY2VzcyB0aW1lb3V0JztcblxuZnVuY3Rpb24gZ2V0UHJvY2Vzc091dHB1dFVuaXggKCkge1xuICAgIGNvbnN0IGVycm9yID0gbmV3IEVycm9yKGNhbm5vdEdldExpc3RPZlByb2Nlc3NFcnJvcik7XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBjb25zdCBjaGlsZCA9IHNwYXduKCdwcycsIFsnLWVvJywgJ3BpZCxjb21tYW5kJ10pO1xuICAgICAgICBsZXQgc3Rkb3V0ICA9ICcnO1xuICAgICAgICBsZXQgc3RkZXJyICA9ICcnO1xuXG4gICAgICAgIGNoaWxkLnN0ZG91dC5vbignZGF0YScsIGRhdGEgPT4ge1xuICAgICAgICAgICAgc3Rkb3V0ICs9IGRhdGEudG9TdHJpbmcoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY2hpbGQuc3RkZXJyLm9uKCdkYXRhJywgZGF0YSA9PiB7XG4gICAgICAgICAgICBzdGRlcnIgKz0gZGF0YS50b1N0cmluZygpO1xuICAgICAgICB9KTtcblxuICAgICAgICBjaGlsZC5vbignZXhpdCcsICgpID0+IHtcbiAgICAgICAgICAgIGlmIChzdGRlcnIpXG4gICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICByZXNvbHZlKHN0ZG91dCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNoaWxkLm9uKCdlcnJvcicsICgpID0+IHtcbiAgICAgICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBmaW5kUHJvY2Vzc0lkVW5peCAoYnJvd3NlcklkLCBwc091dHB1dCkge1xuICAgIGNvbnN0IHByb2Nlc3NJZFJlZ2V4ICAgPSBuZXcgUmVnRXhwKCdeXFxcXHMqKFxcXFxkKylcXFxccysuKicgKyBicm93c2VySWQpO1xuICAgIGNvbnN0IGxpbmVzICAgICAgICAgICAgPSBwc091dHB1dC5zcGxpdChORVdfTElORV9TRVBFUkFUT1JfUkUpO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaW5lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBtYXRjaCA9IHByb2Nlc3NJZFJlZ2V4LmV4ZWMobGluZXNbaV0pO1xuXG4gICAgICAgIGlmIChtYXRjaClcbiAgICAgICAgICAgIHJldHVybiBwYXJzZUludChtYXRjaFsxXSwgMTApO1xuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xufVxuXG5mdW5jdGlvbiBpc1Byb2Nlc3NFeGlzdFVuaXggKHByb2Nlc3NJZCwgcHNPdXRwdXQpIHtcbiAgICBjb25zdCBwcm9jZXNzSWRSZWdleCAgID0gbmV3IFJlZ0V4cCgnXlxcXFxzKicgKyBwcm9jZXNzSWQgKyAnXFxcXHMrLionKTtcbiAgICBjb25zdCBsaW5lcyAgICAgICAgICAgID0gcHNPdXRwdXQuc3BsaXQoTkVXX0xJTkVfU0VQRVJBVE9SX1JFKTtcblxuICAgIHJldHVybiBsaW5lcy5zb21lKGxpbmUgPT4gcHJvY2Vzc0lkUmVnZXgudGVzdChsaW5lKSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGZpbmRQcm9jZXNzVW5peCAoYnJvd3NlcklkKSB7XG4gICAgY29uc3Qgb3V0cHV0ID0gYXdhaXQgZ2V0UHJvY2Vzc091dHB1dFVuaXgoKTtcblxuICAgIHJldHVybiBmaW5kUHJvY2Vzc0lkVW5peChicm93c2VySWQsIG91dHB1dCk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGNoZWNrVW5peFByb2Nlc3NJc0tpbGxlZCAocHJvY2Vzc0lkKSB7XG4gICAgY29uc3Qgb3V0cHV0ID0gYXdhaXQgZ2V0UHJvY2Vzc091dHB1dFVuaXgoKTtcblxuICAgIGlmIChpc1Byb2Nlc3NFeGlzdFVuaXgocHJvY2Vzc0lkLCBvdXRwdXQpKSB7XG4gICAgICAgIGF3YWl0IGRlbGF5KENIRUNLX0tJTExFRF9ERUxBWSk7XG5cbiAgICAgICAgYXdhaXQgY2hlY2tVbml4UHJvY2Vzc0lzS2lsbGVkKCk7XG4gICAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBraWxsUHJvY2Vzc1VuaXggKHByb2Nlc3NJZCkge1xuICAgIGxldCB0aW1lb3V0RXJyb3IgPSBmYWxzZTtcblxuICAgIHByb2Nlc3Mua2lsbChwcm9jZXNzSWQpO1xuXG4gICAgY29uc3Qga2lsbFRpbWVvdXRUaW1lciA9IGRlbGF5KENIRUNLX1BST0NFU1NfSVNfS0lMTEVEX1RJTUVPVVQpXG4gICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHRpbWVvdXRFcnJvciA9IHRydWU7XG4gICAgICAgIH0pO1xuXG4gICAgcmV0dXJuIFByb21pc2UucmFjZShba2lsbFRpbWVvdXRUaW1lciwgY2hlY2tVbml4UHJvY2Vzc0lzS2lsbGVkKHByb2Nlc3NJZCldKS50aGVuKCgpID0+IHtcbiAgICAgICAgaWYgKHRpbWVvdXRFcnJvcilcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihraWxsUHJvY2Vzc1RpbWVvdXRFcnJvcik7XG4gICAgfSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHJ1bldNSUMgKGFyZ3MpIHtcbiAgICBjb25zdCB3bWljUHJvY2VzcyA9IHNwYXduKCd3bWljLmV4ZScsIGFyZ3MsIHsgZGV0YWNoZWQ6IHRydWUgfSk7XG5cbiAgICBsZXQgd21pY091dHB1dCAgPSAnJztcblxuICAgIHdtaWNQcm9jZXNzLnN0ZG91dC5vbignZGF0YScsIGRhdGEgPT4ge1xuICAgICAgICB3bWljT3V0cHV0ICs9IGRhdGEudG9TdHJpbmcoKTtcbiAgICB9KTtcblxuICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IFByb21pc2UucmFjZShbXG4gICAgICAgICAgICBwcm9taXNpZnlFdmVudCh3bWljUHJvY2Vzcy5zdGRvdXQsICdlbmQnKSxcbiAgICAgICAgICAgIHByb21pc2lmeUV2ZW50KHdtaWNQcm9jZXNzLCAnZXJyb3InKVxuICAgICAgICBdKTtcblxuICAgICAgICByZXR1cm4gd21pY091dHB1dDtcbiAgICB9XG4gICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gZmluZFByb2Nlc3NXaW4gKGJyb3dzZXJJZCkge1xuICAgIGNvbnN0IHdtaWNBcmdzICAgID0gWydwcm9jZXNzJywgJ3doZXJlJywgYGNvbW1hbmRsaW5lIGxpa2UgJyUke2Jyb3dzZXJJZH0lJyBhbmQgbmFtZSA8PiAnY21kLmV4ZScgYW5kIG5hbWUgPD4gJ3dtaWMuZXhlJ2AsICdnZXQnLCAncHJvY2Vzc2lkJ107XG4gICAgY29uc3Qgd21pY091dHB1dCAgPSBhd2FpdCBydW5XTUlDKHdtaWNBcmdzKTtcbiAgICBsZXQgcHJvY2Vzc0xpc3QgPSB3bWljT3V0cHV0LnNwbGl0KC9cXHMqXFxuLyk7XG5cbiAgICBwcm9jZXNzTGlzdCA9IHByb2Nlc3NMaXN0XG4gICAgLy8gTk9URTogcmVtb3ZlIGxpc3QncyBoZWFkZXIgYW5kIGVtcHR5IGxhc3QgZWxlbWVudCwgY2F1c2VkIGJ5IHRyYWlsaW5nIG5ld2xpbmVcbiAgICAgICAgLnNsaWNlKDEsIC0xKVxuICAgICAgICAubWFwKHBpZCA9PiAoeyBwaWQ6IE51bWJlcihwaWQpIH0pKTtcblxuICAgIHJldHVybiBwcm9jZXNzTGlzdFswXSA/IHByb2Nlc3NMaXN0WzBdLnBpZCA6IG51bGw7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBraWxsQnJvd3NlclByb2Nlc3MgKGJyb3dzZXJJZCkge1xuICAgIGNvbnN0IHByb2Nlc3NJZCA9IE9TLndpbiA/IGF3YWl0IGZpbmRQcm9jZXNzV2luKGJyb3dzZXJJZCkgOiBhd2FpdCBmaW5kUHJvY2Vzc1VuaXgoYnJvd3NlcklkKTtcblxuICAgIGlmICghcHJvY2Vzc0lkKVxuICAgICAgICByZXR1cm4gdHJ1ZTtcblxuICAgIHRyeSB7XG4gICAgICAgIGlmIChPUy53aW4pXG4gICAgICAgICAgICBwcm9jZXNzLmtpbGwocHJvY2Vzc0lkKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgYXdhaXQga2lsbFByb2Nlc3NVbml4KHByb2Nlc3NJZCk7XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGNhdGNoIChlKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59XG4iXX0=
