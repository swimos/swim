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
  public void testBaseForm() {

    FingerTrieSeq<PublicKeyDef> keys = FingerTrieSeq.empty();
    keys = keys.appended(new RsaPublicKeyDef(BigInteger.valueOf(123), BigInteger.valueOf(456)));
    keys = keys.appended(new RsaPublicKeyDef(BigInteger.valueOf(321), BigInteger.valueOf(654)));

    HashTrieMap<String, FingerTrieSeq<String>> claims = HashTrieMap.empty();
    claims = claims.updated("client_id", FingerTrieSeq.of("some_client_id"));
    claims = claims.updated("iss", FingerTrieSeq.of("https://example.com"));
    claims = claims.updated("token_use", FingerTrieSeq.of("first_access", "second_access"));
    final BaseAuthenticatorDef originalDef = new BaseAuthenticatorDef("cognito", "custom_access_token", "custom_exp", claims, keys, Uri.parse("https://test.com"), HttpSettings.standard());

    final Form<BaseAuthenticatorDef> form = BaseAuthenticatorDef.form();
    final Item items = form.mold(originalDef);
    final BaseAuthenticatorDef newDef = form.cast(items);

    assertEquals(newDef, originalDef);
  }

}
