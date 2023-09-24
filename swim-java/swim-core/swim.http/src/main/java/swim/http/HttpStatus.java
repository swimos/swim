// Copyright 2015-2023 Nstream, inc.
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

package swim.http;

import java.lang.invoke.MethodHandles;
import java.lang.invoke.VarHandle;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Base10;
import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Output;
import swim.codec.Parse;
import swim.codec.StringInput;
import swim.codec.StringOutput;
import swim.codec.Write;
import swim.codec.WriteException;
import swim.collections.StringTrieMap;
import swim.util.Assume;
import swim.util.Murmur3;
import swim.util.Notation;
import swim.util.WriteSource;
import swim.util.WriteString;

@Public
@Since("5.0")
public final class HttpStatus implements WriteSource, WriteString {

  final int code;
  final String phrase;

  HttpStatus(int code, String phrase) {
    this.code = code;
    this.phrase = phrase;
  }

  public int code() {
    return this.code;
  }

  public String phrase() {
    return this.phrase;
  }

  public boolean isInformational() {
    return this.code >= 100 && this.code < 199;
  }

  public boolean isSuccessful() {
    return this.code >= 200 && this.code < 299;
  }

  public boolean isRedirection() {
    return this.code >= 300 && this.code < 399;
  }

  public boolean isClientError() {
    return this.code >= 400 && this.code < 499;
  }

  public boolean isServerError() {
    return this.code >= 500 && this.code < 599;
  }

  public Write<?> write(Output<?> output) {
    return WriteHttpStatus.write(output, this.code, this.phrase, 0, 1);
  }

  public Write<?> write() {
    return new WriteHttpStatus(this.code, this.phrase, 0, 1);
  }

