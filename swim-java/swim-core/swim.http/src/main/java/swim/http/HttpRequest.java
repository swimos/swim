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

import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Binary;
import swim.codec.BinaryInputBuffer;
import swim.codec.Codec;
import swim.codec.CodecException;
import swim.codec.Decode;
import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.InputBuffer;
import swim.codec.Output;
import swim.codec.Parse;
import swim.codec.StringInput;
import swim.codec.StringOutput;
import swim.codec.Text;
import swim.codec.Write;
import swim.codec.WriteException;
import swim.collections.FingerTrieList;
import swim.http.header.ContentLengthHeader;
import swim.http.header.ContentTypeHeader;
import swim.http.header.TransferEncodingHeader;
import swim.util.Assume;
import swim.util.Murmur3;
import swim.util.Notation;

@Public
@Since("5.0")
public final class HttpRequest<T> extends HttpMessage<T> {

  final HttpMethod method;
  final String target;
  final HttpVersion version;
  final HttpHeaders headers;
  final HttpPayload<T> payload;

  HttpRequest(HttpMethod method, String target, HttpVersion version,
              HttpHeaders headers, HttpPayload<T> payload) {
    this.method = method;
    this.target = target;
    this.version = version;
    this.headers = headers;
    this.payload = payload;
  }

  public HttpMethod method() {
    return this.method;
  }

  public HttpRequest<T> withMethod(HttpMethod method) {
    return HttpRequest.of(method, this.target, this.version,
                              this.headers, this.payload);
  }

  public String target() {
    return this.target;
  }

  public HttpRequest<T> withUri(String target) {
    return HttpRequest.of(this.method, target, this.version,
                          this.headers, this.payload);
  }

  @Override
  public HttpVersion version() {
    return this.version;
  }

  public HttpRequest<T> withVersion(HttpVersion version) {
    return HttpRequest.of(this.method, this.target, version,
                          this.headers, this.payload);
  }

  @Override
  public HttpHeaders headers() {
    return this.headers;
  }

  @Override
  public HttpRequest<T> withHeaders(HttpHeaders headers) {
    return HttpRequest.of(this.method, this.target, this.version,
                          headers, this.payload);
  }

  @Override
  public HttpRequest<T> withHeaders(HttpHeader... headers) {
    return this.withHeaders(HttpHeaders.of(headers));
  }

  @Override
  public HttpPayload<T> payload() {
    return this.payload;
  }

  @Override
  public <T2> HttpRequest<T2> withPayload(HttpPayload<T2> payload) {
    return HttpRequest.of(this.method, this.target, this.version,
                          this.headers, payload);
  }

  public <T2> Decode<? extends HttpPayload<T2>> decodePayload(InputBuffer input, Codec<T2> codec) throws HttpException {
    final HttpHeaders headers = this.headers();
    ContentLengthHeader contentLength = null;
    TransferEncodingHeader transferEncoding = null;
    for (int i = 0, n = headers.size(); i < n; i += 1) {
      final HttpHeader header = headers.get(i);
      if (header instanceof ContentLengthHeader) {
        if (contentLength != null) {
          // RFC 7230 § 3.3.3 Item 4
          throw new HttpException(HttpStatus.BAD_REQUEST, "conflicting Content-Length");
        }
        contentLength = (ContentLengthHeader) header;
      } else if (header instanceof TransferEncodingHeader) {
        transferEncoding = (TransferEncodingHeader) header;
      }
    }

    if (transferEncoding != null) {
      // RFC 7230 § 3.3.3 Item 3
      final FingerTrieList<HttpTransferCoding> transferCodings = transferEncoding.codings();
      if (transferCodings.size() != 1 || !Assume.nonNull(transferCodings.head()).isChunked()) {
        throw new HttpException(HttpStatus.BAD_REQUEST, "unsupported Transfer-Encoding: " + transferEncoding.value());
      }
      return HttpChunked.decode(input, codec);
    }

    if (contentLength != null) {
      // RFC 7230 § 3.3.3 Item 5
      return HttpBody.decode(input, codec, contentLength.length());
    }

    // RFC 7230 § 3.3.3 Item 6
    return HttpEmpty.decode(input);
  }

