// import logo from './logo.svg';
import './App.css';
import { envVar } from './envVar';
import base64 from "base-64";
import { Amplify, API, Auth, Hub, Storage } from "aws-amplify";
import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx/xlsx.mjs';
// import * as AWS from 'aws-sdk';
import awsexports from './aws-exports'
import data from './data.json';
// import inputComponent from './InputComponent';
// import { CognitoIdentityServiceProvider } from 'aws-sdk';
// import { withAuthenticator } from '@aws-amplify/ui-react';
import QRCode from 'qrcode';
import useXlsxValidator from './useXlsxValidator';
import TableComponent from './TableComponent';


Amplify.configure(awsexports);
Auth.configure({ storage: window.sessionStorage });
// Amplify.configure({
//   // aws_cognito_region: "ap-south-1", // (required) - Region where Amazon Cognito project was created
//   "aws_project_region": "ap-south-1",
//   "aws_cognito_identity_pool_id": "ap-south-1:ede9574d-b546-4293-830c-cf0bc42bc2f4",
//   "aws_cognito_region": "ap-south-1",
//   "aws_user_pools_id": "ap-south-1_sIfZ8Lp0s",
//   "aws_user_pools_web_client_id": "4fr7bhk5lh6a9k2t1uvvoqp9bh",
//   "oauth": {},
//   "aws_cognito_username_attributes": [],
//   "aws_cognito_social_providers": [],
//   "aws_cognito_signup_attributes": [
//       "EMAIL"
//   ],
//   "aws_cognito_mfa_configuration": "OFF",
//   "aws_cognito_mfa_types": [
//       "SMS"
//   ],
//   "aws_cognito_password_protection_settings": {
//       "passwordPolicyMinLength": 8,
//       "passwordPolicyCharacters": []
//   },
//   "aws_cognito_verification_mechanisms": [
//       "EMAIL"
//   ],
//   "aws_user_files_s3_bucket": "newappteststorage172655-dev",
//   "aws_user_files_s3_bucket_region": "ap-south-1",
//   API:{
//     endpoints:[
//       {
//         name: "cognitoApi",
//         endpoint: "https://overridetestdomain.auth.ap-south-1.amazoncognito.com"
//       },
//       {
//         name: "newAppApi",
//         endpoint: "https://uhzqw5stah.execute-api.ap-south-1.amazonaws.com/dev",
//         region: "ap-south-1"
//       }
//     ]
//   }
// });

const initialDataArray=data.body;


