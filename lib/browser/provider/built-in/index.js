'use strict';

exports.__esModule = true;

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _path = require('./path');

var _path2 = _interopRequireDefault(_path);

var _locallyInstalled = require('./locally-installed');

var _locallyInstalled2 = _interopRequireDefault(_locallyInstalled);

var _remote = require('./remote');

var _remote2 = _interopRequireDefault(_remote);

var _firefox = require('./dedicated/firefox');

var _firefox2 = _interopRequireDefault(_firefox);

var _chrome = require('./dedicated/chrome');

var _chrome2 = _interopRequireDefault(_chrome);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (0, _assign2.default)({
    'locally-installed': _locallyInstalled2.default,
    'path': _path2.default,
    'remote': _remote2.default,
    'firefox': _firefox2.default,
    'chrome': _chrome2.default,
    'chromium': _chrome2.default,
    'chrome-canary': _chrome2.default
});
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9icm93c2VyL3Byb3ZpZGVyL2J1aWx0LWluL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7O2tCQUVlLHNCQUNYO0FBQ0ksbURBREo7QUFFSSwwQkFGSjtBQUdJLDhCQUhKO0FBSUksZ0NBSko7QUFLSSw4QkFMSjtBQU1JLGdDQU5KO0FBT0k7QUFQSixDQURXLEMiLCJmaWxlIjoiYnJvd3Nlci9wcm92aWRlci9idWlsdC1pbi9pbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBwYXRoQnJvd3NlclByb3ZpZGVyIGZyb20gJy4vcGF0aCc7XG5pbXBvcnQgbG9jYWxseUluc3RhbGxlZEJyb3dzZXJQcm92aWRlciBmcm9tICcuL2xvY2FsbHktaW5zdGFsbGVkJztcbmltcG9ydCByZW1vdGVCcm93c2VyUHJvdmlkZXIgZnJvbSAnLi9yZW1vdGUnO1xuaW1wb3J0IGZpcmVmb3hQcm92aWRlciBmcm9tICcuL2RlZGljYXRlZC9maXJlZm94JztcbmltcG9ydCBjaHJvbWVQcm92aWRlciBmcm9tICcuL2RlZGljYXRlZC9jaHJvbWUnO1xuXG5leHBvcnQgZGVmYXVsdCBPYmplY3QuYXNzaWduKFxuICAgIHtcbiAgICAgICAgJ2xvY2FsbHktaW5zdGFsbGVkJzogbG9jYWxseUluc3RhbGxlZEJyb3dzZXJQcm92aWRlcixcbiAgICAgICAgJ3BhdGgnOiAgICAgICAgICAgICAgcGF0aEJyb3dzZXJQcm92aWRlcixcbiAgICAgICAgJ3JlbW90ZSc6ICAgICAgICAgICAgcmVtb3RlQnJvd3NlclByb3ZpZGVyLFxuICAgICAgICAnZmlyZWZveCc6ICAgICAgICAgICBmaXJlZm94UHJvdmlkZXIsXG4gICAgICAgICdjaHJvbWUnOiAgICAgICAgICAgIGNocm9tZVByb3ZpZGVyLFxuICAgICAgICAnY2hyb21pdW0nOiAgICAgICAgICBjaHJvbWVQcm92aWRlcixcbiAgICAgICAgJ2Nocm9tZS1jYW5hcnknOiAgICAgY2hyb21lUHJvdmlkZXJcbiAgICB9XG4pO1xuIl19
