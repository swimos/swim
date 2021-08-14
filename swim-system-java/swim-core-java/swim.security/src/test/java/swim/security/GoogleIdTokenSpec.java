// Copyright 2015-2021 Swim inc.
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
      PUBLIC_KEY_DEFS = FingerTrieSeq.of(PublicKeyDef.from(certificateFactory.generateCertificate(new ByteArrayInputStream("-----BEGIN CERTIFICATE-----\nMIIDJjCCAg6gAwIBAgIIVGBFY93ZYokwDQYJKoZIhvcNAQEFBQAwNjE0MDIGA1UE\nAxMrZmVkZXJhdGVkLXNpZ25vbi5zeXN0ZW0uZ3NlcnZpY2VhY2NvdW50LmNvbTAe\nFw0yMTA2MTIwNDI5NTVaFw0yMTA2MjgxNjQ0NTVaMDYxNDAyBgNVBAMTK2ZlZGVy\nYXRlZC1zaWdub24uc3lzdGVtLmdzZXJ2aWNlYWNjb3VudC5jb20wggEiMA0GCSqG\nSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDRi52e+K7A11wKhcQzAyUlaHFZimYB5FdD\nwN/lsJV/nEVUSYvlqb/ZNNZHBF/fi+om6ganJ/dLvMl4m/wjYvK+anDfctF5ESQ5\nsK3W6nXskbDn930rYx/n0Sec+R3thQaSVTGN7yvEguJOGI90RoXw/mlF575YPaaZ\nBK6DSuo2Uylp1hVoy/dj8cuv3sd6HUAJGh9h+/aGYZKYLqijRI3h3mA/7+CADOD0\nqjssNVwGDpNYB8kuHfcaky0AjYw+N3pcUmO75H13rwgMIhSj4ITwrSkBmdcZLxpa\nWf92mNmGUyNeuBjjbdBrhg2yWg9zCRDbSuTxcZgWvQf/0a5YhpZZAgMBAAGjODA2\nMAwGA1UdEwEB/wQCMAAwDgYDVR0PAQH/BAQDAgeAMBYGA1UdJQEB/wQMMAoGCCsG\nAQUFBwMCMA0GCSqGSIb3DQEBBQUAA4IBAQCrfG7K0x6L/Y9Sj/Au3GraEX3lPScu\n5AuW7tP26iYMf69n4m8Vi/UtkiHbZJeOWQ0HNgevq50ke8MHXOMBoHMfcjEsPyxu\nfWRtIsqNWnNCWgbfSTIhk/NLHbZKnSbW+qysLcDNMrFc1XEaMR7i0XTQE8tNPfV9\nNJSI+scn6Oq/z6Tjdw+iSbqkw8n8+PfSRl0J8hx6gEQoKFagw1Zt/jAApSW6SWKb\ny4VwFHgTVDbPwdMV4VbseKKx66Lb8qGPqTu8TM70nQlIHUnbXccalXGOaQsycaaN\nWPGpychl1JxUftwbdaW/dY5NVpGEwXJ2DRAJiNK6jDcSsrjOJI4d7ukb\n-----END CERTIFICATE-----\n".getBytes(Charset.forName("US-ASCII")))).getPublicKey()),
                                         PublicKeyDef.from(certificateFactory.generateCertificate(new ByteArrayInputStream("-----BEGIN CERTIFICATE-----\nMIIDJjCCAg6gAwIBAgIIRAoQks63w4EwDQYJKoZIhvcNAQEFBQAwNjE0MDIGA1UE\nAxMrZmVkZXJhdGVkLXNpZ25vbi5zeXN0ZW0uZ3NlcnZpY2VhY2NvdW50LmNvbTAe\nFw0yMTA2MjAwNDI5NTdaFw0yMTA3MDYxNjQ0NTdaMDYxNDAyBgNVBAMTK2ZlZGVy\nYXRlZC1zaWdub24uc3lzdGVtLmdzZXJ2aWNlYWNjb3VudC5jb20wggEiMA0GCSqG\nSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCsf17gul45G1GRC6jm8ov5yws+cmbJZT+o\neI6pbJdWyg/KZQoiY2w+Vps5y+RhiU9+VYT6qa1AIf4AIOPHMKHIiS2v7nN4IRmJ\n2WfylYSYOr5H5peL+xCAlSv7sf9jr2EPxxHQrcvILzpBFumKDFbwXqFRT1qP/1Va\n5XCwy8uJCdtvNLgJa+L9bMhb2IbSA62GyyV99r/quqhCkdzQZ+wS7d73vVBlwnIz\nGvqm1j9u9PAhirBG/2m3G0pMyqi9XpgE3mf8uEIOaTWAEuZJ6PqZ8dJbaKjpNdlp\nXc9rIvZRO17qqu8CQX9FdS1V64PGbixxR7VF1/5N2wBcWbUo82rjAgMBAAGjODA2\nMAwGA1UdEwEB/wQCMAAwDgYDVR0PAQH/BAQDAgeAMBYGA1UdJQEB/wQMMAoGCCsG\nAQUFBwMCMA0GCSqGSIb3DQEBBQUAA4IBAQCGOTPITDKeIsTJhueXYtp9t3u0L8Id\nO58xb5dDbNGbi9E/C0cdDq8SfdFBHvOL8eJJSjzCRefRi1NhMlWaWsT471GgXdUV\nHR0CSV87Gj6BvMcAq9WFQu9k6LFtN2qp8CsFFEbjgPW3GFSXriy0W/VRzmb4aUbz\nVjo+EOTAiQP05qQ0bahaXWxXyftctMqpmM/EjFKZZwSH2fuFRNiq+0prIG8xRUYp\nakyr4D+GC0RrUpCa2SfGoojSYQPlQfkZGyeGLBi1UQImCKBJ8wYVaSIaVlLHYZik\nu/lQUGTPW3NLCn0id4AKAx3Ojf0t2jhsPy9u7kW5mPQA/CeRWjsPZ2uX\n-----END CERTIFICATE-----\n".getBytes(Charset.forName("US-ASCII")))).getPublicKey()));
    } catch (CertificateException cause) {
      throw new ExceptionInInitializerError(cause);
    }
  }

}
