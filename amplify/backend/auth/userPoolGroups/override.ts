import { AmplifyProjectInfo, AmplifyUserPoolGroupStackTemplate } from '@aws-amplify/cli-extensibility-helper';

export function override(resources: AmplifyUserPoolGroupStackTemplate, amplifyProjectInfo: AmplifyProjectInfo) {

//     resources.addCfnResource({
//         type:"AWS::IAM::Policy",
//         properties:{
//         "PolicyName" : { "Fn::Join" : [ "-", [ amplifyProjectInfo.projectName , "cognitogroup-admin-policy"] ] },
//         "PolicyDocument": {
//             "Version": "2012-10-17",
//             "Statement": [
//                 {
//                     "Effect": "Allow",
//                     "Action": [
//                     "cognito-idp:ListGroups"
//                     ],
//                     "Resource": { "Fn::Sub" : "arn:aws:cognito-idp:${AWS::Region}:${AWS::AccountId}:userpool/${authnewappUserPoolId}" }
//                 }
//             ]
//         },
//         "Roles": [ {"Ref" : "adminGroupRole"} ]
//         }
//   },"cognitogroupadminpolicy");

//       for(const role in resources.userPoolGroupRole){
//         resources.addCfnOutput({
//             value: resources.userPoolGroupRole[role].roleName
//           },resources.userPoolGroupRole[role].logicalId+"Name");
//       } 
   
   
    resources.addCfnResource({
        type:"AWS::Cognito::UserPoolUser",
        properties:{
          "UserPoolId": { "Ref" : "authnewappUserPoolId" },
          "DesiredDeliveryMediums" : [ "EMAIL" ],
          // "ForceAliasCreation" : Boolean,
          // "MessageAction" : "RESEND",
          "UserAttributes" : [ 
            {
              "Name" : "email",
              "Value" : "fouyeppikeipu-4982@yopmail.com"
            },
            {
              "Name" : "email_verified",
              "Value" : "true"
            }
          ],
          "Username" : "Admin"
        }
      },"Admin");
    
    
      resources.addCfnResource({
        type:"AWS::Cognito::UserPoolUserToGroupAttachment",
        properties:{
          "GroupName" : { "Ref" : "adminGroup" },
          "Username" : { "Ref" : "Admin" },
          "UserPoolId" : { "Ref" : "authnewappUserPoolId" }
        }
      },"usertogroupattachement");


      
}