  public <T2> Decode<? extends HttpPayload<T2>> decodePayload(InputBuffer input) throws HttpException {
    final HttpHeaders headers = this.headers();
    ContentTypeHeader contentType = null;
    ContentLengthHeader contentLength = null;
    TransferEncodingHeader transferEncoding = null;
    for (int i = 0, n = headers.size(); i < n; i += 1) {
      final HttpHeader header = headers.get(i);
      if (header instanceof ContentTypeHeader) {
        contentType = (ContentTypeHeader) header;
      } else if (header instanceof ContentLengthHeader) {
        if (contentLength != null) {
          // RFC 7230 § 3.3.3 Item 4
          throw new HttpException(HttpStatus.BAD_REQUEST, "conflicting Content-Length");
        }
        contentLength = (ContentLengthHeader) header;
      } else if (header instanceof TransferEncodingHeader) {
        transferEncoding = (TransferEncodingHeader) header;
      }
    }

    Codec<T2> codec;
    if (contentType != null) {
      try {
        codec = Codec.get(contentType.mediaType(), Object.class);
      } catch (CodecException cause) {
        codec = Assume.conforms(Binary.byteBufferCodec());
      }
    } else {
      codec = Assume.conforms(Binary.byteBufferCodec());
    }

    if (transferEncoding != null) {
      // RFC 7230 § 3.3.3 Item 3
      final FingerTrieList<HttpTransferCoding> transferCodings = transferEncoding.codings();
      if (transferCodings.size() != 1 || !Assume.nonNull(transferCodings.head()).isChunked()) {
        throw new HttpException(HttpStatus.BAD_REQUEST, "unsupported Transfer-Encoding: " + transferEncoding.value());
      }
      return HttpChunked.decode(input, codec);
    }

    if (contentLength != null) {
      // RFC 7230 § 3.3.3 Item 5
      return HttpBody.decode(input, codec, contentLength.length());
    }

    // RFC 7230 § 3.3.3 Item 6
    return HttpEmpty.decode(input);
  }

  public <T2> Decode<? extends HttpPayload<T2>> decodePayload(Codec<T2> codec) throws HttpException {
    return this.decodePayload(BinaryInputBuffer.empty(), codec);
  }

  public <T2> Decode<? extends HttpPayload<T2>> decodePayload() throws HttpException {
    return this.decodePayload(BinaryInputBuffer.empty());
  }

  @Override
  public Write<HttpRequest<T>> write(Output<?> output) {
    return WriteHttpRequest.write(output, this, null, 1);
  }

