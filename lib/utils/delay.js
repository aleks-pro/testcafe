'use strict';

exports.__esModule = true;
exports.default = delay;

var _pinkie = require('pinkie');

var _pinkie2 = _interopRequireDefault(_pinkie);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function delay(ms) {
    return new _pinkie2.default(resolve => setTimeout(resolve, ms));
}
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9kZWxheS5qcyJdLCJuYW1lcyI6WyJkZWxheSIsIm1zIiwicmVzb2x2ZSIsInNldFRpbWVvdXQiXSwibWFwcGluZ3MiOiI7OztrQkFHd0JBLEs7O0FBSHhCOzs7Ozs7QUFHZSxTQUFTQSxLQUFULENBQWdCQyxFQUFoQixFQUFvQjtBQUMvQixXQUFPLHFCQUFZQyxXQUFXQyxXQUFXRCxPQUFYLEVBQW9CRCxFQUFwQixDQUF2QixDQUFQO0FBQ0giLCJmaWxlIjoidXRpbHMvZGVsYXkuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUHJvbWlzZSBmcm9tICdwaW5raWUnO1xuXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGRlbGF5IChtcykge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgbXMpKTtcbn1cbiJdfQ==
