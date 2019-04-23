'use strict';

exports.__esModule = true;

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _readFileRelative = require('read-file-relative');

var _http = require('../../utils/http');

var _remotesQueue = require('./remotes-queue');

var _remotesQueue2 = _interopRequireDefault(_remotesQueue);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Const
const IDLE_PAGE_SCRIPT = (0, _readFileRelative.readSync)('../../client/browser/idle-page/index.js');
const IDLE_PAGE_STYLE = (0, _readFileRelative.readSync)('../../client/browser/idle-page/styles.css');
const IDLE_PAGE_LOGO = (0, _readFileRelative.readSync)('../../client/browser/idle-page/logo.svg', true);

// Gateway
class BrowserConnectionGateway {
    constructor(proxy, options = {}) {
        this.connections = {};
        this.remotesQueue = new _remotesQueue2.default();
        this.domain = proxy.server1Info.domain;

        this.connectUrl = `${this.domain}/browser/connect`;

        this.retryTestPages = options.retryTestPages;

        this._registerRoutes(proxy);
    }

    _dispatch(url, proxy, handler, method = 'GET') {
        proxy[method](url, (req, res, si, params) => {
            const connection = this.connections[params.id];

            (0, _http.preventCaching)(res);

            if (connection) handler(req, res, connection);else (0, _http.respond404)(res);
        });
    }

    _registerRoutes(proxy) {
        this._dispatch('/browser/connect/{id}', proxy, BrowserConnectionGateway.onConnection);
        this._dispatch('/browser/heartbeat/{id}', proxy, BrowserConnectionGateway.onHeartbeat);
        this._dispatch('/browser/idle/{id}', proxy, BrowserConnectionGateway.onIdle);
        this._dispatch('/browser/idle-forced/{id}', proxy, BrowserConnectionGateway.onIdleForced);
        this._dispatch('/browser/status/{id}', proxy, BrowserConnectionGateway.onStatusRequest);
        this._dispatch('/browser/status-done/{id}', proxy, BrowserConnectionGateway.onStatusRequestOnTestDone);
        this._dispatch('/browser/init-script/{id}', proxy, BrowserConnectionGateway.onInitScriptRequest);
        this._dispatch('/browser/init-script/{id}', proxy, BrowserConnectionGateway.onInitScriptResponse, 'POST');

        proxy.GET('/browser/connect', (req, res) => this._connectNextRemoteBrowser(req, res));
        proxy.GET('/browser/connect/', (req, res) => this._connectNextRemoteBrowser(req, res));

        proxy.GET('/browser/assets/index.js', { content: IDLE_PAGE_SCRIPT, contentType: 'application/x-javascript' });
        proxy.GET('/browser/assets/styles.css', { content: IDLE_PAGE_STYLE, contentType: 'text/css' });
        proxy.GET('/browser/assets/logo.svg', { content: IDLE_PAGE_LOGO, contentType: 'image/svg+xml' });
    }

    // Helpers
    static ensureConnectionReady(res, connection) {
        if (!connection.ready) {
            (0, _http.respond500)(res, 'The connection is not ready yet.');
            return false;
        }

        return true;
    }

    // Route handlers
    static onConnection(req, res, connection) {
        if (connection.ready) (0, _http.respond500)(res, 'The connection is already established.');else {
            const userAgent = req.headers['user-agent'];

            connection.establish(userAgent);
            (0, _http.redirect)(res, connection.idleUrl);
        }
    }

    static onHeartbeat(req, res, connection) {
        if (BrowserConnectionGateway.ensureConnectionReady(res, connection)) {
            const status = connection.heartbeat();

            (0, _http.respondWithJSON)(res, status);
        }
    }

    static onIdle(req, res, connection) {
        if (BrowserConnectionGateway.ensureConnectionReady(res, connection)) res.end(connection.renderIdlePage());
    }

