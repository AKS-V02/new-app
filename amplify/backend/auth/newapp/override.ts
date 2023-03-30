import { AmplifyAuthCognitoStackTemplate } from '@aws-amplify/cli-extensibility-helper';
import * as cdk from '@aws-cdk/core';

export function override(resources: AmplifyAuthCognitoStackTemplate) {
  resources.addCfnParameter(
    {
      type: "String",
      description:
        "custom scope value",
      default: "json",
    },
    "ScopeValue",
  );

  resources.addCfnParameter(
    {
      type: "String",
      description:
        "resourse server identifier",
      default: "testOverrideIdentifier",
    },
    "ResourseIdentifier",
  );
    
    resources.addCfnResource({
      type:"AWS::Cognito::UserPoolDomain",
      properties:{
        "Domain" : "overridetestdomain",
        "UserPoolId" :  {
          "Ref": "UserPool"
        }
      },

    },"overridetestdomain");


    // const testOverrideResourceServer = new cdk.CfnResource(resources.userPool.stack,"testOverrideResourceServer",{
    //   type:"AWS::Cognito::UserPoolResourceServer",
    //   properties:{
    //     "Identifier" : {
    //       "Ref": "ResourseIdentifier"
    //     },
    //     "Name" : "testOverrideResource",
    //     "Scopes" : [ {
    //       "ScopeDescription" : {
    //         "Ref": "ScopeValue"
    //       },
    //       "ScopeName" : {
    //         "Ref": "ScopeValue"
    //       }
    //     }
    //      ],
    //     "UserPoolId" : {
    //       "Ref": "UserPool"
    //     }
    //   },

    // });

    resources.addCfnResource({
      type:"AWS::Cognito::UserPoolResourceServer",
      properties:{
        "Identifier" : {
          "Ref": "ResourseIdentifier"
        },
        "Name" : "testOverrideResource",
        "Scopes" : [ {
          "ScopeDescription" : {
            "Ref": "ScopeValue"
          },
          "ScopeName" : {
            "Ref": "ScopeValue"
          }
        }
         ],
        "UserPoolId" : {
          "Ref": "UserPool"
        }
      },

    },"testOverrideResourceServer");

  //   const client = new cdk.CfnResource(resources.userPool.stack, "newClient", {
  //     type: "AWS::Cognito::UserPoolClient",
  //     properties: {
  //       "UserPoolId": {
  //         "Ref": "UserPool"
  //       },
  //       "ClientName": "testOverrideClient",
  //       "RefreshTokenValidity": {
  //         "Ref": "userpoolClientRefreshTokenValidity"
  //       },
  //       "TokenValidityUnits": {
  //         "RefreshToken": "days"
  //       },
  //       "GenerateSecret" : true,
  //       "AllowedOAuthFlows" : [ "client_credentials" ],
  //       "SupportedIdentityProviders" : [ "COGNITO" ],
  //       "AllowedOAuthScopes" : [ { 'Fn::Sub': '${ResourseIdentifier}/${ScopeValue}' }, ],
  //        "ExplicitAuthFlows" : [ "ALLOW_REFRESH_TOKEN_AUTH" ],
  //        "AllowedOAuthFlowsUserPoolClient" : true,
  //     }
  // }).addDependsOn(testOverrideResourceServer);


    resources.addCfnResource({
        type: "AWS::Cognito::UserPoolClient",
        properties: {
          "UserPoolId": {
            "Ref": "UserPool"
          },
          "ClientName": "testOverrideClient",
          "RefreshTokenValidity": {
            "Ref": "userpoolClientRefreshTokenValidity"
          },
          "TokenValidityUnits": {
            "RefreshToken": "days"
          },
          "GenerateSecret" : true,
          "AllowedOAuthFlows" : [ "client_credentials" ],
          "SupportedIdentityProviders" : [ "COGNITO" ],
          "AllowedOAuthScopes" : [ { "Fn::Join" : [ "/", [ { "Ref" : "testOverrideResourceServer" }, { "Ref" : "ScopeValue" }  ] ] }, ],
           "ExplicitAuthFlows" : [ "ALLOW_REFRESH_TOKEN_AUTH" ],
           "AllowedOAuthFlowsUserPoolClient" : true,
        }
    },"newClient");

}
