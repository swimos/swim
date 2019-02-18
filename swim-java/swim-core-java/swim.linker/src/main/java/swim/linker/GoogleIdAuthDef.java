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

package swim.linker;

import swim.api.auth.Authenticated;
import swim.api.auth.Credentials;
import swim.api.auth.Identity;
import swim.api.policy.PolicyDirective;
import swim.codec.Debug;
import swim.codec.Format;
import swim.codec.Output;
import swim.codec.ParserException;
import swim.collections.FingerTrieSeq;
import swim.collections.HashTrieSet;
import swim.concurrent.AbstractTimer;
import swim.concurrent.TimerFunction;
import swim.concurrent.TimerRef;
import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.http.header.Host;
import swim.io.TlsSettings;
import swim.io.http.AbstractHttpClient;
import swim.io.http.AbstractHttpRequester;
import swim.io.http.HttpSettings;
import swim.security.GoogleIdToken;
import swim.security.JsonWebKey;
import swim.security.PublicKeyDef;
import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Kind;
import swim.structure.Record;
import swim.structure.Value;
import swim.uri.Uri;
import swim.uri.UriAuthority;
import swim.util.Builder;
import swim.util.Murmur3;

public final class GoogleIdAuthDef extends AuthDef implements Debug {
  final FingerTrieSeq<String> audiences;
  HashTrieSet<String> emails;
  final Uri publicKeyUri;
  HttpSettings httpSettings;
  TimerRef publicKeyRefreshTimer;
  FingerTrieSeq<PublicKeyDef> publicKeyDefs;

  public GoogleIdAuthDef(FingerTrieSeq<String> audiences, HashTrieSet<String> emails) {
    this(audiences, emails, PUBLIC_KEY_URI);
  }

  public GoogleIdAuthDef(FingerTrieSeq<String> audiences, HashTrieSet<String> emails, Uri publicKeyUri) {
    this.audiences = audiences;
    this.emails = emails;
    this.publicKeyUri = publicKeyUri;
  }

  @Override
  public void setContext(AuthenticatorContext context) {
    super.setContext(context);
    refreshPublicKeys();
    if (this.publicKeyRefreshTimer != null) {
      this.publicKeyRefreshTimer.cancel();
    }
    this.publicKeyRefreshTimer = context.schedule().setTimer(PUBLIC_KEY_REFRESH_INTERVAL,
                                                           new GoogleIdPublicKeyTimer(this));
  }

  public FingerTrieSeq<String> audiences() {
    return this.audiences;
  }

  public HashTrieSet<String> emails() {
    return this.emails;
  }

  public void addEmail(String email) {
    this.emails = emails.added(email);
  }

  public void removeEmail(String email) {
    this.emails = emails.removed(email);
  }

  public FingerTrieSeq<PublicKeyDef> getPublicKeyDefs() {
    return this.publicKeyDefs;
  }

  public void setPublicKeyDefs(FingerTrieSeq<PublicKeyDef> publicKeyDefs) {
    this.publicKeyDefs = publicKeyDefs;
  }

  public void refreshPublicKeys() {
    if (this.httpSettings == null) {
      this.httpSettings = HttpSettings.standard().tlsSettings(TlsSettings.standard());
    }
    final UriAuthority authority = this.publicKeyUri.authority();
    final String address = authority.host().address();
    int port = authority.port().number();
    if (port == 0) {
      port = 443;
    }
    context.endpoint().connectHttps(address, port, new GoogleIdPublicKeyClient(this), this.httpSettings);
  }

  @Override
  public PolicyDirective<Identity> authenticate(Credentials credentials) {
    String compactJws = credentials.claims().get("idToken").stringValue(null);
    if (compactJws == null) {
      compactJws = credentials.claims().get("googleIdToken").stringValue(null);
    }
    if (compactJws != null) {
      final GoogleIdToken idToken = GoogleIdToken.verify(compactJws, this.publicKeyDefs);
      if (idToken != null) {
        if (this.emails .isEmpty() || this.emails .contains(idToken.email())) {
          return PolicyDirective.<Identity>allow(new Authenticated(
              credentials.requestUri(), credentials.fromUri(), idToken.toValue()));
        }
      }
    }
    return null;
  }

