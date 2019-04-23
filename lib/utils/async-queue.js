'use strict';

exports.__esModule = true;
exports.isInQueue = isInQueue;
exports.addToQueue = addToQueue;

var _pinkie = require('pinkie');

var _pinkie2 = _interopRequireDefault(_pinkie);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const actions = {};

function isInQueue(key) {
    return actions[key];
}

function addToQueue(key, asyncAction) {
    const action = actions[key] || _pinkie2.default.resolve();

    actions[key] = action.then(() => asyncAction());

    return actions[key];
}
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9hc3luYy1xdWV1ZS5qcyJdLCJuYW1lcyI6WyJpc0luUXVldWUiLCJhZGRUb1F1ZXVlIiwiYWN0aW9ucyIsImtleSIsImFzeW5jQWN0aW9uIiwiYWN0aW9uIiwicmVzb2x2ZSIsInRoZW4iXSwibWFwcGluZ3MiOiI7OztRQUlnQkEsUyxHQUFBQSxTO1FBSUFDLFUsR0FBQUEsVTs7QUFSaEI7Ozs7OztBQUVBLE1BQU1DLFVBQVUsRUFBaEI7O0FBRU8sU0FBU0YsU0FBVCxDQUFvQkcsR0FBcEIsRUFBeUI7QUFDNUIsV0FBT0QsUUFBUUMsR0FBUixDQUFQO0FBQ0g7O0FBRU0sU0FBU0YsVUFBVCxDQUFxQkUsR0FBckIsRUFBMEJDLFdBQTFCLEVBQXVDO0FBQzFDLFVBQU1DLFNBQVNILFFBQVFDLEdBQVIsS0FBZ0IsaUJBQVFHLE9BQVIsRUFBL0I7O0FBRUFKLFlBQVFDLEdBQVIsSUFBZUUsT0FBT0UsSUFBUCxDQUFZLE1BQU1ILGFBQWxCLENBQWY7O0FBRUEsV0FBT0YsUUFBUUMsR0FBUixDQUFQO0FBQ0giLCJmaWxlIjoidXRpbHMvYXN5bmMtcXVldWUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUHJvbWlzZSBmcm9tICdwaW5raWUnO1xuXG5jb25zdCBhY3Rpb25zID0geyB9O1xuXG5leHBvcnQgZnVuY3Rpb24gaXNJblF1ZXVlIChrZXkpIHtcbiAgICByZXR1cm4gYWN0aW9uc1trZXldO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYWRkVG9RdWV1ZSAoa2V5LCBhc3luY0FjdGlvbikge1xuICAgIGNvbnN0IGFjdGlvbiA9IGFjdGlvbnNba2V5XSB8fCBQcm9taXNlLnJlc29sdmUoKTtcblxuICAgIGFjdGlvbnNba2V5XSA9IGFjdGlvbi50aGVuKCgpID0+IGFzeW5jQWN0aW9uKCkpO1xuXG4gICAgcmV0dXJuIGFjdGlvbnNba2V5XTtcbn1cbiJdfQ==
