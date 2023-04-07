import { AmplifyAuthCognitoStackTemplate } from '@aws-amplify/cli-extensibility-helper';

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

  // resources.addCfnResource({
  //   type:"AWS::IAM::Policy",
  //   properties:{
  //     "PolicyName" : resources.userPool.userPoolName+"-group-admin-policy",
  //     "PolicyDocument": {
  //       "Version": "2012-10-17",
  //       "Statement": [
  //           {
  //               "Effect": "Allow",
  //               "Action": [
  //                 "cognito-idp:ListGroups"
  //               ],
  //               "Resource": resources.userPool.attrArn
  //           }
  //       ]
  //     },
  //     "Roles": [ {
  //       "Ref": "cognito-group-admin-role"
  //    } ]
  //   }
  // },"cognitogroupadminpolicy");

  resources.addCfnResource({
    type:"AWS::IAM::Role",
    properties:{
      "RoleName" : resources.userPool.userPoolName+"-group-admin-role",
      "AssumeRolePolicyDocument" : {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Principal": {
                    "Federated": "cognito-identity.amazonaws.com"
                },
                "Action": "sts:AssumeRoleWithWebIdentity",
                "Condition": {
                    "StringEquals": {
                        "cognito-identity.amazonaws.com:aud": resources.identityPool.ref
                    },
                    "ForAnyValue:StringLike": {
                        "cognito-identity.amazonaws.com:amr": "authenticated"
                    }
                }
            }
        ]
    },
      "Policies" : [
        {
          "PolicyName" : resources.userPool.userPoolName+"-group-admin-policy",
          "PolicyDocument": {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Action": [
                      "cognito-idp:ListGroups"
                    ],
                    "Resource": resources.userPool.attrArn
                }
            ]
          }
        }
      ]
    }
  },"CognitoGroupAdminRole");

  resources.addCfnResource({
    type:"AWS::Cognito::UserPoolGroup",
    properties:{
      "UserPoolId": resources.userPool.ref,
      "GroupName" : "admin-group",
      "Precedence" : 0,
      "RoleArn" : {"Fn::GetAtt" : ["CognitoGroupAdminRole", "Arn"] }
    }
  },"CognitoAdminGroup");
    
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
