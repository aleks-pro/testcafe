'use strict';

exports.__esModule = true;
exports.SetNativeDialogHandlerCodeWrongTypeError = exports.UncaughtErrorInNativeDialogHandler = exports.NativeDialogNotHandledError = exports.CurrentIframeIsInvisibleError = exports.CurrentIframeNotFoundError = exports.CurrentIframeIsNotLoadedError = exports.ActionIframeIsNotLoadedError = exports.ActionElementNotIframeError = exports.RoleSwitchInRoleInitializerError = exports.ForbiddenCharactersInScreenshotPathError = exports.InvalidElementScreenshotDimensionsError = exports.WindowDimensionsOverflowError = exports.ActionInvalidScrollTargetError = exports.ActionElementIsNotFileInputError = exports.ActionCannotFindFileToUploadError = exports.ActionIncorrectKeysError = exports.ActionRootContainerNotFoundError = exports.ActionElementNonContentEditableError = exports.ActionElementNotTextAreaError = exports.ActionElementNonEditableError = exports.ActionAdditionalSelectorMatchesWrongNodeTypeError = exports.ActionAdditionalElementIsInvisibleError = exports.ActionAdditionalElementNotFoundError = exports.ActionSelectorMatchesWrongNodeTypeError = exports.ActionElementIsInvisibleError = exports.ActionElementNotFoundError = exports.ActionSelectorError = exports.ActionUnsupportedDeviceTypeError = exports.SetTestSpeedArgumentError = exports.ActionStringArrayElementError = exports.ActionStringOrStringArrayArgumentError = exports.ActionPositiveIntegerArgumentError = exports.ActionRoleArgumentError = exports.ActionIntegerArgumentError = exports.ActionNullableStringArgumentError = exports.ActionStringArgumentError = exports.ActionOptionsTypeError = exports.ActionSpeedOptionError = exports.ActionBooleanArgumentError = exports.ActionBooleanOptionError = exports.ActionPositiveIntegerOptionError = exports.ActionIntegerOptionError = exports.AssertionUnawaitedPromiseError = exports.AssertionWithoutMethodCallError = exports.AssertionExecutableArgumentError = exports.ExternalAssertionLibraryError = exports.UncaughtExceptionError = exports.UnhandledPromiseRejectionError = exports.UncaughtErrorInCustomDOMPropertyCode = exports.UncaughtErrorInClientFunctionCode = exports.UncaughtNonErrorObjectInTestCode = exports.UncaughtErrorInTestCode = exports.UncaughtErrorOnPage = exports.PageLoadError = exports.CannotObtainInfoForElementSpecifiedBySelectorError = exports.InvalidSelectorResultError = exports.DomNodeClientFunctionResultError = exports.ClientFunctionExecutionInterruptionError = exports.MissingAwaitError = undefined;

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _types = require('../types');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Base
//--------------------------------------------------------------------
class TestRunErrorBase {
    constructor(code) {
        this.code = code;
        this.isTestCafeError = true;
        this.callsite = null;
    }
} // -------------------------------------------------------------
// WARNING: this file is used by both the client and the server.
// Do not use any browser or node-specific API!
// -------------------------------------------------------------


class ActionOptionErrorBase extends TestRunErrorBase {
    constructor(code, optionName, actualValue) {
        super(code);

        this.optionName = optionName;
        this.actualValue = actualValue;
    }
}

class ActionArgumentErrorBase extends TestRunErrorBase {
    constructor(code, argumentName, actualValue) {
        super(code);

        this.argumentName = argumentName;
        this.actualValue = actualValue;
    }
}

// Synchronization errors
//--------------------------------------------------------------------
class MissingAwaitError extends TestRunErrorBase {
    constructor(callsite) {
        super(_types.TEST_RUN_ERRORS.missingAwaitError);

        this.callsite = callsite;
    }
}

exports.MissingAwaitError = MissingAwaitError; // Client function errors
//--------------------------------------------------------------------

class ClientFunctionExecutionInterruptionError extends TestRunErrorBase {
    constructor(instantiationCallsiteName) {
        super(_types.TEST_RUN_ERRORS.clientFunctionExecutionInterruptionError);

        this.instantiationCallsiteName = instantiationCallsiteName;
    }
}

exports.ClientFunctionExecutionInterruptionError = ClientFunctionExecutionInterruptionError;
class DomNodeClientFunctionResultError extends TestRunErrorBase {
    constructor(instantiationCallsiteName) {
        super(_types.TEST_RUN_ERRORS.domNodeClientFunctionResultError);

        this.instantiationCallsiteName = instantiationCallsiteName;
    }
}

exports.DomNodeClientFunctionResultError = DomNodeClientFunctionResultError; // Selector errors
//--------------------------------------------------------------------

class SelectorErrorBase extends TestRunErrorBase {
    constructor(code, { apiFnChain, apiFnIndex }) {
        super(code);

        this.apiFnChain = apiFnChain;
        this.apiFnIndex = apiFnIndex;
    }
}

class InvalidSelectorResultError extends TestRunErrorBase {
    constructor() {
        super(_types.TEST_RUN_ERRORS.invalidSelectorResultError);
    }
}

exports.InvalidSelectorResultError = InvalidSelectorResultError;
class CannotObtainInfoForElementSpecifiedBySelectorError extends SelectorErrorBase {
    constructor(callsite, apiFnArgs) {
        super(_types.TEST_RUN_ERRORS.cannotObtainInfoForElementSpecifiedBySelectorError, apiFnArgs);

        this.callsite = callsite;
    }
}

exports.CannotObtainInfoForElementSpecifiedBySelectorError = CannotObtainInfoForElementSpecifiedBySelectorError; // Page errors
//--------------------------------------------------------------------

class PageLoadError extends TestRunErrorBase {
    constructor(errMsg, url) {
        super(_types.TEST_RUN_ERRORS.pageLoadError);

        this.url = url;
        this.errMsg = errMsg;
    }
}

exports.PageLoadError = PageLoadError; // Uncaught errors
//--------------------------------------------------------------------

class UncaughtErrorOnPage extends TestRunErrorBase {
    constructor(errStack, pageDestUrl) {
        super(_types.TEST_RUN_ERRORS.uncaughtErrorOnPage);

        this.errStack = errStack;
        this.pageDestUrl = pageDestUrl;
    }
}

exports.UncaughtErrorOnPage = UncaughtErrorOnPage;
class UncaughtErrorInTestCode extends TestRunErrorBase {
    constructor(err, callsite) {
        super(_types.TEST_RUN_ERRORS.uncaughtErrorInTestCode);

        this.errMsg = String(err.rawMessage || err);
        this.callsite = err.callsite || callsite;
        this.originError = err;
    }
}

exports.UncaughtErrorInTestCode = UncaughtErrorInTestCode;
class UncaughtNonErrorObjectInTestCode extends TestRunErrorBase {
    constructor(obj) {
        super(_types.TEST_RUN_ERRORS.uncaughtNonErrorObjectInTestCode);

        this.objType = typeof obj;
        this.objStr = (0, _stringify2.default)(obj);
    }
}

exports.UncaughtNonErrorObjectInTestCode = UncaughtNonErrorObjectInTestCode;
class UncaughtErrorInClientFunctionCode extends TestRunErrorBase {
    constructor(instantiationCallsiteName, err) {
        super(_types.TEST_RUN_ERRORS.uncaughtErrorInClientFunctionCode);

        this.errMsg = String(err);
        this.instantiationCallsiteName = instantiationCallsiteName;
    }
}

exports.UncaughtErrorInClientFunctionCode = UncaughtErrorInClientFunctionCode;
class UncaughtErrorInCustomDOMPropertyCode extends TestRunErrorBase {
    constructor(instantiationCallsiteName, err, prop) {
        super(_types.TEST_RUN_ERRORS.uncaughtErrorInCustomDOMPropertyCode, err, prop);

        this.errMsg = String(err);
        this.property = prop;
        this.instantiationCallsiteName = instantiationCallsiteName;
    }
}

exports.UncaughtErrorInCustomDOMPropertyCode = UncaughtErrorInCustomDOMPropertyCode;
class UnhandledPromiseRejectionError extends TestRunErrorBase {
    constructor(err) {
        super(_types.TEST_RUN_ERRORS.unhandledPromiseRejection);

        this.errMsg = String(err);
    }
}

exports.UnhandledPromiseRejectionError = UnhandledPromiseRejectionError;
class UncaughtExceptionError extends TestRunErrorBase {
    constructor(err) {
        super(_types.TEST_RUN_ERRORS.uncaughtException);

        this.errMsg = String(err);
    }
}

exports.UncaughtExceptionError = UncaughtExceptionError; // Assertion errors
//--------------------------------------------------------------------

class ExternalAssertionLibraryError extends TestRunErrorBase {
    constructor(err, callsite) {
        super(_types.TEST_RUN_ERRORS.externalAssertionLibraryError);

        this.errMsg = String(err);
        this.callsite = callsite;
    }
}

exports.ExternalAssertionLibraryError = ExternalAssertionLibraryError;
class AssertionExecutableArgumentError extends ActionArgumentErrorBase {
    constructor(argumentName, argumentValue, err, isAPIError) {
        super(_types.TEST_RUN_ERRORS.assertionExecutableArgumentError, argumentName, argumentValue);

        this.errMsg = isAPIError ? err.rawMessage : err.message;
        this.originError = err;
    }
}

exports.AssertionExecutableArgumentError = AssertionExecutableArgumentError;
class AssertionWithoutMethodCallError extends TestRunErrorBase {
    constructor(callsite) {
        super(_types.TEST_RUN_ERRORS.assertionWithoutMethodCallError);

        this.callsite = callsite;
    }
}

exports.AssertionWithoutMethodCallError = AssertionWithoutMethodCallError;
class AssertionUnawaitedPromiseError extends TestRunErrorBase {
    constructor(callsite) {
        super(_types.TEST_RUN_ERRORS.assertionUnawaitedPromiseError);

        this.callsite = callsite;
    }
}

exports.AssertionUnawaitedPromiseError = AssertionUnawaitedPromiseError; // Action parameters errors
//--------------------------------------------------------------------
// Options errors

class ActionIntegerOptionError extends ActionOptionErrorBase {
    constructor(optionName, actualValue) {
        super(_types.TEST_RUN_ERRORS.actionIntegerOptionError, optionName, actualValue);
    }
}

exports.ActionIntegerOptionError = ActionIntegerOptionError;
class ActionPositiveIntegerOptionError extends ActionOptionErrorBase {
    constructor(optionName, actualValue) {
        super(_types.TEST_RUN_ERRORS.actionPositiveIntegerOptionError, optionName, actualValue);
    }
}

exports.ActionPositiveIntegerOptionError = ActionPositiveIntegerOptionError;
class ActionBooleanOptionError extends ActionOptionErrorBase {
    constructor(optionName, actualValue) {
        super(_types.TEST_RUN_ERRORS.actionBooleanOptionError, optionName, actualValue);
    }
}

