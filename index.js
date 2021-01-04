const express     = require('express');
const bodyParser  = require('body-parser');
const fs = require('fs');
const app = express();

const pdfcrowd = require('pdfcrowd');

app.use(bodyParser.json());

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log('Listening on port', port);
});

app.post('/', async (req, res) => {
  try {
    const file = {};
    file.name = 'input.html'
    file.bucket = 'Users/david/Documents/pdfcrowd-local-test/upload'
    file._newbucket = 'Users/david/Documents/pdfcrowd-local-test/processed'
    console.log("FILE: ", file)
    const buffer = await downloadFile(file.bucket, file.name);
    
    let on_pdf_done = async function(pdfFileName) {
        // await uploadFile(buffer, file._newbucket, pdfFileName);
        await deleteFile(file.bucket, file.name);

       res.set('Content-Type', 'text/plain');
       res.send('\n\nOK\n\n');
    };
    let on_pdf_fail = function(err) {
        console.log("ERROR: ", err)
        res.set('Content-Type', 'text/plain');
        res.send('\n\nERROR\n\n');
    };
    convertFile(file.name, on_pdf_done, on_pdf_fail);    
  }
  catch (ex) {
    console.log(`Error: ${ex}`);
  }
})

async function downloadFile(bucketName, fileName) {
    console.log("DOWNLOADING FILE=================",bucketName, fileName)
    let val
//   await storage.bucket(bucketName).file(fileName).download(options);
    val = await fs.promises.readFile(`/${bucketName}/${fileName}`)
    return val
}

function convertFile(fileName, success_callback, fail_callback) {
    // create the API client instance
    const _newPdfPath = `./processed/${fileName.replace(/\.\w+$/, '.pdf')}`
    console.log("NEW PATH: ", fileName,  fs.existsSync(`./upload/${fileName}`), _newPdfPath, `${fileName}`)
    const client = new pdfcrowd.HtmlToPdfClient("Ammonite", "803f41c1054938181af2127e2ff48457");
    // run the conversion and write the result to a file
    
    client.convertFileToFile(`./upload/${fileName}`, _newPdfPath, function (err, fileName) {
        if (err)
            return fail_callback(err);
        console.log("SUCCESS - new filepath ", fileName.replace(/\.\w+$/, '.pdf'))
        success_callback(fileName.replace(/\.\w+$/, '.pdf'));
    });
}

async function deleteFile(bucketName, fileName) {
    console.log("DELETING FROM:  ", `./upload/${fileName}`)
//   await storage.bucket(bucketName).file(fileName).delete();
        fs.unlink(`./upload/${fileName}`, (err) => {
            if (err) {
                console.error(err);
                return;
            }
        }
    )
}
