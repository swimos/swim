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
import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Kind;
import swim.structure.Record;
import swim.structure.Slot;
import swim.structure.Value;
import swim.uri.Uri;
import swim.util.Builder;
import swim.util.Murmur3;

public class GoogleIdAuthenticatorDef implements AuthenticatorDef, Debug {

  final String authenticatorName;
  final FingerTrieSeq<String> audiences;
  final FingerTrieSeq<String> emails;
  final Uri publicKeyUri;
  final HttpSettings httpSettings;

  public GoogleIdAuthenticatorDef(String authenticatorName, FingerTrieSeq<String> audiences,
                                  FingerTrieSeq<String> emails, Uri publicKeyUri,
                                  HttpSettings httpSettings) {
    this.authenticatorName = authenticatorName;
    this.audiences = audiences;
    this.emails = emails;
    this.publicKeyUri = publicKeyUri;
    this.httpSettings = httpSettings;
  }

  @Override
  public final String authenticatorName() {
    return this.authenticatorName;
  }

  public final FingerTrieSeq<String> audiences() {
    return this.audiences;
  }

  public final FingerTrieSeq<String> emails() {
    return this.emails;
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
    } else if (other instanceof GoogleIdAuthenticatorDef) {
      final GoogleIdAuthenticatorDef that = (GoogleIdAuthenticatorDef) other;
      return (this.authenticatorName == null ? that.authenticatorName == null : this.authenticatorName.equals(that.authenticatorName))
          && this.audiences.equals(that.audiences) && this.emails.equals(that.emails)
          && this.publicKeyUri.equals(that.publicKeyUri) && this.httpSettings.equals(that.httpSettings);
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (GoogleIdAuthenticatorDef.hashSeed == 0) {
      GoogleIdAuthenticatorDef.hashSeed = Murmur3.seed(GoogleIdAuthenticatorDef.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(GoogleIdAuthenticatorDef.hashSeed,
        Murmur3.hash(this.authenticatorName)), this.audiences.hashCode()),
        this.emails.hashCode()), this.publicKeyUri.hashCode()), this.httpSettings.hashCode()));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("new").write(' ').write("GoogleIdAuthenticatorDef").write('(')
                   .debug(this.authenticatorName).write(", ").debug(this.audiences).write(", ")
                   .debug(this.emails).write(", ").debug(this.publicKeyUri).write(", ")
                   .debug(this.httpSettings).write(')');
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  static final Uri PUBLIC_KEY_URI;

  static {
    Uri publicKeyUri;
    try {
      publicKeyUri = Uri.parse(System.getProperty("swim.auth.google.public.key.uri"));
    } catch (NullPointerException | ParserException error) {
      publicKeyUri = Uri.parse("https://www.googleapis.com/oauth2/v3/certs");
    }
    PUBLIC_KEY_URI = publicKeyUri;
  }

  private static Form<GoogleIdAuthenticatorDef> form;

  @Kind
  public static Form<GoogleIdAuthenticatorDef> form() {
    if (GoogleIdAuthenticatorDef.form == null) {
      GoogleIdAuthenticatorDef.form = new GoogleIdAuthenticatorForm();
    }
    return GoogleIdAuthenticatorDef.form;
  }

}

final class GoogleIdAuthenticatorForm extends Form<GoogleIdAuthenticatorDef> {

  @Override
  public String tag() {
    return "googleId";
  }

  @Override
  public Class<?> type() {
    return GoogleIdAuthenticatorDef.class;
  }

  @Override
  public Item mold(GoogleIdAuthenticatorDef authenticatorDef) {
    if (authenticatorDef != null) {
      final Record record = Record.create().attr(this.tag());
      for (String audience : authenticatorDef.audiences) {
        record.add(Record.create(1).attr("audience", audience));
      }
      for (String email : authenticatorDef.emails) {
        record.add(Record.create(1).attr("email", email));
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
  public GoogleIdAuthenticatorDef cast(Item item) {
    final Value value = item.toValue();
    final Value headers = value.getAttr(this.tag());
    if (headers.isDefined()) {
      final String authenticatorName = item.key().stringValue(null);
      final Builder<String, FingerTrieSeq<String>> audiences = FingerTrieSeq.builder();
      final Builder<String, FingerTrieSeq<String>> emails = FingerTrieSeq.builder();
      for (Item member : value) {
        final String tag = member.tag();
        if ("audience".equals(tag)) {
          audiences.add(member.get("audience").stringValue());
        } else if ("email".equals(tag)) {
          emails.add(member.get("email").stringValue());
        }
      }
      Uri publicKeyUri = null;
      try {
        publicKeyUri = Uri.parse(value.get("publicKeyUri").stringValue(null));
      } catch (NullPointerException | ParserException error) {
        // continue
      }
      if (publicKeyUri == null || !publicKeyUri.isDefined()) {
        publicKeyUri = GoogleIdAuthenticatorDef.PUBLIC_KEY_URI;
      }
      final HttpSettings httpSettings = HttpSettings.form().cast(value);
      return new GoogleIdAuthenticatorDef(authenticatorName, audiences.bind(),
                                          emails.bind(), publicKeyUri, httpSettings);
    }
    return null;
  }

}
