'use strict';

exports.__esModule = true;

var _lodash = require('lodash');

var _types = require('../types');

var _utils = require('./utils');

const EXTERNAL_LINKS = {
    createNewIssue: 'https://github.com/DevExpress/testcafe/issues/new?template=bug-report.md',
    troubleshootNetwork: 'https://go.devexpress.com/TestCafe_FAQ_ARequestHasFailed.aspx',
    viewportSizes: 'http://viewportsizes.com'
};

exports.default = {
    [_types.TEST_RUN_ERRORS.actionIntegerOptionError]: err => (0, _utils.markup)(err, `
        The "${err.optionName}" option is expected to be an integer, but it was ${err.actualValue}.
    `),

    [_types.TEST_RUN_ERRORS.actionPositiveIntegerOptionError]: err => (0, _utils.markup)(err, `
        The "${err.optionName}" option is expected to be a positive integer, but it was ${err.actualValue}.
    `),

    [_types.TEST_RUN_ERRORS.actionBooleanOptionError]: err => (0, _utils.markup)(err, `
        The "${err.optionName}" option is expected to be a boolean value, but it was ${err.actualValue}.
    `),

    [_types.TEST_RUN_ERRORS.actionSpeedOptionError]: err => (0, _utils.markup)(err, `
        The "${err.optionName}" option is expected to be a number between 0.01 and 1, but it was ${err.actualValue}.
    `),

    [_types.TEST_RUN_ERRORS.pageLoadError]: err => (0, _utils.markup)(err, `
        A request to ${(0, _utils.formatUrl)(err.url)} has failed. 
        Use quarantine mode to perform additional attempts to execute this test. 
        You can find troubleshooting information for this issue at ${(0, _utils.formatUrl)(EXTERNAL_LINKS.troubleshootNetwork)}.

        Error details:
        ${err.errMsg}
    `),

    [_types.TEST_RUN_ERRORS.uncaughtErrorOnPage]: err => (0, _utils.markup)(err, `
        A JavaScript error occurred on ${(0, _utils.formatUrl)(err.pageDestUrl)}.
        Repeat test actions in the browser and check the console for errors.
        If you see this error, it means that the tested website caused it. You can fix it or disable tracking JavaScript errors in TestCafe. To do the latter, enable the "--skip-js-errors" option.
        If this error does not occur, please write a new issue at:
        ${(0, _utils.formatUrl)(EXTERNAL_LINKS.createNewIssue)}.

        JavaScript error details:
        ${(0, _utils.replaceLeadingSpacesWithNbsp)((0, _lodash.escape)(err.errStack))}
    `),

    [_types.TEST_RUN_ERRORS.uncaughtErrorInTestCode]: err => (0, _utils.markup)(err, `
        ${(0, _lodash.escape)(err.errMsg)}
    `),

    [_types.TEST_RUN_ERRORS.nativeDialogNotHandledError]: err => (0, _utils.markup)(err, `
        A native ${err.dialogType} dialog was invoked on page ${(0, _utils.formatUrl)(err.pageUrl)}, but no handler was set for it. Use the "setNativeDialogHandler" function to introduce a handler function for native dialogs.
    `),

    [_types.TEST_RUN_ERRORS.uncaughtErrorInNativeDialogHandler]: err => (0, _utils.markup)(err, `
        An error occurred in the native dialog handler called for a native ${err.dialogType} dialog on page ${(0, _utils.formatUrl)(err.pageUrl)}:

        ${(0, _lodash.escape)(err.errMsg)}
    `),

    [_types.TEST_RUN_ERRORS.setTestSpeedArgumentError]: err => (0, _utils.markup)(err, `
        Speed is expected to be a number between 0.01 and 1, but ${err.actualValue} was passed.
    `),

    [_types.TEST_RUN_ERRORS.setNativeDialogHandlerCodeWrongTypeError]: err => (0, _utils.markup)(err, `
        The native dialog handler is expected to be a function, ClientFunction or null, but it was ${err.actualType}.
    `),

    [_types.TEST_RUN_ERRORS.uncaughtErrorInClientFunctionCode]: err => (0, _utils.markup)(err, `
        An error occurred in ${err.instantiationCallsiteName} code:

        ${(0, _lodash.escape)(err.errMsg)}
    `),

    [_types.TEST_RUN_ERRORS.uncaughtErrorInCustomDOMPropertyCode]: err => (0, _utils.markup)(err, `
        An error occurred when trying to calculate a custom Selector property "${err.property}":

        ${(0, _lodash.escape)(err.errMsg)}
    `),

    [_types.TEST_RUN_ERRORS.clientFunctionExecutionInterruptionError]: err => (0, _utils.markup)(err, `
        ${err.instantiationCallsiteName} execution was interrupted by page unload. This problem may appear if you trigger page navigation from ${err.instantiationCallsiteName} code.
    `),

    [_types.TEST_RUN_ERRORS.uncaughtNonErrorObjectInTestCode]: err => (0, _utils.markup)(err, `
        Uncaught ${err.objType} "${(0, _lodash.escape)(err.objStr)}" was thrown. Throw Error instead.
    `, { withoutCallsite: true }),

    [_types.TEST_RUN_ERRORS.unhandledPromiseRejection]: err => (0, _utils.markup)(err, `
        Unhandled promise rejection:

        ${(0, _lodash.escape)(err.errMsg)}
    `, { withoutCallsite: true }),

    [_types.TEST_RUN_ERRORS.uncaughtException]: err => (0, _utils.markup)(err, `
        Uncaught exception:

        ${(0, _lodash.escape)(err.errMsg)}
    `, { withoutCallsite: true }),

    [_types.TEST_RUN_ERRORS.actionOptionsTypeError]: err => (0, _utils.markup)(err, `
        Action options is expected to be an object, null or undefined but it was ${err.actualType}.
    `),

    [_types.TEST_RUN_ERRORS.actionStringArgumentError]: err => (0, _utils.markup)(err, `
        The "${err.argumentName}" argument is expected to be a non-empty string, but it was ${err.actualValue}.
    `),

    [_types.TEST_RUN_ERRORS.actionBooleanArgumentError]: err => (0, _utils.markup)(err, `
        The "${err.argumentName}" argument is expected to be a boolean value, but it was ${err.actualValue}.
    `),

    [_types.TEST_RUN_ERRORS.actionNullableStringArgumentError]: err => (0, _utils.markup)(err, `
        The "${err.argumentName}" argument is expected to be a null or a string, but it was ${err.actualValue}.
    `),

    [_types.TEST_RUN_ERRORS.actionStringOrStringArrayArgumentError]: err => (0, _utils.markup)(err, `
        The "${err.argumentName}" argument is expected to be a non-empty string or a string array, but it was ${err.actualValue}.
    `),

    [_types.TEST_RUN_ERRORS.actionStringArrayElementError]: err => (0, _utils.markup)(err, `
        Elements of the "${err.argumentName}" argument are expected to be non-empty strings, but the element at index ${err.elementIndex} was ${err.actualValue}.
    `),

    [_types.TEST_RUN_ERRORS.actionIntegerArgumentError]: err => (0, _utils.markup)(err, `
        The "${err.argumentName}" argument is expected to be an integer, but it was ${err.actualValue}.
    `),

    [_types.TEST_RUN_ERRORS.actionRoleArgumentError]: err => (0, _utils.markup)(err, `
        The "${err.argumentName}" argument is expected to be a Role instance, but it was ${err.actualValue}.
    `),

    [_types.TEST_RUN_ERRORS.actionPositiveIntegerArgumentError]: err => (0, _utils.markup)(err, `
        The "${err.argumentName}" argument is expected to be a positive integer, but it was ${err.actualValue}.
    `),

    [_types.TEST_RUN_ERRORS.actionElementNotFoundError]: (err, viewportWidth) => (0, _utils.markup)(err, `
        The specified selector does not match any element in the DOM tree.

        ${(0, _utils.formatSelectorCallstack)(err.apiFnChain, err.apiFnIndex, viewportWidth)}
    `),

    [_types.TEST_RUN_ERRORS.actionElementIsInvisibleError]: err => (0, _utils.markup)(err, `
        The element that matches the specified selector is not visible.
    `),

    [_types.TEST_RUN_ERRORS.actionSelectorMatchesWrongNodeTypeError]: err => (0, _utils.markup)(err, `
        The specified selector is expected to match a DOM element, but it matches a ${err.nodeDescription} node.
    `),

    [_types.TEST_RUN_ERRORS.actionAdditionalElementNotFoundError]: (err, viewportWidth) => (0, _utils.markup)(err, `
        The specified "${err.argumentName}" does not match any element in the DOM tree.

        ${(0, _utils.formatSelectorCallstack)(err.apiFnChain, err.apiFnIndex, viewportWidth)}
    `),

    [_types.TEST_RUN_ERRORS.actionAdditionalElementIsInvisibleError]: err => (0, _utils.markup)(err, `
        The element that matches the specified "${err.argumentName}" is not visible.
    `),

    [_types.TEST_RUN_ERRORS.actionAdditionalSelectorMatchesWrongNodeTypeError]: err => (0, _utils.markup)(err, `
        The specified "${err.argumentName}" is expected to match a DOM element, but it matches a ${err.nodeDescription} node.
    `),

    [_types.TEST_RUN_ERRORS.actionElementNonEditableError]: err => (0, _utils.markup)(err, `
        The action element is expected to be editable (an input, textarea or element with the contentEditable attribute).
    `),

    [_types.TEST_RUN_ERRORS.actionElementNonContentEditableError]: err => (0, _utils.markup)(err, `
        The element that matches the specified "${err.argumentName}" is expected to have the contentEditable attribute enabled or the entire document should be in design mode.
    `),

    [_types.TEST_RUN_ERRORS.actionRootContainerNotFoundError]: err => (0, _utils.markup)(err, `
        Content between the action elements cannot be selected because the root container for the selection range cannot be found, i.e. these elements do not have a common ancestor with the contentEditable attribute.
    `),

    [_types.TEST_RUN_ERRORS.actionElementIsNotFileInputError]: err => (0, _utils.markup)(err, `
        The specified selector does not match a file input element.
    `),

    [_types.TEST_RUN_ERRORS.actionCannotFindFileToUploadError]: err => (0, _utils.markup)(err, `
        Cannot find the following file(s) to upload:
        ${err.filePaths.map(path => `  ${(0, _lodash.escape)(path)}`).join('\n')}
    `),

    [_types.TEST_RUN_ERRORS.actionElementNotTextAreaError]: err => (0, _utils.markup)(err, `
        The action element is expected to be a &lt;textarea&gt;.
    `),

    [_types.TEST_RUN_ERRORS.actionElementNotIframeError]: err => (0, _utils.markup)(err, `
        The action element is expected to be an &lt;iframe&gt.
    `),

    [_types.TEST_RUN_ERRORS.actionIncorrectKeysError]: err => (0, _utils.markup)(err, `
        The "${err.argumentName}" argument contains an incorrect key or key combination.
    `),

    [_types.TEST_RUN_ERRORS.actionUnsupportedDeviceTypeError]: err => (0, _utils.markup)(err, `
        The "${err.argumentName}" argument specifies an unsupported "${err.actualValue}" device. For a list of supported devices, refer to ${(0, _utils.formatUrl)(EXTERNAL_LINKS.viewportSizes)}.
    `),

    [_types.TEST_RUN_ERRORS.actionInvalidScrollTargetError]: err => (0, _utils.markup)(err, `
        Unable to scroll to the specified point because a point with the specified ${err.properties} is not located inside the element's cropping region.
    `),

    [_types.TEST_RUN_ERRORS.actionIframeIsNotLoadedError]: err => (0, _utils.markup)(err, `
        Content of the iframe to which you are switching did not load.
    `),

    [_types.TEST_RUN_ERRORS.currentIframeIsNotLoadedError]: err => (0, _utils.markup)(err, `
        Content of the iframe in which the test is currently operating did not load.
    `),

    [_types.TEST_RUN_ERRORS.currentIframeNotFoundError]: err => (0, _utils.markup)(err, `
        The iframe in which the test is currently operating does not exist anymore.
    `),

    [_types.TEST_RUN_ERRORS.currentIframeIsInvisibleError]: err => (0, _utils.markup)(err, `
        The iframe in which the test is currently operating is not visible anymore.
    `),

    [_types.TEST_RUN_ERRORS.missingAwaitError]: err => (0, _utils.markup)(err, `
        A call to an async function is not awaited. Use the "await" keyword before actions, assertions or chains of them to ensure that they run in the right sequence.
    `),

    [_types.TEST_RUN_ERRORS.externalAssertionLibraryError]: err => (0, _utils.markup)(err, `
        ${(0, _lodash.escape)(err.errMsg)}
    `),

    [_types.TEST_RUN_ERRORS.domNodeClientFunctionResultError]: err => (0, _utils.markup)(err, `
       ${err.instantiationCallsiteName} cannot return DOM elements. Use Selector functions for this purpose.
    `),

    [_types.TEST_RUN_ERRORS.invalidSelectorResultError]: err => (0, _utils.markup)(err, `
        Function that specifies a selector can only return a DOM node, an array of nodes, NodeList, HTMLCollection, null or undefined. Use ClientFunction to return other values.
    `),

    [_types.TEST_RUN_ERRORS.actionSelectorError]: err => (0, _utils.markup)(err, `
        Action "${err.selectorName}" argument error:

        ${(0, _lodash.escape)(err.errMsg)}
    `),

    [_types.TEST_RUN_ERRORS.cannotObtainInfoForElementSpecifiedBySelectorError]: (err, viewportWidth) => (0, _utils.markup)(err, `
        Cannot obtain information about the node because the specified selector does not match any node in the DOM tree.

        ${(0, _utils.formatSelectorCallstack)(err.apiFnChain, err.apiFnIndex, viewportWidth)}
    `),

    [_types.TEST_RUN_ERRORS.windowDimensionsOverflowError]: err => (0, _utils.markup)(err, `
        Unable to resize the window because the specified size exceeds the screen size. On macOS, a window cannot be larger than the screen.
    `),

    [_types.TEST_RUN_ERRORS.forbiddenCharactersInScreenshotPathError]: err => (0, _utils.markup)(err, `
        There are forbidden characters in the "${err.screenshotPath}" screenshot path:
        ${(0, _utils.renderForbiddenCharsList)(err.forbiddenCharsList)}
    `),

    [_types.TEST_RUN_ERRORS.invalidElementScreenshotDimensionsError]: err => (0, _utils.markup)(err, `
         Unable to capture an element image because the resulting image ${err.dimensions} ${err.verb} zero or negative.
    `),

    [_types.TEST_RUN_ERRORS.roleSwitchInRoleInitializerError]: err => (0, _utils.markup)(err, `
        Role cannot be switched while another role is being initialized.
    `),

    [_types.TEST_RUN_ERRORS.assertionExecutableArgumentError]: err => (0, _utils.markup)(err, `
        Cannot evaluate the "${err.actualValue}" expression in the "${err.argumentName}" parameter because of the following error:

        ${err.errMsg}
    `),

    [_types.TEST_RUN_ERRORS.assertionWithoutMethodCallError]: err => (0, _utils.markup)(err, `
        An assertion method is not specified.
    `),

    [_types.TEST_RUN_ERRORS.assertionUnawaitedPromiseError]: err => (0, _utils.markup)(err, `
        Attempted to run assertions on a Promise object. Did you forget to await it? If not, pass "{ allowUnawaitedPromise: true }" to the assertion options.
    `)
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9lcnJvcnMvdGVzdC1ydW4vdGVtcGxhdGVzLmpzIl0sIm5hbWVzIjpbIkVYVEVSTkFMX0xJTktTIiwiY3JlYXRlTmV3SXNzdWUiLCJ0cm91Ymxlc2hvb3ROZXR3b3JrIiwidmlld3BvcnRTaXplcyIsImFjdGlvbkludGVnZXJPcHRpb25FcnJvciIsImVyciIsIm9wdGlvbk5hbWUiLCJhY3R1YWxWYWx1ZSIsImFjdGlvblBvc2l0aXZlSW50ZWdlck9wdGlvbkVycm9yIiwiYWN0aW9uQm9vbGVhbk9wdGlvbkVycm9yIiwiYWN0aW9uU3BlZWRPcHRpb25FcnJvciIsInBhZ2VMb2FkRXJyb3IiLCJ1cmwiLCJlcnJNc2ciLCJ1bmNhdWdodEVycm9yT25QYWdlIiwicGFnZURlc3RVcmwiLCJlcnJTdGFjayIsInVuY2F1Z2h0RXJyb3JJblRlc3RDb2RlIiwibmF0aXZlRGlhbG9nTm90SGFuZGxlZEVycm9yIiwiZGlhbG9nVHlwZSIsInBhZ2VVcmwiLCJ1bmNhdWdodEVycm9ySW5OYXRpdmVEaWFsb2dIYW5kbGVyIiwic2V0VGVzdFNwZWVkQXJndW1lbnRFcnJvciIsInNldE5hdGl2ZURpYWxvZ0hhbmRsZXJDb2RlV3JvbmdUeXBlRXJyb3IiLCJhY3R1YWxUeXBlIiwidW5jYXVnaHRFcnJvckluQ2xpZW50RnVuY3Rpb25Db2RlIiwiaW5zdGFudGlhdGlvbkNhbGxzaXRlTmFtZSIsInVuY2F1Z2h0RXJyb3JJbkN1c3RvbURPTVByb3BlcnR5Q29kZSIsInByb3BlcnR5IiwiY2xpZW50RnVuY3Rpb25FeGVjdXRpb25JbnRlcnJ1cHRpb25FcnJvciIsInVuY2F1Z2h0Tm9uRXJyb3JPYmplY3RJblRlc3RDb2RlIiwib2JqVHlwZSIsIm9ialN0ciIsIndpdGhvdXRDYWxsc2l0ZSIsInVuaGFuZGxlZFByb21pc2VSZWplY3Rpb24iLCJ1bmNhdWdodEV4Y2VwdGlvbiIsImFjdGlvbk9wdGlvbnNUeXBlRXJyb3IiLCJhY3Rpb25TdHJpbmdBcmd1bWVudEVycm9yIiwiYXJndW1lbnROYW1lIiwiYWN0aW9uQm9vbGVhbkFyZ3VtZW50RXJyb3IiLCJhY3Rpb25OdWxsYWJsZVN0cmluZ0FyZ3VtZW50RXJyb3IiLCJhY3Rpb25TdHJpbmdPclN0cmluZ0FycmF5QXJndW1lbnRFcnJvciIsImFjdGlvblN0cmluZ0FycmF5RWxlbWVudEVycm9yIiwiZWxlbWVudEluZGV4IiwiYWN0aW9uSW50ZWdlckFyZ3VtZW50RXJyb3IiLCJhY3Rpb25Sb2xlQXJndW1lbnRFcnJvciIsImFjdGlvblBvc2l0aXZlSW50ZWdlckFyZ3VtZW50RXJyb3IiLCJhY3Rpb25FbGVtZW50Tm90Rm91bmRFcnJvciIsInZpZXdwb3J0V2lkdGgiLCJhcGlGbkNoYWluIiwiYXBpRm5JbmRleCIsImFjdGlvbkVsZW1lbnRJc0ludmlzaWJsZUVycm9yIiwiYWN0aW9uU2VsZWN0b3JNYXRjaGVzV3JvbmdOb2RlVHlwZUVycm9yIiwibm9kZURlc2NyaXB0aW9uIiwiYWN0aW9uQWRkaXRpb25hbEVsZW1lbnROb3RGb3VuZEVycm9yIiwiYWN0aW9uQWRkaXRpb25hbEVsZW1lbnRJc0ludmlzaWJsZUVycm9yIiwiYWN0aW9uQWRkaXRpb25hbFNlbGVjdG9yTWF0Y2hlc1dyb25nTm9kZVR5cGVFcnJvciIsImFjdGlvbkVsZW1lbnROb25FZGl0YWJsZUVycm9yIiwiYWN0aW9uRWxlbWVudE5vbkNvbnRlbnRFZGl0YWJsZUVycm9yIiwiYWN0aW9uUm9vdENvbnRhaW5lck5vdEZvdW5kRXJyb3IiLCJhY3Rpb25FbGVtZW50SXNOb3RGaWxlSW5wdXRFcnJvciIsImFjdGlvbkNhbm5vdEZpbmRGaWxlVG9VcGxvYWRFcnJvciIsImZpbGVQYXRocyIsIm1hcCIsInBhdGgiLCJqb2luIiwiYWN0aW9uRWxlbWVudE5vdFRleHRBcmVhRXJyb3IiLCJhY3Rpb25FbGVtZW50Tm90SWZyYW1lRXJyb3IiLCJhY3Rpb25JbmNvcnJlY3RLZXlzRXJyb3IiLCJhY3Rpb25VbnN1cHBvcnRlZERldmljZVR5cGVFcnJvciIsImFjdGlvbkludmFsaWRTY3JvbGxUYXJnZXRFcnJvciIsInByb3BlcnRpZXMiLCJhY3Rpb25JZnJhbWVJc05vdExvYWRlZEVycm9yIiwiY3VycmVudElmcmFtZUlzTm90TG9hZGVkRXJyb3IiLCJjdXJyZW50SWZyYW1lTm90Rm91bmRFcnJvciIsImN1cnJlbnRJZnJhbWVJc0ludmlzaWJsZUVycm9yIiwibWlzc2luZ0F3YWl0RXJyb3IiLCJleHRlcm5hbEFzc2VydGlvbkxpYnJhcnlFcnJvciIsImRvbU5vZGVDbGllbnRGdW5jdGlvblJlc3VsdEVycm9yIiwiaW52YWxpZFNlbGVjdG9yUmVzdWx0RXJyb3IiLCJhY3Rpb25TZWxlY3RvckVycm9yIiwic2VsZWN0b3JOYW1lIiwiY2Fubm90T2J0YWluSW5mb0ZvckVsZW1lbnRTcGVjaWZpZWRCeVNlbGVjdG9yRXJyb3IiLCJ3aW5kb3dEaW1lbnNpb25zT3ZlcmZsb3dFcnJvciIsImZvcmJpZGRlbkNoYXJhY3RlcnNJblNjcmVlbnNob3RQYXRoRXJyb3IiLCJzY3JlZW5zaG90UGF0aCIsImZvcmJpZGRlbkNoYXJzTGlzdCIsImludmFsaWRFbGVtZW50U2NyZWVuc2hvdERpbWVuc2lvbnNFcnJvciIsImRpbWVuc2lvbnMiLCJ2ZXJiIiwicm9sZVN3aXRjaEluUm9sZUluaXRpYWxpemVyRXJyb3IiLCJhc3NlcnRpb25FeGVjdXRhYmxlQXJndW1lbnRFcnJvciIsImFzc2VydGlvbldpdGhvdXRNZXRob2RDYWxsRXJyb3IiLCJhc3NlcnRpb25VbmF3YWl0ZWRQcm9taXNlRXJyb3IiXSwibWFwcGluZ3MiOiI7Ozs7QUFBQTs7QUFDQTs7QUFDQTs7QUFRQSxNQUFNQSxpQkFBaUI7QUFDbkJDLG9CQUFxQiwwRUFERjtBQUVuQkMseUJBQXFCLCtEQUZGO0FBR25CQyxtQkFBcUI7QUFIRixDQUF2Qjs7a0JBTWU7QUFDWCxLQUFDLHVCQUFnQkMsd0JBQWpCLEdBQTRDQyxPQUFPLG1CQUFPQSxHQUFQLEVBQWE7ZUFDckRBLElBQUlDLFVBQVcscURBQW9ERCxJQUFJRSxXQUFZO0tB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RUFBTTJDLGFBQU4sS0FBd0IsbUJBQU8zQyxHQUFQLEVBQWE7OztVQUdwRyxvQ0FBd0JBLElBQUk0QyxVQUE1QixFQUF3QzVDLElBQUk2QyxVQUE1QyxFQUF3REYsYUFBeEQsQ0FBd0U7S0FIZSxDQTFPbkY7O0FBZ1BYLEtBQUMsdUJBQWdCbUMsNkJBQWpCLEdBQWlEOUUsT0FBTyxtQkFBT0EsR0FBUCxFQUFhOztLQUFiLENBaFA3Qzs7QUFvUFgsS0FBQyx1QkFBZ0IrRSx3Q0FBakIsR0FBNEQvRSxPQUFPLG1CQUFPQSxHQUFQLEVBQWE7aURBQ25DQSxJQUFJZ0YsY0FBZTtVQUMxRCxxQ0FBeUJoRixJQUFJaUYsa0JBQTdCLENBQWlEO0tBRlksQ0FwUHhEOztBQXlQWCxLQUFDLHVCQUFnQkMsdUNBQWpCLEdBQTJEbEYsT0FBTyxtQkFBT0EsR0FBUCxFQUFhOzBFQUNUQSxJQUFJbUYsVUFBVyxJQUFHbkYsSUFBSW9GLElBQUs7S0FEL0IsQ0F6UHZEOztBQTZQWCxLQUFDLHVCQUFnQkMsZ0NBQWpCLEdBQW9EckYsT0FBTyxtQkFBT0EsR0FBUCxFQUFhOztLQUFiLENBN1BoRDs7QUFpUVgsS0FBQyx1QkFBZ0JzRixnQ0FBakIsR0FBb0R0RixPQUFPLG1CQUFPQSxHQUFQLEVBQWE7K0JBQzdDQSxJQUFJRSxXQUFZLHdCQUF1QkYsSUFBSWlDLFlBQWE7O1VBRTdFakMsSUFBSVEsTUFBTztLQUgwQyxDQWpRaEQ7O0FBdVFYLEtBQUMsdUJBQWdCK0UsK0JBQWpCLEdBQW1EdkYsT0FBTyxtQkFBT0EsR0FBUCxFQUFhOztLQUFiLENBdlEvQzs7QUEyUVgsS0FBQyx1QkFBZ0J3Riw4QkFBakIsR0FBa0R4RixPQUFPLG1CQUFPQSxHQUFQLEVBQWE7O0tBQWI7QUEzUTlDLEMiLCJmaWxlIjoiZXJyb3JzL3Rlc3QtcnVuL3RlbXBsYXRlcy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGVzY2FwZSBhcyBlc2NhcGVIdG1sIH0gZnJvbSAnbG9kYXNoJztcbmltcG9ydCB7IFRFU1RfUlVOX0VSUk9SUyB9IGZyb20gJy4uL3R5cGVzJztcbmltcG9ydCB7XG4gICAgcmVuZGVyRm9yYmlkZGVuQ2hhcnNMaXN0LFxuICAgIG1hcmt1cCxcbiAgICBmb3JtYXRTZWxlY3RvckNhbGxzdGFjayxcbiAgICBmb3JtYXRVcmwsXG4gICAgcmVwbGFjZUxlYWRpbmdTcGFjZXNXaXRoTmJzcFxufSBmcm9tICcuL3V0aWxzJztcblxuY29uc3QgRVhURVJOQUxfTElOS1MgPSB7XG4gICAgY3JlYXRlTmV3SXNzdWU6ICAgICAgJ2h0dHBzOi8vZ2l0aHViLmNvbS9EZXZFeHByZXNzL3Rlc3RjYWZlL2lzc3Vlcy9uZXc/dGVtcGxhdGU9YnVnLXJlcG9ydC5tZCcsXG4gICAgdHJvdWJsZXNob290TmV0d29yazogJ2h0dHBzOi8vZ28uZGV2ZXhwcmVzcy5jb20vVGVzdENhZmVfRkFRX0FSZXF1ZXN0SGFzRmFpbGVkLmFzcHgnLFxuICAgIHZpZXdwb3J0U2l6ZXM6ICAgICAgICdodHRwOi8vdmlld3BvcnRzaXplcy5jb20nXG59O1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gICAgW1RFU1RfUlVOX0VSUk9SUy5hY3Rpb25JbnRlZ2VyT3B0aW9uRXJyb3JdOiBlcnIgPT4gbWFya3VwKGVyciwgYFxuICAgICAgICBUaGUgXCIke2Vyci5vcHRpb25OYW1lfVwiIG9wdGlvbiBpcyBleHBlY3RlZCB0byBiZSBhbiBpbnRlZ2VyLCBidXQgaXQgd2FzICR7ZXJyLmFjdHVhbFZhbHVlfS5cbiAgICBgKSxcblxuICAgIFtURVNUX1JVTl9FUlJPUlMuYWN0aW9uUG9zaXRpdmVJbnRlZ2VyT3B0aW9uRXJyb3JdOiBlcnIgPT4gbWFya3VwKGVyciwgYFxuICAgICAgICBUaGUgXCIke2Vyci5vcHRpb25OYW1lfVwiIG9wdGlvbiBpcyBleHBlY3RlZCB0byBiZSBhIHBvc2l0aXZlIGludGVnZXIsIGJ1dCBpdCB3YXMgJHtlcnIuYWN0dWFsVmFsdWV9LlxuICAgIGApLFxuXG4gICAgW1RFU1RfUlVOX0VSUk9SUy5hY3Rpb25Cb29sZWFuT3B0aW9uRXJyb3JdOiBlcnIgPT4gbWFya3VwKGVyciwgYFxuICAgICAgICBUaGUgXCIke2Vyci5vcHRpb25OYW1lfVwiIG9wdGlvbiBpcyBleHBlY3RlZCB0byBiZSBhIGJvb2xlYW4gdmFsdWUsIGJ1dCBpdCB3YXMgJHtlcnIuYWN0dWFsVmFsdWV9LlxuICAgIGApLFxuXG4gICAgW1RFU1RfUlVOX0VSUk9SUy5hY3Rpb25TcGVlZE9wdGlvbkVycm9yXTogZXJyID0+IG1hcmt1cChlcnIsIGBcbiAgICAgICAgVGhlIFwiJHtlcnIub3B0aW9uTmFtZX1cIiBvcHRpb24gaXMgZXhwZWN0ZWQgdG8gYmUgYSBudW1iZXIgYmV0d2VlbiAwLjAxIGFuZCAxLCBidXQgaXQgd2FzICR7ZXJyLmFjdHVhbFZhbHVlfS5cbiAgICBgKSxcblxuICAgIFtURVNUX1JVTl9FUlJPUlMucGFnZUxvYWRFcnJvcl06IGVyciA9PiBtYXJrdXAoZXJyLCBgXG4gICAgICAgIEEgcmVxdWVzdCB0byAke2Zvcm1hdFVybChlcnIudXJsKX0gaGFzIGZhaWxlZC4gXG4gICAgICAgIFVzZSBxdWFyYW50aW5lIG1vZGUgdG8gcGVyZm9ybSBhZGRpdGlvbmFsIGF0dGVtcHRzIHRvIGV4ZWN1dGUgdGhpcyB0ZXN0LiBcbiAgICAgICAgWW91IGNhbiBmaW5kIHRyb3VibGVzaG9vdGluZyBpbmZvcm1hdGlvbiBmb3IgdGhpcyBpc3N1ZSBhdCAke2Zvcm1hdFVybChFWFRFUk5BTF9MSU5LUy50cm91Ymxlc2hvb3ROZXR3b3JrKX0uXG5cbiAgICAgICAgRXJyb3IgZGV0YWlsczpcbiAgICAgICAgJHtlcnIuZXJyTXNnfVxuICAgIGApLFxuXG4gICAgW1RFU1RfUlVOX0VSUk9SUy51bmNhdWdodEVycm9yT25QYWdlXTogZXJyID0+IG1hcmt1cChlcnIsIGBcbiAgICAgICAgQSBKYXZhU2NyaXB0IGVycm9yIG9jY3VycmVkIG9uICR7Zm9ybWF0VXJsKGVyci5wYWdlRGVzdFVybCl9LlxuICAgICAgICBSZXBlYXQgdGVzdCBhY3Rpb25zIGluIHRoZSBicm93c2VyIGFuZCBjaGVjayB0aGUgY29uc29sZSBmb3IgZXJyb3JzLlxuICAgICAgICBJZiB5b3Ugc2VlIHRoaXMgZXJyb3IsIGl0IG1lYW5zIHRoYXQgdGhlIHRlc3RlZCB3ZWJzaXRlIGNhdXNlZCBpdC4gWW91IGNhbiBmaXggaXQgb3IgZGlzYWJsZSB0cmFja2luZyBKYXZhU2NyaXB0IGVycm9ycyBpbiBUZXN0Q2FmZS4gVG8gZG8gdGhlIGxhdHRlciwgZW5hYmxlIHRoZSBcIi0tc2tpcC1qcy1lcnJvcnNcIiBvcHRpb24uXG4gICAgICAgIElmIHRoaXMgZXJyb3IgZG9lcyBub3Qgb2NjdXIsIHBsZWFzZSB3cml0ZSBhIG5ldyBpc3N1ZSBhdDpcbiAgICAgICAgJHtmb3JtYXRVcmwoRVhURVJOQUxfTElOS1MuY3JlYXRlTmV3SXNzdWUpfS5cblxuICAgICAgICBKYXZhU2NyaXB0IGVycm9yIGRldGFpbHM6XG4gICAgICAgICR7cmVwbGFjZUxlYWRpbmdTcGFjZXNXaXRoTmJzcChlc2NhcGVIdG1sKGVyci5lcnJTdGFjaykpfVxuICAgIGApLFxuXG4gICAgW1RFU1RfUlVOX0VSUk9SUy51bmNhdWdodEVycm9ySW5UZXN0Q29kZV06IGVyciA9PiBtYXJrdXAoZXJyLCBgXG4gICAgICAgICR7ZXNjYXBlSHRtbChlcnIuZXJyTXNnKX1cbiAgICBgKSxcblxuICAgIFtURVNUX1JVTl9FUlJPUlMubmF0aXZlRGlhbG9nTm90SGFuZGxlZEVycm9yXTogZXJyID0+IG1hcmt1cChlcnIsIGBcbiAgICAgICAgQSBuYXRpdmUgJHtlcnIuZGlhbG9nVHlwZX0gZGlhbG9nIHdhcyBpbnZva2VkIG9uIHBhZ2UgJHtmb3JtYXRVcmwoZXJyLnBhZ2VVcmwpfSwgYnV0IG5vIGhhbmRsZXIgd2FzIHNldCBmb3IgaXQuIFVzZSB0aGUgXCJzZXROYXRpdmVEaWFsb2dIYW5kbGVyXCIgZnVuY3Rpb24gdG8gaW50cm9kdWNlIGEgaGFuZGxlciBmdW5jdGlvbiBmb3IgbmF0aXZlIGRpYWxvZ3MuXG4gICAgYCksXG5cbiAgICBbVEVTVF9SVU5fRVJST1JTLnVuY2F1Z2h0RXJyb3JJbk5hdGl2ZURpYWxvZ0hhbmRsZXJdOiBlcnIgPT4gbWFya3VwKGVyciwgYFxuICAgICAgICBBbiBlcnJvciBvY2N1cnJlZCBpbiB0aGUgbmF0aXZlIGRpYWxvZyBoYW5kbGVyIGNhbGxlZCBmb3IgYSBuYXRpdmUgJHtlcnIuZGlhbG9nVHlwZX0gZGlhbG9nIG9uIHBhZ2UgJHtmb3JtYXRVcmwoZXJyLnBhZ2VVcmwpfTpcblxuICAgICAgICAke2VzY2FwZUh0bWwoZXJyLmVyck1zZyl9XG4gICAgYCksXG5cbiAgICBbVEVTVF9SVU5fRVJST1JTLnNldFRlc3RTcGVlZEFyZ3VtZW50RXJyb3JdOiBlcnIgPT4gbWFya3VwKGVyciwgYFxuICAgICAgICBTcGVlZCBpcyBleHBlY3RlZCB0byBiZSBhIG51bWJlciBiZXR3ZWVuIDAuMDEgYW5kIDEsIGJ1dCAke2Vyci5hY3R1YWxWYWx1ZX0gd2FzIHBhc3NlZC5cbiAgICBgKSxcblxuICAgIFtURVNUX1JVTl9FUlJPUlMuc2V0TmF0aXZlRGlhbG9nSGFuZGxlckNvZGVXcm9uZ1R5cGVFcnJvcl06IGVyciA9PiBtYXJrdXAoZXJyLCBgXG4gICAgICAgIFRoZSBuYXRpdmUgZGlhbG9nIGhhbmRsZXIgaXMgZXhwZWN0ZWQgdG8gYmUgYSBmdW5jdGlvbiwgQ2xpZW50RnVuY3Rpb24gb3IgbnVsbCwgYnV0IGl0IHdhcyAke2Vyci5hY3R1YWxUeXBlfS5cbiAgICBgKSxcblxuICAgIFtURVNUX1JVTl9FUlJPUlMudW5jYXVnaHRFcnJvckluQ2xpZW50RnVuY3Rpb25Db2RlXTogZXJyID0+IG1hcmt1cChlcnIsIGBcbiAgICAgICAgQW4gZXJyb3Igb2NjdXJyZWQgaW4gJHtlcnIuaW5zdGFudGlhdGlvbkNhbGxzaXRlTmFtZX0gY29kZTpcblxuICAgICAgICAke2VzY2FwZUh0bWwoZXJyLmVyck1zZyl9XG4gICAgYCksXG5cbiAgICBbVEVTVF9SVU5fRVJST1JTLnVuY2F1Z2h0RXJyb3JJbkN1c3RvbURPTVByb3BlcnR5Q29kZV06IGVyciA9PiBtYXJrdXAoZXJyLCBgXG4gICAgICAgIEFuIGVycm9yIG9jY3VycmVkIHdoZW4gdHJ5aW5nIHRvIGNhbGN1bGF0ZSBhIGN1c3RvbSBTZWxlY3RvciBwcm9wZXJ0eSBcIiR7ZXJyLnByb3BlcnR5fVwiOlxuXG4gICAgICAgICR7ZXNjYXBlSHRtbChlcnIuZXJyTXNnKX1cbiAgICBgKSxcblxuICAgIFtURVNUX1JVTl9FUlJPUlMuY2xpZW50RnVuY3Rpb25FeGVjdXRpb25JbnRlcnJ1cHRpb25FcnJvcl06IGVyciA9PiBtYXJrdXAoZXJyLCBgXG4gICAgICAgICR7ZXJyLmluc3RhbnRpYXRpb25DYWxsc2l0ZU5hbWV9IGV4ZWN1dGlvbiB3YXMgaW50ZXJydXB0ZWQgYnkgcGFnZSB1bmxvYWQuIFRoaXMgcHJvYmxlbSBtYXkgYXBwZWFyIGlmIHlvdSB0cmlnZ2VyIHBhZ2UgbmF2aWdhdGlvbiBmcm9tICR7ZXJyLmluc3RhbnRpYXRpb25DYWxsc2l0ZU5hbWV9IGNvZGUuXG4gICAgYCksXG5cbiAgICBbVEVTVF9SVU5fRVJST1JTLnVuY2F1Z2h0Tm9uRXJyb3JPYmplY3RJblRlc3RDb2RlXTogZXJyID0+IG1hcmt1cChlcnIsIGBcbiAgICAgICAgVW5jYXVnaHQgJHtlcnIub2JqVHlwZX0gXCIke2VzY2FwZUh0bWwoZXJyLm9ialN0cil9XCIgd2FzIHRocm93bi4gVGhyb3cgRXJyb3IgaW5zdGVhZC5cbiAgICBgLCB7IHdpdGhvdXRDYWxsc2l0ZTogdHJ1ZSB9KSxcblxuICAgIFtURVNUX1JVTl9FUlJPUlMudW5oYW5kbGVkUHJvbWlzZVJlamVjdGlvbl06IGVyciA9PiBtYXJrdXAoZXJyLCBgXG4gICAgICAgIFVuaGFuZGxlZCBwcm9taXNlIHJlamVjdGlvbjpcblxuICAgICAgICAke2VzY2FwZUh0bWwoZXJyLmVyck1zZyl9XG4gICAgYCwgeyB3aXRob3V0Q2FsbHNpdGU6IHRydWUgfSksXG5cbiAgICBbVEVTVF9SVU5fRVJST1JTLnVuY2F1Z2h0RXhjZXB0aW9uXTogZXJyID0+IG1hcmt1cChlcnIsIGBcbiAgICAgICAgVW5jYXVnaHQgZXhjZXB0aW9uOlxuXG4gICAgICAgICR7ZXNjYXBlSHRtbChlcnIuZXJyTXNnKX1cbiAgICBgLCB7IHdpdGhvdXRDYWxsc2l0ZTogdHJ1ZSB9KSxcblxuICAgIFtURVNUX1JVTl9FUlJPUlMuYWN0aW9uT3B0aW9uc1R5cGVFcnJvcl06IGVyciA9PiBtYXJrdXAoZXJyLCBgXG4gICAgICAgIEFjdGlvbiBvcHRpb25zIGlzIGV4cGVjdGVkIHRvIGJlIGFuIG9iamVjdCwgbnVsbCBvciB1bmRlZmluZWQgYnV0IGl0IHdhcyAke2Vyci5hY3R1YWxUeXBlfS5cbiAgICBgKSxcblxuICAgIFtURVNUX1JVTl9FUlJPUlMuYWN0aW9uU3RyaW5nQXJndW1lbnRFcnJvcl06IGVyciA9PiBtYXJrdXAoZXJyLCBgXG4gICAgICAgIFRoZSBcIiR7ZXJyLmFyZ3VtZW50TmFtZX1cIiBhcmd1bWVudCBpcyBleHBlY3RlZCB0byBiZSBhIG5vbi1lbXB0eSBzdHJpbmcsIGJ1dCBpdCB3YXMgJHtlcnIuYWN0dWFsVmFsdWV9LlxuICAgIGApLFxuXG4gICAgW1RFU1RfUlVOX0VSUk9SUy5hY3Rpb25Cb29sZWFuQXJndW1lbnRFcnJvcl06IGVyciA9PiBtYXJrdXAoZXJyLCBgXG4gICAgICAgIFRoZSBcIiR7ZXJyLmFyZ3VtZW50TmFtZX1cIiBhcmd1bWVudCBpcyBleHBlY3RlZCB0byBiZSBhIGJvb2xlYW4gdmFsdWUsIGJ1dCBpdCB3YXMgJHtlcnIuYWN0dWFsVmFsdWV9LlxuICAgIGApLFxuXG4gICAgW1RFU1RfUlVOX0VSUk9SUy5hY3Rpb25OdWxsYWJsZVN0cmluZ0FyZ3VtZW50RXJyb3JdOiBlcnIgPT4gbWFya3VwKGVyciwgYFxuICAgICAgICBUaGUgXCIke2Vyci5hcmd1bWVudE5hbWV9XCIgYXJndW1lbnQgaXMgZXhwZWN0ZWQgdG8gYmUgYSBudWxsIG9yIGEgc3RyaW5nLCBidXQgaXQgd2FzICR7ZXJyLmFjdHVhbFZhbHVlfS5cbiAgICBgKSxcblxuICAgIFtURVNUX1JVTl9FUlJPUlMuYWN0aW9uU3RyaW5nT3JTdHJpbmdBcnJheUFyZ3VtZW50RXJyb3JdOiBlcnIgPT4gbWFya3VwKGVyciwgYFxuICAgICAgICBUaGUgXCIke2Vyci5hcmd1bWVudE5hbWV9XCIgYXJndW1lbnQgaXMgZXhwZWN0ZWQgdG8gYmUgYSBub24tZW1wdHkgc3RyaW5nIG9yIGEgc3RyaW5nIGFycmF5LCBidXQgaXQgd2FzICR7ZXJyLmFjdHVhbFZhbHVlfS5cbiAgICBgKSxcblxuICAgIFtURVNUX1JVTl9FUlJPUlMuYWN0aW9uU3RyaW5nQXJyYXlFbGVtZW50RXJyb3JdOiBlcnIgPT4gbWFya3VwKGVyciwgYFxuICAgICAgICBFbGVtZW50cyBvZiB0aGUgXCIke2Vyci5hcmd1bWVudE5hbWV9XCIgYXJndW1lbnQgYXJlIGV4cGVjdGVkIHRvIGJlIG5vbi1lbXB0eSBzdHJpbmdzLCBidXQgdGhlIGVsZW1lbnQgYXQgaW5kZXggJHtlcnIuZWxlbWVudEluZGV4fSB3YXMgJHtlcnIuYWN0dWFsVmFsdWV9LlxuICAgIGApLFxuXG4gICAgW1RFU1RfUlVOX0VSUk9SUy5hY3Rpb25JbnRlZ2VyQXJndW1lbnRFcnJvcl06IGVyciA9PiBtYXJrdXAoZXJyLCBgXG4gICAgICAgIFRoZSBcIiR7ZXJyLmFyZ3VtZW50TmFtZX1cIiBhcmd1bWVudCBpcyBleHBlY3RlZCB0byBiZSBhbiBpbnRlZ2VyLCBidXQgaXQgd2FzICR7ZXJyLmFjdHVhbFZhbHVlfS5cbiAgICBgKSxcblxuICAgIFtURVNUX1JVTl9FUlJPUlMuYWN0aW9uUm9sZUFyZ3VtZW50RXJyb3JdOiBlcnIgPT4gbWFya3VwKGVyciwgYFxuICAgICAgICBUaGUgXCIke2Vyci5hcmd1bWVudE5hbWV9XCIgYXJndW1lbnQgaXMgZXhwZWN0ZWQgdG8gYmUgYSBSb2xlIGluc3RhbmNlLCBidXQgaXQgd2FzICR7ZXJyLmFjdHVhbFZhbHVlfS5cbiAgICBgKSxcblxuICAgIFtURVNUX1JVTl9FUlJPUlMuYWN0aW9uUG9zaXRpdmVJbnRlZ2VyQXJndW1lbnRFcnJvcl06IGVyciA9PiBtYXJrdXAoZXJyLCBgXG4gICAgICAgIFRoZSBcIiR7ZXJyLmFyZ3VtZW50TmFtZX1cIiBhcmd1bWVudCBpcyBleHBlY3RlZCB0byBiZSBhIHBvc2l0aXZlIGludGVnZXIsIGJ1dCBpdCB3YXMgJHtlcnIuYWN0dWFsVmFsdWV9LlxuICAgIGApLFxuXG4gICAgW1RFU1RfUlVOX0VSUk9SUy5hY3Rpb25FbGVtZW50Tm90Rm91bmRFcnJvcl06IChlcnIsIHZpZXdwb3J0V2lkdGgpID0+IG1hcmt1cChlcnIsIGBcbiAgICAgICAgVGhlIHNwZWNpZmllZCBzZWxlY3RvciBkb2VzIG5vdCBtYXRjaCBhbnkgZWxlbWVudCBpbiB0aGUgRE9NIHRyZWUuXG5cbiAgICAgICAgJHsgZm9ybWF0U2VsZWN0b3JDYWxsc3RhY2soZXJyLmFwaUZuQ2hhaW4sIGVyci5hcGlGbkluZGV4LCB2aWV3cG9ydFdpZHRoKSB9XG4gICAgYCksXG5cbiAgICBbVEVTVF9SVU5fRVJST1JTLmFjdGlvbkVsZW1lbnRJc0ludmlzaWJsZUVycm9yXTogZXJyID0+IG1hcmt1cChlcnIsIGBcbiAgICAgICAgVGhlIGVsZW1lbnQgdGhhdCBtYXRjaGVzIHRoZSBzcGVjaWZpZWQgc2VsZWN0b3IgaXMgbm90IHZpc2libGUuXG4gICAgYCksXG5cbiAgICBbVEVTVF9SVU5fRVJST1JTLmFjdGlvblNlbGVjdG9yTWF0Y2hlc1dyb25nTm9kZVR5cGVFcnJvcl06IGVyciA9PiBtYXJrdXAoZXJyLCBgXG4gICAgICAgIFRoZSBzcGVjaWZpZWQgc2VsZWN0b3IgaXMgZXhwZWN0ZWQgdG8gbWF0Y2ggYSBET00gZWxlbWVudCwgYnV0IGl0IG1hdGNoZXMgYSAke2Vyci5ub2RlRGVzY3JpcHRpb259IG5vZGUuXG4gICAgYCksXG5cbiAgICBbVEVTVF9SVU5fRVJST1JTLmFjdGlvbkFkZGl0aW9uYWxFbGVtZW50Tm90Rm91bmRFcnJvcl06IChlcnIsIHZpZXdwb3J0V2lkdGgpID0+IG1hcmt1cChlcnIsIGBcbiAgICAgICAgVGhlIHNwZWNpZmllZCBcIiR7ZXJyLmFyZ3VtZW50TmFtZX1cIiBkb2VzIG5vdCBtYXRjaCBhbnkgZWxlbWVudCBpbiB0aGUgRE9NIHRyZWUuXG5cbiAgICAgICAgJHsgZm9ybWF0U2VsZWN0b3JDYWxsc3RhY2soZXJyLmFwaUZuQ2hhaW4sIGVyci5hcGlGbkluZGV4LCB2aWV3cG9ydFdpZHRoKSB9XG4gICAgYCksXG5cbiAgICBbVEVTVF9SVU5fRVJST1JTLmFjdGlvbkFkZGl0aW9uYWxFbGVtZW50SXNJbnZpc2libGVFcnJvcl06IGVyciA9PiBtYXJrdXAoZXJyLCBgXG4gICAgICAgIFRoZSBlbGVtZW50IHRoYXQgbWF0Y2hlcyB0aGUgc3BlY2lmaWVkIFwiJHtlcnIuYXJndW1lbnROYW1lfVwiIGlzIG5vdCB2aXNpYmxlLlxuICAgIGApLFxuXG4gICAgW1RFU1RfUlVOX0VSUk9SUy5hY3Rpb25BZGRpdGlvbmFsU2VsZWN0b3JNYXRjaGVzV3JvbmdOb2RlVHlwZUVycm9yXTogZXJyID0+IG1hcmt1cChlcnIsIGBcbiAgICAgICAgVGhlIHNwZWNpZmllZCBcIiR7ZXJyLmFyZ3VtZW50TmFtZX1cIiBpcyBleHBlY3RlZCB0byBtYXRjaCBhIERPTSBlbGVtZW50LCBidXQgaXQgbWF0Y2hlcyBhICR7ZXJyLm5vZGVEZXNjcmlwdGlvbn0gbm9kZS5cbiAgICBgKSxcblxuICAgIFtURVNUX1JVTl9FUlJPUlMuYWN0aW9uRWxlbWVudE5vbkVkaXRhYmxlRXJyb3JdOiBlcnIgPT4gbWFya3VwKGVyciwgYFxuICAgICAgICBUaGUgYWN0aW9uIGVsZW1lbnQgaXMgZXhwZWN0ZWQgdG8gYmUgZWRpdGFibGUgKGFuIGlucHV0LCB0ZXh0YXJlYSBvciBlbGVtZW50IHdpdGggdGhlIGNvbnRlbnRFZGl0YWJsZSBhdHRyaWJ1dGUpLlxuICAgIGApLFxuXG4gICAgW1RFU1RfUlVOX0VSUk9SUy5hY3Rpb25FbGVtZW50Tm9uQ29udGVudEVkaXRhYmxlRXJyb3JdOiBlcnIgPT4gbWFya3VwKGVyciwgYFxuICAgICAgICBUaGUgZWxlbWVudCB0aGF0IG1hdGNoZXMgdGhlIHNwZWNpZmllZCBcIiR7ZXJyLmFyZ3VtZW50TmFtZX1cIiBpcyBleHBlY3RlZCB0byBoYXZlIHRoZSBjb250ZW50RWRpdGFibGUgYXR0cmlidXRlIGVuYWJsZWQgb3IgdGhlIGVudGlyZSBkb2N1bWVudCBzaG91bGQgYmUgaW4gZGVzaWduIG1vZGUuXG4gICAgYCksXG5cbiAgICBbVEVTVF9SVU5fRVJST1JTLmFjdGlvblJvb3RDb250YWluZXJOb3RGb3VuZEVycm9yXTogZXJyID0+IG1hcmt1cChlcnIsIGBcbiAgICAgICAgQ29udGVudCBiZXR3ZWVuIHRoZSBhY3Rpb24gZWxlbWVudHMgY2Fubm90IGJlIHNlbGVjdGVkIGJlY2F1c2UgdGhlIHJvb3QgY29udGFpbmVyIGZvciB0aGUgc2VsZWN0aW9uIHJhbmdlIGNhbm5vdCBiZSBmb3VuZCwgaS5lLiB0aGVzZSBlbGVtZW50cyBkbyBub3QgaGF2ZSBhIGNvbW1vbiBhbmNlc3RvciB3aXRoIHRoZSBjb250ZW50RWRpdGFibGUgYXR0cmlidXRlLlxuICAgIGApLFxuXG4gICAgW1RFU1RfUlVOX0VSUk9SUy5hY3Rpb25FbGVtZW50SXNOb3RGaWxlSW5wdXRFcnJvcl06IGVyciA9PiBtYXJrdXAoZXJyLCBgXG4gICAgICAgIFRoZSBzcGVjaWZpZWQgc2VsZWN0b3IgZG9lcyBub3QgbWF0Y2ggYSBmaWxlIGlucHV0IGVsZW1lbnQuXG4gICAgYCksXG5cbiAgICBbVEVTVF9SVU5fRVJST1JTLmFjdGlvbkNhbm5vdEZpbmRGaWxlVG9VcGxvYWRFcnJvcl06IGVyciA9PiBtYXJrdXAoZXJyLCBgXG4gICAgICAgIENhbm5vdCBmaW5kIHRoZSBmb2xsb3dpbmcgZmlsZShzKSB0byB1cGxvYWQ6XG4gICAgICAgICR7ZXJyLmZpbGVQYXRocy5tYXAocGF0aCA9PiBgICAke2VzY2FwZUh0bWwocGF0aCl9YCkuam9pbignXFxuJyl9XG4gICAgYCksXG5cbiAgICBbVEVTVF9SVU5fRVJST1JTLmFjdGlvbkVsZW1lbnROb3RUZXh0QXJlYUVycm9yXTogZXJyID0+IG1hcmt1cChlcnIsIGBcbiAgICAgICAgVGhlIGFjdGlvbiBlbGVtZW50IGlzIGV4cGVjdGVkIHRvIGJlIGEgJmx0O3RleHRhcmVhJmd0Oy5cbiAgICBgKSxcblxuICAgIFtURVNUX1JVTl9FUlJPUlMuYWN0aW9uRWxlbWVudE5vdElmcmFtZUVycm9yXTogZXJyID0+IG1hcmt1cChlcnIsIGBcbiAgICAgICAgVGhlIGFjdGlvbiBlbGVtZW50IGlzIGV4cGVjdGVkIHRvIGJlIGFuICZsdDtpZnJhbWUmZ3QuXG4gICAgYCksXG5cbiAgICBbVEVTVF9SVU5fRVJST1JTLmFjdGlvbkluY29ycmVjdEtleXNFcnJvcl06IGVyciA9PiBtYXJrdXAoZXJyLCBgXG4gICAgICAgIFRoZSBcIiR7ZXJyLmFyZ3VtZW50TmFtZX1cIiBhcmd1bWVudCBjb250YWlucyBhbiBpbmNvcnJlY3Qga2V5IG9yIGtleSBjb21iaW5hdGlvbi5cbiAgICBgKSxcblxuICAgIFtURVNUX1JVTl9FUlJPUlMuYWN0aW9uVW5zdXBwb3J0ZWREZXZpY2VUeXBlRXJyb3JdOiBlcnIgPT4gbWFya3VwKGVyciwgYFxuICAgICAgICBUaGUgXCIke2Vyci5hcmd1bWVudE5hbWV9XCIgYXJndW1lbnQgc3BlY2lmaWVzIGFuIHVuc3VwcG9ydGVkIFwiJHtlcnIuYWN0dWFsVmFsdWV9XCIgZGV2aWNlLiBGb3IgYSBsaXN0IG9mIHN1cHBvcnRlZCBkZXZpY2VzLCByZWZlciB0byAke2Zvcm1hdFVybChFWFRFUk5BTF9MSU5LUy52aWV3cG9ydFNpemVzKX0uXG4gICAgYCksXG5cbiAgICBbVEVTVF9SVU5fRVJST1JTLmFjdGlvbkludmFsaWRTY3JvbGxUYXJnZXRFcnJvcl06IGVyciA9PiBtYXJrdXAoZXJyLCBgXG4gICAgICAgIFVuYWJsZSB0byBzY3JvbGwgdG8gdGhlIHNwZWNpZmllZCBwb2ludCBiZWNhdXNlIGEgcG9pbnQgd2l0aCB0aGUgc3BlY2lmaWVkICR7ZXJyLnByb3BlcnRpZXN9IGlzIG5vdCBsb2NhdGVkIGluc2lkZSB0aGUgZWxlbWVudCdzIGNyb3BwaW5nIHJlZ2lvbi5cbiAgICBgKSxcblxuICAgIFtURVNUX1JVTl9FUlJPUlMuYWN0aW9uSWZyYW1lSXNOb3RMb2FkZWRFcnJvcl06IGVyciA9PiBtYXJrdXAoZXJyLCBgXG4gICAgICAgIENvbnRlbnQgb2YgdGhlIGlmcmFtZSB0byB3aGljaCB5b3UgYXJlIHN3aXRjaGluZyBkaWQgbm90IGxvYWQuXG4gICAgYCksXG5cbiAgICBbVEVTVF9SVU5fRVJST1JTLmN1cnJlbnRJZnJhbWVJc05vdExvYWRlZEVycm9yXTogZXJyID0+IG1hcmt1cChlcnIsIGBcbiAgICAgICAgQ29udGVudCBvZiB0aGUgaWZyYW1lIGluIHdoaWNoIHRoZSB0ZXN0IGlzIGN1cnJlbnRseSBvcGVyYXRpbmcgZGlkIG5vdCBsb2FkLlxuICAgIGApLFxuXG4gICAgW1RFU1RfUlVOX0VSUk9SUy5jdXJyZW50SWZyYW1lTm90Rm91bmRFcnJvcl06IGVyciA9PiBtYXJrdXAoZXJyLCBgXG4gICAgICAgIFRoZSBpZnJhbWUgaW4gd2hpY2ggdGhlIHRlc3QgaXMgY3VycmVudGx5IG9wZXJhdGluZyBkb2VzIG5vdCBleGlzdCBhbnltb3JlLlxuICAgIGApLFxuXG4gICAgW1RFU1RfUlVOX0VSUk9SUy5jdXJyZW50SWZyYW1lSXNJbnZpc2libGVFcnJvcl06IGVyciA9PiBtYXJrdXAoZXJyLCBgXG4gICAgICAgIFRoZSBpZnJhbWUgaW4gd2hpY2ggdGhlIHRlc3QgaXMgY3VycmVudGx5IG9wZXJhdGluZyBpcyBub3QgdmlzaWJsZSBhbnltb3JlLlxuICAgIGApLFxuXG4gICAgW1RFU1RfUlVOX0VSUk9SUy5taXNzaW5nQXdhaXRFcnJvcl06IGVyciA9PiBtYXJrdXAoZXJyLCBgXG4gICAgICAgIEEgY2FsbCB0byBhbiBhc3luYyBmdW5jdGlvbiBpcyBub3QgYXdhaXRlZC4gVXNlIHRoZSBcImF3YWl0XCIga2V5d29yZCBiZWZvcmUgYWN0aW9ucywgYXNzZXJ0aW9ucyBvciBjaGFpbnMgb2YgdGhlbSB0byBlbnN1cmUgdGhhdCB0aGV5IHJ1biBpbiB0aGUgcmlnaHQgc2VxdWVuY2UuXG4gICAgYCksXG5cbiAgICBbVEVTVF9SVU5fRVJST1JTLmV4dGVybmFsQXNzZXJ0aW9uTGlicmFyeUVycm9yXTogZXJyID0+IG1hcmt1cChlcnIsIGBcbiAgICAgICAgJHtlc2NhcGVIdG1sKGVyci5lcnJNc2cpfVxuICAgIGApLFxuXG4gICAgW1RFU1RfUlVOX0VSUk9SUy5kb21Ob2RlQ2xpZW50RnVuY3Rpb25SZXN1bHRFcnJvcl06IGVyciA9PiBtYXJrdXAoZXJyLCBgXG4gICAgICAgJHtlcnIuaW5zdGFudGlhdGlvbkNhbGxzaXRlTmFtZX0gY2Fubm90IHJldHVybiBET00gZWxlbWVudHMuIFVzZSBTZWxlY3RvciBmdW5jdGlvbnMgZm9yIHRoaXMgcHVycG9zZS5cbiAgICBgKSxcblxuICAgIFtURVNUX1JVTl9FUlJPUlMuaW52YWxpZFNlbGVjdG9yUmVzdWx0RXJyb3JdOiBlcnIgPT4gbWFya3VwKGVyciwgYFxuICAgICAgICBGdW5jdGlvbiB0aGF0IHNwZWNpZmllcyBhIHNlbGVjdG9yIGNhbiBvbmx5IHJldHVybiBhIERPTSBub2RlLCBhbiBhcnJheSBvZiBub2RlcywgTm9kZUxpc3QsIEhUTUxDb2xsZWN0aW9uLCBudWxsIG9yIHVuZGVmaW5lZC4gVXNlIENsaWVudEZ1bmN0aW9uIHRvIHJldHVybiBvdGhlciB2YWx1ZXMuXG4gICAgYCksXG5cbiAgICBbVEVTVF9SVU5fRVJST1JTLmFjdGlvblNlbGVjdG9yRXJyb3JdOiBlcnIgPT4gbWFya3VwKGVyciwgYFxuICAgICAgICBBY3Rpb24gXCIke2Vyci5zZWxlY3Rvck5hbWV9XCIgYXJndW1lbnQgZXJyb3I6XG5cbiAgICAgICAgJHtlc2NhcGVIdG1sKGVyci5lcnJNc2cpfVxuICAgIGApLFxuXG4gICAgW1RFU1RfUlVOX0VSUk9SUy5jYW5ub3RPYnRhaW5JbmZvRm9yRWxlbWVudFNwZWNpZmllZEJ5U2VsZWN0b3JFcnJvcl06IChlcnIsIHZpZXdwb3J0V2lkdGgpID0+IG1hcmt1cChlcnIsIGBcbiAgICAgICAgQ2Fubm90IG9idGFpbiBpbmZvcm1hdGlvbiBhYm91dCB0aGUgbm9kZSBiZWNhdXNlIHRoZSBzcGVjaWZpZWQgc2VsZWN0b3IgZG9lcyBub3QgbWF0Y2ggYW55IG5vZGUgaW4gdGhlIERPTSB0cmVlLlxuXG4gICAgICAgICR7IGZvcm1hdFNlbGVjdG9yQ2FsbHN0YWNrKGVyci5hcGlGbkNoYWluLCBlcnIuYXBpRm5JbmRleCwgdmlld3BvcnRXaWR0aCkgfVxuICAgIGApLFxuXG4gICAgW1RFU1RfUlVOX0VSUk9SUy53aW5kb3dEaW1lbnNpb25zT3ZlcmZsb3dFcnJvcl06IGVyciA9PiBtYXJrdXAoZXJyLCBgXG4gICAgICAgIFVuYWJsZSB0byByZXNpemUgdGhlIHdpbmRvdyBiZWNhdXNlIHRoZSBzcGVjaWZpZWQgc2l6ZSBleGNlZWRzIHRoZSBzY3JlZW4gc2l6ZS4gT24gbWFjT1MsIGEgd2luZG93IGNhbm5vdCBiZSBsYXJnZXIgdGhhbiB0aGUgc2NyZWVuLlxuICAgIGApLFxuXG4gICAgW1RFU1RfUlVOX0VSUk9SUy5mb3JiaWRkZW5DaGFyYWN0ZXJzSW5TY3JlZW5zaG90UGF0aEVycm9yXTogZXJyID0+IG1hcmt1cChlcnIsIGBcbiAgICAgICAgVGhlcmUgYXJlIGZvcmJpZGRlbiBjaGFyYWN0ZXJzIGluIHRoZSBcIiR7ZXJyLnNjcmVlbnNob3RQYXRofVwiIHNjcmVlbnNob3QgcGF0aDpcbiAgICAgICAgJHtyZW5kZXJGb3JiaWRkZW5DaGFyc0xpc3QoZXJyLmZvcmJpZGRlbkNoYXJzTGlzdCl9XG4gICAgYCksXG5cbiAgICBbVEVTVF9SVU5fRVJST1JTLmludmFsaWRFbGVtZW50U2NyZWVuc2hvdERpbWVuc2lvbnNFcnJvcl06IGVyciA9PiBtYXJrdXAoZXJyLCBgXG4gICAgICAgICBVbmFibGUgdG8gY2FwdHVyZSBhbiBlbGVtZW50IGltYWdlIGJlY2F1c2UgdGhlIHJlc3VsdGluZyBpbWFnZSAke2Vyci5kaW1lbnNpb25zfSAke2Vyci52ZXJifSB6ZXJvIG9yIG5lZ2F0aXZlLlxuICAgIGApLFxuXG4gICAgW1RFU1RfUlVOX0VSUk9SUy5yb2xlU3dpdGNoSW5Sb2xlSW5pdGlhbGl6ZXJFcnJvcl06IGVyciA9PiBtYXJrdXAoZXJyLCBgXG4gICAgICAgIFJvbGUgY2Fubm90IGJlIHN3aXRjaGVkIHdoaWxlIGFub3RoZXIgcm9sZSBpcyBiZWluZyBpbml0aWFsaXplZC5cbiAgICBgKSxcblxuICAgIFtURVNUX1JVTl9FUlJPUlMuYXNzZXJ0aW9uRXhlY3V0YWJsZUFyZ3VtZW50RXJyb3JdOiBlcnIgPT4gbWFya3VwKGVyciwgYFxuICAgICAgICBDYW5ub3QgZXZhbHVhdGUgdGhlIFwiJHtlcnIuYWN0dWFsVmFsdWV9XCIgZXhwcmVzc2lvbiBpbiB0aGUgXCIke2Vyci5hcmd1bWVudE5hbWV9XCIgcGFyYW1ldGVyIGJlY2F1c2Ugb2YgdGhlIGZvbGxvd2luZyBlcnJvcjpcblxuICAgICAgICAke2Vyci5lcnJNc2d9XG4gICAgYCksXG5cbiAgICBbVEVTVF9SVU5fRVJST1JTLmFzc2VydGlvbldpdGhvdXRNZXRob2RDYWxsRXJyb3JdOiBlcnIgPT4gbWFya3VwKGVyciwgYFxuICAgICAgICBBbiBhc3NlcnRpb24gbWV0aG9kIGlzIG5vdCBzcGVjaWZpZWQuXG4gICAgYCksXG5cbiAgICBbVEVTVF9SVU5fRVJST1JTLmFzc2VydGlvblVuYXdhaXRlZFByb21pc2VFcnJvcl06IGVyciA9PiBtYXJrdXAoZXJyLCBgXG4gICAgICAgIEF0dGVtcHRlZCB0byBydW4gYXNzZXJ0aW9ucyBvbiBhIFByb21pc2Ugb2JqZWN0LiBEaWQgeW91IGZvcmdldCB0byBhd2FpdCBpdD8gSWYgbm90LCBwYXNzIFwieyBhbGxvd1VuYXdhaXRlZFByb21pc2U6IHRydWUgfVwiIHRvIHRoZSBhc3NlcnRpb24gb3B0aW9ucy5cbiAgICBgKVxufTtcbiJdfQ==
