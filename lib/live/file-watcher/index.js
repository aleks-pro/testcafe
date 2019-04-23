'use strict';

exports.__esModule = true;

var _values = require('babel-runtime/core-js/object/values');

var _values2 = _interopRequireDefault(_values);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _modulesGraph = require('./modules-graph');

var _modulesGraph2 = _interopRequireDefault(_modulesGraph);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const WATCH_LOCKED_TIMEOUT = 700;

class FileWatcher extends _events2.default {
    constructor(files) {
        super();

        this.FILE_CHANGED_EVENT = 'file-changed';

        this.watchers = {};
        this.lockedFiles = {};
        this.modulesGraph = null;
        this.lastChangedFiles = [];

        files.forEach(f => this.addFile(f));
    }

    _onChanged(file) {
        const cache = require.cache;

        if (!this.modulesGraph) {
            this.modulesGraph = new _modulesGraph2.default();
            this.modulesGraph.build(cache, (0, _keys2.default)(this.watchers));
        } else {
            this.lastChangedFiles.forEach(changedFile => this.modulesGraph.rebuildNode(cache, changedFile));
            this.lastChangedFiles = [];
        }

        this.lastChangedFiles.push(file);
        this.modulesGraph.clearParentsCache(cache, file);

        this.emit(this.FILE_CHANGED_EVENT, { file });
    }

    _watch(file) {
        if (this.lockedFiles[file]) return;

        this.lockedFiles[file] = setTimeout(() => {
            this._onChanged(file);

            delete this.lockedFiles[file];
        }, WATCH_LOCKED_TIMEOUT);
    }

    stop() {
        (0, _values2.default)(this.watchers).forEach(watcher => {
            watcher.close();
        });
    }