  @Override
  public Value toValue() {
    return form().mold(this).toValue();
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof GoogleIdAuthDef) {
      final GoogleIdAuthDef that = (GoogleIdAuthDef) other;
      return this.audiences.equals(that.audiences) && this.emails.equals(that.emails)
          && this.publicKeyUri.equals(that.publicKeyUri);
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(GoogleIdAuthDef.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(hashSeed,
        this.audiences.hashCode()), this.emails.hashCode()),
        this.publicKeyUri.hashCode()));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("new").write(' ').write("GoogleIdAuthDef").write('(')
        .debug(this.audiences).write(", ").debug(this.emails);
    if (!PUBLIC_KEY_URI.equals(this.publicKeyUri)) {
      output = output.write(", ").debug(this.publicKeyUri);
    }
    output = output.write(')');
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  static final Uri PUBLIC_KEY_URI;
  static final long PUBLIC_KEY_REFRESH_INTERVAL;

  private static int hashSeed;

  private static Form<GoogleIdAuthDef> form;

  @Kind
  public static Form<GoogleIdAuthDef> form() {
    if (form == null) {
      form = new GoogleIdAuthForm();
    }
    return form;
  }

  static {
    Uri publicKeyUri;
    try {
      publicKeyUri = Uri.parse(System.getProperty("swim.auth.google.public.key.uri"));
    } catch (NullPointerException | ParserException e) {
      publicKeyUri = Uri.parse("https://www.googleapis.com/oauth2/v3/certs");
    }
    PUBLIC_KEY_URI = publicKeyUri;

    long publicKeyRefreshInterval;
    try {
      publicKeyRefreshInterval = Long.parseLong(System.getProperty("swim.auth.google.public.key.refresh.interval"));
    } catch (NumberFormatException e) {
      publicKeyRefreshInterval = (long) (60 * 60 * 1000);
    }
    PUBLIC_KEY_REFRESH_INTERVAL = publicKeyRefreshInterval;
  }
}

final class GoogleIdPublicKeyTimer extends AbstractTimer implements TimerFunction {
  final GoogleIdAuthDef authDef;

  GoogleIdPublicKeyTimer(GoogleIdAuthDef authDef) {
    this.authDef = authDef;
  }

  @Override
  public void runTimer() {
    this.authDef.refreshPublicKeys();
    this.reschedule(GoogleIdAuthDef.PUBLIC_KEY_REFRESH_INTERVAL);
  }
}

final class GoogleIdPublicKeyClient extends AbstractHttpClient {
  final GoogleIdAuthDef authDef;

  GoogleIdPublicKeyClient(GoogleIdAuthDef authDef) {
    this.authDef = authDef;
  }

  @Override
  public void didConnect() {
    super.didConnect();
    doRequest(new GoogleIdPublicKeyRequester(this.authDef));
  }
}

final class GoogleIdPublicKeyRequester extends AbstractHttpRequester<Value> {
  final GoogleIdAuthDef authDef;

  GoogleIdPublicKeyRequester(GoogleIdAuthDef authDef) {
    this.authDef = authDef;
  }

  @Override
  public void doRequest() {
    final Uri publicKeyUri = this.authDef.publicKeyUri;
    final Uri requestUri = Uri.from(publicKeyUri.path());
    final HttpRequest<?> request = HttpRequest.get(requestUri, Host.from(publicKeyUri.authority()));
    writeRequest(request);
  }

  @Override
  public void didRespond(HttpResponse<Value> response) {
    FingerTrieSeq<PublicKeyDef> publicKeyDefs = FingerTrieSeq.empty();
    try {
      for (Item item : response.entity().get().get("keys")) {
        final PublicKeyDef publicKeyDef = JsonWebKey.from(item.toValue()).publicKeyDef();
        if (publicKeyDef != null) {
          publicKeyDefs = publicKeyDefs.appended(publicKeyDef);
        }
      }
      this.authDef.setPublicKeyDefs(publicKeyDefs);
    } finally {
      close();
    }
  }
}

final class GoogleIdAuthForm extends Form<GoogleIdAuthDef> {
  @Override
  public String tag() {
    return "googleId";
  }

  @Override
  public Class<?> type() {
    return GoogleIdAuthDef.class;
  }

  @Override
  public Item mold(GoogleIdAuthDef authDef) {
    if (authDef != null) {
      final Record record = Record.create().attr(tag());
      for (String audience : authDef.audiences) {
        record.add(Record.create(1).attr("audience", audience));
      }
      for (String email : authDef.emails) {
        record.add(Record.create(1).attr("email", email));
      }
      return record;
    } else {
      return Item.extant();
    }
  }

  @Override
  public GoogleIdAuthDef cast(Item item) {
    final Value value = item.toValue();
    final Value headers = value.getAttr(tag());
    if (headers.isDefined()) {
      final Builder<String, FingerTrieSeq<String>> audiences = FingerTrieSeq.builder();
      HashTrieSet<String> emails = HashTrieSet.empty();
      for (Item member : value) {
        final String tag = member.tag();
        if ("audience".equals(tag)) {
          audiences.add(member.get("audience").stringValue());
        } else if ("email".equals(tag)) {
          emails = emails.added(member.get("email").stringValue());
        }
      }
      return new GoogleIdAuthDef(audiences.bind(), emails);
    }
    return null;
  }
}
