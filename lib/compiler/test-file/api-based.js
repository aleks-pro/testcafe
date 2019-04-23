'use strict';

exports.__esModule = true;

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _create = require('babel-runtime/core-js/object/create');

var _create2 = _interopRequireDefault(_create);

var _path = require('path');

var _fs = require('fs');

var _stripBom = require('strip-bom');

var _stripBom2 = _interopRequireDefault(_stripBom);

var _base = require('./base');

var _base2 = _interopRequireDefault(_base);

var _testFile = require('../../api/structure/test-file');

var _testFile2 = _interopRequireDefault(_testFile);

var _fixture = require('../../api/structure/fixture');

var _fixture2 = _interopRequireDefault(_fixture);

var _test = require('../../api/structure/test');

var _test2 = _interopRequireDefault(_test);

var _runtime = require('../../errors/runtime');

var _stackCleaningHook = require('../../errors/stack-cleaning-hook');

var _stackCleaningHook2 = _interopRequireDefault(_stackCleaningHook);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const CWD = process.cwd();

const EXPORTABLE_LIB_PATH = (0, _path.join)(__dirname, '../../api/exportable-lib');

const FIXTURE_RE = /(^|;|\s+)fixture\s*(\.|\(|`)/;
const TEST_RE = /(^|;|\s+)test\s*(\.|\()/;

const Module = module.constructor;

class APIBasedTestFileCompilerBase extends _base2.default {
    constructor() {
        super();

        this.cache = (0, _create2.default)(null);
        this.origRequireExtensions = (0, _create2.default)(null);
    }

    static get EXPORTABLE_LIB_PATH() {
        return EXPORTABLE_LIB_PATH;
    }

    static _getNodeModulesLookupPath(filename) {
        const dir = (0, _path.dirname)(filename);

        return Module._nodeModulePaths(dir);
    }

    static _isNodeModulesDep(filename) {
        return (0, _path.relative)(CWD, filename).split(_path.sep).indexOf('node_modules') >= 0;
    }

    static _execAsModule(code, filename) {
        const mod = new Module(filename, module.parent);

        mod.filename = filename;
        mod.paths = APIBasedTestFileCompilerBase._getNodeModulesLookupPath(filename);

        mod._compile(code, filename);
    }

    _compileCode(code, filename) {
        if (this.canPrecompile) return this._precompileCode([{ code, filename }])[0];

        throw new Error('Not implemented');
    }

    _precompileCode() /* testFilesInfo */{
        throw new Error('Not implemented');
    }

    _getRequireCompilers() {
        throw new Error('Not implemented');
    }

    _setupRequireHook(testFile) {
        const requireCompilers = this._getRequireCompilers();

        this.origRequireExtensions = (0, _create2.default)(null);

        (0, _keys2.default)(requireCompilers).forEach(ext => {
            const origExt = require.extensions[ext];

            this.origRequireExtensions[ext] = origExt;

            require.extensions[ext] = (mod, filename) => {
                // NOTE: remove global API so that it will be unavailable for the dependencies
                this._removeGlobalAPI();

                if (APIBasedTestFileCompilerBase._isNodeModulesDep(filename) && origExt) origExt(mod, filename);else {
                    const code = (0, _fs.readFileSync)(filename).toString();
                    const compiledCode = requireCompilers[ext]((0, _stripBom2.default)(code), filename);

                    mod.paths = APIBasedTestFileCompilerBase._getNodeModulesLookupPath(filename);

                    mod._compile(compiledCode, filename);
                }

                this._addGlobalAPI(testFile);
            };
        });
    }

    _removeRequireHook() {
        (0, _keys2.default)(this.origRequireExtensions).forEach(ext => {
            require.extensions[ext] = this.origRequireExtensions[ext];
        });
    }

    _compileCodeForTestFiles(testFilesInfo) {
        _stackCleaningHook2.default.enabled = true;

        try {
            if (this.canPrecompile) return this._precompileCode(testFilesInfo);

            return testFilesInfo.map(({ code, filename }) => this._compileCode(code, filename));
        } catch (err) {
            throw new _runtime.TestCompilationError(_stackCleaningHook2.default.cleanError(err));
        } finally {
            _stackCleaningHook2.default.enabled = false;
        }
    }

    _addGlobalAPI(testFile) {
        Object.defineProperty(global, 'fixture', {
            get: () => new _fixture2.default(testFile),
            configurable: true
        });

        Object.defineProperty(global, 'test', {
            get: () => new _test2.default(testFile),
            configurable: true
        });
    }

    _removeGlobalAPI() {
        delete global.fixture;
        delete global.test;
    }

    _runCompiledCode(compiledCode, filename) {
        const testFile = new _testFile2.default(filename);

        this._addGlobalAPI(testFile);

        _stackCleaningHook2.default.enabled = true;

        this._setupRequireHook(testFile);

        try {
            APIBasedTestFileCompilerBase._execAsModule(compiledCode, filename);
        } catch (err) {
            if (!(err instanceof _runtime.APIError)) throw new _runtime.TestCompilationError(_stackCleaningHook2.default.cleanError(err));

            throw err;
        } finally {
            this._removeRequireHook();
            _stackCleaningHook2.default.enabled = false;

            this._removeGlobalAPI();
        }

        return testFile.getTests();
    }

    precompile(testFilesInfo) {
        return this._compileCodeForTestFiles(testFilesInfo);
    }

    execute(compiledCode, filename) {
        return this._runCompiledCode(compiledCode, filename);
    }

    compile(code, filename) {
        var _precompile = this.precompile([{ code, filename }]);

        const compiledCode = _precompile[0];


        return this.execute(compiledCode, filename);
    }

    _hasTests(code) {
        return FIXTURE_RE.test(code) && TEST_RE.test(code);
    }

    cleanUp() {
        this.cache = {};
    }
}
exports.default = APIBasedTestFileCompilerBase;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21waWxlci90ZXN0LWZpbGUvYXBpLWJhc2VkLmpzIl0sIm5hbWVzIjpbIkNXRCIsInByb2Nlc3MiLCJjd2QiLCJFWFBPUlRBQkxFX0xJQl9QQVRIIiwiX19kaXJuYW1lIiwiRklYVFVSRV9SRSIsIlRFU1RfUkUiLCJNb2R1bGUiLCJtb2R1bGUiLCJjb25zdHJ1Y3RvciIsIkFQSUJhc2VkVGVzdEZpbGVDb21waWxlckJhc2UiLCJjYWNoZSIsIm9yaWdSZXF1aXJlRXh0ZW5zaW9ucyIsIl9nZXROb2RlTW9kdWxlc0xvb2t1cFBhdGgiLCJmaWxlbmFtZSIsImRpciIsIl9ub2RlTW9kdWxlUGF0aHMiLCJfaXNOb2RlTW9kdWxlc0RlcCIsInNwbGl0IiwiaW5kZXhPZiIsIl9leGVjQXNNb2R1bGUiLCJjb2RlIiwibW9kIiwicGFyZW50IiwicGF0aHMiLCJfY29tcGlsZSIsIl9jb21waWxlQ29kZSIsImNhblByZWNvbXBpbGUiLCJfcHJlY29tcGlsZUNvZGUiLCJFcnJvciIsIl9nZXRSZXF1aXJlQ29tcGlsZXJzIiwiX3NldHVwUmVxdWlyZUhvb2siLCJ0ZXN0RmlsZSIsInJlcXVpcmVDb21waWxlcnMiLCJmb3JFYWNoIiwiZXh0Iiwib3JpZ0V4dCIsInJlcXVpcmUiLCJleHRlbnNpb25zIiwiX3JlbW92ZUdsb2JhbEFQSSIsInRvU3RyaW5nIiwiY29tcGlsZWRDb2RlIiwiX2FkZEdsb2JhbEFQSSIsIl9yZW1vdmVSZXF1aXJlSG9vayIsIl9jb21waWxlQ29kZUZvclRlc3RGaWxlcyIsInRlc3RGaWxlc0luZm8iLCJlbmFibGVkIiwibWFwIiwiZXJyIiwiY2xlYW5FcnJvciIsIk9iamVjdCIsImRlZmluZVByb3BlcnR5IiwiZ2xvYmFsIiwiZ2V0IiwiY29uZmlndXJhYmxlIiwiZml4dHVyZSIsInRlc3QiLCJfcnVuQ29tcGlsZWRDb2RlIiwiZ2V0VGVzdHMiLCJwcmVjb21waWxlIiwiZXhlY3V0ZSIsImNvbXBpbGUiLCJfaGFzVGVzdHMi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RGM7OztBQUdyQixlQUFPLEtBQUttQixPQUFMLENBQWFuQixZQUFiLEVBQTJCM0IsUUFBM0IsQ0FBUDtBQUNIOztBQUVEZ0QsY0FBV3pDLElBQVgsRUFBaUI7QUFDYixlQUFPaEIsV0FBV21ELElBQVgsQ0FBZ0JuQyxJQUFoQixLQUF5QmYsUUFBUWtELElBQVIsQ0FBYW5DLElBQWIsQ0FBaEM7QUFDSDs7QUFFRDBDLGNBQVc7QUFDUCxhQUFLcEQsS0FBTCxHQUFhLEVBQWI7QUFDSDtBQXhLMEU7a0JBQTFERCw0QiIsImZpbGUiOiJjb21waWxlci90ZXN0LWZpbGUvYXBpLWJhc2VkLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZGlybmFtZSwgcmVsYXRpdmUsIGpvaW4sIHNlcCBhcyBwYXRoU2VwIH0gZnJvbSAncGF0aCc7XG5pbXBvcnQgeyByZWFkRmlsZVN5bmMgfSBmcm9tICdmcyc7XG5pbXBvcnQgc3RyaXBCb20gZnJvbSAnc3RyaXAtYm9tJztcbmltcG9ydCBUZXN0RmlsZUNvbXBpbGVyQmFzZSBmcm9tICcuL2Jhc2UnO1xuaW1wb3J0IFRlc3RGaWxlIGZyb20gJy4uLy4uL2FwaS9zdHJ1Y3R1cmUvdGVzdC1maWxlJztcbmltcG9ydCBGaXh0dXJlIGZyb20gJy4uLy4uL2FwaS9zdHJ1Y3R1cmUvZml4dHVyZSc7XG5pbXBvcnQgVGVzdCBmcm9tICcuLi8uLi9hcGkvc3RydWN0dXJlL3Rlc3QnO1xuaW1wb3J0IHsgVGVzdENvbXBpbGF0aW9uRXJyb3IsIEFQSUVycm9yIH0gZnJvbSAnLi4vLi4vZXJyb3JzL3J1bnRpbWUnO1xuaW1wb3J0IHN0YWNrQ2xlYW5pbmdIb29rIGZyb20gJy4uLy4uL2Vycm9ycy9zdGFjay1jbGVhbmluZy1ob29rJztcblxuY29uc3QgQ1dEID0gcHJvY2Vzcy5jd2QoKTtcblxuY29uc3QgRVhQT1JUQUJMRV9MSUJfUEFUSCA9IGpvaW4oX19kaXJuYW1lLCAnLi4vLi4vYXBpL2V4cG9ydGFibGUtbGliJyk7XG5cbmNvbnN0IEZJWFRVUkVfUkUgPSAvKF58O3xcXHMrKWZpeHR1cmVcXHMqKFxcLnxcXCh8YCkvO1xuY29uc3QgVEVTVF9SRSAgICA9IC8oXnw7fFxccyspdGVzdFxccyooXFwufFxcKCkvO1xuXG5jb25zdCBNb2R1bGUgPSBtb2R1bGUuY29uc3RydWN0b3I7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFQSUJhc2VkVGVzdEZpbGVDb21waWxlckJhc2UgZXh0ZW5kcyBUZXN0RmlsZUNvbXBpbGVyQmFzZSB7XG4gICAgY29uc3RydWN0b3IgKCkge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIHRoaXMuY2FjaGUgICAgICAgICAgICAgICAgID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICAgICAgdGhpcy5vcmlnUmVxdWlyZUV4dGVuc2lvbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgIH1cblxuICAgIHN0YXRpYyBnZXQgRVhQT1JUQUJMRV9MSUJfUEFUSCAoKSB7XG4gICAgICAgIHJldHVybiBFWFBPUlRBQkxFX0xJQl9QQVRIO1xuICAgIH1cblxuICAgIHN0YXRpYyBfZ2V0Tm9kZU1vZHVsZXNMb29rdXBQYXRoIChmaWxlbmFtZSkge1xuICAgICAgICBjb25zdCBkaXIgPSBkaXJuYW1lKGZpbGVuYW1lKTtcblxuICAgICAgICByZXR1cm4gTW9kdWxlLl9ub2RlTW9kdWxlUGF0aHMoZGlyKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgX2lzTm9kZU1vZHVsZXNEZXAgKGZpbGVuYW1lKSB7XG4gICAgICAgIHJldHVybiByZWxhdGl2ZShDV0QsIGZpbGVuYW1lKVxuICAgICAgICAgICAgLnNwbGl0KHBhdGhTZXApXG4gICAgICAgICAgICAuaW5kZXhPZignbm9kZV9tb2R1bGVzJykgPj0gMDtcbiAgICB9XG5cbiAgICBzdGF0aWMgX2V4ZWNBc01vZHVsZSAoY29kZSwgZmlsZW5hbWUpIHtcbiAgICAgICAgY29uc3QgbW9kID0gbmV3IE1vZHVsZShmaWxlbmFtZSwgbW9kdWxlLnBhcmVudCk7XG5cbiAgICAgICAgbW9kLmZpbGVuYW1lID0gZmlsZW5hbWU7XG4gICAgICAgIG1vZC5wYXRocyAgICA9IEFQSUJhc2VkVGVzdEZpbGVDb21waWxlckJhc2UuX2dldE5vZGVNb2R1bGVzTG9va3VwUGF0aChmaWxlbmFtZSk7XG5cbiAgICAgICAgbW9kLl9jb21waWxlKGNvZGUsIGZpbGVuYW1lKTtcbiAgICB9XG5cbiAgICBfY29tcGlsZUNvZGUgKGNvZGUsIGZpbGVuYW1lKSB7XG4gICAgICAgIGlmICh0aGlzLmNhblByZWNvbXBpbGUpXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fcHJlY29tcGlsZUNvZGUoW3sgY29kZSwgZmlsZW5hbWUgfV0pWzBdO1xuXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkJyk7XG4gICAgfVxuXG4gICAgX3ByZWNvbXBpbGVDb2RlICgvKiB0ZXN0RmlsZXNJbmZvICovKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkJyk7XG4gICAgfVxuXG4gICAgX2dldFJlcXVpcmVDb21waWxlcnMgKCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCcpO1xuICAgIH1cblxuICAgIF9zZXR1cFJlcXVpcmVIb29rICh0ZXN0RmlsZSkge1xuICAgICAgICBjb25zdCByZXF1aXJlQ29tcGlsZXJzID0gdGhpcy5fZ2V0UmVxdWlyZUNvbXBpbGVycygpO1xuXG4gICAgICAgIHRoaXMub3JpZ1JlcXVpcmVFeHRlbnNpb25zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcblxuICAgICAgICBPYmplY3Qua2V5cyhyZXF1aXJlQ29tcGlsZXJzKS5mb3JFYWNoKGV4dCA9PiB7XG4gICAgICAgICAgICBjb25zdCBvcmlnRXh0ID0gcmVxdWlyZS5leHRlbnNpb25zW2V4dF07XG5cbiAgICAgICAgICAgIHRoaXMub3JpZ1JlcXVpcmVFeHRlbnNpb25zW2V4dF0gPSBvcmlnRXh0O1xuXG4gICAgICAgICAgICByZXF1aXJlLmV4dGVuc2lvbnNbZXh0XSA9IChtb2QsIGZpbGVuYW1lKSA9PiB7XG4gICAgICAgICAgICAgICAgLy8gTk9URTogcmVtb3ZlIGdsb2JhbCBBUEkgc28gdGhhdCBpdCB3aWxsIGJlIHVuYXZhaWxhYmxlIGZvciB0aGUgZGVwZW5kZW5jaWVzXG4gICAgICAgICAgICAgICAgdGhpcy5fcmVtb3ZlR2xvYmFsQVBJKCk7XG5cbiAgICAgICAgICAgICAgICBpZiAoQVBJQmFzZWRUZXN0RmlsZUNvbXBpbGVyQmFzZS5faXNOb2RlTW9kdWxlc0RlcChmaWxlbmFtZSkgJiYgb3JpZ0V4dClcbiAgICAgICAgICAgICAgICAgICAgb3JpZ0V4dChtb2QsIGZpbGVuYW1lKTtcblxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjb2RlICAgICAgICAgPSByZWFkRmlsZVN5bmMoZmlsZW5hbWUpLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbXBpbGVkQ29kZSA9IHJlcXVpcmVDb21waWxlcnNbZXh0XShzdHJpcEJvbShjb2RlKSwgZmlsZW5hbWUpO1xuXG4gICAgICAgICAgICAgICAgICAgIG1vZC5wYXRocyA9IEFQSUJhc2VkVGVzdEZpbGVDb21waWxlckJhc2UuX2dldE5vZGVNb2R1bGVzTG9va3VwUGF0aChmaWxlbmFtZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgbW9kLl9jb21waWxlKGNvbXBpbGVkQ29kZSwgZmlsZW5hbWUpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRoaXMuX2FkZEdsb2JhbEFQSSh0ZXN0RmlsZSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBfcmVtb3ZlUmVxdWlyZUhvb2sgKCkge1xuICAgICAgICBPYmplY3Qua2V5cyh0aGlzLm9yaWdSZXF1aXJlRXh0ZW5zaW9ucykuZm9yRWFjaChleHQgPT4ge1xuICAgICAgICAgICAgcmVxdWlyZS5leHRlbnNpb25zW2V4dF0gPSB0aGlzLm9yaWdSZXF1aXJlRXh0ZW5zaW9uc1tleHRdO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBfY29tcGlsZUNvZGVGb3JUZXN0RmlsZXMgKHRlc3RGaWxlc0luZm8pIHtcbiAgICAgICAgc3RhY2tDbGVhbmluZ0hvb2suZW5hYmxlZCA9IHRydWU7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmICh0aGlzLmNhblByZWNvbXBpbGUpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3ByZWNvbXBpbGVDb2RlKHRlc3RGaWxlc0luZm8pO1xuXG4gICAgICAgICAgICByZXR1cm4gdGVzdEZpbGVzSW5mby5tYXAoKHsgY29kZSwgZmlsZW5hbWUgfSkgPT4gdGhpcy5fY29tcGlsZUNvZGUoY29kZSwgZmlsZW5hbWUpKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVGVzdENvbXBpbGF0aW9uRXJyb3Ioc3RhY2tDbGVhbmluZ0hvb2suY2xlYW5FcnJvcihlcnIpKTtcbiAgICAgICAgfVxuICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgIHN0YWNrQ2xlYW5pbmdIb29rLmVuYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9hZGRHbG9iYWxBUEkgKHRlc3RGaWxlKSB7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShnbG9iYWwsICdmaXh0dXJlJywge1xuICAgICAgICAgICAgZ2V0OiAgICAgICAgICAoKSA9PiBuZXcgRml4dHVyZSh0ZXN0RmlsZSksXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG5cbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGdsb2JhbCwgJ3Rlc3QnLCB7XG4gICAgICAgICAgICBnZXQ6ICAgICAgICAgICgpID0+IG5ldyBUZXN0KHRlc3RGaWxlKSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBfcmVtb3ZlR2xvYmFsQVBJICgpIHtcbiAgICAgICAgZGVsZXRlIGdsb2JhbC5maXh0dXJlO1xuICAgICAgICBkZWxldGUgZ2xvYmFsLnRlc3Q7XG4gICAgfVxuXG4gICAgX3J1bkNvbXBpbGVkQ29kZSAoY29tcGlsZWRDb2RlLCBmaWxlbmFtZSkge1xuICAgICAgICBjb25zdCB0ZXN0RmlsZSA9IG5ldyBUZXN0RmlsZShmaWxlbmFtZSk7XG5cbiAgICAgICAgdGhpcy5fYWRkR2xvYmFsQVBJKHRlc3RGaWxlKTtcblxuICAgICAgICBzdGFja0NsZWFuaW5nSG9vay5lbmFibGVkID0gdHJ1ZTtcblxuICAgICAgICB0aGlzLl9zZXR1cFJlcXVpcmVIb29rKHRlc3RGaWxlKTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgQVBJQmFzZWRUZXN0RmlsZUNvbXBpbGVyQmFzZS5fZXhlY0FzTW9kdWxlKGNvbXBpbGVkQ29kZSwgZmlsZW5hbWUpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGlmICghKGVyciBpbnN0YW5jZW9mIEFQSUVycm9yKSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVGVzdENvbXBpbGF0aW9uRXJyb3Ioc3RhY2tDbGVhbmluZ0hvb2suY2xlYW5FcnJvcihlcnIpKTtcblxuICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICB9XG4gICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgdGhpcy5fcmVtb3ZlUmVxdWlyZUhvb2soKTtcbiAgICAgICAgICAgIHN0YWNrQ2xlYW5pbmdIb29rLmVuYWJsZWQgPSBmYWxzZTtcblxuICAgICAgICAgICAgdGhpcy5fcmVtb3ZlR2xvYmFsQVBJKCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGVzdEZpbGUuZ2V0VGVzdHMoKTtcbiAgICB9XG5cblxuICAgIHByZWNvbXBpbGUgKHRlc3RGaWxlc0luZm8pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NvbXBpbGVDb2RlRm9yVGVzdEZpbGVzKHRlc3RGaWxlc0luZm8pO1xuICAgIH1cblxuICAgIGV4ZWN1dGUgKGNvbXBpbGVkQ29kZSwgZmlsZW5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3J1bkNvbXBpbGVkQ29kZShjb21waWxlZENvZGUsIGZpbGVuYW1lKTtcbiAgICB9XG5cbiAgICBjb21waWxlIChjb2RlLCBmaWxlbmFtZSkge1xuICAgICAgICBjb25zdCBbY29tcGlsZWRDb2RlXSA9IHRoaXMucHJlY29tcGlsZShbeyBjb2RlLCBmaWxlbmFtZSB9XSk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZXhlY3V0ZShjb21waWxlZENvZGUsIGZpbGVuYW1lKTtcbiAgICB9XG5cbiAgICBfaGFzVGVzdHMgKGNvZGUpIHtcbiAgICAgICAgcmV0dXJuIEZJWFRVUkVfUkUudGVzdChjb2RlKSAmJiBURVNUX1JFLnRlc3QoY29kZSk7XG4gICAgfVxuXG4gICAgY2xlYW5VcCAoKSB7XG4gICAgICAgIHRoaXMuY2FjaGUgPSB7fTtcbiAgICB9XG59XG4iXX0=
