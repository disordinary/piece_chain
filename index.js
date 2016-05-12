"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// A piece chain is a double linked list of text, it's similar to a piece tree but easier to impliment.
// It's used to manipulate large chunks of text efficiently and quickly, it also has virtually unlimited undo.

var SPAN_SIZE = 256; //the size of a span

var PieceChain = function () {
	function PieceChain(str) {
		_classCallCheck(this, PieceChain);

		this.length = 0;
		this.head = new Span();
		this.tail = new Span();
		this._modifyBuffer = [];
		if (typeof str === 'string') {
			this.length = str.length;
			var pieceChain = this._string_into_spans(str);

			this.head.next = pieceChain.startSpan;
			pieceChain.startSpan.previous = this.head;

			this.tail.previous = pieceChain.endSpan;
			pieceChain.endSpan.next = this.tail;
		} else {
			this.head.next = this.tail;
			this.tail.previous = this.head;
		}
	}

	_createClass(PieceChain, [{
		key: "insert",
		value: function insert(offset, str) {

			this.length += str.length;

			var _seek2 = this._seek(offset);

			var span = _seek2.span;
			var cursor = _seek2.cursor;


			this._modifyBuffer.push(span);

			var newSpans = this._string_into_spans(str);
			var newStartSpan = newSpans.startSpan;
			var newEndSpan = newSpans.endSpan;

			if (offset === 0) {
				this._joinSpans(newEndSpan, this.head.next);
				this._joinSpans(this.head, newStartSpan);
				return;
			}
			if (offset >= this.length) {
				this._joinSpans(this.tail.previous, newStartSpan);
				this._joinSpans(newEndSpan, this.tail);
				return;
			}

			var oldSpans = this._split(span, cursor);
			var oldStartSpan = oldSpans.startSpan;
			var oldEndSpan = oldSpans.endSpan;

			//replace the old span
			oldStartSpan.previous.next = oldStartSpan;
			oldEndSpan.next.previous = oldEndSpan;

			//insert the new spans into the chain
			this._joinSpans(oldStartSpan, newEndSpan);
			this._joinSpans(newStartSpan, oldEndSpan);
		}
	}, {
		key: "del",
		value: function del(offset, length) {
			this.length -= length;

			var _seek3 = this._seek(offset);

			var span = _seek3.span;
			var cursor = _seek3.cursor;


			if (span.length - cursor > length) {
				var _spanStart = this._split(span, offset);
				var _spanEnd = this._split(_spanStart.endSpan, length);
				this._joinSpans(span.previous, _spanStart.startSpan);
				this._joinSpans(_spanEnd.endSpan, span.next);
				this._joinSpans(_spanStart.startSpan, _spanEnd.endSpan);
				return;
			}

			var spanStart = this._split(span, offset);
			var theEndSpan = this._seek(offset + length);
			var spanEnd = this._split(theEndSpan.span, theEndSpan.cursor);

			spanStart.startSpan._str = ">>>" + spanStart.startSpan._str;
			spanEnd.endSpan._str = "<<<" + spanEnd.endSpan._str;

			this._joinSpans(span.previous, spanStart.startSpan);
			this._joinSpans(spanEnd.endSpan, span.next);
			this._joinSpans(spanStart.startSpan, spanEnd.endSpan);
			return;
		}
	}, {
		key: "toString",
		value: function toString() {
			var piece = this.head;

			var string = "";

			while (piece.next) {
				string += piece.str || "";
				piece = piece.next;
			}

			return string;
		}
	}, {
		key: "_joinSpans",
		value: function _joinSpans(startSpan, endSpan) {
			startSpan.next = endSpan;
			endSpan.previous = startSpan;
		}
	}, {
		key: "_string_into_spans",
		value: function _string_into_spans(str) {
			var startSpan = void 0;
			var endSpan = void 0;
			if (str.length < SPAN_SIZE) {

				var _startSpan = endSpan = new Span(str);

				return { startSpan: _startSpan, endSpan: endSpan };
			}
			for (var i = 0; i < str.length; i += SPAN_SIZE) {
				var span = new Span(str.slice(i, i + SPAN_SIZE));

				if (endSpan) {
					span.previous = endSpan;
					endSpan.next = span;
				} else {
					startSpan = span;
				}
				endSpan = span;
			}
			return { startSpan: startSpan, endSpan: endSpan }; //the last span in a mini chain
		}
	}, {
		key: "_split",
		value: function _split(span, offset) {

			var startSpan = new Span(span.str.slice(0, offset), span.previous);
			var endSpan = new Span(span.str.slice(offset), startSpan, span.next);
			startSpan.next = endSpan;
			return { startSpan: startSpan, endSpan: endSpan };
		}
	}, {
		key: "_clone",
		value: function _clone(span) {
			return new Span(span.content, span.previous, span.next);
		}
	}, {
		key: "createSpan",
		value: function createSpan(str) {
			return new Span(str);
		}
	}, {
		key: "_seek",
		value: function _seek(offset) {
			var combinedOffset = 0;
			var listSpan = this.head;

			while (listSpan.next && offset > combinedOffset + listSpan.length) {
				combinedOffset += listSpan.length;
				listSpan = listSpan.next;
			}

			return {
				span: listSpan,
				cursor: offset - combinedOffset
			};
		}
	}, {
		key: "_spanSize",
		get: function get() {
			//return the span size for testing;
			return SPAN_SIZE;
		}
	}]);

	return PieceChain;
}();

var Span = function () {
	function Span(str, previous, next) {
		_classCallCheck(this, Span);

		this.previous = previous;
		this.next = next;
		this.str = str;
	}

	_createClass(Span, [{
		key: "next",
		get: function get() {
			return this._next;
		},
		set: function set(value) {
			this._next = value;
		}
	}, {
		key: "previous",
		get: function get() {
			return this._previous;
		},
		set: function set(value) {
			this._previous = value;
		}
	}, {
		key: "str",
		get: function get() {
			return this._str;
		},
		set: function set(value) {

			this._str = value || "";
			this.length = this._str.length;
		}
	}]);

	return Span;
}();

module.exports = PieceChain;
