import { AmplifyProjectInfo, AmplifyRootStackTemplate} from '@aws-amplify/cli-extensibility-helper';

export function override(resources: AmplifyRootStackTemplate, amplifyProjectInfo: AmplifyProjectInfo) {
    
    resources.addCfnResource({
        type:"AWS::IAM::Policy",
        properties:{
        "PolicyName" : { "Fn::Join" : [ "-", [ amplifyProjectInfo.projectName , "cognitogroup-admin-policy"] ] },
        "PolicyDocument": {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Action": [
                    "cognito-idp:ListGroups"
                    ],
                    "Resource": {"Fn::GetAtt" : ["authnewapp", "Outputs.UserPoolArn"] }
                }
            ]
        },
        "Roles": [ { "Fn::Select" : [ "1", { "Fn::Split" : [ "/", {"Fn::GetAtt" : ["authuserPoolGroups", "Outputs.adminGroupRole"] } ] } ] } ]
        }
  },"cognitogroupadminpolicy");
      
}
