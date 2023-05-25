import { createElement, useEffect, useState } from "react";
import * as XLSX from 'xlsx/xlsx.mjs';

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
    },
    columLevelErrorMsg:{
      isAvailable:false,
      errorMsg:[]
  }
}
export default function useXlsxValidator({initialDataArray,startingEditableColumnNum, uniqColumNum}){
    const [validationMsg, setValidationMsg] = useState(initialValidationMsg);
    const [xlsxAoa, setXlsxAoa] = useState([]);
    // const [utility, setUtility] = useState({startingEditableColumnNum, uniqColumNum, tableDivId});
    const [tableElement,setTableElement]=useState(<table></table>);
    const [isProcessing, setIsProcessing] = useState(false);
    const [uniqColumnValues, setUniqColumnValues] = useState([]);
    const regexInvalidchar = new RegExp('[$^<>`]','gm')
    useEffect(()=>{
      populateTable(initialDataArray, false);
      console.log("uniqColumnValues"+uniqColumnValues)
    },[]);

    async function setFile(file){
        const aoaData = await validateXlsx(file);
        if(aoaData.length<=0) return; 
        populateTable(aoaData, true);
        setIsProcessing(false);
    }

    async function validateXlsx(file){
        console.log(file);
        return new Promise((resolve, reject)=>{
            if(!file || !(file && ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","application/vnd.ms-excel"].includes(file.type))){
              console.log("file not found");
              setValidationMsg((prev)=>{return {...prev,validFileMsg:{errorMsg:'Valid file not found',isvalid:false}}});
              resolve([]);
            } else if(file.size>(6*1024*1024)){ // max file size 6 MB
              console.log(file.size);
              console.log("file Size exceded");
              setValidationMsg((prev)=>{return {...prev,validFileMsg:{errorMsg:'File Size exceded 6 MB',isvalid:false}}});
              resolve([]);
            }else{
                setIsProcessing(true);
                var reader = new FileReader();
                reader.readAsArrayBuffer(file);
                reader.onload = function(e){
                  var data = e.target.result;
                  console.log(data);
                  const wb = XLSX.read(data);
                  console.log(wb);
                  const jsonData = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[1]],{header:1});
                  console.log(jsonData);
                  if(jsonData.length <=1){
                    setValidationMsg((prev)=>{return {...prev,validFileMsg:{errorMsg:'Uploaded File is Blank',isvalid:false}}});
                    setIsProcessing(false);
                    resolve([]);
                  }
                  if(jsonData.length >(uniqColumnValues.length+1)){
                    setValidationMsg((prev)=>{return {...prev,validFileMsg:{errorMsg:'uploade faild more than 275 row found',isvalid:false}}});
                    setIsProcessing(false);
                    resolve([]);
                  }
                  for(var colNum=0;colNum<startingEditableColumnNum;colNum++){
                    if(xlsxAoa[0][colNum].toLowerCase()!==jsonData[0][colNum].toLowerCase()){
                      setValidationMsg((prev)=>{return {...prev,validFileMsg:{errorMsg:'File can not be uploaded as column name is not as per template',isvalid:false}}});
                      setIsProcessing(false);
                      resolve([]);
                    }
                  }
                  for(var colNum=startingEditableColumnNum;colNum<jsonData[0].length;colNum++){
                    var level = 1;
                    if(jsonData[0][colNum].trim().toLowerCase()!=='external system level '+level){
                      setValidationMsg((prev)=>{return {...prev,validFileMsg:{errorMsg:'File can not be uploaded as column sequensce is not as per template',isvalid:false}}});
                      setIsProcessing(false);
                      // resolve([]);
                    }
                    level++;
                  }
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
                  setValidationMsg((prev)=>{
                      return {...prev,validFileMsg:{
                                                errorMsg:'uploade faild with error '+e.target.error.name, 
                                                isvalid:false
                                              }}
                    });
                  setIsProcessing(false);
                  reject(e.target.error.name);
                }
            }
            
        })
      }

      function populateTable(aoaData, isUploaded){
        // var table = document.createElement('table');
        var tableNode = [];
        var isMaliciousAvailable = true;
        var aoa = [aoaData[0]];
        var alreadyAvailableArtifact = [];
        //while loading the add artifact table
        if(aoaData[0].length===2 && !isUploaded){
          aoa[0].push("External System Level 1");
        }

        // creating hedder element
        // var thead = document.createElement('thead');
        var theadNode = []; 
        // var tr = document.createElement('tr');
        var trNode = [];
        aoa[0].forEach((value,index)=>{
          // let th = document.createElement('th');
          // th.append(value);
          // th.setAttribute('row',0);
          // th.setAttribute('col',index);
          // tr.append(th);
          trNode.push(createElement('th',{'row':0,'col':index},value));
        });
        theadNode.push(createElement('tr',null,trNode));        
        // thead.append(tr);
        // table.append(thead);
        tableNode.push(createElement('thead',null,theadNode))

        // var tbody = document.createElement('tbody');
        var tbodyNode = [];
        aoaData.forEach((a,rowNum)=> {
            if(rowNum===0)return;
            // let trow = document.createElement('tr');
            // trow.id = a[uniqColumNum].trim().replace(" ","_");
            let trowNode = [];

            let row = [];
            if(isUploaded){
              if(!a[uniqColumNum] || a[uniqColumNum].trim()===""){
                setValidationMsg((prev)=>{
                  // how to show this error msg
                  // prev.rowLevelErrorMsg.errorMsg.push([rowNum+1,"artifact name is missing"]);
                  return {...prev, rowLevelErrorMsg:{isAvailable:true,errorMsg:[ ...prev.rowLevelErrorMsg.errorMsg, [rowNum+1,"artifact name is missing"]]}}
                });
                return;
              }else if(!uniqColumnValues.includes(a[uniqColumNum].toLowerCase())){
                setValidationMsg((prev)=>{
                  // prev.rowLevelErrorMsg.errorMsg.push([a[uniqColumNum],"Invalid artifact name"]);
                  return {...prev, rowLevelErrorMsg:{isAvailable:true,errorMsg:[ ...prev.rowLevelErrorMsg.errorMsg, [a[uniqColumNum],"Invalid artifact name"]]}}
                });
                return;
              }else if(alreadyAvailableArtifact.includes(a[uniqColumNum].toLowerCase())){
                setValidationMsg((prev)=>{
                  // prev.rowLevelErrorMsg.errorMsg.push([a[uniqColumNum],"Dublicate artifact name"]);
                  return {...prev, rowLevelErrorMsg:{isAvailable:true,errorMsg:[ ...prev.rowLevelErrorMsg.errorMsg, [a[uniqColumNum],"Dublicate artifact name"]]}}
                });
                return;
              }else{
                alreadyAvailableArtifact.push(a[uniqColumNum].toLowerCase());
              }
            }else{
              setUniqColumnValues((prev)=> {prev.push(a[uniqColumNum].toLowerCase()); return prev});
            }
            if(a.length<=startingEditableColumnNum && a[uniqColumNum].toLowerCase()!=='miscellaneous')return;
            for(var colNum=0;colNum<startingEditableColumnNum;colNum++){
              if(isUploaded && colNum!==uniqColumNum && a[colNum] && a[colNum].trim()!=="" && regexInvalidchar.test(a[colNum])){
               //not sure what will be the error
               setValidationMsg((prev)=>{
                // prev.rowLevelErrorMsg.errorMsg.push([a[uniqColumNum],aoa[0][colNum]+" value has been changed"]);
                return {...prev, rowLevelErrorMsg:{isAvailable:true,errorMsg:[ ...prev.rowLevelErrorMsg.errorMsg, [a[uniqColumNum],aoa[0][colNum]+" value has been changed"]]}}
              });
              return;
              }

              row.push(a[colNum]); 
              // let td = document.createElement('td');
              // td.append(a[colNum]);
              // td.setAttribute('row',aoa.length);
              // td.setAttribute('col',colNum);
              // trow.append(td);
              trowNode.push(createElement('td',{'row':aoa.length, 'col':colNum},a[colNum]));
            }

            if(a[uniqColumNum].toLowerCase()==='miscellaneous' && a.length<=startingEditableColumnNum){
                // let td = document.createElement('td');
                // let input = document.createElement('input');
                // input.append("");
                // input.type = 'text';
                // td.append(input);
                // td.setAttribute('row',aoa.length);
                // td.setAttribute('col',a.length);
                // trow.append(td);
                if(isUploaded){
                  isMaliciousAvailable =false;
                  setValidationMsg((prev)=>{return {...prev,validFileMsg:{errorMsg:'Miscellaneous is mandatory',isvalid:false}}});
                  return;
                }
                trowNode.push(createElement('td',{'row':aoa.length, 'col':colNum},createElement('input',{type:'text'})));
            }


            for(var colNum=startingEditableColumnNum;colNum<a.length;colNum++){
              if(a[colNum] && a[colNum].trim()!==""){
                console.log(a[colNum]);
                row.push(a[colNum]);

                // let td = document.createElement('td');
                let tdNode = [];
                // let input = document.createElement('input');
                // input.append(a[colNum]);
                // // input.value = a[colNum];
                // input.type = 'text';
                // td.append(input);
                // td.setAttribute('row',aoa.length);
                // td.setAttribute('col',colNum);
                tdNode.push(createElement('input',{type:'text', 'row':aoa.length, 'col':colNum, value:a[colNum]}))        

                let error = validateValue(a[colNum]);
                if(error!==""){
                  setValidationMsg((prev)=>{
                    // prev.columLevelErrorMsg.isAvailable = true;
                    // prev.columLevelErrorMsg.errorMsg.push([a[uniqColumNum],error]);
                    return {...prev, columLevelErrorMsg:{isAvailable:true,errorMsg:[ ...prev.columLevelErrorMsg.errorMsg , [a[uniqColumNum],error]]}}
                  });
                  // let span = document.createElement('span');
                  // span.textContent = error;
                  // td.append(span);
                  tdNode.push(createElement('span',{},error));
                }
                // trow.append(td);
                trowNode.push(createElement('td',{'row':aoa.length, 'col':colNum},tdNode));
              }else{
                if(isUploaded && a[uniqColumNum].trim().toLowerCase()==='miscellaneous' && colNum===startingEditableColumnNum){
                  isMaliciousAvailable =false;
                  setValidationMsg((prev)=>{return {...prev,validFileMsg:{errorMsg:'Miscellaneous is mandatory',isvalid:false}}});
                }else if(isUploaded && (colNum+1)<a.length){
                  setValidationMsg((prev)=>{
                    // prev.rowLevelErrorMsg.errorMsg.push([a[uniqColumNum],'Mapping levels are missing']);
                    return {...prev, rowLevelErrorMsg:{isAvailable:true,errorMsg:[ ...prev.rowLevelErrorMsg.errorMsg, [a[uniqColumNum],'Mapping levels are missing']]}}
                  });
                }
                console.log("empty");
                return;
                // break;
              }
            }
            aoa.push(row);
            // tbody.append(trow);
            tbodyNode.push(createElement('tr',{id:a[uniqColumNum].trim().replace(/[ ]/g,"_")},trowNode));
          });

          if(isUploaded && !alreadyAvailableArtifact.includes('miscellaneous')){
            isMaliciousAvailable =false;
            setValidationMsg((prev)=>{return {...prev,validFileMsg:{errorMsg:'Miscellaneous is mandatory',isvalid:false}}});
          }
          if(!isMaliciousAvailable)return;
          console.log("aoa"+JSON.stringify(aoa))
          setXlsxAoa(aoa);
          if(isUploaded){
            setValidationMsg((prev)=>{
              const processed = aoa.length;
              const unprocessed = aoaData.length-processed;
              return {...prev,processingMsg:{processedRowNum:processed, unProcessedRowNum:unprocessed}}
            });
          } 
          // table.append(tbody);
          tableNode.push(createElement('tbody',null,tbodyNode));
          // console.log(table);
          console.log(validationMsg);
          setTableElement(createElement('table',null,tableNode));
          
      }


      function validateValue(value){
        var errorMsg = "";
        if(value.length>50){
          errorMsg="Maximum 50 Character allowed";
        }else if(regexInvalidchar.test(value)){
          errorMsg="Special Charecters $`<>^ not allowed";
        }
        return errorMsg;
      }


    return [validationMsg, xlsxAoa, isProcessing, tableElement, uniqColumnValues, setXlsxAoa, setFile]
}


