const config = require("./config");
var fs = require('fs');
var path = require('path');
var mongoose = require('mongoose');
var tmp = require('tmp');

var builder = require('xmlbuilder');
var archive = require("archiver");

function deepFind(obj, path) {
    var paths = path.split('.'),
        current = obj,
        i;

    for (i = 0; i < paths.length; ++i) {
        if (current[paths[i]] == undefined) {
            return undefined;
        } else {
            current = current[paths[i]];
        }
    }
    return current;
}

var createMetaFile = (tempFolder) => {
    var doc = builder.create("archive");
    var xml = doc.att("xmlns", "http://rs.tdwg.org/dwc/text/")
        // .att("metadata", "eml.xml")
        .ele("core")
        .att("encoding", "UTF-8")
        .att("fieldsTerminatedBy", "\\t")
        .att("linesTerminatedBy", "\\n")
        .att("fieldsEnclosedBy", "")
        .att("ignoreHeaderLines", "1")
        .att("rowType", "http://rs.tdwg.org/dwc/terms/Occurrence")
        .ele("files")
        .ele("location").text("occurrence.txt").up()
        .up()
        .ele("id").att("index", "0").up();
    let i = 1;
    var fieldList = config.getFieldList();
    for (var field in fieldList) {
        let fieldContent = fieldList[field];
        // console.log(fieldContent.term);
        if ((typeof (fieldContent) == "string" && fieldContent) ||
            (typeof (fieldContent) == "object" && fieldContent.term)) {
            xml = xml.ele("field")
                .att("index", i.toString())
            if (typeof (fieldContent) == "object") {

                xml.att("term", (fieldContent.prefix ? fieldContent.prefix : "http://rs.tdwg.org/dwc/terms/") + field);
                    // .att("type", fieldContent.type ? fieldContent.type : "xs:string");
            } else {
                xml.att("term", "http://rs.tdwg.org/dwc/terms/" + field);
            }
            xml = xml.up();
            i++;
        }
    }

    fs.writeFile(path.join(tempFolder, "meta.xml"), doc.toString({
        pretty: true
    }), (err) => {
        if (err)
            throw err;
        else
            console.log("create meta.xml file successfully!");

    })

}

createMetaFile(path.join(__dirname, "temp"));

var createEmlFile = function (tempFolder, options = {}) {
    var doc = builder.create("archive");
}

var createOccurrenceFile = (tempFolder, data) => {
    var writeStream = fs.createWriteStream(path.join(tempFolder, "occurrence.txt"), {
        flags: 'a+'
    });
    var headerList = ["_id"];
    let i = 1;
    var fieldList = config.getFieldList();
    for (var field in fieldList) {
        let fieldContent = fieldList[field];
        if (typeof (fieldContent) == "string" && fieldContent) {
            headerList.push(fieldContent);
        }
        if (typeof (fieldContent) == "object" && fieldContent.term) {
            headerList.push(fieldContent.term);
        }
    }
    writeStream.write(headerList.join("\t"));
    writeStream.write("\n");
    data.forEach(function (element) {
        let record = [];
        headerList.forEach((value) => {
            record.push(deepFind(element, value));
        })
        writeStream.write(record.join("\t"));
        writeStream.write("\n");
    });
    writeStream.end();
    console.log("create occurrence.txt file successfully!");
}

module.exports = function (res, model) {
    var createTmpFolder = new Promise((resolve, reject) => {
        tmp.dir((err, path) => {
            if (err) {
                reject(err);
            } else {
                resolve(path);
            }
        })
    });

    createTmpFolder
        .then((path) => {
            return new Promise((resolve, reject) => {
                var ObjectModel = mongoose.model(model);
                ObjectModel.find((err, data) => {
                    if (err)
                        reject(err);
                    else {
                        createMetaFile(path);
                        createOccurrenceFile(path, data);
                        resolve(path);
                    }
                })
            })
        })
        .then((path) => {
            var zip = archive("zip");
            zip.on('error', (err) => {
                throw err;
            });
            res.writeHead(200, {
                'Content-Type': 'application/zip',
                'Content-disposition': 'attachment; filename=DwCA.zip'
            });
            zip.pipe(res);
            return zip.directory(path, false).finalize();
        })
        .then(() => {
            console.log("Send DwCA file successfully!");
        })
        .catch((err) => {
            res.send("Có lỗi xảy ra!");
        })
}