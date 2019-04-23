'use strict';

exports.__esModule = true;

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _base = require('./base');

var _base2 = _interopRequireDefault(_base);

var _types = require('../../errors/types');

var _runtime = require('../../errors/runtime');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (() => {
    var _ref = (0, _asyncToGenerator3.default)(function* (optionName, options) {
        const metaOptions = yield (0, _base2.default)(options, {
            skipOptionValueTypeConversion: true,

            onOptionParsed(key, value) {
                return (0, _asyncToGenerator3.default)(function* () {
                    if (!key || !value) throw new _runtime.GeneralError(_types.RUNTIME_ERRORS.optionValueIsNotValidKeyValue, optionName);

                    return String(value);
                })();
            }
        });

        if ((0, _keys2.default)(metaOptions).length === 0) throw new _runtime.GeneralError(_types.RUNTIME_ERRORS.optionValueIsNotValidKeyValue, optionName);

        return metaOptions;
    });

    return function (_x, _x2) {
        return _ref.apply(this, arguments);
    };
})();

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy91dGlscy9nZXQtb3B0aW9ucy9tZXRhLmpzIl0sIm5hbWVzIjpbIm9wdGlvbk5hbWUiLCJvcHRpb25zIiwibWV0YU9wdGlvbnMiLCJza2lwT3B0aW9uVmFsdWVUeXBlQ29udmVyc2lvbiIsIm9uT3B0aW9uUGFyc2VkIiwia2V5IiwidmFsdWUiLCJvcHRpb25WYWx1ZUlzTm90VmFsaWRLZXlWYWx1ZSIsIlN0cmluZyIsImxlbmd0aCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUE7Ozs7QUFDQTs7QUFDQTs7Ozs7K0NBR2UsV0FBZ0JBLFVBQWhCLEVBQTRCQyxPQUE1QixFQUFxQztBQUNoRCxjQUFNQyxjQUFjLE1BQU0sb0JBQWVELE9BQWYsRUFBd0I7QUFDOUNFLDJDQUErQixJQURlOztBQUd4Q0MsMEJBQU4sQ0FBc0JDLEdBQXRCLEVBQTJCQyxLQUEzQixFQUFrQztBQUFBO0FBQzlCLHdCQUFJLENBQUNELEdBQUQsSUFBUSxDQUFDQyxLQUFiLEVBQ0ksTUFBTSwwQkFBaUIsc0JBQWVDLDZCQUFoQyxFQUErRFAsVUFBL0QsQ0FBTjs7QUFFSiwyQkFBT1EsT0FBT0YsS0FBUCxDQUFQO0FBSjhCO0FBS2pDO0FBUjZDLFNBQXhCLENBQTFCOztBQVdBLFlBQUksb0JBQVlKLFdBQVosRUFBeUJPLE1BQXpCLEtBQW9DLENBQXhDLEVBQ0ksTUFBTSwwQkFBaUIsc0JBQWVGLDZCQUFoQyxFQUErRFAsVUFBL0QsQ0FBTjs7QUFFSixlQUFPRSxXQUFQO0FBQ0gsSyIsImZpbGUiOiJ1dGlscy9nZXQtb3B0aW9ucy9tZXRhLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGJhc2VHZXRPcHRpb25zIGZyb20gJy4vYmFzZSc7XG5pbXBvcnQgeyBSVU5USU1FX0VSUk9SUyB9IGZyb20gJy4uLy4uL2Vycm9ycy90eXBlcyc7XG5pbXBvcnQgeyBHZW5lcmFsRXJyb3IgfSBmcm9tICcuLi8uLi9lcnJvcnMvcnVudGltZSc7XG5cblxuZXhwb3J0IGRlZmF1bHQgYXN5bmMgZnVuY3Rpb24gKG9wdGlvbk5hbWUsIG9wdGlvbnMpIHtcbiAgICBjb25zdCBtZXRhT3B0aW9ucyA9IGF3YWl0IGJhc2VHZXRPcHRpb25zKG9wdGlvbnMsIHtcbiAgICAgICAgc2tpcE9wdGlvblZhbHVlVHlwZUNvbnZlcnNpb246IHRydWUsXG5cbiAgICAgICAgYXN5bmMgb25PcHRpb25QYXJzZWQgKGtleSwgdmFsdWUpIHtcbiAgICAgICAgICAgIGlmICgha2V5IHx8ICF2YWx1ZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgR2VuZXJhbEVycm9yKFJVTlRJTUVfRVJST1JTLm9wdGlvblZhbHVlSXNOb3RWYWxpZEtleVZhbHVlLCBvcHRpb25OYW1lKTtcblxuICAgICAgICAgICAgcmV0dXJuIFN0cmluZyh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmIChPYmplY3Qua2V5cyhtZXRhT3B0aW9ucykubGVuZ3RoID09PSAwKVxuICAgICAgICB0aHJvdyBuZXcgR2VuZXJhbEVycm9yKFJVTlRJTUVfRVJST1JTLm9wdGlvblZhbHVlSXNOb3RWYWxpZEtleVZhbHVlLCBvcHRpb25OYW1lKTtcblxuICAgIHJldHVybiBtZXRhT3B0aW9ucztcbn1cbiJdfQ==
