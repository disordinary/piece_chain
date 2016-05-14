

// A piece chain is a double linked list of text, it's similar to a piece tree but easier to impliment.
// It's used to manipulate large chunks of text efficiently and quickly, it also has virtually unlimited undo.

const SPAN_SIZE = 256; //the size of a span

class PieceChain {
	constructor( str ) {
		
		this.length =  0;
		this.head = new Span( );
		this.tail = new Span( );
		this._modifyBuffer = [ ];
		if( typeof str === 'string' ) {
			this.length = str.length
			let pieceChain = this._string_into_spans( str );

			this.head.next = pieceChain.startSpan;
			pieceChain.startSpan.previous = this.head;

			this.tail.previous = pieceChain.endSpan;
			pieceChain.endSpan.next = this.tail;
		} else {
			this.head.next = this.tail;
			this.tail.previous = this.head;
		}
	}


	insert( offset , str ) {

		
		this.length += str.length;

		let { span , cursor } = this._seek( offset ) ;

		this._modifyBuffer.push( span );

		let newSpans = this._string_into_spans( str );
		let newStartSpan = newSpans.startSpan;
		let newEndSpan = newSpans.endSpan;

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

		
		
		let oldSpans = this._split( span , cursor );
		let oldStartSpan = oldSpans.startSpan;
		let oldEndSpan = oldSpans.endSpan;
 
		//replace the old span
		oldStartSpan.previous.next = oldStartSpan;
		oldEndSpan.next.previous = oldEndSpan;

		//insert the new spans into the chain
		this._joinSpans( oldStartSpan , newEndSpan );
		this._joinSpans( newStartSpan , oldEndSpan );
	}

	del( offset , length ) {
		this.length -= length;
		let {span , cursor} = this._seek( offset );
	
		if( span.length - cursor > length ) {
			let spanStart = this._split( span , offset );
			let spanEnd = this._split( spanStart.endSpan , length );
			this._joinSpans( span.previous , spanStart.startSpan );
			this._joinSpans( spanEnd.endSpan , span.next  );
			this._joinSpans( spanStart.startSpan , spanEnd.endSpan );
			return;
		} 

			let theEndSpan = this._seek( offset + length );
			let spanStart = this._split( span , offset );
			
			let spanEnd = this._split( theEndSpan.span , theEndSpan.cursor );

			spanStart.startSpan._str =  spanStart.startSpan._str ;
			spanEnd.endSpan._str = spanEnd.endSpan._str ;

			this._joinSpans( span.previous , spanStart.startSpan );
			this._joinSpans( spanEnd.endSpan , spanEnd.endSpan.next  );
			this._joinSpans( spanStart.startSpan , spanEnd.endSpan );
		return;
		
	}

	toString( ) {
		var piece = this.head;

			var string = "";

			while( piece.next ) {
				string += ( piece.str || "" );
				piece = piece.next;
			}

			return string;
	}

	_joinSpans( startSpan , endSpan ) {
		startSpan.next = endSpan;
		endSpan.previous = startSpan;
	}


	_string_into_spans( str  ) {
		let startSpan;
		let endSpan;
		if( str.length < SPAN_SIZE ) {

			let startSpan = endSpan = new Span( str );

			return { startSpan , endSpan};
		} 
		for( var i = 0 ; i < str.length; i+= SPAN_SIZE ) {
			let span = new Span( str.slice( i , i+SPAN_SIZE ) );
			
			if( endSpan ) {
				span.previous = endSpan;
				endSpan.next = span;
			} else {
				startSpan = span;
			}
			endSpan = span;
		}
		return { startSpan , endSpan}; //the last span in a mini chain
	}

	_split( span , offset ) {
		
		let startSpan = new Span( span.str.slice( 0 , offset ) , span.previous  );
		let endSpan = new Span( span.str.slice( offset ) , startSpan , span.next);
		startSpan.next = endSpan;
		return{ startSpan , endSpan };
	}

	_clone( span ) {
		return new Span( span.content , span.previous , span.next );
	}

	createSpan( str ) {
		return new Span( str );
	}

	_seek( offset ) {
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

	get _spanSize( ) {
		//return the span size for testing;
		return SPAN_SIZE;
	}

}

class Span {
	constructor( str , previous , next ) {
		this.previous = previous;
		this.next = next;
		this.str = str;
	}
	get next( ) {
		return this._next;
	}

	set next( value ) {
		this._next = value;
	}

	get previous( ) {
		return this._previous;
	}

	set previous( value ) {
		this._previous = value;
	}

	get str() {
		return this._str
	}

	set str( value ) {
		
		this._str = value || "";
		this.length = this._str.length;

	}
}

module.exports = PieceChain;
