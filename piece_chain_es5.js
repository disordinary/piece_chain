

// A piece chain is a double linked list of text, it's similar to a piece tree but easier to impliment.
// It's used to manipulate large chunks of text efficiently and quickly, it also has virtually unlimited undo.

const SPAN_SIZE = 256; //the size of a span

function PieceChain( str ) {
	

	this.insert = function( offset , str ) {

		
		this.length += str.length;

		var _seekResult = this._seek( offset ) ;
		span = _seekResult.span;
		cursor = _seekResult.cursor; 

		this._modifyBuffer.push( span );

		var newSpans = this._string_into_spans( str );
		var newStartSpan = newSpans.startSpan;
		var newEndSpan = newSpans.endSpan;

		if( offset === 0 ) {
			this._joinSpans( newEndSpan , this.head.next );
			this._joinSpans( this.head , newStartSpan );
			return;
		}
		if( offset >= this.length ) {
			this._joinSpans( this.tail.previous  , newStartSpan );
			this._joinSpans( newEndSpan , this.tail );
			return;
		}

		
		
		var oldSpans = this._split( span , cursor );
		var oldStartSpan = oldSpans.startSpan;
		var oldEndSpan = oldSpans.endSpan;
 
		//replace the old span
		oldStartSpan.previous.next = oldStartSpan;
		oldEndSpan.next.previous = oldEndSpan;

		//insert the new spans into the chain
		this._joinSpans( oldStartSpan , newEndSpan );
		this._joinSpans( newStartSpan , oldEndSpan );
	}

	

	this.toString = function( ) {
		var piece = this.head;

			var string = "";

			while( piece.next ) {
				string += ( piece.str || "" );
				piece = piece.next;
			}

			return string;
	}

	this._joinSpans = function( startSpan , endSpan ) {
		startSpan.next = endSpan;
		endSpan.previous = startSpan;
	}


	this._string_into_spans = function( str  ) {
		var startSpan;
		var endSpan;
		if( str.length < SPAN_SIZE ) {

			var startSpan = endSpan = new Span( str );

			return { startSpan , endSpan};
		} 
		for( var i = 0 ; i < str.length; i+= SPAN_SIZE ) {
			var span = new Span( str.slice( i , i+SPAN_SIZE ) );
			
			if( endSpan ) {
				span.previous = endSpan;
				endSpan.next = span;
			} else {
				startSpan = span;
			}
			endSpan = span;
		}
		return { startSpan : startSpan , endSpan : endSpan}; //the last span in a mini chain
	}

	this._split = function( span , offset ) {
		
		var startSpan = new Span( span.str.slice( 0 , offset ) , span.previous  );
		var endSpan = new Span( span.str.slice( offset ) , startSpan , span.next);
		startSpan.next = endSpan;
		return{ startSpan : startSpan , endSpan : endSpan };
	}

	this._clone = function( span ) {
		return new Span( span.content , span.previous , span.next );
	}

	this.createSpan = function( str ) {
		return new Span( str );
	}

	this._seek = function( offset ) {
		let combinedOffset = 0;
		let listSpan = this.head;

		
		while( listSpan.next && offset > combinedOffset + listSpan.length ) {
			combinedOffset += listSpan.length;
			listSpan = listSpan.next;
		}

		return {
			  span : listSpan
			, cursor : offset - combinedOffset
		}

	}



	this.length = 0;
	this.head = new Span();
	this.tail = new Span();
	this._modifyBuffer = [ ];

	if( typeof str === 'string' ) {
		this.length = str.length
		var pieceChain = this._string_into_spans( str );

		this.head.next = pieceChain.startSpan;
		pieceChain.startSpan.previous = this.head;

		this.tail.previous = pieceChain.endSpan;
		pieceChain.endSpan.next = this.tail;
	} else {
		this.head.next = this.tail;
		this.tail.previous = this.head;
	}

	if( typeof str === 'string' ) {
		this.length = str.length
		var pieceChain = this._string_into_spans( str );

		this.head.next = pieceChain.startSpan;
		pieceChain.startSpan.previous = this.head;

		this.tail.previous = pieceChain.endSpan;
		pieceChain.endSpan.next = this.tail;
	} else {
		this.head.next = this.tail;
		this.tail.previous = this.head;
	}

}



function Span( str , previous , next ) {
		this.previous = previous;
		this.next = next;
		this.str = str || "";
		this.length = this.str.length;
	}


module.exports = PieceChain;
