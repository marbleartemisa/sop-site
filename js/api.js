export async function post(action, data = {}) {

  const res = await fetch(API, {
    method: "POST",
    body: JSON.stringify({
      action,
      project: data   // 🔥 ESTE ES EL FIX CRÍTICO
    }),
    headers: {
      "Content-Type": "application/json"
    }
  });

  return await res.json();
}
