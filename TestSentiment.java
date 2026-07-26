import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class TestSentiment {
    public static void main(String[] args) throws Exception {
        String commentaire = "Très mauvaise expérience. La maison était sale, le wifi ne marchait pas et il y avait beaucoup de bruit la nuit à cause de la route. Je suis très déçu.";
        String url = "http://localhost:8000/analyze";
        String requestBody = "{\"text\": \"" + commentaire + "\"}";

        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        System.out.println("Status: " + response.statusCode());
        System.out.println("Body: " + response.body());

        Matcher m = Pattern.compile("\"sentiment\"\\s*:\\s*\"(POSITIF|NEGATIF|NEUTRE)\"").matcher(response.body());
        if (m.find()) {
            System.out.println("Parsed Sentiment: " + m.group(1));
        } else {
            System.out.println("Regex didn't match!");
        }
    }
}
