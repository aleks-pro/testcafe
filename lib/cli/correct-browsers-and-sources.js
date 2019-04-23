'use strict';

exports.__esModule = true;

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

let getBrowserInfo = (() => {
    var _ref = (0, _asyncToGenerator3.default)(function* (browser) {
        try {
            return {
                error: null,
                info: yield browserProviderPool.getBrowserInfo(browser)
            };
        } catch (err) {
            return {
                error: err,
                info: null
            };
        }
    });

    return function getBrowserInfo(_x) {
        return _ref.apply(this, arguments);
    };
})();

var _pinkie = require('pinkie');

var _pinkie2 = _interopRequireDefault(_pinkie);

var _lodash = require('lodash');

var _optionNames = require('../configuration/option-names');

var _optionNames2 = _interopRequireDefault(_optionNames);

var _runtime = require('../errors/runtime');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// NOTE: Load the provider pool lazily to reduce startup time
const lazyRequire = require('import-lazy')(require);
const browserProviderPool = lazyRequire('../browser/provider/pool');

exports.default = (() => {
    var _ref2 = (0, _asyncToGenerator3.default)(function* (args, configuration) {
        const browsersOption = configuration.getOption(_optionNames2.default.browsers);

        if (!args.browsers || !args.browsers.length) return { browsers: [], sources: args.src };

        if (!browsersOption || !browsersOption.length) return { browsers: args.browsers, sources: args.src };

        const browserInfo = yield _pinkie2.default.all(args.browsers.map(function (browser) {
            return getBrowserInfo(browser);
        }));

        var _partition = (0, _lodash.partition)(browserInfo, function (info) {
            return !info.error;
        });

        const parsedInfo = _partition[0],
              failedInfo = _partition[1];


        if (parsedInfo.length === browserInfo.length) return { browsers: args.browsers, sources: args.src };

        if (!parsedInfo.length) return { browsers: [], sources: [args.args[0], ...args.src] };

        throw new _runtime.CompositeError(failedInfo.map(function (info) {
            return info.error;
        }));
    });

    return function (_x2, _x3) {
        return _ref2.apply(this, arguments);
    };
})();

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jbGkvY29ycmVjdC1icm93c2Vycy1hbmQtc291cmNlcy5qcyJdLCJuYW1lcyI6WyJicm93c2VyIiwiZXJyb3IiLCJpbmZvIiwiYnJvd3NlclByb3ZpZGVyUG9vbCIsImdldEJyb3dzZXJJbmZvIiwiZXJyIiwibGF6eVJlcXVpcmUiLCJyZXF1aXJlIiwiYXJncyIsImNvbmZpZ3VyYXRpb24iLCJicm93c2Vyc09wdGlvbiIsImdldE9wdGlvbiIsImJyb3dzZXJzIiwibGVuZ3RoIiwic291cmNlcyIsInNyYyIsImJyb3dzZXJJbmZvIiwiYWxsIiwibWFwIiwicGFyc2VkSW5mbyIsImZhaWxlZEluZm8iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OzsrQ0FVQSxXQUErQkEsT0FBL0IsRUFBd0M7QUFDcEMsWUFBSTtBQUNBLG1CQUFPO0FBQ0hDLHVCQUFPLElBREo7QUFFSEMsc0JBQU8sTUFBTUMsb0JBQW9CQyxjQUFwQixDQUFtQ0osT0FBbkM7QUFGVixhQUFQO0FBSUgsU0FMRCxDQU1BLE9BQU9LLEdBQVAsRUFBWTtBQUNSLG1CQUFPO0FBQ0hKLHVCQUFPSSxHQURKO0FBRUhILHNCQUFPO0FBRkosYUFBUDtBQUlIO0FBQ0osSzs7b0JBYmNFLGM7Ozs7O0FBVmY7Ozs7QUFDQTs7QUFDQTs7OztBQUNBOzs7O0FBRUE7QUFDQSxNQUFNRSxjQUFzQkMsUUFBUSxhQUFSLEVBQXVCQSxPQUF2QixDQUE1QjtBQUNBLE1BQU1KLHNCQUFzQkcsWUFBWSwwQkFBWixDQUE1Qjs7O2dEQWtCZSxXQUFnQkUsSUFBaEIsRUFBc0JDLGFBQXRCLEVBQXFDO0FBQ2hELGNBQU1DLGlCQUFpQkQsY0FBY0UsU0FBZCxDQUF3QixzQkFBYUMsUUFBckMsQ0FBdkI7O0FBRUEsWUFBSSxDQUFDSixLQUFLSSxRQUFOLElBQWtCLENBQUNKLEtBQUtJLFFBQUwsQ0FBY0MsTUFBckMsRUFDSSxPQUFPLEVBQUVELFVBQVUsRUFBWixFQUFnQkUsU0FBU04sS0FBS08sR0FBOUIsRUFBUDs7QUFFSixZQUFJLENBQUNMLGNBQUQsSUFBbUIsQ0FBQ0EsZUFBZUcsTUFBdkMsRUFDSSxPQUFPLEVBQUVELFVBQVVKLEtBQUtJLFFBQWpCLEVBQTJCRSxTQUFTTixLQUFLTyxHQUF6QyxFQUFQOztBQUVKLGNBQU1DLGNBQTJCLE1BQU0saUJBQVFDLEdBQVIsQ0FBWVQsS0FBS0ksUUFBTCxDQUFjTSxHQUFkLENBQWtCO0FBQUEsbUJBQVdkLGVBQWVKLE9BQWYsQ0FBWDtBQUFBLFNBQWxCLENBQVosQ0FBdkM7O0FBVGdELHlCQVVmLHVCQUFVZ0IsV0FBVixFQUF1QjtBQUFBLG1CQUFRLENBQUNkLEtBQUtELEtBQWQ7QUFBQSxTQUF2QixDQVZlOztBQUFBLGNBVXpDa0IsVUFWeUM7QUFBQSxjQVU3QkMsVUFWNkI7OztBQVloRCxZQUFJRCxXQUFXTixNQUFYLEtBQXNCRyxZQUFZSCxNQUF0QyxFQUNJLE9BQU8sRUFBRUQsVUFBVUosS0FBS0ksUUFBakIsRUFBMkJFLFNBQVNOLEtBQUtPLEdBQXpDLEVBQVA7O0FBRUosWUFBSSxDQUFDSSxXQUFXTixNQUFoQixFQUNJLE9BQU8sRUFBRUQsVUFBVSxFQUFaLEVBQWdCRSxTQUFTLENBQUNOLEtBQUtBLElBQUwsQ0FBVSxDQUFWLENBQUQsRUFBZSxHQUFHQSxLQUFLTyxHQUF2QixDQUF6QixFQUFQOztBQUVKLGNBQU0sNEJBQW1CSyxXQUFXRixHQUFYLENBQWU7QUFBQSxtQkFBUWhCLEtBQUtELEtBQWI7QUFBQSxTQUFmLENBQW5CLENBQU47QUFDSCxLIiwiZmlsZSI6ImNsaS9jb3JyZWN0LWJyb3dzZXJzLWFuZC1zb3VyY2VzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFByb21pc2UgZnJvbSAncGlua2llJztcbmltcG9ydCB7IHBhcnRpdGlvbiB9IGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgT1BUSU9OX05BTUVTIGZyb20gJy4uL2NvbmZpZ3VyYXRpb24vb3B0aW9uLW5hbWVzJztcbmltcG9ydCB7IENvbXBvc2l0ZUVycm9yIH0gZnJvbSAnLi4vZXJyb3JzL3J1bnRpbWUnO1xuXG4vLyBOT1RFOiBMb2FkIHRoZSBwcm92aWRlciBwb29sIGxhemlseSB0byByZWR1Y2Ugc3RhcnR1cCB0aW1lXG5jb25zdCBsYXp5UmVxdWlyZSAgICAgICAgID0gcmVxdWlyZSgnaW1wb3J0LWxhenknKShyZXF1aXJlKTtcbmNvbnN0IGJyb3dzZXJQcm92aWRlclBvb2wgPSBsYXp5UmVxdWlyZSgnLi4vYnJvd3Nlci9wcm92aWRlci9wb29sJyk7XG5cblxuYXN5bmMgZnVuY3Rpb24gZ2V0QnJvd3NlckluZm8gKGJyb3dzZXIpIHtcbiAgICB0cnkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZXJyb3I6IG51bGwsXG4gICAgICAgICAgICBpbmZvOiAgYXdhaXQgYnJvd3NlclByb3ZpZGVyUG9vbC5nZXRCcm93c2VySW5mbyhicm93c2VyKVxuICAgICAgICB9O1xuICAgIH1cbiAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBlcnJvcjogZXJyLFxuICAgICAgICAgICAgaW5mbzogIG51bGxcbiAgICAgICAgfTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGFzeW5jIGZ1bmN0aW9uIChhcmdzLCBjb25maWd1cmF0aW9uKSB7XG4gICAgY29uc3QgYnJvd3NlcnNPcHRpb24gPSBjb25maWd1cmF0aW9uLmdldE9wdGlvbihPUFRJT05fTkFNRVMuYnJvd3NlcnMpO1xuXG4gICAgaWYgKCFhcmdzLmJyb3dzZXJzIHx8ICFhcmdzLmJyb3dzZXJzLmxlbmd0aClcbiAgICAgICAgcmV0dXJuIHsgYnJvd3NlcnM6IFtdLCBzb3VyY2VzOiBhcmdzLnNyYyB9O1xuXG4gICAgaWYgKCFicm93c2Vyc09wdGlvbiB8fCAhYnJvd3NlcnNPcHRpb24ubGVuZ3RoKVxuICAgICAgICByZXR1cm4geyBicm93c2VyczogYXJncy5icm93c2Vycywgc291cmNlczogYXJncy5zcmMgfTtcblxuICAgIGNvbnN0IGJyb3dzZXJJbmZvICAgICAgICAgICAgICA9IGF3YWl0IFByb21pc2UuYWxsKGFyZ3MuYnJvd3NlcnMubWFwKGJyb3dzZXIgPT4gZ2V0QnJvd3NlckluZm8oYnJvd3NlcikpKTtcbiAgICBjb25zdCBbcGFyc2VkSW5mbywgZmFpbGVkSW5mb10gPSBwYXJ0aXRpb24oYnJvd3NlckluZm8sIGluZm8gPT4gIWluZm8uZXJyb3IpO1xuXG4gICAgaWYgKHBhcnNlZEluZm8ubGVuZ3RoID09PSBicm93c2VySW5mby5sZW5ndGgpXG4gICAgICAgIHJldHVybiB7IGJyb3dzZXJzOiBhcmdzLmJyb3dzZXJzLCBzb3VyY2VzOiBhcmdzLnNyYyB9O1xuXG4gICAgaWYgKCFwYXJzZWRJbmZvLmxlbmd0aClcbiAgICAgICAgcmV0dXJuIHsgYnJvd3NlcnM6IFtdLCBzb3VyY2VzOiBbYXJncy5hcmdzWzBdLCAuLi5hcmdzLnNyY10gfTtcblxuICAgIHRocm93IG5ldyBDb21wb3NpdGVFcnJvcihmYWlsZWRJbmZvLm1hcChpbmZvID0+IGluZm8uZXJyb3IpKTtcbn1cbiJdfQ==