exports.ActionBooleanOptionError = ActionBooleanOptionError;
class ActionBooleanArgumentError extends ActionArgumentErrorBase {
    constructor(argumentName, actualValue) {
        super(_types.TEST_RUN_ERRORS.actionBooleanArgumentError, argumentName, actualValue);
    }
}

exports.ActionBooleanArgumentError = ActionBooleanArgumentError;
class ActionSpeedOptionError extends ActionOptionErrorBase {
    constructor(optionName, actualValue) {
        super(_types.TEST_RUN_ERRORS.actionSpeedOptionError, optionName, actualValue);
    }
}

exports.ActionSpeedOptionError = ActionSpeedOptionError;
class ActionOptionsTypeError extends TestRunErrorBase {
    constructor(actualType) {
        super(_types.TEST_RUN_ERRORS.actionOptionsTypeError);

        this.actualType = actualType;
    }
}

exports.ActionOptionsTypeError = ActionOptionsTypeError; // Arguments errors

class ActionStringArgumentError extends ActionArgumentErrorBase {
    constructor(argumentName, actualValue) {
        super(_types.TEST_RUN_ERRORS.actionStringArgumentError, argumentName, actualValue);
    }
}

exports.ActionStringArgumentError = ActionStringArgumentError;
class ActionNullableStringArgumentError extends ActionArgumentErrorBase {
    constructor(argumentName, actualValue) {
        super(_types.TEST_RUN_ERRORS.actionNullableStringArgumentError, argumentName, actualValue);
    }
}

exports.ActionNullableStringArgumentError = ActionNullableStringArgumentError;
class ActionIntegerArgumentError extends ActionArgumentErrorBase {
    constructor(argumentName, actualValue) {
        super(_types.TEST_RUN_ERRORS.actionIntegerArgumentError, argumentName, actualValue);
    }
}

exports.ActionIntegerArgumentError = ActionIntegerArgumentError;
class ActionRoleArgumentError extends ActionArgumentErrorBase {
    constructor(argumentName, actualValue) {
        super(_types.TEST_RUN_ERRORS.actionRoleArgumentError, argumentName, actualValue);
    }
}

exports.ActionRoleArgumentError = ActionRoleArgumentError;
class ActionPositiveIntegerArgumentError extends ActionArgumentErrorBase {
    constructor(argumentName, actualValue) {
        super(_types.TEST_RUN_ERRORS.actionPositiveIntegerArgumentError, argumentName, actualValue);
    }
}

exports.ActionPositiveIntegerArgumentError = ActionPositiveIntegerArgumentError;
class ActionStringOrStringArrayArgumentError extends ActionArgumentErrorBase {
    constructor(argumentName, actualValue) {
        super(_types.TEST_RUN_ERRORS.actionStringOrStringArrayArgumentError, argumentName, actualValue);
    }
}

exports.ActionStringOrStringArrayArgumentError = ActionStringOrStringArrayArgumentError;
class ActionStringArrayElementError extends ActionArgumentErrorBase {
    constructor(argumentName, actualValue, elementIndex) {
        super(_types.TEST_RUN_ERRORS.actionStringArrayElementError, argumentName, actualValue);

        this.elementIndex = elementIndex;
    }
}

exports.ActionStringArrayElementError = ActionStringArrayElementError;
class SetTestSpeedArgumentError extends ActionArgumentErrorBase {
    constructor(argumentName, actualValue) {
        super(_types.TEST_RUN_ERRORS.setTestSpeedArgumentError, argumentName, actualValue);
    }
}

exports.SetTestSpeedArgumentError = SetTestSpeedArgumentError;
class ActionUnsupportedDeviceTypeError extends ActionArgumentErrorBase {
    constructor(argumentName, argumentValue) {
        super(_types.TEST_RUN_ERRORS.actionUnsupportedDeviceTypeError, argumentName, argumentValue);
    }
}

exports.ActionUnsupportedDeviceTypeError = ActionUnsupportedDeviceTypeError; // Selector errors

class ActionSelectorError extends TestRunErrorBase {
    constructor(selectorName, err, isAPIError) {
        super(_types.TEST_RUN_ERRORS.actionSelectorError);

        this.selectorName = selectorName;
        this.errMsg = isAPIError ? err.rawMessage : err.message;
        this.originError = err;
    }
}

exports.ActionSelectorError = ActionSelectorError; // Action execution errors
//--------------------------------------------------------------------

class ActionElementNotFoundError extends SelectorErrorBase {
    constructor(apiFnArgs) {
        super(_types.TEST_RUN_ERRORS.actionElementNotFoundError, apiFnArgs);
    }
}

exports.ActionElementNotFoundError = ActionElementNotFoundError;
class ActionElementIsInvisibleError extends TestRunErrorBase {
    constructor() {
        super(_types.TEST_RUN_ERRORS.actionElementIsInvisibleError);
    }
}

exports.ActionElementIsInvisibleError = ActionElementIsInvisibleError;
class ActionSelectorMatchesWrongNodeTypeError extends TestRunErrorBase {
    constructor(nodeDescription) {
        super(_types.TEST_RUN_ERRORS.actionSelectorMatchesWrongNodeTypeError);

        this.nodeDescription = nodeDescription;
    }
}

exports.ActionSelectorMatchesWrongNodeTypeError = ActionSelectorMatchesWrongNodeTypeError;
class ActionAdditionalElementNotFoundError extends SelectorErrorBase {
    constructor(argumentName, apiFnArgs) {
        super(_types.TEST_RUN_ERRORS.actionAdditionalElementNotFoundError, apiFnArgs);

        this.argumentName = argumentName;
    }
}

exports.ActionAdditionalElementNotFoundError = ActionAdditionalElementNotFoundError;
class ActionAdditionalElementIsInvisibleError extends TestRunErrorBase {
    constructor(argumentName) {
        super(_types.TEST_RUN_ERRORS.actionAdditionalElementIsInvisibleError);

        this.argumentName = argumentName;
    }
}

exports.ActionAdditionalElementIsInvisibleError = ActionAdditionalElementIsInvisibleError;
class ActionAdditionalSelectorMatchesWrongNodeTypeError extends TestRunErrorBase {
    constructor(argumentName, nodeDescription) {
        super(_types.TEST_RUN_ERRORS.actionAdditionalSelectorMatchesWrongNodeTypeError);

        this.argumentName = argumentName;
        this.nodeDescription = nodeDescription;
    }
}

exports.ActionAdditionalSelectorMatchesWrongNodeTypeError = ActionAdditionalSelectorMatchesWrongNodeTypeError;
class ActionElementNonEditableError extends TestRunErrorBase {
    constructor() {
        super(_types.TEST_RUN_ERRORS.actionElementNonEditableError);
    }
}

exports.ActionElementNonEditableError = ActionElementNonEditableError;
class ActionElementNotTextAreaError extends TestRunErrorBase {
    constructor() {
        super(_types.TEST_RUN_ERRORS.actionElementNotTextAreaError);
    }
}

exports.ActionElementNotTextAreaError = ActionElementNotTextAreaError;
class ActionElementNonContentEditableError extends TestRunErrorBase {
    constructor(argumentName) {
        super(_types.TEST_RUN_ERRORS.actionElementNonContentEditableError);

        this.argumentName = argumentName;
    }
}

exports.ActionElementNonContentEditableError = ActionElementNonContentEditableError;
class ActionRootContainerNotFoundError extends TestRunErrorBase {
    constructor() {
        super(_types.TEST_RUN_ERRORS.actionRootContainerNotFoundError);
    }
}

exports.ActionRootContainerNotFoundError = ActionRootContainerNotFoundError;
class ActionIncorrectKeysError extends TestRunErrorBase {
    constructor(argumentName) {
        super(_types.TEST_RUN_ERRORS.actionIncorrectKeysError);

        this.argumentName = argumentName;
    }
}

exports.ActionIncorrectKeysError = ActionIncorrectKeysError;
class ActionCannotFindFileToUploadError extends TestRunErrorBase {
    constructor(filePaths) {
        super(_types.TEST_RUN_ERRORS.actionCannotFindFileToUploadError);

        this.filePaths = filePaths;
    }
}

exports.ActionCannotFindFileToUploadError = ActionCannotFindFileToUploadError;
class ActionElementIsNotFileInputError extends TestRunErrorBase {
    constructor() {
        super(_types.TEST_RUN_ERRORS.actionElementIsNotFileInputError);
    }
}

exports.ActionElementIsNotFileInputError = ActionElementIsNotFileInputError;
class ActionInvalidScrollTargetError extends TestRunErrorBase {
    constructor(scrollTargetXValid, scrollTargetYValid) {
        super(_types.TEST_RUN_ERRORS.actionInvalidScrollTargetError);

        if (!scrollTargetXValid) {
            if (!scrollTargetYValid) this.properties = 'scrollTargetX and scrollTargetY properties';else this.properties = 'scrollTargetX property';
        } else this.properties = 'scrollTargetY property';
    }
}

exports.ActionInvalidScrollTargetError = ActionInvalidScrollTargetError;
class WindowDimensionsOverflowError extends TestRunErrorBase {
    constructor(callsite) {
        super(_types.TEST_RUN_ERRORS.windowDimensionsOverflowError);

        this.callsite = callsite;
    }
}

exports.WindowDimensionsOverflowError = WindowDimensionsOverflowError;
class InvalidElementScreenshotDimensionsError extends TestRunErrorBase {
    constructor(width, height) {
        super(_types.TEST_RUN_ERRORS.invalidElementScreenshotDimensionsError);

        const widthIsInvalid = width <= 0;
        const heightIsInvalid = height <= 0;

        if (widthIsInvalid) {
            if (heightIsInvalid) {
                this.verb = 'are';
                this.dimensions = 'width and height';
            } else {
                this.verb = 'is';
                this.dimensions = 'width';
            }
        } else {
            this.verb = 'is';
            this.dimensions = 'height';
        }
    }
}

exports.InvalidElementScreenshotDimensionsError = InvalidElementScreenshotDimensionsError;
class ForbiddenCharactersInScreenshotPathError extends TestRunErrorBase {
    constructor(screenshotPath, forbiddenCharsList) {
        super(_types.TEST_RUN_ERRORS.forbiddenCharactersInScreenshotPathError);

        this.screenshotPath = screenshotPath;
        this.forbiddenCharsList = forbiddenCharsList;
    }
}

exports.ForbiddenCharactersInScreenshotPathError = ForbiddenCharactersInScreenshotPathError;
class RoleSwitchInRoleInitializerError extends TestRunErrorBase {
    constructor(callsite) {
        super(_types.TEST_RUN_ERRORS.roleSwitchInRoleInitializerError);

        this.callsite = callsite;
    }
}

exports.RoleSwitchInRoleInitializerError = RoleSwitchInRoleInitializerError; // Iframe errors

class ActionElementNotIframeError extends TestRunErrorBase {
    constructor() {
        super(_types.TEST_RUN_ERRORS.actionElementNotIframeError);
    }
}

