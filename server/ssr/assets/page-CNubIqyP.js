import { c as __toESM, n as require_jsx_runtime, o as require_react, s as __commonJSMin, t as require_react_dom } from "../index.js";
//#region ../../../../2026-07-18/rk/node_modules/.pnpm/scheduler@0.27.0/node_modules/scheduler/cjs/scheduler.production.js
/**
* @license React
* scheduler.production.js
*
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var require_scheduler_production = /* @__PURE__ */ __commonJSMin(((exports) => {
	function push(heap, node) {
		var index = heap.length;
		heap.push(node);
		a: for (; 0 < index;) {
			var parentIndex = index - 1 >>> 1, parent = heap[parentIndex];
			if (0 < compare(parent, node)) heap[parentIndex] = node, heap[index] = parent, index = parentIndex;
			else break a;
		}
	}
	function peek(heap) {
		return 0 === heap.length ? null : heap[0];
	}
	function pop(heap) {
		if (0 === heap.length) return null;
		var first = heap[0], last = heap.pop();
		if (last !== first) {
			heap[0] = last;
			a: for (var index = 0, length = heap.length, halfLength = length >>> 1; index < halfLength;) {
				var leftIndex = 2 * (index + 1) - 1, left = heap[leftIndex], rightIndex = leftIndex + 1, right = heap[rightIndex];
				if (0 > compare(left, last)) rightIndex < length && 0 > compare(right, left) ? (heap[index] = right, heap[rightIndex] = last, index = rightIndex) : (heap[index] = left, heap[leftIndex] = last, index = leftIndex);
				else if (rightIndex < length && 0 > compare(right, last)) heap[index] = right, heap[rightIndex] = last, index = rightIndex;
				else break a;
			}
		}
		return first;
	}
	function compare(a, b) {
		var diff = a.sortIndex - b.sortIndex;
		return 0 !== diff ? diff : a.id - b.id;
	}
	exports.unstable_now = void 0;
	if ("object" === typeof performance && "function" === typeof performance.now) {
		var localPerformance = performance;
		exports.unstable_now = function() {
			return localPerformance.now();
		};
	} else {
		var localDate = Date, initialTime = localDate.now();
		exports.unstable_now = function() {
			return localDate.now() - initialTime;
		};
	}
	var taskQueue = [], timerQueue = [], taskIdCounter = 1, currentTask = null, currentPriorityLevel = 3, isPerformingWork = !1, isHostCallbackScheduled = !1, isHostTimeoutScheduled = !1, needsPaint = !1, localSetTimeout = "function" === typeof setTimeout ? setTimeout : null, localClearTimeout = "function" === typeof clearTimeout ? clearTimeout : null, localSetImmediate = "undefined" !== typeof setImmediate ? setImmediate : null;
	function advanceTimers(currentTime) {
		for (var timer = peek(timerQueue); null !== timer;) {
			if (null === timer.callback) pop(timerQueue);
			else if (timer.startTime <= currentTime) pop(timerQueue), timer.sortIndex = timer.expirationTime, push(taskQueue, timer);
			else break;
			timer = peek(timerQueue);
		}
	}
	function handleTimeout(currentTime) {
		isHostTimeoutScheduled = !1;
		advanceTimers(currentTime);
		if (!isHostCallbackScheduled) if (null !== peek(taskQueue)) isHostCallbackScheduled = !0, isMessageLoopRunning || (isMessageLoopRunning = !0, schedulePerformWorkUntilDeadline());
		else {
			var firstTimer = peek(timerQueue);
			null !== firstTimer && requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
		}
	}
	var isMessageLoopRunning = !1, taskTimeoutID = -1, frameInterval = 5, startTime = -1;
	function shouldYieldToHost() {
		return needsPaint ? !0 : exports.unstable_now() - startTime < frameInterval ? !1 : !0;
	}
	function performWorkUntilDeadline() {
		needsPaint = !1;
		if (isMessageLoopRunning) {
			var currentTime = exports.unstable_now();
			startTime = currentTime;
			var hasMoreWork = !0;
			try {
				a: {
					isHostCallbackScheduled = !1;
					isHostTimeoutScheduled && (isHostTimeoutScheduled = !1, localClearTimeout(taskTimeoutID), taskTimeoutID = -1);
					isPerformingWork = !0;
					var previousPriorityLevel = currentPriorityLevel;
					try {
						b: {
							advanceTimers(currentTime);
							for (currentTask = peek(taskQueue); null !== currentTask && !(currentTask.expirationTime > currentTime && shouldYieldToHost());) {
								var callback = currentTask.callback;
								if ("function" === typeof callback) {
									currentTask.callback = null;
									currentPriorityLevel = currentTask.priorityLevel;
									var continuationCallback = callback(currentTask.expirationTime <= currentTime);
									currentTime = exports.unstable_now();
									if ("function" === typeof continuationCallback) {
										currentTask.callback = continuationCallback;
										advanceTimers(currentTime);
										hasMoreWork = !0;
										break b;
									}
									currentTask === peek(taskQueue) && pop(taskQueue);
									advanceTimers(currentTime);
								} else pop(taskQueue);
								currentTask = peek(taskQueue);
							}
							if (null !== currentTask) hasMoreWork = !0;
							else {
								var firstTimer = peek(timerQueue);
								null !== firstTimer && requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
								hasMoreWork = !1;
							}
						}
						break a;
					} finally {
						currentTask = null, currentPriorityLevel = previousPriorityLevel, isPerformingWork = !1;
					}
					hasMoreWork = void 0;
				}
			} finally {
				hasMoreWork ? schedulePerformWorkUntilDeadline() : isMessageLoopRunning = !1;
			}
		}
	}
	var schedulePerformWorkUntilDeadline;
	if ("function" === typeof localSetImmediate) schedulePerformWorkUntilDeadline = function() {
		localSetImmediate(performWorkUntilDeadline);
	};
	else if ("undefined" !== typeof MessageChannel) {
		var channel = new MessageChannel(), port = channel.port2;
		channel.port1.onmessage = performWorkUntilDeadline;
		schedulePerformWorkUntilDeadline = function() {
			port.postMessage(null);
		};
	} else schedulePerformWorkUntilDeadline = function() {
		localSetTimeout(performWorkUntilDeadline, 0);
	};
	function requestHostTimeout(callback, ms) {
		taskTimeoutID = localSetTimeout(function() {
			callback(exports.unstable_now());
		}, ms);
	}
	exports.unstable_IdlePriority = 5;
	exports.unstable_ImmediatePriority = 1;
	exports.unstable_LowPriority = 4;
	exports.unstable_NormalPriority = 3;
	exports.unstable_Profiling = null;
	exports.unstable_UserBlockingPriority = 2;
	exports.unstable_cancelCallback = function(task) {
		task.callback = null;
	};
	exports.unstable_forceFrameRate = function(fps) {
		0 > fps || 125 < fps ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : frameInterval = 0 < fps ? Math.floor(1e3 / fps) : 5;
	};
	exports.unstable_getCurrentPriorityLevel = function() {
		return currentPriorityLevel;
	};
	exports.unstable_next = function(eventHandler) {
		switch (currentPriorityLevel) {
			case 1:
			case 2:
			case 3:
				var priorityLevel = 3;
				break;
			default: priorityLevel = currentPriorityLevel;
		}
		var previousPriorityLevel = currentPriorityLevel;
		currentPriorityLevel = priorityLevel;
		try {
			return eventHandler();
		} finally {
			currentPriorityLevel = previousPriorityLevel;
		}
	};
	exports.unstable_requestPaint = function() {
		needsPaint = !0;
	};
	exports.unstable_runWithPriority = function(priorityLevel, eventHandler) {
		switch (priorityLevel) {
			case 1:
			case 2:
			case 3:
			case 4:
			case 5: break;
			default: priorityLevel = 3;
		}
		var previousPriorityLevel = currentPriorityLevel;
		currentPriorityLevel = priorityLevel;
		try {
			return eventHandler();
		} finally {
			currentPriorityLevel = previousPriorityLevel;
		}
	};
	exports.unstable_scheduleCallback = function(priorityLevel, callback, options) {
		var currentTime = exports.unstable_now();
		"object" === typeof options && null !== options ? (options = options.delay, options = "number" === typeof options && 0 < options ? currentTime + options : currentTime) : options = currentTime;
		switch (priorityLevel) {
			case 1:
				var timeout = -1;
				break;
			case 2:
				timeout = 250;
				break;
			case 5:
				timeout = 1073741823;
				break;
			case 4:
				timeout = 1e4;
				break;
			default: timeout = 5e3;
		}
		timeout = options + timeout;
		priorityLevel = {
			id: taskIdCounter++,
			callback,
			priorityLevel,
			startTime: options,
			expirationTime: timeout,
			sortIndex: -1
		};
		options > currentTime ? (priorityLevel.sortIndex = options, push(timerQueue, priorityLevel), null === peek(taskQueue) && priorityLevel === peek(timerQueue) && (isHostTimeoutScheduled ? (localClearTimeout(taskTimeoutID), taskTimeoutID = -1) : isHostTimeoutScheduled = !0, requestHostTimeout(handleTimeout, options - currentTime))) : (priorityLevel.sortIndex = timeout, push(taskQueue, priorityLevel), isHostCallbackScheduled || isPerformingWork || (isHostCallbackScheduled = !0, isMessageLoopRunning || (isMessageLoopRunning = !0, schedulePerformWorkUntilDeadline())));
		return priorityLevel;
	};
	exports.unstable_shouldYield = shouldYieldToHost;
	exports.unstable_wrapCallback = function(callback) {
		var parentPriorityLevel = currentPriorityLevel;
		return function() {
			var previousPriorityLevel = currentPriorityLevel;
			currentPriorityLevel = parentPriorityLevel;
			try {
				return callback.apply(this, arguments);
			} finally {
				currentPriorityLevel = previousPriorityLevel;
			}
		};
	};
}));
//#endregion
//#region ../../../../2026-07-18/rk/node_modules/.pnpm/scheduler@0.27.0/node_modules/scheduler/index.js
var require_scheduler = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require_scheduler_production();
}));
//#endregion
//#region ../../../../2026-07-18/rk/node_modules/.pnpm/react-dom@19.2.6_react@19.2.6/node_modules/react-dom/cjs/react-dom-client.production.js
/**
* @license React
* react-dom-client.production.js
*
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var require_react_dom_client_production = /* @__PURE__ */ __commonJSMin(((exports) => {
	var Scheduler = require_scheduler(), React = require_react(), ReactDOM = require_react_dom();
	function formatProdErrorMessage(code) {
		var url = "https://react.dev/errors/" + code;
		if (1 < arguments.length) {
			url += "?args[]=" + encodeURIComponent(arguments[1]);
			for (var i = 2; i < arguments.length; i++) url += "&args[]=" + encodeURIComponent(arguments[i]);
		}
		return "Minified React error #" + code + "; visit " + url + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
	}
	function isValidContainer(node) {
		return !(!node || 1 !== node.nodeType && 9 !== node.nodeType && 11 !== node.nodeType);
	}
	function getNearestMountedFiber(fiber) {
		var node = fiber, nearestMounted = fiber;
		if (fiber.alternate) for (; node.return;) node = node.return;
		else {
			fiber = node;
			do
				node = fiber, 0 !== (node.flags & 4098) && (nearestMounted = node.return), fiber = node.return;
			while (fiber);
		}
		return 3 === node.tag ? nearestMounted : null;
	}
	function getSuspenseInstanceFromFiber(fiber) {
		if (13 === fiber.tag) {
			var suspenseState = fiber.memoizedState;
			null === suspenseState && (fiber = fiber.alternate, null !== fiber && (suspenseState = fiber.memoizedState));
			if (null !== suspenseState) return suspenseState.dehydrated;
		}
		return null;
	}
	function getActivityInstanceFromFiber(fiber) {
		if (31 === fiber.tag) {
			var activityState = fiber.memoizedState;
			null === activityState && (fiber = fiber.alternate, null !== fiber && (activityState = fiber.memoizedState));
			if (null !== activityState) return activityState.dehydrated;
		}
		return null;
	}
	function assertIsMounted(fiber) {
		if (getNearestMountedFiber(fiber) !== fiber) throw Error(formatProdErrorMessage(188));
	}
	function findCurrentFiberUsingSlowPath(fiber) {
		var alternate = fiber.alternate;
		if (!alternate) {
			alternate = getNearestMountedFiber(fiber);
			if (null === alternate) throw Error(formatProdErrorMessage(188));
			return alternate !== fiber ? null : fiber;
		}
		for (var a = fiber, b = alternate;;) {
			var parentA = a.return;
			if (null === parentA) break;
			var parentB = parentA.alternate;
			if (null === parentB) {
				b = parentA.return;
				if (null !== b) {
					a = b;
					continue;
				}
				break;
			}
			if (parentA.child === parentB.child) {
				for (parentB = parentA.child; parentB;) {
					if (parentB === a) return assertIsMounted(parentA), fiber;
					if (parentB === b) return assertIsMounted(parentA), alternate;
					parentB = parentB.sibling;
				}
				throw Error(formatProdErrorMessage(188));
			}
			if (a.return !== b.return) a = parentA, b = parentB;
			else {
				for (var didFindChild = !1, child$0 = parentA.child; child$0;) {
					if (child$0 === a) {
						didFindChild = !0;
						a = parentA;
						b = parentB;
						break;
					}
					if (child$0 === b) {
						didFindChild = !0;
						b = parentA;
						a = parentB;
						break;
					}
					child$0 = child$0.sibling;
				}
				if (!didFindChild) {
					for (child$0 = parentB.child; child$0;) {
						if (child$0 === a) {
							didFindChild = !0;
							a = parentB;
							b = parentA;
							break;
						}
						if (child$0 === b) {
							didFindChild = !0;
							b = parentB;
							a = parentA;
							break;
						}
						child$0 = child$0.sibling;
					}
					if (!didFindChild) throw Error(formatProdErrorMessage(189));
				}
			}
			if (a.alternate !== b) throw Error(formatProdErrorMessage(190));
		}
		if (3 !== a.tag) throw Error(formatProdErrorMessage(188));
		return a.stateNode.current === a ? fiber : alternate;
	}
	function findCurrentHostFiberImpl(node) {
		var tag = node.tag;
		if (5 === tag || 26 === tag || 27 === tag || 6 === tag) return node;
		for (node = node.child; null !== node;) {
			tag = findCurrentHostFiberImpl(node);
			if (null !== tag) return tag;
			node = node.sibling;
		}
		return null;
	}
	var assign = Object.assign, REACT_LEGACY_ELEMENT_TYPE = Symbol.for("react.element"), REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = Symbol.for("react.profiler"), REACT_CONSUMER_TYPE = Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = Symbol.for("react.memo"), REACT_LAZY_TYPE = Symbol.for("react.lazy");
	var REACT_ACTIVITY_TYPE = Symbol.for("react.activity");
	var REACT_MEMO_CACHE_SENTINEL = Symbol.for("react.memo_cache_sentinel");
	var MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
	function getIteratorFn(maybeIterable) {
		if (null === maybeIterable || "object" !== typeof maybeIterable) return null;
		maybeIterable = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable["@@iterator"];
		return "function" === typeof maybeIterable ? maybeIterable : null;
	}
	var REACT_CLIENT_REFERENCE = Symbol.for("react.client.reference");
	function getComponentNameFromType(type) {
		if (null == type) return null;
		if ("function" === typeof type) return type.$$typeof === REACT_CLIENT_REFERENCE ? null : type.displayName || type.name || null;
		if ("string" === typeof type) return type;
		switch (type) {
			case REACT_FRAGMENT_TYPE: return "Fragment";
			case REACT_PROFILER_TYPE: return "Profiler";
			case REACT_STRICT_MODE_TYPE: return "StrictMode";
			case REACT_SUSPENSE_TYPE: return "Suspense";
			case REACT_SUSPENSE_LIST_TYPE: return "SuspenseList";
			case REACT_ACTIVITY_TYPE: return "Activity";
		}
		if ("object" === typeof type) switch (type.$$typeof) {
			case REACT_PORTAL_TYPE: return "Portal";
			case REACT_CONTEXT_TYPE: return type.displayName || "Context";
			case REACT_CONSUMER_TYPE: return (type._context.displayName || "Context") + ".Consumer";
			case REACT_FORWARD_REF_TYPE:
				var innerType = type.render;
				type = type.displayName;
				type || (type = innerType.displayName || innerType.name || "", type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef");
				return type;
			case REACT_MEMO_TYPE: return innerType = type.displayName || null, null !== innerType ? innerType : getComponentNameFromType(type.type) || "Memo";
			case REACT_LAZY_TYPE:
				innerType = type._payload;
				type = type._init;
				try {
					return getComponentNameFromType(type(innerType));
				} catch (x) {}
		}
		return null;
	}
	var isArrayImpl = Array.isArray, ReactSharedInternals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, ReactDOMSharedInternals = ReactDOM.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, sharedNotPendingObject = {
		pending: !1,
		data: null,
		method: null,
		action: null
	}, valueStack = [], index = -1;
	function createCursor(defaultValue) {
		return { current: defaultValue };
	}
	function pop(cursor) {
		0 > index || (cursor.current = valueStack[index], valueStack[index] = null, index--);
	}
	function push(cursor, value) {
		index++;
		valueStack[index] = cursor.current;
		cursor.current = value;
	}
	var contextStackCursor = createCursor(null), contextFiberStackCursor = createCursor(null), rootInstanceStackCursor = createCursor(null), hostTransitionProviderCursor = createCursor(null);
	function pushHostContainer(fiber, nextRootInstance) {
		push(rootInstanceStackCursor, nextRootInstance);
		push(contextFiberStackCursor, fiber);
		push(contextStackCursor, null);
		switch (nextRootInstance.nodeType) {
			case 9:
			case 11:
				fiber = (fiber = nextRootInstance.documentElement) ? (fiber = fiber.namespaceURI) ? getOwnHostContext(fiber) : 0 : 0;
				break;
			default: if (fiber = nextRootInstance.tagName, nextRootInstance = nextRootInstance.namespaceURI) nextRootInstance = getOwnHostContext(nextRootInstance), fiber = getChildHostContextProd(nextRootInstance, fiber);
			else switch (fiber) {
				case "svg":
					fiber = 1;
					break;
				case "math":
					fiber = 2;
					break;
				default: fiber = 0;
			}
		}
		pop(contextStackCursor);
		push(contextStackCursor, fiber);
	}
	function popHostContainer() {
		pop(contextStackCursor);
		pop(contextFiberStackCursor);
		pop(rootInstanceStackCursor);
	}
	function pushHostContext(fiber) {
		null !== fiber.memoizedState && push(hostTransitionProviderCursor, fiber);
		var context = contextStackCursor.current;
		var JSCompiler_inline_result = getChildHostContextProd(context, fiber.type);
		context !== JSCompiler_inline_result && (push(contextFiberStackCursor, fiber), push(contextStackCursor, JSCompiler_inline_result));
	}
	function popHostContext(fiber) {
		contextFiberStackCursor.current === fiber && (pop(contextStackCursor), pop(contextFiberStackCursor));
		hostTransitionProviderCursor.current === fiber && (pop(hostTransitionProviderCursor), HostTransitionContext._currentValue = sharedNotPendingObject);
	}
	var prefix, suffix;
	function describeBuiltInComponentFrame(name) {
		if (void 0 === prefix) try {
			throw Error();
		} catch (x) {
			var match = x.stack.trim().match(/\n( *(at )?)/);
			prefix = match && match[1] || "";
			suffix = -1 < x.stack.indexOf("\n    at") ? " (<anonymous>)" : -1 < x.stack.indexOf("@") ? "@unknown:0:0" : "";
		}
		return "\n" + prefix + name + suffix;
	}
	var reentry = !1;
	function describeNativeComponentFrame(fn, construct) {
		if (!fn || reentry) return "";
		reentry = !0;
		var previousPrepareStackTrace = Error.prepareStackTrace;
		Error.prepareStackTrace = void 0;
		try {
			var RunInRootFrame = { DetermineComponentFrameRoot: function() {
				try {
					if (construct) {
						var Fake = function() {
							throw Error();
						};
						Object.defineProperty(Fake.prototype, "props", { set: function() {
							throw Error();
						} });
						if ("object" === typeof Reflect && Reflect.construct) {
							try {
								Reflect.construct(Fake, []);
							} catch (x) {
								var control = x;
							}
							Reflect.construct(fn, [], Fake);
						} else {
							try {
								Fake.call();
							} catch (x$1) {
								control = x$1;
							}
							fn.call(Fake.prototype);
						}
					} else {
						try {
							throw Error();
						} catch (x$2) {
							control = x$2;
						}
						(Fake = fn()) && "function" === typeof Fake.catch && Fake.catch(function() {});
					}
				} catch (sample) {
					if (sample && control && "string" === typeof sample.stack) return [sample.stack, control.stack];
				}
				return [null, null];
			} };
			RunInRootFrame.DetermineComponentFrameRoot.displayName = "DetermineComponentFrameRoot";
			var namePropDescriptor = Object.getOwnPropertyDescriptor(RunInRootFrame.DetermineComponentFrameRoot, "name");
			namePropDescriptor && namePropDescriptor.configurable && Object.defineProperty(RunInRootFrame.DetermineComponentFrameRoot, "name", { value: "DetermineComponentFrameRoot" });
			var _RunInRootFrame$Deter = RunInRootFrame.DetermineComponentFrameRoot(), sampleStack = _RunInRootFrame$Deter[0], controlStack = _RunInRootFrame$Deter[1];
			if (sampleStack && controlStack) {
				var sampleLines = sampleStack.split("\n"), controlLines = controlStack.split("\n");
				for (namePropDescriptor = RunInRootFrame = 0; RunInRootFrame < sampleLines.length && !sampleLines[RunInRootFrame].includes("DetermineComponentFrameRoot");) RunInRootFrame++;
				for (; namePropDescriptor < controlLines.length && !controlLines[namePropDescriptor].includes("DetermineComponentFrameRoot");) namePropDescriptor++;
				if (RunInRootFrame === sampleLines.length || namePropDescriptor === controlLines.length) for (RunInRootFrame = sampleLines.length - 1, namePropDescriptor = controlLines.length - 1; 1 <= RunInRootFrame && 0 <= namePropDescriptor && sampleLines[RunInRootFrame] !== controlLines[namePropDescriptor];) namePropDescriptor--;
				for (; 1 <= RunInRootFrame && 0 <= namePropDescriptor; RunInRootFrame--, namePropDescriptor--) if (sampleLines[RunInRootFrame] !== controlLines[namePropDescriptor]) {
					if (1 !== RunInRootFrame || 1 !== namePropDescriptor) do
						if (RunInRootFrame--, namePropDescriptor--, 0 > namePropDescriptor || sampleLines[RunInRootFrame] !== controlLines[namePropDescriptor]) {
							var frame = "\n" + sampleLines[RunInRootFrame].replace(" at new ", " at ");
							fn.displayName && frame.includes("<anonymous>") && (frame = frame.replace("<anonymous>", fn.displayName));
							return frame;
						}
					while (1 <= RunInRootFrame && 0 <= namePropDescriptor);
					break;
				}
			}
		} finally {
			reentry = !1, Error.prepareStackTrace = previousPrepareStackTrace;
		}
		return (previousPrepareStackTrace = fn ? fn.displayName || fn.name : "") ? describeBuiltInComponentFrame(previousPrepareStackTrace) : "";
	}
	function describeFiber(fiber, childFiber) {
		switch (fiber.tag) {
			case 26:
			case 27:
			case 5: return describeBuiltInComponentFrame(fiber.type);
			case 16: return describeBuiltInComponentFrame("Lazy");
			case 13: return fiber.child !== childFiber && null !== childFiber ? describeBuiltInComponentFrame("Suspense Fallback") : describeBuiltInComponentFrame("Suspense");
			case 19: return describeBuiltInComponentFrame("SuspenseList");
			case 0:
			case 15: return describeNativeComponentFrame(fiber.type, !1);
			case 11: return describeNativeComponentFrame(fiber.type.render, !1);
			case 1: return describeNativeComponentFrame(fiber.type, !0);
			case 31: return describeBuiltInComponentFrame("Activity");
			default: return "";
		}
	}
	function getStackByFiberInDevAndProd(workInProgress) {
		try {
			var info = "", previous = null;
			do
				info += describeFiber(workInProgress, previous), previous = workInProgress, workInProgress = workInProgress.return;
			while (workInProgress);
			return info;
		} catch (x) {
			return "\nError generating stack: " + x.message + "\n" + x.stack;
		}
	}
	var hasOwnProperty = Object.prototype.hasOwnProperty, scheduleCallback$3 = Scheduler.unstable_scheduleCallback, cancelCallback$1 = Scheduler.unstable_cancelCallback, shouldYield = Scheduler.unstable_shouldYield, requestPaint = Scheduler.unstable_requestPaint, now = Scheduler.unstable_now, getCurrentPriorityLevel = Scheduler.unstable_getCurrentPriorityLevel, ImmediatePriority = Scheduler.unstable_ImmediatePriority, UserBlockingPriority = Scheduler.unstable_UserBlockingPriority, NormalPriority$1 = Scheduler.unstable_NormalPriority, LowPriority = Scheduler.unstable_LowPriority, IdlePriority = Scheduler.unstable_IdlePriority, log$1 = Scheduler.log, unstable_setDisableYieldValue = Scheduler.unstable_setDisableYieldValue, rendererID = null, injectedHook = null;
	function setIsStrictModeForDevtools(newIsStrictMode) {
		"function" === typeof log$1 && unstable_setDisableYieldValue(newIsStrictMode);
		if (injectedHook && "function" === typeof injectedHook.setStrictMode) try {
			injectedHook.setStrictMode(rendererID, newIsStrictMode);
		} catch (err) {}
	}
	var clz32 = Math.clz32 ? Math.clz32 : clz32Fallback, log = Math.log, LN2 = Math.LN2;
	function clz32Fallback(x) {
		x >>>= 0;
		return 0 === x ? 32 : 31 - (log(x) / LN2 | 0) | 0;
	}
	var nextTransitionUpdateLane = 256, nextTransitionDeferredLane = 262144, nextRetryLane = 4194304;
	function getHighestPriorityLanes(lanes) {
		var pendingSyncLanes = lanes & 42;
		if (0 !== pendingSyncLanes) return pendingSyncLanes;
		switch (lanes & -lanes) {
			case 1: return 1;
			case 2: return 2;
			case 4: return 4;
			case 8: return 8;
			case 16: return 16;
			case 32: return 32;
			case 64: return 64;
			case 128: return 128;
			case 256:
			case 512:
			case 1024:
			case 2048:
			case 4096:
			case 8192:
			case 16384:
			case 32768:
			case 65536:
			case 131072: return lanes & 261888;
			case 262144:
			case 524288:
			case 1048576:
			case 2097152: return lanes & 3932160;
			case 4194304:
			case 8388608:
			case 16777216:
			case 33554432: return lanes & 62914560;
			case 67108864: return 67108864;
			case 134217728: return 134217728;
			case 268435456: return 268435456;
			case 536870912: return 536870912;
			case 1073741824: return 0;
			default: return lanes;
		}
	}
	function getNextLanes(root, wipLanes, rootHasPendingCommit) {
		var pendingLanes = root.pendingLanes;
		if (0 === pendingLanes) return 0;
		var nextLanes = 0, suspendedLanes = root.suspendedLanes, pingedLanes = root.pingedLanes;
		root = root.warmLanes;
		var nonIdlePendingLanes = pendingLanes & 134217727;
		0 !== nonIdlePendingLanes ? (pendingLanes = nonIdlePendingLanes & ~suspendedLanes, 0 !== pendingLanes ? nextLanes = getHighestPriorityLanes(pendingLanes) : (pingedLanes &= nonIdlePendingLanes, 0 !== pingedLanes ? nextLanes = getHighestPriorityLanes(pingedLanes) : rootHasPendingCommit || (rootHasPendingCommit = nonIdlePendingLanes & ~root, 0 !== rootHasPendingCommit && (nextLanes = getHighestPriorityLanes(rootHasPendingCommit))))) : (nonIdlePendingLanes = pendingLanes & ~suspendedLanes, 0 !== nonIdlePendingLanes ? nextLanes = getHighestPriorityLanes(nonIdlePendingLanes) : 0 !== pingedLanes ? nextLanes = getHighestPriorityLanes(pingedLanes) : rootHasPendingCommit || (rootHasPendingCommit = pendingLanes & ~root, 0 !== rootHasPendingCommit && (nextLanes = getHighestPriorityLanes(rootHasPendingCommit))));
		return 0 === nextLanes ? 0 : 0 !== wipLanes && wipLanes !== nextLanes && 0 === (wipLanes & suspendedLanes) && (suspendedLanes = nextLanes & -nextLanes, rootHasPendingCommit = wipLanes & -wipLanes, suspendedLanes >= rootHasPendingCommit || 32 === suspendedLanes && 0 !== (rootHasPendingCommit & 4194048)) ? wipLanes : nextLanes;
	}
	function checkIfRootIsPrerendering(root, renderLanes) {
		return 0 === (root.pendingLanes & ~(root.suspendedLanes & ~root.pingedLanes) & renderLanes);
	}
	function computeExpirationTime(lane, currentTime) {
		switch (lane) {
			case 1:
			case 2:
			case 4:
			case 8:
			case 64: return currentTime + 250;
			case 16:
			case 32:
			case 128:
			case 256:
			case 512:
			case 1024:
			case 2048:
			case 4096:
			case 8192:
			case 16384:
			case 32768:
			case 65536:
			case 131072:
			case 262144:
			case 524288:
			case 1048576:
			case 2097152: return currentTime + 5e3;
			case 4194304:
			case 8388608:
			case 16777216:
			case 33554432: return -1;
			case 67108864:
			case 134217728:
			case 268435456:
			case 536870912:
			case 1073741824: return -1;
			default: return -1;
		}
	}
	function claimNextRetryLane() {
		var lane = nextRetryLane;
		nextRetryLane <<= 1;
		0 === (nextRetryLane & 62914560) && (nextRetryLane = 4194304);
		return lane;
	}
	function createLaneMap(initial) {
		for (var laneMap = [], i = 0; 31 > i; i++) laneMap.push(initial);
		return laneMap;
	}
	function markRootUpdated$1(root, updateLane) {
		root.pendingLanes |= updateLane;
		268435456 !== updateLane && (root.suspendedLanes = 0, root.pingedLanes = 0, root.warmLanes = 0);
	}
	function markRootFinished(root, finishedLanes, remainingLanes, spawnedLane, updatedLanes, suspendedRetryLanes) {
		var previouslyPendingLanes = root.pendingLanes;
		root.pendingLanes = remainingLanes;
		root.suspendedLanes = 0;
		root.pingedLanes = 0;
		root.warmLanes = 0;
		root.expiredLanes &= remainingLanes;
		root.entangledLanes &= remainingLanes;
		root.errorRecoveryDisabledLanes &= remainingLanes;
		root.shellSuspendCounter = 0;
		var entanglements = root.entanglements, expirationTimes = root.expirationTimes, hiddenUpdates = root.hiddenUpdates;
		for (remainingLanes = previouslyPendingLanes & ~remainingLanes; 0 < remainingLanes;) {
			var index$7 = 31 - clz32(remainingLanes), lane = 1 << index$7;
			entanglements[index$7] = 0;
			expirationTimes[index$7] = -1;
			var hiddenUpdatesForLane = hiddenUpdates[index$7];
			if (null !== hiddenUpdatesForLane) for (hiddenUpdates[index$7] = null, index$7 = 0; index$7 < hiddenUpdatesForLane.length; index$7++) {
				var update = hiddenUpdatesForLane[index$7];
				null !== update && (update.lane &= -536870913);
			}
			remainingLanes &= ~lane;
		}
		0 !== spawnedLane && markSpawnedDeferredLane(root, spawnedLane, 0);
		0 !== suspendedRetryLanes && 0 === updatedLanes && 0 !== root.tag && (root.suspendedLanes |= suspendedRetryLanes & ~(previouslyPendingLanes & ~finishedLanes));
	}
	function markSpawnedDeferredLane(root, spawnedLane, entangledLanes) {
		root.pendingLanes |= spawnedLane;
		root.suspendedLanes &= ~spawnedLane;
		var spawnedLaneIndex = 31 - clz32(spawnedLane);
		root.entangledLanes |= spawnedLane;
		root.entanglements[spawnedLaneIndex] = root.entanglements[spawnedLaneIndex] | 1073741824 | entangledLanes & 261930;
	}
	function markRootEntangled(root, entangledLanes) {
		var rootEntangledLanes = root.entangledLanes |= entangledLanes;
		for (root = root.entanglements; rootEntangledLanes;) {
			var index$8 = 31 - clz32(rootEntangledLanes), lane = 1 << index$8;
			lane & entangledLanes | root[index$8] & entangledLanes && (root[index$8] |= entangledLanes);
			rootEntangledLanes &= ~lane;
		}
	}
	function getBumpedLaneForHydration(root, renderLanes) {
		var renderLane = renderLanes & -renderLanes;
		renderLane = 0 !== (renderLane & 42) ? 1 : getBumpedLaneForHydrationByLane(renderLane);
		return 0 !== (renderLane & (root.suspendedLanes | renderLanes)) ? 0 : renderLane;
	}
	function getBumpedLaneForHydrationByLane(lane) {
		switch (lane) {
			case 2:
				lane = 1;
				break;
			case 8:
				lane = 4;
				break;
			case 32:
				lane = 16;
				break;
			case 256:
			case 512:
			case 1024:
			case 2048:
			case 4096:
			case 8192:
			case 16384:
			case 32768:
			case 65536:
			case 131072:
			case 262144:
			case 524288:
			case 1048576:
			case 2097152:
			case 4194304:
			case 8388608:
			case 16777216:
			case 33554432:
				lane = 128;
				break;
			case 268435456:
				lane = 134217728;
				break;
			default: lane = 0;
		}
		return lane;
	}
	function lanesToEventPriority(lanes) {
		lanes &= -lanes;
		return 2 < lanes ? 8 < lanes ? 0 !== (lanes & 134217727) ? 32 : 268435456 : 8 : 2;
	}
	function resolveUpdatePriority() {
		var updatePriority = ReactDOMSharedInternals.p;
		if (0 !== updatePriority) return updatePriority;
		updatePriority = window.event;
		return void 0 === updatePriority ? 32 : getEventPriority(updatePriority.type);
	}
	function runWithPriority(priority, fn) {
		var previousPriority = ReactDOMSharedInternals.p;
		try {
			return ReactDOMSharedInternals.p = priority, fn();
		} finally {
			ReactDOMSharedInternals.p = previousPriority;
		}
	}
	var randomKey = Math.random().toString(36).slice(2), internalInstanceKey = "__reactFiber$" + randomKey, internalPropsKey = "__reactProps$" + randomKey, internalContainerInstanceKey = "__reactContainer$" + randomKey, internalEventHandlersKey = "__reactEvents$" + randomKey, internalEventHandlerListenersKey = "__reactListeners$" + randomKey, internalEventHandlesSetKey = "__reactHandles$" + randomKey, internalRootNodeResourcesKey = "__reactResources$" + randomKey, internalHoistableMarker = "__reactMarker$" + randomKey;
	function detachDeletedInstance(node) {
		delete node[internalInstanceKey];
		delete node[internalPropsKey];
		delete node[internalEventHandlersKey];
		delete node[internalEventHandlerListenersKey];
		delete node[internalEventHandlesSetKey];
	}
	function getClosestInstanceFromNode(targetNode) {
		var targetInst = targetNode[internalInstanceKey];
		if (targetInst) return targetInst;
		for (var parentNode = targetNode.parentNode; parentNode;) {
			if (targetInst = parentNode[internalContainerInstanceKey] || parentNode[internalInstanceKey]) {
				parentNode = targetInst.alternate;
				if (null !== targetInst.child || null !== parentNode && null !== parentNode.child) for (targetNode = getParentHydrationBoundary(targetNode); null !== targetNode;) {
					if (parentNode = targetNode[internalInstanceKey]) return parentNode;
					targetNode = getParentHydrationBoundary(targetNode);
				}
				return targetInst;
			}
			targetNode = parentNode;
			parentNode = targetNode.parentNode;
		}
		return null;
	}
	function getInstanceFromNode(node) {
		if (node = node[internalInstanceKey] || node[internalContainerInstanceKey]) {
			var tag = node.tag;
			if (5 === tag || 6 === tag || 13 === tag || 31 === tag || 26 === tag || 27 === tag || 3 === tag) return node;
		}
		return null;
	}
	function getNodeFromInstance(inst) {
		var tag = inst.tag;
		if (5 === tag || 26 === tag || 27 === tag || 6 === tag) return inst.stateNode;
		throw Error(formatProdErrorMessage(33));
	}
	function getResourcesFromRoot(root) {
		var resources = root[internalRootNodeResourcesKey];
		resources || (resources = root[internalRootNodeResourcesKey] = {
			hoistableStyles: /* @__PURE__ */ new Map(),
			hoistableScripts: /* @__PURE__ */ new Map()
		});
		return resources;
	}
	function markNodeAsHoistable(node) {
		node[internalHoistableMarker] = !0;
	}
	var allNativeEvents = /* @__PURE__ */ new Set(), registrationNameDependencies = {};
	function registerTwoPhaseEvent(registrationName, dependencies) {
		registerDirectEvent(registrationName, dependencies);
		registerDirectEvent(registrationName + "Capture", dependencies);
	}
	function registerDirectEvent(registrationName, dependencies) {
		registrationNameDependencies[registrationName] = dependencies;
		for (registrationName = 0; registrationName < dependencies.length; registrationName++) allNativeEvents.add(dependencies[registrationName]);
	}
	var VALID_ATTRIBUTE_NAME_REGEX = RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"), illegalAttributeNameCache = {}, validatedAttributeNameCache = {};
	function isAttributeNameSafe(attributeName) {
		if (hasOwnProperty.call(validatedAttributeNameCache, attributeName)) return !0;
		if (hasOwnProperty.call(illegalAttributeNameCache, attributeName)) return !1;
		if (VALID_ATTRIBUTE_NAME_REGEX.test(attributeName)) return validatedAttributeNameCache[attributeName] = !0;
		illegalAttributeNameCache[attributeName] = !0;
		return !1;
	}
	function setValueForAttribute(node, name, value) {
		if (isAttributeNameSafe(name)) if (null === value) node.removeAttribute(name);
		else {
			switch (typeof value) {
				case "undefined":
				case "function":
				case "symbol":
					node.removeAttribute(name);
					return;
				case "boolean":
					var prefix$10 = name.toLowerCase().slice(0, 5);
					if ("data-" !== prefix$10 && "aria-" !== prefix$10) {
						node.removeAttribute(name);
						return;
					}
			}
			node.setAttribute(name, "" + value);
		}
	}
	function setValueForKnownAttribute(node, name, value) {
		if (null === value) node.removeAttribute(name);
		else {
			switch (typeof value) {
				case "undefined":
				case "function":
				case "symbol":
				case "boolean":
					node.removeAttribute(name);
					return;
			}
			node.setAttribute(name, "" + value);
		}
	}
	function setValueForNamespacedAttribute(node, namespace, name, value) {
		if (null === value) node.removeAttribute(name);
		else {
			switch (typeof value) {
				case "undefined":
				case "function":
				case "symbol":
				case "boolean":
					node.removeAttribute(name);
					return;
			}
			node.setAttributeNS(namespace, name, "" + value);
		}
	}
	function getToStringValue(value) {
		switch (typeof value) {
			case "bigint":
			case "boolean":
			case "number":
			case "string":
			case "undefined": return value;
			case "object": return value;
			default: return "";
		}
	}
	function isCheckable(elem) {
		var type = elem.type;
		return (elem = elem.nodeName) && "input" === elem.toLowerCase() && ("checkbox" === type || "radio" === type);
	}
	function trackValueOnNode(node, valueField, currentValue) {
		var descriptor = Object.getOwnPropertyDescriptor(node.constructor.prototype, valueField);
		if (!node.hasOwnProperty(valueField) && "undefined" !== typeof descriptor && "function" === typeof descriptor.get && "function" === typeof descriptor.set) {
			var get = descriptor.get, set = descriptor.set;
			Object.defineProperty(node, valueField, {
				configurable: !0,
				get: function() {
					return get.call(this);
				},
				set: function(value) {
					currentValue = "" + value;
					set.call(this, value);
				}
			});
			Object.defineProperty(node, valueField, { enumerable: descriptor.enumerable });
			return {
				getValue: function() {
					return currentValue;
				},
				setValue: function(value) {
					currentValue = "" + value;
				},
				stopTracking: function() {
					node._valueTracker = null;
					delete node[valueField];
				}
			};
		}
	}
	function track(node) {
		if (!node._valueTracker) {
			var valueField = isCheckable(node) ? "checked" : "value";
			node._valueTracker = trackValueOnNode(node, valueField, "" + node[valueField]);
		}
	}
	function updateValueIfChanged(node) {
		if (!node) return !1;
		var tracker = node._valueTracker;
		if (!tracker) return !0;
		var lastValue = tracker.getValue();
		var value = "";
		node && (value = isCheckable(node) ? node.checked ? "true" : "false" : node.value);
		node = value;
		return node !== lastValue ? (tracker.setValue(node), !0) : !1;
	}
	function getActiveElement(doc) {
		doc = doc || ("undefined" !== typeof document ? document : void 0);
		if ("undefined" === typeof doc) return null;
		try {
			return doc.activeElement || doc.body;
		} catch (e) {
			return doc.body;
		}
	}
	var escapeSelectorAttributeValueInsideDoubleQuotesRegex = /[\n"\\]/g;
	function escapeSelectorAttributeValueInsideDoubleQuotes(value) {
		return value.replace(escapeSelectorAttributeValueInsideDoubleQuotesRegex, function(ch) {
			return "\\" + ch.charCodeAt(0).toString(16) + " ";
		});
	}
	function updateInput(element, value, defaultValue, lastDefaultValue, checked, defaultChecked, type, name) {
		element.name = "";
		null != type && "function" !== typeof type && "symbol" !== typeof type && "boolean" !== typeof type ? element.type = type : element.removeAttribute("type");
		if (null != value) if ("number" === type) {
			if (0 === value && "" === element.value || element.value != value) element.value = "" + getToStringValue(value);
		} else element.value !== "" + getToStringValue(value) && (element.value = "" + getToStringValue(value));
		else "submit" !== type && "reset" !== type || element.removeAttribute("value");
		null != value ? setDefaultValue(element, type, getToStringValue(value)) : null != defaultValue ? setDefaultValue(element, type, getToStringValue(defaultValue)) : null != lastDefaultValue && element.removeAttribute("value");
		null == checked && null != defaultChecked && (element.defaultChecked = !!defaultChecked);
		null != checked && (element.checked = checked && "function" !== typeof checked && "symbol" !== typeof checked);
		null != name && "function" !== typeof name && "symbol" !== typeof name && "boolean" !== typeof name ? element.name = "" + getToStringValue(name) : element.removeAttribute("name");
	}
	function initInput(element, value, defaultValue, checked, defaultChecked, type, name, isHydrating) {
		null != type && "function" !== typeof type && "symbol" !== typeof type && "boolean" !== typeof type && (element.type = type);
		if (null != value || null != defaultValue) {
			if (!("submit" !== type && "reset" !== type || void 0 !== value && null !== value)) {
				track(element);
				return;
			}
			defaultValue = null != defaultValue ? "" + getToStringValue(defaultValue) : "";
			value = null != value ? "" + getToStringValue(value) : defaultValue;
			isHydrating || value === element.value || (element.value = value);
			element.defaultValue = value;
		}
		checked = null != checked ? checked : defaultChecked;
		checked = "function" !== typeof checked && "symbol" !== typeof checked && !!checked;
		element.checked = isHydrating ? element.checked : !!checked;
		element.defaultChecked = !!checked;
		null != name && "function" !== typeof name && "symbol" !== typeof name && "boolean" !== typeof name && (element.name = name);
		track(element);
	}
	function setDefaultValue(node, type, value) {
		"number" === type && getActiveElement(node.ownerDocument) === node || node.defaultValue === "" + value || (node.defaultValue = "" + value);
	}
	function updateOptions(node, multiple, propValue, setDefaultSelected) {
		node = node.options;
		if (multiple) {
			multiple = {};
			for (var i = 0; i < propValue.length; i++) multiple["$" + propValue[i]] = !0;
			for (propValue = 0; propValue < node.length; propValue++) i = multiple.hasOwnProperty("$" + node[propValue].value), node[propValue].selected !== i && (node[propValue].selected = i), i && setDefaultSelected && (node[propValue].defaultSelected = !0);
		} else {
			propValue = "" + getToStringValue(propValue);
			multiple = null;
			for (i = 0; i < node.length; i++) {
				if (node[i].value === propValue) {
					node[i].selected = !0;
					setDefaultSelected && (node[i].defaultSelected = !0);
					return;
				}
				null !== multiple || node[i].disabled || (multiple = node[i]);
			}
			null !== multiple && (multiple.selected = !0);
		}
	}
	function updateTextarea(element, value, defaultValue) {
		if (null != value && (value = "" + getToStringValue(value), value !== element.value && (element.value = value), null == defaultValue)) {
			element.defaultValue !== value && (element.defaultValue = value);
			return;
		}
		element.defaultValue = null != defaultValue ? "" + getToStringValue(defaultValue) : "";
	}
	function initTextarea(element, value, defaultValue, children) {
		if (null == value) {
			if (null != children) {
				if (null != defaultValue) throw Error(formatProdErrorMessage(92));
				if (isArrayImpl(children)) {
					if (1 < children.length) throw Error(formatProdErrorMessage(93));
					children = children[0];
				}
				defaultValue = children;
			}
			defaultValue ??= "";
			value = defaultValue;
		}
		defaultValue = getToStringValue(value);
		element.defaultValue = defaultValue;
		children = element.textContent;
		children === defaultValue && "" !== children && null !== children && (element.value = children);
		track(element);
	}
	function setTextContent(node, text) {
		if (text) {
			var firstChild = node.firstChild;
			if (firstChild && firstChild === node.lastChild && 3 === firstChild.nodeType) {
				firstChild.nodeValue = text;
				return;
			}
		}
		node.textContent = text;
	}
	var unitlessNumbers = new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));
	function setValueForStyle(style, styleName, value) {
		var isCustomProperty = 0 === styleName.indexOf("--");
		null == value || "boolean" === typeof value || "" === value ? isCustomProperty ? style.setProperty(styleName, "") : "float" === styleName ? style.cssFloat = "" : style[styleName] = "" : isCustomProperty ? style.setProperty(styleName, value) : "number" !== typeof value || 0 === value || unitlessNumbers.has(styleName) ? "float" === styleName ? style.cssFloat = value : style[styleName] = ("" + value).trim() : style[styleName] = value + "px";
	}
	function setValueForStyles(node, styles, prevStyles) {
		if (null != styles && "object" !== typeof styles) throw Error(formatProdErrorMessage(62));
		node = node.style;
		if (null != prevStyles) {
			for (var styleName in prevStyles) !prevStyles.hasOwnProperty(styleName) || null != styles && styles.hasOwnProperty(styleName) || (0 === styleName.indexOf("--") ? node.setProperty(styleName, "") : "float" === styleName ? node.cssFloat = "" : node[styleName] = "");
			for (var styleName$16 in styles) styleName = styles[styleName$16], styles.hasOwnProperty(styleName$16) && prevStyles[styleName$16] !== styleName && setValueForStyle(node, styleName$16, styleName);
		} else for (var styleName$17 in styles) styles.hasOwnProperty(styleName$17) && setValueForStyle(node, styleName$17, styles[styleName$17]);
	}
	function isCustomElement(tagName) {
		if (-1 === tagName.indexOf("-")) return !1;
		switch (tagName) {
			case "annotation-xml":
			case "color-profile":
			case "font-face":
			case "font-face-src":
			case "font-face-uri":
			case "font-face-format":
			case "font-face-name":
			case "missing-glyph": return !1;
			default: return !0;
		}
	}
	var aliases = new Map([
		["acceptCharset", "accept-charset"],
		["htmlFor", "for"],
		["httpEquiv", "http-equiv"],
		["crossOrigin", "crossorigin"],
		["accentHeight", "accent-height"],
		["alignmentBaseline", "alignment-baseline"],
		["arabicForm", "arabic-form"],
		["baselineShift", "baseline-shift"],
		["capHeight", "cap-height"],
		["clipPath", "clip-path"],
		["clipRule", "clip-rule"],
		["colorInterpolation", "color-interpolation"],
		["colorInterpolationFilters", "color-interpolation-filters"],
		["colorProfile", "color-profile"],
		["colorRendering", "color-rendering"],
		["dominantBaseline", "dominant-baseline"],
		["enableBackground", "enable-background"],
		["fillOpacity", "fill-opacity"],
		["fillRule", "fill-rule"],
		["floodColor", "flood-color"],
		["floodOpacity", "flood-opacity"],
		["fontFamily", "font-family"],
		["fontSize", "font-size"],
		["fontSizeAdjust", "font-size-adjust"],
		["fontStretch", "font-stretch"],
		["fontStyle", "font-style"],
		["fontVariant", "font-variant"],
		["fontWeight", "font-weight"],
		["glyphName", "glyph-name"],
		["glyphOrientationHorizontal", "glyph-orientation-horizontal"],
		["glyphOrientationVertical", "glyph-orientation-vertical"],
		["horizAdvX", "horiz-adv-x"],
		["horizOriginX", "horiz-origin-x"],
		["imageRendering", "image-rendering"],
		["letterSpacing", "letter-spacing"],
		["lightingColor", "lighting-color"],
		["markerEnd", "marker-end"],
		["markerMid", "marker-mid"],
		["markerStart", "marker-start"],
		["overlinePosition", "overline-position"],
		["overlineThickness", "overline-thickness"],
		["paintOrder", "paint-order"],
		["panose-1", "panose-1"],
		["pointerEvents", "pointer-events"],
		["renderingIntent", "rendering-intent"],
		["shapeRendering", "shape-rendering"],
		["stopColor", "stop-color"],
		["stopOpacity", "stop-opacity"],
		["strikethroughPosition", "strikethrough-position"],
		["strikethroughThickness", "strikethrough-thickness"],
		["strokeDasharray", "stroke-dasharray"],
		["strokeDashoffset", "stroke-dashoffset"],
		["strokeLinecap", "stroke-linecap"],
		["strokeLinejoin", "stroke-linejoin"],
		["strokeMiterlimit", "stroke-miterlimit"],
		["strokeOpacity", "stroke-opacity"],
		["strokeWidth", "stroke-width"],
		["textAnchor", "text-anchor"],
		["textDecoration", "text-decoration"],
		["textRendering", "text-rendering"],
		["transformOrigin", "transform-origin"],
		["underlinePosition", "underline-position"],
		["underlineThickness", "underline-thickness"],
		["unicodeBidi", "unicode-bidi"],
		["unicodeRange", "unicode-range"],
		["unitsPerEm", "units-per-em"],
		["vAlphabetic", "v-alphabetic"],
		["vHanging", "v-hanging"],
		["vIdeographic", "v-ideographic"],
		["vMathematical", "v-mathematical"],
		["vectorEffect", "vector-effect"],
		["vertAdvY", "vert-adv-y"],
		["vertOriginX", "vert-origin-x"],
		["vertOriginY", "vert-origin-y"],
		["wordSpacing", "word-spacing"],
		["writingMode", "writing-mode"],
		["xmlnsXlink", "xmlns:xlink"],
		["xHeight", "x-height"]
	]), isJavaScriptProtocol = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
	function sanitizeURL(url) {
		return isJavaScriptProtocol.test("" + url) ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')" : url;
	}
	function noop$1() {}
	var currentReplayingEvent = null;
	function getEventTarget(nativeEvent) {
		nativeEvent = nativeEvent.target || nativeEvent.srcElement || window;
		nativeEvent.correspondingUseElement && (nativeEvent = nativeEvent.correspondingUseElement);
		return 3 === nativeEvent.nodeType ? nativeEvent.parentNode : nativeEvent;
	}
	var restoreTarget = null, restoreQueue = null;
	function restoreStateOfTarget(target) {
		var internalInstance = getInstanceFromNode(target);
		if (internalInstance && (target = internalInstance.stateNode)) {
			var props = target[internalPropsKey] || null;
			a: switch (target = internalInstance.stateNode, internalInstance.type) {
				case "input":
					updateInput(target, props.value, props.defaultValue, props.defaultValue, props.checked, props.defaultChecked, props.type, props.name);
					internalInstance = props.name;
					if ("radio" === props.type && null != internalInstance) {
						for (props = target; props.parentNode;) props = props.parentNode;
						props = props.querySelectorAll("input[name=\"" + escapeSelectorAttributeValueInsideDoubleQuotes("" + internalInstance) + "\"][type=\"radio\"]");
						for (internalInstance = 0; internalInstance < props.length; internalInstance++) {
							var otherNode = props[internalInstance];
							if (otherNode !== target && otherNode.form === target.form) {
								var otherProps = otherNode[internalPropsKey] || null;
								if (!otherProps) throw Error(formatProdErrorMessage(90));
								updateInput(otherNode, otherProps.value, otherProps.defaultValue, otherProps.defaultValue, otherProps.checked, otherProps.defaultChecked, otherProps.type, otherProps.name);
							}
						}
						for (internalInstance = 0; internalInstance < props.length; internalInstance++) otherNode = props[internalInstance], otherNode.form === target.form && updateValueIfChanged(otherNode);
					}
					break a;
				case "textarea":
					updateTextarea(target, props.value, props.defaultValue);
					break a;
				case "select": internalInstance = props.value, null != internalInstance && updateOptions(target, !!props.multiple, internalInstance, !1);
			}
		}
	}
	var isInsideEventHandler = !1;
	function batchedUpdates$1(fn, a, b) {
		if (isInsideEventHandler) return fn(a, b);
		isInsideEventHandler = !0;
		try {
			return fn(a);
		} finally {
			if (isInsideEventHandler = !1, null !== restoreTarget || null !== restoreQueue) {
				if (flushSyncWork$1(), restoreTarget && (a = restoreTarget, fn = restoreQueue, restoreQueue = restoreTarget = null, restoreStateOfTarget(a), fn)) for (a = 0; a < fn.length; a++) restoreStateOfTarget(fn[a]);
			}
		}
	}
	function getListener(inst, registrationName) {
		var stateNode = inst.stateNode;
		if (null === stateNode) return null;
		var props = stateNode[internalPropsKey] || null;
		if (null === props) return null;
		stateNode = props[registrationName];
		a: switch (registrationName) {
			case "onClick":
			case "onClickCapture":
			case "onDoubleClick":
			case "onDoubleClickCapture":
			case "onMouseDown":
			case "onMouseDownCapture":
			case "onMouseMove":
			case "onMouseMoveCapture":
			case "onMouseUp":
			case "onMouseUpCapture":
			case "onMouseEnter":
				(props = !props.disabled) || (inst = inst.type, props = !("button" === inst || "input" === inst || "select" === inst || "textarea" === inst));
				inst = !props;
				break a;
			default: inst = !1;
		}
		if (inst) return null;
		if (stateNode && "function" !== typeof stateNode) throw Error(formatProdErrorMessage(231, registrationName, typeof stateNode));
		return stateNode;
	}
	var canUseDOM = !("undefined" === typeof window || "undefined" === typeof window.document || "undefined" === typeof window.document.createElement), passiveBrowserEventsSupported = !1;
	if (canUseDOM) try {
		var options = {};
		Object.defineProperty(options, "passive", { get: function() {
			passiveBrowserEventsSupported = !0;
		} });
		window.addEventListener("test", options, options);
		window.removeEventListener("test", options, options);
	} catch (e) {
		passiveBrowserEventsSupported = !1;
	}
	var root = null, startText = null, fallbackText = null;
	function getData() {
		if (fallbackText) return fallbackText;
		var start, startValue = startText, startLength = startValue.length, end, endValue = "value" in root ? root.value : root.textContent, endLength = endValue.length;
		for (start = 0; start < startLength && startValue[start] === endValue[start]; start++);
		var minEnd = startLength - start;
		for (end = 1; end <= minEnd && startValue[startLength - end] === endValue[endLength - end]; end++);
		return fallbackText = endValue.slice(start, 1 < end ? 1 - end : void 0);
	}
	function getEventCharCode(nativeEvent) {
		var keyCode = nativeEvent.keyCode;
		"charCode" in nativeEvent ? (nativeEvent = nativeEvent.charCode, 0 === nativeEvent && 13 === keyCode && (nativeEvent = 13)) : nativeEvent = keyCode;
		10 === nativeEvent && (nativeEvent = 13);
		return 32 <= nativeEvent || 13 === nativeEvent ? nativeEvent : 0;
	}
	function functionThatReturnsTrue() {
		return !0;
	}
	function functionThatReturnsFalse() {
		return !1;
	}
	function createSyntheticEvent(Interface) {
		function SyntheticBaseEvent(reactName, reactEventType, targetInst, nativeEvent, nativeEventTarget) {
			this._reactName = reactName;
			this._targetInst = targetInst;
			this.type = reactEventType;
			this.nativeEvent = nativeEvent;
			this.target = nativeEventTarget;
			this.currentTarget = null;
			for (var propName in Interface) Interface.hasOwnProperty(propName) && (reactName = Interface[propName], this[propName] = reactName ? reactName(nativeEvent) : nativeEvent[propName]);
			this.isDefaultPrevented = (null != nativeEvent.defaultPrevented ? nativeEvent.defaultPrevented : !1 === nativeEvent.returnValue) ? functionThatReturnsTrue : functionThatReturnsFalse;
			this.isPropagationStopped = functionThatReturnsFalse;
			return this;
		}
		assign(SyntheticBaseEvent.prototype, {
			preventDefault: function() {
				this.defaultPrevented = !0;
				var event = this.nativeEvent;
				event && (event.preventDefault ? event.preventDefault() : "unknown" !== typeof event.returnValue && (event.returnValue = !1), this.isDefaultPrevented = functionThatReturnsTrue);
			},
			stopPropagation: function() {
				var event = this.nativeEvent;
				event && (event.stopPropagation ? event.stopPropagation() : "unknown" !== typeof event.cancelBubble && (event.cancelBubble = !0), this.isPropagationStopped = functionThatReturnsTrue);
			},
			persist: function() {},
			isPersistent: functionThatReturnsTrue
		});
		return SyntheticBaseEvent;
	}
	var EventInterface = {
		eventPhase: 0,
		bubbles: 0,
		cancelable: 0,
		timeStamp: function(event) {
			return event.timeStamp || Date.now();
		},
		defaultPrevented: 0,
		isTrusted: 0
	}, SyntheticEvent = createSyntheticEvent(EventInterface), UIEventInterface = assign({}, EventInterface, {
		view: 0,
		detail: 0
	}), SyntheticUIEvent = createSyntheticEvent(UIEventInterface), lastMovementX, lastMovementY, lastMouseEvent, MouseEventInterface = assign({}, UIEventInterface, {
		screenX: 0,
		screenY: 0,
		clientX: 0,
		clientY: 0,
		pageX: 0,
		pageY: 0,
		ctrlKey: 0,
		shiftKey: 0,
		altKey: 0,
		metaKey: 0,
		getModifierState: getEventModifierState,
		button: 0,
		buttons: 0,
		relatedTarget: function(event) {
			return void 0 === event.relatedTarget ? event.fromElement === event.srcElement ? event.toElement : event.fromElement : event.relatedTarget;
		},
		movementX: function(event) {
			if ("movementX" in event) return event.movementX;
			event !== lastMouseEvent && (lastMouseEvent && "mousemove" === event.type ? (lastMovementX = event.screenX - lastMouseEvent.screenX, lastMovementY = event.screenY - lastMouseEvent.screenY) : lastMovementY = lastMovementX = 0, lastMouseEvent = event);
			return lastMovementX;
		},
		movementY: function(event) {
			return "movementY" in event ? event.movementY : lastMovementY;
		}
	}), SyntheticMouseEvent = createSyntheticEvent(MouseEventInterface), SyntheticDragEvent = createSyntheticEvent(assign({}, MouseEventInterface, { dataTransfer: 0 })), SyntheticFocusEvent = createSyntheticEvent(assign({}, UIEventInterface, { relatedTarget: 0 })), SyntheticAnimationEvent = createSyntheticEvent(assign({}, EventInterface, {
		animationName: 0,
		elapsedTime: 0,
		pseudoElement: 0
	})), SyntheticClipboardEvent = createSyntheticEvent(assign({}, EventInterface, { clipboardData: function(event) {
		return "clipboardData" in event ? event.clipboardData : window.clipboardData;
	} })), SyntheticCompositionEvent = createSyntheticEvent(assign({}, EventInterface, { data: 0 })), normalizeKey = {
		Esc: "Escape",
		Spacebar: " ",
		Left: "ArrowLeft",
		Up: "ArrowUp",
		Right: "ArrowRight",
		Down: "ArrowDown",
		Del: "Delete",
		Win: "OS",
		Menu: "ContextMenu",
		Apps: "ContextMenu",
		Scroll: "ScrollLock",
		MozPrintableKey: "Unidentified"
	}, translateToKey = {
		8: "Backspace",
		9: "Tab",
		12: "Clear",
		13: "Enter",
		16: "Shift",
		17: "Control",
		18: "Alt",
		19: "Pause",
		20: "CapsLock",
		27: "Escape",
		32: " ",
		33: "PageUp",
		34: "PageDown",
		35: "End",
		36: "Home",
		37: "ArrowLeft",
		38: "ArrowUp",
		39: "ArrowRight",
		40: "ArrowDown",
		45: "Insert",
		46: "Delete",
		112: "F1",
		113: "F2",
		114: "F3",
		115: "F4",
		116: "F5",
		117: "F6",
		118: "F7",
		119: "F8",
		120: "F9",
		121: "F10",
		122: "F11",
		123: "F12",
		144: "NumLock",
		145: "ScrollLock",
		224: "Meta"
	}, modifierKeyToProp = {
		Alt: "altKey",
		Control: "ctrlKey",
		Meta: "metaKey",
		Shift: "shiftKey"
	};
	function modifierStateGetter(keyArg) {
		var nativeEvent = this.nativeEvent;
		return nativeEvent.getModifierState ? nativeEvent.getModifierState(keyArg) : (keyArg = modifierKeyToProp[keyArg]) ? !!nativeEvent[keyArg] : !1;
	}
	function getEventModifierState() {
		return modifierStateGetter;
	}
	var SyntheticKeyboardEvent = createSyntheticEvent(assign({}, UIEventInterface, {
		key: function(nativeEvent) {
			if (nativeEvent.key) {
				var key = normalizeKey[nativeEvent.key] || nativeEvent.key;
				if ("Unidentified" !== key) return key;
			}
			return "keypress" === nativeEvent.type ? (nativeEvent = getEventCharCode(nativeEvent), 13 === nativeEvent ? "Enter" : String.fromCharCode(nativeEvent)) : "keydown" === nativeEvent.type || "keyup" === nativeEvent.type ? translateToKey[nativeEvent.keyCode] || "Unidentified" : "";
		},
		code: 0,
		location: 0,
		ctrlKey: 0,
		shiftKey: 0,
		altKey: 0,
		metaKey: 0,
		repeat: 0,
		locale: 0,
		getModifierState: getEventModifierState,
		charCode: function(event) {
			return "keypress" === event.type ? getEventCharCode(event) : 0;
		},
		keyCode: function(event) {
			return "keydown" === event.type || "keyup" === event.type ? event.keyCode : 0;
		},
		which: function(event) {
			return "keypress" === event.type ? getEventCharCode(event) : "keydown" === event.type || "keyup" === event.type ? event.keyCode : 0;
		}
	})), SyntheticPointerEvent = createSyntheticEvent(assign({}, MouseEventInterface, {
		pointerId: 0,
		width: 0,
		height: 0,
		pressure: 0,
		tangentialPressure: 0,
		tiltX: 0,
		tiltY: 0,
		twist: 0,
		pointerType: 0,
		isPrimary: 0
	})), SyntheticTouchEvent = createSyntheticEvent(assign({}, UIEventInterface, {
		touches: 0,
		targetTouches: 0,
		changedTouches: 0,
		altKey: 0,
		metaKey: 0,
		ctrlKey: 0,
		shiftKey: 0,
		getModifierState: getEventModifierState
	})), SyntheticTransitionEvent = createSyntheticEvent(assign({}, EventInterface, {
		propertyName: 0,
		elapsedTime: 0,
		pseudoElement: 0
	})), SyntheticWheelEvent = createSyntheticEvent(assign({}, MouseEventInterface, {
		deltaX: function(event) {
			return "deltaX" in event ? event.deltaX : "wheelDeltaX" in event ? -event.wheelDeltaX : 0;
		},
		deltaY: function(event) {
			return "deltaY" in event ? event.deltaY : "wheelDeltaY" in event ? -event.wheelDeltaY : "wheelDelta" in event ? -event.wheelDelta : 0;
		},
		deltaZ: 0,
		deltaMode: 0
	})), SyntheticToggleEvent = createSyntheticEvent(assign({}, EventInterface, {
		newState: 0,
		oldState: 0
	})), END_KEYCODES = [
		9,
		13,
		27,
		32
	], canUseCompositionEvent = canUseDOM && "CompositionEvent" in window, documentMode = null;
	canUseDOM && "documentMode" in document && (documentMode = document.documentMode);
	var canUseTextInputEvent = canUseDOM && "TextEvent" in window && !documentMode, useFallbackCompositionData = canUseDOM && (!canUseCompositionEvent || documentMode && 8 < documentMode && 11 >= documentMode), SPACEBAR_CHAR = String.fromCharCode(32), hasSpaceKeypress = !1;
	function isFallbackCompositionEnd(domEventName, nativeEvent) {
		switch (domEventName) {
			case "keyup": return -1 !== END_KEYCODES.indexOf(nativeEvent.keyCode);
			case "keydown": return 229 !== nativeEvent.keyCode;
			case "keypress":
			case "mousedown":
			case "focusout": return !0;
			default: return !1;
		}
	}
	function getDataFromCustomEvent(nativeEvent) {
		nativeEvent = nativeEvent.detail;
		return "object" === typeof nativeEvent && "data" in nativeEvent ? nativeEvent.data : null;
	}
	var isComposing = !1;
	function getNativeBeforeInputChars(domEventName, nativeEvent) {
		switch (domEventName) {
			case "compositionend": return getDataFromCustomEvent(nativeEvent);
			case "keypress":
				if (32 !== nativeEvent.which) return null;
				hasSpaceKeypress = !0;
				return SPACEBAR_CHAR;
			case "textInput": return domEventName = nativeEvent.data, domEventName === SPACEBAR_CHAR && hasSpaceKeypress ? null : domEventName;
			default: return null;
		}
	}
	function getFallbackBeforeInputChars(domEventName, nativeEvent) {
		if (isComposing) return "compositionend" === domEventName || !canUseCompositionEvent && isFallbackCompositionEnd(domEventName, nativeEvent) ? (domEventName = getData(), fallbackText = startText = root = null, isComposing = !1, domEventName) : null;
		switch (domEventName) {
			case "paste": return null;
			case "keypress":
				if (!(nativeEvent.ctrlKey || nativeEvent.altKey || nativeEvent.metaKey) || nativeEvent.ctrlKey && nativeEvent.altKey) {
					if (nativeEvent.char && 1 < nativeEvent.char.length) return nativeEvent.char;
					if (nativeEvent.which) return String.fromCharCode(nativeEvent.which);
				}
				return null;
			case "compositionend": return useFallbackCompositionData && "ko" !== nativeEvent.locale ? null : nativeEvent.data;
			default: return null;
		}
	}
	var supportedInputTypes = {
		color: !0,
		date: !0,
		datetime: !0,
		"datetime-local": !0,
		email: !0,
		month: !0,
		number: !0,
		password: !0,
		range: !0,
		search: !0,
		tel: !0,
		text: !0,
		time: !0,
		url: !0,
		week: !0
	};
	function isTextInputElement(elem) {
		var nodeName = elem && elem.nodeName && elem.nodeName.toLowerCase();
		return "input" === nodeName ? !!supportedInputTypes[elem.type] : "textarea" === nodeName ? !0 : !1;
	}
	function createAndAccumulateChangeEvent(dispatchQueue, inst, nativeEvent, target) {
		restoreTarget ? restoreQueue ? restoreQueue.push(target) : restoreQueue = [target] : restoreTarget = target;
		inst = accumulateTwoPhaseListeners(inst, "onChange");
		0 < inst.length && (nativeEvent = new SyntheticEvent("onChange", "change", null, nativeEvent, target), dispatchQueue.push({
			event: nativeEvent,
			listeners: inst
		}));
	}
	var activeElement$1 = null, activeElementInst$1 = null;
	function runEventInBatch(dispatchQueue) {
		processDispatchQueue(dispatchQueue, 0);
	}
	function getInstIfValueChanged(targetInst) {
		if (updateValueIfChanged(getNodeFromInstance(targetInst))) return targetInst;
	}
	function getTargetInstForChangeEvent(domEventName, targetInst) {
		if ("change" === domEventName) return targetInst;
	}
	var isInputEventSupported = !1;
	if (canUseDOM) {
		var JSCompiler_inline_result$jscomp$286;
		if (canUseDOM) {
			var isSupported$jscomp$inline_427 = "oninput" in document;
			if (!isSupported$jscomp$inline_427) {
				var element$jscomp$inline_428 = document.createElement("div");
				element$jscomp$inline_428.setAttribute("oninput", "return;");
				isSupported$jscomp$inline_427 = "function" === typeof element$jscomp$inline_428.oninput;
			}
			JSCompiler_inline_result$jscomp$286 = isSupported$jscomp$inline_427;
		} else JSCompiler_inline_result$jscomp$286 = !1;
		isInputEventSupported = JSCompiler_inline_result$jscomp$286 && (!document.documentMode || 9 < document.documentMode);
	}
	function stopWatchingForValueChange() {
		activeElement$1 && (activeElement$1.detachEvent("onpropertychange", handlePropertyChange), activeElementInst$1 = activeElement$1 = null);
	}
	function handlePropertyChange(nativeEvent) {
		if ("value" === nativeEvent.propertyName && getInstIfValueChanged(activeElementInst$1)) {
			var dispatchQueue = [];
			createAndAccumulateChangeEvent(dispatchQueue, activeElementInst$1, nativeEvent, getEventTarget(nativeEvent));
			batchedUpdates$1(runEventInBatch, dispatchQueue);
		}
	}
	function handleEventsForInputEventPolyfill(domEventName, target, targetInst) {
		"focusin" === domEventName ? (stopWatchingForValueChange(), activeElement$1 = target, activeElementInst$1 = targetInst, activeElement$1.attachEvent("onpropertychange", handlePropertyChange)) : "focusout" === domEventName && stopWatchingForValueChange();
	}
	function getTargetInstForInputEventPolyfill(domEventName) {
		if ("selectionchange" === domEventName || "keyup" === domEventName || "keydown" === domEventName) return getInstIfValueChanged(activeElementInst$1);
	}
	function getTargetInstForClickEvent(domEventName, targetInst) {
		if ("click" === domEventName) return getInstIfValueChanged(targetInst);
	}
	function getTargetInstForInputOrChangeEvent(domEventName, targetInst) {
		if ("input" === domEventName || "change" === domEventName) return getInstIfValueChanged(targetInst);
	}
	function is(x, y) {
		return x === y && (0 !== x || 1 / x === 1 / y) || x !== x && y !== y;
	}
	var objectIs = "function" === typeof Object.is ? Object.is : is;
	function shallowEqual(objA, objB) {
		if (objectIs(objA, objB)) return !0;
		if ("object" !== typeof objA || null === objA || "object" !== typeof objB || null === objB) return !1;
		var keysA = Object.keys(objA), keysB = Object.keys(objB);
		if (keysA.length !== keysB.length) return !1;
		for (keysB = 0; keysB < keysA.length; keysB++) {
			var currentKey = keysA[keysB];
			if (!hasOwnProperty.call(objB, currentKey) || !objectIs(objA[currentKey], objB[currentKey])) return !1;
		}
		return !0;
	}
	function getLeafNode(node) {
		for (; node && node.firstChild;) node = node.firstChild;
		return node;
	}
	function getNodeForCharacterOffset(root, offset) {
		var node = getLeafNode(root);
		root = 0;
		for (var nodeEnd; node;) {
			if (3 === node.nodeType) {
				nodeEnd = root + node.textContent.length;
				if (root <= offset && nodeEnd >= offset) return {
					node,
					offset: offset - root
				};
				root = nodeEnd;
			}
			a: {
				for (; node;) {
					if (node.nextSibling) {
						node = node.nextSibling;
						break a;
					}
					node = node.parentNode;
				}
				node = void 0;
			}
			node = getLeafNode(node);
		}
	}
	function containsNode(outerNode, innerNode) {
		return outerNode && innerNode ? outerNode === innerNode ? !0 : outerNode && 3 === outerNode.nodeType ? !1 : innerNode && 3 === innerNode.nodeType ? containsNode(outerNode, innerNode.parentNode) : "contains" in outerNode ? outerNode.contains(innerNode) : outerNode.compareDocumentPosition ? !!(outerNode.compareDocumentPosition(innerNode) & 16) : !1 : !1;
	}
	function getActiveElementDeep(containerInfo) {
		containerInfo = null != containerInfo && null != containerInfo.ownerDocument && null != containerInfo.ownerDocument.defaultView ? containerInfo.ownerDocument.defaultView : window;
		for (var element = getActiveElement(containerInfo.document); element instanceof containerInfo.HTMLIFrameElement;) {
			try {
				var JSCompiler_inline_result = "string" === typeof element.contentWindow.location.href;
			} catch (err) {
				JSCompiler_inline_result = !1;
			}
			if (JSCompiler_inline_result) containerInfo = element.contentWindow;
			else break;
			element = getActiveElement(containerInfo.document);
		}
		return element;
	}
	function hasSelectionCapabilities(elem) {
		var nodeName = elem && elem.nodeName && elem.nodeName.toLowerCase();
		return nodeName && ("input" === nodeName && ("text" === elem.type || "search" === elem.type || "tel" === elem.type || "url" === elem.type || "password" === elem.type) || "textarea" === nodeName || "true" === elem.contentEditable);
	}
	var skipSelectionChangeEvent = canUseDOM && "documentMode" in document && 11 >= document.documentMode, activeElement = null, activeElementInst = null, lastSelection = null, mouseDown = !1;
	function constructSelectEvent(dispatchQueue, nativeEvent, nativeEventTarget) {
		var doc = nativeEventTarget.window === nativeEventTarget ? nativeEventTarget.document : 9 === nativeEventTarget.nodeType ? nativeEventTarget : nativeEventTarget.ownerDocument;
		mouseDown || null == activeElement || activeElement !== getActiveElement(doc) || (doc = activeElement, "selectionStart" in doc && hasSelectionCapabilities(doc) ? doc = {
			start: doc.selectionStart,
			end: doc.selectionEnd
		} : (doc = (doc.ownerDocument && doc.ownerDocument.defaultView || window).getSelection(), doc = {
			anchorNode: doc.anchorNode,
			anchorOffset: doc.anchorOffset,
			focusNode: doc.focusNode,
			focusOffset: doc.focusOffset
		}), lastSelection && shallowEqual(lastSelection, doc) || (lastSelection = doc, doc = accumulateTwoPhaseListeners(activeElementInst, "onSelect"), 0 < doc.length && (nativeEvent = new SyntheticEvent("onSelect", "select", null, nativeEvent, nativeEventTarget), dispatchQueue.push({
			event: nativeEvent,
			listeners: doc
		}), nativeEvent.target = activeElement)));
	}
	function makePrefixMap(styleProp, eventName) {
		var prefixes = {};
		prefixes[styleProp.toLowerCase()] = eventName.toLowerCase();
		prefixes["Webkit" + styleProp] = "webkit" + eventName;
		prefixes["Moz" + styleProp] = "moz" + eventName;
		return prefixes;
	}
	var vendorPrefixes = {
		animationend: makePrefixMap("Animation", "AnimationEnd"),
		animationiteration: makePrefixMap("Animation", "AnimationIteration"),
		animationstart: makePrefixMap("Animation", "AnimationStart"),
		transitionrun: makePrefixMap("Transition", "TransitionRun"),
		transitionstart: makePrefixMap("Transition", "TransitionStart"),
		transitioncancel: makePrefixMap("Transition", "TransitionCancel"),
		transitionend: makePrefixMap("Transition", "TransitionEnd")
	}, prefixedEventNames = {}, style = {};
	canUseDOM && (style = document.createElement("div").style, "AnimationEvent" in window || (delete vendorPrefixes.animationend.animation, delete vendorPrefixes.animationiteration.animation, delete vendorPrefixes.animationstart.animation), "TransitionEvent" in window || delete vendorPrefixes.transitionend.transition);
	function getVendorPrefixedEventName(eventName) {
		if (prefixedEventNames[eventName]) return prefixedEventNames[eventName];
		if (!vendorPrefixes[eventName]) return eventName;
		var prefixMap = vendorPrefixes[eventName], styleProp;
		for (styleProp in prefixMap) if (prefixMap.hasOwnProperty(styleProp) && styleProp in style) return prefixedEventNames[eventName] = prefixMap[styleProp];
		return eventName;
	}
	var ANIMATION_END = getVendorPrefixedEventName("animationend"), ANIMATION_ITERATION = getVendorPrefixedEventName("animationiteration"), ANIMATION_START = getVendorPrefixedEventName("animationstart"), TRANSITION_RUN = getVendorPrefixedEventName("transitionrun"), TRANSITION_START = getVendorPrefixedEventName("transitionstart"), TRANSITION_CANCEL = getVendorPrefixedEventName("transitioncancel"), TRANSITION_END = getVendorPrefixedEventName("transitionend"), topLevelEventsToReactNames = /* @__PURE__ */ new Map(), simpleEventPluginEvents = "abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
	simpleEventPluginEvents.push("scrollEnd");
	function registerSimpleEvent(domEventName, reactName) {
		topLevelEventsToReactNames.set(domEventName, reactName);
		registerTwoPhaseEvent(reactName, [domEventName]);
	}
	var reportGlobalError = "function" === typeof reportError ? reportError : function(error) {
		if ("object" === typeof window && "function" === typeof window.ErrorEvent) {
			var event = new window.ErrorEvent("error", {
				bubbles: !0,
				cancelable: !0,
				message: "object" === typeof error && null !== error && "string" === typeof error.message ? String(error.message) : String(error),
				error
			});
			if (!window.dispatchEvent(event)) return;
		} else if ("object" === typeof process && "function" === typeof process.emit) {
			process.emit("uncaughtException", error);
			return;
		}
		console.error(error);
	}, concurrentQueues = [], concurrentQueuesIndex = 0, concurrentlyUpdatedLanes = 0;
	function finishQueueingConcurrentUpdates() {
		for (var endIndex = concurrentQueuesIndex, i = concurrentlyUpdatedLanes = concurrentQueuesIndex = 0; i < endIndex;) {
			var fiber = concurrentQueues[i];
			concurrentQueues[i++] = null;
			var queue = concurrentQueues[i];
			concurrentQueues[i++] = null;
			var update = concurrentQueues[i];
			concurrentQueues[i++] = null;
			var lane = concurrentQueues[i];
			concurrentQueues[i++] = null;
			if (null !== queue && null !== update) {
				var pending = queue.pending;
				null === pending ? update.next = update : (update.next = pending.next, pending.next = update);
				queue.pending = update;
			}
			0 !== lane && markUpdateLaneFromFiberToRoot(fiber, update, lane);
		}
	}
	function enqueueUpdate$1(fiber, queue, update, lane) {
		concurrentQueues[concurrentQueuesIndex++] = fiber;
		concurrentQueues[concurrentQueuesIndex++] = queue;
		concurrentQueues[concurrentQueuesIndex++] = update;
		concurrentQueues[concurrentQueuesIndex++] = lane;
		concurrentlyUpdatedLanes |= lane;
		fiber.lanes |= lane;
		fiber = fiber.alternate;
		null !== fiber && (fiber.lanes |= lane);
	}
	function enqueueConcurrentHookUpdate(fiber, queue, update, lane) {
		enqueueUpdate$1(fiber, queue, update, lane);
		return getRootForUpdatedFiber(fiber);
	}
	function enqueueConcurrentRenderForLane(fiber, lane) {
		enqueueUpdate$1(fiber, null, null, lane);
		return getRootForUpdatedFiber(fiber);
	}
	function markUpdateLaneFromFiberToRoot(sourceFiber, update, lane) {
		sourceFiber.lanes |= lane;
		var alternate = sourceFiber.alternate;
		null !== alternate && (alternate.lanes |= lane);
		for (var isHidden = !1, parent = sourceFiber.return; null !== parent;) parent.childLanes |= lane, alternate = parent.alternate, null !== alternate && (alternate.childLanes |= lane), 22 === parent.tag && (sourceFiber = parent.stateNode, null === sourceFiber || sourceFiber._visibility & 1 || (isHidden = !0)), sourceFiber = parent, parent = parent.return;
		return 3 === sourceFiber.tag ? (parent = sourceFiber.stateNode, isHidden && null !== update && (isHidden = 31 - clz32(lane), sourceFiber = parent.hiddenUpdates, alternate = sourceFiber[isHidden], null === alternate ? sourceFiber[isHidden] = [update] : alternate.push(update), update.lane = lane | 536870912), parent) : null;
	}
	function getRootForUpdatedFiber(sourceFiber) {
		if (50 < nestedUpdateCount) throw nestedUpdateCount = 0, rootWithNestedUpdates = null, Error(formatProdErrorMessage(185));
		for (var parent = sourceFiber.return; null !== parent;) sourceFiber = parent, parent = sourceFiber.return;
		return 3 === sourceFiber.tag ? sourceFiber.stateNode : null;
	}
	var emptyContextObject = {};
	function FiberNode(tag, pendingProps, key, mode) {
		this.tag = tag;
		this.key = key;
		this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null;
		this.index = 0;
		this.refCleanup = this.ref = null;
		this.pendingProps = pendingProps;
		this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null;
		this.mode = mode;
		this.subtreeFlags = this.flags = 0;
		this.deletions = null;
		this.childLanes = this.lanes = 0;
		this.alternate = null;
	}
	function createFiberImplClass(tag, pendingProps, key, mode) {
		return new FiberNode(tag, pendingProps, key, mode);
	}
	function shouldConstruct(Component) {
		Component = Component.prototype;
		return !(!Component || !Component.isReactComponent);
	}
	function createWorkInProgress(current, pendingProps) {
		var workInProgress = current.alternate;
		null === workInProgress ? (workInProgress = createFiberImplClass(current.tag, pendingProps, current.key, current.mode), workInProgress.elementType = current.elementType, workInProgress.type = current.type, workInProgress.stateNode = current.stateNode, workInProgress.alternate = current, current.alternate = workInProgress) : (workInProgress.pendingProps = pendingProps, workInProgress.type = current.type, workInProgress.flags = 0, workInProgress.subtreeFlags = 0, workInProgress.deletions = null);
		workInProgress.flags = current.flags & 65011712;
		workInProgress.childLanes = current.childLanes;
		workInProgress.lanes = current.lanes;
		workInProgress.child = current.child;
		workInProgress.memoizedProps = current.memoizedProps;
		workInProgress.memoizedState = current.memoizedState;
		workInProgress.updateQueue = current.updateQueue;
		pendingProps = current.dependencies;
		workInProgress.dependencies = null === pendingProps ? null : {
			lanes: pendingProps.lanes,
			firstContext: pendingProps.firstContext
		};
		workInProgress.sibling = current.sibling;
		workInProgress.index = current.index;
		workInProgress.ref = current.ref;
		workInProgress.refCleanup = current.refCleanup;
		return workInProgress;
	}
	function resetWorkInProgress(workInProgress, renderLanes) {
		workInProgress.flags &= 65011714;
		var current = workInProgress.alternate;
		null === current ? (workInProgress.childLanes = 0, workInProgress.lanes = renderLanes, workInProgress.child = null, workInProgress.subtreeFlags = 0, workInProgress.memoizedProps = null, workInProgress.memoizedState = null, workInProgress.updateQueue = null, workInProgress.dependencies = null, workInProgress.stateNode = null) : (workInProgress.childLanes = current.childLanes, workInProgress.lanes = current.lanes, workInProgress.child = current.child, workInProgress.subtreeFlags = 0, workInProgress.deletions = null, workInProgress.memoizedProps = current.memoizedProps, workInProgress.memoizedState = current.memoizedState, workInProgress.updateQueue = current.updateQueue, workInProgress.type = current.type, renderLanes = current.dependencies, workInProgress.dependencies = null === renderLanes ? null : {
			lanes: renderLanes.lanes,
			firstContext: renderLanes.firstContext
		});
		return workInProgress;
	}
	function createFiberFromTypeAndProps(type, key, pendingProps, owner, mode, lanes) {
		var fiberTag = 0;
		owner = type;
		if ("function" === typeof type) shouldConstruct(type) && (fiberTag = 1);
		else if ("string" === typeof type) fiberTag = isHostHoistableType(type, pendingProps, contextStackCursor.current) ? 26 : "html" === type || "head" === type || "body" === type ? 27 : 5;
		else a: switch (type) {
			case REACT_ACTIVITY_TYPE: return type = createFiberImplClass(31, pendingProps, key, mode), type.elementType = REACT_ACTIVITY_TYPE, type.lanes = lanes, type;
			case REACT_FRAGMENT_TYPE: return createFiberFromFragment(pendingProps.children, mode, lanes, key);
			case REACT_STRICT_MODE_TYPE:
				fiberTag = 8;
				mode |= 24;
				break;
			case REACT_PROFILER_TYPE: return type = createFiberImplClass(12, pendingProps, key, mode | 2), type.elementType = REACT_PROFILER_TYPE, type.lanes = lanes, type;
			case REACT_SUSPENSE_TYPE: return type = createFiberImplClass(13, pendingProps, key, mode), type.elementType = REACT_SUSPENSE_TYPE, type.lanes = lanes, type;
			case REACT_SUSPENSE_LIST_TYPE: return type = createFiberImplClass(19, pendingProps, key, mode), type.elementType = REACT_SUSPENSE_LIST_TYPE, type.lanes = lanes, type;
			default:
				if ("object" === typeof type && null !== type) switch (type.$$typeof) {
					case REACT_CONTEXT_TYPE:
						fiberTag = 10;
						break a;
					case REACT_CONSUMER_TYPE:
						fiberTag = 9;
						break a;
					case REACT_FORWARD_REF_TYPE:
						fiberTag = 11;
						break a;
					case REACT_MEMO_TYPE:
						fiberTag = 14;
						break a;
					case REACT_LAZY_TYPE:
						fiberTag = 16;
						owner = null;
						break a;
				}
				fiberTag = 29;
				pendingProps = Error(formatProdErrorMessage(130, null === type ? "null" : typeof type, ""));
				owner = null;
		}
		key = createFiberImplClass(fiberTag, pendingProps, key, mode);
		key.elementType = type;
		key.type = owner;
		key.lanes = lanes;
		return key;
	}
	function createFiberFromFragment(elements, mode, lanes, key) {
		elements = createFiberImplClass(7, elements, key, mode);
		elements.lanes = lanes;
		return elements;
	}
	function createFiberFromText(content, mode, lanes) {
		content = createFiberImplClass(6, content, null, mode);
		content.lanes = lanes;
		return content;
	}
	function createFiberFromDehydratedFragment(dehydratedNode) {
		var fiber = createFiberImplClass(18, null, null, 0);
		fiber.stateNode = dehydratedNode;
		return fiber;
	}
	function createFiberFromPortal(portal, mode, lanes) {
		mode = createFiberImplClass(4, null !== portal.children ? portal.children : [], portal.key, mode);
		mode.lanes = lanes;
		mode.stateNode = {
			containerInfo: portal.containerInfo,
			pendingChildren: null,
			implementation: portal.implementation
		};
		return mode;
	}
	var CapturedStacks = /* @__PURE__ */ new WeakMap();
	function createCapturedValueAtFiber(value, source) {
		if ("object" === typeof value && null !== value) {
			var existing = CapturedStacks.get(value);
			if (void 0 !== existing) return existing;
			source = {
				value,
				source,
				stack: getStackByFiberInDevAndProd(source)
			};
			CapturedStacks.set(value, source);
			return source;
		}
		return {
			value,
			source,
			stack: getStackByFiberInDevAndProd(source)
		};
	}
	var forkStack = [], forkStackIndex = 0, treeForkProvider = null, treeForkCount = 0, idStack = [], idStackIndex = 0, treeContextProvider = null, treeContextId = 1, treeContextOverflow = "";
	function pushTreeFork(workInProgress, totalChildren) {
		forkStack[forkStackIndex++] = treeForkCount;
		forkStack[forkStackIndex++] = treeForkProvider;
		treeForkProvider = workInProgress;
		treeForkCount = totalChildren;
	}
	function pushTreeId(workInProgress, totalChildren, index) {
		idStack[idStackIndex++] = treeContextId;
		idStack[idStackIndex++] = treeContextOverflow;
		idStack[idStackIndex++] = treeContextProvider;
		treeContextProvider = workInProgress;
		var baseIdWithLeadingBit = treeContextId;
		workInProgress = treeContextOverflow;
		var baseLength = 32 - clz32(baseIdWithLeadingBit) - 1;
		baseIdWithLeadingBit &= ~(1 << baseLength);
		index += 1;
		var length = 32 - clz32(totalChildren) + baseLength;
		if (30 < length) {
			var numberOfOverflowBits = baseLength - baseLength % 5;
			length = (baseIdWithLeadingBit & (1 << numberOfOverflowBits) - 1).toString(32);
			baseIdWithLeadingBit >>= numberOfOverflowBits;
			baseLength -= numberOfOverflowBits;
			treeContextId = 1 << 32 - clz32(totalChildren) + baseLength | index << baseLength | baseIdWithLeadingBit;
			treeContextOverflow = length + workInProgress;
		} else treeContextId = 1 << length | index << baseLength | baseIdWithLeadingBit, treeContextOverflow = workInProgress;
	}
	function pushMaterializedTreeId(workInProgress) {
		null !== workInProgress.return && (pushTreeFork(workInProgress, 1), pushTreeId(workInProgress, 1, 0));
	}
	function popTreeContext(workInProgress) {
		for (; workInProgress === treeForkProvider;) treeForkProvider = forkStack[--forkStackIndex], forkStack[forkStackIndex] = null, treeForkCount = forkStack[--forkStackIndex], forkStack[forkStackIndex] = null;
		for (; workInProgress === treeContextProvider;) treeContextProvider = idStack[--idStackIndex], idStack[idStackIndex] = null, treeContextOverflow = idStack[--idStackIndex], idStack[idStackIndex] = null, treeContextId = idStack[--idStackIndex], idStack[idStackIndex] = null;
	}
	function restoreSuspendedTreeContext(workInProgress, suspendedContext) {
		idStack[idStackIndex++] = treeContextId;
		idStack[idStackIndex++] = treeContextOverflow;
		idStack[idStackIndex++] = treeContextProvider;
		treeContextId = suspendedContext.id;
		treeContextOverflow = suspendedContext.overflow;
		treeContextProvider = workInProgress;
	}
	var hydrationParentFiber = null, nextHydratableInstance = null, isHydrating = !1, hydrationErrors = null, rootOrSingletonContext = !1, HydrationMismatchException = Error(formatProdErrorMessage(519));
	function throwOnHydrationMismatch(fiber) {
		queueHydrationError(createCapturedValueAtFiber(Error(formatProdErrorMessage(418, 1 < arguments.length && void 0 !== arguments[1] && arguments[1] ? "text" : "HTML", "")), fiber));
		throw HydrationMismatchException;
	}
	function prepareToHydrateHostInstance(fiber) {
		var instance = fiber.stateNode, type = fiber.type, props = fiber.memoizedProps;
		instance[internalInstanceKey] = fiber;
		instance[internalPropsKey] = props;
		switch (type) {
			case "dialog":
				listenToNonDelegatedEvent("cancel", instance);
				listenToNonDelegatedEvent("close", instance);
				break;
			case "iframe":
			case "object":
			case "embed":
				listenToNonDelegatedEvent("load", instance);
				break;
			case "video":
			case "audio":
				for (type = 0; type < mediaEventTypes.length; type++) listenToNonDelegatedEvent(mediaEventTypes[type], instance);
				break;
			case "source":
				listenToNonDelegatedEvent("error", instance);
				break;
			case "img":
			case "image":
			case "link":
				listenToNonDelegatedEvent("error", instance);
				listenToNonDelegatedEvent("load", instance);
				break;
			case "details":
				listenToNonDelegatedEvent("toggle", instance);
				break;
			case "input":
				listenToNonDelegatedEvent("invalid", instance);
				initInput(instance, props.value, props.defaultValue, props.checked, props.defaultChecked, props.type, props.name, !0);
				break;
			case "select":
				listenToNonDelegatedEvent("invalid", instance);
				break;
			case "textarea": listenToNonDelegatedEvent("invalid", instance), initTextarea(instance, props.value, props.defaultValue, props.children);
		}
		type = props.children;
		"string" !== typeof type && "number" !== typeof type && "bigint" !== typeof type || instance.textContent === "" + type || !0 === props.suppressHydrationWarning || checkForUnmatchedText(instance.textContent, type) ? (null != props.popover && (listenToNonDelegatedEvent("beforetoggle", instance), listenToNonDelegatedEvent("toggle", instance)), null != props.onScroll && listenToNonDelegatedEvent("scroll", instance), null != props.onScrollEnd && listenToNonDelegatedEvent("scrollend", instance), null != props.onClick && (instance.onclick = noop$1), instance = !0) : instance = !1;
		instance || throwOnHydrationMismatch(fiber, !0);
	}
	function popToNextHostParent(fiber) {
		for (hydrationParentFiber = fiber.return; hydrationParentFiber;) switch (hydrationParentFiber.tag) {
			case 5:
			case 31:
			case 13:
				rootOrSingletonContext = !1;
				return;
			case 27:
			case 3:
				rootOrSingletonContext = !0;
				return;
			default: hydrationParentFiber = hydrationParentFiber.return;
		}
	}
	function popHydrationState(fiber) {
		if (fiber !== hydrationParentFiber) return !1;
		if (!isHydrating) return popToNextHostParent(fiber), isHydrating = !0, !1;
		var tag = fiber.tag, JSCompiler_temp;
		if (JSCompiler_temp = 3 !== tag && 27 !== tag) {
			if (JSCompiler_temp = 5 === tag) JSCompiler_temp = fiber.type, JSCompiler_temp = !("form" !== JSCompiler_temp && "button" !== JSCompiler_temp) || shouldSetTextContent(fiber.type, fiber.memoizedProps);
			JSCompiler_temp = !JSCompiler_temp;
		}
		JSCompiler_temp && nextHydratableInstance && throwOnHydrationMismatch(fiber);
		popToNextHostParent(fiber);
		if (13 === tag) {
			fiber = fiber.memoizedState;
			fiber = null !== fiber ? fiber.dehydrated : null;
			if (!fiber) throw Error(formatProdErrorMessage(317));
			nextHydratableInstance = getNextHydratableInstanceAfterHydrationBoundary(fiber);
		} else if (31 === tag) {
			fiber = fiber.memoizedState;
			fiber = null !== fiber ? fiber.dehydrated : null;
			if (!fiber) throw Error(formatProdErrorMessage(317));
			nextHydratableInstance = getNextHydratableInstanceAfterHydrationBoundary(fiber);
		} else 27 === tag ? (tag = nextHydratableInstance, isSingletonScope(fiber.type) ? (fiber = previousHydratableOnEnteringScopedSingleton, previousHydratableOnEnteringScopedSingleton = null, nextHydratableInstance = fiber) : nextHydratableInstance = tag) : nextHydratableInstance = hydrationParentFiber ? getNextHydratable(fiber.stateNode.nextSibling) : null;
		return !0;
	}
	function resetHydrationState() {
		nextHydratableInstance = hydrationParentFiber = null;
		isHydrating = !1;
	}
	function upgradeHydrationErrorsToRecoverable() {
		var queuedErrors = hydrationErrors;
		null !== queuedErrors && (null === workInProgressRootRecoverableErrors ? workInProgressRootRecoverableErrors = queuedErrors : workInProgressRootRecoverableErrors.push.apply(workInProgressRootRecoverableErrors, queuedErrors), hydrationErrors = null);
		return queuedErrors;
	}
	function queueHydrationError(error) {
		null === hydrationErrors ? hydrationErrors = [error] : hydrationErrors.push(error);
	}
	var valueCursor = createCursor(null), currentlyRenderingFiber$1 = null, lastContextDependency = null;
	function pushProvider(providerFiber, context, nextValue) {
		push(valueCursor, context._currentValue);
		context._currentValue = nextValue;
	}
	function popProvider(context) {
		context._currentValue = valueCursor.current;
		pop(valueCursor);
	}
	function scheduleContextWorkOnParentPath(parent, renderLanes, propagationRoot) {
		for (; null !== parent;) {
			var alternate = parent.alternate;
			(parent.childLanes & renderLanes) !== renderLanes ? (parent.childLanes |= renderLanes, null !== alternate && (alternate.childLanes |= renderLanes)) : null !== alternate && (alternate.childLanes & renderLanes) !== renderLanes && (alternate.childLanes |= renderLanes);
			if (parent === propagationRoot) break;
			parent = parent.return;
		}
	}
	function propagateContextChanges(workInProgress, contexts, renderLanes, forcePropagateEntireTree) {
		var fiber = workInProgress.child;
		null !== fiber && (fiber.return = workInProgress);
		for (; null !== fiber;) {
			var list = fiber.dependencies;
			if (null !== list) {
				var nextFiber = fiber.child;
				list = list.firstContext;
				a: for (; null !== list;) {
					var dependency = list;
					list = fiber;
					for (var i = 0; i < contexts.length; i++) if (dependency.context === contexts[i]) {
						list.lanes |= renderLanes;
						dependency = list.alternate;
						null !== dependency && (dependency.lanes |= renderLanes);
						scheduleContextWorkOnParentPath(list.return, renderLanes, workInProgress);
						forcePropagateEntireTree || (nextFiber = null);
						break a;
					}
					list = dependency.next;
				}
			} else if (18 === fiber.tag) {
				nextFiber = fiber.return;
				if (null === nextFiber) throw Error(formatProdErrorMessage(341));
				nextFiber.lanes |= renderLanes;
				list = nextFiber.alternate;
				null !== list && (list.lanes |= renderLanes);
				scheduleContextWorkOnParentPath(nextFiber, renderLanes, workInProgress);
				nextFiber = null;
			} else nextFiber = fiber.child;
			if (null !== nextFiber) nextFiber.return = fiber;
			else for (nextFiber = fiber; null !== nextFiber;) {
				if (nextFiber === workInProgress) {
					nextFiber = null;
					break;
				}
				fiber = nextFiber.sibling;
				if (null !== fiber) {
					fiber.return = nextFiber.return;
					nextFiber = fiber;
					break;
				}
				nextFiber = nextFiber.return;
			}
			fiber = nextFiber;
		}
	}
	function propagateParentContextChanges(current, workInProgress, renderLanes, forcePropagateEntireTree) {
		current = null;
		for (var parent = workInProgress, isInsidePropagationBailout = !1; null !== parent;) {
			if (!isInsidePropagationBailout) {
				if (0 !== (parent.flags & 524288)) isInsidePropagationBailout = !0;
				else if (0 !== (parent.flags & 262144)) break;
			}
			if (10 === parent.tag) {
				var currentParent = parent.alternate;
				if (null === currentParent) throw Error(formatProdErrorMessage(387));
				currentParent = currentParent.memoizedProps;
				if (null !== currentParent) {
					var context = parent.type;
					objectIs(parent.pendingProps.value, currentParent.value) || (null !== current ? current.push(context) : current = [context]);
				}
			} else if (parent === hostTransitionProviderCursor.current) {
				currentParent = parent.alternate;
				if (null === currentParent) throw Error(formatProdErrorMessage(387));
				currentParent.memoizedState.memoizedState !== parent.memoizedState.memoizedState && (null !== current ? current.push(HostTransitionContext) : current = [HostTransitionContext]);
			}
			parent = parent.return;
		}
		null !== current && propagateContextChanges(workInProgress, current, renderLanes, forcePropagateEntireTree);
		workInProgress.flags |= 262144;
	}
	function checkIfContextChanged(currentDependencies) {
		for (currentDependencies = currentDependencies.firstContext; null !== currentDependencies;) {
			if (!objectIs(currentDependencies.context._currentValue, currentDependencies.memoizedValue)) return !0;
			currentDependencies = currentDependencies.next;
		}
		return !1;
	}
	function prepareToReadContext(workInProgress) {
		currentlyRenderingFiber$1 = workInProgress;
		lastContextDependency = null;
		workInProgress = workInProgress.dependencies;
		null !== workInProgress && (workInProgress.firstContext = null);
	}
	function readContext(context) {
		return readContextForConsumer(currentlyRenderingFiber$1, context);
	}
	function readContextDuringReconciliation(consumer, context) {
		null === currentlyRenderingFiber$1 && prepareToReadContext(consumer);
		return readContextForConsumer(consumer, context);
	}
	function readContextForConsumer(consumer, context) {
		var value = context._currentValue;
		context = {
			context,
			memoizedValue: value,
			next: null
		};
		if (null === lastContextDependency) {
			if (null === consumer) throw Error(formatProdErrorMessage(308));
			lastContextDependency = context;
			consumer.dependencies = {
				lanes: 0,
				firstContext: context
			};
			consumer.flags |= 524288;
		} else lastContextDependency = lastContextDependency.next = context;
		return value;
	}
	var AbortControllerLocal = "undefined" !== typeof AbortController ? AbortController : function() {
		var listeners = [], signal = this.signal = {
			aborted: !1,
			addEventListener: function(type, listener) {
				listeners.push(listener);
			}
		};
		this.abort = function() {
			signal.aborted = !0;
			listeners.forEach(function(listener) {
				return listener();
			});
		};
	}, scheduleCallback$2 = Scheduler.unstable_scheduleCallback, NormalPriority = Scheduler.unstable_NormalPriority, CacheContext = {
		$$typeof: REACT_CONTEXT_TYPE,
		Consumer: null,
		Provider: null,
		_currentValue: null,
		_currentValue2: null,
		_threadCount: 0
	};
	function createCache() {
		return {
			controller: new AbortControllerLocal(),
			data: /* @__PURE__ */ new Map(),
			refCount: 0
		};
	}
	function releaseCache(cache) {
		cache.refCount--;
		0 === cache.refCount && scheduleCallback$2(NormalPriority, function() {
			cache.controller.abort();
		});
	}
	var currentEntangledListeners = null, currentEntangledPendingCount = 0, currentEntangledLane = 0, currentEntangledActionThenable = null;
	function entangleAsyncAction(transition, thenable) {
		if (null === currentEntangledListeners) {
			var entangledListeners = currentEntangledListeners = [];
			currentEntangledPendingCount = 0;
			currentEntangledLane = requestTransitionLane();
			currentEntangledActionThenable = {
				status: "pending",
				value: void 0,
				then: function(resolve) {
					entangledListeners.push(resolve);
				}
			};
		}
		currentEntangledPendingCount++;
		thenable.then(pingEngtangledActionScope, pingEngtangledActionScope);
		return thenable;
	}
	function pingEngtangledActionScope() {
		if (0 === --currentEntangledPendingCount && null !== currentEntangledListeners) {
			null !== currentEntangledActionThenable && (currentEntangledActionThenable.status = "fulfilled");
			var listeners = currentEntangledListeners;
			currentEntangledListeners = null;
			currentEntangledLane = 0;
			currentEntangledActionThenable = null;
			for (var i = 0; i < listeners.length; i++) (0, listeners[i])();
		}
	}
	function chainThenableValue(thenable, result) {
		var listeners = [], thenableWithOverride = {
			status: "pending",
			value: null,
			reason: null,
			then: function(resolve) {
				listeners.push(resolve);
			}
		};
		thenable.then(function() {
			thenableWithOverride.status = "fulfilled";
			thenableWithOverride.value = result;
			for (var i = 0; i < listeners.length; i++) (0, listeners[i])(result);
		}, function(error) {
			thenableWithOverride.status = "rejected";
			thenableWithOverride.reason = error;
			for (error = 0; error < listeners.length; error++) (0, listeners[error])(void 0);
		});
		return thenableWithOverride;
	}
	var prevOnStartTransitionFinish = ReactSharedInternals.S;
	ReactSharedInternals.S = function(transition, returnValue) {
		globalMostRecentTransitionTime = now();
		"object" === typeof returnValue && null !== returnValue && "function" === typeof returnValue.then && entangleAsyncAction(transition, returnValue);
		null !== prevOnStartTransitionFinish && prevOnStartTransitionFinish(transition, returnValue);
	};
	var resumedCache = createCursor(null);
	function peekCacheFromPool() {
		var cacheResumedFromPreviousRender = resumedCache.current;
		return null !== cacheResumedFromPreviousRender ? cacheResumedFromPreviousRender : workInProgressRoot.pooledCache;
	}
	function pushTransition(offscreenWorkInProgress, prevCachePool) {
		null === prevCachePool ? push(resumedCache, resumedCache.current) : push(resumedCache, prevCachePool.pool);
	}
	function getSuspendedCache() {
		var cacheFromPool = peekCacheFromPool();
		return null === cacheFromPool ? null : {
			parent: CacheContext._currentValue,
			pool: cacheFromPool
		};
	}
	var SuspenseException = Error(formatProdErrorMessage(460)), SuspenseyCommitException = Error(formatProdErrorMessage(474)), SuspenseActionException = Error(formatProdErrorMessage(542)), noopSuspenseyCommitThenable = { then: function() {} };
	function isThenableResolved(thenable) {
		thenable = thenable.status;
		return "fulfilled" === thenable || "rejected" === thenable;
	}
	function trackUsedThenable(thenableState, thenable, index) {
		index = thenableState[index];
		void 0 === index ? thenableState.push(thenable) : index !== thenable && (thenable.then(noop$1, noop$1), thenable = index);
		switch (thenable.status) {
			case "fulfilled": return thenable.value;
			case "rejected": throw thenableState = thenable.reason, checkIfUseWrappedInAsyncCatch(thenableState), thenableState;
			default:
				if ("string" === typeof thenable.status) thenable.then(noop$1, noop$1);
				else {
					thenableState = workInProgressRoot;
					if (null !== thenableState && 100 < thenableState.shellSuspendCounter) throw Error(formatProdErrorMessage(482));
					thenableState = thenable;
					thenableState.status = "pending";
					thenableState.then(function(fulfilledValue) {
						if ("pending" === thenable.status) {
							var fulfilledThenable = thenable;
							fulfilledThenable.status = "fulfilled";
							fulfilledThenable.value = fulfilledValue;
						}
					}, function(error) {
						if ("pending" === thenable.status) {
							var rejectedThenable = thenable;
							rejectedThenable.status = "rejected";
							rejectedThenable.reason = error;
						}
					});
				}
				switch (thenable.status) {
					case "fulfilled": return thenable.value;
					case "rejected": throw thenableState = thenable.reason, checkIfUseWrappedInAsyncCatch(thenableState), thenableState;
				}
				suspendedThenable = thenable;
				throw SuspenseException;
		}
	}
	function resolveLazy(lazyType) {
		try {
			var init = lazyType._init;
			return init(lazyType._payload);
		} catch (x) {
			if (null !== x && "object" === typeof x && "function" === typeof x.then) throw suspendedThenable = x, SuspenseException;
			throw x;
		}
	}
	var suspendedThenable = null;
	function getSuspendedThenable() {
		if (null === suspendedThenable) throw Error(formatProdErrorMessage(459));
		var thenable = suspendedThenable;
		suspendedThenable = null;
		return thenable;
	}
	function checkIfUseWrappedInAsyncCatch(rejectedReason) {
		if (rejectedReason === SuspenseException || rejectedReason === SuspenseActionException) throw Error(formatProdErrorMessage(483));
	}
	var thenableState$1 = null, thenableIndexCounter$1 = 0;
	function unwrapThenable(thenable) {
		var index = thenableIndexCounter$1;
		thenableIndexCounter$1 += 1;
		null === thenableState$1 && (thenableState$1 = []);
		return trackUsedThenable(thenableState$1, thenable, index);
	}
	function coerceRef(workInProgress, element) {
		element = element.props.ref;
		workInProgress.ref = void 0 !== element ? element : null;
	}
	function throwOnInvalidObjectTypeImpl(returnFiber, newChild) {
		if (newChild.$$typeof === REACT_LEGACY_ELEMENT_TYPE) throw Error(formatProdErrorMessage(525));
		returnFiber = Object.prototype.toString.call(newChild);
		throw Error(formatProdErrorMessage(31, "[object Object]" === returnFiber ? "object with keys {" + Object.keys(newChild).join(", ") + "}" : returnFiber));
	}
	function createChildReconciler(shouldTrackSideEffects) {
		function deleteChild(returnFiber, childToDelete) {
			if (shouldTrackSideEffects) {
				var deletions = returnFiber.deletions;
				null === deletions ? (returnFiber.deletions = [childToDelete], returnFiber.flags |= 16) : deletions.push(childToDelete);
			}
		}
		function deleteRemainingChildren(returnFiber, currentFirstChild) {
			if (!shouldTrackSideEffects) return null;
			for (; null !== currentFirstChild;) deleteChild(returnFiber, currentFirstChild), currentFirstChild = currentFirstChild.sibling;
			return null;
		}
		function mapRemainingChildren(currentFirstChild) {
			for (var existingChildren = /* @__PURE__ */ new Map(); null !== currentFirstChild;) null !== currentFirstChild.key ? existingChildren.set(currentFirstChild.key, currentFirstChild) : existingChildren.set(currentFirstChild.index, currentFirstChild), currentFirstChild = currentFirstChild.sibling;
			return existingChildren;
		}
		function useFiber(fiber, pendingProps) {
			fiber = createWorkInProgress(fiber, pendingProps);
			fiber.index = 0;
			fiber.sibling = null;
			return fiber;
		}
		function placeChild(newFiber, lastPlacedIndex, newIndex) {
			newFiber.index = newIndex;
			if (!shouldTrackSideEffects) return newFiber.flags |= 1048576, lastPlacedIndex;
			newIndex = newFiber.alternate;
			if (null !== newIndex) return newIndex = newIndex.index, newIndex < lastPlacedIndex ? (newFiber.flags |= 67108866, lastPlacedIndex) : newIndex;
			newFiber.flags |= 67108866;
			return lastPlacedIndex;
		}
		function placeSingleChild(newFiber) {
			shouldTrackSideEffects && null === newFiber.alternate && (newFiber.flags |= 67108866);
			return newFiber;
		}
		function updateTextNode(returnFiber, current, textContent, lanes) {
			if (null === current || 6 !== current.tag) return current = createFiberFromText(textContent, returnFiber.mode, lanes), current.return = returnFiber, current;
			current = useFiber(current, textContent);
			current.return = returnFiber;
			return current;
		}
		function updateElement(returnFiber, current, element, lanes) {
			var elementType = element.type;
			if (elementType === REACT_FRAGMENT_TYPE) return updateFragment(returnFiber, current, element.props.children, lanes, element.key);
			if (null !== current && (current.elementType === elementType || "object" === typeof elementType && null !== elementType && elementType.$$typeof === REACT_LAZY_TYPE && resolveLazy(elementType) === current.type)) return current = useFiber(current, element.props), coerceRef(current, element), current.return = returnFiber, current;
			current = createFiberFromTypeAndProps(element.type, element.key, element.props, null, returnFiber.mode, lanes);
			coerceRef(current, element);
			current.return = returnFiber;
			return current;
		}
		function updatePortal(returnFiber, current, portal, lanes) {
			if (null === current || 4 !== current.tag || current.stateNode.containerInfo !== portal.containerInfo || current.stateNode.implementation !== portal.implementation) return current = createFiberFromPortal(portal, returnFiber.mode, lanes), current.return = returnFiber, current;
			current = useFiber(current, portal.children || []);
			current.return = returnFiber;
			return current;
		}
		function updateFragment(returnFiber, current, fragment, lanes, key) {
			if (null === current || 7 !== current.tag) return current = createFiberFromFragment(fragment, returnFiber.mode, lanes, key), current.return = returnFiber, current;
			current = useFiber(current, fragment);
			current.return = returnFiber;
			return current;
		}
		function createChild(returnFiber, newChild, lanes) {
			if ("string" === typeof newChild && "" !== newChild || "number" === typeof newChild || "bigint" === typeof newChild) return newChild = createFiberFromText("" + newChild, returnFiber.mode, lanes), newChild.return = returnFiber, newChild;
			if ("object" === typeof newChild && null !== newChild) {
				switch (newChild.$$typeof) {
					case REACT_ELEMENT_TYPE: return lanes = createFiberFromTypeAndProps(newChild.type, newChild.key, newChild.props, null, returnFiber.mode, lanes), coerceRef(lanes, newChild), lanes.return = returnFiber, lanes;
					case REACT_PORTAL_TYPE: return newChild = createFiberFromPortal(newChild, returnFiber.mode, lanes), newChild.return = returnFiber, newChild;
					case REACT_LAZY_TYPE: return newChild = resolveLazy(newChild), createChild(returnFiber, newChild, lanes);
				}
				if (isArrayImpl(newChild) || getIteratorFn(newChild)) return newChild = createFiberFromFragment(newChild, returnFiber.mode, lanes, null), newChild.return = returnFiber, newChild;
				if ("function" === typeof newChild.then) return createChild(returnFiber, unwrapThenable(newChild), lanes);
				if (newChild.$$typeof === REACT_CONTEXT_TYPE) return createChild(returnFiber, readContextDuringReconciliation(returnFiber, newChild), lanes);
				throwOnInvalidObjectTypeImpl(returnFiber, newChild);
			}
			return null;
		}
		function updateSlot(returnFiber, oldFiber, newChild, lanes) {
			var key = null !== oldFiber ? oldFiber.key : null;
			if ("string" === typeof newChild && "" !== newChild || "number" === typeof newChild || "bigint" === typeof newChild) return null !== key ? null : updateTextNode(returnFiber, oldFiber, "" + newChild, lanes);
			if ("object" === typeof newChild && null !== newChild) {
				switch (newChild.$$typeof) {
					case REACT_ELEMENT_TYPE: return newChild.key === key ? updateElement(returnFiber, oldFiber, newChild, lanes) : null;
					case REACT_PORTAL_TYPE: return newChild.key === key ? updatePortal(returnFiber, oldFiber, newChild, lanes) : null;
					case REACT_LAZY_TYPE: return newChild = resolveLazy(newChild), updateSlot(returnFiber, oldFiber, newChild, lanes);
				}
				if (isArrayImpl(newChild) || getIteratorFn(newChild)) return null !== key ? null : updateFragment(returnFiber, oldFiber, newChild, lanes, null);
				if ("function" === typeof newChild.then) return updateSlot(returnFiber, oldFiber, unwrapThenable(newChild), lanes);
				if (newChild.$$typeof === REACT_CONTEXT_TYPE) return updateSlot(returnFiber, oldFiber, readContextDuringReconciliation(returnFiber, newChild), lanes);
				throwOnInvalidObjectTypeImpl(returnFiber, newChild);
			}
			return null;
		}
		function updateFromMap(existingChildren, returnFiber, newIdx, newChild, lanes) {
			if ("string" === typeof newChild && "" !== newChild || "number" === typeof newChild || "bigint" === typeof newChild) return existingChildren = existingChildren.get(newIdx) || null, updateTextNode(returnFiber, existingChildren, "" + newChild, lanes);
			if ("object" === typeof newChild && null !== newChild) {
				switch (newChild.$$typeof) {
					case REACT_ELEMENT_TYPE: return existingChildren = existingChildren.get(null === newChild.key ? newIdx : newChild.key) || null, updateElement(returnFiber, existingChildren, newChild, lanes);
					case REACT_PORTAL_TYPE: return existingChildren = existingChildren.get(null === newChild.key ? newIdx : newChild.key) || null, updatePortal(returnFiber, existingChildren, newChild, lanes);
					case REACT_LAZY_TYPE: return newChild = resolveLazy(newChild), updateFromMap(existingChildren, returnFiber, newIdx, newChild, lanes);
				}
				if (isArrayImpl(newChild) || getIteratorFn(newChild)) return existingChildren = existingChildren.get(newIdx) || null, updateFragment(returnFiber, existingChildren, newChild, lanes, null);
				if ("function" === typeof newChild.then) return updateFromMap(existingChildren, returnFiber, newIdx, unwrapThenable(newChild), lanes);
				if (newChild.$$typeof === REACT_CONTEXT_TYPE) return updateFromMap(existingChildren, returnFiber, newIdx, readContextDuringReconciliation(returnFiber, newChild), lanes);
				throwOnInvalidObjectTypeImpl(returnFiber, newChild);
			}
			return null;
		}
		function reconcileChildrenArray(returnFiber, currentFirstChild, newChildren, lanes) {
			for (var resultingFirstChild = null, previousNewFiber = null, oldFiber = currentFirstChild, newIdx = currentFirstChild = 0, nextOldFiber = null; null !== oldFiber && newIdx < newChildren.length; newIdx++) {
				oldFiber.index > newIdx ? (nextOldFiber = oldFiber, oldFiber = null) : nextOldFiber = oldFiber.sibling;
				var newFiber = updateSlot(returnFiber, oldFiber, newChildren[newIdx], lanes);
				if (null === newFiber) {
					null === oldFiber && (oldFiber = nextOldFiber);
					break;
				}
				shouldTrackSideEffects && oldFiber && null === newFiber.alternate && deleteChild(returnFiber, oldFiber);
				currentFirstChild = placeChild(newFiber, currentFirstChild, newIdx);
				null === previousNewFiber ? resultingFirstChild = newFiber : previousNewFiber.sibling = newFiber;
				previousNewFiber = newFiber;
				oldFiber = nextOldFiber;
			}
			if (newIdx === newChildren.length) return deleteRemainingChildren(returnFiber, oldFiber), isHydrating && pushTreeFork(returnFiber, newIdx), resultingFirstChild;
			if (null === oldFiber) {
				for (; newIdx < newChildren.length; newIdx++) oldFiber = createChild(returnFiber, newChildren[newIdx], lanes), null !== oldFiber && (currentFirstChild = placeChild(oldFiber, currentFirstChild, newIdx), null === previousNewFiber ? resultingFirstChild = oldFiber : previousNewFiber.sibling = oldFiber, previousNewFiber = oldFiber);
				isHydrating && pushTreeFork(returnFiber, newIdx);
				return resultingFirstChild;
			}
			for (oldFiber = mapRemainingChildren(oldFiber); newIdx < newChildren.length; newIdx++) nextOldFiber = updateFromMap(oldFiber, returnFiber, newIdx, newChildren[newIdx], lanes), null !== nextOldFiber && (shouldTrackSideEffects && null !== nextOldFiber.alternate && oldFiber.delete(null === nextOldFiber.key ? newIdx : nextOldFiber.key), currentFirstChild = placeChild(nextOldFiber, currentFirstChild, newIdx), null === previousNewFiber ? resultingFirstChild = nextOldFiber : previousNewFiber.sibling = nextOldFiber, previousNewFiber = nextOldFiber);
			shouldTrackSideEffects && oldFiber.forEach(function(child) {
				return deleteChild(returnFiber, child);
			});
			isHydrating && pushTreeFork(returnFiber, newIdx);
			return resultingFirstChild;
		}
		function reconcileChildrenIterator(returnFiber, currentFirstChild, newChildren, lanes) {
			if (null == newChildren) throw Error(formatProdErrorMessage(151));
			for (var resultingFirstChild = null, previousNewFiber = null, oldFiber = currentFirstChild, newIdx = currentFirstChild = 0, nextOldFiber = null, step = newChildren.next(); null !== oldFiber && !step.done; newIdx++, step = newChildren.next()) {
				oldFiber.index > newIdx ? (nextOldFiber = oldFiber, oldFiber = null) : nextOldFiber = oldFiber.sibling;
				var newFiber = updateSlot(returnFiber, oldFiber, step.value, lanes);
				if (null === newFiber) {
					null === oldFiber && (oldFiber = nextOldFiber);
					break;
				}
				shouldTrackSideEffects && oldFiber && null === newFiber.alternate && deleteChild(returnFiber, oldFiber);
				currentFirstChild = placeChild(newFiber, currentFirstChild, newIdx);
				null === previousNewFiber ? resultingFirstChild = newFiber : previousNewFiber.sibling = newFiber;
				previousNewFiber = newFiber;
				oldFiber = nextOldFiber;
			}
			if (step.done) return deleteRemainingChildren(returnFiber, oldFiber), isHydrating && pushTreeFork(returnFiber, newIdx), resultingFirstChild;
			if (null === oldFiber) {
				for (; !step.done; newIdx++, step = newChildren.next()) step = createChild(returnFiber, step.value, lanes), null !== step && (currentFirstChild = placeChild(step, currentFirstChild, newIdx), null === previousNewFiber ? resultingFirstChild = step : previousNewFiber.sibling = step, previousNewFiber = step);
				isHydrating && pushTreeFork(returnFiber, newIdx);
				return resultingFirstChild;
			}
			for (oldFiber = mapRemainingChildren(oldFiber); !step.done; newIdx++, step = newChildren.next()) step = updateFromMap(oldFiber, returnFiber, newIdx, step.value, lanes), null !== step && (shouldTrackSideEffects && null !== step.alternate && oldFiber.delete(null === step.key ? newIdx : step.key), currentFirstChild = placeChild(step, currentFirstChild, newIdx), null === previousNewFiber ? resultingFirstChild = step : previousNewFiber.sibling = step, previousNewFiber = step);
			shouldTrackSideEffects && oldFiber.forEach(function(child) {
				return deleteChild(returnFiber, child);
			});
			isHydrating && pushTreeFork(returnFiber, newIdx);
			return resultingFirstChild;
		}
		function reconcileChildFibersImpl(returnFiber, currentFirstChild, newChild, lanes) {
			"object" === typeof newChild && null !== newChild && newChild.type === REACT_FRAGMENT_TYPE && null === newChild.key && (newChild = newChild.props.children);
			if ("object" === typeof newChild && null !== newChild) {
				switch (newChild.$$typeof) {
					case REACT_ELEMENT_TYPE:
						a: {
							for (var key = newChild.key; null !== currentFirstChild;) {
								if (currentFirstChild.key === key) {
									key = newChild.type;
									if (key === REACT_FRAGMENT_TYPE) {
										if (7 === currentFirstChild.tag) {
											deleteRemainingChildren(returnFiber, currentFirstChild.sibling);
											lanes = useFiber(currentFirstChild, newChild.props.children);
											lanes.return = returnFiber;
											returnFiber = lanes;
											break a;
										}
									} else if (currentFirstChild.elementType === key || "object" === typeof key && null !== key && key.$$typeof === REACT_LAZY_TYPE && resolveLazy(key) === currentFirstChild.type) {
										deleteRemainingChildren(returnFiber, currentFirstChild.sibling);
										lanes = useFiber(currentFirstChild, newChild.props);
										coerceRef(lanes, newChild);
										lanes.return = returnFiber;
										returnFiber = lanes;
										break a;
									}
									deleteRemainingChildren(returnFiber, currentFirstChild);
									break;
								} else deleteChild(returnFiber, currentFirstChild);
								currentFirstChild = currentFirstChild.sibling;
							}
							newChild.type === REACT_FRAGMENT_TYPE ? (lanes = createFiberFromFragment(newChild.props.children, returnFiber.mode, lanes, newChild.key), lanes.return = returnFiber, returnFiber = lanes) : (lanes = createFiberFromTypeAndProps(newChild.type, newChild.key, newChild.props, null, returnFiber.mode, lanes), coerceRef(lanes, newChild), lanes.return = returnFiber, returnFiber = lanes);
						}
						return placeSingleChild(returnFiber);
					case REACT_PORTAL_TYPE:
						a: {
							for (key = newChild.key; null !== currentFirstChild;) {
								if (currentFirstChild.key === key) if (4 === currentFirstChild.tag && currentFirstChild.stateNode.containerInfo === newChild.containerInfo && currentFirstChild.stateNode.implementation === newChild.implementation) {
									deleteRemainingChildren(returnFiber, currentFirstChild.sibling);
									lanes = useFiber(currentFirstChild, newChild.children || []);
									lanes.return = returnFiber;
									returnFiber = lanes;
									break a;
								} else {
									deleteRemainingChildren(returnFiber, currentFirstChild);
									break;
								}
								else deleteChild(returnFiber, currentFirstChild);
								currentFirstChild = currentFirstChild.sibling;
							}
							lanes = createFiberFromPortal(newChild, returnFiber.mode, lanes);
							lanes.return = returnFiber;
							returnFiber = lanes;
						}
						return placeSingleChild(returnFiber);
					case REACT_LAZY_TYPE: return newChild = resolveLazy(newChild), reconcileChildFibersImpl(returnFiber, currentFirstChild, newChild, lanes);
				}
				if (isArrayImpl(newChild)) return reconcileChildrenArray(returnFiber, currentFirstChild, newChild, lanes);
				if (getIteratorFn(newChild)) {
					key = getIteratorFn(newChild);
					if ("function" !== typeof key) throw Error(formatProdErrorMessage(150));
					newChild = key.call(newChild);
					return reconcileChildrenIterator(returnFiber, currentFirstChild, newChild, lanes);
				}
				if ("function" === typeof newChild.then) return reconcileChildFibersImpl(returnFiber, currentFirstChild, unwrapThenable(newChild), lanes);
				if (newChild.$$typeof === REACT_CONTEXT_TYPE) return reconcileChildFibersImpl(returnFiber, currentFirstChild, readContextDuringReconciliation(returnFiber, newChild), lanes);
				throwOnInvalidObjectTypeImpl(returnFiber, newChild);
			}
			return "string" === typeof newChild && "" !== newChild || "number" === typeof newChild || "bigint" === typeof newChild ? (newChild = "" + newChild, null !== currentFirstChild && 6 === currentFirstChild.tag ? (deleteRemainingChildren(returnFiber, currentFirstChild.sibling), lanes = useFiber(currentFirstChild, newChild), lanes.return = returnFiber, returnFiber = lanes) : (deleteRemainingChildren(returnFiber, currentFirstChild), lanes = createFiberFromText(newChild, returnFiber.mode, lanes), lanes.return = returnFiber, returnFiber = lanes), placeSingleChild(returnFiber)) : deleteRemainingChildren(returnFiber, currentFirstChild);
		}
		return function(returnFiber, currentFirstChild, newChild, lanes) {
			try {
				thenableIndexCounter$1 = 0;
				var firstChildFiber = reconcileChildFibersImpl(returnFiber, currentFirstChild, newChild, lanes);
				thenableState$1 = null;
				return firstChildFiber;
			} catch (x) {
				if (x === SuspenseException || x === SuspenseActionException) throw x;
				var fiber = createFiberImplClass(29, x, null, returnFiber.mode);
				fiber.lanes = lanes;
				fiber.return = returnFiber;
				return fiber;
			}
		};
	}
	var reconcileChildFibers = createChildReconciler(!0), mountChildFibers = createChildReconciler(!1), hasForceUpdate = !1;
	function initializeUpdateQueue(fiber) {
		fiber.updateQueue = {
			baseState: fiber.memoizedState,
			firstBaseUpdate: null,
			lastBaseUpdate: null,
			shared: {
				pending: null,
				lanes: 0,
				hiddenCallbacks: null
			},
			callbacks: null
		};
	}
	function cloneUpdateQueue(current, workInProgress) {
		current = current.updateQueue;
		workInProgress.updateQueue === current && (workInProgress.updateQueue = {
			baseState: current.baseState,
			firstBaseUpdate: current.firstBaseUpdate,
			lastBaseUpdate: current.lastBaseUpdate,
			shared: current.shared,
			callbacks: null
		});
	}
	function createUpdate(lane) {
		return {
			lane,
			tag: 0,
			payload: null,
			callback: null,
			next: null
		};
	}
	function enqueueUpdate(fiber, update, lane) {
		var updateQueue = fiber.updateQueue;
		if (null === updateQueue) return null;
		updateQueue = updateQueue.shared;
		if (0 !== (executionContext & 2)) {
			var pending = updateQueue.pending;
			null === pending ? update.next = update : (update.next = pending.next, pending.next = update);
			updateQueue.pending = update;
			update = getRootForUpdatedFiber(fiber);
			markUpdateLaneFromFiberToRoot(fiber, null, lane);
			return update;
		}
		enqueueUpdate$1(fiber, updateQueue, update, lane);
		return getRootForUpdatedFiber(fiber);
	}
	function entangleTransitions(root, fiber, lane) {
		fiber = fiber.updateQueue;
		if (null !== fiber && (fiber = fiber.shared, 0 !== (lane & 4194048))) {
			var queueLanes = fiber.lanes;
			queueLanes &= root.pendingLanes;
			lane |= queueLanes;
			fiber.lanes = lane;
			markRootEntangled(root, lane);
		}
	}
	function enqueueCapturedUpdate(workInProgress, capturedUpdate) {
		var queue = workInProgress.updateQueue, current = workInProgress.alternate;
		if (null !== current && (current = current.updateQueue, queue === current)) {
			var newFirst = null, newLast = null;
			queue = queue.firstBaseUpdate;
			if (null !== queue) {
				do {
					var clone = {
						lane: queue.lane,
						tag: queue.tag,
						payload: queue.payload,
						callback: null,
						next: null
					};
					null === newLast ? newFirst = newLast = clone : newLast = newLast.next = clone;
					queue = queue.next;
				} while (null !== queue);
				null === newLast ? newFirst = newLast = capturedUpdate : newLast = newLast.next = capturedUpdate;
			} else newFirst = newLast = capturedUpdate;
			queue = {
				baseState: current.baseState,
				firstBaseUpdate: newFirst,
				lastBaseUpdate: newLast,
				shared: current.shared,
				callbacks: current.callbacks
			};
			workInProgress.updateQueue = queue;
			return;
		}
		workInProgress = queue.lastBaseUpdate;
		null === workInProgress ? queue.firstBaseUpdate = capturedUpdate : workInProgress.next = capturedUpdate;
		queue.lastBaseUpdate = capturedUpdate;
	}
	var didReadFromEntangledAsyncAction = !1;
	function suspendIfUpdateReadFromEntangledAsyncAction() {
		if (didReadFromEntangledAsyncAction) {
			var entangledActionThenable = currentEntangledActionThenable;
			if (null !== entangledActionThenable) throw entangledActionThenable;
		}
	}
	function processUpdateQueue(workInProgress$jscomp$0, props, instance$jscomp$0, renderLanes) {
		didReadFromEntangledAsyncAction = !1;
		var queue = workInProgress$jscomp$0.updateQueue;
		hasForceUpdate = !1;
		var firstBaseUpdate = queue.firstBaseUpdate, lastBaseUpdate = queue.lastBaseUpdate, pendingQueue = queue.shared.pending;
		if (null !== pendingQueue) {
			queue.shared.pending = null;
			var lastPendingUpdate = pendingQueue, firstPendingUpdate = lastPendingUpdate.next;
			lastPendingUpdate.next = null;
			null === lastBaseUpdate ? firstBaseUpdate = firstPendingUpdate : lastBaseUpdate.next = firstPendingUpdate;
			lastBaseUpdate = lastPendingUpdate;
			var current = workInProgress$jscomp$0.alternate;
			null !== current && (current = current.updateQueue, pendingQueue = current.lastBaseUpdate, pendingQueue !== lastBaseUpdate && (null === pendingQueue ? current.firstBaseUpdate = firstPendingUpdate : pendingQueue.next = firstPendingUpdate, current.lastBaseUpdate = lastPendingUpdate));
		}
		if (null !== firstBaseUpdate) {
			var newState = queue.baseState;
			lastBaseUpdate = 0;
			current = firstPendingUpdate = lastPendingUpdate = null;
			pendingQueue = firstBaseUpdate;
			do {
				var updateLane = pendingQueue.lane & -536870913, isHiddenUpdate = updateLane !== pendingQueue.lane;
				if (isHiddenUpdate ? (workInProgressRootRenderLanes & updateLane) === updateLane : (renderLanes & updateLane) === updateLane) {
					0 !== updateLane && updateLane === currentEntangledLane && (didReadFromEntangledAsyncAction = !0);
					null !== current && (current = current.next = {
						lane: 0,
						tag: pendingQueue.tag,
						payload: pendingQueue.payload,
						callback: null,
						next: null
					});
					a: {
						var workInProgress = workInProgress$jscomp$0, update = pendingQueue;
						updateLane = props;
						var instance = instance$jscomp$0;
						switch (update.tag) {
							case 1:
								workInProgress = update.payload;
								if ("function" === typeof workInProgress) {
									newState = workInProgress.call(instance, newState, updateLane);
									break a;
								}
								newState = workInProgress;
								break a;
							case 3: workInProgress.flags = workInProgress.flags & -65537 | 128;
							case 0:
								workInProgress = update.payload;
								updateLane = "function" === typeof workInProgress ? workInProgress.call(instance, newState, updateLane) : workInProgress;
								if (null === updateLane || void 0 === updateLane) break a;
								newState = assign({}, newState, updateLane);
								break a;
							case 2: hasForceUpdate = !0;
						}
					}
					updateLane = pendingQueue.callback;
					null !== updateLane && (workInProgress$jscomp$0.flags |= 64, isHiddenUpdate && (workInProgress$jscomp$0.flags |= 8192), isHiddenUpdate = queue.callbacks, null === isHiddenUpdate ? queue.callbacks = [updateLane] : isHiddenUpdate.push(updateLane));
				} else isHiddenUpdate = {
					lane: updateLane,
					tag: pendingQueue.tag,
					payload: pendingQueue.payload,
					callback: pendingQueue.callback,
					next: null
				}, null === current ? (firstPendingUpdate = current = isHiddenUpdate, lastPendingUpdate = newState) : current = current.next = isHiddenUpdate, lastBaseUpdate |= updateLane;
				pendingQueue = pendingQueue.next;
				if (null === pendingQueue) if (pendingQueue = queue.shared.pending, null === pendingQueue) break;
				else isHiddenUpdate = pendingQueue, pendingQueue = isHiddenUpdate.next, isHiddenUpdate.next = null, queue.lastBaseUpdate = isHiddenUpdate, queue.shared.pending = null;
			} while (1);
			null === current && (lastPendingUpdate = newState);
			queue.baseState = lastPendingUpdate;
			queue.firstBaseUpdate = firstPendingUpdate;
			queue.lastBaseUpdate = current;
			null === firstBaseUpdate && (queue.shared.lanes = 0);
			workInProgressRootSkippedLanes |= lastBaseUpdate;
			workInProgress$jscomp$0.lanes = lastBaseUpdate;
			workInProgress$jscomp$0.memoizedState = newState;
		}
	}
	function callCallback(callback, context) {
		if ("function" !== typeof callback) throw Error(formatProdErrorMessage(191, callback));
		callback.call(context);
	}
	function commitCallbacks(updateQueue, context) {
		var callbacks = updateQueue.callbacks;
		if (null !== callbacks) for (updateQueue.callbacks = null, updateQueue = 0; updateQueue < callbacks.length; updateQueue++) callCallback(callbacks[updateQueue], context);
	}
	var currentTreeHiddenStackCursor = createCursor(null), prevEntangledRenderLanesCursor = createCursor(0);
	function pushHiddenContext(fiber, context) {
		fiber = entangledRenderLanes;
		push(prevEntangledRenderLanesCursor, fiber);
		push(currentTreeHiddenStackCursor, context);
		entangledRenderLanes = fiber | context.baseLanes;
	}
	function reuseHiddenContextOnStack() {
		push(prevEntangledRenderLanesCursor, entangledRenderLanes);
		push(currentTreeHiddenStackCursor, currentTreeHiddenStackCursor.current);
	}
	function popHiddenContext() {
		entangledRenderLanes = prevEntangledRenderLanesCursor.current;
		pop(currentTreeHiddenStackCursor);
		pop(prevEntangledRenderLanesCursor);
	}
	var suspenseHandlerStackCursor = createCursor(null), shellBoundary = null;
	function pushPrimaryTreeSuspenseHandler(handler) {
		var current = handler.alternate;
		push(suspenseStackCursor, suspenseStackCursor.current & 1);
		push(suspenseHandlerStackCursor, handler);
		null === shellBoundary && (null === current || null !== currentTreeHiddenStackCursor.current ? shellBoundary = handler : null !== current.memoizedState && (shellBoundary = handler));
	}
	function pushDehydratedActivitySuspenseHandler(fiber) {
		push(suspenseStackCursor, suspenseStackCursor.current);
		push(suspenseHandlerStackCursor, fiber);
		null === shellBoundary && (shellBoundary = fiber);
	}
	function pushOffscreenSuspenseHandler(fiber) {
		22 === fiber.tag ? (push(suspenseStackCursor, suspenseStackCursor.current), push(suspenseHandlerStackCursor, fiber), null === shellBoundary && (shellBoundary = fiber)) : reuseSuspenseHandlerOnStack(fiber);
	}
	function reuseSuspenseHandlerOnStack() {
		push(suspenseStackCursor, suspenseStackCursor.current);
		push(suspenseHandlerStackCursor, suspenseHandlerStackCursor.current);
	}
	function popSuspenseHandler(fiber) {
		pop(suspenseHandlerStackCursor);
		shellBoundary === fiber && (shellBoundary = null);
		pop(suspenseStackCursor);
	}
	var suspenseStackCursor = createCursor(0);
	function findFirstSuspended(row) {
		for (var node = row; null !== node;) {
			if (13 === node.tag) {
				var state = node.memoizedState;
				if (null !== state && (state = state.dehydrated, null === state || isSuspenseInstancePending(state) || isSuspenseInstanceFallback(state))) return node;
			} else if (19 === node.tag && ("forwards" === node.memoizedProps.revealOrder || "backwards" === node.memoizedProps.revealOrder || "unstable_legacy-backwards" === node.memoizedProps.revealOrder || "together" === node.memoizedProps.revealOrder)) {
				if (0 !== (node.flags & 128)) return node;
			} else if (null !== node.child) {
				node.child.return = node;
				node = node.child;
				continue;
			}
			if (node === row) break;
			for (; null === node.sibling;) {
				if (null === node.return || node.return === row) return null;
				node = node.return;
			}
			node.sibling.return = node.return;
			node = node.sibling;
		}
		return null;
	}
	var renderLanes = 0, currentlyRenderingFiber = null, currentHook = null, workInProgressHook = null, didScheduleRenderPhaseUpdate = !1, didScheduleRenderPhaseUpdateDuringThisPass = !1, shouldDoubleInvokeUserFnsInHooksDEV = !1, localIdCounter = 0, thenableIndexCounter = 0, thenableState = null, globalClientIdCounter = 0;
	function throwInvalidHookError() {
		throw Error(formatProdErrorMessage(321));
	}
	function areHookInputsEqual(nextDeps, prevDeps) {
		if (null === prevDeps) return !1;
		for (var i = 0; i < prevDeps.length && i < nextDeps.length; i++) if (!objectIs(nextDeps[i], prevDeps[i])) return !1;
		return !0;
	}
	function renderWithHooks(current, workInProgress, Component, props, secondArg, nextRenderLanes) {
		renderLanes = nextRenderLanes;
		currentlyRenderingFiber = workInProgress;
		workInProgress.memoizedState = null;
		workInProgress.updateQueue = null;
		workInProgress.lanes = 0;
		ReactSharedInternals.H = null === current || null === current.memoizedState ? HooksDispatcherOnMount : HooksDispatcherOnUpdate;
		shouldDoubleInvokeUserFnsInHooksDEV = !1;
		nextRenderLanes = Component(props, secondArg);
		shouldDoubleInvokeUserFnsInHooksDEV = !1;
		didScheduleRenderPhaseUpdateDuringThisPass && (nextRenderLanes = renderWithHooksAgain(workInProgress, Component, props, secondArg));
		finishRenderingHooks(current);
		return nextRenderLanes;
	}
	function finishRenderingHooks(current) {
		ReactSharedInternals.H = ContextOnlyDispatcher;
		var didRenderTooFewHooks = null !== currentHook && null !== currentHook.next;
		renderLanes = 0;
		workInProgressHook = currentHook = currentlyRenderingFiber = null;
		didScheduleRenderPhaseUpdate = !1;
		thenableIndexCounter = 0;
		thenableState = null;
		if (didRenderTooFewHooks) throw Error(formatProdErrorMessage(300));
		null === current || didReceiveUpdate || (current = current.dependencies, null !== current && checkIfContextChanged(current) && (didReceiveUpdate = !0));
	}
	function renderWithHooksAgain(workInProgress, Component, props, secondArg) {
		currentlyRenderingFiber = workInProgress;
		var numberOfReRenders = 0;
		do {
			didScheduleRenderPhaseUpdateDuringThisPass && (thenableState = null);
			thenableIndexCounter = 0;
			didScheduleRenderPhaseUpdateDuringThisPass = !1;
			if (25 <= numberOfReRenders) throw Error(formatProdErrorMessage(301));
			numberOfReRenders += 1;
			workInProgressHook = currentHook = null;
			if (null != workInProgress.updateQueue) {
				var children = workInProgress.updateQueue;
				children.lastEffect = null;
				children.events = null;
				children.stores = null;
				null != children.memoCache && (children.memoCache.index = 0);
			}
			ReactSharedInternals.H = HooksDispatcherOnRerender;
			children = Component(props, secondArg);
		} while (didScheduleRenderPhaseUpdateDuringThisPass);
		return children;
	}
	function TransitionAwareHostComponent() {
		var dispatcher = ReactSharedInternals.H, maybeThenable = dispatcher.useState()[0];
		maybeThenable = "function" === typeof maybeThenable.then ? useThenable(maybeThenable) : maybeThenable;
		dispatcher = dispatcher.useState()[0];
		(null !== currentHook ? currentHook.memoizedState : null) !== dispatcher && (currentlyRenderingFiber.flags |= 1024);
		return maybeThenable;
	}
	function checkDidRenderIdHook() {
		var didRenderIdHook = 0 !== localIdCounter;
		localIdCounter = 0;
		return didRenderIdHook;
	}
	function bailoutHooks(current, workInProgress, lanes) {
		workInProgress.updateQueue = current.updateQueue;
		workInProgress.flags &= -2053;
		current.lanes &= ~lanes;
	}
	function resetHooksOnUnwind(workInProgress) {
		if (didScheduleRenderPhaseUpdate) {
			for (workInProgress = workInProgress.memoizedState; null !== workInProgress;) {
				var queue = workInProgress.queue;
				null !== queue && (queue.pending = null);
				workInProgress = workInProgress.next;
			}
			didScheduleRenderPhaseUpdate = !1;
		}
		renderLanes = 0;
		workInProgressHook = currentHook = currentlyRenderingFiber = null;
		didScheduleRenderPhaseUpdateDuringThisPass = !1;
		thenableIndexCounter = localIdCounter = 0;
		thenableState = null;
	}
	function mountWorkInProgressHook() {
		var hook = {
			memoizedState: null,
			baseState: null,
			baseQueue: null,
			queue: null,
			next: null
		};
		null === workInProgressHook ? currentlyRenderingFiber.memoizedState = workInProgressHook = hook : workInProgressHook = workInProgressHook.next = hook;
		return workInProgressHook;
	}
	function updateWorkInProgressHook() {
		if (null === currentHook) {
			var nextCurrentHook = currentlyRenderingFiber.alternate;
			nextCurrentHook = null !== nextCurrentHook ? nextCurrentHook.memoizedState : null;
		} else nextCurrentHook = currentHook.next;
		var nextWorkInProgressHook = null === workInProgressHook ? currentlyRenderingFiber.memoizedState : workInProgressHook.next;
		if (null !== nextWorkInProgressHook) workInProgressHook = nextWorkInProgressHook, currentHook = nextCurrentHook;
		else {
			if (null === nextCurrentHook) {
				if (null === currentlyRenderingFiber.alternate) throw Error(formatProdErrorMessage(467));
				throw Error(formatProdErrorMessage(310));
			}
			currentHook = nextCurrentHook;
			nextCurrentHook = {
				memoizedState: currentHook.memoizedState,
				baseState: currentHook.baseState,
				baseQueue: currentHook.baseQueue,
				queue: currentHook.queue,
				next: null
			};
			null === workInProgressHook ? currentlyRenderingFiber.memoizedState = workInProgressHook = nextCurrentHook : workInProgressHook = workInProgressHook.next = nextCurrentHook;
		}
		return workInProgressHook;
	}
	function createFunctionComponentUpdateQueue() {
		return {
			lastEffect: null,
			events: null,
			stores: null,
			memoCache: null
		};
	}
	function useThenable(thenable) {
		var index = thenableIndexCounter;
		thenableIndexCounter += 1;
		null === thenableState && (thenableState = []);
		thenable = trackUsedThenable(thenableState, thenable, index);
		index = currentlyRenderingFiber;
		null === (null === workInProgressHook ? index.memoizedState : workInProgressHook.next) && (index = index.alternate, ReactSharedInternals.H = null === index || null === index.memoizedState ? HooksDispatcherOnMount : HooksDispatcherOnUpdate);
		return thenable;
	}
	function use(usable) {
		if (null !== usable && "object" === typeof usable) {
			if ("function" === typeof usable.then) return useThenable(usable);
			if (usable.$$typeof === REACT_CONTEXT_TYPE) return readContext(usable);
		}
		throw Error(formatProdErrorMessage(438, String(usable)));
	}
	function useMemoCache(size) {
		var memoCache = null, updateQueue = currentlyRenderingFiber.updateQueue;
		null !== updateQueue && (memoCache = updateQueue.memoCache);
		if (null == memoCache) {
			var current = currentlyRenderingFiber.alternate;
			null !== current && (current = current.updateQueue, null !== current && (current = current.memoCache, null != current && (memoCache = {
				data: current.data.map(function(array) {
					return array.slice();
				}),
				index: 0
			})));
		}
		memoCache ??= {
			data: [],
			index: 0
		};
		null === updateQueue && (updateQueue = createFunctionComponentUpdateQueue(), currentlyRenderingFiber.updateQueue = updateQueue);
		updateQueue.memoCache = memoCache;
		updateQueue = memoCache.data[memoCache.index];
		if (void 0 === updateQueue) for (updateQueue = memoCache.data[memoCache.index] = Array(size), current = 0; current < size; current++) updateQueue[current] = REACT_MEMO_CACHE_SENTINEL;
		memoCache.index++;
		return updateQueue;
	}
	function basicStateReducer(state, action) {
		return "function" === typeof action ? action(state) : action;
	}
	function updateReducer(reducer) {
		return updateReducerImpl(updateWorkInProgressHook(), currentHook, reducer);
	}
	function updateReducerImpl(hook, current, reducer) {
		var queue = hook.queue;
		if (null === queue) throw Error(formatProdErrorMessage(311));
		queue.lastRenderedReducer = reducer;
		var baseQueue = hook.baseQueue, pendingQueue = queue.pending;
		if (null !== pendingQueue) {
			if (null !== baseQueue) {
				var baseFirst = baseQueue.next;
				baseQueue.next = pendingQueue.next;
				pendingQueue.next = baseFirst;
			}
			current.baseQueue = baseQueue = pendingQueue;
			queue.pending = null;
		}
		pendingQueue = hook.baseState;
		if (null === baseQueue) hook.memoizedState = pendingQueue;
		else {
			current = baseQueue.next;
			var newBaseQueueFirst = baseFirst = null, newBaseQueueLast = null, update = current, didReadFromEntangledAsyncAction$60 = !1;
			do {
				var updateLane = update.lane & -536870913;
				if (updateLane !== update.lane ? (workInProgressRootRenderLanes & updateLane) === updateLane : (renderLanes & updateLane) === updateLane) {
					var revertLane = update.revertLane;
					if (0 === revertLane) null !== newBaseQueueLast && (newBaseQueueLast = newBaseQueueLast.next = {
						lane: 0,
						revertLane: 0,
						gesture: null,
						action: update.action,
						hasEagerState: update.hasEagerState,
						eagerState: update.eagerState,
						next: null
					}), updateLane === currentEntangledLane && (didReadFromEntangledAsyncAction$60 = !0);
					else if ((renderLanes & revertLane) === revertLane) {
						update = update.next;
						revertLane === currentEntangledLane && (didReadFromEntangledAsyncAction$60 = !0);
						continue;
					} else updateLane = {
						lane: 0,
						revertLane: update.revertLane,
						gesture: null,
						action: update.action,
						hasEagerState: update.hasEagerState,
						eagerState: update.eagerState,
						next: null
					}, null === newBaseQueueLast ? (newBaseQueueFirst = newBaseQueueLast = updateLane, baseFirst = pendingQueue) : newBaseQueueLast = newBaseQueueLast.next = updateLane, currentlyRenderingFiber.lanes |= revertLane, workInProgressRootSkippedLanes |= revertLane;
					updateLane = update.action;
					shouldDoubleInvokeUserFnsInHooksDEV && reducer(pendingQueue, updateLane);
					pendingQueue = update.hasEagerState ? update.eagerState : reducer(pendingQueue, updateLane);
				} else revertLane = {
					lane: updateLane,
					revertLane: update.revertLane,
					gesture: update.gesture,
					action: update.action,
					hasEagerState: update.hasEagerState,
					eagerState: update.eagerState,
					next: null
				}, null === newBaseQueueLast ? (newBaseQueueFirst = newBaseQueueLast = revertLane, baseFirst = pendingQueue) : newBaseQueueLast = newBaseQueueLast.next = revertLane, currentlyRenderingFiber.lanes |= updateLane, workInProgressRootSkippedLanes |= updateLane;
				update = update.next;
			} while (null !== update && update !== current);
			null === newBaseQueueLast ? baseFirst = pendingQueue : newBaseQueueLast.next = newBaseQueueFirst;
			if (!objectIs(pendingQueue, hook.memoizedState) && (didReceiveUpdate = !0, didReadFromEntangledAsyncAction$60 && (reducer = currentEntangledActionThenable, null !== reducer))) throw reducer;
			hook.memoizedState = pendingQueue;
			hook.baseState = baseFirst;
			hook.baseQueue = newBaseQueueLast;
			queue.lastRenderedState = pendingQueue;
		}
		null === baseQueue && (queue.lanes = 0);
		return [hook.memoizedState, queue.dispatch];
	}
	function rerenderReducer(reducer) {
		var hook = updateWorkInProgressHook(), queue = hook.queue;
		if (null === queue) throw Error(formatProdErrorMessage(311));
		queue.lastRenderedReducer = reducer;
		var dispatch = queue.dispatch, lastRenderPhaseUpdate = queue.pending, newState = hook.memoizedState;
		if (null !== lastRenderPhaseUpdate) {
			queue.pending = null;
			var update = lastRenderPhaseUpdate = lastRenderPhaseUpdate.next;
			do
				newState = reducer(newState, update.action), update = update.next;
			while (update !== lastRenderPhaseUpdate);
			objectIs(newState, hook.memoizedState) || (didReceiveUpdate = !0);
			hook.memoizedState = newState;
			null === hook.baseQueue && (hook.baseState = newState);
			queue.lastRenderedState = newState;
		}
		return [newState, dispatch];
	}
	function updateSyncExternalStore(subscribe, getSnapshot, getServerSnapshot) {
		var fiber = currentlyRenderingFiber, hook = updateWorkInProgressHook(), isHydrating$jscomp$0 = isHydrating;
		if (isHydrating$jscomp$0) {
			if (void 0 === getServerSnapshot) throw Error(formatProdErrorMessage(407));
			getServerSnapshot = getServerSnapshot();
		} else getServerSnapshot = getSnapshot();
		var snapshotChanged = !objectIs((currentHook || hook).memoizedState, getServerSnapshot);
		snapshotChanged && (hook.memoizedState = getServerSnapshot, didReceiveUpdate = !0);
		hook = hook.queue;
		updateEffect(subscribeToStore.bind(null, fiber, hook, subscribe), [subscribe]);
		if (hook.getSnapshot !== getSnapshot || snapshotChanged || null !== workInProgressHook && workInProgressHook.memoizedState.tag & 1) {
			fiber.flags |= 2048;
			pushSimpleEffect(9, { destroy: void 0 }, updateStoreInstance.bind(null, fiber, hook, getServerSnapshot, getSnapshot), null);
			if (null === workInProgressRoot) throw Error(formatProdErrorMessage(349));
			isHydrating$jscomp$0 || 0 !== (renderLanes & 127) || pushStoreConsistencyCheck(fiber, getSnapshot, getServerSnapshot);
		}
		return getServerSnapshot;
	}
	function pushStoreConsistencyCheck(fiber, getSnapshot, renderedSnapshot) {
		fiber.flags |= 16384;
		fiber = {
			getSnapshot,
			value: renderedSnapshot
		};
		getSnapshot = currentlyRenderingFiber.updateQueue;
		null === getSnapshot ? (getSnapshot = createFunctionComponentUpdateQueue(), currentlyRenderingFiber.updateQueue = getSnapshot, getSnapshot.stores = [fiber]) : (renderedSnapshot = getSnapshot.stores, null === renderedSnapshot ? getSnapshot.stores = [fiber] : renderedSnapshot.push(fiber));
	}
	function updateStoreInstance(fiber, inst, nextSnapshot, getSnapshot) {
		inst.value = nextSnapshot;
		inst.getSnapshot = getSnapshot;
		checkIfSnapshotChanged(inst) && forceStoreRerender(fiber);
	}
	function subscribeToStore(fiber, inst, subscribe) {
		return subscribe(function() {
			checkIfSnapshotChanged(inst) && forceStoreRerender(fiber);
		});
	}
	function checkIfSnapshotChanged(inst) {
		var latestGetSnapshot = inst.getSnapshot;
		inst = inst.value;
		try {
			var nextValue = latestGetSnapshot();
			return !objectIs(inst, nextValue);
		} catch (error) {
			return !0;
		}
	}
	function forceStoreRerender(fiber) {
		var root = enqueueConcurrentRenderForLane(fiber, 2);
		null !== root && scheduleUpdateOnFiber(root, fiber, 2);
	}
	function mountStateImpl(initialState) {
		var hook = mountWorkInProgressHook();
		if ("function" === typeof initialState) {
			var initialStateInitializer = initialState;
			initialState = initialStateInitializer();
			if (shouldDoubleInvokeUserFnsInHooksDEV) {
				setIsStrictModeForDevtools(!0);
				try {
					initialStateInitializer();
				} finally {
					setIsStrictModeForDevtools(!1);
				}
			}
		}
		hook.memoizedState = hook.baseState = initialState;
		hook.queue = {
			pending: null,
			lanes: 0,
			dispatch: null,
			lastRenderedReducer: basicStateReducer,
			lastRenderedState: initialState
		};
		return hook;
	}
	function updateOptimisticImpl(hook, current, passthrough, reducer) {
		hook.baseState = passthrough;
		return updateReducerImpl(hook, currentHook, "function" === typeof reducer ? reducer : basicStateReducer);
	}
	function dispatchActionState(fiber, actionQueue, setPendingState, setState, payload) {
		if (isRenderPhaseUpdate(fiber)) throw Error(formatProdErrorMessage(485));
		fiber = actionQueue.action;
		if (null !== fiber) {
			var actionNode = {
				payload,
				action: fiber,
				next: null,
				isTransition: !0,
				status: "pending",
				value: null,
				reason: null,
				listeners: [],
				then: function(listener) {
					actionNode.listeners.push(listener);
				}
			};
			null !== ReactSharedInternals.T ? setPendingState(!0) : actionNode.isTransition = !1;
			setState(actionNode);
			setPendingState = actionQueue.pending;
			null === setPendingState ? (actionNode.next = actionQueue.pending = actionNode, runActionStateAction(actionQueue, actionNode)) : (actionNode.next = setPendingState.next, actionQueue.pending = setPendingState.next = actionNode);
		}
	}
	function runActionStateAction(actionQueue, node) {
		var action = node.action, payload = node.payload, prevState = actionQueue.state;
		if (node.isTransition) {
			var prevTransition = ReactSharedInternals.T, currentTransition = {};
			ReactSharedInternals.T = currentTransition;
			try {
				var returnValue = action(prevState, payload), onStartTransitionFinish = ReactSharedInternals.S;
				null !== onStartTransitionFinish && onStartTransitionFinish(currentTransition, returnValue);
				handleActionReturnValue(actionQueue, node, returnValue);
			} catch (error) {
				onActionError(actionQueue, node, error);
			} finally {
				null !== prevTransition && null !== currentTransition.types && (prevTransition.types = currentTransition.types), ReactSharedInternals.T = prevTransition;
			}
		} else try {
			prevTransition = action(prevState, payload), handleActionReturnValue(actionQueue, node, prevTransition);
		} catch (error$66) {
			onActionError(actionQueue, node, error$66);
		}
	}
	function handleActionReturnValue(actionQueue, node, returnValue) {
		null !== returnValue && "object" === typeof returnValue && "function" === typeof returnValue.then ? returnValue.then(function(nextState) {
			onActionSuccess(actionQueue, node, nextState);
		}, function(error) {
			return onActionError(actionQueue, node, error);
		}) : onActionSuccess(actionQueue, node, returnValue);
	}
	function onActionSuccess(actionQueue, actionNode, nextState) {
		actionNode.status = "fulfilled";
		actionNode.value = nextState;
		notifyActionListeners(actionNode);
		actionQueue.state = nextState;
		actionNode = actionQueue.pending;
		null !== actionNode && (nextState = actionNode.next, nextState === actionNode ? actionQueue.pending = null : (nextState = nextState.next, actionNode.next = nextState, runActionStateAction(actionQueue, nextState)));
	}
	function onActionError(actionQueue, actionNode, error) {
		var last = actionQueue.pending;
		actionQueue.pending = null;
		if (null !== last) {
			last = last.next;
			do
				actionNode.status = "rejected", actionNode.reason = error, notifyActionListeners(actionNode), actionNode = actionNode.next;
			while (actionNode !== last);
		}
		actionQueue.action = null;
	}
	function notifyActionListeners(actionNode) {
		actionNode = actionNode.listeners;
		for (var i = 0; i < actionNode.length; i++) (0, actionNode[i])();
	}
	function actionStateReducer(oldState, newState) {
		return newState;
	}
	function mountActionState(action, initialStateProp) {
		if (isHydrating) {
			var ssrFormState = workInProgressRoot.formState;
			if (null !== ssrFormState) {
				a: {
					var JSCompiler_inline_result = currentlyRenderingFiber;
					if (isHydrating) {
						if (nextHydratableInstance) {
							b: {
								var JSCompiler_inline_result$jscomp$0 = nextHydratableInstance;
								for (var inRootOrSingleton = rootOrSingletonContext; 8 !== JSCompiler_inline_result$jscomp$0.nodeType;) {
									if (!inRootOrSingleton) {
										JSCompiler_inline_result$jscomp$0 = null;
										break b;
									}
									JSCompiler_inline_result$jscomp$0 = getNextHydratable(JSCompiler_inline_result$jscomp$0.nextSibling);
									if (null === JSCompiler_inline_result$jscomp$0) {
										JSCompiler_inline_result$jscomp$0 = null;
										break b;
									}
								}
								inRootOrSingleton = JSCompiler_inline_result$jscomp$0.data;
								JSCompiler_inline_result$jscomp$0 = "F!" === inRootOrSingleton || "F" === inRootOrSingleton ? JSCompiler_inline_result$jscomp$0 : null;
							}
							if (JSCompiler_inline_result$jscomp$0) {
								nextHydratableInstance = getNextHydratable(JSCompiler_inline_result$jscomp$0.nextSibling);
								JSCompiler_inline_result = "F!" === JSCompiler_inline_result$jscomp$0.data;
								break a;
							}
						}
						throwOnHydrationMismatch(JSCompiler_inline_result);
					}
					JSCompiler_inline_result = !1;
				}
				JSCompiler_inline_result && (initialStateProp = ssrFormState[0]);
			}
		}
		ssrFormState = mountWorkInProgressHook();
		ssrFormState.memoizedState = ssrFormState.baseState = initialStateProp;
		JSCompiler_inline_result = {
			pending: null,
			lanes: 0,
			dispatch: null,
			lastRenderedReducer: actionStateReducer,
			lastRenderedState: initialStateProp
		};
		ssrFormState.queue = JSCompiler_inline_result;
		ssrFormState = dispatchSetState.bind(null, currentlyRenderingFiber, JSCompiler_inline_result);
		JSCompiler_inline_result.dispatch = ssrFormState;
		JSCompiler_inline_result = mountStateImpl(!1);
		inRootOrSingleton = dispatchOptimisticSetState.bind(null, currentlyRenderingFiber, !1, JSCompiler_inline_result.queue);
		JSCompiler_inline_result = mountWorkInProgressHook();
		JSCompiler_inline_result$jscomp$0 = {
			state: initialStateProp,
			dispatch: null,
			action,
			pending: null
		};
		JSCompiler_inline_result.queue = JSCompiler_inline_result$jscomp$0;
		ssrFormState = dispatchActionState.bind(null, currentlyRenderingFiber, JSCompiler_inline_result$jscomp$0, inRootOrSingleton, ssrFormState);
		JSCompiler_inline_result$jscomp$0.dispatch = ssrFormState;
		JSCompiler_inline_result.memoizedState = action;
		return [
			initialStateProp,
			ssrFormState,
			!1
		];
	}
	function updateActionState(action) {
		return updateActionStateImpl(updateWorkInProgressHook(), currentHook, action);
	}
	function updateActionStateImpl(stateHook, currentStateHook, action) {
		currentStateHook = updateReducerImpl(stateHook, currentStateHook, actionStateReducer)[0];
		stateHook = updateReducer(basicStateReducer)[0];
		if ("object" === typeof currentStateHook && null !== currentStateHook && "function" === typeof currentStateHook.then) try {
			var state = useThenable(currentStateHook);
		} catch (x) {
			if (x === SuspenseException) throw SuspenseActionException;
			throw x;
		}
		else state = currentStateHook;
		currentStateHook = updateWorkInProgressHook();
		var actionQueue = currentStateHook.queue, dispatch = actionQueue.dispatch;
		action !== currentStateHook.memoizedState && (currentlyRenderingFiber.flags |= 2048, pushSimpleEffect(9, { destroy: void 0 }, actionStateActionEffect.bind(null, actionQueue, action), null));
		return [
			state,
			dispatch,
			stateHook
		];
	}
	function actionStateActionEffect(actionQueue, action) {
		actionQueue.action = action;
	}
	function rerenderActionState(action) {
		var stateHook = updateWorkInProgressHook(), currentStateHook = currentHook;
		if (null !== currentStateHook) return updateActionStateImpl(stateHook, currentStateHook, action);
		updateWorkInProgressHook();
		stateHook = stateHook.memoizedState;
		currentStateHook = updateWorkInProgressHook();
		var dispatch = currentStateHook.queue.dispatch;
		currentStateHook.memoizedState = action;
		return [
			stateHook,
			dispatch,
			!1
		];
	}
	function pushSimpleEffect(tag, inst, create, deps) {
		tag = {
			tag,
			create,
			deps,
			inst,
			next: null
		};
		inst = currentlyRenderingFiber.updateQueue;
		null === inst && (inst = createFunctionComponentUpdateQueue(), currentlyRenderingFiber.updateQueue = inst);
		create = inst.lastEffect;
		null === create ? inst.lastEffect = tag.next = tag : (deps = create.next, create.next = tag, tag.next = deps, inst.lastEffect = tag);
		return tag;
	}
	function updateRef() {
		return updateWorkInProgressHook().memoizedState;
	}
	function mountEffectImpl(fiberFlags, hookFlags, create, deps) {
		var hook = mountWorkInProgressHook();
		currentlyRenderingFiber.flags |= fiberFlags;
		hook.memoizedState = pushSimpleEffect(1 | hookFlags, { destroy: void 0 }, create, void 0 === deps ? null : deps);
	}
	function updateEffectImpl(fiberFlags, hookFlags, create, deps) {
		var hook = updateWorkInProgressHook();
		deps = void 0 === deps ? null : deps;
		var inst = hook.memoizedState.inst;
		null !== currentHook && null !== deps && areHookInputsEqual(deps, currentHook.memoizedState.deps) ? hook.memoizedState = pushSimpleEffect(hookFlags, inst, create, deps) : (currentlyRenderingFiber.flags |= fiberFlags, hook.memoizedState = pushSimpleEffect(1 | hookFlags, inst, create, deps));
	}
	function mountEffect(create, deps) {
		mountEffectImpl(8390656, 8, create, deps);
	}
	function updateEffect(create, deps) {
		updateEffectImpl(2048, 8, create, deps);
	}
	function useEffectEventImpl(payload) {
		currentlyRenderingFiber.flags |= 4;
		var componentUpdateQueue = currentlyRenderingFiber.updateQueue;
		if (null === componentUpdateQueue) componentUpdateQueue = createFunctionComponentUpdateQueue(), currentlyRenderingFiber.updateQueue = componentUpdateQueue, componentUpdateQueue.events = [payload];
		else {
			var events = componentUpdateQueue.events;
			null === events ? componentUpdateQueue.events = [payload] : events.push(payload);
		}
	}
	function updateEvent(callback) {
		var ref = updateWorkInProgressHook().memoizedState;
		useEffectEventImpl({
			ref,
			nextImpl: callback
		});
		return function() {
			if (0 !== (executionContext & 2)) throw Error(formatProdErrorMessage(440));
			return ref.impl.apply(void 0, arguments);
		};
	}
	function updateInsertionEffect(create, deps) {
		return updateEffectImpl(4, 2, create, deps);
	}
	function updateLayoutEffect(create, deps) {
		return updateEffectImpl(4, 4, create, deps);
	}
	function imperativeHandleEffect(create, ref) {
		if ("function" === typeof ref) {
			create = create();
			var refCleanup = ref(create);
			return function() {
				"function" === typeof refCleanup ? refCleanup() : ref(null);
			};
		}
		if (null !== ref && void 0 !== ref) return create = create(), ref.current = create, function() {
			ref.current = null;
		};
	}
	function updateImperativeHandle(ref, create, deps) {
		deps = null !== deps && void 0 !== deps ? deps.concat([ref]) : null;
		updateEffectImpl(4, 4, imperativeHandleEffect.bind(null, create, ref), deps);
	}
	function mountDebugValue() {}
	function updateCallback(callback, deps) {
		var hook = updateWorkInProgressHook();
		deps = void 0 === deps ? null : deps;
		var prevState = hook.memoizedState;
		if (null !== deps && areHookInputsEqual(deps, prevState[1])) return prevState[0];
		hook.memoizedState = [callback, deps];
		return callback;
	}
	function updateMemo(nextCreate, deps) {
		var hook = updateWorkInProgressHook();
		deps = void 0 === deps ? null : deps;
		var prevState = hook.memoizedState;
		if (null !== deps && areHookInputsEqual(deps, prevState[1])) return prevState[0];
		prevState = nextCreate();
		if (shouldDoubleInvokeUserFnsInHooksDEV) {
			setIsStrictModeForDevtools(!0);
			try {
				nextCreate();
			} finally {
				setIsStrictModeForDevtools(!1);
			}
		}
		hook.memoizedState = [prevState, deps];
		return prevState;
	}
	function mountDeferredValueImpl(hook, value, initialValue) {
		if (void 0 === initialValue || 0 !== (renderLanes & 1073741824) && 0 === (workInProgressRootRenderLanes & 261930)) return hook.memoizedState = value;
		hook.memoizedState = initialValue;
		hook = requestDeferredLane();
		currentlyRenderingFiber.lanes |= hook;
		workInProgressRootSkippedLanes |= hook;
		return initialValue;
	}
	function updateDeferredValueImpl(hook, prevValue, value, initialValue) {
		if (objectIs(value, prevValue)) return value;
		if (null !== currentTreeHiddenStackCursor.current) return hook = mountDeferredValueImpl(hook, value, initialValue), objectIs(hook, prevValue) || (didReceiveUpdate = !0), hook;
		if (0 === (renderLanes & 42) || 0 !== (renderLanes & 1073741824) && 0 === (workInProgressRootRenderLanes & 261930)) return didReceiveUpdate = !0, hook.memoizedState = value;
		hook = requestDeferredLane();
		currentlyRenderingFiber.lanes |= hook;
		workInProgressRootSkippedLanes |= hook;
		return prevValue;
	}
	function startTransition(fiber, queue, pendingState, finishedState, callback) {
		var previousPriority = ReactDOMSharedInternals.p;
		ReactDOMSharedInternals.p = 0 !== previousPriority && 8 > previousPriority ? previousPriority : 8;
		var prevTransition = ReactSharedInternals.T, currentTransition = {};
		ReactSharedInternals.T = currentTransition;
		dispatchOptimisticSetState(fiber, !1, queue, pendingState);
		try {
			var returnValue = callback(), onStartTransitionFinish = ReactSharedInternals.S;
			null !== onStartTransitionFinish && onStartTransitionFinish(currentTransition, returnValue);
			if (null !== returnValue && "object" === typeof returnValue && "function" === typeof returnValue.then) dispatchSetStateInternal(fiber, queue, chainThenableValue(returnValue, finishedState), requestUpdateLane(fiber));
			else dispatchSetStateInternal(fiber, queue, finishedState, requestUpdateLane(fiber));
		} catch (error) {
			dispatchSetStateInternal(fiber, queue, {
				then: function() {},
				status: "rejected",
				reason: error
			}, requestUpdateLane());
		} finally {
			ReactDOMSharedInternals.p = previousPriority, null !== prevTransition && null !== currentTransition.types && (prevTransition.types = currentTransition.types), ReactSharedInternals.T = prevTransition;
		}
	}
	function noop() {}
	function startHostTransition(formFiber, pendingState, action, formData) {
		if (5 !== formFiber.tag) throw Error(formatProdErrorMessage(476));
		var queue = ensureFormComponentIsStateful(formFiber).queue;
		startTransition(formFiber, queue, pendingState, sharedNotPendingObject, null === action ? noop : function() {
			requestFormReset$1(formFiber);
			return action(formData);
		});
	}
	function ensureFormComponentIsStateful(formFiber) {
		var existingStateHook = formFiber.memoizedState;
		if (null !== existingStateHook) return existingStateHook;
		existingStateHook = {
			memoizedState: sharedNotPendingObject,
			baseState: sharedNotPendingObject,
			baseQueue: null,
			queue: {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: basicStateReducer,
				lastRenderedState: sharedNotPendingObject
			},
			next: null
		};
		var initialResetState = {};
		existingStateHook.next = {
			memoizedState: initialResetState,
			baseState: initialResetState,
			baseQueue: null,
			queue: {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: basicStateReducer,
				lastRenderedState: initialResetState
			},
			next: null
		};
		formFiber.memoizedState = existingStateHook;
		formFiber = formFiber.alternate;
		null !== formFiber && (formFiber.memoizedState = existingStateHook);
		return existingStateHook;
	}
	function requestFormReset$1(formFiber) {
		var stateHook = ensureFormComponentIsStateful(formFiber);
		null === stateHook.next && (stateHook = formFiber.alternate.memoizedState);
		dispatchSetStateInternal(formFiber, stateHook.next.queue, {}, requestUpdateLane());
	}
	function useHostTransitionStatus() {
		return readContext(HostTransitionContext);
	}
	function updateId() {
		return updateWorkInProgressHook().memoizedState;
	}
	function updateRefresh() {
		return updateWorkInProgressHook().memoizedState;
	}
	function refreshCache(fiber) {
		for (var provider = fiber.return; null !== provider;) {
			switch (provider.tag) {
				case 24:
				case 3:
					var lane = requestUpdateLane();
					fiber = createUpdate(lane);
					var root$69 = enqueueUpdate(provider, fiber, lane);
					null !== root$69 && (scheduleUpdateOnFiber(root$69, provider, lane), entangleTransitions(root$69, provider, lane));
					provider = { cache: createCache() };
					fiber.payload = provider;
					return;
			}
			provider = provider.return;
		}
	}
	function dispatchReducerAction(fiber, queue, action) {
		var lane = requestUpdateLane();
		action = {
			lane,
			revertLane: 0,
			gesture: null,
			action,
			hasEagerState: !1,
			eagerState: null,
			next: null
		};
		isRenderPhaseUpdate(fiber) ? enqueueRenderPhaseUpdate(queue, action) : (action = enqueueConcurrentHookUpdate(fiber, queue, action, lane), null !== action && (scheduleUpdateOnFiber(action, fiber, lane), entangleTransitionUpdate(action, queue, lane)));
	}
	function dispatchSetState(fiber, queue, action) {
		dispatchSetStateInternal(fiber, queue, action, requestUpdateLane());
	}
	function dispatchSetStateInternal(fiber, queue, action, lane) {
		var update = {
			lane,
			revertLane: 0,
			gesture: null,
			action,
			hasEagerState: !1,
			eagerState: null,
			next: null
		};
		if (isRenderPhaseUpdate(fiber)) enqueueRenderPhaseUpdate(queue, update);
		else {
			var alternate = fiber.alternate;
			if (0 === fiber.lanes && (null === alternate || 0 === alternate.lanes) && (alternate = queue.lastRenderedReducer, null !== alternate)) try {
				var currentState = queue.lastRenderedState, eagerState = alternate(currentState, action);
				update.hasEagerState = !0;
				update.eagerState = eagerState;
				if (objectIs(eagerState, currentState)) return enqueueUpdate$1(fiber, queue, update, 0), null === workInProgressRoot && finishQueueingConcurrentUpdates(), !1;
			} catch (error) {}
			action = enqueueConcurrentHookUpdate(fiber, queue, update, lane);
			if (null !== action) return scheduleUpdateOnFiber(action, fiber, lane), entangleTransitionUpdate(action, queue, lane), !0;
		}
		return !1;
	}
	function dispatchOptimisticSetState(fiber, throwIfDuringRender, queue, action) {
		action = {
			lane: 2,
			revertLane: requestTransitionLane(),
			gesture: null,
			action,
			hasEagerState: !1,
			eagerState: null,
			next: null
		};
		if (isRenderPhaseUpdate(fiber)) {
			if (throwIfDuringRender) throw Error(formatProdErrorMessage(479));
		} else throwIfDuringRender = enqueueConcurrentHookUpdate(fiber, queue, action, 2), null !== throwIfDuringRender && scheduleUpdateOnFiber(throwIfDuringRender, fiber, 2);
	}
	function isRenderPhaseUpdate(fiber) {
		var alternate = fiber.alternate;
		return fiber === currentlyRenderingFiber || null !== alternate && alternate === currentlyRenderingFiber;
	}
	function enqueueRenderPhaseUpdate(queue, update) {
		didScheduleRenderPhaseUpdateDuringThisPass = didScheduleRenderPhaseUpdate = !0;
		var pending = queue.pending;
		null === pending ? update.next = update : (update.next = pending.next, pending.next = update);
		queue.pending = update;
	}
	function entangleTransitionUpdate(root, queue, lane) {
		if (0 !== (lane & 4194048)) {
			var queueLanes = queue.lanes;
			queueLanes &= root.pendingLanes;
			lane |= queueLanes;
			queue.lanes = lane;
			markRootEntangled(root, lane);
		}
	}
	var ContextOnlyDispatcher = {
		readContext,
		use,
		useCallback: throwInvalidHookError,
		useContext: throwInvalidHookError,
		useEffect: throwInvalidHookError,
		useImperativeHandle: throwInvalidHookError,
		useLayoutEffect: throwInvalidHookError,
		useInsertionEffect: throwInvalidHookError,
		useMemo: throwInvalidHookError,
		useReducer: throwInvalidHookError,
		useRef: throwInvalidHookError,
		useState: throwInvalidHookError,
		useDebugValue: throwInvalidHookError,
		useDeferredValue: throwInvalidHookError,
		useTransition: throwInvalidHookError,
		useSyncExternalStore: throwInvalidHookError,
		useId: throwInvalidHookError,
		useHostTransitionStatus: throwInvalidHookError,
		useFormState: throwInvalidHookError,
		useActionState: throwInvalidHookError,
		useOptimistic: throwInvalidHookError,
		useMemoCache: throwInvalidHookError,
		useCacheRefresh: throwInvalidHookError
	};
	ContextOnlyDispatcher.useEffectEvent = throwInvalidHookError;
	var HooksDispatcherOnMount = {
		readContext,
		use,
		useCallback: function(callback, deps) {
			mountWorkInProgressHook().memoizedState = [callback, void 0 === deps ? null : deps];
			return callback;
		},
		useContext: readContext,
		useEffect: mountEffect,
		useImperativeHandle: function(ref, create, deps) {
			deps = null !== deps && void 0 !== deps ? deps.concat([ref]) : null;
			mountEffectImpl(4194308, 4, imperativeHandleEffect.bind(null, create, ref), deps);
		},
		useLayoutEffect: function(create, deps) {
			return mountEffectImpl(4194308, 4, create, deps);
		},
		useInsertionEffect: function(create, deps) {
			mountEffectImpl(4, 2, create, deps);
		},
		useMemo: function(nextCreate, deps) {
			var hook = mountWorkInProgressHook();
			deps = void 0 === deps ? null : deps;
			var nextValue = nextCreate();
			if (shouldDoubleInvokeUserFnsInHooksDEV) {
				setIsStrictModeForDevtools(!0);
				try {
					nextCreate();
				} finally {
					setIsStrictModeForDevtools(!1);
				}
			}
			hook.memoizedState = [nextValue, deps];
			return nextValue;
		},
		useReducer: function(reducer, initialArg, init) {
			var hook = mountWorkInProgressHook();
			if (void 0 !== init) {
				var initialState = init(initialArg);
				if (shouldDoubleInvokeUserFnsInHooksDEV) {
					setIsStrictModeForDevtools(!0);
					try {
						init(initialArg);
					} finally {
						setIsStrictModeForDevtools(!1);
					}
				}
			} else initialState = initialArg;
			hook.memoizedState = hook.baseState = initialState;
			reducer = {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: reducer,
				lastRenderedState: initialState
			};
			hook.queue = reducer;
			reducer = reducer.dispatch = dispatchReducerAction.bind(null, currentlyRenderingFiber, reducer);
			return [hook.memoizedState, reducer];
		},
		useRef: function(initialValue) {
			var hook = mountWorkInProgressHook();
			initialValue = { current: initialValue };
			return hook.memoizedState = initialValue;
		},
		useState: function(initialState) {
			initialState = mountStateImpl(initialState);
			var queue = initialState.queue, dispatch = dispatchSetState.bind(null, currentlyRenderingFiber, queue);
			queue.dispatch = dispatch;
			return [initialState.memoizedState, dispatch];
		},
		useDebugValue: mountDebugValue,
		useDeferredValue: function(value, initialValue) {
			return mountDeferredValueImpl(mountWorkInProgressHook(), value, initialValue);
		},
		useTransition: function() {
			var stateHook = mountStateImpl(!1);
			stateHook = startTransition.bind(null, currentlyRenderingFiber, stateHook.queue, !0, !1);
			mountWorkInProgressHook().memoizedState = stateHook;
			return [!1, stateHook];
		},
		useSyncExternalStore: function(subscribe, getSnapshot, getServerSnapshot) {
			var fiber = currentlyRenderingFiber, hook = mountWorkInProgressHook();
			if (isHydrating) {
				if (void 0 === getServerSnapshot) throw Error(formatProdErrorMessage(407));
				getServerSnapshot = getServerSnapshot();
			} else {
				getServerSnapshot = getSnapshot();
				if (null === workInProgressRoot) throw Error(formatProdErrorMessage(349));
				0 !== (workInProgressRootRenderLanes & 127) || pushStoreConsistencyCheck(fiber, getSnapshot, getServerSnapshot);
			}
			hook.memoizedState = getServerSnapshot;
			var inst = {
				value: getServerSnapshot,
				getSnapshot
			};
			hook.queue = inst;
			mountEffect(subscribeToStore.bind(null, fiber, inst, subscribe), [subscribe]);
			fiber.flags |= 2048;
			pushSimpleEffect(9, { destroy: void 0 }, updateStoreInstance.bind(null, fiber, inst, getServerSnapshot, getSnapshot), null);
			return getServerSnapshot;
		},
		useId: function() {
			var hook = mountWorkInProgressHook(), identifierPrefix = workInProgressRoot.identifierPrefix;
			if (isHydrating) {
				var JSCompiler_inline_result = treeContextOverflow;
				var idWithLeadingBit = treeContextId;
				JSCompiler_inline_result = (idWithLeadingBit & ~(1 << 32 - clz32(idWithLeadingBit) - 1)).toString(32) + JSCompiler_inline_result;
				identifierPrefix = "_" + identifierPrefix + "R_" + JSCompiler_inline_result;
				JSCompiler_inline_result = localIdCounter++;
				0 < JSCompiler_inline_result && (identifierPrefix += "H" + JSCompiler_inline_result.toString(32));
				identifierPrefix += "_";
			} else JSCompiler_inline_result = globalClientIdCounter++, identifierPrefix = "_" + identifierPrefix + "r_" + JSCompiler_inline_result.toString(32) + "_";
			return hook.memoizedState = identifierPrefix;
		},
		useHostTransitionStatus,
		useFormState: mountActionState,
		useActionState: mountActionState,
		useOptimistic: function(passthrough) {
			var hook = mountWorkInProgressHook();
			hook.memoizedState = hook.baseState = passthrough;
			var queue = {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: null,
				lastRenderedState: null
			};
			hook.queue = queue;
			hook = dispatchOptimisticSetState.bind(null, currentlyRenderingFiber, !0, queue);
			queue.dispatch = hook;
			return [passthrough, hook];
		},
		useMemoCache,
		useCacheRefresh: function() {
			return mountWorkInProgressHook().memoizedState = refreshCache.bind(null, currentlyRenderingFiber);
		},
		useEffectEvent: function(callback) {
			var hook = mountWorkInProgressHook(), ref = { impl: callback };
			hook.memoizedState = ref;
			return function() {
				if (0 !== (executionContext & 2)) throw Error(formatProdErrorMessage(440));
				return ref.impl.apply(void 0, arguments);
			};
		}
	}, HooksDispatcherOnUpdate = {
		readContext,
		use,
		useCallback: updateCallback,
		useContext: readContext,
		useEffect: updateEffect,
		useImperativeHandle: updateImperativeHandle,
		useInsertionEffect: updateInsertionEffect,
		useLayoutEffect: updateLayoutEffect,
		useMemo: updateMemo,
		useReducer: updateReducer,
		useRef: updateRef,
		useState: function() {
			return updateReducer(basicStateReducer);
		},
		useDebugValue: mountDebugValue,
		useDeferredValue: function(value, initialValue) {
			return updateDeferredValueImpl(updateWorkInProgressHook(), currentHook.memoizedState, value, initialValue);
		},
		useTransition: function() {
			var booleanOrThenable = updateReducer(basicStateReducer)[0], start = updateWorkInProgressHook().memoizedState;
			return ["boolean" === typeof booleanOrThenable ? booleanOrThenable : useThenable(booleanOrThenable), start];
		},
		useSyncExternalStore: updateSyncExternalStore,
		useId: updateId,
		useHostTransitionStatus,
		useFormState: updateActionState,
		useActionState: updateActionState,
		useOptimistic: function(passthrough, reducer) {
			return updateOptimisticImpl(updateWorkInProgressHook(), currentHook, passthrough, reducer);
		},
		useMemoCache,
		useCacheRefresh: updateRefresh
	};
	HooksDispatcherOnUpdate.useEffectEvent = updateEvent;
	var HooksDispatcherOnRerender = {
		readContext,
		use,
		useCallback: updateCallback,
		useContext: readContext,
		useEffect: updateEffect,
		useImperativeHandle: updateImperativeHandle,
		useInsertionEffect: updateInsertionEffect,
		useLayoutEffect: updateLayoutEffect,
		useMemo: updateMemo,
		useReducer: rerenderReducer,
		useRef: updateRef,
		useState: function() {
			return rerenderReducer(basicStateReducer);
		},
		useDebugValue: mountDebugValue,
		useDeferredValue: function(value, initialValue) {
			var hook = updateWorkInProgressHook();
			return null === currentHook ? mountDeferredValueImpl(hook, value, initialValue) : updateDeferredValueImpl(hook, currentHook.memoizedState, value, initialValue);
		},
		useTransition: function() {
			var booleanOrThenable = rerenderReducer(basicStateReducer)[0], start = updateWorkInProgressHook().memoizedState;
			return ["boolean" === typeof booleanOrThenable ? booleanOrThenable : useThenable(booleanOrThenable), start];
		},
		useSyncExternalStore: updateSyncExternalStore,
		useId: updateId,
		useHostTransitionStatus,
		useFormState: rerenderActionState,
		useActionState: rerenderActionState,
		useOptimistic: function(passthrough, reducer) {
			var hook = updateWorkInProgressHook();
			if (null !== currentHook) return updateOptimisticImpl(hook, currentHook, passthrough, reducer);
			hook.baseState = passthrough;
			return [passthrough, hook.queue.dispatch];
		},
		useMemoCache,
		useCacheRefresh: updateRefresh
	};
	HooksDispatcherOnRerender.useEffectEvent = updateEvent;
	function applyDerivedStateFromProps(workInProgress, ctor, getDerivedStateFromProps, nextProps) {
		ctor = workInProgress.memoizedState;
		getDerivedStateFromProps = getDerivedStateFromProps(nextProps, ctor);
		getDerivedStateFromProps = null === getDerivedStateFromProps || void 0 === getDerivedStateFromProps ? ctor : assign({}, ctor, getDerivedStateFromProps);
		workInProgress.memoizedState = getDerivedStateFromProps;
		0 === workInProgress.lanes && (workInProgress.updateQueue.baseState = getDerivedStateFromProps);
	}
	var classComponentUpdater = {
		enqueueSetState: function(inst, payload, callback) {
			inst = inst._reactInternals;
			var lane = requestUpdateLane(), update = createUpdate(lane);
			update.payload = payload;
			void 0 !== callback && null !== callback && (update.callback = callback);
			payload = enqueueUpdate(inst, update, lane);
			null !== payload && (scheduleUpdateOnFiber(payload, inst, lane), entangleTransitions(payload, inst, lane));
		},
		enqueueReplaceState: function(inst, payload, callback) {
			inst = inst._reactInternals;
			var lane = requestUpdateLane(), update = createUpdate(lane);
			update.tag = 1;
			update.payload = payload;
			void 0 !== callback && null !== callback && (update.callback = callback);
			payload = enqueueUpdate(inst, update, lane);
			null !== payload && (scheduleUpdateOnFiber(payload, inst, lane), entangleTransitions(payload, inst, lane));
		},
		enqueueForceUpdate: function(inst, callback) {
			inst = inst._reactInternals;
			var lane = requestUpdateLane(), update = createUpdate(lane);
			update.tag = 2;
			void 0 !== callback && null !== callback && (update.callback = callback);
			callback = enqueueUpdate(inst, update, lane);
			null !== callback && (scheduleUpdateOnFiber(callback, inst, lane), entangleTransitions(callback, inst, lane));
		}
	};
	function checkShouldComponentUpdate(workInProgress, ctor, oldProps, newProps, oldState, newState, nextContext) {
		workInProgress = workInProgress.stateNode;
		return "function" === typeof workInProgress.shouldComponentUpdate ? workInProgress.shouldComponentUpdate(newProps, newState, nextContext) : ctor.prototype && ctor.prototype.isPureReactComponent ? !shallowEqual(oldProps, newProps) || !shallowEqual(oldState, newState) : !0;
	}
	function callComponentWillReceiveProps(workInProgress, instance, newProps, nextContext) {
		workInProgress = instance.state;
		"function" === typeof instance.componentWillReceiveProps && instance.componentWillReceiveProps(newProps, nextContext);
		"function" === typeof instance.UNSAFE_componentWillReceiveProps && instance.UNSAFE_componentWillReceiveProps(newProps, nextContext);
		instance.state !== workInProgress && classComponentUpdater.enqueueReplaceState(instance, instance.state, null);
	}
	function resolveClassComponentProps(Component, baseProps) {
		var newProps = baseProps;
		if ("ref" in baseProps) {
			newProps = {};
			for (var propName in baseProps) "ref" !== propName && (newProps[propName] = baseProps[propName]);
		}
		if (Component = Component.defaultProps) {
			newProps === baseProps && (newProps = assign({}, newProps));
			for (var propName$73 in Component) void 0 === newProps[propName$73] && (newProps[propName$73] = Component[propName$73]);
		}
		return newProps;
	}
	function defaultOnUncaughtError(error) {
		reportGlobalError(error);
	}
	function defaultOnCaughtError(error) {
		console.error(error);
	}
	function defaultOnRecoverableError(error) {
		reportGlobalError(error);
	}
	function logUncaughtError(root, errorInfo) {
		try {
			var onUncaughtError = root.onUncaughtError;
			onUncaughtError(errorInfo.value, { componentStack: errorInfo.stack });
		} catch (e$74) {
			setTimeout(function() {
				throw e$74;
			});
		}
	}
	function logCaughtError(root, boundary, errorInfo) {
		try {
			var onCaughtError = root.onCaughtError;
			onCaughtError(errorInfo.value, {
				componentStack: errorInfo.stack,
				errorBoundary: 1 === boundary.tag ? boundary.stateNode : null
			});
		} catch (e$75) {
			setTimeout(function() {
				throw e$75;
			});
		}
	}
	function createRootErrorUpdate(root, errorInfo, lane) {
		lane = createUpdate(lane);
		lane.tag = 3;
		lane.payload = { element: null };
		lane.callback = function() {
			logUncaughtError(root, errorInfo);
		};
		return lane;
	}
	function createClassErrorUpdate(lane) {
		lane = createUpdate(lane);
		lane.tag = 3;
		return lane;
	}
	function initializeClassErrorUpdate(update, root, fiber, errorInfo) {
		var getDerivedStateFromError = fiber.type.getDerivedStateFromError;
		if ("function" === typeof getDerivedStateFromError) {
			var error = errorInfo.value;
			update.payload = function() {
				return getDerivedStateFromError(error);
			};
			update.callback = function() {
				logCaughtError(root, fiber, errorInfo);
			};
		}
		var inst = fiber.stateNode;
		null !== inst && "function" === typeof inst.componentDidCatch && (update.callback = function() {
			logCaughtError(root, fiber, errorInfo);
			"function" !== typeof getDerivedStateFromError && (null === legacyErrorBoundariesThatAlreadyFailed ? legacyErrorBoundariesThatAlreadyFailed = new Set([this]) : legacyErrorBoundariesThatAlreadyFailed.add(this));
			var stack = errorInfo.stack;
			this.componentDidCatch(errorInfo.value, { componentStack: null !== stack ? stack : "" });
		});
	}
	function throwException(root, returnFiber, sourceFiber, value, rootRenderLanes) {
		sourceFiber.flags |= 32768;
		if (null !== value && "object" === typeof value && "function" === typeof value.then) {
			returnFiber = sourceFiber.alternate;
			null !== returnFiber && propagateParentContextChanges(returnFiber, sourceFiber, rootRenderLanes, !0);
			sourceFiber = suspenseHandlerStackCursor.current;
			if (null !== sourceFiber) {
				switch (sourceFiber.tag) {
					case 31:
					case 13: return null === shellBoundary ? renderDidSuspendDelayIfPossible() : null === sourceFiber.alternate && 0 === workInProgressRootExitStatus && (workInProgressRootExitStatus = 3), sourceFiber.flags &= -257, sourceFiber.flags |= 65536, sourceFiber.lanes = rootRenderLanes, value === noopSuspenseyCommitThenable ? sourceFiber.flags |= 16384 : (returnFiber = sourceFiber.updateQueue, null === returnFiber ? sourceFiber.updateQueue = new Set([value]) : returnFiber.add(value), attachPingListener(root, value, rootRenderLanes)), !1;
					case 22: return sourceFiber.flags |= 65536, value === noopSuspenseyCommitThenable ? sourceFiber.flags |= 16384 : (returnFiber = sourceFiber.updateQueue, null === returnFiber ? (returnFiber = {
						transitions: null,
						markerInstances: null,
						retryQueue: new Set([value])
					}, sourceFiber.updateQueue = returnFiber) : (sourceFiber = returnFiber.retryQueue, null === sourceFiber ? returnFiber.retryQueue = new Set([value]) : sourceFiber.add(value)), attachPingListener(root, value, rootRenderLanes)), !1;
				}
				throw Error(formatProdErrorMessage(435, sourceFiber.tag));
			}
			attachPingListener(root, value, rootRenderLanes);
			renderDidSuspendDelayIfPossible();
			return !1;
		}
		if (isHydrating) return returnFiber = suspenseHandlerStackCursor.current, null !== returnFiber ? (0 === (returnFiber.flags & 65536) && (returnFiber.flags |= 256), returnFiber.flags |= 65536, returnFiber.lanes = rootRenderLanes, value !== HydrationMismatchException && (root = Error(formatProdErrorMessage(422), { cause: value }), queueHydrationError(createCapturedValueAtFiber(root, sourceFiber)))) : (value !== HydrationMismatchException && (returnFiber = Error(formatProdErrorMessage(423), { cause: value }), queueHydrationError(createCapturedValueAtFiber(returnFiber, sourceFiber))), root = root.current.alternate, root.flags |= 65536, rootRenderLanes &= -rootRenderLanes, root.lanes |= rootRenderLanes, value = createCapturedValueAtFiber(value, sourceFiber), rootRenderLanes = createRootErrorUpdate(root.stateNode, value, rootRenderLanes), enqueueCapturedUpdate(root, rootRenderLanes), 4 !== workInProgressRootExitStatus && (workInProgressRootExitStatus = 2)), !1;
		var wrapperError = Error(formatProdErrorMessage(520), { cause: value });
		wrapperError = createCapturedValueAtFiber(wrapperError, sourceFiber);
		null === workInProgressRootConcurrentErrors ? workInProgressRootConcurrentErrors = [wrapperError] : workInProgressRootConcurrentErrors.push(wrapperError);
		4 !== workInProgressRootExitStatus && (workInProgressRootExitStatus = 2);
		if (null === returnFiber) return !0;
		value = createCapturedValueAtFiber(value, sourceFiber);
		sourceFiber = returnFiber;
		do {
			switch (sourceFiber.tag) {
				case 3: return sourceFiber.flags |= 65536, root = rootRenderLanes & -rootRenderLanes, sourceFiber.lanes |= root, root = createRootErrorUpdate(sourceFiber.stateNode, value, root), enqueueCapturedUpdate(sourceFiber, root), !1;
				case 1: if (returnFiber = sourceFiber.type, wrapperError = sourceFiber.stateNode, 0 === (sourceFiber.flags & 128) && ("function" === typeof returnFiber.getDerivedStateFromError || null !== wrapperError && "function" === typeof wrapperError.componentDidCatch && (null === legacyErrorBoundariesThatAlreadyFailed || !legacyErrorBoundariesThatAlreadyFailed.has(wrapperError)))) return sourceFiber.flags |= 65536, rootRenderLanes &= -rootRenderLanes, sourceFiber.lanes |= rootRenderLanes, rootRenderLanes = createClassErrorUpdate(rootRenderLanes), initializeClassErrorUpdate(rootRenderLanes, root, sourceFiber, value), enqueueCapturedUpdate(sourceFiber, rootRenderLanes), !1;
			}
			sourceFiber = sourceFiber.return;
		} while (null !== sourceFiber);
		return !1;
	}
	var SelectiveHydrationException = Error(formatProdErrorMessage(461)), didReceiveUpdate = !1;
	function reconcileChildren(current, workInProgress, nextChildren, renderLanes) {
		workInProgress.child = null === current ? mountChildFibers(workInProgress, null, nextChildren, renderLanes) : reconcileChildFibers(workInProgress, current.child, nextChildren, renderLanes);
	}
	function updateForwardRef(current, workInProgress, Component, nextProps, renderLanes) {
		Component = Component.render;
		var ref = workInProgress.ref;
		if ("ref" in nextProps) {
			var propsWithoutRef = {};
			for (var key in nextProps) "ref" !== key && (propsWithoutRef[key] = nextProps[key]);
		} else propsWithoutRef = nextProps;
		prepareToReadContext(workInProgress);
		nextProps = renderWithHooks(current, workInProgress, Component, propsWithoutRef, ref, renderLanes);
		key = checkDidRenderIdHook();
		if (null !== current && !didReceiveUpdate) return bailoutHooks(current, workInProgress, renderLanes), bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
		isHydrating && key && pushMaterializedTreeId(workInProgress);
		workInProgress.flags |= 1;
		reconcileChildren(current, workInProgress, nextProps, renderLanes);
		return workInProgress.child;
	}
	function updateMemoComponent(current, workInProgress, Component, nextProps, renderLanes) {
		if (null === current) {
			var type = Component.type;
			if ("function" === typeof type && !shouldConstruct(type) && void 0 === type.defaultProps && null === Component.compare) return workInProgress.tag = 15, workInProgress.type = type, updateSimpleMemoComponent(current, workInProgress, type, nextProps, renderLanes);
			current = createFiberFromTypeAndProps(Component.type, null, nextProps, workInProgress, workInProgress.mode, renderLanes);
			current.ref = workInProgress.ref;
			current.return = workInProgress;
			return workInProgress.child = current;
		}
		type = current.child;
		if (!checkScheduledUpdateOrContext(current, renderLanes)) {
			var prevProps = type.memoizedProps;
			Component = Component.compare;
			Component = null !== Component ? Component : shallowEqual;
			if (Component(prevProps, nextProps) && current.ref === workInProgress.ref) return bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
		}
		workInProgress.flags |= 1;
		current = createWorkInProgress(type, nextProps);
		current.ref = workInProgress.ref;
		current.return = workInProgress;
		return workInProgress.child = current;
	}
	function updateSimpleMemoComponent(current, workInProgress, Component, nextProps, renderLanes) {
		if (null !== current) {
			var prevProps = current.memoizedProps;
			if (shallowEqual(prevProps, nextProps) && current.ref === workInProgress.ref) if (didReceiveUpdate = !1, workInProgress.pendingProps = nextProps = prevProps, checkScheduledUpdateOrContext(current, renderLanes)) 0 !== (current.flags & 131072) && (didReceiveUpdate = !0);
			else return workInProgress.lanes = current.lanes, bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
		}
		return updateFunctionComponent(current, workInProgress, Component, nextProps, renderLanes);
	}
	function updateOffscreenComponent(current, workInProgress, renderLanes, nextProps) {
		var nextChildren = nextProps.children, prevState = null !== current ? current.memoizedState : null;
		null === current && null === workInProgress.stateNode && (workInProgress.stateNode = {
			_visibility: 1,
			_pendingMarkers: null,
			_retryCache: null,
			_transitions: null
		});
		if ("hidden" === nextProps.mode) {
			if (0 !== (workInProgress.flags & 128)) {
				prevState = null !== prevState ? prevState.baseLanes | renderLanes : renderLanes;
				if (null !== current) {
					nextProps = workInProgress.child = current.child;
					for (nextChildren = 0; null !== nextProps;) nextChildren = nextChildren | nextProps.lanes | nextProps.childLanes, nextProps = nextProps.sibling;
					nextProps = nextChildren & ~prevState;
				} else nextProps = 0, workInProgress.child = null;
				return deferHiddenOffscreenComponent(current, workInProgress, prevState, renderLanes, nextProps);
			}
			if (0 !== (renderLanes & 536870912)) workInProgress.memoizedState = {
				baseLanes: 0,
				cachePool: null
			}, null !== current && pushTransition(workInProgress, null !== prevState ? prevState.cachePool : null), null !== prevState ? pushHiddenContext(workInProgress, prevState) : reuseHiddenContextOnStack(), pushOffscreenSuspenseHandler(workInProgress);
			else return nextProps = workInProgress.lanes = 536870912, deferHiddenOffscreenComponent(current, workInProgress, null !== prevState ? prevState.baseLanes | renderLanes : renderLanes, renderLanes, nextProps);
		} else null !== prevState ? (pushTransition(workInProgress, prevState.cachePool), pushHiddenContext(workInProgress, prevState), reuseSuspenseHandlerOnStack(workInProgress), workInProgress.memoizedState = null) : (null !== current && pushTransition(workInProgress, null), reuseHiddenContextOnStack(), reuseSuspenseHandlerOnStack(workInProgress));
		reconcileChildren(current, workInProgress, nextChildren, renderLanes);
		return workInProgress.child;
	}
	function bailoutOffscreenComponent(current, workInProgress) {
		null !== current && 22 === current.tag || null !== workInProgress.stateNode || (workInProgress.stateNode = {
			_visibility: 1,
			_pendingMarkers: null,
			_retryCache: null,
			_transitions: null
		});
		return workInProgress.sibling;
	}
	function deferHiddenOffscreenComponent(current, workInProgress, nextBaseLanes, renderLanes, remainingChildLanes) {
		var JSCompiler_inline_result = peekCacheFromPool();
		JSCompiler_inline_result = null === JSCompiler_inline_result ? null : {
			parent: CacheContext._currentValue,
			pool: JSCompiler_inline_result
		};
		workInProgress.memoizedState = {
			baseLanes: nextBaseLanes,
			cachePool: JSCompiler_inline_result
		};
		null !== current && pushTransition(workInProgress, null);
		reuseHiddenContextOnStack();
		pushOffscreenSuspenseHandler(workInProgress);
		null !== current && propagateParentContextChanges(current, workInProgress, renderLanes, !0);
		workInProgress.childLanes = remainingChildLanes;
		return null;
	}
	function mountActivityChildren(workInProgress, nextProps) {
		nextProps = mountWorkInProgressOffscreenFiber({
			mode: nextProps.mode,
			children: nextProps.children
		}, workInProgress.mode);
		nextProps.ref = workInProgress.ref;
		workInProgress.child = nextProps;
		nextProps.return = workInProgress;
		return nextProps;
	}
	function retryActivityComponentWithoutHydrating(current, workInProgress, renderLanes) {
		reconcileChildFibers(workInProgress, current.child, null, renderLanes);
		current = mountActivityChildren(workInProgress, workInProgress.pendingProps);
		current.flags |= 2;
		popSuspenseHandler(workInProgress);
		workInProgress.memoizedState = null;
		return current;
	}
	function updateActivityComponent(current, workInProgress, renderLanes) {
		var nextProps = workInProgress.pendingProps, didSuspend = 0 !== (workInProgress.flags & 128);
		workInProgress.flags &= -129;
		if (null === current) {
			if (isHydrating) {
				if ("hidden" === nextProps.mode) return current = mountActivityChildren(workInProgress, nextProps), workInProgress.lanes = 536870912, bailoutOffscreenComponent(null, current);
				pushDehydratedActivitySuspenseHandler(workInProgress);
				(current = nextHydratableInstance) ? (current = canHydrateHydrationBoundary(current, rootOrSingletonContext), current = null !== current && "&" === current.data ? current : null, null !== current && (workInProgress.memoizedState = {
					dehydrated: current,
					treeContext: null !== treeContextProvider ? {
						id: treeContextId,
						overflow: treeContextOverflow
					} : null,
					retryLane: 536870912,
					hydrationErrors: null
				}, renderLanes = createFiberFromDehydratedFragment(current), renderLanes.return = workInProgress, workInProgress.child = renderLanes, hydrationParentFiber = workInProgress, nextHydratableInstance = null)) : current = null;
				if (null === current) throw throwOnHydrationMismatch(workInProgress);
				workInProgress.lanes = 536870912;
				return null;
			}
			return mountActivityChildren(workInProgress, nextProps);
		}
		var prevState = current.memoizedState;
		if (null !== prevState) {
			var dehydrated = prevState.dehydrated;
			pushDehydratedActivitySuspenseHandler(workInProgress);
			if (didSuspend) if (workInProgress.flags & 256) workInProgress.flags &= -257, workInProgress = retryActivityComponentWithoutHydrating(current, workInProgress, renderLanes);
			else if (null !== workInProgress.memoizedState) workInProgress.child = current.child, workInProgress.flags |= 128, workInProgress = null;
			else throw Error(formatProdErrorMessage(558));
			else if (didReceiveUpdate || propagateParentContextChanges(current, workInProgress, renderLanes, !1), didSuspend = 0 !== (renderLanes & current.childLanes), didReceiveUpdate || didSuspend) {
				nextProps = workInProgressRoot;
				if (null !== nextProps && (dehydrated = getBumpedLaneForHydration(nextProps, renderLanes), 0 !== dehydrated && dehydrated !== prevState.retryLane)) throw prevState.retryLane = dehydrated, enqueueConcurrentRenderForLane(current, dehydrated), scheduleUpdateOnFiber(nextProps, current, dehydrated), SelectiveHydrationException;
				renderDidSuspendDelayIfPossible();
				workInProgress = retryActivityComponentWithoutHydrating(current, workInProgress, renderLanes);
			} else current = prevState.treeContext, nextHydratableInstance = getNextHydratable(dehydrated.nextSibling), hydrationParentFiber = workInProgress, isHydrating = !0, hydrationErrors = null, rootOrSingletonContext = !1, null !== current && restoreSuspendedTreeContext(workInProgress, current), workInProgress = mountActivityChildren(workInProgress, nextProps), workInProgress.flags |= 4096;
			return workInProgress;
		}
		current = createWorkInProgress(current.child, {
			mode: nextProps.mode,
			children: nextProps.children
		});
		current.ref = workInProgress.ref;
		workInProgress.child = current;
		current.return = workInProgress;
		return current;
	}
	function markRef(current, workInProgress) {
		var ref = workInProgress.ref;
		if (null === ref) null !== current && null !== current.ref && (workInProgress.flags |= 4194816);
		else {
			if ("function" !== typeof ref && "object" !== typeof ref) throw Error(formatProdErrorMessage(284));
			if (null === current || current.ref !== ref) workInProgress.flags |= 4194816;
		}
	}
	function updateFunctionComponent(current, workInProgress, Component, nextProps, renderLanes) {
		prepareToReadContext(workInProgress);
		Component = renderWithHooks(current, workInProgress, Component, nextProps, void 0, renderLanes);
		nextProps = checkDidRenderIdHook();
		if (null !== current && !didReceiveUpdate) return bailoutHooks(current, workInProgress, renderLanes), bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
		isHydrating && nextProps && pushMaterializedTreeId(workInProgress);
		workInProgress.flags |= 1;
		reconcileChildren(current, workInProgress, Component, renderLanes);
		return workInProgress.child;
	}
	function replayFunctionComponent(current, workInProgress, nextProps, Component, secondArg, renderLanes) {
		prepareToReadContext(workInProgress);
		workInProgress.updateQueue = null;
		nextProps = renderWithHooksAgain(workInProgress, Component, nextProps, secondArg);
		finishRenderingHooks(current);
		Component = checkDidRenderIdHook();
		if (null !== current && !didReceiveUpdate) return bailoutHooks(current, workInProgress, renderLanes), bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
		isHydrating && Component && pushMaterializedTreeId(workInProgress);
		workInProgress.flags |= 1;
		reconcileChildren(current, workInProgress, nextProps, renderLanes);
		return workInProgress.child;
	}
	function updateClassComponent(current, workInProgress, Component, nextProps, renderLanes) {
		prepareToReadContext(workInProgress);
		if (null === workInProgress.stateNode) {
			var context = emptyContextObject, contextType = Component.contextType;
			"object" === typeof contextType && null !== contextType && (context = readContext(contextType));
			context = new Component(nextProps, context);
			workInProgress.memoizedState = null !== context.state && void 0 !== context.state ? context.state : null;
			context.updater = classComponentUpdater;
			workInProgress.stateNode = context;
			context._reactInternals = workInProgress;
			context = workInProgress.stateNode;
			context.props = nextProps;
			context.state = workInProgress.memoizedState;
			context.refs = {};
			initializeUpdateQueue(workInProgress);
			contextType = Component.contextType;
			context.context = "object" === typeof contextType && null !== contextType ? readContext(contextType) : emptyContextObject;
			context.state = workInProgress.memoizedState;
			contextType = Component.getDerivedStateFromProps;
			"function" === typeof contextType && (applyDerivedStateFromProps(workInProgress, Component, contextType, nextProps), context.state = workInProgress.memoizedState);
			"function" === typeof Component.getDerivedStateFromProps || "function" === typeof context.getSnapshotBeforeUpdate || "function" !== typeof context.UNSAFE_componentWillMount && "function" !== typeof context.componentWillMount || (contextType = context.state, "function" === typeof context.componentWillMount && context.componentWillMount(), "function" === typeof context.UNSAFE_componentWillMount && context.UNSAFE_componentWillMount(), contextType !== context.state && classComponentUpdater.enqueueReplaceState(context, context.state, null), processUpdateQueue(workInProgress, nextProps, context, renderLanes), suspendIfUpdateReadFromEntangledAsyncAction(), context.state = workInProgress.memoizedState);
			"function" === typeof context.componentDidMount && (workInProgress.flags |= 4194308);
			nextProps = !0;
		} else if (null === current) {
			context = workInProgress.stateNode;
			var unresolvedOldProps = workInProgress.memoizedProps, oldProps = resolveClassComponentProps(Component, unresolvedOldProps);
			context.props = oldProps;
			var oldContext = context.context, contextType$jscomp$0 = Component.contextType;
			contextType = emptyContextObject;
			"object" === typeof contextType$jscomp$0 && null !== contextType$jscomp$0 && (contextType = readContext(contextType$jscomp$0));
			var getDerivedStateFromProps = Component.getDerivedStateFromProps;
			contextType$jscomp$0 = "function" === typeof getDerivedStateFromProps || "function" === typeof context.getSnapshotBeforeUpdate;
			unresolvedOldProps = workInProgress.pendingProps !== unresolvedOldProps;
			contextType$jscomp$0 || "function" !== typeof context.UNSAFE_componentWillReceiveProps && "function" !== typeof context.componentWillReceiveProps || (unresolvedOldProps || oldContext !== contextType) && callComponentWillReceiveProps(workInProgress, context, nextProps, contextType);
			hasForceUpdate = !1;
			var oldState = workInProgress.memoizedState;
			context.state = oldState;
			processUpdateQueue(workInProgress, nextProps, context, renderLanes);
			suspendIfUpdateReadFromEntangledAsyncAction();
			oldContext = workInProgress.memoizedState;
			unresolvedOldProps || oldState !== oldContext || hasForceUpdate ? ("function" === typeof getDerivedStateFromProps && (applyDerivedStateFromProps(workInProgress, Component, getDerivedStateFromProps, nextProps), oldContext = workInProgress.memoizedState), (oldProps = hasForceUpdate || checkShouldComponentUpdate(workInProgress, Component, oldProps, nextProps, oldState, oldContext, contextType)) ? (contextType$jscomp$0 || "function" !== typeof context.UNSAFE_componentWillMount && "function" !== typeof context.componentWillMount || ("function" === typeof context.componentWillMount && context.componentWillMount(), "function" === typeof context.UNSAFE_componentWillMount && context.UNSAFE_componentWillMount()), "function" === typeof context.componentDidMount && (workInProgress.flags |= 4194308)) : ("function" === typeof context.componentDidMount && (workInProgress.flags |= 4194308), workInProgress.memoizedProps = nextProps, workInProgress.memoizedState = oldContext), context.props = nextProps, context.state = oldContext, context.context = contextType, nextProps = oldProps) : ("function" === typeof context.componentDidMount && (workInProgress.flags |= 4194308), nextProps = !1);
		} else {
			context = workInProgress.stateNode;
			cloneUpdateQueue(current, workInProgress);
			contextType = workInProgress.memoizedProps;
			contextType$jscomp$0 = resolveClassComponentProps(Component, contextType);
			context.props = contextType$jscomp$0;
			getDerivedStateFromProps = workInProgress.pendingProps;
			oldState = context.context;
			oldContext = Component.contextType;
			oldProps = emptyContextObject;
			"object" === typeof oldContext && null !== oldContext && (oldProps = readContext(oldContext));
			unresolvedOldProps = Component.getDerivedStateFromProps;
			(oldContext = "function" === typeof unresolvedOldProps || "function" === typeof context.getSnapshotBeforeUpdate) || "function" !== typeof context.UNSAFE_componentWillReceiveProps && "function" !== typeof context.componentWillReceiveProps || (contextType !== getDerivedStateFromProps || oldState !== oldProps) && callComponentWillReceiveProps(workInProgress, context, nextProps, oldProps);
			hasForceUpdate = !1;
			oldState = workInProgress.memoizedState;
			context.state = oldState;
			processUpdateQueue(workInProgress, nextProps, context, renderLanes);
			suspendIfUpdateReadFromEntangledAsyncAction();
			var newState = workInProgress.memoizedState;
			contextType !== getDerivedStateFromProps || oldState !== newState || hasForceUpdate || null !== current && null !== current.dependencies && checkIfContextChanged(current.dependencies) ? ("function" === typeof unresolvedOldProps && (applyDerivedStateFromProps(workInProgress, Component, unresolvedOldProps, nextProps), newState = workInProgress.memoizedState), (contextType$jscomp$0 = hasForceUpdate || checkShouldComponentUpdate(workInProgress, Component, contextType$jscomp$0, nextProps, oldState, newState, oldProps) || null !== current && null !== current.dependencies && checkIfContextChanged(current.dependencies)) ? (oldContext || "function" !== typeof context.UNSAFE_componentWillUpdate && "function" !== typeof context.componentWillUpdate || ("function" === typeof context.componentWillUpdate && context.componentWillUpdate(nextProps, newState, oldProps), "function" === typeof context.UNSAFE_componentWillUpdate && context.UNSAFE_componentWillUpdate(nextProps, newState, oldProps)), "function" === typeof context.componentDidUpdate && (workInProgress.flags |= 4), "function" === typeof context.getSnapshotBeforeUpdate && (workInProgress.flags |= 1024)) : ("function" !== typeof context.componentDidUpdate || contextType === current.memoizedProps && oldState === current.memoizedState || (workInProgress.flags |= 4), "function" !== typeof context.getSnapshotBeforeUpdate || contextType === current.memoizedProps && oldState === current.memoizedState || (workInProgress.flags |= 1024), workInProgress.memoizedProps = nextProps, workInProgress.memoizedState = newState), context.props = nextProps, context.state = newState, context.context = oldProps, nextProps = contextType$jscomp$0) : ("function" !== typeof context.componentDidUpdate || contextType === current.memoizedProps && oldState === current.memoizedState || (workInProgress.flags |= 4), "function" !== typeof context.getSnapshotBeforeUpdate || contextType === current.memoizedProps && oldState === current.memoizedState || (workInProgress.flags |= 1024), nextProps = !1);
		}
		context = nextProps;
		markRef(current, workInProgress);
		nextProps = 0 !== (workInProgress.flags & 128);
		context || nextProps ? (context = workInProgress.stateNode, Component = nextProps && "function" !== typeof Component.getDerivedStateFromError ? null : context.render(), workInProgress.flags |= 1, null !== current && nextProps ? (workInProgress.child = reconcileChildFibers(workInProgress, current.child, null, renderLanes), workInProgress.child = reconcileChildFibers(workInProgress, null, Component, renderLanes)) : reconcileChildren(current, workInProgress, Component, renderLanes), workInProgress.memoizedState = context.state, current = workInProgress.child) : current = bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
		return current;
	}
	function mountHostRootWithoutHydrating(current, workInProgress, nextChildren, renderLanes) {
		resetHydrationState();
		workInProgress.flags |= 256;
		reconcileChildren(current, workInProgress, nextChildren, renderLanes);
		return workInProgress.child;
	}
	var SUSPENDED_MARKER = {
		dehydrated: null,
		treeContext: null,
		retryLane: 0,
		hydrationErrors: null
	};
	function mountSuspenseOffscreenState(renderLanes) {
		return {
			baseLanes: renderLanes,
			cachePool: getSuspendedCache()
		};
	}
	function getRemainingWorkInPrimaryTree(current, primaryTreeDidDefer, renderLanes) {
		current = null !== current ? current.childLanes & ~renderLanes : 0;
		primaryTreeDidDefer && (current |= workInProgressDeferredLane);
		return current;
	}
	function updateSuspenseComponent(current, workInProgress, renderLanes) {
		var nextProps = workInProgress.pendingProps, showFallback = !1, didSuspend = 0 !== (workInProgress.flags & 128), JSCompiler_temp;
		(JSCompiler_temp = didSuspend) || (JSCompiler_temp = null !== current && null === current.memoizedState ? !1 : 0 !== (suspenseStackCursor.current & 2));
		JSCompiler_temp && (showFallback = !0, workInProgress.flags &= -129);
		JSCompiler_temp = 0 !== (workInProgress.flags & 32);
		workInProgress.flags &= -33;
		if (null === current) {
			if (isHydrating) {
				showFallback ? pushPrimaryTreeSuspenseHandler(workInProgress) : reuseSuspenseHandlerOnStack(workInProgress);
				(current = nextHydratableInstance) ? (current = canHydrateHydrationBoundary(current, rootOrSingletonContext), current = null !== current && "&" !== current.data ? current : null, null !== current && (workInProgress.memoizedState = {
					dehydrated: current,
					treeContext: null !== treeContextProvider ? {
						id: treeContextId,
						overflow: treeContextOverflow
					} : null,
					retryLane: 536870912,
					hydrationErrors: null
				}, renderLanes = createFiberFromDehydratedFragment(current), renderLanes.return = workInProgress, workInProgress.child = renderLanes, hydrationParentFiber = workInProgress, nextHydratableInstance = null)) : current = null;
				if (null === current) throw throwOnHydrationMismatch(workInProgress);
				isSuspenseInstanceFallback(current) ? workInProgress.lanes = 32 : workInProgress.lanes = 536870912;
				return null;
			}
			var nextPrimaryChildren = nextProps.children;
			nextProps = nextProps.fallback;
			if (showFallback) return reuseSuspenseHandlerOnStack(workInProgress), showFallback = workInProgress.mode, nextPrimaryChildren = mountWorkInProgressOffscreenFiber({
				mode: "hidden",
				children: nextPrimaryChildren
			}, showFallback), nextProps = createFiberFromFragment(nextProps, showFallback, renderLanes, null), nextPrimaryChildren.return = workInProgress, nextProps.return = workInProgress, nextPrimaryChildren.sibling = nextProps, workInProgress.child = nextPrimaryChildren, nextProps = workInProgress.child, nextProps.memoizedState = mountSuspenseOffscreenState(renderLanes), nextProps.childLanes = getRemainingWorkInPrimaryTree(current, JSCompiler_temp, renderLanes), workInProgress.memoizedState = SUSPENDED_MARKER, bailoutOffscreenComponent(null, nextProps);
			pushPrimaryTreeSuspenseHandler(workInProgress);
			return mountSuspensePrimaryChildren(workInProgress, nextPrimaryChildren);
		}
		var prevState = current.memoizedState;
		if (null !== prevState && (nextPrimaryChildren = prevState.dehydrated, null !== nextPrimaryChildren)) {
			if (didSuspend) workInProgress.flags & 256 ? (pushPrimaryTreeSuspenseHandler(workInProgress), workInProgress.flags &= -257, workInProgress = retrySuspenseComponentWithoutHydrating(current, workInProgress, renderLanes)) : null !== workInProgress.memoizedState ? (reuseSuspenseHandlerOnStack(workInProgress), workInProgress.child = current.child, workInProgress.flags |= 128, workInProgress = null) : (reuseSuspenseHandlerOnStack(workInProgress), nextPrimaryChildren = nextProps.fallback, showFallback = workInProgress.mode, nextProps = mountWorkInProgressOffscreenFiber({
				mode: "visible",
				children: nextProps.children
			}, showFallback), nextPrimaryChildren = createFiberFromFragment(nextPrimaryChildren, showFallback, renderLanes, null), nextPrimaryChildren.flags |= 2, nextProps.return = workInProgress, nextPrimaryChildren.return = workInProgress, nextProps.sibling = nextPrimaryChildren, workInProgress.child = nextProps, reconcileChildFibers(workInProgress, current.child, null, renderLanes), nextProps = workInProgress.child, nextProps.memoizedState = mountSuspenseOffscreenState(renderLanes), nextProps.childLanes = getRemainingWorkInPrimaryTree(current, JSCompiler_temp, renderLanes), workInProgress.memoizedState = SUSPENDED_MARKER, workInProgress = bailoutOffscreenComponent(null, nextProps));
			else if (pushPrimaryTreeSuspenseHandler(workInProgress), isSuspenseInstanceFallback(nextPrimaryChildren)) {
				JSCompiler_temp = nextPrimaryChildren.nextSibling && nextPrimaryChildren.nextSibling.dataset;
				if (JSCompiler_temp) var digest = JSCompiler_temp.dgst;
				JSCompiler_temp = digest;
				nextProps = Error(formatProdErrorMessage(419));
				nextProps.stack = "";
				nextProps.digest = JSCompiler_temp;
				queueHydrationError({
					value: nextProps,
					source: null,
					stack: null
				});
				workInProgress = retrySuspenseComponentWithoutHydrating(current, workInProgress, renderLanes);
			} else if (didReceiveUpdate || propagateParentContextChanges(current, workInProgress, renderLanes, !1), JSCompiler_temp = 0 !== (renderLanes & current.childLanes), didReceiveUpdate || JSCompiler_temp) {
				JSCompiler_temp = workInProgressRoot;
				if (null !== JSCompiler_temp && (nextProps = getBumpedLaneForHydration(JSCompiler_temp, renderLanes), 0 !== nextProps && nextProps !== prevState.retryLane)) throw prevState.retryLane = nextProps, enqueueConcurrentRenderForLane(current, nextProps), scheduleUpdateOnFiber(JSCompiler_temp, current, nextProps), SelectiveHydrationException;
				isSuspenseInstancePending(nextPrimaryChildren) || renderDidSuspendDelayIfPossible();
				workInProgress = retrySuspenseComponentWithoutHydrating(current, workInProgress, renderLanes);
			} else isSuspenseInstancePending(nextPrimaryChildren) ? (workInProgress.flags |= 192, workInProgress.child = current.child, workInProgress = null) : (current = prevState.treeContext, nextHydratableInstance = getNextHydratable(nextPrimaryChildren.nextSibling), hydrationParentFiber = workInProgress, isHydrating = !0, hydrationErrors = null, rootOrSingletonContext = !1, null !== current && restoreSuspendedTreeContext(workInProgress, current), workInProgress = mountSuspensePrimaryChildren(workInProgress, nextProps.children), workInProgress.flags |= 4096);
			return workInProgress;
		}
		if (showFallback) return reuseSuspenseHandlerOnStack(workInProgress), nextPrimaryChildren = nextProps.fallback, showFallback = workInProgress.mode, prevState = current.child, digest = prevState.sibling, nextProps = createWorkInProgress(prevState, {
			mode: "hidden",
			children: nextProps.children
		}), nextProps.subtreeFlags = prevState.subtreeFlags & 65011712, null !== digest ? nextPrimaryChildren = createWorkInProgress(digest, nextPrimaryChildren) : (nextPrimaryChildren = createFiberFromFragment(nextPrimaryChildren, showFallback, renderLanes, null), nextPrimaryChildren.flags |= 2), nextPrimaryChildren.return = workInProgress, nextProps.return = workInProgress, nextProps.sibling = nextPrimaryChildren, workInProgress.child = nextProps, bailoutOffscreenComponent(null, nextProps), nextProps = workInProgress.child, nextPrimaryChildren = current.child.memoizedState, null === nextPrimaryChildren ? nextPrimaryChildren = mountSuspenseOffscreenState(renderLanes) : (showFallback = nextPrimaryChildren.cachePool, null !== showFallback ? (prevState = CacheContext._currentValue, showFallback = showFallback.parent !== prevState ? {
			parent: prevState,
			pool: prevState
		} : showFallback) : showFallback = getSuspendedCache(), nextPrimaryChildren = {
			baseLanes: nextPrimaryChildren.baseLanes | renderLanes,
			cachePool: showFallback
		}), nextProps.memoizedState = nextPrimaryChildren, nextProps.childLanes = getRemainingWorkInPrimaryTree(current, JSCompiler_temp, renderLanes), workInProgress.memoizedState = SUSPENDED_MARKER, bailoutOffscreenComponent(current.child, nextProps);
		pushPrimaryTreeSuspenseHandler(workInProgress);
		renderLanes = current.child;
		current = renderLanes.sibling;
		renderLanes = createWorkInProgress(renderLanes, {
			mode: "visible",
			children: nextProps.children
		});
		renderLanes.return = workInProgress;
		renderLanes.sibling = null;
		null !== current && (JSCompiler_temp = workInProgress.deletions, null === JSCompiler_temp ? (workInProgress.deletions = [current], workInProgress.flags |= 16) : JSCompiler_temp.push(current));
		workInProgress.child = renderLanes;
		workInProgress.memoizedState = null;
		return renderLanes;
	}
	function mountSuspensePrimaryChildren(workInProgress, primaryChildren) {
		primaryChildren = mountWorkInProgressOffscreenFiber({
			mode: "visible",
			children: primaryChildren
		}, workInProgress.mode);
		primaryChildren.return = workInProgress;
		return workInProgress.child = primaryChildren;
	}
	function mountWorkInProgressOffscreenFiber(offscreenProps, mode) {
		offscreenProps = createFiberImplClass(22, offscreenProps, null, mode);
		offscreenProps.lanes = 0;
		return offscreenProps;
	}
	function retrySuspenseComponentWithoutHydrating(current, workInProgress, renderLanes) {
		reconcileChildFibers(workInProgress, current.child, null, renderLanes);
		current = mountSuspensePrimaryChildren(workInProgress, workInProgress.pendingProps.children);
		current.flags |= 2;
		workInProgress.memoizedState = null;
		return current;
	}
	function scheduleSuspenseWorkOnFiber(fiber, renderLanes, propagationRoot) {
		fiber.lanes |= renderLanes;
		var alternate = fiber.alternate;
		null !== alternate && (alternate.lanes |= renderLanes);
		scheduleContextWorkOnParentPath(fiber.return, renderLanes, propagationRoot);
	}
	function initSuspenseListRenderState(workInProgress, isBackwards, tail, lastContentRow, tailMode, treeForkCount) {
		var renderState = workInProgress.memoizedState;
		null === renderState ? workInProgress.memoizedState = {
			isBackwards,
			rendering: null,
			renderingStartTime: 0,
			last: lastContentRow,
			tail,
			tailMode,
			treeForkCount
		} : (renderState.isBackwards = isBackwards, renderState.rendering = null, renderState.renderingStartTime = 0, renderState.last = lastContentRow, renderState.tail = tail, renderState.tailMode = tailMode, renderState.treeForkCount = treeForkCount);
	}
	function updateSuspenseListComponent(current, workInProgress, renderLanes) {
		var nextProps = workInProgress.pendingProps, revealOrder = nextProps.revealOrder, tailMode = nextProps.tail;
		nextProps = nextProps.children;
		var suspenseContext = suspenseStackCursor.current, shouldForceFallback = 0 !== (suspenseContext & 2);
		shouldForceFallback ? (suspenseContext = suspenseContext & 1 | 2, workInProgress.flags |= 128) : suspenseContext &= 1;
		push(suspenseStackCursor, suspenseContext);
		reconcileChildren(current, workInProgress, nextProps, renderLanes);
		nextProps = isHydrating ? treeForkCount : 0;
		if (!shouldForceFallback && null !== current && 0 !== (current.flags & 128)) a: for (current = workInProgress.child; null !== current;) {
			if (13 === current.tag) null !== current.memoizedState && scheduleSuspenseWorkOnFiber(current, renderLanes, workInProgress);
			else if (19 === current.tag) scheduleSuspenseWorkOnFiber(current, renderLanes, workInProgress);
			else if (null !== current.child) {
				current.child.return = current;
				current = current.child;
				continue;
			}
			if (current === workInProgress) break a;
			for (; null === current.sibling;) {
				if (null === current.return || current.return === workInProgress) break a;
				current = current.return;
			}
			current.sibling.return = current.return;
			current = current.sibling;
		}
		switch (revealOrder) {
			case "forwards":
				renderLanes = workInProgress.child;
				for (revealOrder = null; null !== renderLanes;) current = renderLanes.alternate, null !== current && null === findFirstSuspended(current) && (revealOrder = renderLanes), renderLanes = renderLanes.sibling;
				renderLanes = revealOrder;
				null === renderLanes ? (revealOrder = workInProgress.child, workInProgress.child = null) : (revealOrder = renderLanes.sibling, renderLanes.sibling = null);
				initSuspenseListRenderState(workInProgress, !1, revealOrder, renderLanes, tailMode, nextProps);
				break;
			case "backwards":
			case "unstable_legacy-backwards":
				renderLanes = null;
				revealOrder = workInProgress.child;
				for (workInProgress.child = null; null !== revealOrder;) {
					current = revealOrder.alternate;
					if (null !== current && null === findFirstSuspended(current)) {
						workInProgress.child = revealOrder;
						break;
					}
					current = revealOrder.sibling;
					revealOrder.sibling = renderLanes;
					renderLanes = revealOrder;
					revealOrder = current;
				}
				initSuspenseListRenderState(workInProgress, !0, renderLanes, null, tailMode, nextProps);
				break;
			case "together":
				initSuspenseListRenderState(workInProgress, !1, null, null, void 0, nextProps);
				break;
			default: workInProgress.memoizedState = null;
		}
		return workInProgress.child;
	}
	function bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes) {
		null !== current && (workInProgress.dependencies = current.dependencies);
		workInProgressRootSkippedLanes |= workInProgress.lanes;
		if (0 === (renderLanes & workInProgress.childLanes)) if (null !== current) {
			if (propagateParentContextChanges(current, workInProgress, renderLanes, !1), 0 === (renderLanes & workInProgress.childLanes)) return null;
		} else return null;
		if (null !== current && workInProgress.child !== current.child) throw Error(formatProdErrorMessage(153));
		if (null !== workInProgress.child) {
			current = workInProgress.child;
			renderLanes = createWorkInProgress(current, current.pendingProps);
			workInProgress.child = renderLanes;
			for (renderLanes.return = workInProgress; null !== current.sibling;) current = current.sibling, renderLanes = renderLanes.sibling = createWorkInProgress(current, current.pendingProps), renderLanes.return = workInProgress;
			renderLanes.sibling = null;
		}
		return workInProgress.child;
	}
	function checkScheduledUpdateOrContext(current, renderLanes) {
		if (0 !== (current.lanes & renderLanes)) return !0;
		current = current.dependencies;
		return null !== current && checkIfContextChanged(current) ? !0 : !1;
	}
	function attemptEarlyBailoutIfNoScheduledUpdate(current, workInProgress, renderLanes) {
		switch (workInProgress.tag) {
			case 3:
				pushHostContainer(workInProgress, workInProgress.stateNode.containerInfo);
				pushProvider(workInProgress, CacheContext, current.memoizedState.cache);
				resetHydrationState();
				break;
			case 27:
			case 5:
				pushHostContext(workInProgress);
				break;
			case 4:
				pushHostContainer(workInProgress, workInProgress.stateNode.containerInfo);
				break;
			case 10:
				pushProvider(workInProgress, workInProgress.type, workInProgress.memoizedProps.value);
				break;
			case 31:
				if (null !== workInProgress.memoizedState) return workInProgress.flags |= 128, pushDehydratedActivitySuspenseHandler(workInProgress), null;
				break;
			case 13:
				var state$102 = workInProgress.memoizedState;
				if (null !== state$102) {
					if (null !== state$102.dehydrated) return pushPrimaryTreeSuspenseHandler(workInProgress), workInProgress.flags |= 128, null;
					if (0 !== (renderLanes & workInProgress.child.childLanes)) return updateSuspenseComponent(current, workInProgress, renderLanes);
					pushPrimaryTreeSuspenseHandler(workInProgress);
					current = bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
					return null !== current ? current.sibling : null;
				}
				pushPrimaryTreeSuspenseHandler(workInProgress);
				break;
			case 19:
				var didSuspendBefore = 0 !== (current.flags & 128);
				state$102 = 0 !== (renderLanes & workInProgress.childLanes);
				state$102 || (propagateParentContextChanges(current, workInProgress, renderLanes, !1), state$102 = 0 !== (renderLanes & workInProgress.childLanes));
				if (didSuspendBefore) {
					if (state$102) return updateSuspenseListComponent(current, workInProgress, renderLanes);
					workInProgress.flags |= 128;
				}
				didSuspendBefore = workInProgress.memoizedState;
				null !== didSuspendBefore && (didSuspendBefore.rendering = null, didSuspendBefore.tail = null, didSuspendBefore.lastEffect = null);
				push(suspenseStackCursor, suspenseStackCursor.current);
				if (state$102) break;
				else return null;
			case 22: return workInProgress.lanes = 0, updateOffscreenComponent(current, workInProgress, renderLanes, workInProgress.pendingProps);
			case 24: pushProvider(workInProgress, CacheContext, current.memoizedState.cache);
		}
		return bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
	}
	function beginWork(current, workInProgress, renderLanes) {
		if (null !== current) if (current.memoizedProps !== workInProgress.pendingProps) didReceiveUpdate = !0;
		else {
			if (!checkScheduledUpdateOrContext(current, renderLanes) && 0 === (workInProgress.flags & 128)) return didReceiveUpdate = !1, attemptEarlyBailoutIfNoScheduledUpdate(current, workInProgress, renderLanes);
			didReceiveUpdate = 0 !== (current.flags & 131072) ? !0 : !1;
		}
		else didReceiveUpdate = !1, isHydrating && 0 !== (workInProgress.flags & 1048576) && pushTreeId(workInProgress, treeForkCount, workInProgress.index);
		workInProgress.lanes = 0;
		switch (workInProgress.tag) {
			case 16:
				a: {
					var props = workInProgress.pendingProps;
					current = resolveLazy(workInProgress.elementType);
					workInProgress.type = current;
					if ("function" === typeof current) shouldConstruct(current) ? (props = resolveClassComponentProps(current, props), workInProgress.tag = 1, workInProgress = updateClassComponent(null, workInProgress, current, props, renderLanes)) : (workInProgress.tag = 0, workInProgress = updateFunctionComponent(null, workInProgress, current, props, renderLanes));
					else {
						if (void 0 !== current && null !== current) {
							var $$typeof = current.$$typeof;
							if ($$typeof === REACT_FORWARD_REF_TYPE) {
								workInProgress.tag = 11;
								workInProgress = updateForwardRef(null, workInProgress, current, props, renderLanes);
								break a;
							} else if ($$typeof === REACT_MEMO_TYPE) {
								workInProgress.tag = 14;
								workInProgress = updateMemoComponent(null, workInProgress, current, props, renderLanes);
								break a;
							}
						}
						workInProgress = getComponentNameFromType(current) || current;
						throw Error(formatProdErrorMessage(306, workInProgress, ""));
					}
				}
				return workInProgress;
			case 0: return updateFunctionComponent(current, workInProgress, workInProgress.type, workInProgress.pendingProps, renderLanes);
			case 1: return props = workInProgress.type, $$typeof = resolveClassComponentProps(props, workInProgress.pendingProps), updateClassComponent(current, workInProgress, props, $$typeof, renderLanes);
			case 3:
				a: {
					pushHostContainer(workInProgress, workInProgress.stateNode.containerInfo);
					if (null === current) throw Error(formatProdErrorMessage(387));
					props = workInProgress.pendingProps;
					var prevState = workInProgress.memoizedState;
					$$typeof = prevState.element;
					cloneUpdateQueue(current, workInProgress);
					processUpdateQueue(workInProgress, props, null, renderLanes);
					var nextState = workInProgress.memoizedState;
					props = nextState.cache;
					pushProvider(workInProgress, CacheContext, props);
					props !== prevState.cache && propagateContextChanges(workInProgress, [CacheContext], renderLanes, !0);
					suspendIfUpdateReadFromEntangledAsyncAction();
					props = nextState.element;
					if (prevState.isDehydrated) if (prevState = {
						element: props,
						isDehydrated: !1,
						cache: nextState.cache
					}, workInProgress.updateQueue.baseState = prevState, workInProgress.memoizedState = prevState, workInProgress.flags & 256) {
						workInProgress = mountHostRootWithoutHydrating(current, workInProgress, props, renderLanes);
						break a;
					} else if (props !== $$typeof) {
						$$typeof = createCapturedValueAtFiber(Error(formatProdErrorMessage(424)), workInProgress);
						queueHydrationError($$typeof);
						workInProgress = mountHostRootWithoutHydrating(current, workInProgress, props, renderLanes);
						break a;
					} else {
						current = workInProgress.stateNode.containerInfo;
						switch (current.nodeType) {
							case 9:
								current = current.body;
								break;
							default: current = "HTML" === current.nodeName ? current.ownerDocument.body : current;
						}
						nextHydratableInstance = getNextHydratable(current.firstChild);
						hydrationParentFiber = workInProgress;
						isHydrating = !0;
						hydrationErrors = null;
						rootOrSingletonContext = !0;
						renderLanes = mountChildFibers(workInProgress, null, props, renderLanes);
						for (workInProgress.child = renderLanes; renderLanes;) renderLanes.flags = renderLanes.flags & -3 | 4096, renderLanes = renderLanes.sibling;
					}
					else {
						resetHydrationState();
						if (props === $$typeof) {
							workInProgress = bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
							break a;
						}
						reconcileChildren(current, workInProgress, props, renderLanes);
					}
					workInProgress = workInProgress.child;
				}
				return workInProgress;
			case 26: return markRef(current, workInProgress), null === current ? (renderLanes = getResource(workInProgress.type, null, workInProgress.pendingProps, null)) ? workInProgress.memoizedState = renderLanes : isHydrating || (renderLanes = workInProgress.type, current = workInProgress.pendingProps, props = getOwnerDocumentFromRootContainer(rootInstanceStackCursor.current).createElement(renderLanes), props[internalInstanceKey] = workInProgress, props[internalPropsKey] = current, setInitialProperties(props, renderLanes, current), markNodeAsHoistable(props), workInProgress.stateNode = props) : workInProgress.memoizedState = getResource(workInProgress.type, current.memoizedProps, workInProgress.pendingProps, current.memoizedState), null;
			case 27: return pushHostContext(workInProgress), null === current && isHydrating && (props = workInProgress.stateNode = resolveSingletonInstance(workInProgress.type, workInProgress.pendingProps, rootInstanceStackCursor.current), hydrationParentFiber = workInProgress, rootOrSingletonContext = !0, $$typeof = nextHydratableInstance, isSingletonScope(workInProgress.type) ? (previousHydratableOnEnteringScopedSingleton = $$typeof, nextHydratableInstance = getNextHydratable(props.firstChild)) : nextHydratableInstance = $$typeof), reconcileChildren(current, workInProgress, workInProgress.pendingProps.children, renderLanes), markRef(current, workInProgress), null === current && (workInProgress.flags |= 4194304), workInProgress.child;
			case 5:
				if (null === current && isHydrating) {
					if ($$typeof = props = nextHydratableInstance) props = canHydrateInstance(props, workInProgress.type, workInProgress.pendingProps, rootOrSingletonContext), null !== props ? (workInProgress.stateNode = props, hydrationParentFiber = workInProgress, nextHydratableInstance = getNextHydratable(props.firstChild), rootOrSingletonContext = !1, $$typeof = !0) : $$typeof = !1;
					$$typeof || throwOnHydrationMismatch(workInProgress);
				}
				pushHostContext(workInProgress);
				$$typeof = workInProgress.type;
				prevState = workInProgress.pendingProps;
				nextState = null !== current ? current.memoizedProps : null;
				props = prevState.children;
				shouldSetTextContent($$typeof, prevState) ? props = null : null !== nextState && shouldSetTextContent($$typeof, nextState) && (workInProgress.flags |= 32);
				null !== workInProgress.memoizedState && ($$typeof = renderWithHooks(current, workInProgress, TransitionAwareHostComponent, null, null, renderLanes), HostTransitionContext._currentValue = $$typeof);
				markRef(current, workInProgress);
				reconcileChildren(current, workInProgress, props, renderLanes);
				return workInProgress.child;
			case 6:
				if (null === current && isHydrating) {
					if (current = renderLanes = nextHydratableInstance) renderLanes = canHydrateTextInstance(renderLanes, workInProgress.pendingProps, rootOrSingletonContext), null !== renderLanes ? (workInProgress.stateNode = renderLanes, hydrationParentFiber = workInProgress, nextHydratableInstance = null, current = !0) : current = !1;
					current || throwOnHydrationMismatch(workInProgress);
				}
				return null;
			case 13: return updateSuspenseComponent(current, workInProgress, renderLanes);
			case 4: return pushHostContainer(workInProgress, workInProgress.stateNode.containerInfo), props = workInProgress.pendingProps, null === current ? workInProgress.child = reconcileChildFibers(workInProgress, null, props, renderLanes) : reconcileChildren(current, workInProgress, props, renderLanes), workInProgress.child;
			case 11: return updateForwardRef(current, workInProgress, workInProgress.type, workInProgress.pendingProps, renderLanes);
			case 7: return reconcileChildren(current, workInProgress, workInProgress.pendingProps, renderLanes), workInProgress.child;
			case 8: return reconcileChildren(current, workInProgress, workInProgress.pendingProps.children, renderLanes), workInProgress.child;
			case 12: return reconcileChildren(current, workInProgress, workInProgress.pendingProps.children, renderLanes), workInProgress.child;
			case 10: return props = workInProgress.pendingProps, pushProvider(workInProgress, workInProgress.type, props.value), reconcileChildren(current, workInProgress, props.children, renderLanes), workInProgress.child;
			case 9: return $$typeof = workInProgress.type._context, props = workInProgress.pendingProps.children, prepareToReadContext(workInProgress), $$typeof = readContext($$typeof), props = props($$typeof), workInProgress.flags |= 1, reconcileChildren(current, workInProgress, props, renderLanes), workInProgress.child;
			case 14: return updateMemoComponent(current, workInProgress, workInProgress.type, workInProgress.pendingProps, renderLanes);
			case 15: return updateSimpleMemoComponent(current, workInProgress, workInProgress.type, workInProgress.pendingProps, renderLanes);
			case 19: return updateSuspenseListComponent(current, workInProgress, renderLanes);
			case 31: return updateActivityComponent(current, workInProgress, renderLanes);
			case 22: return updateOffscreenComponent(current, workInProgress, renderLanes, workInProgress.pendingProps);
			case 24: return prepareToReadContext(workInProgress), props = readContext(CacheContext), null === current ? ($$typeof = peekCacheFromPool(), null === $$typeof && ($$typeof = workInProgressRoot, prevState = createCache(), $$typeof.pooledCache = prevState, prevState.refCount++, null !== prevState && ($$typeof.pooledCacheLanes |= renderLanes), $$typeof = prevState), workInProgress.memoizedState = {
				parent: props,
				cache: $$typeof
			}, initializeUpdateQueue(workInProgress), pushProvider(workInProgress, CacheContext, $$typeof)) : (0 !== (current.lanes & renderLanes) && (cloneUpdateQueue(current, workInProgress), processUpdateQueue(workInProgress, null, null, renderLanes), suspendIfUpdateReadFromEntangledAsyncAction()), $$typeof = current.memoizedState, prevState = workInProgress.memoizedState, $$typeof.parent !== props ? ($$typeof = {
				parent: props,
				cache: props
			}, workInProgress.memoizedState = $$typeof, 0 === workInProgress.lanes && (workInProgress.memoizedState = workInProgress.updateQueue.baseState = $$typeof), pushProvider(workInProgress, CacheContext, props)) : (props = prevState.cache, pushProvider(workInProgress, CacheContext, props), props !== $$typeof.cache && propagateContextChanges(workInProgress, [CacheContext], renderLanes, !0))), reconcileChildren(current, workInProgress, workInProgress.pendingProps.children, renderLanes), workInProgress.child;
			case 29: throw workInProgress.pendingProps;
		}
		throw Error(formatProdErrorMessage(156, workInProgress.tag));
	}
	function markUpdate(workInProgress) {
		workInProgress.flags |= 4;
	}
	function preloadInstanceAndSuspendIfNeeded(workInProgress, type, oldProps, newProps, renderLanes) {
		if (type = 0 !== (workInProgress.mode & 32)) type = !1;
		if (type) {
			if (workInProgress.flags |= 16777216, (renderLanes & 335544128) === renderLanes) if (workInProgress.stateNode.complete) workInProgress.flags |= 8192;
			else if (shouldRemainOnPreviousScreen()) workInProgress.flags |= 8192;
			else throw suspendedThenable = noopSuspenseyCommitThenable, SuspenseyCommitException;
		} else workInProgress.flags &= -16777217;
	}
	function preloadResourceAndSuspendIfNeeded(workInProgress, resource) {
		if ("stylesheet" !== resource.type || 0 !== (resource.state.loading & 4)) workInProgress.flags &= -16777217;
		else if (workInProgress.flags |= 16777216, !preloadResource(resource)) if (shouldRemainOnPreviousScreen()) workInProgress.flags |= 8192;
		else throw suspendedThenable = noopSuspenseyCommitThenable, SuspenseyCommitException;
	}
	function scheduleRetryEffect(workInProgress, retryQueue) {
		null !== retryQueue && (workInProgress.flags |= 4);
		workInProgress.flags & 16384 && (retryQueue = 22 !== workInProgress.tag ? claimNextRetryLane() : 536870912, workInProgress.lanes |= retryQueue, workInProgressSuspendedRetryLanes |= retryQueue);
	}
	function cutOffTailIfNeeded(renderState, hasRenderedATailFallback) {
		if (!isHydrating) switch (renderState.tailMode) {
			case "hidden":
				hasRenderedATailFallback = renderState.tail;
				for (var lastTailNode = null; null !== hasRenderedATailFallback;) null !== hasRenderedATailFallback.alternate && (lastTailNode = hasRenderedATailFallback), hasRenderedATailFallback = hasRenderedATailFallback.sibling;
				null === lastTailNode ? renderState.tail = null : lastTailNode.sibling = null;
				break;
			case "collapsed":
				lastTailNode = renderState.tail;
				for (var lastTailNode$106 = null; null !== lastTailNode;) null !== lastTailNode.alternate && (lastTailNode$106 = lastTailNode), lastTailNode = lastTailNode.sibling;
				null === lastTailNode$106 ? hasRenderedATailFallback || null === renderState.tail ? renderState.tail = null : renderState.tail.sibling = null : lastTailNode$106.sibling = null;
		}
	}
	function bubbleProperties(completedWork) {
		var didBailout = null !== completedWork.alternate && completedWork.alternate.child === completedWork.child, newChildLanes = 0, subtreeFlags = 0;
		if (didBailout) for (var child$107 = completedWork.child; null !== child$107;) newChildLanes |= child$107.lanes | child$107.childLanes, subtreeFlags |= child$107.subtreeFlags & 65011712, subtreeFlags |= child$107.flags & 65011712, child$107.return = completedWork, child$107 = child$107.sibling;
		else for (child$107 = completedWork.child; null !== child$107;) newChildLanes |= child$107.lanes | child$107.childLanes, subtreeFlags |= child$107.subtreeFlags, subtreeFlags |= child$107.flags, child$107.return = completedWork, child$107 = child$107.sibling;
		completedWork.subtreeFlags |= subtreeFlags;
		completedWork.childLanes = newChildLanes;
		return didBailout;
	}
	function completeWork(current, workInProgress, renderLanes) {
		var newProps = workInProgress.pendingProps;
		popTreeContext(workInProgress);
		switch (workInProgress.tag) {
			case 16:
			case 15:
			case 0:
			case 11:
			case 7:
			case 8:
			case 12:
			case 9:
			case 14: return bubbleProperties(workInProgress), null;
			case 1: return bubbleProperties(workInProgress), null;
			case 3:
				renderLanes = workInProgress.stateNode;
				newProps = null;
				null !== current && (newProps = current.memoizedState.cache);
				workInProgress.memoizedState.cache !== newProps && (workInProgress.flags |= 2048);
				popProvider(CacheContext);
				popHostContainer();
				renderLanes.pendingContext && (renderLanes.context = renderLanes.pendingContext, renderLanes.pendingContext = null);
				if (null === current || null === current.child) popHydrationState(workInProgress) ? markUpdate(workInProgress) : null === current || current.memoizedState.isDehydrated && 0 === (workInProgress.flags & 256) || (workInProgress.flags |= 1024, upgradeHydrationErrorsToRecoverable());
				bubbleProperties(workInProgress);
				return null;
			case 26:
				var type = workInProgress.type, nextResource = workInProgress.memoizedState;
				null === current ? (markUpdate(workInProgress), null !== nextResource ? (bubbleProperties(workInProgress), preloadResourceAndSuspendIfNeeded(workInProgress, nextResource)) : (bubbleProperties(workInProgress), preloadInstanceAndSuspendIfNeeded(workInProgress, type, null, newProps, renderLanes))) : nextResource ? nextResource !== current.memoizedState ? (markUpdate(workInProgress), bubbleProperties(workInProgress), preloadResourceAndSuspendIfNeeded(workInProgress, nextResource)) : (bubbleProperties(workInProgress), workInProgress.flags &= -16777217) : (current = current.memoizedProps, current !== newProps && markUpdate(workInProgress), bubbleProperties(workInProgress), preloadInstanceAndSuspendIfNeeded(workInProgress, type, current, newProps, renderLanes));
				return null;
			case 27:
				popHostContext(workInProgress);
				renderLanes = rootInstanceStackCursor.current;
				type = workInProgress.type;
				if (null !== current && null != workInProgress.stateNode) current.memoizedProps !== newProps && markUpdate(workInProgress);
				else {
					if (!newProps) {
						if (null === workInProgress.stateNode) throw Error(formatProdErrorMessage(166));
						bubbleProperties(workInProgress);
						return null;
					}
					current = contextStackCursor.current;
					popHydrationState(workInProgress) ? prepareToHydrateHostInstance(workInProgress, current) : (current = resolveSingletonInstance(type, newProps, renderLanes), workInProgress.stateNode = current, markUpdate(workInProgress));
				}
				bubbleProperties(workInProgress);
				return null;
			case 5:
				popHostContext(workInProgress);
				type = workInProgress.type;
				if (null !== current && null != workInProgress.stateNode) current.memoizedProps !== newProps && markUpdate(workInProgress);
				else {
					if (!newProps) {
						if (null === workInProgress.stateNode) throw Error(formatProdErrorMessage(166));
						bubbleProperties(workInProgress);
						return null;
					}
					nextResource = contextStackCursor.current;
					if (popHydrationState(workInProgress)) prepareToHydrateHostInstance(workInProgress, nextResource);
					else {
						var ownerDocument = getOwnerDocumentFromRootContainer(rootInstanceStackCursor.current);
						switch (nextResource) {
							case 1:
								nextResource = ownerDocument.createElementNS("http://www.w3.org/2000/svg", type);
								break;
							case 2:
								nextResource = ownerDocument.createElementNS("http://www.w3.org/1998/Math/MathML", type);
								break;
							default: switch (type) {
								case "svg":
									nextResource = ownerDocument.createElementNS("http://www.w3.org/2000/svg", type);
									break;
								case "math":
									nextResource = ownerDocument.createElementNS("http://www.w3.org/1998/Math/MathML", type);
									break;
								case "script":
									nextResource = ownerDocument.createElement("div");
									nextResource.innerHTML = "<script><\/script>";
									nextResource = nextResource.removeChild(nextResource.firstChild);
									break;
								case "select":
									nextResource = "string" === typeof newProps.is ? ownerDocument.createElement("select", { is: newProps.is }) : ownerDocument.createElement("select");
									newProps.multiple ? nextResource.multiple = !0 : newProps.size && (nextResource.size = newProps.size);
									break;
								default: nextResource = "string" === typeof newProps.is ? ownerDocument.createElement(type, { is: newProps.is }) : ownerDocument.createElement(type);
							}
						}
						nextResource[internalInstanceKey] = workInProgress;
						nextResource[internalPropsKey] = newProps;
						a: for (ownerDocument = workInProgress.child; null !== ownerDocument;) {
							if (5 === ownerDocument.tag || 6 === ownerDocument.tag) nextResource.appendChild(ownerDocument.stateNode);
							else if (4 !== ownerDocument.tag && 27 !== ownerDocument.tag && null !== ownerDocument.child) {
								ownerDocument.child.return = ownerDocument;
								ownerDocument = ownerDocument.child;
								continue;
							}
							if (ownerDocument === workInProgress) break a;
							for (; null === ownerDocument.sibling;) {
								if (null === ownerDocument.return || ownerDocument.return === workInProgress) break a;
								ownerDocument = ownerDocument.return;
							}
							ownerDocument.sibling.return = ownerDocument.return;
							ownerDocument = ownerDocument.sibling;
						}
						workInProgress.stateNode = nextResource;
						a: switch (setInitialProperties(nextResource, type, newProps), type) {
							case "button":
							case "input":
							case "select":
							case "textarea":
								newProps = !!newProps.autoFocus;
								break a;
							case "img":
								newProps = !0;
								break a;
							default: newProps = !1;
						}
						newProps && markUpdate(workInProgress);
					}
				}
				bubbleProperties(workInProgress);
				preloadInstanceAndSuspendIfNeeded(workInProgress, workInProgress.type, null === current ? null : current.memoizedProps, workInProgress.pendingProps, renderLanes);
				return null;
			case 6:
				if (current && null != workInProgress.stateNode) current.memoizedProps !== newProps && markUpdate(workInProgress);
				else {
					if ("string" !== typeof newProps && null === workInProgress.stateNode) throw Error(formatProdErrorMessage(166));
					current = rootInstanceStackCursor.current;
					if (popHydrationState(workInProgress)) {
						current = workInProgress.stateNode;
						renderLanes = workInProgress.memoizedProps;
						newProps = null;
						type = hydrationParentFiber;
						if (null !== type) switch (type.tag) {
							case 27:
							case 5: newProps = type.memoizedProps;
						}
						current[internalInstanceKey] = workInProgress;
						current = current.nodeValue === renderLanes || null !== newProps && !0 === newProps.suppressHydrationWarning || checkForUnmatchedText(current.nodeValue, renderLanes) ? !0 : !1;
						current || throwOnHydrationMismatch(workInProgress, !0);
					} else current = getOwnerDocumentFromRootContainer(current).createTextNode(newProps), current[internalInstanceKey] = workInProgress, workInProgress.stateNode = current;
				}
				bubbleProperties(workInProgress);
				return null;
			case 31:
				renderLanes = workInProgress.memoizedState;
				if (null === current || null !== current.memoizedState) {
					newProps = popHydrationState(workInProgress);
					if (null !== renderLanes) {
						if (null === current) {
							if (!newProps) throw Error(formatProdErrorMessage(318));
							current = workInProgress.memoizedState;
							current = null !== current ? current.dehydrated : null;
							if (!current) throw Error(formatProdErrorMessage(557));
							current[internalInstanceKey] = workInProgress;
						} else resetHydrationState(), 0 === (workInProgress.flags & 128) && (workInProgress.memoizedState = null), workInProgress.flags |= 4;
						bubbleProperties(workInProgress);
						current = !1;
					} else renderLanes = upgradeHydrationErrorsToRecoverable(), null !== current && null !== current.memoizedState && (current.memoizedState.hydrationErrors = renderLanes), current = !0;
					if (!current) {
						if (workInProgress.flags & 256) return popSuspenseHandler(workInProgress), workInProgress;
						popSuspenseHandler(workInProgress);
						return null;
					}
					if (0 !== (workInProgress.flags & 128)) throw Error(formatProdErrorMessage(558));
				}
				bubbleProperties(workInProgress);
				return null;
			case 13:
				newProps = workInProgress.memoizedState;
				if (null === current || null !== current.memoizedState && null !== current.memoizedState.dehydrated) {
					type = popHydrationState(workInProgress);
					if (null !== newProps && null !== newProps.dehydrated) {
						if (null === current) {
							if (!type) throw Error(formatProdErrorMessage(318));
							type = workInProgress.memoizedState;
							type = null !== type ? type.dehydrated : null;
							if (!type) throw Error(formatProdErrorMessage(317));
							type[internalInstanceKey] = workInProgress;
						} else resetHydrationState(), 0 === (workInProgress.flags & 128) && (workInProgress.memoizedState = null), workInProgress.flags |= 4;
						bubbleProperties(workInProgress);
						type = !1;
					} else type = upgradeHydrationErrorsToRecoverable(), null !== current && null !== current.memoizedState && (current.memoizedState.hydrationErrors = type), type = !0;
					if (!type) {
						if (workInProgress.flags & 256) return popSuspenseHandler(workInProgress), workInProgress;
						popSuspenseHandler(workInProgress);
						return null;
					}
				}
				popSuspenseHandler(workInProgress);
				if (0 !== (workInProgress.flags & 128)) return workInProgress.lanes = renderLanes, workInProgress;
				renderLanes = null !== newProps;
				current = null !== current && null !== current.memoizedState;
				renderLanes && (newProps = workInProgress.child, type = null, null !== newProps.alternate && null !== newProps.alternate.memoizedState && null !== newProps.alternate.memoizedState.cachePool && (type = newProps.alternate.memoizedState.cachePool.pool), nextResource = null, null !== newProps.memoizedState && null !== newProps.memoizedState.cachePool && (nextResource = newProps.memoizedState.cachePool.pool), nextResource !== type && (newProps.flags |= 2048));
				renderLanes !== current && renderLanes && (workInProgress.child.flags |= 8192);
				scheduleRetryEffect(workInProgress, workInProgress.updateQueue);
				bubbleProperties(workInProgress);
				return null;
			case 4: return popHostContainer(), null === current && listenToAllSupportedEvents(workInProgress.stateNode.containerInfo), bubbleProperties(workInProgress), null;
			case 10: return popProvider(workInProgress.type), bubbleProperties(workInProgress), null;
			case 19:
				pop(suspenseStackCursor);
				newProps = workInProgress.memoizedState;
				if (null === newProps) return bubbleProperties(workInProgress), null;
				type = 0 !== (workInProgress.flags & 128);
				nextResource = newProps.rendering;
				if (null === nextResource) if (type) cutOffTailIfNeeded(newProps, !1);
				else {
					if (0 !== workInProgressRootExitStatus || null !== current && 0 !== (current.flags & 128)) for (current = workInProgress.child; null !== current;) {
						nextResource = findFirstSuspended(current);
						if (null !== nextResource) {
							workInProgress.flags |= 128;
							cutOffTailIfNeeded(newProps, !1);
							current = nextResource.updateQueue;
							workInProgress.updateQueue = current;
							scheduleRetryEffect(workInProgress, current);
							workInProgress.subtreeFlags = 0;
							current = renderLanes;
							for (renderLanes = workInProgress.child; null !== renderLanes;) resetWorkInProgress(renderLanes, current), renderLanes = renderLanes.sibling;
							push(suspenseStackCursor, suspenseStackCursor.current & 1 | 2);
							isHydrating && pushTreeFork(workInProgress, newProps.treeForkCount);
							return workInProgress.child;
						}
						current = current.sibling;
					}
					null !== newProps.tail && now() > workInProgressRootRenderTargetTime && (workInProgress.flags |= 128, type = !0, cutOffTailIfNeeded(newProps, !1), workInProgress.lanes = 4194304);
				}
				else {
					if (!type) if (current = findFirstSuspended(nextResource), null !== current) {
						if (workInProgress.flags |= 128, type = !0, current = current.updateQueue, workInProgress.updateQueue = current, scheduleRetryEffect(workInProgress, current), cutOffTailIfNeeded(newProps, !0), null === newProps.tail && "hidden" === newProps.tailMode && !nextResource.alternate && !isHydrating) return bubbleProperties(workInProgress), null;
					} else 2 * now() - newProps.renderingStartTime > workInProgressRootRenderTargetTime && 536870912 !== renderLanes && (workInProgress.flags |= 128, type = !0, cutOffTailIfNeeded(newProps, !1), workInProgress.lanes = 4194304);
					newProps.isBackwards ? (nextResource.sibling = workInProgress.child, workInProgress.child = nextResource) : (current = newProps.last, null !== current ? current.sibling = nextResource : workInProgress.child = nextResource, newProps.last = nextResource);
				}
				if (null !== newProps.tail) return current = newProps.tail, newProps.rendering = current, newProps.tail = current.sibling, newProps.renderingStartTime = now(), current.sibling = null, renderLanes = suspenseStackCursor.current, push(suspenseStackCursor, type ? renderLanes & 1 | 2 : renderLanes & 1), isHydrating && pushTreeFork(workInProgress, newProps.treeForkCount), current;
				bubbleProperties(workInProgress);
				return null;
			case 22:
			case 23: return popSuspenseHandler(workInProgress), popHiddenContext(), newProps = null !== workInProgress.memoizedState, null !== current ? null !== current.memoizedState !== newProps && (workInProgress.flags |= 8192) : newProps && (workInProgress.flags |= 8192), newProps ? 0 !== (renderLanes & 536870912) && 0 === (workInProgress.flags & 128) && (bubbleProperties(workInProgress), workInProgress.subtreeFlags & 6 && (workInProgress.flags |= 8192)) : bubbleProperties(workInProgress), renderLanes = workInProgress.updateQueue, null !== renderLanes && scheduleRetryEffect(workInProgress, renderLanes.retryQueue), renderLanes = null, null !== current && null !== current.memoizedState && null !== current.memoizedState.cachePool && (renderLanes = current.memoizedState.cachePool.pool), newProps = null, null !== workInProgress.memoizedState && null !== workInProgress.memoizedState.cachePool && (newProps = workInProgress.memoizedState.cachePool.pool), newProps !== renderLanes && (workInProgress.flags |= 2048), null !== current && pop(resumedCache), null;
			case 24: return renderLanes = null, null !== current && (renderLanes = current.memoizedState.cache), workInProgress.memoizedState.cache !== renderLanes && (workInProgress.flags |= 2048), popProvider(CacheContext), bubbleProperties(workInProgress), null;
			case 25: return null;
			case 30: return null;
		}
		throw Error(formatProdErrorMessage(156, workInProgress.tag));
	}
	function unwindWork(current, workInProgress) {
		popTreeContext(workInProgress);
		switch (workInProgress.tag) {
			case 1: return current = workInProgress.flags, current & 65536 ? (workInProgress.flags = current & -65537 | 128, workInProgress) : null;
			case 3: return popProvider(CacheContext), popHostContainer(), current = workInProgress.flags, 0 !== (current & 65536) && 0 === (current & 128) ? (workInProgress.flags = current & -65537 | 128, workInProgress) : null;
			case 26:
			case 27:
			case 5: return popHostContext(workInProgress), null;
			case 31:
				if (null !== workInProgress.memoizedState) {
					popSuspenseHandler(workInProgress);
					if (null === workInProgress.alternate) throw Error(formatProdErrorMessage(340));
					resetHydrationState();
				}
				current = workInProgress.flags;
				return current & 65536 ? (workInProgress.flags = current & -65537 | 128, workInProgress) : null;
			case 13:
				popSuspenseHandler(workInProgress);
				current = workInProgress.memoizedState;
				if (null !== current && null !== current.dehydrated) {
					if (null === workInProgress.alternate) throw Error(formatProdErrorMessage(340));
					resetHydrationState();
				}
				current = workInProgress.flags;
				return current & 65536 ? (workInProgress.flags = current & -65537 | 128, workInProgress) : null;
			case 19: return pop(suspenseStackCursor), null;
			case 4: return popHostContainer(), null;
			case 10: return popProvider(workInProgress.type), null;
			case 22:
			case 23: return popSuspenseHandler(workInProgress), popHiddenContext(), null !== current && pop(resumedCache), current = workInProgress.flags, current & 65536 ? (workInProgress.flags = current & -65537 | 128, workInProgress) : null;
			case 24: return popProvider(CacheContext), null;
			case 25: return null;
			default: return null;
		}
	}
	function unwindInterruptedWork(current, interruptedWork) {
		popTreeContext(interruptedWork);
		switch (interruptedWork.tag) {
			case 3:
				popProvider(CacheContext);
				popHostContainer();
				break;
			case 26:
			case 27:
			case 5:
				popHostContext(interruptedWork);
				break;
			case 4:
				popHostContainer();
				break;
			case 31:
				null !== interruptedWork.memoizedState && popSuspenseHandler(interruptedWork);
				break;
			case 13:
				popSuspenseHandler(interruptedWork);
				break;
			case 19:
				pop(suspenseStackCursor);
				break;
			case 10:
				popProvider(interruptedWork.type);
				break;
			case 22:
			case 23:
				popSuspenseHandler(interruptedWork);
				popHiddenContext();
				null !== current && pop(resumedCache);
				break;
			case 24: popProvider(CacheContext);
		}
	}
	function commitHookEffectListMount(flags, finishedWork) {
		try {
			var updateQueue = finishedWork.updateQueue, lastEffect = null !== updateQueue ? updateQueue.lastEffect : null;
			if (null !== lastEffect) {
				var firstEffect = lastEffect.next;
				updateQueue = firstEffect;
				do {
					if ((updateQueue.tag & flags) === flags) {
						lastEffect = void 0;
						var create = updateQueue.create, inst = updateQueue.inst;
						lastEffect = create();
						inst.destroy = lastEffect;
					}
					updateQueue = updateQueue.next;
				} while (updateQueue !== firstEffect);
			}
		} catch (error) {
			captureCommitPhaseError(finishedWork, finishedWork.return, error);
		}
	}
	function commitHookEffectListUnmount(flags, finishedWork, nearestMountedAncestor$jscomp$0) {
		try {
			var updateQueue = finishedWork.updateQueue, lastEffect = null !== updateQueue ? updateQueue.lastEffect : null;
			if (null !== lastEffect) {
				var firstEffect = lastEffect.next;
				updateQueue = firstEffect;
				do {
					if ((updateQueue.tag & flags) === flags) {
						var inst = updateQueue.inst, destroy = inst.destroy;
						if (void 0 !== destroy) {
							inst.destroy = void 0;
							lastEffect = finishedWork;
							var nearestMountedAncestor = nearestMountedAncestor$jscomp$0, destroy_ = destroy;
							try {
								destroy_();
							} catch (error) {
								captureCommitPhaseError(lastEffect, nearestMountedAncestor, error);
							}
						}
					}
					updateQueue = updateQueue.next;
				} while (updateQueue !== firstEffect);
			}
		} catch (error) {
			captureCommitPhaseError(finishedWork, finishedWork.return, error);
		}
	}
	function commitClassCallbacks(finishedWork) {
		var updateQueue = finishedWork.updateQueue;
		if (null !== updateQueue) {
			var instance = finishedWork.stateNode;
			try {
				commitCallbacks(updateQueue, instance);
			} catch (error) {
				captureCommitPhaseError(finishedWork, finishedWork.return, error);
			}
		}
	}
	function safelyCallComponentWillUnmount(current, nearestMountedAncestor, instance) {
		instance.props = resolveClassComponentProps(current.type, current.memoizedProps);
		instance.state = current.memoizedState;
		try {
			instance.componentWillUnmount();
		} catch (error) {
			captureCommitPhaseError(current, nearestMountedAncestor, error);
		}
	}
	function safelyAttachRef(current, nearestMountedAncestor) {
		try {
			var ref = current.ref;
			if (null !== ref) {
				switch (current.tag) {
					case 26:
					case 27:
					case 5:
						var instanceToUse = current.stateNode;
						break;
					case 30:
						instanceToUse = current.stateNode;
						break;
					default: instanceToUse = current.stateNode;
				}
				"function" === typeof ref ? current.refCleanup = ref(instanceToUse) : ref.current = instanceToUse;
			}
		} catch (error) {
			captureCommitPhaseError(current, nearestMountedAncestor, error);
		}
	}
	function safelyDetachRef(current, nearestMountedAncestor) {
		var ref = current.ref, refCleanup = current.refCleanup;
		if (null !== ref) if ("function" === typeof refCleanup) try {
			refCleanup();
		} catch (error) {
			captureCommitPhaseError(current, nearestMountedAncestor, error);
		} finally {
			current.refCleanup = null, current = current.alternate, null != current && (current.refCleanup = null);
		}
		else if ("function" === typeof ref) try {
			ref(null);
		} catch (error$140) {
			captureCommitPhaseError(current, nearestMountedAncestor, error$140);
		}
		else ref.current = null;
	}
	function commitHostMount(finishedWork) {
		var type = finishedWork.type, props = finishedWork.memoizedProps, instance = finishedWork.stateNode;
		try {
			a: switch (type) {
				case "button":
				case "input":
				case "select":
				case "textarea":
					props.autoFocus && instance.focus();
					break a;
				case "img": props.src ? instance.src = props.src : props.srcSet && (instance.srcset = props.srcSet);
			}
		} catch (error) {
			captureCommitPhaseError(finishedWork, finishedWork.return, error);
		}
	}
	function commitHostUpdate(finishedWork, newProps, oldProps) {
		try {
			var domElement = finishedWork.stateNode;
			updateProperties(domElement, finishedWork.type, oldProps, newProps);
			domElement[internalPropsKey] = newProps;
		} catch (error) {
			captureCommitPhaseError(finishedWork, finishedWork.return, error);
		}
	}
	function isHostParent(fiber) {
		return 5 === fiber.tag || 3 === fiber.tag || 26 === fiber.tag || 27 === fiber.tag && isSingletonScope(fiber.type) || 4 === fiber.tag;
	}
	function getHostSibling(fiber) {
		a: for (;;) {
			for (; null === fiber.sibling;) {
				if (null === fiber.return || isHostParent(fiber.return)) return null;
				fiber = fiber.return;
			}
			fiber.sibling.return = fiber.return;
			for (fiber = fiber.sibling; 5 !== fiber.tag && 6 !== fiber.tag && 18 !== fiber.tag;) {
				if (27 === fiber.tag && isSingletonScope(fiber.type)) continue a;
				if (fiber.flags & 2) continue a;
				if (null === fiber.child || 4 === fiber.tag) continue a;
				else fiber.child.return = fiber, fiber = fiber.child;
			}
			if (!(fiber.flags & 2)) return fiber.stateNode;
		}
	}
	function insertOrAppendPlacementNodeIntoContainer(node, before, parent) {
		var tag = node.tag;
		if (5 === tag || 6 === tag) node = node.stateNode, before ? (9 === parent.nodeType ? parent.body : "HTML" === parent.nodeName ? parent.ownerDocument.body : parent).insertBefore(node, before) : (before = 9 === parent.nodeType ? parent.body : "HTML" === parent.nodeName ? parent.ownerDocument.body : parent, before.appendChild(node), parent = parent._reactRootContainer, null !== parent && void 0 !== parent || null !== before.onclick || (before.onclick = noop$1));
		else if (4 !== tag && (27 === tag && isSingletonScope(node.type) && (parent = node.stateNode, before = null), node = node.child, null !== node)) for (insertOrAppendPlacementNodeIntoContainer(node, before, parent), node = node.sibling; null !== node;) insertOrAppendPlacementNodeIntoContainer(node, before, parent), node = node.sibling;
	}
	function insertOrAppendPlacementNode(node, before, parent) {
		var tag = node.tag;
		if (5 === tag || 6 === tag) node = node.stateNode, before ? parent.insertBefore(node, before) : parent.appendChild(node);
		else if (4 !== tag && (27 === tag && isSingletonScope(node.type) && (parent = node.stateNode), node = node.child, null !== node)) for (insertOrAppendPlacementNode(node, before, parent), node = node.sibling; null !== node;) insertOrAppendPlacementNode(node, before, parent), node = node.sibling;
	}
	function commitHostSingletonAcquisition(finishedWork) {
		var singleton = finishedWork.stateNode, props = finishedWork.memoizedProps;
		try {
			for (var type = finishedWork.type, attributes = singleton.attributes; attributes.length;) singleton.removeAttributeNode(attributes[0]);
			setInitialProperties(singleton, type, props);
			singleton[internalInstanceKey] = finishedWork;
			singleton[internalPropsKey] = props;
		} catch (error) {
			captureCommitPhaseError(finishedWork, finishedWork.return, error);
		}
	}
	var offscreenSubtreeIsHidden = !1, offscreenSubtreeWasHidden = !1, needsFormReset = !1, PossiblyWeakSet = "function" === typeof WeakSet ? WeakSet : Set, nextEffect = null;
	function commitBeforeMutationEffects(root, firstChild) {
		root = root.containerInfo;
		eventsEnabled = _enabled;
		root = getActiveElementDeep(root);
		if (hasSelectionCapabilities(root)) {
			if ("selectionStart" in root) var JSCompiler_temp = {
				start: root.selectionStart,
				end: root.selectionEnd
			};
			else a: {
				JSCompiler_temp = (JSCompiler_temp = root.ownerDocument) && JSCompiler_temp.defaultView || window;
				var selection = JSCompiler_temp.getSelection && JSCompiler_temp.getSelection();
				if (selection && 0 !== selection.rangeCount) {
					JSCompiler_temp = selection.anchorNode;
					var anchorOffset = selection.anchorOffset, focusNode = selection.focusNode;
					selection = selection.focusOffset;
					try {
						JSCompiler_temp.nodeType, focusNode.nodeType;
					} catch (e$20) {
						JSCompiler_temp = null;
						break a;
					}
					var length = 0, start = -1, end = -1, indexWithinAnchor = 0, indexWithinFocus = 0, node = root, parentNode = null;
					b: for (;;) {
						for (var next;;) {
							node !== JSCompiler_temp || 0 !== anchorOffset && 3 !== node.nodeType || (start = length + anchorOffset);
							node !== focusNode || 0 !== selection && 3 !== node.nodeType || (end = length + selection);
							3 === node.nodeType && (length += node.nodeValue.length);
							if (null === (next = node.firstChild)) break;
							parentNode = node;
							node = next;
						}
						for (;;) {
							if (node === root) break b;
							parentNode === JSCompiler_temp && ++indexWithinAnchor === anchorOffset && (start = length);
							parentNode === focusNode && ++indexWithinFocus === selection && (end = length);
							if (null !== (next = node.nextSibling)) break;
							node = parentNode;
							parentNode = node.parentNode;
						}
						node = next;
					}
					JSCompiler_temp = -1 === start || -1 === end ? null : {
						start,
						end
					};
				} else JSCompiler_temp = null;
			}
			JSCompiler_temp = JSCompiler_temp || {
				start: 0,
				end: 0
			};
		} else JSCompiler_temp = null;
		selectionInformation = {
			focusedElem: root,
			selectionRange: JSCompiler_temp
		};
		_enabled = !1;
		for (nextEffect = firstChild; null !== nextEffect;) if (firstChild = nextEffect, root = firstChild.child, 0 !== (firstChild.subtreeFlags & 1028) && null !== root) root.return = firstChild, nextEffect = root;
		else for (; null !== nextEffect;) {
			firstChild = nextEffect;
			focusNode = firstChild.alternate;
			root = firstChild.flags;
			switch (firstChild.tag) {
				case 0:
					if (0 !== (root & 4) && (root = firstChild.updateQueue, root = null !== root ? root.events : null, null !== root)) for (JSCompiler_temp = 0; JSCompiler_temp < root.length; JSCompiler_temp++) anchorOffset = root[JSCompiler_temp], anchorOffset.ref.impl = anchorOffset.nextImpl;
					break;
				case 11:
				case 15: break;
				case 1:
					if (0 !== (root & 1024) && null !== focusNode) {
						root = void 0;
						JSCompiler_temp = firstChild;
						anchorOffset = focusNode.memoizedProps;
						focusNode = focusNode.memoizedState;
						selection = JSCompiler_temp.stateNode;
						try {
							var resolvedPrevProps = resolveClassComponentProps(JSCompiler_temp.type, anchorOffset);
							root = selection.getSnapshotBeforeUpdate(resolvedPrevProps, focusNode);
							selection.__reactInternalSnapshotBeforeUpdate = root;
						} catch (error) {
							captureCommitPhaseError(JSCompiler_temp, JSCompiler_temp.return, error);
						}
					}
					break;
				case 3:
					if (0 !== (root & 1024)) {
						if (root = firstChild.stateNode.containerInfo, JSCompiler_temp = root.nodeType, 9 === JSCompiler_temp) clearContainerSparingly(root);
						else if (1 === JSCompiler_temp) switch (root.nodeName) {
							case "HEAD":
							case "HTML":
							case "BODY":
								clearContainerSparingly(root);
								break;
							default: root.textContent = "";
						}
					}
					break;
				case 5:
				case 26:
				case 27:
				case 6:
				case 4:
				case 17: break;
				default: if (0 !== (root & 1024)) throw Error(formatProdErrorMessage(163));
			}
			root = firstChild.sibling;
			if (null !== root) {
				root.return = firstChild.return;
				nextEffect = root;
				break;
			}
			nextEffect = firstChild.return;
		}
	}
	function commitLayoutEffectOnFiber(finishedRoot, current, finishedWork) {
		var flags = finishedWork.flags;
		switch (finishedWork.tag) {
			case 0:
			case 11:
			case 15:
				recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
				flags & 4 && commitHookEffectListMount(5, finishedWork);
				break;
			case 1:
				recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
				if (flags & 4) if (finishedRoot = finishedWork.stateNode, null === current) try {
					finishedRoot.componentDidMount();
				} catch (error) {
					captureCommitPhaseError(finishedWork, finishedWork.return, error);
				}
				else {
					var prevProps = resolveClassComponentProps(finishedWork.type, current.memoizedProps);
					current = current.memoizedState;
					try {
						finishedRoot.componentDidUpdate(prevProps, current, finishedRoot.__reactInternalSnapshotBeforeUpdate);
					} catch (error$139) {
						captureCommitPhaseError(finishedWork, finishedWork.return, error$139);
					}
				}
				flags & 64 && commitClassCallbacks(finishedWork);
				flags & 512 && safelyAttachRef(finishedWork, finishedWork.return);
				break;
			case 3:
				recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
				if (flags & 64 && (finishedRoot = finishedWork.updateQueue, null !== finishedRoot)) {
					current = null;
					if (null !== finishedWork.child) switch (finishedWork.child.tag) {
						case 27:
						case 5:
							current = finishedWork.child.stateNode;
							break;
						case 1: current = finishedWork.child.stateNode;
					}
					try {
						commitCallbacks(finishedRoot, current);
					} catch (error) {
						captureCommitPhaseError(finishedWork, finishedWork.return, error);
					}
				}
				break;
			case 27: null === current && flags & 4 && commitHostSingletonAcquisition(finishedWork);
			case 26:
			case 5:
				recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
				null === current && flags & 4 && commitHostMount(finishedWork);
				flags & 512 && safelyAttachRef(finishedWork, finishedWork.return);
				break;
			case 12:
				recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
				break;
			case 31:
				recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
				flags & 4 && commitActivityHydrationCallbacks(finishedRoot, finishedWork);
				break;
			case 13:
				recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
				flags & 4 && commitSuspenseHydrationCallbacks(finishedRoot, finishedWork);
				flags & 64 && (finishedRoot = finishedWork.memoizedState, null !== finishedRoot && (finishedRoot = finishedRoot.dehydrated, null !== finishedRoot && (finishedWork = retryDehydratedSuspenseBoundary.bind(null, finishedWork), registerSuspenseInstanceRetry(finishedRoot, finishedWork))));
				break;
			case 22:
				flags = null !== finishedWork.memoizedState || offscreenSubtreeIsHidden;
				if (!flags) {
					current = null !== current && null !== current.memoizedState || offscreenSubtreeWasHidden;
					prevProps = offscreenSubtreeIsHidden;
					var prevOffscreenSubtreeWasHidden = offscreenSubtreeWasHidden;
					offscreenSubtreeIsHidden = flags;
					(offscreenSubtreeWasHidden = current) && !prevOffscreenSubtreeWasHidden ? recursivelyTraverseReappearLayoutEffects(finishedRoot, finishedWork, 0 !== (finishedWork.subtreeFlags & 8772)) : recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
					offscreenSubtreeIsHidden = prevProps;
					offscreenSubtreeWasHidden = prevOffscreenSubtreeWasHidden;
				}
				break;
			case 30: break;
			default: recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
		}
	}
	function detachFiberAfterEffects(fiber) {
		var alternate = fiber.alternate;
		null !== alternate && (fiber.alternate = null, detachFiberAfterEffects(alternate));
		fiber.child = null;
		fiber.deletions = null;
		fiber.sibling = null;
		5 === fiber.tag && (alternate = fiber.stateNode, null !== alternate && detachDeletedInstance(alternate));
		fiber.stateNode = null;
		fiber.return = null;
		fiber.dependencies = null;
		fiber.memoizedProps = null;
		fiber.memoizedState = null;
		fiber.pendingProps = null;
		fiber.stateNode = null;
		fiber.updateQueue = null;
	}
	var hostParent = null, hostParentIsContainer = !1;
	function recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, parent) {
		for (parent = parent.child; null !== parent;) commitDeletionEffectsOnFiber(finishedRoot, nearestMountedAncestor, parent), parent = parent.sibling;
	}
	function commitDeletionEffectsOnFiber(finishedRoot, nearestMountedAncestor, deletedFiber) {
		if (injectedHook && "function" === typeof injectedHook.onCommitFiberUnmount) try {
			injectedHook.onCommitFiberUnmount(rendererID, deletedFiber);
		} catch (err) {}
		switch (deletedFiber.tag) {
			case 26:
				offscreenSubtreeWasHidden || safelyDetachRef(deletedFiber, nearestMountedAncestor);
				recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
				deletedFiber.memoizedState ? deletedFiber.memoizedState.count-- : deletedFiber.stateNode && (deletedFiber = deletedFiber.stateNode, deletedFiber.parentNode.removeChild(deletedFiber));
				break;
			case 27:
				offscreenSubtreeWasHidden || safelyDetachRef(deletedFiber, nearestMountedAncestor);
				var prevHostParent = hostParent, prevHostParentIsContainer = hostParentIsContainer;
				isSingletonScope(deletedFiber.type) && (hostParent = deletedFiber.stateNode, hostParentIsContainer = !1);
				recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
				releaseSingletonInstance(deletedFiber.stateNode);
				hostParent = prevHostParent;
				hostParentIsContainer = prevHostParentIsContainer;
				break;
			case 5: offscreenSubtreeWasHidden || safelyDetachRef(deletedFiber, nearestMountedAncestor);
			case 6:
				prevHostParent = hostParent;
				prevHostParentIsContainer = hostParentIsContainer;
				hostParent = null;
				recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
				hostParent = prevHostParent;
				hostParentIsContainer = prevHostParentIsContainer;
				if (null !== hostParent) if (hostParentIsContainer) try {
					(9 === hostParent.nodeType ? hostParent.body : "HTML" === hostParent.nodeName ? hostParent.ownerDocument.body : hostParent).removeChild(deletedFiber.stateNode);
				} catch (error) {
					captureCommitPhaseError(deletedFiber, nearestMountedAncestor, error);
				}
				else try {
					hostParent.removeChild(deletedFiber.stateNode);
				} catch (error) {
					captureCommitPhaseError(deletedFiber, nearestMountedAncestor, error);
				}
				break;
			case 18:
				null !== hostParent && (hostParentIsContainer ? (finishedRoot = hostParent, clearHydrationBoundary(9 === finishedRoot.nodeType ? finishedRoot.body : "HTML" === finishedRoot.nodeName ? finishedRoot.ownerDocument.body : finishedRoot, deletedFiber.stateNode), retryIfBlockedOn(finishedRoot)) : clearHydrationBoundary(hostParent, deletedFiber.stateNode));
				break;
			case 4:
				prevHostParent = hostParent;
				prevHostParentIsContainer = hostParentIsContainer;
				hostParent = deletedFiber.stateNode.containerInfo;
				hostParentIsContainer = !0;
				recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
				hostParent = prevHostParent;
				hostParentIsContainer = prevHostParentIsContainer;
				break;
			case 0:
			case 11:
			case 14:
			case 15:
				commitHookEffectListUnmount(2, deletedFiber, nearestMountedAncestor);
				offscreenSubtreeWasHidden || commitHookEffectListUnmount(4, deletedFiber, nearestMountedAncestor);
				recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
				break;
			case 1:
				offscreenSubtreeWasHidden || (safelyDetachRef(deletedFiber, nearestMountedAncestor), prevHostParent = deletedFiber.stateNode, "function" === typeof prevHostParent.componentWillUnmount && safelyCallComponentWillUnmount(deletedFiber, nearestMountedAncestor, prevHostParent));
				recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
				break;
			case 21:
				recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
				break;
			case 22:
				offscreenSubtreeWasHidden = (prevHostParent = offscreenSubtreeWasHidden) || null !== deletedFiber.memoizedState;
				recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
				offscreenSubtreeWasHidden = prevHostParent;
				break;
			default: recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
		}
	}
	function commitActivityHydrationCallbacks(finishedRoot, finishedWork) {
		if (null === finishedWork.memoizedState && (finishedRoot = finishedWork.alternate, null !== finishedRoot && (finishedRoot = finishedRoot.memoizedState, null !== finishedRoot))) {
			finishedRoot = finishedRoot.dehydrated;
			try {
				retryIfBlockedOn(finishedRoot);
			} catch (error) {
				captureCommitPhaseError(finishedWork, finishedWork.return, error);
			}
		}
	}
	function commitSuspenseHydrationCallbacks(finishedRoot, finishedWork) {
		if (null === finishedWork.memoizedState && (finishedRoot = finishedWork.alternate, null !== finishedRoot && (finishedRoot = finishedRoot.memoizedState, null !== finishedRoot && (finishedRoot = finishedRoot.dehydrated, null !== finishedRoot)))) try {
			retryIfBlockedOn(finishedRoot);
		} catch (error) {
			captureCommitPhaseError(finishedWork, finishedWork.return, error);
		}
	}
	function getRetryCache(finishedWork) {
		switch (finishedWork.tag) {
			case 31:
			case 13:
			case 19:
				var retryCache = finishedWork.stateNode;
				null === retryCache && (retryCache = finishedWork.stateNode = new PossiblyWeakSet());
				return retryCache;
			case 22: return finishedWork = finishedWork.stateNode, retryCache = finishedWork._retryCache, null === retryCache && (retryCache = finishedWork._retryCache = new PossiblyWeakSet()), retryCache;
			default: throw Error(formatProdErrorMessage(435, finishedWork.tag));
		}
	}
	function attachSuspenseRetryListeners(finishedWork, wakeables) {
		var retryCache = getRetryCache(finishedWork);
		wakeables.forEach(function(wakeable) {
			if (!retryCache.has(wakeable)) {
				retryCache.add(wakeable);
				var retry = resolveRetryWakeable.bind(null, finishedWork, wakeable);
				wakeable.then(retry, retry);
			}
		});
	}
	function recursivelyTraverseMutationEffects(root$jscomp$0, parentFiber) {
		var deletions = parentFiber.deletions;
		if (null !== deletions) for (var i = 0; i < deletions.length; i++) {
			var childToDelete = deletions[i], root = root$jscomp$0, returnFiber = parentFiber, parent = returnFiber;
			a: for (; null !== parent;) {
				switch (parent.tag) {
					case 27:
						if (isSingletonScope(parent.type)) {
							hostParent = parent.stateNode;
							hostParentIsContainer = !1;
							break a;
						}
						break;
					case 5:
						hostParent = parent.stateNode;
						hostParentIsContainer = !1;
						break a;
					case 3:
					case 4:
						hostParent = parent.stateNode.containerInfo;
						hostParentIsContainer = !0;
						break a;
				}
				parent = parent.return;
			}
			if (null === hostParent) throw Error(formatProdErrorMessage(160));
			commitDeletionEffectsOnFiber(root, returnFiber, childToDelete);
			hostParent = null;
			hostParentIsContainer = !1;
			root = childToDelete.alternate;
			null !== root && (root.return = null);
			childToDelete.return = null;
		}
		if (parentFiber.subtreeFlags & 13886) for (parentFiber = parentFiber.child; null !== parentFiber;) commitMutationEffectsOnFiber(parentFiber, root$jscomp$0), parentFiber = parentFiber.sibling;
	}
	var currentHoistableRoot = null;
	function commitMutationEffectsOnFiber(finishedWork, root) {
		var current = finishedWork.alternate, flags = finishedWork.flags;
		switch (finishedWork.tag) {
			case 0:
			case 11:
			case 14:
			case 15:
				recursivelyTraverseMutationEffects(root, finishedWork);
				commitReconciliationEffects(finishedWork);
				flags & 4 && (commitHookEffectListUnmount(3, finishedWork, finishedWork.return), commitHookEffectListMount(3, finishedWork), commitHookEffectListUnmount(5, finishedWork, finishedWork.return));
				break;
			case 1:
				recursivelyTraverseMutationEffects(root, finishedWork);
				commitReconciliationEffects(finishedWork);
				flags & 512 && (offscreenSubtreeWasHidden || null === current || safelyDetachRef(current, current.return));
				flags & 64 && offscreenSubtreeIsHidden && (finishedWork = finishedWork.updateQueue, null !== finishedWork && (flags = finishedWork.callbacks, null !== flags && (current = finishedWork.shared.hiddenCallbacks, finishedWork.shared.hiddenCallbacks = null === current ? flags : current.concat(flags))));
				break;
			case 26:
				var hoistableRoot = currentHoistableRoot;
				recursivelyTraverseMutationEffects(root, finishedWork);
				commitReconciliationEffects(finishedWork);
				flags & 512 && (offscreenSubtreeWasHidden || null === current || safelyDetachRef(current, current.return));
				if (flags & 4) {
					var currentResource = null !== current ? current.memoizedState : null;
					flags = finishedWork.memoizedState;
					if (null === current) if (null === flags) if (null === finishedWork.stateNode) {
						a: {
							flags = finishedWork.type;
							current = finishedWork.memoizedProps;
							hoistableRoot = hoistableRoot.ownerDocument || hoistableRoot;
							b: switch (flags) {
								case "title":
									currentResource = hoistableRoot.getElementsByTagName("title")[0];
									if (!currentResource || currentResource[internalHoistableMarker] || currentResource[internalInstanceKey] || "http://www.w3.org/2000/svg" === currentResource.namespaceURI || currentResource.hasAttribute("itemprop")) currentResource = hoistableRoot.createElement(flags), hoistableRoot.head.insertBefore(currentResource, hoistableRoot.querySelector("head > title"));
									setInitialProperties(currentResource, flags, current);
									currentResource[internalInstanceKey] = finishedWork;
									markNodeAsHoistable(currentResource);
									flags = currentResource;
									break a;
								case "link":
									var maybeNodes = getHydratableHoistableCache("link", "href", hoistableRoot).get(flags + (current.href || ""));
									if (maybeNodes) {
										for (var i = 0; i < maybeNodes.length; i++) if (currentResource = maybeNodes[i], currentResource.getAttribute("href") === (null == current.href || "" === current.href ? null : current.href) && currentResource.getAttribute("rel") === (null == current.rel ? null : current.rel) && currentResource.getAttribute("title") === (null == current.title ? null : current.title) && currentResource.getAttribute("crossorigin") === (null == current.crossOrigin ? null : current.crossOrigin)) {
											maybeNodes.splice(i, 1);
											break b;
										}
									}
									currentResource = hoistableRoot.createElement(flags);
									setInitialProperties(currentResource, flags, current);
									hoistableRoot.head.appendChild(currentResource);
									break;
								case "meta":
									if (maybeNodes = getHydratableHoistableCache("meta", "content", hoistableRoot).get(flags + (current.content || ""))) {
										for (i = 0; i < maybeNodes.length; i++) if (currentResource = maybeNodes[i], currentResource.getAttribute("content") === (null == current.content ? null : "" + current.content) && currentResource.getAttribute("name") === (null == current.name ? null : current.name) && currentResource.getAttribute("property") === (null == current.property ? null : current.property) && currentResource.getAttribute("http-equiv") === (null == current.httpEquiv ? null : current.httpEquiv) && currentResource.getAttribute("charset") === (null == current.charSet ? null : current.charSet)) {
											maybeNodes.splice(i, 1);
											break b;
										}
									}
									currentResource = hoistableRoot.createElement(flags);
									setInitialProperties(currentResource, flags, current);
									hoistableRoot.head.appendChild(currentResource);
									break;
								default: throw Error(formatProdErrorMessage(468, flags));
							}
							currentResource[internalInstanceKey] = finishedWork;
							markNodeAsHoistable(currentResource);
							flags = currentResource;
						}
						finishedWork.stateNode = flags;
					} else mountHoistable(hoistableRoot, finishedWork.type, finishedWork.stateNode);
					else finishedWork.stateNode = acquireResource(hoistableRoot, flags, finishedWork.memoizedProps);
					else currentResource !== flags ? (null === currentResource ? null !== current.stateNode && (current = current.stateNode, current.parentNode.removeChild(current)) : currentResource.count--, null === flags ? mountHoistable(hoistableRoot, finishedWork.type, finishedWork.stateNode) : acquireResource(hoistableRoot, flags, finishedWork.memoizedProps)) : null === flags && null !== finishedWork.stateNode && commitHostUpdate(finishedWork, finishedWork.memoizedProps, current.memoizedProps);
				}
				break;
			case 27:
				recursivelyTraverseMutationEffects(root, finishedWork);
				commitReconciliationEffects(finishedWork);
				flags & 512 && (offscreenSubtreeWasHidden || null === current || safelyDetachRef(current, current.return));
				null !== current && flags & 4 && commitHostUpdate(finishedWork, finishedWork.memoizedProps, current.memoizedProps);
				break;
			case 5:
				recursivelyTraverseMutationEffects(root, finishedWork);
				commitReconciliationEffects(finishedWork);
				flags & 512 && (offscreenSubtreeWasHidden || null === current || safelyDetachRef(current, current.return));
				if (finishedWork.flags & 32) {
					hoistableRoot = finishedWork.stateNode;
					try {
						setTextContent(hoistableRoot, "");
					} catch (error) {
						captureCommitPhaseError(finishedWork, finishedWork.return, error);
					}
				}
				flags & 4 && null != finishedWork.stateNode && (hoistableRoot = finishedWork.memoizedProps, commitHostUpdate(finishedWork, hoistableRoot, null !== current ? current.memoizedProps : hoistableRoot));
				flags & 1024 && (needsFormReset = !0);
				break;
			case 6:
				recursivelyTraverseMutationEffects(root, finishedWork);
				commitReconciliationEffects(finishedWork);
				if (flags & 4) {
					if (null === finishedWork.stateNode) throw Error(formatProdErrorMessage(162));
					flags = finishedWork.memoizedProps;
					current = finishedWork.stateNode;
					try {
						current.nodeValue = flags;
					} catch (error) {
						captureCommitPhaseError(finishedWork, finishedWork.return, error);
					}
				}
				break;
			case 3:
				tagCaches = null;
				hoistableRoot = currentHoistableRoot;
				currentHoistableRoot = getHoistableRoot(root.containerInfo);
				recursivelyTraverseMutationEffects(root, finishedWork);
				currentHoistableRoot = hoistableRoot;
				commitReconciliationEffects(finishedWork);
				if (flags & 4 && null !== current && current.memoizedState.isDehydrated) try {
					retryIfBlockedOn(root.containerInfo);
				} catch (error) {
					captureCommitPhaseError(finishedWork, finishedWork.return, error);
				}
				needsFormReset && (needsFormReset = !1, recursivelyResetForms(finishedWork));
				break;
			case 4:
				flags = currentHoistableRoot;
				currentHoistableRoot = getHoistableRoot(finishedWork.stateNode.containerInfo);
				recursivelyTraverseMutationEffects(root, finishedWork);
				commitReconciliationEffects(finishedWork);
				currentHoistableRoot = flags;
				break;
			case 12:
				recursivelyTraverseMutationEffects(root, finishedWork);
				commitReconciliationEffects(finishedWork);
				break;
			case 31:
				recursivelyTraverseMutationEffects(root, finishedWork);
				commitReconciliationEffects(finishedWork);
				flags & 4 && (flags = finishedWork.updateQueue, null !== flags && (finishedWork.updateQueue = null, attachSuspenseRetryListeners(finishedWork, flags)));
				break;
			case 13:
				recursivelyTraverseMutationEffects(root, finishedWork);
				commitReconciliationEffects(finishedWork);
				finishedWork.child.flags & 8192 && null !== finishedWork.memoizedState !== (null !== current && null !== current.memoizedState) && (globalMostRecentFallbackTime = now());
				flags & 4 && (flags = finishedWork.updateQueue, null !== flags && (finishedWork.updateQueue = null, attachSuspenseRetryListeners(finishedWork, flags)));
				break;
			case 22:
				hoistableRoot = null !== finishedWork.memoizedState;
				var wasHidden = null !== current && null !== current.memoizedState, prevOffscreenSubtreeIsHidden = offscreenSubtreeIsHidden, prevOffscreenSubtreeWasHidden = offscreenSubtreeWasHidden;
				offscreenSubtreeIsHidden = prevOffscreenSubtreeIsHidden || hoistableRoot;
				offscreenSubtreeWasHidden = prevOffscreenSubtreeWasHidden || wasHidden;
				recursivelyTraverseMutationEffects(root, finishedWork);
				offscreenSubtreeWasHidden = prevOffscreenSubtreeWasHidden;
				offscreenSubtreeIsHidden = prevOffscreenSubtreeIsHidden;
				commitReconciliationEffects(finishedWork);
				if (flags & 8192) a: for (root = finishedWork.stateNode, root._visibility = hoistableRoot ? root._visibility & -2 : root._visibility | 1, hoistableRoot && (null === current || wasHidden || offscreenSubtreeIsHidden || offscreenSubtreeWasHidden || recursivelyTraverseDisappearLayoutEffects(finishedWork)), current = null, root = finishedWork;;) {
					if (5 === root.tag || 26 === root.tag) {
						if (null === current) {
							wasHidden = current = root;
							try {
								if (currentResource = wasHidden.stateNode, hoistableRoot) maybeNodes = currentResource.style, "function" === typeof maybeNodes.setProperty ? maybeNodes.setProperty("display", "none", "important") : maybeNodes.display = "none";
								else {
									i = wasHidden.stateNode;
									var styleProp = wasHidden.memoizedProps.style, display = void 0 !== styleProp && null !== styleProp && styleProp.hasOwnProperty("display") ? styleProp.display : null;
									i.style.display = null == display || "boolean" === typeof display ? "" : ("" + display).trim();
								}
							} catch (error) {
								captureCommitPhaseError(wasHidden, wasHidden.return, error);
							}
						}
					} else if (6 === root.tag) {
						if (null === current) {
							wasHidden = root;
							try {
								wasHidden.stateNode.nodeValue = hoistableRoot ? "" : wasHidden.memoizedProps;
							} catch (error) {
								captureCommitPhaseError(wasHidden, wasHidden.return, error);
							}
						}
					} else if (18 === root.tag) {
						if (null === current) {
							wasHidden = root;
							try {
								var instance = wasHidden.stateNode;
								hoistableRoot ? hideOrUnhideDehydratedBoundary(instance, !0) : hideOrUnhideDehydratedBoundary(wasHidden.stateNode, !1);
							} catch (error) {
								captureCommitPhaseError(wasHidden, wasHidden.return, error);
							}
						}
					} else if ((22 !== root.tag && 23 !== root.tag || null === root.memoizedState || root === finishedWork) && null !== root.child) {
						root.child.return = root;
						root = root.child;
						continue;
					}
					if (root === finishedWork) break a;
					for (; null === root.sibling;) {
						if (null === root.return || root.return === finishedWork) break a;
						current === root && (current = null);
						root = root.return;
					}
					current === root && (current = null);
					root.sibling.return = root.return;
					root = root.sibling;
				}
				flags & 4 && (flags = finishedWork.updateQueue, null !== flags && (current = flags.retryQueue, null !== current && (flags.retryQueue = null, attachSuspenseRetryListeners(finishedWork, current))));
				break;
			case 19:
				recursivelyTraverseMutationEffects(root, finishedWork);
				commitReconciliationEffects(finishedWork);
				flags & 4 && (flags = finishedWork.updateQueue, null !== flags && (finishedWork.updateQueue = null, attachSuspenseRetryListeners(finishedWork, flags)));
				break;
			case 30: break;
			case 21: break;
			default: recursivelyTraverseMutationEffects(root, finishedWork), commitReconciliationEffects(finishedWork);
		}
	}
	function commitReconciliationEffects(finishedWork) {
		var flags = finishedWork.flags;
		if (flags & 2) {
			try {
				for (var hostParentFiber, parentFiber = finishedWork.return; null !== parentFiber;) {
					if (isHostParent(parentFiber)) {
						hostParentFiber = parentFiber;
						break;
					}
					parentFiber = parentFiber.return;
				}
				if (null == hostParentFiber) throw Error(formatProdErrorMessage(160));
				switch (hostParentFiber.tag) {
					case 27:
						var parent = hostParentFiber.stateNode;
						insertOrAppendPlacementNode(finishedWork, getHostSibling(finishedWork), parent);
						break;
					case 5:
						var parent$141 = hostParentFiber.stateNode;
						hostParentFiber.flags & 32 && (setTextContent(parent$141, ""), hostParentFiber.flags &= -33);
						insertOrAppendPlacementNode(finishedWork, getHostSibling(finishedWork), parent$141);
						break;
					case 3:
					case 4:
						var parent$143 = hostParentFiber.stateNode.containerInfo;
						insertOrAppendPlacementNodeIntoContainer(finishedWork, getHostSibling(finishedWork), parent$143);
						break;
					default: throw Error(formatProdErrorMessage(161));
				}
			} catch (error) {
				captureCommitPhaseError(finishedWork, finishedWork.return, error);
			}
			finishedWork.flags &= -3;
		}
		flags & 4096 && (finishedWork.flags &= -4097);
	}
	function recursivelyResetForms(parentFiber) {
		if (parentFiber.subtreeFlags & 1024) for (parentFiber = parentFiber.child; null !== parentFiber;) {
			var fiber = parentFiber;
			recursivelyResetForms(fiber);
			5 === fiber.tag && fiber.flags & 1024 && fiber.stateNode.reset();
			parentFiber = parentFiber.sibling;
		}
	}
	function recursivelyTraverseLayoutEffects(root, parentFiber) {
		if (parentFiber.subtreeFlags & 8772) for (parentFiber = parentFiber.child; null !== parentFiber;) commitLayoutEffectOnFiber(root, parentFiber.alternate, parentFiber), parentFiber = parentFiber.sibling;
	}
	function recursivelyTraverseDisappearLayoutEffects(parentFiber) {
		for (parentFiber = parentFiber.child; null !== parentFiber;) {
			var finishedWork = parentFiber;
			switch (finishedWork.tag) {
				case 0:
				case 11:
				case 14:
				case 15:
					commitHookEffectListUnmount(4, finishedWork, finishedWork.return);
					recursivelyTraverseDisappearLayoutEffects(finishedWork);
					break;
				case 1:
					safelyDetachRef(finishedWork, finishedWork.return);
					var instance = finishedWork.stateNode;
					"function" === typeof instance.componentWillUnmount && safelyCallComponentWillUnmount(finishedWork, finishedWork.return, instance);
					recursivelyTraverseDisappearLayoutEffects(finishedWork);
					break;
				case 27: releaseSingletonInstance(finishedWork.stateNode);
				case 26:
				case 5:
					safelyDetachRef(finishedWork, finishedWork.return);
					recursivelyTraverseDisappearLayoutEffects(finishedWork);
					break;
				case 22:
					null === finishedWork.memoizedState && recursivelyTraverseDisappearLayoutEffects(finishedWork);
					break;
				case 30:
					recursivelyTraverseDisappearLayoutEffects(finishedWork);
					break;
				default: recursivelyTraverseDisappearLayoutEffects(finishedWork);
			}
			parentFiber = parentFiber.sibling;
		}
	}
	function recursivelyTraverseReappearLayoutEffects(finishedRoot$jscomp$0, parentFiber, includeWorkInProgressEffects) {
		includeWorkInProgressEffects = includeWorkInProgressEffects && 0 !== (parentFiber.subtreeFlags & 8772);
		for (parentFiber = parentFiber.child; null !== parentFiber;) {
			var current = parentFiber.alternate, finishedRoot = finishedRoot$jscomp$0, finishedWork = parentFiber, flags = finishedWork.flags;
			switch (finishedWork.tag) {
				case 0:
				case 11:
				case 15:
					recursivelyTraverseReappearLayoutEffects(finishedRoot, finishedWork, includeWorkInProgressEffects);
					commitHookEffectListMount(4, finishedWork);
					break;
				case 1:
					recursivelyTraverseReappearLayoutEffects(finishedRoot, finishedWork, includeWorkInProgressEffects);
					current = finishedWork;
					finishedRoot = current.stateNode;
					if ("function" === typeof finishedRoot.componentDidMount) try {
						finishedRoot.componentDidMount();
					} catch (error) {
						captureCommitPhaseError(current, current.return, error);
					}
					current = finishedWork;
					finishedRoot = current.updateQueue;
					if (null !== finishedRoot) {
						var instance = current.stateNode;
						try {
							var hiddenCallbacks = finishedRoot.shared.hiddenCallbacks;
							if (null !== hiddenCallbacks) for (finishedRoot.shared.hiddenCallbacks = null, finishedRoot = 0; finishedRoot < hiddenCallbacks.length; finishedRoot++) callCallback(hiddenCallbacks[finishedRoot], instance);
						} catch (error) {
							captureCommitPhaseError(current, current.return, error);
						}
					}
					includeWorkInProgressEffects && flags & 64 && commitClassCallbacks(finishedWork);
					safelyAttachRef(finishedWork, finishedWork.return);
					break;
				case 27: commitHostSingletonAcquisition(finishedWork);
				case 26:
				case 5:
					recursivelyTraverseReappearLayoutEffects(finishedRoot, finishedWork, includeWorkInProgressEffects);
					includeWorkInProgressEffects && null === current && flags & 4 && commitHostMount(finishedWork);
					safelyAttachRef(finishedWork, finishedWork.return);
					break;
				case 12:
					recursivelyTraverseReappearLayoutEffects(finishedRoot, finishedWork, includeWorkInProgressEffects);
					break;
				case 31:
					recursivelyTraverseReappearLayoutEffects(finishedRoot, finishedWork, includeWorkInProgressEffects);
					includeWorkInProgressEffects && flags & 4 && commitActivityHydrationCallbacks(finishedRoot, finishedWork);
					break;
				case 13:
					recursivelyTraverseReappearLayoutEffects(finishedRoot, finishedWork, includeWorkInProgressEffects);
					includeWorkInProgressEffects && flags & 4 && commitSuspenseHydrationCallbacks(finishedRoot, finishedWork);
					break;
				case 22:
					null === finishedWork.memoizedState && recursivelyTraverseReappearLayoutEffects(finishedRoot, finishedWork, includeWorkInProgressEffects);
					safelyAttachRef(finishedWork, finishedWork.return);
					break;
				case 30: break;
				default: recursivelyTraverseReappearLayoutEffects(finishedRoot, finishedWork, includeWorkInProgressEffects);
			}
			parentFiber = parentFiber.sibling;
		}
	}
	function commitOffscreenPassiveMountEffects(current, finishedWork) {
		var previousCache = null;
		null !== current && null !== current.memoizedState && null !== current.memoizedState.cachePool && (previousCache = current.memoizedState.cachePool.pool);
		current = null;
		null !== finishedWork.memoizedState && null !== finishedWork.memoizedState.cachePool && (current = finishedWork.memoizedState.cachePool.pool);
		current !== previousCache && (null != current && current.refCount++, null != previousCache && releaseCache(previousCache));
	}
	function commitCachePassiveMountEffect(current, finishedWork) {
		current = null;
		null !== finishedWork.alternate && (current = finishedWork.alternate.memoizedState.cache);
		finishedWork = finishedWork.memoizedState.cache;
		finishedWork !== current && (finishedWork.refCount++, null != current && releaseCache(current));
	}
	function recursivelyTraversePassiveMountEffects(root, parentFiber, committedLanes, committedTransitions) {
		if (parentFiber.subtreeFlags & 10256) for (parentFiber = parentFiber.child; null !== parentFiber;) commitPassiveMountOnFiber(root, parentFiber, committedLanes, committedTransitions), parentFiber = parentFiber.sibling;
	}
	function commitPassiveMountOnFiber(finishedRoot, finishedWork, committedLanes, committedTransitions) {
		var flags = finishedWork.flags;
		switch (finishedWork.tag) {
			case 0:
			case 11:
			case 15:
				recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions);
				flags & 2048 && commitHookEffectListMount(9, finishedWork);
				break;
			case 1:
				recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions);
				break;
			case 3:
				recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions);
				flags & 2048 && (finishedRoot = null, null !== finishedWork.alternate && (finishedRoot = finishedWork.alternate.memoizedState.cache), finishedWork = finishedWork.memoizedState.cache, finishedWork !== finishedRoot && (finishedWork.refCount++, null != finishedRoot && releaseCache(finishedRoot)));
				break;
			case 12:
				if (flags & 2048) {
					recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions);
					finishedRoot = finishedWork.stateNode;
					try {
						var _finishedWork$memoize2 = finishedWork.memoizedProps, id = _finishedWork$memoize2.id, onPostCommit = _finishedWork$memoize2.onPostCommit;
						"function" === typeof onPostCommit && onPostCommit(id, null === finishedWork.alternate ? "mount" : "update", finishedRoot.passiveEffectDuration, -0);
					} catch (error) {
						captureCommitPhaseError(finishedWork, finishedWork.return, error);
					}
				} else recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions);
				break;
			case 31:
				recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions);
				break;
			case 13:
				recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions);
				break;
			case 23: break;
			case 22:
				_finishedWork$memoize2 = finishedWork.stateNode;
				id = finishedWork.alternate;
				null !== finishedWork.memoizedState ? _finishedWork$memoize2._visibility & 2 ? recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions) : recursivelyTraverseAtomicPassiveEffects(finishedRoot, finishedWork) : _finishedWork$memoize2._visibility & 2 ? recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions) : (_finishedWork$memoize2._visibility |= 2, recursivelyTraverseReconnectPassiveEffects(finishedRoot, finishedWork, committedLanes, committedTransitions, 0 !== (finishedWork.subtreeFlags & 10256) || !1));
				flags & 2048 && commitOffscreenPassiveMountEffects(id, finishedWork);
				break;
			case 24:
				recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions);
				flags & 2048 && commitCachePassiveMountEffect(finishedWork.alternate, finishedWork);
				break;
			default: recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions);
		}
	}
	function recursivelyTraverseReconnectPassiveEffects(finishedRoot$jscomp$0, parentFiber, committedLanes$jscomp$0, committedTransitions$jscomp$0, includeWorkInProgressEffects) {
		includeWorkInProgressEffects = includeWorkInProgressEffects && (0 !== (parentFiber.subtreeFlags & 10256) || !1);
		for (parentFiber = parentFiber.child; null !== parentFiber;) {
			var finishedRoot = finishedRoot$jscomp$0, finishedWork = parentFiber, committedLanes = committedLanes$jscomp$0, committedTransitions = committedTransitions$jscomp$0, flags = finishedWork.flags;
			switch (finishedWork.tag) {
				case 0:
				case 11:
				case 15:
					recursivelyTraverseReconnectPassiveEffects(finishedRoot, finishedWork, committedLanes, committedTransitions, includeWorkInProgressEffects);
					commitHookEffectListMount(8, finishedWork);
					break;
				case 23: break;
				case 22:
					var instance = finishedWork.stateNode;
					null !== finishedWork.memoizedState ? instance._visibility & 2 ? recursivelyTraverseReconnectPassiveEffects(finishedRoot, finishedWork, committedLanes, committedTransitions, includeWorkInProgressEffects) : recursivelyTraverseAtomicPassiveEffects(finishedRoot, finishedWork) : (instance._visibility |= 2, recursivelyTraverseReconnectPassiveEffects(finishedRoot, finishedWork, committedLanes, committedTransitions, includeWorkInProgressEffects));
					includeWorkInProgressEffects && flags & 2048 && commitOffscreenPassiveMountEffects(finishedWork.alternate, finishedWork);
					break;
				case 24:
					recursivelyTraverseReconnectPassiveEffects(finishedRoot, finishedWork, committedLanes, committedTransitions, includeWorkInProgressEffects);
					includeWorkInProgressEffects && flags & 2048 && commitCachePassiveMountEffect(finishedWork.alternate, finishedWork);
					break;
				default: recursivelyTraverseReconnectPassiveEffects(finishedRoot, finishedWork, committedLanes, committedTransitions, includeWorkInProgressEffects);
			}
			parentFiber = parentFiber.sibling;
		}
	}
	function recursivelyTraverseAtomicPassiveEffects(finishedRoot$jscomp$0, parentFiber) {
		if (parentFiber.subtreeFlags & 10256) for (parentFiber = parentFiber.child; null !== parentFiber;) {
			var finishedRoot = finishedRoot$jscomp$0, finishedWork = parentFiber, flags = finishedWork.flags;
			switch (finishedWork.tag) {
				case 22:
					recursivelyTraverseAtomicPassiveEffects(finishedRoot, finishedWork);
					flags & 2048 && commitOffscreenPassiveMountEffects(finishedWork.alternate, finishedWork);
					break;
				case 24:
					recursivelyTraverseAtomicPassiveEffects(finishedRoot, finishedWork);
					flags & 2048 && commitCachePassiveMountEffect(finishedWork.alternate, finishedWork);
					break;
				default: recursivelyTraverseAtomicPassiveEffects(finishedRoot, finishedWork);
			}
			parentFiber = parentFiber.sibling;
		}
	}
	var suspenseyCommitFlag = 8192;
	function recursivelyAccumulateSuspenseyCommit(parentFiber, committedLanes, suspendedState) {
		if (parentFiber.subtreeFlags & suspenseyCommitFlag) for (parentFiber = parentFiber.child; null !== parentFiber;) accumulateSuspenseyCommitOnFiber(parentFiber, committedLanes, suspendedState), parentFiber = parentFiber.sibling;
	}
	function accumulateSuspenseyCommitOnFiber(fiber, committedLanes, suspendedState) {
		switch (fiber.tag) {
			case 26:
				recursivelyAccumulateSuspenseyCommit(fiber, committedLanes, suspendedState);
				fiber.flags & suspenseyCommitFlag && null !== fiber.memoizedState && suspendResource(suspendedState, currentHoistableRoot, fiber.memoizedState, fiber.memoizedProps);
				break;
			case 5:
				recursivelyAccumulateSuspenseyCommit(fiber, committedLanes, suspendedState);
				break;
			case 3:
			case 4:
				var previousHoistableRoot = currentHoistableRoot;
				currentHoistableRoot = getHoistableRoot(fiber.stateNode.containerInfo);
				recursivelyAccumulateSuspenseyCommit(fiber, committedLanes, suspendedState);
				currentHoistableRoot = previousHoistableRoot;
				break;
			case 22:
				null === fiber.memoizedState && (previousHoistableRoot = fiber.alternate, null !== previousHoistableRoot && null !== previousHoistableRoot.memoizedState ? (previousHoistableRoot = suspenseyCommitFlag, suspenseyCommitFlag = 16777216, recursivelyAccumulateSuspenseyCommit(fiber, committedLanes, suspendedState), suspenseyCommitFlag = previousHoistableRoot) : recursivelyAccumulateSuspenseyCommit(fiber, committedLanes, suspendedState));
				break;
			default: recursivelyAccumulateSuspenseyCommit(fiber, committedLanes, suspendedState);
		}
	}
	function detachAlternateSiblings(parentFiber) {
		var previousFiber = parentFiber.alternate;
		if (null !== previousFiber && (parentFiber = previousFiber.child, null !== parentFiber)) {
			previousFiber.child = null;
			do
				previousFiber = parentFiber.sibling, parentFiber.sibling = null, parentFiber = previousFiber;
			while (null !== parentFiber);
		}
	}
	function recursivelyTraversePassiveUnmountEffects(parentFiber) {
		var deletions = parentFiber.deletions;
		if (0 !== (parentFiber.flags & 16)) {
			if (null !== deletions) for (var i = 0; i < deletions.length; i++) {
				var childToDelete = deletions[i];
				nextEffect = childToDelete;
				commitPassiveUnmountEffectsInsideOfDeletedTree_begin(childToDelete, parentFiber);
			}
			detachAlternateSiblings(parentFiber);
		}
		if (parentFiber.subtreeFlags & 10256) for (parentFiber = parentFiber.child; null !== parentFiber;) commitPassiveUnmountOnFiber(parentFiber), parentFiber = parentFiber.sibling;
	}
	function commitPassiveUnmountOnFiber(finishedWork) {
		switch (finishedWork.tag) {
			case 0:
			case 11:
			case 15:
				recursivelyTraversePassiveUnmountEffects(finishedWork);
				finishedWork.flags & 2048 && commitHookEffectListUnmount(9, finishedWork, finishedWork.return);
				break;
			case 3:
				recursivelyTraversePassiveUnmountEffects(finishedWork);
				break;
			case 12:
				recursivelyTraversePassiveUnmountEffects(finishedWork);
				break;
			case 22:
				var instance = finishedWork.stateNode;
				null !== finishedWork.memoizedState && instance._visibility & 2 && (null === finishedWork.return || 13 !== finishedWork.return.tag) ? (instance._visibility &= -3, recursivelyTraverseDisconnectPassiveEffects(finishedWork)) : recursivelyTraversePassiveUnmountEffects(finishedWork);
				break;
			default: recursivelyTraversePassiveUnmountEffects(finishedWork);
		}
	}
	function recursivelyTraverseDisconnectPassiveEffects(parentFiber) {
		var deletions = parentFiber.deletions;
		if (0 !== (parentFiber.flags & 16)) {
			if (null !== deletions) for (var i = 0; i < deletions.length; i++) {
				var childToDelete = deletions[i];
				nextEffect = childToDelete;
				commitPassiveUnmountEffectsInsideOfDeletedTree_begin(childToDelete, parentFiber);
			}
			detachAlternateSiblings(parentFiber);
		}
		for (parentFiber = parentFiber.child; null !== parentFiber;) {
			deletions = parentFiber;
			switch (deletions.tag) {
				case 0:
				case 11:
				case 15:
					commitHookEffectListUnmount(8, deletions, deletions.return);
					recursivelyTraverseDisconnectPassiveEffects(deletions);
					break;
				case 22:
					i = deletions.stateNode;
					i._visibility & 2 && (i._visibility &= -3, recursivelyTraverseDisconnectPassiveEffects(deletions));
					break;
				default: recursivelyTraverseDisconnectPassiveEffects(deletions);
			}
			parentFiber = parentFiber.sibling;
		}
	}
	function commitPassiveUnmountEffectsInsideOfDeletedTree_begin(deletedSubtreeRoot, nearestMountedAncestor) {
		for (; null !== nextEffect;) {
			var fiber = nextEffect;
			switch (fiber.tag) {
				case 0:
				case 11:
				case 15:
					commitHookEffectListUnmount(8, fiber, nearestMountedAncestor);
					break;
				case 23:
				case 22:
					if (null !== fiber.memoizedState && null !== fiber.memoizedState.cachePool) {
						var cache = fiber.memoizedState.cachePool.pool;
						null != cache && cache.refCount++;
					}
					break;
				case 24: releaseCache(fiber.memoizedState.cache);
			}
			cache = fiber.child;
			if (null !== cache) cache.return = fiber, nextEffect = cache;
			else a: for (fiber = deletedSubtreeRoot; null !== nextEffect;) {
				cache = nextEffect;
				var sibling = cache.sibling, returnFiber = cache.return;
				detachFiberAfterEffects(cache);
				if (cache === fiber) {
					nextEffect = null;
					break a;
				}
				if (null !== sibling) {
					sibling.return = returnFiber;
					nextEffect = sibling;
					break a;
				}
				nextEffect = returnFiber;
			}
		}
	}
	var DefaultAsyncDispatcher = {
		getCacheForType: function(resourceType) {
			var cache = readContext(CacheContext), cacheForType = cache.data.get(resourceType);
			void 0 === cacheForType && (cacheForType = resourceType(), cache.data.set(resourceType, cacheForType));
			return cacheForType;
		},
		cacheSignal: function() {
			return readContext(CacheContext).controller.signal;
		}
	}, PossiblyWeakMap = "function" === typeof WeakMap ? WeakMap : Map, executionContext = 0, workInProgressRoot = null, workInProgress = null, workInProgressRootRenderLanes = 0, workInProgressSuspendedReason = 0, workInProgressThrownValue = null, workInProgressRootDidSkipSuspendedSiblings = !1, workInProgressRootIsPrerendering = !1, workInProgressRootDidAttachPingListener = !1, entangledRenderLanes = 0, workInProgressRootExitStatus = 0, workInProgressRootSkippedLanes = 0, workInProgressRootInterleavedUpdatedLanes = 0, workInProgressRootPingedLanes = 0, workInProgressDeferredLane = 0, workInProgressSuspendedRetryLanes = 0, workInProgressRootConcurrentErrors = null, workInProgressRootRecoverableErrors = null, workInProgressRootDidIncludeRecursiveRenderUpdate = !1, globalMostRecentFallbackTime = 0, globalMostRecentTransitionTime = 0, workInProgressRootRenderTargetTime = Infinity, workInProgressTransitions = null, legacyErrorBoundariesThatAlreadyFailed = null, pendingEffectsStatus = 0, pendingEffectsRoot = null, pendingFinishedWork = null, pendingEffectsLanes = 0, pendingEffectsRemainingLanes = 0, pendingPassiveTransitions = null, pendingRecoverableErrors = null, nestedUpdateCount = 0, rootWithNestedUpdates = null;
	function requestUpdateLane() {
		return 0 !== (executionContext & 2) && 0 !== workInProgressRootRenderLanes ? workInProgressRootRenderLanes & -workInProgressRootRenderLanes : null !== ReactSharedInternals.T ? requestTransitionLane() : resolveUpdatePriority();
	}
	function requestDeferredLane() {
		if (0 === workInProgressDeferredLane) if (0 === (workInProgressRootRenderLanes & 536870912) || isHydrating) {
			var lane = nextTransitionDeferredLane;
			nextTransitionDeferredLane <<= 1;
			0 === (nextTransitionDeferredLane & 3932160) && (nextTransitionDeferredLane = 262144);
			workInProgressDeferredLane = lane;
		} else workInProgressDeferredLane = 536870912;
		lane = suspenseHandlerStackCursor.current;
		null !== lane && (lane.flags |= 32);
		return workInProgressDeferredLane;
	}
	function scheduleUpdateOnFiber(root, fiber, lane) {
		if (root === workInProgressRoot && (2 === workInProgressSuspendedReason || 9 === workInProgressSuspendedReason) || null !== root.cancelPendingCommit) prepareFreshStack(root, 0), markRootSuspended(root, workInProgressRootRenderLanes, workInProgressDeferredLane, !1);
		markRootUpdated$1(root, lane);
		if (0 === (executionContext & 2) || root !== workInProgressRoot) root === workInProgressRoot && (0 === (executionContext & 2) && (workInProgressRootInterleavedUpdatedLanes |= lane), 4 === workInProgressRootExitStatus && markRootSuspended(root, workInProgressRootRenderLanes, workInProgressDeferredLane, !1)), ensureRootIsScheduled(root);
	}
	function performWorkOnRoot(root$jscomp$0, lanes, forceSync) {
		if (0 !== (executionContext & 6)) throw Error(formatProdErrorMessage(327));
		var shouldTimeSlice = !forceSync && 0 === (lanes & 127) && 0 === (lanes & root$jscomp$0.expiredLanes) || checkIfRootIsPrerendering(root$jscomp$0, lanes), exitStatus = shouldTimeSlice ? renderRootConcurrent(root$jscomp$0, lanes) : renderRootSync(root$jscomp$0, lanes, !0), renderWasConcurrent = shouldTimeSlice;
		do {
			if (0 === exitStatus) {
				workInProgressRootIsPrerendering && !shouldTimeSlice && markRootSuspended(root$jscomp$0, lanes, 0, !1);
				break;
			} else {
				forceSync = root$jscomp$0.current.alternate;
				if (renderWasConcurrent && !isRenderConsistentWithExternalStores(forceSync)) {
					exitStatus = renderRootSync(root$jscomp$0, lanes, !1);
					renderWasConcurrent = !1;
					continue;
				}
				if (2 === exitStatus) {
					renderWasConcurrent = lanes;
					if (root$jscomp$0.errorRecoveryDisabledLanes & renderWasConcurrent) var JSCompiler_inline_result = 0;
					else JSCompiler_inline_result = root$jscomp$0.pendingLanes & -536870913, JSCompiler_inline_result = 0 !== JSCompiler_inline_result ? JSCompiler_inline_result : JSCompiler_inline_result & 536870912 ? 536870912 : 0;
					if (0 !== JSCompiler_inline_result) {
						lanes = JSCompiler_inline_result;
						a: {
							var root = root$jscomp$0;
							exitStatus = workInProgressRootConcurrentErrors;
							var wasRootDehydrated = root.current.memoizedState.isDehydrated;
							wasRootDehydrated && (prepareFreshStack(root, JSCompiler_inline_result).flags |= 256);
							JSCompiler_inline_result = renderRootSync(root, JSCompiler_inline_result, !1);
							if (2 !== JSCompiler_inline_result) {
								if (workInProgressRootDidAttachPingListener && !wasRootDehydrated) {
									root.errorRecoveryDisabledLanes |= renderWasConcurrent;
									workInProgressRootInterleavedUpdatedLanes |= renderWasConcurrent;
									exitStatus = 4;
									break a;
								}
								renderWasConcurrent = workInProgressRootRecoverableErrors;
								workInProgressRootRecoverableErrors = exitStatus;
								null !== renderWasConcurrent && (null === workInProgressRootRecoverableErrors ? workInProgressRootRecoverableErrors = renderWasConcurrent : workInProgressRootRecoverableErrors.push.apply(workInProgressRootRecoverableErrors, renderWasConcurrent));
							}
							exitStatus = JSCompiler_inline_result;
						}
						renderWasConcurrent = !1;
						if (2 !== exitStatus) continue;
					}
				}
				if (1 === exitStatus) {
					prepareFreshStack(root$jscomp$0, 0);
					markRootSuspended(root$jscomp$0, lanes, 0, !0);
					break;
				}
				a: {
					shouldTimeSlice = root$jscomp$0;
					renderWasConcurrent = exitStatus;
					switch (renderWasConcurrent) {
						case 0:
						case 1: throw Error(formatProdErrorMessage(345));
						case 4: if ((lanes & 4194048) !== lanes) break;
						case 6:
							markRootSuspended(shouldTimeSlice, lanes, workInProgressDeferredLane, !workInProgressRootDidSkipSuspendedSiblings);
							break a;
						case 2:
							workInProgressRootRecoverableErrors = null;
							break;
						case 3:
						case 5: break;
						default: throw Error(formatProdErrorMessage(329));
					}
					if ((lanes & 62914560) === lanes && (exitStatus = globalMostRecentFallbackTime + 300 - now(), 10 < exitStatus)) {
						markRootSuspended(shouldTimeSlice, lanes, workInProgressDeferredLane, !workInProgressRootDidSkipSuspendedSiblings);
						if (0 !== getNextLanes(shouldTimeSlice, 0, !0)) break a;
						pendingEffectsLanes = lanes;
						shouldTimeSlice.timeoutHandle = scheduleTimeout(commitRootWhenReady.bind(null, shouldTimeSlice, forceSync, workInProgressRootRecoverableErrors, workInProgressTransitions, workInProgressRootDidIncludeRecursiveRenderUpdate, lanes, workInProgressDeferredLane, workInProgressRootInterleavedUpdatedLanes, workInProgressSuspendedRetryLanes, workInProgressRootDidSkipSuspendedSiblings, renderWasConcurrent, "Throttled", -0, 0), exitStatus);
						break a;
					}
					commitRootWhenReady(shouldTimeSlice, forceSync, workInProgressRootRecoverableErrors, workInProgressTransitions, workInProgressRootDidIncludeRecursiveRenderUpdate, lanes, workInProgressDeferredLane, workInProgressRootInterleavedUpdatedLanes, workInProgressSuspendedRetryLanes, workInProgressRootDidSkipSuspendedSiblings, renderWasConcurrent, null, -0, 0);
				}
			}
			break;
		} while (1);
		ensureRootIsScheduled(root$jscomp$0);
	}
	function commitRootWhenReady(root, finishedWork, recoverableErrors, transitions, didIncludeRenderPhaseUpdate, lanes, spawnedLane, updatedLanes, suspendedRetryLanes, didSkipSuspendedSiblings, exitStatus, suspendedCommitReason, completedRenderStartTime, completedRenderEndTime) {
		root.timeoutHandle = -1;
		suspendedCommitReason = finishedWork.subtreeFlags;
		if (suspendedCommitReason & 8192 || 16785408 === (suspendedCommitReason & 16785408)) {
			suspendedCommitReason = {
				stylesheets: null,
				count: 0,
				imgCount: 0,
				imgBytes: 0,
				suspenseyImages: [],
				waitingForImages: !0,
				waitingForViewTransition: !1,
				unsuspend: noop$1
			};
			accumulateSuspenseyCommitOnFiber(finishedWork, lanes, suspendedCommitReason);
			var timeoutOffset = (lanes & 62914560) === lanes ? globalMostRecentFallbackTime - now() : (lanes & 4194048) === lanes ? globalMostRecentTransitionTime - now() : 0;
			timeoutOffset = waitForCommitToBeReady(suspendedCommitReason, timeoutOffset);
			if (null !== timeoutOffset) {
				pendingEffectsLanes = lanes;
				root.cancelPendingCommit = timeoutOffset(commitRoot.bind(null, root, finishedWork, lanes, recoverableErrors, transitions, didIncludeRenderPhaseUpdate, spawnedLane, updatedLanes, suspendedRetryLanes, exitStatus, suspendedCommitReason, null, completedRenderStartTime, completedRenderEndTime));
				markRootSuspended(root, lanes, spawnedLane, !didSkipSuspendedSiblings);
				return;
			}
		}
		commitRoot(root, finishedWork, lanes, recoverableErrors, transitions, didIncludeRenderPhaseUpdate, spawnedLane, updatedLanes, suspendedRetryLanes);
	}
	function isRenderConsistentWithExternalStores(finishedWork) {
		for (var node = finishedWork;;) {
			var tag = node.tag;
			if ((0 === tag || 11 === tag || 15 === tag) && node.flags & 16384 && (tag = node.updateQueue, null !== tag && (tag = tag.stores, null !== tag))) for (var i = 0; i < tag.length; i++) {
				var check = tag[i], getSnapshot = check.getSnapshot;
				check = check.value;
				try {
					if (!objectIs(getSnapshot(), check)) return !1;
				} catch (error) {
					return !1;
				}
			}
			tag = node.child;
			if (node.subtreeFlags & 16384 && null !== tag) tag.return = node, node = tag;
			else {
				if (node === finishedWork) break;
				for (; null === node.sibling;) {
					if (null === node.return || node.return === finishedWork) return !0;
					node = node.return;
				}
				node.sibling.return = node.return;
				node = node.sibling;
			}
		}
		return !0;
	}
	function markRootSuspended(root, suspendedLanes, spawnedLane, didAttemptEntireTree) {
		suspendedLanes &= ~workInProgressRootPingedLanes;
		suspendedLanes &= ~workInProgressRootInterleavedUpdatedLanes;
		root.suspendedLanes |= suspendedLanes;
		root.pingedLanes &= ~suspendedLanes;
		didAttemptEntireTree && (root.warmLanes |= suspendedLanes);
		didAttemptEntireTree = root.expirationTimes;
		for (var lanes = suspendedLanes; 0 < lanes;) {
			var index$6 = 31 - clz32(lanes), lane = 1 << index$6;
			didAttemptEntireTree[index$6] = -1;
			lanes &= ~lane;
		}
		0 !== spawnedLane && markSpawnedDeferredLane(root, spawnedLane, suspendedLanes);
	}
	function flushSyncWork$1() {
		return 0 === (executionContext & 6) ? (flushSyncWorkAcrossRoots_impl(0, !1), !1) : !0;
	}
	function resetWorkInProgressStack() {
		if (null !== workInProgress) {
			if (0 === workInProgressSuspendedReason) var interruptedWork = workInProgress.return;
			else interruptedWork = workInProgress, lastContextDependency = currentlyRenderingFiber$1 = null, resetHooksOnUnwind(interruptedWork), thenableState$1 = null, thenableIndexCounter$1 = 0, interruptedWork = workInProgress;
			for (; null !== interruptedWork;) unwindInterruptedWork(interruptedWork.alternate, interruptedWork), interruptedWork = interruptedWork.return;
			workInProgress = null;
		}
	}
	function prepareFreshStack(root, lanes) {
		var timeoutHandle = root.timeoutHandle;
		-1 !== timeoutHandle && (root.timeoutHandle = -1, cancelTimeout(timeoutHandle));
		timeoutHandle = root.cancelPendingCommit;
		null !== timeoutHandle && (root.cancelPendingCommit = null, timeoutHandle());
		pendingEffectsLanes = 0;
		resetWorkInProgressStack();
		workInProgressRoot = root;
		workInProgress = timeoutHandle = createWorkInProgress(root.current, null);
		workInProgressRootRenderLanes = lanes;
		workInProgressSuspendedReason = 0;
		workInProgressThrownValue = null;
		workInProgressRootDidSkipSuspendedSiblings = !1;
		workInProgressRootIsPrerendering = checkIfRootIsPrerendering(root, lanes);
		workInProgressRootDidAttachPingListener = !1;
		workInProgressSuspendedRetryLanes = workInProgressDeferredLane = workInProgressRootPingedLanes = workInProgressRootInterleavedUpdatedLanes = workInProgressRootSkippedLanes = workInProgressRootExitStatus = 0;
		workInProgressRootRecoverableErrors = workInProgressRootConcurrentErrors = null;
		workInProgressRootDidIncludeRecursiveRenderUpdate = !1;
		0 !== (lanes & 8) && (lanes |= lanes & 32);
		var allEntangledLanes = root.entangledLanes;
		if (0 !== allEntangledLanes) for (root = root.entanglements, allEntangledLanes &= lanes; 0 < allEntangledLanes;) {
			var index$4 = 31 - clz32(allEntangledLanes), lane = 1 << index$4;
			lanes |= root[index$4];
			allEntangledLanes &= ~lane;
		}
		entangledRenderLanes = lanes;
		finishQueueingConcurrentUpdates();
		return timeoutHandle;
	}
	function handleThrow(root, thrownValue) {
		currentlyRenderingFiber = null;
		ReactSharedInternals.H = ContextOnlyDispatcher;
		thrownValue === SuspenseException || thrownValue === SuspenseActionException ? (thrownValue = getSuspendedThenable(), workInProgressSuspendedReason = 3) : thrownValue === SuspenseyCommitException ? (thrownValue = getSuspendedThenable(), workInProgressSuspendedReason = 4) : workInProgressSuspendedReason = thrownValue === SelectiveHydrationException ? 8 : null !== thrownValue && "object" === typeof thrownValue && "function" === typeof thrownValue.then ? 6 : 1;
		workInProgressThrownValue = thrownValue;
		null === workInProgress && (workInProgressRootExitStatus = 1, logUncaughtError(root, createCapturedValueAtFiber(thrownValue, root.current)));
	}
	function shouldRemainOnPreviousScreen() {
		var handler = suspenseHandlerStackCursor.current;
		return null === handler ? !0 : (workInProgressRootRenderLanes & 4194048) === workInProgressRootRenderLanes ? null === shellBoundary ? !0 : !1 : (workInProgressRootRenderLanes & 62914560) === workInProgressRootRenderLanes || 0 !== (workInProgressRootRenderLanes & 536870912) ? handler === shellBoundary : !1;
	}
	function pushDispatcher() {
		var prevDispatcher = ReactSharedInternals.H;
		ReactSharedInternals.H = ContextOnlyDispatcher;
		return null === prevDispatcher ? ContextOnlyDispatcher : prevDispatcher;
	}
	function pushAsyncDispatcher() {
		var prevAsyncDispatcher = ReactSharedInternals.A;
		ReactSharedInternals.A = DefaultAsyncDispatcher;
		return prevAsyncDispatcher;
	}
	function renderDidSuspendDelayIfPossible() {
		workInProgressRootExitStatus = 4;
		workInProgressRootDidSkipSuspendedSiblings || (workInProgressRootRenderLanes & 4194048) !== workInProgressRootRenderLanes && null !== suspenseHandlerStackCursor.current || (workInProgressRootIsPrerendering = !0);
		0 === (workInProgressRootSkippedLanes & 134217727) && 0 === (workInProgressRootInterleavedUpdatedLanes & 134217727) || null === workInProgressRoot || markRootSuspended(workInProgressRoot, workInProgressRootRenderLanes, workInProgressDeferredLane, !1);
	}
	function renderRootSync(root, lanes, shouldYieldForPrerendering) {
		var prevExecutionContext = executionContext;
		executionContext |= 2;
		var prevDispatcher = pushDispatcher(), prevAsyncDispatcher = pushAsyncDispatcher();
		if (workInProgressRoot !== root || workInProgressRootRenderLanes !== lanes) workInProgressTransitions = null, prepareFreshStack(root, lanes);
		lanes = !1;
		var exitStatus = workInProgressRootExitStatus;
		a: do
			try {
				if (0 !== workInProgressSuspendedReason && null !== workInProgress) {
					var unitOfWork = workInProgress, thrownValue = workInProgressThrownValue;
					switch (workInProgressSuspendedReason) {
						case 8:
							resetWorkInProgressStack();
							exitStatus = 6;
							break a;
						case 3:
						case 2:
						case 9:
						case 6:
							null === suspenseHandlerStackCursor.current && (lanes = !0);
							var reason = workInProgressSuspendedReason;
							workInProgressSuspendedReason = 0;
							workInProgressThrownValue = null;
							throwAndUnwindWorkLoop(root, unitOfWork, thrownValue, reason);
							if (shouldYieldForPrerendering && workInProgressRootIsPrerendering) {
								exitStatus = 0;
								break a;
							}
							break;
						default: reason = workInProgressSuspendedReason, workInProgressSuspendedReason = 0, workInProgressThrownValue = null, throwAndUnwindWorkLoop(root, unitOfWork, thrownValue, reason);
					}
				}
				workLoopSync();
				exitStatus = workInProgressRootExitStatus;
				break;
			} catch (thrownValue$165) {
				handleThrow(root, thrownValue$165);
			}
		while (1);
		lanes && root.shellSuspendCounter++;
		lastContextDependency = currentlyRenderingFiber$1 = null;
		executionContext = prevExecutionContext;
		ReactSharedInternals.H = prevDispatcher;
		ReactSharedInternals.A = prevAsyncDispatcher;
		null === workInProgress && (workInProgressRoot = null, workInProgressRootRenderLanes = 0, finishQueueingConcurrentUpdates());
		return exitStatus;
	}
	function workLoopSync() {
		for (; null !== workInProgress;) performUnitOfWork(workInProgress);
	}
	function renderRootConcurrent(root, lanes) {
		var prevExecutionContext = executionContext;
		executionContext |= 2;
		var prevDispatcher = pushDispatcher(), prevAsyncDispatcher = pushAsyncDispatcher();
		workInProgressRoot !== root || workInProgressRootRenderLanes !== lanes ? (workInProgressTransitions = null, workInProgressRootRenderTargetTime = now() + 500, prepareFreshStack(root, lanes)) : workInProgressRootIsPrerendering = checkIfRootIsPrerendering(root, lanes);
		a: do
			try {
				if (0 !== workInProgressSuspendedReason && null !== workInProgress) {
					lanes = workInProgress;
					var thrownValue = workInProgressThrownValue;
					b: switch (workInProgressSuspendedReason) {
						case 1:
							workInProgressSuspendedReason = 0;
							workInProgressThrownValue = null;
							throwAndUnwindWorkLoop(root, lanes, thrownValue, 1);
							break;
						case 2:
						case 9:
							if (isThenableResolved(thrownValue)) {
								workInProgressSuspendedReason = 0;
								workInProgressThrownValue = null;
								replaySuspendedUnitOfWork(lanes);
								break;
							}
							lanes = function() {
								2 !== workInProgressSuspendedReason && 9 !== workInProgressSuspendedReason || workInProgressRoot !== root || (workInProgressSuspendedReason = 7);
								ensureRootIsScheduled(root);
							};
							thrownValue.then(lanes, lanes);
							break a;
						case 3:
							workInProgressSuspendedReason = 7;
							break a;
						case 4:
							workInProgressSuspendedReason = 5;
							break a;
						case 7:
							isThenableResolved(thrownValue) ? (workInProgressSuspendedReason = 0, workInProgressThrownValue = null, replaySuspendedUnitOfWork(lanes)) : (workInProgressSuspendedReason = 0, workInProgressThrownValue = null, throwAndUnwindWorkLoop(root, lanes, thrownValue, 7));
							break;
						case 5:
							var resource = null;
							switch (workInProgress.tag) {
								case 26: resource = workInProgress.memoizedState;
								case 5:
								case 27:
									var hostFiber = workInProgress;
									if (resource ? preloadResource(resource) : hostFiber.stateNode.complete) {
										workInProgressSuspendedReason = 0;
										workInProgressThrownValue = null;
										var sibling = hostFiber.sibling;
										if (null !== sibling) workInProgress = sibling;
										else {
											var returnFiber = hostFiber.return;
											null !== returnFiber ? (workInProgress = returnFiber, completeUnitOfWork(returnFiber)) : workInProgress = null;
										}
										break b;
									}
							}
							workInProgressSuspendedReason = 0;
							workInProgressThrownValue = null;
							throwAndUnwindWorkLoop(root, lanes, thrownValue, 5);
							break;
						case 6:
							workInProgressSuspendedReason = 0;
							workInProgressThrownValue = null;
							throwAndUnwindWorkLoop(root, lanes, thrownValue, 6);
							break;
						case 8:
							resetWorkInProgressStack();
							workInProgressRootExitStatus = 6;
							break a;
						default: throw Error(formatProdErrorMessage(462));
					}
				}
				workLoopConcurrentByScheduler();
				break;
			} catch (thrownValue$167) {
				handleThrow(root, thrownValue$167);
			}
		while (1);
		lastContextDependency = currentlyRenderingFiber$1 = null;
		ReactSharedInternals.H = prevDispatcher;
		ReactSharedInternals.A = prevAsyncDispatcher;
		executionContext = prevExecutionContext;
		if (null !== workInProgress) return 0;
		workInProgressRoot = null;
		workInProgressRootRenderLanes = 0;
		finishQueueingConcurrentUpdates();
		return workInProgressRootExitStatus;
	}
	function workLoopConcurrentByScheduler() {
		for (; null !== workInProgress && !shouldYield();) performUnitOfWork(workInProgress);
	}
	function performUnitOfWork(unitOfWork) {
		var next = beginWork(unitOfWork.alternate, unitOfWork, entangledRenderLanes);
		unitOfWork.memoizedProps = unitOfWork.pendingProps;
		null === next ? completeUnitOfWork(unitOfWork) : workInProgress = next;
	}
	function replaySuspendedUnitOfWork(unitOfWork) {
		var next = unitOfWork;
		var current = next.alternate;
		switch (next.tag) {
			case 15:
			case 0:
				next = replayFunctionComponent(current, next, next.pendingProps, next.type, void 0, workInProgressRootRenderLanes);
				break;
			case 11:
				next = replayFunctionComponent(current, next, next.pendingProps, next.type.render, next.ref, workInProgressRootRenderLanes);
				break;
			case 5: resetHooksOnUnwind(next);
			default: unwindInterruptedWork(current, next), next = workInProgress = resetWorkInProgress(next, entangledRenderLanes), next = beginWork(current, next, entangledRenderLanes);
		}
		unitOfWork.memoizedProps = unitOfWork.pendingProps;
		null === next ? completeUnitOfWork(unitOfWork) : workInProgress = next;
	}
	function throwAndUnwindWorkLoop(root, unitOfWork, thrownValue, suspendedReason) {
		lastContextDependency = currentlyRenderingFiber$1 = null;
		resetHooksOnUnwind(unitOfWork);
		thenableState$1 = null;
		thenableIndexCounter$1 = 0;
		var returnFiber = unitOfWork.return;
		try {
			if (throwException(root, returnFiber, unitOfWork, thrownValue, workInProgressRootRenderLanes)) {
				workInProgressRootExitStatus = 1;
				logUncaughtError(root, createCapturedValueAtFiber(thrownValue, root.current));
				workInProgress = null;
				return;
			}
		} catch (error) {
			if (null !== returnFiber) throw workInProgress = returnFiber, error;
			workInProgressRootExitStatus = 1;
			logUncaughtError(root, createCapturedValueAtFiber(thrownValue, root.current));
			workInProgress = null;
			return;
		}
		if (unitOfWork.flags & 32768) {
			if (isHydrating || 1 === suspendedReason) root = !0;
			else if (workInProgressRootIsPrerendering || 0 !== (workInProgressRootRenderLanes & 536870912)) root = !1;
			else if (workInProgressRootDidSkipSuspendedSiblings = root = !0, 2 === suspendedReason || 9 === suspendedReason || 3 === suspendedReason || 6 === suspendedReason) suspendedReason = suspenseHandlerStackCursor.current, null !== suspendedReason && 13 === suspendedReason.tag && (suspendedReason.flags |= 16384);
			unwindUnitOfWork(unitOfWork, root);
		} else completeUnitOfWork(unitOfWork);
	}
	function completeUnitOfWork(unitOfWork) {
		var completedWork = unitOfWork;
		do {
			if (0 !== (completedWork.flags & 32768)) {
				unwindUnitOfWork(completedWork, workInProgressRootDidSkipSuspendedSiblings);
				return;
			}
			unitOfWork = completedWork.return;
			var next = completeWork(completedWork.alternate, completedWork, entangledRenderLanes);
			if (null !== next) {
				workInProgress = next;
				return;
			}
			completedWork = completedWork.sibling;
			if (null !== completedWork) {
				workInProgress = completedWork;
				return;
			}
			workInProgress = completedWork = unitOfWork;
		} while (null !== completedWork);
		0 === workInProgressRootExitStatus && (workInProgressRootExitStatus = 5);
	}
	function unwindUnitOfWork(unitOfWork, skipSiblings) {
		do {
			var next = unwindWork(unitOfWork.alternate, unitOfWork);
			if (null !== next) {
				next.flags &= 32767;
				workInProgress = next;
				return;
			}
			next = unitOfWork.return;
			null !== next && (next.flags |= 32768, next.subtreeFlags = 0, next.deletions = null);
			if (!skipSiblings && (unitOfWork = unitOfWork.sibling, null !== unitOfWork)) {
				workInProgress = unitOfWork;
				return;
			}
			workInProgress = unitOfWork = next;
		} while (null !== unitOfWork);
		workInProgressRootExitStatus = 6;
		workInProgress = null;
	}
	function commitRoot(root, finishedWork, lanes, recoverableErrors, transitions, didIncludeRenderPhaseUpdate, spawnedLane, updatedLanes, suspendedRetryLanes) {
		root.cancelPendingCommit = null;
		do
			flushPendingEffects();
		while (0 !== pendingEffectsStatus);
		if (0 !== (executionContext & 6)) throw Error(formatProdErrorMessage(327));
		if (null !== finishedWork) {
			if (finishedWork === root.current) throw Error(formatProdErrorMessage(177));
			didIncludeRenderPhaseUpdate = finishedWork.lanes | finishedWork.childLanes;
			didIncludeRenderPhaseUpdate |= concurrentlyUpdatedLanes;
			markRootFinished(root, lanes, didIncludeRenderPhaseUpdate, spawnedLane, updatedLanes, suspendedRetryLanes);
			root === workInProgressRoot && (workInProgress = workInProgressRoot = null, workInProgressRootRenderLanes = 0);
			pendingFinishedWork = finishedWork;
			pendingEffectsRoot = root;
			pendingEffectsLanes = lanes;
			pendingEffectsRemainingLanes = didIncludeRenderPhaseUpdate;
			pendingPassiveTransitions = transitions;
			pendingRecoverableErrors = recoverableErrors;
			0 !== (finishedWork.subtreeFlags & 10256) || 0 !== (finishedWork.flags & 10256) ? (root.callbackNode = null, root.callbackPriority = 0, scheduleCallback$1(NormalPriority$1, function() {
				flushPassiveEffects();
				return null;
			})) : (root.callbackNode = null, root.callbackPriority = 0);
			recoverableErrors = 0 !== (finishedWork.flags & 13878);
			if (0 !== (finishedWork.subtreeFlags & 13878) || recoverableErrors) {
				recoverableErrors = ReactSharedInternals.T;
				ReactSharedInternals.T = null;
				transitions = ReactDOMSharedInternals.p;
				ReactDOMSharedInternals.p = 2;
				spawnedLane = executionContext;
				executionContext |= 4;
				try {
					commitBeforeMutationEffects(root, finishedWork, lanes);
				} finally {
					executionContext = spawnedLane, ReactDOMSharedInternals.p = transitions, ReactSharedInternals.T = recoverableErrors;
				}
			}
			pendingEffectsStatus = 1;
			flushMutationEffects();
			flushLayoutEffects();
			flushSpawnedWork();
		}
	}
	function flushMutationEffects() {
		if (1 === pendingEffectsStatus) {
			pendingEffectsStatus = 0;
			var root = pendingEffectsRoot, finishedWork = pendingFinishedWork, rootMutationHasEffect = 0 !== (finishedWork.flags & 13878);
			if (0 !== (finishedWork.subtreeFlags & 13878) || rootMutationHasEffect) {
				rootMutationHasEffect = ReactSharedInternals.T;
				ReactSharedInternals.T = null;
				var previousPriority = ReactDOMSharedInternals.p;
				ReactDOMSharedInternals.p = 2;
				var prevExecutionContext = executionContext;
				executionContext |= 4;
				try {
					commitMutationEffectsOnFiber(finishedWork, root);
					var priorSelectionInformation = selectionInformation, curFocusedElem = getActiveElementDeep(root.containerInfo), priorFocusedElem = priorSelectionInformation.focusedElem, priorSelectionRange = priorSelectionInformation.selectionRange;
					if (curFocusedElem !== priorFocusedElem && priorFocusedElem && priorFocusedElem.ownerDocument && containsNode(priorFocusedElem.ownerDocument.documentElement, priorFocusedElem)) {
						if (null !== priorSelectionRange && hasSelectionCapabilities(priorFocusedElem)) {
							var start = priorSelectionRange.start, end = priorSelectionRange.end;
							void 0 === end && (end = start);
							if ("selectionStart" in priorFocusedElem) priorFocusedElem.selectionStart = start, priorFocusedElem.selectionEnd = Math.min(end, priorFocusedElem.value.length);
							else {
								var doc = priorFocusedElem.ownerDocument || document, win = doc && doc.defaultView || window;
								if (win.getSelection) {
									var selection = win.getSelection(), length = priorFocusedElem.textContent.length, start$jscomp$0 = Math.min(priorSelectionRange.start, length), end$jscomp$0 = void 0 === priorSelectionRange.end ? start$jscomp$0 : Math.min(priorSelectionRange.end, length);
									!selection.extend && start$jscomp$0 > end$jscomp$0 && (curFocusedElem = end$jscomp$0, end$jscomp$0 = start$jscomp$0, start$jscomp$0 = curFocusedElem);
									var startMarker = getNodeForCharacterOffset(priorFocusedElem, start$jscomp$0), endMarker = getNodeForCharacterOffset(priorFocusedElem, end$jscomp$0);
									if (startMarker && endMarker && (1 !== selection.rangeCount || selection.anchorNode !== startMarker.node || selection.anchorOffset !== startMarker.offset || selection.focusNode !== endMarker.node || selection.focusOffset !== endMarker.offset)) {
										var range = doc.createRange();
										range.setStart(startMarker.node, startMarker.offset);
										selection.removeAllRanges();
										start$jscomp$0 > end$jscomp$0 ? (selection.addRange(range), selection.extend(endMarker.node, endMarker.offset)) : (range.setEnd(endMarker.node, endMarker.offset), selection.addRange(range));
									}
								}
							}
						}
						doc = [];
						for (selection = priorFocusedElem; selection = selection.parentNode;) 1 === selection.nodeType && doc.push({
							element: selection,
							left: selection.scrollLeft,
							top: selection.scrollTop
						});
						"function" === typeof priorFocusedElem.focus && priorFocusedElem.focus();
						for (priorFocusedElem = 0; priorFocusedElem < doc.length; priorFocusedElem++) {
							var info = doc[priorFocusedElem];
							info.element.scrollLeft = info.left;
							info.element.scrollTop = info.top;
						}
					}
					_enabled = !!eventsEnabled;
					selectionInformation = eventsEnabled = null;
				} finally {
					executionContext = prevExecutionContext, ReactDOMSharedInternals.p = previousPriority, ReactSharedInternals.T = rootMutationHasEffect;
				}
			}
			root.current = finishedWork;
			pendingEffectsStatus = 2;
		}
	}
	function flushLayoutEffects() {
		if (2 === pendingEffectsStatus) {
			pendingEffectsStatus = 0;
			var root = pendingEffectsRoot, finishedWork = pendingFinishedWork, rootHasLayoutEffect = 0 !== (finishedWork.flags & 8772);
			if (0 !== (finishedWork.subtreeFlags & 8772) || rootHasLayoutEffect) {
				rootHasLayoutEffect = ReactSharedInternals.T;
				ReactSharedInternals.T = null;
				var previousPriority = ReactDOMSharedInternals.p;
				ReactDOMSharedInternals.p = 2;
				var prevExecutionContext = executionContext;
				executionContext |= 4;
				try {
					commitLayoutEffectOnFiber(root, finishedWork.alternate, finishedWork);
				} finally {
					executionContext = prevExecutionContext, ReactDOMSharedInternals.p = previousPriority, ReactSharedInternals.T = rootHasLayoutEffect;
				}
			}
			pendingEffectsStatus = 3;
		}
	}
	function flushSpawnedWork() {
		if (4 === pendingEffectsStatus || 3 === pendingEffectsStatus) {
			pendingEffectsStatus = 0;
			requestPaint();
			var root = pendingEffectsRoot, finishedWork = pendingFinishedWork, lanes = pendingEffectsLanes, recoverableErrors = pendingRecoverableErrors;
			0 !== (finishedWork.subtreeFlags & 10256) || 0 !== (finishedWork.flags & 10256) ? pendingEffectsStatus = 5 : (pendingEffectsStatus = 0, pendingFinishedWork = pendingEffectsRoot = null, releaseRootPooledCache(root, root.pendingLanes));
			var remainingLanes = root.pendingLanes;
			0 === remainingLanes && (legacyErrorBoundariesThatAlreadyFailed = null);
			lanesToEventPriority(lanes);
			finishedWork = finishedWork.stateNode;
			if (injectedHook && "function" === typeof injectedHook.onCommitFiberRoot) try {
				injectedHook.onCommitFiberRoot(rendererID, finishedWork, void 0, 128 === (finishedWork.current.flags & 128));
			} catch (err) {}
			if (null !== recoverableErrors) {
				finishedWork = ReactSharedInternals.T;
				remainingLanes = ReactDOMSharedInternals.p;
				ReactDOMSharedInternals.p = 2;
				ReactSharedInternals.T = null;
				try {
					for (var onRecoverableError = root.onRecoverableError, i = 0; i < recoverableErrors.length; i++) {
						var recoverableError = recoverableErrors[i];
						onRecoverableError(recoverableError.value, { componentStack: recoverableError.stack });
					}
				} finally {
					ReactSharedInternals.T = finishedWork, ReactDOMSharedInternals.p = remainingLanes;
				}
			}
			0 !== (pendingEffectsLanes & 3) && flushPendingEffects();
			ensureRootIsScheduled(root);
			remainingLanes = root.pendingLanes;
			0 !== (lanes & 261930) && 0 !== (remainingLanes & 42) ? root === rootWithNestedUpdates ? nestedUpdateCount++ : (nestedUpdateCount = 0, rootWithNestedUpdates = root) : nestedUpdateCount = 0;
			flushSyncWorkAcrossRoots_impl(0, !1);
		}
	}
	function releaseRootPooledCache(root, remainingLanes) {
		0 === (root.pooledCacheLanes &= remainingLanes) && (remainingLanes = root.pooledCache, null != remainingLanes && (root.pooledCache = null, releaseCache(remainingLanes)));
	}
	function flushPendingEffects() {
		flushMutationEffects();
		flushLayoutEffects();
		flushSpawnedWork();
		return flushPassiveEffects();
	}
	function flushPassiveEffects() {
		if (5 !== pendingEffectsStatus) return !1;
		var root = pendingEffectsRoot, remainingLanes = pendingEffectsRemainingLanes;
		pendingEffectsRemainingLanes = 0;
		var renderPriority = lanesToEventPriority(pendingEffectsLanes), prevTransition = ReactSharedInternals.T, previousPriority = ReactDOMSharedInternals.p;
		try {
			ReactDOMSharedInternals.p = 32 > renderPriority ? 32 : renderPriority;
			ReactSharedInternals.T = null;
			renderPriority = pendingPassiveTransitions;
			pendingPassiveTransitions = null;
			var root$jscomp$0 = pendingEffectsRoot, lanes = pendingEffectsLanes;
			pendingEffectsStatus = 0;
			pendingFinishedWork = pendingEffectsRoot = null;
			pendingEffectsLanes = 0;
			if (0 !== (executionContext & 6)) throw Error(formatProdErrorMessage(331));
			var prevExecutionContext = executionContext;
			executionContext |= 4;
			commitPassiveUnmountOnFiber(root$jscomp$0.current);
			commitPassiveMountOnFiber(root$jscomp$0, root$jscomp$0.current, lanes, renderPriority);
			executionContext = prevExecutionContext;
			flushSyncWorkAcrossRoots_impl(0, !1);
			if (injectedHook && "function" === typeof injectedHook.onPostCommitFiberRoot) try {
				injectedHook.onPostCommitFiberRoot(rendererID, root$jscomp$0);
			} catch (err) {}
			return !0;
		} finally {
			ReactDOMSharedInternals.p = previousPriority, ReactSharedInternals.T = prevTransition, releaseRootPooledCache(root, remainingLanes);
		}
	}
	function captureCommitPhaseErrorOnRoot(rootFiber, sourceFiber, error) {
		sourceFiber = createCapturedValueAtFiber(error, sourceFiber);
		sourceFiber = createRootErrorUpdate(rootFiber.stateNode, sourceFiber, 2);
		rootFiber = enqueueUpdate(rootFiber, sourceFiber, 2);
		null !== rootFiber && (markRootUpdated$1(rootFiber, 2), ensureRootIsScheduled(rootFiber));
	}
	function captureCommitPhaseError(sourceFiber, nearestMountedAncestor, error) {
		if (3 === sourceFiber.tag) captureCommitPhaseErrorOnRoot(sourceFiber, sourceFiber, error);
		else for (; null !== nearestMountedAncestor;) {
			if (3 === nearestMountedAncestor.tag) {
				captureCommitPhaseErrorOnRoot(nearestMountedAncestor, sourceFiber, error);
				break;
			} else if (1 === nearestMountedAncestor.tag) {
				var instance = nearestMountedAncestor.stateNode;
				if ("function" === typeof nearestMountedAncestor.type.getDerivedStateFromError || "function" === typeof instance.componentDidCatch && (null === legacyErrorBoundariesThatAlreadyFailed || !legacyErrorBoundariesThatAlreadyFailed.has(instance))) {
					sourceFiber = createCapturedValueAtFiber(error, sourceFiber);
					error = createClassErrorUpdate(2);
					instance = enqueueUpdate(nearestMountedAncestor, error, 2);
					null !== instance && (initializeClassErrorUpdate(error, instance, nearestMountedAncestor, sourceFiber), markRootUpdated$1(instance, 2), ensureRootIsScheduled(instance));
					break;
				}
			}
			nearestMountedAncestor = nearestMountedAncestor.return;
		}
	}
	function attachPingListener(root, wakeable, lanes) {
		var pingCache = root.pingCache;
		if (null === pingCache) {
			pingCache = root.pingCache = new PossiblyWeakMap();
			var threadIDs = /* @__PURE__ */ new Set();
			pingCache.set(wakeable, threadIDs);
		} else threadIDs = pingCache.get(wakeable), void 0 === threadIDs && (threadIDs = /* @__PURE__ */ new Set(), pingCache.set(wakeable, threadIDs));
		threadIDs.has(lanes) || (workInProgressRootDidAttachPingListener = !0, threadIDs.add(lanes), root = pingSuspendedRoot.bind(null, root, wakeable, lanes), wakeable.then(root, root));
	}
	function pingSuspendedRoot(root, wakeable, pingedLanes) {
		var pingCache = root.pingCache;
		null !== pingCache && pingCache.delete(wakeable);
		root.pingedLanes |= root.suspendedLanes & pingedLanes;
		root.warmLanes &= ~pingedLanes;
		workInProgressRoot === root && (workInProgressRootRenderLanes & pingedLanes) === pingedLanes && (4 === workInProgressRootExitStatus || 3 === workInProgressRootExitStatus && (workInProgressRootRenderLanes & 62914560) === workInProgressRootRenderLanes && 300 > now() - globalMostRecentFallbackTime ? 0 === (executionContext & 2) && prepareFreshStack(root, 0) : workInProgressRootPingedLanes |= pingedLanes, workInProgressSuspendedRetryLanes === workInProgressRootRenderLanes && (workInProgressSuspendedRetryLanes = 0));
		ensureRootIsScheduled(root);
	}
	function retryTimedOutBoundary(boundaryFiber, retryLane) {
		0 === retryLane && (retryLane = claimNextRetryLane());
		boundaryFiber = enqueueConcurrentRenderForLane(boundaryFiber, retryLane);
		null !== boundaryFiber && (markRootUpdated$1(boundaryFiber, retryLane), ensureRootIsScheduled(boundaryFiber));
	}
	function retryDehydratedSuspenseBoundary(boundaryFiber) {
		var suspenseState = boundaryFiber.memoizedState, retryLane = 0;
		null !== suspenseState && (retryLane = suspenseState.retryLane);
		retryTimedOutBoundary(boundaryFiber, retryLane);
	}
	function resolveRetryWakeable(boundaryFiber, wakeable) {
		var retryLane = 0;
		switch (boundaryFiber.tag) {
			case 31:
			case 13:
				var retryCache = boundaryFiber.stateNode;
				var suspenseState = boundaryFiber.memoizedState;
				null !== suspenseState && (retryLane = suspenseState.retryLane);
				break;
			case 19:
				retryCache = boundaryFiber.stateNode;
				break;
			case 22:
				retryCache = boundaryFiber.stateNode._retryCache;
				break;
			default: throw Error(formatProdErrorMessage(314));
		}
		null !== retryCache && retryCache.delete(wakeable);
		retryTimedOutBoundary(boundaryFiber, retryLane);
	}
	function scheduleCallback$1(priorityLevel, callback) {
		return scheduleCallback$3(priorityLevel, callback);
	}
	var firstScheduledRoot = null, lastScheduledRoot = null, didScheduleMicrotask = !1, mightHavePendingSyncWork = !1, isFlushingWork = !1, currentEventTransitionLane = 0;
	function ensureRootIsScheduled(root) {
		root !== lastScheduledRoot && null === root.next && (null === lastScheduledRoot ? firstScheduledRoot = lastScheduledRoot = root : lastScheduledRoot = lastScheduledRoot.next = root);
		mightHavePendingSyncWork = !0;
		didScheduleMicrotask || (didScheduleMicrotask = !0, scheduleImmediateRootScheduleTask());
	}
	function flushSyncWorkAcrossRoots_impl(syncTransitionLanes, onlyLegacy) {
		if (!isFlushingWork && mightHavePendingSyncWork) {
			isFlushingWork = !0;
			do {
				var didPerformSomeWork = !1;
				for (var root$170 = firstScheduledRoot; null !== root$170;) {
					if (!onlyLegacy) if (0 !== syncTransitionLanes) {
						var pendingLanes = root$170.pendingLanes;
						if (0 === pendingLanes) var JSCompiler_inline_result = 0;
						else {
							var suspendedLanes = root$170.suspendedLanes, pingedLanes = root$170.pingedLanes;
							JSCompiler_inline_result = (1 << 31 - clz32(42 | syncTransitionLanes) + 1) - 1;
							JSCompiler_inline_result &= pendingLanes & ~(suspendedLanes & ~pingedLanes);
							JSCompiler_inline_result = JSCompiler_inline_result & 201326741 ? JSCompiler_inline_result & 201326741 | 1 : JSCompiler_inline_result ? JSCompiler_inline_result | 2 : 0;
						}
						0 !== JSCompiler_inline_result && (didPerformSomeWork = !0, performSyncWorkOnRoot(root$170, JSCompiler_inline_result));
					} else JSCompiler_inline_result = workInProgressRootRenderLanes, JSCompiler_inline_result = getNextLanes(root$170, root$170 === workInProgressRoot ? JSCompiler_inline_result : 0, null !== root$170.cancelPendingCommit || -1 !== root$170.timeoutHandle), 0 === (JSCompiler_inline_result & 3) || checkIfRootIsPrerendering(root$170, JSCompiler_inline_result) || (didPerformSomeWork = !0, performSyncWorkOnRoot(root$170, JSCompiler_inline_result));
					root$170 = root$170.next;
				}
			} while (didPerformSomeWork);
			isFlushingWork = !1;
		}
	}
	function processRootScheduleInImmediateTask() {
		processRootScheduleInMicrotask();
	}
	function processRootScheduleInMicrotask() {
		mightHavePendingSyncWork = didScheduleMicrotask = !1;
		var syncTransitionLanes = 0;
		0 !== currentEventTransitionLane && shouldAttemptEagerTransition() && (syncTransitionLanes = currentEventTransitionLane);
		for (var currentTime = now(), prev = null, root = firstScheduledRoot; null !== root;) {
			var next = root.next, nextLanes = scheduleTaskForRootDuringMicrotask(root, currentTime);
			if (0 === nextLanes) root.next = null, null === prev ? firstScheduledRoot = next : prev.next = next, null === next && (lastScheduledRoot = prev);
			else if (prev = root, 0 !== syncTransitionLanes || 0 !== (nextLanes & 3)) mightHavePendingSyncWork = !0;
			root = next;
		}
		0 !== pendingEffectsStatus && 5 !== pendingEffectsStatus || flushSyncWorkAcrossRoots_impl(syncTransitionLanes, !1);
		0 !== currentEventTransitionLane && (currentEventTransitionLane = 0);
	}
	function scheduleTaskForRootDuringMicrotask(root, currentTime) {
		for (var suspendedLanes = root.suspendedLanes, pingedLanes = root.pingedLanes, expirationTimes = root.expirationTimes, lanes = root.pendingLanes & -62914561; 0 < lanes;) {
			var index$5 = 31 - clz32(lanes), lane = 1 << index$5, expirationTime = expirationTimes[index$5];
			if (-1 === expirationTime) {
				if (0 === (lane & suspendedLanes) || 0 !== (lane & pingedLanes)) expirationTimes[index$5] = computeExpirationTime(lane, currentTime);
			} else expirationTime <= currentTime && (root.expiredLanes |= lane);
			lanes &= ~lane;
		}
		currentTime = workInProgressRoot;
		suspendedLanes = workInProgressRootRenderLanes;
		suspendedLanes = getNextLanes(root, root === currentTime ? suspendedLanes : 0, null !== root.cancelPendingCommit || -1 !== root.timeoutHandle);
		pingedLanes = root.callbackNode;
		if (0 === suspendedLanes || root === currentTime && (2 === workInProgressSuspendedReason || 9 === workInProgressSuspendedReason) || null !== root.cancelPendingCommit) return null !== pingedLanes && null !== pingedLanes && cancelCallback$1(pingedLanes), root.callbackNode = null, root.callbackPriority = 0;
		if (0 === (suspendedLanes & 3) || checkIfRootIsPrerendering(root, suspendedLanes)) {
			currentTime = suspendedLanes & -suspendedLanes;
			if (currentTime === root.callbackPriority) return currentTime;
			null !== pingedLanes && cancelCallback$1(pingedLanes);
			switch (lanesToEventPriority(suspendedLanes)) {
				case 2:
				case 8:
					suspendedLanes = UserBlockingPriority;
					break;
				case 32:
					suspendedLanes = NormalPriority$1;
					break;
				case 268435456:
					suspendedLanes = IdlePriority;
					break;
				default: suspendedLanes = NormalPriority$1;
			}
			pingedLanes = performWorkOnRootViaSchedulerTask.bind(null, root);
			suspendedLanes = scheduleCallback$3(suspendedLanes, pingedLanes);
			root.callbackPriority = currentTime;
			root.callbackNode = suspendedLanes;
			return currentTime;
		}
		null !== pingedLanes && null !== pingedLanes && cancelCallback$1(pingedLanes);
		root.callbackPriority = 2;
		root.callbackNode = null;
		return 2;
	}
	function performWorkOnRootViaSchedulerTask(root, didTimeout) {
		if (0 !== pendingEffectsStatus && 5 !== pendingEffectsStatus) return root.callbackNode = null, root.callbackPriority = 0, null;
		var originalCallbackNode = root.callbackNode;
		if (flushPendingEffects() && root.callbackNode !== originalCallbackNode) return null;
		var workInProgressRootRenderLanes$jscomp$0 = workInProgressRootRenderLanes;
		workInProgressRootRenderLanes$jscomp$0 = getNextLanes(root, root === workInProgressRoot ? workInProgressRootRenderLanes$jscomp$0 : 0, null !== root.cancelPendingCommit || -1 !== root.timeoutHandle);
		if (0 === workInProgressRootRenderLanes$jscomp$0) return null;
		performWorkOnRoot(root, workInProgressRootRenderLanes$jscomp$0, didTimeout);
		scheduleTaskForRootDuringMicrotask(root, now());
		return null != root.callbackNode && root.callbackNode === originalCallbackNode ? performWorkOnRootViaSchedulerTask.bind(null, root) : null;
	}
	function performSyncWorkOnRoot(root, lanes) {
		if (flushPendingEffects()) return null;
		performWorkOnRoot(root, lanes, !0);
	}
	function scheduleImmediateRootScheduleTask() {
		scheduleMicrotask(function() {
			0 !== (executionContext & 6) ? scheduleCallback$3(ImmediatePriority, processRootScheduleInImmediateTask) : processRootScheduleInMicrotask();
		});
	}
	function requestTransitionLane() {
		if (0 === currentEventTransitionLane) {
			var actionScopeLane = currentEntangledLane;
			0 === actionScopeLane && (actionScopeLane = nextTransitionUpdateLane, nextTransitionUpdateLane <<= 1, 0 === (nextTransitionUpdateLane & 261888) && (nextTransitionUpdateLane = 256));
			currentEventTransitionLane = actionScopeLane;
		}
		return currentEventTransitionLane;
	}
	function coerceFormActionProp(actionProp) {
		return null == actionProp || "symbol" === typeof actionProp || "boolean" === typeof actionProp ? null : "function" === typeof actionProp ? actionProp : sanitizeURL("" + actionProp);
	}
	function createFormDataWithSubmitter(form, submitter) {
		var temp = submitter.ownerDocument.createElement("input");
		temp.name = submitter.name;
		temp.value = submitter.value;
		form.id && temp.setAttribute("form", form.id);
		submitter.parentNode.insertBefore(temp, submitter);
		form = new FormData(form);
		temp.parentNode.removeChild(temp);
		return form;
	}
	function extractEvents$1(dispatchQueue, domEventName, maybeTargetInst, nativeEvent, nativeEventTarget) {
		if ("submit" === domEventName && maybeTargetInst && maybeTargetInst.stateNode === nativeEventTarget) {
			var action = coerceFormActionProp((nativeEventTarget[internalPropsKey] || null).action), submitter = nativeEvent.submitter;
			submitter && (domEventName = (domEventName = submitter[internalPropsKey] || null) ? coerceFormActionProp(domEventName.formAction) : submitter.getAttribute("formAction"), null !== domEventName && (action = domEventName, submitter = null));
			var event = new SyntheticEvent("action", "action", null, nativeEvent, nativeEventTarget);
			dispatchQueue.push({
				event,
				listeners: [{
					instance: null,
					listener: function() {
						if (nativeEvent.defaultPrevented) {
							if (0 !== currentEventTransitionLane) {
								var formData = submitter ? createFormDataWithSubmitter(nativeEventTarget, submitter) : new FormData(nativeEventTarget);
								startHostTransition(maybeTargetInst, {
									pending: !0,
									data: formData,
									method: nativeEventTarget.method,
									action
								}, null, formData);
							}
						} else "function" === typeof action && (event.preventDefault(), formData = submitter ? createFormDataWithSubmitter(nativeEventTarget, submitter) : new FormData(nativeEventTarget), startHostTransition(maybeTargetInst, {
							pending: !0,
							data: formData,
							method: nativeEventTarget.method,
							action
						}, action, formData));
					},
					currentTarget: nativeEventTarget
				}]
			});
		}
	}
	for (var i$jscomp$inline_1577 = 0; i$jscomp$inline_1577 < simpleEventPluginEvents.length; i$jscomp$inline_1577++) {
		var eventName$jscomp$inline_1578 = simpleEventPluginEvents[i$jscomp$inline_1577];
		registerSimpleEvent(eventName$jscomp$inline_1578.toLowerCase(), "on" + (eventName$jscomp$inline_1578[0].toUpperCase() + eventName$jscomp$inline_1578.slice(1)));
	}
	registerSimpleEvent(ANIMATION_END, "onAnimationEnd");
	registerSimpleEvent(ANIMATION_ITERATION, "onAnimationIteration");
	registerSimpleEvent(ANIMATION_START, "onAnimationStart");
	registerSimpleEvent("dblclick", "onDoubleClick");
	registerSimpleEvent("focusin", "onFocus");
	registerSimpleEvent("focusout", "onBlur");
	registerSimpleEvent(TRANSITION_RUN, "onTransitionRun");
	registerSimpleEvent(TRANSITION_START, "onTransitionStart");
	registerSimpleEvent(TRANSITION_CANCEL, "onTransitionCancel");
	registerSimpleEvent(TRANSITION_END, "onTransitionEnd");
	registerDirectEvent("onMouseEnter", ["mouseout", "mouseover"]);
	registerDirectEvent("onMouseLeave", ["mouseout", "mouseover"]);
	registerDirectEvent("onPointerEnter", ["pointerout", "pointerover"]);
	registerDirectEvent("onPointerLeave", ["pointerout", "pointerover"]);
	registerTwoPhaseEvent("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" "));
	registerTwoPhaseEvent("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));
	registerTwoPhaseEvent("onBeforeInput", [
		"compositionend",
		"keypress",
		"textInput",
		"paste"
	]);
	registerTwoPhaseEvent("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" "));
	registerTwoPhaseEvent("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" "));
	registerTwoPhaseEvent("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
	var mediaEventTypes = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "), nonDelegatedEvents = new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(mediaEventTypes));
	function processDispatchQueue(dispatchQueue, eventSystemFlags) {
		eventSystemFlags = 0 !== (eventSystemFlags & 4);
		for (var i = 0; i < dispatchQueue.length; i++) {
			var _dispatchQueue$i = dispatchQueue[i], event = _dispatchQueue$i.event;
			_dispatchQueue$i = _dispatchQueue$i.listeners;
			a: {
				var previousInstance = void 0;
				if (eventSystemFlags) for (var i$jscomp$0 = _dispatchQueue$i.length - 1; 0 <= i$jscomp$0; i$jscomp$0--) {
					var _dispatchListeners$i = _dispatchQueue$i[i$jscomp$0], instance = _dispatchListeners$i.instance, currentTarget = _dispatchListeners$i.currentTarget;
					_dispatchListeners$i = _dispatchListeners$i.listener;
					if (instance !== previousInstance && event.isPropagationStopped()) break a;
					previousInstance = _dispatchListeners$i;
					event.currentTarget = currentTarget;
					try {
						previousInstance(event);
					} catch (error) {
						reportGlobalError(error);
					}
					event.currentTarget = null;
					previousInstance = instance;
				}
				else for (i$jscomp$0 = 0; i$jscomp$0 < _dispatchQueue$i.length; i$jscomp$0++) {
					_dispatchListeners$i = _dispatchQueue$i[i$jscomp$0];
					instance = _dispatchListeners$i.instance;
					currentTarget = _dispatchListeners$i.currentTarget;
					_dispatchListeners$i = _dispatchListeners$i.listener;
					if (instance !== previousInstance && event.isPropagationStopped()) break a;
					previousInstance = _dispatchListeners$i;
					event.currentTarget = currentTarget;
					try {
						previousInstance(event);
					} catch (error) {
						reportGlobalError(error);
					}
					event.currentTarget = null;
					previousInstance = instance;
				}
			}
		}
	}
	function listenToNonDelegatedEvent(domEventName, targetElement) {
		var JSCompiler_inline_result = targetElement[internalEventHandlersKey];
		void 0 === JSCompiler_inline_result && (JSCompiler_inline_result = targetElement[internalEventHandlersKey] = /* @__PURE__ */ new Set());
		var listenerSetKey = domEventName + "__bubble";
		JSCompiler_inline_result.has(listenerSetKey) || (addTrappedEventListener(targetElement, domEventName, 2, !1), JSCompiler_inline_result.add(listenerSetKey));
	}
	function listenToNativeEvent(domEventName, isCapturePhaseListener, target) {
		var eventSystemFlags = 0;
		isCapturePhaseListener && (eventSystemFlags |= 4);
		addTrappedEventListener(target, domEventName, eventSystemFlags, isCapturePhaseListener);
	}
	var listeningMarker = "_reactListening" + Math.random().toString(36).slice(2);
	function listenToAllSupportedEvents(rootContainerElement) {
		if (!rootContainerElement[listeningMarker]) {
			rootContainerElement[listeningMarker] = !0;
			allNativeEvents.forEach(function(domEventName) {
				"selectionchange" !== domEventName && (nonDelegatedEvents.has(domEventName) || listenToNativeEvent(domEventName, !1, rootContainerElement), listenToNativeEvent(domEventName, !0, rootContainerElement));
			});
			var ownerDocument = 9 === rootContainerElement.nodeType ? rootContainerElement : rootContainerElement.ownerDocument;
			null === ownerDocument || ownerDocument[listeningMarker] || (ownerDocument[listeningMarker] = !0, listenToNativeEvent("selectionchange", !1, ownerDocument));
		}
	}
	function addTrappedEventListener(targetContainer, domEventName, eventSystemFlags, isCapturePhaseListener) {
		switch (getEventPriority(domEventName)) {
			case 2:
				var listenerWrapper = dispatchDiscreteEvent;
				break;
			case 8:
				listenerWrapper = dispatchContinuousEvent;
				break;
			default: listenerWrapper = dispatchEvent;
		}
		eventSystemFlags = listenerWrapper.bind(null, domEventName, eventSystemFlags, targetContainer);
		listenerWrapper = void 0;
		!passiveBrowserEventsSupported || "touchstart" !== domEventName && "touchmove" !== domEventName && "wheel" !== domEventName || (listenerWrapper = !0);
		isCapturePhaseListener ? void 0 !== listenerWrapper ? targetContainer.addEventListener(domEventName, eventSystemFlags, {
			capture: !0,
			passive: listenerWrapper
		}) : targetContainer.addEventListener(domEventName, eventSystemFlags, !0) : void 0 !== listenerWrapper ? targetContainer.addEventListener(domEventName, eventSystemFlags, { passive: listenerWrapper }) : targetContainer.addEventListener(domEventName, eventSystemFlags, !1);
	}
	function dispatchEventForPluginEventSystem(domEventName, eventSystemFlags, nativeEvent, targetInst$jscomp$0, targetContainer) {
		var ancestorInst = targetInst$jscomp$0;
		if (0 === (eventSystemFlags & 1) && 0 === (eventSystemFlags & 2) && null !== targetInst$jscomp$0) a: for (;;) {
			if (null === targetInst$jscomp$0) return;
			var nodeTag = targetInst$jscomp$0.tag;
			if (3 === nodeTag || 4 === nodeTag) {
				var container = targetInst$jscomp$0.stateNode.containerInfo;
				if (container === targetContainer) break;
				if (4 === nodeTag) for (nodeTag = targetInst$jscomp$0.return; null !== nodeTag;) {
					var grandTag = nodeTag.tag;
					if ((3 === grandTag || 4 === grandTag) && nodeTag.stateNode.containerInfo === targetContainer) return;
					nodeTag = nodeTag.return;
				}
				for (; null !== container;) {
					nodeTag = getClosestInstanceFromNode(container);
					if (null === nodeTag) return;
					grandTag = nodeTag.tag;
					if (5 === grandTag || 6 === grandTag || 26 === grandTag || 27 === grandTag) {
						targetInst$jscomp$0 = ancestorInst = nodeTag;
						continue a;
					}
					container = container.parentNode;
				}
			}
			targetInst$jscomp$0 = targetInst$jscomp$0.return;
		}
		batchedUpdates$1(function() {
			var targetInst = ancestorInst, nativeEventTarget = getEventTarget(nativeEvent), dispatchQueue = [];
			a: {
				var reactName = topLevelEventsToReactNames.get(domEventName);
				if (void 0 !== reactName) {
					var SyntheticEventCtor = SyntheticEvent, reactEventType = domEventName;
					switch (domEventName) {
						case "keypress": if (0 === getEventCharCode(nativeEvent)) break a;
						case "keydown":
						case "keyup":
							SyntheticEventCtor = SyntheticKeyboardEvent;
							break;
						case "focusin":
							reactEventType = "focus";
							SyntheticEventCtor = SyntheticFocusEvent;
							break;
						case "focusout":
							reactEventType = "blur";
							SyntheticEventCtor = SyntheticFocusEvent;
							break;
						case "beforeblur":
						case "afterblur":
							SyntheticEventCtor = SyntheticFocusEvent;
							break;
						case "click": if (2 === nativeEvent.button) break a;
						case "auxclick":
						case "dblclick":
						case "mousedown":
						case "mousemove":
						case "mouseup":
						case "mouseout":
						case "mouseover":
						case "contextmenu":
							SyntheticEventCtor = SyntheticMouseEvent;
							break;
						case "drag":
						case "dragend":
						case "dragenter":
						case "dragexit":
						case "dragleave":
						case "dragover":
						case "dragstart":
						case "drop":
							SyntheticEventCtor = SyntheticDragEvent;
							break;
						case "touchcancel":
						case "touchend":
						case "touchmove":
						case "touchstart":
							SyntheticEventCtor = SyntheticTouchEvent;
							break;
						case ANIMATION_END:
						case ANIMATION_ITERATION:
						case ANIMATION_START:
							SyntheticEventCtor = SyntheticAnimationEvent;
							break;
						case TRANSITION_END:
							SyntheticEventCtor = SyntheticTransitionEvent;
							break;
						case "scroll":
						case "scrollend":
							SyntheticEventCtor = SyntheticUIEvent;
							break;
						case "wheel":
							SyntheticEventCtor = SyntheticWheelEvent;
							break;
						case "copy":
						case "cut":
						case "paste":
							SyntheticEventCtor = SyntheticClipboardEvent;
							break;
						case "gotpointercapture":
						case "lostpointercapture":
						case "pointercancel":
						case "pointerdown":
						case "pointermove":
						case "pointerout":
						case "pointerover":
						case "pointerup":
							SyntheticEventCtor = SyntheticPointerEvent;
							break;
						case "toggle":
						case "beforetoggle": SyntheticEventCtor = SyntheticToggleEvent;
					}
					var inCapturePhase = 0 !== (eventSystemFlags & 4), accumulateTargetOnly = !inCapturePhase && ("scroll" === domEventName || "scrollend" === domEventName), reactEventName = inCapturePhase ? null !== reactName ? reactName + "Capture" : null : reactName;
					inCapturePhase = [];
					for (var instance = targetInst, lastHostComponent; null !== instance;) {
						var _instance = instance;
						lastHostComponent = _instance.stateNode;
						_instance = _instance.tag;
						5 !== _instance && 26 !== _instance && 27 !== _instance || null === lastHostComponent || null === reactEventName || (_instance = getListener(instance, reactEventName), null != _instance && inCapturePhase.push(createDispatchListener(instance, _instance, lastHostComponent)));
						if (accumulateTargetOnly) break;
						instance = instance.return;
					}
					0 < inCapturePhase.length && (reactName = new SyntheticEventCtor(reactName, reactEventType, null, nativeEvent, nativeEventTarget), dispatchQueue.push({
						event: reactName,
						listeners: inCapturePhase
					}));
				}
			}
			if (0 === (eventSystemFlags & 7)) {
				a: {
					reactName = "mouseover" === domEventName || "pointerover" === domEventName;
					SyntheticEventCtor = "mouseout" === domEventName || "pointerout" === domEventName;
					if (reactName && nativeEvent !== currentReplayingEvent && (reactEventType = nativeEvent.relatedTarget || nativeEvent.fromElement) && (getClosestInstanceFromNode(reactEventType) || reactEventType[internalContainerInstanceKey])) break a;
					if (SyntheticEventCtor || reactName) {
						reactName = nativeEventTarget.window === nativeEventTarget ? nativeEventTarget : (reactName = nativeEventTarget.ownerDocument) ? reactName.defaultView || reactName.parentWindow : window;
						if (SyntheticEventCtor) {
							if (reactEventType = nativeEvent.relatedTarget || nativeEvent.toElement, SyntheticEventCtor = targetInst, reactEventType = reactEventType ? getClosestInstanceFromNode(reactEventType) : null, null !== reactEventType && (accumulateTargetOnly = getNearestMountedFiber(reactEventType), inCapturePhase = reactEventType.tag, reactEventType !== accumulateTargetOnly || 5 !== inCapturePhase && 27 !== inCapturePhase && 6 !== inCapturePhase)) reactEventType = null;
						} else SyntheticEventCtor = null, reactEventType = targetInst;
						if (SyntheticEventCtor !== reactEventType) {
							inCapturePhase = SyntheticMouseEvent;
							_instance = "onMouseLeave";
							reactEventName = "onMouseEnter";
							instance = "mouse";
							if ("pointerout" === domEventName || "pointerover" === domEventName) inCapturePhase = SyntheticPointerEvent, _instance = "onPointerLeave", reactEventName = "onPointerEnter", instance = "pointer";
							accumulateTargetOnly = null == SyntheticEventCtor ? reactName : getNodeFromInstance(SyntheticEventCtor);
							lastHostComponent = null == reactEventType ? reactName : getNodeFromInstance(reactEventType);
							reactName = new inCapturePhase(_instance, instance + "leave", SyntheticEventCtor, nativeEvent, nativeEventTarget);
							reactName.target = accumulateTargetOnly;
							reactName.relatedTarget = lastHostComponent;
							_instance = null;
							getClosestInstanceFromNode(nativeEventTarget) === targetInst && (inCapturePhase = new inCapturePhase(reactEventName, instance + "enter", reactEventType, nativeEvent, nativeEventTarget), inCapturePhase.target = lastHostComponent, inCapturePhase.relatedTarget = accumulateTargetOnly, _instance = inCapturePhase);
							accumulateTargetOnly = _instance;
							if (SyntheticEventCtor && reactEventType) b: {
								inCapturePhase = getParent;
								reactEventName = SyntheticEventCtor;
								instance = reactEventType;
								lastHostComponent = 0;
								for (_instance = reactEventName; _instance; _instance = inCapturePhase(_instance)) lastHostComponent++;
								_instance = 0;
								for (var tempB = instance; tempB; tempB = inCapturePhase(tempB)) _instance++;
								for (; 0 < lastHostComponent - _instance;) reactEventName = inCapturePhase(reactEventName), lastHostComponent--;
								for (; 0 < _instance - lastHostComponent;) instance = inCapturePhase(instance), _instance--;
								for (; lastHostComponent--;) {
									if (reactEventName === instance || null !== instance && reactEventName === instance.alternate) {
										inCapturePhase = reactEventName;
										break b;
									}
									reactEventName = inCapturePhase(reactEventName);
									instance = inCapturePhase(instance);
								}
								inCapturePhase = null;
							}
							else inCapturePhase = null;
							null !== SyntheticEventCtor && accumulateEnterLeaveListenersForEvent(dispatchQueue, reactName, SyntheticEventCtor, inCapturePhase, !1);
							null !== reactEventType && null !== accumulateTargetOnly && accumulateEnterLeaveListenersForEvent(dispatchQueue, accumulateTargetOnly, reactEventType, inCapturePhase, !0);
						}
					}
				}
				a: {
					reactName = targetInst ? getNodeFromInstance(targetInst) : window;
					SyntheticEventCtor = reactName.nodeName && reactName.nodeName.toLowerCase();
					if ("select" === SyntheticEventCtor || "input" === SyntheticEventCtor && "file" === reactName.type) var getTargetInstFunc = getTargetInstForChangeEvent;
					else if (isTextInputElement(reactName)) if (isInputEventSupported) getTargetInstFunc = getTargetInstForInputOrChangeEvent;
					else {
						getTargetInstFunc = getTargetInstForInputEventPolyfill;
						var handleEventFunc = handleEventsForInputEventPolyfill;
					}
					else SyntheticEventCtor = reactName.nodeName, !SyntheticEventCtor || "input" !== SyntheticEventCtor.toLowerCase() || "checkbox" !== reactName.type && "radio" !== reactName.type ? targetInst && isCustomElement(targetInst.elementType) && (getTargetInstFunc = getTargetInstForChangeEvent) : getTargetInstFunc = getTargetInstForClickEvent;
					if (getTargetInstFunc && (getTargetInstFunc = getTargetInstFunc(domEventName, targetInst))) {
						createAndAccumulateChangeEvent(dispatchQueue, getTargetInstFunc, nativeEvent, nativeEventTarget);
						break a;
					}
					handleEventFunc && handleEventFunc(domEventName, reactName, targetInst);
					"focusout" === domEventName && targetInst && "number" === reactName.type && null != targetInst.memoizedProps.value && setDefaultValue(reactName, "number", reactName.value);
				}
				handleEventFunc = targetInst ? getNodeFromInstance(targetInst) : window;
				switch (domEventName) {
					case "focusin":
						if (isTextInputElement(handleEventFunc) || "true" === handleEventFunc.contentEditable) activeElement = handleEventFunc, activeElementInst = targetInst, lastSelection = null;
						break;
					case "focusout":
						lastSelection = activeElementInst = activeElement = null;
						break;
					case "mousedown":
						mouseDown = !0;
						break;
					case "contextmenu":
					case "mouseup":
					case "dragend":
						mouseDown = !1;
						constructSelectEvent(dispatchQueue, nativeEvent, nativeEventTarget);
						break;
					case "selectionchange": if (skipSelectionChangeEvent) break;
					case "keydown":
					case "keyup": constructSelectEvent(dispatchQueue, nativeEvent, nativeEventTarget);
				}
				var fallbackData;
				if (canUseCompositionEvent) b: {
					switch (domEventName) {
						case "compositionstart":
							var eventType = "onCompositionStart";
							break b;
						case "compositionend":
							eventType = "onCompositionEnd";
							break b;
						case "compositionupdate":
							eventType = "onCompositionUpdate";
							break b;
					}
					eventType = void 0;
				}
				else isComposing ? isFallbackCompositionEnd(domEventName, nativeEvent) && (eventType = "onCompositionEnd") : "keydown" === domEventName && 229 === nativeEvent.keyCode && (eventType = "onCompositionStart");
				eventType && (useFallbackCompositionData && "ko" !== nativeEvent.locale && (isComposing || "onCompositionStart" !== eventType ? "onCompositionEnd" === eventType && isComposing && (fallbackData = getData()) : (root = nativeEventTarget, startText = "value" in root ? root.value : root.textContent, isComposing = !0)), handleEventFunc = accumulateTwoPhaseListeners(targetInst, eventType), 0 < handleEventFunc.length && (eventType = new SyntheticCompositionEvent(eventType, domEventName, null, nativeEvent, nativeEventTarget), dispatchQueue.push({
					event: eventType,
					listeners: handleEventFunc
				}), fallbackData ? eventType.data = fallbackData : (fallbackData = getDataFromCustomEvent(nativeEvent), null !== fallbackData && (eventType.data = fallbackData))));
				if (fallbackData = canUseTextInputEvent ? getNativeBeforeInputChars(domEventName, nativeEvent) : getFallbackBeforeInputChars(domEventName, nativeEvent)) eventType = accumulateTwoPhaseListeners(targetInst, "onBeforeInput"), 0 < eventType.length && (handleEventFunc = new SyntheticCompositionEvent("onBeforeInput", "beforeinput", null, nativeEvent, nativeEventTarget), dispatchQueue.push({
					event: handleEventFunc,
					listeners: eventType
				}), handleEventFunc.data = fallbackData);
				extractEvents$1(dispatchQueue, domEventName, targetInst, nativeEvent, nativeEventTarget);
			}
			processDispatchQueue(dispatchQueue, eventSystemFlags);
		});
	}
	function createDispatchListener(instance, listener, currentTarget) {
		return {
			instance,
			listener,
			currentTarget
		};
	}
	function accumulateTwoPhaseListeners(targetFiber, reactName) {
		for (var captureName = reactName + "Capture", listeners = []; null !== targetFiber;) {
			var _instance2 = targetFiber, stateNode = _instance2.stateNode;
			_instance2 = _instance2.tag;
			5 !== _instance2 && 26 !== _instance2 && 27 !== _instance2 || null === stateNode || (_instance2 = getListener(targetFiber, captureName), null != _instance2 && listeners.unshift(createDispatchListener(targetFiber, _instance2, stateNode)), _instance2 = getListener(targetFiber, reactName), null != _instance2 && listeners.push(createDispatchListener(targetFiber, _instance2, stateNode)));
			if (3 === targetFiber.tag) return listeners;
			targetFiber = targetFiber.return;
		}
		return [];
	}
	function getParent(inst) {
		if (null === inst) return null;
		do
			inst = inst.return;
		while (inst && 5 !== inst.tag && 27 !== inst.tag);
		return inst ? inst : null;
	}
	function accumulateEnterLeaveListenersForEvent(dispatchQueue, event, target, common, inCapturePhase) {
		for (var registrationName = event._reactName, listeners = []; null !== target && target !== common;) {
			var _instance3 = target, alternate = _instance3.alternate, stateNode = _instance3.stateNode;
			_instance3 = _instance3.tag;
			if (null !== alternate && alternate === common) break;
			5 !== _instance3 && 26 !== _instance3 && 27 !== _instance3 || null === stateNode || (alternate = stateNode, inCapturePhase ? (stateNode = getListener(target, registrationName), null != stateNode && listeners.unshift(createDispatchListener(target, stateNode, alternate))) : inCapturePhase || (stateNode = getListener(target, registrationName), null != stateNode && listeners.push(createDispatchListener(target, stateNode, alternate))));
			target = target.return;
		}
		0 !== listeners.length && dispatchQueue.push({
			event,
			listeners
		});
	}
	var NORMALIZE_NEWLINES_REGEX = /\r\n?/g, NORMALIZE_NULL_AND_REPLACEMENT_REGEX = /\u0000|\uFFFD/g;
	function normalizeMarkupForTextOrAttribute(markup) {
		return ("string" === typeof markup ? markup : "" + markup).replace(NORMALIZE_NEWLINES_REGEX, "\n").replace(NORMALIZE_NULL_AND_REPLACEMENT_REGEX, "");
	}
	function checkForUnmatchedText(serverText, clientText) {
		clientText = normalizeMarkupForTextOrAttribute(clientText);
		return normalizeMarkupForTextOrAttribute(serverText) === clientText ? !0 : !1;
	}
	function setProp(domElement, tag, key, value, props, prevValue) {
		switch (key) {
			case "children":
				"string" === typeof value ? "body" === tag || "textarea" === tag && "" === value || setTextContent(domElement, value) : ("number" === typeof value || "bigint" === typeof value) && "body" !== tag && setTextContent(domElement, "" + value);
				break;
			case "className":
				setValueForKnownAttribute(domElement, "class", value);
				break;
			case "tabIndex":
				setValueForKnownAttribute(domElement, "tabindex", value);
				break;
			case "dir":
			case "role":
			case "viewBox":
			case "width":
			case "height":
				setValueForKnownAttribute(domElement, key, value);
				break;
			case "style":
				setValueForStyles(domElement, value, prevValue);
				break;
			case "data": if ("object" !== tag) {
				setValueForKnownAttribute(domElement, "data", value);
				break;
			}
			case "src":
			case "href":
				if ("" === value && ("a" !== tag || "href" !== key)) {
					domElement.removeAttribute(key);
					break;
				}
				if (null == value || "function" === typeof value || "symbol" === typeof value || "boolean" === typeof value) {
					domElement.removeAttribute(key);
					break;
				}
				value = sanitizeURL("" + value);
				domElement.setAttribute(key, value);
				break;
			case "action":
			case "formAction":
				if ("function" === typeof value) {
					domElement.setAttribute(key, "javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");
					break;
				} else "function" === typeof prevValue && ("formAction" === key ? ("input" !== tag && setProp(domElement, tag, "name", props.name, props, null), setProp(domElement, tag, "formEncType", props.formEncType, props, null), setProp(domElement, tag, "formMethod", props.formMethod, props, null), setProp(domElement, tag, "formTarget", props.formTarget, props, null)) : (setProp(domElement, tag, "encType", props.encType, props, null), setProp(domElement, tag, "method", props.method, props, null), setProp(domElement, tag, "target", props.target, props, null)));
				if (null == value || "symbol" === typeof value || "boolean" === typeof value) {
					domElement.removeAttribute(key);
					break;
				}
				value = sanitizeURL("" + value);
				domElement.setAttribute(key, value);
				break;
			case "onClick":
				null != value && (domElement.onclick = noop$1);
				break;
			case "onScroll":
				null != value && listenToNonDelegatedEvent("scroll", domElement);
				break;
			case "onScrollEnd":
				null != value && listenToNonDelegatedEvent("scrollend", domElement);
				break;
			case "dangerouslySetInnerHTML":
				if (null != value) {
					if ("object" !== typeof value || !("__html" in value)) throw Error(formatProdErrorMessage(61));
					key = value.__html;
					if (null != key) {
						if (null != props.children) throw Error(formatProdErrorMessage(60));
						domElement.innerHTML = key;
					}
				}
				break;
			case "multiple":
				domElement.multiple = value && "function" !== typeof value && "symbol" !== typeof value;
				break;
			case "muted":
				domElement.muted = value && "function" !== typeof value && "symbol" !== typeof value;
				break;
			case "suppressContentEditableWarning":
			case "suppressHydrationWarning":
			case "defaultValue":
			case "defaultChecked":
			case "innerHTML":
			case "ref": break;
			case "autoFocus": break;
			case "xlinkHref":
				if (null == value || "function" === typeof value || "boolean" === typeof value || "symbol" === typeof value) {
					domElement.removeAttribute("xlink:href");
					break;
				}
				key = sanitizeURL("" + value);
				domElement.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", key);
				break;
			case "contentEditable":
			case "spellCheck":
			case "draggable":
			case "value":
			case "autoReverse":
			case "externalResourcesRequired":
			case "focusable":
			case "preserveAlpha":
				null != value && "function" !== typeof value && "symbol" !== typeof value ? domElement.setAttribute(key, "" + value) : domElement.removeAttribute(key);
				break;
			case "inert":
			case "allowFullScreen":
			case "async":
			case "autoPlay":
			case "controls":
			case "default":
			case "defer":
			case "disabled":
			case "disablePictureInPicture":
			case "disableRemotePlayback":
			case "formNoValidate":
			case "hidden":
			case "loop":
			case "noModule":
			case "noValidate":
			case "open":
			case "playsInline":
			case "readOnly":
			case "required":
			case "reversed":
			case "scoped":
			case "seamless":
			case "itemScope":
				value && "function" !== typeof value && "symbol" !== typeof value ? domElement.setAttribute(key, "") : domElement.removeAttribute(key);
				break;
			case "capture":
			case "download":
				!0 === value ? domElement.setAttribute(key, "") : !1 !== value && null != value && "function" !== typeof value && "symbol" !== typeof value ? domElement.setAttribute(key, value) : domElement.removeAttribute(key);
				break;
			case "cols":
			case "rows":
			case "size":
			case "span":
				null != value && "function" !== typeof value && "symbol" !== typeof value && !isNaN(value) && 1 <= value ? domElement.setAttribute(key, value) : domElement.removeAttribute(key);
				break;
			case "rowSpan":
			case "start":
				null == value || "function" === typeof value || "symbol" === typeof value || isNaN(value) ? domElement.removeAttribute(key) : domElement.setAttribute(key, value);
				break;
			case "popover":
				listenToNonDelegatedEvent("beforetoggle", domElement);
				listenToNonDelegatedEvent("toggle", domElement);
				setValueForAttribute(domElement, "popover", value);
				break;
			case "xlinkActuate":
				setValueForNamespacedAttribute(domElement, "http://www.w3.org/1999/xlink", "xlink:actuate", value);
				break;
			case "xlinkArcrole":
				setValueForNamespacedAttribute(domElement, "http://www.w3.org/1999/xlink", "xlink:arcrole", value);
				break;
			case "xlinkRole":
				setValueForNamespacedAttribute(domElement, "http://www.w3.org/1999/xlink", "xlink:role", value);
				break;
			case "xlinkShow":
				setValueForNamespacedAttribute(domElement, "http://www.w3.org/1999/xlink", "xlink:show", value);
				break;
			case "xlinkTitle":
				setValueForNamespacedAttribute(domElement, "http://www.w3.org/1999/xlink", "xlink:title", value);
				break;
			case "xlinkType":
				setValueForNamespacedAttribute(domElement, "http://www.w3.org/1999/xlink", "xlink:type", value);
				break;
			case "xmlBase":
				setValueForNamespacedAttribute(domElement, "http://www.w3.org/XML/1998/namespace", "xml:base", value);
				break;
			case "xmlLang":
				setValueForNamespacedAttribute(domElement, "http://www.w3.org/XML/1998/namespace", "xml:lang", value);
				break;
			case "xmlSpace":
				setValueForNamespacedAttribute(domElement, "http://www.w3.org/XML/1998/namespace", "xml:space", value);
				break;
			case "is":
				setValueForAttribute(domElement, "is", value);
				break;
			case "innerText":
			case "textContent": break;
			default: if (!(2 < key.length) || "o" !== key[0] && "O" !== key[0] || "n" !== key[1] && "N" !== key[1]) key = aliases.get(key) || key, setValueForAttribute(domElement, key, value);
		}
	}
	function setPropOnCustomElement(domElement, tag, key, value, props, prevValue) {
		switch (key) {
			case "style":
				setValueForStyles(domElement, value, prevValue);
				break;
			case "dangerouslySetInnerHTML":
				if (null != value) {
					if ("object" !== typeof value || !("__html" in value)) throw Error(formatProdErrorMessage(61));
					key = value.__html;
					if (null != key) {
						if (null != props.children) throw Error(formatProdErrorMessage(60));
						domElement.innerHTML = key;
					}
				}
				break;
			case "children":
				"string" === typeof value ? setTextContent(domElement, value) : ("number" === typeof value || "bigint" === typeof value) && setTextContent(domElement, "" + value);
				break;
			case "onScroll":
				null != value && listenToNonDelegatedEvent("scroll", domElement);
				break;
			case "onScrollEnd":
				null != value && listenToNonDelegatedEvent("scrollend", domElement);
				break;
			case "onClick":
				null != value && (domElement.onclick = noop$1);
				break;
			case "suppressContentEditableWarning":
			case "suppressHydrationWarning":
			case "innerHTML":
			case "ref": break;
			case "innerText":
			case "textContent": break;
			default: if (!registrationNameDependencies.hasOwnProperty(key)) a: {
				if ("o" === key[0] && "n" === key[1] && (props = key.endsWith("Capture"), tag = key.slice(2, props ? key.length - 7 : void 0), prevValue = domElement[internalPropsKey] || null, prevValue = null != prevValue ? prevValue[key] : null, "function" === typeof prevValue && domElement.removeEventListener(tag, prevValue, props), "function" === typeof value)) {
					"function" !== typeof prevValue && null !== prevValue && (key in domElement ? domElement[key] = null : domElement.hasAttribute(key) && domElement.removeAttribute(key));
					domElement.addEventListener(tag, value, props);
					break a;
				}
				key in domElement ? domElement[key] = value : !0 === value ? domElement.setAttribute(key, "") : setValueForAttribute(domElement, key, value);
			}
		}
	}
	function setInitialProperties(domElement, tag, props) {
		switch (tag) {
			case "div":
			case "span":
			case "svg":
			case "path":
			case "a":
			case "g":
			case "p":
			case "li": break;
			case "img":
				listenToNonDelegatedEvent("error", domElement);
				listenToNonDelegatedEvent("load", domElement);
				var hasSrc = !1, hasSrcSet = !1, propKey;
				for (propKey in props) if (props.hasOwnProperty(propKey)) {
					var propValue = props[propKey];
					if (null != propValue) switch (propKey) {
						case "src":
							hasSrc = !0;
							break;
						case "srcSet":
							hasSrcSet = !0;
							break;
						case "children":
						case "dangerouslySetInnerHTML": throw Error(formatProdErrorMessage(137, tag));
						default: setProp(domElement, tag, propKey, propValue, props, null);
					}
				}
				hasSrcSet && setProp(domElement, tag, "srcSet", props.srcSet, props, null);
				hasSrc && setProp(domElement, tag, "src", props.src, props, null);
				return;
			case "input":
				listenToNonDelegatedEvent("invalid", domElement);
				var defaultValue = propKey = propValue = hasSrcSet = null, checked = null, defaultChecked = null;
				for (hasSrc in props) if (props.hasOwnProperty(hasSrc)) {
					var propValue$184 = props[hasSrc];
					if (null != propValue$184) switch (hasSrc) {
						case "name":
							hasSrcSet = propValue$184;
							break;
						case "type":
							propValue = propValue$184;
							break;
						case "checked":
							checked = propValue$184;
							break;
						case "defaultChecked":
							defaultChecked = propValue$184;
							break;
						case "value":
							propKey = propValue$184;
							break;
						case "defaultValue":
							defaultValue = propValue$184;
							break;
						case "children":
						case "dangerouslySetInnerHTML":
							if (null != propValue$184) throw Error(formatProdErrorMessage(137, tag));
							break;
						default: setProp(domElement, tag, hasSrc, propValue$184, props, null);
					}
				}
				initInput(domElement, propKey, defaultValue, checked, defaultChecked, propValue, hasSrcSet, !1);
				return;
			case "select":
				listenToNonDelegatedEvent("invalid", domElement);
				hasSrc = propValue = propKey = null;
				for (hasSrcSet in props) if (props.hasOwnProperty(hasSrcSet) && (defaultValue = props[hasSrcSet], null != defaultValue)) switch (hasSrcSet) {
					case "value":
						propKey = defaultValue;
						break;
					case "defaultValue":
						propValue = defaultValue;
						break;
					case "multiple": hasSrc = defaultValue;
					default: setProp(domElement, tag, hasSrcSet, defaultValue, props, null);
				}
				tag = propKey;
				props = propValue;
				domElement.multiple = !!hasSrc;
				null != tag ? updateOptions(domElement, !!hasSrc, tag, !1) : null != props && updateOptions(domElement, !!hasSrc, props, !0);
				return;
			case "textarea":
				listenToNonDelegatedEvent("invalid", domElement);
				propKey = hasSrcSet = hasSrc = null;
				for (propValue in props) if (props.hasOwnProperty(propValue) && (defaultValue = props[propValue], null != defaultValue)) switch (propValue) {
					case "value":
						hasSrc = defaultValue;
						break;
					case "defaultValue":
						hasSrcSet = defaultValue;
						break;
					case "children":
						propKey = defaultValue;
						break;
					case "dangerouslySetInnerHTML":
						if (null != defaultValue) throw Error(formatProdErrorMessage(91));
						break;
					default: setProp(domElement, tag, propValue, defaultValue, props, null);
				}
				initTextarea(domElement, hasSrc, hasSrcSet, propKey);
				return;
			case "option":
				for (checked in props) if (props.hasOwnProperty(checked) && (hasSrc = props[checked], null != hasSrc)) switch (checked) {
					case "selected":
						domElement.selected = hasSrc && "function" !== typeof hasSrc && "symbol" !== typeof hasSrc;
						break;
					default: setProp(domElement, tag, checked, hasSrc, props, null);
				}
				return;
			case "dialog":
				listenToNonDelegatedEvent("beforetoggle", domElement);
				listenToNonDelegatedEvent("toggle", domElement);
				listenToNonDelegatedEvent("cancel", domElement);
				listenToNonDelegatedEvent("close", domElement);
				break;
			case "iframe":
			case "object":
				listenToNonDelegatedEvent("load", domElement);
				break;
			case "video":
			case "audio":
				for (hasSrc = 0; hasSrc < mediaEventTypes.length; hasSrc++) listenToNonDelegatedEvent(mediaEventTypes[hasSrc], domElement);
				break;
			case "image":
				listenToNonDelegatedEvent("error", domElement);
				listenToNonDelegatedEvent("load", domElement);
				break;
			case "details":
				listenToNonDelegatedEvent("toggle", domElement);
				break;
			case "embed":
			case "source":
			case "link": listenToNonDelegatedEvent("error", domElement), listenToNonDelegatedEvent("load", domElement);
			case "area":
			case "base":
			case "br":
			case "col":
			case "hr":
			case "keygen":
			case "meta":
			case "param":
			case "track":
			case "wbr":
			case "menuitem":
				for (defaultChecked in props) if (props.hasOwnProperty(defaultChecked) && (hasSrc = props[defaultChecked], null != hasSrc)) switch (defaultChecked) {
					case "children":
					case "dangerouslySetInnerHTML": throw Error(formatProdErrorMessage(137, tag));
					default: setProp(domElement, tag, defaultChecked, hasSrc, props, null);
				}
				return;
			default: if (isCustomElement(tag)) {
				for (propValue$184 in props) props.hasOwnProperty(propValue$184) && (hasSrc = props[propValue$184], void 0 !== hasSrc && setPropOnCustomElement(domElement, tag, propValue$184, hasSrc, props, void 0));
				return;
			}
		}
		for (defaultValue in props) props.hasOwnProperty(defaultValue) && (hasSrc = props[defaultValue], null != hasSrc && setProp(domElement, tag, defaultValue, hasSrc, props, null));
	}
	function updateProperties(domElement, tag, lastProps, nextProps) {
		switch (tag) {
			case "div":
			case "span":
			case "svg":
			case "path":
			case "a":
			case "g":
			case "p":
			case "li": break;
			case "input":
				var name = null, type = null, value = null, defaultValue = null, lastDefaultValue = null, checked = null, defaultChecked = null;
				for (propKey in lastProps) {
					var lastProp = lastProps[propKey];
					if (lastProps.hasOwnProperty(propKey) && null != lastProp) switch (propKey) {
						case "checked": break;
						case "value": break;
						case "defaultValue": lastDefaultValue = lastProp;
						default: nextProps.hasOwnProperty(propKey) || setProp(domElement, tag, propKey, null, nextProps, lastProp);
					}
				}
				for (var propKey$201 in nextProps) {
					var propKey = nextProps[propKey$201];
					lastProp = lastProps[propKey$201];
					if (nextProps.hasOwnProperty(propKey$201) && (null != propKey || null != lastProp)) switch (propKey$201) {
						case "type":
							type = propKey;
							break;
						case "name":
							name = propKey;
							break;
						case "checked":
							checked = propKey;
							break;
						case "defaultChecked":
							defaultChecked = propKey;
							break;
						case "value":
							value = propKey;
							break;
						case "defaultValue":
							defaultValue = propKey;
							break;
						case "children":
						case "dangerouslySetInnerHTML":
							if (null != propKey) throw Error(formatProdErrorMessage(137, tag));
							break;
						default: propKey !== lastProp && setProp(domElement, tag, propKey$201, propKey, nextProps, lastProp);
					}
				}
				updateInput(domElement, value, defaultValue, lastDefaultValue, checked, defaultChecked, type, name);
				return;
			case "select":
				propKey = value = defaultValue = propKey$201 = null;
				for (type in lastProps) if (lastDefaultValue = lastProps[type], lastProps.hasOwnProperty(type) && null != lastDefaultValue) switch (type) {
					case "value": break;
					case "multiple": propKey = lastDefaultValue;
					default: nextProps.hasOwnProperty(type) || setProp(domElement, tag, type, null, nextProps, lastDefaultValue);
				}
				for (name in nextProps) if (type = nextProps[name], lastDefaultValue = lastProps[name], nextProps.hasOwnProperty(name) && (null != type || null != lastDefaultValue)) switch (name) {
					case "value":
						propKey$201 = type;
						break;
					case "defaultValue":
						defaultValue = type;
						break;
					case "multiple": value = type;
					default: type !== lastDefaultValue && setProp(domElement, tag, name, type, nextProps, lastDefaultValue);
				}
				tag = defaultValue;
				lastProps = value;
				nextProps = propKey;
				null != propKey$201 ? updateOptions(domElement, !!lastProps, propKey$201, !1) : !!nextProps !== !!lastProps && (null != tag ? updateOptions(domElement, !!lastProps, tag, !0) : updateOptions(domElement, !!lastProps, lastProps ? [] : "", !1));
				return;
			case "textarea":
				propKey = propKey$201 = null;
				for (defaultValue in lastProps) if (name = lastProps[defaultValue], lastProps.hasOwnProperty(defaultValue) && null != name && !nextProps.hasOwnProperty(defaultValue)) switch (defaultValue) {
					case "value": break;
					case "children": break;
					default: setProp(domElement, tag, defaultValue, null, nextProps, name);
				}
				for (value in nextProps) if (name = nextProps[value], type = lastProps[value], nextProps.hasOwnProperty(value) && (null != name || null != type)) switch (value) {
					case "value":
						propKey$201 = name;
						break;
					case "defaultValue":
						propKey = name;
						break;
					case "children": break;
					case "dangerouslySetInnerHTML":
						if (null != name) throw Error(formatProdErrorMessage(91));
						break;
					default: name !== type && setProp(domElement, tag, value, name, nextProps, type);
				}
				updateTextarea(domElement, propKey$201, propKey);
				return;
			case "option":
				for (var propKey$217 in lastProps) if (propKey$201 = lastProps[propKey$217], lastProps.hasOwnProperty(propKey$217) && null != propKey$201 && !nextProps.hasOwnProperty(propKey$217)) switch (propKey$217) {
					case "selected":
						domElement.selected = !1;
						break;
					default: setProp(domElement, tag, propKey$217, null, nextProps, propKey$201);
				}
				for (lastDefaultValue in nextProps) if (propKey$201 = nextProps[lastDefaultValue], propKey = lastProps[lastDefaultValue], nextProps.hasOwnProperty(lastDefaultValue) && propKey$201 !== propKey && (null != propKey$201 || null != propKey)) switch (lastDefaultValue) {
					case "selected":
						domElement.selected = propKey$201 && "function" !== typeof propKey$201 && "symbol" !== typeof propKey$201;
						break;
					default: setProp(domElement, tag, lastDefaultValue, propKey$201, nextProps, propKey);
				}
				return;
			case "img":
			case "link":
			case "area":
			case "base":
			case "br":
			case "col":
			case "embed":
			case "hr":
			case "keygen":
			case "meta":
			case "param":
			case "source":
			case "track":
			case "wbr":
			case "menuitem":
				for (var propKey$222 in lastProps) propKey$201 = lastProps[propKey$222], lastProps.hasOwnProperty(propKey$222) && null != propKey$201 && !nextProps.hasOwnProperty(propKey$222) && setProp(domElement, tag, propKey$222, null, nextProps, propKey$201);
				for (checked in nextProps) if (propKey$201 = nextProps[checked], propKey = lastProps[checked], nextProps.hasOwnProperty(checked) && propKey$201 !== propKey && (null != propKey$201 || null != propKey)) switch (checked) {
					case "children":
					case "dangerouslySetInnerHTML":
						if (null != propKey$201) throw Error(formatProdErrorMessage(137, tag));
						break;
					default: setProp(domElement, tag, checked, propKey$201, nextProps, propKey);
				}
				return;
			default: if (isCustomElement(tag)) {
				for (var propKey$227 in lastProps) propKey$201 = lastProps[propKey$227], lastProps.hasOwnProperty(propKey$227) && void 0 !== propKey$201 && !nextProps.hasOwnProperty(propKey$227) && setPropOnCustomElement(domElement, tag, propKey$227, void 0, nextProps, propKey$201);
				for (defaultChecked in nextProps) propKey$201 = nextProps[defaultChecked], propKey = lastProps[defaultChecked], !nextProps.hasOwnProperty(defaultChecked) || propKey$201 === propKey || void 0 === propKey$201 && void 0 === propKey || setPropOnCustomElement(domElement, tag, defaultChecked, propKey$201, nextProps, propKey);
				return;
			}
		}
		for (var propKey$232 in lastProps) propKey$201 = lastProps[propKey$232], lastProps.hasOwnProperty(propKey$232) && null != propKey$201 && !nextProps.hasOwnProperty(propKey$232) && setProp(domElement, tag, propKey$232, null, nextProps, propKey$201);
		for (lastProp in nextProps) propKey$201 = nextProps[lastProp], propKey = lastProps[lastProp], !nextProps.hasOwnProperty(lastProp) || propKey$201 === propKey || null == propKey$201 && null == propKey || setProp(domElement, tag, lastProp, propKey$201, nextProps, propKey);
	}
	function isLikelyStaticResource(initiatorType) {
		switch (initiatorType) {
			case "css":
			case "script":
			case "font":
			case "img":
			case "image":
			case "input":
			case "link": return !0;
			default: return !1;
		}
	}
	function estimateBandwidth() {
		if ("function" === typeof performance.getEntriesByType) {
			for (var count = 0, bits = 0, resourceEntries = performance.getEntriesByType("resource"), i = 0; i < resourceEntries.length; i++) {
				var entry = resourceEntries[i], transferSize = entry.transferSize, initiatorType = entry.initiatorType, duration = entry.duration;
				if (transferSize && duration && isLikelyStaticResource(initiatorType)) {
					initiatorType = 0;
					duration = entry.responseEnd;
					for (i += 1; i < resourceEntries.length; i++) {
						var overlapEntry = resourceEntries[i], overlapStartTime = overlapEntry.startTime;
						if (overlapStartTime > duration) break;
						var overlapTransferSize = overlapEntry.transferSize, overlapInitiatorType = overlapEntry.initiatorType;
						overlapTransferSize && isLikelyStaticResource(overlapInitiatorType) && (overlapEntry = overlapEntry.responseEnd, initiatorType += overlapTransferSize * (overlapEntry < duration ? 1 : (duration - overlapStartTime) / (overlapEntry - overlapStartTime)));
					}
					--i;
					bits += 8 * (transferSize + initiatorType) / (entry.duration / 1e3);
					count++;
					if (10 < count) break;
				}
			}
			if (0 < count) return bits / count / 1e6;
		}
		return navigator.connection && (count = navigator.connection.downlink, "number" === typeof count) ? count : 5;
	}
	var eventsEnabled = null, selectionInformation = null;
	function getOwnerDocumentFromRootContainer(rootContainerElement) {
		return 9 === rootContainerElement.nodeType ? rootContainerElement : rootContainerElement.ownerDocument;
	}
	function getOwnHostContext(namespaceURI) {
		switch (namespaceURI) {
			case "http://www.w3.org/2000/svg": return 1;
			case "http://www.w3.org/1998/Math/MathML": return 2;
			default: return 0;
		}
	}
	function getChildHostContextProd(parentNamespace, type) {
		if (0 === parentNamespace) switch (type) {
			case "svg": return 1;
			case "math": return 2;
			default: return 0;
		}
		return 1 === parentNamespace && "foreignObject" === type ? 0 : parentNamespace;
	}
	function shouldSetTextContent(type, props) {
		return "textarea" === type || "noscript" === type || "string" === typeof props.children || "number" === typeof props.children || "bigint" === typeof props.children || "object" === typeof props.dangerouslySetInnerHTML && null !== props.dangerouslySetInnerHTML && null != props.dangerouslySetInnerHTML.__html;
	}
	var currentPopstateTransitionEvent = null;
	function shouldAttemptEagerTransition() {
		var event = window.event;
		if (event && "popstate" === event.type) {
			if (event === currentPopstateTransitionEvent) return !1;
			currentPopstateTransitionEvent = event;
			return !0;
		}
		currentPopstateTransitionEvent = null;
		return !1;
	}
	var scheduleTimeout = "function" === typeof setTimeout ? setTimeout : void 0, cancelTimeout = "function" === typeof clearTimeout ? clearTimeout : void 0, localPromise = "function" === typeof Promise ? Promise : void 0, scheduleMicrotask = "function" === typeof queueMicrotask ? queueMicrotask : "undefined" !== typeof localPromise ? function(callback) {
		return localPromise.resolve(null).then(callback).catch(handleErrorInNextTick);
	} : scheduleTimeout;
	function handleErrorInNextTick(error) {
		setTimeout(function() {
			throw error;
		});
	}
	function isSingletonScope(type) {
		return "head" === type;
	}
	function clearHydrationBoundary(parentInstance, hydrationInstance) {
		var node = hydrationInstance, depth = 0;
		do {
			var nextNode = node.nextSibling;
			parentInstance.removeChild(node);
			if (nextNode && 8 === nextNode.nodeType) if (node = nextNode.data, "/$" === node || "/&" === node) {
				if (0 === depth) {
					parentInstance.removeChild(nextNode);
					retryIfBlockedOn(hydrationInstance);
					return;
				}
				depth--;
			} else if ("$" === node || "$?" === node || "$~" === node || "$!" === node || "&" === node) depth++;
			else if ("html" === node) releaseSingletonInstance(parentInstance.ownerDocument.documentElement);
			else if ("head" === node) {
				node = parentInstance.ownerDocument.head;
				releaseSingletonInstance(node);
				for (var node$jscomp$0 = node.firstChild; node$jscomp$0;) {
					var nextNode$jscomp$0 = node$jscomp$0.nextSibling, nodeName = node$jscomp$0.nodeName;
					node$jscomp$0[internalHoistableMarker] || "SCRIPT" === nodeName || "STYLE" === nodeName || "LINK" === nodeName && "stylesheet" === node$jscomp$0.rel.toLowerCase() || node.removeChild(node$jscomp$0);
					node$jscomp$0 = nextNode$jscomp$0;
				}
			} else "body" === node && releaseSingletonInstance(parentInstance.ownerDocument.body);
			node = nextNode;
		} while (node);
		retryIfBlockedOn(hydrationInstance);
	}
	function hideOrUnhideDehydratedBoundary(suspenseInstance, isHidden) {
		var node = suspenseInstance;
		suspenseInstance = 0;
		do {
			var nextNode = node.nextSibling;
			1 === node.nodeType ? isHidden ? (node._stashedDisplay = node.style.display, node.style.display = "none") : (node.style.display = node._stashedDisplay || "", "" === node.getAttribute("style") && node.removeAttribute("style")) : 3 === node.nodeType && (isHidden ? (node._stashedText = node.nodeValue, node.nodeValue = "") : node.nodeValue = node._stashedText || "");
			if (nextNode && 8 === nextNode.nodeType) if (node = nextNode.data, "/$" === node) if (0 === suspenseInstance) break;
			else suspenseInstance--;
			else "$" !== node && "$?" !== node && "$~" !== node && "$!" !== node || suspenseInstance++;
			node = nextNode;
		} while (node);
	}
	function clearContainerSparingly(container) {
		var nextNode = container.firstChild;
		nextNode && 10 === nextNode.nodeType && (nextNode = nextNode.nextSibling);
		for (; nextNode;) {
			var node = nextNode;
			nextNode = nextNode.nextSibling;
			switch (node.nodeName) {
				case "HTML":
				case "HEAD":
				case "BODY":
					clearContainerSparingly(node);
					detachDeletedInstance(node);
					continue;
				case "SCRIPT":
				case "STYLE": continue;
				case "LINK": if ("stylesheet" === node.rel.toLowerCase()) continue;
			}
			container.removeChild(node);
		}
	}
	function canHydrateInstance(instance, type, props, inRootOrSingleton) {
		for (; 1 === instance.nodeType;) {
			var anyProps = props;
			if (instance.nodeName.toLowerCase() !== type.toLowerCase()) {
				if (!inRootOrSingleton && ("INPUT" !== instance.nodeName || "hidden" !== instance.type)) break;
			} else if (!inRootOrSingleton) if ("input" === type && "hidden" === instance.type) {
				var name = null == anyProps.name ? null : "" + anyProps.name;
				if ("hidden" === anyProps.type && instance.getAttribute("name") === name) return instance;
			} else return instance;
			else if (!instance[internalHoistableMarker]) switch (type) {
				case "meta":
					if (!instance.hasAttribute("itemprop")) break;
					return instance;
				case "link":
					name = instance.getAttribute("rel");
					if ("stylesheet" === name && instance.hasAttribute("data-precedence")) break;
					else if (name !== anyProps.rel || instance.getAttribute("href") !== (null == anyProps.href || "" === anyProps.href ? null : anyProps.href) || instance.getAttribute("crossorigin") !== (null == anyProps.crossOrigin ? null : anyProps.crossOrigin) || instance.getAttribute("title") !== (null == anyProps.title ? null : anyProps.title)) break;
					return instance;
				case "style":
					if (instance.hasAttribute("data-precedence")) break;
					return instance;
				case "script":
					name = instance.getAttribute("src");
					if ((name !== (null == anyProps.src ? null : anyProps.src) || instance.getAttribute("type") !== (null == anyProps.type ? null : anyProps.type) || instance.getAttribute("crossorigin") !== (null == anyProps.crossOrigin ? null : anyProps.crossOrigin)) && name && instance.hasAttribute("async") && !instance.hasAttribute("itemprop")) break;
					return instance;
				default: return instance;
			}
			instance = getNextHydratable(instance.nextSibling);
			if (null === instance) break;
		}
		return null;
	}
	function canHydrateTextInstance(instance, text, inRootOrSingleton) {
		if ("" === text) return null;
		for (; 3 !== instance.nodeType;) {
			if ((1 !== instance.nodeType || "INPUT" !== instance.nodeName || "hidden" !== instance.type) && !inRootOrSingleton) return null;
			instance = getNextHydratable(instance.nextSibling);
			if (null === instance) return null;
		}
		return instance;
	}
	function canHydrateHydrationBoundary(instance, inRootOrSingleton) {
		for (; 8 !== instance.nodeType;) {
			if ((1 !== instance.nodeType || "INPUT" !== instance.nodeName || "hidden" !== instance.type) && !inRootOrSingleton) return null;
			instance = getNextHydratable(instance.nextSibling);
			if (null === instance) return null;
		}
		return instance;
	}
	function isSuspenseInstancePending(instance) {
		return "$?" === instance.data || "$~" === instance.data;
	}
	function isSuspenseInstanceFallback(instance) {
		return "$!" === instance.data || "$?" === instance.data && "loading" !== instance.ownerDocument.readyState;
	}
	function registerSuspenseInstanceRetry(instance, callback) {
		var ownerDocument = instance.ownerDocument;
		if ("$~" === instance.data) instance._reactRetry = callback;
		else if ("$?" !== instance.data || "loading" !== ownerDocument.readyState) callback();
		else {
			var listener = function() {
				callback();
				ownerDocument.removeEventListener("DOMContentLoaded", listener);
			};
			ownerDocument.addEventListener("DOMContentLoaded", listener);
			instance._reactRetry = listener;
		}
	}
	function getNextHydratable(node) {
		for (; null != node; node = node.nextSibling) {
			var nodeType = node.nodeType;
			if (1 === nodeType || 3 === nodeType) break;
			if (8 === nodeType) {
				nodeType = node.data;
				if ("$" === nodeType || "$!" === nodeType || "$?" === nodeType || "$~" === nodeType || "&" === nodeType || "F!" === nodeType || "F" === nodeType) break;
				if ("/$" === nodeType || "/&" === nodeType) return null;
			}
		}
		return node;
	}
	var previousHydratableOnEnteringScopedSingleton = null;
	function getNextHydratableInstanceAfterHydrationBoundary(hydrationInstance) {
		hydrationInstance = hydrationInstance.nextSibling;
		for (var depth = 0; hydrationInstance;) {
			if (8 === hydrationInstance.nodeType) {
				var data = hydrationInstance.data;
				if ("/$" === data || "/&" === data) {
					if (0 === depth) return getNextHydratable(hydrationInstance.nextSibling);
					depth--;
				} else "$" !== data && "$!" !== data && "$?" !== data && "$~" !== data && "&" !== data || depth++;
			}
			hydrationInstance = hydrationInstance.nextSibling;
		}
		return null;
	}
	function getParentHydrationBoundary(targetInstance) {
		targetInstance = targetInstance.previousSibling;
		for (var depth = 0; targetInstance;) {
			if (8 === targetInstance.nodeType) {
				var data = targetInstance.data;
				if ("$" === data || "$!" === data || "$?" === data || "$~" === data || "&" === data) {
					if (0 === depth) return targetInstance;
					depth--;
				} else "/$" !== data && "/&" !== data || depth++;
			}
			targetInstance = targetInstance.previousSibling;
		}
		return null;
	}
	function resolveSingletonInstance(type, props, rootContainerInstance) {
		props = getOwnerDocumentFromRootContainer(rootContainerInstance);
		switch (type) {
			case "html":
				type = props.documentElement;
				if (!type) throw Error(formatProdErrorMessage(452));
				return type;
			case "head":
				type = props.head;
				if (!type) throw Error(formatProdErrorMessage(453));
				return type;
			case "body":
				type = props.body;
				if (!type) throw Error(formatProdErrorMessage(454));
				return type;
			default: throw Error(formatProdErrorMessage(451));
		}
	}
	function releaseSingletonInstance(instance) {
		for (var attributes = instance.attributes; attributes.length;) instance.removeAttributeNode(attributes[0]);
		detachDeletedInstance(instance);
	}
	var preloadPropsMap = /* @__PURE__ */ new Map(), preconnectsSet = /* @__PURE__ */ new Set();
	function getHoistableRoot(container) {
		return "function" === typeof container.getRootNode ? container.getRootNode() : 9 === container.nodeType ? container : container.ownerDocument;
	}
	var previousDispatcher = ReactDOMSharedInternals.d;
	ReactDOMSharedInternals.d = {
		f: flushSyncWork,
		r: requestFormReset,
		D: prefetchDNS,
		C: preconnect,
		L: preload,
		m: preloadModule,
		X: preinitScript,
		S: preinitStyle,
		M: preinitModuleScript
	};
	function flushSyncWork() {
		var previousWasRendering = previousDispatcher.f(), wasRendering = flushSyncWork$1();
		return previousWasRendering || wasRendering;
	}
	function requestFormReset(form) {
		var formInst = getInstanceFromNode(form);
		null !== formInst && 5 === formInst.tag && "form" === formInst.type ? requestFormReset$1(formInst) : previousDispatcher.r(form);
	}
	var globalDocument = "undefined" === typeof document ? null : document;
	function preconnectAs(rel, href, crossOrigin) {
		var ownerDocument = globalDocument;
		if (ownerDocument && "string" === typeof href && href) {
			var limitedEscapedHref = escapeSelectorAttributeValueInsideDoubleQuotes(href);
			limitedEscapedHref = "link[rel=\"" + rel + "\"][href=\"" + limitedEscapedHref + "\"]";
			"string" === typeof crossOrigin && (limitedEscapedHref += "[crossorigin=\"" + crossOrigin + "\"]");
			preconnectsSet.has(limitedEscapedHref) || (preconnectsSet.add(limitedEscapedHref), rel = {
				rel,
				crossOrigin,
				href
			}, null === ownerDocument.querySelector(limitedEscapedHref) && (href = ownerDocument.createElement("link"), setInitialProperties(href, "link", rel), markNodeAsHoistable(href), ownerDocument.head.appendChild(href)));
		}
	}
	function prefetchDNS(href) {
		previousDispatcher.D(href);
		preconnectAs("dns-prefetch", href, null);
	}
	function preconnect(href, crossOrigin) {
		previousDispatcher.C(href, crossOrigin);
		preconnectAs("preconnect", href, crossOrigin);
	}
	function preload(href, as, options) {
		previousDispatcher.L(href, as, options);
		var ownerDocument = globalDocument;
		if (ownerDocument && href && as) {
			var preloadSelector = "link[rel=\"preload\"][as=\"" + escapeSelectorAttributeValueInsideDoubleQuotes(as) + "\"]";
			"image" === as ? options && options.imageSrcSet ? (preloadSelector += "[imagesrcset=\"" + escapeSelectorAttributeValueInsideDoubleQuotes(options.imageSrcSet) + "\"]", "string" === typeof options.imageSizes && (preloadSelector += "[imagesizes=\"" + escapeSelectorAttributeValueInsideDoubleQuotes(options.imageSizes) + "\"]")) : preloadSelector += "[href=\"" + escapeSelectorAttributeValueInsideDoubleQuotes(href) + "\"]" : preloadSelector += "[href=\"" + escapeSelectorAttributeValueInsideDoubleQuotes(href) + "\"]";
			var key = preloadSelector;
			switch (as) {
				case "style":
					key = getStyleKey(href);
					break;
				case "script": key = getScriptKey(href);
			}
			preloadPropsMap.has(key) || (href = assign({
				rel: "preload",
				href: "image" === as && options && options.imageSrcSet ? void 0 : href,
				as
			}, options), preloadPropsMap.set(key, href), null !== ownerDocument.querySelector(preloadSelector) || "style" === as && ownerDocument.querySelector(getStylesheetSelectorFromKey(key)) || "script" === as && ownerDocument.querySelector(getScriptSelectorFromKey(key)) || (as = ownerDocument.createElement("link"), setInitialProperties(as, "link", href), markNodeAsHoistable(as), ownerDocument.head.appendChild(as)));
		}
	}
	function preloadModule(href, options) {
		previousDispatcher.m(href, options);
		var ownerDocument = globalDocument;
		if (ownerDocument && href) {
			var as = options && "string" === typeof options.as ? options.as : "script", preloadSelector = "link[rel=\"modulepreload\"][as=\"" + escapeSelectorAttributeValueInsideDoubleQuotes(as) + "\"][href=\"" + escapeSelectorAttributeValueInsideDoubleQuotes(href) + "\"]", key = preloadSelector;
			switch (as) {
				case "audioworklet":
				case "paintworklet":
				case "serviceworker":
				case "sharedworker":
				case "worker":
				case "script": key = getScriptKey(href);
			}
			if (!preloadPropsMap.has(key) && (href = assign({
				rel: "modulepreload",
				href
			}, options), preloadPropsMap.set(key, href), null === ownerDocument.querySelector(preloadSelector))) {
				switch (as) {
					case "audioworklet":
					case "paintworklet":
					case "serviceworker":
					case "sharedworker":
					case "worker":
					case "script": if (ownerDocument.querySelector(getScriptSelectorFromKey(key))) return;
				}
				as = ownerDocument.createElement("link");
				setInitialProperties(as, "link", href);
				markNodeAsHoistable(as);
				ownerDocument.head.appendChild(as);
			}
		}
	}
	function preinitStyle(href, precedence, options) {
		previousDispatcher.S(href, precedence, options);
		var ownerDocument = globalDocument;
		if (ownerDocument && href) {
			var styles = getResourcesFromRoot(ownerDocument).hoistableStyles, key = getStyleKey(href);
			precedence = precedence || "default";
			var resource = styles.get(key);
			if (!resource) {
				var state = {
					loading: 0,
					preload: null
				};
				if (resource = ownerDocument.querySelector(getStylesheetSelectorFromKey(key))) state.loading = 5;
				else {
					href = assign({
						rel: "stylesheet",
						href,
						"data-precedence": precedence
					}, options);
					(options = preloadPropsMap.get(key)) && adoptPreloadPropsForStylesheet(href, options);
					var link = resource = ownerDocument.createElement("link");
					markNodeAsHoistable(link);
					setInitialProperties(link, "link", href);
					link._p = new Promise(function(resolve, reject) {
						link.onload = resolve;
						link.onerror = reject;
					});
					link.addEventListener("load", function() {
						state.loading |= 1;
					});
					link.addEventListener("error", function() {
						state.loading |= 2;
					});
					state.loading |= 4;
					insertStylesheet(resource, precedence, ownerDocument);
				}
				resource = {
					type: "stylesheet",
					instance: resource,
					count: 1,
					state
				};
				styles.set(key, resource);
			}
		}
	}
	function preinitScript(src, options) {
		previousDispatcher.X(src, options);
		var ownerDocument = globalDocument;
		if (ownerDocument && src) {
			var scripts = getResourcesFromRoot(ownerDocument).hoistableScripts, key = getScriptKey(src), resource = scripts.get(key);
			resource || (resource = ownerDocument.querySelector(getScriptSelectorFromKey(key)), resource || (src = assign({
				src,
				async: !0
			}, options), (options = preloadPropsMap.get(key)) && adoptPreloadPropsForScript(src, options), resource = ownerDocument.createElement("script"), markNodeAsHoistable(resource), setInitialProperties(resource, "link", src), ownerDocument.head.appendChild(resource)), resource = {
				type: "script",
				instance: resource,
				count: 1,
				state: null
			}, scripts.set(key, resource));
		}
	}
	function preinitModuleScript(src, options) {
		previousDispatcher.M(src, options);
		var ownerDocument = globalDocument;
		if (ownerDocument && src) {
			var scripts = getResourcesFromRoot(ownerDocument).hoistableScripts, key = getScriptKey(src), resource = scripts.get(key);
			resource || (resource = ownerDocument.querySelector(getScriptSelectorFromKey(key)), resource || (src = assign({
				src,
				async: !0,
				type: "module"
			}, options), (options = preloadPropsMap.get(key)) && adoptPreloadPropsForScript(src, options), resource = ownerDocument.createElement("script"), markNodeAsHoistable(resource), setInitialProperties(resource, "link", src), ownerDocument.head.appendChild(resource)), resource = {
				type: "script",
				instance: resource,
				count: 1,
				state: null
			}, scripts.set(key, resource));
		}
	}
	function getResource(type, currentProps, pendingProps, currentResource) {
		var JSCompiler_inline_result = (JSCompiler_inline_result = rootInstanceStackCursor.current) ? getHoistableRoot(JSCompiler_inline_result) : null;
		if (!JSCompiler_inline_result) throw Error(formatProdErrorMessage(446));
		switch (type) {
			case "meta":
			case "title": return null;
			case "style": return "string" === typeof pendingProps.precedence && "string" === typeof pendingProps.href ? (currentProps = getStyleKey(pendingProps.href), pendingProps = getResourcesFromRoot(JSCompiler_inline_result).hoistableStyles, currentResource = pendingProps.get(currentProps), currentResource || (currentResource = {
				type: "style",
				instance: null,
				count: 0,
				state: null
			}, pendingProps.set(currentProps, currentResource)), currentResource) : {
				type: "void",
				instance: null,
				count: 0,
				state: null
			};
			case "link":
				if ("stylesheet" === pendingProps.rel && "string" === typeof pendingProps.href && "string" === typeof pendingProps.precedence) {
					type = getStyleKey(pendingProps.href);
					var styles$243 = getResourcesFromRoot(JSCompiler_inline_result).hoistableStyles, resource$244 = styles$243.get(type);
					resource$244 || (JSCompiler_inline_result = JSCompiler_inline_result.ownerDocument || JSCompiler_inline_result, resource$244 = {
						type: "stylesheet",
						instance: null,
						count: 0,
						state: {
							loading: 0,
							preload: null
						}
					}, styles$243.set(type, resource$244), (styles$243 = JSCompiler_inline_result.querySelector(getStylesheetSelectorFromKey(type))) && !styles$243._p && (resource$244.instance = styles$243, resource$244.state.loading = 5), preloadPropsMap.has(type) || (pendingProps = {
						rel: "preload",
						as: "style",
						href: pendingProps.href,
						crossOrigin: pendingProps.crossOrigin,
						integrity: pendingProps.integrity,
						media: pendingProps.media,
						hrefLang: pendingProps.hrefLang,
						referrerPolicy: pendingProps.referrerPolicy
					}, preloadPropsMap.set(type, pendingProps), styles$243 || preloadStylesheet(JSCompiler_inline_result, type, pendingProps, resource$244.state)));
					if (currentProps && null === currentResource) throw Error(formatProdErrorMessage(528, ""));
					return resource$244;
				}
				if (currentProps && null !== currentResource) throw Error(formatProdErrorMessage(529, ""));
				return null;
			case "script": return currentProps = pendingProps.async, pendingProps = pendingProps.src, "string" === typeof pendingProps && currentProps && "function" !== typeof currentProps && "symbol" !== typeof currentProps ? (currentProps = getScriptKey(pendingProps), pendingProps = getResourcesFromRoot(JSCompiler_inline_result).hoistableScripts, currentResource = pendingProps.get(currentProps), currentResource || (currentResource = {
				type: "script",
				instance: null,
				count: 0,
				state: null
			}, pendingProps.set(currentProps, currentResource)), currentResource) : {
				type: "void",
				instance: null,
				count: 0,
				state: null
			};
			default: throw Error(formatProdErrorMessage(444, type));
		}
	}
	function getStyleKey(href) {
		return "href=\"" + escapeSelectorAttributeValueInsideDoubleQuotes(href) + "\"";
	}
	function getStylesheetSelectorFromKey(key) {
		return "link[rel=\"stylesheet\"][" + key + "]";
	}
	function stylesheetPropsFromRawProps(rawProps) {
		return assign({}, rawProps, {
			"data-precedence": rawProps.precedence,
			precedence: null
		});
	}
	function preloadStylesheet(ownerDocument, key, preloadProps, state) {
		ownerDocument.querySelector("link[rel=\"preload\"][as=\"style\"][" + key + "]") ? state.loading = 1 : (key = ownerDocument.createElement("link"), state.preload = key, key.addEventListener("load", function() {
			return state.loading |= 1;
		}), key.addEventListener("error", function() {
			return state.loading |= 2;
		}), setInitialProperties(key, "link", preloadProps), markNodeAsHoistable(key), ownerDocument.head.appendChild(key));
	}
	function getScriptKey(src) {
		return "[src=\"" + escapeSelectorAttributeValueInsideDoubleQuotes(src) + "\"]";
	}
	function getScriptSelectorFromKey(key) {
		return "script[async]" + key;
	}
	function acquireResource(hoistableRoot, resource, props) {
		resource.count++;
		if (null === resource.instance) switch (resource.type) {
			case "style":
				var instance = hoistableRoot.querySelector("style[data-href~=\"" + escapeSelectorAttributeValueInsideDoubleQuotes(props.href) + "\"]");
				if (instance) return resource.instance = instance, markNodeAsHoistable(instance), instance;
				var styleProps = assign({}, props, {
					"data-href": props.href,
					"data-precedence": props.precedence,
					href: null,
					precedence: null
				});
				instance = (hoistableRoot.ownerDocument || hoistableRoot).createElement("style");
				markNodeAsHoistable(instance);
				setInitialProperties(instance, "style", styleProps);
				insertStylesheet(instance, props.precedence, hoistableRoot);
				return resource.instance = instance;
			case "stylesheet":
				styleProps = getStyleKey(props.href);
				var instance$249 = hoistableRoot.querySelector(getStylesheetSelectorFromKey(styleProps));
				if (instance$249) return resource.state.loading |= 4, resource.instance = instance$249, markNodeAsHoistable(instance$249), instance$249;
				instance = stylesheetPropsFromRawProps(props);
				(styleProps = preloadPropsMap.get(styleProps)) && adoptPreloadPropsForStylesheet(instance, styleProps);
				instance$249 = (hoistableRoot.ownerDocument || hoistableRoot).createElement("link");
				markNodeAsHoistable(instance$249);
				var linkInstance = instance$249;
				linkInstance._p = new Promise(function(resolve, reject) {
					linkInstance.onload = resolve;
					linkInstance.onerror = reject;
				});
				setInitialProperties(instance$249, "link", instance);
				resource.state.loading |= 4;
				insertStylesheet(instance$249, props.precedence, hoistableRoot);
				return resource.instance = instance$249;
			case "script":
				instance$249 = getScriptKey(props.src);
				if (styleProps = hoistableRoot.querySelector(getScriptSelectorFromKey(instance$249))) return resource.instance = styleProps, markNodeAsHoistable(styleProps), styleProps;
				instance = props;
				if (styleProps = preloadPropsMap.get(instance$249)) instance = assign({}, props), adoptPreloadPropsForScript(instance, styleProps);
				hoistableRoot = hoistableRoot.ownerDocument || hoistableRoot;
				styleProps = hoistableRoot.createElement("script");
				markNodeAsHoistable(styleProps);
				setInitialProperties(styleProps, "link", instance);
				hoistableRoot.head.appendChild(styleProps);
				return resource.instance = styleProps;
			case "void": return null;
			default: throw Error(formatProdErrorMessage(443, resource.type));
		}
		else "stylesheet" === resource.type && 0 === (resource.state.loading & 4) && (instance = resource.instance, resource.state.loading |= 4, insertStylesheet(instance, props.precedence, hoistableRoot));
		return resource.instance;
	}
	function insertStylesheet(instance, precedence, root) {
		for (var nodes = root.querySelectorAll("link[rel=\"stylesheet\"][data-precedence],style[data-precedence]"), last = nodes.length ? nodes[nodes.length - 1] : null, prior = last, i = 0; i < nodes.length; i++) {
			var node = nodes[i];
			if (node.dataset.precedence === precedence) prior = node;
			else if (prior !== last) break;
		}
		prior ? prior.parentNode.insertBefore(instance, prior.nextSibling) : (precedence = 9 === root.nodeType ? root.head : root, precedence.insertBefore(instance, precedence.firstChild));
	}
	function adoptPreloadPropsForStylesheet(stylesheetProps, preloadProps) {
		stylesheetProps.crossOrigin ??= preloadProps.crossOrigin;
		stylesheetProps.referrerPolicy ??= preloadProps.referrerPolicy;
		stylesheetProps.title ??= preloadProps.title;
	}
	function adoptPreloadPropsForScript(scriptProps, preloadProps) {
		scriptProps.crossOrigin ??= preloadProps.crossOrigin;
		scriptProps.referrerPolicy ??= preloadProps.referrerPolicy;
		scriptProps.integrity ??= preloadProps.integrity;
	}
	var tagCaches = null;
	function getHydratableHoistableCache(type, keyAttribute, ownerDocument) {
		if (null === tagCaches) {
			var cache = /* @__PURE__ */ new Map();
			var caches = tagCaches = /* @__PURE__ */ new Map();
			caches.set(ownerDocument, cache);
		} else caches = tagCaches, cache = caches.get(ownerDocument), cache || (cache = /* @__PURE__ */ new Map(), caches.set(ownerDocument, cache));
		if (cache.has(type)) return cache;
		cache.set(type, null);
		ownerDocument = ownerDocument.getElementsByTagName(type);
		for (caches = 0; caches < ownerDocument.length; caches++) {
			var node = ownerDocument[caches];
			if (!(node[internalHoistableMarker] || node[internalInstanceKey] || "link" === type && "stylesheet" === node.getAttribute("rel")) && "http://www.w3.org/2000/svg" !== node.namespaceURI) {
				var nodeKey = node.getAttribute(keyAttribute) || "";
				nodeKey = type + nodeKey;
				var existing = cache.get(nodeKey);
				existing ? existing.push(node) : cache.set(nodeKey, [node]);
			}
		}
		return cache;
	}
	function mountHoistable(hoistableRoot, type, instance) {
		hoistableRoot = hoistableRoot.ownerDocument || hoistableRoot;
		hoistableRoot.head.insertBefore(instance, "title" === type ? hoistableRoot.querySelector("head > title") : null);
	}
	function isHostHoistableType(type, props, hostContext) {
		if (1 === hostContext || null != props.itemProp) return !1;
		switch (type) {
			case "meta":
			case "title": return !0;
			case "style":
				if ("string" !== typeof props.precedence || "string" !== typeof props.href || "" === props.href) break;
				return !0;
			case "link":
				if ("string" !== typeof props.rel || "string" !== typeof props.href || "" === props.href || props.onLoad || props.onError) break;
				switch (props.rel) {
					case "stylesheet": return type = props.disabled, "string" === typeof props.precedence && null == type;
					default: return !0;
				}
			case "script": if (props.async && "function" !== typeof props.async && "symbol" !== typeof props.async && !props.onLoad && !props.onError && props.src && "string" === typeof props.src) return !0;
		}
		return !1;
	}
	function preloadResource(resource) {
		return "stylesheet" === resource.type && 0 === (resource.state.loading & 3) ? !1 : !0;
	}
	function suspendResource(state, hoistableRoot, resource, props) {
		if ("stylesheet" === resource.type && ("string" !== typeof props.media || !1 !== matchMedia(props.media).matches) && 0 === (resource.state.loading & 4)) {
			if (null === resource.instance) {
				var key = getStyleKey(props.href), instance = hoistableRoot.querySelector(getStylesheetSelectorFromKey(key));
				if (instance) {
					hoistableRoot = instance._p;
					null !== hoistableRoot && "object" === typeof hoistableRoot && "function" === typeof hoistableRoot.then && (state.count++, state = onUnsuspend.bind(state), hoistableRoot.then(state, state));
					resource.state.loading |= 4;
					resource.instance = instance;
					markNodeAsHoistable(instance);
					return;
				}
				instance = hoistableRoot.ownerDocument || hoistableRoot;
				props = stylesheetPropsFromRawProps(props);
				(key = preloadPropsMap.get(key)) && adoptPreloadPropsForStylesheet(props, key);
				instance = instance.createElement("link");
				markNodeAsHoistable(instance);
				var linkInstance = instance;
				linkInstance._p = new Promise(function(resolve, reject) {
					linkInstance.onload = resolve;
					linkInstance.onerror = reject;
				});
				setInitialProperties(instance, "link", props);
				resource.instance = instance;
			}
			null === state.stylesheets && (state.stylesheets = /* @__PURE__ */ new Map());
			state.stylesheets.set(resource, hoistableRoot);
			(hoistableRoot = resource.state.preload) && 0 === (resource.state.loading & 3) && (state.count++, resource = onUnsuspend.bind(state), hoistableRoot.addEventListener("load", resource), hoistableRoot.addEventListener("error", resource));
		}
	}
	var estimatedBytesWithinLimit = 0;
	function waitForCommitToBeReady(state, timeoutOffset) {
		state.stylesheets && 0 === state.count && insertSuspendedStylesheets(state, state.stylesheets);
		return 0 < state.count || 0 < state.imgCount ? function(commit) {
			var stylesheetTimer = setTimeout(function() {
				state.stylesheets && insertSuspendedStylesheets(state, state.stylesheets);
				if (state.unsuspend) {
					var unsuspend = state.unsuspend;
					state.unsuspend = null;
					unsuspend();
				}
			}, 6e4 + timeoutOffset);
			0 < state.imgBytes && 0 === estimatedBytesWithinLimit && (estimatedBytesWithinLimit = 62500 * estimateBandwidth());
			var imgTimer = setTimeout(function() {
				state.waitingForImages = !1;
				if (0 === state.count && (state.stylesheets && insertSuspendedStylesheets(state, state.stylesheets), state.unsuspend)) {
					var unsuspend = state.unsuspend;
					state.unsuspend = null;
					unsuspend();
				}
			}, (state.imgBytes > estimatedBytesWithinLimit ? 50 : 800) + timeoutOffset);
			state.unsuspend = commit;
			return function() {
				state.unsuspend = null;
				clearTimeout(stylesheetTimer);
				clearTimeout(imgTimer);
			};
		} : null;
	}
	function onUnsuspend() {
		this.count--;
		if (0 === this.count && (0 === this.imgCount || !this.waitingForImages)) {
			if (this.stylesheets) insertSuspendedStylesheets(this, this.stylesheets);
			else if (this.unsuspend) {
				var unsuspend = this.unsuspend;
				this.unsuspend = null;
				unsuspend();
			}
		}
	}
	var precedencesByRoot = null;
	function insertSuspendedStylesheets(state, resources) {
		state.stylesheets = null;
		null !== state.unsuspend && (state.count++, precedencesByRoot = /* @__PURE__ */ new Map(), resources.forEach(insertStylesheetIntoRoot, state), precedencesByRoot = null, onUnsuspend.call(state));
	}
	function insertStylesheetIntoRoot(root, resource) {
		if (!(resource.state.loading & 4)) {
			var precedences = precedencesByRoot.get(root);
			if (precedences) var last = precedences.get(null);
			else {
				precedences = /* @__PURE__ */ new Map();
				precedencesByRoot.set(root, precedences);
				for (var nodes = root.querySelectorAll("link[data-precedence],style[data-precedence]"), i = 0; i < nodes.length; i++) {
					var node = nodes[i];
					if ("LINK" === node.nodeName || "not all" !== node.getAttribute("media")) precedences.set(node.dataset.precedence, node), last = node;
				}
				last && precedences.set(null, last);
			}
			nodes = resource.instance;
			node = nodes.getAttribute("data-precedence");
			i = precedences.get(node) || last;
			i === last && precedences.set(null, nodes);
			precedences.set(node, nodes);
			this.count++;
			last = onUnsuspend.bind(this);
			nodes.addEventListener("load", last);
			nodes.addEventListener("error", last);
			i ? i.parentNode.insertBefore(nodes, i.nextSibling) : (root = 9 === root.nodeType ? root.head : root, root.insertBefore(nodes, root.firstChild));
			resource.state.loading |= 4;
		}
	}
	var HostTransitionContext = {
		$$typeof: REACT_CONTEXT_TYPE,
		Provider: null,
		Consumer: null,
		_currentValue: sharedNotPendingObject,
		_currentValue2: sharedNotPendingObject,
		_threadCount: 0
	};
	function FiberRootNode(containerInfo, tag, hydrate, identifierPrefix, onUncaughtError, onCaughtError, onRecoverableError, onDefaultTransitionIndicator, formState) {
		this.tag = 1;
		this.containerInfo = containerInfo;
		this.pingCache = this.current = this.pendingChildren = null;
		this.timeoutHandle = -1;
		this.callbackNode = this.next = this.pendingContext = this.context = this.cancelPendingCommit = null;
		this.callbackPriority = 0;
		this.expirationTimes = createLaneMap(-1);
		this.entangledLanes = this.shellSuspendCounter = this.errorRecoveryDisabledLanes = this.expiredLanes = this.warmLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0;
		this.entanglements = createLaneMap(0);
		this.hiddenUpdates = createLaneMap(null);
		this.identifierPrefix = identifierPrefix;
		this.onUncaughtError = onUncaughtError;
		this.onCaughtError = onCaughtError;
		this.onRecoverableError = onRecoverableError;
		this.pooledCache = null;
		this.pooledCacheLanes = 0;
		this.formState = formState;
		this.incompleteTransitions = /* @__PURE__ */ new Map();
	}
	function createFiberRoot(containerInfo, tag, hydrate, initialChildren, hydrationCallbacks, isStrictMode, identifierPrefix, formState, onUncaughtError, onCaughtError, onRecoverableError, onDefaultTransitionIndicator) {
		containerInfo = new FiberRootNode(containerInfo, tag, hydrate, identifierPrefix, onUncaughtError, onCaughtError, onRecoverableError, onDefaultTransitionIndicator, formState);
		tag = 1;
		!0 === isStrictMode && (tag |= 24);
		isStrictMode = createFiberImplClass(3, null, null, tag);
		containerInfo.current = isStrictMode;
		isStrictMode.stateNode = containerInfo;
		tag = createCache();
		tag.refCount++;
		containerInfo.pooledCache = tag;
		tag.refCount++;
		isStrictMode.memoizedState = {
			element: initialChildren,
			isDehydrated: hydrate,
			cache: tag
		};
		initializeUpdateQueue(isStrictMode);
		return containerInfo;
	}
	function getContextForSubtree(parentComponent) {
		if (!parentComponent) return emptyContextObject;
		parentComponent = emptyContextObject;
		return parentComponent;
	}
	function updateContainerImpl(rootFiber, lane, element, container, parentComponent, callback) {
		parentComponent = getContextForSubtree(parentComponent);
		null === container.context ? container.context = parentComponent : container.pendingContext = parentComponent;
		container = createUpdate(lane);
		container.payload = { element };
		callback = void 0 === callback ? null : callback;
		null !== callback && (container.callback = callback);
		element = enqueueUpdate(rootFiber, container, lane);
		null !== element && (scheduleUpdateOnFiber(element, rootFiber, lane), entangleTransitions(element, rootFiber, lane));
	}
	function markRetryLaneImpl(fiber, retryLane) {
		fiber = fiber.memoizedState;
		if (null !== fiber && null !== fiber.dehydrated) {
			var a = fiber.retryLane;
			fiber.retryLane = 0 !== a && a < retryLane ? a : retryLane;
		}
	}
	function markRetryLaneIfNotHydrated(fiber, retryLane) {
		markRetryLaneImpl(fiber, retryLane);
		(fiber = fiber.alternate) && markRetryLaneImpl(fiber, retryLane);
	}
	function attemptContinuousHydration(fiber) {
		if (13 === fiber.tag || 31 === fiber.tag) {
			var root = enqueueConcurrentRenderForLane(fiber, 67108864);
			null !== root && scheduleUpdateOnFiber(root, fiber, 67108864);
			markRetryLaneIfNotHydrated(fiber, 67108864);
		}
	}
	function attemptHydrationAtCurrentPriority(fiber) {
		if (13 === fiber.tag || 31 === fiber.tag) {
			var lane = requestUpdateLane();
			lane = getBumpedLaneForHydrationByLane(lane);
			var root = enqueueConcurrentRenderForLane(fiber, lane);
			null !== root && scheduleUpdateOnFiber(root, fiber, lane);
			markRetryLaneIfNotHydrated(fiber, lane);
		}
	}
	var _enabled = !0;
	function dispatchDiscreteEvent(domEventName, eventSystemFlags, container, nativeEvent) {
		var prevTransition = ReactSharedInternals.T;
		ReactSharedInternals.T = null;
		var previousPriority = ReactDOMSharedInternals.p;
		try {
			ReactDOMSharedInternals.p = 2, dispatchEvent(domEventName, eventSystemFlags, container, nativeEvent);
		} finally {
			ReactDOMSharedInternals.p = previousPriority, ReactSharedInternals.T = prevTransition;
		}
	}
	function dispatchContinuousEvent(domEventName, eventSystemFlags, container, nativeEvent) {
		var prevTransition = ReactSharedInternals.T;
		ReactSharedInternals.T = null;
		var previousPriority = ReactDOMSharedInternals.p;
		try {
			ReactDOMSharedInternals.p = 8, dispatchEvent(domEventName, eventSystemFlags, container, nativeEvent);
		} finally {
			ReactDOMSharedInternals.p = previousPriority, ReactSharedInternals.T = prevTransition;
		}
	}
	function dispatchEvent(domEventName, eventSystemFlags, targetContainer, nativeEvent) {
		if (_enabled) {
			var blockedOn = findInstanceBlockingEvent(nativeEvent);
			if (null === blockedOn) dispatchEventForPluginEventSystem(domEventName, eventSystemFlags, nativeEvent, return_targetInst, targetContainer), clearIfContinuousEvent(domEventName, nativeEvent);
			else if (queueIfContinuousEvent(blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent)) nativeEvent.stopPropagation();
			else if (clearIfContinuousEvent(domEventName, nativeEvent), eventSystemFlags & 4 && -1 < discreteReplayableEvents.indexOf(domEventName)) {
				for (; null !== blockedOn;) {
					var fiber = getInstanceFromNode(blockedOn);
					if (null !== fiber) switch (fiber.tag) {
						case 3:
							fiber = fiber.stateNode;
							if (fiber.current.memoizedState.isDehydrated) {
								var lanes = getHighestPriorityLanes(fiber.pendingLanes);
								if (0 !== lanes) {
									var root = fiber;
									root.pendingLanes |= 2;
									for (root.entangledLanes |= 2; lanes;) {
										var lane = 1 << 31 - clz32(lanes);
										root.entanglements[1] |= lane;
										lanes &= ~lane;
									}
									ensureRootIsScheduled(fiber);
									0 === (executionContext & 6) && (workInProgressRootRenderTargetTime = now() + 500, flushSyncWorkAcrossRoots_impl(0, !1));
								}
							}
							break;
						case 31:
						case 13: root = enqueueConcurrentRenderForLane(fiber, 2), null !== root && scheduleUpdateOnFiber(root, fiber, 2), flushSyncWork$1(), markRetryLaneIfNotHydrated(fiber, 2);
					}
					fiber = findInstanceBlockingEvent(nativeEvent);
					null === fiber && dispatchEventForPluginEventSystem(domEventName, eventSystemFlags, nativeEvent, return_targetInst, targetContainer);
					if (fiber === blockedOn) break;
					blockedOn = fiber;
				}
				null !== blockedOn && nativeEvent.stopPropagation();
			} else dispatchEventForPluginEventSystem(domEventName, eventSystemFlags, nativeEvent, null, targetContainer);
		}
	}
	function findInstanceBlockingEvent(nativeEvent) {
		nativeEvent = getEventTarget(nativeEvent);
		return findInstanceBlockingTarget(nativeEvent);
	}
	var return_targetInst = null;
	function findInstanceBlockingTarget(targetNode) {
		return_targetInst = null;
		targetNode = getClosestInstanceFromNode(targetNode);
		if (null !== targetNode) {
			var nearestMounted = getNearestMountedFiber(targetNode);
			if (null === nearestMounted) targetNode = null;
			else {
				var tag = nearestMounted.tag;
				if (13 === tag) {
					targetNode = getSuspenseInstanceFromFiber(nearestMounted);
					if (null !== targetNode) return targetNode;
					targetNode = null;
				} else if (31 === tag) {
					targetNode = getActivityInstanceFromFiber(nearestMounted);
					if (null !== targetNode) return targetNode;
					targetNode = null;
				} else if (3 === tag) {
					if (nearestMounted.stateNode.current.memoizedState.isDehydrated) return 3 === nearestMounted.tag ? nearestMounted.stateNode.containerInfo : null;
					targetNode = null;
				} else nearestMounted !== targetNode && (targetNode = null);
			}
		}
		return_targetInst = targetNode;
		return null;
	}
	function getEventPriority(domEventName) {
		switch (domEventName) {
			case "beforetoggle":
			case "cancel":
			case "click":
			case "close":
			case "contextmenu":
			case "copy":
			case "cut":
			case "auxclick":
			case "dblclick":
			case "dragend":
			case "dragstart":
			case "drop":
			case "focusin":
			case "focusout":
			case "input":
			case "invalid":
			case "keydown":
			case "keypress":
			case "keyup":
			case "mousedown":
			case "mouseup":
			case "paste":
			case "pause":
			case "play":
			case "pointercancel":
			case "pointerdown":
			case "pointerup":
			case "ratechange":
			case "reset":
			case "resize":
			case "seeked":
			case "submit":
			case "toggle":
			case "touchcancel":
			case "touchend":
			case "touchstart":
			case "volumechange":
			case "change":
			case "selectionchange":
			case "textInput":
			case "compositionstart":
			case "compositionend":
			case "compositionupdate":
			case "beforeblur":
			case "afterblur":
			case "beforeinput":
			case "blur":
			case "fullscreenchange":
			case "focus":
			case "hashchange":
			case "popstate":
			case "select":
			case "selectstart": return 2;
			case "drag":
			case "dragenter":
			case "dragexit":
			case "dragleave":
			case "dragover":
			case "mousemove":
			case "mouseout":
			case "mouseover":
			case "pointermove":
			case "pointerout":
			case "pointerover":
			case "scroll":
			case "touchmove":
			case "wheel":
			case "mouseenter":
			case "mouseleave":
			case "pointerenter":
			case "pointerleave": return 8;
			case "message": switch (getCurrentPriorityLevel()) {
				case ImmediatePriority: return 2;
				case UserBlockingPriority: return 8;
				case NormalPriority$1:
				case LowPriority: return 32;
				case IdlePriority: return 268435456;
				default: return 32;
			}
			default: return 32;
		}
	}
	var hasScheduledReplayAttempt = !1, queuedFocus = null, queuedDrag = null, queuedMouse = null, queuedPointers = /* @__PURE__ */ new Map(), queuedPointerCaptures = /* @__PURE__ */ new Map(), queuedExplicitHydrationTargets = [], discreteReplayableEvents = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");
	function clearIfContinuousEvent(domEventName, nativeEvent) {
		switch (domEventName) {
			case "focusin":
			case "focusout":
				queuedFocus = null;
				break;
			case "dragenter":
			case "dragleave":
				queuedDrag = null;
				break;
			case "mouseover":
			case "mouseout":
				queuedMouse = null;
				break;
			case "pointerover":
			case "pointerout":
				queuedPointers.delete(nativeEvent.pointerId);
				break;
			case "gotpointercapture":
			case "lostpointercapture": queuedPointerCaptures.delete(nativeEvent.pointerId);
		}
	}
	function accumulateOrCreateContinuousQueuedReplayableEvent(existingQueuedEvent, blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent) {
		if (null === existingQueuedEvent || existingQueuedEvent.nativeEvent !== nativeEvent) return existingQueuedEvent = {
			blockedOn,
			domEventName,
			eventSystemFlags,
			nativeEvent,
			targetContainers: [targetContainer]
		}, null !== blockedOn && (blockedOn = getInstanceFromNode(blockedOn), null !== blockedOn && attemptContinuousHydration(blockedOn)), existingQueuedEvent;
		existingQueuedEvent.eventSystemFlags |= eventSystemFlags;
		blockedOn = existingQueuedEvent.targetContainers;
		null !== targetContainer && -1 === blockedOn.indexOf(targetContainer) && blockedOn.push(targetContainer);
		return existingQueuedEvent;
	}
	function queueIfContinuousEvent(blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent) {
		switch (domEventName) {
			case "focusin": return queuedFocus = accumulateOrCreateContinuousQueuedReplayableEvent(queuedFocus, blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent), !0;
			case "dragenter": return queuedDrag = accumulateOrCreateContinuousQueuedReplayableEvent(queuedDrag, blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent), !0;
			case "mouseover": return queuedMouse = accumulateOrCreateContinuousQueuedReplayableEvent(queuedMouse, blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent), !0;
			case "pointerover":
				var pointerId = nativeEvent.pointerId;
				queuedPointers.set(pointerId, accumulateOrCreateContinuousQueuedReplayableEvent(queuedPointers.get(pointerId) || null, blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent));
				return !0;
			case "gotpointercapture": return pointerId = nativeEvent.pointerId, queuedPointerCaptures.set(pointerId, accumulateOrCreateContinuousQueuedReplayableEvent(queuedPointerCaptures.get(pointerId) || null, blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent)), !0;
		}
		return !1;
	}
	function attemptExplicitHydrationTarget(queuedTarget) {
		var targetInst = getClosestInstanceFromNode(queuedTarget.target);
		if (null !== targetInst) {
			var nearestMounted = getNearestMountedFiber(targetInst);
			if (null !== nearestMounted) {
				if (targetInst = nearestMounted.tag, 13 === targetInst) {
					if (targetInst = getSuspenseInstanceFromFiber(nearestMounted), null !== targetInst) {
						queuedTarget.blockedOn = targetInst;
						runWithPriority(queuedTarget.priority, function() {
							attemptHydrationAtCurrentPriority(nearestMounted);
						});
						return;
					}
				} else if (31 === targetInst) {
					if (targetInst = getActivityInstanceFromFiber(nearestMounted), null !== targetInst) {
						queuedTarget.blockedOn = targetInst;
						runWithPriority(queuedTarget.priority, function() {
							attemptHydrationAtCurrentPriority(nearestMounted);
						});
						return;
					}
				} else if (3 === targetInst && nearestMounted.stateNode.current.memoizedState.isDehydrated) {
					queuedTarget.blockedOn = 3 === nearestMounted.tag ? nearestMounted.stateNode.containerInfo : null;
					return;
				}
			}
		}
		queuedTarget.blockedOn = null;
	}
	function attemptReplayContinuousQueuedEvent(queuedEvent) {
		if (null !== queuedEvent.blockedOn) return !1;
		for (var targetContainers = queuedEvent.targetContainers; 0 < targetContainers.length;) {
			var nextBlockedOn = findInstanceBlockingEvent(queuedEvent.nativeEvent);
			if (null === nextBlockedOn) {
				nextBlockedOn = queuedEvent.nativeEvent;
				var nativeEventClone = new nextBlockedOn.constructor(nextBlockedOn.type, nextBlockedOn);
				currentReplayingEvent = nativeEventClone;
				nextBlockedOn.target.dispatchEvent(nativeEventClone);
				currentReplayingEvent = null;
			} else return targetContainers = getInstanceFromNode(nextBlockedOn), null !== targetContainers && attemptContinuousHydration(targetContainers), queuedEvent.blockedOn = nextBlockedOn, !1;
			targetContainers.shift();
		}
		return !0;
	}
	function attemptReplayContinuousQueuedEventInMap(queuedEvent, key, map) {
		attemptReplayContinuousQueuedEvent(queuedEvent) && map.delete(key);
	}
	function replayUnblockedEvents() {
		hasScheduledReplayAttempt = !1;
		null !== queuedFocus && attemptReplayContinuousQueuedEvent(queuedFocus) && (queuedFocus = null);
		null !== queuedDrag && attemptReplayContinuousQueuedEvent(queuedDrag) && (queuedDrag = null);
		null !== queuedMouse && attemptReplayContinuousQueuedEvent(queuedMouse) && (queuedMouse = null);
		queuedPointers.forEach(attemptReplayContinuousQueuedEventInMap);
		queuedPointerCaptures.forEach(attemptReplayContinuousQueuedEventInMap);
	}
	function scheduleCallbackIfUnblocked(queuedEvent, unblocked) {
		queuedEvent.blockedOn === unblocked && (queuedEvent.blockedOn = null, hasScheduledReplayAttempt || (hasScheduledReplayAttempt = !0, Scheduler.unstable_scheduleCallback(Scheduler.unstable_NormalPriority, replayUnblockedEvents)));
	}
	var lastScheduledReplayQueue = null;
	function scheduleReplayQueueIfNeeded(formReplayingQueue) {
		lastScheduledReplayQueue !== formReplayingQueue && (lastScheduledReplayQueue = formReplayingQueue, Scheduler.unstable_scheduleCallback(Scheduler.unstable_NormalPriority, function() {
			lastScheduledReplayQueue === formReplayingQueue && (lastScheduledReplayQueue = null);
			for (var i = 0; i < formReplayingQueue.length; i += 3) {
				var form = formReplayingQueue[i], submitterOrAction = formReplayingQueue[i + 1], formData = formReplayingQueue[i + 2];
				if ("function" !== typeof submitterOrAction) if (null === findInstanceBlockingTarget(submitterOrAction || form)) continue;
				else break;
				var formInst = getInstanceFromNode(form);
				null !== formInst && (formReplayingQueue.splice(i, 3), i -= 3, startHostTransition(formInst, {
					pending: !0,
					data: formData,
					method: form.method,
					action: submitterOrAction
				}, submitterOrAction, formData));
			}
		}));
	}
	function retryIfBlockedOn(unblocked) {
		function unblock(queuedEvent) {
			return scheduleCallbackIfUnblocked(queuedEvent, unblocked);
		}
		null !== queuedFocus && scheduleCallbackIfUnblocked(queuedFocus, unblocked);
		null !== queuedDrag && scheduleCallbackIfUnblocked(queuedDrag, unblocked);
		null !== queuedMouse && scheduleCallbackIfUnblocked(queuedMouse, unblocked);
		queuedPointers.forEach(unblock);
		queuedPointerCaptures.forEach(unblock);
		for (var i = 0; i < queuedExplicitHydrationTargets.length; i++) {
			var queuedTarget = queuedExplicitHydrationTargets[i];
			queuedTarget.blockedOn === unblocked && (queuedTarget.blockedOn = null);
		}
		for (; 0 < queuedExplicitHydrationTargets.length && (i = queuedExplicitHydrationTargets[0], null === i.blockedOn);) attemptExplicitHydrationTarget(i), null === i.blockedOn && queuedExplicitHydrationTargets.shift();
		i = (unblocked.ownerDocument || unblocked).$$reactFormReplay;
		if (null != i) for (queuedTarget = 0; queuedTarget < i.length; queuedTarget += 3) {
			var form = i[queuedTarget], submitterOrAction = i[queuedTarget + 1], formProps = form[internalPropsKey] || null;
			if ("function" === typeof submitterOrAction) formProps || scheduleReplayQueueIfNeeded(i);
			else if (formProps) {
				var action = null;
				if (submitterOrAction && submitterOrAction.hasAttribute("formAction")) {
					if (form = submitterOrAction, formProps = submitterOrAction[internalPropsKey] || null) action = formProps.formAction;
					else if (null !== findInstanceBlockingTarget(form)) continue;
				} else action = formProps.action;
				"function" === typeof action ? i[queuedTarget + 1] = action : (i.splice(queuedTarget, 3), queuedTarget -= 3);
				scheduleReplayQueueIfNeeded(i);
			}
		}
	}
	function defaultOnDefaultTransitionIndicator() {
		function handleNavigate(event) {
			event.canIntercept && "react-transition" === event.info && event.intercept({
				handler: function() {
					return new Promise(function(resolve) {
						return pendingResolve = resolve;
					});
				},
				focusReset: "manual",
				scroll: "manual"
			});
		}
		function handleNavigateComplete() {
			null !== pendingResolve && (pendingResolve(), pendingResolve = null);
			isCancelled || setTimeout(startFakeNavigation, 20);
		}
		function startFakeNavigation() {
			if (!isCancelled && !navigation.transition) {
				var currentEntry = navigation.currentEntry;
				currentEntry && null != currentEntry.url && navigation.navigate(currentEntry.url, {
					state: currentEntry.getState(),
					info: "react-transition",
					history: "replace"
				});
			}
		}
		if ("object" === typeof navigation) {
			var isCancelled = !1, pendingResolve = null;
			navigation.addEventListener("navigate", handleNavigate);
			navigation.addEventListener("navigatesuccess", handleNavigateComplete);
			navigation.addEventListener("navigateerror", handleNavigateComplete);
			setTimeout(startFakeNavigation, 100);
			return function() {
				isCancelled = !0;
				navigation.removeEventListener("navigate", handleNavigate);
				navigation.removeEventListener("navigatesuccess", handleNavigateComplete);
				navigation.removeEventListener("navigateerror", handleNavigateComplete);
				null !== pendingResolve && (pendingResolve(), pendingResolve = null);
			};
		}
	}
	function ReactDOMRoot(internalRoot) {
		this._internalRoot = internalRoot;
	}
	ReactDOMHydrationRoot.prototype.render = ReactDOMRoot.prototype.render = function(children) {
		var root = this._internalRoot;
		if (null === root) throw Error(formatProdErrorMessage(409));
		var current = root.current;
		updateContainerImpl(current, requestUpdateLane(), children, root, null, null);
	};
	ReactDOMHydrationRoot.prototype.unmount = ReactDOMRoot.prototype.unmount = function() {
		var root = this._internalRoot;
		if (null !== root) {
			this._internalRoot = null;
			var container = root.containerInfo;
			updateContainerImpl(root.current, 2, null, root, null, null);
			flushSyncWork$1();
			container[internalContainerInstanceKey] = null;
		}
	};
	function ReactDOMHydrationRoot(internalRoot) {
		this._internalRoot = internalRoot;
	}
	ReactDOMHydrationRoot.prototype.unstable_scheduleHydration = function(target) {
		if (target) {
			var updatePriority = resolveUpdatePriority();
			target = {
				blockedOn: null,
				target,
				priority: updatePriority
			};
			for (var i = 0; i < queuedExplicitHydrationTargets.length && 0 !== updatePriority && updatePriority < queuedExplicitHydrationTargets[i].priority; i++);
			queuedExplicitHydrationTargets.splice(i, 0, target);
			0 === i && attemptExplicitHydrationTarget(target);
		}
	};
	var isomorphicReactPackageVersion$jscomp$inline_1840 = React.version;
	if ("19.2.6" !== isomorphicReactPackageVersion$jscomp$inline_1840) throw Error(formatProdErrorMessage(527, isomorphicReactPackageVersion$jscomp$inline_1840, "19.2.6"));
	ReactDOMSharedInternals.findDOMNode = function(componentOrElement) {
		var fiber = componentOrElement._reactInternals;
		if (void 0 === fiber) {
			if ("function" === typeof componentOrElement.render) throw Error(formatProdErrorMessage(188));
			componentOrElement = Object.keys(componentOrElement).join(",");
			throw Error(formatProdErrorMessage(268, componentOrElement));
		}
		componentOrElement = findCurrentFiberUsingSlowPath(fiber);
		componentOrElement = null !== componentOrElement ? findCurrentHostFiberImpl(componentOrElement) : null;
		componentOrElement = null === componentOrElement ? null : componentOrElement.stateNode;
		return componentOrElement;
	};
	var internals$jscomp$inline_2347 = {
		bundleType: 0,
		version: "19.2.6",
		rendererPackageName: "react-dom",
		currentDispatcherRef: ReactSharedInternals,
		reconcilerVersion: "19.2.6"
	};
	if ("undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__) {
		var hook$jscomp$inline_2348 = __REACT_DEVTOOLS_GLOBAL_HOOK__;
		if (!hook$jscomp$inline_2348.isDisabled && hook$jscomp$inline_2348.supportsFiber) try {
			rendererID = hook$jscomp$inline_2348.inject(internals$jscomp$inline_2347), injectedHook = hook$jscomp$inline_2348;
		} catch (err) {}
	}
	exports.createRoot = function(container, options) {
		if (!isValidContainer(container)) throw Error(formatProdErrorMessage(299));
		var isStrictMode = !1, identifierPrefix = "", onUncaughtError = defaultOnUncaughtError, onCaughtError = defaultOnCaughtError, onRecoverableError = defaultOnRecoverableError;
		null !== options && void 0 !== options && (!0 === options.unstable_strictMode && (isStrictMode = !0), void 0 !== options.identifierPrefix && (identifierPrefix = options.identifierPrefix), void 0 !== options.onUncaughtError && (onUncaughtError = options.onUncaughtError), void 0 !== options.onCaughtError && (onCaughtError = options.onCaughtError), void 0 !== options.onRecoverableError && (onRecoverableError = options.onRecoverableError));
		options = createFiberRoot(container, 1, !1, null, null, isStrictMode, identifierPrefix, null, onUncaughtError, onCaughtError, onRecoverableError, defaultOnDefaultTransitionIndicator);
		container[internalContainerInstanceKey] = options.current;
		listenToAllSupportedEvents(container);
		return new ReactDOMRoot(options);
	};
}));
//#endregion
//#region ../../../../2026-07-18/rk/node_modules/.pnpm/react-dom@19.2.6_react@19.2.6/node_modules/react-dom/client.js
var require_client = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	function checkDCE() {
		if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ === "undefined" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE !== "function") return;
		try {
			__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(checkDCE);
		} catch (err) {
			console.error(err);
		}
	}
	checkDCE();
	module.exports = require_react_dom_client_production();
}));
//#endregion
//#region app/selection.css
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_client = require_client();
//#endregion
//#region app/teacher-problem-studio-pro.tsx
var import_jsx_runtime = require_jsx_runtime();
var BANK_KEY = "oedong-problem-bank-pro-v1";
var makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
var emptyPiece = (index) => ({
	id: makeId(),
	tag: `${index + 1}단계`,
	question: "이 단계에서 먼저 확인할 것은 무엇일까요?",
	answer: "",
	wrong1: "",
	wrong2: "",
	hint: "원문 해설의 풀이 순서를 참고하세요."
});
function TeacherProblemStudioPro({ curriculum }) {
	const pdfInput = (0, import_react.useRef)(null);
	const imageInput = (0, import_react.useRef)(null);
	const pasteZone = (0, import_react.useRef)(null);
	const [mode, setMode] = (0, import_react.useState)("register");
	const [problems, setProblems] = (0, import_react.useState)([]);
	const [pdfs, setPdfs] = (0, import_react.useState)([]);
	const [activePdf, setActivePdf] = (0, import_react.useState)("");
	const [capture, setCapture] = (0, import_react.useState)("");
	const [number, setNumber] = (0, import_react.useState)("1");
	const [answer, setAnswer] = (0, import_react.useState)("");
	const [explanation, setExplanation] = (0, import_react.useState)("");
	const [notice, setNotice] = (0, import_react.useState)("");
	const [activeId, setActiveId] = (0, import_react.useState)("");
	const [search, setSearch] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		try {
			const saved = localStorage.getItem(BANK_KEY);
			if (saved) setProblems(JSON.parse(saved));
		} catch {}
	}, []);
	const persist = (next) => {
		setProblems(next);
		try {
			localStorage.setItem(BANK_KEY, JSON.stringify(next));
		} catch {
			setNotice("이미지가 많아 브라우저 저장 한도에 도달했습니다. 완성된 문제를 ZIP으로 백업해 주세요.");
		}
	};
	const termOptions = Object.keys(curriculum);
	const firstTerm = termOptions[0] ?? "중1 · 1학기";
	const firstMajor = Object.keys(curriculum[firstTerm] ?? {})[0] ?? "미분류";
	const firstMiddle = Object.keys(curriculum[firstTerm]?.[firstMajor] ?? {})[0] ?? "미분류";
	const firstMinor = curriculum[firstTerm]?.[firstMajor]?.[firstMiddle]?.[0] ?? "미분류";
	const readImage = (file) => {
		const reader = new FileReader();
		reader.onload = () => {
			setCapture(String(reader.result));
			setNotice("문제 이미지가 준비되었습니다. 정답과 해설을 확인한 뒤 저장하세요.");
		};
		reader.readAsDataURL(file);
	};
	const onPaste = (event) => {
		const file = Array.from(event.clipboardData.items).find((item) => item.type.startsWith("image/"))?.getAsFile();
		if (!file) {
			setNotice("클립보드에 이미지가 없습니다. Shift+Win+S로 캡처한 뒤 Ctrl+V를 눌러 주세요.");
			return;
		}
		event.preventDefault();
		readImage(file);
	};
	const onPdfFiles = (files) => {
		if (!files) return;
		const next = Array.from(files).map((file, index) => ({
			id: makeId(),
			name: file.name,
			size: file.size,
			checked: true,
			pages: 0,
			problemCount: 10,
			status: "자동 자르기 대기",
			url: URL.createObjectURL(file)
		}));
		setPdfs((items) => [...items, ...next]);
		if (next[0]) setActivePdf(next[0].id);
		setNotice(`${next.length}개 PDF를 작업 대기열에 등록했습니다.`);
	};
	const addCapture = () => {
		if (!capture) {
			setNotice("먼저 캡처 이미지를 붙여 넣어 주세요.");
			return;
		}
		const target = problems.find((item) => item.id === activeId && !item.image);
		if (target) {
			updateProblem(target.id, {
				image: capture,
				answer: answer || target.answer,
				explanation: explanation || target.explanation,
				status: answer || target.answer ? "보관 완료" : "검수 필요"
			});
			setNotice(`${target.title}에 원문 캡처를 연결했습니다.`);
			setActiveId("");
		} else {
			const item = {
				id: makeId(),
				checked: true,
				number: number || String(problems.length + 1),
				title: `${number || problems.length + 1}번 문제`,
				source: "화면 캡처",
				sourceType: "capture",
				image: capture,
				answer,
				explanation,
				status: answer ? "보관 완료" : "검수 필요",
				term: firstTerm,
				major: firstMajor,
				middle: firstMiddle,
				minor: firstMinor,
				pieces: [],
				createdAt: Date.now()
			};
			persist([item, ...problems]);
			setNotice(`${item.title}를 1차 문제보관함에 저장했습니다.`);
		}
		setCapture("");
		setAnswer("");
		setExplanation("");
		setNumber(String(Number(number || 0) + 1));
	};
	const createPdfSlots = (pdf) => {
		const slots = Array.from({ length: Math.max(1, pdf.problemCount) }, (_, i) => ({
			id: makeId(),
			checked: true,
			number: String(i + 1),
			title: `${i + 1}번 문제`,
			source: pdf.name,
			sourceType: "pdf",
			answer: "",
			explanation: "",
			status: "검수 필요",
			term: firstTerm,
			major: firstMajor,
			middle: firstMiddle,
			minor: firstMinor,
			pieces: [],
			createdAt: Date.now()
		}));
		persist([...slots, ...problems]);
		setPdfs((items) => items.map((x) => x.id === pdf.id ? {
			...x,
			status: `${slots.length}문항 검수칸 생성`
		} : x));
		setMode("bank");
		setNotice("PDF 원문을 보면서 자동 생성된 문항 칸에 캡처·정답·해설을 붙여 넣으세요.");
	};
	const updateProblem = (id, patch) => persist(problems.map((item) => item.id === id ? {
		...item,
		...patch
	} : item));
	const activeProblem = problems.find((item) => item.id === activeId) ?? problems[0];
	const openPieces = (item) => {
		const pieces = item.pieces.length ? item.pieces : Array.from({ length: 6 }, (_, i) => emptyPiece(i));
		updateProblem(item.id, {
			pieces,
			status: "조각 작업 중"
		});
		setActiveId(item.id);
		setMode("pieces");
	};
	const filtered = problems.filter((item) => `${item.title} ${item.source} ${item.answer} ${item.term} ${item.minor}`.toLowerCase().includes(search.toLowerCase()));
	const selectedCount = problems.filter((item) => item.checked).length;
	const renderSelectors = (item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "proSelectors",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["학년·학기", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
				value: item.term,
				onChange: (e) => {
					const term = e.target.value, major = Object.keys(curriculum[term])[0], middle = Object.keys(curriculum[term][major])[0];
					updateProblem(item.id, {
						term,
						major,
						middle,
						minor: curriculum[term][major][middle][0]
					});
				},
				children: termOptions.map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: x }, x))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["대단원", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
				value: item.major,
				onChange: (e) => {
					const major = e.target.value, middle = Object.keys(curriculum[item.term][major])[0];
					updateProblem(item.id, {
						major,
						middle,
						minor: curriculum[item.term][major][middle][0]
					});
				},
				children: Object.keys(curriculum[item.term] ?? {}).map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: x }, x))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["중단원", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
				value: item.middle,
				onChange: (e) => updateProblem(item.id, {
					middle: e.target.value,
					minor: curriculum[item.term][item.major][e.target.value][0]
				}),
				children: Object.keys(curriculum[item.term]?.[item.major] ?? {}).map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: x }, x))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["소단원", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
				value: item.minor,
				onChange: (e) => updateProblem(item.id, { minor: e.target.value }),
				children: (curriculum[item.term]?.[item.major]?.[item.middle] ?? []).map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: x }, x))
			})] })
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "problemStudioPro",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "proHero",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "교사 문제 제작 센터" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "원문은 그대로, 조각 작업은 더 크게" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "캡처와 PDF를 등록하고 정답·해설을 연결한 뒤 문제보관함에서 조각을 제작하세요." })
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "proStats",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [problems.length, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "보관 문제" })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [selectedCount, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "선택 문제" })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [problems.filter((x) => x.status === "탑재 준비").length, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "탑재 준비" })] })
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
				className: "proTabs",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: mode === "register" ? "active" : "",
						onClick: () => setMode("register"),
						children: "1. 문제 등록"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: mode === "bank" ? "active" : "",
						onClick: () => setMode("bank"),
						children: "2. 1차 문제보관함"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: mode === "pieces" ? "active" : "",
						onClick: () => setMode("pieces"),
						disabled: !activeProblem,
						children: "3. 큰 조각 작업실"
					})
				]
			}),
			notice && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "proNotice",
				children: [notice, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => setNotice(""),
					children: "×"
				})]
			}),
			mode === "register" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "registerLayout",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "capturePanel",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "panelTitle",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "캡처 문제 바로 등록" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Shift+Win+S → Ctrl+V" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							ref: pasteZone,
							tabIndex: 0,
							className: `pasteZone ${capture ? "hasImage" : ""}`,
							onPaste,
							onClick: () => pasteZone.current?.focus(),
							children: [capture ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: capture,
								alt: "붙여 넣은 문제 캡처"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "여기를 클릭하고 Ctrl+V" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "문제·수식·도형·그래프를 한 장으로 붙여 넣습니다." }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: (e) => {
										e.stopPropagation();
										imageInput.current?.click();
									},
									children: "이미지 파일 선택"
								})
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								ref: imageInput,
								hidden: true,
								type: "file",
								accept: "image/*",
								onChange: (e) => e.target.files?.[0] && readImage(e.target.files[0])
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "captureFields",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["문제 번호", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: number,
									onChange: (e) => setNumber(e.target.value),
									placeholder: "예: 12"
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["정답", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: answer,
									onChange: (e) => setAnswer(e.target.value),
									placeholder: "예: ③, x=4"
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "wide",
									children: ["정답·해설", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
										value: explanation,
										onChange: (e) => setExplanation(e.target.value),
										placeholder: "해설을 직접 입력하거나 해설 캡처 내용을 기록하세요."
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "captureActions",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "secondary",
								onClick: () => {
									setCapture("");
									setNotice("캡처를 비웠습니다.");
								},
								children: "다시 캡처"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: addCapture,
								children: "문제보관함에 저장 →"
							})]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "pdfPanel",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "panelTitle",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "PDF 대량 작업 대기열" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "여러 파일 동시 선택" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							ref: pdfInput,
							hidden: true,
							type: "file",
							accept: "application/pdf",
							multiple: true,
							onChange: (e) => onPdfFiles(e.target.files)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							className: "pdfDrop",
							onClick: () => pdfInput.current?.click(),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "＋ PDF 문제지·해설지 여러 개 선택" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "문제지와 정답·해설지를 같은 묶음으로 올릴 수 있습니다." })]
						}),
						pdfs.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "pdfQueue",
							children: pdfs.map((pdf) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
								className: activePdf === pdf.id ? "active" : "",
								onClick: () => setActivePdf(pdf.id),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "checkbox",
										checked: pdf.checked,
										onChange: (e) => setPdfs((items) => items.map((x) => x.id === pdf.id ? {
											...x,
											checked: e.target.checked
										} : x))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: pdf.name }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
										(pdf.size / 1024 / 1024).toFixed(1),
										"MB · ",
										pdf.status
									] })] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["예상 문항", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "number",
										min: "1",
										max: "100",
										value: pdf.problemCount,
										onChange: (e) => setPdfs((items) => items.map((x) => x.id === pdf.id ? {
											...x,
											problemCount: Number(e.target.value) || 1
										} : x))
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: (e) => {
											e.stopPropagation();
											createPdfSlots(pdf);
										},
										children: "문항칸 만들기"
									})
								]
							}, pdf.id))
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "emptyQueue",
							children: "등록한 PDF가 없습니다."
						}),
						activePdf && pdfs.find((x) => x.id === activePdf) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "pdfPreview",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
								title: "선택한 PDF 미리보기",
								src: pdfs.find((x) => x.id === activePdf).url
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "PDF를 보면서 자동 생성한 문항칸에 캡처·정답·해설을 연결하세요." })]
						})
					]
				})]
			}),
			mode === "bank" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "bankPanel",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "bankToolbar",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "1차 문제보관함" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "조각을 만들기 전 원문·정답·해설을 검수합니다." })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: search,
							onChange: (e) => setSearch(e.target.value),
							placeholder: "문제·파일·단원 검색"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => persist(problems.map((x) => ({
								...x,
								checked: true
							}))),
							children: "전체 선택"
						})
					]
				}), filtered.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "bankGrid",
					children: filtered.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "bankCard",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "bankCardTop",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: item.checked,
									onChange: (e) => updateProblem(item.id, { checked: e.target.checked })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: item.title })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: item.status.replaceAll(" ", ""),
									children: item.status
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "bankSource",
								children: item.image ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: item.image,
									alt: `${item.title} 원문`
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "pdfPlaceholder",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "PDF 원문 연결 대기" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: item.source }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => {
												setActiveId(item.id);
												setMode("register");
											},
											children: "캡처 붙이기"
										})
									]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "bankAnswers",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["정답", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: item.answer,
									onChange: (e) => updateProblem(item.id, {
										answer: e.target.value,
										status: e.target.value ? "보관 완료" : "검수 필요"
									})
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["해설", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
									value: item.explanation,
									onChange: (e) => updateProblem(item.id, { explanation: e.target.value }),
									placeholder: "풀이 과정·교사 메모"
								})] })]
							}),
							renderSelectors(item),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "bankActions",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "danger",
									onClick: () => {
										if (confirm("이 문제를 보관함에서 삭제할까요?")) persist(problems.filter((x) => x.id !== item.id));
									},
									children: "삭제"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => openPieces(item),
									children: "큰 화면에서 조각 만들기 →"
								})]
							})
						]
					}, item.id))
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "bankEmpty",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "아직 보관된 문제가 없습니다." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "캡처 이미지를 붙여 넣거나 PDF 문항칸을 먼저 만들어 주세요." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setMode("register"),
							children: "문제 등록으로 이동"
						})
					]
				})]
			}),
			mode === "pieces" && activeProblem && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "pieceWorkbench",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "workbenchTop",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setMode("bank"),
								children: "← 보관함"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: activeProblem.source }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", { children: [activeProblem.title, " 조각 제작"] })
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "secondary",
							onClick: () => updateProblem(activeProblem.id, { status: "조각 작업 중" }),
							children: "임시저장"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => updateProblem(activeProblem.id, { status: "탑재 준비" }),
							children: "조각 완료·탑재 준비"
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "referenceGrid",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "원문 문제" }), activeProblem.image ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: activeProblem.image,
							alt: "원문 문제"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "missingOriginal",
							children: "PDF에서 문제를 캡처하여 원문 이미지를 연결하세요."
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "정답·원문 해설" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "answerBadge",
								children: ["정답 ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: activeProblem.answer || "미입력" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								value: activeProblem.explanation,
								onChange: (e) => updateProblem(activeProblem.id, { explanation: e.target.value }),
								placeholder: "정답 해설과 풀이 과정을 기록하세요."
							})
						] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "piecesEditor",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "piecesHead",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "학습 조각 편집" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "원문과 해설을 보면서 질문·정답·오답·힌트를 만듭니다." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => updateProblem(activeProblem.id, { pieces: [...activeProblem.pieces, emptyPiece(activeProblem.pieces.length)] }),
								children: "＋ 조각 추가"
							})]
						}), activeProblem.pieces.map((piece, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "pieceNumber",
								children: index + 1
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "pieceFields",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["조각 이름", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										value: piece.tag,
										onChange: (e) => updateProblem(activeProblem.id, { pieces: activeProblem.pieces.map((x) => x.id === piece.id ? {
											...x,
											tag: e.target.value
										} : x) })
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "wide",
										children: ["질문", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											value: piece.question,
											onChange: (e) => updateProblem(activeProblem.id, { pieces: activeProblem.pieces.map((x) => x.id === piece.id ? {
												...x,
												question: e.target.value
											} : x) })
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["정답", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										value: piece.answer,
										onChange: (e) => updateProblem(activeProblem.id, { pieces: activeProblem.pieces.map((x) => x.id === piece.id ? {
											...x,
											answer: e.target.value
										} : x) })
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["오답 1", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										value: piece.wrong1,
										onChange: (e) => updateProblem(activeProblem.id, { pieces: activeProblem.pieces.map((x) => x.id === piece.id ? {
											...x,
											wrong1: e.target.value
										} : x) })
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["오답 2", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										value: piece.wrong2,
										onChange: (e) => updateProblem(activeProblem.id, { pieces: activeProblem.pieces.map((x) => x.id === piece.id ? {
											...x,
											wrong2: e.target.value
										} : x) })
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "wide",
										children: ["교사 힌트", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											value: piece.hint,
											onChange: (e) => updateProblem(activeProblem.id, { pieces: activeProblem.pieces.map((x) => x.id === piece.id ? {
												...x,
												hint: e.target.value
											} : x) })
										})]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "pieceDelete",
								onClick: () => updateProblem(activeProblem.id, { pieces: activeProblem.pieces.filter((x) => x.id !== piece.id) }),
								children: "삭제"
							})
						] }, piece.id))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "workbenchTarget",
						children: [renderSelectors(activeProblem), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => {
								updateProblem(activeProblem.id, { status: "탑재 준비" });
								setNotice(`${activeProblem.title}가 ${activeProblem.term} · ${activeProblem.minor} 탑재 준비 상태로 저장되었습니다.`);
							},
							children: "선택한 단원에 탑재 준비"
						})]
					})
				]
			})
		]
	});
}
//#endregion
//#region app/page.tsx
var textbookVariableGlyph = {
	x: "𝑥",
	y: "𝑦",
	X: "𝑋",
	Y: "𝑌"
};
var plainMathVars = (value, keyPrefix = "math") => value.split(/([xyXY])/g).map((part, i) => textbookVariableGlyph[part] ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("var", {
	className: "mathVariable",
	"aria-label": part,
	children: textbookVariableGlyph[part]
}, `${keyPrefix}-${part}-${i}`) : part);
var fractionTokenPattern = /(-?(?:\d+\/\d+|(?:\d+[A-Za-z]+|[A-Za-z]+)\/(?:\d+[A-Za-z]*|[A-Za-z]+)))/g;
var nonMathSlashTokens = new Set([
	"km/h",
	"application/pdf",
	"s/g"
]);
var mathVars = (value) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
	className: "mathExpression",
	children: value.split(fractionTokenPattern).map((part, i) => {
		const slash = part.indexOf("/");
		if (slash > 0 && !nonMathSlashTokens.has(part)) {
			const numerator = part.slice(0, slash), denominator = part.slice(slash + 1);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "textbookFraction",
				"aria-label": `${denominator}분의 ${numerator}`,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: plainMathVars(numerator, `numerator-${i}`) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: plainMathVars(denominator, `denominator-${i}`) })]
			}, `fraction-${i}`);
		}
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "mathTextPart",
			children: plainMathVars(part, `text-${i}`)
		}, `text-${i}`);
	})
});
var formattedMathText = (value) => {
	const stemLeaf = value.match(/^(.*?)\s*\(줄기\|잎,\s*([^)]*)\)\s*(.*)$/);
	if (stemLeaf) {
		const rows = stemLeaf[2].split(",").map((row) => row.trim()).filter(Boolean);
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "examStemLine",
				children: mathVars(stemLeaf[1])
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "stemLeafTable",
				"aria-label": "줄기와 잎 그림",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { children: "줄기" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { children: "잎" })] }), rows.map((row, i) => {
					const [stem, leaves] = row.split("|");
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("em", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { children: stem?.trim() }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { children: leaves?.trim() })] }, `${row}-${i}`);
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "examStemLine",
				children: mathVars(stemLeaf[3])
			})
		] });
	}
	return value.split(/\s+(?=[ㄱ-ㅎ]\.)/g).map((part, i) => {
		const choice = part.match(/^([ㄱ-ㅎ]\.)\s*(.*)$/);
		return choice ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "examChoiceLine",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", {
				className: "examChoiceMarker",
				children: choice[1]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "examChoiceText",
				children: mathVars(choice[2])
			})]
		}, `${part}-${i}`) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "examStemLine",
			children: mathVars(part)
		}, `${part}-${i}`);
	});
};
var normalizeAnswer = (value) => value.replace(/cm|원|권/g, "").replace(/\s/g, "").trim();
var bilingualQuestion = (question, lang) => {
	const translated = lang === "한국어" ? "" : completeTranslation(question.한국어, lang), valid = lang !== "한국어" && Boolean(translated);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "bilingualQuestion",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "koreanQuestion",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "한국어 원문" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: formattedMathText(question.한국어) })]
		}), valid && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "translatedQuestion",
			lang: lang === "English" ? "en" : lang === "Tiếng Việt" ? "vi" : lang === "Русский" ? "ru" : lang === "中文" ? "zh" : "si",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [lang, " 번역"] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: formattedMathText(translated) })]
		})]
	});
};
function SplitAnswerFields({ value, onChange, expected, placeholder }) {
	const count = Math.max(1, expected.split(",").length), parts = value.split(",");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: `splitAnswers ${count > 1 ? "multiple" : ""}`,
		children: Array.from({ length: count }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			value: parts[i] ?? "",
			onChange: (e) => {
				const next = Array.from({ length: count }, (_, n) => parts[n] ?? "");
				next[i] = e.target.value;
				onChange(next.join(","));
			},
			placeholder: count > 1 ? `${i + 1}번째 답` : placeholder
		}, i))
	});
}
function FactorTreeVisual({ number }) {
	if (number === 10) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "factorTree factorTreeTen",
		"aria-label": "10을 2와 5로 나눈 인수 나무",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "factor root",
				children: "10"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "branch branch1" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "branch branch2" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "factor prime tenLeft",
				children: "2"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "factor prime tenRight",
				children: "5"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "10을 두 소수 2와 5로 쪼개면 10=2×5가 돼요." })
		]
	});
	if (number === 84) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "factorTree",
		"aria-label": "84를 소인수로 나눈 인수 나무",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "factor root",
				children: "84"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "branch branch1" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "branch branch2" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "factor mid left",
				children: "12"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "factor prime p7",
				children: "7"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "factor prime p3",
				children: "3"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "factor mid p4",
				children: "4"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "factor prime p2a",
				children: "2"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "factor prime p2b",
				children: "2"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "84를 12×7, 다시 12를 3×4로 쪼개 소수만 남겨요." })
		]
	});
	return null;
}
function ProblemDiagram({ problem }) {
	const question = problem.question.한국어;
	if (question.includes("8개의 삼각형으로 나누어졌다")) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", {
		className: "mathDiagram polygonDiagram",
		"aria-label": "한 꼭짓점에서 대각선을 그어 삼각형 8개로 나눈 십각형",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "decagonShape" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fanLines",
				children: [
					0,
					1,
					2,
					3,
					4,
					5,
					6,
					7,
					8
				].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { style: { transform: `rotate(${i * 17 - 68}deg)` } }, i))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "vertexStart",
				children: "한 꼭짓점"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("figcaption", { children: "한 꼭짓점에서 대각선을 모두 그으면 삼각형이 8개 생겨요." })
		]
	});
	if (question.includes("구 3개가 원기둥 모양의 통")) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", {
		className: "mathDiagram sphereCanDiagram",
		"aria-label": "반지름 3센티미터인 구 세 개가 원기둥 통에 꼭 맞게 쌓인 그림",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "canTop" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "canBody",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "heightMark",
						children: "높이 18 cm"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "radiusMark",
						children: "반지름 3 cm"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "canBottom" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("figcaption", { children: "구의 지름 6 cm가 세 번 쌓이므로 통의 높이는 18 cm예요." })
		]
	});
	if (question.includes("한 외각의 크기가 45°")) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", {
		className: "mathDiagram octagonDiagram",
		"aria-label": "한 외각이 45도인 정팔각형",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "octagonShape",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
				"외각",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "45°" })
			] })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("figcaption", { children: "같은 외각 45°가 한 바퀴 360°를 채웁니다." })]
	});
	if (question.includes("부채꼴 AOB의 넓이가 부채꼴 BOC의 넓이의 3배")) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", {
		className: "mathDiagram semicircleDiagram",
		"aria-label": "지름 AC인 반원 안에서 반지름 OB가 두 부채꼴을 나눈 그림",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "semiArc",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "rayB" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "pointA",
					children: "A"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "pointB",
					children: "B"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "pointC",
					children: "C"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "pointO",
					children: "O"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "3배" })
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("figcaption", { children: "AC는 지름이므로 두 중심각의 합은 180°입니다." })]
	});
	if (question.includes("윗면의 반지름이 2 cm") && question.includes("원뿔대")) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", {
		className: "mathDiagram frustumDiagram",
		"aria-label": "윗면 반지름 2센티미터, 밑면 반지름 5센티미터, 높이 6센티미터인 원뿔대",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "frustumShape",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "topMeasure",
					children: "4 cm"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "bottomMeasure",
					children: "10 cm"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "sideMeasure",
					children: "6 cm"
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("figcaption", { children: "회전축을 포함해 자른 단면은 윗변 4 cm, 아랫변 10 cm인 사다리꼴입니다." })]
	});
	if (question.includes("식품 A 100 g에는 단백질 8 g")) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", {
		className: "mathDiagram nutritionDiagram",
		"aria-label": "식품 A와 B의 단백질과 지방 함량 표",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "100 g당" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "단백질" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "지방" })
		] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "식품 A" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: "8 g" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: "4 g" })
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "식품 B" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: "2 g" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: "6 g" })
		] })] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("figcaption", { children: "표의 세로줄을 따라 단백질 식과 지방 식을 하나씩 세워요." })]
	});
	if (question.includes("[4단계]에서 생기는 정사각형")) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", {
		className: "mathDiagram foldingSquareDiagram",
		"aria-label": "정사각형 각 변의 중점을 이어 네 단계로 만든 겹친 정사각형",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "foldSquare s0",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "foldSquare s1",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "foldSquare s2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "foldSquare s3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "foldSquare s4" })
						})
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "20 cm" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("figcaption", { children: "한 단계 들어갈 때마다 안쪽 정사각형의 넓이는 절반이 됩니다." })
		]
	});
	if (question.includes("직선 y=(1/4)x-2의 x절편")) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", {
		className: "mathDiagram interceptDiagram",
		"aria-label": "x절편 8과 y절편 6을 지나는 직선의 좌표평면",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "graphAxis graphX" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "graphAxis graphY" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "interceptLine" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "graphPoint pointX" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "graphPoint pointY" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "axisXLabel",
				children: "x"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "axisYLabel",
				children: "y"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "pointXLabel",
				children: "(8, 0)"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "pointYLabel",
				children: "(0, 6)"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("figcaption", { children: "두 절편을 좌표로 바꾸면 직선이 지나는 두 점 (8, 0), (0, 6)을 얻습니다." })
		]
	});
	if (question.includes("포물선 모양의 구조물") && question.includes("P(0,5)")) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", {
		className: "mathDiagram parabolaDiagram",
		"aria-label": "꼭짓점 P와 점 R을 지나는 포물선 모양 구조물",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "groundLine" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "parabolaCurve" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "structurePoint vertexP" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "structurePoint pointR" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "structurePoint pointT" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "labelP",
				children: "P(0, 5)"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "labelR",
				children: "R(4, 7)"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "labelT",
				children: "x=8"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "heightGuide" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("figcaption", { children: "꼭짓점 P와 점 R로 포물선의 식을 정한 뒤, x=8에서의 높이를 구합니다." })
		]
	});
	if (question.includes("가로의 길이가 3a²b³") && question.includes("삼각형의 높이")) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", {
		className: "mathDiagram equalAreaDiagram",
		"aria-label": "넓이가 같은 직사각형과 삼각형",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "areaRectangle",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "rectWidth",
					children: "3a²b³"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "rectHeight",
					children: "8ab³"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "areaTriangle",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "triBase",
					children: "6a³b²"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "triHeight",
					children: "높이 h"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "equalMark",
				children: "넓이가 같다"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("figcaption", { children: "직사각형의 넓이와 삼각형의 넓이를 각각 식으로 나타내어 같다고 놓습니다." })
		]
	});
	if (question.includes("자율주행 자동차") && question.includes("80 km")) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", {
		className: "mathDiagram roadDiagram",
		"aria-label": "시속 50킬로미터와 60킬로미터로 나누어 달린 80킬로미터 도로",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "roadTrack",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "roadStart" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "roadChange" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "roadFinish" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "carIcon",
						children: "🚙"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "speedFirst",
						children: "50 km/h · x km"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "speedSecond",
						children: "60 km/h · y km"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "roadTotal",
				children: "전체 80 km · 총 1시간 30분"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("figcaption", { children: "두 구간의 거리를 x, y로 놓으면 거리의 합과 시간의 합으로 두 식을 만들 수 있습니다." })
		]
	});
	if (question.includes("y=-4x+2") && question.includes("x절편이 -2")) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", {
		className: "mathDiagram shiftedLineDiagram",
		"aria-label": "일차함수 그래프를 세로 방향으로 평행이동한 좌표평면",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "shiftAxis shiftAxisX" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "shiftAxis shiftAxisY" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "lineBefore" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "lineAfter" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "xInterceptPoint" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "beforeLabel",
				children: "y=-4x+2"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "afterLabel",
				children: "y=-4x+2+m"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "interceptLabel",
				children: "(-2, 0)"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "verticalArrow",
				children: "↕ m"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("figcaption", { children: "세로 방향 평행이동에서는 기울기 -4는 그대로이고 상수항만 m만큼 변합니다." })
		]
	});
	if (question.includes("∠B=50°") && question.includes("AB=2x+3")) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", {
		className: "mathDiagram isoscelesAssessmentDiagram",
		"aria-label": "각 B가 50도, 각 C가 65도이고 두 변의 길이가 식으로 주어진 삼각형 ABC",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "assessmentTriangle",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "triPoint triA",
					children: "A"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "triPoint triB",
					children: "B"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "triPoint triC",
					children: "C"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "triAngle angleB",
					children: "50°"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "triAngle angleC",
					children: "65°"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "triSide sideAB",
					children: "2x+3"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "triSide sideBC",
					children: "x+8"
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("figcaption", { children: "먼저 ∠A를 구해 같은 두 각을 찾으면, 그 각의 맞은편 두 변의 길이가 같다는 것을 이용할 수 있습니다." })]
	});
	if (question.includes("∠ABC의 이등분선") && question.includes("DE의 길이")) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", {
		className: "mathDiagram parallelogramBisectorDiagram",
		"aria-label": "A는 왼쪽 아래, B는 오른쪽 아래, C는 오른쪽 위, D는 왼쪽 위이며 E는 D의 왼쪽 연장선 위에 있는 평행사변형",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "paraShape",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "paraEdge edgeAB" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "paraEdge edgeBC" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "paraEdge edgeCD" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "paraEdge edgeDA" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "paraExtension" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "paraBisector" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "paraPoint paraA",
					children: "A"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "paraPoint paraB",
					children: "B"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "paraPoint paraC",
					children: "C"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "paraPoint paraD",
					children: "D"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "paraPoint paraE",
					children: "E"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "paraLength paraAB",
					children: "8 cm"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "paraLength paraBC",
					children: "12 cm"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "equalAngleMark",
					children: "⌒⌒"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "extensionLabel",
					children: "CD의 연장선"
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("figcaption", { children: "E–D–C는 한 직선 위에 있고, 주황색 선 BE가 ∠ABC를 똑같이 나눕니다." })]
	});
	if (question.includes("외심 O") && question.includes("∠BAC=55°")) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", {
		className: "mathDiagram circumcenterAngleDiagram",
		"aria-label": "삼각형 ABC와 외접원의 중심 O 및 중심각 BOC",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "circumCircle",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "circumChord chordAB" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "circumChord chordAC" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "circumChord chordBC" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "circumRadius radiusOB" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "circumRadius radiusOC" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "circumPoint circumA",
					children: "A"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "circumPoint circumB",
					children: "B"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "circumPoint circumC",
					children: "C"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "circumPoint circumO",
					children: "O"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "givenAngle",
					children: "55°"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "targetAngle",
					children: "x°"
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("figcaption", { children: "∠BAC과 ∠BOC는 같은 호 BC를 바라봅니다. 중심각은 같은 호를 보는 원주각의 2배입니다." })]
	});
	if (question.includes("내심을 I") && question.includes("∠A=70°")) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", {
		className: "mathDiagram incenterAngleDiagram",
		"aria-label": "각 A가 70도이고 세 내각의 이등분선이 내심 I에서 만나는 삼각형 ABC",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "incenterTriangle",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "inEdge inAB" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "inEdge inAC" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "inEdge inBC" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "inBisector inAI" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "inBisector inBI" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "inBisector inCI" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "inPoint inA",
					children: "A"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "inPoint inB",
					children: "B"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "inPoint inC",
					children: "C"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "inPoint inI",
					children: "I"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "inGiven",
					children: "70°"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "inTarget",
					children: "x°"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "inEqualMark markB",
					children: "⌒⌒"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "inEqualMark markC",
					children: "⌒⌒"
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("figcaption", { children: "BI와 CI는 각각 ∠B와 ∠C를 절반으로 나눕니다. △BIC의 세 각의 합을 이용해 x를 구합니다." })]
	});
	if (question.includes("무게중심을 G") && question.includes("AG=10 cm")) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", {
		className: "mathDiagram centroidDiagram",
		"aria-label": "변 BC의 중점 D와 두 중선의 교점인 무게중심 G가 표시된 삼각형 ABC",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "centroidTriangle",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "centEdge centAB" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "centEdge centAC" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "centEdge centBC" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "median medianAD" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "median medianBE" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "centPoint centA",
					children: "A"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "centPoint centB",
					children: "B"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "centPoint centC",
					children: "C"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "centPoint centD",
					children: "D"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "centPoint centE",
					children: "E"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "centPoint centG",
					children: "G"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "halfMark halfLeft",
					children: "|"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "halfMark halfRight",
					children: "|"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "agLength",
					children: "AG=10 cm"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "ratioLabel",
					children: "2 : 1"
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("figcaption", { children: "D는 BC의 중점이고, G는 중선 AD 위에서 AG:GD=2:1이 되도록 놓입니다." })]
	});
	return null;
}
var langs = [
	"한국어",
	"English",
	"Tiếng Việt",
	"Русский",
	"中文",
	"සිංහල"
];
function translatedMathText(value, lang) {
	if (lang === "한국어") return value;
	const required = {
		English: {
			"연립방정식 x+y=7, x-y=3을 푸시오.": "Solve the simultaneous equations x + y = 7 and x - y = 3.",
			"분수 4/7을 소수로 나타낼 때 순환마디를 구하시오.": "Write 4/7 as a decimal and find its repeating block.",
			"분수 5/11을 순환소수로 나타내시오. 단, 순환마디는 괄호 안에 쓰시오.": "Write 5/11 as a repeating decimal. Put the repeating block in parentheses.",
			"순환소수 0.8111…을 분수로 나타내시오.": "Express the repeating decimal 0.8111… as a fraction.",
			"(-2a²b)³÷4ab²을 계산하여 간단히 하시오.": "Calculate and simplify (-2a²b)³ ÷ 4ab².",
			"(-x²+2x+5)+3(x²-3x+1)을 계산했을 때, x²의 계수와 상수항의 합을 구하시오.": "Simplify (-x²+2x+5)+3(x²-3x+1), then find the sum of the coefficient of x² and the constant term.",
			"가로의 길이가 3a²b³이고 세로의 길이가 8ab³인 직사각형과 밑변의 길이가 6a³b²인 삼각형의 넓이가 서로 같을 때, 삼각형의 높이를 구하시오.": "A rectangle has width 3a²b³ and height 8ab³. A triangle with base 6a³b² has the same area. Find the height of the triangle.",
			"2³=A일 때, 64³을 A를 사용하여 나타내시오.": "Given 2³ = A, express 64³ in terms of A.",
			"일차부등식 2(3x+1)≤2x+a를 만족시키는 자연수 x의 값이 3개 이상일 때, a의 값의 범위를 구하시오.": "For the linear inequality 2(3x+1) ≤ 2x+a, there are at least three natural-number solutions for x. Find the range of a.",
			"일차부등식 1/5x+1.3>0.8x-3을 만족시키는 x의 값 중 가장 큰 자연수를 구하시오.": "Find the greatest natural number x that satisfies 1/5x + 1.3 > 0.8x - 3.",
			"출발지에서 80 km 떨어진 지점까지 처음에는 시속 50 km, 이후에는 시속 60 km로 달렸더니 총 1시간 30분이 걸렸다. 시속 60 km로 달린 거리를 구하시오.": "A car traveled 80 km, first at 50 km/h and then at 60 km/h, taking 1 hour 30 minutes in total. Find the distance traveled at 60 km/h.",
			"일차함수 y=-4x+2의 그래프를 y축의 방향으로 m만큼 평행이동한 그래프의 x절편이 -2일 때, m의 값을 구하시오.": "The graph of y=-4x+2 is translated by m in the y-direction. If the x-intercept of the translated graph is -2, find m."
		},
		"Tiếng Việt": {
			"연립방정식 x+y=7, x-y=3을 푸시오.": "Giải hệ phương trình x + y = 7 và x - y = 3.",
			"분수 4/7을 소수로 나타낼 때 순환마디를 구하시오.": "Viết 4/7 dưới dạng số thập phân và tìm chu kỳ lặp.",
			"분수 5/11을 순환소수로 나타내시오. 단, 순환마디는 괄호 안에 쓰시오.": "Viết 5/11 dưới dạng số thập phân tuần hoàn. Đặt chu kỳ lặp trong ngoặc.",
			"순환소수 0.8111…을 분수로 나타내시오.": "Biểu diễn số thập phân tuần hoàn 0.8111… dưới dạng phân số.",
			"(-2a²b)³÷4ab²을 계산하여 간단히 하시오.": "Tính và rút gọn (-2a²b)³ ÷ 4ab².",
			"(-x²+2x+5)+3(x²-3x+1)을 계산했을 때, x²의 계수와 상수항의 합을 구하시오.": "Rút gọn (-x²+2x+5)+3(x²-3x+1), rồi tìm tổng của hệ số x² và hạng tử không đổi.",
			"가로의 길이가 3a²b³이고 세로의 길이가 8ab³인 직사각형과 밑변의 길이가 6a³b²인 삼각형의 넓이가 서로 같을 때, 삼각형의 높이를 구하시오.": "Một hình chữ nhật có chiều dài 3a²b³ và chiều rộng 8ab³. Một tam giác có đáy 6a³b² và cùng diện tích. Hãy tìm chiều cao của tam giác.",
			"2³=A일 때, 64³을 A를 사용하여 나타내시오.": "Cho 2³ = A, hãy biểu diễn 64³ theo A.",
			"일차부등식 2(3x+1)≤2x+a를 만족시키는 자연수 x의 값이 3개 이상일 때, a의 값의 범위를 구하시오.": "Bất phương trình 2(3x+1) ≤ 2x+a có ít nhất ba nghiệm tự nhiên x. Hãy tìm phạm vi của a.",
			"일차부등식 1/5x+1.3>0.8x-3을 만족시키는 x의 값 중 가장 큰 자연수를 구하시오.": "Tìm số tự nhiên lớn nhất x thỏa mãn 1/5x + 1.3 > 0.8x - 3.",
			"출발지에서 80 km 떨어진 지점까지 처음에는 시속 50 km, 이후에는 시속 60 km로 달렸더니 총 1시간 30분이 걸렸다. 시속 60 km로 달린 거리를 구하시오.": "Một xe đi quãng đường 80 km, đầu tiên với vận tốc 50 km/h rồi 60 km/h, tổng thời gian 1 giờ 30 phút. Tìm quãng đường đi với vận tốc 60 km/h.",
			"일차함수 y=-4x+2의 그래프를 y축의 방향으로 m만큼 평행이동한 그래프의 x절편이 -2일 때, m의 값을 구하시오.": "Đồ thị y=-4x+2 được tịnh tiến m đơn vị theo hướng trục y. Nếu hoành độ giao điểm với trục x là -2, hãy tìm m."
		},
		Русский: {
			"연립방정식 x+y=7, x-y=3을 푸시오.": "Решите систему уравнений x + y = 7 и x - y = 3.",
			"분수 4/7을 소수로 나타낼 때 순환마디를 구하시오.": "Представьте 4/7 десятичной дробью и найдите её период.",
			"분수 5/11을 순환소수로 나타내시오. 단, 순환마디는 괄호 안에 쓰시오.": "Представьте 5/11 периодической десятичной дробью. Период запишите в скобках.",
			"순환소수 0.8111…을 분수로 나타내시오.": "Представьте периодическую десятичную дробь 0.8111… в виде обыкновенной дроби.",
			"(-2a²b)³÷4ab²을 계산하여 간단히 하시오.": "Вычислите и упростите (-2a²b)³ ÷ 4ab².",
			"(-x²+2x+5)+3(x²-3x+1)을 계산했을 때, x²의 계수와 상수항의 합을 구하시오.": "Упростите (-x²+2x+5)+3(x²-3x+1), затем найдите сумму коэффициента при x² и свободного члена.",
			"가로의 길이가 3a²b³이고 세로의 길이가 8ab³인 직사각형과 밑변의 길이가 6a³b²인 삼각형의 넓이가 서로 같을 때, 삼각형의 높이를 구하시오.": "Прямоугольник имеет стороны 3a²b³ и 8ab³. Треугольник с основанием 6a³b² имеет такую же площадь. Найдите высоту треугольника.",
			"2³=A일 때, 64³을 A를 사용하여 나타내시오.": "Если 2³ = A, выразите 64³ через A.",
			"일차부등식 2(3x+1)≤2x+a를 만족시키는 자연수 x의 값이 3개 이상일 때, a의 값의 범위를 구하시오.": "Линейное неравенство 2(3x+1) ≤ 2x+a имеет не менее трёх натуральных решений x. Найдите диапазон значений a.",
			"일차부등식 1/5x+1.3>0.8x-3을 만족시키는 x의 값 중 가장 큰 자연수를 구하시오.": "Найдите наибольшее натуральное число x, удовлетворяющее неравенству 1/5x + 1.3 > 0.8x - 3.",
			"출발지에서 80 km 떨어진 지점까지 처음에는 시속 50 km, 이후에는 시속 60 km로 달렸더니 총 1시간 30분이 걸렸다. 시속 60 km로 달린 거리를 구하시오.": "Автомобиль проехал 80 км: сначала со скоростью 50 км/ч, затем 60 км/ч. Общее время — 1 час 30 минут. Найдите расстояние, пройденное со скоростью 60 км/ч.",
			"일차함수 y=-4x+2의 그래프를 y축의 방향으로 m만큼 평행이동한 그래프의 x절편이 -2일 때, m의 값을 구하시오.": "График y=-4x+2 сдвинули на m вдоль оси y. Если абсцисса точки пересечения нового графика с осью x равна -2, найдите m."
		},
		中文: {
			"연립방정식 x+y=7, x-y=3을 푸시오.": "解方程组 x + y = 7，x - y = 3。",
			"분수 4/7을 소수로 나타낼 때 순환마디를 구하시오.": "把 4/7 化成小数，并求出循环节。",
			"분수 5/11을 순환소수로 나타내시오. 단, 순환마디는 괄호 안에 쓰시오.": "把 5/11 化成循环小数，并把循环节写在括号内。",
			"순환소수 0.8111…을 분수로 나타내시오.": "把循环小数 0.8111… 化成分数。",
			"(-2a²b)³÷4ab²을 계산하여 간단히 하시오.": "计算并化简 (-2a²b)³ ÷ 4ab²。",
			"(-x²+2x+5)+3(x²-3x+1)을 계산했을 때, x²의 계수와 상수항의 합을 구하시오.": "化简 (-x²+2x+5)+3(x²-3x+1)，再求 x² 的系数与常数项之和。",
			"가로의 길이가 3a²b³이고 세로의 길이가 8ab³인 직사각형과 밑변의 길이가 6a³b²인 삼각형의 넓이가 서로 같을 때, 삼각형의 높이를 구하시오.": "一个长方形的长为 3a²b³、宽为 8ab³。底为 6a³b² 的三角形与它面积相等，求三角形的高。",
			"2³=A일 때, 64³을 A를 사용하여 나타내시오.": "已知 2³=A，用 A 表示 64³。",
			"일차부등식 2(3x+1)≤2x+a를 만족시키는 자연수 x의 값이 3개 이상일 때, a의 값의 범위를 구하시오.": "一次不等式 2(3x+1)≤2x+a 至少有三个自然数解 x，求 a 的取值范围。",
			"일차부등식 1/5x+1.3>0.8x-3을 만족시키는 x의 값 중 가장 큰 자연수를 구하시오.": "求满足不等式 1/5x+1.3>0.8x-3 的最大自然数 x。",
			"출발지에서 80 km 떨어진 지점까지 처음에는 시속 50 km, 이후에는 시속 60 km로 달렸더니 총 1시간 30분이 걸렸다. 시속 60 km로 달린 거리를 구하시오.": "汽车行驶 80 km，先以 50 km/h 行驶，再以 60 km/h 行驶，共用 1 小时 30 分。求以 60 km/h 行驶的路程。",
			"일차함수 y=-4x+2의 그래프를 y축의 방향으로 m만큼 평행이동한 그래프의 x절편이 -2일 때, m의 값을 구하시오.": "把 y=-4x+2 的图象沿 y 轴方向平移 m 个单位后，新图象的 x 轴截距为 -2，求 m。"
		},
		සිංහල: {
			"연립방정식 x+y=7, x-y=3을 푸시오.": "x + y = 7 සහ x - y = 3 සමගාමී සමීකරණ විසඳන්න.",
			"분수 4/7을 소수로 나타낼 때 순환마디를 구하시오.": "4/7 දශමයක් ලෙස ලියා එහි පුනරාවර්තන කොටස සොයන්න.",
			"분수 5/11을 순환소수로 나타내시오. 단, 순환마디는 괄호 안에 쓰시오.": "5/11 පුනරාවර්තන දශමයක් ලෙස ලියන්න. පුනරාවර්තන කොටස වරහන් තුළ ලියන්න.",
			"순환소수 0.8111…을 분수로 나타내시오.": "0.8111… පුනරාවර්තන දශමය භාගයක් ලෙස දක්වන්න.",
			"(-2a²b)³÷4ab²을 계산하여 간단히 하시오.": "(-2a²b)³ ÷ 4ab² ගණනය කර සරල කරන්න.",
			"(-x²+2x+5)+3(x²-3x+1)을 계산했을 때, x²의 계수와 상수항의 합을 구하시오.": "(-x²+2x+5)+3(x²-3x+1) සරල කර x² හි සංගුණකය සහ නියත පදයේ එකතුව සොයන්න.",
			"가로의 길이가 3a²b³이고 세로의 길이가 8ab³인 직사각형과 밑변의 길이가 6a³b²인 삼각형의 넓이가 서로 같을 때, 삼각형의 높이를 구하시오.": "3a²b³ සහ 8ab³ පැති ඇති සෘජුකෝණාස්‍රයක වර්ගඵලයට සමාන, පාදය 6a³b² වන ත්‍රිකෝණයේ උස සොයන්න.",
			"2³=A일 때, 64³을 A를 사용하여 나타내시오.": "2³=A නම්, 64³ A භාවිතයෙන් දක්වන්න.",
			"일차부등식 2(3x+1)≤2x+a를 만족시키는 자연수 x의 값이 3개 이상일 때, a의 값의 범위를 구하시오.": "2(3x+1)≤2x+a අසමානතාවයට ස්වාභාවික සංඛ්‍යා විසඳුම් x අවම වශයෙන් තුනක් ඇති විට a හි පරාසය සොයන්න.",
			"일차부등식 1/5x+1.3>0.8x-3을 만족시키는 x의 값 중 가장 큰 자연수를 구하시오.": "1/5x+1.3>0.8x-3 සපුරාලන විශාලතම ස්වාභාවික සංඛ්‍යාව x සොයන්න.",
			"출발지에서 80 km 떨어진 지점까지 처음에는 시속 50 km, 이후에는 시속 60 km로 달렸더니 총 1시간 30분이 걸렸다. 시속 60 km로 달린 거리를 구하시오.": "මෝටර් රථයක් 80 km දුරක් මුලින් 50 km/h හා පසුව 60 km/h වේගයෙන් පැය 1 මිනිත්තු 30කින් ගමන් කළේය. 60 km/h වේගයෙන් ගිය දුර සොයන්න.",
			"일차함수 y=-4x+2의 그래프를 y축의 방향으로 m만큼 평행이동한 그래프의 x절편이 -2일 때, m의 값을 구하시오.": "y=-4x+2 ප්‍රස්තාරය y අක්ෂ දිශාවට m කින් සමාන්තරව ගෙන ගිය විට නව ප්‍රස්තාරයේ x-අන්තඛණ්ඩය -2 නම් m සොයන්න."
		}
	}[lang]?.[value];
	if (required) return required;
	const exact = {
		English: {
			"3x+5=20을 만족하는 x의 값을 구하시오.": "Find the value of x that satisfies 3x + 5 = 20.",
			"다음 수 중 소수인 것을 구하시오: 21, 29, 39": "Find the prime number among 21, 29, and 39.",
			"√196의 값을 구하시오.": "Find the value of √196.",
			"√81의 값을 구하시오.": "Find the value of √81.",
			"√121의 값을 구하시오.": "Find the value of √121.",
			"√225의 값을 구하시오.": "Find the value of √225."
		},
		"Tiếng Việt": {
			"3x+5=20을 만족하는 x의 값을 구하시오.": "Tìm giá trị của x thỏa mãn 3x + 5 = 20.",
			"다음 수 중 소수인 것을 구하시오: 21, 29, 39": "Trong các số 21, 29 và 39, hãy tìm số nguyên tố.",
			"√196의 값을 구하시오.": "Hãy tìm giá trị của √196.",
			"√81의 값을 구하시오.": "Hãy tìm giá trị của √81.",
			"√121의 값을 구하시오.": "Hãy tìm giá trị của √121.",
			"√225의 값을 구하시오.": "Hãy tìm giá trị của √225.",
			"한 개에 800원인 공책 x권의 가격을 식으로 나타내시오.": "Mỗi quyển vở giá 800 won. Hãy biểu diễn giá của x quyển vở bằng một biểu thức.",
			"공책 한 권의 가격은 얼마인가요?": "Một quyển vở giá bao nhiêu?",
			"800원": "800 won",
			"x원": "x won",
			"800x원": "800x won",
			"한 개 가격은 800원이야.": "Giá của một quyển là 800 won.",
			"공책은 몇 권이라고 했나요?": "Đề bài cho biết có bao nhiêu quyển vở?",
			"x권": "x quyển",
			"800권": "800 quyển",
			"1권": "1 quyển",
			"아직 모르는 권수를 문자 x로 나타냈어.": "Số quyển chưa biết được biểu thị bằng chữ x.",
			"한 권 가격×권수로 만든 식은?": "Biểu thức nào bằng giá một quyển nhân với số quyển?",
			"800x": "800x",
			"800+x": "800+x",
			"800÷x": "800÷x",
			"800×x는 곱셈 기호를 생략해 800x라고 써.": "Ta bỏ dấu nhân trong 800×x và viết là 800x.",
			"3x+5=20에서 3x만 남기려면 양변에서 무엇을 할까요?": "Trong 3x+5=20, phải làm gì ở cả hai vế để chỉ còn 3x?",
			"5를 뺀다": "Trừ 5",
			"5를 더한다": "Cộng 5",
			"3을 뺀다": "Trừ 3",
			"+5를 없애는 반대 계산은 -5야.": "Phép toán ngược của cộng 5 là trừ 5 ở cả hai vế.",
			"양변에서 5를 빼면 3x는 얼마인가요?": "Sau khi trừ 5 ở cả hai vế, 3x bằng bao nhiêu?",
			"15": "15",
			"25": "25",
			"5": "5",
			"20-5=15이므로 3x=15야.": "Vì 20-5=15 nên 3x=15.",
			"3x=15에서 x만 남기기 위해 등식의 양변에 할 계산은?": "Trong 3x=15, phải làm gì ở cả hai vế để chỉ còn x?",
			"양변을 3으로 나눈다": "Chia cả hai vế cho 3",
			"양변에서 3을 뺀다": "Trừ 3 ở cả hai vế",
			"양변에 3을 곱한다": "Nhân cả hai vế với 3",
			"x에 곱해진 3을 없애려면 등식의 양변을 같은 수 3으로 나눠야 해.": "Để bỏ hệ số 3 nhân với x, hãy chia cả hai vế cho cùng một số 3.",
			"3x÷3=15÷3을 계산하면 x의 값은?": "Tính 3x÷3=15÷3. Giá trị của x là bao nhiêu?",
			"12": "12",
			"45": "45",
			"왼쪽은 x만 남고 오른쪽은 5가 되어 x=5야.": "Vế trái còn x và vế phải bằng 5, nên x=5.",
			"x=5를 3x+5에 넣으면?": "Thay x=5 vào 3x+5 thì được bao nhiêu?",
			"20": "20",
			"10": "10",
			"3×5+5=20이므로 원래 조건과 딱 맞아.": "Vì 3×5+5=20 nên kết quả thỏa mãn phương trình ban đầu."
		},
		Русский: {
			"3x+5=20을 만족하는 x의 값을 구하시오.": "Найдите значение x, удовлетворяющее уравнению 3x + 5 = 20.",
			"다음 수 중 소수인 것을 구하시오: 21, 29, 39": "Найдите простое число среди 21, 29 и 39.",
			"√196의 값을 구하시오.": "Найдите значение √196.",
			"√81의 값을 구하시오.": "Найдите значение √81.",
			"√121의 값을 구하시오.": "Найдите значение √121.",
			"√225의 값을 구하시오.": "Найдите значение √225."
		},
		中文: {
			"3x+5=20을 만족하는 x의 값을 구하시오.": "求满足 3x + 5 = 20 的 x 值。",
			"다음 수 중 소수인 것을 구하시오: 21, 29, 39": "从 21、29、39 中找出质数。",
			"√196의 값을 구하시오.": "求 √196 的值。",
			"√81의 값을 구하시오.": "求 √81 的值。",
			"√121의 값을 구하시오.": "求 √121 的值。",
			"√225의 값을 구하시오.": "求 √225 的值。"
		},
		සිංහල: {
			"3x+5=20을 만족하는 x의 값을 구하시오.": "3x + 5 = 20 සපුරාලන x හි අගය සොයන්න.",
			"다음 수 중 소수인 것을 구하시오: 21, 29, 39": "21, 29 සහ 39 අතරින් ප්‍රථමක සංඛ්‍යාව සොයන්න.",
			"√196의 값을 구하시오.": "√196 හි අගය සොයන්න.",
			"√81의 값을 구하시오.": "√81 හි අගය සොයන්න.",
			"√121의 값을 구하시오.": "√121 හි අගය සොයන්න.",
			"√225의 값을 구하시오.": "√225 හි අගය සොයන්න."
		}
	};
	if (exact[lang]?.[value]) return exact[lang][value];
	const generic = value.match(/^.+의 기본 개념을 이용하여 (.+)를 계산하시오\.$/);
	if (generic) {
		const expression = generic[1];
		return {
			English: `Using the basic concepts of this unit, calculate ${expression}.`,
			"Tiếng Việt": `Hãy sử dụng kiến thức cơ bản của bài này để tính ${expression}.`,
			Русский: `Используя основные понятия этого раздела, вычислите ${expression}.`,
			中文: `运用本节的基本概念计算 ${expression}。`,
			සිංහල: `මෙම පාඩමේ මූලික සංකල්ප භාවිතයෙන් ${expression} ගණනය කරන්න.`
		}[lang];
	}
	return {
		English: [
			["좋아, 이 조각을 이해했어요!", "Great, you understood this step!"],
			["천천히 골라도 괜찮아요.", "Take your time and choose."],
			["다음 조각", "Next step"],
			["다시 풀기", "Solve again"],
			["값을 구하시오", "Find the value"],
			["계산하시오", "Calculate"],
			["나타내시오", "Express"],
			["판단하시오", "Determine"],
			["만족하는", "that satisfies"],
			["의 값은", " has the value"],
			["무엇일까요?", "What is it?"],
			["따라서", "Therefore"],
			["정답", "answer"]
		],
		"Tiếng Việt": [
			["좋아, 이 조각을 이해했어요!", "Tốt lắm, em đã hiểu bước này!"],
			["천천히 골라도 괜찮아요.", "Hãy bình tĩnh chọn đáp án."],
			["다음 조각", "Bước tiếp theo"],
			["다시 풀기", "Giải lại"],
			["값을 구하시오", "hãy tìm giá trị"],
			["계산하시오", "hãy tính"],
			["나타내시오", "hãy biểu diễn"],
			["판단하시오", "hãy xác định"],
			["만족하는", "thỏa mãn"],
			["의 값은", " có giá trị là"],
			["무엇일까요?", "là gì?"],
			["따라서", "Vì vậy"],
			["정답", "đáp án"]
		],
		Русский: [
			["좋아, 이 조각을 이해했어요!", "Отлично, этот шаг понятен!"],
			["천천히 골라도 괜찮아요.", "Выбирай ответ не спеша."],
			["다음 조각", "Следующий шаг"],
			["다시 풀기", "Решить снова"],
			["값을 구하시오", "найдите значение"],
			["계산하시오", "вычислите"],
			["나타내시오", "представьте"],
			["판단하시오", "определите"],
			["만족하는", "удовлетворяющий"],
			["의 값은", " имеет значение"],
			["무엇일까요?", "что это?"],
			["따라서", "Следовательно"],
			["정답", "ответ"]
		],
		中文: [
			["좋아, 이 조각을 이해했어요!", "很好，你理解了这一步！"],
			["천천히 골라도 괜찮아요.", "慢慢选择也没关系。"],
			["다음 조각", "下一步"],
			["다시 풀기", "再做一次"],
			["값을 구하시오", "求值"],
			["계산하시오", "计算"],
			["나타내시오", "表示"],
			["판단하시오", "判断"],
			["만족하는", "满足"],
			["의 값은", "的值是"],
			["무엇일까요?", "是什么？"],
			["따라서", "因此"],
			["정답", "答案"]
		],
		සිංහල: [
			["좋아, 이 조각을 이해했어요!", "හොඳයි, මේ පියවර තේරුණා!"],
			["천천히 골라도 괜찮아요.", "සෙමින් තෝරාගන්න."],
			["다음 조각", "ඊළඟ පියවර"],
			["다시 풀기", "නැවත විසඳන්න"],
			["값을 구하시오", "අගය සොයන්න"],
			["계산하시오", "ගණනය කරන්න"],
			["나타내시오", "දක්වන්න"],
			["판단하시오", "තීරණය කරන්න"],
			["만족하는", "සපුරාලන"],
			["의 값은", " හි අගය"],
			["무엇일까요?", "කුමක්ද?"],
			["따라서", "එබැවින්"],
			["정답", "පිළිතුර"]
		]
	}[lang].reduce((text, [ko, tr]) => text.split(ko).join(tr), value);
}
var fallbackTrainingTranslation = (value, lang) => {
	const short = {
		"몰라요": {
			English: "I don't know",
			"Tiếng Việt": "Em chưa biết",
			Русский: "Не знаю",
			中文: "不知道",
			සිංහල: "මම දන්නේ නැහැ"
		},
		"없다": {
			English: "None",
			"Tiếng Việt": "Không có",
			Русский: "Нет",
			中文: "没有",
			සිංහල: "නැත"
		},
		"있다": {
			English: "Yes, there is",
			"Tiếng Việt": "Có",
			Русский: "Есть",
			中文: "有",
			සිංහල: "ඇත"
		},
		"같다": {
			English: "Equal",
			"Tiếng Việt": "Bằng nhau",
			Русский: "Равны",
			中文: "相等",
			සිංහල: "සමානයි"
		},
		"다르다": {
			English: "Different",
			"Tiếng Việt": "Khác nhau",
			Русский: "Разные",
			中文: "不同",
			සිංහල: "වෙනස්"
		},
		"양수": {
			English: "Positive number",
			"Tiếng Việt": "Số dương",
			Русский: "Положительное число",
			中文: "正数",
			සිංහල: "ධන සංඛ්‍යාව"
		},
		"음수": {
			English: "Negative number",
			"Tiếng Việt": "Số âm",
			Русский: "Отрицательное число",
			中文: "负数",
			සිංහල: "ඍණ සංඛ්‍යාව"
		},
		"왼쪽": {
			English: "Left",
			"Tiếng Việt": "Bên trái",
			Русский: "Слева",
			中文: "左边",
			සිංහල: "වම"
		},
		"오른쪽": {
			English: "Right",
			"Tiếng Việt": "Bên phải",
			Русский: "Справа",
			中文: "右边",
			සිංහල: "දකුණ"
		}
	};
	if (short[value]?.[lang]) return short[value][lang];
	const math = value.replace(/[가-힣ㄱ-ㅎㅏ-ㅣ]+/g, " ").replace(/\s+/g, " ").trim().replace(/^[·,.:?\s]+|[·,.:?\s]+$/g, "");
	return `${{
		English: "Choose the mathematically correct step",
		"Tiếng Việt": "Hãy chọn bước toán học đúng",
		Русский: "Выберите верный математический шаг",
		中文: "请选择正确的数学步骤",
		සිංහල: "නිවැරදි ගණිත පියවර තෝරන්න"
	}[lang]}${math ? `: ${math}` : "."}`;
};
var completeTranslation = (value, lang) => {
	if (lang === "한국어") return "";
	const translated = translatedMathText(value, lang);
	return translated !== value && !/[가-힣]/.test(translated) ? translated : fallbackTrainingTranslation(value, lang);
};
var ui = {
	한국어: {
		solve: "먼저 혼자 풀어볼까요?",
		placeholder: "정답을 입력하세요",
		check: "정답 확인",
		help: "도와줘",
		right: "정답이에요! 다음 문제로 갈까요?",
		wrong: "괜찮아요. 문제를 작은 조각으로 함께 풀어봐요.",
		next: "다음 문제",
		pieces: "문제 조각 훈련",
		practice: "같은 유형 3문제"
	},
	English: {
		solve: "Try it on your own first.",
		placeholder: "Enter your answer",
		check: "Check answer",
		help: "Help me",
		right: "Correct! Ready for the next problem?",
		wrong: "That’s okay. Let’s solve it in small pieces.",
		next: "Next problem",
		pieces: "Problem pieces",
		practice: "3 similar problems"
	},
	"Tiếng Việt": {
		solve: "Trước tiên, hãy tự giải nhé.",
		placeholder: "Nhập đáp án",
		check: "Kiểm tra",
		help: "Giúp em",
		right: "Đúng rồi! Sang bài tiếp theo nhé?",
		wrong: "Không sao. Ta chia bài toán thành từng phần nhỏ nhé.",
		next: "Bài tiếp theo",
		pieces: "Các mảnh bài toán",
		practice: "3 bài cùng dạng"
	},
	Русский: {
		solve: "Сначала попробуй решить самостоятельно.",
		placeholder: "Введите ответ",
		check: "Проверить",
		help: "Помоги",
		right: "Верно! Перейдём к следующей задаче?",
		wrong: "Ничего страшного. Разберём задачу по частям.",
		next: "Следующая задача",
		pieces: "Шаги задачи",
		practice: "3 похожие задачи"
	},
	中文: {
		solve: "先自己试着解答吧。",
		placeholder: "请输入答案",
		check: "检查答案",
		help: "帮帮我",
		right: "答对了！进入下一题吧？",
		wrong: "没关系，我们把题目分成小步骤来解决。",
		next: "下一题",
		pieces: "题目分解训练",
		practice: "3道同类题"
	},
	සිංහල: {
		solve: "මුලින්ම තනිව විසඳීමට උත්සාහ කරමු.",
		placeholder: "පිළිතුර ඇතුළත් කරන්න",
		check: "පිළිතුර බලන්න",
		help: "මට උදව් කරන්න",
		right: "නිවැරදියි! ඊළඟ ප්‍රශ්නයට යමුද?",
		wrong: "කමක් නැහැ. ප්‍රශ්නය කුඩා කොටස්වලට බෙදා විසඳමු.",
		next: "ඊළඟ ප්‍රශ්නය",
		pieces: "ප්‍රශ්න කොටස් පුහුණුව",
		practice: "සමාන ප්‍රශ්න 3ක්"
	}
};
var curriculum = {
	"중1 · 1학기": {
		"1. 소인수분해": {
			"소수와 합성수": ["소수와 합성수", "거듭제곱"],
			"소인수분해": [
				"소인수분해",
				"최대공약수",
				"최소공배수"
			]
		},
		"2. 정수와 유리수": {
			"정수와 유리수": ["양수와 음수", "수직선과 절댓값"],
			"정수와 유리수의 계산": [
				"덧셈과 뺄셈",
				"곱셈과 나눗셈",
				"혼합 계산"
			]
		},
		"3. 문자와 식": {
			"문자의 사용과 식": [
				"문자의 사용",
				"곱셈·나눗셈 기호 생략",
				"식의 값"
			],
			"일차식의 계산": ["일차식과 수의 곱셈·나눗셈", "일차식의 덧셈·뺄셈"],
			"일차방정식": [
				"방정식과 그 해",
				"등식의 성질",
				"일차방정식의 풀이와 활용"
			]
		},
		"4. 좌표평면과 그래프": {
			"좌표평면과 그래프": ["순서쌍과 좌표", "그래프"],
			"정비례와 반비례": ["정비례 관계와 그래프", "반비례 관계와 그래프"]
		}
	},
	"중1 · 2학기": {
		"5. 기본 도형": {
			"기본 도형": [
				"점·선·면",
				"각",
				"점·직선·평면의 위치 관계",
				"평행선의 성질"
			],
			"작도와 합동": ["삼각형의 작도", "삼각형의 합동 조건"]
		},
		"6. 평면도형": {
			"다각형": ["다각형의 내각과 외각", "정다각형"],
			"원과 부채꼴": ["원과 부채꼴", "부채꼴의 호의 길이와 넓이"]
		},
		"7. 입체도형": {
			"다면체와 회전체": [
				"다면체",
				"정다면체",
				"회전체"
			],
			"입체도형의 겉넓이와 부피": ["기둥·뿔의 겉넓이와 부피", "구의 겉넓이와 부피"]
		},
		"8. 자료의 정리와 해석": {
			"자료의 정리": [
				"줄기와 잎 그림",
				"도수분포표",
				"히스토그램과 도수분포다각형"
			],
			"자료의 해석": ["상대도수", "상대도수의 분포"]
		}
	},
	"중2 · 1학기": {
		"1. 유리수와 순환소수": { "유리수와 소수": [
			"유리수와 소수",
			"유리수의 소수 표현",
			"순환소수의 분수 표현"
		] },
		"2. 식의 계산": {
			"지수법칙": ["지수법칙 ⑴", "지수법칙 ⑵"],
			"단항식과 다항식의 계산": [
				"단항식의 곱셈과 나눗셈",
				"다항식의 덧셈과 뺄셈",
				"단항식과 다항식의 곱셈과 나눗셈"
			]
		},
		"3. 일차부등식": {
			"부등식": ["부등식과 그 해", "부등식의 성질"],
			"일차부등식": ["일차부등식의 풀이", "일차부등식의 활용"]
		},
		"4. 연립일차방정식": {
			"연립일차방정식": ["연립일차방정식과 그 해", "연립일차방정식의 풀이"],
			"연립일차방정식의 활용": ["연립일차방정식의 활용"]
		},
		"5. 일차함수": {
			"일차함수와 그래프": [
				"함수",
				"일차함수와 그 그래프",
				"일차함수 그래프의 절편",
				"일차함수 그래프의 기울기와 성질",
				"일차함수의 식 구하기",
				"일차함수의 활용"
			],
			"일차함수와 일차방정식": ["일차함수와 일차방정식", "일차방정식의 그래프와 연립일차방정식"]
		}
	},
	"중2 · 2학기": {
		"6. 삼각형과 사각형의 성질": {
			"삼각형의 성질": [
				"이등변삼각형의 성질",
				"직각삼각형의 합동",
				"삼각형의 외심",
				"삼각형의 내심"
			],
			"사각형의 성질": [
				"평행사변형의 성질",
				"평행사변형이 되는 조건",
				"여러 가지 사각형"
			]
		},
		"7. 도형의 닮음과 피타고라스 정리": {
			"도형의 닮음": [
				"닮은 도형",
				"삼각형의 닮음 조건",
				"평행선 사이의 선분의 길이의 비",
				"삼각형의 무게중심"
			],
			"피타고라스 정리": ["피타고라스 정리", "피타고라스 정리의 활용"]
		},
		"8. 경우의 수와 확률": {
			"경우의 수": ["사건과 경우의 수"],
			"확률": [
				"확률의 뜻",
				"확률의 기본 성질",
				"확률의 계산"
			]
		}
	},
	"중3 · 1학기": {
		"1. 제곱근과 실수": {
			"제곱근과 실수": ["제곱근의 뜻과 성질", "무리수와 실수"],
			"근호를 포함한 식의 계산": [
				"제곱근의 곱셈과 나눗셈",
				"분모의 유리화",
				"덧셈과 뺄셈"
			]
		},
		"2. 다항식의 곱셈과 인수분해": {
			"다항식의 곱셈": ["곱셈 공식", "곱셈 공식의 활용"],
			"인수분해": ["인수분해 공식", "인수분해의 활용"]
		},
		"3. 이차방정식": {
			"이차방정식": [
				"이차방정식과 그 해",
				"인수분해를 이용한 풀이",
				"제곱근을 이용한 풀이",
				"근의 공식"
			],
			"이차방정식의 활용": ["수·도형·생활 문제"]
		},
		"4. 이차함수": {
			"이차함수와 그래프": [
				"이차함수의 뜻",
				"y=ax²의 그래프",
				"y=a(x-p)²의 그래프",
				"y=ax²+p의 그래프",
				"y=a(x-p)²+q의 그래프",
				"y=ax²+bx+c의 그래프",
				"이차함수의 최댓값과 최솟값"
			],
			"이차함수의 활용": [
				"그래프의 평행이동과 대칭이동",
				"그래프에서 식 구하기",
				"이차함수의 활용"
			]
		}
	},
	"중3 · 2학기": {
		"5. 삼각비": {
			"삼각비": ["삼각비의 뜻", "특수각의 삼각비"],
			"삼각비의 활용": [
				"삼각형의 변의 길이",
				"높이와 거리",
				"삼각형의 넓이"
			]
		},
		"6. 원의 성질": {
			"원과 직선": ["현의 수직이등분선", "원의 접선"],
			"원주각": ["원주각과 중심각", "원주각의 활용"]
		},
		"7. 통계": {
			"대푯값과 산포도": ["평균·중앙값·최빈값", "편차·분산·표준편차"],
			"상관관계": ["산점도", "상관관계"]
		}
	}
};
var problems = [
	{
		title: "일차방정식 · 대표 유형 01",
		question: {
			한국어: "어떤 수 x의 3배에 5를 더한 수가 20일 때, x의 값을 구하시오.",
			English: "When 5 is added to three times a number x, the result is 20. Find x.",
			"Tiếng Việt": "Khi cộng 5 vào ba lần số x thì được 20. Hãy tìm x.",
			Русский: "Если к утроенному числу x прибавить 5, получится 20. Найдите x.",
			中文: "一个数 x 的3倍加5等于20，求 x。",
			සිංහල: "x සංඛ්‍යාවේ තුන් ගුණයට 5 එකතු කළ විට 20 වේ. x සොයන්න."
		},
		answer: "5",
		pieces: [
			{
				tag: "WHAT",
				q: "이 문제에서 구해야 하는 것은?",
				options: [
					"x의 값",
					"3의 값",
					"20의 값"
				],
				answer: 0,
				talk: "‘구하시오’ 바로 앞을 보면 찾을 수 있어."
			},
			{
				tag: "MEANING",
				q: "‘x의 3배’를 식으로 나타내면?",
				options: [
					"x+3",
					"3x",
					"x÷3"
				],
				answer: 1,
				talk: "3배는 같은 x가 3개 있다는 뜻이야."
			},
			{
				tag: "HOW",
				q: "문장 전체를 등식으로 만들면?",
				options: [
					"3x+5=20",
					"3+x+5=20",
					"3x=20+5"
				],
				answer: 0,
				talk: "‘더한 수가 20’에서 ‘가’는 =라고 읽어 보자."
			},
			{
				tag: "WHY",
				q: "3x만 남기려면 양변에서 무엇을 할까?",
				options: [
					"5를 더한다",
					"5를 뺀다",
					"3으로 나눈다"
				],
				answer: 1,
				talk: "+5와 반대되는 계산을 양쪽에 똑같이 해 주는 거야."
			},
			{
				tag: "HOW",
				q: "3x=15에서 x를 구하려면?",
				options: [
					"양변에 3을 곱한다",
					"양변을 3으로 나눈다",
					"양변에서 3을 뺀다"
				],
				answer: 1,
				talk: "x 앞의 3은 곱하기 3이니까 반대 계산은 나누기 3이야."
			},
			{
				tag: "CHECK",
				q: "x=5를 원래 식에 넣은 결과는?",
				options: [
					"3×5+5=20",
					"3+5×5=28",
					"5+5=10"
				],
				answer: 0,
				talk: "마지막에는 구한 값을 원래 문제에 넣어 확인하자."
			}
		],
		practice: [
			{
				q: "어떤 수의 2배에 7을 더하면 19이다. 어떤 수를 구하시오.",
				a: "6"
			},
			{
				q: "어떤 수의 4배에서 3을 빼면 25이다. 어떤 수를 구하시오.",
				a: "7"
			},
			{
				q: "어떤 수의 5배에 2를 더하면 42이다. 어떤 수를 구하시오.",
				a: "8"
			}
		]
	},
	{
		title: "일차방정식 · 대표 유형 02",
		question: {
			한국어: "민수는 1,200원짜리 공책을 몇 권 사고 500원짜리 연필 2자루를 샀더니 모두 5,800원을 냈다. 공책은 몇 권 샀는가?",
			English: "Minsu bought some 1,200-won notebooks and two 500-won pencils for 5,800 won in total. How many notebooks did he buy?",
			"Tiếng Việt": "Minsu mua một số vở giá 1.200 won và 2 bút chì giá 500 won, tổng cộng 5.800 won. Bạn ấy mua mấy quyển vở?",
			Русский: "Минсу купил несколько тетрадей по 1200 вон и два карандаша по 500 вон, заплатив 5800 вон. Сколько тетрадей он купил?",
			中文: "民秀买了若干本每本1200韩元的练习本和2支每支500韩元的铅笔，共付5800韩元。他买了几本练习本？",
			සිංහල: "මින්සු වොන් 1,200 බැගින් පොත් කිහිපයක් සහ වොන් 500 බැගින් පැන්සල් 2ක් මිලදී ගෙන මුළු වොන් 5,800ක් ගෙවීය. පොත් කීයක් මිලදී ගත්තේද?"
		},
		answer: "4",
		pieces: [
			{
				tag: "WHAT",
				q: "무엇을 구해야 하나요?",
				options: [
					"공책 수",
					"연필 수",
					"전체 금액"
				],
				answer: 0,
				talk: "이미 알려 준 것과 아직 모르는 것을 나눠 보자."
			},
			{
				tag: "X",
				q: "공책 수를 x라 하면 공책 가격은?",
				options: [
					"1200+x",
					"1200x",
					"500x"
				],
				answer: 1,
				talk: "한 권 가격 × 권수야."
			},
			{
				tag: "HOW",
				q: "연필 2자루의 가격은?",
				options: [
					"500원",
					"1000원",
					"1200원"
				],
				answer: 1,
				talk: "500원이 두 번이니까 500×2야."
			},
			{
				tag: "HOW",
				q: "전체를 식으로 나타내면?",
				options: [
					"1200x+1000=5800",
					"1200+1000x=5800",
					"1200x=5800"
				],
				answer: 0,
				talk: "공책값과 연필값을 더한 것이 전체 금액이야."
			},
			{
				tag: "WHY",
				q: "1200x를 남기려면 먼저?",
				options: [
					"1000을 뺀다",
					"1000을 더한다",
					"1200으로 나눈다"
				],
				answer: 0,
				talk: "덧붙은 연필값부터 반대 계산으로 떼어 내자."
			},
			{
				tag: "CHECK",
				q: "x=4일 때 전체 금액은?",
				options: [
					"4800원",
					"5300원",
					"5800원"
				],
				answer: 2,
				talk: "1200×4+500×2를 계산해 보자."
			}
		],
		practice: [
			{
				q: "900원짜리 펜 몇 자루와 300원짜리 지우개 2개가 4,200원이다. 펜은 몇 자루인가?",
				a: "4"
			},
			{
				q: "1,500원짜리 빵 몇 개와 1,000원짜리 우유 한 개가 7,000원이다. 빵은 몇 개인가?",
				a: "4"
			},
			{
				q: "700원짜리 파일 몇 개와 400원짜리 자 3개가 4,700원이다. 파일은 몇 개인가?",
				a: "5"
			}
		]
	},
	{
		title: "일차방정식 · 대표 유형 03",
		question: {
			한국어: "가로의 길이가 세로의 길이보다 4 cm 긴 직사각형의 둘레가 36 cm이다. 세로의 길이를 구하시오.",
			English: "A rectangle is 4 cm longer than it is wide, and its perimeter is 36 cm. Find its width.",
			"Tiếng Việt": "Một hình chữ nhật có chiều dài hơn chiều rộng 4 cm và chu vi là 36 cm. Tìm chiều rộng.",
			Русский: "Длина прямоугольника на 4 см больше ширины, а периметр равен 36 см. Найдите ширину.",
			中文: "一个长方形的长比宽多4厘米，周长为36厘米，求宽。",
			සිංහල: "සෘජුකෝණාස්‍රයක දිග පළලට වඩා සෙ.මී. 4ක් වැඩි අතර පරිමිතිය සෙ.මී. 36කි. පළල සොයන්න."
		},
		answer: "7",
		pieces: [
			{
				tag: "WHAT",
				q: "구해야 하는 길이는?",
				options: [
					"가로",
					"세로",
					"둘레"
				],
				answer: 1,
				talk: "문제의 마지막 문장을 먼저 확인하자."
			},
			{
				tag: "X",
				q: "세로를 x cm라 하면 가로는?",
				options: [
					"x-4",
					"4x",
					"x+4"
				],
				answer: 2,
				talk: "가로가 세로보다 4 cm 더 길다고 했지."
			},
			{
				tag: "MEANING",
				q: "직사각형 둘레를 구하는 식은?",
				options: [
					"가로+세로",
					"2×(가로+세로)",
					"가로×세로"
				],
				answer: 1,
				talk: "가로 두 변과 세로 두 변을 모두 더해야 해."
			},
			{
				tag: "HOW",
				q: "문장을 방정식으로 나타내면?",
				options: [
					"x+(x+4)=36",
					"2{x+(x+4)}=36",
					"x(x+4)=36"
				],
				answer: 1,
				talk: "둘레에는 같은 길이의 변이 두 개씩 있어."
			},
			{
				tag: "HOW",
				q: "식을 정리하면?",
				options: [
					"2x+4=36",
					"4x+8=36",
					"2x+8=36"
				],
				answer: 1,
				talk: "괄호 밖의 2를 안쪽 두 항에 모두 곱해 줘."
			},
			{
				tag: "CHECK",
				q: "세로 7 cm, 가로 11 cm의 둘레는?",
				options: [
					"18 cm",
					"28 cm",
					"36 cm"
				],
				answer: 2,
				talk: "2×(7+11)을 계산하면 확인할 수 있어."
			}
		],
		practice: [
			{
				q: "가로가 세로보다 3 cm 길고 둘레가 30 cm인 직사각형의 세로는?",
				a: "6"
			},
			{
				q: "가로가 세로보다 6 cm 길고 둘레가 44 cm인 직사각형의 세로는?",
				a: "8"
			},
			{
				q: "가로가 세로의 2배이고 둘레가 42 cm인 직사각형의 세로는?",
				a: "7"
			}
		]
	}
];
var uploadedQuadraticProblem = {
	title: "이차함수 · 업로드 문항 02",
	question: {
		한국어: "이차함수 y=ax²의 그래프와 x축에 서로 대칭인 그래프가 점 (3, -27)을 지날 때, 상수 a의 값을 구하시오.",
		English: "The graph symmetric to y=ax² about the x-axis passes through (3, -27). Find a.",
		"Tiếng Việt": "Đồ thị đối xứng của y=ax² qua trục x đi qua điểm (3, -27). Tìm a.",
		Русский: "График, симметричный y=ax² относительно оси x, проходит через точку (3, -27). Найдите a.",
		中文: "函数 y=ax² 的图像关于 x 轴对称后的图像经过点 (3, -27)，求 a。",
		සිංහල: "x අක්ෂයට සාපේක්ෂව y=ax² හි සමමිතික ප්‍රස්තාරය (3, -27) හරහා යයි. a සොයන්න."
	},
	answer: "3",
	pieces: [
		{
			tag: "WHAT",
			q: "이 문제에서 구하라고 한 것은 무엇인가요?",
			options: [
				"상수 a의 값",
				"점의 x좌표",
				"점의 y좌표"
			],
			answer: 0,
			talk: "마지막 문장을 보면 우리가 찾아야 할 값이 바로 보여."
		},
		{
			tag: "POINT",
			q: "점 (3, -27)을 x축에 대칭이동하면 어느 좌표가 바뀌나요?",
			options: [
				"y좌표의 부호",
				"x좌표의 부호",
				"x, y좌표 모두"
			],
			answer: 0,
			talk: "x축을 거울이라고 생각해 봐. 좌우 위치는 그대로이고 위아래 위치만 바뀌어."
		},
		{
			tag: "POINT",
			q: "점 (3, -27)을 x축에 대칭이동한 점은 무엇인가요?",
			options: [
				"(3, 27)",
				"(-3, -27)",
				"(-3, 27)"
			],
			answer: 0,
			talk: "x좌표 3은 그대로, y좌표 -27의 부호만 바꾸면 돼."
		},
		{
			tag: "CONNECT",
			q: "점의 y좌표 부호가 바뀐다면 식에서는 무엇의 부호가 바뀌어야 할까요?",
			options: [
				"y값 전체",
				"x값",
				"지수 2"
			],
			answer: 0,
			talk: "점에서 위아래를 나타내는 값은 y였지? 식에서도 y값 전체가 반대로 되어야 해."
		},
		{
			tag: "MEANING",
			q: "그래서 y=ax²를 x축에 대칭이동한 식은 무엇인가요?",
			options: [
				"y=-ax²",
				"y=a(-x)²",
				"y=ax²+1"
			],
			answer: 0,
			talk: "모든 y값에 -를 붙이면 y=-ax²가 돼. 이제 앞의 점 이동과 식이 연결됐어."
		},
		{
			tag: "DATA",
			q: "대칭이동한 그래프가 지나는 점은 무엇인가요?",
			options: [
				"(3, -27)",
				"(-3, 27)",
				"(27, -3)"
			],
			answer: 0,
			talk: "이제 문제에 주어진 점을 식에 넣을 차례야."
		},
		{
			tag: "POWER",
			q: "x=3일 때 x²의 값은 무엇인가요?",
			options: [
				"6",
				"9",
				"3"
			],
			answer: 1,
			talk: "x²는 x×x라는 뜻이야. 따라서 3²=3×3=9야."
		},
		{
			tag: "HOW",
			q: "x=3, y=-27을 y=-ax²에 대입한 식은?",
			options: [
				"-27=-a×9",
				"3=-a×(-27)²",
				"-27=a×3"
			],
			answer: 0,
			talk: "먼저 3²을 9로 계산한 뒤 넣으면 식이 훨씬 잘 보여."
		},
		{
			tag: "HOW",
			q: "-27=-9a에서 a를 구하면?",
			options: [
				"-3",
				"3",
				"9"
			],
			answer: 1,
			talk: "양변을 -9로 나누어 보자. 음수를 음수로 나누면 양수가 돼."
		},
		{
			tag: "CHECK",
			q: "a=3일 때 대칭이동한 식 y=-3x²에 x=3을 넣은 값은?",
			options: [
				"-27",
				"27",
				"-9"
			],
			answer: 0,
			talk: "구한 값을 원래 조건에 다시 넣어 확인하면 실수를 잡을 수 있어."
		}
	],
	practice: [
		{
			q: "y=ax²을 x축에 대칭이동한 그래프가 (2, -20)을 지날 때 a를 구하시오.",
			a: "5"
		},
		{
			q: "y=ax²을 x축에 대칭이동한 그래프가 (4, -32)을 지날 때 a를 구하시오.",
			a: "2"
		},
		{
			q: "y=ax²을 x축에 대칭이동한 그래프가 (5, -75)을 지날 때 a를 구하시오.",
			a: "3"
		}
	]
};
function textbookSeed(name, major = "") {
	if (major.includes("유리수와 순환소수")) {
		if (name.includes("순환소수의 분수 표현")) return {
			q: "순환소수 0.8111…을 분수로 나타내시오.",
			a: "73/90",
			rule: "순환하지 않는 부분까지 자릿수를 맞춘 두 식을 빼서 순환 부분을 없앤다.",
			work: "x=0.8111…에서 100x-10x=81.111…-8.111…=73이므로 90x=73",
			p: [
				["0.3222…를 분수로 나타내시오.", "29/90"],
				["1.2333…을 분수로 나타내시오.", "37/30"],
				["0.1444…를 분수로 나타내시오.", "13/90"]
			]
		};
		return {
			q: "분수 7/40을 소수로 나타내고 유한소수인지 판단하시오. 유한소수이면 1을 쓰시오.",
			a: "0.175,1",
			rule: "기약분수의 분모의 소인수가 2와 5뿐이면 유한소수로 나타낼 수 있다.",
			work: "7/40=0.175이고 40=2³×5이므로 유한소수",
			p: [
				["3/20을 소수로 나타내고 유한소수이면 1을 쓰시오.", "0.15,1"],
				["7/8을 소수로 나타내고 유한소수이면 1을 쓰시오.", "0.875,1"],
				["5/12를 소수로 나타내고 순환소수이면 1을 쓰시오.", "0.41666…,1"]
			]
		};
	}
	if (major.includes("이차함수")) {
		if (name.includes("a(x-p)²+q")) return {
			q: "이차함수 y=2(x-3)²-4의 그래프의 꼭짓점의 좌표를 구하시오.",
			a: "3,-4",
			rule: "y=a(x-p)²+q의 꼭짓점은 (p, q)이다.",
			work: "p=3, q=-4이므로 꼭짓점은 (3,-4)",
			p: [
				["y=(x-2)²+5의 꼭짓점을 구하시오.", "2,5"],
				["y=-3(x+1)²-2의 꼭짓점을 구하시오.", "-1,-2"],
				["y=4(x-5)²의 꼭짓점을 구하시오.", "5,0"]
			]
		};
		if (name.includes("a(x-p)²")) return {
			q: "이차함수 y=3(x-2)²의 그래프의 축의 방정식을 구하시오.",
			a: "x=2",
			rule: "y=a(x-p)²의 그래프의 축은 x=p이다.",
			work: "p=2이므로 축은 x=2",
			p: [
				["y=2(x-4)²의 축을 구하시오.", "x=4"],
				["y=-(x+3)²의 축을 구하시오.", "x=-3"],
				["y=5(x-1)²의 축을 구하시오.", "x=1"]
			]
		};
		if (name.includes("ax²+p")) return {
			q: "이차함수 y=2x²-5의 그래프의 꼭짓점의 좌표를 구하시오.",
			a: "0,-5",
			rule: "y=ax²+q의 꼭짓점은 (0, q)이다.",
			work: "q=-5이므로 꼭짓점은 (0,-5)",
			p: [
				["y=3x²+2의 꼭짓점을 구하시오.", "0,2"],
				["y=-x²-4의 꼭짓점을 구하시오.", "0,-4"],
				["y=5x²+7의 꼭짓점을 구하시오.", "0,7"]
			]
		};
		if (name.includes("ax²+bx+c") || name.includes("식 구하기")) return {
			q: "이차함수 y=x²-4x+1의 그래프의 축의 방정식을 구하시오.",
			a: "x=2",
			rule: "y=ax²+bx+c의 축은 x=-b/(2a)이다.",
			work: "a=1, b=-4이므로 x=4/2=2",
			p: [
				["y=x²-6x+2의 축을 구하시오.", "x=3"],
				["y=2x²+8x-1의 축을 구하시오.", "x=-2"],
				["y=-x²+10x+3의 축을 구하시오.", "x=5"]
			]
		};
		if (name.includes("평행이동") || name.includes("대칭이동")) return {
			q: "이차함수 y=2x²의 그래프를 x축의 방향으로 3만큼, y축의 방향으로 -4만큼 평행이동한 그래프의 식을 구하시오.",
			a: "y=2(x-3)²-4",
			rule: "x축으로 p, y축으로 q만큼 이동하면 y=a(x-p)²+q이다.",
			work: "p=3, q=-4를 넣어 y=2(x-3)²-4",
			p: [
				["y=x²을 오른쪽 2, 위로 5만큼 이동한 식을 구하시오.", "y=(x-2)²+5"],
				["y=3x²을 왼쪽 1, 아래로 2만큼 이동한 식을 구하시오.", "y=3(x+1)²-2"],
				["y=-2x²을 오른쪽 4만큼 이동한 식을 구하시오.", "y=-2(x-4)²"]
			]
		};
		return {
			q: "이차함수 y=2x²에서 x=3일 때 y의 값을 구하시오.",
			a: "18",
			rule: "함숫값은 식의 x 자리에 주어진 수를 대입한다.",
			work: "y=2×3²=18",
			p: [
				["y=3x²에서 x=2일 때 y를 구하시오.", "12"],
				["y=-2x²에서 x=3일 때 y를 구하시오.", "-18"],
				["y=(x-1)²에서 x=4일 때 y를 구하시오.", "9"]
			]
		};
	}
	if (major.includes("이차방정식")) return {
		q: "이차방정식 x²-5x+6=0을 푸시오.",
		a: "2,3",
		rule: "곱이 6이고 합이 -5가 되도록 인수분해한다.",
		work: "(x-2)(x-3)=0이므로 x=2 또는 x=3",
		p: [
			["x²-7x+12=0을 푸시오.", "3,4"],
			["x²-x-6=0을 푸시오.", "-2,3"],
			["x²+5x+6=0을 푸시오.", "-3,-2"]
		]
	};
	if (major.includes("연립일차방정식")) return {
		q: "연립방정식 x+y=7, x-y=3을 푸시오.",
		a: "5,2",
		rule: "두 식을 더하거나 빼서 한 문자를 없앤다.",
		work: "두 식을 더하면 2x=10, x=5이고 y=2",
		p: [
			["x+y=9, x-y=1을 푸시오.", "5,4"],
			["2x+y=8, x-y=1을 푸시오.", "3,2"],
			["x+2y=7, x-y=1을 푸시오.", "3,2"]
		]
	};
	if (major.includes("일차부등식")) return {
		q: "일차부등식 3x+5≤20을 푸시오.",
		a: "x≤5",
		rule: "부등식의 양변에 같은 수를 더하거나 빼고 양수로 나눈다.",
		work: "3x≤15이므로 x≤5",
		p: [
			["2x+3<11을 푸시오.", "x<4"],
			["4x-5≥7을 푸시오.", "x≥3"],
			["5x+2≤22를 푸시오.", "x≤4"]
		]
	};
	if (name === "거듭제곱") return {
		q: "2⁴의 값을 구하시오.",
		a: "16",
		rule: "2를 네 번 곱한다.",
		work: "2×2×2×2=16",
		p: [
			["3³의 값을 구하시오.", "27"],
			["5²의 값을 구하시오.", "25"],
			["2⁵의 값을 구하시오.", "32"]
		]
	};
	if (name === "최대공약수") return {
		q: "18과 24의 최대공약수를 구하시오.",
		a: "6",
		rule: "두 수의 공통인 약수 중 가장 큰 수를 찾는다.",
		work: "18=2×3², 24=2³×3에서 공통인 2×3=6",
		p: [
			["12와 20의 최대공약수를 구하시오.", "4"],
			["21과 35의 최대공약수를 구하시오.", "7"],
			["24와 36의 최대공약수를 구하시오.", "12"]
		]
	};
	if (name === "최소공배수") return {
		q: "12와 18의 최소공배수를 구하시오.",
		a: "36",
		rule: "두 수의 공통인 배수 중 가장 작은 수를 찾는다.",
		work: "12=2²×3, 18=2×3²에서 2²×3²=36",
		p: [
			["8과 12의 최소공배수를 구하시오.", "24"],
			["10과 15의 최소공배수를 구하시오.", "30"],
			["14와 21의 최소공배수를 구하시오.", "42"]
		]
	};
	if (name === "양수와 음수") return {
		q: "해수면보다 5 m 낮은 위치를 부호를 사용하여 나타내시오.",
		a: "-5",
		rule: "기준보다 낮거나 반대 방향은 음수로 나타낸다.",
		work: "해수면을 0으로 보면 아래 5 m는 -5 m",
		p: [
			["0보다 8 작은 수를 쓰시오.", "-8"],
			["기준보다 3 m 높은 위치를 쓰시오.", "3"],
			["7도 아래를 부호로 쓰시오.", "-7"]
		]
	};
	if (name === "수직선과 절댓값") return {
		q: "수직선에서 -7과 0 사이의 거리를 구하시오.",
		a: "7",
		rule: "절댓값은 수직선에서 0까지의 거리이다.",
		work: "|-7|=7",
		p: [
			["|-9|를 구하시오.", "9"],
			["|4|를 구하시오.", "4"],
			["-12와 0 사이의 거리를 구하시오.", "12"]
		]
	};
	if (name === "덧셈과 뺄셈") return {
		q: "(-6)+14-3을 계산하시오.",
		a: "5",
		rule: "부호를 살피며 왼쪽부터 계산한다.",
		work: "-6+14=8, 8-3=5",
		p: [
			["(-8)+15-2를 계산하시오.", "5"],
			["12-(-3)-8을 계산하시오.", "7"],
			["(-9)+4+7을 계산하시오.", "2"]
		]
	};
	if (name === "곱셈과 나눗셈") return {
		q: "(-4)×6÷3을 계산하시오.",
		a: "-8",
		rule: "음수와 양수의 곱은 음수이며 왼쪽부터 계산한다.",
		work: "-4×6=-24, -24÷3=-8",
		p: [
			["(-3)×8÷4를 계산하시오.", "-6"],
			["(-5)×(-2)÷2를 계산하시오.", "5"],
			["18÷(-3)×2를 계산하시오.", "-12"]
		]
	};
	if (name === "혼합 계산") return {
		q: "8-2×(-3)+4를 계산하시오.",
		a: "18",
		rule: "곱셈을 덧셈과 뺄셈보다 먼저 계산한다.",
		work: "2×(-3)=-6, 8-(-6)+4=18",
		p: [
			["5+3×(-2)를 계산하시오.", "-1"],
			["12÷(-3)+7을 계산하시오.", "3"],
			["6-2×(-4)를 계산하시오.", "14"]
		]
	};
	if (name === "문자의 사용") return {
		q: "한 개에 800원인 공책 x권의 가격을 식으로 나타내시오.",
		a: "800x",
		rule: "한 개의 가격과 개수를 곱한다.",
		work: "800×x=800x",
		p: [
			["한 자루에 500원인 펜 x자루의 가격을 나타내시오.", "500x"],
			["사과 x개와 3개를 합한 개수를 나타내시오.", "x+3"],
			["x명의 학생에게 사탕을 2개씩 줄 때 필요한 개수를 나타내시오.", "2x"]
		]
	};
	if (name === "곱셈·나눗셈 기호 생략") return {
		q: "a×5÷b를 곱셈·나눗셈 기호를 생략하여 나타내시오.",
		a: "5a/b",
		rule: "수는 문자 앞에 쓰고 나눗셈은 분수로 나타낸다.",
		work: "a×5÷b=5a/b",
		p: [
			["x×3을 간단히 나타내시오.", "3x"],
			["a÷4를 간단히 나타내시오.", "a/4"],
			["2×x×y를 간단히 나타내시오.", "2xy"]
		]
	};
	if (name === "식의 값") return {
		q: "x=4일 때 3x-2의 값을 구하시오.",
		a: "10",
		rule: "식의 문자 자리에 주어진 수를 넣는다.",
		work: "3×4-2=12-2=10",
		p: [
			["x=3일 때 2x+1의 값을 구하시오.", "7"],
			["a=5일 때 4a-3의 값을 구하시오.", "17"],
			["y=-2일 때 3y+8의 값을 구하시오.", "2"]
		]
	};
	if (name === "일차식과 수의 곱셈·나눗셈") return {
		q: "3(2x-4)를 계산하시오.",
		a: "6x-12",
		rule: "괄호 밖의 수를 안의 각 항에 모두 곱한다.",
		work: "3×2x-3×4=6x-12",
		p: [
			["2(x+3)을 계산하시오.", "2x+6"],
			["-3(x-2)를 계산하시오.", "-3x+6"],
			["(8x+4)÷4를 계산하시오.", "2x+1"]
		]
	};
	if (name === "일차식의 덧셈·뺄셈") return {
		q: "(3x+5)+(2x-1)을 계산하시오.",
		a: "5x+4",
		rule: "x항끼리, 상수항끼리 모아 계산한다.",
		work: "3x+2x+5-1=5x+4",
		p: [
			["2x+3+4x-1을 계산하시오.", "6x+2"],
			["5x+7-(2x+3)을 계산하시오.", "3x+4"],
			["-x+4+3x-9를 계산하시오.", "2x-5"]
		]
	};
	if (name === "방정식과 그 해") return {
		q: "x=4가 방정식 2x+1=9의 해인지 판단하시오. 맞으면 1을 쓰시오.",
		a: "1",
		rule: "x 자리에 값을 넣어 양변이 같은지 확인한다.",
		work: "2×4+1=9이므로 양변이 같다.",
		p: [
			["x=3이 x+5=8의 해이면 1을 쓰시오.", "1"],
			["x=2가 3x=6의 해이면 1을 쓰시오.", "1"],
			["x=5가 2x-1=9의 해이면 1을 쓰시오.", "1"]
		]
	};
	if (name === "등식의 성질") return {
		q: "x+7=12의 양변에서 7을 뺄 때 x의 값을 구하시오.",
		a: "5",
		rule: "등식의 양변에 같은 수를 빼도 등식은 성립한다.",
		work: "x+7-7=12-7이므로 x=5",
		p: [
			["x+4=10을 푸시오.", "6"],
			["x-3=8을 푸시오.", "11"],
			["2x=14를 푸시오.", "7"]
		]
	};
	if (name === "순서쌍과 좌표") return {
		q: "점 P(3, -2)의 y좌표를 구하시오.",
		a: "-2",
		rule: "순서쌍은 (x좌표, y좌표) 순서이다.",
		work: "두 번째 수 -2가 y좌표이다.",
		p: [
			["점 A(2,5)의 x좌표를 구하시오.", "2"],
			["점 B(-4,1)의 y좌표를 구하시오.", "1"],
			["점 C(0,-3)의 y좌표를 구하시오.", "-3"]
		]
	};
	if (name === "그래프") return {
		q: "점 (2, 3)을 지나는 그래프에서 x=2일 때 y의 값을 구하시오.",
		a: "3",
		rule: "좌표 (x,y)는 그래프 위 한 점의 가로와 세로 위치이다.",
		work: "(2,3)의 두 번째 값이 y이므로 3",
		p: [
			["점 (1,4)에서 y를 구하시오.", "4"],
			["점 (-2,5)에서 x를 구하시오.", "-2"],
			["점 (3,-1)에서 y를 구하시오.", "-1"]
		]
	};
	if (name === "정비례 관계와 그래프") return {
		q: "y=3x에서 x=4일 때 y의 값을 구하시오.",
		a: "12",
		rule: "정비례는 y=ax 꼴이며 x에 일정한 수를 곱한다.",
		work: "y=3×4=12",
		p: [
			["y=2x에서 x=5일 때 y를 구하시오.", "10"],
			["y=-3x에서 x=2일 때 y를 구하시오.", "-6"],
			["y=4x에서 x=-2일 때 y를 구하시오.", "-8"]
		]
	};
	if (name === "반비례 관계와 그래프") return {
		q: "y=12/x에서 x=3일 때 y의 값을 구하시오.",
		a: "4",
		rule: "반비례는 y=a/x 꼴이며 일정한 수를 x로 나눈다.",
		work: "y=12÷3=4",
		p: [
			["y=20/x에서 x=4일 때 y를 구하시오.", "5"],
			["y=18/x에서 x=6일 때 y를 구하시오.", "3"],
			["y=-12/x에서 x=3일 때 y를 구하시오.", "-4"]
		]
	};
	if (/소수|합성수/.test(name)) return {
		q: "다음 수 중 소수인 것을 구하시오: 21, 29, 39",
		a: "29",
		rule: "약수가 1과 자기 자신뿐인 수를 찾자.",
		work: "각 수가 2, 3, 5로 나누어지는지 확인한다.",
		p: [
			["다음 중 소수인 것을 구하시오: 15, 23, 33", "23"],
			["다음 중 소수인 것을 구하시오: 27, 31, 51", "31"],
			["다음 중 소수인 것을 구하시오: 35, 41, 49", "41"]
		]
	};
	if (/소인수|공약수|공배수/.test(name)) return {
		q: "84를 소인수분해할 때 서로 다른 소인수의 합을 구하시오.",
		a: "12",
		rule: "84=2²×3×7로 나타내 보자.",
		work: "서로 다른 소인수 2, 3, 7을 더한다.",
		p: [
			["60의 서로 다른 소인수의 합을 구하시오.", "10"],
			["90의 서로 다른 소인수의 합을 구하시오.", "10"],
			["105의 서로 다른 소인수의 합을 구하시오.", "15"]
		]
	};
	if (name === "곱셈 공식") return {
		q: "(2x-3)(x+4)를 전개하여 간단히 하시오.",
		a: "2x²+5x-12",
		rule: "각 항을 빠짐없이 곱한 뒤 동류항을 정리한다.",
		work: "2x²+8x-3x-12=2x²+5x-12",
		p: [
			["(x+2)(x+5)를 전개하시오.", "x²+7x+10"],
			["(3x-1)(x+2)를 전개하시오.", "3x²+5x-2"],
			["(2x+3)(2x-3)를 전개하시오.", "4x²-9"]
		]
	};
	if (name === "곱셈 공식의 활용") return {
		q: "102²을 곱셈 공식을 이용하여 계산하시오.",
		a: "10404",
		rule: "102를 100+2로 보고 (a+b)² 공식을 이용한다.",
		work: "(100+2)²=10000+400+4=10404",
		p: [
			["99²을 계산하시오.", "9801"],
			["103²을 계산하시오.", "10609"],
			["98×102를 계산하시오.", "9996"]
		]
	};
	if (name === "인수분해 공식") return {
		q: "2x²+7x+3을 인수분해하시오.",
		a: "(2x+1)(x+3)",
		rule: "곱이 6, 합이 7이 되는 두 수를 찾아 가운데항을 나눈다.",
		work: "2x²+x+6x+3=(2x+1)(x+3)",
		p: [
			["x²+7x+12를 인수분해하시오.", "(x+3)(x+4)"],
			["2x²+5x+2를 인수분해하시오.", "(2x+1)(x+2)"],
			["3x²-x-2를 인수분해하시오.", "(3x+2)(x-1)"]
		]
	};
	if (name === "인수분해의 활용") return {
		q: "x²-y²=45이고 x+y=9일 때, x-y의 값을 구하시오.",
		a: "5",
		rule: "x²-y²=(x+y)(x-y)를 이용한다.",
		work: "9(x-y)=45이므로 x-y=5",
		p: [
			["a²-b²=56, a+b=8일 때 a-b를 구하시오.", "7"],
			["x²-y²=72, x-y=6일 때 x+y를 구하시오.", "12"],
			["p²-q²=40, p+q=10일 때 p-q를 구하시오.", "4"]
		]
	};
	if ([
		"정수와 유리수",
		"덧셈과 뺄셈",
		"곱셈과 나눗셈",
		"혼합 계산"
	].includes(name)) return {
		q: "(-6)+14-3을 계산하시오.",
		a: "5",
		rule: "부호를 살피며 왼쪽부터 계산하자.",
		work: "-6+14=8, 8-3=5이다.",
		p: [
			["(-8)+15-2를 계산하시오.", "5"],
			["12-(-3)-8을 계산하시오.", "7"],
			["(-4)×3+17을 계산하시오.", "5"]
		]
	};
	if (/방정식|부등식/.test(name)) return {
		q: "3x+5=20을 만족하는 x의 값을 구하시오.",
		a: "5",
		rule: "등식의 양변에 같은 계산을 해도 등식은 성립한다.",
		work: "양변에서 5를 빼고 3으로 나눈다.",
		p: [
			["2x+7=19를 푸시오.", "6"],
			["4x-3=25를 푸시오.", "7"],
			["5x+2=42를 푸시오.", "8"]
		]
	};
	if (/이차함수|ax²|최댓값|최솟값/.test(name)) return {
		q: "이차함수 y=2x²에서 x=3일 때 y의 값을 구하시오.",
		a: "18",
		rule: "함숫값은 식의 x 자리에 주어진 수를 대입한다.",
		work: "y=2×3²=2×9=18이다.",
		p: [
			["y=3x²에서 x=2일 때 y를 구하시오.", "12"],
			["y=-2x²에서 x=3일 때 y를 구하시오.", "-18"],
			["y=(x-1)²에서 x=4일 때 y를 구하시오.", "9"]
		]
	};
	if (/함수|그래프|좌표|정비례|반비례/.test(name)) return {
		q: "일차함수 y=2x+1에서 x=3일 때 y의 값을 구하시오.",
		a: "7",
		rule: "x의 값이 정해지면 대응하는 y의 값이 하나로 정해진다.",
		work: "y=2×3+1=7이다.",
		p: [
			["y=3x-1에서 x=2일 때 y를 구하시오.", "5"],
			["y=-x+8에서 x=3일 때 y를 구하시오.", "5"],
			["y=4x+2에서 x=2일 때 y를 구하시오.", "10"]
		]
	};
	if (/제곱근|무리수|실수|근호/.test(name)) return {
		q: "√196의 값을 구하시오.",
		a: "14",
		rule: "제곱해서 196이 되는 양수를 찾자.",
		work: "14²=196이므로 √196=14이다.",
		p: [
			["√81의 값을 구하시오.", "9"],
			["√121의 값을 구하시오.", "11"],
			["√225의 값을 구하시오.", "15"]
		]
	};
	if (/확률|경우의 수/.test(name)) return {
		q: "동전 한 개를 두 번 던질 때 앞면이 한 번만 나오는 경우의 수를 구하시오.",
		a: "2",
		rule: "가능한 결과를 빠짐없이 나열하자.",
		work: "(앞,뒤), (뒤,앞)의 2가지이다.",
		p: [
			["주사위 한 개에서 짝수가 나오는 경우의 수를 구하시오.", "3"],
			["동전 3개가 모두 앞면인 경우의 수를 구하시오.", "1"],
			["1,2,3 중 서로 다른 두 수를 순서 있게 고르는 경우의 수를 구하시오.", "6"]
		]
	};
	if (/평균|중앙값|최빈값|분산|표준편차|상관|자료|도수/.test(name)) return {
		q: "자료 2, 4, 6, 8의 평균을 구하시오.",
		a: "5",
		rule: "평균은 자료의 합을 자료의 개수로 나눈 값이다.",
		work: "(2+4+6+8)÷4=5이다.",
		p: [
			["자료 3,5,7의 평균을 구하시오.", "5"],
			["자료 2,2,8의 평균을 구하시오.", "4"],
			["자료 4,6,8,10의 평균을 구하시오.", "7"]
		]
	};
	if (/삼각형|각|다각형|사각형|평행|원|부채꼴|도형|닮음|피타고라스|삼각비/.test(name)) return {
		q: "삼각형의 두 내각이 52°, 63°일 때 나머지 한 내각의 크기를 구하시오.",
		a: "65",
		rule: "삼각형의 세 내각의 크기의 합은 180°이다.",
		work: "180-52-63=65이다.",
		p: [
			["두 내각이 40°,70°인 삼각형의 나머지 각을 구하시오.", "70"],
			["두 내각이 35°,85°인 삼각형의 나머지 각을 구하시오.", "60"],
			["직각삼각형의 한 예각이 28°일 때 다른 예각을 구하시오.", "62"]
		]
	};
	return {
		q: `${name}의 기본 개념을 이용하여 4×3-5를 계산하시오.`,
		a: "7",
		rule: `${name}에서 사용하는 뜻과 기호를 먼저 확인하자.`,
		work: "곱셈을 먼저 계산하면 12-5=7이다.",
		p: [
			["5×3-8을 계산하시오.", "7"],
			["6×2-5를 계산하시오.", "7"],
			["4×4-9를 계산하시오.", "7"]
		]
	};
}
function topicPieces(name, s) {
	if (name === "거듭제곱") return [
		{
			tag: "READ",
			q: "2⁴에서 작은 수 4는 무엇을 뜻할까요?",
			options: [
				"2를 네 번 곱한다",
				"2에 4를 더한다",
				"4를 두 번 곱한다"
			],
			answer: 0,
			talk: "4는 2가 곱해지는 횟수야."
		},
		{
			tag: "OPEN",
			q: "2⁴를 곱셈으로 펼치면?",
			options: [
				"2×2×2×2",
				"2×4",
				"4×4"
			],
			answer: 0,
			talk: "밑 2를 네 번 써서 곱해."
		},
		{
			tag: "CALC",
			q: "2×2×2×2의 값은?",
			options: [
				"16",
				"8",
				"12"
			],
			answer: 0,
			talk: "2×2=4, 4×2=8, 8×2=16이야."
		}
	];
	if (name === "최대공약수") return [
		{
			tag: "BREAK",
			q: "18을 소인수분해한 것은?",
			options: [
				"2×3²",
				"2²×3",
				"3×6"
			],
			answer: 0,
			talk: "18=2×3×3이야."
		},
		{
			tag: "BREAK",
			q: "24를 소인수분해한 것은?",
			options: [
				"2³×3",
				"2×3²",
				"4×6"
			],
			answer: 0,
			talk: "24=2×2×2×3이야."
		},
		{
			tag: "COMMON",
			q: "두 식에 공통으로 들어 있는 소인수 묶음은?",
			options: [
				"2×3",
				"2³×3²",
				"3²"
			],
			answer: 0,
			talk: "두 상자에 모두 있는 만큼만 꺼내면 2 한 개와 3 한 개야."
		},
		{
			tag: "CALC",
			q: "공통 묶음 2×3의 값, 즉 최대공약수는?",
			options: [
				"6",
				"12",
				"3"
			],
			answer: 0,
			talk: "공통으로 나눌 수 있는 가장 큰 수는 6이야."
		}
	];
	if (name === "최소공배수") return [
		{
			tag: "BREAK",
			q: "12의 소인수분해는?",
			options: [
				"2²×3",
				"2×3²",
				"3×4"
			],
			answer: 0,
			talk: "12=2×2×3이야."
		},
		{
			tag: "BREAK",
			q: "18의 소인수분해는?",
			options: [
				"2×3²",
				"2²×3",
				"3×6"
			],
			answer: 0,
			talk: "18=2×3×3이야."
		},
		{
			tag: "COVER",
			q: "12와 18을 모두 만들려면 2와 3을 각각 몇 개까지 준비해야 할까요?",
			options: [
				"2는 2개, 3은 2개",
				"2는 1개, 3은 1개",
				"2는 3개, 3은 3개"
			],
			answer: 0,
			talk: "각 소인수의 더 많은 개수만큼 챙기면 두 수를 모두 만들 수 있어."
		},
		{
			tag: "CALC",
			q: "2²×3²의 값, 즉 최소공배수는?",
			options: [
				"36",
				"24",
				"72"
			],
			answer: 0,
			talk: "4×9=36이야."
		}
	];
	if (name === "양수와 음수") return [
		{
			tag: "BASE",
			q: "해수면을 기준 0으로 보면 ‘낮은 곳’은 어느 방향일까요?",
			options: [
				"음의 방향",
				"양의 방향",
				"방향이 없다"
			],
			answer: 0,
			talk: "해수면 아래는 0보다 작은 쪽이야."
		},
		{
			tag: "SIGN",
			q: "기준보다 5 m 낮다는 뜻에 알맞은 부호는?",
			options: [
				"-",
				"+",
				"×"
			],
			answer: 0,
			talk: "아래·감소·반대 방향은 -로 나타내."
		},
		{
			tag: "ANSWER",
			q: "해수면보다 5 m 낮은 위치는?",
			options: [
				"-5 m",
				"+5 m",
				"0 m"
			],
			answer: 0,
			talk: "방향을 부호로, 거리를 숫자로 붙이면 -5 m야."
		}
	];
	if (name === "수직선과 절댓값") return [
		{
			tag: "PLACE",
			q: "수직선에서 -7은 0의 어느 쪽에 있나요?",
			options: [
				"왼쪽",
				"오른쪽",
				"같은 위치"
			],
			answer: 0,
			talk: "음수는 0의 왼쪽에 있어."
		},
		{
			tag: "COUNT",
			q: "-7에서 0까지 몇 칸을 움직이나요?",
			options: [
				"7칸",
				"-7칸",
				"0칸"
			],
			answer: 0,
			talk: "거리는 방향 없이 칸 수만 세어 7이야."
		},
		{
			tag: "ABS",
			q: "따라서 |-7|의 값은?",
			options: [
				"7",
				"-7",
				"14"
			],
			answer: 0,
			talk: "절댓값은 0까지의 거리라서 항상 0 이상이야."
		}
	];
	if (name === "곱셈과 나눗셈") return [
		{
			tag: "SIGN",
			q: "(-4)×6의 부호는?",
			options: [
				"음수",
				"양수",
				"0"
			],
			answer: 0,
			talk: "서로 다른 부호끼리 곱하면 음수야."
		},
		{
			tag: "CALC",
			q: "(-4)×6의 값은?",
			options: [
				"-24",
				"24",
				"-10"
			],
			answer: 0,
			talk: "4×6=24에 음수 부호를 붙여 -24야."
		},
		{
			tag: "DIVIDE",
			q: "-24÷3의 값은?",
			options: [
				"-8",
				"8",
				"-21"
			],
			answer: 0,
			talk: "음수÷양수는 음수, 24÷3=8이야."
		}
	];
	if (name === "혼합 계산") return [
		{
			tag: "ORDER",
			q: "8-2×(-3)+4에서 가장 먼저 계산할 부분은?",
			options: [
				"2×(-3)",
				"8-2",
				"-3+4"
			],
			answer: 0,
			talk: "곱셈을 먼저 처리해 길을 정리하자."
		},
		{
			tag: "CALC",
			q: "2×(-3)의 값은?",
			options: [
				"-6",
				"6",
				"-1"
			],
			answer: 0,
			talk: "양수×음수는 음수이므로 -6이야."
		},
		{
			tag: "CHANGE",
			q: "8-(-6)+4에서 -(-6)은?",
			options: [
				"+6",
				"-6",
				"0"
			],
			answer: 0,
			talk: "음수를 빼면 양수를 더하는 것과 같아."
		},
		{
			tag: "FINISH",
			q: "8+6+4의 값은?",
			options: [
				"18",
				"10",
				"14"
			],
			answer: 0,
			talk: "차례로 더하면 18이야."
		}
	];
	if (name === "문자의 사용") return [
		{
			tag: "ONE",
			q: "공책 한 권의 가격은 얼마인가요?",
			options: [
				"800원",
				"x원",
				"800x원"
			],
			answer: 0,
			talk: "한 개 가격은 800원이야."
		},
		{
			tag: "COUNT",
			q: "공책은 몇 권이라고 했나요?",
			options: [
				"x권",
				"800권",
				"1권"
			],
			answer: 0,
			talk: "아직 모르는 권수를 문자 x로 나타냈어."
		},
		{
			tag: "BUILD",
			q: "한 권 가격×권수로 만든 식은?",
			options: [
				"800x",
				"800+x",
				"800÷x"
			],
			answer: 0,
			talk: "800×x는 곱셈 기호를 생략해 800x라고 써."
		}
	];
	if (name === "곱셈·나눗셈 기호 생략") return [
		{
			tag: "ORDER",
			q: "a×5에서 수 5는 문자 a의 어느 쪽에 쓸까요?",
			options: [
				"앞",
				"뒤",
				"아무 데나"
			],
			answer: 0,
			talk: "수와 문자의 곱에서는 수를 앞에 써서 5a로 적어."
		},
		{
			tag: "DIVIDE",
			q: "5a÷b를 분수 꼴로 나타내면?",
			options: [
				"5a/b",
				"5ab",
				"b/5a"
			],
			answer: 0,
			talk: "나누는 수 b가 분모로 내려가."
		},
		{
			tag: "ANSWER",
			q: "따라서 a×5÷b를 간단히 나타낸 것은?",
			options: [
				"5a/b",
				"a5b",
				"5+a-b"
			],
			answer: 0,
			talk: "수는 앞, 나눗셈은 분수로 나타내면 돼."
		}
	];
	if (name === "식의 값") return [
		{
			tag: "PLACE",
			q: "3x-2에서 x=4이면 x 자리에 넣을 수는?",
			options: [
				"4",
				"3",
				"-2"
			],
			answer: 0,
			talk: "문자 x를 숫자 4로 바꿔 끼워."
		},
		{
			tag: "MULTIPLY",
			q: "3×4의 값은?",
			options: [
				"12",
				"7",
				"1"
			],
			answer: 0,
			talk: "곱셈부터 계산하면 12야."
		},
		{
			tag: "FINISH",
			q: "12-2의 값은?",
			options: [
				"10",
				"14",
				"8"
			],
			answer: 0,
			talk: "따라서 식의 값은 10이야."
		}
	];
	if (name === "일차식과 수의 곱셈·나눗셈") return [
		{
			tag: "LEFT",
			q: "3(2x-4)에서 3×2x는?",
			options: [
				"6x",
				"5x",
				"6"
			],
			answer: 0,
			talk: "괄호 안 첫 항에도 3을 곱해."
		},
		{
			tag: "RIGHT",
			q: "3×(-4)는?",
			options: [
				"-12",
				"12",
				"-1"
			],
			answer: 0,
			talk: "괄호 안 둘째 항에도 빠뜨리지 말고 3을 곱해."
		},
		{
			tag: "JOIN",
			q: "두 결과를 이어 쓴 답은?",
			options: [
				"6x-12",
				"6x+12",
				"5x-4"
			],
			answer: 0,
			talk: "6x와 -12를 이어서 6x-12야."
		}
	];
	if (name === "일차식의 덧셈·뺄셈") return [
		{
			tag: "X",
			q: "3x와 2x를 더하면?",
			options: [
				"5x",
				"5x²",
				"6x"
			],
			answer: 0,
			talk: "같은 x 묶음끼리 개수를 더해 5x야."
		},
		{
			tag: "NUMBER",
			q: "상수항 5와 -1을 더하면?",
			options: [
				"4",
				"6",
				"-4"
			],
			answer: 0,
			talk: "5-1=4야."
		},
		{
			tag: "JOIN",
			q: "x항과 상수항을 합친 식은?",
			options: [
				"5x+4",
				"9x",
				"5x-4"
			],
			answer: 0,
			talk: "서로 다른 종류는 더 합치지 않고 5x+4로 적어."
		}
	];
	if (name === "방정식과 그 해") return [
		{
			tag: "PLACE",
			q: "2x+1=9에서 x=4를 왼쪽 식에 넣으면?",
			options: [
				"2×4+1",
				"2+4×1",
				"4+1"
			],
			answer: 0,
			talk: "x만 4로 바꿔 넣어."
		},
		{
			tag: "CALC",
			q: "2×4+1의 값은?",
			options: [
				"9",
				"8",
				"10"
			],
			answer: 0,
			talk: "2×4=8, 8+1=9야."
		},
		{
			tag: "COMPARE",
			q: "왼쪽 값 9와 오른쪽 값 9는 같나요?",
			options: [
				"같다",
				"다르다",
				"알 수 없다"
			],
			answer: 0,
			talk: "양변이 같으므로 x=4는 이 방정식의 해야."
		}
	];
	if (name === "등식의 성질") return [
		{
			tag: "BALANCE",
			q: "x+7=12에서 왼쪽의 +7을 없애려면 양변에 무엇을 할까요?",
			options: [
				"7을 뺀다",
				"7을 더한다",
				"12를 뺀다"
			],
			answer: 0,
			talk: "저울 양쪽에서 같은 7을 빼면 균형이 유지돼."
		},
		{
			tag: "RIGHT",
			q: "오른쪽 12-7의 값은?",
			options: [
				"5",
				"19",
				"7"
			],
			answer: 0,
			talk: "12에서 7을 빼면 5야."
		},
		{
			tag: "ANSWER",
			q: "따라서 x의 값은?",
			options: [
				"5",
				"7",
				"12"
			],
			answer: 0,
			talk: "왼쪽에는 x만 남고 오른쪽은 5가 돼."
		}
	];
	if (name === "순서쌍과 좌표") return [{
		tag: "ORDER",
		q: "좌표 (x, y)에서 y좌표는 몇 번째 수인가요?",
		options: [
			"두 번째",
			"첫 번째",
			"둘을 더한 값"
		],
		answer: 0,
		talk: "좌표는 가로 x 먼저, 세로 y 다음이야."
	}, {
		tag: "READ",
		q: "P(3, -2)의 두 번째 수는?",
		options: [
			"-2",
			"3",
			"2"
		],
		answer: 0,
		talk: "두 번째 자리 -2가 y좌표야."
	}];
	if (name === "그래프") return [
		{
			tag: "READX",
			q: "점 (2, 3)의 x좌표는?",
			options: [
				"2",
				"3",
				"5"
			],
			answer: 0,
			talk: "첫 번째 수가 가로 위치 x야."
		},
		{
			tag: "READY",
			q: "점 (2, 3)의 y좌표는?",
			options: [
				"3",
				"2",
				"-3"
			],
			answer: 0,
			talk: "두 번째 수가 세로 위치 y야."
		},
		{
			tag: "ANSWER",
			q: "따라서 x=2일 때 y의 값은?",
			options: [
				"3",
				"2",
				"5"
			],
			answer: 0,
			talk: "그래프의 점 (2,3)이 바로 x와 y의 짝을 알려 줘."
		}
	];
	if (name === "정비례 관계와 그래프") return [
		{
			tag: "PLACE",
			q: "y=3x에서 x=4를 넣은 식은?",
			options: [
				"y=3×4",
				"y=3+4",
				"y=4÷3"
			],
			answer: 0,
			talk: "x만 4로 바꾸면 돼."
		},
		{
			tag: "CALC",
			q: "3×4의 값은?",
			options: [
				"12",
				"7",
				"16"
			],
			answer: 0,
			talk: "x가 4일 때 y는 12야."
		},
		{
			tag: "POINT",
			q: "그래프 위의 점으로 나타내면?",
			options: [
				"(4,12)",
				"(12,4)",
				"(3,4)"
			],
			answer: 0,
			talk: "좌표는 (x,y) 순서야."
		}
	];
	if (name === "반비례 관계와 그래프") return [
		{
			tag: "PLACE",
			q: "y=12/x에서 x=3을 넣으면?",
			options: [
				"y=12÷3",
				"y=12×3",
				"y=12+3"
			],
			answer: 0,
			talk: "분모의 x를 3으로 바꾸면 12÷3이야."
		},
		{
			tag: "CALC",
			q: "12÷3의 값은?",
			options: [
				"4",
				"9",
				"36"
			],
			answer: 0,
			talk: "따라서 y=4야."
		},
		{
			tag: "POINT",
			q: "그래프 위의 점으로 나타내면?",
			options: [
				"(3,4)",
				"(4,3)",
				"(12,3)"
			],
			answer: 0,
			talk: "x=3, y=4이므로 (3,4)야."
		}
	];
	if (/소인수|공약수|공배수/.test(name)) return [
		{
			tag: "GOAL",
			q: "84의 소인수를 찾으려면 먼저 84를 어떤 곱셈으로 쪼갤까요?",
			options: [
				"12×7",
				"8+4",
				"84×1"
			],
			answer: 0,
			talk: "팩터 나무의 첫 갈림길이야. 12×7=84이고, 12는 더 쪼갤 수 있어."
		},
		{
			tag: "SPLIT",
			q: "12를 다시 소수에 가까워지도록 쪼개면?",
			options: [
				"3×4",
				"6+6",
				"12×1"
			],
			answer: 0,
			talk: "3은 이미 소수야. 4만 한 번 더 쪼개면 돼."
		},
		{
			tag: "SPLIT",
			q: "4를 소수의 곱으로 쪼개면?",
			options: [
				"2×2",
				"1×4",
				"2+2"
			],
			answer: 0,
			talk: "곱셈으로 쪼개야 소인수분해가 돼. 이제 나무 끝이 모두 소수야."
		},
		{
			tag: "COLLECT",
			q: "팩터 나무 끝에 나온 소수는 2, 2, 3, 7입니다. 서로 다른 소인수만 고르면?",
			options: [
				"2, 3, 7",
				"2, 2, 3, 7",
				"3, 7"
			],
			answer: 0,
			talk: "‘서로 다른’이라는 말 때문에 같은 2는 한 번만 모아."
		},
		{
			tag: "CALC",
			q: "서로 다른 소인수 2, 3, 7의 합은?",
			options: [
				"10",
				"12",
				"14"
			],
			answer: 1,
			talk: "2+3+7=12. 문제에서 요구한 ‘합’까지 도착했어!"
		},
		{
			tag: "CHECK",
			q: "84의 소인수분해를 바르게 나타낸 것은?",
			options: [
				"2²×3×7",
				"2×3×7",
				"2²+3+7"
			],
			answer: 0,
			talk: "2×2×3×7=84인지 다시 곱해 보면 확실해."
		}
	];
	if (/소수|합성수/.test(name)) return [
		{
			tag: "TRY",
			q: "21은 3으로 나누어떨어질까요?",
			options: [
				"네, 3×7=21",
				"아니요",
				"몰라요"
			],
			answer: 0,
			talk: "1과 21 말고도 약수 3과 7이 있으니 21은 합성수야."
		},
		{
			tag: "TRY",
			q: "29를 2, 3, 5로 나누어 보았을 때 나누어떨어지는 수가 있나요?",
			options: [
				"없다",
				"2가 있다",
				"3이 있다"
			],
			answer: 0,
			talk: "29가 2, 3, 5 중 어느 수로도 나누어떨어지지 않는지 하나씩 직접 확인해 보자. 1과 29 말고 다른 약수를 찾을 수 없으므로 29는 소수야."
		},
		{
			tag: "TRY",
			q: "39는 어떤 곱셈으로 나타낼 수 있나요?",
			options: [
				"3×13",
				"2×19",
				"5×8"
			],
			answer: 0,
			talk: "39는 1과 자기 자신 외에 3과 13도 약수로 가져."
		},
		{
			tag: "PICK",
			q: "따라서 21, 29, 39 중 소수는?",
			options: [
				"29",
				"21",
				"39"
			],
			answer: 0,
			talk: "약수가 1과 자기 자신뿐인 29가 정답이야."
		}
	];
	if (name === "곱셈 공식") return [
		{
			tag: "DISTRIBUTE",
			q: "(2x-3)(x+4)에서 2x를 두 번째 괄호의 각 항에 곱하면?",
			options: [
				"2x²+8x",
				"2x²+4",
				"2x+8x"
			],
			answer: 0,
			talk: "2x×x=2x², 2x×4=8x야."
		},
		{
			tag: "DISTRIBUTE",
			q: "-3을 두 번째 괄호의 각 항에 곱하면?",
			options: [
				"-3x-12",
				"-3x+12",
				"3x-12"
			],
			answer: 0,
			talk: "음수 -3을 x와 +4에 각각 곱해."
		},
		{
			tag: "JOIN",
			q: "네 항을 모두 이어 쓰면?",
			options: [
				"2x²+8x-3x-12",
				"2x²+8x+3x+12",
				"2x²+5x"
			],
			answer: 0,
			talk: "괄호의 모든 항을 한 번씩 곱했는지 확인하자."
		},
		{
			tag: "LIKE",
			q: "동류항 8x-3x를 계산하면?",
			options: [
				"5x",
				"11x",
				"5"
			],
			answer: 0,
			talk: "x항끼리 계수 8-3을 계산해 5x야."
		},
		{
			tag: "ANSWER",
			q: "전개하여 간단히 한 식은?",
			options: [
				"2x²+5x-12",
				"2x²+11x-12",
				"2x²+5x+12"
			],
			answer: 0,
			talk: "차수가 높은 항부터 2x²+5x-12로 정리해."
		}
	];
	if (name === "곱셈 공식의 활용") return [
		{
			tag: "CHANGE",
			q: "102를 곱셈 공식에 알맞게 나타내면?",
			options: [
				"100+2",
				"100-2",
				"102+2"
			],
			answer: 0,
			talk: "계산하기 쉬운 100을 기준으로 102=100+2로 보자."
		},
		{
			tag: "FORMULA",
			q: "(a+b)²을 전개한 것은?",
			options: [
				"a²+2ab+b²",
				"a²+b²",
				"a²-2ab+b²"
			],
			answer: 0,
			talk: "가운데항 2ab를 빠뜨리지 말자."
		},
		{
			tag: "PLACE",
			q: "(100+2)²을 공식에 넣으면?",
			options: [
				"100²+2×100×2+2²",
				"100²+2²",
				"100²-2×100×2+2²"
			],
			answer: 0,
			talk: "a=100, b=2를 각 자리에 넣어."
		},
		{
			tag: "CALC",
			q: "10000+400+4의 값은?",
			options: [
				"10404",
				"10004",
				"10400"
			],
			answer: 0,
			talk: "세 수를 차례로 더하면 10404야."
		},
		{
			tag: "CHECK",
			q: "102²의 값은?",
			options: [
				"10404",
				"10204",
				"10004"
			],
			answer: 0,
			talk: "공식에 넣은 값과 계산 결과를 마지막에 연결하자."
		}
	];
	if (name === "인수분해 공식") return [
		{
			tag: "TARGET",
			q: "2x²+7x+3을 (2x+□)(x+□) 꼴로 만들 때 상수항의 곱은?",
			options: [
				"3",
				"7",
				"6"
			],
			answer: 0,
			talk: "두 괄호의 상수끼리 곱한 값이 원래 상수항 3이 되어야 해."
		},
		{
			tag: "PAIR",
			q: "3의 양의 인수의 짝은?",
			options: [
				"1과 3",
				"2와 2",
				"1과 7"
			],
			answer: 0,
			talk: "1×3=3이야."
		},
		{
			tag: "TRY",
			q: "(2x+1)(x+3)의 가운데항을 만들면?",
			options: [
				"6x+x=7x",
				"3x+2x=5x",
				"6x+3x=9x"
			],
			answer: 0,
			talk: "바깥쪽 2x×3=6x, 안쪽 1×x=x를 더해 7x가 돼."
		},
		{
			tag: "EXPAND",
			q: "(2x+1)(x+3)을 전개하면?",
			options: [
				"2x²+7x+3",
				"2x²+5x+3",
				"2x²+7x-3"
			],
			answer: 0,
			talk: "다시 전개해 원래 식과 같은지 확인하자."
		},
		{
			tag: "ANSWER",
			q: "따라서 인수분해한 식은?",
			options: [
				"(2x+1)(x+3)",
				"(2x+3)(x+1)",
				"(2x-1)(x-3)"
			],
			answer: 0,
			talk: "곱해서 원래 다항식이 되는 두 일차식의 곱이 답이야."
		}
	];
	if (name === "인수분해의 활용") return [
		{
			tag: "FORMULA",
			q: "x²-y²을 인수분해한 것은?",
			options: [
				"(x+y)(x-y)",
				"(x-y)²",
				"(x+y)²"
			],
			answer: 0,
			talk: "제곱의 차 공식이야."
		},
		{
			tag: "PLACE",
			q: "x+y=9를 공식에 넣으면 x²-y²은?",
			options: [
				"9(x-y)",
				"9(x+y)",
				"81-(x-y)"
			],
			answer: 0,
			talk: "(x+y) 자리를 9로 바꿔."
		},
		{
			tag: "EQUATION",
			q: "x²-y²=45까지 이용한 식은?",
			options: [
				"9(x-y)=45",
				"9+(x-y)=45",
				"9(x+y)=45"
			],
			answer: 0,
			talk: "같은 값을 나타내는 두 표현을 등호로 연결해."
		},
		{
			tag: "DIVIDE",
			q: "9(x-y)=45에서 x-y는?",
			options: [
				"5",
				"36",
				"405"
			],
			answer: 0,
			talk: "양변을 9로 나누면 45÷9=5야."
		},
		{
			tag: "CHECK",
			q: "9×5가 원래 값 45와 같은가요?",
			options: [
				"같다",
				"다르다",
				"확인할 수 없다"
			],
			answer: 0,
			talk: "9×5=45이므로 조건을 만족해."
		}
	];
	if ([
		"정수와 유리수",
		"덧셈과 뺄셈",
		"곱셈과 나눗셈",
		"혼합 계산"
	].includes(name)) return [
		{
			tag: "FIRST",
			q: "(-6)+14에서 부호가 다른 두 수를 계산하면?",
			options: [
				"8",
				"-20",
				"20"
			],
			answer: 0,
			talk: "큰 절댓값 14에서 6을 빼고, 큰 쪽의 +부호를 붙여 8이야."
		},
		{
			tag: "NEXT",
			q: "앞에서 구한 8에서 3을 빼면?",
			options: [
				"5",
				"11",
				"-5"
			],
			answer: 0,
			talk: "수직선에서 8부터 왼쪽으로 세 칸 가면 5야."
		},
		{
			tag: "CHECK",
			q: "전체 계산 (-6)+14-3의 값은?",
			options: [
				"5",
				"8",
				"17"
			],
			answer: 0,
			talk: "한 번에 보지 말고 두 계산으로 나누면 쉬워져."
		}
	];
	if (/방정식|부등식/.test(name)) return [
		{
			tag: "UNDO",
			q: "3x+5=20에서 3x만 남기려면 양변에서 무엇을 할까요?",
			options: [
				"5를 뺀다",
				"5를 더한다",
				"3을 뺀다"
			],
			answer: 0,
			talk: "+5를 없애는 반대 계산은 -5야."
		},
		{
			tag: "CALC",
			q: "양변에서 5를 빼면 3x는 얼마인가요?",
			options: [
				"15",
				"25",
				"5"
			],
			answer: 0,
			talk: "20-5=15이므로 3x=15야."
		},
		{
			tag: "PROPERTY",
			q: "3x=15에서 x만 남기기 위해 등식의 양변에 할 계산은?",
			options: [
				"양변을 3으로 나눈다",
				"양변에서 3을 뺀다",
				"양변에 3을 곱한다"
			],
			answer: 0,
			talk: "x에 곱해진 3을 없애려면 등식의 양변을 같은 수 3으로 나눠야 해."
		},
		{
			tag: "DIVIDE",
			q: "3x÷3=15÷3을 계산하면 x의 값은?",
			options: [
				"5",
				"12",
				"45"
			],
			answer: 0,
			talk: "왼쪽은 x만 남고 오른쪽은 5가 되어 x=5야."
		},
		{
			tag: "CHECK",
			q: "x=5를 3x+5에 넣으면?",
			options: [
				"20",
				"15",
				"10"
			],
			answer: 0,
			talk: "3×5+5=20이므로 원래 조건과 딱 맞아."
		}
	];
	if (/함수|그래프|좌표|정비례|반비례/.test(name)) return [
		{
			tag: "PLACE",
			q: "y=2x+1에서 x=3이면 x 자리에 무엇을 넣을까요?",
			options: [
				"3",
				"y",
				"1"
			],
			answer: 0,
			talk: "x 대신 3을 넣어 식을 숫자 계산으로 바꿔 보자."
		},
		{
			tag: "CALC",
			q: "2×3의 값은?",
			options: [
				"6",
				"5",
				"9"
			],
			answer: 0,
			talk: "먼저 곱셈부터 계산하면 6이야."
		},
		{
			tag: "CALC",
			q: "6+1을 계산한 y값은?",
			options: [
				"7",
				"6",
				"5"
			],
			answer: 0,
			talk: "그래서 x=3에 짝이 되는 y값은 7이야."
		},
		{
			tag: "POINT",
			q: "그래프에서 이 대응을 점으로 나타내면?",
			options: [
				"(3, 7)",
				"(7, 3)",
				"(3, 6)"
			],
			answer: 0,
			talk: "좌표는 언제나 (x, y) 순서로 적어."
		}
	];
	if (/제곱근|무리수|실수|근호/.test(name)) return [
		{
			tag: "MEANING",
			q: "√196은 어떤 수를 찾는 기호인가요?",
			options: [
				"제곱해서 196이 되는 양수",
				"196을 2로 나눈 수",
				"196에 2를 곱한 수"
			],
			answer: 0,
			talk: "루트는 ‘어떤 수를 두 번 곱하면 안의 수가 될까?’라고 묻는 기호야."
		},
		{
			tag: "TRY",
			q: "13²과 14² 중 196이 되는 것은?",
			options: [
				"14²",
				"13²",
				"둘 다"
			],
			answer: 0,
			talk: "14×14=196이야."
		},
		{
			tag: "ANSWER",
			q: "따라서 √196의 값은?",
			options: [
				"14",
				"-14",
				"98"
			],
			answer: 0,
			talk: "√196은 양의 제곱근을 뜻하므로 14야."
		}
	];
	if (/확률|경우의 수/.test(name)) return [
		{
			tag: "LIST",
			q: "동전을 두 번 던진 결과를 모두 나열한 것은?",
			options: [
				"앞앞, 앞뒤, 뒤앞, 뒤뒤",
				"앞뒤, 뒤앞",
				"앞앞, 뒤뒤"
			],
			answer: 0,
			talk: "빠짐없이 네 칸의 결과 지도를 먼저 만들자."
		},
		{
			tag: "PICK",
			q: "그중 앞면이 한 번만 나온 결과는?",
			options: [
				"앞뒤, 뒤앞",
				"앞앞",
				"뒤뒤"
			],
			answer: 0,
			talk: "앞면이 정확히 한 번인 결과에만 표시해 보자."
		},
		{
			tag: "COUNT",
			q: "표시한 결과는 모두 몇 가지인가요?",
			options: [
				"2",
				"1",
				"4"
			],
			answer: 0,
			talk: "앞뒤와 뒤앞, 두 가지야."
		}
	];
	if (/평균|중앙값|최빈값|분산|표준편차|상관|자료|도수/.test(name)) return [
		{
			tag: "ADD",
			q: "자료 2, 4, 6, 8을 모두 더하면?",
			options: [
				"20",
				"18",
				"24"
			],
			answer: 0,
			talk: "평균을 구하려면 먼저 자료를 한 바구니에 모두 모아."
		},
		{
			tag: "COUNT",
			q: "자료는 모두 몇 개인가요?",
			options: [
				"4개",
				"20개",
				"5개"
			],
			answer: 0,
			talk: "2, 4, 6, 8 네 개야."
		},
		{
			tag: "SHARE",
			q: "합 20을 4명에게 똑같이 나누면?",
			options: [
				"5",
				"4",
				"6"
			],
			answer: 0,
			talk: "20÷4=5. 평균은 공평하게 나눈 값이라고 생각하면 돼."
		}
	];
	if (/삼각형|각|다각형|사각형|평행|원|부채꼴|도형|닮음|피타고라스|삼각비/.test(name)) return [
		{
			tag: "TOTAL",
			q: "삼각형의 세 내각을 모두 더하면 몇 도인가요?",
			options: [
				"180°",
				"360°",
				"90°"
			],
			answer: 0,
			talk: "삼각형의 세 모서리를 오려 한 점에 모으면 일직선 180°가 돼."
		},
		{
			tag: "ADD",
			q: "알고 있는 두 각 52°와 63°의 합은?",
			options: [
				"115°",
				"105°",
				"125°"
			],
			answer: 0,
			talk: "52+63=115야."
		},
		{
			tag: "MISSING",
			q: "전체 180°에서 115°를 빼면 남은 각은?",
			options: [
				"65°",
				"75°",
				"55°"
			],
			answer: 0,
			talk: "퍼즐의 빈 각은 180-115=65°야."
		}
	];
	return [{
		tag: "FIRST",
		q: "4×3을 먼저 계산하면?",
		options: [
			"12",
			"7",
			"9"
		],
		answer: 0,
		talk: "곱셈을 덧셈과 뺄셈보다 먼저 계산해."
	}, {
		tag: "NEXT",
		q: "12-5를 계산하면?",
		options: [
			"7",
			"17",
			"8"
		],
		answer: 0,
		talk: "12에서 5만큼 뒤로 가면 7이야."
	}];
}
function makeWarehouseProblem(minor, index, major = "") {
	const s = textbookSeed(minor, major), allLang = {
		한국어: s.q,
		English: translatedMathText(s.q, "English"),
		"Tiếng Việt": translatedMathText(s.q, "Tiếng Việt"),
		Русский: translatedMathText(s.q, "Русский"),
		中文: translatedMathText(s.q, "中文"),
		සිංහල: translatedMathText(s.q, "සිංහල")
	};
	const visualTitle = minor.replace("공약수", "공‌약수").replace("공배수", "공‌배수");
	const quadraticPieces = [
		{
			tag: "WHAT",
			q: "이 문제에서 구해야 하는 것은 무엇일까요?",
			options: [
				"y값",
				"x값",
				"몰라요"
			],
			answer: 0,
			talk: "문제의 마지막에 ‘y의 값을 구하시오’라고 했어. 먼저 무엇을 찾는지 잡으면 좋아."
		},
		{
			tag: "MEANING",
			q: "x²의 뜻은 무엇일까요?",
			options: [
				"2×x",
				"x×x",
				"x+x"
			],
			answer: 1,
			talk: "위의 작은 2는 x를 두 번 더하라는 뜻이 아니라 x를 두 번 곱하라는 뜻이야."
		},
		{
			tag: "SUBSTITUTE",
			q: "x²에 x=3을 대입하여 계산하면 얼마일까요?",
			options: [
				"4",
				"6",
				"9"
			],
			answer: 2,
			talk: "x×x에 3을 넣으면 3×3이니까 9야."
		},
		{
			tag: "HOW",
			q: "y=2x²에서 x²=9이므로 식은 어떻게 될까요?",
			options: [
				"y=2×9",
				"y=2+9",
				"y=9÷2"
			],
			answer: 0,
			talk: "2x²는 2와 x²을 곱한다는 뜻이야. 방금 구한 9를 넣어 보자."
		},
		{
			tag: "CALC",
			q: "2×9를 계산한 y값은 얼마일까요?",
			options: [
				"11",
				"18",
				"81"
			],
			answer: 1,
			talk: "이제 마지막 작은 계산만 하면 돼. 2가 9개이면 18이야."
		},
		{
			tag: "CHECK",
			q: "x=3을 원래 식에 넣은 계산 순서로 알맞은 것은?",
			options: [
				"y=2×3²=2×9=18",
				"y=2×3×2=12",
				"y=2+3²=11"
			],
			answer: 0,
			talk: "지수 계산을 먼저 하고, 그다음 앞의 2를 곱하는 순서를 확인하자."
		}
	];
	const standardPieces = topicPieces(minor, s);
	const assessmentPieces = [...s.q.includes("y=2x²에서 x=3일 때") ? quadraticPieces : standardPieces];
	if (assessmentPieces.length < 5) assessmentPieces.push({
		tag: "CONNECT",
		q: `${minor}에서 이 문제를 풀 때 바로 사용하는 생각은 무엇일까요?`,
		options: [
			s.rule,
			"문제의 모든 수를 먼저 더한다.",
			"가장 큰 수를 답으로 고른다."
		],
		answer: 0,
		talk: `이 문제와 직접 이어지는 교과서 생각은 ‘${s.rule}’야. 지금 문제에 필요한 것만 골라 쓰자.`
	}, {
		tag: "PLAN",
		q: "이 문제에 맞는 풀이 흐름을 고르세요.",
		options: [
			s.work,
			"주어진 수를 크기순으로만 나열한다.",
			"조건을 사용하지 않고 답을 짐작한다."
		],
		answer: 0,
		talk: `선생님과 한 줄씩 따라가 보자. ${s.work}`
	}, {
		tag: "CHECK",
		q: `계산과 조건을 다시 확인한 최종 답은 무엇일까요?`,
		options: [
			s.a,
			"0",
			"알 수 없다"
		],
		answer: 0,
		talk: `원래 문제의 조건에 넣어 확인하면 답은 ${s.a}야. 이제 조각을 덮고 같은 본문제를 혼자 다시 풀어 보자.`
	});
	return {
		title: `${visualTitle} · 학습평가 대표유형 · 난이도 중`,
		question: allLang,
		answer: s.a,
		pieces: assessmentPieces,
		practice: s.p.map(([q, a]) => ({
			q,
			a
		}))
	};
}
var warehouseBase = Object.entries(curriculum).flatMap(([term, majors]) => Object.entries(majors).flatMap(([major, middles]) => Object.entries(middles).flatMap(([middle, minors]) => minors.map((minor, i) => ({
	term,
	major,
	middle,
	minor,
	problem: makeWarehouseProblem(minor, i, major)
})))));
function evalQuestion(title, q, a, pieces, practice) {
	return {
		title,
		question: {
			한국어: q,
			English: translatedMathText(q, "English"),
			"Tiếng Việt": translatedMathText(q, "Tiếng Việt"),
			Русский: translatedMathText(q, "Русский"),
			中文: translatedMathText(q, "中文"),
			සිංහල: translatedMathText(q, "සිංහල")
		},
		answer: a,
		pieces,
		practice
	};
}
var unit1Assessment = [
	{
		term: "중1 · 1학기",
		major: "1. 소인수분해",
		middle: "소인수분해",
		minor: "거듭제곱",
		problem: evalQuestion("소인수분해 · 단원 마무리 06", "2×5×5×3×5×3×5를 거듭제곱을 사용하여 나타낼 때, 3의 지수와 5의 지수를 차례로 구하시오.", "2,4", [
			{
				tag: "SORT",
				q: "곱해진 수를 같은 수끼리 모으면?",
				options: [
					"2×3×3×5×5×5×5",
					"2×3×5",
					"2²×3×5"
				],
				answer: 0,
				talk: "곱셈은 순서를 바꾸어도 값이 같아. 같은 수끼리 모으면 개수를 세기 쉬워."
			},
			{
				tag: "COUNT",
				q: "3은 모두 몇 번 곱해졌나요?",
				options: [
					"2번",
					"3번",
					"4번"
				],
				answer: 0,
				talk: "식에서 3을 손가락으로 짚어 보면 두 개야."
			},
			{
				tag: "POWER",
				q: "3×3을 거듭제곱으로 나타내면?",
				options: [
					"3²",
					"2³",
					"3×2"
				],
				answer: 0,
				talk: "3이 두 번 곱해졌으므로 3²이라고 써."
			},
			{
				tag: "COUNT",
				q: "5는 모두 몇 번 곱해졌나요?",
				options: [
					"4번",
					"3번",
					"5번"
				],
				answer: 0,
				talk: "5를 하나씩 표시하면 네 개가 보여."
			},
			{
				tag: "POWER",
				q: "5×5×5×5를 거듭제곱으로 나타내면?",
				options: [
					"5⁴",
					"4⁵",
					"5×4"
				],
				answer: 0,
				talk: "5가 네 번 곱해졌으므로 5⁴이야."
			},
			{
				tag: "ANSWER",
				q: "3의 지수와 5의 지수를 차례로 쓰면?",
				options: [
					"2, 4",
					"4, 2",
					"3, 5"
				],
				answer: 0,
				talk: "문제에서 요구한 순서는 3의 지수 먼저, 5의 지수 다음이야."
			}
		], [
			{
				q: "2×3×3×3×7에서 3의 지수를 구하시오.",
				a: "3"
			},
			{
				q: "5×2×2×5×2에서 2의 지수와 5의 지수를 차례로 구하시오.",
				a: "3,2"
			},
			{
				q: "3×7×7×3×7×7에서 7의 지수를 구하시오.",
				a: "4"
			}
		])
	},
	{
		term: "중1 · 1학기",
		major: "1. 소인수분해",
		middle: "소인수분해",
		minor: "소인수분해",
		problem: evalQuestion("소인수분해 · 단원 마무리 07", "120을 소인수분해하고, 120에 곱하여 어떤 자연수의 제곱이 되게 하는 가장 작은 자연수를 구하시오.", "30", [
			{
				tag: "TREE",
				q: "120을 작은 소수로 차례로 나누면 나온 소인수분해는?",
				options: [
					"2³×3×5",
					"2²×3×5",
					"2³×15"
				],
				answer: 0,
				talk: "120=2×2×2×3×5야. 끝에는 소수만 남겨야 해."
			},
			{
				tag: "PAIR",
				q: "어떤 수의 제곱이 되려면 같은 소인수가 어떻게 있어야 할까요?",
				options: [
					"두 개씩 짝을 이룬다",
					"한 개씩만 있다",
					"모두 다른 수여야 한다"
				],
				answer: 0,
				talk: "예를 들어 6²=(2×3)²=2²×3²처럼 지수가 짝수가 돼."
			},
			{
				tag: "TWO",
				q: "2³을 짝이 맞는 지수로 만들려면 2를 몇 개 더 곱할까요?",
				options: [
					"1개",
					"2개",
					"3개"
				],
				answer: 0,
				talk: "2³에 2를 하나 더 곱하면 2⁴이 되어 두 쌍이 생겨."
			},
			{
				tag: "THREE",
				q: "3¹을 짝으로 만들려면 무엇을 더 곱할까요?",
				options: [
					"3",
					"2",
					"5"
				],
				answer: 0,
				talk: "3이 한 개뿐이므로 3을 하나 더 붙여 3²을 만들어."
			},
			{
				tag: "FIVE",
				q: "5¹을 짝으로 만들려면 무엇을 더 곱할까요?",
				options: [
					"5",
					"10",
					"25"
				],
				answer: 0,
				talk: "5도 한 개뿐이므로 5를 하나 더 붙여 5²을 만들어."
			},
			{
				tag: "CALC",
				q: "부족한 소인수 2, 3, 5를 곱하면?",
				options: [
					"30",
					"10",
					"60"
				],
				answer: 0,
				talk: "2×3×5=30이 가장 작은 수야. 실제로 120×30=60²이 돼."
			}
		], [
			{
				q: "18에 곱하여 제곱수가 되게 하는 가장 작은 자연수를 구하시오.",
				a: "2"
			},
			{
				q: "75에 곱하여 제곱수가 되게 하는 가장 작은 자연수를 구하시오.",
				a: "3"
			},
			{
				q: "98에 곱하여 제곱수가 되게 하는 가장 작은 자연수를 구하시오.",
				a: "2"
			}
		])
	},
	{
		term: "중1 · 1학기",
		major: "1. 소인수분해",
		middle: "소수와 합성수",
		minor: "소수와 합성수",
		problem: evalQuestion("소인수분해 · 단원 마무리 05", "다음 설명 중 옳은 것을 모두 고르시오. ㄱ. 1은 소수이다. ㄴ. 소수는 모두 홀수이다. ㄷ. 10의 약수는 4개이다. ㄹ. 약수가 2개인 자연수는 소수이다.", "ㄷ,ㄹ", [
			{
				tag: "ONE",
				q: "1의 약수는 몇 개인가요?",
				options: [
					"1개",
					"2개",
					"3개"
				],
				answer: 0,
				talk: "1의 약수는 1 하나뿐이야. 소수는 약수가 정확히 두 개여야 해."
			},
			{
				tag: "CHECK",
				q: "‘1은 소수이다’는 옳은 설명인가요?",
				options: [
					"옳지 않다",
					"옳다",
					"알 수 없다"
				],
				answer: 0,
				talk: "1은 소수도 합성수도 아니므로 ㄱ은 옳지 않아."
			},
			{
				tag: "TWO",
				q: "소수 중 짝수인 수가 있나요?",
				options: [
					"2가 있다",
					"없다",
					"4가 있다"
				],
				answer: 0,
				talk: "2는 약수가 1과 2뿐인 소수이면서 짝수야. 그래서 소수가 모두 홀수라는 말은 틀려."
			},
			{
				tag: "DIVISOR",
				q: "10의 약수를 모두 고른 것은?",
				options: [
					"1, 2, 5, 10",
					"1, 10",
					"2, 5"
				],
				answer: 0,
				talk: "10을 나누어떨어지게 하는 수는 1, 2, 5, 10의 네 개야."
			},
			{
				tag: "MEANING",
				q: "약수가 1과 자기 자신, 두 개뿐인 자연수를 무엇이라고 하나요?",
				options: [
					"소수",
					"합성수",
					"짝수"
				],
				answer: 0,
				talk: "이것이 바로 소수의 뜻이므로 ㄹ은 옳아."
			},
			{
				tag: "PICK",
				q: "옳은 설명의 기호만 고르면?",
				options: [
					"ㄷ, ㄹ",
					"ㄱ, ㄴ",
					"ㄴ, ㄷ"
				],
				answer: 0,
				talk: "각 문장을 뜻으로 확인했으니 ㄷ과 ㄹ을 골라야 해."
			}
		], [
			{
				q: "‘2는 유일한 짝수인 소수이다.’가 옳으면 1을 쓰시오.",
				a: "1"
			},
			{
				q: "‘1은 합성수이다.’가 옳지 않으면 0을 쓰시오.",
				a: "0"
			},
			{
				q: "15의 약수의 개수를 구하시오.",
				a: "4"
			}
		])
	},
	{
		term: "중1 · 1학기",
		major: "1. 소인수분해",
		middle: "소인수분해",
		minor: "소인수분해",
		problem: evalQuestion("소인수분해 · 단원 마무리 08", "소인수분해를 이용하여 108의 약수를 모두 구하시오.", "1,2,3,4,6,9,12,18,27,36,54,108", [
			{
				tag: "FACTOR",
				q: "108을 소인수분해한 것은?",
				options: [
					"2²×3³",
					"2³×3²",
					"2×3³"
				],
				answer: 0,
				talk: "108을 2로 두 번, 3으로 세 번 나누면 2²×3³이 돼."
			},
			{
				tag: "CHOICE",
				q: "약수를 만들 때 2의 지수로 사용할 수 있는 수는?",
				options: [
					"0, 1, 2",
					"1, 2",
					"0, 1, 2, 3"
				],
				answer: 0,
				talk: "2를 하나도 쓰지 않는 2⁰부터 2²까지 선택할 수 있어."
			},
			{
				tag: "CHOICE",
				q: "3의 지수로 사용할 수 있는 수는?",
				options: [
					"0, 1, 2, 3",
					"1, 2, 3",
					"0, 1, 2"
				],
				answer: 0,
				talk: "3은 세 개 있으므로 3⁰, 3¹, 3², 3³ 중 하나를 골라."
			},
			{
				tag: "COUNT",
				q: "만들 수 있는 약수의 개수는?",
				options: [
					"3×4=12개",
					"2×3=6개",
					"2+3=5개"
				],
				answer: 0,
				talk: "2의 지수 선택 3가지와 3의 지수 선택 4가지를 짝지으면 12개야."
			},
			{
				tag: "LIST",
				q: "다음 중 108의 약수가 아닌 수는?",
				options: [
					"24",
					"27",
					"54"
				],
				answer: 0,
				talk: "24에는 2가 세 개 필요하지만 108에는 2가 두 개뿐이야."
			},
			{
				tag: "CHECK",
				q: "약수를 작은 수부터 빠짐없이 나열한 것은?",
				options: [
					"1, 2, 3, 4, 6, 9, 12, 18, 27, 36, 54, 108",
					"1, 2, 3, 6, 9, 18, 54, 108",
					"2, 3, 4, 6, 12, 27, 108"
				],
				answer: 0,
				talk: "12개인지 세고, 양끝을 곱한 짝이 108인지 확인하면 빠진 수를 찾기 쉬워."
			}
		], [
			{
				q: "45의 약수를 모두 구하시오.",
				a: "1,3,5,9,15,45"
			},
			{
				q: "28의 약수를 모두 구하시오.",
				a: "1,2,4,7,14,28"
			},
			{
				q: "50의 약수를 모두 구하시오.",
				a: "1,2,5,10,25,50"
			}
		])
	},
	{
		term: "중1 · 1학기",
		major: "1. 소인수분해",
		middle: "소인수분해",
		minor: "거듭제곱",
		problem: evalQuestion("소인수분해 · 도전 문제 11", "1000의 약수 중 어떤 자연수의 거듭제곱으로 나타낼 수 있는 수를 모두 구하시오.", "1,4,8,25,100,125,1000", [
			{
				tag: "FACTOR",
				q: "1000의 소인수분해는?",
				options: [
					"2³×5³",
					"2²×5³",
					"10³×1"
				],
				answer: 0,
				talk: "1000=10³=(2×5)³=2³×5³이야."
			},
			{
				tag: "DIVISOR",
				q: "1000의 약수는 어떤 꼴로 만들 수 있나요?",
				options: [
					"2ᵃ×5ᵇ (a,b는 0부터 3)",
					"2ᵃ+5ᵇ",
					"2⁴×5⁴"
				],
				answer: 0,
				talk: "1000에 있는 2와 5를 각각 0개부터 3개까지 골라 곱해."
			},
			{
				tag: "SQUARE",
				q: "지수가 모두 2의 배수이면 어떤 거듭제곱이 되나요?",
				options: [
					"제곱수",
					"소수",
					"홀수"
				],
				answer: 0,
				talk: "2²×5²=(2×5)²처럼 같은 묶음을 두 번 곱한 수가 돼."
			},
			{
				tag: "CUBE",
				q: "지수가 모두 3의 배수이면 어떤 거듭제곱이 되나요?",
				options: [
					"세제곱수",
					"제곱수만 된다",
					"거듭제곱이 아니다"
				],
				answer: 0,
				talk: "2³×5³=(2×5)³처럼 같은 묶음을 세 번 곱한 수야."
			},
			{
				tag: "PICK",
				q: "다음 중 1000의 약수이면서 거듭제곱인 수는?",
				options: [
					"4, 8, 25",
					"20, 40, 50",
					"2, 5, 10"
				],
				answer: 0,
				talk: "4=2², 8=2³, 25=5²이므로 모두 거듭제곱이야."
			},
			{
				tag: "LIST",
				q: "1을 포함하여 조건에 맞는 수를 모두 모은 것은?",
				options: [
					"1, 4, 8, 25, 100, 125, 1000",
					"1, 2, 5, 10, 1000",
					"4, 8, 25, 50, 100"
				],
				answer: 0,
				talk: "각 수가 1000의 약수인지와 같은 수를 여러 번 곱한 꼴인지 두 조건을 모두 확인해."
			}
		], [
			{
				q: "64의 약수 중 거듭제곱인 수를 모두 구하시오.",
				a: "1,4,8,16,32,64"
			},
			{
				q: "225의 약수 중 제곱수인 것을 모두 구하시오.",
				a: "1,9,25,225"
			},
			{
				q: "125의 약수 중 세제곱수인 것을 모두 구하시오.",
				a: "1,125"
			}
		])
	},
	{
		term: "중1 · 1학기",
		major: "1. 소인수분해",
		middle: "소인수분해",
		minor: "최대공약수",
		problem: evalQuestion("소인수분해 · 단원 마무리 09", "세 수 2×5², 2×3²×5², 2²×3×5²의 최대공약수와 최소공배수를 차례로 구하시오.", "2×5²,2²×3²×5²", [
			{
				tag: "ALIGN",
				q: "세 수에 들어 있는 소인수 2, 3, 5를 같은 세로줄에 맞추어 보면 공통으로 있는 것은?",
				options: [
					"2 한 개와 5 두 개",
					"2 두 개와 3 두 개",
					"3 한 개와 5 한 개"
				],
				answer: 0,
				talk: "최대공약수는 세 상자에 모두 있는 소인수만 꺼내는 거야. 3은 첫 번째 수에 없어서 공통이 아니야."
			},
			{
				tag: "GCD",
				q: "공통 소인수를 곱하여 최대공약수를 나타내면?",
				options: [
					"2×5²",
					"2²×5²",
					"2×3×5"
				],
				answer: 0,
				talk: "2는 가장 적게 한 개, 5는 세 수 모두 두 개씩 있으므로 2×5²이야."
			},
			{
				tag: "COVER",
				q: "세 수를 모두 만들려면 2는 최대 몇 개까지 필요하나요?",
				options: [
					"2개",
					"1개",
					"3개"
				],
				answer: 0,
				talk: "세 번째 수에 2²이 있으므로 2가 두 개 필요해."
			},
			{
				tag: "COVER",
				q: "3과 5는 각각 최대 몇 개까지 필요하나요?",
				options: [
					"3은 2개, 5는 2개",
					"3은 1개, 5는 2개",
					"3은 2개, 5는 1개"
				],
				answer: 0,
				talk: "두 번째 수에 3², 모든 수에 5²이 있으므로 각각 두 개씩 챙겨."
			},
			{
				tag: "LCM",
				q: "필요한 소인수를 모두 곱하여 최소공배수를 나타내면?",
				options: [
					"2²×3²×5²",
					"2×3²×5²",
					"2²×3×5²"
				],
				answer: 0,
				talk: "각 소인수의 가장 많은 개수를 모으면 세 수가 모두 나누어지는 가장 작은 수가 돼."
			},
			{
				tag: "ORDER",
				q: "최대공약수, 최소공배수 순서로 쓴 것은?",
				options: [
					"2×5², 2²×3²×5²",
					"2²×3²×5², 2×5²",
					"2×3×5, 2²×3²×5²"
				],
				answer: 0,
				talk: "문제가 요구한 순서를 마지막에 다시 확인하자."
			}
		], [
			{
				q: "2²×3, 2×3²의 최대공약수와 최소공배수를 차례로 구하시오.",
				a: "2×3,2²×3²"
			},
			{
				q: "2×5, 2²×3×5의 최대공약수와 최소공배수를 차례로 구하시오.",
				a: "2×5,2²×3×5"
			},
			{
				q: "3²×7, 3×5×7의 최대공약수와 최소공배수를 차례로 구하시오.",
				a: "3×7,3²×5×7"
			}
		])
	},
	{
		term: "중1 · 1학기",
		major: "1. 소인수분해",
		middle: "소인수분해",
		minor: "최소공배수",
		problem: evalQuestion("소인수분해 · 도전 문제 12", "두 수 2×5², 2²×□×7의 최소공배수가 2⁴×5²×7일 때, □에 들어갈 수 있는 모든 자연수의 합을 구하시오.", "124", [
			{
				tag: "TARGET",
				q: "최소공배수에서 소인수 2의 지수는 얼마인가요?",
				options: [
					"4",
					"2",
					"1"
				],
				answer: 0,
				talk: "목표 식 2⁴×5²×7에서 2가 네 개 필요하다는 뜻이야."
			},
			{
				tag: "NEED",
				q: "두 번째 수의 앞에 이미 2²이 있으므로, □에는 2가 몇 개 더 필요할까요?",
				options: [
					"2개",
					"1개",
					"4개"
				],
				answer: 0,
				talk: "앞의 2²과 빈칸의 2²이 합쳐져 2⁴이 되어야 해."
			},
			{
				tag: "PRIME",
				q: "□에 2와 5 이외의 새로운 소수가 들어가도 될까요?",
				options: [
					"안 된다",
					"들어가도 된다",
					"7만 더 들어간다"
				],
				answer: 0,
				talk: "새로운 소수가 들어가면 최소공배수에도 그 소수가 나타나 목표 식과 달라져."
			},
			{
				tag: "FIVE",
				q: "□에 들어가는 5의 개수는 몇 개까지 가능할까요?",
				options: [
					"0개, 1개, 2개",
					"2개만",
					"3개까지"
				],
				answer: 0,
				talk: "첫 번째 수에 이미 5²이 있어. 빈칸에는 5를 0개부터 2개까지 넣어도 최소공배수의 5²은 변하지 않아."
			},
			{
				tag: "LIST",
				q: "따라서 □에 들어갈 수 있는 수를 모두 고르면?",
				options: [
					"4, 20, 100",
					"2, 10, 50",
					"4, 25, 100"
				],
				answer: 0,
				talk: "2²×5⁰=4, 2²×5¹=20, 2²×5²=100이야."
			},
			{
				tag: "SUM",
				q: "가능한 세 수의 합은?",
				options: [
					"124",
					"120",
					"144"
				],
				answer: 0,
				talk: "4+20+100=124. 각각 넣었을 때 최소공배수가 목표 식과 같은지도 확인해 보자."
			}
		], [
			{
				q: "2×3², 2×□×5의 최소공배수가 2³×3²×5일 때 □가 될 수 있는 수 4, 12, 36의 합을 구하시오.",
				a: "52"
			},
			{
				q: "3×5, 3×□×7의 최소공배수가 3²×5×7일 때 □가 될 수 있는 수 3, 15의 합을 구하시오.",
				a: "18"
			},
			{
				q: "2²×3, 2×□×5의 최소공배수가 2³×3×5일 때 □가 될 수 있는 수 4, 12의 합을 구하시오.",
				a: "16"
			}
		])
	},
	{
		term: "중1 · 1학기",
		major: "1. 소인수분해",
		middle: "소인수분해",
		minor: "소인수분해",
		problem: evalQuestion("소인수분해 · 학습 점검 10", "10을 인수 나무로 소인수분해하였다. 10=ㄱ×ㄴ일 때, ㄱ<ㄴ을 만족하는 ㄱ, ㄴ의 값을 차례로 구하시오.", "2,5", [
			{
				tag: "READ",
				q: "문제에서 구해야 하는 것은 무엇인가요?",
				options: [
					"ㄱ과 ㄴ에 들어갈 두 수",
					"10의 약수의 개수",
					"ㄱ과 ㄴ의 합만"
				],
				answer: 0,
				talk: "마지막 문장을 보면 ㄱ과 ㄴ의 값을 차례로 쓰라고 했어. 답칸도 두 칸이야."
			},
			{
				tag: "SPLIT",
				q: "10을 곱셈으로 만드는 인수의 짝은?",
				options: [
					"1×10, 2×5",
					"3×7, 4×6",
					"2+8, 5+5"
				],
				answer: 0,
				talk: "인수 나무는 덧셈이 아니라 곱셈으로 수를 쪼개는 그림이야."
			},
			{
				tag: "PRIME",
				q: "1×10을 인수 나무의 끝으로 쓰지 않는 까닭은?",
				options: [
					"1은 소수가 아니고 10은 더 쪼개지기 때문",
					"곱이 10이 아니기 때문",
					"두 수가 홀수이기 때문"
				],
				answer: 0,
				talk: "소인수분해 나무의 끝에는 소수만 남아야 해."
			},
			{
				tag: "CHECK",
				q: "2와 5는 각각 소수인가요?",
				options: [
					"둘 다 소수이다",
					"2만 소수이다",
					"둘 다 합성수이다"
				],
				answer: 0,
				talk: "2의 약수는 1과 2, 5의 약수는 1과 5뿐이야."
			},
			{
				tag: "ORDER",
				q: "ㄱ<ㄴ이라는 조건에 맞게 놓으면?",
				options: [
					"ㄱ=2, ㄴ=5",
					"ㄱ=5, ㄴ=2",
					"ㄱ=1, ㄴ=10"
				],
				answer: 0,
				talk: "2<5이고 2×5=10이므로 두 조건을 모두 만족해."
			}
		], [
			{
				q: "14=ㄱ×ㄴ, ㄱ<ㄴ이고 ㄱ, ㄴ이 소수일 때 두 값을 차례로 구하시오.",
				a: "2,7"
			},
			{
				q: "15=ㄱ×ㄴ, ㄱ<ㄴ이고 ㄱ, ㄴ이 소수일 때 두 값을 차례로 구하시오.",
				a: "3,5"
			},
			{
				q: "22=ㄱ×ㄴ, ㄱ<ㄴ이고 ㄱ, ㄴ이 소수일 때 두 값을 차례로 구하시오.",
				a: "2,11"
			}
		])
	},
	{
		term: "중1 · 1학기",
		major: "1. 소인수분해",
		middle: "소인수분해",
		minor: "소인수분해",
		problem: evalQuestion("소인수분해 · 단원 마무리 13", "72의 약수 중 어떤 자연수의 제곱인 수를 모두 구하시오.", "1,4,9,36", [
			{
				tag: "FACTOR",
				q: "72를 소인수분해한 것은?",
				options: [
					"2³×3²",
					"2²×3³",
					"2³×9²"
				],
				answer: 0,
				talk: "72=8×9=2³×3²야."
			},
			{
				tag: "MAKE",
				q: "72의 약수는 어떤 꼴로 만들 수 있나요?",
				options: [
					"2ᵃ×3ᵇ (a는 0~3, b는 0~2)",
					"2ᵃ+3ᵇ",
					"2⁴×3³만"
				],
				answer: 0,
				talk: "72가 가진 2와 3을 필요한 개수만큼 골라 곱하면 약수가 돼."
			},
			{
				tag: "SQUARE",
				q: "제곱수가 되려면 소인수의 지수는 어떠해야 하나요?",
				options: [
					"모두 짝수",
					"모두 홀수",
					"서로 달라야 한다"
				],
				answer: 0,
				talk: "예를 들어 2²×3²=(2×3)²처럼 모든 지수가 짝수여야 같은 묶음을 두 번 만들 수 있어."
			},
			{
				tag: "EXPONENT",
				q: "가능한 2의 지수와 3의 지수를 각각 고르면?",
				options: [
					"2는 0,2 / 3은 0,2",
					"2는 1,3 / 3은 1",
					"2는 0,1,2,3 / 3은 0,1,2"
				],
				answer: 0,
				talk: "각 범위 안에서 짝수인 지수만 고르면 돼."
			},
			{
				tag: "BUILD",
				q: "짝수 지수를 짝지어 만든 수는?",
				options: [
					"1, 4, 9, 36",
					"2, 6, 8, 18",
					"4, 8, 9, 72"
				],
				answer: 0,
				talk: "2⁰×3⁰=1, 2²=4, 3²=9, 2²×3²=36이야."
			},
			{
				tag: "VERIFY",
				q: "각 수가 72의 약수이면서 제곱수인지 확인한 것은?",
				options: [
					"1=1², 4=2², 9=3², 36=6²",
					"1, 4, 9만 제곱수이다",
					"36은 72의 약수가 아니다"
				],
				answer: 0,
				talk: "두 조건을 모두 확인하면 빠뜨리거나 잘못 고르는 일을 줄일 수 있어."
			}
		], [
			{
				q: "48의 약수 중 제곱수를 모두 구하시오.",
				a: "1,4,16"
			},
			{
				q: "90의 약수 중 제곱수를 모두 구하시오.",
				a: "1,9"
			},
			{
				q: "200의 약수 중 제곱수를 모두 구하시오.",
				a: "1,4,25,100"
			}
		])
	},
	{
		term: "중1 · 1학기",
		major: "1. 소인수분해",
		middle: "소인수분해",
		minor: "최대공약수",
		problem: evalQuestion("소인수분해 · 단원 마무리 14", "가로 84 cm, 세로 60 cm인 직사각형 종이를 남김없이 같은 크기의 가장 큰 정사각형으로 나누려고 한다. 정사각형 한 변의 길이와 필요한 정사각형의 개수를 차례로 구하시오.", "12,35", [
			{
				tag: "MEANING",
				q: "‘남김없이 같은 크기의 가장 큰 정사각형’에서 한 변의 길이는 무엇을 이용해 구할까요?",
				options: [
					"84와 60의 최대공약수",
					"84와 60의 최소공배수",
					"84와 60의 합"
				],
				answer: 0,
				talk: "한 변은 가로와 세로를 모두 정확히 나누어야 하고 그중 가장 커야 해."
			},
			{
				tag: "FACTOR",
				q: "84와 60을 소인수분해한 것은?",
				options: [
					"84=2²×3×7, 60=2²×3×5",
					"84=2×3×7, 60=2×3×5",
					"84=2²×21, 60=2²×15"
				],
				answer: 0,
				talk: "소인수만 남도록 끝까지 쪼개자."
			},
			{
				tag: "COMMON",
				q: "두 수에 공통으로 들어 있는 소인수 묶음은?",
				options: [
					"2²×3",
					"2×3",
					"2²×3×5×7"
				],
				answer: 0,
				talk: "공통으로 가진 2 두 개와 3 한 개를 꺼내면 돼."
			},
			{
				tag: "SIDE",
				q: "가장 큰 정사각형 한 변의 길이는?",
				options: [
					"12 cm",
					"24 cm",
					"6 cm"
				],
				answer: 0,
				talk: "2²×3=12이므로 한 변은 12 cm야."
			},
			{
				tag: "COUNT",
				q: "가로와 세로 방향에 각각 몇 장씩 놓이나요?",
				options: [
					"7장, 5장",
					"12장, 12장",
					"84장, 60장"
				],
				answer: 0,
				talk: "84÷12=7, 60÷12=5야. 그림으로는 가로 7칸, 세로 5칸이 돼."
			},
			{
				tag: "TOTAL",
				q: "필요한 정사각형의 전체 개수는?",
				options: [
					"7×5=35개",
					"7+5=12개",
					"12×12=144개"
				],
				answer: 0,
				talk: "가로 칸 수와 세로 칸 수를 곱하면 전체 칸 수가 돼."
			}
		], [
			{
				q: "가로 48 cm, 세로 36 cm 종이를 가장 큰 정사각형으로 나눌 때 한 변과 개수를 차례로 구하시오.",
				a: "12,12"
			},
			{
				q: "가로 90 cm, 세로 54 cm 종이를 가장 큰 정사각형으로 나눌 때 한 변과 개수를 차례로 구하시오.",
				a: "18,15"
			},
			{
				q: "가로 72 cm, 세로 48 cm 종이를 가장 큰 정사각형으로 나눌 때 한 변과 개수를 차례로 구하시오.",
				a: "24,6"
			}
		])
	}
];
var unit2Assessment = [
	{
		term: "중1 · 1학기",
		major: "2. 정수와 유리수",
		middle: "정수와 유리수",
		minor: "수직선과 절댓값",
		problem: evalQuestion("정수와 유리수 · 시험 유형 01", "네 수 -2, -3/2, 0.5, 3/4을 작은 수부터 차례로 나열하시오.", "-2,-3/2,0.5,3/4", [
			{
				tag: "FORM",
				q: "비교하기 쉽도록 0.5와 3/4을 소수로 나타내면?",
				options: [
					"0.5, 0.75",
					"0.5, 0.34",
					"0.05, 0.75"
				],
				answer: 0,
				talk: "3÷4=0.75야. 양수끼리는 이제 0.5와 0.75를 비교하면 돼."
			},
			{
				tag: "SIGN",
				q: "음수와 양수 중 수직선의 왼쪽에 있는 것은?",
				options: [
					"음수",
					"양수",
					"항상 같다"
				],
				answer: 0,
				talk: "수직선에서는 왼쪽으로 갈수록 작은 수야. 음수를 먼저 놓자."
			},
			{
				tag: "NEGATIVE",
				q: "-2와 -3/2=-1.5 중 더 작은 수는?",
				options: [
					"-2",
					"-1.5",
					"같다"
				],
				answer: 0,
				talk: "음수는 0에서 더 멀리 왼쪽에 있는 수가 더 작아. -2가 -1.5보다 왼쪽이야."
			},
			{
				tag: "POSITIVE",
				q: "0.5와 0.75 중 더 작은 수는?",
				options: [
					"0.5",
					"0.75",
					"같다"
				],
				answer: 0,
				talk: "양수끼리는 보통 크기대로 비교하면 0.5가 더 작아."
			},
			{
				tag: "LINE",
				q: "수직선 왼쪽부터 놓은 순서로 알맞은 것은?",
				options: [
					"-2, -1.5, 0.5, 0.75",
					"-1.5, -2, 0.75, 0.5",
					"0.5, 0.75, -1.5, -2"
				],
				answer: 0,
				talk: "음수 두 개를 먼저 작은 순서로, 그다음 양수 두 개를 작은 순서로 이어 붙여."
			},
			{
				tag: "ANSWER",
				q: "원래 분수 표현으로 되돌려 쓴 답은?",
				options: [
					"-2, -3/2, 0.5, 3/4",
					"-3/2, -2, 3/4, 0.5",
					"-2, 3/4, 0.5, -3/2"
				],
				answer: 0,
				talk: "비교할 때만 소수로 바꾸었으니 답에는 문제에 나온 표현을 그대로 써도 좋아."
			}
		], [
			{
				q: "-1, -5/2, 0.2, 2/3을 작은 수부터 나열하시오.",
				a: "-5/2,-1,0.2,2/3"
			},
			{
				q: "-0.5, -3/4, 1/2, 0을 작은 수부터 나열하시오.",
				a: "-3/4,-0.5,0,1/2"
			},
			{
				q: "-3, -2.5, 4/5, 0.7을 작은 수부터 나열하시오.",
				a: "-3,-2.5,0.7,4/5"
			}
		])
	},
	{
		term: "중1 · 1학기",
		major: "2. 정수와 유리수",
		middle: "정수와 유리수",
		minor: "수직선과 절댓값",
		problem: evalQuestion("정수와 유리수 · 시험 유형 02", "수직선에서 두 점 A(-4), B(6)과 같은 거리에 있는 점 P의 좌표를 구하시오.", "1", [
			{
				tag: "STORY",
				q: "A와 B에서 같은 거리에 있는 점은 선분 AB의 어디에 있나요?",
				options: [
					"한가운데",
					"A의 왼쪽",
					"B의 오른쪽"
				],
				answer: 0,
				talk: "두 친구에게서 같은 거리인 자리는 두 친구 사이의 정중앙이야."
			},
			{
				tag: "DISTANCE",
				q: "-4에서 6까지의 거리는?",
				options: [
					"10",
					"2",
					"-10"
				],
				answer: 0,
				talk: "-4에서 0까지 4칸, 0에서 6까지 6칸이므로 모두 10칸이야."
			},
			{
				tag: "HALF",
				q: "전체 거리 10의 절반은?",
				options: [
					"5",
					"10",
					"2"
				],
				answer: 0,
				talk: "정중앙까지는 전체 거리의 절반인 5칸이야."
			},
			{
				tag: "MOVE",
				q: "A(-4)에서 오른쪽으로 5칸 이동한 좌표는?",
				options: [
					"1",
					"-9",
					"5"
				],
				answer: 0,
				talk: "-4에서 오른쪽으로 4칸 가면 0, 한 칸 더 가면 1이야."
			},
			{
				tag: "CHECK",
				q: "P(1)에서 A(-4)까지의 거리는?",
				options: [
					"5",
					"3",
					"-5"
				],
				answer: 0,
				talk: "1-(-4)=5이므로 5칸 떨어져 있어."
			},
			{
				tag: "CHECK",
				q: "P(1)에서 B(6)까지도 5칸인가요?",
				options: [
					"그렇다",
					"아니다",
					"알 수 없다"
				],
				answer: 0,
				talk: "6-1=5이므로 양쪽 거리가 같아. P의 좌표는 1이야."
			}
		], [
			{
				q: "A(-6), B(4)와 같은 거리에 있는 점의 좌표를 구하시오.",
				a: "-1"
			},
			{
				q: "A(-3), B(9)와 같은 거리에 있는 점의 좌표를 구하시오.",
				a: "3"
			},
			{
				q: "A(-8), B(2)와 같은 거리에 있는 점의 좌표를 구하시오.",
				a: "-3"
			}
		])
	},
	{
		term: "중1 · 1학기",
		major: "2. 정수와 유리수",
		middle: "정수와 유리수의 계산",
		minor: "혼합 계산",
		problem: evalQuestion("정수와 유리수 · 시험 유형 03", "(-3)²-{8÷(-2)}×3+(-5)를 계산하시오.", "16", [
			{
				tag: "ORDER",
				q: "거듭제곱, 나눗셈, 곱셈, 덧셈이 섞여 있을 때 가장 먼저 계산할 것은?",
				options: [
					"거듭제곱",
					"마지막 덧셈",
					"왼쪽 괄호를 없애기"
				],
				answer: 0,
				talk: "계산 순서는 거듭제곱, 곱셈·나눗셈, 덧셈·뺄셈 순서야."
			},
			{
				tag: "POWER",
				q: "(-3)²의 값은?",
				options: [
					"9",
					"-9",
					"6"
				],
				answer: 0,
				talk: "괄호 안의 -3을 두 번 곱하면 (-3)×(-3)=9야."
			},
			{
				tag: "DIVIDE",
				q: "8÷(-2)의 값은?",
				options: [
					"-4",
					"4",
					"-6"
				],
				answer: 0,
				talk: "양수÷음수는 음수이고 8÷2=4이므로 -4야."
			},
			{
				tag: "MULTIPLY",
				q: "{-4}×3의 값은?",
				options: [
					"-12",
					"12",
					"-7"
				],
				answer: 0,
				talk: "음수×양수는 음수이므로 -12야."
			},
			{
				tag: "CHANGE",
				q: "식 9-(-12)+(-5)를 덧셈으로 고쳐 쓰면?",
				options: [
					"9+12-5",
					"9-12-5",
					"9+12+5"
				],
				answer: 0,
				talk: "음수를 빼면 양수를 더하고, 음수를 더하면 양수를 빼는 것과 같아."
			},
			{
				tag: "CALC",
				q: "9+12-5의 값은?",
				options: [
					"16",
					"26",
					"-8"
				],
				answer: 0,
				talk: "9+12=21, 21-5=16이야. 한 단계씩 계산하면 부호 실수를 줄일 수 있어."
			}
		], [
			{
				q: "(-4)²-{6÷(-3)}×5+(-2)를 계산하시오.",
				a: "24"
			},
			{
				q: "(-2)³-12÷(-3)+5를 계산하시오.",
				a: "1"
			},
			{
				q: "(-5)²+{9÷(-3)}×4-1을 계산하시오.",
				a: "12"
			}
		])
	},
	{
		term: "중1 · 1학기",
		major: "2. 정수와 유리수",
		middle: "정수와 유리수",
		minor: "수직선과 절댓값",
		problem: evalQuestion("정수와 유리수 · 단원 마무리 04", "절댓값이 5보다 작거나 같은 정수를 모두 구하고, 그 개수를 구하시오.", "-5,-4,-3,-2,-1,0,1,2,3,4,5,11", [
			{
				tag: "MEANING",
				q: "절댓값은 수직선에서 무엇을 뜻하나요?",
				options: [
					"0에서 떨어진 거리",
					"수의 부호",
					"두 수의 합"
				],
				answer: 0,
				talk: "절댓값은 0을 출발점으로 몇 칸 떨어졌는지를 나타내므로 음수가 될 수 없어."
			},
			{
				tag: "RANGE",
				q: "0에서 거리가 5보다 작거나 같은 점은 어디에 있나요?",
				options: [
					"-5와 5 사이, 양 끝 포함",
					"-5보다 왼쪽",
					"5보다 오른쪽"
				],
				answer: 0,
				talk: "왼쪽으로 5칸인 -5부터 오른쪽으로 5칸인 5까지야."
			},
			{
				tag: "INTEGER",
				q: "그 구간에 있는 정수의 시작과 끝은?",
				options: [
					"-5와 5",
					"-4와 4",
					"0과 5"
				],
				answer: 0,
				talk: "‘작거나 같다’이므로 거리가 정확히 5인 -5와 5도 포함해."
			},
			{
				tag: "LIST",
				q: "조건을 만족하는 정수를 빠짐없이 나열한 것은?",
				options: [
					"-5,-4,-3,-2,-1,0,1,2,3,4,5",
					"-5,-4,-3,-2,-1,1,2,3,4,5",
					"-4,-3,-2,-1,0,1,2,3,4"
				],
				answer: 0,
				talk: "음수 다섯 개, 0, 양수 다섯 개를 차례로 적자."
			},
			{
				tag: "COUNT",
				q: "나열한 정수는 모두 몇 개인가요?",
				options: [
					"11개",
					"10개",
					"12개"
				],
				answer: 0,
				talk: "5+1+5=11개야. 0을 빠뜨리지 않았는지 확인하자."
			},
			{
				tag: "ORDER",
				q: "문제에서 요구한 답의 순서는?",
				options: [
					"정수들을 먼저 쓰고 개수를 쓴다",
					"개수만 쓴다",
					"양수만 쓰고 개수를 쓴다"
				],
				answer: 0,
				talk: "여러 정수와 개수를 모두 물었으므로 답칸에 차례대로 입력해."
			}
		], [
			{
				q: "절댓값이 3보다 작거나 같은 정수를 모두 쓰고 개수를 구하시오.",
				a: "-3,-2,-1,0,1,2,3,7"
			},
			{
				q: "절댓값이 2보다 작은 정수를 모두 쓰고 개수를 구하시오.",
				a: "-1,0,1,3"
			},
			{
				q: "절댓값이 4보다 작거나 같은 정수 중 짝수를 모두 쓰고 개수를 구하시오.",
				a: "-4,-2,0,2,4,5"
			}
		])
	},
	{
		term: "중1 · 1학기",
		major: "2. 정수와 유리수",
		middle: "정수와 유리수의 계산",
		minor: "덧셈과 뺄셈",
		problem: evalQuestion("정수와 유리수 · 단원 마무리 05", "아침 기온이 -4℃였다. 낮에는 아침보다 9℃ 높아졌고, 밤에는 낮보다 7℃ 낮아졌다. 밤의 기온을 구하시오.", "-2", [
			{
				tag: "START",
				q: "처음 아침 기온은 수로 얼마인가요?",
				options: [
					"-4",
					"4",
					"0"
				],
				answer: 0,
				talk: "영하 4℃는 0보다 4만큼 낮으므로 -4로 나타내."
			},
			{
				tag: "RISE",
				q: "‘9℃ 높아졌다’는 어떤 계산인가요?",
				options: [
					"+9",
					"-9",
					"×9"
				],
				answer: 0,
				talk: "기온이 올라가면 수직선에서 오른쪽으로 이동하므로 9를 더해."
			},
			{
				tag: "NOON",
				q: "낮의 기온을 구하는 식과 값은?",
				options: [
					"-4+9=5",
					"-4-9=-13",
					"4+9=13"
				],
				answer: 0,
				talk: "-4에서 오른쪽으로 9칸 가면 5야."
			},
			{
				tag: "FALL",
				q: "‘낮보다 7℃ 낮아졌다’는 어떤 계산인가요?",
				options: [
					"-7",
					"+7",
					"÷7"
				],
				answer: 0,
				talk: "낮아지면 수직선에서 왼쪽으로 이동하므로 7을 빼."
			},
			{
				tag: "NIGHT",
				q: "밤의 기온을 구하는 식은?",
				options: [
					"5-7",
					"5+7",
					"-4-7"
				],
				answer: 0,
				talk: "밤은 낮의 기온 5℃를 기준으로 7℃ 내려간 값이야."
			},
			{
				tag: "ANSWER",
				q: "5-7을 계산하고 단위를 붙이면?",
				options: [
					"-2℃",
					"2℃",
					"-12℃"
				],
				answer: 0,
				talk: "5에서 왼쪽으로 7칸 가면 -2이므로 밤의 기온은 -2℃야."
			}
		], [
			{
				q: "아침 -3℃에서 낮에 8℃ 오르고 밤에 6℃ 내렸다. 밤 기온을 구하시오.",
				a: "-1"
			},
			{
				q: "아침 -7℃에서 낮에 10℃ 오르고 밤에 4℃ 내렸다. 밤 기온을 구하시오.",
				a: "-1"
			},
			{
				q: "아침 2℃에서 낮에 5℃ 오르고 밤에 9℃ 내렸다. 밤 기온을 구하시오.",
				a: "-2"
			}
		])
	},
	{
		term: "중1 · 1학기",
		major: "2. 정수와 유리수",
		middle: "정수와 유리수의 계산",
		minor: "혼합 계산",
		problem: evalQuestion("정수와 유리수 · 단원 마무리 06", "{(-2)³×3-6}÷(-5)+1/2를 계산하시오.", "13/2", [
			{
				tag: "ORDER",
				q: "괄호 안에서 가장 먼저 계산할 것은?",
				options: [
					"(-2)³",
					"3-6",
					"(-5)+1/2"
				],
				answer: 0,
				talk: "거듭제곱을 먼저 계산한 뒤 곱셈, 뺄셈 순서로 가자."
			},
			{
				tag: "POWER",
				q: "(-2)³의 값은?",
				options: [
					"-8",
					"8",
					"-6"
				],
				answer: 0,
				talk: "(-2)×(-2)×(-2)는 음수를 세 번 곱하므로 -8이야."
			},
			{
				tag: "BRACE",
				q: "괄호 안 {-8×3-6}의 값은?",
				options: [
					"-30",
					"-18",
					"30"
				],
				answer: 0,
				talk: "-8×3=-24이고, -24-6=-30이야."
			},
			{
				tag: "DIVIDE",
				q: "(-30)÷(-5)의 값은?",
				options: [
					"6",
					"-6",
					"5"
				],
				answer: 0,
				talk: "음수÷음수는 양수이고 30÷5=6이야."
			},
			{
				tag: "FRACTION",
				q: "6+1/2를 하나의 분수로 나타내면?",
				options: [
					"13/2",
					"7/2",
					"12/2"
				],
				answer: 0,
				talk: "6=12/2이므로 12/2+1/2=13/2야."
			},
			{
				tag: "CHECK",
				q: "계산 순서를 한 줄로 바르게 나타낸 것은?",
				options: [
					"{(-8)×3-6}÷(-5)+1/2=(-30)÷(-5)+1/2=13/2",
					"(-2)³×{3-6÷(-5)}+1/2",
					"(-8)×3-{6÷(-5)+1/2}"
				],
				answer: 0,
				talk: "괄호의 범위와 나눗셈의 대상을 원래 식과 같게 유지했는지 확인하자."
			}
		], [
			{
				q: "{(-3)²×2-3}÷5+1/5를 계산하시오.",
				a: "16/5"
			},
			{
				q: "{(-2)⁴-4}÷6+1/2를 계산하시오.",
				a: "5/2"
			},
			{
				q: "{(-5)×3+3}÷(-4)-1/2를 계산하시오.",
				a: "5/2"
			}
		])
	}
];
var unit3Assessment = [
	{
		term: "중1 · 1학기",
		major: "3. 문자와 식",
		middle: "문자의 사용과 식",
		minor: "식의 값",
		problem: evalQuestion("문자와 식 · 시험 유형 01", "x=-2, a=3일 때, 2x²-3a의 값을 구하시오.", "-1", [
			{
				tag: "SUBSTITUTE",
				q: "식의 x 자리에 -2를 넣을 때 알맞게 쓴 것은?",
				options: [
					"2×(-2)²-3a",
					"2×-2²-3a",
					"2×2²-3a"
				],
				answer: 0,
				talk: "음수를 문자 자리에 넣을 때는 괄호로 묶어야 부호까지 한 수로 보여."
			},
			{
				tag: "SUBSTITUTE",
				q: "a=3까지 넣은 식은?",
				options: [
					"2×(-2)²-3×3",
					"2×(-2)²-3+3",
					"2×(-2)²-a×3"
				],
				answer: 0,
				talk: "문자 a만 숫자 3으로 바꾸고, 앞의 3은 곱하기로 읽어."
			},
			{
				tag: "POWER",
				q: "(-2)²의 값은?",
				options: [
					"4",
					"-4",
					"-2"
				],
				answer: 0,
				talk: "(-2)×(-2)=4야. 괄호가 있으므로 음수 전체를 두 번 곱해."
			},
			{
				tag: "MULTIPLY",
				q: "2×4와 3×3을 각각 계산하면?",
				options: [
					"8과 9",
					"6과 9",
					"8과 6"
				],
				answer: 0,
				talk: "거듭제곱을 먼저 계산한 다음 곱셈을 계산해."
			},
			{
				tag: "CALC",
				q: "남은 계산 8-9의 값은?",
				options: [
					"-1",
					"1",
					"17"
				],
				answer: 0,
				talk: "8보다 9가 하나 더 크므로 결과는 -1이야."
			},
			{
				tag: "CHECK",
				q: "대입부터 계산까지 바른 흐름은?",
				options: [
					"2(-2)²-3(3)=8-9=-1",
					"2(-2²)-3+3=-8",
					"2×2²-3×3=1"
				],
				answer: 0,
				talk: "문자마다 주어진 수를 정확히 넣고 계산 순서를 지켰는지 확인하자."
			}
		], [
			{
				q: "x=-3, a=2일 때 x²+4a의 값을 구하시오.",
				a: "17"
			},
			{
				q: "x=2, y=-1일 때 3x²+2y의 값을 구하시오.",
				a: "10"
			},
			{
				q: "a=-2, b=5일 때 2a²-b의 값을 구하시오.",
				a: "3"
			}
		])
	},
	{
		term: "중1 · 1학기",
		major: "3. 문자와 식",
		middle: "일차식의 계산",
		minor: "일차식의 덧셈·뺄셈",
		problem: evalQuestion("문자와 식 · 시험 유형 02", "3(2x-1)-2(x+4)를 간단히 하시오.", "4x-11", [
			{
				tag: "DISTRIBUTE",
				q: "3(2x-1)에서 3을 괄호 안 두 항에 곱하면?",
				options: [
					"6x-3",
					"6x-1",
					"5x-3"
				],
				answer: 0,
				talk: "괄호 앞의 3을 2x와 -1에 각각 한 번씩 곱해."
			},
			{
				tag: "SIGN",
				q: "-2(x+4)를 전개할 때 알맞은 것은?",
				options: [
					"-2x-8",
					"-2x+8",
					"2x-8"
				],
				answer: 0,
				talk: "-2를 x와 +4에 모두 곱하면 -2x와 -8이 돼."
			},
			{
				tag: "JOIN",
				q: "두 괄호를 모두 풀어 쓴 식은?",
				options: [
					"6x-3-2x-8",
					"6x-3+2x+8",
					"6x-2x+5"
				],
				answer: 0,
				talk: "원래 식 사이의 빼기 부호까지 포함해 항을 차례로 적자."
			},
			{
				tag: "LIKE",
				q: "x항 6x와 -2x를 계산하면?",
				options: [
					"4x",
					"8x",
					"4"
				],
				answer: 0,
				talk: "x라는 같은 묶음이므로 계수 6-2를 계산해 4x야."
			},
			{
				tag: "NUMBER",
				q: "상수항 -3과 -8을 계산하면?",
				options: [
					"-11",
					"5",
					"11"
				],
				answer: 0,
				talk: "음수 두 개를 더하면 절댓값을 더하고 음수 부호를 붙여 -11이야."
			},
			{
				tag: "ANSWER",
				q: "x항과 상수항을 이어 쓴 답은?",
				options: [
					"4x-11",
					"4x+11",
					"8x-5"
				],
				answer: 0,
				talk: "종류가 다른 x항과 상수항은 더 합치지 않고 4x-11로 적어."
			}
		], [
			{
				q: "2(3x+1)-4(x-2)를 간단히 하시오.",
				a: "2x+10"
			},
			{
				q: "-3(2x-5)+(x+4)를 간단히 하시오.",
				a: "-5x+19"
			},
			{
				q: "5(x-2)-2(2x+3)를 간단히 하시오.",
				a: "x-16"
			}
		])
	},
	{
		term: "중1 · 1학기",
		major: "3. 문자와 식",
		middle: "일차방정식",
		minor: "일차방정식의 풀이와 활용",
		problem: evalQuestion("문자와 식 · 시험 유형 03", "연속하는 세 자연수의 합이 51일 때, 가장 작은 수를 구하시오.", "16", [
			{
				tag: "UNKNOWN",
				q: "가장 작은 수를 x라고 하면 다음 두 수는?",
				options: [
					"x+1, x+2",
					"2x, 3x",
					"x-1, x-2"
				],
				answer: 0,
				talk: "연속하는 수는 1씩 커지므로 x 다음은 x+1, 그다음은 x+2야."
			},
			{
				tag: "BUILD",
				q: "세 수의 합이 51이라는 문장을 식으로 나타내면?",
				options: [
					"x+(x+1)+(x+2)=51",
					"x(x+1)(x+2)=51",
					"x+x+1+x+2"
				],
				answer: 0,
				talk: "‘합’은 더하기, ‘51이다’는 등호로 연결해."
			},
			{
				tag: "SIMPLIFY",
				q: "왼쪽 식을 동류항끼리 정리하면?",
				options: [
					"3x+3=51",
					"3x+2=51",
					"x+3=51"
				],
				answer: 0,
				talk: "x가 세 개여서 3x, 숫자 1과 2를 더해 3이야."
			},
			{
				tag: "UNDO",
				q: "3x+3=51에서 3x만 남기려면 양변에서 무엇을 할까요?",
				options: [
					"3을 뺀다",
					"3을 더한다",
					"3으로 나눈다"
				],
				answer: 0,
				talk: "왼쪽에 더해진 3을 없애려면 양쪽에서 같은 3을 빼."
			},
			{
				tag: "DIVIDE",
				q: "3x=48에서 x의 값은?",
				options: [
					"16",
					"45",
					"144"
				],
				answer: 0,
				talk: "x가 세 묶음이고 합이 48이므로 48÷3=16이야."
			},
			{
				tag: "CHECK",
				q: "구한 세 수를 더해 확인하면?",
				options: [
					"16+17+18=51",
					"15+16+17=48",
					"16+18+20=54"
				],
				answer: 0,
				talk: "연속하는지와 합이 51인지 모두 확인했으므로 가장 작은 수는 16이야."
			}
		], [
			{
				q: "연속하는 세 자연수의 합이 72일 때 가장 작은 수를 구하시오.",
				a: "23"
			},
			{
				q: "연속하는 세 홀수의 합이 63일 때 가장 작은 수를 구하시오.",
				a: "19"
			},
			{
				q: "연속하는 세 짝수의 합이 54일 때 가장 작은 수를 구하시오.",
				a: "16"
			}
		])
	},
	{
		term: "중1 · 1학기",
		major: "3. 문자와 식",
		middle: "문자의 사용과 식",
		minor: "문자의 사용",
		problem: evalQuestion("문자와 식 · 단원 마무리 04", "한 변의 길이가 x cm인 정사각형에서 가로는 3 cm 늘이고 세로는 2 cm 줄인 직사각형을 만들었다. 이 직사각형의 넓이를 식으로 나타내시오.", "(x+3)(x-2)", [
			{
				tag: "DRAW",
				q: "처음 정사각형의 가로와 세로는 각각 얼마인가요?",
				options: [
					"x cm, x cm",
					"3 cm, 2 cm",
					"x+3 cm, x-2 cm"
				],
				answer: 0,
				talk: "정사각형은 네 변의 길이가 같으므로 가로와 세로가 모두 x cm야."
			},
			{
				tag: "WIDTH",
				q: "가로를 3 cm 늘인 뒤의 길이는?",
				options: [
					"x+3",
					"3x",
					"x-3"
				],
				answer: 0,
				talk: "‘3 cm 늘인다’는 원래 길이 x에 3을 더한다는 뜻이야."
			},
			{
				tag: "HEIGHT",
				q: "세로를 2 cm 줄인 뒤의 길이는?",
				options: [
					"x-2",
					"2x",
					"x+2"
				],
				answer: 0,
				talk: "‘2 cm 줄인다’는 원래 길이 x에서 2를 뺀다는 뜻이야."
			},
			{
				tag: "FORMULA",
				q: "직사각형의 넓이를 구하는 방법은?",
				options: [
					"가로×세로",
					"가로+세로",
					"2×가로+2×세로"
				],
				answer: 0,
				talk: "넓이는 가로 길이와 세로 길이를 곱해."
			},
			{
				tag: "BUILD",
				q: "두 길이를 넓이 공식에 넣은 식은?",
				options: [
					"(x+3)(x-2)",
					"(x+3)+(x-2)",
					"x+3x-2"
				],
				answer: 0,
				talk: "가로와 세로가 각각 두 항이므로 괄호로 묶어 곱해."
			},
			{
				tag: "CHECK",
				q: "x=5일 때 실제 길이와 넓이로 확인하면?",
				options: [
					"8×3=24",
					"5×5=25",
					"2×3=6"
				],
				answer: 0,
				talk: "x=5이면 가로 8, 세로 3이므로 식의 뜻과 그림이 맞아."
			}
		], [
			{
				q: "한 변이 x cm인 정사각형의 가로를 4 cm 늘이고 세로를 1 cm 줄였다. 넓이를 식으로 나타내시오.",
				a: "(x+4)(x-1)"
			},
			{
				q: "가로 x cm, 세로 y cm인 직사각형의 가로를 2 cm 줄이고 세로를 5 cm 늘였다. 넓이를 나타내시오.",
				a: "(x-2)(y+5)"
			},
			{
				q: "한 변이 a cm인 정사각형의 가로와 세로를 각각 3 cm 늘였다. 넓이를 나타내시오.",
				a: "(a+3)²"
			}
		])
	},
	{
		term: "중1 · 1학기",
		major: "3. 문자와 식",
		middle: "일차방정식",
		minor: "등식의 성질",
		problem: evalQuestion("문자와 식 · 단원 마무리 05", "방정식 ax-6=2x+8의 해가 x=7일 때, 상수 a의 값을 구하시오.", "4", [
			{
				tag: "MEANING",
				q: "‘해가 x=7’이라는 말은 무엇을 뜻하나요?",
				options: [
					"x에 7을 넣으면 양변이 같다",
					"a에 7을 넣는다",
					"x와 a가 모두 7이다"
				],
				answer: 0,
				talk: "방정식의 해는 x 자리에 넣었을 때 등식을 참이 되게 하는 값이야."
			},
			{
				tag: "LEFT",
				q: "왼쪽 ax-6에 x=7을 넣으면?",
				options: [
					"7a-6",
					"a-42",
					"7a+6"
				],
				answer: 0,
				talk: "a×7은 수를 앞에 써 7a로 나타내."
			},
			{
				tag: "RIGHT",
				q: "오른쪽 2x+8에 x=7을 넣으면?",
				options: [
					"22",
					"15",
					"28"
				],
				answer: 0,
				talk: "2×7+8=14+8=22야."
			},
			{
				tag: "EQUATION",
				q: "양변이 같다는 조건으로 만든 a의 방정식은?",
				options: [
					"7a-6=22",
					"7a+6=22",
					"a-6=2a+8"
				],
				answer: 0,
				talk: "x=7을 넣은 왼쪽과 오른쪽을 등호로 연결해."
			},
			{
				tag: "UNDO",
				q: "7a-6=22에서 7a의 값은?",
				options: [
					"28",
					"16",
					"154"
				],
				answer: 0,
				talk: "양변에 6을 더하면 7a=28이야."
			},
			{
				tag: "DIVIDE",
				q: "7a=28에서 a의 값은?",
				options: [
					"4",
					"21",
					"196"
				],
				answer: 0,
				talk: "양변을 7로 나누면 a=4야. 원래 식에 넣어 양변이 22인지 확인하자."
			}
		], [
			{
				q: "방정식 ax+3=2x+15의 해가 x=4일 때 a를 구하시오.",
				a: "5"
			},
			{
				q: "방정식 3x-a=x+8의 해가 x=6일 때 a를 구하시오.",
				a: "4"
			},
			{
				q: "방정식 2ax-5=3x+7의 해가 x=4일 때 a를 구하시오.",
				a: "3"
			}
		])
	},
	{
		term: "중1 · 1학기",
		major: "3. 문자와 식",
		middle: "일차방정식",
		minor: "일차방정식의 풀이와 활용",
		problem: evalQuestion("문자와 식 · 단원 마무리 06", "어떤 수에 4를 곱한 뒤 7을 빼야 할 것을 잘못하여 4로 나눈 뒤 7을 더했더니 10이 되었다. 바르게 계산한 값을 구하시오.", "41", [
			{
				tag: "UNKNOWN",
				q: "어떤 수를 x라고 하면 잘못 계산한 첫 단계 ‘4로 나눈다’는?",
				options: [
					"x/4",
					"4x",
					"x-4"
				],
				answer: 0,
				talk: "어떤 수를 4로 나눈 몫은 x÷4=x/4야."
			},
			{
				tag: "WRONG",
				q: "잘못 계산한 전체 과정을 식으로 나타내면?",
				options: [
					"x/4+7=10",
					"4x-7=10",
					"x/(4+7)=10"
				],
				answer: 0,
				talk: "4로 나눈 뒤 7을 더한 결과가 10이라는 순서대로 식을 세워."
			},
			{
				tag: "UNDO",
				q: "x/4+7=10에서 x/4의 값은?",
				options: [
					"3",
					"17",
					"40"
				],
				answer: 0,
				talk: "양변에서 7을 빼면 x/4=3이야."
			},
			{
				tag: "FIND",
				q: "x/4=3에서 원래 어떤 수 x는?",
				options: [
					"12",
					"3/4",
					"7"
				],
				answer: 0,
				talk: "네 묶음 중 한 묶음이 3이므로 x=3×4=12야."
			},
			{
				tag: "RIGHT",
				q: "바른 계산 ‘4를 곱한 뒤 7을 뺀다’를 식으로 나타내면?",
				options: [
					"4x-7",
					"x/4+7",
					"4(x-7)"
				],
				answer: 0,
				talk: "곱하기 4를 먼저 하고 그 결과에서 7을 빼."
			},
			{
				tag: "CALC",
				q: "x=12를 바른 식 4x-7에 넣은 값은?",
				options: [
					"41",
					"55",
					"20"
				],
				answer: 0,
				talk: "4×12-7=48-7=41이야. 잘못 계산한 값 10을 답으로 쓰지 않도록 조심하자."
			}
		], [
			{
				q: "어떤 수에 3을 곱하고 5를 더해야 할 것을 3으로 나누고 5를 빼서 1이 되었다. 바른 값을 구하시오.",
				a: "59"
			},
			{
				q: "어떤 수에 2를 곱하고 4를 빼야 할 것을 2로 나누고 4를 더해 9가 되었다. 바른 값을 구하시오.",
				a: "16"
			},
			{
				q: "어떤 수에서 6을 뺀 뒤 5를 곱해야 할 것을 6을 더한 뒤 5로 나누어 4가 되었다. 바른 값을 구하시오.",
				a: "40"
			}
		])
	}
];
var unit4Assessment = [
	{
		term: "중1 · 1학기",
		major: "4. 좌표평면과 그래프",
		middle: "좌표평면과 그래프",
		minor: "순서쌍과 좌표",
		problem: evalQuestion("좌표평면과 그래프 · 단원 마무리 01", "좌표평면 위의 두 점 A(-3, 4), B(5, -2)를 이은 선분 AB의 중점 M의 좌표를 구하시오.", "1,1", [
			{
				tag: "READ",
				q: "점 A와 B의 x좌표를 차례로 읽으면?",
				options: [
					"-3, 5",
					"4, -2",
					"-3, -2"
				],
				answer: 0,
				talk: "좌표는 (x좌표, y좌표) 순서이므로 각 점의 첫 번째 수를 읽어."
			},
			{
				tag: "MIDX",
				q: "중점의 x좌표는 두 x좌표의 평균이므로 계산식은?",
				options: [
					"(-3+5)÷2",
					"(-3-5)÷2",
					"-3+5"
				],
				answer: 0,
				talk: "두 점의 한가운데 좌표는 두 좌표를 더한 뒤 2로 나누어 구해."
			},
			{
				tag: "MIDX",
				q: "(-3+5)÷2의 값은?",
				options: [
					"1",
					"2",
					"-1"
				],
				answer: 0,
				talk: "-3+5=2이고 2÷2=1이야."
			},
			{
				tag: "MIDY",
				q: "중점의 y좌표를 구하는 계산식은?",
				options: [
					"(4+(-2))÷2",
					"(4-(-2))÷2",
					"4+(-2)"
				],
				answer: 0,
				talk: "y좌표도 같은 방법으로 4와 -2의 평균을 구해."
			},
			{
				tag: "MIDY",
				q: "(4+(-2))÷2의 값은?",
				options: [
					"1",
					"3",
					"-1"
				],
				answer: 0,
				talk: "4+(-2)=2이고 2÷2=1이야."
			},
			{
				tag: "ANSWER",
				q: "x좌표와 y좌표를 순서대로 쓴 중점 M의 좌표는?",
				options: [
					"(1, 1)",
					"(1, -1)",
					"(-1, 1)"
				],
				answer: 0,
				talk: "좌표는 반드시 (x, y) 순서로 써서 M(1,1)이야."
			}
		], [
			{
				q: "A(-5, 3), B(3, 7)의 중점 좌표를 구하시오.",
				a: "-1,5"
			},
			{
				q: "A(2, -4), B(8, 6)의 중점 좌표를 구하시오.",
				a: "5,1"
			},
			{
				q: "A(-6, -2), B(4, 8)의 중점 좌표를 구하시오.",
				a: "-1,3"
			}
		])
	},
	{
		term: "중1 · 1학기",
		major: "4. 좌표평면과 그래프",
		middle: "정비례와 반비례",
		minor: "정비례 관계와 그래프",
		problem: evalQuestion("좌표평면과 그래프 · 단원 마무리 02", "정비례 관계 y=ax의 그래프가 두 점 (2, 6), (k, 15)를 지날 때, 상수 a와 k의 값을 차례로 구하시오.", "3,5", [
			{
				tag: "FORM",
				q: "정비례 관계를 나타내는 식은?",
				options: [
					"y=ax",
					"y=a/x",
					"y=ax+b"
				],
				answer: 0,
				talk: "정비례는 x에 일정한 수 a를 곱해 y가 되는 y=ax 꼴이야."
			},
			{
				tag: "POINT",
				q: "점 (2, 6)을 y=ax에 대입한 식은?",
				options: [
					"6=2a",
					"2=6a",
					"6=a+2"
				],
				answer: 0,
				talk: "좌표 (2,6)은 x=2, y=6이라는 뜻이야."
			},
			{
				tag: "COEFFICIENT",
				q: "6=2a에서 a의 값은?",
				options: [
					"3",
					"4",
					"12"
				],
				answer: 0,
				talk: "양변을 2로 나누면 a=3이야."
			},
			{
				tag: "NEW",
				q: "a=3이므로 점 (k,15)를 식에 넣으면?",
				options: [
					"15=3k",
					"k=45",
					"15=k+3"
				],
				answer: 0,
				talk: "y=3x에서 x 자리에 k, y 자리에 15를 넣어."
			},
			{
				tag: "SOLVE",
				q: "15=3k에서 k의 값은?",
				options: [
					"5",
					"12",
					"45"
				],
				answer: 0,
				talk: "양변을 3으로 나누면 k=5야."
			},
			{
				tag: "CHECK",
				q: "a=3, k=5일 때 두 점이 모두 y=3x를 만족하나요?",
				options: [
					"둘 다 만족한다",
					"첫 점만 만족한다",
					"둘째 점만 만족한다"
				],
				answer: 0,
				talk: "6=3×2이고 15=3×5이므로 두 점이 모두 같은 그래프 위에 있어."
			}
		], [
			{
				q: "y=ax가 (3,12), (k,20)을 지날 때 a와 k를 구하시오.",
				a: "4,5"
			},
			{
				q: "y=ax가 (-2,6), (k,-15)를 지날 때 a와 k를 구하시오.",
				a: "-3,5"
			},
			{
				q: "y=ax가 (4,-8), (k,14)를 지날 때 a와 k를 구하시오.",
				a: "-2,-7"
			}
		])
	},
	{
		term: "중1 · 1학기",
		major: "4. 좌표평면과 그래프",
		middle: "정비례와 반비례",
		minor: "반비례 관계와 그래프",
		problem: evalQuestion("좌표평면과 그래프 · 단원 마무리 03", "반비례 관계 y=a/x의 그래프가 점 (-4, 6)을 지난다. 이 그래프 위의 점 (k, -8)에 대하여 a와 k의 값을 차례로 구하시오.", "-24,3", [
			{
				tag: "FORM",
				q: "반비례 관계 y=a/x에서 양변에 x를 곱하면 a는 어떤 식으로 구할 수 있나요?",
				options: [
					"a=xy",
					"a=x+y",
					"a=y/x"
				],
				answer: 0,
				talk: "y=a/x의 양변에 x를 곱하면 xy=a가 되어 x와 y의 곱이 항상 같아."
			},
			{
				tag: "POINT",
				q: "점 (-4,6)을 이용하여 a를 구하는 식은?",
				options: [
					"a=(-4)×6",
					"a=(-4)+6",
					"a=6÷(-4)"
				],
				answer: 0,
				talk: "그래프 위 점의 x좌표와 y좌표를 곱해."
			},
			{
				tag: "VALUE",
				q: "(-4)×6을 계산한 a의 값은?",
				options: [
					"-24",
					"24",
					"-10"
				],
				answer: 0,
				talk: "음수와 양수의 곱은 음수이므로 a=-24야."
			},
			{
				tag: "NEW",
				q: "점 (k,-8)도 같은 그래프 위에 있으므로 성립하는 식은?",
				options: [
					"k×(-8)=-24",
					"k+(-8)=-24",
					"-8=-24k"
				],
				answer: 0,
				talk: "같은 반비례 그래프에서는 모든 점의 xy 값이 a로 같아."
			},
			{
				tag: "SOLVE",
				q: "-8k=-24에서 k의 값은?",
				options: [
					"3",
					"-3",
					"16"
				],
				answer: 0,
				talk: "양변을 -8로 나누면 k=3이야."
			},
			{
				tag: "CHECK",
				q: "(3,-8)의 x좌표와 y좌표를 곱해 확인하면?",
				options: [
					"3×(-8)=-24",
					"3+(-8)=-5",
					"3×8=24"
				],
				answer: 0,
				talk: "곱이 a=-24와 같으므로 구한 점은 그래프 위에 있어."
			}
		], [
			{
				q: "y=a/x가 (5,-4), (k,10)을 지날 때 a와 k를 구하시오.",
				a: "-20,-2"
			},
			{
				q: "y=a/x가 (-3,-6), (k,9)을 지날 때 a와 k를 구하시오.",
				a: "18,2"
			},
			{
				q: "y=a/x가 (8,3), (k,-6)을 지날 때 a와 k를 구하시오.",
				a: "24,-4"
			}
		])
	}
];
var unit5Assessment = [
	{
		term: "중1 · 2학기",
		major: "5. 기본 도형",
		middle: "기본 도형",
		minor: "평행선의 성질",
		problem: evalQuestion("기본 도형 · 단원 마무리 01", "서로 평행한 두 직선 l, m을 한 직선이 가로지른다. 한 엇각의 크기가 68°일 때, 그 각과 이웃한 각의 크기와 반대쪽 엇각의 크기를 차례로 구하시오.", "112,68", [
			{
				tag: "READ",
				q: "평행한 두 직선에서 엇각의 크기는 어떤 관계인가요?",
				options: [
					"서로 같다",
					"합이 90°이다",
					"항상 다르다"
				],
				answer: 0,
				talk: "평행선을 한 직선이 가로지를 때 서로 엇갈린 위치의 엇각은 크기가 같아."
			},
			{
				tag: "VERTICAL",
				q: "68°인 각과 마주 보는 맞꼭지각의 크기는?",
				options: [
					"68°",
					"112°",
					"22°"
				],
				answer: 0,
				talk: "두 직선이 만날 때 마주 보는 맞꼭지각의 크기는 같아."
			},
			{
				tag: "LINEAR",
				q: "68°인 각과 이웃하며 일직선을 이루는 두 각의 합은?",
				options: [
					"180°",
					"90°",
					"360°"
				],
				answer: 0,
				talk: "한 직선 위에서 나란히 붙은 두 각은 평각을 이루므로 합이 180°야."
			},
			{
				tag: "CALC",
				q: "68°와 이웃한 각의 크기를 구하는 식은?",
				options: [
					"180°-68°",
					"90°-68°",
					"180°+68°"
				],
				answer: 0,
				talk: "두 각의 합이 180°이므로 알려진 각을 빼."
			},
			{
				tag: "CALC",
				q: "180°-68°의 값은?",
				options: [
					"112°",
					"122°",
					"102°"
				],
				answer: 0,
				talk: "180-68=112이므로 이웃한 각은 112°야."
			},
			{
				tag: "ORDER",
				q: "이웃한 각, 반대쪽 엇각 순서로 쓴 것은?",
				options: [
					"112°, 68°",
					"68°, 112°",
					"112°, 112°"
				],
				answer: 0,
				talk: "문제에서 요구한 순서를 다시 읽고 두 값을 차례로 써."
			}
		], [
			{
				q: "평행선에서 한 엇각이 54°일 때 이웃한 각과 반대쪽 엇각을 구하시오.",
				a: "126,54"
			},
			{
				q: "평행선에서 한 엇각이 125°일 때 이웃한 각과 반대쪽 엇각을 구하시오.",
				a: "55,125"
			},
			{
				q: "평행선에서 한 엇각이 37°일 때 이웃한 각과 반대쪽 엇각을 구하시오.",
				a: "143,37"
			}
		])
	},
	{
		term: "중1 · 2학기",
		major: "5. 기본 도형",
		middle: "작도와 합동",
		minor: "삼각형의 작도",
		problem: evalQuestion("기본 도형 · 단원 마무리 02", "세 선분의 길이가 각각 4 cm, 7 cm, x cm일 때 삼각형을 만들 수 있는 자연수 x의 최솟값과 최댓값을 차례로 구하시오.", "4,10", [
			{
				tag: "RULE",
				q: "세 변의 길이로 삼각형을 만들려면 가장 긴 변은 다른 두 변의 합과 어떤 관계여야 하나요?",
				options: [
					"더 작아야 한다",
					"같아야 한다",
					"더 커야 한다"
				],
				answer: 0,
				talk: "두 짧은 변을 이어도 가장 긴 변보다 길어야 세 꼭짓점이 닫혀 삼각형이 돼."
			},
			{
				tag: "LOW",
				q: "x가 7보다 작다고 볼 때 가장 긴 변 7에 대한 조건은?",
				options: [
					"4+x>7",
					"4+x=7",
					"7+x<4"
				],
				answer: 0,
				talk: "짧은 두 변 4와 x의 합이 가장 긴 변 7보다 커야 해."
			},
			{
				tag: "LOW",
				q: "4+x>7을 만족하는 자연수 x의 최솟값은?",
				options: [
					"4",
					"3",
					"2"
				],
				answer: 0,
				talk: "x>3이므로 가장 작은 자연수는 4야."
			},
			{
				tag: "HIGH",
				q: "x가 가장 긴 변이 될 때 필요한 조건은?",
				options: [
					"x<4+7",
					"x=4+7",
					"x>4+7"
				],
				answer: 0,
				talk: "가장 긴 변 x도 나머지 두 변의 합 11보다 작아야 해."
			},
			{
				tag: "HIGH",
				q: "x<11을 만족하는 자연수 x의 최댓값은?",
				options: [
					"10",
					"11",
					"9"
				],
				answer: 0,
				talk: "11은 두 선분이 일직선으로 펴져 삼각형이 안 되므로 최댓값은 10이야."
			},
			{
				tag: "CHECK",
				q: "가능한 x의 범위를 바르게 나타낸 것은?",
				options: [
					"3<x<11",
					"4≤x≤11",
					"x<3 또는 x>11"
				],
				answer: 0,
				talk: "두 조건을 합치면 3<x<11이고 자연수는 4부터 10까지야."
			}
		], [
			{
				q: "세 변이 5 cm, 8 cm, x cm일 때 자연수 x의 최솟값과 최댓값을 구하시오.",
				a: "4,12"
			},
			{
				q: "세 변이 3 cm, 9 cm, x cm일 때 자연수 x의 최솟값과 최댓값을 구하시오.",
				a: "7,11"
			},
			{
				q: "세 변이 6 cm, 10 cm, x cm일 때 자연수 x의 최솟값과 최댓값을 구하시오.",
				a: "5,15"
			}
		])
	},
	{
		term: "중1 · 2학기",
		major: "5. 기본 도형",
		middle: "작도와 합동",
		minor: "삼각형의 합동 조건",
		problem: evalQuestion("기본 도형 · 단원 마무리 03", "△ABC와 △DEF에서 AB=DE, BC=EF이고 ∠B=∠E이다. 두 삼각형이 합동임을 나타내는 합동 조건과 꼭짓점 A에 대응하는 꼭짓점을 차례로 구하시오.", "SAS,D", [
			{
				tag: "DATA",
				q: "주어진 두 변 AB, BC는 어느 각을 사이에 두고 있나요?",
				options: [
					"∠B",
					"∠A",
					"∠C"
				],
				answer: 0,
				talk: "AB와 BC가 만나는 꼭짓점은 B이므로 두 변 사이의 각은 ∠B야."
			},
			{
				tag: "MATCH",
				q: "AB=DE에서 A와 B에 대응하는 꼭짓점 후보는?",
				options: [
					"D와 E",
					"E와 F",
					"D와 F"
				],
				answer: 0,
				talk: "선분 이름의 순서를 맞추면 AB의 양 끝은 DE의 양 끝에 대응해."
			},
			{
				tag: "MATCH",
				q: "BC=EF와 ∠B=∠E를 함께 보면 B에 대응하는 꼭짓점은?",
				options: [
					"E",
					"D",
					"F"
				],
				answer: 0,
				talk: "두 조건에 공통으로 나타난 B와 E가 서로 대응해."
			},
			{
				tag: "CONDITION",
				q: "두 변과 그 끼인각이 각각 같을 때의 합동 조건은?",
				options: [
					"SAS 합동",
					"SSS 합동",
					"ASA 합동"
				],
				answer: 0,
				talk: "Side-Angle-Side, 즉 두 변과 그 사이의 각이 같은 SAS 합동이야."
			},
			{
				tag: "VERTEX",
				q: "B↔E이고 AB↔DE이므로 A에 대응하는 꼭짓점은?",
				options: [
					"D",
					"E",
					"F"
				],
				answer: 0,
				talk: "AB에서 B가 E에 대응하므로 남은 A는 DE의 D에 대응해."
			},
			{
				tag: "ORDER",
				q: "합동 조건과 A의 대응 꼭짓점을 순서대로 쓴 것은?",
				options: [
					"SAS, D",
					"SSS, E",
					"ASA, F"
				],
				answer: 0,
				talk: "문제가 요구한 두 답을 합동 조건 먼저, 꼭짓점 다음 순서로 써."
			}
		], [
			{
				q: "AB=PQ, AC=PR, ∠A=∠P일 때 합동 조건과 B의 대응점을 구하시오.",
				a: "SAS,Q"
			},
			{
				q: "BC=YZ, CA=ZX, ∠C=∠Z일 때 합동 조건과 A의 대응점을 구하시오.",
				a: "SAS,X"
			},
			{
				q: "AB=LM, ∠A=∠L, ∠B=∠M일 때 합동 조건과 C의 대응점을 구하시오.",
				a: "ASA,N"
			}
		])
	},
	{
		term: "중1 · 2학기",
		major: "5. 기본 도형",
		middle: "기본 도형",
		minor: "각",
		problem: evalQuestion("기본 도형 · 단원 마무리 04", "∠AOB=140°이고, 반직선 OC는 ∠AOB의 이등분선이다. 반직선 OD가 ∠COB를 이등분할 때, ∠AOD의 크기를 구하시오.", "105", [
			{
				tag: "WHOLE",
				q: "처음 주어진 전체 각 ∠AOB의 크기는?",
				options: [
					"140°",
					"70°",
					"35°"
				],
				answer: 0,
				talk: "문제에서 가장 큰 각 ∠AOB가 140°라고 주어졌어."
			},
			{
				tag: "BISECT",
				q: "OC가 ∠AOB의 이등분선이라는 뜻은?",
				options: [
					"∠AOC=∠COB",
					"∠AOC+∠COB=70°",
					"∠AOC=2∠COB"
				],
				answer: 0,
				talk: "각의 이등분선은 하나의 각을 크기가 같은 두 각으로 나눠."
			},
			{
				tag: "HALF",
				q: "∠AOC와 ∠COB의 크기는 각각?",
				options: [
					"70°",
					"140°",
					"35°"
				],
				answer: 0,
				talk: "140°÷2=70°이므로 두 각은 각각 70°야."
			},
			{
				tag: "SECOND",
				q: "OD가 ∠COB를 다시 이등분하므로 ∠COD의 크기는?",
				options: [
					"35°",
					"70°",
					"105°"
				],
				answer: 0,
				talk: "∠COB=70°를 다시 반으로 나누면 35°야."
			},
			{
				tag: "BUILD",
				q: "∠AOD는 어떤 두 각의 합인가요?",
				options: [
					"∠AOC+∠COD",
					"∠AOB+∠COD",
					"∠COB-∠COD"
				],
				answer: 0,
				talk: "A에서 D까지 가려면 AOC 부분과 COD 부분을 이어 더해."
			},
			{
				tag: "CALC",
				q: "∠AOD의 크기는?",
				options: [
					"105°",
					"70°",
					"175°"
				],
				answer: 0,
				talk: "70°+35°=105°야."
			}
		], [
			{
				q: "∠AOB=120°, OC가 이등분선이고 OD가 ∠COB를 이등분할 때 ∠AOD를 구하시오.",
				a: "90"
			},
			{
				q: "∠AOB=160°, OC가 이등분선이고 OD가 ∠COB를 이등분할 때 ∠AOD를 구하시오.",
				a: "120"
			},
			{
				q: "∠AOB=100°, OC가 이등분선이고 OD가 ∠COB를 이등분할 때 ∠AOD를 구하시오.",
				a: "75"
			}
		])
	},
	{
		term: "중1 · 2학기",
		major: "5. 기본 도형",
		middle: "기본 도형",
		minor: "점·직선·평면의 위치 관계",
		problem: evalQuestion("기본 도형 · 단원 마무리 05", "직육면체 ABCD-EFGH에서 AE, BF, CG, DH는 서로 평행한 모서리이다. 직선 AB와 평행한 직선 하나, 직선 AB와 꼬인 위치에 있는 직선 하나를 각각 EF, CG 중에서 골라 차례로 쓰시오.", "EF,CG", [
			{
				tag: "MODEL",
				q: "직육면체 ABCD-EFGH에서 서로 마주 보는 면의 대응 모서리는 어떤 관계인가요?",
				options: [
					"평행하다",
					"반드시 만난다",
					"수직이다"
				],
				answer: 0,
				talk: "평행한 두 면에서 같은 방향으로 놓인 대응 모서리는 서로 평행해."
			},
			{
				tag: "PARALLEL",
				q: "직선 AB와 같은 방향으로 놓인 윗면의 모서리는?",
				options: [
					"EF",
					"CG",
					"AE"
				],
				answer: 0,
				talk: "A와 E, B와 F가 각각 위아래로 대응하므로 AB와 EF가 서로 평행해."
			},
			{
				tag: "CHECK",
				q: "문제의 후보 EF와 CG 중 AB와 만나지 않고 같은 방향인 것은?",
				options: [
					"EF",
					"CG",
					"둘 다"
				],
				answer: 0,
				talk: "EF는 AB의 바로 위에 같은 방향으로 놓인 대응 모서리야."
			},
			{
				tag: "SKEW",
				q: "두 직선이 만나지 않고 평행하지도 않으며 한 평면 위에 있지 않을 때 관계는?",
				options: [
					"꼬인 위치",
					"평행",
					"수직"
				],
				answer: 0,
				talk: "공간에서만 나타나는 관계로, 서로 다른 방향으로 비껴간 두 직선을 꼬인 위치라고 해."
			},
			{
				tag: "COMPARE",
				q: "직선 CG는 AB와 만나거나 평행한가요?",
				options: [
					"둘 다 아니다",
					"만난다",
					"평행하다"
				],
				answer: 0,
				talk: "CG는 세로 방향이고 AB와 공통점도 없어 서로 비껴가."
			},
			{
				tag: "ORDER",
				q: "평행한 직선, 꼬인 위치의 직선 순서로 쓰면?",
				options: [
					"EF, CG",
					"CG, EF",
					"EF, EF"
				],
				answer: 0,
				talk: "요구한 순서를 지켜 EF와 CG를 차례로 써."
			}
		], [
			{
				q: "직육면체에서 직선 PQ와 평행한 후보 RS, 꼬인 위치 후보 TV를 차례로 쓰시오.",
				a: "RS,TV"
			},
			{
				q: "직육면체에서 직선 AB와 평행한 후보 EF, 꼬인 위치 후보 DH를 차례로 쓰시오.",
				a: "EF,DH"
			},
			{
				q: "직육면체에서 직선 KL과 평행한 후보 MN, 꼬인 위치 후보 OP를 차례로 쓰시오.",
				a: "MN,OP"
			}
		])
	},
	{
		term: "중1 · 2학기",
		major: "5. 기본 도형",
		middle: "작도와 합동",
		minor: "삼각형의 작도",
		problem: evalQuestion("기본 도형 · 단원 마무리 06", "두 변의 길이가 5 cm, 7 cm이고 그 끼인각의 크기가 60°인 삼각형을 작도할 때, 작도되는 삼각형의 개수와 이 조건으로 삼각형이 하나로 정해지는 합동 조건을 차례로 구하시오.", "1,SAS", [
			{
				tag: "DATA",
				q: "문제에서 주어진 조건을 바르게 묶은 것은?",
				options: [
					"두 변과 그 끼인각",
					"한 변과 두 각",
					"세 변"
				],
				answer: 0,
				talk: "길이 5 cm와 7 cm인 두 변, 그리고 그 두 변 사이의 각 60°가 주어졌어."
			},
			{
				tag: "BASE",
				q: "작도의 첫 단계로 길이 7 cm인 선분을 그린 뒤 무엇을 하나요?",
				options: [
					"한 끝점에서 60°의 반직선을 긋는다",
					"선을 반으로 접는다",
					"수직선만 긋는다"
				],
				answer: 0,
				talk: "주어진 끼인각을 한 끝점에 먼저 만들어 두 변이 만날 방향을 정해."
			},
			{
				tag: "LENGTH",
				q: "60° 반직선 위에서 5 cm 떨어진 점은 몇 개 정해지나요?",
				options: [
					"1개",
					"2개",
					"무수히 많다"
				],
				answer: 0,
				talk: "반직선에서는 시작점에서 정해진 거리 5 cm인 점이 하나만 있어."
			},
			{
				tag: "UNIQUE",
				q: "따라서 조건을 만족하는 삼각형은 몇 개로 정해지나요?",
				options: [
					"1개",
					"2개",
					"정해지지 않는다"
				],
				answer: 0,
				talk: "두 변의 길이와 사이각이 정해지면 모양과 크기가 하나로 결정돼."
			},
			{
				tag: "CONDITION",
				q: "두 변과 그 끼인각이 각각 같은 삼각형의 합동 조건은?",
				options: [
					"SAS",
					"SSS",
					"ASA"
				],
				answer: 0,
				talk: "Side-Angle-Side의 머리글자를 따서 SAS 합동이라고 해."
			},
			{
				tag: "ORDER",
				q: "삼각형의 개수와 합동 조건을 차례로 쓰면?",
				options: [
					"1, SAS",
					"2, SSS",
					"1, ASA"
				],
				answer: 0,
				talk: "작도 개수 1개를 먼저, 합동 조건 SAS를 다음에 써."
			}
		], [
			{
				q: "두 변 4 cm, 6 cm와 끼인각 50°로 작도되는 삼각형의 개수와 합동 조건을 구하시오.",
				a: "1,SAS"
			},
			{
				q: "두 변 3 cm, 8 cm와 끼인각 90°로 작도되는 삼각형의 개수와 합동 조건을 구하시오.",
				a: "1,SAS"
			},
			{
				q: "두 변 7 cm, 9 cm와 끼인각 120°로 작도되는 삼각형의 개수와 합동 조건을 구하시오.",
				a: "1,SAS"
			}
		])
	}
];
var unit6Assessment = [
	{
		term: "중1 · 2학기",
		major: "6. 평면도형",
		middle: "다각형",
		minor: "다각형의 내각과 외각",
		problem: evalQuestion("평면도형 · 단원 마무리 01", "어떤 다각형의 대각선의 개수가 20개일 때, 이 다각형의 내각의 크기의 합을 구하시오.", "1080", [
			{
				tag: "FORMULA",
				q: "n각형의 한 꼭짓점에서 그을 수 있는 대각선은 몇 개인가요?",
				options: [
					"n-3개",
					"n-2개",
					"n개"
				],
				answer: 0,
				talk: "자기 자신과 양옆 꼭짓점에는 대각선을 그을 수 없으므로 n-3개야."
			},
			{
				tag: "COUNT",
				q: "모든 꼭짓점에서 센 대각선은 한 대각선을 몇 번씩 세나요?",
				options: [
					"2번",
					"1번",
					"3번"
				],
				answer: 0,
				talk: "대각선의 양 끝 꼭짓점에서 각각 한 번씩 세므로 두 번 중복돼."
			},
			{
				tag: "EQUATION",
				q: "대각선의 개수가 20개라는 조건을 식으로 나타내면?",
				options: [
					"n(n-3)÷2=20",
					"n(n-2)=20",
					"n(n-3)=20"
				],
				answer: 0,
				talk: "n각형의 대각선 개수 공식 n(n-3)/2에 20을 넣어."
			},
			{
				tag: "SOLVE",
				q: "n(n-3)=40을 만족하는 자연수 n은?",
				options: [
					"8",
					"5",
					"10"
				],
				answer: 0,
				talk: "8×5=40이므로 n=8, 즉 팔각형이야."
			},
			{
				tag: "ANGLE",
				q: "n각형의 내각의 합을 구하는 식은?",
				options: [
					"(n-2)×180°",
					"n×180°",
					"(n-3)×180°"
				],
				answer: 0,
				talk: "한 꼭짓점에서 삼각형 n-2개로 나눌 수 있어."
			},
			{
				tag: "CALC",
				q: "팔각형의 내각의 합은?",
				options: [
					"1080°",
					"1440°",
					"720°"
				],
				answer: 0,
				talk: "(8-2)×180°=6×180°=1080°야."
			}
		], [
			{
				q: "대각선이 9개인 다각형의 내각의 합을 구하시오.",
				a: "720"
			},
			{
				q: "대각선이 35개인 다각형의 내각의 합을 구하시오.",
				a: "1440"
			},
			{
				q: "대각선이 44개인 다각형의 내각의 합을 구하시오.",
				a: "1620"
			}
		])
	},
	{
		term: "중1 · 2학기",
		major: "6. 평면도형",
		middle: "다각형",
		minor: "정다각형",
		problem: evalQuestion("평면도형 · 단원 마무리 02", "한 외각의 크기가 24°인 정다각형의 변의 개수와 한 내각의 크기를 차례로 구하시오.", "15,156", [
			{
				tag: "SUM",
				q: "다각형의 외각의 크기의 합은 항상 얼마인가요?",
				options: [
					"360°",
					"180°",
					"540°"
				],
				answer: 0,
				talk: "각 꼭짓점에서 같은 방향으로 한 바퀴 회전하므로 외각의 합은 360°야."
			},
			{
				tag: "REGULAR",
				q: "정다각형에서는 각 외각의 크기가 어떤가요?",
				options: [
					"모두 같다",
					"모두 다르다",
					"두 개씩만 같다"
				],
				answer: 0,
				talk: "정다각형은 모든 변과 모든 내각이 같으므로 외각도 모두 같아."
			},
			{
				tag: "SIDES",
				q: "외각이 24°일 때 변의 개수를 구하는 식은?",
				options: [
					"360÷24",
					"180÷24",
					"360-24"
				],
				answer: 0,
				talk: "외각의 합을 한 외각의 크기로 나누면 외각의 개수, 즉 변의 개수가 돼."
			},
			{
				tag: "CALC",
				q: "360÷24의 값은?",
				options: [
					"15",
					"12",
					"16"
				],
				answer: 0,
				talk: "24×15=360이므로 정십오각형이야."
			},
			{
				tag: "PAIR",
				q: "한 꼭짓점의 내각과 외각의 합은?",
				options: [
					"180°",
					"360°",
					"90°"
				],
				answer: 0,
				talk: "내각과 그에 이웃한 외각은 일직선을 이루어 합이 180°야."
			},
			{
				tag: "INNER",
				q: "한 내각의 크기는?",
				options: [
					"156°",
					"146°",
					"166°"
				],
				answer: 0,
				talk: "180°-24°=156°야. 변의 개수와 내각 순서로 답을 써."
			}
		], [
			{
				q: "한 외각이 30°인 정다각형의 변의 개수와 한 내각을 구하시오.",
				a: "12,150"
			},
			{
				q: "한 외각이 40°인 정다각형의 변의 개수와 한 내각을 구하시오.",
				a: "9,140"
			},
			{
				q: "한 외각이 20°인 정다각형의 변의 개수와 한 내각을 구하시오.",
				a: "18,160"
			}
		])
	},
	{
		term: "중1 · 2학기",
		major: "6. 평면도형",
		middle: "원과 부채꼴",
		minor: "부채꼴의 호의 길이와 넓이",
		problem: evalQuestion("평면도형 · 단원 마무리 03", "반지름의 길이가 12 cm이고 중심각의 크기가 150°인 부채꼴의 호의 길이와 넓이를 차례로 구하시오. (원주율은 π로 나타낸다.)", "10π,60π", [
			{
				tag: "RATIO",
				q: "중심각 150°는 한 바퀴 360°의 몇 배인가요?",
				options: [
					"150/360=5/12",
					"150/180=5/6",
					"360/150=12/5"
				],
				answer: 0,
				talk: "부채꼴은 전체 원에서 중심각이 차지하는 비율만큼 잘라 낸 부분이야."
			},
			{
				tag: "CIRCLE",
				q: "반지름이 12 cm인 원의 둘레는?",
				options: [
					"24π cm",
					"12π cm",
					"144π cm"
				],
				answer: 0,
				talk: "원의 둘레는 2πr이므로 2π×12=24π야."
			},
			{
				tag: "ARC",
				q: "부채꼴의 호의 길이를 구하는 식은?",
				options: [
					"24π×5/12",
					"12π×5/12",
					"144π×5/12"
				],
				answer: 0,
				talk: "전체 원의 둘레에 중심각의 비율 5/12를 곱해."
			},
			{
				tag: "ARC",
				q: "24π×5/12의 값은?",
				options: [
					"10π cm",
					"20π cm",
					"5π cm"
				],
				answer: 0,
				talk: "24÷12=2이고 2×5=10이므로 10π cm야."
			},
			{
				tag: "AREA",
				q: "반지름이 12 cm인 원의 넓이는?",
				options: [
					"144π cm²",
					"24π cm²",
					"12π cm²"
				],
				answer: 0,
				talk: "원의 넓이는 πr²이므로 π×12²=144π야."
			},
			{
				tag: "SECTOR",
				q: "부채꼴의 넓이 144π×5/12의 값은?",
				options: [
					"60π cm²",
					"120π cm²",
					"72π cm²"
				],
				answer: 0,
				talk: "144÷12=12이고 12×5=60이므로 60π cm²야."
			}
		], [
			{
				q: "반지름 9 cm, 중심각 120°인 부채꼴의 호의 길이와 넓이를 구하시오.",
				a: "6π,27π"
			},
			{
				q: "반지름 10 cm, 중심각 72°인 부채꼴의 호의 길이와 넓이를 구하시오.",
				a: "4π,20π"
			},
			{
				q: "반지름 6 cm, 중심각 210°인 부채꼴의 호의 길이와 넓이를 구하시오.",
				a: "7π,21π"
			}
		])
	},
	{
		term: "중1 · 2학기",
		major: "6. 평면도형",
		middle: "다각형",
		minor: "다각형의 내각과 외각",
		problem: evalQuestion("평면도형 · 단원 마무리 04", "오각형의 다섯 내각의 크기가 각각 x°, (x+10)°, (x+20)°, (x+30)°, (x+40)°이다. x의 값과 가장 큰 내각의 크기를 차례로 구하시오.", "88,128", [
			{
				tag: "SUM",
				q: "오각형의 내각의 크기의 합은?",
				options: [
					"540°",
					"360°",
					"720°"
				],
				answer: 0,
				talk: "오각형은 한 꼭짓점에서 삼각형 3개로 나뉘므로 3×180°=540°야."
			},
			{
				tag: "BUILD",
				q: "다섯 내각의 합을 식으로 나타내면?",
				options: [
					"x+(x+10)+(x+20)+(x+30)+(x+40)",
					"5x+40",
					"x+100"
				],
				answer: 0,
				talk: "다섯 각을 빠짐없이 모두 더해야 해."
			},
			{
				tag: "LIKE",
				q: "동류항을 정리한 식은?",
				options: [
					"5x+100",
					"5x+40",
					"x+100"
				],
				answer: 0,
				talk: "x가 5개이고, 수끼리 더하면 10+20+30+40=100이야."
			},
			{
				tag: "EQUATION",
				q: "내각의 합 조건으로 세운 방정식은?",
				options: [
					"5x+100=540",
					"5x+100=360",
					"5x=540"
				],
				answer: 0,
				talk: "각들의 합이 오각형의 내각의 합 540°와 같아."
			},
			{
				tag: "SOLVE",
				q: "5x=440에서 x의 값은?",
				options: [
					"88",
					"108",
					"80"
				],
				answer: 0,
				talk: "양변을 5로 나누면 x=88이야."
			},
			{
				tag: "MAX",
				q: "가장 큰 내각 x+40의 크기는?",
				options: [
					"128°",
					"118°",
					"138°"
				],
				answer: 0,
				talk: "가장 큰 식 x+40에 x=88을 넣으면 128°야."
			}
		], [
			{
				q: "사각형의 네 내각이 x°, (x+20)°, (x+40)°, (x+60)°일 때 x와 가장 큰 내각을 구하시오.",
				a: "60,120"
			},
			{
				q: "오각형의 다섯 내각이 x°, x°, (x+20)°, (x+30)°, (x+40)°일 때 x와 가장 큰 내각을 구하시오.",
				a: "90,130"
			},
			{
				q: "육각형의 여섯 내각이 x°, (x+10)°, (x+20)°, (x+30)°, (x+40)°, (x+50)°일 때 x와 가장 큰 내각을 구하시오.",
				a: "95,145"
			}
		])
	},
	{
		term: "중1 · 2학기",
		major: "6. 평면도형",
		middle: "원과 부채꼴",
		minor: "부채꼴의 호의 길이와 넓이",
		problem: evalQuestion("평면도형 · 단원 마무리 05", "반지름의 길이가 9 cm이고 호의 길이가 6π cm인 부채꼴의 중심각의 크기와 넓이를 차례로 구하시오.", "120,27π", [
			{
				tag: "CIRCLE",
				q: "반지름이 9 cm인 원의 둘레는?",
				options: [
					"18π cm",
					"9π cm",
					"81π cm"
				],
				answer: 0,
				talk: "원의 둘레는 2πr이므로 2π×9=18π cm야."
			},
			{
				tag: "RATIO",
				q: "호의 길이 6π는 원 둘레 18π의 몇 배인가요?",
				options: [
					"1/3",
					"1/2",
					"2/3"
				],
				answer: 0,
				talk: "6π÷18π=1/3이므로 전체 원의 3분의 1만큼이야."
			},
			{
				tag: "ANGLE",
				q: "중심각은 360°의 1/3이므로?",
				options: [
					"120°",
					"180°",
					"60°"
				],
				answer: 0,
				talk: "360°×1/3=120°야."
			},
			{
				tag: "AREA",
				q: "반지름 9 cm인 원 전체의 넓이는?",
				options: [
					"81π cm²",
					"18π cm²",
					"9π cm²"
				],
				answer: 0,
				talk: "원의 넓이는 πr²=π×9²=81π야."
			},
			{
				tag: "SECTOR",
				q: "부채꼴의 넓이를 구하는 식은?",
				options: [
					"81π×1/3",
					"18π×1/3",
					"81π×1/2"
				],
				answer: 0,
				talk: "호와 중심각이 전체의 1/3이므로 넓이도 전체 원 넓이의 1/3이야."
			},
			{
				tag: "FINISH",
				q: "중심각과 넓이를 차례로 쓰면?",
				options: [
					"120, 27π",
					"27π, 120",
					"120, 54π"
				],
				answer: 0,
				talk: "81π÷3=27π이므로 중심각 120°, 넓이 27π cm²야."
			}
		], [
			{
				q: "반지름 6 cm, 호의 길이 4π cm인 부채꼴의 중심각과 넓이를 구하시오.",
				a: "120,12π"
			},
			{
				q: "반지름 10 cm, 호의 길이 5π cm인 부채꼴의 중심각과 넓이를 구하시오.",
				a: "90,25π"
			},
			{
				q: "반지름 12 cm, 호의 길이 18π cm인 부채꼴의 중심각과 넓이를 구하시오.",
				a: "270,108π"
			}
		])
	},
	{
		term: "중1 · 2학기",
		major: "6. 평면도형",
		middle: "다각형",
		minor: "다각형의 내각과 외각",
		problem: evalQuestion("평면도형 · 교과서 대단원 학습평가 06", "어떤 다각형의 한 꼭짓점에서 대각선을 모두 그었더니 8개의 삼각형으로 나누어졌다. 이 다각형의 대각선의 개수를 구하시오.", "35", [
			{
				tag: "PICTURE",
				q: "한 꼭짓점에서 대각선을 그을 때 생기는 삼각형의 수와 변의 수의 관계는?",
				options: [
					"n각형이면 n-2개",
					"n각형이면 n개",
					"n각형이면 n-3개"
				],
				answer: 0,
				talk: "사각형은 2개, 오각형은 3개로 나뉘어. 언제나 변의 수보다 2개 적은 삼각형이 생겨."
			},
			{
				tag: "BUILD",
				q: "삼각형이 8개라는 조건을 식으로 쓰면?",
				options: [
					"n-2=8",
					"n-3=8",
					"n+2=8"
				],
				answer: 0,
				talk: "삼각형의 수 n-2 자리에 문제에서 준 8을 놓아."
			},
			{
				tag: "SOLVE",
				q: "n-2=8을 풀면 n은?",
				options: [
					"10",
					"8",
					"6"
				],
				answer: 0,
				talk: "양변에 2를 더하면 n=10이므로 십각형이야."
			},
			{
				tag: "ONE",
				q: "십각형의 한 꼭짓점에서 그을 수 있는 대각선은?",
				options: [
					"10-3=7개",
					"10-2=8개",
					"10개"
				],
				answer: 0,
				talk: "자기 꼭짓점과 양옆 두 꼭짓점을 제외하므로 3을 빼서 7개야."
			},
			{
				tag: "DOUBLE",
				q: "10개의 꼭짓점에서 모두 세면 대각선 하나가 몇 번씩 세어지나요?",
				options: [
					"2번",
					"1번",
					"10번"
				],
				answer: 0,
				talk: "한 대각선은 양 끝의 두 꼭짓점에서 한 번씩, 모두 두 번 세어져."
			},
			{
				tag: "CALC",
				q: "십각형의 대각선 수 10×7÷2는?",
				options: [
					"35개",
					"70개",
					"17개"
				],
				answer: 0,
				talk: "중복된 두 번을 나누면 70÷2=35개야."
			}
		], [
			{
				q: "한 꼭짓점의 대각선으로 5개의 삼각형이 생기는 다각형의 대각선 수를 구하시오.",
				a: "14"
			},
			{
				q: "한 꼭짓점의 대각선으로 6개의 삼각형이 생기는 다각형의 대각선 수를 구하시오.",
				a: "20"
			},
			{
				q: "한 꼭짓점의 대각선으로 10개의 삼각형이 생기는 다각형의 대각선 수를 구하시오.",
				a: "54"
			}
		])
	},
	{
		term: "중1 · 2학기",
		major: "6. 평면도형",
		middle: "다각형",
		minor: "정다각형",
		problem: evalQuestion("평면도형 · 교과서 대단원 학습평가 07", "한 외각의 크기가 45°인 정다각형의 내각의 크기의 합을 구하시오.", "1080", [
			{
				tag: "SUM",
				q: "다각형의 외각을 한 방향으로 모두 모으면 합은?",
				options: [
					"360°",
					"180°",
					"540°"
				],
				answer: 0,
				talk: "다각형 둘레를 따라 돌면 출발 방향으로 한 바퀴 돌아오므로 360°야."
			},
			{
				tag: "SAME",
				q: "정다각형의 각 외각은 서로 어떤가요?",
				options: [
					"크기가 모두 같다",
					"하나씩 커진다",
					"두 개만 같다"
				],
				answer: 0,
				talk: "정다각형은 내각이 모두 같아서 그 이웃한 외각도 모두 같아."
			},
			{
				tag: "SIDES",
				q: "한 외각이 45°일 때 외각의 개수, 즉 변의 수는?",
				options: [
					"360÷45",
					"180÷45",
					"360-45"
				],
				answer: 0,
				talk: "전체 외각의 합 360°를 한 외각 45°씩 나누어 세어."
			},
			{
				tag: "CALC",
				q: "360÷45의 값은?",
				options: [
					"8",
					"6",
					"10"
				],
				answer: 0,
				talk: "45×8=360이므로 정팔각형이야."
			},
			{
				tag: "TRIANGLE",
				q: "팔각형을 한 꼭짓점에서 삼각형으로 나누면 몇 개인가요?",
				options: [
					"8-2=6개",
					"8개",
					"8-3=5개"
				],
				answer: 0,
				talk: "n각형은 n-2개의 삼각형으로 나뉘므로 6개야."
			},
			{
				tag: "FINISH",
				q: "정팔각형의 내각의 크기의 합은?",
				options: [
					"6×180°=1080°",
					"8×180°=1440°",
					"5×180°=900°"
				],
				answer: 0,
				talk: "삼각형 6개의 내각의 합을 더하면 1080°야."
			}
		], [
			{
				q: "한 외각이 60°인 정다각형의 내각의 합을 구하시오.",
				a: "720"
			},
			{
				q: "한 외각이 30°인 정다각형의 내각의 합을 구하시오.",
				a: "1800"
			},
			{
				q: "한 외각이 24°인 정다각형의 내각의 합을 구하시오.",
				a: "2340"
			}
		])
	},
	{
		term: "중1 · 2학기",
		major: "6. 평면도형",
		middle: "원과 부채꼴",
		minor: "원과 부채꼴",
		problem: evalQuestion("평면도형 · 교과서 대단원 학습평가 08", "AC가 원 O의 지름이고, 부채꼴 AOB의 넓이가 부채꼴 BOC의 넓이의 3배일 때, ∠BOC의 크기를 구하시오.", "45", [
			{
				tag: "DIAMETER",
				q: "AC가 지름일 때 ∠AOC의 크기는?",
				options: [
					"180°",
					"360°",
					"90°"
				],
				answer: 0,
				talk: "A, O, C가 한 직선 위에 있으므로 반원의 중심각은 180°야."
			},
			{
				tag: "RATIO",
				q: "한 원에서 부채꼴의 넓이는 무엇에 정비례하나요?",
				options: [
					"중심각의 크기",
					"반지름의 길이",
					"현의 개수"
				],
				answer: 0,
				talk: "같은 원에서는 반지름이 같으므로 넓이의 비는 중심각의 비와 같아."
			},
			{
				tag: "NAME",
				q: "∠BOC의 크기를 x°라고 하면 ∠AOB는?",
				options: [
					"3x°",
					"x+3°",
					"x/3°"
				],
				answer: 0,
				talk: "AOB의 넓이가 BOC의 3배이므로 중심각도 3배야."
			},
			{
				tag: "BUILD",
				q: "반원의 두 중심각을 더한 식은?",
				options: [
					"3x+x=180",
					"3x-x=180",
					"3x+x=360"
				],
				answer: 0,
				talk: "∠AOB와 ∠BOC를 더하면 곧은각 ∠AOC=180°가 돼."
			},
			{
				tag: "LIKE",
				q: "3x+x를 간단히 하면?",
				options: [
					"4x",
					"3x²",
					"2x"
				],
				answer: 0,
				talk: "x가 3개와 1개이므로 모두 4개, 4x야."
			},
			{
				tag: "FINISH",
				q: "4x=180에서 x=∠BOC의 크기는?",
				options: [
					"45°",
					"60°",
					"90°"
				],
				answer: 0,
				talk: "180÷4=45이므로 ∠BOC=45°야."
			}
		], [
			{
				q: "반원에서 부채꼴 AOB의 넓이가 BOC의 2배일 때 ∠BOC를 구하시오.",
				a: "60"
			},
			{
				q: "반원에서 부채꼴 AOB의 넓이가 BOC의 4배일 때 ∠BOC를 구하시오.",
				a: "36"
			},
			{
				q: "반원에서 부채꼴 AOB의 넓이가 BOC의 5배일 때 ∠BOC를 구하시오.",
				a: "30"
			}
		])
	}
];
var unit7Assessment = [
	{
		term: "중1 · 2학기",
		major: "7. 입체도형",
		middle: "다면체와 회전체",
		minor: "다면체",
		problem: evalQuestion("입체도형 · 단원 마무리 01", "어떤 각기둥의 꼭짓점의 개수와 모서리의 개수의 합이 40개이다. 이 각기둥의 밑면은 몇 각형인지 구하고, 면의 개수를 구하시오.", "8,10", [
			{
				tag: "MODEL",
				q: "밑면이 n각형인 각기둥의 꼭짓점은 몇 개인가요?",
				options: [
					"2n개",
					"n개",
					"3n개"
				],
				answer: 0,
				talk: "서로 평행한 두 밑면에 꼭짓점이 n개씩 있으므로 모두 2n개야."
			},
			{
				tag: "EDGE",
				q: "n각기둥의 모서리는 몇 개인가요?",
				options: [
					"3n개",
					"2n개",
					"n+2개"
				],
				answer: 0,
				talk: "위아래 밑면의 모서리 2n개와 두 밑면을 잇는 n개를 더해 3n개야."
			},
			{
				tag: "EQUATION",
				q: "꼭짓점과 모서리의 합이 40개라는 조건을 식으로 나타내면?",
				options: [
					"2n+3n=40",
					"2n×3n=40",
					"3n-2n=40"
				],
				answer: 0,
				talk: "꼭짓점 2n개와 모서리 3n개를 더해 40이야."
			},
			{
				tag: "SOLVE",
				q: "5n=40에서 n의 값은?",
				options: [
					"8",
					"5",
					"10"
				],
				answer: 0,
				talk: "양변을 5로 나누면 n=8이므로 밑면은 팔각형이야."
			},
			{
				tag: "FACE",
				q: "n각기둥의 옆면은 몇 개인가요?",
				options: [
					"n개",
					"2n개",
					"n+2개"
				],
				answer: 0,
				talk: "밑면의 각 변마다 옆면이 하나씩 붙으므로 옆면은 n개야."
			},
			{
				tag: "TOTAL",
				q: "팔각기둥의 전체 면의 개수는?",
				options: [
					"10개",
					"8개",
					"16개"
				],
				answer: 0,
				talk: "옆면 8개와 밑면 2개를 더해 10개야."
			}
		], [
			{
				q: "각기둥의 꼭짓점과 모서리의 합이 25개일 때 밑면의 변의 수와 면의 수를 구하시오.",
				a: "5,7"
			},
			{
				q: "각기둥의 꼭짓점과 모서리의 합이 30개일 때 밑면의 변의 수와 면의 수를 구하시오.",
				a: "6,8"
			},
			{
				q: "각기둥의 꼭짓점과 모서리의 합이 50개일 때 밑면의 변의 수와 면의 수를 구하시오.",
				a: "10,12"
			}
		])
	},
	{
		term: "중1 · 2학기",
		major: "7. 입체도형",
		middle: "다면체와 회전체",
		minor: "회전체",
		problem: evalQuestion("입체도형 · 단원 마무리 02", "가로 6 cm, 세로 8 cm인 직사각형을 세로 8 cm인 변을 회전축으로 하여 한 바퀴 회전시켰다. 만들어지는 회전체의 밑면의 반지름과 높이, 부피를 차례로 구하시오.", "6,8,288π", [
			{
				tag: "SHAPE",
				q: "직사각형을 한 변을 축으로 회전시키면 어떤 입체도형이 만들어지나요?",
				options: [
					"원기둥",
					"원뿔",
					"구"
				],
				answer: 0,
				talk: "회전축과 평행한 반대쪽 변이 원을 그리며 원기둥의 옆면을 만들어."
			},
			{
				tag: "AXIS",
				q: "회전축으로 사용한 세로 8 cm는 원기둥의 무엇이 되나요?",
				options: [
					"높이",
					"반지름",
					"밑면의 둘레"
				],
				answer: 0,
				talk: "회전축의 길이가 원기둥의 위아래 거리, 즉 높이가 돼."
			},
			{
				tag: "RADIUS",
				q: "회전축에서 반대쪽 변까지의 거리 6 cm는 무엇이 되나요?",
				options: [
					"밑면의 반지름",
					"높이",
					"지름"
				],
				answer: 0,
				talk: "축에서 가장자리까지의 거리가 회전하면서 원의 반지름이 돼."
			},
			{
				tag: "AREA",
				q: "반지름 6 cm인 밑면의 넓이는?",
				options: [
					"36π cm²",
					"12π cm²",
					"6π cm²"
				],
				answer: 0,
				talk: "원의 넓이 πr²에 r=6을 넣으면 36π야."
			},
			{
				tag: "VOLUME",
				q: "원기둥의 부피를 구하는 식은?",
				options: [
					"밑면의 넓이×높이",
					"밑면의 둘레×높이",
					"밑면의 넓이÷3"
				],
				answer: 0,
				talk: "원기둥은 같은 밑면이 높이만큼 쌓인 모양이라 밑넓이×높이야."
			},
			{
				tag: "CALC",
				q: "36π×8의 값은?",
				options: [
					"288π cm³",
					"144π cm³",
					"48π cm³"
				],
				answer: 0,
				talk: "반지름 6, 높이 8, 부피 288π를 문제의 순서대로 써."
			}
		], [
			{
				q: "가로 4 cm, 세로 9 cm 직사각형을 세로 변을 축으로 회전시킬 때 반지름, 높이, 부피를 구하시오.",
				a: "4,9,144π"
			},
			{
				q: "가로 5 cm, 세로 7 cm 직사각형을 세로 변을 축으로 회전시킬 때 반지름, 높이, 부피를 구하시오.",
				a: "5,7,175π"
			},
			{
				q: "가로 3 cm, 세로 10 cm 직사각형을 세로 변을 축으로 회전시킬 때 반지름, 높이, 부피를 구하시오.",
				a: "3,10,90π"
			}
		])
	},
	{
		term: "중1 · 2학기",
		major: "7. 입체도형",
		middle: "입체도형의 겉넓이와 부피",
		minor: "기둥·뿔의 겉넓이와 부피",
		problem: evalQuestion("입체도형 · 단원 마무리 03", "밑면이 가로 6 cm, 세로 4 cm인 직사각형이고 높이가 9 cm인 사각뿔의 부피와, 밑면과 높이가 같은 사각기둥의 부피의 차를 구하시오.", "144", [
			{
				tag: "BASE",
				q: "가로 6 cm, 세로 4 cm인 밑면의 넓이는?",
				options: [
					"24 cm²",
					"20 cm²",
					"10 cm²"
				],
				answer: 0,
				talk: "직사각형의 넓이는 가로×세로이므로 6×4=24야."
			},
			{
				tag: "PRISM",
				q: "밑넓이 24 cm², 높이 9 cm인 사각기둥의 부피는?",
				options: [
					"216 cm³",
					"72 cm³",
					"108 cm³"
				],
				answer: 0,
				talk: "기둥의 부피는 밑넓이×높이이므로 24×9=216이야."
			},
			{
				tag: "PYRAMID",
				q: "뿔의 부피는 같은 밑면과 높이를 가진 기둥 부피의 얼마인가요?",
				options: [
					"1/3",
					"1/2",
					"3배"
				],
				answer: 0,
				talk: "같은 밑면과 높이의 뿔 세 개가 기둥 하나의 부피와 같아."
			},
			{
				tag: "PYRAMID",
				q: "사각뿔의 부피를 구하는 식은?",
				options: [
					"24×9÷3",
					"24×9",
					"24+9÷3"
				],
				answer: 0,
				talk: "밑넓이×높이에 1/3을 곱해."
			},
			{
				tag: "CALC",
				q: "24×9÷3의 값은?",
				options: [
					"72 cm³",
					"216 cm³",
					"36 cm³"
				],
				answer: 0,
				talk: "9÷3=3이고 24×3=72이므로 뿔의 부피는 72야."
			},
			{
				tag: "DIFF",
				q: "사각기둥과 사각뿔의 부피의 차는?",
				options: [
					"144 cm³",
					"288 cm³",
					"72 cm³"
				],
				answer: 0,
				talk: "216-72=144이므로 두 부피의 차는 144 cm³야."
			}
		], [
			{
				q: "밑면이 5 cm×6 cm, 높이 12 cm인 사각뿔과 같은 밑면·높이의 기둥의 부피 차를 구하시오.",
				a: "240"
			},
			{
				q: "밑면이 8 cm×3 cm, 높이 15 cm인 사각뿔과 같은 밑면·높이의 기둥의 부피 차를 구하시오.",
				a: "240"
			},
			{
				q: "밑면이 7 cm×4 cm, 높이 9 cm인 사각뿔과 같은 밑면·높이의 기둥의 부피 차를 구하시오.",
				a: "168"
			}
		])
	},
	{
		term: "중1 · 2학기",
		major: "7. 입체도형",
		middle: "다면체와 회전체",
		minor: "정다면체",
		problem: evalQuestion("입체도형 · 단원 마무리 04", "모든 면이 합동인 정삼각형이고 한 꼭짓점에 모이는 면이 5개인 정다면체의 이름과 면의 개수를 차례로 구하시오.", "정이십면체,20", [
			{
				tag: "FACE",
				q: "모든 면이 정삼각형인 정다면체의 후보는?",
				options: [
					"정사면체·정팔면체·정이십면체",
					"정육면체만",
					"정십이면체만"
				],
				answer: 0,
				talk: "정사면체, 정팔면체, 정이십면체의 면은 모두 정삼각형이야."
			},
			{
				tag: "VERTEX",
				q: "정사면체에서 한 꼭짓점에 모이는 면의 수는?",
				options: [
					"3개",
					"4개",
					"5개"
				],
				answer: 0,
				talk: "정사면체의 한 꼭짓점에는 정삼각형 세 개가 만나."
			},
			{
				tag: "VERTEX",
				q: "정팔면체에서 한 꼭짓점에 모이는 면의 수는?",
				options: [
					"4개",
					"3개",
					"5개"
				],
				answer: 0,
				talk: "정팔면체에서는 정삼각형 네 개가 한 꼭짓점에 모여."
			},
			{
				tag: "PICK",
				q: "한 꼭짓점에 정삼각형 5개가 모이는 정다면체는?",
				options: [
					"정이십면체",
					"정팔면체",
					"정사면체"
				],
				answer: 0,
				talk: "세 후보 중 가장 많은 다섯 면이 모이는 것은 정이십면체야."
			},
			{
				tag: "NAME",
				q: "‘정이십면체’라는 이름에서 알 수 있는 면의 개수는?",
				options: [
					"20개",
					"12개",
					"8개"
				],
				answer: 0,
				talk: "이십은 20을 뜻하므로 면이 20개야."
			},
			{
				tag: "ORDER",
				q: "정다면체의 이름과 면의 개수를 순서대로 쓰면?",
				options: [
					"정이십면체, 20",
					"정십이면체, 12",
					"정팔면체, 8"
				],
				answer: 0,
				talk: "이름을 먼저 쓰고 면의 개수를 다음 칸에 써."
			}
		], [
			{
				q: "모든 면이 정삼각형이고 한 꼭짓점에 3개 면이 모이는 정다면체의 이름과 면 수를 구하시오.",
				a: "정사면체,4"
			},
			{
				q: "모든 면이 정삼각형이고 한 꼭짓점에 4개 면이 모이는 정다면체의 이름과 면 수를 구하시오.",
				a: "정팔면체,8"
			},
			{
				q: "모든 면이 정오각형인 정다면체의 이름과 면 수를 구하시오.",
				a: "정십이면체,12"
			}
		])
	},
	{
		term: "중1 · 2학기",
		major: "7. 입체도형",
		middle: "입체도형의 겉넓이와 부피",
		minor: "기둥·뿔의 겉넓이와 부피",
		problem: evalQuestion("입체도형 · 단원 마무리 05", "밑면의 반지름이 5 cm이고 모선의 길이가 13 cm인 원뿔의 겉넓이를 구하시오. (원주율은 π로 나타낸다.)", "90π", [
			{
				tag: "PARTS",
				q: "원뿔의 겉넓이는 어떤 두 부분의 넓이를 더하나요?",
				options: [
					"밑면과 옆면",
					"밑면 두 개",
					"옆면과 높이"
				],
				answer: 0,
				talk: "원뿔에는 원 모양 밑면 하나와 부채꼴 모양 옆면 하나가 있어."
			},
			{
				tag: "BASE",
				q: "반지름 5 cm인 밑면의 넓이는?",
				options: [
					"25π cm²",
					"10π cm²",
					"5π cm²"
				],
				answer: 0,
				talk: "πr²=π×5²=25π야."
			},
			{
				tag: "SIDEFORM",
				q: "반지름 r, 모선 l인 원뿔의 옆넓이 공식은?",
				options: [
					"πrl",
					"2πr²",
					"πr²l"
				],
				answer: 0,
				talk: "펼친 부채꼴의 호가 밑면의 둘레와 같아서 옆넓이는 πrl이 돼."
			},
			{
				tag: "SIDE",
				q: "r=5, l=13을 옆넓이 공식에 넣으면?",
				options: [
					"π×5×13",
					"π×5²",
					"2π×13"
				],
				answer: 0,
				talk: "반지름과 모선을 정확한 자리에 넣어."
			},
			{
				tag: "CALC",
				q: "원뿔의 옆넓이는?",
				options: [
					"65π cm²",
					"130π cm²",
					"18π cm²"
				],
				answer: 0,
				talk: "5×13=65이므로 옆넓이는 65π야."
			},
			{
				tag: "TOTAL",
				q: "밑넓이와 옆넓이를 더한 겉넓이는?",
				options: [
					"90π cm²",
					"40π cm²",
					"325π cm²"
				],
				answer: 0,
				talk: "25π+65π=90π cm²야."
			}
		], [
			{
				q: "반지름 3 cm, 모선 7 cm인 원뿔의 겉넓이를 구하시오.",
				a: "30π"
			},
			{
				q: "반지름 4 cm, 모선 10 cm인 원뿔의 겉넓이를 구하시오.",
				a: "56π"
			},
			{
				q: "반지름 6 cm, 모선 9 cm인 원뿔의 겉넓이를 구하시오.",
				a: "90π"
			}
		])
	},
	{
		term: "중1 · 2학기",
		major: "7. 입체도형",
		middle: "입체도형의 겉넓이와 부피",
		minor: "구의 겉넓이와 부피",
		problem: evalQuestion("입체도형 · 단원 마무리 06", "반지름의 길이가 6 cm인 구의 겉넓이와 부피를 차례로 구하시오. (원주율은 π로 나타낸다.)", "144π,288π", [
			{
				tag: "SURFACE",
				q: "반지름 r인 구의 겉넓이 공식은?",
				options: [
					"4πr²",
					"πr²",
					"2πr"
				],
				answer: 0,
				talk: "구의 겉넓이는 같은 반지름을 가진 원 넓이의 네 배인 4πr²이야."
			},
			{
				tag: "PLACE",
				q: "r=6을 겉넓이 공식에 넣은 식은?",
				options: [
					"4π×6²",
					"4π×6",
					"π×6²"
				],
				answer: 0,
				talk: "반지름은 제곱해야 하므로 6²을 넣어."
			},
			{
				tag: "SURFACE",
				q: "구의 겉넓이는?",
				options: [
					"144π cm²",
					"72π cm²",
					"36π cm²"
				],
				answer: 0,
				talk: "4×36π=144π야."
			},
			{
				tag: "VOLUME",
				q: "반지름 r인 구의 부피 공식은?",
				options: [
					"4/3πr³",
					"4πr²",
					"1/3πr²"
				],
				answer: 0,
				talk: "구의 부피는 4/3πr³이야."
			},
			{
				tag: "PLACE",
				q: "r=6을 부피 공식에 넣어 계산할 식은?",
				options: [
					"4/3π×6³",
					"4π×6²",
					"1/3π×6³"
				],
				answer: 0,
				talk: "6³=216이고 216÷3=72로 먼저 줄이면 계산하기 쉬워."
			},
			{
				tag: "VOLUME",
				q: "구의 부피는?",
				options: [
					"288π cm³",
					"216π cm³",
					"144π cm³"
				],
				answer: 0,
				talk: "4×72π=288π야. 겉넓이와 부피 순서로 답을 써."
			}
		], [
			{
				q: "반지름 3 cm인 구의 겉넓이와 부피를 구하시오.",
				a: "36π,36π"
			},
			{
				q: "반지름 9 cm인 구의 겉넓이와 부피를 구하시오.",
				a: "324π,972π"
			},
			{
				q: "반지름 12 cm인 구의 겉넓이와 부피를 구하시오.",
				a: "576π,2304π"
			}
		])
	},
	{
		term: "중1 · 2학기",
		major: "7. 입체도형",
		middle: "다면체와 회전체",
		minor: "정다면체",
		problem: evalQuestion("입체도형 · 교과서 대단원 학습평가 07", "한 꼭짓점에 모인 면의 개수가 5인 정다면체의 면의 개수를 x, 각 면이 정사각형인 정다면체의 모서리의 개수를 y라고 하자. 2x+y의 값을 구하시오.", "52", [
			{
				tag: "FIRST",
				q: "한 꼭짓점에 면 5개가 모이는 정다면체는?",
				options: [
					"정이십면체",
					"정팔면체",
					"정사면체"
				],
				answer: 0,
				talk: "정삼각형 5개가 한 꼭짓점에 모이는 정다면체는 정이십면체야."
			},
			{
				tag: "X",
				q: "정이십면체의 면의 개수 x는?",
				options: [
					"20",
					"12",
					"8"
				],
				answer: 0,
				talk: "이름의 ‘이십’처럼 면이 20개이므로 x=20이야."
			},
			{
				tag: "SECOND",
				q: "각 면의 모양이 정사각형인 정다면체는?",
				options: [
					"정육면체",
					"정십이면체",
					"정팔면체"
				],
				answer: 0,
				talk: "주사위 모양인 정육면체의 여섯 면은 모두 정사각형이야."
			},
			{
				tag: "EDGE",
				q: "정육면체의 모서리는 모두 몇 개인가요?",
				options: [
					"12개",
					"8개",
					"6개"
				],
				answer: 0,
				talk: "위 4개, 아래 4개, 위아래를 잇는 4개를 합쳐 12개야."
			},
			{
				tag: "BUILD",
				q: "x=20, y=12를 2x+y에 넣은 식은?",
				options: [
					"2×20+12",
					"20+2×12",
					"2×(20+12)"
				],
				answer: 0,
				talk: "x 앞에만 2가 곱해져 있으므로 2×20에 y=12를 더해."
			},
			{
				tag: "FINISH",
				q: "2×20+12의 값은?",
				options: [
					"52",
					"64",
					"44"
				],
				answer: 0,
				talk: "40+12=52야. 두 정다면체의 조건을 따로 읽고 마지막에 식에 넣으면 돼."
			}
		], [
			{
				q: "모든 면이 정삼각형이고 한 꼭짓점에 4개 면이 모이는 정다면체의 면 수를 x, 정십이면체의 모서리 수를 y라 할 때 2x+y를 구하시오.",
				a: "46"
			},
			{
				q: "정사면체의 면 수를 x, 정육면체의 모서리 수를 y라 할 때 2x+y를 구하시오.",
				a: "20"
			},
			{
				q: "정이십면체의 꼭짓점 수를 x, 정팔면체의 모서리 수를 y라 할 때 2x+y를 구하시오.",
				a: "36"
			}
		])
	},
	{
		term: "중1 · 2학기",
		major: "7. 입체도형",
		middle: "입체도형의 겉넓이와 부피",
		minor: "구의 겉넓이와 부피",
		problem: evalQuestion("입체도형 · 교과서 대단원 학습평가 08", "반지름이 3 cm인 구 3개가 원기둥 모양의 통에 위아래로 꼭 맞게 들어 있다. 통 속의 빈 공간의 부피를 구하시오. (통의 두께는 생각하지 않고 원주율은 π로 나타낸다.)", "54π", [
			{
				tag: "RADIUS",
				q: "구가 통에 꼭 맞으므로 원기둥 밑면의 반지름은?",
				options: [
					"3 cm",
					"6 cm",
					"9 cm"
				],
				answer: 0,
				talk: "구의 가장 넓은 부분이 통의 밑면에 딱 맞으므로 반지름이 같은 3 cm야."
			},
			{
				tag: "HEIGHT",
				q: "구 한 개의 지름과 구 3개를 쌓은 통의 높이는?",
				options: [
					"6 cm, 18 cm",
					"3 cm, 9 cm",
					"6 cm, 9 cm"
				],
				answer: 0,
				talk: "지름은 반지름의 두 배인 6 cm이고, 세 개를 쌓으면 6×3=18 cm야."
			},
			{
				tag: "CYLINDER",
				q: "원기둥 통의 부피를 구하는 식은?",
				options: [
					"π×3²×18",
					"π×6²×18",
					"2π×3×18"
				],
				answer: 0,
				talk: "원기둥 부피는 밑넓이 πr²에 높이를 곱해."
			},
			{
				tag: "CYLCALC",
				q: "원기둥 통의 부피는?",
				options: [
					"162π cm³",
					"108π cm³",
					"54π cm³"
				],
				answer: 0,
				talk: "π×9×18=162π cm³야."
			},
			{
				tag: "SPHERE",
				q: "반지름 3 cm인 구 한 개의 부피는?",
				options: [
					"36π cm³",
					"27π cm³",
					"12π cm³"
				],
				answer: 0,
				talk: "4/3×π×3³=4/3×27π=36π cm³야."
			},
			{
				tag: "THREE",
				q: "구 3개의 부피는?",
				options: [
					"108π cm³",
					"36π cm³",
					"162π cm³"
				],
				answer: 0,
				talk: "구 한 개가 36π이므로 3개는 108π cm³야."
			},
			{
				tag: "EMPTY",
				q: "통 속 빈 공간의 부피는?",
				options: [
					"162π-108π=54π",
					"162π+108π=270π",
					"108π-162π=-54π"
				],
				answer: 0,
				talk: "통 전체에서 구들이 차지한 부피를 빼면 54π cm³야."
			}
		], [
			{
				q: "반지름 2 cm인 구 3개가 원기둥 통에 꼭 맞게 들어 있을 때 빈 공간의 부피를 구하시오.",
				a: "16π"
			},
			{
				q: "반지름 4 cm인 구 3개가 원기둥 통에 꼭 맞게 들어 있을 때 빈 공간의 부피를 구하시오.",
				a: "128π"
			},
			{
				q: "반지름 3 cm인 구 2개가 원기둥 통에 꼭 맞게 들어 있을 때 빈 공간의 부피를 구하시오.",
				a: "36π"
			}
		])
	},
	{
		term: "중1 · 2학기",
		major: "7. 입체도형",
		middle: "다면체와 회전체",
		minor: "회전체",
		problem: evalQuestion("입체도형 · 교과서 대단원 학습평가 09", "윗면의 반지름이 2 cm, 밑면의 반지름이 5 cm, 높이가 6 cm인 원뿔대를 회전축을 포함하는 평면으로 잘랐다. 단면의 넓이를 구하시오.", "42", [
			{
				tag: "SHAPE",
				q: "원뿔대를 회전축을 포함하는 평면으로 자른 단면의 모양은?",
				options: [
					"사다리꼴",
					"원",
					"직사각형"
				],
				answer: 0,
				talk: "위쪽 원은 짧은 변, 아래쪽 원은 긴 변이 되어 사다리꼴 단면이 생겨."
			},
			{
				tag: "TOP",
				q: "윗면의 반지름이 2 cm이면 단면의 윗변은?",
				options: [
					"지름 4 cm",
					"반지름 2 cm",
					"둘레 4π cm"
				],
				answer: 0,
				talk: "단면은 원의 중심을 지나므로 윗변은 윗면 원의 지름 2×2=4 cm야."
			},
			{
				tag: "BOTTOM",
				q: "밑면의 반지름이 5 cm이면 단면의 아랫변은?",
				options: [
					"지름 10 cm",
					"반지름 5 cm",
					"둘레 10π cm"
				],
				answer: 0,
				talk: "아랫변도 밑면 원의 지름이므로 2×5=10 cm야."
			},
			{
				tag: "HEIGHT",
				q: "단면인 사다리꼴의 높이는?",
				options: [
					"6 cm",
					"5 cm",
					"3 cm"
				],
				answer: 0,
				talk: "회전체의 높이가 그대로 단면 사다리꼴의 높이가 돼."
			},
			{
				tag: "FORMULA",
				q: "사다리꼴의 넓이를 구하는 식은?",
				options: [
					"(윗변+아랫변)×높이÷2",
					"윗변×아랫변×높이",
					"(아랫변-윗변)×높이"
				],
				answer: 0,
				talk: "평행한 두 변을 더하고 높이를 곱한 뒤 2로 나눠."
			},
			{
				tag: "CALC",
				q: "(4+10)×6÷2의 값은?",
				options: [
					"42 cm²",
					"84 cm²",
					"36 cm²"
				],
				answer: 0,
				talk: "14×6÷2=42이므로 단면의 넓이는 42 cm²야."
			}
		], [
			{
				q: "윗면 반지름 3 cm, 밑면 반지름 7 cm, 높이 5 cm인 원뿔대의 축을 포함한 단면 넓이를 구하시오.",
				a: "50"
			},
			{
				q: "윗면 반지름 2 cm, 밑면 반지름 6 cm, 높이 8 cm인 원뿔대의 축을 포함한 단면 넓이를 구하시오.",
				a: "64"
			},
			{
				q: "윗면 반지름 4 cm, 밑면 반지름 9 cm, 높이 6 cm인 원뿔대의 축을 포함한 단면 넓이를 구하시오.",
				a: "78"
			}
		])
	}
];
var unit8Assessment = [
	{
		term: "중1 · 2학기",
		major: "8. 자료의 정리와 해석",
		middle: "자료의 정리",
		minor: "도수분포표",
		problem: evalQuestion("자료의 정리와 해석 · 단원 마무리 01", "어느 반 학생 30명의 통학 시간을 조사하였다. 10분 이상 20분 미만인 계급의 도수는 8명, 20분 이상 30분 미만은 12명, 30분 이상 40분 미만은 6명이다. 나머지 학생은 40분 이상 50분 미만이다. 도수가 가장 큰 계급의 계급값과 마지막 계급의 도수를 차례로 구하시오.", "25,4", [
			{
				tag: "READ",
				q: "주어진 세 계급의 도수를 모두 더하면?",
				options: [
					"26명",
					"30명",
					"20명"
				],
				answer: 0,
				talk: "8+12+6=26명이야."
			},
			{
				tag: "MISSING",
				q: "전체 30명 중 나머지 계급의 도수를 구하는 식은?",
				options: [
					"30-26",
					"30+26",
					"26÷30"
				],
				answer: 0,
				talk: "전체 학생 수에서 이미 센 학생 수를 빼면 마지막 계급의 도수가 나와."
			},
			{
				tag: "MISSING",
				q: "40분 이상 50분 미만인 계급의 도수는?",
				options: [
					"4명",
					"6명",
					"12명"
				],
				answer: 0,
				talk: "30-26=4명이야."
			},
			{
				tag: "MAX",
				q: "도수가 가장 큰 계급은?",
				options: [
					"20분 이상 30분 미만",
					"10분 이상 20분 미만",
					"30분 이상 40분 미만"
				],
				answer: 0,
				talk: "도수 8, 12, 6, 4 중 가장 큰 12가 속한 계급이야."
			},
			{
				tag: "MARK",
				q: "20분 이상 30분 미만인 계급의 계급값을 구하는 식은?",
				options: [
					"(20+30)÷2",
					"30-20",
					"20+30"
				],
				answer: 0,
				talk: "계급값은 계급의 양 끝값의 평균이야."
			},
			{
				tag: "ORDER",
				q: "계급값과 마지막 계급의 도수를 순서대로 쓰면?",
				options: [
					"25, 4",
					"12, 25",
					"4, 25"
				],
				answer: 0,
				talk: "(20+30)÷2=25이고 마지막 도수는 4명이야."
			}
		], [
			{
				q: "전체 40명 중 네 계급의 도수가 9, 14, 11, 나머지일 때 최대 도수 계급값이 15이면 계급값과 나머지 도수를 구하시오.",
				a: "15,6"
			},
			{
				q: "전체 35명 중 세 계급의 도수가 7, 16, 나머지일 때 최대 계급의 계급값이 25이면 계급값과 나머지 도수를 구하시오.",
				a: "25,12"
			},
			{
				q: "전체 50명 중 네 계급의 도수가 13, 18, 9, 나머지일 때 최대 계급의 계급값이 35이면 계급값과 나머지 도수를 구하시오.",
				a: "35,10"
			}
		])
	},
	{
		term: "중1 · 2학기",
		major: "8. 자료의 정리와 해석",
		middle: "자료의 정리",
		minor: "히스토그램과 도수분포다각형",
		problem: evalQuestion("자료의 정리와 해석 · 단원 마무리 02", "계급의 크기가 5인 히스토그램에서 각 직사각형의 높이가 차례로 3, 7, 9, 5, 1이다. 전체 도수와 도수분포다각형에서 가장 높은 점의 양옆에 있는 두 점의 높이의 합을 차례로 구하시오.", "25,12", [
			{
				tag: "MEANING",
				q: "히스토그램에서 각 직사각형의 높이는 무엇을 나타내나요?",
				options: [
					"각 계급의 도수",
					"계급의 크기",
					"자료의 평균"
				],
				answer: 0,
				talk: "계급의 크기가 같을 때 직사각형의 높이는 각 계급에 속한 자료 수인 도수야."
			},
			{
				tag: "TOTAL",
				q: "전체 도수를 구하는 식은?",
				options: [
					"3+7+9+5+1",
					"9×5",
					"3+1"
				],
				answer: 0,
				talk: "모든 계급의 도수를 빠짐없이 더해."
			},
			{
				tag: "TOTAL",
				q: "3+7+9+5+1의 값은?",
				options: [
					"25",
					"24",
					"20"
				],
				answer: 0,
				talk: "차례로 더하면 전체 자료는 25개야."
			},
			{
				tag: "PEAK",
				q: "도수분포다각형에서 가장 높은 점의 높이는?",
				options: [
					"9",
					"7",
					"5"
				],
				answer: 0,
				talk: "직사각형 윗변의 가운데 점을 이으므로 가장 큰 도수 9인 점이 가장 높아."
			},
			{
				tag: "NEIGHBOR",
				q: "높이 9인 점의 바로 양옆 점의 높이는?",
				options: [
					"7과 5",
					"3과 1",
					"9와 9"
				],
				answer: 0,
				talk: "도수의 순서 3,7,9,5,1에서 9의 앞은 7, 뒤는 5야."
			},
			{
				tag: "SUM",
				q: "두 이웃 점의 높이의 합은?",
				options: [
					"12",
					"14",
					"16"
				],
				answer: 0,
				talk: "7+5=12이므로 전체 도수 25와 함께 차례로 써."
			}
		], [
			{
				q: "높이가 2,6,8,7,2인 히스토그램의 전체 도수와 최고점 양옆 높이의 합을 구하시오.",
				a: "25,13"
			},
			{
				q: "높이가 4,9,12,6,3인 히스토그램의 전체 도수와 최고점 양옆 높이의 합을 구하시오.",
				a: "34,15"
			},
			{
				q: "높이가 5,11,8,4인 히스토그램의 전체 도수와 최고점 양옆 높이의 합을 구하시오.",
				a: "28,13"
			}
		])
	},
	{
		term: "중1 · 2학기",
		major: "8. 자료의 정리와 해석",
		middle: "자료의 해석",
		minor: "상대도수",
		problem: evalQuestion("자료의 정리와 해석 · 단원 마무리 03", "A반 40명과 B반 50명의 수학 점수를 조사하였다. 80점 이상인 학생의 상대도수가 A반은 0.35, B반은 0.28일 때, 두 반에서 80점 이상인 학생 수의 합과 두 반 전체에 대한 그 학생들의 상대도수를 차례로 구하시오.", "28,14/45", [
			{
				tag: "A",
				q: "A반에서 80점 이상인 학생 수를 구하는 식은?",
				options: [
					"40×0.35",
					"40÷0.35",
					"40-0.35"
				],
				answer: 0,
				talk: "상대도수=도수÷전체이므로 도수=전체×상대도수야."
			},
			{
				tag: "A",
				q: "40×0.35의 값은?",
				options: [
					"14명",
					"12명",
					"16명"
				],
				answer: 0,
				talk: "0.35=35/100이므로 40×0.35=14야."
			},
			{
				tag: "B",
				q: "B반에서 80점 이상인 학생 수는?",
				options: [
					"14명",
					"16명",
					"12명"
				],
				answer: 0,
				talk: "50×0.28=14명이야."
			},
			{
				tag: "SUM",
				q: "두 반에서 80점 이상인 학생 수의 합은?",
				options: [
					"28명",
					"14명",
					"90명"
				],
				answer: 0,
				talk: "A반 14명과 B반 14명을 더해 28명이야."
			},
			{
				tag: "TOTAL",
				q: "두 반 전체 학생 수는?",
				options: [
					"90명",
					"50명",
					"40명"
				],
				answer: 0,
				talk: "40+50=90명이야."
			},
			{
				tag: "RATIO",
				q: "두 반 전체에 대한 80점 이상 학생의 상대도수는?",
				options: [
					"28/90=14/45",
					"28/40=7/10",
					"28/50=14/25"
				],
				answer: 0,
				talk: "합친 집단의 상대도수는 합친 도수 28을 전체 90으로 나누어 14/45야."
			}
		], [
			{
				q: "A반 30명 중 상대도수 0.4, B반 20명 중 상대도수 0.3일 때 해당 학생 수 합과 전체 상대도수를 구하시오.",
				a: "18,9/25"
			},
			{
				q: "A반 25명 중 상대도수 0.32, B반 35명 중 상대도수 0.4일 때 학생 수 합과 전체 상대도수를 구하시오.",
				a: "22,11/30"
			},
			{
				q: "A반 40명 중 상대도수 0.25, B반 60명 중 상대도수 0.3일 때 학생 수 합과 전체 상대도수를 구하시오.",
				a: "28,7/25"
			}
		])
	},
	{
		term: "중1 · 2학기",
		major: "8. 자료의 정리와 해석",
		middle: "자료의 정리",
		minor: "줄기와 잎 그림",
		problem: evalQuestion("자료의 정리와 해석 · 단원 마무리 04", "다음은 학생 9명의 봉사 활동 시간을 줄기와 잎 그림으로 나타낸 것이다. (줄기|잎, 1|2 5 8, 2|0 0 4 7, 3|1 6) 중앙값과 범위를 차례로 구하시오.", "20,24", [
			{
				tag: "READ",
				q: "줄기 2, 잎 4가 나타내는 시간은?",
				options: [
					"24시간",
					"42시간",
					"6시간"
				],
				answer: 0,
				talk: "줄기는 십의 자리, 잎은 일의 자리이므로 24시간이야."
			},
			{
				tag: "COUNT",
				q: "자료의 개수는 모두 몇 개인가요?",
				options: [
					"9개",
					"8개",
					"10개"
				],
				answer: 0,
				talk: "잎의 개수를 세면 3+4+2=9개야."
			},
			{
				tag: "MIDDLE",
				q: "작은 수부터 놓인 9개 자료의 중앙값은 몇 번째 값인가요?",
				options: [
					"5번째",
					"4번째",
					"6번째"
				],
				answer: 0,
				talk: "자료가 9개이면 한가운데인 (9+1)÷2=5번째 값을 찾아."
			},
			{
				tag: "MEDIAN",
				q: "12, 15, 18, 20, 20, 24, 27, 31, 36의 5번째 값은?",
				options: [
					"20",
					"18",
					"24"
				],
				answer: 0,
				talk: "다섯 번째 값 20이 중앙값이야."
			},
			{
				tag: "RANGE",
				q: "범위를 구할 때 사용하는 계산은?",
				options: [
					"최댓값-최솟값",
					"최댓값+최솟값",
					"자료의 합÷개수"
				],
				answer: 0,
				talk: "범위는 자료가 퍼진 폭이므로 가장 큰 값에서 가장 작은 값을 빼."
			},
			{
				tag: "FINISH",
				q: "36-12를 계산하고 중앙값과 범위를 차례로 쓰면?",
				options: [
					"20, 24",
					"24, 20",
					"20, 48"
				],
				answer: 0,
				talk: "범위는 24이고, 문제에서 요구한 순서는 중앙값 20, 범위 24야."
			}
		], [
			{
				q: "줄기와 잎 그림 (1|1 4 9, 2|2 5 8, 3|0)에서 중앙값과 범위를 구하시오.",
				a: "22,19"
			},
			{
				q: "줄기와 잎 그림 (2|3 5, 3|0 2 7, 4|1)에서 중앙값과 범위를 구하시오.",
				a: "31,18"
			},
			{
				q: "줄기와 잎 그림 (1|6 8, 2|1 4 4 9, 3|2)에서 중앙값과 범위를 구하시오.",
				a: "24,16"
			}
		])
	},
	{
		term: "중1 · 2학기",
		major: "8. 자료의 정리와 해석",
		middle: "자료의 해석",
		minor: "상대도수의 분포",
		problem: evalQuestion("자료의 정리와 해석 · 단원 마무리 05", "A반 40명과 B반 50명의 점수 분포를 네 계급으로 나누었다. 각 계급의 상대도수는 A반이 0.15, 0.25, 0.35, 0.25이고 B반이 0.20, 0.30, 0.28, 0.22이다. 두 반을 합쳤을 때 도수가 가장 큰 계급의 순서와 그 계급의 상대도수를 차례로 구하시오.", "3,14/45", [
			{
				tag: "IDEA",
				q: "두 반의 크기가 다를 때 상대도수끼리 바로 더해도 될까요?",
				options: [
					"안 된다",
					"더하면 된다",
					"큰 쪽만 사용한다"
				],
				answer: 0,
				talk: "A반은 40명, B반은 50명이므로 먼저 각 계급의 실제 도수로 바꾸어야 해."
			},
			{
				tag: "CLASS1",
				q: "첫째 계급의 두 반 도수의 합은?",
				options: [
					"40×0.15+50×0.20=16",
					"0.15+0.20=0.35",
					"40+50=90"
				],
				answer: 0,
				talk: "A반 6명과 B반 10명을 합쳐 16명이야."
			},
			{
				tag: "CLASS2",
				q: "둘째 계급의 두 반 도수의 합은?",
				options: [
					"25명",
					"22명",
					"30명"
				],
				answer: 0,
				talk: "40×0.25=10, 50×0.30=15이므로 25명이야."
			},
			{
				tag: "CLASS3",
				q: "셋째 계급의 두 반 도수의 합은?",
				options: [
					"28명",
					"25명",
					"35명"
				],
				answer: 0,
				talk: "40×0.35=14, 50×0.28=14이므로 28명이야."
			},
			{
				tag: "CLASS4",
				q: "넷째 계급의 두 반 도수의 합은?",
				options: [
					"21명",
					"19명",
					"25명"
				],
				answer: 0,
				talk: "40×0.25=10, 50×0.22=11이므로 21명이야."
			},
			{
				tag: "MAX",
				q: "합친 도수 16, 25, 28, 21 중 가장 큰 계급은?",
				options: [
					"셋째 계급",
					"둘째 계급",
					"넷째 계급"
				],
				answer: 0,
				talk: "가장 큰 도수 28은 셋째 계급이야."
			},
			{
				tag: "RATIO",
				q: "셋째 계급의 합친 상대도수는?",
				options: [
					"28/90=14/45",
					"28/50=14/25",
					"28/40=7/10"
				],
				answer: 0,
				talk: "두 반 전체 90명 중 28명이므로 28÷90=14/45야."
			}
		], [
			{
				q: "A반 20명과 B반 30명의 세 계급 상대도수가 각각 (0.2,0.5,0.3), (0.3,0.4,0.3)일 때 최대 계급 순서와 합친 상대도수를 구하시오.",
				a: "2,11/25"
			},
			{
				q: "A반 50명과 B반 50명의 세 계급 상대도수가 각각 (0.3,0.4,0.3), (0.2,0.5,0.3)일 때 최대 계급 순서와 합친 상대도수를 구하시오.",
				a: "2,9/20"
			},
			{
				q: "A반 30명과 B반 70명의 세 계급 상대도수가 각각 (0.4,0.3,0.3), (0.2,0.5,0.3)일 때 최대 계급 순서와 합친 상대도수를 구하시오.",
				a: "2,11/25"
			}
		])
	}
];
var grade2Assessment = [
	{
		term: "중2 · 2학기",
		major: "8. 경우의 수와 확률",
		middle: "확률",
		minor: "확률의 계산",
		problem: evalQuestion("중2 · 교과서 대단원 학습평가 17", "서로 다른 동전 두 개를 동시에 던질 때, 앞면이 한 개만 나올 확률을 구하시오.", "1/2", [
			{
				tag: "OUTCOMES",
				q: "서로 다른 동전 두 개의 모든 결과 수는?",
				options: [
					"4가지",
					"2가지",
					"3가지"
				],
				answer: 0,
				talk: "(앞,앞), (앞,뒤), (뒤,앞), (뒤,뒤)의 4가지야."
			},
			{
				tag: "TARGET",
				q: "앞면이 한 개만 나오는 결과는?",
				options: [
					"(앞,뒤), (뒤,앞)",
					"(앞,앞)",
					"(뒤,뒤)"
				],
				answer: 0,
				talk: "첫째만 앞면이거나 둘째만 앞면인 두 경우야."
			},
			{
				tag: "COUNT",
				q: "조건에 맞는 경우의 수는?",
				options: [
					"2",
					"1",
					"4"
				],
				answer: 0,
				talk: "네 결과 중 두 결과가 조건을 만족해."
			},
			{
				tag: "PROBABILITY",
				q: "확률을 분수로 나타내면?",
				options: [
					"2/4",
					"1/4",
					"3/4"
				],
				answer: 0,
				talk: "전체 4가지 중 원하는 결과가 2가지이므로 2/4야."
			},
			{
				tag: "SIMPLIFY",
				q: "2/4를 약분하면?",
				options: [
					"1/2",
					"2/3",
					"1/4"
				],
				answer: 0,
				talk: "분자와 분모를 2로 나누면 1/2이야."
			}
		], [
			{
				q: "서로 다른 동전 세 개를 던질 때 모두 앞면일 확률을 구하시오.",
				a: "1/8"
			},
			{
				q: "서로 다른 동전 두 개를 던질 때 같은 면이 나올 확률을 구하시오.",
				a: "1/2"
			},
			{
				q: "서로 다른 동전 세 개를 던질 때 앞면이 두 개 나올 확률을 구하시오.",
				a: "3/8"
			}
		])
	},
	{
		term: "중2 · 2학기",
		major: "8. 경우의 수와 확률",
		middle: "확률",
		minor: "확률의 기본 성질",
		problem: evalQuestion("중2 · 교과서 중단원 학습점검 15", "어떤 사건 A가 일어날 확률이 0.35일 때, 사건 A가 일어나지 않을 확률을 구하시오.", "0.65", [
			{
				tag: "COMPLEMENT",
				q: "A가 일어나는 경우와 일어나지 않는 경우를 합치면?",
				options: [
					"전체 경우",
					"A만의 경우",
					"불가능한 경우"
				],
				answer: 0,
				talk: "두 경우는 겹치지 않으면서 전체를 모두 채워."
			},
			{
				tag: "TOTAL",
				q: "전체 사건의 확률은?",
				options: [
					"1",
					"0",
					"0.35"
				],
				answer: 0,
				talk: "반드시 일어나는 전체 사건의 확률은 1이야."
			},
			{
				tag: "EQUATION",
				q: "A가 일어나지 않을 확률을 x라 할 때 식은?",
				options: [
					"0.35+x=1",
					"0.35x=1",
					"x-0.35=1"
				],
				answer: 0,
				talk: "서로 여사건인 두 확률의 합은 1이야."
			},
			{
				tag: "SUBTRACT",
				q: "x를 구하는 계산은?",
				options: [
					"1-0.35",
					"1+0.35",
					"0.35-1"
				],
				answer: 0,
				talk: "전체 1에서 A의 확률을 빼."
			},
			{
				tag: "ANSWER",
				q: "1-0.35의 값은?",
				options: [
					"0.65",
					"0.75",
					"0.35"
				],
				answer: 0,
				talk: "A가 일어나지 않을 확률은 0.65야."
			}
		], [
			{
				q: "P(A)=0.42일 때 A가 일어나지 않을 확률을 구하시오.",
				a: "0.58"
			},
			{
				q: "P(A)=3/8일 때 A가 일어나지 않을 확률을 구하시오.",
				a: "5/8"
			},
			{
				q: "P(A)=0.7일 때 A가 일어나지 않을 확률을 구하시오.",
				a: "0.3"
			}
		])
	},
	{
		term: "중2 · 2학기",
		major: "8. 경우의 수와 확률",
		middle: "확률",
		minor: "확률의 뜻",
		problem: evalQuestion("중2 · 교과서 중단원 학습점검 14", "주머니에 크기와 모양이 같은 빨간 공 3개와 파란 공 2개가 있다. 공 한 개를 꺼낼 때 빨간 공이 나올 확률을 구하시오.", "3/5", [
			{
				tag: "EQUAL",
				q: "각 공이 뽑힐 가능성은 어떤가요?",
				options: [
					"모두 같다",
					"빨간 공이 더 크다",
					"파란 공이 더 크다"
				],
				answer: 0,
				talk: "크기와 모양이 같고 무작위로 뽑으므로 각 공의 가능성은 같아."
			},
			{
				tag: "TOTAL",
				q: "주머니 속 전체 공의 수는?",
				options: [
					"5개",
					"3개",
					"2개"
				],
				answer: 0,
				talk: "3+2=5개야."
			},
			{
				tag: "FAVORABLE",
				q: "빨간 공이 나오는 경우의 수는?",
				options: [
					"3",
					"2",
					"5"
				],
				answer: 0,
				talk: "빨간 공이 3개이므로 원하는 경우는 3가지야."
			},
			{
				tag: "FORMULA",
				q: "확률을 구하는 식은?",
				options: [
					"3/5",
					"2/5",
					"5/3"
				],
				answer: 0,
				talk: "원하는 경우의 수를 전체 경우의 수로 나눠."
			},
			{
				tag: "ANSWER",
				q: "빨간 공이 나올 확률은?",
				options: [
					"3/5",
					"3/2",
					"2/3"
				],
				answer: 0,
				talk: "전체 5개 중 빨간 공 3개이므로 3/5이야."
			}
		], [
			{
				q: "흰 공 4개, 검은 공 3개 중 한 개를 뽑을 때 검은 공일 확률을 구하시오.",
				a: "3/7"
			},
			{
				q: "1부터 8까지 적힌 카드 중 한 장을 뽑을 때 짝수일 확률을 구하시오.",
				a: "1/2"
			},
			{
				q: "1부터 10까지 적힌 카드 중 한 장을 뽑을 때 3의 배수일 확률을 구하시오.",
				a: "3/10"
			}
		])
	},
	{
		term: "중2 · 2학기",
		major: "8. 경우의 수와 확률",
		middle: "경우의 수",
		minor: "사건과 경우의 수",
		problem: evalQuestion("중2 · 교과서 대단원 학습평가 13", "서로 다른 두 주사위를 동시에 던질 때, 나온 눈의 합이 8이 되는 경우의 수를 구하시오.", "5", [
			{
				tag: "ORDER",
				q: "두 주사위의 눈 (2,6)과 (6,2)는 같은 결과인가요?",
				options: [
					"서로 다른 결과",
					"같은 결과",
					"셀 수 없다"
				],
				answer: 0,
				talk: "주사위가 서로 다르므로 어느 주사위에서 나온 눈인지 구별해."
			},
			{
				tag: "START",
				q: "첫째 눈이 2일 때 합이 8인 둘째 눈은?",
				options: [
					"6",
					"4",
					"8"
				],
				answer: 0,
				talk: "2+6=8이야."
			},
			{
				tag: "LIST",
				q: "합이 8인 눈의 순서쌍은?",
				options: [
					"(2,6),(3,5),(4,4),(5,3),(6,2)",
					"(2,6),(3,5),(4,4)",
					"(1,7),(2,6)"
				],
				answer: 0,
				talk: "각 눈은 1부터 6까지이므로 가능한 순서쌍을 빠짐없이 써."
			},
			{
				tag: "VALID",
				q: "목록의 각 수가 주사위 눈의 범위에 있나요?",
				options: [
					"모두 1~6이다",
					"7이 들어 있다",
					"0이 들어 있다"
				],
				answer: 0,
				talk: "다섯 순서쌍은 모두 실제 주사위에서 가능해."
			},
			{
				tag: "COUNT",
				q: "합이 8인 경우의 수는?",
				options: [
					"5",
					"3",
					"6"
				],
				answer: 0,
				talk: "목록에 있는 순서쌍이 5개야."
			}
		], [
			{
				q: "서로 다른 두 주사위의 눈의 합이 7인 경우의 수를 구하시오.",
				a: "6"
			},
			{
				q: "서로 다른 두 주사위의 눈의 합이 5인 경우의 수를 구하시오.",
				a: "4"
			},
			{
				q: "서로 다른 두 주사위의 눈의 합이 10인 경우의 수를 구하시오.",
				a: "3"
			}
		])
	},
	{
		term: "중2 · 2학기",
		major: "7. 도형의 닮음과 피타고라스 정리",
		middle: "피타고라스 정리",
		minor: "피타고라스 정리의 활용",
		problem: evalQuestion("중2 · 교과서 대단원 학습평가 12", "길이가 10 m인 사다리를 벽에 기대어 놓았더니 사다리의 아래쪽 끝이 벽에서 6 m 떨어졌다. 사다리의 위쪽 끝의 높이를 구하시오.", "8", [
			{
				tag: "TRIANGLE",
				q: "벽, 바닥, 사다리가 만드는 삼각형은?",
				options: [
					"직각삼각형",
					"정삼각형",
					"이등변삼각형"
				],
				answer: 0,
				talk: "벽과 바닥이 수직이므로 직각삼각형이야."
			},
			{
				tag: "HYPOTENUSE",
				q: "빗변에 해당하는 길이는?",
				options: [
					"사다리 10 m",
					"바닥 6 m",
					"높이"
				],
				answer: 0,
				talk: "직각의 맞은편인 사다리가 빗변이야."
			},
			{
				tag: "EQUATION",
				q: "높이를 h라 할 때 피타고라스 식은?",
				options: [
					"h²+6²=10²",
					"h²+10²=6²",
					"h+6=10"
				],
				answer: 0,
				talk: "두 직각변의 제곱의 합이 빗변의 제곱과 같아."
			},
			{
				tag: "SQUARE",
				q: "h²=10²-6²의 값은?",
				options: [
					"64",
					"16",
					"136"
				],
				answer: 0,
				talk: "100-36=64야."
			},
			{
				tag: "ANSWER",
				q: "양의 길이 h는?",
				options: [
					"8 m",
					"64 m",
					"4 m"
				],
				answer: 0,
				talk: "h²=64이고 길이는 양수이므로 h=8 m야."
			}
		], [
			{
				q: "13 m 사다리의 밑이 벽에서 5 m 떨어졌을 때 높이를 구하시오.",
				a: "12"
			},
			{
				q: "17 m 사다리의 밑이 벽에서 8 m 떨어졌을 때 높이를 구하시오.",
				a: "15"
			},
			{
				q: "25 m 사다리의 밑이 벽에서 7 m 떨어졌을 때 높이를 구하시오.",
				a: "24"
			}
		])
	},
	{
		term: "중2 · 2학기",
		major: "7. 도형의 닮음과 피타고라스 정리",
		middle: "피타고라스 정리",
		minor: "피타고라스 정리",
		problem: evalQuestion("중2 · 교과서 중단원 학습점검 11", "두 직각변의 길이가 각각 9 cm, 12 cm인 직각삼각형의 빗변의 길이를 구하시오.", "15", [
			{
				tag: "FORMULA",
				q: "빗변을 c라 할 때 세울 식은?",
				options: [
					"9²+12²=c²",
					"9²+c²=12²",
					"9+12=c"
				],
				answer: 0,
				talk: "직각변 제곱의 합은 빗변 제곱과 같아."
			},
			{
				tag: "SQUARE1",
				q: "9²의 값은?",
				options: [
					"81",
					"18",
					"9"
				],
				answer: 0,
				talk: "9×9=81이야."
			},
			{
				tag: "SQUARE2",
				q: "12²의 값은?",
				options: [
					"144",
					"24",
					"122"
				],
				answer: 0,
				talk: "12×12=144야."
			},
			{
				tag: "ADD",
				q: "c²=81+144의 값은?",
				options: [
					"225",
					"165",
					"25"
				],
				answer: 0,
				talk: "81+144=225야."
			},
			{
				tag: "ROOT",
				q: "c²=225이고 c가 길이일 때 c는?",
				options: [
					"15 cm",
					"-15 cm",
					"225 cm"
				],
				answer: 0,
				talk: "15²=225이고 길이는 양수야."
			}
		], [
			{
				q: "두 직각변이 6 cm, 8 cm인 직각삼각형의 빗변을 구하시오.",
				a: "10"
			},
			{
				q: "두 직각변이 5 cm, 12 cm인 직각삼각형의 빗변을 구하시오.",
				a: "13"
			},
			{
				q: "두 직각변이 8 cm, 15 cm인 직각삼각형의 빗변을 구하시오.",
				a: "17"
			}
		])
	},
	{
		term: "중2 · 2학기",
		major: "7. 도형의 닮음과 피타고라스 정리",
		middle: "도형의 닮음",
		minor: "평행선 사이의 선분의 길이의 비",
		problem: evalQuestion("중2 · 교과서 중단원 학습점검 10", "△ABC에서 D는 AB 위의 점, E는 AC 위의 점이고 DE∥BC이다. AD:DB=2:3, AE=8 cm일 때, EC의 길이를 구하시오.", "12", [
			{
				tag: "PARALLEL",
				q: "DE∥BC일 때 두 변이 나뉜 비의 관계는?",
				options: [
					"AD:DB=AE:EC",
					"AD:AB=EC:AC",
					"AD:DB=EC:AE"
				],
				answer: 0,
				talk: "삼각형에서 한 변에 평행한 선은 다른 두 변을 같은 비로 나눠."
			},
			{
				tag: "SUBSTITUTE",
				q: "주어진 값을 넣은 비례식은?",
				options: [
					"2:3=8:EC",
					"2:3=EC:8",
					"2+3=8+EC"
				],
				answer: 0,
				talk: "AD:DB와 AE:EC의 자리를 맞춰 넣어."
			},
			{
				tag: "UNIT",
				q: "비 2에 해당하는 실제 길이가 8 cm이면 비 1은?",
				options: [
					"4 cm",
					"6 cm",
					"16 cm"
				],
				answer: 0,
				talk: "8÷2=4 cm야."
			},
			{
				tag: "TARGET",
				q: "EC는 비의 몇 몫인가요?",
				options: [
					"3몫",
					"2몫",
					"5몫"
				],
				answer: 0,
				talk: "AE:EC=2:3이므로 EC는 세 몫이야."
			},
			{
				tag: "ANSWER",
				q: "EC의 길이는?",
				options: [
					"4×3=12 cm",
					"8×3=24 cm",
					"8÷3 cm"
				],
				answer: 0,
				talk: "한 몫 4 cm를 세 번 모으면 12 cm야."
			}
		], [
			{
				q: "AD:DB=3:2, AE=12 cm일 때 EC를 구하시오.",
				a: "8"
			},
			{
				q: "AD:DB=2:5, AE=6 cm일 때 EC를 구하시오.",
				a: "15"
			},
			{
				q: "AD:DB=4:3, EC=9 cm일 때 AE를 구하시오.",
				a: "12"
			}
		])
	},
	{
		term: "중2 · 2학기",
		major: "7. 도형의 닮음과 피타고라스 정리",
		middle: "도형의 닮음",
		minor: "삼각형의 닮음 조건",
		problem: evalQuestion("중2 · 교과서 중단원 학습점검 09", "△ABC와 △DEF에서 ∠A=∠D이고 AB:DE=AC:DF=2:3이다. AC=8 cm, DF=x cm일 때, x의 값을 구하시오.", "12", [
			{
				tag: "CONDITION",
				q: "두 변의 길이의 비가 같고 그 끼인각이 같을 때의 닮음 조건은?",
				options: [
					"SAS 닮음",
					"SSS 합동",
					"AA 합동"
				],
				answer: 0,
				talk: "두 변의 비와 그 끼인각이 같으므로 SAS 닮음이야."
			},
			{
				tag: "PAIR",
				q: "서로 대응하는 변은?",
				options: [
					"AC와 DF",
					"AC와 DE",
					"AB와 DF"
				],
				answer: 0,
				talk: "주어진 비 AC:DF에서 두 변이 대응해."
			},
			{
				tag: "RATIO",
				q: "AC:DF=2:3에 값을 넣으면?",
				options: [
					"8:x=2:3",
					"8:x=3:2",
					"8+x=5"
				],
				answer: 0,
				talk: "작은 삼각형과 큰 삼각형의 순서를 유지해."
			},
			{
				tag: "SCALE",
				q: "비 2가 8 cm이면 비 1은?",
				options: [
					"4 cm",
					"6 cm",
					"16 cm"
				],
				answer: 0,
				talk: "8÷2=4 cm야."
			},
			{
				tag: "ANSWER",
				q: "비 3에 해당하는 x는?",
				options: [
					"12 cm",
					"24 cm",
					"6 cm"
				],
				answer: 0,
				talk: "4×3=12 cm야."
			}
		], [
			{
				q: "닮음비가 3:5이고 작은 쪽 대응변이 9 cm일 때 큰 쪽 대응변을 구하시오.",
				a: "15"
			},
			{
				q: "닮음비가 4:7이고 작은 쪽 대응변이 12 cm일 때 큰 쪽 대응변을 구하시오.",
				a: "21"
			},
			{
				q: "닮음비가 2:3이고 큰 쪽 대응변이 18 cm일 때 작은 쪽 대응변을 구하시오.",
				a: "12"
			}
		])
	},
	{
		term: "중2 · 2학기",
		major: "7. 도형의 닮음과 피타고라스 정리",
		middle: "도형의 닮음",
		minor: "닮은 도형",
		problem: evalQuestion("중2 · 교과서 중단원 학습점검 08", "두 닮은 도형의 닮음비가 3:5이고 작은 도형의 넓이가 36 cm²일 때, 큰 도형의 넓이를 구하시오.", "100", [
			{
				tag: "LENGTH RATIO",
				q: "두 도형의 닮음비는?",
				options: [
					"3:5",
					"9:25",
					"36:100"
				],
				answer: 0,
				talk: "닮음비는 대응하는 길이의 비 3:5야."
			},
			{
				tag: "AREA RULE",
				q: "넓이의 비는 닮음비를 어떻게 하여 구하나요?",
				options: [
					"각 항을 제곱",
					"각 항을 더함",
					"각 항을 세제곱"
				],
				answer: 0,
				talk: "닮은 평면도형의 넓이비는 닮음비의 제곱이야."
			},
			{
				tag: "AREA RATIO",
				q: "넓이의 비는?",
				options: [
					"9:25",
					"3:5",
					"27:125"
				],
				answer: 0,
				talk: "3²:5²=9:25야."
			},
			{
				tag: "ONE PART",
				q: "넓이 36 cm²가 비 9에 해당하면 한 몫은?",
				options: [
					"4 cm²",
					"9 cm²",
					"36/25 cm²"
				],
				answer: 0,
				talk: "36÷9=4야."
			},
			{
				tag: "ANSWER",
				q: "큰 도형의 넓이는?",
				options: [
					"4×25=100 cm²",
					"36×5=180 cm²",
					"36+25=61 cm²"
				],
				answer: 0,
				talk: "큰 쪽은 25몫이므로 4×25=100 cm²야."
			}
		], [
			{
				q: "닮음비가 2:3이고 작은 넓이가 20 cm²일 때 큰 넓이를 구하시오.",
				a: "45"
			},
			{
				q: "닮음비가 1:4이고 작은 넓이가 7 cm²일 때 큰 넓이를 구하시오.",
				a: "112"
			},
			{
				q: "닮음비가 3:4이고 큰 넓이가 64 cm²일 때 작은 넓이를 구하시오.",
				a: "36"
			}
		])
	},
	{
		term: "중2 · 2학기",
		major: "6. 삼각형과 사각형의 성질",
		middle: "사각형의 성질",
		minor: "여러 가지 사각형",
		problem: evalQuestion("중2 · 교과서 대단원 학습평가 07", "두 대각선의 길이가 각각 16 cm, 12 cm인 마름모의 넓이를 구하시오.", "96", [
			{
				tag: "PROPERTY",
				q: "마름모의 두 대각선은 어떻게 만나나요?",
				options: [
					"서로 수직이등분",
					"서로 평행",
					"한 점에서 만나지 않음"
				],
				answer: 0,
				talk: "마름모의 대각선은 서로를 수직으로 이등분해."
			},
			{
				tag: "FORMULA",
				q: "두 대각선의 길이가 p, q인 마름모 넓이는?",
				options: [
					"p×q/2",
					"p×q",
					"(p+q)×2"
				],
				answer: 0,
				talk: "대각선이 만드는 네 직각삼각형을 합치면 p×q÷2야."
			},
			{
				tag: "SUBSTITUTE",
				q: "주어진 길이를 넣은 식은?",
				options: [
					"16×12/2",
					"16+12/2",
					"16×12"
				],
				answer: 0,
				talk: "두 대각선 16과 12를 곱하고 2로 나눠."
			},
			{
				tag: "MULTIPLY",
				q: "16×12는?",
				options: [
					"192",
					"96",
					"28"
				],
				answer: 0,
				talk: "16×12=192야."
			},
			{
				tag: "ANSWER",
				q: "192÷2의 값은?",
				options: [
					"96 cm²",
					"192 cm²",
					"48 cm²"
				],
				answer: 0,
				talk: "마름모의 넓이는 96 cm²야."
			}
		], [
			{
				q: "대각선이 10 cm, 8 cm인 마름모의 넓이를 구하시오.",
				a: "40"
			},
			{
				q: "대각선이 18 cm, 14 cm인 마름모의 넓이를 구하시오.",
				a: "126"
			},
			{
				q: "대각선이 20 cm, 15 cm인 마름모의 넓이를 구하시오.",
				a: "150"
			}
		])
	},
	{
		term: "중2 · 2학기",
		major: "6. 삼각형과 사각형의 성질",
		middle: "사각형의 성질",
		minor: "평행사변형이 되는 조건",
		problem: evalQuestion("중2 · 교과서 중단원 학습점검 06", "사각형 ABCD의 두 대각선 AC와 BD가 점 O에서 만나고 AO=OC, BO=OD이다. 이 사각형이 평행사변형임을 판단하시오.", "평행사변형", [
			{
				tag: "READ",
				q: "AO=OC가 뜻하는 것은?",
				options: [
					"O가 AC의 중점",
					"AC=BD",
					"AO가 OC에 수직"
				],
				answer: 0,
				talk: "O가 AC를 같은 길이로 나누므로 AC의 중점이야."
			},
			{
				tag: "READ",
				q: "BO=OD가 뜻하는 것은?",
				options: [
					"O가 BD의 중점",
					"BD가 AC에 수직",
					"B와 D가 같다"
				],
				answer: 0,
				talk: "O가 BD도 같은 길이로 나눠."
			},
			{
				tag: "DIAGONALS",
				q: "두 조건을 합치면 두 대각선은?",
				options: [
					"서로를 이등분한다",
					"길이가 같다",
					"서로 평행하다"
				],
				answer: 0,
				talk: "교점 O가 두 대각선 모두의 중점이야."
			},
			{
				tag: "CONDITION",
				q: "두 대각선이 서로를 이등분하는 사각형은?",
				options: [
					"평행사변형",
					"항상 정사각형",
					"항상 사다리꼴"
				],
				answer: 0,
				talk: "평행사변형이 되는 대표 조건이야."
			},
			{
				tag: "ANSWER",
				q: "사각형 ABCD는 어떤 사각형인가요?",
				options: [
					"평행사변형",
					"삼각형",
					"원"
				],
				answer: 0,
				talk: "두 대각선이 서로를 이등분하므로 평행사변형이야."
			}
		], [
			{
				q: "한 쌍의 대변이 평행하고 길이도 같은 사각형을 판단하시오.",
				a: "평행사변형"
			},
			{
				q: "두 쌍의 대변의 길이가 각각 같은 사각형을 판단하시오.",
				a: "평행사변형"
			},
			{
				q: "두 쌍의 대각의 크기가 각각 같은 사각형을 판단하시오.",
				a: "평행사변형"
			}
		])
	},
	{
		term: "중2 · 2학기",
		major: "6. 삼각형과 사각형의 성질",
		middle: "삼각형의 성질",
		minor: "직각삼각형의 합동",
		problem: evalQuestion("중2 · 교과서 중단원 학습점검 03", "두 직각삼각형 ABC와 DEF에서 ∠C=∠F=90°, AB=DE, AC=DF이다. 두 삼각형의 합동 조건을 쓰시오.", "RHS", [
			{
				tag: "RIGHT",
				q: "두 삼각형에서 같은 각은?",
				options: [
					"직각 ∠C와 ∠F",
					"∠A와 ∠D",
					"모든 각"
				],
				answer: 0,
				talk: "두 삼각형 모두 직각삼각형이야."
			},
			{
				tag: "HYPOTENUSE",
				q: "각 직각삼각형의 빗변은?",
				options: [
					"AB와 DE",
					"AC와 DF",
					"BC와 EF"
				],
				answer: 0,
				talk: "직각의 맞은편 변 AB와 DE가 빗변이야."
			},
			{
				tag: "GIVEN1",
				q: "길이가 같다고 주어진 빗변은?",
				options: [
					"AB=DE",
					"AC=DF",
					"BC=EF"
				],
				answer: 0,
				talk: "문제에서 AB=DE라고 했어."
			},
			{
				tag: "GIVEN2",
				q: "길이가 같다고 주어진 한 직각변은?",
				options: [
					"AC=DF",
					"AB=DE",
					"BC=DE"
				],
				answer: 0,
				talk: "AC와 DF는 각각 한 직각변이야."
			},
			{
				tag: "CONDITION",
				q: "빗변과 한 직각변이 각각 같은 합동 조건은?",
				options: [
					"RHS 합동",
					"SAS 합동",
					"AA 닮음"
				],
				answer: 0,
				talk: "두 직각삼각형은 RHS 합동이야."
			}
		], [
			{
				q: "두 직각삼각형의 빗변과 한 예각이 각각 같을 때 합동 조건을 쓰시오.",
				a: "RHA"
			},
			{
				q: "직각삼각형에서 빗변과 한 직각변이 각각 같을 때 합동 조건을 쓰시오.",
				a: "RHS"
			},
			{
				q: "직각삼각형에서 빗변과 한 예각이 각각 같을 때 합동 조건을 쓰시오.",
				a: "RHA"
			}
		])
	},
	{
		term: "중2 · 2학기",
		major: "7. 도형의 닮음과 피타고라스 정리",
		middle: "도형의 닮음",
		minor: "삼각형의 무게중심",
		problem: evalQuestion("중2 · 교과서 중단원 학습점검 16", "△ABC에서 D는 변 BC의 중점이고, G는 △ABC의 무게중심이다. AG=10 cm일 때, GD의 길이를 구하시오.", "5", [
			{
				tag: "GOAL",
				q: "이 문제에서 구해야 하는 선분은 무엇인가요?",
				options: [
					"GD",
					"AG",
					"BC"
				],
				answer: 0,
				talk: "중선 AD에서 무게중심 G와 중점 D 사이의 짧은 부분 GD를 구해야 해."
			},
			{
				tag: "MIDPOINT",
				q: "D가 변 BC의 중점이라는 말의 뜻은?",
				options: [
					"BD=DC",
					"AB=AC",
					"AD=BC"
				],
				answer: 0,
				talk: "중점은 선분을 길이가 같은 두 부분으로 나누는 점이므로 BD=DC야."
			},
			{
				tag: "MEDIAN",
				q: "꼭짓점 A와 변 BC의 중점 D를 이은 AD를 무엇이라고 하나요?",
				options: [
					"중선",
					"각의 이등분선",
					"수직이등분선"
				],
				answer: 0,
				talk: "삼각형의 꼭짓점과 그 맞은편 변의 중점을 이은 선분을 중선이라고 해."
			},
			{
				tag: "CENTROID",
				q: "삼각형의 무게중심 G는 어떤 선들이 만나는 점인가요?",
				options: [
					"세 중선",
					"세 내각의 이등분선",
					"세 변의 수직이등분선"
				],
				answer: 0,
				talk: "무게중심은 삼각형의 세 중선이 만나는 점이야. 그래서 G는 중선 AD 위에 있어."
			},
			{
				tag: "RATIO",
				q: "무게중심이 한 중선을 나누는 비 AG:GD는?",
				options: [
					"2:1",
					"1:2",
					"1:1"
				],
				answer: 0,
				talk: "무게중심은 중선을 꼭짓점 쪽부터 2:1로 나눠. 그림에서는 AG가 두 몫, GD가 한 몫이야."
			},
			{
				tag: "ONE PART",
				q: "AG=10 cm가 비의 2에 해당할 때, 비의 1에 해당하는 길이를 구하는 식은?",
				options: [
					"10÷2",
					"10×2",
					"10÷3"
				],
				answer: 0,
				talk: "두 몫의 길이가 10 cm이므로 한 몫은 10을 2로 나누어 구해."
			},
			{
				tag: "CALCULATE",
				q: "10÷2를 계산하면?",
				options: [
					"5",
					"20",
					"10/3"
				],
				answer: 0,
				talk: "10을 2등분하면 한 몫은 5 cm야."
			},
			{
				tag: "ANSWER",
				q: "비의 1에 해당하는 GD의 길이는?",
				options: [
					"5 cm",
					"10 cm",
					"15 cm"
				],
				answer: 0,
				talk: "GD는 한 몫이므로 5 cm야."
			},
			{
				tag: "CHECK",
				q: "AG=10 cm, GD=5 cm일 때 AG:GD를 확인하면?",
				options: [
					"10:5=2:1",
					"10:5=1:2",
					"10:5=1:1"
				],
				answer: 0,
				talk: "10:5의 두 수를 5로 나누면 2:1이므로 무게중심의 성질에 맞아."
			}
		], [
			{
				q: "△ABC의 무게중심이 G이고 D가 BC의 중점이다. AG=14 cm일 때 GD를 구하시오.",
				a: "7"
			},
			{
				q: "같은 조건에서 AG=18 cm일 때 GD를 구하시오.",
				a: "9"
			},
			{
				q: "같은 조건에서 GD=6 cm일 때 AG를 구하시오.",
				a: "12"
			}
		])
	},
	{
		term: "중2 · 2학기",
		major: "6. 삼각형과 사각형의 성질",
		middle: "삼각형의 성질",
		minor: "삼각형의 내심",
		problem: evalQuestion("중2 · 교과서 중단원 학습점검 08", "△ABC의 내심을 I라고 하자. ∠A=70°일 때, ∠BIC의 크기를 구하시오.", "125", [
			{
				tag: "GOAL",
				q: "이 문제에서 구해야 하는 각은 무엇인가요?",
				options: [
					"∠BIC",
					"∠BAC",
					"∠IBC"
				],
				answer: 0,
				talk: "꼭짓점이 내심 I인 ∠BIC를 구해야 해. 그림 가운데 x°로 표시된 각이야."
			},
			{
				tag: "INCENTER",
				q: "I가 삼각형의 내심이라는 말의 뜻은?",
				options: [
					"세 내각의 이등분선의 교점",
					"세 변의 수직이등분선의 교점",
					"세 중선의 교점"
				],
				answer: 0,
				talk: "내심은 세 내각을 각각 반으로 나누는 이등분선이 만나는 점이야."
			},
			{
				tag: "ANGLE SUM",
				q: "∠A=70°일 때 ∠B+∠C의 크기는?",
				options: [
					"110°",
					"70°",
					"290°"
				],
				answer: 0,
				talk: "삼각형의 세 내각의 합은 180°이므로 ∠B+∠C=180°-70°=110°야."
			},
			{
				tag: "HALF B",
				q: "BI가 ∠B의 이등분선일 때 ∠IBC는?",
				options: [
					"∠B/2",
					"2∠B",
					"∠B"
				],
				answer: 0,
				talk: "BI가 ∠B를 똑같이 나누므로 ∠IBC는 ∠B의 절반이야."
			},
			{
				tag: "HALF C",
				q: "CI가 ∠C의 이등분선일 때 ∠BCI는?",
				options: [
					"∠C/2",
					"2∠C",
					"∠C"
				],
				answer: 0,
				talk: "CI도 ∠C를 똑같이 나누므로 ∠BCI는 ∠C의 절반이야."
			},
			{
				tag: "ADD HALVES",
				q: "∠IBC+∠BCI의 크기는?",
				options: [
					"(∠B+∠C)/2=55°",
					"∠B+∠C=110°",
					"(∠B+∠C)×2=220°"
				],
				answer: 0,
				talk: "두 각은 각각 ∠B와 ∠C의 절반이므로 합도 110°의 절반인 55°야."
			},
			{
				tag: "TRIANGLE BIC",
				q: "△BIC의 세 내각의 합으로 세울 수 있는 식은?",
				options: [
					"∠BIC+55°=180°",
					"∠BIC+110°=180°",
					"2∠BIC+55°=180°"
				],
				answer: 0,
				talk: "△BIC의 세 각은 ∠BIC, ∠IBC, ∠BCI야. 뒤의 두 각의 합이 55°이므로 x+55=180이야."
			},
			{
				tag: "SOLVE",
				q: "∠BIC+55°=180°에서 ∠BIC의 크기는?",
				options: [
					"125°",
					"55°",
					"110°"
				],
				answer: 0,
				talk: "180°에서 55°를 빼면 ∠BIC=125°야."
			},
			{
				tag: "RULE",
				q: "이 풀이를 ∠A를 이용한 식으로 정리하면?",
				options: [
					"∠BIC=90°+∠A/2",
					"∠BIC=180°-∠A",
					"∠BIC=∠A/2"
				],
				answer: 0,
				talk: "180°-(180°-∠A)/2=90°+∠A/2야. 공식도 방금 계산한 흐름에서 나온 거야."
			}
		], [
			{
				q: "△ABC의 내심이 I이고 ∠A=60°일 때 ∠BIC의 크기를 구하시오.",
				a: "120"
			},
			{
				q: "△ABC의 내심이 I이고 ∠A=48°일 때 ∠BIC의 크기를 구하시오.",
				a: "114"
			},
			{
				q: "△ABC의 내심이 I이고 ∠A=86°일 때 ∠BIC의 크기를 구하시오.",
				a: "133"
			}
		])
	},
	{
		term: "중2 · 2학기",
		major: "6. 삼각형과 사각형의 성질",
		middle: "삼각형의 성질",
		minor: "삼각형의 외심",
		problem: evalQuestion("중2 · 교과서 중단원 학습점검 07", "△ABC의 외심을 O라고 하자. ∠BAC=55°일 때, 작은 쪽 ∠BOC의 크기를 구하시오.", "110", [
			{
				tag: "GOAL",
				q: "이 문제에서 구해야 하는 각은 무엇인가요?",
				options: [
					"∠BOC",
					"∠BAC",
					"∠ABC"
				],
				answer: 0,
				talk: "꼭짓점이 외심 O인 중심각 ∠BOC를 구해야 해. 그림에서 x°로 표시된 각이야."
			},
			{
				tag: "CENTER",
				q: "O가 △ABC의 외심이라는 말에서 알 수 있는 것은?",
				options: [
					"OA=OB=OC",
					"OA=AB=BC",
					"∠A=∠B=∠C"
				],
				answer: 0,
				talk: "외심은 세 꼭짓점에서 같은 거리에 있으므로 OA, OB, OC는 모두 외접원의 반지름이야."
			},
			{
				tag: "SAME ARC",
				q: "∠BAC이 양 끝점으로 삼아 바라보는 호는?",
				options: [
					"호 BC",
					"호 AB",
					"호 AC"
				],
				answer: 0,
				talk: "∠BAC의 두 변은 AB와 AC이므로 원 위의 B와 C를 연결하는 호 BC를 바라봐."
			},
			{
				tag: "CENTRAL ANGLE",
				q: "같은 호 BC를 바라보며 꼭짓점이 원의 중심인 각은?",
				options: [
					"∠BOC",
					"∠BAC",
					"∠OBC"
				],
				answer: 0,
				talk: "반지름 OB와 OC가 이루는 ∠BOC가 호 BC에 대한 중심각이야."
			},
			{
				tag: "RELATION",
				q: "같은 호를 보는 중심각과 원주각의 크기 관계는?",
				options: [
					"중심각=원주각×2",
					"중심각=원주각",
					"중심각=원주각÷2"
				],
				answer: 0,
				talk: "같은 호를 보는 중심각의 크기는 원주각의 크기의 2배야."
			},
			{
				tag: "EQUATION",
				q: "∠BOC의 크기를 x°라고 할 때 세울 수 있는 식은?",
				options: [
					"x=2×55",
					"2x=55",
					"x+55=180"
				],
				answer: 0,
				talk: "중심각 x가 원주각 55°의 2배이므로 x=2×55야."
			},
			{
				tag: "CALCULATE",
				q: "2×55를 계산하면?",
				options: [
					"110",
					"105",
					"27.5"
				],
				answer: 0,
				talk: "55를 두 번 더하면 110이야."
			},
			{
				tag: "CHECK",
				q: "구한 각이 문제에서 말한 작은 쪽 ∠BOC로 알맞은 이유는?",
				options: [
					"110°<180°이기 때문",
					"110°>180°이기 때문",
					"55°와 같기 때문"
				],
				answer: 0,
				talk: "두 반지름 사이에는 110°인 작은 각과 250°인 큰 각이 있어. 작은 쪽은 180°보다 작은 110°야."
			}
		], [
			{
				q: "△ABC의 외심이 O이고 ∠BAC=38°일 때 작은 쪽 ∠BOC의 크기를 구하시오.",
				a: "76"
			},
			{
				q: "△ABC의 외심이 O이고 ∠BAC=47°일 때 작은 쪽 ∠BOC의 크기를 구하시오.",
				a: "94"
			},
			{
				q: "△ABC의 외심이 O이고 ∠BAC=62°일 때 작은 쪽 ∠BOC의 크기를 구하시오.",
				a: "124"
			}
		])
	},
	{
		term: "중2 · 2학기",
		major: "6. 삼각형과 사각형의 성질",
		middle: "사각형의 성질",
		minor: "평행사변형의 성질",
		problem: evalQuestion("중2 · 교과서 대단원 학습평가 13", "평행사변형 ABCD에서 ∠ABC의 이등분선이 변 CD의 연장선과 만나는 점을 E라고 하자. AB=8 cm, BC=12 cm일 때, DE의 길이를 구하시오.", "4", [
			{
				tag: "GOAL",
				q: "이 문제에서 마지막으로 구해야 하는 선분은 무엇인가요?",
				options: [
					"DE",
					"BE",
					"AC"
				],
				answer: 0,
				talk: "그림에서 D와 E 사이의 짧은 선분 DE를 구해야 해. 먼저 더 큰 선분 CE의 길이를 찾자."
			},
			{
				tag: "PARALLEL",
				q: "평행사변형의 마주 보는 두 변에서 알 수 있는 평행 관계는?",
				options: [
					"AB∥CD",
					"AB∥BC",
					"AC∥BD"
				],
				answer: 0,
				talk: "평행사변형에서는 마주 보는 변끼리 평행이므로 AB와 CD가 평행이야. E도 CD의 연장선 위에 있어."
			},
			{
				tag: "ALTERNATE ANGLES",
				q: "AB∥CE이고 BE가 횡단선일 때 크기가 같은 엇각은?",
				options: [
					"∠ABE와 ∠BEC",
					"∠ABE와 ∠BCE",
					"∠BEC와 ∠BCE"
				],
				answer: 0,
				talk: "BE가 평행한 두 직선 AB와 CE를 가로지르므로 ∠ABE와 ∠BEC의 크기가 같아."
			},
			{
				tag: "BISECTOR",
				q: "BE가 ∠ABC의 이등분선이므로 크기가 같은 두 각은?",
				options: [
					"∠ABE와 ∠EBC",
					"∠ABC와 ∠BEC",
					"∠EBC와 ∠BCE"
				],
				answer: 0,
				talk: "이등분선은 한 각을 똑같은 두 각으로 나누므로 ∠ABE=∠EBC야."
			},
			{
				tag: "CONNECT",
				q: "앞의 두 각의 관계를 연결하면 △BCE에서 같은 두 각은?",
				options: [
					"∠EBC와 ∠BEC",
					"∠BCE와 ∠BEC",
					"∠EBC와 ∠BCE"
				],
				answer: 0,
				talk: "∠ABE=∠BEC이고 ∠ABE=∠EBC이므로 ∠EBC=∠BEC이야."
			},
			{
				tag: "ISOSCELES",
				q: "△BCE에서 ∠EBC=∠BEC일 때 길이가 같은 두 변은?",
				options: [
					"BC와 CE",
					"BE와 CE",
					"BC와 BE"
				],
				answer: 0,
				talk: "같은 크기의 각과 마주 보는 변의 길이는 같아. 따라서 BC=CE야."
			},
			{
				tag: "LENGTH",
				q: "BC=12 cm이므로 CE의 길이는?",
				options: [
					"12 cm",
					"8 cm",
					"20 cm"
				],
				answer: 0,
				talk: "BC=CE이고 BC가 12 cm이므로 CE도 12 cm야."
			},
			{
				tag: "OPPOSITE SIDES",
				q: "평행사변형의 마주 보는 변의 길이를 이용한 CD의 길이는?",
				options: [
					"8 cm",
					"12 cm",
					"4 cm"
				],
				answer: 0,
				talk: "AB=CD이고 AB=8 cm이므로 CD=8 cm야."
			},
			{
				tag: "SUBTRACT",
				q: "점 E가 CD의 연장선에서 D 바깥쪽에 있을 때 DE를 구하는 식은?",
				options: [
					"CE-CD=12-8",
					"CE+CD=12+8",
					"CD-CE=8-12"
				],
				answer: 0,
				talk: "C에서 E까지의 전체 길이 CE에서 C에서 D까지의 길이 CD를 빼면 DE가 남아."
			},
			{
				tag: "ANSWER",
				q: "DE=12-8을 계산한 값은?",
				options: [
					"4 cm",
					"20 cm",
					"8 cm"
				],
				answer: 0,
				talk: "12-8=4이므로 DE의 길이는 4 cm야."
			}
		], [
			{
				q: "평행사변형 ABCD에서 ∠ABC의 이등분선이 CD의 연장선과 E에서 만난다. AB=7 cm, BC=11 cm일 때 DE를 구하시오.",
				a: "4"
			},
			{
				q: "같은 조건에서 AB=9 cm, BC=15 cm일 때 DE를 구하시오.",
				a: "6"
			},
			{
				q: "같은 조건에서 AB=10 cm, BC=14 cm일 때 DE를 구하시오.",
				a: "4"
			}
		])
	},
	{
		term: "중2 · 2학기",
		major: "6. 삼각형과 사각형의 성질",
		middle: "삼각형의 성질",
		minor: "이등변삼각형의 성질",
		problem: evalQuestion("중2 · 교과서 중단원 학습점검 01", "오른쪽 그림의 △ABC에서 ∠B=50°, ∠C=65°, AB=2x+3, BC=x+8일 때, x의 값을 구하시오.", "5", [
			{
				tag: "GOAL",
				q: "이 문제에서 마지막으로 구해야 하는 것은 무엇인가요?",
				options: [
					"x의 값",
					"∠B의 크기",
					"삼각형의 넓이"
				],
				answer: 0,
				talk: "변의 길이에 들어 있는 문자 x의 값을 구하는 문제야. 각의 관계로 두 변의 길이가 같다는 식을 만들면 돼."
			},
			{
				tag: "ANGLE SUM",
				q: "삼각형의 세 내각의 합을 이용한 ∠A의 계산식은?",
				options: [
					"180°-50°-65°",
					"50°+65°",
					"180°-65°"
				],
				answer: 0,
				talk: "삼각형의 세 내각의 합은 180°야. 주어진 두 각을 180°에서 차례로 빼자."
			},
			{
				tag: "CALCULATE",
				q: "∠A=180°-50°-65°를 계산하면?",
				options: [
					"65°",
					"75°",
					"115°"
				],
				answer: 0,
				talk: "180-50=130, 130-65=65이므로 ∠A=65°야."
			},
			{
				tag: "COMPARE",
				q: "크기가 같은 두 각은 어느 것인가요?",
				options: [
					"∠A와 ∠C",
					"∠A와 ∠B",
					"∠B와 ∠C"
				],
				answer: 0,
				talk: "계산한 ∠A가 65°이고 문제에서 ∠C도 65°라고 주어졌어."
			},
			{
				tag: "OPPOSITE SIDE",
				q: "∠A와 ∠C의 맞은편에 있는 변을 차례로 고르면?",
				options: [
					"BC, AB",
					"AB, BC",
					"AC, AB"
				],
				answer: 0,
				talk: "꼭짓점 A의 맞은편은 BC, 꼭짓점 C의 맞은편은 AB야. 같은 각의 맞은편 변의 길이는 같아."
			},
			{
				tag: "EQUATION",
				q: "두 변의 길이가 같다는 관계를 식으로 나타내면?",
				options: [
					"2x+3=x+8",
					"2x+3+x+8=180",
					"2x+3=65"
				],
				answer: 0,
				talk: "AB=BC이고 AB=2x+3, BC=x+8이므로 2x+3=x+8이야."
			},
			{
				tag: "UNDO",
				q: "2x+3=x+8에서 양변에 같은 계산을 하여 x항을 한쪽에 모으면?",
				options: [
					"x+3=8",
					"3x+3=8",
					"x+3=x"
				],
				answer: 0,
				talk: "양변에서 x를 빼면 x+3=8이 돼. 등식은 양변에 같은 수를 빼도 성립해."
			},
			{
				tag: "SOLVE",
				q: "x+3=8을 만족시키는 x의 값은?",
				options: [
					"5",
					"11",
					"3"
				],
				answer: 0,
				talk: "양변에서 3을 빼면 x=5야."
			},
			{
				tag: "CHECK",
				q: "x=5를 두 변의 식에 넣어 확인한 결과는?",
				options: [
					"AB=13, BC=13",
					"AB=10, BC=13",
					"AB=13, BC=8"
				],
				answer: 0,
				talk: "AB=2×5+3=13, BC=5+8=13이므로 두 변의 길이가 같아 조건에 맞아."
			}
		], [
			{
				q: "△ABC에서 ∠B=40°, ∠C=70°, AB=3x+1, BC=2x+6일 때 x의 값을 구하시오.",
				a: "5"
			},
			{
				q: "△ABC에서 ∠B=36°, ∠C=72°, AB=4x-3, BC=2x+7일 때 x의 값을 구하시오.",
				a: "5"
			},
			{
				q: "△ABC에서 ∠B=44°, ∠C=68°, AB=5x-4, BC=3x+8일 때 x의 값을 구하시오.",
				a: "6"
			}
		])
	},
	{
		term: "중2 · 1학기",
		major: "5. 일차함수",
		middle: "일차함수와 그래프",
		minor: "일차함수 그래프의 절편",
		problem: evalQuestion("중2 · 교과서 대단원 학습평가 12", "일차함수 y=-4x+2의 그래프를 y축의 방향으로 m만큼 평행이동한 그래프의 x절편이 -2일 때, m의 값을 구하시오.", "-10", [
			{
				tag: "TRANSLATE",
				q: "y=-4x+2를 y축 방향으로 m만큼 평행이동한 식은?",
				options: [
					"y=-4x+2+m",
					"y=-4(x-m)+2",
					"y=(-4+m)x+2"
				],
				answer: 0,
				talk: "세로 방향 이동에서는 모든 y값에 m을 더하므로 상수항에 m이 붙어."
			},
			{
				tag: "SLOPE",
				q: "평행이동한 뒤에도 변하지 않는 것은?",
				options: [
					"기울기 -4",
					"x절편 -2",
					"y절편 2"
				],
				answer: 0,
				talk: "세로로 옮겨도 직선의 기울기는 -4로 같고 절편만 달라져."
			},
			{
				tag: "INTERCEPT POINT",
				q: "x절편이 -2라는 조건을 좌표로 나타내면?",
				options: [
					"(-2,0)",
					"(0,-2)",
					"(-2,-2)"
				],
				answer: 0,
				talk: "x축 위의 점은 y좌표가 0이므로 x절편 -2는 점 (-2,0)이야."
			},
			{
				tag: "SUBSTITUTE",
				q: "점 (-2,0)을 y=-4x+2+m에 대입한 식은?",
				options: [
					"0=-4×(-2)+2+m",
					"-2=-4×0+2+m",
					"0=-4×2-2+m"
				],
				answer: 0,
				talk: "x 자리에 -2, y 자리에 0을 넣어."
			},
			{
				tag: "CALCULATE",
				q: "-4×(-2)+2를 계산하면?",
				options: [
					"10",
					"-10",
					"6"
				],
				answer: 0,
				talk: "-4×(-2)=8이고 8+2=10이야."
			},
			{
				tag: "ANSWER",
				q: "0=10+m을 만족시키는 m의 값은?",
				options: [
					"-10",
					"10",
					"0"
				],
				answer: 0,
				talk: "양변에서 10을 빼면 m=-10이야."
			}
		], [
			{
				q: "y=-3x+4를 y축 방향으로 m만큼 이동한 그래프의 x절편이 -2일 때 m을 구하시오.",
				a: "-10"
			},
			{
				q: "y=2x-1을 y축 방향으로 m만큼 이동한 그래프의 x절편이 3일 때 m을 구하시오.",
				a: "-5"
			},
			{
				q: "y=5x+2를 y축 방향으로 m만큼 이동한 그래프의 x절편이 -1일 때 m을 구하시오.",
				a: "3"
			}
		])
	},
	{
		term: "중2 · 1학기",
		major: "4. 연립일차방정식",
		middle: "연립일차방정식의 활용",
		minor: "연립일차방정식의 활용",
		problem: evalQuestion("중2 · 교과서 대단원 학습평가 12", "출발지에서 80 km 떨어진 지점까지 처음에는 시속 50 km, 이후에는 시속 60 km로 달렸더니 총 1시간 30분이 걸렸다. 시속 60 km로 달린 거리를 구하시오.", "30", [
			{
				tag: "GOAL",
				q: "이 문제에서 마지막으로 구해야 하는 것은?",
				options: [
					"시속 60 km로 달린 거리",
					"시속 50 km로 달린 시간",
					"자동차의 전체 속력"
				],
				answer: 0,
				talk: "문제의 마지막 문장을 보면 시속 60 km로 달린 거리를 묻고 있어. 구할 대상을 먼저 분명히 잡자."
			},
			{
				tag: "TWO PARTS",
				q: "전체 80 km는 어떤 두 구간으로 나뉘나요?",
				options: [
					"50 km/h 구간과 60 km/h 구간",
					"출발 전과 도착 후",
					"80 km 구간과 30 km 구간"
				],
				answer: 0,
				talk: "속력이 바뀌는 지점을 기준으로 두 구간으로 나누면 조건을 식으로 만들기 쉬워."
			},
			{
				tag: "UNKNOWN",
				q: "시속 50 km 구간의 거리와 시속 60 km 구간의 거리를 각각 어떻게 놓을까요?",
				options: [
					"x km, y km",
					"50 km, 60 km",
					"x시간, y시간"
				],
				answer: 0,
				talk: "거리 두 개를 모르므로 첫 구간을 x km, 둘째 구간을 y km라고 놓자. 문제에서 구할 것은 y야."
			},
			{
				tag: "DISTANCE WORDS",
				q: "‘두 구간의 거리를 합하면 전체 80 km’라는 말을 식으로 나타내면?",
				options: [
					"x+y=80",
					"x-y=80",
					"50x+60y=80"
				],
				answer: 0,
				talk: "첫 구간 거리 x와 둘째 구간 거리 y를 더하면 전체 거리 80이야."
			},
			{
				tag: "TIME RULE",
				q: "거리와 속력을 알 때 시간을 구하는 식은?",
				options: [
					"시간=거리÷속력",
					"시간=거리×속력",
					"시간=속력÷거리"
				],
				answer: 0,
				talk: "거리=속력×시간을 시간에 대해 정리하면 시간=거리÷속력이야."
			},
			{
				tag: "FIRST TIME",
				q: "시속 50 km로 x km를 달린 시간은?",
				options: [
					"x/50시간",
					"50/x시간",
					"50x시간"
				],
				answer: 0,
				talk: "첫 구간 시간은 거리 x를 속력 50으로 나눈 x/50시간이야."
			},
			{
				tag: "SECOND TIME",
				q: "시속 60 km로 y km를 달린 시간은?",
				options: [
					"y/60시간",
					"60/y시간",
					"60y시간"
				],
				answer: 0,
				talk: "둘째 구간 시간은 거리 y를 속력 60으로 나눈 y/60시간이야."
			},
			{
				tag: "CHANGE UNIT",
				q: "1시간 30분을 시간 단위의 분수로 바르게 나타낸 것은?",
				options: [
					"3/2시간",
					"4/3시간",
					"1/2시간"
				],
				answer: 0,
				talk: "30분은 1/2시간이므로 1+1/2=3/2시간이야."
			},
			{
				tag: "TIME EQUATION",
				q: "‘두 구간의 시간 합이 3/2시간’이라는 말을 식으로 나타내면?",
				options: [
					"x/50+y/60=3/2",
					"x/50-y/60=3/2",
					"50x+60y=3/2"
				],
				answer: 0,
				talk: "첫 구간 시간과 둘째 구간 시간을 더해 전체 시간 3/2와 같다고 놓아."
			},
			{
				tag: "CLEAR FRACTIONS",
				q: "x/50+y/60=3/2의 양변에 300을 곱해 정리하면?",
				options: [
					"6x+5y=450",
					"5x+6y=450",
					"6x+5y=300"
				],
				answer: 0,
				talk: "50, 60, 2의 공배수 300을 곱하면 분모가 모두 사라져 6x+5y=450이 돼."
			},
			{
				tag: "ELIMINATE",
				q: "x+y=80에서 y를 없애기 위해 5를 곱한 식은?",
				options: [
					"5x+5y=400",
					"5x+y=400",
					"x+5y=400"
				],
				answer: 0,
				talk: "두 번째 식의 5y와 맞추려고 첫 식 전체에 5를 곱해 5x+5y=400을 만들어."
			},
			{
				tag: "SOLVE X",
				q: "6x+5y=450에서 5x+5y=400을 빼면 x는?",
				options: [
					"50",
					"30",
					"80"
				],
				answer: 0,
				talk: "왼쪽은 x만 남고 오른쪽은 50이므로 첫 구간 거리는 x=50 km야."
			},
			{
				tag: "ANSWER Y",
				q: "x=50을 x+y=80에 넣어 구한 y와 문제의 답은?",
				options: [
					"y=30, 30 km",
					"y=50, 50 km",
					"y=130, 130 km"
				],
				answer: 0,
				talk: "50+y=80이므로 y=30이야. y는 시속 60 km로 달린 거리이므로 답은 30 km야."
			},
			{
				tag: "CHECK",
				q: "구한 거리로 시간을 확인한 식은?",
				options: [
					"50/50+30/60=3/2",
					"50/60+30/50=3/2",
					"50+30=3/2"
				],
				answer: 0,
				talk: "첫 구간은 1시간, 둘째 구간은 1/2시간이므로 합은 3/2시간이 되어 문제 조건과 맞아."
			}
		], [
			{
				q: "70 km를 처음에는 시속 40 km, 이후에는 시속 60 km로 총 1시간 30분 동안 달렸다. 시속 60 km로 달린 거리를 구하시오.",
				a: "30"
			},
			{
				q: "90 km를 처음에는 시속 50 km, 이후에는 시속 75 km로 총 1시간 24분 동안 달렸다. 시속 75 km로 달린 거리를 구하시오.",
				a: "60"
			},
			{
				q: "100 km를 처음에는 시속 60 km, 이후에는 시속 80 km로 총 1시간 30분 동안 달렸다. 시속 80 km로 달린 거리를 구하시오.",
				a: "40"
			}
		])
	},
	{
		term: "중2 · 1학기",
		major: "3. 일차부등식",
		middle: "일차부등식",
		minor: "일차부등식의 풀이",
		problem: evalQuestion("중2 · 교과서 대단원 학습평가 서술형 13", "일차부등식 1/5x+1.3>0.8x-3을 만족시키는 x의 값 중 가장 큰 자연수를 구하시오.", "7", [
			{
				tag: "COMMON MULTIPLE",
				q: "분수와 소수를 한꺼번에 없애기 위해 양변에 곱할 수는?",
				options: [
					"10",
					"5",
					"100"
				],
				answer: 0,
				talk: "1/5과 소수 첫째 자리가 함께 있으므로 10을 곱하면 모두 정수로 바뀌어."
			},
			{
				tag: "MULTIPLY",
				q: "부등식의 양변에 10을 곱한 식은?",
				options: [
					"2x+13>8x-30",
					"2x+1.3>8x-3",
					"5x+13>8x-30"
				],
				answer: 0,
				talk: "10×1/5x=2x, 10×1.3=13, 10×0.8x=8x, 10×(-3)=-30이야."
			},
			{
				tag: "COLLECT",
				q: "2x+13>8x-30에서 x항과 상수항을 모으면?",
				options: [
					"-6x>-43",
					"6x>43",
					"-6x>43"
				],
				answer: 0,
				talk: "양변에서 8x와 13을 빼면 2x-8x>-30-13이 되어 -6x>-43이야."
			},
			{
				tag: "NEGATIVE DIVISION",
				q: "-6x>-43의 양변을 -6으로 나누면?",
				options: [
					"x<43/6",
					"x>43/6",
					"x<-43/6"
				],
				answer: 0,
				talk: "음수로 나누면 부등호 방향이 반대로 바뀌고, (-43)÷(-6)=43/6이야."
			},
			{
				tag: "BETWEEN",
				q: "43/6은 어떤 두 자연수 사이에 있나요?",
				options: [
					"7과 8 사이",
					"6과 7 사이",
					"8과 9 사이"
				],
				answer: 0,
				talk: "43÷6=7과 나머지 1이므로 43/6=7과 1/6이야."
			},
			{
				tag: "ANSWER",
				q: "x<43/6을 만족시키는 가장 큰 자연수는?",
				options: [
					"7",
					"8",
					"6"
				],
				answer: 0,
				talk: "43/6은 7보다 크고 8보다 작으므로 가능한 가장 큰 자연수는 7이야."
			}
		], [
			{
				q: "1/4x+2>3/4x-1을 만족시키는 가장 큰 자연수 x를 구하시오.",
				a: "5"
			},
			{
				q: "0.3x+1.2>0.7x-2를 만족시키는 가장 큰 자연수 x를 구하시오.",
				a: "7"
			},
			{
				q: "1/2x+0.5>0.8x-1.6을 만족시키는 가장 큰 자연수 x를 구하시오.",
				a: "6"
			}
		])
	},
	{
		term: "중2 · 1학기",
		major: "3. 일차부등식",
		middle: "일차부등식",
		minor: "일차부등식의 풀이",
		problem: evalQuestion("중2 · 교과서 대단원 학습평가 06", "일차부등식 2(3x+1)≤2x+a를 만족시키는 자연수 x의 값이 3개 이상일 때, a의 값의 범위를 구하시오.", "a≥14", [
			{
				tag: "EXPAND",
				q: "2(3x+1)≤2x+a의 왼쪽 괄호를 풀면?",
				options: [
					"6x+2≤2x+a",
					"6x+1≤2x+a",
					"3x+2≤2x+a"
				],
				answer: 0,
				talk: "2를 3x와 1에 각각 곱하면 6x+2야. 부등호는 그대로 유지해."
			},
			{
				tag: "COLLECT",
				q: "x항을 왼쪽, 상수항을 오른쪽으로 모은 식은?",
				options: [
					"4x≤a-2",
					"8x≤a+2",
					"4x≥a-2"
				],
				answer: 0,
				talk: "양변에서 2x와 2를 빼면 4x≤a-2가 돼."
			},
			{
				tag: "DIVIDE",
				q: "양변을 양수 4로 나누어 x의 범위를 나타내면?",
				options: [
					"x≤(a-2)/4",
					"x≥(a-2)/4",
					"x≤a-2"
				],
				answer: 0,
				talk: "양수로 나누면 부등호 방향은 바뀌지 않아."
			},
			{
				tag: "NATURAL NUMBERS",
				q: "자연수 해가 3개 이상이려면 반드시 포함되어야 할 세 수는?",
				options: [
					"1, 2, 3",
					"0, 1, 2",
					"3, 4, 5"
				],
				answer: 0,
				talk: "자연수는 1부터 시작하므로 적어도 1, 2, 3이 해가 되어야 해."
			},
			{
				tag: "BOUND",
				q: "x≤(a-2)/4가 1, 2, 3을 포함하려면 오른쪽 값은?",
				options: [
					"(a-2)/4≥3",
					"(a-2)/4≤3",
					"(a-2)/4=1"
				],
				answer: 0,
				talk: "가장 큰 세 번째 자연수 3까지 들어가야 하므로 경계값이 3 이상이어야 해."
			},
			{
				tag: "ANSWER",
				q: "(a-2)/4≥3을 풀어 구한 a의 범위는?",
				options: [
					"a≥14",
					"a≤14",
					"a≥10"
				],
				answer: 0,
				talk: "양변에 4를 곱하면 a-2≥12, 양변에 2를 더하면 a≥14야."
			}
		], [
			{
				q: "2(2x+1)≤x+a를 만족시키는 자연수 x가 4개 이상일 때 a의 범위를 구하시오.",
				a: "a≥14"
			},
			{
				q: "3(x-1)≤x+a를 만족시키는 자연수 x가 5개 이상일 때 a의 범위를 구하시오.",
				a: "a≥7"
			},
			{
				q: "4x+1≤2x+a를 만족시키는 자연수 x가 6개 이상일 때 a의 범위를 구하시오.",
				a: "a≥13"
			}
		])
	},
	{
		term: "중2 · 1학기",
		major: "2. 식의 계산",
		middle: "지수법칙",
		minor: "지수법칙 ⑵",
		problem: evalQuestion("중2 · 교과서 대단원 학습평가 07", "2³=A일 때, 64³을 A를 사용하여 나타내시오.", "A⁶", [
			{
				tag: "CHANGE BASE",
				q: "64를 밑이 2인 거듭제곱으로 나타내면?",
				options: [
					"2⁶",
					"2⁸",
					"2³"
				],
				answer: 0,
				talk: "2를 여섯 번 곱하면 64이므로 64=2⁶이야."
			},
			{
				tag: "SUBSTITUTE",
				q: "64³에서 64를 2⁶으로 바꾼 식은?",
				options: [
					"(2⁶)³",
					"2⁶×3",
					"(2³)⁶³"
				],
				answer: 0,
				talk: "64 자리에 같은 값 2⁶을 그대로 넣어."
			},
			{
				tag: "POWER OF POWER",
				q: "(2⁶)³의 지수를 계산하면?",
				options: [
					"2¹⁸",
					"2⁹",
					"2⁶"
				],
				answer: 0,
				talk: "거듭제곱의 거듭제곱은 지수를 곱하므로 6×3=18이야."
			},
			{
				tag: "USE A",
				q: "A=2³이므로 2¹⁸을 A로 바꾸려면 18을 어떻게 나타낼까요?",
				options: [
					"3×6",
					"3+6",
					"3×3"
				],
				answer: 0,
				talk: "2³이라는 묶음이 몇 개인지 보려면 18=3×6으로 생각해."
			},
			{
				tag: "REGROUP",
				q: "2¹⁸을 2³ 묶음으로 나타낸 식은?",
				options: [
					"(2³)⁶",
					"(2⁶)³",
					"2³+6"
				],
				answer: 0,
				talk: "2¹⁸=(2³)⁶이고 괄호 안 2³이 바로 A야."
			},
			{
				tag: "ANSWER",
				q: "(2³)⁶에서 2³=A를 이용한 최종식은?",
				options: [
					"A⁶",
					"6A",
					"A³"
				],
				answer: 0,
				talk: "2³ 전체를 A로 바꾸면 (2³)⁶=A⁶이야."
			}
		], [
			{
				q: "3²=B일 때, 27²을 B를 사용하여 나타내시오.",
				a: "B³"
			},
			{
				q: "5²=C일 때, 125²을 C를 사용하여 나타내시오.",
				a: "C³"
			},
			{
				q: "2⁴=D일 때, 16⁵을 D를 사용하여 나타내시오.",
				a: "D⁵"
			}
		])
	},
	{
		term: "중2 · 1학기",
		major: "2. 식의 계산",
		middle: "단항식과 다항식의 계산",
		minor: "단항식의 곱셈과 나눗셈",
		problem: evalQuestion("중2 · 교과서 대단원 학습평가 08", "가로의 길이가 3a²b³이고 세로의 길이가 8ab³인 직사각형과 밑변의 길이가 6a³b²인 삼각형의 넓이가 서로 같을 때, 삼각형의 높이를 구하시오.", "8b⁴", [
			{
				tag: "RECTANGLE",
				q: "직사각형의 넓이를 나타내는 곱셈식은?",
				options: [
					"3a²b³×8ab³",
					"3a²b³+8ab³",
					"(3a²b³×8ab³)/2"
				],
				answer: 0,
				talk: "직사각형의 넓이는 가로×세로야."
			},
			{
				tag: "MULTIPLY",
				q: "3a²b³×8ab³을 계산하여 간단히 하면?",
				options: [
					"24a³b⁶",
					"24a²b³",
					"11a³b⁶"
				],
				answer: 0,
				talk: "계수는 3×8=24, 같은 문자는 지수를 더해 a³b⁶이 돼."
			},
			{
				tag: "TRIANGLE",
				q: "삼각형의 높이를 h라고 할 때 넓이를 나타낸 식은?",
				options: [
					"(1/2)×6a³b²×h",
					"6a³b²×h",
					"2×6a³b²×h"
				],
				answer: 0,
				talk: "삼각형의 넓이는 1/2×밑변×높이이므로 3a³b²h야."
			},
			{
				tag: "EQUATION",
				q: "두 도형의 넓이가 같다는 조건으로 만든 식은?",
				options: [
					"3a³b²h=24a³b⁶",
					"6a³b²+h=24a³b⁶",
					"3a³b²h=12a³b⁶"
				],
				answer: 0,
				talk: "삼각형 넓이와 직사각형 넓이를 등호로 연결해."
			},
			{
				tag: "DIVIDE",
				q: "h만 남기기 위해 양변을 무엇으로 나눌까요?",
				options: [
					"3a³b²",
					"24a³b⁶",
					"6a³b²"
				],
				answer: 0,
				talk: "h에 곱해진 3a³b²로 양변을 나누면 돼."
			},
			{
				tag: "ANSWER",
				q: "24a³b⁶÷3a³b²를 계산한 삼각형의 높이는?",
				options: [
					"8b⁴",
					"8a⁶b⁸",
					"21b⁴"
				],
				answer: 0,
				talk: "24÷3=8, a³은 약분되고 b⁶÷b²=b⁴이므로 높이는 8b⁴이야."
			}
		], [
			{
				q: "가로 2x²y, 세로 9xy²인 직사각형과 밑변 6x²y인 삼각형의 넓이가 같을 때 삼각형의 높이를 구하시오.",
				a: "6xy²"
			},
			{
				q: "가로 4a³b, 세로 5ab²인 직사각형과 밑변 8a²b인 삼각형의 넓이가 같을 때 삼각형의 높이를 구하시오.",
				a: "5a²b²"
			},
			{
				q: "가로 3m²n³, 세로 8mn인 직사각형과 밑변 4m²n²인 삼각형의 넓이가 같을 때 삼각형의 높이를 구하시오.",
				a: "12mn²"
			}
		])
	},
	{
		term: "중2 · 1학기",
		major: "2. 식의 계산",
		middle: "단항식과 다항식의 계산",
		minor: "다항식의 덧셈과 뺄셈",
		problem: evalQuestion("중2 · 교과서 대단원 학습평가 09", "(-x²+2x+5)+3(x²-3x+1)을 계산했을 때, x²의 계수와 상수항의 합을 구하시오.", "10", [
			{
				tag: "DISTRIBUTE",
				q: "3(x²-3x+1)에 3을 분배한 식은?",
				options: [
					"3x²-9x+3",
					"3x²-3x+1",
					"3x²+9x+3"
				],
				answer: 0,
				talk: "괄호 안의 세 항 x², -3x, 1에 3을 각각 곱해."
			},
			{
				tag: "OPEN",
				q: "두 괄호를 모두 풀어 한 줄로 나타낸 것은?",
				options: [
					"-x²+2x+5+3x²-9x+3",
					"-x²+2x+5+3x²-3x+1",
					"x²+2x+5+3x²-9x+3"
				],
				answer: 0,
				talk: "첫 괄호는 그대로 쓰고, 둘째 괄호는 방금 분배한 세 항으로 바꾸면 돼."
			},
			{
				tag: "X SQUARED",
				q: "x²항끼리 계산하면?",
				options: [
					"-x²+3x²=2x²",
					"-x²+3x²=3x²",
					"-x²+3x²=-2x²"
				],
				answer: 0,
				talk: "-1개와 3개를 합하면 x²이 2개 남아."
			},
			{
				tag: "X TERM",
				q: "x항끼리 계산하면?",
				options: [
					"2x-9x=-7x",
					"2x-9x=7x",
					"2x-9x=-11x"
				],
				answer: 0,
				talk: "2-9=-7이므로 x항은 -7x야."
			},
			{
				tag: "CONSTANT",
				q: "상수항끼리 계산하면?",
				options: [
					"5+3=8",
					"5+3=2",
					"5+3=15"
				],
				answer: 0,
				talk: "문자가 없는 수 5와 3을 더해 상수항은 8이야."
			},
			{
				tag: "READ GOAL",
				q: "정리한 식 2x²-7x+8에서 x²의 계수와 상수항의 합은?",
				options: [
					"2+8=10",
					"-7+8=1",
					"2-7=-5"
				],
				answer: 0,
				talk: "문제는 x²의 계수 2와 상수항 8의 합을 물었으므로 답은 10이야."
			}
		], [
			{
				q: "(2x²-x+4)+2(x²+3x-1)에서 x²의 계수와 상수항의 합을 구하시오.",
				a: "6"
			},
			{
				q: "(3a²+2a-5)-2(a²-4a+1)에서 a²의 계수와 상수항의 합을 구하시오.",
				a: "-6"
			},
			{
				q: "-2(y²-y+3)+4(y²+2y-1)에서 y²의 계수와 상수항의 합을 구하시오.",
				a: "-8"
			}
		])
	},
	{
		term: "중2 · 1학기",
		major: "2. 식의 계산",
		middle: "지수법칙",
		minor: "지수법칙 ⑵",
		problem: evalQuestion("중2 · 교과서 대단원 학습평가 06", "(-2a²b)³÷4ab²을 계산하여 간단히 하시오.", "-2a⁵b", [
			{
				tag: "POWER",
				q: "먼저 (-2a²b)³을 전개한 식은?",
				options: [
					"(-2)³×(a²)³×b³",
					"-2×a⁶×b³",
					"(-2)³×a⁵×b³"
				],
				answer: 0,
				talk: "곱의 거듭제곱은 각 인수에 지수를 똑같이 적용해."
			},
			{
				tag: "COEFFICIENT",
				q: "(-2)³의 값은?",
				options: [
					"-8",
					"8",
					"-6"
				],
				answer: 0,
				talk: "음수 세 개를 곱하므로 결과는 음수이고 2³=8이야."
			},
			{
				tag: "EXPONENT",
				q: "(a²)³을 지수법칙으로 계산하면?",
				options: [
					"a⁶",
					"a⁵",
					"a⁸"
				],
				answer: 0,
				talk: "거듭제곱의 거듭제곱에서는 지수를 곱해 2×3=6이야."
			},
			{
				tag: "FRACTION",
				q: "나눗셈을 분수 꼴로 바르게 나타낸 것은?",
				options: [
					"(-8a⁶b³)/(4ab²)",
					"(-8a⁶b³)×(4ab²)",
					"(4ab²)/(-8a⁶b³)"
				],
				answer: 0,
				talk: "나누어지는 식은 분자, 나누는 식은 분모에 놓아."
			},
			{
				tag: "DIVIDE",
				q: "계수와 같은 문자의 지수를 각각 계산한 것은?",
				options: [
					"-2, a⁵, b",
					"2, a⁵, b²",
					"-4, a⁶, b"
				],
				answer: 0,
				talk: "-8÷4=-2, a⁶÷a=a⁵, b³÷b²=b야."
			},
			{
				tag: "ANSWER",
				q: "모든 결과를 곱해 간단히 한 식은?",
				options: [
					"-2a⁵b",
					"2a⁵b",
					"-2a⁶b²"
				],
				answer: 0,
				talk: "계수 -2와 문자 부분 a⁵b를 이어 쓰면 -2a⁵b야."
			}
		], [
			{
				q: "(3x²y)²÷9xy를 계산하여 간단히 하시오.",
				a: "x³y"
			},
			{
				q: "(-2ab²)³÷4a²b를 계산하여 간단히 하시오.",
				a: "-2ab⁵"
			},
			{
				q: "(4x³y²)²÷8x²y를 계산하여 간단히 하시오.",
				a: "2x⁴y³"
			}
		])
	},
	{
		term: "중2 · 1학기",
		major: "1. 유리수와 순환소수",
		middle: "유리수와 소수",
		minor: "순환소수의 분수 표현",
		problem: evalQuestion("중2 · 교과서 중단원 학습점검 02", "분수 4/7을 소수로 나타낼 때 순환마디를 구하시오.", "571428", [
			{
				tag: "DIVIDE",
				q: "4/7을 소수로 나타내기 위해 시작할 나눗셈은?",
				options: [
					"4÷7",
					"7÷4",
					"4×7"
				],
				answer: 0,
				talk: "분수 a/b는 a÷b야. 그러므로 4를 7로 나누어 보자."
			},
			{
				tag: "FIRST DIGIT",
				q: "4÷7을 계산한 소수의 처음 여섯 자리로 알맞은 것은?",
				options: [
					"0.571428",
					"0.457142",
					"0.714285"
				],
				answer: 0,
				talk: "나눗셈을 이어 가면 0.571428까지 나오고, 그다음 나머지가 처음과 같아져."
			},
			{
				tag: "REPEAT",
				q: "0.571428571428…에서 되풀이되는 숫자 묶음은?",
				options: [
					"571428",
					"57",
					"1428"
				],
				answer: 0,
				talk: "571428 다음에 다시 571428이 같은 순서로 나타나."
			},
			{
				tag: "SMALLEST",
				q: "순환마디는 되풀이되는 숫자를 어떻게 잡아야 할까요?",
				options: [
					"가장 짧은 한 묶음",
					"두 묶음을 모두",
					"첫 숫자 하나만"
				],
				answer: 0,
				talk: "순환마디는 같은 배열이 반복되는 가장 짧은 숫자 묶음이야."
			},
			{
				tag: "DOTS",
				q: "0.571428…을 순환소수 기호로 나타낼 때 점을 찍을 위치는?",
				options: [
					"순환마디의 처음 5와 끝 8",
					"5 한 곳만",
					"소수점과 8"
				],
				answer: 0,
				talk: "순환마디가 여러 자리이면 처음 숫자와 마지막 숫자 위에 점을 찍어 범위를 표시해."
			},
			{
				tag: "ANSWER",
				q: "따라서 4/7의 순환마디는?",
				options: [
					"571428",
					"714285",
					"4/7"
				],
				answer: 0,
				talk: "소수점 아래에서 계속 반복되는 가장 짧은 묶음은 571428이야."
			}
		], [
			{
				q: "분수 2/3을 소수로 나타낼 때 순환마디를 구하시오.",
				a: "6"
			},
			{
				q: "분수 5/11을 소수로 나타낼 때 순환마디를 구하시오.",
				a: "45"
			},
			{
				q: "분수 7/12를 소수로 나타낼 때 순환마디를 구하시오.",
				a: "3"
			}
		])
	},
	{
		term: "중2 · 1학기",
		major: "1. 유리수와 순환소수",
		middle: "유리수와 소수",
		minor: "순환소수의 분수 표현",
		problem: evalQuestion("중2 · 교과서 중단원 학습점검 03", "분수 5/11을 순환소수로 나타내시오. 단, 순환마디는 괄호 안에 쓰시오.", "0.(45)", [
			{
				tag: "MEANING",
				q: "분수 5/11를 소수로 고치는 나눗셈은?",
				options: [
					"5÷11",
					"11÷5",
					"5÷1"
				],
				answer: 0,
				talk: "분자는 나누어지는 수, 분모는 나누는 수이므로 5÷11이야."
			},
			{
				tag: "START",
				q: "5는 11보다 작습니다. 소수 계산을 시작하면 몫의 처음은?",
				options: [
					"0.",
					"5.",
					"11."
				],
				answer: 0,
				talk: "5 안에 11이 한 번도 들어가지 않으므로 몫의 정수 부분은 0이야."
			},
			{
				tag: "LONG DIVISION",
				q: "50÷11의 몫 4를 쓰고 남는 나머지는?",
				options: [
					"6",
					"4",
					"1"
				],
				answer: 0,
				talk: "11×4=44이므로 50-44=6이 남아."
			},
			{
				tag: "NEXT",
				q: "나머지 6 뒤에 0을 내려 60÷11을 계산하면 몫과 나머지는?",
				options: [
					"5, 나머지 5",
					"4, 나머지 6",
					"6, 나머지 5"
				],
				answer: 0,
				talk: "11×5=55이고 60-55=5야. 처음 나누던 수 5가 다시 나왔어."
			},
			{
				tag: "CYCLE",
				q: "나머지 5가 다시 나타났으므로 반복되는 몫의 숫자는?",
				options: [
					"45",
					"54",
					"5"
				],
				answer: 0,
				talk: "몫에서 4 다음 5가 나오고 같은 나눗셈이 다시 시작되므로 45가 반복돼."
			},
			{
				tag: "NOTATION",
				q: "순환마디 45를 괄호로 나타낸 순환소수는?",
				options: [
					"0.(45)",
					"0.45",
					"0.(54)"
				],
				answer: 0,
				talk: "0.454545…에서 반복되는 45를 괄호로 묶어 0.(45)라고 쓰자."
			}
		], [
			{
				q: "분수 2/9를 순환소수로 나타내시오. 순환마디는 괄호 안에 쓰시오.",
				a: "0.(2)"
			},
			{
				q: "분수 7/11을 순환소수로 나타내시오. 순환마디는 괄호 안에 쓰시오.",
				a: "0.(63)"
			},
			{
				q: "분수 5/6을 순환소수로 나타내시오. 순환마디는 괄호 안에 쓰시오.",
				a: "0.8(3)"
			}
		])
	},
	{
		term: "중2 · 1학기",
		major: "1. 유리수와 순환소수",
		middle: "유리수와 소수",
		minor: "유리수의 소수 표현",
		problem: evalQuestion("중2 · 교과서 대단원 학습평가 03", "두 분수 1/7과 4/5 사이에 있는 분모가 35이고 분자가 자연수인 분수 중 유한소수로 나타낼 수 있는 분수는 모두 몇 개인지 구하시오.", "3", [
			{
				tag: "SAME DENOMINATOR",
				q: "1/7과 4/5를 분모가 35인 분수로 바르게 고친 것은?",
				options: [
					"5/35, 28/35",
					"7/35, 20/35",
					"5/35, 20/35"
				],
				answer: 0,
				talk: "1/7에는 5를, 4/5에는 7을 곱하면 5/35와 28/35가 돼."
			},
			{
				tag: "RANGE",
				q: "두 분수 사이에 있는 A/35의 분자 A의 범위는?",
				options: [
					"5<A<28",
					"5≤A≤28",
					"7<A<20"
				],
				answer: 0,
				talk: "‘사이’에 있으므로 양 끝의 5와 28은 포함하지 않아. A는 6부터 27까지야."
			},
			{
				tag: "DENOMINATOR",
				q: "35를 소인수분해한 것은?",
				options: [
					"5×7",
					"2×5",
					"5²"
				],
				answer: 0,
				talk: "35=5×7이야. 유한소수가 되려면 기약분수의 분모에서 7이 사라져야 해."
			},
			{
				tag: "CANCEL",
				q: "A/35를 약분했을 때 분모의 7을 없애려면 A는 어떤 수여야 할까요?",
				options: [
					"7의 배수",
					"5의 배수",
					"2의 배수"
				],
				answer: 0,
				talk: "분자 A에 7이 들어 있어야 분모의 7과 약분할 수 있어."
			},
			{
				tag: "PICK",
				q: "6부터 27까지의 자연수 중 7의 배수를 모두 고른 것은?",
				options: [
					"7, 14, 21",
					"7, 14, 21, 28",
					"5, 10, 15, 20, 25"
				],
				answer: 0,
				talk: "범위 안의 7의 배수는 7, 14, 21이고 28은 끝점이라 제외해."
			},
			{
				tag: "COUNT",
				q: "조건을 만족하는 분수의 개수는?",
				options: [
					"3개",
					"4개",
					"7개"
				],
				answer: 0,
				talk: "7/35, 14/35, 21/35의 세 분수는 약분하면 분모에 2와 5 이외의 소인수가 남지 않아."
			}
		], [
			{
				q: "1/6과 3/4 사이에 있는 분모가 24인 분수 중 유한소수로 나타낼 수 있는 분수는 모두 몇 개인지 구하시오.",
				a: "4"
			},
			{
				q: "1/5과 5/6 사이에 있는 분모가 30인 분수 중 유한소수로 나타낼 수 있는 분수는 모두 몇 개인지 구하시오.",
				a: "6"
			},
			{
				q: "1/8과 7/10 사이에 있는 분모가 40인 분수 중 유한소수로 나타낼 수 있는 분수는 모두 몇 개인지 구하시오.",
				a: "22"
			}
		])
	},
	{
		term: "중2 · 1학기",
		major: "1. 유리수와 순환소수",
		middle: "유리수와 소수",
		minor: "순환소수의 분수 표현",
		problem: evalQuestion("중2 · 교과서 대단원 학습평가 04", "순환소수 0.8111…을 분수로 나타내시오.", "73/90", [
			{
				tag: "SET",
				q: "0.8111…을 x라고 놓으면 알맞은 식은?",
				options: [
					"x=0.8111…",
					"x=8.111…",
					"x=81.111…"
				],
				answer: 0,
				talk: "먼저 반복되는 소수를 문자 x로 짧게 이름 붙이자."
			},
			{
				tag: "ALIGN",
				q: "반복되는 1의 자리를 맞추기 위해 만들 두 식은?",
				options: [
					"100x=81.111…, 10x=8.111…",
					"10x=8.111…, x=0.8111…",
					"100x=8.111…, x=81.111…"
				],
				answer: 0,
				talk: "순환하지 않는 8까지 지나서 반복되는 1이 같은 자리에 오도록 100x와 10x를 만들어."
			},
			{
				tag: "SUBTRACT",
				q: "100x-10x의 왼쪽을 계산하면?",
				options: [
					"90x",
					"99x",
					"10x"
				],
				answer: 0,
				talk: "100x에서 10x를 빼면 90x야."
			},
			{
				tag: "DECIMAL",
				q: "81.111…-8.111…의 값은?",
				options: [
					"73",
					"72",
					"73.111…"
				],
				answer: 0,
				talk: "끝없이 반복되는 소수 부분이 서로 지워지고 81-8=73만 남아."
			},
			{
				tag: "EQUATION",
				q: "소수 부분을 없앤 뒤 얻는 방정식은?",
				options: [
					"90x=73",
					"99x=73",
					"90x=81"
				],
				answer: 0,
				talk: "왼쪽과 오른쪽 계산을 연결하면 90x=73이야."
			},
			{
				tag: "ANSWER",
				q: "90x=73을 풀어 x를 분수로 나타내면?",
				options: [
					"73/90",
					"90/73",
					"8/11"
				],
				answer: 0,
				talk: "양변을 90으로 나누면 x=73/90이야."
			}
		], [
			{
				q: "0.3222…를 분수로 나타내시오.",
				a: "29/90"
			},
			{
				q: "1.2333…을 분수로 나타내시오.",
				a: "37/30"
			},
			{
				q: "0.1444…를 분수로 나타내시오.",
				a: "13/90"
			}
		])
	},
	{
		term: "중2 · 1학기",
		major: "5. 일차함수",
		middle: "일차함수와 그래프",
		minor: "일차함수의 식 구하기",
		problem: evalQuestion("중2 · 교과서 대단원 학습평가 06", "직선 y=(1/4)x-2의 x절편과 직선 y=-5x+6의 y절편을 각각 x절편, y절편으로 하는 직선의 식을 구하시오.", "y=-3/4x+6", [
			{
				tag: "X-INTERCEPT",
				q: "첫 번째 직선의 x절편을 구하려면 y에 어떤 수를 넣을까요?",
				options: [
					"0",
					"1",
					"-2"
				],
				answer: 0,
				talk: "x축 위의 점은 y좌표가 0이야. y=0을 넣어 x절편부터 찾아보자."
			},
			{
				tag: "CALCULATE",
				q: "0=(1/4)x-2를 풀면 x절편은 얼마인가요?",
				options: [
					"8",
					"-8",
					"2"
				],
				answer: 0,
				talk: "양변에 2를 더하면 2=(1/4)x이고, 양변에 4를 곱하면 x=8이야."
			},
			{
				tag: "Y-INTERCEPT",
				q: "직선 y=-5x+6의 y절편은 얼마인가요?",
				options: [
					"6",
					"-5",
					"5"
				],
				answer: 0,
				talk: "y=ax+b에서 y절편은 상수항 b야. 따라서 y절편은 6이지."
			},
			{
				tag: "TWO POINTS",
				q: "새 직선이 지나는 두 점을 바르게 나타낸 것은?",
				options: [
					"(8,0), (0,6)",
					"(0,8), (6,0)",
					"(-8,0), (0,-6)"
				],
				answer: 0,
				talk: "x절편은 (8,0), y절편은 (0,6)이라는 두 점으로 나타낼 수 있어."
			},
			{
				tag: "SLOPE",
				q: "두 점 (8,0), (0,6)을 지나는 직선의 기울기는?",
				options: [
					"-3/4",
					"3/4",
					"-4/3"
				],
				answer: 0,
				talk: "기울기=(0-6)/(8-0)=-6/8=-3/4이야."
			},
			{
				tag: "EQUATION",
				q: "기울기가 -3/4이고 y절편이 6인 직선의 식은?",
				options: [
					"y=-3/4x+6",
					"y=3/4x+6",
					"y=-4/3x+6"
				],
				answer: 0,
				talk: "y=ax+b에 기울기 a=-3/4, y절편 b=6을 넣으면 완성돼."
			}
		], [
			{
				q: "x절편이 4이고 y절편이 8인 직선의 식을 구하시오.",
				a: "y=-2x+8"
			},
			{
				q: "x절편이 6이고 y절편이 -3인 직선의 식을 구하시오.",
				a: "y=1/2x-3"
			},
			{
				q: "x절편이 -5이고 y절편이 10인 직선의 식을 구하시오.",
				a: "y=2x+10"
			}
		])
	},
	{
		term: "중2 · 1학기",
		major: "3. 일차부등식",
		middle: "일차부등식",
		minor: "일차부등식의 활용",
		problem: evalQuestion("중2 · 교과서 대단원 학습평가 01", "지욱이는 세 번의 수학 시험에서 87점, 79점, 84점을 받았다. 네 번째까지의 평균이 85점 이상이 되려면 네 번째 시험에서 몇 점 이상을 받아야 하는지 구하시오.", "90", [
			{
				tag: "UNKNOWN",
				q: "네 번째 시험 점수를 무엇으로 놓을까요?",
				options: [
					"x점",
					"85점",
					"250점"
				],
				answer: 0,
				talk: "아직 모르는 네 번째 점수만 x점이라고 놓자."
			},
			{
				tag: "SUM",
				q: "앞의 세 시험 점수의 합은?",
				options: [
					"250점",
					"255점",
					"240점"
				],
				answer: 0,
				talk: "87+79+84=250점이야."
			},
			{
				tag: "MEANING",
				q: "네 번의 평균이 85점 이상이라는 뜻을 식으로 나타내면?",
				options: [
					"(250+x)÷4≥85",
					"250+x≥85",
					"(250+x)÷3≥85"
				],
				answer: 0,
				talk: "네 점수의 합을 시험 횟수 4로 나눈 값이 85 이상이어야 해."
			},
			{
				tag: "MULTIPLY",
				q: "(250+x)÷4≥85의 양변에 4를 곱하면?",
				options: [
					"250+x≥340",
					"250+x≥89",
					"250+x≥21.25"
				],
				answer: 0,
				talk: "양수 4를 곱하면 부등호 방향은 그대로이고 85×4=340이야."
			},
			{
				tag: "SOLVE",
				q: "250+x≥340에서 x의 범위는?",
				options: [
					"x≥90",
					"x≤90",
					"x≥85"
				],
				answer: 0,
				talk: "양변에서 250을 빼면 x≥90이야."
			},
			{
				tag: "ANSWER",
				q: "문제에서 묻는 ‘몇 점 이상’의 답은?",
				options: [
					"90점 이상",
					"85점 이상",
					"100점 이상"
				],
				answer: 0,
				talk: "네 번째 시험에서 90점 이상을 받아야 평균이 85점 이상이 돼."
			}
		], [
			{
				q: "세 시험 점수가 72점, 81점, 83점일 때 네 번의 평균이 80점 이상이 되기 위한 네 번째 점수를 구하시오.",
				a: "84"
			},
			{
				q: "세 시험 점수가 91점, 86점, 88점일 때 네 번의 평균이 89점 이상이 되기 위한 네 번째 점수를 구하시오.",
				a: "91"
			},
			{
				q: "네 시험 점수가 65점, 74점, 78점, 83점일 때 다섯 번의 평균이 76점 이상이 되기 위한 다섯 번째 점수를 구하시오.",
				a: "80"
			}
		])
	},
	{
		term: "중2 · 1학기",
		major: "4. 연립일차방정식",
		middle: "연립일차방정식의 활용",
		minor: "연립일차방정식의 활용",
		problem: evalQuestion("중2 · 교과서 대단원 학습평가 02", "식품 A 100 g에는 단백질 8 g, 지방 4 g이 있고 식품 B 100 g에는 단백질 2 g, 지방 6 g이 있다. 두 식품으로 단백질 17 g, 지방 15 g을 섭취하려면 A와 B를 각각 몇 g 먹어야 하는지 구하시오.", "180,130", [
			{
				tag: "GOAL",
				q: "이 문제에서 마지막으로 구해야 하는 두 값은?",
				options: [
					"식품 A와 B의 섭취량",
					"단백질과 지방의 가격",
					"두 식품의 개수"
				],
				answer: 0,
				talk: "문제는 영양소 양이 아니라 A와 B를 각각 몇 g 먹어야 하는지 묻고 있어."
			},
			{
				tag: "READ TABLE",
				q: "표에서 식품 A 100 g에 들어 있는 단백질과 지방은?",
				options: [
					"8 g, 4 g",
					"4 g, 8 g",
					"2 g, 6 g"
				],
				answer: 0,
				talk: "A행을 가로로 읽으면 단백질 8 g, 지방 4 g이야."
			},
			{
				tag: "READ TABLE",
				q: "표에서 식품 B 100 g에 들어 있는 단백질과 지방은?",
				options: [
					"2 g, 6 g",
					"6 g, 2 g",
					"8 g, 4 g"
				],
				answer: 0,
				talk: "B행을 가로로 읽으면 단백질 2 g, 지방 6 g이야."
			},
			{
				tag: "UNKNOWN",
				q: "먹을 식품 A와 B의 양을 각각 어떻게 놓을까요?",
				options: [
					"x g, y g",
					"8 g, 6 g",
					"17 g, 15 g"
				],
				answer: 0,
				talk: "구해야 하는 A의 양을 x g, B의 양을 y g이라고 놓자."
			},
			{
				tag: "PROPORTION A",
				q: "식품 A를 x g 먹을 때 섭취하는 단백질은?",
				options: [
					"8x/100 g",
					"8x g",
					"100x/8 g"
				],
				answer: 0,
				talk: "100 g에 8 g이므로 x g에는 8×x/100 g이 들어 있어."
			},
			{
				tag: "PROPORTION B",
				q: "식품 B를 y g 먹을 때 섭취하는 단백질은?",
				options: [
					"2y/100 g",
					"2y g",
					"100y/2 g"
				],
				answer: 0,
				talk: "100 g에 2 g이므로 y g에는 2×y/100 g이 들어 있어."
			},
			{
				tag: "PROTEIN EQUATION",
				q: "단백질을 모두 17 g 섭취한다는 말을 등식으로 나타내면?",
				options: [
					"8x/100+2y/100=17",
					"8x/100+6y/100=17",
					"8x+2y=17"
				],
				answer: 0,
				talk: "A의 단백질과 B의 단백질을 더해 목표량 17과 같다고 놓아."
			},
			{
				tag: "FAT A",
				q: "식품 A를 x g 먹을 때 섭취하는 지방은?",
				options: [
					"4x/100 g",
					"8x/100 g",
					"4x g"
				],
				answer: 0,
				talk: "A 100 g에는 지방 4 g이므로 x g에는 4x/100 g이야."
			},
			{
				tag: "FAT B",
				q: "식품 B를 y g 먹을 때 섭취하는 지방은?",
				options: [
					"6y/100 g",
					"2y/100 g",
					"6y g"
				],
				answer: 0,
				talk: "B 100 g에는 지방 6 g이므로 y g에는 6y/100 g이야."
			},
			{
				tag: "FAT EQUATION",
				q: "지방을 모두 15 g 섭취한다는 말을 등식으로 나타내면?",
				options: [
					"4x/100+6y/100=15",
					"8x/100+2y/100=15",
					"4x+6y=15"
				],
				answer: 0,
				talk: "A와 B의 지방을 더해 목표량 15와 같다고 놓아."
			},
			{
				tag: "CLEAR DENOMINATORS",
				q: "두 등식에 100을 곱한 뒤 2로 나누어 정리한 연립방정식은?",
				options: [
					"4x+y=850, 2x+3y=750",
					"8x+2y=1700, 4x+6y=1500",
					"x+y=32, x-y=2"
				],
				answer: 0,
				talk: "첫 식은 8x+2y=1700에서 2로 나누고, 둘째 식은 4x+6y=1500에서 2로 나눠."
			},
			{
				tag: "ELIMINATE Y",
				q: "y를 없애기 위해 4x+y=850에 3을 곱한 식은?",
				options: [
					"12x+3y=2550",
					"4x+3y=2550",
					"12x+y=850"
				],
				answer: 0,
				talk: "둘째 식의 3y와 계수를 맞추기 위해 첫 식 전체에 3을 곱해."
			},
			{
				tag: "SOLVE X",
				q: "12x+3y=2550에서 2x+3y=750을 빼면 x는?",
				options: [
					"180",
					"130",
					"850"
				],
				answer: 0,
				talk: "10x=1800이므로 양변을 10으로 나누어 x=180이야."
			},
			{
				tag: "SOLVE Y",
				q: "x=180을 4x+y=850에 넣어 구한 y는?",
				options: [
					"130",
					"180",
					"70"
				],
				answer: 0,
				talk: "720+y=850이므로 y=130이야."
			},
			{
				tag: "ANSWER",
				q: "x와 y가 나타내는 뜻까지 붙여 답을 쓰면?",
				options: [
					"A 180 g, B 130 g",
					"A 130 g, B 180 g",
					"단백질 180 g, 지방 130 g"
				],
				answer: 0,
				talk: "x는 A의 양, y는 B의 양으로 정했으므로 A 180 g, B 130 g이야."
			},
			{
				tag: "CHECK",
				q: "단백질 조건을 검산한 식은?",
				options: [
					"8×180/100+2×130/100=17",
					"4×180/100+6×130/100=17",
					"180+130=17"
				],
				answer: 0,
				talk: "14.4+2.6=17이 되어 단백질 조건과 맞고, 지방도 7.2+7.8=15로 맞아."
			}
		], [
			{
				q: "A 100g에 단백질 6g·지방 2g, B 100g에 단백질 2g·지방 4g이 있다. 단백질 16g, 지방 10g을 섭취할 A, B의 양을 구하시오.",
				a: "220,140"
			},
			{
				q: "A 100g에 영양소가 각각 5g·3g, B는 1g·5g이다. 두 영양소를 각각 12g·16g 섭취할 A, B의 양을 구하시오.",
				a: "200,200"
			},
			{
				q: "A 100g에 영양소가 각각 4g·2g, B는 2g·6g이다. 두 영양소를 각각 14g·18g 섭취할 A, B의 양을 구하시오.",
				a: "240,220"
			}
		])
	},
	{
		term: "중2 · 1학기",
		major: "3. 일차부등식",
		middle: "일차부등식",
		minor: "일차부등식의 활용",
		problem: evalQuestion("중2 · 교과서 대단원 학습평가 03", "1인 식사비가 12000원인 식당에서 ‘생일자 1명 무료’와 ‘전체 식사비 20% 할인’ 중 한 장만 사용할 수 있다. 몇 명 이상 식사해야 20% 할인권이 더 유리한지 구하시오.", "6", [
			{
				tag: "UNKNOWN",
				q: "식사하는 사람 수를 무엇으로 놓을까요?",
				options: [
					"x명",
					"12000명",
					"20명"
				],
				answer: 0,
				talk: "비교해야 하는 사람 수를 x명이라고 놓자."
			},
			{
				tag: "FREE",
				q: "생일자 1명 무료일 때 내는 총금액은?",
				options: [
					"12000(x-1)",
					"12000x-1",
					"12000(x+1)"
				],
				answer: 0,
				talk: "x명 중 한 명은 무료이므로 x-1명의 식사비를 내."
			},
			{
				tag: "DISCOUNT",
				q: "전체 금액에서 20% 할인받아 내는 금액은?",
				options: [
					"12000×0.8x",
					"12000×0.2x",
					"12000(x-1)"
				],
				answer: 0,
				talk: "20%를 빼면 원래 금액의 80%, 즉 0.8배를 내."
			},
			{
				tag: "COMPARE",
				q: "20% 할인권이 더 유리하다는 부등식은?",
				options: [
					"12000×0.8x<12000(x-1)",
					"12000×0.8x>12000(x-1)",
					"0.8x=x-1"
				],
				answer: 0,
				talk: "더 유리하다는 말은 실제로 내는 금액이 더 작다는 뜻이야."
			},
			{
				tag: "SOLVE",
				q: "0.8x<x-1을 풀면?",
				options: [
					"x>5",
					"x<5",
					"x≥5"
				],
				answer: 0,
				talk: "양변에서 0.8x를 빼면 0<0.2x-1, 따라서 x>5야."
			},
			{
				tag: "NATURAL",
				q: "사람 수는 자연수이므로 x>5를 만족하는 가장 작은 수는?",
				options: [
					"6명",
					"5명",
					"4명"
				],
				answer: 0,
				talk: "5명은 두 금액이 같고, 6명부터 20% 할인권이 더 저렴해."
			}
		], [
			{
				q: "한 명 무료와 전체 25% 할인 중 25% 할인이 더 유리해지는 최소 인원수를 구하시오.",
				a: "5"
			},
			{
				q: "한 명 무료와 전체 10% 할인 중 10% 할인이 더 유리해지는 최소 인원수를 구하시오.",
				a: "11"
			},
			{
				q: "두 명 무료와 전체 20% 할인 중 20% 할인이 더 유리해지는 최소 인원수를 구하시오.",
				a: "11"
			}
		])
	}
];
var g3Pieces = (rows) => rows.map((r, i) => ({
	tag: `STEP ${i + 1}`,
	q: r[0],
	options: [
		r[1],
		r[2],
		r[3]
	],
	answer: 0,
	talk: r[4]
}));
var g3Problem = (title, q, a, rows, practice) => evalQuestion(title, q, a, g3Pieces(rows), practice);
var grade3CurriculumAssessment = [
	{
		term: "중3 · 1학기",
		major: "1. 제곱근과 실수",
		middle: "제곱근과 실수",
		minor: "무리수와 실수",
		problem: g3Problem("중3 · 교과서 중단원 학습점검 03", "다음 수 √2, 0.25, 3/7, √9 중 무리수인 것을 모두 고르시오.", "√2", [
			[
				"무리수의 뜻은?",
				"유리수가 아닌 실수",
				"모든 분수",
				"모든 자연수",
				"무리수는 두 정수의 비로 나타낼 수 없는 실수야."
			],
			[
				"0.25는 분수로 나타내면?",
				"1/4",
				"25/10",
				"나타낼 수 없다",
				"유한소수 0.25=1/4이므로 유리수야."
			],
			[
				"3/7은 어떤 수인가요?",
				"유리수",
				"무리수",
				"자연수",
				"이미 두 정수의 비로 나타나 있어."
			],
			[
				"√9의 값은?",
				"3",
				"9",
				"무리수",
				"√9=3이므로 유리수야."
			],
			[
				"남는 무리수는?",
				"√2",
				"0.25",
				"√9",
				"√2는 순환하지 않는 무한소수로 유리수가 아니야."
			]
		], [
			{
				q: "√3, 0.4, √16 중 무리수를 고르시오.",
				a: "√3"
			},
			{
				q: "√5, 2/9, 1.2 중 무리수를 고르시오.",
				a: "√5"
			},
			{
				q: "√7, √25, 0.125 중 무리수를 고르시오.",
				a: "√7"
			}
		])
	},
	{
		term: "중3 · 1학기",
		major: "1. 제곱근과 실수",
		middle: "근호를 포함한 식의 계산",
		minor: "제곱근의 곱셈과 나눗셈",
		problem: g3Problem("중3 · 교과서 중단원 학습점검 04", "√12×√18을 간단히 하시오.", "6√6", [
			[
				"근호끼리 곱하는 첫 식은?",
				"√(12×18)",
				"√12+√18",
				"√(12+18)",
				"양수가 든 두 근호의 곱은 한 근호 안에서 곱할 수 있어."
			],
			[
				"12×18은?",
				"216",
				"30",
				"126",
				"12×18=216이야."
			],
			[
				"216에서 완전제곱수 인수는?",
				"36×6",
				"18×12",
				"9×24",
				"가장 큰 완전제곱수 36을 꺼내면 편해."
			],
			[
				"√216을 나누어 쓰면?",
				"√36×√6",
				"36√6",
				"√36+√6",
				"√(36×6)=√36×√6이야."
			],
			[
				"√36×√6의 값은?",
				"6√6",
				"36√6",
				"6+√6",
				"√36=6이므로 6√6이야."
			]
		], [
			{
				q: "√8×√6을 간단히 하시오.",
				a: "4√3"
			},
			{
				q: "√15×√10을 간단히 하시오.",
				a: "5√6"
			},
			{
				q: "√27÷√3을 간단히 하시오.",
				a: "3"
			}
		])
	},
	{
		term: "중3 · 1학기",
		major: "1. 제곱근과 실수",
		middle: "근호를 포함한 식의 계산",
		minor: "분모의 유리화",
		problem: g3Problem("중3 · 교과서 중단원 학습점검 05", "3/√6의 분모를 유리화하여 간단히 하시오.", "√6/2", [
			[
				"분모에서 없애야 하는 것은?",
				"√6",
				"3",
				"분수선",
				"분모의 근호를 없애는 과정이 유리화야."
			],
			[
				"분자와 분모에 곱할 수는?",
				"√6",
				"6",
				"3",
				"값을 바꾸지 않도록 √6/√6을 곱해."
			],
			[
				"곱한 식은?",
				"3√6/6",
				"18/√6",
				"3/6",
				"분자는 3√6, 분모는 √6×√6=6이야."
			],
			[
				"3√6/6에서 약분할 수는?",
				"3",
				"6",
				"√6",
				"분자와 분모를 3으로 나눌 수 있어."
			],
			[
				"간단히 한 값은?",
				"√6/2",
				"√6/3",
				"3√6",
				"3√6/6=√6/2야."
			]
		], [
			{
				q: "2/√3을 유리화하시오.",
				a: "2√3/3"
			},
			{
				q: "5/√10을 유리화하시오.",
				a: "√10/2"
			},
			{
				q: "4/√8을 유리화하시오.",
				a: "√2"
			}
		])
	},
	{
		term: "중3 · 1학기",
		major: "1. 제곱근과 실수",
		middle: "근호를 포함한 식의 계산",
		minor: "덧셈과 뺄셈",
		problem: g3Problem("중3 · 교과서 중단원 학습점검 06", "2√12-√27+√3을 간단히 하시오.", "2√3", [
			[
				"√12를 간단히 하면?",
				"2√3",
				"3√2",
				"4√3",
				"√12=√(4×3)=2√3이야."
			],
			[
				"√27을 간단히 하면?",
				"3√3",
				"9√3",
				"3√2",
				"√27=√(9×3)=3√3이야."
			],
			[
				"원래 식에 넣으면?",
				"4√3-3√3+√3",
				"2√3-3√3+√3",
				"4√3-√27",
				"2√12=4√3인 점을 주의해."
			],
			[
				"계수만 계산하면?",
				"4-3+1",
				"2-3+1",
				"4+3+1",
				"같은 √3끼리는 앞의 수를 계산해."
			],
			[
				"최종값은?",
				"2√3",
				"√3",
				"0",
				"4-3+1=2이므로 2√3이야."
			]
		], [
			{
				q: "√8+√18을 간단히 하시오.",
				a: "5√2"
			},
			{
				q: "3√20-2√45를 간단히 하시오.",
				a: "0"
			},
			{
				q: "√50-√8+√2를 간단히 하시오.",
				a: "4√2"
			}
		])
	},
	{
		term: "중3 · 1학기",
		major: "2. 다항식의 곱셈과 인수분해",
		middle: "다항식의 곱셈",
		minor: "곱셈 공식",
		problem: g3Problem("중3 · 교과서 중단원 학습점검 01", "(2x-3)²을 전개하시오.", "4x²-12x+9", [
			[
				"사용할 공식은?",
				"(a-b)²=a²-2ab+b²",
				"(a-b)²=a²-b²",
				"(a+b)²=a²+b²",
				"차의 제곱 공식을 사용해."
			],
			[
				"a와 b에 해당하는 것은?",
				"a=2x, b=3",
				"a=x, b=3",
				"a=2, b=x",
				"괄호의 두 항을 통째로 대응해."
			],
			[
				"첫째 항의 제곱은?",
				"4x²",
				"2x²",
				"4x",
				"(2x)²=4x²이야."
			],
			[
				"가운데 항 -2ab는?",
				"-12x",
				"-6x",
				"12x",
				"-2×2x×3=-12x야."
			],
			[
				"전개한 식은?",
				"4x²-12x+9",
				"4x²-9",
				"2x²-6x+9",
				"마지막 3²=9까지 더해."
			]
		], [
			{
				q: "(x+5)²을 전개하시오.",
				a: "x²+10x+25"
			},
			{
				q: "(3x-2)²을 전개하시오.",
				a: "9x²-12x+4"
			},
			{
				q: "(2x+1)(2x-1)을 전개하시오.",
				a: "4x²-1"
			}
		])
	},
	{
		term: "중3 · 1학기",
		major: "2. 다항식의 곱셈과 인수분해",
		middle: "다항식의 곱셈",
		minor: "곱셈 공식의 활용",
		problem: g3Problem("중3 · 교과서 대단원 학습평가 04", "x+1/x=3일 때, x²+1/x²의 값을 구하시오.", "7", [
			[
				"주어진 식을 제곱하면?",
				"(x+1/x)²=9",
				"x²+1/x²=3",
				"x+1/x=9",
				"양변을 제곱해."
			],
			[
				"왼쪽을 전개하면?",
				"x²+2+1/x²",
				"x²+1/x²",
				"2x²+2/x²",
				"가운데 항 2×x×1/x=2야."
			],
			[
				"따라서 얻는 식은?",
				"x²+2+1/x²=9",
				"x²+1/x²=9",
				"x²+2=9",
				"전개한 왼쪽과 9를 같게 둬."
			],
			[
				"구하려는 식만 남기려면?",
				"양변에서 2를 뺀다",
				"양변에 2를 더한다",
				"양변을 2로 나눈다",
				"가운데 상수 2를 없애."
			],
			[
				"값은?",
				"7",
				"11",
				"9",
				"9-2=7이야."
			]
		], [
			{
				q: "x+1/x=4일 때 x²+1/x²을 구하시오.",
				a: "14"
			},
			{
				q: "x-1/x=3일 때 x²+1/x²을 구하시오.",
				a: "11"
			},
			{
				q: "a+b=5, ab=4일 때 a²+b²을 구하시오.",
				a: "17"
			}
		])
	},
	{
		term: "중3 · 1학기",
		major: "2. 다항식의 곱셈과 인수분해",
		middle: "인수분해",
		minor: "인수분해 공식",
		problem: g3Problem("중3 · 교과서 중단원 학습점검 05", "x²-7x+12를 인수분해하시오.", "(x-3)(x-4)", [
			[
				"상수항 12가 되도록 곱할 두 수는?",
				"3과 4",
				"2와 6",
				"1과 12",
				"곱이 12인 수를 찾아."
			],
			[
				"일차항 -7x가 되려면 두 수의 부호는?",
				"둘 다 음수",
				"둘 다 양수",
				"서로 다른 부호",
				"합이 -7이므로 -3과 -4야."
			],
			[
				"두 수의 합은?",
				"-3+(-4)=-7",
				"3+4=7",
				"-3+4=1",
				"일차항의 계수와 맞아."
			],
			[
				"인수의 꼴은?",
				"(x-3)(x-4)",
				"(x+3)(x+4)",
				"(x-2)(x-6)",
				"찾은 두 수를 x와 함께 괄호에 넣어."
			],
			[
				"전개하여 확인하면?",
				"x²-7x+12",
				"x²+7x+12",
				"x²-12",
				"원래 식과 같아."
			]
		], [
			{
				q: "x²+5x+6을 인수분해하시오.",
				a: "(x+2)(x+3)"
			},
			{
				q: "x²-x-12를 인수분해하시오.",
				a: "(x-4)(x+3)"
			},
			{
				q: "4x²-9를 인수분해하시오.",
				a: "(2x-3)(2x+3)"
			}
		])
	},
	{
		term: "중3 · 1학기",
		major: "2. 다항식의 곱셈과 인수분해",
		middle: "인수분해",
		minor: "인수분해의 활용",
		problem: g3Problem("중3 · 교과서 대단원 학습평가 08", "99²-1을 인수분해 공식을 이용하여 계산하시오.", "9800", [
			[
				"식의 꼴은?",
				"a²-b²",
				"(a-b)²",
				"a²+b²",
				"99²-1²인 제곱의 차야."
			],
			[
				"사용할 공식은?",
				"a²-b²=(a-b)(a+b)",
				"a²-b²=(a-b)²",
				"a²-b²=a(a-b)",
				"합차 공식으로 바꿔."
			],
			[
				"값을 넣은 식은?",
				"(99-1)(99+1)",
				"(99-1)²",
				"99×98",
				"a=99, b=1이야."
			],
			[
				"각 괄호를 계산하면?",
				"98×100",
				"99×100",
				"98×99",
				"99-1=98, 99+1=100이야."
			],
			[
				"최종값은?",
				"9800",
				"9900",
				"9702",
				"98×100=9800이야."
			]
		], [
			{
				q: "101²-1을 계산하시오.",
				a: "10200"
			},
			{
				q: "50²-2²을 계산하시오.",
				a: "2496"
			},
			{
				q: "97×103을 곱셈 공식으로 계산하시오.",
				a: "9991"
			}
		])
	},
	{
		term: "중3 · 1학기",
		major: "3. 이차방정식",
		middle: "이차방정식",
		minor: "이차방정식과 그 해",
		problem: g3Problem("중3 · 교과서 중단원 학습점검 01", "x=2가 이차방정식 x²+kx-6=0의 해일 때, k의 값을 구하시오.", "1", [
			[
				"x=2가 해라는 뜻은?",
				"식에 넣으면 등식이 성립",
				"x를 0으로 바꿈",
				"항상 2를 더함",
				"해를 방정식에 대입하면 왼쪽이 0이 돼."
			],
			[
				"x=2를 대입한 식은?",
				"4+2k-6=0",
				"2+k-6=0",
				"4+k-6=2",
				"x²=4, kx=2k야."
			],
			[
				"상수항을 정리하면?",
				"2k-2=0",
				"2k+10=0",
				"k-2=0",
				"4-6=-2야."
			],
			[
				"2k만 남기면?",
				"2k=2",
				"2k=-2",
				"k=2",
				"양변에 2를 더해."
			],
			[
				"k의 값은?",
				"1",
				"2",
				"-1",
				"양변을 2로 나누면 k=1이야."
			]
		], [
			{
				q: "x=3이 x²+kx-12=0의 해일 때 k를 구하시오.",
				a: "1"
			},
			{
				q: "x=-2가 x²+kx-8=0의 해일 때 k를 구하시오.",
				a: "-2"
			},
			{
				q: "x=1이 2x²+kx-5=0의 해일 때 k를 구하시오.",
				a: "3"
			}
		])
	},
	{
		term: "중3 · 1학기",
		major: "3. 이차방정식",
		middle: "이차방정식",
		minor: "인수분해를 이용한 풀이",
		problem: g3Problem("중3 · 교과서 중단원 학습점검 02", "x²-5x+6=0을 인수분해하여 풀어라.", "2,3", [
			[
				"왼쪽을 인수분해하면?",
				"(x-2)(x-3)",
				"(x+2)(x+3)",
				"(x-1)(x-6)",
				"곱이 6, 합이 -5인 -2와 -3을 사용해."
			],
			[
				"방정식은 어떤 꼴인가요?",
				"(x-2)(x-3)=0",
				"x-2=x-3",
				"x²=6",
				"두 인수의 곱이 0인 꼴이야."
			],
			[
				"곱이 0이 되려면?",
				"둘 중 적어도 하나가 0",
				"두 인수가 모두 1",
				"두 인수가 같다",
				"영인수의 성질을 사용해."
			],
			[
				"각 인수를 0으로 놓으면?",
				"x-2=0 또는 x-3=0",
				"x-2=3",
				"x=0",
				"두 경우를 모두 풀어."
			],
			[
				"두 해는?",
				"2, 3",
				"-2, -3",
				"1, 6",
				"x=2 또는 x=3이야."
			]
		], [
			{
				q: "x²-7x+12=0을 풀어라.",
				a: "3,4"
			},
			{
				q: "x²+x-6=0을 풀어라.",
				a: "-3,2"
			},
			{
				q: "2x²-8x=0을 풀어라.",
				a: "0,4"
			}
		])
	},
	{
		term: "중3 · 1학기",
		major: "3. 이차방정식",
		middle: "이차방정식",
		minor: "제곱근을 이용한 풀이",
		problem: g3Problem("중3 · 교과서 중단원 학습점검 03", "(x-1)²=16을 풀어라.", "-3,5", [
			[
				"양변의 제곱근을 생각하면?",
				"x-1=±4",
				"x-1=4만 가능",
				"x-1=16",
				"제곱해서 16이 되는 수는 4와 -4야."
			],
			[
				"첫째 식은?",
				"x-1=4",
				"x+1=4",
				"x-1=-16",
				"양의 제곱근 경우야."
			],
			[
				"첫째 해는?",
				"x=5",
				"x=3",
				"x=4",
				"양변에 1을 더해."
			],
			[
				"둘째 식과 해는?",
				"x-1=-4, x=-3",
				"x-1=-4, x=3",
				"x+1=-4, x=-5",
				"음의 제곱근 경우도 풀어."
			],
			[
				"두 해를 쓰면?",
				"-3, 5",
				"3, 5",
				"-4, 4",
				"작은 수부터 써."
			]
		], [
			{
				q: "(x+2)²=9를 풀어라.",
				a: "-5,1"
			},
			{
				q: "(x-3)²=25를 풀어라.",
				a: "-2,8"
			},
			{
				q: "2x²=18을 풀어라.",
				a: "-3,3"
			}
		])
	},
	{
		term: "중3 · 1학기",
		major: "3. 이차방정식",
		middle: "이차방정식",
		minor: "근의 공식",
		problem: g3Problem("중3 · 교과서 중단원 학습점검 04", "2x²-3x-2=0을 근의 공식으로 풀어라.", "-1/2,2", [
			[
				"a,b,c는?",
				"a=2,b=-3,c=-2",
				"a=2,b=3,c=-2",
				"a=-2,b=-3,c=2",
				"ax²+bx+c=0과 비교해."
			],
			[
				"판별식 b²-4ac는?",
				"25",
				"-7",
				"9",
				"(-3)²-4×2×(-2)=9+16=25야."
			],
			[
				"근의 공식에 넣으면?",
				"x=(3±√25)/4",
				"x=(-3±√25)/4",
				"x=(3±25)/2",
				"-b=3, 2a=4야."
			],
			[
				"√25를 계산하면?",
				"5",
				"25",
				"-5만 가능",
				"√25=5야."
			],
			[
				"두 해는?",
				"-1/2, 2",
				"-2, 1/2",
				"1, 2",
				"(3-5)/4=-1/2, (3+5)/4=2야."
			]
		], [
			{
				q: "x²-4x-1=0을 근의 공식으로 풀어라.",
				a: "2-√5,2+√5"
			},
			{
				q: "2x²+x-3=0을 풀어라.",
				a: "-3/2,1"
			},
			{
				q: "3x²-5x+1=0을 풀어라.",
				a: "(5-√13)/6,(5+√13)/6"
			}
		])
	},
	{
		term: "중3 · 1학기",
		major: "3. 이차방정식",
		middle: "이차방정식의 활용",
		minor: "수·도형·생활 문제",
		problem: g3Problem("중3 · 교과서 대단원 학습평가 09", "가로가 세로보다 3 cm 긴 직사각형의 넓이가 40 cm²일 때, 세로의 길이를 구하시오.", "5", [
			[
				"세로를 무엇으로 놓을까요?",
				"x cm",
				"x+3 cm",
				"40 cm",
				"구하려는 세로를 x로 놓아."
			],
			[
				"가로는?",
				"x+3 cm",
				"x-3 cm",
				"3x cm",
				"가로가 세로보다 3 cm 길어."
			],
			[
				"넓이 식은?",
				"x(x+3)=40",
				"x+x+3=40",
				"3x=40",
				"세로×가로=넓이야."
			],
			[
				"정리한 이차방정식은?",
				"x²+3x-40=0",
				"x²+3x+40=0",
				"x²-3x-40=0",
				"40을 왼쪽으로 이항해."
			],
			[
				"양의 해는?",
				"5 cm",
				"-8 cm",
				"8 cm",
				"(x+8)(x-5)=0이고 길이는 양수이므로 5야."
			]
		], [
			{
				q: "가로가 세로보다 2 cm 길고 넓이가 48 cm²일 때 세로를 구하시오.",
				a: "6"
			},
			{
				q: "연속한 두 자연수의 곱이 72일 때 작은 수를 구하시오.",
				a: "8"
			},
			{
				q: "한 변을 3 cm 늘리면 넓이가 64 cm²인 정사각형의 원래 한 변을 구하시오.",
				a: "5"
			}
		])
	},
	{
		term: "중3 · 1학기",
		major: "4. 이차함수",
		middle: "이차함수와 그래프",
		minor: "이차함수의 뜻",
		problem: g3Problem("중3 · 교과서 중단원 학습점검 01", "다음 중 y가 x의 이차함수인 것을 고르시오. ㄱ. y=3x²-2 ㄴ. y=2x+1 ㄷ. y=5/x", "ㄱ", [
			[
				"이차함수의 기본 꼴은?",
				"y=ax²+bx+c, a≠0",
				"y=ax+b",
				"y=a/x",
				"x의 최고차항이 2차인 다항식이야."
			],
			[
				"ㄱ의 최고차항은?",
				"3x²",
				"-2",
				"3x",
				"x²항의 계수 3이 0이 아니야."
			],
			[
				"ㄴ은 몇 차 함수인가요?",
				"일차함수",
				"이차함수",
				"반비례",
				"최고차항이 x야."
			],
			[
				"ㄷ은 다항식 함수인가요?",
				"아니다",
				"이차함수다",
				"상수함수다",
				"x가 분모에 있어 이차함수가 아니야."
			],
			[
				"정답은?",
				"ㄱ",
				"ㄴ",
				"ㄷ",
				"ㄱ만 이차함수야."
			]
		], [
			{
				q: "y=-x²+4에서 이차항의 계수를 쓰시오.",
				a: "-1"
			},
			{
				q: "y=2(x-1)²+3이 이차함수인지 답하시오.",
				a: "이차함수"
			},
			{
				q: "y=7x-2가 몇 차 함수인지 답하시오.",
				a: "일차함수"
			}
		])
	},
	{
		term: "중3 · 1학기",
		major: "4. 이차함수",
		middle: "이차함수와 그래프",
		minor: "y=ax²의 그래프",
		problem: g3Problem("중3 · 교과서 중단원 학습점검 02", "이차함수 y=-2x²의 그래프에 대한 설명으로 옳은 것을 고르시오. ㄱ. 아래로 볼록하다. ㄴ. y축에 대칭이다. ㄷ. 꼭짓점은 (0,0)이다.", "ㄴ,ㄷ", [
			[
				"a=-2의 부호는?",
				"음수",
				"양수",
				"0",
				"a<0인 포물선이야."
			],
			[
				"그래프가 열린 방향은?",
				"아래쪽",
				"위쪽",
				"오른쪽",
				"a<0이면 아래로 열려 위로 볼록해."
			],
			[
				"대칭축은?",
				"y축",
				"x축",
				"직선 x=2",
				"y=ax²의 축은 y축이야."
			],
			[
				"꼭짓점은?",
				"(0,0)",
				"(-2,0)",
				"(0,-2)",
				"평행이동하지 않은 기본 그래프야."
			],
			[
				"옳은 설명은?",
				"ㄴ,ㄷ",
				"ㄱ,ㄴ",
				"ㄱ,ㄷ",
				"ㄱ은 방향 표현이 틀렸어."
			]
		], [
			{
				q: "y=3x²의 축을 쓰시오.",
				a: "y축"
			},
			{
				q: "y=-x²의 꼭짓점을 쓰시오.",
				a: "(0,0)"
			},
			{
				q: "y=1/2x²은 위와 아래 중 어느 쪽으로 열리는지 쓰시오.",
				a: "위"
			}
		])
	},
	{
		term: "중3 · 1학기",
		major: "4. 이차함수",
		middle: "이차함수와 그래프",
		minor: "y=a(x-p)²의 그래프",
		problem: g3Problem("중3 · 교과서 중단원 학습점검 03", "이차함수 y=2(x-3)²의 꼭짓점과 축의 방정식을 차례로 구하시오.", "(3,0),x=3", [
			[
				"꼭짓점 꼴은?",
				"y=a(x-p)²+q",
				"y=ax²+bx+c",
				"y=ax+b",
				"p와 q를 바로 읽을 수 있어."
			],
			[
				"p의 값은?",
				"3",
				"-3",
				"2",
				"x-3=x-p이므로 p=3이야."
			],
			[
				"q의 값은?",
				"0",
				"2",
				"3",
				"뒤에 더한 상수가 없으므로 q=0이야."
			],
			[
				"꼭짓점은?",
				"(3,0)",
				"(-3,0)",
				"(0,3)",
				"꼭짓점은 (p,q)야."
			],
			[
				"축의 방정식은?",
				"x=3",
				"y=3",
				"x=-3",
				"꼭짓점을 지나는 세로선 x=p야."
			]
		], [
			{
				q: "y=(x-5)²의 꼭짓점과 축을 구하시오.",
				a: "(5,0),x=5"
			},
			{
				q: "y=-3(x+2)²의 꼭짓점을 구하시오.",
				a: "(-2,0)"
			},
			{
				q: "y=1/2(x-4)²의 축을 구하시오.",
				a: "x=4"
			}
		])
	},
	{
		term: "중3 · 1학기",
		major: "4. 이차함수",
		middle: "이차함수와 그래프",
		minor: "y=ax²+p의 그래프",
		problem: g3Problem("중3 · 교과서 중단원 학습점검 04", "이차함수 y=-x²+4의 꼭짓점과 축의 방정식을 차례로 구하시오.", "(0,4),x=0", [
			[
				"y=ax²+p에서 p는 어떤 이동인가요?",
				"위아래 이동",
				"좌우 이동",
				"기울기",
				"상수 p만큼 y축 방향으로 이동해."
			],
			[
				"p의 값은?",
				"4",
				"-1",
				"0",
				"식의 상수항이 4야."
			],
			[
				"꼭짓점의 x좌표는?",
				"0",
				"4",
				"-4",
				"좌우 이동은 없어서 x=0이야."
			],
			[
				"꼭짓점은?",
				"(0,4)",
				"(4,0)",
				"(0,-4)",
				"y=-x²의 꼭짓점이 위로 4 이동해."
			],
			[
				"축은?",
				"x=0",
				"x=4",
				"y=4",
				"대칭축은 여전히 y축이야."
			]
		], [
			{
				q: "y=2x²-3의 꼭짓점을 구하시오.",
				a: "(0,-3)"
			},
			{
				q: "y=-4x²+5의 축을 구하시오.",
				a: "x=0"
			},
			{
				q: "y=x²+7의 꼭짓점을 구하시오.",
				a: "(0,7)"
			}
		])
	},
	{
		term: "중3 · 1학기",
		major: "4. 이차함수",
		middle: "이차함수와 그래프",
		minor: "y=a(x-p)²+q의 그래프",
		problem: g3Problem("중3 · 교과서 중단원 학습점검 05", "이차함수 y=-2(x+1)²+5의 꼭짓점과 축의 방정식을 차례로 구하시오.", "(-1,5),x=-1", [
			[
				"x+1을 x-p로 보면 p는?",
				"-1",
				"1",
				"2",
				"x+1=x-(-1)이야."
			],
			[
				"q의 값은?",
				"5",
				"-2",
				"1",
				"괄호 뒤 상수는 5야."
			],
			[
				"꼭짓점은?",
				"(-1,5)",
				"(1,5)",
				"(-1,-5)",
				"(p,q)=(-1,5)야."
			],
			[
				"축은?",
				"x=-1",
				"x=1",
				"y=5",
				"축은 x=p야."
			],
			[
				"열리는 방향은?",
				"아래쪽",
				"위쪽",
				"오른쪽",
				"a=-2<0이므로 아래로 열려."
			]
		], [
			{
				q: "y=3(x-2)²-4의 꼭짓점과 축을 구하시오.",
				a: "(2,-4),x=2"
			},
			{
				q: "y=-(x+3)²+1의 꼭짓점을 구하시오.",
				a: "(-3,1)"
			},
			{
				q: "y=2(x-1)²+6의 축을 구하시오.",
				a: "x=1"
			}
		])
	},
	{
		term: "중3 · 1학기",
		major: "4. 이차함수",
		middle: "이차함수와 그래프",
		minor: "y=ax²+bx+c의 그래프",
		problem: g3Problem("중3 · 교과서 중단원 학습점검 06", "이차함수 y=x²-6x+5를 y=(x-p)²+q의 꼴로 나타내시오.", "(x-3)²-4", [
			[
				"x²-6x에서 절반으로 잡을 수는?",
				"-3",
				"-6",
				"3",
				"-6의 절반은 -3이야."
			],
			[
				"완전제곱식은?",
				"(x-3)²",
				"(x-6)²",
				"(x+3)²",
				"(x-3)²=x²-6x+9야."
			],
			[
				"9를 만들기 위해 식을 어떻게 하나요?",
				"9를 더하고 뺀다",
				"9만 더한다",
				"6을 뺀다",
				"식의 값이 바뀌지 않게 +9-9를 해."
			],
			[
				"정리하면?",
				"(x-3)²-4",
				"(x-3)²+5",
				"(x+3)²-4",
				"x²-6x+9-9+5야."
			],
			[
				"p,q는?",
				"p=3,q=-4",
				"p=-3,q=4",
				"p=6,q=5",
				"꼭짓점은 (3,-4)야."
			]
		], [
			{
				q: "y=x²+4x+1을 꼭짓점 꼴로 나타내시오.",
				a: "(x+2)²-3"
			},
			{
				q: "y=x²-8x+10을 꼭짓점 꼴로 나타내시오.",
				a: "(x-4)²-6"
			},
			{
				q: "y=2x²-8x+3을 꼭짓점 꼴로 나타내시오.",
				a: "2(x-2)²-5"
			}
		])
	},
	{
		term: "중3 · 1학기",
		major: "4. 이차함수",
		middle: "이차함수와 그래프",
		minor: "이차함수의 최댓값과 최솟값",
		problem: g3Problem("중3 · 교과서 중단원 학습점검 07", "이차함수 y=2(x-3)²-5의 최솟값과 그때의 x의 값을 구하시오.", "-5,3", [
			[
				"a=2의 부호는?",
				"양수",
				"음수",
				"0",
				"a>0이므로 위로 열리는 그래프야."
			],
			[
				"최솟값은 어디에서 생기나요?",
				"꼭짓점",
				"x절편",
				"아무 점",
				"위로 열린 포물선의 가장 낮은 점은 꼭짓점이야."
			],
			[
				"꼭짓점은?",
				"(3,-5)",
				"(-3,-5)",
				"(3,5)",
				"꼭짓점 꼴에서 (p,q)를 읽어."
			],
			[
				"최솟값은?",
				"-5",
				"3",
				"5",
				"꼭짓점의 y좌표가 최솟값이야."
			],
			[
				"그때 x는?",
				"3",
				"-3",
				"-5",
				"꼭짓점의 x좌표가 3이야."
			]
		], [
			{
				q: "y=(x+2)²+1의 최솟값과 그때 x를 구하시오.",
				a: "1,-2"
			},
			{
				q: "y=-2(x-1)²+7의 최댓값과 그때 x를 구하시오.",
				a: "7,1"
			},
			{
				q: "y=3x²-6의 최솟값과 그때 x를 구하시오.",
				a: "-6,0"
			}
		])
	},
	{
		term: "중3 · 1학기",
		major: "4. 이차함수",
		middle: "이차함수의 활용",
		minor: "그래프의 평행이동과 대칭이동",
		problem: g3Problem("중3 · 교과서 대단원 학습평가 08", "이차함수 y=2(x-1)²+3의 그래프를 x축에 대칭이동한 그래프의 식을 구하시오.", "y=-2(x-1)²-3", [
			[
				"x축 대칭에서 점 (x,y)는?",
				"(x,-y)",
				"(-x,y)",
				"(-x,-y)",
				"x좌표는 그대로이고 y좌표의 부호가 바뀌어."
			],
			[
				"식에서는 무엇을 바꾸나요?",
				"y값 전체의 부호",
				"x만의 부호",
				"1만의 부호",
				"함수값 전체에 -를 곱해."
			],
			[
				"대칭식의 시작은?",
				"y=-{2(x-1)²+3}",
				"y=2(-x-1)²+3",
				"y=2(x+1)²+3",
				"오른쪽 전체를 괄호로 묶어 음수를 붙여."
			],
			[
				"괄호를 풀면?",
				"y=-2(x-1)²-3",
				"y=-2(x-1)²+3",
				"y=2(x-1)²-3",
				"두 항의 부호가 모두 바뀌어."
			],
			[
				"완성된 식은?",
				"y=-2(x-1)²-3",
				"y=2(x+1)²+3",
				"y=-2(x+1)²-3",
				"x축 대칭식이야."
			]
		], [
			{
				q: "y=x²+2를 x축 대칭이동한 식을 구하시오.",
				a: "y=-x²-2"
			},
			{
				q: "y=-(x-3)²+4를 x축 대칭이동한 식을 구하시오.",
				a: "y=(x-3)²-4"
			},
			{
				q: "y=2x²를 y축 대칭이동한 식을 구하시오.",
				a: "y=2x²"
			}
		])
	},
	{
		term: "중3 · 1학기",
		major: "4. 이차함수",
		middle: "이차함수의 활용",
		minor: "그래프에서 식 구하기",
		problem: g3Problem("중3 · 교과서 대단원 학습평가 09", "꼭짓점이 (2,-3)이고 점 (0,5)를 지나는 이차함수의 식을 구하시오.", "y=2(x-2)²-3", [
			[
				"꼭짓점으로 세운 식은?",
				"y=a(x-2)²-3",
				"y=a(x+2)²+3",
				"y=ax²-3",
				"꼭짓점 (p,q)를 y=a(x-p)²+q에 넣어."
			],
			[
				"점 (0,5)를 대입하면?",
				"5=4a-3",
				"0=25a-3",
				"5=2a-3",
				"x=0이면 (0-2)²=4야."
			],
			[
				"a항만 남기면?",
				"4a=8",
				"4a=2",
				"a=8",
				"양변에 3을 더해."
			],
			[
				"a의 값은?",
				"2",
				"4",
				"1/2",
				"8÷4=2야."
			],
			[
				"완성된 식은?",
				"y=2(x-2)²-3",
				"y=2(x+2)²-3",
				"y=(x-2)²+3",
				"구한 a를 처음 식에 넣어."
			]
		], [
			{
				q: "꼭짓점이 (1,2)이고 점 (3,10)을 지나는 이차함수의 식을 구하시오.",
				a: "y=2(x-1)²+2"
			},
			{
				q: "꼭짓점이 (-1,4)이고 점 (1,-4)를 지나는 이차함수의 식을 구하시오.",
				a: "y=-2(x+1)²+4"
			},
			{
				q: "꼭짓점이 (0,-2)이고 점 (2,6)을 지나는 이차함수의 식을 구하시오.",
				a: "y=2x²-2"
			}
		])
	},
	{
		term: "중3 · 1학기",
		major: "4. 이차함수",
		middle: "이차함수의 활용",
		minor: "이차함수의 활용",
		problem: evalQuestion("중3 · 교과서 대단원 학습평가 10", "포물선 모양의 구조물을 좌표평면에 나타내었더니 꼭짓점이 P(0,5)이고 그래프가 점 R(4,7)을 지났다. 지면에서 수평으로 8 m 떨어진 지점에서 구조물의 높이를 구하시오.", "13", [
			{
				tag: "VERTEX",
				q: "꼭짓점이 P(0,5)이고 축이 y축인 포물선의 식을 어떤 꼴로 놓을까요?",
				options: [
					"y=ax²+5",
					"y=a(x-5)²",
					"y=ax+5"
				],
				answer: 0,
				talk: "꼭짓점이 (0,5)이므로 y=ax²의 그래프를 위로 5만큼 옮긴 y=ax²+5로 놓자."
			},
			{
				tag: "POINT",
				q: "점 R(4,7)을 식에 대입한 것은?",
				options: [
					"7=16a+5",
					"4=49a+5",
					"7=4a+5"
				],
				answer: 0,
				talk: "x=4, y=7을 y=ax²+5에 넣으면 7=a×4²+5=16a+5야."
			},
			{
				tag: "UNDO",
				q: "7=16a+5에서 16a만 남기면?",
				options: [
					"16a=2",
					"16a=12",
					"16a=-2"
				],
				answer: 0,
				talk: "양변에서 5를 빼면 16a=2가 돼."
			},
			{
				tag: "COEFFICIENT",
				q: "16a=2에서 a의 값은?",
				options: [
					"1/8",
					"8",
					"1/16"
				],
				answer: 0,
				talk: "양변을 16으로 나누면 a=2/16=1/8이야."
			},
			{
				tag: "TARGET",
				q: "수평으로 8 m 떨어진 곳의 높이는 식에서 무엇을 넣어 구할까요?",
				options: [
					"x=8",
					"y=8",
					"a=8"
				],
				answer: 0,
				talk: "가로 거리가 x이므로 x=8을 완성한 식 y=(1/8)x²+5에 넣으면 돼."
			},
			{
				tag: "HEIGHT",
				q: "y=(1/8)×8²+5를 계산한 높이는?",
				options: [
					"13 m",
					"8 m",
					"69 m"
				],
				answer: 0,
				talk: "8²=64, 64÷8=8이므로 y=8+5=13이야."
			}
		], [
			{
				q: "꼭짓점이 (0,3)이고 점 (2,7)을 지나는 포물선에서 x=5일 때 y의 값을 구하시오.",
				a: "28"
			},
			{
				q: "꼭짓점이 (0,4)이고 점 (3,13)을 지나는 포물선에서 x=6일 때 y의 값을 구하시오.",
				a: "40"
			},
			{
				q: "꼭짓점이 (0,2)이고 점 (4,6)을 지나는 포물선에서 x=8일 때 y의 값을 구하시오.",
				a: "18"
			}
		])
	},
	{
		term: "중3 · 1학기",
		major: "1. 제곱근과 실수",
		middle: "제곱근과 실수",
		minor: "제곱근의 뜻과 성질",
		problem: evalQuestion("중3 · 교과서 대단원 학습평가 01", "√(24-n)이 정수가 되도록 하는 자연수 n의 값을 모두 구하시오.", "8,15,20,23,24", [
			{
				tag: "MEANING",
				q: "√(24-n)이 정수가 되려면 24-n은 어떤 수여야 하나요?",
				options: [
					"0 또는 완전제곱수",
					"소수",
					"음수"
				],
				answer: 0,
				talk: "제곱근이 정수가 되려면 근호 안은 0, 1, 4, 9처럼 정수의 제곱이어야 해."
			},
			{
				tag: "RANGE",
				q: "n이 자연수이고 24-n≥0이므로 가능한 완전제곱수는?",
				options: [
					"0, 1, 4, 9, 16",
					"1, 4, 9, 16, 25",
					"2, 3, 5, 7"
				],
				answer: 0,
				talk: "24 이하인 완전제곱수와 0만 가능해. 25는 24보다 커서 안 돼."
			},
			{
				tag: "ZERO",
				q: "24-n=0일 때 n은?",
				options: [
					"24",
					"0",
					"1"
				],
				answer: 0,
				talk: "n=24이면 근호 안이 0이고 √0=0이야."
			},
			{
				tag: "SMALL",
				q: "24-n=1, 4일 때 n은 차례로?",
				options: [
					"23, 20",
					"25, 28",
					"1, 4"
				],
				answer: 0,
				talk: "n=24-1=23, n=24-4=20이야."
			},
			{
				tag: "LARGE",
				q: "24-n=9, 16일 때 n은 차례로?",
				options: [
					"15, 8",
					"33, 40",
					"9, 16"
				],
				answer: 0,
				talk: "n=24-9=15, n=24-16=8이야."
			},
			{
				tag: "ORDER",
				q: "자연수 n을 작은 수부터 모두 쓰면?",
				options: [
					"8, 15, 20, 23, 24",
					"24, 23, 20, 15, 8",
					"1, 4, 9, 16, 24"
				],
				answer: 0,
				talk: "답이 여러 개이므로 작은 수부터 8, 15, 20, 23, 24로 정리해."
			}
		], [
			{
				q: "√(20-n)이 정수가 되는 자연수 n을 모두 구하시오.",
				a: "4,11,16,19,20"
			},
			{
				q: "√(30-n)이 정수가 되는 자연수 n을 모두 구하시오.",
				a: "5,14,21,26,29,30"
			},
			{
				q: "√(15-n)이 정수가 되는 자연수 n을 모두 구하시오.",
				a: "6,11,14,15"
			}
		])
	},
	{
		term: "중3 · 1학기",
		major: "1. 제곱근과 실수",
		middle: "제곱근과 실수",
		minor: "제곱근의 뜻과 성질",
		problem: evalQuestion("중3 · 교과서 대단원 학습평가 02", "한 변의 길이가 20 cm인 정사각형 색종이에서 각 변의 중점을 꼭짓점으로 하는 정사각형을 반복하여 만든다. [4단계]에서 생기는 정사각형의 한 변의 길이를 구하시오.", "5", [
			{
				tag: "HALF",
				q: "각 변의 중점을 이은 안쪽 정사각형의 넓이는 바깥 정사각형의 얼마인가요?",
				options: [
					"1/2",
					"1/4",
					"2배"
				],
				answer: 0,
				talk: "네 귀퉁이의 합동인 삼각형 넓이를 빼면 안쪽 정사각형은 바깥 넓이의 절반이야."
			},
			{
				tag: "START",
				q: "한 변이 20 cm인 처음 정사각형의 넓이는?",
				options: [
					"400 cm²",
					"40 cm²",
					"200 cm²"
				],
				answer: 0,
				talk: "정사각형 넓이는 한 변×한 변이므로 20²=400이야."
			},
			{
				tag: "STAGE1",
				q: "[1단계] 정사각형의 넓이는?",
				options: [
					"400×1/2=200",
					"400÷4=100",
					"400×2=800"
				],
				answer: 0,
				talk: "한 단계마다 넓이가 절반이 되므로 200 cm²야."
			},
			{
				tag: "STAGE2",
				q: "[2단계], [3단계]의 넓이는 차례로?",
				options: [
					"100 cm², 50 cm²",
					"200 cm², 100 cm²",
					"50 cm², 25 cm²"
				],
				answer: 0,
				talk: "200의 절반은 100, 다시 절반은 50이야."
			},
			{
				tag: "STAGE4",
				q: "[4단계] 정사각형의 넓이는?",
				options: [
					"25 cm²",
					"50 cm²",
					"12.5 cm²"
				],
				answer: 0,
				talk: "[3단계] 50 cm²의 절반은 25 cm²야."
			},
			{
				tag: "SIDE",
				q: "넓이가 25 cm²인 정사각형의 한 변은?",
				options: [
					"√25=5 cm",
					"25 cm",
					"√5 cm"
				],
				answer: 0,
				talk: "한 변의 길이를 제곱하면 넓이 25가 되므로 양의 제곱근 5 cm야."
			}
		], [
			{
				q: "한 변 16 cm인 정사각형에서 중점 정사각형을 3단계까지 만들었을 때 한 변을 구하시오.",
				a: "4√2"
			},
			{
				q: "한 변 12 cm인 정사각형에서 중점 정사각형을 2단계까지 만들었을 때 한 변을 구하시오.",
				a: "6"
			},
			{
				q: "한 변 18 cm인 정사각형에서 중점 정사각형을 4단계까지 만들었을 때 한 변을 구하시오.",
				a: "9/2"
			}
		])
	}
];
var grade3Semester2Assessment = [
	{
		term: "중3 · 2학기",
		major: "5. 삼각비",
		middle: "삼각비",
		minor: "삼각비의 뜻",
		problem: g3Problem("중3 · 교과서 중단원 학습점검 01", "직각삼각형 ABC에서 ∠C=90°, AB=10 cm, AC=8 cm일 때, sin B의 값을 구하시오.", "4/5", [
			[
				"직각의 맞은편인 빗변은?",
				"AB",
				"AC",
				"BC",
				"∠C가 직각이므로 AB가 빗변이야."
			],
			[
				"∠B의 맞은편 변은?",
				"AC",
				"BC",
				"AB",
				"꼭짓점 B와 마주 보는 변은 AC야."
			],
			[
				"sin B의 뜻은?",
				"∠B의 맞은편 변/빗변",
				"∠B의 이웃변/빗변",
				"빗변/맞은편 변",
				"사인값은 맞은편 직각변을 빗변으로 나눈 값이야."
			],
			[
				"길이를 넣으면?",
				"8/10",
				"10/8",
				"6/10",
				"AC/AB=8/10이야."
			],
			[
				"약분한 값은?",
				"4/5",
				"5/4",
				"3/5",
				"8/10을 2로 약분하면 4/5야."
			]
		], [
			{
				q: "빗변 13, 각 A의 맞은편 변 5인 직각삼각형에서 sin A를 구하시오.",
				a: "5/13"
			},
			{
				q: "빗변 10, 각 A의 이웃변 6인 직각삼각형에서 cos A를 구하시오.",
				a: "3/5"
			},
			{
				q: "각 A의 맞은편 변 8, 이웃변 6일 때 tan A를 구하시오.",
				a: "4/3"
			}
		])
	},
	{
		term: "중3 · 2학기",
		major: "5. 삼각비",
		middle: "삼각비",
		minor: "특수각의 삼각비",
		problem: g3Problem("중3 · 교과서 중단원 학습점검 02", "sin 30°+cos 60°+tan 45°의 값을 구하시오.", "2", [
			[
				"sin 30°의 값은?",
				"1/2",
				"√3/2",
				"1",
				"30-60-90 삼각형에서 1/2이야."
			],
			[
				"cos 60°의 값은?",
				"1/2",
				"√3/2",
				"√3",
				"60°의 코사인도 1/2이야."
			],
			[
				"tan 45°의 값은?",
				"1",
				"√2/2",
				"√3",
				"45-45-90 삼각형의 두 직각변 길이가 같아."
			],
			[
				"값을 넣은 식은?",
				"1/2+1/2+1",
				"√3/2+√3/2+1",
				"1+1+1",
				"세 특수각 값을 정확히 넣어."
			],
			[
				"계산한 값은?",
				"2",
				"1",
				"3",
				"1/2+1/2=1이고 1을 더하면 2야."
			]
		], [
			{
				q: "sin 60°-cos 30°를 계산하시오.",
				a: "0"
			},
			{
				q: "tan 30°×tan 60°를 계산하시오.",
				a: "1"
			},
			{
				q: "2sin 30°+cos 0°를 계산하시오.",
				a: "2"
			}
		])
	},
	{
		term: "중3 · 2학기",
		major: "5. 삼각비",
		middle: "삼각비의 활용",
		minor: "삼각형의 변의 길이",
		problem: g3Problem("중3 · 교과서 중단원 학습점검 03", "직각삼각형 ABC에서 ∠C=90°, ∠A=30°, BC=6 cm일 때, AC의 길이를 구하시오.", "6√3", [
			[
				"∠A에 대해 BC는 어떤 변인가요?",
				"맞은편 변",
				"빗변",
				"이웃한 직각변",
				"BC는 30°의 맞은편이야."
			],
			[
				"AC는 어떤 변인가요?",
				"이웃한 직각변",
				"맞은편 변",
				"빗변",
				"AC는 ∠A에 붙은 직각변이야."
			],
			[
				"두 변을 연결하는 삼각비는?",
				"tan 30°=BC/AC",
				"sin 30°=AC/BC",
				"cos 30°=BC/AC",
				"맞은편/이웃변은 탄젠트야."
			],
			[
				"값을 넣으면?",
				"1/√3=6/AC",
				"1/2=AC/6",
				"√3/2=6/AC",
				"tan30°=1/√3이야."
			],
			[
				"AC의 길이는?",
				"6√3 cm",
				"3 cm",
				"12 cm",
				"AC=6√3 cm야."
			]
		], [
			{
				q: "∠A=45°, 맞은편 변이 7 cm일 때 이웃변을 구하시오.",
				a: "7"
			},
			{
				q: "∠A=30°, 빗변이 12 cm일 때 맞은편 변을 구하시오.",
				a: "6"
			},
			{
				q: "∠A=60°, 이웃변이 5 cm일 때 맞은편 변을 구하시오.",
				a: "5√3"
			}
		])
	},
	{
		term: "중3 · 2학기",
		major: "5. 삼각비",
		middle: "삼각비의 활용",
		minor: "높이와 거리",
		problem: g3Problem("중3 · 교과서 대단원 학습평가 04", "어느 지점에서 건물 꼭대기를 올려다본 각이 45°이고 그 지점에서 건물까지의 수평 거리가 12 m일 때, 건물의 높이를 구하시오.", "12", [
			[
				"건물과 지면이 만드는 각은?",
				"90°",
				"45°",
				"180°",
				"건물은 지면에 수직이야."
			],
			[
				"45°에 대해 알고 있는 변은?",
				"이웃변 12 m",
				"빗변 12 m",
				"맞은편 변 12 m",
				"수평 거리는 관측각의 이웃변이야."
			],
			[
				"높이 h를 연결하는 식은?",
				"tan45°=h/12",
				"sin45°=12/h",
				"cos45°=h/12",
				"높이/수평거리는 탄젠트야."
			],
			[
				"tan45°의 값은?",
				"1",
				"1/2",
				"√3",
				"45°의 탄젠트는 1이야."
			],
			[
				"h의 값은?",
				"12 m",
				"6 m",
				"12√2 m",
				"1=h/12이므로 h=12야."
			]
		], [
			{
				q: "올려다본 각이 45°, 수평 거리가 20 m일 때 높이를 구하시오.",
				a: "20"
			},
			{
				q: "올려다본 각이 30°, 수평 거리가 10√3 m일 때 높이를 구하시오.",
				a: "10"
			},
			{
				q: "올려다본 각이 60°, 수평 거리가 8 m일 때 높이를 구하시오.",
				a: "8√3"
			}
		])
	},
	{
		term: "중3 · 2학기",
		major: "5. 삼각비",
		middle: "삼각비의 활용",
		minor: "삼각형의 넓이",
		problem: g3Problem("중3 · 교과서 대단원 학습평가 05", "△ABC에서 AB=8 cm, AC=10 cm, ∠A=30°일 때, △ABC의 넓이를 구하시오.", "20", [
			[
				"두 변과 끼인각을 이용한 넓이 공식은?",
				"1/2×AB×AC×sin A",
				"AB×AC×cos A",
				"1/2×AB×AC",
				"두 변과 끼인각의 사인값을 사용해."
			],
			[
				"값을 넣은 식은?",
				"1/2×8×10×sin30°",
				"8×10×sin30°",
				"1/2×8×10×cos30°",
				"AB, AC와 끼인각 A를 넣어."
			],
			[
				"sin30°의 값은?",
				"1/2",
				"√3/2",
				"1",
				"특수각의 삼각비야."
			],
			[
				"수식은 어떻게 간단해지나요?",
				"1/2×8×10×1/2",
				"8×10×1/2",
				"1/2×18",
				"두 개의 1/2을 모두 포함해."
			],
			[
				"넓이는?",
				"20 cm²",
				"40 cm²",
				"80 cm²",
				"80÷4=20이야."
			]
		], [
			{
				q: "두 변이 6 cm, 8 cm이고 끼인각이 30°인 삼각형의 넓이를 구하시오.",
				a: "12"
			},
			{
				q: "두 변이 5 cm, 10 cm이고 끼인각이 90°인 삼각형의 넓이를 구하시오.",
				a: "25"
			},
			{
				q: "두 변이 4 cm, 7 cm이고 끼인각이 60°인 삼각형의 넓이를 구하시오.",
				a: "7√3"
			}
		])
	},
	{
		term: "중3 · 2학기",
		major: "6. 원의 성질",
		middle: "원과 직선",
		minor: "현의 수직이등분선",
		problem: g3Problem("중3 · 교과서 중단원 학습점검 06", "반지름이 13 cm인 원에서 중심 O로부터 현 AB까지의 거리가 5 cm일 때, 현 AB의 길이를 구하시오.", "24", [
			[
				"O에서 현 AB에 내린 수선의 발을 M이라 하면?",
				"AM=MB",
				"AM=AB",
				"OM=OA",
				"원의 중심에서 현에 내린 수선은 현을 이등분해."
			],
			[
				"직각삼각형 OMA의 빗변은?",
				"OA=13",
				"OM=5",
				"AM",
				"반지름 OA가 빗변이야."
			],
			[
				"AM=x라 할 때 식은?",
				"x²+5²=13²",
				"x²+13²=5²",
				"x+5=13",
				"피타고라스 정리를 사용해."
			],
			[
				"x²의 값은?",
				"144",
				"194",
				"169",
				"169-25=144야."
			],
			[
				"현 AB의 길이는?",
				"2×12=24 cm",
				"12 cm",
				"13 cm",
				"AM=12이고 M이 중점이므로 AB=24야."
			]
		], [
			{
				q: "반지름 10 cm, 중심에서 현까지 거리 6 cm일 때 현의 길이를 구하시오.",
				a: "16"
			},
			{
				q: "반지름 17 cm, 중심에서 현까지 거리 8 cm일 때 현의 길이를 구하시오.",
				a: "30"
			},
			{
				q: "반지름 5 cm, 중심에서 현까지 거리 3 cm일 때 현의 길이를 구하시오.",
				a: "8"
			}
		])
	},
	{
		term: "중3 · 2학기",
		major: "6. 원의 성질",
		middle: "원과 직선",
		minor: "원의 접선",
		problem: g3Problem("중3 · 교과서 중단원 학습점검 07", "원 O 밖의 점 P에서 원에 그은 접선의 접점을 T라 하자. OP=13 cm, OT=5 cm일 때, PT의 길이를 구하시오.", "12", [
			[
				"접점 T에서 반지름 OT와 접선 PT의 관계는?",
				"서로 수직",
				"서로 평행",
				"길이가 같다",
				"접점에서 그은 반지름은 접선에 수직이야."
			],
			[
				"△OPT는 어떤 삼각형인가요?",
				"직각삼각형",
				"정삼각형",
				"이등변삼각형",
				"∠OTP=90°야."
			],
			[
				"빗변은?",
				"OP=13",
				"OT=5",
				"PT",
				"직각의 맞은편 OP가 빗변이야."
			],
			[
				"PT=x라 할 때 식은?",
				"x²+5²=13²",
				"x²+13²=5²",
				"x+5=13",
				"피타고라스 정리를 써."
			],
			[
				"PT의 길이는?",
				"12 cm",
				"8 cm",
				"18 cm",
				"x²=144이므로 x=12야."
			]
		], [
			{
				q: "OP=10 cm, 반지름 6 cm일 때 접선 길이를 구하시오.",
				a: "8"
			},
			{
				q: "OP=17 cm, 반지름 8 cm일 때 접선 길이를 구하시오.",
				a: "15"
			},
			{
				q: "OP=25 cm, 반지름 7 cm일 때 접선 길이를 구하시오.",
				a: "24"
			}
		])
	},
	{
		term: "중3 · 2학기",
		major: "6. 원의 성질",
		middle: "원주각",
		minor: "원주각과 중심각",
		problem: g3Problem("중3 · 교과서 중단원 학습점검 08", "원 O에서 호 AB에 대한 중심각 ∠AOB=100°일 때, 같은 호 AB에 대한 원주각 ∠ACB의 크기를 구하시오.", "50", [
			[
				"두 각이 바라보는 호는?",
				"같은 호 AB",
				"호 AC",
				"서로 다른 호",
				"중심각과 원주각 모두 호 AB를 바라봐."
			],
			[
				"같은 호에 대한 중심각과 원주각 관계는?",
				"중심각=원주각×2",
				"중심각=원주각",
				"원주각=중심각×2",
				"중심각이 원주각의 두 배야."
			],
			[
				"원주각을 x라 한 식은?",
				"2x=100",
				"x+100=180",
				"x=200",
				"중심각 100°가 2x야."
			],
			[
				"x를 구하는 계산은?",
				"100÷2",
				"100×2",
				"180-100",
				"두 배를 되돌리려면 2로 나눠."
			],
			[
				"원주각은?",
				"50°",
				"100°",
				"80°",
				"100÷2=50이야."
			]
		], [
			{
				q: "중심각이 80°일 때 같은 호의 원주각을 구하시오.",
				a: "40"
			},
			{
				q: "원주각이 35°일 때 같은 호의 중심각을 구하시오.",
				a: "70"
			},
			{
				q: "중심각이 150°일 때 같은 호의 원주각을 구하시오.",
				a: "75"
			}
		])
	},
	{
		term: "중3 · 2학기",
		major: "6. 원의 성질",
		middle: "원주각",
		minor: "원주각의 활용",
		problem: g3Problem("중3 · 교과서 대단원 학습평가 09", "네 점 A, B, C, D가 한 원 위에 있고 ∠ABC=112°일 때, ∠ADC의 크기를 구하시오.", "68", [
			[
				"네 점이 한 원 위에 있는 사각형을 무엇이라 하나요?",
				"원에 내접하는 사각형",
				"평행사변형",
				"마름모",
				"네 꼭짓점이 원 위에 있어."
			],
			[
				"내접사각형의 마주 보는 두 각의 합은?",
				"180°",
				"90°",
				"360°",
				"대각의 합은 180°야."
			],
			[
				"∠ABC와 마주 보는 각은?",
				"∠ADC",
				"∠BCD",
				"∠BAD",
				"꼭짓점 B의 맞은편은 D야."
			],
			[
				"∠ADC=x라 할 때 식은?",
				"112+x=180",
				"112-x=180",
				"2x=112",
				"두 대각의 합을 사용해."
			],
			[
				"∠ADC는?",
				"68°",
				"112°",
				"78°",
				"180-112=68이야."
			]
		], [
			{
				q: "내접사각형의 한 각이 95°일 때 맞은편 각을 구하시오.",
				a: "85"
			},
			{
				q: "내접사각형의 한 각이 73°일 때 맞은편 각을 구하시오.",
				a: "107"
			},
			{
				q: "내접사각형의 두 대각이 2x°, 4x°일 때 x를 구하시오.",
				a: "30"
			}
		])
	},
	{
		term: "중3 · 2학기",
		major: "7. 통계",
		middle: "대푯값과 산포도",
		minor: "평균·중앙값·최빈값",
		problem: g3Problem("중3 · 교과서 중단원 학습점검 10", "자료 2, 3, 3, 5, 7의 평균, 중앙값, 최빈값을 차례로 구하시오.", "4,3,3", [
			[
				"자료의 합은?",
				"20",
				"18",
				"15",
				"2+3+3+5+7=20이야."
			],
			[
				"자료의 개수는?",
				"5",
				"4",
				"20",
				"다섯 개의 값이 있어."
			],
			[
				"평균은?",
				"20÷5=4",
				"20÷4=5",
				"5",
				"합을 자료 수로 나눠."
			],
			[
				"가운데 위치한 중앙값은?",
				"3",
				"5",
				"4",
				"이미 크기순이고 셋째 값이 3이야."
			],
			[
				"가장 자주 나온 최빈값은?",
				"3",
				"2",
				"7",
				"3이 두 번으로 가장 많이 나와."
			]
		], [
			{
				q: "1,2,2,4,6의 평균·중앙값·최빈값을 구하시오.",
				a: "3,2,2"
			},
			{
				q: "3,4,4,4,5의 평균·중앙값·최빈값을 구하시오.",
				a: "4,4,4"
			},
			{
				q: "2,5,5,6,7의 평균·중앙값·최빈값을 구하시오.",
				a: "5,5,5"
			}
		])
	},
	{
		term: "중3 · 2학기",
		major: "7. 통계",
		middle: "대푯값과 산포도",
		minor: "편차·분산·표준편차",
		problem: g3Problem("중3 · 교과서 중단원 학습점검 11", "자료 2, 4, 6의 분산과 표준편차를 차례로 구하시오.", "8/3,2√6/3", [
			[
				"자료의 평균은?",
				"4",
				"3",
				"12",
				"(2+4+6)÷3=4야."
			],
			[
				"각 편차는?",
				"-2,0,2",
				"2,4,6",
				"-4,0,4",
				"각 자료에서 평균 4를 빼."
			],
			[
				"편차의 제곱은?",
				"4,0,4",
				"-4,0,4",
				"2,0,2",
				"분산에서는 편차를 제곱해."
			],
			[
				"분산은?",
				"(4+0+4)/3=8/3",
				"8",
				"4/3",
				"편차 제곱의 평균이 분산이야."
			],
			[
				"표준편차는?",
				"√(8/3)=2√6/3",
				"8/3",
				"2√3",
				"분산의 양의 제곱근을 구하고 유리화해."
			]
		], [
			{
				q: "자료 1,3,5의 분산을 구하시오.",
				a: "8/3"
			},
			{
				q: "자료 2,2,4,4의 분산을 구하시오.",
				a: "1"
			},
			{
				q: "분산이 9인 자료의 표준편차를 구하시오.",
				a: "3"
			}
		])
	},
	{
		term: "중3 · 2학기",
		major: "7. 통계",
		middle: "상관관계",
		minor: "산점도",
		problem: g3Problem("중3 · 교과서 중단원 학습점검 12", "산점도의 점들이 대체로 왼쪽 아래에서 오른쪽 위로 모여 있을 때 두 변량의 관계를 쓰시오.", "양의 상관관계", [
			[
				"가로축 값이 커질 때 점들의 세로축 값은?",
				"대체로 커진다",
				"대체로 작아진다",
				"항상 같다",
				"오른쪽 위로 갈수록 두 값이 함께 커져."
			],
			[
				"점들의 전체 방향은?",
				"오른쪽 위",
				"오른쪽 아래",
				"수직선",
				"왼쪽 아래에서 오른쪽 위 방향이야."
			],
			[
				"두 값이 함께 커지는 관계는?",
				"양의 상관관계",
				"음의 상관관계",
				"상관관계 없음",
				"한 변량이 증가할 때 다른 변량도 증가해."
			],
			[
				"모든 점이 한 직선 위여야 하나요?",
				"아니다",
				"그렇다",
				"점이 하나여야 한다",
				"대체적인 경향을 판단해."
			],
			[
				"관계의 이름은?",
				"양의 상관관계",
				"음의 상관관계",
				"인과관계",
				"이 산점도는 양의 상관관계를 보여."
			]
		], [
			{
				q: "점들이 왼쪽 위에서 오른쪽 아래로 모이면 어떤 상관관계인지 쓰시오.",
				a: "음의 상관관계"
			},
			{
				q: "점들이 일정한 방향 없이 흩어지면 관계를 쓰시오.",
				a: "상관관계 없음"
			},
			{
				q: "공부 시간과 점수가 함께 증가하는 경향의 관계를 쓰시오.",
				a: "양의 상관관계"
			}
		])
	},
	{
		term: "중3 · 2학기",
		major: "7. 통계",
		middle: "상관관계",
		minor: "상관관계",
		problem: g3Problem("중3 · 교과서 대단원 학습평가 13", "자동차의 주행 속도가 증가할수록 같은 거리를 가는 데 걸리는 시간이 감소하는 경향이 있다. 두 변량의 상관관계를 쓰시오.", "음의 상관관계", [
			[
				"첫째 변량은?",
				"주행 속도",
				"자동차 색",
				"도로 이름",
				"변화시키는 값은 속도야."
			],
			[
				"둘째 변량은?",
				"걸리는 시간",
				"자동차 수",
				"운전자 이름",
				"관찰하는 다른 값은 시간이야."
			],
			[
				"속도가 증가하면 시간은?",
				"감소한다",
				"증가한다",
				"변하지 않는다",
				"같은 거리에서는 더 빨리 갈수록 시간이 줄어."
			],
			[
				"한 변량이 증가하고 다른 변량이 감소하는 관계는?",
				"음의 상관관계",
				"양의 상관관계",
				"상관관계 없음",
				"두 변량이 반대 방향으로 변해."
			],
			[
				"정답은?",
				"음의 상관관계",
				"양의 상관관계",
				"함수 관계 없음",
				"감소 경향이므로 음의 상관관계야."
			]
		], [
			{
				q: "기온이 높을수록 아이스크림 판매량이 증가하는 관계를 쓰시오.",
				a: "양의 상관관계"
			},
			{
				q: "결석 일수가 많을수록 성적이 낮아지는 경향의 관계를 쓰시오.",
				a: "음의 상관관계"
			},
			{
				q: "신발 크기와 국어 점수 사이에 뚜렷한 경향이 없을 때 관계를 쓰시오.",
				a: "상관관계 없음"
			}
		])
	}
];
var grade1Semester1Expansion = [
	{
		term: "중1 · 1학기",
		major: "1. 소인수분해",
		middle: "소수와 합성수",
		minor: "소수와 합성수",
		problem: g3Problem("중1 · 교과서 중단원 학습점검 02", "20보다 크고 40보다 작은 소수를 모두 구하시오.", "23,29,31,37", [
			[
				"소수의 약수 개수는?",
				"2개",
				"1개",
				"3개 이상",
				"1과 자기 자신만 약수로 가져."
			],
			[
				"범위의 홀수를 먼저 쓰면?",
				"21,23,25,27,29,31,33,35,37,39",
				"20,22,24,26",
				"23,29만",
				"2를 제외한 소수는 홀수야."
			],
			[
				"3의 배수를 지우면 남는 후보는?",
				"23,25,29,31,35,37",
				"21,27,33,39",
				"23,29,31,37",
				"3의 배수는 합성수야."
			],
			[
				"5의 배수를 더 지우면?",
				"23,29,31,37",
				"25,35",
				"23,25,29",
				"25와 35를 지워."
			],
			[
				"모든 소수는?",
				"23,29,31,37",
				"21,29,31,39",
				"23,25,35,37",
				"각 수는 1과 자기 자신 외 약수가 없어."
			]
		], [
			{
				q: "10보다 크고 25보다 작은 소수를 모두 구하시오.",
				a: "11,13,17,19,23"
			},
			{
				q: "30보다 크고 50보다 작은 소수를 모두 구하시오.",
				a: "31,37,41,43,47"
			},
			{
				q: "50보다 크고 65보다 작은 소수를 모두 구하시오.",
				a: "53,59,61"
			}
		])
	},
	{
		term: "중1 · 1학기",
		major: "1. 소인수분해",
		middle: "소수와 합성수",
		minor: "거듭제곱",
		problem: g3Problem("중1 · 교과서 예제 03", "3×3×3×5×5를 거듭제곱을 사용하여 나타내시오.", "3³×5²", [
			[
				"반복된 3의 개수는?",
				"3개",
				"2개",
				"5개",
				"3이 세 번 곱해져 있어."
			],
			[
				"3의 거듭제곱은?",
				"3³",
				"3×3",
				"3⁵",
				"밑 3, 지수 3이야."
			],
			[
				"반복된 5의 개수는?",
				"2개",
				"3개",
				"5개",
				"5는 두 번 곱해져 있어."
			],
			[
				"5의 거듭제곱은?",
				"5²",
				"2⁵",
				"5³",
				"밑 5, 지수 2야."
			],
			[
				"전체를 나타내면?",
				"3³×5²",
				"15⁵",
				"3²×5³",
				"서로 다른 밑의 거듭제곱을 곱해."
			]
		], [
			{
				q: "2×2×2×7×7을 거듭제곱으로 나타내시오.",
				a: "2³×7²"
			},
			{
				q: "5×5×3×3×3×3을 나타내시오.",
				a: "3⁴×5²"
			},
			{
				q: "a×a×a×b×b를 나타내시오.",
				a: "a³b²"
			}
		])
	},
	{
		term: "중1 · 1학기",
		major: "1. 소인수분해",
		middle: "소인수분해",
		minor: "최소공배수",
		problem: g3Problem("중1 · 교과서 대단원 학습평가 08", "18과 30의 최소공배수를 소인수분해를 이용하여 구하시오.", "90", [
			[
				"18의 소인수분해는?",
				"2×3²",
				"2²×3",
				"3×6",
				"18=2×3×3이야."
			],
			[
				"30의 소인수분해는?",
				"2×3×5",
				"2×15",
				"3×10",
				"소수의 곱으로 끝까지 나타내."
			],
			[
				"최소공배수에서 3의 지수는?",
				"2",
				"1",
				"3",
				"두 수에 나온 지수 중 큰 2를 선택해."
			],
			[
				"모든 소인수를 모으면?",
				"2×3²×5",
				"2²×3²×5",
				"2×3×5",
				"각 소인수의 큰 지수를 사용해."
			],
			[
				"계산한 값은?",
				"90",
				"60",
				"180",
				"2×9×5=90이야."
			]
		], [
			{
				q: "12와 20의 최소공배수를 구하시오.",
				a: "60"
			},
			{
				q: "24와 36의 최소공배수를 구하시오.",
				a: "72"
			},
			{
				q: "15와 28의 최소공배수를 구하시오.",
				a: "420"
			}
		])
	},
	{
		term: "중1 · 1학기",
		major: "2. 정수와 유리수",
		middle: "정수와 유리수",
		minor: "양수와 음수",
		problem: g3Problem("중1 · 교과서 중단원 학습점검 01", "해수면보다 7 m 높은 곳을 +7 m로 나타낼 때, 해수면보다 12 m 낮은 곳을 수로 나타내시오.", "-12", [
			[
				"기준이 되는 높이는?",
				"해수면 0 m",
				"+7 m",
				"-12 m",
				"해수면을 0으로 정해."
			],
			[
				"기준보다 높은 방향의 부호는?",
				"+",
				"-",
				"부호 없음",
				"문제에서 높은 곳을 +로 나타냈어."
			],
			[
				"기준보다 낮은 방향의 부호는?",
				"-",
				"+",
				"×",
				"반대 방향은 음의 부호야."
			],
			[
				"낮은 정도는?",
				"12 m",
				"7 m",
				"19 m",
				"해수면에서 12 m 떨어져 있어."
			],
			[
				"수로 나타내면?",
				"-12",
				"+12",
				"-7",
				"낮은 방향이므로 -12야."
			]
		], [
			{
				q: "기준보다 5℃ 낮은 온도를 나타내시오.",
				a: "-5"
			},
			{
				q: "수입 3000원을 +3000원이라 할 때 지출 2000원을 나타내시오.",
				a: "-2000"
			},
			{
				q: "동쪽 4 km를 +4라 할 때 서쪽 9 km를 나타내시오.",
				a: "-9"
			}
		])
	},
	{
		term: "중1 · 1학기",
		major: "2. 정수와 유리수",
		middle: "정수와 유리수",
		minor: "양수와 음수",
		problem: g3Problem("중1 · 교과서 대단원 학습평가 01", "다음 중 서로 반대되는 방향이나 상태를 나타내는 두 수를 고르시오. ㄱ. +5 m, -5 m ㄴ. +3℃, +7℃ ㄷ. -2000원, -5000원", "ㄱ", [
			[
				"반대되는 두 수는 무엇이 달라야 하나요?",
				"부호",
				"절댓값",
				"단위",
				"기준의 양쪽을 나타내므로 부호가 반대여야 해."
			],
			[
				"크기는 어떻게 되어야 하나요?",
				"절댓값이 같다",
				"항상 다르다",
				"합이 10이다",
				"같은 거리나 양을 반대 방향으로 나타내."
			],
			[
				"ㄱ의 두 수는?",
				"부호가 반대이고 절댓값이 같다",
				"둘 다 양수",
				"둘 다 음수",
				"+5와 -5는 반대되는 수야."
			],
			[
				"ㄴ과 ㄷ이 아닌 이유는?",
				"부호가 서로 같다",
				"단위가 없다",
				"수가 작다",
				"각 쌍은 같은 방향의 상태야."
			],
			[
				"정답은?",
				"ㄱ",
				"ㄴ",
				"ㄷ",
				"ㄱ만 기준의 반대쪽을 나타내."
			]
		], [
			{
				q: "+8과 반대되는 수를 쓰시오.",
				a: "-8"
			},
			{
				q: "-3/4와 반대되는 수를 쓰시오.",
				a: "3/4"
			},
			{
				q: "0의 반대되는 수를 쓰시오.",
				a: "0"
			}
		])
	},
	{
		term: "중1 · 1학기",
		major: "2. 정수와 유리수",
		middle: "정수와 유리수의 계산",
		minor: "덧셈과 뺄셈",
		problem: g3Problem("중1 · 교과서 중단원 학습점검 04", "(-7)+12-(-5)를 계산하시오.", "10", [
			[
				"-(-5)는 어떤 계산으로 바뀌나요?",
				"+5",
				"-5",
				"×5",
				"음수를 빼는 것은 그 수의 반대되는 수를 더하는 거야."
			],
			[
				"식은 어떻게 바뀌나요?",
				"-7+12+5",
				"-7+12-5",
				"7+12+5",
				"부호를 정확히 바꿔."
			],
			[
				"-7+12는?",
				"5",
				"-19",
				"-5",
				"부호가 다르므로 절댓값을 빼고 큰 쪽 부호 +를 써."
			],
			[
				"남은 계산은?",
				"5+5",
				"5-5",
				"-5+5",
				"앞 계산 결과에 5를 더해."
			],
			[
				"최종값은?",
				"10",
				"0",
				"-10",
				"5+5=10이야."
			]
		], [
			{
				q: "(-9)+4-(-3)을 계산하시오.",
				a: "-2"
			},
			{
				q: "6-(-8)+(-5)를 계산하시오.",
				a: "9"
			},
			{
				q: "(-3/4)+1/2를 계산하시오.",
				a: "-1/4"
			}
		])
	},
	{
		term: "중1 · 1학기",
		major: "2. 정수와 유리수",
		middle: "정수와 유리수의 계산",
		minor: "곱셈과 나눗셈",
		problem: g3Problem("중1 · 교과서 중단원 학습점검 05", "(-6)×8÷(-4)를 계산하시오.", "12", [
			[
				"곱셈과 나눗셈만 있을 때 계산 순서는?",
				"왼쪽부터",
				"나눗셈부터",
				"큰 수부터",
				"같은 우선순위이므로 왼쪽부터 계산해."
			],
			[
				"(-6)×8의 부호는?",
				"음수",
				"양수",
				"0",
				"서로 다른 부호의 곱은 음수야."
			],
			[
				"(-6)×8은?",
				"-48",
				"48",
				"-14",
				"6×8=48에 음의 부호를 붙여."
			],
			[
				"(-48)÷(-4)의 부호는?",
				"양수",
				"음수",
				"0",
				"같은 부호끼리 나누면 양수야."
			],
			[
				"최종값은?",
				"12",
				"-12",
				"192",
				"48÷4=12야."
			]
		], [
			{
				q: "(-7)×(-5)÷7을 계산하시오.",
				a: "5"
			},
			{
				q: "24÷(-6)×3을 계산하시오.",
				a: "-12"
			},
			{
				q: "(-3/5)÷(9/10)을 계산하시오.",
				a: "-2/3"
			}
		])
	},
	{
		term: "중1 · 1학기",
		major: "2. 정수와 유리수",
		middle: "정수와 유리수의 계산",
		minor: "곱셈과 나눗셈",
		problem: g3Problem("중1 · 교과서 대단원 학습평가 05", "(-2)³÷4×(-6)을 계산하시오.", "12", [
			[
				"거듭제곱을 먼저 계산하면?",
				"(-2)³=-8",
				"(-2)³=8",
				"(-2)³=-6",
				"음수 세 개의 곱은 음수야."
			],
			[
				"바뀐 식은?",
				"-8÷4×(-6)",
				"8÷4×(-6)",
				"-8÷24",
				"거듭제곱 결과를 넣어."
			],
			[
				"-8÷4는?",
				"-2",
				"2",
				"-4",
				"다른 부호의 나눗셈은 음수야."
			],
			[
				"-2×(-6)의 부호는?",
				"양수",
				"음수",
				"0",
				"음수끼리 곱하면 양수야."
			],
			[
				"최종값은?",
				"12",
				"-12",
				"3",
				"2×6=12야."
			]
		], [
			{
				q: "(-3)²÷9×(-4)를 계산하시오.",
				a: "-4"
			},
			{
				q: "(-2)⁴÷8을 계산하시오.",
				a: "2"
			},
			{
				q: "(-5)²÷(-5)을 계산하시오.",
				a: "-5"
			}
		])
	},
	{
		term: "중1 · 1학기",
		major: "1. 소인수분해",
		middle: "소수와 합성수",
		minor: "거듭제곱",
		problem: g3Problem("중1 · 교과서 중단원 학습점검 03", "2⁴×2³을 하나의 거듭제곱으로 나타내시오.", "2⁷", [
			[
				"두 거듭제곱의 밑은?",
				"모두 2",
				"4와 3",
				"서로 다름",
				"밑이 같은 거듭제곱의 곱이야."
			],
			[
				"2⁴은 2가 몇 개인 곱인가요?",
				"4개",
				"3개",
				"8개",
				"지수 4만큼 2가 곱해져."
			],
			[
				"2³의 2는 몇 개인가요?",
				"3개",
				"2개",
				"6개",
				"지수 3이 반복 횟수야."
			],
			[
				"전체 2의 개수는?",
				"4+3=7개",
				"4×3=12개",
				"4-3=1개",
				"곱하면 반복 횟수를 더해."
			],
			[
				"하나의 거듭제곱은?",
				"2⁷",
				"2¹²",
				"4⁷",
				"밑 2, 지수 7이야."
			]
		], [
			{
				q: "3²×3⁴을 나타내시오.",
				a: "3⁶"
			},
			{
				q: "5³×5²를 나타내시오.",
				a: "5⁵"
			},
			{
				q: "a⁴×a를 나타내시오.",
				a: "a⁵"
			}
		])
	},
	{
		term: "중1 · 1학기",
		major: "3. 문자와 식",
		middle: "문자의 사용과 식",
		minor: "문자의 사용",
		problem: g3Problem("중1 · 교과서 중단원 학습점검 01", "한 개에 800원인 공책 x권과 한 자루에 500원인 연필 y자루의 전체 가격을 식으로 나타내시오.", "800x+500y", [
			[
				"공책 x권의 가격은?",
				"800x원",
				"800+x원",
				"x/800원",
				"한 개 가격×개수야."
			],
			[
				"연필 y자루의 가격은?",
				"500y원",
				"500+y원",
				"y/500원",
				"500×y를 500y로 써."
			],
			[
				"전체 가격은 어떤 계산인가요?",
				"두 가격의 합",
				"두 가격의 차",
				"두 가격의 곱",
				"공책값과 연필값을 더해."
			],
			[
				"식은?",
				"800x+500y",
				"1300xy",
				"800y+500x",
				"각 물건의 문자와 가격을 맞춰."
			],
			[
				"단위를 붙이면?",
				"(800x+500y)원",
				"800x+500y권",
				"1300원",
				"식 전체가 원 단위야."
			]
		], [
			{
				q: "개당 1200원인 빵 x개와 900원인 우유 y개의 가격을 나타내시오.",
				a: "1200x+900y"
			},
			{
				q: "시속 4 km로 x시간 걸은 거리를 나타내시오.",
				a: "4x"
			},
			{
				q: "a원에서 3000원을 사용한 나머지를 나타내시오.",
				a: "a-3000"
			}
		])
	},
	{
		term: "중1 · 1학기",
		major: "3. 문자와 식",
		middle: "문자의 사용과 식",
		minor: "곱셈·나눗셈 기호 생략",
		problem: g3Problem("중1 · 교과서 예제 02", "a×(-3)×b÷5를 곱셈 기호와 나눗셈 기호를 생략하여 나타내시오.", "-3ab/5", [
			[
				"수와 문자 곱의 순서는?",
				"수를 앞에 쓴다",
				"문자를 앞에 쓴다",
				"순서가 없다",
				"계수 -3을 맨 앞에 써."
			],
			[
				"문자끼리의 곱은?",
				"ab",
				"a×b",
				"a+b",
				"곱셈 기호를 생략하고 붙여 써."
			],
			[
				"5로 나누기는?",
				"분모에 5를 쓴다",
				"5를 곱한다",
				"5를 더한다",
				"나눗셈은 분수로 나타내."
			],
			[
				"부호는?",
				"음수",
				"양수",
				"부호 없음",
				"-3이 있으므로 전체가 음수야."
			],
			[
				"완성한 식은?",
				"-3ab/5",
				"3ab/5",
				"-15ab",
				"계수와 문자를 한 분수로 써."
			]
		], [
			{
				q: "x×4×y를 간단히 나타내시오.",
				a: "4xy"
			},
			{
				q: "a÷3×b를 나타내시오.",
				a: "ab/3"
			},
			{
				q: "(-2)×x×x×y를 나타내시오.",
				a: "-2x²y"
			}
		])
	},
	{
		term: "중1 · 1학기",
		major: "3. 문자와 식",
		middle: "문자의 사용과 식",
		minor: "곱셈·나눗셈 기호 생략",
		problem: g3Problem("중1 · 교과서 중단원 학습점검 02", "(x+y)÷(-4)를 곱셈·나눗셈 기호를 사용하지 않고 나타내시오.", "-(x+y)/4", [
			[
				"나누는 수의 부호는?",
				"음수",
				"양수",
				"0",
				"-4로 나누고 있어."
			],
			[
				"음수로 나누는 부호는 어디에 둘 수 있나요?",
				"분수 앞",
				"괄호 안 모든 항 뒤",
				"생략",
				"전체 분수 앞에 -를 둬."
			],
			[
				"분자는?",
				"x+y",
				"x",
				"y",
				"괄호 전체가 나누어지는 식이야."
			],
			[
				"분모는?",
				"4",
				"-4만 가능",
				"x+y",
				"음의 부호를 앞에 뺐으므로 분모는 4야."
			],
			[
				"완성한 식은?",
				"-(x+y)/4",
				"-x+y/4",
				"(x+y)/4",
				"괄호 전체가 분자임을 유지해."
			]
		], [
			{
				q: "(a-b)÷3을 나타내시오.",
				a: "(a-b)/3"
			},
			{
				q: "(2x+1)÷(-5)를 나타내시오.",
				a: "-(2x+1)/5"
			},
			{
				q: "x÷(-2)×y를 나타내시오.",
				a: "-xy/2"
			}
		])
	},
	{
		term: "중1 · 1학기",
		major: "3. 문자와 식",
		middle: "문자의 사용과 식",
		minor: "식의 값",
		problem: g3Problem("중1 · 교과서 중단원 학습점검 03", "a=-2, b=5일 때, 3a²-2b의 값을 구하시오.", "2", [
			[
				"a²에 대입할 때 필요한 괄호는?",
				"(-2)²",
				"-2²",
				"(2)²만",
				"음수를 제곱할 때 괄호로 묶어."
			],
			[
				"a²의 값은?",
				"4",
				"-4",
				"2",
				"(-2)×(-2)=4야."
			],
			[
				"3a²의 값은?",
				"12",
				"6",
				"-12",
				"3×4=12야."
			],
			[
				"2b의 값은?",
				"10",
				"7",
				"3",
				"2×5=10이야."
			],
			[
				"식의 값은?",
				"12-10=2",
				"12+10=22",
				"-12-10=-22",
				"원래 부호대로 빼."
			]
		], [
			{
				q: "x=-3일 때 2x²+x를 구하시오.",
				a: "15"
			},
			{
				q: "a=4,b=-1일 때 a-3b를 구하시오.",
				a: "7"
			},
			{
				q: "x=2,y=5일 때 xy-x²을 구하시오.",
				a: "6"
			}
		])
	},
	{
		term: "중1 · 1학기",
		major: "3. 문자와 식",
		middle: "일차식의 계산",
		minor: "일차식과 수의 곱셈·나눗셈",
		problem: g3Problem("중1 · 교과서 중단원 학습점검 04", "-3(2x-5)를 간단히 하시오.", "-6x+15", [
			[
				"분배법칙에서 -3을 어디에 곱하나요?",
				"괄호 안 두 항 모두",
				"2x에만",
				"-5에만",
				"괄호 안의 각 항에 곱해."
			],
			[
				"-3×2x는?",
				"-6x",
				"6x",
				"-x",
				"계수끼리 -3×2=-6이야."
			],
			[
				"-3×(-5)는?",
				"15",
				"-15",
				"8",
				"음수끼리 곱하면 양수야."
			],
			[
				"두 결과를 연결하면?",
				"-6x+15",
				"-6x-15",
				"6x+15",
				"각 항의 부호를 유지해."
			],
			[
				"간단히 한 식은?",
				"-6x+15",
				"9x",
				"-21x",
				"동류항이 아니므로 더 합치지 않아."
			]
		], [
			{
				q: "4(3x-2)를 간단히 하시오.",
				a: "12x-8"
			},
			{
				q: "-2(-x+6)를 간단히 하시오.",
				a: "2x-12"
			},
			{
				q: "(8x-12)÷4를 간단히 하시오.",
				a: "2x-3"
			}
		])
	},
	{
		term: "중1 · 1학기",
		major: "3. 문자와 식",
		middle: "일차식의 계산",
		minor: "일차식과 수의 곱셈·나눗셈",
		problem: g3Problem("중1 · 교과서 대단원 학습평가 04", "(6x-9)÷(-3)를 간단히 하시오.", "-2x+3", [
			[
				"나눗셈을 각 항에 적용하면?",
				"6x÷(-3)-9÷(-3)",
				"(6x÷-3)-9",
				"6x-9÷-3",
				"괄호의 모든 항을 -3으로 나눠."
			],
			[
				"6x÷(-3)은?",
				"-2x",
				"2x",
				"-3x",
				"6÷(-3)=-2야."
			],
			[
				"(-9)÷(-3)은?",
				"3",
				"-3",
				"6",
				"같은 부호의 나눗셈은 양수야."
			],
			[
				"식의 두 번째 항 부호는?",
				"+3",
				"-3",
				"+9",
				"원래 -9를 -3으로 나누어 +3이 돼."
			],
			[
				"완성한 식은?",
				"-2x+3",
				"2x-3",
				"-2x-3",
				"두 결과를 연결해."
			]
		], [
			{
				q: "(10x+15)÷5를 간단히 하시오.",
				a: "2x+3"
			},
			{
				q: "(-8x+12)÷4를 간단히 하시오.",
				a: "-2x+3"
			},
			{
				q: "(9x-6)÷(-3)를 간단히 하시오.",
				a: "-3x+2"
			}
		])
	},
	{
		term: "중1 · 1학기",
		major: "3. 문자와 식",
		middle: "일차식의 계산",
		minor: "일차식의 덧셈·뺄셈",
		problem: g3Problem("중1 · 교과서 중단원 학습점검 05", "(4x-3)-(2x+5)를 간단히 하시오.", "2x-8", [
			[
				"두 번째 괄호 앞의 부호는?",
				"-",
				"+",
				"×",
				"괄호 전체를 빼고 있어."
			],
			[
				"괄호를 풀면?",
				"4x-3-2x-5",
				"4x-3-2x+5",
				"4x-3+2x+5",
				"빼는 괄호 안 모든 항의 부호를 바꿔."
			],
			[
				"x항끼리 계산하면?",
				"4x-2x=2x",
				"4x+2x=6x",
				"2x-4x=2x",
				"동류항의 계수를 빼."
			],
			[
				"상수항끼리 계산하면?",
				"-3-5=-8",
				"-3+5=2",
				"3+5=8",
				"두 상수 모두 음수야."
			],
			[
				"간단히 한 식은?",
				"2x-8",
				"6x+2",
				"2x+8",
				"x항과 상수항을 써."
			]
		], [
			{
				q: "(5x+2)-(3x-4)를 간단히 하시오.",
				a: "2x+6"
			},
			{
				q: "2x-3+(4x+7)를 간단히 하시오.",
				a: "6x+4"
			},
			{
				q: "3(2x-1)-(x+5)를 간단히 하시오.",
				a: "5x-8"
			}
		])
	},
	{
		term: "중1 · 1학기",
		major: "3. 문자와 식",
		middle: "일차방정식",
		minor: "방정식과 그 해",
		problem: g3Problem("중1 · 교과서 예제 06", "x=3이 방정식 2x+1=7의 해인지 확인하시오.", "해이다", [
			[
				"해를 확인하는 방법은?",
				"x에 3을 대입",
				"양변에 3을 더함",
				"x를 0으로 바꿈",
				"주어진 수를 방정식에 넣어 등식이 되는지 봐."
			],
			[
				"왼쪽에 대입하면?",
				"2×3+1",
				"2x+3",
				"3+1",
				"x 자리에 3을 넣어."
			],
			[
				"왼쪽 값은?",
				"7",
				"6",
				"8",
				"6+1=7이야."
			],
			[
				"오른쪽 값은?",
				"7",
				"3",
				"1",
				"오른쪽은 원래 7이야."
			],
			[
				"판단은?",
				"해이다",
				"해가 아니다",
				"확인 불가",
				"양변의 값이 같으므로 해야."
			]
		], [
			{
				q: "x=2가 3x-1=5의 해인지 답하시오.",
				a: "해이다"
			},
			{
				q: "x=4가 2x+3=10의 해인지 답하시오.",
				a: "해가 아니다"
			},
			{
				q: "x=-1이 5x+2=-3의 해인지 답하시오.",
				a: "해이다"
			}
		])
	},
	{
		term: "중1 · 1학기",
		major: "3. 문자와 식",
		middle: "일차방정식",
		minor: "방정식과 그 해",
		problem: g3Problem("중1 · 교과서 중단원 학습점검 06", "방정식 3x-4=11의 해를 구하시오.", "5", [
			[
				"해는 무엇을 만족시키는 수인가요?",
				"등식을 참이 되게 하는 수",
				"항상 0인 수",
				"가장 큰 수",
				"방정식에 넣었을 때 양변이 같아져."
			],
			[
				"3x만 남기려면?",
				"양변에 4를 더한다",
				"양변에서 4를 뺀다",
				"양변에 3을 곱한다",
				"-4를 없애."
			],
			[
				"바뀐 식은?",
				"3x=15",
				"3x=7",
				"x=15",
				"11+4=15야."
			],
			[
				"x를 구하려면?",
				"양변을 3으로 나눈다",
				"양변에 3을 더한다",
				"양변을 4로 나눈다",
				"x의 계수 3을 없애."
			],
			[
				"해는?",
				"5",
				"15",
				"3",
				"15÷3=5야."
			]
		], [
			{
				q: "2x+5=13을 풀어라.",
				a: "4"
			},
			{
				q: "5x-7=18을 풀어라.",
				a: "5"
			},
			{
				q: "-3x+2=14를 풀어라.",
				a: "-4"
			}
		])
	},
	{
		term: "중1 · 1학기",
		major: "3. 문자와 식",
		middle: "일차방정식",
		minor: "등식의 성질",
		problem: g3Problem("중1 · 교과서 중단원 학습점검 07", "등식 2x-5=9의 양변에 5를 더한 뒤 2로 나누어 x를 구하시오.", "7", [
			[
				"양변에 같은 수를 더해도?",
				"등식이 성립",
				"부등호가 생김",
				"값이 두 배",
				"등식의 성질이야."
			],
			[
				"양변에 5를 더하면?",
				"2x=14",
				"2x=4",
				"x=14",
				"-5가 없어져."
			],
			[
				"양변을 같은 0이 아닌 수로 나누어도?",
				"등식이 성립",
				"항상 거짓",
				"x가 0",
				"나눗셈도 등식의 성질이야."
			],
			[
				"양변을 2로 나누면?",
				"x=7",
				"x=12",
				"2x=7",
				"14÷2=7이야."
			],
			[
				"해는?",
				"7",
				"14",
				"2",
				"x=7이야."
			]
		], [
			{
				q: "3x+4=19를 등식의 성질로 풀어라.",
				a: "5"
			},
			{
				q: "4x-8=20을 풀어라.",
				a: "7"
			},
			{
				q: "-2x+3=11을 풀어라.",
				a: "-4"
			}
		])
	},
	{
		term: "중1 · 1학기",
		major: "4. 좌표평면과 그래프",
		middle: "좌표평면과 그래프",
		minor: "순서쌍과 좌표",
		problem: g3Problem("중1 · 교과서 중단원 학습점검 01", "점 P가 x축의 왼쪽으로 4, y축의 위쪽으로 3만큼 떨어져 있을 때 P의 좌표를 구하시오.", "-4,3", [
			[
				"x좌표는 어느 방향을 나타내나요?",
				"좌우",
				"위아래",
				"거리만",
				"가로 방향 위치가 x좌표야."
			],
			[
				"왼쪽의 x좌표 부호는?",
				"음수",
				"양수",
				"0",
				"원점의 왼쪽은 음의 방향이야."
			],
			[
				"y좌표는 어느 방향인가요?",
				"위아래",
				"좌우",
				"대각선",
				"세로 방향 위치야."
			],
			[
				"위쪽의 y좌표 부호는?",
				"양수",
				"음수",
				"0",
				"원점의 위쪽은 양의 방향이야."
			],
			[
				"순서쌍은?",
				"(-4,3)",
				"(3,-4)",
				"(4,3)",
				"좌표는 (x좌표,y좌표) 순서야."
			]
		], [
			{
				q: "오른쪽 2, 아래쪽 5인 점의 좌표를 구하시오.",
				a: "2,-5"
			},
			{
				q: "왼쪽 6, 아래쪽 1인 점의 좌표를 구하시오.",
				a: "-6,-1"
			},
			{
				q: "y축 위에서 y좌표가 4인 점을 구하시오.",
				a: "0,4"
			}
		])
	},
	{
		term: "중1 · 1학기",
		major: "4. 좌표평면과 그래프",
		middle: "좌표평면과 그래프",
		minor: "그래프",
		problem: g3Problem("중1 · 교과서 예제 02", "점 (2,3), (4,7), (6,11)에서 x가 2씩 증가할 때 y는 얼마씩 증가하는지 구하시오.", "4", [
			[
				"첫 두 점의 x 증가량은?",
				"4-2=2",
				"7-3=4",
				"2+4=6",
				"x좌표끼리 빼."
			],
			[
				"첫 두 점의 y 증가량은?",
				"7-3=4",
				"4-2=2",
				"7+3=10",
				"y좌표끼리 빼."
			],
			[
				"다음 두 점의 x 증가량은?",
				"6-4=2",
				"11-7=4",
				"6-2=4",
				"같은 방식으로 확인해."
			],
			[
				"다음 두 점의 y 증가량은?",
				"11-7=4",
				"6-4=2",
				"11-4=7",
				"y도 4 증가해."
			],
			[
				"x가 2 증가할 때 y 증가량은?",
				"4",
				"2",
				"8",
				"두 구간에서 모두 4야."
			]
		], [
			{
				q: "(1,2),(3,6),(5,10)에서 x가 2 증가할 때 y 증가량을 구하시오.",
				a: "4"
			},
			{
				q: "(0,5),(2,3),(4,1)에서 x가 2 증가할 때 y 변화량을 구하시오.",
				a: "-2"
			},
			{
				q: "(2,1),(5,7)에서 x 증가량과 y 증가량을 차례로 구하시오.",
				a: "3,6"
			}
		])
	},
	{
		term: "중1 · 1학기",
		major: "4. 좌표평면과 그래프",
		middle: "좌표평면과 그래프",
		minor: "그래프",
		problem: g3Problem("중1 · 교과서 중단원 학습점검 03", "시간 x분과 이동 거리 y m의 관계가 (0,0), (1,60), (2,120), (3,180)으로 나타날 때, 5분 동안 이동한 거리를 구하시오.", "300", [
			[
				"1분 동안 이동한 거리는?",
				"60 m",
				"120 m",
				"180 m",
				"(1,60)에서 읽을 수 있어."
			],
			[
				"매분 이동 거리는 일정한가요?",
				"일정하다",
				"계속 감소한다",
				"알 수 없다",
				"y가 매번 60씩 증가해."
			],
			[
				"관계식은?",
				"y=60x",
				"y=x+60",
				"x=60y",
				"시간에 분당 거리 60을 곱해."
			],
			[
				"x=5를 넣으면?",
				"y=60×5",
				"y=60+5",
				"y=5/60",
				"5분의 거리를 계산해."
			],
			[
				"이동 거리는?",
				"300 m",
				"65 m",
				"12 m",
				"60×5=300이야."
			]
		], [
			{
				q: "분당 80 m 이동할 때 4분의 거리를 구하시오.",
				a: "320"
			},
			{
				q: "y=50x일 때 x=7인 y를 구하시오.",
				a: "350"
			},
			{
				q: "3분에 210 m 이동할 때 분당 거리를 구하시오.",
				a: "70"
			}
		])
	},
	{
		term: "중1 · 1학기",
		major: "4. 좌표평면과 그래프",
		middle: "정비례와 반비례",
		minor: "정비례 관계와 그래프",
		problem: g3Problem("중1 · 교과서 중단원 학습점검 04", "정비례 관계 y=ax의 그래프가 점 (-3,12)를 지날 때, a의 값을 구하시오.", "-4", [
			[
				"정비례 관계의 식은?",
				"y=ax",
				"y=a/x",
				"y=ax+b",
				"원점을 지나는 y=ax 꼴이야."
			],
			[
				"점의 좌표를 대입하면?",
				"12=a×(-3)",
				"-3=12a",
				"12=a/(-3)",
				"x=-3, y=12를 넣어."
			],
			[
				"a를 구하는 계산은?",
				"12÷(-3)",
				"12×(-3)",
				"12+3",
				"양변을 -3으로 나눠."
			],
			[
				"a의 값은?",
				"-4",
				"4",
				"-36",
				"다른 부호의 나눗셈은 음수야."
			],
			[
				"관계식은?",
				"y=-4x",
				"y=4x",
				"y=-4/x",
				"구한 a를 y=ax에 넣어."
			]
		], [
			{
				q: "y=ax가 (4,10)을 지날 때 a를 구하시오.",
				a: "5/2"
			},
			{
				q: "y=ax가 (-2,-6)을 지날 때 a를 구하시오.",
				a: "3"
			},
			{
				q: "y=-3x에서 x=5일 때 y를 구하시오.",
				a: "-15"
			}
		])
	},
	{
		term: "중1 · 1학기",
		major: "4. 좌표평면과 그래프",
		middle: "정비례와 반비례",
		minor: "반비례 관계와 그래프",
		problem: g3Problem("중1 · 교과서 중단원 학습점검 05", "반비례 관계 y=a/x의 그래프가 점 (6,-4)를 지날 때, a의 값을 구하시오.", "-24", [
			[
				"반비례 관계의 식은?",
				"y=a/x",
				"y=ax",
				"y=x+a",
				"x와 y의 곱이 일정한 관계야."
			],
			[
				"점을 대입하면?",
				"-4=a/6",
				"6=a/(-4)",
				"-4=6a",
				"x=6, y=-4를 넣어."
			],
			[
				"양변에 6을 곱하면?",
				"a=-24",
				"a=-2/3",
				"a=24",
				"-4×6=-24야."
			],
			[
				"a의 값은?",
				"-24",
				"24",
				"-10",
				"x와 y의 곱 6×(-4)와 같아."
			],
			[
				"관계식은?",
				"y=-24/x",
				"y=-24x",
				"y=24/x",
				"구한 a를 분자에 넣어."
			]
		], [
			{
				q: "y=a/x가 (5,6)을 지날 때 a를 구하시오.",
				a: "30"
			},
			{
				q: "y=a/x가 (-3,8)을 지날 때 a를 구하시오.",
				a: "-24"
			},
			{
				q: "y=20/x에서 x=-4일 때 y를 구하시오.",
				a: "-5"
			}
		])
	}
];
var reviewPdfSupplements = [
	{
		term: "중1 · 1학기",
		major: "4. 좌표평면과 그래프",
		middle: "정비례와 반비례",
		minor: "정비례 관계와 그래프",
		problem: g3Problem("중1 · 교과서 대단원 학습평가 · 그래프 보충 01", "정비례 관계 y=2x의 그래프 위의 점 P의 x좌표가 -3일 때, 점 P의 좌표와 점 P가 있는 사분면을 차례로 구하시오.", "-3,-6,제3사분면", [
			[
				"x=-3을 y=2x에 대입한 식은?",
				"y=2×(-3)",
				"y=2+(-3)",
				"y=-3÷2",
				"그래프 위의 점은 관계식 y=2x를 만족해."
			],
			[
				"y의 값은?",
				"-6",
				"-1",
				"6",
				"2×(-3)=-6이야."
			],
			[
				"점 P의 좌표는?",
				"(-3,-6)",
				"(-6,-3)",
				"(3,6)",
				"좌표는 (x,y)의 순서로 써."
			],
			[
				"x와 y의 부호는?",
				"둘 다 음수",
				"둘 다 양수",
				"서로 다르다",
				"x=-3, y=-6이야."
			],
			[
				"점 P가 있는 사분면은?",
				"제3사분면",
				"제1사분면",
				"제4사분면",
				"x<0, y<0인 점은 제3사분면에 있어."
			]
		], [
			{
				q: "y=3x의 그래프에서 x=-2인 점의 좌표를 구하시오.",
				a: "-2,-6"
			},
			{
				q: "y=-2x의 그래프가 지나는 사분면을 모두 쓰시오.",
				a: "제2사분면,제4사분면"
			},
			{
				q: "점 (4,12)를 지나는 정비례 관계식을 구하시오.",
				a: "y=3x"
			}
		])
	},
	{
		term: "중1 · 1학기",
		major: "4. 좌표평면과 그래프",
		middle: "정비례와 반비례",
		minor: "정비례 관계와 그래프",
		problem: g3Problem("중1 · 교과서 중단원 학습점검 · 그래프 보충 02", "두 점 (-2,6), (3,-9)를 지나는 정비례 그래프의 관계식을 구하시오.", "y=-3x", [
			[
				"정비례 관계식의 꼴은?",
				"y=ax",
				"y=a/x",
				"y=ax+b",
				"정비례 그래프는 원점을 지나는 y=ax 꼴이야."
			],
			[
				"점 (-2,6)을 대입하면?",
				"6=-2a",
				"-2=6a",
				"6=a/(-2)",
				"x=-2, y=6을 넣어."
			],
			[
				"a의 값은?",
				"-3",
				"3",
				"-12",
				"6÷(-2)=-3이야."
			],
			[
				"다른 점 (3,-9)도 만족하나요?",
				"만족한다",
				"만족하지 않는다",
				"알 수 없다",
				"-3×3=-9이므로 만족해."
			],
			[
				"관계식은?",
				"y=-3x",
				"y=3x",
				"y=-3/x",
				"구한 a=-3을 y=ax에 넣어."
			]
		], [
			{
				q: "점 (5,2)를 지나는 정비례 관계식을 구하시오.",
				a: "y=2/5x"
			},
			{
				q: "y=-4x의 그래프 위에서 y=12인 점의 x좌표를 구하시오.",
				a: "-3"
			},
			{
				q: "y=ax가 (2,-7)을 지날 때 a를 구하시오.",
				a: "-7/2"
			}
		])
	},
	{
		term: "중1 · 1학기",
		major: "4. 좌표평면과 그래프",
		middle: "정비례와 반비례",
		minor: "반비례 관계와 그래프",
		problem: g3Problem("중1 · 교과서 대단원 학습평가 · 그래프 보충 01", "반비례 관계 y=12/x의 그래프 위에서 x좌표와 y좌표가 모두 자연수인 점을 모두 구하시오.", "(1,12),(2,6),(3,4),(4,3),(6,2),(12,1)", [
			[
				"반비례 관계에서 일정한 값은?",
				"x와 y의 곱",
				"x와 y의 합",
				"x와 y의 차",
				"y=12/x이므로 xy=12야."
			],
			[
				"자연수 좌표를 찾으려면 무엇을 찾나요?",
				"12의 자연수 약수",
				"12보다 큰 소수",
				"12의 배수만",
				"x가 12의 약수이면 y도 자연수가 돼."
			],
			[
				"12의 자연수 약수는?",
				"1,2,3,4,6,12",
				"1,2,3,6",
				"2,4,6,12",
				"빠뜨리지 않고 작은 수부터 써 보자."
			],
			[
				"x=3일 때 점은?",
				"(3,4)",
				"(4,3)",
				"(3,9)",
				"y=12÷3=4야."
			],
			[
				"모든 점을 쓰는 방법은?",
				"약수와 짝이 되는 몫을 좌표로 쓴다",
				"약수만 x좌표로 쓴다",
				"두 좌표를 더한다",
				"(x,12÷x)를 약수마다 쓰면 돼."
			]
		], [
			{
				q: "y=8/x에서 두 좌표가 자연수인 점을 모두 구하시오.",
				a: "(1,8),(2,4),(4,2),(8,1)"
			},
			{
				q: "y=-6/x의 그래프가 지나는 사분면을 모두 쓰시오.",
				a: "제2사분면,제4사분면"
			},
			{
				q: "y=a/x가 점 (-4,5)를 지날 때 관계식을 구하시오.",
				a: "y=-20/x"
			}
		])
	},
	{
		term: "중1 · 1학기",
		major: "4. 좌표평면과 그래프",
		middle: "정비례와 반비례",
		minor: "반비례 관계와 그래프",
		problem: g3Problem("중1 · 교과서 중단원 학습점검 · 그래프 보충 02", "반비례 그래프 y=a/x가 두 점 A(-3,4), B(6,b)를 지날 때, a와 b의 값을 차례로 구하시오.", "-12,-2", [
			[
				"점 A를 식에 대입하면?",
				"4=a/(-3)",
				"-3=a/4",
				"4=-3a",
				"x=-3, y=4를 넣어."
			],
			[
				"a의 값은?",
				"-12",
				"12",
				"-4/3",
				"양변에 -3을 곱하면 a=-12야."
			],
			[
				"점 B를 넣은 식은?",
				"b=-12/6",
				"6=-12/b",
				"b=-12×6",
				"x=6을 y=-12/x에 넣어."
			],
			[
				"b의 값은?",
				"-2",
				"2",
				"-72",
				"-12÷6=-2야."
			],
			[
				"두 점에서 공통으로 같은 값은?",
				"xy=-12",
				"x+y=-12",
				"x-y=-12",
				"반비례에서는 x와 y의 곱이 a로 일정해."
			]
		], [
			{
				q: "y=a/x가 (2,7)을 지날 때 a를 구하시오.",
				a: "14"
			},
			{
				q: "y=18/x에서 x=-3일 때 y를 구하시오.",
				a: "-6"
			},
			{
				q: "xy=-24이고 x=8일 때 y를 구하시오.",
				a: "-3"
			}
		])
	},
	{
		term: "중2 · 1학기",
		major: "1. 유리수와 순환소수",
		middle: "유리수와 소수",
		minor: "유리수와 소수",
		problem: g3Problem("중2 · 교과서 대단원 학습평가 · 순환소수 보충", "분수 7/12를 소수로 나타내고, 순환마디를 쓰시오.", "0.58(3),3", [
			[
				"7을 12로 나누면 처음 두 자리까지는?",
				"0.58",
				"0.75",
				"0.12",
				"세로셈에서 70÷12=5, 나머지 10이고 다음 몫은 8이야."
			],
			[
				"그다음 나머지로 계속 나누면 나오는 숫자는?",
				"3",
				"6",
				"8",
				"나머지 4에서 40÷12=3, 다시 나머지 4가 돼."
			],
			[
				"같은 나머지가 반복되면?",
				"같은 몫의 숫자가 반복된다",
				"계산이 끝난다",
				"항상 0이 된다",
				"나머지 4가 되풀이되어 3이 계속 나와."
			],
			[
				"소수 표현은?",
				"0.58(3)",
				"0.(583)",
				"0.5(83)",
				"반복되는 숫자는 3 하나뿐이야."
			],
			[
				"순환마디는?",
				"3",
				"58",
				"583",
				"되풀이되는 가장 짧은 숫자 묶음이 순환마디야."
			]
		], [
			{
				q: "5/6를 순환소수로 나타내고 순환마디를 쓰시오.",
				a: "0.8(3),3"
			},
			{
				q: "2/11을 순환소수로 나타내시오.",
				a: "0.(18)"
			},
			{
				q: "0.(27)을 분수로 나타내시오.",
				a: "3/11"
			}
		])
	},
	{
		term: "중2 · 1학기",
		major: "5. 일차함수",
		middle: "일차함수와 그래프",
		minor: "일차함수와 그 그래프",
		problem: g3Problem("중2 · 교과서 대단원 학습평가 · 그래프 보충", "x절편이 3이고 y절편이 -6인 일차함수의 식을 구하시오.", "y=2x-6", [
			[
				"x절편을 좌표로 쓰면?",
				"(3,0)",
				"(0,3)",
				"(3,-6)",
				"x축 위의 점은 y=0이야."
			],
			[
				"y절편을 좌표로 쓰면?",
				"(0,-6)",
				"(-6,0)",
				"(3,-6)",
				"y축 위의 점은 x=0이야."
			],
			[
				"두 점을 이용한 기울기는?",
				"2",
				"-2",
				"1/2",
				"(-6-0)÷(0-3)=2야."
			],
			[
				"y절편을 넣은 식은?",
				"y=2x-6",
				"y=2x+6",
				"y=-2x-6",
				"기울기 2, y절편 -6이야."
			],
			[
				"x=3을 넣어 확인하면?",
				"y=0",
				"y=6",
				"y=-12",
				"2×3-6=0이므로 x절편 조건과 맞아."
			]
		], [
			{
				q: "x절편 4, y절편 8인 일차함수의 식을 구하시오.",
				a: "y=-2x+8"
			},
			{
				q: "두 점 (0,3), (2,7)을 지나는 일차함수의 식을 구하시오.",
				a: "y=2x+3"
			},
			{
				q: "y=-3x+6의 두 절편을 차례로 구하시오.",
				a: "2,6"
			}
		])
	}
];
var warehouseCore = [
	...warehouseBase,
	...unit1Assessment,
	...unit2Assessment,
	...unit3Assessment,
	...unit4Assessment,
	...unit5Assessment,
	...unit6Assessment,
	...unit7Assessment,
	...unit8Assessment,
	...grade1Semester1Expansion,
	...grade2Assessment,
	...grade3CurriculumAssessment,
	...grade3Semester2Assessment,
	...reviewPdfSupplements
];
var grade1Semester1Keys = Object.entries(curriculum["중1 · 1학기"]).flatMap(([major, middles]) => Object.entries(middles).flatMap(([middle, minors]) => minors.map((minor) => ({
	major,
	middle,
	minor
}))));
var expansionDistractors = (answer) => {
	const numeric = Number(answer);
	if (Number.isFinite(numeric)) return [`${numeric + 1}`, `${numeric - 1}`];
	return ["조건을 다시 확인", "계산 순서를 다시 확인"];
};
function expandGrade1Semester1(items, target = 7) {
	const additions = [];
	grade1Semester1Keys.forEach((key) => {
		const seeds = items.filter((item) => item.term === "중1 · 1학기" && item.major === key.major && item.middle === key.middle && item.minor === key.minor);
		const candidates = seeds.flatMap((seed) => [
			...seed.problem.practice.map((practice) => ({
				seed,
				practice
			})),
			...seed.problem.pieces.map((piece) => ({
				seed,
				practice: {
					q: piece.q,
					a: piece.options[piece.answer]
				}
			})),
			...seed.problem.pieces.map((piece) => ({
				seed,
				practice: {
					q: `교과서 풀이 설명을 읽고 알맞은 결과를 쓰시오. ${piece.talk}`,
					a: piece.options[piece.answer]
				}
			}))
		]).filter((candidate, index, array) => array.findIndex((other) => other.practice.q === candidate.practice.q) === index);
		let count = seeds.length;
		let cursor = 0;
		while (count < target && candidates.length) {
			const { seed, practice } = candidates[cursor % candidates.length];
			const distractors = expansionDistractors(practice.a);
			const related = [...seed.problem.practice.filter((item) => item.q !== practice.q), {
				q: seed.problem.question.한국어,
				a: seed.problem.answer
			}].slice(0, 3);
			additions.push({
				term: "중1 · 1학기",
				major: key.major,
				middle: key.middle,
				minor: key.minor,
				problem: evalQuestion(`중1 · 교과서 중단원·대단원 확장 ${String(count + 1).padStart(2, "0")}`, practice.q, practice.a, [
					{
						tag: "READ",
						q: "이 본문제를 해결할 때 먼저 찾아야 하는 것은 무엇인가요?",
						options: [
							"문제에서 구하라고 한 값",
							"문제의 글자 수",
							"단원의 쪽수"
						],
						answer: 0,
						talk: "마지막 문장을 먼저 읽고 무엇을 답해야 하는지 분명히 잡자."
					},
					{
						tag: "CONCEPT",
						q: "이 문제에 직접 적용할 소단원 핵심은 무엇인가요?",
						options: [
							key.minor,
							key.middle,
							key.major
						],
						answer: 0,
						talk: `이 문제는 ${key.minor}에서 배운 정의와 계산 방법을 적용하는 문제야.`
					},
					{
						tag: "SETUP",
						q: "교과서 풀이를 시작하는 올바른 방법은?",
						options: [
							"주어진 수·부호·조건을 식이나 그림에 정확히 옮긴다",
							"답부터 추측한다",
							"조건 하나를 빼고 계산한다"
						],
						answer: 0,
						talk: "문제에 나온 조건을 빠뜨리지 않고 식이나 그림으로 바꿔야 계산이 흔들리지 않아."
					},
					{
						tag: "PROCESS",
						q: "풀이 과정에서 가장 지켜야 할 것은?",
						options: [
							"정의와 계산 순서에 따라 한 단계씩 정리한다",
							"중간식을 모두 생략한다",
							"단위를 바꾸어 적는다"
						],
						answer: 0,
						talk: "한 단계의 결과를 다음 단계에 이어 쓰고 부호와 단위를 확인하자."
					},
					{
						tag: "CHECK",
						q: "원래 조건에 다시 대입하거나 검산했을 때 얻는 답은?",
						options: [
							practice.a,
							distractors[0],
							distractors[1]
						],
						answer: 0,
						talk: `검산까지 마친 답은 ${practice.a}이야. 같은 유형에서는 숫자가 바뀌어도 이 풀이 순서를 그대로 사용해.`
					}
				], related)
			});
			count++;
			cursor++;
		}
	});
	return [...items, ...additions];
}
var grade1Semester2Seed = [{
	term: "중1 · 2학기",
	major: "5. 기본 도형",
	middle: "기본 도형",
	minor: "점·선·면",
	problem: g3Problem("중1 · 교과서 중단원 학습점검 01", "서로 다른 두 점 A, B를 모두 지나는 직선의 개수를 구하시오.", "1", [
		[
			"점 A와 B는 같은 점인가요?",
			"서로 다른 점",
			"같은 점",
			"알 수 없음",
			"문제에서 서로 다른 두 점이라고 했어."
		],
		[
			"서로 다른 두 점을 지나는 직선은?",
			"오직 하나",
			"두 개",
			"무수히 많음",
			"두 점은 하나의 직선을 결정해."
		],
		[
			"그 직선의 이름은?",
			"직선 AB",
			"반직선 AB",
			"선분 A",
			"두 점의 이름을 사용해 직선 AB라 해."
		],
		[
			"직선을 양쪽으로 늘릴 수 있나요?",
			"양쪽으로 끝없이",
			"A쪽으로만",
			"B쪽으로만",
			"직선은 양쪽으로 끝없이 뻗어."
		],
		[
			"직선의 개수는?",
			"1",
			"2",
			"0",
			"서로 다른 두 점을 지나는 직선은 하나야."
		]
	], [
		{
			q: "서로 다른 두 점 P,Q를 지나는 직선의 개수를 구하시오.",
			a: "1"
		},
		{
			q: "한 직선 위에 있지 않은 세 점 중 두 점을 골라 만든 직선 수를 구하시오.",
			a: "3"
		},
		{
			q: "서로 다른 네 점 중 어느 세 점도 한 직선 위에 없을 때 두 점을 지나는 직선 수를 구하시오.",
			a: "6"
		}
	])
}, {
	term: "중1 · 2학기",
	major: "5. 기본 도형",
	middle: "기본 도형",
	minor: "점·선·면",
	problem: g3Problem("중1 · 교과서 예제 01", "직선 l 위에 서로 다른 세 점 A, B, C가 있다. 이 세 점 중 두 점을 끝점으로 하는 선분의 개수를 구하시오.", "3", [
		[
			"선분은 무엇으로 정해지나요?",
			"두 끝점",
			"한 점",
			"한 평면",
			"선분은 두 끝점 사이의 곧은 부분이야."
		],
		[
			"A와 B로 만든 선분은?",
			"선분 AB",
			"직선 l만",
			"반직선 CA",
			"두 끝점 A,B를 연결해."
		],
		[
			"A와 C로 만든 선분은?",
			"선분 AC",
			"선분 AB",
			"점 A",
			"A,C도 한 쌍이야."
		],
		[
			"B와 C로 만든 선분은?",
			"선분 BC",
			"선분 BA만",
			"직선 AC",
			"B,C가 마지막 쌍이야."
		],
		[
			"서로 다른 선분 수는?",
			"3",
			"6",
			"2",
			"AB, AC, BC의 세 개야."
		]
	], [
		{
			q: "네 점 중 두 점을 끝점으로 하는 선분 수를 구하시오.",
			a: "6"
		},
		{
			q: "다섯 점 중 두 점을 끝점으로 하는 선분 수를 구하시오.",
			a: "10"
		},
		{
			q: "세 점 A,B,C로 만들 수 있는 선분을 모두 쓰시오.",
			a: "AB,AC,BC"
		}
	])
}];
var warehouseAfterGrade1Semester1 = expandGrade1Semester1(warehouseCore, 7);
function expandTermToSeven(items, term, target = 7) {
	const termKeys = Object.entries(curriculum[term]).flatMap(([major, middles]) => Object.entries(middles).flatMap(([middle, minors]) => minors.map((minor) => ({
		major,
		middle,
		minor
	}))));
	const additions = [];
	termKeys.forEach((key) => {
		const seeds = items.filter((item) => item.term === term && item.major === key.major && item.middle === key.middle && item.minor === key.minor);
		const candidates = seeds.flatMap((seed) => [
			...seed.problem.practice.map((practice) => ({
				seed,
				practice
			})),
			...seed.problem.pieces.map((piece) => ({
				seed,
				practice: {
					q: piece.q,
					a: piece.options[piece.answer]
				}
			})),
			...seed.problem.pieces.map((piece) => ({
				seed,
				practice: {
					q: `교과서 풀이 설명을 읽고 알맞은 결과를 쓰시오. ${piece.talk}`,
					a: piece.options[piece.answer]
				}
			}))
		]).filter((candidate, index, array) => array.findIndex((other) => other.practice.q === candidate.practice.q) === index);
		let count = seeds.length;
		let cursor = 0;
		while (count < target && candidates.length) {
			const { seed, practice } = candidates[cursor % candidates.length];
			const distractors = expansionDistractors(practice.a);
			const related = [...seed.problem.practice.filter((item) => item.q !== practice.q), {
				q: seed.problem.question.한국어,
				a: seed.problem.answer
			}].slice(0, 3);
			additions.push({
				term,
				major: key.major,
				middle: key.middle,
				minor: key.minor,
				problem: evalQuestion(`${term} · 교과서 중단원·대단원 확장 ${String(count + 1).padStart(2, "0")}`, practice.q, practice.a, [
					{
						tag: "READ",
						q: "본문의 마지막 문장에서 구하라고 한 것은 무엇인가요?",
						options: [
							"문제가 요구한 값이나 도형",
							"문장의 글자 수",
							"교과서 쪽수"
						],
						answer: 0,
						talk: "마지막 문장을 먼저 읽어 답으로 써야 할 대상을 정확히 잡자."
					},
					{
						tag: "CONCEPT",
						q: "이 문제에서 사용할 핵심 개념은?",
						options: [
							key.minor,
							key.middle,
							key.major
						],
						answer: 0,
						talk: `${key.minor}에서 배운 정의, 성질, 공식을 본문의 조건과 연결해.`
					},
					{
						tag: "ORGANIZE",
						q: "주어진 조건을 빠뜨리지 않는 방법은?",
						options: [
							"수·각·길이·도수를 식이나 그림에 표시",
							"조건 하나를 생략",
							"답부터 임의로 정함"
						],
						answer: 0,
						talk: "교과서 풀이처럼 주어진 조건을 먼저 표시하면 잘못 읽는 실수를 줄일 수 있어."
					},
					{
						tag: "PROCESS",
						q: "풀이를 이어 가는 올바른 방법은?",
						options: [
							"정의와 성질에 따라 한 단계씩 계산",
							"중간 과정을 모두 생략",
							"단위를 임의로 변경"
						],
						answer: 0,
						talk: "앞 단계에서 얻은 관계를 다음 계산에 사용하고 부호·각도·단위를 확인하자."
					},
					{
						tag: "CHECK",
						q: "원래 조건으로 검산했을 때 얻는 답은?",
						options: [
							practice.a,
							distractors[0],
							distractors[1]
						],
						answer: 0,
						talk: `조건에 다시 넣어 확인한 답은 ${practice.a}이야.`
					}
				], related)
			});
			count++;
			cursor++;
		}
	});
	return [...items, ...additions];
}
var warehouseBeforeGrade2Semester1 = expandTermToSeven([...warehouseAfterGrade1Semester1, ...grade1Semester2Seed], "중1 · 2학기", 7);
var grade2Semester1Seed = [
	{
		term: "중2 · 1학기",
		major: "1. 유리수와 순환소수",
		middle: "유리수와 소수",
		minor: "유리수와 소수",
		problem: g3Problem("중2 · 교과서 중단원 학습점검 01", "다음 중 유리수인 것을 모두 고르시오. √2, -3/4, 0.125, π", "-3/4,0.125", [
			[
				"유리수의 뜻은?",
				"두 정수의 비로 나타낼 수 있는 수",
				"모든 무한소수",
				"모든 근호 수",
				"분수 꼴로 나타낼 수 있어."
			],
			[
				"-3/4는?",
				"유리수",
				"무리수",
				"자연수",
				"이미 정수의 비로 나타나 있어."
			],
			[
				"0.125를 분수로 나타내면?",
				"1/8",
				"125/10",
				"나타낼 수 없음",
				"유한소수는 분수로 나타낼 수 있어."
			],
			[
				"√2와 π는?",
				"무리수",
				"유리수",
				"정수",
				"순환하지 않는 무한소수야."
			],
			[
				"유리수는?",
				"-3/4, 0.125",
				"√2, π",
				"모두",
				"두 수만 유리수야."
			]
		], [
			{
				q: "√3, 2/5, 0.4 중 유리수를 모두 고르시오.",
				a: "2/5,0.4"
			},
			{
				q: "-2, π, √9 중 유리수를 모두 고르시오.",
				a: "-2,√9"
			},
			{
				q: "0.333…, √5 중 유리수를 고르시오.",
				a: "0.333…"
			}
		])
	},
	{
		term: "중2 · 1학기",
		major: "2. 식의 계산",
		middle: "지수법칙",
		minor: "지수법칙 ⑴",
		problem: g3Problem("중2 · 교과서 중단원 학습점검 01", "a³×a⁵÷a²을 간단히 하시오.", "a⁶", [
			[
				"곱셈에서 지수는?",
				"더한다",
				"곱한다",
				"뺀다",
				"밑이 같으면 지수를 더해."
			],
			[
				"a³×a⁵는?",
				"a⁸",
				"a¹⁵",
				"a²",
				"3+5=8이야."
			],
			[
				"나눗셈에서 지수는?",
				"뺀다",
				"더한다",
				"나눈다",
				"분자의 지수에서 분모 지수를 빼."
			],
			[
				"a⁸÷a²는?",
				"a⁶",
				"a⁴",
				"a¹⁰",
				"8-2=6이야."
			],
			[
				"최종식은?",
				"a⁶",
				"a⁸",
				"a³",
				"밑 a, 지수 6이야."
			]
		], [
			{
				q: "x⁴×x³을 간단히 하시오.",
				a: "x⁷"
			},
			{
				q: "b⁹÷b⁴를 간단히 하시오.",
				a: "b⁵"
			},
			{
				q: "m²×m⁶÷m³을 간단히 하시오.",
				a: "m⁵"
			}
		])
	},
	{
		term: "중2 · 1학기",
		major: "2. 식의 계산",
		middle: "단항식과 다항식의 계산",
		minor: "단항식과 다항식의 곱셈과 나눗셈",
		problem: g3Problem("중2 · 교과서 중단원 학습점검 05", "3x(2x-5)-6x²를 간단히 하시오.", "-15x", [
			[
				"분배법칙을 적용하면?",
				"6x²-15x-6x²",
				"6x-15-6x²",
				"6x²+15x-6x²",
				"3x를 괄호의 두 항에 곱해."
			],
			[
				"3x×2x는?",
				"6x²",
				"6x",
				"5x²",
				"계수는 6, 문자는 x²이야."
			],
			[
				"3x×(-5)는?",
				"-15x",
				"15x",
				"-15",
				"부호와 x를 유지해."
			],
			[
				"동류항 6x²-6x²는?",
				"0",
				"12x²",
				"-12x²",
				"서로 없어져."
			],
			[
				"남는 식은?",
				"-15x",
				"15x",
				"-15x²",
				"-15x만 남아."
			]
		], [
			{
				q: "2a(3a+4)-6a²를 간단히 하시오.",
				a: "8a"
			},
			{
				q: "-x(2x-3)+2x²를 간단히 하시오.",
				a: "3x"
			},
			{
				q: "(8x²-12x)÷4x를 간단히 하시오.",
				a: "2x-3"
			}
		])
	},
	{
		term: "중2 · 1학기",
		major: "3. 일차부등식",
		middle: "부등식",
		minor: "부등식과 그 해",
		problem: g3Problem("중2 · 교과서 중단원 학습점검 01", "x=3이 부등식 2x-1<7의 해인지 판단하시오.", "해이다", [
			[
				"해를 확인하는 방법은?",
				"x=3을 대입",
				"x=0을 대입",
				"양변을 더함",
				"주어진 값을 넣어 부등호가 참인지 봐."
			],
			[
				"왼쪽 값은?",
				"2×3-1=5",
				"2×3=6",
				"3-1=2",
				"정확히 계산해."
			],
			[
				"비교할 부등식은?",
				"5<7",
				"5>7",
				"7<5",
				"왼쪽 5, 오른쪽 7이야."
			],
			[
				"이 부등식은 참인가요?",
				"참",
				"거짓",
				"판단 불가",
				"5는 7보다 작아."
			],
			[
				"결론은?",
				"해이다",
				"해가 아니다",
				"등식의 해다",
				"부등식을 참이 되게 하므로 해야."
			]
		], [
			{
				q: "x=4가 3x+1≤13의 해인지 답하시오.",
				a: "해이다"
			},
			{
				q: "x=5가 2x-3<6의 해인지 답하시오.",
				a: "해가 아니다"
			},
			{
				q: "x=-1이 -2x≥2의 해인지 답하시오.",
				a: "해이다"
			}
		])
	},
	{
		term: "중2 · 1학기",
		major: "3. 일차부등식",
		middle: "부등식",
		minor: "부등식의 성질",
		problem: g3Problem("중2 · 교과서 중단원 학습점검 02", "-2x<6의 양변을 -2로 나누어 부등식을 푸시오.", "x>-3", [
			[
				"음수로 나눌 때 부등호는?",
				"방향을 바꾼다",
				"그대로 둔다",
				"등호로 바꾼다",
				"음수를 곱하거나 나누면 방향이 반대가 돼."
			],
			[
				"양변을 -2로 나누면 왼쪽은?",
				"x",
				"-x",
				"2x",
				"-2x÷(-2)=x야."
			],
			[
				"오른쪽 값은?",
				"-3",
				"3",
				"-12",
				"6÷(-2)=-3이야."
			],
			[
				"부등호 방향은?",
				">",
				"<",
				"=",
				"<가 >로 바뀌어."
			],
			[
				"해는?",
				"x>-3",
				"x<-3",
				"x>3",
				"방향과 값을 함께 확인해."
			]
		], [
			{
				q: "-3x≥12를 풀어라.",
				a: "x≤-4"
			},
			{
				q: "5x<20을 풀어라.",
				a: "x<4"
			},
			{
				q: "-x≤7을 풀어라.",
				a: "x≥-7"
			}
		])
	},
	{
		term: "중2 · 1학기",
		major: "4. 연립일차방정식",
		middle: "연립일차방정식",
		minor: "연립일차방정식과 그 해",
		problem: g3Problem("중2 · 교과서 중단원 학습점검 01", "순서쌍 (2,1)이 연립방정식 x+y=3, 2x-y=3의 해인지 확인하시오.", "해이다", [
			[
				"첫째 식에 대입하면?",
				"2+1=3",
				"2-1=3",
				"2×1=3",
				"x=2,y=1을 넣어."
			],
			[
				"첫째 식은 참인가요?",
				"참",
				"거짓",
				"알 수 없음",
				"3=3이야."
			],
			[
				"둘째 식에 대입하면?",
				"2×2-1=3",
				"2+2-1=3",
				"2×1-2=3",
				"2x-y에 넣어."
			],
			[
				"둘째 식도 참인가요?",
				"참",
				"거짓",
				"첫째만 참",
				"4-1=3이야."
			],
			[
				"결론은?",
				"해이다",
				"해가 아니다",
				"x만 해다",
				"두 식을 모두 만족해."
			]
		], [
			{
				q: "(1,2)가 x+y=3, x-y=-1의 해인지 답하시오.",
				a: "해이다"
			},
			{
				q: "(3,1)이 x+y=4, x-2y=0의 해인지 답하시오.",
				a: "해가 아니다"
			},
			{
				q: "(2,-1)이 2x+y=3, x-y=3의 해인지 답하시오.",
				a: "해이다"
			}
		])
	},
	{
		term: "중2 · 1학기",
		major: "4. 연립일차방정식",
		middle: "연립일차방정식",
		minor: "연립일차방정식의 풀이",
		problem: g3Problem("중2 · 교과서 중단원 학습점검 02", "연립방정식 x+y=7, x-y=1을 풀어라.", "4,3", [
			[
				"두 식을 더하면 없어지는 문자는?",
				"y",
				"x",
				"둘 다",
				"+y와 -y가 없어져."
			],
			[
				"두 식을 더한 결과는?",
				"2x=8",
				"2y=6",
				"x=8",
				"왼쪽과 오른쪽을 각각 더해."
			],
			[
				"x의 값은?",
				"4",
				"8",
				"2",
				"8÷2=4야."
			],
			[
				"x=4를 첫째 식에 넣으면?",
				"4+y=7",
				"4-y=1",
				"y=7",
				"x+y=7에 넣어."
			],
			[
				"y와 해는?",
				"y=3, (4,3)",
				"y=4, (3,4)",
				"y=11",
				"연립방정식의 해는 x=4,y=3이야."
			]
		], [
			{
				q: "x+y=9, x-y=3을 풀어라.",
				a: "6,3"
			},
			{
				q: "2x+y=7, x-y=2를 풀어라.",
				a: "3,1"
			},
			{
				q: "x+2y=8, x-y=2를 풀어라.",
				a: "4,2"
			}
		])
	},
	{
		term: "중2 · 1학기",
		major: "5. 일차함수",
		middle: "일차함수와 그래프",
		minor: "함수",
		problem: g3Problem("중2 · 교과서 중단원 학습점검 01", "y가 x의 함수이고 y=3x-2일 때, x=4에 대응하는 y의 값을 구하시오.", "10", [
			[
				"함수에서 x는?",
				"독립변수",
				"함숫값",
				"상수",
				"입력하는 값이 x야."
			],
			[
				"y는?",
				"x에 대응하는 함숫값",
				"항상 0",
				"x와 무관한 수",
				"x가 정해지면 y가 하나 정해져."
			],
			[
				"x=4를 넣은 식은?",
				"y=3×4-2",
				"y=3+4-2",
				"y=4-2",
				"x 자리에 4를 넣어."
			],
			[
				"3×4-2는?",
				"10",
				"14",
				"7",
				"12-2=10이야."
			],
			[
				"대응하는 y는?",
				"10",
				"4",
				"3",
				"x=4일 때 y=10이야."
			]
		], [
			{
				q: "y=2x+5에서 x=3일 때 y를 구하시오.",
				a: "11"
			},
			{
				q: "y=-x+4에서 x=-2일 때 y를 구하시오.",
				a: "6"
			},
			{
				q: "y=x²에서 x=5일 때 y를 구하시오.",
				a: "25"
			}
		])
	},
	{
		term: "중2 · 1학기",
		major: "5. 일차함수",
		middle: "일차함수와 그래프",
		minor: "일차함수와 그 그래프",
		problem: g3Problem("중2 · 교과서 중단원 학습점검 02", "일차함수 y=2x-3의 그래프 위의 점 중 x좌표가 4인 점의 좌표를 구하시오.", "4,5", [
			[
				"그래프 위 점은 무엇을 만족하나요?",
				"함수의 식",
				"x+y=0만",
				"좌표축만",
				"좌표를 식에 넣으면 등식이 성립해."
			],
			[
				"x=4를 대입하면?",
				"y=2×4-3",
				"y=2+4-3",
				"y=4-3",
				"식의 x를 4로 바꿔."
			],
			[
				"y의 값은?",
				"5",
				"8",
				"3",
				"8-3=5야."
			],
			[
				"좌표 순서는?",
				"(x,y)",
				"(y,x)",
				"(x,x)",
				"x좌표를 먼저 써."
			],
			[
				"점의 좌표는?",
				"(4,5)",
				"(5,4)",
				"(4,8)",
				"x=4,y=5야."
			]
		], [
			{
				q: "y=3x+1에서 x=2인 점의 좌표를 구하시오.",
				a: "2,7"
			},
			{
				q: "y=-2x+5에서 x=1인 점의 좌표를 구하시오.",
				a: "1,3"
			},
			{
				q: "y=x-4에서 y=2인 점의 좌표를 구하시오.",
				a: "6,2"
			}
		])
	},
	{
		term: "중2 · 1학기",
		major: "5. 일차함수",
		middle: "일차함수와 그래프",
		minor: "일차함수 그래프의 기울기와 성질",
		problem: g3Problem("중2 · 교과서 중단원 학습점검 04", "두 점 (1,3), (5,11)을 지나는 직선의 기울기를 구하시오.", "2", [
			[
				"x의 증가량은?",
				"5-1=4",
				"11-3=8",
				"5+1=6",
				"뒤 점 x에서 앞 점 x를 빼."
			],
			[
				"y의 증가량은?",
				"11-3=8",
				"5-1=4",
				"11+3=14",
				"같은 순서로 y를 빼."
			],
			[
				"기울기 공식은?",
				"y의 증가량/x의 증가량",
				"x의 증가량/y의 증가량",
				"두 좌표의 합",
				"세로 변화량을 가로 변화량으로 나눠."
			],
			[
				"값을 넣으면?",
				"8/4",
				"4/8",
				"8+4",
				"증가량을 정확히 배치해."
			],
			[
				"기울기는?",
				"2",
				"1/2",
				"12",
				"8÷4=2야."
			]
		], [
			{
				q: "(0,1),(3,7)을 지나는 직선의 기울기를 구하시오.",
				a: "2"
			},
			{
				q: "(-1,4),(2,-2)를 지나는 직선의 기울기를 구하시오.",
				a: "-2"
			},
			{
				q: "(2,5),(6,5)를 지나는 직선의 기울기를 구하시오.",
				a: "0"
			}
		])
	},
	{
		term: "중2 · 1학기",
		major: "5. 일차함수",
		middle: "일차함수와 그래프",
		minor: "일차함수의 활용",
		problem: g3Problem("중2 · 교과서 대단원 학습평가 07", "물통에 처음 20 L가 있고 매분 3 L씩 물을 넣는다. x분 후 물의 양을 y L라 할 때 관계식을 구하시오.", "y=3x+20", [
			[
				"처음 물의 양은?",
				"20 L",
				"3 L",
				"0 L",
				"x=0일 때 20 L가 있어."
			],
			[
				"1분마다 증가량은?",
				"3 L",
				"20 L",
				"23 L",
				"매분 3 L씩 늘어."
			],
			[
				"x분 동안 늘어난 양은?",
				"3x L",
				"20x L",
				"x+3 L",
				"분당 양×시간이야."
			],
			[
				"전체 물의 양은?",
				"처음 양+늘어난 양",
				"처음 양-늘어난 양",
				"두 양의 곱",
				"20에 3x를 더해."
			],
			[
				"관계식은?",
				"y=3x+20",
				"y=20x+3",
				"y=3x-20",
				"기울기 3, y절편 20이야."
			]
		], [
			{
				q: "처음 10 L, 매분 4 L씩 넣을 때 관계식을 구하시오.",
				a: "y=4x+10"
			},
			{
				q: "처음 50개, 매일 2개씩 줄 때 관계식을 구하시오.",
				a: "y=-2x+50"
			},
			{
				q: "기본요금 3000원, 1 km당 800원일 때 요금식을 구하시오.",
				a: "y=800x+3000"
			}
		])
	},
	{
		term: "중2 · 1학기",
		major: "5. 일차함수",
		middle: "일차함수와 일차방정식",
		minor: "일차함수와 일차방정식",
		problem: g3Problem("중2 · 교과서 중단원 학습점검 07", "일차방정식 2x-y+3=0을 y=ax+b의 꼴로 나타내시오.", "y=2x+3", [
			[
				"y항만 한쪽에 두면?",
				"-y=-2x-3",
				"y=-2x-3",
				"-y=2x+3",
				"2x+3을 오른쪽으로 이항해."
			],
			[
				"양변에 -1을 곱하면?",
				"y=2x+3",
				"y=-2x-3",
				"y=2x-3",
				"모든 항의 부호가 바뀌어."
			],
			[
				"기울기 a는?",
				"2",
				"-2",
				"3",
				"x의 계수가 기울기야."
			],
			[
				"y절편 b는?",
				"3",
				"-3",
				"2",
				"상수항이 y절편이야."
			],
			[
				"함수식은?",
				"y=2x+3",
				"y=-2x+3",
				"y=2x-3",
				"정리한 식을 써."
			]
		], [
			{
				q: "x+y-4=0을 y=ax+b로 나타내시오.",
				a: "y=-x+4"
			},
			{
				q: "3x-y-2=0을 나타내시오.",
				a: "y=3x-2"
			},
			{
				q: "2x+4y=8을 나타내시오.",
				a: "y=-1/2x+2"
			}
		])
	},
	{
		term: "중2 · 1학기",
		major: "5. 일차함수",
		middle: "일차함수와 일차방정식",
		minor: "일차방정식의 그래프와 연립일차방정식",
		problem: g3Problem("중2 · 교과서 대단원 학습평가 10", "두 직선 y=x+1, y=-x+5의 교점의 좌표를 구하시오.", "2,3", [
			[
				"교점에서는 두 y값이?",
				"서로 같다",
				"합이 0",
				"항상 1",
				"같은 점이므로 y좌표가 같아."
			],
			[
				"x에 대한 식은?",
				"x+1=-x+5",
				"x+1+x+5=0",
				"x=-x",
				"두 함수의 오른쪽을 같게 둬."
			],
			[
				"x항을 모으면?",
				"2x=4",
				"2x=6",
				"x=4",
				"양변에 x를 더하고 1을 빼."
			],
			[
				"x의 값은?",
				"2",
				"4",
				"-2",
				"4÷2=2야."
			],
			[
				"y와 교점은?",
				"y=3, (2,3)",
				"y=2, (3,2)",
				"y=7, (2,7)",
				"x=2를 y=x+1에 넣어."
			]
		], [
			{
				q: "y=2x, y=-x+6의 교점을 구하시오.",
				a: "2,4"
			},
			{
				q: "y=x-2, y=-2x+4의 교점을 구하시오.",
				a: "2,0"
			},
			{
				q: "y=3x+1, y=x+5의 교점을 구하시오.",
				a: "2,7"
			}
		])
	}
];
var warehouse = expandTermToSeven(expandTermToSeven(expandTermToSeven(expandTermToSeven([...warehouseBeforeGrade2Semester1, ...grade2Semester1Seed], "중2 · 1학기", 9), "중2 · 2학기", 10), "중3 · 1학기", 9), "중3 · 2학기", 9);
var importedPdfItems = [
	[
		"1번",
		"그래프의 대칭과 계수 비교",
		"ㄱ, ㄷ",
		"그림 포함"
	],
	[
		"2번",
		"x축 대칭과 지나는 점",
		"3",
		"텍스트형"
	],
	[
		"3번",
		"이차함수의 증가와 감소",
		"(1) ㄱ,ㄹ (2) ㄴ,ㄷ (3) ㄴ,ㄷ (4) ㄱ,ㄹ",
		"복합형"
	],
	[
		"4번",
		"꼭짓점으로 그래프 고르기",
		"②",
		"그림 선택형"
	],
	[
		"5번",
		"x축 방향 평행이동",
		"2, 8",
		"텍스트형"
	],
	[
		"6번",
		"평행이동·꼭짓점·축",
		"4개 소문항",
		"복합형"
	],
	[
		"7번",
		"축과 두 점으로 식 구하기",
		"④",
		"그림 포함"
	],
	[
		"8번",
		"절편으로 이차함수 식 구하기",
		"y=-(1/5)x²+(6/5)x-1",
		"그림 포함"
	]
];
var managedClasses = [
	"1-1",
	"1-2",
	"1-3",
	"1-4",
	"2-1",
	"2-2",
	"2-3",
	"3-1",
	"3-2",
	"3-3",
	"3-4"
];
var rosterStorageKey = "oedong-class-roster";
function TeacherRosterManager({ activeStudent, studentSaved, xp, minor }) {
	const [selectedClass, setSelectedClass] = (0, import_react.useState)("1-1");
	const [roster, setRoster] = (0, import_react.useState)([]);
	const [manualNumber, setManualNumber] = (0, import_react.useState)("");
	const [manualName, setManualName] = (0, import_react.useState)("");
	const [excelText, setExcelText] = (0, import_react.useState)("");
	const [rosterNotice, setRosterNotice] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		const saved = localStorage.getItem(rosterStorageKey);
		if (saved) try {
			setRoster(JSON.parse(saved));
		} catch {
			setRoster([]);
		}
	}, []);
	(0, import_react.useEffect)(() => {
		if (!studentSaved || !activeStudent.classNo || !activeStudent.number || !activeStudent.name) return;
		const classId = `${activeStudent.grade}-${activeStudent.classNo}`;
		if (!managedClasses.includes(classId)) return;
		setRoster((items) => {
			const id = `${classId}-${activeStudent.number}`;
			const next = items.some((x) => x.id === id) ? items.map((x) => x.id === id ? {
				...x,
				name: activeStudent.name,
				xp,
				lastUnit: minor,
				lastActive: (/* @__PURE__ */ new Date()).toLocaleString("ko-KR", {
					month: "numeric",
					day: "numeric",
					hour: "2-digit",
					minute: "2-digit"
				})
			} : x) : items;
			localStorage.setItem(rosterStorageKey, JSON.stringify(next));
			return next;
		});
	}, [
		studentSaved,
		activeStudent.grade,
		activeStudent.classNo,
		activeStudent.number,
		activeStudent.name,
		xp,
		minor
	]);
	const saveRoster = (next) => {
		setRoster(next);
		localStorage.setItem(rosterStorageKey, JSON.stringify(next));
	};
	const upsertStudents = (students) => {
		let next = [...roster];
		for (const student of students) {
			const id = `${selectedClass}-${student.number}`, found = next.findIndex((x) => x.id === id);
			if (found >= 0) next[found] = {
				...next[found],
				name: student.name
			};
			else next.push({
				id,
				classId: selectedClass,
				number: student.number,
				name: student.name,
				xp: 0,
				lastUnit: "아직 훈련하지 않음",
				lastActive: "-"
			});
		}
		saveRoster(next);
		setRosterNotice(`${selectedClass}반에 ${students.length}명 등록 완료`);
	};
	const addManual = () => {
		const number = Number(manualNumber), name = manualName.trim();
		if (!number || number < 1 || number > 40 || !name) {
			setRosterNotice("번호와 이름을 정확히 입력해 주세요.");
			return;
		}
		upsertStudents([{
			number,
			name
		}]);
		setManualNumber("");
		setManualName("");
	};
	const importExcel = () => {
		const used = /* @__PURE__ */ new Set();
		const parsed = excelText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line, index) => {
			const cells = line.split(/\t|,|\s{2,}/).map((x) => x.trim()).filter(Boolean);
			let number = Number(cells[0]), name = "";
			if (Number.isFinite(number) && cells.length > 1) name = cells.slice(1).join(" ");
			else {
				number = index + 1;
				name = cells.join(" ");
			}
			while (used.has(number)) number++;
			used.add(number);
			return {
				number,
				name
			};
		}).filter((x) => x.name && x.number > 0 && x.number <= 40);
		if (!parsed.length) {
			setRosterNotice("엑셀에서 번호와 이름 열을 복사해 붙여 넣어 주세요.");
			return;
		}
		upsertStudents(parsed);
		setExcelText("");
	};
	const classRoster = roster.filter((x) => x.classId === selectedClass).sort((a, b) => a.number - b.number);
	const trainedCount = classRoster.filter((x) => x.xp > 0).length;
	const selectedGrade = selectedClass.split("-")[0];
	const classOptions = managedClasses.filter((classId) => classId.startsWith(`${selectedGrade}-`));
	const deleteWholeClass = () => {
		if (!classRoster.length) {
			setRosterNotice(`${selectedClass}반에 삭제할 학생이 없습니다.`);
			return;
		}
		if (window.confirm(`${selectedClass}반 학생 ${classRoster.length}명을 모두 삭제할까요?`)) {
			saveRoster(roster.filter((x) => x.classId !== selectedClass));
			setRosterNotice(`${selectedClass}반 학생 전체 삭제 완료`);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "classRosterManager",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rosterHero",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "eyebrow",
						children: "학급별 학생 관리"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "외동중학교 수학 훈련 학급 현황" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "학급 명부를 등록하고, 수업 중 학생별 훈련 단원과 활동을 확인합니다." })
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rosterSummary",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: roster.length }), "전체 등록"] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: classRoster.length }),
							selectedClass,
							" 학생"
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: trainedCount }), "훈련 참여"] })
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "classDropdowns",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["학년", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						value: selectedGrade,
						onChange: (e) => {
							const first = managedClasses.find((classId) => classId.startsWith(`${e.target.value}-`));
							if (first) setSelectedClass(first);
							setRosterNotice("");
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "1",
								children: "1학년"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "2",
								children: "2학년"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "3",
								children: "3학년"
							})
						]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["반", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						value: selectedClass,
						onChange: (e) => {
							setSelectedClass(e.target.value);
							setRosterNotice("");
						},
						children: classOptions.map((classId) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
							value: classId,
							children: [classId.split("-")[1], "반"]
						}, classId))
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "deleteWholeClass",
						onClick: deleteWholeClass,
						children: "이 반 학생 전체 삭제"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rosterEntryGrid",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "manualRoster",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "한 명씩 수동 등록" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["번호", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "number",
							min: "1",
							max: "40",
							value: manualNumber,
							onChange: (e) => setManualNumber(e.target.value),
							placeholder: "번호"
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["이름", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: manualName,
							onChange: (e) => setManualName(e.target.value),
							onKeyDown: (e) => e.key === "Enter" && addManual(),
							placeholder: "학생 이름"
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: addManual,
							children: "학생 등록"
						})
					] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "excelRoster",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "엑셀에서 한 반 한꺼번에 등록" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
							"엑셀의 ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "번호·이름" }),
							" 두 열을 복사하여 아래 칸에 붙여 넣으세요."
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							value: excelText,
							onChange: (e) => setExcelText(e.target.value),
							placeholder: "1	김학생\n2	이학생\n3	박학생"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: importExcel,
							children: "붙여 넣은 명단 자동 등록"
						})
					]
				})]
			}),
			rosterNotice && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rosterNotice",
				children: rosterNotice
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "classActivityHead",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", { children: [selectedClass, "반 학생 활동"] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "현재 반 학생의 훈련 참여 여부와 마지막 학습 단원을 확인합니다." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
					trainedCount,
					"/",
					classRoster.length,
					"명 참여"
				] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rosterTableWrap",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "rosterTable",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "번호" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "이름" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "현재 훈련 단원" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "XP" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "최근 활동" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "상태" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "관리" })
					] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: classRoster.length ? classRoster.map((student) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: student.number }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: student.name }) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: student.lastUnit }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: student.xp }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: student.lastActive }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: student.xp > 0 ? "activeStudent" : "waitingStudent",
							children: student.xp > 0 ? "훈련 참여" : "시작 전"
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => saveRoster(roster.filter((x) => x.id !== student.id)),
							children: "삭제"
						}) })
					] }, student.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
						colSpan: 7,
						className: "emptyRoster",
						children: [selectedClass, "반 학생을 수동으로 등록하거나 엑셀 명단을 붙여 넣어 주세요."]
					}) }) })]
				})
			})
		]
	});
}
var problemAuditStorageKey = "oedong-problem-audit-overrides";
function TeacherProblemAudit() {
	const [overrides, setOverrides] = (0, import_react.useState)({});
	const [filterTerm, setFilterTerm] = (0, import_react.useState)("중1 · 1학기");
	const [auditIndex, setAuditIndex] = (0, import_react.useState)(0);
	const [editQuestion, setEditQuestion] = (0, import_react.useState)("");
	const visibleItems = warehouse.map((item, index) => ({
		item,
		index,
		key: String(index)
	})).filter(({ item, key }) => {
		const over = overrides[key];
		return !over?.deleted && (over?.term ?? item.term) === filterTerm;
	});
	const selected = visibleItems[Math.min(auditIndex, Math.max(0, visibleItems.length - 1))];
	const selectedOverride = selected ? overrides[selected.key] ?? {} : {};
	const selectedItem = selected ? {
		...selected.item,
		...selectedOverride,
		problem: {
			...selected.item.problem,
			question: {
				...selected.item.problem.question,
				한국어: selectedOverride.question ?? selected.item.problem.question.한국어
			}
		}
	} : null;
	const [moveTerm, setMoveTerm] = (0, import_react.useState)(filterTerm);
	const [moveMajor, setMoveMajor] = (0, import_react.useState)(Object.keys(curriculum[filterTerm])[0]);
	const [moveMiddle, setMoveMiddle] = (0, import_react.useState)(Object.keys(curriculum[filterTerm][Object.keys(curriculum[filterTerm])[0]])[0]);
	const [moveMinor, setMoveMinor] = (0, import_react.useState)(curriculum[filterTerm][Object.keys(curriculum[filterTerm])[0]][Object.keys(curriculum[filterTerm][Object.keys(curriculum[filterTerm])[0]])[0]][0]);
	const persistOverrides = (next) => {
		setOverrides(next);
		localStorage.setItem(problemAuditStorageKey, JSON.stringify(next));
		window.dispatchEvent(new Event("oedong-problems-changed"));
	};
	(0, import_react.useEffect)(() => {
		const saved = localStorage.getItem(problemAuditStorageKey);
		if (saved) try {
			setOverrides(JSON.parse(saved));
		} catch {
			setOverrides({});
		}
	}, []);
	(0, import_react.useEffect)(() => {
		if (!selectedItem) return;
		setEditQuestion(selectedItem.problem.question.한국어);
		setMoveTerm(selectedItem.term);
		setMoveMajor(selectedItem.major);
		setMoveMiddle(selectedItem.middle);
		setMoveMinor(selectedItem.minor);
	}, [
		selected?.key,
		selectedOverride.question,
		selectedOverride.term,
		selectedOverride.major,
		selectedOverride.middle,
		selectedOverride.minor
	]);
	const changeMoveTerm = (term) => {
		const major = Object.keys(curriculum[term])[0], middle = Object.keys(curriculum[term][major])[0];
		setMoveTerm(term);
		setMoveMajor(major);
		setMoveMiddle(middle);
		setMoveMinor(curriculum[term][major][middle][0]);
	};
	const saveQuestion = () => {
		if (!selected || !editQuestion.trim()) return;
		persistOverrides({
			...overrides,
			[selected.key]: {
				...overrides[selected.key],
				question: editQuestion.trim()
			}
		});
	};
	const saveMove = () => {
		if (!selected) return;
		persistOverrides({
			...overrides,
			[selected.key]: {
				...overrides[selected.key],
				term: moveTerm,
				major: moveMajor,
				middle: moveMiddle,
				minor: moveMinor
			}
		});
		setFilterTerm(moveTerm);
		setAuditIndex(0);
	};
	const deleteProblem = () => {
		if (!selected || !window.confirm("이 문제를 학생 훈련에서 삭제할까요?")) return;
		persistOverrides({
			...overrides,
			[selected.key]: {
				...overrides[selected.key],
				deleted: true
			}
		});
		setAuditIndex((index) => Math.max(0, index - 1));
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "problemAudit",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "auditHead",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "eyebrow",
					children: "교사 전용 빠른 검수"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "학생 훈련 문제 빠르게 확인" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "문제를 앞뒤로 넘겨 보며 잘못된 학년·단원과 문장을 바로 고칩니다." })
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["검수할 학년·학기", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
				value: filterTerm,
				onChange: (e) => {
					setFilterTerm(e.target.value);
					setAuditIndex(0);
				},
				children: Object.keys(curriculum).map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: x }, x))
			})] })]
		}), selectedItem ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "auditNavigator",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						disabled: auditIndex === 0,
						onClick: () => setAuditIndex((i) => Math.max(0, i - 1)),
						children: "← 이전 문제"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
						auditIndex + 1,
						" / ",
						visibleItems.length
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						disabled: auditIndex >= visibleItems.length - 1,
						onClick: () => setAuditIndex((i) => Math.min(visibleItems.length - 1, i + 1)),
						children: "다음 문제 →"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "auditProblemPreview",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
					selectedItem.term,
					" › ",
					selectedItem.major,
					" › ",
					selectedItem.middle,
					" › ",
					selectedItem.minor
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: selectedItem.problem.title })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: formattedMathText(selectedItem.problem.question.한국어) })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "auditEditGrid",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "문제 문장 수정" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						value: editQuestion,
						onChange: (e) => setEditQuestion(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "auditSave",
						onClick: saveQuestion,
						children: "수정 내용 저장"
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "학년·단원 이동" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "auditSelectors",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["학년·학기", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								value: moveTerm,
								onChange: (e) => changeMoveTerm(e.target.value),
								children: Object.keys(curriculum).map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: x }, x))
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["대단원", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								value: moveMajor,
								onChange: (e) => {
									const major = e.target.value, middle = Object.keys(curriculum[moveTerm][major])[0];
									setMoveMajor(major);
									setMoveMiddle(middle);
									setMoveMinor(curriculum[moveTerm][major][middle][0]);
								},
								children: Object.keys(curriculum[moveTerm]).map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: x }, x))
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["중단원", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								value: moveMiddle,
								onChange: (e) => {
									setMoveMiddle(e.target.value);
									setMoveMinor(curriculum[moveTerm][moveMajor][e.target.value][0]);
								},
								children: Object.keys(curriculum[moveTerm][moveMajor] ?? {}).map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: x }, x))
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["소단원", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								value: moveMinor,
								onChange: (e) => setMoveMinor(e.target.value),
								children: (curriculum[moveTerm][moveMajor]?.[moveMiddle] ?? []).map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: x }, x))
							})] })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "auditMove",
						onClick: saveMove,
						children: "선택한 단원으로 이동"
					})
				] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "auditDanger",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "잘못 등록되어 사용하지 않을 문제라면 삭제할 수 있습니다." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: deleteProblem,
					children: "이 문제 삭제"
				})]
			})
		] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "studioEmpty",
			children: "이 학기에 검수할 문제가 없습니다."
		})]
	});
}
function TeacherWorkspace({ activeStudent, studentSaved, xp, minor }) {
	const [workspaceTab, setWorkspaceTab] = (0, import_react.useState)("audit");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
		className: "teacherWorkspaceTabs",
		"aria-label": "교사 작업실 메뉴",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: workspaceTab === "audit" ? "active" : "",
				onClick: () => setWorkspaceTab("audit"),
				children: "문제 빠른 검수·수정"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: workspaceTab === "problem" ? "active" : "",
				onClick: () => setWorkspaceTab("problem"),
				children: "문제 등록·보관함·조각 제작"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: workspaceTab === "students" ? "active" : "",
				onClick: () => setWorkspaceTab("students"),
				children: "학생·학급 관리"
			})
		]
	}), workspaceTab === "audit" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TeacherProblemAudit, {}) : workspaceTab === "problem" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TeacherProblemStudioPro, { curriculum }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TeacherRosterManager, {
		activeStudent,
		studentSaved,
		xp,
		minor
	})] });
}
function Home() {
	const [lang, setLang] = (0, import_react.useState)("한국어"), [term, setTerm] = (0, import_react.useState)("중1 · 1학기"), [major, setMajor] = (0, import_react.useState)("3. 문자와 식"), [middle, setMiddle] = (0, import_react.useState)("일차방정식"), [minor, setMinor] = (0, import_react.useState)("일차방정식의 풀이와 활용");
	const [selectionComplete, setSelectionComplete] = (0, import_react.useState)(false);
	const [problemIndex, setProblemIndex] = (0, import_react.useState)(0), [answer, setAnswer] = (0, import_react.useState)(""), [result, setResult] = (0, import_react.useState)("idle"), [showPieces, setShowPieces] = (0, import_react.useState)(false), [pieceIndex, setPieceIndex] = (0, import_react.useState)(0), [pieceChoice, setPieceChoiceRaw] = (0, import_react.useState)(null), [practiceAnswers, setPracticeAnswers] = (0, import_react.useState)([
		"",
		"",
		""
	]), [mode, setMode] = (0, import_react.useState)("student"), [upload, setUpload] = (0, import_react.useState)("1개 파일 · 중함수수학 3h_문제해설.pdf"), [analyzed, setAnalyzed] = (0, import_react.useState)(true), [teacherStep, setTeacherStep] = (0, import_react.useState)(6), [importedIndex, setImportedIndex] = (0, import_react.useState)(1);
	const [xp, setXp] = (0, import_react.useState)(0), [hearts, setHearts] = (0, import_react.useState)(3), [combo, setCombo] = (0, import_react.useState)(0), [gameNotice, setGameNotice] = (0, import_react.useState)("첫 조각을 깨고 별을 모아 보자!");
	const [retryAnswer, setRetryAnswer] = (0, import_react.useState)(""), [retryResult, setRetryResult] = (0, import_react.useState)("idle");
	const [piecesComplete, setPiecesComplete] = (0, import_react.useState)(false);
	const [uploadedMounted, setUploadedMounted] = (0, import_react.useState)(true), [teacherUnlocked, setTeacherUnlocked] = (0, import_react.useState)(false), [passwordInput, setPasswordInput] = (0, import_react.useState)(""), [passwordError, setPasswordError] = (0, import_react.useState)(""), [teacherPassword, setTeacherPassword] = (0, import_react.useState)("6673"), [newPassword, setNewPassword] = (0, import_react.useState)("");
	const [teacherPieces, setTeacherPieces] = (0, import_react.useState)(uploadedQuadraticProblem.pieces);
	const [studentInfo, setStudentInfo] = (0, import_react.useState)({
		grade: "1",
		classNo: "",
		number: "",
		name: ""
	});
	const [studentSaved, setStudentSaved] = (0, import_react.useState)(false);
	const [studentNotice, setStudentNotice] = (0, import_react.useState)("");
	const [inviteQrOpen, setInviteQrOpen] = (0, import_react.useState)(false);
	const [inviteQrSize, setInviteQrSize] = (0, import_react.useState)(240);
	const [inviteUrl, setInviteUrl] = (0, import_react.useState)("");
	const [problemAuditOverrides, setProblemAuditOverrides] = (0, import_react.useState)({});
	const teacherUploadedProblem = {
		...uploadedQuadraticProblem,
		pieces: teacherPieces
	};
	const effectiveWarehouse = warehouse.map((item, index) => {
		const over = problemAuditOverrides[String(index)] ?? {};
		return over.deleted ? null : {
			...item,
			term: over.term ?? item.term,
			major: over.major ?? item.major,
			middle: over.middle ?? item.middle,
			minor: over.minor ?? item.minor,
			problem: over.question ? {
				...item.problem,
				question: {
					...item.problem.question,
					한국어: over.question
				}
			} : item.problem
		};
	}).filter((item) => Boolean(item));
	const matchingBank = effectiveWarehouse.filter((x) => x.term === term && x.major === major && x.middle === middle && x.minor === minor);
	const reviewedBank = matchingBank.filter((x) => x.problem.title.includes("단원 마무리") || x.problem.title.includes("교과서 대단원 학습평가") || x.problem.title.includes("교과서 중단원 학습점검"));
	const selectedBank = [...reviewedBank, ...matchingBank.filter((x) => !reviewedBank.includes(x))].filter((item, index, all) => all.findIndex((other) => other.problem.question.한국어 === item.problem.question.한국어) === index).map((x) => x.problem);
	const isUploadedUnit = term === "중3 · 1학기" && major === "4. 이차함수" && middle === "이차함수와 그래프" && minor === "y=ax²의 그래프";
	const activeProblems = [...selectedBank, ...uploadedMounted && isUploadedUnit ? [teacherUploadedProblem] : []];
	const fileRef = (0, import_react.useRef)(null);
	const p = activeProblems[Math.min(problemIndex, activeProblems.length - 1)];
	const text = ui[lang];
	const allPracticeCorrect = p.practice.length > 0 && p.practice.every((x, i) => normalizeAnswer(practiceAnswers[i] ?? "") === normalizeAnswer(x.a));
	const hasNextType = problemIndex + 1 < activeProblems.length;
	const termCounts = Object.keys(curriculum).map((t) => ({
		term: t,
		count: effectiveWarehouse.filter((x) => x.term === t).length + (t === "중3 · 1학기" && uploadedMounted ? 1 : 0)
	}));
	const trainingRate = Math.min(100, Math.round(xp / 3));
	(0, import_react.useEffect)(() => {
		const saved = localStorage.getItem("oedong-teacher-password");
		if (saved) setTeacherPassword(saved);
		const mounted = localStorage.getItem("oedong-uploaded-mounted");
		if (mounted !== null) setUploadedMounted(mounted === "true");
		const learner = localStorage.getItem("oedong-student-info");
		if (learner) {
			setStudentInfo(JSON.parse(learner));
			setStudentSaved(true);
		}
		const loadAudit = () => {
			const value = localStorage.getItem(problemAuditStorageKey);
			if (value) try {
				setProblemAuditOverrides(JSON.parse(value));
			} catch {
				setProblemAuditOverrides({});
			}
			else setProblemAuditOverrides({});
		};
		loadAudit();
		window.addEventListener("oedong-problems-changed", loadAudit);
		setInviteUrl(window.location.origin);
		return () => window.removeEventListener("oedong-problems-changed", loadAudit);
	}, []);
	const majors = Object.keys(curriculum[term]);
	const middles = Object.keys(curriculum[term][major] ?? {});
	const minors = curriculum[term][major]?.[middle] ?? [];
	function changeTerm(v) {
		const ma = Object.keys(curriculum[v])[0], mi = Object.keys(curriculum[v][ma])[0], grade = v.match(/중([123])/)?.[1];
		setSelectionComplete(false);
		setTerm(v);
		setMajor(ma);
		setMiddle(mi);
		setMinor(curriculum[v][ma][mi][0]);
		if (grade) {
			setStudentInfo((info) => ({
				...info,
				grade
			}));
			setStudentSaved(false);
		}
		resetProblem(0);
	}
	function changeMajor(v) {
		const mi = Object.keys(curriculum[term][v])[0];
		setSelectionComplete(false);
		setMajor(v);
		setMiddle(mi);
		setMinor(curriculum[term][v][mi][0]);
		resetProblem(0);
	}
	function completeSelection() {
		setSelectionComplete(true);
		requestAnimationFrame(() => window.scrollTo({
			top: 0,
			behavior: "auto"
		}));
	}
	function resetProblem(next) {
		setProblemIndex(next);
		setAnswer("");
		setResult("idle");
		setShowPieces(false);
		setPieceIndex(0);
		setPieceChoice(null);
		setPiecesComplete(false);
		setRetryAnswer("");
		setRetryResult("idle");
		setPracticeAnswers([
			"",
			"",
			""
		]);
	}
	function openTeacher() {
		if (teacherUnlocked) {
			setMode("teacher");
			return;
		}
		setPasswordInput("");
		setPasswordError("");
		setMode("teacher");
	}
	function loginTeacher() {
		if (passwordInput === teacherPassword) {
			setTeacherUnlocked(true);
			setPasswordError("");
		} else setPasswordError("비밀번호가 맞지 않습니다.");
	}
	function changePassword() {
		if (!/^\d{4,12}$/.test(newPassword)) {
			setPasswordError("새 비밀번호를 숫자 4~12자리로 입력하세요.");
			return;
		}
		localStorage.setItem("oedong-teacher-password", newPassword);
		setTeacherPassword(newPassword);
		setNewPassword("");
		setPasswordError("");
	}
	function deleteUploaded() {
		setUploadedMounted(false);
		localStorage.setItem("oedong-uploaded-mounted", "false");
		if (problemIndex >= problems.length) resetProblem(0);
	}
	function mountUploaded() {
		setUploadedMounted(true);
		localStorage.setItem("oedong-uploaded-mounted", "true");
		setTerm("중3 · 1학기");
		setMajor("4. 이차함수");
		setMiddle("이차함수와 그래프");
		setMinor("y=ax²의 그래프");
		setTeacherStep(8);
	}
	function approveUploaded() {
		setUploadedMounted(true);
		localStorage.setItem("oedong-uploaded-mounted", "true");
		setTeacherStep(8);
		setGameNotice("교사가 확인한 문제가 학생 문제창에 탑재됐어요.");
	}
	function editTeacherPiece(i) {
		const piece = teacherPieces[i];
		const q = window.prompt("조각 질문을 수정하세요.", piece.q);
		if (q === null) return;
		const a = window.prompt("정답 선택지를 수정하세요.", piece.options[piece.answer]);
		if (a === null) return;
		setTeacherPieces((items) => items.map((x, n) => n === i ? {
			...x,
			q,
			options: x.options.map((v, k) => k === x.answer ? a : v)
		} : x));
	}
	function deleteTeacherPiece(i) {
		if (window.confirm(`${i + 1}번 조각을 삭제할까요?`)) setTeacherPieces((items) => items.filter((_, n) => n !== i));
	}
	function addTeacherPiece(afterIndex) {
		const q = window.prompt(`${afterIndex + 1}번 조각 다음에 넣을 질문을 입력하세요.`);
		if (!q) return;
		const next = {
			tag: "TEACHER",
			q,
			options: [
				window.prompt("정답 선택지를 입력하세요.") ?? "",
				window.prompt("오답 선택지 1을 입력하세요.") ?? "다른 값",
				window.prompt("오답 선택지 2를 입력하세요.") ?? "잘 모르겠어요"
			],
			answer: 0,
			talk: "본문제의 조건과 방금 고른 계산을 연결해서 천천히 말해 보자."
		};
		setTeacherPieces((items) => [
			...items.slice(0, afterIndex + 1),
			next,
			...items.slice(afterIndex + 1)
		]);
	}
	function goToStart() {
		setSelectionComplete(false);
		setShowPieces(false);
		setPiecesComplete(false);
		setRetryResult("idle");
		requestAnimationFrame(() => window.scrollTo({
			top: 0,
			behavior: "auto"
		}));
	}
	function saveStudent() {
		const missing = [
			!studentInfo.classNo && "반",
			!studentInfo.number && "번호",
			!studentInfo.name.trim() && "이름"
		].filter(Boolean);
		if (missing.length) {
			setStudentNotice(`${missing.join("·")}을 입력해 주세요.`);
			return;
		}
		localStorage.setItem("oedong-student-info", JSON.stringify(studentInfo));
		setStudentSaved(true);
		setStudentNotice(`${studentInfo.grade}학년 ${studentInfo.classNo}반 ${studentInfo.number}번 ${studentInfo.name} 학생 확인 완료!`);
	}
	function check() {
		if (normalizeAnswer(answer) === normalizeAnswer(p.answer)) {
			if (result === "idle") {
				setXp((x) => x + 20);
				setCombo((c) => c + 1);
				setGameNotice("정답! ⭐ 20 XP 획득");
			}
			setResult("right");
		} else {
			if (result === "idle") {
				setHearts((h) => Math.max(0, h - 1));
				setCombo(0);
				setGameNotice("괜찮아! 조각 퀘스트로 다시 도전");
			}
			setResult("wrong");
			setShowPieces(true);
		}
	}
	function setPieceChoice(choice) {
		if (choice === null) {
			setPieceChoiceRaw(null);
			return;
		}
		if (pieceChoice === currentPiece.answer) return;
		const firstTry = pieceChoice === null;
		setPieceChoiceRaw(choice);
		if (choice === currentPiece.answer) {
			setXp((x) => x + 10);
			setCombo((c) => c + 1);
			setGameNotice(`조각 ${pieceIndex + 1} 클리어! ⭐ 10 XP`);
		} else if (firstTry) {
			setHearts((h) => Math.max(0, h - 1));
			setCombo(0);
			setGameNotice("힌트 발견! 하트는 줄어도 배움은 남아");
		}
	}
	function checkRetry() {
		if (normalizeAnswer(retryAnswer) === normalizeAnswer(p.answer)) {
			if (retryResult !== "right") {
				setXp((x) => x + 30);
				setCombo((c) => c + 1);
				setGameNotice("본문제 재도전 성공! ⭐ 30 XP");
			}
			setRetryResult("right");
			requestAnimationFrame(() => document.getElementById("types")?.scrollIntoView({ behavior: "smooth" }));
		} else {
			setRetryResult("wrong");
			setGameNotice("거의 다 왔어! 조각을 떠올려 다시 계산해 보자");
		}
	}
	const rawCurrentPiece = p.pieces[pieceIndex];
	const optionCount = rawCurrentPiece.options.length;
	const optionShift = (pieceIndex + problemIndex) % optionCount;
	const optionOrder = Array.from({ length: optionCount }, (_, i) => (i - optionShift + optionCount) % optionCount);
	const currentPiece = {
		...rawCurrentPiece,
		options: optionOrder.map((i) => rawCurrentPiece.options[i]),
		answer: optionOrder.indexOf(rawCurrentPiece.answer)
	};
	(0, import_react.useEffect)(() => {
		if (!showPieces) return;
		const actions = document.querySelector(".pieceTrainer .actions");
		if (!actions) return;
		actions.querySelector(".prevPieceBtn")?.remove();
		const previous = document.createElement("button");
		previous.type = "button";
		previous.className = "prevPieceBtn";
		previous.textContent = "← 이전 조각";
		previous.disabled = pieceIndex === 0;
		previous.setAttribute("aria-label", "직전 조각으로 돌아가기");
		previous.onclick = () => {
			setPieceIndex((i) => Math.max(0, i - 1));
			setPieceChoiceRaw(null);
		};
		actions.insertBefore(previous, actions.lastElementChild);
		return () => previous.remove();
	}, [
		showPieces,
		pieceIndex,
		pieceChoice,
		p.title
	]);
	(0, import_react.useEffect)(() => {
		if (mode !== "teacher" || !teacherUnlocked) return;
		const host = document.createElement("div");
		host.className = "teacherRosterHost";
		document.querySelector("main")?.insertBefore(host, document.querySelector(".teacherPage"));
		const root = (0, import_client.createRoot)(host);
		root.render(/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TeacherWorkspace, {
			activeStudent: studentInfo,
			studentSaved,
			xp,
			minor
		}));
		return () => {
			setTimeout(() => root.unmount(), 0);
			host.remove();
		};
	}, [
		mode,
		teacherUnlocked,
		studentSaved,
		studentInfo.grade,
		studentInfo.classNo,
		studentInfo.number,
		studentInfo.name,
		xp,
		minor
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "topbar",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
					className: "brand",
					href: "#top",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "외동중학교 수학 훈련 프로그램" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", {
						className: "brandMotto",
						children: "수학 공부는 반복 반복으로 구구단이 될 때 까지~"
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {
						className: "yrBrandMark",
						"aria-label": "YR",
						children: "YR"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
					className: "modeSwitch",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: mode === "student" ? "active" : "",
						onClick: () => setMode("student"),
						children: "학생 훈련"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: mode === "teacher" ? "active" : "",
						onClick: openTeacher,
						children: "교사 작업실 🔒"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "headerTools",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "language",
						children: ["🌐 ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							value: lang,
							onChange: (e) => setLang(e.target.value),
							children: langs.map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: x }, x))
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "inviteQrButton",
						onClick: () => setInviteQrOpen(true),
						"aria-haspopup": "dialog",
						children: "▦ 초대 QR"
					})]
				})
			]
		}),
		inviteQrOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "qrOverlay",
			role: "presentation",
			onMouseDown: (e) => {
				if (e.target === e.currentTarget) setInviteQrOpen(false);
			},
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "qrDialog",
				role: "dialog",
				"aria-modal": "true",
				"aria-labelledby": "invite-qr-title",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "qrClose",
						onClick: () => setInviteQrOpen(false),
						"aria-label": "학생 초대 QR 닫기",
						children: "×"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "eyebrow",
						children: "학생 바로 초대"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						id: "invite-qr-title",
						children: "외동중 수학 훈련 프로그램"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "학생이 휴대전화 카메라로 QR 코드를 찍으면 이 화면으로 바로 들어옵니다." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "qrImageFrame",
						style: {
							width: inviteQrSize,
							height: inviteQrSize
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: `https://api.qrserver.com/v1/create-qr-code/?size=${inviteQrSize}x${inviteQrSize}&margin=8&data=${encodeURIComponent(inviteUrl)}`,
							width: inviteQrSize,
							height: inviteQrSize,
							alt: `학생 초대 주소 ${inviteUrl} QR 코드`
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "qrSizeControls",
						"aria-label": "QR 코드 크기 조절",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setInviteQrSize((size) => Math.max(160, size - 40)),
								disabled: inviteQrSize <= 160,
								children: "− 축소"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [inviteQrSize, "px"] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setInviteQrSize((size) => Math.min(400, size + 40)),
								disabled: inviteQrSize >= 400,
								children: "＋ 확대"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: inviteUrl }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "qrDone",
						onClick: () => setInviteQrOpen(false),
						children: "QR 닫기"
					})
				]
			})
		}),
		mode === "student" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			id: "top",
			className: `pageShell ${selectionComplete ? "trainingFocus" : "selectionOnly"}`,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "curriculum",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "eyebrow",
						children: "훈련 범위 선택"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "내가 도전할 단원" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "challengeMessage",
						children: "내가 도전하는 이유는 꿈을 이루기 위해. 아자~!"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "studentIdentity",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "studentIdentityHead",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "학생 정보" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: studentSaved ? `✓ ${studentInfo.name} 학생` : "훈련할 학생을 알려주세요" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "studentFields",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["학년", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										value: studentInfo.grade,
										onChange: (e) => {
											setStudentInfo({
												...studentInfo,
												grade: e.target.value
											});
											setStudentSaved(false);
										},
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "1" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "2" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "3" })
										]
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["반", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										value: studentInfo.classNo,
										onChange: (e) => {
											setStudentInfo({
												...studentInfo,
												classNo: e.target.value
											});
											setStudentSaved(false);
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "",
											children: "선택"
										}), [
											1,
											2,
											3,
											4,
											5
										].map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
											value: n,
											children: [n, "반"]
										}, n))]
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["번호", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										value: studentInfo.number,
										onChange: (e) => {
											setStudentInfo({
												...studentInfo,
												number: e.target.value
											});
											setStudentSaved(false);
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "",
											children: "선택"
										}), Array.from({ length: 30 }, (_, i) => i + 1).map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
											value: n,
											children: [n, "번"]
										}, n))]
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "studentName",
										children: ["이름", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											value: studentInfo.name,
											onChange: (e) => {
												setStudentInfo({
													...studentInfo,
													name: e.target.value
												});
												setStudentSaved(false);
											}
										})]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: saveStudent,
								children: studentSaved ? "학생 정보 저장 완료" : "학생 정보 저장"
							}),
							studentNotice && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: `studentNotice ${studentSaved ? "ok" : "warn"}`,
								children: studentNotice
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["학년·학기", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						value: term,
						onChange: (e) => changeTerm(e.target.value),
						children: Object.keys(curriculum).map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: x }, x))
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["대단원", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						value: major,
						onChange: (e) => changeMajor(e.target.value),
						children: majors.map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: x }, x))
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["중단원", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						value: middle,
						onChange: (e) => {
							setMiddle(e.target.value);
							setMinor(curriculum[term][major][e.target.value][0]);
							resetProblem(0);
						},
						children: middles.map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: x }, x))
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["소단원", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						value: minor,
						onChange: (e) => {
							setMinor(e.target.value);
							resetProblem(0);
						},
						children: minors.map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: x }, x))
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "completeSelection",
						onClick: completeSelection,
						children: "선택 완료 · 훈련 시작 →"
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "workspace",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "backToSelection",
						onClick: goToStart,
						children: "← 다른 단원 선택"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "gameHud",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "levelBadge",
								children: ["LV.", Math.floor(xp / 100) + 1]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "xpBar",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { width: `${xp % 100}%` } }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [xp, " XP"] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "hearts",
								"aria-label": `남은 하트 ${hearts}개`,
								children: [
									0,
									1,
									2
								].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {
									className: i < hearts ? "alive" : "lost",
									children: "♥"
								}, i))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "combo",
								children: [
									"🔥 ",
									combo,
									" 연속"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: gameNotice })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "progress compact fourSteps",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "done",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "1" }), "혼자 풀기"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: showPieces ? "done" : "",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "2" }), "조각 훈련"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: retryResult === "right" ? "done" : "",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "3" }), "다시 혼자 풀기"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: retryResult === "right" ? "done" : "",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "4" }), "다시 풀기"]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "originalProblem stickyProblem",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "problemHead",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: mathVars(p.title) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									problemIndex + 1,
									" / ",
									activeProblems.length
								] })]
							}),
							bilingualQuestion(p.question, lang),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProblemDiagram, { problem: p })
						]
					}),
					!showPieces && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "questionCard soloCard",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "miniLabel",
								children: "STEP 1 · 혼자 도전"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: text.solve }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "subjective",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SplitAnswerFields, {
									value: answer,
									expected: p.answer,
									placeholder: text.placeholder,
									onChange: (v) => {
										setAnswer(v);
										setResult("idle");
									}
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: check,
									disabled: !answer,
									children: text.check
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								className: "helpBig",
								onClick: () => {
									setShowPieces(true);
									setResult("wrong");
								},
								children: ["💡 ", text.help]
							}),
							result !== "idle" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: `resultBox ${result}`,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: result === "right" ? "✓" : "↗" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: result === "right" ? text.right : text.wrong }),
									result === "right" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										onClick: () => resetProblem((problemIndex + 1) % activeProblems.length),
										children: [text.next, " →"]
									})
								]
							})
						]
					}),
					showPieces && !piecesComplete && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "questionCard pieceTrainer",
						children: [
							/소인수/.test(p.title) && (() => {
								const match = p.question.한국어.match(/^\\s*(10|84)\\b/);
								return match ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FactorTreeVisual, { number: Number(match[1]) }) : null;
							})(),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "pieceTop",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "miniLabel",
									children: ["STEP 2 · ", text.pieces]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", { children: [
									pieceIndex + 1,
									"번째 조각 ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["/ ", p.pieces.length] })
								] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "pieceDots",
									children: p.pieces.map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: i <= pieceIndex ? "on" : "" }, i))
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "pieceTag",
								children: currentPiece.tag
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: mathVars(currentPiece.q) }),
							completeTranslation(currentPiece.q, lang) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "pieceTranslation",
								children: mathVars(completeTranslation(currentPiece.q, lang))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "choices",
								children: currentPiece.options.map((x, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									className: pieceChoice === i ? i === currentPiece.answer ? "correct" : "wrong" : "",
									onClick: () => setPieceChoice(i),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: i + 1 }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "choiceTexts",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: mathVars(x) }), completeTranslation(x, lang) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: mathVars(completeTranslation(x, lang)) })]
									})]
								}, x))
							}),
							pieceChoice !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "teacherHint",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "선생님 💬" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "hintTexts",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: mathVars(currentPiece.talk) }), completeTranslation(currentPiece.talk, lang) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: mathVars(completeTranslation(currentPiece.talk, lang)) })]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "actions",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "actionMessage",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: pieceChoice === currentPiece.answer ? "좋아, 이 조각을 이해했어요!" : "천천히 골라도 괜찮아요." }), completeTranslation(pieceChoice === currentPiece.answer ? "좋아, 이 조각을 이해했어요!" : "천천히 골라도 괜찮아요.", lang) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: completeTranslation(pieceChoice === currentPiece.answer ? "좋아, 이 조각을 이해했어요!" : "천천히 골라도 괜찮아요.", lang) })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "nextBtn",
									disabled: pieceChoice !== currentPiece.answer,
									onClick: () => {
										if (pieceIndex < p.pieces.length - 1) {
											setPieceIndex(pieceIndex + 1);
											setPieceChoice(null);
										} else setPiecesComplete(true);
									},
									children: lang === "한국어" ? pieceIndex < p.pieces.length - 1 ? "다음 조각 →" : "다시 풀기 →" : translatedMathText(pieceIndex < p.pieces.length - 1 ? "다음 조각" : "다시 풀기", lang) + " →"
								})]
							})
						]
					}),
					piecesComplete && retryResult !== "right" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						id: "practice",
						className: "questionCard retryCard",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "miniLabel",
								children: "STEP 3 · 다시 혼자 풀기"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "왼쪽 본문제를 보고 다시 도전!" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "subjective",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SplitAnswerFields, {
									value: retryAnswer,
									expected: p.answer,
									placeholder: "이번에는 혼자 답을 입력하세요",
									onChange: (v) => {
										setRetryAnswer(v);
										setRetryResult("idle");
									}
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: checkRetry,
									disabled: !retryAnswer,
									children: "확인"
								})]
							}),
							retryResult === "wrong" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "resultBox wrong",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "↗" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "조각에서 했던 계산 순서를 떠올려 보세요." })]
							})
						]
					}),
					retryResult === "right" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						id: "types",
						className: "questionCard practiceCard",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "miniLabel",
								children: ["STEP 4 · ", text.practice]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "다시 풀기 · 같은 유형 3문제" }),
							p.practice.map((x, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "practiceRow",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "num",
										children: i + 1
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: mathVars(x.q) }), completeTranslation(x.q, lang) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: mathVars(completeTranslation(x.q, lang)) })] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SplitAnswerFields, {
										value: practiceAnswers[i],
										expected: x.a,
										placeholder: "답",
										onChange: (v) => {
											const a = [...practiceAnswers];
											a[i] = v;
											setPracticeAnswers(a);
										}
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: practiceAnswers[i] && (normalizeAnswer(practiceAnswers[i]) === normalizeAnswer(x.a) ? "✓" : "다시") })
								]
							}, x.q)),
							allPracticeCorrect && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "practiceFinish",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "세 문제를 모두 풀었어요! 🎉" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: hasNextType ? "다음 시험 유형에 도전하거나 다른 단원을 선택하세요." : "이 단원의 준비된 문제를 모두 풀었어요. 다른 단원을 선택해 보세요." })] }),
									hasNextType && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => resetProblem(problemIndex + 1),
										children: "다음 유형 풀기 →"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "homeChoice",
										onClick: goToStart,
										children: "처음으로 · 다른 단원 선택"
									})
								]
							})
						]
					})
				]
			})]
		}) : !teacherUnlocked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "teacherLock",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "lockCard",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "🔒" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "eyebrow",
						children: "교사 전용"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "교사 작업실 비밀번호" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "학생 문제의 등록·삭제와 배포를 보호합니다." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						autoFocus: true,
						type: "password",
						inputMode: "numeric",
						value: passwordInput,
						onChange: (e) => setPasswordInput(e.target.value),
						onKeyDown: (e) => e.key === "Enter" && loginTeacher(),
						placeholder: "비밀번호 입력"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: loginTeacher,
						children: "작업실 열기"
					}),
					passwordError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: passwordError }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "backStudent",
						onClick: () => setMode("student"),
						children: "학생 화면으로 돌아가기"
					})
				]
			})
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "teacherPage",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "teacherIntro",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "eyebrow",
							children: "교사 작업실"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", { children: [
							"외동중학교 수학",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
							"훈련 통계 자료"
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "파일을 올린 다음 무엇이 처리되고, 교사가 어디서 확인하는지 한 단계씩 보여드립니다." })
					] })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "teacherBankSummary",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "eyebrow",
						children: "준비된 대표문제"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
						"현재 창고 ",
						warehouse.length + (uploadedMounted ? 1 : 0),
						"개"
					] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "termCountGrid",
						children: termCounts.map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: x.term }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("em", { children: [x.count, "개"] })] }, x.term))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "trainingStats",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "statsHead",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "eyebrow",
							children: "학생 훈련 현황"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "누가 얼마나 훈련했는지 한눈에 보기" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "statsNumbers",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: studentSaved ? 1 : 0 }), "등록 학생"] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: xp }), "획득 XP"] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: combo }), "연속 정답"] })
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "statsBody",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "donutBox",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "trainingDonut",
								style: { background: `conic-gradient(#255be3 0 ${trainingRate}%, #e7ebf2 ${trainingRate}% 100%)` },
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [trainingRate, "%"] }), "훈련 진행"] })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "현재 등록 학생의 훈련 진행률" })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "studentTableWrap",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
								className: "studentTrainingTable",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "학생" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "학년·반·번호" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "훈련 단원" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "XP" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "상태" })
								] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: studentSaved ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: studentInfo.name }) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [
										studentInfo.grade,
										"학년 ",
										studentInfo.classNo,
										"반 ",
										studentInfo.number,
										"번"
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: minor }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: xp }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "trainingState",
										children: xp > 0 ? "훈련 중" : "시작 전"
									}) })
								] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									colSpan: 5,
									className: "emptyTraining",
									children: "학생 화면에서 학년·반·번호·이름을 저장하면 여기에 표시됩니다."
								}) }) })]
							})
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "teacherSecurity",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "교사 비밀번호 변경" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "현재 비밀번호는 화면에 표시하지 않습니다." })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "password",
							inputMode: "numeric",
							value: newPassword,
							onChange: (e) => setNewPassword(e.target.value),
							placeholder: "새 숫자 비밀번호"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: changePassword,
							children: "변경"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "lockAgain",
							onClick: () => {
								setTeacherUnlocked(false);
								setMode("student");
							},
							children: "작업실 잠그기"
						}),
						passwordError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", { children: passwordError })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "classificationPanel",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "eyebrow",
								children: "문제 분류 확인"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "자동 분류가 어려우면 교사가 직접 선택" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "현재 선택 위치에 다음 업로드 문제를 탑재합니다." })
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["학년·학기", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							value: term,
							onChange: (e) => changeTerm(e.target.value),
							children: Object.keys(curriculum).map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: x }, x))
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["대단원", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							value: major,
							onChange: (e) => changeMajor(e.target.value),
							children: majors.map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: x }, x))
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["중단원", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							value: middle,
							onChange: (e) => {
								setMiddle(e.target.value);
								setMinor(curriculum[term][major][e.target.value][0]);
								resetProblem(0);
							},
							children: middles.map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: x }, x))
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["소단원", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							value: minor,
							onChange: (e) => {
								setMinor(e.target.value);
								resetProblem(0);
							},
							children: minors.map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: x }, x))
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "classificationResult",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "분류 경로" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								term,
								" › ",
								major,
								" › ",
								middle,
								" › ",
								minor
							] })]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "teacherFlow",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flowTitle",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "eyebrow",
							children: "문제 등록 처리 흐름"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "PDF 한 개가 학생 문제로 바뀌는 8단계" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flowStatus",
							children: [
								"현재 ",
								teacherStep,
								"단계"
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flowRail",
						children: [
							"파일 등록",
							"문제 읽기",
							"문항 분리",
							"단원 판별",
							"원문 확인",
							"조각 생성",
							"교사 검토",
							"학생 배포"
						].map((x, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							className: i + 1 <= teacherStep ? "done" : "",
							onClick: () => setTeacherStep(i + 1),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: i + 1 < teacherStep ? "✓" : i + 1 }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: x }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: [
									"PDF·사진·직접 입력",
									"글자·수식·그림 추출",
									"문제별로 나누기",
									"학년·학기·단원 연결",
									"오탈자와 정답 확인",
									"WHAT·HOW·WHY 6개+",
									"교사가 수정·승인",
									"반·학생에게 공개"
								][i] })
							]
						}, x))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "teacherGrid",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "uploadCard",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "1. 문제 파일 등록" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "현재 시제품에서는 파일 선택과 처리 흐름을 확인합니다. 실제 PDF 내용 분석은 저장 기능을 연결한 뒤 작동합니다." }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								ref: fileRef,
								type: "file",
								accept: "application/pdf,image/*",
								multiple: true,
								hidden: true,
								onChange: (e) => {
									const fs = e.target.files;
									setUpload(fs?.length ? `${fs.length}개 파일 · ${fs[0].name}` : "");
									setAnalyzed(false);
									setTeacherStep(1);
								}
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								className: "dropZone",
								onClick: () => fileRef.current?.click(),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: upload || "PDF 또는 문제 사진 선택" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "여러 파일 동시 선택 가능" })]
							}),
							upload && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "uploadStatus",
								children: "✓ 파일 준비 완료 · 아직 분석 전"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "or",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "또는 직접 입력" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", { placeholder: "문제 원문을 여기에 붙여 넣으세요." }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "analyzeBtn",
								disabled: !upload,
								onClick: () => {
									setAnalyzed(true);
									setTeacherStep(6);
								},
								children: upload ? "문제 읽고 6조각 만들기 →" : "먼저 파일을 선택하세요"
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "previewCard pdfResult",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "previewTop",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: analyzed ? "PDF 분석 결과" : "처리 전 안내" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: analyzed ? "8문항 분리 완료" : "파일 대기" })]
							}),
							!analyzed ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "파일을 선택한 다음" }), [
								"페이지에서 문제와 그림을 찾습니다.",
								"각 문제를 한 문항씩 분리합니다.",
								"학년·학기·대단원·중단원을 추천합니다.",
								"원문과 정답을 교사가 먼저 확인합니다.",
								"승인된 문제만 조각과 유사문제를 만듭니다."
							].map((x, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "previewStep",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: i + 1 }), x]
							}, x))] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "중함수수학 3h · 문제/해설" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "autoTags",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "3쪽" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "중3" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "1학기" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "이차함수" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "문제 8개" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "해설 8개" })
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "importedList",
									children: importedPdfItems.map((x, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										className: i === importedIndex ? "selected" : "",
										onClick: () => setImportedIndex(i),
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: x[0] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: x[1] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: x[3] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("em", { children: ["답 ", x[2]] })
										]
									}, `${x[0]}-${i}`))
								}),
								importedIndex === 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "chunkReview",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "reviewHeader",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
												"2번 문항 · ",
												teacherPieces.length,
												"조각 검토"
											] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "그림 없이 처리 가능" })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "previewOriginal",
											children: "이차함수 y=ax²의 그래프와 x축에 서로 대칭인 그래프가 점 (3, -27)을 지날 때, 상수 a의 값을 구하시오."
										}),
										teacherPieces.map((x, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "importedPiece",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: i + 1 }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
													x.tag,
													" · ",
													x.q
												] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: ["기대 답: ", x.options[x.answer]] })] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "pieceEditActions",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
															onClick: () => editTeacherPiece(i),
															children: "수정"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
															className: "deletePiece",
															onClick: () => deleteTeacherPiece(i),
															children: "삭제"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
															className: "insertPiece",
															onClick: () => addTeacherPiece(i),
															children: "다음에 추가"
														})
													]
												})
											]
										}, `${x.tag}-${i}`)),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "teacherTalk",
											children: "선생님 힌트 💬 “x축에 대칭이면 위아래가 뒤집혀. 식에서는 y값의 부호가 바뀐다고 생각해 보자.”"
										})
									]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "selectionGuide",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
											importedPdfItems[importedIndex][0],
											" · ",
											importedPdfItems[importedIndex][1]
										] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [importedPdfItems[importedIndex][3], " 문항입니다. 그래프가 있는 문항은 그림 영역을 원문과 함께 유지한 뒤 조각을 생성합니다."] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => setImportedIndex(1),
											children: "완성된 2번 조각 보기"
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "reviewActions unifiedPublish",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: approveUploaded,
										children: "조각 완성·탑재"
									})
								})
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "languageLoad",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "처리 원칙" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "원문과 그림은 그대로 보존하고, 학생에게 제시하는 조각·힌트·유사문제는 학습 목적에 맞춰 새로 작성합니다." })]
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mountedProblem warehouseStatus",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "eyebrow",
							children: "준비된 대표문제 창고"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", { children: [
							"전 소단원 ",
							warehouse.length,
							"개 · 대표문제 ",
							warehouse.length,
							"개 준비"
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
							"각 대표문제마다 ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "문제 접근 조각 5개 이상 + 다시 풀기 3문제" }),
							"가 연결되어 있습니다."
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "termCountGrid",
							children: termCounts.map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: x.term }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("em", { children: [x.count, "개"] })] }, x.term))
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
						className: "mounted",
						children: "● 전 소단원 탑재 완료"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mountedProblem",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "eyebrow",
								children: "교사 업로드 문제 상태"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "중3 · 1학기 · 이차함수와 그래프" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "업로드 문항 02" }), " · y=ax² 그래프의 x축 대칭 · 6조각 · 유형문제 3개"] })
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
							className: uploadedMounted ? "mounted" : "deleted",
							children: uploadedMounted ? "● 학생 화면에 탑재됨" : "○ 삭제됨"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mountActions",
							children: uploadedMounted ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => {
									setMode("student");
									setTerm("중3 · 1학기");
									setMajor("4. 이차함수");
									setMiddle("이차함수와 그래프");
									setMinor("y=ax²의 그래프");
									resetProblem(1);
								},
								children: "학생 문제 확인"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "deleteProblem",
								onClick: deleteUploaded,
								children: "탑재 문제 삭제"
							})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: mountUploaded,
								children: "다시 탑재하기"
							})
						})
					]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "외동중 수학 훈련 프로그램 · 혼자 도전하고, 필요할 때 함께" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "교육과정 기반 창작 문항" })] })
	] });
}
//#endregion
export { Home as default };