  @Override
  public Write<HttpRequest<T>> write() {
    return new WriteHttpRequest<T>(this, null, 1);
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof HttpRequest<?> that) {
      return this.method.equals(that.method)
          && this.target.equals(that.target)
          && this.version.equals(that.version)
          && this.headers.equals(that.headers)
          && this.payload.equals(that.payload);
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(HttpRequest.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(
        Murmur3.mix(HASH_SEED, this.method.hashCode()), this.target.hashCode()),
        this.version.hashCode()), this.headers.hashCode()), this.payload.hashCode()));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("HttpRequest", "of")
            .appendArgument(this.method)
            .appendArgument(this.target)
            .appendArgument(this.version);
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
    this.write(StringOutput.from(output)).assertDone();
  }

  @Override
  public String toString() {
    final StringOutput output = new StringOutput();
    this.write(output).assertDone();
    return output.get();
  }

  public static <T> HttpRequest<T> of(HttpMethod method, String target,
                                      HttpVersion version, HttpHeaders headers,
                                      HttpPayload<T> payload) {
    return new HttpRequest<T>(method, target, version, headers, payload);
  }

  public static <T> HttpRequest<T> of(HttpMethod method, String target,
                                      HttpVersion version, HttpHeaders headers) {
    return new HttpRequest<T>(method, target, version, headers, HttpEmpty.payload());
  }

  public static <T> HttpRequest<T> of(HttpMethod method, String target,
                                      HttpVersion version, HttpHeader... headers) {
    return new HttpRequest<T>(method, target, version,
                              HttpHeaders.of(headers), HttpEmpty.payload());
  }

  public static <T> HttpRequest<T> of(HttpMethod method, String target,
                                      HttpVersion version) {
    return new HttpRequest<T>(method, target, version,
                              HttpHeaders.empty(), HttpEmpty.payload());
  }

  public static <T> HttpRequest<T> of(HttpMethod method, String target,
                                      HttpHeaders headers, HttpPayload<T> payload) {
    return new HttpRequest<T>(method, target, HttpVersion.HTTP_1_1,
                              headers, payload);
  }

  public static <T> HttpRequest<T> of(HttpMethod method, String target,
                                      HttpHeaders headers) {
    return new HttpRequest<T>(method, target, HttpVersion.HTTP_1_1,
                              headers, HttpEmpty.payload());
  }

  public static <T> HttpRequest<T> of(HttpMethod method, String target,
                                      HttpHeader... headers) {
    return new HttpRequest<T>(method, target, HttpVersion.HTTP_1_1,
                              HttpHeaders.of(headers), HttpEmpty.payload());
  }

  public static <T> Parse<HttpRequest<T>> parse(Input input, @Nullable HttpHeaderRegistry headerRegistry) {
    return ParseHttpRequest.parse(input, headerRegistry, null, null, null, null, 1);
  }

  public static <T> Parse<HttpRequest<T>> parse(Input input) {
    return HttpRequest.parse(input, HttpHeader.registry());
  }

  public static <T> Parse<HttpRequest<T>> parse(@Nullable HttpHeaderRegistry headerRegistry) {
    return new ParseHttpRequest<T>(headerRegistry, null, null, null, null, 1);
  }

  public static <T> Parse<HttpRequest<T>> parse() {
    return HttpRequest.parse(HttpHeader.registry());
  }

  public static <T> Parse<HttpRequest<T>> parse(String string) {
    final StringInput input = new StringInput(string);
    return HttpRequest.<T>parse(input).complete(input);
  }

}

final class ParseHttpRequest<T> extends Parse<HttpRequest<T>> {

  final @Nullable HttpHeaderRegistry headerRegistry;
  final @Nullable Parse<HttpMethod> parseMethod;
  final @Nullable StringBuilder targetBuilder;
  final @Nullable Parse<HttpVersion> parseVersion;
  final @Nullable Parse<HttpHeaders> parseHeaders;
  final int step;

  ParseHttpRequest(@Nullable HttpHeaderRegistry headerRegistry,
                   @Nullable Parse<HttpMethod> parseMethod,
                   @Nullable StringBuilder targetBuilder,
                   @Nullable Parse<HttpVersion> parseVersion,
                   @Nullable Parse<HttpHeaders> parseHeaders, int step) {
    this.headerRegistry = headerRegistry;
    this.parseMethod = parseMethod;
    this.targetBuilder = targetBuilder;
    this.parseVersion = parseVersion;
    this.parseHeaders = parseHeaders;
    this.step = step;
  }

  @Override
  public Parse<HttpRequest<T>> consume(Input input) {
    return ParseHttpRequest.parse(input, this.headerRegistry, this.parseMethod,
                                  this.targetBuilder, this.parseVersion,
                                  this.parseHeaders, this.step);
  }

