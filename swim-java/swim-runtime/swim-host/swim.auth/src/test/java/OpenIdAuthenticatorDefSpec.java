import java.io.IOException;
import java.math.BigInteger;
import org.testng.annotations.Test;
import swim.auth.OpenIdAuthenticatorDef;
import swim.collections.FingerTrieSeq;
import swim.io.http.HttpSettings;
import swim.security.PublicKeyDef;
import swim.security.RsaPublicKeyDef;
import swim.structure.Form;
import swim.structure.Item;
import swim.uri.Uri;
import static org.testng.AssertJUnit.assertEquals;

public class OpenIdAuthenticatorDefSpec {

  @Test
  public void testOpenIdAuthForm() {
    final OpenIdAuthenticatorDef expectedDef = getOpenIdAuthenticatorDef();
    final Form<OpenIdAuthenticatorDef> form = OpenIdAuthenticatorDef.form();
    final Item items = form.mold(expectedDef);
    final OpenIdAuthenticatorDef actualDef = form.cast(items);

    assertEquals(actualDef, expectedDef);
  }

  @Test
  public void testOpenIdAuthFormFromFile() throws IOException {
    final OpenIdAuthenticatorDef expectedDef = getOpenIdAuthenticatorDef();
    final Form<OpenIdAuthenticatorDef> form = OpenIdAuthenticatorDef.form();
    final OpenIdAuthenticatorDef actualDef = form.cast(TestUtils.readReconAuthSpec("open-id-auth.recon"));

    assertEquals(actualDef, expectedDef);
  }

  static OpenIdAuthenticatorDef getOpenIdAuthenticatorDef() {
    FingerTrieSeq<PublicKeyDef> keys = FingerTrieSeq.empty();
    keys = keys.appended(new RsaPublicKeyDef(BigInteger.valueOf(987), BigInteger.valueOf(654)));
    keys = keys.appended(new RsaPublicKeyDef(BigInteger.valueOf(432), BigInteger.valueOf(210)));

    FingerTrieSeq<String> audiences = FingerTrieSeq.empty();
    audiences = audiences.appended("open_id_audience_1");
    audiences = audiences.appended("open_id_audience_2");

    FingerTrieSeq<String> issuers = FingerTrieSeq.empty();
    issuers = issuers.appended("open_id_issuer");

    return new OpenIdAuthenticatorDef("open_id", audiences, issuers, keys, Uri.parse("https://open-id.com"), HttpSettings.standard());
  }

}
