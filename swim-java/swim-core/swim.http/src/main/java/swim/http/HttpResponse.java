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

package swim.http;

import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Output;
import swim.codec.Parse;
import swim.codec.StringInput;
import swim.codec.StringOutput;
import swim.codec.Write;
import swim.codec.WriteException;
import swim.util.Assume;
import swim.util.Murmur3;
import swim.util.Notation;

@Public
@Since("5.0")
public final class HttpResponse<T> extends HttpMessage<T> {

  final HttpVersion version;
  final HttpStatus status;
  final HttpHeaders headers;
  final HttpPayload<T> payload;

  HttpResponse(HttpVersion version, HttpStatus status,
               HttpHeaders headers, HttpPayload<T> payload) {
    this.version = version;
    this.status = status;
    this.headers = headers;
    this.payload = payload;
  }

  @Override
  public HttpVersion version() {
    return this.version;
  }

  public HttpResponse<T> withVersion(HttpVersion version) {
    return HttpResponse.of(version, this.status, this.headers, this.payload);
  }

  public HttpStatus status() {
    return this.status;
  }

  public HttpResponse<T> withStatus(HttpStatus status) {
    return HttpResponse.of(this.version, status, this.headers, this.payload);
  }

  @Override
  public HttpHeaders headers() {
    return this.headers;
  }

  @Override
  public @Nullable HttpHeader getHeader(String name) {
    return this.headers.getHeader(name);
  }

  @Override
  public HttpResponse<T> withHeaders(HttpHeaders headers) {
    return HttpResponse.of(this.version, this.status, headers, this.payload);
  }

  @Override
  public HttpResponse<T> withHeaders(HttpHeader... headers) {
    return this.withHeaders(HttpHeaders.of(headers));
  }

  @Override
  public HttpPayload<T> payload() {
    return this.payload;
  }

  @Override
  public <T2> HttpResponse<T2> withPayload(HttpPayload<T2> payload) {
    return HttpResponse.of(this.version, this.status, this.headers, payload);
  }

  @Override
  public Write<HttpResponse<T>> write(Output<?> output) {
    return WriteHttpResponse.write(output, this, null, 1);
  }