exports.ActionElementNotIframeError = ActionElementNotIframeError;
class ActionIframeIsNotLoadedError extends TestRunErrorBase {
    constructor() {
        super(_types.TEST_RUN_ERRORS.actionIframeIsNotLoadedError);
    }
}

exports.ActionIframeIsNotLoadedError = ActionIframeIsNotLoadedError;
class CurrentIframeIsNotLoadedError extends TestRunErrorBase {
    constructor() {
        super(_types.TEST_RUN_ERRORS.currentIframeIsNotLoadedError);
    }
}

exports.CurrentIframeIsNotLoadedError = CurrentIframeIsNotLoadedError;
class CurrentIframeNotFoundError extends TestRunErrorBase {
    constructor() {
        super(_types.TEST_RUN_ERRORS.currentIframeNotFoundError);
    }
}

exports.CurrentIframeNotFoundError = CurrentIframeNotFoundError;
class CurrentIframeIsInvisibleError extends TestRunErrorBase {
    constructor() {
        super(_types.TEST_RUN_ERRORS.currentIframeIsInvisibleError);
    }
}

exports.CurrentIframeIsInvisibleError = CurrentIframeIsInvisibleError; // Native dialog errors

class NativeDialogNotHandledError extends TestRunErrorBase {
    constructor(dialogType, url) {
        super(_types.TEST_RUN_ERRORS.nativeDialogNotHandledError);

        this.dialogType = dialogType;
        this.pageUrl = url;
    }
}

exports.NativeDialogNotHandledError = NativeDialogNotHandledError;
class UncaughtErrorInNativeDialogHandler extends TestRunErrorBase {
    constructor(dialogType, errMsg, url) {
        super(_types.TEST_RUN_ERRORS.uncaughtErrorInNativeDialogHandler);

        this.dialogType = dialogType;
        this.errMsg = errMsg;
        this.pageUrl = url;
    }
}

