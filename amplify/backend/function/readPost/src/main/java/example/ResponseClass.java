/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	STORAGE_POSTTABLE_ARN
	STORAGE_POSTTABLE_NAME
	STORAGE_POSTTABLE_STREAMARN
Amplify Params - DO NOT EDIT */

package example;
        
     public class ResponseClass {
        String greetings;

        public String getGreetings() {
            return this.greetings;
        }

        public void setGreetings(String greetings) {
            this.greetings = greetings;
        }

        public ResponseClass(String greetings) {
            this.greetings = greetings;
        }
    }