import { useEffect, useState } from "react"

export default function TableDataComponent({value, rowNum, colNum, mandatory, editable, validateValue, updateValue}){
    const [state, setState] = useState({value:"",error:""})
    
    useEffect(()=>{
        setState({value,error:validateValue(value, mandatory)});
        console.log(editable);
    },[value,editable])
    
    function onChange(newValue){
        // var newValue = e.target.value;
        var newError = validateValue(newValue, mandatory);
        setState((prev)=> {return {value:newValue,error:newError}});
        updateValue({rowNum, colNum, value:newValue});
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
            <td key={"dataCol"+"_"+rowNum+"_"+colNum}>
                <div key={"div"+"_"+rowNum+"_"+colNum} style={{display: "inline-grid"}}>
                    <input key={rowNum+"_"+colNum} row={rowNum} col={colNum} onChange={(e)=>onChange(e.target.value)} value={state.value}></input>
                    {state.error!=="" && (<span key={"error"+"_"+rowNum+"_"+colNum} id={"error"+"_"+rowNum+"_"+colNum}>{state.error}</span>)}
                </div>
            </td>
            </>
        )
    }else{
        return (
            <>
            <td key={"dataCol"+"_"+rowNum+"_"+colNum} row={rowNum} col={colNum}>
                <span>
                    {state.value}
                </span>
            </td>
            </>
        )
    }
    
}