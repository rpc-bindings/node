exports.testMethod1 = async function (callback, input) {
    const result = await test.testMethod1(input);
    callback(null, result);
}

exports.testMethod2 = async function (callback, input) {
    const result = await test.testMethod2(input);
    callback(null, result);
}

exports.dynamic = async function (callback, input) {
    try {
        const obj = await requireObject('testObj');
        const result = await obj.testMethod1(input);

        callback(null, result);
    } catch (e) {
        callback(e.toString, null);
    }
}

exports.delegateTest = async function (callback) {
    const result = await test.delegateTest(function (input) {
        return input + "->JS";
    });

    callback(null, result);
}

exports.testProp = async function (callback, input) {
    try {
        test.testProp = input + "1";
        test.testProp = input + "2";

        const getResult = await test.testProp;

        callback(null, getResult);
    } catch (e) {
        callback(e.toString(), null);
    }
}

exports.testMethodResult = async function (callback) {
    try {
        const result = await test.testMethod3('str');
        const actual = await result.getValue();

        callback(null, actual === 'str');
    } catch (e) {
        callback(e.toString(), null);
    }
}

exports.testCallbackBinding = async function (callback) {
    try {
        const cb = async function (obj) {
            try {
                const actual = await obj.getValue();

                callback(null, actual === 'str');
            } catch (e) {
                callback('Error', null);
            }
        }

        await test.testMethod4(cb, 'str');
    } catch (e) {
        callback('Error', null);
    }
}

exports.testPropertyValueSet = async function (callback) {
    try {
        const result = await test.testMethod5('str');
        const actual = result.value;

        callback(null, actual === 'str');
    } catch (e) {
        callback(e.toString(), null);
    }
}