    static onIdleForced(req, res, connection) {
        return (0, _asyncToGenerator3.default)(function* () {
            if (BrowserConnectionGateway.ensureConnectionReady(res, connection)) {
                const status = yield connection.getStatus(true);

                (0, _http.redirect)(res, status.url);
            }
        })();
    }

    static onStatusRequest(req, res, connection) {
        return (0, _asyncToGenerator3.default)(function* () {
            return BrowserConnectionGateway._onStatusRequestCore(req, res, connection, false);
        })();
    }

    static onStatusRequestOnTestDone(req, res, connection) {
        return (0, _asyncToGenerator3.default)(function* () {
            return BrowserConnectionGateway._onStatusRequestCore(req, res, connection, true);
        })();
    }

    static _onStatusRequestCore(req, res, connection, isTestDone) {
        return (0, _asyncToGenerator3.default)(function* () {
            if (BrowserConnectionGateway.ensureConnectionReady(res, connection)) {
                const status = yield connection.getStatus(isTestDone);

                (0, _http.respondWithJSON)(res, status);
            }
        })();
    }

    static onInitScriptRequest(req, res, connection) {
        if (BrowserConnectionGateway.ensureConnectionReady(res, connection)) {
            const script = connection.getInitScript();

            (0, _http.respondWithJSON)(res, script);
        }
    }

    static onInitScriptResponse(req, res, connection) {
        if (BrowserConnectionGateway.ensureConnectionReady(res, connection)) {
            let data = '';

            req.on('data', chunk => {
                data += chunk;
            });

            req.on('end', () => {
                connection.handleInitScriptResult(data);

                res.end();
            });
        }
    }

    _connectNextRemoteBrowser(req, res) {
        var _this = this;

        return (0, _asyncToGenerator3.default)(function* () {
            (0, _http.preventCaching)(res);

            const remoteConnection = yield _this.remotesQueue.shift();

            if (remoteConnection) (0, _http.redirect)(res, remoteConnection.url);else (0, _http.respond500)(res, 'There are no available connections to establish.');
        })();
    }

    // API
    startServingConnection(connection) {
        this.connections[connection.id] = connection;

        if (connection.browserInfo.providerName === 'remote') this.remotesQueue.add(connection);
    }

    stopServingConnection(connection) {
        delete this.connections[connection.id];

        if (connection.browserInfo.providerName === 'remote') this.remotesQueue.remove(connection);
    }