// function App({ signOut, user }) {
function App() {
  const abs = envVar[process.env.REACT_APP_DEPLOYMENT_ENV];
  const [responseVal, setResponseVal] = useState(""); 
  const [groups, setGroups] = useState([]);
  const [newUser, setNewUser] = useState({username:"",email:"",group:""});
  const [fileName, setfileName] = useState("");
  const [signedURL, setsignedURL] = useState("");
  const [isUrlAvailable, setisUrlAvailable] = useState(false);
  const [uploadeMassage, setUploadeMassage] = useState(""); 
  const [code, setCode] = useState("");
  const [preferdMfa, setPreferdMfa] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [varifyTotp, setVarifyTotp] = useState("");
  const [isLogedIn, setIsLogedIn] = useState(false);
  const [user, setUser] = useState({});
  const [isReset, setIsReset] = useState(false);
  const [isMfa, setIsMfa] = useState(false);
  const [loginUser, setLoginUser] = useState({userName:"",password:""});
  const [newPassword, setNewPassword] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [validationMsg, 
          xlsxAoa, 
          isProcessing,
          tableElement,
          uniqColumnValues, 
          key,
          setXlsxAoa, 
          setFile,
          setEditable,
          savetable,
          validateValue] = useXlsxValidator({
                      initialDataArray, 
                      startingEditableColumnNum:2, 
                      uniqColumNum:0,
                      workSheetNum:1,
                      edit:true,
                      tableDivId:"table"
                    })

  Hub.listen('auth',(data)=>{
    switch (data.payload.event) {
      case 'configured':
        console.log('the Auth module is configured');
        break;
      case 'signIn':
        setIsLogedIn(true);
        console.log('user signed in');
        break;
      case 'signIn_failure':
        console.log('user sign in failed');
        break;
      case 'signUp':
        console.log('user signed up');
        break;
      case 'signUp_failure':
        console.log('user sign up failed');
        break;
      case 'confirmSignUp':
        console.log('user confirmation successful');
        break;
      case 'completeNewPassword_failure':
        console.log('user did not complete new password flow');
        break;
      case 'autoSignIn':
        console.log('auto sign in successful');
        break;
      case 'autoSignIn_failure':
        console.log('auto sign in failed');
        break;
      case 'forgotPassword':
        console.log('password recovery initiated');
        break;
      case 'forgotPassword_failure':
        console.log('password recovery failed');
        break;
      case 'forgotPasswordSubmit':
        console.log('password confirmation successful');
        break;
      case 'forgotPasswordSubmit_failure':
        console.log('password confirmation failed');
        break;
      case 'verify':
        console.log('TOTP token verification successful');
        break;
      case 'tokenRefresh':
        console.log('token refresh succeeded');
        break;
      case 'tokenRefresh_failure':
        console.log('token refresh failed');
        break;
      case 'cognitoHostedUI':
        console.log('Cognito Hosted UI sign in successful');
        break;
      case 'cognitoHostedUI_failure':
        console.log('Cognito Hosted UI sign in failed');
        break;
      case 'customOAuthState':
        console.log('custom state returned from CognitoHosted UI');
        break;
      case 'customState_failure':
        console.log('custom state failure');
        break;
      case 'parsingCallbackUrl':
        console.log('Cognito Hosted UI OAuth url parsing initiated');
        break;
      case 'userDeleted':
        console.log('user deletion successful');
        break;
      case 'updateUserAttributes':
        console.log('user attributes update successful');
        break;
      case 'updateUserAttributes_failure':
        console.log('user attributes update failed');
        break;
      case 'signOut':
        setIsLogedIn(false);
        console.log('user signed out');
        break;
    }
  });

  useEffect(()=>{
    Auth.currentAuthenticatedUser().then((user)=>{
      console.log("Authenticated");
        setUser(user);
        setIsLogedIn(true);
    }).catch((err)=>{
      console.log("error fetching user"+err);
      setUser({});
      setIsLogedIn(false);
    });
  },[isLogedIn])



//   async function refreshCredentials(){
//     return new Promise((resolve, reject)=>{
//         (AWS.config.credentials).refresh(err =>{
//             if (err) {
//                 reject(err)
//                 console.log(err);
//             } else {
//                 resolve()
//                 console.log("resolved");
//             }
//         })
//     })
//    }


//    async function getAWSTemporaryCreds(){
//     const users = await Auth.currentAuthenticatedUser(); 
//     const cognitoIdentityPool = `cognito-idp.${abs.REGION}.amazonaws.com/${abs.USER_POOL_ID}`; 
//     AWS.config.credentials = new AWS.CognitoIdentityCredentials({
//         IdentityPoolId: abs.IDENTITY_POOL_ID,
//         Logins: {
//             [cognitoIdentityPool]: users.getSignInUserSession().getIdToken().getJwtToken()
//         }
//     }, {
//         region: abs.REGION
//     });
//     return await refreshCredentials();
//  }




  function onclickfunction(){

    alert("environmet is "+process.env.REACT_APP_DEPLOYMENT_ENV);
  }

  async function getToken(){
   const client_id= "4cdkp46s6b7mjpeg3lmp3b3kgo";
   const client_secreate = "7s7hgt6gq8fnnct3oh49kborpl5m1o1a9e9dsdl21p0h2ik3n1g";
   
  //  const DomainUrl = "https://overridetestdomain.auth.ap-south-1.amazoncognito.com"+
  //  "/oauth2/token"+"?"+
  //  "grant_type=client_credentials"+"&"+
  //  "client_id=4cdkp46s6b7mjpeg3lmp3b3kgo"+"&"+
  //  "scope=testOverrideIdentifier/json";

  const url = new URL("https://overridetestdomain.auth.ap-south-1.amazoncognito.com/oauth2/token"); 
  url.searchParams.set("grant_type","client_credentials");
  url.searchParams.set("client_id",client_id);
  url.searchParams.set("scope","testOverrideIdentifier/json");

  console.log(url);
   var clientCred = base64.encode(`${client_id}:${client_secreate}`);
   console.log(clientCred);
   let options = {
    method: 'POST',
    headers: {
      "Authorization": `Basic ${clientCred}`,
      "Content-Type": 'application/x-www-form-urlencoded'
        } 
    }

        // const apiName = "cognitoApi";
        // const path = '/oauth2/token';
        // const myInit = {
        //     headers: {
        //     Authorization: `Basic ${clientCred}`,
        //     "Content-Type": 'application/x-www-form-urlencoded'
        //   },
        //   queryStringParameters: {
        //     "grant_type":"client_credentials",
        //     "client_id":`${client_id}`,
        //     "scope":"testOverrideIdentifier/json"
        //   }
        // };
        // try {
        //     const response = await API.post(apiName, path, myInit);
        //     console.log(response);
        //     return response.access_token;
        // } catch (error) {
        //     console.log(error);
        // }

    const resp = await (await fetch(url,options)).json()
    console.log(resp);
    return resp.access_token;

  }

  async function apiCall(){
    const token = await getToken();
    console.log(token);


    const apiName = "newAppApi";
    const path = '/comments';
    const myInit = {
        headers: {
        Authorization: `Bearer ${token}`
      }
    };
    try {
        const response = await API.post(apiName, path, myInit);
        console.log(response);
        setResponseVal(response);
    } catch (error) {
        console.log(error);
    }
    // alert("environmet is "+process.env.REACT_APP_Environment);
  }


  async function createuser(){
    
    const apiName = "newAppApi";
    const path = '/create-user';
    const myInit = {
        body:newUser,
        headers: {
        Authorization: `Bearer ${(await Auth.currentSession())
          .getIdToken()
          .getJwtToken()}`
      }
    };
    try {
        const response = await API.post(apiName, path, myInit);
        console.log(response);
        setResponseVal(response);
    } catch (error) {
        console.log(error);
    }
  }

  async function listGroup(){
    // await getAWSTemporaryCreds();
    // const cognitoservisceprovider = new AWS.CognitoIdentityServiceProvider({
    //   region: abs.REGION
    // });
    //     console.log("credential refreshed");
    //     cognitoservisceprovider.listGroups({
    //         UserPoolId: abs.USER_POOL_ID,
    //         Limit:4
    //     },function(err, data) {
    //         if (err) {
    //           console.log(err, err.stack);
    //         } 
    //         else{
    //           console.log(data);
    //           setGroups(data.Groups)
    //         }  
    //       });

    const apiName = "newAppApi";
    const path = '/create-user/list-group';
    const myInit = {
        // body:newUser,
        headers: {
        Authorization: `Bearer ${(await Auth.currentSession())
          .getIdToken()
          .getJwtToken()}`
      }
    };
    try {
        const response = await API.post(apiName, path, myInit);
        console.log(response);
        setGroups(response);
    } catch (error) {
        console.log(error);
    }

    }

    async function listUser(){
      const apiName = "newAppApi";
      const path = '/create-user/list-user';
      const myInit = {
          body:{
            // "filterByEmail":"qua",
            // "paginationToken":""
          },
          headers: {
          Authorization: `Bearer ${(await Auth.currentSession())
            .getIdToken()
            .getJwtToken()}`
        }
      };
      try {
          const response = await API.post(apiName, path, myInit);
          console.log(response);
      } catch (error) {
          console.log(error);
      }
  
      }
    
      async function resetUserPassword(){
        const apiName = "newAppApi";
        const path = '/create-user/reset-user-password';
        const myInit = {
            body:{
              "userName": newUser.username
            },
            headers: {
            Authorization: `Bearer ${(await Auth.currentSession())
              .getIdToken()
              .getJwtToken()}`
          }
        };
        try {
            const response = await API.post(apiName, path, myInit);
            console.log(response);
        } catch (error) {
            console.log(error);
        }
    
        }
      
        async function setUserPassword(){
          const apiName = "newAppApi";
          const path = '/create-user/set-user-password';
          const myInit = {
              body:{
                "userName": newUser.username,
                "temPassword":"abcd@123"
              },
              headers: {
              Authorization: `Bearer ${(await Auth.currentSession())
                .getIdToken()
                .getJwtToken()}`
            }
          };
          try {
              const response = await API.post(apiName, path, myInit);
              console.log(response);
          } catch (error) {
              console.log(error);
          }
      
          }
          async function getUserAuthEvent(){
            const apiName = "newAppApi";
            const path = '/create-user/list-AuthEvent';
            const myInit = {
                body:{
                  "userName": newUser.username,
                  // "nextToken":""
                },
                headers: {
                Authorization: `Bearer ${(await Auth.currentSession())
                  .getIdToken()
                  .getJwtToken()}`
              }
            };
            try {
                const response = await API.post(apiName, path, myInit);
                console.log(response);
            } catch (error) {
                console.log(error);
            }
        
            }

    async function onChange(e) {
      const file = e.target.files[0];
      try {
        // validateXlsx(file);
       const isVali = await validateCsv(file, "name, value, age, product, to address, from address", "name");
        // const isVali = true;
        if(isVali){
          // const response = await Storage.put(file.name, file ,{
          //   progressCallback(progress) {
          //     console.log(`Uploaded: ${progress.loaded}/${progress.total}`);
          //   }
          // }
          // //   {
          // //   contentType: "image/png", // contentType is optional
          // // }
          // );
          // console.log(response);
          console.log("valid file");
          //setfileName(response.key);
        } else {
          console.log("not a valid file");
          setfileName("");
        }
        document.querySelector("input[type=file]").value = ""
      } catch (error) {
        console.log("Error uploading file: ", error);
      }
    }

      async function getLink(){
        const signedURL = await Storage.get(fileName);
        setisUrlAvailable(true);
        setsignedURL(signedURL);
      }

      async function deleteObject(){
        const response = await Storage.remove(fileName);
        console.log(response);
        setisUrlAvailable(false);
        setsignedURL("");
      }

      // async function validateXlsx(file){
      //   console.log(file);
      //   return new Promise((resolve, reject)=>{
      //       if(!file || !(file && ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","application/vnd.ms-excel"].includes(file.type))){
      //         console.log("file not found");
              
      //         resolve([]);
      //       } else if(file.size>(6*1024*1024)){ // max file size 6 MB
      //         console.log(file.size);
      //         console.log("file Size exceded");
              
      //         resolve([]);
      //       }else{
      //           var reader = new FileReader();
      //           reader.readAsArrayBuffer(file);
      //           reader.onload = function(e){
      //             var data = e.target.result;
      //             console.log(data);
      //             const wb = XLSX.read(data);
      //             console.log(wb);
      //             const jsonData = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[1]],{header:1});
      //             console.log(JSON.stringify(jsonData));
                  
      //           //   var container = document.getElementById("table");
      //           //   container.innerHTML = XLSX.utils.sheet_to_html(wb.Sheets[wb.SheetNames[0]],{id:"my-Table",editable:true});
      //             // var ws = XLSX.utils.json_to_sheet([
      //             //   { A:"S", B:"h", C:"e", D:"e", E:"t", F:"J", G:"S" },
      //             //   { A: 1,  B: 2,  C: 3,  D: 4,  E: 5,  F: 6,  G: 7  },
      //             //   { A: 2,  B: 3,  C: 4,  D: 5,  E: 6,  F: 7,  G: 8  }
      //             // ], {header:["A","B","C","D","E","F","G"], skipHeader:true});
      //             // var workbook = XLSX.utils.book_new();
      //             // XLSX.utils.book_append_sheet(workbook,ws,"New Sheet");
      //             // XLSX.writeFileXLSX(workbook,"newFile.xlsx",{Props:{Author:"System"}})
      //             resolve(jsonData);
      //           }
                
      //           reader.onerror = function(e){
                  
      //             reject(e.target.error.name);
      //           }
      //       }
            
      //   })
      // }

      async function validateCsv(file, commaSeperateColNames, uniqColumName){
        console.log(file);
        return new Promise((resolve, reject)=>{
            if(!file || !(file && ["text/csv"].includes(file.type))){
              console.log("file not found");
              setUploadeMassage('Valid file not found');
              resolve(false);
            } else if(file.size>(20*1024*1024)){ // max file size 20 MB
              console.log(file.size);
              console.log("file Size exceded");
              setUploadeMassage('File Size exceded 20 MB');
              resolve(false);
            }else{
                var reader = new FileReader();
                reader.readAsText(file);
                reader.onload = function(e){
                  var data = e.target.result;
                  console.log(data);
                  //invalid char check 
                  const regexInvalidchar = new RegExp('[$^<>`]','gm')
                  // var res = data.match(regexInvalidchar);
                  // console.log(res);
                  if(regexInvalidchar.test(data)){
                    console.log("invalid character found");
                    setUploadeMassage('Invalid character $^<>` found');
                    resolve(false);
                    return;
                  } else{
                    const comaNum = data.slice(0,data.indexOf('\n')).match(/[,]/g).length
                    const regexReplaceEmptyRow = new RegExp('[ \r]|\n,{'+comaNum+'}|\n$','gm'); 
                    var rowData = data.toLowerCase().replace(regexReplaceEmptyRow,'').split("\n");
                    // Header Formate Check
                    if(!commaSeperateColNames.toLowerCase().replace(/[ ]/g,'').includes(rowData[0])){
                      console.log("Csv File Hedder Is Not Correct");
                      setUploadeMassage('Csv File Hedder Is Not Correct it should be '+commaSeperateColNames);
                      resolve(false);
                      return;
                    }
                    // dublicate recorde check
                    var checkList = [];
                    const colNum = rowData[0].split(",").indexOf(uniqColumName);
                    const totalRowNum = rowData.length;
                    // var lastelement = "";
                    console.log(rowData);
                    for(var row = 1; row < totalRowNum; row++){
                        // lastelement = rowData.pop();
                        // console.log(lastelement);
                        // if(rowData.includes(lastelement)){
                        //   console.log("dublicate recorde found at"+rowData.indexOf(lastelement));
                        //   resolve(false);
                        //   return;
                        // } else if(rowData.length<=2){
                        //   console.log("valid recordes");
                        //   resolve(true);
                        //   return;
                        // }
                        var colVal = rowData[row].split(",")[colNum];
                        if(checkList.includes(colVal)){
                            console.log("dublicate recorde found at"+row);
                            setUploadeMassage("Dublicate recorde found at row "+row+" for unique column '"+uniqColumName+"'");
                            resolve(false);
                            return;
                          }
                          checkList.push(colVal);
                    }
                    console.log("valid recordes");
                    setUploadeMassage('Valid File');
                    resolve(true);
                    return;
                  }
                }
                
                reader.onerror = function(e){
                  reject(e.target.error.name);
                }
            }
            
        })
      }
    async function qrCodeUrl(totpCode){
      const url = await QRCode.toDataURL(encodeURI(`otpauth://totp/AWSCognito:${user.username}?secret=${totpCode}&issuer=AWSCognito`))
      console.log(`otpauth://totp/AWSCognito:${user.username}?secret=${totpCode}&issuer=AWSCognito`)
      setQrCode(url);
    }

  return (
    <div className="App">
      new App
      {isLogedIn ?
      
      (<>
      <h1>Hello {user.username}</h1>
      <p>{user.getSignInUserSession().getIdToken().decodePayload()['cognito:groups']}</p>
      <p>{process.env.REACT_APP_ID}</p>
      <p>{abs.somting}</p>
      <p>{abs.dothing}</p>
      <p><input onChange={(e)=>{setNewUser({...newUser, username:e.target.value})}}
                  name="user Name"
                  placeholder="user name"
                  value={newUser.username}
                  /></p>
      <p><input onChange={(e)=>{setNewUser({...newUser, email:e.target.value})}}
                  name="email"
                  placeholder="email"
                  value={newUser.email}
                  /></p>
      <p><input onChange={(e)=>{setNewUser({...newUser, group:e.target.value})}}
                  name="group"
                  placeholder="cognito group name"
                  value={newUser.group}
                  /></p>
      <button
            type="button"
            className=""
            onClick={onclickfunction}>
                Check Environment
            </button>
            <button
            type="button"
            className=""
            onClick={apiCall}>
                call api
            </button>
            <button
            type="button"
            className=""
            onClick={createuser}>
                create user api
            </button>
            <button
            type="button"
            className=""
            onClick={listGroup}>
                list group
            </button>
            <button
            type="button"
            className=""
            onClick={listUser}>
                list users
            </button>
            <button
            type="button"
            className=""
            onClick={resetUserPassword}>
                reset users password
            </button>
            <button
            type="button"
            className=""
            onClick={setUserPassword}>
                set users password
            </button>
            <button
            type="button"
            className=""
            onClick={getUserAuthEvent}>
                list users auth Events
            </button>
            <button  type="button" onClick={()=>{Auth.signOut()}}>Sign out</button>
            <p>{responseVal}</p>
            {groups && groups.map((item, index)=>(
              // <p key={index}  onClick={()=>{setNewUser({...newUser, group:item.GroupName})}} >{item.GroupName}</p>
              <p key={index} style={{pointerEvents:"none"}}  onClick={()=>{setNewUser({...newUser, group:item})}} >{item}</p>
            ))}

      <p>
      <input title='Upload File' type="file" onChange={onChange} accept=".csv" />
      </p>
      {uploadeMassage && (<p>{uploadeMassage}</p>)}
      <p><input onChange={(e)=>{setfileName(e.target.value);}}
                  name="file"
                  placeholder="file name"
                  value={fileName}
                  /></p>
      {isUrlAvailable && (<p><a href={signedURL} target="_blank" onClick={()=>{setisUrlAvailable(false);}} rel='noreferrer'>{fileName}</a></p>)}
      <p><button
            type="button"
            className=""
            onClick={getLink}>
                get download link
            </button>
            <button
            type="button"
            className=""
            onClick={deleteObject}>
                delete file
            </button></p>
            <div>
            <p>
            <input onChange={(e)=>{setPhoneNumber(e.target.value)}}
                  name="phonenumber"
                  placeholder="phonenumber"
                  value={phoneNumber}
                  />
              <button
            type="button"
            className=""
            onClick={()=>{Auth.updateUserAttributes(user,{
              phone_number:phoneNumber
            }).then((data)=>console.log(data)).catch((err)=>console.log(err))}}>
             Set Phone Number
            </button></p>
            <p>

            <input onChange={(e)=>{setCode(e.target.value)}}
                  name="varificationCode"
                  placeholder="varificationCode"
                  value={code}
                  />
              <button
            type="button"
            className=""
            onClick={()=>{Auth.verifyCurrentUserAttribute("phone_number").then((data)=>console.log(data)).catch((err)=>console.log(err))}}>
              send code to phone 
            </button>
            <button
            type="button"
            className=""
            onClick={()=>{Auth.verifyCurrentUserAttributeSubmit("phone_number",code).then((data)=>console.log(data)).catch((err)=>console.log(err))}}>
                varify phone
            </button>
            </p>

            <p onClick={()=>setPreferdMfa('SMS')}>SMS</p>
            <p onClick={()=>setPreferdMfa('TOTP')}>TOTP</p>
            <p onClick={()=>setPreferdMfa('NOMFA')}>NOMFA</p>

            <p>
            <input onChange={(e)=>{setPreferdMfa(e.target.value)}}
                  name="preferdMfa"
                  placeholder="preferdMfa"
                  value={preferdMfa}
                  />
            <button
            type="button"
            className=""
            onClick={()=>{Auth.setPreferredMFA(user,preferdMfa).then((data)=>console.log(data)).catch((err)=>console.log(err))}}>
               set preferd mfa
            </button>
            </p>
            </div>

            <div>
              <p>
                
            <button
            type="button"
            className=""
            onClick={()=>{Auth.setupTOTP(user).then((code) => {
              // display setup code to user which can be used to manually add an account to Authenticator apps
              console.log("success");
              setTotpCode(code);
              qrCodeUrl(code);
            }).catch((err)=>console.log(err))}}>
             Set up Totp
            </button>
              </p>

            <p>
            {qrCode &&
              (
              <img
              src={qrCode}
              alt="qr code"
              width="228"
              height="228"
            />
              )
            }
            </p>
            <p>
            {totpCode}
            </p>
            <p>

            <input onChange={(e)=>{setVarifyTotp(e.target.value)}}
                  name="Totp"
                  placeholder="Totpchallange"
                  value={varifyTotp}
                  />
              <button
            type="button"
            className=""
            onClick={()=>{Auth.verifyTotpToken(user, varifyTotp)
              .then(() => {
                console.log("success");
                // don't forget to set TOTP as the preferred MFA method
                Auth.setPreferredMFA(user, 'TOTP');
                // ...
              })
              .catch((e) => {
                // Token is not verified
                console.log(e);
              });}}>
             complete Authenticator
            </button>
            </p>
            </div>
            </>
      ):(<>
          <p>
          <input onChange={(e)=>{setLoginUser((prev)=>{return {...prev,userName:e.target.value}})}}
                  name="username"
                  placeholder="username"
                  value={loginUser.userName}
                  />
          </p>
          <p>

          <input onChange={(e)=>{setLoginUser((prev)=>{return {...prev,password:e.target.value}})}}
                  name="password"
                  type="password"
                  placeholder="password"
                  value={loginUser.password}
                  />
          </p>
          <p>
              <button
            type="button"
            className=""
            onClick={()=>{Auth.signIn(loginUser.userName, loginUser.password)
              .then((user) => {
                setUser(user);
                console.log(user.challengeName);
                if (
                  user.challengeName === 'SMS_MFA' ||
                  user.challengeName === 'SOFTWARE_TOKEN_MFA'
                ) {
                  setIsMfa(true);
                } else if (user.challengeName === 'NEW_PASSWORD_REQUIRED') {
                  setIsReset(true);
                } else if (user.challengeName === 'MFA_SETUP') {
                  
                } else if (user.challengeName === 'SELECT_MFA_TYPE') {
                  
                } else {
                  console.log(user);
                }
                setLoginUser({userName:"",password:""});
              })
              .catch((e) => {
                // Token is not verified
                console.log(e);
              });}}>
             Sign In
            </button>
          </p>
          <p>
          <input title='Upload File' type="file" onChange={(e)=>{setFile(e.target.files[0]);e.target.value=""}} accept=".xlsx,.xls" />
          </p>
          <p>{JSON.stringify(validationMsg)}</p>
          <p>{JSON.stringify(xlsxAoa)}</p>
          {/* <p>{JSON.stringify(uniqColumnValues)}</p> */}
          <div key={key} id="table" style={{display:"grid",gap:'50px'}}>
                {tableElement}
          </div>

                <button type='button' onClick={()=>setEditable((prev)=> !prev)}>
                  edit table
                </button>
                <button type='button' onClick={()=>savetable()}>
                  save table
                </button>
      </>)}
        {!isLogedIn && isReset && (
          <>
          <p>

            <input onChange={(e)=>{setNewPassword(e.target.value)}}
                  name="newPassword"
                  placeholder="newPassword"
                  type="password"
                  value={newPassword}
                  />
          </p>
          <p>

              <button
            type="button"
            className=""
            onClick={()=>{Auth.completeNewPassword(user, newPassword)
              .then((user) => {
                setUser(user);
                console.log(user.challengeName);
                if (
                  user.challengeName === 'SMS_MFA' ||
                  user.challengeName === 'SOFTWARE_TOKEN_MFA'
                ) {
                  setIsMfa(true);
                } else if (user.challengeName === 'NEW_PASSWORD_REQUIRED') {
                  setIsReset(true);
                } else if (user.challengeName === 'MFA_SETUP') {
                  
                } else if (user.challengeName === 'SELECT_MFA_TYPE') {
                  
                } else {
                  console.log(user);
                }
                setIsReset(false);
                setNewPassword("");
              })
              .catch((e) => {
                // Token is not verified
                console.log(e);
              });}}>
             complete new password
            </button>
          </p>
          </>
        )}

        {!isLogedIn && isMfa && (
          <>
          <p>

            <input onChange={(e)=>{setVarifyTotp(e.target.value)}}
                  name="code"
                  placeholder="code"
                  value={varifyTotp}
                  />
          </p>
          <p>
              <button
            type="button"
            className=""
            onClick={()=>{Auth.confirmSignIn(user, varifyTotp,'SMS_MFA')
              .then((user) => {
                console.log("success");
               setUser(user);
               setIsMfa(false);
               setVarifyTotp("");
              })
              .catch((e) => {
                // Token is not verified
                console.log(e);
              });}}>
             complete Authentication
            </button>
          </p>
          </>
        )}
    </div>
  );
}
export default App;
// export default withAuthenticator(App);
