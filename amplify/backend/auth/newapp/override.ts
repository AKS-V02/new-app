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


//resoursce for cognito admin group poc

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
  //       "Ref": "CognitoGroupAdminRole"
  //    } ]
  //   }
  // },"cognitogroupadminpolicy");


   

  // resources.addCfnResource({
  //   type:"AWS::IAM::Role",
  //   properties:{
  //     "RoleName" : resources.userPool.userPoolName+"-group-admin-role",
  //     "AssumeRolePolicyDocument" : {
  //       "Version": "2012-10-17",
  //       "Statement": [
  //           {
  //               "Effect": "Allow",
  //               "Principal": {
  //                   "Federated": "cognito-identity.amazonaws.com"
  //               },
  //               "Action": "sts:AssumeRoleWithWebIdentity",
  //               "Condition": {
  //                   "StringEquals": {
  //                       "cognito-identity.amazonaws.com:aud": resources.identityPool.ref
  //                   },
  //                   "ForAnyValue:StringLike": {
  //                       "cognito-identity.amazonaws.com:amr": "authenticated"
  //                   }
  //               }
  //           }
  //       ]
  //   },
  //     // "Policies" : [
  //     //   {
  //     //     "PolicyName" : resources.userPool.userPoolName+"-group-admin-policy",
  //     //     "PolicyDocument": {
  //     //       "Version": "2012-10-17",
  //     //       "Statement": [
  //     //           {
  //     //               "Effect": "Allow",
  //     //               "Action": [
  //     //                 "cognito-idp:ListGroups",
  //     //                 "cognito-idp:ListUsers",
  //     //                 "cognito-idp:AdminDeleteUser"
  //     //               ],
  //     //               "Resource": resources.userPool.attrArn
  //     //           }
  //     //         //   ,
  //     //         //   {
  //     //         //     "Action": [
  //     //         //         "s3:DeleteObject",
  //     //         //         "s3:PutObject",
  //     //         //         "s3:PutObjectAcl",
  //     //         //         "s3:GetObject"
  //     //         //     ],
  //     //         //     "Resource": [
                      
  //     //         //     ],
  //     //         //     "Effect": "Allow"
  //     //         // }
  //     //       ]
  //     //     }
  //     //   }
  //     // ]
  //   }
  // },"CognitoGroupAdminRole");


  // resources.addCfnResource({
  //   type:"AWS::Cognito::UserPoolGroup",
  //   properties:{
  //     "UserPoolId": resources.userPool.ref,
  //     "GroupName" : "admin-group",
  //     // "Precedence" : 0,
  //     "RoleArn" : {"Fn::GetAtt" : ["CognitoGroupAdminRole", "Arn"] }
  //   }
  // },"CognitoAdminGroup");


  // resources.addCfnResource({
  //   type:"AWS::Cognito::UserPoolUser",
  //   properties:{
  //     "UserPoolId": resources.userPool.ref,
  //     "DesiredDeliveryMediums" : [ "EMAIL" ],
  //     // "ForceAliasCreation" : Boolean,
  //     // "MessageAction" : "RESEND",
  //     "UserAttributes" : [ 
  //       {
  //         "Name" : "email",
  //         "Value" : "quappelledaxi-6839@yopmail.com"
  //       },
  //       {
  //         "Name" : "email_verified",
  //         "Value" : "true"
  //       }
  //     ],
  //     "Username" : "OrgAdmin"
  //   }
  // },"OrgAdmin");


  // resources.addCfnResource({
  //   type:"AWS::Cognito::UserPoolUserToGroupAttachment",
  //   properties:{
  //     "GroupName" : { "Ref" : "CognitoAdminGroup" },
  //     "Username" : { "Ref" : "OrgAdmin" },
  //     "UserPoolId" : resources.userPool.ref
  //   }
  // },"usertogroupattachement");



  //property override for mail configuration
  resources.userPool.addPropertyOverride("AdminCreateUserConfig",
  {
    "AllowAdminCreateUserOnly" : false,
    "InviteMessageTemplate" : {
      "EmailMessage" : "Your Project App user name '{username}', with temporary password, as {####}",
      "EmailSubject" : "You are invited to use project app"
    }
    // "UnusedAccountValidityDays" : Integer
  });
  resources.userPool.addPropertyOverride("VerificationMessageTemplate",{
    "DefaultEmailOption" : "CONFIRM_WITH_CODE",
    "EmailMessage" : "Your verification code for project app {####}",
    // "EmailMessageByLink" : String,
    "EmailSubject" : "Your verification code"
    // "EmailSubjectByLink" : String,
    // "SmsMessage" : String
  });
   
  
  // to get prefered group role aws credentials
  resources.identityPoolRoleMap.addPropertyOverride("RoleMappings",{
   "cognitoGroupRoleMappingWebClient" : {
        "Type": "Token",
        "AmbiguousRoleResolution": "AuthenticatedRole",
        "IdentityProvider" : { "Fn::Join" : [ ":", [ resources.userPool.attrProviderName, resources.userPoolClientWeb.ref ] ] }
      },
      "cognitoGroupRoleMappingappClient" : {
        "Type": "Token",
        "AmbiguousRoleResolution": "AuthenticatedRole",
        "IdentityProvider" : { "Fn::Join" : [ ":", [ resources.userPool.attrProviderName, resources.userPoolClient.ref ] ] }
      }
  });


  // resourses for client secreat poc
    resources.addCfnResource({
      type:"AWS::Cognito::UserPoolDomain",
      properties:{
        "Domain" : "overridetestdomain",
        "UserPoolId" :  {
          "Ref": "UserPool"
        }
      },

    },"overridetestdomain");


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
