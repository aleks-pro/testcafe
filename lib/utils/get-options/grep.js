'use strict';

exports.__esModule = true;

exports.default = function (optionName, value) {
    if (value === void 0) return value;

    try {
        return new RegExp(value);
    } catch (err) {
        throw new _runtime.GeneralError(_types.RUNTIME_ERRORS.optionValueIsNotValidRegExp, optionName);
    }
};

var _runtime = require('../../errors/runtime');

var _types = require('../../errors/types');

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy91dGlscy9nZXQtb3B0aW9ucy9ncmVwLmpzIl0sIm5hbWVzIjpbIm9wdGlvbk5hbWUiLCJ2YWx1ZSIsIlJlZ0V4cCIsImVyciIsIm9wdGlvblZhbHVlSXNOb3RWYWxpZFJlZ0V4cCJdLCJtYXBwaW5ncyI6Ijs7OztrQkFHZSxVQUFVQSxVQUFWLEVBQXNCQyxLQUF0QixFQUE2QjtBQUN4QyxRQUFJQSxVQUFVLEtBQUssQ0FBbkIsRUFDSSxPQUFPQSxLQUFQOztBQUVKLFFBQUk7QUFDQSxlQUFPLElBQUlDLE1BQUosQ0FBV0QsS0FBWCxDQUFQO0FBQ0gsS0FGRCxDQUdBLE9BQU9FLEdBQVAsRUFBWTtBQUNSLGNBQU0sMEJBQWlCLHNCQUFlQywyQkFBaEMsRUFBNkRKLFVBQTdELENBQU47QUFDSDtBQUNKLEM7O0FBYkQ7O0FBQ0EiLCJmaWxlIjoidXRpbHMvZ2V0LW9wdGlvbnMvZ3JlcC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEdlbmVyYWxFcnJvciB9IGZyb20gJy4uLy4uL2Vycm9ycy9ydW50aW1lJztcbmltcG9ydCB7IFJVTlRJTUVfRVJST1JTIH0gZnJvbSAnLi4vLi4vZXJyb3JzL3R5cGVzJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKG9wdGlvbk5hbWUsIHZhbHVlKSB7XG4gICAgaWYgKHZhbHVlID09PSB2b2lkIDApXG4gICAgICAgIHJldHVybiB2YWx1ZTtcblxuICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBuZXcgUmVnRXhwKHZhbHVlKTtcbiAgICB9XG4gICAgY2F0Y2ggKGVycikge1xuICAgICAgICB0aHJvdyBuZXcgR2VuZXJhbEVycm9yKFJVTlRJTUVfRVJST1JTLm9wdGlvblZhbHVlSXNOb3RWYWxpZFJlZ0V4cCwgb3B0aW9uTmFtZSk7XG4gICAgfVxufVxuIl19
