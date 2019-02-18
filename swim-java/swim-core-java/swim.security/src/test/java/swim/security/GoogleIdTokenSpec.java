// Copyright 2015-2019 SWIM.AI inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package swim.security;

import java.io.ByteArrayInputStream;
import java.nio.charset.Charset;
import java.security.cert.CertificateException;
import java.security.cert.CertificateFactory;
import org.testng.annotations.Test;
import swim.collections.FingerTrieSeq;
import swim.structure.Data;
import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertTrue;

public class GoogleIdTokenSpec {
  @Test
  public void parseToken() {
    final JsonWebSignature jws = JsonWebSignature.parse("eyJhbGciOiJSUzI1NiIsImtpZCI6ImNkYWZlOWQ0NjEwMzRlMDIxYzVmYjUzNTMyYTYxYjljM2RjMTExOGYifQ.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiaWF0IjoxNDg1NzQzODg0LCJleHAiOjE0ODU3NDc0ODQsImF0X2hhc2giOiI5N0w4dDRVOUt3bDQ4OUNaSGViWnN3IiwiYXVkIjoiMzM5NjU2MzAzOTkxLWhqYzFycjJ2djBsY2xucWcwanE3NnI0cWFyOWM4cDYyLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwic3ViIjoiMTE3NjE0NjIwNzAwMDkyOTc5NjEyIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF6cCI6IjMzOTY1NjMwMzk5MS1oamMxcnIydnYwbGNsbnFnMGpxNzZyNHFhcjljOHA2Mi5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsImhkIjoic3dpbS5pdCIsImVtYWlsIjoiY2hyaXNAc3dpbS5pdCIsIm5hbWUiOiJDaHJpcyBTYWNocyIsInBpY3R1cmUiOiJodHRwczovL2xoNi5nb29nbGV1c2VyY29udGVudC5jb20vLXRqVUpURnVZbmM0L0FBQUFBQUFBQUFJL0FBQUFBQUFBQUJFL3I4YTAyNE5MdEd3L3M5Ni1jL3Bob3RvLmpwZyIsImdpdmVuX25hbWUiOiJDaHJpcyIsImZhbWlseV9uYW1lIjoiU2FjaHMiLCJsb2NhbGUiOiJlbiJ9.Iun05gv8uBDsA78S5goD2RN8SfBengCXf7aWInG_7HCKO42T6SNggWYcZdPdthZdtMBFccl9eBpYaX7HsWKPZTQoyqXjrL84DxQqjYB4jXF_MLjxvjbh3QCH5Dk75fkEVgPsamXJW3VdVaNUDxEGnUepklJ25xrqqFTUKF47U1GyZ778Wli1qBErq9iV_t9s52y1vFGUtZ-518qsYNQKAkQ7a28pifw1-HzvDHcMw1Sf5tSSMV2GCazscBgrIpkH_etWYQ_QGh4VkqlZiDOyldOozlbJm63Ldw6Z5-dwmR3JSWX_OqyW9WhgVmLZh8VpLf2KvWUKsmMefG41RzD8cA");
    final GoogleIdToken idToken = GoogleIdToken.verify(jws, PUBLIC_KEY_DEFS);
    assertEquals(idToken.issuer(), "accounts.google.com");
    assertEquals(idToken.issuedAt(), 1485743884L);
    assertEquals(idToken.expiration(), 1485747484L);
    assertEquals(idToken.accessTokenHash(), Data.fromBase64("97L8t4U9Kwl489CZHebZsw=="));
    assertEquals(idToken.audience(), "339656303991-hjc1rr2vv0lclnqg0jq76r4qar9c8p62.apps.googleusercontent.com");
    assertEquals(idToken.subject(), "117614620700092979612");
    assertTrue(idToken.emailVerified());
    assertEquals(idToken.authorizedParty(), "339656303991-hjc1rr2vv0lclnqg0jq76r4qar9c8p62.apps.googleusercontent.com");
    assertEquals(idToken.hostedDomain(), "swim.it");
    assertEquals(idToken.email(), "chris@swim.it");
    assertEquals(idToken.name(), "Chris Sachs");
    assertEquals(idToken.picture(), "https://lh6.googleusercontent.com/-tjUJTFuYnc4/AAAAAAAAAAI/AAAAAAAAABE/r8a024NLtGw/s96-c/photo.jpg");
    assertEquals(idToken.givenName(), "Chris");
    assertEquals(idToken.familyName(), "Sachs");
    assertEquals(idToken.locale(), "en");
  }