  @Override
  public Write<HttpResponse<T>> write() {
    return new WriteHttpResponse<T>(this, null, 1);
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof HttpResponse<?>) {
      final HttpResponse<?> that = (HttpResponse<?>) other;
      return this.version.equals(that.version)
          && this.status.equals(that.status)
          && this.headers.equals(that.headers)
          && this.payload.equals(that.payload);
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(HttpResponse.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(
        HASH_SEED, this.version.hashCode()), this.status.hashCode()),
        this.headers.hashCode()), this.payload.hashCode()));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("HttpResponse", "of")
            .appendArgument(this.version)
            .appendArgument(this.status);
    for (HttpHeader header : this.headers) {
      notation.appendArgument(header);
    }
    notation.endInvoke();
    if (!(this.payload instanceof HttpEmpty<?>)) {
      notation.beginInvoke("withPayload")
              .appendArgument(this.payload)
              .endInvoke();
    }
  }

  @Override
  public void writeString(Appendable output) {
    this.write(StringOutput.from(output)).checkDone();
  }

  @Override
  public String toString() {
    final StringOutput output = new StringOutput();
    this.write(output).checkDone();
    return output.get();
  }

  public static <T> HttpResponse<T> of(HttpVersion version, HttpStatus status,
                                       HttpHeaders headers, HttpPayload<T> payload) {
    return new HttpResponse<T>(version, status, headers, payload);
  }

  public static <T> HttpResponse<T> of(HttpVersion version, HttpStatus status,
                                       HttpHeaders headers) {
    return new HttpResponse<T>(version, status, headers, HttpEmpty.payload());
  }

  public static <T> HttpResponse<T> of(HttpVersion version, HttpStatus status,
                                       HttpHeader... headers) {
    return new HttpResponse<T>(version, status, HttpHeaders.of(headers), HttpEmpty.payload());
  }

  public static <T> HttpResponse<T> of(HttpVersion version, HttpStatus status) {
    return new HttpResponse<T>(version, status, HttpHeaders.empty(), HttpEmpty.payload());
  }

  public static <T> HttpResponse<T> of(HttpStatus status, HttpHeaders headers,
                                       HttpPayload<T> payload) {
    return new HttpResponse<T>(HttpVersion.HTTP_1_1, status, headers, payload);
  }

  public static <T> HttpResponse<T> of(HttpStatus status, HttpHeaders headers) {
    return new HttpResponse<T>(HttpVersion.HTTP_1_1, status, headers, HttpEmpty.payload());
  }

  public static <T> HttpResponse<T> of(HttpStatus status, HttpHeader... headers) {
    return new HttpResponse<T>(HttpVersion.HTTP_1_1, status,
                               HttpHeaders.of(headers), HttpEmpty.payload());
  }

  public static <T> HttpResponse<T> of(HttpStatus status) {
    return new HttpResponse<T>(HttpVersion.HTTP_1_1, status,
                               HttpHeaders.empty(), HttpEmpty.payload());
  }

  public static <T> Parse<HttpResponse<T>> parse(Input input, @Nullable HttpHeaderRegistry headerRegistry) {
    return ParseHttpResponse.parse(input, headerRegistry, null, null, null, 1);
  }

  public static <T> Parse<HttpResponse<T>> parse(Input input) {
    return HttpResponse.parse(input, HttpHeader.registry());
  }

  public static <T> Parse<HttpResponse<T>> parse(@Nullable HttpHeaderRegistry headerRegistry) {
    return new ParseHttpResponse<T>(headerRegistry, null, null, null, 1);
  }

  public static <T> Parse<HttpResponse<T>> parse() {
    return HttpResponse.parse(HttpHeader.registry());
  }

  public static <T> HttpResponse<T> parse(String string) {
    final Input input = new StringInput(string);
    Parse<HttpResponse<T>> parse = HttpResponse.parse(input);
    if (input.isCont() && !parse.isError()) {
      parse = Parse.error(Diagnostic.unexpected(input));
    } else if (input.isError()) {
      parse = Parse.error(input.getError());
    }
    return parse.getNonNull();
  }

}

final class ParseHttpResponse<T> extends Parse<HttpResponse<T>> {

  final @Nullable HttpHeaderRegistry headerRegistry;
  final @Nullable Parse<HttpVersion> parseVersion;
  final @Nullable Parse<HttpStatus> parseStatus;
  final @Nullable Parse<HttpHeaders> parseHeaders;
  final int step;

  ParseHttpResponse(@Nullable HttpHeaderRegistry headerRegistry,
                    @Nullable Parse<HttpVersion> parseVersion,
                    @Nullable Parse<HttpStatus> parseStatus,
                    @Nullable Parse<HttpHeaders> parseHeaders, int step) {
    this.headerRegistry = headerRegistry;
    this.parseVersion = parseVersion;
    this.parseStatus = parseStatus;
    this.parseHeaders = parseHeaders;
    this.step = step;
  }

  @Override
  public Parse<HttpResponse<T>> consume(Input input) {
    return ParseHttpResponse.parse(input, this.headerRegistry, this.parseVersion,
                                   this.parseStatus, this.parseHeaders, this.step);
  }

