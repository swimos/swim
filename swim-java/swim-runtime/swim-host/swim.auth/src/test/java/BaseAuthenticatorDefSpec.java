import java.io.IOException;
import java.math.BigInteger;
import org.testng.annotations.Test;
import swim.auth.BaseAuthenticatorDef;
import swim.collections.FingerTrieSeq;
import swim.collections.HashTrieMap;
import swim.io.http.HttpSettings;
import swim.security.PublicKeyDef;
import swim.security.RsaPublicKeyDef;
import swim.structure.Form;
import swim.structure.Item;
import swim.uri.Uri;
import static org.testng.AssertJUnit.assertEquals;

public class BaseAuthenticatorDefSpec {

  @Test
  public void testBaseAuthForm() {
    final BaseAuthenticatorDef expectedDef = getBaseAuthenticatorDef();
    final Form<BaseAuthenticatorDef> form = BaseAuthenticatorDef.form();
    final Item items = form.mold(expectedDef);
    final BaseAuthenticatorDef actualDef = form.cast(items);

    assertEquals(actualDef, expectedDef);
  }

  @Test
  public void testBaseAuthFormFromFile() throws IOException {
    final BaseAuthenticatorDef expectedDef = getBaseAuthenticatorDef();
    final Form<BaseAuthenticatorDef> form = BaseAuthenticatorDef.form();
    final BaseAuthenticatorDef actualDef = form.cast(TestUtils.readReconAuthSpec("base-auth.recon"));

    assertEquals(actualDef, expectedDef);
  }

  @Test
  public void testBaseAuthGoogleForm() {
    final BaseAuthenticatorDef expectedDef = getBaseAuthenticatorGoogleDef();
    final Form<BaseAuthenticatorDef> form = BaseAuthenticatorDef.form();
    final Item items = form.mold(expectedDef);
    final BaseAuthenticatorDef actualDef = form.cast(items);

    assertEquals(actualDef, expectedDef);
  }

  @Test
  public void testBaseAuthGoogleFormFromFile() throws IOException {
    final BaseAuthenticatorDef expectedDef = getBaseAuthenticatorGoogleDef();
    final Form<BaseAuthenticatorDef> form = BaseAuthenticatorDef.form();
    final BaseAuthenticatorDef actualDef = form.cast(TestUtils.readReconAuthSpec("base-auth-google.recon"));

    assertEquals(actualDef, expectedDef);
  }

  @Test
  public void testBaseAuthOpenIdForm() {
    final BaseAuthenticatorDef expectedDef = getBaseAuthenticatorOpenIdDef();
    final Form<BaseAuthenticatorDef> form = BaseAuthenticatorDef.form();
    final Item items = form.mold(expectedDef);
    final BaseAuthenticatorDef actualDef = form.cast(items);

    assertEquals(actualDef, expectedDef);
  }

  @Test
  public void testBaseAuthOpenIdFormFromFile() throws IOException {
    final BaseAuthenticatorDef expectedDef = getBaseAuthenticatorOpenIdDef();
    final Form<BaseAuthenticatorDef> form = BaseAuthenticatorDef.form();
    final BaseAuthenticatorDef actualDef = form.cast(TestUtils.readReconAuthSpec("base-auth-open-id.recon"));

    assertEquals(actualDef, expectedDef);
  }

  static BaseAuthenticatorDef getBaseAuthenticatorDef() {
    FingerTrieSeq<PublicKeyDef> keys = FingerTrieSeq.empty();
    keys = keys.appended(new RsaPublicKeyDef(BigInteger.valueOf(123), BigInteger.valueOf(456)));
    keys = keys.appended(new RsaPublicKeyDef(BigInteger.valueOf(321), BigInteger.valueOf(654)));

    HashTrieMap<String, FingerTrieSeq<String>> claims = HashTrieMap.empty();
    claims = claims.updated("client_id", FingerTrieSeq.of("some_client_id"));
    claims = claims.updated("iss", FingerTrieSeq.of("https://example.com"));
    claims = claims.updated("token_use", FingerTrieSeq.of("first_access", "second_access"));
    return new BaseAuthenticatorDef("auth", "custom_access_token", "custom_exp", claims, keys, Uri.parse("https://test.com"), HttpSettings.standard());
  }

  static BaseAuthenticatorDef getBaseAuthenticatorGoogleDef() {
    HashTrieMap<String, FingerTrieSeq<String>> claims = HashTrieMap.empty();
    claims = claims.updated("aud", FingerTrieSeq.of("custom_google_audience"));
    claims = claims.updated("email", FingerTrieSeq.of("email_1@google.com", "email_2@google.com"));
    return new BaseAuthenticatorDef("google", "idToken", "exp", claims, FingerTrieSeq.empty(), Uri.parse("https://www.googleapis.com/oauth2/v3/certs"), HttpSettings.standard());
  }

  static BaseAuthenticatorDef getBaseAuthenticatorOpenIdDef() {
    FingerTrieSeq<PublicKeyDef> keys = FingerTrieSeq.empty();
    keys = keys.appended(new RsaPublicKeyDef(BigInteger.valueOf(987), BigInteger.valueOf(654)));
    keys = keys.appended(new RsaPublicKeyDef(BigInteger.valueOf(432), BigInteger.valueOf(210)));

    HashTrieMap<String, FingerTrieSeq<String>> claims = HashTrieMap.empty();
    claims = claims.updated("aud", FingerTrieSeq.of("open_id_audience_1", "open_id_audience_2"));
    claims = claims.updated("iss", FingerTrieSeq.of("open_id_issuer"));
    return new BaseAuthenticatorDef("open_id", "idToken", "exp", claims, keys, Uri.parse("https://open-id.com"), HttpSettings.standard());
  }

}