  static <T> Parse<HttpRequest<T>> parse(Input input,
                                         @Nullable HttpHeaderRegistry headerRegistry,
                                         @Nullable Parse<HttpMethod> parseMethod,
                                         @Nullable StringBuilder targetBuilder,
                                         @Nullable Parse<HttpVersion> parseVersion,
                                         @Nullable Parse<HttpHeaders> parseHeaders,
                                         int step) {
    int c = 0;
    if (step == 1) {
      if (parseMethod == null) {
        parseMethod = HttpMethod.parse(input);
      } else {
        parseMethod = parseMethod.consume(input);
      }
      if (parseMethod.isDone()) {
        step = 2;
      } else if (parseMethod.isError()) {
        return parseMethod.asError();
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
      if (targetBuilder == null) {
        targetBuilder = new StringBuilder();
      }
      while (input.isCont() && (c = input.head()) != ' ') {
        targetBuilder.appendCodePoint(c);
        input.step();
      }
      if (input.isReady()) {
        step = 4;
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
      if (parseVersion == null) {
        parseVersion = HttpVersion.parse(input);
      } else {
        parseVersion = parseVersion.consume(input);
      }
      if (parseVersion.isDone()) {
        step = 6;
      } else if (parseVersion.isError()) {
        return parseVersion.asError();
      }
    }
    if (step == 6) {
      if (input.isCont() && input.head() == '\r') {
        input.step();
        step = 7;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected("carriage return", input));
      }
    }
    if (step == 7) {
      if (input.isCont() && input.head() == '\n') {
        input.step();
        step = 8;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected("line feed", input));
      }
    }
    if (step == 8) {
      if (parseHeaders == null) {
        parseHeaders = HttpHeaders.parse(input, headerRegistry);
      } else {
        parseHeaders = parseHeaders.consume(input);
      }
      if (parseHeaders.isDone()) {
        step = 9;
      } else if (parseHeaders.isError()) {
        return parseHeaders.asError();
      }
    }
    if (step == 9) {
      if (input.isCont() && input.head() == '\r') {
        input.step();
        step = 10;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected("carriage return", input));
      }
    }
    if (step == 10) {
      if (input.isCont() && input.head() == '\n') {
        input.step();
        return Parse.done(HttpRequest.of(Assume.nonNull(parseMethod).getNonNullUnchecked(),
                                         Assume.nonNull(targetBuilder).toString(),
                                         Assume.nonNull(parseVersion).getNonNullUnchecked(),
                                         Assume.nonNull(parseHeaders).getNonNullUnchecked(),
                                         HttpEmpty.payload()));
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected("line feed", input));
      }
    }
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseHttpRequest<T>(headerRegistry, parseMethod, targetBuilder,
                                   parseVersion, parseHeaders, step);
  }

}

final class WriteHttpRequest<T> extends Write<HttpRequest<T>> {

  final HttpRequest<T> request;
  final @Nullable Write<?> write;
  final int step;

  WriteHttpRequest(HttpRequest<T> request, @Nullable Write<?> write, int step) {
    this.request = request;
    this.write = write;
    this.step = step;
  }

  @Override
  public Write<HttpRequest<T>> produce(Output<?> output) {
    return WriteHttpRequest.write(output, this.request, this.write, this.step);
  }

  static <T> Write<HttpRequest<T>> write(Output<?> output, HttpRequest<T> request,
                                         @Nullable Write<?> write, int step) {
    if (step == 1) {
      if (write == null) {
        write = request.method().write(output);
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
        write = Text.write(output, request.target());
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
      output.write(' ');
      step = 5;
    }
    if (step == 5) {
      if (write == null) {
        write = request.version().write(output);
      } else {
        write = write.produce(output);
      }
      if (write.isDone()) {
        write = null;
        step = 6;
      } else if (write.isError()) {
        return write.asError();
      }
    }
    if (step == 6 && output.isCont()) {
      output.write('\r');
      step = 7;
    }
    if (step == 7 && output.isCont()) {
      output.write('\n');
      step = 8;
    }
    if (step == 8) {
      if (write == null) {
        write = request.headers().write(output);
      } else {
        write = write.produce(output);
      }
      if (write.isDone()) {
        write = null;
        step = 9;
      } else if (write.isError()) {
        return write.asError();
      }
    }
    if (step == 9 && output.isCont()) {
      output.write('\r');
      step = 10;
    }
    if (step == 10 && output.isCont()) {
      output.write('\n');
      return Write.done(request);
    }
    if (output.isDone()) {
      return Write.error(new WriteException("truncated write"));
    } else if (output.isError()) {
      return Write.error(output.getError());
    }
    return new WriteHttpRequest<T>(request, write, step);
  }

}
