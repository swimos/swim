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

package swim.auth;

import swim.api.auth.AuthenticatorDef;
import swim.codec.Debug;
import swim.codec.Format;
import swim.codec.Output;
import swim.collections.FingerTrieSeq;
import swim.security.PublicKeyDef;
import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Kind;
import swim.structure.Record;
import swim.structure.Value;
import swim.util.Builder;
import swim.util.Murmur3;

public class OpenIdAuthenticatorDef implements AuthenticatorDef, Debug {
  final String authenticatorName;
  final FingerTrieSeq<String> issuers;
  final FingerTrieSeq<String> audiences;
  final FingerTrieSeq<PublicKeyDef> publicKeyDefs;

  public OpenIdAuthenticatorDef(String authenticatorName, FingerTrieSeq<String> issuers,
                                FingerTrieSeq<String> audiences,
                                FingerTrieSeq<PublicKeyDef> publicKeyDefs) {
    this.authenticatorName = authenticatorName;
    this.issuers = issuers;
    this.audiences = audiences;
    this.publicKeyDefs = publicKeyDefs;
  }

  @Override
  public final String authenticatorName() {
    return this.authenticatorName;
  }

  public final FingerTrieSeq<String> issuers() {
    return this.issuers;
  }

  public final FingerTrieSeq<String> audiences() {
    return this.audiences;
  }

  public final FingerTrieSeq<PublicKeyDef> publicKeyDefs() {
    return this.publicKeyDefs;
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof OpenIdAuthenticatorDef) {
      final OpenIdAuthenticatorDef that = (OpenIdAuthenticatorDef) other;
      return (this.authenticatorName == null ? that.authenticatorName == null : this.authenticatorName.equals(that.authenticatorName))
          && this.issuers.equals(that.issuers) && this.audiences.equals(that.audiences)
          && this.publicKeyDefs.equals(that.publicKeyDefs);
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(OpenIdAuthenticatorDef.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(hashSeed,
        Murmur3.hash(this.authenticatorName)), this.issuers.hashCode()),
        this.audiences.hashCode()), this.publicKeyDefs.hashCode()));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("new").write(' ').write("OpenIdAuthenticatorDef").write('(')
        .debug(this.authenticatorName).write(", ").debug(this.issuers).write(", ")
        .debug(this.audiences).write(", ").debug(this.publicKeyDefs).write(')');
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static int hashSeed;

  private static Form<OpenIdAuthenticatorDef> form;

  @Kind
  public static Form<OpenIdAuthenticatorDef> form() {
    if (form == null) {
      form = new OpenIdAuthenticatorForm();
    }
    return form;
  }
}

final class OpenIdAuthenticatorForm extends Form<OpenIdAuthenticatorDef> {
  @Override
  public String tag() {
    return "openId";
  }

  @Override
  public Class<?> type() {
    return OpenIdAuthenticatorDef.class;
  }

  @Override
  public Item mold(OpenIdAuthenticatorDef authenticatorDef) {
    if (authenticatorDef != null) {
      final Record record = Record.create().attr(tag());

      Value issuers = Value.absent();
      for (String issuer : authenticatorDef.issuers) {
        issuers = issuers.appended(issuer);
      }
      if (issuers.isDefined()) {
        record.slot("issuers", issuers);
      }

      Value audiences = Value.absent();
      for (String audience : authenticatorDef.audiences) {
        audiences = audiences.appended(audience);
      }
      if (audiences.isDefined()) {
        record.slot("audiences", audiences);
      }

      for (PublicKeyDef publicKeyDef : authenticatorDef.publicKeyDefs) {
        record.add(publicKeyDef.toValue());
      }

      return record;
    } else {
      return Item.extant();
    }
  }

  @Override
  public OpenIdAuthenticatorDef cast(Item item) {
    final Value value = item.toValue();
    final Value headers = value.getAttr(tag());
    if (headers.isDefined()) {
      final String authenticatorName = item.key().stringValue(null);
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
      return new OpenIdAuthenticatorDef(authenticatorName, issuers.bind(),
                                        audiences.bind(), publicKeyDefs.bind());
    }
    return null;
  }
}
