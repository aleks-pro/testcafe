'use strict';

exports.__esModule = true;

var _entries = require('babel-runtime/core-js/object/entries');

var _entries2 = _interopRequireDefault(_entries);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _pinkie = require('pinkie');

var _pinkie2 = _interopRequireDefault(_pinkie);

var _convertToBestFitType = require('../convert-to-best-fit-type');

var _convertToBestFitType2 = _interopRequireDefault(_convertToBestFitType);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const DEFAULT_OPTIONS_SEPARATOR = ',';
const DEFAULT_KEY_VALUE_SEPARATOR = '=';

function convertOptionValueType(value) {
    // NOTE: threat a key without a separator and a value as a boolean flag
    if (value === void 0) return true;

    return (0, _convertToBestFitType2.default)(value);
}

function parseOptionsString(optionsStr, optionsSeparator, keyValueSeparator) {
    return optionsStr.split(optionsSeparator).map(keyValueString => keyValueString.split(keyValueSeparator)).map(([key, ...value]) => [key, value.length > 1 ? value.join(keyValueSeparator) : value[0]]);
}

exports.default = (() => {
    var _ref = (0, _asyncToGenerator3.default)(function* (sourceOptions = '', optionsConfig) {
        var _optionsConfig$option = optionsConfig.optionsSeparator;
        const optionsSeparator = _optionsConfig$option === undefined ? DEFAULT_OPTIONS_SEPARATOR : _optionsConfig$option;
        var _optionsConfig$keyVal = optionsConfig.keyValueSeparator;
        const keyValueSeparator = _optionsConfig$keyVal === undefined ? DEFAULT_KEY_VALUE_SEPARATOR : _optionsConfig$keyVal;
        var _optionsConfig$skipOp = optionsConfig.skipOptionValueTypeConversion;
        const skipOptionValueTypeConversion = _optionsConfig$skipOp === undefined ? false : _optionsConfig$skipOp;
        var _optionsConfig$onOpti = optionsConfig.onOptionParsed;
        const onOptionParsed = _optionsConfig$onOpti === undefined ? void 0 : _optionsConfig$onOpti;


        const optionsList = typeof sourceOptions === 'string' ? parseOptionsString(sourceOptions, optionsSeparator, keyValueSeparator) : (0, _entries2.default)(sourceOptions);

        const resultOptions = {};

        yield _pinkie2.default.all(optionsList.map((() => {
            var _ref2 = (0, _asyncToGenerator3.default)(function* ([key, value]) {
                if (!skipOptionValueTypeConversion) value = convertOptionValueType(value);

                if (onOptionParsed) value = yield onOptionParsed(key, value);

                resultOptions[key] = value;
            });

            return function (_x) {
                return _ref2.apply(this, arguments);
            };
        })()));

        return resultOptions;
    });

    return function () {
        return _ref.apply(this, arguments);
    };
})();

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy91dGlscy9nZXQtb3B0aW9ucy9iYXNlLmpzIl0sIm5hbWVzIjpbIkRFRkFVTFRfT1BUSU9OU19TRVBBUkFUT1IiLCJERUZBVUxUX0tFWV9WQUxVRV9TRVBBUkFUT1IiLCJjb252ZXJ0T3B0aW9uVmFsdWVUeXBlIiwidmFsdWUiLCJwYXJzZU9wdGlvbnNTdHJpbmciLCJvcHRpb25zU3RyIiwib3B0aW9uc1NlcGFyYXRvciIsImtleVZhbHVlU2VwYXJhdG9yIiwic3BsaXQiLCJtYXAiLCJrZXlWYWx1ZVN0cmluZyIsImtleSIsImxlbmd0aCIsImpvaW4iLCJzb3VyY2VPcHRpb25zIiwib3B0aW9uc0NvbmZpZyIsInNraXBPcHRpb25WYWx1ZVR5cGVDb252ZXJzaW9uIiwib25PcHRpb25QYXJzZWQiLCJvcHRpb25zTGlzdCIsInJlc3VsdE9wdGlvbnMiLCJhbGwiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBOzs7O0FBQ0E7Ozs7OztBQUdBLE1BQU1BLDRCQUE4QixHQUFwQztBQUNBLE1BQU1DLDhCQUE4QixHQUFwQzs7QUFHQSxTQUFTQyxzQkFBVCxDQUFpQ0MsS0FBakMsRUFBd0M7QUFDcEM7QUFDQSxRQUFJQSxVQUFVLEtBQUssQ0FBbkIsRUFDSSxPQUFPLElBQVA7O0FBRUosV0FBTyxvQ0FBcUJBLEtBQXJCLENBQVA7QUFDSDs7QUFFRCxTQUFTQyxrQkFBVCxDQUE2QkMsVUFBN0IsRUFBeUNDLGdCQUF6QyxFQUEyREMsaUJBQTNELEVBQThFO0FBQzFFLFdBQU9GLFdBQ0ZHLEtBREUsQ0FDSUYsZ0JBREosRUFFRkcsR0FGRSxDQUVFQyxrQkFBa0JBLGVBQWVGLEtBQWYsQ0FBcUJELGlCQUFyQixDQUZwQixFQUdGRSxHQUhFLENBR0UsQ0FBQyxDQUFDRSxHQUFELEVBQU0sR0FBR1IsS0FBVCxDQUFELEtBQXFCLENBQUNRLEdBQUQsRUFBTVIsTUFBTVMsTUFBTixHQUFlLENBQWYsR0FBbUJULE1BQU1VLElBQU4sQ0FBV04saUJBQVgsQ0FBbkIsR0FBbURKLE1BQU0sQ0FBTixDQUF6RCxDQUh2QixDQUFQO0FBSUg7OzsrQ0FFYyxXQUFnQlcsZ0JBQWdCLEVBQWhDLEVBQW9DQyxhQUFwQyxFQUFtRDtBQUFBLG9DQU0xREEsYUFOMEQsQ0FFMURULGdCQUYwRDtBQUFBLGNBRTFEQSxnQkFGMEQseUNBRXZDTix5QkFGdUM7QUFBQSxvQ0FNMURlLGFBTjBELENBRzFEUixpQkFIMEQ7QUFBQSxjQUcxREEsaUJBSDBELHlDQUd0Q04sMkJBSHNDO0FBQUEsb0NBTTFEYyxhQU4wRCxDQUkxREMsNkJBSjBEO0FBQUEsY0FJMURBLDZCQUowRCx5Q0FJMUIsS0FKMEI7QUFBQSxvQ0FNMURELGFBTjBELENBSzFERSxjQUwwRDtBQUFBLGNBSzFEQSxjQUwwRCx5Q0FLekMsS0FBSyxDQUxvQzs7O0FBUTlELGNBQU1DLGNBQWMsT0FBT0osYUFBUCxLQUF5QixRQUF6QixHQUNoQlYsbUJBQW1CVSxhQUFuQixFQUFrQ1IsZ0JBQWxDLEVBQW9EQyxpQkFBcEQsQ0FEZ0IsR0FFaEIsdUJBQWVPLGFBQWYsQ0FGSjs7QUFJQSxjQUFNSyxnQkFBZ0IsRUFBdEI7O0FBRUEsY0FBTSxpQkFBUUMsR0FBUixDQUFZRixZQUFZVCxHQUFaO0FBQUEsd0RBQWdCLFdBQU8sQ0FBQ0UsR0FBRCxFQUFNUixLQUFOLENBQVAsRUFBd0I7QUFDdEQsb0JBQUksQ0FBQ2EsNkJBQUwsRUFDSWIsUUFBUUQsdUJBQXVCQyxLQUF2QixDQUFSOztBQUVKLG9CQUFJYyxjQUFKLEVBQ0lkLFFBQVEsTUFBTWMsZUFBZU4sR0FBZixFQUFvQlIsS0FBcEIsQ0FBZDs7QUFFSmdCLDhCQUFjUixHQUFkLElBQXFCUixLQUFyQjtBQUNILGFBUmlCOztBQUFBO0FBQUE7QUFBQTtBQUFBLGFBQVosQ0FBTjs7QUFVQSxlQUFPZ0IsYUFBUDtBQUNILEsiLCJmaWxlIjoidXRpbHMvZ2V0LW9wdGlvbnMvYmFzZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBQcm9taXNlIGZyb20gJ3BpbmtpZSc7XG5pbXBvcnQgY29udmVydFRvQmVzdEZpdFR5cGUgZnJvbSAnLi4vY29udmVydC10by1iZXN0LWZpdC10eXBlJztcblxuXG5jb25zdCBERUZBVUxUX09QVElPTlNfU0VQQVJBVE9SICAgPSAnLCc7XG5jb25zdCBERUZBVUxUX0tFWV9WQUxVRV9TRVBBUkFUT1IgPSAnPSc7XG5cblxuZnVuY3Rpb24gY29udmVydE9wdGlvblZhbHVlVHlwZSAodmFsdWUpIHtcbiAgICAvLyBOT1RFOiB0aHJlYXQgYSBrZXkgd2l0aG91dCBhIHNlcGFyYXRvciBhbmQgYSB2YWx1ZSBhcyBhIGJvb2xlYW4gZmxhZ1xuICAgIGlmICh2YWx1ZSA9PT0gdm9pZCAwKVxuICAgICAgICByZXR1cm4gdHJ1ZTtcblxuICAgIHJldHVybiBjb252ZXJ0VG9CZXN0Rml0VHlwZSh2YWx1ZSk7XG59XG5cbmZ1bmN0aW9uIHBhcnNlT3B0aW9uc1N0cmluZyAob3B0aW9uc1N0ciwgb3B0aW9uc1NlcGFyYXRvciwga2V5VmFsdWVTZXBhcmF0b3IpIHtcbiAgICByZXR1cm4gb3B0aW9uc1N0clxuICAgICAgICAuc3BsaXQob3B0aW9uc1NlcGFyYXRvcilcbiAgICAgICAgLm1hcChrZXlWYWx1ZVN0cmluZyA9PiBrZXlWYWx1ZVN0cmluZy5zcGxpdChrZXlWYWx1ZVNlcGFyYXRvcikpXG4gICAgICAgIC5tYXAoKFtrZXksIC4uLnZhbHVlXSkgPT4gW2tleSwgdmFsdWUubGVuZ3RoID4gMSA/IHZhbHVlLmpvaW4oa2V5VmFsdWVTZXBhcmF0b3IpIDogdmFsdWVbMF1dKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYXN5bmMgZnVuY3Rpb24gKHNvdXJjZU9wdGlvbnMgPSAnJywgb3B0aW9uc0NvbmZpZykge1xuICAgIGNvbnN0IHtcbiAgICAgICAgb3B0aW9uc1NlcGFyYXRvciA9IERFRkFVTFRfT1BUSU9OU19TRVBBUkFUT1IsXG4gICAgICAgIGtleVZhbHVlU2VwYXJhdG9yID0gREVGQVVMVF9LRVlfVkFMVUVfU0VQQVJBVE9SLFxuICAgICAgICBza2lwT3B0aW9uVmFsdWVUeXBlQ29udmVyc2lvbiA9IGZhbHNlLFxuICAgICAgICBvbk9wdGlvblBhcnNlZCA9IHZvaWQgMCxcbiAgICB9ID0gb3B0aW9uc0NvbmZpZztcblxuICAgIGNvbnN0IG9wdGlvbnNMaXN0ID0gdHlwZW9mIHNvdXJjZU9wdGlvbnMgPT09ICdzdHJpbmcnID9cbiAgICAgICAgcGFyc2VPcHRpb25zU3RyaW5nKHNvdXJjZU9wdGlvbnMsIG9wdGlvbnNTZXBhcmF0b3IsIGtleVZhbHVlU2VwYXJhdG9yKSA6XG4gICAgICAgIE9iamVjdC5lbnRyaWVzKHNvdXJjZU9wdGlvbnMpO1xuXG4gICAgY29uc3QgcmVzdWx0T3B0aW9ucyA9IHt9O1xuXG4gICAgYXdhaXQgUHJvbWlzZS5hbGwob3B0aW9uc0xpc3QubWFwKGFzeW5jIChba2V5LCB2YWx1ZV0pID0+IHtcbiAgICAgICAgaWYgKCFza2lwT3B0aW9uVmFsdWVUeXBlQ29udmVyc2lvbilcbiAgICAgICAgICAgIHZhbHVlID0gY29udmVydE9wdGlvblZhbHVlVHlwZSh2YWx1ZSk7XG5cbiAgICAgICAgaWYgKG9uT3B0aW9uUGFyc2VkKVxuICAgICAgICAgICAgdmFsdWUgPSBhd2FpdCBvbk9wdGlvblBhcnNlZChrZXksIHZhbHVlKTtcblxuICAgICAgICByZXN1bHRPcHRpb25zW2tleV0gPSB2YWx1ZTtcbiAgICB9KSk7XG5cbiAgICByZXR1cm4gcmVzdWx0T3B0aW9ucztcbn1cblxuIl19