    close() {
        (0, _keys2.default)(this.connections).forEach(id => this.connections[id].close());
    }
}
exports.default = BrowserConnectionGateway;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9icm93c2VyL2Nvbm5lY3Rpb24vZ2F0ZXdheS5qcyJdLCJuYW1lcyI6WyJJRExFX1BBR0VfU0NSSVBUIiwiSURMRV9QQUdFX1NUWUxFIiwiSURMRV9QQUdFX0xPR08iLCJCcm93c2VyQ29ubmVjdGlvbkdhdGV3YXkiLCJjb25zdHJ1Y3RvciIsInByb3h5Iiwib3B0aW9ucyIsImNvbm5lY3Rpb25zIiwicmVtb3Rlc1F1ZXVlIiwiZG9tYWluIiwic2VydmVyMUluZm8iLCJjb25uZWN0VXJsIiwicmV0cnlUZXN0UGFnZXMiLCJfcmVnaXN0ZXJSb3V0ZXMiLCJfZGlzcGF0Y2giLCJ1cmwiLCJoYW5kbGVyIiwibWV0aG9kIiwicmVxIiwicmVzIiwic2kiLCJwYXJhbXMiLCJjb25uZWN0aW9uIiwiaWQiLCJvbkNvbm5lY3Rpb24iLCJvbkhlYXJ0YmVhdCIsIm9uSWRsZSIsIm9uSWRsZUZvcmNlZCIsIm9uU3RhdHVzUmVxdWVzdCIsIm9uU3RhdHVzUmVxdWVzdE9uVGVzdERvbmUiLCJvbkluaXRTY3JpcHRSZXF1ZXN0Iiwib25Jbml0U2NyaXB0UmVzcG9uc2UiLCJHRVQiLCJfY29ubmVjdE5leHRSZW1vdGVCcm93c2VyIiwiY29udGVudCIsImNvbnRlbnRUeXBlIiwiZW5zdXJlQ29ubmVjdGlvblJlYWR5IiwicmVhZHkiLCJ1c2VyQWdlbnQiLCJoZWFkZXJzIiwiZXN0YWJsaXNoIiwiaWRsZVVybCIsInN0YXR1cyIsImhlYXJ0YmVhdCIsImVuZCIsInJlbmRlcklkbGVQYWdlIiwiZ2V0U3RhdHVzIiwiX29uU3RhdHVzUmVxdWVzdENvcmUiLCJpc1Rlc3REb25lIiwic2NyaXB0IiwiZ2V0SW5pdFNjcmlwdCIsImRhdGEiLCJvbiIsImNodW5rIiwiaGFuZGxlSW5pdFNjcmlwdFJlc3VsdCIsInJlbW90ZUNvbm5lY3Rpb24iLCJzaGlmdCIsInN0YXJ0U2VydmluZ0Nvbm5lY3Rpb24iLCJicm93c2VySW5mbyIsInByb3ZpZGVyTmFtZSIsImFkZCIs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LEtBQUtmLFdBQUwsQ0FBaUJlLFdBQVdDLEVBQTVCLENBQVA7O0FBRUEsWUFBSUQsV0FBV29DLFdBQVgsQ0FBdUJDLFlBQXZCLEtBQXdDLFFBQTVDLEVBQ0ksS0FBS25ELFlBQUwsQ0FBa0JzRCxNQUFsQixDQUF5QnhDLFVBQXpCO0FBQ1A7O0FBRUR5QyxZQUFTO0FBQ0wsNEJBQVksS0FBS3hELFdBQWpCLEVBQThCeUQsT0FBOUIsQ0FBc0N6QyxNQUFNLEtBQUtoQixXQUFMLENBQWlCZ0IsRUFBakIsRUFBcUJ3QyxLQUFyQixFQUE1QztBQUNIO0FBN0p5QztrQkFBekI1RCx3QiIsImZpbGUiOiJicm93c2VyL2Nvbm5lY3Rpb24vZ2F0ZXdheS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHJlYWRTeW5jIGFzIHJlYWQgfSBmcm9tICdyZWFkLWZpbGUtcmVsYXRpdmUnO1xuaW1wb3J0IHsgcmVzcG9uZDQwNCwgcmVzcG9uZDUwMCwgcmVzcG9uZFdpdGhKU09OLCByZWRpcmVjdCwgcHJldmVudENhY2hpbmcgfSBmcm9tICcuLi8uLi91dGlscy9odHRwJztcbmltcG9ydCBSZW1vdGVzUXVldWUgZnJvbSAnLi9yZW1vdGVzLXF1ZXVlJztcblxuXG4vLyBDb25zdFxuY29uc3QgSURMRV9QQUdFX1NDUklQVCA9IHJlYWQoJy4uLy4uL2NsaWVudC9icm93c2VyL2lkbGUtcGFnZS9pbmRleC5qcycpO1xuY29uc3QgSURMRV9QQUdFX1NUWUxFICA9IHJlYWQoJy4uLy4uL2NsaWVudC9icm93c2VyL2lkbGUtcGFnZS9zdHlsZXMuY3NzJyk7XG5jb25zdCBJRExFX1BBR0VfTE9HTyAgID0gcmVhZCgnLi4vLi4vY2xpZW50L2Jyb3dzZXIvaWRsZS1wYWdlL2xvZ28uc3ZnJywgdHJ1ZSk7XG5cbi8vIEdhdGV3YXlcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJyb3dzZXJDb25uZWN0aW9uR2F0ZXdheSB7XG4gICAgY29uc3RydWN0b3IgKHByb3h5LCBvcHRpb25zID0ge30pIHtcbiAgICAgICAgdGhpcy5jb25uZWN0aW9ucyAgPSB7fTtcbiAgICAgICAgdGhpcy5yZW1vdGVzUXVldWUgPSBuZXcgUmVtb3Rlc1F1ZXVlKCk7XG4gICAgICAgIHRoaXMuZG9tYWluICAgICAgID0gcHJveHkuc2VydmVyMUluZm8uZG9tYWluO1xuXG4gICAgICAgIHRoaXMuY29ubmVjdFVybCA9IGAke3RoaXMuZG9tYWlufS9icm93c2VyL2Nvbm5lY3RgO1xuXG4gICAgICAgIHRoaXMucmV0cnlUZXN0UGFnZXMgPSBvcHRpb25zLnJldHJ5VGVzdFBhZ2VzO1xuXG4gICAgICAgIHRoaXMuX3JlZ2lzdGVyUm91dGVzKHByb3h5KTtcbiAgICB9XG5cbiAgICBfZGlzcGF0Y2ggKHVybCwgcHJveHksIGhhbmRsZXIsIG1ldGhvZCA9ICdHRVQnKSB7XG4gICAgICAgIHByb3h5W21ldGhvZF0odXJsLCAocmVxLCByZXMsIHNpLCBwYXJhbXMpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGNvbm5lY3Rpb24gPSB0aGlzLmNvbm5lY3Rpb25zW3BhcmFtcy5pZF07XG5cbiAgICAgICAgICAgIHByZXZlbnRDYWNoaW5nKHJlcyk7XG5cbiAgICAgICAgICAgIGlmIChjb25uZWN0aW9uKVxuICAgICAgICAgICAgICAgIGhhbmRsZXIocmVxLCByZXMsIGNvbm5lY3Rpb24pO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHJlc3BvbmQ0MDQocmVzKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgX3JlZ2lzdGVyUm91dGVzIChwcm94eSkge1xuICAgICAgICB0aGlzLl9kaXNwYXRjaCgnL2Jyb3dzZXIvY29ubmVjdC97aWR9JywgcHJveHksIEJyb3dzZXJDb25uZWN0aW9uR2F0ZXdheS5vbkNvbm5lY3Rpb24pO1xuICAgICAgICB0aGlzLl9kaXNwYXRjaCgnL2Jyb3dzZXIvaGVhcnRiZWF0L3tpZH0nLCBwcm94eSwgQnJvd3NlckNvbm5lY3Rpb25HYXRld2F5Lm9uSGVhcnRiZWF0KTtcbiAgICAgICAgdGhpcy5fZGlzcGF0Y2goJy9icm93c2VyL2lkbGUve2lkfScsIHByb3h5LCBCcm93c2VyQ29ubmVjdGlvbkdhdGV3YXkub25JZGxlKTtcbiAgICAgICAgdGhpcy5fZGlzcGF0Y2goJy9icm93c2VyL2lkbGUtZm9yY2VkL3tpZH0nLCBwcm94eSwgQnJvd3NlckNvbm5lY3Rpb25HYXRld2F5Lm9uSWRsZUZvcmNlZCk7XG4gICAgICAgIHRoaXMuX2Rpc3BhdGNoKCcvYnJvd3Nlci9zdGF0dXMve2lkfScsIHByb3h5LCBCcm93c2VyQ29ubmVjdGlvbkdhdGV3YXkub25TdGF0dXNSZXF1ZXN0KTtcbiAgICAgICAgdGhpcy5fZGlzcGF0Y2goJy9icm93c2VyL3N0YXR1cy1kb25lL3tpZH0nLCBwcm94eSwgQnJvd3NlckNvbm5lY3Rpb25HYXRld2F5Lm9uU3RhdHVzUmVxdWVzdE9uVGVzdERvbmUpO1xuICAgICAgICB0aGlzLl9kaXNwYXRjaCgnL2Jyb3dzZXIvaW5pdC1zY3JpcHQve2lkfScsIHByb3h5LCBCcm93c2VyQ29ubmVjdGlvbkdhdGV3YXkub25Jbml0U2NyaXB0UmVxdWVzdCk7XG4gICAgICAgIHRoaXMuX2Rpc3BhdGNoKCcvYnJvd3Nlci9pbml0LXNjcmlwdC97aWR9JywgcHJveHksIEJyb3dzZXJDb25uZWN0aW9uR2F0ZXdheS5vbkluaXRTY3JpcHRSZXNwb25zZSwgJ1BPU1QnKTtcblxuICAgICAgICBwcm94eS5HRVQoJy9icm93c2VyL2Nvbm5lY3QnLCAocmVxLCByZXMpID0+IHRoaXMuX2Nvbm5lY3ROZXh0UmVtb3RlQnJvd3NlcihyZXEsIHJlcykpO1xuICAgICAgICBwcm94eS5HRVQoJy9icm93c2VyL2Nvbm5lY3QvJywgKHJlcSwgcmVzKSA9PiB0aGlzLl9jb25uZWN0TmV4dFJlbW90ZUJyb3dzZXIocmVxLCByZXMpKTtcblxuICAgICAgICBwcm94eS5HRVQoJy9icm93c2VyL2Fzc2V0cy9pbmRleC5qcycsIHsgY29udGVudDogSURMRV9QQUdFX1NDUklQVCwgY29udGVudFR5cGU6ICdhcHBsaWNhdGlvbi94LWphdmFzY3JpcHQnIH0pO1xuICAgICAgICBwcm94eS5HRVQoJy9icm93c2VyL2Fzc2V0cy9zdHlsZXMuY3NzJywgeyBjb250ZW50OiBJRExFX1BBR0VfU1RZTEUsIGNvbnRlbnRUeXBlOiAndGV4dC9jc3MnIH0pO1xuICAgICAgICBwcm94eS5HRVQoJy9icm93c2VyL2Fzc2V0cy9sb2dvLnN2ZycsIHsgY29udGVudDogSURMRV9QQUdFX0xPR08sIGNvbnRlbnRUeXBlOiAnaW1hZ2Uvc3ZnK3htbCcgfSk7XG4gICAgfVxuXG4gICAgLy8gSGVscGVyc1xuICAgIHN0YXRpYyBlbnN1cmVDb25uZWN0aW9uUmVhZHkgKHJlcywgY29ubmVjdGlvbikge1xuICAgICAgICBpZiAoIWNvbm5lY3Rpb24ucmVhZHkpIHtcbiAgICAgICAgICAgIHJlc3BvbmQ1MDAocmVzLCAnVGhlIGNvbm5lY3Rpb24gaXMgbm90IHJlYWR5IHlldC4nKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuXG4gICAgLy8gUm91dGUgaGFuZGxlcnNcbiAgICBzdGF0aWMgb25Db25uZWN0aW9uIChyZXEsIHJlcywgY29ubmVjdGlvbikge1xuICAgICAgICBpZiAoY29ubmVjdGlvbi5yZWFkeSlcbiAgICAgICAgICAgIHJlc3BvbmQ1MDAocmVzLCAnVGhlIGNvbm5lY3Rpb24gaXMgYWxyZWFkeSBlc3RhYmxpc2hlZC4nKTtcblxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHVzZXJBZ2VudCA9IHJlcS5oZWFkZXJzWyd1c2VyLWFnZW50J107XG5cbiAgICAgICAgICAgIGNvbm5lY3Rpb24uZXN0YWJsaXNoKHVzZXJBZ2VudCk7XG4gICAgICAgICAgICByZWRpcmVjdChyZXMsIGNvbm5lY3Rpb24uaWRsZVVybCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgb25IZWFydGJlYXQgKHJlcSwgcmVzLCBjb25uZWN0aW9uKSB7XG4gICAgICAgIGlmIChCcm93c2VyQ29ubmVjdGlvbkdhdGV3YXkuZW5zdXJlQ29ubmVjdGlvblJlYWR5KHJlcywgY29ubmVjdGlvbikpIHtcbiAgICAgICAgICAgIGNvbnN0IHN0YXR1cyA9IGNvbm5lY3Rpb24uaGVhcnRiZWF0KCk7XG5cbiAgICAgICAgICAgIHJlc3BvbmRXaXRoSlNPTihyZXMsIHN0YXR1cyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgb25JZGxlIChyZXEsIHJlcywgY29ubmVjdGlvbikge1xuICAgICAgICBpZiAoQnJvd3NlckNvbm5lY3Rpb25HYXRld2F5LmVuc3VyZUNvbm5lY3Rpb25SZWFkeShyZXMsIGNvbm5lY3Rpb24pKVxuICAgICAgICAgICAgcmVzLmVuZChjb25uZWN0aW9uLnJlbmRlcklkbGVQYWdlKCkpO1xuICAgIH1cblxuICAgIHN0YXRpYyBhc3luYyBvbklkbGVGb3JjZWQgKHJlcSwgcmVzLCBjb25uZWN0aW9uKSB7XG4gICAgICAgIGlmIChCcm93c2VyQ29ubmVjdGlvbkdhdGV3YXkuZW5zdXJlQ29ubmVjdGlvblJlYWR5KHJlcywgY29ubmVjdGlvbikpIHtcbiAgICAgICAgICAgIGNvbnN0IHN0YXR1cyA9IGF3YWl0IGNvbm5lY3Rpb24uZ2V0U3RhdHVzKHRydWUpO1xuXG4gICAgICAgICAgICByZWRpcmVjdChyZXMsIHN0YXR1cy51cmwpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGljIGFzeW5jIG9uU3RhdHVzUmVxdWVzdCAocmVxLCByZXMsIGNvbm5lY3Rpb24pIHtcbiAgICAgICAgcmV0dXJuIEJyb3dzZXJDb25uZWN0aW9uR2F0ZXdheS5fb25TdGF0dXNSZXF1ZXN0Q29yZShyZXEsIHJlcywgY29ubmVjdGlvbiwgZmFsc2UpO1xuICAgIH1cblxuICAgIHN0YXRpYyBhc3luYyBvblN0YXR1c1JlcXVlc3RPblRlc3REb25lIChyZXEsIHJlcywgY29ubmVjdGlvbikge1xuICAgICAgICByZXR1cm4gQnJvd3NlckNvbm5lY3Rpb25HYXRld2F5Ll9vblN0YXR1c1JlcXVlc3RDb3JlKHJlcSwgcmVzLCBjb25uZWN0aW9uLCB0cnVlKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgYXN5bmMgX29uU3RhdHVzUmVxdWVzdENvcmUgKHJlcSwgcmVzLCBjb25uZWN0aW9uLCBpc1Rlc3REb25lKSB7XG4gICAgICAgIGlmIChCcm93c2VyQ29ubmVjdGlvbkdhdGV3YXkuZW5zdXJlQ29ubmVjdGlvblJlYWR5KHJlcywgY29ubmVjdGlvbikpIHtcbiAgICAgICAgICAgIGNvbnN0IHN0YXR1cyA9IGF3YWl0IGNvbm5lY3Rpb24uZ2V0U3RhdHVzKGlzVGVzdERvbmUpO1xuXG4gICAgICAgICAgICByZXNwb25kV2l0aEpTT04ocmVzLCBzdGF0dXMpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGljIG9uSW5pdFNjcmlwdFJlcXVlc3QgKHJlcSwgcmVzLCBjb25uZWN0aW9uKSB7XG4gICAgICAgIGlmIChCcm93c2VyQ29ubmVjdGlvbkdhdGV3YXkuZW5zdXJlQ29ubmVjdGlvblJlYWR5KHJlcywgY29ubmVjdGlvbikpIHtcbiAgICAgICAgICAgIGNvbnN0IHNjcmlwdCA9IGNvbm5lY3Rpb24uZ2V0SW5pdFNjcmlwdCgpO1xuXG4gICAgICAgICAgICByZXNwb25kV2l0aEpTT04ocmVzLCBzY3JpcHQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGljIG9uSW5pdFNjcmlwdFJlc3BvbnNlIChyZXEsIHJlcywgY29ubmVjdGlvbikge1xuICAgICAgICBpZiAoQnJvd3NlckNvbm5lY3Rpb25HYXRld2F5LmVuc3VyZUNvbm5lY3Rpb25SZWFkeShyZXMsIGNvbm5lY3Rpb24pKSB7XG4gICAgICAgICAgICBsZXQgZGF0YSA9ICcnO1xuXG4gICAgICAgICAgICByZXEub24oJ2RhdGEnLCBjaHVuayA9PiB7XG4gICAgICAgICAgICAgICAgZGF0YSArPSBjaHVuaztcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXEub24oJ2VuZCcsICgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25uZWN0aW9uLmhhbmRsZUluaXRTY3JpcHRSZXN1bHQoZGF0YSk7XG5cbiAgICAgICAgICAgICAgICByZXMuZW5kKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFzeW5jIF9jb25uZWN0TmV4dFJlbW90ZUJyb3dzZXIgKHJlcSwgcmVzKSB7XG4gICAgICAgIHByZXZlbnRDYWNoaW5nKHJlcyk7XG5cbiAgICAgICAgY29uc3QgcmVtb3RlQ29ubmVjdGlvbiA9IGF3YWl0IHRoaXMucmVtb3Rlc1F1ZXVlLnNoaWZ0KCk7XG5cbiAgICAgICAgaWYgKHJlbW90ZUNvbm5lY3Rpb24pXG4gICAgICAgICAgICByZWRpcmVjdChyZXMsIHJlbW90ZUNvbm5lY3Rpb24udXJsKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmVzcG9uZDUwMChyZXMsICdUaGVyZSBhcmUgbm8gYXZhaWxhYmxlIGNvbm5lY3Rpb25zIHRvIGVzdGFibGlzaC4nKTtcbiAgICB9XG5cbiAgICAvLyBBUElcbiAgICBzdGFydFNlcnZpbmdDb25uZWN0aW9uIChjb25uZWN0aW9uKSB7XG4gICAgICAgIHRoaXMuY29ubmVjdGlvbnNbY29ubmVjdGlvbi5pZF0gPSBjb25uZWN0aW9uO1xuXG4gICAgICAgIGlmIChjb25uZWN0aW9uLmJyb3dzZXJJbmZvLnByb3ZpZGVyTmFtZSA9PT0gJ3JlbW90ZScpXG4gICAgICAgICAgICB0aGlzLnJlbW90ZXNRdWV1ZS5hZGQoY29ubmVjdGlvbik7XG4gICAgfVxuXG4gICAgc3RvcFNlcnZpbmdDb25uZWN0aW9uIChjb25uZWN0aW9uKSB7XG4gICAgICAgIGRlbGV0ZSB0aGlzLmNvbm5lY3Rpb25zW2Nvbm5lY3Rpb24uaWRdO1xuXG4gICAgICAgIGlmIChjb25uZWN0aW9uLmJyb3dzZXJJbmZvLnByb3ZpZGVyTmFtZSA9PT0gJ3JlbW90ZScpXG4gICAgICAgICAgICB0aGlzLnJlbW90ZXNRdWV1ZS5yZW1vdmUoY29ubmVjdGlvbik7XG4gICAgfVxuXG4gICAgY2xvc2UgKCkge1xuICAgICAgICBPYmplY3Qua2V5cyh0aGlzLmNvbm5lY3Rpb25zKS5mb3JFYWNoKGlkID0+IHRoaXMuY29ubmVjdGlvbnNbaWRdLmNsb3NlKCkpO1xuICAgIH1cbn1cblxuIl19
