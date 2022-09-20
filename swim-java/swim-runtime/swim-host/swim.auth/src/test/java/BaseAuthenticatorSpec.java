import java.io.IOException;
import org.testng.annotations.Test;
import swim.auth.BaseAuthenticator;
import swim.auth.BaseAuthenticatorDef;
import swim.auth.GoogleIdAuthenticatorDef;
import swim.auth.OpenIdAuthenticatorDef;
import static org.testng.AssertJUnit.assertEquals;

public class BaseAuthenticatorSpec {

  @Test
  public void testBaseAuthFromGoogleIdDef() throws IOException {
    final BaseAuthenticator expected = new BaseAuthenticator(BaseAuthenticatorDef.form().cast(TestUtils.readReconAuthSpec("base-auth-google-id-equivalent.recon")));
    final BaseAuthenticator actual = new BaseAuthenticator(GoogleIdAuthenticatorDef.form().cast(TestUtils.readReconAuthSpec("google-id-auth.recon")));

    assertEquals(actual, expected);
  }

  @Test
  public void testBaseAuthFromOpenIdDef() throws IOException {
    final BaseAuthenticator expected = new BaseAuthenticator(BaseAuthenticatorDef.form().cast(TestUtils.readReconAuthSpec("base-auth-open-id-equivalent.recon")));
    final BaseAuthenticator actual = new BaseAuthenticator(OpenIdAuthenticatorDef.form().cast(TestUtils.readReconAuthSpec("open-id-auth.recon")));

    assertEquals(actual, expected);
  }

}
