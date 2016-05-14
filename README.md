# piece_chain
A javascript implementation of a piece chain.

A piece chain is a way of structuring long strings in a linked list, it offers masive speed improvements over normal text handling in javascript. 

A good resource on piece chains is available here: http://www.catch22.net/tuts/piece-chains

Benchmarks show a 40-60x speed improvement over very large javascript strings with non sequential inputs. 

The other benefit of a piece chain is that it offers undo support virtually free.

ToDo: 
* Deletions are having issues.
* Add undo support.
* Add splice (which is simply a wrapper around delete and insert).
* Streams.


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
