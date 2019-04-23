'use strict';

exports.__esModule = true;

var _loadBabelLibs3 = require('../../../load-babel-libs');

var _loadBabelLibs4 = _interopRequireDefault(_loadBabelLibs3);

var _apiBased = require('../../api-based');

var _apiBased2 = _interopRequireDefault(_apiBased);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const BABEL_RUNTIME_RE = /^babel-runtime(\\|\/|$)/;
const FLOW_MARKER_RE = /^\s*\/\/\s*@flow\s*\n|^\s*\/\*\s*@flow\s*\*\//;

class ESNextTestFileCompiler extends _apiBased2.default {
    static getBabelOptions(filename, code) {
        var _loadBabelLibs = (0, _loadBabelLibs4.default)();

        const presetStage2 = _loadBabelLibs.presetStage2,
              presetFlow = _loadBabelLibs.presetFlow,
              transformRuntime = _loadBabelLibs.transformRuntime,
              transformClassProperties = _loadBabelLibs.transformClassProperties,
              presetEnv = _loadBabelLibs.presetEnv;

        // NOTE: passPrePreset and complex presets is a workaround for https://github.com/babel/babel/issues/2877
        // Fixes https://github.com/DevExpress/testcafe/issues/969

        return {
            passPerPreset: true,
            presets: [{
                passPerPreset: false,
                presets: [{ plugins: [transformRuntime] }, presetStage2, presetEnv]
            }, FLOW_MARKER_RE.test(code) ? {
                passPerPreset: false,
                presets: [{ plugins: [transformClassProperties] }, presetFlow]
            } : {}],
            filename: filename,
            retainLines: true,
            sourceMaps: 'inline',
            ast: false,
            babelrc: false,
            highlightCode: false,

            resolveModuleSource: source => {
                if (source === 'testcafe') return _apiBased2.default.EXPORTABLE_LIB_PATH;

                if (BABEL_RUNTIME_RE.test(source)) {
                    try {
                        return require.resolve(source);
                    } catch (err) {
                        return source;
                    }
                }

                return source;
            }
        };
    }

    _compileCode(code, filename) {
        var _loadBabelLibs2 = (0, _loadBabelLibs4.default)();

        const babel = _loadBabelLibs2.babel;


        if (this.cache[filename]) return this.cache[filename];

        const opts = ESNextTestFileCompiler.getBabelOptions(filename, code);
        const compiled = babel.transform(code, opts);

        this.cache[filename] = compiled.code;

        return compiled.code;
    }

    _getRequireCompilers() {
        return { '.js': (code, filename) => this._compileCode(code, filename) };
    }

