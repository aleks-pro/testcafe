'use strict';

exports.__esModule = true;

var _lodash = require('lodash');

var _parse = require('parse5');

var _callsiteRecord = require('callsite-record');

var _templates = require('./templates');

var _templates2 = _interopRequireDefault(_templates);

var _createStackFilter = require('../create-stack-filter');

var _createStackFilter2 = _interopRequireDefault(_createStackFilter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const parser = new _parse.Parser();

class TestRunErrorFormattableAdapter {
    constructor(err, metaInfo) {
        this.TEMPLATES = _templates2.default;

        this.userAgent = metaInfo.userAgent;
        this.screenshotPath = metaInfo.screenshotPath;
        this.testRunPhase = metaInfo.testRunPhase;

        (0, _lodash.assignIn)(this, err);

        this.callsite = this.callsite || metaInfo.callsite;
    }

    static _getSelector(node) {
        const classAttr = (0, _lodash.find)(node.attrs, { name: 'class' });
        const cls = classAttr && classAttr.value;

        return cls ? `${node.tagName} ${cls}` : node.tagName;
    }

    static _decorateHtml(node, decorator) {
        let msg = '';

        if (node.nodeName === '#text') msg = node.value;else {
            if (node.childNodes.length) {
                msg += node.childNodes.map(childNode => TestRunErrorFormattableAdapter._decorateHtml(childNode, decorator)).join('');
            }

            if (node.nodeName !== '#document-fragment') {
                const selector = TestRunErrorFormattableAdapter._getSelector(node);

                msg = decorator[selector](msg, node.attrs);
            }
        }

        return msg;
    }

    getErrorMarkup(viewportWidth) {
        return this.TEMPLATES[this.code](this, viewportWidth);
    }

    getCallsiteMarkup() {
        if (!this.callsite) return '';

        // NOTE: for raw API callsites
        if (typeof this.callsite === 'string') return this.callsite;

        try {
            return this.callsite.renderSync({
                renderer: _callsiteRecord.renderers.html,
                stackFilter: (0, _createStackFilter2.default)(Error.stackTraceLimit)
            });
        } catch (err) {
            return '';
        }
    }

    formatMessage(decorator, viewportWidth) {
        const msgHtml = this.getErrorMarkup(viewportWidth);
        const fragment = parser.parseFragment(msgHtml);

        return TestRunErrorFormattableAdapter._decorateHtml(fragment, decorator);
    }
}
exports.default = TestRunErrorFormattableAdapter;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9lcnJvcnMvdGVzdC1ydW4vZm9ybWF0dGFibGUtYWRhcHRlci5qcyJdLCJuYW1lcyI6WyJwYXJzZXIiLCJUZXN0UnVuRXJyb3JGb3JtYXR0YWJsZUFkYXB0ZXIiLCJjb25zdHJ1Y3RvciIsImVyciIsIm1ldGFJbmZvIiwiVEVNUExBVEVTIiwidXNlckFnZW50Iiwic2NyZWVuc2hvdFBhdGgiLCJ0ZXN0UnVuUGhhc2UiLCJjYWxsc2l0ZSIsIl9nZXRTZWxlY3RvciIsIm5vZGUiLCJjbGFzc0F0dHIiLCJhdHRycyIsIm5hbWUiLCJjbHMiLCJ2YWx1ZSIsInRhZ05hbWUiLCJfZGVjb3JhdGVIdG1sIiwiZGVjb3JhdG9yIiwibXNnIiwibm9kZU5hbWUiLCJjaGlsZE5vZGVzIiwibGVuZ3RoIiwibWFwIiwiY2hpbGROb2RlIiwiam9pbiIsInNlbGVjdG9yIiwiZ2V0RXJyb3JNYXJrdXAiLCJ2aWV3cG9ydFdpZHRoIiwiY29kZSIsImdldENhbGxzaXRlTWFya3VwIiwicmVuZGVyU3luYyIsInJlbmRlcmVyIiwiaHRtbCIsInN0YWNrRmlsdGVyIiwiRXJyb3IiLCJzdGFja1RyYWNlTGltaXQiLCJmb3JtYXRNZXNzYWdlIiwibXNnSHRtbCIsImZyYWdtZW50IiwicGFyc2VGcmFnbWVudCJdLCJtYXBwaW5ncyI6Ijs7OztBQUFBOztBQUNBOztBQUNBOztBQUNBOzs7O0FBQ0E7Ozs7OztBQUVBLE1BQU1BLFNBQVMsbUJBQWY7O0FBRWUsTUFBTUMsOEJBQU4sQ0FBcUM7QUFDaERDLGdCQUFhQyxHQUFiLEVBQWtCQyxRQUFsQixFQUE0QjtBQUN4QixhQUFLQyxTQUFMOztBQUVBLGFBQUtDLFNBQUwsR0FBc0JGLFNBQVNFLFNBQS9CO0FBQ0EsYUFBS0MsY0FBTCxHQUFzQkgsU0FBU0csY0FBL0I7QUFDQSxhQUFLQyxZQUFMLEdBQXNCSixTQUFTSSxZQUEvQjs7QUFFQSw4QkFBUyxJQUFULEVBQWVMLEdBQWY7O0FBRUEsYUFBS00sUUFBTCxHQUFnQixLQUFLQSxRQUFMLElBQWlCTCxTQUFTSyxRQUExQztBQUNIOztBQUVELFdBQU9DLFlBQVAsQ0FBcUJDLElBQXJCLEVBQTJCO0FBQ3ZCLGNBQU1DLFlBQVksa0JBQUtELEtBQUtFLEtBQVYsRUFBaUIsRUFBRUMsTUFBTSxPQUFSLEVBQWpCLENBQWxCO0FBQ0EsY0FBTUMsTUFBWUgsYUFBYUEsVUFBVUksS0FBekM7O0FBRUEsZUFBT0QsTUFBTyxHQUFFSixLQUFLTSxPQUFRLElBQUdGLEdBQUksRUFBN0IsR0FBaUNKLEtBQUtNLE9BQTdDO0FBQ0g7O0FBRUQsV0FBT0MsYUFBUCxDQUFzQlAsSUFBdEIsRUFBNEJRLFNBQTVCLEVBQXVDO0FBQ25DLFlBQUlDLE1BQU0sRUFBVjs7QUFFQSxZQUFJVCxLQUFLVSxRQUFMLEtBQWtCLE9BQXRCLEVBQ0lELE1BQU1ULEtBQUtLLEtBQVgsQ0FESixLQUVLO0FBQ0QsZ0JBQUlMLEtBQUtXLFVBQUwsQ0FBZ0JDLE1BQXBCLEVBQTRCO0FBQ3hCSCx1QkFBT1QsS0FBS1csVUFBTCxDQUNGRSxHQURFLENBQ0VDLGFBQWF4QiwrQkFBK0JpQixhQUEvQixDQUE2Q08sU0FBN0MsRUFBd0ROLFNBQXhELENBRGYsRUFFRk8sSUFGRSxDQUVHLEVBRkgsQ0FBUDtBQUdIOztBQUVELGdCQUFJZixLQUFLVSxRQUFMLEtBQWtCLG9CQUF0QixFQUE0QztBQUN4QyxzQkFBTU0sV0FBVzFCLCtCQUErQlMsWUFBL0IsQ0FBNENDLElBQTVDLENBQWpCOztBQUVBUyxzQkFBTUQsVUFBVVEsUUFBVixFQUFvQlAsR0FBcEIsRUFBeUJULEtBQUtFLEtBQTlCLENBQU47QUFDSDtBQUNKOztBQUVELGVBQU9PLEdBQVA7QUFDSDs7QUFFRFEsbUJBQWdCQyxhQUFoQixFQUErQjtBQUMzQixlQUFPLEtBQUt4QixTQUFMLENBQWUsS0FBS3lCLElBQXBCLEVBQTBCLElBQTFCLEVBQWdDRCxhQUFoQyxDQUFQO0FBQ0g7O0FBRURFLHdCQUFxQjtBQUNqQixZQUFJLENBQUMsS0FBS3RCLFFBQVYsRUFDSSxPQUFPLEVBQVA7O0FBRUo7QUFDQSxZQUFJLE9BQU8sS0FBS0EsUUFBWixLQUF5QixRQUE3QixFQUNJLE9BQU8sS0FBS0EsUUFBWjs7QUFFSixZQUFJO0FBQ0EsbUJBQU8sS0FBS0EsUUFBTCxDQUFjdUIsVUFBZCxDQUF5QjtBQUM1QkMsMEJBQWEsMEJBQVVDLElBREs7QUFFNUJDLDZCQUFhLGlDQUFrQkMsTUFBTUMsZUFBeEI7QUFGZSxhQUF6QixDQUFQO0FBSUgsU0FMRCxDQU1BLE9BQU9sQyxHQUFQLEVBQVk7QUFDUixtQkFBTyxFQUFQO0FBQ0g7QUFDSjs7QUFFRG1DLGtCQUFlbkIsU0FBZixFQUEwQlUsYUFBMUIsRUFBeUM7QUFDckMsY0FBTVUsVUFBVyxLQUFLWCxjQUFMLENBQW9CQyxhQUFwQixDQUFqQjtBQUNBLGNBQU1XLFdBQVd4QyxPQUFPeUMsYUFBUCxDQUFxQkYsT0FBckIsQ0FBakI7O0FBRUEsZUFBT3RDLCtCQUErQmlCLGFBQS9CLENBQTZDc0IsUUFBN0MsRUFBdURyQixTQUF2RCxDQUFQO0FBQ0g7QUF0RStDO2tCQUEvQmxCLDhCIiwiZmlsZSI6ImVycm9ycy90ZXN0LXJ1bi9mb3JtYXR0YWJsZS1hZGFwdGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZmluZCwgYXNzaWduSW4gfSBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IHsgUGFyc2VyIH0gZnJvbSAncGFyc2U1JztcbmltcG9ydCB7IHJlbmRlcmVycyB9IGZyb20gJ2NhbGxzaXRlLXJlY29yZCc7XG5pbXBvcnQgVEVNUExBVEVTIGZyb20gJy4vdGVtcGxhdGVzJztcbmltcG9ydCBjcmVhdGVTdGFja0ZpbHRlciBmcm9tICcuLi9jcmVhdGUtc3RhY2stZmlsdGVyJztcblxuY29uc3QgcGFyc2VyID0gbmV3IFBhcnNlcigpO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUZXN0UnVuRXJyb3JGb3JtYXR0YWJsZUFkYXB0ZXIge1xuICAgIGNvbnN0cnVjdG9yIChlcnIsIG1ldGFJbmZvKSB7XG4gICAgICAgIHRoaXMuVEVNUExBVEVTID0gVEVNUExBVEVTO1xuXG4gICAgICAgIHRoaXMudXNlckFnZW50ICAgICAgPSBtZXRhSW5mby51c2VyQWdlbnQ7XG4gICAgICAgIHRoaXMuc2NyZWVuc2hvdFBhdGggPSBtZXRhSW5mby5zY3JlZW5zaG90UGF0aDtcbiAgICAgICAgdGhpcy50ZXN0UnVuUGhhc2UgICA9IG1ldGFJbmZvLnRlc3RSdW5QaGFzZTtcblxuICAgICAgICBhc3NpZ25Jbih0aGlzLCBlcnIpO1xuXG4gICAgICAgIHRoaXMuY2FsbHNpdGUgPSB0aGlzLmNhbGxzaXRlIHx8IG1ldGFJbmZvLmNhbGxzaXRlO1xuICAgIH1cblxuICAgIHN0YXRpYyBfZ2V0U2VsZWN0b3IgKG5vZGUpIHtcbiAgICAgICAgY29uc3QgY2xhc3NBdHRyID0gZmluZChub2RlLmF0dHJzLCB7IG5hbWU6ICdjbGFzcycgfSk7XG4gICAgICAgIGNvbnN0IGNscyAgICAgICA9IGNsYXNzQXR0ciAmJiBjbGFzc0F0dHIudmFsdWU7XG5cbiAgICAgICAgcmV0dXJuIGNscyA/IGAke25vZGUudGFnTmFtZX0gJHtjbHN9YCA6IG5vZGUudGFnTmFtZTtcbiAgICB9XG5cbiAgICBzdGF0aWMgX2RlY29yYXRlSHRtbCAobm9kZSwgZGVjb3JhdG9yKSB7XG4gICAgICAgIGxldCBtc2cgPSAnJztcblxuICAgICAgICBpZiAobm9kZS5ub2RlTmFtZSA9PT0gJyN0ZXh0JylcbiAgICAgICAgICAgIG1zZyA9IG5vZGUudmFsdWU7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKG5vZGUuY2hpbGROb2Rlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBtc2cgKz0gbm9kZS5jaGlsZE5vZGVzXG4gICAgICAgICAgICAgICAgICAgIC5tYXAoY2hpbGROb2RlID0+IFRlc3RSdW5FcnJvckZvcm1hdHRhYmxlQWRhcHRlci5fZGVjb3JhdGVIdG1sKGNoaWxkTm9kZSwgZGVjb3JhdG9yKSlcbiAgICAgICAgICAgICAgICAgICAgLmpvaW4oJycpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAobm9kZS5ub2RlTmFtZSAhPT0gJyNkb2N1bWVudC1mcmFnbWVudCcpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBzZWxlY3RvciA9IFRlc3RSdW5FcnJvckZvcm1hdHRhYmxlQWRhcHRlci5fZ2V0U2VsZWN0b3Iobm9kZSk7XG5cbiAgICAgICAgICAgICAgICBtc2cgPSBkZWNvcmF0b3Jbc2VsZWN0b3JdKG1zZywgbm9kZS5hdHRycyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbXNnO1xuICAgIH1cblxuICAgIGdldEVycm9yTWFya3VwICh2aWV3cG9ydFdpZHRoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLlRFTVBMQVRFU1t0aGlzLmNvZGVdKHRoaXMsIHZpZXdwb3J0V2lkdGgpO1xuICAgIH1cblxuICAgIGdldENhbGxzaXRlTWFya3VwICgpIHtcbiAgICAgICAgaWYgKCF0aGlzLmNhbGxzaXRlKVxuICAgICAgICAgICAgcmV0dXJuICcnO1xuXG4gICAgICAgIC8vIE5PVEU6IGZvciByYXcgQVBJIGNhbGxzaXRlc1xuICAgICAgICBpZiAodHlwZW9mIHRoaXMuY2FsbHNpdGUgPT09ICdzdHJpbmcnKVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2FsbHNpdGU7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNhbGxzaXRlLnJlbmRlclN5bmMoe1xuICAgICAgICAgICAgICAgIHJlbmRlcmVyOiAgICByZW5kZXJlcnMuaHRtbCxcbiAgICAgICAgICAgICAgICBzdGFja0ZpbHRlcjogY3JlYXRlU3RhY2tGaWx0ZXIoRXJyb3Iuc3RhY2tUcmFjZUxpbWl0KVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZm9ybWF0TWVzc2FnZSAoZGVjb3JhdG9yLCB2aWV3cG9ydFdpZHRoKSB7XG4gICAgICAgIGNvbnN0IG1zZ0h0bWwgID0gdGhpcy5nZXRFcnJvck1hcmt1cCh2aWV3cG9ydFdpZHRoKTtcbiAgICAgICAgY29uc3QgZnJhZ21lbnQgPSBwYXJzZXIucGFyc2VGcmFnbWVudChtc2dIdG1sKTtcblxuICAgICAgICByZXR1cm4gVGVzdFJ1bkVycm9yRm9ybWF0dGFibGVBZGFwdGVyLl9kZWNvcmF0ZUh0bWwoZnJhZ21lbnQsIGRlY29yYXRvcik7XG4gICAgfVxufVxuIl19
