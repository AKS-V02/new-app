import { useEffect, useState } from "react"

export default function TableDataComponent({value,error,rowNum,colNum,editable,validateValue}){
    const [state, setState] = useState({value:"",error:""})
    
    useEffect(()=>{
        setState({value,error});
    },[value,error,editable])
    
    function onChange(newValue){
        // var newValue = e.target.value;
        var newError = validateValue(newValue);
        setState({value:newValue,error:newError});
    }

    // function validateValue(value){
    //     const regexInvalidchar = new RegExp('[$^<>`]','gm')
    //     var errorMsg = "";
    //     if(value.length>50){
    //       errorMsg="Maximum 50 Character allowed";
    //     }else if(regexInvalidchar.test(value)){
    //       errorMsg="Special Charecters $`<>^ not allowed";
    //     }
    //     return errorMsg;
    //   }

      
    if(editable){
        return (
            <>
            <td>
                <div style={{display: "inline-grid"}}>
                    <input key={rowNum+" "+colNum} row={rowNum} col={colNum} onChange={(e)=>onChange(e.target.value)} value={state.value}></input>
                    {state.error && (<span>{state.error}</span>)}
                </div>
            </td>
            </>
        )
    }else{
        return (
            <>
            <td>{state.value}</td>
            </>
        )
    }
    
}