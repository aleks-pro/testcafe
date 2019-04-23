'use strict';

exports.__esModule = true;

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _testcafeBrowserTools = require('testcafe-browser-tools');

var _testcafeBrowserTools2 = _interopRequireDefault(_testcafeBrowserTools);

var _string = require('../../../utils/string');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
    isMultiBrowser: true,

    _handleString(str) {
        return (0, _asyncToGenerator3.default)(function* () {
            const args = (0, _string.splitQuotedText)(str, ' ', '`"\'');
            const path = args.shift();

            const browserInfo = yield _testcafeBrowserTools2.default.getBrowserInfo(path);

            if (!browserInfo) return null;

            const params = (0, _assign2.default)({}, browserInfo);

            if (args.length) params.cmd = args.join(' ') + (params.cmd ? ' ' + params.cmd : '');

            return params;
        })();
    },

    _handleJSON(str) {
        return (0, _asyncToGenerator3.default)(function* () {
            let params = null;

            try {
                params = JSON.parse(str);
            } catch (e) {
                return null;
            }

            if (!params.path) return null;

            const openParameters = yield _testcafeBrowserTools2.default.getBrowserInfo(params.path);

            if (!openParameters) return null;

            if (params.cmd) openParameters.cmd = params.cmd;

            return openParameters;
        })();
    },

    openBrowser(browserId, pageUrl, browserName) {
        var _this = this;

        return (0, _asyncToGenerator3.default)(function* () {
            const openParameters = (yield _this._handleString(browserName)) || (yield _this._handleJSON(browserName));

            if (!openParameters) throw new Error('The specified browser name is not valid!');

            yield _testcafeBrowserTools2.default.open(openParameters, pageUrl);
        })();
    },

    isLocalBrowser() {
        return (0, _asyncToGenerator3.default)(function* () {
            return true;
        })();
    }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9icm93c2VyL3Byb3ZpZGVyL2J1aWx0LWluL3BhdGguanMiXSwibmFtZXMiOlsiaXNNdWx0aUJyb3dzZXIiLCJfaGFuZGxlU3RyaW5nIiwic3RyIiwiYXJncyIsInBhdGgiLCJzaGlmdCIsImJyb3dzZXJJbmZvIiwiZ2V0QnJvd3NlckluZm8iLCJwYXJhbXMiLCJsZW5ndGgiLCJjbWQiLCJqb2luIiwiX2hhbmRsZUpTT04iLCJKU09OIiwicGFyc2UiLCJlIiwib3BlblBhcmFtZXRlcnMiLCJvcGVuQnJvd3NlciIsImJyb3dzZXJJZCIsInBhZ2VVcmwiLCJicm93c2VyTmFtZSIsIkVycm9yIiwib3BlbiIsImlzTG9jYWxCcm93c2VyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQTs7OztBQUNBOzs7O2tCQUVlO0FBQ1hBLG9CQUFnQixJQURMOztBQUdMQyxpQkFBTixDQUFxQkMsR0FBckIsRUFBMEI7QUFBQTtBQUN0QixrQkFBTUMsT0FBTyw2QkFBZ0JELEdBQWhCLEVBQXFCLEdBQXJCLEVBQTBCLE1BQTFCLENBQWI7QUFDQSxrQkFBTUUsT0FBT0QsS0FBS0UsS0FBTCxFQUFiOztBQUVBLGtCQUFNQyxjQUFjLE1BQU0sK0JBQWFDLGNBQWIsQ0FBNEJILElBQTVCLENBQTFCOztBQUVBLGdCQUFJLENBQUNFLFdBQUwsRUFDSSxPQUFPLElBQVA7O0FBRUosa0JBQU1FLFNBQVMsc0JBQWMsRUFBZCxFQUFrQkYsV0FBbEIsQ0FBZjs7QUFFQSxnQkFBSUgsS0FBS00sTUFBVCxFQUNJRCxPQUFPRSxHQUFQLEdBQWFQLEtBQUtRLElBQUwsQ0FBVSxHQUFWLEtBQWtCSCxPQUFPRSxHQUFQLEdBQWEsTUFBTUYsT0FBT0UsR0FBMUIsR0FBZ0MsRUFBbEQsQ0FBYjs7QUFFSixtQkFBT0YsTUFBUDtBQWRzQjtBQWV6QixLQWxCVTs7QUFvQkxJLGVBQU4sQ0FBbUJWLEdBQW5CLEVBQXdCO0FBQUE7QUFDcEIsZ0JBQUlNLFNBQVMsSUFBYjs7QUFFQSxnQkFBSTtBQUNBQSx5QkFBU0ssS0FBS0MsS0FBTCxDQUFXWixHQUFYLENBQVQ7QUFDSCxhQUZELENBR0EsT0FBT2EsQ0FBUCxFQUFVO0FBQ04sdUJBQU8sSUFBUDtBQUNIOztBQUVELGdCQUFJLENBQUNQLE9BQU9KLElBQVosRUFDSSxPQUFPLElBQVA7O0FBRUosa0JBQU1ZLGlCQUFpQixNQUFNLCtCQUFhVCxjQUFiLENBQTRCQyxPQUFPSixJQUFuQyxDQUE3Qjs7QUFFQSxnQkFBSSxDQUFDWSxjQUFMLEVBQ0ksT0FBTyxJQUFQOztBQUVKLGdCQUFJUixPQUFPRSxHQUFYLEVBQ0lNLGVBQWVOLEdBQWYsR0FBcUJGLE9BQU9FLEdBQTVCOztBQUVKLG1CQUFPTSxjQUFQO0FBckJvQjtBQXNCdkIsS0ExQ1U7O0FBNENMQyxlQUFOLENBQW1CQyxTQUFuQixFQUE4QkMsT0FBOUIsRUFBdUNDLFdBQXZDLEVBQW9EO0FBQUE7O0FBQUE7QUFDaEQsa0JBQU1KLGlCQUFpQixPQUFNLE1BQUtmLGFBQUwsQ0FBbUJtQixXQUFuQixDQUFOLE1BQXlDLE1BQU0sTUFBS1IsV0FBTCxDQUFpQlEsV0FBakIsQ0FBL0MsQ0FBdkI7O0FBRUEsZ0JBQUksQ0FBQ0osY0FBTCxFQUNJLE1BQU0sSUFBSUssS0FBSixDQUFVLDBDQUFWLENBQU47O0FBRUosa0JBQU0sK0JBQWFDLElBQWIsQ0FBa0JOLGNBQWxCLEVBQWtDRyxPQUFsQyxDQUFOO0FBTmdEO0FBT25ELEtBbkRVOztBQXFETEksa0JBQU4sR0FBd0I7QUFBQTtBQUNwQixtQkFBTyxJQUFQO0FBRG9CO0FBRXZCO0FBdkRVLEMiLCJmaWxlIjoiYnJvd3Nlci9wcm92aWRlci9idWlsdC1pbi9wYXRoLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGJyb3dzZXJUb29scyBmcm9tICd0ZXN0Y2FmZS1icm93c2VyLXRvb2xzJztcbmltcG9ydCB7IHNwbGl0UXVvdGVkVGV4dCB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL3N0cmluZyc7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgICBpc011bHRpQnJvd3NlcjogdHJ1ZSxcblxuICAgIGFzeW5jIF9oYW5kbGVTdHJpbmcgKHN0cikge1xuICAgICAgICBjb25zdCBhcmdzID0gc3BsaXRRdW90ZWRUZXh0KHN0ciwgJyAnLCAnYFwiXFwnJyk7XG4gICAgICAgIGNvbnN0IHBhdGggPSBhcmdzLnNoaWZ0KCk7XG5cbiAgICAgICAgY29uc3QgYnJvd3NlckluZm8gPSBhd2FpdCBicm93c2VyVG9vbHMuZ2V0QnJvd3NlckluZm8ocGF0aCk7XG5cbiAgICAgICAgaWYgKCFicm93c2VySW5mbylcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuXG4gICAgICAgIGNvbnN0IHBhcmFtcyA9IE9iamVjdC5hc3NpZ24oe30sIGJyb3dzZXJJbmZvKTtcblxuICAgICAgICBpZiAoYXJncy5sZW5ndGgpXG4gICAgICAgICAgICBwYXJhbXMuY21kID0gYXJncy5qb2luKCcgJykgKyAocGFyYW1zLmNtZCA/ICcgJyArIHBhcmFtcy5jbWQgOiAnJyk7XG5cbiAgICAgICAgcmV0dXJuIHBhcmFtcztcbiAgICB9LFxuXG4gICAgYXN5bmMgX2hhbmRsZUpTT04gKHN0cikge1xuICAgICAgICBsZXQgcGFyYW1zID0gbnVsbDtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcGFyYW1zID0gSlNPTi5wYXJzZShzdHIpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghcGFyYW1zLnBhdGgpXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcblxuICAgICAgICBjb25zdCBvcGVuUGFyYW1ldGVycyA9IGF3YWl0IGJyb3dzZXJUb29scy5nZXRCcm93c2VySW5mbyhwYXJhbXMucGF0aCk7XG5cbiAgICAgICAgaWYgKCFvcGVuUGFyYW1ldGVycylcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuXG4gICAgICAgIGlmIChwYXJhbXMuY21kKVxuICAgICAgICAgICAgb3BlblBhcmFtZXRlcnMuY21kID0gcGFyYW1zLmNtZDtcblxuICAgICAgICByZXR1cm4gb3BlblBhcmFtZXRlcnM7XG4gICAgfSxcblxuICAgIGFzeW5jIG9wZW5Ccm93c2VyIChicm93c2VySWQsIHBhZ2VVcmwsIGJyb3dzZXJOYW1lKSB7XG4gICAgICAgIGNvbnN0IG9wZW5QYXJhbWV0ZXJzID0gYXdhaXQgdGhpcy5faGFuZGxlU3RyaW5nKGJyb3dzZXJOYW1lKSB8fCBhd2FpdCB0aGlzLl9oYW5kbGVKU09OKGJyb3dzZXJOYW1lKTtcblxuICAgICAgICBpZiAoIW9wZW5QYXJhbWV0ZXJzKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUaGUgc3BlY2lmaWVkIGJyb3dzZXIgbmFtZSBpcyBub3QgdmFsaWQhJyk7XG5cbiAgICAgICAgYXdhaXQgYnJvd3NlclRvb2xzLm9wZW4ob3BlblBhcmFtZXRlcnMsIHBhZ2VVcmwpO1xuICAgIH0sXG5cbiAgICBhc3luYyBpc0xvY2FsQnJvd3NlciAoKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbn07XG4iXX0=
