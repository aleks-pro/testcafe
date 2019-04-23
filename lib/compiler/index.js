'use strict';

exports.__esModule = true;

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _weakMap = require('babel-runtime/core-js/weak-map');

var _weakMap2 = _interopRequireDefault(_weakMap);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _pinkie = require('pinkie');

var _pinkie2 = _interopRequireDefault(_pinkie);

var _lodash = require('lodash');

var _stripBom = require('strip-bom');

var _stripBom2 = _interopRequireDefault(_stripBom);

var _testcafeLegacyApi = require('testcafe-legacy-api');

var _testcafeHammerhead = require('testcafe-hammerhead');

var _testcafeHammerhead2 = _interopRequireDefault(_testcafeHammerhead);

var _compiler = require('./test-file/formats/es-next/compiler');

var _compiler2 = _interopRequireDefault(_compiler);

var _compiler3 = require('./test-file/formats/typescript/compiler');

var _compiler4 = _interopRequireDefault(_compiler3);

var _compiler5 = require('./test-file/formats/coffeescript/compiler');

var _compiler6 = _interopRequireDefault(_compiler5);

var _raw = require('./test-file/formats/raw');

var _raw2 = _interopRequireDefault(_raw);

var _promisifiedFunctions = require('../utils/promisified-functions');

var _runtime = require('../errors/runtime');

var _types = require('../errors/types');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const SOURCE_CHUNK_LENGTH = 1000;

const testFileCompilers = [new _testcafeLegacyApi.Compiler(_testcafeHammerhead2.default.processScript), new _compiler2.default(), new _compiler4.default(), new _compiler6.default(), new _raw2.default()];

class Compiler {
    constructor(sources) {
        this.sources = sources;
    }

    static getSupportedTestFileExtensions() {
        return (0, _lodash.uniq)(testFileCompilers.map(compiler => compiler.getSupportedExtension()));
    }

    _createTestFileInfo(filename) {
        return (0, _asyncToGenerator3.default)(function* () {
            let code = null;

            try {
                code = yield (0, _promisifiedFunctions.readFile)(filename);
            } catch (err) {
                throw new _runtime.GeneralError(_types.RUNTIME_ERRORS.cannotFindSpecifiedTestSource, filename);
            }

            code = (0, _stripBom2.default)(code).toString();

            const compiler = (0, _lodash.find)(testFileCompilers, function (someCompiler) {
                return someCompiler.canCompile(code, filename);
            });

            if (!compiler) return null;

            return {
                filename,
                code,
                compiler,

                compiledCode: null
            };
        })();
    }

    _createTestFilesInfo(filenames) {
        var _this = this;

        return (0, _asyncToGenerator3.default)(function* () {
            const testFilesInfo = yield _pinkie2.default.all(filenames.map(function (filename) {
                return _this._createTestFileInfo(filename);
            }));

            return testFilesInfo.filter(function (info) {
                return !!info;
            });
        })();
    }

    _precompileFiles(compiler, testFilesInfo) {
        return (0, _asyncToGenerator3.default)(function* () {
            if (!compiler.canPrecompile) return;

            const precompiledCode = yield compiler.precompile(testFilesInfo);

            for (let i = 0; i < testFilesInfo.length; i++) testFilesInfo[i].compiledCode = precompiledCode[i];
        })();
    }

    _getCompilerTasks(testFilesInfo) {
        const tasks = new _weakMap2.default();
        const compilers = [];

        for (var _iterator = testFilesInfo, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : (0, _getIterator3.default)(_iterator);;) {
            var _ref;

            if (_isArray) {
                if (_i >= _iterator.length) break;
                _ref = _iterator[_i++];
            } else {
                _i = _iterator.next();
                if (_i.done) break;
                _ref = _i.value;
            }

            const info = _ref;
            const compiler = info.compiler;


            if (!tasks.has(compiler)) {
                compilers.push(compiler);
                tasks.set(compiler, []);
            }

            tasks.get(info.compiler).push(info);
        }

        return compilers.map(compiler => ({ compiler, compilerTestFilesInfo: tasks.get(compiler) }));
    }

    _getTests({ compiler, filename, code, compiledCode }) {
        return (0, _asyncToGenerator3.default)(function* () {
            if (compiledCode) return yield compiler.execute(compiledCode, filename);

            return yield compiler.compile(code, filename);
        })();
    }

