'use strict';

exports.__esModule = true;

var _optionSource = require('./option-source');

var _optionSource2 = _interopRequireDefault(_optionSource);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Option {
    constructor(name, value, source = _optionSource2.default.configuration) {
        this.name = name;
        this.value = value;
        this.source = source;
    }
}
exports.default = Option;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb25maWd1cmF0aW9uL29wdGlvbi5qcyJdLCJuYW1lcyI6WyJPcHRpb24iLCJjb25zdHJ1Y3RvciIsIm5hbWUiLCJ2YWx1ZSIsInNvdXJjZSIsImNvbmZpZ3VyYXRpb24iXSwibWFwcGluZ3MiOiI7Ozs7QUFBQTs7Ozs7O0FBRWUsTUFBTUEsTUFBTixDQUFhO0FBQ3hCQyxnQkFBYUMsSUFBYixFQUFtQkMsS0FBbkIsRUFBMEJDLFNBQVMsdUJBQWFDLGFBQWhELEVBQStEO0FBQzNELGFBQUtILElBQUwsR0FBY0EsSUFBZDtBQUNBLGFBQUtDLEtBQUwsR0FBY0EsS0FBZDtBQUNBLGFBQUtDLE1BQUwsR0FBY0EsTUFBZDtBQUNIO0FBTHVCO2tCQUFQSixNIiwiZmlsZSI6ImNvbmZpZ3VyYXRpb24vb3B0aW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IG9wdGlvblNvdXJjZSBmcm9tICcuL29wdGlvbi1zb3VyY2UnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPcHRpb24ge1xuICAgIGNvbnN0cnVjdG9yIChuYW1lLCB2YWx1ZSwgc291cmNlID0gb3B0aW9uU291cmNlLmNvbmZpZ3VyYXRpb24pIHtcbiAgICAgICAgdGhpcy5uYW1lICAgPSBuYW1lO1xuICAgICAgICB0aGlzLnZhbHVlICA9IHZhbHVlO1xuICAgICAgICB0aGlzLnNvdXJjZSA9IHNvdXJjZTtcbiAgICB9XG59XG4iXX0=
