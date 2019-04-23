'use strict';

exports.__esModule = true;
exports.TestFileParserBase = exports.Test = exports.Fixture = undefined;

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _promisify = require('../../utils/promisify');

var _promisify2 = _interopRequireDefault(_promisify);

var _util = require('util');

var _runtime = require('../../errors/runtime');

var _types = require('../../errors/types');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const readFile = (0, _promisify2.default)(_fs2.default.readFile);

const METHODS_SPECIFYING_NAME = ['only', 'skip'];
const COMPUTED_NAME_TEXT_TMP = '<computed name>(line: %s)';

class Fixture {
    constructor(name, start, end, loc, meta) {
        this.name = name;
        this.loc = loc;
        this.start = start;
        this.end = end;
        this.meta = meta;
        this.tests = [];
    }
}

exports.Fixture = Fixture;
class Test {
    constructor(name, start, end, loc, meta) {
        this.name = name;
        this.loc = loc;
        this.start = start;
        this.end = end;
        this.meta = meta;
    }
}

exports.Test = Test;
class TestFileParserBase {
    constructor(tokenType) {
        this.tokenType = tokenType;
    }

    static formatComputedName(line) {
        return (0, _util.format)(COMPUTED_NAME_TEXT_TMP, line);
    }

    isAsyncFn() /* token */{
        throw new Error('Not implemented');
    }

    getRValue() /* token */{
        throw new Error('Not implemented');
    }

    getFunctionBody() /* token */{
        throw new Error('Not implemented');
    }

    formatFnData() /* name, value, token */{
        throw new Error('Not implemented');
    }

    analyzeMemberExp() /* token */{
        throw new Error('Not implemented');
    }

    formatFnArg() /* arg */{
        throw new Error('Not implemented');
    }

    getFnCall() /* token */{
        throw new Error('Not implemented');
    }

    getTaggedTemplateExp() /* token */{
        throw new Error('Not implemented');
    }

    analyzeFnCall() /* token */{
        throw new Error('Not implemented');
    }

    parse() /* filePath, code */{
        throw new Error('Not implemented');
    }

    getTokenType() /* token */{
        throw new Error('Not implemented');
    }

    getCalleeToken() /* token */{
        throw new Error('Not implemented');
    }

    getMemberFnName() {
        throw new Error('Not implemented');
    }

    getKeyValue() {
        throw new Error('Not implemented');
    }

    getStringValue() {
        throw new Error('Not implemented');
    }

    isApiFn(fn) {
        return fn === 'fixture' || fn === 'test';
    }

    serializeObjExp(token) {
        if (this.getTokenType(token) !== this.tokenType.ObjectLiteralExpression) return {};

        return token.properties.reduce((obj, prop) => {
            var _getKeyValue = this.getKeyValue(prop);

            const key = _getKeyValue.key,
                  value = _getKeyValue.value;


            if (typeof value !== 'string') return {};

            obj[key] = value;

            return obj;
        }, {});
    }

    processMetaArgs(token) {
        if (this.getTokenType(token) !== this.tokenType.CallExpression) return null;

        const args = token.arguments;

        let meta = {};

        if (args.length === 2) {
            const value = this.getStringValue(args[1]);

            if (typeof value !== 'string') return {};

            meta = { [this.formatFnArg(args[0])]: value };
        } else if (args.length === 1) meta = this.serializeObjExp(args[0]);

        return meta;
    }

    getMetaInfo(callStack) {
        return callStack.reduce((metaCalls, exp) => {
            if (this.getTokenType(exp) !== this.tokenType.CallExpression) return metaCalls;

            const callee = this.getCalleeToken(exp);
            const calleeType = this.getTokenType(callee);
            const isCalleeMemberExp = calleeType === this.tokenType.PropertyAccessExpression;

            if (isCalleeMemberExp && this.getMemberFnName(exp) === 'meta') return [this.processMetaArgs(exp)].concat(metaCalls);

            return metaCalls;
        }, []);
    }

