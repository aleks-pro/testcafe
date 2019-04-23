'use strict';

exports.__esModule = true;

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

exports.default = function (optionString) {
    return (0, _base2.default)(optionString, {
        optionsSeparator: OPTIONS_SEPARATOR,

        onOptionParsed(key, value) {
            return (0, _asyncToGenerator3.default)(function* () {
                if (!FILE_OPTION_NAMES.includes(key) || value.length > OS_MAX_PATH_LENGTH) return value;

                try {
                    yield (0, _promisifiedFunctions.stat)(value);
                } catch (error) {
                    DEBUG_LOGGER((0, _renderTemplate2.default)(_warningMessage2.default.cannotFindSSLCertFile, value, key, error.stack));

                    return value;
                }

                try {
                    return yield (0, _promisifiedFunctions.readFile)(value);
                } catch (error) {
                    throw new _runtime.GeneralError(_types.RUNTIME_ERRORS.cannotReadSSLCertFile, value, key, error.stack);
                }
            })();
        }
    });
};

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _base = require('./base');

var _base2 = _interopRequireDefault(_base);

var _runtime = require('../../errors/runtime');

var _promisifiedFunctions = require('../promisified-functions');

var _renderTemplate = require('../../utils/render-template');

var _renderTemplate2 = _interopRequireDefault(_renderTemplate);

var _types = require('../../errors/types');

var _warningMessage = require('../../notifications/warning-message');

