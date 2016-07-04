/**
 * Created by Greg on 6/30/2016.
 */
import "/common/chimera_pattern"

describe('FrameworkPattern', function() {

    describe('Multicast', function() {

        var MulticastBase = Pattern.Multicast.MulticastBase;
        var MulticastEvent = Pattern.Multicast.MulticastEvent;
        var MulticastFunction = Pattern.Multicast.MulticastFunction;

        it('tests MulticastBase push and call events and passing arguments', function () {
            var testVar = false;
            var testVar2 = false;
            var target = { test: 1 };
            var base = new MulticastBase();
            assert(base.apply, "ensure inheritance from function");
            assert(base.lock, "ensure class methods are making it into prototype");
            base.push((a)=> { testVar = a; });
            base.push((a,b)=> { testVar2 = b; });
            base.push(function (a,b) { assert.equal(this,target, "this should reference our target object."); });

            base.callMethods(target, 1, 2);
            assert.equal(testVar, 1, "should be assigned 1");
            assert.equal( testVar2, 2,  "should be assigned 2");
        });

        it('should test MulticastBase lock', function() {
            var testObj = {};
            testObj.onTestEvent = new MulticastBase( testObj,'onTestEvent' );
            assert(testObj.onTestEvent instanceof MulticastBase, "should be instance of Multicast base." );

            testObj.onTestEvent.lock(testObj,'onTestEvent');
            assert.throws( function() {testObj.onTestEvent = null}, Pattern.Lock.LockError, "should throw an error on assignment.");
            assert(testObj.onTestEvent instanceof MulticastBase, "should not be null because of lock." );
        });

        it('should create multicast event, add methods, execute methods, and preserve this context, test lock', function() {
            var event = new MulticastEvent( );
            assert( event.apply, "should have an function methods" );
            assert( event.lock, "should have multicastBase methods" );
            assert( event._array,"should have assigned variables" );

            assert( event.callEvent.apply, "should have an apply method" );

            var testObj = {};
            var testVal1 = 10;
            testObj.testVal2 = 20;
            testObj.onTestEvent = new MulticastEvent( testObj, 'onTestEvent' );
            testObj.onTestEvent( (a)=> { testVal1 = a; });
            testObj.onTestEvent( function(a) {
                assert.equal(this,testObj, "context should be the target assigned at instantiation.");
                this.testVal2 = 200;
            });

            testObj.onTestEvent.callEvent(100);
            assert.equal(testVal1,100, "testval1 should be 100.");
            assert.equal(testObj.testVal2,200,"testval2 should be 200 meaning 'this' context works correctly");

            assert(testObj.onTestEvent instanceof MulticastEvent, "should be instance of MulticastEvent." );
            testObj.onTestEvent.lock();
            assert.throws( function() { testObj.onTestEvent = null }, Pattern.Lock.LockError, "should throw an error on assignment.");
            assert(testObj.onTestEvent instanceof MulticastEvent, "should not be null because of lock." );
        });

        it('should create multicast function, add methods, execute methods, and preserve this context, test lock', function() {
            var func = new MulticastFunction( );
            assert( func.apply, "should have an function methods" );
            assert( func.lock, "should have multicastBase methods" );
            assert( func._array,"should have assigned variables" );

            var testObj = {};
            var testVal1 = 10;
            testObj.testVal2 = 20;
            testObj.onTestFunc = new MulticastFunction( );
            testObj.onTestFunc.push( (a) => { testVal1 = a; });
            testObj.onTestFunc.push( function(a) {
                assert.equal(this,testObj, "context should be object test func is called from.");
                this.testVal2 = 200;
            });

            testObj.onTestFunc(100);
            assert.equal(testVal1,100, "testval1 should be 100.");
            assert.equal(testObj.testVal2, 200,"testval2 should be 200 meaning 'this' context works correctly");

            assert(testObj.onTestFunc instanceof MulticastFunction, "should be instance of MulticastFunction." );
            testObj.onTestFunc.lock(testObj,'onTestFunc');
            assert.throws( function() { testObj.onTestFunc = null }, Pattern.Lock.LockError, "should throw an error on assignment.");
            assert(testObj.onTestFunc instanceof MulticastFunction, "should not be null because of lock." );
        });

    });

    describe('Aspect', function() {
        var Aspect = Pattern.Aspect;

        it('should test to see if the aspect proxy is transparent', function(){
            var testMethod = function( a ) { return a };
            var aspectMethod = Aspect.createAspectProxy(testMethod);
            assert.equal( aspectMethod(5),5, "argument and return value should be the same");

            var testObj = { val:1,testMethod2: function(a) {return (a + this.val); } };
            var result1 = testObj.testMethod2(50);
            testObj.testMethod2 = Aspect.createAspectProxy(testObj.testMethod2);
            var result2 = testObj.testMethod2(50);
            assert.equal(result1,result2, "'this' context should be preserved and yield the same result after proxy");
        });

        it('should test to see if the aspect proxy onMethod* work and see if they can change arguments and return values', function(){
            var testMethod = function( a ) { return a };
            var aspectMethod = Aspect.createAspectProxy(testMethod);
            var testVar1 = 0;
            aspectMethod.aspect.onMethodEntry.push( function(a) { testVar1 = a} );
            var testVar2 = 0;
            aspectMethod.aspect.onMethodExit.push( function(returnValue, a) { testVar2 = a; });
            var testVar3 = aspectMethod(10);

            assert.equal(testVar1, 10, "testvar1 value should change to 10");
            assert.equal(testVar2, 10, "testvar2 value should change to 10");
            assert.equal(testVar3, 10, "testvar3 value should change to 10");

            var testObj = { val1:0, val2:0, val3: 0, val4:0, testMethod2: function(a,b,c,d) { this.val2 = b*2; return d;} };
            testObj.testMethod2 = Aspect.createAspectProxy(testObj.testMethod2);
            testObj.testMethod2.aspect.onMethodEntry.push( function(a, b, c) { this.val1 += a;} );
            testObj.testMethod2.aspect.onMethodEntry.push( function(a, b, c) { this.val1 += a;} );
            testObj.testMethod2.aspect.onMethodExit.push( function(ret, a, b, c) { this.val3 += c;} );
            testObj.testMethod2.aspect.onMethodExit.push( function(ret, a, b, c) { this.val3 += c; this.val4 = ret} );

            testObj.testMethod2(1,10,100,500);
            assert.equal(testObj.val1, 2, "assignment should work");
            assert.equal(testObj.val2, 20, "assignment should work");
            assert.equal(testObj.val3, 200, "assignment should work");
            assert.equal(testObj.val4, 500, "assignment should work");
        });

        it('should test the convience methods Aspect.onMethodEntry and onMethodExit', function(){
            var testObj = { val1:0, val2:0, val3: 0, val4:0, testMethod2: function(a,b,c,d) { this.val2 = b*2; return d;} };
            Aspect.onMethodEntry(testObj,'testMethod2', function(a,b,c) { this.val1 += a;});
            Aspect.onMethodEntry(testObj,'testMethod2', function(a,b,c) { this.val1 += a;});
            Aspect.onMethodExit(testObj,'testMethod2', function(ret, a,b,c) { this.val3 += c;} );
            Aspect.onMethodExit(testObj,'testMethod2', function(ret, a,b,c) { this.val3 += c; this.val4 = ret} );

            testObj.testMethod2(1,10,100,500);
            assert.equal(testObj.val1, 2, "assignment should work");
            assert.equal(testObj.val2, 20, "assignment should work");
            assert.equal(testObj.val3, 200, "assignment should work");
            assert.equal(testObj.val4, 500, "assignment should work");

        });

        it('should test the decorator/wrap function', function(){
            var testObj = {
                val1:0,
                val2:0,
                val3:0,
                val4:0,
                testMethod: function(a,b,c,d) { this.val1 = a; return d;} };

            var testDecorator = function(coreMethod, args) {
                this.val2 = args[1];
                var returnValue = coreMethod.apply(this, args);
                this.val3 = args[2];
                this.val4 = returnValue;
                return returnValue;
            };

            Aspect.onMethodDecorator(testObj,'testMethod',testDecorator);

            var returnVal = testObj.testMethod(1,2,3,4);
            assert.equal(testObj.val1, 1, "assignment should work");
            assert.equal(testObj.val2, 2, "assignment should work");
            assert.equal(testObj.val3, 3, "assignment should work");
            assert.equal(testObj.val4, 4, "assignment should work");
            assert.equal(returnVal, 4)

            var testDecorator2 = function(coreMethod, args) {
                this.val1 = 1000;
                var returnValue = coreMethod.apply(this, args);
                this.val2 = 1000;
                return returnValue;
            };

            Aspect.onMethodDecorator(testObj,'testMethod',testDecorator2);
            var returnVal2 = testObj.testMethod(1,2,3,100);

            assert.equal(testObj.val1, 1, "should be assigned 1000 by decorator2 1000, then 1 by decorator");
            assert.equal(testObj.val2, 1000, "should be assigned 2 ny decorator then assigned to 1000 by decorator2");
            assert.equal(returnVal2, 100);
        });

        it('should test on entry, on exit, and decorator wrap together', function(){
            var testObj = { val1:0,
                val2:0,
                val3:0,
                val4:0,
                val5:0,
                val6:0,
                testMethod: function(a,b,c,d) { this.val2 = b*2; return d;} };
            Aspect.onMethodEntry(testObj,'testMethod', function(a,b,c) { this.val1 += a;});
            Aspect.onMethodEntry(testObj,'testMethod', function(a,b,c) { this.val1 += a;});
            Aspect.onMethodExit(testObj,'testMethod', function(ret, a,b,c) { this.val3 += c;} );
            Aspect.onMethodExit(testObj,'testMethod', function(ret, a,b,c) { this.val3 += c;} );


            var testDecorator = function(coreMethod, args) {
                this.val5 = args[1]*1000;
                var returnValue = coreMethod.apply(this, args);
                this.val6 = args[2]*1000;
                this.val4 = returnValue;
                return returnValue*-1;
            };
            Aspect.onMethodDecorator(testObj,'testMethod',testDecorator);

            var ret = testObj.testMethod(1,10,100,500);
            assert.equal(testObj.val1, 2, "assignment should work");
            assert.equal(testObj.val2, 20, "assignment should work");
            assert.equal(testObj.val3, 200, "assignment should work");
            assert.equal(testObj.val4, 500, "inner return val");
            assert.equal(testObj.val5, 10*1000, "decorator");
            assert.equal(testObj.val6, 100*1000, "decorator");
            assert.equal(ret, -500, "return value inverted by decorator");


        });

        it('TODO: test the onFunc* methods',function(){
        })

    });

    describe('Observable', function() {
    });

    describe('AsyncCallbackListCompleteNotifier', function(done) {
        var AsyncCallbackListCompleteNotifier = Pattern.AsyncCallbackListCompleteNotifier;

        it('tests the single case of the notifier', function(done) {
            var testNotifier = new AsyncCallbackListCompleteNotifier();
            var true1 = false;

            var func1 = ()=> { true1 = true; }
            testNotifier.onCompleted( ()=> { assert(true1); done(); });
            setTimeout(testNotifier.registerCallback(func1), 50);
            testNotifier.start();
        });

        it('tests the case of the empty notifier', function(done){
            var testNotifier = new AsyncCallbackListCompleteNotifier();
            var time = Date.now();

            var func1 = testNotifier.registerEmptyCallback();

            testNotifier.onCompleted( ()=> {
                assert.isAbove( Date.now(), time + 99, "Checks to make sure it paused 100ms");
                done();
            });

            testNotifier.start();
            setTimeout(func1, 100);
        });

        it('tests the standard case of the notifier',function(done) {
            
            var testNotifier = new AsyncCallbackListCompleteNotifier();
            var true1 = false;
            var true2 = false;
            var true3 = false;

            var func1 = ()=>{ true1 = true; };
            var func2 = ()=>{ true2 = true; };
            var func3 = testNotifier.registerCallback( ()=>{ true3 = true; });

            setTimeout(testNotifier.registerCallback(func1), 100);
            setTimeout(testNotifier.registerCallback(func2), 200);
            setTimeout( func3, 500);
            
            testNotifier.onCompleted( ()=> {
                assert(true1);
                assert(true2);
                assert(true3);
                done();
            });
            
            testNotifier.start();
        });

        it('tests the case of the notifier if jobs complete before activate is called',function(done) {
            var testNotifier = new AsyncCallbackListCompleteNotifier();

            var true1 = false;
            var true2 = false;
            var true3 = false;

            var func1 = ()=>{ true1 = true; };
            var func2 = ()=>{ true2 = true; };
            var func3 = ()=>{ true3 = true; };

            testNotifier.onCompleted(()=> {
                assert(true1);
                assert(true2);
                assert(true3);
                done();
            });

            setTimeout( testNotifier.registerCallback(func1), 10);
            setTimeout( testNotifier.registerCallback(func2), 20);
            setTimeout( testNotifier.registerCallback(func3), 30);

            setTimeout(()=> { testNotifier.start(); }, 500);
        });
    });
});