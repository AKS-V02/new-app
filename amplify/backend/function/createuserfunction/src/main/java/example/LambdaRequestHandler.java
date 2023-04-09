/* Amplify Params - DO NOT EDIT
	AUTH_NEWAPP_USERPOOLID
	ENV
	REGION
Amplify Params - DO NOT EDIT */

package example;

import java.util.List;
import java.util.Map;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.LambdaLogger;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.cognitoidentityprovider.CognitoIdentityProviderClient;
import software.amazon.awssdk.services.cognitoidentityprovider.model.AdminAddUserToGroupRequest;
import software.amazon.awssdk.services.cognitoidentityprovider.model.AdminAddUserToGroupResponse;
import software.amazon.awssdk.services.cognitoidentityprovider.model.AdminCreateUserRequest;
import software.amazon.awssdk.services.cognitoidentityprovider.model.AdminCreateUserResponse;
import software.amazon.awssdk.services.cognitoidentityprovider.model.AttributeType;
import software.amazon.awssdk.services.cognitoidentityprovider.model.DeliveryMediumType;

public class LambdaRequestHandler implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent>{   
    APIGatewayProxyResponseEvent response = new APIGatewayProxyResponseEvent();
    Map<String, String> headers = Map.of("Content-Type", "application/json", 
                                        "Access-Control-Allow-Origin", "*",
                                        "Access-Control-Allow-Methods", "*");
    CognitoIdentityProviderClient cognitoClient = CognitoIdentityProviderClient.builder()
                                                    .region(Region.AP_SOUTH_1)
                                                    // .credentialsProvider(ProfileCredentialsProvider.create())    
                                                    .build();

    String userPoolId = System.getenv("AUTH_NEWAPP_USERPOOLID");
    Gson gson = new Gson();

    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent input, Context context) {
            LambdaLogger logger = context.getLogger();

        try {
            if (input.getHttpMethod().equalsIgnoreCase("POST")){
                JsonObject inputObj = JsonParser.parseString(input.getBody()).getAsJsonObject();
                String greetingString = String.format("Hello %s with email %s and from group %s", 
                                                inputObj.get("username").getAsString(), 
                                                inputObj.get("email").getAsString(), 
                                                inputObj.get("group").getAsString());
                logger.log(greetingString);



                AdminCreateUserResponse createuserResponse = cognitoClient.adminCreateUser(AdminCreateUserRequest.builder()
                                                            .desiredDeliveryMediums(DeliveryMediumType.EMAIL)
                                                            .userPoolId(userPoolId)
                                                            .username(inputObj.get("username").getAsString())
                                                            // .messageAction(MessageActionType.RESEND)
                                                            .userAttributes(List.of(AttributeType.builder().name("email")
                                                                                .value(inputObj.get("email").getAsString())
                                                                                .build(),
                                                                                AttributeType.builder().name("email_verified")
                                                                                .value("true")
                                                                                .build()))
                                                            .build());
                
                AdminAddUserToGroupResponse addToGroupResponse = cognitoClient.adminAddUserToGroup(AdminAddUserToGroupRequest.builder()
                                                                .groupName(inputObj.get("group").getAsString())
                                                                .userPoolId(userPoolId)
                                                                .username(createuserResponse.user().username())                    
                                                                .build());
                
                logger.log(gson.toJson(addToGroupResponse.sdkHttpResponse()));

            return response.withBody(greetingString+
                                    " createuserResponse "+createuserResponse.user().userStatusAsString())
                                    .withHeaders(headers).withStatusCode(200);
            } else {
                return response.withBody("Wrong Http Method").withHeaders(headers).withStatusCode(404);
            }
            
        } catch (Exception e) {
            return response.withBody("Error: "+e).withHeaders(headers).withStatusCode(500);
        }  
    }
}