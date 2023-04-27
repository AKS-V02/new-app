/* Amplify Params - DO NOT EDIT
	AUTH_NEWAPP_USERPOOLID
	ENV
	REGION
Amplify Params - DO NOT EDIT */

package example;

import java.util.ArrayList;
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
import software.amazon.awssdk.services.cognitoidentityprovider.model.AdminResetUserPasswordRequest;
import software.amazon.awssdk.services.cognitoidentityprovider.model.AdminResetUserPasswordResponse;
import software.amazon.awssdk.services.cognitoidentityprovider.model.AttributeType;
import software.amazon.awssdk.services.cognitoidentityprovider.model.DeliveryMediumType;
import software.amazon.awssdk.services.cognitoidentityprovider.model.GroupType;
import software.amazon.awssdk.services.cognitoidentityprovider.model.ListGroupsRequest;
import software.amazon.awssdk.services.cognitoidentityprovider.model.ListGroupsResponse;
import software.amazon.awssdk.services.cognitoidentityprovider.model.ListUsersRequest;
import software.amazon.awssdk.services.cognitoidentityprovider.model.ListUsersResponse;

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
                String jsonString = gson.toJson(input.getRequestContext().getAuthorizer().get("claims"));
                JsonObject obj = JsonParser.parseString(jsonString).getAsJsonObject();
                if(obj.has("cognito:groups") && obj.get("cognito:groups").getAsString().contains("admin")){
                    if(input.getPath().contains("list-group")){
                        ListGroupsResponse responseGroup = cognitoClient.listGroups(ListGroupsRequest.builder()
                                                .userPoolId(userPoolId)
                                                .limit(5)
                                                .build());
                        logger.log(gson.toJson(responseGroup.groups()));
                        List<String> groupList = new ArrayList<>();
                        for( GroupType group : responseGroup.groups()){
                            groupList.add(group.groupName());
                        }
                        return response.withBody(gson.toJson(groupList))
                                                .withHeaders(headers).withStatusCode(200);
                    }else if(input.getPath().contains("list-user")){
                        JsonObject inputObj = JsonParser.parseString(input.getBody()).getAsJsonObject();
                        ListUsersRequest req = null;
                        if(inputObj.has("filterByEmail")){
                            req = ListUsersRequest.builder()
                                    .userPoolId(userPoolId)
                                    // .attributesToGet(List.of("email", "name", "username", "address"))
                                    .filter("email ^=\""+inputObj.get("filterByEmail").getAsString()+"\"")
                                    .limit(20)
                                    .build();
                        } else if(inputObj.has("paginationToken")){
                            req = ListUsersRequest.builder()
                                    .userPoolId(userPoolId)
                                    // .attributesToGet(List.of())
                                    .paginationToken(inputObj.get("paginationToken").getAsString())
                                    .limit(20)
                                    .build();
                        } else if (inputObj.has("filterByEmail") && inputObj.has("paginationToken")){
                            req = ListUsersRequest.builder()
                                    .userPoolId(userPoolId)
                                    // .attributesToGet(List.of())
                                    .filter("name ^=\""+inputObj.get("filterByEmail").getAsString()+"\"")
                                    .paginationToken(inputObj.get("paginationToken").getAsString())
                                    .limit(20)
                                    .build();
                        } else {
                            req = ListUsersRequest.builder()
                                    .userPoolId(userPoolId)
                                    // .attributesToGet(List.of())
                                    .limit(20)
                                    .build();
                        } 
                        
                        ListUsersResponse responseUsers = cognitoClient.listUsers(req);
                        String paginationToken = responseUsers.paginationToken() != null ?responseUsers.paginationToken():"Null";
                        return response.withBody(gson.toJson(Map.of("users",responseUsers.users()
                                                        ,"paginationToken", paginationToken)))
                                                .withHeaders(headers).withStatusCode(200);
                    }else if(input.getPath().contains("reset-user-password")){
                        JsonObject inputObj = JsonParser.parseString(input.getBody()).getAsJsonObject();
                        AdminResetUserPasswordResponse resp = cognitoClient.adminResetUserPassword(AdminResetUserPasswordRequest.builder()
                                                            .userPoolId(userPoolId)
                                                            .username(inputObj.get("userName").getAsString())
                                                            .build());
                        return response.withBody(gson.toJson(resp))
                                                    .withHeaders(headers).withStatusCode(200);
                    } else {
                    JsonObject inputObj = JsonParser.parseString(input.getBody()).getAsJsonObject();
                    String greetingString = String.format("Hello %s with email %s and from group %s", 
                                                    inputObj.get("username").getAsString(), 
                                                    inputObj.get("email").getAsString(), 
                                                    inputObj.get("phone_number").getAsString(),
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
                                                                                    .build(),
                                                                                     AttributeType.builder().name("phone_number")
                                                                                    .value(inputObj.get("phone_number").getAsString())
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
                    }
                }
             return response.withBody("Unautherized access").withHeaders(headers).withStatusCode(500);
            } else {
                return response.withBody("Wrong Http Method or Path").withHeaders(headers).withStatusCode(404);
            }
            
        } catch (Exception e) {
            return response.withBody("Error: "+e).withHeaders(headers).withStatusCode(500);
        }  
    }
   
}