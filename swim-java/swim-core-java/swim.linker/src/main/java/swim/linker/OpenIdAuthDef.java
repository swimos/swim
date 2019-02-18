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
import swim.collections.FingerTrieSeq;
import swim.security.JsonWebSignature;
import swim.security.OpenIdToken;
import swim.security.PublicKeyDef;
import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Kind;
import swim.structure.Record;
import swim.structure.Value;
import swim.uri.Uri;
import swim.util.Builder;
import swim.util.Murmur3;

public final class OpenIdAuthDef extends AuthDef implements Debug {
  final FingerTrieSeq<String> issuers;

  final FingerTrieSeq<String> audiences;

  final FingerTrieSeq<PublicKeyDef> publicKeyDefs;

  public OpenIdAuthDef(FingerTrieSeq<String> issuers, FingerTrieSeq<String> audiences,
                       FingerTrieSeq<PublicKeyDef> publicKeyDefs) {
    this.issuers = issuers;
    this.audiences = audiences;
    this.publicKeyDefs = publicKeyDefs;
  }

  public FingerTrieSeq<String> issuers() {
    return this.issuers;
  }

  public FingerTrieSeq<String> audiences() {
    return this.audiences;
  }

  public FingerTrieSeq<PublicKeyDef> publicKeyDefs() {
    return this.publicKeyDefs;
  }

  public PolicyDirective<Identity> authenticate(Uri requestUri, Uri fromUri, JsonWebSignature jws) {
    final Value payloadValue = jws.payload();
    if (payloadValue.isDefined()) {
      final OpenIdToken idToken = new OpenIdToken(payloadValue);
      // TODO: check payload
      for (int i = 0, n = this.publicKeyDefs.size(); i < n; i += 1) {
        if (jws.verifySignature(this.publicKeyDefs.get(i).publicKey())) {
          return PolicyDirective.<Identity>allow(new Authenticated(requestUri, fromUri, idToken.toValue()));
        }
      }
    }
    return null;
  }

  @Override
  public PolicyDirective<Identity> authenticate(Credentials credentials) {
    String compactJws = credentials.claims().get("idToken").stringValue(null);
    if (compactJws == null) {
      compactJws = credentials.claims().get("openIdToken").stringValue(null);
    }
    if (compactJws != null) {
      final JsonWebSignature jws = JsonWebSignature.parse(compactJws);
      if (jws != null) {
        return authenticate(credentials.requestUri(), credentials.fromUri(), jws);
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
    } else if (other instanceof OpenIdAuthDef) {
      final OpenIdAuthDef that = (OpenIdAuthDef) other;
      return this.issuers.equals(that.issuers) && this.audiences.equals(that.audiences)
          && this.publicKeyDefs.equals(that.publicKeyDefs);
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(OpenIdAuthDef.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(hashSeed,
        this.issuers.hashCode()), this.audiences.hashCode()), this.publicKeyDefs.hashCode()));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("new").write(' ').write("OpenIdAuthDef").write('(')
        .debug(this.issuers).write(", ").debug(this.audiences).write(", ")
        .debug(this.publicKeyDefs).write(')');
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static int hashSeed;

  private static Form<OpenIdAuthDef> form;

  @Kind
  public static Form<OpenIdAuthDef> form() {
    if (form == null) {
      form = new OpenIdAuthForm();
    }
    return form;
  }
}

final class OpenIdAuthForm extends Form<OpenIdAuthDef> {
  @Override
  public String tag() {
    return "openId";
  }

  @Override
  public Class<?> type() {
    return OpenIdAuthDef.class;
  }

  @Override
  public Item mold(OpenIdAuthDef authDef) {
    if (authDef != null) {
      final Record record = Record.create().attr(tag());

      Value issuers = Value.absent();
      for (String issuer : authDef.issuers) {
        issuers = issuers.appended(issuer);
      }
      if (issuers.isDefined()) {
        record.slot("issuers", issuers);
      }

      Value audiences = Value.absent();
      for (String audience : authDef.audiences) {
        audiences = audiences.appended(audience);
      }
      if (audiences.isDefined()) {
        record.slot("audiences", audiences);
      }

      for (PublicKeyDef publicKeyDef : authDef.publicKeyDefs) {
        record.add(publicKeyDef.toValue());
      }

      return record;
    } else {
      return Item.extant();
    }
  }

  @Override
  public OpenIdAuthDef cast(Item item) {
    final Value value = item.toValue();
    final Value headers = value.getAttr(tag());
    if (headers.isDefined()) {
      final Builder<String, FingerTrieSeq<String>> issuers = FingerTrieSeq.builder();
      final Builder<String, FingerTrieSeq<String>> audiences = FingerTrieSeq.builder();
      final Builder<PublicKeyDef, FingerTrieSeq<PublicKeyDef>> publicKeyDefs = FingerTrieSeq.builder();
      for (Item member : value) {
        final String tag = member.tag();
        if ("issuer".equals(tag)) {
          issuers.add(member.get("issuer").stringValue());
        } else if ("audience".equals(tag)) {
          audiences.add(member.get("audience").stringValue());
        } else {
          final PublicKeyDef publicKeyDef = PublicKeyDef.publicKeyForm().cast(member.toValue());
          if (publicKeyDef != null) {
            publicKeyDefs.add(publicKeyDef);
          }
        }
      }
      return new OpenIdAuthDef(issuers.bind(), audiences.bind(), publicKeyDefs.bind());
    }
    return null;
  }
}
