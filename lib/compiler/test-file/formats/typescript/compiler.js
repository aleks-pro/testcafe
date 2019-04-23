'use strict';

exports.__esModule = true;

var _map = require('babel-runtime/core-js/map');

var _map2 = _interopRequireDefault(_map);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _lodash = require('lodash');

var _osFamily = require('os-family');

var _osFamily2 = _interopRequireDefault(_osFamily);

var _apiBased = require('../../api-based');

var _apiBased2 = _interopRequireDefault(_apiBased);

var _compiler = require('../es-next/compiler');

var _compiler2 = _interopRequireDefault(_compiler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const RENAMED_DEPENDENCIES_MAP = new _map2.default([['testcafe', _apiBased2.default.EXPORTABLE_LIB_PATH]]);

class TypeScriptTestFileCompiler extends _apiBased2.default {
    static _getTypescriptOptions() {
        // NOTE: lazy load the compiler
        const ts = require('typescript');

        return {
            experimentalDecorators: true,
            emitDecoratorMetadata: true,
            allowJs: true,
            pretty: true,
            inlineSourceMap: true,
            noImplicitAny: false,
            module: ts.ModuleKind.CommonJS,
            target: 2 /* ES6 */
            , lib: ['lib.es6.d.ts'],
            baseUrl: __dirname,
            paths: { testcafe: ['../../../../../ts-defs/index.d.ts'] },
            suppressOutputPathCheck: true,
            skipLibCheck: true
        };
    }

    static _reportErrors(diagnostics) {
        // NOTE: lazy load the compiler
        const ts = require('typescript');
        let errMsg = 'TypeScript compilation failed.\n';

        diagnostics.forEach(d => {
            const file = d.file;

            var _file$getLineAndChara = file.getLineAndCharacterOfPosition(d.start);

            const line = _file$getLineAndChara.line,
                  character = _file$getLineAndChara.character;

            const message = ts.flattenDiagnosticMessageText(d.messageText, '\n');

            errMsg += `${file.fileName} (${line + 1}, ${character + 1}): ${message}\n`;
        });

        throw new Error(errMsg);
    }

    static _normalizeFilename(filename) {
        filename = _path2.default.resolve(filename);

        if (_osFamily2.default.win) filename = filename.toLowerCase();

        return filename;
    }

    _precompileCode(testFilesInfo) {
        // NOTE: lazy load the compiler
        const ts = require('typescript');

        const filenames = testFilesInfo.map(({ filename }) => filename);
        const normalizedFilenames = filenames.map(filename => TypeScriptTestFileCompiler._normalizeFilename(filename));
        const normalizedFilenamesMap = (0, _lodash.zipObject)(normalizedFilenames, filenames);

        const uncachedFiles = normalizedFilenames.filter(filename => !this.cache[filename]).map(filename => normalizedFilenamesMap[filename]);

        const opts = TypeScriptTestFileCompiler._getTypescriptOptions();
        const program = ts.createProgram(uncachedFiles, opts);

        program.getSourceFiles().forEach(sourceFile => {
            sourceFile.renamedDependencies = RENAMED_DEPENDENCIES_MAP;
        });

        const diagnostics = ts.getPreEmitDiagnostics(program);

        if (diagnostics.length) TypeScriptTestFileCompiler._reportErrors(diagnostics);

        // NOTE: The first argument of emit() is a source file to be compiled. If it's undefined, all files in
        // <program> will be compiled. <program> contains a file specified in createProgram() plus all its dependencies.
        // This mode is much faster than compiling files one-by-one, and it is used in the tsc CLI compiler.
        program.emit(void 0, (outputName, result, writeBOM, onError, sources) => {
            const sourcePath = TypeScriptTestFileCompiler._normalizeFilename(sources[0].fileName);

            this.cache[sourcePath] = result;
        });

        return normalizedFilenames.map(filename => this.cache[filename]);
    }

    _getRequireCompilers() {
        return {
            '.ts': (code, filename) => this._compileCode(code, filename),
            '.js': (code, filename) => _compiler2.default.prototype._compileCode.call(this, code, filename)
        };
    }

    get canPrecompile() {
        return true;
    }

    getSupportedExtension() {
        return '.ts';
    }
}
exports.default = TypeScriptTestFileCompiler;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jb21waWxlci90ZXN0LWZpbGUvZm9ybWF0cy90eXBlc2NyaXB0L2NvbXBpbGVyLmpzIl0sIm5hbWVzIjpbIlJFTkFNRURfREVQRU5ERU5DSUVTX01BUCIsIkVYUE9SVEFCTEVfTElCX1BBVEgiLCJUeXBlU2NyaXB0VGVzdEZpbGVDb21waWxlciIsIl9nZXRUeXBlc2NyaXB0T3B0aW9ucyIsInRzIiwicmVxdWlyZSIsImV4cGVyaW1lbnRhbERlY29yYXRvcnMiLCJlbWl0RGVjb3JhdG9yTWV0YWRhdGEiLCJhbGxvd0pzIiwicHJldHR5IiwiaW5saW5lU291cmNlTWFwIiwibm9JbXBsaWNpdEFueSIsIm1vZHVsZSIsIk1vZHVsZUtpbmQiLCJDb21tb25KUyIsInRhcmdldCIsImxpYiIsImJhc2VVcmwiLCJfX2Rpcm5hbWUiLCJwYXRocyIsInRlc3RjYWZlIiwic3VwcHJlc3NPdXRwdXRQYXRoQ2hlY2siLCJza2lwTGliQ2hlY2siLCJfcmVwb3J0RXJyb3JzIiwiZGlhZ25vc3RpY3MiLCJlcnJNc2ciLCJmb3JFYWNoIiwiZCIsImZpbGUiLCJnZXRMaW5lQW5kQ2hhcmFjdGVyT2ZQb3NpdGlvbiIsInN0YXJ0IiwibGluZSIsImNoYXJhY3RlciIsIm1lc3NhZ2UiLCJmbGF0dGVuRGlhZ25vc3RpY01lc3NhZ2VUZXh0IiwibWVzc2FnZVRleHQiLCJmaWxlTmFtZSIsIkVycm9yIiwiX25vcm1hbGl6ZUZpbGVuYW1lIiwiZmlsZW5hbWUiLCJyZXNvbHZlIiwid2luIiwidG9Mb3dlckNhc2UiLCJfcHJlY29tcGlsZUNvZGUiLCJ0ZXN0RmlsZXNJbmZvIiwiZmlsZW5hbWVzIiwibWFwIiwibm9ybWFsaXplZEZpbGVuYW1lcyIsIm5vcm1hbGl6ZWRGaWxlbmFtZXNNYXAiLCJ1bmNhY2hlZEZpbGVzIiwiZmlsdGVyIiwiY2FjaGUiLCJvcHRzIiwicHJvZ3JhbSIsImNyZWF0ZVByb2dyYW0iLCJnZXRTb3VyY2VGaWxlcyIsInNvdXJjZUZpbGUiLCJyZW5hbWVkRGVwZW5kZW5jaWVzIiwiZ2V0UHJlRW1pdERpYWdub3N0aWNzIiwibGVuZ3RoIiwiZW1pdCIsIm91dHB1dE5hbWUiLCJyZXN1bHQiLCJ3cml0ZUJPTSIsIm9uRXJyb3IiLCJzb3VyY2VzIiwic291cmNlUGF0aCIsIl9nZXRSZXF1aXJlQ29tcGlsZXJzIiwiY29kZSIsIl9jb21waWxlQ29kZSIsInByb3RvdHlwZSIsImNhbGwiLCJjYW5QcmVjb21waWxlIiwiZ2V0U3VwcG9ydGVkRXh0ZW5zaW9uIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBOzs7O0FBQ0E7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7QUFHQSxNQUFNQSwyQkFBMkIsa0JBQVEsQ0FBQyxDQUFDLFVBQUQsRUFBYSxtQkFBNkJDLG1CQUExQyxDQUFELENBQVIsQ0FBakM7O0FBRWUsTUFBTUMsMEJBQU4sNEJBQXNFO0FBQ2pGLFdBQU9DLHFCQUFQLEdBQWdDO0FBQzVCO0FBQ0EsY0FBTUMsS0FBS0MsUUFBUSxZQUFSLENBQVg7O0FBRUEsZUFBTztBQUNIQyxvQ0FBeUIsSUFEdEI7QUFFSEMsbUNBQXlCLElBRnRCO0FBR0hDLHFCQUF5QixJQUh0QjtBQUlIQyxvQkFBeUIsSUFKdEI7QUFLSEMsNkJBQXlCLElBTHRCO0FBTUhDLDJCQUF5QixLQU50QjtBQU9IQyxvQkFBeUJSLEdBQUdTLFVBQUgsQ0FBY0MsUUFQcEM7QUFRSEMsb0JBQXlCLENBUnRCLENBUXdCO0FBUnhCLGNBU0hDLEtBQXlCLENBQUMsY0FBRCxDQVR0QjtBQVVIQyxxQkFBeUJDLFNBVnRCO0FBV0hDLG1CQUF5QixFQUFFQyxVQUFVLENBQUMsbUNBQUQsQ0FBWixFQVh0QjtBQVlIQyxxQ0FBeUIsSUFadEI7QUFhSEMsMEJBQXlCO0FBYnRCLFNBQVA7QUFlSDs7QUFFRCxXQUFPQyxhQUFQLENBQXNCQyxXQUF0QixFQUFtQztBQUMvQjtBQUNBLGNBQU1wQixLQUFTQyxRQUFRLFlBQVIsQ0FBZjtBQUNBLFlBQUlvQixTQUFTLGtDQUFiOztBQUVBRCxv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SDs7QUFFRCxRQUFJaUMsYUFBSixHQUFxQjtBQUNqQixlQUFPLElBQVA7QUFDSDs7QUFFREMsNEJBQXlCO0FBQ3JCLGVBQU8sS0FBUDtBQUNIO0FBaEdnRjtrQkFBaEV2RSwwQiIsImZpbGUiOiJjb21waWxlci90ZXN0LWZpbGUvZm9ybWF0cy90eXBlc2NyaXB0L2NvbXBpbGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyB6aXBPYmplY3QgfSBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IE9TIGZyb20gJ29zLWZhbWlseSc7XG5pbXBvcnQgQVBJQmFzZWRUZXN0RmlsZUNvbXBpbGVyQmFzZSBmcm9tICcuLi8uLi9hcGktYmFzZWQnO1xuaW1wb3J0IEVTTmV4dFRlc3RGaWxlQ29tcGlsZXIgZnJvbSAnLi4vZXMtbmV4dC9jb21waWxlcic7XG5cblxuY29uc3QgUkVOQU1FRF9ERVBFTkRFTkNJRVNfTUFQID0gbmV3IE1hcChbWyd0ZXN0Y2FmZScsIEFQSUJhc2VkVGVzdEZpbGVDb21waWxlckJhc2UuRVhQT1JUQUJMRV9MSUJfUEFUSF1dKTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVHlwZVNjcmlwdFRlc3RGaWxlQ29tcGlsZXIgZXh0ZW5kcyBBUElCYXNlZFRlc3RGaWxlQ29tcGlsZXJCYXNlIHtcbiAgICBzdGF0aWMgX2dldFR5cGVzY3JpcHRPcHRpb25zICgpIHtcbiAgICAgICAgLy8gTk9URTogbGF6eSBsb2FkIHRoZSBjb21waWxlclxuICAgICAgICBjb25zdCB0cyA9IHJlcXVpcmUoJ3R5cGVzY3JpcHQnKTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZXhwZXJpbWVudGFsRGVjb3JhdG9yczogIHRydWUsXG4gICAgICAgICAgICBlbWl0RGVjb3JhdG9yTWV0YWRhdGE6ICAgdHJ1ZSxcbiAgICAgICAgICAgIGFsbG93SnM6ICAgICAgICAgICAgICAgICB0cnVlLFxuICAgICAgICAgICAgcHJldHR5OiAgICAgICAgICAgICAgICAgIHRydWUsXG4gICAgICAgICAgICBpbmxpbmVTb3VyY2VNYXA6ICAgICAgICAgdHJ1ZSxcbiAgICAgICAgICAgIG5vSW1wbGljaXRBbnk6ICAgICAgICAgICBmYWxzZSxcbiAgICAgICAgICAgIG1vZHVsZTogICAgICAgICAgICAgICAgICB0cy5Nb2R1bGVLaW5kLkNvbW1vbkpTLFxuICAgICAgICAgICAgdGFyZ2V0OiAgICAgICAgICAgICAgICAgIDIgLyogRVM2ICovLFxuICAgICAgICAgICAgbGliOiAgICAgICAgICAgICAgICAgICAgIFsnbGliLmVzNi5kLnRzJ10sXG4gICAgICAgICAgICBiYXNlVXJsOiAgICAgICAgICAgICAgICAgX19kaXJuYW1lLFxuICAgICAgICAgICAgcGF0aHM6ICAgICAgICAgICAgICAgICAgIHsgdGVzdGNhZmU6IFsnLi4vLi4vLi4vLi4vLi4vdHMtZGVmcy9pbmRleC5kLnRzJ10gfSxcbiAgICAgICAgICAgIHN1cHByZXNzT3V0cHV0UGF0aENoZWNrOiB0cnVlLFxuICAgICAgICAgICAgc2tpcExpYkNoZWNrOiAgICAgICAgICAgIHRydWVcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBzdGF0aWMgX3JlcG9ydEVycm9ycyAoZGlhZ25vc3RpY3MpIHtcbiAgICAgICAgLy8gTk9URTogbGF6eSBsb2FkIHRoZSBjb21waWxlclxuICAgICAgICBjb25zdCB0cyAgICAgPSByZXF1aXJlKCd0eXBlc2NyaXB0Jyk7XG4gICAgICAgIGxldCBlcnJNc2cgPSAnVHlwZVNjcmlwdCBjb21waWxhdGlvbiBmYWlsZWQuXFxuJztcblxuICAgICAgICBkaWFnbm9zdGljcy5mb3JFYWNoKGQgPT4ge1xuICAgICAgICAgICAgY29uc3QgZmlsZSAgICAgICAgICAgICAgICA9IGQuZmlsZTtcbiAgICAgICAgICAgIGNvbnN0IHsgbGluZSwgY2hhcmFjdGVyIH0gPSBmaWxlLmdldExpbmVBbmRDaGFyYWN0ZXJPZlBvc2l0aW9uKGQuc3RhcnQpO1xuICAgICAgICAgICAgY29uc3QgbWVzc2FnZSAgICAgICAgICAgICA9IHRzLmZsYXR0ZW5EaWFnbm9zdGljTWVzc2FnZVRleHQoZC5tZXNzYWdlVGV4dCwgJ1xcbicpO1xuXG4gICAgICAgICAgICBlcnJNc2cgKz0gYCR7ZmlsZS5maWxlTmFtZX0gKCR7bGluZSArIDF9LCAke2NoYXJhY3RlciArIDF9KTogJHttZXNzYWdlfVxcbmA7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJNc2cpO1xuICAgIH1cblxuICAgIHN0YXRpYyBfbm9ybWFsaXplRmlsZW5hbWUgKGZpbGVuYW1lKSB7XG4gICAgICAgIGZpbGVuYW1lID0gcGF0aC5yZXNvbHZlKGZpbGVuYW1lKTtcblxuICAgICAgICBpZiAoT1Mud2luKVxuICAgICAgICAgICAgZmlsZW5hbWUgPSBmaWxlbmFtZS50b0xvd2VyQ2FzZSgpO1xuXG4gICAgICAgIHJldHVybiBmaWxlbmFtZTtcbiAgICB9XG5cbiAgICBfcHJlY29tcGlsZUNvZGUgKHRlc3RGaWxlc0luZm8pIHtcbiAgICAgICAgLy8gTk9URTogbGF6eSBsb2FkIHRoZSBjb21waWxlclxuICAgICAgICBjb25zdCB0cyA9IHJlcXVpcmUoJ3R5cGVzY3JpcHQnKTtcblxuICAgICAgICBjb25zdCBmaWxlbmFtZXMgICAgICAgICAgICAgID0gdGVzdEZpbGVzSW5mby5tYXAoKHsgZmlsZW5hbWUgfSkgPT4gZmlsZW5hbWUpO1xuICAgICAgICBjb25zdCBub3JtYWxpemVkRmlsZW5hbWVzICAgID0gZmlsZW5hbWVzLm1hcChmaWxlbmFtZSA9PiBUeXBlU2NyaXB0VGVzdEZpbGVDb21waWxlci5fbm9ybWFsaXplRmlsZW5hbWUoZmlsZW5hbWUpKTtcbiAgICAgICAgY29uc3Qgbm9ybWFsaXplZEZpbGVuYW1lc01hcCA9IHppcE9iamVjdChub3JtYWxpemVkRmlsZW5hbWVzLCBmaWxlbmFtZXMpO1xuXG4gICAgICAgIGNvbnN0IHVuY2FjaGVkRmlsZXMgPSBub3JtYWxpemVkRmlsZW5hbWVzXG4gICAgICAgICAgICAuZmlsdGVyKGZpbGVuYW1lID0+ICF0aGlzLmNhY2hlW2ZpbGVuYW1lXSlcbiAgICAgICAgICAgIC5tYXAoZmlsZW5hbWUgPT4gbm9ybWFsaXplZEZpbGVuYW1lc01hcFtmaWxlbmFtZV0pO1xuXG4gICAgICAgIGNvbnN0IG9wdHMgICAgPSBUeXBlU2NyaXB0VGVzdEZpbGVDb21waWxlci5fZ2V0VHlwZXNjcmlwdE9wdGlvbnMoKTtcbiAgICAgICAgY29uc3QgcHJvZ3JhbSA9IHRzLmNyZWF0ZVByb2dyYW0odW5jYWNoZWRGaWxlcywgb3B0cyk7XG5cbiAgICAgICAgcHJvZ3JhbS5nZXRTb3VyY2VGaWxlcygpLmZvckVhY2goc291cmNlRmlsZSA9PiB7XG4gICAgICAgICAgICBzb3VyY2VGaWxlLnJlbmFtZWREZXBlbmRlbmNpZXMgPSBSRU5BTUVEX0RFUEVOREVOQ0lFU19NQVA7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IGRpYWdub3N0aWNzID0gdHMuZ2V0UHJlRW1pdERpYWdub3N0aWNzKHByb2dyYW0pO1xuXG4gICAgICAgIGlmIChkaWFnbm9zdGljcy5sZW5ndGgpXG4gICAgICAgICAgICBUeXBlU2NyaXB0VGVzdEZpbGVDb21waWxlci5fcmVwb3J0RXJyb3JzKGRpYWdub3N0aWNzKTtcblxuICAgICAgICAvLyBOT1RFOiBUaGUgZmlyc3QgYXJndW1lbnQgb2YgZW1pdCgpIGlzIGEgc291cmNlIGZpbGUgdG8gYmUgY29tcGlsZWQuIElmIGl0J3MgdW5kZWZpbmVkLCBhbGwgZmlsZXMgaW5cbiAgICAgICAgLy8gPHByb2dyYW0+IHdpbGwgYmUgY29tcGlsZWQuIDxwcm9ncmFtPiBjb250YWlucyBhIGZpbGUgc3BlY2lmaWVkIGluIGNyZWF0ZVByb2dyYW0oKSBwbHVzIGFsbCBpdHMgZGVwZW5kZW5jaWVzLlxuICAgICAgICAvLyBUaGlzIG1vZGUgaXMgbXVjaCBmYXN0ZXIgdGhhbiBjb21waWxpbmcgZmlsZXMgb25lLWJ5LW9uZSwgYW5kIGl0IGlzIHVzZWQgaW4gdGhlIHRzYyBDTEkgY29tcGlsZXIuXG4gICAgICAgIHByb2dyYW0uZW1pdCh2b2lkIDAsIChvdXRwdXROYW1lLCByZXN1bHQsIHdyaXRlQk9NLCBvbkVycm9yLCBzb3VyY2VzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzb3VyY2VQYXRoID0gVHlwZVNjcmlwdFRlc3RGaWxlQ29tcGlsZXIuX25vcm1hbGl6ZUZpbGVuYW1lKHNvdXJjZXNbMF0uZmlsZU5hbWUpO1xuXG4gICAgICAgICAgICB0aGlzLmNhY2hlW3NvdXJjZVBhdGhdID0gcmVzdWx0O1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gbm9ybWFsaXplZEZpbGVuYW1lcy5tYXAoZmlsZW5hbWUgPT4gdGhpcy5jYWNoZVtmaWxlbmFtZV0pO1xuICAgIH1cblxuICAgIF9nZXRSZXF1aXJlQ29tcGlsZXJzICgpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICcudHMnOiAoY29kZSwgZmlsZW5hbWUpID0+IHRoaXMuX2NvbXBpbGVDb2RlKGNvZGUsIGZpbGVuYW1lKSxcbiAgICAgICAgICAgICcuanMnOiAoY29kZSwgZmlsZW5hbWUpID0+IEVTTmV4dFRlc3RGaWxlQ29tcGlsZXIucHJvdG90eXBlLl9jb21waWxlQ29kZS5jYWxsKHRoaXMsIGNvZGUsIGZpbGVuYW1lKVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGdldCBjYW5QcmVjb21waWxlICgpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgZ2V0U3VwcG9ydGVkRXh0ZW5zaW9uICgpIHtcbiAgICAgICAgcmV0dXJuICcudHMnO1xuICAgIH1cbn1cbiJdfQ==