var _warningMessage2 = _interopRequireDefault(_warningMessage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const DEBUG_LOGGER = (0, _debug2.default)('testcafe:utils:get-options:ssl');

const MAX_PATH_LENGTH = {
    'Linux': 4096,
    'Windows_NT': 260,
    'Darwin': 1024
};

const OS_MAX_PATH_LENGTH = MAX_PATH_LENGTH[_os2.default.type()];

const OPTIONS_SEPARATOR = ';';
const FILE_OPTION_NAMES = ['cert', 'key', 'pfx'];

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy91dGlscy9nZXQtb3B0aW9ucy9zc2wuanMiXSwibmFtZXMiOlsib3B0aW9uU3RyaW5nIiwib3B0aW9uc1NlcGFyYXRvciIsIk9QVElPTlNfU0VQQVJBVE9SIiwib25PcHRpb25QYXJzZWQiLCJrZXkiLCJ2YWx1ZSIsIkZJTEVfT1BUSU9OX05BTUVTIiwiaW5jbHVkZXMiLCJsZW5ndGgiLCJPU19NQVhfUEFUSF9MRU5HVEgiLCJlcnJvciIsIkRFQlVHX0xPR0dFUiIsImNhbm5vdEZpbmRTU0xDZXJ0RmlsZSIsInN0YWNrIiwiY2Fubm90UmVhZFNTTENlcnRGaWxlIiwiTUFYX1BBVEhfTEVOR1RIIiwidHlwZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7a0JBd0JlLFVBQVVBLFlBQVYsRUFBd0I7QUFDbkMsV0FBTyxvQkFBZUEsWUFBZixFQUE2QjtBQUNoQ0MsMEJBQWtCQyxpQkFEYzs7QUFHMUJDLHNCQUFOLENBQXNCQyxHQUF0QixFQUEyQkMsS0FBM0IsRUFBa0M7QUFBQTtBQUM5QixvQkFBSSxDQUFDQyxrQkFBa0JDLFFBQWxCLENBQTJCSCxHQUEzQixDQUFELElBQW9DQyxNQUFNRyxNQUFOLEdBQWVDLGtCQUF2RCxFQUNJLE9BQU9KLEtBQVA7O0FBRUosb0JBQUk7QUFDQSwwQkFBTSxnQ0FBS0EsS0FBTCxDQUFOO0FBQ0gsaUJBRkQsQ0FHQSxPQUFPSyxLQUFQLEVBQWM7QUFDVkMsaUNBQWEsOEJBQWUseUJBQWlCQyxxQkFBaEMsRUFBdURQLEtBQXZELEVBQThERCxHQUE5RCxFQUFtRU0sTUFBTUcsS0FBekUsQ0FBYjs7QUFFQSwyQkFBT1IsS0FBUDtBQUNIOztBQUVELG9CQUFJO0FBQ0EsMkJBQU8sTUFBTSxvQ0FBU0EsS0FBVCxDQUFiO0FBQ0gsaUJBRkQsQ0FHQSxPQUFPSyxLQUFQLEVBQWM7QUFDViwwQkFBTSwwQkFBaUIsc0JBQWVJLHFCQUFoQyxFQUF1RFQsS0FBdkQsRUFBOERELEdBQTlELEVBQW1FTSxNQUFNRyxLQUF6RSxDQUFOO0FBQ0g7QUFsQjZCO0FBbUJqQztBQXRCK0IsS0FBN0IsQ0FBUDtBQXdCSCxDOztBQWpERDs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7QUFDQTs7OztBQUNBOztBQUNBOzs7Ozs7QUFHQSxNQUFNRixlQUFlLHFCQUFNLGdDQUFOLENBQXJCOztBQUVBLE1BQU1JLGtCQUFrQjtBQUNwQixhQUFjLElBRE07QUFFcEIsa0JBQWMsR0FGTTtBQUdwQixjQUFjO0FBSE0sQ0FBeEI7O0FBTUEsTUFBTU4scUJBQXFCTSxnQkFBZ0IsYUFBR0MsSUFBSCxFQUFoQixDQUEzQjs7QUFFQSxNQUFNZCxvQkFBNkIsR0FBbkM7QUFDQSxNQUFNSSxvQkFBNkIsQ0FBQyxNQUFELEVBQVMsS0FBVCxFQUFnQixLQUFoQixDQUFuQyIsImZpbGUiOiJ1dGlscy9nZXQtb3B0aW9ucy9zc2wuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgb3MgZnJvbSAnb3MnO1xuaW1wb3J0IGRlYnVnIGZyb20gJ2RlYnVnJztcbmltcG9ydCBiYXNlR2V0T3B0aW9ucyBmcm9tICcuL2Jhc2UnO1xuaW1wb3J0IHsgR2VuZXJhbEVycm9yIH0gZnJvbSAnLi4vLi4vZXJyb3JzL3J1bnRpbWUnO1xuaW1wb3J0IHsgc3RhdCwgcmVhZEZpbGUgfSBmcm9tICcuLi9wcm9taXNpZmllZC1mdW5jdGlvbnMnO1xuaW1wb3J0IHJlbmRlclRlbXBsYXRlIGZyb20gJy4uLy4uL3V0aWxzL3JlbmRlci10ZW1wbGF0ZSc7XG5pbXBvcnQgeyBSVU5USU1FX0VSUk9SUyB9IGZyb20gJy4uLy4uL2Vycm9ycy90eXBlcyc7XG5pbXBvcnQgV0FSTklOR19NRVNTQUdFUyBmcm9tICcuLi8uLi9ub3RpZmljYXRpb25zL3dhcm5pbmctbWVzc2FnZSc7XG5cblxuY29uc3QgREVCVUdfTE9HR0VSID0gZGVidWcoJ3Rlc3RjYWZlOnV0aWxzOmdldC1vcHRpb25zOnNzbCcpO1xuXG5jb25zdCBNQVhfUEFUSF9MRU5HVEggPSB7XG4gICAgJ0xpbnV4JzogICAgICA0MDk2LFxuICAgICdXaW5kb3dzX05UJzogMjYwLFxuICAgICdEYXJ3aW4nOiAgICAgMTAyNFxufTtcblxuY29uc3QgT1NfTUFYX1BBVEhfTEVOR1RIID0gTUFYX1BBVEhfTEVOR1RIW29zLnR5cGUoKV07XG5cbmNvbnN0IE9QVElPTlNfU0VQQVJBVE9SICAgICAgICAgID0gJzsnO1xuY29uc3QgRklMRV9PUFRJT05fTkFNRVMgICAgICAgICAgPSBbJ2NlcnQnLCAna2V5JywgJ3BmeCddO1xuXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIChvcHRpb25TdHJpbmcpIHtcbiAgICByZXR1cm4gYmFzZUdldE9wdGlvbnMob3B0aW9uU3RyaW5nLCB7XG4gICAgICAgIG9wdGlvbnNTZXBhcmF0b3I6IE9QVElPTlNfU0VQQVJBVE9SLFxuXG4gICAgICAgIGFzeW5jIG9uT3B0aW9uUGFyc2VkIChrZXksIHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAoIUZJTEVfT1BUSU9OX05BTUVTLmluY2x1ZGVzKGtleSkgfHwgdmFsdWUubGVuZ3RoID4gT1NfTUFYX1BBVEhfTEVOR1RIKVxuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcblxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBhd2FpdCBzdGF0KHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIERFQlVHX0xPR0dFUihyZW5kZXJUZW1wbGF0ZShXQVJOSU5HX01FU1NBR0VTLmNhbm5vdEZpbmRTU0xDZXJ0RmlsZSwgdmFsdWUsIGtleSwgZXJyb3Iuc3RhY2spKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYXdhaXQgcmVhZEZpbGUodmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEdlbmVyYWxFcnJvcihSVU5USU1FX0VSUk9SUy5jYW5ub3RSZWFkU1NMQ2VydEZpbGUsIHZhbHVlLCBrZXksIGVycm9yLnN0YWNrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG4iXX0=
