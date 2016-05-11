# piece_chain
A javascript implementation of a piece chain.

A piece chain is a way of structuring long strings in a linked list it offers masive improvements over normal text handling in javascript. 

A good resource on piece chains is available here: http://www.catch22.net/tuts/piece-chains

Benchmarks show a 10x speed improvement over javascript strings. 

1,000 inserts on a 1,000,000 character string was 70ms for PieceChain vs 744ms for Javascript Strings.

1,000 inserts on a 10,000,000 character string was 726ms for PieceChain vs 6585ms for Javascript Strings.

The other benefit of a piece chain is that it offers undo support virtually free.

ToDo: 
* Deletions are having issues.
* Add undo support.
* Add replace (which is simply a deletion followed by an insert).
* Streams.

 ## Note:
 This only works in node 6, it uses plenty of ES6 goodness.

 ##Install:

`npm install piece_chain`

##How To:

```javascript
var PC = require('piece_chain');
var pc = new PC( A_VERY_LONG_STRING );
pc.insert( offset, ANOTHER_STRING );
pc.del( offset , length );
pc.toString();
```
