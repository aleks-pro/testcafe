'use strict';

exports.__esModule = true;
exports.default = createCommandFromObject;

var _type = require('./type');

var _type2 = _interopRequireDefault(_type);

var _actions = require('./actions');

var _assertion = require('./assertion');

var _assertion2 = _interopRequireDefault(_assertion);

var _browserManipulation = require('./browser-manipulation');

var _observation = require('./observation');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getCmdCtor(type) {
    switch (type) {
        case _type2.default.click:
            return _actions.ClickCommand;

        case _type2.default.rightClick:
            return _actions.RightClickCommand;

        case _type2.default.doubleClick:
            return _actions.DoubleClickCommand;

        case _type2.default.hover:
            return _actions.HoverCommand;

        case _type2.default.drag:
            return _actions.DragCommand;

        case _type2.default.dragToElement:
            return _actions.DragToElementCommand;

        case _type2.default.typeText:
            return _actions.TypeTextCommand;

        case _type2.default.selectText:
            return _actions.SelectTextCommand;

        case _type2.default.selectTextAreaContent:
            return _actions.SelectTextAreaContentCommand;

        case _type2.default.selectEditableContent:
            return _actions.SelectEditableContentCommand;

        case _type2.default.pressKey:
            return _actions.PressKeyCommand;

        case _type2.default.wait:
            return _observation.WaitCommand;

        case _type2.default.navigateTo:
            return _actions.NavigateToCommand;

        case _type2.default.setFilesToUpload:
            return _actions.SetFilesToUploadCommand;

        case _type2.default.clearUpload:
            return _actions.ClearUploadCommand;

        case _type2.default.takeScreenshot:
            return _browserManipulation.TakeScreenshotCommand;

        case _type2.default.takeElementScreenshot:
            return _browserManipulation.TakeElementScreenshotCommand;

        case _type2.default.resizeWindow:
            return _browserManipulation.ResizeWindowCommand;

        case _type2.default.resizeWindowToFitDevice:
            return _browserManipulation.ResizeWindowToFitDeviceCommand;

        case _type2.default.maximizeWindow:
            return _browserManipulation.MaximizeWindowCommand;

        case _type2.default.switchToIframe:
            return _actions.SwitchToIframeCommand;

        case _type2.default.switchToMainWindow:
            return _actions.SwitchToMainWindowCommand;

        case _type2.default.setNativeDialogHandler:
            return _actions.SetNativeDialogHandlerCommand;

        case _type2.default.setTestSpeed:
            return _actions.SetTestSpeedCommand;

        case _type2.default.setPageLoadTimeout:
            return _actions.SetPageLoadTimeoutCommand;

        case _type2.default.assertion:
            return _assertion2.default;

        case _type2.default.debug:
            return _observation.DebugCommand;

        case _type2.default.executeExpression:
            return _actions.ExecuteExpressionCommand;

        default:
            return null;
    }
}