    _compileTestFiles(filenames) {
        var _this2 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            const testFilesInfo = yield _this2._createTestFilesInfo(filenames);
            const compilerTasks = _this2._getCompilerTasks(testFilesInfo);

            yield _pinkie2.default.all(compilerTasks.map(function ({ compiler, compilerTestFilesInfo }) {
                return _this2._precompileFiles(compiler, compilerTestFilesInfo);
            }));

            const tests = [];

            for (var _iterator2 = testFilesInfo, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : (0, _getIterator3.default)(_iterator2);;) {
                var _ref2;

                if (_isArray2) {
                    if (_i2 >= _iterator2.length) break;
                    _ref2 = _iterator2[_i2++];
                } else {
                    _i2 = _iterator2.next();
                    if (_i2.done) break;
                    _ref2 = _i2.value;
                }

                const info = _ref2;

                tests.push((yield _this2._getTests(info)));
            }return tests;
        })();
    }

    getTests() {
        var _this3 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            // NOTE: split sources into chunks because the fs module can't read all files
            // simultaneously if the number of them is too large (several thousands).
            const sourceChunks = (0, _lodash.chunk)(_this3.sources, SOURCE_CHUNK_LENGTH);

            let tests = [];

            while (sourceChunks.length) tests = tests.concat((yield _this3._compileTestFiles(sourceChunks.shift())));

            Compiler.cleanUp();

            return (0, _lodash.flattenDeep)(tests).filter(function (test) {
                return !!test;
            });
        })();
    }

    static cleanUp() {
        testFileCompilers.forEach(compiler => compiler.cleanUp());
    }
}
exports.default = Compiler;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21waWxlci9pbmRleC5qcyJdLCJuYW1lcyI6WyJTT1VSQ0VfQ0hVTktfTEVOR1RIIiwidGVzdEZpbGVDb21waWxlcnMiLCJwcm9jZXNzU2NyaXB0IiwiQ29tcGlsZXIiLCJjb25zdHJ1Y3RvciIsInNvdXJjZXMiLCJnZXRTdXBwb3J0ZWRUZXN0RmlsZUV4dGVuc2lvbnMiLCJtYXAiLCJjb21waWxlciIsImdldFN1cHBvcnRlZEV4dGVuc2lvbiIsIl9jcmVhdGVUZXN0RmlsZUluZm8iLCJmaWxlbmFtZSIsImNvZGUiLCJlcnIiLCJjYW5ub3RGaW5kU3BlY2lmaWVkVGVzdFNvdXJjZSIsInRvU3RyaW5nIiwic29tZUNvbXBpbGVyIiwiY2FuQ29tcGlsZSIsImNvbXBpbGVkQ29kZSIsIl9jcmVhdGVUZXN0RmlsZXNJbmZvIiwiZmlsZW5hbWVzIiwidGVzdEZpbGVzSW5mbyIsImFsbCIsImZpbHRlciIsImluZm8iLCJfcHJlY29tcGlsZUZpbGVzIiwiY2FuUHJlY29tcGlsZSIsInByZWNvbXBpbGVkQ29kZSIsInByZWNvbXBpbGUiLCJpIiwibGVuZ3RoIiwiX2dldENvbXBpbGVyVGFza3MiLCJ0YXNrcyIsImNvbXBpbGVycyIsImhhcyIsInB1c2giLCJzZXQiLCJnZXQiLCJjb21waWxlclRlc3RGaWxlc0luZm8iLCJfZ2V0VGVzdHMiLCJleGVjdXRlIiwiY29tcGlsZSIsIl9jb21waWxlVGVzdEZpbGVzIiwiY29tcGlsZXJUYXNrcyIsInRlc3RzIiwiZ2V0VGVzdHMiLCJzb3VyY2VDaHVua3MiLCJjb25jYXQiLCJzaGlmdCIsImNsZWFuVXAiLCJ0ZXN0IiwiZm9yRWFjaCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOzs7O0FBQ0E7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7QUFHQSxNQUFNQSxzQkFBc0IsSUFBNUI7O0FBRUEsTUFB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QUNJYyxRQUFRQSxNQUFNRyxNQUFOLEVBQWEsTUFBTSxPQUFLTCxpQkFBTCxDQUF1QkksYUFBYUUsS0FBYixFQUF2QixDQUFuQixFQUFSOztBQUVKN0MscUJBQVM4QyxPQUFUOztBQUVBLG1CQUFPLHlCQUFZTCxLQUFaLEVBQW1CckIsTUFBbkIsQ0FBMEI7QUFBQSx1QkFBUSxDQUFDLENBQUMyQixJQUFWO0FBQUEsYUFBMUIsQ0FBUDtBQVpjO0FBYWpCOztBQUVELFdBQU9ELE9BQVAsR0FBa0I7QUFDZGhELDBCQUFrQmtELE9BQWxCLENBQTBCM0MsWUFBWUEsU0FBU3lDLE9BQVQsRUFBdEM7QUFDSDtBQTNHeUI7a0JBQVQ5QyxRIiwiZmlsZSI6ImNvbXBpbGVyL2luZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFByb21pc2UgZnJvbSAncGlua2llJztcbmltcG9ydCB7IGZsYXR0ZW5EZWVwLCBmaW5kLCBjaHVuaywgdW5pcSB9IGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgc3RyaXBCb20gZnJvbSAnc3RyaXAtYm9tJztcbmltcG9ydCB7IENvbXBpbGVyIGFzIExlZ2FjeVRlc3RGaWxlQ29tcGlsZXIgfSBmcm9tICd0ZXN0Y2FmZS1sZWdhY3ktYXBpJztcbmltcG9ydCBoYW1tZXJoZWFkIGZyb20gJ3Rlc3RjYWZlLWhhbW1lcmhlYWQnO1xuaW1wb3J0IEVzTmV4dFRlc3RGaWxlQ29tcGlsZXIgZnJvbSAnLi90ZXN0LWZpbGUvZm9ybWF0cy9lcy1uZXh0L2NvbXBpbGVyJztcbmltcG9ydCBUeXBlU2NyaXB0VGVzdEZpbGVDb21waWxlciBmcm9tICcuL3Rlc3QtZmlsZS9mb3JtYXRzL3R5cGVzY3JpcHQvY29tcGlsZXInO1xuaW1wb3J0IENvZmZlZVNjcmlwdFRlc3RGaWxlQ29tcGlsZXIgZnJvbSAnLi90ZXN0LWZpbGUvZm9ybWF0cy9jb2ZmZWVzY3JpcHQvY29tcGlsZXInO1xuaW1wb3J0IFJhd1Rlc3RGaWxlQ29tcGlsZXIgZnJvbSAnLi90ZXN0LWZpbGUvZm9ybWF0cy9yYXcnO1xuaW1wb3J0IHsgcmVhZEZpbGUgfSBmcm9tICcuLi91dGlscy9wcm9taXNpZmllZC1mdW5jdGlvbnMnO1xuaW1wb3J0IHsgR2VuZXJhbEVycm9yIH0gZnJvbSAnLi4vZXJyb3JzL3J1bnRpbWUnO1xuaW1wb3J0IHsgUlVOVElNRV9FUlJPUlMgfSBmcm9tICcuLi9lcnJvcnMvdHlwZXMnO1xuXG5cbmNvbnN0IFNPVVJDRV9DSFVOS19MRU5HVEggPSAxMDAwO1xuXG5jb25zdCB0ZXN0RmlsZUNvbXBpbGVycyA9IFtcbiAgICBuZXcgTGVnYWN5VGVzdEZpbGVDb21waWxlcihoYW1tZXJoZWFkLnByb2Nlc3NTY3JpcHQpLFxuICAgIG5ldyBFc05leHRUZXN0RmlsZUNvbXBpbGVyKCksXG4gICAgbmV3IFR5cGVTY3JpcHRUZXN0RmlsZUNvbXBpbGVyKCksXG4gICAgbmV3IENvZmZlZVNjcmlwdFRlc3RGaWxlQ29tcGlsZXIoKSxcbiAgICBuZXcgUmF3VGVzdEZpbGVDb21waWxlcigpXG5dO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb21waWxlciB7XG4gICAgY29uc3RydWN0b3IgKHNvdXJjZXMpIHtcbiAgICAgICAgdGhpcy5zb3VyY2VzID0gc291cmNlcztcbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0U3VwcG9ydGVkVGVzdEZpbGVFeHRlbnNpb25zICgpIHtcbiAgICAgICAgcmV0dXJuIHVuaXEodGVzdEZpbGVDb21waWxlcnMubWFwKGNvbXBpbGVyID0+IGNvbXBpbGVyLmdldFN1cHBvcnRlZEV4dGVuc2lvbigpKSk7XG4gICAgfVxuXG4gICAgYXN5bmMgX2NyZWF0ZVRlc3RGaWxlSW5mbyAoZmlsZW5hbWUpIHtcbiAgICAgICAgbGV0IGNvZGUgPSBudWxsO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb2RlID0gYXdhaXQgcmVhZEZpbGUoZmlsZW5hbWUpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBHZW5lcmFsRXJyb3IoUlVOVElNRV9FUlJPUlMuY2Fubm90RmluZFNwZWNpZmllZFRlc3RTb3VyY2UsIGZpbGVuYW1lKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvZGUgPSBzdHJpcEJvbShjb2RlKS50b1N0cmluZygpO1xuXG4gICAgICAgIGNvbnN0IGNvbXBpbGVyID0gZmluZCh0ZXN0RmlsZUNvbXBpbGVycywgc29tZUNvbXBpbGVyID0+IHNvbWVDb21waWxlci5jYW5Db21waWxlKGNvZGUsIGZpbGVuYW1lKSk7XG5cbiAgICAgICAgaWYgKCFjb21waWxlcilcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBmaWxlbmFtZSxcbiAgICAgICAgICAgIGNvZGUsXG4gICAgICAgICAgICBjb21waWxlcixcblxuICAgICAgICAgICAgY29tcGlsZWRDb2RlOiBudWxsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgYXN5bmMgX2NyZWF0ZVRlc3RGaWxlc0luZm8gKGZpbGVuYW1lcykge1xuICAgICAgICBjb25zdCB0ZXN0RmlsZXNJbmZvID0gYXdhaXQgUHJvbWlzZS5hbGwoZmlsZW5hbWVzLm1hcChmaWxlbmFtZSA9PiB0aGlzLl9jcmVhdGVUZXN0RmlsZUluZm8oZmlsZW5hbWUpKSk7XG5cbiAgICAgICAgcmV0dXJuIHRlc3RGaWxlc0luZm8uZmlsdGVyKGluZm8gPT4gISFpbmZvKTtcbiAgICB9XG5cbiAgICBhc3luYyBfcHJlY29tcGlsZUZpbGVzIChjb21waWxlciwgdGVzdEZpbGVzSW5mbykge1xuICAgICAgICBpZiAoIWNvbXBpbGVyLmNhblByZWNvbXBpbGUpXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgY29uc3QgcHJlY29tcGlsZWRDb2RlID0gYXdhaXQgY29tcGlsZXIucHJlY29tcGlsZSh0ZXN0RmlsZXNJbmZvKTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRlc3RGaWxlc0luZm8ubGVuZ3RoOyBpKyspXG4gICAgICAgICAgICB0ZXN0RmlsZXNJbmZvW2ldLmNvbXBpbGVkQ29kZSA9IHByZWNvbXBpbGVkQ29kZVtpXTtcbiAgICB9XG5cbiAgICBfZ2V0Q29tcGlsZXJUYXNrcyAodGVzdEZpbGVzSW5mbykge1xuICAgICAgICBjb25zdCB0YXNrcyAgICAgPSBuZXcgV2Vha01hcCgpO1xuICAgICAgICBjb25zdCBjb21waWxlcnMgPSBbXTtcblxuICAgICAgICBmb3IgKGNvbnN0IGluZm8gb2YgdGVzdEZpbGVzSW5mbykge1xuICAgICAgICAgICAgY29uc3QgeyBjb21waWxlciB9ID0gaW5mbztcblxuICAgICAgICAgICAgaWYgKCF0YXNrcy5oYXMoY29tcGlsZXIpKSB7XG4gICAgICAgICAgICAgICAgY29tcGlsZXJzLnB1c2goY29tcGlsZXIpO1xuICAgICAgICAgICAgICAgIHRhc2tzLnNldChjb21waWxlciwgW10pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0YXNrcy5nZXQoaW5mby5jb21waWxlcikucHVzaChpbmZvKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjb21waWxlcnMubWFwKGNvbXBpbGVyID0+ICh7IGNvbXBpbGVyLCBjb21waWxlclRlc3RGaWxlc0luZm86IHRhc2tzLmdldChjb21waWxlcikgfSkpO1xuICAgIH1cblxuICAgIGFzeW5jIF9nZXRUZXN0cyAoeyBjb21waWxlciwgZmlsZW5hbWUsIGNvZGUsIGNvbXBpbGVkQ29kZSB9KSB7XG4gICAgICAgIGlmIChjb21waWxlZENvZGUpXG4gICAgICAgICAgICByZXR1cm4gYXdhaXQgY29tcGlsZXIuZXhlY3V0ZShjb21waWxlZENvZGUsIGZpbGVuYW1lKTtcblxuICAgICAgICByZXR1cm4gYXdhaXQgY29tcGlsZXIuY29tcGlsZShjb2RlLCBmaWxlbmFtZSk7XG4gICAgfVxuXG4gICAgYXN5bmMgX2NvbXBpbGVUZXN0RmlsZXMgKGZpbGVuYW1lcykge1xuICAgICAgICBjb25zdCB0ZXN0RmlsZXNJbmZvID0gYXdhaXQgdGhpcy5fY3JlYXRlVGVzdEZpbGVzSW5mbyhmaWxlbmFtZXMpO1xuICAgICAgICBjb25zdCBjb21waWxlclRhc2tzID0gdGhpcy5fZ2V0Q29tcGlsZXJUYXNrcyh0ZXN0RmlsZXNJbmZvKTtcblxuICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChjb21waWxlclRhc2tzLm1hcCgoeyBjb21waWxlciwgY29tcGlsZXJUZXN0RmlsZXNJbmZvIH0pID0+IHRoaXMuX3ByZWNvbXBpbGVGaWxlcyhjb21waWxlciwgY29tcGlsZXJUZXN0RmlsZXNJbmZvKSkpO1xuXG4gICAgICAgIGNvbnN0IHRlc3RzID0gW107XG5cbiAgICAgICAgZm9yIChjb25zdCBpbmZvIG9mIHRlc3RGaWxlc0luZm8pXG4gICAgICAgICAgICB0ZXN0cy5wdXNoKGF3YWl0IHRoaXMuX2dldFRlc3RzKGluZm8pKTtcblxuICAgICAgICByZXR1cm4gdGVzdHM7XG4gICAgfVxuXG4gICAgYXN5bmMgZ2V0VGVzdHMgKCkge1xuICAgICAgICAvLyBOT1RFOiBzcGxpdCBzb3VyY2VzIGludG8gY2h1bmtzIGJlY2F1c2UgdGhlIGZzIG1vZHVsZSBjYW4ndCByZWFkIGFsbCBmaWxlc1xuICAgICAgICAvLyBzaW11bHRhbmVvdXNseSBpZiB0aGUgbnVtYmVyIG9mIHRoZW0gaXMgdG9vIGxhcmdlIChzZXZlcmFsIHRob3VzYW5kcykuXG4gICAgICAgIGNvbnN0IHNvdXJjZUNodW5rcyA9IGNodW5rKHRoaXMuc291cmNlcywgU09VUkNFX0NIVU5LX0xFTkdUSCk7XG5cbiAgICAgICAgbGV0IHRlc3RzID0gW107XG5cbiAgICAgICAgd2hpbGUgKHNvdXJjZUNodW5rcy5sZW5ndGgpXG4gICAgICAgICAgICB0ZXN0cyA9IHRlc3RzLmNvbmNhdChhd2FpdCB0aGlzLl9jb21waWxlVGVzdEZpbGVzKHNvdXJjZUNodW5rcy5zaGlmdCgpKSk7XG5cbiAgICAgICAgQ29tcGlsZXIuY2xlYW5VcCgpO1xuXG4gICAgICAgIHJldHVybiBmbGF0dGVuRGVlcCh0ZXN0cykuZmlsdGVyKHRlc3QgPT4gISF0ZXN0KTtcbiAgICB9XG5cbiAgICBzdGF0aWMgY2xlYW5VcCAoKSB7XG4gICAgICAgIHRlc3RGaWxlQ29tcGlsZXJzLmZvckVhY2goY29tcGlsZXIgPT4gY29tcGlsZXIuY2xlYW5VcCgpKTtcbiAgICB9XG59XG4iXX0=
