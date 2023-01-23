// Copyright 2015-2023 Swim.inc
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

import java.util.Map;
import java.util.Objects;
import swim.api.auth.AuthenticatorDef;
import swim.codec.Debug;
import swim.codec.Format;
import swim.codec.Output;
import swim.codec.ParserException;
import swim.collections.FingerTrieSeq;
import swim.collections.HashTrieMap;
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

public class BaseAuthenticatorDef implements AuthenticatorDef, Debug {

  final String authenticatorName;
  final String tokenName;
  final String expiration;
  final HashTrieMap<String, FingerTrieSeq<String>> claims;
  final FingerTrieSeq<PublicKeyDef> publicKeyDefs;
  final Uri publicKeyUri;
  final HttpSettings httpSettings;

  public BaseAuthenticatorDef(String authenticatorName, String tokenName, String expiration,
                              HashTrieMap<String, FingerTrieSeq<String>> claims,
                              FingerTrieSeq<PublicKeyDef> publicKeyDefs, Uri publicKeyUri,
                              HttpSettings httpSettings) {
    this.authenticatorName = authenticatorName;
    this.tokenName = Objects.requireNonNullElse(tokenName, "access_token");
    this.expiration = Objects.requireNonNullElse(expiration, "exp");
    this.claims = claims;
    this.publicKeyDefs = publicKeyDefs;
    this.publicKeyUri = publicKeyUri;
    this.httpSettings = httpSettings;
  }

  @Override
  public final String authenticatorName() {
    return this.authenticatorName;
  }

  public final String expiration() {
    return this.expiration;
  }

  public final HashTrieMap<String, FingerTrieSeq<String>> claims() {
    return this.claims;
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
    } else if (other instanceof BaseAuthenticatorDef) {
      final BaseAuthenticatorDef that = (BaseAuthenticatorDef) other;
      return (this.authenticatorName == null ? that.authenticatorName == null : this.authenticatorName.equals(that.authenticatorName))
           && this.tokenName.equals(that.tokenName) && this.expiration.equals(that.expiration)
           && this.claims.equals(that.claims) && this.publicKeyDefs.equals(that.publicKeyDefs)
           && this.publicKeyUri.equals(that.publicKeyUri) && this.httpSettings.equals(that.httpSettings);
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (BaseAuthenticatorDef.hashSeed == 0) {
      BaseAuthenticatorDef.hashSeed = Murmur3.seed(BaseAuthenticatorDef.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(
                   Murmur3.mix(BaseAuthenticatorDef.hashSeed, Murmur3.hash(this.authenticatorName)),
                   this.tokenName.hashCode()), this.expiration.hashCode()), this.claims.hashCode()),
              this.publicKeyDefs.hashCode()), this.publicKeyUri.hashCode()),
         this.httpSettings.hashCode()));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("new").write(' ').write("BaseAuthenticatorDef").write('(')
         .debug(this.authenticatorName).write(", ").debug(this.tokenName).write(", ")
         .debug(this.expiration).write(", ").debug(this.claims).write(", ")
         .debug(this.publicKeyDefs).write(", ").debug(this.publicKeyUri).write(", ")
         .debug(this.httpSettings).write(')');
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static Form<BaseAuthenticatorDef> form;

  @Kind
  public static Form<BaseAuthenticatorDef> form() {
    if (BaseAuthenticatorDef.form == null) {
      BaseAuthenticatorDef.form = new BaseAuthenticatorForm();
    }
    return BaseAuthenticatorDef.form;
  }

}

final class BaseAuthenticatorForm extends Form<BaseAuthenticatorDef> {

  @Override
  public String tag() {
    return "auth";
  }

  @Override
  public Class<?> type() {
    return BaseAuthenticatorDef.class;
  }

  @Override
  public Item mold(BaseAuthenticatorDef authenticatorDef) {
    if (authenticatorDef != null) {
      final Record record = Record.create().attr(this.tag());
      record.add(Record.create().attr("token", authenticatorDef.tokenName).toValue());
      record.add(Record.create().attr("expiration", authenticatorDef.expiration));

      for (Map.Entry<String, FingerTrieSeq<String>> claim : authenticatorDef.claims) {
        final Record claimRecord = Record.create();
        for (String claimValue : claim.getValue()) {
          claimRecord.add(claimValue);
        }
        if (claimRecord.size() == 1) {
          record.add(Record.create().attr("claim", Record.create().slot(claim.getKey(), claimRecord.get(0).toValue())));
        } else {
          record.add(Record.create().attr("claim", Record.create().slot(claim.getKey(), claimRecord)));
        }
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
  public BaseAuthenticatorDef cast(Item item) {
    final Value value = item.toValue();
    final Value headers = value.getAttr(this.tag());
    if (headers.isDefined()) {
      final String authenticatorName = item.key().stringValue(null);
      String tokenName = null;
      String expiration = null;
      HashTrieMap<String, FingerTrieSeq<String>> claims = HashTrieMap.empty();

      final Builder<PublicKeyDef, FingerTrieSeq<PublicKeyDef>> publicKeyDefs = FingerTrieSeq.builder();
      for (Item member : value) {
        final String tag = member.tag();
        if ("expiration".equals(tag)) {
          expiration = member.get("expiration").stringValue();
        } else if ("token".equals(tag)) {
          tokenName = member.get("token").stringValue();
        } else if ("claim".equals(tag)) {
          final Value claim = member.get("claim");
          for (Item claimMember : claim) {
            final Builder<String, FingerTrieSeq<String>> claimValues = FingerTrieSeq.builder();
            for (Item claimValue : claimMember.toValue()) {
              claimValues.add(claimValue.stringValue());
            }
            claims = claims.updated(claimMember.key().stringValue(), claimValues.bind());
          }
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

      return new BaseAuthenticatorDef(authenticatorName, tokenName,
           expiration, claims, publicKeyDefs.bind(),
           publicKeyUri, httpSettings);
    }
    return null;
  }

}