    getSupportedExtension() {
        return '.js';
    }
}
exports.default = ESNextTestFileCompiler;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jb21waWxlci90ZXN0LWZpbGUvZm9ybWF0cy9lcy1uZXh0L2NvbXBpbGVyLmpzIl0sIm5hbWVzIjpbIkJBQkVMX1JVTlRJTUVfUkUiLCJGTE9XX01BUktFUl9SRSIsIkVTTmV4dFRlc3RGaWxlQ29tcGlsZXIiLCJnZXRCYWJlbE9wdGlvbnMiLCJmaWxlbmFtZSIsImNvZGUiLCJwcmVzZXRTdGFnZTIiLCJwcmVzZXRGbG93IiwidHJhbnNmb3JtUnVudGltZSIsInRyYW5zZm9ybUNsYXNzUHJvcGVydGllcyIsInByZXNldEVudiIsInBhc3NQZXJQcmVzZXQiLCJwcmVzZXRzIiwicGx1Z2lucyIsInRlc3QiLCJyZXRhaW5MaW5lcyIsInNvdXJjZU1hcHMiLCJhc3QiLCJiYWJlbHJjIiwiaGlnaGxpZ2h0Q29kZSIsInJlc29sdmVNb2R1bGVTb3VyY2UiLCJzb3VyY2UiLCJFWFBPUlRBQkxFX0xJQl9QQVRIIiwicmVxdWlyZSIsInJlc29sdmUiLCJlcnIiLCJfY29tcGlsZUNvZGUiLCJiYWJlbCIsImNhY2hlIiwib3B0cyIsImNvbXBpbGVkIiwidHJhbnNmb3JtIiwiX2dldFJlcXVpcmVDb21waWxlcnMiLCJnZXRTdXBwb3J0ZWRFeHRlbnNpb24iXSwibWFwcGluZ3MiOiI7Ozs7QUFBQTs7OztBQUNBOzs7Ozs7QUFFQSxNQUFNQSxtQkFBbUIseUJBQXpCO0FBQ0EsTUFBTUMsaUJBQW1CLCtDQUF6Qjs7QUFFZSxNQUFNQyxzQkFBTiw0QkFBa0U7QUFDN0UsV0FBT0MsZUFBUCxDQUF3QkMsUUFBeEIsRUFBa0NDLElBQWxDLEVBQXdDO0FBQUEsNkJBQ3dELDhCQUR4RDs7QUFBQSxjQUM1QkMsWUFENEIsa0JBQzVCQSxZQUQ0QjtBQUFBLGNBQ2RDLFVBRGMsa0JBQ2RBLFVBRGM7QUFBQSxjQUNGQyxnQkFERSxrQkFDRkEsZ0JBREU7QUFBQSxjQUNnQkMsd0JBRGhCLGtCQUNnQkEsd0JBRGhCO0FBQUEsY0FDMENDLFNBRDFDLGtCQUMwQ0EsU0FEMUM7O0FBR3BDO0FBQ0E7O0FBQ0EsZUFBTztBQUNIQywyQkFBZSxJQURaO0FBRUhDLHFCQUFlLENBQ1g7QUFDSUQsK0JBQWUsS0FEbkI7QUFFSUMseUJBQWUsQ0FBQyxFQUFFQyxTQUFTLENBQUNMLGdCQUFELENBQVgsRUFBRCxFQUFrQ0YsWUFBbEMsRUFBZ0RJLFNBQWhEO0FBRm5CLGFBRFcsRUFLWFQsZUFBZWEsSUFBZixDQUFvQlQsSUFBcEIsSUFBNEI7QUFDeEJNLCtCQUFlLEtBRFM7QUFFeEJDLHlCQUFlLENBQUMsRUFBRUMsU0FBUyxDQUFDSix3QkFBRCxDQUFYLEVBQUQsRUFBMENGLFVBQTFDO0FBRlMsYUFBNUIsR0FHSSxFQVJPLENBRlo7QUFZSEgsc0JBQWVBLFFBWlo7QUFhSFcseUJBQWUsSUFiWjtBQWNIQyx3QkFBZSxRQWRaO0FBZUhDLGlCQUFlLEtBZlo7QUFnQkhDLHFCQUFlLEtBaEJaO0FBaUJIQywyQkFBZSxLQWpCWjs7QUFtQkhDLGlDQUFxQkMsVUFBVTtBQUMzQixvQkFBSUEsV0FBVyxVQUFmLEVBQ0ksT0FBTyxtQkFBNkJDLG1CQUFwQzs7QUFFSixvQkFBSXRCLGlCQUFpQmMsSUFBakIsQ0FBc0JPLE1BQXRCLENBQUosRUFBbUM7QUFDL0Isd0JBQUk7QUFDQSwrQkFBT0UsUUFBUUMsT0FBUixDQUFnQkgsTUFBaEIsQ0FBUDtBQUNILHFCQUZELENBR0EsT0FBT0ksR0FBUCxFQUFZO0FBQ1IsK0JBQU9KLE1BQVA7QUFDSDtBQUNKOztBQUVELHVCQUFPQSxNQUFQO0FBQ0g7QUFqQ0UsU0FBUDtBQW1DSDs7QUFFREssaUJBQWNyQixJQUFkLEVBQW9CRCxRQUFwQixFQUE4QjtBQUFBLDhCQUNSLDhCQURROztBQUFBLGNBQ2xCdUIsS0FEa0IsbUJBQ2xCQSxLQURrQjs7O0FBRzFCLFlBQUksS0FBS0MsS0FBTCxDQUFXeEIsUUFBWCxDQUFKLEVBQ0ksT0FBTyxLQUFLd0IsS0FBTCxDQUFXeEIsUUFBWCxDQUFQOztBQUVKLGNBQU15QixPQUFXM0IsdUJBQXVCQyxlQUF2QixDQUF1Q0MsUUFBdkMsRUFBaURDLElBQWpELENBQWpCO0FBQ0EsY0FBTXlCLFdBQVdILE1BQU1JLFNBQU4sQ0FBZ0IxQixJQUFoQixFQUFzQndCLElBQXRCLENBQWpCOztBQUVBLGFBQUtELEtBQUwsQ0FBV3hCLFFBQVgsSUFBdUIwQixTQUFTekIsSUFBaEM7O0FBRUEsZUFBT3lCLFNBQVN6QixJQUFoQjtBQUNIOztBQUVEMkIsMkJBQXdCO0FBQ3BCLGVBQU8sRUFBRSxPQUFPLENBQUMzQixJQUFELEVBQU9ELFFBQVAsS0FBb0IsS0FBS3NCLFlBQUwsQ0FBa0JyQixJQUFsQixFQUF3QkQsUUFBeEIsQ0FBN0IsRUFBUDtBQUNIOztBQUVENkIsNEJBQXlCO0FBQ3JCLGVBQU8sS0FBUDtBQUNIO0FBL0Q0RTtrQkFBNUQvQixzQiIsImZpbGUiOiJjb21waWxlci90ZXN0LWZpbGUvZm9ybWF0cy9lcy1uZXh0L2NvbXBpbGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGxvYWRCYWJlbExpYnMgZnJvbSAnLi4vLi4vLi4vbG9hZC1iYWJlbC1saWJzJztcbmltcG9ydCBBUElCYXNlZFRlc3RGaWxlQ29tcGlsZXJCYXNlIGZyb20gJy4uLy4uL2FwaS1iYXNlZCc7XG5cbmNvbnN0IEJBQkVMX1JVTlRJTUVfUkUgPSAvXmJhYmVsLXJ1bnRpbWUoXFxcXHxcXC98JCkvO1xuY29uc3QgRkxPV19NQVJLRVJfUkUgICA9IC9eXFxzKlxcL1xcL1xccypAZmxvd1xccypcXG58XlxccypcXC9cXCpcXHMqQGZsb3dcXHMqXFwqXFwvLztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRVNOZXh0VGVzdEZpbGVDb21waWxlciBleHRlbmRzIEFQSUJhc2VkVGVzdEZpbGVDb21waWxlckJhc2Uge1xuICAgIHN0YXRpYyBnZXRCYWJlbE9wdGlvbnMgKGZpbGVuYW1lLCBjb2RlKSB7XG4gICAgICAgIGNvbnN0IHsgcHJlc2V0U3RhZ2UyLCBwcmVzZXRGbG93LCB0cmFuc2Zvcm1SdW50aW1lLCB0cmFuc2Zvcm1DbGFzc1Byb3BlcnRpZXMsIHByZXNldEVudiB9ID0gbG9hZEJhYmVsTGlicygpO1xuXG4gICAgICAgIC8vIE5PVEU6IHBhc3NQcmVQcmVzZXQgYW5kIGNvbXBsZXggcHJlc2V0cyBpcyBhIHdvcmthcm91bmQgZm9yIGh0dHBzOi8vZ2l0aHViLmNvbS9iYWJlbC9iYWJlbC9pc3N1ZXMvMjg3N1xuICAgICAgICAvLyBGaXhlcyBodHRwczovL2dpdGh1Yi5jb20vRGV2RXhwcmVzcy90ZXN0Y2FmZS9pc3N1ZXMvOTY5XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBwYXNzUGVyUHJlc2V0OiB0cnVlLFxuICAgICAgICAgICAgcHJlc2V0czogICAgICAgW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgcGFzc1BlclByZXNldDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIHByZXNldHM6ICAgICAgIFt7IHBsdWdpbnM6IFt0cmFuc2Zvcm1SdW50aW1lXSB9LCBwcmVzZXRTdGFnZTIsIHByZXNldEVudl1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIEZMT1dfTUFSS0VSX1JFLnRlc3QoY29kZSkgPyB7XG4gICAgICAgICAgICAgICAgICAgIHBhc3NQZXJQcmVzZXQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBwcmVzZXRzOiAgICAgICBbeyBwbHVnaW5zOiBbdHJhbnNmb3JtQ2xhc3NQcm9wZXJ0aWVzXSB9LCBwcmVzZXRGbG93XVxuICAgICAgICAgICAgICAgIH0gOiB7fVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGZpbGVuYW1lOiAgICAgIGZpbGVuYW1lLFxuICAgICAgICAgICAgcmV0YWluTGluZXM6ICAgdHJ1ZSxcbiAgICAgICAgICAgIHNvdXJjZU1hcHM6ICAgICdpbmxpbmUnLFxuICAgICAgICAgICAgYXN0OiAgICAgICAgICAgZmFsc2UsXG4gICAgICAgICAgICBiYWJlbHJjOiAgICAgICBmYWxzZSxcbiAgICAgICAgICAgIGhpZ2hsaWdodENvZGU6IGZhbHNlLFxuXG4gICAgICAgICAgICByZXNvbHZlTW9kdWxlU291cmNlOiBzb3VyY2UgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChzb3VyY2UgPT09ICd0ZXN0Y2FmZScpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBBUElCYXNlZFRlc3RGaWxlQ29tcGlsZXJCYXNlLkVYUE9SVEFCTEVfTElCX1BBVEg7XG5cbiAgICAgICAgICAgICAgICBpZiAoQkFCRUxfUlVOVElNRV9SRS50ZXN0KHNvdXJjZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByZXF1aXJlLnJlc29sdmUoc291cmNlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc291cmNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNvdXJjZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBfY29tcGlsZUNvZGUgKGNvZGUsIGZpbGVuYW1lKSB7XG4gICAgICAgIGNvbnN0IHsgYmFiZWwgfSA9IGxvYWRCYWJlbExpYnMoKTtcblxuICAgICAgICBpZiAodGhpcy5jYWNoZVtmaWxlbmFtZV0pXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jYWNoZVtmaWxlbmFtZV07XG5cbiAgICAgICAgY29uc3Qgb3B0cyAgICAgPSBFU05leHRUZXN0RmlsZUNvbXBpbGVyLmdldEJhYmVsT3B0aW9ucyhmaWxlbmFtZSwgY29kZSk7XG4gICAgICAgIGNvbnN0IGNvbXBpbGVkID0gYmFiZWwudHJhbnNmb3JtKGNvZGUsIG9wdHMpO1xuXG4gICAgICAgIHRoaXMuY2FjaGVbZmlsZW5hbWVdID0gY29tcGlsZWQuY29kZTtcblxuICAgICAgICByZXR1cm4gY29tcGlsZWQuY29kZTtcbiAgICB9XG5cbiAgICBfZ2V0UmVxdWlyZUNvbXBpbGVycyAoKSB7XG4gICAgICAgIHJldHVybiB7ICcuanMnOiAoY29kZSwgZmlsZW5hbWUpID0+IHRoaXMuX2NvbXBpbGVDb2RlKGNvZGUsIGZpbGVuYW1lKSB9O1xuICAgIH1cblxuICAgIGdldFN1cHBvcnRlZEV4dGVuc2lvbiAoKSB7XG4gICAgICAgIHJldHVybiAnLmpzJztcbiAgICB9XG59XG4iXX0=
