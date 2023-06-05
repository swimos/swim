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
import swim.http.HttpTransferCoding;
import swim.util.Notation;
import swim.util.ToSource;

@Public
@Since("5.0")
public final class TransferEncodingHeader extends HttpHeader {

  @Nullable FingerTrieList<HttpTransferCoding> codings;

  TransferEncodingHeader(String name, String value,
                         @Nullable FingerTrieList<HttpTransferCoding> codings) {
    super(name, value);
    this.codings = codings;
  }

  public FingerTrieList<HttpTransferCoding> codings() throws HttpException {
    if (this.codings == null) {
      this.codings = TransferEncodingHeader.parseValue(this.value);
    }
    return this.codings;
  }

  @Override
  public TransferEncodingHeader withValue(String newValue) {
    return TransferEncodingHeader.of(this.name, newValue);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("TransferEncodingHeader", "of")
            .appendArgument(this.value)
            .endInvoke();
  }

  public static final String NAME = "Transfer-Encoding";

  public static final HttpHeaderType<TransferEncodingHeader, FingerTrieList<HttpTransferCoding>> TYPE = new TransferEncodingHeaderType();

  public static final TransferEncodingHeader CHUNKED = new TransferEncodingHeader(NAME, HttpTransferCoding.CHUNKED.name(), FingerTrieList.of(HttpTransferCoding.CHUNKED));

  public static TransferEncodingHeader of(String name, String value) {
    return new TransferEncodingHeader(name, value, null);
  }

  public static TransferEncodingHeader of(String name, FingerTrieList<HttpTransferCoding> codings) {
    final String value = TransferEncodingHeader.writeValue(codings.iterator());
    return new TransferEncodingHeader(name, value, codings);
  }

  public static TransferEncodingHeader of(FingerTrieList<HttpTransferCoding> codings) {
    return TransferEncodingHeader.of(NAME, codings);
  }

  public static TransferEncodingHeader of(HttpTransferCoding... codings) {
    return TransferEncodingHeader.of(NAME, FingerTrieList.of(codings));
  }

  public static TransferEncodingHeader of(String value) {
    return TransferEncodingHeader.of(NAME, value);
  }

  static FingerTrieList<HttpTransferCoding> parseValue(String value) throws HttpException {
    final StringInput input = new StringInput(value);
    int c = 0;
    FingerTrieList<HttpTransferCoding> codings = FingerTrieList.empty();
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
        final Parse<HttpTransferCoding> parseCoding = HttpTransferCoding.parse(input);
        if (parseCoding.isDone()) {
          codings = codings.appended(parseCoding.getNonNullUnchecked());
        } else if (parseCoding.isError()) {
          throw new HttpException(HttpStatus.BAD_REQUEST, "malformed Transfer-Encoding: " + value, parseCoding.getError());
        } else {
          throw new HttpException(HttpStatus.BAD_REQUEST, "malformed Transfer-Encoding: " + value);
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
      throw new HttpException(HttpStatus.BAD_REQUEST, "malformed Transfer-Encoding: " + value, input.getError());
    } else if (!input.isDone()) {
      throw new HttpException(HttpStatus.BAD_REQUEST, "malformed Transfer-Encoding: " + value);
    }
    return codings;
  }

  static String writeValue(Iterator<HttpTransferCoding> codings) {
    final StringOutput output = new StringOutput();
    HttpTransferCoding coding = null;
    do {
      if (coding != null) {
        output.write(',').write(' ');
      }
      coding = codings.next();
      coding.write(output).assertDone();
    } while (codings.hasNext());
    return output.get();
  }

}

final class TransferEncodingHeaderType implements HttpHeaderType<TransferEncodingHeader, FingerTrieList<HttpTransferCoding>>, ToSource {

  @Override
  public String name() {
    return TransferEncodingHeader.NAME;
  }

  @Override
  public FingerTrieList<HttpTransferCoding> getValue(TransferEncodingHeader header) throws HttpException {
    return header.codings();
  }

  @Override
  public TransferEncodingHeader of(String name, String value) {
    return TransferEncodingHeader.of(name, value);
  }

  @Override
  public TransferEncodingHeader of(String name, FingerTrieList<HttpTransferCoding> codings) {
    return TransferEncodingHeader.of(name, codings);
  }

  @Override
  public @Nullable TransferEncodingHeader cast(HttpHeader header) {
    if (header instanceof TransferEncodingHeader) {
      return (TransferEncodingHeader) header;
    } else {
      return null;
    }
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.append("TransferEncodingHeader").append('.').append("TYPE");
  }

  @Override
  public String toString() {
    return this.toSource();
  }

}