  @SuppressWarnings("ReferenceEquality")
  public HttpStatus intern() {
    HttpStatus[] codes = (HttpStatus[]) CODES.getOpaque();
    do {
      int index = HttpStatus.lookup(codes, this.code);
      final HttpStatus[] oldCodes = codes;
      final HttpStatus[] newCodes;
      if (index < 0) {
        index = -(index + 1);
        newCodes = new HttpStatus[oldCodes.length + 1];
        System.arraycopy(oldCodes, 0, newCodes, 0, index);
        newCodes[index] = this;
        System.arraycopy(oldCodes, index, newCodes, index + 1, oldCodes.length - index);
      } else if (!this.equals(oldCodes[index])) {
        newCodes = new HttpStatus[oldCodes.length];
        System.arraycopy(oldCodes, 0, newCodes, 0, oldCodes.length);
        newCodes[index] = this;
      } else {
        break;
      }
      codes = (HttpStatus[]) CODES.compareAndExchangeRelease(oldCodes, newCodes);
      if (codes != oldCodes) {
        // CAS failed; try again.
        continue;
      }
      codes = newCodes;
      break;
    } while (true);

    StringTrieMap<HttpStatus> phrases = (StringTrieMap<HttpStatus>) PHRASES.getOpaque();
    do {
      final StringTrieMap<HttpStatus> oldPhrases = phrases;
      final StringTrieMap<HttpStatus> newPhrases = oldPhrases.updated(this.phrase, this);
      phrases = (StringTrieMap<HttpStatus>) PHRASES.compareAndExchangeRelease(oldPhrases, newPhrases);
      if (phrases != oldPhrases) {
        // CAS failed; try again.
        continue;
      }
      phrases = newPhrases;
      break;
    } while (true);

    return this;
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof HttpStatus that) {
      return this.code == that.code && this.phrase.equals(that.phrase);
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(HttpStatus.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(HASH_SEED,
        this.code), this.phrase.hashCode()));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("HttpStatus", "of")
            .appendArgument(this.code)
            .appendArgument(this.phrase)
            .endInvoke();
  }

  @Override
  public void writeString(Appendable output) {
    this.write(StringOutput.from(output)).assertDone();
  }

  @Override
  public String toString() {
    final StringOutput output = new StringOutput();
    this.write(output).assertDone();
    return output.get();
  }

  static int lookup(HttpStatus[] codes, int code) {
    int lo = 0;
    int hi = codes.length - 1;
    while (lo <= hi) {
      final int mid = (lo + hi) >>> 1;
      if (code > codes[mid].code) {
        lo = mid + 1;
      } else if (code < codes[mid].code) {
        hi = mid - 1;
      } else {
        return mid;
      }
    }
    return -(lo + 1);
  }

  public static HttpStatus of(int code, @Nullable String phrase) {
    if (code < 0 || code >= 1000) {
      throw new IllegalArgumentException("invalid status code: " + code);
    }
    final HttpStatus[] codes = (HttpStatus[]) CODES.getOpaque();
    final int index = HttpStatus.lookup(codes, code);
    if (index >= 0) {
      final HttpStatus status = codes[index];
      if (phrase == null || phrase.equals(status.phrase)) {
        return status;
      }
    }
    return new HttpStatus(code, phrase != null ? phrase : "");
  }

  public static HttpStatus of(int code) {
    if (code < 0 || code >= 1000) {
      throw new IllegalArgumentException("invalid status code: " + code);
    }
    final HttpStatus[] codes = (HttpStatus[]) CODES.getOpaque();
    final int index = HttpStatus.lookup(codes, code);
    if (index >= 0) {
      return codes[index];
    }
    return new HttpStatus(code, "");
  }

  public static Parse<HttpStatus> parse(Input input) {
    return ParseHttpStatus.parse(input, 0, (StringTrieMap<HttpStatus>) PHRASES.getOpaque(), null, 1);
  }

  public static Parse<HttpStatus> parse() {
    return new ParseHttpStatus(0, (StringTrieMap<HttpStatus>) PHRASES.getOpaque(), null, 1);
  }

  public static Parse<HttpStatus> parse(String string) {
    final StringInput input = new StringInput(string);
    return HttpStatus.parse(input).complete(input);
  }

  static HttpStatus[] codes = new HttpStatus[0];

  static StringTrieMap<HttpStatus> phrases = StringTrieMap.caseSensitive();

  /**
   * {@code VarHandle} for atomically accessing the static {@link #codes} field.
   */
  static final VarHandle CODES;

  /**
   * {@code VarHandle} for atomically accessing the static {@link #phrases} field.
   */
  static final VarHandle PHRASES;

  static {
    // Initialize var handles.
    final MethodHandles.Lookup lookup = MethodHandles.lookup();
    try {
      CODES = lookup.findStaticVarHandle(HttpStatus.class, "codes", HttpStatus.class.arrayType());
      PHRASES = lookup.findStaticVarHandle(HttpStatus.class, "phrases", StringTrieMap.class);
    } catch (ReflectiveOperationException cause) {
      throw new ExceptionInInitializerError(cause);
    }
  }

  public static final HttpStatus CONTINUE = new HttpStatus(100, "Continue").intern();
  public static final HttpStatus SWITCHING_PROTOCOLS = new HttpStatus(101, "Switching Protocols").intern();
  public static final HttpStatus OK = new HttpStatus(200, "OK").intern();
  public static final HttpStatus CREATED = new HttpStatus(201, "Created").intern();
  public static final HttpStatus ACCEPTED = new HttpStatus(202, "Accepted").intern();
  public static final HttpStatus NON_AUTHORITATIVE_INFORMATION = new HttpStatus(203, "Non-Authoritative Information").intern();
  public static final HttpStatus NO_CONTENT = new HttpStatus(204, "No Content").intern();
  public static final HttpStatus RESET_CONTENT = new HttpStatus(205, "Reset Content").intern();
  public static final HttpStatus PARTIAL_CONTENT = new HttpStatus(206, "Partial Content").intern();
  public static final HttpStatus MULTIPLE_CHOICES = new HttpStatus(300, "Multiple Choices").intern();
  public static final HttpStatus MOVED_PERMANENTLY = new HttpStatus(301, "Moved Permanently").intern();
  public static final HttpStatus FOUND = new HttpStatus(302, "Found").intern();
  public static final HttpStatus SEE_OTHER = new HttpStatus(303, "See Other").intern();
  public static final HttpStatus NOT_MODIFIED = new HttpStatus(304, "Not Modified").intern();
  public static final HttpStatus USE_PROXY = new HttpStatus(305, "Use Proxy").intern();
  public static final HttpStatus TEMPORARY_REDIRECT = new HttpStatus(307, "Temporary Redirect").intern();
  public static final HttpStatus BAD_REQUEST = new HttpStatus(400, "Bad Request").intern();
  public static final HttpStatus UNAUTHORIZED = new HttpStatus(401, "Unauthorized").intern();
  public static final HttpStatus PAYMENT_REQUIRED = new HttpStatus(402, "Payment Required").intern();
  public static final HttpStatus FORBIDDEN = new HttpStatus(403, "Forbidden").intern();
  public static final HttpStatus NOT_FOUND = new HttpStatus(404, "Not Found").intern();
  public static final HttpStatus METHOD_NOT_ALLOWED = new HttpStatus(405, "Method Not Allowed").intern();
  public static final HttpStatus NOT_ACCEPTABLE = new HttpStatus(406, "Not Acceptable").intern();
  public static final HttpStatus PROXY_AUTHENTICATION_REQUIRED = new HttpStatus(407, "Proxy Authentication Required").intern();
  public static final HttpStatus REQUEST_TIMEOUT = new HttpStatus(408, "Request Timeout").intern();
  public static final HttpStatus CONFLICT = new HttpStatus(409, "Conflict").intern();
  public static final HttpStatus GONE = new HttpStatus(410, "Gone").intern();
  public static final HttpStatus LENGTH_REQUIRED = new HttpStatus(411, "Length Required").intern();
  public static final HttpStatus PRECONDITION_FAILED = new HttpStatus(412, "Precondition Failed").intern();
  public static final HttpStatus PAYLOAD_TOO_LARGE = new HttpStatus(413, "Payload Too Large").intern();
  public static final HttpStatus URI_TOO_LONG = new HttpStatus(414, "URI Too Long").intern();
  public static final HttpStatus UNSUPPORTED_MEDIA_TYPE = new HttpStatus(415, "Unsupported Media Type").intern();
  public static final HttpStatus RANGE_NOT_SATISFIABLE = new HttpStatus(416, "Range Not Satisfiable").intern();
  public static final HttpStatus EXPECTATION_FAILED = new HttpStatus(417, "Expectation Failed").intern();
  public static final HttpStatus UPGRADE_REQUIRED = new HttpStatus(426, "Upgrade Required").intern();
  public static final HttpStatus INTERNAL_SERVER_ERROR = new HttpStatus(500, "Internal Server Error").intern();
  public static final HttpStatus NOT_IMPLEMENTED = new HttpStatus(501, "Not Implemented").intern();
  public static final HttpStatus BAD_GATEWAY = new HttpStatus(502, "Bad Gateway").intern();
  public static final HttpStatus SERVICE_UNAVAILABLE = new HttpStatus(503, "Service Unavailable").intern();
  public static final HttpStatus GATEWAY_TIMEOUT = new HttpStatus(504, "Gateway Timeout").intern();
  public static final HttpStatus HTTP_VERSION_NOT_SUPPORTED = new HttpStatus(505, "HTTP Version Not Supported").intern();

}

