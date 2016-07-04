# chimera-patterns

Chimera patterns is an applied design pattern library for javascript/ECMA6 that contains generic versions of common patterns found or useful to javascript coding.

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
        this.onSomeEvent(()=> { console.log("ghoul"); });
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
manyFuncs.push( function( someArg ) { console.log( this.myVariable + someArg) });

b = {  func: manyFuncs, myVariable: "Yeti" };
b.func("Bear");

//Outputs:
//Bear
//YetiBear
```
### Aspect
The _Aspect_ namespace contains classes that are useful adding onEntry, onExit, or decorator/wrapping methods in additional code. These are commonly used in aspect orientated programming where you seperate your business logic from your cross-cutting concerns (such as loggers or security checks). onMethodEntry and onMethodExit use MulticastFunctions to allow for easier access to modifying onMethod* stacks.

**OnMethodEntry/OnMethodExit Example:**

```javascript
class DatabaseClass {
constructor(userRole) {
var securityCheck = function() { if (userRole != "dragon") throw new Error("Not a dragon"); }
var entryLog = function { console.log("Be here dragons?");
var exitLog = function { console.log("Here be dragons");

Aspect.onMethodEntry(this,'insert', securityCheck;)
Aspect.onMethodEntry(this,'insert', securityCheck;)
Aspect.onMethodEntry(this,'insert', securityCheck;)
Aspect.onMethodEntry(this,'insert', entryLog;)
Aspect.onMethodEntry(this,'insert', entryLog;)
Aspect.onMethodEntry(this,'insert', entryLog;)

Aspect.onMethodExit(this,'insert', exitLog;)
Aspect.onMethodExit(this,'insert', exitLog;)
Aspect.onMethodExit(this,'insert', exitLog;)

}
insert(document) { database.insert(document); }
modify(document) { database.insert(document); }
delete(document) { database.insert(document); }
}
```
**onMethodDecorator Example:**
```javascript

class DatabaseClass {
    constructor() {

        var errorHandler = function (callback, args) {
            try {
                console.log("I hope this works.");
                coreMethod.apply(this, args);
            } catch (databaseNotConnectedError) {
                this.errorState = true;
                console.log("Database is not connected");
            }
            Aspect.onMethodDecorator(this, 'insert', errorHandler);
            Aspect.onMethodDecorator(this, 'modify', errorHandler);
            Aspect.onMethodDecorator(this, 'delete', errorHandler);
        }
    }

    insert(document) { database.insert(document); }
    modify(document) { database.insert(document); }
    delete(document) { database.insert(document); }
}

```

### Observable
I still need to clean this one up.

....

### AsyncCallbackListCompleteNotifier
Often times when making multiple asynchronous calls one has to wait for all of them to finish without blocking before continuing. With the Asynchronous Callback List Complete Notifier you can observe a list of callbacks to observe for execution, and when they have all been called, trigger an onCompleted event.

**Example:**
```Javascript

notifier = new AsyncCallbackListCompleteNotifier();

//Wraps callbacks in an observer and registers them with the notifier.
var callback1 = notifier.registerCallback( (document)=>{ someProcess(document) });
var callback2 = notifier.registerCallback( (ajax)=>{ someProcess2(ajax) } );

//3 Asynchronous functions
db.get(docId, callback1);

api.get( someUrl, callback2 );

server.login({
    user:"Leprechaun",
    password:"potofgold", 
    onFinished: notifier.registerEmptyCallback() //Creates an empty callback.
});

//Registers the onCompleted event with the notifier
testNotifier.onCompleted( ()=> {
    console.log("User logged in AND document fetched AND Ajax fetched")
});

//After all callbacks are registered, enables the onComplete event.
testNotifier.start();

//When all the callbacks have been called the onComplete notifier will be run.