    addFile(file) {
        if (!this.watchers[file] && file.indexOf('node_modules') < 0) {
            if (this.modulesGraph) {
                this.lastChangedFiles.push(file);
                this.modulesGraph.addNode(file, require.cache);
            }

            this.watchers[file] = _fs2.default.watch(file, () => this._watch(file));
        }
    }
}
exports.default = FileWatcher;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saXZlL2ZpbGUtd2F0Y2hlci9pbmRleC5qcyJdLCJuYW1lcyI6WyJXQVRDSF9MT0NLRURfVElNRU9VVCIsIkZpbGVXYXRjaGVyIiwiY29uc3RydWN0b3IiLCJmaWxlcyIsIkZJTEVfQ0hBTkdFRF9FVkVOVCIsIndhdGNoZXJzIiwibG9ja2VkRmlsZXMiLCJtb2R1bGVzR3JhcGgiLCJsYXN0Q2hhbmdlZEZpbGVzIiwiZm9yRWFjaCIsImYiLCJhZGRGaWxlIiwiX29uQ2hhbmdlZCIsImZpbGUiLCJjYWNoZSIsInJlcXVpcmUiLCJidWlsZCIsImNoYW5nZWRGaWxlIiwicmVidWlsZE5vZGUiLCJwdXNoIiwiY2xlYXJQYXJlbnRzQ2FjaGUiLCJlbWl0IiwiX3dhdGNoIiwic2V0VGltZW91dCIsInN0b3AiLCJ3YXRjaGVyIiwiY2xvc2UiLCJpbmRleE9mIiwiYWRkTm9kZSIsIndhdGNoIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQTs7OztBQUNBOzs7O0FBQ0E7Ozs7OztBQUVBLE1BQU1BLHVCQUF1QixHQUE3Qjs7QUFFZSxNQUFNQyxXQUFOLDBCQUF1QztBQUNsREMsZ0JBQWFDLEtBQWIsRUFBb0I7QUFDaEI7O0FBRUEsYUFBS0Msa0JBQUwsR0FBMEIsY0FBMUI7O0FBRUEsYUFBS0MsUUFBTCxHQUF3QixFQUF4QjtBQUNBLGFBQUtDLFdBQUwsR0FBd0IsRUFBeEI7QUFDQSxhQUFLQyxZQUFMLEdBQXdCLElBQXhCO0FBQ0EsYUFBS0MsZ0JBQUwsR0FBd0IsRUFBeEI7O0FBRUFMLGNBQU1NLE9BQU4sQ0FBY0MsS0FBSyxLQUFLQyxPQUFMLENBQWFELENBQWIsQ0FBbkI7QUFDSDs7QUFFREUsZUFBWUMsSUFBWixFQUFrQjtBQUNkLGNBQU1DLFFBQVFDLFFBQVFELEtBQXRCOztBQUVBLFlBQUksQ0FBQyxLQUFLUCxZQUFWLEVBQXdCO0FBQ3BCLGlCQUFLQSxZQUFMLEdBQW9CLDRCQUFwQjtBQUNBLGlCQUFLQSxZQUFMLENBQWtCUyxLQUFsQixDQUF3QkYsS0FBeEIsRUFBK0Isb0JBQVksS0FBS1QsUUFBakIsQ0FBL0I7QUFDSCxTQUhELE1BSUs7QUFDRCxpQkFBS0csZ0JBQUwsQ0FBc0JDLE9BQXRCLENBQThCUSxlQUFlLEtBQUtWLFlBQUwsQ0FBa0JXLFdBQWxCLENBQThCSixLQUE5QixFQUFxQ0csV0FBckMsQ0FBN0M7QUFDQSxpQkFBS1QsZ0JBQUwsR0FBd0IsRUFBeEI7QUFDSDs7QUFFRCxhQUFLQSxnQkFBTCxDQUFzQlcsSUFBdEIsQ0FBMkJOLElBQTNCO0FBQ0EsYUFBS04sWUFBTCxDQUFrQmEsaUJBQWxCLENBQW9DTixLQUFwQyxFQUEyQ0QsSUFBM0M7O0FBRUEsYUFBS1EsSUFBTCxDQUFVLEtBQUtqQixrQkFBZixFQUFtQyxFQUFFUyxJQUFGLEVBQW5DO0FBQ0g7O0FBRURTLFdBQVFULElBQVIsRUFBYztBQUNWLFlBQUksS0FBS1AsV0FBTCxDQUFpQk8sSUFBakIsQ0FBSixFQUNJOztBQUVKLGFBQUtQLFdBQUwsQ0FBaUJPLElBQWpCLElBQXlCVSxXQUFXLE1BQU07QUFDdEMsaUJBQUtYLFVBQUwsQ0FBZ0JDLElBQWhCOztBQUVBLG1CQUFPLEtBQUtQLFdBQUwsQ0FBaUJPLElBQWpCLENBQVA7QUFDSCxTQUp3QixFQUl0QmIsb0JBSnNCLENBQXpCO0FBS0g7O0FBRUR3QixXQUFRO0FBQ0osOEJBQWMsS0FBS25CLFFBQW5CLEVBQTZCSSxPQUE3QixDQUFxQ2dCLFdBQVc7QUFDNUNBLG9CQUFRQyxLQUFSO0FBQ0gsU0FGRDtBQUdIOztBQUVEZixZQUFTRSxJQUFULEVBQWU7QUFDWCxZQUFJLENBQUMsS0FBS1IsUUFBTCxDQUFjUSxJQUFkLENBQUQsSUFBd0JBLEtBQUtjLE9BQUwsQ0FBYSxjQUFiLElBQStCLENBQTNELEVBQThEO0FBQzFELGdCQUFJLEtBQUtwQixZQUFULEVBQXVCO0FBQ25CLHFCQUFLQyxnQkFBTCxDQUFzQlcsSUFBdEIsQ0FBMkJOLElBQTNCO0FBQ0EscUJBQUtOLFlBQUwsQ0FBa0JxQixPQUFsQixDQUEwQmYsSUFBMUIsRUFBZ0NFLFFBQVFELEtBQXhDO0FBQ0g7O0FBRUQsaUJBQUtULFFBQUwsQ0FBY1EsSUFBZCxJQUFzQixhQUFHZ0IsS0FBSCxDQUFTaEIsSUFBVCxFQUFlLE1BQU0sS0FBS1MsTUFBTCxDQUFZVCxJQUFaLENBQXJCLENBQXRCO0FBQ0g7QUFDSjtBQTFEaUQ7a0JBQWpDWixXIiwiZmlsZSI6ImxpdmUvZmlsZS13YXRjaGVyL2luZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEV2ZW50RW1pdHRlciBmcm9tICdldmVudHMnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCBNb2R1bGVzR3JhcGggZnJvbSAnLi9tb2R1bGVzLWdyYXBoJztcblxuY29uc3QgV0FUQ0hfTE9DS0VEX1RJTUVPVVQgPSA3MDA7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEZpbGVXYXRjaGVyIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcbiAgICBjb25zdHJ1Y3RvciAoZmlsZXMpIHtcbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICB0aGlzLkZJTEVfQ0hBTkdFRF9FVkVOVCA9ICdmaWxlLWNoYW5nZWQnO1xuXG4gICAgICAgIHRoaXMud2F0Y2hlcnMgICAgICAgICA9IHt9O1xuICAgICAgICB0aGlzLmxvY2tlZEZpbGVzICAgICAgPSB7fTtcbiAgICAgICAgdGhpcy5tb2R1bGVzR3JhcGggICAgID0gbnVsbDtcbiAgICAgICAgdGhpcy5sYXN0Q2hhbmdlZEZpbGVzID0gW107XG5cbiAgICAgICAgZmlsZXMuZm9yRWFjaChmID0+IHRoaXMuYWRkRmlsZShmKSk7XG4gICAgfVxuXG4gICAgX29uQ2hhbmdlZCAoZmlsZSkge1xuICAgICAgICBjb25zdCBjYWNoZSA9IHJlcXVpcmUuY2FjaGU7XG5cbiAgICAgICAgaWYgKCF0aGlzLm1vZHVsZXNHcmFwaCkge1xuICAgICAgICAgICAgdGhpcy5tb2R1bGVzR3JhcGggPSBuZXcgTW9kdWxlc0dyYXBoKCk7XG4gICAgICAgICAgICB0aGlzLm1vZHVsZXNHcmFwaC5idWlsZChjYWNoZSwgT2JqZWN0LmtleXModGhpcy53YXRjaGVycykpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5sYXN0Q2hhbmdlZEZpbGVzLmZvckVhY2goY2hhbmdlZEZpbGUgPT4gdGhpcy5tb2R1bGVzR3JhcGgucmVidWlsZE5vZGUoY2FjaGUsIGNoYW5nZWRGaWxlKSk7XG4gICAgICAgICAgICB0aGlzLmxhc3RDaGFuZ2VkRmlsZXMgPSBbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubGFzdENoYW5nZWRGaWxlcy5wdXNoKGZpbGUpO1xuICAgICAgICB0aGlzLm1vZHVsZXNHcmFwaC5jbGVhclBhcmVudHNDYWNoZShjYWNoZSwgZmlsZSk7XG5cbiAgICAgICAgdGhpcy5lbWl0KHRoaXMuRklMRV9DSEFOR0VEX0VWRU5ULCB7IGZpbGUgfSk7XG4gICAgfVxuXG4gICAgX3dhdGNoIChmaWxlKSB7XG4gICAgICAgIGlmICh0aGlzLmxvY2tlZEZpbGVzW2ZpbGVdKVxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMubG9ja2VkRmlsZXNbZmlsZV0gPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuX29uQ2hhbmdlZChmaWxlKTtcblxuICAgICAgICAgICAgZGVsZXRlIHRoaXMubG9ja2VkRmlsZXNbZmlsZV07XG4gICAgICAgIH0sIFdBVENIX0xPQ0tFRF9USU1FT1VUKTtcbiAgICB9XG5cbiAgICBzdG9wICgpIHtcbiAgICAgICAgT2JqZWN0LnZhbHVlcyh0aGlzLndhdGNoZXJzKS5mb3JFYWNoKHdhdGNoZXIgPT4ge1xuICAgICAgICAgICAgd2F0Y2hlci5jbG9zZSgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhZGRGaWxlIChmaWxlKSB7XG4gICAgICAgIGlmICghdGhpcy53YXRjaGVyc1tmaWxlXSAmJiBmaWxlLmluZGV4T2YoJ25vZGVfbW9kdWxlcycpIDwgMCkge1xuICAgICAgICAgICAgaWYgKHRoaXMubW9kdWxlc0dyYXBoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5sYXN0Q2hhbmdlZEZpbGVzLnB1c2goZmlsZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5tb2R1bGVzR3JhcGguYWRkTm9kZShmaWxlLCByZXF1aXJlLmNhY2hlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy53YXRjaGVyc1tmaWxlXSA9IGZzLndhdGNoKGZpbGUsICgpID0+IHRoaXMuX3dhdGNoKGZpbGUpKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==
