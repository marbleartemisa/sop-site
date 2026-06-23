export function createStore(initialState) {

    let state = initialState;
    let listeners = [];

    function getState() {
        return state;
    }

    function setState(partial) {
        state = {
            ...state,
            ...partial
        };

        notify();
    }

    function subscribe(fn) {
        listeners.push(fn);

        // inicial run
        fn(state);

        return () => {
            listeners = listeners.filter(l => l !== fn);
        };
    }

    function notify() {
        listeners.forEach(fn => fn(state));
    }

    return {
        getState,
        setState,
        subscribe
    };
}
