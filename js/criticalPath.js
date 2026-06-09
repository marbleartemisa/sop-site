export function calculateCriticalPath(tasks) {

  // build map
  const map = {};
  tasks.forEach(t => {
    map[t.Task] = {
      ...t,
      duration: diffHours(t.CalculatedStart, t.CalculatedEnd),
      deps: t.Dependency ? [t.Dependency] : []
    };
  });

  // compute early finish recursively
  const memo = {};

  function getEF(taskName) {
    if (memo[taskName]) return memo[taskName];

    const t = map[taskName];
    if (!t) return 0;

    let maxDep = 0;

    t.deps.forEach(dep => {
      maxDep = Math.max(maxDep, getEF(dep));
    });

    const ef = maxDep + t.duration;
    memo[taskName] = ef;

    return ef;
  }

  // find max path
  let max = 0;
  let endTask = null;

  Object.keys(map).forEach(name => {
    const val = getEF(name);
    if (val > max) {
      max = val;
      endTask = name;
    }
  });

  // rebuild path
  const critical = new Set();

  function trace(taskName) {
    const t = map[taskName];
    if (!t) return;

    critical.add(taskName);

    if (!t.deps.length) return;

    let best = null;
    let bestVal = -1;

    t.deps.forEach(dep => {
      const val = getEF(dep);
      if (val > bestVal) {
        bestVal = val;
        best = dep;
      }
    });

    if (best) trace(best);
  }

  if (endTask) trace(endTask);

  // mark tasks
  tasks.forEach(t => {
    t.isCritical = critical.has(t.Task);
  });

  return tasks;
}

function diffHours(start, end) {
  return (new Date(end) - new Date(start)) / (1000 * 60 * 60);
}
