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

package swim.http.header;

import java.util.Iterator;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Parse;
import swim.codec.StringInput;
import swim.codec.StringOutput;
import swim.collections.FingerTrieList;
import swim.http.Http;
import swim.http.HttpException;
import swim.http.HttpHeader;
import swim.http.HttpHeaderType;
import swim.http.HttpStatus;
import swim.http.HttpUpgrade;
import swim.util.Assume;
import swim.util.Notation;
import swim.util.WriteSource;

@Public
@Since("5.0")
public final class UpgradeHeader extends HttpHeader {

  @Nullable FingerTrieList<HttpUpgrade> upgrades;

  UpgradeHeader(String name, String value,
                @Nullable FingerTrieList<HttpUpgrade> upgrades) {
    super(name, value);
    this.upgrades = upgrades;
  }

  public FingerTrieList<HttpUpgrade> upgrades() throws HttpException {
    if (this.upgrades == null) {
      this.upgrades = UpgradeHeader.parseValue(this.value);
    }
    return this.upgrades;
  }

  public boolean supports(HttpUpgrade upgrade) {
    try {
      final FingerTrieList<HttpUpgrade> upgrades = this.upgrades();
      for (int i = 0, n = upgrades.size(); i < n; i += 1) {
        if (upgrade.matches(Assume.nonNull(upgrades.get(i)))) {
          return true;
        }
      }
    } catch (HttpException cause) {
      // ignore
    }
    return false;
  }

  @Override
  public UpgradeHeader withValue(String newValue) {
    return UpgradeHeader.of(this.name, newValue);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("UpgradeHeader", "of")
            .appendArgument(this.value)
            .endInvoke();
  }

  public static final String NAME = "Upgrade";

  public static final HttpHeaderType<UpgradeHeader, FingerTrieList<HttpUpgrade>> TYPE = new UpgradeHeaderType();

  public static final UpgradeHeader H2C = new UpgradeHeader(NAME, HttpUpgrade.H2C.protocol(), FingerTrieList.of(HttpUpgrade.H2C));

  public static final UpgradeHeader WEBSOCKET = new UpgradeHeader(NAME, HttpUpgrade.WEBSOCKET.protocol(), FingerTrieList.of(HttpUpgrade.WEBSOCKET));

  public static UpgradeHeader of(String name, String value) {
    return new UpgradeHeader(name, value, null);
  }

  public static UpgradeHeader of(String name, FingerTrieList<HttpUpgrade> upgrades) {
    final String value = UpgradeHeader.writeValue(upgrades.iterator());
    return new UpgradeHeader(name, value, upgrades);
  }

  public static UpgradeHeader of(FingerTrieList<HttpUpgrade> upgrades) {
    return UpgradeHeader.of(NAME, upgrades);
  }

  public static UpgradeHeader of(HttpUpgrade... upgrades) {
    return UpgradeHeader.of(NAME, FingerTrieList.of(upgrades));
  }

  public static UpgradeHeader of(String value) {
    return UpgradeHeader.of(NAME, value);
  }

  static FingerTrieList<HttpUpgrade> parseValue(String value) throws HttpException {
    final StringInput input = new StringInput(value);
    int c = 0;
    FingerTrieList<HttpUpgrade> upgrades = FingerTrieList.empty();
    do {
      while (input.isCont()) {
        c = input.head();
        if (Http.isSpace(c)) {
          input.step();
        } else {
          break;
        }
      }
      if (input.isCont() && Http.isTokenChar(c)) {
        final Parse<HttpUpgrade> parseUpgrade = HttpUpgrade.parse(input);
        if (parseUpgrade.isDone()) {
          upgrades = upgrades.appended(parseUpgrade.getNonNullUnchecked());
        } else if (parseUpgrade.isError()) {
          throw new HttpException(HttpStatus.BAD_REQUEST, "malformed Upgrade: " + value, parseUpgrade.getError());
        } else {
          throw new HttpException(HttpStatus.BAD_REQUEST, "malformed Upgrade: " + value);
        }
      } else {
        break;
      }
      while (input.isCont()) {
        c = input.head();
        if (Http.isSpace(c)) {
          input.step();
        } else {
          break;
        }
      }
      if (input.isCont() && c == ',') {
        input.step();
        continue;
      } else {
        break;
      }
    } while (true);
    if (input.isError()) {
      throw new HttpException(HttpStatus.BAD_REQUEST, "malformed Upgrade: " + value, input.getError());
    } else if (!input.isDone()) {
      throw new HttpException(HttpStatus.BAD_REQUEST, "malformed Upgrade: " + value);
    }
    return upgrades;
  }

  static String writeValue(Iterator<HttpUpgrade> upgrades) {
    final StringOutput output = new StringOutput();
    HttpUpgrade upgrade = null;
    do {
      if (upgrade != null) {
        output.write(',').write(' ');
      }
      upgrade = upgrades.next();
      upgrade.write(output).assertDone();
    } while (upgrades.hasNext());
    return output.get();
  }

}

final class UpgradeHeaderType implements HttpHeaderType<UpgradeHeader, FingerTrieList<HttpUpgrade>>, WriteSource {

  @Override
  public String name() {
    return UpgradeHeader.NAME;
  }

  @Override
  public FingerTrieList<HttpUpgrade> getValue(UpgradeHeader header) throws HttpException {
    return header.upgrades();
  }

  @Override
  public UpgradeHeader of(String name, String value) {
    return UpgradeHeader.of(name, value);
  }

  @Override
  public UpgradeHeader of(String name, FingerTrieList<HttpUpgrade> upgrades) {
    return UpgradeHeader.of(name, upgrades);
  }

  @Override
  public @Nullable UpgradeHeader cast(HttpHeader header) {
    if (header instanceof UpgradeHeader) {
      return (UpgradeHeader) header;
    } else {
      return null;
    }
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.append("UpgradeHeader").append('.').append("TYPE");
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

}