  static final FingerTrieSeq<PublicKeyDef> PUBLIC_KEY_DEFS;

  static {
    try {
      final CertificateFactory certificateFactory = CertificateFactory.getInstance("X.509");
      // https://www.googleapis.com/oauth2/v1/certs
      PUBLIC_KEY_DEFS = FingerTrieSeq.of(
          PublicKeyDef.from(certificateFactory.generateCertificate(new ByteArrayInputStream("-----BEGIN CERTIFICATE-----\nMIIDJjCCAg6gAwIBAgIIHKa6o9eGBWUwDQYJKoZIhvcNAQEFBQAwNjE0MDIGA1UE\nAxMrZmVkZXJhdGVkLXNpZ25vbi5zeXN0ZW0uZ3NlcnZpY2VhY2NvdW50LmNvbTAe\nFw0xNzAxMjgxMTQzMzRaFw0xNzAxMzExMjEzMzRaMDYxNDAyBgNVBAMTK2ZlZGVy\nYXRlZC1zaWdub24uc3lzdGVtLmdzZXJ2aWNlYWNjb3VudC5jb20wggEiMA0GCSqG\nSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDA/h3WdbAIdy0aintMqnKtb2VuuMkgV0vX\nJYadCwvLf7fDzFnCwzLAGviyk5/MyM6xS5eQi5IEsHltvcfx2G6x2fAnH/S1LwhD\nJE9rBL9MUSfRUgbw3kNo5uvBTAnkZDuaEBkl5BfvxS4bMMyqxZnVqY+Oq0iRSewi\nIqTUczasIHI1krplHWh4REHNZtdoWvixqY9Zw13BJMMpN1h79sarLAWvjJmWPUqP\n7+1jUpl71NF/0CH5TY6k4rhAz0424TXmmYC38MIrz7NhwXeKSDvfyquNbJ6qvgt8\nRzWfqEEZ7QCp1dPQKoD61lVCbOQM0Z0qcg6VG/mnDi1SfqQfxzY/AgMBAAGjODA2\nMAwGA1UdEwEB/wQCMAAwDgYDVR0PAQH/BAQDAgeAMBYGA1UdJQEB/wQMMAoGCCsG\nAQUFBwMCMA0GCSqGSIb3DQEBBQUAA4IBAQBOGZi1xUD/naLgMJFt9ZfPpGkM5D2J\n3j1SuDfkCoNtwc/Msf2mwH5yQFCOReyezUKJsKzophf9fkdL10dtilKKoXF/3US7\nIr35Xh2r0u1VdGT8JA/xXr9k+YEwLmIQYT7iOnAXPugqV5MK6FQiA+qwT16YiLgO\n1hscd+EEPwe90rpxHZtYfHfWg1pN2PCqEky6AZ+9Hns1TINpieJtNY4B1+qBxQDX\nDu9iQfbGRty9OUDiJr1iOaKNcJZuc3iD/8VUy8UVJYaTLU5bK/lZs/oRPErSWUJ3\nu/RXqbGcKWm5AdukQAjV+69oIXMo82DUQFueOrVg8Yjid3kzQ7Pff2yt\n-----END CERTIFICATE-----\n".getBytes(Charset.forName("US-ASCII")))).getPublicKey()),
          PublicKeyDef.from(certificateFactory.generateCertificate(new ByteArrayInputStream("-----BEGIN CERTIFICATE-----\nMIIDJjCCAg6gAwIBAgIIAKtjcLwyGWowDQYJKoZIhvcNAQEFBQAwNjE0MDIGA1UE\nAxMrZmVkZXJhdGVkLXNpZ25vbi5zeXN0ZW0uZ3NlcnZpY2VhY2NvdW50LmNvbTAe\nFw0xNzAxMjkxMTQzMzRaFw0xNzAyMDExMjEzMzRaMDYxNDAyBgNVBAMTK2ZlZGVy\nYXRlZC1zaWdub24uc3lzdGVtLmdzZXJ2aWNlYWNjb3VudC5jb20wggEiMA0GCSqG\nSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDpTY6j1wQ2oGQRvk0lM3pOBhalcBy87b35\nVtIe12DUnMm6poK7HirKKtXsaQh235yurvnHy07SIAEjOHEKChPBEydu0p7As/YD\nFOD9rDrQJSSbjUcU39+KtLnYFdr5Pq/sEUCY1Jd24JDlGLc12q51RGmKKIflA9NV\nI0RMU4CwiNlqAvWjlCZXoY7iiHdSWxmRGgsiuFpLgnYj4Ji7Px7oOrtxF7kAdTij\nNTi1UWGKkXopyUbK0fSKURvcbsTOCovWfpt02WUQnR6a+tP4aoybH5fqDg8rv9Gc\nlju6kbQgB5g8657DShsvVVHlHHJusPpAab8+PEp1na97E/1Rzf0jAgMBAAGjODA2\nMAwGA1UdEwEB/wQCMAAwDgYDVR0PAQH/BAQDAgeAMBYGA1UdJQEB/wQMMAoGCCsG\nAQUFBwMCMA0GCSqGSIb3DQEBBQUAA4IBAQAySLnRFrLPwL7kZtJITmbJHrV8XH5H\n0GgChtj8bebR6XpW5try6QE9u6he3W8tCNINyi25hWgMosgQULz2Wtk8HtGFIOCl\nDMcYfC1nibTcOx7uxWHnq4KbJiBMdL7Iaviul96MhwnilVQ2N3gA9biY23Gn1e9e\n6RwNANHLwl2EzldTj+C4hSza4YAap3GV2ZqJEEHpAvMkDcq9Pl51vO3lPNQDtJPz\nx/Uure0CdUIxlNwbqGjl4ZEmJWwMpCZww2d+QVJeR+0wOlGrDDn7fLJf0g30SmQQ\n+orxNFE/yNqO9GZDpGKqnUaHkHZYGDLUc35+uT14XK8v1/EwOSngS7Hi\n-----END CERTIFICATE-----\n".getBytes(Charset.forName("US-ASCII")))).getPublicKey()),
          PublicKeyDef.from(certificateFactory.generateCertificate(new ByteArrayInputStream("-----BEGIN CERTIFICATE-----\nMIIDJjCCAg6gAwIBAgIIQYfWFOp7e+cwDQYJKoZIhvcNAQEFBQAwNjE0MDIGA1UE\nAxMrZmVkZXJhdGVkLXNpZ25vbi5zeXN0ZW0uZ3NlcnZpY2VhY2NvdW50LmNvbTAe\nFw0xNzAxMjcxMTQzMzRaFw0xNzAxMzAxMjEzMzRaMDYxNDAyBgNVBAMTK2ZlZGVy\nYXRlZC1zaWdub24uc3lzdGVtLmdzZXJ2aWNlYWNjb3VudC5jb20wggEiMA0GCSqG\nSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDPXon5fTiIKWQHs9GMqIL0VOa3byAte5DX\nHSSZ6If5521qTodTtZznL4jPBj37o/gwVqj7jKP6D+U89IJkkod4rtCB+exFkLuY\naWyVtPWbvQSeXitQ0VtyXpWERWl6I2hfFj4+mhXu1elHh0U0lOKJKS7dkaTzsUDb\nDWhdgd3cUMm/7Z+bqviC9dqmiwoNqvUygKANPjggPpyQAT4TDJxIVbk/mvoYQVLM\noW7lC4zk8jbYiJQnAfHx977So4K2/br4Y90PUzqkNGRRfAKTSwdLFrlbP7iVQKyG\nLruP8HEZy62SEhNgnD+oR6v2pYzFSISh6A4zNJLeTIZGFcGreYmpAgMBAAGjODA2\nMAwGA1UdEwEB/wQCMAAwDgYDVR0PAQH/BAQDAgeAMBYGA1UdJQEB/wQMMAoGCCsG\nAQUFBwMCMA0GCSqGSIb3DQEBBQUAA4IBAQCkarVl/Nr9tCmqN73srdjMiLuwoyvR\nnJI0EgFmnxWaO+isVJfLMZWqsSYuv75QkzgcHgEBhwaZ/vdNNwdRvScjtjo/ywk1\n0CJ9YTQnrHx7DBg/MxJc+E3pYLwM07P4X+T0IJwTKABVutO0IG4Kg2mQSQAobgQs\n95hLuS+P/eW6kbG0ByhptViub65CII2D9Bn760iIhEmAfWBuhSnMJ73tT8tgKxdh\njS2mFU1OkZXVdSBPeHs0rhe5jTkIXFR8kj7lJxWnJh0m6FeQr5/VfYrBBkrEEg8k\nb++mOob9vgSlJsgR2WHrQpuIFZ8WBP04TfB9PUKTvomwakOuYdu9eMcF\n-----END CERTIFICATE-----\n".getBytes(Charset.forName("US-ASCII")))).getPublicKey()));
    } catch (CertificateException cause) {
      throw new ExceptionInInitializerError(cause);
    }
  }
}
