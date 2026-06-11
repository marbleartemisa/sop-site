export const EventBus = {
  events: {},

  on(event, fn) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(fn);
  },

  emit(event, payload) {
    (this.events[event] || []).forEach(fn => fn(payload));
  }
};
