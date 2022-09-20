// Copyright 2015-2022 Swim.inc
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
import swim.codec.ParserException;
import swim.collections.FingerTrieSeq;
import swim.io.http.HttpSettings;
import swim.security.PublicKeyDef;
import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Kind;
import swim.structure.Record;
import swim.structure.Slot;
import swim.structure.Value;
import swim.uri.Uri;
import swim.util.Builder;
import swim.util.Murmur3;

public class OpenIdAuthenticatorDef implements AuthenticatorDef, Debug {

  final String authenticatorName;
  final FingerTrieSeq<String> issuers;
  final FingerTrieSeq<String> audiences;
  final FingerTrieSeq<PublicKeyDef> publicKeyDefs;
  final Uri publicKeyUri;
  final HttpSettings httpSettings;

  public OpenIdAuthenticatorDef(String authenticatorName, FingerTrieSeq<String> audiences, FingerTrieSeq<String> issuers,
                                FingerTrieSeq<PublicKeyDef> publicKeyDefs, Uri publicKeyUri,
                                HttpSettings httpSettings) {
    this.authenticatorName = authenticatorName;
    this.issuers = issuers;
    this.audiences = audiences;
    this.publicKeyDefs = publicKeyDefs;
    this.publicKeyUri = publicKeyUri;
    this.httpSettings = httpSettings;
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

  public final Uri publicKeyUri() {
    return this.publicKeyUri;
  }

  public final HttpSettings httpSettings() {
    return this.httpSettings;
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof OpenIdAuthenticatorDef) {
      final OpenIdAuthenticatorDef that = (OpenIdAuthenticatorDef) other;
      return (this.authenticatorName == null ? that.authenticatorName == null : this.authenticatorName.equals(that.authenticatorName))
           && this.issuers.equals(that.issuers) && this.audiences.equals(that.audiences)
           && this.publicKeyDefs.equals(that.publicKeyDefs) && this.publicKeyUri.equals(that.publicKeyUri)
           && this.httpSettings.equals(that.httpSettings);
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (OpenIdAuthenticatorDef.hashSeed == 0) {
      OpenIdAuthenticatorDef.hashSeed = Murmur3.seed(OpenIdAuthenticatorDef.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(
              Murmur3.mix(OpenIdAuthenticatorDef.hashSeed, Murmur3.hash(this.authenticatorName)),
              this.issuers.hashCode()), this.audiences.hashCode()), this.publicKeyDefs.hashCode()),
         this.publicKeyUri.hashCode()), this.httpSettings.hashCode()));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("new").write(' ').write("OpenIdAuthenticatorDef").write('(')
         .debug(this.authenticatorName).write(", ").debug(this.issuers).write(", ")
         .debug(this.audiences).write(", ").debug(this.publicKeyDefs).write(", ")
         .debug(this.publicKeyUri).write(", ").debug(this.httpSettings).write(')');
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static Form<OpenIdAuthenticatorDef> form;

  @Kind
  public static Form<OpenIdAuthenticatorDef> form() {
    if (OpenIdAuthenticatorDef.form == null) {
      OpenIdAuthenticatorDef.form = new OpenIdAuthenticatorForm();
    }
    return OpenIdAuthenticatorDef.form;
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
      final Record record = Record.create().attr(this.tag());

      for (String audience : authenticatorDef.audiences) {
        record.add(Record.create(1).attr("audience", audience));
      }
      for (String email : authenticatorDef.issuers) {
        record.add(Record.create(1).attr("issuer", email));
      }

      for (PublicKeyDef publicKeyDef : authenticatorDef.publicKeyDefs) {
        record.add(publicKeyDef.toValue());
      }

      if (authenticatorDef.publicKeyUri != null) {
        record.add(Slot.of("publicKeyUri", authenticatorDef.publicKeyUri.toString()));
      }

      record.add(authenticatorDef.httpSettings.toValue());
      return Slot.of(authenticatorDef.authenticatorName, record);
    } else {
      return Item.extant();
    }
  }

  @Override
  public OpenIdAuthenticatorDef cast(Item item) {
    final Value value = item.toValue();
    final Value headers = value.getAttr(this.tag());
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
      Uri publicKeyUri = null;
      try {
        publicKeyUri = Uri.parse(value.get("publicKeyUri").stringValue(null));
      } catch (NullPointerException | ParserException error) {
        // continue
      }
      final HttpSettings httpSettings = HttpSettings.form().cast(value);

      return new OpenIdAuthenticatorDef(authenticatorName, audiences.bind(), issuers.bind(),
           publicKeyDefs.bind(),
           publicKeyUri, httpSettings);
    }
    return null;
  }

}
