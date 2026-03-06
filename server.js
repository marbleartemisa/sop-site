const express = require("express");
const multer = require("multer");
const { google } = require("googleapis");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

// Configuración Google Drive
const KEYFILEPATH = "service_account.json"; // sube este archivo a tu proyecto
const SCOPES = ["https://www.googleapis.com/auth/drive"];
const auth = new google.auth.GoogleAuth({ keyFile: KEYFILEPATH, scopes: SCOPES });
const drive = google.drive({ version: "v3", auth });
const FOLDER_ID = "1peMrF4tP3D_pgaccbcWRg6oMuTnfcheW"; // carpeta compartida

app.post("/upload", upload.array("archivos"), async (req, res) => {
  try {
    const links = [];
    for (let file of req.files) {
      const response = await drive.files.create({
        requestBody: { name: file.originalname, parents: [FOLDER_ID] },
        media: { mimeType: file.mimetype, body: Buffer.from(file.buffer) },
        fields: "id,name",
      });

      await drive.permissions.create({
        fileId: response.data.id,
        requestBody: { role: "reader", type: "anyone" },
      });

      links.push({ name: response.data.name, link: `https://drive.google.com/uc?id=${response.data.id}&export=download` });
    }
    res.json({ success: true, links });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Puerto dinámico para producción
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));