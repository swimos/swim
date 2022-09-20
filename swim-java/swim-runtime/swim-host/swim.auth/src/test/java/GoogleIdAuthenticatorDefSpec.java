import java.io.IOException;
import org.testng.annotations.Test;
import swim.auth.GoogleIdAuthenticatorDef;
import swim.collections.FingerTrieSeq;
import swim.io.http.HttpSettings;
import swim.structure.Form;
import swim.structure.Item;
import swim.uri.Uri;
import static org.testng.AssertJUnit.assertEquals;

public class GoogleIdAuthenticatorDefSpec {

  @Test
  public void testGoogleIdAuthForm() {
    final GoogleIdAuthenticatorDef expectedDef = getGoogleIdAuthenticatorDef();
    final Form<GoogleIdAuthenticatorDef> form = GoogleIdAuthenticatorDef.form();
    final Item items = form.mold(expectedDef);
    final GoogleIdAuthenticatorDef actualDef = form.cast(items);

    assertEquals(actualDef, expectedDef);
  }

  @Test
  public void testGoogleIdAuthFormFromFile() throws IOException {
    final GoogleIdAuthenticatorDef expectedDef = getGoogleIdAuthenticatorDef();
    final Form<GoogleIdAuthenticatorDef> form = GoogleIdAuthenticatorDef.form();
    final GoogleIdAuthenticatorDef actualDef = form.cast(TestUtils.readReconAuthSpec("google-id-auth.recon"));

    assertEquals(actualDef, expectedDef);
  }

  static GoogleIdAuthenticatorDef getGoogleIdAuthenticatorDef() {
    FingerTrieSeq<String> audiences = FingerTrieSeq.empty();
    audiences = audiences.appended("custom_google_audience");

    FingerTrieSeq<String> emails = FingerTrieSeq.empty();
    emails = emails.appended("email_1@google.com");
    emails = emails.appended("email_2@google.com");

    return new GoogleIdAuthenticatorDef("google", audiences, emails, Uri.parse("https://google.com"), HttpSettings.standard());
  }

}
