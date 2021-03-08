"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackedAction = exports.dependsOn = exports.resetter = exports.getValue = exports.succeeded = exports.getError = exports.isPending = void 0;
var mobx_1 = require("mobx");
var mobx_utils_1 = require("mobx-utils");
function isPending(v) {
    var _a;
    validateTrackedAction(v);
    if ((_a = v) === null || _a === void 0 ? void 0 : _a.trackedAction) {
        return v.pending;
    }
    var value = toPromise(v);
    return mobx_utils_1.fromPromise(value).case({
        fulfilled: function () { return false; },
        pending: function () { return true; },
        rejected: function () { return false; }
    });
}
exports.isPending = isPending;
var getError = function (v) {
    var _a, _b;
    validateTrackedAction(v);
    if ((_a = v) === null || _a === void 0 ? void 0 : _a.trackedAction) {
        return (_b = v) === null || _b === void 0 ? void 0 : _b.error;
    }
    var value = toPromise(v);
    return mobx_utils_1.fromPromise(value).case({
        fulfilled: function () { return undefined; },
        pending: function () { return undefined; },
        rejected: function (err) { return err; }
    });
};
exports.getError = getError;
var succeeded = function (action) {
    var _a;
    validateTrackedAction(action);
    return (_a = action) === null || _a === void 0 ? void 0 : _a.success;
};
exports.succeeded = succeeded;
function getValue(v) {
    var value = toPromise(v);
    return mobx_utils_1.fromPromise(value).case({
        fulfilled: function (v) { return v; },
        pending: function () { return undefined; },
        rejected: function () { return undefined; }
    });
}
exports.getValue = getValue;
var resetter = function (action) {
    var _a;
    validateTrackedAction(action);
    return ((_a = action) === null || _a === void 0 ? void 0 : _a.reset) || (function () { });
};
exports.resetter = resetter;
function dependsOn() {
    var dependencies = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        dependencies[_i] = arguments[_i];
    }
    void dependencies.map(function (it) {
        var _a, _b, _c, _d, _e;
        if (((_a = it === null || it === void 0 ? void 0 : it.constructor) === null || _a === void 0 ? void 0 : _a.name) === 'ObservableValue')
            return (_b = it === null || it === void 0 ? void 0 : it.get) === null || _b === void 0 ? void 0 : _b.call(it);
        if (((_c = it === null || it === void 0 ? void 0 : it.constructor) === null || _c === void 0 ? void 0 : _c.name) === 'ComputedValue')
            return (_d = it === null || it === void 0 ? void 0 : it.get) === null || _d === void 0 ? void 0 : _d.call(it);
        if (it === null || it === void 0 ? void 0 : it.trackedAction)
            return void ((_e = it === null || it === void 0 ? void 0 : it.successVersion) === null || _e === void 0 ? void 0 : _e.get());
    });
}
exports.dependsOn = dependsOn;
function trackedAction(target, key, baseDescriptor) {
    var fn = baseDescriptor ? baseDescriptor.value : target;
    var fnState = mobx_1.observable.object({
        pending: false,
        success: false,
        error: undefined,
        response: undefined
    });
    var successVersion = mobx_1.observable.box(0);
    var actionWrapper = function () {
        var _this = this;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        mobx_1.runInAction(function () {
            fnState.pending = true;
            fnState.success = false;
            fnState.error = undefined;
            fnState.response = undefined;
        });
        return new Promise(function (resolve, reject) {
            mobx_1.runInAction(function () {
                try {
                    resolve(fn.apply(_this, args));
                }
                catch (err) {
                    reject(err);
                }
            });
        }).then(function (response) {
            mobx_1.runInAction(function () {
                successVersion.set(successVersion.get() + 1);
                fnState.pending = false;
                fnState.success = true;
                fnState.error = undefined;
                fnState.response = response;
            });
            return Promise.resolve(response);
        }, function (err) {
            mobx_1.runInAction(function () {
                fnState.response = undefined;
                fnState.pending = false;
                fnState.error = err;
            });
            return Promise.reject(err);
        });
    };
    Object.defineProperty(actionWrapper, 'successVersion', {
        enumerable: false,
        value: successVersion
    });
    Object.defineProperty(actionWrapper, 'pending', {
        get: function () { return fnState.pending; }
    });
    Object.defineProperty(actionWrapper, 'error', {
        get: function () { return fnState.error; }
    });
    Object.defineProperty(actionWrapper, 'response', {
        get: function () { return fnState.response; }
    });
    Object.defineProperty(actionWrapper, 'success', {
        get: function () { return fnState.success; }
    });
    actionWrapper.trackedAction = true;
    actionWrapper.reset = function () {
        return mobx_1.runInAction(function () {
            fnState.pending = false;
            fnState.success = false;
            fnState.error = undefined;
            fnState.response = undefined;
        });
    };
    if (baseDescriptor) {
        var firstRun_1 = true;
        return {
            configurable: true,
            get: function () {
                if (firstRun_1 === true) {
                    fn = fn.bind(this);
                    firstRun_1 = false;
                }
                return actionWrapper;
            },
            set: function (newFn) {
                fn = newFn;
            }
        };
    }
    else {
        return actionWrapper;
    }
}
exports.trackedAction = trackedAction;
function validateTrackedAction(v) {
    if (typeof v === 'function' && !v.hasOwnProperty('trackedAction')) {
        throw new Error(v.name + " is not a tracked action");
    }
}
function toPromise(v) {
    var value = v instanceof Promise
        ? Promise.resolve(v)
        : v && typeof v.get === 'function'
            ? Promise.resolve(v.get())
            : Promise.resolve();
    return value;
}
