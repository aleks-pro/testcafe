'use strict';

exports.__esModule = true;

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _lodash = require('lodash');

var _dedent = require('dedent');

var _dedent2 = _interopRequireDefault(_dedent);

var _clientFunctionBuilder = require('../client-function-builder');

var _clientFunctionBuilder2 = _interopRequireDefault(_clientFunctionBuilder);

var _replicator = require('../replicator');

var _runtime = require('../../errors/runtime');

var _builderSymbol = require('../builder-symbol');

var _builderSymbol2 = _interopRequireDefault(_builderSymbol);

var _types = require('../../errors/types');

var _typeAssertions = require('../../errors/runtime/type-assertions');

var _observation = require('../../test-run/commands/observation');

var _defineLazyProperty = require('../../utils/define-lazy-property');

var _defineLazyProperty2 = _interopRequireDefault(_defineLazyProperty);

var _addApi = require('./add-api');

var _createSnapshotMethods = require('./create-snapshot-methods');

var _createSnapshotMethods2 = _interopRequireDefault(_createSnapshotMethods);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class SelectorBuilder extends _clientFunctionBuilder2.default {
    constructor(fn, options, callsiteNames) {
        const apiFn = options && options.apiFn;
        const builderFromSelector = fn && fn[_builderSymbol2.default];
        const builderFromPromiseOrSnapshot = fn && fn.selector && fn.selector[_builderSymbol2.default];
        let builder = builderFromSelector || builderFromPromiseOrSnapshot;

        builder = builder instanceof SelectorBuilder ? builder : null;

        if (builder) {
            fn = builder.fn;

            if (options === void 0 || typeof options === 'object') options = (0, _lodash.merge)({}, builder.options, options, { sourceSelectorBuilder: builder });
        }

        super(fn, options, callsiteNames);

        if (!this.options.apiFnChain) {
            const fnType = typeof this.fn;
            let item = fnType === 'string' ? `'${this.fn}'` : `[${fnType}]`;

            item = `Selector(${item})`;
            this.options.apiFn = item;
            this.options.apiFnChain = [item];
        }

        if (apiFn) this.options.apiFnChain.push(apiFn);

        this.options.apiFnID = this.options.apiFnChain.length - 1;
    }

    _getCompiledFnCode() {
        // OPTIMIZATION: if selector was produced from another selector and
        // it has same dependencies as source selector, then we can
        // avoid recompilation and just re-use already compiled code.
        const hasSameDependenciesAsSourceSelector = this.options.sourceSelectorBuilder && this.options.sourceSelectorBuilder.options.dependencies === this.options.dependencies;

        if (hasSameDependenciesAsSourceSelector) return this.options.sourceSelectorBuilder.compiledFnCode;

        const code = typeof this.fn === 'string' ? `(function(){return document.querySelectorAll(${(0, _stringify2.default)(this.fn)});});` : super._getCompiledFnCode();

        if (code) {
            return (0, _dedent2.default)(`(function(){
                    var __f$=${code};
                    return function(){
                        var args           = __dependencies$.boundArgs || arguments;
                        var selectorFilter = window['%testCafeSelectorFilter%'];
                        
                        var nodes = __f$.apply(this, args);
                        nodes     = selectorFilter.cast(nodes);
                        
                        if (!nodes.length && !selectorFilter.error)
                            selectorFilter.error = __dependencies$.apiInfo.apiFnID;

                        return selectorFilter.filter(nodes, __dependencies$.filterOptions, __dependencies$.apiInfo);
                    };
                 })();`);
        }

        return null;
    }

    _createInvalidFnTypeError() {
        return new _runtime.ClientFunctionAPIError(this.callsiteNames.instantiation, this.callsiteNames.instantiation, _types.RUNTIME_ERRORS.selectorInitializedWithWrongType, typeof this.fn);
    }

    _executeCommand(args, testRun, callsite) {
        const resultPromise = super._executeCommand(args, testRun, callsite);

        this._addBoundArgsSelectorGetter(resultPromise, args);

        // OPTIMIZATION: use buffer function as selector not to trigger lazy property ahead of time
        (0, _addApi.addAPI)(resultPromise, () => resultPromise.selector, SelectorBuilder, this.options.customDOMProperties, this.options.customMethods);

        return resultPromise;
    }

    _getSourceSelectorBuilderApiFnID() {
        let selectorAncestor = this;

        while (selectorAncestor.options.sourceSelectorBuilder) selectorAncestor = selectorAncestor.options.sourceSelectorBuilder;

        return selectorAncestor.options.apiFnID;
    }

    getFunctionDependencies() {
        const dependencies = super.getFunctionDependencies();

        var _options = this.options;
        const filterVisible = _options.filterVisible,
              filterHidden = _options.filterHidden,
              counterMode = _options.counterMode,
              collectionMode = _options.collectionMode,
              index = _options.index,
              customDOMProperties = _options.customDOMProperties,
              customMethods = _options.customMethods,
              apiFnChain = _options.apiFnChain,
              boundArgs = _options.boundArgs;


        return (0, _lodash.merge)({}, dependencies, {
            filterOptions: {
                filterVisible,
                filterHidden,
                counterMode,
                collectionMode,
                index: (0, _lodash.isNil)(index) ? null : index
            },
            apiInfo: {
                apiFnChain,
                apiFnID: this._getSourceSelectorBuilderApiFnID()
            },
            boundArgs,
            customDOMProperties,
            customMethods
        });
    }

    _createTestRunCommand(encodedArgs, encodedDependencies) {
        return new _observation.ExecuteSelectorCommand({
            instantiationCallsiteName: this.callsiteNames.instantiation,
            fnCode: this.compiledFnCode,
            args: encodedArgs,
            dependencies: encodedDependencies,
            needError: this.options.needError,
            apiFnChain: this.options.apiFnChain,
            visibilityCheck: !!this.options.visibilityCheck,
            timeout: this.options.timeout
        });
    }

    _validateOptions(options) {
        super._validateOptions(options);

        if (!(0, _lodash.isNil)(options.visibilityCheck)) (0, _typeAssertions.assertType)(_typeAssertions.is.boolean, this.callsiteNames.instantiation, '"visibilityCheck" option', options.visibilityCheck);

        if (!(0, _lodash.isNil)(options.timeout)) (0, _typeAssertions.assertType)(_typeAssertions.is.nonNegativeNumber, this.callsiteNames.instantiation, '"timeout" option', options.timeout);
    }

    _getReplicatorTransforms() {
        const transforms = super._getReplicatorTransforms();

        transforms.push(new _replicator.SelectorNodeTransform());

        return transforms;
    }

    _addBoundArgsSelectorGetter(obj, selectorArgs) {
        (0, _defineLazyProperty2.default)(obj, 'selector', () => {
            const builder = new SelectorBuilder(this.getFunction(), { boundArgs: selectorArgs });

            return builder.getFunction();
        });
    }

    _decorateFunction(selectorFn) {
        super._decorateFunction(selectorFn);

        (0, _addApi.addAPI)(selectorFn, () => selectorFn, SelectorBuilder, this.options.customDOMProperties, this.options.customMethods);
    }

    _processResult(result, selectorArgs) {
        const snapshot = super._processResult(result, selectorArgs);

        if (snapshot && !this.options.counterMode) {
            this._addBoundArgsSelectorGetter(snapshot, selectorArgs);
            (0, _createSnapshotMethods2.default)(snapshot);

            if (this.options.customMethods) (0, _addApi.addCustomMethods)(snapshot, () => snapshot.selector, SelectorBuilder, this.options.customMethods);
        }

        return snapshot;
    }
}
exports.default = SelectorBuilder;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jbGllbnQtZnVuY3Rpb25zL3NlbGVjdG9ycy9zZWxlY3Rvci1idWlsZGVyLmpzIl0sIm5hbWVzIjpbIlNlbGVjdG9yQnVpbGRlciIsImNvbnN0cnVjdG9yIiwiZm4iLCJvcHRpb25zIiwiY2FsbHNpdGVOYW1lcyIsImFwaUZuIiwiYnVpbGRlckZyb21TZWxlY3RvciIsImJ1aWxkZXJGcm9tUHJvbWlzZU9yU25hcHNob3QiLCJzZWxlY3RvciIsImJ1aWxkZXIiLCJzb3VyY2VTZWxlY3RvckJ1aWxkZXIiLCJhcGlGbkNoYWluIiwiZm5UeXBlIiwiaXRlbSIsInB1c2giLCJhcGlGbklEIiwibGVuZ3RoIiwiX2dldENvbXBpbGVkRm5Db2RlIiwiaGFzU2FtZURlcGVuZGVuY2llc0FzU291cmNlU2VsZWN0b3IiLCJkZXBlbmRlbmNpZXMiLCJjb21waWxlZEZuQ29kZSIsImNvZGUiLCJfY3JlYXRlSW52YWxpZEZuVHlwZUVycm9yIiwiaW5zdGFudGlhdGlvbiIsInNlbGVjdG9ySW5pdGlhbGl6ZWRXaXRoV3JvbmdUeXBlIiwiX2V4ZWN1dGVDb21tYW5kIiwiYXJncyIsInRlc3RSdW4iLCJjYWxsc2l0ZSIsInJlc3VsdFByb21pc2UiLCJfYWRkQm91bmRBcmdzU2VsZWN0b3JHZXR0ZXIiLCJjdXN0b21ET01Qcm9wZXJ0aWVzIiwiY3VzdG9tTWV0aG9kcyIsIl9nZXRTb3VyY2VTZWxlY3RvckJ1aWxkZXJBcGlGbklEIiwic2VsZWN0b3JBbmNlc3RvciIsImdldEZ1bmN0aW9uRGVwZW5kZW5jaWVzIiwiZmlsdGVyVmlzaWJsZSIsImZpbHRlckhpZGRlbiIsImNvdW50ZXJNb2RlIiwiY29sbGVjdGlvbk1vZGUiLCJpbmRleCIsImJvdW5kQXJncyIsImZpbHRlck9wdGlvbnMiLCJhcGlJbmZvIiwiX2NyZWF0ZVRlc3RSdW5Db21tYW5kIiwiZW5jb2RlZEFyZ3MiLCJlbmNvZGVkRGVwZW5kZW5jaWVzIiwiaW5zdGFudGlhdGlvbkNhbGxzaXRlTmFtZSIsImZuQ29kZSIsIm5lZWRFcnJvciIsInZpc2liaWxpdHlDaGVjayIsInRpbWVvdXQiLCJfdmFsaWRhdGVPcHRpb25zIiwiYm9vbGVhbiIsIm5vbk5lZ2F0aXZlTnVtYmVyIiwiX2dldFJlcGxpY2F0b3JUcmFuc2Zvcm1zIiwidHJhbnNmb3JtcyIsIm9iaiIsInNlbGVjdG9yQXJncyIsImdldEZ1bmN0aW9uIiwiX2RlY29yYXRlRnVuY3Rpb24iLCJzZWxlY3RvckZuIiwiX3Byb2Nlc3NSZXN1bHQiLCJyZXN1bHQiLCJzbmFwc2hvdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQTs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7OztBQUNBOztBQUNBOzs7Ozs7QUFFZSxNQUFNQSxlQUFOLHlDQUFvRDtBQUMvREMsZ0JBQWFDLEVBQWIsRUFBaUJDLE9BQWpCLEVBQTBCQyxhQUExQixFQUF5QztBQUNyQyxjQUFNQyxRQUErQkYsV0FBV0EsUUFBUUUsS0FBeEQ7QUFDQSxjQUFNQyxzQkFBK0JKLE1BQU1BLDJCQUEzQztBQUNBLGNBQU1LLCtCQUErQkwsTUFBTUEsR0FBR00sUUFBVCxJQUFxQk4sR0FBR00sUUFBSCx5QkFBMUQ7QUFDQSxZQUFJQyxVQUFpQ0gsdUJBQXVCQyw0QkFBNUQ7O0FBRUFFLGtCQUFVQSxtQkFBbUJULGVBQW5CLEdBQXFDUyxPQUFyQyxHQUErQyxJQUF6RDs7QUFFQSxZQUFJQSxPQUFKLEVBQWE7QUFDVFAsaUJBQUtPLFFBQVFQLEVBQWI7O0FBRUEsZ0JBQUlDLFlBQVksS0FBSyxDQUFqQixJQUFzQixPQUFPQSxPQUFQLEtBQW1CLFFBQTdDLEVBQ0lBLFVBQVUsbUJBQU0sRUFBTixFQUFVTSxRQUFRTixPQUFsQixFQUEyQkEsT0FBM0IsRUFBb0MsRUFBRU8sdUJBQXVCRCxPQUF6QixFQUFwQyxDQUFWO0FBQ1A7O0FBRUQsY0FBTVAsRUFBTixFQUFVQyxPQUFWLEVBQW1CQyxhQUFuQjs7QUFFQSxZQUFJLENBQUMsS0FB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QVN4RCxRQUExQyxFQUFvRFIsZUFBcEQsRUFBcUUsS0FBS0csT0FBTCxDQUFhNkIsYUFBbEY7QUFDUDs7QUFFRCxlQUFPZ0MsUUFBUDtBQUNIO0FBekw4RDtrQkFBOUNoRSxlIiwiZmlsZSI6ImNsaWVudC1mdW5jdGlvbnMvc2VsZWN0b3JzL3NlbGVjdG9yLWJ1aWxkZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBpc05pbCBhcyBpc051bGxPclVuZGVmaW5lZCwgbWVyZ2UgfSBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IGRlZGVudCBmcm9tICdkZWRlbnQnO1xuaW1wb3J0IENsaWVudEZ1bmN0aW9uQnVpbGRlciBmcm9tICcuLi9jbGllbnQtZnVuY3Rpb24tYnVpbGRlcic7XG5pbXBvcnQgeyBTZWxlY3Rvck5vZGVUcmFuc2Zvcm0gfSBmcm9tICcuLi9yZXBsaWNhdG9yJztcbmltcG9ydCB7IENsaWVudEZ1bmN0aW9uQVBJRXJyb3IgfSBmcm9tICcuLi8uLi9lcnJvcnMvcnVudGltZSc7XG5pbXBvcnQgZnVuY3Rpb25CdWlsZGVyU3ltYm9sIGZyb20gJy4uL2J1aWxkZXItc3ltYm9sJztcbmltcG9ydCB7IFJVTlRJTUVfRVJST1JTIH0gZnJvbSAnLi4vLi4vZXJyb3JzL3R5cGVzJztcbmltcG9ydCB7IGFzc2VydFR5cGUsIGlzIH0gZnJvbSAnLi4vLi4vZXJyb3JzL3J1bnRpbWUvdHlwZS1hc3NlcnRpb25zJztcbmltcG9ydCB7IEV4ZWN1dGVTZWxlY3RvckNvbW1hbmQgfSBmcm9tICcuLi8uLi90ZXN0LXJ1bi9jb21tYW5kcy9vYnNlcnZhdGlvbic7XG5pbXBvcnQgZGVmaW5lTGF6eVByb3BlcnR5IGZyb20gJy4uLy4uL3V0aWxzL2RlZmluZS1sYXp5LXByb3BlcnR5JztcbmltcG9ydCB7IGFkZEFQSSwgYWRkQ3VzdG9tTWV0aG9kcyB9IGZyb20gJy4vYWRkLWFwaSc7XG5pbXBvcnQgY3JlYXRlU25hcHNob3RNZXRob2RzIGZyb20gJy4vY3JlYXRlLXNuYXBzaG90LW1ldGhvZHMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTZWxlY3RvckJ1aWxkZXIgZXh0ZW5kcyBDbGllbnRGdW5jdGlvbkJ1aWxkZXIge1xuICAgIGNvbnN0cnVjdG9yIChmbiwgb3B0aW9ucywgY2FsbHNpdGVOYW1lcykge1xuICAgICAgICBjb25zdCBhcGlGbiAgICAgICAgICAgICAgICAgICAgICAgID0gb3B0aW9ucyAmJiBvcHRpb25zLmFwaUZuO1xuICAgICAgICBjb25zdCBidWlsZGVyRnJvbVNlbGVjdG9yICAgICAgICAgID0gZm4gJiYgZm5bZnVuY3Rpb25CdWlsZGVyU3ltYm9sXTtcbiAgICAgICAgY29uc3QgYnVpbGRlckZyb21Qcm9taXNlT3JTbmFwc2hvdCA9IGZuICYmIGZuLnNlbGVjdG9yICYmIGZuLnNlbGVjdG9yW2Z1bmN0aW9uQnVpbGRlclN5bWJvbF07XG4gICAgICAgIGxldCBidWlsZGVyICAgICAgICAgICAgICAgICAgICAgICAgPSBidWlsZGVyRnJvbVNlbGVjdG9yIHx8IGJ1aWxkZXJGcm9tUHJvbWlzZU9yU25hcHNob3Q7XG5cbiAgICAgICAgYnVpbGRlciA9IGJ1aWxkZXIgaW5zdGFuY2VvZiBTZWxlY3RvckJ1aWxkZXIgPyBidWlsZGVyIDogbnVsbDtcblxuICAgICAgICBpZiAoYnVpbGRlcikge1xuICAgICAgICAgICAgZm4gPSBidWlsZGVyLmZuO1xuXG4gICAgICAgICAgICBpZiAob3B0aW9ucyA9PT0gdm9pZCAwIHx8IHR5cGVvZiBvcHRpb25zID09PSAnb2JqZWN0JylcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gbWVyZ2Uoe30sIGJ1aWxkZXIub3B0aW9ucywgb3B0aW9ucywgeyBzb3VyY2VTZWxlY3RvckJ1aWxkZXI6IGJ1aWxkZXIgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBzdXBlcihmbiwgb3B0aW9ucywgY2FsbHNpdGVOYW1lcyk7XG5cbiAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuYXBpRm5DaGFpbikge1xuICAgICAgICAgICAgY29uc3QgZm5UeXBlID0gdHlwZW9mIHRoaXMuZm47XG4gICAgICAgICAgICBsZXQgaXRlbSAgICAgPSBmblR5cGUgPT09ICdzdHJpbmcnID8gYCcke3RoaXMuZm59J2AgOiBgWyR7Zm5UeXBlfV1gO1xuXG4gICAgICAgICAgICBpdGVtICAgICAgICAgICAgICAgICAgICA9IGBTZWxlY3Rvcigke2l0ZW19KWA7XG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMuYXBpRm4gICAgICA9IGl0ZW07XG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMuYXBpRm5DaGFpbiA9IFtpdGVtXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChhcGlGbilcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5hcGlGbkNoYWluLnB1c2goYXBpRm4pO1xuXG4gICAgICAgIHRoaXMub3B0aW9ucy5hcGlGbklEID0gdGhpcy5vcHRpb25zLmFwaUZuQ2hhaW4ubGVuZ3RoIC0gMTtcbiAgICB9XG5cbiAgICBfZ2V0Q29tcGlsZWRGbkNvZGUgKCkge1xuICAgICAgICAvLyBPUFRJTUlaQVRJT046IGlmIHNlbGVjdG9yIHdhcyBwcm9kdWNlZCBmcm9tIGFub3RoZXIgc2VsZWN0b3IgYW5kXG4gICAgICAgIC8vIGl0IGhhcyBzYW1lIGRlcGVuZGVuY2llcyBhcyBzb3VyY2Ugc2VsZWN0b3IsIHRoZW4gd2UgY2FuXG4gICAgICAgIC8vIGF2b2lkIHJlY29tcGlsYXRpb24gYW5kIGp1c3QgcmUtdXNlIGFscmVhZHkgY29tcGlsZWQgY29kZS5cbiAgICAgICAgY29uc3QgaGFzU2FtZURlcGVuZGVuY2llc0FzU291cmNlU2VsZWN0b3IgPSB0aGlzLm9wdGlvbnMuc291cmNlU2VsZWN0b3JCdWlsZGVyICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zLnNvdXJjZVNlbGVjdG9yQnVpbGRlci5vcHRpb25zLmRlcGVuZGVuY2llcyA9PT1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMuZGVwZW5kZW5jaWVzO1xuXG4gICAgICAgIGlmIChoYXNTYW1lRGVwZW5kZW5jaWVzQXNTb3VyY2VTZWxlY3RvcilcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnMuc291cmNlU2VsZWN0b3JCdWlsZGVyLmNvbXBpbGVkRm5Db2RlO1xuXG4gICAgICAgIGNvbnN0IGNvZGUgPSB0eXBlb2YgdGhpcy5mbiA9PT0gJ3N0cmluZycgP1xuICAgICAgICAgICAgYChmdW5jdGlvbigpe3JldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCR7SlNPTi5zdHJpbmdpZnkodGhpcy5mbil9KTt9KTtgIDpcbiAgICAgICAgICAgIHN1cGVyLl9nZXRDb21waWxlZEZuQ29kZSgpO1xuXG4gICAgICAgIGlmIChjb2RlKSB7XG4gICAgICAgICAgICByZXR1cm4gZGVkZW50KFxuICAgICAgICAgICAgICAgIGAoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgdmFyIF9fZiQ9JHtjb2RlfTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgYXJncyAgICAgICAgICAgPSBfX2RlcGVuZGVuY2llcyQuYm91bmRBcmdzIHx8IGFyZ3VtZW50cztcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzZWxlY3RvckZpbHRlciA9IHdpbmRvd1snJXRlc3RDYWZlU2VsZWN0b3JGaWx0ZXIlJ107XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBub2RlcyA9IF9fZiQuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlcyAgICAgPSBzZWxlY3RvckZpbHRlci5jYXN0KG5vZGVzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFub2Rlcy5sZW5ndGggJiYgIXNlbGVjdG9yRmlsdGVyLmVycm9yKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdG9yRmlsdGVyLmVycm9yID0gX19kZXBlbmRlbmNpZXMkLmFwaUluZm8uYXBpRm5JRDtcblxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNlbGVjdG9yRmlsdGVyLmZpbHRlcihub2RlcywgX19kZXBlbmRlbmNpZXMkLmZpbHRlck9wdGlvbnMsIF9fZGVwZW5kZW5jaWVzJC5hcGlJbmZvKTtcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgfSkoKTtgXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUludmFsaWRGblR5cGVFcnJvciAoKSB7XG4gICAgICAgIHJldHVybiBuZXcgQ2xpZW50RnVuY3Rpb25BUElFcnJvcih0aGlzLmNhbGxzaXRlTmFtZXMuaW5zdGFudGlhdGlvbiwgdGhpcy5jYWxsc2l0ZU5hbWVzLmluc3RhbnRpYXRpb24sIFJVTlRJTUVfRVJST1JTLnNlbGVjdG9ySW5pdGlhbGl6ZWRXaXRoV3JvbmdUeXBlLCB0eXBlb2YgdGhpcy5mbik7XG4gICAgfVxuXG4gICAgX2V4ZWN1dGVDb21tYW5kIChhcmdzLCB0ZXN0UnVuLCBjYWxsc2l0ZSkge1xuICAgICAgICBjb25zdCByZXN1bHRQcm9taXNlID0gc3VwZXIuX2V4ZWN1dGVDb21tYW5kKGFyZ3MsIHRlc3RSdW4sIGNhbGxzaXRlKTtcblxuICAgICAgICB0aGlzLl9hZGRCb3VuZEFyZ3NTZWxlY3RvckdldHRlcihyZXN1bHRQcm9taXNlLCBhcmdzKTtcblxuICAgICAgICAvLyBPUFRJTUlaQVRJT046IHVzZSBidWZmZXIgZnVuY3Rpb24gYXMgc2VsZWN0b3Igbm90IHRvIHRyaWdnZXIgbGF6eSBwcm9wZXJ0eSBhaGVhZCBvZiB0aW1lXG4gICAgICAgIGFkZEFQSShyZXN1bHRQcm9taXNlLCAoKSA9PiByZXN1bHRQcm9taXNlLnNlbGVjdG9yLCBTZWxlY3RvckJ1aWxkZXIsIHRoaXMub3B0aW9ucy5jdXN0b21ET01Qcm9wZXJ0aWVzLCB0aGlzLm9wdGlvbnMuY3VzdG9tTWV0aG9kcyk7XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdFByb21pc2U7XG4gICAgfVxuXG4gICAgX2dldFNvdXJjZVNlbGVjdG9yQnVpbGRlckFwaUZuSUQgKCkge1xuICAgICAgICBsZXQgc2VsZWN0b3JBbmNlc3RvciA9IHRoaXM7XG5cbiAgICAgICAgd2hpbGUgKHNlbGVjdG9yQW5jZXN0b3Iub3B0aW9ucy5zb3VyY2VTZWxlY3RvckJ1aWxkZXIpXG4gICAgICAgICAgICBzZWxlY3RvckFuY2VzdG9yID0gc2VsZWN0b3JBbmNlc3Rvci5vcHRpb25zLnNvdXJjZVNlbGVjdG9yQnVpbGRlcjtcblxuICAgICAgICByZXR1cm4gc2VsZWN0b3JBbmNlc3Rvci5vcHRpb25zLmFwaUZuSUQ7XG4gICAgfVxuXG4gICAgZ2V0RnVuY3Rpb25EZXBlbmRlbmNpZXMgKCkge1xuICAgICAgICBjb25zdCBkZXBlbmRlbmNpZXMgPSBzdXBlci5nZXRGdW5jdGlvbkRlcGVuZGVuY2llcygpO1xuXG4gICAgICAgIGNvbnN0IHtcbiAgICAgICAgICAgIGZpbHRlclZpc2libGUsXG4gICAgICAgICAgICBmaWx0ZXJIaWRkZW4sXG4gICAgICAgICAgICBjb3VudGVyTW9kZSxcbiAgICAgICAgICAgIGNvbGxlY3Rpb25Nb2RlLFxuICAgICAgICAgICAgaW5kZXgsXG4gICAgICAgICAgICBjdXN0b21ET01Qcm9wZXJ0aWVzLFxuICAgICAgICAgICAgY3VzdG9tTWV0aG9kcyxcbiAgICAgICAgICAgIGFwaUZuQ2hhaW4sXG4gICAgICAgICAgICBib3VuZEFyZ3NcbiAgICAgICAgfSA9IHRoaXMub3B0aW9ucztcblxuICAgICAgICByZXR1cm4gbWVyZ2Uoe30sIGRlcGVuZGVuY2llcywge1xuICAgICAgICAgICAgZmlsdGVyT3B0aW9uczoge1xuICAgICAgICAgICAgICAgIGZpbHRlclZpc2libGUsXG4gICAgICAgICAgICAgICAgZmlsdGVySGlkZGVuLFxuICAgICAgICAgICAgICAgIGNvdW50ZXJNb2RlLFxuICAgICAgICAgICAgICAgIGNvbGxlY3Rpb25Nb2RlLFxuICAgICAgICAgICAgICAgIGluZGV4OiBpc051bGxPclVuZGVmaW5lZChpbmRleCkgPyBudWxsIDogaW5kZXhcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBhcGlJbmZvOiB7XG4gICAgICAgICAgICAgICAgYXBpRm5DaGFpbixcbiAgICAgICAgICAgICAgICBhcGlGbklEOiB0aGlzLl9nZXRTb3VyY2VTZWxlY3RvckJ1aWxkZXJBcGlGbklEKClcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBib3VuZEFyZ3MsXG4gICAgICAgICAgICBjdXN0b21ET01Qcm9wZXJ0aWVzLFxuICAgICAgICAgICAgY3VzdG9tTWV0aG9kc1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBfY3JlYXRlVGVzdFJ1bkNvbW1hbmQgKGVuY29kZWRBcmdzLCBlbmNvZGVkRGVwZW5kZW5jaWVzKSB7XG4gICAgICAgIHJldHVybiBuZXcgRXhlY3V0ZVNlbGVjdG9yQ29tbWFuZCh7XG4gICAgICAgICAgICBpbnN0YW50aWF0aW9uQ2FsbHNpdGVOYW1lOiB0aGlzLmNhbGxzaXRlTmFtZXMuaW5zdGFudGlhdGlvbixcbiAgICAgICAgICAgIGZuQ29kZTogICAgICAgICAgICAgICAgICAgIHRoaXMuY29tcGlsZWRGbkNvZGUsXG4gICAgICAgICAgICBhcmdzOiAgICAgICAgICAgICAgICAgICAgICBlbmNvZGVkQXJncyxcbiAgICAgICAgICAgIGRlcGVuZGVuY2llczogICAgICAgICAgICAgIGVuY29kZWREZXBlbmRlbmNpZXMsXG4gICAgICAgICAgICBuZWVkRXJyb3I6ICAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMubmVlZEVycm9yLFxuICAgICAgICAgICAgYXBpRm5DaGFpbjogICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zLmFwaUZuQ2hhaW4sXG4gICAgICAgICAgICB2aXNpYmlsaXR5Q2hlY2s6ICAgICAgICAgICAhIXRoaXMub3B0aW9ucy52aXNpYmlsaXR5Q2hlY2ssXG4gICAgICAgICAgICB0aW1lb3V0OiAgICAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMudGltZW91dFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBfdmFsaWRhdGVPcHRpb25zIChvcHRpb25zKSB7XG4gICAgICAgIHN1cGVyLl92YWxpZGF0ZU9wdGlvbnMob3B0aW9ucyk7XG5cbiAgICAgICAgaWYgKCFpc051bGxPclVuZGVmaW5lZChvcHRpb25zLnZpc2liaWxpdHlDaGVjaykpXG4gICAgICAgICAgICBhc3NlcnRUeXBlKGlzLmJvb2xlYW4sIHRoaXMuY2FsbHNpdGVOYW1lcy5pbnN0YW50aWF0aW9uLCAnXCJ2aXNpYmlsaXR5Q2hlY2tcIiBvcHRpb24nLCBvcHRpb25zLnZpc2liaWxpdHlDaGVjayk7XG5cbiAgICAgICAgaWYgKCFpc051bGxPclVuZGVmaW5lZChvcHRpb25zLnRpbWVvdXQpKVxuICAgICAgICAgICAgYXNzZXJ0VHlwZShpcy5ub25OZWdhdGl2ZU51bWJlciwgdGhpcy5jYWxsc2l0ZU5hbWVzLmluc3RhbnRpYXRpb24sICdcInRpbWVvdXRcIiBvcHRpb24nLCBvcHRpb25zLnRpbWVvdXQpO1xuICAgIH1cblxuICAgIF9nZXRSZXBsaWNhdG9yVHJhbnNmb3JtcyAoKSB7XG4gICAgICAgIGNvbnN0IHRyYW5zZm9ybXMgPSBzdXBlci5fZ2V0UmVwbGljYXRvclRyYW5zZm9ybXMoKTtcblxuICAgICAgICB0cmFuc2Zvcm1zLnB1c2gobmV3IFNlbGVjdG9yTm9kZVRyYW5zZm9ybSgpKTtcblxuICAgICAgICByZXR1cm4gdHJhbnNmb3JtcztcbiAgICB9XG5cbiAgICBfYWRkQm91bmRBcmdzU2VsZWN0b3JHZXR0ZXIgKG9iaiwgc2VsZWN0b3JBcmdzKSB7XG4gICAgICAgIGRlZmluZUxhenlQcm9wZXJ0eShvYmosICdzZWxlY3RvcicsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGJ1aWxkZXIgPSBuZXcgU2VsZWN0b3JCdWlsZGVyKHRoaXMuZ2V0RnVuY3Rpb24oKSwgeyBib3VuZEFyZ3M6IHNlbGVjdG9yQXJncyB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkZXIuZ2V0RnVuY3Rpb24oKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgX2RlY29yYXRlRnVuY3Rpb24gKHNlbGVjdG9yRm4pIHtcbiAgICAgICAgc3VwZXIuX2RlY29yYXRlRnVuY3Rpb24oc2VsZWN0b3JGbik7XG5cbiAgICAgICAgYWRkQVBJKHNlbGVjdG9yRm4sICgpID0+IHNlbGVjdG9yRm4sIFNlbGVjdG9yQnVpbGRlciwgdGhpcy5vcHRpb25zLmN1c3RvbURPTVByb3BlcnRpZXMsIHRoaXMub3B0aW9ucy5jdXN0b21NZXRob2RzKTtcbiAgICB9XG5cbiAgICBfcHJvY2Vzc1Jlc3VsdCAocmVzdWx0LCBzZWxlY3RvckFyZ3MpIHtcbiAgICAgICAgY29uc3Qgc25hcHNob3QgPSBzdXBlci5fcHJvY2Vzc1Jlc3VsdChyZXN1bHQsIHNlbGVjdG9yQXJncyk7XG5cbiAgICAgICAgaWYgKHNuYXBzaG90ICYmICF0aGlzLm9wdGlvbnMuY291bnRlck1vZGUpIHtcbiAgICAgICAgICAgIHRoaXMuX2FkZEJvdW5kQXJnc1NlbGVjdG9yR2V0dGVyKHNuYXBzaG90LCBzZWxlY3RvckFyZ3MpO1xuICAgICAgICAgICAgY3JlYXRlU25hcHNob3RNZXRob2RzKHNuYXBzaG90KTtcblxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5jdXN0b21NZXRob2RzKVxuICAgICAgICAgICAgICAgIGFkZEN1c3RvbU1ldGhvZHMoc25hcHNob3QsICgpID0+IHNuYXBzaG90LnNlbGVjdG9yLCBTZWxlY3RvckJ1aWxkZXIsIHRoaXMub3B0aW9ucy5jdXN0b21NZXRob2RzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzbmFwc2hvdDtcbiAgICB9XG59XG5cbiJdfQ==
