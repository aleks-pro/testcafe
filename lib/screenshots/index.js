'use strict';

exports.__esModule = true;

var _lodash = require('lodash');

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _capturer = require('./capturer');

var _capturer2 = _interopRequireDefault(_capturer);

var _pathPattern = require('../utils/path-pattern');

var _pathPattern2 = _interopRequireDefault(_pathPattern);

var _getCommonPath = require('../utils/get-common-path');

var _getCommonPath2 = _interopRequireDefault(_getCommonPath);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const SCREENSHOT_EXTENSION = 'png';

class Screenshots {
    constructor(path, pattern) {
        this.enabled = !!path;
        this.screenshotsPath = path;
        this.screenshotsPattern = pattern;
        this.testEntries = [];
        this.now = (0, _moment2.default)();
    }

    _addTestEntry(test) {
        const testEntry = {
            test: test,
            screenshots: []
        };

        this.testEntries.push(testEntry);

        return testEntry;
    }

    _getTestEntry(test) {
        return (0, _lodash.find)(this.testEntries, entry => entry.test === test);
    }

    _ensureTestEntry(test) {
        let testEntry = this._getTestEntry(test);

        if (!testEntry) testEntry = this._addTestEntry(test);

        return testEntry;
    }

    getScreenshotsInfo(test) {
        return this._getTestEntry(test).screenshots;
    }

    hasCapturedFor(test) {
        return this.getScreenshotsInfo(test).length > 0;
    }

    getPathFor(test) {
        const testEntry = this._getTestEntry(test);
        const screenshotPaths = testEntry.screenshots.map(screenshot => screenshot.screenshotPath);

        return (0, _getCommonPath2.default)(screenshotPaths);
    }

