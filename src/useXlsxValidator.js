import { createElement, useEffect, useState } from "react";
import ReactDOM from 'react-dom/client';
import * as XLSX from 'xlsx/xlsx.mjs';
import TableComponent from "./TableComponent";
import TableDataComponent from './TableDataComponent';

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
    isUploadeable:false
}
String.prototype.format = function () {
  // store arguments in an array
  var args = arguments;
  // use replace to iterate over the string
  // select the match and check if the related argument is present
  // if yes, replace the match with the argument
  return this.replace(/{([0-9]+)}/g, function (match, index) {
    // check if the argument is present
    return typeof args[index] == 'undefined' ? match : args[index];
  });
};
const errorMassages = {
  fileFormate:"Only .XLS or .XLSX files can be uploaded",
  fileSize:"File size cannot be more than 6 MB",
  artifactCountLimit:"Uploaded file cannot have more than {0} records",
  blankFile:"Uploaded file is blank",
  columnSequence:"File cannot be uploaded as the column sequence is not as per the template",
  columnNames:"File cannot be uploaded as the column names are not as per the template",
  missingMappingLevel:"Mapping levels are missing",
  invalidArtifactName:"Invalid Artifact Name",
  dublicateArtifact:"Duplicate Artifact Name found",
  missingArtifactName:"Artifact Name is missing for one or more records.",
  specialCharacter:"Special characters $ ^ < > ` not allowed",
  maliciousMandatory:'"Miscellaneous" artifact mapping is mandatory',
  alreadyExists:"Same external system path already exists. Please provide a unique external system path",
  maxCharecter:"Maximum 50 characters allowed"
}
export default function useXlsxValidator({initialDataArray,startingEditableColumnNum, uniqColumNum,workSheetNum,edit,tableDivId}){
    const [validationMsg, setValidationMsg] = useState(initialValidationMsg);
    const [xlsxAoa, setXlsxAoa] = useState([]);
    // const [utility, setUtility] = useState({startingEditableColumnNum, uniqColumNum, tableDivId});
    const [editable,setEditable] = useState(edit);
    const [tableElement,setTableElement]=useState(<table></table>);
    const [isProcessing, setIsProcessing] = useState(false);
    const [uniqColumnValues, setUniqColumnValues] = useState([]);
    const [key, setKey] = useState(new Date());
    const regexInvalidchar = new RegExp('[$^<>`]');

    useEffect(()=>{
      setUniqColumnValues([])
      processRows(initialDataArray, false);
      console.log("uniqColumnValues "+uniqColumnValues)
      console.log("editable "+editable)
    },[editable]);

    async function setFile(file){
        setValidationMsg(initialValidationMsg);
        const aoaData = await validateXlsx(file);
        if(aoaData.length<=0) return; 
        processRows(aoaData, true);
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
                  const jsonData = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[workSheetNum]],{header:1,blankrows:false});
                  console.log(jsonData);
                  if(jsonData.length <=1){
                    setValidationMsg((prev)=>{return {...prev,validFileMsg:{errorMsg:'Uploaded File is Blank',isvalid:false}}});
                    setIsProcessing(false);
                    resolve([]);
                    return;
                  }
                  // console.log(jsonData.length+" "+(uniqColumnValues.length+1));
                  // console.log(JSON.stringify(uniqColumnValues))
                  if(jsonData.length >(uniqColumnValues.length+1)){
                    setValidationMsg((prev)=>{return {...prev,validFileMsg:{errorMsg:'uploade faild more than {0} row found'.format(uniqColumnValues.length),isvalid:false}}});
                    setIsProcessing(false);
                    resolve([]);
                    return;
                  }
                  for(var colNum=0;colNum<startingEditableColumnNum;colNum++){
                    if(xlsxAoa[0][colNum].toLowerCase()!==jsonData[0][colNum].toLowerCase()){
                      setValidationMsg((prev)=>{return {...prev,validFileMsg:{errorMsg:'File can not be uploaded as column name is not as per template',isvalid:false}}});
                      setIsProcessing(false);
                      resolve([]);
                      return;
                    }
                  }
                  var level = 1;
                  for(var colNum=startingEditableColumnNum;colNum<jsonData[0].length;colNum++){
                    // console.log(jsonData[0][colNum].trim().toLowerCase());
                    // console.log(`external system level ${level}`);
                    if(jsonData[0][colNum].trim().toLowerCase()!==`external system level ${level}`){
                      setValidationMsg((prev)=>{return {...prev,validFileMsg:{errorMsg:'File can not be uploaded as column sequensce is not as per template',isvalid:false}}});
                      setIsProcessing(false);
                      resolve([]);
                      return;
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

      function processRows(aoaData, isUploaded){
        // var table = document.createElement('table');
        // var tableNode = [];
        var isMaliciousAvailable = true;
        var aoa = [aoaData[0]];
        var alreadyAvailableArtifact = [];
        //while loading the add artifact table
        if(aoaData[0].length===2 && !isUploaded){
          aoa[0].push("External System Level 1");
        }

        // creating hedder element
        // var thead = document.createElement('thead');
        // var theadNode = []; 
        // var tr = document.createElement('tr');
        // var trNode = [];
        // aoa[0].forEach((value,index)=>{
        //   // let th = document.createElement('th');
        //   // th.append(value);
        //   // th.setAttribute('row',0);
        //   // th.setAttribute('col',index);
        //   // tr.append(th);
        //   trNode.push(createElement('th',{'row':0,'col':index},value));
        // });
        // theadNode.push(createElement('tr',null,trNode));        
        // thead.append(tr);
        // table.append(thead);
        // tableNode.push(createElement('thead',null,theadNode))

        // var tbody = document.createElement('tbody');
        // var tbodyNode = [];
        aoaData.forEach((a,rowNum)=> {
            if(rowNum===0)return;
            // let trow = document.createElement('tr');
            // trow.id = a[uniqColumNum].trim().replace(" ","_");
            // let trowNode = [];

            let row = [];
            if(isUploaded){
              if(!a[uniqColumNum] || a[uniqColumNum].trim()===""){
                setValidationMsg((prev)=>{
                  // how to show this error msg
                  // prev.rowLevelErrorMsg.errorMsg.push([rowNum+1,"artifact name is missing"]);
                  return {...prev, rowLevelErrorMsg:{isAvailable:true,errorMsg:[ ...prev.rowLevelErrorMsg.errorMsg, [rowNum+1,"artifact name is missing"]]}}
                });
                return;
              }else if(!uniqColumnValues.includes(a[uniqColumNum].trim().toLowerCase())){
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
              // console.log(a[uniqColumNum].toLowerCase()+" "+rowNum);
              setUniqColumnValues((prev)=> {return [ ...prev, a[uniqColumNum].trim().toLowerCase()]});
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
              // trowNode.push(createElement('td',{'row':aoa.length, 'col':colNum},a[colNum]));
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
                row.push("");
                // trowNode.push(createElement('td',{'row':aoa.length, 'col':colNum},createElement('input',{type:'text'})));
                // trowNode.push(<TableDataComponent rowNum={aoa.length} colNum={colNum} value="" mandatory={true} editable={editable} validateValue={validateValue}/>);
            }


            for(var colNum=startingEditableColumnNum;colNum<a.length;colNum++){
              if(a[colNum] && a[colNum].trim()!==""){
                console.log(a[colNum]);
                row.push(a[colNum]);

                // let td = document.createElement('td');
                // let tdNode = [];
                // let input = document.createElement('input');
                // input.append(a[colNum]);
                // // input.value = a[colNum];
                // input.type = 'text';
                // td.append(input);
                // td.setAttribute('row',aoa.length);
                // td.setAttribute('col',colNum);
                
                // tdNode.push(createElement('input',{type:'text', 'row':aoa.length, 'col':colNum, value:a[colNum]}))        

                // let error = validateValue(a[colNum]);
                // if(error!==""){
                //   setValidationMsg((prev)=>{
                //     prev.columLevelErrorMsg.isAvailable = true;
                //     prev.columLevelErrorMsg.errorMsg[a[uniqColumNum]+" "+colNum]=error;
                //     // return {...prev, columLevelErrorMsg:{isAvailable:true,errorMsg:{ [a[uniqColumNum]+" "+colNum]:error}}}
                //     return prev; 
                //   });
                //   // let span = document.createElement('span');
                //   // span.textContent = error;
                //   // td.append(span);
                // }
                // tdNode.push(<InputComponet rowNum={aoa.length} colNum={colNum} error={error} value={a[colNum]}/>)
                // trow.append(td);
                // trowNode.push(<TableDataComponent rowNum={aoa.length} colNum={colNum} value={a[colNum]} mandatory={a[uniqColumNum].toLowerCase()==='miscellaneous'} editable={editable} validateValue={validateValue}/>);
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
            // tbodyNode.push(createElement('tr',{id:a[uniqColumNum].trim().replace(/[ ]/g,"_")},trowNode));
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
              const processed = aoa.length-1;
              const unprocessed = (aoaData.length-1)-processed;
              return {...prev,processingMsg:{processedRowNum:processed, unProcessedRowNum:unprocessed}}
            });
          } 
          // table.append(tbody);
          // tableNode.push(createElement('tbody',{id:"artifact_map_table_body"},tbodyNode));
          // console.log(table);
          console.log(validationMsg);
          // setTableElement((<table></table>));
          // setTableElement(createElement('table',{id:"artifact_map_table"},tableNode));
          // const tableRoot = ReactDOM.createRoot(document.getElementById(tableDivId));
          // tableRoot.render(createElement('table',{id:"artifact_map_table"},tableNode));
          populateTable(aoa);
      }


      function populateTable(aoa){
        setTableElement(<TableComponent key={new Date()} xlsAoa={aoa} addMapping={addMapping} updateValue={updateValue} addLevel={addLevel} validateValue={validateValue} uniqColumNum={uniqColumNum} editColStartNum={startingEditableColumnNum} editable={editable}/>);
      }
      

      function validateValue(value, mandatory){
        //console.log(regexInvalidchar.test(value)+" "+value);
        var errorMsg = "";
        if(value.length>50){
          errorMsg="Maximum 50 Character allowed";
          return errorMsg;
        }
        if(regexInvalidchar.test(value)){
          errorMsg="Special Charecters $`<>^ not allowed";
          return errorMsg;
        }
        if(mandatory && value.length<=0) {
          errorMsg="This field is mandatory"
          return errorMsg; 
        }
        // if(errorMsg==="" && )
        return errorMsg;
      }

      function updateValue({rowNum, colNum, value}){
        setXlsxAoa((prev)=>{
          prev[rowNum][colNum]=value;
          console.log(prev);
          return prev;
        });
      }

      function addMapping({}){

      }

      function addLevel(rowNum){
          // var trowNode = [];
          // trowNode.push(createElement('td',{'row':xlsxAoa.length, 'col':0},"col 0"));
          // trowNode.push(createElement('td',{'row':xlsxAoa.length, 'col':1},"col 1"));
          // trowNode.push(<TableDataComponent rowNum={xlsxAoa.length} colNum={2} error="" value="" editable={editable} validateValue={validateValue}/>);
          // var rowElement = createElement('tr',{id:"new Row".trim().replace(/[ ]/g,"_"), key:[new Date()]},trowNode);
          // var nweTableElement = tableElement;
          // nweTableElement.props.children[1].props.children.push(rowElement);
          // // var nweTableElement = createElement('table',{id:"artifact_map_table"},[ ...tableElement.props.children , rowElement])
          // // setTableElement((prev)=>{
          // //   console.log("called");
          
          // //   prev.props.children[1].props.children.push(rowElement)
          // //   console.log(prev);
          // //   return (<>{ prev }</>)
          // // })
          // const tableRoot = ReactDOM.createRoot(document.getElementById(tableDivId));
          // tableRoot.render(nweTableElement);
          // setTableElement(nweTableElement);
          // setKey(new Date());
          console.log(rowNum);
          setXlsxAoa((prev)=>{
            if(prev[rowNum].slice(-1)[0].trim()==="")return prev;
            prev[rowNum].push(""); 
            if(prev[rowNum].length>prev[0].length){
              prev[0].push(`External System Level ${prev[0].length-1}`);
            } 
            console.log(prev);
            return prev;
          });
          setKey(new Date());
      }

      function savetable(){
        console.log(xlsxAoa);
        // var ws = XLSX.utils.aoa_to_sheet(xlsxAoa)
        // // json_to_sheet([
        // //   { A:"S", B:"h", C:"e", D:"e", E:"t", F:"J", G:"S" },
        // //   { A: 1,  B: 2,  C: 3,  D: 4,  E: 5,  F: 6,  G: 7  },
        // //   { A: 2,  B: 3,  C: 4,  D: 5,  E: 6,  F: 7,  G: 8  }
        // // ], {header:["A","B","C","D","E","F","G"], skipHeader:true});
        // var workbook = XLSX.utils.book_new();
        // XLSX.utils.book_append_sheet(workbook,ws,"New Sheet");
        // XLSX.writeFileXLSX(workbook,"newFile.xlsx",{Props:{Author:"System"}})
      }

    return [validationMsg, xlsxAoa, isProcessing, tableElement, uniqColumnValues, key, setXlsxAoa, setFile, setEditable, savetable, validateValue]
}