    checkExpDefineTargetName(type, apiFn) {
        //NOTE: fixture('fixtureName').chainFn or test('testName').chainFn
        const isDirectCall = type === this.tokenType.Identifier;

        //NOTE: fixture.skip('fixtureName'), test.only('testName') etc.
        const isMemberCall = type === this.tokenType.PropertyAccessExpression && METHODS_SPECIFYING_NAME.indexOf(apiFn) > -1;

        //NOTE: fixture.before().after()('fixtureName'), test.before()`testName`.after() etc.
        const isTailCall = type === this.tokenType.CallExpression;

        return isDirectCall || isMemberCall || isTailCall;
    }

    analyzeToken(token) {
        const tokenType = this.tokenType;
        const currTokenType = this.getTokenType(token);

        switch (currTokenType) {
            case tokenType.ExpressionStatement:
            case tokenType.TypeAssertionExpression:
                return this.analyzeToken(token.expression);

            case tokenType.FunctionDeclaration:
            case tokenType.FunctionExpression:
                if (this.isAsyncFn(token)) return null;

                return this.getFunctionBody(token).map(this.analyzeToken, this);

            case tokenType.VariableDeclaration:
            case tokenType.VariableStatement:
                {
                    const variableValue = this.getRValue(token); // Skip variable declarations like `var foo;`

                    return variableValue ? this.analyzeToken(variableValue) : null;
                }
            case tokenType.CallExpression:
            case tokenType.PropertyAccessExpression:
            case tokenType.TaggedTemplateExpression:
                return this.analyzeFnCall(token);

            case tokenType.ReturnStatement:
                return token.argument ? this.analyzeToken(token.argument) : null;
        }

        return null;
    }

    collectTestCafeCalls(astBody) {
        let calls = [];

        astBody.forEach(token => {
            const callExps = this.analyzeToken(token);

            if (callExps) calls = calls.concat(callExps);
        });

        return calls;
    }

    analyze(astBody) {
        const fixtures = [];
        const testCafeAPICalls = this.collectTestCafeCalls(astBody);

        testCafeAPICalls.forEach(call => {
            if (!call || typeof call.value !== 'string') return;

            if (call.fnName === 'fixture') {
                fixtures.push(new Fixture(call.value, call.start, call.end, call.loc, call.meta));
                return;
            }

            if (!fixtures.length) return;

            const test = new Test(call.value, call.start, call.end, call.loc, call.meta);

            fixtures[fixtures.length - 1].tests.push(test);
        });

        return fixtures;
    }

    readFile(filePath) {
        return (0, _asyncToGenerator3.default)(function* () {
            let fileContent = '';

            try {
                fileContent = yield readFile(filePath, 'utf8');
            } catch (err) {
                throw new _runtime.GeneralError(_types.RUNTIME_ERRORS.cannotFindSpecifiedTestSource, filePath);
            }

            return fileContent;
        })();
    }

    getTestList(filePath) {
        var _this = this;

        return (0, _asyncToGenerator3.default)(function* () {
            const fileContent = yield _this.readFile(filePath);

            return _this.parse(fileContent);
        })();
    }