    createCapturerFor(test, testIndex, quarantine, connection, warningLog) {
        const testEntry = this._ensureTestEntry(test);
        const pathPattern = new _pathPattern2.default(this.screenshotsPattern, SCREENSHOT_EXTENSION, {
            testIndex,
            quarantineAttempt: quarantine ? quarantine.getNextAttemptNumber() : null,
            now: this.now,
            fixture: test.fixture.name,
            test: test.name,
            parsedUserAgent: connection.browserInfo.parsedUserAgent
        });

        return new _capturer2.default(this.screenshotsPath, testEntry, connection, pathPattern, warningLog);
    }
}
exports.default = Screenshots;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zY3JlZW5zaG90cy9pbmRleC5qcyJdLCJuYW1lcyI6WyJTQ1JFRU5TSE9UX0VYVEVOU0lPTiIsIlNjcmVlbnNob3RzIiwiY29uc3RydWN0b3IiLCJwYXRoIiwicGF0dGVybiIsImVuYWJsZWQiLCJzY3JlZW5zaG90c1BhdGgiLCJzY3JlZW5zaG90c1BhdHRlcm4iLCJ0ZXN0RW50cmllcyIsIm5vdyIsIl9hZGRUZXN0RW50cnkiLCJ0ZXN0IiwidGVzdEVudHJ5Iiwic2NyZWVuc2hvdHMiLCJwdXNoIiwiX2dldFRlc3RFbnRyeSIsImVudHJ5IiwiX2Vuc3VyZVRlc3RFbnRyeSIsImdldFNjcmVlbnNob3RzSW5mbyIsImhhc0NhcHR1cmVkRm9yIiwibGVuZ3RoIiwiZ2V0UGF0aEZvciIsInNjcmVlbnNob3RQYXRocyIsIm1hcCIsInNjcmVlbnNob3QiLCJzY3JlZW5zaG90UGF0aCIsImNyZWF0ZUNhcHR1cmVyRm9yIiwidGVzdEluZGV4IiwicXVhcmFudGluZSIsImNvbm5lY3Rpb24iLCJ3YXJuaW5nTG9nIiwicGF0aFBhdHRlcm4iLCJxdWFyYW50aW5lQXR0ZW1wdCIsImdldE5leHRBdHRlbXB0TnVtYmVyIiwiZml4dHVyZSIsIm5hbWUiLCJwYXJzZWRVc2VyQWdlbnQiLCJicm93c2VySW5mbyJdLCJtYXBwaW5ncyI6Ijs7OztBQUFBOztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7QUFHQSxNQUFNQSx1QkFBdUIsS0FBN0I7O0FBRWUsTUFBTUMsV0FBTixDQUFrQjtBQUM3QkMsZ0JBQWFDLElBQWIsRUFBbUJDLE9BQW5CLEVBQTRCO0FBQ3hCLGFBQUtDLE9BQUwsR0FBMEIsQ0FBQyxDQUFDRixJQUE1QjtBQUNBLGFBQUtHLGVBQUwsR0FBMEJILElBQTFCO0FBQ0EsYUFBS0ksa0JBQUwsR0FBMEJILE9BQTFCO0FBQ0EsYUFBS0ksV0FBTCxHQUEwQixFQUExQjtBQUNBLGFBQUtDLEdBQUwsR0FBMEIsdUJBQTFCO0FBQ0g7O0FBRURDLGtCQUFlQyxJQUFmLEVBQXFCO0FBQ2pCLGNBQU1DLFlBQVk7QUFDZEQsa0JBQWFBLElBREM7QUFFZEUseUJBQWE7QUFGQyxTQUFsQjs7QUFLQSxhQUFLTCxXQUFMLENBQWlCTSxJQUFqQixDQUFzQkYsU0FBdEI7O0FBRUEsZUFBT0EsU0FBUDtBQUNIOztBQUVERyxrQkFBZUosSUFBZixFQUFxQjtBQUNqQixlQUFPLGtCQUFLLEtBQUtILFdBQVYsRUFBdUJRLFNBQVNBLE1BQU1MLElBQU4sS0FBZUEsSUFBL0MsQ0FBUDtBQUNIOztBQUVETSxxQkFBa0JOLElBQWxCLEVBQXdCO0FBQ3BCLFlBQUlDLFlBQVksS0FBS0csYUFBTCxDQUFtQkosSUFBbkIsQ0FBaEI7O0FBRUEsWUFBSSxDQUFDQyxTQUFMLEVBQ0lBLFlBQVksS0FBS0YsYUFBTCxDQUFtQkMsSUFBbkIsQ0FBWjs7QUFFSixlQUFPQyxTQUFQO0FBQ0g7O0FBRURNLHVCQUFvQlAsSUFBcEIsRUFBMEI7QUFDdEIsZUFBTyxLQUFLSSxhQUFMLENBQW1CSixJQUFuQixFQUF5QkUsV0FBaEM7QUFDSDs7QUFFRE0sbUJBQWdCUixJQUFoQixFQUFzQjtBQUNsQixlQUFPLEtBQUtPLGtCQUFMLENBQXdCUCxJQUF4QixFQUE4QlMsTUFBOUIsR0FBdUMsQ0FBOUM7QUFDSDs7QUFFREMsZUFBWVYsSUFBWixFQUFrQjtBQUNkLGNBQU1DLFlBQWtCLEtBQUtHLGFBQUwsQ0FBbUJKLElBQW5CLENBQXhCO0FBQ0EsY0FBTVcsa0JBQWtCVixVQUFVQyxXQUFWLENBQXNCVSxHQUF0QixDQUEwQkMsY0FBY0EsV0FBV0MsY0FBbkQsQ0FBeEI7O0FBRUEsZUFBTyw2QkFBY0gsZUFBZCxDQUFQO0FBQ0g7O0FBRURJLHNCQUFtQmYsSUFBbkIsRUFBeUJnQixTQUF6QixFQUFvQ0MsVUFBcEMsRUFBZ0RDLFVBQWhELEVBQTREQyxVQUE1RCxFQUF3RTtBQUNwRSxjQUFNbEIsWUFBYyxLQUFLSyxnQkFBTCxDQUFzQk4sSUFBdEIsQ0FBcEI7QUFDQSxjQUFNb0IsY0FBYywwQkFBZ0IsS0FBS3hCLGtCQUFyQixFQUF5Q1Asb0JBQXpDLEVBQStEO0FBQy9FMkIscUJBRCtFO0FBRS9FSywrQkFBbUJKLGFBQWFBLFdBQVdLLG9CQUFYLEVBQWIsR0FBaUQsSUFGVztBQUcvRXhCLGlCQUFtQixLQUFLQSxHQUh1RDtBQUkvRXlCLHFCQUFtQnZCLEtBQUt1QixPQUFMLENBQWFDLElBSitDO0FBSy9FeEIsa0JBQW1CQSxLQUFLd0IsSUFMdUQ7QUFNL0VDLDZCQUFtQlAsV0FBV1EsV0FBWCxDQUF1QkQ7QUFOcUMsU0FBL0QsQ0FBcEI7O0FBU0EsZUFBTyx1QkFBYSxLQUFLOUIsZUFBbEIsRUFBbUNNLFNBQW5DLEVBQThDaUIsVUFBOUMsRUFBMERFLFdBQTFELEVBQXVFRCxVQUF2RSxDQUFQO0FBQ0g7QUE1RDRCO2tCQUFaN0IsVyIsImZpbGUiOiJzY3JlZW5zaG90cy9pbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGZpbmQgfSBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IG1vbWVudCBmcm9tICdtb21lbnQnO1xuaW1wb3J0IENhcHR1cmVyIGZyb20gJy4vY2FwdHVyZXInO1xuaW1wb3J0IFBhdGhQYXR0ZXJuIGZyb20gJy4uL3V0aWxzL3BhdGgtcGF0dGVybic7XG5pbXBvcnQgZ2V0Q29tbW9uUGF0aCBmcm9tICcuLi91dGlscy9nZXQtY29tbW9uLXBhdGgnO1xuXG5cbmNvbnN0IFNDUkVFTlNIT1RfRVhURU5TSU9OID0gJ3BuZyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNjcmVlbnNob3RzIHtcbiAgICBjb25zdHJ1Y3RvciAocGF0aCwgcGF0dGVybikge1xuICAgICAgICB0aGlzLmVuYWJsZWQgICAgICAgICAgICA9ICEhcGF0aDtcbiAgICAgICAgdGhpcy5zY3JlZW5zaG90c1BhdGggICAgPSBwYXRoO1xuICAgICAgICB0aGlzLnNjcmVlbnNob3RzUGF0dGVybiA9IHBhdHRlcm47XG4gICAgICAgIHRoaXMudGVzdEVudHJpZXMgICAgICAgID0gW107XG4gICAgICAgIHRoaXMubm93ICAgICAgICAgICAgICAgID0gbW9tZW50KCk7XG4gICAgfVxuXG4gICAgX2FkZFRlc3RFbnRyeSAodGVzdCkge1xuICAgICAgICBjb25zdCB0ZXN0RW50cnkgPSB7XG4gICAgICAgICAgICB0ZXN0OiAgICAgICAgdGVzdCxcbiAgICAgICAgICAgIHNjcmVlbnNob3RzOiBbXVxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMudGVzdEVudHJpZXMucHVzaCh0ZXN0RW50cnkpO1xuXG4gICAgICAgIHJldHVybiB0ZXN0RW50cnk7XG4gICAgfVxuXG4gICAgX2dldFRlc3RFbnRyeSAodGVzdCkge1xuICAgICAgICByZXR1cm4gZmluZCh0aGlzLnRlc3RFbnRyaWVzLCBlbnRyeSA9PiBlbnRyeS50ZXN0ID09PSB0ZXN0KTtcbiAgICB9XG5cbiAgICBfZW5zdXJlVGVzdEVudHJ5ICh0ZXN0KSB7XG4gICAgICAgIGxldCB0ZXN0RW50cnkgPSB0aGlzLl9nZXRUZXN0RW50cnkodGVzdCk7XG5cbiAgICAgICAgaWYgKCF0ZXN0RW50cnkpXG4gICAgICAgICAgICB0ZXN0RW50cnkgPSB0aGlzLl9hZGRUZXN0RW50cnkodGVzdCk7XG5cbiAgICAgICAgcmV0dXJuIHRlc3RFbnRyeTtcbiAgICB9XG5cbiAgICBnZXRTY3JlZW5zaG90c0luZm8gKHRlc3QpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2dldFRlc3RFbnRyeSh0ZXN0KS5zY3JlZW5zaG90cztcbiAgICB9XG5cbiAgICBoYXNDYXB0dXJlZEZvciAodGVzdCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTY3JlZW5zaG90c0luZm8odGVzdCkubGVuZ3RoID4gMDtcbiAgICB9XG5cbiAgICBnZXRQYXRoRm9yICh0ZXN0KSB7XG4gICAgICAgIGNvbnN0IHRlc3RFbnRyeSAgICAgICA9IHRoaXMuX2dldFRlc3RFbnRyeSh0ZXN0KTtcbiAgICAgICAgY29uc3Qgc2NyZWVuc2hvdFBhdGhzID0gdGVzdEVudHJ5LnNjcmVlbnNob3RzLm1hcChzY3JlZW5zaG90ID0+IHNjcmVlbnNob3Quc2NyZWVuc2hvdFBhdGgpO1xuXG4gICAgICAgIHJldHVybiBnZXRDb21tb25QYXRoKHNjcmVlbnNob3RQYXRocyk7XG4gICAgfVxuXG4gICAgY3JlYXRlQ2FwdHVyZXJGb3IgKHRlc3QsIHRlc3RJbmRleCwgcXVhcmFudGluZSwgY29ubmVjdGlvbiwgd2FybmluZ0xvZykge1xuICAgICAgICBjb25zdCB0ZXN0RW50cnkgICA9IHRoaXMuX2Vuc3VyZVRlc3RFbnRyeSh0ZXN0KTtcbiAgICAgICAgY29uc3QgcGF0aFBhdHRlcm4gPSBuZXcgUGF0aFBhdHRlcm4odGhpcy5zY3JlZW5zaG90c1BhdHRlcm4sIFNDUkVFTlNIT1RfRVhURU5TSU9OLCB7XG4gICAgICAgICAgICB0ZXN0SW5kZXgsXG4gICAgICAgICAgICBxdWFyYW50aW5lQXR0ZW1wdDogcXVhcmFudGluZSA/IHF1YXJhbnRpbmUuZ2V0TmV4dEF0dGVtcHROdW1iZXIoKSA6IG51bGwsXG4gICAgICAgICAgICBub3c6ICAgICAgICAgICAgICAgdGhpcy5ub3csXG4gICAgICAgICAgICBmaXh0dXJlOiAgICAgICAgICAgdGVzdC5maXh0dXJlLm5hbWUsXG4gICAgICAgICAgICB0ZXN0OiAgICAgICAgICAgICAgdGVzdC5uYW1lLFxuICAgICAgICAgICAgcGFyc2VkVXNlckFnZW50OiAgIGNvbm5lY3Rpb24uYnJvd3NlckluZm8ucGFyc2VkVXNlckFnZW50LFxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gbmV3IENhcHR1cmVyKHRoaXMuc2NyZWVuc2hvdHNQYXRoLCB0ZXN0RW50cnksIGNvbm5lY3Rpb24sIHBhdGhQYXR0ZXJuLCB3YXJuaW5nTG9nKTtcbiAgICB9XG59XG4iXX0=
