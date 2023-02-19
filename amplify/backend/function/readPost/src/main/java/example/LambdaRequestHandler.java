/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	STORAGE_POSTTABLE_ARN
	STORAGE_POSTTABLE_NAME
	STORAGE_POSTTABLE_STREAMARN
Amplify Params - DO NOT EDIT */

package example;

import com.amazonaws.services.lambda.runtime.Context; 
import com.amazonaws.services.lambda.runtime.RequestHandler;

public class LambdaRequestHandler implements RequestHandler<RequestClass, ResponseClass>{   

    public ResponseClass handleRequest(RequestClass request, Context context){
        String greetingString = String.format("Hello %s %s!", request.firstName, request.lastName);
        return new ResponseClass(greetingString);
    }
}