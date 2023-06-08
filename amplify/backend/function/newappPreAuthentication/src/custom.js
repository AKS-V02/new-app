// const aws = require('aws-sdk');

// const cognitoIdentityServiceProvider = new aws.CognitoIdentityServiceProvider({
//   apiVersion: '2016-04-18',
// });
/**
 * @type {import('@types/aws-lambda').PreAuthenticationTriggerHandler}
 */
exports.handler = async (event, context) => {
  // insert code to be executed by your lambda trigger
  console.log("pre authentication "+JSON.stringify(event));
  // if(event.userName==="newUser"){
  //   const resetPasswordParam = {
  //     Username: event.userName,
  //     UserPoolId: event.userPoolId
  //   }
  //   await cognitoIdentityServiceProvider.adminResetUserPassword(resetPasswordParam).promise();
  //   throw new Error("Users Password expired");
  // }

  return event;
};
