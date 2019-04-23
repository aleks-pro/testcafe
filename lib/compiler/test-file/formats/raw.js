'use strict';

exports.__esModule = true;

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _base = require('../base');

var _base2 = _interopRequireDefault(_base);

var _runtime = require('../../../errors/runtime');

var _types = require('../../../errors/types');

var _testFile = require('../../../api/structure/test-file');

var _testFile2 = _interopRequireDefault(_testFile);

var _fixture = require('../../../api/structure/fixture');

var _fixture2 = _interopRequireDefault(_fixture);

var _test = require('../../../api/structure/test');

var _test2 = _interopRequireDefault(_test);

var _fromObject = require('../../../test-run/commands/from-object');

var _fromObject2 = _interopRequireDefault(_fromObject);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class RawTestFileCompiler extends _base2.default {
    static _createTestFn(commands) {
        return (() => {
            var _ref = (0, _asyncToGenerator3.default)(function* (t) {
                for (let i = 0; i < commands.length; i++) {
                    const callsite = commands[i] && commands[i].callsite;
                    let command = null;

                    try {
                        command = (0, _fromObject2.default)(commands[i], t.testRun);

                        yield t.testRun.executeCommand(command, callsite);
                    } catch (err) {
                        err.callsite = callsite;
                        throw err;
                    }
                }
            });

            return function (_x) {
                return _ref.apply(this, arguments);
            };
        })();
    }

    static _assignCommonTestingUnitProperties(src, dest) {
        if (src.pageUrl) dest.page(src.pageUrl);

        if (src.authCredentials) dest.httpAuth(src.authCredentials);

        /* eslint-disable no-unused-expressions */
        if (src.only) dest.only;

        if (src.skip) dest.skip;

        if (src.disablePageReloads) dest.disablePageReloads;

        if (src.enablePageReloads) dest.enablePageReloads;
        /* eslint-enable no-unused-expressions */
    }

    static _addTest(testFile, src) {
        const test = new _test2.default(testFile);

        test(src.name, RawTestFileCompiler._createTestFn(src.commands));

        RawTestFileCompiler._assignCommonTestingUnitProperties(src, test);

        if (src.beforeCommands) test.before(RawTestFileCompiler._createTestFn(src.beforeCommands));

        if (src.afterCommands) test.after(RawTestFileCompiler._createTestFn(src.afterCommands));

        return test;
    }

    static _addFixture(testFile, src) {
        const fixture = new _fixture2.default(testFile);

        fixture(src.name);

        RawTestFileCompiler._assignCommonTestingUnitProperties(src, fixture);

        if (src.beforeEachCommands) fixture.beforeEach(RawTestFileCompiler._createTestFn(src.beforeEachCommands));

        if (src.afterEachCommands) fixture.afterEach(RawTestFileCompiler._createTestFn(src.afterEachCommands));

        src.tests.forEach(testSrc => RawTestFileCompiler._addTest(testFile, testSrc));
    }

    _hasTests() {
        return true;
    }

    getSupportedExtension() {
        return '.testcafe';
    }

    compile(code, filename) {
        const testFile = new _testFile2.default(filename);

        let data = null;

        try {
            data = JSON.parse(code);

            data.fixtures.forEach(fixtureSrc => RawTestFileCompiler._addFixture(testFile, fixtureSrc));

            return testFile.getTests();
        } catch (err) {
            throw new _runtime.GeneralError(_types.RUNTIME_ERRORS.cannotParseRawFile, filename, err.toString());
        }
    }
}
exports.default = RawTestFileCompiler;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21waWxlci90ZXN0LWZpbGUvZm9ybWF0cy9yYXcuanMiXSwibmFtZXMiOlsiUmF3VGVzdEZpbGVDb21waWxlciIsIl9jcmVhdGVUZXN0Rm4iLCJjb21tYW5kcyIsInQiLCJpIiwibGVuZ3RoIiwiY2FsbHNpdGUiLCJjb21tYW5kIiwidGVzdFJ1biIsImV4ZWN1dGVDb21tYW5kIiwiZXJyIiwiX2Fzc2lnbkNvbW1vblRlc3RpbmdVbml0UHJvcGVydGllcyIsInNyYyIsImRlc3QiLCJwYWdlVXJsIiwicGFnZSIsImF1dGhDcmVkZW50aWFscyIsImh0dHBBdXRoIiwib25seSIsInNraXAiLCJkaXNhYmxlUGFnZVJlbG9hZHMiLCJlbmFibGVQYWdlUmVsb2FkcyIsIl9hZGRUZXN0IiwidGVzdEZpbGUiLCJ0ZXN0IiwibmFtZSIsImJlZm9yZUNvbW1hbmRzIiwiYmVmb3JlIiwiYWZ0ZXJDb21tYW5kcyIsImFmdGVyIiwiX2FkZEZpeHR1cmUiLCJmaXh0dXJlIiwiYmVmb3JlRWFjaENvbW1hbmRzIiwiYmVmb3JlRWFjaCIsImFmdGVyRWFjaENvbW1hbmRzIiwiYWZ0ZXJFYWNoIiwidGVzdHMiLCJmb3JFYWNoIiwidGVzdFNyYyIsIl9oYXNUZXN0cyIsImdldFN1cHBvcnRlZEV4dGVuc2lvbiIsImNvbXBpbGUiLCJjb2RlIiwiZmlsZW5hbWUiLCJkYXRhIiwiSlNPTiIsInBhcnNlIiwiZml4dHVyZXMiLCJmaXh0dXJlU3JjIiwiZ2V0VGVzdHMiLCJjYW5ub3RQYXJzZVJhd0ZpbGUiLCJ0b1N0cmluZyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQTs7OztBQUNBOztBQUNBOztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7QUFFZSxNQUFNQSxtQkFBTix3QkFBdUQ7QUFDbEUsV0FBT0MsYUFBUCxDQUFzQkMsUUFBdEIsRUFBZ0M7QUFDNUI7QUFBQSx1REFBTyxXQUFNQyxDQUFOLEVBQVc7QUFDZCxxQkFBSyxJQUFJQyxJ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QUFLRyxRQUFMLENBQWNWLE9BQWQsQ0FBc0JXLGNBQWNoRCxvQkFBb0I4QixXQUFwQixDQUFnQ1AsUUFBaEMsRUFBMEN5QixVQUExQyxDQUFwQzs7QUFFQSxtQkFBT3pCLFNBQVMwQixRQUFULEVBQVA7QUFDSCxTQU5ELENBT0EsT0FBT3ZDLEdBQVAsRUFBWTtBQUNSLGtCQUFNLDBCQUFpQixzQkFBZXdDLGtCQUFoQyxFQUFvRFAsUUFBcEQsRUFBOERqQyxJQUFJeUMsUUFBSixFQUE5RCxDQUFOO0FBQ0g7QUFDSjtBQWpHaUU7a0JBQWpEbkQsbUIiLCJmaWxlIjoiY29tcGlsZXIvdGVzdC1maWxlL2Zvcm1hdHMvcmF3LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFRlc3RGaWxlQ29tcGlsZXJCYXNlIGZyb20gJy4uL2Jhc2UnO1xuaW1wb3J0IHsgR2VuZXJhbEVycm9yIH0gZnJvbSAnLi4vLi4vLi4vZXJyb3JzL3J1bnRpbWUnO1xuaW1wb3J0IHsgUlVOVElNRV9FUlJPUlMgfSBmcm9tICcuLi8uLi8uLi9lcnJvcnMvdHlwZXMnO1xuaW1wb3J0IFRlc3RGaWxlIGZyb20gJy4uLy4uLy4uL2FwaS9zdHJ1Y3R1cmUvdGVzdC1maWxlJztcbmltcG9ydCBGaXh0dXJlIGZyb20gJy4uLy4uLy4uL2FwaS9zdHJ1Y3R1cmUvZml4dHVyZSc7XG5pbXBvcnQgVGVzdCBmcm9tICcuLi8uLi8uLi9hcGkvc3RydWN0dXJlL3Rlc3QnO1xuaW1wb3J0IGNyZWF0ZUNvbW1hbmRGcm9tT2JqZWN0IGZyb20gJy4uLy4uLy4uL3Rlc3QtcnVuL2NvbW1hbmRzL2Zyb20tb2JqZWN0JztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmF3VGVzdEZpbGVDb21waWxlciBleHRlbmRzIFRlc3RGaWxlQ29tcGlsZXJCYXNlIHtcbiAgICBzdGF0aWMgX2NyZWF0ZVRlc3RGbiAoY29tbWFuZHMpIHtcbiAgICAgICAgcmV0dXJuIGFzeW5jIHQgPT4ge1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb21tYW5kcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNhbGxzaXRlID0gY29tbWFuZHNbaV0gJiYgY29tbWFuZHNbaV0uY2FsbHNpdGU7XG4gICAgICAgICAgICAgICAgbGV0IGNvbW1hbmQgID0gbnVsbDtcblxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbW1hbmQgPSBjcmVhdGVDb21tYW5kRnJvbU9iamVjdChjb21tYW5kc1tpXSwgdC50ZXN0UnVuKTtcblxuICAgICAgICAgICAgICAgICAgICBhd2FpdCB0LnRlc3RSdW4uZXhlY3V0ZUNvbW1hbmQoY29tbWFuZCwgY2FsbHNpdGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGVyci5jYWxsc2l0ZSA9IGNhbGxzaXRlO1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHN0YXRpYyBfYXNzaWduQ29tbW9uVGVzdGluZ1VuaXRQcm9wZXJ0aWVzIChzcmMsIGRlc3QpIHtcbiAgICAgICAgaWYgKHNyYy5wYWdlVXJsKVxuICAgICAgICAgICAgZGVzdC5wYWdlKHNyYy5wYWdlVXJsKTtcblxuICAgICAgICBpZiAoc3JjLmF1dGhDcmVkZW50aWFscylcbiAgICAgICAgICAgIGRlc3QuaHR0cEF1dGgoc3JjLmF1dGhDcmVkZW50aWFscyk7XG5cbiAgICAgICAgLyogZXNsaW50LWRpc2FibGUgbm8tdW51c2VkLWV4cHJlc3Npb25zICovXG4gICAgICAgIGlmIChzcmMub25seSlcbiAgICAgICAgICAgIGRlc3Qub25seTtcblxuICAgICAgICBpZiAoc3JjLnNraXApXG4gICAgICAgICAgICBkZXN0LnNraXA7XG5cbiAgICAgICAgaWYgKHNyYy5kaXNhYmxlUGFnZVJlbG9hZHMpXG4gICAgICAgICAgICBkZXN0LmRpc2FibGVQYWdlUmVsb2FkcztcblxuICAgICAgICBpZiAoc3JjLmVuYWJsZVBhZ2VSZWxvYWRzKVxuICAgICAgICAgICAgZGVzdC5lbmFibGVQYWdlUmVsb2FkcztcbiAgICAgICAgLyogZXNsaW50LWVuYWJsZSBuby11bnVzZWQtZXhwcmVzc2lvbnMgKi9cbiAgICB9XG5cbiAgICBzdGF0aWMgX2FkZFRlc3QgKHRlc3RGaWxlLCBzcmMpIHtcbiAgICAgICAgY29uc3QgdGVzdCA9IG5ldyBUZXN0KHRlc3RGaWxlKTtcblxuICAgICAgICB0ZXN0KHNyYy5uYW1lLCBSYXdUZXN0RmlsZUNvbXBpbGVyLl9jcmVhdGVUZXN0Rm4oc3JjLmNvbW1hbmRzKSk7XG5cbiAgICAgICAgUmF3VGVzdEZpbGVDb21waWxlci5fYXNzaWduQ29tbW9uVGVzdGluZ1VuaXRQcm9wZXJ0aWVzKHNyYywgdGVzdCk7XG5cbiAgICAgICAgaWYgKHNyYy5iZWZvcmVDb21tYW5kcylcbiAgICAgICAgICAgIHRlc3QuYmVmb3JlKFJhd1Rlc3RGaWxlQ29tcGlsZXIuX2NyZWF0ZVRlc3RGbihzcmMuYmVmb3JlQ29tbWFuZHMpKTtcblxuICAgICAgICBpZiAoc3JjLmFmdGVyQ29tbWFuZHMpXG4gICAgICAgICAgICB0ZXN0LmFmdGVyKFJhd1Rlc3RGaWxlQ29tcGlsZXIuX2NyZWF0ZVRlc3RGbihzcmMuYWZ0ZXJDb21tYW5kcykpO1xuXG4gICAgICAgIHJldHVybiB0ZXN0O1xuICAgIH1cblxuICAgIHN0YXRpYyBfYWRkRml4dHVyZSAodGVzdEZpbGUsIHNyYykge1xuICAgICAgICBjb25zdCBmaXh0dXJlID0gbmV3IEZpeHR1cmUodGVzdEZpbGUpO1xuXG4gICAgICAgIGZpeHR1cmUoc3JjLm5hbWUpO1xuXG4gICAgICAgIFJhd1Rlc3RGaWxlQ29tcGlsZXIuX2Fzc2lnbkNvbW1vblRlc3RpbmdVbml0UHJvcGVydGllcyhzcmMsIGZpeHR1cmUpO1xuXG4gICAgICAgIGlmIChzcmMuYmVmb3JlRWFjaENvbW1hbmRzKVxuICAgICAgICAgICAgZml4dHVyZS5iZWZvcmVFYWNoKFJhd1Rlc3RGaWxlQ29tcGlsZXIuX2NyZWF0ZVRlc3RGbihzcmMuYmVmb3JlRWFjaENvbW1hbmRzKSk7XG5cbiAgICAgICAgaWYgKHNyYy5hZnRlckVhY2hDb21tYW5kcylcbiAgICAgICAgICAgIGZpeHR1cmUuYWZ0ZXJFYWNoKFJhd1Rlc3RGaWxlQ29tcGlsZXIuX2NyZWF0ZVRlc3RGbihzcmMuYWZ0ZXJFYWNoQ29tbWFuZHMpKTtcblxuICAgICAgICBzcmMudGVzdHMuZm9yRWFjaCh0ZXN0U3JjID0+IFJhd1Rlc3RGaWxlQ29tcGlsZXIuX2FkZFRlc3QodGVzdEZpbGUsIHRlc3RTcmMpKTtcbiAgICB9XG5cbiAgICBfaGFzVGVzdHMgKCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBnZXRTdXBwb3J0ZWRFeHRlbnNpb24gKCkge1xuICAgICAgICByZXR1cm4gJy50ZXN0Y2FmZSc7XG4gICAgfVxuXG4gICAgY29tcGlsZSAoY29kZSwgZmlsZW5hbWUpIHtcbiAgICAgICAgY29uc3QgdGVzdEZpbGUgPSBuZXcgVGVzdEZpbGUoZmlsZW5hbWUpO1xuXG4gICAgICAgIGxldCBkYXRhID0gbnVsbDtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgZGF0YSA9IEpTT04ucGFyc2UoY29kZSk7XG5cbiAgICAgICAgICAgIGRhdGEuZml4dHVyZXMuZm9yRWFjaChmaXh0dXJlU3JjID0+IFJhd1Rlc3RGaWxlQ29tcGlsZXIuX2FkZEZpeHR1cmUodGVzdEZpbGUsIGZpeHR1cmVTcmMpKTtcblxuICAgICAgICAgICAgcmV0dXJuIHRlc3RGaWxlLmdldFRlc3RzKCk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEdlbmVyYWxFcnJvcihSVU5USU1FX0VSUk9SUy5jYW5ub3RQYXJzZVJhd0ZpbGUsIGZpbGVuYW1lLCBlcnIudG9TdHJpbmcoKSk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=
