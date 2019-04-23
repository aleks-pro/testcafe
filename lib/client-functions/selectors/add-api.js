'use strict';

exports.__esModule = true;

var _defineProperty = require('babel-runtime/core-js/object/define-property');

var _defineProperty2 = _interopRequireDefault(_defineProperty);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

let getSnapshot = (() => {
    var _ref = (0, _asyncToGenerator3.default)(function* (getSelector, callsite, SelectorBuilder) {
        let node = null;
        const selector = new SelectorBuilder(getSelector(), { needError: true }, { instantiation: 'Selector' }).getFunction();

        try {
            node = yield selector();
        } catch (err) {
            err.callsite = callsite;
            throw err;
        }

        return node;
    });

    return function getSnapshot(_x, _x2, _x3) {
        return _ref.apply(this, arguments);
    };
})();

exports.addCustomMethods = addCustomMethods;
exports.addAPI = addAPI;

var _lodash = require('lodash');

var _builderSymbol = require('../builder-symbol');

var _builderSymbol2 = _interopRequireDefault(_builderSymbol);

var _snapshotProperties = require('./snapshot-properties');

var _getCallsite = require('../../errors/get-callsite');

var _clientFunctionBuilder = require('../client-function-builder');

var _clientFunctionBuilder2 = _interopRequireDefault(_clientFunctionBuilder);

var _reExecutablePromise = require('../../utils/re-executable-promise');

var _reExecutablePromise2 = _interopRequireDefault(_reExecutablePromise);

var _typeAssertions = require('../../errors/runtime/type-assertions');

var _makeRegExp = require('../../utils/make-reg-exp');

var _makeRegExp2 = _interopRequireDefault(_makeRegExp);

var _selectorTextFilter = require('./selector-text-filter');

var _selectorTextFilter2 = _interopRequireDefault(_selectorTextFilter);

var _selectorAttributeFilter = require('./selector-attribute-filter');

