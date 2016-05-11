var assert = require("assert");
var PieceChain = require("../index.js");
 
 function stringSplice( str , start , delcount , newstr ) {
 	newstr = newstr || "";
 	return str.slice( 0 , start ) + newstr + str.slice( start + delcount );
 }

var test_string = "";
var lengthOfTestString = 1000000;
for( var i = 0; i < lengthOfTestString; i++ ) {
	test_string+= i%10;
}



describe( "PieceChain insertion tests" , ( ) => {
	
		
		it('The string from the chain should be the same if built from the back or from the start', ( done ) => {

			var pc = new PieceChain( test_string );
			var piece = pc.head;

			var movingForwards = "";

			while( piece.next ) {
				movingForwards += ( piece.str || "" );
				piece = piece.next;
			}

			
			var piece = pc.tail;

			var movingBackwards = "";

			while( piece.previous ) {
				movingBackwards = ( piece.str || "" ) + movingBackwards;
				piece = piece.previous;
			}

			
			assert.equal( movingBackwards , movingForwards );
			done();
		} );

		it( 'Splitting a span should result in two spans at the same split point ' , ( done ) => {
			var pc = new PieceChain( );
			var spans = pc._split( pc.createSpan( "TESTSTR") , 3);

			assert.equal( spans.startSpan.str , "TES" );
			assert.equal( spans.endSpan.str , "TSTR" );
			
			assert.equal(spans.startSpan.next , spans.endSpan );
			assert.equal(spans.endSpan.previous , spans.startSpan );
			done();
			
		});

		it( 'A seek operation should return a string and cursor offset' , ( done ) => {
				var pc = new PieceChain( test_string );
				var offset = 588; //the offset to seek to
				var seeked = pc._seek( offset );
				var spanSize = pc._spanSize;
				var offsetForSpan  = Math.floor( offset / spanSize) * spanSize;

				assert.equal( seeked.span.str , test_string.slice( offsetForSpan , offsetForSpan + spanSize ));// Math.floor( offset / 256 ) * 256 );
				assert.equal( seeked.cursor,offset % spanSize );
				done();
		});
		
		it( 'I can add to the start and end of the chain ' , ( done ) => {
			var pc = new PieceChain( test_string );
			var newTestString = test_string;

			pc.insert( lengthOfTestString , "End");
			newTestString += "End";


			pc.insert( lengthOfTestString + 100, " BEYOND THE END");
			newTestString += " BEYOND THE END";

			pc.insert( 0 , "Start" );
			newTestString = "Start" + newTestString;
			
			pc.insert( 100 , "Middle" );
			newTestString = stringSplice( newTestString , 100 , 0 , "Middle");
		
			assert.equal( pc.toString( ) , newTestString );
			done();
		});

		it( 'I can add to the start of a piece ' , ( done ) => {
			var pc = new PieceChain( test_string );
			var newTestString = test_string;

			pc.insert( 257 , "**************************" );
		

			
			newTestString = stringSplice( newTestString , 257 , 0 , "**************************");
			
			assert.equal( pc.toString() , newTestString );
			done();
		});

		it( 'I can add to the end of a piece ' , ( done ) => {
			var pc = new PieceChain( test_string );
			var newTestString = test_string;

			pc.insert( 256 , "**************************" );
			
			newTestString = stringSplice( newTestString , 256 , 0 , "**************************");
		
			assert.equal( pc.toString() , newTestString );
			done();
		});

		it( 'The length reflects the actual length' , ( done ) => {
			
			var pc = new PieceChain( test_string );
			var newTestString = test_string;

			pc.insert( 256 , "**************************" );	
			newTestString = stringSplice( newTestString , 256 , 0 , "**************************");

			pc.insert( 1256 , "**************************" );	
			newTestString = stringSplice( newTestString , 1256 , 0 , "**************************");
		
			assert.equal( pc.length , newTestString.length );

			done();
		});

});

describe( "PieceChain deletion tests" , ( ) => {
	/*it( 'I can delete within one piece' , ( done ) => {
		var pc = new PieceChain( test_string );
		var delTestString = test_string;
		pc.del( 100 , 4 );
		delTestString = stringSplice(delTestString , 100 , 4 );


		assert.equal( pc.toString( ) , delTestString );
		assert.equal( pc.length , delTestString.length );
		done();
	});

	it( 'I can delete multiple pieces' , ( done ) => {
		var pc = new PieceChain( test_string );
		var delTestString = test_string;
		pc.del( 150 , 300 );
		delTestString = stringSplice(delTestString , 150 , 300 );
		assert.equal( pc.toString( ) , delTestString );
		assert.equal( pc.length , delTestString.length );
		done();
	});*/
});


describe( "PieceChain benchmarking" , ( ) => {
	var pc = new PieceChain( test_string );
	var benchMarkString = test_string;
	it( 'The PieceChain should be faster at insertions than a string' , ( done ) => {
		var stringStartTime = Date.now();
		for( var i = 0; i < 1000; i++ ) {
			benchMarkString = stringSplice( benchMarkString , Math.random() * lengthOfTestString , 0 , "TEST" );
		}

		var stringTime = Date.now( ) - stringStartTime ;


		var pcStartTime = Date.now();
		for( var i = 0; i < 1000; i++ ) {
			pc.insert( Math.random() * lengthOfTestString , "TEST" );
		//	benchMarkString = stringSplice( benchMarkString , Math.random() * lengthOfTestString , 0 , "TEST" );
		}

		var pcTime = Date.now( ) - pcStartTime ;
		assert.ok( pcTime < stringTime );
		console.log( "The PieceChain did it in: " + pcTime + "ms, String manipulation did it in: " + stringTime +"ms" );
		done();
	} );
} );

