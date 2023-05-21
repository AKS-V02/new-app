import { useState } from "react";
const initialValidationMsg = {
    validFileMsg:{
        isvalid:true,
        errorMsg:""
    },
    
}
export default function useXlsxValidator(){
    const [validationMsg, setValidationMsg] = useState(initialValidationMsg);
}