final class ParseHttpStatus extends Parse<HttpStatus> {

  final int code;
  final @Nullable StringTrieMap<HttpStatus> phraseTrie;
  final @Nullable StringBuilder phraseBuilder;
  final int step;

  ParseHttpStatus(int code, @Nullable StringTrieMap<HttpStatus> phraseTrie,
                  @Nullable StringBuilder phraseBuilder, int step) {
    this.code = code;
    this.phraseTrie = phraseTrie;
    this.phraseBuilder = phraseBuilder;
    this.step = step;
  }

  @Override
  public Parse<HttpStatus> consume(Input input) {
    return ParseHttpStatus.parse(input, this.code, this.phraseTrie,
                                 this.phraseBuilder, this.step);
  }

  static Parse<HttpStatus> parse(Input input, int code,
                                 @Nullable StringTrieMap<HttpStatus> phraseTrie,
                                 @Nullable StringBuilder phraseBuilder, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont() && Base10.isDigit(c = input.head())) {
        code = Base10.decodeDigit(c);
        input.step();
        step = 2;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected("status code", input));
      }
    }
    if (step == 2) {
      if (input.isCont() && Base10.isDigit(c = input.head())) {
        code = 10 * code + Base10.decodeDigit(c);
        input.step();
        step = 3;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected("status code", input));
      }
    }
    if (step == 3) {
      if (input.isCont() && Base10.isDigit(c = input.head())) {
        code = 10 * code + Base10.decodeDigit(c);
        input.step();
        step = 4;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected("status code", input));
      }
    }
    if (step == 4) {
      if (input.isCont() && input.head() == ' ') {
        input.step();
        step = 5;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected("space", input));
      }
    }
    if (step == 5) {
      while (input.isCont() && Http.isPhraseChar(c = input.head())) {
        if (phraseTrie != null) {
          final StringTrieMap<HttpStatus> subTrie =
              phraseTrie.getBranch(phraseTrie.normalized(c));
          if (subTrie != null) {
            phraseTrie = subTrie;
          } else {
            phraseBuilder = new StringBuilder(phraseTrie.prefix());
            phraseBuilder.appendCodePoint(c);
            phraseTrie = null;
          }
        } else {
          Assume.nonNull(phraseBuilder).appendCodePoint(c);
        }
        input.step();
      }
      if (input.isReady()) {
        HttpStatus status = phraseTrie != null ? phraseTrie.value() : null;
        if (status == null) {
          final String phrase = phraseTrie != null
                              ? phraseTrie.prefix()
                              : Assume.nonNull(phraseBuilder).toString();
          status = new HttpStatus(code, phrase);
        } else if (code != status.code) {
          status = new HttpStatus(code, status.phrase);
        }
        return Parse.done(status);
      }
    }
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseHttpStatus(code, phraseTrie, phraseBuilder, step);
  }

}

