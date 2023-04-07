import logo from './logo.svg';
import './App.css';
import { envVar } from './envVar';
import base64 from "base-64";
import { Amplify, API, Storage } from "aws-amplify";
import { useState } from 'react';
import * as AWS from 'aws-sdk';
import { CognitoIdentityServiceProvider } from 'aws-sdk';
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

  Storage.put(key, file, {
    acl: 'public-read'
  });

  function onclickfunction(){

    alert("environmet is "+process.env.REACT_APP_DEPLOYMENT_ENV);
  }

  async function getToken(){
   const client_id= "4cdkp46s6b7mjpeg3lmp3b3kgo";
   const client_secreate = "7s7hgt6gq8fnnct3oh49kborpl5m1o1a9e9dsdl21p0h2ik3n1g";
   
  //  const DomainUrl = "https://testsecreat.auth.ap-south-1.amazoncognito.com"+
  //  "/oauth2/token"+"?"+
  //  "grant_type=client_credentials"+"&"+
  //  "client_id=5qid1e8lc316ovl1tkvv11jac1"+"&"+
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

    // const resp = await fetch(DomainUrl,options);
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

  return (
    <div className="App">
      new App
      <h1>Hello {user.username}</h1>
      <p>{process.env.REACT_APP_ID}</p>
      <p>{abs.somting}</p>
      <p>{abs.dothing}</p>
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
            <button onClick={signOut}>Sign out</button>
            <p>{responseVal}</p>
    </div>
  );
}

export default withAuthenticator(App);