// Create command from object
function createCommandFromObject(obj, testRun) {
    const CmdCtor = getCmdCtor(obj.type);

    return CmdCtor && new CmdCtor(obj, testRun);
}
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy90ZXN0LXJ1bi9jb21tYW5kcy9mcm9tLW9iamVjdC5qcyJdLCJuYW1lcyI6WyJjcmVhdGVDb21tYW5kRnJvbU9iamVjdCIsImdldENtZEN0b3IiLCJ0eXBlIiwiY2xpY2siLCJyaWdodENsaWNrIiwiZG91YmxlQ2xpY2siLCJob3ZlciIsImRyYWciLCJkcmFnVG9FbGVtZW50IiwidHlwZVRleHQiLCJzZWxlY3RUZXh0Iiwic2VsZWN0VGV4dEFyZWFDb250ZW50Iiwic2VsZWN0RWRpdGFibGVDb250ZW50IiwicHJlc3NLZXkiLCJ3YWl0IiwibmF2aWdhdGVUbyIsInNldEZpbGVzVG9VcGxvYWQiLCJjbGVhclVwbG9hZCIsInRha2VTY3JlZW5zaG90IiwidGFrZUVsZW1lbnRTY3JlZW5zaG90IiwicmVzaXplV2luZG93IiwicmVzaXplV2luZG93VG9GaXREZXZpY2UiLCJtYXhpbWl6ZVdpbmRvdyIsInN3aXRjaFRvSWZyYW1lIiwic3dpdGNoVG9NYWluV2luZG93Iiwic2V0TmF0aXZlRGlhbG9nSGFuZGxlciIsInNldFRlc3RTcGVlZCIsInNldFBhZ2VMb2FkVGltZW91dCIsImFzc2VydGlvbiIsImRlYnVnIiwiZXhlY3V0ZUV4cHJlc3Npb24iLCJvYmoiLCJ0ZXN0UnVuIiwiQ21kQ3RvciJdLCJtYXBwaW5ncyI6Ijs7O2tCQWlJd0JBLHVCOztBQWpJeEI7Ozs7QUFFQTs7QUF1QkE7Ozs7QUFFQTs7QUFRQTs7OztBQUVBLFNBQVNDLFVBQVQsQ0FBcUJDLElBQXJCLEVBQTJCO0FBQ3ZCLFlBQVFBLElBQVI7QUFDSSxhQUFLLGVBQUtDLEtBQVY7QUFDSTs7QUFFSixhQUFLLGVBQUtDLFVBQVY7QUFDSTs7QUFFSixhQUFLLGVBQUtDLFdBQVY7QUFDSTs7QUFFSixhQUFLLGVBQUtDLEtBQVY7QUFDSTs7QUFFSixhQUFLLGVBQUtDLElBQVY7QUFDSTs7QUFFSixhQUFLLGVBQUtDLGFBQVY7QUFDSTs7QUFFSixhQUFLLGVBQUtDLFFBQVY7QUFDSTs7QUFFSixhQUFLLGVBQUtDLFVBQVY7QUFDSTs7QUFFSixhQUFLLGVBQUtDLHFCQUFWO0FBQ0k7O0FBRUosYUFBSyxlQUFLQyxxQkFBVjtBQUNJOztBQUVKLGFBQUssZUFBS0MsUUFBVjtBQUNJOztBQUVKLGFBQUssZUFBS0MsSUFBVjtBQUNJOztBQUVKLGFBQUssZUFBS0MsVUFBVjtBQUNJOztBQUVKLGFBQUssZUFBS0MsZ0JBQVY7QUFDSTs7QUFFSixhQUFLLGVBQUtDLFdBQVY7QUFDSTs7QUFFSixhQUFLLGVBQUtDLGNBQVY7QUFDSTs7QUFFSixhQUFLLGVBQUtDLHFCQUFWO0FBQ0k7O0FBRUosYUFBSyxlQUFLQyxZQUFWO0FBQ0k7O0FBRUosYUFBSyxlQUFLQyx1QkFBVjtBQUNJOztBQUVKLGFBQUssZUFBS0MsY0FBVjtBQUNJOztBQUVKLGFBQUssZUFBS0MsY0FBVjtBQUNJOztBQUVKLGFBQUssZUFBS0Msa0JBQVY7QUFDSTs7QUFFSixhQUFLLGVBQUtDLHNCQUFWO0FBQ0k7O0FBRUosYUFBSyxlQUFLQyxZQUFWO0FBQ0k7O0FBRUosYUFBSyxlQUFLQyxrQkFBVjtBQUNJOztBQUVKLGFBQUssZUFBS0MsU0FBVjtBQUNJOztBQUVKLGFBQUssZUFBS0MsS0FBVjtBQUNJOztBQUVKLGFBQUssZUFBS0MsaUJBQVY7QUFDSTs7QUFFSjtBQUNJLG1CQUFPLElBQVA7QUF0RlI7QUF3Rkg7O0FBRUQ7QUFDZSxTQUFTOUIsdUJBQVQsQ0FBa0MrQixHQUFsQyxFQUF1Q0MsT0FBdkMsRUFBZ0Q7QUFDM0QsVUFBTUMsVUFBVWhDLFdBQVc4QixJQUFJN0IsSUFBZixDQUFoQjs7QUFFQSxXQUFPK0IsV0FBVyxJQUFJQSxPQUFKLENBQVlGLEdBQVosRUFBaUJDLE9BQWpCLENBQWxCO0FBQ0giLCJmaWxlIjoidGVzdC1ydW4vY29tbWFuZHMvZnJvbS1vYmplY3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgVFlQRSBmcm9tICcuL3R5cGUnO1xuXG5pbXBvcnQge1xuICAgIENsaWNrQ29tbWFuZCxcbiAgICBSaWdodENsaWNrQ29tbWFuZCxcbiAgICBEb3VibGVDbGlja0NvbW1hbmQsXG4gICAgSG92ZXJDb21tYW5kLFxuICAgIERyYWdDb21tYW5kLFxuICAgIERyYWdUb0VsZW1lbnRDb21tYW5kLFxuICAgIFR5cGVUZXh0Q29tbWFuZCxcbiAgICBTZWxlY3RUZXh0Q29tbWFuZCxcbiAgICBTZWxlY3RUZXh0QXJlYUNvbnRlbnRDb21tYW5kLFxuICAgIFNlbGVjdEVkaXRhYmxlQ29udGVudENvbW1hbmQsXG4gICAgUHJlc3NLZXlDb21tYW5kLFxuICAgIE5hdmlnYXRlVG9Db21tYW5kLFxuICAgIFNldEZpbGVzVG9VcGxvYWRDb21tYW5kLFxuICAgIENsZWFyVXBsb2FkQ29tbWFuZCxcbiAgICBTd2l0Y2hUb0lmcmFtZUNvbW1hbmQsXG4gICAgU3dpdGNoVG9NYWluV2luZG93Q29tbWFuZCxcbiAgICBTZXROYXRpdmVEaWFsb2dIYW5kbGVyQ29tbWFuZCxcbiAgICBTZXRUZXN0U3BlZWRDb21tYW5kLFxuICAgIFNldFBhZ2VMb2FkVGltZW91dENvbW1hbmQsXG4gICAgRXhlY3V0ZUV4cHJlc3Npb25Db21tYW5kXG59IGZyb20gJy4vYWN0aW9ucyc7XG5cbmltcG9ydCBBc3NlcnRpb25Db21tYW5kIGZyb20gJy4vYXNzZXJ0aW9uJztcblxuaW1wb3J0IHtcbiAgICBUYWtlU2NyZWVuc2hvdENvbW1hbmQsXG4gICAgVGFrZUVsZW1lbnRTY3JlZW5zaG90Q29tbWFuZCxcbiAgICBSZXNpemVXaW5kb3dDb21tYW5kLFxuICAgIFJlc2l6ZVdpbmRvd1RvRml0RGV2aWNlQ29tbWFuZCxcbiAgICBNYXhpbWl6ZVdpbmRvd0NvbW1hbmRcbn0gZnJvbSAnLi9icm93c2VyLW1hbmlwdWxhdGlvbic7XG5cbmltcG9ydCB7IFdhaXRDb21tYW5kLCBEZWJ1Z0NvbW1hbmQgfSBmcm9tICcuL29ic2VydmF0aW9uJztcblxuZnVuY3Rpb24gZ2V0Q21kQ3RvciAodHlwZSkge1xuICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICBjYXNlIFRZUEUuY2xpY2s6XG4gICAgICAgICAgICByZXR1cm4gQ2xpY2tDb21tYW5kO1xuXG4gICAgICAgIGNhc2UgVFlQRS5yaWdodENsaWNrOlxuICAgICAgICAgICAgcmV0dXJuIFJpZ2h0Q2xpY2tDb21tYW5kO1xuXG4gICAgICAgIGNhc2UgVFlQRS5kb3VibGVDbGljazpcbiAgICAgICAgICAgIHJldHVybiBEb3VibGVDbGlja0NvbW1hbmQ7XG5cbiAgICAgICAgY2FzZSBUWVBFLmhvdmVyOlxuICAgICAgICAgICAgcmV0dXJuIEhvdmVyQ29tbWFuZDtcblxuICAgICAgICBjYXNlIFRZUEUuZHJhZzpcbiAgICAgICAgICAgIHJldHVybiBEcmFnQ29tbWFuZDtcblxuICAgICAgICBjYXNlIFRZUEUuZHJhZ1RvRWxlbWVudDpcbiAgICAgICAgICAgIHJldHVybiBEcmFnVG9FbGVtZW50Q29tbWFuZDtcblxuICAgICAgICBjYXNlIFRZUEUudHlwZVRleHQ6XG4gICAgICAgICAgICByZXR1cm4gVHlwZVRleHRDb21tYW5kO1xuXG4gICAgICAgIGNhc2UgVFlQRS5zZWxlY3RUZXh0OlxuICAgICAgICAgICAgcmV0dXJuIFNlbGVjdFRleHRDb21tYW5kO1xuXG4gICAgICAgIGNhc2UgVFlQRS5zZWxlY3RUZXh0QXJlYUNvbnRlbnQ6XG4gICAgICAgICAgICByZXR1cm4gU2VsZWN0VGV4dEFyZWFDb250ZW50Q29tbWFuZDtcblxuICAgICAgICBjYXNlIFRZUEUuc2VsZWN0RWRpdGFibGVDb250ZW50OlxuICAgICAgICAgICAgcmV0dXJuIFNlbGVjdEVkaXRhYmxlQ29udGVudENvbW1hbmQ7XG5cbiAgICAgICAgY2FzZSBUWVBFLnByZXNzS2V5OlxuICAgICAgICAgICAgcmV0dXJuIFByZXNzS2V5Q29tbWFuZDtcblxuICAgICAgICBjYXNlIFRZUEUud2FpdDpcbiAgICAgICAgICAgIHJldHVybiBXYWl0Q29tbWFuZDtcblxuICAgICAgICBjYXNlIFRZUEUubmF2aWdhdGVUbzpcbiAgICAgICAgICAgIHJldHVybiBOYXZpZ2F0ZVRvQ29tbWFuZDtcblxuICAgICAgICBjYXNlIFRZUEUuc2V0RmlsZXNUb1VwbG9hZDpcbiAgICAgICAgICAgIHJldHVybiBTZXRGaWxlc1RvVXBsb2FkQ29tbWFuZDtcblxuICAgICAgICBjYXNlIFRZUEUuY2xlYXJVcGxvYWQ6XG4gICAgICAgICAgICByZXR1cm4gQ2xlYXJVcGxvYWRDb21tYW5kO1xuXG4gICAgICAgIGNhc2UgVFlQRS50YWtlU2NyZWVuc2hvdDpcbiAgICAgICAgICAgIHJldHVybiBUYWtlU2NyZWVuc2hvdENvbW1hbmQ7XG5cbiAgICAgICAgY2FzZSBUWVBFLnRha2VFbGVtZW50U2NyZWVuc2hvdDpcbiAgICAgICAgICAgIHJldHVybiBUYWtlRWxlbWVudFNjcmVlbnNob3RDb21tYW5kO1xuXG4gICAgICAgIGNhc2UgVFlQRS5yZXNpemVXaW5kb3c6XG4gICAgICAgICAgICByZXR1cm4gUmVzaXplV2luZG93Q29tbWFuZDtcblxuICAgICAgICBjYXNlIFRZUEUucmVzaXplV2luZG93VG9GaXREZXZpY2U6XG4gICAgICAgICAgICByZXR1cm4gUmVzaXplV2luZG93VG9GaXREZXZpY2VDb21tYW5kO1xuXG4gICAgICAgIGNhc2UgVFlQRS5tYXhpbWl6ZVdpbmRvdzpcbiAgICAgICAgICAgIHJldHVybiBNYXhpbWl6ZVdpbmRvd0NvbW1hbmQ7XG5cbiAgICAgICAgY2FzZSBUWVBFLnN3aXRjaFRvSWZyYW1lOlxuICAgICAgICAgICAgcmV0dXJuIFN3aXRjaFRvSWZyYW1lQ29tbWFuZDtcblxuICAgICAgICBjYXNlIFRZUEUuc3dpdGNoVG9NYWluV2luZG93OlxuICAgICAgICAgICAgcmV0dXJuIFN3aXRjaFRvTWFpbldpbmRvd0NvbW1hbmQ7XG5cbiAgICAgICAgY2FzZSBUWVBFLnNldE5hdGl2ZURpYWxvZ0hhbmRsZXI6XG4gICAgICAgICAgICByZXR1cm4gU2V0TmF0aXZlRGlhbG9nSGFuZGxlckNvbW1hbmQ7XG5cbiAgICAgICAgY2FzZSBUWVBFLnNldFRlc3RTcGVlZDpcbiAgICAgICAgICAgIHJldHVybiBTZXRUZXN0U3BlZWRDb21tYW5kO1xuXG4gICAgICAgIGNhc2UgVFlQRS5zZXRQYWdlTG9hZFRpbWVvdXQ6XG4gICAgICAgICAgICByZXR1cm4gU2V0UGFnZUxvYWRUaW1lb3V0Q29tbWFuZDtcblxuICAgICAgICBjYXNlIFRZUEUuYXNzZXJ0aW9uOlxuICAgICAgICAgICAgcmV0dXJuIEFzc2VydGlvbkNvbW1hbmQ7XG5cbiAgICAgICAgY2FzZSBUWVBFLmRlYnVnOlxuICAgICAgICAgICAgcmV0dXJuIERlYnVnQ29tbWFuZDtcblxuICAgICAgICBjYXNlIFRZUEUuZXhlY3V0ZUV4cHJlc3Npb246XG4gICAgICAgICAgICByZXR1cm4gRXhlY3V0ZUV4cHJlc3Npb25Db21tYW5kO1xuXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG59XG5cbi8vIENyZWF0ZSBjb21tYW5kIGZyb20gb2JqZWN0XG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjcmVhdGVDb21tYW5kRnJvbU9iamVjdCAob2JqLCB0ZXN0UnVuKSB7XG4gICAgY29uc3QgQ21kQ3RvciA9IGdldENtZEN0b3Iob2JqLnR5cGUpO1xuXG4gICAgcmV0dXJuIENtZEN0b3IgJiYgbmV3IENtZEN0b3Iob2JqLCB0ZXN0UnVuKTtcbn1cbiJdfQ==
