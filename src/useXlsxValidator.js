import { useState } from "react";
const initialValidationMsg = {
    validFileMsg:{
        isvalid:true,
        errorMsg:""
    },
    processingMsg:{
        processedRowNum:0,
        unProcessedRowNum:0
    },
    rowLevelErrorMsg:{
        isAvailable:false,
        errorMsg:[]
    }
}
export default function useXlsxValidator({uniqueColumnDataArray,startingEditableColumnName, uniqColumName, hedderArray, tableDivId}){
    const [validationMsg, setValidationMsg] = useState(initialValidationMsg);
    const [xlsxAoa, setXlsxAoa] = useState([hedderArray]);
    const [isProcessing, setIsProcessing] = useState(false);

    async function setFile(file){
        setIsProcessing(true);
        const aoaData = await validateXlsx(file);
        if(!validationMsg.validFileMsg.isvalid) return; 
        populateTable(aoaData);
        setIsProcessing(false);
    }

    async function validateXlsx(file){
        console.log(file);
        return new Promise((resolve, reject)=>{
            if(!file || !(file && ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","application/vnd.ms-excel"].includes(file.type))){
              console.log("file not found");
              setValidationMsg((prev)=>{return {...prev,errorMsg:'Valid file not found',isvalid:false}});
              resolve([]);
            } else if(file.size>(6*1024*1024)){ // max file size 6 MB
              console.log(file.size);
              console.log("file Size exceded");
              setValidationMsg((prev)=>{return {...prev,errorMsg:'File Size exceded 6 MB',isvalid:false}});
              resolve([]);
            }else{
                var reader = new FileReader();
                reader.readAsArrayBuffer(file);
                reader.onload = function(e){
                  var data = e.target.result;
                  console.log(data);
                  const wb = XLSX.read(data);
                  console.log(wb);
                  const jsonData = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{header:1});
                  console.log(jsonData);
                //   var container = document.getElementById("table");
                //   container.innerHTML = XLSX.utils.sheet_to_html(wb.Sheets[wb.SheetNames[0]],{id:"my-Table",editable:true});
                  // var ws = XLSX.utils.json_to_sheet([
                  //   { A:"S", B:"h", C:"e", D:"e", E:"t", F:"J", G:"S" },
                  //   { A: 1,  B: 2,  C: 3,  D: 4,  E: 5,  F: 6,  G: 7  },
                  //   { A: 2,  B: 3,  C: 4,  D: 5,  E: 6,  F: 7,  G: 8  }
                  // ], {header:["A","B","C","D","E","F","G"], skipHeader:true});
                  // var workbook = XLSX.utils.book_new();
                  // XLSX.utils.book_append_sheet(workbook,ws,"New Sheet");
                  // XLSX.writeFileXLSX(workbook,"newFile.xlsx",{Props:{Author:"System"}})
                  resolve(jsonData);
                }
                
                reader.onerror = function(e){
                  reject(e.target.error.name);
                }
            }
            
        })
      }

      function populateTable(aoaData){
        aoaData.forEach((a,rowNum)=> {
            for(var colNum=0;colNum<a.length;i++){
              if(a[colNum]){
                console.log(a[colNum]);
              }else{
                console.log("empty");
                break;
              }
            }
          });
      }


    return [validationMsg, xlsxAoa, isProcessing, setXlsxAoa, setFile]
}