exports.UncaughtErrorInNativeDialogHandler = UncaughtErrorInNativeDialogHandler;
class SetNativeDialogHandlerCodeWrongTypeError extends TestRunErrorBase {
    constructor(actualType) {
        super(_types.TEST_RUN_ERRORS.setNativeDialogHandlerCodeWrongTypeError);

        this.actualType = actualType;
    }
}
exports.SetNativeDialogHandlerCodeWrongTypeError = SetNativeDialogHandlerCodeWrongTypeError;
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9lcnJvcnMvdGVzdC1ydW4vaW5kZXguanMiXSwibmFtZXMiOlsiVGVzdFJ1bkVycm9yQmFzZSIsImNvbnN0cnVjdG9yIiwiY29kZSIsImlzVGVzdENhZmVFcnJvciIsImNhbGxzaXRlIiwiQWN0aW9uT3B0aW9uRXJyb3JCYXNlIiwib3B0aW9uTmFtZSIsImFjdHVhbFZhbHVlIiwiQWN0aW9uQXJndW1lbnRFcnJvckJhc2UiLCJhcmd1bWVudE5hbWUiLCJNaXNzaW5nQXdhaXRFcnJvciIsIm1pc3NpbmdBd2FpdEVycm9yIiwiQ2xpZW50RnVuY3Rpb25FeGVjdXRpb25JbnRlcnJ1cHRpb25FcnJvciIsImluc3RhbnRpYXRpb25DYWxsc2l0ZU5hbWUiLCJjbGllbnRGdW5jdGlvbkV4ZWN1dGlvbkludGVycnVwdGlvbkVycm9yIiwiRG9tTm9kZUNsaWVudEZ1bmN0aW9uUmVzdWx0RXJyb3IiLCJkb21Ob2RlQ2xpZW50RnVuY3Rpb25SZXN1bHRFcnJvciIsIlNlbGVjdG9yRXJyb3JCYXNlIiwiYXBpRm5DaGFpbiIsImFwaUZuSW5kZXgiLCJJbnZhbGlkU2VsZWN0b3JSZXN1bHRFcnJvciIsImludmFsaWRTZWxlY3RvclJlc3VsdEVycm9yIiwiQ2Fubm90T2J0YWluSW5mb0ZvckVsZW1lbnRTcGVjaWZpZWRCeVNlbGVjdG9yRXJyb3IiLCJhcGlGbkFyZ3MiLCJjYW5ub3RPYnRhaW5JbmZvRm9yRWxlbWVudFNwZWNpZmllZEJ5U2VsZWN0b3JFcnJvciIsIlBhZ2VMb2FkRXJyb3IiLCJlcnJNc2ciLCJ1cmwiLCJwYWdlTG9hZEVycm9yIiwiVW5jYXVnaHRFcnJvck9uUGFnZSIsImVyclN0YWNrIiwicGFnZURlc3RVcmwiLCJ1bmNhdWdodEVycm9yT25QYWdlIiwiVW5jYXVnaHRFcnJvckluVGVzdENvZGUiLCJlcnIiLCJ1bmNhdWdodEVycm9ySW5UZXN0Q29kZSIsIlN0cmluZyIsInJhd01lc3NhZ2UiLCJvcmlnaW5FcnJvciIsIlVuY2F1Z2h0Tm9uRXJyb3JPYmplY3RJblRlc3RDb2RlIiwib2JqIiwidW5jYXVnaHROb25FcnJvck9iamVjdEluVGVzdENvZGUiLCJvYmpUeXBlIiwib2JqU3RyIiwiVW5jYXVnaHRFcnJvckluQ2xpZW50RnVuY3Rpb25Db2RlIiwidW5jYXVnaHRFcnJvckluQ2xpZW50RnVuY3Rpb25Db2RlIiwiVW5jYXVnaHRFcnJvckluQ3VzdG9tRE9NUHJvcGVydHlDb2RlIiwicHJvcCIsInVuY2F1Z2h0RXJyb3JJbkN1c3RvbURPTVByb3BlcnR5Q29kZSIsInByb3BlcnR5IiwiVW5oYW5kbGVkUHJvbWlzZVJlamVjdGlvbkVycm9yIiwidW5oYW5kbGVkUHJvbWlzZVJlamVjdGlvbiIsIlVuY2F1Z2h0RXhjZXB0aW9uRXJyb3IiLCJ1bmNhdWdodEV4Y2VwdGlvbiIsIkV4dGVybmFsQXNzZXJ0aW9uTGlicmFyeUVycm9yIiwiZXh0ZXJuYWxBc3NlcnRpb25MaWJyYXJ5RXJyb3IiLCJBc3NlcnRpb25FeGVjdXRhYmxlQXJndW1lbnRFcnJvciIsImFyZ3VtZW50VmFsdWUiLCJpc0FQSUVycm9yIiwiYXNzZXJ0aW9uRXhlY3V0YWJsZUFyZ3VtZW50RXJyb3IiLCJtZXNzYWdlIiwiQXNzZXJ0aW9uV2l0aG91dE1ldGhvZENhbGxFcnJvciIsImFzc2VydGlvbldpdGhvdXRNZXRob2RDYWxsRXJyb3IiLCJBc3NlcnRpb25VbmF3YWl0ZWRQcm9taXNlRXJyb3IiLCJhc3NlcnRpb25VbmF3YWl0ZWRQcm9taXNlRXJyb3IiLCJBY3Rpb25JbnRlZ2VyT3B0aW9uRXJyb3IiLCJhY3Rpb25JbnRlZ2VyT3B0aW9uRXJyb3IiLCJBY3Rpb25Qb3NpdGl2ZUludGVnZXJPcHRpb25FcnJvciIsImFjdGlvblBvc2l0aXZlSW50ZWdlck9wdGlvbkVycm9yIiwiQWN0aW9uQm9vbGVhbk9wdGlvbkVycm9yIiwiYWN0aW9uQm9vbGVhbk9wdGlvbkVycm9yIiwiQWN0aW9uQm9vbGVhbkFyZ3VtZW50RXJyb3IiLCJhY3Rpb25Cb29sZWFuQXJndW1lbnRFcnJvciIsIkFjdGlvblNwZWVkT3B0aW9uRXJyb3IiLCJhY3Rpb25TcGVlZE9wdGlvbkVycm9yIiwiQWN0aW9uT3B0aW9uc1R5cGVFcnJvciIsImFjdHVhbFR5cGUiLCJhY3Rpb25PcHRpb25zVHlwZUVycm9yIiwiQWN0aW9uU3RyaW5nQXJndW1lbnRFcnJvciIsImFjdGlvblN0cmluZ0FyZ3VtZW50RXJyb3IiLCJBY3Rpb25OdWxsYWJsZVN0cmluZ0FyZ3VtZW50RXJyb3IiLCJhY3Rpb25OdWxsYWJsZVN0cmluZ0FyZ3VtZW50RXJyb3IiLCJBY3Rpb25JbnRlZ2VyQXJndW1lbnRFcnJvciIsImFjdGlvbkludGVnZXJBcmd1bWVudEVycm9yIiwiQWN0aW9uUm9sZUFyZ3VtZW50RXJyb3IiLCJhY3Rpb25Sb2xlQXJndW1lbnRFcnJvciIsIkFjdGlvblBvc2l0aXZlSW50ZWdlckFyZ3VtZW50RXJyb3IiLCJhY3Rpb25Qb3NpdGl2ZUludGVnZXJBcmd1bWVudEVycm9yIiwiQWN0aW9uU3RyaW5nT3JTdHJpbmdBcnJheUFyZ3VtZW50RXJyb3IiLCJhY3Rpb25TdHJpbmdPclN0cmluZ0FycmF5QXJndW1lbnRFcnJvciIsIkFjdGlvblN0cmluZ0FycmF5RWxlbWVudEVycm9yIiwiZWxlbWVudEluZGV4IiwiYWN0aW9uU3RyaW5nQXJyYXlFbGVtZW50RXJyb3IiLCJTZXRUZXN0U3BlZWRBcmd1bWVudEVycm9yIiwic2V0VGVzdFNwZWVkQXJndW1lbnRFcnJvciIsIkFjdGlvblVuc3VwcG9ydGVkRGV2aWNlVHlwZUVycm9yIiwiYWN0aW9uVW5zdXBwb3J0ZWREZXZpY2VUeXBlRXJyb3IiLCJBY3Rpb25TZWxlY3RvckVycm9yIiwic2VsZWN0b3JOYW1lIiwiYWN0aW9uU2VsZWN0b3JFcnJvciIsIkFjdGlvbkVsZW1lbnROb3RGb3VuZEVycm9yIiwiYWN0aW9uRWxlbWVudE5vdEZvdW5kRXJyb3IiLCJBY3Rpb25FbGVtZW50SXNJbnZpc2libGVFcnJvciIsImFjdGlvbkVsZW1lbnRJc0ludmlzaWJsZUVycm9yIiwiQWN0aW9uU2VsZWN0b3JNYXRjaGVzV3JvbmdOb2RlVHlwZUVycm9yIiwibm9kZURlc2NyaXB0aW9uIiwiYWN0aW9uU2VsZWN0b3JNYXRjaGVzV3JvbmdOb2RlVHlwZUVycm9yIiwiQWN0aW9uQWRkaXRpb25hbEVsZW1lbnROb3RGb3VuZEVycm9yIiwiYWN0aW9uQWRkaXRpb25hbEVsZW1lbnROb3RGb3VuZEVycm9yIiwiQWN0aW9uQWRkaXRpb25hbEVsZW1lbnRJc0ludmlzaWJsZUVycm9yIiwiYWN0aW9uQWRkaXRpb25hbEVsZW1lbnRJc0ludmlzaWJsZUVycm9yIiwiQWN0aW9uQWRkaXRpb25hbFNlbGVjdG9yTWF0Y2hlc1dyb25nTm9kZVR5cGVFcnJvciIsImFjdGlvbkFkZGl0aW9uYWxTZWxlY3Rvck1hdGNoZXNXcm9uZ05vZGVUeXBlRXJyb3IiLCJBY3Rpb25FbGVtZW50Tm9uRWRpdGFibGVFcnJvciIsImFjdGlvbkVsZW1lbnROb25FZGl0YWJsZUVycm9yIiwiQWN0aW9uRWxlbWVudE5vdFRleHRBcmVhRXJyb3IiLCJhY3Rpb25FbGVtZW50Tm90VGV4dEFyZWFFcnJvciIsIkFjdGlvbkVsZW1lbnROb25Db250ZW50RWRpdGFibGVFcnJvciIsImFjdGlvbkVsZW1lbnROb25Db250ZW50RWRpdGFibGVFcnJvciIsIkFjdGlvblJvb3RDb250YWluZXJOb3RGb3VuZEVycm9yIiwiYWN0aW9uUm9vdENvbnRhaW5lck5vdEZvdW5kRXJyb3IiLCJBY3Rpb25JbmNvcnJlY3RLZXlzRXJyb3IiLCJhY3Rpb25JbmNvcnJlY3RLZXlzRXJyb3IiLCJBY3Rpb25DYW5ub3RGaW5kRmlsZVRvVXBsb2FkRXJyb3IiLCJmaWxlUGF0aHMiLCJhY3Rpb25DYW5ub3RGaW5kRmlsZVRvVXBsb2FkRXJyb3IiLCJBY3Rpb25FbGVtZW50SXNOb3RGaWxlSW5wdXRFcnJvciIsImFjdGlvbkVsZW1lbnRJc05vdEZpbGVJbnB1dEVycm9yIiwiQWN0aW9uSW52YWxpZFNjcm9sbFRhcmdldEVycm9yIiwic2Nyb2xsVGFyZ2V0WFZhbGlkIiwic2Nyb2xsVGFyZ2V0WVZhbGlkIiwiYWN0aW9uSW52YWxpZFNjcm9sbFRhcmdldEVycm9yIiwicHJvcGVydGllcyIsIldpbmRvd0RpbWVuc2lvbnNPdmVyZmxvd0Vycm9yIiwid2luZG93RGltZW5zaW9uc092ZXJmbG93RXJyb3IiLCJJbnZhbGlkRWxlbWVudFNjcmVlbnNob3REaW1lbnNpb25zRXJyb3IiLCJ3aWR0aCIsImhlaWdodCIsImludmFsaWRFbGVtZW50U2NyZWVuc2hvdERpbWVuc2lvbnNFcnJvciIsIndpZHRoSXNJbnZhbGlkIiwiaGVpZ2h0SXNJbnZhbGlkIiwidmVyYiIsImRpbWVuc2lvbnMiLCJGb3JiaWRkZW5DaGFyYWN0ZXJzSW5TY3JlZW5zaG90UGF0aEVycm9yIiwic2NyZWVuc2hvdFBhdGgiLCJmb3JiaWRkZW5DaGFyc0xpc3QiLCJmb3JiaWRkZW5DaGFyYWN0ZXJzSW5TY3JlZW5zaG90UGF0aEVycm9yIiwiUm9sZVN3aXRjaEluUm9sZUluaXRpYWxpemVyRXJyb3IiLCJyb2xlU3dpdGNoSW5Sb2xlSW5pdGlhbGl6ZXJFcnJvciIsIkFjdGlvbkVsZW1lbnROb3RJZnJhbWVFcnJvciIsImFjdGlvbkVsZW1lbnROb3RJZnJhbWVFcnJvciIsIkFjdGlvbklmcmFtZUlzTm90TG9hZGVkRXJyb3IiLCJhY3Rpb25JZnJhbWVJc05vdExvYWRlZEVycm9yIiwiQ3VycmVudElmcmFtZUlzTm90TG9hZGVkRXJyb3IiLCJjdXJyZW50SWZyYW1lSXNOb3RMb2FkZWRFcnJvciIsIkN1cnJlbnRJZnJhbWVOb3RGb3VuZEVycm9yIiwiY3VycmVudElmcmFtZU5vdEZvdW5kRXJyb3IiLCJDdXJyZW50SWZyYW1lSXNJbnZpc2libGVFcnJvciIsImN1cnJlbnRJZnJhbWVJc0ludmlzaWJsZUVycm9yIiwiTmF0aXZlRGlhbG9nTm90SGFuZGxlZEVycm9yIiwiZGlhbG9nVHlwZSIsIm5hdGl2ZURpYWxvZ05vdEhhbmRsZWRFcnJvciIsInBhZ2VVcmwiLCJVbmNhdWdodEVycm9ySW5OYXRpdmVEaWFsb2dIYW5kbGVyIiwidW5jYXVnaHRFcnJvckluTmF0aXZlRGlhbG9nSGFuZGxlciIsIlNldE5hdGl2ZURpYWxvZ0hhbmRsZXJDb2RlV3JvbmdUeXBlRXJyb3IiLCJzZXROYXRpdmVEaWFsb2dIYW5kbGVyQ29kZVdyb25nVHlwZUVycm9yIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFJQTs7OztBQUVBO0FBQ0E7QUFDQSxNQUFNQSxnQkFBTixDQUF1QjtBQUNuQkMsZ0JBQWFDLElBQWIsRUFBbUI7QUFDZixhQUFLQSxJQUFMLEdBQXVCQSxJQUF2QjtBQUNBLGFBQUtDLGVBQUwsR0FBdUIsSUFBdkI7QUFDQSxhQUFLQyxRQUFMLEdBQXVCLElBQXZCO0FBQ0g7QUFMa0IsQyxDQVJ2QjtBQUNBO0FBQ0E7QUFDQTs7O0FBYUEsTUFBTUMscUJBQU4sU0FBb0NMLGdCQUFwQyxDQUFxRDtBQUNqREMsZ0JBQWFDLElBQWIsRUFBbUJJLFVBQW5CLEVBQStCQyxXQUEvQixFQUE0QztBQUN4QyxjQUFNTCxJQUFOOztBQUVBLGFBQUtJLFVBQUwsR0FBbUJBLFVBQW5CO0FBQ0EsYUFBS0MsV0FBTCxHQUFtQkEsV0FBbkI7QUFDSDtBQU5nRDs7QUFTckQsTUFBTUMsdUJBQU4sU0FBc0NSLGdCQUF0QyxDQUF1RDtBQUNuREMsZ0JBQWFDLElBQWIsRUFBbUJPLFlBQW5CLEVBQWlDRixXQUFqQyxFQUE4QztBQUMxQyxjQUFNTCxJQUFOOztBQUVBLGFBQUtPLFlBQUwsR0FBb0JBLFlBQXBCO0FBQ0EsYUFBS0YsV0FBTCxHQUFvQkEsV0FBcEI7QUFDSDtBQU5rRDs7QUFTdkQ7QUFDQTtBQUNPLE1BQU1HLGlCQUFOLFNBQWdDVixnQkFBaEMsQ0FBaUQ7QUFDcERDLGdCQUFhRyxRQUFiLEVBQXVCO0FBQ25CLGNBQU0sdUJBQWdCTyxpQkFBdEI7O0FBRUEsYUFBS1AsUUFBTCxHQUFnQkEsUUFBaEI7QUFDSDtBQUxtRDs7UUFBM0NNLGlCLEdBQUFBLGlCLEVBU2I7QUFDQTs7QUFDTyxNQUFNRSx3Q0FBTixTQUF1RFosZ0JBQXZELENB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YixFQUF5QnRJLE1BQXpCLEVBQWlDQyxHQUFqQyxFQUFzQztBQUNsQyxjQUFNLHVCQUFnQnlJLGtDQUF0Qjs7QUFFQSxhQUFLSixVQUFMLEdBQWtCQSxVQUFsQjtBQUNBLGFBQUt0SSxNQUFMLEdBQWtCQSxNQUFsQjtBQUNBLGFBQUt3SSxPQUFMLEdBQWtCdkksR0FBbEI7QUFDSDtBQVBvRTs7UUFBNUR3SSxrQyxHQUFBQSxrQztBQVVOLE1BQU1FLHdDQUFOLFNBQXVEckssZ0JBQXZELENBQXdFO0FBQzNFQyxnQkFBYTJFLFVBQWIsRUFBeUI7QUFDckIsY0FBTSx1QkFBZ0IwRix3Q0FBdEI7O0FBRUEsYUFBSzFGLFVBQUwsR0FBa0JBLFVBQWxCO0FBQ0g7QUFMMEU7UUFBbEV5Rix3QyxHQUFBQSx3QyIsImZpbGUiOiJlcnJvcnMvdGVzdC1ydW4vaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBXQVJOSU5HOiB0aGlzIGZpbGUgaXMgdXNlZCBieSBib3RoIHRoZSBjbGllbnQgYW5kIHRoZSBzZXJ2ZXIuXG4vLyBEbyBub3QgdXNlIGFueSBicm93c2VyIG9yIG5vZGUtc3BlY2lmaWMgQVBJIVxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuaW1wb3J0IHsgVEVTVF9SVU5fRVJST1JTIH0gZnJvbSAnLi4vdHlwZXMnO1xuXG4vLyBCYXNlXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBUZXN0UnVuRXJyb3JCYXNlIHtcbiAgICBjb25zdHJ1Y3RvciAoY29kZSkge1xuICAgICAgICB0aGlzLmNvZGUgICAgICAgICAgICA9IGNvZGU7XG4gICAgICAgIHRoaXMuaXNUZXN0Q2FmZUVycm9yID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5jYWxsc2l0ZSAgICAgICAgPSBudWxsO1xuICAgIH1cbn1cblxuY2xhc3MgQWN0aW9uT3B0aW9uRXJyb3JCYXNlIGV4dGVuZHMgVGVzdFJ1bkVycm9yQmFzZSB7XG4gICAgY29uc3RydWN0b3IgKGNvZGUsIG9wdGlvbk5hbWUsIGFjdHVhbFZhbHVlKSB7XG4gICAgICAgIHN1cGVyKGNvZGUpO1xuXG4gICAgICAgIHRoaXMub3B0aW9uTmFtZSAgPSBvcHRpb25OYW1lO1xuICAgICAgICB0aGlzLmFjdHVhbFZhbHVlID0gYWN0dWFsVmFsdWU7XG4gICAgfVxufVxuXG5jbGFzcyBBY3Rpb25Bcmd1bWVudEVycm9yQmFzZSBleHRlbmRzIFRlc3RSdW5FcnJvckJhc2Uge1xuICAgIGNvbnN0cnVjdG9yIChjb2RlLCBhcmd1bWVudE5hbWUsIGFjdHVhbFZhbHVlKSB7XG4gICAgICAgIHN1cGVyKGNvZGUpO1xuXG4gICAgICAgIHRoaXMuYXJndW1lbnROYW1lID0gYXJndW1lbnROYW1lO1xuICAgICAgICB0aGlzLmFjdHVhbFZhbHVlICA9IGFjdHVhbFZhbHVlO1xuICAgIH1cbn1cblxuLy8gU3luY2hyb25pemF0aW9uIGVycm9yc1xuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuZXhwb3J0IGNsYXNzIE1pc3NpbmdBd2FpdEVycm9yIGV4dGVuZHMgVGVzdFJ1bkVycm9yQmFzZSB7XG4gICAgY29uc3RydWN0b3IgKGNhbGxzaXRlKSB7XG4gICAgICAgIHN1cGVyKFRFU1RfUlVOX0VSUk9SUy5taXNzaW5nQXdhaXRFcnJvcik7XG5cbiAgICAgICAgdGhpcy5jYWxsc2l0ZSA9IGNhbGxzaXRlO1xuICAgIH1cbn1cblxuXG4vLyBDbGllbnQgZnVuY3Rpb24gZXJyb3JzXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5leHBvcnQgY2xhc3MgQ2xpZW50RnVuY3Rpb25FeGVjdXRpb25JbnRlcnJ1cHRpb25FcnJvciBleHRlbmRzIFRlc3RSdW5FcnJvckJhc2Uge1xuICAgIGNvbnN0cnVjdG9yIChpbnN0YW50aWF0aW9uQ2FsbHNpdGVOYW1lKSB7XG4gICAgICAgIHN1cGVyKFRFU1RfUlVOX0VSUk9SUy5jbGllbnRGdW5jdGlvbkV4ZWN1dGlvbkludGVycnVwdGlvbkVycm9yKTtcblxuICAgICAgICB0aGlzLmluc3RhbnRpYXRpb25DYWxsc2l0ZU5hbWUgPSBpbnN0YW50aWF0aW9uQ2FsbHNpdGVOYW1lO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIERvbU5vZGVDbGllbnRGdW5jdGlvblJlc3VsdEVycm9yIGV4dGVuZHMgVGVzdFJ1bkVycm9yQmFzZSB7XG4gICAgY29uc3RydWN0b3IgKGluc3RhbnRpYXRpb25DYWxsc2l0ZU5hbWUpIHtcbiAgICAgICAgc3VwZXIoVEVTVF9SVU5fRVJST1JTLmRvbU5vZGVDbGllbnRGdW5jdGlvblJlc3VsdEVycm9yKTtcblxuICAgICAgICB0aGlzLmluc3RhbnRpYXRpb25DYWxsc2l0ZU5hbWUgPSBpbnN0YW50aWF0aW9uQ2FsbHNpdGVOYW1lO1xuICAgIH1cbn1cblxuLy8gU2VsZWN0b3IgZXJyb3JzXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBTZWxlY3RvckVycm9yQmFzZSBleHRlbmRzIFRlc3RSdW5FcnJvckJhc2Uge1xuICAgIGNvbnN0cnVjdG9yIChjb2RlLCB7IGFwaUZuQ2hhaW4sIGFwaUZuSW5kZXggfSkge1xuICAgICAgICBzdXBlcihjb2RlKTtcblxuICAgICAgICB0aGlzLmFwaUZuQ2hhaW4gPSBhcGlGbkNoYWluO1xuICAgICAgICB0aGlzLmFwaUZuSW5kZXggPSBhcGlGbkluZGV4O1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIEludmFsaWRTZWxlY3RvclJlc3VsdEVycm9yIGV4dGVuZHMgVGVzdFJ1bkVycm9yQmFzZSB7XG4gICAgY29uc3RydWN0b3IgKCkge1xuICAgICAgICBzdXBlcihURVNUX1JVTl9FUlJPUlMuaW52YWxpZFNlbGVjdG9yUmVzdWx0RXJyb3IpO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIENhbm5vdE9idGFpbkluZm9Gb3JFbGVtZW50U3BlY2lmaWVkQnlTZWxlY3RvckVycm9yIGV4dGVuZHMgU2VsZWN0b3JFcnJvckJhc2Uge1xuICAgIGNvbnN0cnVjdG9yIChjYWxsc2l0ZSwgYXBpRm5BcmdzKSB7XG4gICAgICAgIHN1cGVyKFRFU1RfUlVOX0VSUk9SUy5jYW5ub3RPYnRhaW5JbmZvRm9yRWxlbWVudFNwZWNpZmllZEJ5U2VsZWN0b3JFcnJvciwgYXBpRm5BcmdzKTtcblxuICAgICAgICB0aGlzLmNhbGxzaXRlID0gY2FsbHNpdGU7XG4gICAgfVxufVxuXG4vLyBQYWdlIGVycm9yc1xuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuZXhwb3J0IGNsYXNzIFBhZ2VMb2FkRXJyb3IgZXh0ZW5kcyBUZXN0UnVuRXJyb3JCYXNlIHtcbiAgICBjb25zdHJ1Y3RvciAoZXJyTXNnLCB1cmwpIHtcbiAgICAgICAgc3VwZXIoVEVTVF9SVU5fRVJST1JTLnBhZ2VMb2FkRXJyb3IpO1xuXG4gICAgICAgIHRoaXMudXJsICAgID0gdXJsO1xuICAgICAgICB0aGlzLmVyck1zZyA9IGVyck1zZztcbiAgICB9XG59XG5cblxuLy8gVW5jYXVnaHQgZXJyb3JzXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5leHBvcnQgY2xhc3MgVW5jYXVnaHRFcnJvck9uUGFnZSBleHRlbmRzIFRlc3RSdW5FcnJvckJhc2Uge1xuICAgIGNvbnN0cnVjdG9yIChlcnJTdGFjaywgcGFnZURlc3RVcmwpIHtcbiAgICAgICAgc3VwZXIoVEVTVF9SVU5fRVJST1JTLnVuY2F1Z2h0RXJyb3JPblBhZ2UpO1xuXG4gICAgICAgIHRoaXMuZXJyU3RhY2sgICAgPSBlcnJTdGFjaztcbiAgICAgICAgdGhpcy5wYWdlRGVzdFVybCA9IHBhZ2VEZXN0VXJsO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIFVuY2F1Z2h0RXJyb3JJblRlc3RDb2RlIGV4dGVuZHMgVGVzdFJ1bkVycm9yQmFzZSB7XG4gICAgY29uc3RydWN0b3IgKGVyciwgY2FsbHNpdGUpIHtcbiAgICAgICAgc3VwZXIoVEVTVF9SVU5fRVJST1JTLnVuY2F1Z2h0RXJyb3JJblRlc3RDb2RlKTtcblxuICAgICAgICB0aGlzLmVyck1zZyAgICAgID0gU3RyaW5nKGVyci5yYXdNZXNzYWdlIHx8IGVycik7XG4gICAgICAgIHRoaXMuY2FsbHNpdGUgICAgPSBlcnIuY2FsbHNpdGUgfHwgY2FsbHNpdGU7XG4gICAgICAgIHRoaXMub3JpZ2luRXJyb3IgPSBlcnI7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgVW5jYXVnaHROb25FcnJvck9iamVjdEluVGVzdENvZGUgZXh0ZW5kcyBUZXN0UnVuRXJyb3JCYXNlIHtcbiAgICBjb25zdHJ1Y3RvciAob2JqKSB7XG4gICAgICAgIHN1cGVyKFRFU1RfUlVOX0VSUk9SUy51bmNhdWdodE5vbkVycm9yT2JqZWN0SW5UZXN0Q29kZSk7XG5cbiAgICAgICAgdGhpcy5vYmpUeXBlID0gdHlwZW9mIG9iajtcbiAgICAgICAgdGhpcy5vYmpTdHIgID0gSlNPTi5zdHJpbmdpZnkob2JqKTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBVbmNhdWdodEVycm9ySW5DbGllbnRGdW5jdGlvbkNvZGUgZXh0ZW5kcyBUZXN0UnVuRXJyb3JCYXNlIHtcbiAgICBjb25zdHJ1Y3RvciAoaW5zdGFudGlhdGlvbkNhbGxzaXRlTmFtZSwgZXJyKSB7XG4gICAgICAgIHN1cGVyKFRFU1RfUlVOX0VSUk9SUy51bmNhdWdodEVycm9ySW5DbGllbnRGdW5jdGlvbkNvZGUpO1xuXG4gICAgICAgIHRoaXMuZXJyTXNnICAgICAgICAgICAgICAgICAgICA9IFN0cmluZyhlcnIpO1xuICAgICAgICB0aGlzLmluc3RhbnRpYXRpb25DYWxsc2l0ZU5hbWUgPSBpbnN0YW50aWF0aW9uQ2FsbHNpdGVOYW1lO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIFVuY2F1Z2h0RXJyb3JJbkN1c3RvbURPTVByb3BlcnR5Q29kZSBleHRlbmRzIFRlc3RSdW5FcnJvckJhc2Uge1xuICAgIGNvbnN0cnVjdG9yIChpbnN0YW50aWF0aW9uQ2FsbHNpdGVOYW1lLCBlcnIsIHByb3ApIHtcbiAgICAgICAgc3VwZXIoVEVTVF9SVU5fRVJST1JTLnVuY2F1Z2h0RXJyb3JJbkN1c3RvbURPTVByb3BlcnR5Q29kZSwgZXJyLCBwcm9wKTtcblxuICAgICAgICB0aGlzLmVyck1zZyAgICAgICAgICAgICAgICAgICAgPSBTdHJpbmcoZXJyKTtcbiAgICAgICAgdGhpcy5wcm9wZXJ0eSAgICAgICAgICAgICAgICAgID0gcHJvcDtcbiAgICAgICAgdGhpcy5pbnN0YW50aWF0aW9uQ2FsbHNpdGVOYW1lID0gaW5zdGFudGlhdGlvbkNhbGxzaXRlTmFtZTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBVbmhhbmRsZWRQcm9taXNlUmVqZWN0aW9uRXJyb3IgZXh0ZW5kcyBUZXN0UnVuRXJyb3JCYXNlIHtcbiAgICBjb25zdHJ1Y3RvciAoZXJyKSB7XG4gICAgICAgIHN1cGVyKFRFU1RfUlVOX0VSUk9SUy51bmhhbmRsZWRQcm9taXNlUmVqZWN0aW9uKTtcblxuICAgICAgICB0aGlzLmVyck1zZyA9IFN0cmluZyhlcnIpO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIFVuY2F1Z2h0RXhjZXB0aW9uRXJyb3IgZXh0ZW5kcyBUZXN0UnVuRXJyb3JCYXNlIHtcbiAgICBjb25zdHJ1Y3RvciAoZXJyKSB7XG4gICAgICAgIHN1cGVyKFRFU1RfUlVOX0VSUk9SUy51bmNhdWdodEV4Y2VwdGlvbik7XG5cbiAgICAgICAgdGhpcy5lcnJNc2cgPSBTdHJpbmcoZXJyKTtcbiAgICB9XG59XG5cblxuLy8gQXNzZXJ0aW9uIGVycm9yc1xuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuZXhwb3J0IGNsYXNzIEV4dGVybmFsQXNzZXJ0aW9uTGlicmFyeUVycm9yIGV4dGVuZHMgVGVzdFJ1bkVycm9yQmFzZSB7XG4gICAgY29uc3RydWN0b3IgKGVyciwgY2FsbHNpdGUpIHtcbiAgICAgICAgc3VwZXIoVEVTVF9SVU5fRVJST1JTLmV4dGVybmFsQXNzZXJ0aW9uTGlicmFyeUVycm9yKTtcblxuICAgICAgICB0aGlzLmVyck1zZyAgID0gU3RyaW5nKGVycik7XG4gICAgICAgIHRoaXMuY2FsbHNpdGUgPSBjYWxsc2l0ZTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBBc3NlcnRpb25FeGVjdXRhYmxlQXJndW1lbnRFcnJvciBleHRlbmRzIEFjdGlvbkFyZ3VtZW50RXJyb3JCYXNlIHtcbiAgICBjb25zdHJ1Y3RvciAoYXJndW1lbnROYW1lLCBhcmd1bWVudFZhbHVlLCBlcnIsIGlzQVBJRXJyb3IpIHtcbiAgICAgICAgc3VwZXIoVEVTVF9SVU5fRVJST1JTLmFzc2VydGlvbkV4ZWN1dGFibGVBcmd1bWVudEVycm9yLCBhcmd1bWVudE5hbWUsIGFyZ3VtZW50VmFsdWUpO1xuXG4gICAgICAgIHRoaXMuZXJyTXNnICAgICAgPSBpc0FQSUVycm9yID8gZXJyLnJhd01lc3NhZ2UgOiBlcnIubWVzc2FnZTtcbiAgICAgICAgdGhpcy5vcmlnaW5FcnJvciA9IGVycjtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBBc3NlcnRpb25XaXRob3V0TWV0aG9kQ2FsbEVycm9yIGV4dGVuZHMgVGVzdFJ1bkVycm9yQmFzZSB7XG4gICAgY29uc3RydWN0b3IgKGNhbGxzaXRlKSB7XG4gICAgICAgIHN1cGVyKFRFU1RfUlVOX0VSUk9SUy5hc3NlcnRpb25XaXRob3V0TWV0aG9kQ2FsbEVycm9yKTtcblxuICAgICAgICB0aGlzLmNhbGxzaXRlID0gY2FsbHNpdGU7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgQXNzZXJ0aW9uVW5hd2FpdGVkUHJvbWlzZUVycm9yIGV4dGVuZHMgVGVzdFJ1bkVycm9yQmFzZSB7XG4gICAgY29uc3RydWN0b3IgKGNhbGxzaXRlKSB7XG4gICAgICAgIHN1cGVyKFRFU1RfUlVOX0VSUk9SUy5hc3NlcnRpb25VbmF3YWl0ZWRQcm9taXNlRXJyb3IpO1xuXG4gICAgICAgIHRoaXMuY2FsbHNpdGUgPSBjYWxsc2l0ZTtcbiAgICB9XG59XG5cbi8vIEFjdGlvbiBwYXJhbWV0ZXJzIGVycm9yc1xuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gT3B0aW9ucyBlcnJvcnNcbmV4cG9ydCBjbGFzcyBBY3Rpb25JbnRlZ2VyT3B0aW9uRXJyb3IgZXh0ZW5kcyBBY3Rpb25PcHRpb25FcnJvckJhc2Uge1xuICAgIGNvbnN0cnVjdG9yIChvcHRpb25OYW1lLCBhY3R1YWxWYWx1ZSkge1xuICAgICAgICBzdXBlcihURVNUX1JVTl9FUlJPUlMuYWN0aW9uSW50ZWdlck9wdGlvbkVycm9yLCBvcHRpb25OYW1lLCBhY3R1YWxWYWx1ZSk7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgQWN0aW9uUG9zaXRpdmVJbnRlZ2VyT3B0aW9uRXJyb3IgZXh0ZW5kcyBBY3Rpb25PcHRpb25FcnJvckJhc2Uge1xuICAgIGNvbnN0cnVjdG9yIChvcHRpb25OYW1lLCBhY3R1YWxWYWx1ZSkge1xuICAgICAgICBzdXBlcihURVNUX1JVTl9FUlJPUlMuYWN0aW9uUG9zaXRpdmVJbnRlZ2VyT3B0aW9uRXJyb3IsIG9wdGlvbk5hbWUsIGFjdHVhbFZhbHVlKTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBBY3Rpb25Cb29sZWFuT3B0aW9uRXJyb3IgZXh0ZW5kcyBBY3Rpb25PcHRpb25FcnJvckJhc2Uge1xuICAgIGNvbnN0cnVjdG9yIChvcHRpb25OYW1lLCBhY3R1YWxWYWx1ZSkge1xuICAgICAgICBzdXBlcihURVNUX1JVTl9FUlJPUlMuYWN0aW9uQm9vbGVhbk9wdGlvbkVycm9yLCBvcHRpb25OYW1lLCBhY3R1YWxWYWx1ZSk7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgQWN0aW9uQm9vbGVhbkFyZ3VtZW50RXJyb3IgZXh0ZW5kcyBBY3Rpb25Bcmd1bWVudEVycm9yQmFzZSB7XG4gICAgY29uc3RydWN0b3IgKGFyZ3VtZW50TmFtZSwgYWN0dWFsVmFsdWUpIHtcbiAgICAgICAgc3VwZXIoVEVTVF9SVU5fRVJST1JTLmFjdGlvbkJvb2xlYW5Bcmd1bWVudEVycm9yLCBhcmd1bWVudE5hbWUsIGFjdHVhbFZhbHVlKTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBBY3Rpb25TcGVlZE9wdGlvbkVycm9yIGV4dGVuZHMgQWN0aW9uT3B0aW9uRXJyb3JCYXNlIHtcbiAgICBjb25zdHJ1Y3RvciAob3B0aW9uTmFtZSwgYWN0dWFsVmFsdWUpIHtcbiAgICAgICAgc3VwZXIoVEVTVF9SVU5fRVJST1JTLmFjdGlvblNwZWVkT3B0aW9uRXJyb3IsIG9wdGlvbk5hbWUsIGFjdHVhbFZhbHVlKTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBBY3Rpb25PcHRpb25zVHlwZUVycm9yIGV4dGVuZHMgVGVzdFJ1bkVycm9yQmFzZSB7XG4gICAgY29uc3RydWN0b3IgKGFjdHVhbFR5cGUpIHtcbiAgICAgICAgc3VwZXIoVEVTVF9SVU5fRVJST1JTLmFjdGlvbk9wdGlvbnNUeXBlRXJyb3IpO1xuXG4gICAgICAgIHRoaXMuYWN0dWFsVHlwZSA9IGFjdHVhbFR5cGU7XG4gICAgfVxufVxuXG5cbi8vIEFyZ3VtZW50cyBlcnJvcnNcbmV4cG9ydCBjbGFzcyBBY3Rpb25TdHJpbmdBcmd1bWVudEVycm9yIGV4dGVuZHMgQWN0aW9uQXJndW1lbnRFcnJvckJhc2Uge1xuICAgIGNvbnN0cnVjdG9yIChhcmd1bWVudE5hbWUsIGFjdHVhbFZhbHVlKSB7XG4gICAgICAgIHN1cGVyKFRFU1RfUlVOX0VSUk9SUy5hY3Rpb25TdHJpbmdBcmd1bWVudEVycm9yLCBhcmd1bWVudE5hbWUsIGFjdHVhbFZhbHVlKTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBBY3Rpb25OdWxsYWJsZVN0cmluZ0FyZ3VtZW50RXJyb3IgZXh0ZW5kcyBBY3Rpb25Bcmd1bWVudEVycm9yQmFzZSB7XG4gICAgY29uc3RydWN0b3IgKGFyZ3VtZW50TmFtZSwgYWN0dWFsVmFsdWUpIHtcbiAgICAgICAgc3VwZXIoVEVTVF9SVU5fRVJST1JTLmFjdGlvbk51bGxhYmxlU3RyaW5nQXJndW1lbnRFcnJvciwgYXJndW1lbnROYW1lLCBhY3R1YWxWYWx1ZSk7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgQWN0aW9uSW50ZWdlckFyZ3VtZW50RXJyb3IgZXh0ZW5kcyBBY3Rpb25Bcmd1bWVudEVycm9yQmFzZSB7XG4gICAgY29uc3RydWN0b3IgKGFyZ3VtZW50TmFtZSwgYWN0dWFsVmFsdWUpIHtcbiAgICAgICAgc3VwZXIoVEVTVF9SVU5fRVJST1JTLmFjdGlvbkludGVnZXJBcmd1bWVudEVycm9yLCBhcmd1bWVudE5hbWUsIGFjdHVhbFZhbHVlKTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBBY3Rpb25Sb2xlQXJndW1lbnRFcnJvciBleHRlbmRzIEFjdGlvbkFyZ3VtZW50RXJyb3JCYXNlIHtcbiAgICBjb25zdHJ1Y3RvciAoYXJndW1lbnROYW1lLCBhY3R1YWxWYWx1ZSkge1xuICAgICAgICBzdXBlcihURVNUX1JVTl9FUlJPUlMuYWN0aW9uUm9sZUFyZ3VtZW50RXJyb3IsIGFyZ3VtZW50TmFtZSwgYWN0dWFsVmFsdWUpO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIEFjdGlvblBvc2l0aXZlSW50ZWdlckFyZ3VtZW50RXJyb3IgZXh0ZW5kcyBBY3Rpb25Bcmd1bWVudEVycm9yQmFzZSB7XG4gICAgY29uc3RydWN0b3IgKGFyZ3VtZW50TmFtZSwgYWN0dWFsVmFsdWUpIHtcbiAgICAgICAgc3VwZXIoVEVTVF9SVU5fRVJST1JTLmFjdGlvblBvc2l0aXZlSW50ZWdlckFyZ3VtZW50RXJyb3IsIGFyZ3VtZW50TmFtZSwgYWN0dWFsVmFsdWUpO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIEFjdGlvblN0cmluZ09yU3RyaW5nQXJyYXlBcmd1bWVudEVycm9yIGV4dGVuZHMgQWN0aW9uQXJndW1lbnRFcnJvckJhc2Uge1xuICAgIGNvbnN0cnVjdG9yIChhcmd1bWVudE5hbWUsIGFjdHVhbFZhbHVlKSB7XG4gICAgICAgIHN1cGVyKFRFU1RfUlVOX0VSUk9SUy5hY3Rpb25TdHJpbmdPclN0cmluZ0FycmF5QXJndW1lbnRFcnJvciwgYXJndW1lbnROYW1lLCBhY3R1YWxWYWx1ZSk7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgQWN0aW9uU3RyaW5nQXJyYXlFbGVtZW50RXJyb3IgZXh0ZW5kcyBBY3Rpb25Bcmd1bWVudEVycm9yQmFzZSB7XG4gICAgY29uc3RydWN0b3IgKGFyZ3VtZW50TmFtZSwgYWN0dWFsVmFsdWUsIGVsZW1lbnRJbmRleCkge1xuICAgICAgICBzdXBlcihURVNUX1JVTl9FUlJPUlMuYWN0aW9uU3RyaW5nQXJyYXlFbGVtZW50RXJyb3IsIGFyZ3VtZW50TmFtZSwgYWN0dWFsVmFsdWUpO1xuXG4gICAgICAgIHRoaXMuZWxlbWVudEluZGV4ID0gZWxlbWVudEluZGV4O1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIFNldFRlc3RTcGVlZEFyZ3VtZW50RXJyb3IgZXh0ZW5kcyBBY3Rpb25Bcmd1bWVudEVycm9yQmFzZSB7XG4gICAgY29uc3RydWN0b3IgKGFyZ3VtZW50TmFtZSwgYWN0dWFsVmFsdWUpIHtcbiAgICAgICAgc3VwZXIoVEVTVF9SVU5fRVJST1JTLnNldFRlc3RTcGVlZEFyZ3VtZW50RXJyb3IsIGFyZ3VtZW50TmFtZSwgYWN0dWFsVmFsdWUpO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIEFjdGlvblVuc3VwcG9ydGVkRGV2aWNlVHlwZUVycm9yIGV4dGVuZHMgQWN0aW9uQXJndW1lbnRFcnJvckJhc2Uge1xuICAgIGNvbnN0cnVjdG9yIChhcmd1bWVudE5hbWUsIGFyZ3VtZW50VmFsdWUpIHtcbiAgICAgICAgc3VwZXIoVEVTVF9SVU5fRVJST1JTLmFjdGlvblVuc3VwcG9ydGVkRGV2aWNlVHlwZUVycm9yLCBhcmd1bWVudE5hbWUsIGFyZ3VtZW50VmFsdWUpO1xuICAgIH1cbn1cblxuLy8gU2VsZWN0b3IgZXJyb3JzXG5leHBvcnQgY2xhc3MgQWN0aW9uU2VsZWN0b3JFcnJvciBleHRlbmRzIFRlc3RSdW5FcnJvckJhc2Uge1xuICAgIGNvbnN0cnVjdG9yIChzZWxlY3Rvck5hbWUsIGVyciwgaXNBUElFcnJvcikge1xuICAgICAgICBzdXBlcihURVNUX1JVTl9FUlJPUlMuYWN0aW9uU2VsZWN0b3JFcnJvcik7XG5cbiAgICAgICAgdGhpcy5zZWxlY3Rvck5hbWUgPSBzZWxlY3Rvck5hbWU7XG4gICAgICAgIHRoaXMuZXJyTXNnICAgICAgID0gaXNBUElFcnJvciA/IGVyci5yYXdNZXNzYWdlIDogZXJyLm1lc3NhZ2U7XG4gICAgICAgIHRoaXMub3JpZ2luRXJyb3IgID0gZXJyO1xuICAgIH1cbn1cblxuLy8gQWN0aW9uIGV4ZWN1dGlvbiBlcnJvcnNcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmV4cG9ydCBjbGFzcyBBY3Rpb25FbGVtZW50Tm90Rm91bmRFcnJvciBleHRlbmRzIFNlbGVjdG9yRXJyb3JCYXNlIHtcbiAgICBjb25zdHJ1Y3RvciAoYXBpRm5BcmdzKSB7XG4gICAgICAgIHN1cGVyKFRFU1RfUlVOX0VSUk9SUy5hY3Rpb25FbGVtZW50Tm90Rm91bmRFcnJvciwgYXBpRm5BcmdzKTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBBY3Rpb25FbGVtZW50SXNJbnZpc2libGVFcnJvciBleHRlbmRzIFRlc3RSdW5FcnJvckJhc2Uge1xuICAgIGNvbnN0cnVjdG9yICgpIHtcbiAgICAgICAgc3VwZXIoVEVTVF9SVU5fRVJST1JTLmFjdGlvbkVsZW1lbnRJc0ludmlzaWJsZUVycm9yKTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBBY3Rpb25TZWxlY3Rvck1hdGNoZXNXcm9uZ05vZGVUeXBlRXJyb3IgZXh0ZW5kcyBUZXN0UnVuRXJyb3JCYXNlIHtcbiAgICBjb25zdHJ1Y3RvciAobm9kZURlc2NyaXB0aW9uKSB7XG4gICAgICAgIHN1cGVyKFRFU1RfUlVOX0VSUk9SUy5hY3Rpb25TZWxlY3Rvck1hdGNoZXNXcm9uZ05vZGVUeXBlRXJyb3IpO1xuXG4gICAgICAgIHRoaXMubm9kZURlc2NyaXB0aW9uID0gbm9kZURlc2NyaXB0aW9uO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIEFjdGlvbkFkZGl0aW9uYWxFbGVtZW50Tm90Rm91bmRFcnJvciBleHRlbmRzIFNlbGVjdG9yRXJyb3JCYXNlIHtcbiAgICBjb25zdHJ1Y3RvciAoYXJndW1lbnROYW1lLCBhcGlGbkFyZ3MpIHtcbiAgICAgICAgc3VwZXIoVEVTVF9SVU5fRVJST1JTLmFjdGlvbkFkZGl0aW9uYWxFbGVtZW50Tm90Rm91bmRFcnJvciwgYXBpRm5BcmdzKTtcblxuICAgICAgICB0aGlzLmFyZ3VtZW50TmFtZSA9IGFyZ3VtZW50TmFtZTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBBY3Rpb25BZGRpdGlvbmFsRWxlbWVudElzSW52aXNpYmxlRXJyb3IgZXh0ZW5kcyBUZXN0UnVuRXJyb3JCYXNlIHtcbiAgICBjb25zdHJ1Y3RvciAoYXJndW1lbnROYW1lKSB7XG4gICAgICAgIHN1cGVyKFRFU1RfUlVOX0VSUk9SUy5hY3Rpb25BZGRpdGlvbmFsRWxlbWVudElzSW52aXNpYmxlRXJyb3IpO1xuXG4gICAgICAgIHRoaXMuYXJndW1lbnROYW1lID0gYXJndW1lbnROYW1lO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIEFjdGlvbkFkZGl0aW9uYWxTZWxlY3Rvck1hdGNoZXNXcm9uZ05vZGVUeXBlRXJyb3IgZXh0ZW5kcyBUZXN0UnVuRXJyb3JCYXNlIHtcbiAgICBjb25zdHJ1Y3RvciAoYXJndW1lbnROYW1lLCBub2RlRGVzY3JpcHRpb24pIHtcbiAgICAgICAgc3VwZXIoVEVTVF9SVU5fRVJST1JTLmFjdGlvbkFkZGl0aW9uYWxTZWxlY3Rvck1hdGNoZXNXcm9uZ05vZGVUeXBlRXJyb3IpO1xuXG4gICAgICAgIHRoaXMuYXJndW1lbnROYW1lICAgID0gYXJndW1lbnROYW1lO1xuICAgICAgICB0aGlzLm5vZGVEZXNjcmlwdGlvbiA9IG5vZGVEZXNjcmlwdGlvbjtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBBY3Rpb25FbGVtZW50Tm9uRWRpdGFibGVFcnJvciBleHRlbmRzIFRlc3RSdW5FcnJvckJhc2Uge1xuICAgIGNvbnN0cnVjdG9yICgpIHtcbiAgICAgICAgc3VwZXIoVEVTVF9SVU5fRVJST1JTLmFjdGlvbkVsZW1lbnROb25FZGl0YWJsZUVycm9yKTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBBY3Rpb25FbGVtZW50Tm90VGV4dEFyZWFFcnJvciBleHRlbmRzIFRlc3RSdW5FcnJvckJhc2Uge1xuICAgIGNvbnN0cnVjdG9yICgpIHtcbiAgICAgICAgc3VwZXIoVEVTVF9SVU5fRVJST1JTLmFjdGlvbkVsZW1lbnROb3RUZXh0QXJlYUVycm9yKTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBBY3Rpb25FbGVtZW50Tm9uQ29udGVudEVkaXRhYmxlRXJyb3IgZXh0ZW5kcyBUZXN0UnVuRXJyb3JCYXNlIHtcbiAgICBjb25zdHJ1Y3RvciAoYXJndW1lbnROYW1lKSB7XG4gICAgICAgIHN1cGVyKFRFU1RfUlVOX0VSUk9SUy5hY3Rpb25FbGVtZW50Tm9uQ29udGVudEVkaXRhYmxlRXJyb3IpO1xuXG4gICAgICAgIHRoaXMuYXJndW1lbnROYW1lID0gYXJndW1lbnROYW1lO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIEFjdGlvblJvb3RDb250YWluZXJOb3RGb3VuZEVycm9yIGV4dGVuZHMgVGVzdFJ1bkVycm9yQmFzZSB7XG4gICAgY29uc3RydWN0b3IgKCkge1xuICAgICAgICBzdXBlcihURVNUX1JVTl9FUlJPUlMuYWN0aW9uUm9vdENvbnRhaW5lck5vdEZvdW5kRXJyb3IpO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIEFjdGlvbkluY29ycmVjdEtleXNFcnJvciBleHRlbmRzIFRlc3RSdW5FcnJvckJhc2Uge1xuICAgIGNvbnN0cnVjdG9yIChhcmd1bWVudE5hbWUpIHtcbiAgICAgICAgc3VwZXIoVEVTVF9SVU5fRVJST1JTLmFjdGlvbkluY29ycmVjdEtleXNFcnJvcik7XG5cbiAgICAgICAgdGhpcy5hcmd1bWVudE5hbWUgPSBhcmd1bWVudE5hbWU7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgQWN0aW9uQ2Fubm90RmluZEZpbGVUb1VwbG9hZEVycm9yIGV4dGVuZHMgVGVzdFJ1bkVycm9yQmFzZSB7XG4gICAgY29uc3RydWN0b3IgKGZpbGVQYXRocykge1xuICAgICAgICBzdXBlcihURVNUX1JVTl9FUlJPUlMuYWN0aW9uQ2Fubm90RmluZEZpbGVUb1VwbG9hZEVycm9yKTtcblxuICAgICAgICB0aGlzLmZpbGVQYXRocyA9IGZpbGVQYXRocztcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBBY3Rpb25FbGVtZW50SXNOb3RGaWxlSW5wdXRFcnJvciBleHRlbmRzIFRlc3RSdW5FcnJvckJhc2Uge1xuICAgIGNvbnN0cnVjdG9yICgpIHtcbiAgICAgICAgc3VwZXIoVEVTVF9SVU5fRVJST1JTLmFjdGlvbkVsZW1lbnRJc05vdEZpbGVJbnB1dEVycm9yKTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBBY3Rpb25JbnZhbGlkU2Nyb2xsVGFyZ2V0RXJyb3IgZXh0ZW5kcyBUZXN0UnVuRXJyb3JCYXNlIHtcbiAgICBjb25zdHJ1Y3RvciAoc2Nyb2xsVGFyZ2V0WFZhbGlkLCBzY3JvbGxUYXJnZXRZVmFsaWQpIHtcbiAgICAgICAgc3VwZXIoVEVTVF9SVU5fRVJST1JTLmFjdGlvbkludmFsaWRTY3JvbGxUYXJnZXRFcnJvcik7XG5cbiAgICAgICAgaWYgKCFzY3JvbGxUYXJnZXRYVmFsaWQpIHtcbiAgICAgICAgICAgIGlmICghc2Nyb2xsVGFyZ2V0WVZhbGlkKVxuICAgICAgICAgICAgICAgIHRoaXMucHJvcGVydGllcyA9ICdzY3JvbGxUYXJnZXRYIGFuZCBzY3JvbGxUYXJnZXRZIHByb3BlcnRpZXMnO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHRoaXMucHJvcGVydGllcyA9ICdzY3JvbGxUYXJnZXRYIHByb3BlcnR5JztcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0aGlzLnByb3BlcnRpZXMgPSAnc2Nyb2xsVGFyZ2V0WSBwcm9wZXJ0eSc7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgV2luZG93RGltZW5zaW9uc092ZXJmbG93RXJyb3IgZXh0ZW5kcyBUZXN0UnVuRXJyb3JCYXNlIHtcbiAgICBjb25zdHJ1Y3RvciAoY2FsbHNpdGUpIHtcbiAgICAgICAgc3VwZXIoVEVTVF9SVU5fRVJST1JTLndpbmRvd0RpbWVuc2lvbnNPdmVyZmxvd0Vycm9yKTtcblxuICAgICAgICB0aGlzLmNhbGxzaXRlID0gY2FsbHNpdGU7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgSW52YWxpZEVsZW1lbnRTY3JlZW5zaG90RGltZW5zaW9uc0Vycm9yIGV4dGVuZHMgVGVzdFJ1bkVycm9yQmFzZSB7XG4gICAgY29uc3RydWN0b3IgKHdpZHRoLCBoZWlnaHQpIHtcbiAgICAgICAgc3VwZXIoVEVTVF9SVU5fRVJST1JTLmludmFsaWRFbGVtZW50U2NyZWVuc2hvdERpbWVuc2lvbnNFcnJvcik7XG5cbiAgICAgICAgY29uc3Qgd2lkdGhJc0ludmFsaWQgID0gd2lkdGggPD0gMDtcbiAgICAgICAgY29uc3QgaGVpZ2h0SXNJbnZhbGlkID0gaGVpZ2h0IDw9IDA7XG5cbiAgICAgICAgaWYgKHdpZHRoSXNJbnZhbGlkKSB7XG4gICAgICAgICAgICBpZiAoaGVpZ2h0SXNJbnZhbGlkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy52ZXJiICAgICAgID0gJ2FyZSc7XG4gICAgICAgICAgICAgICAgdGhpcy5kaW1lbnNpb25zID0gJ3dpZHRoIGFuZCBoZWlnaHQnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy52ZXJiICAgICAgID0gJ2lzJztcbiAgICAgICAgICAgICAgICB0aGlzLmRpbWVuc2lvbnMgPSAnd2lkdGgnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy52ZXJiICAgICAgID0gJ2lzJztcbiAgICAgICAgICAgIHRoaXMuZGltZW5zaW9ucyA9ICdoZWlnaHQnO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgRm9yYmlkZGVuQ2hhcmFjdGVyc0luU2NyZWVuc2hvdFBhdGhFcnJvciBleHRlbmRzIFRlc3RSdW5FcnJvckJhc2Uge1xuICAgIGNvbnN0cnVjdG9yIChzY3JlZW5zaG90UGF0aCwgZm9yYmlkZGVuQ2hhcnNMaXN0KSB7XG4gICAgICAgIHN1cGVyKFRFU1RfUlVOX0VSUk9SUy5mb3JiaWRkZW5DaGFyYWN0ZXJzSW5TY3JlZW5zaG90UGF0aEVycm9yKTtcblxuICAgICAgICB0aGlzLnNjcmVlbnNob3RQYXRoICAgICA9IHNjcmVlbnNob3RQYXRoO1xuICAgICAgICB0aGlzLmZvcmJpZGRlbkNoYXJzTGlzdCA9IGZvcmJpZGRlbkNoYXJzTGlzdDtcbiAgICB9XG59XG5cblxuZXhwb3J0IGNsYXNzIFJvbGVTd2l0Y2hJblJvbGVJbml0aWFsaXplckVycm9yIGV4dGVuZHMgVGVzdFJ1bkVycm9yQmFzZSB7XG4gICAgY29uc3RydWN0b3IgKGNhbGxzaXRlKSB7XG4gICAgICAgIHN1cGVyKFRFU1RfUlVOX0VSUk9SUy5yb2xlU3dpdGNoSW5Sb2xlSW5pdGlhbGl6ZXJFcnJvcik7XG5cbiAgICAgICAgdGhpcy5jYWxsc2l0ZSA9IGNhbGxzaXRlO1xuICAgIH1cbn1cblxuXG4vLyBJZnJhbWUgZXJyb3JzXG5leHBvcnQgY2xhc3MgQWN0aW9uRWxlbWVudE5vdElmcmFtZUVycm9yIGV4dGVuZHMgVGVzdFJ1bkVycm9yQmFzZSB7XG4gICAgY29uc3RydWN0b3IgKCkge1xuICAgICAgICBzdXBlcihURVNUX1JVTl9FUlJPUlMuYWN0aW9uRWxlbWVudE5vdElmcmFtZUVycm9yKTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBBY3Rpb25JZnJhbWVJc05vdExvYWRlZEVycm9yIGV4dGVuZHMgVGVzdFJ1bkVycm9yQmFzZSB7XG4gICAgY29uc3RydWN0b3IgKCkge1xuICAgICAgICBzdXBlcihURVNUX1JVTl9FUlJPUlMuYWN0aW9uSWZyYW1lSXNOb3RMb2FkZWRFcnJvcik7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgQ3VycmVudElmcmFtZUlzTm90TG9hZGVkRXJyb3IgZXh0ZW5kcyBUZXN0UnVuRXJyb3JCYXNlIHtcbiAgICBjb25zdHJ1Y3RvciAoKSB7XG4gICAgICAgIHN1cGVyKFRFU1RfUlVOX0VSUk9SUy5jdXJyZW50SWZyYW1lSXNOb3RMb2FkZWRFcnJvcik7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgQ3VycmVudElmcmFtZU5vdEZvdW5kRXJyb3IgZXh0ZW5kcyBUZXN0UnVuRXJyb3JCYXNlIHtcbiAgICBjb25zdHJ1Y3RvciAoKSB7XG4gICAgICAgIHN1cGVyKFRFU1RfUlVOX0VSUk9SUy5jdXJyZW50SWZyYW1lTm90Rm91bmRFcnJvcik7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgQ3VycmVudElmcmFtZUlzSW52aXNpYmxlRXJyb3IgZXh0ZW5kcyBUZXN0UnVuRXJyb3JCYXNlIHtcbiAgICBjb25zdHJ1Y3RvciAoKSB7XG4gICAgICAgIHN1cGVyKFRFU1RfUlVOX0VSUk9SUy5jdXJyZW50SWZyYW1lSXNJbnZpc2libGVFcnJvcik7XG4gICAgfVxufVxuXG4vLyBOYXRpdmUgZGlhbG9nIGVycm9yc1xuZXhwb3J0IGNsYXNzIE5hdGl2ZURpYWxvZ05vdEhhbmRsZWRFcnJvciBleHRlbmRzIFRlc3RSdW5FcnJvckJhc2Uge1xuICAgIGNvbnN0cnVjdG9yIChkaWFsb2dUeXBlLCB1cmwpIHtcbiAgICAgICAgc3VwZXIoVEVTVF9SVU5fRVJST1JTLm5hdGl2ZURpYWxvZ05vdEhhbmRsZWRFcnJvcik7XG5cbiAgICAgICAgdGhpcy5kaWFsb2dUeXBlID0gZGlhbG9nVHlwZTtcbiAgICAgICAgdGhpcy5wYWdlVXJsICAgID0gdXJsO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIFVuY2F1Z2h0RXJyb3JJbk5hdGl2ZURpYWxvZ0hhbmRsZXIgZXh0ZW5kcyBUZXN0UnVuRXJyb3JCYXNlIHtcbiAgICBjb25zdHJ1Y3RvciAoZGlhbG9nVHlwZSwgZXJyTXNnLCB1cmwpIHtcbiAgICAgICAgc3VwZXIoVEVTVF9SVU5fRVJST1JTLnVuY2F1Z2h0RXJyb3JJbk5hdGl2ZURpYWxvZ0hhbmRsZXIpO1xuXG4gICAgICAgIHRoaXMuZGlhbG9nVHlwZSA9IGRpYWxvZ1R5cGU7XG4gICAgICAgIHRoaXMuZXJyTXNnICAgICA9IGVyck1zZztcbiAgICAgICAgdGhpcy5wYWdlVXJsICAgID0gdXJsO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIFNldE5hdGl2ZURpYWxvZ0hhbmRsZXJDb2RlV3JvbmdUeXBlRXJyb3IgZXh0ZW5kcyBUZXN0UnVuRXJyb3JCYXNlIHtcbiAgICBjb25zdHJ1Y3RvciAoYWN0dWFsVHlwZSkge1xuICAgICAgICBzdXBlcihURVNUX1JVTl9FUlJPUlMuc2V0TmF0aXZlRGlhbG9nSGFuZGxlckNvZGVXcm9uZ1R5cGVFcnJvcik7XG5cbiAgICAgICAgdGhpcy5hY3R1YWxUeXBlID0gYWN0dWFsVHlwZTtcbiAgICB9XG59XG4iXX0=