  static <T> Parse<HttpResponse<T>> parse(Input input,
                                          @Nullable HttpHeaderRegistry headerRegistry,
                                          @Nullable Parse<HttpVersion> parseVersion,
                                          @Nullable Parse<HttpStatus> parseStatus,
                                          @Nullable Parse<HttpHeaders> parseHeaders,
                                          int step) {
    if (step == 1) {
      if (parseVersion == null) {
        parseVersion = HttpVersion.parse(input);
      } else {
        parseVersion = parseVersion.consume(input);
      }
      if (parseVersion.isDone()) {
        step = 2;
      } else if (parseVersion.isError()) {
        return parseVersion.asError();
      }
    }
    if (step == 2) {
      if (input.isCont() && input.head() == ' ') {
        input.step();
        step = 3;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected("space", input));
      }
    }
    if (step == 3) {
      if (parseStatus == null) {
        parseStatus = HttpStatus.parse(input);
      } else {
        parseStatus = parseStatus.consume(input);
      }
      if (parseStatus.isDone()) {
        step = 4;
      } else if (parseStatus.isError()) {
        return parseStatus.asError();
      }
    }
    if (step == 4) {
      if (input.isCont() && input.head() == '\r') {
        input.step();
        step = 5;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected("carriage return", input));
      }
    }
    if (step == 5) {
      if (input.isCont() && input.head() == '\n') {
        input.step();
        step = 6;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected("line feed", input));
      }
    }
    if (step == 6) {
      if (parseHeaders == null) {
        parseHeaders = HttpHeaders.parse(input, headerRegistry);
      } else {
        parseHeaders = parseHeaders.consume(input);
      }
      if (parseHeaders.isDone()) {
        step = 7;
      } else if (parseHeaders.isError()) {
        return parseHeaders.asError();
      }
    }
    if (step == 7) {
      if (input.isCont() && input.head() == '\r') {
        input.step();
        step = 8;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected("carriage return", input));
      }
    }
    if (step == 8) {
      parseVersion = Assume.nonNull(parseVersion);
      parseStatus = Assume.nonNull(parseStatus);
      parseHeaders = Assume.nonNull(parseHeaders);
      if (input.isCont() && input.head() == '\n') {
        input.step();
        return Parse.done(HttpResponse.of(parseVersion.getNonNull(),
                                          parseStatus.getNonNull(),
                                          parseHeaders.getNonNull(),
                                          HttpEmpty.payload()));
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected("line feed", input));
      }
    }
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseHttpResponse<T>(headerRegistry, parseVersion, parseStatus,
                                    parseHeaders, step);
  }

}

final class WriteHttpResponse<T> extends Write<HttpResponse<T>> {

  final HttpResponse<T> response;
  final @Nullable Write<?> write;
  final int step;

  WriteHttpResponse(HttpResponse<T> response, @Nullable Write<?> write, int step) {
    this.response = response;
    this.write = write;
    this.step = step;
  }

  @Override
  public Write<HttpResponse<T>> produce(Output<?> output) {
    return WriteHttpResponse.write(output, this.response, this.write, this.step);
  }

  static <T> Write<HttpResponse<T>> write(Output<?> output, HttpResponse<T> response,
                                          @Nullable Write<?> write, int step) {
    if (step == 1) {
      if (write == null) {
        write = response.version().write(output);
      } else {
        write = write.produce(output);
      }
      if (write.isDone()) {
        write = null;
        step = 2;
      } else if (write.isError()) {
        return write.asError();
      }
    }
    if (step == 2 && output.isCont()) {
      output.write(' ');
      step = 3;
    }
    if (step == 3) {
      if (write == null) {
        write = response.status().write(output);
      } else {
        write = write.produce(output);
      }
      if (write.isDone()) {
        write = null;
        step = 4;
      } else if (write.isError()) {
        return write.asError();
      }
    }
    if (step == 4 && output.isCont()) {
      output.write('\r');
      step = 5;
    }
    if (step == 5 && output.isCont()) {
      output.write('\n');
      step = 6;
    }
    if (step == 6) {
      if (write == null) {
        write = response.headers().write(output);
      } else {
        write = write.produce(output);
      }
      if (write.isDone()) {
        write = null;
        step = 7;
      } else if (write.isError()) {
        return write.asError();
      }
    }
    if (step == 7 && output.isCont()) {
      output.write('\r');
      step = 8;
    }
    if (step == 8 && output.isCont()) {
      output.write('\n');
      return Write.done(response);
    }
    if (output.isDone()) {
      return Write.error(new WriteException("Truncated write"));
    } else if (output.isError()) {
      return Write.error(output.getError());
    }
    return new WriteHttpResponse<T>(response, write, step);
  }

}