var _selectorAttributeFilter2 = _interopRequireDefault(_selectorAttributeFilter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const filterNodes = new _clientFunctionBuilder2.default((nodes, filter, querySelectorRoot, originNode, ...filterArgs) => {
    if (typeof filter === 'number') {
        const matchingNode = filter < 0 ? nodes[nodes.length + filter] : nodes[filter];

        return matchingNode ? [matchingNode] : [];
    }

    const result = [];

    if (typeof filter === 'string') {
        // NOTE: we can search for elements only in document or element.
        if (querySelectorRoot.nodeType !== 1 && querySelectorRoot.nodeType !== 9) return null;

        const matching = querySelectorRoot.querySelectorAll(filter);
        const matchingArr = [];

        for (let i = 0; i < matching.length; i++) matchingArr.push(matching[i]);

        filter = node => matchingArr.indexOf(node) > -1;
    }

    if (typeof filter === 'function') {
        for (let j = 0; j < nodes.length; j++) {
            if (filter(nodes[j], j, originNode, ...filterArgs)) result.push(nodes[j]);
        }
    }

    return result;
}).getFunction();

const expandSelectorResults = new _clientFunctionBuilder2.default((selector, populateDerivativeNodes) => {
    const nodes = selector();

    if (!nodes.length) return null;

    const result = [];

    for (let i = 0; i < nodes.length; i++) {
        const derivativeNodes = populateDerivativeNodes(nodes[i]);

        if (derivativeNodes) {
            for (let j = 0; j < derivativeNodes.length; j++) {
                if (result.indexOf(derivativeNodes[j]) < 0) result.push(derivativeNodes[j]);
            }
        }
    }

    return result;
}).getFunction();

function assertAddCustomDOMPropertiesOptions(properties) {
    (0, _typeAssertions.assertType)(_typeAssertions.is.nonNullObject, 'addCustomDOMProperties', '"addCustomDOMProperties" option', properties);

    (0, _keys2.default)(properties).forEach(prop => {
        (0, _typeAssertions.assertType)(_typeAssertions.is.function, 'addCustomDOMProperties', `Custom DOM properties method '${prop}'`, properties[prop]);
    });
}

function assertAddCustomMethods(properties, opts) {
    (0, _typeAssertions.assertType)(_typeAssertions.is.nonNullObject, 'addCustomMethods', '"addCustomMethods" option', properties);

    if (opts !== void 0) (0, _typeAssertions.assertType)(_typeAssertions.is.nonNullObject, 'addCustomMethods', '"addCustomMethods" option', opts);

    (0, _keys2.default)(properties).forEach(prop => {
        (0, _typeAssertions.assertType)(_typeAssertions.is.function, 'addCustomMethods', `Custom method '${prop}'`, properties[prop]);
    });
}

function prepareApiFnArgs(fnName, ...args) {
    args = args.map(arg => {
        if (typeof arg === 'string') return `'${arg}'`;
        if (typeof arg === 'function') return '[function]';
        return arg;
    });
    args = args.join(', ');

    return `.${fnName}(${args})`;
}

function getDerivativeSelectorArgs(options, selectorFn, apiFn, filter, additionalDependencies) {
    return (0, _assign2.default)({}, options, { selectorFn, apiFn, filter, additionalDependencies });
}

function addSnapshotProperties(obj, getSelector, SelectorBuilder, properties) {
    properties.forEach(prop => {
        (0, _defineProperty2.default)(obj, prop, {
            get: () => {
                const callsite = (0, _getCallsite.getCallsiteForMethod)('get');

                return _reExecutablePromise2.default.fromFn((0, _asyncToGenerator3.default)(function* () {
                    const snapshot = yield getSnapshot(getSelector, callsite, SelectorBuilder);

                    return snapshot[prop];
                }));
            }
        });
    });
}

function addCustomMethods(obj, getSelector, SelectorBuilder, customMethods) {
    const customMethodProps = customMethods ? (0, _keys2.default)(customMethods) : [];

    customMethodProps.forEach(prop => {
        var _customMethods$prop = customMethods[prop],
            _customMethods$prop$r = _customMethods$prop.returnDOMNodes;
        const returnDOMNodes = _customMethods$prop$r === undefined ? false : _customMethods$prop$r,
              method = _customMethods$prop.method;


        const dependencies = {
            customMethod: method,
            selector: getSelector()
        };

        const callsiteNames = { instantiation: prop };

        if (returnDOMNodes) {
            obj[prop] = (...args) => {
                const selectorFn = () => {
                    /* eslint-disable no-undef */
                    const nodes = selector();

                    return customMethod.apply(customMethod, [nodes].concat(args));
                    /* eslint-enable no-undef */
                };

                const apiFn = prepareApiFnArgs(prop, ...args);
                const filter = () => true;

                const additionalDependencies = {
                    args,
                    customMethod: method
                };

                return createDerivativeSelectorWithFilter({ getSelector, SelectorBuilder, selectorFn, apiFn, filter, additionalDependencies });
            };
        } else {
            obj[prop] = new _clientFunctionBuilder2.default((...args) => {
                /* eslint-disable no-undef */
                const node = selector();

                return customMethod.apply(customMethod, [node].concat(args));
                /* eslint-enable no-undef */
            }, { dependencies }, callsiteNames).getFunction();
        }
    });
}

function addSnapshotPropertyShorthands({ obj, getSelector, SelectorBuilder, customDOMProperties, customMethods }) {
    let properties = _snapshotProperties.SNAPSHOT_PROPERTIES;

    if (customDOMProperties) properties = properties.concat((0, _keys2.default)(customDOMProperties));

    addSnapshotProperties(obj, getSelector, SelectorBuilder, properties);
    addCustomMethods(obj, getSelector, SelectorBuilder, customMethods);

    obj.getStyleProperty = prop => {
        const callsite = (0, _getCallsite.getCallsiteForMethod)('getStyleProperty');

        return _reExecutablePromise2.default.fromFn((0, _asyncToGenerator3.default)(function* () {
            const snapshot = yield getSnapshot(getSelector, callsite, SelectorBuilder);

            return snapshot.style ? snapshot.style[prop] : void 0;
        }));
    };

    obj.getAttribute = attrName => {
        const callsite = (0, _getCallsite.getCallsiteForMethod)('getAttribute');

        return _reExecutablePromise2.default.fromFn((0, _asyncToGenerator3.default)(function* () {
            const snapshot = yield getSnapshot(getSelector, callsite, SelectorBuilder);

            return snapshot.attributes ? snapshot.attributes[attrName] : void 0;
        }));
    };

    obj.hasAttribute = attrName => {
        const callsite = (0, _getCallsite.getCallsiteForMethod)('hasAttribute');

        return _reExecutablePromise2.default.fromFn((0, _asyncToGenerator3.default)(function* () {
            const snapshot = yield getSnapshot(getSelector, callsite, SelectorBuilder);

            return snapshot.attributes ? snapshot.attributes.hasOwnProperty(attrName) : false;
        }));
    };

    obj.getBoundingClientRectProperty = prop => {
        const callsite = (0, _getCallsite.getCallsiteForMethod)('getBoundingClientRectProperty');

        return _reExecutablePromise2.default.fromFn((0, _asyncToGenerator3.default)(function* () {
            const snapshot = yield getSnapshot(getSelector, callsite, SelectorBuilder);

            return snapshot.boundingClientRect ? snapshot.boundingClientRect[prop] : void 0;
        }));
    };

    obj.hasClass = name => {
        const callsite = (0, _getCallsite.getCallsiteForMethod)('hasClass');

        return _reExecutablePromise2.default.fromFn((0, _asyncToGenerator3.default)(function* () {
            const snapshot = yield getSnapshot(getSelector, callsite, SelectorBuilder);

            return snapshot.classNames ? snapshot.classNames.indexOf(name) > -1 : false;
        }));
    };
}

function createCounter(getSelector, SelectorBuilder) {
    const builder = new SelectorBuilder(getSelector(), { counterMode: true }, { instantiation: 'Selector' });
    const counter = builder.getFunction();
    const callsite = (0, _getCallsite.getCallsiteForMethod)('get');

    return (0, _asyncToGenerator3.default)(function* () {
        try {
            return yield counter();
        } catch (err) {
            err.callsite = callsite;
            throw err;
        }
    });
}

function addCounterProperties({ obj, getSelector, SelectorBuilder }) {
    Object.defineProperty(obj, 'count', {
        get: () => {
            const counter = createCounter(getSelector, SelectorBuilder);

            return _reExecutablePromise2.default.fromFn(() => counter());
        }
    });

    Object.defineProperty(obj, 'exists', {
        get: () => {
            const counter = createCounter(getSelector, SelectorBuilder);

            return _reExecutablePromise2.default.fromFn((0, _asyncToGenerator3.default)(function* () {
                return (yield counter()) > 0;
            }));
        }
    });
}

function convertFilterToClientFunctionIfNecessary(callsiteName, filter, dependencies) {
    if (typeof filter === 'function') {
        const builder = filter[_builderSymbol2.default];
        const fn = builder ? builder.fn : filter;
        const options = builder ? (0, _lodash.assign)({}, builder.options, { dependencies }) : { dependencies };

        return new _clientFunctionBuilder2.default(fn, options, { instantiation: callsiteName }).getFunction();
    }

    return filter;
}

function createDerivativeSelectorWithFilter({ getSelector, SelectorBuilder, selectorFn, apiFn, filter, additionalDependencies }) {
    const collectionModeSelectorBuilder = new SelectorBuilder(getSelector(), { collectionMode: true });
    const customDOMProperties = collectionModeSelectorBuilder.options.customDOMProperties;
    const customMethods = collectionModeSelectorBuilder.options.customMethods;

    let dependencies = {
        selector: collectionModeSelectorBuilder.getFunction(),
        filter: filter,
        filterNodes: filterNodes
    };

    var _collectionModeSelect = collectionModeSelectorBuilder.options;
    const boundTestRun = _collectionModeSelect.boundTestRun,
          timeout = _collectionModeSelect.timeout,
          visibilityCheck = _collectionModeSelect.visibilityCheck,
          apiFnChain = _collectionModeSelect.apiFnChain;


    dependencies = (0, _lodash.assign)(dependencies, additionalDependencies);

    const builder = new SelectorBuilder(selectorFn, {
        dependencies,
        customDOMProperties,
        customMethods,
        boundTestRun,
        timeout,
        visibilityCheck,
        apiFnChain,
        apiFn
    }, { instantiation: 'Selector' });

    return builder.getFunction();
}

const filterByText = convertFilterToClientFunctionIfNecessary('filter', _selectorTextFilter2.default);
const filterByAttr = convertFilterToClientFunctionIfNecessary('filter', _selectorAttributeFilter2.default);

function ensureRegExpContext(str) {
    // NOTE: if a regexp is created in a separate context (via the 'vm' module) we
    // should wrap it with new RegExp() to make the `instanceof RegExp` check successful.
    if (typeof str !== 'string' && !(str instanceof RegExp)) return new RegExp(str);

    return str;
}

function addFilterMethods(options) {
    const obj = options.obj,
          getSelector = options.getSelector,
          SelectorBuilder = options.SelectorBuilder;


    obj.nth = index => {
        (0, _typeAssertions.assertType)(_typeAssertions.is.number, 'nth', '"index" argument', index);

        const apiFn = prepareApiFnArgs('nth', index);
        const builder = new SelectorBuilder(getSelector(), { index, apiFn }, { instantiation: 'Selector' });

        return builder.getFunction();
    };

    obj.withText = text => {
        (0, _typeAssertions.assertType)([_typeAssertions.is.string, _typeAssertions.is.regExp], 'withText', '"text" argument', text);

        const apiFn = prepareApiFnArgs('withText', text);

        text = ensureRegExpContext(text);

        const selectorFn = () => {
            /* eslint-disable no-undef */
            const nodes = selector();

            if (!nodes.length) return null;

            return filterNodes(nodes, filter, document, void 0, textRe);
            /* eslint-enable no-undef */
        };

        const args = getDerivativeSelectorArgs(options, selectorFn, apiFn, filterByText, { textRe: (0, _makeRegExp2.default)(text) });

        return createDerivativeSelectorWithFilter(args);
    };

    obj.withExactText = text => {
        (0, _typeAssertions.assertType)(_typeAssertions.is.string, 'withExactText', '"text" argument', text);

        const selectorFn = () => {
            /* eslint-disable no-undef */
            const nodes = selector();

            if (!nodes.length) return null;

            return filterNodes(nodes, filter, document, void 0, exactText);
            /* eslint-enable no-undef */
        };

        const apiFn = prepareApiFnArgs('withExactText', text);
        const args = getDerivativeSelectorArgs(options, selectorFn, apiFn, filterByText, { exactText: text });

        return createDerivativeSelectorWithFilter(args);
    };

    obj.withAttribute = (attrName, attrValue) => {
        (0, _typeAssertions.assertType)([_typeAssertions.is.string, _typeAssertions.is.regExp], 'withAttribute', '"attrName" argument', attrName);

        const apiFn = prepareApiFnArgs('withAttribute', attrName, attrValue);

        attrName = ensureRegExpContext(attrName);

        if (attrValue !== void 0) {
            (0, _typeAssertions.assertType)([_typeAssertions.is.string, _typeAssertions.is.regExp], 'withAttribute', '"attrValue" argument', attrValue);
            attrValue = ensureRegExpContext(attrValue);
        }

        const selectorFn = () => {
            /* eslint-disable no-undef */
            const nodes = selector();

            if (!nodes.length) return null;

            return filterNodes(nodes, filter, document, void 0, attrName, attrValue);
            /* eslint-enable no-undef */
        };

        const args = getDerivativeSelectorArgs(options, selectorFn, apiFn, filterByAttr, {
            attrName,
            attrValue
        });

        return createDerivativeSelectorWithFilter(args);
    };

    obj.filter = (filter, dependencies) => {
        (0, _typeAssertions.assertType)([_typeAssertions.is.string, _typeAssertions.is.function], 'filter', '"filter" argument', filter);

        const apiFn = prepareApiFnArgs('filter', filter);

        filter = convertFilterToClientFunctionIfNecessary('filter', filter, dependencies);

        const selectorFn = () => {
            /* eslint-disable no-undef */
            const nodes = selector();

            if (!nodes.length) return null;

            return filterNodes(nodes, filter, document, void 0);
            /* eslint-enable no-undef */
        };

        const args = getDerivativeSelectorArgs(options, selectorFn, apiFn, filter);

        return createDerivativeSelectorWithFilter(args);
    };

    obj.filterVisible = () => {
        const apiFn = prepareApiFnArgs('filterVisible');
        const builder = new SelectorBuilder(getSelector(), { filterVisible: true, apiFn }, { instantiation: 'Selector' });

        return builder.getFunction();
    };

    obj.filterHidden = () => {
        const apiFn = prepareApiFnArgs('filterHidden');
        const builder = new SelectorBuilder(getSelector(), { filterHidden: true, apiFn }, { instantiation: 'Selector' });

        return builder.getFunction();
    };
}

function addCustomDOMPropertiesMethod({ obj, getSelector, SelectorBuilder }) {
    obj.addCustomDOMProperties = customDOMProperties => {
        assertAddCustomDOMPropertiesOptions(customDOMProperties);

        const builder = new SelectorBuilder(getSelector(), { customDOMProperties }, { instantiation: 'Selector' });

        return builder.getFunction();
    };
}

function addCustomMethodsMethod({ obj, getSelector, SelectorBuilder }) {
    obj.addCustomMethods = function (methods, opts) {
        assertAddCustomMethods(methods, opts);

        const customMethods = {};

        (0, _keys2.default)(methods).forEach(methodName => {
            customMethods[methodName] = {
                method: methods[methodName],
                returnDOMNodes: opts && !!opts.returnDOMNodes
            };
        });

        const builder = new SelectorBuilder(getSelector(), { customMethods }, { instantiation: 'Selector' });

        return builder.getFunction();
    };
}

function addHierarchicalSelectors(options) {
    const obj = options.obj;

    // Find

    obj.find = (filter, dependencies) => {
        (0, _typeAssertions.assertType)([_typeAssertions.is.string, _typeAssertions.is.function], 'find', '"filter" argument', filter);

        const apiFn = prepareApiFnArgs('find', filter);

        filter = convertFilterToClientFunctionIfNecessary('find', filter, dependencies);

        const selectorFn = () => {
            /* eslint-disable no-undef */
            return expandSelectorResults(selector, node => {
                if (typeof filter === 'string') {
                    return typeof node.querySelectorAll === 'function' ? node.querySelectorAll(filter) : null;
                }

                const results = [];

                const visitNode = currentNode => {
                    const cnLength = currentNode.childNodes.length;

                    for (let i = 0; i < cnLength; i++) {
                        const child = currentNode.childNodes[i];

                        results.push(child);

                        visitNode(child);
                    }
                };

                visitNode(node);

                return filterNodes(results, filter, null, node);
            });
            /* eslint-enable no-undef */
        };

        const args = getDerivativeSelectorArgs(options, selectorFn, apiFn, filter, { expandSelectorResults });

        return createDerivativeSelectorWithFilter(args);
    };

    // Parent
    obj.parent = (filter, dependencies) => {
        if (filter !== void 0) (0, _typeAssertions.assertType)([_typeAssertions.is.string, _typeAssertions.is.function, _typeAssertions.is.number], 'parent', '"filter" argument', filter);

        const apiFn = prepareApiFnArgs('parent', filter);

        filter = convertFilterToClientFunctionIfNecessary('find', filter, dependencies);

        const selectorFn = () => {
            /* eslint-disable no-undef */
            return expandSelectorResults(selector, node => {
                const parents = [];

                for (let parent = node.parentNode; parent; parent = parent.parentNode) parents.push(parent);

                return filter !== void 0 ? filterNodes(parents, filter, document, node) : parents;
            });
            /* eslint-enable no-undef */
        };

        const args = getDerivativeSelectorArgs(options, selectorFn, apiFn, filter, { expandSelectorResults });

        return createDerivativeSelectorWithFilter(args);
    };

    // Child
    obj.child = (filter, dependencies) => {
        if (filter !== void 0) (0, _typeAssertions.assertType)([_typeAssertions.is.string, _typeAssertions.is.function, _typeAssertions.is.number], 'child', '"filter" argument', filter);

        const apiFn = prepareApiFnArgs('child', filter);

        filter = convertFilterToClientFunctionIfNecessary('find', filter, dependencies);

        const selectorFn = () => {
            /* eslint-disable no-undef */
            return expandSelectorResults(selector, node => {
                const childElements = [];
                const cnLength = node.childNodes.length;

                for (let i = 0; i < cnLength; i++) {
                    const child = node.childNodes[i];

                    if (child.nodeType === 1) childElements.push(child);
                }

                return filter !== void 0 ? filterNodes(childElements, filter, node, node) : childElements;
            });
            /* eslint-enable no-undef */
        };

        const args = getDerivativeSelectorArgs(options, selectorFn, apiFn, filter, { expandSelectorResults });

        return createDerivativeSelectorWithFilter(args);
    };

    // Sibling
    obj.sibling = (filter, dependencies) => {
        if (filter !== void 0) (0, _typeAssertions.assertType)([_typeAssertions.is.string, _typeAssertions.is.function, _typeAssertions.is.number], 'sibling', '"filter" argument', filter);

        const apiFn = prepareApiFnArgs('sibling', filter);

        filter = convertFilterToClientFunctionIfNecessary('find', filter, dependencies);

        const selectorFn = () => {
            /* eslint-disable no-undef */
            return expandSelectorResults(selector, node => {
                const parent = node.parentNode;

                if (!parent) return null;

                const siblings = [];
                const cnLength = parent.childNodes.length;

                for (let i = 0; i < cnLength; i++) {
                    const child = parent.childNodes[i];

                    if (child.nodeType === 1 && child !== node) siblings.push(child);
                }

                return filter !== void 0 ? filterNodes(siblings, filter, parent, node) : siblings;
            });
            /* eslint-enable no-undef */
        };

        const args = getDerivativeSelectorArgs(options, selectorFn, apiFn, filter, { expandSelectorResults });

        return createDerivativeSelectorWithFilter(args);
    };

    // Next sibling
    obj.nextSibling = (filter, dependencies) => {
        if (filter !== void 0) (0, _typeAssertions.assertType)([_typeAssertions.is.string, _typeAssertions.is.function, _typeAssertions.is.number], 'nextSibling', '"filter" argument', filter);

        const apiFn = prepareApiFnArgs('nextSibling', filter);

        filter = convertFilterToClientFunctionIfNecessary('find', filter, dependencies);

        const selectorFn = () => {
            /* eslint-disable no-undef */
            return expandSelectorResults(selector, node => {
                const parent = node.parentNode;

                if (!parent) return null;

                const siblings = [];
                const cnLength = parent.childNodes.length;
                let afterNode = false;

                for (let i = 0; i < cnLength; i++) {
                    const child = parent.childNodes[i];

                    if (child === node) afterNode = true;else if (afterNode && child.nodeType === 1) siblings.push(child);
                }

                return filter !== void 0 ? filterNodes(siblings, filter, parent, node) : siblings;
            });
            /* eslint-enable no-undef */
        };

        const args = getDerivativeSelectorArgs(options, selectorFn, apiFn, filter, { expandSelectorResults });

        return createDerivativeSelectorWithFilter(args);
    };

    // Prev sibling
    obj.prevSibling = (filter, dependencies) => {
        if (filter !== void 0) (0, _typeAssertions.assertType)([_typeAssertions.is.string, _typeAssertions.is.function, _typeAssertions.is.number], 'prevSibling', '"filter" argument', filter);

        const apiFn = prepareApiFnArgs('prevSibling', filter);

        filter = convertFilterToClientFunctionIfNecessary('find', filter, dependencies);

        const selectorFn = () => {
            /* eslint-disable no-undef */
            return expandSelectorResults(selector, node => {
                const parent = node.parentNode;

                if (!parent) return null;

                const siblings = [];
                const cnLength = parent.childNodes.length;

                for (let i = 0; i < cnLength; i++) {
                    const child = parent.childNodes[i];

                    if (child === node) break;

                    if (child.nodeType === 1) siblings.push(child);
                }

                return filter !== void 0 ? filterNodes(siblings, filter, parent, node) : siblings;
            });
            /* eslint-enable no-undef */
        };

        const args = getDerivativeSelectorArgs(options, selectorFn, apiFn, filter, { expandSelectorResults });

        return createDerivativeSelectorWithFilter(args);
    };
}

function addAPI(selector, getSelector, SelectorBuilder, customDOMProperties, customMethods) {
    const options = { obj: selector, getSelector, SelectorBuilder, customDOMProperties, customMethods };

    addFilterMethods(options);
    addHierarchicalSelectors(options);
    addSnapshotPropertyShorthands(options);
    addCustomDOMPropertiesMethod(options);
    addCustomMethodsMethod(options);
    addCounterProperties(options);
}
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jbGllbnQtZnVuY3Rpb25zL3NlbGVjdG9ycy9hZGQtYXBpLmpzIl0sIm5hbWVzIjpbImdldFNlbGVjdG9yIiwiY2FsbHNpdGUiLCJTZWxlY3RvckJ1aWxkZXIiLCJub2RlIiwic2VsZWN0b3IiLCJuZWVkRXJyb3IiLCJpbnN0YW50aWF0aW9uIiwiZ2V0RnVuY3Rpb24iLCJlcnIiLCJnZXRTbmFwc2hvdCIsImFkZEN1c3RvbU1ldGhvZHMiLCJhZGRBUEkiLCJmaWx0ZXJOb2RlcyIsIm5vZGVzIiwiZmlsdGVyIiwicXVlcnlTZWxlY3RvclJvb3QiLCJvcmlnaW5Ob2RlIiwiZmlsdGVyQXJncyIsIm1hdGNoaW5nTm9kZSIsImxlbmd0aCIsInJlc3VsdCIsIm5vZGVUeXBlIiwibWF0Y2hpbmciLCJxdWVyeVNlbGVjdG9yQWxsIiwibWF0Y2hpbmdBcnIiLCJpIiwicHVzaCIsImluZGV4T2YiLCJqIiwiZXhwYW5kU2VsZWN0b3JSZXN1bHRzIiwicG9wdWxhdGVEZXJpdmF0aXZlTm9kZXMiLCJkZXJpdmF0aXZlTm9kZXMiLCJhc3NlcnRBZGRDdXN0b21ET01Qcm9wZXJ0aWVzT3B0aW9ucyIsInByb3BlcnRpZXMiLCJub25OdWxsT2JqZWN0IiwiZm9yRWFjaCIsInByb3AiLCJmdW5jdGlvbiIsImFzc2VydEFkZEN1c3RvbU1ldGhvZHMiLCJvcHRzIiwicHJlcGFyZUFwaUZuQXJncyIsImZuTmFtZSIsImFyZ3MiLCJtYXAiLCJhcmciLCJqb2luIiwiZ2V0RGVyaXZhdGl2ZVNlbGVjdG9yQXJncyIsIm9wdGlvbnMiLCJzZWxlY3RvckZuIiwiYXBpRm4iLCJhZGRpdGlvbmFsRGVwZW5kZW5jaWVzIiwiYWRkU25hcHNob3RQcm9wZXJ0aWVzIiwib2JqIiwiZ2V0IiwiZnJvbUZuIiwic25hcHNob3QiLCJjdXN0b21NZXRob2RzIiwiY3VzdG9tTWV0aG9kUHJvcHMiLCJyZXR1cm5ET01Ob2RlcyIsIm1ldGhvZCIsImRlcGVuZGVuY2llcyIsImN1c3RvbU1ldGhvZCIsImNhbGxzaXRlTmFtZXMiLCJhcHBseSIsImNvbmNhdCIsImNyZWF0ZURlcml2YXRpdmVTZWxlY3RvcldpdGhGaWx0ZXIiLCJhZGRTbmFwc2hvdFByb3BlcnR5U2hvcnRoYW5kcyIsImN1c3RvbURPTVByb3BlcnRpZXMiLCJnZXRTdHlsZVByb3BlcnR5Iiwic3R5bGUiLCJnZXRBdHRyaWJ1dGUiLCJhdHRyTmFtZSIsImF0dHJpYnV0ZXMiLCJoYXNBdHRyaWJ1dGUiLCJoYXNPd25Qcm9wZXJ0eSIsImdldEJvdW5kaW5nQ2xpZW50UmVjdFByb3BlcnR5IiwiYm91bmRpbmdDbGllbnRSZWN0IiwiaGFzQ2xhc3MiLCJuYW1lIiwiY2xhc3NOYW1lcyIsImNyZWF0ZUNvdW50ZXIiLCJidWlsZGVyIiwiY291bnRlck1vZGUiLCJjb3VudGVyIiwiYWRkQ291bnRlclByb3BlcnRpZXMiLCJPYmplY3QiLCJkZWZpbmVQcm9wZXJ0eSIsImNvbnZlcnRGaWx0ZXJUb0NsaWVudEZ1bmN0aW9uSWZOZWNlc3NhcnkiLCJjYWxsc2l0ZU5hbWUiLCJmbiIsImNvbGxlY3Rpb25Nb2RlU2VsZWN0b3JCdWlsZGVyIiwiY29sbGVjdGlvbk1vZGUiLCJib3VuZFRlc3RSdW4iLCJ0aW1lb3V0IiwidmlzaWJpbGl0eUNoZWNrIiwiYXBpRm5DaGFpbiIsImZpbHRlckJ5VGV4dCIsImZpbHRlckJ5QXR0ciIsImVuc3VyZVJlZ0V4cENvbnRleHQiLCJzdHIiLCJSZWdFeHAiLCJhZGRGaWx0ZXJNZXRob2RzIiwibnRoIiwiaW5kZXgiLCJudW1iZXIiLCJ3aXRoVGV4dCIsInRleHQiLCJzdHJpbmciLCJyZWdFeHAiLCJkb2N1bWVudCIsInRleHRSZSIsIndpdGhFeGFjdFRleHQiLCJleGFjdFRleHQiLCJ3aXRoQXR0cmlidXRlIiwiYXR0clZhbHVlIiwiZmlsdGVyVmlzaWJsZSIsImZpbHRlckhpZGRlbiIsImFkZEN1c3RvbURPTVByb3BlcnRpZXNNZXRob2QiLCJhZGRDdXN0b21ET01Qcm9wZXJ0aWVzIiwiYWRkQ3VzdG9tTWV0aG9kc01ldGhvZCIsIm1ldGhvZHMiLCJtZXRob2ROYW1lIiwiYWRkSGllcmFyY2hpY2FsU2VsZWN0b3JzIiwiZmluZCIsInJlc3VsdHMiLCJ2aXNpdE5vZGUiLCJjdXJyZW50Tm9kZSIsImNuTGVuZ3RoIiwiY2hpbGROb2RlcyIsImNoaWxkIiwicGFyZW50IiwicGFyZW50cyIsInBhcmVudE5vZGUiLCJjaGlsZEVsZW1lbnRzIiwic2libGluZyIsInNpYmxpbmdzIiwibmV4dFNpYmxpbmciLCJhZnRlck5vZGUiLCJwcmV2U2libGluZyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OytDQW1FQSxXQUE0QkEsV0FBNUIsRUFBeUNDLFFBQXpDLEVBQW1EQyxlQUFuRCxFQUFvRTtBQUNoRSxZQUFJQyxPQUFhLElBQWpCO0FBQ0EsY0FBTUMsV0FBVyxJQUFJRixlQUFKLENBQW9CRixhQUFwQixFQUFtQyxFQUFFSyxXQUFXLElBQWIsRUFBbkMsRUFBd0QsRUFBRUMsZUFBZSxVQUFqQixFQUF4RCxFQUF1RkMsV0FBdkYsRUFBakI7O0FBRUEsWUFBSTtBQUNBSixtQkFBTyxNQUFNQyxVQUFiO0FBQ0gsU0FGRCxDQUlBLE9BQU9JLEdBQVAsRUFBWTtBQUNSQSxnQkFBSVAsUUFBSixHQUFlQSxRQUFmO0FBQ0Esa0JBQU1PLEdBQU47QUFDSDs7QUFFRCxlQUFPTCxJQUFQO0FBQ0gsSzs7b0JBZGNNLFc7Ozs7O1FBb0VDQyxnQixHQUFBQSxnQjtRQTRqQkFDLE0sR0FBQUEsTTs7QUFuc0JoQjs7QUFDQTs7OztBQUNBOztBQUNBOztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7OztBQUVBLE1BQU1DLGNBQWUsb0NBQTBCLENBQUNDLEtBQUQsRUFBUUMsTUFBUixFQUFnQkMsaUJBQWhCLEVBQW1DQyxVQUFuQyxFQUErQyxHQUFHQyxVQUFsRCxLQUFpRTtBQUM1RyxRQUFJLE9BQU9ILE1BQVAsS0FBa0IsUUFBdEIsRUFBZ0M7QUFDNUIsY0FBTUksZUFBZUosU0FB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LFFBQVosRUFBc0J6SCxNQUF0QixFQUE4Qm9ILE1BQTlCLEVBQXNDL0gsSUFBdEMsQ0FBcEIsR0FBa0VvSSxRQUF6RTtBQUNILGFBcEJNLENBQVA7QUFxQkE7QUFDSCxTQXhCRDs7QUEwQkEsY0FBTTdGLE9BQU9JLDBCQUEwQkMsT0FBMUIsRUFBbUNDLFVBQW5DLEVBQStDQyxLQUEvQyxFQUFzRG5DLE1BQXRELEVBQThELEVBQUVlLHFCQUFGLEVBQTlELENBQWI7O0FBRUEsZUFBT29DLG1DQUFtQ3ZCLElBQW5DLENBQVA7QUFDSCxLQXJDRDtBQXNDSDs7QUFFTSxTQUFTL0IsTUFBVCxDQUFpQlAsUUFBakIsRUFBMkJKLFdBQTNCLEVBQXdDRSxlQUF4QyxFQUF5RGlFLG1CQUF6RCxFQUE4RVgsYUFBOUUsRUFBNkY7QUFDaEcsVUFBTVQsVUFBVSxFQUFFSyxLQUFLaEQsUUFBUCxFQUFpQkosV0FBakIsRUFBOEJFLGVBQTlCLEVBQStDaUUsbUJBQS9DLEVBQW9FWCxhQUFwRSxFQUFoQjs7QUFFQTZDLHFCQUFpQnRELE9BQWpCO0FBQ0EyRSw2QkFBeUIzRSxPQUF6QjtBQUNBbUIsa0NBQThCbkIsT0FBOUI7QUFDQXNFLGlDQUE2QnRFLE9BQTdCO0FBQ0F3RSwyQkFBdUJ4RSxPQUF2QjtBQUNBcUMseUJBQXFCckMsT0FBckI7QUFDSCIsImZpbGUiOiJjbGllbnQtZnVuY3Rpb25zL3NlbGVjdG9ycy9hZGQtYXBpLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgYXNzaWduIH0gZnJvbSAnbG9kYXNoJztcbmltcG9ydCBjbGllbnRGdW5jdGlvbkJ1aWxkZXJTeW1ib2wgZnJvbSAnLi4vYnVpbGRlci1zeW1ib2wnO1xuaW1wb3J0IHsgU05BUFNIT1RfUFJPUEVSVElFUyB9IGZyb20gJy4vc25hcHNob3QtcHJvcGVydGllcyc7XG5pbXBvcnQgeyBnZXRDYWxsc2l0ZUZvck1ldGhvZCB9IGZyb20gJy4uLy4uL2Vycm9ycy9nZXQtY2FsbHNpdGUnO1xuaW1wb3J0IENsaWVudEZ1bmN0aW9uQnVpbGRlciBmcm9tICcuLi9jbGllbnQtZnVuY3Rpb24tYnVpbGRlcic7XG5pbXBvcnQgUmVFeGVjdXRhYmxlUHJvbWlzZSBmcm9tICcuLi8uLi91dGlscy9yZS1leGVjdXRhYmxlLXByb21pc2UnO1xuaW1wb3J0IHsgYXNzZXJ0VHlwZSwgaXMgfSBmcm9tICcuLi8uLi9lcnJvcnMvcnVudGltZS90eXBlLWFzc2VydGlvbnMnO1xuaW1wb3J0IG1ha2VSZWdFeHAgZnJvbSAnLi4vLi4vdXRpbHMvbWFrZS1yZWctZXhwJztcbmltcG9ydCBzZWxlY3RvclRleHRGaWx0ZXIgZnJvbSAnLi9zZWxlY3Rvci10ZXh0LWZpbHRlcic7XG5pbXBvcnQgc2VsZWN0b3JBdHRyaWJ1dGVGaWx0ZXIgZnJvbSAnLi9zZWxlY3Rvci1hdHRyaWJ1dGUtZmlsdGVyJztcblxuY29uc3QgZmlsdGVyTm9kZXMgPSAobmV3IENsaWVudEZ1bmN0aW9uQnVpbGRlcigobm9kZXMsIGZpbHRlciwgcXVlcnlTZWxlY3RvclJvb3QsIG9yaWdpbk5vZGUsIC4uLmZpbHRlckFyZ3MpID0+IHtcbiAgICBpZiAodHlwZW9mIGZpbHRlciA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgY29uc3QgbWF0Y2hpbmdOb2RlID0gZmlsdGVyIDwgMCA/IG5vZGVzW25vZGVzLmxlbmd0aCArIGZpbHRlcl0gOiBub2Rlc1tmaWx0ZXJdO1xuXG4gICAgICAgIHJldHVybiBtYXRjaGluZ05vZGUgPyBbbWF0Y2hpbmdOb2RlXSA6IFtdO1xuICAgIH1cblxuICAgIGNvbnN0IHJlc3VsdCA9IFtdO1xuXG4gICAgaWYgKHR5cGVvZiBmaWx0ZXIgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIC8vIE5PVEU6IHdlIGNhbiBzZWFyY2ggZm9yIGVsZW1lbnRzIG9ubHkgaW4gZG9jdW1lbnQgb3IgZWxlbWVudC5cbiAgICAgICAgaWYgKHF1ZXJ5U2VsZWN0b3JSb290Lm5vZGVUeXBlICE9PSAxICYmIHF1ZXJ5U2VsZWN0b3JSb290Lm5vZGVUeXBlICE9PSA5KVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgY29uc3QgbWF0Y2hpbmcgICAgPSBxdWVyeVNlbGVjdG9yUm9vdC5xdWVyeVNlbGVjdG9yQWxsKGZpbHRlcik7XG4gICAgICAgIGNvbnN0IG1hdGNoaW5nQXJyID0gW107XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBtYXRjaGluZy5sZW5ndGg7IGkrKylcbiAgICAgICAgICAgIG1hdGNoaW5nQXJyLnB1c2gobWF0Y2hpbmdbaV0pO1xuXG4gICAgICAgIGZpbHRlciA9IG5vZGUgPT4gbWF0Y2hpbmdBcnIuaW5kZXhPZihub2RlKSA+IC0xO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgZmlsdGVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgbm9kZXMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgIGlmIChmaWx0ZXIobm9kZXNbal0sIGosIG9yaWdpbk5vZGUsIC4uLmZpbHRlckFyZ3MpKVxuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKG5vZGVzW2pdKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG59KSkuZ2V0RnVuY3Rpb24oKTtcblxuY29uc3QgZXhwYW5kU2VsZWN0b3JSZXN1bHRzID0gKG5ldyBDbGllbnRGdW5jdGlvbkJ1aWxkZXIoKHNlbGVjdG9yLCBwb3B1bGF0ZURlcml2YXRpdmVOb2RlcykgPT4ge1xuICAgIGNvbnN0IG5vZGVzID0gc2VsZWN0b3IoKTtcblxuICAgIGlmICghbm9kZXMubGVuZ3RoKVxuICAgICAgICByZXR1cm4gbnVsbDtcblxuICAgIGNvbnN0IHJlc3VsdCA9IFtdO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBub2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBkZXJpdmF0aXZlTm9kZXMgPSBwb3B1bGF0ZURlcml2YXRpdmVOb2Rlcyhub2Rlc1tpXSk7XG5cbiAgICAgICAgaWYgKGRlcml2YXRpdmVOb2Rlcykge1xuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBkZXJpdmF0aXZlTm9kZXMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0LmluZGV4T2YoZGVyaXZhdGl2ZU5vZGVzW2pdKSA8IDApXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKGRlcml2YXRpdmVOb2Rlc1tqXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuXG59KSkuZ2V0RnVuY3Rpb24oKTtcblxuYXN5bmMgZnVuY3Rpb24gZ2V0U25hcHNob3QgKGdldFNlbGVjdG9yLCBjYWxsc2l0ZSwgU2VsZWN0b3JCdWlsZGVyKSB7XG4gICAgbGV0IG5vZGUgICAgICAgPSBudWxsO1xuICAgIGNvbnN0IHNlbGVjdG9yID0gbmV3IFNlbGVjdG9yQnVpbGRlcihnZXRTZWxlY3RvcigpLCB7IG5lZWRFcnJvcjogdHJ1ZSB9LCB7IGluc3RhbnRpYXRpb246ICdTZWxlY3RvcicgfSkuZ2V0RnVuY3Rpb24oKTtcblxuICAgIHRyeSB7XG4gICAgICAgIG5vZGUgPSBhd2FpdCBzZWxlY3RvcigpO1xuICAgIH1cblxuICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgZXJyLmNhbGxzaXRlID0gY2FsbHNpdGU7XG4gICAgICAgIHRocm93IGVycjtcbiAgICB9XG5cbiAgICByZXR1cm4gbm9kZTtcbn1cblxuZnVuY3Rpb24gYXNzZXJ0QWRkQ3VzdG9tRE9NUHJvcGVydGllc09wdGlvbnMgKHByb3BlcnRpZXMpIHtcbiAgICBhc3NlcnRUeXBlKGlzLm5vbk51bGxPYmplY3QsICdhZGRDdXN0b21ET01Qcm9wZXJ0aWVzJywgJ1wiYWRkQ3VzdG9tRE9NUHJvcGVydGllc1wiIG9wdGlvbicsIHByb3BlcnRpZXMpO1xuXG4gICAgT2JqZWN0LmtleXMocHJvcGVydGllcykuZm9yRWFjaChwcm9wID0+IHtcbiAgICAgICAgYXNzZXJ0VHlwZShpcy5mdW5jdGlvbiwgJ2FkZEN1c3RvbURPTVByb3BlcnRpZXMnLCBgQ3VzdG9tIERPTSBwcm9wZXJ0aWVzIG1ldGhvZCAnJHtwcm9wfSdgLCBwcm9wZXJ0aWVzW3Byb3BdKTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gYXNzZXJ0QWRkQ3VzdG9tTWV0aG9kcyAocHJvcGVydGllcywgb3B0cykge1xuICAgIGFzc2VydFR5cGUoaXMubm9uTnVsbE9iamVjdCwgJ2FkZEN1c3RvbU1ldGhvZHMnLCAnXCJhZGRDdXN0b21NZXRob2RzXCIgb3B0aW9uJywgcHJvcGVydGllcyk7XG5cbiAgICBpZiAob3B0cyAhPT0gdm9pZCAwKVxuICAgICAgICBhc3NlcnRUeXBlKGlzLm5vbk51bGxPYmplY3QsICdhZGRDdXN0b21NZXRob2RzJywgJ1wiYWRkQ3VzdG9tTWV0aG9kc1wiIG9wdGlvbicsIG9wdHMpO1xuXG4gICAgT2JqZWN0LmtleXMocHJvcGVydGllcykuZm9yRWFjaChwcm9wID0+IHtcbiAgICAgICAgYXNzZXJ0VHlwZShpcy5mdW5jdGlvbiwgJ2FkZEN1c3RvbU1ldGhvZHMnLCBgQ3VzdG9tIG1ldGhvZCAnJHtwcm9wfSdgLCBwcm9wZXJ0aWVzW3Byb3BdKTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gcHJlcGFyZUFwaUZuQXJncyAoZm5OYW1lLCAuLi5hcmdzKSB7XG4gICAgYXJncyA9IGFyZ3MubWFwKGFyZyA9PiB7XG4gICAgICAgIGlmICh0eXBlb2YgYXJnID09PSAnc3RyaW5nJylcbiAgICAgICAgICAgIHJldHVybiBgJyR7YXJnfSdgO1xuICAgICAgICBpZiAodHlwZW9mIGFyZyA9PT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgICAgIHJldHVybiAnW2Z1bmN0aW9uXSc7XG4gICAgICAgIHJldHVybiBhcmc7XG4gICAgfSk7XG4gICAgYXJncyA9IGFyZ3Muam9pbignLCAnKTtcblxuICAgIHJldHVybiBgLiR7Zm5OYW1lfSgke2FyZ3N9KWA7XG59XG5cbmZ1bmN0aW9uIGdldERlcml2YXRpdmVTZWxlY3RvckFyZ3MgKG9wdGlvbnMsIHNlbGVjdG9yRm4sIGFwaUZuLCBmaWx0ZXIsIGFkZGl0aW9uYWxEZXBlbmRlbmNpZXMpIHtcbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7fSwgb3B0aW9ucywgeyBzZWxlY3RvckZuLCBhcGlGbiwgZmlsdGVyLCBhZGRpdGlvbmFsRGVwZW5kZW5jaWVzIH0pO1xufVxuXG5mdW5jdGlvbiBhZGRTbmFwc2hvdFByb3BlcnRpZXMgKG9iaiwgZ2V0U2VsZWN0b3IsIFNlbGVjdG9yQnVpbGRlciwgcHJvcGVydGllcykge1xuICAgIHByb3BlcnRpZXMuZm9yRWFjaChwcm9wID0+IHtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwgcHJvcCwge1xuICAgICAgICAgICAgZ2V0OiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2FsbHNpdGUgPSBnZXRDYWxsc2l0ZUZvck1ldGhvZCgnZ2V0Jyk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gUmVFeGVjdXRhYmxlUHJvbWlzZS5mcm9tRm4oYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBzbmFwc2hvdCA9IGF3YWl0IGdldFNuYXBzaG90KGdldFNlbGVjdG9yLCBjYWxsc2l0ZSwgU2VsZWN0b3JCdWlsZGVyKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc25hcHNob3RbcHJvcF07XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYWRkQ3VzdG9tTWV0aG9kcyAob2JqLCBnZXRTZWxlY3RvciwgU2VsZWN0b3JCdWlsZGVyLCBjdXN0b21NZXRob2RzKSB7XG4gICAgY29uc3QgY3VzdG9tTWV0aG9kUHJvcHMgPSBjdXN0b21NZXRob2RzID8gT2JqZWN0LmtleXMoY3VzdG9tTWV0aG9kcykgOiBbXTtcblxuICAgIGN1c3RvbU1ldGhvZFByb3BzLmZvckVhY2gocHJvcCA9PiB7XG4gICAgICAgIGNvbnN0IHsgcmV0dXJuRE9NTm9kZXMgPSBmYWxzZSwgbWV0aG9kIH0gPSBjdXN0b21NZXRob2RzW3Byb3BdO1xuXG4gICAgICAgIGNvbnN0IGRlcGVuZGVuY2llcyA9IHtcbiAgICAgICAgICAgIGN1c3RvbU1ldGhvZDogbWV0aG9kLFxuICAgICAgICAgICAgc2VsZWN0b3I6ICAgICBnZXRTZWxlY3RvcigpXG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgY2FsbHNpdGVOYW1lcyA9IHsgaW5zdGFudGlhdGlvbjogcHJvcCB9O1xuXG4gICAgICAgIGlmIChyZXR1cm5ET01Ob2Rlcykge1xuICAgICAgICAgICAgb2JqW3Byb3BdID0gKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBzZWxlY3RvckZuID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby11bmRlZiAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBub2RlcyA9IHNlbGVjdG9yKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGN1c3RvbU1ldGhvZC5hcHBseShjdXN0b21NZXRob2QsIFtub2Rlc10uY29uY2F0KGFyZ3MpKTtcbiAgICAgICAgICAgICAgICAgICAgLyogZXNsaW50LWVuYWJsZSBuby11bmRlZiAqL1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBjb25zdCBhcGlGbiA9IHByZXBhcmVBcGlGbkFyZ3MocHJvcCwgLi4uYXJncyk7XG4gICAgICAgICAgICAgICAgY29uc3QgZmlsdGVyID0gKCkgPT4gdHJ1ZTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IGFkZGl0aW9uYWxEZXBlbmRlbmNpZXMgPSB7XG4gICAgICAgICAgICAgICAgICAgIGFyZ3MsXG4gICAgICAgICAgICAgICAgICAgIGN1c3RvbU1ldGhvZDogbWV0aG9kXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBjcmVhdGVEZXJpdmF0aXZlU2VsZWN0b3JXaXRoRmlsdGVyKHsgZ2V0U2VsZWN0b3IsIFNlbGVjdG9yQnVpbGRlciwgc2VsZWN0b3JGbiwgYXBpRm4sIGZpbHRlciwgYWRkaXRpb25hbERlcGVuZGVuY2llcyB9KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBvYmpbcHJvcF0gPSAobmV3IENsaWVudEZ1bmN0aW9uQnVpbGRlcigoLi4uYXJncykgPT4ge1xuICAgICAgICAgICAgICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLXVuZGVmICovXG4gICAgICAgICAgICAgICAgY29uc3Qgbm9kZSA9IHNlbGVjdG9yKCk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gY3VzdG9tTWV0aG9kLmFwcGx5KGN1c3RvbU1ldGhvZCwgW25vZGVdLmNvbmNhdChhcmdzKSk7XG4gICAgICAgICAgICAgICAgLyogZXNsaW50LWVuYWJsZSBuby11bmRlZiAqL1xuICAgICAgICAgICAgfSwgeyBkZXBlbmRlbmNpZXMgfSwgY2FsbHNpdGVOYW1lcykpLmdldEZ1bmN0aW9uKCk7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gYWRkU25hcHNob3RQcm9wZXJ0eVNob3J0aGFuZHMgKHsgb2JqLCBnZXRTZWxlY3RvciwgU2VsZWN0b3JCdWlsZGVyLCBjdXN0b21ET01Qcm9wZXJ0aWVzLCBjdXN0b21NZXRob2RzIH0pIHtcbiAgICBsZXQgcHJvcGVydGllcyA9IFNOQVBTSE9UX1BST1BFUlRJRVM7XG5cbiAgICBpZiAoY3VzdG9tRE9NUHJvcGVydGllcylcbiAgICAgICAgcHJvcGVydGllcyA9IHByb3BlcnRpZXMuY29uY2F0KE9iamVjdC5rZXlzKGN1c3RvbURPTVByb3BlcnRpZXMpKTtcblxuICAgIGFkZFNuYXBzaG90UHJvcGVydGllcyhvYmosIGdldFNlbGVjdG9yLCBTZWxlY3RvckJ1aWxkZXIsIHByb3BlcnRpZXMpO1xuICAgIGFkZEN1c3RvbU1ldGhvZHMob2JqLCBnZXRTZWxlY3RvciwgU2VsZWN0b3JCdWlsZGVyLCBjdXN0b21NZXRob2RzKTtcblxuICAgIG9iai5nZXRTdHlsZVByb3BlcnR5ID0gcHJvcCA9PiB7XG4gICAgICAgIGNvbnN0IGNhbGxzaXRlID0gZ2V0Q2FsbHNpdGVGb3JNZXRob2QoJ2dldFN0eWxlUHJvcGVydHknKTtcblxuICAgICAgICByZXR1cm4gUmVFeGVjdXRhYmxlUHJvbWlzZS5mcm9tRm4oYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc25hcHNob3QgPSBhd2FpdCBnZXRTbmFwc2hvdChnZXRTZWxlY3RvciwgY2FsbHNpdGUsIFNlbGVjdG9yQnVpbGRlcik7XG5cbiAgICAgICAgICAgIHJldHVybiBzbmFwc2hvdC5zdHlsZSA/IHNuYXBzaG90LnN0eWxlW3Byb3BdIDogdm9pZCAwO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgb2JqLmdldEF0dHJpYnV0ZSA9IGF0dHJOYW1lID0+IHtcbiAgICAgICAgY29uc3QgY2FsbHNpdGUgPSBnZXRDYWxsc2l0ZUZvck1ldGhvZCgnZ2V0QXR0cmlidXRlJyk7XG5cbiAgICAgICAgcmV0dXJuIFJlRXhlY3V0YWJsZVByb21pc2UuZnJvbUZuKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHNuYXBzaG90ID0gYXdhaXQgZ2V0U25hcHNob3QoZ2V0U2VsZWN0b3IsIGNhbGxzaXRlLCBTZWxlY3RvckJ1aWxkZXIpO1xuXG4gICAgICAgICAgICByZXR1cm4gc25hcHNob3QuYXR0cmlidXRlcyA/IHNuYXBzaG90LmF0dHJpYnV0ZXNbYXR0ck5hbWVdIDogdm9pZCAwO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgb2JqLmhhc0F0dHJpYnV0ZSA9IGF0dHJOYW1lID0+IHtcbiAgICAgICAgY29uc3QgY2FsbHNpdGUgPSBnZXRDYWxsc2l0ZUZvck1ldGhvZCgnaGFzQXR0cmlidXRlJyk7XG5cbiAgICAgICAgcmV0dXJuIFJlRXhlY3V0YWJsZVByb21pc2UuZnJvbUZuKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHNuYXBzaG90ID0gYXdhaXQgZ2V0U25hcHNob3QoZ2V0U2VsZWN0b3IsIGNhbGxzaXRlLCBTZWxlY3RvckJ1aWxkZXIpO1xuXG4gICAgICAgICAgICByZXR1cm4gc25hcHNob3QuYXR0cmlidXRlcyA/IHNuYXBzaG90LmF0dHJpYnV0ZXMuaGFzT3duUHJvcGVydHkoYXR0ck5hbWUpIDogZmFsc2U7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBvYmouZ2V0Qm91bmRpbmdDbGllbnRSZWN0UHJvcGVydHkgPSBwcm9wID0+IHtcbiAgICAgICAgY29uc3QgY2FsbHNpdGUgPSBnZXRDYWxsc2l0ZUZvck1ldGhvZCgnZ2V0Qm91bmRpbmdDbGllbnRSZWN0UHJvcGVydHknKTtcblxuICAgICAgICByZXR1cm4gUmVFeGVjdXRhYmxlUHJvbWlzZS5mcm9tRm4oYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc25hcHNob3QgPSBhd2FpdCBnZXRTbmFwc2hvdChnZXRTZWxlY3RvciwgY2FsbHNpdGUsIFNlbGVjdG9yQnVpbGRlcik7XG5cbiAgICAgICAgICAgIHJldHVybiBzbmFwc2hvdC5ib3VuZGluZ0NsaWVudFJlY3QgPyBzbmFwc2hvdC5ib3VuZGluZ0NsaWVudFJlY3RbcHJvcF0gOiB2b2lkIDA7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBvYmouaGFzQ2xhc3MgPSBuYW1lID0+IHtcbiAgICAgICAgY29uc3QgY2FsbHNpdGUgPSBnZXRDYWxsc2l0ZUZvck1ldGhvZCgnaGFzQ2xhc3MnKTtcblxuICAgICAgICByZXR1cm4gUmVFeGVjdXRhYmxlUHJvbWlzZS5mcm9tRm4oYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc25hcHNob3QgPSBhd2FpdCBnZXRTbmFwc2hvdChnZXRTZWxlY3RvciwgY2FsbHNpdGUsIFNlbGVjdG9yQnVpbGRlcik7XG5cbiAgICAgICAgICAgIHJldHVybiBzbmFwc2hvdC5jbGFzc05hbWVzID8gc25hcHNob3QuY2xhc3NOYW1lcy5pbmRleE9mKG5hbWUpID4gLTEgOiBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgfTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlQ291bnRlciAoZ2V0U2VsZWN0b3IsIFNlbGVjdG9yQnVpbGRlcikge1xuICAgIGNvbnN0IGJ1aWxkZXIgID0gbmV3IFNlbGVjdG9yQnVpbGRlcihnZXRTZWxlY3RvcigpLCB7IGNvdW50ZXJNb2RlOiB0cnVlIH0sIHsgaW5zdGFudGlhdGlvbjogJ1NlbGVjdG9yJyB9KTtcbiAgICBjb25zdCBjb3VudGVyICA9IGJ1aWxkZXIuZ2V0RnVuY3Rpb24oKTtcbiAgICBjb25zdCBjYWxsc2l0ZSA9IGdldENhbGxzaXRlRm9yTWV0aG9kKCdnZXQnKTtcblxuICAgIHJldHVybiBhc3luYyAoKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXR1cm4gYXdhaXQgY291bnRlcigpO1xuICAgICAgICB9XG5cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgZXJyLmNhbGxzaXRlID0gY2FsbHNpdGU7XG4gICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgIH1cbiAgICB9O1xufVxuXG5mdW5jdGlvbiBhZGRDb3VudGVyUHJvcGVydGllcyAoeyBvYmosIGdldFNlbGVjdG9yLCBTZWxlY3RvckJ1aWxkZXIgfSkge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosICdjb3VudCcsIHtcbiAgICAgICAgZ2V0OiAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBjb3VudGVyID0gY3JlYXRlQ291bnRlcihnZXRTZWxlY3RvciwgU2VsZWN0b3JCdWlsZGVyKTtcblxuICAgICAgICAgICAgcmV0dXJuIFJlRXhlY3V0YWJsZVByb21pc2UuZnJvbUZuKCgpID0+IGNvdW50ZXIoKSk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosICdleGlzdHMnLCB7XG4gICAgICAgIGdldDogKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgY291bnRlciA9IGNyZWF0ZUNvdW50ZXIoZ2V0U2VsZWN0b3IsIFNlbGVjdG9yQnVpbGRlcik7XG5cbiAgICAgICAgICAgIHJldHVybiBSZUV4ZWN1dGFibGVQcm9taXNlLmZyb21Gbihhc3luYyAoKSA9PiBhd2FpdCBjb3VudGVyKCkgPiAwKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBjb252ZXJ0RmlsdGVyVG9DbGllbnRGdW5jdGlvbklmTmVjZXNzYXJ5IChjYWxsc2l0ZU5hbWUsIGZpbHRlciwgZGVwZW5kZW5jaWVzKSB7XG4gICAgaWYgKHR5cGVvZiBmaWx0ZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgY29uc3QgYnVpbGRlciA9IGZpbHRlcltjbGllbnRGdW5jdGlvbkJ1aWxkZXJTeW1ib2xdO1xuICAgICAgICBjb25zdCBmbiAgICAgID0gYnVpbGRlciA/IGJ1aWxkZXIuZm4gOiBmaWx0ZXI7XG4gICAgICAgIGNvbnN0IG9wdGlvbnMgPSBidWlsZGVyID8gYXNzaWduKHt9LCBidWlsZGVyLm9wdGlvbnMsIHsgZGVwZW5kZW5jaWVzIH0pIDogeyBkZXBlbmRlbmNpZXMgfTtcblxuICAgICAgICByZXR1cm4gKG5ldyBDbGllbnRGdW5jdGlvbkJ1aWxkZXIoZm4sIG9wdGlvbnMsIHsgaW5zdGFudGlhdGlvbjogY2FsbHNpdGVOYW1lIH0pKS5nZXRGdW5jdGlvbigpO1xuICAgIH1cblxuICAgIHJldHVybiBmaWx0ZXI7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZURlcml2YXRpdmVTZWxlY3RvcldpdGhGaWx0ZXIgKHsgZ2V0U2VsZWN0b3IsIFNlbGVjdG9yQnVpbGRlciwgc2VsZWN0b3JGbiwgYXBpRm4sIGZpbHRlciwgYWRkaXRpb25hbERlcGVuZGVuY2llcyB9KSB7XG4gICAgY29uc3QgY29sbGVjdGlvbk1vZGVTZWxlY3RvckJ1aWxkZXIgPSBuZXcgU2VsZWN0b3JCdWlsZGVyKGdldFNlbGVjdG9yKCksIHsgY29sbGVjdGlvbk1vZGU6IHRydWUgfSk7XG4gICAgY29uc3QgY3VzdG9tRE9NUHJvcGVydGllcyAgICAgICAgICAgPSBjb2xsZWN0aW9uTW9kZVNlbGVjdG9yQnVpbGRlci5vcHRpb25zLmN1c3RvbURPTVByb3BlcnRpZXM7XG4gICAgY29uc3QgY3VzdG9tTWV0aG9kcyAgICAgICAgICAgICAgICAgPSBjb2xsZWN0aW9uTW9kZVNlbGVjdG9yQnVpbGRlci5vcHRpb25zLmN1c3RvbU1ldGhvZHM7XG5cbiAgICBsZXQgZGVwZW5kZW5jaWVzID0ge1xuICAgICAgICBzZWxlY3RvcjogICAgY29sbGVjdGlvbk1vZGVTZWxlY3RvckJ1aWxkZXIuZ2V0RnVuY3Rpb24oKSxcbiAgICAgICAgZmlsdGVyOiAgICAgIGZpbHRlcixcbiAgICAgICAgZmlsdGVyTm9kZXM6IGZpbHRlck5vZGVzXG4gICAgfTtcblxuICAgIGNvbnN0IHsgYm91bmRUZXN0UnVuLCB0aW1lb3V0LCB2aXNpYmlsaXR5Q2hlY2ssIGFwaUZuQ2hhaW4gfSA9IGNvbGxlY3Rpb25Nb2RlU2VsZWN0b3JCdWlsZGVyLm9wdGlvbnM7XG5cbiAgICBkZXBlbmRlbmNpZXMgPSBhc3NpZ24oZGVwZW5kZW5jaWVzLCBhZGRpdGlvbmFsRGVwZW5kZW5jaWVzKTtcblxuICAgIGNvbnN0IGJ1aWxkZXIgPSBuZXcgU2VsZWN0b3JCdWlsZGVyKHNlbGVjdG9yRm4sIHtcbiAgICAgICAgZGVwZW5kZW5jaWVzLFxuICAgICAgICBjdXN0b21ET01Qcm9wZXJ0aWVzLFxuICAgICAgICBjdXN0b21NZXRob2RzLFxuICAgICAgICBib3VuZFRlc3RSdW4sXG4gICAgICAgIHRpbWVvdXQsXG4gICAgICAgIHZpc2liaWxpdHlDaGVjayxcbiAgICAgICAgYXBpRm5DaGFpbixcbiAgICAgICAgYXBpRm5cbiAgICB9LCB7IGluc3RhbnRpYXRpb246ICdTZWxlY3RvcicgfSk7XG5cbiAgICByZXR1cm4gYnVpbGRlci5nZXRGdW5jdGlvbigpO1xufVxuXG5jb25zdCBmaWx0ZXJCeVRleHQgPSBjb252ZXJ0RmlsdGVyVG9DbGllbnRGdW5jdGlvbklmTmVjZXNzYXJ5KCdmaWx0ZXInLCBzZWxlY3RvclRleHRGaWx0ZXIpO1xuY29uc3QgZmlsdGVyQnlBdHRyID0gY29udmVydEZpbHRlclRvQ2xpZW50RnVuY3Rpb25JZk5lY2Vzc2FyeSgnZmlsdGVyJywgc2VsZWN0b3JBdHRyaWJ1dGVGaWx0ZXIpO1xuXG5mdW5jdGlvbiBlbnN1cmVSZWdFeHBDb250ZXh0IChzdHIpIHtcbiAgICAvLyBOT1RFOiBpZiBhIHJlZ2V4cCBpcyBjcmVhdGVkIGluIGEgc2VwYXJhdGUgY29udGV4dCAodmlhIHRoZSAndm0nIG1vZHVsZSkgd2VcbiAgICAvLyBzaG91bGQgd3JhcCBpdCB3aXRoIG5ldyBSZWdFeHAoKSB0byBtYWtlIHRoZSBgaW5zdGFuY2VvZiBSZWdFeHBgIGNoZWNrIHN1Y2Nlc3NmdWwuXG4gICAgaWYgKHR5cGVvZiBzdHIgIT09ICdzdHJpbmcnICYmICEoc3RyIGluc3RhbmNlb2YgUmVnRXhwKSlcbiAgICAgICAgcmV0dXJuIG5ldyBSZWdFeHAoc3RyKTtcblxuICAgIHJldHVybiBzdHI7XG59XG5cbmZ1bmN0aW9uIGFkZEZpbHRlck1ldGhvZHMgKG9wdGlvbnMpIHtcbiAgICBjb25zdCB7IG9iaiwgZ2V0U2VsZWN0b3IsIFNlbGVjdG9yQnVpbGRlciB9ID0gb3B0aW9ucztcblxuICAgIG9iai5udGggPSBpbmRleCA9PiB7XG4gICAgICAgIGFzc2VydFR5cGUoaXMubnVtYmVyLCAnbnRoJywgJ1wiaW5kZXhcIiBhcmd1bWVudCcsIGluZGV4KTtcblxuICAgICAgICBjb25zdCBhcGlGbiAgID0gcHJlcGFyZUFwaUZuQXJncygnbnRoJywgaW5kZXgpO1xuICAgICAgICBjb25zdCBidWlsZGVyID0gbmV3IFNlbGVjdG9yQnVpbGRlcihnZXRTZWxlY3RvcigpLCB7IGluZGV4LCBhcGlGbiB9LCB7IGluc3RhbnRpYXRpb246ICdTZWxlY3RvcicgfSk7XG5cbiAgICAgICAgcmV0dXJuIGJ1aWxkZXIuZ2V0RnVuY3Rpb24oKTtcbiAgICB9O1xuXG4gICAgb2JqLndpdGhUZXh0ID0gdGV4dCA9PiB7XG4gICAgICAgIGFzc2VydFR5cGUoW2lzLnN0cmluZywgaXMucmVnRXhwXSwgJ3dpdGhUZXh0JywgJ1widGV4dFwiIGFyZ3VtZW50JywgdGV4dCk7XG5cbiAgICAgICAgY29uc3QgYXBpRm4gPSBwcmVwYXJlQXBpRm5BcmdzKCd3aXRoVGV4dCcsIHRleHQpO1xuXG4gICAgICAgIHRleHQgPSBlbnN1cmVSZWdFeHBDb250ZXh0KHRleHQpO1xuXG4gICAgICAgIGNvbnN0IHNlbGVjdG9yRm4gPSAoKSA9PiB7XG4gICAgICAgICAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby11bmRlZiAqL1xuICAgICAgICAgICAgY29uc3Qgbm9kZXMgPSBzZWxlY3RvcigpO1xuXG4gICAgICAgICAgICBpZiAoIW5vZGVzLmxlbmd0aClcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcblxuICAgICAgICAgICAgcmV0dXJuIGZpbHRlck5vZGVzKG5vZGVzLCBmaWx0ZXIsIGRvY3VtZW50LCB2b2lkIDAsIHRleHRSZSk7XG4gICAgICAgICAgICAvKiBlc2xpbnQtZW5hYmxlIG5vLXVuZGVmICovXG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgYXJncyA9IGdldERlcml2YXRpdmVTZWxlY3RvckFyZ3Mob3B0aW9ucywgc2VsZWN0b3JGbiwgYXBpRm4sIGZpbHRlckJ5VGV4dCwgeyB0ZXh0UmU6IG1ha2VSZWdFeHAodGV4dCkgfSk7XG5cbiAgICAgICAgcmV0dXJuIGNyZWF0ZURlcml2YXRpdmVTZWxlY3RvcldpdGhGaWx0ZXIoYXJncyk7XG4gICAgfTtcblxuICAgIG9iai53aXRoRXhhY3RUZXh0ID0gdGV4dCA9PiB7XG4gICAgICAgIGFzc2VydFR5cGUoaXMuc3RyaW5nLCAnd2l0aEV4YWN0VGV4dCcsICdcInRleHRcIiBhcmd1bWVudCcsIHRleHQpO1xuXG4gICAgICAgIGNvbnN0IHNlbGVjdG9yRm4gPSAoKSA9PiB7XG4gICAgICAgICAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby11bmRlZiAqL1xuICAgICAgICAgICAgY29uc3Qgbm9kZXMgPSBzZWxlY3RvcigpO1xuXG4gICAgICAgICAgICBpZiAoIW5vZGVzLmxlbmd0aClcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcblxuICAgICAgICAgICAgcmV0dXJuIGZpbHRlck5vZGVzKG5vZGVzLCBmaWx0ZXIsIGRvY3VtZW50LCB2b2lkIDAsIGV4YWN0VGV4dCk7XG4gICAgICAgICAgICAvKiBlc2xpbnQtZW5hYmxlIG5vLXVuZGVmICovXG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgYXBpRm4gPSBwcmVwYXJlQXBpRm5BcmdzKCd3aXRoRXhhY3RUZXh0JywgdGV4dCk7XG4gICAgICAgIGNvbnN0IGFyZ3MgID0gZ2V0RGVyaXZhdGl2ZVNlbGVjdG9yQXJncyhvcHRpb25zLCBzZWxlY3RvckZuLCBhcGlGbiwgZmlsdGVyQnlUZXh0LCB7IGV4YWN0VGV4dDogdGV4dCB9KTtcblxuICAgICAgICByZXR1cm4gY3JlYXRlRGVyaXZhdGl2ZVNlbGVjdG9yV2l0aEZpbHRlcihhcmdzKTtcbiAgICB9O1xuXG4gICAgb2JqLndpdGhBdHRyaWJ1dGUgPSAoYXR0ck5hbWUsIGF0dHJWYWx1ZSkgPT4ge1xuICAgICAgICBhc3NlcnRUeXBlKFtpcy5zdHJpbmcsIGlzLnJlZ0V4cF0sICd3aXRoQXR0cmlidXRlJywgJ1wiYXR0ck5hbWVcIiBhcmd1bWVudCcsIGF0dHJOYW1lKTtcblxuICAgICAgICBjb25zdCBhcGlGbiA9IHByZXBhcmVBcGlGbkFyZ3MoJ3dpdGhBdHRyaWJ1dGUnLCBhdHRyTmFtZSwgYXR0clZhbHVlKTtcblxuICAgICAgICBhdHRyTmFtZSA9IGVuc3VyZVJlZ0V4cENvbnRleHQoYXR0ck5hbWUpO1xuXG4gICAgICAgIGlmIChhdHRyVmFsdWUgIT09IHZvaWQgMCkge1xuICAgICAgICAgICAgYXNzZXJ0VHlwZShbaXMuc3RyaW5nLCBpcy5yZWdFeHBdLCAnd2l0aEF0dHJpYnV0ZScsICdcImF0dHJWYWx1ZVwiIGFyZ3VtZW50JywgYXR0clZhbHVlKTtcbiAgICAgICAgICAgIGF0dHJWYWx1ZSA9IGVuc3VyZVJlZ0V4cENvbnRleHQoYXR0clZhbHVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHNlbGVjdG9yRm4gPSAoKSA9PiB7XG4gICAgICAgICAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby11bmRlZiAqL1xuICAgICAgICAgICAgY29uc3Qgbm9kZXMgPSBzZWxlY3RvcigpO1xuXG4gICAgICAgICAgICBpZiAoIW5vZGVzLmxlbmd0aClcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcblxuICAgICAgICAgICAgcmV0dXJuIGZpbHRlck5vZGVzKG5vZGVzLCBmaWx0ZXIsIGRvY3VtZW50LCB2b2lkIDAsIGF0dHJOYW1lLCBhdHRyVmFsdWUpO1xuICAgICAgICAgICAgLyogZXNsaW50LWVuYWJsZSBuby11bmRlZiAqL1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IGFyZ3MgPSBnZXREZXJpdmF0aXZlU2VsZWN0b3JBcmdzKG9wdGlvbnMsIHNlbGVjdG9yRm4sIGFwaUZuLCBmaWx0ZXJCeUF0dHIsIHtcbiAgICAgICAgICAgIGF0dHJOYW1lLFxuICAgICAgICAgICAgYXR0clZhbHVlXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBjcmVhdGVEZXJpdmF0aXZlU2VsZWN0b3JXaXRoRmlsdGVyKGFyZ3MpO1xuICAgIH07XG5cbiAgICBvYmouZmlsdGVyID0gKGZpbHRlciwgZGVwZW5kZW5jaWVzKSA9PiB7XG4gICAgICAgIGFzc2VydFR5cGUoW2lzLnN0cmluZywgaXMuZnVuY3Rpb25dLCAnZmlsdGVyJywgJ1wiZmlsdGVyXCIgYXJndW1lbnQnLCBmaWx0ZXIpO1xuXG4gICAgICAgIGNvbnN0IGFwaUZuID0gcHJlcGFyZUFwaUZuQXJncygnZmlsdGVyJywgZmlsdGVyKTtcblxuICAgICAgICBmaWx0ZXIgPSBjb252ZXJ0RmlsdGVyVG9DbGllbnRGdW5jdGlvbklmTmVjZXNzYXJ5KCdmaWx0ZXInLCBmaWx0ZXIsIGRlcGVuZGVuY2llcyk7XG5cbiAgICAgICAgY29uc3Qgc2VsZWN0b3JGbiA9ICgpID0+IHtcbiAgICAgICAgICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLXVuZGVmICovXG4gICAgICAgICAgICBjb25zdCBub2RlcyA9IHNlbGVjdG9yKCk7XG5cbiAgICAgICAgICAgIGlmICghbm9kZXMubGVuZ3RoKVxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuXG4gICAgICAgICAgICByZXR1cm4gZmlsdGVyTm9kZXMobm9kZXMsIGZpbHRlciwgZG9jdW1lbnQsIHZvaWQgMCk7XG4gICAgICAgICAgICAvKiBlc2xpbnQtZW5hYmxlIG5vLXVuZGVmICovXG4gICAgICAgIH07XG5cblxuICAgICAgICBjb25zdCBhcmdzID0gZ2V0RGVyaXZhdGl2ZVNlbGVjdG9yQXJncyhvcHRpb25zLCBzZWxlY3RvckZuLCBhcGlGbiwgZmlsdGVyKTtcblxuICAgICAgICByZXR1cm4gY3JlYXRlRGVyaXZhdGl2ZVNlbGVjdG9yV2l0aEZpbHRlcihhcmdzKTtcbiAgICB9O1xuXG4gICAgb2JqLmZpbHRlclZpc2libGUgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGFwaUZuICAgPSBwcmVwYXJlQXBpRm5BcmdzKCdmaWx0ZXJWaXNpYmxlJyk7XG4gICAgICAgIGNvbnN0IGJ1aWxkZXIgPSBuZXcgU2VsZWN0b3JCdWlsZGVyKGdldFNlbGVjdG9yKCksIHsgZmlsdGVyVmlzaWJsZTogdHJ1ZSwgYXBpRm4gfSwgeyBpbnN0YW50aWF0aW9uOiAnU2VsZWN0b3InIH0pO1xuXG4gICAgICAgIHJldHVybiBidWlsZGVyLmdldEZ1bmN0aW9uKCk7XG4gICAgfTtcblxuICAgIG9iai5maWx0ZXJIaWRkZW4gPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGFwaUZuICAgPSBwcmVwYXJlQXBpRm5BcmdzKCdmaWx0ZXJIaWRkZW4nKTtcbiAgICAgICAgY29uc3QgYnVpbGRlciA9IG5ldyBTZWxlY3RvckJ1aWxkZXIoZ2V0U2VsZWN0b3IoKSwgeyBmaWx0ZXJIaWRkZW46IHRydWUsIGFwaUZuIH0sIHsgaW5zdGFudGlhdGlvbjogJ1NlbGVjdG9yJyB9KTtcblxuICAgICAgICByZXR1cm4gYnVpbGRlci5nZXRGdW5jdGlvbigpO1xuICAgIH07XG59XG5cbmZ1bmN0aW9uIGFkZEN1c3RvbURPTVByb3BlcnRpZXNNZXRob2QgKHsgb2JqLCBnZXRTZWxlY3RvciwgU2VsZWN0b3JCdWlsZGVyIH0pIHtcbiAgICBvYmouYWRkQ3VzdG9tRE9NUHJvcGVydGllcyA9IGN1c3RvbURPTVByb3BlcnRpZXMgPT4ge1xuICAgICAgICBhc3NlcnRBZGRDdXN0b21ET01Qcm9wZXJ0aWVzT3B0aW9ucyhjdXN0b21ET01Qcm9wZXJ0aWVzKTtcblxuICAgICAgICBjb25zdCBidWlsZGVyID0gbmV3IFNlbGVjdG9yQnVpbGRlcihnZXRTZWxlY3RvcigpLCB7IGN1c3RvbURPTVByb3BlcnRpZXMgfSwgeyBpbnN0YW50aWF0aW9uOiAnU2VsZWN0b3InIH0pO1xuXG4gICAgICAgIHJldHVybiBidWlsZGVyLmdldEZ1bmN0aW9uKCk7XG4gICAgfTtcbn1cblxuZnVuY3Rpb24gYWRkQ3VzdG9tTWV0aG9kc01ldGhvZCAoeyBvYmosIGdldFNlbGVjdG9yLCBTZWxlY3RvckJ1aWxkZXIgfSkge1xuICAgIG9iai5hZGRDdXN0b21NZXRob2RzID0gZnVuY3Rpb24gKG1ldGhvZHMsIG9wdHMpIHtcbiAgICAgICAgYXNzZXJ0QWRkQ3VzdG9tTWV0aG9kcyhtZXRob2RzLCBvcHRzKTtcblxuICAgICAgICBjb25zdCBjdXN0b21NZXRob2RzID0ge307XG5cbiAgICAgICAgT2JqZWN0LmtleXMobWV0aG9kcykuZm9yRWFjaChtZXRob2ROYW1lID0+IHtcbiAgICAgICAgICAgIGN1c3RvbU1ldGhvZHNbbWV0aG9kTmFtZV0gPSB7XG4gICAgICAgICAgICAgICAgbWV0aG9kOiAgICAgICAgIG1ldGhvZHNbbWV0aG9kTmFtZV0sXG4gICAgICAgICAgICAgICAgcmV0dXJuRE9NTm9kZXM6IG9wdHMgJiYgISFvcHRzLnJldHVybkRPTU5vZGVzXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBidWlsZGVyID0gbmV3IFNlbGVjdG9yQnVpbGRlcihnZXRTZWxlY3RvcigpLCB7IGN1c3RvbU1ldGhvZHMgfSwgeyBpbnN0YW50aWF0aW9uOiAnU2VsZWN0b3InIH0pO1xuXG4gICAgICAgIHJldHVybiBidWlsZGVyLmdldEZ1bmN0aW9uKCk7XG4gICAgfTtcbn1cblxuZnVuY3Rpb24gYWRkSGllcmFyY2hpY2FsU2VsZWN0b3JzIChvcHRpb25zKSB7XG4gICAgY29uc3QgeyBvYmogfSA9IG9wdGlvbnM7XG5cbiAgICAvLyBGaW5kXG4gICAgb2JqLmZpbmQgPSAoZmlsdGVyLCBkZXBlbmRlbmNpZXMpID0+IHtcbiAgICAgICAgYXNzZXJ0VHlwZShbaXMuc3RyaW5nLCBpcy5mdW5jdGlvbl0sICdmaW5kJywgJ1wiZmlsdGVyXCIgYXJndW1lbnQnLCBmaWx0ZXIpO1xuXG4gICAgICAgIGNvbnN0IGFwaUZuID0gcHJlcGFyZUFwaUZuQXJncygnZmluZCcsIGZpbHRlcik7XG5cbiAgICAgICAgZmlsdGVyID0gY29udmVydEZpbHRlclRvQ2xpZW50RnVuY3Rpb25JZk5lY2Vzc2FyeSgnZmluZCcsIGZpbHRlciwgZGVwZW5kZW5jaWVzKTtcblxuICAgICAgICBjb25zdCBzZWxlY3RvckZuID0gKCkgPT4ge1xuICAgICAgICAgICAgLyogZXNsaW50LWRpc2FibGUgbm8tdW5kZWYgKi9cbiAgICAgICAgICAgIHJldHVybiBleHBhbmRTZWxlY3RvclJlc3VsdHMoc2VsZWN0b3IsIG5vZGUgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgZmlsdGVyID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHlwZW9mIG5vZGUucXVlcnlTZWxlY3RvckFsbCA9PT0gJ2Z1bmN0aW9uJyA/XG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlLnF1ZXJ5U2VsZWN0b3JBbGwoZmlsdGVyKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICBudWxsO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdHMgPSBbXTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IHZpc2l0Tm9kZSA9IGN1cnJlbnROb2RlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY25MZW5ndGggPSBjdXJyZW50Tm9kZS5jaGlsZE5vZGVzLmxlbmd0aDtcblxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNuTGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkID0gY3VycmVudE5vZGUuY2hpbGROb2Rlc1tpXTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKGNoaWxkKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgdmlzaXROb2RlKGNoaWxkKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICB2aXNpdE5vZGUobm9kZSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gZmlsdGVyTm9kZXMocmVzdWx0cywgZmlsdGVyLCBudWxsLCBub2RlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLyogZXNsaW50LWVuYWJsZSBuby11bmRlZiAqL1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IGFyZ3MgPSBnZXREZXJpdmF0aXZlU2VsZWN0b3JBcmdzKG9wdGlvbnMsIHNlbGVjdG9yRm4sIGFwaUZuLCBmaWx0ZXIsIHsgZXhwYW5kU2VsZWN0b3JSZXN1bHRzIH0pO1xuXG4gICAgICAgIHJldHVybiBjcmVhdGVEZXJpdmF0aXZlU2VsZWN0b3JXaXRoRmlsdGVyKGFyZ3MpO1xuICAgIH07XG5cbiAgICAvLyBQYXJlbnRcbiAgICBvYmoucGFyZW50ID0gKGZpbHRlciwgZGVwZW5kZW5jaWVzKSA9PiB7XG4gICAgICAgIGlmIChmaWx0ZXIgIT09IHZvaWQgMClcbiAgICAgICAgICAgIGFzc2VydFR5cGUoW2lzLnN0cmluZywgaXMuZnVuY3Rpb24sIGlzLm51bWJlcl0sICdwYXJlbnQnLCAnXCJmaWx0ZXJcIiBhcmd1bWVudCcsIGZpbHRlcik7XG5cbiAgICAgICAgY29uc3QgYXBpRm4gPSBwcmVwYXJlQXBpRm5BcmdzKCdwYXJlbnQnLCBmaWx0ZXIpO1xuXG4gICAgICAgIGZpbHRlciA9IGNvbnZlcnRGaWx0ZXJUb0NsaWVudEZ1bmN0aW9uSWZOZWNlc3NhcnkoJ2ZpbmQnLCBmaWx0ZXIsIGRlcGVuZGVuY2llcyk7XG5cbiAgICAgICAgY29uc3Qgc2VsZWN0b3JGbiA9ICgpID0+IHtcbiAgICAgICAgICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLXVuZGVmICovXG4gICAgICAgICAgICByZXR1cm4gZXhwYW5kU2VsZWN0b3JSZXN1bHRzKHNlbGVjdG9yLCBub2RlID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBwYXJlbnRzID0gW107XG5cbiAgICAgICAgICAgICAgICBmb3IgKGxldCBwYXJlbnQgPSBub2RlLnBhcmVudE5vZGU7IHBhcmVudDsgcGFyZW50ID0gcGFyZW50LnBhcmVudE5vZGUpXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudHMucHVzaChwYXJlbnQpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZpbHRlciAhPT0gdm9pZCAwID8gZmlsdGVyTm9kZXMocGFyZW50cywgZmlsdGVyLCBkb2N1bWVudCwgbm9kZSkgOiBwYXJlbnRzO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvKiBlc2xpbnQtZW5hYmxlIG5vLXVuZGVmICovXG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgYXJncyA9IGdldERlcml2YXRpdmVTZWxlY3RvckFyZ3Mob3B0aW9ucywgc2VsZWN0b3JGbiwgYXBpRm4sIGZpbHRlciwgeyBleHBhbmRTZWxlY3RvclJlc3VsdHMgfSk7XG5cbiAgICAgICAgcmV0dXJuIGNyZWF0ZURlcml2YXRpdmVTZWxlY3RvcldpdGhGaWx0ZXIoYXJncyk7XG4gICAgfTtcblxuICAgIC8vIENoaWxkXG4gICAgb2JqLmNoaWxkID0gKGZpbHRlciwgZGVwZW5kZW5jaWVzKSA9PiB7XG4gICAgICAgIGlmIChmaWx0ZXIgIT09IHZvaWQgMClcbiAgICAgICAgICAgIGFzc2VydFR5cGUoW2lzLnN0cmluZywgaXMuZnVuY3Rpb24sIGlzLm51bWJlcl0sICdjaGlsZCcsICdcImZpbHRlclwiIGFyZ3VtZW50JywgZmlsdGVyKTtcblxuICAgICAgICBjb25zdCBhcGlGbiA9IHByZXBhcmVBcGlGbkFyZ3MoJ2NoaWxkJywgZmlsdGVyKTtcblxuICAgICAgICBmaWx0ZXIgPSBjb252ZXJ0RmlsdGVyVG9DbGllbnRGdW5jdGlvbklmTmVjZXNzYXJ5KCdmaW5kJywgZmlsdGVyLCBkZXBlbmRlbmNpZXMpO1xuXG4gICAgICAgIGNvbnN0IHNlbGVjdG9yRm4gPSAoKSA9PiB7XG4gICAgICAgICAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby11bmRlZiAqL1xuICAgICAgICAgICAgcmV0dXJuIGV4cGFuZFNlbGVjdG9yUmVzdWx0cyhzZWxlY3Rvciwgbm9kZSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2hpbGRFbGVtZW50cyA9IFtdO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNuTGVuZ3RoICAgICAgPSBub2RlLmNoaWxkTm9kZXMubGVuZ3RoO1xuXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjbkxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkID0gbm9kZS5jaGlsZE5vZGVzW2ldO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZC5ub2RlVHlwZSA9PT0gMSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkRWxlbWVudHMucHVzaChjaGlsZCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZpbHRlciAhPT0gdm9pZCAwID8gZmlsdGVyTm9kZXMoY2hpbGRFbGVtZW50cywgZmlsdGVyLCBub2RlLCBub2RlKSA6IGNoaWxkRWxlbWVudHM7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8qIGVzbGludC1lbmFibGUgbm8tdW5kZWYgKi9cbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBhcmdzID0gZ2V0RGVyaXZhdGl2ZVNlbGVjdG9yQXJncyhvcHRpb25zLCBzZWxlY3RvckZuLCBhcGlGbiwgZmlsdGVyLCB7IGV4cGFuZFNlbGVjdG9yUmVzdWx0cyB9KTtcblxuICAgICAgICByZXR1cm4gY3JlYXRlRGVyaXZhdGl2ZVNlbGVjdG9yV2l0aEZpbHRlcihhcmdzKTtcbiAgICB9O1xuXG4gICAgLy8gU2libGluZ1xuICAgIG9iai5zaWJsaW5nID0gKGZpbHRlciwgZGVwZW5kZW5jaWVzKSA9PiB7XG4gICAgICAgIGlmIChmaWx0ZXIgIT09IHZvaWQgMClcbiAgICAgICAgICAgIGFzc2VydFR5cGUoW2lzLnN0cmluZywgaXMuZnVuY3Rpb24sIGlzLm51bWJlcl0sICdzaWJsaW5nJywgJ1wiZmlsdGVyXCIgYXJndW1lbnQnLCBmaWx0ZXIpO1xuXG4gICAgICAgIGNvbnN0IGFwaUZuID0gcHJlcGFyZUFwaUZuQXJncygnc2libGluZycsIGZpbHRlcik7XG5cbiAgICAgICAgZmlsdGVyID0gY29udmVydEZpbHRlclRvQ2xpZW50RnVuY3Rpb25JZk5lY2Vzc2FyeSgnZmluZCcsIGZpbHRlciwgZGVwZW5kZW5jaWVzKTtcblxuICAgICAgICBjb25zdCBzZWxlY3RvckZuID0gKCkgPT4ge1xuICAgICAgICAgICAgLyogZXNsaW50LWRpc2FibGUgbm8tdW5kZWYgKi9cbiAgICAgICAgICAgIHJldHVybiBleHBhbmRTZWxlY3RvclJlc3VsdHMoc2VsZWN0b3IsIG5vZGUgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHBhcmVudCA9IG5vZGUucGFyZW50Tm9kZTtcblxuICAgICAgICAgICAgICAgIGlmICghcGFyZW50KVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcblxuICAgICAgICAgICAgICAgIGNvbnN0IHNpYmxpbmdzID0gW107XG4gICAgICAgICAgICAgICAgY29uc3QgY25MZW5ndGggPSBwYXJlbnQuY2hpbGROb2Rlcy5sZW5ndGg7XG5cbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNuTGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2hpbGQgPSBwYXJlbnQuY2hpbGROb2Rlc1tpXTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGQubm9kZVR5cGUgPT09IDEgJiYgY2hpbGQgIT09IG5vZGUpXG4gICAgICAgICAgICAgICAgICAgICAgICBzaWJsaW5ncy5wdXNoKGNoaWxkKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gZmlsdGVyICE9PSB2b2lkIDAgPyBmaWx0ZXJOb2RlcyhzaWJsaW5ncywgZmlsdGVyLCBwYXJlbnQsIG5vZGUpIDogc2libGluZ3M7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8qIGVzbGludC1lbmFibGUgbm8tdW5kZWYgKi9cbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBhcmdzID0gZ2V0RGVyaXZhdGl2ZVNlbGVjdG9yQXJncyhvcHRpb25zLCBzZWxlY3RvckZuLCBhcGlGbiwgZmlsdGVyLCB7IGV4cGFuZFNlbGVjdG9yUmVzdWx0cyB9KTtcblxuICAgICAgICByZXR1cm4gY3JlYXRlRGVyaXZhdGl2ZVNlbGVjdG9yV2l0aEZpbHRlcihhcmdzKTtcbiAgICB9O1xuXG4gICAgLy8gTmV4dCBzaWJsaW5nXG4gICAgb2JqLm5leHRTaWJsaW5nID0gKGZpbHRlciwgZGVwZW5kZW5jaWVzKSA9PiB7XG4gICAgICAgIGlmIChmaWx0ZXIgIT09IHZvaWQgMClcbiAgICAgICAgICAgIGFzc2VydFR5cGUoW2lzLnN0cmluZywgaXMuZnVuY3Rpb24sIGlzLm51bWJlcl0sICduZXh0U2libGluZycsICdcImZpbHRlclwiIGFyZ3VtZW50JywgZmlsdGVyKTtcblxuICAgICAgICBjb25zdCBhcGlGbiA9IHByZXBhcmVBcGlGbkFyZ3MoJ25leHRTaWJsaW5nJywgZmlsdGVyKTtcblxuICAgICAgICBmaWx0ZXIgPSBjb252ZXJ0RmlsdGVyVG9DbGllbnRGdW5jdGlvbklmTmVjZXNzYXJ5KCdmaW5kJywgZmlsdGVyLCBkZXBlbmRlbmNpZXMpO1xuXG4gICAgICAgIGNvbnN0IHNlbGVjdG9yRm4gPSAoKSA9PiB7XG4gICAgICAgICAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby11bmRlZiAqL1xuICAgICAgICAgICAgcmV0dXJuIGV4cGFuZFNlbGVjdG9yUmVzdWx0cyhzZWxlY3Rvciwgbm9kZSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgcGFyZW50ID0gbm9kZS5wYXJlbnROb2RlO1xuXG4gICAgICAgICAgICAgICAgaWYgKCFwYXJlbnQpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuXG4gICAgICAgICAgICAgICAgY29uc3Qgc2libGluZ3MgPSBbXTtcbiAgICAgICAgICAgICAgICBjb25zdCBjbkxlbmd0aCA9IHBhcmVudC5jaGlsZE5vZGVzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICBsZXQgYWZ0ZXJOb2RlICA9IGZhbHNlO1xuXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjbkxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkID0gcGFyZW50LmNoaWxkTm9kZXNbaV07XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkID09PSBub2RlKVxuICAgICAgICAgICAgICAgICAgICAgICAgYWZ0ZXJOb2RlID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChhZnRlck5vZGUgJiYgY2hpbGQubm9kZVR5cGUgPT09IDEpXG4gICAgICAgICAgICAgICAgICAgICAgICBzaWJsaW5ncy5wdXNoKGNoaWxkKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gZmlsdGVyICE9PSB2b2lkIDAgPyBmaWx0ZXJOb2RlcyhzaWJsaW5ncywgZmlsdGVyLCBwYXJlbnQsIG5vZGUpIDogc2libGluZ3M7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8qIGVzbGludC1lbmFibGUgbm8tdW5kZWYgKi9cbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBhcmdzID0gZ2V0RGVyaXZhdGl2ZVNlbGVjdG9yQXJncyhvcHRpb25zLCBzZWxlY3RvckZuLCBhcGlGbiwgZmlsdGVyLCB7IGV4cGFuZFNlbGVjdG9yUmVzdWx0cyB9KTtcblxuICAgICAgICByZXR1cm4gY3JlYXRlRGVyaXZhdGl2ZVNlbGVjdG9yV2l0aEZpbHRlcihhcmdzKTtcbiAgICB9O1xuXG4gICAgLy8gUHJldiBzaWJsaW5nXG4gICAgb2JqLnByZXZTaWJsaW5nID0gKGZpbHRlciwgZGVwZW5kZW5jaWVzKSA9PiB7XG4gICAgICAgIGlmIChmaWx0ZXIgIT09IHZvaWQgMClcbiAgICAgICAgICAgIGFzc2VydFR5cGUoW2lzLnN0cmluZywgaXMuZnVuY3Rpb24sIGlzLm51bWJlcl0sICdwcmV2U2libGluZycsICdcImZpbHRlclwiIGFyZ3VtZW50JywgZmlsdGVyKTtcblxuICAgICAgICBjb25zdCBhcGlGbiA9IHByZXBhcmVBcGlGbkFyZ3MoJ3ByZXZTaWJsaW5nJywgZmlsdGVyKTtcblxuICAgICAgICBmaWx0ZXIgPSBjb252ZXJ0RmlsdGVyVG9DbGllbnRGdW5jdGlvbklmTmVjZXNzYXJ5KCdmaW5kJywgZmlsdGVyLCBkZXBlbmRlbmNpZXMpO1xuXG4gICAgICAgIGNvbnN0IHNlbGVjdG9yRm4gPSAoKSA9PiB7XG4gICAgICAgICAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby11bmRlZiAqL1xuICAgICAgICAgICAgcmV0dXJuIGV4cGFuZFNlbGVjdG9yUmVzdWx0cyhzZWxlY3Rvciwgbm9kZSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgcGFyZW50ID0gbm9kZS5wYXJlbnROb2RlO1xuXG4gICAgICAgICAgICAgICAgaWYgKCFwYXJlbnQpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuXG4gICAgICAgICAgICAgICAgY29uc3Qgc2libGluZ3MgPSBbXTtcbiAgICAgICAgICAgICAgICBjb25zdCBjbkxlbmd0aCA9IHBhcmVudC5jaGlsZE5vZGVzLmxlbmd0aDtcblxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY25MZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjaGlsZCA9IHBhcmVudC5jaGlsZE5vZGVzW2ldO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZCA9PT0gbm9kZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZC5ub2RlVHlwZSA9PT0gMSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpYmxpbmdzLnB1c2goY2hpbGQpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiBmaWx0ZXIgIT09IHZvaWQgMCA/IGZpbHRlck5vZGVzKHNpYmxpbmdzLCBmaWx0ZXIsIHBhcmVudCwgbm9kZSkgOiBzaWJsaW5ncztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLyogZXNsaW50LWVuYWJsZSBuby11bmRlZiAqL1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IGFyZ3MgPSBnZXREZXJpdmF0aXZlU2VsZWN0b3JBcmdzKG9wdGlvbnMsIHNlbGVjdG9yRm4sIGFwaUZuLCBmaWx0ZXIsIHsgZXhwYW5kU2VsZWN0b3JSZXN1bHRzIH0pO1xuXG4gICAgICAgIHJldHVybiBjcmVhdGVEZXJpdmF0aXZlU2VsZWN0b3JXaXRoRmlsdGVyKGFyZ3MpO1xuICAgIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhZGRBUEkgKHNlbGVjdG9yLCBnZXRTZWxlY3RvciwgU2VsZWN0b3JCdWlsZGVyLCBjdXN0b21ET01Qcm9wZXJ0aWVzLCBjdXN0b21NZXRob2RzKSB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHsgb2JqOiBzZWxlY3RvciwgZ2V0U2VsZWN0b3IsIFNlbGVjdG9yQnVpbGRlciwgY3VzdG9tRE9NUHJvcGVydGllcywgY3VzdG9tTWV0aG9kcyB9O1xuXG4gICAgYWRkRmlsdGVyTWV0aG9kcyhvcHRpb25zKTtcbiAgICBhZGRIaWVyYXJjaGljYWxTZWxlY3RvcnMob3B0aW9ucyk7XG4gICAgYWRkU25hcHNob3RQcm9wZXJ0eVNob3J0aGFuZHMob3B0aW9ucyk7XG4gICAgYWRkQ3VzdG9tRE9NUHJvcGVydGllc01ldGhvZChvcHRpb25zKTtcbiAgICBhZGRDdXN0b21NZXRob2RzTWV0aG9kKG9wdGlvbnMpO1xuICAgIGFkZENvdW50ZXJQcm9wZXJ0aWVzKG9wdGlvbnMpO1xufVxuIl19
