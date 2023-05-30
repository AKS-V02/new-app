import TableDataComponent from "./TableDataComponent";

export default function TableComponent({xlsAoa, uniqColumNum, editColStartNum, editable, validateValue, addLevel, addMapping, updateValue}){
    
    // function addLevel(rowNum){
    //     console.log(rowNum);
    //     setXlsxAoa((prev)=>{prev[rowNum].push(""); return prev;})
    // }
    
    return (<>
                <table key="artifact_map_table" id="artifact_map_table">
                    <thead key="artifact_map_table_head" id="artifact_map_table_head">
                        <tr key={"hedderRow"+"_"+"0"} row={0} id="hedder_row">
                            {xlsAoa[0].map((value,index)=>(
                            <>
                            <th key={"hedderCol"+"_"+index} row={0} col={index}>
                                {value}
                            </th>
                            </>
                            ))}
                        </tr>
                    </thead>
                    <tbody key="artifact_map_table_body" id="artifact_map_table_body">
                    {xlsAoa.map((row,rowNum)=>(rowNum===0)?(<></>):(
                            <>
                            <tr key={"dataRow"+"_"+rowNum} row={rowNum} id={row[uniqColumNum].trim().replace(/[ ]/g,"_")}>
                                {row.map((col,colNum)=>(colNum<editColStartNum)?(
                                <>
                                    <td key={"datacol"+"_"+colNum} row={rowNum} col={colNum}>
                                        <span>
                                            {col}
                                        </span>
                                    </td>
                                </>
                                ):(
                                <>
                                    <TableDataComponent key={"datacol"+"_"+colNum} updateValue={updateValue} rowNum={rowNum} colNum={colNum} value={col} mandatory={row[uniqColumNum].toLowerCase()==='miscellaneous' && colNum===editColStartNum} editable={editable} validateValue={validateValue}/>
                                </>
                                ))}
                                <div>
                                    <button type="button" disabled={xlsAoa[rowNum].slice(-1)[0].trim()===""} key="add_level_id" onClick={()=>addLevel(rowNum)} id="add_level_id">add level</button>
                                </div>
                            </tr>
                            </>
                            ))}
                            <tr key="add_mapping_id" id="add_mapping_id">
                                {/* <datalist  ></datalist> */}
                                <div>
                                    add mapping 
                                </div>
                            </tr>
                    </tbody>
                </table>        
            </>);
}