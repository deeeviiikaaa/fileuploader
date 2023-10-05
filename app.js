const express = require("express"); //Web Module
const multer = require("multer");
const path = require("path");
const fs = require("fs"); //File System
const { EventEmitter } = require("events");

//Using Express
const app = express();
const port = 3000;

//Uing Event Emmitter
const myEmitter = new EventEmitter();

//Serving static files from public directory
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

//Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage });

//POST request for file upload
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file chosen."); //Callback
  }

  const filePath = path.join(__dirname, "uploads", req.file.filename);
  const readStream = fs.createReadStream(filePath); //Stream and potentially Buffer

  res.setHeader("Content-Type", req.file.mimetype);
  res.setHeader(
    "Content-Disposition",
    `inline; filename="${req.file.originalname}"`
  );

  //BUffer
  readStream.on("data", (chunk) => {
    console.log(`Read ${chunk.length} bytes into the buffer.`);
  });

  readStream.pipe(res); //Stream

  myEmitter.emit("file-uploaded", req.file.originalname);
});

//Start Express server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

//Event Listener
myEmitter.on("file-uploaded", (filename) => {
  console.log(`File "${filename}" was successfully uploaded.`);
});