    getTestListFromCode(code) {
        return this.parse(code);
    }
}
exports.TestFileParserBase = TestFileParserBase;
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21waWxlci90ZXN0LWZpbGUvdGVzdC1maWxlLXBhcnNlci1iYXNlLmpzIl0sIm5hbWVzIjpbInJlYWRGaWxlIiwiTUVUSE9EU19TUEVDSUZZSU5HX05BTUUiLCJDT01QVVRFRF9OQU1FX1RFWFRfVE1QIiwiRml4dHVyZSIsImNvbnN0cnVjdG9yIiwibmFtZSIsInN0YXJ0IiwiZW5kIiwibG9jIiwibWV0YSIsInRlc3RzIiwiVGVzdCIsIlRlc3RGaWxlUGFyc2VyQmFzZSIsInRva2VuVHlwZSIsImZvcm1hdENvbXB1dGVkTmFtZSIsImxpbmUiLCJpc0FzeW5jRm4iLCJFcnJvciIsImdldFJWYWx1ZSIsImdldEZ1bmN0aW9uQm9keSIsImZvcm1hdEZuRGF0YSIsImFuYWx5emVNZW1iZXJFeHAiLCJmb3JtYXRGbkFyZyIsImdldEZuQ2FsbCIsImdldFRhZ2dlZFRlbXBsYXRlRXhwIiwiYW5hbHl6ZUZuQ2FsbCIsInBhcnNlIiwiZ2V0VG9rZW5UeXBlIiwiZ2V0Q2FsbGVlVG9rZW4iLCJnZXRNZW1iZXJGbk5hbWUiLCJnZXRLZXlWYWx1ZSIsImdldFN0cmluZ1ZhbHVlIiwiaXNBcGlGbiIsImZuIiwic2VyaWFsaXplT2JqRXhwIiwidG9rZW4iLCJPYmplY3RMaXRlcmFsRXhwcmVzc2lvbiIsInByb3BlcnRpZXMiLCJyZWR1Y2UiLCJvYmoiLCJwcm9wIiwia2V5IiwidmFsdWUiLCJwcm9jZXNzTWV0YUFyZ3MiLCJDYWxsRXhwcmVzc2lvbiIsImFyZ3MiLCJhcmd1bWVudHMiLCJsZW5ndGgiLCJnZXRNZXRhSW5mbyIsImNhbGxTdGFjayIsIm1ldGFDYWxscyIsImV4cCIsImNhbGxlZSIsImNhbGxlZVR5cGUiLCJpc0NhbGxlZU1lbWJlckV4cCIsIlByb3BlcnR5QWNjZXNzRXhwcmVzc2lvbiIsImNvbmNhdCIsImNoZWNrRXhwRGVmaW5lVGFyZ2V0TmFtZSIsInR5cGUiLCJhcGlGbiIsImlzRGlyZWN0Q2FsbCIsIklkZW50aWZpZXIiLCJpc01lbWJlckNhbGwiLCJpbmRleE9mIiwiaXNUYWlsQ2FsbCIsImFuYWx5emVUb2tlbiIsImN1cnJUb2tlblR5cGUiLCJFeHByZXNzaW9uU3RhdGVtZW50IiwiVHlwZUFzc2VydGlvbkV4cHJlc3Npb24iLCJleHByZXNzaW9uIiwiRnVuY3Rpb25EZWNsYXJhdGlvbiIsIkZ1bmN0aW9uRXhwcmVzc2lvbiIsIm1hcCIsIlZhcmlhYmxlRGVjbGFyYXRpb24iLCJWYXJpYWJsZVN0YXRlbWVudCIsInZhcmlhYmxlVmFsdWUiLCJUYWdnZWRUZW1wbGF0ZUV4cHJlc3Npb24iLCJSZXR1cm5TdGF0ZW1lbnQiLCJhcmd1bWVudCIsImNvbGxlY3RUZXN0Q2FmZUNhbGxzIiwiYXN0Qm9keSIsImNhbGxzIiwiZm9yRWFjaCIsImNhbGxFeHBzIiwiYW5hbHl6ZSIsImZpeHR1cmVzIiwidGVzdENhZmVBUElDYWxscyIsImNhbGwiLCJmbk5hbWUiLCJwdXNoIiwidGVzdCIsImZpbGVQYXRoIiwiZmlsZUNvbnRlbnQiLCJlcnIiLCJjYW5ub3RGaW5kU3BlY2lmaWVkVGVzdFNvdXJjZSIsImdldFRlc3RMaXN0IiwiZ2V0VGVzdExpc3RGcm9tQ29kZSIsImNvZGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7QUFDQTs7OztBQUVBLE1BQU1BLFdBQVcseUJBQVUsYUFBR0EsUUFBYixDQUFqQjs7QUFFQSxNQUFNQywwQkFBMEIsQ0FBQyxNQUFELEVBQVMsTUFBVCxDQUFoQztBQUNBLE1BQU1DLHlCQUEwQiwyQkFBaEM7O0FBRU8sTUFBTUMsT0FBTixDQUFjO0FBQ2pCQyxnQkFBYUMsSUFBYixFQUFtQkMsS0FBbkIsRUFBMEJDLEdBQTFCLEVBQStCQyxHQUEvQixFQUFvQ0MsSUFBcEMsRUFBMEM7QUFDdEMsYUFBS0osSUFBTCxHQUFhQSxJQUFiO0FBQ0EsYUFBS0csR0FBTCxHQUFhQSxHQUFiO0FBQ0EsYUFBS0YsS0FBTCxHQUFhQSxLQUFiO0FBQ0EsYUFBS0MsR0FBTCxHQUFhQSxH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dkIsZUFBTyxLQUFLdkUsS0FBTCxDQUFXdUUsSUFBWCxDQUFQO0FBQ0g7QUF2TzJCO1FBQW5CckYsa0IsR0FBQUEsa0IiLCJmaWxlIjoiY29tcGlsZXIvdGVzdC1maWxlL3Rlc3QtZmlsZS1wYXJzZXItYmFzZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgcHJvbWlzaWZ5IGZyb20gJy4uLy4uL3V0aWxzL3Byb21pc2lmeSc7XG5pbXBvcnQgeyBmb3JtYXQgfSBmcm9tICd1dGlsJztcbmltcG9ydCB7IEdlbmVyYWxFcnJvciB9IGZyb20gJy4uLy4uL2Vycm9ycy9ydW50aW1lJztcbmltcG9ydCB7IFJVTlRJTUVfRVJST1JTIH0gZnJvbSAnLi4vLi4vZXJyb3JzL3R5cGVzJztcblxuY29uc3QgcmVhZEZpbGUgPSBwcm9taXNpZnkoZnMucmVhZEZpbGUpO1xuXG5jb25zdCBNRVRIT0RTX1NQRUNJRllJTkdfTkFNRSA9IFsnb25seScsICdza2lwJ107XG5jb25zdCBDT01QVVRFRF9OQU1FX1RFWFRfVE1QICA9ICc8Y29tcHV0ZWQgbmFtZT4obGluZTogJXMpJztcblxuZXhwb3J0IGNsYXNzIEZpeHR1cmUge1xuICAgIGNvbnN0cnVjdG9yIChuYW1lLCBzdGFydCwgZW5kLCBsb2MsIG1ldGEpIHtcbiAgICAgICAgdGhpcy5uYW1lICA9IG5hbWU7XG4gICAgICAgIHRoaXMubG9jICAgPSBsb2M7XG4gICAgICAgIHRoaXMuc3RhcnQgPSBzdGFydDtcbiAgICAgICAgdGhpcy5lbmQgICA9IGVuZDtcbiAgICAgICAgdGhpcy5tZXRhICA9IG1ldGE7XG4gICAgICAgIHRoaXMudGVzdHMgPSBbXTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBUZXN0IHtcbiAgICBjb25zdHJ1Y3RvciAobmFtZSwgc3RhcnQsIGVuZCwgbG9jLCBtZXRhKSB7XG4gICAgICAgIHRoaXMubmFtZSAgPSBuYW1lO1xuICAgICAgICB0aGlzLmxvYyAgID0gbG9jO1xuICAgICAgICB0aGlzLnN0YXJ0ID0gc3RhcnQ7XG4gICAgICAgIHRoaXMuZW5kICAgPSBlbmQ7XG4gICAgICAgIHRoaXMubWV0YSAgPSBtZXRhO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIFRlc3RGaWxlUGFyc2VyQmFzZSB7XG4gICAgY29uc3RydWN0b3IgKHRva2VuVHlwZSkge1xuICAgICAgICB0aGlzLnRva2VuVHlwZSA9IHRva2VuVHlwZTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZm9ybWF0Q29tcHV0ZWROYW1lIChsaW5lKSB7XG4gICAgICAgIHJldHVybiBmb3JtYXQoQ09NUFVURURfTkFNRV9URVhUX1RNUCwgbGluZSk7XG4gICAgfVxuXG4gICAgaXNBc3luY0ZuICgvKiB0b2tlbiAqLykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCcpO1xuICAgIH1cblxuICAgIGdldFJWYWx1ZSAoLyogdG9rZW4gKi8pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQnKTtcbiAgICB9XG5cbiAgICBnZXRGdW5jdGlvbkJvZHkgKC8qIHRva2VuICovKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkJyk7XG4gICAgfVxuXG4gICAgZm9ybWF0Rm5EYXRhICgvKiBuYW1lLCB2YWx1ZSwgdG9rZW4gKi8pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQnKTtcbiAgICB9XG5cbiAgICBhbmFseXplTWVtYmVyRXhwICgvKiB0b2tlbiAqLykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCcpO1xuICAgIH1cblxuICAgIGZvcm1hdEZuQXJnICgvKiBhcmcgKi8pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQnKTtcbiAgICB9XG5cbiAgICBnZXRGbkNhbGwgKC8qIHRva2VuICovKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkJyk7XG4gICAgfVxuXG4gICAgZ2V0VGFnZ2VkVGVtcGxhdGVFeHAgKC8qIHRva2VuICovKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkJyk7XG4gICAgfVxuXG4gICAgYW5hbHl6ZUZuQ2FsbCAoLyogdG9rZW4gKi8pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQnKTtcbiAgICB9XG5cbiAgICBwYXJzZSAoLyogZmlsZVBhdGgsIGNvZGUgKi8pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQnKTtcbiAgICB9XG5cbiAgICBnZXRUb2tlblR5cGUgKC8qIHRva2VuICovKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkJyk7XG4gICAgfVxuXG4gICAgZ2V0Q2FsbGVlVG9rZW4gKC8qIHRva2VuICovKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkJyk7XG4gICAgfVxuXG4gICAgZ2V0TWVtYmVyRm5OYW1lICgpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQnKTtcbiAgICB9XG5cbiAgICBnZXRLZXlWYWx1ZSAoKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkJyk7XG4gICAgfVxuXG4gICAgZ2V0U3RyaW5nVmFsdWUgKCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZCcpO1xuICAgIH1cblxuICAgIGlzQXBpRm4gKGZuKSB7XG4gICAgICAgIHJldHVybiBmbiA9PT0gJ2ZpeHR1cmUnIHx8IGZuID09PSAndGVzdCc7XG4gICAgfVxuXG4gICAgc2VyaWFsaXplT2JqRXhwICh0b2tlbikge1xuICAgICAgICBpZiAodGhpcy5nZXRUb2tlblR5cGUodG9rZW4pICE9PSB0aGlzLnRva2VuVHlwZS5PYmplY3RMaXRlcmFsRXhwcmVzc2lvbilcbiAgICAgICAgICAgIHJldHVybiB7fTtcblxuICAgICAgICByZXR1cm4gdG9rZW4ucHJvcGVydGllcy5yZWR1Y2UoKG9iaiwgcHJvcCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgeyBrZXksIHZhbHVlIH0gPSB0aGlzLmdldEtleVZhbHVlKHByb3ApO1xuXG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJykgcmV0dXJuIHt9O1xuXG4gICAgICAgICAgICBvYmpba2V5XSA9IHZhbHVlO1xuXG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9LCB7fSk7XG4gICAgfVxuXG4gICAgcHJvY2Vzc01ldGFBcmdzICh0b2tlbikge1xuICAgICAgICBpZiAodGhpcy5nZXRUb2tlblR5cGUodG9rZW4pICE9PSB0aGlzLnRva2VuVHlwZS5DYWxsRXhwcmVzc2lvbilcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuXG4gICAgICAgIGNvbnN0IGFyZ3MgPSB0b2tlbi5hcmd1bWVudHM7XG5cbiAgICAgICAgbGV0IG1ldGEgPSB7fTtcblxuICAgICAgICBpZiAoYXJncy5sZW5ndGggPT09IDIpIHtcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5nZXRTdHJpbmdWYWx1ZShhcmdzWzFdKTtcblxuICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycpIHJldHVybiB7fTtcblxuICAgICAgICAgICAgbWV0YSA9IHsgW3RoaXMuZm9ybWF0Rm5BcmcoYXJnc1swXSldOiB2YWx1ZSB9O1xuICAgICAgICB9XG5cbiAgICAgICAgZWxzZSBpZiAoYXJncy5sZW5ndGggPT09IDEpXG4gICAgICAgICAgICBtZXRhID0gdGhpcy5zZXJpYWxpemVPYmpFeHAoYXJnc1swXSk7XG5cbiAgICAgICAgcmV0dXJuIG1ldGE7XG4gICAgfVxuXG4gICAgZ2V0TWV0YUluZm8gKGNhbGxTdGFjaykge1xuICAgICAgICByZXR1cm4gY2FsbFN0YWNrLnJlZHVjZSgobWV0YUNhbGxzLCBleHApID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLmdldFRva2VuVHlwZShleHApICE9PSB0aGlzLnRva2VuVHlwZS5DYWxsRXhwcmVzc2lvbilcbiAgICAgICAgICAgICAgICByZXR1cm4gbWV0YUNhbGxzO1xuXG4gICAgICAgICAgICBjb25zdCBjYWxsZWUgICAgICAgICAgICA9IHRoaXMuZ2V0Q2FsbGVlVG9rZW4oZXhwKTtcbiAgICAgICAgICAgIGNvbnN0IGNhbGxlZVR5cGUgICAgICAgID0gdGhpcy5nZXRUb2tlblR5cGUoY2FsbGVlKTtcbiAgICAgICAgICAgIGNvbnN0IGlzQ2FsbGVlTWVtYmVyRXhwID0gY2FsbGVlVHlwZSA9PT0gdGhpcy50b2tlblR5cGUuUHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uO1xuXG4gICAgICAgICAgICBpZiAoaXNDYWxsZWVNZW1iZXJFeHAgJiYgdGhpcy5nZXRNZW1iZXJGbk5hbWUoZXhwKSA9PT0gJ21ldGEnKVxuICAgICAgICAgICAgICAgIHJldHVybiBbdGhpcy5wcm9jZXNzTWV0YUFyZ3MoZXhwKV0uY29uY2F0KG1ldGFDYWxscyk7XG5cbiAgICAgICAgICAgIHJldHVybiBtZXRhQ2FsbHM7XG4gICAgICAgIH0sIFtdKTtcbiAgICB9XG5cbiAgICBjaGVja0V4cERlZmluZVRhcmdldE5hbWUgKHR5cGUsIGFwaUZuKSB7XG4gICAgICAgIC8vTk9URTogZml4dHVyZSgnZml4dHVyZU5hbWUnKS5jaGFpbkZuIG9yIHRlc3QoJ3Rlc3ROYW1lJykuY2hhaW5GblxuICAgICAgICBjb25zdCBpc0RpcmVjdENhbGwgPSB0eXBlID09PSB0aGlzLnRva2VuVHlwZS5JZGVudGlmaWVyO1xuXG4gICAgICAgIC8vTk9URTogZml4dHVyZS5za2lwKCdmaXh0dXJlTmFtZScpLCB0ZXN0Lm9ubHkoJ3Rlc3ROYW1lJykgZXRjLlxuICAgICAgICBjb25zdCBpc01lbWJlckNhbGwgPSB0eXBlID09PSB0aGlzLnRva2VuVHlwZS5Qcm9wZXJ0eUFjY2Vzc0V4cHJlc3Npb24gJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTUVUSE9EU19TUEVDSUZZSU5HX05BTUUuaW5kZXhPZihhcGlGbikgPiAtMTtcblxuICAgICAgICAvL05PVEU6IGZpeHR1cmUuYmVmb3JlKCkuYWZ0ZXIoKSgnZml4dHVyZU5hbWUnKSwgdGVzdC5iZWZvcmUoKWB0ZXN0TmFtZWAuYWZ0ZXIoKSBldGMuXG4gICAgICAgIGNvbnN0IGlzVGFpbENhbGwgPSB0eXBlID09PSB0aGlzLnRva2VuVHlwZS5DYWxsRXhwcmVzc2lvbjtcblxuICAgICAgICByZXR1cm4gaXNEaXJlY3RDYWxsIHx8IGlzTWVtYmVyQ2FsbCB8fCBpc1RhaWxDYWxsO1xuICAgIH1cblxuICAgIGFuYWx5emVUb2tlbiAodG9rZW4pIHtcbiAgICAgICAgY29uc3QgdG9rZW5UeXBlICAgICA9IHRoaXMudG9rZW5UeXBlO1xuICAgICAgICBjb25zdCBjdXJyVG9rZW5UeXBlID0gdGhpcy5nZXRUb2tlblR5cGUodG9rZW4pO1xuXG4gICAgICAgIHN3aXRjaCAoY3VyclRva2VuVHlwZSkge1xuICAgICAgICAgICAgY2FzZSB0b2tlblR5cGUuRXhwcmVzc2lvblN0YXRlbWVudDpcbiAgICAgICAgICAgIGNhc2UgdG9rZW5UeXBlLlR5cGVBc3NlcnRpb25FeHByZXNzaW9uOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmFuYWx5emVUb2tlbih0b2tlbi5leHByZXNzaW9uKTtcblxuICAgICAgICAgICAgY2FzZSB0b2tlblR5cGUuRnVuY3Rpb25EZWNsYXJhdGlvbjpcbiAgICAgICAgICAgIGNhc2UgdG9rZW5UeXBlLkZ1bmN0aW9uRXhwcmVzc2lvbjpcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5pc0FzeW5jRm4odG9rZW4pKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcblxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmdldEZ1bmN0aW9uQm9keSh0b2tlbikubWFwKHRoaXMuYW5hbHl6ZVRva2VuLCB0aGlzKTtcblxuICAgICAgICAgICAgY2FzZSB0b2tlblR5cGUuVmFyaWFibGVEZWNsYXJhdGlvbjpcbiAgICAgICAgICAgIGNhc2UgdG9rZW5UeXBlLlZhcmlhYmxlU3RhdGVtZW50OiB7XG4gICAgICAgICAgICAgICAgY29uc3QgdmFyaWFibGVWYWx1ZSA9IHRoaXMuZ2V0UlZhbHVlKHRva2VuKTsgLy8gU2tpcCB2YXJpYWJsZSBkZWNsYXJhdGlvbnMgbGlrZSBgdmFyIGZvbztgXG5cbiAgICAgICAgICAgICAgICByZXR1cm4gdmFyaWFibGVWYWx1ZSA/IHRoaXMuYW5hbHl6ZVRva2VuKHZhcmlhYmxlVmFsdWUpIDogbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgdG9rZW5UeXBlLkNhbGxFeHByZXNzaW9uOlxuICAgICAgICAgICAgY2FzZSB0b2tlblR5cGUuUHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uOlxuICAgICAgICAgICAgY2FzZSB0b2tlblR5cGUuVGFnZ2VkVGVtcGxhdGVFeHByZXNzaW9uOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmFuYWx5emVGbkNhbGwodG9rZW4pO1xuXG4gICAgICAgICAgICBjYXNlIHRva2VuVHlwZS5SZXR1cm5TdGF0ZW1lbnQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRva2VuLmFyZ3VtZW50ID8gdGhpcy5hbmFseXplVG9rZW4odG9rZW4uYXJndW1lbnQpIDogbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbGxlY3RUZXN0Q2FmZUNhbGxzIChhc3RCb2R5KSB7XG4gICAgICAgIGxldCBjYWxscyA9IFtdO1xuXG4gICAgICAgIGFzdEJvZHkuZm9yRWFjaCh0b2tlbiA9PiB7XG4gICAgICAgICAgICBjb25zdCBjYWxsRXhwcyA9IHRoaXMuYW5hbHl6ZVRva2VuKHRva2VuKTtcblxuICAgICAgICAgICAgaWYgKGNhbGxFeHBzKVxuICAgICAgICAgICAgICAgIGNhbGxzID0gY2FsbHMuY29uY2F0KGNhbGxFeHBzKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGNhbGxzO1xuICAgIH1cblxuICAgIGFuYWx5emUgKGFzdEJvZHkpIHtcbiAgICAgICAgY29uc3QgZml4dHVyZXMgICAgICAgICA9IFtdO1xuICAgICAgICBjb25zdCB0ZXN0Q2FmZUFQSUNhbGxzID0gdGhpcy5jb2xsZWN0VGVzdENhZmVDYWxscyhhc3RCb2R5KTtcblxuICAgICAgICB0ZXN0Q2FmZUFQSUNhbGxzLmZvckVhY2goY2FsbCA9PiB7XG4gICAgICAgICAgICBpZiAoIWNhbGwgfHwgdHlwZW9mIGNhbGwudmFsdWUgIT09ICdzdHJpbmcnKSByZXR1cm47XG5cbiAgICAgICAgICAgIGlmIChjYWxsLmZuTmFtZSA9PT0gJ2ZpeHR1cmUnKSB7XG4gICAgICAgICAgICAgICAgZml4dHVyZXMucHVzaChuZXcgRml4dHVyZShjYWxsLnZhbHVlLCBjYWxsLnN0YXJ0LCBjYWxsLmVuZCwgY2FsbC5sb2MsIGNhbGwubWV0YSkpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCFmaXh0dXJlcy5sZW5ndGgpIHJldHVybjtcblxuICAgICAgICAgICAgY29uc3QgdGVzdCA9IG5ldyBUZXN0KGNhbGwudmFsdWUsIGNhbGwuc3RhcnQsIGNhbGwuZW5kLCBjYWxsLmxvYywgY2FsbC5tZXRhKTtcblxuICAgICAgICAgICAgZml4dHVyZXNbZml4dHVyZXMubGVuZ3RoIC0gMV0udGVzdHMucHVzaCh0ZXN0KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGZpeHR1cmVzO1xuICAgIH1cblxuICAgIGFzeW5jIHJlYWRGaWxlIChmaWxlUGF0aCkge1xuICAgICAgICBsZXQgZmlsZUNvbnRlbnQgPSAnJztcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgZmlsZUNvbnRlbnQgPSBhd2FpdCByZWFkRmlsZShmaWxlUGF0aCwgJ3V0ZjgnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBHZW5lcmFsRXJyb3IoUlVOVElNRV9FUlJPUlMuY2Fubm90RmluZFNwZWNpZmllZFRlc3RTb3VyY2UsIGZpbGVQYXRoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmaWxlQ29udGVudDtcbiAgICB9XG5cbiAgICBhc3luYyBnZXRUZXN0TGlzdCAoZmlsZVBhdGgpIHtcbiAgICAgICAgY29uc3QgZmlsZUNvbnRlbnQgPSBhd2FpdCB0aGlzLnJlYWRGaWxlKGZpbGVQYXRoKTtcblxuICAgICAgICByZXR1cm4gdGhpcy5wYXJzZShmaWxlQ29udGVudCk7XG4gICAgfVxuXG4gICAgZ2V0VGVzdExpc3RGcm9tQ29kZSAoY29kZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJzZShjb2RlKTtcbiAgICB9XG59XG4iXX0=
