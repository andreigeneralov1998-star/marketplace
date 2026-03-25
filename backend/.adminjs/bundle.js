(function (require$$0) {
	'use strict';

	function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

	var require$$0__default = /*#__PURE__*/_interopDefault(require$$0);

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	var exportExcel = {};

	var __createBinding = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function (o, m, k, k2) {
	  if (k2 === undefined) k2 = k;
	  var desc = Object.getOwnPropertyDescriptor(m, k);
	  if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	    desc = {
	      enumerable: true,
	      get: function () {
	        return m[k];
	      }
	    };
	  }
	  Object.defineProperty(o, k2, desc);
	} : function (o, m, k, k2) {
	  if (k2 === undefined) k2 = k;
	  o[k2] = m[k];
	});
	var __setModuleDefault = commonjsGlobal && commonjsGlobal.__setModuleDefault || (Object.create ? function (o, v) {
	  Object.defineProperty(o, "default", {
	    enumerable: true,
	    value: v
	  });
	} : function (o, v) {
	  o["default"] = v;
	});
	var __importStar = commonjsGlobal && commonjsGlobal.__importStar || function () {
	  var ownKeys = function (o) {
	    ownKeys = Object.getOwnPropertyNames || function (o) {
	      var ar = [];
	      for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
	      return ar;
	    };
	    return ownKeys(o);
	  };
	  return function (mod) {
	    if (mod && mod.__esModule) return mod;
	    var result = {};
	    if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
	    __setModuleDefault(result, mod);
	    return result;
	  };
	}();
	Object.defineProperty(exportExcel, "__esModule", {
	  value: true
	});
	var _default = exportExcel.default = ExportExcelAction;
	const react_1 = __importStar(require$$0__default.default);
	function ExportExcelAction() {
	  (0, react_1.useEffect)(() => {
	    window.location.href = '/admin/export/products';
	  }, []);
	  return react_1.default.createElement('div', {
	    style: {
	      padding: '24px',
	      fontFamily: 'Arial, sans-serif',
	      fontSize: '16px'
	    }
	  }, 'Начинаю скачивание файла...');
	}

	AdminJS.UserComponents = {};
	AdminJS.UserComponents.ExportExcel = _default;

})(React);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyIuLi9kaXN0L3NyYy9hZG1pbi9jb21wb25lbnRzL2V4cG9ydC1leGNlbC5qcyIsImVudHJ5LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xudmFyIF9fY3JlYXRlQmluZGluZyA9ICh0aGlzICYmIHRoaXMuX19jcmVhdGVCaW5kaW5nKSB8fCAoT2JqZWN0LmNyZWF0ZSA/IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XG4gICAgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG0sIGspO1xuICAgIGlmICghZGVzYyB8fCAoXCJnZXRcIiBpbiBkZXNjID8gIW0uX19lc01vZHVsZSA6IGRlc2Mud3JpdGFibGUgfHwgZGVzYy5jb25maWd1cmFibGUpKSB7XG4gICAgICBkZXNjID0geyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gbVtrXTsgfSB9O1xuICAgIH1cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgazIsIGRlc2MpO1xufSkgOiAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xuICAgIG9bazJdID0gbVtrXTtcbn0pKTtcbnZhciBfX3NldE1vZHVsZURlZmF1bHQgPSAodGhpcyAmJiB0aGlzLl9fc2V0TW9kdWxlRGVmYXVsdCkgfHwgKE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgdikge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBcImRlZmF1bHRcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdiB9KTtcbn0pIDogZnVuY3Rpb24obywgdikge1xuICAgIG9bXCJkZWZhdWx0XCJdID0gdjtcbn0pO1xudmFyIF9faW1wb3J0U3RhciA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnRTdGFyKSB8fCAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBvd25LZXlzID0gZnVuY3Rpb24obykge1xuICAgICAgICBvd25LZXlzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMgfHwgZnVuY3Rpb24gKG8pIHtcbiAgICAgICAgICAgIHZhciBhciA9IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgayBpbiBvKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG8sIGspKSBhclthci5sZW5ndGhdID0gaztcbiAgICAgICAgICAgIHJldHVybiBhcjtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIG93bktleXMobyk7XG4gICAgfTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKG1vZCkge1xuICAgICAgICBpZiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSByZXR1cm4gbW9kO1xuICAgICAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgICAgIGlmIChtb2QgIT0gbnVsbCkgZm9yICh2YXIgayA9IG93bktleXMobW9kKSwgaSA9IDA7IGkgPCBrLmxlbmd0aDsgaSsrKSBpZiAoa1tpXSAhPT0gXCJkZWZhdWx0XCIpIF9fY3JlYXRlQmluZGluZyhyZXN1bHQsIG1vZCwga1tpXSk7XG4gICAgICAgIF9fc2V0TW9kdWxlRGVmYXVsdChyZXN1bHQsIG1vZCk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbn0pKCk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLmRlZmF1bHQgPSBFeHBvcnRFeGNlbEFjdGlvbjtcbmNvbnN0IHJlYWN0XzEgPSBfX2ltcG9ydFN0YXIocmVxdWlyZShcInJlYWN0XCIpKTtcbmZ1bmN0aW9uIEV4cG9ydEV4Y2VsQWN0aW9uKCkge1xuICAgICgwLCByZWFjdF8xLnVzZUVmZmVjdCkoKCkgPT4ge1xuICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9ICcvYWRtaW4vZXhwb3J0L3Byb2R1Y3RzJztcbiAgICB9LCBbXSk7XG4gICAgcmV0dXJuIHJlYWN0XzEuZGVmYXVsdC5jcmVhdGVFbGVtZW50KCdkaXYnLCB7XG4gICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgICBwYWRkaW5nOiAnMjRweCcsXG4gICAgICAgICAgICBmb250RmFtaWx5OiAnQXJpYWwsIHNhbnMtc2VyaWYnLFxuICAgICAgICAgICAgZm9udFNpemU6ICcxNnB4JyxcbiAgICAgICAgfSxcbiAgICB9LCAn0J3QsNGH0LjQvdCw0Y4g0YHQutCw0YfQuNCy0LDQvdC40LUg0YTQsNC50LvQsC4uLicpO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZXhwb3J0LWV4Y2VsLmpzLm1hcCIsIkFkbWluSlMuVXNlckNvbXBvbmVudHMgPSB7fVxuaW1wb3J0IEV4cG9ydEV4Y2VsIGZyb20gJy4uL2Rpc3Qvc3JjL2FkbWluL2NvbXBvbmVudHMvZXhwb3J0LWV4Y2VsJ1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5FeHBvcnRFeGNlbCA9IEV4cG9ydEV4Y2VsIl0sIm5hbWVzIjpbImV4cG9ydEV4Y2VsIiwiZGVmYXVsdCIsIkV4cG9ydEV4Y2VsQWN0aW9uIiwicmVhY3RfMSIsIl9faW1wb3J0U3RhciIsInJlcXVpcmUkJDAiLCJ1c2VFZmZlY3QiLCJsb2NhdGlvbiIsImhyZWYiLCJwYWRkaW5nIiwiZm9udEZhbWlseSIsIkFkbWluSlMiLCJVc2VyQ29tcG9uZW50cyIsIkV4cG9ydEV4Y2VsIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBQUEsSUFBQSxRQUFBLEdBQUFBLFdBQVksQ0FBQUMsT0FBQSxHQUFBQyxpQkFBQTtPQUNaQyxPQUFJLEdBQUFDLFlBQUEsQ0FBQUMsMkJBQUEsQ0FBQTtDQUVKSCxTQUFBQSxpQkFBWUEsR0FBRztDQUdmQyxFQUFBQSxJQUFBQSxPQUFBLENBQUFHLFNBQUEsRUFBQSxNQUFBO1dBQ0ksQ0FBQUMsUUFBTyxDQUFBQyxJQUFBLEdBQUEsd0JBQUE7O2lCQUVILENBQUFQLHFCQUFnQixDQUFBLEtBQUEsRUFBQTtDQUNsQixJQUFBLEtBQUEsRUFBQTtPQUVGUSxPQUFBLEVBQUEsTUFBQTtPQUVIQyxVQUFBLEVBQUEsbUJBQUE7Ozs7OztDQ2REQyxPQUFPLENBQUNDLGNBQWMsR0FBRyxFQUFFO0NBRTNCRCxPQUFPLENBQUNDLGNBQWMsQ0FBQ0MsV0FBVyxHQUFHQSxRQUFXOzs7Ozs7In0=
