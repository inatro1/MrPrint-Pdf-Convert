const fs = require('fs');
const CloudConvert = require('cloudconvert');
const axios = require('axios');
const FormData = require('form-data');

const cloudConvert = new CloudConvert({ apiKey: process.env.CLOUDCONVERT_API_KEY });

module.exports = {
  async convertPdfToDocx(inputFilePath, outputFilePath){
    // create job
    const job = await cloudConvert.jobs.create({
      "tasks": {
        "import-my-file": { "operation": "import/upload" },
        "convert-my-file": {
          "operation":"convert",
          "input":"import-my-file",
          "input_format":"pdf",
          "output_format":"docx"
        },
        "export-my-file": { "operation":"export/url", "input":"convert-my-file" }
      }
    });

    const importTask = job.tasks.find(t => t.name === 'import-my-file');
    const uploadTask = await cloudConvert.tasks.get(importTask.id);

    const uploadUrl = uploadTask.result.form.url;
    const params = uploadTask.result.form.parameters || {};

    const form = new FormData();
    Object.entries(params).forEach(([k,v]) => form.append(k,v));
    form.append('file', fs.createReadStream(inputFilePath));

    await axios.post(uploadUrl, form, { headers: form.getHeaders(), maxContentLength: Infinity, maxBodyLength: Infinity });

    const finished = await cloudConvert.jobs.wait(job.id);
    const exportTask = finished.tasks.find(t => t.name === 'export-my-file' && t.status === 'finished');
    const fileUrl = exportTask.result.files[0].url;

    const writer = fs.createWriteStream(outputFilePath);
    const response = await axios({ url: fileUrl, method: 'GET', responseType: 'stream' });
    response.data.pipe(writer);
    return new Promise((resolve,reject)=>{
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  }
};
