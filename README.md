# chimera-patterns

Chimera patterns is an applied design pattern library for javascript/ECMA6 that contains generic versions of common patterns found in or useful to javascript coding.

## Current Namespace Functionality

### Mutlicast 
The _Multicast_ namespace contains classes that can be used to create executable callback lists for events and functions. The Multicast* class preseves 'this' context. 

**MulticastEvent Example:**

```Javascript
class TestClass {
    constructor() {
        //Events
        this.onSomeEvent = new MulticastEvent(); //Standard delcaration
        this.onSomeEvent2 = new MulticastEvent(this, 'onSomeEvent2'); //Protected declaration, does not allow onSomeEvent2 property to be re-assigned

        //Throws an error because onSomeEvent2 does not allow reassignment
        this.onSomeEvent2 = function badUserFunc() { console.log("I would have removed important callbacks"); }

        //Assign Event callbacks, this can be done externally too.
        this.onSomeEvent(()=> { console.log("gargoyle"); });
        this.onSomeEvent.push(()=> { console.log("ghoul"); });
        this.onSomeEvent2(function (myArg, myArg2, myArg3) { this.testClassVariable = "Chimera:" + myArg + myArg2 + myArg3; });
    }

    triggerSomeEvents() {
        this.onSomeEvent.callEvent(); //Triggers the event.
        this.onSomeEvent2.callEvent("lion", "lizard", "bat"); //Triggers the event.
    }
}
```

**MulticastFunction Example:**

```Javascript
var manyFuncs = new MulticastFunction();
manyFuncs.push( ( myArg ) => { console.log(myArg) });
manyFuncs.push( function( someArg ) { console.log( this.myVariable + someArg) }); //Demonstrates "this" will refer to assigned to object Multicast function is a part of.

b = {  func: manyFuncs, myVariable: "Yeti" };
b.func("Bear");

//Outputs:
//Bear
//YetiBear
```
### Aspect
The _Aspect_ namespace contains classes that are useful for adding onEntry, onExit, or decorator/wrapping methods to your functions. These are commonly used in aspect orientated programming where you seperate your business logic from your cross-cutting concerns (such as loggers or security checks). This implementation attaches the previously attached Multifunctions to the entry and exit of your code so many methods can be attached, removed or viewed with ease.

**OnMethodEntry/OnMethodExit Example:**

```javascript
class DatabaseClass {
    constructor(userRole) {
        this.userRole = userRole;
        var securityCheck = function() { if (this.userRole != "dragon") throw new Error("Not a dragon"); }
        var entryLog = ()=>{ console.log("Be here dragons?");}
        var exitLog = ()=>{ console.log("Here be dragons");}

        Aspect.onMethodEntry(this,'insert', securityCheck;)
        Aspect.onMethodEntry(this,'modify', securityCheck;)
        Aspect.onMethodEntry(this,'delete', securityCheck;)

        Aspect.onMethodEntry(this,'insert', entryLog;)
        Aspect.onMethodEntry(this,'modify', entryLog;)
        Aspect.onMethodEntry(this,'delete', entryLog;)

        Aspect.onMethodExit(this,'insert', exitLog;)
        Aspect.onMethodExit(this,'modify', exitLog;)
        Aspect.onMethodExit(this,'delete', exitLog;)

    }
    insert(document) { database.insert(document); }
    modify(document) { database.modify(document); }
    delete(document) { database.delete(document); }
}
```

**onMethodDecorator Example:**

```javascript
class DatabaseClass {
    constructor() {

        //An error handling advice that wraps around our business logic
        var errorHandler = function (callback, args) {
            console.log("I hope our remote database is online...");
            try {
                callback.apply(this, args);
            } catch (databaseNotConnectedError) {
                this.errorState = true;
                console.log("Database is not connected");
            }
        }
        //Assigns advice to our business logic
        Aspect.onMethodDecorator(this, 'insert', errorHandler);
        Aspect.onMethodDecorator(this, 'modify', errorHandler);
        Aspect.onMethodDecorator(this, 'delete', errorHandler);
    }

    //Some Business logic
    insert(document) { database.insert(document); }
    modify(document) { database.modify(document); }
    remove(document) { database.remove(document); }
}
```

### Observable
I still need to clean this one up.


### AsyncCallbackListCompleteNotifier
Often times when making multiple asynchronous calls one has to wait for all of them to finish without blocking before continuing. With the Asynchronous Callback List Complete Notifier you can observe a list of callbacks to observe for execution, and when they have all been called, trigger an onCompleted event.

**Example:**

```Javascript

notifier = new AsyncCallbackListCompleteNotifier();

//Wraps callbacks in an observer and registers them with the notifier.
var callback1 = notifier.registerCallback( (document)=>{ someProcess(document) });
var callback2 = notifier.registerCallback( (ajax)=>{ someProcess2(ajax) } );
var callback3 = notifier.registerEmptyCallback(); // An empty callback that lets us know when callback has triggered.

//3 Asynchronous functions
server.get(docId, callback1);
wepApi.get( someUrl, callback2 );

server.login({
    user:"Leprechaun",
    password:"potofgold", 
    onLoggedInEvent: callback3
});

//Registers the onCompleted event with the notifier
testNotifier.onCompleted( ()=> { console.log("User logged in AND document fetched AND Ajax fetched"); });

//After all callbacks are registered, enables the onComplete event, if all asynchrounous events complete before start() is called, 
// onCompleted will be called immediately .
testNotifier.start();

//Now, When all the callbacks have been called the onComplete notifier will be run.







