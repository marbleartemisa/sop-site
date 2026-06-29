const API_URL = "https://script.google.com/macros/s/AKfycbzVLUTOzA0gGIfKml7kWBAWIjSE6g473aBDmFCg-cN2UzSG2-VnKElingOTgCSdeIumfg/exec";

/*==================================================
  POST
==================================================*/
export async function post(data) {

  const response = await fetch(API_URL, {

    method: "POST",
    mode: "no-cors", // 🔥 FIX TEMPORAL CORS

    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify(data)

  });

  return response; // no JSON disponible en no-cors
}