final class WriteHttpStatus extends Write<Object> {

  final int code;
  final String phrase;
  final int index;
  final int step;

  WriteHttpStatus(int code, String phrase, int index, int step) {
    this.code = code;
    this.phrase = phrase;
    this.index = index;
    this.step = step;
  }

  @Override
  public Write<Object> produce(Output<?> output) {
    return WriteHttpStatus.write(output, this.code, this.phrase,
                                 this.index, this.step);
  }

  static Write<Object> write(Output<?> output, int code, String phrase,
                             int index, int step) {
    if (step == 1 && output.isCont()) {
      if (code / 1000 != 0) {
        return Write.error(new WriteException("invalid status code: " + code));
      }
      output.write(Base10.encodeDigit(code / 100 % 10));
      step = 2;
    }
    if (step == 2 && output.isCont()) {
      output.write(Base10.encodeDigit(code / 10 % 10));
      step = 3;
    }
    if (step == 3 && output.isCont()) {
      output.write(Base10.encodeDigit(code % 10));
      step = 4;
    }
    if (step == 4 && output.isCont()) {
      output.write(' ');
      step = 5;
    }
    if (step == 5) {
      while (index < phrase.length() && output.isCont()) {
        final int c = phrase.codePointAt(index);
        if (Http.isPhraseChar(c)) {
          output.write(c);
          index = phrase.offsetByCodePoints(index, 1);
        } else {
          return Write.error(new WriteException("invalid phrase: " + phrase));
        }
      }
      if (index >= phrase.length()) {
        return Write.done();
      }
    }
    if (output.isDone()) {
      return Write.error(new WriteException("truncated write"));
    } else if (output.isError()) {
      return Write.error(output.getError());
    }
    return new WriteHttpStatus(code, phrase, index, step);
  }

}
