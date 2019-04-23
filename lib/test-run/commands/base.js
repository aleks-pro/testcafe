'use strict';

exports.__esModule = true;

var _assignable = require('../../utils/assignable');

var _assignable2 = _interopRequireDefault(_assignable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class CommandBase extends _assignable2.default {
    constructor(obj, testRun, type, validateProperties = true) {
        super();

        this.type = type;

        this._assignFrom(obj, validateProperties, { testRun });
    }
}
exports.default = CommandBase;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy90ZXN0LXJ1bi9jb21tYW5kcy9iYXNlLmpzIl0sIm5hbWVzIjpbIkNvbW1hbmRCYXNlIiwiY29uc3RydWN0b3IiLCJvYmoiLCJ0ZXN0UnVuIiwidHlwZSIsInZhbGlkYXRlUHJvcGVydGllcyIsIl9hc3NpZ25Gcm9tIl0sIm1hcHBpbmdzIjoiOzs7O0FBQUE7Ozs7OztBQUVlLE1BQU1BLFdBQU4sOEJBQXFDO0FBQ2hEQyxnQkFBYUMsR0FBYixFQUFrQkMsT0FBbEIsRUFBMkJDLElBQTNCLEVBQWlDQyxxQkFBcUIsSUFBdEQsRUFBNEQ7QUFDeEQ7O0FBRUEsYUFBS0QsSUFBTCxHQUFZQSxJQUFaOztBQUVBLGFBQUtFLFdBQUwsQ0FBaUJKLEdBQWpCLEVBQXNCRyxrQkFBdEIsRUFBMEMsRUFBRUYsT0FBRixFQUExQztBQUNIO0FBUCtDO2tCQUEvQkgsVyIsImZpbGUiOiJ0ZXN0LXJ1bi9jb21tYW5kcy9iYXNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEFzc2lnbmFibGUgZnJvbSAnLi4vLi4vdXRpbHMvYXNzaWduYWJsZSc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbW1hbmRCYXNlIGV4dGVuZHMgQXNzaWduYWJsZSB7XG4gICAgY29uc3RydWN0b3IgKG9iaiwgdGVzdFJ1biwgdHlwZSwgdmFsaWRhdGVQcm9wZXJ0aWVzID0gdHJ1ZSkge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIHRoaXMudHlwZSA9IHR5cGU7XG5cbiAgICAgICAgdGhpcy5fYXNzaWduRnJvbShvYmosIHZhbGlkYXRlUHJvcGVydGllcywgeyB0ZXN0UnVuIH0pO1xuICAgIH1cbn1cbiJdfQ==
