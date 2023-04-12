// import logo from './logo.svg';
import './App.css';
import { envVar } from './envVar';
import base64 from "base-64";
import { Amplify, API, Auth, Storage } from "aws-amplify";
import { useState } from 'react';
import * as AWS from 'aws-sdk';
// import { CognitoIdentityServiceProvider } from 'aws-sdk';
import { withAuthenticator } from '@aws-amplify/ui-react';

Amplify.configure({
  // aws_cognito_region: "ap-south-1", // (required) - Region where Amazon Cognito project was created
  "aws_project_region": "ap-south-1",
  "aws_cognito_identity_pool_id": "ap-south-1:ede9574d-b546-4293-830c-cf0bc42bc2f4",
  "aws_cognito_region": "ap-south-1",
  "aws_user_pools_id": "ap-south-1_sIfZ8Lp0s",
  "aws_user_pools_web_client_id": "4fr7bhk5lh6a9k2t1uvvoqp9bh",
  "oauth": {},
  "aws_cognito_username_attributes": [],
  "aws_cognito_social_providers": [],
  "aws_cognito_signup_attributes": [
      "EMAIL"
  ],
  "aws_cognito_mfa_configuration": "OFF",
  "aws_cognito_mfa_types": [
      "SMS"
  ],
  "aws_cognito_password_protection_settings": {
      "passwordPolicyMinLength": 8,
      "passwordPolicyCharacters": []
  },
  "aws_cognito_verification_mechanisms": [
      "EMAIL"
  ],
  "aws_user_files_s3_bucket": "newappteststorage172655-dev",
  "aws_user_files_s3_bucket_region": "ap-south-1",
  API:{
    endpoints:[
      {
        name: "cognitoApi",
        endpoint: "https://overridetestdomain.auth.ap-south-1.amazoncognito.com"
      },
      {
        name: "newAppApi",
        endpoint: "https://uhzqw5stah.execute-api.ap-south-1.amazonaws.com/dev",
        region: "ap-south-1"
      }
    ]
  }
});

function App({ signOut, user }) {
  const abs = envVar[process.env.REACT_APP_DEPLOYMENT_ENV];
  const [responseVal, setResponseVal] = useState(""); 
  const [groups, setGroups] = useState([]);
  const [newUser, setNewUser] = useState({username:"",email:"",group:""});
  const [fileName, setfileName] = useState("");
  const [signedURL, setsignedURL] = useState("");
  const [isUrlAvailable, setisUrlAvailable] = useState(false);
  // const [isValid, setisValid] = useState(false); 



  async function refreshCredentials(){
    return new Promise((resolve, reject)=>{
        (AWS.config.credentials).refresh(err =>{
            if (err) {
                reject(err)
                console.log(err);
            } else {
                resolve()
                console.log("resolved");
            }
        })
    })
   }


   async function getAWSTemporaryCreds(){
    const users = await Auth.currentAuthenticatedUser(); 
    const cognitoIdentityPool = `cognito-idp.${abs.REGION}.amazonaws.com/${abs.USER_POOL_ID}`; 
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: abs.IDENTITY_POOL_ID,
        Logins: {
            [cognitoIdentityPool]: users.getSignInUserSession().getIdToken().getJwtToken()
        }
    }, {
        region: abs.REGION
    });
    return await refreshCredentials();
 }




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

   var clientCred = base64.encode(`${client_id}:${client_secreate}`);
   console.log(clientCred);
  //  let options = {
  //   method: 'POST',
  //   headers: {
  //     "Authorization": `Basic ${clientCred}`,
  //     "Content-Type": 'application/x-www-form-urlencoded'
  //       } 
  //   }

        const apiName = "cognitoApi";
        const path = '/oauth2/token';
        const myInit = {
            headers: {
            Authorization: `Basic ${clientCred}`,
            "Content-Type": 'application/x-www-form-urlencoded'
          },
          queryStringParameters: {
            "grant_type":"client_credentials",
            "client_id":`${client_id}`,
            "scope":"testOverrideIdentifier/json"
          }
        };
        try {
            const response = await API.post(apiName, path, myInit);
            console.log(response);
            return response.access_token;
        } catch (error) {
            console.log(error);
        }

    // const resp = await 
    // fetch(DomainUrl,options).then(resp => {
    //   console.log(resp);
    //   return resp.access_token;
    // }).catch(err=>{
    //   console.log(err);
    // });
    // console.log(resp);
    // return resp.json.access_token;

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
        const response = await API.put(apiName, path, myInit);
        console.log(response);
        setResponseVal(response.key);
    } catch (error) {
        console.log(error);
    }
  }

  async function listGroup(){
    await getAWSTemporaryCreds();
    const cognitoservisceprovider = new AWS.CognitoIdentityServiceProvider({
      region: abs.REGION
    });
        console.log("credential refreshed");
        cognitoservisceprovider.listGroups({
            UserPoolId: abs.USER_POOL_ID,
            Limit:4
        },function(err, data) {
            if (err) {
              console.log(err, err.stack);
            } 
            else{
              console.log(data);
              setGroups(data.Groups)
            }  
          });
    }

    async function onChange(e) {
      const file = e.target.files[0];
      try {
       const isVali = await validateCsv(file);
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
          console.log("valid file")
          setfileName(file.name);
        } else {
          console.log("not a valid file");
          setfileName("");
        }
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

      async function validateCsv(file){
        return new Promise((resolve, reject)=>{
            if(!file || !(file && ["text/csv"].includes(file.type))){
              console.log("file not found");
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
                    resolve(false);
                    return;
                  } else{
                    // dublicate recorde check
                    const comaNum = data.slice(0,data.indexOf('\n')).match(/[,]/g).length
                    const regexReplaceEmptyRow = new RegExp('[ ,\r]|\n,{'+comaNum+'}|\n$','gm'); 
                    var rowData = data.toLowerCase().replace(regexReplaceEmptyRow,'').split("\n");
                    const rowNum = rowData.length;
                    var lastelement = "";
                    console.log(rowData);
                    for(var row = 1; row < rowNum; row++){
                        lastelement = rowData.pop();
                        console.log(lastelement);
                        if(rowData.includes(lastelement)){
                          console.log("dublicate recorde found");
                          resolve(false);
                          return;
                        } else if(rowData.length<=2){
                          console.log("valid recordes");
                          resolve(true);
                          return;
                        }
                    }
                  }
                }
                
                reader.onerror = function(e){
                  reject(e.target.error.name);
                }
            }
            
        })
      }

  return (
    <div className="App">
      new App
      <h1>Hello {user.username}</h1>
      <p>{user.getSignInUserSession().getIdToken().decodePayload()['cognito:groups'][0]}</p>
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
            <button onClick={signOut}>Sign out</button>
            <p>{responseVal}</p>
            {groups && groups.map((item, index)=>(
              <p key={index}  onClick={()=>{setNewUser({...newUser, group:item.GroupName})}} >{item.GroupName}</p>
            ))}

      <p>
      <input type="file" onChange={onChange} accept=".csv,text/csv" />
      </p>
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
        
    </div>
  );
}

export default withAuthenticator(App);
